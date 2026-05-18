# Build APK release bằng Gradle local -> mobile/release/
$ErrorActionPreference = "Stop"
$mobileRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $mobileRoot "android"
$releaseDir = Join-Path $mobileRoot "release"
$propsFile = Join-Path $mobileRoot "keystore.properties"
$keystoreFile = Join-Path $mobileRoot "keystores\stos-release.keystore"

function Find-JavaHome {
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) { return $env:JAVA_HOME }
    $candidates = @(
        "${env:ProgramFiles}\Android\Android Studio\jbr",
        "${env:ProgramFiles}\Java\jdk-17",
        "${env:ProgramFiles}\Java\jdk-21",
        "${env:ProgramFiles}\JetBrains\IntelliJ IDEA 2024.3.3\jbr",
        "${env:ProgramFiles}\JetBrains\WebStorm 2024.3.2.1\jbr",
        "${env:ProgramFiles}\Eclipse Adoptium\jdk-17*"
    )
    foreach ($c in $candidates) {
        $resolved = Resolve-Path $c -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($resolved -and (Test-Path "$resolved\bin\java.exe")) { return $resolved.Path }
    }
    return $null
}

function Find-AndroidSdk {
    if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) { return $env:ANDROID_HOME }
    if ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) { return $env:ANDROID_SDK_ROOT }
    $default = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    if (Test-Path $default) { return $default }
    return $null
}

$javaHome = Find-JavaHome
if (-not $javaHome) {
    Write-Host "ERROR: JDK not found. Install JDK 17+ or Android Studio, set JAVA_HOME." -ForegroundColor Red
    exit 1
}
$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"

$sdk = Find-AndroidSdk
if (-not $sdk) {
    Write-Host "ERROR: Android SDK not found. Install Android Studio SDK or set ANDROID_HOME." -ForegroundColor Red
    exit 1
}
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk

if (-not (Test-Path $propsFile)) {
    Write-Host "Keystore not configured. Running generate-keystore.ps1 ..."
    & (Join-Path $PSScriptRoot "generate-keystore.ps1")
}

if (-not (Test-Path $androidDir)) {
    Write-Host "android/ not found. Running expo prebuild ..."
    Push-Location $mobileRoot
    npx expo prebuild --platform android --no-install
    Pop-Location
    node (Join-Path $PSScriptRoot "patch-android-signing.js")
}

if (-not (Test-Path $androidDir)) {
    Write-Host "ERROR: android/ folder missing after prebuild." -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null

Push-Location $androidDir
Write-Host "Building release APK with Gradle ..."
.\gradlew.bat assembleRelease --no-daemon
$code = $LASTEXITCODE
Pop-Location

if ($code -ne 0) {
    Write-Host "Gradle build failed (exit $code)" -ForegroundColor Red
    exit $code
}

$apks = Get-ChildItem -Path $releaseDir -Filter "*.apk" -ErrorAction SilentlyContinue
if ($apks) {
    Write-Host ""
    Write-Host "SUCCESS - APK in mobile/release/:" -ForegroundColor Green
    $apks | ForEach-Object {
        $sizeMb = [math]::Round($_.Length / 1MB, 2)
        Write-Host ("  {0} ({1} MB)" -f $_.FullName, $sizeMb)
    }
} else {
    $fallback = Join-Path $androidDir "app\build\outputs\apk\release"
    if (Test-Path $fallback) {
        Copy-Item -Path "$fallback\*.apk" -Destination $releaseDir -Force
        Get-ChildItem $releaseDir -Filter "*.apk" | ForEach-Object {
            Write-Host "Copied: $($_.FullName)" -ForegroundColor Green
        }
    } else {
        Write-Host "Build finished but no APK found in release/ or outputs." -ForegroundColor Yellow
    }
}
