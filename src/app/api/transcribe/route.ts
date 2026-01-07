import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/transcribe - Speech to Text using Whisper
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File | null;
        const file = formData.get('file') as File | null;

        const audio = audioFile || file;

        if (!audio) {
            return NextResponse.json(
                { error: 'Audio file is required' },
                { status: 400 }
            );
        }

        // Convert File to proper format for OpenAI
        const transcription = await openaiClient.audio.transcriptions.create({
            file: audio,
            model: 'whisper-1',
            language: 'en',
        });

        return NextResponse.json({
            text: transcription.text,
            success: true,
        });
    } catch (error) {
        console.error('Error transcribing audio:', error);
        return NextResponse.json(
            { error: 'Failed to transcribe audio' },
            { status: 500 }
        );
    }
}
