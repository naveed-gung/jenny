import { createContext, useContext, useEffect, useRef, useState } from "react";

// In production, use relative URL for API calls when deployed as a single service
const isProduction = import.meta.env.PROD;
const backendUrl = isProduction ? '/api' : (import.meta.env.VITE_API_URL || "http://localhost:3000");

const ChatContext = createContext();

const ANIMATION_ALIASES = {
  Wave: "Talking_1",
  Waving: "Talking_1",
  Hello: "Talking_1",
  Welcome: "Talking_1",
  Sad: "Crying",
  Cry: "Crying",
  Excited: "Talking_1",
  Thinking: "Talking_0",
  Surprised: "Talking_1",
};

const CHAT_REQUEST_TIMEOUT_MS = 45000;

const normalizeMessageAnimation = (message) => ({
  ...message,
  animation: ANIMATION_ALIASES[message.animation] || message.animation,
});

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const greetingTriggered = useRef(false);
  
  const chat = async (message, mode = "chat", voiceType = "default", voicePitch = 1.0, voiceSpeed = 1.0, voiceVolume = 100) => {
    setLoading(true);
    setIsSpeaking(false);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHAT_REQUEST_TIMEOUT_MS);

    try {
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({ message, mode, voiceType, voicePitch, voiceSpeed, voiceVolume }),
      });

      if (!data.ok) {
        throw new Error(`Chat request failed with status ${data.status}`);
      }
      
      const resp = (await data.json()).messages;
      
      // Process messages to ensure valid animations
      const processedMessages = resp.map(normalizeMessageAnimation);
      
      setMessages(prevMessages => [...prevMessages, ...processedMessages]);
    } catch (error) {
      console.error("Chat API error:", error);

      const fallbackText = error.name === "AbortError"
        ? "Jenny took too long to answer, so the request was cancelled. Try again in a moment."
        : "Jenny hit a runtime issue while processing that request. Check the backend logs and try again.";

      setMessages(prevMessages => [...prevMessages, normalizeMessageAnimation({
        text: fallbackText,
        facialExpression: "sad",
        animation: "Talking_2",
      })]);
    } finally {
      clearTimeout(timeout);
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
      setIsSpeaking(false);
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
        isSpeaking,
        setIsSpeaking,
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
