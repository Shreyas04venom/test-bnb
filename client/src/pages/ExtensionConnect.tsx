import React, { useState, useEffect } from 'react';
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
  Laptop,
  Sparkles,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function ExtensionConnectPage() {
  const [, setLocation] = useLocation();
  const {
    currentUser,
    workspace,
    projects,
    generatePairingCode,
    approveExtensionPairing,
    pairingCode,
    integrations,
  } = usePatchworkStore();

  const areIntegrationsReady = Boolean(
    integrations?.github?.connected && integrations?.vercel?.connected
  );

  const [approved, setApproved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCode, setActiveCode] = useState<string | null>(pairingCode);
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins

  const permissions = [
    'View projects & production URLs',
    'Stage visual CSS overrides & DOM mutations',
    'Publish production hotfixes & visual patches',
    'Real-time multiplayer cursor & presence sync',
    'Review team modifications & live inspector annotations',
  ];

  // Detect extension via postMessage ping
  useEffect(() => {
    if (!areIntegrationsReady) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'AXON_PONG' || event.data?.type === 'AXON_EXTENSION_READY') {
        setExtensionDetected(true);
      }
      if (event.data?.type === 'AXON_CONNECT_SUCCESS') {
        setApproved(true);
        toast.success('Extension authorized successfully!');
        setTimeout(() => setLocation('/extension/success'), 1200);
      }
    };

    window.addEventListener('message', handleMessage);
    // Ping extension
    window.postMessage({ type: 'AXON_PING' }, '*');

    // Also auto-generate pairing code on mount if missing
    // Detect code param if passed from extension
    const urlParams = new URLSearchParams(window.location.search);
    const paramCode = urlParams.get('code');
    if (paramCode) {
      setActiveCode(paramCode);
    } else if (!pairingCode) {
      generatePairingCode().then((c) => setActiveCode(c));
    } else {
      setActiveCode(pairingCode);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(timer);
    };
  }, [areIntegrationsReady]);

  const handleApprove = async () => {
    try {
      const session = await approveExtensionPairing("Chrome Inspector Client");
      
      const sessionPayload = {
        token: session.id,
        serverUrl: window.location.origin,
        workspace,
        user: currentUser,
        activeProjectId: projects[0]?.id || null,
        projects,
      };

      // Broadcast to extension content script
      window.postMessage(
        {
          type: 'AXON_CONNECT_REQUEST',
          ...sessionPayload,
        },
        '*'
      );

      // Also set directly if chrome storage is accessible
      try {
        const winChrome = (window as any).chrome;
        if (winChrome && winChrome.storage && winChrome.storage.local) {
          winChrome.storage.local.set({ axon_auth_session: sessionPayload });
        }
      } catch {}

      // If opened via popup window, notify parent
      try {
        if (window.opener) {
          window.opener.postMessage({ type: 'AXON_CONNECT_SUCCESS', ...sessionPayload }, '*');
        }
      } catch {}

      setApproved(true);
      toast.success('Axon Extension authorized and paired!');
      setTimeout(() => {
        setLocation('/extension/success');
      }, 1000);
    } catch (err: any) {
      toast.error('Failed to authorize extension: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleGenerateCode = async () => {
    const code = await generatePairingCode();
    setActiveCode(code);
    setTimeLeft(900);
    toast.info('New 6-digit pairing PIN generated');
  };

  const handleCopy = () => {
    if (activeCode) {
      navigator.clipboard.writeText(activeCode);
      setCopied(true);
      toast.success('Pairing code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!areIntegrationsReady) {
    return (
      <div className="min-h-screen bg-[#f3f1ec] text-[#1B133C] py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
        <div className="max-w-md w-full text-center mb-6">
          <Link href="/dashboard" className="inline-block mb-4">
            <PatchworkLogo size="md" />
          </Link>
          <h2 className="font-serif text-3xl text-[#1B133C]">
            Integrations Required First
          </h2>
          <p className="text-xs text-[#1B133C]/70 mt-1">
            Browser extension pairing requires authorized Git and deployment provider integrations.
          </p>
        </div>

        <div className="max-w-md w-full glass-card p-6 sm:p-8 border border-white/80 shadow-xl space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Prerequisites Incomplete</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Token code generation is disabled until both <strong>GitHub</strong> and <strong>Vercel</strong> are connected. The extension requires repository write access to commit visual AST patches and Vercel credentials to trigger edge previews.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl border border-black/10 bg-white text-xs">
              <span className="font-semibold text-[#1B133C]">GitHub Integration</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                integrations?.github?.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {integrations?.github?.connected ? 'Connected ✓' : 'Not Connected ✕'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-black/10 bg-white text-xs">
              <span className="font-semibold text-[#1B133C]">Vercel Integration</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                integrations?.vercel?.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {integrations?.vercel?.connected ? 'Connected ✓' : 'Not Connected ✕'}
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              href="/settings/integrations"
              className="w-full py-3 px-4 rounded-xl bg-[#1B133C] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>Connect Integrations in Settings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-2.5 px-4 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1B133C] flex items-center justify-center transition-all text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-[#1B133C] py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center mb-6">
        <Link href="/dashboard" className="inline-block mb-4">
          <PatchworkLogo size="md" />
        </Link>
        <h2 className="font-serif text-3xl text-[#1B133C]">
          Connect Axon Studio Extension
        </h2>
        <p className="text-xs text-[#1B133C]/70 mt-1">
          Pair your browser visual editor with your production control plane workspace.
        </p>
      </div>

      <div className="max-w-md w-full glass-card p-6 sm:p-8 border border-white/80 shadow-xl space-y-6">
        {/* Extension Detected Banner */}
        {extensionDetected ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Axon Extension Detected in Browser</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Ready to Pair
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Loaded extension from folder: <strong>axon/extension</strong></span>
            </div>
          </div>
        )}

        {/* Workspace Card */}
        <div className="p-4 rounded-xl bg-white border border-black/5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Authorizing Workspace</span>
            <p className="font-bold text-[#1B133C] text-sm mt-0.5">{workspace.name}</p>
            <p className="text-muted-foreground">{currentUser?.email || 'shreyas@axon.dev'}</p>
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
            Zero hardcoded secrets. Tokens are cryptographically bound to this session and can be revoked at any time in Workspace Settings.
          </span>
        </div>

        {/* 6-Digit PIN Pairing Box */}
        {activeCode ? (
          <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-2 shadow-inner">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              6-Digit Pairing PIN
            </span>
            <div className="text-3xl font-mono font-extrabold tracking-widest text-emerald-400">
              {activeCode}
            </div>
            <div className="flex items-center justify-center gap-4 pt-1">
              <span className="text-[11px] text-slate-400 font-mono">
                Expires in {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-indigo-300 hover:text-white inline-flex items-center gap-1 font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy PIN'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              Enter this PIN into the extension sidepanel, or click the 1-Click Authorize button below.
            </p>
          </div>
        ) : (
          <button
            onClick={handleGenerateCode}
            className="w-full py-2.5 rounded-xl border border-black/15 bg-white hover:bg-slate-50 text-[#1B133C] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate 6-Digit Pairing PIN</span>
          </button>
        )}

        {/* Approval Action */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleApprove}
            disabled={approved}
            className="w-full py-3.5 rounded-xl bg-[#1B133C] text-white hover:bg-black font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{approved ? 'Extension Authorized ✓' : '1-Click Authorize Extension'}</span>
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
