# Gemini Setup Guide

## Quick Start

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Set the environment variable:
   ```bash
   export GEMINI_API_KEY=your_key
   ```
3. Run:
   ```bash
   mns analyze meeting.mp4
   ```

Also accepts `GOOGLE_API_KEY` as an alternative env var name.

---

## Model Selection

| Method | Example |
|--------|---------|
| Default | `gemini-3.1-pro-preview` |
| CLI flag | `mns analyze video.mp4 --model gemini-2.5-flash` |
| Persistent (global) | `mns config set geminiModel gemini-2.0-flash` |
| Persistent (project) | `.mns.json` → `{ "model": { "gemini": "gemini-2.0-flash" } }` |

### Recommended Models

| Model | Speed | Quality | Notes |
|-------|-------|---------|-------|
| `gemini-3.1-pro-preview` | Medium | Best | Default |
| `gemini-2.5-flash` | Fast | High | Good balance |
| `gemini-2.0-flash` | Fastest | Good | Budget option |

---

## Configuration

### Environment Variable (recommended for CI/automation)
```bash
export GEMINI_API_KEY=your_key
# or
export GOOGLE_API_KEY=your_key
```

### Project-level `.mns.json`
```json
{
  "env": { "GEMINI_API_KEY": "your_key" },
  "model": { "gemini": "gemini-2.5-flash" }
}
```

### Global `~/.config/mns/config.json`
```json
{
  "geminiModel": "gemini-2.5-flash"
}
```

Priority: `CLI flag > MNS_MODEL env > project config > global config > default`

---

## Troubleshooting

**`No Gemini API key found`**
→ Set `GEMINI_API_KEY` or `GOOGLE_API_KEY` environment variable.

**`API key not valid`**
→ Regenerate key at https://aistudio.google.com/apikey

**`Quota exceeded`**
→ Check billing at https://console.cloud.google.com/billing
→ Or switch to a lighter model: `mns analyze video.mp4 --model gemini-2.0-flash`

**`Network error / timeout`**
→ Check internet connection; Gemini API requires outbound HTTPS.

---

## API Key Best Practices

- Never commit API keys to git — use `.mns.json` only for project-local overrides with a `.gitignore` entry
- Use project-scoped keys for CI pipelines
- Rotate keys periodically via [Google AI Studio](https://aistudio.google.com/apikey)
