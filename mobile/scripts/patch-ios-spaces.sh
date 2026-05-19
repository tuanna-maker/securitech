#!/usr/bin/env bash
# Fix Expo/RN build scripts that break when the project path contains spaces.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

CONSTANTS_SH="$ROOT/node_modules/expo-constants/scripts/get-app-config-ios.sh"
if [[ -f "$CONSTANTS_SH" ]]; then
  sed -i '' 's/PROJECT_DIR_BASENAME=$(basename $PROJECT_DIR)/PROJECT_DIR_BASENAME=$(basename "$PROJECT_DIR")/' "$CONSTANTS_SH"
fi

CONSTANTS_PODSPEC="$ROOT/node_modules/expo-constants/ios/EXConstants.podspec"
if [[ -f "$CONSTANTS_PODSPEC" ]]; then
  python3 - <<'PY' "$CONSTANTS_PODSPEC"
import pathlib, sys
path = pathlib.Path(sys.argv[1])
text = path.read_text()
old = 'bash -l -c \\"#{env_vars}$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"'
new = '/bin/bash -l \\"#{env_vars}$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"'
if old in text:
    path.write_text(text.replace(old, new, 1))
PY
fi

PBXPROJ="$ROOT/ios/Pods/Pods.xcodeproj/project.pbxproj"
if [[ -f "$PBXPROJ" ]]; then
  python3 - <<'PY' "$PBXPROJ"
import pathlib, sys
path = pathlib.Path(sys.argv[1])
text = path.read_text()
old = 'bash -l -c \\"$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"'
new = '/bin/bash -l \\"${PODS_TARGET_SRCROOT}/../scripts/get-app-config-ios.sh\\"'
if old in text:
    path.write_text(text.replace(old, new, 1))
PY
fi

echo "[patch-ios-spaces] Patched paths for directories containing spaces."
