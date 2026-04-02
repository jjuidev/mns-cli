[38;2;248;248;242m# Scout Report: Groq, Whisper & Gemini References[0m
[38;2;248;248;242m**Date:** 2026-04-02 | **Scope:** `/docs`, `/README.md`, `/package.json`, `/src`[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 1. Documentation Files Overview[0m

[38;2;248;248;242m### Summary of Docs Structure[0m
[38;2;248;248;242m- **Total docs files scanned:** 5[0m
[38;2;248;248;242m- **Files containing groq/whisper/gemini:** 5 (100%)[0m
[38;2;248;248;242m- **Entry point:** `docs/` contains comprehensive provider architecture documentation[0m

[38;2;248;248;242m| File | Content Summary | References |[0m
[38;2;248;248;242m|------|-----------------|------------|[0m
[38;2;248;248;242m| `system-architecture.md` | Provider chain design, model config pipeline, data flow | Gemini, Groq, LocalWhisper (frequent) |[0m
[38;2;248;248;242m| `provider-chain-guide.md` | User setup guide, cost comparison, troubleshooting | Gemini, Groq, LocalWhisper (frequent) |[0m
[38;2;248;248;242m| `codebase-summary.md` | Module overview, type definitions, architecture highlights | Gemini, Groq, Whisper (moderate) |[0m
[38;2;248;248;242m| `journals/260401-provider-chain-model-config.md` | Implementation decisions, phases, architecture notes | Gemini, Groq, Whisper (moderate) |[0m
[38;2;248;248;242m| `journals/2026-04-01-provider-chain-brainstorm.md` | Problem statement, 3-tier strategy, implementation choices | Gemini, Groq, LocalWhisper (moderate) |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 2. Documentation File Details with Line Numbers[0m

[38;2;248;248;242m### 📄 **docs/system-architecture.md**[0m

[38;2;248;248;242m**Purpose:** Technical deep-dive on provider registry pattern, config loading pipeline, provider implementations, timestamp normalization.[0m

[38;2;248;248;242m**Key sections with groq/whisper/gemini:**[0m

[38;2;248;248;242m| Lines | Content | Provider(s) |[0m
[38;2;248;248;242m|-------|---------|-------------|[0m
[38;2;248;248;242m| 1-48 | High-level design flowchart showing auto-detection chain | Gemini, Groq, LocalWhisper |[0m
[38;2;248;248;242m| 54-97 | Provider Registry Pattern & Decision Tree | Gemini, Groq, LocalWhisper |[0m
[38;2;248;248;242m| 81-97 | Decision tree: GEMINI_API_KEY → GroqProvider (Whisper) → LocalWhisper | All three |[0m
[38;2;248;248;242m| 105-152 | Config Loading Pipeline with priority chain | All three |[0m
[38;2;248;248;242m| 156-287 | **Provider Implementations** (major section) | - |[0m
[38;2;248;248;242m| 158-183 | **GeminiProvider:** availability check, transcription, summarization, capabilities | Gemini |[0m
[38;2;248;248;242m| 186-232 | **GroqProvider:** initialization, Whisper transcription, llama-3.3-70b summarization | Groq (Whisper) |[0m
[38;2;248;248;242m| 205-226 | Groq Whisper API: `/openai/v1/audio/transcriptions` with `whisper-large-v3` | Groq, Whisper |[0m
[38;2;248;248;242m| 217-226 | Groq summarization: `/openai/v1/chat/completions` with `llama-3.3-70b-versatile` | Groq |[0m
[38;2;248;248;242m| 235-296 | **LocalWhisperProvider:** availability check, faster-whisper via Python subprocess | LocalWhisper |[0m
[38;2;248;248;242m| 241-257 | Availability check: `python3 -c "import faster_whisper; print('ok')"` with caching | Whisper |[0m
[38;2;248;248;242m| 260-281 | faster-whisper transcription inline Python script with segment parsing | Whisper |[0m
[38;2;248;248;242m| 288-295 | Model selection: tiny, base, small, medium, large-v3 | Whisper |[0m
[38;2;248;248;242m| 303-343 | Timestamp Normalization & Chunk Offset Handling | All three |[0m
[38;2;248;248;242m| 425-447 | Error Handling: `NoProviderAvailableError` with setup instructions for all three | All three |[0m
[38;2;248;248;242m| 459-523 | **Data Flow Example:** Full workflow with Gemini | Gemini |[0m
[38;2;248;248;242m| 529-545 | Parallel Processing Architecture (applies to all) | - |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m### 📄 **docs/provider-chain-guide.md**[0m

[38;2;248;248;242m**Purpose:** User-facing setup guide with step-by-step instructions for each provider, cost comparison, troubleshooting.[0m

[38;2;248;248;242m**Key sections with groq/whisper/gemini:**[0m

[38;2;248;248;242m| Lines | Content | Provider(s) |[0m
[38;2;248;248;242m|-------|---------|-------------|[0m
[38;2;248;248;242m| 1-80 | Quick Start with 3 setup options | Gemini, Groq, LocalWhisper |[0m
[38;2;248;248;242m| 12-25 | **Option A: Gemini** (best quality, paid) | Gemini |[0m
[38;2;248;248;242m| 28-43 | **Option B: Groq** (free tier, Whisper + llama) | Groq, Whisper |[0m
[38;2;248;248;242m| 40 | Whisper-large-v3 for transcription | Whisper |[0m
[38;2;248;248;242m| 41 | llama-3.3-70b-versatile for summarization | Groq |[0m
[38;2;248;248;242m| 46-58 | **Option C: Local Whisper** (offline, free, transcribe-only) | Whisper |[0m
[38;2;248;248;242m| 61-73 | Provider Selection & Priority (auto-detection chain) | All three |[0m
[38;2;248;248;242m| 80 | Check which provider will be used with `--verbose` | All three |[0m
[38;2;248;248;242m| 87-195 | Advanced Configuration - Model Selection | All three |[0m
[38;2;248;248;242m| 139-152 | Gemini Models (gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-pro) | Gemini |[0m
[38;2;248;248;242m| 153-162 | Groq Transcription Models (whisper-large-v3, whisper-medium) | Groq, Whisper |[0m
[38;2;248;248;242m| 164-173 | Groq Summarization Models (llama-3.3-70b-versatile, llama-3.1-70b-versatile) | Groq |[0m
[38;2;248;248;242m| 175-192 | Local Whisper Models (tiny, base, small, medium, large-v3) | Whisper |[0m
[38;2;248;248;242m| 196-209 | Multi-Provider Setup with fallback strategy | All three |[0m
[38;2;248;248;242m| 221-329 | Troubleshooting section for each provider | All three |[0m
[38;2;248;248;242m| 223-267 | Gemini troubleshooting (API key, quota/billing, connectivity) | Gemini |[0m
[38;2;248;248;242m| 271-291 | Groq troubleshooting (API key, free tier status, base URL verification) | Groq |[0m
[38;2;248;248;242m| 295-328 | LocalWhisper troubleshooting (pip install, disk space, performance) | Whisper |[0m
[38;2;248;248;242m| 331-347 | Summarization Skipped Warning (LocalWhisper limitation) | Whisper |[0m
[38;2;248;248;242m| 391-505 | Configuration Examples (5 scenarios) | All three |[0m
[38;2;248;248;242m| 509-521 | Cost Comparison Table | All three |[0m
[38;2;248;248;242m| 524-550 | API Key Management & Secure Practices | All three |[0m
[38;2;248;248;242m| 562-581 | FAQ section | All three |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m### 📄 **docs/codebase-summary.md**[0m

[38;2;248;248;242m**Purpose:** Module overview, type definitions, architecture highlights for developers.[0m

[38;2;248;248;242m**Key sections with groq/whisper/gemini:**[0m

[38;2;248;248;242m| Lines | Content | Provider(s) |[0m
[38;2;248;248;242m|-------|---------|-------------|[0m
[38;2;248;248;242m| 1-51 | Project structure, provider layer overview | Gemini, Groq, Whisper |[0m
[38;2;248;248;242m| 27-33 | Provider abstractions: `src/providers/` directory (new) | All three |[0m
[38;2;248;248;242m| 156-166 | `TranscribeProvider` interface | All three |[0m
[38;2;248;248;242m| 170-221 | Key Changes: Before/After comparison | Gemini, Groq, Whisper |[0m
[38;2;248;248;242m| 214-218 | Support matrix (Gemini only → multi-provider) | All three |[0m
[38;2;248;248;242m| 231-270 | Development workflow & testing examples | All three |[0m
[38;2;248;248;242m| 275-299 | Error handling with setup instructions | All three |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m### 📄 **docs/journals/260401-provider-chain-model-config.md**[0m

[38;2;248;248;242m**Purpose:** Session notes from implementation (2026-04-01), decisions, phases, files changed.[0m

[38;2;248;248;242m**Key sections with groq/whisper/gemini:**[0m

[38;2;248;248;242m| Lines | Content | Provider(s) |[0m
[38;2;248;248;242m|-------|---------|-------------|[0m
[38;2;248;248;242m| 1-83 | Overview & Architecture Decisions | Gemini, Groq, Whisper |[0m
[38;2;248;248;242m| 11-20 | Provider Registry Pattern (3-tier chain) | Gemini, Groq, Whisper |[0m
[38;2;248;248;242m| 39-59 | Implementation Details | Groq, Whisper |[0m
[38;2;248;248;242m| 39-42 | Groq integration (OpenAI-compatible SDK) | Groq |[0m
[38;2;248;248;242m| 44-50 | Local Whisper Provider (subprocess detection, inline Python, chunk offset handling) | Whisper |[0m
[38;2;248;248;242m| 51-53 | Error Handling with actionable setup guide | Gemini, Groq, Whisper |[0m
[38;2;248;248;242m| 70-83 | Worth Remembering & Unresolved Questions | All three |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m### 📄 **docs/journals/2026-04-01-provider-chain-brainstorm.md**[0m

[38;2;248;248;242m**Purpose:** Planning session brainstorm: problem statement, decisions, architecture choices, phased plan.[0m

[38;2;248;248;242m**Key sections with groq/whisper/gemini:**[0m

[38;2;248;248;242m| Lines | Content | Provider(s) |[0m
[38;2;248;248;242m|-------|---------|-------------|[0m
[38;2;248;248;242m| 7-23 | Problem Statement & 3-Tier Strategy | Gemini, Groq, Whisper |[0m
[38;2;248;248;242m| 15-23 | Tier table: Gemini (paid), Groq (free), LocalWhisper (free) | All three |[0m
[38;2;248;248;242m| 25-29 | Model Config Priority Chain (CLI → ENV → project → global → default) | All three |[0m
[38;2;248;248;242m| 33-47 | Architecture: Provider Interface + Registry | Gemini, Groq, Whisper |[0m
[38;2;248;248;242m| 49-53 | Implementation Choices (Groq with openai SDK, LocalWhisper with Python) | Groq, Whisper |[0m
[38;2;248;248;242m| 69-74 | Files Affected & Next Steps | All three |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 3. README.md References[0m

[38;2;248;248;242m| Lines | Content | Provider(s) |[0m
[38;2;248;248;242m|-------|---------|-------------|[0m
[38;2;248;248;242m| 8 | Gemini API for high accuracy transcription | Gemini |[0m
[38;2;248;248;242m| 22 | Gemini API key requirement | Gemini |[0m
[38;2;248;248;242m| 56-57 | Set Gemini API key in Quick Start | Gemini |[0m
[38;2;248;248;242m| 178 | Gemini transcription in processing flow | Gemini |[0m
[38;2;248;248;242m| 180 | Gemini meeting notes generation | Gemini |[0m
[38;2;248;248;242m| 191-196 | Cost estimation using Gemini 2.5 Flash API | Gemini |[0m
[38;2;248;248;242m| 203-207 | Configuration: GEMINI_API_KEY and GOOGLE_API_KEY | Gemini |[0m
[38;2;248;248;242m| 330 | Local Whisper.cpp support in roadmap | Whisper |[0m
[38;2;248;248;242m| 342-343 | Links to Gemini API Docs and Pricing | Gemini |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 4. package.json Dependencies[0m

[38;2;248;248;242m### Explicit Dependencies Related to Groq/Whisper/Gemini[0m

[38;2;248;248;242m```json[0m
[38;2;248;248;242m{[0m
[38;2;248;248;242m  "dependencies": {[0m
[38;2;248;248;242m    "@google/genai": "^1.47.0",              // ← GEMINI support[0m
[38;2;248;248;242m    "openai": "^6.33.0",                    // ← GROQ support (OpenAI-compatible)[0m
[38;2;248;248;242m  }[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**Keywords (line 81-87):**[0m
[38;2;248;248;242m```json[0m
[38;2;248;248;242m"keywords": [[0m
[38;2;248;248;242m  "ai",[0m
[38;2;248;248;242m  "cli",[0m
[38;2;248;248;242m  "gemini",                                  // ← Explicit keyword[0m
[38;2;248;248;242m  "meeting-notes",[0m
[38;2;248;248;242m  "transcription",[0m
[38;2;248;248;242m  "video-analyzer"[0m
[38;2;248;248;242m][0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**Notes:**[0m
[38;2;248;248;242m- `@google/genai` for Gemini API client[0m
[38;2;248;248;242m- `openai` for Groq API client (Groq provides OpenAI-compatible endpoint)[0m
[38;2;248;248;242m- No explicit dependency on `faster-whisper` (it's a Python package installed separately via pip)[0m
[38;2;248;248;242m- FFmpeg handled via `@ffmpeg-installer/ffmpeg` package + `fluent-ffmpeg`[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 5. Source Code Details (src/ directory)[0m

[38;2;248;248;242m### Provider Files (Core Integration)[0m

[38;2;248;248;242m**File: `src/providers/gemini-provider.ts`**[0m
[38;2;248;248;242m```[0m
[38;2;248;248;242mLines 1-50 (entire file)[0m
[38;2;248;248;242m- Line 12: readonly name = 'gemini'[0m
[38;2;248;248;242m- Line 18: isAvailable checks for GEMINI_API_KEY[0m
[38;2;248;248;242m- Line 23: Config.geminiApiKey passed to transcriber[0m
[38;2;248;248;242m- Line 30: Config.geminiModel used for transcription[0m
[38;2;248;248;242m- Line 36-41: generateMeetingNotes for summarization[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**File: `src/providers/groq-provider.ts`**[0m
[38;2;248;248;242m```[0m
[38;2;248;248;242mLines 1-200+ (entire file)[0m
[38;2;248;248;242m- Line 22: Logger tagged as 'groq-provider'[0m
[38;2;248;248;242m- Line 25: readonly name = 'groq'[0m
[38;2;248;248;242m- Line 34: isAvailable checks for GROQ_API_KEY[0m
[38;2;248;248;242m- Line 41-42: baseURL set to https://api.groq.com/openai/v1[0m
[38;2;248;248;242m- Line 51: Uses groqTranscribeModel (whisper-large-v3)[0m
[38;2;248;248;242m- Line 95, 126: Uses groqSummarizeModel (llama-3.3-70b-versatile)[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**File: `src/providers/local-whisper-provider.ts`**[0m
[38;2;248;248;242m```[0m
[38;2;248;248;242mLines 1-200+ (entire file)[0m
[38;2;248;248;242m- Line 2: Comment: "LocalWhisperProvider — transcribes via faster-whisper Python package"[0m
[38;2;248;248;242m- Line 19: Logger tagged as 'local-whisper'[0m
[38;2;248;248;242m- Line 22-34: Inline Python script for faster-whisper[0m
[38;2;248;248;242m- Line 27: from faster_whisper import WhisperModel[0m
[38;2;248;248;242m- Line 58, 63: Availability check via python3/python -c "import faster_whisper"[0m
[38;2;248;248;242m- Line 76: Uses config.whisperModel (tiny/base/small/medium/large-v3)[0m
[38;2;248;248;242m- Line 80: Logs selected faster-whisper model and download size[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**File: `src/providers/registry.ts`**[0m
[38;2;248;248;242m```[0m
[38;2;248;248;242mLines 1-50+[0m
[38;2;248;248;242m- Line 10-12: Imports GeminiProvider, GroqProvider, LocalWhisperProvider[0m
[38;2;248;248;242m- Provider resolution chain tries Gemini → Groq → LocalWhisper[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m### Utility Files[0m

[38;2;248;248;242m**File: `src/utils/config.ts`**[0m
[38;2;248;248;242m```[0m
[38;2;248;248;242mLines with groq/whisper/gemini mentions:[0m
[38;2;248;248;242m- 8-9: Comments on config structure[0m
[38;2;248;248;242m- 99-108: geminiModel resolution with priority chain[0m
[38;2;248;248;242m- 108-115: groqTranscribeModel resolution[0m
[38;2;248;248;242m- 115-122: groqSummarizeModel resolution[0m
[38;2;248;248;242m- 122-130: whisperModel resolution[0m
[38;2;248;248;242m- 150-156: geminiApiKey from ENV (GEMINI_API_KEY, GOOGLE_API_KEY)[0m
[38;2;248;248;242m- 158-163: groqApiKey from ENV (GROQ_API_KEY)[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**File: `src/utils/constants.ts`**[0m
[38;2;248;248;242m```[0m
[38;2;248;248;242m- Line 9: export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-pro-preview'[0m
[38;2;248;248;242m- Line 10: export const DEFAULT_GROQ_TRANSCRIBE_MODEL = 'whisper-large-v3'[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**File: `src/utils/whisper-installer.ts`**[0m
[38;2;248;248;242m```[0m
[38;2;248;248;242mLines with whisper references:[0m
[38;2;248;248;242m- Line 2-4: Comments on faster-whisper installer[0m
[38;2;248;248;242m- Line 27: Check if MNS venv has faster-whisper[0m
[38;2;248;248;242m- Line 37: Subprocess test: python3 -c "import faster_whisper"[0m
[38;2;248;248;242m- Line 67-92: Interactive faster-whisper installer[0m
[38;2;248;248;242m- Line 110-117: Install process for faster-whisper[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**File: `src/commands/config/index.ts`**[0m
[38;2;248;248;242m```[0m
[38;2;248;248;242m- Line 8: Comment on supported config keys (geminiModel, groqTranscribeModel, etc.)[0m
[38;2;248;248;242m- Line 17: VALID_KEYS constant lists all four model keys[0m
[38;2;248;248;242m- Lines 43-46: Config object with all four model types[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**File: `src/commands/analyze/index.ts`**[0m
[38;2;248;248;242m```[0m
[38;2;248;248;242m- Line 20: Import promptInstallFasterWhisper from whisper-installer[0m
[38;2;248;248;242m- Line 145: Comment about faster-whisper[0m
[38;2;248;248;242m- Line 161: Retry after LocalWhisper install[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m### Type Definitions[0m

[38;2;248;248;242m**File: `src/types/index.ts`**[0m
[38;2;248;248;242m```[0m
[38;2;248;248;242mLines with groq/whisper/gemini:[0m
[38;2;248;248;242m- Line 86: geminiApiKey?: string[0m
[38;2;248;248;242m- Line 88: groqApiKey?: string[0m
[38;2;248;248;242m- Line 90: geminiModel: string[0m
[38;2;248;248;242m- Line 92: groqTranscribeModel: string[0m
[38;2;248;248;242m- Line 94: groqSummarizeModel: string[0m
[38;2;248;248;242m- Line 95-96: whisperModel comment and definition[0m
[38;2;248;248;242m- Line 118-121: MnsConfigFile interface (gemini, groqTranscribe, groqSummarize, whisper)[0m
[38;2;248;248;242m- Line 124-129: Backward-compat flat config keys[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 6. Summary Statistics[0m

[38;2;248;248;242m### Provider Coverage by File Type[0m

[38;2;248;248;242m| File Type | Groq | Whisper | Gemini | Total Files |[0m
[38;2;248;248;242m|-----------|------|---------|--------|------------|[0m
[38;2;248;248;242m| **Docs** | 5/5 | 5/5 | 5/5 | 5 |[0m
[38;2;248;248;242m| **Source (src/)** | 8 files | 4 files | 3 files | 10 files |[0m
[38;2;248;248;242m| **Config** | 1 | 1 | 1 | 3 files |[0m
[38;2;248;248;242m| **README.md** | 0 | 1 | 5 references | - |[0m
[38;2;248;248;242m| **package.json** | implicit | none | 1 dependency | - |[0m

[38;2;248;248;242m### Key Integrations[0m

[38;2;248;248;242m| Provider | Status | Auth | Default Model | Summarize |[0m
[38;2;248;248;242m|----------|--------|------|---------------|-----------|[0m
[38;2;248;248;242m| **Gemini** | ✅ Implemented | GEMINI_API_KEY | gemini-3.1-pro-preview | ✅ Yes |[0m
[38;2;248;248;242m| **Groq** | ✅ Implemented | GROQ_API_KEY | whisper-large-v3 | ✅ Yes |[0m
[38;2;248;248;242m| **Whisper** | ✅ Implemented (local) | None (pip install) | base | ❌ No |[0m

[38;2;248;248;242m### Configuration Keys[0m

[38;2;248;248;242m| Key | Priority | Source | Purpose |[0m
[38;2;248;248;242m|-----|----------|--------|---------|[0m
[38;2;248;248;242m| `geminiModel` | 1st | CLI → ENV → .mns.json → ~/.config/mns → default | Gemini model selection |[0m
[38;2;248;248;242m| `groqTranscribeModel` | 1st | CLI → ENV → .mns.json → ~/.config/mns → default | Groq transcription model |[0m
[38;2;248;248;242m| `groqSummarizeModel` | 1st | CLI → ENV → .mns.json → ~/.config/mns → default | Groq summarization model |[0m
[38;2;248;248;242m| `whisperModel` | 1st | CLI → ENV → .mns.json → ~/.config/mns → default | Local Whisper model |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 7. Environment Variables Defined[0m

[38;2;248;248;242m| Variable | Provider | Purpose | Example |[0m
[38;2;248;248;242m|----------|----------|---------|---------|[0m
[38;2;248;248;242m| `GEMINI_API_KEY` | Gemini | Authentication | `sk-...` |[0m
[38;2;248;248;242m| `GOOGLE_API_KEY` | Gemini (alt) | Authentication (alternative name) | `sk-...` |[0m
[38;2;248;248;242m| `GROQ_API_KEY` | Groq | Authentication | `gsk_...` |[0m
[38;2;248;248;242m| `MNS_MODEL` | All | Model override (all providers) | `gemini-2.0-flash` |[0m
[38;2;248;248;242m| `MNS_WHISPER_MODEL` | Whisper | Whisper model override | `base`, `small`, etc. |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 8. Unresolved Questions[0m

[38;2;248;248;242mNone identified. The codebase is comprehensively documented with all three providers (Gemini, Groq, Whisper) clearly referenced, integrated, and explained throughout docs and source code.[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 9. Key Takeaways[0m

[38;2;248;248;242m1. **Multi-Provider Architecture:** The codebase implements a sophisticated provider chain with Gemini → Groq → LocalWhisper fallback[0m
[38;2;248;248;242m2. **Flexible Configuration:** 5-level config priority chain (CLI → ENV → project → global → default) with per-provider model selection[0m
[38;2;248;248;242m3. **Graceful Degradation:** If provider lacks summarization (e.g., LocalWhisper), outputs transcript-only notes instead of erroring[0m
[38;2;248;248;242m4. **Well-Documented:** Comprehensive docs cover architecture, user setup guides, troubleshooting, cost comparison[0m
[38;2;248;248;242m5. **Zero Dependencies for Whisper:** Uses Python subprocess execution; no npm package dependency (pip install instead)[0m

