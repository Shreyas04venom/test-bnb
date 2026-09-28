import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Workspace,
  WorkspaceMember,
  Project,
  Patch,
  Deployment,
  VerificationRun,
  VisualSnapshot,
  VersionItem,
  ConflictItem,
  RealtimePresence,
  AuditLog,
  ExtensionSession,
  IntegrationsConfig,
  NotificationItem,
  PatchStatus,
  RiskLevel
} from '../../../shared/patchwork-types';

// Initial Seed Users
export const SEED_CURRENT_USER: User = {
  id: 'usr-1',
  name: 'Shreyas',
  email: 'shreyas@patchwork.dev',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'owner',
  cursorColor: '#6366F1',
  timezone: 'America/San_Francisco (PST)',
  githubUsername: 'shreyas-pw',
};

export const SEED_MEMBERS: WorkspaceMember[] = [
  {
    id: 'mem-1',
    workspaceId: 'ws-1',
    userId: 'usr-1',
    user: SEED_CURRENT_USER,
    role: 'owner',
    joinedAt: '2026-01-10T10:00:00Z',
    status: 'active',
  },
  {
    id: 'mem-2',
    workspaceId: 'ws-1',
    userId: 'usr-2',
    user: {
      id: 'usr-2',
      name: 'Arnav',
      email: 'arnav@patchwork.dev',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      cursorColor: '#EC4899',
      timezone: 'America/New_York (EST)',
      githubUsername: 'arnav-dev',
    },
    role: 'admin',
    joinedAt: '2026-01-15T14:30:00Z',
    status: 'active',
  },
  {
    id: 'mem-3',
    workspaceId: 'ws-1',
    userId: 'usr-3',
    user: {
      id: 'usr-3',
      name: 'Akshat',
      email: 'akshat@patchwork.dev',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'developer',
      cursorColor: '#10B981',
      timezone: 'Asia/Kolkata (IST)',
      githubUsername: 'akshat-core',
    },
    role: 'developer',
    joinedAt: '2026-02-01T09:15:00Z',
    status: 'active',
  },
];

export const SEED_WORKSPACE: Workspace = {
  id: 'ws-1',
  name: 'AgniDev',
  slug: 'agnidev',
  ownerId: 'usr-1',
  plan: 'Pro',
  membersCount: 3,
  createdAt: '2026-01-01T00:00:00Z',
};

export const SEED_PROJECTS: Project[] = [
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

export const SEED_PATCHES: Patch[] = [
  {
    id: 'PW-104',
    projectId: 'proj-1',
    workspaceId: 'ws-1',
    author: SEED_CURRENT_USER,
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
        oldContent: `export function Hero() {
  return (
    <div className="pt-24 pb-16 text-center">
      <span className="text-xs uppercase tracking-wider text-slate-500">New Release</span>
      <h1 className="text-5xl font-serif text-[#1B133C] mt-4">Hotfix the Internet</h1>
      <button className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-md">
        Get Started
      </button>
    </div>
  );
}`,
        newContent: `export function Hero() {
  return (
    <div className="pt-28 pb-20 text-center relative">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/60 bg-white/70 backdrop-blur-md shadow-xs text-xs font-medium text-[#1B133C]">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Git-native visual patching v2.4
      </div>
      <h1 className="text-6xl font-serif text-[#1B133C] mt-5 tracking-tight">Hotfix the Internet</h1>
      <button className="mt-8 px-8 py-3.5 bg-[#1B133C] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
        Start Patching Free
      </button>
    </div>
  );
}`,
      },
      {
        filename: 'src/components/Navbar.tsx',
        category: 'frontend',
        changeType: 'modified',
        additions: 6,
        deletions: 2,
        diffSummary: 'Updated pill navigation shadow and blur',
        oldContent: `<nav className="flex items-center gap-6 bg-white px-4 py-2">
  <Logo />
</nav>`,
        newContent: `<nav className="flex items-center gap-6 rounded-xl border border-white/60 bg-white/75 px-5 py-2.5 shadow-sm backdrop-blur-md">
  <Logo />
</nav>`,
      },
    ],
    comments: [
      {
        id: 'c-1',
        patchId: 'PW-104',
        author: SEED_MEMBERS[1].user,
        file: 'src/components/Hero.tsx',
        line: 8,
        content: 'CTA button elevation looks really crisp! Tested on mobile viewport as well.',
        createdAt: '2026-09-28T11:15:00Z',
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        patchId: 'PW-104',
        author: SEED_MEMBERS[1].user,
        status: 'APPROVED',
        comment: 'Verified visual hierarchy and responsiveness. Clean diff.',
        createdAt: '2026-09-28T11:30:00Z',
      },
    ],
    aiSummary: {
      explanation: 'Replaces plain buttons with high-contrast pill styling and adds a live status beacon.',
      why: 'Improves CTA conversion and matches modern editorial aesthetic requested in design review.',
      affectedComponents: ['Hero', 'Navbar', 'CallToActionSection'],
      potentialRisks: ['Check dark mode text contrast on ultra-wide screens'],
      dependencies: ['Tailwind CSS v4 inline glass tokens'],
    },
  },
  {
    id: 'PW-103',
    projectId: 'proj-1',
    workspaceId: 'ws-1',
    author: SEED_MEMBERS[1].user,
    title: 'Navbar alignment & mobile drawer fix',
    description: 'Fixed z-index layering when drawer is opened on iOS Safari and aligned pill nav horizontally.',
    status: 'APPROVED',
    riskLevel: 'LOW',
    branchName: 'patchwork/PW-103-nav-fix',
    commitSha: 'f4b1e90',
    previewUrl: 'https://shopwave-git-patchwork-pw-103.vercel.app',
    source: 'web',
    createdAt: '2026-09-27T14:10:00Z',
    updatedAt: '2026-09-27T18:00:00Z',
    files: [
      {
        filename: 'src/components/Navbar.tsx',
        category: 'frontend',
        changeType: 'modified',
        additions: 8,
        deletions: 3,
        diffSummary: 'Adjusted z-index and flex alignments',
        oldContent: `<header className="z-20">...</header>`,
        newContent: `<header className="z-50 backdrop-blur-md">...</header>`,
      },
    ],
    comments: [],
    reviews: [
      {
        id: 'rev-2',
        patchId: 'PW-103',
        author: SEED_CURRENT_USER,
        status: 'APPROVED',
        comment: 'LGTM. Mobile menu glitch is resolved.',
        createdAt: '2026-09-27T17:45:00Z',
      },
    ],
    aiSummary: {
      explanation: 'Increases z-index on the mobile sheet overlay to prevent video element overlap.',
      why: 'Users reported video hero covering hamburger menu on mobile Safari.',
      affectedComponents: ['Navbar', 'MobileSheet'],
      potentialRisks: ['None identified.'],
      dependencies: [],
    },
  },
  {
    id: 'PW-102',
    projectId: 'proj-1',
    workspaceId: 'ws-1',
    author: SEED_MEMBERS[2].user,
    title: 'Pricing card hotfix & annual billing toggle',
    description: 'Added 20% discount badge when toggling annual pricing in pricing grid.',
    status: 'DEPLOYED',
    riskLevel: 'MEDIUM',
    branchName: 'patchwork/PW-102-pricing',
    commitSha: 'c2d3e41',
    previewUrl: 'https://shopwave-git-patchwork-pw-102.vercel.app',
    productionDeploymentId: 'DEP-88',
    source: 'extension',
    createdAt: '2026-09-26T10:00:00Z',
    updatedAt: '2026-09-26T15:20:00Z',
    files: [
      {
        filename: 'src/components/Pricing.tsx',
        category: 'frontend',
        changeType: 'modified',
        additions: 15,
        deletions: 5,
        diffSummary: 'Added state toggle for annual pricing and discount chips',
        oldContent: `<span>$29/mo</span>`,
        newContent: `<span>{isAnnual ? '$24/mo' : '$29/mo'}</span>`,
      },
    ],
    comments: [],
    reviews: [
      {
        id: 'rev-3',
        patchId: 'PW-102',
        author: SEED_MEMBERS[1].user,
        status: 'APPROVED',
        comment: 'Verified with stripe pricing model.',
        createdAt: '2026-09-26T12:00:00Z',
      },
    ],
    aiSummary: {
      explanation: 'Introduces reactive billing period toggle with animated percentage tag.',
      why: 'Marketing required immediate release of Q3 annual campaign.',
      affectedComponents: ['PricingCard', 'PricingToggle'],
      potentialRisks: ['Verify stripe checkout link parameter matching'],
      dependencies: [],
    },
  },
  {
    id: 'PW-101',
    projectId: 'proj-2',
    workspaceId: 'ws-1',
    author: SEED_CURRENT_USER,
    title: 'Mobile menu backdrop blur fix',
    description: 'Updated backdrop-filter rules for compatibility with Android Chrome 122+.',
    status: 'DEPLOYED',
    riskLevel: 'LOW',
    branchName: 'patchwork/PW-101-backdrop-fix',
    commitSha: '8d7a12b',
    previewUrl: 'https://curacommerce-git-patchwork-pw-101.netlify.app',
    productionDeploymentId: 'DEP-87',
    source: 'extension',
    createdAt: '2026-09-25T08:00:00Z',
    updatedAt: '2026-09-25T11:30:00Z',
    files: [
      {
        filename: 'src/styles/glass.css',
        category: 'frontend',
        changeType: 'modified',
        additions: 4,
        deletions: 1,
        diffSummary: 'Added -webkit-backdrop-filter fallback',
        oldContent: `.glass { backdrop-filter: blur(12px); }`,
        newContent: `.glass { -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }`,
      },
    ],
    comments: [],
    reviews: [],
  },
  {
    id: 'PW-105',
    projectId: 'proj-1',
    workspaceId: 'ws-1',
    author: SEED_MEMBERS[2].user,
    title: 'Checkout promo banner font sizing & border',
    description: 'Refined promotional coupon banner font weight and subtle outer glow.',
    status: 'IN_REVIEW',
    riskLevel: 'LOW',
    branchName: 'patchwork/PW-105-promo-banner',
    commitSha: 'b9e4a31',
    previewUrl: 'https://shopwave-git-patchwork-pw-105.vercel.app',
    source: 'extension',
    createdAt: '2026-09-28T12:10:00Z',
    updatedAt: '2026-09-28T12:10:00Z',
    files: [
      {
        filename: 'src/components/PromoBanner.tsx',
        category: 'frontend',
        changeType: 'modified',
        additions: 5,
        deletions: 2,
        diffSummary: 'Tightened font size and padding',
        oldContent: `<div className="p-4 bg-yellow-100">Sale</div>`,
        newContent: `<div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-900 rounded-lg">Flash Sale: 20% Off</div>`,
      },
    ],
    comments: [],
    reviews: [],
  },
  {
    id: 'PW-106',
    projectId: 'proj-1',
    workspaceId: 'ws-1',
    author: SEED_MEMBERS[1].user,
    title: 'Nav z-index overlay conflict',
    description: 'Experimenting with header blur overlay vs modal z-index.',
    status: 'CHANGES_REQUESTED',
    riskLevel: 'MEDIUM',
    branchName: 'patchwork/PW-106-zindex',
    commitSha: 'e3f1c99',
    previewUrl: 'https://shopwave-git-patchwork-pw-106.vercel.app',
    source: 'web',
    createdAt: '2026-09-28T13:00:00Z',
    updatedAt: '2026-09-28T13:40:00Z',
    files: [
      {
        filename: 'src/components/Header.tsx',
        category: 'frontend',
        changeType: 'modified',
        additions: 3,
        deletions: 1,
        diffSummary: 'Changed modal container overlay index',
        oldContent: `<div className="z-10">Modal</div>`,
        newContent: `<div className="z-[9999]">Modal</div>`,
      },
    ],
    comments: [
      {
        id: 'c-2',
        patchId: 'PW-106',
        author: SEED_CURRENT_USER,
        content: 'Arbitrary z-9999 breaks tooltips. Let us use standard token z-modal instead.',
        createdAt: '2026-09-28T13:30:00Z',
      },
    ],
    reviews: [
      {
        id: 'rev-4',
        patchId: 'PW-106',
        author: SEED_CURRENT_USER,
        status: 'CHANGES_REQUESTED',
        comment: 'Please adhere to design system z-index scale.',
        createdAt: '2026-09-28T13:40:00Z',
      },
    ],
  },
];

export const SEED_DEPLOYMENTS: Deployment[] = [
  {
    id: 'DEP-89',
    projectId: 'proj-1',
    patchId: 'PW-104',
    environment: 'preview',
    provider: 'vercel',
    commitSha: 'a8f9c12',
    branch: 'patchwork/PW-104-hero-cta',
    author: SEED_CURRENT_USER,
    status: 'READY',
    previewUrl: 'https://shopwave-git-patchwork-pw-104.vercel.app',
    durationSeconds: 38,
    createdAt: '2026-09-28T09:32:00Z',
    logs: [
      '[09:32:01] Cloning repository company/shopwave-web (branch: patchwork/PW-104-hero-cta)...',
      '[09:32:05] Installing dependencies with pnpm v10.18...',
      '[09:32:18] Running Next.js build: next build...',
      '[09:32:32] Generating static pages (14/14) ✓',
      '[09:32:37] Edge functions bundled successfully.',
      '[09:32:39] Deployment URL ready: https://shopwave-git-patchwork-pw-104.vercel.app',
    ],
  },
  {
    id: 'DEP-88',
    projectId: 'proj-1',
    patchId: 'PW-102',
    environment: 'production',
    provider: 'vercel',
    commitSha: 'c2d3e41',
    branch: 'main',
    author: SEED_MEMBERS[2].user,
    status: 'READY',
    previewUrl: 'https://shopwave.dev',
    durationSeconds: 54,
    createdAt: '2026-09-26T15:20:00Z',
    logs: [
      '[15:20:00] Production deployment initiated by Akshat (verified approval by Arnav)',
      '[15:20:15] Build completed in 32s',
      '[15:20:54] Production alias updated to shopwave.dev',
    ],
  },
  {
    id: 'DEP-87',
    projectId: 'proj-2',
    patchId: 'PW-101',
    environment: 'production',
    provider: 'netlify',
    commitSha: '8d7a12b',
    branch: 'production',
    author: SEED_CURRENT_USER,
    status: 'READY',
    previewUrl: 'https://curacommerce.io',
    durationSeconds: 45,
    createdAt: '2026-09-25T11:30:00Z',
    logs: [
      '[11:30:02] Netlify build started...',
      '[11:30:45] Site live on https://curacommerce.io',
    ],
  },
];

export const SEED_VERIFICATION_RUN: VerificationRun = {
  id: 'ver-104',
  patchId: 'PW-104',
  projectId: 'proj-1',
  status: 'passed',
  totalChecks: 12,
  passedChecks: 12,
  visualSimilarityPercent: 98.7,
  potentialRegression: 'low',
  startedAt: '2026-09-28T09:34:00Z',
  completedAt: '2026-09-28T09:34:42Z',
  checks: [
    { id: 'vc-1', stepNumber: 1, name: 'Build', description: 'Next.js production bundle compilation', status: 'passed', durationMs: 1420 },
    { id: 'vc-2', stepNumber: 2, name: 'Typecheck', description: 'TypeScript strict mode assertion', status: 'passed', durationMs: 890 },
    { id: 'vc-3', stepNumber: 3, name: 'Lint', description: 'ESLint & Tailwind token validation', status: 'passed', durationMs: 420 },
    { id: 'vc-4', stepNumber: 4, name: 'Application Starts', description: 'HTTP healthcheck returns 200 OK', status: 'passed', durationMs: 650 },
    { id: 'vc-5', stepNumber: 5, name: 'Page Loads', description: 'DOM ready and hydration completes without hydration errors', status: 'passed', durationMs: 780 },
    { id: 'vc-6', stepNumber: 6, name: 'Target Element Exists', description: 'Query selector [data-pw-hero-cta] successfully resolved', status: 'passed', durationMs: 210 },
    { id: 'vc-7', stepNumber: 7, name: 'Browser Interaction Tests', description: 'Simulated click and hover event triggers', status: 'passed', durationMs: 1120 },
    { id: 'vc-8', stepNumber: 8, name: 'Link Checks', description: 'All href anchors verified reachable', status: 'passed', durationMs: 940 },
    { id: 'vc-9', stepNumber: 9, name: 'Responsive Tests', description: 'Viewport matrix: Mobile (390px), Tablet (820px), Desktop (1440px)', status: 'passed', durationMs: 2300 },
    { id: 'vc-10', stepNumber: 10, name: 'Screenshot Comparison', description: 'Pixel-level perceptual diff against production baseline (98.7% match)', status: 'passed', durationMs: 1850 },
    { id: 'vc-11', stepNumber: 11, name: 'Console Error Detection', description: 'Zero unhandled exceptions or console.error emissions', status: 'passed', durationMs: 310 },
    { id: 'vc-12', stepNumber: 12, name: 'AI Visual QA', description: 'Vision model semantic regression analysis: no clipping, clean contrast', status: 'passed', durationMs: 1540 },
  ],
};

export const SEED_VISUAL_SNAPSHOT: VisualSnapshot = {
  patchId: 'PW-104',
  beforeScreenshotUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  afterScreenshotUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  diffHighlightUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
  similarityScore: 98.7,
  aiExplanation: 'The hero primary action button has shifted 8px vertically with enhanced padding and a subtle pill status badge. No text truncation or layout collisions detected across viewports.',
};

export const SEED_VERSIONS: VersionItem[] = [
  {
    version: 'v1.4',
    commitSha: 'a8f9c12',
    patchId: 'PW-104',
    title: 'Hero CTA & glassmorphism badge update',
    author: SEED_CURRENT_USER,
    deployedAt: '2026-09-28T09:35:00Z',
    status: 'active',
    deploymentId: 'DEP-89',
    rollbackPossible: true,
  },
  {
    version: 'v1.3',
    commitSha: 'f4b1e90',
    patchId: 'PW-103',
    title: 'Navbar alignment & mobile drawer fix',
    author: SEED_MEMBERS[1].user,
    deployedAt: '2026-09-27T18:00:00Z',
    status: 'superseded',
    deploymentId: 'DEP-88',
    rollbackPossible: true,
  },
  {
    version: 'v1.2',
    commitSha: 'c2d3e41',
    patchId: 'PW-102',
    title: 'Pricing card hotfix & annual billing toggle',
    author: SEED_MEMBERS[2].user,
    deployedAt: '2026-09-26T15:20:00Z',
    status: 'superseded',
    deploymentId: 'DEP-88',
    rollbackPossible: true,
  },
  {
    version: 'v1.1',
    commitSha: '8d7a12b',
    patchId: 'PW-101',
    title: 'Mobile menu backdrop blur fix',
    author: SEED_CURRENT_USER,
    deployedAt: '2026-09-25T11:30:00Z',
    status: 'superseded',
    deploymentId: 'DEP-87',
    rollbackPossible: true,
  },
  {
    version: 'v1.0',
    commitSha: '1e4a90b',
    title: 'Initial Production Release',
    author: SEED_CURRENT_USER,
    deployedAt: '2026-09-20T10:00:00Z',
    status: 'superseded',
    deploymentId: 'DEP-80',
    rollbackPossible: false,
  },
];

export const SEED_CONFLICTS: ConflictItem[] = [
  {
    id: 'cnf-1',
    patchAId: 'PW-104',
    patchBId: 'PW-107',
    file: 'src/components/Hero.tsx',
    line: 82,
    description: 'Both patches modify the same component button styling and padding properties.',
    snippetA: `<button className="mt-8 px-8 py-3.5 bg-[#1B133C] text-white font-medium rounded-xl shadow-md">
  Start Patching Free
</button>`,
    snippetB: `<button className="mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm">
  Claim 14-Day Trial
</button>`,
    aiResolutionProposal: `<button className="mt-8 px-8 py-3.5 bg-[#1B133C] text-white font-medium rounded-xl shadow-md hover:bg-slate-900 transition-all">
  Start Patching Free (14-Day Trial)
</button>`,
    resolutionStatus: 'unresolved',
  },
];

export const SEED_PRESENCE: RealtimePresence[] = [
  {
    userId: 'usr-1',
    name: 'Shreyas',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    cursorColor: '#6366F1',
    currentProject: 'ShopWave',
    currentRoute: '/pricing',
    currentActivity: 'Editing Hero button CTA',
    cursorX: 420,
    cursorY: 280,
    selectedElement: 'button.hero-cta',
    lastSeenAt: 'Just now',
    status: 'online',
  },
  {
    userId: 'usr-2',
    name: 'Arnav',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    cursorColor: '#EC4899',
    currentProject: 'ShopWave',
    currentRoute: '/home',
    currentActivity: 'Viewing live preview',
    cursorX: 780,
    cursorY: 190,
    selectedElement: 'header.navbar',
    lastSeenAt: '1m ago',
    status: 'online',
  },
  {
    userId: 'usr-3',
    name: 'Akshat',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    cursorColor: '#10B981',
    currentProject: 'CuraCommerce',
    currentRoute: '/patches/PW-104',
    currentActivity: 'Reviewing verification suite',
    cursorX: 310,
    cursorY: 450,
    selectedElement: 'div.verification-panel',
    lastSeenAt: '3m ago',
    status: 'online',
  },
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-10',
    timestamp: '2026-09-28T14:45:12Z',
    user: SEED_CURRENT_USER,
    action: 'PATCH_UPDATED',
    projectId: 'proj-1',
    projectName: 'ShopWave',
    patchId: 'PW-104',
    ip: '198.51.100.4',
    userAgent: 'Chrome 129 / macOS',
    result: 'success',
    metadata: { diffAddedLines: 12, diffRemovedLines: 4 },
  },
  {
    id: 'aud-9',
    timestamp: '2026-09-28T11:30:00Z',
    user: SEED_MEMBERS[1].user,
    action: 'PATCH_APPROVED',
    projectId: 'proj-1',
    projectName: 'ShopWave',
    patchId: 'PW-104',
    ip: '198.51.100.12',
    userAgent: 'Chrome 129 / Windows',
    result: 'success',
    metadata: { reviewer: 'Arnav', status: 'APPROVED' },
  },
  {
    id: 'aud-8',
    timestamp: '2026-09-28T09:34:42Z',
    user: SEED_CURRENT_USER,
    action: 'VERIFICATION_PASSED',
    projectId: 'proj-1',
    projectName: 'ShopWave',
    patchId: 'PW-104',
    ip: '10.0.1.20',
    userAgent: 'PATCHWORK-Verification-Runner/2.4',
    result: 'success',
    metadata: { passedChecks: 12, visualSimilarity: 98.7 },
  },
  {
    id: 'aud-7',
    timestamp: '2026-09-28T09:32:00Z',
    user: SEED_CURRENT_USER,
    action: 'DEPLOYMENT_STARTED',
    projectId: 'proj-1',
    projectName: 'ShopWave',
    patchId: 'PW-104',
    ip: '198.51.100.4',
    userAgent: 'Chrome 129 / macOS',
    result: 'success',
    metadata: { deploymentId: 'DEP-89', env: 'preview' },
  },
  {
    id: 'aud-6',
    timestamp: '2026-09-28T09:30:15Z',
    user: SEED_CURRENT_USER,
    action: 'PATCH_CREATED',
    projectId: 'proj-1',
    projectName: 'ShopWave',
    patchId: 'PW-104',
    ip: '198.51.100.4',
    userAgent: 'PATCHWORK Extension v1.2',
    result: 'success',
    metadata: { source: 'extension' },
  },
  {
    id: 'aud-5',
    timestamp: '2026-09-28T09:10:00Z',
    user: SEED_CURRENT_USER,
    action: 'EXTENSION_PAIRED',
    ip: '198.51.100.4',
    userAgent: 'PATCHWORK Extension / Chrome 129',
    result: 'success',
    metadata: { device: "Shreyas's Chrome on MacBook", scopes: ['view_projects', 'create_patches', 'submit_changes'] },
  },
  {
    id: 'aud-4',
    timestamp: '2026-09-26T15:20:00Z',
    user: SEED_MEMBERS[2].user,
    action: 'DEPLOYMENT_COMPLETED',
    projectId: 'proj-1',
    projectName: 'ShopWave',
    patchId: 'PW-102',
    ip: '198.51.100.55',
    userAgent: 'Chrome 129 / Linux',
    result: 'success',
    metadata: { deploymentId: 'DEP-88', env: 'production' },
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-20T10:00:00Z',
    user: SEED_CURRENT_USER,
    action: 'PROJECT_OWNERSHIP_VERIFIED',
    projectId: 'proj-1',
    projectName: 'ShopWave',
    ip: '198.51.100.4',
    userAgent: 'Chrome 129 / macOS',
    result: 'success',
    metadata: { method: 'github_and_vercel_mapping', verified: true },
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-20T09:40:00Z',
    user: SEED_CURRENT_USER,
    action: 'GITHUB_CONNECTED',
    ip: '198.51.100.4',
    userAgent: 'Chrome 129 / macOS',
    result: 'success',
    metadata: { org: 'company', appInstalled: true },
  },
  {
    id: 'aud-1',
    timestamp: '2026-09-20T09:00:00Z',
    user: SEED_CURRENT_USER,
    action: 'USER_LOGGED_IN',
    ip: '198.51.100.4',
    userAgent: 'Google OAuth 2.0',
    result: 'success',
    metadata: { email: 'shreyas@patchwork.dev' },
  },
];

export const SEED_EXTENSION_SESSIONS: ExtensionSession[] = [
  {
    id: 'ext-sess-1',
    userId: 'usr-1',
    workspaceId: 'ws-1',
    deviceName: "Shreyas's MacBook Chrome",
    browser: 'Chrome 129.0',
    tokenHash: 'pw_tok_e942f7c0a8b9...',
    permissions: [
      'View projects',
      'Create patches',
      'Read project configuration',
      'Submit patches',
      'View deployment status',
    ],
    createdAt: '2026-09-28T09:10:00Z',
    lastActiveAt: '2 minutes ago',
    expiresAt: '2026-10-28T09:10:00Z',
  },
];

export const SEED_INTEGRATIONS: IntegrationsConfig = {
  github: {
    connected: true,
    org: 'company',
    accountType: 'organization',
    appInstalled: true,
    repositories: [
      'company/shopwave-web',
      'company/curacommerce-app',
      'company/landinglab-site',
      'company/docs-portal',
    ],
    permissions: ['Repository contents (Read & Write)', 'Pull Requests (Read & Write)', 'Workflows (Read)'],
    lastSync: '5 minutes ago',
  },
  vercel: {
    connected: true,
    team: 'agnidev-team',
    projects: ['prj_shopwave_vercel', 'prj_landinglab_vercel'],
    domains: ['shopwave.dev', 'landinglab.co'],
    lastSync: '12 minutes ago',
  },
  netlify: {
    connected: true,
    team: 'company-net',
    sites: ['site_cura_netlify'],
    lastSync: '1 hour ago',
  },
  supabase: {
    connected: true,
    projectUrl: 'https://vbtlzywxqabn.supabase.co',
    anonKeyConfigured: true,
    serviceRoleConfigured: true,
    realtimeEnabled: true,
    lastSync: 'Just now',
  },
  ai: {
    provider: 'gemini',
    model: 'Gemini 2.5 Flash',
    temperature: 0.2,
    allowFrontendModifications: true,
    allowBackendModifications: false,
    requireApprovalForBackend: true,
    requireApprovalForHighRisk: true,
  },
};

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Patch PW-104 passed verification',
    message: 'All 12 automated checks and visual QA passed with 98.7% similarity.',
    type: 'verification',
    link: '/patches/PW-104',
    timestamp: '20m ago',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Arnav approved PW-104',
    message: 'Arnav left an approval review with no requested changes.',
    type: 'patch',
    link: '/patches/PW-104',
    timestamp: '1h ago',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Preview Deployment Ready',
    message: 'Deployment DEP-89 for PW-104 is live on Vercel preview.',
    type: 'deployment',
    link: '/deployments',
    timestamp: '2h ago',
    read: true,
  },
];

interface PatchworkStoreState {
  currentUser: User | null;
  workspace: Workspace;
  members: WorkspaceMember[];
  projects: Project[];
  activeProjectId: string;
  patches: Patch[];
  deployments: Deployment[];
  verificationRun: VerificationRun;
  visualSnapshot: VisualSnapshot;
  versions: VersionItem[];
  conflicts: ConflictItem[];
  presence: RealtimePresence[];
  auditLogs: AuditLog[];
  extensionSessions: ExtensionSession[];
  integrations: IntegrationsConfig;
  notifications: NotificationItem[];
  pairingCode: string | null;

  // Actions
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, name?: string) => void;
  logout: () => void;
  switchUser: (user: User) => void;
  setActiveProject: (projectId: string) => void;
  
  // Project actions
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) => Project;
  verifyProjectOwnership: (projectId: string) => void;

  // Patch actions
  createPatch: (patch: Partial<Patch> & { title: string; projectId: string }) => Patch;
  updatePatchStatus: (patchId: string, status: PatchStatus) => void;
  addPatchComment: (patchId: string, content: string, file?: string, line?: number) => void;
  addPatchReview: (patchId: string, status: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED', comment: string) => void;
  
  // Deployment & Rollback
  triggerDeployment: (patchId: string, environment: 'preview' | 'production') => Deployment;
  triggerRollback: (version: VersionItem, reason: string) => void;

  // Verification
  runVerificationSuite: (patchId: string) => void;

  // Conflicts
  resolveConflict: (conflictId: string, resolution: 'keep_a' | 'keep_b' | 'ai_merge') => void;

  // Extension Pairing
  generatePairingCode: () => string;
  approveExtensionPairing: (deviceName?: string) => ExtensionSession;
  revokeExtensionSession: (sessionId: string) => void;

  // Integrations
  updateIntegrations: (updater: (prev: IntegrationsConfig) => IntegrationsConfig) => void;

  // Collaboration presence
  updateMyPresence: (partial: Partial<RealtimePresence>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Audit
  logAudit: (action: AuditLog['action'], details?: Partial<AuditLog>) => void;
}

export const usePatchworkStore = create<PatchworkStoreState>()(
  persist(
    (set, get) => ({
      currentUser: SEED_CURRENT_USER,
      workspace: SEED_WORKSPACE,
      members: SEED_MEMBERS,
      projects: SEED_PROJECTS,
      activeProjectId: 'proj-1',
      patches: SEED_PATCHES,
      deployments: SEED_DEPLOYMENTS,
      verificationRun: SEED_VERIFICATION_RUN,
      visualSnapshot: SEED_VISUAL_SNAPSHOT,
      versions: SEED_VERSIONS,
      conflicts: SEED_CONFLICTS,
      presence: SEED_PRESENCE,
      auditLogs: SEED_AUDIT_LOGS,
      extensionSessions: SEED_EXTENSION_SESSIONS,
      integrations: SEED_INTEGRATIONS,
      notifications: SEED_NOTIFICATIONS,
      pairingCode: null,

      loginWithGoogle: () => {
        set({ currentUser: SEED_CURRENT_USER });
        get().logAudit('USER_LOGGED_IN', { metadata: { provider: 'Google OAuth 2.0' } });
      },

      loginWithEmail: (email: string, name = 'Developer') => {
        const user: User = {
          id: `usr-${Date.now()}`,
          name: name || email.split('@')[0],
          email,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
          role: 'developer',
          cursorColor: '#3B82F6',
          timezone: 'UTC',
        };
        set({ currentUser: user });
        get().logAudit('USER_LOGGED_IN', { metadata: { provider: 'email_password', email } });
      },

      logout: () => {
        set({ currentUser: null });
      },

      switchUser: (user: User) => {
        set({ currentUser: user });
      },

      setActiveProject: (projectId: string) => {
        set({ activeProjectId: projectId });
      },

      createProject: (data) => {
        const id = `proj-${Date.now()}`;
        const newProj: Project = {
          ...data,
          id,
          workspaceId: get().workspace.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownershipStatus: 'verified', // automatically verified through authenticated GitHub app
          status: 'production_healthy',
        };
        set((state) => ({
          projects: [newProj, ...state.projects],
          activeProjectId: id,
        }));
        get().logAudit('PROJECT_CREATED', {
          projectId: id,
          projectName: newProj.name,
          metadata: { repo: newProj.repositoryName, provider: newProj.deploymentProvider },
        });
        return newProj;
      },

      verifyProjectOwnership: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  ownershipStatus: 'verified',
                  verifiedAt: new Date().toISOString(),
                  status: 'production_healthy',
                }
              : p
          ),
        }));
        get().logAudit('PROJECT_OWNERSHIP_VERIFIED', {
          projectId,
          metadata: { verificationType: 'github_app_token_attestation' },
        });
      },

      createPatch: (data) => {
        const patchCount = get().patches.length + 101;
        const id = `PW-${patchCount}`;
        const user = get().currentUser || SEED_CURRENT_USER;
        const newPatch: Patch = {
          id,
          projectId: data.projectId,
          workspaceId: get().workspace.id,
          author: user,
          title: data.title,
          description: data.description || 'Visual patch created via PATCHWORK',
          status: 'DRAFT',
          riskLevel: data.riskLevel || 'LOW',
          branchName: `patchwork/${id.toLowerCase()}`,
          commitSha: Math.random().toString(16).substring(2, 9),
          previewUrl: `https://shopwave-git-${id.toLowerCase()}.vercel.app`,
          source: data.source || 'web',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          files: data.files || [
            {
              filename: 'src/components/LandingHero.tsx',
              category: 'frontend',
              changeType: 'modified',
              additions: 4,
              deletions: 1,
              diffSummary: 'Updated visual typography styling',
              oldContent: `<button className="px-4 py-2">Get Started</button>`,
              newContent: `<button className="px-6 py-3 bg-[#1B133C] text-white rounded-xl shadow-md">Get Started Now</button>`,
            },
          ],
          comments: [],
          reviews: [],
          aiSummary: {
            explanation: 'Visual adjustment created and queued for review.',
            why: 'User initiated visual tweak.',
            affectedComponents: ['LandingHero'],
            potentialRisks: ['Verify button alignment on mobile viewports'],
            dependencies: [],
          },
        };

        set((state) => ({
          patches: [newPatch, ...state.patches],
          notifications: [
            {
              id: `notif-${Date.now()}`,
              title: `Patch ${id} created`,
              message: `${user.name} created patch "${newPatch.title}"`,
              type: 'patch',
              link: `/patches/${id}`,
              timestamp: 'Just now',
              read: false,
            },
            ...state.notifications,
          ],
        }));

        get().logAudit('PATCH_CREATED', {
          projectId: data.projectId,
          patchId: id,
          metadata: { title: newPatch.title },
        });

        return newPatch;
      },

      updatePatchStatus: (patchId: string, status: PatchStatus) => {
        set((state) => ({
          patches: state.patches.map((p) =>
            p.id === patchId
              ? {
                  ...p,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
        get().logAudit('PATCH_UPDATED', {
          patchId,
          metadata: { newStatus: status },
        });
      },

      addPatchComment: (patchId: string, content: string, file, line) => {
        const user = get().currentUser || SEED_CURRENT_USER;
        const newComment = {
          id: `c-${Date.now()}`,
          patchId,
          author: user,
          content,
          file,
          line,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          patches: state.patches.map((p) =>
            p.id === patchId ? { ...p, comments: [...p.comments, newComment] } : p
          ),
        }));
      },

      addPatchReview: (patchId: string, status, comment) => {
        const user = get().currentUser || SEED_CURRENT_USER;
        const newReview = {
          id: `rev-${Date.now()}`,
          patchId,
          author: user,
          status,
          comment,
          createdAt: new Date().toISOString(),
        };

        const targetPatch = get().patches.find((p) => p.id === patchId);
        const nextStatus: PatchStatus = status === 'APPROVED' ? 'APPROVED' : 'CHANGES_REQUESTED';

        set((state) => ({
          patches: state.patches.map((p) =>
            p.id === patchId
              ? {
                  ...p,
                  status: nextStatus,
                  reviews: [...p.reviews, newReview],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          notifications: [
            {
              id: `notif-${Date.now()}`,
              title: `Patch ${patchId} reviewed by ${user.name}`,
              message: `Review decision: ${status}. "${comment}"`,
              type: 'patch',
              link: `/patches/${patchId}`,
              timestamp: 'Just now',
              read: false,
            },
            ...state.notifications,
          ],
        }));

        get().logAudit(status === 'APPROVED' ? 'PATCH_APPROVED' : 'PATCH_REJECTED', {
          patchId,
          metadata: { reviewer: user.name, comment },
        });
      },

      triggerDeployment: (patchId: string, environment: 'preview' | 'production') => {
        const depId = `DEP-${Math.floor(Math.random() * 800) + 100}`;
        const user = get().currentUser || SEED_CURRENT_USER;
        const patch = get().patches.find((p) => p.id === patchId);
        const project = get().projects.find((pr) => pr.id === (patch?.projectId || get().activeProjectId));

        const newDep: Deployment = {
          id: depId,
          projectId: project?.id || 'proj-1',
          patchId,
          environment,
          provider: project?.deploymentProvider || 'vercel',
          commitSha: patch?.commitSha || Math.random().toString(16).substring(2, 9),
          branch: environment === 'production' ? project?.defaultBranch || 'main' : patch?.branchName || 'patchwork-preview',
          author: user,
          status: 'READY',
          previewUrl: environment === 'production' ? (project?.productionUrl || 'https://shopwave.dev') : (patch?.previewUrl || `https://shopwave-preview-${depId.toLowerCase()}.vercel.app`),
          durationSeconds: Math.floor(Math.random() * 25) + 30,
          createdAt: new Date().toISOString(),
          logs: [
            `[${new Date().toLocaleTimeString()}] Deployment initialized for ${environment.toUpperCase()}...`,
            `[${new Date().toLocaleTimeString()}] Packaging git tree from ${patch?.branchName || 'main'}...`,
            `[${new Date().toLocaleTimeString()}] Verification status passed ✓`,
            `[${new Date().toLocaleTimeString()}] Building container bundle via ${project?.deploymentProvider || 'vercel'} engine...`,
            `[${new Date().toLocaleTimeString()}] Build finished in 38s. Edge endpoints healthy ✓`,
            `[${new Date().toLocaleTimeString()}] Target live URL active.`,
          ],
        };

        set((state) => {
          const updatedPatches = state.patches.map((p) => {
            if (p.id === patchId) {
              return {
                ...p,
                status: environment === 'production' ? ('DEPLOYED' as PatchStatus) : ('PREVIEW_READY' as PatchStatus),
                productionDeploymentId: environment === 'production' ? depId : p.productionDeploymentId,
              };
            }
            return p;
          });

          // Add to version history if production
          let updatedVersions = state.versions;
          if (environment === 'production' && patch) {
            const nextVersionNum = `v1.${state.versions.length + 1}`;
            const newVersion: VersionItem = {
              version: nextVersionNum,
              commitSha: patch.commitSha,
              patchId: patch.id,
              title: patch.title,
              author: user,
              deployedAt: new Date().toISOString(),
              status: 'active',
              deploymentId: depId,
              rollbackPossible: true,
            };
            updatedVersions = [
              newVersion,
              ...state.versions.map((v) => ({ ...v, status: 'superseded' as const })),
            ];
          }

          return {
            deployments: [newDep, ...state.deployments],
            patches: updatedPatches,
            versions: updatedVersions,
            notifications: [
              {
                id: `notif-${Date.now()}`,
                title: `${environment === 'production' ? 'Production' : 'Preview'} Deployment Live`,
                message: `${depId} for ${patch?.id || 'Project'} completed successfully.`,
                type: 'deployment',
                link: '/deployments',
                timestamp: 'Just now',
                read: false,
              },
              ...state.notifications,
            ],
          };
        });

        get().logAudit(environment === 'production' ? 'DEPLOYMENT_COMPLETED' : 'DEPLOYMENT_STARTED', {
          projectId: project?.id,
          patchId,
          metadata: { deploymentId: depId, environment },
        });

        return newDep;
      },

      triggerRollback: (targetVersion: VersionItem, reason: string) => {
        const user = get().currentUser || SEED_CURRENT_USER;
        const revertDepId = `DEP-${Math.floor(Math.random() * 800) + 100}`;
        const newRevertCommit = `rev-${Math.random().toString(16).substring(2, 9)}`;

        const newDep: Deployment = {
          id: revertDepId,
          projectId: get().activeProjectId,
          environment: 'production',
          provider: 'vercel',
          commitSha: newRevertCommit,
          branch: 'main',
          author: user,
          status: 'READY',
          previewUrl: 'https://shopwave.dev',
          durationSeconds: 42,
          createdAt: new Date().toISOString(),
          logs: [
            `[${new Date().toLocaleTimeString()}] SAFE ROLLBACK TRIGGERED: Restoring ${targetVersion.version}`,
            `[${new Date().toLocaleTimeString()}] Generating non-destructive git revert commit (${newRevertCommit})...`,
            `[${new Date().toLocaleTimeString()}] Triggering production deployment for stable snapshot...`,
            `[${new Date().toLocaleTimeString()}] Rollback verified. Production restored to ${targetVersion.version} state.`,
          ],
        };

        const rollbackVersion: VersionItem = {
          version: `v1.${get().versions.length + 1} (Rollback to ${targetVersion.version})`,
          commitSha: newRevertCommit,
          title: `Revert: Rollback to ${targetVersion.version} (${reason})`,
          author: user,
          deployedAt: new Date().toISOString(),
          status: 'active',
          deploymentId: revertDepId,
          rollbackPossible: true,
        };

        set((state) => ({
          deployments: [newDep, ...state.deployments],
          versions: [
            rollbackVersion,
            ...state.versions.map((v) => ({ ...v, status: 'superseded' as const })),
          ],
          patches: state.patches.map((p) =>
            p.id === targetVersion.patchId ? { ...p, status: 'ROLLED_BACK' as PatchStatus } : p
          ),
          notifications: [
            {
              id: `notif-${Date.now()}`,
              title: `Production Rolled Back to ${targetVersion.version}`,
              message: `Safe revert deployment ${revertDepId} completed. Reason: ${reason}`,
              type: 'rollback',
              link: '/rollback',
              timestamp: 'Just now',
              read: false,
            },
            ...state.notifications,
          ],
        }));

        get().logAudit('ROLLBACK_TRIGGERED', {
          metadata: { targetVersion: targetVersion.version, revertCommit: newRevertCommit, reason },
        });
      },

      runVerificationSuite: (patchId: string) => {
        set((state) => ({
          verificationRun: {
            ...state.verificationRun,
            patchId,
            status: 'running',
            checks: state.verificationRun.checks.map((c) => ({ ...c, status: 'running' as const })),
          },
        }));

        setTimeout(() => {
          set((state) => ({
            verificationRun: {
              ...state.verificationRun,
              status: 'passed',
              completedAt: new Date().toISOString(),
              checks: state.verificationRun.checks.map((c) => ({ ...c, status: 'passed' as const })),
            },
            patches: state.patches.map((p) =>
              p.id === patchId ? { ...p, status: 'VERIFIED' as PatchStatus } : p
            ),
          }));
          get().logAudit('VERIFICATION_PASSED', {
            patchId,
            metadata: { checksPassed: 12, visualMatch: 98.7 },
          });
        }, 1200);
      },

      resolveConflict: (conflictId: string, resolution) => {
        set((state) => ({
          conflicts: state.conflicts.map((c) =>
            c.id === conflictId
              ? {
                  ...c,
                  resolutionStatus: 'resolved',
                  chosenResolution: resolution,
                }
              : c
          ),
        }));
      },

      generatePairingCode: () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        set({ pairingCode: code });
        return code;
      },

      approveExtensionPairing: (deviceName = "Developer's Chrome Browser") => {
        const user = get().currentUser || SEED_CURRENT_USER;
        const newSession: ExtensionSession = {
          id: `ext-sess-${Date.now()}`,
          userId: user.id,
          workspaceId: get().workspace.id,
          deviceName,
          browser: 'Chrome (Extension v1.2)',
          tokenHash: `pw_tok_${Math.random().toString(36).substring(2, 14)}`,
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

        set((state) => ({
          extensionSessions: [newSession, ...state.extensionSessions],
          pairingCode: null,
          notifications: [
            {
              id: `notif-${Date.now()}`,
              title: 'Chrome Extension Paired',
              message: `Device "${deviceName}" paired with workspace ${get().workspace.name}.`,
              type: 'team',
              link: '/settings/extension',
              timestamp: 'Just now',
              read: false,
            },
            ...state.notifications,
          ],
        }));

        get().logAudit('EXTENSION_PAIRED', {
          metadata: { device: deviceName, sessionId: newSession.id },
        });

        return newSession;
      },

      revokeExtensionSession: (sessionId: string) => {
        set((state) => ({
          extensionSessions: state.extensionSessions.filter((s) => s.id !== sessionId),
        }));
        get().logAudit('EXTENSION_SESSION_REVOKED', {
          metadata: { sessionId },
        });
      },

      updateIntegrations: (updater) => {
        set((state) => ({ integrations: updater(state.integrations) }));
      },

      updateMyPresence: (partial) => {
        const user = get().currentUser || SEED_CURRENT_USER;
        set((state) => ({
          presence: state.presence.map((p) =>
            p.userId === user.id ? { ...p, ...partial, lastSeenAt: 'Just now' } : p
          ),
        }));
      },

      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      logAudit: (action, details = {}) => {
        const user = get().currentUser || SEED_CURRENT_USER;
        const newLog: AuditLog = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user,
          action,
          projectId: details.projectId || get().activeProjectId,
          projectName: details.projectName || get().projects.find((p) => p.id === (details.projectId || get().activeProjectId))?.name,
          patchId: details.patchId,
          ip: '198.51.100.4',
          userAgent: 'PATCHWORK Platform Web App',
          result: details.result || 'success',
          metadata: details.metadata || {},
        };
        set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));
      },
    }),
    {
      name: 'patchwork-platform-store-v1',
    }
  )
);
