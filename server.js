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

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a unified Express app
const app = express();

// Use CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://jenny-90fq.onrender.com', 'https://jenny-frontend.onrender.com', 'https://jenny-app.onrender.com']
    : 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Add JSON parsing middleware
app.use(express.json({ limit: '50mb' }));

// Import the backend API
import backendApp from './backend/index.js';

// Mount the backend API at /
app.use('/', backendApp);

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Create HTTP server
const PORT = process.env.PORT || 10000;
createServer(app).listen(PORT, () => {
  console.log(`Unified server running on port ${PORT}`);
}); 