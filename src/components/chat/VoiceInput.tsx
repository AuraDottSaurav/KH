'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
    onTranscript: (transcript: string) => void;
    disabled?: boolean;
}

export default function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        if (disabled) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach((track) => track.stop());
                await processRecording(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const processRecording = async (audioBlob: Blob) => {
        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Transcription failed');

            const { text } = await response.json();
            if (text) {
                onTranscript(text);
            }
        } catch (error) {
            console.error('Error processing recording:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full">
            <Button
                variant={isRecording ? "destructive" : "secondary"}
                size="lg"
                className={cn(
                    "w-full transition-all duration-300 gap-2 font-medium",
                    isRecording && "animate-pulse"
                )}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={disabled || isProcessing}
                type="button"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Cloud Speech...
                    </>
                ) : isRecording ? (
                    <>
                        <Square className="w-5 h-5 fill-current" />
                        Release to Send Audio
                    </>
                ) : (
                    <>
                        <Mic className="w-5 h-5" />
                        Hold to Speak
                    </>
                )}
            </Button>
        </div>
    );
}
