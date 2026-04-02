import { defineCommand } from 'citty'

import { displayBanner } from '@/utils/banner'
import { logger } from '@/utils/logger'

// ls command — lists all available commands
// TODO: add new commands to this list as they are implemented
export const lsCommand = defineCommand({
	meta: {
		name: 'ls',
		description: 'List all available commands'
	},
	run: async () => {
		displayBanner()
		logger.text('Available commands:\n')

		logger.primary('ls')
		logger.muted('\t- List all available commands')

		// TODO: add more command descriptions here
	}
})
