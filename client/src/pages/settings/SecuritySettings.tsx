import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SettingsNav } from '@/components/SettingsNav';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck2,
  AlertCircle,
  EyeOff
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const { auditLogs } = usePatchworkStore();

  return (
    <DashboardLayout
      title="Security & Access Control"
      subtitle="Audit trails, webhook secrets, encryption keys, and session verification policies."
    >
      <div className="space-y-6 max-w-4xl">
        <SettingsNav currentTab="security & audit" />

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-5 border border-white/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">Credential Encryption</span>
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-[#1B133C]">AES-256-GCM</p>
            <p className="text-[11px] text-emerald-700">Keys encrypted at rest with hardware KMS</p>
          </div>

          <div className="glass-card p-5 border border-white/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">Extension Auth</span>
              <KeyRound className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-[#1B133C]">ECDSA Ephemeral</p>
            <p className="text-[11px] text-indigo-700">Zero plain API keys stored in Chrome</p>
          </div>

          <div className="glass-card p-5 border border-white/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">Audit Compliance</span>
              <FileCheck2 className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-[#1B133C]">SOC2 Type II</p>
            <p className="text-[11px] text-purple-700">Immutable ledger enabled</p>
          </div>
        </div>

        {/* Webhook Signatures */}
        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-black/5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1B133C] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1B133C]">Webhook Signing Secret</h3>
              <p className="text-xs text-muted-foreground">Verify payload authenticity for inbound GitHub, Vercel, and Netlify events.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1B133C]">Active Signing Secret</label>
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-black/10 bg-black/[0.02]">
              <span className="font-mono text-xs text-muted-foreground">whsec_9a87f8b2c4e10d5f6a8e0b4c2d...</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active & Enforced
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
