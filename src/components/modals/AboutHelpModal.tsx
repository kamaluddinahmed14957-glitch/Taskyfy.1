import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Coins,
  Gift,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Mail,
  Zap,
  Info,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface AboutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'Is Taskify a real-money gambling or casino app?',
    a: 'No. Taskify is strictly an educational micro-task and loyalty reward app. Points are awarded solely for genuine user activity (such as mental math drills, daily attendance, and viewing partner ads). There is ZERO wagering, betting, or chance-based gambling involved, and users can never deposit real money.',
  },
  {
    q: 'What is the minimum withdrawal threshold?',
    a: 'The minimum payout threshold is 1,000 Coins, which equals $1.00 USD (or 120 BDT in local currency). Once your balance reaches 1,000 coins, you can request a cash payout to bKash, Nagad, Mobile Recharge, or PayPal.',
  },
  {
    q: 'How long does it take to receive a cash redemption?',
    a: 'Withdrawal requests are reviewed and disbursed within 1 to 2 hours (and never longer than 24 hours). You can track pending requests in the Withdrawal Ledger in your Wallet tab.',
  },
  {
    q: 'Why does the app have an Anti-Cheat Shield?',
    a: 'Our advertiser partners pay only for authentic human attention. Our Anti-Cheat Shield detects and blocks rapid automated clicking (<250ms), autoclicker utilities, bot scripts, and multiple emulator clones to ensure rewards remain available for real users.',
  },
  {
    q: 'Does it cost any money to use Taskify?',
    a: 'Taskify is 100% free to download and use. We never ask for deposits, credit card details, or entry fees.',
  },
];

export const AboutHelpModal: React.FC<AboutHelpModalProps> = ({ isOpen, onClose }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const toggleFaq = (idx: number) => {
    sounds.playTap();
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">About Us & Help Center</h3>
              <p className="text-xs text-neutral-400">Activity Rewards & Fair Play Disclosures</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-300 leading-relaxed">
          {/* CRITICAL APP STORE POLICY NOTICE BANNER */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-neutral-950 to-amber-500/10 border-2 border-amber-500/40 shadow-lg">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-white font-display uppercase tracking-wide">
                  Policy Disclosure: No Gambling / Activity Rewards Only
                </h4>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  Points and coins in Taskify are <strong>loyalty incentives rewarded exclusively for active user engagement</strong> (completing arithmetic exercises, viewing sponsor media, and daily attendance). Taskify is <strong>NOT a gambling platform, lottery, or speculative investment</strong>. Points have zero cash surrender value until redeemed according to minimum withdrawal thresholds.
                </p>
                <div className="flex items-center gap-4 pt-1 text-[11px] font-semibold text-emerald-400">
                  <span>✓ 100% Free Participation</span>
                  <span>✓ Zero Real-Money Deposits</span>
                  <span>✓ Skill & Activity Based</span>
                </div>
              </div>
            </div>
          </div>

          {/* How Taskify Works */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>How Taskify Points Work</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase font-mono block">Step 01</span>
                <h5 className="font-bold text-white text-xs">Complete Tasks</h5>
                <p className="text-[11px] text-neutral-400">
                  Solve 3 math problems, watch an 8s sponsor ad, or claim your daily streak.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase font-mono block">Step 02</span>
                <h5 className="font-bold text-white text-xs">Earn Coins</h5>
                <p className="text-[11px] text-neutral-400">
                  Earn +10 to +100 coins credited instantly to your live wallet balance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase font-mono block">Step 03</span>
                <h5 className="font-bold text-white text-xs">Redeem Cash</h5>
                <p className="text-[11px] text-neutral-400">
                  Hit 1,000 Coins ($1 USD / 120 BDT) and cash out via bKash, Nagad, or PayPal.
                </p>
              </div>
            </div>
          </div>

          {/* Anti-Cheat & Bot Prevention Policy */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-white">Active Anti-Cheat Protection</h5>
              <p className="text-[11px] text-neutral-400 mt-1">
                Our app incorporates rapid-click throttling (600ms debounce) and automated bot-speed detection. Autoclickers and rapid tapping scripts will trigger temporary security cooldowns to protect legitimate community members.
              </p>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-white font-display">Frequently Asked Questions</h4>
            <div className="space-y-2">
              {FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/70 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-white hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 text-[11px] text-neutral-400 border-t border-neutral-900 pt-2 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Support Contacts */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Need help or payment support?</span>
            </div>
            <a
              href="mailto:support@taskify-app.io"
              className="text-amber-400 hover:text-amber-300 font-mono font-semibold"
            >
              support@taskify-app.io
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">Google Play & Uptodown App Compliance Verified</span>
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-all cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
