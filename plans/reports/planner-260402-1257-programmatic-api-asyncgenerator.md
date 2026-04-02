# Planner Report — Programmatic API AsyncGenerator

**Date:** 2026-04-02
**Plan:** `plans/260402-1256-programmatic-api-asyncgenerator/`

---

## Summary

Created 4-phase implementation plan for adding `analyzeVideo()` AsyncGenerator API to `src/index.ts`. Plan covers: types → transcriber callback threading → generator implementation → build verification.

## Key Decisions

- **Chunk progress bridging**: Collect `onChunkProgress` events in array during `provider.transcribe()`, yield after. Simpler than true push-to-pull streaming; still provides per-chunk granularity. True real-time yield would require restructuring transcriber to be an AsyncGenerator itself — deferred (YAGNI).
- **No CLI changes**: Generator calls services directly, same as CLI command does. Two independent consumers of same services.
- **Type re-exports**: `src/index.ts` re-exports `ProgressEvent`, `MeetingNotes`, `AnalyzeOptions`, `Transcript`, `TranscriptSegment` — consumers get everything from one import.
- **`AnalyzeVideoOptions`**: Dedicated interface (not reusing `AnalyzeOptions`) — cleaner API surface, no `videoPath` duplication (it's the first positional arg).
- **`keepSource` defaults to `true`**: Programmatic consumers likely don't want auto-deletion. CLI already defaults to `true`.

## Files Changed (4 phases)

| Phase | File | Change |
|-------|------|--------|
| 1 | `src/types/index.ts` | Add `ProgressEvent` discriminated union |
| 2 | `src/services/transcriber.ts` | Add `onChunkProgress` optional callback param |
| 2 | `src/providers/types.ts` | Add `onChunkProgress` to `ProviderTranscribeOptions` |
| 2 | `src/providers/gemini-provider.ts` | Forward `onChunkProgress` to `transcribeAudio()` |
| 3 | `src/index.ts` | Full `analyzeVideo()` generator + type re-exports |
| 4 | (none) | Build verification only |

## Effort Estimate

~2.5h total. Phase 1 (~15min), Phase 2 (~45min), Phase 3 (~1h), Phase 4 (~30min).

## Unresolved Questions

None — all design decisions resolved in brainstorm.
