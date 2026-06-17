'use client';

import { useCommandCenter } from '@/lib/tasks/taskStore';
import { AGENTS } from '@/lib/agents/agents';
import { AgentId, AgentStatus } from '@/lib/tasks/taskTypes';

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; pulse: boolean }> = {
  online: { label: 'online', color: 'bg-green-500', pulse: false },
  working: { label: 'trabajando', color: 'bg-blue-500', pulse: true },
  idle: { label: 'esperando', color: 'bg-zinc-500', pulse: false },
  error: { label: 'error', color: 'bg-red-500', pulse: false },
};

function AgentAvatar({ agent }: { agent: (typeof AGENTS)[0] }) {
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0"
      style={{
        backgroundColor: agent.accentColor + '22',
        border: `1px solid ${agent.accentColor}44`,
        color: agent.accentColor,
      }}
    >
      {agent.shortName.slice(0, 3)}
    </div>
  );
}

export function AgentSidebar() {
  const { activeAgentId, setActiveAgent, agentStatuses, tasks } = useCommandCenter();

  function taskCountForAgent(id: AgentId) {
    return tasks.filter(
      (t) =>
        t.assignedAgents.includes(id) &&
        ['analyzing', 'working'].includes(t.status)
    ).length;
  }

  return (
    <aside className="w-[220px] shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950 overflow-y-auto">
      <div className="px-3 pt-3 pb-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Equipo IA</p>
      </div>

      <div className="flex flex-col gap-0.5 px-1.5 pb-3">
        {AGENTS.map((agent) => {
          const statusCfg = STATUS_CONFIG[agentStatuses[agent.id] ?? 'online'];
          const active = activeAgentId === agent.id;
          const activeTasks = taskCountForAgent(agent.id);

          return (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id)}
              className={`group w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-all duration-150 ${
                active
                  ? 'bg-zinc-800 border border-zinc-700'
                  : 'border border-transparent hover:bg-zinc-800/60'
              }`}
            >
              <AgentAvatar agent={agent} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-medium truncate ${active ? 'text-zinc-100' : 'text-zinc-300'}`}>
                    {agent.name}
                  </span>
                  {activeTasks > 0 && (
                    <span className="ml-auto shrink-0 min-w-[18px] h-[18px] rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-mono font-bold flex items-center justify-center">
                      {activeTasks}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${statusCfg.color} ${statusCfg.pulse ? 'animate-pulse' : ''}`}
                  />
                  <span className="text-[10px] text-zinc-600 truncate">{statusCfg.label}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
