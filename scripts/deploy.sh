#!/bin/bash
set -e

echo "=== GO3 Deploy ==="

# 1. Install
echo "Installing dependencies..."
npm install

# 2. Prisma generate
echo "Generating Prisma client..."
cd packages/database && npx prisma generate && cd ../..

# 3. Build
echo "Building..."
cd apps/web && npm run build && cd ../..

# 4. Deploy to Railway
echo "Deploying to Railway..."
railway up

echo "=== Deploy Complete ==="
