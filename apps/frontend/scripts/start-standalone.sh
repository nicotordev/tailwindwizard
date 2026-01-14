#!/bin/sh

# Ensure we are in the project root (apps/frontend) or adjust paths accordingly.
# This script assumes it's run from apps/frontend via `pnpm start`.

echo "Copying static assets to standalone directory..."

# Create destination directories
mkdir -p .next/standalone/apps/frontend/.next/static
mkdir -p .next/standalone/apps/frontend/public

# Copy .next/static
cp -r .next/static/* .next/standalone/apps/frontend/.next/static/

# Copy public folder
cp -r public/* .next/standalone/apps/frontend/public/

echo "Assets copied. Starting server..."

# Bind to 0.0.0.0 for container access
export HOSTNAME=0.0.0.0
export PORT=3000

# Start the standalone server
node .next/standalone/apps/frontend/server.js
