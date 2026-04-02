/**
 * Builds a minimal MeetingNotes object from a transcript alone.
 * Used when the selected provider does not support summarization (e.g. LocalWhisperProvider).
 * Accepts optional pre-translated segments for fullTranscriptTarget.
 */

import * as path from 'path'

import { MeetingNotes, Transcript, TranscriptSegment } from '@/types'

/**
 * Format seconds to "Xh Ym Zs" string
 */
const formatDuration = (seconds: number): string => {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)

	if (h > 0) {
		return `${h}h ${m}m ${s}s`
	}

	if (m > 0) {
		return `${m}m ${s}s`
	}

	return `${s}s`
}

export const buildTranscriptOnlyNotes = (
	transcript: Transcript,
	targetLanguage?: string,
	translatedSegments?: TranscriptSegment[]
): MeetingNotes => ({
	metadata: {
		sourceFile: path.basename(transcript.originalSourceFile ?? transcript.sourceFile),
		date: new Date().toISOString().split('T')[0],
		duration: formatDuration(transcript.metadata.duration),
		languages: {
			source: transcript.sourceLanguage,
			target: targetLanguage
		}
	},
	executiveSummary: [],
	detailed: {
		discussion: '',
		attendees: [],
		agenda: [],
		decisions: [],
		actionItems: []
	},
	overallSummary:
		'⚠️ Summarize not available — transcribe-only mode (no LLM provider). Install Gemini or Groq for full meeting notes.',
	fullTranscript: transcript.segments,
	fullTranscriptTarget: translatedSegments
})
