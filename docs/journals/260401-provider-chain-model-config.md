# Provider Chain + Model Config Implementation
**Date:** 2026-04-01 | **Session ID:** 260401-1345-provider-chain-model-config | **Commit:** 29be08e

---

## Overview
Completed 3 major phases in single session to establish pluggable transcription provider architecture + configurable model selection. Restructured config handling to support multiple API keys/models without breaking backward compatibility.

---

## Architecture Decisions

### Provider Registry Pattern
- Introduced `TranscribeProvider` interface with:
  - `isAvailable()`: check env/deps before attempting service call
  - `transcribe()`: core operation (required)
  - `summarize()`: optional — allows graceful degradation if provider doesn't support
- `resolveProvider()` factory tries chain: Gemini → Groq → LocalWhisper → `NoProviderAvailableError`
- **Benefit:** Easy to add new providers; analysis command handles mixed capabilities (e.g., Groq transcribe-only)

### Config Priority Chain (5 levels)
1. CLI flag (`--model`)
2. Environment var (`MNS_MODEL`)
3. Project config (`.mns.json`)
4. User config (`~/.config/mns/config.json`)
5. Hard default

**Why:** Respects principle of least surprise; CLI = highest priority for one-off overrides

### Backward Compatibility
- Removed hard `process.exit(1)` from `loadConfig()` when Gemini key missing
- Existing Gemini users see **zero behavior change** — API key still picked up from env
- Provider registry makes it safe to fail gracefully when specific key missing

---

## Implementation Details

### Groq Integration
- Used `openai` npm package (OpenAI-compatible SDK) — no custom HTTP client required (KISS)
- Supports Groq Whisper (transcribe) + llama-3.3-70b (summarize)
- Config keys: `groqApiKey`, `groqTranscribeModel`, `groqSummarizeModel`

### Local Whisper Provider
- Real impl: subprocess detection caches result, falls back `python3` → `python`
- Inline Python `-c` script (no separate .py file) — YAGNI principle
- JSON stdout parsing with **last-line fallback** — handles model download progress noise
- Chunk offset handling for multi-chunk audio
- First-run download warning per model variant

### Error Handling
- `NoProviderAvailableError` includes **actionable setup guide** in message (not just "no provider")
- Analysis command gracefully degrades: if provider doesn't support summarize, uses `buildTranscriptOnlyNotes()` instead

### Config Persistence
- `mns config get/set` command for managing global config
- Config file created on-demand via `mkdirSync({ recursive: true })`
- Shared utils extracted: `format-timestamp.ts`, `transcript-only-notes-builder.ts`

---

## Files Changed
**New:** 6 provider files + config command + 2 shared utils
**Modified:** 5 core services/commands + types

Total: 18 files touched

---

## Worth Remembering
- Provider interface design makes summarize optional — **critical for multi-provider support**
- Last-line JSON parsing hack is intentional (Python script outputs progress to stderr)
- Config priority chain should be documented in `mns config get` help text
- `LocalWhisperProvider` detection is cached — restart CLI to pick up newly-installed Whisper
- `NoProviderAvailableError` message should be tested for clarity (currently includes full setup guide)

---

## Unresolved Questions
- Should we surface provider selection in help text (e.g., `mns analyze --help` showing "using Gemini" vs "using Groq")?
- Is the 5-level config chain documented enough for users? (May need docs update)
- Should `LocalWhisperProvider` auto-install missing Python deps? (Deferred — YAGNI for now)
