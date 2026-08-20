#!/bin/bash
echo "Scanning for corrupted image files..."
find public src assets -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" -o -iname "*.ico" \) 2>/dev/null | while read -r file; do
  filetype=$(file -b "$file")
  if [[ "$filetype" != *"image data"* && "$filetype" != *"PNG"* && "$filetype" != *"JPEG"* && "$filetype" != *"GIF"* ]]; then
    echo "SUSPECT: $file -> $filetype"
  fi
done
echo "Scan complete."
