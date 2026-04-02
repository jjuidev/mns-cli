# System Architecture — Gemini-Only

## Dual Entry Points

```
┌─── CLI (mns analyze) ──────────┬─── Programmatic API (analyzeVideo()) ───┐
│                                 │                                          │
│ User Command:                   │ Consumer Code (TypeScript/JavaScript):   │
│   mns analyze meeting.mp4       │   const gen = analyzeVideo(path)        │
│                                 │   for await (const e of gen) { ... }    │
└────────────────┬────────────────┴───────────────┬──────────────────────────┘
                 │                                │
                 └────────────┬───────────────────┘
                              ↓
                    Unified Processing Pipeline
                    (src/index.ts logic)
```

Both entry points share the same underlying pipeline; CLI wraps the AsyncGenerator for terminal output, programmatic API yields real-time `ProgressEvent` objects.

---

## Config Loading Pipeline

**File:** `src/utils/config.ts`

```
Input: { cliModel?: string }
    ↓
┌──────────────────────────────────────┐
│  resolveModelConfig(cliModel)        │
│  (applies full priority chain)       │
└──────────────────────────────────────┘
    ↓
    ├─ CLI flag? (cliModel)                        → DONE
    ├─ ENV var? (process.env.MNS_MODEL)           → DONE
    ├─ Project config? (read .mns.json)           → DONE
    ├─ Global config? (read ~/.config/mns/...)    → DONE
    └─ Default? ('gemini-3.1-pro-preview')        → DONE
    ↓
Result: { geminiModel: string }
```

### Config Files

**Project-level:** `.mns.json` (in project root)
```json
{
  "model": { "gemini": "gemini-2.0-flash" }
}
```

**Global-level:** `~/.config/mns/config.json`
```json
{
  "geminiModel": "gemini-2.5-flash"
}
```

**Environment Variables**
```bash
GEMINI_API_KEY=xxx        # Gemini auth (also accepts GOOGLE_API_KEY)
MNS_MODEL=gemini-2.0-flash  # Model override
```

---

## Processing Pipeline Details (AsyncGenerator)

**File:** `src/index.ts`

The `analyzeVideo()` async generator orchestrates the full pipeline and yields `ProgressEvent` at each stage:

```
┌─────────────────────────────────────────────────────────────┐
│  Load Config (Priority Chain)                               │
│  • CLI flag > ENV > .mns.json > ~/.config/mns > defaults   │
│  • Result: ProcessingConfig with geminiModel resolved       │
└─────────────────────────────────────────────────────────────┘
    ↓ yield: { stage: 'validating' }
┌─────────────────────────────────────────────────────────────┐
│  Validate & Get Video Metadata                              │
│  • Check file exists + readable                             │
│  • Extract duration for UI feedback                         │
└─────────────────────────────────────────────────────────────┘
    ↓ yield: { stage: 'extracting_audio', duration }
┌─────────────────────────────────────────────────────────────┐
│  Init GeminiProvider & Extract Audio                        │
│  • Requires GEMINI_API_KEY or GOOGLE_API_KEY               │
│  • FFmpeg: video → WAV (temp dir)                          │
│  • If key missing → error + exit                            │
└─────────────────────────────────────────────────────────────┘
    ↓ yield: { stage: 'chunking', totalChunks }
┌─────────────────────────────────────────────────────────────┐
│  Chunk Audio (15min max per chunk)                          │
│  • Split WAV into ~900s segments                            │
│  • Track offsets for timestamp reconstruction               │
└─────────────────────────────────────────────────────────────┘
    ↓ onChunkProgress callback (collected & yielded after)
┌─────────────────────────────────────────────────────────────┐
│  Transcribe (GeminiProvider.transcribe + onChunkProgress)   │
│  • Sequential or parallel processing across chunks          │
│  • Yields: { stage: 'transcribing', percent, chunk, total } │
│  • Returns: Transcript with segments + timestamps           │
└─────────────────────────────────────────────────────────────┘
    ↓ yield: { stage: 'summarizing' }
┌─────────────────────────────────────────────────────────────┐
│  Summarize (GeminiProvider.summarize)                       │
│  • Runs LLM summarization → MeetingNotes                   │
└─────────────────────────────────────────────────────────────┘
    ↓ yield: { stage: 'saving', outputPath }
┌─────────────────────────────────────────────────────────────┐
│  Save & Cleanup                                             │
│  • Write .md file to output dir                             │
│  • Remove temp files (audio chunks, .mns-temp dir)         │
│  • Optionally keep/delete source video                      │
└─────────────────────────────────────────────────────────────┘
    ↓ yield: { stage: 'done', result: MeetingNotes }
         Return final MeetingNotes object
```

**Push-to-Pull Bridge:** `onChunkProgress` callbacks from the transcriber are collected into an array, then yielded after transcription completes (bridges push callback model with pull-based AsyncGenerator model).

---

## Gemini Integration

**File:** `src/providers/gemini-provider.ts`

**Availability Check:**
```typescript
async isAvailable(): Promise<boolean> {
  return !!this.config.geminiApiKey
}
```

**Transcription:**
- Wraps `transcribeAudio()` from `src/services/transcriber.ts`
- Passes `config.geminiModel` for model selection
- Returns normalized `Transcript`

**Summarization:**
- Wraps `generateMeetingNotes()` from `src/services/summarizer.ts`
- Supports language translation
- Returns `MeetingNotes`

**Capabilities:**
- ✅ Transcription: High accuracy, multilingual
- ✅ Summarization: Full meeting notes with sections
- 💰 Cost: ~$0.45 per 3-hour meeting

---

## Timestamp Normalization

**File:** `src/utils/format-timestamp.ts`

When audio is split into 15-minute chunks, provider responses contain relative times (0–900s). Timestamps are reconstructed by adding the chunk start offset:

```typescript
// Chunk 0: offset 0s | Chunk 1: offset 900s | Chunk 2: offset 1800s
const normalizeSegments = (
  rawSegments: { start: number; end: number; text: string }[],
  chunkOffsetSec: number
): TranscriptSegment[] =>
  rawSegments.map(seg => ({
    timestamp: buildSegmentTimestamp(seg.start + chunkOffsetSec, seg.end + chunkOffsetSec),
    text: seg.text.trim(),
  }))
```

---

## Config Management Command

**File:** `src/commands/config/index.ts`

```bash
mns config set geminiModel gemini-2.0-flash   # Write to ~/.config/mns/config.json
mns config get geminiModel                    # Read with full priority chain applied
```

**Supported key:** `geminiModel`

---

## Error Handling

**Missing API key** — `analyze` command exits with clear message:
```
No Gemini API key found. Set GEMINI_API_KEY or GOOGLE_API_KEY.
```

---

## Parallel Processing

```
Sequential:   chunk-0 → chunk-1 → chunk-2   (~180s)
Parallel:     chunk-0 ─┬─ transcribe ─→ merge segments   (~60s)
              chunk-1 ─┤
              chunk-2 ─┘
```

Config: `enableParallel: boolean`, `maxParallelChunks: number`

---

## Related Documentation

- [Codebase Summary](./codebase-summary.md) — Module overview & type definitions
- [Gemini Setup Guide](./gemini-setup-guide.md) — API key setup & model selection
- [README.md](../README.md) — Quick start & CLI usage
