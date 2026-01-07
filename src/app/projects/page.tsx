'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Project } from '@/lib/supabase';
import ParticlesBackground from '@/components/ui/particle-background';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Box, Cpu, Grid, Shield, Database, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            setProjects(data.projects || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to get a consistent icon based on string hash
    const getProjectIcon = (name: string, index: number) => {
        const icons = [Cpu, Box, Grid, Globe, Database, Shield];
        return icons[index % icons.length];
    };

    return (
        <main className="min-h-screen relative overflow-hidden bg-zinc-950 text-foreground selection:bg-purple-500/30">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0">
                {/* Subtle base gradient */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
                <div className="absolute h-full w-full bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
                <ParticlesBackground />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-8 py-12 min-h-screen flex flex-col">

                {/* Header Section */}
                <div className="relative mb-12 animate-in fade-in slide-in-from-top-4 duration-700 flex flex-col items-center">
                    {/* Back Button */}
                    <Link
                        href="/"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    {/* Centered Title */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                            Query Knowledge
                        </h1>
                        <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                            Select a project to start asking questions
                        </p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 rounded-xl bg-zinc-900/20 border border-zinc-800/50 animate-pulse" />
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-zinc-900 bg-zinc-950/50 backdrop-blur-sm max-w-lg mx-auto mt-10"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6">
                                <Box className="w-8 h-8 text-zinc-600" />
                            </div>
                            <h3 className="text-zinc-200 font-bold text-lg mb-2">No Projects Found</h3>
                            <p className="text-zinc-500 mb-8 max-w-xs text-sm">
                                Create your first repository in the Admin Hub to start querying.
                            </p>
                            <Link href="/admin">
                                <Button className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300 rounded-full px-8">
                                    Go to Admin Hub
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map((project, index) => {
                                const Icon = getProjectIcon(project.name, index);
                                return (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link href={`/chat/${project.id}`}>
                                            <div className="group relative p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/40 hover:bg-zinc-900/40 hover:border-zinc-700/60 transition-all duration-300 flex items-center justify-between cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    {/* Icon */}
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-indigo-400/80 group-hover:text-indigo-400 transition-colors shrink-0">
                                                        <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                                    </div>

                                                    {/* Text Info */}
                                                    <div className="flex flex-col gap-0.5">
                                                        <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                                            {project.name}
                                                        </h3>
                                                        <p className="text-[10px] text-zinc-500 font-medium tracking-wide first-letter:uppercase">
                                                            Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true }).replace('about ', '')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Chevron on Hover */}
                                                <div className="text-zinc-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
