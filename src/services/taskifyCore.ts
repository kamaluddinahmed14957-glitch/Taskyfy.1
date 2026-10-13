/**
 * ============================================================================
 * Taskify Micro-Task Earning Engine - Core Business Logic
 * ============================================================================
 * 
 * Modular, dependency-free JavaScript/TypeScript implementation for:
 * 1. Daily Check-in Manager (24-hour cooldown & streak engine)
 * 2. Math Quiz Generator & Validator (Dynamic arithmetic & rewards)
 * 3. Spin the Wheel Logic (5-50 coins randomizer & 5 daily spins limit)
 * 4. Coin System (Reactive balance state with observer pattern & persistence)
 */

// ============================================================================
// 1. DAILY CHECK-IN LOGIC (Strict 24-Hour Cooldown & Streak Tracker)
// ============================================================================

export interface DailyCheckInState {
  lastCheckInTime: number; // Unix timestamp (ms)
  currentStreak: number;    // Consecutive days count
}

export interface CheckInEligibility {
  canClaim: boolean;
  timeRemainingMs: number;
  formattedTimeRemaining: string;
  nextRewardCoins: number;
}

export interface CheckInResult {
  success: boolean;
  coinsAwarded: number;
  newStreak: number;
  newCheckInTime: number;
  message: string;
}

export class DailyCheckInService {
  // 24 hours in milliseconds: 24 * 60 * 60 * 1000 = 86,400,000 ms
  public static readonly COOLDOWN_MS = 24 * 60 * 60 * 1000;
  // If user claims within 48 hours, streak continues; if > 48 hours, streak resets
  public static readonly STREAK_GRACE_MS = 48 * 60 * 60 * 1000;

  // Streak reward scale: Day 1 to Day 7
  public static readonly STREAK_REWARDS: readonly number[] = [15, 20, 30, 40, 50, 65, 100];

  /**
   * Calculates reward for a given streak day (1-indexed)
   */
  public static getRewardForStreak(streak: number): number {
    const index = Math.max(0, (streak - 1) % this.STREAK_REWARDS.length);
    return this.STREAK_REWARDS[index];
  }

  /**
   * Formats milliseconds into human-readable HH:mm:ss
   */
  public static formatRemainingTime(ms: number): string {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  }

  /**
   * Evaluates if the user is eligible to claim their daily bonus
   */
  public static checkEligibility(state: DailyCheckInState, currentTime: number = Date.now()): CheckInEligibility {
    const elapsed = currentTime - state.lastCheckInTime;
    const canClaim = state.lastCheckInTime === 0 || elapsed >= this.COOLDOWN_MS;
    const timeRemainingMs = canClaim ? 0 : this.COOLDOWN_MS - elapsed;

    // Check if streak is preserved or reset
    const isStreakBroken = state.lastCheckInTime > 0 && elapsed > this.STREAK_GRACE_MS;
    const nextStreak = isStreakBroken ? 1 : state.currentStreak + (canClaim ? 1 : 0);
    const nextRewardCoins = this.getRewardForStreak(Math.max(1, nextStreak));

    return {
      canClaim,
      timeRemainingMs,
      formattedTimeRemaining: this.formatRemainingTime(timeRemainingMs),
      nextRewardCoins,
    };
  }

  /**
   * Attempts to claim the daily check-in reward
   */
  public static claim(state: DailyCheckInState, currentTime: number = Date.now()): CheckInResult {
    const eligibility = this.checkEligibility(state, currentTime);

    if (!eligibility.canClaim) {
      return {
        success: false,
        coinsAwarded: 0,
        newStreak: state.currentStreak,
        newCheckInTime: state.lastCheckInTime,
        message: `Daily bonus already claimed. Please wait ${eligibility.formattedTimeRemaining}.`,
      };
    }

    const elapsed = currentTime - state.lastCheckInTime;
    const isStreakBroken = state.lastCheckInTime > 0 && elapsed > this.STREAK_GRACE_MS;
    const newStreak = isStreakBroken ? 1 : state.currentStreak + 1;
    const coinsAwarded = this.getRewardForStreak(newStreak);

    return {
      success: true,
      coinsAwarded,
      newStreak,
      newCheckInTime: currentTime,
      message: `Successfully claimed Day ${newStreak} bonus of +${coinsAwarded} Coins!`,
    };
  }
}

// ============================================================================
// 2. MATH QUIZ TASK LOGIC (Simple Arithmetic Generator & Reward Validator)
// ============================================================================

export type MathOperator = '+' | '-' | '×';

export interface MathProblem {
  id: string;
  operandA: number;
  operandB: number;
  operator: MathOperator;
  questionText: string;
  correctAnswer: number;
  options: number[];
  rewardCoins: number;
  createdAt: number;
}

export interface QuizVerificationResult {
  isCorrect: boolean;
  coinsEarned: number;
  correctAnswer: number;
  message: string;
}

export class MathQuizService {
  public static readonly DEFAULT_REWARD = 15;

  /**
   * Generates a random integer between min and max (inclusive)
   */
  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm
   */
  private static shuffle<T>(array: T[]): T[] {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  }

  /**
   * Generates a simple, accessible mental math problem with 4 unique options
   * Example: 5 + 7 = 12, 19 - 8 = 11, 7 × 6 = 42
   */
  public static generateProblem(rewardCoins: number = this.DEFAULT_REWARD): MathProblem {
    const operators: MathOperator[] = ['+', '-', '×'];
    const operator = operators[this.randomInt(0, operators.length - 1)];

    let operandA = 0;
    let operandB = 0;
    let correctAnswer = 0;

    switch (operator) {
      case '+':
        operandA = this.randomInt(5, 35);
        operandB = this.randomInt(4, 25);
        correctAnswer = operandA + operandB;
        break;
      case '-':
        operandA = this.randomInt(20, 50);
        operandB = this.randomInt(5, operandA - 2); // Guarantees positive answer > 1
        correctAnswer = operandA - operandB;
        break;
      case '×':
        operandA = this.randomInt(3, 9);
        operandB = this.randomInt(3, 9);
        correctAnswer = operandA * operandB;
        break;
    }

    // Generate 3 plausible, unique distractors
    const distractors = new Set<number>();
    const offsets = [-3, -2, -1, 1, 2, 3, 4, 5, 10];
    
    while (distractors.size < 3) {
      const offset = offsets[this.randomInt(0, offsets.length - 1)];
      const candidate = correctAnswer + offset;
      if (candidate !== correctAnswer && candidate > 0) {
        distractors.add(candidate);
      }
    }

    const options = this.shuffle([correctAnswer, ...Array.from(distractors)]);

    return {
      id: `math-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      operandA,
      operandB,
      operator,
      questionText: `${operandA} ${operator} ${operandB}`,
      correctAnswer,
      options,
      rewardCoins,
      createdAt: Date.now(),
    };
  }

  /**
   * Verifies the submitted answer and determines coin payout
   */
  public static verifyAnswer(problem: MathProblem, selectedAnswer: number): QuizVerificationResult {
    const isCorrect = problem.correctAnswer === selectedAnswer;
    const coinsEarned = isCorrect ? problem.rewardCoins : 0;

    return {
      isCorrect,
      coinsEarned,
      correctAnswer: problem.correctAnswer,
      message: isCorrect
        ? `Correct! You answered ${problem.correctAnswer} and earned +${coinsEarned} Coins.`
        : `Incorrect. The correct answer was ${problem.correctAnswer}. Try the next one!`,
    };
  }
}

// ============================================================================
// 3. SPIN THE WHEEL LOGIC (Daily Limit 5 Spins & 5-50 Coins Randomizer)
// ============================================================================

export interface SpinWheelState {
  spinsUsedToday: number;
  lastSpinDate: string; // ISO format "YYYY-MM-DD"
}

export interface SpinEligibility {
  canSpin: boolean;
  spinsRemaining: number;
  maxSpins: number;
  timeUntilResetFormatted: string;
}

export interface SpinResult {
  success: boolean;
  coinsWon: number;
  spinsRemaining: number;
  sliceIndex: number;
  error?: string;
}

export class SpinWheelService {
  public static readonly MAX_DAILY_SPINS = 5;

  // Possible wheel rewards strictly between 5 and 50 coins
  public static readonly WHEEL_SECTORS: readonly number[] = [
    5, 10, 15, 20, 25, 30, 40, 50,
  ];

  /**
   * Gets current date string (YYYY-MM-DD) in local time
   */
  public static getTodayDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Calculates milliseconds until midnight reset
   */
  public static getMillisecondsUntilMidnight(now: Date = new Date()): number {
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.max(0, midnight.getTime() - now.getTime());
  }

  /**
   * Checks how many spins the user has left today
   */
  public static checkEligibility(state: SpinWheelState, now: Date = new Date()): SpinEligibility {
    const today = this.getTodayDateString(now);
    const isNewDay = state.lastSpinDate !== today;
    const spinsUsed = isNewDay ? 0 : state.spinsUsedToday;
    const spinsRemaining = Math.max(0, this.MAX_DAILY_SPINS - spinsUsed);
    const canSpin = spinsRemaining > 0;

    const msUntilMidnight = this.getMillisecondsUntilMidnight(now);
    const formattedReset = DailyCheckInService.formatRemainingTime(msUntilMidnight);

    return {
      canSpin,
      spinsRemaining,
      maxSpins: this.MAX_DAILY_SPINS,
      timeUntilResetFormatted: formattedReset,
    };
  }

  /**
   * Executes a spin: selects a reward between 5 and 50 coins and decrements spin count
   */
  public static executeSpin(state: SpinWheelState, now: Date = new Date()): SpinResult {
    const eligibility = this.checkEligibility(state, now);

    if (!eligibility.canSpin) {
      return {
        success: false,
        coinsWon: 0,
        spinsRemaining: 0,
        sliceIndex: -1,
        error: `Daily limit reached (${this.MAX_DAILY_SPINS}/${this.MAX_DAILY_SPINS} spins used). Resets at midnight.`,
      };
    }

    // Random sector pick between 5 and 50 coins
    const sliceIndex = Math.floor(Math.random() * this.WHEEL_SECTORS.length);
    const coinsWon = this.WHEEL_SECTORS[sliceIndex];
    const spinsRemaining = eligibility.spinsRemaining - 1;

    return {
      success: true,
      coinsWon,
      spinsRemaining,
      sliceIndex,
    };
  }
}

// ============================================================================
// 4. COIN SYSTEM (Reactive Balance State, Audio/Visual Events & History)
// ============================================================================

export type CoinTransactionType = 'earn' | 'bonus' | 'redeem';

export interface CoinTransaction {
  id: string;
  amount: number;
  type: CoinTransactionType;
  source: string;
  balanceAfter: number;
  timestamp: number;
}

export type BalanceListener = (newBalance: number, previousBalance: number, diff: number) => void;

export class CoinSystem {
  private static STORAGE_KEY = 'taskify_coin_balance';
  private static TX_KEY = 'taskify_coin_history';

  private balance: number;
  private listeners: Set<BalanceListener> = new Set();
  private history: CoinTransaction[] = [];

  constructor(initialBalance: number = 340) {
    this.balance = this.loadBalance(initialBalance);
    this.history = this.loadHistory();
  }

  private loadBalance(fallback: number): number {
    if (typeof window === 'undefined') return fallback;
    try {
      const saved = localStorage.getItem(CoinSystem.STORAGE_KEY);
      return saved !== null ? parseInt(saved, 10) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveBalance(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CoinSystem.STORAGE_KEY, this.balance.toString());
      localStorage.setItem(CoinSystem.TX_KEY, JSON.stringify(this.history.slice(0, 50)));
    } catch {
      // Storage quota or private mode protection
    }
  }

  private loadHistory(): CoinTransaction[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CoinSystem.TX_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public getBalance(): number {
    return this.balance;
  }

  public getHistory(): readonly CoinTransaction[] {
    return this.history;
  }

  /**
   * Subscribes a callback to balance updates (Observer Pattern)
   */
  public subscribe(listener: BalanceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(previousBalance: number, diff: number): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.balance, previousBalance, diff);
      } catch (err) {
        console.error('Balance listener error:', err);
      }
    });
  }

  /**
   * Adds coins to user balance dynamically
   */
  public addCoins(amount: number, source: string, type: 'earn' | 'bonus' = 'earn'): CoinTransaction {
    if (amount <= 0) {
      throw new Error('Coin reward amount must be greater than zero.');
    }

    const previousBalance = this.balance;
    this.balance += amount;

    const tx: CoinTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      amount,
      type,
      source,
      balanceAfter: this.balance,
      timestamp: Date.now(),
    };

    this.history.unshift(tx);
    this.saveBalance();
    this.notify(previousBalance, amount);

    return tx;
  }

  /**
   * Deducts coins from user balance for cash redemption
   */
  public deductCoins(amount: number, destination: string): CoinTransaction {
    if (amount <= 0) {
      throw new Error('Deduction amount must be greater than zero.');
    }
    if (amount > this.balance) {
      throw new Error(`Insufficient balance. Current: ${this.balance}, requested: ${amount}`);
    }

    const previousBalance = this.balance;
    this.balance -= amount;

    const tx: CoinTransaction = {
      id: `tx-red-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      amount,
      type: 'redeem',
      source: `Withdrawal to ${destination}`,
      balanceAfter: this.balance,
      timestamp: Date.now(),
    };

    this.history.unshift(tx);
    this.saveBalance();
    this.notify(previousBalance, -amount);

    return tx;
  }

  /**
   * Resets balance for demo testing
   */
  public reset(newBalance: number = 340): void {
    const previous = this.balance;
    this.balance = newBalance;
    this.history = [];
    this.saveBalance();
    this.notify(previous, newBalance - previous);
  }
}

// Export singleton instance for convenient cross-component access
export const taskifyCoinSystem = new CoinSystem();

// ============================================================================
// 5. WALLET & WITHDRAWAL SYSTEM LOGIC
// ============================================================================

export interface WithdrawalValidationResult {
  isValid: boolean;
  error?: string;
}

export class WithdrawalService {
  /**
   * Requirement 1: Minimum Payout threshold is strictly 1,000 Coins ($1 USD equivalent or 120 BDT)
   */
  public static readonly MIN_PAYOUT_THRESHOLD = 1000;

  /**
   * Exchange rates: 1,000 Coins = 120 BDT = $1.00 USD
   */
  public static readonly RATES = {
    BDT_PER_COIN: 0.12,   // 1000 coins * 0.12 = 120 BDT
    USD_PER_COIN: 0.001,  // 1000 coins * 0.001 = $1.00 USD
  };

  /**
   * Validates account/phone format
   */
  public static validateAccountInput(methodId: string, accountInput: string): WithdrawalValidationResult {
    const trimmed = accountInput.trim();
    if (!trimmed) {
      return { isValid: false, error: 'Account or phone number cannot be empty.' };
    }

    if (methodId === 'paypal') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return { isValid: false, error: 'Please enter a valid PayPal email address.' };
      }
      return { isValid: true };
    }

    // For bKash, Nagad, and Mobile Recharge:
    // Bangladeshi mobile format: 11 digits starting with 01 (e.g. 017XXXXXXXX, 018XXXXXXXX, 019XXXXXXXX, 013XXXXXXXX, etc.)
    const cleanNumber = trimmed.replace(/[\s-]/g, '');
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanNumber)) {
      return {
        isValid: false,
        error: `Please enter a valid 11-digit personal number starting with 01 (e.g., 01712345678).`,
      };
    }

    return { isValid: true };
  }

  /**
   * Requirement 2: Comprehensive validation for balance threshold & form fields
   */
  public static validateWithdrawalRequest(
    userBalance: number,
    coinsToWithdraw: number,
    methodId: string,
    accountNumber: string
  ): WithdrawalValidationResult {
    // 1. Balance must meet minimum threshold of 1,000 Coins
    if (userBalance < this.MIN_PAYOUT_THRESHOLD) {
      const needed = this.MIN_PAYOUT_THRESHOLD - userBalance;
      return {
        isValid: false,
        error: `Minimum payout threshold is 1,000 Coins ($1.00 USD / 120 BDT). You need ${needed.toLocaleString()} more coins to request a withdrawal.`,
      };
    }

    // 2. Requested amount must be at least 1,000 Coins
    if (coinsToWithdraw < this.MIN_PAYOUT_THRESHOLD) {
      return {
        isValid: false,
        error: `Minimum withdrawal amount is ${this.MIN_PAYOUT_THRESHOLD.toLocaleString()} Coins.`,
      };
    }

    // 3. User balance must be >= requested amount
    if (coinsToWithdraw > userBalance) {
      return {
        isValid: false,
        error: `Insufficient balance. You currently have ${userBalance.toLocaleString()} Coins available.`,
      };
    }

    // 4. Validate Account / Phone Input
    return this.validateAccountInput(methodId, accountNumber);
  }

  /**
   * Generates a realistic unique Transaction ID
   */
  public static generateTransactionId(methodId: string): string {
    const prefix = methodId.slice(0, 2).toUpperCase();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TX-${prefix}${randomHex}`;
  }
}

// ============================================================================
// 6. ANTI-CHEAT & BOT DETECTION SERVICE (App Store & Google Play Compliance)
// ============================================================================

export interface AntiCheatCheckResult {
  allowed: boolean;
  reason?: string;
  cooldownMs?: number;
  strikeCount?: number;
}

export class AntiCheatService {
  // Minimum time allowed between consecutive reward-bearing click actions (in ms)
  public static readonly MIN_CLICK_INTERVAL_MS = 600;
  // Bot speed threshold: clicks occurring faster than 250ms are flagged as autoclickers
  public static readonly BOT_SPEED_THRESHOLD_MS = 250;
  // Temporary lock duration if rapid clicking continues (in ms)
  public static readonly LOCKOUT_DURATION_MS = 5000;

  private static lastActionTimestamps: Map<string, number> = new Map();
  private static strikeCounts: Map<string, number> = new Map();
  private static lockoutEndTimestamps: Map<string, number> = new Map();

  /**
   * Evaluates if a click/tap can proceed or should be blocked by anti-cheat
   */
  public static evaluateAction(actionKey: string, now: number = Date.now()): AntiCheatCheckResult {
    // 1. Check if user is currently in a temporary security cooldown
    const lockoutUntil = this.lockoutEndTimestamps.get(actionKey) || 0;
    if (now < lockoutUntil) {
      const remaining = lockoutUntil - now;
      return {
        allowed: false,
        reason: `Anti-Cheat Protection: Bot/Rapid clicking detected. Please wait ${(remaining / 1000).toFixed(1)}s before trying again.`,
        cooldownMs: remaining,
        strikeCount: this.strikeCounts.get(actionKey) || 3,
      };
    }

    const lastTime = this.lastActionTimestamps.get(actionKey) || 0;
    const delta = now - lastTime;

    // 2. Detect inhuman/rapid clicks (autoclickers / bot scripts)
    if (lastTime > 0 && delta < this.BOT_SPEED_THRESHOLD_MS) {
      const strikes = (this.strikeCounts.get(actionKey) || 0) + 1;
      this.strikeCounts.set(actionKey, strikes);
      this.lastActionTimestamps.set(actionKey, now);

      if (strikes >= 2) {
        // Apply temporary lockout
        this.lockoutEndTimestamps.set(actionKey, now + this.LOCKOUT_DURATION_MS);
        return {
          allowed: false,
          reason: 'Anti-Cheat Shield: Repeated rapid clicks detected! Cooldown activated for 5 seconds.',
          cooldownMs: this.LOCKOUT_DURATION_MS,
          strikeCount: strikes,
        };
      }

      return {
        allowed: false,
        reason: 'Too fast! Please tap at natural human speed to claim rewards.',
        cooldownMs: this.MIN_CLICK_INTERVAL_MS - delta,
        strikeCount: strikes,
      };
    }

    // 3. Normal debounce interval
    if (lastTime > 0 && delta < this.MIN_CLICK_INTERVAL_MS) {
      return {
        allowed: false,
        reason: 'Action throttled. Please wait a moment between taps.',
        cooldownMs: this.MIN_CLICK_INTERVAL_MS - delta,
      };
    }

    // Action is valid and human
    this.lastActionTimestamps.set(actionKey, now);
    this.strikeCounts.set(actionKey, 0);
    return { allowed: true };
  }

  /**
   * Resets anti-cheat state (for tester tools)
   */
  public static reset(): void {
    this.lastActionTimestamps.clear();
    this.strikeCounts.clear();
    this.lockoutEndTimestamps.clear();
  }
}


