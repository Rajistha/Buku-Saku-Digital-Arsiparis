# Render mockup HTML -> PNG dengan Chrome headless.
# Pakai: powershell -File render.ps1            (semua halaman)
#        powershell -File render.ps1 02-beranda (satu halaman)
param([string]$Only = "")
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$src = $PSScriptRoot
$out = Split-Path $src -Parent
$pages = Get-ChildItem $src -Filter *.html | Where-Object { $Only -eq "" -or $_.BaseName -eq $Only }
foreach ($p in $pages) {
  $size = if ($p.BaseName -like "*mobile*") { "1440,900" } else { "1440,900" }
  $url = "file:///" + ($p.FullName -replace '\\','/' -replace ' ','%20')
  $png = Join-Path $out ($p.BaseName + ".png")
  & $chrome --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 `
    --window-size=$size --virtual-time-budget=4000 --screenshot="$png" $url 2>$null | Out-Null
  Write-Output "OK  $($p.BaseName).png"
}
