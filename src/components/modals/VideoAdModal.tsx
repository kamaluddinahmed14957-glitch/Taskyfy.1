import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface VideoAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaim: (coins: number) => void;
}

export const VideoAdModal: React.FC<VideoAdModalProps> = ({
  isOpen,
  onClose,
  onRewardClaim,
}) => {
  const TOTAL_DURATION = 8; // 8-second video
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_DURATION);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(TOTAL_DURATION);
      setIsPlaying(true);
      setIsCompleted(false);
      return;
    }

    const interval = setInterval(() => {
      if (isPlaying) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsCompleted(true);
            sounds.playFanfare();
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#f59e0b', '#10b981', '#3b82f6'],
            });
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round(((TOTAL_DURATION - secondsLeft) / TOTAL_DURATION) * 100));

  const handleClaim = () => {
    sounds.playCoin();
    onRewardClaim(10);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-4 py-3 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-neutral-300">Sponsored Ad Stream</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium text-amber-400">
              {isCompleted ? 'Finished' : `${secondsLeft}s`}
            </span>
            <button
              onClick={() => {
                if (isCompleted || secondsLeft <= 3) {
                  onClose();
                } else if (confirm('Cancel video? You will not earn the +10 coins reward.')) {
                  onClose();
                }
              }}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Canvas Simulation */}
        <div className="relative aspect-video bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950/40 flex items-center justify-center overflow-hidden">
          {/* Animated decorative graphics */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500 rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Ad Creative Representation */}
          <div className="z-10 text-center px-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-neutral-200 text-xs backdrop-blur-md mb-3 border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Partner Offer</span>
            </div>
            <h3 className="text-xl font-bold font-display text-white tracking-tight">
              CloudSpeed Pro VPN
            </h3>
            <p className="text-xs text-neutral-300 mt-1 max-w-xs mx-auto">
              Ultra-fast privacy protection & unlimited bandwidth across all your devices.
            </p>

            {/* Play/Pause control center */}
            {!isCompleted && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Progress bar line */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 bg-neutral-950 flex flex-col gap-2">
          {isCompleted ? (
            <button
              onClick={handleClaim}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Collect +10 Coins Now</span>
            </button>
          ) : (
            <div className="flex items-center justify-between text-xs text-neutral-400 py-1">
              <span>Watch until countdown ends to receive reward</span>
              <span className="font-mono text-amber-400 font-semibold">{secondsLeft}s left</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
