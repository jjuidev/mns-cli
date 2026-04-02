/**
 * Public programmatic API for mns-cli.
 * @example
 * ```ts
 * for await (const e of analyzeVideo('meeting.mp4')) {
 *   if (e.stage === 'transcribing') console.log(`${e.percent}%`)
 *   if (e.stage === 'done') console.log(e.result)
 * }
 * ```
 */
import * as path from 'path'

import { GeminiProvider } from '@/providers/gemini-provider'
import { chunkAudio } from '@/services/audio-chunker'
import { cleanupTempFiles } from '@/services/cleanup'
import { streamMeetingNotes } from '@/services/summarizer'
import { extractAudio, getVideoMetadata, validateVideoFile } from '@/services/video-processor'
import { ProgressEvent } from '@/types'
import { AsyncQueue } from '@/utils/async-queue'
import { ensureOutputDir, ensureTempDir, loadConfig } from '@/utils/config'
import { saveMeetingNotes } from '@/utils/output'

export type { AnalyzeOptions, MeetingNotes, ProgressEvent, Transcript, TranscriptSegment } from '@/types'

export interface AnalyzeVideoOptions {
	/** Gemini API key — takes highest priority over env vars and config files */
	apiKey?: string
	sourceLanguage?: string // default: 'English'
	targetLanguage?: string // default: 'Vietnamese'
	context?: string
	outputDir?: string
	keepSource?: boolean // default: true
	parallel?: boolean
	model?: string
	verbose?: boolean
	/**
	 * Stream Gemini summarization output chunk-by-chunk.
	 * When true, yields `{ stage: 'summarizing_stream', chunk }` events during summarization.
	 * Default: false (backward-compatible — waits for full response before yielding)
	 */
	streamSummary?: boolean
}

/** Analyze a video/audio file and yield real-time progress events. Cancel via `gen.return()`. */
export async function* analyzeVideo(
	videoPath: string,
	options: AnalyzeVideoOptions = {}
): AsyncGenerator<ProgressEvent> {
	const config = loadConfig({
		outputDir: options.outputDir,
		parallel: options.parallel,
		model: options.model,
		apiKey: options.apiKey
	})

	yield { stage: 'validating' }
	validateVideoFile(videoPath)
	const { duration } = await getVideoMetadata(videoPath)

	yield {
		stage: 'extracting_audio',
		duration
	}
	ensureOutputDir(config.outputDir)
	const tempDir = ensureTempDir(path.dirname(videoPath))
	const audioPath = path.join(tempDir, 'audio.wav')

	await extractAudio(videoPath, audioPath, { verbose: options.verbose })

	const chunks = await chunkAudio(audioPath, tempDir, {
		chunkDuration: config.maxChunkDuration,
		verbose: options.verbose
	})

	yield {
		stage: 'chunking',
		totalChunks: chunks.length
	}

	// Push-to-pull bridge: collect onChunkProgress callbacks during transcription, yield after
	const chunkEvents: ProgressEvent[] = []
	const provider = new GeminiProvider(config)

	if (!(await provider.isAvailable())) {
		throw new Error('No Gemini API key found. Set GEMINI_API_KEY or GOOGLE_API_KEY.')
	}

	const transcript = await provider.transcribe({
		audioPath,
		chunks,
		sourceLanguage: options.sourceLanguage ?? 'English',
		targetLanguage: options.targetLanguage ?? 'Vietnamese',
		enableParallel: config.enableParallel,
		verbose: options.verbose,
		onChunkProgress: (completed, total) =>
			chunkEvents.push({
				stage: 'transcribing',
				chunk: completed,
				total,
				percent: Math.round((completed / total) * 100)
			})
	})

	for (const e of chunkEvents) {
		yield e
	}

	transcript.originalSourceFile = videoPath

	yield { stage: 'summarizing' }

	let meetingNotes

	if (options.streamSummary && config.geminiApiKey) {
		// Async queue bridges push-based onChunk callback → pull-based AsyncGenerator.
		// Each chunk is yielded immediately as Gemini produces it — true real-time streaming.
		const chunkQueue = new AsyncQueue<string>()

		// Run streamMeetingNotes concurrently: chunks flow into queue while analyzeVideo yields them
		const notesPromise = streamMeetingNotes({
			apiKey: config.geminiApiKey,
			transcript,
			context: options.context,
			targetLanguage: options.targetLanguage ?? 'Vietnamese',
			verbose: options.verbose,
			model: config.geminiModel,
			onChunk: (chunk) => chunkQueue.push(chunk)
		})

		// Yield each chunk as it arrives from Gemini
		notesPromise.then(() => chunkQueue.done()).catch(() => chunkQueue.done())

		for await (const chunk of chunkQueue) {
			yield {
				stage: 'summarizing_stream' as const,
				chunk
			}
		}

		meetingNotes = await notesPromise
	} else {
		meetingNotes = await provider.summarize!({
			transcript,
			context: options.context,
			targetLanguage: options.targetLanguage ?? 'Vietnamese',
			verbose: options.verbose
		})
	}

	const outputPath = await saveMeetingNotes(meetingNotes, config.outputDir, { verbose: options.verbose })

	yield {
		stage: 'saving',
		outputPath
	}

	await cleanupTempFiles({
		tempDir,
		audioPath,
		videoPath: options.keepSource === false ? videoPath : undefined,
		chunks: chunks.map((c) => c.path),
		keepSource: options.keepSource ?? true,
		verbose: options.verbose
	})

	yield {
		stage: 'done',
		result: meetingNotes
	}
}
