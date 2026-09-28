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
  const { projects, createProject, verifyProjectOwnership, patches } = usePatchworkStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Project Form
  const [name, setName] = useState('');
  const [repoName, setRepoName] = useState('company/new-repo');
  const [framework, setFramework] = useState<'Next.js' | 'React (Vite)'>('Next.js');
  const [provider, setProvider] = useState<'vercel' | 'netlify'>('vercel');
  const [productionUrl, setProductionUrl] = useState('https://app.example.com');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
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
        {/* Project Cards Grid */}
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

          <form onSubmit={handleCreate} className="space-y-4 py-2">
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1B133C]">GitHub Repository (org/repo)</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="company/project-repo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-mono focus:outline-none"
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
                className="px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black shadow-xs"
              >
                Connect Project
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
