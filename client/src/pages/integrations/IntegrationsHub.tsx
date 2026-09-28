import React from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  Github,
  Rocket,
  ExternalLink,
  Database,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Puzzle,
  Sparkles
} from 'lucide-react';

export default function IntegrationsHubPage() {
  const { integrations } = usePatchworkStore();

  const integrationList = [
    {
      id: 'github',
      name: 'GitHub App',
      description: 'Git-native branch creation, pull request sync, and commit authoring.',
      icon: Github,
      iconBg: 'bg-black text-white',
      connected: integrations.github.connected,
      meta: `Org: ${integrations.github.org} • ${integrations.github.repositories.length} repos`,
      href: '/settings/integrations/github',
    },
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Instant preview deployments, edge functions, and zero-downtime production promotions.',
      icon: Rocket,
      iconBg: 'bg-black text-white',
      connected: integrations.vercel.connected,
      meta: `Team: ${integrations.vercel.team} • ${integrations.vercel.projects.length} projects`,
      href: '/settings/integrations/vercel',
    },
    {
      id: 'netlify',
      name: 'Netlify',
      description: 'Branch deploy previews, edge handlers, and deploy hook webhooks.',
      icon: ExternalLink,
      iconBg: 'bg-teal-600 text-white',
      connected: integrations.netlify.connected,
      meta: `Team: ${integrations.netlify.team} • ${integrations.netlify.sites.length} sites`,
      href: '/settings/integrations/netlify',
    },
    {
      id: 'supabase',
      name: 'Supabase PostgreSQL',
      description: 'Relational data store with Row Level Security and Realtime WebSocket presence.',
      icon: Database,
      iconBg: 'bg-emerald-600 text-white',
      connected: integrations.supabase.connected,
      meta: `Realtime Broadcast • PostgreSQL RLS`,
      href: '/settings/integrations/supabase',
    },
  ];

  return (
    <DashboardLayout
      title="Integrations Hub"
      subtitle="Connected source code, cloud deployment engines, and realtime databases."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrationList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="glass-card p-6 border border-white/80 flex flex-col justify-between hover:shadow-lg transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[#1B133C]">{item.name}</h3>
                        <p className="text-[11px] text-muted-foreground font-mono">{item.meta}</p>
                      </div>
                    </div>

                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 flex justify-end">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B133C] text-white hover:bg-black text-xs font-semibold shadow-2xs transition-all"
                  >
                    <span>Configure {item.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
