import React, { useState } from 'react';
import {
  Wallet,
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Smartphone,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Lock,
  Unlock,
  Check,
} from 'lucide-react';
import { WithdrawalMethod, WithdrawalMethodId, WithdrawalTransaction } from '../types';
import { sounds } from '../utils/audio';
import { WithdrawalService } from '../services/taskifyCore';
import confetti from 'canvas-confetti';

interface WalletSectionProps {
  coins: number;
  onWithdraw: (transaction: Omit<WithdrawalTransaction, 'id' | 'date' | 'status' | 'trxId'>) => boolean;
  transactions: WithdrawalTransaction[];
  onApproveTransaction?: (txId: string) => void;
  onAddDemoCoins?: () => void;
}

const METHODS: WithdrawalMethod[] = [
  {
    id: 'bkash',
    name: 'bKash',
    category: 'mfs',
    iconColor: '#E2136E',
    accentBg: 'rgba(226, 19, 110, 0.15)',
    minCoins: 1000,
    ratePerCoin: 0.12, // 1000 coins = 120 BDT
    currency: 'BDT',
    symbol: '৳',
    accountLabel: 'bKash Personal Mobile Number',
    accountPlaceholder: 'e.g. 01712345678 (11 digits)',
    badge: 'Popular (120 BDT)',
  },
  {
    id: 'nagad',
    name: 'Nagad',
    category: 'mfs',
    iconColor: '#F7931E',
    accentBg: 'rgba(247, 147, 30, 0.15)',
    minCoins: 1000,
    ratePerCoin: 0.12, // 1000 coins = 120 BDT
    currency: 'BDT',
    symbol: '৳',
    accountLabel: 'Nagad Account Number',
    accountPlaceholder: 'e.g. 01812345678 (11 digits)',
    badge: 'Fast Payout',
  },
  {
    id: 'recharge',
    name: 'Mobile Recharge',
    category: 'telecom',
    iconColor: '#0D9488',
    accentBg: 'rgba(13, 148, 136, 0.15)',
    minCoins: 1000,
    ratePerCoin: 0.12, // 1000 coins = 120 BDT
    currency: 'BDT',
    symbol: '৳',
    accountLabel: 'Mobile Number & Operator',
    accountPlaceholder: 'e.g. 01912345678 (11 digits)',
    badge: 'Instant Airtime',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'global',
    iconColor: '#0070BA',
    accentBg: 'rgba(0, 112, 186, 0.15)',
    minCoins: 1000,
    ratePerCoin: 0.001, // 1000 coins = $1.00 USD
    currency: 'USD',
    symbol: '$',
    accountLabel: 'PayPal Account Email Address',
    accountPlaceholder: 'your.email@example.com',
    badge: 'Global USD ($1.00)',
  },
];

const OPERATORS = ['Grameenphone', 'Banglalink', 'Robi', 'Airtel', 'Teletalk'];

export const WalletSection: React.FC<WalletSectionProps> = ({
  coins,
  onWithdraw,
  transactions,
  onApproveTransaction,
  onAddDemoCoins,
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<WithdrawalMethodId>('bkash');
  const [amountCoins, setAmountCoins] = useState<number>(1000);
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState(OPERATORS[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyTab, setHistoryTab] = useState<'pending' | 'completed'>('pending');

  const selectedMethod = METHODS.find((m) => m.id === selectedMethodId) || METHODS[0];
  const minThreshold = WithdrawalService.MIN_PAYOUT_THRESHOLD; // 1,000 Coins
  const isThresholdMet = coins >= minThreshold;
  const thresholdProgress = Math.min(100, Math.round((coins / minThreshold) * 100));

  const estimatedPayout = (amountCoins * selectedMethod.ratePerCoin).toFixed(
    selectedMethod.currency === 'USD' ? 2 : 0
  );

  // Filter transactions into Pending and Completed
  const pendingRequests = transactions.filter((tx) => tx.status === 'pending' || tx.status === 'processing');
  const completedRequests = transactions.filter((tx) => tx.status === 'completed' || tx.status === 'rejected');

  const handleSelectMethod = (id: WithdrawalMethodId) => {
    sounds.playTap();
    setSelectedMethodId(id);
    setErrorMsg(null);
    if (amountCoins < minThreshold) {
      setAmountCoins(minThreshold);
    }
  };

  const handlePresetAmount = (preset: number) => {
    sounds.playTap();
    setAmountCoins(preset);
    setErrorMsg(null);
  };

  const handleSubmitRedemption = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Requirement 2: Strict Validation before allowing withdrawal requests
    const validation = WithdrawalService.validateWithdrawalRequest(
      coins,
      amountCoins,
      selectedMethodId,
      accountNumber
    );

    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Invalid withdrawal request.');
      sounds.playWrong();
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const payoutVal = parseFloat(estimatedPayout);
      const acc =
        selectedMethod.id === 'recharge'
          ? `${accountNumber.trim()} (${selectedOperator})`
          : accountNumber.trim();

      // Requirement 3: Deduct coins upon successful request and queue pending transaction
      const success = onWithdraw({
        methodId: selectedMethod.id,
        methodName: selectedMethod.name,
        account: acc,
        coins: amountCoins,
        payoutAmount: payoutVal,
        currency: selectedMethod.currency,
      });

      if (success) {
        sounds.playFanfare();
        sounds.playCoin();
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#3b82f6'],
        });

        setSuccessMsg(
          `Withdrawal request submitted! Deducted ${amountCoins.toLocaleString()} coins. Your request for ${selectedMethod.symbol}${estimatedPayout} ${selectedMethod.currency} is now in the Pending Requests queue.`
        );
        setAccountNumber('');
        setHistoryTab('pending'); // Automatically switch to Pending Requests tab
      } else {
        setErrorMsg('Failed to process withdrawal. Check your balance.');
      }
    }, 850);
  };

  return (
    <section className="space-y-6">
      {/* 1. Available Balance & Threshold Progress Summary Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-900/90 border border-neutral-800 p-5 sm:p-7 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-bl from-amber-500/10 via-yellow-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>Available Earnings Balance</span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold font-display tabular-nums tracking-tight text-white">
                  {coins.toLocaleString()}
                </span>
                <span className="text-base sm:text-lg font-bold text-amber-400 uppercase">
                  Coins
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-neutral-300 font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800">
                  ≈ ৳{(coins * 0.12).toFixed(0)} BDT
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800">
                  ≈ ${(coins / 1000).toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Threshold Progress Bar (1,000 Coins Minimum) */}
            <div className="max-w-md pt-1">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  {isThresholdMet ? (
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>
                    Minimum Payout Threshold: <strong className="text-white">1,000 Coins</strong> ($1.00 USD / 120 BDT)
                  </span>
                </span>
                <span className={`font-mono font-bold ${isThresholdMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {thresholdProgress}%
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isThresholdMet
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  }`}
                  style={{ width: `${thresholdProgress}%` }}
                />
              </div>

              {!isThresholdMet && (
                <p className="text-[11px] text-amber-400/90 mt-1.5">
                  ⚠️ You need {(minThreshold - coins).toLocaleString()} more coins to unlock cash redemption.
                </p>
              )}
            </div>
          </div>

          {/* Quick Demo Test Coins Tool */}
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs flex flex-col gap-2.5 max-w-xs shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verification & Testing</span>
              </span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Want to test the full withdrawal flow right away? Add demo coins to meet the 1,000 threshold.
            </p>
            {onAddDemoCoins && (
              <button
                onClick={() => {
                  onAddDemoCoins();
                  sounds.playCoin();
                }}
                className="w-full py-2 px-3 rounded-xl bg-neutral-900 border border-amber-500/30 hover:border-amber-400 hover:bg-neutral-850 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+1,000 Test Coins (Unlock Threshold)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Form (7 cols) + Pending/Completed Requests Ledger (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Submission (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900/90 rounded-2xl sm:rounded-3xl border border-neutral-800 p-5 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold font-display text-white">Redeem Cash</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
              Min. 1,000 Coins
            </span>
          </div>
          <p className="text-xs text-neutral-400 mb-5">
            Select your payment provider, verify your account details, and submit for instant processing.
          </p>

          <form onSubmit={handleSubmitRedemption} className="space-y-5">
            {/* 1. Payment Method Selection */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-2.5">
                1. Select Withdrawal Method
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {METHODS.map((method) => {
                  const isSelected = selectedMethodId === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => handleSelectMethod(method.id)}
                      className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-22 ${
                        isSelected
                          ? 'border-amber-400 bg-neutral-950 ring-1 ring-amber-400/40 shadow-lg'
                          : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-950'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: method.iconColor }}
                        />
                        {method.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 truncate max-w-[70px]">
                            {method.badge}
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <span className="text-xs font-bold text-white block truncate font-display">
                          {method.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-mono">
                          Min. 1,000c
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Amount Selection & Preset Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-300">
                  2. Select Coins to Withdraw (Min 1,000)
                </label>
                <span className="text-xs text-neutral-400 font-mono">
                  Available: {coins.toLocaleString()}c
                </span>
              </div>

              {/* Amount input & Max Button */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Coins className="w-4 h-4 text-amber-400" />
                </div>
                <input
                  type="number"
                  min={1000}
                  max={Math.max(1000, coins)}
                  step={500}
                  value={amountCoins}
                  onChange={(e) => {
                    setAmountCoins(Math.max(0, parseInt(e.target.value) || 0));
                    setErrorMsg(null);
                  }}
                  className="w-full pl-10 pr-24 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white font-display font-bold text-lg tabular-nums outline-none transition-all"
                  placeholder="Enter coin amount (min 1,000)"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => handlePresetAmount(Math.max(1000, coins))}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-bold text-amber-400 transition-colors cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Preset pill shortcuts */}
              <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1">
                {[1000, 2500, 5000, 10000].map((preset) => {
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetAmount(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
                        amountCoins === preset
                          ? 'bg-amber-400 text-neutral-950'
                          : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {preset.toLocaleString()} Coins
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Account / Mobile Number Input */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-2">
                3. {selectedMethod.accountLabel}
              </label>

              {selectedMethod.id === 'recharge' && (
                <div className="mb-2.5">
                  <label className="text-[11px] text-neutral-400 block mb-1">Select Network Operator:</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {OPERATORS.map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setSelectedOperator(op)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate ${
                          selectedOperator === op
                            ? 'bg-teal-500/20 border border-teal-400 text-teal-300'
                            : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <input
                type={selectedMethod.id === 'paypal' ? 'email' : 'tel'}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={selectedMethod.accountPlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white text-sm outline-none transition-all placeholder:text-neutral-600 font-mono"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                {selectedMethod.id === 'paypal'
                  ? 'Must be a valid active PayPal email address.'
                  : 'Must be an 11-digit mobile number starting with 01 (e.g. 01712345678).'}
              </span>
            </div>

            {/* Payout Conversion Calculation Summary */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Total Coins Deducted:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {amountCoins.toLocaleString()} Coins
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Platform Gateway Fee:</span>
                <span className="font-mono text-emerald-400 font-semibold">FREE (0%)</span>
              </div>
              <div className="pt-2 border-t border-neutral-850 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300">You Receive:</span>
                <span className="text-lg font-extrabold font-display text-amber-300 tabular-nums">
                  {selectedMethod.symbol}{estimatedPayout} {selectedMethod.currency}
                </span>
              </div>
            </div>

            {/* Error / Success feedback alerts */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Redeem Cash Primary Action CTA */}
            <button
              type="submit"
              disabled={isSubmitting || !isThresholdMet}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 shadow-lg ${
                !isThresholdMet
                  ? 'bg-neutral-800 border border-neutral-700/80 text-neutral-500 cursor-not-allowed'
                  : isSubmitting
                  ? 'bg-neutral-800 text-neutral-400 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 shadow-amber-500/25 hover:shadow-amber-500/40'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin" />
                  <span>Processing Withdrawal Request...</span>
                </>
              ) : !isThresholdMet ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Threshold Locked (Need 1,000 Coins)</span>
                </>
              ) : (
                <>
                  <span>Redeem {selectedMethod.symbol}{estimatedPayout} Cash</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Pending Requests & History Ledger (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900/90 rounded-2xl sm:rounded-3xl border border-neutral-800 p-5 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header with Segmented Tabs: Pending Requests vs Completed Payouts */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-display text-white">Withdrawal Ledger</h3>
              
              <div className="flex items-center p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setHistoryTab('pending');
                    sounds.playTap();
                  }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    historyTab === 'pending'
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Pending</span>
                  <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-300 text-[10px] flex items-center justify-center font-bold">
                    {pendingRequests.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHistoryTab('completed');
                    sounds.playTap();
                  }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    historyTab === 'completed'
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Paid</span>
                  <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-300 text-[10px] flex items-center justify-center font-bold">
                    {completedRequests.length}
                  </span>
                </button>
              </div>
            </div>

            {/* TAB 1: PENDING REQUESTS LIST */}
            {historyTab === 'pending' && (
              <div>
                <div className="mb-3 px-1 flex items-center justify-between text-[11px] text-amber-400/90">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Awaiting gateway disbursement (~15-30m)</span>
                  </span>
                  <span>{pendingRequests.length} Active</span>
                </div>

                {pendingRequests.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 text-xs bg-neutral-950/40 rounded-2xl border border-neutral-850 p-6">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
                    <span className="text-neutral-300 font-semibold block">No Pending Requests</span>
                    <p className="mt-1 text-neutral-500 text-[11px]">
                      When you submit a withdrawal request, it will appear here for verification and payout.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {pendingRequests.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30 hover:border-amber-400/50 shadow-md transition-all text-xs relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white font-display text-sm">
                                {tx.methodName}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                                <Clock className="w-3 h-3 animate-spin" />
                                <span>Pending Approval</span>
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-400 font-mono mt-0.5 block truncate max-w-[200px]">
                              {tx.account}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-extrabold font-display text-amber-300 block">
                              {tx.currency === 'USD' ? '$' : '৳'}
                              {tx.payoutAmount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              -{tx.coins.toLocaleString()} Coins
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                          <span>TrxID: {tx.trxId}</span>
                          <span>{tx.date}</span>
                        </div>

                        {/* Interactive Admin Simulation Button */}
                        {onApproveTransaction && (
                          <div className="mt-2.5 pt-2 border-t border-neutral-900 flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400">Tester control:</span>
                            <button
                              type="button"
                              onClick={() => onApproveTransaction(tx.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                              title="Simulate Admin Payout Disbursement"
                            >
                              <Check className="w-3 h-3" />
                              <span>Simulate Admin Payout</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: COMPLETED PAYOUTS LIST */}
            {historyTab === 'completed' && (
              <div>
                {completedRequests.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 text-xs bg-neutral-950/40 rounded-2xl border border-neutral-850 p-6">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
                    <span className="text-neutral-300 font-semibold block">No Completed Payouts</span>
                    <p className="mt-1 text-neutral-500 text-[11px]">
                      Successfully disbursed payouts will be archived here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {completedRequests.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-neutral-800 transition-all text-xs"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-display">
                              {tx.methodName}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-mono truncate max-w-[120px]">
                              {tx.account}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-neutral-400">
                          <span className="font-mono text-[11px]">{tx.date}</span>
                          <div className="flex items-baseline gap-1.5 font-bold font-display">
                            <span className="text-emerald-400">
                              {tx.currency === 'USD' ? '$' : '৳'}
                              {tx.payoutAmount.toLocaleString()}
                            </span>
                            <span className="text-neutral-500 text-[10px]">
                              ({tx.coins}c)
                            </span>
                          </div>
                        </div>

                        <div className="mt-1 pt-1 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                          <span>TrxID: {tx.trxId}</span>
                          <span className="text-neutral-400">Disbursed (0% Fee)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Policy footer */}
          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Minimum payout: 1,000 Coins</span>
            <span className="text-amber-400 font-semibold">24/7 Verified Gateway</span>
          </div>
        </div>
      </div>
    </section>
  );
};
