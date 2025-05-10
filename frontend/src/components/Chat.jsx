import { useState, useRef, useEffect } from "react";
import { FaGithub } from 'react-icons/fa';
import { useChat } from "../hooks/useChat";

export function Chat() {
  const [message, setMessage] = useState("");
  const [voiceType, setVoiceType] = useState("default");
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceVolume, setVoiceVolume] = useState(100);
  const messagesEndRef = useRef(null);
  const { messages, sendMessage, isLoading } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message, voiceType, voicePitch, voiceSpeed, voiceVolume);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-4">
            <div className="text-sm text-gray-500 mb-1">
              {msg.isUser ? "You" : "AI"}
            </div>
            <div className="bg-white rounded-lg p-3 shadow">
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Settings */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Voice Type</label>
            <select
              value={voiceType}
              onChange={(e) => setVoiceType(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="default">Default</option>
              <option value="male">Male</option>
              <option value="child">Child (Soon)</option>
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Language</label>
            <select
              value="en"
              disabled
              className="rounded-md border border-gray-300 px-3 py-2 bg-gray-100"
            >
              <option value="en">English (Soon)</option>
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Voice Pitch</label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={voicePitch}
              onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Voice Speed</label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>

      {/* GitHub Footer */}
      <div className="border-t border-gray-200 p-2 flex justify-center">
        <a
          href="https://github.com/naveed-gung/jenny"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaGithub size={24} />
        </a>
      </div>
    </div>
  );
} 