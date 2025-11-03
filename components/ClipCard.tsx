
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Clip } from '../types';
import { DownloadIcon, PlayIcon, PauseIcon, QuoteIcon, StarIcon, VolumeHighIcon, VolumeLowIcon, VolumeMuteIcon, CheckIcon, FileVideoIcon, GifIcon, XIcon, ScissorsIcon, EditIcon } from './Icons';

interface ClipCardProps {
  clip: Clip;
  index: number;
  videoUrl: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onClipUpdate: (index: number, updatedPhrases: { startPhrase: string, endPhrase: string }) => void;
}

const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
  const roundedTime = Math.floor(timeInSeconds);
  const minutes = Math.floor(roundedTime / 60);
  const seconds = roundedTime % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const ClipCard: React.FC<ClipCardProps> = ({ clip, index, videoUrl, volume, onVolumeChange, onClipUpdate }) => {
  const scoreColor = clip.viralityScore >= 90 ? 'text-green-400' : clip.viralityScore >= 80 ? 'text-yellow-400' : 'text-orange-400';
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clipTime, setClipTime] = useState(0);
  const [lastVolume, setLastVolume] = useState(volume);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'finished'>('idle');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  
  const [trimmedStart, setTrimmedStart] = useState(clip.startTime);
  const [trimmedEnd, setTrimmedEnd] = useState(clip.endTime);
  const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | null>(null);

  const [editedStartPhrase, setEditedStartPhrase] = useState(clip.startPhrase);
  const [editedEndPhrase, setEditedEndPhrase] = useState(clip.endPhrase);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const clipDuration = trimmedEnd - trimmedStart;
  const shouldShowControls = isPlaying || isHovered || draggingHandle;
  
  // When props change from parent, update internal state
  useEffect(() => {
    setTrimmedStart(clip.startTime);
    setTrimmedEnd(clip.endTime);
  }, [clip.startTime, clip.endTime]);

  useEffect(() => {
    setEditedStartPhrase(clip.startPhrase);
    setEditedEndPhrase(clip.endPhrase);
  }, [clip.startPhrase, clip.endPhrase]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (video.currentTime < trimmedStart || video.currentTime >= trimmedEnd) {
        video.currentTime = trimmedStart;
      }
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  };
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
  }, [volume]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || draggingHandle) return;

    const currentTime = video.currentTime;

    // Pause the video if it's playing and goes past the trimmed end time.
    if (!video.paused && currentTime >= trimmedEnd) {
      video.pause();
      video.currentTime = trimmedEnd; // Clamp to the end.
    }

    // Update progress and time display based on current time.
    const duration = trimmedEnd - trimmedStart;
    const elapsed = currentTime - trimmedStart;

    if (currentTime < trimmedStart) {
      setProgress(0);
      setClipTime(0);
    } else if (currentTime > trimmedEnd) {
      setProgress(100);
      setClipTime(duration > 0 ? duration : 0);
    } else {
      setProgress(duration > 0 ? (elapsed / duration) * 100 : 0);
      setClipTime(elapsed);
    }
  }, [trimmedStart, trimmedEnd, draggingHandle]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlayState = () => setIsPlaying(true);
    const handlePauseState = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlayState);
    video.addEventListener('pause', handlePauseState);
    video.addEventListener('ended', handlePauseState);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlayState);
      video.removeEventListener('pause', handlePauseState);
      video.removeEventListener('ended', handlePauseState);
    };
  }, [handleTimeUpdate]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressContainer = progressRef.current;
    if (!video || !progressContainer || draggingHandle) return;

    const rect = progressContainer.getBoundingClientRect();
    const seekPosition = (e.clientX - rect.left) / rect.width;
    const seekTime = trimmedStart + seekPosition * clipDuration;
    
    video.currentTime = Math.max(trimmedStart, Math.min(seekTime, trimmedEnd));
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };
  
  const toggleMute = () => {
    if (volume > 0) {
      setLastVolume(volume);
      onVolumeChange(0);
    } else {
      onVolumeChange(lastVolume > 0 ? lastVolume : 0.75);
    }
  };

  const handleInitiateDownload = () => {
    setIsDownloadModalOpen(false);
    if (downloadStatus !== 'idle') return;

    setDownloadStatus('downloading');
    setTimeout(() => {
      setDownloadStatus('finished');
      setTimeout(() => {
        setDownloadStatus('idle');
      }, 2500);
    }, 1500);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, handle: 'start' | 'end') => {
    e.stopPropagation();
    setDraggingHandle(handle);
  };

  useEffect(() => {
    const video = videoRef.current;
    const progressContainer = progressRef.current;
    if (!draggingHandle || !progressContainer || !video) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = progressContainer.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      const totalDuration = clip.endTime - clip.startTime;
      const newTime = clip.startTime + position * totalDuration;

      if (draggingHandle === 'start') {
        const newStartTime = Math.max(clip.startTime, Math.min(newTime, trimmedEnd - 0.5));
        setTrimmedStart(newStartTime);
        video.currentTime = newStartTime;
      } else {
        const newEndTime = Math.min(clip.endTime, Math.max(newTime, trimmedStart + 0.5));
        setTrimmedEnd(newEndTime);
        video.currentTime = newEndTime;
      }
      // Manually call time update to refresh UI while dragging
      handleTimeUpdate();
    };
    
    const handleMouseUp = () => {
      setDraggingHandle(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingHandle, clip.startTime, clip.endTime, trimmedStart, trimmedEnd, handleTimeUpdate]);

  const handlePhraseUpdate = () => {
    if (editedStartPhrase !== clip.startPhrase || editedEndPhrase !== clip.endPhrase) {
      onClipUpdate(index, { startPhrase: editedStartPhrase, endPhrase: editedEndPhrase });
    }
  };

  const VolumeIcon = volume === 0 ? VolumeMuteIcon : volume < 0.5 ? VolumeLowIcon : VolumeHighIcon;
  const fullDuration = clip.endTime - clip.startTime;
  const startPercent = fullDuration > 0 ? ((trimmedStart - clip.startTime) / fullDuration) * 100 : 0;
  const endPercent = fullDuration > 0 ? ((trimmedEnd - clip.startTime) / fullDuration) * 100 : 0;
  
  return (
    <>
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700/50 flex flex-col transition-transform duration-300 hover:transform hover:-translate-y-1 hover:shadow-purple-900/20">
        <div 
          className="aspect-[9/16] bg-gray-900 relative flex items-center justify-center overflow-hidden group/video"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            playsInline
            loop={false}
            preload="auto"
            onClick={handlePlayPause}
          />

          {!isPlaying && !draggingHandle && (
              <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover/video:opacity-100 opacity-100 md:opacity-0 pointer-events-none flex items-center justify-center">
                  <button onClick={handlePlayPause} className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 pointer-events-auto">
                      <PlayIcon className="w-10 h-10 text-white" />
                  </button>
              </div>
          )}
          
          <div className="absolute top-3 right-3 flex items-center bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm pointer-events-none">
            <StarIcon className={`w-4 h-4 mr-1.5 ${scoreColor}`} />
            <span className={scoreColor}>{clip.viralityScore}</span>
            <span className="text-gray-400 ml-1">/ 100</span>
          </div>
          
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-6 transition-opacity duration-300 ${shouldShowControls ? 'opacity-100' : 'opacity-0'}`}>
            <div 
                ref={progressRef}
                onClick={handleSeek}
                className="w-full h-2 bg-white/20 cursor-pointer rounded-full group/progress mb-2 relative flex items-center"
              >
              <div className="absolute h-full top-0 bg-purple-800/50 rounded-full" style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }} />
              <div className="absolute h-full top-0 bg-purple-500 rounded-full" style={{ left: `${startPercent}%`, width: `${((progress / 100) * (endPercent - startPercent))}%` }} />
              
              <div 
                onMouseDown={(e) => handleMouseDown(e, 'start')}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full cursor-ew-resize z-10 shadow-md"
                style={{ left: `${startPercent}%` }}
              />
              <div 
                onMouseDown={(e) => handleMouseDown(e, 'end')}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full cursor-ew-resize z-10 shadow-md"
                style={{ left: `${endPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <button onClick={handlePlayPause} className="text-white p-1">
                    {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                  </button>
                  <div className="flex items-center group/volume">
                      <button onClick={toggleMute} className="text-white p-1">
                          <VolumeIcon className="w-6 h-6" />
                      </button>
                      <div className="w-0 group-hover/volume:w-20 transition-all duration-300 overflow-hidden">
                          <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                          />
                      </div>
                  </div>
              </div>
              <span className="text-white text-xs font-mono">
                {formatTime(clipTime)} / {formatTime(clipDuration)}
              </span>
            </div>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-lg text-white mb-2 leading-tight">{clip.title}</h3>
          <p className="text-gray-400 text-sm mb-4 flex-grow">{clip.description}</p>
          
          <div className="text-xs text-gray-500 space-y-2 mb-4">
              <div className="flex items-center">
                  <ScissorsIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                  <p>Trim clip using handles on the seek bar</p>
              </div>
              <div className="relative group">
                  <span className="font-semibold text-gray-400">Starts:</span>
                  <input 
                    type="text"
                    value={editedStartPhrase}
                    onChange={(e) => setEditedStartPhrase(e.target.value)}
                    onBlur={handlePhraseUpdate}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    className="w-full bg-transparent text-gray-500 pl-1 -ml-1 rounded-md transition-colors focus:bg-gray-700/50 focus:text-gray-300 focus:ring-1 focus:ring-purple-500"
                  />
                  <EditIcon className="w-3 h-3 absolute top-0.5 right-0 text-gray-600 group-focus-within:hidden" />
              </div>
              <div className="relative group">
                  <span className="font-semibold text-gray-400">Ends:</span>
                  <input
                    type="text"
                    value={editedEndPhrase}
                    onChange={(e) => setEditedEndPhrase(e.target.value)}
                    onBlur={handlePhraseUpdate}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    className="w-full bg-transparent text-gray-500 pl-1 -ml-1 rounded-md transition-colors focus:bg-gray-700/50 focus:text-gray-300 focus:ring-1 focus:ring-purple-500"
                  />
                  <EditIcon className="w-3 h-3 absolute top-0.5 right-0 text-gray-600 group-focus-within:hidden" />
              </div>
          </div>

          <button 
              onClick={() => setIsDownloadModalOpen(true)}
              disabled={downloadStatus !== 'idle'}
              className={`w-full mt-auto flex items-center justify-center font-bold py-2.5 px-4 rounded-lg transition-all duration-300 ${
                  downloadStatus === 'idle' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : downloadStatus === 'downloading'
                  ? 'bg-gray-700 text-gray-400 cursor-wait'
                  : 'bg-green-600 text-white'
              }`}
          >
              {downloadStatus === 'idle' && (
                  <>
                      <DownloadIcon className="w-5 h-5 mr-2" />
                      Download Clip
                  </>
              )}
              {downloadStatus === 'downloading' && (
                  <span className="animate-pulse">Downloading...</span>
              )}
              {downloadStatus === 'finished' && (
                  <>
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Downloaded!
                  </>
              )}
          </button>
        </div>
      </div>

      {isDownloadModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsDownloadModalOpen(false)}
        >
          <div 
            className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Download Options</h3>
              <button 
                onClick={() => setIsDownloadModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><FileVideoIcon className="w-5 h-5 mr-2 text-purple-400" /> MP4 Video</h4>
                <div className="space-y-2">
                    <button onClick={handleInitiateDownload} className="w-full text-left bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                        Full Resolution (1080p)
                    </button>
                    <button onClick={handleInitiateDownload} className="w-full text-left bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                        HD (720p)
                    </button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><GifIcon className="w-5 h-5 mr-2 text-purple-400" /> Animated Image</h4>
                <div className="space-y-2">
                    <button onClick={handleInitiateDownload} className="w-full text-left bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                        Animated GIF
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClipCard;
