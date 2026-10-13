import React, { useState, useEffect, useCallback } from 'react';
import { X, Brain, Check, AlertCircle, Sparkles, Timer, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import { MathQuizService, MathProblem } from '../../services/taskifyCore';

interface MathQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaim: (coins: number) => void;
}

function generateQuizSet(count: number = 3): MathProblem[] {
  return Array.from({ length: count }, () => MathQuizService.generateProblem());
}

export const MathQuizModal: React.FC<MathQuizModalProps> = ({
  isOpen,
  onClose,
  onRewardClaim,
}) => {
  const [questions, setQuestions] = useState<MathProblem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timer, setTimer] = useState(15);

  const resetQuiz = useCallback(() => {
    setQuestions(generateQuizSet(3));
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFinished(false);
    setTimer(15);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetQuiz();
    }
  }, [isOpen, resetQuiz]);

  // Question countdown timer
  useEffect(() => {
    if (!isOpen || isAnswered || isFinished) return;

    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleAnswer(-999); // Auto time-out wrong
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isAnswered, isFinished, currentIdx]);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx] || { questionText: '', options: [], correctAnswer: 0, rewardCoins: 15 };

  const handleAnswer = (option: number) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const verification = MathQuizService.verifyAnswer(currentQ as MathProblem, option);
    if (verification.isCorrect) {
      sounds.playCorrect();
      setScore((s) => s + 1);
    } else {
      sounds.playWrong();
    }

    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((i) => i + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setTimer(15);
      } else {
        setIsFinished(true);
        sounds.playFanfare();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b'],
        });
      }
    }, 1100);
  };

  const handleClaimReward = () => {
    sounds.playCoin();
    onRewardClaim(15);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Math Speed Challenge</h3>
              <span className="text-[10px] text-neutral-400">Earn +15 Coins</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!isFinished ? (
            <div>
              {/* Progress & Timer */}
              <div className="flex items-center justify-between mb-4 text-xs">
                <span className="text-neutral-400 font-medium">
                  Question <span className="text-white font-bold">{currentIdx + 1}</span> of {questions.length}
                </span>

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono font-semibold ${
                  timer <= 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-neutral-800 text-neutral-300'
                }`}>
                  <Timer className="w-3.5 h-3.5" />
                  <span>{timer}s</span>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 text-center mb-6 shadow-inner">
                <span className="text-xs text-neutral-400 uppercase tracking-widest block mb-1">
                  Solve Equation
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-wider">
                  {currentQ.questionText} = <span className="text-amber-400 font-mono">?</span>
                </div>
              </div>

              {/* 4 Multi-choice options */}
              <div className="grid grid-cols-2 gap-3">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQ.correctAnswer;
                  
                  let btnStyle = 'bg-neutral-950 border-neutral-800 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800/80';
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500';
                    } else if (isSelected) {
                      btnStyle = 'bg-red-500/20 border-red-500 text-red-300 ring-1 ring-red-500';
                    } else {
                      btnStyle = 'opacity-40 border-neutral-800 text-neutral-500';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleAnswer(opt)}
                      className={`h-14 rounded-xl border font-display text-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                      {isAnswered && isSelected && !isCorrect && <AlertCircle className="w-4 h-4 text-red-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Result Screen */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-xl shadow-amber-500/20">
                <Trophy className="w-8 h-8" />
              </div>

              <h4 className="text-2xl font-bold font-display text-white">Challenge Completed!</h4>
              <p className="text-neutral-400 text-xs mt-1">
                You solved <span className="text-amber-400 font-bold">{score}</span> out of {questions.length} questions correctly.
              </p>

              <div className="my-6 p-4 rounded-xl bg-neutral-950 border border-amber-500/20 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-lg font-bold text-amber-300">+15 Coins Earned!</span>
              </div>

              <button
                onClick={handleClaimReward}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
              >
                Claim +15 Coins & Finish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
