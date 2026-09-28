import React, { useState } from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  FolderGit2
} from 'lucide-react';

export default function NetlifyIntegrationPage() {
  const { integrations, updateIntegrations, logAudit } = usePatchworkStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [connected, setConnected] = useState(integrations.netlify.connected);

  const netlifySites = [
    { name: 'site_cura_netlify', url: 'https://curacommerce.io', status: 'Healthy', branch: 'production' },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      updateIntegrations((prev) => ({
        ...prev,
        netlify: { ...prev.netlify, lastSync: 'Just now' },
      }));
      logAudit('NETLIFY_CONNECTED', { metadata: { action: 'resync_sites' } });
    }, 600);
  };

  return (
    <DashboardLayout
      title="Netlify Integration"
      subtitle="Deploy previews, branch deploys, and webhook promotion adapter."
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
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                N
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#1B133C]">Netlify</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Connected Team: <strong className="text-[#1B133C]">{integrations.netlify.team}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1B133C] flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
                <span>Sync Sites</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-black/5 text-xs text-muted-foreground leading-relaxed">
            Connected via the Netlify REST API and Deploy Hooks to build isolated branch previews for sites like CuraCommerce.
          </div>
        </div>

        {/* Linked Sites */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <h4 className="text-sm font-bold text-[#1B133C]">Connected Netlify Sites</h4>
          <div className="divide-y divide-black/5">
            {netlifySites.map((s) => (
              <div key={s.name} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#1B133C] font-mono">{s.name}</p>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                    {s.url}
                  </a>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
