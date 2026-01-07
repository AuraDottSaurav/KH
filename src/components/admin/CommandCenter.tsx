'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandCenterProps {
    projectId: string;
    onKnowledgeAdded: () => void;
}

export default function CommandCenter({ projectId, onKnowledgeAdded }: CommandCenterProps) {
    const [textInput, setTextInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle text submission
    const handleTextSubmit = async () => {
        if (!textInput.trim() || isProcessing) return;

        setIsProcessing(true);
        setProcessingMessage('Indexing text...');

        try {
            const formData = new FormData();
            formData.append('projectId', projectId);
            formData.append('type', 'text');
            formData.append('content', textInput);

            const response = await fetch('/api/ingest', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to ingest text');

            setTextInput('');
            onKnowledgeAdded();
        } catch (error) {
            console.error('Error ingesting text:', error);
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
        }
    };

    // Handle voice recording
    const startRecording = async () => {
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
                await processAudioRecording(audioBlob);
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

    const processAudioRecording = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setProcessingMessage('Transcribing audio...');

        try {
            // First transcribe the audio
            const transcribeFormData = new FormData();
            transcribeFormData.append('audio', audioBlob, 'recording.webm');

            const transcribeResponse = await fetch('/api/transcribe', {
                method: 'POST',
                body: transcribeFormData,
            });

            if (!transcribeResponse.ok) throw new Error('Failed to transcribe audio');

            const { text } = await transcribeResponse.json();

            setProcessingMessage('Indexing transcription...');

            // Now ingest the transcribed text
            const ingestFormData = new FormData();
            ingestFormData.append('projectId', projectId);
            ingestFormData.append('type', 'audio');
            ingestFormData.append('content', text);

            const ingestResponse = await fetch('/api/ingest', {
                method: 'POST',
                body: ingestFormData,
            });

            if (!ingestResponse.ok) throw new Error('Failed to ingest transcription');

            onKnowledgeAdded();
        } catch (error) {
            console.error('Error processing audio:', error);
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
        }
    };

    // Handle file upload
    const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setProcessingMessage(`Processing ${file.name}...`);

        try {
            const formData = new FormData();
            formData.append('projectId', projectId);
            formData.append('file', file);

            // Determine type based on file extension
            const extension = file.name.split('.').pop()?.toLowerCase();
            let type = 'text';
            if (extension === 'pdf') type = 'pdf';
            else if (['mp3', 'wav', 'webm', 'm4a', 'ogg'].includes(extension || '')) type = 'audio';

            formData.append('type', type);

            const response = await fetch('/api/ingest', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to ingest file');

            onKnowledgeAdded();
        } catch (error) {
            console.error('Error processing file:', error);
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [projectId, onKnowledgeAdded]);

    return (
        <div className="relative">
            {/* Processing Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-16 left-0 right-0 flex items-center justify-center"
                    >
                        <div className="bg-slate-800 rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg">
                            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-slate-300">{processingMessage}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Command Center Input */}
            <div className="glass rounded-2xl p-2 flex items-end gap-2 shadow-glow">
                {/* Text Input */}
                <div className="flex-1 relative">
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Dump knowledge here... (text, notes, information)"
                        className="w-full resize-none bg-transparent px-4 py-3 outline-none text-white placeholder-slate-400 max-h-32 min-h-[48px]"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleTextSubmit();
                            }
                        }}
                        disabled={isProcessing}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pb-1">
                    {/* File Upload */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.webm,.m4a"
                        className="hidden"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all disabled:opacity-50"
                        title="Upload file (PDF, Audio, Document)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </motion.button>

                    {/* Voice Recording */}
                    <motion.button
                        whileHover={!isRecording ? { scale: 1.05 } : {}}
                        whileTap={!isRecording ? { scale: 0.95 } : {}}
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onMouseLeave={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        disabled={isProcessing}
                        className={`p-3 rounded-xl transition-all disabled:opacity-50 ${isRecording
                                ? 'bg-red-500 text-white recording-pulse'
                                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white'
                            }`}
                        title="Hold to record voice"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </motion.button>

                    {/* Submit Text */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTextSubmit}
                        disabled={!textInput.trim() || isProcessing}
                        className="p-3 rounded-xl gradient-primary text-white shadow-glow hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Submit text"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </motion.button>
                </div>
            </div>

            {/* Helper Text */}
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">Enter</kbd>
                    to submit text
                </span>
                <span>•</span>
                <span>Hold mic to record</span>
                <span>•</span>
                <span>PDF, Audio, Docs supported</span>
            </div>
        </div>
    );
}
