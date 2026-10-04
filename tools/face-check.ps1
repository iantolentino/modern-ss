# What every photograph actually shows after CSS has cropped it.
#   .\tools\face-check.ps1 -Viewports "1440x900,390x844"
# Collects CROP| lines from tools/face-check.html over every built page and writes
# tools/_crops.json for tools/face-verify.mjs to join against the skin-tone boxes.
# Keep this file ASCII-only: Windows PowerShell 5.1 reads .ps1 as ANSI, so a
# non-ASCII dash inside a string literal breaks the parse.
param(
  [string]$Viewports = '1440x900,390x844',
  [string]$Pages = ''
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { $chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" }

$listening = $false
try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', 4173); $listening = $c.Connected; $c.Close() } catch {}
if (-not $listening) {
  Start-Process -FilePath 'node' -ArgumentList 'serve.mjs' -WorkingDirectory $root -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

if ($Pages) { $list = $Pages.Split(',') }
else { $list = Get-ChildItem -Path $root -Filter '*.html' | ForEach-Object { $_.Name } | Sort-Object }

$all = New-Object System.Collections.Generic.List[string]
$n = 0
foreach ($v in $Viewports.Split(',')) {
  $w, $h = $v.Split('x')
  $sink = Join-Path $root '_probe-result.txt'
  foreach ($p in $list) {
    # A fresh profile per page. Reusing one across a whole viewport worked for the
    # first pass and then produced nothing at all for the second, which silently
    # halved the coverage; a clean profile each time costs a little and always runs.
    $prof = Join-Path $env:TEMP ("dsh-face-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
    New-Item -ItemType Directory -Force -Path $prof | Out-Null
    Remove-Item $sink -Force -ErrorAction SilentlyContinue
    $url = "http://127.0.0.1:4173/tools/face-check.html?v=$v&p=$p"
    & $chrome --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --user-data-dir="$prof" --virtual-time-budget=9000 --window-size="$w,$h" "$url" 2>&1 | Out-Null
    Start-Sleep -Milliseconds 700
    if (Test-Path $sink) {
      foreach ($line in (Get-Content $sink)) { if ($line.StartsWith('CROP|')) { $all.Add($line) } }
      $n++
    } else {
      Write-Output ("  no result for " + $p + " at " + $v)
    }
    Remove-Item $prof -Recurse -Force -ErrorAction SilentlyContinue
  }
}
$out = Join-Path $root 'tools\_crops.json'
Set-Content -Path $out -Value ($all -join "`n") -Encoding UTF8
Write-Output ("  pages measured: " + $n + " of " + ($list.Count * $Viewports.Split(',').Count))
Write-Output ("  img records:    " + $all.Count)
Write-Output ("  wrote           tools\_crops.json")
