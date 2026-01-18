import React, { useEffect, useState, useRef } from 'react';
import { 
    Search, Filter, Camera, Plane, Accessibility, FolderX, 
    Package, CheckCircle, Settings, AlertTriangle, Check, 
    Shield, Eye, Plus, ShoppingBag, Calculator, Keyboard, Coins,
    ChevronRight, Users, Target, Clock, Terminal, Upload, CheckCircle2,
    Star, MessageSquare, IndianRupee, Hash, Zap, Loader2, ShoppingCart, Truck,
    Lock, ShieldAlert, Receipt, ArrowUpRight, X, Bone, Inbox, UserCheck, Trash2, ArrowUpDown,
    Map as MapIcon, Navigation, LocateFixed, Wifi, Satellite, AlertOctagon, Info, ZapOff, Activity, SlidersHorizontal, Calendar, QrCode, Image as ImageIcon,
    RefreshCw, Power, Edit3, Save, Wand2, FileText, Sparkles, CloudUpload, TrendingUp, TrendingDown, ChevronLeft, Ghost, Coffee, Gavel, Send, ShieldCheck, Globe, Zap as ZapIcon,
    FileSearch, Database, ListChecks, Fingerprint, RotateCcw, Info as InfoIcon, Minus, Plus as PlusIcon,
    AlertCircle, ShieldAlert as ShieldIcon, CreditCard, Filter as FilterIcon, RotateCcw as ResetIcon,
    Smartphone, ShieldQuestion, UserSearch, Timer, Hand, Scan, Headphones, MonitorPlay, StarHalf, Cpu
} from 'lucide-react';
import L from 'leaflet';
import { 
    AppState, HubRentalSubTab, HubMarketSubTab, HubBountySubTab,
    HubRentalItem, HubMarketItem, HubBounty, HubOffer, TransactionRecord, HubMarketOrder,
    HubProcureItem, HubInvoice, HubInvoice as HubInvoiceType, HubCustodyItem, BountyCategory, BountySortOrder, HubStockItem, HubRequestItem, Currency
} from '../types';
import SettlementGatewayModal from './SettlementGatewayModal';
import GPaySheet from './GPaySheet';
import { GoogleGenAI } from "@google/genai";

/**
 * Tactical Registry of Operative Trust Scores.
 * Each node is assigned a unique reliability index.
 */
const OWNER_TRUST_REGISTRY: Record<string, number> = {
    '@Joi': 99.4,
    '@Deckard': 98.7,
    '@Luv': 95.2,
    '@K_Officer': 92.5,
    '@Wallace': 90.1,
    '@BountyHunter': 89.4,
    '@Zhora': 88.2,
    '@Roy_7': 85.6,
    '@Neo_77': 82.3,
    '@Wallace_Corp': 76.8,
    '@Researcher_Z': 84.1,
    '@Ghost_7': 91.8,
    '@Designer_K': 93.4
};

interface HubViewProps {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
    processTransactionSuccess: (userId: string, transactionAmount: number, sourceType: string, receiptMeta?: any) => number | undefined;
    updateTrustScore?: (actionType: 'BOUNTY' | 'MONEY_POT' | 'GEAR' | 'GENERAL', isPositive: boolean, descriptionOverride?: string) => void;
    onViewProfile?: (name: string, id: string) => void;
}

type MarketSortOrder = 'PRICE_ASC' | 'PRICE_DESC' | 'NAME_ASC';

const UserAvatar = ({ name, size = 'sm', className = "" }: { name: string, size?: 'xs' | 'sm' | 'md' | 'lg', className?: string }) => {
    const initials = name.replace('@', '').substring(0, 1).toUpperCase();
    const sizeClasses = {
        xs: 'w-5 h-5 text-[8px]',
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-[12px]',
        lg: 'w-10 h-10 text-[16px]'
    };
    
    return (
        <div className={`${sizeClasses[size]} rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 font-raj font-black italic shadow-inner shrink-0 ${className}`}>
            {initials}
        </div>
    );
};

const TacticalMapModal = ({ isOpen, onClose, itemName, itemStatus }: { isOpen: boolean, onClose: () => void, itemName: string, itemStatus: string }) => {
    const CAMPUS_CENTER: [number, number] = [28.5450, 77.1926];
    const GEOFENCE_RADIUS_METERS = 500; 

    const [coords, setCoords] = useState<[number, number]>([28.5452, 77.1930]);
    const [distance, setDistance] = useState(0);
    const [signalStrength, setSignalStrength] = useState(94);
    const [outOfBounds, setOutOfBounds] = useState(false);
    const [isFollowing, setIsFollowing] = useState(true);

    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const assetMarker = useRef<L.Marker | null>(null);
    const geofenceCircle = useRef<L.Circle | null>(null);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; 
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) +
                  Math.sin(Δφ/2) * Math.sin(Δφ/2);
        const c = Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; 
    };

    const recenterMap = () => {
        setIsFollowing(true);
        if (leafletMap.current) {
            leafletMap.current.setView(coords, 18, { animate: true });
        }
    };

    // Follow logic effect
    useEffect(() => {
        if (isFollowing && leafletMap.current && isOpen) {
            leafletMap.current.panTo(coords, { animate: true });
        }
    }, [coords, isFollowing, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        
        const interval = setInterval(() => {
            setCoords(prev => {
                const movementFactor = Math.random() > 0.8 ? 0.00012 : 0.00003;
                const newCoords: [number, number] = [
                    prev[0] + (Math.random() - 0.5) * movementFactor,
                    prev[1] + (Math.random() - 0.5) * movementFactor
                ];
                const dist = calculateDistance(CAMPUS_CENTER[0], CAMPUS_CENTER[1], newCoords[0], newCoords[1]);
                setDistance(dist);
                setOutOfBounds(dist > GEOFENCE_RADIUS_METERS);
                return newCoords;
            });
            setSignalStrength(prev => Math.max(82, Math.min(99, prev + (Math.random() - 0.5) * 3)));
        }, 3000);
        
        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !mapRef.current) return;

        if (!leafletMap.current) {
            leafletMap.current = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false,
            }).setView(CAMPUS_CENTER, 17);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 20
            }).addTo(leafletMap.current);

            // Break follow mode on manual drag
            leafletMap.current.on('dragstart', () => {
                setIsFollowing(false);
            });

            const hubIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="w-6 h-6 rounded-full bg-[#00f3ff]/20 border-2 border-[#00f3ff] flex items-center justify-center shadow-[0_0_10px_#00f3ff]">
                         <div class="w-1.5 h-1.5 bg-[#00f3ff] rounded-full"></div>
                       </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            L.marker(CAMPUS_CENTER, { icon: hubIcon }).addTo(leafletMap.current);

            geofenceCircle.current = L.circle(CAMPUS_CENTER, {
                radius: GEOFENCE_RADIUS_METERS,
                color: '#CCFF00',
                weight: 1,
                fillColor: '#CCFF00',
                fillOpacity: 0.02,
                dashArray: '4, 8'
            }).addTo(leafletMap.current);

            const assetIcon = L.divIcon({
                className: 'asset-div-icon',
                html: `<div class="asset-reticle w-10 h-10 flex items-center justify-center">
                         <div class="absolute w-full h-full border border-dashed border-[#ff006e]/40 rounded-full animate-spin"></div>
                         <div class="w-3 h-3 bg-[#ff006e] rounded-full shadow-[0_0_15px_#ff006e]"></div>
                       </div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            assetMarker.current = L.marker(coords, { icon: assetIcon }).addTo(leafletMap.current);
        }

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
                assetMarker.current = null;
                geofenceCircle.current = null;
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (assetMarker.current) {
            assetMarker.current.setLatLng(coords);
        }
        if (geofenceCircle.current) {
            geofenceCircle.current.setStyle({
                color: outOfBounds ? '#ff003c' : '#CCFF00',
                fillColor: outOfBounds ? '#ff003c' : '#CCFF00',
            });
        }
    }, [coords, outOfBounds]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[8500] bg-black overflow-hidden animate-in fade-in duration-300 select-none flex flex-col font-raj">
            {/* HUD HEADER */}
            <div className={`p-4 border-b border-white/5 flex justify-between items-center transition-all duration-500 z-[110] ${outOfBounds ? 'bg-[#ff003c]/20 backdrop-blur-3xl border-[#ff003c]/40' : 'bg-black/90 backdrop-blur-2xl'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-0.5 h-8 transition-all duration-500 rounded-full ${outOfBounds ? 'bg-[#ff003c] shadow-[0_0_15px_#ff003c]' : 'bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]'}`}></div>
                    <div>
                        <div className={`font-black text-[9px] tracking-[0.4em] uppercase italic transition-colors duration-300 ${outOfBounds ? 'text-[#ff003c]' : 'text-[#00f3ff]'}`}>
                            Tactical Asset Uplink
                        </div>
                        <h2 className="text-white font-bold text-lg uppercase tracking-tight leading-none">{itemName}</h2>
                    </div>
                </div>
                <button onClick={onClose} aria-label="Close Map" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90">
                    <X size={20} />
                </button>
            </div>

            {/* BREACH WARNING - COMPACT */}
            {outOfBounds && (
                <div className="bg-[#ff003c] py-2 px-6 flex items-center justify-center gap-2 z-[105] border-b border-white/20 animate-pulse">
                    <AlertOctagon size={16} className="text-white" />
                    <div className="text-white font-black text-xs tracking-widest uppercase">GEOFENCE_BREACH_DETECTION</div>
                </div>
            )}

            {/* INTERACTIVE MAP COMPONENT */}
            <div className="flex-1 relative overflow-hidden bg-[#050505]">
                <div ref={mapRef} className="w-full h-full z-0" />

                {/* HUD DATA OVERLAYS - ANCHORED TO CORNERS */}
                <div className="absolute top-4 left-4 z-30 pointer-events-none space-y-3">
                    {/* Signal Block */}
                    <div className="glass-panel p-3 rounded-2xl border border-white/5 bg-black/60 backdrop-blur-md min-w-[140px] shadow-2xl">
                        <div className="text-[#00f3ff] font-black text-[8px] tracking-[0.2em] uppercase mb-1.5 flex items-center gap-2">
                            <Satellite size={10} /> SIGNAL_LOCK
                        </div>
                        <div className="flex items-center gap-3">
                            <Wifi size={18} className="text-[#00f3ff]" />
                            <div className="text-white font-data text-sm font-bold tabular-nums">{Math.floor(signalStrength)}%</div>
                        </div>
                    </div>

                    {/* GPS Block */}
                    <div className={`p-3 rounded-2xl border-l-2 bg-black/60 backdrop-blur-md min-w-[140px] shadow-2xl transition-all duration-700 ${outOfBounds ? 'border-[#ff003c]' : 'border-[#00E5FF]/40'}`}>
                        <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/5">
                            <div className="text-[#00E5FF] font-black text-[8px] tracking-widest uppercase italic">GPS_FIX</div>
                            <Activity size={10} className="text-green-500/50" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-white font-data text-[10px] tabular-nums flex justify-between">
                                <span className="text-zinc-600 font-bold">LAT</span> {coords[0].toFixed(4)}
                            </div>
                            <div className="text-white font-data text-[10px] tabular-nums flex justify-between">
                                <span className="text-zinc-600 font-bold">LNG</span> {coords[1].toFixed(4)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute top-4 right-4 z-30 pointer-events-none">
                    {/* Distance Block */}
                    <div className={`glass-panel p-4 rounded-2xl transition-all duration-1000 bg-black/60 backdrop-blur-md min-w-[160px] border-r-4 shadow-2xl ${outOfBounds ? 'border-[#ff003c]' : 'border-[#CCFF00]/40'}`}>
                        <div className={`${outOfBounds ? 'text-[#ff003c]' : 'text-[#CCFF00]'} font-black text-[8px] tracking-[0.2em] uppercase mb-1 text-right`}>DISTANCE</div>
                        <div className="flex items-center justify-end gap-3">
                            <div className="text-white font-data text-2xl font-bold tracking-tight tabular-nums leading-none">
                                {Math.floor(distance)}<span className="text-[9px] font-raj text-zinc-500 ml-1 font-bold uppercase">M</span>
                            </div>
                            <Target size={22} className={outOfBounds ? 'text-[#ff003c] animate-pulse' : 'text-[#CCFF00]'} />
                        </div>
                    </div>
                </div>

                {/* Recenter Button HUD Element - ENHANCED FUNCTIONALITY */}
                <button 
                    onClick={recenterMap}
                    className={`absolute bottom-32 right-4 z-30 w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-2xl border ${
                        isFollowing 
                        ? 'bg-[#00f3ff]/20 border-[#00f3ff] text-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.3)]' 
                        : 'bg-black/60 border-white/10 text-zinc-500 hover:text-white hover:bg-black/80 hover:border-[#00f3ff]/40'
                    }`}
                    title={isFollowing ? "Target Locked" : "Recenter on Target"}
                >
                    <Navigation size={22} className={`rotate-45 transition-transform duration-500 ${isFollowing ? 'scale-110' : ''}`} />
                    {isFollowing && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00f3ff] rounded-full animate-ping"></div>
                    )}
                </button>

                {/* ASSET STATUS - COMPACT BOTTOM RIGHT */}
                <div className="absolute bottom-10 right-4 z-30 pointer-events-none">
                    <div className="glass-panel p-4 rounded-[1.5rem] border border-white/10 text-right bg-black/80 backdrop-blur-2xl shadow-3xl">
                        <div className="text-zinc-500 font-black text-[8px] tracking-[0.3em] uppercase mb-1 italic opacity-60">HUB_MONITOR</div>
                        <div className={`font-black text-2xl italic tracking-tighter flex items-center justify-end gap-4 transition-all duration-700 ${outOfBounds ? 'text-[#ff003c]' : 'text-[#00ff41]'}`}>
                            {outOfBounds ? 'BREACH' : 'STABLE'}
                            <div className={`w-3 h-3 rounded-full ${outOfBounds ? 'bg-[#ff003c] animate-ping' : 'bg-[#00ff41] shadow-[0_0_15px_#00ff41]'}`}></div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* HUD BOTTOM PADDING */}
            <div className="pb-12 bg-black"></div>
        </div>
    );
};

const TrustImpactAnimation = ({ isPositive, impactValue, onClose }: { isPositive: boolean, impactValue: number, onClose: () => void }) => {
    const [visible, setVisible] = useState(true);
    const [counter, setCounter] = useState(0);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 500); // Wait for fade out
        }, 4000); // Wait for 4 seconds as requested

        // Counter animation
        const interval = setInterval(() => {
            setCounter(prev => {
                if (prev < impactValue) return prev + 1;
                return prev;
            });
        }, 2000 / (impactValue || 1));

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [onClose, impactValue]);

    if (!visible) return null;

    return (
        <div 
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden font-raj cursor-pointer"
        >
            {/* Background Glitch Elements */}
            <div className={`absolute inset-0 pointer-events-none opacity-[0.07] overflow-hidden ${isPositive ? 'text-[#CCFF00]' : 'text-red-600'}`}>
                {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="whitespace-nowrap font-data text-[12px] animate-pulse py-1 tabular-nums">
                        {isPositive ? `NODE_UPLINK_STABLE_0x77_AUTH_ID_${Math.random().toString(16).substr(2,8)}` : `CRITICAL_FAILURE_NODE_BREACH_AUTH_0x00_REF_${Math.random().toString(16).substr(2,8)}`}
                    </div>
                ))}
            </div>

            <div className="relative flex flex-col items-center text-center px-10 z-10 pointer-events-none">
                {/* Central Ring */}
                <div className={`w-64 h-64 rounded-full border-[8px] flex flex-col items-center justify-center transition-all duration-1000 mb-10 relative ${
                    isPositive ? 'border-[#CCFF00] shadow-[0_0_60px_rgba(204,255,0,0.4),inset_0_0_30px_rgba(204,255,0,0.2)]' : 'border-red-600 shadow-[0_0_60px_rgba(255,0,0,0.4),inset_0_0_30px_rgba(255,0,0,0.2)]'
                }`}>
                    {/* Animated Data Segments */}
                    <div className="absolute -inset-8 border-[1px] border-dashed rounded-full animate-spin duration-[15s] opacity-20" style={{ borderColor: isPositive ? '#CCFF00' : '#FF0000' }}></div>
                    <div className="absolute -inset-12 border-[1px] border-zinc-800 rounded-full opacity-10"></div>
                    
                    <div className={`font-black text-8xl italic tracking-tighter leading-none flex items-baseline ${isPositive ? 'text-[#CCFF00]' : 'text-red-500'}`}>
                        {isPositive ? '+' : '-'}{counter}<span className="text-2xl ml-1 opacity-50">%</span>
                    </div>
                    <div className="font-bold text-[12px] tracking-[0.5em] uppercase mt-4 text-white">TRUST_MODIFIER</div>
                    
                    {/* Pulsing indicator dots */}
                    <div className="absolute bottom-6 flex gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full animate-ping ${isPositive ? 'bg-[#CCFF00]' : 'bg-red-500'}`} style={{ animationDelay: `${i * 0.3}s` }}></div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 max-w-[300px]">
                    <div className={`inline-block px-4 py-1.5 rounded-md border font-black text-xs tracking-widest uppercase italic ${isPositive ? 'bg-[#CCFF0022] border-[#CCFF0044] text-[#CCFF00]' : 'bg-red-900/30 border-red-600/40 text-red-500'}`}>
                        {isPositive ? 'NETWORK_RELIABILITY_SYNC' : 'RADIUS_PROTOCOL_BREACH'}
                    </div>
                    <h2 className={`font-black text-4xl uppercase italic tracking-tight leading-none animate-glitch ${isPositive ? 'text-white' : 'text-red-600'}`}>
                        {isPositive ? 'NODE SECURED' : 'SECURITY_VOID'}
                    </h2>
                    <p className="text-zinc-500 font-inter text-[13px] leading-relaxed opacity-70">
                        {isPositive 
                            ? 'Bounty work verified as within temporal parameters. Campus clearance increased.' 
                            : 'Mission deadline exceeded. Reliability index degraded. Penalties logged to ledger.'}
                    </p>
                </div>
            </div>

            {/* Scanning Line */}
            <div className={`absolute top-0 left-0 w-full h-[4px] shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-scanline z-20 ${isPositive ? 'bg-[#CCFF00]' : 'bg-red-600'}`}></div>
            
            <style>{`
                @keyframes scanline {
                    0% { transform: translateY(-100px); }
                    100% { transform: translateY(110vh); }
                }
                .animate-scanline {
                    animation: scanline 2.5s linear infinite;
                }
                .animate-glitch {
                    animation: glitch 1s steps(2, end) infinite;
                }
                @keyframes glitch {
                    0% { transform: translate(0); }
                    20% { transform: translate(-2px, 2px); }
                    40% { transform: translate(-2px, -2px); }
                    60% { transform: translate(2px, 2px); }
                    80% { transform: translate(2px, -2px); }
                    100% { transform: translate(0); }
                }
            `}</style>
        </div>
    );
};

const HubView: React.FC<HubViewProps> = ({ state, updateState, processTransactionSuccess, updateTrustScore, onViewProfile }) => {
    const { hub, user, home, settings } = state;

    // Local state for UI interactions
    const [searchQuery, setSearchQuery] = useState('');
    const [marketSortOrder, setMarketSortOrder] = useState<MarketSortOrder>('NAME_ASC');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [isBountySortMenuOpen, setIsBountySortMenuOpen] = useState(false);
    const [isBountyFilterModalOpen, setIsBountyFilterModalOpen] = useState(false);
    const [processingOfferId, setProcessingOfferId] = useState<string | null>(null);
    const [confirmingHireId, setConfirmingHireId] = useState<string | null>(null);
    const [isProcessingRental, setIsProcessingRental] = useState(false);
    const [acceptingBountyId, setAcceptingBountyId] = useState<string | null>(null);
    const [confirmingBounty, setConfirmingBounty] = useState<HubBounty | null>(null);
    const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
    const [flippedBountyId, setFlippedBountyId] = useState<string | null>(null);
    const [flippedGearId, setFlippedGearId] = useState<string | null>(null);
    const [flippedMyRentalId, setFlippedMyRentalId] = useState<string | null>(null);
    const [paymentInitiated, setPaymentInitiated] = useState(false);
    const [isGPaySheetOpen, setIsGPaySheetOpen] = useState(false);
    const [isRequestProtocolOpen, setIsRequestProtocolOpen] = useState(false);
    const [isSendingRequest, setIsSendingRequest] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);
    
    // Rating State
    const [isRateModalOpen, setIsRateModalOpen] = useState(false);
    const [selectedRentalToRate, setSelectedRentalToRate] = useState<HubRentalItem | null>(null);
    const [ratingScore, setRatingScore] = useState(5);
    const [ratingComment, setRatingComment] = useState('');
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    // Custody State
    const [pickingUpId, setPickingUpId] = useState<string | null>(null);
    const [pickedUpIds, setPickedUpIds] = useState<Set<string>>(new Set());
    const [isPickupQrModalOpen, setIsPickupQrModalOpen] = useState(false);
    const [pickupItemToReveal, setPickupItemToReveal] = useState<HubCustodyItem | null>(null);
    const [isFinalizingPickup, setIsFinalizingPickup] = useState(false);

    // Negotiation States
    const [selectedBountyForNegotiation, setSelectedBountyForNegotiation] = useState<HubBounty | null>(null);
    const [isNegotiateModalOpen, setIsNegotiateModalOpen] = useState(false);
    const [negotiateFormData, setNegotiateFormData] = useState({ proposedReward: '', message: '' });
    const [negotiationMode, setNegotiateMode] = useState<'NEGOTIATE' | 'RENEGOTIATE'>('NEGOTIATE');
    const [isUplinkingOffer, setIsUplinkingOffer] = useState(false);
    const [isOfferSentVisible, setIsOfferSentVisible] = useState(false);

    // Bounty Creation States
    const [isCreateBountyModalOpen, setIsCreateBountyModalOpen] = useState(false);
    const [isRefiningBrief, setIsRefiningBrief] = useState(false);
    const [bountyFormData, setBountyFormData] = useState({
        title: '',
        description: '',
        reward: '',
        category: 'WRITTEN_WORK' as BountyCategory,
        tags: '',
        timeSlots: ''
    });

    // Guidance Availability UI States
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [startTime, setStartTime] = useState('18:00');
    const [endTime, setEndTime] = useState('20:00');

    // Detail Modal States
    const [isMissionDetailsModalOpen, setIsMissionDetailsModalOpen] = useState(false);
    const [selectedBountyForDetails, setSelectedBountyForDetails] = useState<HubBounty | null>(null);

    // Trust Impact UI state
    const [trustImpact, setTrustImpact] = useState<{ isPositive: boolean, val: number } | null>(null);
    const [showPaymentPending, setShowPaymentPending] = useState(false);

    // Listing/Request Form State
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [assetFormData, setAssetFormData] = useState({ name: '', rate: '', description: '', image: null as string | null });
    const [requestFormData, setRequestFormData] = useState({ name: '', budget: '', duration: '', image: null as string | null });

    // AI Editing Local State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiEditing, setIsAiEditing] = useState(false);

    // Sync State
    const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

    // Stock Management Local State
    const [isManagementProcessing, setIsManagementProcessing] = useState(false);
    const [editAssetFormData, setEditAssetFormData] = useState({ name: '', rate: '', description: '' });

    // Rental Duration State
    const [rentalDuration, setRentalDuration] = useState(1);

    // File Input Refs
    const assetImageRef = useRef<HTMLInputElement>(null);
    const requestImageRef = useRef<HTMLInputElement>(null);

    // Bounty UI state
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Tracking State
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
    const [selectedTrackingItem, setSelectedTrackingItem] = useState<{name: string, status: string} | null>(null);

    // Settlement Modal State
    const [isSettlementOpen, setIsSettlementOpen] = useState(false);
    const [activeInvoice, setActiveInvoice] = useState<HubInvoiceType | null>(null);

    // Submission handling
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update current time for countdowns - 1s sync for real-time timer
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatCurrency = (amount: number) => {
        const rates = { INR: 1, USD: 0.012, EUR: 0.011 };
        const symbols = { INR: '₹', USD: '$', EUR: '€' };
        const converted = amount * rates[settings.currency];
        return `${symbols[settings.currency]}${settings.currency === 'INR' ? converted.toLocaleString() : converted.toFixed(2)}`;
    };

    const openTracking = (name: string, status: string) => {
        setSelectedTrackingItem({ name, status });
        setIsTrackModalOpen(true);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, formType: 'asset' | 'request') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                if (formType === 'asset') {
                    setAssetFormData(prev => ({ ...prev, image: base64 }));
                } else {
                    setRequestFormData(prev => ({ ...prev, image: base64 }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAiImageEdit = async (formType: 'asset' | 'request') => {
        const currentImage = formType === 'asset' ? assetFormData.image : requestFormData.image;
        if (!currentImage || !aiPrompt) return;

        setIsAiEditing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = currentImage.split(',')[1];
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: 'image/png' } },
                        { text: `Apply the following artistic or corrective edit to this image: "${aiPrompt}". Maintain structural integrity. Return the edited image bytes.` }
                    ]
                }
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const newBase64 = `data:image/png;base64,${part.inlineData.data}`;
                    if (formType === 'asset') setAssetFormData(prev => ({ ...prev, image: newBase64 }));
                    else setRequestFormData(prev => ({ ...prev, image: newBase64 }));
                    setAiPrompt('');
                    break;
                }
            }
        } catch (error) {
            console.error("AI Edit failed", error);
        } finally {
            setIsAiEditing(false);
        }
    };

    const handleSyncCloudsave = (invoiceId: string) => {
        setSyncingIds(prev => new Set(prev).add(invoiceId));
        
        // Simulating tactical cloud sync uplink
        setTimeout(() => {
            setSyncingIds(prev => {
                const next = new Set(prev);
                next.delete(invoiceId);
                return next;
            });
            
            // Push notification to state if needed, or just visual feedback
            console.log(`UPLINK_SUCCESS: Invoice ${invoiceId} committed to GSD_NODE_CENTRAL`);
        }, 1800);
    };

    const handleQuickToggleStatus = (id: string) => {
        setSyncingIds(prev => new Set(prev).add(id));
        setTimeout(() => {
            updateState(s => ({
                ...s,
                hub: {
                    ...s.hub,
                    rentalData: {
                        ...s.hub.rentalData,
                        my_stock: s.hub.rentalData.my_stock.map(item => 
                            item.id === id 
                                ? { ...item, status: item.status === 'RENTED' ? 'LISTED' : 'RENTED' } 
                                : item
                        )
                    }
                }
            }));
            setSyncingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }, 800);
    };

    const getRemainingTimeLabel = (deadline?: number) => {
        if (!deadline) return null;
        const diff = deadline - currentTime;
        if (diff <= 0) return 'PROTOCOL_EXPIRED';
        
        const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
        const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days > 0) return `CLOSING IN ${days}D ${hours}H ${minutes}M`;
        if (hours !== "00") return `${hours}:${minutes}:${seconds}`;
        return `${minutes}:${seconds}`;
    };

    const getUrgencyStyles = (deadline?: number) => {
        if (!deadline) return { container: '', text: 'text-zinc-600', icon: 'text-zinc-700', hex: '#52525B' };
        const diff = deadline - currentTime;
        
        if (diff <= 0) {
            return { 
                container: 'bg-[#FF3333] px-3 py-1.5 rounded-lg shadow-[0_0_15px_#FF3333]', 
                text: 'text-black font-black animate-pulse', 
                icon: 'text-black',
                hex: '#FF3333'
            };
        }
        
        if (diff < 3600000) { // < 1 hour
            return { 
                container: 'bg-[#FF3333] px-3 py-1.5 rounded-lg shadow-[0_0_20px_#FF3333] animate-pulse-fast', 
                text: 'text-black font-black', 
                icon: 'text-black',
                hex: '#FF3333'
            };
        }
        
        if (diff < 21600000) { // < 6 hours - Warning Zone
            return { 
                container: 'bg-[#FFD600] px-3 py-1.5 rounded-lg shadow-[0_0_15px_#FFD600]', 
                text: 'text-black font-black animate-pulse-slow', 
                icon: 'text-black',
                hex: '#FFD600'
            };
        }
        
        // > 6 hours - Stable Zone
        return { 
            container: 'bg-[#00FF41] px-3 py-1.5 rounded-lg shadow-[0_0_15px_#00FF41]', 
                text: 'text-black font-black', 
                icon: 'text-black',
                hex: '#00FF41'
            };
    };

    // Form formatting for time slots
    useEffect(() => {
        if (bountyFormData.category === 'GUIDANCE') {
            const daysStr = selectedDays.length > 0 ? selectedDays.join(', ') : '';
            const formatTime12h = (time: string) => {
                const [h, m] = time.split(':');
                const hour = parseInt(h);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const h12 = hour % 12 || 12;
                return `${h12}:${m} ${ampm}`;
            };
            const timeRange = `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;
            setBountyFormData(prev => ({ ...prev, timeSlots: daysStr ? `${daysStr} | ${timeRange}` : '' }));
        }
    }, [selectedDays, startTime, endTime, bountyFormData.category]);

    // --- FORM HANDLERS ---
    const handleListAsset = () => {
        if (!assetFormData.name || !assetFormData.rate) return;
        setIsSubmittingForm(true);
        setTimeout(() => {
            const newItem: HubStockItem = {
                id: 'ST-' + Math.floor(Math.random() * 1000),
                name: assetFormData.name,
                status: 'LISTED',
                earnings: 0,
                user: '-',
                rate: parseInt(assetFormData.rate),
                description: assetFormData.description,
                image: assetFormData.image
            };
            updateState(s => ({
                ...s,
                hub: {
                    ...s.hub,
                    isListAssetModalOpen: false,
                    rentalData: {
                        ...s.hub.rentalData,
                        my_stock: [newItem, ...s.hub.rentalData.my_stock]
                    }
                }
            }));
            setAssetFormData({ name: '', rate: '', description: '', image: null });
            setIsSubmittingForm(false);
        }, 1200);
    };

    const handleUploadRequest = () => {
        if (!requestFormData.name || !requestFormData.budget) return;
        setIsSubmittingForm(true);
        setTimeout(() => {
            const newReq: HubRequestItem = {
                id: 'RQ-' + Math.floor(Math.random() * 1000),
                item: requestFormData.name,
                user: '@YOU',
                offer: `${requestFormData.budget}/hr`,
                rating: '5.0'
            };
            updateState(s => ({
                ...s,
                hub: {
                    ...s.hub,
                    isUploadRequestModalOpen: false,
                    rentalData: {
                        ...s.hub.rentalData,
                        requests: [newReq, ...s.hub.rentalData.requests]
                    }
                }
            }));
            setRequestFormData({ name: '', budget: '', duration: '', image: null });
            setIsSubmittingForm(false);
        }, 1200);
    };

    const handleCreateBounty = () => {
        if (!bountyFormData.title || !bountyFormData.reward) return;
        setIsSubmittingForm(true);
        setTimeout(() => {
            const newBounty: HubBounty = {
                id: 'B-' + Math.floor(Math.random() * 1000),
                title: bountyFormData.title,
                creator: '@Me',
                estimate: '4 HOURS',
                reward: parseInt(bountyFormData.reward),
                tags: bountyFormData.tags.split(',').map(t => t.trim().toUpperCase()).filter(t => t),
                category: bountyFormData.category,
                description: bountyFormData.description,
                postedAtTimestamp: Date.now(),
                postedAt: 'JUST NOW',
                status: 'OPEN',
                offers: [],
                timeSlots: bountyFormData.category === 'GUIDANCE' ? bountyFormData.timeSlots : undefined
            };

            const rewardAmount = 25; // UPDATED FROM 10 TO 25 AS PER REQUEST
            updateState(s => ({
                ...s,
                home: {
                    ...s.home,
                    boneBalance: s.home.boneBalance + rewardAmount,
                },
                user: {
                    ...s.user,
                    lifetimeEarned: s.user.lifetimeEarned + rewardAmount,
                    history: [{
                        id: `REWARD-POST-${Date.now()}`,
                        type: 'REWARD',
                        amount: rewardAmount,
                        description: `Mission Deployed: ${newBounty.title}`,
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
                    }, ...s.user.history]
                },
                hub: {
                    ...s.hub,
                    isCreateBountyModalOpen: false,
                    bountyData: {
                        ...s.hub.bountyData,
                        my_posts: [newBounty, ...s.hub.bountyData.my_posts]
                    }
                },
                notificationToast: {
                    visible: true,
                    message: "MISSION_DEPLOYED_REWARD",
                    amount: rewardAmount
                }
            }));
            
            setBountyFormData({ title: '', description: '', reward: '', category: 'WRITTEN_WORK', tags: '', timeSlots: '' });
            setSelectedDays([]);
            setIsSubmittingForm(false);
        }, 1200);
    };

    const handleRefineBrief = async () => {
        if (!bountyFormData.description) return;
        setIsRefiningBrief(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `OPERATIVE_TASK: Refine this campus bounty description to be more tactical, clear, and professional. 
                ORIGINAL: "${bountyFormData.description}"
                Maintain industrial fintech tone. Return ONLY the refined description text. Max 30 words.`
            });
            if (response.text) {
                setBountyFormData(prev => ({ ...prev, description: response.text.trim() }));
            }
        } catch (error) {
            console.error("AI Refine failed", error);
        } finally {
            setIsRefiningBrief(false);
        }
    };

    // --- STOCK MANAGEMENT HANDLERS ---
    const handleRecalculateEarnings = (id: string) => {
        setIsManagementProcessing(true);
        setTimeout(() => {
            updateState(s => {
                const updatedList = s.hub.rentalData.my_stock.map(item => 
                    item.id === id ? { ...item, earnings: item.earnings + Math.floor(Math.random() * 100) } : item
                );
                const updatedSelected = updatedList.find(i => i.id === id) || null;
                return {
                    ...s,
                    hub: {
                        ...s.hub,
                        selectedStockItem: updatedSelected,
                        rentalData: {
                            ...s.hub.rentalData,
                            my_stock: updatedList
                        }
                    }
                };
            });
            setIsManagementProcessing(false);
        }, 1000);
    };

    const handleToggleStockStatus = (id: string, currentStatus: string) => {
        setIsManagementProcessing(true);
        setTimeout(() => {
            updateState(s => {
                const updatedList = s.hub.rentalData.my_stock.map(item => {
                    if (item.id === id) {
                        let nextStatus: 'LISTED' | 'IDLE' | 'RENTED' | 'RECALLING...' = 'LISTED';
                        if (currentStatus === 'LISTED') nextStatus = 'IDLE';
                        else if (currentStatus === 'IDLE') nextStatus = 'LISTED';
                        else if (currentStatus === 'RENTED') nextStatus = 'RECALLING...';
                        return { ...item, status: nextStatus };
                    }
                    return item;
                });
                const updatedSelected = updatedList.find(i => i.id === id) || null;
                return {
                    ...s,
                    hub: {
                        ...s.hub,
                        selectedStockItem: updatedSelected,
                        rentalData: {
                            ...s.hub.rentalData,
                            my_stock: updatedList
                        }
                    }
                };
            });
            setIsManagementProcessing(false);
        }, 800);
    };

    const handleUpdateAssetParameters = () => {
        if (!hub.selectedStockItem) return;
        setIsManagementProcessing(true);
        setTimeout(() => {
            updateState(s => {
                const updatedList = s.hub.rentalData.my_stock.map(item => 
                    item.id === hub.selectedStockItem!.id ? { 
                        ...item, 
                        name: editAssetFormData.name, 
                        rate: parseInt(editAssetFormData.rate),
                        description: editAssetFormData.description
                    } : item
                );
                const updatedSelected = updatedList.find(i => i.id === hub.selectedStockItem!.id) || null;
                return {
                    ...s,
                    hub: {
                        ...s.hub,
                        isEditAssetModalOpen: false,
                        selectedStockItem: updatedSelected,
                        rentalData: {
                            ...s.hub.rentalData,
                            my_stock: updatedList
                        }
                    }
                };
            });
            setIsManagementProcessing(false);
        }, 1200);
    };

    const handleDelistUnit = (id: string) => {
        setIsManagementProcessing(true);
        setTimeout(() => {
            updateState(s => ({
                ...s,
                hub: {
                    ...s.hub,
                    isStockModalOpen: false,
                    selectedStockItem: null,
                    rentalData: {
                        ...s.hub.rentalData,
                        my_stock: s.hub.rentalData.my_stock.filter(i => i.id !== id)
                    }
                }
            }));
            setIsManagementProcessing(false);
        }, 1000);
    };

    // --- RENTAL HANDLERS ---
    const openRentalModal = (item: HubProcureItem) => {
        setRentalDuration(1); // Reset duration
        setPaymentInitiated(false); // Reset payment tracking
        updateState(s => ({
            ...s,
            hub: {
                ...s.hub,
                isRentalModalOpen: true,
                selectedRentalItem: item,
                rentalCheckbox: false
            }
        }));
    };

    const openRequestModal = (item: HubProcureItem) => {
        updateState(s => ({
            ...s,
            hub: {
                ...s.hub,
                selectedRentalItem: item
            }
        }));
        setIsRequestProtocolOpen(true);
        setRequestSuccess(false);
    };

    const handleSendRentalRequest = () => {
        setIsSendingRequest(true);
        setTimeout(() => {
            setIsSendingRequest(false);
            setRequestSuccess(true);
            
            // Log to notifications
            updateState(s => ({
                ...s,
                notifications: [{
                    id: 'REQ-' + Date.now(),
                    title: 'UPLINK_SENT',
                    message: `Rental request for ${hub.selectedRentalItem?.name} transmitted to owner node for review.`,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    type: 'INFO'
                }, ...s.notifications]
            }));

            setTimeout(() => {
                setIsRequestProtocolOpen(false);
            }, 2000);
        }, 1800);
    };

    const handleConfirmRental = () => {
        const item = hub.selectedRentalItem;
        if (!item) return;

        setIsProcessingRental(true);
        const totalCost = item.rate * rentalDuration;
        
        setTimeout(() => {
            const newItem: HubRentalItem = { 
                id: 'R-' + Date.now(), 
                name: item.name, 
                status: 'ACTIVE', 
                cost: totalCost, 
                time: `${rentalDuration}h 0m Left` 
            };

            const receiptMeta = {
                transactionId: 'GSD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                method: 'UPI_INTENT',
                authCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
                timestamp: new Date().toISOString(),
                deviceSignature: 'GSD_OS_77'
            };

            updateState(prev => {
                const currentRentals = prev.hub.rentalData?.my_rentals || [];
                return {
                    ...prev,
                    hub: {
                        ...prev.hub,
                        isRentalModalOpen: false,
                        rentalCheckbox: false,
                        activeRentalSubTab: 'MY_RENTALS',
                        rentalData: {
                            ...prev.hub.rentalData,
                            my_rentals: [newItem, ...currentRentals]
                        }
                    }
                };
            });

            processTransactionSuccess(user.id, totalCost, `Gear Rental: ${item.name} (${rentalDuration}h)`, receiptMeta);
            setIsProcessingRental(false);
        }, 1500);
    };

    const handleApproveRequest = (requestId: string) => {
        setProcessingRequestId(requestId);
        setTimeout(() => {
            updateState(s => ({
                ...s,
                hub: {
                    ...s.hub,
                    rentalData: {
                        ...s.hub.rentalData,
                        requests: s.hub.rentalData.requests.filter(r => r.id !== requestId)
                    }
                }
            }));
            setProcessingRequestId(null);
        }, 1500);
    };

    const handleDeclineRequest = (requestId: string) => {
        updateState(s => ({
            ...s,
            hub: {
                ...s.hub,
                rentalData: {
                    ...s.hub.rentalData,
                    requests: s.hub.rentalData.requests.filter(r => r.id !== requestId)
                }
            }
        }));
    };

    const handleAcceptMission = (bounty: HubBounty) => {
        // CAPACITY CHECK: Max 3 missions
        if (hub.bountyData.accepted.length >= 3) {
            alert("CAPACITY_RESTRICTION: Maximum limit of 3 active missions reached. Secure a current mission before accepting a new one.");
            return;
        }

        setAcceptingBountyId(bounty.id);
        setTimeout(() => {
            // For testing, give B-99 a short deadline if it's the one from initial state
            const deadline = bounty.id === 'B-99' ? Date.now() + 10000 : bounty.deadlineTimestamp;

            updateState(s => ({
                ...s,
                hub: {
                    ...s.hub,
                    activeBountySubTab: 'ACCEPTED',
                    bountyData: {
                        ...s.hub.bountyData,
                        feed: s.hub.bountyData.feed.filter(b => b.id !== bounty.id),
                        accepted: [{
                            ...bounty,
                            deadlineTimestamp: deadline,
                            postedAt: 'ACTIVE MISSION',
                            status: 'OPEN'
                        }, ...s.hub.bountyData.accepted]
                    }
                }
            }));
            setAcceptingBountyId(null);
            setConfirmingBounty(null);
        }, 1500);
    };

    const handleSendOffer = () => {
        if (!selectedBountyForNegotiation || !negotiateFormData.proposedReward) return;
        
        const proposal = parseInt(negotiateFormData.proposedReward);
        if (negotiationMode === 'NEGOTIATE' && proposal < selectedBountyForNegotiation.reward) {
            alert(`PROTOCOL_BREACH: Minimum proposal cannot be less than current reward (${formatCurrency(selectedBountyForNegotiation.reward)}).`);
            return;
        }

        setIsUplinkingOffer(true);
        
        setTimeout(() => {
            setIsUplinkingOffer(false);
            setIsNegotiateModalOpen(false);
            setNegotiateFormData({ proposedReward: '', message: '' });
            
            // SHOW NOTIFICATION POPUP
            setIsOfferSentVisible(true);
            setTimeout(() => setIsOfferSentVisible(false), 2000);
        }, 1800);
    };

    const handleAcceptOffer = (bounty: HubBounty, offer: HubOffer) => {
        // CAPACITY CHECK: Max 3 missions
        if (hub.bountyData.accepted.length >= 3) {
            alert("CAPACITY_RESTRICTION: Maximum limit of 3 active missions reached. Secure current missions before hiring more help.");
            return;
        }

        const agreedPrice = offer.bid || bounty.reward;
        const rewardBones = Math.floor(agreedPrice * 0.10); // NEW: 10% reward in bones
        setProcessingOfferId(offer.id);

        setTimeout(() => {
            updateState(s => {
                const currentMyPosts = s.hub.bountyData.my_posts || [];
                const updatedMyPosts = currentMyPosts.map(b => 
                    b.id === bounty.id ? { 
                        ...b, 
                        status: 'ASSIGNED' as const,
                        assignedProvider: offer.user,
                        agreedPrice: agreedPrice,
                        offers: [] 
                    } : b
                );

                const assignedBounty = { 
                    ...bounty, 
                    status: 'ASSIGNED' as const, 
                    assignedProvider: offer.user, 
                    agreedPrice: agreedPrice,
                    postedAt: 'ASSIGNED_UPLINK'
                };

                const rewardRecord: TransactionRecord = {
                    id: `REWARD-HIRE-${Date.now()}`,
                    type: 'REWARD',
                    amount: rewardBones,
                    description: `Operative Hired Reward: ${bounty.title}`,
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
                };

                return {
                    ...s,
                    home: {
                        ...s.home,
                        boneBalance: s.home.boneBalance + rewardBones // ONLY REWARD, NO DEDUCTION
                    },
                    user: {
                        ...s.user,
                        lifetimeEarned: s.user.lifetimeEarned + rewardBones,
                        history: [rewardRecord, ...s.user.history]
                    },
                    hub: {
                        ...s.hub,
                        isOffersModalOpen: false,
                        selectedBountyForOffers: null,
                        activeBountySubTab: 'ACCEPTED',
                        bountyData: {
                            ...s.hub.bountyData,
                            my_posts: updatedMyPosts,
                            accepted: [assignedBounty, ...s.hub.bountyData.accepted]
                        }
                    },
                    notificationToast: rewardBones > 0 ? {
                        visible: true,
                        message: "CONTRACT_SECURED_REWARD",
                        amount: rewardBones
                    } : null
                };
            });

            setProcessingOfferId(null);
            setConfirmingHireId(null);
        }, 1800);
    };

    const handleDeclineOffer = (bountyId: string, offerId: string) => {
        updateState(s => ({
            ...s,
            hub: {
                ...s.hub,
                bountyData: {
                    ...s.hub.bountyData,
                    my_posts: s.hub.bountyData.my_posts.map(b => 
                        b.id === bountyId ? { ...b, offers: (b.offers || []).filter(o => o.id !== offerId) } : b
                    )
                },
                selectedBountyForOffers: s.hub.selectedBountyForOffers?.id === bountyId 
                    ? { ...s.hub.selectedBountyForOffers, offers: (s.hub.selectedBountyForOffers.offers || []).filter(o => o.id !== offerId) }
                    : s.hub.selectedBountyForOffers
            }
        }));
    };

    const handleWorkSubmission = (bountyId: string) => {
        setActiveSubmissionId(bountyId);
        // Ensure input is empty so same file can trigger change
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && activeSubmissionId) {
            setIsSubmitting(true);
            
            const bounty = hub.bountyData.accepted.find(b => b.id === activeSubmissionId);
            if (!bounty) {
                setIsSubmitting(false);
                return;
            }

            try {
                // 1. Convert file to base64 for vision processing
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
                const base64Data = base64.split(',')[1];

                // 2. Query Gemini 3 Flash for high-speed document verification
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: {
                        parts: [
                            { inlineData: { data: base64Data, mimeType: file.type } },
                            { text: `MISSION VERIFICATION TASK.
                            Analyze the uploaded document image against the mission details provided.
                            MISSION TITLE: "${bounty.title}"
                            MISSION DESCRIPTION: "${bounty.description}"
                            
                            Evaluation Steps:
                            - Read and analyze the entire document content.
                            - Check for specific keywords, logical consistency, and required elements (e.g., if a report is requested, check for data/analysis).
                            - Determine if this is a genuine submission or irrelevant/placeholder media.
                            
                            Return strictly as a JSON object:
                            {
                                "isMatch": boolean,
                                "confidence": number (0-1),
                                "reason": "Short summary of findings (max 8 words)"
                            }` }
                        ]
                    },
                    config: { responseMimeType: "application/json" }
                });

                const result = JSON.parse(response.text || '{}');

                if (result.isMatch) {
                    // SUCCESS: Bounty Match Confirmed
                    const isLate = bounty.deadlineTimestamp ? currentTime > bounty.deadlineTimestamp : false;
                    const bonusBones = bounty.reward;
                    
                    if (updateTrustScore) {
                        updateTrustScore('BOUNTY', true, `Mission Secure: ${bounty.title}`);
                    }

                    setTrustImpact({ isPositive: true, val: 5 });

                    updateState(s => ({
                        ...s,
                        home: {
                            ...s.home,
                            boneBalance: s.home.boneBalance + bonusBones
                        },
                        user: {
                            ...s.user,
                            lifetimeEarned: s.user.lifetimeEarned + bonusBones
                        },
                        hub: {
                            ...s.hub,
                            bountyData: {
                                ...s.hub.bountyData,
                                accepted: s.hub.bountyData.accepted.filter(b => b.id !== activeSubmissionId)
                            }
                        },
                        notificationToast: {
                            visible: true,
                            message: `VERIFIED: ${result.reason}`,
                            amount: bonusBones
                        }
                    }));
                } else {
                    // FAILURE: Breach Detected
                    const penalty = 50; 
                    if (updateTrustScore) {
                        updateTrustScore('BOUNTY', false, `Mission Breach: Invalid submission for ${bounty.title}`);
                    }

                    setTrustImpact({ isPositive: false, val: 15 });

                    updateState(s => ({
                        ...s,
                        home: {
                            ...s.home,
                            boneBalance: Math.max(0, s.home.boneBalance - penalty)
                        },
                        notificationToast: {
                            visible: true,
                            message: `BREACH: ${result.reason}`,
                            amount: -penalty
                        }
                    }));
                    // The bounty remains in 'Accepted' list for corrective action
                }
            } catch (err) {
                console.error("Uplink Error during verification:", err);
                alert("NETWORK_BREACH: AI Verification Uplink Timeout. Secure connection and retry.");
            } finally {
                setIsSubmitting(false);
                setActiveSubmissionId(null);
            }
        }
    };

    const handleSettleInvoiceClick = (invoice: HubInvoiceType) => {
        setActiveInvoice(invoice);
        setIsSettlementOpen(true);
    };

    const handleInvoiceSuccess = (amount: number, description: string, receiptMeta?: any) => {
        if (!activeInvoice) return;
        const invoiceId = activeInvoice.id;
        updateState(s => ({
            ...s,
            hub: {
                ...s.hub,
                invoices: s.hub.invoices.map(inv => 
                    inv.id === invoiceId ? { ...inv, status: 'PAID', receiptMetadata: receiptMeta } : inv
                )
            }
        }));
        processTransactionSuccess(user.id, amount, description, receiptMeta);
    };

    const handleGearReturnSim = (rental: HubRentalItem) => {
        if (updateTrustScore) {
            const isPositive = rental.status !== 'OVERDUE';
            updateTrustScore('GEAR', isPositive, isPositive ? `Secure Return: ${rental.name}` : `Damaged/Late Return: ${rental.name}`);
            setTrustImpact({ isPositive, val: isPositive ? 10 : 20 });
        }
        updateState(s => ({
            ...s,
            hub: {
                ...s.hub,
                rentalData: {
                    ...s.hub.rentalData,
                    my_rentals: s.hub.rentalData.my_rentals.filter(r => r.id !== rental.id)
                }
            }
        }));
    };

    const handleCustodyPickupInitiate = (item: HubCustodyItem) => {
        setPickupItemToReveal(item);
        setIsPickupQrModalOpen(true);
    };

    const finalizeCustodyPickup = () => {
        if (!pickupItemToReveal) return;
        setIsFinalizingPickup(true);
        
        setTimeout(() => {
            const id = pickupItemToReveal.id;
            setPickedUpIds(prev => new Set(prev).add(id));
            
            // Notification of successful pickup
            updateState(s => ({
                ...s,
                notificationToast: {
                    visible: true,
                    message: "CUSTODY_RELEASED",
                    amount: 0
                }
            }));
            
            setIsFinalizingPickup(false);
            setIsPickupQrModalOpen(false);
            setPickupItemToReveal(null);
        }, 1800);
    };

    const handleRateSubmission = () => {
        if (!selectedRentalToRate) return;
        setIsSubmittingRating(true);
        
        // Simulate tactical sync
        setTimeout(() => {
            setIsSubmittingRating(false);
            setIsRateModalOpen(false);
            
            const bonusBones = 5;
            updateState(s => ({
                ...s,
                home: {
                    ...s.home,
                    boneBalance: s.home.boneBalance + bonusBones
                },
                notificationToast: {
                    visible: true,
                    message: "RATING_PROTOCOL_SYNCED",
                    amount: bonusBones
                }
            }));
            
            setSelectedRentalToRate(null);
            setRatingComment('');
            setRatingScore(5);
        }, 1800);
    };

    const renderToggleRow = (options: string[], activeValue: string, key: 'activeCategory' | 'activeMode', width: string = '100%') => {
        return (
            <div style={{ width: width, margin: '0 auto 12px auto', background: '#0F0F0F', border: '1px solid #222', borderRadius: '40px', padding: '3px', display: 'flex', boxSizing: 'border-box' }}>
                {options.map(opt => {
                    const isActive = activeValue === opt;
                    return (
                        <div 
                            key={opt}
                            onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, [key]: opt as any } }))}
                            style={{
                                flex: 1, textAlign: 'center', padding: '12px 0', borderRadius: '30px', 
                                fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', letterSpacing: '1px', 
                                cursor: 'pointer', transition: 'all 0.25s', 
                                background: isActive ? '#CCFF00' : 'transparent', 
                                color: isActive ? '#000' : '#666', 
                                boxShadow: isActive ? '0 0 15px rgba(204, 255, 0, 0.4)' : 'none', 
                                fontWeight: isActive ? '800' : '700'
                            }}
                        >
                            {opt}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderRentalSubNav = () => {
        const tabs: { label: React.ReactNode, value: HubRentalSubTab }[] = [
            { label: 'PROCURE', value: 'PROCURE' },
            { label: <React.Fragment>MY<br />STOCK</React.Fragment>, value: 'MY_STOCK' },
            { label: <React.Fragment>MY<br />RENTALS</React.Fragment>, value: 'MY_RENTALS' },
            { label: <React.Fragment>HUB<br />CUSTODY</React.Fragment>, value: 'HUB_CUSTODY' },
            { label: 'REQUESTS', value: 'REQUESTS' }
        ];

        return (
            <div style={{ margin: '20px 0' }}>
                <div style={{ height: '1px', background: '#333', marginBottom: '15px' }}></div>
                <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'center', padding: '0 5px', justifyContent: 'center' }} className="no-scrollbar">
                    {tabs.map(tab => {
                        const isActive = hub.activeRentalSubTab === tab.value;
                        return (
                            <div 
                                key={tab.value}
                                onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, activeRentalSubTab: tab.value } }))}
                                style={{
                                    textAlign: 'center', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '11px', 
                                    color: isActive ? '#CCFF00' : '#888', cursor: 'pointer', lineHeight: '1.2', letterSpacing: '0.5px', 
                                    borderBottom: `2px solid ${isActive ? '#CCFF00' : 'transparent'}`, paddingBottom: '5px',
                                    transition: 'all 0.3s ease', whiteSpace: 'nowrap', flexShrink: 0
                                }}
                            >
                                {tab.label}
                            </div>
                        );
                    })}
                </div>
                <div style={{ height: '1px', background: '#333', marginTop: '15px' }}></div>
            </div>
        );
    };

    const renderMarketSubNav = () => {
        const tabs: { label: string, value: HubMarketSubTab }[] = [
            { label: 'MARKET', value: 'MARKET' },
            { label: 'MY STOCK', value: 'MY_STOCK' },
            { label: 'MY ORDERS', value: 'MY_ORDERS' }
        ];

        return (
            <div style={{ margin: '20px 0' }}>
                <div style={{ height: '1px', background: '#333', marginBottom: '15px' }}></div>
                <div style={{ display: 'flex', gap: '30px', padding: '0 10px', overflowX: 'auto', scrollbarWidth: 'none', justifyContent: 'center' }} className="no-scrollbar">
                    {tabs.map(tab => {
                        const isActive = hub.activeMarketSubTab === tab.value;
                        return (
                            <div 
                                key={tab.value}
                                onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, activeMarketSubTab: tab.value } }))}
                                style={{
                                    fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: '12px', 
                                    color: isActive ? '#fff' : '#666', cursor: 'pointer', paddingBottom: '10px',
                                    borderBottom: `3px solid ${isActive ? '#CCFF00' : 'transparent'}`,
                                    letterSpacing: '1px',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    whiteSpace: 'nowrap', flexShrink: 0
                                }}
                            >
                                {tab.label}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderBountySubNav = () => {
        const tabs: { label: string, value: HubBountySubTab }[] = [
            { label: 'Browse Feed', value: 'BROWSE' },
            { label: `Accepted ${hub.bountyData.accepted.length}/3`, value: 'ACCEPTED' },
            { label: 'My Posts', value: 'MY_POSTS' }
        ];

        return (
            <div style={{ margin: '20px 0' }}>
                <div style={{ height: '1px', background: '#333', marginBottom: '15px' }}></div>
                <div style={{ display: 'flex', gap: '25px', padding: '0 5px', overflowX: 'auto', scrollbarWidth: 'none', justifyContent: 'center' }} className="no-scrollbar">
                    {tabs.map(tab => {
                        const isActive = hub.activeBountySubTab === tab.value;
                        return (
                            <div 
                                key={tab.value}
                                onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, activeBountySubTab: tab.value } }))}
                                style={{
                                    fontFamily: "'Rajdhani', sans-serif", 
                                    fontWeight: 800, 
                                    fontSize: '16px', 
                                    color: isActive ? '#fff' : '#444', 
                                    cursor: 'pointer', 
                                    paddingBottom: '10px',
                                    borderBottom: `2px solid ${isActive ? '#CCFF00' : 'transparent'}`,
                                    letterSpacing: '0.5px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                    transformOrigin: 'bottom center',
                                    whiteSpace: 'nowrap', flexShrink: 0
                                }}
                            >
                                {tab.label}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderAiEditor = (formType: 'asset' | 'request') => {
        const currentImage = formType === 'asset' ? assetFormData.image : requestFormData.image;
        if (!currentImage) return null;

        return (
            <div className="mt-4 bg-zinc-950 p-4 border border-zinc-800 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-raj font-black tracking-widest text-zinc-500 uppercase">AI_MEDIA_ENHANCEMENT</span>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Add retro filter, fix lighting..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white font-inter text-[12px] outline-none focus:border-[#CCFF00]"
                    />
                    <button 
                        disabled={isAiEditing || !aiPrompt}
                        onClick={() => handleAiImageEdit(formType)}
                        className="bg-[#CCFF00] text-black px-4 py-2 rounded-xl font-raj font-bold text-[10px] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isAiEditing ? <Loader2 size={12} className="animate-spin" /> : 'OVERRIDE'}
                    </button>
                </div>
            </div>
        );
    };

    const renderRequestToRentModal = () => {
        if (!isRequestProtocolOpen || !hub.selectedRentalItem) return null;
        const item = hub.selectedRentalItem;

        return (
            <div className="fixed inset-0 z-[7000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-3xl font-raj relative">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></div>
                            <h2 className="text-[#00E5FF] font-black text-lg tracking-widest italic uppercase">REQUEST_PROTOCOL</h2>
                        </div>
                        <button onClick={() => setIsRequestProtocolOpen(false)} className="text-zinc-600 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {!requestSuccess ? (
                            <>
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-full mx-auto flex items-center justify-center text-zinc-700">
                                        <ShieldQuestion size={40} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-white font-bold text-xl uppercase tracking-tight">{item.name}</div>
                                        <div className="text-zinc-500 font-bold text-[10px] tracking-widest uppercase italic">MANUAL_CLEARANCE_REQUIRED</div>
                                    </div>
                                </div>

                                <div className="bg-[#1A1100] border border-[#FF9900]/30 rounded-2xl p-5 space-y-4 shadow-inner">
                                    <div className="flex items-center gap-3 text-[#FF9900]">
                                        <UserSearch size={20} />
                                        <span className="font-black text-[12px] tracking-[0.2em] uppercase italic">TRUST_THRESHOLD_CHECK</span>
                                    </div>
                                    <p className="text-[#FF9900]/80 text-[11px] leading-relaxed italic">
                                        Your Node Trust Score (<span className="text-white font-bold">{user.trustScore}%</span>) is below the <span className="text-white font-bold">75% Trusted Threshold</span>. Access to high-value assets requires a manual review cycle from the asset owner.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-zinc-500 px-1">
                                        <Timer size={14} />
                                        <span className="text-[10px] font-bold tracking-widest uppercase">ESTIMATED_RESPONSE_TIME: ~15-30M</span>
                                    </div>
                                    <button 
                                        disabled={isSendingRequest}
                                        onClick={handleSendRentalRequest}
                                        className="w-full py-5 bg-[#00E5FF] text-black rounded-2xl font-black text-sm tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        {isSendingRequest ? (
                                            <><Loader2 size={18} className="animate-spin" /> TRANSMITTING...</>
                                        ) : (
                                            <><Upload size={18} /> SEND RENTAL UPLINK</>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-10 text-center space-y-6 animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-[#00E5FF]/10 border-2 border-[#00E5FF]/40 rounded-full flex items-center justify-center text-[#00E5FF] mx-auto shadow-[0_0_40px_rgba(0,229,255,0.1)]">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-white font-black text-2xl uppercase italic tracking-tighter">UPLINK_COMMITTED</h3>
                                    <p className="text-zinc-500 font-inter text-sm max-w-[240px] mx-auto leading-relaxed">
                                        Manual review protocol initiated. {item.owner} has been notified of your request.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-8 pb-8 text-center">
                        <span className="text-zinc-800 font-data text-[7px] tracking-[0.5em] uppercase">SECURE_NODE_77 // GSD_OS</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderRentalModal = () => {
        if (!hub.isRentalModalOpen || !hub.selectedRentalItem) return null;
        const item = hub.selectedRentalItem;
        const totalCost = item.rate * rentalDuration;
        const estimatedReward = Math.floor(totalCost * 0.10);
        
        // UPI INTENT INTEGRATION: Replacing QR with Deep Link logic
        const upiId = `${item.owner.replace('@', '').toLowerCase()}@okaxis`;

        return (
            <div className="fixed inset-0 z-[7000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-[380px] bg-[#141414] border border-[#1F1F1F] rounded-3xl overflow-hidden flex flex-col shadow-[0_40px_100px_rgba(0,0,0,1)] max-h-[92vh] font-raj relative">
                    <div className="p-5 flex justify-between items-center bg-[#141414] border-b border-white/5 sticky top-0 z-10">
                        <div className="flex-1 text-center">
                            <h2 className="text-white font-black text-lg italic tracking-[0.1em] uppercase">DEPLOYMENT PROTOCOL</h2>
                        </div>
                        <button onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, isRentalModalOpen: false } }))} className="absolute right-5 text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                        <div className="bg-[#1F1F1F] rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#FF9900] rounded-xl flex items-center justify-center shadow-lg"><Camera size={32} className="text-black" /></div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg leading-tight uppercase">{item.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <UserAvatar name={item.owner} size="xs" />
                                    <div className="text-zinc-500 font-raj font-bold text-[11px] tracking-widest uppercase">BASE_RATE: {formatCurrency(item.rate)}/hr</div>
                                </div>
                            </div>
                        </div>

                        {/* Rental Time Selector */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase px-1">RENTAL_DURATION (HOURS)</label>
                            <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                                <button 
                                    onClick={() => setRentalDuration(prev => Math.max(1, prev - 1))}
                                    className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#CCFF00] hover:bg-zinc-800 transition-all active:scale-90"
                                >
                                    <Minus size={20} />
                                </button>
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-data font-black text-white tabular-nums leading-none">{rentalDuration}</span>
                                    <span className="text-[8px] font-raj font-bold text-zinc-600 tracking-[0.3em] uppercase mt-1">HOURS_SECURED</span>
                                </div>
                                <button 
                                    onClick={() => setRentalDuration(prev => Math.min(48, prev + 1))}
                                    className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#CCFF00] hover:bg-zinc-800 transition-all active:scale-90"
                                >
                                    <PlusIcon size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">FINANCIAL_SETTLEMENT</label>
                                <div className="text-[#CCFF00] font-data font-bold text-sm tracking-tighter uppercase">TOTAL: {formatCurrency(totalCost)}</div>
                            </div>
                            
                            {/* UPDATED UPI INTENT UI */}
                            <div className="bg-[#1F1F1F] rounded-2xl p-6 flex flex-col items-center gap-4">
                                <button 
                                    onClick={() => {
                                        setIsGPaySheetOpen(true);
                                    }}
                                    className={`w-full h-16 rounded-xl font-raj font-black text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${
                                        paymentInitiated 
                                        ? 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]' 
                                        : 'bg-white text-black hover:bg-[#CCFF00]'
                                    }`}
                                >
                                    <Smartphone size={24} /> 
                                    {paymentInitiated ? 'RE-OPEN UPI APP' : 'PAY VIA UPI APP'}
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    <UserAvatar name={item.owner} size="xs" />
                                    <div className="text-[#A1A1AA] font-data text-xs font-bold tracking-widest uppercase">RECEIVER: <span className="text-white">{upiId}</span></div>
                                </div>
                                
                                <div className="text-[#A1A1AA] font-inter text-[10px] text-center opacity-60 italic leading-snug">
                                    Tap to open your preferred UPI app (GPay, PhonePe, etc.)<br/>
                                    Pre-filled amount: <span className="text-[#CCFF00] font-bold">{formatCurrency(totalCost)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#4D1111] border border-[#7D1D1D] rounded-2xl p-5 space-y-4">
                            <div className="flex items-center gap-2 text-[#FF4D4D]"><AlertTriangle size={18} fill="currentColor" className="text-[#4D1111]" /><span className="font-bold text-[13px] tracking-widest uppercase italic">PENALTY PROTOCOL (STRICT)</span></div>
                            <ul className="space-y-3 px-1">
                                <li className="flex items-start gap-2.5"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] mt-1.5"></div><div className="text-[#FF4D4D] text-[12px] font-bold tracking-tight"><span className="font-black italic mr-1">T+0h (Late):</span> Fine of 10 Bones/hr + {formatCurrency(5)}/hr.</div></li>
                                <li className="flex items-start gap-2.5"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] mt-1.5"></div><div className="text-[#FF4D4D] text-[12px] font-bold tracking-tight"><span className="font-black italic mr-1">T+24h (Critical):</span> Fine of 20 Bones/hr + {formatCurrency(10)}/hr.</div></li>
                                <li className="flex items-start gap-2.5"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] mt-1.5"></div><div className="text-[#FF4D4D] text-[12px] font-bold tracking-tight leading-snug"><span className="font-black italic mr-1">T+7 Days (Breach):</span> <span className="underline decoration-wavy">PERMANENT ACCOUNT BAN</span>.<br/><span className="opacity-80">Unban Fee: {formatCurrency(1000)} payable to Hub Manager.</span></div></li>
                            </ul>
                        </div>
                        <div className="flex items-start gap-4 p-2 cursor-pointer group" onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, rentalCheckbox: !s.hub.rentalCheckbox } }))}>
                            <div className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center transition-all shrink-0 ${hub.rentalCheckbox ? 'bg-zinc-800 border-[#CCFF00]' : 'bg-transparent border-zinc-800 group-hover:border-zinc-700'}`}>{hub.rentalCheckbox && <Check size={16} className="text-[#CCFF00] stroke-[4px]" />}</div>
                            <span className="text-[12px] font-medium text-zinc-500 leading-tight select-none">I acknowledge the fines and accept full liability for this asset for the duration of {rentalDuration} hour{rentalDuration > 1 ? 's' : ''}.</span>
                        </div>
                    </div>
                    <div className="p-5 bg-[#141414] border-t border-white/5 sticky bottom-0 z-10 flex flex-col gap-3">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-zinc-600 font-raj font-bold text-[10px] tracking-[0.2em] uppercase">ESTIMATED_BONE_REWARD</span>
                            <span className="text-[#CCFF00] font-raj font-bold text-lg">+{estimatedReward} <span className="text-[#CCFF00]/40">🦴</span></span>
                        </div>
                        <button 
                            disabled={!hub.rentalCheckbox || isProcessingRental || !paymentInitiated} 
                            onClick={handleConfirmRental} 
                            className={`w-full h-14 rounded-xl font-raj font-black text-sm tracking-[0.1em] uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                                (!hub.rentalCheckbox || !paymentInitiated) 
                                ? 'bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed border border-zinc-800' 
                                : 'bg-[#CCFF00] text-black hover:bg-[#DFFF33] shadow-[#CCFF00]/10'
                            }`}
                        >
                            {isProcessingRental ? <><Loader2 size={18} className="animate-spin" /> EXECUTING...</> : 'CONFIRM RENTAL'}
                        </button>
                        {!paymentInitiated && hub.rentalCheckbox && (
                            <p className="text-center text-[9px] font-raj font-bold text-[#FF4D4D] tracking-widest uppercase animate-pulse">INITIATE_UPI_PAYMENT_FIRST</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders a modal to view and accept/decline offers for a bounty.
     * Refined layout for better fit and readability.
     */
    const renderOffersModal = () => {
        if (!hub.isOffersModalOpen || !hub.selectedBountyForOffers) return null;
        const bounty = hub.selectedBountyForOffers;
        const offers = bounty.offers || [];

        return (
            <div className="fixed inset-0 z-[7500] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                <div className="w-full max-w-[420px] bg-[#0A0A0A] border border-[#1A1A1A] rounded-[2.5rem] p-6 sm:p-8 shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden max-h-[85vh] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="font-raj font-bold text-[#FFD700] text-[10px] tracking-[0.4em] uppercase italic">OFFER_PANEL</div>
                            <h2 className="text-white font-raj font-bold text-xl uppercase tracking-tighter mt-1 truncate max-w-[280px]">{bounty.title}</h2>
                        </div>
                        <button onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, isOffersModalOpen: false, selectedBountyForOffers: null } }))} className="text-zinc-700 hover:text-white transition-colors p-2 -mr-2">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                        {offers.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-zinc-900 rounded-3xl">
                                <Inbox size={32} className="mx-auto text-zinc-800 mb-3" />
                                <p className="text-zinc-600 font-raj text-[11px] tracking-widest uppercase italic">NO_ACTIVE_OFFERS</p>
                            </div>
                        ) : (
                            offers.map(offer => {
                                const isPriorityMatch = offer.rating === '100%' || (offer.bid !== undefined && offer.bid < bounty.reward);
                                
                                return (
                                    <div key={offer.id} className={`bg-zinc-900/40 border p-4 rounded-2xl space-y-4 transition-all ${isPriorityMatch ? 'border-[#00E5FF]/40 shadow-[inset_0_0_209px_rgba(0,229,255,0.05)]' : 'border-zinc-800'}`}>
                                        <div className="flex justify-between items-start gap-3">
                                            <div 
                                                className="flex gap-3 cursor-pointer hover:brightness-125 transition-all flex-1 min-w-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewProfile?.(offer.user, 'ID-' + offer.user);
                                                }}
                                            >
                                                <UserAvatar name={offer.user} size="md" className="shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex wrap items-center gap-1.5 mb-1">
                                                        <div className="text-white font-raj font-bold text-sm truncate">{offer.user}</div>
                                                        {isPriorityMatch && (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded text-[7px] font-raj font-black text-[#00E5FF] uppercase tracking-widest animate-pulse whitespace-nowrap">PRIORITY_MATCH</div>
                                                        )}
                                                    </div>
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/40 border border-zinc-800 rounded-[4px]">
                                                        <ShieldCheck size={10} className="text-[#CCFF00]" />
                                                        <div className="text-[#CCFF00] font-raj font-black text-[9px] tracking-widest uppercase italic">TRUST: {offer.rating}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-[#CCFF00] font-raj font-bold text-xl leading-none">{formatCurrency(offer.bid || bounty.reward)}</div>
                                                {offer.bid !== undefined && offer.bid < bounty.reward && (
                                                    <div className="text-[#00E5FF] font-data text-[7px] font-bold mt-1 uppercase tracking-tighter">SAVING: {formatCurrency(bounty.reward - offer.bid)}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-black/30 border border-zinc-800/20 rounded-xl p-3">
                                            <p className="text-zinc-400 font-inter text-[12px] leading-relaxed italic">"{offer.message}"</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleDeclineOffer(bounty.id, offer.id)} className="flex-1 bg-zinc-950 border border-zinc-800 text-red-500 py-2.5 rounded-xl font-raj font-bold text-[8px] tracking-widest uppercase active:scale-95">DECLINE</button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedBountyForNegotiation(bounty);
                                                    setNegotiateMode('RENEGOTIATE');
                                                    setNegotiateFormData({ proposedReward: (offer.bid || bounty.reward).toString(), message: '' });
                                                    setIsNegotiateModalOpen(true);
                                                }}
                                                className="flex-1 bg-zinc-950 border border-zinc-800 text-white py-2.5 rounded-xl font-raj font-bold text-[8px] tracking-widest uppercase active:scale-95 transition-all hover:border-[#CCFF00]/40 flex items-center justify-center gap-1"
                                            >
                                                <Gavel size={10} /> RENEGOTIATE
                                            </button>
                                            <button 
                                                disabled={!!processingOfferId}
                                                onClick={() => handleAcceptOffer(bounty, offer)}
                                                className={`flex-[2] py-2.5 rounded-xl font-raj font-black text-[8px] tracking-widest uppercase active:scale-95 shadow-lg flex items-center justify-center gap-1.5 transition-all ${
                                                    isPriorityMatch 
                                                    ? 'bg-[#00E5FF] text-black shadow-[#00E5FF]/20 hover:brightness-110' 
                                                    : 'bg-[#CCFF00] text-black shadow-[#CCFF00]/10 hover:bg-[#DFFF33]'
                                                }`}
                                            >
                                                {processingOfferId === offer.id ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : isPriorityMatch ? (
                                                    <><ZapIcon size={12} fill="currentColor" /> QUICK_ACCEPT</>
                                                ) : (
                                                    <><Check size={12} strokeWidth={4} /> APPROVE</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center text-[9px] font-raj font-bold text-zinc-600 uppercase tracking-widest italic">
                        <span>MISSION_ID: {bounty.id}</span>
                        <span>NODE_UPLINK: 0x77_STABLE</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderMissionDetailsModal = () => {
        if (!isMissionDetailsModalOpen || !selectedBountyForDetails) return null;
        const bounty = selectedBountyForDetails;

        return (
            <div className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-[#1A1A1A] rounded-[3rem] p-8 shadow-3xl relative overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center mb-8 shrink-0">
                        <div>
                            <div className="text-[#00E5FF] font-raj font-black text-[8px] tracking-[0.4em] uppercase italic">MISSION_DOSSIER</div>
                            <h2 className="text-white font-raj font-black text-2xl uppercase tracking-tighter mt-1 italic leading-none">{bounty.title}</h2>
                        </div>
                        <button onClick={() => setIsMissionDetailsModalOpen(false)} className="text-zinc-700 hover:text-white transition-colors active:scale-90">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-6 no-scrollbar pb-6">
                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#111] border border-zinc-900 rounded-2xl p-4">
                                <div className="text-zinc-600 font-raj font-bold text-[8px] tracking-widest uppercase mb-1 flex items-center gap-1.5"><Database size={10} /> CATEGORY</div>
                                <div className="text-white font-raj font-bold text-xs uppercase">{bounty.category}</div>
                            </div>
                            <div 
                                className="bg-[#111] border border-zinc-900 rounded-2xl p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                                onClick={() => onViewProfile?.(bounty.creator, 'ID-' + bounty.creator)}
                            >
                                <div className="text-zinc-600 font-raj font-bold text-[8px] tracking-widest uppercase mb-1 flex items-center gap-1.5"><Target size={10} /> OPERATIVE</div>
                                <div className="flex items-center gap-2">
                                    <UserAvatar name={bounty.creator} size="xs" />
                                    <div className="text-[#CCFF00] font-raj font-bold text-xs uppercase">{bounty.creator}</div>
                                </div>
                            </div>
                        </div>

                        {/* Availability Section for Guidance */}
                        {bounty.timeSlots && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <Calendar size={14} className="text-[#CCFF00]" />
                                    <span className="text-zinc-500 font-raj font-bold text-[10px] tracking-[0.3em] uppercase italic">AVAILABILITY_SLOTS</span>
                                </div>
                                <div className="bg-[#CCFF00]/5 border border-[#CCFF00]/20 rounded-2xl p-4">
                                    <div className="text-white font-data text-xs font-bold tracking-tight leading-relaxed italic">
                                        "{bounty.timeSlots}"
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Intelligence Feed */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <FileSearch size={14} className="text-[#00E5FF]" />
                                <span className="text-zinc-500 font-raj font-bold text-[10px] tracking-[0.3em] uppercase italic">INTELLIGENCE_STREAM</span>
                            </div>
                            <div className="bg-[#080808] border border-zinc-900 rounded-3xl p-6 relative">
                                <div className="absolute top-4 right-4 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]"></div>
                                </div>
                                <p className="text-zinc-400 font-inter text-[13px] leading-relaxed italic mb-4">
                                    "{bounty.description}"
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-11px font-raj font-bold text-zinc-300 uppercase tracking-widest">Phase 1: Initial Analysis</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-11px font-raj font-bold text-zinc-300 uppercase tracking-widest">Phase 2: Tactical Execution</span>
                                    </div>
                                    <div className="flex items-center gap-3 opacity-40">
                                        <span className="text-11px font-raj font-bold text-zinc-600 uppercase tracking-widest">Phase 3: Final Submission</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Protocol */}
                        <div className="bg-[#002233]/20 border border-[#00E5FF]/20 rounded-2xl p-5 flex items-start gap-4">
                            <Fingerprint size={20} className="text-[#00E5FF] shrink-0" />
                            <div>
                                <div className="text-[#00E5FF] font-raj font-black text-[9px] tracking-widest uppercase mb-1">SECURITY_PROTOCOL_0x77</div>
                                <p className="text-[#00E5FF]/60 text-10px font-inter leading-tight">
                                    All mission data is encrypted and tied to your node profile. Late submission triggers trust degradation.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsMissionDetailsModalOpen(false)} 
                        className="w-full bg-[#00E5FF] text-black py-4 rounded-xl font-raj font-black text-xs tracking-widest uppercase hover:bg-[#00f3ff] transition-all shadow-xl shadow-[#00E5FF]/10 active:scale-95"
                    >
                        ACKNOWLEDGE_MISSION
                    </button>
                </div>
            </div>
        );
    };

    /**
     * Renders a modal to confirm acquisition of a market item.
     */
    const renderMarketPurchaseModal = () => {
        if (!hub.isMarketPurchaseModalOpen || !hub.selectedMarketStockItem) return null;
        const item = hub.selectedMarketStockItem;

        return (
            <div className="fixed inset-0 z-[7500] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-full max-w-[360px] bg-[#0A0A0A] border border-[#1A1A1A] rounded-[2.5rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <div className="font-raj font-bold text-[#00E5FF] text-[10px] tracking-[0.4em] uppercase italic">MARKET_ACQUISITION</div>
                            <h2 className="text-white font-raj font-bold text-xl uppercase tracking-tighter mt-1">{item.name}</h2>
                        </div>
                        <button onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, isMarketPurchaseModalOpen: false, selectedMarketStockItem: null } }))} className="text-zinc-700 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="bg-zinc-900/30 rounded-3xl p-6 mb-8 text-center space-y-4">
                        <div className="w-20 h-20 bg-zinc-900 mx-auto rounded-2xl flex items-center justify-center text-zinc-800">
                            <ShoppingBag size={40} />
                        </div>
                        <div>
                            <div className="text-zinc-600 font-data text-[9px] uppercase tracking-widest mb-1">CONDITION</div>
                            <div className="text-white font-raj font-bold text-xs uppercase tracking-widest">{item.condition}</div>
                        </div>
                        <div className="pt-2">
                            <div className="text-zinc-600 font-data text-[9px] uppercase tracking-widest mb-1">FINAL_PRICE</div>
                            <div className="text-[#CCFF00] font-raj font-bold text-3xl">{formatCurrency(item.price)}</div>
                        </div>
                    </div>

                    <div className="bg-[#1A1100] border border-[#3D2C00] rounded-2xl p-5 mb-8 flex items-start gap-4">
                        <ShieldAlert size={18} className="text-[#FF9900] shrink-0 mt-0.5" />
                        <div className="text-[#FF9900] text-10px font-inter leading-relaxed opacity-80 italic">
                            MARKET_NOTICE: All sales are final once verified. Hub custody fee of {formatCurrency(25)} applies.
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            const receiptMeta = {
                                transactionId: 'MKT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                                method: 'HUB_WALLET',
                                authCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
                                timestamp: new Date().toISOString(),
                                deviceSignature: 'GSD_MARKET_01'
                            };
                            
                            updateState(s => ({
                                ...s,
                                hub: {
                                    ...s.hub,
                                    isMarketPurchaseModalOpen: false,
                                    selectedMarketStockItem: null,
                                    activeMarketSubTab: 'MY_ORDERS',
                                    marketData: {
                                        ...s.hub.marketData,
                                        orders: [{
                                            id: receiptMeta.transactionId,
                                            name: item.name,
                                            price: item.price,
                                            status: 'VERIFYING',
                                            seller: '@MARKET',
                                            arrival: 'Est: 3h'
                                        }, ...s.hub.marketData.orders]
                                    }
                                }
                            }));
                            processTransactionSuccess(user.id, item.price, `Market Purchase: ${item.name}`, receiptMeta);
                        }}
                        className="w-full bg-[#00E5FF] text-black py-5 rounded-2xl font-raj font-bold text-sm tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                    >
                        <ShoppingCart size={18} /> CONFIRM_ACQUISITION
                    </button>
                </div>
            </div>
        );
    };

    /**
     * Renders a modal to initiate negotiation for a mission.
     */
    const renderNegotiateModal = () => {
        if (!isNegotiateModalOpen || !selectedBountyForNegotiation) return null;
        const bounty = selectedBountyForNegotiation;
        const currentProposal = parseInt(negotiateFormData.proposedReward);
        
        // Mode specific validation: Lowering price is only allowed during RENEGOTIATE
        const isProposalValid = negotiationMode === 'RENEGOTIATE' 
            ? (!isNaN(currentProposal) && currentProposal > 0)
            : (!isNaN(currentProposal) && currentProposal >= bounty.reward);

        return (
            <div className="fixed inset-0 z-[8000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-full max-w-[400px] bg-[#0A0A0A] border border-zinc-900 rounded-[3rem] p-10 shadow-3xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-50"></div>
                    
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <div className="text-[#00E5FF] font-raj font-black text-[9px] tracking-[0.4em] uppercase italic">{negotiationMode}_UPLINK</div>
                            <h2 className="text-white font-raj font-black text-2xl uppercase tracking-tighter mt-1 italic">PROPOSE_REWARD</h2>
                        </div>
                        <button onClick={() => setIsNegotiateModalOpen(false)} className="text-zinc-700 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 mb-8 text-center space-y-4">
                         <div>
                            <div className="text-zinc-600 font-raj font-bold text-[10px] tracking-[0.3em] uppercase mb-1">REFERENCE_REWARD</div>
                            <div className="text-white font-raj font-bold text-2xl">{formatCurrency(bounty.reward)}</div>
                         </div>
                         <div className="w-[1px] h-8 bg-zinc-800 mx-auto"></div>
                         <div className="space-y-3">
                            <div className="text-[#00E5FF] font-raj font-black text-[10px] tracking-[0.3em] uppercase">YOUR_PROPOSAL (₹)</div>
                            <input 
                                type="number" 
                                min={negotiationMode === 'NEGOTIATE' ? bounty.reward : 1}
                                placeholder={bounty.reward.toString()}
                                value={negotiateFormData.proposedReward}
                                onChange={(e) => setNegotiateFormData({...negotiateFormData, proposedReward: e.target.value})}
                                className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-6 text-center text-3xl font-raj font-black text-[#CCFF00] outline-none focus:border-[#00E5FF] transition-all placeholder:text-zinc-900"
                            />
                            {negotiationMode === 'NEGOTIATE' && !isProposalValid && negotiateFormData.proposedReward !== '' && (
                                <div className="text-red-500 font-raj font-bold text-[9px] tracking-widest uppercase">MINIMUM: {formatCurrency(bounty.reward)}</div>
                            )}
                            {negotiationMode === 'RENEGOTIATE' && isProposalValid && currentProposal < bounty.reward && (
                                <div className="text-[#CCFF00] font-raj font-bold text-[9px] tracking-widest uppercase animate-pulse">PROTOCOL: PROPOSING LOWER VALUE</div>
                            )}
                         </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <label className="text-zinc-700 font-raj font-black text-[10px] tracking-[0.4em] uppercase px-1">SECURE_COMMS</label>
                        <textarea 
                            rows={3}
                            placeholder="State your reason for reward adjustment..."
                            value={negotiateFormData.message}
                            onChange={(e) => setNegotiateFormData({...negotiateFormData, message: e.target.value})}
                            className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-6 text-white font-inter text-sm outline-none focus:border-[#00E5FF] transition-all resize-none placeholder:text-zinc-900"
                        />
                    </div>

                    <div className="bg-[#002233] border border-[#00E5FF]/20 p-5 rounded-2xl mb-8 flex items-start gap-4">
                        <ShieldCheck size={18} className="text-[#00E5FF] shrink-0 mt-0.5" />
                        <p className="text-[#00E5FF] text-[10px] font-inter italic leading-relaxed opacity-80 uppercase">
                            HUB_PROTOCOL: {negotiationMode === 'NEGOTIATE' 
                                ? 'Initial negotiation requires reward floor of base value.' 
                                : 'Renegotiation mode allows bid reduction for high-efficiency operatives.'}
                        </p>
                    </div>

                    <button 
                        disabled={isUplinkingOffer || !isProposalValid || !negotiateFormData.proposedReward}
                        onClick={handleSendOffer}
                        className="w-full bg-[#00E5FF] text-black py-5 rounded-2xl font-raj font-black text-sm tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                    >
                        {isUplinkingOffer ? (
                            <><Loader2 size={18} className="animate-spin" /> UPLINKING_OFFER...</>
                        ) : (
                            <><Send size={18} /> TRANSMIT_PROPOSAL</>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    const renderPaymentPendingModal = () => {
        if (!showPaymentPending) return null;
        return (
            <div className="fixed inset-0 z-[10000] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                <div className="w-full max-w-[360px] bg-[#0A0A0A] border border-[#CCFF00]/30 rounded-[3rem] p-10 shadow-[0_0_80px_rgba(204,255,0,0.15)] relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent opacity-60"></div>
                    
                    <div className="w-20 h-20 bg-[#CCFF00]/10 border-2 border-[#CCFF00]/40 rounded-full flex items-center justify-center text-[#CCFF00] mb-8 shadow-[0_0_30px_rgba(204,255,0,0.2)]">
                        <CreditCard size={40} />
                    </div>

                    <div className="text-[#CCFF00] font-raj font-black text-[10px] tracking-[0.4em] uppercase italic mb-3">SETTLEMENT_INITIALIZED</div>
                    <h2 className="text-white font-raj font-black text-3xl uppercase tracking-tighter leading-none mb-6">UPLINK_PENDING</h2>
                    
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8 w-full">
                        <p className="text-zinc-400 font-inter text-[14px] leading-relaxed italic">
                            Bounty settlement has been authorized by the hub core. Funds will be synced to your node within <span className="text-[#CCFF00] font-bold">24 hours</span>.
                        </p>
                    </div>

                    <button 
                        onClick={() => setShowPaymentPending(false)}
                        className="w-full bg-[#CCFF00] text-black py-4 rounded-xl font-raj font-black text-xs tracking-widest uppercase shadow-xl hover:bg-[#DFFF33] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        ACKNOWLEDGE_UPLINK
                    </button>
                </div>
            </div>
        );
    };

    /* Definitions of missing modal rendering functions */
    const renderListAssetModal = () => {
        if (!hub.isListAssetModalOpen) return null;
        return (
            <div className="fixed inset-0 z-[7000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
                <div className="w-full max-w-[400px] bg-[#0A0A0A] border border-[#1A1A1A] rounded-[2.5rem] p-8 shadow-2xl relative">
                    <button onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, isListAssetModalOpen: false } }))} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><X size={24} /></button>
                    <h2 className="text-white font-raj font-bold text-xl uppercase mb-6">List New Asset</h2>
                    <div className="space-y-4">
                        <input type="text" placeholder="Asset Name" value={assetFormData.name} onChange={e => setAssetFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#CCFF00]" />
                        <input type="number" placeholder="Rate (₹/hr)" value={assetFormData.rate} onChange={e => setAssetFormData(prev => ({ ...prev, rate: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#CCFF00]" />
                        <textarea placeholder="Description" value={assetFormData.description} onChange={e => setAssetFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#CCFF00]" rows={3} />
                        <div className="flex flex-col items-center p-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/50">
                            {assetFormData.image ? (
                                <div className="relative w-full h-32 mb-2">
                                    <img src={assetFormData.image} className="w-full h-full object-cover rounded-lg" />
                                    <button onClick={() => setAssetFormData(prev => ({ ...prev, image: null }))} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full"><X size={14} /></button>
                                </div>
                            ) : (
                                <button onClick={() => assetImageRef.current?.click()} className="flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-300">
                                    <ImageIcon size={32} />
                                    <span className="text-[10px] font-raj font-bold uppercase tracking-widest">UPLOAD_MEDIA</span>
                                </button>
                            )}
                            <input type="file" ref={assetImageRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'asset')} />
                        </div>
                        {renderAiEditor('asset')}
                        <button disabled={isSubmittingForm} onClick={handleListAsset} className="w-full bg-[#CCFF00] text-black py-4 rounded-xl font-raj font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            {isSubmittingForm ? <Loader2 size={16} className="animate-spin" /> : 'DEPLOY_LISTING'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderUploadRequestModal = () => {
        if (!hub.isUploadRequestModalOpen) return null;
        return (
            <div className="fixed inset-0 z-[7000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
                <div className="w-full max-w-[400px] bg-[#0A0A0A] border border-[#1A1A1A] rounded-[2.5rem] p-8 shadow-2xl relative">
                    <button onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, isUploadRequestModalOpen: false } }))} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><X size={24} /></button>
                    <h2 className="text-white font-raj font-bold text-xl uppercase mb-6">Upload Request</h2>
                    <div className="space-y-4">
                        <input type="text" placeholder="Item Requested" value={requestFormData.name} onChange={e => setRequestFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#CCFF00]" />
                        <input type="text" placeholder="Budget (₹/hr)" value={requestFormData.budget} onChange={e => setRequestFormData(prev => ({ ...prev, budget: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#CCFF00]" />
                        <div className="flex flex-col items-center p-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/50">
                            {requestFormData.image ? (
                                <div className="relative w-full h-32 mb-2">
                                    <img src={requestFormData.image} className="w-full h-full object-cover rounded-lg" />
                                    <button onClick={() => setRequestFormData(prev => ({ ...prev, image: null }))} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full"><X size={14} /></button>
                                </div>
                            ) : (
                                <button onClick={() => requestImageRef.current?.click()} className="flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-300">
                                    <ImageIcon size={32} />
                                    <span className="text-[10px] font-raj font-bold uppercase tracking-widest">UPLOAD_REFERENCE</span>
                                </button>
                            )}
                            <input type="file" ref={requestImageRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'request')} />
                        </div>
                        {renderAiEditor('request')}
                        <button disabled={isSubmittingForm} onClick={handleUploadRequest} className="w-full bg-[#00E5FF] text-black py-4 rounded-xl font-raj font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            {isSubmittingForm ? <Loader2 size={16} className="animate-spin" /> : 'BROADCAST_REQUEST'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderCreateBountyModal = () => {
        if (!isCreateBountyModalOpen) return null;

        const toggleDay = (day: string) => {
            setSelectedDays(prev => 
                prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
            );
        };

        const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

        return (
            <div className="fixed inset-0 z-[8000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
                <div className="w-full max-w-[420px] bg-[#0A0A0A] border border-[#1A1A1A] rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden">
                    
                    {/* Sticky Modal Header */}
                    <div className="sticky top-0 bg-[#0A0A0A] px-8 pt-8 pb-4 flex justify-between items-start z-10 border-b border-zinc-900/50">
                        <div>
                            <div className="text-[#CCFF00] font-raj font-black text-[9px] tracking-[0.4em] uppercase italic">MISSION_UPLINK</div>
                            <h2 className="text-white font-raj font-bold text-xl uppercase">Post New Mission</h2>
                        </div>
                        <button 
                            onClick={() => setIsCreateBountyModalOpen(false)} 
                            className="text-zinc-600 hover:text-white p-1 -mr-2 transition-colors active:scale-90"
                            aria-label="Close interface"
                        >
                            <X size={28} />
                        </button>
                    </div>
                    
                    {/* Scrollable Modal Content */}
                    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 no-scrollbar">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-raj font-bold text-zinc-600 tracking-widest uppercase px-1">MISSION_TITLE</label>
                            <input type="text" placeholder="Ex: Solve Calculus Worksheet" value={bountyFormData.title} onChange={e => setBountyFormData(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#CCFF00] font-raj font-bold tracking-wide" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-raj font-bold text-zinc-600 tracking-widest uppercase px-1">TOTAL_REWARD (₹)</label>
                                <input type="number" placeholder="500" value={bountyFormData.reward} onChange={e => setBountyFormData(prev => ({ ...prev, reward: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#CCFF00] font-data font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-raj font-bold text-zinc-600 tracking-widest uppercase px-1">CATEGORY</label>
                                <select 
                                    value={bountyFormData.category} 
                                    onChange={e => setBountyFormData(prev => ({ ...prev, category: e.target.value as BountyCategory }))}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#CCFF00] font-raj font-bold appearance-none"
                                >
                                    <option value="WRITTEN_WORK">WRITTEN_WORK</option>
                                    <option value="PROJECT_WORK">PROJECT_WORK</option>
                                    <option value="GUIDANCE">GUIDANCE</option>
                                    <option value="OTHER">OTHER</option>
                                </select>
                            </div>
                        </div>

                        {/* Availability Selector - Conditional for GUIDANCE */}
                        {bountyFormData.category === 'GUIDANCE' && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 bg-zinc-950/50 p-4 border border-zinc-900 rounded-2xl">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-raj font-bold text-[#CCFF00] tracking-widest uppercase px-1">AVAILABILITY_DAYS</label>
                                    <div className="flex justify-between gap-1">
                                        {days.map(day => {
                                            const isActive = selectedDays.includes(day);
                                            return (
                                                <button 
                                                    key={day}
                                                    onClick={() => toggleDay(day)}
                                                    className={`w-10 h-10 rounded-lg font-raj font-black text-[9px] transition-all border ${
                                                        isActive 
                                                        ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_10px_#CCFF0044]' 
                                                        : 'bg-black text-zinc-600 border-zinc-800 hover:border-zinc-700'
                                                    }`}
                                                >
                                                    {day.substring(0, 1)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-raj font-bold text-zinc-600 tracking-widest uppercase px-1">START_TIME</label>
                                        <input 
                                            type="time" 
                                            value={startTime} 
                                            onChange={e => setStartTime(e.target.value)}
                                            className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-3 text-white outline-none focus:border-[#CCFF00] font-data font-bold text-sm color-scheme-dark"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-raj font-bold text-zinc-600 tracking-widest uppercase px-1">END_TIME</label>
                                        <input 
                                            type="time" 
                                            value={endTime} 
                                            onChange={e => setEndTime(e.target.value)}
                                            className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-3 text-white outline-none focus:border-[#CCFF00] font-data font-bold text-sm color-scheme-dark"
                                        />
                                    </div>
                                </div>
                                <div className="px-2 pt-1">
                                    <div className="text-[#CCFF00] font-data text-[9px] tracking-widest uppercase opacity-60 italic">PROTOCOL_SLOT: {bountyFormData.timeSlots || 'NONE_SECURED'}</div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-raj font-bold text-zinc-600 tracking-widest uppercase">BRIEFING_DETAILS</label>
                                <button 
                                    disabled={isRefiningBrief || !bountyFormData.description}
                                    onClick={handleRefineBrief}
                                    className="flex items-center gap-1.5 text-[9px] font-raj font-black text-[#00E5FF] tracking-widest uppercase hover:brightness-125 transition-all disabled:opacity-30"
                                >
                                    {isRefiningBrief ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} 
                                    REFINE_BRIEF
                                </button>
                            </div>
                            <textarea placeholder="Describe exactly what needs to be delivered..." value={bountyFormData.description} onChange={e => setBountyFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white outline-none focus:border-[#CCFF00] font-inter text-sm resize-none" rows={4} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-raj font-bold text-zinc-600 tracking-widest uppercase px-1">TAGS (COMMA SEPARATED)</label>
                            <input type="text" placeholder="EE, MATLAB, URGENT" value={bountyFormData.tags} onChange={e => setBountyFormData(prev => ({ ...prev, tags: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#CCFF00] font-raj font-bold tracking-widest text-[10px]" />
                        </div>

                        <div className="bg-[#1A1A00]/20 border border-[#CCFF00]/20 rounded-xl p-4 flex items-start gap-3">
                            <Shield size={16} className="text-[#CCFF00] shrink-0 mt-0.5" />
                            <p className="text-[10px] text-[#CCFF00]/70 font-inter italic leading-tight">
                                MISSION_PROTOCOL: Reward bones are locked in escrow upon operative selection. Unverified submissions trigger trust degradation.
                            </p>
                        </div>

                        {/* Deployment Actions */}
                        <div className="flex flex-col gap-3 pb-8">
                            <button 
                                disabled={isSubmittingForm || !bountyFormData.title || !bountyFormData.reward} 
                                onClick={handleCreateBounty} 
                                className="w-full bg-[#CCFF00] text-black py-7 rounded-2xl font-raj font-black text-lg tracking-[0.2em] uppercase transition-all shadow-[0_20px_50px_rgba(0,229,255,0.2)] active:scale-98 flex items-center justify-center gap-4 disabled:opacity-40 hover:brightness-110"
                            >
                                {isSubmittingForm ? (
                                    <><Loader2 size={24} className="animate-spin" /> UPLINKING...</>
                                ) : (
                                    <><Upload size={22} strokeWidth={3} /> DEPLOY_MISSION</>
                                )}
                            </button>

                            {/* New Cancel/Close Button for Accessibility */}
                            <button 
                                onClick={() => setIsCreateBountyModalOpen(false)}
                                className="w-full py-4 border border-zinc-800 text-zinc-500 rounded-xl font-raj font-bold text-[11px] tracking-[0.3em] uppercase hover:text-white transition-all active:scale-95"
                            >
                                CANCEL_UPLINK
                            </button>
                        </div>
                    </div>
                </div>
                <style>{`
                    .color-scheme-dark {
                        color-scheme: dark;
                    }
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>
            </div>
        );
    };

    const renderManageStockModal = () => {
        if (!hub.isStockModalOpen || !hub.selectedStockItem) return null;
        const item = hub.selectedStockItem;
        return (
            <div className="fixed inset-0 z-[7000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-[#1A1A1A] rounded-[2.5rem] p-8 shadow-2xl relative flex flex-col max-h-[90vh]">
                    <button onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, isStockModalOpen: false, selectedStockItem: null } }))} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><X size={24} /></button>
                    <h2 className="text-white font-raj font-bold text-xl uppercase mb-6">Manage Unit</h2>
                    <div className="overflow-y-auto pr-2 space-y-6">
                        <div className="bg-zinc-900/50 p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 overflow-hidden">
                                {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package size={32} />}
                            </div>
                            <div>
                                <h3 className="text-white font-raj font-bold text-lg uppercase leading-none mb-1">{item.name}</h3>
                                <div className="text-[#CCFF00] font-data text-xs font-bold">{formatCurrency(item.rate || 0)}/hr</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => handleRecalculateEarnings(item.id)} className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:border-[#CCFF00]/40">
                                <RefreshCw size={20} className={isManagementProcessing ? 'animate-spin text-[#CCFF00]' : 'text-zinc-500'} />
                                <span className="text-[9px] font-raj font-black tracking-widest uppercase">SYNC_EARNINGS</span>
                            </button>
                            <button onClick={() => handleToggleStockStatus(item.id, item.status)} className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:border-[#00E5FF]/40">
                                <Power size={20} className={item.status === 'LISTED' ? 'text-green-500' : 'text-red-500'} />
                                <span className="text-[9px] font-raj font-black tracking-widest uppercase">{item.status === 'LISTED' ? 'GO_OFFLINE' : 'GO_ONLINE'}</span>
                            </button>
                            <button onClick={() => {
                                setEditAssetFormData({ name: item.name, rate: (item.rate || 0).toString(), description: item.description || '' });
                                updateState(s => ({ ...s, hub: { ...s.hub, isEditAssetModalOpen: true } }));
                            }} className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:border-zinc-700">
                                <Edit3 size={20} className="text-zinc-500" />
                                <span className="text-[9px] font-raj font-black tracking-widest uppercase">EDIT_PARAMS</span>
                            </button>
                            <button onClick={() => handleDelistUnit(item.id)} className="bg-zinc-900 border border-zinc-800 text-red-500 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:border-red-500/40">
                                <Trash2 size={20} />
                                <span className="text-[9px] font-raj font-black tracking-widest uppercase">DELIST_UNIT</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderEditAssetModal = () => {
        if (!hub.isEditAssetModalOpen) return null;
        return (
            <div className="fixed inset-0 z-[8000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-[#1A1A1A] rounded-[2.5rem] p-8 shadow-2xl relative">
                    <button onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, isEditAssetModalOpen: false } }))} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><X size={24} /></button>
                    <h2 className="text-white font-raj font-bold text-xl uppercase mb-6">Edit Parameters</h2>
                    <div className="space-y-4">
                        <input type="text" placeholder="Asset Name" value={editAssetFormData.name} onChange={e => setEditAssetFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#CCFF00]" />
                        <input type="number" placeholder="Rate (₹/hr)" value={editAssetFormData.rate} onChange={e => setEditAssetFormData(prev => ({ ...prev, rate: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#CCFF00]" />
                        <textarea placeholder="Description" value={editAssetFormData.description} onChange={e => setEditAssetFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#CCFF00]" rows={3} />
                        <button disabled={isManagementProcessing} onClick={handleUpdateAssetParameters} className="w-full bg-[#CCFF00] text-black py-4 rounded-xl font-raj font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            {isManagementProcessing ? <Loader2 size={16} className="animate-spin" /> : 'SAVE_PARAMETERS'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderRealisticReceipt = (invoice: HubInvoice) => {
        if (!invoice.receiptMetadata) return null;
        const { transactionId, method, authCode, timestamp, deviceSignature } = invoice.receiptMetadata;

        return (
            <div className="mt-4 bg-[#080808] border border-zinc-800 rounded-2xl p-5 shadow-inner relative overflow-hidden font-data text-[10px] text-zinc-400">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#CCFF00]/40 via-transparent to-[#CCFF00]/40"></div>
                
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                        <div className="text-white font-bold tracking-widest uppercase italic">GSD_OS DIGITAL RECEIPT</div>
                        <div className="opacity-50 text-[8px]">RELAY_SYNC: 0x77_ACTIVE</div>
                    </div>
                    <CheckCircle2 size={16} className="text-[#CCFF00]" />
                </div>

                <div className="border-t border-dashed border-zinc-800 py-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="uppercase text-zinc-600">TRANSACTION_ID</span>
                        <span className="text-white tabular-nums">{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="uppercase text-zinc-600">PROTOCOL_METHOD</span>
                        <span className="text-white">{method}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="uppercase text-zinc-600">AUTH_SIGNATURE</span>
                        <span className="text-[#CCFF00] font-bold">{authCode}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="uppercase text-zinc-600">UPLINK_TIME</span>
                        <span className="text-white">{new Date(timestamp).toLocaleString()}</span>
                    </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 flex flex-col items-center gap-3 text-center">
                    <div className="font-raj font-black text-xl text-white tracking-tighter italic">
                        TOTAL_SETTLED: {formatCurrency(invoice.amount)}
                    </div>
                    <div className="bg-white p-1 rounded shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <QrCode size={40} className="text-black" />
                    </div>
                    <div className="text-[7px] opacity-40 uppercase tracking-[0.2em]">
                        SECURED BY GSD NEURAL ENCRYPTION // {deviceSignature}
                    </div>
                </div>
            </div>
        );
    };

    const renderInvoicesContent = () => {
        const filteredInvoices = (hub.invoices || []).filter(inv => 
            inv.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
            inv.target.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="animate-in fade-in duration-300 space-y-4 pb-24">
                {filteredInvoices.map(inv => {
                    const isPaid = inv.status === 'PAID';
                    const isOverdue = inv.status === 'OVERDUE';
                    const isSyncing = syncingIds.has(inv.id);

                    return (
                        <div key={inv.id} className={`bg-[#0D0D0D] border ${isOverdue ? 'border-[#FF333333]' : 'border-[#1A1A1A]'} rounded-2xl p-6 relative overflow-hidden group`}>
                            {isOverdue && <div className="absolute top-0 left-0 w-full h-0.5 bg-[#FF3333]"></div>}
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex-1">
                                    <div className="text-[#444] font-data text-[9px] font-bold tracking-widest mb-1">#{inv.id.substring(0, 10)} // {inv.category}</div>
                                    <div className="text-white font-raj font-bold text-lg uppercase mb-1 leading-tight">{inv.description}</div>
                                    <div 
                                        className="flex items-center gap-2 mt-1 cursor-pointer hover:brightness-125 transition-all w-fit"
                                        onClick={() => onViewProfile?.(inv.target, 'ID-' + inv.target)}
                                    >
                                        <UserAvatar name={inv.target} size="xs" />
                                        <div className="text-[#666] font-inter text-10px tracking-wide uppercase">TARGET: {inv.target} // {inv.date}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`px-2 py-0.5 rounded text-[9px] font-raj font-black tracking-widest ${isPaid ? 'bg-[#CCFF0022] text-[#CCFF00]' : isOverdue ? 'bg-[#FF333322] text-[#FF3333]' : 'bg-[#FF990022] text-[#FF9900]'} border ${isPaid ? 'border-[#CCFF0044]' : isOverdue ? 'border-[#FF333344]' : 'border-[#FF990044]'}`}>{inv.status}</div>
                                    <div className="text-white font-raj font-bold text-2xl mt-2">{formatCurrency(inv.amount)}</div>
                                </div>
                            </div>

                            {/* Realistic Receipt Block */}
                            {isPaid && renderRealisticReceipt(inv)}

                            <div className="flex justify-end pt-4 border-t border-[#1A1A1A] mt-4">
                                {isPaid ? (
                                    <button 
                                        onClick={() => handleSyncCloudsave(inv.id)}
                                        disabled={isSyncing}
                                        className={`bg-transparent border border-zinc-900 text-zinc-700 px-5 py-2.5 rounded-xl font-raj font-bold text-[10px] tracking-widest flex items-center gap-2 group-hover:border-zinc-800 group-hover:text-zinc-500 transition-all active:scale-95 disabled:opacity-50`}
                                    >
                                        {isSyncing ? (
                                            <><Loader2 size={12} className="animate-spin" /> UPLOADING_CORE...</>
                                        ) : (
                                            <><CloudUpload size={12} /> SYNC_CLOUDSAVE</>
                                        )}
                                    </button>
                                ) : (
                                    <button onClick={() => handleSettleInvoiceClick(inv)} className="bg-[#CCFF00] text-black px-6 py-3 rounded-xl font-raj font-black text-xs tracking-widest shadow-[0_4px_15px_rgba(204,255,0,0.2)] active:scale-95">SETTLE_INVOICE</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    /**
     * Renders a modal to confirm mission acceptance and display rules.
     */
    const renderConfirmMissionModal = () => {
        if (!confirmingBounty) return null;
        const bounty = confirmingBounty;

        return (
            <div className="fixed inset-0 z-[9500] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-full max-w-[400px] bg-[#0A0A0A] border border-[#1A1A1A] rounded-[3rem] p-8 shadow-3xl relative overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#CCFF00]/40"></div>
                    
                    <div className="flex justify-between items-center mb-8 shrink-0">
                        <div>
                            <div className="text-[#CCFF00] font-raj font-black text-[9px] tracking-[0.4em] uppercase italic">MISSION_CONTRACT</div>
                            <h2 className="text-white font-raj font-black text-2xl uppercase tracking-tighter mt-1 italic">ACCEPT_DEPLOYMENT</h2>
                        </div>
                        <button onClick={() => setConfirmingBounty(null)} className="text-zinc-700 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 mb-8 text-center space-y-4">
                         <div>
                            <div className="text-zinc-600 font-raj font-bold text-[10px] tracking-[0.3em] uppercase mb-1">MISSION_TARGET</div>
                            <div className="text-white font-raj font-bold text-xl uppercase italic">{bounty.title}</div>
                         </div>
                         <div className="pt-2">
                            <div className="text-zinc-600 font-raj font-bold text-[10px] tracking-[0.3em] uppercase mb-1">TOTAL_REWARD</div>
                            <div className="text-[#CCFF00] font-raj font-bold text-3xl">{formatCurrency(bounty.reward)}</div>
                         </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar pb-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <ShieldIcon size={14} className="text-[#CCFF00]" />
                                <span className="text-zinc-500 font-raj font-bold text-[10px] tracking-[0.3em] uppercase italic">RULES_OF_ENGAGEMENT</span>
                            </div>
                            
                            <div className="space-y-3">
                                {[
                                    { icon: <CheckCircle size={14} />, text: "CAPACITY: Max 3 active missions per operator node." },
                                    { icon: <Clock size={14} />, text: "DEADLINE: Late submissions trigger automatic trust degradation." },
                                    { icon: <AlertCircle size={14} />, text: "VALIDATION: AI vision protocols will verify all work bytes." },
                                    { icon: <Users size={14} />, text: "CONDUCT: High-fidelity professional behavior required." }
                                ].map((rule, idx) => (
                                    <div key={idx} className="flex gap-3 items-start bg-zinc-900/40 p-4 rounded-2xl border border-zinc-900/50">
                                        <div className="text-[#CCFF00] mt-0.5">{rule.icon}</div>
                                        <p className="text-zinc-400 font-inter text-[11px] leading-relaxed uppercase tracking-tight">{rule.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 shrink-0 pt-4 border-t border-zinc-900">
                        <button 
                            onClick={() => setConfirmingBounty(null)}
                            className="flex-1 py-4 border border-zinc-800 text-zinc-600 rounded-xl font-raj font-bold text-[11px] tracking-widest uppercase hover:text-white transition-all active:scale-95"
                        >
                            ABORT_MISSION
                        </button>
                        <button 
                            disabled={acceptingBountyId === bounty.id}
                            onClick={() => handleAcceptMission(bounty)}
                            className="flex-[1.5] bg-[#CCFF00] text-black py-4 rounded-xl font-raj font-black text-xs tracking-[0.2em] uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {acceptingBountyId === bounty.id ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                "CONFIRM_DEPLOYMENT"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders a sophisticated filter modal for the bounty feed.
     */
    const renderBountyFilterModal = () => {
        if (!isBountyFilterModalOpen) return null;

        const uniqueTags = Array.from(new Set(hub.bountyData.feed.flatMap(b => b.tags))).sort();
        const categories: (BountyCategory | 'ALL')[] = ['ALL', 'WRITTEN_WORK', 'GUIDANCE', 'PROJECT_WORK', 'OTHER'];

        const resetFilters = () => {
            updateState(s => ({
                ...s,
                hub: {
                    ...s.hub,
                    bountyFilters: { category: 'ALL', tag: 'ALL', rewardMin: 0 }
                }
            }));
        };

        return (
            <div className="fixed inset-0 z-[8000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-full max-w-[400px] bg-[#0A0A0A] border border-[#1A1A1A] rounded-[3rem] p-8 shadow-3xl relative overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="flex justify-between items-center mb-8 shrink-0">
                        <div>
                            <div className="text-[#00E5FF] font-raj font-black text-[9px] tracking-[0.4em] uppercase italic">FILTER_PROTOCOL</div>
                            <h2 className="text-white font-raj font-black text-2xl uppercase tracking-tighter mt-1 italic">MISSION_PARAMETERS</h2>
                        </div>
                        <button onClick={() => setIsBountyFilterModalOpen(false)} className="text-zinc-700 hover:text-white transition-colors active:scale-90">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-8 no-scrollbar pb-6">
                        {/* Minimum Reward Filter */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-raj font-bold text-zinc-500 tracking-[0.2em] uppercase italic">MINIMUM_REWARD (₹)</label>
                                <span className="text-[#CCFF00] font-data font-bold text-sm">₹{hub.bountyFilters.rewardMin}+</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="2000" 
                                step="50"
                                value={hub.bountyFilters.rewardMin}
                                onChange={(e) => updateState(s => ({ ...s, hub: { ...s.hub, bountyFilters: { ...s.hub.bountyFilters, rewardMin: parseInt(e.target.value) } } }))}
                                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-raj font-bold text-zinc-500 tracking-[0.2em] uppercase italic px-1">MISSION_CATEGORY</label>
                            <div className="flex wrap gap-2">
                                {categories.map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, bountyFilters: { ...s.hub.bountyFilters, category: cat } } }))}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-raj font-bold tracking-widest uppercase transition-all border ${
                                            hub.bountyFilters.category === cat 
                                            ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_15px_rgba(229,255,0,0.3)]' 
                                            : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:border-zinc-800'
                                        }`}
                                    >
                                        {cat.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tag Filter */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-raj font-bold text-zinc-500 tracking-[0.2em] uppercase italic px-1">TACTICAL_TAGS</label>
                            <div className="flex wrap gap-2">
                                <button 
                                    onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, bountyFilters: { ...s.hub.bountyFilters, tag: 'ALL' } } }))}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-raj font-bold tracking-widest uppercase transition-all border ${
                                        hub.bountyFilters.tag === 'ALL' 
                                        ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]' 
                                        : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:border-zinc-800'
                                    }`}
                                >
                                    ALL_TAGS
                                </button>
                                {uniqueTags.map(tag => (
                                    <button 
                                        key={tag}
                                        onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, bountyFilters: { ...s.hub.bountyFilters, tag: tag } } }))}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-raj font-bold tracking-widest uppercase transition-all border ${
                                            hub.bountyFilters.tag === tag 
                                            ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]' 
                                            : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:border-zinc-800'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 shrink-0 pt-6 border-t border-zinc-900">
                        <button 
                            onClick={resetFilters}
                            className="flex-1 py-4 border border-zinc-800 text-zinc-600 rounded-xl font-raj font-bold text-[11px] tracking-widest uppercase hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ResetIcon size={14} /> RESET_DEFAULTS
                        </button>
                        <button 
                            onClick={() => setIsBountyFilterModalOpen(false)}
                            className="flex-1 bg-[#CCFF00] text-black py-4 rounded-xl font-raj font-black text-xs tracking-[0.2em] uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            APPLY_PROTOCOL
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders the bounties feed and sub-tabs content.
     */
    const renderBountiesContent = () => {
        const activeSubTab = hub.activeBountySubTab;
        let data: HubBounty[] = [];
        if (activeSubTab === 'BROWSE') data = hub.bountyData.feed;
        else if (activeSubTab === 'ACCEPTED') data = hub.bountyData.accepted;
        else if (activeSubTab === 'MY_POSTS') data = hub.bountyData.my_posts;

        // Apply Filters
        let filteredData = data.filter(b => {
            const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = hub.bountyFilters.category === 'ALL' || b.category === hub.bountyFilters.category;
            const matchesTag = hub.bountyFilters.tag === 'ALL' || b.tags.includes(hub.bountyFilters.tag);
            const matchesReward = b.reward >= hub.bountyFilters.rewardMin;
            
            return matchesSearch && matchesCategory && matchesTag && matchesReward;
        });

        // Sorting Logic
        filteredData = [...filteredData].sort((a, b) => {
            switch (hub.bountySortOrder) {
                case 'REWARD_DESC': return b.reward - a.reward;
                case 'REWARD_ASC': return a.reward - b.reward;
                case 'DATE_DESC': return b.postedAtTimestamp - a.postedAtTimestamp;
                case 'DEADLINE_ASC': 
                    const deadA = a.deadlineTimestamp || Infinity;
                    const deadB = b.deadlineTimestamp || Infinity;
                    return deadA - deadB;
                default: return 0;
            }
        });

        const sortOptions = [
            { label: 'NEWEST_POSTED', value: 'DATE_DESC', icon: <Calendar size={12} /> },
            { label: 'SOONEST_DEADLINE', value: 'DEADLINE_ASC', icon: <Clock size={12} /> },
            { label: 'REWARD: HIGH TO LOW', value: 'REWARD_DESC', icon: <TrendingUp size={12} /> },
            { label: 'REWARD: LOW TO HIGH', value: 'REWARD_ASC', icon: <TrendingDown size={12} /> }
        ];

        return (
            <div className="animate-in fade-in duration-300 space-y-5 pb-24">
                {/* SORT, FILTER AND POST UI */}
                <div className="flex flex-col gap-4">
                    {activeSubTab === 'BROWSE' && (
                        <div className="flex justify-between items-center relative">
                            <button 
                                onClick={() => setIsBountyFilterModalOpen(true)}
                                className={`bg-white/5 border px-5 py-3 rounded-xl flex items-center gap-3 font-raj font-bold text-[11px] tracking-[0.2em] uppercase transition-all active:scale-95 shadow-lg ${
                                    (hub.bountyFilters.category !== 'ALL' || hub.bountyFilters.tag !== 'ALL' || hub.bountyFilters.rewardMin > 0)
                                    ? 'border-[#00E5FF]/40 text-[#00E5FF]'
                                    : 'border-white/10 text-white'
                                }`}
                            >
                                <FilterIcon size={14} className={(hub.bountyFilters.category !== 'ALL' || hub.bountyFilters.tag !== 'ALL' || hub.bountyFilters.rewardMin > 0) ? 'animate-pulse' : 'text-zinc-500'} />
                                <span>FILTER_PARAMS</span>
                            </button>

                            <button 
                                onClick={() => setIsBountySortMenuOpen(!isBountySortMenuOpen)}
                                className="bg-white/5 border border-white/10 px-5 py-3 rounded-xl flex items-center gap-3 text-white font-raj font-bold text-[11px] tracking-[0.2em] uppercase transition-all active:scale-95 shadow-lg"
                            >
                                <ArrowUpDown size={14} className={isBountySortMenuOpen ? 'text-[#CCFF00]' : 'text-zinc-500'} />
                                <span>SORT_MISSIONS</span>
                            </button>

                            {isBountySortMenuOpen && (
                                <div className="absolute top-14 right-0 z-[6000] w-64 bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
                                    {sortOptions.map((opt) => (
                                        <button 
                                            key={opt.value} 
                                            onClick={() => {
                                                updateState(s => ({ ...s, hub: { ...s.hub, bountySortOrder: opt.value as BountySortOrder } }));
                                                setIsBountySortMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3.5 rounded-xl font-raj font-bold text-[10px] tracking-widest uppercase mb-1 flex items-center justify-between transition-colors ${
                                                hub.bountySortOrder === opt.value ? 'bg-[#CCFF00] text-black' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">{opt.icon} {opt.label}</span>
                                            {hub.bountySortOrder === opt.value && <Check size={12} strokeWidth={4} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeSubTab === 'MY_POSTS' && (
                        <button 
                            onClick={() => setIsCreateBountyModalOpen(true)}
                            className="w-full bg-[#121212] border-2 border-dashed border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:border-[#CCFF00]/40 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-[#CCFF00] transition-colors">
                                <Plus size={24} />
                            </div>
                            <div className="text-center">
                                <div className="text-zinc-400 font-raj font-bold text-xs tracking-widest uppercase group-hover:text-white">POST NEW MISSION</div>
                                <div className="text-zinc-700 font-data text-9px tracking-widest uppercase mt-1">ECOSYSTEM_BRIEFING_UPLINK</div>
                            </div>
                        </button>
                    )}
                </div>

                {filteredData.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-900 rounded-[2.5rem]">
                        <FolderX size={48} className="mx-auto text-zinc-900 mb-4" />
                        <div className="text-zinc-600 font-raj font-black text-xs tracking-widest uppercase">NO_MISSIONS_FOUND</div>
                        <button 
                            onClick={() => {
                                updateState(s => ({ ...s, hub: { ...s.hub, bountyFilters: { category: 'ALL', tag: 'ALL', rewardMin: 0 } } }));
                                setSearchQuery('');
                            }}
                            className="mt-4 text-[#00E5FF] font-raj font-bold text-[10px] tracking-widest uppercase hover:underline"
                        >
                            CLEAR_ALL_FILTERS
                        </button>
                    </div>
                ) : (
                    filteredData.map(bounty => {
                        const timeLabel = getRemainingTimeLabel(bounty.deadlineTimestamp);
                        const urgency = getUrgencyStyles(bounty.deadlineTimestamp);
                        const isFlipped = flippedBountyId === bounty.id;

                        // Calculate progress for the vitality loading bar
                        const getProgressPercentage = () => {
                            if (!bounty.deadlineTimestamp) return 100;
                            const diff = bounty.deadlineTimestamp - currentTime;
                            const maxRef = 48 * 60 * 60 * 1000; 
                            return Math.max(0, Math.min(100, (diff / maxRef) * 100));
                        };
                        const progress = getProgressPercentage();

                        return (
                        <div 
                            key={bounty.id} 
                            className="flip-card-container w-full h-[230px] cursor-pointer"
                            onClick={() => setFlippedBountyId(isFlipped ? null : bounty.id)}
                        >
                          <div className={`flip-card-inner relative w-full h-full transition-transform duration-700 ${isFlipped ? 'flipped' : ''}`}>
                            
                            {/* FRONT SIDE */}
                            <div className={`flip-card-front absolute inset-0 bg-gradient-to-br from-[#0D0D0D] to-[#080808] border ${bounty.status === 'ASSIGNED' ? 'border-[#CCFF00]/40' : 'border-zinc-800'} rounded-[1.5rem] p-5 shadow-[0_15px_40px_rgba(0,229,255,0.05)]`}>
                                {bounty.status === 'ASSIGNED' && <div className="absolute top-0 left-0 w-full h-0.5 bg-[#CCFF00] shadow-[0_0_10px_#CCFF00]"></div>}
                                
                                <div className="flex justify-between items-start mb-4 z-elevated">
                                    <div>
                                        <div className="text-zinc-600 font-data text-[8px] font-bold tracking-[0.2em] uppercase mb-1">{bounty.category} // {bounty.estimate}</div>
                                        <h3 className="text-white font-raj font-bold text-lg uppercase leading-tight drop-shadow-lg">{bounty.title}</h3>
                                        <div 
                                            className="flex items-center gap-2 mt-1 cursor-pointer hover:brightness-125 transition-all w-fit"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewProfile?.(bounty.creator, 'ID-' + bounty.creator);
                                            }}
                                        >
                                            <UserAvatar name={bounty.creator} size="xs" />
                                            <div className="text-[#555] font-inter text-10px italic">BY: {bounty.creator}</div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end z-elevated-high">
                                        <div className="text-[#CCFF00] font-raj font-bold text-xl leading-none mb-0.5 drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]">{formatCurrency(bounty.reward)}</div>
                                        <div className="text-zinc-600 font-data text-[7px] tracking-widest uppercase font-bold mb-2">BONUS_POOL</div>
                                        {activeSubTab === 'BROWSE' && (
                                            <button 
                                                disabled={acceptingBountyId === bounty.id || hub.bountyData.accepted.length >= 3}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBountyForNegotiation(bounty);
                                                    setNegotiateMode('NEGOTIATE');
                                                    setNegotiateFormData({ proposedReward: bounty.reward.toString(), message: '' });
                                                    setIsNegotiateModalOpen(true);
                                                }}
                                                className={`px-2.5 py-1 rounded-lg font-raj font-black text-[9px] tracking-widest uppercase transition-all flex items-center gap-1 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:border-[#00E5FF]/40 hover:text-white active:scale-95 shadow-xl`}
                                            >
                                                <Gavel size={10} /> NEGOTIATE
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-start gap-4 h-14 z-elevated">
                                    <div className="flex-1">
                                        <div className="mb-3">
                                            <div className={`inline-flex items-center gap-1.5 transition-all duration-500 ${urgency.container} py-1 shadow-inner`}>
                                                <Clock size={10} className={urgency.icon} />
                                                <span className={`font-data text-[10px] font-black tracking-[0.1em] uppercase ${urgency.text}`}>
                                                    {timeLabel || bounty.postedAt || 'ACTIVE_PROTOCOL'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex wrap gap-1.5 mb-4">
                                            {bounty.tags.map(tag => (
                                                <span key={tag} className="bg-black border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase shadow-sm">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-end text-zinc-700 hover:text-zinc-500 transition-colors pb-2">
                                        <InfoIcon size={12} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-zinc-900/50 z-elevated">
                                    {/* Segmented Vitality Bar with Dynamic Urgency Colors */}
                                    <div className="flex flex-col gap-1 w-24 group/vitality">
                                        <div className="flex justify-between items-center px-0.5">
                                            <span className="text-[6px] font-raj font-black tracking-[0.2em] uppercase italic group-hover/vitality:opacity-80 transition-colors" style={{ color: urgency.hex }}>NODE_VITALITY</span>
                                            <span className="text-[6px] font-data tabular-nums" style={{ color: urgency.hex }}>{Math.floor(progress)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-black border border-zinc-900 rounded-sm overflow-hidden flex gap-0.5 p-[1px] shadow-inner">
                                            {Array.from({ length: 10 }).map((_, i) => {
                                                const threshold = (i + 1) * 10;
                                                const isActive = progress >= threshold;
                                                return (
                                                    <div 
                                                        key={i} 
                                                        className={`flex-1 rounded-[1px] transition-all duration-700 ${isActive ? 'animate-vitality-active' : 'bg-zinc-900/50'}`}
                                                        style={{ 
                                                            backgroundColor: isActive ? urgency.hex : undefined,
                                                            boxShadow: isActive ? `0 0 5px ${urgency.hex}66` : 'none',
                                                            opacity: isActive ? 1 : 0.2,
                                                            animationDelay: `${i * 0.1}s`
                                                        }}
                                                    ></div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {activeSubTab === 'BROWSE' && (
                                        <div className="flex gap-2">
                                            <button 
                                                disabled={acceptingBountyId === bounty.id || hub.bountyData.accepted.length >= 3}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmingBounty(bounty); // Functioning: trigger rules confirmation
                                                }}
                                                className={`px-4 py-1.5 rounded-lg font-raj font-black text-[10px] tracking-[0.15em] uppercase shadow-[0_10px_20px_rgba(229,255,0,0.05)] active:scale-95 transition-all flex items-center gap-2 ${
                                                    hub.bountyData.accepted.length >= 3 
                                                    ? 'animate-neon-plate bg-zinc-900 text-white/40 cursor-not-allowed border-zinc-800' 
                                                    : 'bg-[#CCFF00] text-black shadow-[#CCFF00]/10'
                                                }`}
                                            >
                                                {acceptingBountyId === bounty.id ? <Loader2 size={12} className="animate-spin" /> : 
                                                hub.bountyData.accepted.length >= 3 ? 'PLATE_FULL' : 'ACCEPT_MISSION'}
                                            </button>
                                        </div>
                                    )}

                                    {activeSubTab === 'ACCEPTED' && (
                                        <div className="flex gap-2">
                                            <button 
                                                disabled={isSubmitting && activeSubmissionId === bounty.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleWorkSubmission(bounty.id);
                                                }}
                                                className="bg-[#00E5FF] hover:bg-[#00f3ff] text-black px-4 py-1.5 rounded-lg font-raj font-black text-[9px] tracking-widest uppercase active:scale-95 flex items-center justify-center gap-2 transition-all shadow-[0_8px_15px_rgba(0,229,255,0.2)]"
                                            >
                                                {isSubmitting && activeSubmissionId === bounty.id ? (
                                                    <><Loader2 size={12} className="animate-spin" /> VERIFYING_WORK...</>
                                                ) : (
                                                    <><Upload size={12} /> SUBMIT_WORK</>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {activeSubTab === 'MY_POSTS' && (
                                        <div className="flex gap-2">
                                            {bounty.status === 'ASSIGNED' ? (
                                                <div 
                                                    className="flex items-center gap-2 cursor-pointer hover:brightness-125 transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewProfile?.(bounty.assignedProvider || "", 'ID-' + bounty.assignedProvider);
                                                    }}
                                                >
                                                    <div className="text-right">
                                                        <div className="text-[7px] font-raj text-[#CCFF00] font-black tracking-widest uppercase leading-none">ASSIGNED_TO</div>
                                                        <div className="text-white font-raj font-bold text-[10px] uppercase leading-none">{bounty.assignedProvider}</div>
                                                    </div>
                                                    <UserAvatar name={bounty.assignedProvider || ""} size="md" className="border-[#CCFF00]/40" />
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateState(s => ({ ...s, hub: { ...s.hub, isOffersModalOpen: true, selectedBountyForOffers: bounty } }));
                                                    }}
                                                    className="bg-zinc-950 border border-zinc-800 text-white px-4 py-1.5 rounded-lg font-raj font-bold text-[9px] tracking-widest uppercase flex items-center gap-2 active:scale-95 shadow-md"
                                                >
                                                    <Users size={12} /> OFFERS ({bounty.offers?.length || 0})
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BACK SIDE (Dossier) */}
                            <div className="flip-card-back absolute inset-0 bg-[#0A0A0A] border border-zinc-700 rounded-[1.5rem] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col">
                                <div className="flex justify-between items-center mb-3 border-b border-zinc-900 pb-2 z-elevated">
                                    <div>
                                        <div className="text-[#00E5FF] font-raj font-black text-[8px] tracking-[0.4em] uppercase italic">MISSION_DOSSIER</div>
                                        <h3 className="text-white font-raj font-bold text-base uppercase truncate max-w-[180px] leading-tight mt-0.5">{bounty.title}</h3>
                                    </div>
                                    <div className="bg-zinc-900/50 p-1.5 rounded-lg shadow-inner">
                                        <RotateCcw size={12} className="text-zinc-500" />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar z-elevated-mid">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-[#111] p-2 rounded-xl border border-zinc-800 shadow-sm">
                                            <div className="text-zinc-600 font-raj font-bold text-[6px] tracking-widest uppercase mb-0.5">REWARD</div>
                                            <div className="text-[#CCFF00] font-data text-[10px] font-bold">{formatCurrency(bounty.reward)}</div>
                                        </div>
                                        <div 
                                            className="bg-[#111] p-2 rounded-xl border border-zinc-800 shadow-sm cursor-pointer hover:bg-zinc-800 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewProfile?.(bounty.creator, 'ID-' + bounty.creator);
                                            }}
                                        >
                                            <div className="text-zinc-600 font-raj font-bold text-[6px] tracking-widest uppercase mb-0.5">OPERATIVE</div>
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <UserAvatar name={bounty.creator} size="xs" />
                                                <div className="text-white font-data text-[10px] font-bold truncate">{bounty.creator}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-950 border border-dashed border-zinc-800 p-3 rounded-xl min-h-[60px] shadow-inner">
                                        <p className="text-zinc-400 font-inter text-[10px] leading-relaxed italic">
                                            "{bounty.description}"
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 opacity-50">
                                            <Fingerprint size={10} className="text-[#00E5FF]" />
                                            <span className="text-[8px] font-raj font-bold text-white tracking-widest uppercase">ENCRYPTED_UPLINK</span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-50">
                                            <Database size={10} className="text-[#00E5FF]" />
                                            <span className="text-[8px] font-raj font-bold text-white tracking-widest uppercase">NODE_SET_0x77</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 pt-2 border-t border-zinc-900 text-center z-elevated">
                                    <span className="text-[7px] font-raj font-black text-zinc-700 tracking-[0.4em] uppercase italic leading-none">CLICK ANYWHERE TO REVERT</span>
                                </div>
                            </div>

                          </div>
                        </div>
                        );})
                )}
            </div>
        );
    };

    const getSortedMarketItems = () => {
        const items = [...hub.marketData.items].filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.condition.toLowerCase().includes(searchQuery.toLowerCase())
        );
        switch (marketSortOrder) {
            case 'PRICE_ASC': return items.sort((a, b) => a.price - b.price);
            case 'PRICE_DESC': return items.sort((a, b) => b.price - a.price);
            case 'NAME_ASC': return items.sort((a, b) => a.name.localeCompare(b.name));
            default: return items;
        }
    };

    const renderCurrencyToggle = () => {
        return (
            <div className="flex bg-[#0F0F0F] border border-zinc-900 rounded-lg p-0.5 ml-auto">
                {(['INR', 'USD', 'EUR'] as const).map(curr => (
                    <button
                        key={curr}
                        onClick={() => updateState(s => ({ ...s, settings: { ...s.settings, currency: curr } }))}
                        className={`px-2 py-1 rounded-md text-[9px] font-raj font-black transition-all ${
                            settings.currency === curr ? 'bg-[#CCFF00] text-black shadow-sm' : 'text-zinc-600'
                        }`}
                    >
                        {curr}
                    </button>
                ))}
            </div>
        );
    };

    const renderPickupQrModal = () => {
        if (!isPickupQrModalOpen || !pickupItemToReveal) return null;
        const item = pickupItemToReveal;
        // Use user's Uplink ID for consistent authentication
        const pickupToken = user.id;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(pickupToken)}&color=CCFF00&bgcolor=000000`;

        return (
            <div className="fixed inset-0 z-[8800] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-[#CCFF00]/30 rounded-[3rem] p-10 shadow-[0_0_120px_rgba(204,255,0,0.1)] relative overflow-hidden flex flex-col items-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent opacity-60"></div>
                    
                    <button onClick={() => {
                        setIsPickupQrModalOpen(false);
                        setPickupItemToReveal(null);
                    }} className="absolute top-6 right-8 text-zinc-700 hover:text-white transition-colors active:scale-90">
                        <X size={28} />
                    </button>

                    <div className="text-center mb-10 mt-4">
                        <div className="text-[#CCFF00] font-raj font-black text-[11px] tracking-[0.5em] uppercase italic mb-2">HUB_PICKUP_UPLINK</div>
                        <h2 className="text-white font-raj font-black text-3xl uppercase tracking-tighter leading-none italic">{item.name}</h2>
                    </div>

                    <div className="relative group mb-10">
                        {/* Scanning HUD Overlay */}
                        <div className="absolute inset-0 z-20 pointer-events-none border border-[#CCFF00]/20 rounded-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#CCFF00] shadow-[0_0_15px_#CCFF00] animate-scan-qr"></div>
                        </div>

                        {/* Tactical Corners matching Profile tab style */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[#CCFF00] z-20"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-[#CCFF00] z-20"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-[#CCFF00] z-20"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#CCFF00] z-20"></div>
                        
                        <div className="bg-black p-6 rounded-2xl shadow-[0_0_60px_rgba(204,255,0,0.15)] border border-zinc-900">
                            <img 
                                src={qrUrl} 
                                alt="Pickup QR" 
                                className="w-[220px] h-[220px] block brightness-110" 
                            />
                        </div>
                    </div>

                    <div className="space-y-4 text-center mb-8 w-full">
                        <div className="bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-xl">
                            <div className="text-zinc-600 font-raj font-bold text-[8px] tracking-widest uppercase mb-1">SECURE_NODE_ID</div>
                            <span className="text-[#CCFF00] font-data text-[12px] font-black tracking-[0.3em] break-all uppercase">{user.id}</span>
                        </div>
                        <p className="text-zinc-500 font-inter text-[11px] leading-relaxed italic px-4">
                            Present your permanent identifier to the Station Manager to verify custody release.
                        </p>
                    </div>

                    <button 
                        disabled={isFinalizingPickup}
                        onClick={finalizeCustodyPickup}
                        className="w-full bg-[#CCFF00] text-black py-5 rounded-2xl font-raj font-black text-sm tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                        {isFinalizingPickup ? (
                            <><Loader2 size={18} className="animate-spin" /> VERIFYING_SYNC...</>
                        ) : (
                            <><Scan size={18} /> FINALIZE_PICKUP</>
                        )}
                    </button>
                </div>

                <style>{`
                    @keyframes scan-qr {
                        0% { transform: translateY(-10px); }
                        100% { transform: translateY(270px); }
                    }
                    .animate-scan-qr {
                        animation: scan-qr 2.5s linear infinite;
                    }
                `}</style>
            </div>
        );
    };

    const renderRateModal = () => {
        if (!isRateModalOpen || !selectedRentalToRate) return null;
        const item = selectedRentalToRate;

        return (
            <div className="fixed inset-0 z-[8800] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300 font-raj">
                <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-[#FFD700]/30 rounded-[3rem] p-10 shadow-[0_0_120px_rgba(255,215,0,0.1)] relative overflow-hidden flex flex-col items-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-60"></div>
                    
                    <button onClick={() => setIsRateModalOpen(false)} className="absolute top-6 right-8 text-zinc-700 hover:text-white transition-colors active:scale-90">
                        <X size={28} />
                    </button>

                    <div className="text-center mb-10 mt-4">
                        <div className="text-[#FFD700] font-black text-[11px] tracking-[0.5em] uppercase italic mb-2">PERFORMANCE_REVIEW_PROTOCOL</div>
                        <h2 className="text-white font-black text-3xl uppercase tracking-tighter leading-none italic">{item.name}</h2>
                    </div>

                    <div className="w-full space-y-8 mb-10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="text-zinc-500 font-bold text-[10px] tracking-widest uppercase italic">RELIABILITY_INDEX</div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star} 
                                        onClick={() => setRatingScore(star)}
                                        className="transition-all active:scale-90 hover:brightness-125"
                                    >
                                        <Star 
                                            size={star <= ratingScore ? 40 : 36} 
                                            className={star <= ratingScore ? "text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" : "text-zinc-800"} 
                                            fill={star <= ratingScore ? "#FFD700" : "none"} 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-zinc-600 font-bold text-[9px] tracking-widest uppercase px-1">SECURE_COMMS_UPLINK</label>
                            <textarea 
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                                placeholder="Describe asset performance during mission..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-white font-inter text-sm outline-none focus:border-[#FFD700]/50 transition-all resize-none min-h-[100px] placeholder:text-zinc-800"
                            />
                        </div>
                    </div>

                    <div className="bg-[#1A1A00] border border-[#FFD700]/20 p-5 rounded-2xl mb-8 flex items-start gap-4">
                        <ShieldCheck size={18} className="text-[#FFD700] shrink-0 mt-0.5" />
                        <p className="text-[#FFD700] text-[10px] font-inter italic leading-relaxed opacity-80 uppercase">
                            HUB_NOTICE: Reliable reviews contribute to the node reputation ledger. +5 Bones reward for validated performance telemetry.
                        </p>
                    </div>

                    <button 
                        disabled={isSubmittingRating}
                        onClick={handleRateSubmission}
                        className="w-full bg-[#FFD700] text-black py-5 rounded-2xl font-black text-sm tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 overflow-hidden group"
                    >
                        {isSubmittingRating ? (
                            <><Loader2 size={18} className="animate-spin" /> ANALYZING_BYTES...</>
                        ) : (
                            <><Zap size={18} fill="currentColor" /> TRANSMIT_REVIEW</>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    const isTrusted = user.trustScore >= 75;

    return (
        <div className="h-full bg-black flex flex-col overflow-hidden animate-in fade-in duration-300">
            {trustImpact && (
                <TrustImpactAnimation 
                    isPositive={trustImpact.isPositive} 
                    impactValue={trustImpact.val} 
                    onClose={() => {
                        const wasPositive = trustImpact.isPositive;
                        setTrustImpact(null);
                        if (wasPositive) {
                            setShowPaymentPending(true);
                        }
                    }} 
                />
            )}
            {renderPaymentPendingModal()}
            {renderRentalModal()}
            {renderRequestToRentModal()}
            {renderOffersModal()}
            {renderConfirmMissionModal()}
            {renderMissionDetailsModal()}
            {renderBountyFilterModal()}
            {renderMarketPurchaseModal()}
            {renderNegotiateModal()}
            {renderListAssetModal()}
            {renderUploadRequestModal()}
            {renderCreateBountyModal()}
            {renderManageStockModal()}
            {renderEditAssetModal()}
            {renderPickupQrModal()}
            {renderRateModal()}
            <TacticalMapModal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} itemName={selectedTrackingItem?.name || ''} itemStatus={selectedTrackingItem?.status || ''} />
            <SettlementGatewayModal isOpen={isSettlementOpen} onClose={() => setIsSettlementOpen(false)} recipientName={activeInvoice?.target || "@UPLINK"} amount={activeInvoice?.amount || 0} description={activeInvoice?.description || "Protocol Settlement"} transactionType="INVOICE_SETTLEMENT" onSuccess={handleInvoiceSuccess} />
            
            <GPaySheet 
                isOpen={isGPaySheetOpen} 
                onClose={() => setIsGPaySheetOpen(false)}
                recipientName={hub.selectedRentalItem?.owner || "@OPERATIVE"}
                recipientId={`${hub.selectedRentalItem?.owner?.replace('@', '').toLowerCase() || 'gsd'}@okaxis`}
                amount={hub.selectedRentalItem ? hub.selectedRentalItem.rate * rentalDuration : 0}
                onPaymentComplete={() => {
                    setIsGPaySheetOpen(false);
                    setPaymentInitiated(true);
                }}
            />

            {/* Offer Sent Success Popup */}
            {isOfferSentVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300 pointer-events-none">
                    <div className="bg-[#0A0A0A] border border-[#00E5FF]/40 rounded-[2rem] p-10 shadow-[0_0_100px_rgba(0,229,255,0.2)] text-center relative overflow-hidden max-w-[320px] w-full">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-60"></div>
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                                <CheckCircle2 size={32} />
                            </div>
                        </div>
                        <h3 className="text-white font-raj font-black text-xl mb-1 tracking-[0.2em] uppercase italic">OFFER_SENT</h3>
                        <p className="text-[#00E5FF] font-data text-[9px] tracking-widest uppercase opacity-60">UPLINK_COMMITTED_0x77</p>
                    </div>
                </div>
            )}

            {/* Optimized file input with ref reset */}
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={onFileSelected} 
                aria-hidden="true" 
            />

            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-24 no-scrollbar">
                <div className="flex justify-between items-center mb-6 px-1">
                    <div className="font-raj font-bold text-2xl text-white italic tracking-widest uppercase leading-none">HUB_STATION</div>
                    {renderCurrencyToggle()}
                </div>

                {/* SEARCH BAR COMPONENT */}
                <div className="px-1 mb-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-zinc-500 group-focus-within:text-[#CCFF00] transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="SEARCH_REGISTRY..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0D0D0D] border border-zinc-900 focus:border-[#CCFF00] rounded-2xl py-4 pl-12 pr-4 text-white font-raj font-bold tracking-widest outline-none transition-all placeholder:text-zinc-800 shadow-inner"
                        />
                    </div>
                </div>

                {renderToggleRow(['GEAR', 'BOUNTIES', 'INVOICES'], hub.activeCategory, 'activeCategory')}
                {hub.activeCategory === 'GEAR' && (
                    <>
                        {renderToggleRow(['RENTALS', 'BUY / SELL'], hub.activeMode, 'activeMode', '70%')}
                        {hub.activeMode === 'RENTALS' ? (
                            <div className="animate-in fade-in duration-300">
                                {renderRentalSubNav()}
                                {hub.activeRentalSubTab === 'PROCURE' && (
                                    /* Sorted Procure Logic: Sorting by unique trust score in registry */
                                    [...hub.rentalData.procure]
                                        .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .sort((a, b) => (OWNER_TRUST_REGISTRY[b.owner] || 50) - (OWNER_TRUST_REGISTRY[a.owner] || 50))
                                        .map(item => {
                                            const isFlipped = flippedGearId === item.id;
                                            const trustScore = OWNER_TRUST_REGISTRY[item.owner] || 75;
                                            
                                            // Dynamic Color Coding for Reliability
                                            const trustColor = trustScore >= 95 ? '#00E5FF' : trustScore >= 85 ? '#CCFF00' : '#FF9900';
                                            const trustLabel = trustScore >= 95 ? 'LEVEL_ALPHA' : trustScore >= 85 ? 'LEVEL_BETA' : 'LEVEL_GAMMA';

                                            const gearDetails = {
                                                condition: item.id === 'P-101' ? 'MINT_CONDITION' : 'USED_GOOD',
                                                description: item.id === 'P-101' ? 'Full kit includes 18-55mm lens, 2x batteries, and 128GB SD card. Perfect for student projects.' : 
                                                            item.id === 'P-102' ? 'Standard A3/A2 drafter with sheet holder. Recently calibrated for precision work.' :
                                                            'High-performance asset with direct node uplink capabilities. Reliable and pre-checked.',
                                                rating: '4.8',
                                                rentalsCount: (item.id.charCodeAt(item.id.length - 1) % 15) + 5
                                            };

                                            return (
                                                <div 
                                                    key={item.id} 
                                                    className="flip-card-container w-full h-[230px] mb-5 cursor-pointer"
                                                    onClick={() => setFlippedGearId(isFlipped ? null : item.id)}
                                                >
                                                    <div className={`flip-card-inner relative w-full h-full transition-transform duration-700 ${isFlipped ? 'flipped' : ''}`}>
                                                        
                                                        {/* FRONT SIDE */}
                                                        <div className="flip-card-front absolute inset-0 bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl overflow-hidden shadow-xl">
                                                            <div className="h-28 bg-zinc-900 flex items-center justify-center relative">
                                                                {item.icon === 'Camera' ? <Camera size={48} className="text-zinc-800" /> : 
                                                                item.icon === 'Plane' ? <Plane size={48} className="text-zinc-800" /> :
                                                                item.icon === 'Cpu' ? <Cpu size={48} className="text-zinc-800" /> :
                                                                item.icon === 'Calculator' ? <Calculator size={48} className="text-zinc-800" /> :
                                                                item.icon === 'Headphones' ? <Headphones size={48} className="text-zinc-800" /> :
                                                                item.icon === 'Smartphone' ? <Smartphone size={48} className="text-zinc-800" /> :
                                                                item.icon === 'MonitorPlay' ? <MonitorPlay size={48} className="text-zinc-800" /> :
                                                                <Package size={48} className="text-zinc-800" />}
                                                                
                                                                <div className="absolute top-3 right-3 bg-black/60 px-2 py-0.5 rounded text-[9px] text-white font-raj font-black tracking-widest uppercase border border-white/10">AVAIL: 1</div>
                                                                {!isTrusted && (
                                                                    <div className="absolute top-3 left-3 bg-orange-600/80 px-2 py-0.5 rounded text-[8px] text-white font-raj font-black tracking-widest uppercase border border-orange-400/40 backdrop-blur-sm shadow-xl">
                                                                        VERIFICATION_REQD
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="p-4 flex justify-between items-center">
                                                                <div>
                                                                    <div className="text-white font-raj font-bold text-base leading-tight uppercase truncate max-w-[150px]">{item.name}</div>
                                                                    <div className="flex flex-col gap-1 mt-1">
                                                                        <div 
                                                                            className="flex items-center gap-1.5 cursor-pointer hover:brightness-125 transition-all w-fit"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onViewProfile?.(item.owner, 'ID-' + item.owner);
                                                                            }}
                                                                        >
                                                                            <UserAvatar name={item.owner} size="xs" />
                                                                            <div className="text-[#555] font-inter text-[10px] uppercase font-bold tracking-tight">OWNER: {item.owner}</div>
                                                                        </div>
                                                                        {/* DYNAMIC TRUST BADGE - REMOVED TEXT PER REQUEST */}
                                                                        <div 
                                                                            className="flex items-center gap-1 px-1.5 py-0.5 border rounded-md w-fit ml-6 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                                                                            style={{ backgroundColor: `${trustColor}0D`, borderColor: `${trustColor}33` }}
                                                                        >
                                                                            <ShieldCheck size={10} style={{ color: trustColor }} />
                                                                            <span className="text-[8px] font-data font-black tracking-tighter uppercase leading-none pt-0.5" style={{ color: trustColor }}>
                                                                                {trustScore}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right flex flex-col items-end">
                                                                    <div className="text-[#CCFF00] font-raj font-bold text-xl leading-none mb-1.5">{formatCurrency(item.rate)}<span className="text-[10px] text-[#444]">/HR</span></div>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            isTrusted ? openRentalModal(item) : openRequestModal(item);
                                                                        }} 
                                                                        className={`px-6 py-2.5 rounded-xl font-raj font-black text-[12px] tracking-[0.1em] uppercase shadow-md transition-all active:scale-95 ${
                                                                            isTrusted 
                                                                            ? 'bg-[#CCFF00] text-black shadow-[#CCFF00]/10 hover:bg-[#DFFF33]' 
                                                                            : 'bg-[#00E5FF] text-black shadow-[#00E5FF]/10 hover:bg-[#33F1FF]'
                                                                        }`}
                                                                    >
                                                                        {isTrusted ? 'RENT' : 'REQUEST'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* BACK SIDE (Asset Specification) */}
                                                        <div className="flip-card-back absolute inset-0 bg-[#0A0A0A] border border-zinc-700 rounded-2xl p-5 shadow-2xl flex flex-col">
                                                            <div className="flex justify-between items-center mb-3 border-b border-zinc-900 pb-2">
                                                                <div>
                                                                    <div className="text-[#00E5FF] font-raj font-black text-[8px] tracking-[0.4em] uppercase italic leading-none mb-1">ASSET_SPECIFICATION</div>
                                                                    <h3 className="text-white font-raj font-bold text-base uppercase leading-none">{item.name}</h3>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="flex items-center justify-end gap-1 text-[#FFD700]">
                                                                        <Star size={10} fill="currentColor" />
                                                                        <span className="text-[10px] font-data font-black">{gearDetails.rating}</span>
                                                                    </div>
                                                                    <div className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest">{gearDetails.rentalsCount} RENTALS</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div 
                                                                        className="bg-[#111] p-2.5 rounded-xl border border-zinc-800 cursor-pointer hover:border-[#CCFF00]/40 transition-all group/owner"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onViewProfile?.(item.owner, 'ID-' + item.owner);
                                                                        }}
                                                                    >
                                                                        <div className="text-zinc-600 font-raj font-bold text-[7px] tracking-widest uppercase mb-0.5 group-hover/owner:text-[#CCFF00]">SOURCE_NODE</div>
                                                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                                                            <UserAvatar name={item.owner} size="xs" />
                                                                            <div className="text-white font-data text-[9px] font-bold truncate group-hover/owner:text-[#CCFF00]">{item.owner}</div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 ml-6 px-1 py-0.5 rounded-sm border" style={{ backgroundColor: `${trustColor}0D`, borderColor: `${trustColor}33` }}>
                                                                            <ShieldCheck size={8} style={{ color: trustColor }} />
                                                                            <span className="text-[7px] font-data tracking-tighter uppercase font-black leading-none" style={{ color: trustColor }}>{trustScore}%</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-[#111] p-2.5 rounded-xl border border-zinc-800">
                                                                        <div className="text-zinc-600 font-raj font-bold text-[7px] tracking-widest uppercase mb-0.5">CONDITION</div>
                                                                        <div className="text-[#CCFF00] font-raj font-black text-[9px] tracking-widest uppercase italic">{gearDetails.condition}</div>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-zinc-950 border border-dashed border-zinc-800 p-3 rounded-xl min-h-[50px]">
                                                                    <p className="text-zinc-400 font-inter text-[11px] leading-relaxed italic opacity-80">
                                                                        "{gearDetails.description}"
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 pt-2 border-t border-zinc-900 flex justify-between items-center">
                                                                <div className="flex items-center gap-2">
                                                                    <Shield size={10} className="text-[#CCFF00]" />
                                                                    <span className="text-[7px] font-raj font-black text-[#CCFF00] tracking-widest uppercase italic">GSD_HUB_VERIFIED</span>
                                                                </div>
                                                                <span className="text-[7px] font-raj font-black text-zinc-700 tracking-[0.4em] uppercase italic">TAP TO REVERT</span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            );
                                        })}
                                {hub.activeRentalSubTab === 'MY_STOCK' && (
                                    <div className="animate-in fade-in duration-300 space-y-4 pb-24">
                                        <button 
                                            onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, isListAssetModalOpen: true } }))}
                                            className="w-full bg-[#121212] border-2 border-dashed border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:border-[#CCFF00]/40 group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-[#CCFF00] transition-colors">
                                                <Plus size={24} />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-zinc-400 font-raj font-bold text-xs tracking-widest uppercase group-hover:text-white">LIST NEW ASSET</div>
                                                <div className="text-zinc-700 font-data text-9px tracking-widest uppercase mt-1">PEER_TO_PEER_OPERATIONS</div>
                                            </div>
                                        </button>

                                        {hub.rentalData.my_stock.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => {
                                            const isSyncing = syncingIds.has(item.id);
                                            
                                            return (
                                                <div key={item.id} className="bg-[#0D0D0D] border border-zinc-900 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group">
                                                    {isSyncing && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center animate-in fade-in duration-300">
                                                        <Loader2 className="text-[#CCFF00] animate-spin" size={24} />
                                                    </div>}
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex gap-4">
                                                            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 overflow-hidden">
                                                               {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package size={24} />}
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-raj font-bold text-lg uppercase leading-none mb-1">{item.name}</div>
                                                                <div className="text-[#333] font-data text-[9px] tracking-widest uppercase">STOCK_ID: {item.id}</div>
                                                            </div>
                                                        </div>
                                                        <div className={`px-2 py-0.5 rounded text-[9px] font-raj font-black tracking-widest border transition-all ${
                                                            item.status === 'RENTED' ? 'bg-[#FFD70011] text-[#FFD700] border-[#FFD70033]' :
                                                            item.status === 'LISTED' ? 'bg-[#00E5FF11] text-[#00E5FF] border-[#00E5FF33]' :
                                                            'bg-zinc-900 text-zinc-500 border-zinc-800'
                                                        }`}>
                                                            {item.status}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-900/50">
                                                        <div>
                                                            <div className="text-[#444] font-data text-[8px] font-bold tracking-widest mb-1">TOTAL_EARNINGS</div>
                                                            <div className="text-white font-raj font-bold text-xl flex items-center gap-1">{formatCurrency(item.earnings)} <ArrowUpRight size={14} className="text-[#CCFF00]" /></div>
                                                        </div>
                                                        <div className="text-right flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleQuickToggleStatus(item.id);
                                                                }} 
                                                                className={`p-2 rounded-lg border flex items-center justify-center transition-all active:scale-95 shadow-lg group/toggle ${
                                                                    item.status === 'RENTED' 
                                                                    ? 'bg-zinc-900 text-[#00f3ff] border-[#00f3ff]/20 hover:border-[#00f3ff]/50' 
                                                                    : 'bg-zinc-900 text-[#FFD700] border-[#FFD700]/20 hover:border-[#FFD700]/50'
                                                                }`}
                                                                title={item.status === 'RENTED' ? 'Set as Available' : 'Set as Rented'}
                                                            >
                                                                <RefreshCw size={14} className={`${isSyncing ? 'animate-spin' : 'group-hover/toggle:rotate-180 transition-transform duration-500'}`} />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openTracking(item.name, item.status);
                                                                }} 
                                                                className="bg-zinc-900 text-[#00f3ff] px-3 py-2 rounded-lg border border-[#00f3ff]/20 flex items-center gap-1.5 text-[10px] font-raj font-bold tracking-widest uppercase active:scale-95 transition-all hover:bg-zinc-800 shadow-lg"
                                                            >
                                                                <LocateFixed size={12} /> LOCATE
                                                            </button>
                                                            <button 
                                                                onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, isStockModalOpen: true, selectedStockItem: item } }))}
                                                                className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-lg font-raj font-bold text-[10px] tracking-widest uppercase hover:text-white transition-colors active:scale-95"
                                                            >
                                                                MANAGE
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {hub.activeRentalSubTab === 'MY_RENTALS' && (
                                    <div className="animate-in fade-in duration-300 space-y-4 pb-24">
                                        {(hub.rentalData.my_rentals || []).filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map(rental => {
                                            const isFlipped = flippedMyRentalId === rental.id;
                                            const rentalMeta = {
                                                owner: rental.id === 'R-9012' ? '@Neo_77' : rental.id === 'R-9015' ? '@Zhora' : '@Deckard',
                                                condition: 'BATTLE_TESTED',
                                                description: 'Advanced tactical unit optimized for campus operations. Maintain power level above 20% to avoid node sync failure.',
                                                rating: '4.9'
                                            };

                                            return (
                                                <div 
                                                    key={rental.id} 
                                                    className="flip-card-container w-full h-[200px] cursor-pointer"
                                                    onClick={() => setFlippedMyRentalId(isFlipped ? null : rental.id)}
                                                >
                                                    <div className={`flip-card-inner relative w-full h-full transition-transform duration-700 ${isFlipped ? 'flipped' : ''}`}>
                                                        
                                                        {/* FRONT SIDE */}
                                                        <div className="flip-card-front absolute inset-0 bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-5 flex justify-between items-center shadow-xl">
                                                            <div>
                                                                <div className="text-white font-raj font-bold text-lg uppercase leading-none mb-1.5">{rental.name}</div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock size={12} className="text-[#CCFF00]" />
                                                                    <span className="text-[#CCFF00] font-data text-[10px] font-bold tracking-widest">{rental.time}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end gap-2">
                                                                <div className={`text-[9px] font-raj font-black px-2 py-0.5 rounded border ${rental.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-green-500/10 text-green-500 border-green-500/30'}`}>
                                                                    {rental.status}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedRentalToRate(rental);
                                                                            setIsRateModalOpen(true);
                                                                        }} 
                                                                        className="bg-zinc-950 text-[#FFD700] px-3 py-1.5 rounded-lg text-[10px] font-raj font-bold border border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-colors uppercase tracking-widest active:scale-95 flex items-center gap-1.5"
                                                                    >
                                                                        <Star size={12} fill="currentColor" /> RATE
                                                                    </button>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleGearReturnSim(rental);
                                                                        }} 
                                                                        className="bg-zinc-950 text-white px-3 py-1.5 rounded-lg text-[10px] font-raj font-bold border border-zinc-800 hover:border-zinc-700 transition-colors uppercase tracking-widest active:scale-95"
                                                                    >
                                                                        RETURN
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* BACK SIDE (Dossier) */}
                                                        <div className="flip-card-back absolute inset-0 bg-[#0A0A0A] border border-zinc-700 rounded-2xl p-5 shadow-2xl flex flex-col">
                                                            <div className="flex justify-between items-center mb-3 border-b border-zinc-900 pb-2">
                                                                <div>
                                                                    <div className="text-[#00E5FF] font-raj font-black text-[8px] tracking-[0.4em] uppercase italic leading-none mb-1">LEASE_PROTOCOL_UPLINK</div>
                                                                    <h3 className="text-white font-raj font-bold text-base uppercase leading-none">{rental.name}</h3>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="flex items-center justify-end gap-1 text-[#FFD700]">
                                                                        <Star size={10} fill="currentColor" />
                                                                        <span className="text-[10px] font-data font-black">{rentalMeta.rating}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div 
                                                                        className="bg-[#111] p-2 rounded-xl border border-zinc-800 cursor-pointer hover:border-[#CCFF00]/40 transition-all group/owner"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onViewProfile?.(rentalMeta.owner, 'ID-' + rentalMeta.owner);
                                                                        }}
                                                                    >
                                                                        <div className="text-zinc-600 font-raj font-bold text-[7px] tracking-widest uppercase mb-0.5 group-hover/owner:text-[#CCFF00]">SOURCE_NODE</div>
                                                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                                                            <UserAvatar name={rentalMeta.owner} size="xs" />
                                                                            <div className="text-white font-data text-[9px] font-bold truncate group-hover/owner:text-[#CCFF00]">{rentalMeta.owner}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-[#111] p-2 rounded-xl border border-zinc-800">
                                                                        <div className="text-zinc-600 font-raj font-bold text-[7px] tracking-widest uppercase mb-0.5">CONDITION</div>
                                                                        <div className="text-[#CCFF00] font-raj font-black text-[9px] tracking-widest uppercase italic">{rentalMeta.condition}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-zinc-950 border border-dashed border-zinc-800 p-3 rounded-xl min-h-[40px]">
                                                                    <p className="text-zinc-400 font-inter text-[10px] leading-tight italic opacity-70">
                                                                        "{rentalMeta.description}"
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-2 pt-1 border-t border-zinc-900 text-center">
                                                                <span className="text-[7px] font-raj font-black text-zinc-700 tracking-[0.4em] uppercase italic">TAP TO REVERT</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {hub.activeRentalSubTab === 'HUB_CUSTODY' && (
                                    <div className="animate-in fade-in duration-300 space-y-4 pb-24">
                                        {(hub.rentalData.hub_custody || []).filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => {
                                            const isPickedUp = pickedUpIds.has(item.id);
                                            
                                            return (
                                                <div key={item.id} className={`bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4 transition-all ${isPickedUp ? 'opacity-40 grayscale' : ''}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex gap-4">
                                                            <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center text-zinc-700 border border-zinc-900">
                                                                {item.status === 'IN_TRANSIT' ? <Truck size={24} /> : item.status === 'VERIFICATION' ? <Eye size={24} /> : item.status === 'LOCKED' ? <Lock size={24} /> : <Shield size={24} />}
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-raj font-bold text-lg uppercase leading-none mb-1.5">{item.name}</div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="text-[#333] font-data text-[9px] tracking-widest uppercase">CASE_ID: {item.id}</div>
                                                                    <span className="text-zinc-800">|</span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock size={10} className="text-zinc-700" />
                                                                        <span className="text-zinc-600 font-data text-[9px] font-bold tracking-widest uppercase">EST: {item.time}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={`px-2 py-0.5 rounded text-[9px] font-raj font-black tracking-widest border transition-all ${
                                                            isPickedUp ? 'bg-zinc-800 text-zinc-600 border-zinc-700' :
                                                            item.status === 'IN_TRANSIT' ? 'bg-[#FF990011] text-[#FF9900] border-[#FF990033]' :
                                                            item.status === 'VERIFICATION' ? 'bg-[#00E5FF11] text-[#00E5FF] border-[#00E5FF33]' :
                                                            item.status === 'LOCKED' ? 'bg-[#FF333311] text-[#FF3333] border-[#FF333333]' :
                                                            'bg-[#CCFF0011] text-[#CCFF00] border-[#CCFF0033]'
                                                        }`}>
                                                            {isPickedUp ? 'PICKED_UP' : item.status}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex gap-3 pt-4 border-t border-zinc-900/50">
                                                        {!isPickedUp && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openTracking(item.name, item.status);
                                                                }}
                                                                className="flex-1 h-14 bg-zinc-900/50 border border-[#00f3ff]/30 text-[#00f3ff] rounded-xl flex items-center justify-center gap-3 font-raj font-black text-xs tracking-widest uppercase active:scale-95 hover:bg-[#00f3ff]/10 transition-all shadow-inner"
                                                            >
                                                                <MapIcon size={20} /> VIEW_ROUTE
                                                            </button>
                                                        )}
                                                        
                                                        {/* PICKUP BUTTON TRIGGERING QR MODAL */}
                                                        <button 
                                                            disabled={isPickedUp}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCustodyPickupInitiate(item);
                                                            }}
                                                            className={`flex-1 h-14 rounded-xl font-raj font-black text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${
                                                                isPickedUp 
                                                                ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800' 
                                                                : 'bg-[#00E5FF] text-black shadow-[#00E5FF]/30 hover:bg-[#33F1FF]'
                                                            }`}
                                                        >
                                                            {isPickedUp ? (
                                                                <Check size={20} strokeWidth={4} />
                                                            ) : (
                                                                <QrCode size={20} />
                                                            )}
                                                            {isPickedUp ? 'SECURED' : 'PICKUP'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {hub.activeRentalSubTab === 'REQUESTS' && (
                                    <div className="animate-in fade-in duration-300 space-y-4 pb-24">
                                        <button 
                                            onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, isUploadRequestModalOpen: true } }))}
                                            className="w-full bg-[#121212] border-2 border-dashed border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:border-[#00E5FF]/40 group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-[#00E5FF] transition-colors">
                                                <Upload size={24} />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-zinc-400 font-raj font-bold text-xs tracking-widest uppercase group-hover:text-white">UPLOAD NEW REQUEST</div>
                                                <div className="text-zinc-700 font-data text-9px tracking-widest uppercase mt-1">BROADCAST_TO_ECOSYSTEM</div>
                                            </div>
                                        </button>

                                        {hub.rentalData.requests.filter(req => req.item.toLowerCase().includes(searchQuery.toLowerCase())).map(req => (
                                            <div key={req.id} className="bg-[#0D0D0D] border border-zinc-900 rounded-2xl p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div 
                                                        className="flex gap-4 items-center cursor-pointer hover:brightness-125 transition-all"
                                                        onClick={() => onViewProfile?.(req.user, 'ID-' + req.user)}
                                                    >
                                                        <UserAvatar name={req.user} size="lg" className="border-[#00E5FF]/30" />
                                                        <div>
                                                            <div className="text-white font-raj font-bold text-base uppercase leading-none mb-1">{req.user}</div>
                                                            <div className="flex items-center gap-1 text-[#FF9900] text-10px font-bold"><Star size={8} fill="#FF9900" /> {req.rating}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[#444] font-data text-8px font-bold tracking-widest mb-1">PROPOSED_RATE</div>
                                                        <div className="text-[#00E5FF] font-raj font-bold text-lg">₹{req.offer}</div>
                                                    </div>
                                                </div>
                                                <div className="bg-black/40 px-3 py-2 rounded-lg mb-5 border border-zinc-900/30">
                                                    <div className="text-zinc-600 font-data text-8px tracking-widest uppercase mb-0.5">ASSET_REQUESTED</div>
                                                    <div className="text-zinc-300 font-raj text-xs font-bold uppercase">{req.item}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleDeclineRequest(req.id)} className="flex-1 bg-zinc-950 border border-zinc-800 text-red-500 py-2.5 rounded-xl font-raj font-bold text-[10px] tracking-widest uppercase active:scale-95">DECLINE</button>
                                                    <button 
                                                        disabled={processingRequestId === req.id}
                                                        onClick={() => handleApproveRequest(req.id)} 
                                                        className="flex-[2] bg-[#00E5FF] text-black py-2.5 rounded-xl font-raj font-bold text-[10px] tracking-widest uppercase active:scale-95 shadow-[0_4px_15px_rgba(204,255,0,0.2)] flex items-center justify-center gap-2"
                                                    >
                                                        {processingRequestId === req.id ? <Loader2 size={14} className="animate-spin" /> : 'APPROVE_DEPLOYMENT'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300">
                                {renderMarketSubNav()}
                                {hub.activeMarketSubTab === 'MARKET' && (
                                    <>
                                        <div className="flex justify-end items-center mb-6 px-1 relative"><button onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} className="bg-white px-5 py-3 rounded-[14px] flex items-center gap-3 text-black font-raj font-bold text-11px tracking-[0.2em] uppercase transition-all shadow-lg active:scale-[0.97]"><ArrowUpDown size={15} className={`transition-transform duration-300 ${isSortMenuOpen ? 'rotate-180 text-[#CCFF00]' : 'text-black'}`} /><span className="text-black">{marketSortOrder === 'NAME_ASC' ? 'BY_NAME' : marketSortOrder === 'PRICE_ASC' ? 'PRICE_L_H' : 'PRICE_H_L'}</span></button>{isSortMenuOpen && (<div className="absolute top-14 right-0 z-[5000] w-56 bg-white border border-zinc-200 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,229,255,0.8)] animate-in zoom-in-modal duration-200">{[{ label: 'NAME (A-Z)', value: 'NAME_ASC', icon: <Hash size={12} /> },{ label: 'PRICE: LOW TO HIGH', value: 'PRICE_ASC', icon: <ArrowUpRight size={12} className="rotate-45" /> },{ label: 'PRICE: HIGH TO LOW', value: 'PRICE_DESC', icon: <ArrowUpRight size={12} className="rotate-[135deg]" /> }].map((opt) => (<button key={opt.value} onClick={() => {setMarketSortOrder(opt.value as MarketSortOrder);setIsSortMenuOpen(false);}} className={`w-full text-left px-4 py-3.5 rounded-xl font-raj font-bold text-[10px] tracking-widest uppercase mb-1 flex items-center justify-between transition-colors ${marketSortOrder === opt.value ? 'bg-black text-white' : 'text-zinc-600'}`}><span className="flex items-center gap-2">{opt.icon} {opt.label}</span></button>))}</div>)}</div>
                                        <div className="grid grid-cols-2 gap-4 pb-24">{getSortedMarketItems().map(item => (<div key={item.id} className="bg-[#121212] border border-[#1A1A1A] rounded-2xl overflow-hidden mb-4"><div className="h-32 bg-zinc-900 flex items-center justify-center"><ShoppingBag size={40} className="text-zinc-800" /></div><div className="p-4"><div className="text-white font-raj font-bold text-sm h-10 overflow-hidden leading-tight mb-4">{item.name}</div><div className="flex justify-between items-center pt-3 border-t border-zinc-900"><div className="text-[#CCFF00] font-raj font-bold text-lg">{formatCurrency(item.price)}</div><button onClick={() => updateState(s => ({ ...s, hub: { ...s.hub, isMarketPurchaseModalOpen: true, selectedMarketStockItem: item } }))} className="bg-[#CCFF00] text-black px-3 py-1.5 rounded-lg font-raj font-bold text-[10px] tracking-widest uppercase transition-all shadow-md active:scale-95">BUY</button></div></div></div>))}</div>
                                    </>
                                )}
                                {hub.activeMarketSubTab === 'MY_ORDERS' && (
                                    <div className="animate-in fade-in duration-300 space-y-4 pb-24">
                                        {hub.marketData.orders.map(order => (
                                            <div key={order.id} className="bg-[#0D0D0D] border border-zinc-900 rounded-2xl p-5 flex flex-col gap-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600"><Truck size={24} /></div>
                                                        <div>
                                                            <div className="text-white font-raj font-bold text-lg uppercase leading-none mb-1">{order.name}</div>
                                                            <div 
                                                                className="flex items-center gap-2 mt-1 cursor-pointer hover:brightness-125 transition-all w-fit"
                                                                onClick={() => onViewProfile?.(order.seller, 'ID-' + order.seller)}
                                                            >
                                                                <UserAvatar name={order.seller} size="xs" />
                                                                <div className="text-[#333] font-data text-[9px] tracking-widest uppercase">FROM: {order.seller}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-2 py-0.5 rounded text-[9px] font-raj font-black tracking-widest border transition-all ${
                                                        order.status === 'DELIVERED' ? 'bg-[#CCFF0011] text-[#CCFF00] border-[#CCFF0033]' :
                                                        order.status === 'IN TRANSIT' ? 'bg-[#00E5FF11] text-[#00E5FF] border-[#00E5FF33]' :
                                                        'bg-zinc-900 text-zinc-500 border-zinc-800'
                                                    }`}>
                                                        {order.status}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t border-zinc-900/50">
                                                    <div className="text-[#CCFF00] font-raj font-bold text-xl">{formatCurrency(order.price)}</div>
                                                    <div className="text-[#666] font-inter text-xs uppercase tracking-widest">{order.arrival}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
                {hub.activeCategory === 'BOUNTIES' && (<>{renderBountySubNav()}{renderBountiesContent()}</>)}
                {hub.activeCategory === 'INVOICES' && renderInvoicesContent()}
            </div>

            <style>{`
                @keyframes vitality-active {
                    0%, 100% { opacity: 1; filter: brightness(1.2); }
                    50% { opacity: 0.6; filter: brightness(0.8); }
                }
                .animate-vitality-active {
                    animation: vitality-active 1.5s infinite ease-in-out;
                }
                @keyframes neon-plate-flicker {
                    0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
                        opacity: 1;
                        box-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, inset 0 0 5px #ff00ff;
                        color: #fff;
                    }
                    20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
                        opacity: 0.4;
                        box-shadow: none;
                        color: #444;
                    }
                }
                .animate-neon-plate {
                    animation: neon-plate-flicker 3s linear infinite;
                    background: #2a002a !important;
                    border: 1px solid #ff00ff !important;
                }

                @keyframes pulse-fast {
                    0%, 100% { transform: scale(1); filter: brightness(1.2); }
                    50% { transform: scale(1.05); filter: brightness(1.4); }
                }
                .animate-pulse-fast {
                    animation: pulse-fast 0.6s ease-in-out infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.02); filter: brightness(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }

                /* 3D Flip Card Styles */
                .flip-card-container {
                    perspective: 1200px;
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .flip-card-container:active {
                    transform: scale(0.97);
                }
                .flip-card-inner {
                    transform-style: preserve-3d;
                    transition: transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.1);
                }
                .flip-card-inner.flipped {
                    transform: rotateY(180deg);
                }
                .flip-card-front, .flip-card-back {
                    backface-visibility: hidden !important;
                    -webkit-backface-visibility: hidden !important;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .flip-card-back {
                    transform: rotateY(180deg);
                }

                /* Z-Space Elevation */
                .z-elevated {
                    transform: translateZ(20px);
                }
                .z-elevated-mid {
                    transform: translateZ(35px);
                }
                .z-elevated-high {
                    transform: translateZ(50px);
                }
            `}</style>
        </div>
    );
};

export default HubView;