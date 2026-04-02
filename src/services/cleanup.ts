/**
 * Cleanup service - Auto-delete source files after processing
 */

import * as fs from 'fs'
import * as path from 'path'

import { consola } from 'consola'

const logger = consola.withTag('cleanup')

/**
 * Clean up temporary files
 */
export const cleanupTempFiles = async (options: {
	tempDir?: string
	videoPath?: string
	audioPath?: string
	chunks?: string[]
	keepSource?: boolean
	verbose?: boolean
}): Promise<void> => {
	if (options.keepSource) {
		logger.info('Keeping source files (--keep flag)')
		return
	}

	const filesToDelete: string[] = []

	// Add video file to delete list
	if (options.videoPath && fs.existsSync(options.videoPath)) {
		filesToDelete.push(options.videoPath)
	}

	// Add audio file to delete list
	if (options.audioPath && fs.existsSync(options.audioPath)) {
		filesToDelete.push(options.audioPath)
	}

	// Add chunk files to delete list
	if (options.chunks) {
		filesToDelete.push(...options.chunks.filter((f) => fs.existsSync(f)))
	}

	// Delete files
	for (const file of filesToDelete) {
		try {
			fs.unlinkSync(file)

			if (options.verbose) {
				logger.info(`Deleted: ${file}`)
			}
		} catch (error) {
			logger.warn(`Failed to delete ${file}: ${error}`)
		}
	}

	// Delete temp directory if empty
	if (options.tempDir && fs.existsSync(options.tempDir)) {
		try {
			const remainingFiles = fs.readdirSync(options.tempDir)

			if (remainingFiles.length === 0) {
				fs.rmdirSync(options.tempDir)

				if (options.verbose) {
					logger.info(`Deleted temp directory: ${options.tempDir}`)
				}
			}
		} catch {
			// Ignore errors when removing temp dir
		}
	}

	if (filesToDelete.length > 0) {
		logger.success(`Cleaned up ${filesToDelete.length} file(s)`)
	}
}

/**
 * Clean up all temp files in directory
 */
export const cleanupAllTemp = async (baseDir: string = '.'): Promise<void> => {
	const tempDir = path.join(baseDir, '.mns-temp')

	if (fs.existsSync(tempDir)) {
		try {
			fs.rmSync(tempDir, {
				recursive: true,
				force: true
			})
			logger.success('Cleaned up all temporary files')
		} catch (error) {
			logger.warn(`Failed to clean temp directory: ${error}`)
		}
	}
}
