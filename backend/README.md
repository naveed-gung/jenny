# Backend - AI Avatar Chat Server

The backend server for our AI 3D Avatar Chat Application, handling AI processing, voice synthesis, and real-time communication with the frontend.

## 🎯 Features

- **AI Processing**: Integration with OpenAI for natural language understanding
- **Voice Synthesis**: High-quality voice generation using ElevenLabs
- **Lip Sync**: Automatic generation of mouth movement data
- **Real-time Communication**: WebSocket support for instant updates
- **File Management**: Efficient handling of audio and lip sync files

## 🛠️ Tech Stack

- Node.js
- Express.js
- OpenAI API
- ElevenLabs API
- WebSocket
- Rhubarb Lip Sync

## 📦 Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
PORT=3001
```

## 🚀 Development

Start the development server:
```bash
npm start
```

The server will be available at `http://localhost:3001`

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── routes/        # API route handlers
│   ├── services/      # Business logic
│   ├── utils/         # Utility functions
│   └── index.js       # Main application file
├── bin/              # Executable scripts
├── audios/           # Generated audio files
└── package.json      # Project configuration
```

## 🔧 Configuration

### Environment Variables

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `ELEVENLabs_API_KEY`: Your ElevenLabs API key
- `PORT`: Server port (default: 3001)

### API Configuration

1. **OpenAI Settings**:
   - Model: GPT-4
   - Temperature: 0.7
   - Max tokens: 150

2. **ElevenLabs Settings**:
   - Voice ID: Configure in `.env`
   - Stability: 0.5
   - Similarity boost: 0.75

## 🏗️ Building for Production

1. Create a production build:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📦 Dependencies

Key dependencies:
- `express`: Web framework
- `openai`: OpenAI API client
- `elevenlabs-node`: ElevenLabs API client
- `socket.io`: WebSocket implementation
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variable management

## 🔍 Code Quality

- ESLint for code linting
- Prettier for code formatting
- Jest for testing

## 🚢 Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to your hosting service (e.g., Render, Heroku, AWS)

### Deployment Checklist

- [ ] Set up environment variables
- [ ] Configure CORS settings
- [ ] Set up SSL/TLS
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Configure logging

## 📝 Notes

- Ensure proper error handling
- Implement rate limiting for API endpoints
- Set up proper logging
- Configure CORS appropriately
- Implement security best practices

## 🤝 Contributing

1. Follow the coding standards
2. Write meaningful commit messages
3. Update documentation as needed
4. Test thoroughly before submitting PRs
