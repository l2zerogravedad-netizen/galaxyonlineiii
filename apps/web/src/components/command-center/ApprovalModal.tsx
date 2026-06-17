'use client';

import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useCommandCenter } from '@/lib/tasks/taskStore';
import { AGENT_MAP } from '@/lib/agents/agents';

const TYPE_LABELS: Record<string, string> = {
  video: 'Videos / Reels',
  content: 'Contenido',
  seo: 'SEO y Articulos',
  design: 'Diseno',
  ads: 'Publicidad Paga',
  marketplace: 'Marketplace',
  automation: 'Automatizacion',
  sales: 'Ventas',
  analysis: 'Analisis',
  marketing: 'Campana de Marketing',
  general: 'Tarea General',
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

export function ApprovalModal() {
  const { pendingPlan, approveAndExecute, cancelApproval } = useCommandCenter();

  if (!pendingPlan) return null;

  const { parsed } = pendingPlan;
  const agentNames = parsed.assignedAgents
    .map((id) => AGENT_MAP.get(id)?.name)
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={cancelApproval}
      />
      <div className="relative w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/80 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle size={15} className="text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-100 text-sm">Aprobar Plan</p>
            <p className="text-xs text-zinc-500">Revisa antes de ejecutar</p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/60 rounded-lg p-3">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1">Proyecto</p>
              <p className="text-sm text-zinc-200 font-medium">{parsed.project}</p>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1">Tipo</p>
              <p className="text-sm text-zinc-200 font-medium">{TYPE_LABELS[parsed.type] ?? parsed.type}</p>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1">Prioridad</p>
              <p className="text-sm text-zinc-200 font-medium">{PRIORITY_LABELS[parsed.priority] ?? parsed.priority}</p>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1">Tareas</p>
              <p className="text-sm text-zinc-200 font-medium">{parsed.tasks.length} subtareas</p>
            </div>
          </div>

          <div className="bg-zinc-800/60 rounded-lg p-3">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1.5">Agentes</p>
            <div className="flex flex-wrap gap-1.5">
              {agentNames.map((name) => (
                <span
                  key={name}
                  className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-zinc-800/60 rounded-lg p-3">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1.5">Tareas a crear</p>
            <div className="space-y-1">
              {parsed.tasks.map((t, i) => (
                <div key={t.id} className="flex items-start gap-2 text-xs text-zinc-400">
                  <span className="font-mono text-zinc-600 shrink-0 mt-0.5">{i + 1}.</span>
                  <span>{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 px-5 pb-5">
          <button
            onClick={cancelApproval}
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 hover:text-zinc-200 transition-all duration-150 active:scale-[0.98]"
          >
            <XCircle size={14} />
            Cancelar
          </button>
          <button
            onClick={approveAndExecute}
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-150 active:scale-[0.98]"
          >
            <CheckCircle size={14} />
            Aprobar y ejecutar
          </button>
        </div>
      </div>
    </div>
  );
}
