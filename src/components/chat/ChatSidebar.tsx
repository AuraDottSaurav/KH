'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus, MessageSquare, Settings, LogOut, PanelLeft, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ChatSidebarProps {
    projectId: string;
    projectName: string;
    className?: string;
}

export default function ChatSidebar({ projectId, projectName, className }: ChatSidebarProps) {
    const [open, setOpen] = useState(false);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-muted/30 border-r">
            {/* Header / New Chat */}
            <div className="p-4">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 shadow-sm bg-background hover:bg-muted/50 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New chat
                </Button>
            </div>

            {/* History List */}
            <ScrollArea className="flex-1 px-3">
                <div className="space-y-4 py-2">
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground/50 uppercase">
                            Today
                        </h2>
                        <div className="space-y-1">
                            <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9 px-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                <MessageSquare className="mr-2 h-4 w-4 opacity-50" />
                                <span className="truncate">Understanding {projectName}</span>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9 px-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                <MessageSquare className="mr-2 h-4 w-4 opacity-50" />
                                <span className="truncate">Key Concepts</span>
                            </Button>
                        </div>
                    </div>

                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground/50 uppercase">
                            Previous 7 Days
                        </h2>
                        <div className="space-y-1">
                            <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9 px-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                <MessageSquare className="mr-2 h-4 w-4 opacity-50" />
                                <span className="truncate">Project Architecture</span>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9 px-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                <MessageSquare className="mr-2 h-4 w-4 opacity-50" />
                                <span className="truncate">Deployment Steps</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* User Profile / Bottom */}
            <div className="p-4 border-t mt-auto">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm">
                        <span className="font-medium">User</span>
                        <span className="text-xs text-muted-foreground">Pro Plan</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                    <Link href="/projects" className="block w-full">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
                            <LogOut className="mr-2 h-4 w-4" />
                            Back to Projects
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={cn("hidden md:block w-[260px] flex-shrink-0 h-full", className)}>
                <SidebarContent />
            </div>

            {/* Mobile Sheet Trigger (To be placed in main layout usually, but we can put it here for now or export it) 
                Actually, the trigger usually sits in the main header. 
                For this design, let's export a MobileSidebar component or handle it in the Page layout.
                But to be self-contained:
            */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <PanelLeft className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[260px] flex flex-col gap-0">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}

