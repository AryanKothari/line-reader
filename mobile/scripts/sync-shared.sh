#!/bin/bash
# Copies shared/ source into mobile/node_modules/@line-reader/shared
# Run after modifying shared/ code
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
SHARED_SRC="$MOBILE_DIR/../shared"
SHARED_DEST="$MOBILE_DIR/node_modules/@line-reader/shared"

rm -rf "$SHARED_DEST"
mkdir -p "$SHARED_DEST"
cp -r "$SHARED_SRC"/{index.ts,types,lib,stores,package.json,tsconfig.json} "$SHARED_DEST/"
echo "Synced shared/ -> mobile/node_modules/@line-reader/shared"
