# Frontend - 3D Avatar Chat Interface

The frontend of our AI 3D Avatar Chat Application, built with React, Three.js, and Vite. This component handles the 3D avatar rendering, user interface, and real-time communication with the backend.

## 🎯 Features

- **3D Avatar Rendering**: High-quality 3D character visualization using Three.js
- **Real-time Lip Sync**: Synchronized mouth movements with audio playback
- **Dynamic Animations**: Smooth transitions between different avatar states
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Interactive UI**: Modern chat interface with real-time updates

## 🛠️ Tech Stack

- React 18
- Three.js / React Three Fiber
- Vite
- TailwindCSS
- WebSocket for real-time communication

## 📦 Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
VITE_API_URL=http://localhost:3001
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── assets/        # Static assets (models, textures)
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── App.jsx        # Main application component
├── public/            # Public assets
└── index.html         # Entry HTML file
```

## 🔧 Configuration

### Avatar Customization

1. **3D Model**: Place your GLTF/GLB model in `src/assets/models/`
2. **Animations**: Configure in `src/components/Avatar.jsx`
3. **Materials**: Adjust in the Three.js material settings

### Environment Variables

- `VITE_API_URL`: Backend API URL
- `VITE_WS_URL`: WebSocket connection URL (optional)

## 🏗️ Building for Production

1. Create a production build:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📦 Dependencies

Key dependencies:
- `@react-three/fiber`: React renderer for Three.js
- `@react-three/drei`: Useful helpers for React Three Fiber
- `three`: 3D graphics library
- `tailwindcss`: Utility-first CSS framework
- `socket.io-client`: Real-time communication

## 🔍 Code Quality

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

## 🚢 Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` directory to your hosting service

## 📝 Notes

- Ensure WebGL is supported in the target browser
- Optimize 3D models for web performance
- Consider implementing fallbacks for older browsers

## 🤝 Contributing

1. Follow the coding standards
2. Write meaningful commit messages
3. Update documentation as needed
4. Test thoroughly before submitting PRs
