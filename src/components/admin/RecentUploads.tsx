'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { KnowledgeItem } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Music, File, CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react';
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
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-zinc-900 bg-zinc-950/50">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-zinc-600" />
                </div>
                <h3 className="text-zinc-300 font-medium mb-1">No Activity Yet</h3>
                <p className="text-sm text-zinc-500 max-w-sm">
                    Recent syncs and uploads will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-6">
                <Clock className="w-4 h-4 text-zinc-500" />
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
                    Recent Sync Activity
                </h2>
            </div>

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="bg-zinc-900/20 border-zinc-800/40 hover:bg-zinc-900/40 transition-colors group">
                                <div className="p-4 pb-0 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-indigo-400/80 group-hover:text-indigo-400 transition-colors shrink-0 group/icon">
                                            {/* Icon wrapper for hover effect */}
                                            <div className="group-hover/icon:scale-110 group-hover/icon:rotate-3 transition-transform duration-300">
                                                {typeIcons[item.type] || <File className="w-4 h-4" />}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold text-zinc-200 line-clamp-1 group/title cursor-pointer hover:text-white transition-colors">
                                                    {item.file_name || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Entry`}
                                                </h4>
                                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-zinc-800 rounded shrink-0 text-zinc-500 hover:text-zinc-300 group/edit">
                                                    <svg className="w-3 h-3 group-hover/edit:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] text-zinc-500 font-medium tracking-wide italic">
                                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true }).replace('about ', '')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-zinc-950/50 border-zinc-800 text-[10px] text-zinc-600 font-mono tracking-wider shrink-0 ml-4">
                                        {`#KT-${String(items.length - index).padStart(2, '0')}`}
                                    </Badge>
                                </div>
                                <div className="px-4 pb-4 pt-2">
                                    <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 pl-[2.75rem]">
                                        {item.content || "No preview available for this item."}
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div >
        </div >
    );
}
