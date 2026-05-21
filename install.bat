@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d %~dp0

echo ============================================================
echo FanvueFedda Installer
echo ============================================================

call :need_cmd git "Git is required. Install from https://git-scm.com/download/win"
if errorlevel 1 exit /b 1
call :need_cmd node "Node.js is required. Install from https://nodejs.org/"
if errorlevel 1 exit /b 1
call :need_cmd npm "npm is required. Reinstall Node.js if missing."
if errorlevel 1 exit /b 1

set "PY_CMD="
where py >nul 2>nul && set "PY_CMD=py -3"
if not defined PY_CMD (
  where python >nul 2>nul && set "PY_CMD=python"
)
if not defined PY_CMD (
  echo [ERROR] Python 3 is required. Install from https://www.python.org/downloads/
  exit /b 1
)

echo.
echo [1/5] Installing Node dependencies...
call npm install
if errorlevel 1 goto :fail

echo.
echo [2/5] Creating app Python virtual environment...
if not exist ".venv\Scripts\python.exe" (
  %PY_CMD% -m venv .venv
  if errorlevel 1 goto :fail
)

echo.
echo [3/5] Upgrading pip in app venv...
call .venv\Scripts\python.exe -m pip install --upgrade pip
if errorlevel 1 goto :fail

if exist requirements.txt (
  echo.
  echo [4/5] Installing app Python requirements...
  call .venv\Scripts\python.exe -m pip install -r requirements.txt
  if errorlevel 1 goto :fail
) else (
  echo.
  echo [4/5] No requirements.txt found, skipping app Python deps.
)

echo.
echo [5/5] Installing ComfyUI engine and dependencies...
powershell -ExecutionPolicy Bypass -File ".\scripts\install_comfy.ps1"
if errorlevel 1 goto :fail

if exist prisma\schema.prisma (
  echo.
  echo Preparing Prisma database...
  call npm run db:push
  if errorlevel 1 goto :fail
)

echo.
echo Install completed successfully.
echo Use run.bat to start ComfyUI + FanvueFedda.
exit /b 0

:need_cmd
where %~1 >nul 2>nul
if errorlevel 1 (
  echo [ERROR] %~2
  exit /b 1
)
exit /b 0

:fail
echo.
echo [ERROR] Install failed. Check output above.
exit /b 1
