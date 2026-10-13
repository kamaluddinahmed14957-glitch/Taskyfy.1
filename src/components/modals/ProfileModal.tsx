import React, { useState } from 'react';
import {
  X,
  User,
  Copy,
  Check,
  Trophy,
  Coins,
  Share2,
  Sparkles,
  Flame,
  Award,
  RefreshCw,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userAvatar: string;
  coins: number;
  completedTasksCount: number;
  currentStreak: number;
  referralCode: string;
  onResetData: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userName,
  userAvatar,
  coins,
  completedTasksCount,
  currentStreak,
  referralCode,
  onResetData,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    sounds.playTap();
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white font-display">User Profile</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Avatar and Info Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={userAvatar}
                alt={userName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-neutral-950 shadow">
                <Award className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-display text-white">{userName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Level 3 Earner
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">ID: TK-982410</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block">
                Current Coins
              </span>
              <span className="text-base font-bold text-amber-300 font-display tabular-nums mt-0.5 block">
                {coins.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block">
                Tasks Done
              </span>
              <span className="text-base font-bold text-white font-display tabular-nums mt-0.5 block">
                {completedTasksCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block">
                Streak
              </span>
              <span className="text-base font-bold text-orange-400 font-display tabular-nums mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                {currentStreak}d
              </span>
            </div>
          </div>

          {/* Referral Code Share Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Invite Friends (+50 Coins each)</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase">Referral Link</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 font-mono text-xs text-amber-300 font-bold tracking-widest text-center select-all">
                {referralCode}
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Reset Demo Data Action */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Tester Tools</span>
            <button
              onClick={() => {
                if (confirm('Reset state to initial sample coins and clean history?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-neutral-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
