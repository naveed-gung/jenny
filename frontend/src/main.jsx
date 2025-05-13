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
    
    // Create a silent audio element as fallback
    const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
    
    // Try different methods to get audio to play
    const playPromise = silentAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log("Silent audio play rejected, will retry on user interaction:", err.message);
      });
    }
    
    // Create a video element as a last resort (useful in some browsers)
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('preload', 'auto');
    video.setAttribute('src', 'data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAAAAG1wNDJtcDQxaXNvbWF2YzEAAATKbW9vdgAAAGxtdmhkAAAAANLEP5XSxD+VAAB1MAAAdU4AAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAACFpb2RzAAAAABCAgIAQAE////9//w6AgIAEAAAAAQAABDV0cmFrAAAAXHRraGQAAAAH0sQ/ldLEP5UAAAABAAAAAAAAdU4AAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAADSxD+V0sQ/lQB1MAAAdU5VxAAAAAAANmhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABMLVNNQVNIIFZpZGVvIEhhbmRsZXIAAAABbG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAASwstW9vZgAAABx6aGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAATFNNQVNIIFZpZGVvIEhhbmRsZXIAAAACC21pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAACC3N0YmwAAACxc3RzZAAAAAAAAAABAAAAoWF2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAIAAIAEgAAABIAAAAAAAAAAEOSlZUTAEAAA7kFOUABRQjgUQABYUAVSXgo5+/vr7+//7+/v7+/v5QJP7/6+/+QNW4D9y+bkOyLab95dP5zu0cOgAJCgQRzARBEgAAAEowgHMA8JwAJzdAFiIAGBwHJA8YGyQAAg8jL4QOHP/7kmQmhAUtIUzwKKkqKmHo1gUVRUVBSeAomUgrAijYBRUlBwkdQ2y9m5dpIDhIMAGNADM2OjZKJkYeAABAYFAQDAgCBgCBAI/8BCMPEb2+H/TfSA4QCgwIAgYAgQCP/AQjDxG9vh/030gOEAYb2tfgB///6f//p/p2g1tBUayCKRRKKgF0REYkCgDGNAgDAwAg0GiIuYFAlalQBLtA0JgADQWIhL5fL5fUIRz+dL5/5Usjl8qL4hCjzPQJI88yiPPeZRX/pRHnmRBHnmRxHn/7+oj0PRz4BF0J/D//JoAbmI/o+eAaJTJEPXv9X/1bw+tLRLp/p9qWiHCx9Pf7f/u6/////7cqBCIGCCJEDhAEgzxY48QUUUCU7KFFFFJRvAUZE0skYUTSSSSSSSSSSQDEQHvkkkkCQzRTuSSRgJJgGCKdkkkgIYB6TQoGQZD5slMSSSQBAAAhBQMhQVBzE');
    video.load();
    video.muted = true;
    video.play().catch(e => console.log("Video play failed, but that's ok"));
    
    // Mark the document as user-interacted
    document.documentElement.setAttribute('data-user-interacted', 'true');
    document.documentElement.setAttribute('data-audio-unlocked', 'true');
    
    console.log("Audio context unlock attempts completed");
  } catch (err) {
    console.error("Error trying to unlock audio:", err);
  }
}

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

// Start everything
document.addEventListener('DOMContentLoaded', initializeAudio);

// Also try immediately
initializeAudio();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);
