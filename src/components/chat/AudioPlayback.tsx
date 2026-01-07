'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, AlertCircle, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlaybackProps {
    text: string;
}

type AudioState = 'idle' | 'preloading' | 'ready' | 'playing' | 'error';

export default function AudioPlayback({ text }: AudioPlaybackProps) {
    const [audioState, setAudioState] = useState<AudioState>('idle');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUrlRef = useRef<string | null>(null);
    const hasStartedPreload = useRef(false);
    const isPlayingRef = useRef(false);

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
        const audio = audioRef.current;
        if (!audio) return;

        // If currently playing, pause
        if (isPlayingRef.current) {
            audio.pause();
            isPlayingRef.current = false;
            setAudioState('ready');
            return;
        }

        // If ready, play
        if (audioState === 'ready' || audioState === 'playing') {
            try {
                audio.currentTime = 0;
                isPlayingRef.current = true;
                setAudioState('playing');
                await audio.play();
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
        <Button
            variant={audioState === 'playing' ? "secondary" : "ghost"}
            size="sm"
            onClick={handleClick}
            disabled={audioState === 'preloading'}
            className={cn(
                "h-8 px-3 text-xs gap-2 transition-all duration-300",
                audioState === 'playing' && "bg-primary/10 text-primary hover:bg-primary/20",
                audioState === 'ready' && "text-muted-foreground hover:text-foreground",
                audioState === 'error' && "text-destructive hover:text-destructive",
                audioState === 'preloading' && "opacity-70"
            )}
        >
            {audioState === 'preloading' ? (
                <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Preparing...
                </>
            ) : audioState === 'playing' ? (
                <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    Pause
                </>
            ) : audioState === 'ready' ? (
                <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Play Output
                </>
            ) : audioState === 'error' ? (
                <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Retry
                </>
            ) : (
                <>
                    <Volume2 className="w-3.5 h-3.5" />
                    Listen
                </>
            )}
        </Button>
    );
}
