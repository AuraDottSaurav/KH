'use client';

import { useState } from 'react';
import { Project } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Zap, Box, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SidebarProps {
    projects: Project[];
    activeProject: Project | null;
    onSelectProject: (project: Project) => void;
    onCreateProject: (name: string) => void;
    isLoading: boolean;
}

export default function Sidebar({
    projects,
    activeProject,
    onSelectProject,
    onCreateProject,
    isLoading,
}: SidebarProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        setIsCreating(true);
        await onCreateProject(newProjectName);
        setNewProjectName('');
        setIsModalOpen(false);
        setIsCreating(false);
    };

    return (
        <aside className="w-[300px] h-screen bg-zinc-900/40 border-r border-white/5 flex flex-col">
            {/* Logo/Header */}
            <div className="p-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-zinc-100">Handover</span>
                </Link>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-hidden flex flex-col px-4">
                <div className="mb-4 pl-2">
                    <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Repositories
                    </h2>
                </div>

                <ScrollArea className="flex-1 -mx-2 px-2">
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-14 w-full rounded-xl bg-zinc-900" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => onSelectProject(project)}
                                    className={cn(
                                        "w-full group flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-200 border border-transparent",
                                        activeProject?.id === project.id
                                            ? "bg-zinc-900 border-zinc-800"
                                            : "hover:bg-zinc-900/50 hover:border-zinc-800/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                        activeProject?.id === project.id
                                            ? "bg-indigo-500/10 text-indigo-400"
                                            : "bg-zinc-800/50 text-zinc-500 group-hover:text-zinc-400"
                                    )}>
                                        <LayoutGrid className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "font-medium text-sm truncate transition-colors",
                                            activeProject?.id === project.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                                        )}>
                                            {project.name}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 truncate">
                                            {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    {activeProject?.id === project.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Create Project Button */}
            <div className="p-4 mt-auto">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 h-12 rounded-xl text-xs font-semibold tracking-wider transition-all">
                            <Plus className="w-4 h-4 mr-2" />
                            NEW PROJECT
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Repository</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                                placeholder="Repository name..."
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                                className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateProject}
                                disabled={!newProjectName.trim() || isCreating}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Repository
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </aside>
    );
}
