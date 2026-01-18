
export type BottomTab = 'HOME' | 'HUB' | 'LEADERBOARD' | 'SQUAD' | 'PROFILE';
export type HubCategory = 'GEAR' | 'BOUNTIES' | 'INVOICES';
export type HubMode = 'RENTALS' | 'BUY / SELL';
export type HubRentalSubTab = 'PROCURE' | 'MY_STOCK' | 'MY_RENTALS' | 'HUB_CUSTODY' | 'REQUESTS';
export type HubMarketSubTab = 'MARKET' | 'MY_STOCK' | 'MY_ORDERS';
export type HubBountySubTab = 'BROWSE' | 'ACCEPTED' | 'MY_POSTS';
export type LoginMode = 'SIGN_IN' | 'SIGN_UP';
export type SquadSubTab = 'FIND_SQUADS' | 'MONEY_POTS';

export type BountyCategory = 'WRITTEN_WORK' | 'GUIDANCE' | 'PROJECT_WORK' | 'OTHER';
export type BountySortOrder = 'REWARD_DESC' | 'REWARD_ASC' | 'DATE_DESC' | 'DEADLINE_ASC';
export type Currency = 'INR' | 'USD' | 'EUR';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    type: 'INFO' | 'ALERT' | 'SUCCESS';
}

export interface TransactionRecord {
    id: string;
    type: 'EARN' | 'SPEND' | 'REWARD';
    amount: number;
    description: string;
    timestamp: string;
}

export interface TrustHistoryEntry {
    id: string;
    date: string;
    action: string;
    change: number;
    resultingScore: number;
}

export interface HubItem {
    id: string;
    name: string;
    rate: number;
    verified: boolean;
}

export interface HubRentalItem {
    id: string;
    name: string;
    status: 'ACTIVE' | 'OVERDUE';
    cost: number;
    time: string;
}

export interface HubProcureItem {
    id: string;
    name: string;
    owner: string;
    rate: number;
    imageColor: string;
    icon: string;
}

export interface HubStockItem {
    id: string;
    name: string;
    status: 'RENTED' | 'LISTED' | 'IDLE' | 'RECALLING...';
    earnings: number;
    user: string;
    rate?: number;
    description?: string;
    image?: string | null;
}

export interface HubCustodyItem {
    id: string;
    name: string;
    status: string;
    time: string;
}

export interface HubRequestItem {
    id: string;
    item: string;
    user: string;
    offer: string;
    rating: string;
}

export interface HubMarketItem {
    id: string;
    name: string;
    condition: string;
    price: number;
    imageColor: string;
    icon: string;
    status?: 'ACTIVE' | 'SOLD' | 'DRAFT';
}

export interface HubMarketOrder {
    id: string;
    name: string;
    price: number;
    status: 'IN TRANSIT' | 'DELIVERED' | 'VERIFYING';
    seller: string;
    arrival: string;
}

export interface HubOffer {
    id: string;
    user: string;
    rating: string;
    message: string;
    bid?: number;
}

export interface HubBounty {
    id: string;
    title: string;
    creator: string;
    estimate: string;
    reward: number;
    tags: string[];
    category: BountyCategory;
    description: string;
    postedAtTimestamp: number; // For sorting
    deadlineTimestamp?: number; // Application deadline
    postedAt?: string;
    applicantsCount?: number;
    isHourly?: boolean;
    status?: 'OPEN' | 'ASSIGNED';
    offers?: HubOffer[];
    assignedProvider?: string;
    assignedProviderContact?: string;
    agreedPrice?: number;
    timeSlots?: string;
}

export interface HubInvoice {
    id: string;
    target: string;
    amount: number;
    status: 'PAID' | 'PENDING' | 'OVERDUE' | 'VOID';
    date: string;
    category: 'GEAR' | 'BOUNTY' | 'SYSTEM';
    description: string;
    receiptMetadata?: {
        transactionId: string;
        method: string;
        authCode: string;
        timestamp: string;
        deviceSignature: string;
    };
}

export interface Reward {
    id: number;
    title: string;
    value: string;
    cost: number;
    icon: string;
    color: string;
    isXbox?: boolean;
}

export interface Task {
    id: string;
    text: string;
    completed: boolean;
}

export interface AppSettings {
    notifications: boolean;
    haptics: boolean;
    darkMode: boolean;
    analyticsEnabled: boolean;
    currency: Currency;
}

export interface SquadActivity {
    id: string;
    title: string;
    host: string;
    type: 'BILL SPLIT' | 'HOST PAYS' | 'FREE';
    description: string;
    time: string;
    location: string;
    joined: number;
    total: number;
    iconType: 'FILM' | 'CAR' | 'GAME' | 'COFFEE';
    members?: string[];
}

export interface AppState {
    isLoggedIn: boolean;
    isLoading: boolean;
    loginMode: LoginMode;
    activeBottomTab: BottomTab;
    settings: AppSettings;
    notifications: AppNotification[];
    notificationToast: {
        visible: boolean;
        message: string;
        amount: number;
    } | null;
    home: {
        isOnboarding: boolean;
        boneBalance: number;
        tier: string;
        isVaultOpen: boolean;
        isStreakModalOpen: boolean;
        isPremiumModalOpen: boolean;
        isNotificationsOpen: boolean;
        isSupportOpen: boolean;
        isSettingsOpen: boolean;
        isTicketModalOpen: boolean;
        isAddTaskModalOpen: boolean;
        isAccountModalOpen: boolean;
        isPurchaseSuccess: boolean;
        isDailyProtocolModalOpen?: boolean;
        activeUnlockItem: Reward | null;
        attachedFile: string | null;
        rewards: Reward[];
        tasks: Task[];
        streak: {
            currentStreak: number;
            lastCheckInDate: string; // ISO String
            streakFreezeInventory: number;
            status: 'AT RISK' | 'ACTIVE';
            rewards: string[];
        };
    };
    leaderboard: {
        rankings: Array<{
            rank: number;
            name: string;
            tier: string;
            score: number;
            trend: 'up' | 'down' | 'flat';
        }>;
    };
    hub: {
        activeCategory: HubCategory;
        activeMode: HubMode;
        activeRentalSubTab: HubRentalSubTab;
        activeMarketSubTab: HubMarketSubTab;
        activeBountySubTab: HubBountySubTab;
        bountyFilters: {
            category: BountyCategory | 'ALL';
            tag: string | 'ALL';
            rewardMin: number;
        };
        bountySortOrder: BountySortOrder;
        isRentalModalOpen: boolean;
        isStockModalOpen: boolean;
        isMarketStockModalOpen: boolean;
        isListingModalOpen: boolean;
        isOffersModalOpen: boolean;
        isMarketPurchaseModalOpen: boolean;
        isListAssetModalOpen: boolean;
        isUploadRequestModalOpen: boolean;
        isEditAssetModalOpen: boolean;
        selectedRentalItem: HubProcureItem | null;
        selectedStockItem: HubStockItem | null;
        selectedMarketStockItem: HubMarketItem | null;
        selectedBountyForOffers: HubBounty | null;
        rentalCheckbox: boolean;
        items: HubItem[];
        rentalData: {
            my_rentals: HubRentalItem[];
            procure: HubProcureItem[];
            my_stock: HubStockItem[];
            hub_custody: HubCustodyItem[];
            requests: HubRequestItem[];
        };
        marketData: {
            items: HubMarketItem[];
            myStockItems: HubMarketItem[];
            orders: HubMarketOrder[];
        };
        bountyData: {
            feed: HubBounty[];
            accepted: HubBounty[];
            my_posts: HubBounty[];
        };
        invoices: HubInvoice[];
    };
    squad: {
        activeSubTab: SquadSubTab;
        feed: SquadActivity[];
        joinedSquadIds: string[];
        moneyPots: Array<{
            title: string;
            amount: number;
            badge: string;
            color: string;
            reward: number;
            recipient: string;
            progress: number;
        }>;
    };
    user: {
        name: string;
        id: string;
        rank: string;
        trustScore: number;
        trustHistory: TrustHistoryEntry[];
        lifetimeEarned: number;
        currentProgress: number;
        history: TransactionRecord[];
        bannerImage: string | null;
        avatarImage: string | null;
        bio: string;
    };
}
