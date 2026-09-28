import React from 'react';
import { useRoute, Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  FolderGit2,
  ExternalLink,
  Github,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  GitPullRequest,
  History,
  Settings,
  ArrowLeft,
  Puzzle,
  AlertTriangle,
  Play
} from 'lucide-react';

export default function ProjectDetailPage() {
  const [, params] = useRoute('/projects/:id');
  const { projects, patches, deployments, verifyProjectOwnership } = usePatchworkStore();

  const project = projects.find((p) => p.id === params?.id) || projects[0];
  const projectPatches = patches.filter((p) => p.projectId === project?.id);
  const projectDeployments = deployments.filter((d) => d.projectId === project?.id);

  if (!project) {
    return (
      <DashboardLayout title="Project Not Found">
        <p className="text-sm text-muted-foreground">The requested project could not be found.</p>
        <Link href="/projects" className="text-indigo-600 underline text-xs mt-2 inline-block">
          Return to Projects
        </Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={project.name}
      subtitle={`Repository: ${project.repositoryName} • Managed by ${project.deploymentProvider.toUpperCase()}`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1B133C] hover:bg-slate-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <a
            href={project.productionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black shadow-xs"
          >
            <span>Open Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Project Overview Card */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1B133C]">{project.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Ownership
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Connected to GitHub repository: <span className="font-mono">{project.repositoryName}</span> (Branch: <span className="font-mono">{project.defaultBranch}</span>)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/extension/connect"
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-100 transition-colors"
              >
                <Puzzle className="w-3.5 h-3.5" /> Pair Extension
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
            <div className="p-3 rounded-xl bg-white border border-black/5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Framework</p>
              <p className="font-bold text-[#1B133C] mt-1">{project.framework}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-black/5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Provider</p>
              <p className="font-bold text-[#1B133C] mt-1 uppercase">{project.deploymentProvider}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-black/5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Patches</p>
              <p className="font-bold text-[#1B133C] mt-1">{projectPatches.length} Total</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-black/5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Last Deployed</p>
              <p className="font-bold text-[#1B133C] mt-1">2h ago (DEP-89)</p>
            </div>
          </div>
        </div>

        {/* Patches for this project */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1B133C] flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-indigo-600" />
              Project Patches ({projectPatches.length})
            </h3>
            <Link
              href="/patches"
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              View in Patch Studio
            </Link>
          </div>

          <div className="space-y-3">
            {projectPatches.map((patch) => (
              <div
                key={patch.id}
                className="glass-card p-4 border border-white/80 flex items-center justify-between hover:shadow-md transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {patch.id}
                    </span>
                    <Link
                      href={`/patches/${patch.id}`}
                      className="text-sm font-semibold text-[#1B133C] hover:text-indigo-600"
                    >
                      {patch.title}
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    By {patch.author.name} • {patch.files.length} files • Branch: {patch.branchName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-[#1B133C]">
                    {patch.status.replace(/_/g, ' ')}
                  </span>
                  <Link
                    href={`/patches/${patch.id}`}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
