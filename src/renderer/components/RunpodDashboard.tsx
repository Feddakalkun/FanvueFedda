"use client";

import { useState, useEffect } from "react";
import {
    Zap,
    Plus,
    Activity,
    Server,
    HardDrive,
    CreditCard,
    CloudLightning,
    RefreshCw,
    Search,
    Play,
    Square,
    FileText,
    Trash2,
    Database,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
    const [apiKey, setApiKey] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [gpus, setGpus] = useState<any[]>([]);
    const [pods, setPods] = useState<any[]>([]);
    const [volumes, setVolumes] = useState<any[]>([]);
    const [balance, setBalance] = useState<string>("0.00");
    const [activeTab, setActiveTab] = useState<'market' | 'pods' | 'volumes'>('market');
    const [templateId, setTemplateId] = useState("");
    const [selectedVolumeId, setSelectedVolumeId] = useState("");

    const [showLogs, setShowLogs] = useState(false);
    const [activeLogs, setActiveLogs] = useState("");
    const [isFetchingLogs, setIsFetchingLogs] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem("runpod_api_key");
        const savedTemplate = localStorage.getItem("runpod_template_id");
        if (savedTemplate) setTemplateId(savedTemplate);

        if (savedKey) {
            setApiKey(savedKey);
            connectRunPodBackground(savedKey);
        }
    }, []);

    const connectRunPodBackground = async (key: string) => {
        try {
            setLoading(true);
            const resp = await fetch('/api/runpod', {
                method: 'POST',
                body: JSON.stringify({ apiKey: key, action: 'list_gpus' })
            });
            const data = await resp.json();
            if (!data.error) {
                setGpus(Array.isArray(data) ? data : []);
                setIsConnected(true);
                fetchPods(key);
                fetchBalance(key);
                fetchVolumes(key);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBalance = async (key: string) => {
        try {
            const resp = await fetch('/api/runpod', {
                method: 'POST',
                body: JSON.stringify({ apiKey: key, action: 'get_balance' })
            });
            const data = await resp.json();
            if (data && data.credits !== undefined) {
                setBalance(data.credits.toFixed(2));
            }
        } catch (err) {
            console.error("Failed to fetch balance", err);
        }
    };

    const fetchPods = async (key: string) => {
        try {
            const resp = await fetch('/api/runpod', {
                method: 'POST',
                body: JSON.stringify({ apiKey: key, action: 'list_pods' })
            });
            const data = await resp.json();
            setPods(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch pods", err);
        }
    };

    const fetchVolumes = async (key: string) => {
        try {
            const resp = await fetch('/api/runpod', {
                method: 'POST',
                body: JSON.stringify({ apiKey: key, action: 'list_volumes' })
            });
            const data = await resp.json();
            setVolumes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch volumes", err);
        }
    };

    const deployPod = async (gpuId: string) => {
        if (!apiKey) return;
        setLoading(true);
        try {
            const resp = await fetch('/api/runpod', {
                method: 'POST',
                body: JSON.stringify({
                    apiKey,
                    action: 'create_pod',
                    gpuId,
                    templateId: templateId || undefined,
                    networkVolumeId: selectedVolumeId || undefined
                })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            alert("Deployment Initiated: Pod " + data.id);
            setActiveTab('pods');
            fetchPods(apiKey);
        } catch (err) {
            alert("Deployment Failed: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const podAction = async (action: string, podId: string) => {
        if (!apiKey) return;
        setLoading(true);
        try {
            const resp = await fetch('/api/runpod', {
                method: 'POST',
                body: JSON.stringify({ apiKey, action, podId })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);
            fetchPods(apiKey);
        } catch (err) {
            alert("Action Failed: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async (podId: string) => {
        setShowLogs(true);
        setIsFetchingLogs(true);
        setActiveLogs("Fetching logs...");
        try {
            const resp = await fetch('/api/runpod', {
                method: 'POST',
                body: JSON.stringify({ apiKey, action: 'get_logs', podId })
            });
            const data = await resp.json();
            setActiveLogs(data.logs || "No logs returned.");
        } catch (err) {
            setActiveLogs("Failed to fetch logs: " + (err as Error).message);
        } finally {
            setIsFetchingLogs(false);
        }
    };

    const createVolume = async () => {
        const name = prompt("Enter Volume Name:");
        if (!name) return;
        const sizeStr = prompt("Enter Size (GB):", "50");
        if (!sizeStr) return;
        const size = parseInt(sizeStr);
        const dc = prompt("Enter Data Center ID (e.g. EU-RO-1):", "EU-RO-1");
        if (!dc) return;

        setLoading(true);
        try {
            const resp = await fetch('/api/runpod', {
                method: 'POST',
                body: JSON.stringify({ apiKey, action: 'create_volume', volumeName: name, volumeSize: size, dataCenterId: dc })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);
            fetchVolumes(apiKey);
        } catch (err) {
            alert("Failed to create volume: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteVolume = async (id: string) => {
        if (!confirm("Are you sure you want to delete this volume? All data will be lost.")) return;
        setLoading(true);
        try {
            const resp = await fetch('/api/runpod', {
                method: 'POST',
                body: JSON.stringify({ apiKey, action: 'delete_volume', volumeId: id })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);
            fetchVolumes(apiKey);
        } catch (err) {
            alert("Failed to delete volume: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const connectRunPod = async () => {
        if (!apiKey) return;
        setLoading(true);
        try {
            const resp = await fetch('/api/runpod', {
                method: 'POST',
                body: JSON.stringify({ apiKey, action: 'list_gpus' })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            localStorage.setItem("runpod_api_key", apiKey);
            setGpus(Array.isArray(data) ? data : []);
            setIsConnected(true);
            fetchPods(apiKey);
            fetchBalance(apiKey);
            fetchVolumes(apiKey);
        } catch (err) {
            alert("Failed to connect to RunPod: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold font-outfit uppercase tracking-tighter italic">Viral <span className="gradient-text">Forge Core</span></h1>
                    <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Status: System Operational
                    </p>
                </div>
                <div className="flex gap-4">
                    {isConnected ? (
                        <div className="flex items-center gap-3 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl group cursor-pointer hover:bg-emerald-500/20 transition-all">
                            <div className="text-right">
                                <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Connection Stable</p>
                                <p className="text-[11px] font-bold text-white">SDK v1.8.1 LINKED</p>
                            </div>
                            <CloudLightning className="w-5 h-5 text-emerald-500 group-hover:rotate-12 transition-transform" />
                        </div>
                    ) : (
                        <div className="flex gap-3 bg-card/50 p-1.5 border border-border rounded-2xl backdrop-blur-md">
                            <input
                                type="password"
                                placeholder="INPUT RUNPOD_API_KEY"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="bg-transparent border-none px-4 py-2 text-xs w-56 focus:outline-none font-mono"
                            />
                            <button
                                onClick={connectRunPod}
                                disabled={loading}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 fill-white" />}
                                CONNECT
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Transmissions", val: pods.length.toString(), icon: Activity, color: "text-violet-400", bg: "bg-violet-400/10" },
                    { label: "Storage Capacity", val: volumes.length.toString(), icon: Database, color: "text-indigo-400", bg: "bg-indigo-400/10" },
                    { label: "Market Credits", val: "$" + balance, icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                    { label: "Subject Profiles", val: "4", icon: Server, color: "text-sky-400", bg: "bg-sky-400/10" },
                ].map((stat, i) => (
                    <div key={i} className="glass rounded-3xl p-6 border border-white/5 flex items-center justify-between group hover:border-violet-500/20 transition-all cursor-default relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10">
                            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-bold font-outfit">{stat.val}</h3>
                        </div>
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 group-hover:scale-110 relative z-10", stat.bg)}>
                            <stat.icon className={cn("w-7 h-7", stat.color)} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Control Panel */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <section className="glass rounded-[2rem] p-8 cyber-border bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex gap-6">
                                {[
                                    { id: 'market', label: 'Neural Market' },
                                    { id: 'pods', label: `Active Pods (${pods.length})` },
                                    { id: 'volumes', label: 'Storage Volumes' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={cn(
                                            "relative pb-2 text-sm font-bold uppercase tracking-[0.2em] transition-all",
                                            activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (apiKey) {
                                            fetchPods(apiKey);
                                            fetchBalance(apiKey);
                                            fetchVolumes(apiKey);
                                        }
                                    }}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-all"
                                >
                                    <RefreshCw className={cn("w-4 h-4 text-muted-foreground", loading && "animate-spin")} />
                                </button>
                            </div>
                        </div>

                        <div className="min-h-[400px]">
                            {activeTab === 'market' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-5 rounded-[1.5rem] border border-white/10 space-y-3">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Docker Image / Template</h4>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. ai-dock/comfyui:latest"
                                                    value={templateId}
                                                    onChange={(e) => {
                                                        setTemplateId(e.target.value);
                                                        localStorage.setItem("runpod_template_id", e.target.value);
                                                    }}
                                                    className="w-full bg-black/50 border border-white/5 px-4 py-2.5 text-[11px] focus:outline-none focus:border-white/20 font-mono rounded-xl text-white transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-5 rounded-[1.5rem] border border-white/10 space-y-3">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Attach Network Volume</h4>
                                                <select
                                                    value={selectedVolumeId}
                                                    onChange={(e) => setSelectedVolumeId(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/5 px-4 py-2.5 text-[11px] focus:outline-none focus:border-white/20 font-mono rounded-xl text-white transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">No Volume Attached</option>
                                                    {volumes.map(v => (
                                                        <option key={v.id} value={v.id}>{v.name} ({v.size}GB - {v.dataCenterId})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {!isConnected ? (
                                            <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-[2rem] opacity-50">
                                                <CloudLightning className="w-12 h-12 mb-4 text-primary animate-pulse" />
                                                <p className="text-xs font-mono uppercase tracking-[0.3em]">Initialize Uplink to browse Marketplace</p>
                                            </div>
                                        ) : (
                                            gpus.filter((g: any) => g.id.includes('6000') || g.id.includes('3090') || g.id.includes('4090')).map((gpu: any, i: number) => (
                                                <div key={i} className="glass rounded-[1.5rem] p-6 border border-white/5 hover:border-primary/30 transition-all group flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                                <Cpu className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xl font-bold font-mono text-emerald-400">{"$" + (gpu.community_price || '0.24')}<span className="text-[10px] text-muted-foreground">/hr</span></p>
                                                                <p className="text-[8px] font-mono text-muted-foreground uppercase">Instant Deploy Secure</p>
                                                            </div>
                                                        </div>
                                                        <h3 className="text-lg font-bold font-outfit mb-1">{gpu.id.split('-').join(' ')}</h3>
                                                        <div className="flex gap-2 mb-6">
                                                            <span className="text-[9px] px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">24GB VRAM</span>
                                                            <span className="text-[9px] px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">SSD INCLUDED</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deployPod(gpu.id)}
                                                        disabled={loading}
                                                        className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                                    >
                                                        Deploy Nerve Center
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : activeTab === 'pods' ? (
                                <div className="space-y-4">
                                    {pods.length === 0 ? (
                                        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-[2rem] opacity-50">
                                            <Server className="w-12 h-12 mb-4 text-primary" />
                                            <p className="text-xs font-mono uppercase tracking-[0.3em]">No Active Deployments Found</p>
                                        </div>
                                    ) : (
                                        pods.map((pod, i) => (
                                            <div key={i} className="glass rounded-2xl p-6 border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full shadow-[0_0_15px]",
                                                        pod.desiredStatus === 'RUNNING' ? "bg-emerald-500 shadow-emerald-500/50 animate-pulse" :
                                                            pod.desiredStatus === 'EXITED' ? "bg-red-500 shadow-red-500/50" : "bg-orange-500 shadow-orange-500/50"
                                                    )} />
                                                    <div>
                                                        <p className="text-sm font-bold uppercase tracking-tight">{pod.name}</p>
                                                        <p className="text-[9px] font-mono text-muted-foreground uppercase mt-0.5">
                                                            {pod.machine.gpuName} • {pod.runtime?.uptime ? `UPTIME: ${pod.runtime.uptime}` : pod.desiredStatus}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right mr-4 hidden md:block">
                                                        <p className="text-[10px] font-mono text-primary font-bold">{pod.runtime?.address || 'ASSIGNING IP...'}</p>
                                                        <p className="text-[8px] font-mono text-muted-foreground uppercase">Public Uplink</p>
                                                    </div>

                                                    {pod.desiredStatus === 'EXITED' ? (
                                                        <button
                                                            onClick={() => podAction('start_pod', pod.id)}
                                                            className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all border border-emerald-500/10"
                                                            title="Start Pod"
                                                        >
                                                            <Play className="w-4 h-4 fill-current" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => podAction('stop_pod', pod.id)}
                                                            className="p-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-all border border-orange-500/10"
                                                            title="Stop Pod"
                                                        >
                                                            <Square className="w-4 h-4 fill-current" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => fetchLogs(pod.id)}
                                                        className="p-3 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-xl transition-all border border-violet-500/10"
                                                        title="View Logs"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => { if (confirm("Terminate this pod? Actions cannot be undone.")) podAction('terminate_pod', pod.id) }}
                                                        className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/10"
                                                        title="Terminate"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 italic">Managed Storage Volumes</h3>
                                        <button
                                            onClick={createVolume}
                                            className="px-6 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:invert transition-all"
                                        >
                                            Create Volume
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {volumes.length === 0 ? (
                                            <div className="col-span-full h-48 flex flex-col items-center justify-center border border-dashed border-border rounded-[2rem] opacity-30 italic">
                                                No persistent volumes mapped.
                                            </div>
                                        ) : (
                                            volumes.map((vol, i) => (
                                                <div key={i} className="glass rounded-2xl p-6 border border-white/5 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                                            <Database className="w-5 h-5 text-indigo-400" />
                                                        </div>
                                                        <button
                                                            onClick={() => deleteVolume(vol.id)}
                                                            className="p-2 text-white/10 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm uppercase truncate">{vol.name}</h4>
                                                        <p className="text-[10px] font-mono text-muted-foreground uppercase">{vol.size}GB • {vol.dataCenterId}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Status Hub */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <section className="glass rounded-[2rem] p-6 border border-white/5">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] font-mono mb-6 flex items-center gap-2 text-white/40">
                            <Search className="w-3.5 h-3.5" /> System Health
                        </h2>
                        <div className="space-y-6">
                            {[
                                { label: "Memory Uplink", val: "STABLE", color: "text-emerald-400" },
                                { label: "Storage Forge", val: `${volumes.length} VOLUMES`, color: "text-sky-400" },
                                { label: "Neural Latency", val: "24ms", color: "text-violet-400" },
                            ].map((h, i) => (
                                <div key={i} className="flex justify-between items-center text-[10px]">
                                    <span className="text-muted-foreground uppercase font-mono tracking-widest">{h.label}</span>
                                    <span className={cn("font-bold font-mono tracking-widest", h.color)}>{h.val}</span>
                                </div>
                            ))}
                            <div className="pt-6 border-t border-white/5">
                                <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all italic">
                                    Flush Neural Cache
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="glass rounded-[2rem] p-6 border border-white/5 overflow-hidden group relative">
                        <img
                            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800"
                            className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-700"
                        />
                        <div className="relative z-10 p-4">
                            <h3 className="text-lg font-black font-outfit uppercase italic leading-none">Persistent Storage</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed mt-2 italic">
                                Network volumes persist beyond pod termination. Perfect for weights & datasets.
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Logs Modal */}
            {showLogs && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowLogs(false)} />
                    <div className="relative w-full max-w-4xl bg-card border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                        <header className="p-6 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold uppercase tracking-tighter italic">Neural Transmission Logs</h3>
                                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Real-time pod stdout buffer</p>
                            </div>
                            <button onClick={() => setShowLogs(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-5 h-5 text-white/20" />
                            </button>
                        </header>
                        <div className="flex-1 p-6 overflow-y-auto bg-black/40 font-mono text-[11px] leading-relaxed custom-scrollbar">
                            {isFetchingLogs ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
                                    <RefreshCw className="w-6 h-6 animate-spin" />
                                    <span className="uppercase tracking-[0.3em]">Interrogating Host...</span>
                                </div>
                            ) : (
                                <pre className="whitespace-pre-wrap break-all text-emerald-400/80">
                                    {activeLogs}
                                </pre>
                            )}
                        </div>
                        <footer className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
                            <button
                                onClick={() => setShowLogs(false)}
                                className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:invert transition-all"
                            >
                                Close Buffer
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}

function Cpu({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>
    )
}
