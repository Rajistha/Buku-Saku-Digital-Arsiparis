# Render logo -> PNG dengan Chrome headless.
# Pakai: powershell -File render.ps1
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$src = $PSScriptRoot
$out = Split-Path $src -Parent

function Shot($html, $png, $w, $h, $transparent) {
  $url = "file:///" + ($html -replace '\\','/' -replace ' ','%20')
  $args = @("--headless=new","--disable-gpu","--hide-scrollbars","--force-device-scale-factor=1",
            "--window-size=$w,$h","--virtual-time-budget=4000","--screenshot=$png")
  if ($transparent) { $args += "--default-background-color=00000000" }
  & $chrome @args $url 2>$null | Out-Null
  Write-Output "OK  $(Split-Path $png -Leaf)"
}

# lembar presentasi
Shot "$src\lembar-logo.html" "$out\lembar-logo.png" 1440 900 $false

# ikon & versi horizontal dari SVG (dibungkus HTML transparan)
function Wrap($svgFile, $htmlFile, $w, $h, $bg) {
  $svg = [IO.File]::ReadAllText($svgFile)
  $html = "<!doctype html><meta charset=utf-8><style>@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');html,body{margin:0;width:${w}px;height:${h}px;background:$bg;overflow:hidden}svg{width:${w}px;height:${h}px;display:block}</style>$svg"
  [IO.File]::WriteAllText($htmlFile, $html, (New-Object Text.UTF8Encoding $false))
}
$tmp = Join-Path $env:TEMP "logo-render"; New-Item -ItemType Directory -Force $tmp | Out-Null

Wrap "$out\logo-icon.svg" "$tmp\icon.html" 512 512 "transparent"
Shot "$tmp\icon.html" "$out\logo-icon-512.png" 512 512 $true
Wrap "$out\logo-icon.svg" "$tmp\icon192.html" 192 192 "transparent"
Shot "$tmp\icon192.html" "$out\logo-icon-192.png" 192 192 $true
Wrap "$out\logo-icon.svg" "$tmp\fav.html" 32 32 "transparent"
Shot "$tmp\fav.html" "$out\favicon-32.png" 32 32 $true

Wrap "$out\logo-horizontal.svg" "$tmp\hor.html" 880 192 "transparent"
Shot "$tmp\hor.html" "$out\logo-horizontal.png" 880 192 $true
