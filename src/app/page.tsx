import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4">
                <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-text animate-fade-in">
                    Knowledge Hub
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto animate-slide-up">
                    AI-powered knowledge transfer platform. Dump text, voice, and files —
                    then query your knowledge with natural language.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <Link
                        href="/admin"
                        className="group relative px-8 py-4 rounded-2xl gradient-primary text-white font-semibold text-lg shadow-glow transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Admin Hub
                        </span>
                    </Link>

                    <Link
                        href="/projects"
                        className="group px-8 py-4 rounded-2xl glass border border-slate-200/50 dark:border-slate-700/50 font-semibold text-lg transition-all duration-300 hover:scale-105 hover:bg-white/20"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Query Knowledge
                        </span>
                    </Link>
                </div>
            </div>

            {/* Features grid */}
            <div className="relative z-10 mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 px-4 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <FeatureCard
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    }
                    title="Voice Input"
                    description="Record knowledge or ask questions with your voice. Powered by OpenAI Whisper."
                />
                <FeatureCard
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    title="File Upload"
                    description="Upload PDFs, documents, and audio files. Auto-extracted and indexed."
                />
                <FeatureCard
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    }
                    title="Semantic Search"
                    description="AI-powered RAG retrieval finds the most relevant knowledge for your queries."
                />
            </div>
        </main>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="glass rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-glow">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-white mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{description}</p>
        </div>
    );
}
