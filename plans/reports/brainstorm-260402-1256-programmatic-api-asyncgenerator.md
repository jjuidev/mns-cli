# Brainstorm Report — Programmatic API + AsyncGenerator Progress

**Date:** 2026-04-02
**Status:** Agreed ✅

---

## Problem Statement

`mns-cli` hiện chỉ có CLI interface. Cần expose programmatic API để tích hợp vào React app (hoặc bất kỳ Node.js app nào) với real-time progress streaming.

## Requirements

- Import trực tiếp như thư viện: `import { analyzeVideo } from '@jjuidev/mns-cli'`
- Real-time progress: streaming từng stage, từng chunk
- Work với mọi consumer: React Server Actions, Next.js API routes, Bun, Node backends
- Cancellable
- Type-safe

---

## Approaches Evaluated

| Approach | Verdict |
|----------|---------|
| `onProgress(stage, data)` callback fn | ❌ Không cancellable, không streamable |
| `EventEmitter` / `on('stage', handler)` | ⚠️ Verbose, not idiomatic với async/await |
| **AsyncGenerator `for await...of`** | ✅ **Chosen** |

---

## Agreed Design

### ProgressEvent — discriminated union

```typescript
type ProgressEvent =
  | { stage: 'validating' }
  | { stage: 'extracting_audio'; duration: number }
  | { stage: 'chunking'; totalChunks: number }
  | { stage: 'transcribing'; chunk: number; total: number; percent: number }
  | { stage: 'summarizing' }
  | { stage: 'saving'; outputPath: string }
  | { stage: 'done'; result: MeetingNotes }
```

### Public API

```typescript
// src/index.ts
export async function* analyzeVideo(
  videoPath: string,
  options?: Partial<AnalyzeOptions>
): AsyncGenerator<ProgressEvent> {
  yield { stage: 'validating' }
  yield { stage: 'extracting_audio', duration: metadata.duration }
  yield { stage: 'chunking', totalChunks: chunks.length }
  // per-chunk progress from transcriber:
  yield { stage: 'transcribing', chunk: i, total: n, percent: Math.round(i/n*100) }
  yield { stage: 'summarizing' }
  yield { stage: 'saving', outputPath }
  yield { stage: 'done', result: meetingNotes }
}
```

### Consumer pattern

```typescript
for await (const event of analyzeVideo('meeting.mp4', opts)) {
  if (event.stage === 'transcribing') setProgress(event.percent)
  if (event.stage === 'done') setNotes(event.result)
}
```

### Cancellation

`gen.return()` — built-in generator method, KISS. AbortSignal deferred (YAGNI).

---

## Implementation Scope

**Files to change:**
1. `src/types/index.ts` — add `ProgressEvent` discriminated union
2. `src/index.ts` — implement `analyzeVideo()` generator (refactor từ `commands/analyze/index.ts`)
3. `src/services/transcriber.ts` — thread per-chunk progress callback để generator có thể yield
4. `src/providers/gemini-provider.ts` — pass progress callback xuống transcriber

**No changes needed:**
- CLI command (`commands/analyze/index.ts`) — vẫn dùng như cũ, gọi services trực tiếp
- Services logic — chỉ thêm optional `onChunkProgress` callback param

---

## Key Decisions

- `stage: 'done'` chứa result thay vì dùng generator return value → type-safe hơn, dễ serialize qua SSE/WebSocket
- Không thay đổi CLI — programmatic API là layer mới trên services
- `ProgressEvent` là discriminated union → consumer có TypeScript narrowing tốt

---

## Risks

- `transcriber.ts` cần refactor nhỏ để nhận `onChunkProgress` callback — low risk, additive change
- Parallel transcription cần thread progress correctly (chunk index + total)
