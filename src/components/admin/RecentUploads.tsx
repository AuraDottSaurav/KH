'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { KnowledgeItem } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Music, File, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentUploadsProps {
    items: KnowledgeItem[];
}

const typeIcons: Record<string, React.ReactNode> = {
    text: <FileText className="w-5 h-5" />,
    audio: <Music className="w-5 h-5" />,
    pdf: <File className="w-5 h-5" />,
};

export default function RecentUploads({ items }: RecentUploadsProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-2 border-dashed rounded-xl border-muted">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No Knowledge Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    Start dumping knowledge using the input above. Add text, record voice notes, or upload files.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto mt-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 px-1">
                <span>Recent Uploads</span>
                <Badge variant="secondary" className="rounded-full">
                    {items.length}
                </Badge>
            </h2>

            <motion.div layout className="grid gap-3">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="hover:bg-accent/40 transition-colors">
                                <CardContent className="p-4 flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                        {typeIcons[item.type] || <File className="w-5 h-5" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 grid gap-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <p className="font-medium truncate text-sm">
                                                    {item.file_name || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Entry`}
                                                </p>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    • {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            {item.status === 'processing' && (
                                                <Badge variant="secondary" className="gap-1.5">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Processing
                                                </Badge>
                                            )}
                                            {item.status === 'indexed' && (
                                                <Badge variant="outline" className="gap-1.5 text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Indexed
                                                </Badge>
                                            )}
                                            {item.status === 'error' && (
                                                <Badge variant="destructive" className="gap-1.5">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Error
                                                </Badge>
                                            )}
                                        </div>

                                        {item.content && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {item.content}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
