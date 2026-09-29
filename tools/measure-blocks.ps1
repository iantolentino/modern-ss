# Measure one page's block heights (and the children of a selector).
#   .\tools\measure-blocks.ps1 -Page index.html -Selector ".opts"
# Keep this file ASCII-only: Windows PowerShell 5.1 reads .ps1 as ANSI, so a
# non-ASCII dash inside a string literal breaks the parse.
param(
  [string]$Viewports = '1440x900',
  [string]$Page = 'index.html',
  [string]$Selector = '',
  [switch]$Upper
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { $chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" }

# boot the preview server if it is not already listening
$listening = $false
try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', 4173); $listening = $c.Connected; $c.Close() } catch {}
if (-not $listening) {
  Start-Process -FilePath 'node' -ArgumentList 'serve.mjs' -WorkingDirectory $root -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

foreach ($v in $Viewports.Split(',')) {
  $w, $h = $v.Split('x')
  $prof = Join-Path $env:TEMP ("dsh-blk-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
  New-Item -ItemType Directory -Force -Path $prof | Out-Null
  $sink = Join-Path $root '_probe-result.txt'
  Remove-Item $sink -Force -ErrorAction SilentlyContinue
  $url = "http://127.0.0.1:4173/tools/measure-blocks.html?v=$v" + "&p=$Page"
  if ($Selector) { $url = $url + "&s=" + [uri]::EscapeDataString($Selector) }
  if ($Upper) { $url = $url + "&upper=1" }
  & $chrome --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --user-data-dir="$prof" --virtual-time-budget=9000 --window-size="$w,$h" "$url" 2>&1 | Out-Null
  Start-Sleep -Seconds 3
  if (Test-Path $sink) { Get-Content $sink } else { Write-Output "### $v - no probe result" }
  Write-Output ''
}
