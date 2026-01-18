
import React, { useState, useCallback, useEffect, useRef } from 'react';
/* Added Wand2, Loader2, and Sparkles for AI Image features */
import { Home, LayoutGrid, Trophy, Users, UserCircle, Bone as BoneIcon, CheckCircle2, X, ShieldCheck, Zap, Activity, Cpu, Fingerprint, Star, Target, ArrowUpRight, Shield, Wand2, Loader2, Sparkles, Award } from 'lucide-react';
import { AppState, BottomTab, TransactionRecord, HubInvoice, TrustHistoryEntry, AppNotification } from './types';
import { GoogleGenAI } from "@google/genai";

// Components
import HomeView from './components/HomeView';
import HubView from './components/HubView';
import LeaderboardView from './components/LeaderboardView';
import SquadView from './components/SquadView';
import IDView from './components/IDView'; // Added import for Profile view
import LoginView from './components/LoginView';
import LoadingView from './components/LoadingView';
import OnboardingView from './components/OnboardingView';

/**
 * Registry of known high-value operatives with unique statistical profiles.
 * Fallback deterministic logic is used for unknown IDs.
 */
const OPERATIVE_INTEL: Record<string, any> = {
    'DECKARD': { 
        reliability: 98.7, 
        bounties: 156, 
        tenure: 420, 
        gearRented: 89, 
        badges: ['shield', 'zap', 'target', 'award'],
        bio: "Nexus-9 Series retirement specialist. Prime Core clearance."
    },
    'ZHORA': { 
        reliability: 94.2, 
        bounties: 42, 
        tenure: 128, 
        gearRented: 24, 
        badges: ['shield', 'target'],
        bio: "Mechanical beauty operative. Specialists in exotic gear procurement."
    },
    'ROYBATTY': { 
        reliability: 99.9, 
        bounties: 312, 
        tenure: 850, 
        gearRented: 4, 
        badges: ['zap', 'target', 'award'],
        bio: "Combat model. Seen things you people wouldn't believe."
    },
    'LUV': { 
        reliability: 97.5, 
        bounties: 88, 
        tenure: 210, 
        gearRented: 56, 
        badges: ['shield', 'zap'],
        bio: "Top-tier blade operative. The best for the best."
    },
    'JOI': { 
        reliability: 91.2, 
        bounties: 15, 
        tenure: 65, 
        gearRented: 0, 
        badges: ['shield'],
        bio: "Digital companion interface. Node analytics specialist."
    }
};

/**
 * High-fidelity Public Profile Modal for viewing other operatives in the ecosystem.
 * Enhanced with Gemini 2.5 Flash Image for Dossier Image Editing and unique data engine.
 */
const PublicProfileModal = ({ user, tier, onClose }: { user: { name: string; id: string }, tier: string, onClose: () => void }) => {
    const [dossierImage, setDossierImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isHyped, setIsHyped] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

    // Get unique data for this user
    const intel = (() => {
        const key = user.name.replace('@', '').toUpperCase();
        if (OPERATIVE_INTEL[key]) return OPERATIVE_INTEL[key];
        
        // Deterministic fallback based on ID hash
        const hash = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
            reliability: 75 + (hash % 20) + (hash % 10) / 10,
            bounties: (hash % 40) + 5,
            tenure: (hash % 150) + 12,
            gearRented: (hash % 30),
            badges: ['shield', 'zap', 'target', 'award'].filter((_, i) => (hash >> i) & 1)
        };
    })();

    const badges = [
        { id: 'shield', icon: Shield, label: 'GUARDIAN', color: '#00E5FF', desc: 'PROTECTED 5+ NODES', earned: intel.badges.includes('shield') },
        { id: 'zap', icon: Zap, label: 'OVERDRIVE', color: '#CCFF00', desc: '30 DAY MINING STREAK', earned: intel.badges.includes('zap') },
        { id: 'target', icon: Target, label: 'DEADSHOT', color: '#FF3333', desc: '10 URGENT BOUNTIES', earned: intel.badges.includes('target') },
        { id: 'award', icon: Trophy, label: 'VETERAN', color: '#FFD700', desc: '100+ DAYS IN HUB', earned: intel.badges.includes('award') }
    ];

    // Trigger initial dossier visualization on mount
    useEffect(() => {
        handleNeuralOverride(`A high-fidelity retro-futuristic tactical avatar for a college student operative named ${user.name}, wearing ${intel.bounties > 50 ? 'heavy military techwear' : 'light neon streetwear'}, neon cyan accents, dark industrial background, sharp vector art, professional dossier photo.`);
    }, []);

    const handleNeuralOverride = async (overridePrompt: string) => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const contents: any = {
                parts: [{ text: overridePrompt }]
            };

            // If an image already exists, include it for a localized edit
            if (dossierImage) {
                const base64Data = dossierImage.split(',')[1];
                contents.parts.unshift({
                    inlineData: {
                        data: base64Data,
                        mimeType: 'image/png'
                    }
                });
                contents.parts[1].text = `Apply this visual override to the existing image: "${overridePrompt}". Maintain operative identity but transform style or surroundings. Return ONLY the edited image bytes.`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: contents
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    setDossierImage(`data:image/png;base64,${part.inlineData.data}`);
                    break;
                }
            }
        } catch (error) {
            console.error("Dossier override failed:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleHypeUp = () => {
        if (isHyped) return;
        setIsHyped(true);
        // Reset hype after 2 seconds
        setTimeout(() => setIsHyped(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[9500] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300 font-raj text-white">
            <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-zinc-900 rounded-[3rem] p-10 shadow-[0_0_120px_rgba(0,229,255,0.15)] relative overflow-hidden flex flex-col">
                {/* Visual Decorative Accents */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-50"></div>
                <div className="absolute top-10 right-[-20px] opacity-5 pointer-events-none rotate-12">
                    <ShieldCheck size={200} className="text-[#00E5FF]" />
                </div>
                
                <button onClick={onClose} className="absolute top-8 right-8 text-zinc-700 hover:text-white transition-all active:scale-90 z-20">
                    <X size={28} />
                </button>

                <div className="mb-8">
                    <div className="text-[#00E5FF] font-black text-[9px] tracking-[0.5em] uppercase italic mb-1">NODE_DOSSIER</div>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-zinc-900 border-2 border-zinc-800 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
                            {dossierImage ? (
                                <img src={dossierImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Dossier" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/10 to-transparent opacity-30"></div>
                            )}
                            
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                                    <Loader2 size={24} className="text-[#00E5FF] animate-spin" />
                                </div>
                            )}
                            
                            {!dossierImage && !isProcessing && (
                                <span className="text-white font-black text-4xl italic z-10">{user.name.replace('@', '')[0].toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-white font-black text-2xl uppercase tracking-tighter italic leading-none mb-1.5">{user.name}</h2>
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-0.5 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded text-[8px] font-black text-[#00E5FF] tracking-widest uppercase">OPERATIVE_ID: {user.id}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#111] border border-zinc-900 p-4 rounded-2xl">
                        <div className="text-zinc-600 font-bold text-[8px] tracking-widest uppercase mb-1 italic flex items-center gap-1.5"><Activity size={10} /> RELIABILITY</div>
                        <div className={`font-data font-black text-lg ${intel.reliability > 90 ? 'text-[#00FF41]' : intel.reliability > 80 ? 'text-[#CCFF00]' : 'text-orange-500'}`}>
                            {intel.reliability}%
                        </div>
                    </div>
                    <div className="bg-[#111] border border-zinc-900 p-4 rounded-2xl">
                        <div className="text-zinc-600 font-bold text-[8px] tracking-widest uppercase mb-1 italic flex items-center gap-1.5"><BoneIcon size={10} /> BONE_TIER</div>
                        <div className="text-[#FFD700] font-data font-black text-lg uppercase">{tier}</div>
                    </div>
                </div>

                {/* Badges of Honor Section */}
                <div className="mb-8 space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <div className="text-zinc-500 font-bold text-[9px] tracking-[0.3em] uppercase italic flex items-center gap-2">
                            <Award size={10} className="text-[#FFD700]" /> BADGES_OF_HONOR
                        </div>
                        {selectedBadge && (
                            <div className="text-[#00E5FF] font-data text-[7px] tracking-widest uppercase animate-in fade-in slide-in-from-right-1 duration-200">
                                {badges.find(b => b.id === selectedBadge)?.desc || ''}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {badges.map((badge) => (
                            <button 
                                key={badge.id}
                                onClick={() => setSelectedBadge(selectedBadge === badge.id ? null : badge.id)}
                                className={`bg-[#111] border rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                                    selectedBadge === badge.id 
                                        ? 'border-[#00E5FF] bg-[#00E5FF]/5 shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
                                        : badge.earned 
                                            ? 'border-zinc-800 hover:border-zinc-700' 
                                            : 'border-zinc-900/50 opacity-20 grayscale'
                                }`}
                            >
                                <badge.icon size={20} style={{ color: selectedBadge === badge.id ? '#00E5FF' : badge.earned ? badge.color : '#444' }} className={selectedBadge === badge.id ? 'animate-bounce' : ''} />
                                <span className={`text-[7px] font-black tracking-widest ${selectedBadge === badge.id ? 'text-[#00E5FF]' : badge.earned ? 'text-zinc-600' : 'text-zinc-800'}`}>{badge.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between px-1">
                        <div className="text-zinc-500 font-bold text-[9px] tracking-[0.3em] uppercase italic">OPERATIONAL_DATA</div>
                        <Fingerprint size={12} className="text-zinc-800" />
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center text-zinc-400 font-inter text-xs">
                            <span className="opacity-60">BOUNTIES</span>
                            <span className="font-data font-bold text-white">{intel.bounties}</span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-400 font-inter text-xs">
                            <span className="opacity-60">HUB_TENURE</span>
                            <span className="font-data font-bold text-white">{intel.tenure}D</span>
                        </div>
                        <div className="flex flex-col gap-1 text-zinc-400 font-inter text-xs">
                            <div className="flex justify-between items-center">
                                <span className="opacity-60">GEAR RENTED</span>
                                <span className="font-data font-bold text-[#00E5FF]">{intel.gearRented}</span>
                            </div>
                            <div className="text-[8px] opacity-40 uppercase tracking-widest italic leading-none">
                                (HOW MANY TIMES PEOPLE HAVE USED THIS PERSON'S GEAR)
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handleHypeUp}
                        className={`flex-1 border py-4 rounded-xl font-raj font-black text-[11px] tracking-widest uppercase active:scale-95 transition-all flex items-center justify-center gap-2 ${
                            isHyped 
                            ? 'bg-[#CCFF00] border-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.4)]' 
                            : 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700'
                        }`}
                    >
                        {isHyped ? <Zap size={14} fill="currentColor" /> : null}
                        {isHyped ? 'HYPED!!' : 'HYPE_UP'}
                    </button>
                    <button onClick={onClose} className="flex-1 bg-[#00E5FF] text-black py-4 rounded-xl font-raj font-black text-[11px] tracking-widest uppercase active:scale-95 transition-all shadow-lg shadow-[#00E5FF]/20">
                        CLOSE_DOSSIER
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <span className="text-zinc-800 font-data text-[7px] tracking-[0.4em] uppercase">GSD_OS // NEURAL_ENCRYPTED_UPLINK_0x77</span>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [viewedProfileUser, setViewedProfileUser] = useState<{ name: string; id: string } | null>(null);
    const [state, setState] = useState<AppState>({
        isLoggedIn: false,
        isLoading: false,
        loginMode: 'SIGN_IN',
        activeBottomTab: 'HOME',
        notificationToast: null,
        notifications: [
            { id: 'notif-bounty', title: 'MISSION_TIMEOUT', message: 'CS-101 Analysis deadline in T-2H. Submit work bytes now to secure reward.', timestamp: new Date().toISOString(), isRead: false, type: 'ALERT' },
            { id: 'notif-stock', title: 'GEAR_YIELD_SYNC', message: 'Your DSLR kit has been returned by @Deckard. +450 Bones pending settlement.', timestamp: new Date().toISOString(), isRead: false, type: 'SUCCESS' },
            { id: 'notif-request', title: 'REQUEST_UPLINK', message: '@Neo_77 has countered your Hydraulic Arm request. Review terms in Requests.', timestamp: new Date().toISOString(), isRead: false, type: 'INFO' },
            { id: 'notif-order', title: 'MARKET_LOGISTICS', message: 'Multimeter Kit is 2 sectors away. Prepare for physical hand-off.', timestamp: new Date().toISOString(), isRead: false, type: 'INFO' },
            { id: 'notif-posts', title: 'BOUNTY_RECRUITMENT', message: '3 new applicants for "Unity 3D Model". Review dossiers and deploy contract.', timestamp: new Date().toISOString(), isRead: false, type: 'SUCCESS' },
            { id: 'initial-pot', title: 'MONEY_POT_ALERT', message: 'Late Night Maggi Run requires settlement (₹75).', timestamp: new Date().toISOString(), isRead: false, type: 'ALERT' },
            { id: 'initial-invoice', title: 'LEDGER_ALERT', message: 'Overdue Radius Protocol insurance fee (₹25). Settle to avoid trust decay.', timestamp: new Date().toISOString(), isRead: false, type: 'ALERT' }
        ],
        settings: {
            notifications: true,
            haptics: false,
            darkMode: true,
            analyticsEnabled: true,
            currency: 'INR'
        },
        home: {
            isOnboarding: true,
            boneBalance: 1680,
            tier: 'SKULL TIER',
            isVaultOpen: false,
            isStreakModalOpen: false,
            isPremiumModalOpen: false,
            isNotificationsOpen: false,
            isSupportOpen: false,
            isSettingsOpen: false,
            isTicketModalOpen: false,
            isAddTaskModalOpen: false,
            isAccountModalOpen: false,
            isPurchaseSuccess: false,
            activeUnlockItem: null,
            attachedFile: null,
            rewards: [
                { id: 1, title: 'Amazon Pay', value: 'Voucher: ₹250', cost: 500, icon: 'inventory_2', color: '#FF9900' },
                { id: 2, title: 'Steam Wallet', value: 'Voucher: ₹500', cost: 1000, icon: 'sports_esports', color: '#9D00FF' },
                { id: 6, title: 'Neural Overdrive', value: '2x Bone Boost (24h)', cost: 1200, icon: 'zap', color: '#CCFF00' },
                { id: 3, title: 'Xbox Ultimate', value: 'Game Pass: 1M', cost: 1000, icon: 'close', color: '#00E5FF', isXbox: true },
                { id: 7, title: 'Apex Badge', value: 'Prestige Profile Badge', cost: 2500, icon: 'award', color: '#FFD700' },
                { id: 4, title: 'PVR Cinemas', value: 'Tickets: 2 pax', cost: 1000, icon: 'local_activity', color: '#FF0055' },
                { id: 8, title: 'Cyber Frame', value: 'Digital Avatar Trim', cost: 800, icon: 'frame', color: '#00E5FF' },
                { id: 5, title: 'Hub Credit', value: 'Credit: ₹250', cost: 500, icon: 'skull', color: '#FFFFFF' }
            ],
            tasks: [
                { id: '1', text: 'Initialize Gear Protocol', completed: true },
                { id: '2', text: 'Secure Radius Clearance', completed: false }
            ],
            streak: { 
                currentStreak: 0, 
                lastCheckInDate: '', 
                streakFreezeInventory: 1,
                status: 'AT RISK', 
                rewards: ['20 Bone Bonus', 'Exclusive Badge'] 
            }
        },
        leaderboard: {
            rankings: [
                { rank: 1, name: 'K', tier: 'Skull', score: 1680, trend: 'flat' },
                { rank: 2, name: 'Luv', tier: 'Skull', score: 1595, trend: 'up' },
                { rank: 3, name: 'Deckard', tier: 'Femur', score: 1450, trend: 'down' },
                { rank: 4, name: 'Joi', tier: 'Femur', score: 1320, trend: 'up' },
                { rank: 5, name: 'Wallace', tier: 'Radius', score: 1100, trend: 'flat' },
            ]
        },
        hub: {
            activeCategory: 'GEAR',
            activeMode: 'RENTALS',
            activeRentalSubTab: 'HUB_CUSTODY',
            activeMarketSubTab: 'MARKET',
            activeBountySubTab: 'BROWSE',
            bountyFilters: {
                category: 'ALL',
                tag: 'ALL',
                rewardMin: 0
            },
            bountySortOrder: 'DATE_DESC',
            isRentalModalOpen: false,
            isStockModalOpen: false,
            isMarketStockModalOpen: false,
            isListingModalOpen: false,
            isOffersModalOpen: false,
            isMarketPurchaseModalOpen: false,
            isEditAssetModalOpen: false,
            isListAssetModalOpen: false,
            isUploadRequestModalOpen: false,
            selectedRentalItem: null,
            selectedStockItem: null,
            selectedMarketStockItem: null,
            selectedBountyForOffers: null,
            rentalCheckbox: false,
            items: [
                { id: '4030', name: 'SYSTEM_UNIT_X-01', rate: 40, verified: true },
                { id: '4031', name: 'SYSTEM_UNIT_X-02', rate: 40, verified: true },
                { id: '4032', name: 'SYSTEM_UNIT_X-03', rate: 40, verified: true },
                { id: '4033', name: 'SYSTEM_UNIT_X-04', rate: 40, verified: true },
            ],
            rentalData: {
                my_rentals: [
                    { id: 'R-9012', name: 'HYDRAULIC_ARM_MK-IV', status: 'ACTIVE', cost: 25, time: '4h 30m Left' },
                    { id: 'R-9015', name: 'DATA_CORE_PROCESSOR_Z-9', status: 'ACTIVE', cost: 50, time: '2h 15m Left' },
                    { id: 'R-9018', name: 'POWER_CELL_ARRAY_T-3', status: 'OVERDUE', cost: 15, time: '-1h 00m' }
                ],
                procure: [
                    { id: 'P-101', name: 'DSLR Camera Kit', owner: '@Deckard', rate: 150, imageColor: '#FF9900', icon: 'Camera', status: 'AVAILABLE' },
                    { id: 'P-102', name: 'Mini Drafter', owner: '@K_Officer', rate: 300, imageColor: '#00E5FF', icon: 'Plane', status: 'AVAILABLE' },
                    { id: 'P-104', name: 'RTX 4090 Gaming Rig', owner: '@Roy_7', rate: 500, imageColor: '#9D00FF', icon: 'Cpu', status: 'DEPLOYED', eta: '4H' },
                    { id: 'P-105', name: 'TI-84 Graphing Calc', owner: '@Deckard', rate: 50, imageColor: '#CCFF00', icon: 'Calculator', status: 'AVAILABLE' },
                    { id: 'P-106', name: 'Bose QC45 Headphones', owner: '@Joi', rate: 120, imageColor: '#00E5FF', icon: 'Headphones', status: 'DEPLOYED', eta: '1H' },
                    { id: 'P-107', name: 'Electric Scooter Mk.II', owner: '@Luv', rate: 180, imageColor: '#FF3333', icon: 'Zap', status: 'AVAILABLE' },
                    { id: 'P-108', name: 'iPad Pro + Pencil', owner: '@Zhora', rate: 250, imageColor: '#FFD700', icon: 'Smartphone', status: 'DEPLOYED', eta: '2D' },
                    { id: 'P-109', name: 'Arduino Master Kit', owner: '@Deckard', rate: 70, imageColor: '#FF9900', icon: 'Cpu', status: 'AVAILABLE' },
                    { id: 'P-110', name: 'Portable 4K Projector', owner: '@Wallace', rate: 400, imageColor: '#00E5FF', icon: 'MonitorPlay', status: 'AVAILABLE' },
                    { id: 'P-103', name: 'Lab Coat (Tactical)', owner: '@Wallace_Corp', rate: 75, imageColor: '#9D00FF', icon: 'Accessibility', status: 'AVAILABLE' }
                ],
                my_stock: [
                    { id: 'ST-101', name: 'Thermal Optics Gen-2', status: 'RENTED', earnings: 1200, user: '@Ghost_7', rate: 40 },
                    { id: 'ST-102', name: 'Portable Fusion Cell', status: 'LISTED', earnings: 450, user: '-', rate: 15 },
                    { id: 'ST-103', name: 'Raw Cobalt Ore (2kg)', status: 'IDLE', earnings: 0, user: '-', rate: 10 },
                    { id: 'ST-106', name: 'High-Speed Router Mk.II', status: 'IDLE', earnings: 150, user: '-', rate: 25 },
                    { id: 'ST-107', name: 'GSD Tactical Hood', status: 'LISTED', earnings: 890, user: '-', rate: 20 },
                    { id: 'ST-108', name: 'Graphics Tablet (Pro)', status: 'RENTED', earnings: 2100, user: '@Designer_K', rate: 60 }
                ],
                hub_custody: [
                    { id: 'C-808', name: 'Precision Engineering Graphics Set', status: 'VERIFICATION', time: '12h 00m' },
                    { id: 'C-809', name: 'TI-84 Plus Graphing Calculator', status: 'IN_TRANSIT', time: '45m' },
                    { id: 'C-810', name: 'Arduino Mega Robotics Kit', status: 'SECURED', time: '2d 4h' },
                    { id: 'C-811', name: 'High-Fidelity ANC Headphones', status: 'LOCKED', time: 'HOLD' },
                    { id: 'C-812', name: 'Standard Grade Lab Coat', status: 'RELEASED', time: 'COMPLETE' }
                ],
                requests: [
                    { id: 'RQ-22', item: 'Hydraulic Arm MK-IV', user: '@Neo_77', offer: '25/hr', tracking: '4.9' },
                    { id: 'RQ-24', item: 'Thermal Optics Gen-2', user: '@BountyHunter', offer: '45/hr', tracking: '4.8' },
                    { id: 'RQ-25', item: 'Portable Fusion Cell', user: '@Researcher_Z', offer: '20/hr', tracking: '4.9' }
                ]
            },
            marketData: {
                items: [
                    { id: 'M-101', name: 'Casio FX-991EX Calculator', condition: 'LIKE NEW', price: 800, imageColor: '#2A2A2A', icon: 'Calculator' },
                    { id: 'M-102', name: 'Mechanical Keyboard (Red Switch)', condition: 'USED - GOOD', price: 1200, imageColor: '#3D3D3D', icon: 'Keyboard' },
                    { id: 'M-103', name: 'Drafter & Sheet Holder', condition: 'USED - DECENT', price: 450, imageColor: '#1F1F1F', icon: 'Package' },
                    { id: 'M-104', name: 'Casio Scientific Calc', condition: 'NEW', price: 1500, imageColor: '#252525', icon: 'Calculator' }
                ],
                myStockItems: [
                    { id: 'MS-101', name: 'Engineering Graphics Set (Pro)', condition: 'USED - GOOD', price: 650, imageColor: '#2A2A2A', icon: 'Package', status: 'ACTIVE' },
                    { id: 'MS-102', name: 'Scientific Drafter Mk-II', condition: 'LIKE NEW', price: 400, imageColor: '#1F1F1F', icon: 'Package', status: 'SOLD' }
                ],
                orders: [
                    { id: 'ORD-5541', name: 'Lab Coat (White)', price: 450, status: 'DELIVERED', seller: '@Deckard', arrival: 'Delivered' },
                    { id: 'ORD-5542', name: 'Multimeter Kit', price: 1100, status: 'IN TRANSIT', seller: '@Joi_9', arrival: 'Est: 2h' }
                ]
            },
            bountyData: {
                feed: [
                    { id: 'B-01', title: 'Data Structures HW', creator: '@Deckard', estimate: '4 HOURS', reward: 600, tags: ['DSA', 'C++'], category: 'WRITTEN_WORK', description: 'Implementation of balanced BSTs and Hash Maps. Requires complexity analysis for all operations and a brief report on collision resolution.', postedAtTimestamp: Date.now() - 3600000, deadlineTimestamp: Date.now() + 86400000, status: 'OPEN' },
                    { id: 'B-02', title: 'Draw Anatomy Diagram', creator: '@Zhora', estimate: '2 HOURS', reward: 900, tags: ['BIOLOGY', 'ART'], category: 'PROJECT_WORK', description: 'High-fidelity sketch of the cardiovascular system. Must be labeled accurately for Bio-101 lab submission. Digital or physical scan acceptable.', postedAtTimestamp: Date.now() - 7200000, deadlineTimestamp: Date.now() + 3600000, status: 'OPEN' },
                    { id: 'B-03', title: 'Write Assignment (CS-101)', creator: '@RoyBatty', estimate: '3 HOURS', reward: 300, tags: ['THEORY', 'WRITING'], category: 'WRITTEN_WORK', description: '3000-word analysis on the impact of neural networks in autonomous vehicles. Must include APA citations and reference the latest benchmark datasets.', postedAtTimestamp: Date.now() - 100000, deadlineTimestamp: Date.now() + 43200000, status: 'OPEN' },
                    { id: 'B-04', title: 'Thermodynamics Tutoring', creator: '@Luv', estimate: '1 HOUR', reward: 1200, tags: ['EE', 'PHYSICS'], category: 'GUIDANCE', description: '1-on-1 session covering entropy and the second law of thermodynamics. Help required to prepare for tomorrow morning\'s mid-term uplink.', postedAtTimestamp: Date.now() - 86400000, deadlineTimestamp: Date.now() + 2000000, status: 'OPEN' },
                    { id: 'B-05', title: 'Arduino Setup Debug', creator: '@Deckard', estimate: '1 HOUR', reward: 450, tags: ['PROJECT', 'EE'], category: 'PROJECT_WORK', description: 'Troubleshooting I2C communication between a sensor array and master controller. Signal noise issues detected when powering via USB. Need stable relay.', postedAtTimestamp: Date.now() - 2000000, deadlineTimestamp: Date.now() + 172800000, status: 'OPEN' }
                ],
                accepted: [
                    { id: 'B-99', title: 'Circuit Analysis Lab Report', creator: '@Pris', estimate: '5 HOURS', reward: 1200, tags: ['EE', 'REPORT'], category: 'WRITTEN_WORK', description: 'Complete analysis of RLC circuits under transient conditions. Requires MATLAB plots and nodal analysis verification.', postedAtTimestamp: Date.now(), deadlineTimestamp: Date.now() + (5 * 60 * 60 * 1000), postedAt: 'ACTIVE MISSION', status: 'OPEN' },
                    { id: 'B-LATE', title: 'Late Mission Simulation', creator: '@Deckard', estimate: '2 HOURS', reward: 400, tags: ['URGENT', 'LATE'], category: 'OTHER', description: 'Simulation task to test protocol breach detection systems. Submit a zero-byte file to trigger trust degradation protocol.', postedAtTimestamp: Date.now() - 86400000, deadlineTimestamp: Date.now() - 3600000, status: 'OPEN' }
                ],
                my_posts: [
                    { 
                        id: 'MB-01', 
                        title: 'Need Physics Tutor (Ch 4-5)', 
                        creator: '@Me', 
                        estimate: '1 HOUR', 
                        reward: 500, 
                        tags: ['PHYSICS'], 
                        category: 'GUIDANCE',
                        description: 'Help mastering kinematics and projectile motion for the upcoming quiz. Top floor cafe session preferred.',
                        postedAtTimestamp: Date.now() - 7200000,
                        postedAt: '2 HOURS AGO', 
                        applicantsCount: 3, 
                        isHourly: true,
                        status: 'OPEN',
                        offers: [
                            { id: 'O-3', user: '@Newton_Fan', rating: '100%', message: 'I will guide you through all Chapter 4-5 problems step-by-step. Top student in PHY-102.' },
                            { id: 'O-4', user: '@Maxwell_Demon', rating: '95%', message: 'I can help with the lab components too. Available after 6 PM today.' },
                            { id: 'O-5', user: '@Schrodinger', rating: '88%', bid: 550, message: 'Fast track session. 45 mins total. 550 bones is my counter offer.' }
                        ]
                    },
                    { 
                        id: 'MB-02', 
                        title: '3D Model for Unity Game', 
                        creator: '@Me', 
                        estimate: 'VARIABLE', 
                        reward: 1500, 
                        tags: ['UNITY', '3D'], 
                        category: 'PROJECT_WORK',
                        description: 'Low-poly character model for a cyberpunk runner game. Rigging and basic animations (run, jump) required.',
                        postedAtTimestamp: Date.now() - 86400000,
                        postedAt: 'YESTERDAY', 
                        applicantsCount: 2, 
                        isHourly: false,
                        status: 'OPEN',
                        offers: [
                            { id: 'O-6', user: '@Poly_Master', rating: '99%', bid: 1400, message: 'Specialist in low-poly assets. Check my portfolio. I can do it for 1400.' },
                            { id: 'O-7', user: '@Shader_Wizard', rating: '92%', message: 'I can include texture baked versions optimized for mobile Unity. Ready in 24h.' }
                        ]
                    }
                ]
            },
            invoices: [
                { id: 'INV-8821-X', target: '@Deckard', amount: 150, status: 'PAID', date: 'OCT 12, 2023', category: 'GEAR', description: 'DSLR Camera Rental // 1hr' },
                { id: 'INV-8840-Z', target: '@GSD_CORE', amount: 25, status: 'OVERDUE', date: 'OCT 14, 2023', category: 'SYSTEM', description: 'Radius Protocol Insurance Fee' },
                { id: 'INV-8902-A', target: '@Pris', amount: 1200, status: 'PENDING', date: 'OCT 15, 2023', category: 'BOUNTY', description: 'Circuit Analysis Settlement' },
                { id: 'INV-8915-K', target: '@Officer_K', amount: 300, status: 'PAID', date: 'OCT 15, 2023', category: 'GEAR', description: 'Drone Unit Deployment' }
            ]
        },
        squad: {
            activeSubTab: 'FIND_SQUADS',
            feed: [
                { 
                    id: 'S-01', 
                    title: 'Deadpool & Wolverine', 
                    host: '@Cinephile_99', 
                    type: 'BILL SPLIT', 
                    description: 'Booking recliner seats. Need 2 more to split the cab + tickets.', 
                    time: 'Tonight, 8:00 PM', 
                    location: 'PVR Plaza', 
                    joined: 2, 
                    total: 4, 
                    iconType: 'FILM',
                    members: ['@Joi', '@Luv']
                },
                { 
                    id: 'S-02', 
                    title: 'Airport Drop (T3)', 
                    host: '@RichieRich', 
                    type: 'HOST PAYS', 
                    description: 'I have a premium cab voucher. Just need company for the ride.', 
                    time: 'Tomorrow, 5:00 AM', 
                    location: 'Main Gate', 
                    joined: 1, 
                    total: 3, 
                    iconType: 'CAR',
                    members: ['@Deckard']
                },
                { 
                    id: 'S-03', 
                    title: 'Late Night Valorant', 
                    host: '@K', 
                    type: 'BILL SPLIT', 
                    description: 'Need a full stack for some ranked games. Red Bull included.', 
                    time: 'Tonight, 11:30 PM', 
                    location: 'Discord Uplink', 
                    joined: 3, 
                    total: 5, 
                    iconType: 'GAME',
                    members: ['@Officer_K', '@Pris', '@Roy']
                }
            ],
            joinedSquadIds: [],
            moneyPots: [
                { title: 'MOVIE NIGHT: DUNE 2', amount: 250, badge: 'EARLY BIRD', color: 'yellow', reward: 25, recipient: '@Deckard', progress: 35 },
                { title: 'LATE NIGHT MAGGI RUN', amount: 75, badge: 'ON TIME', color: 'green', reward: 10, recipient: '@Luv', progress: 65 },
                { title: 'BADMINTON COURT BOOKING', amount: 150, badge: 'LATE PENALTY', color: 'red', reward: 0, recipient: '@Roy Batty', progress: 95 }
            ]
        },
        user: { 
            name: 'K', 
            id: 'K-2049', 
            rank: 'SKULL', 
            trustScore: 98,
            trustHistory: [
                { id: 'T1', date: '2023-10-01', action: 'ID Verification Protocol', change: 15, resultingScore: 65 },
                { id: 'T2', date: '2023-10-05', action: 'Bounty: Lab Report On-Time', change: 5, resultingScore: 70 }
            ],
            lifetimeEarned: 2450,
            currentProgress: 17,
            history: [
                { id: 'H1', type: 'REWARD', amount: 50, description: 'Initial Reward Protocol', timestamp: '2023-10-01 09:00' }
            ],
            bannerImage: null,
            avatarImage: null,
            bio: "Nexus-9 Series bio-engineered operative assigned to LAPD. Specializes in retirement protocols and gear procurement."
        }
    });

    const addNotification = useCallback((title: string, message: string, type: 'INFO' | 'ALERT' | 'SUCCESS' = 'INFO') => {
        setState(s => ({
            ...s,
            notifications: [
                {
                    id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    title,
                    message,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    type
                },
                ...s.notifications
            ]
        }));
    }, []);

    const updateState = useCallback((updater: (prev: AppState) => AppState) => {
        setState(updater);
    }, []);

    const updateTrustScore = useCallback((actionType: 'BOUNTY' | 'MONEY_POT' | 'GEAR' | 'GENERAL', isPositive: boolean, descriptionOverride?: string) => {
        let change = 0;
        let actionDesc = descriptionOverride || '';
        
        if (actionType === 'BOUNTY') {
            change = isPositive ? 5 : -10;
            actionDesc = actionDesc || (isPositive ? 'Bounty Completed On-Time' : 'Bounty Mission Missed');
        } else if (actionType === 'MONEY_POT') {
            change = isPositive ? 8 : -15;
            actionDesc = actionDesc || (isPositive ? 'Money Pot Settled' : 'Money Pot Defaulted');
        } else if (actionType === 'GEAR') {
            change = isPositive ? 10 : -20;
            actionDesc = actionDesc || (isPositive ? 'Gear Returned Secure' : 'Gear Return Breach');
        } else if (actionType === 'GENERAL') {
            change = 15;
            actionDesc = actionDesc || 'ID Verification Protocol';
        }

        updateState(s => {
            const newScore = Math.min(100, Math.max(0, s.user.trustScore + change));
            const newHistory: TrustHistoryEntry = {
                id: `TR-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                action: actionDesc,
                change: change,
                resultingScore: newScore
            };

            return {
                ...s,
                user: {
                    ...s.user,
                    trustScore: newScore,
                    trustHistory: [newHistory, ...s.user.trustHistory]
                }
            };
        });

        // Add contextual notification for Uplink Field
        const categoryLabel = actionType === 'GEAR' ? 'HUB_RELIABILITY' : actionType === 'MONEY_POT' ? 'POT_SETTLEMENT' : 'TRUST_LEDGER';
        addNotification(`${categoryLabel}_UPDATE`, `${actionDesc}: Score shifted by ${isPositive ? '+' : ''}${change}%.`, isPositive ? 'SUCCESS' : 'ALERT');
    }, [updateState, addNotification]);

    const triggerDailyStreak = useCallback(() => {
        updateState(s => {
            if (s.home.streak.currentStreak > 0) return s;
            const rewardBones = 15;
            return {
                ...s,
                home: {
                    ...s.home,
                    boneBalance: s.home.boneBalance + rewardBones,
                    streak: {
                        ...s.home.streak,
                        currentStreak: 1,
                        status: 'ACTIVE'
                    }
                },
                user: {
                    ...s.user,
                    lifetimeEarned: s.user.lifetimeEarned + rewardBones
                }
            };
        });
        addNotification('DAILY_STREAK_SYNC', 'Mining protocol active. 15 Bones harvested.', 'SUCCESS');
    }, [updateState, addNotification]);

    const processTransactionSuccess = useCallback((userId: string, transactionAmount: number, sourceType: string, receiptMeta?: any) => {
        const bonesReward = Math.floor(transactionAmount * 0.10);
        triggerDailyStreak();
        
        updateState(s => {
            const newRecord: TransactionRecord = {
                id: receiptMeta?.transactionId || `TX-${Date.now()}`,
                type: 'SPEND',
                amount: transactionAmount,
                description: sourceType,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };

            const rewardRecord: TransactionRecord = {
                id: `REWARD-${Date.now()}`,
                type: 'REWARD',
                amount: bonesReward,
                description: `10% Reward from ${sourceType}`,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };

            // Also create an invoice entry with receipt metadata
            const newInvoice: HubInvoice = {
                id: receiptMeta?.transactionId || `INV-${Date.now()}`,
                target: receiptMeta?.recipient || "@UPLINK",
                amount: transactionAmount,
                status: 'PAID',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
                category: 'SYSTEM',
                description: sourceType,
                receiptMetadata: receiptMeta
            };

            return {
                ...s,
                home: {
                    ...s.home,
                    boneBalance: s.home.boneBalance + bonesReward - (transactionAmount > 0 ? 0 : 0) // Balance adjustment logic usually handled by caller, but here we track bones
                },
                user: {
                    ...s.user,
                    lifetimeEarned: s.user.lifetimeEarned + bonesReward,
                    history: [rewardRecord, newRecord, ...s.user.history]
                },
                hub: {
                    ...s.hub,
                    invoices: [newInvoice, ...s.hub.invoices]
                },
                notificationToast: bonesReward > 0 ? {
                    visible: true,
                    message: `PROTOCOL_BONUS: ${sourceType}`,
                    amount: bonesReward
                } : null
            };
        });

        // Sync to Uplink Field
        addNotification('TRANSACTION_SECURED', `Protocol settlement complete: ${sourceType}. +${bonesReward} Bones harvested.`, 'SUCCESS');
        return bonesReward;
    }, [updateState, triggerDailyStreak, addNotification]);

    // Unified lifecycle management for notification toast to ensure it clears after 2 seconds
    useEffect(() => {
        if (state.notificationToast?.visible) {
            const timer = setTimeout(() => {
                updateState(s => ({ ...s, notificationToast: null }));
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state.notificationToast?.visible, updateState]);

    if (state.isLoading) return <LoadingView />;
    if (!state.isLoggedIn) return <LoginView state={state} updateState={updateState} />;
    
    // Check for Onboarding status
    if (state.home.isOnboarding) {
        return <OnboardingView state={state} updateState={updateState} />;
    }

    const onViewProfile = (name: string, id: string) => {
        setViewedProfileUser({ name, id });
    };

    const renderContent = () => {
        switch (state.activeBottomTab) {
            case 'HOME': return <HomeView state={state} updateState={updateState} />;
            case 'HUB': return <HubView state={state} updateState={updateState} processTransactionSuccess={processTransactionSuccess} updateTrustScore={updateTrustScore} onViewProfile={onViewProfile} />;
            case 'LEADERBOARD': return <LeaderboardView state={state} />;
            case 'SQUAD': return <SquadView state={state} updateState={updateState} processTransactionSuccess={processTransactionSuccess} updateTrustScore={updateTrustScore} />;
            case 'PROFILE': return <IDView state={state} updateState={updateState} updateTrustScore={updateTrustScore} />;
            default: return <HomeView state={state} updateState={updateState} />;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-black text-white font-raj overflow-hidden">
            {state.notificationToast && state.notificationToast.visible && (
                <div className="fixed bottom-24 right-5 z-[9999] bg-[#1A1A1A] border border-[#CCFF00] text-white px-5 py-4 rounded-xl font-bold flex flex-col gap-1 animate-in fade-in slide-in-from-right-4 duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.8)] min-w-[180px]">
                    <div className="flex items-center gap-2 text-[#CCFF00]">
                       <CheckCircle2 size={16} />
                       <span className="text-sm font-raj tracking-widest uppercase italic">SYNCED!</span>
                    </div>
                    <span className="text-xl font-raj tracking-tight">+{state.notificationToast.amount} Bones</span>
                </div>
            )}

            {viewedProfileUser && (
                <PublicProfileModal 
                    user={viewedProfileUser} 
                    tier={state.leaderboard.rankings.find(r => r.name === viewedProfileUser.name.replace('@', ''))?.tier || "SKULL"}
                    onClose={() => setViewedProfileUser(null)} 
                />
            )}
            
            <main className="flex-1 overflow-hidden relative">
                {renderContent()}
            </main>

            <nav className="h-20 bg-[#080808] border-t border-[#1A1A1A] flex items-center justify-around px-2 z-50">
                {(['HOME', 'HUB', 'LEADERBOARD', 'SQUAD', 'PROFILE'] as BottomTab[]).map((tab) => {
                    const isActive = state.activeBottomTab === tab;
                    const Icon = tab === 'HOME' ? Home : 
                                 tab === 'HUB' ? LayoutGrid : 
                                 tab === 'LEADERBOARD' ? Trophy : 
                                 tab === 'SQUAD' ? Users : UserCircle;
                    return (
                        <button
                            key={tab}
                            onClick={() => updateState(s => ({ ...s, activeBottomTab: tab }))}
                            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 w-16 h-16 rounded-2xl ${isActive ? 'text-[#CCFF00]' : 'text-zinc-600'}`}
                        >
                            <Icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]' : ''} />
                            <span className="text-[9px] font-bold tracking-[0.1em]">{tab}</span>
                            {isActive && <div className="w-1 h-1 bg-[#CCFF00] rounded-full mt-0.5 shadow-[0_0_5px_#CCFF00]"></div>}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default App;
