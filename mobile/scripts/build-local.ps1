# Build APK release: cai SDK (neu thieu) + Gradle local -> mobile/release/
$ErrorActionPreference = "Stop"
$mobileRoot = Split-Path -Parent $PSScriptRoot

function Find-JavaHome {
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) { return $env:JAVA_HOME }
    $jdkDirs = Get-ChildItem "${env:ProgramFiles}\Microsoft\jdk-*-hotspot" -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    @(
        if ($jdkDirs) { $jdkDirs[0].FullName } else { $null },
        "${env:ProgramFiles}\Android\Android Studio\jbr",
        "${env:ProgramFiles}\Java\jdk-21",
        "${env:ProgramFiles}\JetBrains\IntelliJ IDEA 2024.3.3\jbr"
    ) | Where-Object { $_ } | ForEach-Object {
        if (Test-Path "$_\bin\java.exe") { return $_ }
    }
    return $null
}

$java = Find-JavaHome
if (-not $java) {
    Write-Host "ERROR: JDK not found. Install JDK 17+ or set JAVA_HOME." -ForegroundColor Red
    exit 1
}
$env:JAVA_HOME = $java
$env:PATH = "$java\bin;$env:PATH"

$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk" }
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk

if (-not (Test-Path (Join-Path $sdk "platforms\android-35"))) {
    Write-Host "Android SDK missing. Running install-android-sdk-cli.ps1 ..."
    & (Join-Path $PSScriptRoot "install-android-sdk-cli.ps1")
}

if (-not (Test-Path (Join-Path $mobileRoot "keystore.properties"))) {
    & (Join-Path $PSScriptRoot "generate-keystore.ps1")
}

$androidDir = Join-Path $mobileRoot "android"
if (-not (Test-Path $androidDir)) {
    Push-Location $mobileRoot
    npx expo prebuild --platform android --no-install
    Pop-Location
    node (Join-Path $PSScriptRoot "patch-android-signing.js")
}

if (-not (Test-Path (Join-Path $androidDir "local.properties"))) {
    & (Join-Path $PSScriptRoot "setup-android-sdk.ps1")
}

$releaseDir = Join-Path $mobileRoot "release"
New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null

Push-Location $androidDir
Write-Host "Gradle assembleRelease (khong dung clean - tranh loi CMake codegen)..."
.\gradlew.bat assembleRelease --no-daemon
$code = $LASTEXITCODE
Pop-Location

if ($code -ne 0) { exit $code }

$out = Join-Path $androidDir "app\build\outputs\apk\release"
if (Test-Path $out) {
    Copy-Item "$out\*.apk" $releaseDir -Force
}
Get-ChildItem $releaseDir -Filter "*.apk" | ForEach-Object {
    $mb = [math]::Round($_.Length / 1MB, 2)
    Write-Host ("APK: {0} ({1} MB)" -f $_.FullName, $mb) -ForegroundColor Green
}
