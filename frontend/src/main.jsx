import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ChatProvider } from "./hooks/useChat";

// Unlock audio context for browsers
function unlockAudioContext() {
  // Create a silent audio context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  
  // Create and play a silent audio buffer
  const buffer = audioContext.createBuffer(1, 1, 22050);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
  
  // Create a silent audio element as fallback
  const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
  silentAudio.play().catch(() => {});
  
  // Resume audio context if suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Mark the document as user-interacted
  document.documentElement.setAttribute('data-user-interacted', 'true');
  document.documentElement.setAttribute('data-audio-unlocked', 'true');
}

// Add user interaction tracking for audio playback
function addUserInteractionTracking() {
  const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown', 'pointerdown'];
  
  function handleUserInteraction() {
    // Unlock audio on user interaction
    unlockAudioContext();
    
    // Remove event listeners once interaction is detected
    interactionEvents.forEach(event => {
      document.removeEventListener(event, handleUserInteraction);
    });
    
    console.log('User interaction detected, audio unlocked');
  }
  
  // Add event listeners for user interactions
  interactionEvents.forEach(event => {
    document.addEventListener(event, handleUserInteraction);
  });
  
  // Try to unlock audio immediately (works in some browsers)
  setTimeout(unlockAudioContext, 100);
}

// Initialize user interaction tracking
addUserInteractionTracking();

// Force unlock audio on page load
document.addEventListener('DOMContentLoaded', unlockAudioContext);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);
