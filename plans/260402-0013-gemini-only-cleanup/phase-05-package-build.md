---
phase: 5
title: Remove openai Dep & Verify Build
status: completed
priority: high
effort: 10min
blockedBy: [phase-01]
completed: 2026-04-02
---

# Phase 05 — Remove openai Dep & Verify Build

## Overview
The `openai` npm package was only used by `groq-provider.ts` (deleted in Phase 1). Remove it from `package.json` and verify the full build succeeds.

## Steps

### 1. Uninstall openai package
```bash
bun remove openai
```

Verify it's gone from `package.json` dependencies:
```json
// REMOVED:
"openai": "^6.33.0"
```

### 2. Run full build
```bash
bun run build
```

Expected: zero TypeScript errors, all output emitted to `dist/`.

### 3. Verify no stale dist/ type files
After build, confirm these no longer exist in `dist/types/providers/`:
- `groq-provider.d.ts` — should be absent
- `local-whisper-provider.d.ts` — should be absent

And in `dist/types/utils/`:
- `whisper-installer.d.ts` — should be absent

### 4. Smoke test CLI
```bash
node dist/cli/cli.js --help
node dist/cli/cli.js config get geminiModel
node dist/cli/cli.js config get groqTranscribeModel  # should error: unknown key
```

## Todo
- [ ] Run `bun remove openai`
- [ ] Run `bun run build` — must pass with zero errors
- [ ] Verify stale dist/ type files are gone
- [ ] Smoke test `mns --help` and `mns config get geminiModel`
- [ ] Confirm `mns config get groqTranscribeModel` errors correctly
