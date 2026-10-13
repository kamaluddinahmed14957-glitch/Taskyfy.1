import React from 'react';
import { ActivityLog } from '../types';
import { Sparkles, ArrowDownRight, Gift, Layers, CheckCircle } from 'lucide-react';

interface ActivitySectionProps {
  logs: ActivityLog[];
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({ logs }) => {
  return (
    <section className="bg-neutral-900/90 rounded-2xl sm:rounded-3xl border border-neutral-800 p-5 sm:p-7 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold font-display text-white">Earning & Task Activity</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time feed of all rewarded actions on your account.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 font-mono">
          {logs.length} Entries
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="py-12 text-center text-neutral-500 text-xs">
          <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <span>No activity recorded yet.</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => {
            const isRedeem = log.type === 'redeem';
            const isBonus = log.type === 'bonus';

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-neutral-800 transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isRedeem
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : isBonus
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isRedeem ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : isBonus ? (
                      <Gift className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-white font-display text-sm block">
                      {log.taskTitle}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {log.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 font-mono font-bold text-sm">
                  <span
                    className={
                      isRedeem ? 'text-red-400' : 'text-emerald-400 font-extrabold'
                    }
                  >
                    {isRedeem ? `-${log.rewardCoins}` : `+${log.rewardCoins}`}
                  </span>
                  <span className="text-[10px] text-neutral-400">Coins</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
