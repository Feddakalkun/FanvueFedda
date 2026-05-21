param(
  [string[]]$Roots = @("H:\finalfanvue", "H:\Fanvue_final", "H:\Fanvue_Ultimate_Recovered")
)

$ErrorActionPreference = "Continue"

Write-Host "Legacy scan started..."

foreach ($root in $Roots) {
  if (-not (Test-Path $root)) {
    Write-Host "Missing: $root"
    continue
  }

  Write-Host ""
  Write-Host "=== $root ==="

  $gitPath = Join-Path $root ".git"
  Write-Host ".git exists: $([bool](Test-Path $gitPath))"

  Write-Host "Top files:"
  Get-ChildItem -Path $root -Force | Select-Object -First 20 Name, Mode, Length

  Write-Host "Key manifests:"
  Get-ChildItem -Path $root -Recurse -File -Include package.json,requirements.txt,*.sln,*.code-workspace -ErrorAction SilentlyContinue |
    Select-Object FullName
}

Write-Host ""
Write-Host "Legacy scan completed."
