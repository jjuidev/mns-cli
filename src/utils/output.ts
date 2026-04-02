/**
 * Output formatter - Format meeting notes as Markdown
 */

import * as fs from 'fs'
import * as path from 'path'

import { consola } from 'consola'

import { MeetingNotes } from '@/types'

const logger = consola.withTag('output')

/**
 * Format meeting notes as Markdown
 */
export const formatMeetingNotes = (notes: MeetingNotes): string => {
	let markdown = `# Meeting Notes

`

	// Metadata
	markdown += `**Date:** ${notes.metadata.date}
`
	markdown += `**Source:** ${notes.metadata.sourceFile}
`
	markdown += `**Duration:** ${notes.metadata.duration}
`

	if (notes.metadata.context) {
		markdown += `**Context:** ${notes.metadata.context}
`
	}

	if (notes.metadata.languages.source || notes.metadata.languages.target) {
		markdown += `**Languages:** `
		const langs: string[] = []

		if (notes.metadata.languages.source) {
			langs.push(`Source: ${notes.metadata.languages.source}`)
		}

		if (notes.metadata.languages.target) {
			langs.push(`Target: ${notes.metadata.languages.target}`)
		}

		markdown += langs.join(', ') + '\n'
	}

	markdown += '\n---\n\n'

	// Overall Meeting Summary (Target Language only)
	if (notes.overallSummary) {
		markdown += `## Overall Meeting Summary (${notes.metadata.languages.target || 'Vietnamese'})

${notes.overallSummary}

---
`
	}

	// Executive Summary — bilingual when target translation available
	markdown += `## Executive Summary\n\n`

	if (notes.executiveSummary.length > 0 || notes.executiveSummaryTarget?.length) {
		if (notes.executiveSummaryTarget?.length) {
			// Bilingual: source (English) block + target language block
			markdown += `**[${notes.metadata.languages.source || 'English'}]**\n`
			notes.executiveSummary.forEach((point) => {
				markdown += `- ${point}\n`
			})
			markdown += `\n**[${notes.metadata.languages.target || 'Target'}]**\n`
			notes.executiveSummaryTarget.forEach((point) => {
				markdown += `- ${point}\n`
			})
		} else {
			notes.executiveSummary.forEach((point) => {
				markdown += `- ${point}\n`
			})
		}
	} else {
		markdown += `*No executive summary available*\n`
	}

	markdown += '\n---\n\n'

	// Detailed Notes
	markdown += `## Detailed Notes

`

	// Attendees
	if (notes.detailed.attendees && notes.detailed.attendees.length > 0) {
		markdown += `### Attendees

`
		notes.detailed.attendees.forEach((attendee) => {
			markdown += `- ${attendee}\n`
		})
		markdown += '\n'
	}

	// Agenda — bilingual when target translation available
	if (notes.detailed.agenda && notes.detailed.agenda.length > 0) {
		markdown += `### Agenda\n\n`

		if (notes.detailed.agendaTarget?.length) {
			markdown += `**[${notes.metadata.languages.source || 'English'}]**\n`
			notes.detailed.agenda.forEach((item) => {
				markdown += `- ${item}\n`
			})
			markdown += `\n**[${notes.metadata.languages.target || 'Target'}]**\n`
			notes.detailed.agendaTarget.forEach((item) => {
				markdown += `- ${item}\n`
			})
			markdown += '\n'
		} else {
			notes.detailed.agenda.forEach((item) => {
				markdown += `- ${item}\n`
			})
			markdown += '\n'
		}
	}

	// Discussion
	if (notes.detailed.discussion) {
		markdown += `### Discussion

${notes.detailed.discussion}

`
	}

	// Decisions
	if (notes.detailed.decisions && notes.detailed.decisions.length > 0) {
		markdown += `### Decisions

`
		notes.detailed.decisions.forEach((decision) => {
			markdown += `- ${decision}\n`
		})
		markdown += '\n'
	}

	// Action Items
	if (notes.detailed.actionItems && notes.detailed.actionItems.length > 0) {
		markdown += `### Action Items

`
		notes.detailed.actionItems.forEach((item) => {
			markdown += `- ${item}\n`
		})
		markdown += '\n'
	}

	// Full Transcript (source + optional target in same block)
	if (notes.fullTranscript && notes.fullTranscript.length > 0) {
		markdown += `---\n## Full Transcript\n\n`
		markdown += `<details>\n<summary>Click to expand transcript</summary>\n\n`

		notes.fullTranscript.forEach((segment) => {
			const speaker = segment.speaker ? `[${segment.speaker}] ` : ''

			markdown += `${segment.timestamp} ${speaker}${segment.text}\n\n`
		})

		if (notes.fullTranscriptTarget && notes.fullTranscriptTarget.length > 0) {
			markdown += `---\n\n`
			notes.fullTranscriptTarget.forEach((segment) => {
				const speaker = segment.speaker ? `[${segment.speaker}] ` : ''

				markdown += `${segment.timestamp} ${speaker}${segment.text}\n\n`
			})
		}

		markdown += `</details>\n`
	}

	return markdown
}

/**
 * Save meeting notes to file
 */
export const saveMeetingNotes = async (
	notes: MeetingNotes,
	outputDir: string,
	options?: { verbose?: boolean }
): Promise<string> => {
	// Generate filename: meeting-notes-HHMMSS-DDMMYYYY
	const now = new Date()

	const time = [
		now.getHours().toString().padStart(2, '0'),
		now.getMinutes().toString().padStart(2, '0'),
		now.getSeconds().toString().padStart(2, '0')
	].join('')

	const date = [
		now.getDate().toString().padStart(2, '0'),
		(now.getMonth() + 1).toString().padStart(2, '0'),
		now.getFullYear()
	].join('')

	const baseName = path.parse(notes.metadata.sourceFile).name
	const fileName = `meeting-notes-${time}-${date}-${baseName}.md`
	const outputPath = path.join(outputDir, fileName)

	// Format markdown
	const markdown = formatMeetingNotes(notes)

	// Write to file
	fs.writeFileSync(outputPath, markdown, 'utf-8')

	if (options?.verbose) {
		logger.success(`Meeting notes saved: ${outputPath}`)
	}

	return outputPath
}
