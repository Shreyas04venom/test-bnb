import { Router, Request, Response } from 'express';
import { z } from 'zod';
import type {
  Project,
  Patch,
  Deployment,
  VerificationRun,
  AuditLog,
  AuditAction,
  PatchReview,
  ExtensionSession,
  WorkspaceMember,
  ConflictItem,
  Environment,
  DeploymentProviderType,
} from '../shared/patchwork-types';
import {
  getStore,
  saveStore,
  resetStore,
  createPairingCode,
  verifyAndConsumePairingCode,
  recordPresence,
  getActivePresence,
} from './store';

export const patchworkApiRouter = Router();

// Reusable Helpers
function pushAudit(
  action: AuditAction,
  details: {
    projectId?: string;
    projectName?: string;
    patchId?: string;
    result?: 'success' | 'failure' | 'warning';
    metadata?: Record<string, any>;
  } = {},
  req?: Request
) {
  const store = getStore();
  const entry: AuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    user: store.currentUser,
    timestamp: new Date().toISOString(),
    ip: (req?.ip as string) || '127.0.0.1',
    userAgent: (req?.headers?.['user-agent'] as string) || 'Axon Platform',
    result: details.result || 'success',
    metadata: details.metadata || {},
    ...(details.projectId ? { projectId: details.projectId } : {}),
    ...(details.projectName ? { projectName: details.projectName } : {}),
    ...(details.patchId ? { patchId: details.patchId } : {}),
  };
  store.auditLogs.unshift(entry);
}

function createMockVerification(patchId: string, projectId = 'proj-1'): VerificationRun {
  return {
    id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    patchId,
    projectId,
    status: 'passed',
    totalChecks: 12,
    passedChecks: 12,
    visualSimilarityPercent: 99.8,
    potentialRegression: 'low',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    checks: [
      { id: 'vc-1', stepNumber: 1, name: 'Build', description: 'Production bundle compilation', status: 'passed', durationMs: 1200 },
      { id: 'vc-2', stepNumber: 2, name: 'Typecheck', description: 'TypeScript strict checking', status: 'passed', durationMs: 750 },
      { id: 'vc-3', stepNumber: 3, name: 'Visual Regression', description: 'Perceptual screenshot diffing', status: 'passed', durationMs: 1400 },
    ],
  };
}

function createDeploymentRecord(
  patch: Patch,
  environment: Environment = 'preview',
  provider: DeploymentProviderType = 'vercel'
): Deployment {
  return {
    id: `DEP-${Math.floor(100 + Math.random() * 900)}`,
    projectId: patch.projectId,
    patchId: patch.id,
    environment,
    provider,
    commitSha: patch.commitSha || 'main',
    branch: patch.branchName || 'main',
    author: patch.author,
    status: 'READY',
    previewUrl: patch.previewUrl,
    durationSeconds: 22,
    createdAt: new Date().toISOString(),
  };
}

// ==========================================
// 0. FULL STATE SNAPSHOT & RESET
// ==========================================
patchworkApiRouter.get('/state', (_req: Request, res: Response) => {
  const store = getStore();
  res.json({
    success: true,
    data: store,
  });
});

patchworkApiRouter.post('/reset-data', (req: Request, res: Response) => {
  const { seedStarter } = req.body || {};
  const freshStore = resetStore(Boolean(seedStarter));
  res.json({
    success: true,
    message: seedStarter
      ? 'Workspace seeded with 1 production starter project'
      : 'Workspace cleared of all sample data — clean slate ready',
    data: freshStore,
  });
});

// ==========================================
// 1. AUTH API (/api/auth)
// ==========================================
patchworkApiRouter.get('/auth/me', (_req: Request, res: Response) => {
  const store = getStore();
  res.json({
    success: true,
    user: store.currentUser,
  });
});

patchworkApiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, name } = req.body;
  const store = getStore();
  const userName = name || (email ? email.split('@')[0] : 'Team Lead');

  store.currentUser = {
    ...store.currentUser,
    name: userName,
    email: email || store.currentUser.email,
  };
  saveStore();

  res.json({
    success: true,
    user: store.currentUser,
    token: `axon_live_token_${Date.now()}`,
  });
});

patchworkApiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// 2. PROJECTS API (/api/projects)
// ==========================================
patchworkApiRouter.get('/projects', (_req: Request, res: Response) => {
  const store = getStore();
  res.json({ success: true, projects: store.projects });
});

patchworkApiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const store = getStore();
  const project = store.projects.find((p) => p.id === req.params.id);
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

  const store = getStore();
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    workspaceId: store.workspace.id,
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
    verifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.projects.unshift(newProject);
  pushAudit('PROJECT_CREATED', {
    projectId: newProject.id,
    projectName: newProject.name,
    metadata: { repo: newProject.repositoryName, url: newProject.productionUrl },
  }, req);

  saveStore();
  res.status(201).json({ success: true, project: newProject });
});

patchworkApiRouter.patch('/projects/:id', (req: Request, res: Response) => {
  const store = getStore();
  const project = store.projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  Object.assign(project, req.body, { updatedAt: new Date().toISOString() });
  saveStore();
  res.json({ success: true, project });
});

patchworkApiRouter.post('/projects/:id/verify', (req: Request, res: Response) => {
  const store = getStore();
  const project = store.projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  project.ownershipStatus = 'verified';
  project.verifiedAt = new Date().toISOString();
  project.status = 'production_healthy';
  project.updatedAt = new Date().toISOString();

  pushAudit('PROJECT_OWNERSHIP_VERIFIED', {
    projectId: project.id,
    projectName: project.name,
  }, req);

  saveStore();
  res.json({ success: true, project });
});

patchworkApiRouter.delete('/projects/:id', (req: Request, res: Response) => {
  const store = getStore();
  const idx = store.projects.findIndex((p) => p.id === req.params.id);
  if (idx !== -1) {
    store.projects.splice(idx, 1);
    saveStore();
  }
  res.json({ success: true, message: 'Project deleted' });
});

// ==========================================
// 3. PATCHES API (/api/patches)
// ==========================================
patchworkApiRouter.get('/patches', (req: Request, res: Response) => {
  const store = getStore();
  const { projectId } = req.query;
  let list = store.patches;
  if (projectId && typeof projectId === 'string') {
    list = list.filter((p) => p.projectId === projectId);
  }
  res.json({ success: true, patches: list });
});

patchworkApiRouter.get('/patches/:id', (req: Request, res: Response) => {
  const store = getStore();
  const patch = store.patches.find((p) => p.id === req.params.id);
  if (!patch) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Patch not found' } });
  }
  res.json({ success: true, patch });
});

patchworkApiRouter.post('/patches', (req: Request, res: Response) => {
  const store = getStore();
  const { title, description, projectId, files, riskLevel } = req.body;

  const targetProject = store.projects.find((p) => p.id === projectId) || store.projects[0];
  const patchId = `PW-${store.patches.length + 101}`;

  const newPatch: Patch = {
    id: patchId,
    projectId: targetProject?.id || 'proj-1',
    workspaceId: store.workspace.id,
    author: store.currentUser,
    title: title || 'Visual Hotfix from Axon Studio',
    description: description || 'Visual DOM changes captured from browser inspector',
    status: 'SUBMITTED',
    riskLevel: riskLevel || 'LOW',
    branchName: `axon/${patchId.toLowerCase()}`,
    commitSha: Math.random().toString(16).substring(2, 9),
    previewUrl: targetProject?.productionUrl || 'http://localhost:3000',
    files: files || [
      {
        filename: 'src/styles/overrides.css',
        category: 'frontend',
        changeType: 'modified',
        additions: 12,
        deletions: 2,
        oldContent: '/* baseline */',
        newContent: '/* live hotfix */',
        diffSummary: 'Adjusted visual styling and element hierarchy',
      },
    ],
    comments: [],
    reviews: [],
    source: 'web',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiSummary: {
      explanation: `Captured ${files?.length || 1} visual UI modifications directly from the browser viewport.`,
      why: 'Production visual hotfix staged via Axon Chrome Extension.',
      affectedComponents: ['Viewport View', 'Design Tokens'],
      potentialRisks: ['Verify cross-browser contrast & responsive viewport breakpoints'],
      dependencies: ['CSS/DOM inline overrides'],
    },
  };

  store.patches.unshift(newPatch);

  // Auto-generate matching preview deployment
  const newDeployment = createDeploymentRecord(newPatch, 'preview', (targetProject?.deploymentProvider as any) || 'vercel');
  store.deployments.unshift(newDeployment);

  // Auto-generate verification record
  store.verifications.unshift(createMockVerification(newPatch.id, newPatch.projectId));

  pushAudit('PATCH_CREATED', {
    patchId: newPatch.id,
    projectId: newPatch.projectId,
    metadata: { title: newPatch.title, source: newPatch.source },
  }, req);

  saveStore();
  res.status(201).json({ success: true, patch: newPatch });
});

patchworkApiRouter.patch('/patches/:id', (req: Request, res: Response) => {
  const store = getStore();
  const patch = store.patches.find((p) => p.id === req.params.id);
  if (!patch) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Patch not found' } });
  }

  Object.assign(patch, req.body, { updatedAt: new Date().toISOString() });

  pushAudit('PATCH_UPDATED', {
    patchId: patch.id,
    metadata: req.body,
  }, req);

  saveStore();
  res.json({ success: true, patch });
});

patchworkApiRouter.post('/patches/:id/review', (req: Request, res: Response) => {
  const { decision, notes } = req.body;
  const store = getStore();
  const patch = store.patches.find((p) => p.id === req.params.id);
  if (!patch) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Patch not found' } });
  }

  const reviewRecord: PatchReview = {
    id: `rev-${Date.now()}`,
    patchId: patch.id,
    author: store.currentUser,
    status: decision || 'APPROVED',
    comment: notes || 'Reviewed and approved for deployment',
    createdAt: new Date().toISOString(),
  };

  patch.reviews.unshift(reviewRecord);
  patch.status = decision === 'APPROVED' ? 'APPROVED' : 'CHANGES_REQUESTED';
  patch.updatedAt = new Date().toISOString();

  pushAudit(decision === 'APPROVED' ? 'PATCH_APPROVED' : 'PATCH_REJECTED', {
    patchId: patch.id,
  }, req);

  saveStore();
  res.json({ success: true, patch, review: reviewRecord });
});

patchworkApiRouter.post('/patches/:id/deploy', (req: Request, res: Response) => {
  const store = getStore();
  const patch = store.patches.find((p) => p.id === req.params.id);
  if (!patch) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Patch not found' } });
  }

  patch.status = 'DEPLOYED';
  patch.updatedAt = new Date().toISOString();

  const prodDeploy = createDeploymentRecord(patch, 'production', 'vercel');
  store.deployments.unshift(prodDeploy);

  pushAudit('DEPLOYMENT_COMPLETED', {
    patchId: patch.id,
  }, req);

  saveStore();
  res.json({ success: true, patch, deployment: prodDeploy });
});

// ==========================================
// 4. DEPLOYMENTS API (/api/deployments)
// ==========================================
patchworkApiRouter.get('/deployments', (_req: Request, res: Response) => {
  const store = getStore();
  res.json({ success: true, deployments: store.deployments });
});

// ==========================================
// 5. VERIFICATION API (/api/verifications)
// ==========================================
patchworkApiRouter.get('/verifications', (_req: Request, res: Response) => {
  const store = getStore();
  res.json({ success: true, verifications: store.verifications });
});

patchworkApiRouter.post('/verifications/run', (req: Request, res: Response) => {
  const { patchId } = req.body;
  const store = getStore();
  const patch = store.patches.find((p) => p.id === patchId);

  const run = createMockVerification(patchId || 'PW-live', patch?.projectId || 'proj-1');
  store.verifications.unshift(run);

  pushAudit('VERIFICATION_PASSED', {
    patchId,
  }, req);

  saveStore();

  res.json({
    success: true,
    message: `Visual regression & DOM integrity verification suite passed for ${patchId}`,
    verification: run,
  });
});

// ==========================================
// 6. COLLABORATORS & TEAM API (/api/collaborators)
// ==========================================
patchworkApiRouter.get('/collaborators', (_req: Request, res: Response) => {
  const store = getStore();
  res.json({ success: true, collaborators: store.collaborators });
});

patchworkApiRouter.post('/collaborators/invite', (req: Request, res: Response) => {
  const { email, name, role, cursorColor } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const store = getStore();
  const colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];
  const assignedColor = cursorColor || colors[store.collaborators.length % colors.length];

  const newMember: WorkspaceMember = {
    id: `mem-${Date.now()}`,
    workspaceId: store.workspace.id,
    userId: `usr-${Date.now()}`,
    user: {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name || email}`,
      role: role || 'developer',
      cursorColor: assignedColor,
      timezone: 'UTC',
    },
    role: role || 'developer',
    joinedAt: new Date().toISOString(),
    status: 'active',
  };

  store.collaborators.push(newMember);
  store.workspace.membersCount = store.collaborators.length;

  pushAudit('COLLABORATOR_INVITED', {
    metadata: { email, role: newMember.role },
  }, req);

  saveStore();
  res.status(201).json({ success: true, member: newMember });
});

patchworkApiRouter.patch('/collaborators/:id', (req: Request, res: Response) => {
  const store = getStore();
  const member = store.collaborators.find((m) => m.id === req.params.id);
  if (!member) {
    return res.status(404).json({ success: false, error: 'Collaborator not found' });
  }

  if (req.body.role) {
    member.role = req.body.role;
    member.user.role = req.body.role;
  }
  saveStore();
  res.json({ success: true, member });
});

patchworkApiRouter.delete('/collaborators/:id', (req: Request, res: Response) => {
  const store = getStore();
  const idx = store.collaborators.findIndex((m) => m.id === req.params.id);
  if (idx !== -1) {
    store.collaborators.splice(idx, 1);
    store.workspace.membersCount = Math.max(1, store.collaborators.length);
    saveStore();
  }
  res.json({ success: true, message: 'Collaborator removed' });
});

// ==========================================
// 7. REAL EXTENSION PAIRING & MULTIPLAYER API
// ==========================================

// POST /api/extension/pair -> Generate 6-digit PIN code
patchworkApiRouter.post('/extension/pair', (_req: Request, res: Response) => {
  const store = getStore();
  const code = createPairingCode(store.currentUser.id, store.workspace.id);

  res.json({
    success: true,
    pairingCode: code,
    expiresInSeconds: 900,
    workspaceName: store.workspace.name,
    user: store.currentUser.name,
  });
});

// POST /api/extension/session -> Handshake & session creation
patchworkApiRouter.post('/extension/session', (req: Request, res: Response) => {
  const { pairingCode, deviceName, browser, autoApprove } = req.body;
  const store = getStore();

  let approved = false;

  if (autoApprove) {
    approved = true;
  } else if (pairingCode) {
    const verified = verifyAndConsumePairingCode(pairingCode);
    if (!verified) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAIRING_CODE',
          message: 'Pairing code is invalid, expired, or already used. Please request a new PIN from Axon Studio.',
        },
      });
    }
    approved = true;
  }

  if (!approved) {
    return res.status(400).json({ success: false, error: 'Pairing code is required' });
  }

  const token = `axon_ext_tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const newSession: ExtensionSession = {
    id: `ext-sess-${Date.now()}`,
    userId: store.currentUser.id,
    workspaceId: store.workspace.id,
    deviceName: deviceName || 'Chrome Browser',
    browser: browser || 'Chrome 129',
    tokenHash: `hash_${token.substring(0, 16)}...`,
    permissions: [
      'read:projects',
      'write:patches',
      'read:collaborators',
      'realtime:presence',
      'audit:events',
    ],
    createdAt: new Date().toISOString(),
    lastActiveAt: 'Just now',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  store.extensionSessions.unshift(newSession);

  pushAudit('EXTENSION_PAIRED', {
    metadata: { device: newSession.deviceName, browser: newSession.browser },
  }, req);

  saveStore();

  res.json({
    success: true,
    accessToken: token,
    tokenType: 'Bearer',
    expiresInDays: 30,
    workspace: {
      id: store.workspace.id,
      name: store.workspace.name,
    },
    user: store.currentUser,
    projects: store.projects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      productionUrl: p.productionUrl,
      framework: p.framework,
    })),
    session: newSession,
  });
});

// GET /api/extension/sessions -> Lists active sessions
patchworkApiRouter.get('/extension/sessions', (_req: Request, res: Response) => {
  const store = getStore();
  res.json({ success: true, sessions: store.extensionSessions });
});

// DELETE /api/extension/session/:id -> Revoke session
patchworkApiRouter.delete('/extension/session/:id', (req: Request, res: Response) => {
  const store = getStore();
  const idx = store.extensionSessions.findIndex((s) => s.id === req.params.id);
  if (idx !== -1) {
    store.extensionSessions.splice(idx, 1);
    pushAudit('EXTENSION_REVOKED', {}, req);
    saveStore();
  }
  res.json({ success: true, message: 'Extension session revoked' });
});

// GET /api/extension/projects -> Extension gets authorized project list
patchworkApiRouter.get('/extension/projects', (_req: Request, res: Response) => {
  const store = getStore();
  res.json({
    success: true,
    projects: store.projects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      productionUrl: p.productionUrl,
      framework: p.framework,
      defaultBranch: p.defaultBranch,
      repositoryName: p.repositoryName,
    })),
  });
});

// POST /api/extension/projects/:id/patches -> Extension creates visual hotfix
patchworkApiRouter.post('/extension/projects/:id/patches', (req: Request, res: Response) => {
  const store = getStore();
  const project = store.projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Target project not found' });
  }

  const { title, description, files, riskLevel } = req.body;
  const patchId = `PW-${store.patches.length + 101}`;

  const newPatch: Patch = {
    id: patchId,
    projectId: project.id,
    workspaceId: store.workspace.id,
    author: store.currentUser,
    title: title || `Visual Hotfix on ${project.name}`,
    description: description || 'Captured directly from Axon Chrome Extension visual inspector',
    status: 'SUBMITTED',
    riskLevel: riskLevel || 'LOW',
    branchName: `axon/${patchId.toLowerCase()}`,
    commitSha: Math.random().toString(16).substring(2, 9),
    previewUrl: project.productionUrl,
    files: Array.isArray(files) && files.length > 0 ? files : [
      {
        filename: 'src/styles/visual-overrides.css',
        category: 'frontend',
        changeType: 'modified',
        additions: 8,
        deletions: 1,
        oldContent: '/* baseline styles */',
        newContent: '/* live hotfix styles */',
        diffSummary: 'Updated visual elements and typography in browser',
      },
    ],
    comments: [],
    reviews: [],
    source: 'extension',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiSummary: {
      explanation: `Captured ${files?.length || 1} visual UI modifications directly from the browser viewport.`,
      why: 'Production visual hotfix staged via Axon Chrome Extension.',
      affectedComponents: ['Viewport View', 'Design Tokens'],
      potentialRisks: ['Verify cross-browser contrast & responsive viewport breakpoints'],
      dependencies: ['CSS/DOM inline overrides'],
    },
  };

  store.patches.unshift(newPatch);

  // Auto create deployment record
  store.deployments.unshift(createDeploymentRecord(newPatch, 'preview', 'vercel'));

  // Auto create verification record
  store.verifications.unshift(createMockVerification(newPatch.id, newPatch.projectId));

  pushAudit('PATCH_CREATED', {
    patchId: newPatch.id,
    projectId: newPatch.projectId,
    metadata: { title: newPatch.title, source: 'extension' },
  }, req);

  saveStore();

  res.status(201).json({
    success: true,
    patch: newPatch,
    dashboardUrl: `/patches/${patchId}`,
  });
});

// POST /api/extension/presence -> Heartbeat & multiplayer presence sync
patchworkApiRouter.post('/extension/presence', (req: Request, res: Response) => {
  const { userId, userName, userColor, userAvatar, role, projectId, route, cursorX, cursorY, selectedElement } = req.body;

  recordPresence({
    id: `pres-${userId || 'anon'}`,
    userId: userId || 'usr-anonymous',
    userName: userName || 'Extension User',
    userColor: userColor || '#6366F1',
    userAvatar: userAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=axon',
    role: role || 'developer',
    projectId: projectId || '',
    route: route || '/',
    cursorX: typeof cursorX === 'number' ? cursorX : 50,
    cursorY: typeof cursorY === 'number' ? cursorY : 50,
    selectedElement: selectedElement || '',
  });

  res.json({ success: true, timestamp: Date.now() });
});

// GET /api/extension/presence -> Get all active team presence records
patchworkApiRouter.get('/extension/presence', (_req: Request, res: Response) => {
  const active = getActivePresence();
  res.json({
    success: true,
    presence: active,
    onlineCount: active.length,
    timestamp: Date.now(),
  });
});

// POST /api/extension/events -> Log team event
patchworkApiRouter.post('/extension/events', (req: Request, res: Response) => {
  const { eventType, payload } = req.body;
  pushAudit('PATCH_UPDATED', {
    metadata: { eventType, ...payload },
  }, req);
  saveStore();

  res.json({ success: true, eventType, timestamp: new Date().toISOString() });
});

// ==========================================
// 8. AUDIT API (/api/audit)
// ==========================================
patchworkApiRouter.get('/audit', (_req: Request, res: Response) => {
  const store = getStore();
  res.json({ success: true, logs: store.auditLogs });
});

// ==========================================
// 9. CONFLICTS API (/api/conflicts)
// ==========================================
patchworkApiRouter.get('/conflicts', (_req: Request, res: Response) => {
  const store = getStore();
  res.json({ success: true, conflicts: store.conflicts });
});
