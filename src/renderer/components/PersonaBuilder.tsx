'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Zap, Sparkles, RefreshCw, Rocket,
    Image as ImageIcon, Plus, Cpu, Shuffle, Trash2,
    Cloud, Music2, Instagram, Twitter, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VIBE_PRESETS } from '@/lib/vibe-presets';

interface LoraEntry { name: string; strength: number; }

interface PersonaBuilderProps {
    isEditing: string | null;
    newPersona: any;
    setNewPersona: (v: any) => void;
    selectedLoras: LoraEntry[];
    setSelectedLoras: (v: LoraEntry[]) => void;
    availableLoras: string[];
    targetStrength: number;
    setTargetStrength: (v: number) => void;
    previewAsset: { url: string; type: 'image' | 'video' } | null;
    isGenerating: boolean;
    isCaptioning: boolean;
    comfyStatus: { status: string; nodeTitle?: string; queueCount?: number } | null;
    lastGeneratedPrompt: string;
    globalConfig: any;
    onClose: () => void;
    onGeneratePreview: () => void;
    onCaptionImage: () => void;
    onRandomizeMix: () => void;
    onSave: (e: React.FormEvent) => void;
    onOpenSettings: () => void;
}

export default function PersonaBuilder({
    isEditing,
    newPersona, setNewPersona,
    selectedLoras, setSelectedLoras,
    availableLoras,
    targetStrength, setTargetStrength,
    previewAsset,
    isGenerating, isCaptioning,
    comfyStatus,
    lastGeneratedPrompt,
    globalConfig,
    onClose, onGeneratePreview, onCaptionImage,
    onRandomizeMix, onSave, onOpenSettings,
}: PersonaBuilderProps) {
    return (
        <motion.div
            key="builder"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-6xl mx-auto"
        >
            <header className="flex justify-between items-start mb-20">
                <div className="space-y-4">
                    <span className="text-xs font-black uppercase tracking-[0.5em] text-white/20">Identity Creator</span>
                    <h2 className="text-6xl font-black italic tracking-tighter uppercase">
                        {isEditing ? 'Update Character' : 'New Character'}
                    </h2>
                </div>
                <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-8 h-8 text-white/20" />
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Preview Column */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card aspect-[3/4] bg-white/[0.02] border-white/5 !rounded-[48px] overflow-hidden relative flex items-center justify-center group">
                        {previewAsset ? (
                            previewAsset.type === 'video' ? (
                                <video key={previewAsset.url} src={previewAsset.url} className="w-full h-full object-cover" autoPlay loop playsInline controls />
                            ) : (
                                <img src={previewAsset.url} className="w-full h-full object-cover" alt="Preview" />
                            )
                        ) : (
                            <div className="flex flex-col items-center gap-6 text-white/10">
                                <ImageIcon className="w-16 h-16" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic text-center px-10">No preview generated yet</span>
                            </div>
                        )}
                        {isGenerating && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                <RefreshCw className="w-10 h-10 text-white animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic text-center px-6">
                                    {comfyStatus?.nodeTitle || 'Initializing Engine...'}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onGeneratePreview}
                        disabled={isGenerating || isCaptioning}
                        className="w-full py-6 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-white rounded-[32px] transition-all duration-500 flex items-center justify-center gap-4 group"
                    >
                        <Zap className={cn('w-4 h-4', isGenerating ? 'animate-pulse' : 'group-hover:fill-current')} />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">
                            {isGenerating ? comfyStatus?.nodeTitle || 'Synthesizing...' : 'Generate Studio Portrait'}
                        </span>
                    </button>

                    {previewAsset?.type === 'image' && (
                        <button
                            onClick={onCaptionImage}
                            disabled={isCaptioning || isGenerating}
                            className="w-full py-4 mt-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-[24px] transition-all duration-300 flex items-center justify-center gap-3 group"
                        >
                            <Sparkles className={cn('w-4 h-4', isCaptioning ? 'animate-spin' : 'group-hover:scale-110 transition-transform')} />
                            <span className="text-[9px] font-black uppercase tracking-widest italic">
                                {isCaptioning ? 'Analyzing Features...' : 'Caption & Save Appearance'}
                            </span>
                        </button>
                    )}

                    {lastGeneratedPrompt && (
                        <div className="mt-4 p-6 bg-white/[0.02] border border-white/5 rounded-[24px] space-y-3">
                            <div className="flex items-center gap-2 opacity-30">
                                <Rocket className="w-3 h-3" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Active Prompt Context</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-white/50 italic font-medium line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                                {lastGeneratedPrompt}
                            </p>
                        </div>
                    )}

                    <p className="text-[9px] font-black uppercase tracking-widest text-white/10 text-center italic px-4 mt-8">
                        Uses Z-IMAGE workflow to generate a consistent face-reference for this persona.
                    </p>
                </div>

                {/* Identity Column */}
                <div className="lg:col-span-8 space-y-16">
                    <section className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-2 leading-none">Name</label>
                                <input
                                    value={newPersona.name}
                                    onChange={e => setNewPersona({ ...newPersona, name: e.target.value })}
                                    placeholder="e.g. Helena"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-8 text-sm outline-none focus:border-white/30 transition-all italic font-bold"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-2 leading-none">Global Handle</label>
                                <input
                                    value={newPersona.handle}
                                    onChange={e => setNewPersona({ ...newPersona, handle: e.target.value })}
                                    placeholder="@helena_matrix"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-8 text-sm outline-none focus:border-white/30 transition-all font-mono"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-2 leading-none">Bio / Personality</label>
                            <textarea
                                value={newPersona.bio}
                                onChange={e => setNewPersona({ ...newPersona, bio: e.target.value })}
                                rows={3}
                                placeholder="Describe her background and personality..."
                                className="w-full bg-white/5 border border-white/5 rounded-[24px] py-6 px-8 text-sm outline-none focus:border-white/30 transition-all resize-none italic font-medium"
                            />
                        </div>
                    </section>

                    <section className="space-y-8">
                        {/* LoRA Mix */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-2 leading-none">LoRA Mix / Weights</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Total:</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={targetStrength}
                                            onChange={e => setTargetStrength(parseFloat(e.target.value))}
                                            className="w-10 bg-transparent text-[9px] font-bold text-white outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={onRandomizeMix}
                                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 text-[9px] font-black text-white/30 hover:text-white transition-all uppercase tracking-widest"
                                    >
                                        <Shuffle className="w-3 h-3" /> Randomize
                                    </button>
                                    <div className="relative group">
                                        <select
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val && !selectedLoras.find(l => l.name === val)) {
                                                    setSelectedLoras([...selectedLoras, { name: val, strength: 0.5 }]);
                                                }
                                                e.target.value = '';
                                            }}
                                            className="bg-white text-black px-4 py-1.5 pr-8 rounded-xl text-[9px] font-black uppercase tracking-widest appearance-none cursor-pointer"
                                        >
                                            <option value="">Add LoRA</option>
                                            {availableLoras.map(l => (
                                                <option key={l} value={l}>{l.split('/').pop()?.replace('.safetensors', '')}</option>
                                            ))}
                                        </select>
                                        <Plus className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-black pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {selectedLoras.length === 0 && (
                                    <div className="p-10 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3">
                                        <Cpu className="w-6 h-6 text-white/5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/10 italic">No LoRAs selected. Use the "Add LoRA" button.</span>
                                    </div>
                                )}
                                {selectedLoras.map((lora, idx) => (
                                    <div key={lora.name} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-6 group hover:border-white/10 transition-all">
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-[10px] font-bold text-white/60 lowercase italic truncate max-w-[200px]">
                                                    {lora.name.split('/').pop()?.replace('.safetensors', '')}
                                                </span>
                                                <span className="text-[10px] font-black text-white">{lora.strength.toFixed(2)}</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="2" step="0.05"
                                                value={lora.strength}
                                                onChange={e => {
                                                    const newMix = [...selectedLoras];
                                                    newMix[idx].strength = parseFloat(e.target.value);
                                                    setSelectedLoras(newMix);
                                                }}
                                                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setSelectedLoras(selectedLoras.filter(l => l.name !== lora.name))}
                                            className="p-3 text-white/10 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Attributes */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-2 leading-none">Attributes & Aesthetic</label>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { key: 'vibe', placeholder: 'Aesthetic Vibe...', options: Object.keys(VIBE_PRESETS) },
                                    { key: 'expression', placeholder: 'Subject Expression...', options: ['Neutral', 'Smiling', 'Serious', 'Ahegao', 'Pouting', 'Wink'] },
                                    { key: 'ethnicity', placeholder: 'Ethnicity...', options: ['Nordic', 'Mediterranean', 'Slavic', 'Asian', 'Latina', 'Black', 'Mixed', 'Caucasian'] },
                                    { key: 'skinTone', placeholder: 'Skin Tone...', options: ['Pale / Fair', 'Light', 'Tan / Olive', 'Brown', 'Dark', 'Freckled'] },
                                    { key: 'hairStyle', placeholder: 'Hair Style/Color...', options: ['Messy Blonde', 'Long Straight Black', 'Short Bob Brunette', 'Wavy Red', 'Curly Brown', 'Silver Pixie', 'Pink/Dyed'] },
                                    { key: 'bodyType', placeholder: 'Body Build...', options: ['Petite w/ Wide Hips', 'Petite', 'Athletic', 'Curvy', 'Slim', 'Thick', 'Muscular'] },
                                    { key: 'breastSize', placeholder: 'Breast Size...', options: ['Natural A-Cup', 'Small', 'Perky', 'Medium', 'Large', 'Extra Large', 'Natural Heavy'] },
                                ].map(attr => (
                                    <div key={attr.key} className="relative">
                                        <select
                                            value={newPersona.attributes[attr.key as keyof typeof newPersona.attributes]}
                                            onChange={e => setNewPersona((prev: any) => ({
                                                ...prev,
                                                attributes: { ...prev.attributes, [attr.key]: e.target.value }
                                            }))}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-[10px] outline-none focus:border-white/30 transition-all font-bold appearance-none cursor-pointer text-white/80"
                                            style={{ WebkitAppearance: 'none' }}
                                        >
                                            <option value="" disabled className="text-black bg-white">{attr.placeholder}</option>
                                            {attr.options.map(opt => (
                                                <option key={opt} value={opt} className="text-black bg-white">{opt}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Looks Description */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-2 leading-none">Appearance Script (Looks Description)</label>
                            <textarea
                                value={newPersona.looksDescription}
                                onChange={e => setNewPersona({ ...newPersona, looksDescription: e.target.value })}
                                rows={4}
                                placeholder="A stunning young woman in her mid-20s, platinum-blonde wavy hair, icy blue eyes, pale porcelain skin..."
                                className="w-full bg-white/5 border border-white/5 rounded-[24px] py-6 px-8 text-sm outline-none focus:border-white/30 transition-all resize-none italic font-medium"
                            />
                        </div>
                    </section>
                </div>

                {/* Social Connections (full width) */}
                <div className="lg:col-span-12 space-y-16">
                    <section className="space-y-8">
                        <div className="flex items-center gap-4 text-white/20">
                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 text-[10px] font-black">03</div>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em]">Social Connections</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Fanvue */}
                            <div className="p-8 border border-white/10 rounded-[40px] bg-white/[0.02] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                                        <Cloud className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-black italic text-lg uppercase leading-none mb-1">Fanvue</h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">OAuth Integration</p>
                                    </div>
                                </div>
                                <button
                                    onClick={e => {
                                        e.preventDefault();
                                        if (!globalConfig.fanvueClientId) {
                                            alert('Fanvue OAuth is not configured. Please set your Client ID in Settings first.');
                                            onOpenSettings();
                                            return;
                                        }
                                        window.location.href = '/api/auth/fanvue';
                                    }}
                                    className="bg-white text-black px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:invert transition-all active:scale-95 shadow-xl shadow-white/5"
                                >
                                    Link Account
                                </button>
                            </div>

                            {/* Other Platforms */}
                            {[
                                { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'text-pink-500' },
                                { id: 'insta', name: 'Instagram', icon: Instagram, color: 'text-purple-500' },
                                { id: 'x', name: 'X / Twitter', icon: Twitter, color: 'text-blue-500' },
                            ].map(platform => (
                                <div key={platform.id} className="p-8 border border-white/5 rounded-[40px] bg-white/[0.01] space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className={cn('w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 transition-all', platform.color)}>
                                                <platform.icon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h4 className="font-black italic text-lg uppercase leading-none mb-1">{platform.name}</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Credentials Required</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">Use Google Login</span>
                                            <button
                                                onClick={() => setNewPersona((prev: any) => ({
                                                    ...prev,
                                                    platformSettings: {
                                                        ...prev.platformSettings,
                                                        [platform.id]: {
                                                            ...prev.platformSettings[platform.id],
                                                            googleAuth: !prev.platformSettings[platform.id].googleAuth,
                                                        },
                                                    },
                                                }))}
                                                className={cn(
                                                    'w-12 h-6 rounded-full transition-all flex items-center px-1',
                                                    newPersona.platformSettings[platform.id]?.googleAuth ? 'bg-white' : 'bg-white/10'
                                                )}
                                            >
                                                <div className={cn('w-4 h-4 rounded-full transition-all',
                                                    newPersona.platformSettings[platform.id]?.googleAuth ? 'bg-black translate-x-6' : 'bg-white/20 translate-x-0'
                                                )} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            value={newPersona.platformSettings[platform.id]?.username || ''}
                                            onChange={e => setNewPersona((prev: any) => ({
                                                ...prev,
                                                platformSettings: { ...prev.platformSettings, [platform.id]: { ...prev.platformSettings[platform.id], username: e.target.value } }
                                            }))}
                                            placeholder="Username"
                                            className="bg-black border border-white/5 rounded-xl py-3 px-5 text-xs outline-none focus:border-white/20 font-medium italic"
                                        />
                                        <input
                                            value={newPersona.platformSettings[platform.id]?.password || ''}
                                            onChange={e => setNewPersona((prev: any) => ({
                                                ...prev,
                                                platformSettings: { ...prev.platformSettings, [platform.id]: { ...prev.platformSettings[platform.id], password: e.target.value } }
                                            }))}
                                            type="password"
                                            placeholder="Password"
                                            className="bg-black border border-white/5 rounded-xl py-3 px-5 text-xs outline-none focus:border-white/20 font-medium"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <button
                        onClick={onSave}
                        className="w-full bg-white text-black py-7 rounded-[40px] font-black uppercase tracking-[0.4em] text-xs hover:invert transition-all active:scale-95 shadow-[0_20px_60px_rgba(255,255,255,0.1)] italic flex items-center justify-center gap-6"
                    >
                        {isEditing ? 'Update Character' : 'Create Character'}
                        <Sparkles className="w-5 h-5 flex-shrink-0" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
