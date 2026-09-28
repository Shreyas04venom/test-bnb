import React from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  FolderGit2,
  GitPullRequest,
  Rocket,
  ShieldCheck,
  RotateCcw,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Plus,
  GitBranch,
  GitCommit,
  Clock,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const {
    projects,
    patches,
    deployments,
    verificationRun,
    auditLogs,
    members,
    presence,
    activeProjectId,
  } = usePatchworkStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const activePatches = patches.filter((p) => p.status !== 'DEPLOYED' && p.status !== 'ROLLED_BACK');
  const latestPatch = patches[0];
  const latestDeployment = deployments[0];

  return (
    <DashboardLayout
      title="Overview"
      subtitle={`${activeProject.name} • ${activeProject.productionUrl.replace('https://', '')}`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/patches"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Patch</span>
          </Link>
          <a
            href={activeProject.productionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/10 bg-white text-[#1B133C] text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-all"
          >
            <span>Visit Production</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      }
    >
      <div className="space-y-6">
        {/* TOP SPOTLIGHT: ACTIVE PROJECT HERO & LIVE PREVIEW FRAME */}
        <div className="glass-card p-6 border border-white/80 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[#1B133C]">{activeProject.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Production Healthy
                </span>
                <span className="text-xs font-mono text-muted-foreground uppercase bg-black/5 px-2 py-0.5 rounded">
                  {activeProject.framework} • {activeProject.deploymentProvider}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {activeProject.repositoryName} (Branch: <span className="font-bold text-[#1B133C]">{activeProject.defaultBranch}</span>)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/patches/PW-104"
                className="px-4 py-2 rounded-xl bg-[#1B133C] text-white hover:bg-black text-xs font-semibold shadow-xs flex items-center gap-2"
              >
                <span>Inspect Active Patch (PW-104)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* VISUAL SITE MOCKUP BANNER */}
          <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-xs">
            {/* Mock browser top bar */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-black/5 flex items-center justify-between text-xs text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 font-sans font-medium text-[#1B133C]">Live Preview: {activeProject.productionUrl}</span>
              </div>
              <span className="text-emerald-700 font-semibold">98.7% Visual Accuracy</span>
            </div>

            {/* Visual preview content representation */}
            <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-white to-[#fbfaf8] space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-white shadow-2xs text-xs font-medium text-[#1B133C]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Git-native visual patching v2.4</span>
              </div>
              <h3 className="font-serif text-3xl sm:text-5xl font-normal text-[#1B133C] tracking-tight">
                Hotfix the Internet.
              </h3>
              <p className="max-w-md mx-auto text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Direct DOM manipulation and styling edits captured via Chrome extension and mapped to git commits.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button className="px-6 py-2.5 rounded-xl bg-[#1B133C] text-white font-medium text-xs shadow-md">
                  Start Patching Free
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 CLEAN KEY METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-5 border border-white/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">Active Patches</span>
              <GitPullRequest className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-[#1B133C]">{activePatches.length}</p>
            <p className="text-xs text-indigo-700 font-medium">1 patch ready to deploy (PW-104)</p>
          </div>

          <div className="glass-card p-5 border border-white/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">Automated Verification</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-[#1B133C]">12 / 12 Passed</p>
            <p className="text-xs text-emerald-700 font-medium">Zero console errors • 98.7% match</p>
          </div>

          <div className="glass-card p-5 border border-white/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">Latest Production Release</span>
              <Rocket className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-[#1B133C]">DEP-89</p>
            <p className="text-xs text-purple-700 font-medium">Live on Vercel (Commit: a8f9c12)</p>
          </div>
        </div>

        {/* TWO COLUMN GRID: ACTIVE PATCHES & ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Patches (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1B133C] flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-indigo-600" />
                Active Visual Patches
              </h3>
              <Link href="/patches" className="text-xs text-indigo-600 font-semibold hover:underline">
                View All ({patches.length})
              </Link>
            </div>

            <div className="space-y-3">
              {patches.slice(0, 4).map((patch) => (
                <div
                  key={patch.id}
                  className="glass-card p-4 border border-white/80 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        {patch.id}
                      </span>
                      <Link
                        href={`/patches/${patch.id}`}
                        className="text-sm font-bold text-[#1B133C] hover:text-indigo-600 transition-colors truncate"
                      >
                        {patch.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>By <strong>{patch.author.name}</strong></span>
                      <span>•</span>
                      <span>{patch.files.length} files modified</span>
                      <span>•</span>
                      <span className="font-mono">{patch.branchName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        patch.status === 'READY_TO_DEPLOY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : patch.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : patch.status === 'DEPLOYED'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {patch.status.replace(/_/g, ' ')}
                    </span>
                    <Link
                      href={`/patches/${patch.id}`}
                      className="px-3 py-1.5 rounded-xl bg-[#1B133C] text-white hover:bg-black text-xs font-semibold shadow-2xs"
                    >
                      Review Diff
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed & Team Presence (1 Column) */}
          <div className="space-y-6">
            {/* Live Presence */}
            <div className="glass-card p-5 border border-white/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <span className="text-xs font-bold text-[#1B133C] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Team Presence
                </span>
                <Link href="/collaboration" className="text-[11px] text-indigo-600 hover:underline">
                  Multiplayer
                </Link>
              </div>

              <div className="space-y-2.5">
                {presence.map((p) => (
                  <div key={p.userId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[#1B133C] leading-none">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{p.currentRoute}</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.cursorColor }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-5 border border-white/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <h4 className="text-xs font-bold text-[#1B133C] uppercase tracking-wider">Recent Activity</h4>
                <Link href="/audit" className="text-[11px] text-indigo-600 hover:underline">
                  Audit Logs
                </Link>
              </div>

              <div className="space-y-2.5 text-xs">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-[#1B133C] leading-tight">
                        <strong>{log.user.name}</strong>{' '}
                        <span className="text-muted-foreground">{log.action.toLowerCase().replace(/_/g, ' ')}</span>{' '}
                        {log.patchId && <strong className="font-mono text-indigo-700">{log.patchId}</strong>}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
