# Programmatic AsyncGenerator API — 2026-04-02

## What
Exposed `analyzeVideo()` as public library API with real-time progress via AsyncGenerator + `ProgressEvent` discriminated union.

## Key Changes
- **7-stage `ProgressEvent` union** in `src/types/index.ts` (validating, extracting_audio, chunking, transcribing, summarizing, saving, done)
- **`onChunkProgress` callback** threaded through `transcriber.ts` → `providers/types.ts` → `gemini-provider.ts`
- **89-line `analyzeVideo()` generator** in `src/index.ts` collecting chunk events, yielding on each stage

## Design Decisions

### Push-to-Pull Bridge
Collected chunk callbacks into array during `provider.transcribe()` await, then yielded them after. 
- Simpler than true streaming (YAGNI)
- Maintains clean generator semantics

### Simplified Scope
- No AbortSignal (use `gen.return()` — built-in)
- Only exported `analyzeVideo` + types (KISS)
- Kept `src/index.ts` under 100 lines by trimming JSDoc verbosity

### Zero Regression
CLI (`commands/analyze/index.ts`) unchanged — purely additive.

## Build Status
✓ `bun run build` (CJS/ESM/CLI/types)
✓ `tsc --noEmit` (0 errors)

## Learned
Keep real-time APIs simple: push callbacks + collect → yield. Avoids premature streaming complexity when batch collection works.
