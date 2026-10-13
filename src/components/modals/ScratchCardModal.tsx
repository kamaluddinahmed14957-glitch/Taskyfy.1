import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Sparkles, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface ScratchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaim: (coins: number) => void;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({
  isOpen,
  onClose,
  onRewardClaim,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prizeCoins, setPrizeCoins] = useState(25);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const isDrawing = useRef(false);

  const initCard = useCallback(() => {
    // Random prize between 15 and 35 coins
    const p = [15, 20, 25, 30, 35][Math.floor(Math.random() * 5)];
    setPrizeCoins(p);
    setIsRevealed(false);
    setScratchedPercent(0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with metallic silver gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#475569');
    grad.addColorStop(0.5, '#64748b');
    grad.addColorStop(1, '#334155');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw scratch pattern
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ SCRATCH TO REVEAL ⚡', canvas.width / 2, canvas.height / 2);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(initCard, 50);
    }
  }, [isOpen, initCard]);

  if (!isOpen) return null;

  const scratch = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check percent cleared
    setScratchedPercent((prev) => {
      const next = prev + 3;
      if (next >= 45 && !isRevealed) {
        setIsRevealed(true);
        sounds.playFanfare();
        sounds.playCoin();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#6366f1'],
        });
      }
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing.current) {
      scratch(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  const handleClaim = () => {
    sounds.playCoin();
    onRewardClaim(prizeCoins);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Mystery Scratch & Win</h3>
              <span className="text-[10px] text-neutral-400">Scratch 40% to claim</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scratch Card Field */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-full max-w-[300px] h-48 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950 flex items-center justify-center select-none">
            {/* Beneath the scratch: Hidden prize */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin -duration-1000 mb-2" />
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                Lucky Surprise
              </span>
              <span className="text-4xl font-extrabold font-display text-white mt-1">
                +{prizeCoins} <span className="text-amber-400">Coins</span>
              </span>
            </div>

            {/* Canvas Scratch Foil Layer */}
            <canvas
              ref={canvasRef}
              width={300}
              height={192}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`absolute inset-0 touch-none cursor-pointer transition-opacity duration-500 ${
                isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            />
          </div>

          <p className="text-xs text-neutral-400 mt-3 text-center">
            {isRevealed
              ? '🎉 Scratch revealed! Tap Claim below to collect coins.'
              : 'Swipe your finger or mouse cursor across the card surface.'}
          </p>

          {isRevealed && (
            <button
              onClick={handleClaim}
              className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
            >
              Collect +{prizeCoins} Coins
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
