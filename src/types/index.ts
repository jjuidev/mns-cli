/**
 * Types for MNS (Meeting Notes) CLI
 */

export interface TranscriptSegment {
	/** Timestamp range [HH:MM:SS -> HH:MM:SS] */
	timestamp: string
	/** Speaker label */
	speaker?: string
	/** Transcribed text */
	text: string
}

export interface Transcript {
	/** Internal audio file path (e.g. .mns-temp/audio.wav) — used for processing */
	sourceFile: string
	/** Original video/audio file path provided by the user — used for display in output */
	originalSourceFile?: string
	/** Source language (auto-detected if not provided) */
	sourceLanguage?: string
	/** Target language for translation */
	targetLanguage?: string
	/** Full transcript text */
	fullText: string
	/** Segmented transcript with timestamps */
	segments: TranscriptSegment[]
	/** Processing metadata */
	metadata: {
		duration: number // seconds
		chunksProcessed: number
		processingTime: number // ms
	}
}

export interface MeetingNotes {
	/** Meeting metadata */
	metadata: {
		sourceFile: string
		date: string
		duration: string
		languages: {
			source?: string
			target?: string
		}
		context?: string
	}
	/** Executive summary (bullet points) in source language */
	executiveSummary: string[]
	/** Executive summary translated to target language */
	executiveSummaryTarget?: string[]
	/** Detailed meeting notes */
	detailed: {
		attendees?: string[]
		agenda?: string[]
		/** Agenda translated to target language */
		agendaTarget?: string[]
		discussion: string
		decisions?: string[]
		actionItems?: string[]
	}
	/** Overall meeting summary */
	overallSummary?: string
	/** Full transcript (source language) */
	fullTranscript?: TranscriptSegment[]
	/** Full transcript translated to target language */
	fullTranscriptTarget?: TranscriptSegment[]
}

export interface AnalyzeOptions {
	/** Source video file path */
	videoPath: string
	/** Source language (auto-detect if not provided) */
	sourceLanguage?: string
	/** Target language for translation */
	targetLanguage?: string
	/** User-provided context about the meeting */
	context?: string
	/** Output directory for meeting notes */
	outputDir?: string
	/** Keep source files after processing (default: false) */
	keepSource?: boolean
	/** Enable parallel processing (auto-detected if not provided) */
	parallel?: boolean
	/** Verbose logging */
	verbose?: boolean
}

export interface ProcessingConfig {
	/** Gemini API key */
	geminiApiKey?: string
	/** Gemini model to use */
	geminiModel: string
	/** FFmpeg path */
	ffmpegPath?: string
	/** Max chunk duration in seconds (default: 900 = 15 min) */
	maxChunkDuration: number
	/** Enable parallel processing */
	enableParallel: boolean
	/** Max parallel chunks (default: 4) */
	maxParallelChunks: number
	/** Output directory */
	outputDir: string
}

/** Schema for .mns.json or ~/.config/mns/config.json */
export interface MnsConfigFile {
	/** Nested env keys — takes priority over flat keys */
	env?: {
		GEMINI_API_KEY?: string
	}
	/** Nested model overrides — takes priority over flat keys */
	model?: {
		gemini?: string
	}
	/** Backward-compat flat camelCase keys (still supported as fallback) */
	geminiApiKey?: string
	geminiModel?: string
	/** Allow UPPER_CASE flat keys (e.g. GEMINI_API_KEY) without type cast */
	[key: string]: unknown
}

export interface AudioChunk {
	/** Chunk file path */
	path: string
	/** Chunk index */
	index: number
	/** Start time in seconds */
	startTime: number
	/** Duration in seconds */
	duration: number
}

/**
 * Progress events yielded by the analyzeVideo() AsyncGenerator.
 * Discriminated union on `stage` — use switch/if narrowing in consumers.
 */
export type ProgressEvent =
	| { stage: 'validating' }
	| { stage: 'extracting_audio'; duration: number }
	| { stage: 'chunking'; totalChunks: number }
	| { stage: 'transcribing'; chunk: number; total: number; percent: number }
	| { stage: 'summarizing' }
	| { stage: 'saving'; outputPath: string }
	| { stage: 'done'; result: MeetingNotes }
