import Link from "next/link";
import { Mic, FileUp, Search, ShieldCheck, Database } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParticlesBackground from "@/components/ui/particle-background";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-zinc-950 text-foreground selection:bg-purple-500/30">

            {/* Background Layers */}
            <div className="absolute inset-0 z-0">
                {/* Subtle base gradient */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />

                {/* Grid Pattern */}
                <div className="absolute h-full w-full bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

                {/* God Ray Light Effect */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-[80px] rounded-full rotate-45 pointer-events-none" />

                {/* Mouse interaction particles */}
                <ParticlesBackground />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto w-full h-full justify-center min-h-[80vh]">

                {/* Neural Repository Badge */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-[10px] md:text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase shadow-sm">
                        Neural Repository
                    </span>
                </div>

                {/* Main Heading */}
                <div className="text-center space-y-2 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tight font-extralight text-zinc-300">
                        Knowledge Transfer
                    </h1>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tight font-bold text-indigo-500 drop-shadow-2xl italic">
                        Reimagined
                    </h1>
                </div>

                {/* Subtitle */}
                <p className="max-w-xl mx-auto text-center text-[10px] md:text-xs font-medium tracking-[0.15em] text-zinc-500 uppercase leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    A permanent home for shared wisdom. Capture what you know,
                    <br className="hidden md:block" />
                    find what you need, and learn at your own pace.
                </p>

                {/* Action Tabs */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <Tabs defaultValue="actions" className="w-auto">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-md rounded-full px-2 gap-2">
                            <TabsTrigger value="admin" className="rounded-full data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400 transition-all font-medium tracking-wide text-xs" asChild>
                                <Link href="/admin" className="flex items-center gap-2 px-6">
                                    <ShieldCheck className="w-4 h-4" />
                                    ADMIN HUB
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="query" className="rounded-full data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400 transition-all font-medium tracking-wide text-xs" asChild>
                                <Link href="/projects" className="flex items-center gap-2 px-6">
                                    <Database className="w-4 h-4" />
                                    QUERY KNOWLEDGE
                                </Link>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

            </div>

            {/* Footer Features (Borderless Tabs) */}
            <div className="absolute bottom-8 left-0 w-full z-20 animate-in fade-in duration-1000 delay-500">
                <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-4 md:gap-8">
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/20 backdrop-blur-sm text-center">
                        <Mic className="w-5 h-5 text-indigo-500 mb-2" />
                        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Voice Input</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/20 backdrop-blur-sm text-center">
                        <FileUp className="w-5 h-5 text-indigo-500 mb-2" />
                        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">File Upload</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/20 backdrop-blur-sm text-center">
                        <Search className="w-5 h-5 text-indigo-500 mb-2" />
                        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Semantic Search</span>
                    </div>
                </div>
            </div>

        </main>
    );
}
