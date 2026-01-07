'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, Paperclip, Send, Upload } from 'lucide-react';
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
    const { toast } = useToast();

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
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Processing Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-16 left-0 right-0 flex items-center justify-center z-10"
                    >
                        <Card className="px-4 py-2 flex items-center gap-3 shadow-lg bg-background/80 backdrop-blur">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            <span className="text-sm font-medium">{processingMessage}</span>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Command Center Input */}
            <Card className="border-2 shadow-sm focus-within:shadow-md transition-shadow focus-within:border-primary/20">
                <CardContent className="p-2 flex items-end gap-2">
                    {/* Text Input */}
                    <div className="flex-1 min-w-0">
                        <Textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Dump knowledge here... (text, notes, information)"
                            className="min-h-[60px] max-h-32 resize-none border-0 shadow-none focus-visible:ring-0 p-3 text-base"
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
                    <div className="flex items-center gap-2 pb-1 pr-1">
                        {/* File Upload */}
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
                            title="Upload file"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Paperclip className="w-5 h-5" />
                        </Button>

                        {/* Voice Recording */}
                        <Button
                            variant={isRecording ? "destructive" : "ghost"}
                            size="icon"
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onMouseLeave={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                            disabled={isProcessing}
                            title="Hold to record"
                            className={cn(
                                "transition-all",
                                isRecording && "animate-pulse scale-110",
                                !isRecording && "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Mic className="w-5 h-5" />
                        </Button>

                        {/* Submit Text */}
                        <Button
                            size="icon"
                            onClick={handleTextSubmit}
                            disabled={!textInput.trim() || isProcessing}
                            className={cn(
                                "transition-all",
                                textInput.trim() ? "opacity-100" : "opacity-50"
                            )}
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Helper Text */}
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-100">
                        Enter
                    </kbd>
                    <span>to submit</span>
                </span>
                <span>•</span>
                <span>Hold mic to record</span>
                <span>•</span>
                <span>PDF, Audio, Docs supported</span>
            </div>
        </div>
    );
}
