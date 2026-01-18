
import React, { useState, useEffect } from 'react';
import { Eye, Shield, Fingerprint, Loader2, Scan, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';
import { AppState } from '../types';

interface LoginViewProps {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ state, updateState }) => {
    const isSignIn = state.loginMode === 'SIGN_IN';
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('INITIALIZING_SENSOR');

    const handleLogin = () => {
        updateState(s => ({ ...s, isLoading: true }));
        setTimeout(() => {
            updateState(s => ({ ...s, isLoading: false, isLoggedIn: true }));
        }, 1000);
    };

    const triggerBiometric = () => {
        setIsScanning(true);
        setScanProgress(0);
        setScanStatus('INITIALIZING_SENSOR');

        // Stage 1: Init
        setTimeout(() => setScanStatus('READING_NODE_SIGNATURE'), 600);
        
        // Stage 2: Biometric Data Stream
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);

        setTimeout(() => setScanStatus('NEURAL_SYNC_ESTABLISHED'), 1800);
        
        // Final: Success & Login
        setTimeout(() => {
            setScanStatus('UPLINK_VERIFIED');
            setTimeout(() => {
                setIsScanning(false);
                handleLogin();
            }, 800);
        }, 3000);
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-5 z-[9999] animate-in fade-in duration-300">
            {/* Biometric Scanning HUD Overlay */}
            {isScanning && (
                <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-10 overflow-hidden font-raj">
                    {/* HUD Decor Elements */}
                    <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-[#00E5FF] opacity-50"></div>
                    <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-[#00E5FF] opacity-50"></div>
                    <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-[#00E5FF] opacity-50"></div>
                    <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-[#00E5FF] opacity-50"></div>

                    <div className="relative mb-12">
                        {/* Scanning Reticle */}
                        <div className="w-64 h-64 rounded-full border-2 border-dashed border-[#00E5FF]/20 animate-spin duration-[20s] absolute -inset-8"></div>
                        <div className="w-64 h-64 rounded-full border border-[#00E5FF]/40 animate-pulse absolute -inset-4"></div>
                        
                        <div className="w-64 h-64 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center relative overflow-hidden group shadow-[0_0_80px_rgba(0,229,255,0.15)]">
                            {/* Scanning Laser Line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#00E5FF] shadow-[0_0_20px_#00E5FF] z-20 animate-laser-move"></div>
                            
                            <div className="relative z-10 transition-transform duration-300 scale-110">
                                {scanStatus === 'UPLINK_VERIFIED' ? (
                                    <CheckCircle2 size={120} className="text-[#CCFF00] animate-in zoom-in duration-300" />
                                ) : (
                                    <Fingerprint size={120} className="text-[#00E5FF] opacity-80" />
                                )}
                            </div>

                            {/* Data Streams */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none text-[8px] font-data p-4">
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <div key={i} className="whitespace-nowrap">NODE_SYNC_PK_0x{Math.random().toString(16).substr(2, 8).toUpperCase()}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-4 max-w-[280px]">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/40 rounded-full">
                            <Activity size={12} className="text-[#00E5FF] animate-pulse" />
                            <span className="text-[#00E5FF] font-data font-black text-[9px] tracking-[0.3em] uppercase">{scanStatus}</span>
                        </div>
                        
                        <h2 className="text-white font-black text-3xl uppercase italic tracking-tighter">BIOMETRIC_UPLINK</h2>
                        
                        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#00E5FF] transition-all duration-300 ease-out"
                                style={{ width: `${scanProgress}%` }}
                            ></div>
                        </div>
                        
                        <div className="text-zinc-600 font-data text-[10px] tracking-widest uppercase">
                            STABILITY: 99.8% // ENCRYPTION_GSD_OS
                        </div>
                    </div>

                    {/* Exit Scanning */}
                    <button 
                        onClick={() => setIsScanning(false)}
                        className="mt-12 text-zinc-700 hover:text-white font-raj font-bold text-[11px] tracking-[0.4em] uppercase transition-colors"
                    >
                        [ ABORT_UPLINK ]
                    </button>
                </div>
            )}

            {/* Logo Section */}
            <div className="text-center mb-10">
                <div className="font-raj font-bold text-[36px] text-white tracking-[2px] mb-1.5 leading-none">GSD_OS</div>
                <div className="font-inter text-[14px] text-zinc-600 tracking-[0.5px]">Campus Ecosystem Access</div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-[320px] bg-[#111] border border-[#222] rounded-2xl p-[30px_25px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-300 ease-in-out">
                {/* Mode Toggle */}
                <div className="bg-[#1A1A1A] rounded-[30px] p-1 flex mb-8.5">
                    <button 
                        onClick={() => updateState(s => ({ ...s, loginMode: 'SIGN_IN' }))}
                        className={`flex-1 text-center py-2.5 rounded-[25px] font-raj font-extrabold text-[13px] cursor-pointer tracking-wider transition-all duration-200 ${
                            isSignIn 
                            ? 'bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]' 
                            : 'bg-transparent text-zinc-600'
                        }`}
                    >
                        SIGN IN
                    </button>
                    <button 
                        onClick={() => updateState(s => ({ ...s, loginMode: 'SIGN_UP' }))}
                        className={`flex-1 text-center py-2.5 rounded-[25px] font-raj font-extrabold text-[13px] cursor-pointer tracking-wider transition-all duration-200 ${
                            !isSignIn 
                            ? 'bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]' 
                            : 'bg-transparent text-zinc-600'
                        }`}
                    >
                        SIGN UP
                    </button>
                </div>

                {/* Form Fields Container */}
                <div className="flex flex-col gap-6 mb-9">
                    
                    {/* FULL NAME - Sign Up Only */}
                    {!isSignIn && (
                        <div className="animate-in fade-in duration-300 slide-in-from-top-1">
                            <div className="font-raj font-bold text-[11px] text-[#5A6E7C] mb-2 tracking-wider uppercase">FULL NAME</div>
                            <div className="scanline-effect rounded">
                                <input 
                                    type="text" 
                                    placeholder="Operator Name"
                                    className="w-full bg-transparent border-none border-b border-zinc-800 p-[8px_0] text-white font-inter text-[15px] outline-none transition-all duration-200 focus:border-[#CCFF00] relative z-20"
                                />
                            </div>
                        </div>
                    )}

                    {/* EMAIL */}
                    <div>
                        <div className="font-raj font-bold text-[11px] text-[#5A6E7C] mb-2 tracking-wider uppercase">EMAIL</div>
                        <div className="scanline-effect rounded">
                            <input 
                                type="email" 
                                placeholder="student@campus.edu"
                                className="w-full bg-transparent border-none border-b border-zinc-800 p-[8px_0] text-white font-inter text-[15px] outline-none transition-all duration-200 focus:border-[#CCFF00] relative z-20"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="font-raj font-bold text-[11px] text-[#5A6E7C] tracking-wider uppercase">PASSWORD</div>
                            <Eye size={16} className="text-zinc-800 cursor-pointer hover:text-zinc-600 transition-colors" />
                        </div>
                        <div className="scanline-effect rounded">
                            <input 
                                type="password" 
                                className="w-full bg-transparent border-none border-b border-zinc-800 p-[8px_0] text-white font-inter text-[15px] outline-none transition-all duration-200 focus:border-[#CCFF00] relative z-20"
                            />
                        </div>
                    </div>

                    {/* CONFIRM PASSWORD - Sign Up Only */}
                    {!isSignIn && (
                        <div className="animate-in fade-in duration-300 slide-in-from-top-1">
                            <div className="font-raj font-bold text-[11px] text-[#5A6E7C] mb-2 tracking-wider uppercase">CONFIRM PASSWORD</div>
                            <div className="scanline-effect rounded">
                                <input 
                                    type="password" 
                                    className="w-full bg-transparent border-none border-b border-zinc-800 p-[8px_0] text-white font-inter text-[15px] outline-none transition-all duration-200 focus:border-[#CCFF00] relative z-20"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleLogin}
                        className="scanline-effect w-full bg-[#CCFF00] border-none p-4 rounded-lg font-raj font-extrabold text-[15px] text-black cursor-pointer tracking-widest uppercase shadow-[0_0_20px_rgba(204,255,0,0.2)] active:scale-95 transition-all duration-100"
                    >
                        {isSignIn ? 'SIGN IN >' : 'CREATE ACCOUNT >'}
                    </button>

                    {isSignIn && (
                        <button 
                            onClick={triggerBiometric}
                            className="w-full bg-black border border-zinc-800 p-4 rounded-lg font-raj font-extrabold text-[13px] text-[#00E5FF] cursor-pointer flex items-center justify-center gap-3 transition-all hover:bg-zinc-900 active:scale-95 shadow-lg group"
                        >
                            <Fingerprint size={20} className="group-hover:scale-110 transition-transform" />
                            BIOMETRIC_UPLINK
                        </button>
                    )}
                </div>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 h-[1px] bg-zinc-900"></div>
                    <div className="px-2.5 text-zinc-800 font-raj text-[11px] font-bold">OR</div>
                    <div className="flex-1 h-[1px] bg-zinc-900"></div>
                </div>

                {/* Google Button */}
                <button 
                    onClick={handleLogin}
                    className="scanline-effect w-full bg-[#1A1A1A] border border-zinc-800 p-3.5 rounded-lg font-raj font-bold text-[13px] text-white cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-[#222]"
                >
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                       <span className="text-black font-inter font-black text-[12px]">G</span>
                    </div>
                    SYSTEM OVERRIDE: GOOGLE
                </button>
            </div>

            <style>{`
                @keyframes laser-move {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
                .animate-laser-move {
                    animation: laser-move 2.5s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default LoginView;
