---
phase: 1
title: Delete Groq/Whisper Provider Files
status: completed
priority: high
effort: 15min
completed: 2026-04-02
---

# Phase 01 — Delete Groq/Whisper Provider Files

## Overview
Delete the 3 files that implement Groq and local Whisper functionality. These are fully self-contained — removing them breaks only the files that import them (handled in Phase 2 and 4).

## Files to DELETE
```
src/providers/groq-provider.ts         ← DELETE entirely
src/providers/local-whisper-provider.ts ← DELETE entirely
src/utils/whisper-installer.ts          ← DELETE entirely
```

## Files These Are Imported By
| Deleted file | Imported in | Fix in |
|---|---|---|
| `groq-provider.ts` | `providers/registry.ts`, `providers/index.ts` | Phase 2 |
| `local-whisper-provider.ts` | `providers/registry.ts`, `providers/index.ts` | Phase 2 |
| `whisper-installer.ts` | `commands/analyze/index.ts` | Phase 4 |

## Implementation Steps

1. Delete `src/providers/groq-provider.ts`
2. Delete `src/providers/local-whisper-provider.ts`
3. Delete `src/utils/whisper-installer.ts`

## Notes
- Do NOT build after this phase — imports are broken until Phase 2 & 4 fix them
- `dist/types/` generated files will be cleaned by rebuild in Phase 5

## Todo
- [ ] Delete `src/providers/groq-provider.ts`
- [ ] Delete `src/providers/local-whisper-provider.ts`
- [ ] Delete `src/utils/whisper-installer.ts`
