# Journal: Gemini-Only Cleanup
**Date:** 2026-04-02 | **Plan:** `260402-0013-gemini-only-cleanup` | **Commit:** `4d2c586`

## Summary
Completed 6-phase cleanup removing Groq & Whisper dependencies. System now single-provider (Gemini only). Build passes, zero errors, CLI smoke tested.

## Changes

### Files Deleted (Phase 1–2)
- `src/providers/groq-provider.ts`
- `src/providers/local-whisper-provider.ts`
- `src/utils/whisper-installer.ts`
- `src/providers/registry.ts` (auto-detect chain eliminated)

### Provider Layer (Phase 2)
- `src/providers/types.ts` — Gemini-only `NoProviderAvailableError`
- `src/providers/index.ts` — exports types + gemini-provider only
- `src/providers/gemini-provider.ts` — removed "chain" reference

### Config & Types (Phase 3)
**Removed from config:**
- `groqApiKey`, `groqTranscribeModel`, `groqSummarizeModel`, `whisperModel` (ProcessingConfig)
- `GROQ_API_KEY`, groqTranscribe, groqSummarize, whisper fields (MnsConfigFile)

**Removed from constants:**
- `DEFAULT_GROQ_TRANSCRIBE_MODEL`, `DEFAULT_GROQ_SUMMARIZE_MODEL`, `DEFAULT_WHISPER_MODEL`

**Updated `resolveModelConfig`:**
- Returns `{ geminiModel }` only
- Removed groqApiKey resolution from `loadConfig`

### Commands (Phase 4)
- `src/commands/analyze/index.ts` — replaced registry call with direct `new GeminiProvider(config) + isAvailable()` check
- `src/commands/config/index.ts` — VALID_KEYS trimmed to `geminiModel`

### Dependencies & Docs (Phase 5–6)
- `bun remove openai` (only groq dependency)
- Build: ✓ zero errors
- Docs: System architecture reduced 545→160 lines, provider-chain-guide deleted, gemini-setup-guide created
- README: removed Local Whisper.cpp roadmap item

## Design Decisions
1. **Kept `TranscribeProvider` interface** — zero cost, maintains type contract for future extensibility
2. **Kept `supportsSummarize` branch** — dead code but safety net if Gemini API changes
3. **Direct instantiation** — analyze command instantiates `GeminiProvider` directly; no registry overhead

## Impact
- **Lines removed:** ~300 (providers, config, types)
- **Complexity reduced:** Linear provider chain → direct instantiation
- **Breaking changes:** All Groq/Whisper config keys now invalid (migration path: ignore in loadConfig)
- **Dependencies:** -1 (openai/groq packages)
