'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { KnowledgeItem } from '@/lib/supabase';

interface RecentUploadsProps {
    items: KnowledgeItem[];
}

const typeIcons: Record<string, React.ReactNode> = {
    text: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    audio: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    ),
    pdf: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    ),
};

const statusColors: Record<string, string> = {
    processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    indexed: 'bg-green-500/20 text-green-400 border-green-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function RecentUploads({ items }: RecentUploadsProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-400 mb-1">No Knowledge Yet</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                    Start dumping knowledge using the input below. Add text, record voice notes, or upload files.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>Recent Uploads</span>
                <span className="text-xs font-normal bg-slate-700/50 px-2 py-0.5 rounded-full text-slate-400">
                    {items.length} items
                </span>
            </h2>

            <motion.div layout className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass rounded-xl p-4 group hover:shadow-glow transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                {/* Type Icon */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.status === 'indexed'
                                        ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400'
                                        : 'bg-slate-700/50 text-slate-400'
                                    }`}>
                                    {typeIcons[item.type] || typeIcons.text}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="flex-1 min-w-0">
                                            {item.file_name ? (
                                                <p className="font-medium truncate">{item.file_name}</p>
                                            ) : (
                                                <p className="font-medium capitalize">{item.type} Entry</p>
                                            )}
                                            <p className="text-xs text-slate-500">
                                                {new Date(item.created_at).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`text-xs px-2 py-1 rounded-lg border flex items-center gap-1 ${statusColors[item.status]}`}>
                                            {item.status === 'processing' && (
                                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            )}
                                            {item.status === 'indexed' && (
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {item.status === 'error' && (
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            <span className="capitalize">{item.status}</span>
                                        </span>
                                    </div>

                                    {/* Content Preview */}
                                    {item.content && (
                                        <p className="text-sm text-slate-400 line-clamp-2 mt-2">
                                            {item.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
