/**
 * Provider interface and shared types for MNS.
 * GeminiProvider implements TranscribeProvider — no multi-provider chain.
 */

import { AudioChunk, MeetingNotes, Transcript } from '@/types'

export interface ProviderTranscribeOptions {
	audioPath: string
	chunks?: AudioChunk[]
	sourceLanguage?: string
	targetLanguage?: string
	enableParallel?: boolean
	verbose?: boolean
	/** Called after each chunk completes — useful for progress reporting */
	onChunkProgress?: (completedChunk: number, totalChunks: number) => void
}

export interface ProviderSummarizeOptions {
	transcript: Transcript
	context?: string
	targetLanguage?: string
	verbose?: boolean
}

export interface TranscribeProvider {
	/** Human-readable provider name (used in logs) */
	readonly name: string
	/** True if this provider supports summarization */
	readonly supportsSummarize: boolean
	/** Async check: can this provider run? (key present, tool available) */
	isAvailable(): Promise<boolean>
	transcribe(options: ProviderTranscribeOptions): Promise<Transcript>
	summarize?(options: ProviderSummarizeOptions): Promise<MeetingNotes>
}

/**
 * Thrown when Gemini API key is not set.
 */
export class NoProviderAvailableError extends Error {
	constructor() {
		super(`No Gemini API key found.
Set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.
→ Get key: https://aistudio.google.com/apikey`)

		this.name = 'NoProviderAvailableError'
	}
}
