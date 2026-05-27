#!/bin/bash
# GO3 Commander Portraits Download Script
# Run this before building to download the 100 AI-generated commander portraits
#
# Usage:
#   cd apps/web/public/assets
#   bash download-portraits.sh

set -e

ZIP_URL="https://github.com/l2zerogravedad-netizen/galaxyonlineiii/releases/download/portraits-v1/go2-portraits-100.zip"

echo "========================================"
echo "  GO3 Portrait Download Script"
echo "========================================"

if [ -f "cmd_panis.webp" ]; then
  echo "Portraits already exist. Skipping download."
  exit 0
fi

echo "Downloading portraits..."
if command -v curl &> /dev/null; then
  curl -L -o portraits.zip "$ZIP_URL" 2>/dev/null || echo "WARNING: Download failed. Please manually download portraits."
elif command -v wget &> /dev/null; then
  wget -O portraits.zip "$ZIP_URL" 2>/dev/null || echo "WARNING: Download failed. Please manually download portraits."
else
  echo "ERROR: curl or wget required for download."
  exit 1
fi

if [ -f "portraits.zip" ]; then
  echo "Extracting portraits..."
  unzip -o portraits.zip
  rm portraits.zip
  echo "Done! $(ls cmd_*.webp 2>/dev/null | wc -l) portraits installed."
else
  echo "WARNING: Could not download portraits automatically."
  echo "Please manually extract go2-portraits-100.zip into this directory."
fi
