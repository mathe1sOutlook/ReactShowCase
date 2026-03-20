param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

function New-Color {
  param(
    [Parameter(Mandatory = $true)][string]$Hex,
    [int]$Alpha = 255
  )

  $clean = $Hex.TrimStart('#')
  if ($clean.Length -ne 6) {
    throw "Invalid color: $Hex"
  }

  $r = [Convert]::ToInt32($clean.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($clean.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($clean.Substring(4, 2), 16)
  return [System.Drawing.Color]::FromArgb($Alpha, $r, $g, $b)
}

function New-RectF {
  param([float]$X, [float]$Y, [float]$Width, [float]$Height)
  return New-Object System.Drawing.RectangleF -ArgumentList $X, $Y, $Width, $Height
}

function Ensure-Directory {
  param([Parameter(Mandatory = $true)][string]$Path)
  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function New-Canvas {
  param([int]$Width, [int]$Height)

  $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  return @{
    Bitmap = $bitmap
    Graphics = $graphics
  }
}

function Save-Png {
  param(
    [Parameter(Mandatory = $true)]$Bitmap,
    [Parameter(Mandatory = $true)][string]$Path
  )

  Ensure-Directory (Split-Path -Parent $Path)
  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function New-RoundedPath {
  param([float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius)

  $diameter = $Radius * 2
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-Backdrop {
  param(
    [Parameter(Mandatory = $true)]$Graphics,
    [int]$Width,
    [int]$Height,
    [string]$TopHex,
    [string]$BottomHex
  )

  $rect = New-RectF 0 0 $Width $Height
  $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, (New-Color $TopHex), (New-Color $BottomHex), 70
  $Graphics.FillRectangle($gradient, $rect)

  $soft1 = New-Object System.Drawing.SolidBrush (New-Color '#6ef6ff' 26)
  $soft2 = New-Object System.Drawing.SolidBrush (New-Color '#ffe86f' 22)
  $Graphics.FillEllipse($soft1, -$Width * 0.15, -$Height * 0.05, $Width * 0.58, $Height * 0.58)
  $Graphics.FillEllipse($soft2, $Width * 0.48, $Height * 0.08, $Width * 0.42, $Height * 0.42)

  $gradient.Dispose()
  $soft1.Dispose()
  $soft2.Dispose()
}

function Draw-BrandMark {
  param(
    [Parameter(Mandatory = $true)]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Size,
    [ValidateSet('square', 'round')][string]$Shape = 'square'
  )

  $rect = New-RectF $X $Y $Size $Size
  $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, (New-Color '#08111f'), (New-Color '#14294a'), 60
  $path = if ($Shape -eq 'round') {
    $ellipse = New-Object System.Drawing.Drawing2D.GraphicsPath
    $ellipse.AddEllipse($rect)
    $ellipse
  } else {
    New-RoundedPath $X $Y $Size $Size ($Size * 0.24)
  }

  $Graphics.FillPath($background, $path)

  $shine = New-Object System.Drawing.SolidBrush (New-Color '#6ef6ff' 28)
  $warm = New-Object System.Drawing.SolidBrush (New-Color '#ff7bd7' 26)
  $Graphics.FillEllipse($shine, $X + $Size * 0.08, $Y + $Size * 0.1, $Size * 0.42, $Size * 0.42)
  $Graphics.FillEllipse($warm, $X + $Size * 0.46, $Y + $Size * 0.12, $Size * 0.3, $Size * 0.3)

  $orbitPrimary = New-Object System.Drawing.Pen (New-Color '#6ef6ff' 230), ($Size * 0.055)
  $orbitPrimary.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $orbitPrimary.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $orbitPrimary.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $orbitAccent = New-Object System.Drawing.Pen (New-Color '#ffe86f' 220), ($Size * 0.034)
  $orbitAccent.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $orbitAccent.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $orbitAccent.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $centerX = $X + ($Size / 2)
  $centerY = $Y + ($Size / 2)
  $orbitWidth = $Size * 0.62
  $orbitHeight = $Size * 0.34

  foreach ($angle in @(24, -26)) {
    $state = $Graphics.Save()
    $Graphics.TranslateTransform($centerX, $centerY)
    $Graphics.RotateTransform($angle)
    $Graphics.DrawEllipse($orbitPrimary, -($orbitWidth / 2), -($orbitHeight / 2), $orbitWidth, $orbitHeight)
    $Graphics.Restore($state)
  }

  $Graphics.DrawArc($orbitAccent, $X + $Size * 0.18, $Y + $Size * 0.18, $Size * 0.64, $Size * 0.64, 210, 120)

  $coreOuter = New-Object System.Drawing.SolidBrush (New-Color '#f7fbff' 240)
  $coreInner = New-Object System.Drawing.SolidBrush (New-Color '#6ef6ff')
  $Graphics.FillEllipse($coreOuter, $centerX - ($Size * 0.09), $centerY - ($Size * 0.09), $Size * 0.18, $Size * 0.18)
  $Graphics.FillEllipse($coreInner, $centerX - ($Size * 0.055), $centerY - ($Size * 0.055), $Size * 0.11, $Size * 0.11)

  $sparkPen = New-Object System.Drawing.Pen (New-Color '#ffe86f'), ($Size * 0.025)
  $sparkX = $X + $Size * 0.73
  $sparkY = $Y + $Size * 0.25
  $sparkRadius = $Size * 0.06
  $Graphics.DrawLine($sparkPen, $sparkX - $sparkRadius, $sparkY, $sparkX + $sparkRadius, $sparkY)
  $Graphics.DrawLine($sparkPen, $sparkX, $sparkY - $sparkRadius, $sparkX, $sparkY + $sparkRadius)
  $Graphics.DrawLine($sparkPen, $sparkX - ($sparkRadius * 0.7), $sparkY - ($sparkRadius * 0.7), $sparkX + ($sparkRadius * 0.7), $sparkY + ($sparkRadius * 0.7))
  $Graphics.DrawLine($sparkPen, $sparkX - ($sparkRadius * 0.7), $sparkY + ($sparkRadius * 0.7), $sparkX + ($sparkRadius * 0.7), $sparkY - ($sparkRadius * 0.7))

  $background.Dispose()
  $path.Dispose()
  $shine.Dispose()
  $warm.Dispose()
  $orbitPrimary.Dispose()
  $orbitAccent.Dispose()
  $coreOuter.Dispose()
  $coreInner.Dispose()
  $sparkPen.Dispose()
}

function Draw-TextBlock {
  param(
    [Parameter(Mandatory = $true)]$Graphics,
    [float]$X,
    [float]$Y,
    [string]$Text,
    [float]$Size,
    [string]$Hex,
    [ValidateSet('Regular', 'Bold', 'SemiBold')][string]$Weight = 'Regular'
  )

  $fontStyle = if ($Weight -eq 'Bold' -or $Weight -eq 'SemiBold') {
    [System.Drawing.FontStyle]::Bold
  } else {
    [System.Drawing.FontStyle]::Regular
  }

  $font = New-Object System.Drawing.Font -ArgumentList 'Segoe UI', ([float]$Size), $fontStyle
  $brush = New-Object System.Drawing.SolidBrush (New-Color $Hex)
  $Graphics.DrawString($Text, $font, $brush, $X, $Y)
  $font.Dispose()
  $brush.Dispose()
}

function Fill-RoundedCard {
  param(
    [Parameter(Mandatory = $true)]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius,
    [string]$FillHex,
    [string]$BorderHex
  )

  $path = New-RoundedPath $X $Y $Width $Height $Radius
  $fill = New-Object System.Drawing.SolidBrush (New-Color $FillHex)
  $border = New-Object System.Drawing.Pen (New-Color $BorderHex), 1.2
  $Graphics.FillPath($fill, $path)
  $Graphics.DrawPath($border, $path)
  $fill.Dispose()
  $border.Dispose()
  $path.Dispose()
}

function Draw-Pill {
  param(
    [Parameter(Mandatory = $true)]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [string]$Label,
    [string]$FillHex,
    [string]$TextHex
  )

  Fill-RoundedCard -Graphics $Graphics -X $X -Y $Y -Width $Width -Height 36 -Radius 18 -FillHex $FillHex -BorderHex $FillHex
  Draw-TextBlock -Graphics $Graphics -X ($X + 14) -Y ($Y + 8) -Text $Label -Size 16 -Hex $TextHex -Weight Bold
}

function New-PhoneFrame {
  param(
    [Parameter(Mandatory = $true)]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height
  )

  Fill-RoundedCard -Graphics $Graphics -X $X -Y $Y -Width $Width -Height $Height -Radius 48 -FillHex '#03070f' -BorderHex '#1d2c46'
  Fill-RoundedCard -Graphics $Graphics -X ($X + 18) -Y ($Y + 18) -Width ($Width - 36) -Height ($Height - 36) -Radius 34 -FillHex '#091222' -BorderHex '#12223a'
  $brush = New-Object System.Drawing.SolidBrush (New-Color '#111f34')
  $Graphics.FillRectangle($brush, $X + ($Width * 0.34), $Y + 10, $Width * 0.32, 12)
  $brush.Dispose()
  return New-RectF ($X + 30) ($Y + 36) ($Width - 60) ($Height - 72)
}

function Draw-AndroidHomeScreenshot {
  param([string]$Path)

  $canvas = New-Canvas -Width 1440 -Height 900
  $bmp = $canvas.Bitmap
  $g = $canvas.Graphics

  Fill-Backdrop -Graphics $g -Width 1440 -Height 900 -TopHex '#040914' -BottomHex '#08172e'
  Draw-TextBlock -Graphics $g -X 88 -Y 86 -Text 'Android Home' -Size 58 -Hex '#f7fbff' -Weight Bold
  Draw-TextBlock -Graphics $g -X 88 -Y 160 -Text 'Neon dashboard, quick search and category cards.' -Size 24 -Hex '#9bb0cc'

  $screen = New-PhoneFrame -Graphics $g -X 860 -Y 72 -Width 420 -Height 760
  Draw-Pill -Graphics $g -X 106 -Y 232 -Width 142 -Label '20 screens' -FillHex '#0f2742' -TextHex '#6ef6ff'
  Draw-Pill -Graphics $g -X 264 -Y 232 -Width 168 -Label 'Android + Win' -FillHex '#221b3f' -TextHex '#ffe86f'

  Fill-RoundedCard -Graphics $g -X $screen.X -Y $screen.Y -Width $screen.Width -Height 66 -Radius 24 -FillHex '#101d35' -BorderHex '#1d355a'
  Draw-TextBlock -Graphics $g -X ($screen.X + 18) -Y ($screen.Y + 16) -Text 'Search demos, APIs, charts, maps...' -Size 18 -Hex '#7f94b1'

  $cardX = $screen.X
  $cardY = $screen.Y + 96
  $cardWidth = ($screen.Width - 18) / 2
  foreach ($index in 0..5) {
    $col = $index % 2
    $row = [Math]::Floor($index / 2)
    $cx = $cardX + ($col * ($cardWidth + 18))
    $cy = $cardY + ($row * 132)
    Fill-RoundedCard -Graphics $g -X $cx -Y $cy -Width $cardWidth -Height 114 -Radius 24 -FillHex '#0f1b31' -BorderHex '#1a3356'
    $accent = @('#6ef6ff', '#ff7bd7', '#ffe86f', '#59f6a5', '#7fb2ff', '#ffad67')[$index]
    $bubble = New-Object System.Drawing.SolidBrush (New-Color $accent 230)
    $g.FillEllipse($bubble, $cx + 18, $cy + 18, 22, 22)
    $bubble.Dispose()
    Draw-TextBlock -Graphics $g -X ($cx + 54) -Y ($cy + 18) -Text @('Animations', 'Network', 'Maps', 'Auth', 'Themes', 'Utilities')[$index] -Size 20 -Hex '#f7fbff' -Weight Bold
    Draw-TextBlock -Graphics $g -X ($cx + 18) -Y ($cy + 58) -Text 'Shared cards, badges and responsive spacing.' -Size 15 -Hex '#8ea2bc'
  }

  Draw-TextBlock -Graphics $g -X 88 -Y 320 -Text 'Highlights' -Size 28 -Hex '#f7fbff' -Weight Bold
  Draw-TextBlock -Graphics $g -X 88 -Y 364 -Text '• Tab shell com ícones SVG consistentes.' -Size 22 -Hex '#c4d2e5'
  Draw-TextBlock -Graphics $g -X 88 -Y 404 -Text '• States de loading, empty e error reaproveitados.' -Size 22 -Hex '#c4d2e5'
  Draw-TextBlock -Graphics $g -X 88 -Y 444 -Text '• Overlay de performance e freeze on blur.' -Size 22 -Hex '#c4d2e5'

  Save-Png -Bitmap $bmp -Path $Path
  $g.Dispose()
  $bmp.Dispose()
}

function Draw-AndroidNetworkScreenshot {
  param([string]$Path)

  $canvas = New-Canvas -Width 1440 -Height 900
  $bmp = $canvas.Bitmap
  $g = $canvas.Graphics

  Fill-Backdrop -Graphics $g -Width 1440 -Height 900 -TopHex '#07111e' -BottomHex '#0a2340'
  Draw-TextBlock -Graphics $g -X 88 -Y 86 -Text 'Android Network Lab' -Size 58 -Hex '#f7fbff' -Weight Bold
  Draw-TextBlock -Graphics $g -X 88 -Y 160 -Text 'REST, GraphQL, WebSocket and transfer progress on one deterministic screen.' -Size 24 -Hex '#9bb0cc'

  $screen = New-PhoneFrame -Graphics $g -X 820 -Y 58 -Width 460 -Height 780
  Fill-RoundedCard -Graphics $g -X $screen.X -Y $screen.Y -Width $screen.Width -Height 108 -Radius 26 -FillHex '#0f1c33' -BorderHex '#1b3458'
  Draw-TextBlock -Graphics $g -X ($screen.X + 22) -Y ($screen.Y + 18) -Text 'REST Playground' -Size 24 -Hex '#f7fbff' -Weight Bold
  Draw-Pill -Graphics $g -X ($screen.X + 22) -Y ($screen.Y + 56) -Width 118 -Label 'Loading' -FillHex '#11325b' -TextHex '#6ef6ff'
  Draw-Pill -Graphics $g -X ($screen.X + 154) -Y ($screen.Y + 56) -Width 126 -Label 'Retry' -FillHex '#2a2146' -TextHex '#ffe86f'

  Fill-RoundedCard -Graphics $g -X $screen.X -Y ($screen.Y + 128) -Width $screen.Width -Height 138 -Radius 24 -FillHex '#0d1830' -BorderHex '#1a3050'
  Draw-TextBlock -Graphics $g -X ($screen.X + 20) -Y ($screen.Y + 148) -Text '{' -Size 44 -Hex '#6ef6ff' -Weight Bold
  Draw-TextBlock -Graphics $g -X ($screen.X + 56) -Y ($screen.Y + 154) -Text '\"status\": 200,' -Size 20 -Hex '#f7fbff'
  Draw-TextBlock -Graphics $g -X ($screen.X + 56) -Y ($screen.Y + 188) -Text '\"cache\": \"warm\",' -Size 20 -Hex '#ffe86f'
  Draw-TextBlock -Graphics $g -X ($screen.X + 56) -Y ($screen.Y + 222) -Text '\"latencyMs\": 460' -Size 20 -Hex '#59f6a5'

  Fill-RoundedCard -Graphics $g -X $screen.X -Y ($screen.Y + 290) -Width $screen.Width -Height 140 -Radius 24 -FillHex '#0f1b31' -BorderHex '#18324f'
  Draw-TextBlock -Graphics $g -X ($screen.X + 20) -Y ($screen.Y + 308) -Text 'GraphQL' -Size 24 -Hex '#f7fbff' -Weight Bold
  Draw-TextBlock -Graphics $g -X ($screen.X + 20) -Y ($screen.Y + 350) -Text 'Billing preset simulates transient resolver error.' -Size 18 -Hex '#8ea2bc'
  Draw-Pill -Graphics $g -X ($screen.X + 20) -Y ($screen.Y + 386) -Width 154 -Label 'Retry query' -FillHex '#32284c' -TextHex '#ff7bd7'

  Fill-RoundedCard -Graphics $g -X $screen.X -Y ($screen.Y + 454) -Width $screen.Width -Height 186 -Radius 24 -FillHex '#101d35' -BorderHex '#1a3150'
  Draw-TextBlock -Graphics $g -X ($screen.X + 20) -Y ($screen.Y + 474) -Text 'Realtime Socket' -Size 24 -Hex '#f7fbff' -Weight Bold
  foreach ($idx in 0..2) {
    $cy = $screen.Y + 520 + ($idx * 36)
    $dot = New-Object System.Drawing.SolidBrush (New-Color @('#6ef6ff', '#59f6a5', '#ffe86f')[$idx])
    $g.FillEllipse($dot, $screen.X + 20, $cy + 6, 10, 10)
    $dot.Dispose()
    Draw-TextBlock -Graphics $g -X ($screen.X + 40) -Y $cy -Text @('Gateway healthy', 'Echo: Ship the beta build', 'Cache replay served instantly')[$idx] -Size 18 -Hex '#d6e2f1'
  }

  Draw-TextBlock -Graphics $g -X 88 -Y 300 -Text 'What changed in 9.2' -Size 28 -Hex '#f7fbff' -Weight Bold
  Draw-TextBlock -Graphics $g -X 88 -Y 346 -Text '• Todo fluxo assíncrono agora expõe loading visual.' -Size 22 -Hex '#c4d2e5'
  Draw-TextBlock -Graphics $g -X 88 -Y 386 -Text '• GraphQL passou a ter erro transitório + retry.' -Size 22 -Hex '#c4d2e5'
  Draw-TextBlock -Graphics $g -X 88 -Y 426 -Text '• Listas vazias mostram estados compactos reutilizáveis.' -Size 22 -Hex '#c4d2e5'

  Save-Png -Bitmap $bmp -Path $Path
  $g.Dispose()
  $bmp.Dispose()
}

function Draw-WindowsDashboardScreenshot {
  param([string]$Path)

  $canvas = New-Canvas -Width 1440 -Height 900
  $bmp = $canvas.Bitmap
  $g = $canvas.Graphics

  Fill-Backdrop -Graphics $g -Width 1440 -Height 900 -TopHex '#eef6ff' -BottomHex '#dae7fb'
  Fill-RoundedCard -Graphics $g -X 96 -Y 86 -Width 1248 -Height 728 -Radius 36 -FillHex '#f8fbff' -BorderHex '#b9cce5'
  Fill-RoundedCard -Graphics $g -X 122 -Y 112 -Width 96 -Height 676 -Radius 28 -FillHex '#eef4fb' -BorderHex '#d8e3f2'
  Draw-BrandMark -Graphics $g -X 148 -Y 136 -Size 44 -Shape round

  foreach ($idx in 0..2) {
    $iy = 230 + ($idx * 112)
    Fill-RoundedCard -Graphics $g -X 136 -Y $iy -Width 68 -Height 80 -Radius 20 -FillHex '#ffffff' -BorderHex '#d7e2f1'
    $accent = @('#2d7ff9', '#59f6a5', '#ff7bd7')[$idx]
    $dot = New-Object System.Drawing.SolidBrush (New-Color $accent)
    $g.FillEllipse($dot, 162, ($iy + 24), 16, 16)
    $dot.Dispose()
  }

  Draw-TextBlock -Graphics $g -X 258 -Y 138 -Text 'Windows Dashboard' -Size 54 -Hex '#122033' -Weight Bold
  Draw-TextBlock -Graphics $g -X 258 -Y 204 -Text 'Fluent side rail, breadcrumb shell and shared content polish.' -Size 24 -Hex '#5c7088'

  Fill-RoundedCard -Graphics $g -X 258 -Y 268 -Width 320 -Height 170 -Radius 28 -FillHex '#12243e' -BorderHex '#1d4d88'
  Draw-TextBlock -Graphics $g -X 286 -Y 300 -Text '18 demo hubs' -Size 34 -Hex '#f7fbff' -Weight Bold
  Draw-TextBlock -Graphics $g -X 286 -Y 350 -Text 'Quality overlays, error boundaries and layout tests.' -Size 18 -Hex '#9fb7d4'

  Fill-RoundedCard -Graphics $g -X 602 -Y 268 -Width 336 -Height 170 -Radius 28 -FillHex '#ffffff' -BorderHex '#d8e3f1'
  Draw-TextBlock -Graphics $g -X 630 -Y 300 -Text 'Responsive home grid' -Size 32 -Hex '#122033' -Weight Bold
  Draw-TextBlock -Graphics $g -X 630 -Y 352 -Text 'Search, badges and intent-rich icons stay aligned from 72px rail to desktop canvases.' -Size 18 -Hex '#60748b'

  Fill-RoundedCard -Graphics $g -X 258 -Y 470 -Width 680 -Height 276 -Radius 28 -FillHex '#f4f8fd' -BorderHex '#d4e0ef'
  foreach ($idx in 0..5) {
    $col = $idx % 3
    $row = [Math]::Floor($idx / 3)
    $cx = 286 + ($col * 210)
    $cy = 500 + ($row * 110)
    Fill-RoundedCard -Graphics $g -X $cx -Y $cy -Width 182 -Height 84 -Radius 20 -FillHex '#ffffff' -BorderHex '#dbe5f3'
    $accent = @('#2d7ff9', '#6ef6ff', '#59f6a5', '#ff7bd7', '#ffe86f', '#ffad67')[$idx]
    $brush = New-Object System.Drawing.SolidBrush (New-Color $accent)
    $g.FillEllipse($brush, $cx + 18, $cy + 18, 18, 18)
    $brush.Dispose()
    Draw-TextBlock -Graphics $g -X ($cx + 48) -Y ($cy + 16) -Text @('Animations', 'Charts', 'Network', 'Storage', 'Maps', 'Utilities')[$idx] -Size 20 -Hex '#122033' -Weight Bold
    Draw-TextBlock -Graphics $g -X ($cx + 18) -Y ($cy + 48) -Text 'Shared spacing and titles.' -Size 15 -Hex '#61758c'
  }

  Save-Png -Bitmap $bmp -Path $Path
  $g.Dispose()
  $bmp.Dispose()
}

function Draw-WindowsComponentsScreenshot {
  param([string]$Path)

  $canvas = New-Canvas -Width 1440 -Height 900
  $bmp = $canvas.Bitmap
  $g = $canvas.Graphics

  Fill-Backdrop -Graphics $g -Width 1440 -Height 900 -TopHex '#f8fbff' -BottomHex '#dfeafb'
  Fill-RoundedCard -Graphics $g -X 90 -Y 78 -Width 1260 -Height 744 -Radius 34 -FillHex '#ffffff' -BorderHex '#cedceb'
  Draw-TextBlock -Graphics $g -X 132 -Y 124 -Text 'Components Showcase' -Size 54 -Hex '#102033' -Weight Bold
  Draw-TextBlock -Graphics $g -X 132 -Y 192 -Text 'Controls, feedback and data display using the same design primitives.' -Size 24 -Hex '#60748b'

  Fill-RoundedCard -Graphics $g -X 132 -Y 258 -Width 344 -Height 210 -Radius 28 -FillHex '#0f1d35' -BorderHex '#1d355a'
  Draw-TextBlock -Graphics $g -X 160 -Y 290 -Text 'Controls' -Size 32 -Hex '#f7fbff' -Weight Bold
  Draw-Pill -Graphics $g -X 160 -Y 346 -Width 130 -Label 'Primary' -FillHex '#13427a' -TextHex '#f7fbff'
  Draw-Pill -Graphics $g -X 306 -Y 346 -Width 124 -Label 'Outline' -FillHex '#2a2248' -TextHex '#ffe86f'

  Fill-RoundedCard -Graphics $g -X 504 -Y 258 -Width 356 -Height 210 -Radius 28 -FillHex '#f5f9ff' -BorderHex '#d5e1f0'
  Draw-TextBlock -Graphics $g -X 532 -Y 290 -Text 'Feedback' -Size 32 -Hex '#102033' -Weight Bold
  Draw-Pill -Graphics $g -X 532 -Y 346 -Width 154 -Label 'Skeleton' -FillHex '#e3edf9' -TextHex '#4d6989'
  Draw-Pill -Graphics $g -X 702 -Y 346 -Width 124 -Label 'Toast' -FillHex '#fff3d2' -TextHex '#8b6711'

  Fill-RoundedCard -Graphics $g -X 888 -Y 258 -Width 408 -Height 210 -Radius 28 -FillHex '#ffffff' -BorderHex '#d4e0ef'
  Draw-TextBlock -Graphics $g -X 916 -Y 290 -Text 'Data Display' -Size 32 -Hex '#102033' -Weight Bold
  foreach ($idx in 0..2) {
    $bar = New-Object System.Drawing.SolidBrush (New-Color @('#2d7ff9', '#59f6a5', '#ff7bd7')[$idx])
    $g.FillRectangle($bar, 934 + ($idx * 96), 356 - ($idx * 28), 48, 88 + ($idx * 28))
    $bar.Dispose()
  }

  Fill-RoundedCard -Graphics $g -X 132 -Y 500 -Width 1164 -Height 256 -Radius 28 -FillHex '#f6faff' -BorderHex '#d7e2f1'
  Draw-TextBlock -Graphics $g -X 160 -Y 528 -Text 'Visual polish rolled across the whole shell' -Size 34 -Hex '#102033' -Weight Bold
  Draw-TextBlock -Graphics $g -X 160 -Y 584 -Text '• Screen containers animate on entry.' -Size 22 -Hex '#5c7088'
  Draw-TextBlock -Graphics $g -X 160 -Y 624 -Text '• Shared iconography replaced ad hoc emoji glyphs.' -Size 22 -Hex '#5c7088'
  Draw-TextBlock -Graphics $g -X 160 -Y 664 -Text '• Empty and error states use one reusable component.' -Size 22 -Hex '#5c7088'

  Save-Png -Bitmap $bmp -Path $Path
  $g.Dispose()
  $bmp.Dispose()
}

function New-PropertyItem {
  param(
    [int]$Id,
    [int]$Type,
    [byte[]]$Value
  )

  $item = [System.Runtime.Serialization.FormatterServices]::GetUninitializedObject([System.Drawing.Imaging.PropertyItem])
  $item.Id = $Id
  $item.Type = $Type
  $item.Len = $Value.Length
  $item.Value = $Value
  return $item
}

function Save-AnimatedGif {
  param(
    [Parameter(Mandatory = $true)][string[]]$FramePaths,
    [Parameter(Mandatory = $true)][string]$OutputPath,
    [int]$Delay = 110
  )

  $frames = @()
  foreach ($framePath in $FramePaths) {
    $frames += [System.Drawing.Image]::FromFile($framePath)
  }

  if ($frames.Count -eq 0) {
    throw 'Animated GIF requires at least one frame.'
  }

  $gifCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/gif'
  $encoder = [System.Drawing.Imaging.Encoder]::SaveFlag
  $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1

  try {
    $delayBytes = New-Object byte[] ($frames.Count * 4)
    for ($i = 0; $i -lt $frames.Count; $i += 1) {
      [BitConverter]::GetBytes([int]$Delay).CopyTo($delayBytes, $i * 4)
    }

    $loopBytes = [BitConverter]::GetBytes([int16]0)
    $frames[0].SetPropertyItem((New-PropertyItem -Id 0x5100 -Type 4 -Value $delayBytes))
    $frames[0].SetPropertyItem((New-PropertyItem -Id 0x5101 -Type 3 -Value $loopBytes))

    Ensure-Directory (Split-Path -Parent $OutputPath)
    $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter $encoder, ([long][System.Drawing.Imaging.EncoderValue]::MultiFrame)
    $frames[0].Save($OutputPath, $gifCodec, $parameters)

    $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter $encoder, ([long][System.Drawing.Imaging.EncoderValue]::FrameDimensionTime)
    for ($i = 1; $i -lt $frames.Count; $i += 1) {
      $frames[0].SaveAdd($frames[$i], $parameters)
    }

    $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter $encoder, ([long][System.Drawing.Imaging.EncoderValue]::Flush)
    $frames[0].SaveAdd($parameters)
  } finally {
    foreach ($frame in $frames) {
      $frame.Dispose()
    }
    $parameters.Dispose()
  }
}

function Draw-AndroidIcons {
  $androidRoot = Join-Path $RepoRoot 'React Android\android\app\src\main\res'
  $sizes = @{
    'mipmap-mdpi' = 48
    'mipmap-hdpi' = 72
    'mipmap-xhdpi' = 96
    'mipmap-xxhdpi' = 144
    'mipmap-xxxhdpi' = 192
  }

  foreach ($entry in $sizes.GetEnumerator()) {
    foreach ($name in @('ic_launcher', 'ic_launcher_round')) {
      $canvas = New-Canvas -Width $entry.Value -Height $entry.Value
      $bmp = $canvas.Bitmap
      $g = $canvas.Graphics
      $g.Clear([System.Drawing.Color]::Transparent)
      Draw-BrandMark -Graphics $g -X 0 -Y 0 -Size $entry.Value -Shape $(if ($name -like '*round') { 'round' } else { 'square' })
      Save-Png -Bitmap $bmp -Path (Join-Path $androidRoot "$($entry.Key)\$name.png")
      $g.Dispose()
      $bmp.Dispose()
    }
  }
}

function Draw-WindowsAssets {
  $assetsRoot = Join-Path $RepoRoot 'React Windows\windows\CFDWindows\Assets'
  $scales = 100, 125, 150, 200, 400
  $baseSizes = @{
    'Square44x44Logo' = @{ Width = 44; Height = 44; Shape = 'round' }
    'Square150x150Logo' = @{ Width = 150; Height = 150; Shape = 'square' }
    'Wide310x150Logo' = @{ Width = 310; Height = 150; Shape = 'wide' }
    'SplashScreen' = @{ Width = 620; Height = 300; Shape = 'splash' }
    'LockScreenLogo' = @{ Width = 24; Height = 24; Shape = 'round' }
  }

  foreach ($asset in $baseSizes.GetEnumerator()) {
    foreach ($scale in $scales) {
      $width = [Math]::Round($asset.Value.Width * ($scale / 100.0))
      $height = [Math]::Round($asset.Value.Height * ($scale / 100.0))
      $canvas = New-Canvas -Width $width -Height $height
      $bmp = $canvas.Bitmap
      $g = $canvas.Graphics

      switch ($asset.Value.Shape) {
        'round' {
          $g.Clear([System.Drawing.Color]::Transparent)
          Draw-BrandMark -Graphics $g -X 0 -Y 0 -Size ([Math]::Min($width, $height)) -Shape round
        }
        'square' {
          Fill-Backdrop -Graphics $g -Width $width -Height $height -TopHex '#07111d' -BottomHex '#14345f'
          Draw-BrandMark -Graphics $g -X ($width * 0.18) -Y ($height * 0.18) -Size ($width * 0.64) -Shape square
        }
        'wide' {
          Fill-Backdrop -Graphics $g -Width $width -Height $height -TopHex '#07111d' -BottomHex '#183a68'
          Draw-BrandMark -Graphics $g -X ($width * 0.08) -Y ($height * 0.16) -Size ($height * 0.7) -Shape square
          Draw-TextBlock -Graphics $g -X ($width * 0.34) -Y ($height * 0.25) -Text 'REACT SHOWCASE' -Size ($height * 0.16) -Hex '#f7fbff' -Weight Bold
          Draw-TextBlock -Graphics $g -X ($width * 0.34) -Y ($height * 0.54) -Text 'Android + Windows demo hub' -Size ($height * 0.12) -Hex '#9fb7d4'
        }
        'splash' {
          Fill-Backdrop -Graphics $g -Width $width -Height $height -TopHex '#06101c' -BottomHex '#112949'
          $size = [Math]::Min($height * 0.52, $width * 0.18)
          Draw-BrandMark -Graphics $g -X (($width - $size) / 2) -Y ($height * 0.16) -Size $size -Shape square
          Draw-TextBlock -Graphics $g -X ($width * 0.34) -Y ($height * 0.65) -Text 'React Showcase' -Size ($height * 0.12) -Hex '#f7fbff' -Weight Bold
          Draw-TextBlock -Graphics $g -X ($width * 0.32) -Y ($height * 0.79) -Text 'A polished cross-platform React Native portfolio.' -Size ($height * 0.075) -Hex '#a1b8d2'
        }
      }

      Save-Png -Bitmap $bmp -Path (Join-Path $assetsRoot "$($asset.Key).scale-$scale.png")
      $g.Dispose()
      $bmp.Dispose()
    }
  }

  $store = New-Canvas -Width 50 -Height 50
  Draw-BrandMark -Graphics $store.Graphics -X 0 -Y 0 -Size 50 -Shape square
  Save-Png -Bitmap $store.Bitmap -Path (Join-Path $assetsRoot 'StoreLogo.png')
  $store.Graphics.Dispose()
  $store.Bitmap.Dispose()

  $tray = New-Canvas -Width 24 -Height 24
  Draw-BrandMark -Graphics $tray.Graphics -X 0 -Y 0 -Size 24 -Shape round
  Save-Png -Bitmap $tray.Bitmap -Path (Join-Path $assetsRoot 'Square44x44Logo.targetsize-24_altform-unplated.png')
  $tray.Graphics.Dispose()
  $tray.Bitmap.Dispose()
}

function Draw-MarketingAssets {
  $marketingRoot = Join-Path $RepoRoot 'docs\marketing'
  Ensure-Directory $marketingRoot

  $androidHome = Join-Path $marketingRoot 'android-home.png'
  $androidNetwork = Join-Path $marketingRoot 'android-network.png'
  $windowsDashboard = Join-Path $marketingRoot 'windows-dashboard.png'
  $windowsComponents = Join-Path $marketingRoot 'windows-components.png'

  Draw-AndroidHomeScreenshot -Path $androidHome
  Draw-AndroidNetworkScreenshot -Path $androidNetwork
  Draw-WindowsDashboardScreenshot -Path $windowsDashboard
  Draw-WindowsComponentsScreenshot -Path $windowsComponents

  Save-AnimatedGif -FramePaths @($androidHome, $androidNetwork, $windowsDashboard, $windowsComponents) -OutputPath (Join-Path $marketingRoot 'showcase-demo.gif') -Delay 120
}

Draw-AndroidIcons
Draw-WindowsAssets
Draw-MarketingAssets

Write-Host 'Brand assets generated successfully.'
