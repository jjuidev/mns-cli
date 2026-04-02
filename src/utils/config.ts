/**
 * Configuration management for MNS CLI
 *
 * Priority chain for model values:
 *   CLI flag > MNS_MODEL env > project .mns.json > ~/.config/mns/config.json > default
 *
 * .mns.json supports JSONC (JSON with comments) and two key schemas:
 *   Nested (preferred): { "env": { "GEMINI_API_KEY": "..." }, "model": { "gemini": "..." } }
 *   Flat (backward-compat): { "geminiApiKey": "...", "geminiModel": "..." }
 */

import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { consola } from 'consola'
import stripJsonComments from 'strip-json-comments'

import { MnsConfigFile, ProcessingConfig } from '@/types'
import { DEFAULT_GEMINI_MODEL } from '@/utils/constants'

const logger = consola.withTag('config')

/** Path to project-level config file (CWD/.mns.json) */
export const getProjectConfigPath = (): string => path.join(process.cwd(), '.mns.json')

/** Path to global config file (~/.config/mns/config.json) */
export const getGlobalConfigPath = (): string => path.join(os.homedir(), '.config', 'mns', 'config.json')

/**
 * Read and parse a config file — supports JSONC (JSON with comments).
 * Returns null on any error (missing, malformed, etc.)
 */
export const readConfigFile = (filePath: string): MnsConfigFile | null => {
	try {
		const raw = fs.readFileSync(filePath, 'utf-8')

		return JSON.parse(stripJsonComments(raw)) as MnsConfigFile
	} catch {
		return null
	}
}

/**
 * Read a string value from a config object by trying multiple key names in order.
 * Returns the first non-empty string found, or undefined.
 */
const readKey = (cfg: MnsConfigFile | null, ...keys: string[]): string | undefined => {
	if (!cfg) {
		return undefined
	}

	for (const k of keys) {
		const v = cfg[k]

		if (typeof v === 'string' && v) {
			return v
		}
	}

	return undefined
}

/**
 * Write (merge) a patch into the global config file.
 * Creates ~/.config/mns/ directory if it does not exist.
 */
export const writeGlobalConfig = (patch: Partial<MnsConfigFile>): void => {
	const filePath = getGlobalConfigPath()

	fs.mkdirSync(path.dirname(filePath), { recursive: true })

	const existing = readConfigFile(filePath) ?? {}

	const merged = {
		...existing,
		...patch
	}

	fs.writeFileSync(filePath, JSON.stringify(merged, null, 2))
	logger.success(`Config updated: ${filePath}`)
}

/**
 * Resolve model configuration using the priority chain.
 * cliModel applies only to geminiModel.
 */
export const resolveModelConfig = (cliModel?: string): { geminiModel: string } => {
	const projectConfig = readConfigFile(getProjectConfigPath())
	const globalConfig = readConfigFile(getGlobalConfigPath())

	const geminiModel =
		cliModel ||
		process.env.MNS_MODEL ||
		projectConfig?.model?.gemini ||
		readKey(projectConfig, 'geminiModel') ||
		globalConfig?.model?.gemini ||
		readKey(globalConfig, 'geminiModel') ||
		DEFAULT_GEMINI_MODEL

	return { geminiModel }
}

/**
 * Load and build ProcessingConfig.
 * No longer exits on missing API key — caller handles that.
 *
 * API key priority:
 *   options.apiKey > process.env > config.env.KEY (nested) > config.KEY (flat camelCase) > config['UPPER_KEY'] (flat legacy)
 */
export const loadConfig = (options: {
	outputDir?: string
	parallel?: boolean
	model?: string
	/** Explicit API key — takes highest priority over all other sources */
	apiKey?: string
}): ProcessingConfig => {
	const projectConfig = readConfigFile(getProjectConfigPath())
	const globalConfig = readConfigFile(getGlobalConfigPath())

	// Explicit apiKey param takes highest priority
	const geminiApiKey =
		options.apiKey ||
		process.env.GEMINI_API_KEY ||
		process.env.GOOGLE_API_KEY ||
		projectConfig?.env?.GEMINI_API_KEY ||
		readKey(projectConfig, 'geminiApiKey', 'GEMINI_API_KEY', 'GOOGLE_API_KEY') ||
		globalConfig?.env?.GEMINI_API_KEY ||
		readKey(globalConfig, 'geminiApiKey', 'GEMINI_API_KEY', 'GOOGLE_API_KEY')

	const enableParallel = options.parallel ?? detectParallelCapability()
	const models = resolveModelConfig(options.model)

	return {
		geminiApiKey,
		...models,
		maxChunkDuration: 900,
		enableParallel,
		maxParallelChunks: 4,
		outputDir: options.outputDir || './output'
	}
}

/**
 * Detect if system can handle parallel processing (>4 GB RAM heuristic)
 */
const detectParallelCapability = (): boolean => {
	try {
		return os.totalmem() / (1024 * 1024 * 1024) > 4
	} catch {
		return false
	}
}

/**
 * Ensure output directory exists
 */
export const ensureOutputDir = (outputDir: string): void => {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
		logger.success(`Created output directory: ${outputDir}`)
	}
}

/**
 * Remove all files in outputDir except .gitkeep.
 * Used by --clean flag before saving new meeting notes.
 */
export const cleanOutputDir = (outputDir: string): void => {
	if (!fs.existsSync(outputDir)) {
		return
	}

	const entries = fs.readdirSync(outputDir)

	for (const entry of entries) {
		if (entry === '.gitkeep') {
			continue
		}

		fs.rmSync(path.join(outputDir, entry), {
			recursive: true,
			force: true
		})
	}

	logger.info(`Cleaned output directory: ${outputDir}`)
}

/**
 * Get temp directory path for audio chunks
 */
export const getTempDir = (baseDir: string = '.'): string => path.join(baseDir, '.mns-temp')

/**
 * Ensure temp directory exists
 */
export const ensureTempDir = (baseDir: string = '.'): string => {
	const tempDir = getTempDir(baseDir)

	if (!fs.existsSync(tempDir)) {
		fs.mkdirSync(tempDir, { recursive: true })
	}

	return tempDir
}
