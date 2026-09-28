import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { PatchworkLogo } from '@/components/PatchworkLogo';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  Puzzle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Key,
  Copy,
  Check,
  ExternalLink,
  Laptop
} from 'lucide-react';

export default function ExtensionConnectPage() {
  const [, setLocation] = useLocation();
  const {
    currentUser,
    workspace,
    generatePairingCode,
    approveExtensionPairing,
    pairingCode,
  } = usePatchworkStore();

  const [approved, setApproved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCode, setActiveCode] = useState<string | null>(pairingCode);

  const permissions = [
    'View projects & active git branches',
    'Create visual patches & stage DOM diffs',
    'Read project CSS configuration & typography tokens',
    'Submit patches for team verification & review',
    'View deployment status & preview environments',
  ];

  const handleApprove = () => {
    approveExtensionPairing("Chrome on User's Machine");
    setApproved(true);
    setTimeout(() => {
      setLocation('/extension/success');
    }, 1200);
  };

  const handleGenerateCode = () => {
    const code = generatePairingCode();
    setActiveCode(code);
  };

  const handleCopy = () => {
    if (activeCode) {
      navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-[#1B133C] py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center mb-6">
        <Link href="/dashboard" className="inline-block mb-4">
          <PatchworkLogo size="md" />
        </Link>
        <h2 className="font-serif text-3xl text-[#1B133C]">
          Connect PATCHWORK Extension
        </h2>
        <p className="text-xs text-[#1B133C]/70 mt-1">
          Pair your browser extension client with your control plane workspace.
        </p>
      </div>

      <div className="max-w-md w-full glass-card p-6 sm:p-8 border border-white/80 shadow-xl space-y-6">
        {/* Workspace Card */}
        <div className="p-4 rounded-xl bg-white border border-black/5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Authorizing Workspace</span>
            <p className="font-bold text-[#1B133C] text-sm mt-0.5">{workspace.name}</p>
            <p className="text-muted-foreground">{currentUser?.email}</p>
          </div>
          <span className="w-8 h-8 rounded-lg bg-[#1B133C] text-white flex items-center justify-center font-bold text-xs">
            {workspace.name.substring(0, 1)}
          </span>
        </div>

        {/* Permissions Scope Checklist */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-[#1B133C] uppercase tracking-wider block">
            Requested Scopes:
          </span>
          <div className="space-y-2 text-xs">
            {permissions.map((perm) => (
              <div key={perm} className="flex items-start gap-2.5 text-[#1B133C]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200 text-[11px] text-indigo-950 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            Permanent GitHub/Vercel secrets are never stored in the extension. Only a short-lived token is issued.
          </span>
        </div>

        {/* Pairing Code Section */}
        {activeCode ? (
          <div className="p-4 rounded-xl bg-slate-900 text-white text-center space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Pairing Code</span>
            <div className="text-3xl font-mono font-bold tracking-widest text-emerald-400">
              {activeCode}
            </div>
            <p className="text-[11px] text-slate-400">Valid for 10 minutes</p>
            <button
              onClick={handleCopy}
              className="mt-2 text-xs text-indigo-300 hover:text-white inline-flex items-center gap-1 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateCode}
            className="w-full py-2.5 rounded-xl border border-black/15 bg-white hover:bg-slate-50 text-[#1B133C] text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate 6-Digit Pairing Code</span>
          </button>
        )}

        {/* Approval Action */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleApprove}
            disabled={approved}
            className="w-full py-3 rounded-xl bg-[#1B133C] text-white hover:bg-black font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{approved ? 'Connection Approved ✓' : 'Approve Extension Connection'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/dashboard"
            className="block text-center text-xs text-muted-foreground hover:underline pt-1"
          >
            Cancel & Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
