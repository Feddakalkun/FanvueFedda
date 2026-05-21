param(
  [string]$Source = "H:\Fanvue_use_this",
  [string]$Target = "H:\Fanvue_use_this_test_installer"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $Source)) {
  throw "Source path does not exist: $Source"
}

if (-not (Test-Path $Target)) {
  New-Item -ItemType Directory -Force -Path $Target | Out-Null
}

# Keep test folder clean from build artifacts and local runtime state.
$excludeDirs = @(
  ".git",
  "node_modules",
  ".next",
  "logs",
  "temp",
  "output",
  ".readme"
)

$excludeFiles = @(
  ".env.local",
  ".env",
  "MEMORY_LOG.md"
)

Write-Host "Syncing source to test installer folder..."
Write-Host "Source: $Source"
Write-Host "Target: $Target"

& robocopy $Source $Target /MIR /R:2 /W:2 /NFL /NDL /NP /XO /XD $excludeDirs /XF $excludeFiles | Out-Host

if ($LASTEXITCODE -ge 8) {
  throw "Robocopy failed with exit code $LASTEXITCODE"
}

Write-Host "Sync complete."
