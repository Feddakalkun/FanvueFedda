@echo off
setlocal EnableExtensions
cd /d %~dp0

echo ============================================================
echo FanvueFedda Runner
echo ============================================================

if not exist "engine\.venv\Scripts\python.exe" (
  echo [ERROR] ComfyUI venv is missing. Run install.bat first.
  exit /b 1
)

if not exist "engine\ComfyUI\main.py" (
  echo [ERROR] ComfyUI core is missing. Run install.bat first.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js and run install.bat.
  exit /b 1
)

echo Starting ComfyUI on port 8188...
start "FanvueFedda-ComfyUI" cmd /k "cd /d %~dp0 && engine\.venv\Scripts\python.exe engine\ComfyUI\main.py --port 8188"

echo Starting web app on port 3000...
start "FanvueFedda-App" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Services launched:
echo - ComfyUI:  http://127.0.0.1:8188
echo - App UI:   http://127.0.0.1:3000
exit /b 0
