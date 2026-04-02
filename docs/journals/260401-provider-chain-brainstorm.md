# Journal: Provider Chain + Model Config Brainstorm

**Date:** 2026-04-01  
**Session:** Planning + Architecture Decision  
**Topic:** Eliminate vendor lock-in, hard-crash on missing API key, enable model configuration

## Problem Statement

- **Hard crash:** MNS CLI exits when `GEMINI_API_KEY` missing (no graceful degradation)
- **Vendor lock-in:** Only Gemini supported, no alternatives
- **No model config:** Hardcoded `gemini-2.5-flash`, users can't override

## Decisions

### 1. 3-Tier Provider Fallback Chain

| Tier | Provider | Keys | Capabilities | Cost |
|------|----------|------|--------------|------|
| 1 | Gemini | GEMINI_API_KEY / GOOGLE_API_KEY | transcribe + summarize | paid |
| 2 | Groq | GROQ_API_KEY | Whisper-large-v3 + llama-3.3-70b | **free** |
| 3 | LocalWhisper | none | faster-whisper (transcribe only) | **free** |

**Strategy:** Try Tier 1 → Tier 2 → Tier 3 until one succeeds. Summarize skipped if unavailable.

### 2. Model Config Priority Chain

```
--model flag > MNS_MODEL env > .mns.json (project) > ~/.config/mns/config.json (global) > default
```

Enables per-project, per-user, and per-invocation overrides.

### 3. Architecture: Provider Interface + Registry

Chose interface-based abstraction over strategy flags:
- Clean separation of concerns
- Easy to add new providers later
- Testable in isolation

**Provider interface:**
```ts
interface TranscribeProvider {
  canUse(): boolean
  transcribe(audio: Buffer): Promise<TranscriptResult>
  summarize?(text: string): Promise<string>
}
```

### 4. Implementation Choices

- **Groq client:** Use `openai` npm package (OpenAI-compatible API) — no new dependency
- **Local Whisper:** `faster-whisper` via Python subprocess only (simpler than `whisper.cpp`)
- **No breaking changes:** Existing gemini-only workflows still work

## Phased Plan

**Phase 01:** Config refactor + remove hard-fail  
**Phase 02:** Provider abstraction + Groq integration  
**Phase 03:** LocalWhisper provider  

## Files Affected

- `src/utils/config.ts` — config chain
- `src/types/index.ts` — interfaces
- `src/commands/analyze/index.ts` — provider selection
- NEW: `src/providers/` directory (5 files)
- NEW: `src/commands/config/index.ts` — `mns config` command

## Next Steps

1. Implement config refactor (Phase 01)
2. Create provider interface + registry
3. Integrate Groq (Phase 02)
4. Validate fallback chain works end-to-end
