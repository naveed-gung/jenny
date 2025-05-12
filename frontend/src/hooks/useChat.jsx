import { createContext, useContext, useEffect, useRef, useState } from "react";

// In production, use relative URL for API calls when deployed as a single service
const isProduction = import.meta.env.PROD;
const backendUrl = isProduction ? '' : (import.meta.env.VITE_API_URL || "http://localhost:3000");

// API endpoint paths - mounted at /api in production
const apiPath = isProduction ? '/api' : '';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const greetingTriggered = useRef(false);
  
  const chat = async (message, mode = "chat", voiceType = "default", voicePitch = 1.0, voiceSpeed = 1.0, voiceVolume = 100) => {
    setLoading(true);
    try {
      const data = await fetch(`${backendUrl}${apiPath}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, mode, voiceType, voicePitch, voiceSpeed, voiceVolume }),
      });
      
      const resp = (await data.json()).messages;
      
      // Process messages to ensure valid animations
      const processedMessages = resp.map(msg => {
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
