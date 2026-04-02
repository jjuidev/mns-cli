---
phase: 6
title: Rewrite Docs — Gemini-Only
status: completed
priority: medium
effort: 45min
completed: 2026-04-02
---

# Phase 06 — Rewrite Docs to Gemini-Only

## Overview
All docs were written for a 3-provider architecture. Rewrite them to reflect the simplified Gemini-only reality. Historical journal files are **kept as-is** (they document past decisions — archival value).

## Files to REWRITE

### `docs/system-architecture.md`
**Sections to remove entirely:**
- Provider Registry Pattern / Decision Tree (lines 54–97)
- GroqProvider implementation section (lines 186–232)
- LocalWhisperProvider implementation section (lines 235–296)
- Multi-provider error handling in `NoProviderAvailableError` (lines 425–447)

**Sections to update:**
- High-level flowchart → simplify to: Load Config → Init Gemini → Transcribe → Summarize → Save
- Config Loading Pipeline → remove groq/whisper key columns
- "Provider Implementations" → rename to "Gemini Integration", keep only GeminiProvider content
- Error handling → update to Gemini-only error (missing API key)

**Target length:** Reduce from ~545 lines to ~250 lines

---

### `docs/provider-chain-guide.md` → RENAME to `docs/gemini-setup-guide.md`
**Delete file, create new `gemini-setup-guide.md` with:**

Structure:
```markdown
# Gemini Setup Guide

## Quick Start
1. Get API key from https://aistudio.google.com/apikey
2. Set GEMINI_API_KEY=your_key (or GOOGLE_API_KEY)
3. Run mns analyze <video>

## Model Selection
- Default: gemini-3.1-pro-preview
- Override: mns analyze --model gemini-2.5-flash
- Persistent: mns config set geminiModel gemini-2.0-flash

## Available Models
| Model | Speed | Quality | Cost |
...

## Configuration
### Environment Variable
### .mns.json (project-level)
### ~/.config/mns/config.json (global)

## Troubleshooting
- Invalid API key
- Quota exceeded / billing
- Network issues

## API Key Management
- Best practices
- Links to Google AI Studio
```

**Target length:** ~120 lines (was 589 lines for 3-provider guide)

---

### `docs/codebase-summary.md`
**Sections to update:**
- Project structure → remove `providers/` multi-provider listing, simplify to `GeminiProvider`
- Before/After comparison (lines 170–221) → remove, was about multi-provider migration
- `TranscribeProvider` interface description → simplify (interface stays in code but isn't a "chain" concept)
- Support matrix table → remove multi-provider row, show Gemini capabilities only
- Dev workflow → update env setup to Gemini-only
- Error handling section → update to Gemini-only error message

---

### `README.md`
**Line 330** — Remove from roadmap:
```markdown
- [ ] Local Whisper.cpp support (FREE)   ← DELETE this line
```

No other README changes needed (README was already mostly Gemini-focused).

---

## Files to KEEP AS-IS (historical journals)
```
docs/journals/260401-provider-chain-model-config.md    ← keep (historical)
docs/journals/2026-04-01-provider-chain-brainstorm.md  ← keep (historical)
```

## Implementation Steps

1. Rewrite `docs/system-architecture.md` — remove provider chain sections, simplify to Gemini-only
2. Delete `docs/provider-chain-guide.md`
3. Create `docs/gemini-setup-guide.md` — new concise Gemini setup guide
4. Update `docs/codebase-summary.md` — remove multi-provider references, simplify
5. Edit `README.md` line 330 — remove Local Whisper.cpp roadmap item

## Todo
- [ ] Rewrite `docs/system-architecture.md`
- [ ] Delete `docs/provider-chain-guide.md`
- [ ] Create `docs/gemini-setup-guide.md`
- [ ] Update `docs/codebase-summary.md`
- [ ] Remove Whisper.cpp roadmap item from `README.md`
