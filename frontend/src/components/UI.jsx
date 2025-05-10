import { useRef, useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const fileInputRef = useRef();
  const textInputRef = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const [inputMode, setInputMode] = useState("chat"); // chat, text, file
  const [voiceType, setVoiceType] = useState("default");
  const [voicePitch, setVoicePitch] = useState(1.0); // Default pitch value
  const [voiceSpeed, setVoiceSpeed] = useState(1.0); // Default speed value
  const [voiceVolume, setVoiceVolume] = useState(100); // Default volume value
  const [isCapturing, setIsCapturing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [lipSyncDebug, setLipSyncDebug] = useState({ cue: null, time: 0 });
  
  // Check if screen size is mobile and update on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create a global hook for debugging
  useEffect(() => {
    window.updateLipSyncDebug = (cue, time) => {
      setLipSyncDebug({ cue, time });
    };
    return () => {
      delete window.updateLipSyncDebug;
    };
  }, []);

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message) {
      chat(text, "chat", voiceType, voicePitch, voiceSpeed, voiceVolume);
      input.current.value = "";
    }
  };

  const readText = () => {
    const text = textInputRef.current.value;
    if (!loading && !message && text.trim()) {
      chat(text, "read", voiceType, voicePitch, voiceSpeed, voiceVolume);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target.result;
        if (!loading && !message && text.trim()) {
          chat(text, "read", voiceType, voicePitch, voiceSpeed, voiceVolume);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const toggleScreenCapture = () => {
    // This is just a placeholder for screen capture functionality
    setIsCapturing(!isCapturing);
    alert("Screen capture " + (!isCapturing ? "started" : "stopped") + "!");
    // Here you would implement actual screen capture functionality
  };
  
  // Voice option component for mobile modal
  const VoiceOption = ({ label, value }) => (
    <div 
      className={`p-3 rounded-lg flex items-center justify-between cursor-pointer ${voiceType === value ? 'bg-pink-100 border border-pink-300' : 'bg-gray-50 hover:bg-gray-100'}`}
      onClick={() => setVoiceType(value)}
    >
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
        <span className="font-medium">{label}</span>
      </div>
      {voiceType === value && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );

  if (hidden) {
    return null;
  }

  // Calculate bottom padding to avoid overlap with mobile navbar
  const mobileBottomPadding = isMobile ? 'pb-32' : '';

  return (
    <>
      {/* Main Layout */}
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex pointer-events-none">
        {/* Sidebar for Desktop - hidden on mobile */}
        {!isMobile && (
          <div className="w-72 h-[calc(100%-2rem)] my-auto ml-2.5 mb-4 rounded-xl pointer-events-auto backdrop-blur-xl bg-white bg-opacity-50 shadow-lg flex flex-col border border-pink-100">
            <div className="p-4 flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-6 text-pink-600 text-center">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Jenny</span>
              </h2>
              
              {/* Mode Selection - Updated styling */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                <div className="bg-white bg-opacity-70 rounded-lg p-1.5">
                  <div className="grid grid-cols-3 gap-1">
                    <button 
                      onClick={() => setInputMode("chat")}
                      className={`p-2 rounded-lg transition-all ${inputMode === "chat" 
                        ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md" 
                        : "bg-white hover:bg-gray-100"}`}
                    >
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mb-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                        </svg>
                        <span className="text-xs font-medium">Chat</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setInputMode("text")}
                      className={`p-2 rounded-lg transition-all ${inputMode === "text" 
                        ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md" 
                        : "bg-white hover:bg-gray-100"}`}
                    >
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mb-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="text-xs font-medium">Text</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setInputMode("file")}
                      className={`p-2 rounded-lg transition-all ${inputMode === "file" 
                        ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md" 
                        : "bg-white hover:bg-gray-100"}`}
                    >
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mb-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="text-xs font-medium">File</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Voice Type Selection - Update with similar styling */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice Type</label>
                <div className="bg-white bg-opacity-70 rounded-lg p-2 space-y-2">
                  <label className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${voiceType === "default" ? "bg-pink-100 border border-pink-300 shadow-sm" : "hover:bg-gray-100"}`}>
                    <input 
                      type="radio" 
                      name="voiceType" 
                      value="default" 
                      checked={voiceType === "default"} 
                      onChange={() => setVoiceType("default")}
                      className="mr-2 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="font-medium">Default Voice</span>
                  </label>
                  <label className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${voiceType === "male" ? "bg-pink-100 border border-pink-300 shadow-sm" : "hover:bg-gray-100"}`}>
                    <input 
                      type="radio" 
                      name="voiceType" 
                      value="male" 
                      checked={voiceType === "male"} 
                      onChange={() => setVoiceType("male")}
                      className="mr-2 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="font-medium">Male Voice</span>
                  </label>
                  <label className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${voiceType === "child" ? "bg-pink-100 border border-pink-300 shadow-sm" : "hover:bg-gray-100"}`}>
                    <input 
                      type="radio" 
                      name="voiceType" 
                      value="child" 
                      checked={voiceType === "child"} 
                      onChange={() => setVoiceType("child")}
                      className="mr-2 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="font-medium">Child Voice</span>
                  </label>
                </div>
              </div>
              
              {/* Voice Settings Section - with matching style */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Settings
                </label>
                <div className="bg-white bg-opacity-70 rounded-lg p-2">
                  {/* Pitch Control */}
                  <div className="bg-white rounded-lg p-3 mb-2 border border-gray-100 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pitch: {voicePitch.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={voicePitch}
                      onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-700 mt-1">
                      <span>Low</span>
                      <span>Normal</span>
                      <span>High</span>
                    </div>
                  </div>
                  
                  {/* Rate Control - now functional */}
                  <div className="bg-white rounded-lg p-3 mb-2 border border-gray-100 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speed: {voiceSpeed.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-700 mt-1">
                      <span>Slow</span>
                      <span>Normal</span>
                      <span>Fast</span>
                    </div>
                  </div>
                  
                  {/* Volume Control - now functional */}
                  <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Volume: {voiceVolume}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={voiceVolume}
                      onChange={(e) => setVoiceVolume(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-700 mt-1">
                      <span>Quiet</span>
                      <span>Medium</span>
                      <span>Loud</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Camera Controls - with matching style */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Controls</label>
                <div className="bg-white bg-opacity-70 rounded-lg p-2">
                  <div className="flex space-x-2">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
                      className={`flex-1 p-2 rounded-lg flex items-center justify-center shadow-sm transition-all ${
                        cameraZoomed 
                          ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white" 
                          : "bg-white hover:bg-gray-100"
                      }`}
                      title={cameraZoomed ? "Zoom Out" : "Zoom In"}
          >
            {cameraZoomed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
              </svg>
            ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
              </svg>
            )}
          </button>
          <button
                      onClick={toggleScreenCapture}
                      className={`flex-1 p-2 rounded-lg flex items-center justify-center shadow-sm transition-all ${
                        isCapturing 
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white" 
                          : "bg-white hover:bg-gray-100"
                      }`}
                      title="Screen Capture"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                {loading && (
                  <div className="flex items-center justify-center space-x-2 text-pink-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Input area - positioned at 3/4 down the screen with reduced size */}
        <div 
          className={`fixed pointer-events-auto ${mobileBottomPadding}`}
          style={{
            bottom: isMobile ? 0 : "12%",
            left: isMobile ? 0 : (windowWidth < 1024 ? 0 : "18rem"), // Add margin for sidebar on desktop
            right: 0,
            zIndex: 20,
            height: 'auto',
            maxWidth: isMobile ? '100%' : 'calc(100% - 20rem)' // Account for sidebar width on desktop
          }}
        >
          <div className={`mx-auto p-4 ${isMobile ? "w-[90%]" : "w-[70%]"}`}>
            {/* Chat input */}
            {inputMode === "chat" && (
              <div className="relative backdrop-blur-md bg-white bg-opacity-60 rounded-xl shadow-lg overflow-hidden">
                <input
                  ref={input}
                  type="text"
                  placeholder="Type your message..."
                  className="w-full p-4 pr-20 bg-transparent placeholder-gray-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
                <div className="absolute right-2 top-2">
                  <button
                    className="p-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
                    onClick={sendMessage}
                    disabled={loading || message}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Text input */}
            {inputMode === "text" && (
              <div className="backdrop-blur-md bg-white bg-opacity-60 rounded-xl shadow-lg overflow-hidden">
                <textarea
                  ref={textInputRef}
                  placeholder="Enter text to be read..."
                  className="w-full p-4 h-32 bg-transparent placeholder-gray-500 focus:outline-none resize-none"
                ></textarea>
                <div className="p-2 flex justify-end border-t border-gray-200">
                  <button
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
                    onClick={readText}
                    disabled={loading || message}
                  >
                    Read Text
                  </button>
                </div>
              </div>
            )}

            {/* File upload */}
            {inputMode === "file" && (
              <div className="backdrop-blur-md bg-white bg-opacity-60 rounded-xl shadow-lg">
                <div className="p-6 flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-gray-600 mb-4">Upload a text file to be read</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md,.doc,.docx" />
                  <button
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
                    onClick={triggerFileUpload}
                    disabled={loading || message}
                  >
                    Choose File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile view - Burger menu for sidebar and bottom navbar */}
      {isMobile && (
        <>
          {/* Burger Menu Button */}
          <button
            onClick={() => setShowVoiceModal(true)}
            className="fixed top-4 left-4 z-30 p-2 bg-white bg-opacity-50 backdrop-blur-md rounded-lg shadow-md pointer-events-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          
          {/* Sidebar Modal */}
          {showVoiceModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-auto">
              <div className="fixed inset-y-0 left-0 w-72 bg-white overflow-y-auto rounded-r-2xl animate-slide-in">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-pink-600">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Jenny</span>
                    </h2>
                    <button onClick={() => setShowVoiceModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Mode Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                    <div className="bg-white bg-opacity-80 rounded-lg p-1.5">
                      <div className="grid grid-cols-3 gap-1">
                        <button 
                          onClick={() => {
                            setInputMode("chat");
                            setShowVoiceModal(false);
                          }}
                          className={`p-2 rounded-lg transition-all ${inputMode === "chat" 
                            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md" 
                            : "bg-white hover:bg-gray-100"}`}
                        >
                          <div className="flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mb-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                            <span className="text-xs font-medium">Chat</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => {
                            setInputMode("text");
                            setShowVoiceModal(false);
                          }}
                          className={`p-2 rounded-lg transition-all ${inputMode === "text" 
                            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md" 
                            : "bg-white hover:bg-gray-100"}`}
                        >
                          <div className="flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mb-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <span className="text-xs font-medium">Text</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => {
                            setInputMode("file");
                            setShowVoiceModal(false);
                          }}
                          className={`p-2 rounded-lg transition-all ${inputMode === "file" 
                            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md" 
                            : "bg-white hover:bg-gray-100"}`}
                        >
                          <div className="flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mb-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <span className="text-xs font-medium">File</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Voice Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Voice Type</label>
                    <div className="bg-white bg-opacity-70 rounded-lg p-2 space-y-2">
                      <label className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${voiceType === "default" ? "bg-pink-100 border border-pink-300 shadow-sm" : "hover:bg-gray-100"}`}>
                        <input 
                          type="radio" 
                          name="voiceType" 
                          value="default" 
                          checked={voiceType === "default"} 
                          onChange={() => setVoiceType("default")}
                          className="mr-2 text-pink-500 focus:ring-pink-500"
                        />
                        <span className="font-medium">Default Voice</span>
                      </label>
                      <label className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${voiceType === "male" ? "bg-pink-100 border border-pink-300 shadow-sm" : "hover:bg-gray-100"}`}>
                        <input 
                          type="radio" 
                          name="voiceType" 
                          value="male" 
                          checked={voiceType === "male"} 
                          onChange={() => setVoiceType("male")}
                          className="mr-2 text-pink-500 focus:ring-pink-500"
                        />
                        <span className="font-medium">Male Voice</span>
                      </label>
                      <label className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${voiceType === "child" ? "bg-pink-100 border border-pink-300 shadow-sm" : "hover:bg-gray-100"}`}>
                        <input 
                          type="radio" 
                          name="voiceType" 
                          value="child" 
                          checked={voiceType === "child"} 
                          onChange={() => setVoiceType("child")}
                          className="mr-2 text-pink-500 focus:ring-pink-500"
                        />
                        <span className="font-medium">Child Voice</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Voice Settings */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Voice Settings</label>
                    <div className="bg-white bg-opacity-70 rounded-lg p-2">
                      {/* Pitch Control */}
                      <div className="bg-white rounded-lg p-3 mb-2 border border-gray-100 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pitch: {voicePitch.toFixed(1)}</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={voicePitch}
                          onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-700 mt-1">
                          <span>Low</span>
                          <span>Normal</span>
                          <span>High</span>
                        </div>
                      </div>
                      
                      {/* Rate Control - now functional */}
                      <div className="bg-white rounded-lg p-3 mb-2 border border-gray-100 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Speed: {voiceSpeed.toFixed(1)}</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={voiceSpeed}
                          onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-700 mt-1">
                          <span>Slow</span>
                          <span>Normal</span>
                          <span>Fast</span>
                        </div>
                      </div>
                      
                      {/* Volume Control - now functional */}
                      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Volume: {voiceVolume}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={voiceVolume}
                          onChange={(e) => setVoiceVolume(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-700 mt-1">
                          <span>Quiet</span>
                          <span>Medium</span>
                          <span>Loud</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Controls</label>
                    <div className="bg-white bg-opacity-70 rounded-lg p-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setCameraZoomed(!cameraZoomed);
                            setShowVoiceModal(false);
                          }}
                          className={`flex-1 p-2 rounded-lg flex items-center justify-center shadow-sm transition-all ${
                            cameraZoomed 
                              ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white" 
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            toggleScreenCapture();
                            setShowVoiceModal(false);
                          }}
                          className={`flex-1 p-2 rounded-lg flex items-center justify-center shadow-sm transition-all ${
                            isCapturing 
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white" 
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
        </div>
      </div>
          )}
        </>
      )}
    </>
  );
};
