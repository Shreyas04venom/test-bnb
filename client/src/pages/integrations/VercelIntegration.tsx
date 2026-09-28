import React, { useState } from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  Rocket,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  FolderGit2,
  ShieldCheck,
  ArrowLeft,
  Check
} from 'lucide-react';

export default function VercelIntegrationPage() {
  const { integrations, updateIntegrations, logAudit } = usePatchworkStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [connected, setConnected] = useState(integrations.vercel.connected);

  const vercelProjects = [
    { name: 'prj_shopwave_vercel', domain: 'shopwave.dev', framework: 'Next.js', status: 'Production Healthy' },
    { name: 'prj_landinglab_vercel', domain: 'landinglab.co', framework: 'React (Vite)', status: 'Production Healthy' },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      updateIntegrations((prev) => ({
        ...prev,
        vercel: { ...prev.vercel, lastSync: 'Just now' },
      }));
      logAudit('VERCEL_CONNECTED', { metadata: { action: 'resync_projects' } });
    }, 600);
  };

  const handleToggle = () => {
    const nextState = !connected;
    setConnected(nextState);
    updateIntegrations((prev) => ({
      ...prev,
      vercel: { ...prev.vercel, connected: nextState },
    }));
  };

  return (
    <DashboardLayout
      title="Vercel Integration"
      subtitle="Preview deployments, edge aliases, and production promotion adapter."
      actions={
        <Link
          href="/settings/integrations"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1B133C] hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Integrations
        </Link>
      }
    >
      <div className="max-w-4xl space-y-6">
        {/* Main Status */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-base shadow-xs">
                ▲
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#1B133C]">Vercel</h3>
                  {connected ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                      Disconnected
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Connected Team: <strong className="text-[#1B133C]">{integrations.vercel.team}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={isSyncing || !connected}
                className="px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1B133C] flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
                <span>Sync Projects</span>
              </button>
              <button
                onClick={handleToggle}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  connected
                    ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-[#1B133C] text-white hover:bg-black'
                }`}
              >
                {connected ? 'Disconnect' : 'Connect Vercel'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-black/5 text-xs text-muted-foreground leading-relaxed">
            Every visual patch generated in PATCHWORK triggers an isolated Vercel preview deployment (e.g., <code className="text-indigo-600 font-mono">shopwave-git-patchwork-pw-104.vercel.app</code>) before team approval and production promotion.
          </div>
        </div>

        {/* Linked Projects Table */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <h4 className="text-sm font-bold text-[#1B133C]">Mapped Vercel Projects</h4>

          <div className="divide-y divide-black/5">
            {vercelProjects.map((p) => (
              <div key={p.name} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#1B133C] font-mono">{p.name}</p>
                  <p className="text-muted-foreground mt-0.5">Production Domain: {p.domain}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
