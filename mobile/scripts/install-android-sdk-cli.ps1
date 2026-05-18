# Cai Android SDK chi bang command-line tools (KHONG can Android Studio)
$ErrorActionPreference = "Stop"

$sdkRoot = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA "Android\Sdk" }
$cmdlineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-13114758_latest.zip"
$zipPath = Join-Path $env:TEMP "android-cmdline-tools.zip"
$cmdlineDir = Join-Path $sdkRoot "cmdline-tools\latest"

Write-Host "SDK root: $sdkRoot"
New-Item -ItemType Directory -Force -Path $sdkRoot | Out-Null

if (-not (Test-Path (Join-Path $cmdlineDir "bin\sdkmanager.bat"))) {
    Write-Host "Downloading Android command-line tools..."
    Invoke-WebRequest -Uri $cmdlineToolsUrl -OutFile $zipPath -UseBasicParsing
    $extractTemp = Join-Path $env:TEMP "android-cmdline-extract"
    if (Test-Path $extractTemp) { Remove-Item $extractTemp -Recurse -Force }
    Expand-Archive -Path $zipPath -DestinationPath $extractTemp -Force
    $inner = Join-Path $extractTemp "cmdline-tools"
    if (-not (Test-Path $inner)) { throw "Unexpected zip layout" }
    New-Item -ItemType Directory -Force -Path (Join-Path $sdkRoot "cmdline-tools") | Out-Null
    if (Test-Path $cmdlineDir) { Remove-Item $cmdlineDir -Recurse -Force }
    Move-Item $inner $cmdlineDir
    Remove-Item $extractTemp -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
    Write-Host "Command-line tools installed."
}

# Accept licenses without prompt (CI-style)
$licensesDir = Join-Path $sdkRoot "licenses"
New-Item -ItemType Directory -Force -Path $licensesDir | Out-Null
@{
    "android-sdk-license" = "8933bad161af4178b1185a1a38f350789-2653837"
    "android-sdk-preview-license" = "84831b9409646a918e30573bab4c9c91346d8abd"
    "android-googletv-license" = "601085b94cd77f0b54ff86406957099ebe79ecb4"
    "google-gdk-license" = "33b6a2b64607f11b759f320ef9dff4ae5c2aed79"
    "intel-android-extra-license" = "d97579d1a1ba29bc356f6ebe42b7e2c7f2a67e2"
    "mips-android-sysimage-license" = "e9acab5b5fbb560a3219b6b5c72cc2ce8f94eeac"
    "android-sdk-arm-dbt-license" = "859f317696f67ef339d529b9a54a53142239d73e"
} | ForEach-Object {
    $_.GetEnumerator() | ForEach-Object {
        Set-Content -Path (Join-Path $licensesDir $_.Key) -Value $_.Value -NoNewline -Encoding ASCII
    }
}

$sdkmanager = Join-Path $cmdlineDir "bin\sdkmanager.bat"
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot

$packages = @(
    "platform-tools",
    "platforms;android-36",
    "build-tools;36.0.0",
    "ndk;27.1.12297006"
)

Write-Host "Installing SDK packages..."
& $sdkmanager --sdk_root=$sdkRoot @packages

$mobileRoot = Split-Path -Parent $PSScriptRoot
$localProps = Join-Path $mobileRoot "android\local.properties"
$sdkDir = $sdkRoot -replace '\\', '/'
"sdk.dir=$sdkDir" | Set-Content -Path $localProps -Encoding ASCII

Write-Host "Done: $localProps"
