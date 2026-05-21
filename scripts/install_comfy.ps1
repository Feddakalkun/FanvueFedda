# Feddakalkun ComfyUI Installer v1.0
# Target: Python 3.11 | Torch 2.5.1 | CUDA 12.4 (Optimal for RTX 3090)

$ErrorActionPreference = "Stop"
$ProjectPath = Get-Location
$EnginePath = Join-Path $ProjectPath "engine"
$VenvPath = Join-Path $EnginePath ".venv"
$ComfyPath = Join-Path $EnginePath "ComfyUI"

Write-Host "--- INITIALIZING FEDDAKALKUN ENGINE SETUP ---" -ForegroundColor Cyan

# 1. Create Engine Directory
if (!(Test-Path $EnginePath)) {
    New-Item -ItemType Directory -Path $EnginePath | Out-Null
}

# 2. Setup Virtual Environment (Python 3.11)
if (!(Test-Path $VenvPath)) {
    Write-Host "[*] Creating Python venv in $VenvPath..." -ForegroundColor Yellow
    # Attempt to find python3.11 specifically, fallback to python
    $py = "python"
    try {
        & python --version | Out-Null
    }
    catch {
        Write-Error "Python not found. Please install Python 3.11."
    }
    
    & $py -m venv $VenvPath
}

$PythonExe = Join-Path $VenvPath "Scripts\python.exe"
$PipExe = Join-Path $VenvPath "Scripts\pip.exe"

# 3. Install PyTorch (CUDA 12.4 for 3090)
Write-Host "[*] Checking PyTorch..." -ForegroundColor Yellow
$torchStatus = "0"
try {
    $torchStatus = & $PythonExe -c "import torch; print('1')" 2>$null
}
catch {}

if ($torchStatus -ne "1") {
    Write-Host "[*] Installing PyTorch 2.5.1 + CUDA 12.4 (This can be slow)..." -ForegroundColor Yellow
    & $PipExe install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
}
else {
    Write-Host "[*] PyTorch already installed." -ForegroundColor Gray
}

# 4. Clone ComfyUI Core
if (!(Test-Path $ComfyPath)) {
    Write-Host "[*] Cloning ComfyUI Core..." -ForegroundColor Yellow
    git clone https://github.com/comfyanonymous/ComfyUI $ComfyPath
}

# 5. Install ComfyUI Dependencies
Write-Host "[*] Installing ComfyUI dependencies..." -ForegroundColor Yellow
& $PipExe install -r (Join-Path $ComfyPath "requirements.txt")

# 6. Install Custom Nodes from nodes.json
$NodesJson = Join-Path $ProjectPath "config\nodes.json"
if (Test-Path $NodesJson) {
    Write-Host "[*] Installing Custom Nodes from configuration..." -ForegroundColor Yellow
    $nodes = Get-Content $NodesJson | ConvertFrom-Json
    $CustomNodesPath = Join-Path $ComfyPath "custom_nodes"
    
    foreach ($node in $nodes) {
        $nodeFolder = Join-Path $CustomNodesPath $node.folder
        if (!(Test-Path $nodeFolder)) {
            Write-Host "  > Cloning $($node.name)..." -ForegroundColor Gray
            git clone $node.url $nodeFolder
        }
        else {
            Write-Host "  > $($node.name) already exists. Checking dependencies..." -ForegroundColor Gray
        }
        
        # Always check for and install requirements.txt in the main folder and subfolders (some nodes have nested deps)
        $reqFiles = Get-ChildItem -Path $nodeFolder -Filter "requirements.txt" -Recurse
        foreach ($req in $reqFiles) {
            Write-Host "    - Installing dependencies from $($req.FullName)..." -ForegroundColor DarkGray
            & $PipExe install -r $req.FullName | Out-Null
        }
    }
}

Write-Host "`n--- SETUP COMPLETE ---" -ForegroundColor Green
Write-Host "To start ComfyUI, run: .\engine\.venv\Scripts\python.exe engine\ComfyUI\main.py" -ForegroundColor Cyan
