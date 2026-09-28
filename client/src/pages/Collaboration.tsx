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
import { useUser } from '@clerk/clerk-react';

export default function CollaborationPage() {
  const { user: clerkUser } = useUser();
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

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

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

  // Deduplicate members list by email or userId to prevent 2-2 duplicate accounts
  const uniqueMembers = members.filter((m, idx, arr) => {
    const email = m.user.email?.toLowerCase().trim();
    return arr.findIndex((x) => (email && x.user.email?.toLowerCase().trim() === email) || x.userId === m.userId) === idx;
  });

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
              {uniqueMembers.slice(0, 5).map((m) => {
                const isSelf = Boolean(
                  (currentUser?.id && m.userId === currentUser.id) ||
                  (currentUser?.email && m.user.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
                  (clerkUser?.primaryEmailAddress?.emailAddress && m.user.email?.toLowerCase() === clerkUser.primaryEmailAddress.emailAddress.toLowerCase())
                );
                return (
                  <img
                    key={m.id}
                    src={isSelf && clerkUser?.imageUrl ? clerkUser.imageUrl : m.user.avatar}
                    alt={m.user.name}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  />
                );
              })}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1B133C]">
                {uniqueMembers.length} Workspace {uniqueMembers.length === 1 ? 'Collaborator' : 'Collaborators'}
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
            {uniqueMembers.map((m) => {
              const isSelf = Boolean(
                (currentUser?.id && m.userId === currentUser.id) ||
                (currentUser?.email && m.user.email?.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) ||
                (clerkUser?.primaryEmailAddress?.emailAddress && m.user.email?.toLowerCase().trim() === clerkUser.primaryEmailAddress.emailAddress.toLowerCase().trim())
              );
              const displayName = (isSelf && (clerkUser?.fullName || clerkUser?.firstName))
                ? (clerkUser.fullName || clerkUser.firstName || '')
                : (isSelf && currentUser?.name ? currentUser.name : m.user.name);
              const displayEmail = (isSelf && clerkUser?.primaryEmailAddress?.emailAddress)
                ? clerkUser.primaryEmailAddress.emailAddress
                : (isSelf && currentUser?.email ? currentUser.email : (m.user.email || ''));
              const displayAvatar = (isSelf && clerkUser?.imageUrl)
                ? clerkUser.imageUrl
                : (isSelf && currentUser?.avatar ? currentUser.avatar : m.user.avatar);
              const isOnline = presence.some((p) => p.userId === m.userId) || isSelf;
              const onlinePresence = presence.find((p) => p.userId === m.userId);

              return (
                <div
                  key={m.id}
                  className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={displayAvatar}
                        alt={displayName}
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
                        <p className="text-sm font-bold text-[#1B133C]">{displayName}</p>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: m.user.cursorColor }}
                          title={`Cursor color: ${m.user.cursorColor}`}
                        />
                        {isSelf && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{displayEmail}</p>
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
