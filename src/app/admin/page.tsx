'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/admin/Sidebar';
import CommandCenter from '@/components/admin/CommandCenter';
import RecentUploads from '@/components/admin/RecentUploads';
import { Project, KnowledgeItem } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch projects on mount
    useEffect(() => {
        fetchProjects();
    }, []);

    // Fetch knowledge items when active project changes
    useEffect(() => {
        if (activeProject) {
            fetchKnowledgeItems(activeProject.id);
        }
    }, [activeProject]);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            setProjects(data.projects || []);
            if (data.projects?.length > 0 && !activeProject) {
                setActiveProject(data.projects[0]);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchKnowledgeItems = async (projectId: string) => {
        try {
            const response = await fetch(`/api/ingest?projectId=${projectId}`);
            const data = await response.json();
            setKnowledgeItems(data.items || []);
        } catch (error) {
            console.error('Error fetching knowledge items:', error);
        }
    };

    const handleCreateProject = async (name: string) => {
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            const data = await response.json();
            if (data.project) {
                setProjects([data.project, ...projects]);
                setActiveProject(data.project);
            }
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    const handleKnowledgeAdded = useCallback(() => {
        if (activeProject) {
            fetchKnowledgeItems(activeProject.id);
        }
    }, [activeProject]);

    return (
        <div className="min-h-screen flex bg-black text-foreground font-sans selection:bg-indigo-500/30">
            {/* Sidebar */}
            <Sidebar
                projects={projects}
                activeProject={activeProject}
                onSelectProject={setActiveProject}
                onCreateProject={handleCreateProject}
                isLoading={isLoading}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-black">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]" />
                    <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]" />
                </div>

                {/* Header */}
                <header className="relative z-10 px-8 py-8">
                    <AnimatePresence mode="wait">
                        {activeProject ? (
                            <motion.div
                                key={activeProject.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-start gap-4"
                            >
                                <Link href="/" className="mt-1 p-2 rounded-lg hover:bg-zinc-900 transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-zinc-500" />
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-white tracking-tight">
                                        {activeProject.name}
                                    </h1>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
                                        {knowledgeItems.length} Knowledge Items Indexed
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <h1 className="text-2xl font-bold text-zinc-600">
                                    Select a repository
                                </h1>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                {/* Content Area */}
                <div className="flex-1 relative z-10 flex flex-col max-w-5xl mx-auto w-full px-8">
                    {activeProject ? (
                        <>
                            {/* Recent Uploads (Scrollable) */}
                            <div className="flex-1 overflow-y-auto pb-32 scrollbar-none">
                                <RecentUploads items={knowledgeItems} />
                            </div>

                            {/* Command Center - Fixed at bottom */}
                            <div className="absolute bottom-12 left-0 right-0 px-8">
                                <CommandCenter
                                    projectId={activeProject.id}
                                    onKnowledgeAdded={handleKnowledgeAdded}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center -mt-20">
                            <div className="text-center p-12 border border-zinc-900 rounded-2xl bg-zinc-900/20 backdrop-blur-sm">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="text-lg font-medium text-zinc-200 mb-2">No Repository Selected</h2>
                                <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                                    Select a repository from the sidebar or create a new one to start indexing knowledge.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
