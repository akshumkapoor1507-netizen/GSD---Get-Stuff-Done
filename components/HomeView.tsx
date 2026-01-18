import React, { useState, useEffect, useRef } from 'react';
/* Added Upload to fix "Cannot find name 'Upload'" error. */
/* Added Fingerprint to fix "Cannot find name 'Fingerprint'" error on line 873. */
import { Flame, Crown, Settings, ChevronRight, X, ArrowLeft, Bone, Gamepad2, Skull, Package, Ticket, CheckCircle, FileText, Phone, Plus, Bell, Smartphone, User, LogOut, CheckSquare, Square, Target, Moon, Sun, Edit2, Download, AlertTriangle, Loader2, Lock, IceCream, Zap, ChevronLeft, CheckCircle2, Award, Frame, Sparkles, Palette, ShieldAlert, Cpu, Share2, Layers, Inbox, Clock, Radio, Trophy, Users, ShieldCheck, Activity, Trash2, ShoppingBag, Receipt, Gavel, Upload, Shield, Fingerprint, Terminal } from 'lucide-react';
import { AppState, Reward, Task, AppNotification } from '../types';
import { GoogleGenAI } from "@google/genai";

interface HomeViewProps {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
}

const AnimatedNumber = ({ value, id, className, style }: { value: number; id?: string; className?: string; style?: React.CSSProperties }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [flashClass, setFlashClass] = useState("");
    const prevValueRef = useRef(value);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            setDisplayValue(value);
            prevValueRef.current = value;
            firstRender.current = false;
            return;
        }

        const startValue = prevValueRef.current;
        const endValue = value;

        if (startValue !== endValue) {
            const isDeduction = endValue < startValue;
            setFlashClass(isDeduction ? "data-flash-neg" : "data-flash-pos");
            
            const duration = 1200; 
            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(startValue + (endValue - startValue) * easeOut);
                
                setDisplayValue(current);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    prevValueRef.current = endValue;
                    setDisplayValue(endValue);
                    setTimeout(() => setFlashClass(""), 500);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [value]);

    return (
        <span id={id} className={`${flashClass} ${className}`} style={style}>
            {displayValue.toLocaleString()}
        </span>
    );
};

const HomeView: React.FC<HomeViewProps> = ({ state, updateState }) => {
    const { home, settings, notifications, user } = state;
    const [isUnlocking, setIsUnlocking] = useState<number | null>(null);
    const [confirmingReward, setConfirmingReward] = useState<Reward | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isBalanceFlipped, setIsBalanceFlipped] = useState(false);
    
    // Add Task Modal State
    const [newTaskText, setNewTaskText] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [lastCompletedTaskId, setLastCompletedTaskId] = useState<string | null>(null);

    // Notification Discard Logic
    const [isClearingAll, setIsClearingAll] = useState(false);

    // Premium Modal Interaction State
    const [glitchIntensity, setGlitchIntensity] = useState(0);
    const [isSpinningFast, setIsSpinningFast] = useState(false);
    const glitchTimeout = useRef<number | null>(null);

    const NEXT_LEVEL_THRESHOLD = 5000;
    const CIRCUMFERENCE = 2 * Math.PI * 90;
    const currentProgressPercentage = Math.min(home.boneBalance / NEXT_LEVEL_THRESHOLD, 1);
    const dashOffset = CIRCUMFERENCE - (currentProgressPercentage * CIRCUMFERENCE);

    const isDark = settings.darkMode;
    const theme = {
        sheetBg: isDark ? '#000000' : '#FFFFFF',
        textMain: isDark ? '#FFFFFF' : '#000000',
        textSub: isDark ? '#666666' : '#888888',
        border: isDark ? '#1A1A1A' : '#E0E0E0',
        rowBg: isDark ? '#0A0A0A' : '#F5F5F5',
        cardBg: isDark ? '#0A0A0A' : '#FFFFFF',
        subtleBorder: isDark ? '#1A1A1A' : '#E5E5E5',
    };

    const activeTasksCount = home.tasks.filter(t => !t.completed).length;
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const toggleTask = (taskId: string) => {
        const task = home.tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            setLastCompletedTaskId(taskId);
            // Reset after animation
            setTimeout(() => setLastCompletedTaskId(null), 500);
        }

        updateState(s => ({
            ...s,
            home: {
                ...s.home,
                tasks: s.home.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
            }
        }));
    };

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        setIsDeploying(true);
        
        setTimeout(() => {
            const newTask: Task = {
                id: `T-${Date.now()}`,
                text: newTaskText,
                completed: false
            };

            updateState(s => ({
                ...s,
                home: {
                    ...s.home,
                    isAddTaskModalOpen: false,
                    tasks: [...s.home.tasks, newTask]
                },
                notificationToast: {
                    visible: true,
                    message: "MISSION_LOGGED: OBJECTIVE_ACTIVE",
                    amount: 0
                }
            }));
            setNewTaskText('');
            setIsDeploying(false);
        }, 800);
    };

    const handleRefineTask = async () => {
        if (!newTaskText.trim()) return;
        setIsRefining(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Convert this simple personal objective into a highly tactical, industrial-fintech mission directive for a cyberpunk OS. 
                ORIGINAL: "${newTaskText}"
                Maintain the core intent but use cool, technical, or operative terminology. 
                MAX LENGTH: 25 words. 
                FORMAT: One single line of text.`
            });
            if (response.text) {
                setNewTaskText(response.text.trim().toUpperCase());
            }
        } catch (error) {
            console.error("Task refinement failed", error);
        } finally {
            setIsRefining(false);
        }
    };

    const handleUnlockClick = (reward: Reward) => {
        if (home.boneBalance < reward.cost) {
            alert("INSUFFICIENT_BONES: Protocol denied.");
            return;
        }
        setConfirmingReward(reward);
    };

    const confirmRedemption = () => {
        if (!confirmingReward) return;
        const reward = confirmingReward;
        
        setConfirmingReward(null);
        setIsUnlocking(reward.id);
        
        // Simulate processing time
        setTimeout(() => {
            updateState(s => ({
                ...s,
                home: {
                    ...s.home,
                    boneBalance: home.boneBalance - reward.cost,
                    isPurchaseSuccess: true,
                    activeUnlockItem: reward
                },
                user: {
                    ...s.user,
                    history: [{
                        id: `RW-${Date.now()}`,
                        type: 'SPEND',
                        amount: reward.cost,
                        description: `Unlocked: ${reward.title}`,
                        timestamp: new Date().toISOString().substring(0, 16).replace('T', ' ')
                    }, ...s.user.history]
                }
            }));
            setIsUnlocking(null);
            setShowSuccessPopup(true);
            
            // Automatic dismissal after 2 seconds
            setTimeout(() => {
                setShowSuccessPopup(false);
                // Clear victory state after animation
                updateState(s => ({
                    ...s,
                    home: {
                        ...s.home,
                        isPurchaseSuccess: false,
                        activeUnlockItem: null
                    }
                }));
            }, 2500); // Extended slightly to let the "Chest Unlock" animation breathe
        }, 1200); // Processing cycle
    };

    const handlePremiumCoreTap = () => {
        setGlitchIntensity(prev => Math.min(prev + 2, 12));
        setIsSpinningFast(true);
        if (glitchTimeout.current) clearTimeout(glitchTimeout.current);
        glitchTimeout.current = window.setTimeout(() => {
            setGlitchIntensity(0);
            setIsSpinningFast(false);
        }, 1200);
    };

    const handleOpenNotifications = () => {
        updateState(s => ({
            ...s,
            home: { ...s.home, isNotificationsOpen: true },
            notifications: s.notifications.map(n => ({ ...n, isRead: true }))
        }));
    };

    const clearNotification = (id: string) => {
        updateState(s => ({
            ...s,
            notifications: s.notifications.filter(n => n.id !== id)
        }));
    };

    const handleClearAllAlerts = () => {
        if (notifications.length === 0) return;
        
        setIsClearingAll(true);
        
        // Wait for fly-away animation (approx 600ms) before clearing state
        setTimeout(() => {
            updateState(s => ({ ...s, notifications: [] }));
            setIsClearingAll(false);
        }, 800);
    };

    /**
     * Tactical Router for Notifications.
     * Deep-links to specific app sectors based on notification heuristics.
     */
    const handleNotificationClick = (notif: AppNotification) => {
        const title = notif.title.toUpperCase();
        const message = notif.message.toUpperCase();
        
        updateState(s => {
            let nextTab: any = s.activeBottomTab;
            let squadSubTab = s.squad.activeSubTab;
            let hubCategory = s.hub.activeCategory;
            let hubMode = s.hub.activeMode;
            let rentalSubTab = s.hub.activeRentalSubTab;
            let marketSubTab = s.hub.activeMarketSubTab;
            let bountySubTab = s.hub.activeBountySubTab;

            // Decision Matrix for Granular Sub-Tab Routing
            if (title.includes('MISSION') || title.includes('WORK') || title.includes('TIMEOUT') || message.includes('DEADLINE')) {
                nextTab = 'HUB';
                hubCategory = 'BOUNTIES';
                bountySubTab = 'ACCEPTED';
            } else if (title.includes('YIELD') || title.includes('STOCK') || message.includes('RETURNED')) {
                nextTab = 'HUB';
                hubCategory = 'GEAR';
                hubMode = 'RENTALS';
                rentalSubTab = 'MY_STOCK';
            } else if (title.includes('REQUEST') || title.includes('PROBE')) {
                nextTab = 'HUB';
                hubCategory = 'GEAR';
                hubMode = 'RENTALS';
                rentalSubTab = 'REQUESTS';
            } else if (title.includes('POST') || title.includes('RECRUITMENT') || message.includes('APPLICANT')) {
                nextTab = 'HUB';
                hubCategory = 'BOUNTIES';
                bountySubTab = 'MY_POSTS';
            } else if (title.includes('LOGISTICS') || title.includes('ORDER') || message.includes('TRANSIT')) {
                nextTab = 'HUB';
                hubCategory = 'GEAR';
                hubMode = 'BUY / SELL';
                marketSubTab = 'MY_ORDERS';
            } else if (title.includes('RENTAL') || title.includes('GEAR')) {
                nextTab = 'HUB';
                hubCategory = 'GEAR';
                hubMode = 'RENTALS';
            } else if (title.includes('MARKET') || title.includes('ASSET')) {
                nextTab = 'HUB';
                hubCategory = 'GEAR';
                hubMode = 'BUY / SELL';
            } else if (title.includes('BOUNTY')) {
                nextTab = 'HUB';
                hubCategory = 'BOUNTIES';
            } else if (title.includes('INVOICE') || title.includes('PAYMENT') || title.includes('RECEIPT') || title.includes('LEDGER')) {
                nextTab = 'HUB';
                hubCategory = 'INVOICES';
            } else if (title.includes('POT') || title.includes('SETTLEMENT')) {
                nextTab = 'SQUAD';
                squadSubTab = 'MONEY_POTS';
            } else if (title.includes('SQUAD')) {
                nextTab = 'SQUAD';
                squadSubTab = 'FIND_SQUADS';
            } else if (title.includes('RANK') || title.includes('LEADERBOARD')) {
                nextTab = 'LEADERBOARD';
            } else if (title.includes('TRUST') || title.includes('PROFILE')) {
                nextTab = 'PROFILE';
            }

            return {
                ...s,
                activeBottomTab: nextTab,
                home: { ...s.home, isNotificationsOpen: false },
                squad: { ...s.squad, activeSubTab: squadSubTab },
                hub: { 
                    ...s.hub, 
                    activeCategory: hubCategory,
                    activeMode: hubMode,
                    activeRentalSubTab: rentalSubTab,
                    activeMarketSubTab: marketSubTab,
                    activeBountySubTab: bountySubTab
                }
            };
        });
    };

    const renderNotificationsPanel = () => {
        if (!home.isNotificationsOpen) return null;

        const getNotifIcon = (notif: AppNotification) => {
            const title = notif.title.toUpperCase();
            if (title.includes('MISSION') || title.includes('BOUNTY')) return <Gavel size={16} className="text-[#CCFF00]" />;
            if (title.includes('STOCK') || title.includes('GEAR')) return <Package size={16} className="text-[#00E5FF]" />;
            if (title.includes('REQUEST')) return <Upload size={16} className="text-[#00E5FF]" />;
            if (title.includes('ORDER') || title.includes('LOGISTICS')) return <ShoppingBag size={16} className="text-[#FF9900]" />;
            if (title.includes('RANK') || title.includes('LEADERBOARD')) return <Trophy size={16} className="text-[#FFD700]" />;
            if (title.includes('INVOICE') || title.includes('LEDGER')) return <Receipt size={16} className="text-[#FF3333]" />;
            if (title.includes('POT')) return <Bone size={16} className="text-[#CCFF00]" />;
            return <Activity size={16} className="text-zinc-500" />;
        };

        return (
            <div className="fixed inset-0 z-[7500] bg-black/98 backdrop-blur-3xl flex flex-col animate-in slide-in-from-right duration-300">
                <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-zinc-900 sticky top-0 bg-black/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                            <Radio size={24} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="font-raj font-black text-white text-2xl tracking-[0.2em] italic uppercase leading-none">UPLINK_FEED</h2>
                            <div className="text-[9px] font-data font-bold text-zinc-600 tracking-[0.4em] uppercase mt-1.5">REALTIME_NODE_ALERTS</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => updateState(s => ({ ...s, home: { ...s.home, isNotificationsOpen: false } }))}
                        className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all active:scale-90 flex items-center justify-center"
                    >
                        <X size={24} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto px-5 py-8 no-scrollbar space-y-4">
                    {notifications.length === 0 && !isClearingAll ? (
                        <div className="flex flex-col items-center justify-center py-24 opacity-20">
                            <Inbox size={64} className="text-zinc-600 mb-4" />
                            <p className="font-raj font-black text-xs tracking-widest uppercase">STATION_SILENT</p>
                        </div>
                    ) : (
                        notifications.map((notif, index) => (
                            <button 
                                key={notif.id} 
                                onClick={() => handleNotificationClick(notif)}
                                style={{ animationDelay: isClearingAll ? `${index * 0.05}s` : '0s' }}
                                className={`w-full text-left bg-[#0A0A0A] border rounded-2xl p-5 relative overflow-hidden transition-all hover:bg-[#111] hover:border-zinc-700 group shadow-[0_10px_30px_rgba(0,0,0,0.4)] active:scale-[0.98] ${
                                    isClearingAll ? 'animate-discard pointer-events-none' : ''
                                } ${
                                    notif.type === 'SUCCESS' ? 'border-[#CCFF00]/10' : 
                                    notif.type === 'ALERT' ? 'border-red-500/10' : 
                                    'border-zinc-800/50'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-inner">
                                            {getNotifIcon(notif)}
                                        </div>
                                        <div>
                                            <h3 className="font-raj font-black text-[14px] text-white tracking-[0.1em] uppercase italic leading-none">{notif.title}</h3>
                                            <div className="flex items-center gap-1.5 mt-1 opacity-40">
                                                <Clock size={10} className="text-zinc-500" />
                                                <span className="font-data text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">
                                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); // CRITICAL: Stop propagation so navigation isn't triggered
                                            clearNotification(notif.id);
                                        }}
                                        className="w-8 h-8 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-800 group-hover:text-zinc-400 hover:bg-zinc-800 transition-all relative z-20"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <p className="text-zinc-400 font-inter text-[12px] leading-relaxed mb-1 pr-2">
                                    {notif.message}
                                </p>
                                
                                {/* Status Accent */}
                                <div className={`absolute top-0 right-0 w-24 h-0.5 opacity-30 ${
                                    notif.type === 'SUCCESS' ? 'bg-[#CCFF00]' : 
                                    notif.type === 'ALERT' ? 'bg-red-500' : 
                                    'bg-[#00E5FF]'
                                }`}></div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-6 bg-black border-t border-zinc-900 flex flex-col gap-4">
                    <button 
                        onClick={handleClearAllAlerts}
                        disabled={notifications.length === 0 || isClearingAll}
                        className="w-full py-4 border border-red-900/30 text-red-500/70 rounded-xl font-raj font-black text-[11px] tracking-[0.3em] uppercase hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/5 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.05)] disabled:opacity-30"
                    >
                        <Trash2 size={14} className="text-red-500" /> CLEAR_ALL_ALERTS
                    </button>
                </div>

                <style>{`
                    @keyframes fly-away {
                        0% { transform: translateX(0) rotate(0deg) scale(1); opacity: 1; }
                        100% { transform: translateX(120vw) rotate(15deg) scale(0.8); opacity: 0; }
                    }
                    .animate-discard {
                        animation: fly-away 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    }
                `}</style>
            </div>
        );
    };

    const renderPremiumModal = () => {
        if (!home.isPremiumModalOpen) return null;

        return (
            <div className="fixed inset-0 z-[7000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div 
                    className={`bg-[#050505] border border-zinc-900 rounded-[3rem] w-full max-w-[360px] p-8 relative overflow-hidden transition-all duration-150 ${glitchIntensity > 0 ? 'translate-y-[-2px]' : ''}`}
                    style={{ 
                        boxShadow: glitchIntensity > 0 
                            ? `0 0 ${glitchIntensity * 8}px rgba(157, 0, 255, 0.3), inset 0 0 40px rgba(0, 0, 0, 1)`
                            : '0 40px 120px rgba(0,0,0,1)'
                    }}
                >
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    
                    <button 
                        onClick={() => updateState(s => ({ ...s, home: { ...s.home, isPremiumModalOpen: false } }))}
                        className="absolute top-6 right-6 text-zinc-700 hover:text-white transition-colors z-20"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="mb-10 relative mt-6">
                            {/* Interactive Neural Core - Fun, bouncy, and high-contrast */}
                            <div 
                                onClick={handlePremiumCoreTap}
                                className={`w-36 h-36 rounded-[2.5rem] bg-black border border-zinc-800 flex items-center justify-center cursor-pointer transition-all active:scale-90 relative group select-none`}
                            >
                                {/* Inner Aura */}
                                <div className={`absolute inset-0 bg-[#9D00FF]/10 blur-[40px] rounded-full transition-opacity duration-700 ${glitchIntensity > 0 ? 'opacity-100' : 'opacity-20'}`}></div>
                                
                                {/* Orbiting Rings */}
                                <div className={`absolute inset-0 border border-zinc-800 rounded-[2.5rem] border-dashed transition-all duration-1000 ${isSpinningFast ? 'animate-spin scale-110 border-[#00E5FF]' : 'animate-spin duration-[15s]'}`}></div>
                                <div className={`absolute inset-4 border border-zinc-800 rounded-[2.5rem] border-dashed transition-all duration-700 ${isSpinningFast ? 'animate-reverse-spin scale-90 border-[#9D00FF]' : 'animate-reverse-spin duration-[10s]'}`}></div>
                                
                                {/* Core Icon */}
                                <div className="relative">
                                    <Cpu size={56} className={`transition-all duration-300 ${glitchIntensity > 5 ? 'text-[#00E5FF] drop-shadow-[0_0_15px_#00E5FF]' : 'text-[#9D00FF] drop-shadow-[0_0_10px_rgba(157,0,255,0.5)]'}`} strokeWidth={1.5} />
                                    {glitchIntensity > 2 && <Cpu size={56} className="absolute inset-0 text-white/20 animate-ping opacity-40" strokeWidth={1} />}
                                </div>

                                {/* Flash on tap */}
                                {glitchIntensity > 8 && (
                                    <div className="absolute inset-0 bg-white/5 rounded-[2.5rem] animate-pulse"></div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#9D00FF] animate-pulse"></div>
                                <span className="text-zinc-500 font-data font-black text-[9px] tracking-[0.3em] uppercase">SYSTEM_UPGRADE</span>
                            </div>
                            
                            <h2 className="text-white font-raj font-black text-4xl italic tracking-tighter uppercase leading-tight">
                                COMING SOON
                            </h2>
                            
                            <div className="px-6">
                                <p className="text-zinc-500 font-inter text-[13px] leading-relaxed opacity-60">
                                    The next phase of the GSD ecosystem is under development. Prepare for <span className="text-white font-bold italic tracking-wide">ELITE STATUS</span> integration.
                                </p>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-3 mb-8">
                            <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-zinc-900 group">
                                <ShieldAlert size={20} className="text-[#9D00FF] opacity-40 group-hover:opacity-100 transition-opacity" />
                                <div className="text-white font-raj font-bold text-[10px] tracking-[0.2em] uppercase VIP_CLEARANCE">VIP_CLEARANCE</div>
                            </div>
                            <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-zinc-900 group">
                                <Layers size={20} className="text-[#00E5FF] opacity-40 group-hover:opacity-100 transition-opacity" />
                                <div className="text-white font-raj font-bold text-[10px] tracking-[0.2em] uppercase">MULTI_MINING</div>
                            </div>
                        </div>

                        <button 
                            onClick={() => updateState(s => ({ ...s, home: { ...s.home, isPremiumModalOpen: false } }))}
                            className="w-full py-5 bg-white text-black rounded-2xl font-raj font-black text-sm tracking-[0.2em] uppercase active:scale-[0.97] transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] hover:bg-[#CCFF00]"
                        >
                            ACKNOWLEDGE
                        </button>
                    </div>
                </div>
                
                <style>{`
                    @keyframes reverse-spin {
                        from { transform: rotate(360deg); }
                        to { transform: rotate(0deg); }
                    }
                    .animate-reverse-spin {
                        animation: reverse-spin 10s linear infinite;
                    }
                `}</style>
            </div>
        );
    };

    const renderLootVault = () => {
        const getRewardIcon = (reward: Reward) => {
            const title = reward.title;
            if (title.includes('Amazon')) return <Package size={32} className="text-[#FF9900]" />;
            if (title.includes('Steam')) return <Gamepad2 size={32} className="text-[#9D00FF]" />;
            if (title.includes('Xbox')) return <div className="w-8 h-8 bg-[#22C55E] flex items-center justify-center rounded"><X size={20} className="text-white" /></div>;
            if (title.includes('PVR')) return <Ticket size={32} className="text-[#FF0055]" />;
            if (title.includes('Hub Credit')) return <Skull size={32} className="text-white" />;
            
            // New Categories
            if (title.includes('Overdrive') || title.includes('Boost')) return <Zap size={32} className="text-[#CCFF00] drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]" />;
            if (title.includes('Badge')) return <Award size={32} className="text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]" />;
            if (title.includes('Frame')) return <Frame size={32} className="text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]" />;
            if (title.includes('Protocol')) return <Palette size={32} className="text-[#9D00FF]" />;

            return <Package size={32} />;
        };

        return (
            <div className="fixed inset-0 z-[5000] bg-black flex flex-col animate-in slide-in-from-right duration-300">
                <header className="px-6 pt-10 pb-6 flex items-center border-b border-zinc-900 sticky top-0 bg-black z-10">
                    <button 
                        onClick={() => updateState(s => ({ ...s, home: { ...s.home, isVaultOpen: false } }))}
                        className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <div className="flex-1 text-center pr-8">
                        <h2 className="font-raj font-black text-[#FFD700] text-xl tracking-[0.2em] italic uppercase">LOOT VAULT</h2>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-5 py-8 no-scrollbar">
                    <div className="grid grid-cols-2 gap-4 pb-12">
                        {home.rewards.map(reward => {
                            const canAfford = home.boneBalance >= reward.cost;
                            const isThisUnlocking = isUnlocking === reward.id;
                            const isVictory = home.activeUnlockItem?.id === reward.id;

                            return (
                                <div 
                                    key={reward.id} 
                                    className={`bg-[#1A1A1A] border rounded-[1.5rem] p-6 flex flex-col shadow-xl transition-all relative overflow-hidden ${
                                        isVictory ? 'animate-victory scale-105 border-[#FFD700] shadow-[0_0_50px_rgba(255,215,0,0.4)]' : 'border-zinc-900'
                                    } ${isThisUnlocking ? 'opacity-80 scale-[0.98]' : 'active:scale-95'}`}
                                >
                                    {/* Unlocking Scanline Overlay */}
                                    {isVictory && (
                                        <div className="absolute inset-0 pointer-events-none z-20">
                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#FFD700]/0 via-[#FFD700]/10 to-[#FFD700]/0 animate-scan-sweep"></div>
                                            <div className="absolute inset-0 bg-[#FFD700]/5 animate-flicker"></div>
                                        </div>
                                    )}
                                    
                                    <div className="mb-4 flex justify-start">
                                        <div className={`flex items-center justify-center transition-all duration-500 ${isVictory ? 'animate-victory-bounce brightness-150 scale-125' : ''}`}>
                                            {getRewardIcon(reward)}
                                        </div>
                                    </div>
                                    
                                    <div className="mb-8">
                                        <h3 className="font-inter font-bold text-white text-[15px] leading-tight mb-1 uppercase tracking-tight">{reward.title}</h3>
                                        <div className="font-inter text-zinc-500 text-[10px] uppercase font-bold tracking-widest">{reward.value}</div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex flex-col items-center">
                                            <Bone size={18} className={`mb-1 transition-colors ${isVictory ? 'text-[#FFD700]' : 'text-zinc-600'}`} />
                                            <span className={`font-raj font-bold text-xl leading-none transition-colors ${isVictory ? 'text-white' : 'text-[#FFD700]'}`}>{reward.cost}</span>
                                        </div>
                                        <button 
                                            disabled={!canAfford || !!isUnlocking || isVictory}
                                            onClick={() => handleUnlockClick(reward)}
                                            className={`px-4 py-2 rounded-lg font-raj font-black text-[12px] tracking-widest uppercase transition-all shadow-lg ${
                                                isVictory ? 'bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-default' :
                                                canAfford 
                                                ? 'bg-[#CCFF00] text-black hover:bg-[#DFFF33] shadow-[#CCFF00]/10' 
                                                : 'bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'
                                            }`}
                                        >
                                            {isThisUnlocking ? <Loader2 size={14} className="animate-spin" /> : isVictory ? 'SECURED' : 'UNLOCK'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Confirmation Modal */}
                {confirmingReward && (
                    <div className="fixed inset-0 z-[6000] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-[#1A1A1A] border border-zinc-800 rounded-3xl p-8 w-full max-w-[340px] shadow-[0_30px_100px_rgba(0,0,0,1)]">
                            <h3 className="text-white font-inter font-bold text-xl text-center mb-6">Confirm Redemption</h3>
                            <div className="text-zinc-500 text-center mb-10 font-inter text-sm leading-relaxed px-4">
                                Redeem <span className="inline-flex items-center gap-1 mx-1 text-[#FFD700] font-bold"><Bone size={14} className="text-zinc-400" /> {confirmingReward.cost}</span> for <span className="text-white font-bold">{confirmingReward.title}</span>?
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setConfirmingReward(null)}
                                    className="flex-1 py-4 bg-[#2A2A2A] text-zinc-300 rounded-2xl font-inter font-bold text-sm active:scale-95 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmRedemption}
                                    className="flex-1 py-4 bg-[#CCFF00] text-black rounded-2xl font-inter font-bold text-sm active:scale-95 transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccessPopup && (
                    <div className="fixed inset-0 z-[6000] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                        <div className="bg-[#1A1A1A] border border-zinc-800 rounded-3xl p-10 w-full max-w-[340px] shadow-[0_30px_100px_rgba(0,0,0,1)] text-center">
                            <div className="flex justify-center mb-8">
                                <div className="w-20 h-20 rounded-full border-4 border-[#22C55E]/20 flex items-center justify-center">
                                    <CheckCircle2 size={48} className="text-[#22C55E]" />
                                </div>
                            </div>
                            <h3 className="text-white font-raj font-black text-xl mb-3 tracking-[0.1em] uppercase">
                                {home.activeUnlockItem?.value.includes('Voucher') ? 'REQUEST TRANSMITTED' : 'PROTOCOL APPLIED'}
                            </h3>
                            <p className="text-zinc-500 font-inter text-[13px] leading-relaxed px-4">
                                {home.activeUnlockItem?.value.includes('Voucher') 
                                    ? 'Code will be sent via Secure Chat within 24h.' 
                                    : 'Accessory or Boost has been synced to your profile node.'}
                            </p>
                        </div>
                    </div>
                )}
                
                <style>{`
                    @keyframes victory-card-pulse {
                        0%, 100% { transform: scale(1.05); filter: brightness(1) contrast(1); }
                        50% { transform: scale(1.08); filter: brightness(1.2) contrast(1.1); box-shadow: 0 0 60px rgba(255, 215, 0, 0.6); }
                    }
                    .animate-victory {
                        animation: victory-card-pulse 0.4s ease-in-out infinite;
                    }
                    @keyframes victory-bounce {
                        0%, 100% { transform: translateY(0) scale(1.25); }
                        50% { transform: translateY(-20px) scale(1.4) rotate(5deg); }
                    }
                    .animate-victory-bounce {
                        animation: victory-bounce 0.4s ease-out infinite;
                    }
                    @keyframes scan-sweep {
                        0% { transform: translateY(-100%); }
                        100% { transform: translateY(100%); }
                    }
                    .animate-scan-sweep {
                        animation: scan-sweep 1s linear infinite;
                    }
                    @keyframes flicker {
                        0%, 100% { opacity: 0.1; }
                        50% { opacity: 0.2; }
                        52% { opacity: 0.05; }
                        54% { opacity: 0.15; }
                    }
                    .animate-flicker {
                        animation: flicker 2s linear infinite;
                    }
                `}</style>
            </div>
        );
    };

    const renderStreakDashboard = () => {
        if (!home.isStreakModalOpen) return null;

        const milestones = [
            { day: 1, reward: 10 },
            { day: 5, reward: 25 },
            { day: 10, reward: 50 },
            { day: 30, reward: 1000 },
        ];

        const lockerSlots = [1, 2, 3];
        const isAtRisk = home.streak.status === 'AT RISK';
        const isExtinguished = home.streak.currentStreak === 0;

        return (
            <div className="fixed inset-0 z-[6000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[2.5rem] w-full max-w-[380px] shadow-[0_40px_120px_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh] overflow-hidden font-inter">
                    {/* Header with explicit close */}
                    <div className="p-6 flex justify-between items-center bg-[#1A1A1A] z-20 border-b border-white/5">
                        <h2 className="text-white font-bold text-lg uppercase tracking-tight">Streak Dashboard</h2>
                        <button 
                            onClick={() => updateState(s => ({ ...s, home: { ...s.home, isStreakModalOpen: false } }))}
                            className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-10">
                        {/* Top Hero Card - Refined with Dynamic Flame state */}
                        <div className={`rounded-[2rem] p-8 flex flex-col items-center justify-center text-center border transition-all duration-500 ${isAtRisk ? 'bg-[#2A1111] border-red-900/40 shadow-[inset_0_0_40px_rgba(255,50,50,0.05)]' : 'bg-[#212121] border-zinc-800/30'}`}>
                            <div className="relative mb-2">
                                <Flame 
                                    size={80} 
                                    className={`transition-all duration-700 ${
                                        isExtinguished 
                                        ? 'text-zinc-700 animate-flame-dead' 
                                        : isAtRisk ? 'text-red-400 animate-flame-active' : 'text-[#5AF28A] animate-flame-active'
                                    }`} 
                                    strokeWidth={1.5} 
                                />
                                <div className={`absolute inset-0 blur-2xl rounded-full -z-10 animate-pulse transition-all duration-500 ${
                                    isExtinguished 
                                    ? 'bg-zinc-900/10' 
                                    : isAtRisk ? 'bg-red-600/30 scale-125' : 'bg-[#5AF28A]/20'
                                }`}></div>
                            </div>
                            <div className="text-white font-bold text-6xl mb-2 tracking-tighter tabular-nums">{home.streak.currentStreak}</div>
                            <div className={`font-raj font-black text-[11px] tracking-[0.2em] uppercase italic transition-colors duration-500 ${
                                isExtinguished 
                                ? 'text-zinc-600' 
                                : isAtRisk ? 'text-red-400 animate-pulse' : 'text-[#5AF28A]'
                            }`}>
                                STREAK STATUS: {home.streak.status}
                            </div>
                        </div>

                        {/* Reward Ladder */}
                        <div>
                            <h3 className="text-zinc-600 font-raj font-black text-[10px] tracking-[0.3em] uppercase mb-4 px-2">REWARD LADDER</h3>
                            <div className="space-y-2.5">
                                {milestones.map((m) => (
                                    <div 
                                        key={m.day} 
                                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                                            home.streak.currentStreak >= m.day 
                                            ? 'border-[#FFD700] bg-[#FFD700]/5 shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]' 
                                            : 'border-zinc-800/40 bg-zinc-900/20'
                                        }`}
                                    >
                                        <div className={`font-raj font-bold text-xs tracking-widest ${home.streak.currentStreak >= m.day ? 'text-white' : 'text-zinc-600'}`}>DAY {m.day}</div>
                                        <div className="flex items-center gap-2.5">
                                            <span className={`font-data font-bold text-lg ${home.streak.currentStreak >= m.day ? 'text-[#FFD700]' : 'text-zinc-700'}`}>{m.reward}</span>
                                            <Bone size={16} className={home.streak.currentStreak >= m.day ? 'text-[#FFD700]' : 'text-zinc-800'} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Freeze Locker */}
                        <div>
                            <h3 className="text-zinc-600 font-raj font-black text-[10px] tracking-[0.3em] uppercase mb-4 px-2">FREEZE LOCKER</h3>
                            <div className="bg-[#0D0D0D] border border-zinc-900 rounded-3xl p-4 flex items-center justify-center gap-8">
                                <div className="flex gap-4">
                                    {lockerSlots.map(slot => (
                                        <div key={slot} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${home.streak.streakFreezeInventory >= slot ? 'bg-blue-600/10 border border-blue-500/20' : 'bg-[#151515] border border-zinc-800/30 shadow-inner'}`}>
                                            {home.streak.streakFreezeInventory >= slot ? (
                                                <div className="text-3xl drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-float-ice">🧊</div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full border-2 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSettingsModal = () => {
        if (!home.isSettingsOpen) return null;

        return (
            <div className="fixed inset-0 z-[8000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300 font-raj">
                <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-zinc-900 rounded-[3rem] p-10 shadow-3xl relative overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <div className="text-[#CCFF00] font-black text-[9px] tracking-[0.4em] uppercase italic mb-1">STATION_CONFIGURATION</div>
                            <h2 className="text-white font-black text-2xl uppercase tracking-tighter italic">SYSTEM_PREFS</h2>
                        </div>
                        <button 
                            onClick={() => updateState(s => ({ ...s, home: { ...s.home, isSettingsOpen: false } }))}
                            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                        {/* Dark Mode */}
                        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between group transition-all hover:border-[#CCFF00]/40">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-zinc-400">
                                    {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                                </div>
                                <div className="font-bold text-sm tracking-widest text-white uppercase">DARK_MODE</div>
                            </div>
                            <button 
                                onClick={() => updateState(s => ({ ...s, settings: { ...s.settings, darkMode: !s.settings.darkMode } }))}
                                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings.darkMode ? 'bg-[#CCFF00]' : 'bg-zinc-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300 ${settings.darkMode ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Haptics */}
                        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between group transition-all hover:border-[#00E5FF]/40">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-zinc-400">
                                    <Zap size={20} />
                                </div>
                                <div className="font-bold text-sm tracking-widest text-white uppercase">HAPTICS</div>
                            </div>
                            <button 
                                onClick={() => updateState(s => ({ ...s, settings: { ...s.settings, haptics: !s.settings.haptics } }))}
                                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings.haptics ? 'bg-[#00E5FF]' : 'bg-zinc-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300 ${settings.haptics ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Notifications */}
                        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between group transition-all hover:border-[#FF9900]/40">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-zinc-400">
                                    <Bell size={20} />
                                </div>
                                <div className="font-bold text-sm tracking-widest text-white uppercase">ALERTS</div>
                            </div>
                            <button 
                                onClick={() => updateState(s => ({ ...s, settings: { ...s.settings, notifications: !s.settings.notifications } }))}
                                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings.notifications ? 'bg-[#FF9900]' : 'bg-zinc-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300 ${settings.notifications ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Currency */}
                        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl space-y-4">
                            <div className="text-zinc-600 font-bold text-[9px] tracking-widest uppercase italic px-1">OPERATIONAL_CURRENCY</div>
                            <div className="grid grid-cols-3 gap-2">
                                {(['INR', 'USD', 'EUR'] as const).map((curr) => (
                                    <button 
                                        key={curr}
                                        onClick={() => updateState(s => ({ ...s, settings: { ...s.settings, currency: curr } }))}
                                        className={`py-3 rounded-xl font-bold text-[11px] tracking-widest transition-all border ${settings.currency === curr ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                                    >
                                        {curr}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Log Out */}
                        <button 
                            onClick={() => updateState(s => ({ ...s, isLoggedIn: false }))}
                            className="w-full bg-red-900/10 border border-red-500/20 p-5 rounded-2xl flex items-center gap-4 group hover:bg-red-500/5 hover:border-red-500/50 transition-all active:scale-[0.98]"
                        >
                            <div className="w-10 h-10 rounded-xl bg-black border border-red-500/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                <LogOut size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm tracking-widest text-red-500 uppercase">TERMINATE_SESSION</div>
                                <div className="text-red-500/40 font-inter text-[9px] uppercase tracking-widest italic leading-none">Disconnect from Hub</div>
                            </div>
                        </button>
                    </div>

                    <div className="mt-10 pt-6 border-t border-zinc-900 text-center">
                        <p className="text-zinc-800 font-data text-[7px] tracking-[0.5em] uppercase">GSD_OS_STATION_MANAGER_77</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderAddTaskModal = () => {
        if (!home.isAddTaskModalOpen) return null;

        return (
            <div className="fixed inset-0 z-[8500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300 font-raj">
                <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-zinc-800 rounded-[3rem] p-10 shadow-3xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-60"></div>
                    
                    <button 
                        onClick={() => updateState(s => ({ ...s, home: { ...s.home, isAddTaskModalOpen: false } }))}
                        className="absolute top-6 right-8 text-zinc-700 hover:text-white transition-colors active:scale-90"
                    >
                        <X size={28} />
                    </button>

                    <div className="text-center mb-10 mt-4">
                        <div className="text-[#00E5FF] font-black text-[11px] tracking-[0.5em] uppercase italic mb-2">MISSION_LOG_UPLINK</div>
                        <h2 className="text-white font-black text-3xl uppercase tracking-tighter leading-none italic">ADD_OBJECTIVE</h2>
                    </div>

                    <div className="space-y-6 mb-10">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-zinc-600 font-bold text-[9px] tracking-widest uppercase italic">DIRECTIVE_BYTES</label>
                                <button 
                                    disabled={isRefining || !newTaskText.trim()}
                                    onClick={handleRefineTask}
                                    className="flex items-center gap-1.5 text-[9px] font-black text-[#CCFF00] tracking-widest uppercase hover:brightness-125 transition-all disabled:opacity-30"
                                >
                                    {isRefining ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} 
                                    AI_REFINE
                                </button>
                            </div>
                            
                            <div className="relative">
                                <div className="absolute top-4 left-4"><Terminal size={14} className="text-zinc-800" /></div>
                                <textarea 
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    placeholder="Define your next parameter..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 pl-11 text-white font-inter text-sm outline-none focus:border-[#00E5FF]/50 transition-all resize-none min-h-[120px] placeholder:text-zinc-800"
                                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 92% 100%, 0% 100%)' }}
                                />
                            </div>
                        </div>

                        <div className="bg-[#001111] border border-[#00E5FF]/20 p-5 rounded-2xl flex items-start gap-4 shadow-inner">
                            <Shield size={18} className="text-[#00E5FF] shrink-0 mt-0.5" />
                            <p className="text-[#00E5FF]/60 text-[10px] font-inter italic leading-relaxed uppercase">
                                PROTOCOL: Objectives committed to the node ledger will remain active until manually toggled for completion.
                            </p>
                        </div>
                    </div>

                    <button 
                        disabled={isDeploying || !newTaskText.trim()}
                        onClick={handleAddTask}
                        className="w-full bg-[#00E5FF] text-black py-5 rounded-2xl font-black text-sm tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                        {isDeploying ? (
                            <><Loader2 size={18} className="animate-spin" /> DEPLOYING...</>
                        ) : (
                            <><Zap size={18} fill="currentColor" /> DEPLOY_OBJECTIVE</>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    if (home.isVaultOpen) return renderLootVault();

    const isExtinguishedHeader = home.streak.currentStreak === 0;

    return (
        <div className="h-full flex flex-col relative transition-colors duration-300 bg-black">
            {renderStreakDashboard()}
            {renderPremiumModal()}
            {renderNotificationsPanel()}
            {renderSettingsModal()}
            {renderAddTaskModal()}
            <header className="px-5 pt-8 pb-4 flex justify-between items-center z-20">
                <div style={{ color: theme.textMain }} className="font-raj italic font-bold text-[32px] tracking-tight leading-none">HOME</div>
                <div className="flex items-center gap-2 h-9">
                    {/* Functioning Notification Button */}
                    <button 
                        onClick={handleOpenNotifications}
                        className="relative w-9 h-full bg-[#00E5FF]/10 rounded-[10px] border border-[#00E5FF]/40 flex items-center justify-center transition-all active:scale-95 group shadow-[0_0_15px_rgba(204,255,0,0.1)]"
                    >
                        <Bell size={18} className="text-[#00E5FF] group-hover:scale-110 transition-transform" />
                        {unreadCount > 0 && (
                            <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-data font-black text-[8px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,0,0,0.6)] animate-pulse border border-black">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                        )}
                    </button>

                    <button onClick={() => updateState(s => ({ ...s, home: { ...s.home, isStreakModalOpen: true } }))} className="flex items-center gap-1 px-[12px] h-full bg-[#FF9900]/10 rounded-[20px] border border-[#FF9900] active:scale-95 transition-transform">
                        <Flame 
                            size={16} 
                            className={`transition-all duration-700 ${isExtinguishedHeader ? 'text-zinc-700 animate-flame-dead opacity-50' : 'text-[#FF9900] animate-flame-active'}`} 
                        />
                        <span className={`text-[14px] font-raj font-bold leading-none ${isExtinguishedHeader ? 'text-zinc-600' : 'text-[#FF9900]'}`}>
                            {home.streak.currentStreak}
                        </span>
                    </button>
                    <button onClick={() => updateState(s => ({ ...s, home: { ...s.home, isPremiumModalOpen: true } }))} className="px-[14px] h-full bg-[#4B0082]/20 rounded-[20px] border border-[#9D00FF] text-[13px] font-raj font-bold text-[#FFD700] tracking-widest italic flex items-center leading-none active:scale-95 transition-transform">GSD BLACK</button>
                    <button onClick={() => updateState(s => ({ ...s, home: { ...s.home, isSettingsOpen: true } }))} style={{ backgroundColor: theme.rowBg }} className="w-9 h-full rounded-[10px] flex items-center justify-center transition-all duration-200 cursor-pointer border border-zinc-900 hover:border-zinc-700 active:scale-95"><Settings size={20} style={{ color: '#AAA' }} /></button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2 space-y-4 no-scrollbar pt-2 space-y-4 no-scrollbar">
                
                {/* FLIPPABLE PRIMARY CARD */}
                <div 
                    className="flip-container h-[420px] w-full" 
                    onClick={() => setIsBalanceFlipped(!isBalanceFlipped)}
                >
                    <div className={`flip-inner h-full w-full ${isBalanceFlipped ? 'is-flipped' : ''}`}>
                        
                        {/* FRONT SIDE: BONE BALANCE */}
                        <div 
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.subtleBorder }} 
                            className="flip-front border rounded-[2.5rem] p-6 transition-colors duration-300 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className={`px-2.5 py-1.5 border rounded text-[10px] font-raj font-bold tracking-widest uppercase flex items-center leading-none ${isExtinguishedHeader ? 'border-zinc-800 text-zinc-600' : 'border-[#FF9900]/40 text-[#FF9900]'}`}>
                                    STREAK: {home.streak.status}
                                </div>
                                <div className="px-3 py-1.5 bg-[#00E5FF] text-black rounded text-[11px] font-raj font-bold tracking-widest uppercase flex items-center leading-none shadow-[0_0_15px_rgba(0,229,255,0.3)]">{home.tier}</div>
                            </div>

                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="relative w-[220px] h-[220px] flex items-center justify-center group">
                                    <div className="absolute w-[180px] h-[180px] rounded-full bg-[#00E5FF]/5 blur-[20px] animate-pulse"></div>
                                    
                                    <svg className="absolute top-0 left-0 w-full h-full transform rotate-0" viewBox="0 0 220 220">
                                        <circle stroke={isDark ? "#111111" : "#EEEEEE"} strokeWidth="12" fill="transparent" r="90" cx="110" cy="110" strokeLinecap="round" />
                                        <circle 
                                            className="progress-ring__circle" 
                                            stroke="#00E5FF" 
                                            strokeWidth="12" 
                                            fill="transparent" 
                                            r="90" 
                                            cx="110" 
                                            cy="110" 
                                            strokeDasharray={CIRCUMFERENCE} 
                                            strokeDashoffset={dashOffset} 
                                            strokeLinecap="round" 
                                            style={{ 
                                                filter: 'drop-shadow(0 0 15px rgba(0, 229, 255, 0.6))', 
                                                transition: 'stroke-dashoffset 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                                            }} 
                                        />
                                    </svg>
                                    
                                    <div className="relative z-10 flex flex-col items-center justify-center w-full">
                                        <div className="scanline-text">
                                            <AnimatedNumber 
                                                value={home.boneBalance} 
                                                id="boneCount" 
                                                className="font-raj font-bold text-[68px] text-[#00E5FF] leading-[1] text-center tracking-tight animate-glitch animate-neon-vibes" 
                                                style={{ textShadow: '0 0 30px rgba(0, 229, 255, 0.3)' }}
                                            />
                                        </div>
                                        <div className="font-data text-[10px] font-bold text-[#00E5FF] tracking-[0.4em] uppercase mt-2 text-center scanline-text opacity-70">BONE BALANCE</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end px-1">
                                    <div className="font-raj text-[11px] font-bold text-[#00E5FF] tracking-widest uppercase">STREAK MILESTONE</div>
                                    <div className="font-data text-[10px] font-bold text-[#00E5FF]">DAY {home.streak.currentStreak}/30</div>
                                </div>
                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-[#111]' : 'bg-zinc-100'}`}>
                                    <div className="h-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" style={{ width: `${(home.streak.currentStreak / 30) * 100}%` }}></div>
                                </div>
                                <div style={{ backgroundColor: isDark ? '#080808' : '#f5fafa', borderLeftColor: '#00E5FF' }} className="status-block p-5 border-l-4 transition-colors rounded-r-xl">
                                    <p className="text-[12px] font-raj text-[#00E5FF] tracking-wider leading-relaxed uppercase font-bold">
                                        TAP CARD TO VIEW TRUST SCORE
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* BACK SIDE: TRUST SCORE */}
                        <div 
                            style={{ backgroundColor: theme.cardBg, borderColor: '#CCFF00' }} 
                            className="flip-back border rounded-[2.5rem] p-8 transition-colors duration-300 overflow-hidden flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-center">
                                <div className="text-[#CCFF00] font-raj font-black text-[10px] tracking-[0.4em] uppercase italic mb-1">NODE_RELIABILITY</div>
                                <Shield size={18} className="text-[#CCFF00]" />
                            </div>

                            <div className="flex flex-col items-center justify-center py-10 relative">
                                {/* Decorative elements */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                    <Fingerprint size={180} className="text-[#CCFF00]" />
                                </div>
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="text-[12px] font-raj font-bold text-zinc-600 tracking-[0.5em] uppercase mb-4">CURRENT_TRUST_INDEX</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-8xl font-raj font-black text-white italic tracking-tighter drop-shadow-[0_0_30px_rgba(204,255,0,0.3)]">
                                            {user.trustScore}
                                        </span>
                                        <span className="text-3xl font-raj font-black text-[#CCFF00]">%</span>
                                    </div>
                                    <div className="mt-8 px-6 py-2 bg-[#CCFF00] text-black rounded-lg font-raj font-black text-xs tracking-widest uppercase italic shadow-[0_0_20px_rgba(204,255,0,0.4)]">
                                        SECURE_NODE_0x77
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-[#CCFF00] shadow-[0_0_15px_#CCFF00]" 
                                        style={{ width: `${user.trustScore}%` }}
                                    ></div>
                                </div>
                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Activity size={14} className="text-[#CCFF00]" />
                                        <span className="text-[10px] font-raj font-black text-white tracking-[0.2em] uppercase">VITALITY_REPORT</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 font-inter italic leading-tight">
                                        Reliability index is 98.2% above peer average. Node status is currently optimal.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* LOOT VAULT BUTTON */}
                <button 
                    onClick={() => updateState(s => ({ ...s, home: { ...s.home, isVaultOpen: true } }))} 
                    style={{ 
                        backgroundColor: isDark ? '#0A0A08' : '#FFFDF0', 
                        borderColor: '#FFD700' 
                    }} 
                    className="w-full py-5 border-2 rounded-2xl flex items-center justify-center gap-4 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(255,215,0,0.15)] group"
                >
                    <Crown size={22} className="text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] group-hover:scale-110 transition-transform" />
                    <span className="font-raj font-bold text-base tracking-[0.3em] text-[#FFD700] drop-shadow-[0_0_5px_rgba(255,215,0,0.3)]">OPEN LOOT VAULT</span>
                    <ChevronRight size={22} className="text-[#FFD700]/50 group-hover:text-[#FFD700] transition-colors" />
                </button>

                <div style={{ backgroundColor: theme.cardBg, borderColor: theme.subtleBorder }} className="border rounded-[2.5rem] p-6 transition-colors duration-300">
                    <div className="flex justify-between items-center mb-6 px-1">
                        <div className="flex items-center gap-3">
                            <Target size={18} className="text-[#CCFF00]" />
                            <h3 style={{ color: theme.textMain }} className="font-raj font-bold text-[14px] tracking-[0.25em] uppercase leading-none">OBJECTIVES</h3>
                            {activeTasksCount > 0 && <div className="px-2.5 py-1 bg-[#CCFF00] text-black font-data text-[10px] font-bold rounded-full leading-none shadow-[0_0_10px_rgba(204,255,0,0.3)]">{activeTasksCount}</div>}
                        </div>
                        <button onClick={() => updateState(s => ({ ...s, home: { ...s.home, isAddTaskModalOpen: true } }))} className="bg-[#CCFF00] text-black p-2 rounded-xl active:scale-95 transition-transform shadow-lg"><Plus size={18} /></button>
                    </div>
                    <div className="space-y-3">
                        {home.tasks.length === 0 ? (
                            <div style={{ borderColor: theme.border }} className="text-center py-10 border border-dashed rounded-3xl">
                                <p style={{ color: theme.textSub }} className="font-raj text-[12px] uppercase tracking-widest opacity-40">NO_ACTIVE_PROTOCOLS</p>
                            </div>
                        ) : (
                            home.tasks.map(task => {
                                const isBeingCompleted = lastCompletedTaskId === task.id;
                                
                                return (
                                    <div 
                                        key={task.id} 
                                        onClick={() => toggleTask(task.id)} 
                                        style={{ backgroundColor: isDark ? '#050505' : '#F9F9F9', borderColor: theme.border }} 
                                        className={`flex items-center gap-5 p-5 border rounded-2xl cursor-pointer transition-all ${
                                            task.completed ? 'opacity-40 grayscale' : 'hover:border-zinc-700 hover:shadow-lg'
                                        } ${isBeingCompleted ? 'animate-task-complete' : ''}`}
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            {task.completed ? <CheckSquare size={22} className="text-[#CCFF00]" /> : <Square size={22} style={{ color: theme.textSub }} />}
                                        </div>
                                        <span style={{ color: theme.textMain }} className={`flex-1 font-inter text-[15px] ${task.completed ? 'line-through opacity-50' : 'font-medium'}`}>{task.text}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <button onClick={() => updateState(s => ({ ...s, home: { ...s.home, isAddTaskModalOpen: true } }))} style={{ borderColor: theme.border, color: theme.textSub }} className="mt-8 w-full py-4 bg-transparent border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 font-raj font-bold text-[13px] tracking-widest uppercase active:opacity-50 transition-all hover:border-zinc-700 hover:text-zinc-400"><Plus size={18} /> ADD_NEW_OBJECTIVE</button>
                </div>
            </div>

            <style>{`
                @keyframes task-complete {
                    0% { transform: scale(1); border-color: #CCFF00; box-shadow: 0 0 0px #CCFF00; }
                    50% { transform: scale(1.02); border-color: #CCFF00; box-shadow: 0 0 20px rgba(204, 255, 0, 0.3); }
                    100% { transform: scale(1); }
                }
                .animate-task-complete {
                    animation: task-complete 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default HomeView;
