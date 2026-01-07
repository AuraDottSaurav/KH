import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIElementProps {
    mode?: 'thinking' | 'searching' | 'processing';
    text?: string;
    className?: string;
}

export function AIElement({ mode = 'thinking', text = 'Thinking...', className }: AIElementProps) {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-500/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-indigo-500/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-indigo-500/60 rounded-full animate-bounce" />
            </div>
            <span className="text-xs font-medium text-indigo-400/80 animate-pulse">
                {text}
            </span>
        </div>
    );
}
