'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal, Plus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryCardProps {
    story: {
        id: string;
        title: string;
        caption: string;
        scene: string;
        mood: string;
    };
    onSelect: (story: any) => void;
}

export default function StoryCard({ story, onSelect }: StoryCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative bg-[#0a0a0a] hover:bg-[#0f0f0f] border border-white/[0.05] hover:border-white/[0.1] p-10 rounded-[32px] transition-all duration-300 cursor-pointer flex flex-col gap-6"
            onClick={() => onSelect(story)}
        >
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-indigo-400 transition-colors">
                    {story.mood}
                </span>
                <button className="p-2 hover:bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal className="w-4 h-4 text-white/20" />
                </button>
            </div>

            <div className="space-y-2">
                <h4 className="text-2xl font-black tracking-tight group-hover:translate-x-1 transition-transform">{story.title}</h4>
                <p className="text-white/40 text-sm font-medium line-clamp-2 leading-relaxed italic">"{story.caption}"</p>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-indigo-500"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Ready for generation</span>
                </div>
                <Zap className="w-4 h-4 text-white/5 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
            </div>
        </motion.div>
    );
}
