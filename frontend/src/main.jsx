import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ChatProvider } from "./hooks/useChat";

// Unlock audio context for browsers
function unlockAudioContext() {
  console.log("Attempting to unlock audio context...");
  
  // Create a silent audio context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  
  if (!AudioContext) {
    console.log("AudioContext not supported in this browser");
    return;
  }
  
  try {
    // Create and store a global audio context
    if (!window.globalAudioContext) {
      window.globalAudioContext = new AudioContext();
    }
    
    const audioContext = window.globalAudioContext;
    
    // Resume the audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log("AudioContext resumed successfully");
      }).catch(err => {
        console.error("Failed to resume AudioContext:", err);
      });
    }
    
    // Create and play a silent audio buffer
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    // Create oscillator nodes (sometimes helps with unlocking)
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 1; // Very low frequency
    oscillator.connect(audioContext.destination);
    oscillator.start(0);
    oscillator.stop(audioContext.currentTime + 0.001);
    
    // Mark the document as user-interacted
    document.documentElement.setAttribute('data-user-interacted', 'true');
    document.documentElement.setAttribute('data-audio-unlocked', 'true');
    
    console.log("Audio context unlock attempts completed");
  } catch (err) {
    console.error("Error trying to unlock audio:", err);
  }
}

let audioInitializationStarted = false;

// Add user interaction tracking for audio playback
function addUserInteractionTracking() {
  const interactionEvents = ['click', 'touchstart', 'touchend', 'keydown', 'mousedown', 'mouseup', 'pointerdown'];
  
  function handleUserInteraction(e) {
    // Unlock audio on user interaction
    unlockAudioContext();
    
    // Remove event listeners once interaction is detected
    interactionEvents.forEach(event => {
      document.removeEventListener(event, handleUserInteraction);
    });
    
    console.log('User interaction detected, audio unlocked');
    
    // Set a global flag that can be checked elsewhere
    window.userInteracted = true;
    document.documentElement.setAttribute('data-user-interacted', 'true');
  }
  
  // Add event listeners for user interactions
  interactionEvents.forEach(event => {
    document.addEventListener(event, handleUserInteraction);
  });
  
  // Try to unlock audio immediately (works in some browsers)
  setTimeout(unlockAudioContext, 100);
  
  // Try again after a delay (sometimes helps in problematic browsers)
  setTimeout(unlockAudioContext, 1000);
  setTimeout(unlockAudioContext, 2000);
}

// Check if audio is already unlocked
function isAudioUnlocked() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return true; // If not supported, consider it "unlocked"
  
  if (window.globalAudioContext) {
    return window.globalAudioContext.state === 'running';
  }
  
  return false;
}

// Try to force user interaction simulation (helps on some browsers)
function simulateUserInteraction() {
  // Create and trigger events
  try {
    const clickEvent = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    });
    
    const touchEvent = new TouchEvent('touchend', {
      'view': window,
      'bubbles': true, 
      'cancelable': true
    });
    
    // Dispatch on document body
    document.body.dispatchEvent(clickEvent);
    document.body.dispatchEvent(touchEvent);
    
    console.log("Simulated user interaction");
  } catch (e) {
    console.log("Failed to simulate user interaction:", e);
  }
}

// Initialize everything
function initializeAudio() {
  if (audioInitializationStarted) {
    return;
  }

  audioInitializationStarted = true;

  // Initialize user interaction tracking
  addUserInteractionTracking();
  
  // Force unlock audio on page load
  unlockAudioContext();
  
  // Try simulation after a delay
  setTimeout(simulateUserInteraction, 500);
  
  // Check periodically if audio is unlocked
  const checkInterval = setInterval(() => {
    if (isAudioUnlocked()) {
      console.log("Audio successfully unlocked!");
      clearInterval(checkInterval);
    } else {
      console.log("Audio still locked, trying again...");
      unlockAudioContext();
    }
  }, 2000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAudio, { once: true });
} else {
  initializeAudio();
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);
