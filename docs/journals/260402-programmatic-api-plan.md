# Programmatic API Planning — 2026-04-02

## Problem
`mns-cli` CLI-only. Need Node.js/React apps to `import { analyzeVideo }` with real-time progress streaming.

## Evaluated Approaches
- **Callback**: `onProgress(stage, data)` → rejected (not cancellable, unidiomatic)
- **EventEmitter**: verbose, doesn't align with async/await patterns
- **AsyncGenerator** ✓ chosen: native, type-safe, zero deps, built-in cancellation via `gen.return()`

## Design Decisions
- **Export**: `analyzeVideo(videoPath, options?) → AsyncGenerator<ProgressEvent>`
- **ProgressEvent**: Discriminated union (stage-keyed)
  - `validating | extracting_audio | chunking | transcribing | summarizing | saving | done`
  - `stage: 'done'` payload carries `MeetingNotes` result (not generator return)
  - Simpler consumer pattern, SSE/WebSocket serializable
- **No new dependencies** — AsyncGenerator native to Node.js 10+
- **Cancellation**: `gen.return()` built-in, no AbortSignal (YAGNI)
- **No CLI changes** — programmatic layer orthogonal

## Implementation Phases
1. Define `ProgressEvent` type + discriminated union
2. Add callback param to transcriber, emit per-chunk %
3. Implement `analyzeVideo` generator wrapping orchestrator
4. Build verification (no breaking changes to CLI)

## Rationale
AsyncGenerator idiomatic for Node.js async iteration, zero library overhead, cancellable by design, type-safe with discriminated unions, result in event (not return) simplifies protocol for streaming transports.

**Plan repo:** `plans/260402-1256-programmatic-api-asyncgenerator/`
