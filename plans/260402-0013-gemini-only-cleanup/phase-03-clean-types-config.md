---
phase: 3
title: Clean Types & Config
status: completed
priority: high
effort: 25min
blockedBy: [phase-01]
completed: 2026-04-02
---

# Phase 03 — Clean Types & Config

## Overview
Remove all Groq/Whisper fields from types, config resolution, and constants. Simplify `ProcessingConfig` and `MnsConfigFile` to Gemini-only.

## Files to MODIFY

### `src/types/index.ts`

**`ProcessingConfig` — remove fields:**
```typescript
// REMOVE:
groqApiKey?: string
groqTranscribeModel: string
groqSummarizeModel: string
whisperModel: string

// KEEP:
geminiApiKey?: string
geminiModel: string
// + all non-provider fields (ffmpegPath, maxChunkDuration, etc.)
```

**`MnsConfigFile` — remove fields:**
```typescript
// REMOVE from env?: {}:
GROQ_API_KEY?: string

// REMOVE from model?: {}:
groqTranscribe?: string
groqSummarize?: string
whisper?: string

// REMOVE flat backward-compat keys:
groqApiKey?: string
groqTranscribeModel?: string
groqSummarizeModel?: string
whisperModel?: string
```

### `src/utils/constants.ts`

**Remove:**
```typescript
export const DEFAULT_GROQ_TRANSCRIBE_MODEL = 'whisper-large-v3'   // DELETE
export const DEFAULT_GROQ_SUMMARIZE_MODEL = 'llama-3.3-70b-versatile' // DELETE
export const DEFAULT_WHISPER_MODEL = 'base'                         // DELETE
```

**Keep:**
```typescript
export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-pro-preview'
```

### `src/utils/config.ts`

**`resolveModelConfig` — simplify:**
- Remove `groqTranscribeModel`, `groqSummarizeModel`, `whisperModel` resolution
- Return type becomes `{ geminiModel: string }` only
- Remove imports of `DEFAULT_GROQ_SUMMARIZE_MODEL`, `DEFAULT_GROQ_TRANSCRIBE_MODEL`, `DEFAULT_WHISPER_MODEL`
- Remove `MNS_WHISPER_MODEL` env var handling

**`loadConfig` — simplify:**
- Remove `groqApiKey` resolution block
- Remove `groqApiKey` from returned config object
- Spread `models` still works (now only `{ geminiModel }`)

**New `resolveModelConfig` signature:**
```typescript
export const resolveModelConfig = (cliModel?: string): { geminiModel: string } => { ... }
```

**New `loadConfig` return (relevant fields):**
```typescript
return {
  geminiApiKey,
  ...models,          // { geminiModel }
  maxChunkDuration: 900,
  enableParallel,
  maxParallelChunks: 4,
  outputDir: options.outputDir || './output'
}
```

## Implementation Steps

1. Edit `src/types/index.ts` — remove groq/whisper fields from `ProcessingConfig` and `MnsConfigFile`
2. Edit `src/utils/constants.ts` — remove 3 groq/whisper constants
3. Edit `src/utils/config.ts`:
   - Update imports (remove 3 constants)
   - Simplify `resolveModelConfig` return type + body
   - Remove `groqApiKey` block from `loadConfig`
   - Update returned config object

## Todo
- [ ] Edit `src/types/index.ts` — remove groq/whisper from `ProcessingConfig`
- [ ] Edit `src/types/index.ts` — remove groq/whisper from `MnsConfigFile`
- [ ] Edit `src/utils/constants.ts` — remove `DEFAULT_GROQ_*` and `DEFAULT_WHISPER_*`
- [ ] Edit `src/utils/config.ts` — simplify `resolveModelConfig`
- [ ] Edit `src/utils/config.ts` — remove `groqApiKey` from `loadConfig`
