# Jenny - 3D Avatar Chat Application

A 3D avatar chat application using React Three Fiber, featuring text-to-speech with lip sync and Google's Gemini API.

## Features

- 3D avatar that speaks with synchronized lip movements
- Text-to-speech using ElevenLabs API
- AI chat responses powered by Google's Gemini API
- Multiple voice options
- Voice pitch, speed, and volume control

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- FFmpeg (for audio conversion and lip sync)

### Local Development

1. Clone the repository
```bash
git clone https://github.com/naveed-gung/jenny.git
cd jenny
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
```

3. Create a `.env` file in the backend directory with the following:
```
ELEVEN_LABS_API_KEY=your_elevenlabs_api_key
GEMINI_API_KEY=your_gemini_api_key
SPEECHGEN_API_KEY=your_speechgen_api_key
SPEECHGEN_EMAIL=your_speechgen_email
```

4. Start the backend server
```bash
cd backend
npm start
```

5. Start the frontend development server
```bash
cd frontend
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## Deployment on Render

This repository includes a `render.yaml` file for easy deployment on Render.com:

1. Push your code to GitHub
2. Sign up for a Render account at [render.com](https://render.com/)
3. Click "New" and select "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` configuration
6. Set required environment variables:
   - ELEVEN_LABS_API_KEY
   - GEMINI_API_KEY
   - SPEECHGEN_API_KEY
   - SPEECHGEN_EMAIL
7. Deploy!

## Credits

Created by Naveed Sohail Gung
