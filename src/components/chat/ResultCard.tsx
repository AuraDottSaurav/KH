'use client';

import { motion } from 'framer-motion';

export interface DisambiguationOption {
    id: string;
    title: string;
    preview: string;
}

interface ResultCardProps {
    option: DisambiguationOption;
    onSelect: (option: DisambiguationOption) => void;
}

export default function ResultCard({ option, onSelect }: ResultCardProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option)}
            className="w-full text-left p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-purple-500/50 transition-all group"
        >
            <h4 className="font-semibold text-white group-hover:text-purple-300 mb-1 line-clamp-1">
                {option.title}
            </h4>
            <p className="text-sm text-slate-400 line-clamp-2">
                {option.preview}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </motion.button>
    );
}
