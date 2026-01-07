import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            {/* Hero Section */}
            <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <Badge variant="outline" className="mb-4">
                    v0.1.0 • Knowledge Hub
                </Badge>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl">
                    Knowledge Transfer <br />
                    <span className="text-primary">Reimagined</span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    AI-powered platform to dump text, voice, and files — then query your knowledge base with natural language.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild size="lg" className="h-12 px-8 text-lg">
                        <Link href="/admin">
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Admin Hub
                            </span>
                        </Link>
                    </Button>

                    <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg">
                        <Link href="/projects">
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Query Knowledge
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                <FeatureCard
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    }
                    title="Voice Input"
                    description="Record knowledge or ask questions with your voice. Powered by OpenAI Whisper."
                />
                <FeatureCard
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    title="File Upload"
                    description="Upload PDFs, documents, and audio files. Auto-extracted and indexed."
                />
                <FeatureCard
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <Card className="border-border/50 hover:bg-accent/50 transition-colors">
            <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    {icon}
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
            </CardContent>
        </Card>
    );
}
