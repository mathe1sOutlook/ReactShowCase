param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\React Windows')).Path,
  [ValidateSet('x64', 'ARM64', 'Win32')][string]$Platform = 'x64',
  [string]$Configuration = 'Release',
  [string]$ArtifactsDir = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'artifacts\windows')
)

$ErrorActionPreference = 'Stop'

# --- Locate MSBuild ----------------------------------------------------------
$msbuild = Get-Command msbuild -ErrorAction SilentlyContinue

if (-not $msbuild) {
  $vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
  if (Test-Path $vswhere) {
    # Prefer stable VS2022, then preview, then any prerelease
    foreach ($prerelease in @($false, $true)) {
      $flags = @('-latest', '-requires', 'Microsoft.Component.MSBuild',
                 '-version', '[17.0,18.0)')
      if ($prerelease) { $flags += '-prerelease'; $flags = $flags | Where-Object { $_ -ne '-version' -and $_ -ne '[17.0,18.0)' }; $flags = @('-latest', '-prerelease', '-requires', 'Microsoft.Component.MSBuild') }
      $msbuildPath = & $vswhere @flags -find 'MSBuild\**\Bin\amd64\MSBuild.exe' | Select-Object -First 1
      if (-not $msbuildPath) {
        $msbuildPath = & $vswhere @flags -find 'MSBuild\**\Bin\MSBuild.exe' | Select-Object -First 1
      }
      if ($msbuildPath -and (Test-Path $msbuildPath)) {
        $msbuild = Get-Command $msbuildPath
        Write-Host "Auto-detected MSBuild at: $msbuildPath"
        break
      }
    }
  }
}

if (-not $msbuild) {
  throw 'MSBuild was not found. Install Visual Studio 2022 with UWP/Desktop C++ and React Native Windows workloads, or ensure MSBuild is on PATH.'
}

# --- Detect installed Windows SDK --------------------------------------------
$sdkRoot = "${env:ProgramFiles(x86)}\Windows Kits\10\Include"
$installedSdk = if (Test-Path $sdkRoot) {
  Get-ChildItem $sdkRoot -Directory | Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty Name
}
if ($installedSdk) {
  Write-Host "Using Windows SDK: $installedSdk"
} else {
  Write-Host 'Warning: Could not detect Windows SDK version - build will use project defaults.'
}

$solution = Join-Path $ProjectRoot 'windows\CFDWindows.sln'
if (-not (Test-Path $solution)) {
  throw "Windows solution not found at $solution"
}

if (-not (Test-Path $ArtifactsDir)) {
  New-Item -ItemType Directory -Path $ArtifactsDir -Force | Out-Null
}

$appxDir = $ArtifactsDir + '\'
$msbuildArgs = @(
  $solution,
  '/restore',
  "/p:Configuration=$Configuration",
  "/p:Platform=$Platform",
  '/p:GenerateAppxPackageOnBuild=true',
  '/p:UapAppxPackageBuildMode=SideloadOnly',
  '/p:AppxBundle=Always',
  '/p:AppxPackageSigningEnabled=false',
  "/p:AppxPackageDir=$appxDir"
)

if ($installedSdk) {
  $msbuildArgs += "/p:WindowsTargetPlatformVersion=$installedSdk"
}

# Inject a Directory.Build.targets at the project root to override warnings-as-errors
# AFTER each vcxproj's own settings. This is needed because react-native-windows 0.75
# hardcodes /WX and newer MSVC toolchains (v18+) emit new warnings (C4874, C4864).
$buildTargetsPath = Join-Path $ProjectRoot 'Directory.Build.targets'
$buildTargetsExisted = Test-Path $buildTargetsPath
$buildTargetsContent = @'
<Project>
  <ItemDefinitionGroup>
    <ClCompile>
      <TreatWarningAsError>false</TreatWarningAsError>
      <DisableSpecificWarnings>4874;4864;%(DisableSpecificWarnings)</DisableSpecificWarnings>
    </ClCompile>
  </ItemDefinitionGroup>
</Project>
'@

if (-not $buildTargetsExisted) {
  Set-Content -Path $buildTargetsPath -Value $buildTargetsContent -Encoding UTF8
  Write-Host 'Created temporary Directory.Build.targets to suppress C++ warnings-as-errors.'
}

try {
  & $msbuild.Source @msbuildArgs
} finally {
  # Clean up temporary build targets
  if (-not $buildTargetsExisted -and (Test-Path $buildTargetsPath)) {
    Remove-Item $buildTargetsPath -Force
    Write-Host 'Removed temporary Directory.Build.targets.'
  }
}

if ($LASTEXITCODE -ne 0) {
  throw 'Windows release packaging failed.'
}

Write-Host "Windows release artifacts written to $ArtifactsDir"
