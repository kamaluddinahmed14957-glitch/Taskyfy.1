import React from 'react';
import { Coins, Volume2, VolumeX, Sparkles, User, Wallet } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  coins: number;
  userName: string;
  userAvatar: string;
  onOpenProfile: () => void;
  onNavigateWallet: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  gainingCoins?: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  coins,
  userName,
  userAvatar,
  onOpenProfile,
  onNavigateWallet,
  soundEnabled,
  onToggleSound,
  gainingCoins,
}) => {
  // Approximate conversion: 1,000 Coins = $1.00 USD
  const usdValue = (coins / 1000).toFixed(2);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-neutral-950/85 border-b border-neutral-800/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-1 ring-amber-300/40">
              <Sparkles className="w-5 h-5 text-neutral-950" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight font-display text-white group-hover:text-amber-400 transition-colors">
                  Taskify
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Earn
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Live Balance & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle button */}
          <button
            onClick={() => {
              onToggleSound();
              sounds.playTap();
            }}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            title={soundEnabled ? 'Sound is on' : 'Sound is muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
          </button>

          {/* Live Coin Balance Pill */}
          <button
            onClick={() => {
              onNavigateWallet();
              sounds.playTap();
            }}
            className="relative group flex items-center gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-neutral-900/90 border border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            title="Click to view wallet and withdraw"
          >
            {/* Pulsing Coin Icon */}
            <div className="relative flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-500/30">
                <Coins className="w-4 h-4 text-neutral-950" strokeWidth={2.4} />
              </div>
              <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping pointer-events-none opacity-40" />
            </div>

            {/* Numerical Balance */}
            <div className="text-left flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-bold font-display tabular-nums tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  {coins.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-amber-400 uppercase">
                  Coins
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono -mt-0.5">
                ≈ ${usdValue}
              </span>
            </div>

            {/* Quick Wallet CTA icon */}
            <div className="hidden sm:flex items-center pl-1 border-l border-neutral-800">
              <Wallet className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-400 transition-colors" />
            </div>

            {/* Coin Increment Flash Animation */}
            {gainingCoins !== null && gainingCoins !== undefined && (
              <span className="absolute -top-3 right-0 sm:right-2 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-neutral-950 shadow-lg animate-bounce pointer-events-none">
                +{gainingCoins}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => {
              onOpenProfile();
              sounds.playTap();
            }}
            className="flex items-center gap-2 p-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group active:scale-95"
            title="User Profile & Settings"
          >
            <div className="relative">
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-neutral-700 group-hover:ring-amber-400 transition-all"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-neutral-950" />
            </div>
            <span className="hidden md:inline-block text-xs font-semibold text-neutral-300 group-hover:text-white max-w-[90px] truncate pr-1.5">
              {userName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
