'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoiceInput from './VoiceInput';
import AudioPlayback from './AudioPlayback';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, Mic, Send, Sparkles, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
    projectId: string;
    projectName: string;
}

export default function ChatInterface({ projectId, projectName }: ChatInterfaceProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // We can remove the explicit "isVoiceMode" state if we integrate the button directly.
    // Or keep it if we want to toggle the input capability.
    // For ChatGPT style, voice is usually an alternative input method available alongside text.
    // I'll keep the input area text-based and add the mic button.

    const { messages, input, setInput, handleSubmit, isLoading, append } = useChat({
        api: '/api/chat',
        body: { projectId },
    });

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleVoiceTranscript = async (transcript: string) => {
        if (transcript.trim()) {
            await append({
                role: 'user',
                content: transcript,
            });
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        handleSubmit(e);
    };

    // Submit on Enter (without Shift)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleFormSubmit(e as any);
        }
    };

    return (
        <div className="flex flex-col h-full w-full relative bg-background">
            {/* Messages Area - Centered Stream */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full w-full">
                    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-8">
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center text-center mt-20"
                            >
                                <div className="w-16 h-16 rounded-full bg-secondary mb-6 flex items-center justify-center">
                                    <Bot className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-semibold mb-2">How can I help you?</h2>
                                <p className="text-muted-foreground mb-8 text-sm max-w-md">
                                    Ask me anything about {projectName}. I can analyze documents, explain concepts, and more.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                                    {[
                                        'Summarize this project',
                                        'What are the key findings?',
                                        'Explain the architecture',
                                        'List the contributors'
                                    ].map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(prompt)}
                                            className="text-left p-3 rounded-xl border bg-background hover:bg-muted/50 transition-colors text-sm text-foreground/80 dark:text-foreground/70"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-4 w-full group",
                                        message.role === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {/* Avatar for Assistant */}
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0 bg-background">
                                            <Bot className="w-5 h-5 text-primary" />
                                        </div>
                                    )}

                                    <div className={cn(
                                        "relative max-w-[85%] md:max-w-[80%]",
                                        message.role === 'user'
                                            ? "space-y-1"
                                            : "space-y-2 w-full"
                                    )}>
                                        {/* User Name / Bot Name (optional, kept minimal like ChatGPT) */}
                                        <div className={cn(
                                            "text-xs font-semibold select-none opacity-0 group-hover:opacity-100 transition-opacity",
                                            message.role === 'user' ? "text-right" : "text-left"
                                        )}>
                                            {message.role === 'user' ? 'You' : 'Assistant'}
                                        </div>

                                        <div className={cn(
                                            "rounded-3xl px-5 py-3.5",
                                            message.role === 'user'
                                                ? "bg-secondary text-secondary-foreground"
                                                : "text-foreground p-0 bg-transparent" // Assistant messages often just text in ChatGPT (or huge blocks)
                                        )}>
                                            {message.role === 'user' ? (
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {message.content}
                                                </p>
                                            ) : (
                                                <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            code: ({ className, children }) => {
                                                                const isInline = !className;
                                                                return isInline ? (
                                                                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono border">
                                                                        {children}
                                                                    </code>
                                                                ) : (
                                                                    <code className="block bg-muted/50 p-3 px-4 rounded-lg my-2 overflow-x-auto text-xs font-mono border">
                                                                        {children}
                                                                    </code>
                                                                );
                                                            },
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>

                                        {/* Audio Playback & Actions */}
                                        {message.role === 'assistant' && !isLoading && (
                                            <div className="flex items-center gap-2 pt-1">
                                                <AudioPlayback text={message.content} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Avatar for User? (Normally users don't see their own avatar in ChatGPT, just right aligned bubble) 
                                        I'll hide it for cleaner look, or just use a placeholder if preferred. 
                                        I will Hide it for now to be closer to ChatGPT. 
                                    */}
                                </motion.div>
                            ))
                        )}

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-4 w-full"
                            >
                                <div className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0 bg-background">
                                    <Bot className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-12" />
                    </div>
                </ScrollArea>

                {/* Scroll to bottom button could go here */}
            </div>

            {/* Input Area - Fixed Bottom Capsule */}
            <div className="p-4 md:p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-3xl mx-auto">
                    <form
                        onSubmit={handleFormSubmit}
                        className="relative flex items-end gap-2 bg-muted/40 border p-2 rounded-[2rem] focus-within:ring-2 focus-within:ring-ring/20 transition-all shadow-sm"
                    >
                        {/* Attachment / Plus Button (Placeholder) */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-10 w-10 text-muted-foreground hover:bg-muted"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </Button>

                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message ChatGPT..."
                            className="min-h-[44px] max-h-32 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent py-3 px-2 flex-1"
                            rows={1}
                        />

                        {/* Right Actions: Voice & Send */}
                        <div className="flex items-center gap-1">
                            <VoiceInput
                                onTranscript={handleVoiceTranscript}
                                disabled={isLoading}
                                compact={true}
                            />

                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim() || isLoading}
                                className={cn(
                                    "rounded-full h-10 w-10 transition-all duration-200",
                                    input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </form>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-muted-foreground">
                            AI Knowledge Hub can make mistakes. Check important info.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
// Helper Icon for Plus
function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
