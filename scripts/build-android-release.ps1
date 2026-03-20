param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\React Android')).Path,
  [ValidateSet('all', 'apk', 'aab')][string]$Artifact = 'all',
  [string]$ArtifactsDir = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'artifacts\android')
)

$ErrorActionPreference = 'Stop'

$java = Get-Command java -ErrorAction SilentlyContinue
if (-not $java) {
  throw 'Java was not found on PATH. Install JDK 17+ and the Android SDK before running this release script.'
}

$gradlew = Join-Path $ProjectRoot 'android\gradlew.bat'
if (-not (Test-Path $gradlew)) {
  throw "Gradle wrapper not found at $gradlew"
}

$androidDir = Split-Path -Parent $gradlew
if (-not (Test-Path $ArtifactsDir)) {
  New-Item -ItemType Directory -Path $ArtifactsDir -Force | Out-Null
}

Push-Location $androidDir
try {
  if ($Artifact -eq 'all') {
    & $gradlew clean assembleRelease bundleRelease
  } elseif ($Artifact -eq 'apk') {
    & $gradlew clean assembleRelease
  } else {
    & $gradlew clean bundleRelease
  }

  if ($LASTEXITCODE -ne 0) {
    throw 'Android release build failed.'
  }

  if ($Artifact -in @('all', 'apk')) {
    Get-ChildItem 'app\build\outputs\apk\release\*.apk' -ErrorAction SilentlyContinue | Copy-Item -Destination $ArtifactsDir -Force
  }

  if ($Artifact -in @('all', 'aab')) {
    Get-ChildItem 'app\build\outputs\bundle\release\*.aab' -ErrorAction SilentlyContinue | Copy-Item -Destination $ArtifactsDir -Force
  }
} finally {
  Pop-Location
}

Write-Host "Android release artifacts copied to $ArtifactsDir"
