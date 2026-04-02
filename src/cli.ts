import { defineCommand, runMain } from 'citty'

import { description, name, version } from '../package.json'
import { lsCommand, analyzeCommand, configCommand } from '@/commands'
import { displayBanner } from '@/utils/banner'

// Main CLI entry point — add new subcommands to the subCommands map
const main = defineCommand({
	meta: {
		name,
		version,
		description
	},
	subCommands: {
		ls: lsCommand,
		analyze: analyzeCommand,
		config: configCommand
	},
	run: async () => {
		displayBanner()
		console.log(`Run ${name} --help for available commands.`)
	}
})

runMain(main)
