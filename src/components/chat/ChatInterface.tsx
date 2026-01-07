'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceInput from './VoiceInput';
import AudioPlayback from './AudioPlayback';

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
        <div className="flex flex-col h-[calc(100vh-73px)]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 gradient-text">
                                Ask About {projectName}
                            </h2>
                            <p className="text-slate-400 max-w-md mx-auto">
                                I have access to all the knowledge indexed in this project.
                                Ask me anything, either by typing or using voice!
                            </p>

                            {/* Quick prompts */}
                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                {[
                                    'What topics are covered?',
                                    'Summarize the main points',
                                    'What should I know first?',
                                ].map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => setInput(prompt)}
                                        className="px-4 py-2 rounded-xl glass hover:bg-white/10 text-sm text-slate-300 hover:text-white transition-all"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index === messages.length - 1 ? 0.1 : 0 }}
                                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[80%] ${message.role === 'user'
                                                ? 'gradient-primary text-white rounded-2xl rounded-br-md px-4 py-3'
                                                : 'glass rounded-2xl rounded-tl-md px-4 py-3'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {message.content}
                                        </p>

                                        {/* TTS Button for assistant messages */}
                                        {message.role === 'assistant' && message.content && (
                                            <div className="mt-3 pt-3 border-t border-slate-600/30">
                                                <AudioPlayback text={message.content} />
                                            </div>
                                        )}
                                    </div>

                                    {message.role === 'user' && (
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {/* Loading indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="glass rounded-2xl rounded-tl-md px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200/10 bg-slate-900/50 backdrop-blur-xl p-4">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleFormSubmit} className="flex items-end gap-3">
                        {/* Voice Mode Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsVoiceMode(!isVoiceMode)}
                            className={`p-3 rounded-xl transition-all ${isVoiceMode
                                    ? 'gradient-primary text-white shadow-glow'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </button>

                        {isVoiceMode ? (
                            <div className="flex-1">
                                <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 relative">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask a question..."
                                        className="w-full resize-none bg-slate-800 rounded-xl px-4 py-3 outline-none text-white placeholder-slate-400 max-h-32 min-h-[48px] focus:ring-2 focus:ring-purple-500/50"
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleFormSubmit(e);
                                            }
                                        }}
                                        disabled={isLoading}
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-3 rounded-xl gradient-primary text-white shadow-glow hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </motion.button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
