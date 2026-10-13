export type WithdrawalMethodId = 'bkash' | 'nagad' | 'recharge' | 'paypal';

export interface WithdrawalMethod {
  id: WithdrawalMethodId;
  name: string;
  category: 'mfs' | 'telecom' | 'global';
  iconColor: string;
  accentBg: string;
  minCoins: number;
  ratePerCoin: number; // e.g., 0.12 BDT or 0.001 USD
  currency: string;
  symbol: string;
  accountPlaceholder: string;
  accountLabel: string;
  badge?: string;
}

export interface WithdrawalTransaction {
  id: string;
  methodId: WithdrawalMethodId;
  methodName: string;
  account: string;
  coins: number;
  payoutAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  date: string;
  trxId: string;
}

export interface MicroTask {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  iconType: 'video' | 'math' | 'spin' | 'checkin' | 'scratch' | 'survey';
  category: string;
  badge?: string;
  durationEst: string;
  dailyLimit: number;
  completedToday: number;
  cooldownSeconds?: number;
  isHot?: boolean;
}

export interface ActivityLog {
  id: string;
  taskTitle: string;
  rewardCoins: number;
  timestamp: string;
  type: 'earn' | 'redeem' | 'bonus';
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  earnedCoins: number;
  country: string;
  isUser?: boolean;
}
