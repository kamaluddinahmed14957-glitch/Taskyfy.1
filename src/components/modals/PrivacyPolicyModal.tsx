import React from 'react';
import { X, ShieldCheck, Lock, Eye, FileText, CheckCircle2, Mail, ExternalLink } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Privacy Policy</h3>
              <p className="text-xs text-neutral-400">Google Play & Store Developer Policy Compliant</p>
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-neutral-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Last Updated: October 2026</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Store Compliance
            </span>
          </div>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
              <span>1. Overview & Purpose</span>
            </h4>
            <p>
              Taskify (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates a mobile micro-task reward platform. This Privacy Policy outlines how user information is handled in accordance with the <strong>Google Play Developer Distribution Agreement</strong> and <strong>Uptodown App Store Guidelines</strong>. Taskify is an activity-reward utility and does not constitute a real-money gambling, lottery, or investment service.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display">
              2. Information We Collect
            </h4>
            <p>We only collect data strictly necessary to provide the rewarded micro-task service:</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400">
              <li><strong>Task Performance Data:</strong> Records of completed video views, quizzes, check-in streaks, and coin reward logs.</li>
              <li><strong>Payment & Redemption Details:</strong> User-submitted withdrawal accounts (e.g., bKash / Nagad mobile numbers or PayPal email) collected exclusively to disburse redeemed cash.</li>
              <li><strong>Anti-Cheat Telemetry:</strong> Tap frequency metrics, bot detection timestamps, and integrity logs to prevent automated abuse and autoclickers.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display">
              3. Advertising & Third-Party SDK Disclosures
            </h4>
            <p>
              Taskify features sponsored previews and partner offers. Rewarded video advertisements are served through compliant ad networks that may collect pseudonymous advertising IDs (Google AID) to deliver non-intrusive rewarded ads. We do not sell personal data to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display">
              4. Anti-Fraud & Fair Play Policy
            </h4>
            <p>
              To maintain fair rewards for genuine human users, Taskify enforces automated client-side and server-side anti-cheat mechanisms. The use of autoclickers, automated macros, emulators with rooted exploits, or duplicate device farms is strictly prohibited and subject to immediate forfeiture of points.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display">
              5. Children&apos;s Privacy (COPPA & Policy 13+)
            </h4>
            <p>
              Taskify is designed for general audiences aged 13 and older (or 18+ for cash withdrawal redemptions depending on local jurisdiction). We do not knowingly solicit or collect personal identifiable information from children under 13.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display">
              6. Data Deletion & Contact
            </h4>
            <p>
              Users have the right to request full erasure of their account data and transaction history at any time. To request data deletion or for privacy questions, contact our Data Protection Officer:
            </p>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-amber-300 flex items-center justify-between">
              <span>privacy@taskify-app.io</span>
              <span className="text-neutral-500">Response within 24h</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">Taskify Security & Compliance Version 2.4</span>
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-all cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
