// Vercel Edge Functions use the standard Web API Request and Response objects.
import { GoogleGenAI, Type } from "@google/genai";
import { Clip } from '../types';

export const config = {
  runtime: 'edge', // Use the Edge runtime for speed
};

// This is the main serverless function handler.
export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'API_KEY environment variable is not set on the server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
  }
  
  try {
    const { transcript } = await request.json();

    if (!transcript) {
        return new Response(JSON.stringify({ error: 'Transcript is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const clipSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A catchy, clickbait-style title (max 10 words)." },
            description: { type: Type.STRING, description: "A brief, compelling description of why this clip is engaging (1-2 sentences)." },
            viralityScore: { type: Type.INTEGER, description: "A 'virality score' from 70 to 100, where 100 is a guaranteed viral hit." },
            startPhrase: { type: Type.STRING, description: "The starting phrase from the transcript that marks the clip's beginning." },
            endPhrase: { type: Type.STRING, description: "The ending phrase from the transcript that marks the clip's end." },
        },
        required: ["title", "description", "viralityScore", "startPhrase", "endPhrase"],
    };

    const systemInstruction = `You are an expert viral video editor for platforms like TikTok, Reels, and YouTube Shorts. Your task is to analyze a video transcript and identify the 3 to 5 most engaging, shareable, and impactful segments. For each segment, create a catchy title, a compelling description, a virality score, and identify the start and end phrases. Focus on moments with strong emotional hooks, valuable insights, humor, or controversy.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Here is the transcript: ${transcript}`,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: clipSchema,
            },
        },
    });

    const jsonText = response.text.trim();
    // Vercel's edge runtime might have issues with direct type casting, so we ensure it's valid JSON
    const clips = JSON.parse(jsonText);

    return new Response(JSON.stringify(clips), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: "Failed to generate clips from transcript.", details: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}