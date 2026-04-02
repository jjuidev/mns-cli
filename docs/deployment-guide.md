# Deployment Guide — MNS CLI

## Build

```bash
# Install dependencies
bun install

# Build (compiles to dist/)
bun run build

# Output structure:
# dist/
# ├── cli/cli.js              # Executable CLI (shebang #!/usr/bin/env node)
# ├── esm/index.js            # ESM export
# ├── cjs/index.cjs           # CommonJS export
# └── types/index.d.ts        # TypeScript declarations
```

---

## Local Installation

### Option 1: npm link (Development)
```bash
cd /path/to/mns-cli
npm link

# Now use globally:
mns --help
mns analyze meeting.mp4
```

### Option 2: Manual Installation
```bash
# Build
bun run build

# Install globally
npm install -g /path/to/mns-cli

# Verify
mns --help
```

---

## Publishing to NPM

### Prerequisites
- NPM account (https://www.npmjs.com/signup)
- Authenticated locally: `npm login`
- No pending changes in git

### Release Process

1. **Update version** (automated via changeset)
   ```bash
   # Create changesets
   bun run changeset

   # Update version files
   bun run version
   ```

2. **Publish**
   ```bash
   bun run release
   # Equivalent to: bun run clean && bun run build && changeset publish
   ```

3. **Verify**
   ```bash
   npm info @jjuidev/mns-cli
   ```

### Alternative: Manual Publish
```bash
bun run clean
bun run build
npm publish
```

---

## Environment Setup (Production)

### API Keys
```bash
# Required: Gemini API key
export GEMINI_API_KEY="sk-..."

# Optional: Alternative name for key
export GOOGLE_API_KEY="sk-..."

# Optional: Default model
export MNS_MODEL="gemini-2.5-flash"
```

### System Requirements
- **Node.js** ≥ 18
- **FFmpeg** (system binary)
  - macOS: `brew install ffmpeg`
  - Ubuntu: `sudo apt-get install ffmpeg`
  - Windows: Download from https://ffmpeg.org

### Config Files
- **Global:** `~/.config/mns/config.json`
- **Project:** `.mns.json` (in project root, **COMMIT TO GIT**)

```json
{
  "model": { "gemini": "gemini-2.5-flash" },
  "env": { "GEMINI_API_KEY": "sk-..." }
}
```

**NOTE:** Add `.mns.json` to `.gitignore` if storing API keys!

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Process Meetings

on: [workflow_dispatch]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g @jjuidev/mns-cli
      - run: |
          export GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
          mns analyze meeting.mp4 --output ./notes
      - uses: actions/upload-artifact@v3
        with:
          name: meeting-notes
          path: notes/
```

---

## Troubleshooting

**`mns: command not found`**
→ Reinstall: `npm link` or `npm install -g @jjuidev/mns-cli`

**`FFmpeg not found`**
→ Install system binary: `brew install ffmpeg` (macOS) or `apt-get install ffmpeg` (Ubuntu)

**`No Gemini API key found`**
→ Set `GEMINI_API_KEY` or `GOOGLE_API_KEY` environment variable

**Build fails**
→ Run `bun install` to verify dependencies

---

## Rollback

If a published version has issues:

1. Publish a new patch version with fix
2. Document issue in [CHANGELOG](../docs/project-changelog.md)
3. Users can pin to previous version: `npm install @jjuidev/mns-cli@0.0.1`
