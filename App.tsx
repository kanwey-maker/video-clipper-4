
import React, { useState, useCallback } from 'react';
import { AppState, Clip } from './types';
import { generateClipsFromTranscript } from './services/geminiService';
import Header from './components/Header';
import UrlInput from './components/UrlInput';
import ProcessingView from './components/ProcessingView';
import ClipResults from './components/ClipResults';

// A detailed, plausible-looking mock transcript for demonstration purposes.
const mockTranscript = `
Hello everyone, and welcome back to 'Cosmic Queries'! Today we're diving deep into one of the most fascinating objects in our universe: black holes. So, what exactly is a black hole? Well, imagine an object with such intense gravity that nothing, not even light, can escape its grasp. That's a black hole. They're formed when massive stars, much larger than our sun, collapse at the end of their lives. This collapse triggers a supernova, a huge explosion, and the core that's left behind becomes a singularity, the heart of the black hole. Now, the boundary around this singularity is called the event horizon. It's often called the 'point of no return.' Once you cross it, there's no coming back. It's a one-way trip. One of the biggest misconceptions is that black holes are like cosmic vacuum cleaners, sucking up everything in the universe. That's not quite true. You'd have to get very, very close to one to be pulled in. From a safe distance, a black hole's gravity is just like any other object of the same mass. If we replaced our sun with a black hole of the same mass, Earth would continue to orbit it just as it does now... although it would get very, very cold. Stephen Hawking made a groundbreaking discovery called Hawking radiation. He proposed that black holes aren't completely black! They slowly emit particles and radiation over incredibly long periods, which means they can eventually evaporate. For a solar-mass black hole, this would take longer than the current age of the universe. It’s a mind-boggling concept. So, are they dangerous? Only if you get too close. But they are also key to understanding the fabric of spacetime and the evolution of our universe. They are the ultimate cosmic mystery, and we are just beginning to scratch the surface of their secrets. Thanks for tuning in, and keep looking up!
`;

// A placeholder video for demonstration. Duration: 153 seconds.
const MOCK_PLAYABLE_VIDEO_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
const MOCK_VIDEO_DURATION = 153; // In seconds

const calculateTimestamps = (clip: Omit<Clip, 'startTime' | 'endTime'> | Clip, fullTranscript: string, totalDuration: number): Clip => {
  const transcriptLength = fullTranscript.length;
  
  let startIndex = fullTranscript.indexOf(clip.startPhrase);
  if (startIndex === -1) { 
      // If phrase not found, try a partial match or default to its previous start time if available
      const existingClip = clip as Clip;
      startIndex = existingClip.startTime ? (existingClip.startTime / totalDuration) * transcriptLength : 0;
  }

  let endIndex = fullTranscript.indexOf(clip.endPhrase);
  if (endIndex !== -1) {
    endIndex += clip.endPhrase.length;
  } else {
    // If phrase not found, try a partial match or default to its previous end time if available
    const existingClip = clip as Clip;
    endIndex = existingClip.endTime ? (existingClip.endTime / totalDuration) * transcriptLength : transcriptLength;
  }

  const startTime = (startIndex / transcriptLength) * totalDuration;
  const endTime = (endIndex / transcriptLength) * totalDuration;

  return {
    ...clip,
    startTime: Math.max(0, startTime),
    endTime: Math.min(totalDuration, endTime > startTime ? endTime : startTime + 5), // Ensure end is after start and lasts at least 5s
  };
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [volume, setVolume] = useState<number>(0.75); // Session-wide volume

  const handleReset = () => {
    setAppState(AppState.UPLOAD);
    setVideoUrl(null);
    setClips([]);
    setError(null);
    setLoadingMessage('');
  };

  const handleGenerateClips = useCallback(async (url: string) => {
    if (!url.trim()) {
      setError('Video URL cannot be empty.');
      return;
    }
    setError(null);
    setVideoUrl(url);
    setAppState(AppState.PROCESSING);
    
    try {
      setLoadingMessage('Fetching and transcribing video...');
      await new Promise(res => setTimeout(res, 3000)); 

      setLoadingMessage('Analyzing transcript for viral moments...');
      const generatedClips = await generateClipsFromTranscript(mockTranscript);
      
      setLoadingMessage('Crafting your short-form clips...');
      const clipsWithTimestamps = generatedClips.map(clip => 
        calculateTimestamps(clip, mockTranscript, MOCK_VIDEO_DURATION)
      );
      await new Promise(res => setTimeout(res, 1500));

      setClips(clipsWithTimestamps);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating clips. Please try again.');
      setAppState(AppState.UPLOAD);
    } finally {
        setLoadingMessage('');
    }
  }, []);

  const handleClipUpdate = useCallback((index: number, updatedPhrases: { startPhrase: string, endPhrase: string }) => {
    setClips(prevClips => {
        const newClips = [...prevClips];
        const clipToUpdate = { ...newClips[index], ...updatedPhrases };

        // Recalculate timestamps based on new phrases
        const updatedClipWithTimestamps = calculateTimestamps(
            clipToUpdate, 
            mockTranscript, 
            MOCK_VIDEO_DURATION
        );

        newClips[index] = updatedClipWithTimestamps;
        return newClips;
    });
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return <UrlInput onGenerate={handleGenerateClips} error={error} />;
      case AppState.PROCESSING:
        return <ProcessingView message={loadingMessage} />;
      case AppState.RESULTS:
        return <ClipResults 
                  clips={clips} 
                  videoUrl={videoUrl} 
                  playableVideoUrl={MOCK_PLAYABLE_VIDEO_URL}
                  onReset={handleReset}
                  volume={volume}
                  onVolumeChange={setVolume}
                  onClipUpdate={handleClipUpdate}
                />;
      default:
        return <UrlInput onGenerate={handleGenerateClips} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
