/**
 * GeminiProvider — wraps existing transcribeAudio + generateMeetingNotes services.
 * Requires GEMINI_API_KEY or GOOGLE_API_KEY environment variable.
 */

import { TranscribeProvider, ProviderTranscribeOptions, ProviderSummarizeOptions } from '@/providers/types'
import { generateMeetingNotes } from '@/services/summarizer'
import { transcribeAudio } from '@/services/transcriber'
import { ProcessingConfig, Transcript, MeetingNotes } from '@/types'

export class GeminiProvider implements TranscribeProvider {
	readonly name = 'gemini'
	readonly supportsSummarize = true

	constructor(private readonly config: ProcessingConfig) {}

	async isAvailable(): Promise<boolean> {
		return !!this.config.geminiApiKey
	}

	async transcribe(options: ProviderTranscribeOptions): Promise<Transcript> {
		return transcribeAudio({
			apiKey: this.config.geminiApiKey!,
			audioPath: options.audioPath,
			chunks: options.chunks,
			sourceLanguage: options.sourceLanguage,
			targetLanguage: options.targetLanguage,
			enableParallel: options.enableParallel,
			verbose: options.verbose,
			model: this.config.geminiModel,
			onChunkProgress: options.onChunkProgress
		})
	}

	async summarize(options: ProviderSummarizeOptions): Promise<MeetingNotes> {
		return generateMeetingNotes({
			apiKey: this.config.geminiApiKey!,
			transcript: options.transcript,
			context: options.context,
			targetLanguage: options.targetLanguage,
			verbose: options.verbose,
			model: this.config.geminiModel
		})
	}
}
