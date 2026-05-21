param(
  [Parameter(Mandatory = $true)][string]$Change,
  [Parameter(Mandatory = $true)][string]$Files,
  [Parameter(Mandatory = $true)][string]$Details,
  [Parameter(Mandatory = $true)][string]$Verification
)

$logPath = "H:\Fanvue_use_this\MEMORY_LOG.md"
$date = Get-Date -Format "yyyy-MM-dd"
$time = Get-Date -Format "HH:mm"

$entry = @"

- Date: $date
- Time: $time
- Change: $Change
- Files: $Files
- Details: $Details
- Verification: $Verification
"@

Add-Content -Path $logPath -Value $entry
Write-Host "Logged change to $logPath"
