import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import fs_sync from "fs"; // Add synchronous fs methods
import fetch from "node-fetch";
import path from "path";
dotenv.config();

// Gemini API key (replacing Hugging Face)
const geminiApiKey = process.env.GEMINI_API_KEY;

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const speechGenApiKey = process.env.SPEECHGEN_API_KEY;
const speechGenEmail = process.env.SPEECHGEN_EMAIL;
const voiceID = "kgG7dCoKCfLehAPWkJOE";

const voiceMapping = {
  default: "jsCqWAovK2LkecY7zXl4", 
  male: "29vD33N1CtxCmqQRPOHJ",    
  child: "speechgen_child" // Special identifier for SpeechGen child voice  
};

// Counter for message files
let message_counter = 0;

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://jenny-90fq.onrender.com', 'https://jenny-frontend.onrender.com', 'https://jenny-app.onrender.com']
    : 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));
const port = 3000;

// API status endpoint to replace "Hello World"
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Jenny AI Avatar API",
    endpoints: {
      "/chat": "POST - Main chat endpoint",
      "/voices": "GET - List available voices",
      "/test-gemini": "GET - Test Gemini API connection"
    }
  });
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

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
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
        const rhubarbPath = path.join(process.cwd(), 'bin', process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb');
        console.log(`Using Rhubarb at: ${rhubarbPath}`);
        
        // Check if dictionary files exist
        const dictPath = path.join(process.cwd(), 'bin', 'res', 'sphinx', 'cmudict-en-us.dict');
        const exists = fs_sync.existsSync(dictPath);
        console.log(`Dictionary file exists: ${exists}, path: ${dictPath}`);
      
        const command = `"${rhubarbPath}" -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`;
        console.log(`Running command: ${command}`);
        
        await execCommand(command);
        console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
        
        // Verify the output file was created
        const jsonPath = path.join(process.cwd(), 'audios', `message_${message}.json`);
        const jsonExists = fs_sync.existsSync(jsonPath);
        console.log(`Lip sync JSON file exists: ${jsonExists}, path: ${jsonPath}`);
        
        if (jsonExists) {
          const content = await fs.readFile(jsonPath, 'utf8');
          console.log(`Lip sync JSON content: ${content}`);
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
        await fs.writeFile(`audios/message_${message}.json`, JSON.stringify(lipSyncData));
        console.log(`Generated artificial lip sync data`);
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

// Generate text to speech using ElevenLabs directly with fetch
const generateSpeech = async (text, voiceId, voicePitch = 1.0) => {
  try {
    // ElevenLabs doesn't directly support pitch adjustment in their API
    // We'll just log it but not modify the text
      console.log(`Applied pitch adjustment: ${voicePitch}`);

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: text, // Use the original text without modifications
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ElevenLabs API error:', errorData);
      throw new Error(`ElevenLabs API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save the audio file
    await fs.writeFile(`audios/message_${message_counter}.mp3`, buffer);
    console.log(`Speech successfully generated and saved as message_${message_counter}.mp3`);
    
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error generating speech:', error);
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

  if (!elevenLabsApiKey) {
    res.send({
      messages: [
        {
          text: "Please add your ElevenLabs API key to continue. I need it to generate speech.",
          facialExpression: "sad",
          animation: "Talking_0",
        }
      ],
    });
    return;
  }

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
    
    // Check for Rhubarb executable
    const binDir = path.join(process.cwd(), 'bin');
    const rhubarb = process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb';
    const rhubarbPath = path.join(binDir, rhubarb);
    
    try {
      await fs.access(rhubarbPath);
      console.log(`Rhubarb found at ${rhubarbPath}`);
    } catch (error) {
      console.warn(`Rhubarb not found at ${rhubarbPath}. Lip sync will be disabled.`);
      console.warn(`To enable lip sync, please download Rhubarb from https://github.com/DanielSWolf/rhubarb-lip-sync/releases`);
      console.warn(`and place the executable in the bin directory.`);
    }
  } catch (error) {
    console.error('Error setting up tools:', error);
  }
};

// Call setup at startup instead of separate function calls
setupTools().catch(console.error);

// Export the app
export default app;
