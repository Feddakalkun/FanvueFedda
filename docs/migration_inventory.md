# Migration Inventory (Phase 1)

Date: 2026-05-21  
Workspace: `H:\Fanvue_use_this`

## Legacy Sources Checked

- `H:\finalfanvue` (minimal visible content, no `.git` found)
- `H:\Fanvue_final` (installer-oriented bundle, no `.git` found)
- `H:\Fanvue_Ultimate_Recovered` (full Next.js app, no `.git` found)

## Reused Immediately

- `H:\Fanvue_Ultimate_Recovered\src` -> `H:\Fanvue_use_this\src\renderer`
- `H:\Fanvue_Ultimate_Recovered\scripts` -> `H:\Fanvue_use_this\scripts`
- Root config files copied: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.env.example`, `.gitignore`

## High-Value Modules to Integrate Next

From recovered app:
- `src/lib/fanvue/*` OAuth/client flow into `src/core/api/fanvue/*`
- `src/app/api/generate/*` prompt+generation pipeline into `src/core/character` and `src/core/media`
- `src/lib/engine.ts` + `src/lib/prompts.ts` into `src/core/content` and `src/core/character`
- `src/lib/tiktok-client.ts` into future multi-platform connectors

From `H:\Fanvue_final`:
- `.bat` installers and run scripts to unify into one-click setup
- `fanvue-hub` subfolder content for any missing API or automation logic

## Git History Recovery

No `.git` directories were detected in the three legacy roots during automated scan.  
Next step: search for zipped/exported repos or remotes in config/docs to recover commit history.

## Risks

- No preserved Git lineage means manual feature provenance validation.
- Recovered app contains generated build artifacts in original folder (`.next`, `node_modules`) that should not be copied further.
- API contract drift likely for Fanvue endpoints; must re-verify before production use.
