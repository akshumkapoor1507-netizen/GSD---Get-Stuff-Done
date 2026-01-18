
import React, { useState, useRef, useEffect } from 'react';
import { 
    ShieldCheck, Award, Bone, ArrowUpRight, Copy, Share2, 
    Settings2, History, Cpu, Zap, Camera, Wand2, 
    Loader2, CheckCircle2, ChevronRight,
    X, Gamepad2, HardHat, GraduationCap, Laptop,
    MonitorPlay, Bell, Smartphone, 
    EyeOff, Radio, QrCode, TrendingUp, TrendingDown, Target,
    Package, Users, Sparkles, Medal, Activity, FileText, BarChart3, Eye,
    Fingerprint, Lock, Shield
} from 'lucide-react';
import { AppState, TrustHistoryEntry } from '../types';
import { GoogleGenAI } from "@google/genai";

interface IDViewProps {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
    updateTrustScore?: (actionType: 'BOUNTY' | 'MONEY_POT' | 'GEAR' | 'GENERAL', isPositive: boolean, descriptionOverride?: string) => void;
}

interface Archetype {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    prompt: string;
    color: string;
}

const ARCHETYPES: Archetype[] = [
    {
        id: 'NEURAL_REB',
        name: 'NEURAL REB',
        description: 'High-speed code-cruncher with a neon streetwear edge.',
        icon: Laptop,
        color: '#CCFF00',
        prompt: "A neon retro-futuristic arcade-styled tactical avatar of a college student with glowing goggles and a techwear hoodie. Bright lime accents, dark industrial background, glitch aesthetics, high contrast, sharp vector art."
    },
    {
        id: 'GEAR_RUNNER',
        name: 'GEAR RUNNER',
        description: 'Tactical procurement specialist. Heavy mechanical aesthetic.',
        icon: HardHat,
        color: '#00E5FF',
        prompt: "A neon retro-futuristic arcade-styled tactical avatar of a college student wearing a tactical vest with gear slots and heavy headphones. Cyber cyan accents, dark metallic industrial background, 80s arcade pulse, sharp vector art."
    },
    {
        id: 'SQUAD_ACE',
        name: 'SQUAD ACE',
        description: 'Leader of the social-hub. Bright, charismatic, arcade-pro.',
        icon: Gamepad2,
        color: '#FFD700',
        prompt: "A neon retro-futuristic arcade-styled tactical avatar of a charismatic college student with a vintage gaming headset and holographic pins. Gold and purple accents, synthwave arcade vibe, sharp vector art, high contrast."
    },
    {
        id: 'BONE_WIZ',
        name: 'BONE WIZ',
        description: 'Industrial fintech master. Data-stream obsessed.',
        icon: GraduationCap,
        color: '#9D00FF',
        prompt: "A neon retro-futuristic arcade-styled tactical avatar of a college student in a graduation cloak made of optical fiber cables. Deep violet and lime accents, data-stream background, industrial cyberpunk, sharp vector art."
    }
];

const TrustDetailsModal = ({ isOpen, onClose, score, history }: { isOpen: boolean, onClose: () => void, score: number, history: TrustHistoryEntry[] }) => {
    if (!isOpen) return null;

    const getTrustRank = (score: number) => {
        if (score >= 90) return 'ELITE_NODE';
        if (score >= 70) return 'SKULL_OPERATIVE';
        if (score >= 50) return 'VERIFIED_CITIZEN';
        if (score >= 30) return 'PROVISIONAL';
        return 'AT_RISK';
    };

    const getRankColor = (score: number) => {
        if (score >= 70) return '#CCFF00';
        if (score >= 40) return '#00E5FF';
        return '#FF3333';
    };

    return (
        <div className="fixed inset-0 z-[8500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-[400px] bg-[#0A0A0A] border border-zinc-900 rounded-[3rem] p-8 shadow-3xl relative overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <div className="text-[#CCFF00] font-raj font-black text-[9px] tracking-[0.4em] uppercase italic">TRUST_LEDGER</div>
                        <h2 className="text-white font-raj font-black text-2xl uppercase tracking-tighter mt-1 italic">PROTOCOL_DETAILS</h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-700 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="bg-[#111] border border-zinc-900 rounded-3xl p-8 mb-8 text-center shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 opacity-40" style={{ backgroundColor: getRankColor(score) }}></div>
                    <div className="text-zinc-600 font-raj font-bold text-[10px] tracking-[0.3em] uppercase mb-2 italic">CURRENT_RANK</div>
                    <div className="text-white font-raj font-black text-3xl italic tracking-tighter uppercase mb-4" style={{ color: getRankColor(score) }}>
                        {getTrustRank(score)}
                    </div>
                    <div className="text-5xl font-raj font-black text-white tabular-nums tracking-tighter">
                        {score}<span className="text-xl ml-1 text-zinc-700">%</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar pb-6">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <History size={14} className="text-zinc-700" />
                        <span className="text-zinc-600 font-raj font-bold text-[10px] tracking-[0.3em] uppercase italic">HISTORY_LOG</span>
                    </div>
                    
                    {history.length === 0 ? (
                        <div className="text-center py-10 text-zinc-800 font-raj text-[10px] uppercase tracking-widest italic border border-dashed border-zinc-900 rounded-2xl">
                            NO_ENTRIES_RECORDED
                        </div>
                    ) : (
                        history.map((entry) => (
                            <div key={entry.id} className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl flex justify-between items-center group transition-colors hover:border-zinc-700">
                                <div>
                                    <div className="text-white font-raj font-bold text-[13px] uppercase tracking-wider mb-0.5">{entry.action}</div>
                                    <div className="text-zinc-600 font-data text-[8px] uppercase tracking-widest">{entry.date}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-data font-black text-[13px] flex items-center justify-end gap-1 ${entry.change > 0 ? 'text-[#CCFF00]' : 'text-red-500'}`}>
                                        {entry.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {entry.change > 0 ? '+' : ''}{entry.change}%
                                    </div>
                                    <div className="text-[8px] font-raj text-zinc-700 uppercase font-black tracking-tighter mt-0.5">SCORE: {entry.resultingScore}%</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button 
                    onClick={onClose} 
                    className="w-full bg-zinc-900 border border-zinc-800 text-white py-4 rounded-xl font-raj font-black text-xs tracking-widest uppercase hover:bg-zinc-800 transition-all active:scale-95"
                >
                    CLOSE_UPLINK
                </button>
            </div>
        </div>
    );
};

const SelfDossierModal = ({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: any }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[8600] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-[400px] bg-[#080808] border border-zinc-800 rounded-[3rem] p-8 shadow-3xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-40"></div>
                <div className="flex justify-between items-center mb-10 shrink-0">
                    <div>
                        <div className="text-[#00E5FF] font-raj font-black text-[9px] tracking-[0.4em] uppercase italic">OPERATIVE_INTERNAL_FILE</div>
                        <h2 className="text-white font-raj font-black text-2xl uppercase tracking-tighter mt-1 italic">SELF_DOSSIER</h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-700 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-8 flex-1">
                    <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-4 right-4"><Fingerprint size={24} className="text-zinc-800" /></div>
                        <div className="text-zinc-600 font-raj font-bold text-[10px] tracking-widest uppercase mb-3">OPERATIONAL_BIO</div>
                        <p className="text-white font-inter text-sm leading-relaxed italic opacity-80">{user.bio}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#111] p-5 rounded-2xl border border-zinc-800">
                            <div className="text-zinc-600 font-raj font-bold text-[8px] tracking-widest uppercase mb-1">NODE_RANK</div>
                            <div className="text-[#CCFF00] font-raj font-black text-xl italic uppercase tracking-tighter">{user.rank}</div>
                        </div>
                        <div className="bg-[#111] p-5 rounded-2xl border border-zinc-800">
                            <div className="text-zinc-600 font-raj font-bold text-[8px] tracking-widest uppercase mb-1">STATION_ID</div>
                            <div className="text-white font-data text-[11px] font-bold tracking-widest">{user.id}</div>
                        </div>
                    </div>
                    <div className="bg-zinc-900/20 border border-dashed border-zinc-800 p-6 rounded-3xl">
                        <div className="text-zinc-600 font-raj font-bold text-[10px] tracking-widest uppercase mb-4">SYSTEM_CLEARANCE</div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center"><span className="text-[11px] font-raj text-white opacity-60">HUB_ACCESS</span><span className="text-[#CCFF00] font-black text-[9px] tracking-widest uppercase">LEVEL_4</span></div>
                            <div className="flex justify-between items-center"><span className="text-[11px] font-raj text-white opacity-60">GEAR_LISTING</span><span className="text-[#CCFF00] font-black text-[9px] tracking-widest uppercase">UNRESTRICTED</span></div>
                            <div className="flex justify-between items-center"><span className="text-[11px] font-raj text-white opacity-60">BOUNTY_ESCROW</span><span className="text-[#CCFF00] font-black text-[9px] tracking-widest uppercase">VERIFIED</span></div>
                        </div>
                    </div>
                </div>
                <div className="mt-10 pt-6 border-t border-zinc-900 text-center">
                    <div className="font-data text-[7px] text-zinc-700 tracking-[0.5em] uppercase">GSD_OS_ENCRYPTED_SIGNATURE_0x77_STABLE</div>
                </div>
            </div>
        </div>
    );
};

const NodeAnalyticsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [range, setRange] = useState<'1D' | '1W' | '1M'>('1D');
    if (!isOpen) return null;

    const data = {
        '1D': { views: 42, hypes: 12, bountyViews: 8, gearViews: 5 },
        '1W': { views: 256, hypes: 84, bountyViews: 45, gearViews: 32 },
        '1M': { views: 1042, hypes: 312, bountyViews: 184, gearViews: 124 }
    }[range];

    return (
        <div className="fixed inset-0 z-[8700] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-[400px] bg-[#0A0A0A] border border-zinc-900 rounded-[3rem] p-8 shadow-3xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent opacity-40"></div>
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <div className="text-[#CCFF00] font-raj font-black text-[9px] tracking-[0.4em] uppercase italic">NODE_NETWORK_TRAFFIC</div>
                        <h2 className="text-white font-raj font-black text-2xl uppercase tracking-tighter mt-1 italic">NETWORK_INSIGHTS</h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-700 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="bg-zinc-900/50 p-1.5 rounded-2xl flex gap-1 mb-8">
                    {(['1D', '1W', '1M'] as const).map(r => (
                        <button key={r} onClick={() => setRange(r)} className={`flex-1 py-2.5 rounded-xl font-raj font-bold text-[10px] tracking-widest transition-all ${range === r ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                            {r === '1D' ? '24 HOURS' : r === '1W' ? '7 DAYS' : '30 DAYS'}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="bg-[#111] border border-zinc-900 p-6 rounded-3xl flex flex-col items-center justify-center gap-2 group transition-all hover:border-[#00E5FF]/40">
                        <Eye size={24} className="text-[#00E5FF] opacity-40 group-hover:opacity-100" />
                        <div className="text-3xl font-data font-black text-white">{data.views}</div>
                        <div className="text-[8px] font-raj font-bold text-zinc-600 tracking-widest uppercase text-center">PROFILE_UPLINK</div>
                    </div>
                    <div className="bg-[#111] border border-zinc-900 p-6 rounded-3xl flex flex-col items-center justify-center gap-2 group transition-all hover:border-[#CCFF00]/40">
                        <Zap size={24} className="text-[#CCFF00] opacity-40 group-hover:opacity-100" />
                        <div className="text-3xl font-data font-black text-white">{data.hypes}</div>
                        <div className="text-[8px] font-raj font-bold text-zinc-600 tracking-widest uppercase text-center">NEURAL_HYPES</div>
                    </div>
                    <div className="bg-[#111] border border-zinc-900 p-6 rounded-3xl flex flex-col items-center justify-center gap-2 group transition-all hover:border-zinc-700">
                        <Target size={24} className="text-zinc-600 opacity-40 group-hover:opacity-100" />
                        <div className="text-3xl font-data font-black text-white">{data.bountyViews}</div>
                        <div className="text-[8px] font-raj font-bold text-zinc-600 tracking-widest uppercase text-center">BOUNTY_PROBES</div>
                    </div>
                    <div className="bg-[#111] border border-zinc-900 p-6 rounded-3xl flex flex-col items-center justify-center gap-2 group transition-all hover:border-zinc-700">
                        <Package size={24} className="text-zinc-600 opacity-40 group-hover:opacity-100" />
                        <div className="text-3xl font-data font-black text-white">{data.gearViews}</div>
                        <div className="text-[8px] font-raj font-bold text-zinc-600 tracking-widest uppercase text-center">ASSET_QUERIES</div>
                    </div>
                </div>
                <div className="mt-8 pt-4 border-t border-zinc-900">
                    <p className="text-center font-inter text-[10px] text-zinc-700 italic">Target reach and node influence updated in real-time.</p>
                </div>
            </div>
        </div>
    );
};

const IDView: React.FC<IDViewProps> = ({ state, updateState, updateTrustScore }) => {
    const { user, home, settings } = state;
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [isSelectingArchetype, setIsSelectingArchetype] = useState(false);
    const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
    
    // Feature States
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [broadcastComplete, setBroadcastComplete] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    
    // Badge State
    const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

    const badges = [
        { id: 'trust_max', icon: ShieldCheck, label: 'TRUST SENTINEL', color: '#CCFF00', description: 'Maintain a Trust Score above 95% for 30 consecutive days.', earned: user.trustScore >= 95 },
        { id: 'gear_lord', icon: Package, label: 'GEAR LOGISTICS', color: '#00E5FF', description: 'Rent out gear items to other operatives 10+ times.', earned: true },
        { id: 'squad_host', icon: Users, label: 'NEXUS COMMAND', color: '#9D00FF', description: 'Successfully host and settle 5+ social squads.', earned: false },
        { id: 'bounty_pro', icon: Target, label: 'SILENT BLADE', color: '#FF3333', description: 'Complete 3 High-Priority bounties without temporal breaches.', earned: true },
        { id: 'bone_whale', icon: Medal, label: 'FINTECH TITAN', color: '#FFD700', description: 'Earn a lifetime total of 5,000+ Bones.', earned: user.lifetimeEarned >= 5000 },
        { id: 'streak_master', icon: Zap, label: 'OVERDRIVE', color: '#FFA500', description: 'Achieve a 14-day mining streak protocol.', earned: home.streak.currentStreak >= 14 }
    ];
    
    // Trust Score Pulse State
    const [pulseState, setPulseState] = useState<'POSITIVE' | 'NEGATIVE' | null>(null);
    const prevScoreRef = useRef(user.trustScore);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Watch for trust score changes to trigger pulse
    useEffect(() => {
        if (user.trustScore !== prevScoreRef.current) {
            const isPositive = user.trustScore > prevScoreRef.current;
            setPulseState(isPositive ? 'POSITIVE' : 'NEGATIVE');
            prevScoreRef.current = user.trustScore;

            const timer = setTimeout(() => {
                setPulseState(null);
            }, 3000); // Pulse for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [user.trustScore]);

    const handleSelectArchetype = async (archetype: Archetype) => {
        setIsSelectingArchetype(false);
        setIsGeneratingAvatar(true);
        try {
            const modelToUse = imageSize === '1K' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';

            // Explicitly check and request key if upscaling to Pro models
            if (modelToUse === 'gemini-3-pro-image-preview') {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await (window as any).aistudio.openSelectKey();
                }
            }

            // Create a new GoogleGenAI instance right before the call to ensure it uses the latest selected key
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const config: any = {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            };
            if (modelToUse === 'gemini-3-pro-image-preview') {
                config.imageConfig.imageSize = imageSize;
            }

            const response = await ai.models.generateContent({
                model: modelToUse,
                contents: {
                    parts: [{ text: archetype.prompt }]
                },
                config: config
            });

            // Find image part in response
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64 = `data:image/png;base64,${part.inlineData.data}`;
                    updateState(s => ({ ...s, user: { ...s.user, avatarImage: base64 } }));
                    break;
                }
            }
        } catch (error: any) {
            console.error("Avatar generation failed", error);
            const errorMsg = JSON.stringify(error).toLowerCase();
            const errorMessageStr = (error?.message || "").toLowerCase();
            if (errorMsg.includes("403") || errorMsg.includes("permission") || errorMsg.includes("not found") || errorMessageStr.includes("403") || errorMessageStr.includes("permission") || errorMessageStr.includes("not found")) {
                await (window as any).aistudio.openSelectKey();
            }
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const handleCommitChanges = () => {
        setIsSavingSettings(true);
        setTimeout(() => {
            setIsSavingSettings(false);
            setIsSettingsOpen(false);
            updateState(s => ({
                ...s,
                notificationToast: {
                    visible: true,
                    message: "NODE_STATION: PROTOCOLS_UPDATED",
                    amount: 0
                }
            }));
        }, 1200);
    };

    const handleBroadcast = () => {
        setIsBroadcasting(true);
        setBroadcastComplete(false);
        const profileLink = `https://gsd.os/profile/${user.id}`;
        navigator.clipboard.writeText(profileLink).catch(err => console.error('Clip copy failed', err));

        setTimeout(() => {
            setBroadcastComplete(true);
            setTimeout(() => {
                setIsBroadcasting(false);
                setBroadcastComplete(false);
            }, 2500);
        }, 1500);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateState(s => ({ ...s, user: { ...s.user, avatarImage: reader.result as string } }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Corrected User ID Logic from Prompt
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(user.id)}&color=CCFF00&bgcolor=000000`;

    // Safe badge selection logic
    const selectedBadge = selectedBadgeId ? badges.find(b => b.id === selectedBadgeId) : null;

    return (
        <div className="h-full bg-black overflow-y-auto no-scrollbar scroll-smooth relative">
            <TrustDetailsModal isOpen={isTrustModalOpen} onClose={() => setIsTrustModalOpen(false)} score={user.trustScore} history={user.trustHistory} />
            <SelfDossierModal isOpen={isDossierOpen} onClose={() => setIsDossierOpen(false)} user={user} />
            <NodeAnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
            
            {isBroadcasting && (
                <div className="fixed inset-0 z-[9000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-[#0A0A0A] border border-[#CCFF00]/30 rounded-[2.5rem] p-8 w-full max-w-[320px] text-center shadow-[0_0_100px_rgba(204,255,0,0.1)] overflow-hidden relative">
                         <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="whitespace-nowrap font-data text-[6px] text-[#CCFF00] animate-pulse">TRANSMITTING_NODE_DATA_ID_{user.id}_UPLINK_STABLE</div>
                            ))}
                        </div>
                        
                        {!broadcastComplete ? (
                            <div className="py-6 space-y-6">
                                <div className="relative mx-auto w-20 h-20">
                                    <Radio size={48} className="text-[#CCFF00] absolute inset-0 m-auto animate-pulse" />
                                    <div className="absolute inset-0 border-2 border-[#CCFF00] rounded-full animate-ping opacity-30"></div>
                                    <div className="absolute inset-[-10px] border border-[#CCFF00]/20 rounded-full animate-spin duration-[4s]"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[#CCFF00] font-raj font-black text-[10px] tracking-[0.4em] uppercase italic mb-1">BROADCAST_UPLINK</div>
                                    <div className="text-white font-raj font-bold text-lg uppercase tracking-tight">TRANSMITTING...</div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 space-y-6 animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-[#CCFF00]/10 border border-[#CCFF00]/40 rounded-full mx-auto flex items-center justify-center text-[#CCFF00]">
                                    <CheckCircle2 size={40} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[#CCFF00] font-raj font-black text-[10px] tracking-[0.4em] uppercase italic mb-1">LINK_SECURED</div>
                                    <div className="text-white font-raj font-bold text-lg uppercase tracking-tight">PROFILE COPIED</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isSettingsOpen && (
                <div className="fixed inset-0 z-[8000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-zinc-900 rounded-[3rem] p-8 shadow-3xl relative overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <div className="text-[#CCFF00] font-raj font-black text-[9px] tracking-[0.4em] uppercase italic">NODE_CONFIGURATION</div>
                                <h2 className="text-white font-raj font-black text-2xl uppercase tracking-tighter mt-1 italic">SYSTEM_PREFS</h2>
                            </div>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-700 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-1">
                            {[
                                { 
                                    label: 'NOTIFICATIONS', 
                                    desc: 'Priority push updates on rentals/bounties', 
                                    icon: Bell, 
                                    active: settings.notifications,
                                    key: 'notifications'
                                },
                                { 
                                    label: 'BIOMETRIC_VAULT', 
                                    desc: 'Fast node sync via fingerprint or retina', 
                                    icon: Fingerprint, 
                                    active: true,
                                    key: 'biometric'
                                },
                                { 
                                    label: 'HAPTIC_FEEDBACK', 
                                    desc: 'Tactile vibration on protocol execution', 
                                    icon: Smartphone, 
                                    active: settings.haptics,
                                    key: 'haptics'
                                },
                                { 
                                    label: 'STEALTH_MODE', 
                                    desc: 'Hide analytics from ecosystem feed', 
                                    icon: EyeOff, 
                                    active: !settings.analyticsEnabled,
                                    key: 'analyticsEnabled'
                                }
                            ].map(item => (
                                <button 
                                    key={item.label}
                                    onClick={() => updateState(s => {
                                        if (item.key === 'biometric') return s; // Simulation only for this setting

                                        const newValue = item.key === 'analyticsEnabled' 
                                            ? !s.settings.analyticsEnabled 
                                            : !s.settings[item.key as keyof typeof s.settings];
                                        
                                        return { 
                                            ...s, 
                                            settings: { 
                                                ...s.settings, 
                                                [item.key]: newValue 
                                            } 
                                        };
                                    })}
                                    className={`w-full bg-[#111] border p-5 rounded-2xl flex items-center justify-between group transition-all ${item.active ? 'border-[#CCFF00]/40 shadow-[inset_0_0_20px_rgba(204,255,0,0.05)]' : 'border-zinc-900 hover:border-zinc-700'}`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${item.active ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40 text-[#CCFF00]' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                                            <item.icon size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className={`font-raj font-black text-[13px] tracking-widest uppercase transition-colors ${item.active ? 'text-white' : 'text-zinc-500'}`}>{item.label}</div>
                                            <div className="text-zinc-600 font-inter text-[10px] italic">{item.desc}</div>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${item.active ? 'bg-[#CCFF00]' : 'bg-zinc-800'}`}>
                                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-300 ${item.active ? 'bg-black right-1' : 'bg-zinc-600 left-1'}`}></div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-900">
                             <button 
                                disabled={isSavingSettings}
                                onClick={handleCommitChanges} 
                                className="w-full bg-[#CCFF00] text-black py-4 rounded-xl font-raj font-black text-xs tracking-widest uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isSavingSettings ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        SYNCING_NODE...
                                    </>
                                ) : (
                                    'COMMIT_CHANGES'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isQrOpen && (
                <div className="fixed inset-0 z-[8500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-[360px] bg-[#0A0A0A] border border-zinc-900 rounded-[3rem] p-10 shadow-[0_0_120px_rgba(204,255,0,0.2)] relative overflow-hidden flex flex-col items-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent opacity-60"></div>
                        
                        <button onClick={() => setIsQrOpen(false)} className="absolute top-6 right-8 text-zinc-700 hover:text-white transition-colors active:scale-90">
                            <X size={28} />
                        </button>

                        <div className="text-center mb-10 mt-4">
                            <div className="text-[#CCFF00] font-raj font-black text-[11px] tracking-[0.5em] uppercase italic mb-2">IDENTIFIER_UPLINK</div>
                            <h2 className="text-white font-raj font-black text-3xl uppercase tracking-tighter leading-none italic drop-shadow-lg">SECURE_NODE_ID</h2>
                        </div>

                        <div className="relative group mb-10">
                            <div className="absolute -inset-4 border border-[#CCFF00]/10 rounded-[2rem] animate-pulse"></div>
                            
                            {/* Refined Tactical Corners per Screenshot */}
                            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[#CCFF00] z-20"></div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-[#CCFF00] z-20"></div>
                            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-[#CCFF00] z-20"></div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#CCFF00] z-20"></div>
                            
                            <div className="bg-black p-5 rounded-2xl border border-zinc-900 shadow-[0_0_60px_rgba(204,255,0,0.1)]">
                                <img 
                                    src={qrCodeUrl} 
                                    alt="Identification QR Code" 
                                    className="w-[220px] h-[220px] block transition-transform group-hover:scale-[1.02] duration-700 brightness-110" 
                                />
                            </div>
                        </div>

                        <div className="w-full space-y-4 text-center">
                            <div className="w-full py-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl transition-all flex items-center justify-center">
                                <span className="text-[#CCFF00] font-raj font-black text-lg tracking-[0.3em] uppercase">{user.id}</span>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(user.id);
                                    alert("NODE_ID COPIED TO CLIPBOARD");
                                }}
                                className="flex items-center gap-2 text-zinc-600 hover:text-zinc-400 font-raj font-black text-[10px] tracking-[0.3em] uppercase transition-colors mx-auto active:scale-95"
                            >
                                <Copy size={14} /> COPY_NODE_ID
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isSelectingArchetype && (
                <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-zinc-900 rounded-[3rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent opacity-30"></div>
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div>
                                <div className="text-[#CCFF00] font-raj font-black text-[9px] tracking-[0.4em] uppercase italic">ARCHETYPE_LIBRARY</div>
                                <h2 className="text-white font-raj font-black text-2xl uppercase tracking-tighter mt-1 italic">SELECT_YOUR_CLASS</h2>
                            </div>
                            <button onClick={() => setIsSelectingArchetype(false)} className="text-zinc-700 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 shrink-0 shadow-inner">
                            <div className="flex items-center gap-2 mb-4">
                                <MonitorPlay size={14} className="text-[#CCFF00]" />
                                <span className="text-zinc-400 font-raj font-black text-[9px] tracking-[0.3em] uppercase italic">OUTPUT_RESOLUTION_OVERRIDE</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {(['1K', '2K', '4K'] as const).map(size => (
                                    <button 
                                        key={size}
                                        onClick={() => setImageSize(size)}
                                        className={`py-3 rounded-xl font-raj font-black text-[11px] tracking-widest transition-all border ${
                                            imageSize === size 
                                            ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]' 
                                            : 'bg-black text-zinc-600 border-zinc-800 hover:border-zinc-700'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 flex items-center gap-1.5 px-1">
                                <Zap size={10} className={imageSize !== '1K' ? 'text-[#CCFF00]' : 'text-zinc-700'} />
                                <span className={`text-[8px] font-data font-bold uppercase tracking-widest ${imageSize !== '1K' ? 'text-[#CCFF00]' : 'text-zinc-700'}`}>
                                    {imageSize === '1K' ? 'CORE_ENGINE' : 'GEMINI-3_PRO_UPSCALE'}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar pb-6">
                            {ARCHETYPES.map((arc) => (
                                <button 
                                    key={arc.id}
                                    onClick={() => handleSelectArchetype(arc)}
                                    className="w-full bg-[#111] border border-zinc-900 rounded-2xl p-5 text-left flex items-center gap-5 group hover:border-zinc-700 active:scale-[0.98] transition-all"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-black border border-zinc-800 flex items-center justify-center relative shrink-0">
                                        <div className="absolute inset-0 opacity-10 blur-md rounded-xl" style={{ backgroundColor: arc.color }}></div>
                                        <arc.icon size={28} style={{ color: arc.color }} className="relative z-10 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-raj font-black text-base text-white tracking-widest uppercase mb-1 flex items-center gap-2">
                                            {arc.name}
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: arc.color }}></div>
                                        </div>
                                        <p className="text-zinc-600 font-inter text-[11px] leading-tight italic line-clamp-2">
                                            {arc.description}
                                        </p>
                                    </div>
                                    <ChevronRight size={18} className="text-zinc-800 group-hover:text-white transition-colors" />
                                </button>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-zinc-900/50 mt-auto shrink-0">
                            <p className="text-center text-[8px] font-data text-zinc-800 uppercase tracking-widest leading-relaxed">
                                SELECTION TRIGGERS GEMINI-3 PRO PROTOCOL.<br/>
                                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[#CCFF00] underline">BILLING_VERIFICATION_REQUIRED</a>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative w-full h-56 bg-black overflow-hidden border-b border-[#CCFF00]/40 shrink-0 shadow-[0_10px_40px_rgba(204,255,0,0.1)]">
                <div className="absolute inset-0 arcade-canvas overflow-hidden">
                    <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-48 h-48 rounded-full synth-sun">
                        <div className="sun-scanlines"></div>
                    </div>
                    <div className="absolute top-[60%] w-full h-[2px] bg-[#CCFF00] shadow-[0_0_25px_#CCFF00]"></div>
                    <div className="arcade-grid-container">
                        <div className="arcade-grid-lines"></div>
                    </div>
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 z-10 flex flex-col">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#FF0000]"></div>
                                <span className="text-[11px] font-data text-white font-black tracking-widest italic uppercase drop-shadow-lg">PLAYER_01: {user.name}</span>
                            </div>
                            <div className="text-[9px] font-data text-[#00E5FF] mt-1 font-bold tracking-tighter">UPLINK_STATUS: <span className="text-[#CCFF00] brightness-150">OPTIMAL</span></div>
                        </div>
                        <div className="absolute top-4 right-4 z-10 text-right">
                            <div className="text-[11px] font-data text-[#FFD700] font-black tracking-tighter drop-shadow-md">HI-SCORE: {user.lifetimeEarned.toLocaleString()}</div>
                            <div className="text-[8px] font-data text-zinc-400 mt-1 uppercase font-bold tracking-widest">NODE_LATENCY: 8ms</div>
                        </div>
                        <div className="bit-node bit-1"></div>
                        <div className="bit-node bit-2"></div>
                        <div className="bit-node bit-3"></div>
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>

            <div className="px-5 -mt-12 relative z-20 pb-32">
                <div className="flex items-end gap-5 mb-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-[#CCFF00] to-transparent rounded-[2rem] blur-md opacity-30 animate-pulse"></div>
                        <div className="w-28 h-28 bg-zinc-900 rounded-3xl border-2 border-[#CCFF00]/40 overflow-hidden shadow-[0_0_40px_rgba(204,255,0,0.2)] relative z-10">
                            {user.avatarImage ? (
                                <img src={user.avatarImage} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
                                    <span className="text-white font-raj font-black text-5xl italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{user.name[0]}</span>
                                </div>
                            )}
                            {isGeneratingAvatar && (
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="text-[#CCFF00] animate-spin" size={28} />
                                        <span className="text-[9px] font-raj font-black text-[#CCFF00] tracking-widest uppercase italic">SYNCING_{imageSize}...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button 
                            disabled={isGeneratingAvatar}
                            onClick={() => setIsSelectingArchetype(true)}
                            className="absolute -bottom-2 -right-2 bg-[#CCFF00] text-black p-2.5 rounded-xl shadow-[0_10px_20px_rgba(204,255,0,0.4)] active:scale-95 transition-all hover:bg-[#DFFF33] border-4 border-black z-20"
                            title="Avatar Architect"
                        >
                            <Wand2 size={18} />
                        </button>
                        <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </div>

                    <div className="flex-1 pb-2">
                        <div className="flex items-center gap-3 mb-1.5">
                            <h1 className="text-white font-raj font-black text-4xl italic uppercase leading-none tracking-tight drop-shadow-xl">{user.name}</h1>
                            <div className="w-5 h-5 rounded-full bg-[#00E5FF]/30 flex items-center justify-center border border-[#00E5FF]/40 shadow-[0_0_10px_#00E5FF66]">
                                <ShieldCheck size={12} className="text-[#00E5FF]" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-zinc-400 font-data text-[11px] font-bold tracking-[0.2em] uppercase">
                                RANK: <span className="text-white">{user.rank}</span>
                            </div>
                            <span className="text-zinc-800">|</span>
                            <button 
                                onClick={() => setIsTrustModalOpen(true)}
                                className={`px-3 py-1 rounded-md font-black transition-all hover:scale-105 active:scale-95 relative overflow-hidden shadow-[0_0_20px_rgba(204,255,0,0.3)] ${
                                    pulseState === 'POSITIVE' ? 'animate-pulse-positive bg-[#CCFF00] text-black' : 
                                    pulseState === 'NEGATIVE' ? 'animate-pulse-negative bg-red-600 text-white' : 
                                    'bg-[#CCFF00] text-black'
                                }`}
                            >
                                <span className="text-[10px] tracking-tighter">TRUST_INDEX: {user.trustScore}%</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-zinc-800 p-6 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden group shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Bone size={40} className="text-[#FFD700]" />
                        </div>
                        <div className="text-zinc-500 font-raj font-bold text-[11px] tracking-[0.2em] uppercase italic">LIFETIME_MINED</div>
                        <div className="text-white font-data font-black text-3xl flex items-center gap-2 drop-shadow-md">
                            {user.lifetimeEarned.toLocaleString()} <Bone size={20} className="text-[#FFD700] drop-shadow-[0_0_8px_#FFD700]" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#CCFF00]/20 p-6 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden group shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(204,255,0,0.02)]">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Activity size={40} className="text-[#CCFF00]" />
                        </div>
                        <div className="text-zinc-500 font-raj font-bold text-[11px] tracking-[0.2em] uppercase italic">NODE_BALANCE</div>
                        <div className="text-[#CCFF00] font-data font-black text-3xl flex items-center gap-2 drop-shadow-[0_0_10px_rgba(204,255,0,0.3)]">
                            {home.boneBalance.toLocaleString()} <ArrowUpRight size={22} className="animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Animated Cubical Icon Actions Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <button 
                        onClick={handleBroadcast}
                        className="aspect-square bg-[#0D0D0D] border border-zinc-800 text-white rounded-[2rem] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all duration-500 hover:border-[#00E5FF] hover:scale-[1.05] hover:shadow-[0_0_50px_rgba(0,229,255,0.3)] group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00E5FF_2px,#00E5FF_4px)]"></div>
                        <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-[#00E5FF] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:top-2 group-hover:left-2"></div>
                        <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-[#00E5FF] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:top-2 group-hover:right-2"></div>
                        <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-[#00E5FF] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bottom-2 group-hover:left-2"></div>
                        <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-[#00E5FF] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bottom-2 group-hover:right-2"></div>
                        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:animate-sweep pointer-events-none"></div>
                        <div className="relative">
                           <div className="absolute inset-0 bg-[#00E5FF]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full scale-150"></div>
                           <Share2 size={28} className="text-[#00E5FF] drop-shadow-[0_0_15px_rgba(0,229,255,0.8)] group-hover:rotate-6 transition-all duration-300 relative z-10" />
                        </div>
                        <span className="font-raj font-black text-[10px] tracking-[0.3em] uppercase italic leading-none group-hover:text-white transition-colors duration-300 relative z-10">SHARE</span>
                    </button>
                    
                    <button 
                        onClick={() => setIsQrOpen(true)}
                        className="aspect-square bg-[#111] border border-zinc-800 text-[#CCFF00] rounded-[1.5rem] flex flex-col items-center justify-center gap-2 active:scale-90 transition-all hover:border-[#CCFF00]/60 shadow-lg group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[#CCFF00]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none animate-flicker-subtle"></div>
                        <QrCode size={24} className="drop-shadow-[0_0_8px_#CCFF00] group-hover:rotate-6 transition-transform" />
                        <span className="font-raj font-black text-[9px] tracking-widest uppercase italic leading-none group-hover:brightness-125 transition-all">UPLINK</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <button 
                        onClick={() => setIsDossierOpen(true)}
                        className="h-20 bg-[#111] border border-zinc-800 text-white rounded-[1.5rem] flex items-center justify-center gap-3 active:scale-90 transition-all hover:border-[#00E5FF]/40 shadow-lg group relative overflow-hidden"
                    >
                        <FileText size={20} className="text-[#00E5FF] group-hover:scale-110 transition-transform" />
                        <span className="font-raj font-black text-[10px] tracking-widest uppercase italic leading-none">DOSSIER</span>
                    </button>
                    <button 
                        onClick={() => setIsAnalyticsOpen(true)}
                        className="h-20 bg-[#111] border border-zinc-800 text-white rounded-[1.5rem] flex items-center justify-center gap-3 active:scale-90 transition-all hover:border-[#CCFF00]/40 shadow-lg group relative overflow-hidden"
                    >
                        <BarChart3 size={20} className="text-[#CCFF00] animate-pulse" />
                        <span className="font-raj font-black text-[10px] tracking-widest uppercase italic leading-none">INSIGHTS</span>
                    </button>
                </div>

                <div className="space-y-5">
                    <div className="flex items-center justify-between px-3">
                        <div className="flex items-center gap-3">
                            <Award size={18} className="text-[#FFD700] drop-shadow-[0_0_8px_#FFD700]" />
                            <h3 className="text-zinc-400 font-raj font-bold text-[12px] tracking-[0.4em] uppercase italic">BADGES_OF_HONOR</h3>
                        </div>
                    </div>

                    <div className="bg-gradient-to-b from-[#0F0F0F] to-black border border-zinc-900 rounded-[3rem] p-7 relative overflow-hidden shadow-inner">
                        {selectedBadge ? (
                            <div className="mb-8 bg-[#CCFF00]/5 border border-[#CCFF00]/20 p-6 rounded-[2rem] animate-in slide-in-from-top-3 duration-300 shadow-[inset_0_0_30px_rgba(204,255,0,0.05)]">
                                <div className="flex items-center gap-5 mb-4">
                                    <div className="p-4 bg-black rounded-[1.5rem] border border-zinc-800 shadow-xl">
                                        {React.createElement(selectedBadge.icon, { size: 32, style: { color: selectedBadge.color } })}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white font-raj font-black text-xl uppercase tracking-[0.15em] leading-none mb-1.5 drop-shadow-md">
                                            {selectedBadge.label}
                                        </div>
                                        <div className={`text-[9px] font-data font-black uppercase tracking-[0.3em] flex items-center gap-2 ${selectedBadge.earned ? 'text-[#CCFF00]' : 'text-zinc-600'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedBadge.earned ? 'bg-[#CCFF00] animate-pulse' : 'bg-zinc-800'}`}></div>
                                            {selectedBadge.earned ? 'STATUS: ACTIVE' : 'STATUS: LOCKED'}
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedBadgeId(null)} className="text-zinc-700 hover:text-white transition-colors active:scale-90 p-1"><X size={20}/></button>
                                </div>
                                <p className="text-zinc-400 font-inter text-[13px] leading-relaxed italic px-1">
                                    "{selectedBadge.description}"
                                </p>
                            </div>
                        ) : null}

                        <div className="grid grid-cols-3 gap-5">
                            {badges.map((badge) => (
                                <button 
                                    key={badge.id}
                                    onClick={() => setSelectedBadgeId(selectedBadgeId === badge.id ? null : badge.id)}
                                    className={`relative flex flex-col items-center justify-center p-6 rounded-[1.5rem] border transition-all duration-400 active:scale-95 overflow-hidden ${
                                        selectedBadgeId === badge.id ? 'border-[#CCFF00] bg-[#CCFF00]/10 shadow-[0_0_25px_rgba(204,255,0,0.15),inset_0_0_10px_rgba(204,255,0,0.05)]' : 
                                        badge.earned ? 'border-zinc-800 bg-[#111] hover:border-[#CCFF00]/30 hover:bg-[#1A1A1A]' : 'border-zinc-900 bg-black/60 opacity-30 grayscale'
                                    }`}
                                >
                                    {badge.earned && (
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                            <div className="absolute top-[-50%] left-[-60%] w-[25%] h-[200%] bg-white/5 rotate-[35deg] animate-badge-shine"></div>
                                        </div>
                                    )}

                                    <badge.icon 
                                        size={32} 
                                        style={{ color: badge.earned ? (selectedBadgeId === badge.id ? '#CCFF00' : badge.color) : '#222' }} 
                                        className={`transition-all duration-500 ${selectedBadgeId === badge.id ? 'scale-115 drop-shadow-[0_0_10px_#CCFF00]' : ''} ${badge.earned ? 'animate-badge-glow' : ''}`}
                                    />
                                    <div className={`mt-4 text-[8px] font-raj font-black tracking-[0.2em] text-center uppercase leading-tight transition-colors ${selectedBadgeId === badge.id ? 'text-[#CCFF00]' : 'text-zinc-500'}`}>
                                        {badge.label.split(' ')[0]}<br/>{badge.label.split(' ')[1] || ''}
                                    </div>
                                    
                                    {badge.earned && !selectedBadgeId && (
                                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#CCFF00] shadow-[0_0_10px_#CCFF00] animate-pulse"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .arcade-canvas {
                    background: radial-gradient(circle at bottom, #1A0033 0%, #000000 100%);
                }
                .synth-sun {
                    background: linear-gradient(to bottom, #CCFF00 0%, #00E5FF 100%);
                    box-shadow: 0 0 70px rgba(204,255,0,0.5);
                    clip-path: circle(50% at 50% 50%);
                }
                .sun-scanlines {
                    position: absolute;
                    inset: 0;
                    background: repeating-linear-gradient(
                        to bottom,
                        transparent,
                        transparent 6px,
                        #000 6px,
                        #000 10px
                    );
                    opacity: 0.25;
                }
                .arcade-grid-container {
                    position: absolute;
                    top: 60%;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    perspective: 150px;
                    overflow: hidden;
                }
                .arcade-grid-lines {
                    position: absolute;
                    top: 0;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background-image: 
                        linear-gradient(to bottom, #CCFF00 1px, transparent 1px),
                        linear-gradient(to right, #CCFF00 1px, transparent 1px);
                    background-size: 35px 35px;
                    transform: rotateX(75deg);
                    transform-origin: top center;
                    animation: grid-flow 1.5s linear infinite;
                    opacity: 0.3;
                }
                @keyframes grid-flow {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 35px; }
                }
                .bit-node {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: #CCFF00;
                    box-shadow: 0 0 15px #CCFF00;
                    border-radius: 1px;
                }
                .bit-1 { top: 70%; left: 15%; animation: particle-float 2.5s infinite linear; }
                .bit-2 { top: 85%; left: 85%; animation: particle-float 3.5s infinite linear reverse; }
                .bit-3 { top: 60%; left: 45%; animation: particle-float 4.5s infinite linear; }
                @keyframes particle-float {
                    0% { transform: translateY(0) scale(1.2); opacity: 0; }
                    30% { opacity: 1; }
                    100% { transform: translateY(-120px) scale(0.4); opacity: 0; }
                }

                @keyframes sweep {
                    0% { transform: translate(-100%, -100%) rotate(45deg); }
                    100% { transform: translate(100%, 100%) rotate(45deg); }
                }
                .animate-sweep {
                    animation: sweep 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }

                @keyframes pulse-green {
                    0% { box-shadow: 0 0 0 0 rgba(204, 255, 0, 0.8); transform: scale(1); }
                    50% { box-shadow: 0 0 30px 15px rgba(204, 255, 0, 0); transform: scale(1.1); }
                    100% { box-shadow: 0 0 0 0 rgba(204, 255, 0, 0); transform: scale(1); }
                }

                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.8); transform: scale(1); }
                    50% { box-shadow: 0 0 30px 15px rgba(220, 38, 38, 0); transform: scale(1.1); }
                    100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); transform: scale(1); }
                }

                @keyframes badge-shine {
                    0% { left: -100%; }
                    15% { left: 120%; }
                    100% { left: 120%; }
                }

                @keyframes badge-glow {
                    0%, 100% { opacity: 1; filter: drop-shadow(0 0 5px currentColor); }
                    50% { opacity: 0.7; filter: drop-shadow(0 0 15px currentColor); }
                }

                .animate-badge-shine {
                    animation: badge-shine 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }

                .animate-badge-glow {
                    animation: badge-glow 3s ease-in-out infinite;
                }

                .animate-pulse-positive {
                    animation: pulse-green 0.8s infinite cubic-bezier(0.66, 0, 0, 1);
                }

                .animate-pulse-negative {
                    animation: pulse-red 0.8s infinite cubic-bezier(0.66, 0, 0, 1);
                }

                .animate-spin-slow {
                    animation: spin 6s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes button-breathing {
                    0%, 100% { box-shadow: 0 15px 30px rgba(204, 255, 0, 0.25); filter: brightness(1); }
                    50% { box-shadow: 0 15px 40px rgba(204, 255, 0, 0.4); filter: brightness(1.1); }
                }
                .animate-button-breathing {
                    animation: button-breathing 4s ease-in-out infinite;
                }

                @keyframes bounce-short {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-bounce-short {
                    animation: bounce-short 1s ease-in-out infinite;
                }

                @keyframes flicker-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.85; }
                    51% { opacity: 0.95; }
                    52% { opacity: 0.8; }
                }
                .animate-flicker-subtle {
                    animation: flicker-subtle 3s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default IDView;
