import { cp, readFile, writeFile } from 'fs/promises'

import { $ } from 'bun'
import { join } from 'pathe'

import { logger } from '@/utils/logger'

// Write a minimal package.json to mark the output dir as CJS or ESM
const writePackageJson = async (type: 'cjs' | 'esm', dir: string) => {
	const pkgType = JSON.stringify({ type: type === 'esm' ? 'module' : 'commonjs' }, null, 2)

	await writeFile(join(dir, 'package.json'), pkgType)
}

// consola is externalised so it is not bundled into dist
const EXTERNAL_DEPS = ['consola']

const buildCJS = async () => {
	logger.log('Building CJS...')

	const result = await Bun.build({
		entrypoints: ['./src/index.ts'],
		outdir: './dist/cjs',
		target: 'node',
		format: 'cjs',
		naming: '[name].cjs',
		external: EXTERNAL_DEPS
	})

	if (!result.success) {
		throw new Error('CJS build failed: ' + result.logs.map((l) => l.message).join(', '))
	}

	await writePackageJson('cjs', 'dist/cjs')
	logger.log('CJS done!')
}

const buildESM = async () => {
	logger.log('Building ESM...')

	const result = await Bun.build({
		entrypoints: ['./src/index.ts'],
		outdir: './dist/esm',
		target: 'node',
		format: 'esm',
		external: EXTERNAL_DEPS
	})

	if (!result.success) {
		throw new Error('ESM build failed: ' + result.logs.map((l) => l.message).join(', '))
	}

	await writePackageJson('esm', 'dist/esm')
	logger.log('ESM done!')
}

const buildCLI = async () => {
	logger.log('Building CLI...')

	const result = await Bun.build({
		entrypoints: ['./src/cli.ts'],
		outdir: './dist/cli',
		target: 'node',
		format: 'esm',
		external: EXTERNAL_DEPS
	})

	if (!result.success) {
		throw new Error('CLI build failed: ' + result.logs.map((l) => l.message).join(', '))
	}

	await writePackageJson('esm', 'dist/cli')

	// Prepend shebang so the binary is directly executable
	const cliPath = 'dist/cli/cli.js'
	const content = await readFile(cliPath, 'utf-8')

	if (!content.startsWith('#!/usr/bin/env node')) {
		await writeFile(cliPath, '#!/usr/bin/env node\n' + content)
	}

	await $`chmod +x ${cliPath}`
	logger.log('CLI done!')
}

const buildTypes = async () => {
	logger.log('Building types...')
	await $`tsc -p tsconfig.types.json`
	await $`tsc-alias -p tsconfig.types.json`
	logger.log('Types done!')
}

// Copy figlet fonts so ASCII art works after install
const copyFonts = async () => {
	logger.log('Copying figlet fonts...')
	await cp(join('node_modules', 'figlet', 'fonts'), 'dist/fonts', { recursive: true })
	logger.log('Fonts copied')
}

const cleanBuild = async () => {
	logger.log('Cleaning...')
	await $`rimraf dist`
	logger.log('Cleaned')
}

const build = async () => {
	await cleanBuild()
	await buildTypes()
	await Promise.all([buildCJS(), buildESM(), buildCLI()])
	await copyFonts()
	logger.log('Build complete!')
}

build().catch(logger.error)
