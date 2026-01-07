'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Paperclip, Send, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = useToast();

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [textInput]);

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
            toast({ title: "Success", description: "Text added to knowledge base" });
        } catch (error) {
            console.error('Error ingesting text:', error);
            toast({ title: "Error", description: "Failed to ingest text", variant: "destructive" });
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
            toast({ title: "Error", description: "Could not access microphone", variant: "destructive" });
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
            toast({ title: "Success", description: "Voice note processed and added" });
        } catch (error) {
            console.error('Error processing audio:', error);
            toast({ title: "Error", description: "Failed to process audio", variant: "destructive" });
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
            toast({ title: "Success", description: "File uploaded successfully" });
        } catch (error) {
            console.error('Error processing file:', error);
            toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [projectId, onKnowledgeAdded, toast]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Processing Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex justify-center mb-4"
                    >
                        <div className="px-4 py-2 flex items-center gap-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-xl">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                            <span className="text-xs font-medium tracking-wide max-w-[200px] truncate">{processingMessage}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Capsule */}
            <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl blur-xl group-hover:bg-indigo-500/10 transition-colors duration-500" />
                <div className="relative flex items-end gap-2 p-2 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl transition-all duration-300 focus-within:border-zinc-700/80 focus-within:bg-zinc-900/80">

                    {/* File Attachment */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.webm,.m4a"
                        className="hidden"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="h-10 w-10 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 shrink-0"
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>

                    {/* Text Area */}
                    <textarea
                        ref={textareaRef}
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Capture knowledge..."
                        className="flex-1 w-full bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 text-zinc-200 placeholder:text-zinc-600 text-sm leading-relaxed max-h-32 scrollbar-none"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleTextSubmit();
                            }
                        }}
                        disabled={isProcessing}
                    />

                    {/* Right Actions */}
                    <div className="flex items-center gap-1 shrink-0 pb-1">
                        {/* Voice Recording */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onMouseLeave={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                            disabled={isProcessing}
                            className={cn(
                                "h-9 w-9 rounded-full transition-all",
                                isRecording ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                            )}
                        >
                            <Mic className="w-4 h-4" />
                        </Button>

                        {/* Submit */}
                        {textInput.trim() && (
                            <Button
                                size="icon"
                                onClick={handleTextSubmit}
                                disabled={isProcessing}
                                className="h-9 w-9 rounded-full bg-white text-black hover:bg-zinc-200 transition-all animate-in zoom-in duration-200"
                            >
                                <ArrowUp className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Helper Hints */}
            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-medium text-zinc-600 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                    <span className="w-4 h-4 rounded border border-zinc-700 flex items-center justify-center bg-zinc-900">↵</span>
                    <span>Enter to submit</span>
                </span>
                <span className="flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                    <span className="px-1.5 h-4 rounded border border-zinc-700 flex items-center justify-center bg-zinc-900 min-w-[2rem]">Space</span>
                    <span>Hold space to record</span>
                </span>
            </div>
        </div>
    );
}
