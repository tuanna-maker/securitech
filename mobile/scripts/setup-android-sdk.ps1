# Tao android/local.properties khi da cai Android SDK
$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk" }
if (-not (Test-Path $sdk)) {
    Write-Host "ERROR: Android SDK not found at: $sdk" -ForegroundColor Red
    Write-Host "Install Android Studio -> SDK Manager -> Android SDK, then set ANDROID_HOME." -ForegroundColor Yellow
    exit 1
}
$localProps = Join-Path (Split-Path -Parent $PSScriptRoot) "android\local.properties"
"sdk.dir=$($sdk -replace '\\','/')" | Set-Content -Path $localProps -Encoding ASCII
Write-Host "Created: $localProps"
Write-Host "sdk.dir=$sdk"
