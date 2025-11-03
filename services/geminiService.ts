import { Clip } from '../types';

export async function generateClipsFromTranscript(transcript: string): Promise<Clip[]> {
  try {
    const response = await fetch('/api/generate-clips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const clips = await response.json();
    return clips as Clip[];

  } catch (error) {
    console.error("Error calling backend API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate clips: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the server.");
  }
}
