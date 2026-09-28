import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
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
  ExternalLink,
  UserPlus,
  Trash2,
  Laptop,
  Chrome,
  Clock,
  Send,
  X
} from 'lucide-react';
import { Link } from 'wouter';

export default function CollaborationPage() {
  const {
    currentUser,
    members,
    presence,
    activeProjectId,
    projects,
    inviteMember,
    updateMemberRole,
    removeMember,
    updateMyPresence,
    extensionSessions
  } = usePatchworkStore();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'developer' | 'designer' | 'qa' | 'admin' | 'viewer'>('developer');
  const [inviteColor, setInviteColor] = useState('#6366F1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local interactive cursor state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [localCursor, setLocalCursor] = useState<{ x: number; y: number } | null>(null);
  const lastSyncRef = useRef<number>(0);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.min(100, Math.max(0, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setLocalCursor({ x, y });

    const now = Date.now();
    if (now - lastSyncRef.current > 120) {
      lastSyncRef.current = now;
      updateMyPresence({
        cursorX: x,
        cursorY: y,
        currentRoute: window.location.pathname,
      });
    }
  };

  const handleCanvasMouseLeave = () => {
    setLocalCursor(null);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsSubmitting(true);
    try {
      await inviteMember(inviteEmail.trim(), inviteName.trim() || undefined, inviteRole, inviteColor);
      setIsInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const COLOR_PALETTE = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

  return (
    <DashboardLayout
      title="Realtime Collaboration"
      subtitle="Multiplayer presence, live cursor identities, and active route synchronization."
    >
      <div className="space-y-6">
        {/* TOP CONTROLS & STATUS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-black/5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 overflow-hidden">
              {members.slice(0, 5).map((m) => (
                <img
                  key={m.id}
                  src={m.user.avatar}
                  alt={m.user.name}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1B133C]">
                {members.length} Workspace {members.length === 1 ? 'Collaborator' : 'Collaborators'}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {presence.length > 0 ? `${presence.length} active live right now` : '1 active live right now'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/extension-connect"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-black/5 hover:bg-black/10 text-xs font-semibold text-[#1B133C] transition-colors"
            >
              <Chrome className="w-3.5 h-3.5 text-indigo-600" />
              Pair Extension
            </Link>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Teammate
            </button>
          </div>
        </div>

        {/* MULTIPLAYER LIVE CANVAS SIMULATOR */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-[#1B133C]">Live Multiplayer Viewport Canvas</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>Move mouse inside viewport to broadcast live cursor</span>
            </div>
          </div>

          {/* Interactive Visual DOM Surface with Live Team Cursors */}
          <div
            ref={canvasRef}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            className="relative h-88 rounded-2xl bg-slate-50 border border-black/10 shadow-inner overflow-hidden flex flex-col justify-between p-6 select-none cursor-crosshair group"
          >
            {/* Background wireframe representing the live site */}
            <div className="space-y-4 opacity-40 pointer-events-none">
              <div className="flex items-center justify-between">
                <div className="h-6 w-36 rounded-md bg-slate-300" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded bg-slate-200" />
                  <div className="h-6 w-16 rounded bg-slate-200" />
                  <div className="h-6 w-20 rounded bg-indigo-200" />
                </div>
              </div>
              <div className="h-10 w-3/4 rounded-md bg-slate-300" />
              <div className="h-4 w-1/2 rounded-md bg-slate-200" />
              <div className="flex gap-4 pt-2">
                <div className="h-9 w-32 rounded-lg bg-indigo-500/80" />
                <div className="h-9 w-28 rounded-lg bg-slate-200" />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="h-20 rounded-xl bg-white border border-slate-200" />
                <div className="h-20 rounded-xl bg-white border border-slate-200" />
                <div className="h-20 rounded-xl bg-white border border-slate-200" />
              </div>
            </div>

            {/* LOCAL USER'S LIVE MOUSE CURSOR */}
            {localCursor && (
              <div
                className="absolute pointer-events-none transition-none z-30"
                style={{ left: `${localCursor.x}%`, top: `${localCursor.y}%` }}
              >
                <MousePointer
                  className="w-5 h-5 drop-shadow -rotate-12"
                  style={{
                    color: currentUser?.cursorColor || '#6366F1',
                    fill: currentUser?.cursorColor || '#6366F1',
                  }}
                />
                <div
                  className="mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-md flex items-center gap-1 whitespace-nowrap"
                  style={{ backgroundColor: currentUser?.cursorColor || '#6366F1' }}
                >
                  <span>{currentUser?.name || 'You'} (Active)</span>
                </div>
              </div>
            )}

            {/* DYNAMIC EXTENSION & TEAM CURSORS */}
            {presence
              .filter((p) => p.userId !== currentUser?.id)
              .map((p) => (
                <div
                  key={p.userId}
                  className="absolute pointer-events-none transition-all duration-300 ease-out z-20"
                  style={{
                    left: `${Math.min(95, Math.max(5, p.cursorX ?? 50))}%`,
                    top: `${Math.min(90, Math.max(8, p.cursorY ?? 50))}%`,
                  }}
                >
                  <MousePointer
                    className="w-5 h-5 drop-shadow -rotate-12"
                    style={{ color: p.cursorColor || '#EC4899', fill: p.cursorColor || '#EC4899' }}
                  />
                  <div
                    className="mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-md flex items-center gap-1 whitespace-nowrap"
                    style={{ backgroundColor: p.cursorColor || '#EC4899' }}
                  >
                    <span>{p.name}</span>
                    {p.selectedElement && (
                      <span className="font-mono bg-black/20 px-1 rounded text-[9px]">
                        {p.selectedElement}
                      </span>
                    )}
                  </div>
                </div>
              ))}

            {/* Empty canvas hint if no external presence */}
            {presence.length === 0 && !localCursor && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="p-4 rounded-xl bg-white/90 border border-black/10 shadow-lg text-center max-w-sm">
                  <Activity className="w-8 h-8 text-indigo-600 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-[#1B133C]">Live Multiplayer Sync Ready</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Open your live site with the Axon Extension or hover inside this canvas to test multiplayer cursors and DOM inspection.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-black/5 flex items-center justify-between text-xs text-muted-foreground z-10 bg-slate-50/90 backdrop-blur-xs -mx-6 -mb-6 p-4">
              <span>
                Target URL:{' '}
                <strong>{activeProject ? activeProject.productionUrl : 'http://localhost:3000'}</strong>
              </span>
              <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Presence Engine: ACTIVE (24ms)
              </span>
            </div>
          </div>
        </div>

        {/* TEAM MEMBERS & PRESENCE ROSTER */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <h3 className="text-base font-bold text-[#1B133C] flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Workspace Members & Access Control
            </h3>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              + Add Member
            </button>
          </div>

          <div className="divide-y divide-black/5 space-y-3">
            {members.map((m) => {
              const isOnline = presence.some((p) => p.userId === m.userId) || m.userId === currentUser?.id;
              const onlinePresence = presence.find((p) => p.userId === m.userId);

              return (
                <div
                  key={m.id}
                  className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={m.user.avatar}
                        alt={m.user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#1B133C]">{m.user.name}</p>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: m.user.cursorColor }}
                          title={`Cursor color: ${m.user.cursorColor}`}
                        />
                        {m.userId === currentUser?.id && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{m.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {onlinePresence && (
                      <div className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono">
                        Route: {onlinePresence.currentRoute}
                      </div>
                    )}

                    <select
                      value={m.role}
                      disabled={m.role === 'owner'}
                      onChange={(e) => updateMemberRole(m.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-black/10 bg-white text-xs font-medium text-[#1B133C] focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="developer">Developer</option>
                      <option value="designer">Designer</option>
                      <option value="qa">QA</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    {m.role !== 'owner' && m.userId !== currentUser?.id && (
                      <button
                        onClick={() => removeMember(m.id)}
                        className="p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONNECTED EXTENSION SESSIONS */}
        <div className="glass-card p-6 border border-white/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <span className="text-xs font-bold text-[#1B133C] uppercase tracking-wider flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-indigo-600" />
              Paired Extension Clients ({extensionSessions.length})
            </span>
            <Link
              href="/settings/extension"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Manage Tokens →
            </Link>
          </div>

          {extensionSessions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">
                No active Chrome extension paired yet.
              </p>
              <Link
                href="/extension-connect"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                <Chrome className="w-3.5 h-3.5" />
                Pair Your Extension Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {extensionSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded-xl bg-white border border-black/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Chrome className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-[#1B133C]">{sess.deviceName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Active {sess.lastActiveAt}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🟢 Authorized
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* INVITE TEAMMATE MODAL */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white border border-black/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-black/5 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B133C]">Invite Team Collaborator</h3>
                  <p className="text-xs text-muted-foreground">Add engineers, designers, or reviewers</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B133C] mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B133C] mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B133C] mb-1">Workspace Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="developer">Developer</option>
                    <option value="designer">Designer</option>
                    <option value="qa">QA Engineer</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B133C] mb-1">Cursor Color</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setInviteColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          inviteColor === c ? 'ring-2 ring-offset-2 ring-black scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-2 rounded-lg border border-black/10 text-xs font-semibold text-muted-foreground hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !inviteEmail.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending Invite...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
