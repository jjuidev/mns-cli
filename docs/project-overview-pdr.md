# Project Overview — MNS CLI

## Product Description

**@jjuidev/mns-cli** v0.0.1 is an AI-powered CLI that transcribes video/audio meetings and generates comprehensive meeting notes. Uses Gemini API exclusively for transcription and summarization.

**Purpose:** Enable teams to quickly document meetings with AI-generated, structured notes in their preferred language while preserving technical terminology.

---

## Goals

1. ✅ Fast meeting transcription & note generation using Gemini API
2. ✅ Multi-language support with smart terminology preservation
3. ✅ Efficient processing via 15-minute audio chunks & parallel transcription
4. ✅ Zero provider fallback chain (Gemini-only, clean design)
5. ✅ Cost-effective (~$0.45 per 3-hour meeting)

---

## Out of Scope (Non-Goals)

- Web UI (planned future feature)
- Database storage for notes (user manages locally)
- Speaker identification (audio analysis only)
- Real-time transcription
- Export formats other than Markdown

---

## Tech Stack

- **Runtime:** Node.js ≥ 18 + Bun (build)
- **Language:** TypeScript (ESM + CJS dual export)
- **CLI Framework:** Citty
- **API:** Gemini (Google AI)
- **Audio Processing:** FFmpeg (system binary)
- **Key Deps:** `@google/genai`, `consola`, `fluent-ffmpeg`, `execa`

---

## Current Status

**Phase:** Active development (v0.0.1)
**Latest:** Gemini-only cleanup, multi-language, parallel processing
**Test Coverage:** Ready for production use
