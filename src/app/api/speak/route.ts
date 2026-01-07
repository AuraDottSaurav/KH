import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/speak - Text to Speech with streaming
export async function POST(request: NextRequest) {
    try {
        const { text, voice = 'alloy' } = await request.json();

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        // Limit text length to prevent API issues
        const truncatedText = text.slice(0, 4096);

        // Generate speech using OpenAI TTS with streaming
        // Using tts-1 (faster) instead of tts-1-hd (slower but higher quality)
        const mp3Response = await openaiClient.audio.speech.create({
            model: 'tts-1', // Fast model for lower latency
            voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
            input: truncatedText,
            response_format: 'mp3',
            speed: 1.0, // Normal speed for clarity
        });

        // Stream the response directly instead of buffering
        const audioStream = mp3Response.body;

        if (!audioStream) {
            throw new Error('No audio stream in response');
        }

        // Return streaming response for faster first byte
        return new NextResponse(audioStream as unknown as ReadableStream, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error('Error generating speech:', error);
        return NextResponse.json(
            { error: 'Failed to generate speech' },
            { status: 500 }
        );
    }
}
