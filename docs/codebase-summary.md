# Codebase Summary — MNS CLI

## Overview

MNS (Meeting Notes CLI) is a Node.js + TypeScript library + CLI that transcribes video/audio meetings and generates comprehensive meeting notes using the Gemini API. Dual entry points: **CLI** (`mns analyze`) or **AsyncGenerator API** (`analyzeVideo()`). Single-provider architecture — no fallback chain.

---

## Project Structure

```
mns-cli/
├── src/
│   ├── index.ts                        # Public AsyncGenerator API (analyzeVideo)
│   ├── cli.ts                          # Main CLI entry point
│   ├── types/
│   │   └── index.ts                    # Shared TypeScript interfaces + ProgressEvent
│   ├── utils/
│   │   ├── config.ts                   # Config loading + priority chain
│   │   ├── constants.ts                # DEFAULT_GEMINI_MODEL
│   │   ├── format-timestamp.ts         # Timestamp formatting (shared)
│   │   ├── transcript-only-notes-builder.ts  # Fallback notes (safety net)
│   │   └── ... (other utilities)
│   ├── services/
│   │   ├── transcriber.ts              # Gemini transcription service
│   │   ├── summarizer.ts               # Gemini summarization service
│   │   └── ... (other services)
│   ├── providers/
│   │   ├── types.ts                    # TranscribeProvider interface + errors
│   │   ├── gemini-provider.ts          # GeminiProvider implementation
│   │   └── index.ts                    # Barrel export
│   ├── commands/
│   │   ├── analyze/
│   │   │   └── index.ts                # Main `mns analyze` command
│   │   ├── config/
│   │   │   └── index.ts                # `mns config get/set` subcommands
│   │   └── index.ts                    # Command exports
│   └── ...
├── docs/
│   ├── codebase-summary.md             # This file
│   ├── system-architecture.md          # Architecture & data flow
│   ├── gemini-setup-guide.md           # API key setup & model selection
│   └── ...
├── dist/                               # Compiled output
├── package.json
├── tsconfig.json
├── bun.lock
└── README.md
```

---

## Entry Points

### CLI (`mns analyze`)
**File:** `src/cli.ts` + `src/commands/analyze/index.ts`

Full-featured command-line interface for end-users:
```bash
mns analyze video.mp4 --model gemini-2.5-flash --target-language Vietnamese
```

### Programmatic API (`analyzeVideo()`)
**File:** `src/index.ts`

AsyncGenerator-based API for library consumers. Yields real-time `ProgressEvent` updates:

```typescript
import { analyzeVideo, type ProgressEvent } from '@jjuidev/mns-cli'

for await (const event of analyzeVideo('meeting.mp4', {
  sourceLanguage: 'English',
  targetLanguage: 'Vietnamese'
})) {
  if (event.stage === 'validating') console.log('Validating file...')
  if (event.stage === 'extracting_audio') console.log(`Duration: ${event.duration}s`)
  if (event.stage === 'chunking') console.log(`${event.totalChunks} chunks created`)
  if (event.stage === 'transcribing') console.log(`${event.percent}% transcribed`)
  if (event.stage === 'summarizing') console.log('Generating notes...')
  if (event.stage === 'saving') console.log(`Saved to ${event.outputPath}`)
  if (event.stage === 'done') console.log(event.result)
}
```

**Public Exports:**
- `analyzeVideo(videoPath, options)` — Main AsyncGenerator
- `AnalyzeVideoOptions` — Configuration interface
- Re-exported types: `ProgressEvent`, `MeetingNotes`, `Transcript`, `TranscriptSegment`

---

## Key Modules

### 1. **Provider Layer** (`src/providers/`)

Thin abstraction over Gemini API calls.

**Files:**
- `types.ts` — `TranscribeProvider` interface, `ProviderTranscribeOptions` (+ `onChunkProgress` callback), `NoProviderAvailableError`
- `gemini-provider.ts` — Wraps `transcribeAudio` + `generateMeetingNotes` services

**Flow:**
```
new GeminiProvider(config) → isAvailable()? → transcribe(onChunkProgress?) → summarize()
```

### 2. **Config System** (`src/utils/config.ts` + `src/commands/config/`)

5-level priority chain for model + API key resolution.

**Priority Order:**
```
CLI flag (--model)
  → ENV var (MNS_MODEL)
  → Project config (.mns.json)
  → Global config (~/.config/mns/config.json)
  → Default (gemini-3.1-pro-preview)
```

**Config key:** `geminiModel`

```bash
mns config set geminiModel gemini-2.0-flash   # Write to global config
mns config get geminiModel                    # Read resolved value
mns analyze video.mp4 --model gemini-2.5-flash  # CLI flag (highest priority)
```

### 3. **Analyze Command** (`src/commands/analyze/index.ts`)

Orchestrates the full pipeline: config → init Gemini → extract audio → chunk → transcribe → summarize → save.

---

## Type Definitions

### `ProgressEvent` (Public API)

Discriminated union yielded by `analyzeVideo()` (7 variants):

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

### `AnalyzeVideoOptions` (Public API)

```typescript
interface AnalyzeVideoOptions {
  sourceLanguage?: string     // default: 'English'
  targetLanguage?: string     // default: 'Vietnamese'
  context?: string
  outputDir?: string
  keepSource?: boolean        // default: true
  parallel?: boolean
  model?: string
  verbose?: boolean
}
```

### `ProcessingConfig` (`src/types/index.ts`)

```typescript
export interface ProcessingConfig {
  geminiApiKey?: string
  geminiModel: string
  ffmpegPath?: string
  maxChunkDuration: number
  enableParallel: boolean
  maxParallelChunks: number
  outputDir: string
}
```

### `MnsConfigFile` (`src/types/index.ts`)

```typescript
export interface MnsConfigFile {
  env?: { GEMINI_API_KEY?: string }
  model?: { gemini?: string }
  geminiApiKey?: string   // flat backward-compat
  geminiModel?: string    // flat backward-compat
  [key: string]: unknown
}
```

### `TranscribeProvider` (`src/providers/types.ts`)

```typescript
export interface TranscribeProvider {
  readonly name: string
  readonly supportsSummarize: boolean
  isAvailable(): Promise<boolean>
  transcribe(options: ProviderTranscribeOptions): Promise<Transcript>
  summarize?(options: ProviderSummarizeOptions): Promise<MeetingNotes>
}
```

---

## Dependencies

- `@google/genai` — Gemini API
- `consola` — Logging
- `citty` — CLI framework
- `execa` — Subprocess execution (FFmpeg)
- FFmpeg (system binary, required for audio extraction)

---

## Development Workflow

### Modifying Config Priority
Edit `resolveModelConfig()` in `src/utils/config.ts`.

### Testing
```bash
export GEMINI_API_KEY=xxx
mns analyze sample.mp4
```

### Build
```bash
bun run build    # Compiles to dist/
```

---

## Error Handling

**Missing API key** — `analyze` command prints error and exits:
```
No Gemini API key found. Set GEMINI_API_KEY or GOOGLE_API_KEY.
```

---

## Performance Notes

- **Gemini:** ~$0.45 per 3-hour meeting, high-quality transcription + summarization
- **Parallel Processing:** Recommended for files >30 min (`--parallel`, auto-detected by RAM)

---

## Related Documentation

- [System Architecture](./system-architecture.md) — Data flow & component design
- [Gemini Setup Guide](./gemini-setup-guide.md) — API key setup & model selection
- [README.md](../README.md) — Quick start & CLI options
