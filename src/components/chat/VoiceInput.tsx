'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

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
        <div className="flex items-center gap-4">
            {/* Recording Button */}
            <motion.button
                whileHover={!isRecording ? { scale: 1.02 } : {}}
                whileTap={!isRecording ? { scale: 0.98 } : {}}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={disabled || isProcessing}
                className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${isRecording
                        ? 'bg-red-500 text-white recording-pulse'
                        : isProcessing
                            ? 'bg-slate-700 text-slate-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                    </>
                ) : isRecording ? (
                    <>
                        <div className="flex items-center gap-1 h-5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-white waveform-bar"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                />
                            ))}
                        </div>
                        <span>Recording... Release to send</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span>Hold to speak</span>
                    </>
                )}
            </motion.button>
        </div>
    );
}
