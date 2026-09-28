import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  FolderGit2,
  GitPullRequest,
  Rocket,
  ShieldCheck,
  Users,
  History,
  RotateCcw,
  FileText,
  Settings,
  Puzzle,
  Github,
  Search,
  ChevronDown,
  LogOut,
  ExternalLink,
  Plus,
  AlertTriangle,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  Database
} from 'lucide-react';
import { PatchworkLogo } from './PatchworkLogo';
import { CommandPalette } from './CommandPalette';
import { NotificationCenter } from './NotificationCenter';
import { usePatchworkStore, SEED_MEMBERS } from '@/lib/patchworkStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    currentUser,
    workspace,
    projects,
    activeProjectId,
    setActiveProject,
    extensionSessions,
    switchUser,
    logout,
  } = usePatchworkStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const isExtensionConnected = extensionSessions.length > 0;

  const mainNav = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderGit2, badge: projects.length },
    { label: 'Patches', href: '/patches', icon: GitPullRequest, badge: 'Live' },
    { label: 'Deployments', href: '/deployments', icon: Rocket },
    { label: 'Verification', href: '/verification', icon: ShieldCheck },
    { label: 'Collaboration', href: '/collaboration', icon: Users, badge: 'Realtime' },
    { label: 'Conflicts', href: '/conflicts', icon: AlertTriangle, badge: '1' },
    { label: 'Versions', href: '/versions', icon: History },
    { label: 'Rollback', href: '/rollback', icon: RotateCcw },
    { label: 'Audit Logs', href: '/audit', icon: FileText },
  ];

  const integrationNav = [
    { label: 'GitHub App', href: '/settings/integrations/github', icon: Github, connected: true },
    { label: 'Vercel Previews', href: '/settings/integrations/vercel', icon: Rocket, connected: true },
    { label: 'Netlify Sites', href: '/settings/integrations/netlify', icon: ExternalLink, connected: true },
    { label: 'Supabase Realtime', href: '/settings/integrations/supabase', icon: Database, connected: true },
  ];

  const settingsNav = [
    { label: 'Workspace Settings', href: '/settings/workspace', icon: Settings },
    { label: 'Team & Members', href: '/settings/team', icon: Users },
    { label: 'Chrome Extension', href: '/settings/extension', icon: Puzzle },
    { label: 'AI Model & Gates', href: '/settings/ai', icon: Sparkles },
  ];

  return (
    <div className="flex min-h-screen bg-[#f3f1ec] text-[#1B133C] antialiased">
      <CommandPalette />

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[#1B133C]/10 bg-white/75 backdrop-blur-xl shrink-0 sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#1B133C]/10 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <PatchworkLogo size="md" />
          </Link>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
            Control Plane
          </span>
        </div>

        {/* Workspace Selector */}
        <div className="p-3 border-b border-[#1B133C]/10 bg-black/[0.02]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-2 rounded-xl bg-white/90 border border-[#1B133C]/10 shadow-2xs hover:bg-white transition-all text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-[#1B133C] text-white flex items-center justify-center font-bold text-xs">
                    {workspace.name.substring(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1B133C] truncate">{workspace.name}</p>
                    <p className="text-[10px] text-muted-foreground">{workspace.plan} Plan</p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 glass-dropdown border border-white/60">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Workspaces</DropdownMenuLabel>
              <DropdownMenuItem className="text-xs font-semibold text-[#1B133C]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                {workspace.name} (Active)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation('/onboarding')} className="text-xs text-indigo-600">
                <Plus className="w-3.5 h-3.5 mr-2" /> Create New Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          <div>
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#1B133C]/50">Platform</p>
            <nav className="space-y-0.5">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1B133C] text-white shadow-xs font-semibold'
                        : 'text-[#1B133C]/80 hover:bg-black/5 hover:text-[#1B133C]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#1B133C]/60'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-black/5 text-[#1B133C]/70'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Integrations */}
          <div>
            <div className="flex items-center justify-between px-2 pb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1B133C]/50">Integrations</p>
              <Link href="/settings/integrations" className="text-[10px] text-indigo-600 hover:underline">
                Manage
              </Link>
            </div>
            <nav className="space-y-0.5">
              {integrationNav.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1B133C] text-white font-semibold'
                        : 'text-[#1B133C]/80 hover:bg-black/5 hover:text-[#1B133C]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#1B133C]/60" />
                      <span>{item.label}</span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Settings Submenu */}
          <div>
            <div className="flex items-center justify-between px-2 pb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1B133C]/50">Workspace & Settings</p>
              <Link href="/settings" className="text-[10px] text-indigo-600 hover:underline">
                Overview
              </Link>
            </div>
            <nav className="space-y-0.5">
              {settingsNav.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1B133C] text-white font-semibold'
                        : 'text-[#1B133C]/80 hover:bg-black/5 hover:text-[#1B133C]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#1B133C]/60" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Extension Connection Widget */}
        <div className="p-3 border-t border-[#1B133C]/10 bg-black/[0.01]">
          <Link
            href="/settings/extension"
            className="block p-2.5 rounded-xl border border-dashed border-[#1B133C]/20 hover:border-indigo-500 bg-white/70 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-[#1B133C]">Chrome Extension</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  isExtensionConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isExtensionConnected ? 'Connected ✓' : 'Pair Device'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
              {isExtensionConnected ? "Visual editing client active" : "Connect client for visual editing"}
            </p>
          </Link>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-[#1B133C]/10 bg-white/90">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-black/5 transition-all text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={currentUser?.avatar || SEED_MEMBERS[0].user.avatar}
                    alt={currentUser?.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-black/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1B133C] truncate">{currentUser?.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{currentUser?.email}</p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-dropdown border border-white/60">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Demo Member</DropdownMenuLabel>
              {SEED_MEMBERS.map((m) => (
                <DropdownMenuItem
                  key={m.userId}
                  onClick={() => switchUser(m.user)}
                  className="text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.user.cursorColor }} />
                    <span>{m.user.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{m.role}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation('/settings/profile')} className="text-xs">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()} className="text-xs text-rose-600 font-medium">
                <LogOut className="w-3.5 h-3.5 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3 bg-white/70 backdrop-blur-md border-b border-[#1B133C]/10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#1B133C] hover:bg-black/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Active Project Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/10 bg-white/80 hover:bg-white text-xs font-semibold text-[#1B133C] shadow-2xs transition-all">
                  <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{activeProject.name}</span>
                  <span className="text-[10px] font-mono font-normal text-muted-foreground">({activeProject.framework})</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 glass-dropdown border border-white/60">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Select Project</DropdownMenuLabel>
                {projects.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => setActiveProject(p.id)}
                    className="text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.repositoryName}</p>
                    </div>
                    {p.id === activeProjectId && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/onboarding/project')} className="text-xs text-indigo-600 font-medium">
                  <Plus className="w-3.5 h-3.5 mr-2" /> Connect New Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Live Environment Badge */}
            <a
              href={activeProject.productionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeProject.productionUrl.replace('https://', '')}</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Button */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
                document.dispatchEvent(event);
              }}
              className="hidden sm:inline-flex items-center gap-3 px-3 py-1.5 rounded-xl border border-black/10 bg-white/70 hover:bg-white text-xs text-muted-foreground shadow-2xs transition-all"
            >
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Search or jump to...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-black/5 rounded text-[#1B133C]/60">Ctrl+K</kbd>
            </button>

            {/* Quick Extension Pair Action */}
            <Link
              href="/extension/connect"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#1B133C]/10 text-xs font-semibold text-[#1B133C] hover:bg-black/5 shadow-2xs transition-all"
            >
              <Puzzle className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden md:inline">Connect Extension</span>
            </Link>

            {/* Notification Center */}
            <NotificationCenter />
          </div>
        </header>

        {/* Page Header (if title specified) */}
        {title && (
          <div className="px-4 lg:px-8 pt-6 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#1B133C]">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-[#1B133C]/70 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
