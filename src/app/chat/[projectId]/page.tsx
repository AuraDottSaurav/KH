'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ChatInterface from '@/components/chat/ChatInterface';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { Project } from '@/lib/supabase';
import { ArrowLeft, Box, Cpu, Grid, Globe, Database, Shield } from 'lucide-react';
import ParticlesBackground from '@/components/ui/particle-background';

// Helper to get consistent icon
const getProjectIcon = (name: string, index: number = 0) => {
    const icons = [Cpu, Box, Grid, Globe, Database, Shield];
    // Simple hash to get consistent icon
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return icons[hash % icons.length];
};

export default function ChatPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            const foundProject = data.projects?.find((p: Project) => p.id === projectId);
            setProject(foundProject || null);
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white">
                <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
                <Link href="/projects" className="text-indigo-400 hover:text-indigo-300">Back to Projects</Link>
            </div>
        );
    }

    const ProjectIcon = getProjectIcon(project.name);

    return (
        <div className="flex h-screen bg-black overflow-hidden selection:bg-indigo-500/30">
            {/* Chat Sidebar */}
            <ChatSidebar projectId={projectId} projectName={project.name} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative h-full w-full overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]" />
                    <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]" />
                    <div className="absolute h-full w-full bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
                    <ParticlesBackground />
                </div>

                {/* Header */}
                <header className="relative z-20 px-8 py-8 border-b border-white/5 bg-black/50 backdrop-blur-sm flex items-center gap-4">
                    <Link
                        href="/projects"
                        className="p-2 -ml-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>

                    <div className="flex items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                {project.name.replace(/Vault/i, '').trim()}
                            </h1>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                                KNOWLEDGE BASE
                            </p>
                        </div>
                    </div>
                </header>

                {/* Chat Interface */}
                <div className="flex-1 relative z-10 w-full">
                    <ChatInterface projectId={projectId} projectName={project.name} />
                </div>
            </main>
        </div>
    );
}
