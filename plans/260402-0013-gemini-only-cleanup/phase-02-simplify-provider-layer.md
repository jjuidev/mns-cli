---
phase: 2
title: Simplify Provider Layer
status: completed
priority: high
effort: 20min
blockedBy: [phase-01]
completed: 2026-04-02
---

# Phase 02 — Simplify Provider Layer

## Overview
With Groq/Whisper deleted, the provider abstraction layer becomes trivial overhead. Per the agreed Option B (Full Simplification), we eliminate `registry.ts` and inline Gemini directly. The `TranscribeProvider` interface and `NoProviderAvailableError` are also removed — they only existed to support the multi-provider chain.

## Decision: Remove vs Keep registry.ts
- **Keep** → vestigial code, YAGNI violation
- **Remove** → `analyze` command calls `GeminiProvider` directly — cleaner, simpler ✅

## Files to MODIFY

### `src/providers/registry.ts` — DELETE entirely
Was: auto-detect chain (Gemini → Groq → LocalWhisper)
Now: not needed — `analyze` command instantiates `GeminiProvider` directly

### `src/providers/types.ts` — REWRITE
Remove `NoProviderAvailableError` groq/whisper text. Decide: keep `TranscribeProvider` interface or remove?

**Keep `TranscribeProvider` interface** — `GeminiProvider` implements it, zero cost, provides type contract for `analyze` command. Remove only the Groq/Whisper setup instructions from `NoProviderAvailableError`.

New `NoProviderAvailableError` message:
```
No Gemini API key found.
Set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.
→ Get key: https://aistudio.google.com/apikey
```

### `src/providers/index.ts` — REWRITE
Remove groq/whisper/registry exports. Export only Gemini + types.

New content:
```typescript
// Provider barrel — Gemini provider + shared types
export * from '@/providers/types'
export * from '@/providers/gemini-provider'
```

### `src/providers/gemini-provider.ts` — UPDATE comment only
Remove "Highest-priority provider in the chain" comment — there's no chain anymore.

## Implementation Steps

1. Delete `src/providers/registry.ts`
2. Rewrite `src/providers/types.ts` — update `NoProviderAvailableError` message (Gemini-only), keep `TranscribeProvider` interface
3. Rewrite `src/providers/index.ts` — remove groq/whisper/registry exports
4. Update comment in `src/providers/gemini-provider.ts`

## Todo
- [ ] Delete `src/providers/registry.ts`
- [ ] Update `src/providers/types.ts` — clean `NoProviderAvailableError` message
- [ ] Rewrite `src/providers/index.ts` — Gemini + types only
- [ ] Update header comment in `src/providers/gemini-provider.ts`
