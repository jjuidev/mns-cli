/**
 * Free translation via MyMemory API — no API key required.
 * Limit: 5000 words/day on free tier (sufficient for meeting transcripts).
 *
 * Docs: https://mymemory.translated.net/doc/spec.php
 */

import { consola } from 'consola'

import { parseTranslatedSegments } from '@/services/summarizer'
import { TranscriptSegment } from '@/types'

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get'

/** Normalize language name to BCP-47 code MyMemory expects (e.g. "vietnamese" → "vi") */
const toLanguageCode = (lang: string): string => {
	const map: Record<string, string> = {
		vietnamese: 'vi',
		english: 'en',
		french: 'fr',
		german: 'de',
		spanish: 'es',
		chinese: 'zh-CN',
		japanese: 'ja',
		korean: 'ko',
		thai: 'th',
		indonesian: 'id',
		portuguese: 'pt',
		italian: 'it',
		russian: 'ru',
		arabic: 'ar',
		hindi: 'hi'
	}

	const lower = lang.toLowerCase()

	return map[lower] ?? lower
}

/**
 * Translate a single text string via MyMemory.
 * Returns original text on failure (graceful degradation).
 */
const translateText = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
	try {
		const params = new URLSearchParams({
			q: text,
			langpair: `${sourceLang}|${targetLang}`
		})

		const res = await fetch(`${MYMEMORY_URL}?${params}`)

		if (!res.ok) {
			return text
		}

		const json = (await res.json()) as { responseData?: { translatedText?: string }; responseStatus?: number }

		if (json.responseStatus !== 200 || !json.responseData?.translatedText) {
			return text
		}

		return json.responseData.translatedText
	} catch {
		return text // fallback: return source
	}
}

/**
 * Translate transcript segments to target language using MyMemory API.
 * Processes segments sequentially to avoid rate limiting.
 * Returns translated TranscriptSegment[] preserving timestamps and speakers.
 */
export const translateSegmentsFree = async (
	segments: TranscriptSegment[],
	sourceLanguage: string | undefined,
	targetLanguage: string,
	verbose?: boolean
): Promise<TranscriptSegment[]> => {
	const sourceLang = toLanguageCode(sourceLanguage || 'en')
	const targetLang = toLanguageCode(targetLanguage)

	if (sourceLang === targetLang) {
		return segments
	}

	if (verbose) {
		consola.info(`Translating ${segments.length} segments (${sourceLang} → ${targetLang}) via MyMemory...`)
	}

	// Build a single batch string in the same format as buildTranslationPrompt
	// so we can reuse parseTranslatedSegments for parsing
	const lines = segments
		.map((s) => {
			const speaker = s.speaker ? `[${s.speaker}] ` : ''

			return `${s.timestamp} ${speaker}${s.text}`
		})
		.join('\n')

	try {
		const translated = await translateText(lines, sourceLang, targetLang)
		const result = parseTranslatedSegments(translated, segments)

		// If batch translation produced fewer lines than expected, fall back to per-segment
		if (result.length >= segments.length * 0.8) {
			if (verbose) {
				consola.success('Translation complete')
			}

			return result
		}
	} catch {
		// fall through to per-segment
	}

	// Per-segment fallback (more reliable but slower / uses more quota)
	if (verbose) {
		consola.info('Falling back to per-segment translation...')
	}

	const translated: TranscriptSegment[] = []

	for (const seg of segments) {
		const translatedText = await translateText(seg.text, sourceLang, targetLang)

		translated.push({
			...seg,
			text: translatedText
		})
	}

	if (verbose) {
		consola.success('Translation complete')
	}

	return translated
}
