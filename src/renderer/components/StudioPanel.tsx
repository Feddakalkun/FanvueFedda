'use client';

import { useState } from 'react';
import { X, Settings, Zap, RefreshCw, Share2, Image as ImageIcon, Video, Trash2, Sparkles, LayoutGrid, Lock, Unlock, Users, Eye } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SCENE_LIBRARY, Scene } from '@/lib/scene-library';

interface StudioPanelProps {
    activeCharacter: any;
    studioMode: 'image' | 'video' | 'swap' | 'duo';
    setStudioMode: (m: 'image' | 'video' | 'swap' | 'duo') => void;
    characters: any[];
    isGenerating: boolean;
    isSwapping: boolean;
    isPosting: boolean;
    isCaptioning: boolean;
    comfyStatus: { status: string; nodeTitle?: string; queueCount?: number } | null;
    previewAsset: { url: string; type: 'image' | 'video' } | null;
    sessionAssets: { type: 'image' | 'video'; url: string; timestamp: number }[];
    curatedAssets: { url: string; caption: string }[];
    selectedReference: { url: string; caption: string } | null;
    setSelectedReference: (v: { url: string; caption: string } | null) => void;
    selectedTrend: any;
    setSelectedTrend: (v: any) => void;
    trends: any[];
    selectedScene: Scene | null;
    setSelectedScene: (v: Scene | null) => void;
    customScenePrompt: string;
    setCustomScenePrompt: (v: string) => void;
    videoConfig: any;
    setVideoConfig: (v: any) => void;
    swapPrompt: string;
    setSwapPrompt: (v: string) => void;
    lastGeneratedPrompt: string;
    setActiveCharacter: (c: any) => void;
    setIsCreating: (v: boolean) => void;
    setIsEditing: (v: string | null) => void;
    setSelectedLoras: (v: any) => void;
    setNewPersona: (v: any) => void;
    setFullScreenAsset: (v: { url: string; type: 'image' | 'video' } | null) => void;
    setActiveTab: (tab: string) => void;
    onGeneratePreview: () => void;
    onGenerateVideo: () => void;
    onClothesSwap: () => void;
    onDeleteAsset: (i: number) => void;
    onPostToTikTok: (url: string) => void;
    onGenerateDuo: (cfg: any) => void;
}

export default function StudioPanel(props: StudioPanelProps) {
    const {
        activeCharacter, characters, studioMode, setStudioMode,
        isGenerating, isSwapping, isPosting, comfyStatus,
        previewAsset, sessionAssets, curatedAssets,
        selectedReference, setSelectedReference,
        selectedTrend, setSelectedTrend, trends,
        customScenePrompt, setCustomScenePrompt,
        videoConfig, setVideoConfig, swapPrompt, setSwapPrompt,
        setActiveCharacter, setIsCreating, setIsEditing, setSelectedLoras, setNewPersona,
        setFullScreenAsset, setActiveTab,
        onGeneratePreview, onGenerateVideo, onClothesSwap, onDeleteAsset, onPostToTikTok,
        onGenerateDuo,
    } = props;

    // DUO state
    const [duoChar1, setDuoChar1] = useState<any>(null);
    const [duoChar2, setDuoChar2] = useState<any>(null);
    const [duoPrompt, setDuoPrompt] = useState('');
    const [duoMaskTarget, setDuoMaskTarget] = useState<'left' | 'right'>('left');
    const [duoSeed, setDuoSeed] = useState<number>(Math.floor(Math.random() * 999999999));
    const [duoSeedLocked, setDuoSeedLocked] = useState(false);
    const [duoChar1Strength, setDuoChar1Strength] = useState(1.0);
    const [duoChar2Strength, setDuoChar2Strength] = useState(0.85);
    const [duoPreviewPass1, setDuoPreviewPass1] = useState<string | null>(null);
    const [duoPreviewMask, setDuoPreviewMask] = useState<string | null>(null);
    const [isDuoPreviewing, setIsDuoPreviewing] = useState(false);
    const [isDuoGenerating, setIsDuoGenerating] = useState(false);

    const handleDuoPreview = async () => {
        if (!duoChar1 || !duoChar2) return;
        setIsDuoPreviewing(true);
        setDuoPreviewPass1(null);
        setDuoPreviewMask(null);
        try {
            const res = await fetch('/api/generate/duo/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    char1: duoChar1, char2: duoChar2,
                    prompt: duoPrompt, maskTarget: duoMaskTarget,
                    seed: duoSeedLocked ? duoSeed : null,
                    char1Strength: duoChar1Strength,
                    char2Strength: duoChar2Strength,
                }),
            });
            const data = await res.json();
            if (data.pass1Image) {
                setDuoPreviewPass1(data.pass1Image);
                setDuoPreviewMask(data.maskImage);
                if (!duoSeedLocked) setDuoSeed(data.seed);
            } else {
                alert('Preview failed: ' + (data.error || 'Unknown'));
            }
        } catch { alert('Preview connection failed'); }
        finally { setIsDuoPreviewing(false); }
    };

    const handleDuoGenerate = () => {
        if (!duoChar1 || !duoChar2) return;
        onGenerateDuo({
            char1: duoChar1, char2: duoChar2,
            prompt: duoPrompt, maskTarget: duoMaskTarget,
            seed: duoSeed, char1Strength: duoChar1Strength,
            char2Strength: duoChar2Strength,
        });
    };

    const VIBE_GROUPS = [
        { group: 'Social', vibes: ['Viral SoMe / Turnon', 'TikTok Mirror Selfie', 'Vintage Disposable Film', 'Scandi Y2K Style'] },
        { group: 'Lifestyle', vibes: ['Natural Window Light', 'Messy Morning Bedroom', 'Cozy Apartment Snap'] },
        { group: 'Visuals', vibes: ['Passport Studio', 'High-Contrast Flash', 'Studio Professional', 'Neon Night Street'] },
        { group: 'Intimate', vibes: ['Lace & Silk Detail', 'Minimalist Lingerie', 'Mood Kink / Leather'] },
    ];

    const EXPRESSIONS = ['Neutral', 'Smiling', 'Serious', 'Ahegao', 'Pouting', 'Wink'];

    return (
        <motion.div key="studio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-[85vh] grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-8 h-full overflow-y-auto pr-4 custom-scrollbar pb-10">

                {/* Active Persona */}
                <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 italic">Active Persona</h3>
                        <span className="text-xs font-black text-white/30 uppercase">{(characters as any).length} Active</span>
                    </div>
                    <div className="bg-black border border-white/10 rounded-2xl p-4 flex items-center justify-between group">
                        <div className="flex flex-col">
                            <span className="font-bold text-white uppercase italic text-lg">{activeCharacter?.name}</span>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{activeCharacter?.handle}</span>
                        </div>
                        <button
                            onClick={() => {
                                if (!activeCharacter) return;
                                setIsEditing(activeCharacter.id);
                                setNewPersona({
                                    name: activeCharacter.name,
                                    handle: activeCharacter.handle,
                                    bio: activeCharacter.bio,
                                    loraMix: activeCharacter.loraMix,
                                    looksDescription: activeCharacter.looksDescription || '',
                                    platformSettings: activeCharacter.platformSettings,
                                    attributes: activeCharacter.attributes,
                                });
                                const mix = (activeCharacter.loraMix || '').split(', ').filter(Boolean).map((l: string) => {
                                    const [name, strength] = l.split(':');
                                    return { name, strength: parseFloat(strength) || 1.0 };
                                });
                                setSelectedLoras(mix);
                                setIsCreating(true);
                            }}
                            className="bg-white/10 hover:bg-white text-white hover:text-black transition-all px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
                        >
                            <Settings className="w-3 h-3" /> Edit Profile
                        </button>
                    </div>
                    <button
                        onClick={() => setActiveTab('Workspace')}
                        className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white hover:border-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest italic"
                    >
                        <LayoutGrid className="w-4 h-4" /> Go Back to Hub
                    </button>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-4 gap-2 p-2 bg-white/5 rounded-[24px] border border-white/10">
                    {(['image', 'video', 'swap', 'duo'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setStudioMode(mode)}
                            className={cn(
                                'py-4 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5',
                                studioMode === mode ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:text-white',
                                mode === 'duo' && studioMode !== 'duo' ? 'text-purple-400/60 hover:text-purple-300' : ''
                            )}
                        >
                            {mode === 'duo' && <Users className="w-3 h-3" />}
                            {mode}
                        </button>
                    ))}
                </div>

                {/* IMAGE MODE */}
                {studioMode === 'image' && (
                    <div className="space-y-6">
                        {/* Identity Archetype */}
                        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">1. Character Identity Archetype</h3>
                                <ImageIcon className="w-3 h-3 text-white/20" />
                            </div>
                            {curatedAssets.length > 0 && (
                                <div className="space-y-4">
                                    <select
                                        className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white/80 outline-none cursor-pointer hover:border-white/20 transition-all"
                                        value={selectedReference?.url || ''}
                                        onChange={e => {
                                            const asset = curatedAssets.find(a => a.url === e.target.value);
                                            setSelectedReference(asset || null);
                                        }}
                                    >
                                        <option value="">Universal Character Likeness</option>
                                        {curatedAssets.map((asset, idx) => (
                                            <option key={idx} value={asset.url}>
                                                {asset.caption ? (asset.caption.length > 40 ? asset.caption.substring(0, 40) + '...' : asset.caption) : `Reference ${idx + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                    <AnimatePresence mode="wait">
                                        {selectedReference && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shadow-2xl">
                                                    <Sparkles className="w-4 h-4 text-white/20" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-white/40 italic line-clamp-3 leading-relaxed">&ldquo;{selectedReference.caption || 'No caption available'}&rdquo;</p>
                                                </div>
                                                <button onClick={() => setSelectedReference(null)} className="p-1 hover:bg-white/10 rounded-md transition-all">
                                                    <X className="w-3 h-3 text-white/20" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Scene Styling */}
                        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">2. Scene Styling & Description</h3>
                                <Zap className="w-3 h-3 text-white/20" />
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Vibe Preset</label>
                                        <select
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none cursor-pointer focus:border-white/30"
                                            value={activeCharacter?.attributes?.vibe || ''}
                                            onChange={e => setActiveCharacter((prev: any) => ({ ...prev, attributes: { ...prev.attributes, vibe: e.target.value } }))}
                                        >
                                            <option value="">Freestyle Description</option>
                                            {VIBE_GROUPS.map(grp => (
                                                <optgroup key={grp.group} label={grp.group}>
                                                    {grp.vibes.map(v => <option key={v} value={v}>{v}</option>)}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Subject Expression</label>
                                        <select
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none cursor-pointer focus:border-white/30"
                                            value={activeCharacter?.attributes?.expression || 'Neutral'}
                                            onChange={e => setActiveCharacter((prev: any) => ({ ...prev, attributes: { ...prev.attributes, expression: e.target.value } }))}
                                        >
                                            {EXPRESSIONS.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Motion Trend</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none cursor-pointer focus:border-white/30"
                                        value={selectedTrend?.id || ''}
                                        onChange={e => {
                                            const t = trends.find((tr: any) => tr.id === e.target.value);
                                            setSelectedTrend(t || null);
                                        }}
                                    >
                                        <option value="">No Trend</option>
                                        {trends.map((trend: any) => <option key={trend.id} value={trend.id}>{trend.title || trend.hashtag}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Custom Description / Outfit</label>
                                    <textarea
                                        placeholder="Describe the specific outfit, action, or surroundings..."
                                        className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-xs font-medium text-white/70 outline-none focus:border-white/30 transition-all min-h-[120px] resize-none scrollbar-hide"
                                        value={customScenePrompt}
                                        onChange={e => setCustomScenePrompt(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onGeneratePreview}
                            disabled={isGenerating || !activeCharacter}
                            className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-sm hover:invert transition-all active:scale-95 shadow-xl shadow-white/5"
                        >
                            {isGenerating ? 'Synthesizing...' : 'Snap Portrait'}
                        </button>
                    </div>
                )}

                {/* DUO MODE */}
                {studioMode === 'duo' && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 p-6 rounded-[32px] border border-purple-500/20 space-y-2">
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-purple-400" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">DUO — Dual Character Generation</h3>
                            </div>
                            <p className="text-[9px] text-white/30 leading-relaxed">
                                Pass 1 generates the scene. Florence2 + SAM2 masks one character. Pass 2 inpaints with Character 2's LoRA.
                            </p>
                        </div>

                        {/* Character Selectors */}
                        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Characters</h3>
                            {/* Char 1 */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[7px]">1</span>
                                    Primary Character (Pass 1 Base)
                                </label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none cursor-pointer focus:border-white/30"
                                    value={duoChar1?.id || ''}
                                    onChange={e => setDuoChar1((characters as any[]).find(c => c.id === e.target.value) || null)}
                                >
                                    <option value="">Select Character 1...</option>
                                    {(characters as any[]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <div className="flex items-center gap-3">
                                    <label className="text-[8px] text-white/20 uppercase tracking-widest w-20">Strength</label>
                                    <input type="range" min="0.5" max="1.5" step="0.05"
                                        value={duoChar1Strength}
                                        onChange={e => setDuoChar1Strength(parseFloat(e.target.value))}
                                        className="flex-1 accent-white"
                                    />
                                    <span className="text-[9px] font-black text-white/40 w-8 text-right">{duoChar1Strength.toFixed(2)}</span>
                                </div>
                            </div>
                            {/* Char 2 */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-purple-500/40 flex items-center justify-center text-[7px]">2</span>
                                    Inpainted Character (Pass 2)
                                </label>
                                <select
                                    className="w-full bg-black/40 border border-purple-500/20 rounded-xl p-3 text-[10px] font-bold text-white outline-none cursor-pointer focus:border-purple-400/50"
                                    value={duoChar2?.id || ''}
                                    onChange={e => setDuoChar2((characters as any[]).find(c => c.id === e.target.value) || null)}
                                >
                                    <option value="">Select Character 2...</option>
                                    {(characters as any[]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <div className="flex items-center gap-3">
                                    <label className="text-[8px] text-white/20 uppercase tracking-widest w-20">Strength</label>
                                    <input type="range" min="0.5" max="1.5" step="0.05"
                                        value={duoChar2Strength}
                                        onChange={e => setDuoChar2Strength(parseFloat(e.target.value))}
                                        className="flex-1 accent-purple-400"
                                    />
                                    <span className="text-[9px] font-black text-white/40 w-8 text-right">{duoChar2Strength.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Scene Prompt */}
                        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Scene Description</h3>
                            <textarea
                                placeholder={`Describe the shared scene for both characters...`}
                                className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white/70 outline-none focus:border-white/30 transition-all min-h-[100px] resize-none"
                                value={duoPrompt}
                                onChange={e => setDuoPrompt(e.target.value)}
                            />
                        </div>

                        {/* Mask Target + Seed */}
                        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Mask & Seed Settings</h3>

                            {/* Mask Target */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">
                                    Which person gets replaced by Char 2?
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['left', 'right'] as const).map(pos => (
                                        <button
                                            key={pos}
                                            onClick={() => setDuoMaskTarget(pos)}
                                            className={cn(
                                                'py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border',
                                                duoMaskTarget === pos
                                                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                                    : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'
                                            )}
                                        >
                                            {pos} person
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Seed Lock */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Seed</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={duoSeed}
                                        onChange={e => setDuoSeed(parseInt(e.target.value) || 0)}
                                        disabled={!duoSeedLocked}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-mono text-white outline-none disabled:opacity-40 focus:border-white/30"
                                    />
                                    <button
                                        onClick={() => {
                                            setDuoSeedLocked(!duoSeedLocked);
                                            if (!duoSeedLocked) setDuoSeed(Math.floor(Math.random() * 999999999));
                                        }}
                                        className={cn(
                                            'p-3 rounded-xl border transition-all flex-shrink-0',
                                            duoSeedLocked
                                                ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                                                : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'
                                        )}
                                        title={duoSeedLocked ? 'Seed locked — same composition every time' : 'Seed unlocked — random each generation'}
                                    >
                                        {duoSeedLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    </button>
                                </div>
                                {duoSeedLocked && (
                                    <p className="text-[8px] text-yellow-400/60 ml-1">🔒 Locked — same composition, only mask/pass2 varies</p>
                                )}
                            </div>
                        </div>

                        {/* Mask Preview Result */}
                        <AnimatePresence>
                            {(duoPreviewPass1 || isDuoPreviewing) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white/5 p-4 rounded-[24px] border border-white/10 space-y-3"
                                >
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Mask Preview</h3>
                                    {isDuoPreviewing ? (
                                        <div className="flex items-center justify-center py-8 gap-3">
                                            <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
                                            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Generating + masking...</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <p className="text-[7px] text-white/20 uppercase tracking-widest">Pass 1 — Base</p>
                                                <img src={duoPreviewPass1!} className="w-full rounded-xl border border-white/10" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[7px] text-purple-400/60 uppercase tracking-widest">SAM2 Mask ({duoMaskTarget})</p>
                                                <img src={duoPreviewMask!} className="w-full rounded-xl border border-purple-500/20" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleDuoPreview}
                                disabled={!duoChar1 || !duoChar2 || isDuoPreviewing || isDuoGenerating}
                                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all font-black uppercase tracking-widest text-xs disabled:opacity-40"
                            >
                                <Eye className="w-4 h-4" />
                                {isDuoPreviewing ? 'Generating Preview...' : 'Preview Mask'}
                            </button>
                            <button
                                onClick={handleDuoGenerate}
                                disabled={!duoChar1 || !duoChar2 || isDuoPreviewing || isDuoGenerating || isGenerating}
                                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-sm hover:brightness-125 transition-all active:scale-95 shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 disabled:opacity-40"
                            >
                                <Users className="w-5 h-5" />
                                {isGenerating ? 'Generating DUO...' : 'Generate DUO'}
                            </button>
                        </div>
                    </div>
                )}

                {/* VIDEO MODE */}
                {studioMode === 'video' && (
                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 space-y-8">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 italic">Video Config</h3>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-white/40 uppercase">Core Model</label>
                            <select
                                value={videoConfig.model}
                                onChange={e => setVideoConfig((p: any) => ({ ...p, model: e.target.value }))}
                                className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none cursor-pointer"
                            >
                                <option>LTX-2 Distill (19B)</option>
                                <option>Wan 2.1 I2V (14B)</option>
                            </select>
                        </div>
                        {videoConfig.model.includes('LTX-2') && (
                            <>
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-white/40 uppercase">AV Prompt (Motion & Audio)</label>
                                    <textarea
                                        value={videoConfig.prompt}
                                        onChange={e => setVideoConfig((p: any) => ({ ...p, prompt: e.target.value }))}
                                        placeholder={"Describe exactly what happens and what they say."}
                                        className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-medium text-white/80 min-h-[160px] outline-none resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-white/40 uppercase">Resolution</label>
                                        <select value={videoConfig.resolution} onChange={e => setVideoConfig((p: any) => ({ ...p, resolution: e.target.value }))} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none cursor-pointer">
                                            <option value="512">512p</option>
                                            <option value="720">720p</option>
                                            <option value="1024">1024p</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-white/40 uppercase">Length</label>
                                        <select value={videoConfig.duration} onChange={e => setVideoConfig((p: any) => ({ ...p, duration: parseInt(e.target.value) }))} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none cursor-pointer">
                                            <option value="4">4s</option>
                                            <option value="8">8s</option>
                                            <option value="12">12s</option>
                                            <option value="16">16s</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                        <button onClick={onGenerateVideo} disabled={isGenerating || !previewAsset} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-sm hover:invert transition-all active:scale-95 flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-3">
                                {isGenerating ? comfyStatus?.nodeTitle || 'Synthesizing...' : 'Generate Video'} <Zap className="w-5 h-5 fill-current" />
                            </div>
                            {isGenerating && comfyStatus?.queueCount && comfyStatus.queueCount > 1 && (
                                <span className="text-[8px] font-black opacity-40 italic">Queue Depth: {comfyStatus.queueCount}</span>
                            )}
                        </button>
                    </div>
                )}

                {/* SWAP MODE */}
                {studioMode === 'swap' && (
                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 space-y-8">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 italic">Virtual Try-On</h3>
                        <textarea
                            value={swapPrompt}
                            onChange={e => setSwapPrompt(e.target.value)}
                            placeholder="Describe the new outfit..."
                            className="w-full bg-black border border-white/10 rounded-2xl p-6 text-sm font-medium italic min-h-[150px] outline-none focus:border-white/30 text-white/80"
                        />
                        <button onClick={onClothesSwap} disabled={isSwapping || !previewAsset} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-sm hover:invert transition-all">
                            {isSwapping ? 'Swapping Outfit...' : 'Perform Swap'}
                        </button>
                    </div>
                )}
            </div>

            {/* Canvas / Session Assets */}
            <div className="lg:col-span-7 flex flex-col gap-6 h-[85vh] overflow-y-auto custom-scrollbar pb-10">
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
                    {isGenerating && (
                        <div className="w-full aspect-[3/4] bg-white/[0.02] border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 animate-pulse break-inside-avoid shadow-lg">
                            <RefreshCw className="w-6 h-6 text-white animate-spin" />
                            <div className="text-center px-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/50 italic block mb-1">
                                    {comfyStatus?.nodeTitle || 'Initializing Engine...'}
                                </span>
                                {comfyStatus?.queueCount && comfyStatus.queueCount > 1 && (
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20">Queue Position: {comfyStatus.queueCount - 1}</span>
                                )}
                            </div>
                        </div>
                    )}
                    {sessionAssets.map((asset, i) => (
                        <div key={i} className="relative group break-inside-avoid">
                            <button
                                onClick={() => setFullScreenAsset({ type: asset.type, url: asset.url })}
                                className="w-full block bg-white/[0.02] border border-white/5 group-hover:border-white/20 rounded-2xl overflow-hidden transition-all shadow-md focus:outline-none"
                            >
                                {asset.type === 'video' ? (
                                    <div className="relative">
                                        <video src={asset.url} className="w-full h-auto object-cover" autoPlay loop muted playsInline />
                                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md p-2 rounded-full">
                                            <Video className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <img src={asset.url} className="w-full h-auto object-cover" loading="lazy" />
                                )}
                            </button>
                            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                <button
                                    onClick={e => { e.stopPropagation(); onPostToTikTok(asset.url); }}
                                    disabled={isPosting}
                                    className="p-3 bg-black/80 backdrop-blur-xl rounded-2xl text-white hover:text-blue-400 border border-white/10 transition-all shadow-2xl"
                                >
                                    {isPosting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); onDeleteAsset(i); }}
                                    className="p-3 bg-black/80 backdrop-blur-xl rounded-2xl text-white hover:text-red-500 border border-white/10 transition-all shadow-2xl"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
