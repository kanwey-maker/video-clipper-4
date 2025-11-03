import React, { useState } from 'react';
import { LinkIcon, SparklesIcon } from './Icons';

interface UrlInputProps {
  onGenerate: (url: string) => void;
  error: string | null;
}

const UrlInput: React.FC<UrlInputProps> = ({ onGenerate, error }) => {
  const [url, setUrl] = useState<string>('');

  const handleSubmit = () => {
    if (url) {
      onGenerate(url);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700/50 p-6 md:p-8 space-y-6 animate-fade-in">
      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">{error}</div>}
      
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Start with a Video Link</h2>
        <p className="text-gray-400 mt-2">Paste a link to your long-form video to get started.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow w-full">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full bg-gray-900/70 border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow placeholder-gray-500"
              placeholder="e.g., https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
            />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!url.trim()}
          className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg shadow-purple-900/30"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          Generate Clips
        </button>
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>Supports platforms like YouTube, Vimeo, etc. (Transcription is simulated)</p>
      </div>
    </div>
  );
};

export default UrlInput;
