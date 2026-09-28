import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  FileCode,
  ArrowRight,
  GitMerge,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function ConflictsPage() {
  const { conflicts, resolveConflict } = usePatchworkStore();
  const [activeResolution, setActiveResolution] = useState<string | null>(null);
  const [appliedConflictId, setAppliedConflictId] = useState<string | null>(null);

  const conflict = conflicts[0];

  const handleApplyAI = (id: string) => {
    resolveConflict(id, 'ai_merge');
    setAppliedConflictId(id);
    setTimeout(() => setAppliedConflictId(null), 3000);
  };

  return (
    <DashboardLayout
      title="Conflict Management"
      subtitle="Detect and safely resolve overlapping visual modifications before merging."
    >
      <div className="space-y-6">
        {appliedConflictId && (
          <div className="p-4 rounded-xl bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4" /> AI Unified Proposal approved and merged into patch branch!
          </div>
        )}

        {conflicts.map((item) => (
          <div key={item.id} className="glass-card p-6 border border-white/80 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Component Collision Detected
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">{item.file}:{item.line}</span>
                </div>
                <h3 className="text-base font-bold text-[#1B133C] mt-1">{item.description}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                  {item.patchAId}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">vs</span>
                <span className="text-xs font-bold font-mono bg-purple-50 text-purple-700 px-2 py-1 rounded">
                  {item.patchBId}
                </span>
              </div>
            </div>

            {/* Side by Side Snippets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-900">Patch {item.patchAId} (Shreyas)</span>
                  <button
                    onClick={() => resolveConflict(item.id, 'keep_a')}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    Keep this version
                  </button>
                </div>
                <pre className="p-3 bg-white rounded-lg border border-black/5 font-mono text-xs text-[#1B133C] overflow-x-auto">
                  {item.snippetA}
                </pre>
              </div>

              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-900">Patch {item.patchBId} (Arnav)</span>
                  <button
                    onClick={() => resolveConflict(item.id, 'keep_b')}
                    className="text-[11px] font-semibold text-purple-600 hover:underline"
                  >
                    Keep this version
                  </button>
                </div>
                <pre className="p-3 bg-white rounded-lg border border-black/5 font-mono text-xs text-[#1B133C] overflow-x-auto">
                  {item.snippetB}
                </pre>
              </div>
            </div>

            {/* AI Resolution Proposal */}
            <div className="p-5 rounded-xl border-2 border-indigo-500/30 bg-white/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-[#1B133C] uppercase tracking-wider">
                    AI Proposed Harmonization
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Requires Human Approval</span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Both patches target the hero CTA text and button padding. The AI resolution preserves high-contrast pill styling from PW-104 while adopting the trial copy intent from PW-107:
              </p>

              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto">
                {item.aiResolutionProposal}
              </pre>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleApplyAI(item.id)}
                  className="px-4 py-2 rounded-xl bg-[#1B133C] hover:bg-black text-white text-xs font-semibold shadow-xs flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Apply AI Resolution</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
