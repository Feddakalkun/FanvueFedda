# Test Sync Workflow

Primary source repo:
- `H:\Fanvue_use_this` (Git + push to GitHub)

Installer/test folder:
- `H:\Fanvue_use_this_test_installer` (local testing/staging)

## Rule

Use source folder for all implementation and git operations.  
Use test folder only as synced runtime copy for installer and end-to-end testing.

## Sync Command

From `H:\Fanvue_use_this`:

```powershell
npm run sync:test
```

This mirrors source into test folder while excluding:
- `.git`
- `node_modules`
- `.next`
- `logs`
- `temp`
- `output`
- `.readme`
- `.env.local`
- `.env`
- `MEMORY_LOG.md`

## Installer Flow (for test folder and end users)

From the project root:

```powershell
install.bat
run.bat
update.bat
```

- `install.bat` sets up Node deps, app venv, optional Python requirements, ComfyUI engine/venv, and Prisma db push when available.
- `run.bat` launches ComfyUI and app UI in separate windows.
- `update.bat` updates from Git when `.git` exists, or falls back to source-folder sync for mirror/test-installer environments.
