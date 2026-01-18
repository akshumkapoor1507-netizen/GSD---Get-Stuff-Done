
import React, { useState } from 'react';
import { Bone, Plus, Clock, Film, Car, Users, MapPin, Calendar, UserPlus, X, Zap, ChevronRight, Loader2, Gamepad2, Coffee, DollarSign, CheckCircle2, LogOut, Trash2, ShieldAlert, UserMinus, Settings2 } from 'lucide-react';
import { AppState, SquadActivity, TransactionRecord } from '../types';
import SettlementGatewayModal from './SettlementGatewayModal';

interface SquadViewProps {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
    processTransactionSuccess: (userId: string, transactionAmount: number, sourceType: string, receiptMeta?: any) => number | undefined;
    updateTrustScore?: (actionType: 'BOUNTY' | 'MONEY_POT' | 'GEAR' | 'GENERAL', isPositive: boolean, descriptionOverride?: string) => void;
}

const SquadView: React.FC<SquadViewProps> = ({ state, updateState, processTransactionSuccess, updateTrustScore }) => {
    const { squad, user } = state;
    
    // UI Logic States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [joiningSquadId, setJoiningSquadId] = useState<string | null>(null);
    const [managingSquadId, setManagingSquadId] = useState<string | null>(null);
    const [isTerminating, setIsTerminating] = useState<string | null>(null);
    
    // Settlement Modal State
    const [isSettlementOpen, setIsSettlementOpen] = useState(false);
    const [activePot, setActivePot] = useState<any | null>(null);
    const [activePotIndex, setActivePotIndex] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        time: 'Tonight, 9:00 PM',
        total: 4,
        type: 'BILL SPLIT' as 'BILL SPLIT' | 'HOST PAYS',
        iconType: 'GAME' as 'FILM' | 'CAR' | 'GAME' | 'COFFEE'
    });

    const handleJoinToggle = (item: SquadActivity) => {
        const isJoined = (squad?.joinedSquadIds || []).includes(item.id);
        
        if (!isJoined && item.joined >= item.total) {
            alert('SQUAD_PROTOCOL: Capacity reached. Protocol denied.');
            return;
        }

        setJoiningSquadId(item.id);

        // Simulate Secure Connection Protocol
        setTimeout(() => {
            updateState(s => {
                const currentJoinedIds = s.squad?.joinedSquadIds || [];
                const alreadyJoined = currentJoinedIds.includes(item.id);
                const updatedJoinedIds = alreadyJoined 
                    ? currentJoinedIds.filter(id => id !== item.id)
                    : [...currentJoinedIds, item.id];

                const updatedFeed = (s.squad?.feed || []).map(f => {
                    if (f.id === item.id) {
                        const currentMembers = f.members || [];
                        const userAtName = `@${user.name}`;
                        return {
                            ...f,
                            joined: alreadyJoined ? Math.max(0, f.joined - 1) : Math.min(f.total, f.joined + 1),
                            members: alreadyJoined 
                                ? currentMembers.filter(m => m !== userAtName)
                                : [...currentMembers, userAtName]
                        };
                    }
                    return f;
                });

                return {
                    ...s,
                    squad: {
                        ...s.squad,
                        feed: updatedFeed,
                        joinedSquadIds: updatedJoinedIds
                    },
                    notificationToast: alreadyJoined ? null : {
                        visible: true,
                        message: `CONNECTED: ${item.title}`,
                        amount: 5 // Small bone reward for participating
                    },
                    home: {
                        ...s.home,
                        boneBalance: alreadyJoined ? s.home.boneBalance : s.home.boneBalance + 5
                    }
                };
            });

            setJoiningSquadId(null);
        }, 1200);
    };

    const handleCancelActivity = (squadId: string) => {
        setIsTerminating(squadId);
        setTimeout(() => {
            updateState(s => ({
                ...s,
                squad: {
                    ...s.squad,
                    feed: s.squad.feed.filter(f => f.id !== squadId)
                }
            }));
            setIsTerminating(null);
            setManagingSquadId(null);
        }, 1500);
    };

    const handleRemoveMember = (squadId: string, memberName: string) => {
        updateState(s => ({
            ...s,
            squad: {
                ...s.squad,
                feed: s.squad.feed.map(f => {
                    if (f.id === squadId) {
                        return {
                            ...f,
                            joined: Math.max(1, f.joined - 1),
                            members: (f.members || []).filter(m => m !== memberName)
                        };
                    }
                    return f;
                })
            }
        }));
    };

    const handleInitiatePaymentClick = (pot: any, index: number) => {
        setActivePot(pot);
        setActivePotIndex(index);
        setIsSettlementOpen(true);
    };

    const handlePotSuccess = (amount: number, description: string, receiptMeta?: any) => {
        if (activePotIndex === null) return;
        
        processTransactionSuccess(user.id, amount, `Squad Settlement: ${description}`, receiptMeta);
        
        // Trigger Trust Score update
        if (updateTrustScore) {
            updateTrustScore('MONEY_POT', true, `Settled Pot: ${description}`);
        }

        updateState(s => ({
            ...s,
            squad: {
                ...s.squad,
                moneyPots: s.squad.moneyPots.filter((_, i) => i !== activePotIndex)
            }
        }));
    };

    const handleCreateSquad = () => {
        if (!formData.title || !formData.description || !formData.location) {
            alert('PROTOCOL_ERROR: Required fields missing.');
            return;
        }

        setIsDeploying(true);

        setTimeout(() => {
            const newSquad: SquadActivity = {
                id: `S-${Date.now()}`,
                title: formData.title,
                host: `@${state.user.name}`,
                type: formData.type,
                description: formData.description,
                time: formData.time,
                location: formData.location,
                joined: 1,
                total: formData.total,
                iconType: formData.iconType,
                members: [`@${state.user.name}`]
            };

            updateState(s => ({
                ...s,
                squad: {
                    ...s.squad,
                    feed: [newSquad, ...s.squad.feed],
                    joinedSquadIds: [...(s.squad?.joinedSquadIds || []), newSquad.id]
                }
            }));

            setIsDeploying(false);
            setIsCreateModalOpen(false);
            
            setFormData({
                title: '',
                description: '',
                location: '',
                time: 'Tonight, 9:00 PM',
                total: 4,
                type: 'BILL SPLIT',
                iconType: 'GAME'
            });
        }, 1500);
    };

    const renderFeedItem = (item: SquadActivity) => {
        const Icon = item.iconType === 'FILM' ? Film : item.iconType === 'CAR' ? Car : item.iconType === 'GAME' ? Gamepad2 : Coffee;
        const isJoined = (squad?.joinedSquadIds || []).includes(item.id);
        const isJoining = joiningSquadId === item.id;
        const isHost = item.host === `@${user.name}`;
        const isManaging = managingSquadId === item.id;

        return (
            <div key={item.id} className={`bg-[#121212] border rounded-2xl p-5 mb-4 shadow-lg hover:border-zinc-700 transition-all active:scale-[0.98] ${isHost ? 'border-[#CCFF00]/40' : isJoined ? 'border-[#008C9E]/50' : 'border-zinc-900'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-black border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 shadow-inner relative">
                            <Icon size={24} />
                            {isHost && (
                                <div className="absolute -top-1 -right-1 bg-[#CCFF00] rounded-full p-0.5 shadow-[0_0_8px_rgba(204,255,0,0.6)]">
                                    <Settings2 size={10} className="text-black" />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-raj font-bold text-lg text-white leading-none uppercase tracking-tight">{item.title}</h4>
                                {isHost && <span className="text-[8px] font-raj font-black px-1.5 py-0.5 bg-[#CCFF00] text-black rounded tracking-widest uppercase italic">HOSTING</span>}
                            </div>
                            <div className="text-[11px] font-raj text-zinc-600 font-bold tracking-widest uppercase">
                                Host: <span className="text-zinc-400">{item.host}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-raj font-bold tracking-[0.15em] border ${
                        item.type === 'BILL SPLIT' ? 'border-orange-500/30 text-orange-500 bg-orange-500/5' : 
                        'border-green-500/30 text-green-500 bg-green-500/5'
                    }`}>
                        {item.type}
                    </div>
                </div>

                <p className="text-white text-[13px] font-inter leading-relaxed mb-6">
                    {item.description}
                </p>

                <div className="flex flex-wrap gap-4 mb-6 border-y border-zinc-900/50 py-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-700" />
                        <span className="text-[11px] font-raj text-white font-bold tracking-widest uppercase">{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-zinc-700" />
                        <span className="text-[11px] font-raj text-white font-bold tracking-widest uppercase">{item.location}</span>
                    </div>
                </div>

                {isHost && isManaging && (
                    <div className="mb-6 p-4 bg-black/40 border border-[#CCFF00]/10 rounded-xl animate-in fade-in duration-300">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900/50">
                            <span className="text-[10px] font-raj font-black text-[#CCFF00] tracking-[0.3em] uppercase italic flex items-center gap-2">
                                <ShieldAlert size={12} /> MODERATION_PROTOCOL
                            </span>
                        </div>
                        <div className="space-y-3 max-h-[160px] overflow-y-auto no-scrollbar">
                            {(item.members || []).map(member => (
                                <div key={member} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 font-raj font-bold text-xs">{member[1].toUpperCase()}</div>
                                        <span className="text-xs font-raj font-bold text-white tracking-wider">{member === `@${user.name}` ? 'YOU (HOST)' : member}</span>
                                    </div>
                                    {member !== `@${user.name}` && (
                                        <button 
                                            onClick={() => handleRemoveMember(item.id, member)}
                                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 active:scale-90 transition-transform hover:bg-red-500/20"
                                        >
                                            <UserMinus size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {(!item.members || item.members.length <= 1) && (
                                <div className="text-center py-4 text-zinc-700 font-raj text-[10px] tracking-widest italic uppercase">NO_ACTIVE_OPERATORS</div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Users size={16} className={isJoined ? "text-[#CCFF00]" : "text-[#00E5FF]"} />
                            <span className={`text-[14px] font-data font-bold leading-none ${isJoined ? "text-[#CCFF00]" : "text-white"}`}>
                                {item.joined}/{item.total}
                            </span>
                        </div>
                        <span className="text-[10px] font-raj text-zinc-700 font-bold tracking-widest uppercase pt-0.5">{isHost ? 'CAPACITY' : isJoined ? 'IN_SQUAD' : 'JOINED'}</span>
                    </div>
                    
                    <div className="flex-1 flex justify-end gap-2">
                        {isHost ? (
                            <>
                                <button 
                                    onClick={() => setManagingSquadId(isManaging ? null : item.id)}
                                    className={`flex-1 py-2.5 rounded-xl font-raj font-bold text-[12px] tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-2 border ${isManaging ? 'bg-zinc-800 text-white border-zinc-700 shadow-inner' : 'bg-black border-[#CCFF00]/40 text-[#CCFF00]'}`}
                                >
                                    {isManaging ? 'CLOSE' : 'MANAGE'}
                                </button>
                                <button 
                                    disabled={isTerminating === item.id}
                                    onClick={() => handleCancelActivity(item.id)}
                                    className="px-6 py-2.5 bg-red-600/10 border border-red-600/40 text-red-500 rounded-xl font-raj font-bold text-[12px] tracking-widest uppercase active:scale-95 transition-all shadow-lg shadow-red-900/10 flex items-center justify-center gap-2"
                                >
                                    {isTerminating === item.id ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={14} /> TERMINATE</>}
                                </button>
                            </>
                        ) : (
                            <button 
                                disabled={isJoining}
                                onClick={() => handleJoinToggle(item)}
                                className={`min-w-[120px] px-8 py-2.5 rounded-xl font-raj font-bold text-[13px] tracking-[0.15em] uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                                    isJoining 
                                    ? 'bg-zinc-800 text-zinc-500 cursor-wait' 
                                    : isJoined 
                                    ? 'bg-black border border-[#FF3333] text-[#FF3333] hover:bg-[#FF3333]/10 shadow-[#FF3333]/20' 
                                    : 'bg-[#008C9E] text-white hover:bg-[#00ACC1] shadow-[#008C9E]/30'
                                }`}
                            >
                                {isJoining ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : isJoined ? (
                                    <><LogOut size={14} /> LEAVE</>
                                ) : (
                                    'JOIN'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-black animate-in fade-in duration-300">
            <SettlementGatewayModal 
                isOpen={isSettlementOpen}
                onClose={() => setIsSettlementOpen(false)}
                recipientName={activePot?.recipient || "@OPERATIVE"}
                amount={activePot?.amount || 0}
                description={activePot?.title || "Money Pot Settlement"}
                transactionType="P2P_SETTLEMENT"
                onSuccess={(amt, desc, meta) => {
                    handlePotSuccess(amt, desc, meta);
                }}
            />
            <div className="p-5 flex flex-col flex-1 overflow-y-auto">
                
                {/* Custom Toggle matching Screenshot */}
                <div className="flex bg-[#0F0F0F] border border-zinc-900 rounded-[30px] p-1 mb-8 shadow-inner">
                    <button 
                        onClick={() => updateState(s => ({ ...s, squad: { ...s.squad, activeSubTab: 'FIND_SQUADS' } }))}
                        className={`flex-1 py-3.5 rounded-[25px] text-[12px] font-raj font-bold tracking-[0.2em] transition-all duration-300 ${
                            squad.activeSubTab === 'FIND_SQUADS' 
                            ? 'bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
                            : 'text-zinc-600'
                        }`}
                    >
                        FIND SQUADS
                    </button>
                    <button 
                        onClick={() => updateState(s => ({ ...s, squad: { ...s.squad, activeSubTab: 'MONEY_POTS' } }))}
                        className={`flex-1 py-3.5 rounded-[25px] text-[12px] font-raj font-bold tracking-[0.2em] transition-all duration-300 ${
                            squad.activeSubTab === 'MONEY_POTS' 
                            ? 'bg-[#008C9E] text-white shadow-[0_0_20px_rgba(0,140,158,0.4)]' 
                            : 'text-zinc-600'
                        }`}
                    >
                        MONEY POTS
                    </button>
                </div>

                {squad.activeSubTab === 'FIND_SQUADS' ? (
                    <div className="flex flex-col animate-in fade-in duration-500">
                        {/* Start New Squad Button */}
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full bg-[#FFD600] text-black py-4 rounded-2xl flex items-center justify-center gap-3 mb-8 shadow-[0_8px_30px_rgba(255,214,0,0.25)] hover:scale-[1.01] transition-all active:scale-95"
                        >
                            <UserPlus size={20} className="text-black" />
                            <span className="font-raj font-bold text-sm tracking-[0.2em] uppercase italic">START NEW SQUAD</span>
                        </button>

                        <div className="mb-6 px-1">
                            <h3 className="font-raj text-white text-[10px] font-bold tracking-[0.3em] uppercase mb-5 flex items-center gap-3">
                                LIVE ACTIVITIES NEARBY
                                <div className="h-[1px] flex-1 bg-zinc-900"></div>
                            </h3>
                            
                            <div className="pb-24">
                                {(squad?.feed || []).map(item => renderFeedItem(item))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 pb-24 animate-in fade-in duration-500">
                        {(squad?.moneyPots || []).map((pot, idx) => (
                            <div key={idx} className={`bg-[#121212] border border-zinc-900 p-6 rounded-[1.5rem] shadow-xl hover:border-zinc-700 transition-all relative overflow-hidden group`}>
                                {/* Pot Amount Accent */}
                                <div className="absolute top-6 right-6 font-data font-bold text-3xl text-[#FF3333] tracking-tighter italic">
                                    ₹{pot.amount}
                                </div>

                                <div className="mb-4">
                                    <div className="font-data font-bold text-[10px] text-zinc-600 tracking-[0.2em] uppercase mb-4">CASE: {pot.title}</div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="font-raj font-bold text-lg text-white">Pay <span className="text-[#CCFF00]">₹{pot.amount}</span> to <span className="text-[#00E5FF]">{pot.recipient}</span></div>
                                        <div className={`ml-auto px-3 py-0.5 rounded-full text-[9px] font-raj font-extrabold tracking-widest uppercase ${
                                            pot.color === 'yellow' ? 'bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/30' : 
                                            pot.color === 'green' ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30' : 
                                            'bg-[#FF3333]/10 text-[#FF3333] border border-[#FF3333]/30'
                                        }`}>
                                            {pot.badge}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-8">
                                    <div className="font-raj font-bold text-[10px] text-zinc-700 tracking-[0.2em] uppercase px-1">PROTOCOL TIME BONUS</div>
                                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                pot.color === 'yellow' ? 'bg-[#FFD600] shadow-[0_0_10px_#FFD600]' : 
                                                pot.color === 'green' ? 'bg-[#00FF88] shadow-[0_0_10px_#00FF88]' : 
                                                'bg-[#FF3333] shadow-[0_0_10px_#FF3333]'
                                            }`} 
                                            style={{ width: `${pot.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleInitiatePaymentClick(pot, idx)}
                                    className={`w-full h-14 bg-black/50 border flex items-center justify-between px-5 rounded-xl transition-all active:scale-[0.98] shadow-inner border-zinc-800 group-hover:border-[#CCFF00]/50`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-[#CCFF00]">
                                            <DollarSign size={18} />
                                        </div>
                                        <span className="font-raj font-extrabold text-[12px] text-white tracking-[0.25em] uppercase italic">
                                            INITIATE PAYMENT
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-data font-bold text-[14px] ${pot.reward > 0 ? 'text-[#CCFF00]' : 'text-zinc-700'}`}>
                                            {pot.reward > 0 ? `+${pot.reward}` : '0'}
                                        </span>
                                        <div className={pot.reward > 0 ? 'text-[#CCFF00]' : 'text-zinc-700'}>
                                            <Bone size={14} />
                                        </div>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Squad Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[5000] flex items-end justify-center animate-in fade-in duration-200 px-0">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => !isDeploying && setIsCreateModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-[#080808] border-t border-zinc-800 rounded-t-[2.5rem] shadow-[0_-20px_80px_rgba(0,0,0,1)] slide-up overflow-y-auto max-h-[92vh] flex flex-col">
                        <div className="sticky top-0 bg-[#080808]/95 backdrop-blur-md z-10 px-6 py-6 border-b border-zinc-900/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-raj font-bold text-[#FFD600] tracking-tight uppercase italic leading-none mb-1.5">NEW_SQUAD_UPLINK</h2>
                                <p className="text-zinc-600 text-[9px] font-data font-bold tracking-[0.2em] uppercase">Initializing broadcast protocol...</p>
                            </div>
                            <button onClick={() => !isDeploying && setIsCreateModalOpen(false)} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 active:scale-90 transition-transform">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-6 space-y-6 pb-12">
                            {/* Activity Icon Type */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-raj font-bold text-zinc-700 tracking-[0.2em] uppercase px-1">SELECT_MISSION_ICON</label>
                                <div className="grid grid-cols-4 gap-2.5">
                                    {[
                                        { type: 'GAME', icon: Gamepad2 },
                                        { type: 'FILM', icon: Film },
                                        { type: 'CAR', icon: Car },
                                        { type: 'COFFEE', icon: Coffee },
                                    ].map((item) => (
                                        <button 
                                            key={item.type}
                                            onClick={() => setFormData({...formData, iconType: item.type as any})}
                                            className={`h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${formData.iconType === item.type ? 'bg-[#FFD600] text-black border-[#FFD600] shadow-[0_0_20px_rgba(255,214,0,0.2)]' : 'bg-zinc-950 text-zinc-700 border-zinc-900 hover:border-zinc-700'}`}
                                        >
                                            <item.icon size={20} />
                                            <span className="text-[8px] font-raj font-bold uppercase tracking-widest">{item.type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title Input */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-raj font-bold text-zinc-700 tracking-[0.2em] uppercase px-1">SQUAD_DESIGNATION</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Valorant Night"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white font-raj font-bold tracking-wider outline-none focus:border-[#FFD600] focus:bg-[#0a0a0a] transition-all placeholder:text-zinc-800"
                                />
                            </div>

                            {/* Description Input */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-raj font-bold text-zinc-700 tracking-[0.2em] uppercase px-1">BROADCAST_DETAILS</label>
                                <textarea 
                                    placeholder="Need operators to split cost..."
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white font-inter text-[14px] outline-none focus:border-[#FFD600] focus:bg-[#0a0a0a] transition-all resize-none placeholder:text-zinc-800"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Location */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-raj font-bold text-zinc-700 tracking-[0.2em] uppercase px-1">SECTOR_LOCATION</label>
                                    <input 
                                        type="text" 
                                        placeholder="Sector 7G"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-4 text-white font-raj font-bold tracking-wider outline-none focus:border-[#FFD600] focus:bg-[#0a0a0a] transition-all placeholder:text-zinc-800"
                                    />
                                </div>
                                {/* Slots */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-raj font-bold text-zinc-700 tracking-[0.2em] uppercase px-1">MAX_CAPACITY</label>
                                    <div className="flex items-center bg-black border border-zinc-800 rounded-xl px-2 h-[58px]">
                                        <button onClick={() => setFormData({...formData, total: Math.max(2, formData.total - 1)})} className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FFD600] active:scale-90 transition-all font-bold text-xl">-</button>
                                        <div className="flex-1 text-center font-data font-bold text-white text-base">{formData.total}</div>
                                        <button onClick={() => setFormData({...formData, total: Math.min(10, formData.total + 1)})} className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FFD600] active:scale-90 transition-all font-bold text-xl">+</button>
                                    </div>
                                </div>
                            </div>

                            {/* Mode Toggle */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-raj font-bold text-zinc-700 tracking-[0.2em] uppercase px-1">FINANCIAL_PROTOCOL</label>
                                <div className="bg-black border border-zinc-900 rounded-2xl p-1.5 flex gap-1.5">
                                    <button 
                                        onClick={() => setFormData({...formData, type: 'BILL SPLIT'})}
                                        className={`flex-1 py-3.5 rounded-xl text-[10px] font-raj font-bold tracking-[0.15em] transition-all ${formData.type === 'BILL SPLIT' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20 border border-orange-500' : 'text-zinc-700 border border-transparent'}`}
                                    >
                                        BILL_SPLIT_MODE
                                    </button>
                                    <button 
                                        onClick={() => setFormData({...formData, type: 'HOST PAYS'})}
                                        className={`flex-1 py-3.5 rounded-xl text-[10px] font-raj font-bold tracking-[0.15em] transition-all ${formData.type === 'HOST PAYS' ? 'bg-green-600 text-white shadow-lg shadow-green-900/20 border border-green-500' : 'text-zinc-700 border border-transparent'}`}
                                    >
                                        HOST_PAYS_MODE
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button 
                                    disabled={isDeploying}
                                    onClick={handleCreateSquad}
                                    className="w-full bg-[#FFD600] text-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_12px_40px_rgba(255,214,0,0.25)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    {isDeploying ? <Loader2 className="animate-spin" size={24} /> : <Zap size={22} fill="currentColor" />}
                                    <span className="font-raj font-bold text-lg tracking-[0.15em] uppercase italic">
                                        {isDeploying ? 'DEPLOYING_UPLINK...' : 'DEPLOY SQUAD BROADCAST'}
                                    </span>
                                </button>
                                <p className="text-center text-[8px] font-data text-zinc-800 uppercase mt-4 tracking-widest">
                                    By broadcasting, you authorize hub indexing of your location sector.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SquadView;
