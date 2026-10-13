import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, RefreshCw, Trophy, Clock, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import { SpinWheelService, SpinWheelState, SpinResult, AntiCheatService } from '../../services/taskifyCore';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaim: (coins: number) => void;
  spinsUsedToday: number;
  lastSpinDate: string;
  onSpinSuccess: (coins: number, newSpinsUsed: number, newSpinDate: string) => void;
}

const SEGMENT_COLORS = [
  { color: '#1e293b', textColor: '#94a3b8' },
  { color: '#f59e0b', textColor: '#090a0f' },
  { color: '#0f172a', textColor: '#cbd5e1' },
  { color: '#8b5cf6', textColor: '#ffffff' },
  { color: '#1e293b', textColor: '#94a3b8' },
  { color: '#ec4899', textColor: '#ffffff' }, // Jackpot
  { color: '#0f172a', textColor: '#cbd5e1' },
  { color: '#10b981', textColor: '#ffffff' },
];

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  onClose,
  onRewardClaim,
  spinsUsedToday,
  lastSpinDate,
  onSpinSuccess,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<number | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const wheelState: SpinWheelState = { spinsUsedToday, lastSpinDate };
  const eligibility = SpinWheelService.checkEligibility(wheelState);
  const sectors = SpinWheelService.WHEEL_SECTORS;
  const segmentAngle = 360 / sectors.length;

  useEffect(() => {
    if (isOpen) {
      setWonPrize(null);
      setErrorNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;

    const antiCheat = AntiCheatService.evaluateAction('spin-wheel');
    if (!antiCheat.allowed) {
      setErrorNotice(antiCheat.reason || 'Anti-Cheat: Too fast! Tap at human speed.');
      sounds.playWrong();
      return;
    }

    const result = SpinWheelService.executeSpin(wheelState);
    if (!result.success) {
      setErrorNotice(result.error || 'Daily spin limit reached.');
      sounds.playWrong();
      return;
    }

    sounds.playTap();
    setIsSpinning(true);
    setWonPrize(null);
    setErrorNotice(null);

    const targetIndex = result.sliceIndex;
    const targetPrize = result.coinsWon;

    // Full rotations (5 to 8 turns) + alignment to segment center under top pointer
    const extraRounds = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetAngleOnWheel = targetIndex * segmentAngle + segmentAngle / 2;
    const currentBase = rotation - (rotation % 360);
    const stopRotation = currentBase + extraRounds + (360 - targetAngleOnWheel) + 90;

    setRotation(stopRotation);

    const startTime = Date.now();
    const duration = 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(interval);
        setIsSpinning(false);
        setWonPrize(targetPrize);

        const todayStr = SpinWheelService.getTodayDateString();
        const nextUsed = (lastSpinDate === todayStr ? spinsUsedToday : 0) + 1;
        onSpinSuccess(targetPrize, nextUsed, todayStr);

        sounds.playFanfare();
        sounds.playCoin();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
        });
      } else {
        if (Math.random() > 0.4) {
          sounds.playTick();
        }
      }
    }, 120);
  };

  const handleCollect = () => {
    if (wonPrize !== null) {
      sounds.playCoin();
      onRewardClaim(wonPrize);
      setWonPrize(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Lucky Spin & Win</h3>
              <span className="text-[10px] text-neutral-400">Win 5 to 50 Coins</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
              {eligibility.spinsRemaining}/{eligibility.maxSpins} Left
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Wheel Canvas Section */}
        <div className="relative p-6 flex flex-col items-center justify-center overflow-hidden">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Outer Glowing Border Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/30 via-pink-500/20 to-purple-500/30 blur-md pointer-events-none" />
            <div className="absolute -inset-1 rounded-full border-2 border-amber-500/30 pointer-events-none" />

            {/* Top Pointer Indicator */}
            <div className="absolute -top-3 z-20 flex flex-col items-center pointer-events-none">
              <div className="w-5 h-7 bg-amber-400 clip-path-triangle shadow-lg transform -rotate-180 ring-2 ring-neutral-950" />
            </div>

            {/* SVG Wheel */}
            <svg
              viewBox="0 0 300 300"
              className="w-full h-full rounded-full shadow-2xl transition-transform"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isSpinning ? '4000ms' : '0ms',
                transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.25, 1)',
              }}
            >
              <g transform="translate(150, 150)">
                {sectors.map((val, idx) => {
                  const angle = segmentAngle;
                  const startAngle = idx * angle;
                  const endAngle = startAngle + angle;

                  const startRad = ((startAngle - 90) * Math.PI) / 180;
                  const endRad = ((endAngle - 90) * Math.PI) / 180;

                  const r = 145;
                  const x1 = r * Math.cos(startRad);
                  const y1 = r * Math.sin(startRad);
                  const x2 = r * Math.cos(endRad);
                  const y2 = r * Math.sin(endRad);

                  const textRad = ((startAngle + angle / 2 - 90) * Math.PI) / 180;
                  const tx = r * 0.65 * Math.cos(textRad);
                  const ty = r * 0.65 * Math.sin(textRad);
                  const textRot = startAngle + angle / 2;
                  const colors = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];

                  return (
                    <g key={idx}>
                      <path
                        d={`M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                        fill={colors.color}
                        stroke="#090a0f"
                        strokeWidth="2.5"
                      />
                      <text
                        x={tx}
                        y={ty}
                        fill={colors.textColor}
                        fontSize="16"
                        fontWeight="bold"
                        fontFamily="Outfit, sans-serif"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${textRot + 90}, ${tx}, ${ty})`}
                      >
                        +{val}
                      </text>
                    </g>
                  );
                })}
              </g>
              {/* Wheel center pin */}
              <circle cx="150" cy="150" r="22" fill="#090a0f" stroke="#f59e0b" strokeWidth="4" />
              <circle cx="150" cy="150" r="10" fill="#f59e0b" />
            </svg>
          </div>

          {/* Won Prize Celebration Modal */}
          {wonPrize !== null && (
            <div className="absolute inset-0 z-30 bg-neutral-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400 shadow-xl shadow-amber-500/30">
                <Trophy className="w-8 h-8" />
              </div>
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
                Congratulations!
              </span>
              <h4 className="text-3xl font-extrabold font-display text-white mt-1">
                You Won +{wonPrize} Coins!
              </h4>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                Spins remaining today: <span className="font-bold text-amber-400">{eligibility.spinsRemaining}</span>
              </p>

              <button
                onClick={handleCollect}
                className="mt-6 w-full max-w-xs py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
              >
                Claim Coins Now
              </button>
            </div>
          )}
        </div>

        {/* Error notice if 5/5 limit reached */}
        {errorNotice && (
          <div className="mx-4 mb-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Bottom Spin CTA Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3">
          <div className="text-xs text-neutral-400">
            {eligibility.canSpin ? (
              <span>Daily Limit: 5 spins per day</span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Resets in {eligibility.timeUntilResetFormatted}</span>
              </span>
            )}
          </div>

          <button
            disabled={isSpinning || !eligibility.canSpin}
            onClick={handleSpin}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
              isSpinning || !eligibility.canSpin
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/35'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Spinning...' : eligibility.canSpin ? 'Spin Wheel' : 'Limit Reached'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
