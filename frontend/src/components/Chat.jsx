import { FaGithub } from 'react-icons/fa';

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

  return (
    <div className="flex flex-col h-full">
      {/* Existing chat content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ... existing chat messages ... */}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        {/* ... existing input area ... */}
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