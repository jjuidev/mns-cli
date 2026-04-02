/**
 * Config command — read/write MNS configuration values.
 *
 * Usage:
 *   mns config get <key>           → prints resolved value
 *   mns config set <key> <value>   → writes to global ~/.config/mns/config.json
 *
 * Supported keys: geminiModel
 */

import { defineCommand } from 'citty'
import { consola } from 'consola'

import { MnsConfigFile } from '@/types'
import { resolveModelConfig, writeGlobalConfig } from '@/utils/config'

const VALID_KEYS: (keyof MnsConfigFile)[] = ['geminiModel']

const getCommand = defineCommand({
	meta: {
		name: 'get',
		description: 'Get a configuration value (resolved from priority chain)'
	},
	args: {
		key: {
			type: 'positional',
			description: `Config key (${VALID_KEYS.join(', ')})`,
			required: true
		}
	},
	run: async (ctx) => {
		const key = (ctx.args as { key: string }).key

		if (!VALID_KEYS.includes(key as keyof MnsConfigFile)) {
			consola.error(`Unknown config key: "${key}". Valid keys: ${VALID_KEYS.join(', ')}`)
			process.exit(1)
		}

		const resolved = resolveModelConfig()

		// Map key to resolved value
		const valueMap: Record<string, string> = {
			geminiModel: resolved.geminiModel
		}

		consola.log(`${key} = ${valueMap[key]}`)
	}
})

const setCommand = defineCommand({
	meta: {
		name: 'set',
		description: 'Set a configuration value in ~/.config/mns/config.json'
	},
	args: {
		key: {
			type: 'positional',
			description: `Config key (${VALID_KEYS.join(', ')})`,
			required: true
		},
		value: {
			type: 'positional',
			description: 'Value to set',
			required: true
		}
	},
	run: async (ctx) => {
		const { key, value } = ctx.args as { key: string; value: string }

		if (!VALID_KEYS.includes(key as keyof MnsConfigFile)) {
			consola.error(`Unknown config key: "${key}". Valid keys: ${VALID_KEYS.join(', ')}`)
			process.exit(1)
		}

		writeGlobalConfig({ [key]: value } as Partial<MnsConfigFile>)
	}
})

export const configCommand = defineCommand({
	meta: {
		name: 'config',
		description: 'Get or set MNS configuration values'
	},
	subCommands: {
		get: getCommand,
		set: setCommand
	},
	run: async () => {
		consola.log('Usage: mns config <get|set> <key> [value]')
		consola.log(`Keys: ${VALID_KEYS.join(', ')}`)
	}
})
