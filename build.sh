#!/bin/bash

# Exit on error
set -e

# Print commands
set -x

# Install FFmpeg for audio processing and lip sync
apt-get update -qq
apt-get install -y ffmpeg

# Make sure the Rhubarb binary is executable
mkdir -p bin
cp -r backend/bin/* bin/ 2>/dev/null || echo "No files to copy from backend/bin"
chmod +x bin/rhubarb 2>/dev/null || echo "Failed to make rhubarb executable"

# Print versions for debugging
echo "FFmpeg version:"
ffmpeg -version | head -n 1

# Check if rhubarb exists
if [ -f "bin/rhubarb" ]; then
  echo "Rhubarb exists in bin directory"
  ls -la bin/
else
  echo "Rhubarb does not exist in bin directory"
  if [ -f "backend/bin/rhubarb" ]; then
    echo "Rhubarb exists in backend/bin directory"
    ls -la backend/bin/
  else
    echo "Rhubarb does not exist in backend/bin directory either"
  fi
fi

# Continue with normal build process
echo "Installing packages..."
npm install
cd frontend
npm install
npm run build
cd ../backend
npm install

echo "Build completed successfully" 