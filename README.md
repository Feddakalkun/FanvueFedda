# Fanvue Autoposter Ultimate

Local-first social automation platform with AI content generation, scheduling, and multi-provider LLM support.

## Current Status

This workspace is initialized with:
- Recovered Next.js app source from `H:\Fanvue_Ultimate_Recovered\src`
- Recovered setup scripts from `H:\Fanvue_Ultimate_Recovered\scripts`
- New architecture folders for Electron/main process, core APIs, AI, scheduling, and media pipelines

## Collaboration Rule

- Every fix/change must be logged in `H:\Fanvue_use_this\MEMORY_LOG.md` immediately after the change.

## Quick Start

```powershell
cd H:\Fanvue_use_this
npm install
npm run dev
```

## Structure

- `src/renderer` recovered frontend + API routes
- `src/core` new unified app core (scheduler, providers, media, autopost pipeline)
- `src/main` Electron/system integration (to be expanded)
- `assets/workflows` ComfyUI workflow storage
- `docs/migration_inventory.md` map of legacy code to migrate

## Immediate Next Milestones

1. Stabilize provider layer (Fanvue + Ollama + Venice + OpenAI/Grok adapters)
2. Add scheduler and content calendar engine
3. Add autopost queue + retry + audit logs
4. Add installer and one-click launcher for distribution
