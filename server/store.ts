import fs from 'fs';
import path from 'path';
import type {
  Workspace,
  WorkspaceMember,
  Project,
  Patch,
  Deployment,
  VerificationRun,
  AuditLog,
  ExtensionSession,
  IntegrationsConfig,
  ConflictItem,
  User,
  VersionItem,
} from '../shared/patchwork-types';

export interface PresenceRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userColor: string;
  userAvatar?: string;
  role?: string;
  projectId: string;
  route: string;
  cursorX: number;
  cursorY: number;
  selectedElement: string;
  activeTool?: string;
  lastActiveAt: number;
}

export interface PairingCodeRecord {
  code: string;
  expiresAt: number;
  userId: string;
  workspaceId: string;
}

export interface AxonStoreData {
  workspace: Workspace;
  currentUser: User;
  projects: Project[];
  patches: Patch[];
  collaborators: WorkspaceMember[];
  extensionSessions: ExtensionSession[];
  deployments: Deployment[];
  verifications: VerificationRun[];
  auditLogs: AuditLog[];
  conflicts: ConflictItem[];
  integrations: IntegrationsConfig;
  versions: VersionItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const STORE_FILE = path.join(DATA_DIR, 'axon-store.json');

const DEFAULT_USER: User = {
  id: 'usr-owner-1',
  name: 'Shreyas (Team Lead)',
  email: 'shreyas@axon.dev',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'owner',
  cursorColor: '#6366F1',
  timezone: 'UTC',
  githubUsername: 'shreyas-axon',
};

const DEFAULT_WORKSPACE: Workspace = {
  id: 'ws-prod-1',
  name: 'Axon Production Workspace',
  slug: 'axon-prod',
  ownerId: 'usr-owner-1',
  plan: 'Enterprise',
  membersCount: 1,
  createdAt: new Date().toISOString(),
  setupCompleted: false,
};

const DEFAULT_VERSIONS: VersionItem[] = [
  {
    version: 'v1.0.0',
    commitSha: 'a1b2c3d',
    title: 'Initial Production Base Release',
    author: DEFAULT_USER,
    deployedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    deploymentId: 'DEP-100',
    rollbackPossible: false,
  },
];

const DEFAULT_STORE: AxonStoreData = {
  workspace: DEFAULT_WORKSPACE,
  currentUser: DEFAULT_USER,
  projects: [],
  patches: [],
  collaborators: [
    {
      id: 'mem-1',
      workspaceId: 'ws-prod-1',
      userId: 'usr-owner-1',
      user: DEFAULT_USER,
      role: 'owner',
      joinedAt: new Date().toISOString(),
      status: 'active',
    },
  ],
  extensionSessions: [],
  deployments: [],
  verifications: [],
  auditLogs: [
    {
      id: 'aud-init',
      action: 'WORKSPACE_UPDATED',
      user: DEFAULT_USER,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      userAgent: 'Axon Server Boot',
      result: 'success',
      metadata: { note: 'Production Axon workspace initialized' },
    },
  ],
  conflicts: [],
  versions: DEFAULT_VERSIONS,
  integrations: {
    github: {
      connected: true,
      org: 'axon-team',
      accountType: 'organization',
      appInstalled: true,
      repositories: ['axon-core', 'axon-studio'],
      permissions: ['repo', 'workflow'],
      lastSync: new Date().toISOString(),
    },
    vercel: {
      connected: true,
      team: 'axon-prod',
      projects: ['axon-app'],
      domains: ['axon.dev'],
      lastSync: new Date().toISOString(),
    },
    netlify: {
      connected: false,
      team: '',
      sites: [],
      lastSync: new Date().toISOString(),
    },
    supabase: {
      connected: false,
      projectUrl: '',
      anonKeyConfigured: false,
      serviceRoleConfigured: false,
      realtimeEnabled: false,
      lastSync: new Date().toISOString(),
    },
    ai: {
      provider: 'gemini',
      model: 'gemini-1.5-pro',
      temperature: 0.2,
      allowFrontendModifications: true,
      allowBackendModifications: false,
      requireApprovalForBackend: true,
      requireApprovalForHighRisk: true,
    },
  },
};

// In-memory runtime state
let storeData: AxonStoreData = { ...DEFAULT_STORE };
const livePresence: Map<string, PresenceRecord> = new Map();
const pairingCodes: Map<string, PairingCodeRecord> = new Map();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (err) {
      console.warn('[AxonStore] Could not create data dir:', err);
    }
  }
}

export function loadStore(): AxonStoreData {
  try {
    ensureDataDir();
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      storeData = {
        ...DEFAULT_STORE,
        ...parsed,
        workspace: { ...DEFAULT_STORE.workspace, ...(parsed.workspace || {}) },
        integrations: {
          ...DEFAULT_STORE.integrations,
          ...(parsed.integrations || {}),
          github: { ...DEFAULT_STORE.integrations.github, ...(parsed.integrations?.github || {}) },
          vercel: { ...DEFAULT_STORE.integrations.vercel, ...(parsed.integrations?.vercel || {}) },
          netlify: { ...DEFAULT_STORE.integrations.netlify, ...(parsed.integrations?.netlify || {}) },
          supabase: { ...DEFAULT_STORE.integrations.supabase, ...(parsed.integrations?.supabase || {}) },
          ai: { ...DEFAULT_STORE.integrations.ai, ...(parsed.integrations?.ai || {}) },
        },
        versions: Array.isArray(parsed.versions) && parsed.versions.length > 0 ? parsed.versions : DEFAULT_VERSIONS,
      };
      return storeData;
    }
  } catch (err) {
    console.warn('[AxonStore] Could not load persisted store:', err);
  }
  storeData = { ...DEFAULT_STORE };
  saveStore();
  return storeData;
}

export function saveStore(): void {
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(storeData, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[AxonStore] Could not persist store to disk:', err);
  }
}

export function getStore(): AxonStoreData {
  return storeData;
}

export function resetStore(seedStarter = false): AxonStoreData {
  if (!seedStarter) {
    storeData = {
      ...DEFAULT_STORE,
      projects: [],
      patches: [],
      extensionSessions: [],
      deployments: [],
      verifications: [],
      conflicts: [],
      versions: Array.isArray(storeData.versions) && storeData.versions.length > 0 ? storeData.versions : DEFAULT_VERSIONS,
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          action: 'WORKSPACE_UPDATED',
          user: DEFAULT_USER,
          timestamp: new Date().toISOString(),
          ip: '127.0.0.1',
          userAgent: 'Axon Server Reset',
          result: 'success',
          metadata: { note: 'Workspace reset to clean production state' },
        },
      ],
    };
  } else {
    // Seed a single production starter project for immediate testing if requested
    const starterProjectId = `proj-${Date.now()}`;
    const starterProject: Project = {
      id: starterProjectId,
      workspaceId: DEFAULT_WORKSPACE.id,
      name: 'Axon Production App',
      slug: 'axon-production-app',
      productionUrl: 'http://localhost:3000',
      framework: 'React (Vite)',
      repositoryId: `repo-${Date.now()}`,
      repositoryName: 'axon-org/production-app',
      repositoryUrl: 'https://github.com/axon-org/production-app',
      deploymentProvider: 'vercel',
      deploymentProjectId: `prj_axon_${Date.now()}`,
      defaultBranch: 'main',
      status: 'production_healthy',
      ownershipStatus: 'verified',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storeData = {
      ...DEFAULT_STORE,
      projects: [starterProject],
      patches: [],
      extensionSessions: [],
      deployments: [],
      verifications: [],
      conflicts: [],
    };
  }

  saveStore();
  return storeData;
}

// Presence Helpers
export function recordPresence(record: Omit<PresenceRecord, 'lastActiveAt'>): PresenceRecord {
  const fullRecord: PresenceRecord = {
    ...record,
    lastActiveAt: Date.now(),
  };
  livePresence.set(record.id, fullRecord);
  return fullRecord;
}

export function getActivePresence(projectId?: string, route?: string): PresenceRecord[] {
  const cutoff = Date.now() - 35000; // 35 seconds TTL
  const active: PresenceRecord[] = [];

  for (const [id, item] of livePresence.entries()) {
    if (item.lastActiveAt < cutoff) {
      livePresence.delete(id);
    } else {
      if (projectId && item.projectId !== projectId) continue;
      if (route && item.route !== route) continue;
      active.push(item);
    }
  }

  return active;
}

// Pairing Code Helpers
export function createPairingCode(userId: string, workspaceId: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  pairingCodes.set(code, {
    code,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
    userId,
    workspaceId,
  });
  return code;
}

export function verifyAndConsumePairingCode(code: string): PairingCodeRecord | null {
  const record = pairingCodes.get(code);
  if (!record) return null;
  if (record.expiresAt < Date.now()) {
    pairingCodes.delete(code);
    return null;
  }
  // Keep code active or consume
  return record;
}

// Initialize on boot
loadStore();
