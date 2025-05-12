import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Ensure required directories exist
const audioDir = path.join(process.cwd(), 'audios');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
  console.log('Created audios directory');
}

const binDir = path.join(process.cwd(), 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
  console.log('Created bin directory');
}

// Import the backend code
import './backend/index.js';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
}); 