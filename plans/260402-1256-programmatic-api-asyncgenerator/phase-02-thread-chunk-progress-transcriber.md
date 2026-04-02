---
phase: 2
status: completed
priority: high
completed: 2026-04-02
---

# Phase 2 — Thread Chunk Progress in Transcriber

## Overview

Add optional `onChunkProgress` callback to `transcribeAudio()` so the AsyncGenerator in Phase 3 can yield per-chunk progress events. Additive change — no existing behavior modified.

## Key Insights

- `transcribeAudio()` handles both sequential and parallel paths — both need progress reporting
- **Sequential path**: call `onChunkProgress` after each chunk completes in the `for` loop
- **Parallel path**: use `Promise.allSettled` pattern with individual `.then()` handlers to report as each chunk finishes (not after all complete)
- Callback signature: `(completedChunk: number, totalChunks: number) => void`
- `GeminiProvider.transcribe()` must pass the callback through

## Files to Modify

| File | Action |
|------|--------|
| `src/services/transcriber.ts` | Add `onChunkProgress` optional param to `transcribeAudio()`, wire into both paths |
| `src/providers/gemini-provider.ts` | Forward `onChunkProgress` from provider options to `transcribeAudio()` |
| `src/providers/types.ts` | Add `onChunkProgress` to `ProviderTranscribeOptions` |

## Implementation Steps

### Step 1: Add callback param to `transcribeAudio()` in `src/services/transcriber.ts`

Add `onChunkProgress` to the options object (line 18-27):

```typescript
export const transcribeAudio = async (options: {
  apiKey: string
  audioPath: string
  chunks?: AudioChunk[]
  sourceLanguage?: string
  targetLanguage?: string
  enableParallel?: boolean
  verbose?: boolean
  model?: string
  onChunkProgress?: (completedChunk: number, totalChunks: number) => void  // NEW
}): Promise<Transcript> => {
```

### Step 2: Wire into sequential path (line 52-59)

Current code:
```typescript
for (const chunk of options.chunks) {
  const result = await transcribeChunk(genAI, chunk, options.sourceLanguage, options.verbose, model)
  fullText += result.text + '\n'
  segments.push(...result.segments)
}
```

Change to:
```typescript
for (let i = 0; i < options.chunks.length; i++) {
  const chunk = options.chunks[i]
  const result = await transcribeChunk(genAI, chunk, options.sourceLanguage, options.verbose, model)
  fullText += result.text + '\n'
  segments.push(...result.segments)
  options.onChunkProgress?.(i + 1, options.chunks.length)
}
```

### Step 3: Wire into parallel path (lines 37-50)

Current code calls `transcribeChunksParallel()` and gets results all at once. The parallel function uses `Promise.all`.

Change `transcribeChunksParallel` to accept + invoke the callback. Replace lines 90-100:

```typescript
const transcribeChunksParallel = async (
  genAI: GoogleGenAI,
  chunks: AudioChunk[],
  sourceLanguage?: string,
  verbose?: boolean,
  model?: string,
  onChunkProgress?: (completedChunk: number, totalChunks: number) => void  // NEW
): Promise<Array<{ text: string; segments: TranscriptSegment[] }>> => {
  let completed = 0
  const total = chunks.length

  const promises = chunks.map((chunk) =>
    transcribeChunk(genAI, chunk, sourceLanguage, verbose, model).then((result) => {
      completed++
      onChunkProgress?.(completed, total)
      return result
    })
  )

  return Promise.all(promises)
}
```

And update the call site (line 39-45) to pass the callback:

```typescript
const results = await transcribeChunksParallel(
  genAI,
  options.chunks,
  options.sourceLanguage,
  options.verbose,
  model,
  options.onChunkProgress  // NEW
)
```

### Step 4: Add to `ProviderTranscribeOptions` in `src/providers/types.ts`

Add to the interface (after line 15):

```typescript
export interface ProviderTranscribeOptions {
  audioPath: string
  chunks?: AudioChunk[]
  sourceLanguage?: string
  targetLanguage?: string
  enableParallel?: boolean
  verbose?: boolean
  onChunkProgress?: (completedChunk: number, totalChunks: number) => void  // NEW
}
```

### Step 5: Forward in `GeminiProvider.transcribe()` in `src/providers/gemini-provider.ts`

Add `onChunkProgress` to the object passed to `transcribeAudio()` (line 22-31):

```typescript
async transcribe(options: ProviderTranscribeOptions): Promise<Transcript> {
  return transcribeAudio({
    apiKey: this.config.geminiApiKey!,
    audioPath: options.audioPath,
    chunks: options.chunks,
    sourceLanguage: options.sourceLanguage,
    targetLanguage: options.targetLanguage,
    enableParallel: options.enableParallel,
    verbose: options.verbose,
    model: this.config.geminiModel,
    onChunkProgress: options.onChunkProgress  // NEW
  })
}
```

## Todo

- [x] Add `onChunkProgress` param to `transcribeAudio()` options
- [x] Wire callback into sequential transcription loop
- [x] Wire callback into `transcribeChunksParallel()`
- [x] Add `onChunkProgress` to `ProviderTranscribeOptions` interface
- [x] Forward callback in `GeminiProvider.transcribe()`
- [x] Verify `tsc` compiles without errors

## Success Criteria

- `onChunkProgress` is optional — omitting it changes nothing (backward compatible)
- Sequential path: callback fires after each chunk
- Parallel path: callback fires as each promise resolves (not all at once)
- CLI command (`commands/analyze/index.ts`) unchanged — doesn't pass callback
- No compile errors

## Risk Assessment

- **Low**: purely additive — optional param, existing callers unaffected
- **Note**: parallel path `completed` counter is safe because `.then()` callbacks run on the microtask queue (single-threaded JS)
