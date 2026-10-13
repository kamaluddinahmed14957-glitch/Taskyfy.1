import React, { useState, useEffect } from 'react';
import { Gift, Flame, CheckCircle2, Clock, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { DailyCheckInService, DailyCheckInState, AntiCheatService } from '../services/taskifyCore';

interface DailyRewardSectionProps {
  currentStreak: number;
  lastCheckInTime: number;
  onClaimReward: (rewardAmount: number, nextStreak: number, newCheckInTime: number) => void;
  onResetDailyStreak?: () => void;
}

export const DailyRewardSection: React.FC<DailyRewardSectionProps> = ({
  currentStreak,
  lastCheckInTime,
  onClaimReward,
  onResetDailyStreak,
}) => {
  const [eligibility, setEligibility] = useState(() =>
    DailyCheckInService.checkEligibility({ lastCheckInTime, currentStreak })
  );

  // Update cooldown countdown timer every second
  useEffect(() => {
    const update = () => {
      setEligibility(
        DailyCheckInService.checkEligibility({ lastCheckInTime, currentStreak })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [lastCheckInTime, currentStreak]);

  const activeDayIndex = Math.max(0, (currentStreak - 1) % 7);
  const streakRewards = DailyCheckInService.STREAK_REWARDS;
  const todayReward = eligibility.nextRewardCoins;
  const canClaim = eligibility.canClaim;

  const handleClaim = () => {
    const antiCheat = AntiCheatService.evaluateAction('daily-bonus');
    if (!antiCheat.allowed) {
      sounds.playWrong();
      return;
    }

    const result = DailyCheckInService.claim({ lastCheckInTime, currentStreak });
    if (!result.success) {
      sounds.playWrong();
      return;
    }

    sounds.playCoin();
    sounds.playFanfare();

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#10b981'],
    });

    onClaimReward(result.coinsAwarded, result.newStreak, result.newCheckInTime);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-900/90 border border-neutral-800 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Subtle ambient gold radial background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />

      {/* Top Banner Header: Title & Streak status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-display">Daily Reward</h2>
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                {currentStreak} Day Streak
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Check in consecutively every day to unlock the Day 7 Mega Chest (+100 Coins)!
            </p>
          </div>
        </div>

        {/* Claim / Countdown Status Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!canClaim ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                Next reward in <span className="font-mono font-bold text-amber-400">{eligibility.formattedTimeRemaining}</span>
              </span>
              {onResetDailyStreak && (
                <button
                  onClick={onResetDailyStreak}
                  className="ml-2 p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset Demo Day (Simulate 24h passed to test claiming again)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all cursor-pointer active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-neutral-950" />
              <span>Claim +{todayReward} Coins</span>
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Visual Streak Ladder */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {streakRewards.map((coinsVal, idx) => {
          const isClaimed = idx < activeDayIndex || (idx === activeDayIndex && !canClaim);
          const isCurrentTarget = idx === activeDayIndex && canClaim;
          const isMega = idx === 6;

          return (
            <div
              key={idx + 1}
              onClick={isCurrentTarget ? handleClaim : undefined}
              className={`relative rounded-xl p-2 sm:p-3 text-center flex flex-col items-center justify-between transition-all select-none ${
                isClaimed
                  ? 'bg-neutral-950/70 border border-emerald-500/30 text-neutral-400'
                  : isCurrentTarget
                  ? 'bg-amber-500/15 border-2 border-amber-400 shadow-lg shadow-amber-500/20 text-white cursor-pointer ring-1 ring-amber-400/50 scale-102'
                  : 'bg-neutral-950/50 border border-neutral-800 text-neutral-500'
              } ${isMega ? 'relative overflow-hidden' : ''}`}
            >
              {/* Day Label */}
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider block">
                Day {idx + 1}
              </span>

              {/* Status Graphic / Coin Icon */}
              <div className="my-1 sm:my-2 flex items-center justify-center">
                {isClaimed ? (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                ) : isMega ? (
                  <div className="relative">
                    <Gift className={`w-5 h-5 sm:w-6 sm:h-6 ${isCurrentTarget ? 'text-amber-400 animate-bounce' : 'text-neutral-400'}`} />
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                      isCurrentTarget
                        ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/40'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    ★
                  </div>
                )}
              </div>

              {/* Reward Amount */}
              <span
                className={`text-[11px] sm:text-xs font-bold font-display tabular-nums ${
                  isCurrentTarget
                    ? 'text-amber-300 font-extrabold'
                    : isClaimed
                    ? 'text-neutral-400'
                    : 'text-neutral-300'
                }`}
              >
                +{coinsVal}
              </span>

              {/* Mega Badge for Day 7 */}
              {isMega && !isClaimed && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500 text-neutral-950 shadow">
                  MAX
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
