<div align="center">
  <img src="frontend/public/logo.svg" alt="Jenny Logo" width="200px">
  
  # Jenny - 3D AI Avatar Chat Application
  
  <p>
    <img src=".github/assets/robot.svg" alt="AI" width="20" height="20">
    <img src=".github/assets/chat.svg" alt="Chat" width="20" height="20">
  </p>
  
  <img src="frontend/public/image.png" alt="Jenny AI Avatar" width="600px">
</div>

## <img src=".github/assets/sparkles.svg" alt="Features" width="24" height="24" align="center"> Features

- <img src=".github/assets/mask.svg" alt="" width="20" height="20" align="center"> Expressive 3D avatar with synchronized lip movements
- <img src=".github/assets/speaker.svg" alt="" width="20" height="20" align="center"> Text-to-speech with ElevenLabs API for natural voices
- <img src=".github/assets/brain.svg" alt="" width="20" height="20" align="center"> AI-powered conversations using Google's Gemini API
- <img src=".github/assets/microphone.svg" alt="" width="20" height="20" align="center"> Multiple voice types with customizable settings
- <img src=".github/assets/controls.svg" alt="" width="20" height="20" align="center"> Adjustable voice pitch, speed, and volume

## <img src=".github/assets/rocket.svg" alt="Demo" width="24" height="24" align="center"> Demo

Check out the live demo: [Jenny AI Avatar Demo](https://jenny-90fq.onrender.com)

## <img src=".github/assets/tools.svg" alt="Installation" width="24" height="24" align="center"> Installation & Setup

### Prerequisites
- Node.js (v14+)
- FFmpeg (for audio conversion and lip sync)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/naveed-gung/jenny.git
cd jenny
```

2. **Install all dependencies at once**
```bash
npm run install-all
```

3. **Create a `.env` file in the backend directory with:**
```
TTS_OPEN_API_KEY=your_tts_open_api_key   # Optional, default key is provided
GEMINI_API_KEY=your_gemini_api_key
SPEECHGEN_API_KEY=your_speechgen_api_key  # Optional, for child voice
SPEECHGEN_EMAIL=your_speechgen_email      # Optional, for child voice
```

4. **Start development servers**
```bash
npm run dev
```

5. **Open your browser** and navigate to `http://localhost:5173`

## <img src=".github/assets/star.svg" alt="Key Features" width="24" height="24" align="center"> Key Features Explained

### Lifelike Speech with Lip Sync
The avatar uses ElevenLabs' realistic voice synthesis combined with lip synchronization to create a natural speaking experience. The lip sync is powered by Rhubarb Lip Sync technology.

### Expressive Animations
Different emotions and expressions (happy, sad, surprised) are triggered based on conversational context, making interactions feel more human.

### Voice Customization
Choose from different voice types (default, male, child) and adjust pitch, speed, and volume to personalize your experience.

## <img src=".github/assets/globe.svg" alt="Deployment" width="24" height="24" align="center"> Deployment on Render

This repository includes a `render.yaml` file for easy deployment:

1. Push your code to GitHub
2. Sign up for a Render account
3. Create a new Blueprint, pointing to your repository
4. Set the required environment variables
5. Deploy and enjoy!

## <img src=".github/assets/computer.svg" alt="Technologies" width="24" height="24" align="center"> Technologies Used

- **Frontend**: React, Three.js, React Three Fiber, TailwindCSS
- **Backend**: Node.js, Express
- **APIs**: Google Gemini API, ElevenLabs API, SpeechGen API
- **3D**: GLB models, animations, Three.js

## <img src=".github/assets/handshake.svg" alt="Contributing" width="24" height="24" align="center"> Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## <img src=".github/assets/document.svg" alt="License" width="24" height="24" align="center"> License

This project is licensed under the ISC License

## <img src=".github/assets/developer.svg" alt="Credits" width="24" height="24" align="center"> Credits

Created by Naveed Sohail Gung

---

If you like this project, please give it a <img src=".github/assets/star.svg" alt="star" width="20" height="20" align="center"> on GitHub!
