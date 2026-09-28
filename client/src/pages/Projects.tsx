import React, { useState } from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  FolderGit2,
  ExternalLink,
  Github,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Settings,
  GitPullRequest,
  AlertCircle,
  Play
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
      subtitle="Manage connected web repositories, deployment providers, and ownership verifications."
      actions={
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const projectPatches = patches.filter((p) => p.projectId === project.id);
            return (
              <div
                key={project.id}
                className="glass-card p-6 border border-white/80 flex flex-col justify-between hover:shadow-lg transition-all space-y-5"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#1B133C]">{project.name}</h3>
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#1B133C] mt-0.5"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span className="font-mono">{project.repositoryName}</span>
                      </a>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                        project.ownershipStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {project.ownershipStatus === 'verified' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Ownership Verified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" /> Unverified
                        </>
                      )}
                    </span>
                  </div>

                  {/* Metadata Tags */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div className="p-2 rounded-lg bg-black/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Framework</p>
                      <p className="font-medium text-[#1B133C]">{project.framework}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-black/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Provider</p>
                      <p className="font-medium text-[#1B133C] uppercase">{project.deploymentProvider}</p>
                    </div>
                  </div>

                  {/* URL */}
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Production URL:</span>
                    <a
                      href={project.productionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-indigo-600 hover:underline inline-flex items-center gap-1 truncate max-w-[180px]"
                    >
                      <span>{project.productionUrl.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Branch & Status */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Default Branch: <strong className="font-mono text-[#1B133C]">{project.defaultBranch}</strong></span>
                    <span>{projectPatches.length} patches</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-black/5 grid grid-cols-3 gap-2 text-xs">
                  <Link
                    href={`/projects/${project.id}`}
                    className="py-1.5 px-2 rounded-lg border border-black/10 bg-white hover:bg-black/5 font-semibold text-center text-[#1B133C] transition-colors"
                  >
                    Open
                  </Link>
                  <Link
                    href={`/patches?projectId=${project.id}`}
                    className="py-1.5 px-2 rounded-lg border border-black/10 bg-white hover:bg-black/5 font-semibold text-center text-[#1B133C] transition-colors"
                  >
                    Patches
                  </Link>
                  <a
                    href={project.productionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-2 rounded-lg bg-[#1B133C] text-white hover:bg-black font-semibold text-center transition-colors inline-flex items-center justify-center gap-1"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
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
            <DialogTitle className="font-serif text-2xl text-[#1B133C]">Connect New Project</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Map a GitHub repository and deployment environment into PATCHWORK.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-[#1B133C] mb-1">Project Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AcmeStorefront"
                className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B133C] mb-1">GitHub Repository</label>
              <input
                type="text"
                required
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="org/repo-name"
                className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1B133C] mb-1">Framework</label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs"
                >
                  <option value="Next.js">Next.js</option>
                  <option value="React (Vite)">React (Vite)</option>
                  <option value="Vue / Nuxt">Vue / Nuxt</option>
                  <option value="SvelteKit">SvelteKit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B133C] mb-1">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs"
                >
                  <option value="vercel">Vercel</option>
                  <option value="netlify">Netlify</option>
                  <option value="custom">Custom Adapter</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B133C] mb-1">Production URL</label>
              <input
                type="url"
                required
                value={productionUrl}
                onChange={(e) => setProductionUrl(e.target.value)}
                placeholder="https://mysite.com"
                className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs"
              />
            </div>

            <DialogFooter className="pt-4">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1B133C]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black"
              >
                Import & Authorize
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
