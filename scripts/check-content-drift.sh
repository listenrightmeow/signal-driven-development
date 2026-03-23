#!/usr/bin/env bash
set -euo pipefail

MANIFEST="site/src/data/.content-hashes.json"

if [ ! -f "$MANIFEST" ]; then
  echo "⚠️  No content hash manifest found at $MANIFEST"
  echo "Run 'npm run sync:content-hashes' from site/ to create it."
  exit 1
fi

DRIFT_FOUND=0

while IFS= read -r file; do
  stored_hash=$(jq -r ".sources[\"$file\"]" "$MANIFEST")
  if [ "$stored_hash" = "null" ]; then
    continue
  fi

  current_hash=$(sha256sum "$file" | cut -c1-12)

  if [ "$stored_hash" != "$current_hash" ]; then
    if [ "$DRIFT_FOUND" -eq 0 ]; then
      echo ""
      echo "CONTENT DRIFT DETECTED"
      echo ""
    fi
    echo "  Modified: $file"
    echo "    Manifest: $stored_hash"
    echo "    Current:  $current_hash"
    echo ""
    DRIFT_FOUND=1
  fi
done < <(jq -r '.sources | keys[]' "$MANIFEST")

if [ "$DRIFT_FOUND" -eq 1 ]; then
  echo "The website's walkthrough data may be stale. Update site/src/data/walkthrough.json"
  echo "and run: npm run sync:content-hashes (from site/) to update the manifest."
  exit 1
fi

echo "✅ No content drift detected."
