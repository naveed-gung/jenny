import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import fs from 'fs';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables - prioritize backend .env if it exists
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const rootEnvPath = path.join(__dirname, '.env');

if (fs.existsSync(backendEnvPath)) {
  console.log('Loading environment variables from backend/.env');
  dotenv.config({ path: backendEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  console.log('Loading environment variables from root .env');
  dotenv.config({ path: rootEnvPath });
} else {
  console.log('No .env file found, using system environment variables');
  dotenv.config();
}

// Set correct bin directory path for both local and deployed environments
const binDir = path.join(__dirname, 'backend', 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
  console.log('Created backend/bin directory');
}

// Create symlink for the audios directory in the root to point to backend/audios
// This ensures all paths are consistent regardless of where the code is executed from
const rootAudioDir = path.join(__dirname, 'audios');
const backendAudioDir = path.join(__dirname, 'backend', 'audios');

if (!fs.existsSync(backendAudioDir)) {
  fs.mkdirSync(backendAudioDir, { recursive: true });
  console.log('Created backend/audios directory');
}

// Ensure the backend/bin directory has Rhubarb if available
const isWindows = process.platform === 'win32';
const rhubarbName = isWindows ? 'rhubarb.exe' : 'rhubarb';
const rhubarbPath = path.join(binDir, rhubarbName);

// Set the BIN_DIRECTORY environment variable for consistent access
process.env.BIN_DIRECTORY = binDir;
process.env.AUDIO_DIRECTORY = backendAudioDir;

// Import the backend code
import './backend/index.js';

// Create a new Express app to serve the frontend
const frontendApp = express();

// Use CORS
frontendApp.use(cors());

// Parse JSON request bodies
frontendApp.use(express.json({ limit: '50mb' }));

// Forward /chat endpoint to the backend
frontendApp.post('/chat', async (req, res) => {
  try {
    // Import the handleChatRequest function from backend
    const { handleChatRequest } = await import('./backend/index.js');
    
    if (typeof handleChatRequest === 'function') {
      // Call the handler directly
      await handleChatRequest(req, res);
    } else {
      console.error('Chat handler not found in backend module');
      res.status(500).json({ error: 'Chat handler not available' });
    }
  } catch (error) {
    console.error('Error forwarding chat request:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// Serve static files from the frontend build directory
frontendApp.use(express.static(path.join(__dirname, 'frontend/dist')));

// All other GET requests not handled before will return the React app
frontendApp.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Create HTTP server
const PORT = process.env.PORT || 10000;
createServer(frontendApp).listen(PORT, () => {
  console.log(`Unified server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Bin directory: ${process.env.BIN_DIRECTORY}`);
  console.log(`Audio directory: ${process.env.AUDIO_DIRECTORY}`);
  console.log(`ElevenLabs API key status: ${process.env.ELEVEN_LABS_API_KEY ? 'Present' : 'Missing'}`);
  console.log(`Gemini API key status: ${process.env.GEMINI_API_KEY ? 'Present' : 'Missing'}`);
}); 