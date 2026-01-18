import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Loader2, ChevronDown, Info, Lock, Landmark, Globe, ChevronLeft, Check } from 'lucide-react';

interface PaymentMethod {
    id: string;
    name: string;
    subtext: string;
    icon: React.ElementType;
    color: string;
}

const METHODS: PaymentMethod[] = [
    { id: 'ledger', name: 'GSD_INTERNAL_LEDGER', subtext: 'SECURE_SYNC_0x77', icon: Lock, color: '#CCFF00' },
    { id: 'axis', name: 'AXIS_BANK_****7701', subtext: 'DIRECT_NODE_UPLINK', icon: Landmark, color: '#FF3333' },
    { id: 'hdfc', name: 'HDFC_NODE_****4032', subtext: 'SATELLITE_RELAY', icon: Globe, color: '#00E5FF' },
];

interface GPaySheetProps {
    isOpen: boolean;
    onClose: () => void;
    recipientName: string;
    recipientId: string;
    amount: number;
    onPaymentComplete: () => void;
}

const GPaySheet: React.FC<GPaySheetProps> = ({ isOpen, onClose, recipientName, recipientId, amount, onPaymentComplete }) => {
    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
    const [view, setView] = useState<'DETAILS' | 'SELECT_METHOD'>('DETAILS');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(METHODS[0]);

    useEffect(() => {
        if (!isOpen) {
            setStatus('IDLE');
            setView('DETAILS');
        }
    }, [isOpen]);

    const handlePay = () => {
        setStatus('PROCESSING');
        setTimeout(() => {
            setStatus('SUCCESS');
            setTimeout(() => {
                onPaymentComplete();
            }, 1500);
        }, 2000);
    };

    if (!isOpen) return null;

    const MethodIcon = selectedMethod.icon;

    return (
        <div className="fixed inset-0 z-[9000] flex items-end justify-center animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-md bg-zinc-900 rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500 font-inter">
                {/* Top Drag Handle */}
                <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mt-4 mb-2"></div>

                {status === 'IDLE' && view === 'DETAILS' && (
                    <div className="p-6 flex flex-col items-center animate-in fade-in duration-300">
                        {/* Google Pay Style Header */}
                        <div className="w-full flex justify-between items-center mb-10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                    <span className="text-black font-black text-xs">G</span>
                                </div>
                                <span className="text-zinc-400 font-bold text-sm tracking-tight">GSD Pay</span>
                            </div>
                            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                                <ChevronDown size={24} />
                            </button>
                        </div>

                        {/* Recipient Details */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-20 h-20 bg-zinc-800 rounded-full border-4 border-zinc-900 flex items-center justify-center text-white text-3xl font-black italic shadow-xl mb-4">
                                {recipientName.replace('@', '').charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-white font-bold text-xl mb-1 uppercase tracking-tight">Paying {recipientName}</h2>
                            <div className="text-zinc-500 font-mono text-xs">{recipientId}</div>
                        </div>

                        {/* Amount Section */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="text-white font-bold text-5xl tracking-tighter flex items-start gap-1">
                                <span className="text-2xl mt-2">₹</span>
                                {amount.toLocaleString()}
                            </div>
                            <div className="mt-4 px-4 py-1.5 bg-zinc-800/50 rounded-full flex items-center gap-2 border border-zinc-800">
                                <Info size={12} className="text-[#00E5FF]" />
                                <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">GSD_RENTAL_PROTOCOL</span>
                            </div>
                        </div>

                        {/* Payment Method Selector - NOW FUNCTIONAL */}
                        <div 
                            onClick={() => setView('SELECT_METHOD')}
                            className="w-full bg-[#1A1A1A] rounded-2xl p-5 mb-8 border border-zinc-800 flex items-center justify-between group cursor-pointer hover:bg-zinc-800 transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
                                    <MethodIcon size={18} style={{ color: selectedMethod.color }} />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm tracking-tight">{selectedMethod.name}</div>
                                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{selectedMethod.subtext}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">CHANGE</span>
                                <ChevronDown size={20} className="text-zinc-700" />
                            </div>
                        </div>

                        {/* Action Button */}
                        <button 
                            onClick={handlePay}
                            className="w-full bg-[#00E5FF] hover:bg-[#00f3ff] text-black py-5 rounded-2xl font-black text-lg tracking-widest uppercase shadow-[0_15px_30px_rgba(0,229,255,0.3)] active:scale-95 transition-all mb-8"
                        >
                            PAY ₹{amount.toLocaleString()}
                        </button>

                        {/* Security Footer */}
                        <div className="flex items-center gap-2 opacity-30 mb-4">
                            <ShieldCheck size={14} className="text-white" />
                            <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">PCI_DSS // SECURE_UPLINK</span>
                        </div>
                    </div>
                )}

                {status === 'IDLE' && view === 'SELECT_METHOD' && (
                    <div className="p-6 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <button 
                                onClick={() => setView('DETAILS')}
                                className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white active:scale-90 transition-transform"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <h2 className="text-white font-black text-lg uppercase tracking-widest">Select Method</h2>
                        </div>

                        <div className="space-y-3 mb-10">
                            {METHODS.map((method) => {
                                const Icon = method.icon;
                                const isSelected = selectedMethod.id === method.id;
                                return (
                                    <button 
                                        key={method.id}
                                        onClick={() => {
                                            setSelectedMethod(method);
                                            setView('DETAILS');
                                        }}
                                        className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${
                                            isSelected 
                                            ? 'bg-zinc-800/50 border-[#CCFF00]/40 shadow-inner' 
                                            : 'bg-[#1A1A1A] border-zinc-800 hover:border-zinc-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shadow-inner">
                                                <Icon size={22} style={{ color: method.color }} />
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-bold text-sm tracking-tight ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{method.name}</div>
                                                <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{method.subtext}</div>
                                            </div>
                                        </div>
                                        {isSelected && <Check size={20} className="text-[#CCFF00]" />}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] mb-4">
                            ADD_NEW_PAYMENT_NODE
                        </p>
                    </div>
                )}

                {status === 'PROCESSING' && (
                    <div className="p-12 flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-300">
                        <div className="relative mb-10">
                            <Loader2 size={80} className="text-[#00E5FF] animate-spin" strokeWidth={1} />
                            <div className="absolute inset-0 m-auto w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-2xl">
                                <span className="text-black font-black text-xl">G</span>
                            </div>
                        </div>
                        <h2 className="text-white font-black text-2xl uppercase italic tracking-widest mb-2">Processing...</h2>
                        <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-[0.3em]">SECURE_UPLINK_COMMITTED</p>
                    </div>
                )}

                {status === 'SUCCESS' && (
                    <div className="p-12 flex flex-col items-center justify-center min-h-[400px] animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-[#CCFF00] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(204,255,0,0.5)] mb-8">
                            <CheckCircle2 size={56} className="text-black" strokeWidth={3} />
                        </div>
                        <h2 className="text-white font-black text-3xl uppercase italic tracking-tighter mb-2">Success</h2>
                        <div className="px-6 py-2 bg-zinc-800/50 border border-[#CCFF00]/30 rounded-xl">
                            <span className="text-[#CCFF00] font-mono text-sm font-bold">TX_REF: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                        </div>
                    </div>
                )}

                {/* Aesthetic Pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>
        </div>
    );
};

export default GPaySheet;