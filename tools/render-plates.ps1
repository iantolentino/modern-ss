# Render the design plates: one full-height screenshot per page and width.
#
# Chrome's --screenshot captures the window, not the document, so the page height
# is measured first with tools/measure-blocks.html and the window is then sized to
# it. Two passes per plate, which is slow but means the plate ends where the page
# ends rather than trailing empty desk.
#
# Keep this file ASCII-only: Windows PowerShell 5.1 reads .ps1 as ANSI.
param(
  [string]$Plates = "",
  [string]$OutDir = ".impeccable/plates"
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

# page, width, height-cap. The cap keeps a runaway measurement from producing a
# 30000px image; it is well above every measured page.
$default = @(
  'index.html,1440', 'index.html,1920', 'index.html,390', 'index.html,2560',
  'solutions.html,1440', 'role-accountant.html,1440', 'team.html,1440',
  'contact.html,1440', 'executives.html,1440', 'insights.html,1440',
  'job-hr-assistant.html,1440', 'strata-staff-plus.html,1440', '404.html,1440',
  'about.html,1440', 'testimonials.html,1440'
)
# -Plates takes page,width entries separated by ';', since ',' separates the page
# from its width:  -Plates "index.html,1920;about.html,1440"
$list = if ($Plates) { $Plates -split ';' } else { $default }

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { $chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" }

$listening = $false
try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', 4173); $listening = $c.Connected; $c.Close() } catch {}
if (-not $listening) {
  Start-Process -FilePath 'node' -ArgumentList 'serve.mjs' -WorkingDirectory $root -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

New-Item -ItemType Directory -Force -Path (Join-Path $root $OutDir) | Out-Null
$sink = Join-Path $root '_probe-result.txt'
$shotDir = Join-Path $env:TEMP ("dsh-plate-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Force -Path $shotDir | Out-Null

foreach ($item in $list) {
  $parts = $item.Split(',')
  $page = $parts[0].Trim()
  $w = [int]$parts[1].Trim()
  $name = [IO.Path]::GetFileNameWithoutExtension($page) + '-' + $w
  $prof = Join-Path $env:TEMP ("dsh-prof-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
  New-Item -ItemType Directory -Force -Path $prof | Out-Null

  # pass 1 - measure the document height
  Remove-Item $sink -Force -ErrorAction SilentlyContinue
  $probe = "http://127.0.0.1:4173/tools/measure-blocks.html?v=${w}x900&p=$page"
  & $chrome --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --user-data-dir="$prof" --virtual-time-budget=9000 --window-size="$w,900" "$probe" 2>&1 | Out-Null
  Start-Sleep -Seconds 3
  $h = 0
  if (Test-Path $sink) {
    $m = [regex]::Match((Get-Content $sink -Raw), 'docH\s+(\d+)px')
    if ($m.Success) { $h = [int]$m.Groups[1].Value }
  }
  if ($h -le 0) { Write-Output ("  {0}  SKIPPED (no height)" -f $name); continue }
  if ($h -gt 24000) { $h = 24000 }

  # pass 2 - capture at that height
  $png = Join-Path $shotDir "$name.png"
  Remove-Item $png -Force -ErrorAction SilentlyContinue
  $prof2 = Join-Path $env:TEMP ("dsh-prof-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
  New-Item -ItemType Directory -Force -Path $prof2 | Out-Null
  & $chrome --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --hide-scrollbars --user-data-dir="$prof2" --virtual-time-budget=12000 --window-size="$w,$h" --screenshot="$png" "http://127.0.0.1:4173/$page" 2>&1 | Out-Null

  $ok = $false
  for ($i = 0; $i -lt 12; $i++) {
    Start-Sleep -Milliseconds 700
    if ((Test-Path $png) -and ((Get-Item $png).Length -gt 2048)) { $ok = $true; break }
  }
  if ($ok) {
    Copy-Item $png (Join-Path $root (Join-Path $OutDir "$name.png")) -Force
    Write-Output ("  {0,-34} {1,6}px tall  {2,8}kb" -f $name, $h, [math]::Round((Get-Item $png).Length / 1kb))
  } else {
    Write-Output ("  {0,-34} FAILED to capture" -f $name)
  }
}
Write-Output ''
Write-Output ("plates in {0}" -f $OutDir)
