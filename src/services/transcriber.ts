/**
 * Transcriber - Transcribe audio using Gemini API
 */

import * as fs from 'fs'

import { GoogleGenAI } from '@google/genai'
import { consola } from 'consola'

import { Transcript, TranscriptSegment, AudioChunk } from '@/types'
import { DEFAULT_GEMINI_MODEL } from '@/utils/constants'

const logger = consola.withTag('transcriber')

/**
 * Transcribe audio file(s) using Gemini
 */
export const transcribeAudio = async (options: {
	apiKey: string
	audioPath: string
	chunks?: AudioChunk[]
	sourceLanguage?: string
	targetLanguage?: string
	enableParallel?: boolean
	verbose?: boolean
	model?: string
	/** Called after each chunk completes — useful for progress reporting */
	onChunkProgress?: (completedChunk: number, totalChunks: number) => void
}): Promise<Transcript> => {
	const startTime = Date.now()
	const genAI = new GoogleGenAI({ apiKey: options.apiKey })
	const model = options.model || DEFAULT_GEMINI_MODEL

	let fullText = ''
	const segments: TranscriptSegment[] = []

	if (options.chunks && options.chunks.length > 0) {
		if (options.enableParallel && options.chunks.length > 1) {
			logger.info(`Transcribing ${options.chunks.length} chunks in parallel...`)

			const results = await transcribeChunksParallel(
				genAI,
				options.chunks,
				options.sourceLanguage,
				options.verbose,
				model,
				options.onChunkProgress
			)

			results.forEach((result) => {
				fullText += result.text + '\n'
				segments.push(...result.segments)
			})
		} else {
			logger.info(`Transcribing ${options.chunks.length} chunks sequentially...`)

			for (let i = 0; i < options.chunks.length; i++) {
				const chunk = options.chunks[i]
				const result = await transcribeChunk(genAI, chunk, options.sourceLanguage, options.verbose, model)

				fullText += result.text + '\n'
				segments.push(...result.segments)
				options.onChunkProgress?.(i + 1, options.chunks.length)
			}
		}
	} else {
		// Single audio file
		logger.info('Transcribing audio...')

		const result = await transcribeSingleFile(genAI, options.audioPath, options.sourceLanguage, options.verbose, model)

		fullText = result.text
		segments.push(...result.segments)
	}

	const processingTime = Date.now() - startTime

	return {
		sourceFile: options.audioPath,
		sourceLanguage: options.sourceLanguage,
		targetLanguage: options.targetLanguage,
		fullText,
		segments,
		metadata: {
			duration: calculateTotalDuration(options.chunks),
			chunksProcessed: options.chunks?.length || 1,
			processingTime
		}
	}
}

/**
 * Transcribe chunks in parallel
 */
const transcribeChunksParallel = async (
	genAI: GoogleGenAI,
	chunks: AudioChunk[],
	sourceLanguage?: string,
	verbose?: boolean,
	model?: string,
	onChunkProgress?: (completedChunk: number, totalChunks: number) => void
): Promise<Array<{ text: string; segments: TranscriptSegment[] }>> => {
	let completed = 0
	const total = chunks.length

	const promises = chunks.map((chunk) =>
		transcribeChunk(genAI, chunk, sourceLanguage, verbose, model).then((result) => {
			completed++
			onChunkProgress?.(completed, total)
			return result
		})
	)

	return Promise.all(promises)
}

/**
 * Transcribe a single chunk
 */
const transcribeChunk = async (
	genAI: GoogleGenAI,
	chunk: AudioChunk,
	sourceLanguage?: string,
	verbose?: boolean,
	model: string = DEFAULT_GEMINI_MODEL
): Promise<{ text: string; segments: TranscriptSegment[] }> => {
	if (verbose) {
		logger.info(`Transcribing chunk ${chunk.index + 1}...`)
	}

	const audioData = fs.readFileSync(chunk.path)
	const base64Audio = audioData.toString('base64')
	const prompt = buildTranscriptionPrompt(sourceLanguage, chunk.startTime)

	try {
		const response = await genAI.models.generateContent({
			model,
			contents: [
				{
					role: 'user',
					parts: [
						{ text: prompt },
						{
							inlineData: {
								mimeType: 'audio/wav',
								data: base64Audio
							}
						}
					]
				}
			]
		})

		const text = response.text || ''
		const segments = parseTranscriptSegments(text, chunk.startTime)

		if (verbose) {
			logger.success(`Chunk ${chunk.index + 1} transcribed`)
		}

		return {
			text,
			segments
		}
	} catch (error) {
		// Expose underlying cause for network errors (e.g. ECONNREFUSED, ENOTFOUND)
		const cause = error instanceof Error && (error as NodeJS.ErrnoException & { cause?: Error }).cause
		const detail = cause instanceof Error ? ` (cause: ${cause.message})` : ''

		logger.error(`Failed to transcribe chunk ${chunk.index + 1}: ${error}${detail}`)
		throw error
	}
}

/**
 * Transcribe a single audio file
 */
const transcribeSingleFile = async (
	genAI: GoogleGenAI,
	audioPath: string,
	sourceLanguage?: string,
	verbose?: boolean,
	model: string = DEFAULT_GEMINI_MODEL
): Promise<{ text: string; segments: TranscriptSegment[] }> => {
	const audioData = fs.readFileSync(audioPath)
	const base64Audio = audioData.toString('base64')
	const prompt = buildTranscriptionPrompt(sourceLanguage, 0)

	const response = await genAI.models.generateContent({
		model,
		contents: [
			{
				role: 'user',
				parts: [
					{ text: prompt },
					{
						inlineData: {
							mimeType: 'audio/wav',
							data: base64Audio
						}
					}
				]
			}
		]
	})

	const text = response.text || ''
	const segments = parseTranscriptSegments(text, 0)

	return {
		text,
		segments
	}
}

/**
 * Build transcription prompt for Gemini (source language only)
 */
const buildTranscriptionPrompt = (sourceLanguage?: string, startTime?: number): string => {
	let prompt = 'Transcribe this audio'

	if (sourceLanguage) {
		prompt += ` (source language: ${sourceLanguage})`
	}

	prompt += '. '
	prompt += 'Format with timestamps as [HH:MM:SS -> HH:MM:SS] for each segment. '
	prompt += 'Include speaker labels if multiple speakers detected (e.g., [Speaker 1], [Speaker 2]). '

	if (startTime && startTime > 0) {
		prompt += `Note: This audio starts at ${formatTimestamp(startTime)} of the original recording. Adjust timestamps accordingly. `
	}

	prompt += 'Provide accurate, complete transcription.'

	return prompt
}

/**
 * Parse transcript segments from Gemini response.
 * Handles multiple timestamp formats including millisecond precision and spaces inside brackets.
 */
const parseTranscriptSegments = (text: string, baseOffset: number): TranscriptSegment[] => {
	const segments: TranscriptSegment[] = []
	const lines = text.split('\n')

	// Match: [HH:MM:SS] or [ MM:SS:mmm ] with optional end time
	// Handles spaces, 2-3 digit segments, various separators (-> - –)
	const timestampRegex =
		/\[\s*(\d{1,2}:\d{2}:\d{2,3}(?:[.,]\d+)?)\s*(?:->|–|-)\s*(\d{1,2}:\d{2}:\d{2,3}(?:[.,]\d+)?)\s*\]\s*(.*)/

	const singleTimestampRegex = /\[\s*(\d{1,2}:\d{2}:\d{2,3}(?:[.,]\d+)?)\s*\]\s*(.*)/

	for (const line of lines) {
		const trimmed = line.trim()

		if (!trimmed) {
			continue
		}

		let startSec = baseOffset
		let endSec = baseOffset
		let content = ''

		const rangeMatch = trimmed.match(timestampRegex)

		if (rangeMatch) {
			startSec = baseOffset + parseTimestampMs(rangeMatch[1])
			endSec = baseOffset + parseTimestampMs(rangeMatch[2])
			content = rangeMatch[3].trim()
		} else {
			const singleMatch = trimmed.match(singleTimestampRegex)

			if (singleMatch) {
				startSec = baseOffset + parseTimestampMs(singleMatch[1])
				endSec = startSec
				content = singleMatch[2].trim()
			} else {
				continue
			}
		}

		if (!content) {
			continue
		}

		// Extract speaker: [Speaker 1] or **Speaker 1**:
		const speakerBracket = content.match(/^\[Speaker (\d+)\]\s*/)
		const speakerBold = content.match(/^\*\*Speaker (\d+)\*\*:\s*/)
		let speaker: string | undefined
		let speechText = content

		if (speakerBracket) {
			speaker = `Speaker ${speakerBracket[1]}`
			speechText = content.replace(speakerBracket[0], '')
		} else if (speakerBold) {
			speaker = `Speaker ${speakerBold[1]}`
			speechText = content.replace(speakerBold[0], '')
		}

		if (speechText) {
			segments.push({
				timestamp: `[${formatTimestamp(startSec)} -> ${formatTimestamp(endSec)}]`,
				speaker,
				text: speechText
			})
		}
	}

	// Fallback: no timestamped segments found — treat full text as one segment
	if (segments.length === 0 && text.trim()) {
		segments.push({
			timestamp: `[${formatTimestamp(baseOffset)} -> ${formatTimestamp(baseOffset)}]`,
			text: text.trim()
		})
	}

	return segments
}

/**
 * Parse timestamp string to seconds.
 * Handles HH:MM:SS, HH:MM:SS.mmm, and Gemini's MM:SS:mmm (3-digit ms as last segment).
 */
const parseTimestampMs = (timestamp: string): number => {
	// Strip trailing dot/comma milliseconds if present (e.g. "00:01:03.250")
	const cleaned = timestamp.replace(/[.,]\d+$/, '')
	const parts = cleaned.split(':').map(Number)

	if (parts.length === 3) {
		// Could be HH:MM:SS or MM:SS:mmm
		// Detect MM:SS:mmm: last segment > 59 means it's milliseconds
		if (parts[2] > 59) {
			// MM:SS:mmm → convert to seconds
			return parts[0] * 60 + parts[1] + parts[2] / 1000
		}

		// Standard HH:MM:SS
		return parts[0] * 3600 + parts[1] * 60 + parts[2]
	}

	if (parts.length === 2) {
		return parts[0] * 60 + parts[1]
	}

	return parts[0]
}

/**
 * Format seconds to timestamp string
 */
const formatTimestamp = (seconds: number): string => {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)

	return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/**
 * Calculate total duration from chunks
 */
const calculateTotalDuration = (chunks?: AudioChunk[]): number => {
	if (!chunks || chunks.length === 0) {
		return 0
	}

	return chunks.reduce((sum, chunk) => sum + chunk.duration, 0)
}
