#!/usr/bin/env bash
set -e

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Pass all args through to start.js
node start.js "$@"
