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
    const [isVoiceMode, setIsVoiceMode] = useState(false);

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

    return (
        <div className="flex flex-col h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] max-w-5xl mx-auto w-full">
            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-6 pb-4">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 flex flex-col items-center"
                        >
                            <div className="w-20 h-20 mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Bot className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">
                                Ask About {projectName}
                            </h2>
                            <p className="text-muted-foreground max-w-md mx-auto mb-8">
                                I have access to all the knowledge indexed in this project.
                                Ask me anything, either by typing or using voice!
                            </p>

                            {/* Quick prompts */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {[
                                    'What topics are covered?',
                                    'Summarize the main points',
                                    'What should I know first?',
                                ].map((prompt) => (
                                    <Button
                                        key={prompt}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setInput(prompt)}
                                        className="rounded-full"
                                    >
                                        <Sparkles className="w-3 h-3 mr-2 text-primary" />
                                        {prompt}
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                        "flex gap-4 w-full",
                                        message.role === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {message.role === 'assistant' && (
                                        <Avatar className="w-8 h-8 border">
                                            <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div
                                        className={cn(
                                            "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
                                            message.role === 'user'
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : "bg-muted/50 rounded-bl-none border"
                                        )}
                                    >
                                        {message.role === 'user' ? (
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {message.content}
                                            </p>
                                        ) : (
                                            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
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
                                                                <code className="block bg-muted p-3 px-4 rounded-lg my-2 overflow-x-auto text-xs font-mono border">
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

                                        {/* TTS Button for assistant messages */}
                                        {message.role === 'assistant' && message.content && !isLoading && (
                                            <div className="mt-2 pt-2 border-t border-border/50">
                                                <AudioPlayback text={message.content} />
                                            </div>
                                        )}
                                    </div>

                                    {message.role === 'user' && (
                                        <Avatar className="w-8 h-8 border bg-primary text-primary-foreground">
                                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex gap-4 items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Avatar className="w-8 h-8 border">
                                <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                            </Avatar>
                            <div className="bg-muted/50 rounded-2xl rounded-bl-none px-4 py-3 border flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="mt-auto p-4 bg-background/80 backdrop-blur-lg border-t z-10 w-full">
                <div className="max-w-4xl mx-auto w-full">
                    <form onSubmit={handleFormSubmit} className="flex gap-2 items-end w-full">
                        {/* Voice Mode Toggle */}
                        <Button
                            type="button"
                            variant={isVoiceMode ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setIsVoiceMode(!isVoiceMode)}
                            className="mb-1 shrink-0"
                            title={isVoiceMode ? "Switch to Text" : "Switch to Voice"}
                        >
                            {isVoiceMode ? <Keyboard className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </Button>

                        {isVoiceMode ? (
                            <div className="flex-1 mb-1">
                                <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />
                            </div>
                        ) : (
                            <div className="flex-1 relative w-full">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="min-h-[44px] max-h-32 resize-none py-3 px-4 rounded-xl focus-visible:ring-1 pr-12 w-full"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleFormSubmit(e);
                                        }
                                    }}
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 bottom-2 h-8 w-8 shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
