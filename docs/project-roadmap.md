# Project Roadmap — MNS CLI

## Current Status: v0.0.1 (Active Development)

**Release Date:** TBD
**Stability:** Beta — production-ready with active development

---

## Completed Milestones

✅ **Core Architecture**
- Gemini-only provider (cleaned up multi-provider complexity)
- 5-level config priority chain (CLI → ENV → project → global → default)
- FFmpeg integration for audio extraction & processing

✅ **Transcription & Summarization**
- Gemini-powered audio transcription with high accuracy
- Meeting notes generation with structured sections
- Parallel chunk processing for long videos (15-min chunks)

✅ **Multi-Language Support**
- Auto-detect source language
- Translate to target language
- Smart terminology preservation (technical terms remain in English)

✅ **Output & Formatting**
- Markdown meeting notes with expandable sections
- Full transcripts (source + target language)
- Timestamp-accurate segments

✅ **Programmatic API (AsyncGenerator)**
- Public `analyzeVideo()` function with real-time progress events
- TypeScript-first consumer experience
- 7-stage `ProgressEvent` discriminated union (validating → extracting_audio → chunking → transcribing → summarizing → saving → done)

---

## Current Phase (v0.0.1)

🔧 **Refinement & Polish**
- CLI commands: `analyze`, `config get/set`
- Programmatic API: `analyzeVideo()` AsyncGenerator w/ progress events
- ESLint + Prettier integration
- Husky pre-commit hooks
- Changeset versioning

**Est. Release:** Late Q2 2026

---

## Upcoming Features (v0.1.0+)

- [ ] **Batch Processing** — Process multiple files in sequence
- [ ] **Custom Summary Templates** — User-defined output sections
- [ ] **Web UI** — FastAPI + React interface (planned Q3 2026)
- [ ] **Database Storage** — SQLite for note history (v0.2.0)
- [ ] **Search & Filter** — Query historical notes
- [ ] **Speaker Detection** — AI-based speaker identification
- [ ] **Calendar Integration** — Auto-import meeting times

---

## Known Limitations

- No real-time transcription (batch processing only)
- Single provider (Gemini) — no fallback providers
- Markdown output only (no PDF, DOCX export)
- Manual file management (no built-in storage)

---

## Performance Targets

- **3-hour meeting:** ~5-10 minutes processing time (parallel mode)
- **Cost:** ~$0.45 per 3-hour meeting (Gemini 2.5 Flash)
- **Max file size:** Limited by system RAM & Gemini API limits (typically 2GB+)

---

## Success Criteria

✅ Fast, accurate meeting transcription via Gemini
✅ Production-ready CLI with clear UX
✅ Multi-language notes with technical clarity
✅ <1% error rate on transcription
