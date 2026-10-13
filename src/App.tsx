/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wallet,
  Trophy,
  History,
  CheckCircle2,
  Gift,
  Coins,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Code2,
  ShieldAlert,
  HelpCircle,
  X,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { Header } from './components/Header';
import { DailyRewardSection } from './components/DailyRewardSection';
import { MicroTasksList } from './components/MicroTasksList';
import { WalletSection } from './components/WalletSection';
import { LeaderboardSection } from './components/LeaderboardSection';
import { ActivitySection } from './components/ActivitySection';
import { Footer } from './components/Footer';

import { VideoAdModal } from './components/modals/VideoAdModal';
import { MathQuizModal } from './components/modals/MathQuizModal';
import { SpinWheelModal } from './components/modals/SpinWheelModal';
import { ScratchCardModal } from './components/modals/ScratchCardModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { CodeViewerModal } from './components/modals/CodeViewerModal';
import { PrivacyPolicyModal } from './components/modals/PrivacyPolicyModal';
import { AboutHelpModal } from './components/modals/AboutHelpModal';

import { ActivityLog, WithdrawalTransaction } from './types';
import { sounds } from './utils/audio';
import {
  taskifyCoinSystem,
  DailyCheckInService,
  SpinWheelService,
  AntiCheatService,
} from './services/taskifyCore';

type ActiveTab = 'tasks' | 'wallet' | 'leaderboard' | 'activity';

const INITIAL_COINS = 340;
const INITIAL_STREAK = 3;
const INITIAL_TRANSACTIONS: WithdrawalTransaction[] = [
  {
    id: 'tx-101',
    methodId: 'bkash',
    methodName: 'bKash',
    account: '01712-884920',
    coins: 1000,
    payoutAmount: 120,
    currency: 'BDT',
    status: 'completed',
    date: 'Yesterday, 04:30 PM',
    trxId: 'BK9A8201',
  },
  {
    id: 'tx-102',
    methodId: 'recharge',
    methodName: 'Mobile Recharge',
    account: '01899-441203 (Robi)',
    coins: 1000,
    payoutAmount: 120,
    currency: 'BDT',
    status: 'completed',
    date: '2 days ago, 11:15 AM',
    trxId: 'RC5X1904',
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    taskTitle: 'Welcome Bonus Claimed',
    rewardCoins: 100,
    timestamp: 'Today, 09:00 AM',
    type: 'bonus',
  },
  {
    id: 'log-2',
    taskTitle: 'Daily Check-in Day 3',
    rewardCoins: 30,
    timestamp: 'Today, 09:05 AM',
    type: 'bonus',
  },
  {
    id: 'log-3',
    taskTitle: 'Watch Short Video',
    rewardCoins: 10,
    timestamp: 'Today, 10:20 AM',
    type: 'earn',
  },
  {
    id: 'log-4',
    taskTitle: 'Math Quiz Challenge',
    rewardCoins: 15,
    timestamp: 'Today, 11:45 AM',
    type: 'earn',
  },
];

export default function App() {
  // 1. Live Coins Balance dynamically driven by CoinSystem
  const [coins, setCoins] = useState<number>(() => {
    return taskifyCoinSystem.getBalance();
  });

  // 2. Daily check-in 24h timestamp & streak
  const [lastCheckInTime, setLastCheckInTime] = useState<number>(() => {
    const saved = localStorage.getItem('taskify_last_checkin_time');
    return saved !== null ? parseInt(saved, 10) : Date.now() - 8 * 60 * 60 * 1000;
  });

  const [currentStreak, setCurrentStreak] = useState<number>(() => {
    const saved = localStorage.getItem('taskify_streak');
    return saved !== null ? parseInt(saved, 10) : INITIAL_STREAK;
  });

  // 3. Spin Wheel 5 daily spins limit state
  const [spinsUsedToday, setSpinsUsedToday] = useState<number>(() => {
    const saved = localStorage.getItem('taskify_spins_used');
    return saved !== null ? parseInt(saved, 10) : 1;
  });

  const [lastSpinDate, setLastSpinDate] = useState<string>(() => {
    const saved = localStorage.getItem('taskify_last_spin_date');
    return saved || SpinWheelService.getTodayDateString();
  });

  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(() => {
    return localStorage.getItem('taskify_checked_in') === 'true';
  });

  const [completedTasksCount, setCompletedTasksCount] = useState<number>(() => {
    const saved = localStorage.getItem('taskify_tasks_done');
    return saved !== null ? parseInt(saved, 10) : 5;
  });

  const [transactions, setTransactions] = useState<WithdrawalTransaction[]>(() => {
    const saved = localStorage.getItem('taskify_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('taskify_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gainingCoins, setGainingCoins] = useState<number | null>(null);

  // Safety & Anti-Cheat state
  const [antiCheatAlert, setAntiCheatAlert] = useState<string | null>(null);

  // Modals state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isSpinModalOpen, setIsSpinModalOpen] = useState(false);
  const [isScratchModalOpen, setIsScratchModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // User profile details
  const [userName] = useState('Alex Vance');
  const [userAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80');
  const [referralCode] = useState('TASK88');

  // Observer Pattern: Subscribe to CoinSystem for dynamic real-time balance updates
  useEffect(() => {
    const unsubscribe = taskifyCoinSystem.subscribe((newBalance, prevBalance, diff) => {
      setCoins(newBalance);
      if (diff > 0) {
        setGainingCoins(diff);
        setTimeout(() => setGainingCoins(null), 1800);
      }
    });
    return unsubscribe;
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('taskify_last_checkin_time', lastCheckInTime.toString());
  }, [lastCheckInTime]);

  useEffect(() => {
    localStorage.setItem('taskify_streak', currentStreak.toString());
  }, [currentStreak]);

  useEffect(() => {
    localStorage.setItem('taskify_spins_used', spinsUsedToday.toString());
  }, [spinsUsedToday]);

  useEffect(() => {
    localStorage.setItem('taskify_last_spin_date', lastSpinDate);
  }, [lastSpinDate]);

  useEffect(() => {
    localStorage.setItem('taskify_checked_in', hasCheckedInToday.toString());
  }, [hasCheckedInToday]);

  useEffect(() => {
    localStorage.setItem('taskify_tasks_done', completedTasksCount.toString());
  }, [completedTasksCount]);

  useEffect(() => {
    localStorage.setItem('taskify_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('taskify_logs', JSON.stringify(logs));
  }, [logs]);

  // Audio mute sync
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Anti-Cheat Action Gatekeeper
  const checkAntiCheat = (actionKey: string): boolean => {
    const evaluation = AntiCheatService.evaluateAction(actionKey);
    if (!evaluation.allowed) {
      sounds.playWrong();
      setAntiCheatAlert(evaluation.reason || 'Anti-Cheat Shield: Rapid clicking detected. Please tap at normal human speed.');
      setTimeout(() => {
        setAntiCheatAlert(null);
      }, 4500);
      return false;
    }
    return true;
  };

  // Dynamic coin addition via CoinSystem with Anti-Cheat Protection
  const addCoinsWithAnimation = (amount: number, taskTitle: string, type: 'earn' | 'bonus' = 'earn') => {
    if (!checkAntiCheat(`reward-${taskTitle.slice(0, 10)}`)) {
      return;
    }

    taskifyCoinSystem.addCoins(amount, taskTitle, type);
    setCompletedTasksCount((prev) => prev + 1);

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      taskTitle,
      rewardCoins: amount,
      timestamp: 'Just now',
      type,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // 1. Daily Bonus claim handler
  const handleClaimDailyBonus = (rewardAmount: number, nextStreak: number, newCheckInTime: number) => {
    if (!checkAntiCheat('daily-bonus-claim')) {
      return;
    }
    setLastCheckInTime(newCheckInTime);
    setCurrentStreak(nextStreak);
    addCoinsWithAnimation(rewardAmount, `Daily Streak Bonus (Day ${((nextStreak - 1) % 7) + 1})`, 'bonus');
  };

  // Reset 24-hour timer for demo verification
  const handleResetDailyCooldown = () => {
    const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
    setLastCheckInTime(twentyFiveHoursAgo);
    setHasCheckedInToday(false);
    sounds.playTap();
  };

  // 2. Direct Daily Check-in handler
  const handleDailyCheckIn = () => {
    if (hasCheckedInToday) return;
    if (!checkAntiCheat('daily-checkin')) {
      return;
    }

    sounds.playFanfare();
    sounds.playCoin();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });

    setHasCheckedInToday(true);
    addCoinsWithAnimation(20, 'Daily Attendance Check-in', 'bonus');
  };

  // 3. Spin success handler
  const handleSpinSuccess = (coinsWon: number, newSpinsUsed: number, newSpinDate: string) => {
    setSpinsUsedToday(newSpinsUsed);
    setLastSpinDate(newSpinDate);
  };

  // 4. Withdrawal handler
  const handleWithdraw = (txData: Omit<WithdrawalTransaction, 'id' | 'date' | 'status' | 'trxId'>): boolean => {
    if (txData.coins > coins) {
      return false;
    }

    try {
      taskifyCoinSystem.deductCoins(txData.coins, txData.methodName);
    } catch {
      return false;
    }

    const newTx: WithdrawalTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      date: 'Just now',
      status: 'pending',
      trxId: `TX-${txData.methodId.slice(0, 2).toUpperCase()}${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      taskTitle: `Cash Redemption Request (${txData.methodName})`,
      rewardCoins: txData.coins,
      timestamp: 'Just now',
      type: 'redeem',
    };
    setLogs((prev) => [newLog, ...prev]);

    return true;
  };

  // Simulate admin approving and paying out a pending request
  const handleApproveTransaction = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === txId ? { ...tx, status: 'completed' as const } : tx
      )
    );
    sounds.playFanfare();
    sounds.playCoin();
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });
  };

  // Reset Demo State
  const handleResetData = () => {
    taskifyCoinSystem.reset(INITIAL_COINS);
    setCurrentStreak(INITIAL_STREAK);
    setLastCheckInTime(Date.now() - 25 * 60 * 60 * 1000);
    setHasCheckedInToday(false);
    setSpinsUsedToday(0);
    setLastSpinDate(SpinWheelService.getTodayDateString());
    setCompletedTasksCount(5);
    setTransactions(INITIAL_TRANSACTIONS);
    setLogs(INITIAL_LOGS);
    AntiCheatService.reset();
    localStorage.clear();
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col font-sans pb-24 md:pb-6 antialiased selection:bg-amber-400 selection:text-neutral-950 relative">
      {/* Anti-Cheat Floating Banner Toast */}
      {antiCheatAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] px-4 py-3 rounded-2xl bg-red-950/90 border-2 border-red-500/80 backdrop-blur-xl shadow-2xl flex items-start gap-3 animate-bounce">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-white block">Anti-Cheat Shield Active</span>
            <span className="text-red-200 mt-0.5 block leading-relaxed">{antiCheatAlert}</span>
          </div>
          <button
            onClick={() => setAntiCheatAlert(null)}
            className="text-neutral-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header (App Name: Taskify, Avatar, Live Coin Balance) */}
      <Header
        coins={coins}
        userName={userName}
        userAvatar={userAvatar}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onNavigateWallet={() => setActiveTab('wallet')}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        gainingCoins={gainingCoins}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
        {/* Navigation Tabs (Desktop & Tablet) */}
        <div className="hidden md:flex items-center justify-between mb-6 border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 rounded-2xl border border-neutral-800">
            <button
              onClick={() => {
                setActiveTab('tasks');
                sounds.playTap();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'tasks'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Earn Tasks</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('wallet');
                sounds.playTap();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'wallet'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Wallet & Withdraw</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('leaderboard');
                sounds.playTap();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('activity');
                sounds.playTap();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Activity Log</span>
            </button>
          </div>

          {/* Quick Action: Safety & Logic Shortcuts */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setIsAboutModalOpen(true);
                sounds.playTap();
              }}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400 text-xs font-bold text-neutral-300 hover:text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="About Taskify & Safety Guidelines"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>About & Help</span>
            </button>

            <button
              onClick={() => {
                setIsCodeModalOpen(true);
                sounds.playTap();
              }}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-amber-400 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="View functional JavaScript and Dart logic"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Logic</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* 2. Daily Reward Section with 24-hour cooldown */}
            <DailyRewardSection
              currentStreak={currentStreak}
              lastCheckInTime={lastCheckInTime}
              onClaimReward={handleClaimDailyBonus}
              onResetDailyStreak={handleResetDailyCooldown}
            />

            {/* 3. Micro-Tasks List Section */}
            <MicroTasksList
              onOpenVideoAd={() => setIsVideoModalOpen(true)}
              onOpenMathQuiz={() => setIsMathModalOpen(true)}
              onOpenSpinWheel={() => setIsSpinModalOpen(true)}
              onOpenScratchCard={() => setIsScratchModalOpen(true)}
              onDailyCheckIn={handleDailyCheckIn}
              hasCheckedInToday={hasCheckedInToday}
            />

            {/* Store Policy & Fair Play Card */}
            <div className="rounded-2xl sm:rounded-3xl bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-display">
                    Activity-Based Rewards Guarantee (Zero Gambling)
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Taskify adheres strictly to Google Play and Uptodown app policies. Points are rewarded purely for human activity.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAboutModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-400 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  Learn How Points Work
                </button>
                <button
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-400 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  Privacy Policy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Withdrawal / Wallet Section */}
        {activeTab === 'wallet' && (
          <WalletSection
            coins={coins}
            onWithdraw={handleWithdraw}
            transactions={transactions}
            onApproveTransaction={handleApproveTransaction}
            onAddDemoCoins={() => addCoinsWithAnimation(1000, 'Developer Test Grant (+1,000c)')}
          />
        )}

        {/* Leaderboard View */}
        {activeTab === 'leaderboard' && (
          <LeaderboardSection userCoins={coins} userName={userName} />
        )}

        {/* Activity Log View */}
        {activeTab === 'activity' && <ActivitySection logs={logs} />}
      </main>

      {/* Safety & App Store Compliant Footer */}
      <Footer
        onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
        onOpenAboutHelp={() => setIsAboutModalOpen(true)}
      />

      {/* Mobile Floating Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800 px-4 py-2 shadow-2xl">
        <div className="grid grid-cols-4 items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('tasks');
              sounds.playTap();
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'tasks' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-1">Tasks</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('wallet');
              sounds.playTap();
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'wallet' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] mt-1">Wallet</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('leaderboard');
              sounds.playTap();
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'leaderboard' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] mt-1">Ranks</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('activity');
              sounds.playTap();
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'activity' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] mt-1">History</span>
          </button>
        </div>
      </nav>

      {/* Interactive Micro-Task Modals */}
      <VideoAdModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onRewardClaim={(earned) => addCoinsWithAnimation(earned, 'Watch Short Video (+10c)')}
      />

      <MathQuizModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        onRewardClaim={(earned) => addCoinsWithAnimation(earned, 'Math Quiz Challenge (+15c)')}
      />

      <SpinWheelModal
        isOpen={isSpinModalOpen}
        onClose={() => setIsSpinModalOpen(false)}
        onRewardClaim={(earned) => addCoinsWithAnimation(earned, `Lucky Spin Wheel (+${earned}c)`)}
        spinsUsedToday={spinsUsedToday}
        lastSpinDate={lastSpinDate}
        onSpinSuccess={handleSpinSuccess}
      />

      <ScratchCardModal
        isOpen={isScratchModalOpen}
        onClose={() => setIsScratchModalOpen(false)}
        onRewardClaim={(earned) => addCoinsWithAnimation(earned, `Scratch Mystery Card (+${earned}c)`)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userName={userName}
        userAvatar={userAvatar}
        coins={coins}
        completedTasksCount={completedTasksCount}
        currentStreak={currentStreak}
        referralCode={referralCode}
        onResetData={handleResetData}
      />

      <CodeViewerModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <AboutHelpModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}
