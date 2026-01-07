'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/lib/supabase';
import Link from 'next/link';

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
        <>
            <aside className="w-72 h-screen bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
                {/* Logo/Header */}
                <div className="p-6 border-b border-slate-700/50">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Knowledge Hub</h1>
                            <p className="text-xs text-slate-400">Admin Portal</p>
                        </div>
                    </Link>
                </div>

                {/* Projects List */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                            Projects
                        </h2>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                            {projects.length}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-12 rounded-xl bg-slate-800/50 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <motion.div layout className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {projects.map((project) => (
                                    <motion.button
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onClick={() => onSelectProject(project)}
                                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${activeProject?.id === project.id
                                                ? 'gradient-primary text-white shadow-glow'
                                                : 'hover:bg-slate-800/50 text-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeProject?.id === project.id
                                                        ? 'bg-white/20'
                                                        : 'bg-slate-700 group-hover:bg-slate-600'
                                                    }`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{project.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(project.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </AnimatePresence>

                            {projects.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    <p className="text-sm">No projects yet</p>
                                    <p className="text-xs mt-1">Create your first project below</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Create Project Button */}
                <div className="p-4 border-t border-slate-700/50">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-600 hover:border-purple-500 text-slate-400 hover:text-purple-400 transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>New Project</span>
                    </button>
                </div>
            </aside>

            {/* Create Project Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-700"
                        >
                            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                            <input
                                type="text"
                                placeholder="Enter project name..."
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all mb-4"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateProject}
                                    disabled={!newProjectName.trim() || isCreating}
                                    className="flex-1 py-3 rounded-xl gradient-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow transition-all"
                                >
                                    {isCreating ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
