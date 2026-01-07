'use client';

import { useState } from 'react';
import { Project } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Folder, Loader2 } from 'lucide-react';
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
        <aside className="w-72 h-screen bg-muted/40 border-r flex flex-col">
            {/* Logo/Header */}
            <div className="p-6 border-b bg-background/50 backdrop-blur-sm">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Knowledge Hub</h1>
                        <p className="text-xs text-muted-foreground">Admin Portal</p>
                    </div>
                </Link>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-hidden flex flex-col p-4">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Projects
                    </h2>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        {projects.length}
                    </span>
                </div>

                <ScrollArea className="flex-1 -mx-2 px-2">
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {projects.map((project) => (
                                <Button
                                    key={project.id}
                                    variant={activeProject?.id === project.id ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start h-auto py-3 px-3",
                                        activeProject?.id === project.id && "bg-secondary"
                                    )}
                                    onClick={() => onSelectProject(project)}
                                >
                                    <Folder className={cn(
                                        "w-4 h-4 mr-3",
                                        activeProject?.id === project.id ? "text-primary" : "text-muted-foreground"
                                    )} />
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="font-medium truncate leading-none mb-1">{project.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Button>
                            ))}

                            {projects.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-sm">No projects yet</p>
                                    <p className="text-xs mt-1">Create your first project below</p>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Create Project Button */}
            <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-dashed">
                            <Plus className="w-4 h-4 mr-2" />
                            New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                                placeholder="Enter project name..."
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateProject}
                                disabled={!newProjectName.trim() || isCreating}
                            >
                                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Project
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </aside>
    );
}
