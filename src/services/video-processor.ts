/**
 * Video processor - Extract audio from video using FFmpeg
 */

import * as fs from 'fs'
import * as path from 'path'

import { consola } from 'consola'
import ffmpeg from 'fluent-ffmpeg'

const logger = consola.withTag('video-processor')

/**
 * Extract audio from video or convert audio file
 */
export const extractAudio = async (
	mediaPath: string,
	outputPath: string,
	options?: { verbose?: boolean }
): Promise<{ duration: number; audioPath: string }> =>
	new Promise((resolve, reject) => {
		if (!fs.existsSync(mediaPath)) {
			reject(new Error(`Media file not found: ${mediaPath}`))
			return
		}

		const isAudio = isAudioFile(mediaPath)
		const actionText = isAudio ? 'Converting audio' : 'Extracting audio from video'

		if (options?.verbose) {
			logger.info(`${actionText}: ${mediaPath}`)
		}

		let duration = 0

		const command = ffmpeg(mediaPath)

		// If already audio, just convert format
		if (isAudio) {
			command.input(mediaPath).output(outputPath).audioCodec('pcm_s16le').audioChannels(1).audioFrequency(16000)
		} else {
			// Extract audio from video
			command.output(outputPath).noVideo().audioCodec('pcm_s16le').audioChannels(1).audioFrequency(16000)
		}

		command
			.on('codecData', (data) => {
				// Parse duration from codec data
				const match = data.duration?.match(/(\d{2}):(\d{2}):(\d{2})/)

				if (match) {
					const hours = parseInt(match[1])
					const minutes = parseInt(match[2])
					const seconds = parseInt(match[3])

					duration = hours * 3600 + minutes * 60 + seconds
				}
			})
			.on('progress', (progress) => {
				if (options?.verbose && progress.percent) {
					logger.info(`${actionText}: ${Math.round(progress.percent)}%`)
				}
			})
			.on('end', () => {
				logger.success(`Audio ready: ${outputPath}`)
				resolve({
					duration,
					audioPath: outputPath
				})
			})
			.on('error', (err) => {
				logger.error(`Failed to process audio: ${err.message}`)
				reject(err)
			})
			.run()
	})

/**
 * Get video metadata (duration, format, etc.)
 */
export const getVideoMetadata = async (
	videoPath: string
): Promise<{ duration: number; format: string; size: number }> =>
	new Promise((resolve, reject) => {
		ffmpeg.ffprobe(videoPath, (err, metadata) => {
			if (err) {
				reject(err)
				return
			}

			const format = metadata.format
			const duration = format.duration || 0
			const size = format.size || 0

			resolve({
				duration,
				format: format.format_name || 'unknown',
				size
			})
		})
	})

/**
 * Validate video or audio file
 */
export const validateVideoFile = (videoPath: string): void => {
	if (!fs.existsSync(videoPath)) {
		throw new Error(`Media file not found: ${videoPath}`)
	}

	const ext = path.extname(videoPath).toLowerCase()
	const supportedVideoFormats = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv']
	const supportedAudioFormats = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.wma']
	const supportedFormats = [...supportedVideoFormats, ...supportedAudioFormats]

	if (!supportedFormats.includes(ext)) {
		throw new Error(`Unsupported format: ${ext}. Supported formats: ${supportedFormats.join(', ')}`)
	}

	const stats = fs.statSync(videoPath)
	const sizeGB = stats.size / (1024 * 1024 * 1024)

	if (sizeGB > 2) {
		logger.warn(`Large file detected: ${sizeGB.toFixed(2)} GB`)
		logger.warn('Processing may take longer and consume more memory.')
	}
}

/**
 * Check if file is audio-only
 */
export const isAudioFile = (filePath: string): boolean => {
	const ext = path.extname(filePath).toLowerCase()
	const audioFormats = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.wma']

	return audioFormats.includes(ext)
}
