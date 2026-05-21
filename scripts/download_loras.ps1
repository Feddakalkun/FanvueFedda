# Download LoRAs from Google Drive for Feddakalkun
$ErrorActionPreference = "Stop"

$ProjectPath = Get-Location
$VenvPath = Join-Path $ProjectPath "engine\.venv"
$PythonExe = Join-Path $VenvPath "Scripts\python.exe"
$PipExe = Join-Path $VenvPath "Scripts\pip.exe"
$LorasPath = Join-Path $ProjectPath "engine\ComfyUI\models\loras"
$DriveFolderId = "1jdliAnhXJG2TdqU6tNi5tbpoAOPuJalv"

Write-Host "--- LORA DOWNLOADER ---" -ForegroundColor Cyan

# 1. Ensure dir exists
if (!(Test-Path $LorasPath)) {
    Write-Host "[*] Creating target directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $LorasPath | Out-Null
}

# 2. Ensure gdown is installed in our venv
Write-Host "[*] Checking for gdown tool..." -ForegroundColor Yellow
& $PipExe install --upgrade gdown | Out-Null

# 3. Download folder
Write-Host "[*] Downloading character LoRAs from Google Drive (Folder ID: $DriveFolderId)..." -ForegroundColor Yellow
Write-Host "[!] This may take a while depending on your connection..." -ForegroundColor Gray

# gdown prints its own progress
& $PythonExe -m gdown --folder $DriveFolderId -O $LorasPath --remaining-ok

Write-Host "`n[OK] All LoRAs downloaded and placed in $LorasPath" -ForegroundColor Green
pause
