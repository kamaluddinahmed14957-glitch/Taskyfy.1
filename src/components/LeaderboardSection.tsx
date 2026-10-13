import React from 'react';
import { Trophy, Medal, Award, Flame, Coins, ShieldCheck } from 'lucide-react';
import { LeaderboardUser } from '../types';

interface LeaderboardSectionProps {
  userCoins: number;
  userName: string;
}

const TOP_USERS: LeaderboardUser[] = [
  {
    rank: 1,
    name: 'Tanvir Hossain',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    earnedCoins: 18450,
    country: 'BD',
  },
  {
    rank: 2,
    name: 'Sarah Rahman',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    earnedCoins: 14200,
    country: 'BD',
  },
  {
    rank: 3,
    name: 'Fahim Ahmed',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    earnedCoins: 11980,
    country: 'BD',
  },
  {
    rank: 4,
    name: 'Nusrat Jahan',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
    earnedCoins: 9850,
    country: 'BD',
  },
  {
    rank: 5,
    name: 'Arif Chowdhury',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    earnedCoins: 8420,
    country: 'BD',
  },
  {
    rank: 6,
    name: 'David Miller',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    earnedCoins: 7600,
    country: 'US',
  },
];

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  userCoins,
  userName,
}) => {
  return (
    <section className="space-y-6">
      {/* Top Podium Feature */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-900/90 border border-neutral-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center max-w-md mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Weekly Top Earners Hall of Fame</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Taskify Champions</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Top 3 earners every Sunday win an extra +500 Bonus Coins!
          </p>
        </div>

        {/* Podium Top 3 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto items-end pt-4 pb-2">
          {/* Rank 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-800 border-2 border-slate-300 flex items-center justify-center font-bold text-white text-sm shadow-lg overflow-hidden">
                <span className="text-slate-300 font-display">2nd</span>
              </div>
              <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-slate-300 text-neutral-950 font-black text-[10px]">
                #2
              </span>
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[90px] font-display">
              {TOP_USERS[1].name}
            </span>
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              {TOP_USERS[1].earnedCoins.toLocaleString()}c
            </span>
          </div>

          {/* Rank 1 */}
          <div className="flex flex-col items-center text-center -translate-y-3">
            <div className="relative mb-2">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-amber-300 flex items-center justify-center font-black text-neutral-950 text-base shadow-xl shadow-amber-500/25 overflow-hidden">
                <Trophy className="w-8 h-8 text-neutral-950" />
              </div>
              <span className="absolute -top-2.5 -right-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-black text-xs shadow">
                #1
              </span>
            </div>
            <span className="text-sm font-extrabold text-white truncate max-w-[110px] font-display">
              {TOP_USERS[0].name}
            </span>
            <span className="text-xs font-mono text-amber-300 font-extrabold">
              {TOP_USERS[0].earnedCoins.toLocaleString()}c
            </span>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-800 border-2 border-amber-700 flex items-center justify-center font-bold text-white text-sm shadow-lg overflow-hidden">
                <span className="text-amber-600 font-display">3rd</span>
              </div>
              <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-amber-700 text-neutral-100 font-black text-[10px]">
                #3
              </span>
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[90px] font-display">
              {TOP_USERS[2].name}
            </span>
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              {TOP_USERS[2].earnedCoins.toLocaleString()}c
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="bg-neutral-900/90 rounded-2xl sm:rounded-3xl border border-neutral-800 p-5 shadow-xl">
        <h3 className="text-base font-bold font-display text-white mb-4">Rankings</h3>

        <div className="space-y-2.5">
          {TOP_USERS.map((user) => (
            <div
              key={user.rank}
              className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 text-center font-display font-extrabold text-sm ${
                    user.rank === 1
                      ? 'text-amber-400'
                      : user.rank === 2
                      ? 'text-slate-300'
                      : user.rank === 3
                      ? 'text-amber-600'
                      : 'text-neutral-500'
                  }`}
                >
                  #{user.rank}
                </span>

                <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-neutral-300 text-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <span className="font-bold text-white font-display text-sm block">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-neutral-500">Region: {user.country}</span>
                </div>
              </div>

              <div className="flex items-baseline gap-1 font-mono font-bold text-sm text-amber-300">
                <span>{user.earnedCoins.toLocaleString()}</span>
                <span className="text-[10px] text-amber-400/80">Coins</span>
              </div>
            </div>
          ))}

          {/* User's Current Position */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs mt-4">
            <div className="flex items-center gap-3">
              <span className="w-6 text-center font-display font-extrabold text-sm text-amber-400">
                #24
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-extrabold text-xs">
                YOU
              </div>
              <div>
                <span className="font-bold text-white font-display text-sm block">
                  {userName} (You)
                </span>
                <span className="text-[10px] text-amber-400">Keep completing tasks to rank up!</span>
              </div>
            </div>

            <div className="flex items-baseline gap-1 font-mono font-bold text-sm text-amber-300">
              <span>{userCoins.toLocaleString()}</span>
              <span className="text-[10px] text-amber-400/80">Coins</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
