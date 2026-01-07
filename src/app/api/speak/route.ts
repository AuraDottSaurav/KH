import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/speak - Text to Speech
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

        // Generate speech using OpenAI TTS
        const mp3 = await openaiClient.audio.speech.create({
            model: 'tts-1',
            voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
            input: truncatedText,
            response_format: 'mp3',
        });

        // Get the audio as a buffer
        const buffer = Buffer.from(await mp3.arrayBuffer());

        // Return audio as a response
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer.length.toString(),
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
