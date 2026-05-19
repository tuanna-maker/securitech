#!/usr/bin/env bash
# Fix Expo/RN iOS build when project path contains spaces (e.g. "vibe coding")
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

CONSTANTS_SH="$ROOT/node_modules/expo-constants/scripts/get-app-config-ios.sh"
if [[ -f "$CONSTANTS_SH" ]]; then
  sed -i '' 's/PROJECT_DIR_BASENAME=$(basename $PROJECT_DIR)/PROJECT_DIR_BASENAME=$(basename "$PROJECT_DIR")/' "$CONSTANTS_SH"
fi

CONSTANTS_PODSPEC="$ROOT/node_modules/expo-constants/ios/EXConstants.podspec"
if [[ -f "$CONSTANTS_PODSPEC" ]]; then
  python3 - <<'PY' "$CONSTANTS_PODSPEC"
import pathlib, sys, re
path = pathlib.Path(sys.argv[1])
text = path.read_text()
# Never bake unquoted PROJECT_ROOT at pod-install time (breaks paths with spaces).
text = re.sub(
    r'env_vars = ENV\[\'PROJECT_ROOT\'\] \? "PROJECT_ROOT=#\{ENV\[\'PROJECT_ROOT\'\]\} " : ""',
    'env_vars = ""  # PROJECT_ROOT derived at build time in get-app-config-ios.sh',
    text,
)
old_scripts = [
    'bash -l -c \\"#{env_vars}$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"',
    '/bin/bash -l \\"#{env_vars}\\"$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"',
    '/bin/bash -l \\"#{env_vars}\\"$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"',
]
new_script = '/bin/bash -l \\"$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"'
for old in old_scripts:
    if old in text:
        text = text.replace(old, new_script, 1)
        break
path.write_text(text)
PY
fi

PBXPROJ="$ROOT/ios/Pods/Pods.xcodeproj/project.pbxproj"
if [[ -f "$PBXPROJ" ]]; then
  python3 - <<'PY' "$PBXPROJ"
import pathlib, sys, re
path = pathlib.Path(sys.argv[1])
text = path.read_text()
# Remove baked PROJECT_ROOT=... (often wrong path + breaks on spaces)
text = re.sub(
    r'/bin/bash -l \\"PROJECT_ROOT=[^\\]*\\"\$PODS_TARGET_SRCROOT',
    '/bin/bash -l \\"$PODS_TARGET_SRCROOT',
    text,
)
text = text.replace(
    'bash -l -c \\"$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"',
    '/bin/bash -l \\"$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"',
)
path.write_text(text)
PY
fi

APP_PBXPROJ="$ROOT/ios/STOSLife.xcodeproj/project.pbxproj"
if [[ -f "$APP_PBXPROJ" ]]; then
  python3 "$ROOT/scripts/patch-app-pbxproj.py" "$APP_PBXPROJ"
fi

echo "[patch-ios-spaces] Patched stos-life for paths with spaces."
