---
title: Gemini-Only Cleanup — Remove Groq & Whisper
status: completed
created: 2026-04-02
completed: 2026-04-02
priority: high
blockedBy: []
blocks: []
---

# Gemini-Only Cleanup

Remove all Groq and local Whisper logic. mns-cli uses Gemini exclusively.

## Phases

| # | Phase | Status | Files |
|---|-------|--------|-------|
| 1 | [Delete Groq/Whisper provider files](phase-01-delete-provider-files.md) | completed | `providers/groq-provider.ts`, `providers/local-whisper-provider.ts`, `utils/whisper-installer.ts` |
| 2 | [Simplify provider layer](phase-02-simplify-provider-layer.md) | completed | `providers/registry.ts`, `providers/types.ts`, `providers/index.ts` |
| 3 | [Clean types & config](phase-03-clean-types-config.md) | completed | `types/index.ts`, `utils/config.ts`, `utils/constants.ts` |
| 4 | [Clean commands](phase-04-clean-commands.md) | completed | `commands/config/index.ts`, `commands/analyze/index.ts` |
| 5 | [Remove openai dep & build](phase-05-package-build.md) | completed | `package.json`, build verification |
| 6 | [Rewrite docs](phase-06-rewrite-docs.md) | completed | `docs/system-architecture.md`, `docs/provider-chain-guide.md` → `gemini-setup-guide.md`, `docs/codebase-summary.md`, `README.md` |

## Key Dependencies
- Phase 1 must complete before Phase 2
- Phase 2-3 can run after Phase 1
- Phase 4 depends on Phase 2 (registry gone) and Phase 3 (config simplified)
- Phase 5 after Phase 1 (openai dep only used by groq)
- Phase 6 is independent, can run anytime after Phase 1

## Success Criteria
- `bun run build` passes with zero errors
- No imports of `groq-provider`, `local-whisper-provider`, `whisper-installer`, `openai` remain
- `ProcessingConfig` has no groq/whisper fields
- `mns config get geminiModel` works; groq/whisper keys rejected
- All docs describe Gemini-only architecture
