
import React from 'react';
import { Clip } from '../types';
import ClipCard from './ClipCard';
import { RefreshIcon, LinkIcon } from './Icons';

interface ClipResultsProps {
  clips: Clip[];
  videoUrl: string | null;
  playableVideoUrl: string;
  onReset: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onClipUpdate: (index: number, updatedPhrases: { startPhrase: string, endPhrase: string }) => void;
}

const ClipResults: React.FC<ClipResultsProps> = ({ clips, videoUrl, playableVideoUrl, onReset, volume, onVolumeChange, onClipUpdate }) => {
  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0 max-w-full overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Your AI-Generated Clips</h2>
          {videoUrl && (
            <div className="flex items-center mt-2 text-gray-400">
                <LinkIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate">{videoUrl}</span>
            </div>
          )}
        </div>
        <button
          onClick={onReset}
          className="flex-shrink-0 flex items-center justify-center bg-gray-700 text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-600 transition-colors duration-300 mt-4 md:mt-0"
        >
          <RefreshIcon className="w-5 h-5 mr-2" />
          Analyze Another Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clips.map((clip, index) => (
          <ClipCard 
            key={index} 
            clip={clip} 
            index={index} 
            videoUrl={playableVideoUrl}
            volume={volume}
            onVolumeChange={onVolumeChange}
            onClipUpdate={onClipUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default ClipResults;
