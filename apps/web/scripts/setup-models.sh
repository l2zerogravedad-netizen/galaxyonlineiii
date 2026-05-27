#!/bin/bash
# Setup script for GLB models
# Copies spaceship models from external assets to public/models/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SOURCE_DIR="/assets/external/quaternius/ultimate_space_kit"
DEST_DIR="$PROJECT_ROOT/public/models"

echo "======================================"
echo "  GO2 Battle Arena 3D - Model Setup"
echo "======================================"

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "WARNING: Source directory not found: $SOURCE_DIR"
    echo ""
    echo "Please download the Ultimate Space Kit from Quaternius and extract to:"
    echo "  $SOURCE_DIR"
    echo ""
    echo "Download from: https://quaternius.com/packs/ultimatespacekit.html"
    echo ""
    echo "The component includes fallback geometry, so the game will work without models."
    echo ""
    exit 0
fi

echo "Source: $SOURCE_DIR"
echo "Dest:   $DEST_DIR"
echo ""

# Copy spaceship models (player ships)
cp "$SOURCE_DIR/Spaceship.glb" "$DEST_DIR/Spaceship.glb" 2>/dev/null || echo "  - Spaceship.glb not found in source"
cp "$SOURCE_DIR/Spaceship-Jqfed124pQ.glb" "$DEST_DIR/Spaceship-Jqfed124pQ.glb" 2>/dev/null || echo "  - Spaceship-Jqfed124pQ.glb not found in source"
cp "$SOURCE_DIR/Spaceship-VSxUAFhzbA.glb" "$DEST_DIR/Spaceship-VSxUAFhzbA.glb" 2>/dev/null || echo "  - Spaceship-VSxUAFhzbA.glb not found in source"
cp "$SOURCE_DIR/Spaceship-u105mYHLHU.glb" "$DEST_DIR/Spaceship-u105mYHLHU.glb" 2>/dev/null || echo "  - Spaceship-u105mYHLHU.glb not found in source"

# Copy enemy models
cp "$SOURCE_DIR/Enemy-Flying.glb" "$DEST_DIR/Enemy-Flying.glb" 2>/dev/null || echo "  - Enemy-Flying.glb not found in source"
cp "$SOURCE_DIR/Enemy-Large.glb" "$DEST_DIR/Enemy-Large.glb" 2>/dev/null || echo "  - Enemy-Large.glb not found in source"
cp "$SOURCE_DIR/Enemy-Small.glb" "$DEST_DIR/Enemy-Small.glb" 2>/dev/null || echo "  - Enemy-Small.glb not found in source"

echo ""
echo "Model setup complete!"
echo ""
echo "Models in $DEST_DIR:"
ls -la "$DEST_DIR/"*.glb 2>/dev/null || echo "  (no .glb files found)"
