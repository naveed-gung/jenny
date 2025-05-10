import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import fs from 'fs';

// Ensure audios directory exists
const audioDir = path.join(process.cwd(), 'audios');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
  console.log('Created audios directory');
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