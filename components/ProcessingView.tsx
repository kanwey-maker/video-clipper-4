
import React from 'react';
import { SparklesIcon } from './Icons';

interface ProcessingViewProps {
  message: string;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700/50">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <SparklesIcon className="w-12 h-12 text-purple-400 animate-pulse" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-gray-200">AI is Working its Magic...</h2>
      <p className="text-gray-400 max-w-sm">{message || 'Please wait a moment.'}</p>
    </div>
  );
};

export default ProcessingView;
