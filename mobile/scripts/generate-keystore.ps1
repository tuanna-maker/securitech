# Tạo keystore ký APK release (chạy một lần)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$keystoreDir = Join-Path $root "keystores"
$keystoreFile = Join-Path $keystoreDir "stos-release.keystore"
$propsFile = Join-Path $root "keystore.properties"

if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: keytool not found. Install JDK 17+ and add to PATH." -ForegroundColor Red
    Write-Host "  Or use Android Studio JBR: set JAVA_HOME to Studio\jbr" -ForegroundColor Yellow
    exit 1
}

New-Item -ItemType Directory -Force -Path $keystoreDir | Out-Null

if (Test-Path $keystoreFile) {
    Write-Host "Keystore already exists: $keystoreFile"
    exit 0
}

$keypass = "stos123456"
keytool -genkeypair -v `
    -storetype PKCS12 `
    -keystore $keystoreFile `
    -alias stos `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -storepass $keypass `
    -keypass $keypass `
    -dname "CN=STOS, OU=Securitech, O=STOS, L=HCM, ST=HCM, C=VN"

@"
storeFile=keystores/stos-release.keystore
storePassword=$keypass
keyAlias=stos
keyPassword=$keypass
"@ | Out-File -FilePath $propsFile -Encoding ascii -NoNewline
Add-Content -Path $propsFile -Value "" -Encoding ascii

Write-Host "Created: $keystoreFile"
Write-Host "Created: $propsFile"
Write-Host "WARNING: Default password is for local dev only. Change before production." -ForegroundColor Yellow
