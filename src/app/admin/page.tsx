'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/admin/Sidebar';
import CommandCenter from '@/components/admin/CommandCenter';
import RecentUploads from '@/components/admin/RecentUploads';
import { Project, KnowledgeItem } from '@/lib/supabase';

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
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <Sidebar
                projects={projects}
                activeProject={activeProject}
                onSelectProject={setActiveProject}
                onCreateProject={handleCreateProject}
                isLoading={isLoading}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                </div>

                {/* Header */}
                <header className="relative z-10 px-8 py-6 border-b border-slate-200/10">
                    <AnimatePresence mode="wait">
                        {activeProject ? (
                            <motion.div
                                key={activeProject.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <h1 className="text-2xl font-bold gradient-text">
                                    {activeProject.name}
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    {knowledgeItems.length} knowledge items indexed
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <h1 className="text-2xl font-bold text-slate-400">
                                    Select or create a project
                                </h1>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                {/* Content Area */}
                <div className="flex-1 relative z-10 flex flex-col">
                    {activeProject ? (
                        <>
                            {/* Recent Uploads */}
                            <div className="flex-1 px-8 py-6 overflow-y-auto">
                                <RecentUploads items={knowledgeItems} />
                            </div>

                            {/* Command Center - Fixed at bottom */}
                            <div className="sticky bottom-0 p-6 bg-gradient-to-t from-slate-900/80 to-transparent backdrop-blur-sm">
                                <CommandCenter
                                    projectId={activeProject.id}
                                    onKnowledgeAdded={handleKnowledgeAdded}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
                                <p className="text-slate-500">
                                    Create a new project from the sidebar to get started
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
