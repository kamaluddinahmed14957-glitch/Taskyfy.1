/// ============================================================================
/// Taskify Micro-Task Earning Engine - Flutter / Dart Business Logic
/// ============================================================================
/// 
/// Complete, production-grade Dart implementation for:
/// 1. Daily Check-in Logic (24-hour countdown, 48-hour streak continuity)
/// 2. Math Quiz Task (Dynamic arithmetic generation & coin rewards)
/// 3. Spin the Wheel Logic (5-50 coins randomizer & daily 5-spin limit)
/// 4. Coin System (ChangeNotifier / Stream-based reactive balance state)
///
/// Compatible with Flutter (Provider, Riverpod, Bloc, or vanilla setState).

import 'dart:async';
import 'dart:math';

// ============================================================================
// 1. DAILY CHECK-IN LOGIC (Dart / Flutter)
// ============================================================================

class DailyCheckInState {
  final int lastCheckInTimestampMs;
  final int currentStreak;

  const DailyCheckInState({
    required this.lastCheckInTimestampMs,
    required this.currentStreak,
  });

  Map<String, dynamic> toJson() => {
        'lastCheckInTimestampMs': lastCheckInTimestampMs,
        'currentStreak': currentStreak,
      };

  factory DailyCheckInState.fromJson(Map<String, dynamic> json) => DailyCheckInState(
        lastCheckInTimestampMs: json['lastCheckInTimestampMs'] as int? ?? 0,
        currentStreak: json['currentStreak'] as int? ?? 0,
      );
}

class CheckInEligibility {
  final bool canClaim;
  final int timeRemainingMs;
  final String formattedRemaining;
  final int nextRewardCoins;

  const CheckInEligibility({
    required this.canClaim,
    required this.timeRemainingMs,
    required this.formattedRemaining,
    required this.nextRewardCoins,
  });
}

class CheckInResult {
  final bool success;
  final int coinsAwarded;
  final int newStreak;
  final int newCheckInTimestampMs;
  final String message;

  const CheckInResult({
    required this.success,
    required this.coinsAwarded,
    required this.newStreak,
    required this.newCheckInTimestampMs,
    required this.message,
  });
}

class DailyCheckInService {
  // 24 hours in milliseconds (24 * 60 * 60 * 1000 = 86,400,000)
  static const int cooldownMs = 24 * 60 * 60 * 1000;
  // If claimed within 48h streak continues; if elapsed > 48h, streak resets
  static const int streakGraceMs = 48 * 60 * 60 * 1000;

  // Streak reward scale: Day 1 to Day 7
  static const List<int> streakRewards = [15, 20, 30, 40, 50, 65, 100];

  static int getRewardForStreak(int streak) {
    if (streak <= 0) return streakRewards.first;
    final index = (streak - 1) % streakRewards.length;
    return streakRewards[index];
  }

  static String formatRemainingTime(int ms) {
    if (ms <= 0) return '00:00:00';
    final totalSeconds = (ms / 1000).floor();
    final hours = (totalSeconds / 3600).floor();
    final minutes = ((totalSeconds % 3600) / 60).floor();
    final seconds = totalSeconds % 60;
    return '${hours.toString().padLeft(2, '0')}:'
        '${minutes.toString().padLeft(2, '0')}:'
        '${seconds.toString().padLeft(2, '0')}';
  }

  static CheckInEligibility checkEligibility(DailyCheckInState state, [DateTime? currentTime]) {
    final nowMs = (currentTime ?? DateTime.now()).millisecondsSinceEpoch;
    final elapsed = nowMs - state.lastCheckInTimestampMs;
    final canClaim = state.lastCheckInTimestampMs == 0 || elapsed >= cooldownMs;
    final timeRemainingMs = canClaim ? 0 : cooldownMs - elapsed;

    final isStreakBroken = state.lastCheckInTimestampMs > 0 && elapsed > streakGraceMs;
    final nextStreak = isStreakBroken ? 1 : state.currentStreak + (canClaim ? 1 : 0);
    final nextRewardCoins = getRewardForStreak(max(1, nextStreak));

    return CheckInEligibility(
      canClaim: canClaim,
      timeRemainingMs: timeRemainingMs,
      formattedRemaining: formatRemainingTime(timeRemainingMs),
      nextRewardCoins: nextRewardCoins,
    );
  }

  static CheckInResult claim(DailyCheckInState state, [DateTime? currentTime]) {
    final nowMs = (currentTime ?? DateTime.now()).millisecondsSinceEpoch;
    final eligibility = checkEligibility(state, currentTime);

    if (!eligibility.canClaim) {
      return CheckInResult(
        success: false,
        coinsAwarded: 0,
        newStreak: state.currentStreak,
        newCheckInTimestampMs: state.lastCheckInTimestampMs,
        message: 'Daily bonus already claimed. Please wait ${eligibility.formattedRemaining}.',
      );
    }

    final elapsed = nowMs - state.lastCheckInTimestampMs;
    final isStreakBroken = state.lastCheckInTimestampMs > 0 && elapsed > streakGraceMs;
    final newStreak = isStreakBroken ? 1 : state.currentStreak + 1;
    final coinsAwarded = getRewardForStreak(newStreak);

    return CheckInResult(
      success: true,
      coinsAwarded: coinsAwarded,
      newStreak: newStreak,
      newCheckInTimestampMs: nowMs,
      message: 'Claimed Day $newStreak bonus of +$coinsAwarded Coins!',
    );
  }
}

// ============================================================================
// 2. MATH QUIZ TASK (Dart / Flutter)
// ============================================================================

enum MathOperator { add, subtract, multiply }

class MathProblem {
  final String id;
  final int operandA;
  final int operandB;
  final String operatorSymbol;
  final String questionText;
  final int correctAnswer;
  final List<int> options;
  final int rewardCoins;

  const MathProblem({
    required this.id,
    required this.operandA,
    required this.operandB,
    required this.operatorSymbol,
    required this.questionText,
    required this.correctAnswer,
    required this.options,
    required this.rewardCoins,
  });
}

class QuizVerificationResult {
  final bool isCorrect;
  final int coinsEarned;
  final int correctAnswer;
  final String message;

  const QuizVerificationResult({
    required this.isCorrect,
    required this.coinsEarned,
    required this.correctAnswer,
    required this.message,
  });
}

class MathQuizService {
  static const int defaultReward = 15;
  static final Random _random = Random();

  static MathProblem generateProblem({int rewardCoins = defaultReward}) {
    final operators = [MathOperator.add, MathOperator.subtract, MathOperator.multiply];
    final selectedOp = operators[_random.nextInt(operators.length)];

    int opA = 0;
    int opB = 0;
    String symbol = '+';
    int correct = 0;

    switch (selectedOp) {
      case MathOperator.add:
        opA = _random.nextInt(30) + 5;
        opB = _random.nextInt(25) + 4;
        symbol = '+';
        correct = opA + opB;
        break;
      case MathOperator.subtract:
        opA = _random.nextInt(35) + 20;
        opB = _random.nextInt(opA - 5) + 3;
        symbol = '-';
        correct = opA - opB;
        break;
      case MathOperator.multiply:
        opA = _random.nextInt(8) + 3;
        opB = _random.nextInt(8) + 3;
        symbol = '×';
        correct = opA * opB;
        break;
    }

    // Generate 3 unique distractors
    final distractors = <int>{};
    final offsets = [-4, -3, -2, -1, 1, 2, 3, 4, 5, 10];
    while (distractors.length < 3) {
      final offset = offsets[_random.nextInt(offsets.length)];
      final candidate = correct + offset;
      if (candidate != correct && candidate > 0) {
        distractors.add(candidate);
      }
    }

    final allOptions = [correct, ...distractors]..shuffle(_random);

    return MathProblem(
      id: 'math_${DateTime.now().millisecondsSinceEpoch}',
      operandA: opA,
      operandB: opB,
      operatorSymbol: symbol,
      questionText: '$opA $symbol $opB',
      correctAnswer: correct,
      options: allOptions,
      rewardCoins: rewardCoins,
    );
  }

  static QuizVerificationResult verifyAnswer(MathProblem problem, int userAnswer) {
    final isCorrect = problem.correctAnswer == userAnswer;
    final coins = isCorrect ? problem.rewardCoins : 0;
    return QuizVerificationResult(
      isCorrect: isCorrect,
      coinsEarned: coins,
      correctAnswer: problem.correctAnswer,
      message: isCorrect
          ? 'Correct! Earned +$coins Coins.'
          : 'Incorrect. The answer was ${problem.correctAnswer}.',
    );
  }
}

// ============================================================================
// 3. SPIN THE WHEEL LOGIC (Dart / Flutter)
// ============================================================================

class SpinWheelState {
  final int spinsUsedToday;
  final String lastSpinDateString; // YYYY-MM-DD

  const SpinWheelState({
    required this.spinsUsedToday,
    required this.lastSpinDateString,
  });
}

class SpinEligibility {
  final bool canSpin;
  final int spinsRemaining;
  final int maxSpins;
  final String resetInFormatted;

  const SpinEligibility({
    required this.canSpin,
    required this.spinsRemaining,
    required this.maxSpins,
    required this.resetInFormatted,
  });
}

class SpinResult {
  final bool success;
  final int coinsWon;
  final int spinsRemaining;
  final int sectorIndex;
  final String? error;

  const SpinResult({
    required this.success,
    required this.coinsWon,
    required this.spinsRemaining,
    required this.sectorIndex,
    this.error,
  });
}

class SpinWheelService {
  static const int maxDailySpins = 5;
  static const List<int> sectors = [5, 10, 15, 20, 25, 30, 40, 50];
  static final Random _random = Random();

  static String toDateString([DateTime? date]) {
    final d = date ?? DateTime.now();
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  }

  static SpinEligibility checkEligibility(SpinWheelState state, [DateTime? now]) {
    final current = now ?? DateTime.now();
    final todayStr = toDateString(current);
    final isNewDay = state.lastSpinDateString != todayStr;
    final spinsUsed = isNewDay ? 0 : state.spinsUsedToday;
    final remaining = max(0, maxDailySpins - spinsUsed);

    final tomorrow = DateTime(current.year, current.month, current.day + 1);
    final msUntilReset = tomorrow.difference(current).inMilliseconds;

    return SpinEligibility(
      canSpin: remaining > 0,
      spinsRemaining: remaining,
      maxSpins: maxDailySpins,
      resetInFormatted: DailyCheckInService.formatRemainingTime(msUntilReset),
    );
  }

  static SpinResult executeSpin(SpinWheelState state, [DateTime? now]) {
    final eligibility = checkEligibility(state, now);

    if (!eligibility.canSpin) {
      return const SpinResult(
        success: false,
        coinsWon: 0,
        spinsRemaining: 0,
        sectorIndex: -1,
        error: 'Daily limit reached (5/5 spins used). Resets at midnight.',
      );
    }

    final sectorIdx = _random.nextInt(sectors.length);
    final prize = sectors[sectorIdx];
    final remaining = eligibility.spinsRemaining - 1;

    return SpinResult(
      success: true,
      coinsWon: prize,
      spinsRemaining: remaining,
      sectorIndex: sectorIdx,
    );
  }
}

// ============================================================================
// 4. COIN SYSTEM (Dart Reactive Balance Manager)
// ============================================================================

class CoinTransaction {
  final String id;
  final int amount;
  final String type; // 'earn', 'bonus', 'redeem'
  final String source;
  final int balanceAfter;
  final DateTime timestamp;

  const CoinTransaction({
    required this.id,
    required this.amount,
    required this.type,
    required this.source,
    required this.balanceAfter,
    required this.timestamp,
  });
}

class CoinSystem {
  int _balance = 340;
  final List<CoinTransaction> _history = [];
  final _balanceStreamController = StreamController<int>.broadcast();

  int get balance => _balance;
  List<CoinTransaction> get history => List.unmodifiable(_history);
  Stream<int> get balanceStream => _balanceStreamController.stream;

  CoinTransaction addCoins(int amount, String source, {String type = 'earn'}) {
    assert(amount > 0, 'Amount must be > 0');
    _balance += amount;

    final tx = CoinTransaction(
      id: 'tx_${DateTime.now().millisecondsSinceEpoch}',
      amount: amount,
      type: type,
      source: source,
      balanceAfter: _balance,
      timestamp: DateTime.now(),
    );

    _history.insert(0, tx);
    _balanceStreamController.add(_balance);
    return tx;
  }

  CoinTransaction deductCoins(int amount, String destination) {
    assert(amount > 0, 'Amount must be > 0');
    if (amount > _balance) {
      throw StateError('Insufficient balance: $_balance coins available.');
    }

    _balance -= amount;
    final tx = CoinTransaction(
      id: 'tx_red_${DateTime.now().millisecondsSinceEpoch}',
      amount: amount,
      type: 'redeem',
      source: 'Withdrawal to $destination',
      balanceAfter: _balance,
      timestamp: DateTime.now(),
    );

    _history.insert(0, tx);
    _balanceStreamController.add(_balance);
    return tx;
  }

  void dispose() {
    _balanceStreamController.close();
  }
}

// ============================================================================
// 5. WALLET & WITHDRAWAL SYSTEM LOGIC (Dart / Flutter)
// ============================================================================

class WithdrawalValidationResult {
  final bool isValid;
  final String? error;

  const WithdrawalValidationResult({
    required this.isValid,
    this.error,
  });
}

class WithdrawalService {
  /// Requirement 1: Minimum Payout threshold is strictly 1,000 Coins ($1 USD / 120 BDT)
  static const int minPayoutThreshold = 1000;

  static const double rateBdtPerCoin = 0.12;   // 1,000 coins = 120 BDT
  static const double rateUsdPerCoin = 0.001;  // 1,000 coins = $1.00 USD

  /// Validates phone/account number input
  static WithdrawalValidationResult validateAccountInput(String methodId, String input) {
    final trimmed = input.trim();
    if (trimmed.isEmpty) {
      return const WithdrawalValidationResult(isValid: false, error: 'Account or phone cannot be empty.');
    }

    if (methodId == 'paypal') {
      final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
      if (!emailRegex.hasMatch(trimmed)) {
        return const WithdrawalValidationResult(isValid: false, error: 'Enter a valid PayPal email.');
      }
      return const WithdrawalValidationResult(isValid: true);
    }

    // bKash, Nagad, Mobile Recharge: 11-digit mobile starting with 01
    final clean = trimmed.replaceAll(RegExp(r'[\s-]'), '');
    final phoneRegex = RegExp(r'^01[3-9]\d{8}$');
    if (!phoneRegex.hasMatch(clean)) {
      return const WithdrawalValidationResult(
        isValid: false,
        error: 'Enter a valid 11-digit mobile number starting with 01 (e.g. 01712345678).',
      );
    }

    return const WithdrawalValidationResult(isValid: true);
  }

  /// Requirement 2: Check user balance >= threshold before allowing withdrawal
  static WithdrawalValidationResult validateWithdrawalRequest({
    required int userBalance,
    required int coinsToWithdraw,
    required String methodId,
    required String accountNumber,
  }) {
    if (userBalance < minPayoutThreshold) {
      final needed = minPayoutThreshold - userBalance;
      return WithdrawalValidationResult(
        isValid: false,
        error: 'Minimum payout is 1,000 Coins. You need $needed more coins to withdraw.',
      );
    }

    if (coinsToWithdraw < minPayoutThreshold) {
      return const WithdrawalValidationResult(
        isValid: false,
        error: 'Minimum withdrawal amount is 1,000 Coins.',
      );
    }

    if (coinsToWithdraw > userBalance) {
      return WithdrawalValidationResult(
        isValid: false,
        error: 'Insufficient balance. Available: $userBalance coins.',
      );
    }

    return validateAccountInput(methodId, accountNumber);
  }
}

// ============================================================================
// 6. ANTI-CHEAT & BOT DETECTION SERVICE (Dart / Flutter)
// ============================================================================

class AntiCheatCheckResult {
  final bool allowed;
  final String? reason;
  final int? cooldownMs;

  const AntiCheatCheckResult({
    required this.allowed,
    this.reason,
    this.cooldownMs,
  });
}

class AntiCheatService {
  static const int minClickIntervalMs = 600;
  static const int botSpeedThresholdMs = 250;
  static const int lockoutDurationMs = 5000;

  static final Map<String, int> _lastActionTimestamps = {};
  static final Map<String, int> _strikeCounts = {};
  static final Map<String, int> _lockoutEndTimestamps = {};

  static AntiCheatCheckResult evaluateAction(String actionKey, [int? currentMs]) {
    final now = currentMs ?? DateTime.now().millisecondsSinceEpoch;
    final lockoutUntil = _lockoutEndTimestamps[actionKey] ?? 0;

    if (now < lockoutUntil) {
      final remaining = lockoutUntil - now;
      return AntiCheatCheckResult(
        allowed: false,
        reason: 'Anti-Cheat Protection: Bot/Rapid clicks detected. Wait ${(remaining / 1000).toStringAsFixed(1)}s.',
        cooldownMs: remaining,
      );
    }

    final last = _lastActionTimestamps[actionKey] ?? 0;
    final delta = now - last;

    if (last > 0 && delta < botSpeedThresholdMs) {
      final strikes = (_strikeCounts[actionKey] ?? 0) + 1;
      _strikeCounts[actionKey] = strikes;
      _lastActionTimestamps[actionKey] = now;

      if (strikes >= 2) {
        _lockoutEndTimestamps[actionKey] = now + lockoutDurationMs;
        return const AntiCheatCheckResult(
          allowed: false,
          reason: 'Anti-Cheat Shield: Repeated rapid clicks detected! Cooldown activated.',
          cooldownMs: lockoutDurationMs,
        );
      }

      return const AntiCheatCheckResult(
        allowed: false,
        reason: 'Too fast! Please tap at normal human speed.',
      );
    }

    if (last > 0 && delta < minClickIntervalMs) {
      return const AntiCheatCheckResult(
        allowed: false,
        reason: 'Action throttled. Please wait a moment between taps.',
      );
    }

    _lastActionTimestamps[actionKey] = now;
    _strikeCounts[actionKey] = 0;
    return const AntiCheatCheckResult(allowed: true);
  }
}


