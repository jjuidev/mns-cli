---
phase: 1
status: completed
priority: high
completed: 2026-04-02
---

# Phase 1 — Add ProgressEvent Types

## Overview

Add the `ProgressEvent` discriminated union type to the type system and export it from the public barrel.

## Key Insights

- `ProgressEvent` must be a discriminated union on `stage` so consumers get TypeScript narrowing
- `stage: 'done'` carries `MeetingNotes` result — avoids relying on generator return value, easier to serialize over SSE/WebSocket
- Types go in `src/types/index.ts` alongside existing `MeetingNotes`, `AnalyzeOptions`, etc.

## Files to Modify

| File | Action |
|------|--------|
| `src/types/index.ts` | Add `ProgressEvent` type (append at end) |

No new files needed.

## Implementation Steps

### Step 1: Add ProgressEvent to `src/types/index.ts`

Append after the existing `AudioChunk` interface (line ~128):

```typescript
/**
 * Progress events yielded by the analyzeVideo() AsyncGenerator.
 * Discriminated union on `stage` — use switch/if narrowing in consumers.
 */
export type ProgressEvent =
  | { stage: 'validating' }
  | { stage: 'extracting_audio'; duration: number }
  | { stage: 'chunking'; totalChunks: number }
  | { stage: 'transcribing'; chunk: number; total: number; percent: number }
  | { stage: 'summarizing' }
  | { stage: 'saving'; outputPath: string }
  | { stage: 'done'; result: MeetingNotes }
```

### Step 2: Verify export chain

`src/types/index.ts` already uses named exports — `ProgressEvent` will be auto-exported.

`src/index.ts` will re-export it in Phase 3. No barrel changes needed in this phase.

## Todo

- [x] Add `ProgressEvent` type to `src/types/index.ts`
- [x] Verify `tsc` compiles without errors

## Success Criteria

- `ProgressEvent` type exists in `src/types/index.ts`
- Type is a discriminated union with 7 stage variants
- `stage: 'done'` variant includes `result: MeetingNotes`
- No compile errors
