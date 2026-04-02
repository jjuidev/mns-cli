/**
 * Analyze command - Main command for processing video meetings
 */

import * as path from 'path'

import { defineCommand } from 'citty'
import { consola } from 'consola'

import { GeminiProvider } from '@/providers/gemini-provider'
import { chunkAudio } from '@/services/audio-chunker'
import { cleanupTempFiles } from '@/services/cleanup'
import { validateVideoFile, extractAudio, getVideoMetadata } from '@/services/video-processor'
import { displayBanner } from '@/utils/banner'
import { loadConfig, ensureOutputDir, ensureTempDir, cleanOutputDir } from '@/utils/config'
import { translateSegmentsFree } from '@/utils/free-translator'
import { saveMeetingNotes } from '@/utils/output'
import { buildTranscriptOnlyNotes } from '@/utils/transcript-only-notes-builder'

export const analyzeCommand = defineCommand({
	meta: {
		name: 'analyze',
		description: 'Analyze video meeting and generate meeting notes'
	},
	args: {
		video: {
			type: 'positional',
			description: 'Path to video file',
			required: true
		},
		lang: {
			type: 'string',
			description: 'Source language (auto-detect if not provided)',
			alias: 'l',
			default: 'English'
		},
		target: {
			type: 'string',
			description: 'Target language for translation',
			alias: 't',
			default: 'Vietnamese'
		},
		context: {
			type: 'string',
			description: 'Context about the meeting (e.g., "POC demo - Topic XYZ")',
			alias: 'c'
		},
		output: {
			type: 'string',
			description: 'Output directory for meeting notes',
			alias: 'o',
			default: './output'
		},
		keep: {
			type: 'boolean',
			description: 'Keep source files after processing',
			alias: 'k',
			default: true
		},
		parallel: {
			type: 'boolean',
			description: 'Enable parallel processing',
			alias: 'p',
			default: true
		},
		model: {
			type: 'string',
			description: 'AI model to use (overrides config/env)',
			alias: 'm'
		},
		verbose: {
			type: 'boolean',
			description: 'Enable verbose logging',
			alias: 'v',
			default: false
		},
		clean: {
			type: 'boolean',
			description: 'Clean output directory before saving results (keeps .gitkeep)',
			default: false
		}
	},
	run: async (ctx) => {
		const args = ctx.args as {
			video: string
			lang?: string
			target?: string
			context?: string
			output?: string
			keep?: boolean
			parallel?: boolean
			model?: string
			verbose?: boolean
			clean?: boolean
		}

		// Display banner
		displayBanner()

		const logger = consola.withTag('analyze')
		const startTime = Date.now()

		try {
			// Load configuration
			logger.info('Loading configuration...')

			const config = loadConfig({
				outputDir: args.output,
				parallel: args.parallel,
				model: args.model
			})

			// Validate video file
			logger.info(`Validating video: ${args.video}`)
			validateVideoFile(args.video)

			// Get video metadata
			const metadata = await getVideoMetadata(args.video)

			logger.info(`Duration: ${formatDuration(metadata.duration)}, Size: ${formatBytes(metadata.size)}`)

			// Create directories
			ensureOutputDir(config.outputDir)
			const tempDir = ensureTempDir(path.dirname(args.video))

			// Extract audio
			logger.start('Extracting audio from video...')
			const audioPath = path.join(tempDir, 'audio.wav')

			await extractAudio(args.video, audioPath, {
				verbose: args.verbose
			})

			// Chunk audio
			logger.start('Splitting audio into chunks...')

			const chunks = await chunkAudio(audioPath, tempDir, {
				chunkDuration: config.maxChunkDuration,
				verbose: args.verbose
			})

			// Initialise Gemini provider — requires GEMINI_API_KEY or GOOGLE_API_KEY
			const provider = new GeminiProvider(config)

			if (!(await provider.isAvailable())) {
				logger.error('No Gemini API key found. Set GEMINI_API_KEY or GOOGLE_API_KEY.')
				process.exit(1)
			}

			// Transcribe
			logger.start('Transcribing audio...')

			const transcript = await provider.transcribe({
				audioPath,
				chunks,
				sourceLanguage: args.lang,
				targetLanguage: args.target,
				enableParallel: config.enableParallel,
				verbose: args.verbose
			})

			logger.success(`Transcription complete (${transcript.segments.length} segments)`)

			// Tag transcript with original user-provided video path (used for Source field in output)
			transcript.originalSourceFile = args.video

			// Generate meeting notes (or transcript-only if provider doesn't support summarize)
			logger.start('Generating meeting notes...')

			let meetingNotes

			if (provider.supportsSummarize) {
				meetingNotes = await provider.summarize!({
					transcript,
					context: args.context,
					targetLanguage: args.target,
					verbose: args.verbose
				})
			} else {
				logger.warn('Summarize not available for this provider')

				// Translate transcript via free MyMemory API when target lang is set
				let translatedSegments

				const needsTranslation =
					args.target && args.target.toLowerCase() !== (args.lang || '').toLowerCase() && transcript.segments.length > 0

				if (needsTranslation) {
					logger.start(`Translating transcript to ${args.target} (MyMemory)...`)
					translatedSegments = await translateSegmentsFree(transcript.segments, args.lang, args.target!, args.verbose)
				}

				meetingNotes = buildTranscriptOnlyNotes(transcript, args.target, translatedSegments)
			}

			// Save meeting notes
			logger.start('Saving meeting notes...')

			// Pre-clean output directory if --clean flag is set
			if (args.clean) {
				logger.start('Cleaning output directory...')
				cleanOutputDir(config.outputDir)
			}

			const outputPath = await saveMeetingNotes(meetingNotes, config.outputDir, {
				verbose: args.verbose
			})

			// Cleanup
			logger.start('Cleaning up temporary files...')
			await cleanupTempFiles({
				tempDir,
				videoPath: args.keep ? undefined : args.video,
				audioPath,
				chunks: chunks.map((c) => c.path),
				keepSource: args.keep,
				verbose: args.verbose
			})

			// Done!
			const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)

			logger.success(`✨ Done! Meeting notes saved to: ${outputPath}`)
			logger.box(
				`Processing Time: ${totalTime}s\nChunks Processed: ${transcript.metadata.chunksProcessed}\nSegments: ${transcript.segments.length}`
			)
		} catch (error) {
			// Provide actionable message for network failures ("TypeError: fetch failed")
			if (error instanceof TypeError && error.message === 'fetch failed') {
				const cause = (error as NodeJS.ErrnoException & { cause?: Error }).cause
				const causeDetail = cause instanceof Error ? ` (${cause.message})` : ''

				logger.error(`Network error: failed to reach Gemini API${causeDetail}`)
				logger.info('Check: internet connection, GEMINI_API_KEY env var, or firewall/proxy settings')
			} else {
				logger.error(`Failed to analyze video: ${error}`)
			}

			if (args.verbose && error instanceof Error) {
				logger.error(error.stack)
			}

			process.exit(1)
		}
	}
})

/**
 * Format duration in seconds to readable string
 */
const formatDuration = (seconds: number): string => {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)

	if (h > 0) {
		return `${h}h ${m}m ${s}s`
	} else if (m > 0) {
		return `${m}m ${s}s`
	}

	return `${s}s`
}

/**
 * Format bytes to readable string
 */
const formatBytes = (bytes: number): string => {
	const gb = bytes / (1024 * 1024 * 1024)
	const mb = bytes / (1024 * 1024)

	if (gb >= 1) {
		return `${gb.toFixed(2)} GB`
	} else if (mb >= 1) {
		return `${mb.toFixed(2)} MB`
	}

	return `${(bytes / 1024).toFixed(2)} KB`
}
