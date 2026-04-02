/**
 * Audio chunker - Split audio into 15-minute chunks for Gemini API
 */

import * as path from 'path'

import { consola } from 'consola'
import ffmpeg from 'fluent-ffmpeg'

import { AudioChunk } from '@/types'

const logger = consola.withTag('audio-chunker')

/**
 * Split audio into chunks of specified duration
 */
export const chunkAudio = async (
	audioPath: string,
	outputDir: string,
	options?: {
		chunkDuration?: number // seconds (default: 900 = 15 min)
		verbose?: boolean
	}
): Promise<AudioChunk[]> => {
	const chunkDuration = options?.chunkDuration || 900 // 15 minutes
	const chunks: AudioChunk[] = []

	// Get audio duration
	const duration = await getAudioDuration(audioPath)

	if (options?.verbose) {
		logger.info(`Audio duration: ${formatTime(duration)}`)
		logger.info(`Chunk duration: ${formatTime(chunkDuration)}`)
	}

	// Calculate number of chunks needed
	const numChunks = Math.ceil(duration / chunkDuration)

	if (numChunks === 1) {
		// No chunking needed
		if (options?.verbose) {
			logger.info('Audio is short enough, no chunking needed')
		}

		chunks.push({
			path: audioPath,
			index: 0,
			startTime: 0,
			duration
		})
		return chunks
	}

	if (options?.verbose) {
		logger.info(`Splitting into ${numChunks} chunks...`)
	}

	// Split audio into chunks
	for (let i = 0; i < numChunks; i++) {
		const startTime = i * chunkDuration
		const endTime = Math.min((i + 1) * chunkDuration, duration)
		const actualDuration = endTime - startTime

		const chunkPath = path.join(outputDir, `chunk_${i.toString().padStart(3, '0')}.wav`)

		await extractChunk(audioPath, chunkPath, startTime, actualDuration)

		chunks.push({
			path: chunkPath,
			index: i,
			startTime,
			duration: actualDuration
		})

		if (options?.verbose) {
			logger.success(`Chunk ${i + 1}/${numChunks}: ${formatTime(startTime)} - ${formatTime(endTime)}`)
		}
	}

	logger.success(`Split into ${chunks.length} chunks`)
	return chunks
}

/**
 * Extract a single chunk from audio
 */
const extractChunk = async (
	audioPath: string,
	outputPath: string,
	startTime: number,
	duration: number
): Promise<void> =>
	new Promise((resolve, reject) => {
		ffmpeg(audioPath)
			.seekInput(startTime)
			.duration(duration)
			.output(outputPath)
			.audioCodec('pcm_s16le')
			.audioChannels(1)
			.audioFrequency(16000)
			.on('end', () => resolve())
			.on('error', (err) => {
				logger.error(`Failed to extract chunk: ${err.message}`)
				reject(err)
			})
			.run()
	})

/**
 * Get audio duration in seconds
 */
const getAudioDuration = async (audioPath: string): Promise<number> =>
	new Promise((resolve, reject) => {
		ffmpeg.ffprobe(audioPath, (err, metadata) => {
			if (err) {
				reject(err)
				return
			}

			resolve(metadata.format.duration || 0)
		})
	})

/**
 * Format seconds to HH:MM:SS
 */
const formatTime = (seconds: number): string => {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)

	return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
