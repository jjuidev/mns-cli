# MNS - Meeting Notes CLI

Video/Audio meeting analyzer — transcribes, summarizes, and generates comprehensive meeting notes using Gemini AI.

## Features

- 🎬 **Video/Audio Processing**: Extract audio from video (mp4, mov, avi) or process audio directly (mp3, wav, m4a)
- 🤖 **AI Transcription**: Transcribe audio using Gemini API with high accuracy
- 📝 **Meeting Notes**: Generate comprehensive meeting notes with executive summary & detailed analysis
- 🌍 **Multi-language**: Auto-detect source language & translate to target language
- 🌐 **Smart Terminology**: Technical terms, code, keywords remain in English for clarity
- ⚡ **Smart Processing**: Auto-split long videos into chunks, parallel processing
- 🧹 **Auto Cleanup**: Automatically delete source files after processing
- 💰 **Cost Effective**: ~$0.45 per 3-hour meeting

## Prerequisites

- **Node.js** ≥ 18
- **FFmpeg** (for audio extraction)
- **Gemini API key** ([Get one here](https://aistudio.google.com/apikey))

### Installing FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows — Download from https://ffmpeg.org/download.html
```

## Installation

```bash
# Clone and build
cd /Users/tandm/Documents/jjuidev/npm/mns-cli
bun install
bun run build

# Run locally
./dist/cli/cli.js --help

# Or install globally
npm link
mns --help
```

## Quick Start

```bash
# Set Gemini API key
export GEMINI_API_KEY="your-api-key-here"

# Basic usage (auto-detect language, output in Vietnamese)
mns analyze meeting.mp4

# Process audio file directly
mns analyze recording.mp3

# With context
mns analyze meeting.mp4 --context "POC demo 31/03/2026"

# Output notes in English
mns analyze meeting.mp4 --target english

# Keep source files
mns analyze meeting.mp4 --keep

# Custom output directory
mns analyze meeting.mp4 --output ./notes

# Verbose logging
mns analyze meeting.mp4 --verbose
```

## CLI Options

```
mns analyze <video> [options]

Arguments:
  video              Path to video or audio file (required)

Options:
  -l, --lang         Source language (default: english)
  -t, --target       Target language for output (default: vietnamese)
  -c, --context      Context about the meeting
  -o, --output       Output directory (default: ./output)
  -k, --keep         Keep source files after processing (default: false)
  -p, --parallel     Enable parallel processing (default: true)
  -m, --model        AI model to use (overrides config)
  -v, --verbose      Enable verbose logging (default: false)
```

## Language Handling

**Source Language (`--lang`):** Language spoken in the meeting (default: `english`)

**Target Language (`--target`):** Language for notes output (default: `vietnamese`)

**Smart Terminology:** Technical terms (API, GraphQL, CI/CD, REST) remain in English for clarity.

**Example (Vietnamese output):**
```markdown
## Tóm tắt điều hành

- Thảo luận về API REST design cho microservices
- Quyết định sử dụng GraphQL cho query phức tạp
- Triển khai CI/CD pipeline với GitHub Actions
```

## Output Format

Meeting notes (Markdown) include:

- **Overall Summary**: Meeting overview in target language (technical terms in English)
- **Executive Summary**: 5-7 bullet points of key topics
- **Attendees**: Identified speakers
- **Decisions**: Key decisions with timestamps
- **Action Items**: Tasks with responsible parties
- **Full Transcripts**: Source & target language versions in expandable sections

Example output file: `output/meeting-2026-04-01-meeting.mp4.md`

## Architecture

```
src/
├── cli.ts                      # Entry point
├── commands/
│   ├── analyze/                # Main pipeline
│   └── config/                 # Config get/set
├── providers/
│   ├── types.ts                # TranscribeProvider interface
│   ├── gemini-provider.ts      # Gemini implementation
│   └── index.ts                # Barrel export
├── services/
│   ├── video-processor.ts      # FFmpeg extraction
│   ├── audio-chunker.ts        # Split into 15-min chunks
│   ├── transcriber.ts          # Gemini transcription
│   ├── summarizer.ts           # Meeting notes generation
│   └── cleanup.ts              # Temp file cleanup
├── utils/
│   ├── config.ts               # Config priority chain
│   ├── output.ts               # Markdown formatting
│   └── ...
└── types/
    └── index.ts                # Interfaces
```

**Pipeline:** `video → extract audio → chunk → parallel transcribe → generate notes → save markdown → cleanup`

## Cost

Using Gemini 2.5 Flash:
- **3-hour meeting:** ~$0.45
- Audio input (345,600 tokens): $0.35
- Output (transcript + summary): $0.10

## Configuration

### Environment Variables
```bash
export GEMINI_API_KEY="your-key"
# or
export GOOGLE_API_KEY="your-key"
```

### Priority Chain
```
CLI flag (--model) 
  → ENV (MNS_MODEL) 
  → Project config (.mns.json) 
  → Global config (~/.config/mns/config.json) 
  → Default (gemini-3.1-pro-preview)
```

### Project Config (`.mns.json`)
```json
{
  "env": { "GEMINI_API_KEY": "your-key" },
  "model": { "gemini": "gemini-2.5-flash" }
}
```

### Global Config (`~/.config/mns/config.json`)
```json
{
  "geminiModel": "gemini-2.5-flash"
}
```

## Examples

### Example 1: Basic
```bash
mns analyze team-standup.mp4
```

### Example 2: Multilingual
```bash
# Vietnamese video → English notes
mns analyze client-call.mp4 --lang vietnamese --target english
```

### Example 3: Long Meeting
```bash
mns analyze 3-hour-workshop.mp4 --verbose --parallel
```

## Troubleshooting

**FFmpeg not found:** `brew install ffmpeg` (macOS) or `sudo apt-get install ffmpeg` (Ubuntu)

**No API key:** Set `GEMINI_API_KEY` or `GOOGLE_API_KEY` environment variable

**Quota exceeded:** Check billing at https://console.cloud.google.com/billing or use lighter model (`--model gemini-2.0-flash`)

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Development mode (watch)
bun run dev

# Clean build
bun run clean
```

## Roadmap

- [ ] Web UI (FastAPI + React)
- [ ] Database storage (SQLite)
- [ ] Batch processing
- [ ] Custom summary templates
- [ ] Speaker identification

## License

MIT — Author: jjuidev

## Links

- [Gemini API Docs](https://ai.google.dev/gemini-api/docs/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

