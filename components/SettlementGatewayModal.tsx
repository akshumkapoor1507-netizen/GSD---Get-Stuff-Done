import React, { useState, useEffect } from 'react';
import { X, QrCode, Banknote, Loader2, Bone, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SettlementGatewayModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientName: string;
    amount: number;
    description: string;
    transactionType: string;
    onSuccess: (amount: number, description: string, receiptMeta?: any) => void;
}

const SettlementGatewayModal: React.FC<SettlementGatewayModalProps> = ({
    isOpen,
    onClose,
    recipientName,
    amount,
    description,
    transactionType,
    onSuccess
}) => {
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH'>('UPI');
    const [isExecuting, setIsExecuting] = useState(false);
    const [step, setStep] = useState<'IDLE' | 'SUCCESS'>('IDLE');

    // Reward Logic: 10% Floor
    const estimatedReward = Math.floor(amount * 0.10);

    // Mock UPI QR code URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=gsd_pay@axis&pn=GSD_SETTLEMENT&am=${amount}&cu=INR`;

    const handlePaymentExecution = () => {
        setIsExecuting(true);
        
        // Simulate secure banking protocol
        setTimeout(() => {
            setIsExecuting(false);
            setStep('SUCCESS');
            
            // Generate receipt metadata
            const receiptMeta = {
                transactionId: 'GSD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                method: paymentMethod + '_DIRECT',
                authCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
                timestamp: new Date().toISOString(),
                recipient: recipientName,
                deviceSignature: 'GSD_OS_NODE_77'
            };

            // award bones and create record
            onSuccess(amount, description, receiptMeta);

            // auto close after success view
            setTimeout(() => {
                onClose();
                setStep('IDLE');
            }, 2500);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[8000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="zoom-in-modal w-full max-w-[360px] bg-[#0A0A0A] border border-[#1A1A1A] rounded-[2.5rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden">
                {/* Tactical Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent opacity-40"></div>
                
                {step === 'IDLE' ? (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <div className="font-raj font-bold text-zinc-500 text-[10px] tracking-[0.4em] uppercase italic">SETTLEMENT GATEWAY</div>
                            <button onClick={onClose} className="text-zinc-700 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 text-center mb-8">
                            <div className="text-[10px] font-raj text-zinc-600 font-bold tracking-[0.2em] uppercase mb-2">TOTAL DUE TO {recipientName}</div>
                            <div className="text-4xl font-raj font-bold text-[#CCFF00] mb-2 leading-none flex items-center justify-center gap-1.5">
                                <span className="text-xl">₹</span>{amount.toLocaleString()}
                            </div>
                            <div className="text-zinc-500 font-inter text-[12px] italic opacity-80">{description}</div>
                        </div>

                        {/* Method Toggles */}
                        <div className="bg-black border border-zinc-900 rounded-2xl p-1 flex gap-1 mb-8">
                            <button 
                                onClick={() => setPaymentMethod('UPI')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-raj font-bold text-[11px] tracking-widest transition-all ${
                                    paymentMethod === 'UPI' ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10' : 'text-zinc-700'
                                }`}
                            >
                                <QrCode size={16} /> UPI_MODE
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('CASH')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-raj font-bold text-[11px] tracking-widest transition-all ${
                                    paymentMethod === 'CASH' ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10' : 'text-zinc-700'
                                }`}
                            >
                                <Banknote size={16} /> CASH_PROTOCOL
                            </button>
                        </div>

                        {/* Conditional View */}
                        <div className="min-h-[160px] flex flex-col items-center justify-center mb-8">
                            {paymentMethod === 'UPI' ? (
                                <div className="bg-white p-3 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)] animate-in zoom-in duration-300">
                                    <img src={qrUrl} alt="UPI QR" className="w-[120px] h-[120px] block" />
                                </div>
                            ) : (
                                <div className="text-center p-6 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl animate-in fade-in duration-300">
                                    <p className="text-zinc-500 font-inter text-[12px] leading-relaxed mb-1">
                                        Hand cash directly to operative.
                                    </p>
                                    <p className="text-zinc-700 font-data text-[10px] uppercase tracking-widest">UPLOAD RECEIPT IF REQUIRED</p>
                                </div>
                            )}
                        </div>

                        {/* Reward Preview */}
                        <div className="flex justify-between items-center mb-8 px-2 border-t border-zinc-900/50 pt-5">
                            <div className="font-raj font-bold text-zinc-600 text-[11px] tracking-widest uppercase">ESTIMATED REWARD</div>
                            <div className="flex items-center gap-2 text-[#FFD700] font-raj font-bold text-lg">
                                +{estimatedReward} <Bone size={16} fill="currentColor" />
                            </div>
                        </div>

                        {/* Initiate Action */}
                        <button 
                            disabled={isExecuting}
                            onClick={handlePaymentExecution}
                            className="w-full bg-[#CCFF00] text-black py-5 rounded-2xl font-raj font-bold text-sm tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isExecuting ? (
                                <><Loader2 size={18} className="animate-spin" /> EXECUTING_UPLINK...</>
                            ) : (
                                <><ShieldCheck size={18} /> INITIATE TRANSFER</>
                            )}
                        </button>
                    </>
                ) : (
                    <div className="text-center py-10 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} className="text-[#CCFF00]" />
                        </div>
                        <h2 className="text-white font-raj font-bold text-2xl uppercase italic mb-2 tracking-tight">Payment Verified</h2>
                        <div className="text-zinc-500 font-data text-[11px] tracking-[0.2em] mb-8 uppercase">PROTOCOL_SETTLED_SUCCESSFULLY</div>
                        <div className="bg-zinc-900/40 p-4 rounded-xl inline-flex items-center gap-3">
                            <span className="text-[#FFD700] font-raj font-bold text-xl">+{estimatedReward} BONES</span>
                            <Bone size={18} className="text-[#FFD700]" fill="currentColor" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettlementGatewayModal;