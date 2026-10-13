import React from 'react';
import {
  PlayCircle,
  Brain,
  RotateCw,
  CalendarCheck,
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { MicroTask } from '../types';
import { sounds } from '../utils/audio';

interface MicroTasksListProps {
  onOpenVideoAd: () => void;
  onOpenMathQuiz: () => void;
  onOpenSpinWheel: () => void;
  onOpenScratchCard: () => void;
  onDailyCheckIn: () => void;
  hasCheckedInToday: boolean;
}

export const MicroTasksList: React.FC<MicroTasksListProps> = ({
  onOpenVideoAd,
  onOpenMathQuiz,
  onOpenSpinWheel,
  onOpenScratchCard,
  onDailyCheckIn,
  hasCheckedInToday,
}) => {
  const tasks: (MicroTask & { action: () => void; isDone?: boolean })[] = [
    {
      id: 'task-video',
      title: 'Watch Short Video',
      description: 'Watch a quick 8-second sponsor preview to earn instant coins',
      rewardCoins: 10,
      iconType: 'video',
      category: 'Video Ad',
      durationEst: '8 sec',
      dailyLimit: 10,
      completedToday: 3,
      isHot: true,
      action: onOpenVideoAd,
    },
    {
      id: 'task-math',
      title: 'Math Quiz Challenge',
      description: 'Solve 3 fast mental arithmetic questions and score high',
      rewardCoins: 15,
      iconType: 'math',
      category: 'Skill Challenge',
      durationEst: '30 sec',
      dailyLimit: 5,
      completedToday: 1,
      action: onOpenMathQuiz,
    },
    {
      id: 'task-spin',
      title: 'Spin the Wheel',
      description: 'Try your luck on the lucky wheel to win between 5 and 50 coins',
      rewardCoins: 50,
      badge: '5-50 Coins',
      iconType: 'spin',
      category: 'Lucky Draw',
      durationEst: '5 sec',
      dailyLimit: 5,
      completedToday: 2,
      isHot: true,
      action: onOpenSpinWheel,
    },
    {
      id: 'task-checkin',
      title: 'Daily Check-in',
      description: 'Collect your guaranteed daily attendance bonus in one tap',
      rewardCoins: 20,
      iconType: 'checkin',
      category: 'Attendance',
      durationEst: 'Instant',
      dailyLimit: 1,
      completedToday: hasCheckedInToday ? 1 : 0,
      isDone: hasCheckedInToday,
      action: onDailyCheckIn,
    },
    {
      id: 'task-scratch',
      title: 'Scratch & Win',
      description: 'Uncover the shiny golden mystery foil to reveal secret coin rewards',
      rewardCoins: 35,
      badge: '15-35 Coins',
      iconType: 'scratch',
      category: 'Instant Win',
      durationEst: '10 sec',
      dailyLimit: 5,
      completedToday: 1,
      action: onOpenScratchCard,
    },
  ];

  const getTaskIcon = (type: MicroTask['iconType']) => {
    switch (type) {
      case 'video':
        return (
          <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform shadow-lg shadow-rose-500/10">
            <PlayCircle className="w-6 h-6" />
          </div>
        );
      case 'math':
        return (
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/10">
            <Brain className="w-6 h-6" />
          </div>
        );
      case 'spin':
        return (
          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shadow-lg shadow-purple-500/10">
            <RotateCw className="w-6 h-6" />
          </div>
        );
      case 'checkin':
        return (
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/10">
            <CalendarCheck className="w-6 h-6" />
          </div>
        );
      case 'scratch':
        return (
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shadow-lg shadow-amber-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400">
            <Layers className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <span>Available Micro-Tasks</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
              {tasks.length} Active
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Complete quick tasks and watch your live coin balance grow instantly.
          </p>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => {
              if (task.isDone) return;
              sounds.playTap();
              task.action();
            }}
            className={`group relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-200 select-none flex flex-col justify-between ${
              task.isDone
                ? 'bg-neutral-950/60 border-neutral-800/80 opacity-70 cursor-default'
                : 'bg-neutral-900/90 hover:bg-neutral-900 border-neutral-800 hover:border-amber-500/40 shadow-lg hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer active:scale-[0.99]'
            }`}
          >
            {/* Top row: Icon + Titles + Reward pill */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                {getTaskIcon(task.iconType)}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-display group-hover:text-amber-300 transition-colors">
                      {task.title}
                    </h3>
                    {task.isHot && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                        <Flame className="w-3 h-3 fill-red-400" /> HOT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>

              {/* Reward Amount Badge */}
              <div className="shrink-0 flex flex-col items-end">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-xs font-display tracking-tight flex items-center gap-1 shadow-sm">
                  <span>+{task.badge || `${task.rewardCoins} Coins`}</span>
                </span>
              </div>
            </div>

            {/* Bottom Row: Metadata & Action CTA */}
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  {task.durationEst}
                </span>
                <span className="text-neutral-600">·</span>
                <span>
                  {task.completedToday}/{task.dailyLimit} done today
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-semibold text-xs transition-colors">
                {task.isDone ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Claimed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-transform">
                    Start Task <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
