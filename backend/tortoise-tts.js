// Tortoise TTS integration for Jenny
// This module provides a free alternative to ElevenLabs for text-to-speech generation

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import tar from 'tar-fs';

// Configuration
const TORTOISE_MODELS_DIR = path.join(process.cwd(), 'backend', 'models', 'tortoise');
const TORTOISE_OUTPUT_DIR = path.join(process.cwd(), 'audios');

// Ensure directories exist
const ensureDirs = async () => {
  try {
    await fs.mkdir(TORTOISE_MODELS_DIR, { recursive: true });
    await fs.mkdir(TORTOISE_OUTPUT_DIR, { recursive: true });
    console.log('Tortoise TTS directories created successfully');
  } catch (error) {
    console.error('Error creating Tortoise TTS directories:', error);
  }
};

// Execute shell commands
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command execution error: ${error}`);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};

// Check if Python and pip are installed
const checkPythonInstallation = async () => {
  try {
    await execCommand('python --version');
    await execCommand('pip --version');
    return true;
  } catch (error) {
    console.error('Python or pip is not installed:', error);
    return false;
  }
};

// Install Tortoise TTS if not already installed
const installTortoiseTTS = async () => {
  try {
    // Check if requirements.txt exists
    const requirementsPath = path.join(process.cwd(), 'backend', 'requirements.txt');
    try {
      await fs.access(requirementsPath);
    } catch (error) {
      // Create requirements.txt if it doesn't exist
      const requirements = [
        'torch==2.0.1',
        'torchaudio==2.0.2',
        'numpy',
        'inflect',
        'tqdm',
        'rotary_embedding_torch',
        'transformers',
        'unidecode',
        'scipy',
        'librosa'
      ];
      await fs.writeFile(requirementsPath, requirements.join('\n'));
      console.log('Created requirements.txt for Tortoise TTS');
    }

    // Create and use a virtual environment for Python packages
    const venvPath = path.join(process.cwd(), 'venv');
    const venvBin = process.platform === 'win32' ? 'Scripts' : 'bin';
    const venvPython = path.join(venvPath, venvBin, process.platform === 'win32' ? 'python.exe' : 'python');
    const venvPip = path.join(venvPath, venvBin, process.platform === 'win32' ? 'pip.exe' : 'pip');
    
    // Check if venv already exists
    try {
      await fs.access(venvPath);
      console.log('Python virtual environment already exists');
    } catch (error) {
      // Create virtual environment
      console.log('Creating Python virtual environment...');
      await execCommand('python -m venv ' + venvPath);
    }
    
    // Install requirements in the virtual environment
    console.log('Installing Tortoise TTS dependencies in virtual environment...');
    await execCommand(`"${venvPip}" install -r ${requirementsPath}`);
    
    // Clone Tortoise TTS repository if not already cloned
    const tortoiseDir = path.join(process.cwd(), 'backend', 'tortoise-tts');
    try {
      await fs.access(tortoiseDir);
      console.log('Tortoise TTS repository already exists');
    } catch (error) {
      console.log('Cloning Tortoise TTS repository...');
      await execCommand('git clone https://github.com/neonbjb/tortoise-tts.git ' + tortoiseDir);
    }
    
    // Install Tortoise TTS in the virtual environment
    console.log('Installing Tortoise TTS in virtual environment...');
    await execCommand(`"${venvPip}" install -e ${tortoiseDir}`);
    
    return true;
  } catch (error) {
    console.error('Error installing Tortoise TTS:', error);
    return false;
  }
};

// Generate speech using Tortoise TTS
const generateSpeechWithTortoise = async (text, voiceType, messageId) => {
  try {
    console.log(`Generating speech with Tortoise TTS: "${text.substring(0, 30)}..."`);
    
    // Map voice types to Tortoise voices
    const voiceMap = {
      default: 'female',
      female: 'female',
      male: 'male',
      child: 'young_female',
      emma: 'female',
      daniel: 'male'
    };
    
    const voice = voiceMap[voiceType] || 'female';
    const outputPath = path.join(TORTOISE_OUTPUT_DIR, `message_${messageId}.wav`);
    
    // Create a temporary Python script to run Tortoise TTS
    const scriptPath = path.join(process.cwd(), 'backend', 'tortoise_script.py');
    const scriptContent = `
import sys
import torch
from tortoise.api import TextToSpeech
from tortoise.utils.audio import load_audio, save_audio

# Initialize TTS system
tts = TextToSpeech()

# Get arguments
text = "${text.replace(/"/g, '\\"')}"
voice = "${voice}"
output_path = "${outputPath.replace(/\\/g, '\\\\')}"

# Generate speech
gen = tts.tts(text, voice_samples=[f"tortoise/voices/{voice}"], conditioning_latents=None)

# Save audio
save_audio(gen.squeeze(0).cpu(), output_path, 24000)
print(f"Audio saved to {output_path}")
`;
    
    await fs.writeFile(scriptPath, scriptContent);
    
    // Get the virtual environment Python path
    const venvPath = path.join(process.cwd(), 'venv');
    const venvBin = process.platform === 'win32' ? 'Scripts' : 'bin';
    const venvPython = path.join(venvPath, venvBin, process.platform === 'win32' ? 'python.exe' : 'python');
    
    // Run the Python script with the virtual environment's Python
    console.log('Running Tortoise TTS with virtual environment...');
    await execCommand(`"${venvPython}" ${scriptPath}`);
    
    // Clean up the script
    await fs.unlink(scriptPath);
    
    // Convert WAV to MP3 for compatibility
    const mp3Path = path.join(TORTOISE_OUTPUT_DIR, `message_${messageId}.mp3`);
    await execCommand(`ffmpeg -y -i ${outputPath} -codec:a libmp3lame -qscale:a 2 ${mp3Path}`);
    
    // Read the generated MP3 file
    const buffer = await fs.readFile(mp3Path);
    console.log(`Tortoise TTS speech saved as message_${messageId}.mp3`);
    
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error generating speech with Tortoise TTS:', error);
    throw error;
  }
};

// Simple fallback method that generates a silent audio file
// This is used when all TTS methods fail
const generateSilentAudio = async (text, voiceType, messageId) => {
  // Calculate duration based on text length (approximately 1 second per 10 characters)
  const duration = text ? Math.max(1, text.length / 10) : 1;
  try {
    console.log(`Generating silent audio for message ${messageId}`);
    const outputPath = path.join(TORTOISE_OUTPUT_DIR, `message_${messageId}.mp3`);
    
    // Generate a silent audio file using ffmpeg
    await execCommand(`ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t ${duration} -q:a 9 -acodec libmp3lame ${outputPath}`);
    
    // Read the generated file
    const buffer = await fs.readFile(outputPath);
    console.log(`Silent audio saved as message_${messageId}.mp3`);
    
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error generating silent audio:', error);
    throw error;
  }
};

// Initialize Tortoise TTS
const initTortoiseTTS = async () => {
  try {
    await ensureDirs();
    console.log('Checking Python installation...');
    const pythonInstalled = await checkPythonInstallation();
    
    if (pythonInstalled) {
      console.log('Python is installed, setting up Tortoise TTS with virtual environment...');
      return await installTortoiseTTS();
    } else {
      console.log('Python is not installed, Tortoise TTS will not be available');
      return false;
    }
  } catch (error) {
    console.error('Tortoise TTS initialization failed', error);
    return false;
  }
};

export {
  generateSpeechWithTortoise,
  generateSilentAudio,
  initTortoiseTTS
};