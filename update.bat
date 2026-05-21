@echo off
setlocal EnableExtensions
cd /d %~dp0

echo ============================================================
echo FanvueFedda Updater
echo ============================================================

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js first.
  exit /b 1
)

if exist ".git" (
  echo Updating from Git repository...
  git fetch origin
  if errorlevel 1 goto :fail
  git pull --ff-only origin main
  if errorlevel 1 goto :fail
) else (
  echo No .git folder found here.
  if exist "H:\Fanvue_use_this\scripts\sync_to_test_installer.ps1" (
    echo Syncing from main source folder instead...
    powershell -ExecutionPolicy Bypass -File "H:\Fanvue_use_this\scripts\sync_to_test_installer.ps1"
    if errorlevel 1 goto :fail
  ) else (
    echo [ERROR] Cannot auto-update without .git or source sync script.
    echo Reinstall from latest package or clone repository.
    exit /b 1
  )
)

echo Installing/updating Node dependencies...
call npm install
if errorlevel 1 goto :fail

if exist "prisma\schema.prisma" (
  echo Applying Prisma schema updates...
  call npm run db:push
  if errorlevel 1 goto :fail
)

if exist ".venv\Scripts\python.exe" (
  if exist "requirements.txt" (
    echo Updating app Python dependencies...
    call .venv\Scripts\python.exe -m pip install -r requirements.txt
    if errorlevel 1 goto :fail
  )
)

echo Updating ComfyUI dependencies...
powershell -ExecutionPolicy Bypass -File ".\scripts\install_comfy.ps1"
if errorlevel 1 goto :fail

echo.
echo Update completed.
exit /b 0

:fail
echo.
echo [ERROR] Update failed. Check output above.
exit /b 1
