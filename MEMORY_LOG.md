# Memory Log (Persistent)

This file is mandatory and must be updated after every fix/change.

## Entry Template

- Date: YYYY-MM-DD
- Time: HH:MM (local)
- Change: Short title
- Files: absolute or project-relative paths
- Details: what changed and why
- Verification: how it was checked

---

## Entries

- Date: 2026-05-21
- Time: 00:00
- Change: Created persistent memory log system
- Files: MEMORY_LOG.md
- Details: Added mandatory memory log and update template for all future fixes.
- Verification: File created in project root.

- Date: 2026-05-21
- Time: 00:01
- Change: Added workflow enforcement rules
- Files: docs/WORKFLOW_RULES.md
- Details: Documented mandatory process that requires MEMORY_LOG.md update after every fix/change.
- Verification: Rules file created and saved.

- Date: 2026-05-21
- Time: 00:02
- Change: Added weekly calendar theme module
- Files: src/core/content/calendar.js
- Details: Created reusable weekly content theme helper for scheduler and UI integration.
- Verification: Module exports checked visually for WEEKLY_THEME and getThemeForDate.

- Date: 2026-05-21
- Time: 00:03
- Change: Added content queue core
- Files: src/core/content/queue.js
- Details: Implemented queue with enqueue, due-item selection, sent state, and retry/dead-letter handling.
- Verification: Methods and status transitions reviewed in source.

- Date: 2026-05-21
- Time: 00:04
- Change: Added autoposter orchestrator
- Files: src/core/content/autoposter.js
- Details: Connected scheduler + calendar + queue into one run loop with pluggable publish adapter and retry behavior.
- Verification: Source reviewed for planPost and runOnce flow.

- Date: 2026-05-21
- Time: 00:05
- Change: Added collaboration logging rule to README
- Files: README.md
- Details: Made the mandatory MEMORY_LOG update process visible to all collaborators and local agents.
- Verification: README updated with dedicated Collaboration Rule section.

- Date: 2026-05-21
- Time: 00:06
- Change: Added phased roadmap
- Files: docs/ROADMAP.md
- Details: Documented delivery phases from baseline to production release packaging.
- Verification: Roadmap file created with five build phases.

- Date: 2026-05-21
- Time: 00:07
- Change: Added log helper script
- Files: scripts/log_change.ps1
- Details: Added standard script for appending structured entries to MEMORY_LOG.md for multi-agent collaboration.
- Verification: Script added with required parameters and log append behavior.

- Date: 2026-05-21
- Time: 00:10
- Change: Hardened queue lifecycle and autoposter contract
- Files: src/core/content/queue.js, src/core/content/autoposter.js
- Details: Added status history, retry/dead-letter event history, queue stats/list/history accessors, plan-time validation, run metadata, and summary/health methods.
- Verification: Source review confirms required API shape and queue transition coverage.

- Date: 2026-05-21
- Time: 00:14
- Change: Added provider orchestration and Fanvue core adapter stack
- Files: src/core/api/errors.js, src/core/api/providerOrchestrator.js, src/core/api/fanvue/*, src/core/content/adapters/fanvueAdapter.js
- Details: Implemented explicit error categories, provider fallback orchestrator, consolidated Fanvue auth/token/content/messaging/webhook modules, and first platform adapter contract implementation.
- Verification: Source review confirms required methods: publish/validate/health and token refresh flow.

- Date: 2026-05-21
- Time: 00:17
- Change: Added shared runtime and dashboard API contracts
- Files: src/renderer/lib/server/runtime.ts, src/renderer/app/api/queue/route.ts, src/renderer/app/api/providers/health/route.ts, src/renderer/app/api/dashboard/summary/route.ts
- Details: Wired singleton runtime with autoposter + provider orchestrator and exposed required API endpoints for queue, provider health, and command-dashboard summary.
- Verification: Route handlers created with GET contracts and queue POST actions (plan/run).

- Date: 2026-05-21
- Time: 00:21
- Change: Rebuilt homepage into live Command Dashboard
- Files: src/renderer/app/page.tsx
- Details: Replaced previous studio shell with data-backed dashboard blocks for queue stats, scheduled posts, provider health, generation status, and recent failures, plus plan/run controls.
- Verification: Source review confirms dashboard consumes /api/dashboard/summary and /api/queue.

- Date: 2026-05-21
- Time: 00:22
- Change: Upgraded global UI system to Nordic Editorial style
- Files: src/renderer/app/globals.css
- Details: Replaced old dark-purple glass styling with premium editorial tokens, typography, responsive panel system, status chips, and purposeful shimmer loading state.
- Verification: CSS contains new token palette, typography stack, and dashboard layout classes used by page.tsx.

- Date: 2026-05-21
- Time: 00:24
- Change: Added core autoposter contract tests and test runner script
- Files: tests/core.autoposter.test.js, package.json
- Details: Added assertions for queue retry behavior, dead-letter transitions, sent-state success path, and scheduler future-time behavior; wired npm test script.
- Verification: Test file includes deterministic run-loop checks and process exit on failure.

- Date: 2026-05-21
- Time: 00:27
- Change: Consolidated OAuth start route onto core FanvueAuth
- Files: src/renderer/app/api/auth/fanvue/route.ts, src/core/api/fanvue/auth.js
- Details: Replaced split PKCE implementation with core auth class usage and added constructor override support for DB-provided credentials and redirect URI.
- Verification: Route now generates PKCE through FanvueAuth and builds authorization URL via core method.

- Date: 2026-05-21
- Time: 00:28
- Change: Fixed OAuth URL parameter order bug
- Files: src/renderer/app/api/auth/fanvue/route.ts
- Details: Corrected argument order for getAuthorizationUrl(codeChallenge, state) to prevent malformed authorization requests.
- Verification: Method call now matches core auth signature.

- Date: 2026-05-21
- Time: 00:29
- Change: Consolidated OAuth callback token exchange and token storage
- Files: src/renderer/app/api/auth/fanvue/callback/route.ts
- Details: Switched callback from manual token request to core FanvueAuth.exchangeCodeForTokens and persisted encrypted token bundle into TokenStore.
- Verification: Callback route now uses FanvueAuth + TokenStore and still updates character persistence flow.

- Date: 2026-05-21
- Time: 00:30
- Change: Added Fanvue webhook verification endpoint
- Files: src/renderer/app/api/fanvue/webhooks/route.ts
- Details: Added webhook POST route with signature verification and event routing through core messaging/webhook modules.
- Verification: Route rejects invalid signatures and returns structured handler results for valid payloads.

- Date: 2026-05-21
- Time: 00:34
- Change: Added source-to-test installer sync script
- Files: scripts/sync_to_test_installer.ps1
- Details: Implemented one-way mirror sync from main source folder to test installer folder with exclusions for git, build artifacts, runtime outputs, and local env files.
- Verification: Script created with robocopy mirror logic and failure handling.

- Date: 2026-05-21
- Time: 00:35
- Change: Added npm sync command
- Files: package.json
- Details: Added `sync:test` script to run the test-installer synchronization in one command.
- Verification: package.json scripts include `sync:test`.

- Date: 2026-05-21
- Time: 00:36
- Change: Documented dual-folder workflow
- Files: docs/TEST_SYNC_WORKFLOW.md
- Details: Added explicit operational rules for keeping Git work in source folder and installer validation in synced test folder.
- Verification: Workflow doc created with paths, command, and exclusions.

- Date: 2026-05-21
- Time: 00:37
- Change: Fixed robocopy argument bug in sync script
- Files: scripts/sync_to_test_installer.ps1
- Details: Replaced invalid dynamically-built /XD and /XF arguments with native robocopy parameter usage to prevent parameter parsing failure.
- Verification: Script updated to invoke robocopy with `/XD $excludeDirs /XF $excludeFiles`.

- Date: 2026-05-21
- Time: 00:40
- Change: Added root Windows installer
- Files: install.bat
- Details: Implemented stable first-run installer covering dependency checks, npm install, app venv creation, optional requirements install, ComfyUI setup, and optional Prisma db push.
- Verification: Script includes explicit command checks, ordered setup stages, and failure exits.

- Date: 2026-05-21
- Time: 00:41
- Change: Added root runtime launcher
- Files: run.bat
- Details: Implemented one-command launch that starts ComfyUI and Next.js app in separate windows with preflight checks for required files.
- Verification: Script validates ComfyUI venv/core and npm availability before launching processes.

- Date: 2026-05-21
- Time: 00:42
- Change: Added root updater for repo and mirror scenarios
- Files: update.bat
- Details: Implemented updater that uses git pull in repo environments and falls back to source-folder sync for test-installer mirror environments, then refreshes deps.
- Verification: Script contains `.git` branch logic, dependency refresh steps, and error handling.

- Date: 2026-05-21
- Time: 00:43
- Change: Added command aliases and documented installer workflow
- Files: package.json, docs/TEST_SYNC_WORKFLOW.md
- Details: Added npm aliases for install/run/update windows scripts and documented the stable install/run/update path for test and end-user usage.
- Verification: `package.json` scripts and workflow doc now reference install.bat, run.bat, and update.bat.
