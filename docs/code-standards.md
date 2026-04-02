# Code Standards — MNS CLI

## File Organization

```
src/
├── cli.ts                      # Single entry point
├── commands/                   # Command modules (no default exports)
│   ├── analyze/index.ts
│   ├── config/index.ts
│   └── index.ts                # Barrel export
├── providers/                  # Provider implementations + interface
│   ├── types.ts                # TranscribeProvider interface
│   ├── gemini-provider.ts      # Gemini implementation
│   └── index.ts                # Barrel export
├── services/                   # Business logic (no default exports)
│   ├── video-processor.ts
│   ├── audio-chunker.ts
│   ├── transcriber.ts
│   ├── summarizer.ts
│   └── cleanup.ts
├── utils/                      # Utilities & helpers (no default exports)
│   ├── config.ts
│   ├── output.ts
│   └── ...
├── types/index.ts              # Shared TypeScript interfaces
└── build.ts                    # Build script
```

---

## Naming Conventions

- **Files:** kebab-case with descriptive names (`video-processor.ts`, `audio-chunker.ts`)
- **Functions/variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Types/interfaces:** PascalCase (`TranscribeProvider`, `ProcessingConfig`, `AudioChunk`)
- **Barrel exports:** `index.ts` in each module directory

---

## Code Patterns

### 1. Arrow Functions (Preferred)
```typescript
// ✅ Good
const processVideo = (path: string): void => {
  // implementation
}

export const extractAudio = async (videoPath: string): Promise<string> => {
  // implementation
}
```

### 2. No Default Exports
```typescript
// ✅ Good (named export)
export const analyzeCommand = defineCommand({ /* ... */ })

// ❌ Bad (default export)
export default analyzeCommand
```

### 3. Barrel Exports (`index.ts`)
```typescript
// src/providers/index.ts
export { GeminiProvider } from './gemini-provider'
export type { TranscribeProvider } from './types'
export * from './types'
```

### 4. Logging (Consola)
```typescript
import { consola } from 'consola'

const logger = consola.withTag('analyze')
logger.info('Processing started')
logger.error('Failed to process', error)
logger.debug('Chunk data', { offset, duration })
```

### 5. Async/Error Handling
```typescript
// ✅ Good — try/catch + descriptive errors
const transcribeChunk = async (path: string, model: string): Promise<string> => {
  try {
    const response = await provider.transcribe({ path, model })
    return response.text
  } catch (error) {
    logger.error('Transcription failed', { path, error })
    throw new Error(`Failed to transcribe: ${error.message}`)
  }
}
```

### 6. Type Definitions
```typescript
// ✅ Good — centralized, reusable types
export interface ProcessingConfig {
  geminiApiKey?: string
  geminiModel: string
  maxChunkDuration: number
  enableParallel: boolean
  maxParallelChunks: number
  outputDir: string
}

// ✅ Type guard
const isValidConfig = (config: unknown): config is ProcessingConfig => {
  return typeof config === 'object' && config !== null && 'geminiModel' in config
}
```

---

## File Size & Modularization

- **Keep individual files ≤ 200 LOC** for optimal context management
- **Split large modules** into focused submodules
- **Example:** `transcriber.ts` (transcription logic) + `audio-chunker.ts` (chunk management)

---

## Configuration Management

- **Priority chain:** CLI flag → ENV → project config → global config → default
- **Config file locations:**
  - Project: `.mns.json` (JSONC format)
  - Global: `~/.config/mns/config.json`
- **Environment variables:** `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `MNS_MODEL`

---

## Testing Approach

- ESLint + Prettier for code quality (pre-commit via husky)
- Manual testing via `mns analyze <file>` (real Gemini API calls)
- Verify: output format, language handling, cleanup, error messages

---

## Documentation

- **README.md:** Quick start & CLI options
- **docs/:** Architecture, setup guides, standards (this file)
- **Code comments:** Explain *why*, not *what*. Keep minimal but clear.
- **Type annotations:** Always explicit for public APIs

---

## Principles

1. **YAGNI** — Don't add features before they're needed
2. **KISS** — Keep logic simple & readable
3. **DRY** — Reuse logic via functions/utils
4. **Single Responsibility** — Each file/function does one thing well
5. **Type Safety** — Leverage TypeScript for early error detection

---

## Anti-Patterns (Avoid)

- ❌ Default exports (use named exports)
- ❌ Mixing business logic with CLI rendering
- ❌ Hardcoded config values in source
- ❌ Long functions (>50 LOC without clear reason)
- ❌ Silent error swallowing (always log + re-throw or handle)
- ❌ Any provider implementation beyond Gemini (use interface contract)
