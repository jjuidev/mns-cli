[38;2;248;248;242m# MNS-CLI Provider Audit: Groq, Whisper, Gemini References[0m

[38;2;248;248;242m**Report Generated:** 2026-04-02  [0m
[38;2;248;248;242m**Scope:** `/src/` directory (28 source files, 3,185 total lines)  [0m
[38;2;248;248;242m**Search:** Case-insensitive references to "groq", "whisper", "gemini"[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 1. COMPLETE FILE TREE[0m

[38;2;248;248;242m```[0m
[38;2;248;248;242msrc/[0m
[38;2;248;248;242m├── index.ts                          (1 line)[0m
[38;2;248;248;242m├── cli.ts                            (25 lines)[0m
[38;2;248;248;242m├── build.ts                          (114 lines)[0m
[38;2;248;248;242m├── types/[0m
[38;2;248;248;242m│   └── index.ts                      (143 lines) ★ CORE TYPES[0m
[38;2;248;248;242m├── providers/                        ★ PROVIDER CHAIN[0m
[38;2;248;248;242m│   ├── index.ts                      (6 lines)[0m
[38;2;248;248;242m│   ├── types.ts                      (57 lines) ★ INTERFACE DEFINITIONS[0m
[38;2;248;248;242m│   ├── registry.ts                   (35 lines) ★ PROVIDER RESOLUTION[0m
[38;2;248;248;242m│   ├── gemini-provider.ts            (44 lines) ★ GEMINI[0m
[38;2;248;248;242m│   ├── groq-provider.ts              (190 lines) ★ GROQ[0m
[38;2;248;248;242m│   └── local-whisper-provider.ts     (200 lines) ★ LOCAL WHISPER[0m
[38;2;248;248;242m├── services/[0m
[38;2;248;248;242m│   ├── audio-chunker.ts              (133 lines)[0m
[38;2;248;248;242m│   ├── cleanup.ts                    (97 lines)[0m
[38;2;248;248;242m│   ├── transcriber.ts                (350 lines) ★ GEMINI API CALLS[0m
[38;2;248;248;242m│   ├── summarizer.ts                 (393 lines) ★ GEMINI API CALLS[0m
[38;2;248;248;242m│   └── video-processor.ts            (137 lines)[0m
[38;2;248;248;242m├── commands/[0m
[38;2;248;248;242m│   ├── index.ts                      (4 lines)[0m
[38;2;248;248;242m│   ├── analyze/index.ts              (285 lines)[0m
[38;2;248;248;242m│   ├── config/index.ts               (95 lines)[0m
[38;2;248;248;242m│   └── ls/index.ts                   (22 lines)[0m
[38;2;248;248;242m└── utils/[0m
[38;2;248;248;242m    ├── banner.ts                     (38 lines)[0m
[38;2;248;248;242m    ├── config.ts                     (241 lines) ★ CONFIG KEYS[0m
[38;2;248;248;242m    ├── constants.ts                  (12 lines) ★ MODEL DEFAULTS[0m
[38;2;248;248;242m    ├── format-timestamp.ts           (21 lines)[0m
[38;2;248;248;242m    ├── free-translator.ts            (138 lines)[0m
[38;2;248;248;242m    ├── logger.ts                     (25 lines)[0m
[38;2;248;248;242m    ├── output.ts                     (199 lines)[0m
[38;2;248;248;242m    ├── transcript-only-notes-builder.ts (56 lines)[0m
[38;2;248;248;242m    └── whisper-installer.ts          (124 lines) ★ WHISPER SETUP[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 2. FILES WITH GROQ/WHISPER/GEMINI REFERENCES[0m

[38;2;248;248;242m### ⭐ PRIMARY PROVIDER FILES[0m

[38;2;248;248;242m#### **providers/registry.ts** (35 lines)[0m
[38;2;248;248;242m**Purpose:** Provider chain resolution (priority: Gemini → Groq → LocalWhisper)[0m

[38;2;248;248;242m| Line(s) | Reference | Code Element |[0m
[38;2;248;248;242m|---------|-----------|--------------|[0m
[38;2;248;248;242m| 10      | `gemini-provider` | Import: GeminiProvider class |[0m
[38;2;248;248;242m| 11      | `groq-provider` | Import: GroqProvider class |[0m
[38;2;248;248;242m| 12      | `local-whisper` | Import: LocalWhisperProvider class |[0m
[38;2;248;248;242m| 21-24   | all three | Instantiation in candidates array |[0m

[38;2;248;248;242m**Key Logic:**[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242m// Line 20-31: resolveProvider() function[0m
[38;2;248;248;242mexport const resolveProvider = async (config: ProcessingConfig): Promise<TranscribeProvider> => {[0m
[38;2;248;248;242m  const candidates: TranscribeProvider[] = [[0m
[38;2;248;248;242m    new GeminiProvider(config),[0m
[38;2;248;248;242m    new GroqProvider(config),[0m
[38;2;248;248;242m    new LocalWhisperProvider(config)[0m
[38;2;248;248;242m  ][0m
[38;2;248;248;242m  [0m
[38;2;248;248;242m  for (const provider of candidates) {[0m
[38;2;248;248;242m    if (await provider.isAvailable()) {[0m
[38;2;248;248;242m      consola.info(`Using provider: ${provider.name}`)[0m
[38;2;248;248;242m      return provider[0m
[38;2;248;248;242m    }[0m
[38;2;248;248;242m  }[0m
[38;2;248;248;242m  [0m
[38;2;248;248;242m  throw new NoProviderAvailableError()[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m#### **providers/types.ts** (57 lines)[0m
[38;2;248;248;242m**Purpose:** Core interface definitions and error handling[0m

[38;2;248;248;242m| Line(s) | Reference | Code Element |[0m
[38;2;248;248;242m|---------|-----------|--------------|[0m
[38;2;248;248;242m| 39-57   | ALL THREE | NoProviderAvailableError message (lines 41-53) |[0m
[38;2;248;248;242m| 44      | `gemini` | Setup URL: https://aistudio.google.com/apikey |[0m
[38;2;248;248;242m| 48      | `groq` | Setup URL: https://console.groq.com/keys |[0m
[38;2;248;248;242m| 52      | `whisper` | Local pip install instruction |[0m

[38;2;248;248;242m**Error Message Content (lines 41-53):**[0m
[38;2;248;248;242m```[0m
[38;2;248;248;242mNo AI provider available. Set up one of the following:[0m

[38;2;248;248;242m  1. Gemini (best quality):[0m
[38;2;248;248;242m     export GEMINI_API_KEY=your_key[0m
[38;2;248;248;242m     → Get key: https://aistudio.google.com/apikey[0m

[38;2;248;248;242m  2. Groq (free tier, fast):[0m
[38;2;248;248;242m     export GROQ_API_KEY=your_key[0m
[38;2;248;248;242m     → Get key: https://console.groq.com/keys[0m

[38;2;248;248;242m  3. Local Whisper (offline, transcribe only):[0m
[38;2;248;248;242m     pip install faster-whisper[0m
[38;2;248;248;242m     (models: tiny/base/small/medium/large-v3, default: base)[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m#### **providers/gemini-provider.ts** (44 lines) ⭐ GEMINI[0m
[38;2;248;248;242m**Purpose:** Wrapper around Gemini transcription & summarization services[0m

[38;2;248;248;242m| Line(s) | Reference | Code Element | Details |[0m
[38;2;248;248;242m|---------|-----------|--------------|---------|[0m
[38;2;248;248;242m| 1-3     | gemini | Class docstring | "wraps existing transcribeAudio + generateMeetingNotes services" |[0m
[38;2;248;248;242m| 3       | gemini | Comment | "Highest-priority provider in the chain" |[0m
[38;2;248;248;242m| 7       | gemini | Import | `generateMeetingNotes` from summarizer |[0m
[38;2;248;248;242m| 8       | gemini | Import | `transcribeAudio` from transcriber |[0m
[38;2;248;248;242m| 11      | gemini | Class name | `GeminiProvider` |[0m
[38;2;248;248;242m| 12      | gemini | Property | `name = 'gemini'` |[0m
[38;2;248;248;242m| 13      | gemini | Property | `supportsSummarize = true` |[0m
[38;2;248;248;242m| 18      | gemini | Method | `isAvailable()` checks `this.config.geminiApiKey` |[0m
[38;2;248;248;242m| 22-32   | gemini | Method | `transcribe()` delegates to `transcribeAudio()` service |[0m
[38;2;248;248;242m| 23      | gemini | Property | Uses `config.geminiApiKey` |[0m
[38;2;248;248;242m| 30      | gemini | Property | Uses `config.geminiModel` |[0m
[38;2;248;248;242m| 34-43   | gemini | Method | `summarize()` delegates to `generateMeetingNotes()` service |[0m
[38;2;248;248;242m| 36      | gemini | Property | Uses `config.geminiApiKey` |[0m
[38;2;248;248;242m| 41      | gemini | Property | Uses `config.geminiModel` |[0m

[38;2;248;248;242m**Key Implementation:**[0m
[38;2;248;248;242m- Minimal adapter wrapping transcriber.ts and summarizer.ts services[0m
[38;2;248;248;242m- No direct API calls; delegates to service layer[0m
[38;2;248;248;242m- Both methods support parallel chunk processing and language translation[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m#### **providers/groq-provider.ts** (190 lines) ⭐ GROQ[0m
[38;2;248;248;242m**Purpose:** Transcription via Groq Whisper API + summarization via Llama[0m

[38;2;248;248;242m| Line(s) | Reference | Code Element | Details |[0m
[38;2;248;248;242m|---------|-----------|--------------|---------|[0m
[38;2;248;248;242m| 2       | groq, whisper | Docstring | "transcribes via Groq Whisper (OpenAI-compatible API) and summarizes via llama-3.3-70b-versatile" |[0m
[38;2;248;248;242m| 10      | openai | Import | `import OpenAI from 'openai'` (Groq uses OpenAI SDK) |[0m
[38;2;248;248;242m| 24      | groq | Class name | `GroqProvider` |[0m
[38;2;248;248;242m| 25      | groq | Property | `name = 'groq'` |[0m
[38;2;248;248;242m| 26      | groq | Property | `supportsSummarize = true` |[0m
[38;2;248;248;242m| 34      | groq | Method | `isAvailable()` checks `this.config.groqApiKey` |[0m
[38;2;248;248;242m| 40-43   | groq | Method | OpenAI client init with `baseURL: 'https://api.groq.com/openai/v1'` |[0m
[38;2;248;248;242m| 41      | groq | Config | `apiKey: this.config.groqApiKey` |[0m
[38;2;248;248;242m| 51      | groq | Config | `const model = this.config.groqTranscribeModel` |[0m
[38;2;248;248;242m| 56-65   | groq, whisper | Logic | Loop through chunks, call `transcribeFile()` |[0m
[38;2;248;248;242m| 94-103  | groq, llama | Logic | Chat completion call with `this.config.groqSummarizeModel` |[0m
[38;2;248;248;242m| 125-134 | groq, llama | Logic | Translation call using same summarize model |[0m
[38;2;248;248;242m| 160     | groq, whisper | Logic | Audio transcription: `this.getClient().audio.transcriptions.create()` |[0m
[38;2;248;248;242m| 163-164 | groq | Config | Response format: `'verbose_json'`, granularity: `'segment'` |[0m

[38;2;248;248;242m**API Integration Details:**[0m
[38;2;248;248;242m- **Transcription:** `client.audio.transcriptions.create()` with `response_format: 'verbose_json'`[0m
[38;2;248;248;242m- **Segment Parsing:** Extracts from `{ segments?: Array<{ start, end, text }> }`[0m
[38;2;248;248;242m- **Summarization:** `client.chat.completions.create()` with max_tokens: 8192[0m
[38;2;248;248;242m- **Translation:** Same chat endpoint, different prompt[0m

[38;2;248;248;242m**Models Used:**[0m
[38;2;248;248;242m- Transcribe: Configured via `groqTranscribeModel` (default: `whisper-large-v3`)[0m
[38;2;248;248;242m- Summarize: Configured via `groqSummarizeModel` (default: `llama-3.3-70b-versatile`)[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m#### **providers/local-whisper-provider.ts** (200 lines) ⭐ LOCAL WHISPER[0m
[38;2;248;248;242m**Purpose:** Offline transcription using faster-whisper Python subprocess[0m

[38;2;248;248;242m| Line(s) | Reference | Code Element | Details |[0m
[38;2;248;248;242m|---------|-----------|--------------|---------|[0m
[38;2;248;248;242m| 2       | whisper | Docstring | "transcribes via faster-whisper Python package (subprocess)" |[0m
[38;2;248;248;242m| 3       | whisper | Comment | "Transcribe-only (no summarize). Third in the provider chain" |[0m
[38;2;248;248;242m| 5       | whisper | Comment | Detection: `python3 -c "import faster_whisper; print('ok')"` |[0m
[38;2;248;248;242m| 17      | whisper | Import | `getMnsVenvPython`, `isMnsVenvReady` from whisper-installer |[0m
[38;2;248;248;242m| 25-32   | whisper | Constant | WHISPER_SCRIPT: Inline Python script (7 lines) |[0m
[38;2;248;248;242m| 37      | whisper | Class | `LocalWhisperProvider` |[0m
[38;2;248;248;242m| 37      | whisper | Property | `name = 'local-whisper'` |[0m
[38;2;248;248;242m| 38      | whisper | Property | `supportsSummarize = false` |[0m
[38;2;248;248;242m| 45-71   | whisper | Method | `isAvailable()`: Check MNS venv, then system python |[0m
[38;2;248;248;242m| 58-68   | whisper | Logic | Try `python3` / `python` with import detection |[0m
[38;2;248;248;242m| 76      | whisper | Config | `this.config?.whisperModel || 'base'` |[0m
[38;2;248;248;242m| 80      | whisper | Log | Model warning: "faster-whisper model: {model} (first run downloads ~{size} MB)" |[0m
[38;2;248;248;242m| 104     | whisper | Call | `this.runWhisper(pythonBin, whisperModel, filePath, offset)` |[0m
[38;2;248;248;242m| 132-166 | whisper | Method | `runWhisper()`: Execute Python script via execa |[0m
[38;2;248;248;242m| 139     | whisper | Call | `await execa(pythonBin, ['-c', WHISPER_SCRIPT, model, filePath])` |[0m
[38;2;248;248;242m| 156     | whisper | Parse | `JSON.parse(jsonLine) as RawSegment[]` |[0m
[38;2;248;248;242m| 170-186 | whisper | Logic | `resolvePythonBin()`: MNS venv priority, then system |[0m
[38;2;248;248;242m| 189-199 | whisper | Data | `modelSizeMb()`: Model size map (tiny/base/small/medium/large-v3) |[0m

[38;2;248;248;242m**Python Script (lines 25-32):**[0m
[38;2;248;248;242m```python[0m
[38;2;248;248;242mimport sys, json[0m
[38;2;248;248;242mfrom faster_whisper import WhisperModel[0m
[38;2;248;248;242mmodel = WhisperModel(sys.argv[1], device="cpu", compute_type="int8")[0m
[38;2;248;248;242msegments, _ = model.transcribe(sys.argv[2], beam_size=5)[0m
[38;2;248;248;242mresult = [{"start": s.start, "end": s.end, "text": s.text} for s in segments][0m
[38;2;248;248;242mprint(json.dumps(result))[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**Models Supported:** tiny, base, small, medium, large-v3[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m### ⭐ SECONDARY SERVICE FILES[0m

[38;2;248;248;242m#### **services/transcriber.ts** (350 lines) ⭐ GEMINI[0m
[38;2;248;248;242m**Purpose:** Gemini API calls for audio transcription with parallel support[0m

[38;2;248;248;242m| Line(s) | Reference | Code Element | Details |[0m
[38;2;248;248;242m|---------|-----------|--------------|---------|[0m
[38;2;248;248;242m| 2       | gemini | Docstring | "Transcribe audio using Gemini API" |[0m
[38;2;248;248;242m| 7       | gemini | Import | `import { GoogleGenAI } from '@google/genai'` |[0m
[38;2;248;248;242m| 11      | gemini | Import | `import { DEFAULT_GEMINI_MODEL } from '@/utils/constants'` |[0m
[38;2;248;248;242m| 16      | gemini | Comment | "Transcribe audio file(s) using Gemini" |[0m
[38;2;248;248;242m| 18-85   | gemini | Export | `transcribeAudio()` main function |[0m
[38;2;248;248;242m| 29      | gemini | Instantiate | `const genAI = new GoogleGenAI({ apiKey: options.apiKey })` |[0m
[38;2;248;248;242m| 30      | gemini | Default | `const model = options.model \|\| DEFAULT_GEMINI_MODEL` |[0m
[38;2;248;248;242m| 36-50   | gemini | Logic | Parallel transcription of chunks |[0m
[38;2;248;248;242m| 54-59   | gemini | Logic | Sequential transcription of chunks |[0m
[38;2;248;248;242m| 65      | gemini | Call | `transcribeSingleFile(genAI, ...)` |[0m
[38;2;248;248;242m| 90-100  | gemini | Function | `transcribeChunksParallel()` |[0m
[38;2;248;248;242m| 105-154 | gemini | Function | `transcribeChunk()` - single chunk transcription |[0m
[38;2;248;248;242m| 121     | gemini | Call | `genAI.models.generateContent()` |[0m
[38;2;248;248;242m| 159-195 | gemini | Function | `transcribeSingleFile()` |[0m
[38;2;248;248;242m| 170     | gemini | Call | `genAI.models.generateContent()` |[0m
[38;2;248;248;242m| 200-218 | gemini | Function | `buildTranscriptionPrompt()` |[0m
[38;2;248;248;242m| 224-300 | gemini | Function | `parseTranscriptSegments()` - parse Gemini response |[0m

[38;2;248;248;242m**API Call Structure (lines 121-137):**[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242mconst response = await genAI.models.generateContent({[0m
[38;2;248;248;242m  model,[0m
[38;2;248;248;242m  contents: [[0m
[38;2;248;248;242m    {[0m
[38;2;248;248;242m      role: 'user',[0m
[38;2;248;248;242m      parts: [[0m
[38;2;248;248;242m        { text: prompt },[0m
[38;2;248;248;242m        {[0m
[38;2;248;248;242m          inlineData: {[0m
[38;2;248;248;242m            mimeType: 'audio/wav',[0m
[38;2;248;248;242m            data: base64Audio[0m
[38;2;248;248;242m          }[0m
[38;2;248;248;242m        }[0m
[38;2;248;248;242m      ][0m
[38;2;248;248;242m    }[0m
[38;2;248;248;242m  ][0m
[38;2;248;248;242m})[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**Features:**[0m
[38;2;248;248;242m- Parallel processing with configurable chunk limit[0m
[38;2;248;248;242m- Timestamp parsing (multiple formats)[0m
[38;2;248;248;242m- Speaker detection & labeling[0m
[38;2;248;248;242m- Language-specific prompting[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m#### **services/summarizer.ts** (393 lines) ⭐ GEMINI[0m
[38;2;248;248;242m**Purpose:** Gemini API calls for meeting notes generation and translation[0m

[38;2;248;248;242m| Line(s) | Reference | Code Element | Details |[0m
[38;2;248;248;242m|---------|-----------|--------------|---------|[0m
[38;2;248;248;242m| 2       | gemini | Docstring | "Generate meeting notes from transcript using Gemini" |[0m
[38;2;248;248;242m| 7       | gemini | Import | `import { GoogleGenAI } from '@google/genai'` |[0m
[38;2;248;248;242m| 11      | gemini | Import | `import { DEFAULT_GEMINI_MODEL } from '@/utils/constants'` |[0m
[38;2;248;248;242m| 18-75   | gemini | Export | `generateMeetingNotes()` main function |[0m
[38;2;248;248;242m| 26      | gemini | Instantiate | `const genAI = new GoogleGenAI({ apiKey: options.apiKey })` |[0m
[38;2;248;248;242m| 27      | gemini | Default | `const model = options.model \|\| DEFAULT_GEMINI_MODEL` |[0m
[38;2;248;248;242m| 36      | gemini | Call | `genAI.models.generateContent()` for summarization |[0m
[38;2;248;248;242m| 59      | gemini | Call | `translateSegments()` - calls same API |[0m
[38;2;248;248;242m| 81-115  | gemini | Function | `translateSegments()` via Gemini |[0m
[38;2;248;248;242m| 92      | gemini | Call | `genAI.models.generateContent()` for translation |[0m

[38;2;248;248;242m**Summarization Logic (lines 33-46):**[0m
[38;2;248;248;242m- Builds prompt via `buildSummarizationPrompt()`[0m
[38;2;248;248;242m- Calls Gemini with structured prompt[0m
[38;2;248;248;242m- Parses response via `parseMeetingNotes()`[0m
[38;2;248;248;242m- Handles translation if source ≠ target language[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m### ⭐ CONFIGURATION & TYPE FILES[0m

[38;2;248;248;242m#### **utils/constants.ts** (12 lines) ⭐ MODEL DEFAULTS[0m
[38;2;248;248;242m**Purpose:** Single source of truth for model identifiers[0m

[38;2;248;248;242m```typescript[0m
[38;2;248;248;242mexport const DEFAULT_GEMINI_MODEL = 'gemini-3.1-pro-preview'[0m
[38;2;248;248;242mexport const DEFAULT_GROQ_TRANSCRIBE_MODEL = 'whisper-large-v3'[0m
[38;2;248;248;242mexport const DEFAULT_GROQ_SUMMARIZE_MODEL = 'llama-3.3-70b-versatile'[0m
[38;2;248;248;242mexport const DEFAULT_WHISPER_MODEL = 'base'[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m| Line | Reference | Config Key |[0m
[38;2;248;248;242m|------|-----------|------------|[0m
[38;2;248;248;242m| 9    | gemini    | `DEFAULT_GEMINI_MODEL` |[0m
[38;2;248;248;242m| 10   | groq, whisper | `DEFAULT_GROQ_TRANSCRIBE_MODEL` |[0m
[38;2;248;248;242m| 11   | groq      | `DEFAULT_GROQ_SUMMARIZE_MODEL` |[0m
[38;2;248;248;242m| 12   | whisper   | `DEFAULT_WHISPER_MODEL` |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m#### **utils/config.ts** (241 lines) ⭐ CONFIG MANAGEMENT[0m
[38;2;248;248;242m**Purpose:** API key resolution, model override chains, config file parsing[0m

[38;2;248;248;242m| Line(s) | Reference | Code Element | Details |[0m
[38;2;248;248;242m|---------|-----------|--------------|---------|[0m
[38;2;248;248;242m| 8       | all three | Comment | Priority chain: "CLI flag > MNS_MODEL env > .mns.json > ~/.config/mns/config.json > default" |[0m
[38;2;248;248;242m| 21-25   | all three | Import | Constants for DEFAULT_*_MODEL |[0m
[38;2;248;248;242m| 93-136  | all three | Function | `resolveModelConfig()` - model override resolution |[0m
[38;2;248;248;242m| 99-106  | gemini    | Logic | Gemini model chain (CLI → env → project → global → default) |[0m
[38;2;248;248;242m| 108-113 | groq      | Logic | Groq transcribe model chain |[0m
[38;2;248;248;242m| 115-120 | groq      | Logic | Groq summarize model chain |[0m
[38;2;248;248;242m| 122-128 | whisper   | Logic | Whisper model chain (env → project → global → default) |[0m
[38;2;248;248;242m| 145-176 | all three | Function | `loadConfig()` - API key and config resolution |[0m
[38;2;248;248;242m| 150-156 | gemini    | Logic | `geminiApiKey` priority: env.GEMINI_API_KEY > env.GOOGLE_API_KEY > config → default |[0m
[38;2;248;248;242m| 158-163 | groq      | Logic | `groqApiKey` priority: env.GROQ_API_KEY > config → default |[0m

[38;2;248;248;242m**Config File Schema (types/index.ts lines 110-132):**[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242minterface MnsConfigFile {[0m
[38;2;248;248;242m  env?: {[0m
[38;2;248;248;242m    GEMINI_API_KEY?: string[0m
[38;2;248;248;242m    GROQ_API_KEY?: string[0m
[38;2;248;248;242m  }[0m
[38;2;248;248;242m  model?: {[0m
[38;2;248;248;242m    gemini?: string[0m
[38;2;248;248;242m    groqTranscribe?: string[0m
[38;2;248;248;242m    groqSummarize?: string[0m
[38;2;248;248;242m    whisper?: string[0m
[38;2;248;248;242m  }[0m
[38;2;248;248;242m  // Backward-compat flat keys...[0m
[38;2;248;248;242m  geminiApiKey?: string[0m
[38;2;248;248;242m  groqApiKey?: string[0m
[38;2;248;248;242m  geminiModel?: string[0m
[38;2;248;248;242m  groqTranscribeModel?: string[0m
[38;2;248;248;242m  groqSummarizeModel?: string[0m
[38;2;248;248;242m  whisperModel?: string[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m#### **types/index.ts** (143 lines) ⭐ TYPE DEFINITIONS[0m
[38;2;248;248;242m**Purpose:** Core data structures and processing config[0m

[38;2;248;248;242m| Line(s) | Reference | Code Element | Details |[0m
[38;2;248;248;242m|---------|-----------|--------------|---------|[0m
[38;2;248;248;242m| 84-107  | all three | Interface | `ProcessingConfig` structure |[0m
[38;2;248;248;242m| 85-86   | gemini    | Property | `geminiApiKey?: string` |[0m
[38;2;248;248;242m| 87-88   | groq      | Property | `groqApiKey?: string` |[0m
[38;2;248;248;242m| 89-90   | gemini    | Property | `geminiModel: string` |[0m
[38;2;248;248;242m| 91-92   | groq      | Property | `groqTranscribeModel: string` |[0m
[38;2;248;248;242m| 93-94   | groq      | Property | `groqSummarizeModel: string` |[0m
[38;2;248;248;242m| 95-96   | whisper   | Property | `whisperModel: string` |[0m
[38;2;248;248;242m| 110-132 | all three | Interface | `MnsConfigFile` (nested + flat schema) |[0m
[38;2;248;248;242m| 112-115 | all three | Property | `env` nested keys |[0m
[38;2;248;248;242m| 117-122 | all three | Property | `model` nested keys |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m#### **utils/whisper-installer.ts** (124 lines) ⭐ WHISPER SETUP[0m
[38;2;248;248;242m**Purpose:** Detect and manage local faster-whisper installation[0m

[38;2;248;248;242m| Line(s) | Reference | Code Element | Details |[0m
[38;2;248;248;242m|---------|-----------|--------------|---------|[0m
[38;2;248;248;242m| 2       | whisper   | Comment | "Install and manage faster-whisper for local transcription" |[0m
[38;2;248;248;242m| 9       | whisper   | Constant | Python package name: `'faster-whisper'` |[0m
[38;2;248;248;242m| 10      | whisper   | Constant | `MNS_VENV_DIR = '.mns-venv'` |[0m
[38;2;248;248;242m| 13-30   | whisper   | Function | `isMnsVenvReady()` - check `.mns-venv/bin/python3` exists |[0m
[38;2;248;248;242m| 32-50   | whisper   | Function | `getMnsVenvPython()` - return Python path |[0m
[38;2;248;248;242m| 52-103  | whisper   | Function | `setupMnsVenv()` - interactive install via uv/pip |[0m
[38;2;248;248;242m| 68      | whisper   | Package   | Install target: `'faster-whisper'` |[0m
[38;2;248;248;242m| 69      | whisper   | Log | "faster-whisper installed successfully" |[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m### ⭐ COMMAND FILES (Reference Only)[0m

[38;2;248;248;242m#### **commands/analyze/index.ts** (285 lines)[0m
[38;2;248;248;242m**Minimal references:**[0m
[38;2;248;248;242m- Line ~40-50: Calls `resolveProvider()` from registry[0m
[38;2;248;248;242m- Uses provider chain abstraction (no direct groq/whisper/gemini calls)[0m

[38;2;248;248;242m#### **commands/config/index.ts** (95 lines)[0m
[38;2;248;248;242m**Minimal references:**[0m
[38;2;248;248;242m- Manages `~/.config/mns/config.json` creation[0m
[38;2;248;248;242m- Stores API keys via `writeGlobalConfig()`[0m
[38;2;248;248;242m- No direct API calls[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 3. TYPE DEFINITIONS & INTERFACES[0m

[38;2;248;248;242m### Core Type Hierarchy[0m

[38;2;248;248;242m#### **TranscriptSegment** (types/index.ts lines 5-12)[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242minterface TranscriptSegment {[0m
[38;2;248;248;242m  timestamp: string              // "[HH:MM:SS -> HH:MM:SS]"[0m
[38;2;248;248;242m  speaker?: string               // "Speaker 1"[0m
[38;2;248;248;242m  text: string                   // Transcribed text[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m#### **Transcript** (types/index.ts lines 14-33)[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242minterface Transcript {[0m
[38;2;248;248;242m  sourceFile: string[0m
[38;2;248;248;242m  originalSourceFile?: string[0m
[38;2;248;248;242m  sourceLanguage?: string[0m
[38;2;248;248;242m  targetLanguage?: string[0m
[38;2;248;248;242m  fullText: string[0m
[38;2;248;248;242m  segments: TranscriptSegment[][0m
[38;2;248;248;242m  metadata: {[0m
[38;2;248;248;242m    duration: number             // seconds[0m
[38;2;248;248;242m    chunksProcessed: number[0m
[38;2;248;248;242m    processingTime: number       // ms[0m
[38;2;248;248;242m  }[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m#### **MeetingNotes** (types/index.ts lines 35-63)[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242minterface MeetingNotes {[0m
[38;2;248;248;242m  metadata: {[0m
[38;2;248;248;242m    sourceFile: string[0m
[38;2;248;248;242m    date: string[0m
[38;2;248;248;242m    duration: string[0m
[38;2;248;248;242m    languages: { source?: string; target?: string }[0m
[38;2;248;248;242m    context?: string[0m
[38;2;248;248;242m  }[0m
[38;2;248;248;242m  executiveSummary: string[][0m
[38;2;248;248;242m  detailed: {[0m
[38;2;248;248;242m    attendees?: string[][0m
[38;2;248;248;242m    agenda?: string[][0m
[38;2;248;248;242m    discussion: string[0m
[38;2;248;248;242m    decisions?: string[][0m
[38;2;248;248;242m    actionItems?: string[][0m
[38;2;248;248;242m  }[0m
[38;2;248;248;242m  overallSummary?: string[0m
[38;2;248;248;242m  fullTranscript?: TranscriptSegment[][0m
[38;2;248;248;242m  fullTranscriptTarget?: TranscriptSegment[][0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m#### **ProcessingConfig** (types/index.ts lines 84-107)[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242minterface ProcessingConfig {[0m
[38;2;248;248;242m  geminiApiKey?: string[0m
[38;2;248;248;242m  groqApiKey?: string[0m
[38;2;248;248;242m  geminiModel: string[0m
[38;2;248;248;242m  groqTranscribeModel: string[0m
[38;2;248;248;242m  groqSummarizeModel: string[0m
[38;2;248;248;242m  whisperModel: string[0m
[38;2;248;248;242m  ffmpegPath?: string[0m
[38;2;248;248;242m  maxChunkDuration: number       // default: 900s[0m
[38;2;248;248;242m  enableParallel: boolean[0m
[38;2;248;248;242m  maxParallelChunks: number      // default: 4[0m
[38;2;248;248;242m  outputDir: string[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m#### **ProviderTranscribeOptions** (providers/types.ts lines 8-15)[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242minterface ProviderTranscribeOptions {[0m
[38;2;248;248;242m  audioPath: string[0m
[38;2;248;248;242m  chunks?: AudioChunk[][0m
[38;2;248;248;242m  sourceLanguage?: string[0m
[38;2;248;248;242m  targetLanguage?: string[0m
[38;2;248;248;242m  enableParallel?: boolean[0m
[38;2;248;248;242m  verbose?: boolean[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m#### **TranscribeProvider** (providers/types.ts lines 24-33)[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242minterface TranscribeProvider {[0m
[38;2;248;248;242m  readonly name: string                                    // "gemini" | "groq" | "local-whisper"[0m
[38;2;248;248;242m  readonly supportsSummarize: boolean                      // gemini/groq: true, local-whisper: false[0m
[38;2;248;248;242m  isAvailable(): Promise<boolean>[0m
[38;2;248;248;242m  transcribe(options: ProviderTranscribeOptions): Promise<Transcript>[0m
[38;2;248;248;242m  summarize?(options: ProviderSummarizeOptions): Promise<MeetingNotes>[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m#### **MnsConfigFile** (types/index.ts lines 110-132)[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242minterface MnsConfigFile {[0m
[38;2;248;248;242m  env?: {[0m
[38;2;248;248;242m    GEMINI_API_KEY?: string[0m
[38;2;248;248;242m    GROQ_API_KEY?: string[0m
[38;2;248;248;242m  }[0m
[38;2;248;248;242m  model?: {[0m
[38;2;248;248;242m    gemini?: string[0m
[38;2;248;248;242m    groqTranscribe?: string[0m
[38;2;248;248;242m    groqSummarize?: string[0m
[38;2;248;248;242m    whisper?: string[0m
[38;2;248;248;242m  }[0m
[38;2;248;248;242m  // Backward-compat flat keys (deprecated but supported):[0m
[38;2;248;248;242m  geminiApiKey?: string[0m
[38;2;248;248;242m  groqApiKey?: string[0m
[38;2;248;248;242m  geminiModel?: string[0m
[38;2;248;248;242m  groqTranscribeModel?: string[0m
[38;2;248;248;242m  groqSummarizeModel?: string[0m
[38;2;248;248;242m  whisperModel?: string[0m
[38;2;248;248;242m  [key: string]: unknown          // Allows UPPER_CASE keys[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 4. API KEY & CONFIGURATION RESOLUTION[0m

[38;2;248;248;242m### Environment Variable Priority[0m

[38;2;248;248;242m**Gemini API Key** (loadConfig lines 150-156):[0m
[38;2;248;248;242m1. `process.env.GEMINI_API_KEY`[0m
[38;2;248;248;242m2. `process.env.GOOGLE_API_KEY`[0m
[38;2;248;248;242m3. `projectConfig.env.GEMINI_API_KEY` (.mns.json nested)[0m
[38;2;248;248;242m4. `projectConfig.geminiApiKey` (.mns.json flat)[0m
[38;2;248;248;242m5. `globalConfig.env.GEMINI_API_KEY` (~/.config/mns/config.json nested)[0m
[38;2;248;248;242m6. `globalConfig.geminiApiKey` (~/.config/mns/config.json flat)[0m
[38;2;248;248;242m7. **None** (provider optional)[0m

[38;2;248;248;242m**Groq API Key** (loadConfig lines 158-163):[0m
[38;2;248;248;242m1. `process.env.GROQ_API_KEY`[0m
[38;2;248;248;242m2. `projectConfig.env.GROQ_API_KEY`[0m
[38;2;248;248;242m3. `projectConfig.groqApiKey`[0m
[38;2;248;248;242m4. `globalConfig.env.GROQ_API_KEY`[0m
[38;2;248;248;242m5. `globalConfig.groqApiKey`[0m
[38;2;248;248;242m6. **None** (provider optional)[0m

[38;2;248;248;242m### Model Override Priority[0m

[38;2;248;248;242m**Gemini Model** (resolveModelConfig lines 99-106):[0m
[38;2;248;248;242m1. `cliModel` CLI flag (gemini only)[0m
[38;2;248;248;242m2. `process.env.MNS_MODEL`[0m
[38;2;248;248;242m3. `projectConfig.model.gemini`[0m
[38;2;248;248;242m4. `projectConfig.geminiModel`[0m
[38;2;248;248;242m5. `globalConfig.model.gemini`[0m
[38;2;248;248;242m6. `globalConfig.geminiModel`[0m
[38;2;248;248;242m7. **DEFAULT:** `gemini-3.1-pro-preview`[0m

[38;2;248;248;242m**Groq Transcribe Model** (resolveModelConfig lines 108-113):[0m
[38;2;248;248;242m1. `projectConfig.model.groqTranscribe`[0m
[38;2;248;248;242m2. `projectConfig.groqTranscribeModel`[0m
[38;2;248;248;242m3. `globalConfig.model.groqTranscribe`[0m
[38;2;248;248;242m4. `globalConfig.groqTranscribeModel`[0m
[38;2;248;248;242m5. **DEFAULT:** `whisper-large-v3`[0m

[38;2;248;248;242m**Groq Summarize Model** (resolveModelConfig lines 115-120):[0m
[38;2;248;248;242m1. `projectConfig.model.groqSummarize`[0m
[38;2;248;248;242m2. `projectConfig.groqSummarizeModel`[0m
[38;2;248;248;242m3. `globalConfig.model.groqSummarize`[0m
[38;2;248;248;242m4. `globalConfig.groqSummarizeModel`[0m
[38;2;248;248;242m5. **DEFAULT:** `llama-3.3-70b-versatile`[0m

[38;2;248;248;242m**Whisper Model** (resolveModelConfig lines 122-128):[0m
[38;2;248;248;242m1. `process.env.MNS_WHISPER_MODEL`[0m
[38;2;248;248;242m2. `projectConfig.model.whisper`[0m
[38;2;248;248;242m3. `projectConfig.whisperModel`[0m
[38;2;248;248;242m4. `globalConfig.model.whisper`[0m
[38;2;248;248;242m5. `globalConfig.whisperModel`[0m
[38;2;248;248;242m6. **DEFAULT:** `base` (models: tiny/base/small/medium/large-v3)[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 5. PROVIDER DETECTION & CHAIN RESOLUTION[0m

[38;2;248;248;242m### Provider Availability Check[0m

[38;2;248;248;242m**GeminiProvider.isAvailable()** (gemini-provider.ts line 17-19):[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242masync isAvailable(): Promise<boolean> {[0m
[38;2;248;248;242m  return !!this.config.geminiApiKey[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**GroqProvider.isAvailable()** (groq-provider.ts line 33-35):[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242masync isAvailable(): Promise<boolean> {[0m
[38;2;248;248;242m  return !!this.config.groqApiKey[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m**LocalWhisperProvider.isAvailable()** (local-whisper-provider.ts line 45-71):[0m
[38;2;248;248;242m```typescript[0m
[38;2;248;248;242masync isAvailable(): Promise<boolean> {[0m
[38;2;248;248;242m  if (this.available !== null) return this.available[0m
[38;2;248;248;242m  [0m
[38;2;248;248;242m  if (isMnsVenvReady()) {[0m
[38;2;248;248;242m    this.available = true[0m
[38;2;248;248;242m    return true[0m
[38;2;248;248;242m  }[0m
[38;2;248;248;242m  [0m
[38;2;248;248;242m  try {[0m
[38;2;248;248;242m    const { stdout } = await execa('python3', ['-c', 'import faster_whisper; print("ok")'])[0m
[38;2;248;248;242m    this.available = stdout.trim() === 'ok'[0m
[38;2;248;248;242m  } catch {[0m
[38;2;248;248;242m    try {[0m
[38;2;248;248;242m      const { stdout } = await execa('python', ['-c', 'import faster_whisper; print("ok")'])[0m
[38;2;248;248;242m      this.available = stdout.trim() === 'ok'[0m
[38;2;248;248;242m    } catch {[0m
[38;2;248;248;242m      this.available = false[0m
[38;2;248;248;242m    }[0m
[38;2;248;248;242m  }[0m
[38;2;248;248;242m  [0m
[38;2;248;248;242m  return this.available[0m
[38;2;248;248;242m}[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m### Resolution Order (registry.ts lines 20-35)[0m

[38;2;248;248;242m```[0m
[38;2;248;248;242m1. ✓ GeminiProvider (requires GEMINI_API_KEY or GOOGLE_API_KEY)[0m
[38;2;248;248;242m   ↓ (if not available)[0m
[38;2;248;248;242m2. ✓ GroqProvider (requires GROQ_API_KEY)[0m
[38;2;248;248;242m   ↓ (if not available)[0m
[38;2;248;248;242m3. ✓ LocalWhisperProvider (requires faster-whisper Python package)[0m
[38;2;248;248;242m   ↓ (if not available)[0m
[38;2;248;248;242m4. ✗ NoProviderAvailableError (user setup guide)[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 6. SUMMARY STATISTICS[0m

[38;2;248;248;242m### Reference Density[0m

[38;2;248;248;242m| Provider | Files | Refs | Lines | Density |[0m
[38;2;248;248;242m|----------|-------|------|-------|---------|[0m
[38;2;248;248;242m| **Gemini** | 7 | 40+ | 787 | 5.1% |[0m
[38;2;248;248;242m| **Groq** | 6 | 35+ | 441 | 7.9% |[0m
[38;2;248;248;242m| **Whisper (Local)** | 5 | 38+ | 448 | 8.5% |[0m
[38;2;248;248;242m| **Shared** | 4 | 25+ | 437 | 5.7% |[0m

[38;2;248;248;242m### Files by Reference Count[0m

[38;2;248;248;242m**HIGH:** (20+ refs each)[0m
[38;2;248;248;242m- `src/providers/groq-provider.ts` — 40 refs (API integration)[0m
[38;2;248;248;242m- `src/providers/local-whisper-provider.ts` — 35 refs (subprocess + detection)[0m
[38;2;248;248;242m- `src/services/transcriber.ts` — 25 refs (Gemini API calls)[0m
[38;2;248;248;242m- `src/utils/config.ts` — 20+ refs (config key resolution)[0m

[38;2;248;248;242m**MEDIUM:** (5-10 refs each)[0m
[38;2;248;248;242m- `src/services/summarizer.ts` — 10 refs[0m
[38;2;248;248;242m- `src/providers/gemini-provider.ts` — 8 refs[0m
[38;2;248;248;242m- `src/providers/registry.ts` — 7 refs[0m
[38;2;248;248;242m- `src/types/index.ts` — 15 refs[0m
[38;2;248;248;242m- `src/utils/constants.ts` — 4 refs[0m
[38;2;248;248;242m- `src/providers/types.ts` — 8 refs[0m

[38;2;248;248;242m**LOW:** (<5 refs)[0m
[38;2;248;248;242m- `src/commands/analyze/index.ts` — 2 refs (provider delegation)[0m
[38;2;248;248;242m- `src/commands/config/index.ts` — 1 ref[0m
[38;2;248;248;242m- `src/utils/whisper-installer.ts` — 8 refs[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 7. KEY IMPLEMENTATION PATTERNS[0m

[38;2;248;248;242m### Pattern 1: Provider Chain (Polymorphism)[0m
[38;2;248;248;242mAll providers implement `TranscribeProvider` interface:[0m
[38;2;248;248;242m- Enables transparent provider swapping[0m
[38;2;248;248;242m- `resolveProvider()` auto-detects & returns first available[0m
[38;2;248;248;242m- User can set multiple API keys; system picks by priority[0m

[38;2;248;248;242m### Pattern 2: API Key Separation[0m
[38;2;248;248;242m- **Config layer** (config.ts): Loads & resolves keys from environment, files[0m
[38;2;248;248;242m- **Provider layer** (groq-provider.ts, gemini-provider.ts): Accepts resolved keys[0m
[38;2;248;248;242m- **Service layer** (transcriber.ts, summarizer.ts): Works with API clients[0m

[38;2;248;248;242m### Pattern 3: Model Configuration[0m
[38;2;248;248;242m- **Single source of truth**: `utils/constants.ts` defines defaults[0m
[38;2;248;248;242m- **Multi-level override**: CLI flag > env var > project config > global config > default[0m
[38;2;248;248;242m- **Schema support**: Both nested (`model: { gemini: "..." }`) and flat (`geminiModel: "..."`)[0m

[38;2;248;248;242m### Pattern 4: Async Provider Detection[0m
[38;2;248;248;242m- Groq/Gemini: Lightweight (check config value)[0m
[38;2;248;248;242m- Local Whisper: Heavy (subprocess execution, cached in `this.available`)[0m
[38;2;248;248;242m- Called once at startup via `resolveProvider()`[0m

[38;2;248;248;242m### Pattern 5: Transcription Abstraction[0m
[38;2;248;248;242m- **Groq**: Raw Whisper API (OpenAI SDK)[0m
[38;2;248;248;242m- **Gemini**: Multimodal file + prompt[0m
[38;2;248;248;242m- **Local**: Python subprocess (faster-whisper)[0m
[38;2;248;248;242m- All normalize to `TranscriptSegment[]` with `[HH:MM:SS -> HH:MM:SS]` timestamps[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m## 8. UNRESOLVED QUESTIONS[0m

[38;2;248;248;242m1. **Gemini Model Versioning**: Is `gemini-3.1-pro-preview` the latest? Any deprecated models?[0m
[38;2;248;248;242m2. **Groq Rate Limits**: Max concurrent requests, token limits per tier?[0m
[38;2;248;248;242m3. **Local Whisper Models**: Performance/accuracy comparison (tiny vs. base vs. large-v3)?[0m
[38;2;248;248;242m4. **Fallback Strategy**: If primary provider fails mid-transcription, retry with next provider?[0m
[38;2;248;248;242m5. **Config Persistence**: Does `mns config` command store to global or project level by default?[0m
[38;2;248;248;242m6. **Translation Quality**: Groq summarization model vs. Gemini translation endpoint?[0m
[38;2;248;248;242m7. **Chunk Timeout**: Any timeout handling for long-running transcription jobs?[0m

[38;2;248;248;242m---[0m

[38;2;248;248;242m**END OF REPORT**[0m
