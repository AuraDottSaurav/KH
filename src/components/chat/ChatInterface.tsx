'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Paperclip, Send, ArrowUp, Sparkles, Bot, Copy, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
    projectId: string;
    projectName: string;
}

export default function ChatInterface({ projectId, projectName }: ChatInterfaceProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Voice/File state (mimicking CommandCenter)
    const [isRecording, setIsRecording] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isInternalProcessing, setIsInternalProcessing] = useState(false); // For file uploads/transcription
    const [processingMessage, setProcessingMessage] = useState('');
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null); // Track TTS playback state
    const { toast } = useToast();

    // Vercel AI SDK
    const { messages, input, setInput, handleSubmit, isLoading, append } = useChat({
        api: '/api/chat',
        body: { projectId },
    });

    // Effective loading state (AI thinking OR internal file processing)
    const isBusy = isLoading || isInternalProcessing;

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    // Simple file select (just UI state for now, as useChat might not handle files directly yet without config)
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        // In a real app, you'd upload this to RAG or attach to message
        // For now, we'll just clear it after "sending" or show a toast that it's attached
    }, []);

    // Custom submit handler to combine file/voice logic with useChat
    const handleCustomSubmit = async () => {
        if (isBusy) return;

        if (selectedFile) {
            // Handle file upload logic here if needed, or just pretend for UI
            setIsInternalProcessing(true);
            setProcessingMessage(`Processing ${selectedFile.name}...`);

            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            setIsInternalProcessing(false);
            setProcessingMessage('');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            toast({ title: "File processed", description: "Added to context (simulated)." });

            // If there's text, send it too
            if (input.trim()) {
                const formEvent = new Event('submit', { cancelable: true, bubbles: true });
                // This is a bit hacky, cleaner is to manually call append if handleSubmit is tricky
                // But handleSubmit expects a form event usually.
                // We will manually append for now to be safe if no form event is easy
                append({ role: 'user', content: input });
                setInput('');
            }
            return;
        }

        if (!input.trim()) return;

        // Trigger Vercel AI SDK submit
        // We can create a synthetic form event, or just rely on the form's onSubmit
        // But since we are calling this from a button that might be outside a form or customized...
        // Actually, wrapping everything in a form and using proper type='submit' is best.
        // But the button text 'onKeyDown' logic also needs to trigger this.
        // Let's us the form ref approach or just button type='submit' inside the form.
    };

    // Play audio using OpenAI TTS
    const handlePlayAudio = async (text: string, messageId: string) => {
        if (playingMessageId) return; // Prevent multiple streams for now
        try {
            setPlayingMessageId(messageId);
            const res = await fetch('/api/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) throw new Error('Failed to generate speech');

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            audio.onended = () => {
                setPlayingMessageId(null);
                URL.revokeObjectURL(url);
            };

            await audio.play();
        } catch (error) {
            console.error('TTS Error:', error);
            setPlayingMessageId(null);
            toast({ title: "Error", description: "Failed to play audio.", variant: "destructive" });
        }
    };

    // Suggestions state
    const [suggestions, setSuggestions] = useState([
        { title: 'SUMMARIZE KNOWLEDGE', desc: 'Brief breakdown of the latest repository updates.', prompt: 'Summarize the key knowledge in this repository.' },
        { title: 'EXPLAIN PROTOCOL LOGIC', desc: 'How the current system handles node sync.', prompt: 'Explain the protocol logic and node sync.' },
        { title: 'COMPARE DATA MODELS', desc: 'Differences between Alpha and Genesis nodes.', prompt: 'Compare the data models.' }
    ]);
    const [placeholder, setPlaceholder] = useState('Type, record, or attach to add knowledge...');

    // Fetch dynamic suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await fetch(`/api/suggestions?projectId=${projectId}`);
                const data = await res.json();
                if (data.suggestions && data.suggestions.length > 0) {
                    setSuggestions(data.suggestions);
                    // Cycle placeholder or set based on first item
                    const placeholders = data.suggestions.map((s: any) => s.placeholder);
                    setPlaceholder(placeholders[0]);
                }
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            }
        };
        fetchSuggestions();
    }, [projectId]);

    // Placeholder animation
    useEffect(() => {
        if (!suggestions.length) return;

        let currentIndex = 0;
        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % suggestions.length;
            // Use the placeholder field from the API response
            const nextPlaceholder = (suggestions[currentIndex] as any).placeholder;
            setPlaceholder(nextPlaceholder || "Type to ask...");
        }, 2500);

        return () => clearInterval(interval);
    }, [suggestions]);

    const handlePromptClick = (prompt: string) => {
        setInput(prompt);
        // Optional: auto-submit by calling generic submit if needed, or let user press enter
    };

    return (
        <div className="flex flex-col h-full w-full relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full w-full">
                    <div className="max-w-4xl mx-auto px-6 py-8 pb-32">
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center text-center mt-24"
                            >
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 shadow-2xl shadow-indigo-500/10">
                                    <Sparkles className="w-8 h-8 text-indigo-500" />
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                                    Knowledge Retrieval
                                </h1>
                                <p className="text-zinc-500 mb-8 text-sm font-medium tracking-wide">
                                    Ask anything about the indexed knowledge base of {projectName}.
                                </p>

                                {/* Helping Cards */}
                                <div className="flex flex-wrap justify-center gap-4 w-full max-w-5xl">
                                    {suggestions.map((card, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePromptClick(card.prompt)}
                                            className="group text-left p-6 rounded-2xl bg-zinc-900/20 border border-zinc-800/40 hover:bg-zinc-900/40 hover:border-zinc-700/60 transition-all duration-300 w-full md:w-[calc(33.33%-1rem)] min-w-[280px]"
                                        >
                                            <h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-3 group-hover:text-indigo-400 transition-colors truncate">
                                                {card.title}
                                            </h3>
                                            <p className="text-xs text-zinc-500 leading-relaxed italic group-hover:text-zinc-400/90 w-full line-clamp-3">
                                                {card.desc}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-8">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex gap-4 w-full max-w-3xl mx-auto group",
                                            message.role === 'user' ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {/* Avatar for Assistant */}
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                                                <Bot className="w-5 h-5 text-indigo-400" />
                                            </div>
                                        )}

                                        <div className={cn(
                                            "relative max-w-[85%] flex flex-col",
                                            message.role === 'user' ? "items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm",
                                                message.role === 'user'
                                                    ? "bg-zinc-800 text-zinc-100"
                                                    : "text-zinc-300 px-0 py-0"
                                            )}>
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code: ({ className, children }) => {
                                                            const isInline = !className;
                                                            return isInline ? (
                                                                <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-xs font-mono border border-zinc-800 text-indigo-300">
                                                                    {children}
                                                                </code>
                                                            ) : (
                                                                <code className="block bg-zinc-950 p-4 rounded-xl my-4 overflow-x-auto text-xs font-mono border border-zinc-900 text-zinc-300">
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                                                        ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
                                                        li: ({ children }) => <li className="pl-1">{children}</li>,
                                                        strong: ({ children }) => <span className="font-bold text-zinc-100">{children}</span>,
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>

                                            {/* Message Actions */}
                                            <div className={cn(
                                                "flex items-center gap-1 mt-1 px-2 transition-opacity duration-200",
                                                message.role === 'user' ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                                            )}>
                                                {message.role === 'assistant' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
                                                            onClick={() => handlePlayAudio(message.content, message.id)}
                                                            disabled={playingMessageId !== null}
                                                        >
                                                            {playingMessageId === message.id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                                            ) : (
                                                                <Volume2 className="w-3.5 h-3.5" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(message.content);
                                                                toast({ description: "Copied to clipboard" });
                                                            }}
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </>
                                                )}
                                                {message.role === 'user' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(message.content);
                                                            toast({ description: "Copied to clipboard" });
                                                        }}
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isBusy && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-4 w-full max-w-3xl mx-auto"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                                            <Bot className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div className="flex items-center gap-3 mt-2.5">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-indigo-500/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-1.5 h-1.5 bg-indigo-500/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1.5 h-1.5 bg-indigo-500/60 rounded-full animate-bounce" />
                                            </div>
                                            <span className="text-xs font-medium text-indigo-400/80 animate-pulse">Searching Knowledge Base...</span>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area (CommandCenter Copy) */}
            <div className="absolute bottom-12 left-0 right-0 px-8 z-20">
                <div className="w-full max-w-2xl mx-auto">
                    {/* Processing Overlay */}
                    <AnimatePresence>
                        {isInternalProcessing && (
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
                    <form
                        onSubmit={(e) => {
                            if (selectedFile) {
                                e.preventDefault();
                                handleCustomSubmit();
                            } else {
                                handleSubmit(e);
                            }
                        }}
                        className="relative group w-full"
                    >
                        <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl blur-xl group-hover:bg-indigo-500/10 transition-colors duration-500 pointer-events-none" />
                        <div className="relative flex items-end gap-2 p-2 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl transition-all duration-300 focus-within:border-zinc-700/80 focus-within:bg-zinc-900/80">

                            {/* Text Area */}
                            <div className="flex-1 min-w-0 flex items-center pl-2">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none py-2.5 px-0 text-zinc-200 placeholder:text-zinc-500 text-sm leading-5 max-h-32 scrollbar-none"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            // Trigger form submit for useChat
                                            e.currentTarget.form?.requestSubmit();
                                        }
                                    }}
                                    disabled={isBusy}
                                />
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                                {/* Voice Recording (Visual only - simulated) */}
                                {!selectedFile && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={isBusy}
                                        className={cn(
                                            "h-10 w-10 rounded-full transition-all group/mic",
                                            isRecording ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                        )}
                                        onMouseDown={() => setIsRecording(true)}
                                        onMouseUp={() => setIsRecording(false)}
                                        onMouseLeave={() => setIsRecording(false)}
                                    >
                                        <Mic className={cn("w-5 h-5 transition-transform duration-300", isRecording ? "animate-pulse scale-110" : "group-hover/mic:scale-110")} />
                                    </Button>
                                )}

                                {/* Submit */}
                                {(input.trim() || selectedFile) && (
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isBusy}
                                        className="h-9 w-9 rounded-full bg-white text-black hover:bg-zinc-200 transition-all duration-200 group/send mb-0.5"
                                    >
                                        <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover/send:scale-110" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Helper Hints (Exact from CommandCenter) */}
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
            </div>
        </div>
    );
}
