'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Settings, LayoutGrid, Zap, X, RefreshCw, Image as ImageIcon,
  Cpu, Globe, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Scene } from '@/lib/scene-library';
import RunpodDashboard from '@/components/RunpodDashboard';
import CuratorUI from '@/components/CuratorUI';
import CharacterHub from '@/components/CharacterHub';
import PersonaBuilder from '@/components/PersonaBuilder';
import StudioPanel from '@/components/StudioPanel';

interface NavItem {
  name: string;
  icon: any;
  onClick?: () => void;
}

const EMPTY_PERSONA = {
  name: '', handle: '', bio: '', loraMix: '', looksDescription: '',
  attributes: { vibe: '', expression: 'Neutral', ethnicity: '', skinTone: '', hairStyle: '', bodyType: '', breastSize: '' },
  platformSettings: {
    tiktok: { username: '', password: '', googleAuth: false, enabled: false },
    insta: { username: '', password: '', googleAuth: false, enabled: false },
    x: { username: '', password: '', googleAuth: false, enabled: false },
  },
};

export default function Home() {
  // Navigation
  const [view, setView] = useState<'landing' | 'studio'>('landing');
  const [activeTab, setActiveTab] = useState('Workspace');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isViewingHub, setIsViewingHub] = useState(false);

  // Core data
  const [characters, setCharacters] = useState<any[]>([]);
  const [activeCharacter, setActiveCharacter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalConfig, setGlobalConfig] = useState({ fanvueClientId: '', fanvueClientSecret: '' });

  // Engine status
  const [isEngineOnline, setIsEngineOnline] = useState(false);
  const [isOllamaOnline, setIsOllamaOnline] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'General' | 'Models'>('General');
  const [modelPackages, setModelPackages] = useState<any[]>([]);
  const [downloadLog, setDownloadLog] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Studio
  const [studioMode, setStudioMode] = useState<'image' | 'video' | 'swap' | 'duo'>('image');
  const [previewAsset, setPreviewAsset] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [sessionAssets, setSessionAssets] = useState<{ type: 'image' | 'video'; url: string; timestamp: number }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCaptioning, setIsCaptioning] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [comfyStatus, setComfyStatus] = useState<{ status: string; nodeTitle?: string; queueCount?: number } | null>(null);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState('');
  const [fullScreenAsset, setFullScreenAsset] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  // Studio controls
  const [trends, setTrends] = useState<any[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<any>(null);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [curatedAssets, setCuratedAssets] = useState<{ url: string; caption: string }[]>([]);
  const [selectedReference, setSelectedReference] = useState<{ url: string; caption: string } | null>(null);
  const [customScenePrompt, setCustomScenePrompt] = useState('');
  const [videoConfig, setVideoConfig] = useState({ model: 'LTX-2 Distill (19B)', prompt: '', duration: 8, resolution: '720' });
  const [swapPrompt, setSwapPrompt] = useState('');

  // Persona builder
  const [newPersona, setNewPersona] = useState(EMPTY_PERSONA);
  const [selectedLoras, setSelectedLoras] = useState<{ name: string; strength: number }[]>([]);
  const [targetStrength, setTargetStrength] = useState(1.2);
  const [availableLoras, setAvailableLoras] = useState<string[]>([]);

  // --- Initialization ---
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const charRes = await fetch('/api/characters');
        const charData = await charRes.json();
        setCharacters(charData);
        if (charData.length > 0) setActiveCharacter(charData[0]);

        const configRes = await fetch('/api/config');
        const configData = await configRes.json();
        if (configData) setGlobalConfig({ fanvueClientId: configData.fanvueClientId || '', fanvueClientSecret: configData.fanvueClientSecret || '' });
      } catch (e) {
        console.error('Core init failed');
      } finally {
        setIsLoading(false);
      }
    }
    init();

    const checkEngine = async () => {
      try {
        const res = await fetch('http://localhost:8188/system_stats');
        if (res.ok) { setSystemStats(await res.json()); setIsEngineOnline(true); }
        else setIsEngineOnline(false);
      } catch { setIsEngineOnline(false); }
    };
    const checkOllama = async () => {
      try { const res = await fetch('http://localhost:11434/api/tags'); setIsOllamaOnline(res.ok); }
      catch { setIsOllamaOnline(false); }
    };

    checkEngine(); checkOllama();
    const interval = setInterval(() => { checkEngine(); checkOllama(); }, 5000);

    fetch('/api/models/loras').then(r => r.json()).then(d => setAvailableLoras(d)).catch(() => { });
    fetch('/api/trends').then(r => r.json()).then(d => setTrends(d)).catch(() => { });
    fetch('/api/models').then(r => r.json()).then(d => setModelPackages(d)).catch(() => { });

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeCharacter) setPreviewAsset(activeCharacter.previewUrl ? { type: 'image', url: activeCharacter.previewUrl } : null);
  }, [activeCharacter?.id]);

  useEffect(() => {
    if (activeCharacter?.id) {
      fetch(`/api/characters?action=curated&id=${activeCharacter.id}`)
        .then(r => r.json())
        .then(d => { setCuratedAssets(d.assets || []); setSelectedReference(null); })
        .catch(() => { });
    } else { setCuratedAssets([]); setSelectedReference(null); }
  }, [activeCharacter?.id]);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    if (isGenerating || isSwapping) {
      pollInterval = setInterval(async () => {
        try { const res = await fetch('/api/generate/status'); setComfyStatus(await res.json()); } catch { }
      }, 1000);
    } else { setComfyStatus(null); }
    return () => clearInterval(pollInterval);
  }, [isGenerating, isSwapping]);

  useEffect(() => {
    let pollInterval: any;
    if (isSettingsOpen || isDownloading) {
      pollInterval = setInterval(async () => {
        const res = await fetch('/api/models/download');
        const data = await res.json();
        setDownloadLog(data.log);
        setIsDownloading(data.isDownloading);
        if (!data.isDownloading && isDownloading) fetch('/api/models').then(r => r.json()).then(d => setModelPackages(d));
      }, 2000);
    }
    return () => clearInterval(pollInterval);
  }, [isSettingsOpen, isDownloading]);

  // --- Handlers ---
  const handleStartNewCharacter = () => {
    setNewPersona(EMPTY_PERSONA);
    setSelectedLoras([]);
    setPreviewAsset(null);
    setIsCreating(true);
    setIsViewingHub(false);
    setIsEditing(null);
  };

  const handleCreatePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loraMixString = selectedLoras.map(l => `${l.name}:${l.strength}`).join(', ');
    const payload = { ...newPersona, id: isEditing, loraMix: loraMixString, previewUrl: previewAsset?.url || null };
    try {
      const res = await fetch('/api/characters', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (isEditing) setCharacters(prev => prev.map(c => c.id === isEditing ? data : c));
        else setCharacters(prev => [data, ...prev]);
        setActiveCharacter(data);
        setIsCreating(false);
        setIsEditing(null);
        setActiveTab('Workspace');
        setNewPersona(EMPTY_PERSONA);
        setSelectedLoras([]);
        setPreviewAsset(null);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to save: ${err.error || 'Check server logs'}`);
      }
    } catch { alert('Communication error'); }
    finally { setIsLoading(false); }
  };

  const handleDeleteCharacter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;
    try {
      const res = await fetch(`/api/characters?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCharacters(prev => prev.filter(c => c.id !== id));
        if (activeCharacter?.id === id) setActiveCharacter(null);
      }
    } catch { alert('Delete failed'); }
  };

  const handleGeneratePreview = async () => {
    const isInCreator = isCreating;
    const persona = isInCreator ? newPersona : (activeCharacter || newPersona);
    let loraMix = persona.loraMix;
    if (isInCreator && selectedLoras.length > 0) loraMix = selectedLoras.map(l => `${l.name}:${l.strength}`).join(', ');
    if (!loraMix) return alert('Please select at least one LoRA.');
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate/portrait', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...persona, loraMix, selectedTrend, selectedScene, selectedReference, customPrompt: customScenePrompt }),
      });
      const data = await res.json();
      if (data.image) {
        setPreviewAsset({ type: 'image', url: data.image });
        if (data.prompt) setLastGeneratedPrompt(data.prompt);
        if (activeCharacter) setSessionAssets(prev => [{ type: 'image', url: data.image, timestamp: Date.now() }, ...prev]);
      } else alert('Generation failed: ' + (data.error || 'Unknown error'));
    } catch { alert('Failed to connect to AI engine'); }
    finally { setIsGenerating(false); }
  };

  const handleGenerateVideo = async () => {
    if (!previewAsset || !activeCharacter) return alert('Select a portrait first');
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate/video', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: previewAsset.url, persona: activeCharacter, videoConfig, selectedTrend, selectedScene, workflow: videoConfig.model.includes('LTX-2') ? 'ltx2_new' : 'wan_i2v' }),
      });
      const data = await res.json();
      if (data.video) {
        setSessionAssets(prev => [{ type: 'video', url: data.video, timestamp: Date.now() }, ...prev]);
        setPreviewAsset({ type: 'video', url: data.video });
      } else alert('Video generation failed');
    } catch { alert('Failed to connect to video cluster'); }
    finally { setIsGenerating(false); }
  };

  const handleGenerateDuo = async (cfg: any) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate/duo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      const data = await res.json();
      if (data.image) {
        setPreviewAsset({ type: 'image', url: data.image });
        setSessionAssets(prev => [{ type: 'image', url: data.image, timestamp: Date.now() }, ...prev]);
        if (data.prompt) setLastGeneratedPrompt(data.prompt);
      } else alert('DUO generation failed: ' + (data.error || 'Unknown error'));
    } catch { alert('Failed to connect to AI engine'); }
    finally { setIsGenerating(false); }
  };

  const handleClothesSwap = async () => {
    if (!previewAsset || !swapPrompt) return alert('Describe the new outfit');
    setIsSwapping(true);
    try {
      const res = await fetch('/api/generate/swap', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: previewAsset.url, prompt: swapPrompt, persona: activeCharacter }),
      });
      const data = await res.json();
      if (data.image) {
        setPreviewAsset({ type: 'image', url: data.image });
        setSessionAssets(prev => [{ type: 'image', url: data.image, timestamp: Date.now() }, ...prev]);
      } else alert('Swap failed');
    } catch { alert('Failed to connect to swap engine'); }
    finally { setIsSwapping(false); }
  };

  const handleCaptionImage = async () => {
    if (!previewAsset) return;
    setIsCaptioning(true);
    try {
      const res = await fetch('/api/generate/caption', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: previewAsset.url }),
      });
      const data = await res.json();
      if (data.caption) setNewPersona(prev => ({ ...prev, looksDescription: data.caption }));
      else alert('Captioning failed: ' + (data.error || 'Unknown error'));
    } catch { alert('Failed to connect to captioning service'); }
    finally { setIsCaptioning(false); }
  };

  const handleRandomizeMix = () => {
    if (!selectedLoras.length) return;
    const rawWeights = selectedLoras.map(() => Math.random());
    const sum = rawWeights.reduce((a, b) => a + b, 0);
    setSelectedLoras(selectedLoras.map((lora, i) => ({ ...lora, strength: parseFloat(((rawWeights[i] / sum) * targetStrength).toFixed(2)) })));
  };

  const handleDeleteAsset = (index: number) => {
    const assetToDelete = sessionAssets[index];
    setSessionAssets(prev => prev.filter((_, i) => i !== index));
    if (previewAsset?.url === assetToDelete.url) setPreviewAsset(null);
  };

  const handlePostToTikTok = async (assetUrl: string) => {
    if (!activeCharacter) return alert('Select a character first');
    setIsPosting(true);
    try {
      const res = await fetch('/api/fanvue/post', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: activeCharacter.id, mediaUrl: assetUrl, caption: `Trying out the ${selectedTrend?.hashtag || '#viral'} trend!`, trend: selectedTrend, platform: 'tiktok' }),
      });
      const data = await res.json();
      if (data.success) alert('Posted!'); else alert('Failed: ' + (data.error || 'Unknown error'));
    } catch { alert('Network error'); }
    finally { setIsPosting(false); }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/config', { method: 'POST', body: JSON.stringify(globalConfig) });
      setIsSettingsOpen(false);
    } catch { alert('Failed to save configuration'); }
  };

  const handlePurgeVRAM = async () => {
    try {
      await fetch('http://localhost:8188/free', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unload_models: true, free_memory: true }) });
      alert('VRAM Purged');
    } catch { alert('Failed to purge VRAM'); }
  };

  const navItems: NavItem[] = [
    { name: 'Workspace', icon: LayoutGrid, onClick: () => { setActiveTab('Workspace'); setIsViewingHub(false); setIsCreating(false); } },
    { name: 'AI Studio', icon: Zap },
    { name: 'Library', icon: ImageIcon },
    { name: 'RunPod', icon: Cpu },
    { name: 'Socials', icon: Globe },
    { name: 'Settings', icon: Settings, onClick: () => setIsSettingsOpen(true) },
  ];

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className="relative min-h-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] z-10" />
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop')] bg-cover bg-center grayscale brightness-50" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col items-center text-center gap-16">
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-black tracking-[0.2em] text-white italic underline decoration-white/5 underline-offset-8">FEDDAKALKUN</h1>
          </div>
          <motion.button whileHover={{ scale: 1.05, backgroundColor: '#fff', color: '#000' }} whileTap={{ scale: 0.95 }} onClick={() => setView('studio')} className="group relative flex items-center gap-6 px-20 py-8 border-2 border-white/10 rounded-full overflow-hidden transition-all duration-500">
            <div className="absolute inset-x-0 bottom-0 h-0 bg-white group-hover:h-full transition-all duration-500 -z-10" />
            <span className="text-white group-hover:text-black font-black uppercase tracking-[0.5em] text-xs">ENTER</span>
            <ChevronRight className="w-5 h-5 text-white group-hover:text-black group-hover:translate-x-2 transition-all" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
        {/* Top Bar */}
        <header className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-10 h-20 flex items-center justify-between">
            <div className="flex items-center gap-12 h-full">
              <div className="font-black italic text-xl tracking-tighter">FEDDAKALKUN</div>
              <nav className="flex items-center gap-8 h-full">
                {navItems.map(item => (
                  <button
                    key={item.name}
                    onClick={() => { if (item.onClick) item.onClick(); else setActiveTab(item.name); }}
                    className={cn('relative h-full px-2 text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2', activeTab === item.name ? 'text-white' : 'text-white/30 hover:text-white/60')}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.name}
                    {activeTab === item.name && <motion.div layoutId="navGlow" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full shadow-[0_-5px_15px_rgba(255,255,255,0.5)]" />}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-4">
                  {[
                    { label: 'ComfyUI', online: isEngineOnline },
                    { label: 'Ollama', online: isOllamaOnline },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                      <div className={cn('w-2 h-2 rounded-full animate-pulse', s.online ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]')} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/50 italic">{s.label}: {s.online ? 'Online' : 'Offline'}</span>
                    </div>
                  ))}
                </div>
                {isEngineOnline && systemStats && (
                  <div className="flex gap-4 mt-2 px-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">
                      VRAM: {Math.round((systemStats.devices[0]?.vram_total - systemStats.devices[0]?.vram_free) / 1024 / 1024 / 1024)}GB / {Math.round(systemStats.devices[0]?.vram_total / 1024 / 1024 / 1024)}GB
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1900px] mx-auto p-8 lg:p-12">
          <AnimatePresence mode="wait">
            {activeTab === 'RunPod' ? (
              <motion.div key="runpod" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-[85vh] overflow-y-auto custom-scrollbar">
                <RunpodDashboard />
              </motion.div>
            ) : activeTab === 'Library' ? (
              <motion.div key="library" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-[85vh]">
                <CuratorUI />
              </motion.div>
            ) : activeTab === 'AI Studio' ? (
              <StudioPanel
                activeCharacter={activeCharacter}
                characters={characters}
                studioMode={studioMode}
                setStudioMode={setStudioMode}
                isGenerating={isGenerating}
                isSwapping={isSwapping}
                isPosting={isPosting}
                isCaptioning={isCaptioning}
                comfyStatus={comfyStatus}
                previewAsset={previewAsset}
                sessionAssets={sessionAssets}
                curatedAssets={curatedAssets}
                selectedReference={selectedReference}
                setSelectedReference={setSelectedReference}
                selectedTrend={selectedTrend}
                setSelectedTrend={setSelectedTrend}
                trends={trends}
                selectedScene={selectedScene}
                setSelectedScene={setSelectedScene}
                customScenePrompt={customScenePrompt}
                setCustomScenePrompt={setCustomScenePrompt}
                videoConfig={videoConfig}
                setVideoConfig={setVideoConfig}
                swapPrompt={swapPrompt}
                setSwapPrompt={setSwapPrompt}
                lastGeneratedPrompt={lastGeneratedPrompt}
                setActiveCharacter={setActiveCharacter}
                setIsCreating={setIsCreating}
                setIsEditing={setIsEditing}
                setSelectedLoras={setSelectedLoras}
                setNewPersona={setNewPersona}
                setFullScreenAsset={setFullScreenAsset}
                setActiveTab={setActiveTab}
                onGeneratePreview={handleGeneratePreview}
                onGenerateVideo={handleGenerateVideo}
                onClothesSwap={handleClothesSwap}
                onDeleteAsset={handleDeleteAsset}
                onPostToTikTok={handlePostToTikTok}
                onGenerateDuo={handleGenerateDuo}
              />
            ) : activeTab === 'Workspace' && !isCreating ? (
              <motion.div key="hub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <CharacterHub
                  characters={characters}
                  activeCharacter={activeCharacter}
                  onSelectCharacter={char => { setActiveCharacter(char); setActiveTab('AI Studio'); }}
                  onCreateNew={handleStartNewCharacter}
                  onDelete={handleDeleteCharacter}
                />
              </motion.div>
            ) : isCreating ? (
              <PersonaBuilder
                isEditing={isEditing}
                newPersona={newPersona}
                setNewPersona={setNewPersona}
                selectedLoras={selectedLoras}
                setSelectedLoras={setSelectedLoras}
                availableLoras={availableLoras}
                targetStrength={targetStrength}
                setTargetStrength={setTargetStrength}
                previewAsset={previewAsset}
                isGenerating={isGenerating}
                isCaptioning={isCaptioning}
                comfyStatus={comfyStatus}
                lastGeneratedPrompt={lastGeneratedPrompt}
                globalConfig={globalConfig}
                onClose={() => { setIsCreating(false); setIsEditing(null); }}
                onGeneratePreview={handleGeneratePreview}
                onCaptionImage={handleCaptionImage}
                onRandomizeMix={handleRandomizeMix}
                onSave={handleCreatePersona}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            ) : null}
          </AnimatePresence>
        </main>
      </div>

      {/* Fullscreen Asset Viewer */}
      <AnimatePresence>
        {fullScreenAsset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-8" onClick={() => setFullScreenAsset(null)}>
            <button onClick={() => setFullScreenAsset(null)} className="absolute top-10 right-10 p-4 border border-white/10 rounded-full hover:bg-white/10 transition-all">
              <X className="w-6 h-6" />
            </button>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-5xl aspect-[3/4] md:aspect-auto md:h-[90vh] flex items-center justify-center relative" onClick={e => e.stopPropagation()}>
              {fullScreenAsset.type === 'video'
                ? <video src={fullScreenAsset.url} controls autoPlay loop className="max-w-full max-h-full rounded-[40px] border border-white/5 object-contain" />
                : <img src={fullScreenAsset.url} className="max-w-full max-h-full rounded-[40px] border border-white/5 object-contain" />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-10 pointer-events-none">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl pointer-events-auto" onClick={() => setIsSettingsOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-4xl bg-white/[0.02] border border-white/10 rounded-[48px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
              <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-10">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Settings</h2>
                  <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                    {(['General', 'Models'] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveSettingsTab(tab)} className={cn('px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', activeSettingsTab === tab ? 'bg-white text-black' : 'text-white/40 hover:text-white')}>
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-white/20" />
                </button>
              </header>

              <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {activeSettingsTab === 'General' ? (
                  <div className="space-y-12">
                    <section className="space-y-8">
                      <div className="flex items-center gap-4 text-white/20">
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 text-[10px] font-black">01</div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em]">Fanvue Developer Access</h3>
                        <div className={cn('ml-auto px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border', globalConfig.fanvueClientId ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20')}>
                          {globalConfig.fanvueClientId ? 'Configured' : 'Action Required'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-2">Client ID</label>
                          <input type="text" value={globalConfig.fanvueClientId} onChange={e => setGlobalConfig({ ...globalConfig, fanvueClientId: e.target.value })} className="w-full bg-black border border-white/5 rounded-2xl py-5 px-8 text-xs outline-none focus:border-white/30 transition-all font-mono" placeholder="fv_client_..." />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-2">Client Secret</label>
                          <input type="password" value={globalConfig.fanvueClientSecret} onChange={e => setGlobalConfig({ ...globalConfig, fanvueClientSecret: e.target.value })} className="w-full bg-black border border-white/5 rounded-2xl py-5 px-8 text-xs outline-none focus:border-white/30 transition-all font-mono" placeholder="fv_secret_..." />
                        </div>
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        {modelPackages.map(pkg => (
                          <div key={pkg.id} className="p-8 border border-white/5 rounded-[40px] bg-white/[0.01] space-y-4 hover:border-white/10 transition-all">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-black italic text-lg uppercase leading-none mb-1">{pkg.name}</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">{pkg.size} • {pkg.description}</p>
                              </div>
                              {pkg.installed ? (
                                <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-500/20">Ready</div>
                              ) : (
                                <button disabled={isDownloading} onClick={async () => { const r = await fetch('/api/models/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId: pkg.id }) }); if (r.ok) setIsDownloading(true); }} className="bg-white text-black px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest hover:brightness-90 transition-all disabled:opacity-50">
                                  Download
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Terminal Output</h4>
                          <div className="flex items-center gap-4">
                            <button onClick={handlePurgeVRAM} className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all italic">Purge VRAM</button>
                            {isDownloading && <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white animate-pulse rounded-full" /><span className="text-[8px] font-black text-white uppercase tracking-widest italic">Syncing...</span></div>}
                          </div>
                        </div>
                        <div className="bg-black border border-white/5 rounded-[32px] p-6 h-[400px] overflow-y-auto font-mono text-[9px] custom-scrollbar whitespace-pre-wrap text-white/60">
                          {downloadLog || 'Ready to sync models...'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <footer className="mt-12 pt-8 border-t border-white/5 flex justify-end gap-6">
                <button onClick={() => setIsSettingsOpen(false)} className="px-10 py-4 border border-white/5 hover:bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all italic text-white/40 hover:text-white">Close</button>
                <button onClick={() => { handleSaveSettings(); setIsSettingsOpen(false); }} className="bg-white text-black px-12 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:invert transition-all active:scale-95 shadow-xl shadow-white/5 italic flex items-center gap-3">Apply Changes</button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
