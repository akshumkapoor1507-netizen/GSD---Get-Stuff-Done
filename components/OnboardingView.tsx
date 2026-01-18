
import React, { useState, useEffect } from 'react';
import { Bone, LayoutGrid, Users, Zap, CheckCircle2, ChevronRight, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { AppState } from '../types';

interface OnboardingViewProps {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ state, updateState }) => {
    const [step, setStep] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);

    const steps = [
        {
            title: "UPLINK_ESTABLISHED",
            subtitle: "IDENTITY VERIFIED",
            description: "Welcome to GSD OS. You have been cleared for access to the campus operating system. Initializing tactical HUD...",
            icon: <ShieldCheck size={48} className="text-[#CCFF00]" />,
            color: "#CCFF00",
            action: "CONTINUE_UPLINK"
        },
        {
            title: "REWARD_PROTOCOL",
            subtitle: "BONE MECHANICS",
            description: "Earn 10% cash-back in BONES for every gear rental, bounty settlement, or squad payment. Collect, stack, and unlock exclusive rewards.",
            icon: <Bone size={56} className="text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]" />,
            color: "#FFD700",
            action: "SYNC_WALLETS"
        },
        {
            title: "THE_HUB",
            subtitle: "RENTALS & BOUNTIES",
            description: "Access a shared inventory of high-end campus gear. Rent cameras, drones, or laptops. Post bounties and get tasks done by the network.",
            icon: <LayoutGrid size={52} className="text-[#00E5FF] drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]" />,
            color: "#00E5FF",
            action: "MAP_INVENTORY"
        },
        {
            title: "SQUAD_NETWORK",
            subtitle: "FINANCIAL PROTOCOLS",
            description: "Join social squads for movies or meals. Use split-bill 'Money Pots' to settle expenses instantly while earning bone bonuses.",
            icon: <Users size={52} className="text-[#9D00FF] drop-shadow-[0_0_15px_rgba(157,0,255,0.4)]" />,
            color: "#9D00FF",
            action: "GRANT_CLEARANCE"
        }
    ];

    const nextStep = () => {
        if (step === steps.length - 1) {
            completeOnboarding();
            return;
        }
        setIsTransitioning(true);
        setTimeout(() => {
            setStep(s => s + 1);
            setIsTransitioning(false);
        }, 400);
    };

    const completeOnboarding = () => {
        setIsInitializing(true);
        setTimeout(() => {
            updateState(s => ({
                ...s,
                home: { ...s.home, isOnboarding: false }
            }));
        }, 2000);
    };

    const current = steps[step];

    return (
        <div className="fixed inset-0 z-[9000] bg-black flex flex-col items-center justify-center p-8 overflow-hidden font-raj">
            {/* Background Data Matrix (Static) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none font-data text-[10px] leading-tight overflow-hidden break-all">
                {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i}>0XFF9900_DATA_STREAM_CLEARANCE_LVL_9_SECURE_PAY_INIT_BONE_PROTOCOL_ACCESS_GRANTED_{Math.random().toString(36)}</div>
                ))}
            </div>

            {/* Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#CCFF00]/20 shadow-[0_0_10px_#CCFF00] animate-scanline z-10 pointer-events-none"></div>

            <div className={`w-full max-w-sm flex flex-col items-center transition-all duration-400 ${isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                
                {/* Tactical Corners */}
                <div className="relative p-10 mb-8 flex flex-col items-center">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: current.color }}></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: current.color }}></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: current.color }}></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: current.color }}></div>
                    
                    <div className="animate-float">
                        {current.icon}
                    </div>
                </div>

                <div className="text-center space-y-2 mb-10">
                    <div className="font-raj font-black text-xs tracking-[0.4em] uppercase italic opacity-60" style={{ color: current.color }}>{current.subtitle}</div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">
                        {current.title}
                    </h1>
                </div>

                <p className="text-zinc-500 text-center font-inter text-sm leading-relaxed mb-12 max-w-[280px]">
                    {current.description}
                </p>

                {/* Progress Indicators */}
                <div className="flex gap-2 mb-12">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-1 transition-all duration-300 rounded-full ${i === step ? 'w-8 bg-[#CCFF00]' : 'w-2 bg-zinc-900'}`}></div>
                    ))}
                </div>

                <button 
                    disabled={isInitializing}
                    onClick={nextStep}
                    className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl relative overflow-hidden group`}
                    style={{ backgroundColor: current.color, color: '#000' }}
                >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                    
                    {isInitializing ? (
                        <><Loader2 className="animate-spin" size={20} /> INITIALIZING_DASHBOARD</>
                    ) : (
                        <>
                            <span className="font-raj font-black text-sm tracking-[0.2em] uppercase italic">{current.action}</span>
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>

                {step === 0 && (
                    <button 
                        onClick={completeOnboarding}
                        className="mt-6 text-zinc-700 font-raj font-bold text-[10px] tracking-[0.3em] uppercase hover:text-zinc-500 transition-colors"
                    >
                        [ SKIP_INITIALIZATION ]
                    </button>
                )}
            </div>

            <style>{`
                @keyframes scanline {
                    0% { transform: translateY(-100px); }
                    100% { transform: translateY(110vh); }
                }
                .animate-scanline {
                    animation: scanline 3s linear infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default OnboardingView;
