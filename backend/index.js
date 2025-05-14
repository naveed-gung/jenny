import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { promises as fs } from "fs";
import fs_sync from "fs"; // Add synchronous fs methods
import fetch from "node-fetch";
import path from "path";
// Import Tortoise TTS functions
import { generateSpeechWithTortoise, generateSilentAudio, initTortoiseTTS } from './tortoise-tts';
dotenv.config();

// Gemini API key (replacing Hugging Face)
const geminiApiKey = process.env.GEMINI_API_KEY;

// SpeechGen for child voice
const speechGenApiKey = process.env.SPEECHGEN_API_KEY;
const speechGenEmail = process.env.SPEECHGEN_EMAIL;

// Voice mapping for Tortoise TTS
const voiceMapping = {
  default: "emma", // Female voice for Tortoise
  male: "daniel", // Male voice for Tortoise
  child: "speechgen_child" // Special identifier for SpeechGen child voice  
};

// Counter for message files
let message_counter = 0;

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://jenny-frontend.onrender.com', 'https://jenny-app.onrender.com', 'https://jenny-90fq.onrender.com', 'http://localhost:5173']
    : 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Add a test endpoint for Gemini API
app.get("/test-gemini", async (req, res) => {
  try {
    const message = "Hello! Give me a short 1 sentence response to test the API connection.";
    const response = await getAIResponse(message);
    res.json({ 
      success: true, 
      message: "Gemini API connection successful", 
      response 
    });
  } catch (error) {
    console.error("Error testing Gemini API:", error);
    res.status(500).json({ 
      success: false, 
      message: "Gemini API connection failed", 
      error: error.message 
    });
  }
});

// Voice list endpoint now returns Tortoise voices
app.get("/voices", async (req, res) => {
  res.send([
    { voice_id: "emma", name: "Emma (Female)" },
    { voice_id: "daniel", name: "Daniel (Male)" },
    { voice_id: "speechgen_child", name: "Child Voice" }
  ]);
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  try {
    const time = new Date().getTime();
    console.log(`Starting conversion for message ${message}`);
    
    try {
      await execCommand(
        `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
      );
      console.log(`Conversion done in ${new Date().getTime() - time}ms`);
      
      // Try to use Rhubarb directly, like in original implementation
      try {
        // Check all possible locations for Rhubarb
        const possiblePaths = [
          path.join(process.cwd(), 'backend', 'bin', process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb'),
          path.join(process.cwd(), 'bin', process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb'),
          path.join('/opt/render/project/src/bin', process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb'),
          path.join('/opt/render/project/src/backend/bin', process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb')
        ];
        
        // Find the first existing Rhubarb path
        let rhubarbPath = null;
        for (const p of possiblePaths) {
          if (fs_sync.existsSync(p)) {
            rhubarbPath = p;
            console.log(`Found Rhubarb at: ${rhubarbPath}`);
            break;
          } else {
            console.log(`Not found at: ${p}`);
          }
        }
        
        if (!rhubarbPath) {
          throw new Error('Rhubarb executable not found in any location');
        }
        
        // Verify file permissions
        try {
          const stats = fs_sync.statSync(rhubarbPath);
          console.log(`Rhubarb permissions: ${stats.mode.toString(8)}`);
          if ((stats.mode & 0o111) === 0) {
            console.log('Rhubarb is not executable, setting permissions...');
            fs_sync.chmodSync(rhubarbPath, 0o755);
            console.log('Permissions updated');
          }
        } catch (statError) {
          console.error('Error checking Rhubarb permissions:', statError);
        }
        
        // Check all possible dictionary file locations
        console.log("Checking all possible dictionary file locations:");
        let dictPath = null;
        const possibleDictPaths = [
          path.join(process.cwd(), 'backend', 'bin', 'res', 'sphinx', 'cmudict-en-us.dict'),
          path.join(process.cwd(), 'bin', 'res', 'sphinx', 'cmudict-en-us.dict'),
          path.join('/opt/render/project/src/bin/res/sphinx', 'cmudict-en-us.dict'),
          path.join('/opt/render/project/src/backend/bin/res/sphinx', 'cmudict-en-us.dict')
        ];
        
        for (const p of possibleDictPaths) {
          console.log(`Checking: ${p}`);
          if (fs_sync.existsSync(p)) {
            dictPath = p;
            console.log(`✓ Dictionary file found at: ${dictPath}`);
            break;
          } else {
            console.log(`✗ Not found at: ${p}`);
          }
        }
        
        // Make sure output directory exists
        const outputDir = path.dirname(`audios/message_${message}.json`);
        if (!fs_sync.existsSync(outputDir)) {
          fs_sync.mkdirSync(outputDir, { recursive: true });
          console.log(`Created output directory: ${outputDir}`);
        }
        
        // Define dictionary directory as an explicit parameter
        const dictDir = path.dirname(dictPath || possibleDictPaths[0]);
        
        // Construct and run command with explicit dictionary directory
        const jsonPath = path.join(process.cwd(), 'audios', `message_${message}.json`);
        const command = `"${rhubarbPath}" -f json -o "${jsonPath}" --recognizer phonetic --dialogFile "${dictPath}" "audios/message_${message}.wav"`;
        console.log(`Running command: ${command}`);
        
        await execCommand(command);
        console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
        
        // Verify the output file was created
        const jsonExists = fs_sync.existsSync(jsonPath);
        console.log(`Lip sync JSON file exists: ${jsonExists}, path: ${jsonPath}`);
        
        if (jsonExists) {
          try {
            const content = await fs.readFile(jsonPath, 'utf8');
            const contentPreview = content.length > 100 ? content.substring(0, 100) + '...' : content;
            console.log(`Lip sync JSON content preview: ${contentPreview}`);
            
            // Check if the content is valid JSON with mouthCues
            const parsed = JSON.parse(content);
            if (!parsed.mouthCues || !Array.isArray(parsed.mouthCues) || parsed.mouthCues.length < 2) {
              console.error('Invalid lip sync data structure:', parsed);
              throw new Error('Invalid lip sync data structure');
            }
            
            console.log(`Valid lip sync data with ${parsed.mouthCues.length} mouth cues`);
            return jsonPath;
          } catch (jsonError) {
            console.error('Invalid lip sync JSON, falling back to artificial lip sync:', jsonError);
            throw new Error('Invalid lip sync JSON');
          }
        } else {
          throw new Error('Lip sync JSON file was not created');
        }
      } catch (rhubarbError) {
        console.error('Error running Rhubarb:', rhubarbError);
        console.log('Falling back to artificial lip sync');
        
        // Get audio duration using ffprobe
        const durationCommand = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 audios/message_${message}.wav`;
        const durationStr = await execCommand(durationCommand);
        const duration = parseFloat(durationStr.trim());
        
        console.log(`Audio duration: ${duration} seconds`);
        
        // Generate artificial lip sync data
        const lipSyncData = generateLipSyncData(duration);
        
        // Write artificial lip sync data to file
        const jsonPath = path.join(process.cwd(), 'audios', `message_${message}.json`);
        await fs.writeFile(jsonPath, JSON.stringify(lipSyncData));
        
        console.log(`Generated artificial lip sync with ${lipSyncData.mouthCues.length} mouth cues`);
        return jsonPath;
      }
    } catch (error) {
      console.error(`Error in processing: ${error.message}`);
      // Create a fallback lip sync file with default mouth cues
      const emptyLipSync = { 
        mouthCues: [
          { start: 0.0, end: 0.2, value: "X" },
          { start: 0.2, end: 0.4, value: "A" }
        ] 
      };
      await fs.writeFile(`audios/message_${message}.json`, JSON.stringify(emptyLipSync));
    }
  } catch (error) {
    console.error(`Error in lipSyncMessage:`, error);
    // Create a fallback empty lip sync file
    const emptyLipSync = { mouthCues: [] };
    await fs.writeFile(`audios/message_${message}.json`, JSON.stringify(emptyLipSync));
  }
};

// Generate artificial lip sync data based on audio duration
const generateLipSyncData = (duration) => {
  const mouthCues = [];
  const phonemes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'];
  
  // Set timing constants
  const minPhonemeLength = 0.1; // Minimum time for a mouth shape
  const maxPhonemeLength = 0.3; // Maximum time for a mouth shape
  
  let currentTime = 0;
  
  // Add a slight pause at the beginning
  mouthCues.push({ start: 0, end: 0.1, value: 'X' });
  currentTime = 0.1;
  
  // Generate phonemes to cover the full audio duration
  while (currentTime < duration) {
    // Choose a random phoneme, but favor some more common ones
    const phoneIndex = Math.floor(Math.random() * phonemes.length);
    const phoneme = phonemes[phoneIndex];
    
    // Randomize phoneme duration
    const phonemeDuration = Math.random() * (maxPhonemeLength - minPhonemeLength) + minPhonemeLength;
    const end = Math.min(currentTime + phonemeDuration, duration);
    
    mouthCues.push({
      start: currentTime,
      end: end,
      value: phoneme
    });
    
    currentTime = end;
  }
  
  return { mouthCues };
};

// Function to check if text is too long and split it into chunks
const splitTextIntoChunks = (text, maxLength = 500) => {
  if (text.length <= maxLength) return [text];
  
  const chunks = [];
  let sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length === 0) {
    // If no sentence breaks, split by space
    sentences = text.split(' ');
    let currentChunk = '';
    
    sentences.forEach(word => {
      if ((currentChunk + ' ' + word).length <= maxLength) {
        currentChunk = currentChunk ? currentChunk + ' ' + word : word;
      } else {
        chunks.push(currentChunk);
        currentChunk = word;
      }
    });
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
  } else {
    let currentChunk = '';
    
    sentences.forEach(sentence => {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        
        // If a single sentence is too long, split it
        if (sentence.length > maxLength) {
          const sentenceChunks = [];
          let words = sentence.split(' ');
          let tempChunk = '';
          
          words.forEach(word => {
            if ((tempChunk + ' ' + word).length <= maxLength) {
              tempChunk = tempChunk ? tempChunk + ' ' + word : word;
            } else {
              sentenceChunks.push(tempChunk);
              tempChunk = word;
            }
          });
          
          if (tempChunk) {
            sentenceChunks.push(tempChunk);
          }
          
          chunks.push(...sentenceChunks);
        } else {
          chunks.push(sentence);
        }
        
        currentChunk = '';
      }
    });
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
  }
  
  return chunks;
};

// Function to get response from Google's Gemini API
const getAIResponse = async (userMessage) => {
  try {
    // Log the request for debugging
    console.log("Sending request to Gemini API with message:", userMessage.substring(0, 50) + "...");

    // Simplified request structure following Google's documentation exactly
    const requestBody = {
      contents: [
        {
          parts: [
            { text: userMessage }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    };

    console.log("Using Gemini API key:", geminiApiKey ? "Key is present (starting with: " + geminiApiKey.substring(0, 3) + "...)" : "Key is missing");

    // Make request to Gemini API with gemini-2.0-flash model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    // Get response text before trying to parse as JSON (for better error reporting)
    const responseText = await response.text();
    
    // Log full response for debugging
    console.log("Gemini API response status:", response.status);
    console.log("Gemini API response text:", responseText.substring(0, 200) + "...");

    // Check if response is successful
    if (!response.ok) {
      console.error(`Gemini API error: ${response.status} - ${response.statusText}`);
      console.error("Response body:", responseText);
      return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
    }

    // Parse the response text as JSON
    const result = JSON.parse(responseText);
    
    // Extract the text response from Gemini's response format
    if (result.candidates && result.candidates.length > 0 && 
        result.candidates[0].content && 
        result.candidates[0].content.parts && 
        result.candidates[0].content.parts.length > 0) {
      
      return result.candidates[0].content.parts[0].text;
    } else if (result.promptFeedback && result.promptFeedback.blockReason) {
      console.error("Gemini response blocked:", result.promptFeedback);
      return "I'm sorry, I can't respond to that request. It may contain inappropriate content.";
      } else {
      console.error("Unexpected Gemini API response format:", JSON.stringify(result).substring(0, 200));
        return "I'm not sure how to respond to that. Could you try asking something else?";
    }
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return "I'm sorry, I'm having trouble thinking right now. Please try again later.";
  }
};

// Generate text to speech using Tortoise TTS
const generateSpeech = async (text, voiceType = "default", voicePitch = 1.0) => {
  try {
    console.log(`Generating speech with Tortoise TTS: "${text.substring(0, 30)}..." using voice ${voiceType}`);
    console.log(`Applied pitch adjustment: ${voicePitch}`);

    // If this is a child voice, use SpeechGen instead
    if (voiceType === "child" || voiceType === "speechgen_child") {
      if (speechGenApiKey && speechGenEmail) {
        return await generateSpeechGenSpeech(text, 1.0, voicePitch, 100);
      } else {
        console.log('SpeechGen API key not found, falling back to Tortoise TTS for child voice');
      }
    }

    // Use Tortoise TTS for all other voices
    const selectedVoice = voiceMapping[voiceType] || voiceMapping.default;
    
    try {
      // Generate speech with Tortoise TTS
      const audioPath = await generateSpeechWithTortoise(text, selectedVoice, message_counter, voicePitch);
      
      // Read the generated audio file
      const buffer = await fs.readFile(audioPath);
      console.log(`Speech successfully generated and saved as ${path.basename(audioPath)}`);
      
      return buffer.toString('base64');
    } catch (error) {
      console.error('Error generating speech with Tortoise TTS:', error);
      
      // Generate silent audio as last resort
      const silentAudioPath = await generateSilentAudio(message_counter, text.length / 10); // Estimate duration
      const buffer = await fs.readFile(silentAudioPath);
      console.log(`Generated silent audio as fallback: ${path.basename(silentAudioPath)}`);
      
      return buffer.toString('base64');
    }
  } catch (error) {
    console.error('Error in speech generation:', error);
    throw error;
  }
};

// Generate speech using SpeechGen.io API for child voice
const generateSpeechGenSpeech = async (text, voiceSpeed = 1.0, voicePitch = 0, voiceVolume = 100) => {
  try {
    console.log(`Generating speech with SpeechGen.io: "${text.substring(0, 30)}..."`);
    
    // Prepare data for SpeechGen.io API
    const data = {
      token: speechGenApiKey,
      email: speechGenEmail,
      voice: 'Carly', // Australian child voice
      text: text,
      format: 'mp3',
      speed: voiceSpeed,
      pitch: voicePitch, // Convert pitch to SpeechGen format (-20 to 20)
      emotion: 'good',
      pause_sentence: 300,
      pause_paragraph: 400,
      volume: voiceVolume // Add volume parameter
    };
    
    // Use the quick voice-over API for short texts
    const url = "https://speechgen.io/index.php?r=api/text";
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data).toString()
    });
    
    const result = await response.json();
    
    if (result.status === "1") {
      // Successfully generated speech
      console.log(`SpeechGen.io response: ${JSON.stringify(result)}`);
      
      // Download the audio file
      const audioResponse = await fetch(result.file);
      const arrayBuffer = await audioResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Save the audio file
      await fs.writeFile(`audios/message_${message_counter}.mp3`, buffer);
      console.log(`SpeechGen speech saved as message_${message_counter}.mp3`);
      
      return buffer.toString('base64');
    } else if (result.status === "0") {
      // Still processing
      console.log("SpeechGen.io is still processing the request");
      throw new Error("SpeechGen.io is still processing the request");
    } else {
      // Error
      console.error(`SpeechGen.io API error: ${result.error}`);
      throw new Error(`SpeechGen.io API error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error generating speech with SpeechGen.io:', error);
    throw error;
  }
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const mode = req.body.mode || "chat";
  const voiceType = req.body.voiceType || "default";
  const voicePitch = req.body.voicePitch || 1.0;
  const voiceSpeed = req.body.voiceSpeed || 1.0; // Add speed parameter
  const voiceVolume = req.body.voiceVolume || 100; // Add volume parameter
  
  const selectedVoiceID = voiceMapping[voiceType] || voiceID;

  if (!userMessage) {
    // For first-time welcome message, use pre-existing files if available
    try {
    res.send({
      messages: [
        {
            text: "Hello! I'm your AI reader. Type text for me to read or ask me a question!",
            audio: await audioFileToBase64("audios/greeting.mp3"),
            lipsync: await readJsonTranscript("audios/greeting.json"),
          facialExpression: "smile",
          animation: "Waving", // Changed to Waving animation for greeting
          }
        ],
      });
    } catch (error) {
      // If intro files don't exist, just send the message without audio/lipsync
      res.send({
        messages: [
          {
            text: "Hello! I'm your AI reader. Type text for me to read or ask me a question!",
            facialExpression: "smile",
            animation: "Talking_1",
          }
      ],
    });
    }
    return;
  }

  // Initialize Tortoise TTS if not already initialized
await initTortoiseTTS().catch(err => {
  console.error("Failed to initialize Tortoise TTS:", err);
});

  let messages = [];

  try {
    if (mode === "read") {
      // Process text reading mode
      const textChunks = splitTextIntoChunks(userMessage);
      const responseMessages = [];

      for (let i = 0; i < Math.min(textChunks.length, 5); i++) { // Limit to 5 chunks max
        const chunk = textChunks[i];
        responseMessages.push({
          text: chunk,
          facialExpression: "default",
          animation: i % 2 === 0 ? "Talking_0" : "Talking_1",
        });
      }

      messages = responseMessages;
    } else {
      // Chat mode - use AI model to generate response
      const aiResponse = await getAIResponse(userMessage);
      
      // Determine facial expression and animation based on the content
      const lowerResponse = aiResponse.toLowerCase();
      let facialExpression = "default";
      let animation = "Talking_0";
      
      if (lowerResponse.includes("sorry") || lowerResponse.includes("sad") || lowerResponse.includes("unfortunately")) {
        facialExpression = "sad";
        animation = "Talking_2";
      } else if (lowerResponse.includes("haha") || lowerResponse.includes("funny") || lowerResponse.includes("laugh")) {
        facialExpression = "smile";
        animation = "Laughing";
      } else if (lowerResponse.includes("wow") || lowerResponse.includes("amazing") || lowerResponse.includes("incredible")) {
        facialExpression = "surprised";
        animation = "Talking_1";
      }
      
      messages = [{
        text: aiResponse,
        facialExpression,
        animation
      }];
    }

    // Process messages with audio generation
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
      
      try {
        message_counter = i; 
        let audioBase64;
        
        // Use SpeechGen for child voice, ElevenLabs for others
        if (voiceType === 'child') {
          // Convert ElevenLabs pitch (0.5-1.5) to SpeechGen pitch (-20 to 20)
          const speechGenPitch = Math.round((voicePitch - 1) * 20);
          audioBase64 = await generateSpeechGenSpeech(message.text, voiceSpeed, speechGenPitch, voiceVolume);
        } else {
          audioBase64 = await generateSpeech(message.text, selectedVoiceID, voicePitch);
        }
        
        message.audio = audioBase64;
        
        // Always process lip sync after audio is generated
        try {
    await lipSyncMessage(i);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
          
          // Validate lip sync data - if empty or invalid, regenerate using our algorithm
          if (!message.lipsync || !message.lipsync.mouthCues || message.lipsync.mouthCues.length < 2) {
            console.log("Detected empty or invalid lip sync data, generating artificial data");
            
            // Get audio duration
            try {
              const durationCommand = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 audios/message_${i}.mp3`;
              const durationStr = await execCommand(durationCommand);
              const duration = parseFloat(durationStr.trim());
              
              console.log(`Audio duration: ${duration} seconds`);
              
              // Generate artificial lip sync data
              const lipSyncData = generateLipSyncData(duration);
              await fs.writeFile(`audios/message_${i}.json`, JSON.stringify(lipSyncData));
              message.lipsync = lipSyncData;
            } catch (error) {
              console.error("Error generating backup lip sync:", error);
              message.lipsync = { mouthCues: [
                { start: 0, end: 1, value: "A" },
                { start: 1, end: 2, value: "B" }
              ]};
            }
          }
        } catch (lipSyncError) {
          console.error('Lip sync failed:', lipSyncError);
          message.lipsync = generateLipSyncData(3); // Default 3 seconds of lip sync data
        }
      } catch (error) {
        console.error(`Error processing message ${i}:`, error);
      }
  }

  res.send({ messages });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send({ 
      error: "An error occurred processing your request",
      messages: [{
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        facialExpression: "sad",
        animation: "Talking_0"
      }]
    });
  }
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

// Function to check if FFmpeg is installed and available
const checkFFmpeg = async () => {
  try {
    await execCommand('ffmpeg -version');
    console.log('FFmpeg is available');
    return true;
  } catch (error) {
    console.error('FFmpeg is not installed or not in PATH:', error.message);
    return false;
  }
};

// Ensure the audios directory exists
const ensureAudioDirectory = async () => {
  try {
    // Create audios directory
    const audioDir = path.join(process.cwd(), 'audios');
    try {
      await fs.access(audioDir);
      console.log('Audios directory exists');
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(audioDir, { recursive: true });
      console.log('Created audios directory');
    }
    
    // Create bin directory
    const binDir = path.join(process.cwd(), 'bin');
    try {
      await fs.access(binDir);
      console.log('Bin directory exists');
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(binDir, { recursive: true });
      console.log('Created bin directory');
    }
    
    // Initialize Tortoise TTS
    try {
      const tortoiseInitialized = await initTortoiseTTS();
      console.log(`Tortoise TTS initialization ${tortoiseInitialized ? 'successful' : 'failed'}`);
    } catch (error) {
      console.error('Error initializing Tortoise TTS:', error);
    }
  } catch (error) {
    console.error('Error ensuring directories exist:', error);
  }
};

// Enhanced function to check and set up FFmpeg and Rhubarb
const setupTools = async () => {
  try {
    // Ensure directories exist
    await ensureAudioDirectory();
    
    // Check FFmpeg
    const ffmpegAvailable = await checkFFmpeg();
    if (!ffmpegAvailable) {
      console.log('Warning: The application will run without proper lip sync capability');
    }
    
    // List all files in bin directory for debugging
    try {
      console.log("Checking bin directory content...");
      const binDirPath = path.join(process.cwd(), 'bin');
      if (fs_sync.existsSync(binDirPath)) {
        const files = fs_sync.readdirSync(binDirPath);
        console.log(`Files in bin directory: ${JSON.stringify(files)}`);
        
        // Check for subdirectories
        if (fs_sync.existsSync(path.join(binDirPath, 'res'))) {
          const resFiles = fs_sync.readdirSync(path.join(binDirPath, 'res'));
          console.log(`Files in bin/res directory: ${JSON.stringify(resFiles)}`);
          
          if (fs_sync.existsSync(path.join(binDirPath, 'res', 'sphinx'))) {
            const sphinxFiles = fs_sync.readdirSync(path.join(binDirPath, 'res', 'sphinx'));
            console.log(`Files in bin/res/sphinx directory: ${JSON.stringify(sphinxFiles)}`);
          }
        }
      } else {
        console.log('bin directory does not exist');
      }
    } catch (listError) {
      console.error('Error listing directory contents:', listError);
    }
    
    // Check for Rhubarb executable in both possible locations
    const rhubarb = process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb';
    
    // Check all possible locations
    const possiblePaths = [
      path.join(process.cwd(), 'backend', 'bin', rhubarb),
      path.join(process.cwd(), 'bin', rhubarb),
      path.join('/opt/render/project/src/bin', rhubarb),
      path.join('/opt/render/project/src/backend/bin', rhubarb),
      // Add more potential paths if needed
    ];
    
    let rhubarbPath = null;
    let found = false;
    
    console.log("Checking all possible Rhubarb locations:");
    for (const pathToCheck of possiblePaths) {
      try {
        console.log(`Checking: ${pathToCheck}`);
        await fs.access(pathToCheck);
        console.log(`✓ Rhubarb found at: ${pathToCheck}`);
        rhubarbPath = pathToCheck;
        found = true;
        break;
      } catch (error) {
        console.log(`✗ Not found at: ${pathToCheck}`);
      }
    }
    
    // If Rhubarb not found, try using 'which' on Linux/Mac
    if (!found && process.platform !== 'win32') {
      try {
        const whichOutput = await execCommand('which rhubarb');
        if (whichOutput.trim()) {
          rhubarbPath = whichOutput.trim();
          found = true;
          console.log(`✓ Rhubarb found in PATH: ${rhubarbPath}`);
        }
      } catch (whichError) {
        console.log('Rhubarb not found in PATH');
      }
    }
    
    if (!found) {
      console.warn('Rhubarb executable not found in any location. Lip sync will be disabled.');
      console.warn('To enable lip sync, please download Rhubarb from https://github.com/DanielSWolf/rhubarb-lip-sync/releases');
      console.warn('and place the executable in the bin directory.');
    } else {
      // If found, also check for dictionary files
      const possibleDictPaths = [
        path.join(process.cwd(), 'backend', 'bin', 'res', 'sphinx', 'cmudict-en-us.dict'),
        path.join(process.cwd(), 'bin', 'res', 'sphinx', 'cmudict-en-us.dict'),
        path.join('/opt/render/project/src/bin/res/sphinx', 'cmudict-en-us.dict'),
        path.join('/opt/render/project/src/backend/bin/res/sphinx', 'cmudict-en-us.dict'),
      ];
      
      let dictPath = null;
      let dictExists = false;
      
      console.log("Checking all possible dictionary file locations:");
      for (const pathToCheck of possibleDictPaths) {
        try {
          console.log(`Checking: ${pathToCheck}`);
          await fs.access(pathToCheck);
          console.log(`✓ Dictionary file found at: ${pathToCheck}`);
          dictPath = pathToCheck;
          dictExists = true;
          break;
        } catch (error) {
          console.log(`✗ Not found at: ${pathToCheck}`);
        }
      }
      
      if (!dictExists) {
        console.warn('Dictionary file not found. Lip sync may not work properly.');
      }
    }
  } catch (error) {
    console.error('Error setting up tools:', error);
  }
};

// Call setup at startup instead of separate function calls
setupTools().catch(console.error);

// Add a debug endpoint for checking lip sync and tool configurations
app.get("/debug-lipsync", async (req, res) => {
  try {
    // Check all possible Rhubarb locations
    console.log("Checking all possible Rhubarb locations:");
    const possiblePaths = [
      path.join(process.cwd(), 'backend', 'bin', process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb'),
      path.join(process.cwd(), 'bin', process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb'),
      path.join('/opt/render/project/src/bin', process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb'),
      path.join('/opt/render/project/src/backend/bin', process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb')
    ];
    
    const rhubarbResults = [];
    for (const p of possiblePaths) {
      const exists = fs_sync.existsSync(p);
      rhubarbResults.push({
        path: p,
        exists,
        ...(exists ? { permissions: fs_sync.statSync(p).mode.toString(8) } : {})
      });
      console.log(`${exists ? '✓' : '✗'} ${exists ? 'Found' : 'Not found'} at: ${p}`);
    }
    
    // Check all possible dictionary file locations
    console.log("Checking all possible dictionary file locations:");
    const possibleDictPaths = [
      path.join(process.cwd(), 'backend', 'bin', 'res', 'sphinx', 'cmudict-en-us.dict'),
      path.join(process.cwd(), 'bin', 'res', 'sphinx', 'cmudict-en-us.dict'),
      path.join('/opt/render/project/src/bin/res/sphinx', 'cmudict-en-us.dict'),
      path.join('/opt/render/project/src/backend/bin/res/sphinx', 'cmudict-en-us.dict')
    ];
    
    const dictResults = [];
    for (const p of possibleDictPaths) {
      const exists = fs_sync.existsSync(p);
      dictResults.push({
        path: p,
        exists,
        ...(exists ? { 
          size: fs_sync.statSync(p).size,
          sample: fs_sync.readFileSync(p, 'utf8').substring(0, 100) + '...'
        } : {})
      });
      console.log(`${exists ? '✓' : '✗'} ${exists ? 'Found' : 'Not found'} at: ${p}`);
    }
    
    // Check for other files in the sphinx directory
    const sphinxDir = path.dirname(possibleDictPaths.find(p => fs_sync.existsSync(p)) || possibleDictPaths[0]);
    let sphinxFiles = [];
    if (fs_sync.existsSync(sphinxDir)) {
      sphinxFiles = fs_sync.readdirSync(sphinxDir);
    }
    
    // Check audio directory
    let audioDir = path.join(process.cwd(), 'audios');
    let audioFiles = [];
    let audioDirectoryExists = false;
    if (fs_sync.existsSync(audioDir)) {
      audioDirectoryExists = true;
      audioFiles = fs_sync.readdirSync(audioDir).slice(0, 10); // Just get the first 10 files
    }
    
    // Check ffmpeg
    let ffmpegAvailable = false;
    try {
      const ffmpegResult = await execCommand('ffmpeg -version');
      ffmpegAvailable = ffmpegResult.includes('ffmpeg version');
    } catch (e) {
      ffmpegAvailable = false;
    }
    
    // Try to generate test lip sync
    let testLipSyncResult = null;
    if (ffmpegAvailable) {
      try {
        // Create a simple test audio file
        const testAudioPath = path.join(audioDir, 'test_audio.wav');
        await execCommand('ffmpeg -f lavfi -i "sine=frequency=440:duration=1" -c:a pcm_s16le ' + testAudioPath);
        
        // Find Rhubarb path
        const rhubarbPath = possiblePaths.find(p => fs_sync.existsSync(p));
        
        if (rhubarbPath) {
          // Find dictionary path
          const dictPath = possibleDictPaths.find(p => fs_sync.existsSync(p));
          
          if (dictPath) {
            // Try to run Rhubarb on the test audio
            const testJsonPath = path.join(audioDir, 'test_lipsync.json');
            const command = `"${rhubarbPath}" -f json -o "${testJsonPath}" --recognizer phonetic --dialogFile "${dictPath}" "${testAudioPath}"`;
            
            try {
              await execCommand(command);
              
              // Check the output
              if (fs_sync.existsSync(testJsonPath)) {
                const jsonContent = fs_sync.readFileSync(testJsonPath, 'utf8');
                const parsed = JSON.parse(jsonContent);
                testLipSyncResult = {
                  success: true,
                  command,
                  mouthCues: parsed.mouthCues ? parsed.mouthCues.length : 0,
                  sample: jsonContent.substring(0, 100) + '...'
                };
              } else {
                testLipSyncResult = {
                  success: false,
                  command,
                  error: 'Output file not created'
                };
              }
            } catch (error) {
              testLipSyncResult = {
                success: false,
                command,
                error: error.message
              };
            }
          } else {
            testLipSyncResult = {
              success: false,
              error: 'Dictionary file not found'
            };
          }
        } else {
          testLipSyncResult = {
            success: false,
            error: 'Rhubarb not found'
          };
        }
      } catch (e) {
        testLipSyncResult = {
          success: false,
          error: e.message
        };
      }
    }
    
    // Return all the debug info
    res.json({
      env: {
        platform: process.platform,
        nodeVersion: process.version,
        cwd: process.cwd(),
        env: process.env.NODE_ENV
      },
      rhubarb: {
        paths: rhubarbResults,
        foundPath: rhubarbResults.find(r => r.exists)?.path || null
      },
      dictionary: {
        paths: dictResults,
        foundPath: dictResults.find(r => r.exists)?.path || null,
        sphinxDir,
        sphinxFiles
      },
      audio: {
        directoryExists: audioDirectoryExists,
        directoryPath: audioDir,
        sampleFiles: audioFiles
      },
      tools: {
        ffmpeg: ffmpegAvailable
      },
      testLipSync: testLipSyncResult
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Export the app
export default app;
