import React, { useState } from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  Database,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Key,
  ShieldCheck,
  Radio
} from 'lucide-react';

export default function SupabaseIntegrationPage() {
  const { integrations, updateIntegrations, logAudit } = usePatchworkStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      updateIntegrations((prev) => ({
        ...prev,
        supabase: { ...prev.supabase, lastSync: 'Just now' },
      }));
      logAudit('SUPABASE_CONNECTED', { metadata: { action: 'ping_realtime_pool' } });
    }, 600);
  };

  return (
    <DashboardLayout
      title="Supabase Database & Realtime"
      subtitle="PostgreSQL relational database layer and WebSocket realtime presence broadcast."
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
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#1B133C]">Supabase PostgreSQL</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {integrations.supabase.projectUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1B133C] flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                <span>Test WebSockets</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-white border border-black/5">
              <span className="text-muted-foreground uppercase text-[10px] font-semibold">PostgreSQL RLS</span>
              <p className="font-bold text-emerald-700 mt-1">Tenant-Isolated</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-black/5">
              <span className="text-muted-foreground uppercase text-[10px] font-semibold">Realtime Engine</span>
              <p className="font-bold text-emerald-700 mt-1 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Active Broadcast
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-black/5">
              <span className="text-muted-foreground uppercase text-[10px] font-semibold">Anon / Service Keys</span>
              <p className="font-bold text-[#1B133C] mt-1">Configured (Server Only)</p>
            </div>
          </div>
        </div>

        {/* Realtime Event Topics */}
        <div className="glass-card p-6 border border-white/80 space-y-3">
          <h4 className="text-sm font-bold text-[#1B133C]">Active Realtime Presence Channels</h4>
          <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-1">
            <div className="text-slate-400">// Channel: patchwork:ws-1:presence</div>
            <div>user_presence:broadcast (Shreyas, Arnav, Akshat) [ONLINE]</div>
            <div>cursor_position:broadcast [ACTIVE]</div>
            <div>patch_lifecycle:events [LISTENING]</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
