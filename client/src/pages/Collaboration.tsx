import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore, SEED_MEMBERS } from '@/lib/patchworkStore';
import {
  Users,
  MousePointer,
  Sparkles,
  CheckCircle2,
  Activity,
  Layers,
  MessageSquare,
  ShieldCheck,
  Radio,
  ExternalLink
} from 'lucide-react';

export default function CollaborationPage() {
  const { members, presence, activeProjectId, projects } = usePatchworkStore();
  const [activeCanvasView, setActiveCanvasView] = useState(true);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  return (
    <DashboardLayout
      title="Realtime Collaboration"
      subtitle="Multiplayer presence, live cursor identities, and active route synchronization."
    >
      <div className="space-y-6">
        {/* MULTIPLAYER LIVE CANVAS SIMULATOR */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-[#1B133C]">Live Multiplayer Viewport Simulator</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>Syncing with Chrome Extension client</span>
            </div>
          </div>

          {/* Interactive Visual DOM Surface with Live Team Cursors */}
          <div className="relative h-80 rounded-2xl bg-white border border-black/10 shadow-inner overflow-hidden flex flex-col justify-between p-6 select-none">
            {/* Background wireframe representing the live site */}
            <div className="space-y-4 opacity-50 pointer-events-none">
              <div className="h-6 w-36 rounded-md bg-slate-200" />
              <div className="h-10 w-96 rounded-md bg-slate-200" />
              <div className="flex gap-4">
                <div className="h-8 w-28 rounded-md bg-slate-300" />
                <div className="h-8 w-28 rounded-md bg-slate-100" />
              </div>
            </div>

            {/* CURSOR 1: SHREYAS */}
            <div
              className="absolute transition-all duration-700 ease-out z-20"
              style={{ left: '32%', top: '38%' }}
            >
              <MousePointer className="w-5 h-5 text-indigo-600 drop-shadow fill-indigo-600" />
              <div
                className="mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-md flex items-center gap-1"
                style={{ backgroundColor: '#6366F1' }}
              >
                <span>Shreyas (Editing Hero CTA)</span>
              </div>
            </div>

            {/* CURSOR 2: ARNAV */}
            <div
              className="absolute transition-all duration-700 ease-out z-20"
              style={{ left: '68%', top: '22%' }}
            >
              <MousePointer className="w-5 h-5 text-pink-600 drop-shadow fill-pink-600" />
              <div
                className="mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-md flex items-center gap-1"
                style={{ backgroundColor: '#EC4899' }}
              >
                <span>Arnav (Inspecting Navbar)</span>
              </div>
            </div>

            {/* CURSOR 3: AKSHAT */}
            <div
              className="absolute transition-all duration-700 ease-out z-20"
              style={{ left: '48%', top: '65%' }}
            >
              <MousePointer className="w-5 h-5 text-emerald-600 drop-shadow fill-emerald-600" />
              <div
                className="mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-md flex items-center gap-1"
                style={{ backgroundColor: '#10B981' }}
              >
                <span>Akshat (Testing Mobile Viewport)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Target URL: <strong>{activeProject.productionUrl}</strong></span>
              <span className="font-mono text-emerald-700 font-semibold">WebSockets: CONNECTED (24ms)</span>
            </div>
          </div>
        </div>

        {/* TEAM MEMBERS & PRESENCE ROSTER */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <h3 className="text-base font-bold text-[#1B133C] flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Workspace Members & Active Route Tracking
            </h3>
            <span className="text-xs text-muted-foreground">{members.length} Members</span>
          </div>

          <div className="divide-y divide-black/5 space-y-3">
            {presence.map((p) => (
              <div key={p.userId} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#1B133C]">{p.name}</p>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.cursorColor }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{p.currentActivity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-black/5">
                    <span className="text-muted-foreground">Project: </span>
                    <strong className="text-[#1B133C]">{p.currentProject}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5">
                    <span className="text-muted-foreground">Route: </span>
                    <strong className="text-indigo-700">{p.currentRoute}</strong>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-sans font-bold">Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REALTIME EVENT STREAM PIPELINE */}
        <div className="glass-card p-6 border border-white/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <span className="text-xs font-bold text-[#1B133C] uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              Event Stream Protocol
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Listening for Extension Events</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {[
              'USER_ONLINE',
              'ROUTE_CHANGED',
              'CURSOR_MOVED',
              'ELEMENT_SELECTED',
              'PATCH_STARTED',
              'PATCH_UPDATED',
              'PATCH_APPROVED',
              'PATCH_REJECTED',
            ].map((evt) => (
              <div key={evt} className="p-2 rounded-lg bg-white border border-black/5 text-[#1B133C]">
                <span className="text-emerald-500 mr-1.5">●</span>
                <span className="text-[11px]">{evt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
