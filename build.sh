#!/bin/bash

# Install dependencies for root, frontend, and backend
echo "Installing dependencies..."
npm run install-all

# Build the frontend
echo "Building frontend..."
cd frontend && npm run build
cd ..

# Download and set up Rhubarb
echo "Setting up Rhubarb for lip sync..."
mkdir -p bin/res/sphinx
mkdir -p bin/res/phonemes

# Download Rhubarb for Linux
if [ "$(uname)" == "Linux" ]; then
  echo "Downloading Rhubarb for Linux..."
  wget -q https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.tar.gz -O rhubarb.tar.gz
  tar -xzf rhubarb.tar.gz
  cp rhubarb/rhubarb bin/
  chmod +x bin/rhubarb
  rm -rf rhubarb.tar.gz rhubarb
  
  # Download dictionary files
  echo "Downloading CMU dictionary files..."
  wget -q https://sourceforge.net/projects/cmusphinx/files/Acoustic%20and%20Language%20Models/US%20English/cmusphinx-en-us-5.2.tar.gz/download -O cmudict.tar.gz
  mkdir -p temp_cmu
  tar -xzf cmudict.tar.gz -C temp_cmu
  find temp_cmu -name "cmudict-en-us.dict" -exec cp {} bin/res/sphinx/ \;
  find temp_cmu -name "*.fst" -exec cp {} bin/res/sphinx/ \;
  rm -rf cmudict.tar.gz temp_cmu
elif [ -d "backend/bin" ]; then
  # Try to copy from backend/bin as fallback
  echo "Trying to copy Rhubarb from backend/bin..."
  cp -r backend/bin/* bin/ 2>/dev/null || echo "No Rhubarb files found in backend/bin"
fi

# Create simple phoneme files if they don't exist
echo "Setting up basic phoneme files..."
for phoneme in A B C D E F G H X; do
  echo "phoneme $phoneme" > "bin/res/phonemes/$phoneme.txt"
done

echo "Build completed successfully!" 