import React from 'react';
import { ShieldCheck, HelpCircle, FileText, Lock, Sparkles, Heart } from 'lucide-react';
import { sounds } from '../utils/audio';

interface FooterProps {
  onOpenPrivacyPolicy: () => void;
  onOpenAboutHelp: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyPolicy, onOpenAboutHelp }) => {
  return (
    <footer className="mt-16 border-t border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md pt-10 pb-20 md:pb-10 transition-all text-xs text-neutral-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Compliance & Policy Statement Strip */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block font-display text-sm">
                Taskify Fair Play & Safety Guarantee
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Points are rewarded strictly for genuine micro-task completion, not guaranteed gambling returns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-300 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-emerald-400">
              ✓ Google Play Compliant
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400">
              ✓ Uptodown Verified
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-amber-400">
              ✓ Zero Gambling
            </span>
          </div>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Brand & Copyright */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-display text-white">Taskify</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                v2.4-Production
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              © 2026 Taskify Earning App. All rights reserved.
            </p>
          </div>

          {/* Navigation & Safety Modal Links */}
          <div className="flex items-center gap-5 text-xs font-semibold flex-wrap">
            <button
              onClick={() => {
                sounds.playTap();
                onOpenPrivacyPolicy();
              }}
              className="text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                onOpenAboutHelp();
              }}
              className="text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
              <span>About Us & Help</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                onOpenAboutHelp();
              }}
              className="text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Anti-Cheat Shield</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
