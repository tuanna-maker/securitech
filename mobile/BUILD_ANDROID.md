# Build APK Android (Gradle local) → `mobile/release/`

**Không cần Android Studio** — chỉ cần JDK + Android SDK command-line (script tự cài).

## Yêu cầu

1. **JDK 17+** (JetBrains JBR / JDK đều được)
2. **Node.js** + `npm install` trong `mobile/`

## Lệnh nhanh (Windows, không Android Studio)

```powershell
cd mobile
npm install
npm run sdk:install       # lần đầu: tải SDK + cmdline-tools (~500MB)
npm run keystore          # lần đầu: tạo keystore ký APK
npm run build:android:release
```

APK nằm tại: **`mobile/release/app-release.apk`** (hoặc tên tương tự từ Gradle).

## Thủ công (Gradle)

```powershell
cd mobile\android
.\gradlew.bat assembleRelease
```

Sau đó copy từ `android\app\build\outputs\apk\release\` sang `mobile\release\`.

## Ghi chú

- Mật khẩu keystore mặc định trong script chỉ dùng **dev/local** — đổi trước khi phát hành.
- `keystore.properties` và `keystores/` không commit (đã gitignore).
