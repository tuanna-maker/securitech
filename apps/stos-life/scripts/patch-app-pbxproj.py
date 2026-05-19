#!/usr/bin/env python3
"""Patch STOSLife.xcodeproj bundle script for paths with spaces."""
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
text = path.read_text()
text = text.replace(
    'export PROJECT_ROOT=\\"$PROJECT_DIR\\"/..',
    'export PROJECT_ROOT=\\"$PROJECT_DIR/..\\"',
)
old = (
    "`\\\"$NODE_BINARY\\\" --print \\\"require('path').dirname(require.resolve('react-native/package.json')) "
    "+ '/scripts/react-native-xcode.sh'\\\"`\\n\\n\";"
)
new = (
    "RN_XCODE_SCRIPT=\\\"$(\\\"$NODE_BINARY\\\" --print \\\"require('path').dirname(require.resolve('react-native/package.json')) "
    "+ '/scripts/react-native-xcode.sh'\\\")\\\"\\n/bin/sh \\\"$RN_XCODE_SCRIPT\\\"\\n\\n\";"
)
if old in text:
    text = text.replace(old, new, 1)
path.write_text(text)
