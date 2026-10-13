import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, FileCode, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JS_SNIPPET = `// ============================================================================
// TASKIFY CORE LOGIC - JAVASCRIPT / TYPESCRIPT
// ============================================================================

// 1. Daily Check-in Logic (Strict 24h Cooldown)
export class DailyCheckInService {
  static COOLDOWN_MS = 24 * 60 * 60 * 1000; // 86,400,000 ms
  static STREAK_REWARDS = [15, 20, 30, 40, 50, 65, 100];

  static checkEligibility(state, currentTime = Date.now()) {
    const elapsed = currentTime - state.lastCheckInTime;
    const canClaim = state.lastCheckInTime === 0 || elapsed >= this.COOLDOWN_MS;
    const timeRemainingMs = canClaim ? 0 : this.COOLDOWN_MS - elapsed;
    return { canClaim, timeRemainingMs };
  }

  static claim(state, currentTime = Date.now()) {
    const { canClaim } = this.checkEligibility(state, currentTime);
    if (!canClaim) return { success: false, message: "Claim once every 24 hours only!" };

    const newStreak = state.currentStreak + 1;
    const coinsAwarded = this.STREAK_REWARDS[(newStreak - 1) % 7];
    return { success: true, coinsAwarded, newStreak, newCheckInTime: currentTime };
  }
}

// 2. Math Quiz Task (Arithmetic Generator & Validator)
export class MathQuizService {
  static generateProblem(rewardCoins = 15) {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 20) + 5;
    let b = Math.floor(Math.random() * 15) + 3;
    let correct = op === '+' ? a + b : op === '-' ? a - b : a * b;

    const options = [correct, correct + 2, correct - 3, correct + 5].sort(() => Math.random() - 0.5);
    return { question: \`\${a} \${op} \${b}\`, correctAnswer: correct, options, rewardCoins };
  }

  static verifyAnswer(problem, userAnswer) {
    const isCorrect = problem.correctAnswer === userAnswer;
    return { isCorrect, coinsEarned: isCorrect ? problem.rewardCoins : 0 };
  }
}

// 3. Spin Wheel Logic (5-50 Coins Randomizer with 5 Daily Spins Limit)
export class SpinWheelService {
  static MAX_DAILY_SPINS = 5;
  static WHEEL_SECTORS = [5, 10, 15, 20, 25, 30, 40, 50]; // Strictly 5 to 50 coins

  static checkEligibility(state) {
    const today = new Date().toISOString().slice(0, 10);
    const spinsUsed = state.lastSpinDate !== today ? 0 : state.spinsUsedToday;
    return { canSpin: spinsUsed < this.MAX_DAILY_SPINS, remaining: this.MAX_DAILY_SPINS - spinsUsed };
  }

  static executeSpin(state) {
    const { canSpin, remaining } = this.checkEligibility(state);
    if (!canSpin) return { success: false, error: "Daily limit reached (5/5 spins used)." };

    const coinsWon = this.WHEEL_SECTORS[Math.floor(Math.random() * this.WHEEL_SECTORS.length)];
    return { success: true, coinsWon, spinsRemaining: remaining - 1 };
  }
}

// 4. Coin System (Reactive Balance State & Dynamic UI Updating)
export class CoinSystem {
  constructor(initial = 340) {
    this.balance = initial;
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  addCoins(amount, source) {
    this.balance += amount;
    this.listeners.forEach(cb => cb(this.balance, amount, source));
    return this.balance;
  }
}

// 5. Wallet & Withdrawal System Logic
export class WithdrawalService {
  static MIN_PAYOUT_THRESHOLD = 1000; // 1,000 Coins ($1.00 USD / 120 BDT)

  static validateWithdrawal(userBalance, coinsToWithdraw, methodId, accountNumber) {
    if (userBalance < this.MIN_PAYOUT_THRESHOLD) {
      return { isValid: false, error: "Must have at least 1,000 Coins to request withdrawal." };
    }
    if (coinsToWithdraw < this.MIN_PAYOUT_THRESHOLD || coinsToWithdraw > userBalance) {
      return { isValid: false, error: "Invalid coin amount." };
    }
    if (methodId === 'paypal') {
      const emailOk = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(accountNumber.trim());
      if (!emailOk) return { isValid: false, error: "Invalid PayPal email." };
    } else {
      const phoneOk = /^01[3-9]\\d{8}$/.test(accountNumber.replace(/[\\s-]/g, ''));
      if (!phoneOk) return { isValid: false, error: "Must be an 11-digit number starting with 01." };
    }
    return { isValid: true };
  }
}

// 6. Anti-Cheat & Bot Detection Shield
export class AntiCheatService {
  static MIN_CLICK_INTERVAL_MS = 600; // 600ms debounce
  static BOT_SPEED_THRESHOLD_MS = 250; // clicks < 250ms flagged as autoclicker bots

  static evaluateAction(actionKey, now = Date.now()) {
    const last = this.lastTimestamps?.[actionKey] || 0;
    const delta = now - last;
    if (last > 0 && delta < this.BOT_SPEED_THRESHOLD_MS) {
      return { allowed: false, reason: "Anti-Cheat Shield: Rapid/bot clicking detected!" };
    }
    if (last > 0 && delta < this.MIN_CLICK_INTERVAL_MS) {
      return { allowed: false, reason: "Too fast! Wait a moment between taps." };
    }
    this.lastTimestamps = this.lastTimestamps || {};
    this.lastTimestamps[actionKey] = now;
    return { allowed: true };
  }
}`;

const DART_SNIPPET = `/// ============================================================================
/// TASKIFY CORE LOGIC - DART / FLUTTER
/// ============================================================================

import 'dart:async';
import 'dart:math';

// 1. Daily Check-in Logic (24-Hour Cooldown & Streak Tracker)
class DailyCheckInService {
  static const int cooldownMs = 24 * 60 * 60 * 1000; // 86,400,000 ms
  static const List<int> streakRewards = [15, 20, 30, 40, 50, 65, 100];

  static bool canClaim(int lastCheckInTimestampMs) {
    final now = DateTime.now().millisecondsSinceEpoch;
    return lastCheckInTimestampMs == 0 || (now - lastCheckInTimestampMs) >= cooldownMs;
  }

  static Map<String, dynamic> claim(int currentStreak, int lastCheckInMs) {
    if (!canClaim(lastCheckInMs)) {
      return {'success': false, 'error': '24-hour cooldown active'};
    }
    final nextStreak = currentStreak + 1;
    final reward = streakRewards[(nextStreak - 1) % streakRewards.length];
    return {
      'success': true,
      'coinsAwarded': reward,
      'newStreak': nextStreak,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };
  }
}

// 2. Math Quiz Task (Simple Math Generator & Coin Rewards)
class MathQuizService {
  static final _random = Random();

  static Map<String, dynamic> generateProblem({int rewardCoins = 15}) {
    final a = _random.nextInt(25) + 5;
    final b = _random.nextInt(20) + 3;
    final correct = a + b;
    final options = [correct, correct + 2, correct - 3, correct + 4]..shuffle(_random);
    return {
      'questionText': '$a + $b',
      'correctAnswer': correct,
      'options': options,
      'rewardCoins': rewardCoins,
    };
  }

  static bool verifyAndReward(int correctAnswer, int selectedAnswer) {
    return correctAnswer == selectedAnswer;
  }
}

// 3. Spin Wheel Logic (5-50 Coins Randomizer, Daily Limit 5 Spins)
class SpinWheelService {
  static const int maxSpins = 5;
  static const List<int> sectors = [5, 10, 15, 20, 25, 30, 40, 50];
  static final _random = Random();

  static bool canSpin(int spinsUsedToday) => spinsUsedToday < maxSpins;

  static Map<String, dynamic> spin(int spinsUsedToday) {
    if (!canSpin(spinsUsedToday)) {
      return {'success': false, 'error': 'Daily 5-spin limit reached'};
    }
    final prize = sectors[_random.nextInt(sectors.length)];
    return {
      'success': true,
      'coinsWon': prize,
      'spinsRemaining': (maxSpins - (spinsUsedToday + 1)),
    };
  }
}

// 4. Coin System (Reactive Balance State / StreamController)
class CoinSystem {
  int _balance = 340;
  final _controller = StreamController<int>.broadcast();

  int get balance => _balance;
  Stream<int> get balanceStream => _controller.stream;

  void addCoins(int amount, String source) {
    _balance += amount;
    _controller.add(_balance); // Dynamically updates listening UI widgets
  }

  void deductCoins(int amount) {
    if (amount > _balance) throw Exception('Insufficient balance');
    _balance -= amount;
    _controller.add(_balance);
  }
}

// 5. Wallet & Withdrawal System (1,000 Coins Minimum & Pending Requests)
class WithdrawalService {
  static const int minPayoutThreshold = 1000; // 1,000 Coins ($1.00 USD / 120 BDT)

  static bool validateRequest(int balance, int coinsToWithdraw, String methodId, String account) {
    if (balance < minPayoutThreshold || coinsToWithdraw < minPayoutThreshold || coinsToWithdraw > balance) {
      return false;
    }
    if (methodId == 'paypal') {
      return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(account.trim());
    }
    return RegExp(r'^01[3-9]\d{8}$').hasMatch(account.replaceAll(RegExp(r'[\s-]'), ''));
  }
}

// 6. Anti-Cheat & Bot Throttling Service
class AntiCheatService {
  static const int minIntervalMs = 600;
  static const int botSpeedMs = 250;
  static final Map<String, int> _lastTimes = {};

  static bool evaluateAction(String actionKey) {
    final now = DateTime.now().millisecondsSinceEpoch;
    final last = _lastTimes[actionKey] ?? 0;
    final delta = now - last;
    if (last > 0 && delta < botSpeedMs) return false; // Blocks autoclicker bot
    if (last > 0 && delta < minIntervalMs) return false; // Debounce delay
    _lastTimes[actionKey] = now;
    return true;
  }
}`;

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [activeLang, setActiveLang] = useState<'js' | 'dart'>('js');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeToShow = activeLang === 'js' ? JS_SNIPPET : DART_SNIPPET;

  const handleCopy = () => {
    sounds.playTap();
    navigator.clipboard.writeText(codeToShow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl sm:rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Taskify Core Functional Logic</h3>
              <p className="text-xs text-neutral-400">Modular business logic in JavaScript & Dart</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-semibold">
              <button
                onClick={() => {
                  setActiveLang('js');
                  sounds.playTap();
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeLang === 'js'
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                JavaScript / TS
              </button>
              <button
                onClick={() => {
                  setActiveLang('dart');
                  sounds.playTap();
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeLang === 'dart'
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Dart (Flutter)
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Copy code to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-neutral-950/90 overflow-y-auto font-mono text-xs text-neutral-300 leading-relaxed selection:bg-amber-400 selection:text-neutral-950">
          <pre className="whitespace-pre-wrap">{codeToShow}</pre>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Includes: 24h Check-in Cooldown, Random Math Sprint, 5-Spin Daily Wheel, Reactive Coins</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-amber-400 hover:underline font-semibold cursor-pointer"
          >
            {copied ? 'Code Copied!' : 'Click to Copy Snippet'}
          </button>
        </div>
      </div>
    </div>
  );
};
