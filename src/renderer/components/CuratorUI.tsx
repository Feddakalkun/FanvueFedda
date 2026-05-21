'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Image as ImageIcon, CheckCircle2, ChevronRight, Save, Search, X, Loader2, Sparkles, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterFolder {
    path: string;
    count: number;
    images: string[];
    category: string;
}

export default function CuratorUI() {
    const [folders, setFolders] = useState<Record<string, CharacterFolder[]>>({});
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [selection, setSelection] = useState<Record<string, string[]>>({});
    const [isScanning, setIsScanning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        scanFolders();
    }, []);

    const scanFolders = async () => {
        setIsScanning(true);
        try {
            const res = await fetch('/api/curate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'scan' })
            });
            const data = await res.json();
            setFolders(data);
            // Auto-select first folder with results
            const first = Object.keys(data)[0];
            if (first) setActiveGroup(first);
        } catch (e) {
            console.error('Scan failed');
        } finally {
            setIsScanning(false);
        }
    };

    const toggleImage = (folder: string, img: string) => {
        const fullPath = `${folder}\\${img}`;
        setSelection(prev => {
            const current = prev[folder] || [];
            if (current.includes(fullPath)) {
                return { ...prev, [folder]: current.filter(p => p !== fullPath) };
            }
            return { ...prev, [folder]: [...current, fullPath] };
        });
    };

    const handleSave = async (folder: string) => {
        const files = (selection[folder] || []).map(p => ({ source: p }));
        if (files.length === 0) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/curate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save',
                    folder,
                    files
                })
            });
            if (res.ok) {
                alert(`Saved ${files.length} assets to /assets/curated/${folder}`);
                setSelection(prev => ({ ...prev, [folder]: [] }));
            }
        } catch (e) {
            alert('Save failed');
        } finally {
            setIsSaving(false);
        }
    };

    if (isScanning) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-white/20 font-black uppercase tracking-[0.4em] italic animate-pulse">Scanning Neural Archives...</p>
            </div>
        );
    }

    const sortedGroups = Object.keys(folders).sort();

    return (
        <div className="grid grid-cols-12 gap-8 h-[80vh]">
            {/* Sidebar: Character list */}
            <div className="col-span-12 lg:col-span-3 space-y-4 overflow-y-auto custom-scrollbar pr-4">
                <div className="sticky top-0 bg-black/80 backdrop-blur-xl z-10 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Identities Found ({sortedGroups.length})</h3>
                        <button onClick={scanFolders} className="p-2 hover:bg-white/5 rounded-lg transition-all"><Loader2 className="w-3 h-3 text-white/20" /></button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                            placeholder="Filter..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:border-white/20"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    {sortedGroups.map(name => (
                        <button
                            key={name}
                            onClick={() => setActiveGroup(name)}
                            className={cn(
                                "w-full group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border",
                                activeGroup === name
                                    ? "bg-primary/20 border-primary/40 shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                                    : "bg-white/[0.02] border-white/5 hover:border-white/20"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    activeGroup === name ? "bg-primary text-white" : "bg-white/5 text-white/20"
                                )}>
                                    <Folder className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <span className={cn(
                                        "block text-[11px] font-black uppercase tracking-tight italic",
                                        activeGroup === name ? "text-white" : "text-white/40"
                                    )}>{name}</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/10 italic">
                                        {folders[name].reduce((acc, curr) => acc + curr.count, 0)} Assets
                                    </span>
                                </div>
                            </div>
                            {selection[name]?.length > 0 && (
                                <div className="px-2 py-1 bg-white text-black text-[8px] font-black rounded-full italic">
                                    +{selection[name].length}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content: Image grid */}
            <div className="col-span-12 lg:col-span-9 bg-white/[0.02] border border-white/5 rounded-[40px] p-8 flex flex-col gap-8 overflow-hidden">
                {activeGroup ? (
                    <>
                        <div className="flex items-center justify-between px-4">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{activeGroup}</h2>
                                <div className="flex gap-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Curating from {folders[activeGroup].length} source locations</span>
                                </div>
                            </div>

                            <AnimatePresence>
                                {(selection[activeGroup]?.length || 0) > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onClick={() => handleSave(activeGroup)}
                                        disabled={isSaving}
                                        className="bg-white text-black px-8 py-3 rounded-full flex items-center gap-4 text-[10px] font-black uppercase tracking-widest hover:invert transition-all shadow-xl shadow-white/5"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Curation Complete ({selection[activeGroup].length})
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-12">
                            {folders[activeGroup].map((loc, idx) => (
                                <div key={idx} className="space-y-4">
                                    <div className="flex items-center gap-4 px-4 opacity-30">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap italic">{loc.category}: {loc.path.split('\\').pop()}</span>
                                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
                                        {loc.images.map(img => {
                                            const fullPath = `${loc.path}\\${img}`;
                                            const isSelected = selection[activeGroup]?.includes(fullPath);
                                            return (
                                                <button
                                                    key={img}
                                                    onClick={() => toggleImage(activeGroup, img)}
                                                    className={cn(
                                                        "relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 group ring-offset-2 ring-offset-black bg-white/[0.03]",
                                                        isSelected ? "ring-2 ring-white scale-95" : "hover:scale-[1.05]"
                                                    )}
                                                >
                                                    <img
                                                        src={`/api/curate/view?path=${encodeURIComponent(fullPath)}`}
                                                        alt={img}
                                                        className={cn(
                                                            "w-full h-full object-cover transition-opacity duration-500",
                                                            isSelected ? "opacity-40" : "opacity-100 group-hover:opacity-80"
                                                        )}
                                                        loading="lazy"
                                                    />

                                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[6px] font-black truncate text-white uppercase tracking-widest block">{img}</span>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <CheckCircle2 className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-6 opacity-20">
                        <Sparkles className="w-16 h-16" />
                        <p className="text-xs font-black uppercase tracking-[0.4em] italic">Select an identity to begin curation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
