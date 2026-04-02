---
status: completed
priority: P2
effort: ~2.5h
tags: [feature, api, backend]
branch: main
created: 2026-04-02
completed: 2026-04-02
---

# Programmatic API with AsyncGenerator Progress Streaming

## Overview

Expose `analyzeVideo()` as a public AsyncGenerator API in `src/index.ts` so consumers can `import { analyzeVideo } from '@jjuidev/mns-cli'` and receive real-time `ProgressEvent` updates via `for await...of`.

## Context Links

- Brainstorm: `plans/reports/brainstorm-260402-1256-programmatic-api-asyncgenerator.md`
- CLI pipeline reference: `src/commands/analyze/index.ts`
- Package exports: `package.json` (already has `exports["."]` pointing to `src/index.ts`)
- Build: `src/build.ts` (CJS + ESM entries = `src/index.ts`)

## Design Summary

- **ProgressEvent** discriminated union — 7 stages, final `done` carries `MeetingNotes`
- **`analyzeVideo()`** AsyncGenerator — mirrors CLI pipeline, yields events
- **Transcriber callback** — optional `onChunkProgress` param threaded into parallel + sequential paths
- **Cancellation** — `gen.return()` (built-in), no AbortSignal (YAGNI)
- **No CLI changes** — `commands/analyze/index.ts` unchanged

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Add ProgressEvent types | Completed | [phase-01](./phase-01-add-progress-event-types.md) |
| 2 | Thread chunk progress in transcriber | Completed | [phase-02](./phase-02-thread-chunk-progress-transcriber.md) |
| 3 | Implement analyzeVideo generator | Completed | [phase-03](./phase-03-implement-analyzevideo-generator.md) |
| 4 | Build verification | Completed | [phase-04](./phase-04-build-verification.md) |

## Key Constraints

- YAGNI / KISS / DRY
- Do NOT change CLI behavior
- Do NOT export services individually — only `analyzeVideo` + types
- `src/index.ts` under 100 lines
- No new dependencies
- Package `exports["."]` already points to `src/index.ts` — no `package.json` changes needed

## Risk Assessment

- **Low**: transcriber callback is additive (optional param)
- **Low**: parallel transcription chunk-index tracking is straightforward with `Promise.all` index mapping
- **Medium**: `src/index.ts` line count — may need to extract a helper if pipeline exceeds 100 lines
