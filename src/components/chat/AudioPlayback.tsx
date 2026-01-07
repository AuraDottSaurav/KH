'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AudioPlaybackProps {
    text: string;
}

type AudioState = 'idle' | 'preloading' | 'ready' | 'playing' | 'error';

export default function AudioPlayback({ text }: AudioPlaybackProps) {
    const [audioState, setAudioState] = useState<AudioState>('idle');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUrlRef = useRef<string | null>(null);
    const hasStartedPreload = useRef(false);
    const isPlayingRef = useRef(false); // Track playing state in ref to avoid stale closures

    // Start preloading immediately when component mounts
    useEffect(() => {
        if (hasStartedPreload.current || text.length < 20) return;
        hasStartedPreload.current = true;

        const preloadAudio = async () => {
            setAudioState('preloading');

            try {
                const response = await fetch('/api/speak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text,
                        voice: 'nova'
                    }),
                });

                if (!response.ok) throw new Error('TTS failed');

                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                audioUrlRef.current = audioUrl;

                // Create audio element
                const audio = new Audio(audioUrl);
                audio.preload = 'auto';
                audioRef.current = audio;

                // Only set ready when first loaded, NOT when already playing
                audio.oncanplaythrough = () => {
                    // Only transition to ready if we're still preloading
                    if (!isPlayingRef.current) {
                        console.log('[TTS] Audio ready to play');
                        setAudioState('ready');
                    }
                };

                audio.onended = () => {
                    console.log('[TTS] Audio ended');
                    isPlayingRef.current = false;
                    setAudioState('ready');
                };

                audio.onerror = () => {
                    console.log('[TTS] Audio error');
                    isPlayingRef.current = false;
                    setAudioState('error');
                };

                // Start loading
                audio.load();

            } catch (error) {
                console.error('[TTS] Preload error:', error);
                setAudioState('error');
            }
        };

        preloadAudio();

        // Cleanup
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.oncanplaythrough = null;
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
            }
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
            }
        };
    }, [text]);

    const handleClick = async () => {
        console.log('[TTS] Button clicked, current state:', audioState, 'isPlaying:', isPlayingRef.current);

        const audio = audioRef.current;
        if (!audio) {
            console.log('[TTS] No audio element');
            return;
        }

        // If currently playing, pause
        if (isPlayingRef.current) {
            audio.pause();
            isPlayingRef.current = false;
            setAudioState('ready');
            console.log('[TTS] Paused');
            return;
        }

        // If ready, play
        if (audioState === 'ready' || audioState === 'playing') {
            try {
                audio.currentTime = 0;

                // Set playing state FIRST
                isPlayingRef.current = true;
                setAudioState('playing');
                console.log('[TTS] Starting playback');

                await audio.play();
                console.log('[TTS] Playback started');
            } catch (error) {
                console.error('[TTS] Play error:', error);
                isPlayingRef.current = false;
                setAudioState('error');
            }
            return;
        }

        // If error, retry
        if (audioState === 'error') {
            hasStartedPreload.current = false;
            isPlayingRef.current = false;
            setAudioState('idle');
        }
    };

    return (
        <motion.button
            whileHover={{ scale: audioState !== 'preloading' ? 1.02 : 1 }}
            whileTap={{ scale: audioState !== 'preloading' ? 0.98 : 1 }}
            onClick={handleClick}
            disabled={audioState === 'preloading'}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all ${audioState === 'playing'
                    ? 'bg-purple-500/30 text-purple-300'
                    : audioState === 'ready'
                        ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300'
                        : audioState === 'error'
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300'
                            : audioState === 'preloading'
                                ? 'bg-slate-700/50 text-slate-400 cursor-wait'
                                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white'
                }`}
        >
            {audioState === 'preloading' ? (
                <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Preparing...</span>
                </>
            ) : audioState === 'playing' ? (
                <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    <span>Pause</span>
                </>
            ) : audioState === 'ready' ? (
                <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Play</span>
                </>
            ) : audioState === 'error' ? (
                <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    <span>Retry</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Listen</span>
                </>
            )}
        </motion.button>
    );
}
