'use client';

import { CheckCircle, Circle, Clock, Loader, XCircle, ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useCommandCenter } from '@/lib/tasks/taskStore';
import { Task, TaskPriority, TaskStatus } from '@/lib/tasks/taskTypes';
import { AGENT_MAP } from '@/lib/agents/agents';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'pendiente',
    color: 'text-zinc-500',
    icon: <Circle size={11} />,
  },
  analyzing: {
    label: 'analizando',
    color: 'text-amber-400',
    icon: <Clock size={11} />,
  },
  working: {
    label: 'trabajando',
    color: 'text-blue-400',
    icon: <Loader size={11} className="animate-spin" />,
  },
  awaiting_approval: {
    label: 'esperando',
    color: 'text-purple-400',
    icon: <Clock size={11} />,
  },
  completed: {
    label: 'completado',
    color: 'text-green-400',
    icon: <CheckCircle size={11} />,
  },
  error: {
    label: 'error',
    color: 'text-red-400',
    icon: <XCircle size={11} />,
  },
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  urgent: 'text-red-400 bg-red-500/10 border-red-500/20',
  high: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  low: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
};

function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[task.status];
  const agentNames = task.assignedAgents
    .map((id) => AGENT_MAP.get(id)?.shortName)
    .filter(Boolean)
    .join(', ');

  const timeAgo = (() => {
    const sec = Math.floor((Date.now() - task.createdAt) / 1000);
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m`;
    return `${Math.floor(sec / 3600)}h`;
  })();

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900/60 overflow-hidden transition-all duration-150 hover:border-zinc-700">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-3"
      >
        <div className="flex items-start gap-2">
          <span className={`mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-zinc-200 leading-snug truncate font-medium">
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] font-mono text-zinc-600">{task.project}</span>
              <span className="text-zinc-700">·</span>
              <span className={`text-[10px] font-mono ${cfg.color}`}>{cfg.label}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-[10px] text-zinc-600">{timeAgo}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wide ${PRIORITY_STYLES[task.priority]}`}
            >
              {task.priority}
            </span>
            <ChevronDown
              size={12}
              className={`text-zinc-600 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-zinc-800 pt-2.5 space-y-2">
          <div>
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Objetivo</span>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{task.objective}</p>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider block">Agentes</span>
              <span className="text-xs text-zinc-400 font-mono">{agentNames}</span>
            </div>
            {task.quantity && (
              <div>
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider block">Cant.</span>
                <span className="text-xs text-zinc-400 font-mono">{task.quantity}</span>
              </div>
            )}
          </div>
          {task.output && (
            <div>
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Resultado</span>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed line-clamp-4">{task.output}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TaskPanel() {
  const { tasks } = useCommandCenter();

  const active = tasks.filter((t) => ['analyzing', 'working'].includes(t.status));
  const pending = tasks.filter((t) => t.status === 'pending');
  const completed = tasks.filter((t) => t.status === 'completed');
  const errors = tasks.filter((t) => t.status === 'error');

  return (
    <aside className="w-[280px] shrink-0 flex flex-col border-l border-zinc-800 bg-zinc-950 overflow-y-auto">
      <div className="p-3 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Tareas</p>
          <span className="text-[10px] font-mono text-zinc-500">
            {tasks.length} total
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: 'act', value: active.length, color: 'text-blue-400' },
            { label: 'pend', value: pending.length, color: 'text-zinc-400' },
            { label: 'done', value: completed.length, color: 'text-green-400' },
            { label: 'err', value: errors.length, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center bg-zinc-900 rounded-md py-1.5">
              <span className={`text-base font-mono font-bold ${color}`}>{value}</span>
              <span className="text-[9px] text-zinc-600 uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-2.5 space-y-1.5">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <RotateCcw size={20} className="text-zinc-700" />
            <p className="text-xs text-zinc-600 text-center leading-relaxed">
              Las tareas aparecen aqui cuando le des ordenes al CEO.
            </p>
          </div>
        ) : (
          [...active, ...pending, ...completed.slice(-5), ...errors].map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </aside>
  );
}
