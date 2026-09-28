import { Router, Request, Response } from 'express';
import { z } from 'zod';
import type {
  Project,
  Patch,
  Deployment,
  VerificationRun,
  AuditLog,
  ExtensionSession,
  IntegrationsConfig,
  ConflictItem
} from '../shared/patchwork-types';

export const patchworkApiRouter = Router();

// In-Memory state for the server session and extension clients
let serverProjects: Project[] = [
  {
    id: 'proj-1',
    workspaceId: 'ws-1',
    name: 'ShopWave',
    slug: 'shopwave',
    productionUrl: 'https://shopwave.dev',
    framework: 'Next.js',
    repositoryId: 'repo-101',
    repositoryName: 'company/shopwave-web',
    repositoryUrl: 'https://github.com/company/shopwave-web',
    deploymentProvider: 'vercel',
    deploymentProjectId: 'prj_shopwave_vercel',
    defaultBranch: 'main',
    status: 'production_healthy',
    ownershipStatus: 'verified',
    verifiedAt: '2026-02-10T11:20:00Z',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-09-28T10:15:00Z',
  },
  {
    id: 'proj-2',
    workspaceId: 'ws-1',
    name: 'CuraCommerce',
    slug: 'curacommerce',
    productionUrl: 'https://curacommerce.io',
    framework: 'Next.js',
    repositoryId: 'repo-102',
    repositoryName: 'company/curacommerce-app',
    repositoryUrl: 'https://github.com/company/curacommerce-app',
    deploymentProvider: 'netlify',
    deploymentProjectId: 'site_cura_netlify',
    defaultBranch: 'production',
    status: 'production_healthy',
    ownershipStatus: 'verified',
    verifiedAt: '2026-02-14T09:40:00Z',
    createdAt: '2026-01-20T12:00:00Z',
    updatedAt: '2026-09-27T16:22:00Z',
  },
  {
    id: 'proj-3',
    workspaceId: 'ws-1',
    name: 'LandingLab',
    slug: 'landinglab',
    productionUrl: 'https://landinglab.co',
    framework: 'React (Vite)',
    repositoryId: 'repo-103',
    repositoryName: 'company/landinglab-site',
    repositoryUrl: 'https://github.com/company/landinglab-site',
    deploymentProvider: 'vercel',
    deploymentProjectId: 'prj_landinglab_vercel',
    defaultBranch: 'main',
    status: 'production_healthy',
    ownershipStatus: 'verified',
    verifiedAt: '2026-03-01T15:00:00Z',
    createdAt: '2026-02-05T09:30:00Z',
    updatedAt: '2026-09-25T11:05:00Z',
  },
];

let serverPatches: Patch[] = [
  {
    id: 'PW-104',
    projectId: 'proj-1',
    workspaceId: 'ws-1',
    author: {
      id: 'usr-1',
      name: 'Shreyas',
      email: 'shreyas@patchwork.dev',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'owner',
      cursorColor: '#6366F1',
      timezone: 'America/San_Francisco',
      githubUsername: 'shreyas-pw',
    },
    title: 'Update hero CTA & glassmorphism badge',
    description: 'Updated hero action button typography, rounded padding, and converted static pill into glassmorphic pill badge with subtle hover transition.',
    status: 'READY_TO_DEPLOY',
    riskLevel: 'LOW',
    branchName: 'patchwork/PW-104-hero-cta',
    commitSha: 'a8f9c12',
    previewUrl: 'https://shopwave-git-patchwork-pw-104.vercel.app',
    productionDeploymentId: 'DEP-89',
    source: 'extension',
    createdAt: '2026-09-28T09:30:00Z',
    updatedAt: '2026-09-28T14:45:00Z',
    files: [
      {
        filename: 'src/components/Hero.tsx',
        category: 'frontend',
        changeType: 'modified',
        additions: 12,
        deletions: 4,
        diffSummary: 'Changed CTA button classes and added glowing pill badge markup',
        oldContent: `export function Hero() { ... }`,
        newContent: `export function Hero() { ... }`,
      },
    ],
    comments: [],
    reviews: [],
    aiSummary: {
      explanation: 'Replaces plain buttons with high-contrast pill styling and adds a live status beacon.',
      why: 'Improves CTA conversion and matches modern editorial aesthetic requested in design review.',
      affectedComponents: ['Hero', 'Navbar', 'CallToActionSection'],
      potentialRisks: ['Check dark mode text contrast on ultra-wide screens'],
      dependencies: ['Tailwind CSS v4 inline glass tokens'],
    },
  },
];

let serverPairingCodes: Record<string, { code: string; expiresAt: number; userId: string }> = {};
let serverExtensionSessions: ExtensionSession[] = [];

// ==========================================
// 1. AUTH API (/api/auth)
// ==========================================
patchworkApiRouter.get('/auth/me', (_req: Request, res: Response) => {
  res.json({
    success: true,
    user: {
      id: 'usr-1',
      name: 'Shreyas',
      email: 'shreyas@patchwork.dev',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'owner',
      cursorColor: '#6366F1',
      workspaceId: 'ws-1',
    },
  });
});

patchworkApiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json({
    success: true,
    user: {
      id: 'usr-1',
      name: email ? email.split('@')[0] : 'Shreyas',
      email: email || 'shreyas@patchwork.dev',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'owner',
      cursorColor: '#6366F1',
    },
    token: 'pw_sess_jwt_mock_7a892b1',
  });
});

patchworkApiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// 2. PROJECTS API (/api/projects)
// ==========================================
patchworkApiRouter.get('/projects', (_req: Request, res: Response) => {
  res.json({ success: true, projects: serverProjects });
});

patchworkApiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const project = serverProjects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }
  res.json({ success: true, project });
});

patchworkApiRouter.post('/projects', (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    productionUrl: z.string().url(),
    framework: z.string(),
    repositoryName: z.string(),
    deploymentProvider: z.enum(['vercel', 'netlify', 'custom']),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.format() });
  }

  const newProject: Project = {
    id: `proj-${Date.now()}`,
    workspaceId: 'ws-1',
    name: parsed.data.name,
    slug: parsed.data.slug,
    productionUrl: parsed.data.productionUrl,
    framework: parsed.data.framework as any,
    repositoryId: `repo-${Date.now()}`,
    repositoryName: parsed.data.repositoryName,
    repositoryUrl: `https://github.com/${parsed.data.repositoryName}`,
    deploymentProvider: parsed.data.deploymentProvider as any,
    deploymentProjectId: `deploy_prj_${Date.now()}`,
    defaultBranch: 'main',
    status: 'production_healthy',
    ownershipStatus: 'verified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  serverProjects.unshift(newProject);
  res.status(201).json({ success: true, project: newProject });
});

patchworkApiRouter.post('/projects/:id/verify', (req: Request, res: Response) => {
  const project = serverProjects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }
  project.ownershipStatus = 'verified';
  project.verifiedAt = new Date().toISOString();
  project.status = 'production_healthy';
  res.json({ success: true, project, verified: true, message: 'Ownership verified via GitHub organization attestation' });
});

// ==========================================
// 3. PATCHES API (/api/patches)
// ==========================================
patchworkApiRouter.get('/patches', (req: Request, res: Response) => {
  const projectId = req.query.projectId as string | undefined;
  const status = req.query.status as string | undefined;
  let result = serverPatches;
  if (projectId) result = result.filter((p) => p.projectId === projectId);
  if (status) result = result.filter((p) => p.status === status);
  res.json({ success: true, patches: result });
});

patchworkApiRouter.get('/patches/:id', (req: Request, res: Response) => {
  const patch = serverPatches.find((p) => p.id === req.params.id);
  if (!patch) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Patch not found' } });
  }
  res.json({ success: true, patch });
});

patchworkApiRouter.post('/patches', (req: Request, res: Response) => {
  const { title, projectId, description, files, riskLevel, source } = req.body;
  const patchId = `PW-${serverPatches.length + 105}`;
  const newPatch: Patch = {
    id: patchId,
    projectId: projectId || 'proj-1',
    workspaceId: 'ws-1',
    author: {
      id: 'usr-1',
      name: 'Shreyas',
      email: 'shreyas@patchwork.dev',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'owner',
      cursorColor: '#6366F1',
      timezone: 'America/San_Francisco',
    },
    title: title || 'Visual modification',
    description: description || 'Created via PATCHWORK API',
    status: 'DRAFT',
    riskLevel: riskLevel || 'LOW',
    branchName: `patchwork/${patchId.toLowerCase()}`,
    commitSha: Math.random().toString(16).substring(2, 9),
    previewUrl: `https://shopwave-git-${patchId.toLowerCase()}.vercel.app`,
    files: files || [],
    comments: [],
    reviews: [],
    source: source || 'extension',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  serverPatches.unshift(newPatch);
  res.status(201).json({ success: true, patch: newPatch });
});

patchworkApiRouter.patch('/patches/:id', (req: Request, res: Response) => {
  const patch = serverPatches.find((p) => p.id === req.params.id);
  if (!patch) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Patch not found' } });
  }
  Object.assign(patch, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success: true, patch });
});

// ==========================================
// 4. DEPLOYMENTS API (/api/deployments)
// ==========================================
patchworkApiRouter.get('/deployments', (_req: Request, res: Response) => {
  res.json({
    success: true,
    deployments: [
      {
        id: 'DEP-89',
        projectId: 'proj-1',
        patchId: 'PW-104',
        environment: 'preview',
        provider: 'vercel',
        commitSha: 'a8f9c12',
        branch: 'patchwork/PW-104-hero-cta',
        status: 'READY',
        previewUrl: 'https://shopwave-git-patchwork-pw-104.vercel.app',
        durationSeconds: 38,
        createdAt: '2026-09-28T09:32:00Z',
      },
    ],
  });
});

// ==========================================
// 5. VERIFICATION API (/api/verifications)
// ==========================================
patchworkApiRouter.get('/verifications', (_req: Request, res: Response) => {
  res.json({
    success: true,
    verification: {
      id: 'ver-104',
      patchId: 'PW-104',
      status: 'passed',
      visualSimilarityPercent: 98.7,
      checksPassed: 12,
      totalChecks: 12,
    },
  });
});

patchworkApiRouter.post('/verifications/run', (req: Request, res: Response) => {
  const { patchId } = req.body;
  res.json({
    success: true,
    message: `Verification suite started for ${patchId || 'PW-104'}`,
    status: 'passed',
    passedChecks: 12,
    similarity: 98.7,
  });
});

// ==========================================
// 6. INTEGRATIONS API (/api/integrations)
// ==========================================
patchworkApiRouter.get('/integrations', (_req: Request, res: Response) => {
  res.json({
    success: true,
    integrations: {
      github: { connected: true, org: 'company', appInstalled: true },
      vercel: { connected: true, team: 'agnidev-team' },
      netlify: { connected: true, team: 'company-net' },
      supabase: { connected: true, projectUrl: 'https://vbtlzywxqabn.supabase.co' },
    },
  });
});

// ==========================================
// 7. EXTENSION API (/api/extension/*)
// (First-Class Client API for Chrome Extension)
// ==========================================
// POST /api/extension/pair -> Generates secure 6-digit code
patchworkApiRouter.post('/extension/pair', (_req: Request, res: Response) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  serverPairingCodes[code] = {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
    userId: 'usr-1',
  };
  res.json({
    success: true,
    pairingCode: code,
    expiresInSeconds: 600,
    instructions: 'Enter this 6-digit code in the PATCHWORK Chrome Extension or approve via /extension/connect',
  });
});

// POST /api/extension/session -> Exchange pairing code or approval for token
patchworkApiRouter.post('/extension/session', (req: Request, res: Response) => {
  const { pairingCode, deviceName, browser } = req.body;
  const token = `pw_ext_tok_${Math.random().toString(36).substring(2, 16)}`;

  const newSession: ExtensionSession = {
    id: `ext-sess-${Date.now()}`,
    userId: 'usr-1',
    workspaceId: 'ws-1',
    deviceName: deviceName || "Chrome Extension Client",
    browser: browser || 'Chrome 129',
    tokenHash: `hash_${token.substring(0, 10)}...`,
    permissions: [
      'View projects',
      'Create patches',
      'Read project configuration',
      'Submit patches',
      'View deployment status',
    ],
    createdAt: new Date().toISOString(),
    lastActiveAt: 'Just now',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  serverExtensionSessions.push(newSession);

  res.json({
    success: true,
    accessToken: token,
    tokenType: 'Bearer',
    expiresInDays: 30,
    workspace: {
      id: 'ws-1',
      name: 'AgniDev',
    },
    user: {
      id: 'usr-1',
      name: 'Shreyas',
      email: 'shreyas@patchwork.dev',
    },
    session: newSession,
  });
});

// DELETE /api/extension/session -> Revoke session
patchworkApiRouter.delete('/extension/session/:id', (req: Request, res: Response) => {
  serverExtensionSessions = serverExtensionSessions.filter((s) => s.id !== req.params.id);
  res.json({ success: true, message: 'Extension session revoked' });
});

// GET /api/extension/projects -> Extension gets authorized project list
patchworkApiRouter.get('/extension/projects', (_req: Request, res: Response) => {
  res.json({
    success: true,
    projects: serverProjects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      productionUrl: p.productionUrl,
      framework: p.framework,
      deploymentProvider: p.deploymentProvider,
      defaultBranch: p.defaultBranch,
      ownershipVerified: p.ownershipStatus === 'verified',
    })),
  });
});

// GET /api/extension/projects/:id/config -> Extension fetches project selector rules
patchworkApiRouter.get('/extension/projects/:id/config', (req: Request, res: Response) => {
  const project = serverProjects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  res.json({
    success: true,
    config: {
      projectId: project.id,
      productionUrl: project.productionUrl,
      branch: project.defaultBranch,
      framework: project.framework,
      cssEngine: 'Tailwind CSS',
      allowedSelectors: ['body *'],
      disallowedSelectors: ['script', 'style', 'iframe'],
      aiAssistedPatching: true,
      maxDiffLines: 1500,
    },
  });
});

// POST /api/extension/projects/:id/patches -> Extension creates new visual patch
patchworkApiRouter.post('/extension/projects/:id/patches', (req: Request, res: Response) => {
  const { title, description, files, riskLevel } = req.body;
  const patchId = `PW-${serverPatches.length + 105}`;
  const newPatch: Patch = {
    id: patchId,
    projectId: req.params.id,
    workspaceId: 'ws-1',
    author: {
      id: 'usr-1',
      name: 'Shreyas',
      email: 'shreyas@patchwork.dev',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'owner',
      cursorColor: '#6366F1',
      timezone: 'America/San_Francisco',
    },
    title: title || 'Visual hotfix from Chrome Extension',
    description: description || 'Visual DOM edit captured via extension',
    status: 'SUBMITTED',
    riskLevel: riskLevel || 'LOW',
    branchName: `patchwork/${patchId.toLowerCase()}`,
    commitSha: Math.random().toString(16).substring(2, 9),
    previewUrl: `https://shopwave-git-${patchId.toLowerCase()}.vercel.app`,
    files: files || [],
    comments: [],
    reviews: [],
    source: 'extension',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  serverPatches.unshift(newPatch);
  res.status(201).json({
    success: true,
    patch: newPatch,
    dashboardUrl: `/patches/${patchId}`,
  });
});

// POST /api/extension/presence -> Extension publishes user cursor & active element
patchworkApiRouter.post('/extension/presence', (req: Request, res: Response) => {
  const { projectId, route, cursorX, cursorY, selectedElement } = req.body;
  res.json({
    success: true,
    acknowledged: true,
    presenceSnapshot: {
      userId: 'usr-1',
      projectId,
      route,
      cursorX,
      cursorY,
      selectedElement,
      receivedAt: new Date().toISOString(),
    },
  });
});

// POST /api/extension/events -> Extension publishes lifecycle event
patchworkApiRouter.post('/extension/events', (req: Request, res: Response) => {
  const { eventType, payload } = req.body;
  res.json({
    success: true,
    eventType,
    queued: true,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 8. AUDIT API (/api/audit)
// ==========================================
patchworkApiRouter.get('/audit', (_req: Request, res: Response) => {
  res.json({
    success: true,
    logs: [
      {
        id: 'aud-1',
        action: 'PATCH_UPDATED',
        user: 'Shreyas',
        timestamp: new Date().toISOString(),
        result: 'success',
      },
    ],
  });
});

// ==========================================
// 9. COLLABORATORS API (/api/collaborators)
// ==========================================
patchworkApiRouter.get('/collaborators', (_req: Request, res: Response) => {
  res.json({
    success: true,
    collaborators: [
      { id: 'usr-1', name: 'Shreyas', email: 'shreyas@patchwork.dev', role: 'owner', status: 'online' },
      { id: 'usr-2', name: 'Arnav', email: 'arnav@patchwork.dev', role: 'admin', status: 'online' },
      { id: 'usr-3', name: 'Akshat', email: 'akshat@patchwork.dev', role: 'developer', status: 'online' },
    ],
  });
});
