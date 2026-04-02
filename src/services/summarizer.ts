/**
 * Summarizer - Generate meeting notes from transcript using Gemini
 */

import * as path from 'path'

import { GoogleGenAI } from '@google/genai'
import { consola } from 'consola'

import { Transcript, MeetingNotes, TranscriptSegment } from '@/types'
import { DEFAULT_GEMINI_MODEL } from '@/utils/constants'

const logger = consola.withTag('summarizer')

/**
 * Generate meeting notes from transcript
 */
export const generateMeetingNotes = async (options: {
	apiKey: string
	transcript: Transcript
	context?: string
	targetLanguage?: string
	verbose?: boolean
	model?: string
}): Promise<MeetingNotes> => {
	const genAI = new GoogleGenAI({ apiKey: options.apiKey })
	const model = options.model || DEFAULT_GEMINI_MODEL

	if (options.verbose) {
		logger.info('Generating meeting notes...')
	}

	const prompt = buildSummarizationPrompt(options.transcript, options.context, options.targetLanguage)

	try {
		const response = await genAI.models.generateContent({
			model,
			contents: [
				{
					role: 'user',
					parts: [{ text: prompt }]
				}
			]
		})

		const summaryText = response.text || ''
		const meetingNotes = parseMeetingNotes(summaryText, options.transcript, options.context)

		// Translate transcript segments if source != target language
		const sourceSegments = options.transcript.segments

		const needsTranslation =
			options.targetLanguage &&
			options.targetLanguage.toLowerCase() !== (options.transcript.sourceLanguage || '').toLowerCase() &&
			sourceSegments.length > 0

		if (needsTranslation) {
			logger.info(`Translating transcript to ${options.targetLanguage}...`)
			meetingNotes.fullTranscriptTarget = await translateSegments(
				genAI,
				sourceSegments,
				options.transcript.sourceLanguage,
				options.targetLanguage!,
				options.verbose,
				model
			)
		}

		logger.success('Meeting notes generated')
		return meetingNotes
	} catch (error) {
		logger.error(`Failed to generate meeting notes: ${error}`)
		throw error
	}
}

/**
 * Translate transcript segments to target language via text-only Gemini call.
 * Preserves timestamps and speaker labels, translates only the speech text.
 */
const translateSegments = async (
	genAI: GoogleGenAI,
	segments: TranscriptSegment[],
	sourceLanguage: string | undefined,
	targetLanguage: string,
	verbose?: boolean,
	model: string = DEFAULT_GEMINI_MODEL
): Promise<TranscriptSegment[]> => {
	const prompt = buildTranslationPrompt(segments, sourceLanguage, targetLanguage)

	try {
		const response = await genAI.models.generateContent({
			model,
			contents: [
				{
					role: 'user',
					parts: [{ text: prompt }]
				}
			]
		})

		const text = response.text || ''

		if (verbose) {
			logger.success('Transcript translation complete')
		}

		// Parse the translated output using the same flexible parser
		return parseTranslatedSegments(text, segments)
	} catch (error) {
		logger.error(`Failed to translate transcript: ${error}`)
		return segments // fallback: return source
	}
}

/**
 * Build the translation prompt used by any provider to translate transcript segments.
 * Exported so providers (Groq, etc.) can call their own LLM with this prompt.
 */
export const buildTranslationPrompt = (
	segments: TranscriptSegment[],
	sourceLanguage: string | undefined,
	targetLanguage: string
): string => {
	const lines = segments
		.map((s) => {
			const speaker = s.speaker ? `[${s.speaker}] ` : ''

			return `${s.timestamp} ${speaker}${s.text}`
		})
		.join('\n')

	return `Translate the following transcript lines from ${sourceLanguage || 'the source language'} to ${targetLanguage}.


STRICT RULES:
- Output ALL ${segments.length} lines — do NOT skip or merge any lines
- For each line: keep the EXACT timestamp and speaker label, translate ONLY the speech text
- Output format per line: [HH:MM:SS -> HH:MM:SS] [Speaker N] translated text
- No commentary, no headers, no extra output

TRANSCRIPT:
${lines}`
}

/**
 * Parse translated segment lines, falling back to source segment timestamps/speakers
 * if parsing fails for a line.
 */
export const parseTranslatedSegments = (text: string, sourceSegments: TranscriptSegment[]): TranscriptSegment[] => {
	const timestampRegex =
		/\[\s*(\d{1,2}:\d{2}:\d{2}(?:[.,]\d+)?)\s*(?:(?:->|–|-)\s*(\d{1,2}:\d{2}:\d{2}(?:[.,]\d+)?)\s*)?\]\s*(.*)/

	const lines = text.split('\n').filter((l) => l.trim())
	const result: TranscriptSegment[] = []

	lines.forEach((line, i) => {
		const match = line.match(timestampRegex)

		if (match) {
			const content = match[3].trim()
			const speakerMatch = content.match(/^\[Speaker (\d+)\]\s*/)
			const speaker = speakerMatch ? `Speaker ${speakerMatch[1]}` : sourceSegments[i]?.speaker
			const speechText = speakerMatch ? content.replace(speakerMatch[0], '') : content

			result.push({
				timestamp: sourceSegments[i]?.timestamp ?? `[${match[1]} -> ${match[2] ?? match[1]}]`,
				speaker,
				text: speechText || line.trim()
			})
		} else if (line.trim() && i < sourceSegments.length) {
			// No timestamp in translated line — reuse source segment's timestamp/speaker
			result.push({
				timestamp: sourceSegments[i].timestamp,
				speaker: sourceSegments[i].speaker,
				text: line.trim()
			})
		}
	})

	return result.length > 0 ? result : sourceSegments
}

/**
 * Build summarization prompt for Gemini/Groq
 */
export const buildSummarizationPrompt = (transcript: Transcript, context?: string, targetLanguage?: string): string => {
	let prompt = `Analyze this meeting transcript and generate comprehensive meeting notes.

`

	if (context) {
		prompt += `**Context:** ${context}

`
	}

	prompt += `**Transcript:**
${transcript.fullText}

`

	if (transcript.segments.length > 0) {
		prompt += `**Timestamped Segments:**
${transcript.segments.map((s) => `${s.timestamp} ${s.speaker ? `[${s.speaker}] ` : ''}${s.text}`).join('\n')}

`
	}

	const targetLang = targetLanguage || 'English'

	prompt += `**Instructions:**
Generate meeting notes with EXACTLY this structure:

## OVERALL MEETING SUMMARY
- 2-3 paragraphs providing high-level overview of the entire meeting
- What was discussed, major themes, overall tone and outcome
- Write in ${targetLang}

## EXECUTIVE SUMMARY

**[${transcript.sourceLanguage || 'English'}]**
- 5-7 bullet points in English summarizing key topics and outcomes

**[${targetLang}]**
- Same 5-7 bullet points translated to ${targetLang}

## DETAILED NOTES

### Attendees
- List all identified speakers (if mentioned)

### Agenda

**[${transcript.sourceLanguage || 'English'}]**
- Main topics discussed (if identifiable), in English

**[${targetLang}]**
- Same agenda items translated to ${targetLang}

### Discussion
- Comprehensive summary of the discussion (2-3 paragraphs) in ${targetLang}
- Include key points from each major topic

### Decisions
- List any decisions made during the meeting
- Include relevant timestamps

### Action Items
- List action items with responsible parties (if mentioned)
- Include relevant timestamps

## FULL TRANSCRIPT (SOURCE LANGUAGE)
- Complete transcript in the ORIGINAL source language from audio
- Include timestamps and speakers
- DO NOT translate this section

## FULL TRANSCRIPT (TARGET LANGUAGE)
- Complete transcript in ${targetLang}
- Translate from source language
- Include timestamps and speakers

Format clearly with markdown. Be comprehensive but concise.`

	return prompt
}

/**
 * Parse meeting notes from Gemini/Groq response
 */
export const parseMeetingNotes = (text: string, transcript: Transcript, context?: string): MeetingNotes => {
	// Extract sections using markdown headers
	const overallSummary = extractOverallSummary(text)
	const executiveSummary = extractSection(text, 'EXECUTIVE SUMMARY')
	const detailed = extractDetailedSection(text)

	return {
		metadata: {
			sourceFile: path.basename(transcript.originalSourceFile ?? transcript.sourceFile),
			date: new Date().toISOString().split('T')[0],
			duration: formatDuration(transcript.metadata.duration),
			languages: {
				source: transcript.sourceLanguage,
				target: transcript.targetLanguage
			},
			context
		},
		overallSummary,
		executiveSummary: parseBilingualList(executiveSummary, 'English'),
		executiveSummaryTarget: parseBilingualList(executiveSummary, 'target') || undefined,
		detailed: {
			attendees: extractList(text, 'Attendees'),
			agenda: extractBilingualList(text, 'Agenda', 'English'),
			agendaTarget: extractBilingualList(text, 'Agenda', 'target') || undefined,
			discussion: detailed.discussion,
			decisions: extractList(text, 'Decisions'),
			actionItems: extractList(text, 'Action Items')
		},
		// Use transcript segments from transcription step
		fullTranscript: transcript.segments.length > 0 ? transcript.segments : undefined
	}
}

/**
 * Extract a section from markdown text
 */
const extractSection = (text: string, header: string): string => {
	const regex = new RegExp(`## ${header}[\\s\\S]*?(?=##|$)`, 'i')
	const match = text.match(regex)

	return match ? match[0] : ''
}

/**
 * Extract overall meeting summary (2-3 paragraphs)
 */
const extractOverallSummary = (text: string): string => {
	const section = extractSection(text, 'OVERALL MEETING SUMMARY')

	// Remove the header and return just the content
	return section.replace(/^##\s*OVERALL MEETING SUMMARY\s*/i, '').trim()
}

/**
 * Extract detailed section components
 */
const extractDetailedSection = (text: string): { discussion: string } => {
	const detailedSection = extractSection(text, 'DETAILED NOTES')

	// Extract discussion paragraph(s)
	const discussionMatch = detailedSection.match(/### Discussion\s*([\s\S]*?)(?=###|$)/i)
	const discussion = discussionMatch ? discussionMatch[1].trim() : ''

	return { discussion }
}

/**
 * Parse bullet points from text block
 */
const parseBulletPoints = (text: string): string[] => {
	const lines = text.split('\n')
	const bullets: string[] = []

	for (const line of lines) {
		const trimmed = line.trim()

		if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
			const bullet = trimmed.replace(/^[-*]\s*/, '')

			if (bullet) {
				bullets.push(bullet)
			}
		}
	}

	return bullets
}

/**
 * Parse bilingual bullet list from a section text.
 * Looks for **[English]** / **[<lang>]** markers and returns the matching list.
 * Pass 'English' for the source list, 'target' for the non-English list.
 * Falls back to parseBulletPoints (full section) if no bilingual markers found.
 */
const parseBilingualList = (sectionText: string, which: 'English' | 'target'): string[] => {
	// Match **[Label]** blocks: capture label + following bullet lines until next **[** or end
	const blockRegex = /\*\*\[([^\]]+)\]\*\*\s*([\s\S]*?)(?=\*\*\[|$)/g
	const blocks: Array<{ label: string; content: string }> = []
	let match: RegExpExecArray | null

	while ((match = blockRegex.exec(sectionText)) !== null) {
		blocks.push({
			label: match[1].trim(),
			content: match[2]
		})
	}

	if (blocks.length === 0) {
		// No bilingual format — return all bullets (backward-compat)
		return which === 'English' ? parseBulletPoints(sectionText) : []
	}

	if (which === 'English') {
		const block = blocks.find((b) => b.label.toLowerCase() === 'english')

		return block ? parseBulletPoints(block.content) : []
	}

	// 'target' = any non-English block (first non-English)
	const block = blocks.find((b) => b.label.toLowerCase() !== 'english')

	return block ? parseBulletPoints(block.content) : []
}

/**
 * Extract a list from a named subsection (### SectionName), with optional bilingual parsing.
 */
const extractList = (text: string, sectionName: string): string[] | undefined => {
	const regex = new RegExp(`### ${sectionName}[\\s\\S]*?(?=###|##|$)`, 'i')
	const match = text.match(regex)

	if (!match) {
		return undefined
	}

	return parseBulletPoints(match[0])
}

/**
 * Extract bilingual list from a named subsection.
 * Returns undefined when section is absent.
 */
const extractBilingualList = (text: string, sectionName: string, which: 'English' | 'target'): string[] | undefined => {
	const regex = new RegExp(`### ${sectionName}[\\s\\S]*?(?=###|##|$)`, 'i')
	const match = text.match(regex)

	if (!match) {
		return undefined
	}

	const list = parseBilingualList(match[0], which)

	return list.length > 0 ? list : undefined
}

/**
 * Format duration in seconds to HH:MM:SS
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
