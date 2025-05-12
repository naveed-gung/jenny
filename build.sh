#!/bin/bash

# Install dependencies for root, frontend, and backend
echo "Installing dependencies..."
npm run install-all

# Build the frontend
echo "Building frontend..."
cd frontend && npm run build
cd ..

# Copy Rhubarb files from backend/bin to bin (if they exist)
echo "Copying Rhubarb files..."
mkdir -p bin
if [ -d "backend/bin" ]; then
  cp -r backend/bin/* bin/ 2>/dev/null || echo "No Rhubarb files to copy"
fi

echo "Build completed successfully!" 