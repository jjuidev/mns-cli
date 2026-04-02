---
phase: 4
title: Clean Commands
status: completed
priority: high
effort: 20min
blockedBy: [phase-02, phase-03]
completed: 2026-04-02
---

# Phase 04 — Clean Commands

## Overview
Update the two commands affected by the provider/config cleanup. `analyze` loses the provider-registry pattern and whisper-installer fallback. `config` loses groq/whisper config keys.

## Files to MODIFY

### `src/commands/analyze/index.ts`

**Remove imports:**
```typescript
// REMOVE:
import { resolveProvider } from '@/providers/registry'
import { NoProviderAvailableError } from '@/providers/types'
import { promptInstallFasterWhisper } from '@/utils/whisper-installer'
```

**Add import:**
```typescript
// ADD:
import { GeminiProvider } from '@/providers/gemini-provider'
```

**Replace provider resolution block (lines 144–163):**

Before:
```typescript
// Resolve provider (Gemini → Groq → LocalWhisper).
// If none available, offer interactive faster-whisper install then retry once.
let provider

try {
  provider = await resolveProvider(config)
} catch (err) {
  if (!(err instanceof NoProviderAvailableError)) {
    throw err
  }
  const installed = await promptInstallFasterWhisper()
  if (!installed) {
    process.exit(1)
  }
  provider = await resolveProvider(config)
}
```

After:
```typescript
// Initialise Gemini provider — requires GEMINI_API_KEY or GOOGLE_API_KEY
const provider = new GeminiProvider(config)

if (!(await provider.isAvailable())) {
  logger.error('No Gemini API key found. Set GEMINI_API_KEY or GOOGLE_API_KEY.')
  process.exit(1)
}
```

**Update warn message (line 195):**
```typescript
// BEFORE:
logger.warn('Summarize skipped — upgrade to Gemini or Groq for full meeting notes')

// AFTER: (unreachable now since Gemini always supports summarize, but keep as safety net)
logger.warn('Summarize not available for this provider')
```

> Note: The `provider.supportsSummarize` branch still exists as a guard but `GeminiProvider.supportsSummarize = true` always, so the `else` branch is dead code. Leave it — it doesn't hurt and future-proofs against provider changes.

---

### `src/commands/config/index.ts`

**Remove from `VALID_KEYS`:**
```typescript
// BEFORE:
const VALID_KEYS: (keyof MnsConfigFile)[] = ['geminiModel', 'groqTranscribeModel', 'groqSummarizeModel', 'whisperModel']

// AFTER:
const VALID_KEYS: (keyof MnsConfigFile)[] = ['geminiModel']
```

**Update `valueMap` in `getCommand`:**
```typescript
// BEFORE:
const valueMap: Record<string, string> = {
  geminiModel: resolved.geminiModel,
  groqTranscribeModel: resolved.groqTranscribeModel,
  groqSummarizeModel: resolved.groqSummarizeModel,
  whisperModel: resolved.whisperModel
}

// AFTER:
const valueMap: Record<string, string> = {
  geminiModel: resolved.geminiModel
}
```

**Update description comment (line 8):**
```typescript
// BEFORE: Supported keys: geminiModel, groqTranscribeModel, groqSummarizeModel, whisperModel
// AFTER:  Supported keys: geminiModel
```

## Implementation Steps

1. Edit `src/commands/analyze/index.ts`:
   - Remove 3 imports (registry, NoProviderAvailableError, whisper-installer)
   - Add `GeminiProvider` import
   - Replace provider resolution block with direct instantiation + availability check
2. Edit `src/commands/config/index.ts`:
   - Update `VALID_KEYS` to `['geminiModel']` only
   - Update `valueMap` to `geminiModel` only
   - Update header comment

## Todo
- [ ] Edit `src/commands/analyze/index.ts` — replace provider resolution with direct Gemini instantiation
- [ ] Edit `src/commands/config/index.ts` — trim VALID_KEYS and valueMap to geminiModel only
