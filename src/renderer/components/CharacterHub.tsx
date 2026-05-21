'use client';

import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Character {
    id: string;
    name: string;
    handle: string;
    previewUrl?: string | null;
    fanvueConnected?: boolean;
}

interface CharacterHubProps {
    characters: Character[];
    activeCharacter: Character | null;
    onSelectCharacter: (char: Character) => void;
    onCreateNew: () => void;
    onDelete: (id: string) => void;
}

export default function CharacterHub({
    characters,
    activeCharacter,
    onSelectCharacter,
    onCreateNew,
    onDelete,
}: CharacterHubProps) {
    return (
        <div className="space-y-16">
            <header className="flex justify-between items-end">
                <div className="space-y-4">
                    <h2 className="text-6xl font-black tracking-tighter italic uppercase">Persona Hub</h2>
                    <p className="text-white/40 text-xl font-medium max-w-xl leading-relaxed italic">
                        Select or create a new character to manage.
                    </p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="bg-white text-black px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-6 hover:invert transition-all active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                    Create Character <Plus className="w-4 h-4" />
                </button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {/* New Character Tile */}
                <button
                    onClick={onCreateNew}
                    className="aspect-square glass-card bg-white/[0.01] border-white/5 border-dashed border-2 !rounded-[48px] flex flex-col items-center justify-center gap-4 group hover:border-white/20 hover:bg-white/[0.03] transition-all"
                >
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <h4 className="font-black italic text-base uppercase leading-none mb-1">New Character</h4>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Build identity</p>
                    </div>
                </button>

                {/* Character Cards — div instead of button to avoid nested button hydration error */}
                {characters.map(char => (
                    <div
                        key={char.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectCharacter(char)}
                        onKeyDown={e => e.key === 'Enter' && onSelectCharacter(char)}
                        className={cn(
                            'aspect-square glass-card flex flex-col items-start justify-end group transition-all !rounded-[48px] border border-white/5 text-left relative overflow-hidden cursor-pointer',
                            activeCharacter?.id === char.id
                                ? 'ring-2 ring-white/20 border-white/40 shadow-[0_0_40px_rgba(255,255,255,0.1)]'
                                : 'hover:scale-[1.02]'
                        )}
                    >
                        {/* Portrait */}
                        <div className="absolute inset-0 z-0">
                            {char.previewUrl && !char.previewUrl.includes('/assets/curated/') && !char.previewUrl.startsWith('data:image') ? (
                                <>
                                    <img
                                        src={char.previewUrl}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        alt={char.name}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                                </>
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-white/[0.03] to-white/[0.01] flex items-center justify-center italic font-black text-white/5 text-8xl">
                                    {char.name?.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                onDelete(char.id);
                            }}
                            className="absolute top-6 right-6 z-20 p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all border border-red-500/20 shadow-[0_10px_30px_rgba(239,68,68,0.2)] backdrop-blur-md"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Info */}
                        <div className="relative z-10 p-8 w-full space-y-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/40 italic flex items-center gap-1.5">
                                    <div className={cn('w-1.5 h-1.5 rounded-full', char.fanvueConnected ? 'bg-green-500' : 'bg-white/20')} />
                                    {char.fanvueConnected ? 'Connected' : 'Offline'}
                                </span>
                            </div>
                            <h4 className="font-black italic text-xl uppercase leading-none tracking-tight group-hover:translate-x-1 transition-transform">
                                {char.name}
                            </h4>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 italic">{char.handle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
