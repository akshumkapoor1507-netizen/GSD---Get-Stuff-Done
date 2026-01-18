import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Zap, Shield, Trophy, Activity, Cpu } from 'lucide-react';
import { AppState } from '../types';

interface LeaderboardViewProps {
    state: AppState;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ state }) => {
    const { leaderboard, user } = state;

    // Helper to get rank specific color/energy
    const getRankStyles = (rank: number) => {
        switch (rank) {
            case 1: return { 
                color: '#CCFF00', 
                glow: 'shadow-[0_0_30px_rgba(204,255,0,0.2)]', 
                border: 'border-[#CCFF00]', 
                bg: 'bg-[#CCFF00]/5',
                label: 'APEX_OPERATOR'
            };
            case 2: return { 
                color: '#00E5FF', 
                glow: 'shadow-[0_0_25px_rgba(0,229,255,0.15)]', 
                border: 'border-[#00E5FF]/40', 
                bg: 'bg-[#00E5FF]/5',
                label: 'ELITE_NODE'
            };
            case 3: return { 
                color: '#FF9900', 
                glow: 'shadow-[0_0_25px_rgba(255,153,0,0.15)]', 
                border: 'border-[#FF9900]/40', 
                bg: 'bg-[#FF9900]/5',
                label: 'PRIME_CORE'
            };
            default: return { 
                color: '#52525B', 
                glow: '', 
                border: 'border-zinc-800/50', 
                bg: 'bg-zinc-900/10',
                label: 'SYNCED'
            };
        }
    };

    return (
        <div className="h-full flex flex-col bg-black overflow-hidden font-raj relative">
            {/* Background HUD Decor */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none overflow-hidden font-data text-[8px] leading-tight flex flex-col">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="whitespace-nowrap">
                        0x77_RANK_DATA_STREAM_CLEARANCE_LVL_9_SECURE_PAY_INIT_BONE_PROTOCOL_ACCESS_GRANTED_{Math.random().toString(36).substring(7)}
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="px-6 pt-10 pb-6 flex justify-between items-end relative z-10 border-b border-white/5 bg-black/80 backdrop-blur-md">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={12} className="text-[#CCFF00] animate-pulse" />
                        <span className="text-[10px] font-black text-zinc-500 tracking-[0.4em] uppercase italic">LIVE_OS_SYNC</span>
                    </div>
                    <h2 className="text-white text-4xl font-black italic tracking-tighter leading-none">SYSTEM_RANKINGS</h2>
                </div>
                <div className="text-right">
                    <div className="text-[9px] font-data font-bold text-zinc-600 tracking-widest mb-1">EPOCH_S2 // ACTIVE</div>
                    <div className="bg-[#CCFF00] text-black px-2 py-0.5 rounded-sm font-bold text-[10px] tracking-tighter italic shadow-[0_0_10px_rgba(204,255,0,0.4)]">
                        RESET IN T-4D
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 no-scrollbar relative z-10 pb-32">
                {leaderboard.rankings.map((entry) => {
                    const styles = getRankStyles(entry.rank);
                    const isTop3 = entry.rank <= 3;
                    
                    return (
                        <div 
                            key={entry.rank}
                            className={`group relative transition-all duration-300 active:scale-[0.98] ${isTop3 ? 'mb-6' : 'mb-2'}`}
                        >
                            {/* Clipped Background using Polygon */}
                            <div 
                                className={`absolute inset-0 ${styles.bg} ${styles.border} border transition-all duration-300 ${styles.glow} group-hover:brightness-125`}
                                style={{ clipPath: 'polygon(0% 0%, 95% 0%, 100% 25%, 100% 100%, 5% 100%, 0% 75%)' }}
                            ></div>

                            {/* HUD Corners for Top Ranks */}
                            {isTop3 && (
                                <>
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l" style={{ borderColor: styles.color }}></div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r" style={{ borderColor: styles.color }}></div>
                                </>
                            )}

                            <div className="relative flex items-center gap-4 p-4 min-h-[80px]">
                                {/* Rank Indicator */}
                                <div className="flex flex-col items-center justify-center min-w-[32px]">
                                    <span className={`text-2xl font-black italic italic leading-none mb-1 ${isTop3 ? '' : 'text-zinc-700'}`} style={{ color: isTop3 ? styles.color : undefined }}>
                                        {entry.rank.toString().padStart(2, '0')}
                                    </span>
                                    {entry.trend === 'up' && <ArrowUpRight size={14} className="text-green-500" />}
                                    {entry.trend === 'down' && <ArrowDownRight size={14} className="text-red-500" />}
                                    {entry.trend === 'flat' && <Minus size={14} className="text-zinc-800" />}
                                </div>

                                {/* Avatar Node */}
                                <div className={`relative w-12 h-12 flex items-center justify-center border-2 rotate-45 group-hover:rotate-0 transition-transform duration-500 ${isTop3 ? styles.border : 'border-zinc-800'}`}>
                                    <div className="absolute inset-0 bg-black opacity-40"></div>
                                    <div className="-rotate-45 group-hover:rotate-0 transition-transform duration-500 flex items-center justify-center w-full h-full">
                                        {entry.rank === 1 ? (
                                            <Trophy size={20} className="text-[#CCFF00] drop-shadow-[0_0_8px_#CCFF00]" />
                                        ) : (
                                            <span className="text-white font-raj font-black text-xl italic">{entry.name[0].toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Operator Intel */}
                                <div className="flex-1 min-w-0 ml-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-white font-black text-xl italic tracking-tighter uppercase truncate leading-none">
                                            {entry.name}
                                        </h3>
                                        {isTop3 && <Zap size={12} className="fill-current animate-pulse" style={{ color: styles.color }} />}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-[9px] font-black tracking-[0.2em] uppercase opacity-60" style={{ color: isTop3 ? styles.color : '#71717A' }}>
                                            {styles.label}
                                        </div>
                                        <div className="h-2 w-[1px] bg-zinc-800"></div>
                                        <div className="text-[9px] font-data text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Shield size={8} /> {entry.tier.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {/* Score Readout */}
                                <div className="text-right">
                                    <div className={`text-2xl font-data font-black tracking-tighter italic leading-none mb-1 ${isTop3 ? 'group-hover:scale-110 transition-transform' : ''}`} style={{ color: isTop3 ? styles.color : '#fff' }}>
                                        {entry.score.toLocaleString()}
                                    </div>
                                    <div className="text-[8px] font-black text-zinc-700 tracking-[0.3em] uppercase">BONES_MINED</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Industrial Sticky User Footer */}
            <div className="fixed bottom-20 left-0 right-0 z-[100] px-5 pb-6 pointer-events-none">
                <div 
                    className="bg-[#0A0A0A]/95 border border-[#CCFF00] backdrop-blur-2xl p-5 flex items-center gap-5 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] pointer-events-auto"
                    style={{ clipPath: 'polygon(5% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 25%)' }}
                >
                    <div className="relative">
                        <div className="w-12 h-12 bg-[#CCFF00] flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.4)]">
                            <span className="text-black font-raj font-black text-2xl italic leading-none">{user.name.toUpperCase()}</span>
                        </div>
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-black flex items-center justify-center border border-[#CCFF00]">
                            <Cpu size={8} className="text-[#CCFF00]" />
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse"></div>
                            <div className="font-raj font-black text-[10px] text-[#CCFF00] tracking-[0.4em] uppercase">OPERATIVE_ID: {user.id}</div>
                        </div>
                        <div className="font-raj text-sm font-bold tracking-widest uppercase italic text-white/90">
                            YOU ARE RANK <span className="text-[#CCFF00]">#1</span> IN SKULL_CLAN
                        </div>
                    </div>
                    
                    <div className="text-right border-l border-zinc-800 pl-5">
                        <div className="text-2xl font-data font-black text-white italic tracking-tighter leading-none mb-1">
                            1,680<span className="text-xs ml-1 text-zinc-600">🦴</span>
                        </div>
                        <div className="text-[8px] font-black text-[#CCFF00] tracking-[0.2em] uppercase italic">SYNCED</div>
                    </div>
                </div>
            </div>

            {/* Scanline Animation Overlay */}
            <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.015] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
        </div>
    );
};

export default LeaderboardView;