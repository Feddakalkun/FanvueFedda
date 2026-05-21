# Download Model Packages for Feddakalkun
param([string]$PackageId)

$ErrorActionPreference = "Stop"
$ProjectPath = Get-Location
$VenvPath = Join-Path $ProjectPath "engine\.venv"
$PythonExe = Join-Path $VenvPath "Scripts\python.exe"
$PipExe = Join-Path $VenvPath "Scripts\pip.exe"
$ComfyPath = Join-Path $ProjectPath "engine\ComfyUI"

Write-Host "--- MODEL PACKAGE MANAGER ---" -ForegroundColor Cyan

# Ensure huggingface_hub is ready
if (!(Test-Path $PythonExe)) {
    Write-Error "Virtual environment not found at $VenvPath. Please run install.bat first."
}
& $PipExe install --upgrade huggingface_hub | Out-Null

function Download-Models($Models) {
    foreach ($m in $Models) {
        $fullDest = Join-Path $ComfyPath $m.Dest
        $destDir = Split-Path $fullDest
        if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
        
        if (Test-Path $fullDest) {
            Write-Host "[OK] $($m.Dest) already exists." -ForegroundColor Gray
        }
        else {
            Write-Host "[*] Downloading $($m.File) from $($m.Repo)..." -ForegroundColor Yellow
            # Use raw string (r'') in Python to handle Windows backslashes in paths
            & $PythonExe -c "from huggingface_hub import hf_hub_download; hf_hub_download(repo_id='$($m.Repo)', filename='$($m.File)', local_dir=r'$destDir', local_dir_use_symlinks=False)"
            
            $downloadedFile = Join-Path $destDir $m.File
            if ((Test-Path "$downloadedFile") -and ("$downloadedFile" -ne "$fullDest")) {
                Move-Item -Path "$downloadedFile" -Destination "$fullDest" -Force
            }
        }
    }
}

$Packages = @{
    "1" = @{
        Name   = "Z-Image Portrait (Character Creator)"
        Models = @(
            @{ Repo = "Comfy-Org/z_image_turbo"; File = "split_files/diffusion_models/z_image_turbo_bf16.safetensors"; Dest = "models\unet\z_image_turbo_bf16.safetensors" },
            @{ Repo = "Comfy-Org/z_image_turbo"; File = "split_files/text_encoders/qwen_3_4b.safetensors"; Dest = "models\clip\qwen_3_4b.safetensors" },
            @{ Repo = "Comfy-Org/z_image_turbo"; File = "split_files/vae/ae.safetensors"; Dest = "models\vae\z-image-vae.safetensors" },
            @{ Repo = "alibaba-pai/Z-Image-Turbo-Fun-Controlnet-Union"; File = "Z-Image-Turbo-Fun-Controlnet-Union.safetensors"; Dest = "models\controlnet\Z-Image-Turbo-Fun-Controlnet-Union.safetensors" }
        )
    }
    "2" = @{
        Name   = "Video Suite (Wan 2.1 + LTX-Video)"
        Models = @(
            @{ Repo = "Comfy-Org/Wan_2.1_ComfyUI_repack"; File = "wan2.1_i2v_480p_14b_fp8_e4m3fn.safetensors"; Dest = "models\diffusion_models\wan2.1_i2v_480p_14b_fp8.safetensors" },
            @{ Repo = "Comfy-Org/Wan_2.1_ComfyUI_repack"; File = "google_t5-v1_1-xxl_encoder_fp8_e4m3fn.safetensors"; Dest = "models\clip\google_t5_xxl_fp8.safetensors" },
            @{ Repo = "lightricks/LTX-Video"; File = "ltx-video-2b-fp16.safetensors"; Dest = "models\checkpoints\ltx-video-2b-fp16.safetensors" }
        )
    }
    "3" = @{
        Name   = "Upscalers & Enhancement (Ultimate SD/ESRGAN)"
        Models = @(
            @{ Repo = "Kirrin/ESRGAN-Models"; File = "4x-UltraSharp.pth"; Dest = "models\upscale_models\4x-UltraSharp.pth" },
            @{ Repo = "Kirrin/ESRGAN-Models"; File = "RealESRGAN_x4plus.pth"; Dest = "models\upscale_models\RealESRGAN_x4plus.pth" }
        )
    }
}

if ([string]::IsNullOrEmpty($PackageId)) {
    Write-Host "Select model packages to download (e.g. 1 or 1,2):"
    foreach ($k in $Packages.Keys | Sort-Object) {
        Write-Host "$k) $($Packages[$k].Name)"
    }
    $choices = Read-Host "`nSelection"
    $idList = $choices.Split(',')
}
else {
    $idList = $PackageId.Split(',')
}

foreach ($id in $idList) {
    $id = $id.Trim()
    if ($Packages.ContainsKey($id)) {
        Write-Host "`n--- Installing: $($Packages[$id].Name) ---" -ForegroundColor Cyan
        Download-Models $Packages[$id].Models
    }
    else {
        Write-Host "[!] Unknown package ID: $id" -ForegroundColor Red
    }
}

Write-Host "`n[DONE] All selected packages processed." -ForegroundColor Green
pause
