# Journal: Gemini-Only Cleanup Plan

**Date:** 2026-04-02  
**Session Type:** Planning & Brainstorm

## Decision
Pivot from 3-provider architecture (Gemini → Groq → LocalWhisper chain) to **Gemini-only**. Groq API licensing issues + local Whisper complexity made them unviable.

## Rationale
- **KISS/YAGNI**: Multi-provider fallback chain adds complexity without proven benefit
- **Maintainability**: 1 provider >> 3 providers + registry abstraction layer
- **Dependencies**: Eliminate `openai` npm package (Groq-only)
- **UX**: Clearer error handling vs silent fallback logic

## Architectural Impact
- Delete: `groq-provider.ts`, `local-whisper-provider.ts`, `whisper-installer.ts`, `registry.ts`
- Simplify: Provider layer → just GeminiProvider; `analyze` command wires directly
- Refactor: ProcessingConfig, MnsConfigFile, constants (remove groq/whisper fields)
- Documentation: Gemini-only setup guides

## Implementation Plan
6 phases in `plans/260402-0013-gemini-only-cleanup/`:
1. Delete unused provider files
2. Simplify provider layer (remove abstraction)
3. Clean config types/constants
4. Update commands (analyze, config)
5. Remove openai dep + verify build
6. Rewrite docs (system-architecture, gemini-setup-guide, README)

## Risk/Mitigation
- **Risk**: Breaking change for users; **Mitigation**: Major version bump, migration guide
- **Risk**: Loss of fallback robustness; **Mitigation**: Better Gemini error handling
- **Risk**: Dependency on single API; **Mitigation**: Acceptable for MVP scope

## Next
Delegation chain: cleanup phases 1-5 → docs rewrite (phase 6) → testing → release notes.
