'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatSidebarProps {
    projectId: string;
    projectName: string;
    className?: string; // Add className prop to satisfy usage in page.tsx
    refreshTrigger?: number;
    activeChatId?: string | null;
}

// Helper for relative time
function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return 'Just now';
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

interface Chat {
    id: string;
    title: string;
    created_at: string;
}

export default function ChatSidebar({ projectId, projectName, className, refreshTrigger = 0, activeChatId }: ChatSidebarProps) {
    const [isLoading, setIsLoading] = useState(true); // Start loading true
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);

    useEffect(() => {
        if (projectId) {
            setIsLoading(true);
            fetch(`/api/chats?projectId=${projectId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.chats) setChats(data.chats);
                })
                .catch(err => console.error('Failed to load chats', err))
                .finally(() => setIsLoading(false));
        }
    }, [projectId, refreshTrigger]);

    return (
        <aside
            className={cn(
                "h-screen bg-zinc-900/40 border-r border-white/5 flex flex-col transition-all duration-300 relative group/sidebar",
                isCollapsed ? "w-[80px]" : "w-[300px]",
                className
            )}
        >
            {/* Logo/Header */}
            <div className={cn("p-6 flex items-center", isCollapsed ? "justify-center px-0" : "")}>
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                        <Zap className="w-5 h-5 fill-current" />
                    </div>
                    {!isCollapsed && (
                        <span className="font-bold text-lg tracking-tight text-zinc-100 whitespace-nowrap overflow-hidden transition-all duration-200">
                            Handover
                        </span>
                    )}
                </Link>
            </div>

            {/* New Inquiry Button */}
            <div className={cn("px-6 pb-6", isCollapsed ? "px-4" : "")}>
                <Link href={`/chat/${projectId}`}>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-all group",
                            isCollapsed ? "h-12 w-12 p-0 justify-center" : "h-12 text-xs font-semibold tracking-wider justify-center gap-1"
                        )}
                    >
                        <Plus className={cn("w-4 h-4 transition-transform duration-300", isCollapsed ? "" : "group-hover:rotate-90")} />
                        {!isCollapsed && "NEW INQUIRY"}
                    </Button>
                </Link>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-hidden flex flex-col px-4">
                {!isCollapsed && (
                    <div className="mb-4 pl-2 fade-in duration-300">
                        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            Sync History
                        </h2>
                    </div>
                )}

                <ScrollArea className="flex-1 -mx-2 px-2">
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className={cn("rounded-xl bg-zinc-900", isCollapsed ? "h-10 w-10 mx-auto" : "h-14 w-full")} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {chats.map((item) => {
                                const isActive = item.id === activeChatId;
                                return (
                                    <Link
                                        key={item.id}
                                        href={`/chat/${projectId}?chatId=${item.id}`}
                                        className={cn(
                                            "w-full group flex flex-col gap-1 p-3 rounded-xl transition-all duration-200 border block",
                                            isCollapsed ? "items-center justify-center py-4" : "text-left",
                                            isActive
                                                ? "bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/15"
                                                : "border-transparent hover:bg-zinc-900/50 hover:border-zinc-800/50"
                                        )}
                                    >
                                        {isCollapsed ? (
                                            <div className={cn(
                                                "w-2 h-2 rounded-full transition-colors",
                                                isActive ? "bg-indigo-500" : "bg-zinc-800 group-hover:bg-indigo-500"
                                            )} />
                                        ) : (
                                            <>
                                                <span className={cn(
                                                    "font-bold text-xs transition-colors truncate w-full block",
                                                    isActive ? "text-indigo-400" : "text-zinc-300 group-hover:text-white"
                                                )}>
                                                    {item.title}
                                                </span>
                                                <span className={cn(
                                                    "text-[10px]",
                                                    isActive ? "text-indigo-300/60" : "text-zinc-500"
                                                )}>
                                                    {getRelativeTime(item.created_at)}
                                                </span>
                                            </>
                                        )}
                                    </Link>
                                );
                            })}
                            {chats.length === 0 && !isCollapsed && (
                                <div className="text-center text-zinc-600 text-xs py-4">No history yet</div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-all z-50 opacity-0 group-hover/sidebar:opacity-100"
            >
                <div className="w-0.5 h-4 bg-current rounded-full" />
            </button>

        </aside>
    );
}
