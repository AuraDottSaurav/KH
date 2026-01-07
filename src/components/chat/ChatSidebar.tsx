'use client';

import { useState } from 'react';
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
}

// Dummy history data (replace with real data later)
const MOCK_HISTORY = [
    { id: '1', title: 'Latency buffers inquiry', date: '12m ago' },
    { id: '2', title: 'Synthesis of Alpha core', date: '1h ago' },
    { id: '3', title: 'Decentralized node logic', date: 'Yesterday' },
];

export default function ChatSidebar({ projectId, projectName, className }: ChatSidebarProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

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
                            {MOCK_HISTORY.map((item) => (
                                <button
                                    key={item.id}
                                    className={cn(
                                        "w-full group flex flex-col gap-1 p-3 rounded-xl transition-all duration-200 border border-transparent hover:bg-zinc-900/50 hover:border-zinc-800/50",
                                        isCollapsed ? "items-center justify-center py-4" : "text-left"
                                    )}
                                >
                                    {isCollapsed ? (
                                        <div className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-indigo-500 transition-colors" />
                                    ) : (
                                        <>
                                            <span className="font-bold text-xs text-zinc-300 group-hover:text-white transition-colors truncate w-full block">
                                                {item.title}
                                            </span>
                                            <span className="text-[10px] text-zinc-500">
                                                {item.date}
                                            </span>
                                        </>
                                    )}
                                </button>
                            ))}
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
