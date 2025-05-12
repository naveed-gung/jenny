import { createContext, useContext, useEffect, useRef, useState } from "react";

// Determine API URL based on environment
// In production with single-service deployment, use relative paths
const apiBaseUrl = import.meta.env.PROD 
  ? ''  // Use relative URL in production when backend and frontend are served from same origin
  : (import.meta.env.VITE_API_URL || "http://localhost:3000");

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const greetingTriggered = useRef(false);
  const [error, setError] = useState(null);
  
  const chat = async (message, mode = "chat", voiceType = "default", voicePitch = 1.0, voiceSpeed = 1.0, voiceVolume = 100) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, mode, voiceType, voicePitch, voiceSpeed, voiceVolume }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.messages) {
        throw new Error("Invalid response format from API");
      }
      
      // Process messages to ensure valid animations
      const processedMessages = data.messages.map(msg => {
        // Fix animation names for compatibility with the loaded model
        if (msg.animation === "Wave") {
          // Replace with an animation that actually exists in animations.glb
          msg.animation = "Talking"; // or another animation that exists
        }
        return msg;
      });
      
      setMessages(prevMessages => [...prevMessages, ...processedMessages]);
    } catch (error) {
      console.error("Chat API error:", error);
      setError(error.message);
      // Add a fallback message when API fails
      setMessages(prevMessages => [...prevMessages, {
        text: "I'm sorry, I encountered a technical issue. Please try again.",
        facialExpression: "sad",
        animation: "Talking_0"
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  const onMessagePlayed = () => {
    setMessages(messages => messages.slice(1));
  };

  // Update current message when messages array changes
  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  // Trigger initial greeting only once
  useEffect(() => {
    // Only run if greeting hasn't been triggered yet
    if (!greetingTriggered.current) {
      greetingTriggered.current = true;
      
      // Delay to ensure everything is loaded
      const timer = setTimeout(() => {
        console.log("Triggering initial greeting");
        chat("", "chat", "default", 1.0, 1.0, 100);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        error,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
