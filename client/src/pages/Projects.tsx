import React, { useState } from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import { GitHubIcon, VercelIcon, NetlifyIcon } from '@/components/BrandIcons';
import {
  FolderGit2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Plus,
  GitPullRequest,
  AlertCircle,
  ArrowUpRight,
  GitBranch
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function ProjectsPage() {
  const { projects, createProject, verifyProjectOwnership, patches, integrations } = usePatchworkStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const isGitHubConnected = Boolean(integrations?.github?.connected);
  const githubOrg = integrations?.github?.org || 'axon-team';
  const githubRepos = integrations?.github?.repositories && integrations.github.repositories.length > 0
    ? integrations.github.repositories
    : ['axon-core', 'axon-studio', 'storefront-web', 'analytics-dashboard', 'auth-service'];

  // New Project Form
  const [name, setName] = useState('');
  const [repoName, setRepoName] = useState('');
  const [framework, setFramework] = useState<'Next.js' | 'React (Vite)'>('Next.js');
  const [provider, setProvider] = useState<'vercel' | 'netlify'>('vercel');
  const [productionUrl, setProductionUrl] = useState('https://app.example.com');

  const handleRepoSelect = (selectedFullName: string) => {
    setRepoName(selectedFullName);
    const short = selectedFullName.includes('/') ? selectedFullName.split('/')[1] : selectedFullName;
    const cleanName = short
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    setName(cleanName);
    setProductionUrl(`https://${short.toLowerCase()}.axon.dev`);
    if (short.toLowerCase().includes('vite') || short.toLowerCase().includes('react')) {
      setFramework('React (Vite)');
    } else {
      setFramework('Next.js');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !repoName) return;
    createProject({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      productionUrl,
      framework,
      repositoryId: `repo-${Date.now()}`,
      repositoryName: repoName,
      repositoryUrl: `https://github.com/${repoName}`,
      deploymentProvider: provider,
      deploymentProjectId: `deploy_${Date.now()}`,
      defaultBranch: 'main',
      status: 'production_healthy',
      ownershipStatus: 'verified',
    });
    setCreateModalOpen(false);
    setName('');
    setRepoName('');
  };

  return (
    <DashboardLayout
      title="Projects"
      subtitle="Connected web repositories, deployment pipelines, and live domain environments."
      actions={
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {projects.length === 0 ? (
          <div className="glass-card p-12 text-center border border-white/80 space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1B133C]">No Projects Connected</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Connect your web repository to start staging visual hotfixes and multiplayer team reviews.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Project</span>
              </button>
            </div>
          </div>
        ) : (
          /* Project Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const projectPatches = patches.filter((p) => p.projectId === project.id);
              const isVercel = project.deploymentProvider.toLowerCase() === 'vercel';

              return (
                <div
                  key={project.id}
                  className="glass-card p-6 border border-white/80 flex flex-col justify-between hover:shadow-lg transition-all space-y-5"
                >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#1B133C]">{project.name}</h3>
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#1B133C] mt-1"
                      >
                        <GitHubIcon size={14} className="text-black/80" />
                        <span className="font-mono">{project.repositoryName}</span>
                      </a>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                        project.ownershipStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  </div>

                  {/* Metadata Tags */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-black/5 font-medium text-[#1B133C]">
                      {project.framework}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/5 font-medium text-[#1B133C] inline-flex items-center gap-1.5 capitalize">
                      {isVercel ? <VercelIcon size={11} /> : <NetlifyIcon size={11} />}
                      <span>{project.deploymentProvider}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/5 font-mono text-muted-foreground inline-flex items-center gap-1 text-[11px]">
                      <GitBranch className="w-3 h-3" />
                      <span>{project.defaultBranch}</span>
                    </span>
                  </div>

                  {/* Production URL */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Production:</span>
                    <a
                      href={project.productionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-indigo-600 hover:underline inline-flex items-center gap-1 truncate max-w-[190px]"
                    >
                      <span>{project.productionUrl.replace('https://', '')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Patch count */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>Active Patches:</span>
                    <span className="font-bold text-[#1B133C]">{projectPatches.length} patches</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-black/5 flex items-center justify-between gap-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex-1 py-2 px-3 rounded-xl border border-black/10 bg-white hover:bg-black/5 font-semibold text-center text-xs text-[#1B133C] transition-all shadow-2xs"
                  >
                    Open Project
                  </Link>
                  <Link
                    href={`/patches?projectId=${project.id}`}
                    className="py-2 px-3 rounded-xl bg-[#1B133C] text-white hover:bg-black font-semibold text-center text-xs transition-all shadow-2xs"
                  >
                    View Patches
                  </Link>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* CREATE PROJECT MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md glass-card border border-white/80">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#1B133C]">Add New Project</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Link a GitHub repository to enable visual DOM patching and preview environments.
            </DialogDescription>
          </DialogHeader>

          {!isGitHubConnected ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>GitHub Account Not Linked</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Project repositories can only be selected from your connected GitHub account. Please connect your GitHub account first to browse and import your repositories.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/settings/integrations/github"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1B133C] text-white hover:bg-black text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <GitHubIcon size={14} />
                  <span>Connect GitHub in Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-black/5"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              {/* GitHub Repository Dropdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1B133C]">GitHub Repository</label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    GitHub Linked ({githubOrg})
                  </span>
                </div>
                <select
                  value={repoName}
                  onChange={(e) => handleRepoSelect(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                >
                  <option value="" disabled>-- Select repository from your GitHub account --</option>
                  {githubRepos.map((r) => {
                    const full = r.includes('/') ? r : `${githubOrg}/${r}`;
                    return (
                      <option key={full} value={full}>
                        {full} (branch: main)
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Select a repository from your linked GitHub account to configure visual live editing.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1B133C]">Project Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing Storefront"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1B133C]">Framework</label>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs focus:outline-none"
                  >
                    <option value="Next.js">Next.js</option>
                    <option value="React (Vite)">React (Vite)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1B133C]">Cloud Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs focus:outline-none"
                  >
                    <option value="vercel">Vercel</option>
                    <option value="netlify">Netlify</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1B133C]">Production Website URL</label>
                <input
                  type="url"
                  value={productionUrl}
                  onChange={(e) => setProductionUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-mono focus:outline-none"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#1B133C] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!repoName || !name}
                  className="px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Connect Project
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
