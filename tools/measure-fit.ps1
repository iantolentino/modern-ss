param([string]$Viewports = "390x844,1440x900,1920x1080,2560x1400,768x1024")
$ErrorActionPreference = "Continue"
$site = "C:\Users\ianto\Downloads\ai-tests\strata-modern"
Set-Location $site
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$prof = Join-Path $env:TEMP ("dsh-p-" + (Get-Random))
New-Item -ItemType Directory -Force -Path $prof | Out-Null

# make sure the preview server is up
try { node -e "fetch('http://127.0.0.1:4173/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; if ($LASTEXITCODE -ne 0) { throw "down" } }
catch {
  Start-Process -FilePath "node" -ArgumentList "serve.mjs","4173" -WorkingDirectory $site -WindowStyle Hidden
  Start-Sleep -Seconds 2
}

foreach ($v in $Viewports.Split(',')) {
  Remove-Item _probe-result.txt -Force -ErrorAction SilentlyContinue
  $ok = $false
  for ($i = 1; $i -le 4 -and -not $ok; $i++) {
    & $chrome --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --user-data-dir="$prof" `
      --window-size=1600,1000 --virtual-time-budget=180000 `
      --screenshot="$env:TEMP\fit-$v.png" "http://127.0.0.1:4173/tools/measure-fit.html?v=$v" 2>$null | Out-Null
    Start-Sleep -Seconds 3
    if (Test-Path _probe-result.txt) { $ok = $true }
  }
  if ($ok) { Get-Content _probe-result.txt } else { Write-Output "viewport $v : NO RESULT" }
  Write-Output ""
}
