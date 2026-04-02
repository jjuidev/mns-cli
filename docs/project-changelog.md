# Project Changelog — MNS CLI

## [Unreleased]

### Added

- **Programmatic AsyncGenerator API** (`src/index.ts`)
  - Public `analyzeVideo(videoPath, options)` function for library consumers
  - Real-time `ProgressEvent` yielding (7 stages: validating → extracting_audio → chunking → transcribing → summarizing → saving → done)
  - `AnalyzeVideoOptions` configuration interface (sourceLanguage, targetLanguage, context, outputDir, keepSource, parallel, model, verbose)
  - Full TypeScript support with discriminated union types
  - Consumer example:
    ```typescript
    for await (const event of analyzeVideo('meeting.mp4')) {
      if (event.stage === 'transcribing') console.log(`${event.percent}%`)
      if (event.stage === 'done') console.log(event.result)
    }
    ```

- **Progress Event System** (`src/types/index.ts`)
  - `ProgressEvent` discriminated union with 7 variants
  - Real-time feedback for long-running operations
  - Type-safe event handling via stage narrowing

- **Chunk Progress Callback** (`src/providers/types.ts`, `src/services/transcriber.ts`)
  - `onChunkProgress` optional callback in `ProviderTranscribeOptions`
  - Enables per-chunk transcription progress reporting
  - Integrated into both sequential and parallel transcription paths

### Changed

- **src/index.ts** — New primary export; replaces direct CLI-only interface
- **Type System** — Expanded public API exports (MeetingNotes, Transcript, TranscriptSegment, ProgressEvent)
- **GeminiProvider** — Forwarded `onChunkProgress` callback to transcriber

### Documentation

- Updated `codebase-summary.md` — Added programmatic API section + entry points overview
- Updated `system-architecture.md` — Added AsyncGenerator pipeline flow + processing stages
- Updated `project-roadmap.md` — Marked programmatic API as completed in v0.0.1

---

## [v0.0.1] — Beta Release (Target: Late Q2 2026)

### Core Features

- ✅ Gemini-powered video/audio transcription
- ✅ Automatic meeting notes generation
- ✅ Multi-language support (auto-detect + translation)
- ✅ Parallel chunk processing (15-min chunks)
- ✅ 5-level config priority chain (CLI → ENV → project → global → defaults)
- ✅ Full TypeScript support (ESM + CJS dual export)
- ✅ CLI interface (`mns analyze`, `mns config`)

### Dependencies

- `@google/genai` — Gemini API
- `consola` — Logging
- `citty` — CLI framework
- `execa` — Subprocess execution (FFmpeg)
- FFmpeg system binary required

---

## Known Limitations

- No real-time transcription (batch processing only)
- Single provider (Gemini) — no fallback providers
- Markdown output only (no PDF, DOCX export)
- Manual file management (no built-in storage)
- Web UI not included (planned for v0.2.0+)

