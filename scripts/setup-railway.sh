#!/bin/bash
# Railway CLI Setup Script for Galaxy Online III
# Auto-configures PATH and Railway MCP integration

set -e

RAILWAY_BIN="$HOME/.railway/bin"
SHELL_RC=""

# Detect shell and corresponding RC file
if [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
elif [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
fi

# Add Railway to PATH if not already present
if [ -d "$RAILWAY_BIN" ]; then
    if ! echo "$PATH" | grep -q "$RAILWAY_BIN"; then
        echo "Adding Railway to PATH..."
        if [ -n "$SHELL_RC" ]; then
            echo "export PATH=\"$RAILWAY_BIN:\$PATH\"" >> "$SHELL_RC"
            echo "Railway added to PATH in $SHELL_RC"
        fi
        # Also add for current session
        export PATH="$RAILWAY_BIN:$PATH"
    fi
    
    echo "Railway CLI version: $(railway --version)"
    
    # Check session
    if railway whoami 2>/dev/null; then
        echo "Railway session: ACTIVE"
        
        # Check if linked to project
        if [ -f .railway/config.json ] || [ -d .railway ]; then
            echo "Project linked: YES"
            railway status 2>/dev/null || true
        else
            echo "Project linked: NO"
            echo "Run: railway link  (to link this project)"
        fi
    else
        echo "Railway session: NOT LOGGED IN"
        echo "Run: railway login  (or set RAILWAY_TOKEN env var)"
    fi
else
    echo "Railway CLI not found. Installing..."
    curl -fsSL https://railway.app/install.sh | bash
    exec "$0"  # Re-run after install
fi
