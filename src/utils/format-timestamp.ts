/**
 * Shared timestamp formatting utilities for provider segment normalization.
 * Used by GroqProvider and LocalWhisperProvider to convert float seconds to HH:MM:SS.
 */

/**
 * Convert seconds (float) to HH:MM:SS string
 */
export const formatTimestampSec = (seconds: number): string => {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)

	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Build a [HH:MM:SS -> HH:MM:SS] timestamp string from raw start/end seconds + chunk offset
 */
export const buildSegmentTimestamp = (startSec: number, endSec: number, chunkOffset: number = 0): string =>
	`[${formatTimestampSec(startSec + chunkOffset)} -> ${formatTimestampSec(endSec + chunkOffset)}]`
