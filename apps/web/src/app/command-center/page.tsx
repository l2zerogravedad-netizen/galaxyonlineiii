'use client';

import { Bot, Shield, ShieldOff, ExternalLink } from 'lucide-react';
import { useCommandCenter } from '@/lib/tasks/taskStore';
import { ProjectSelector } from '@/components/command-center/ProjectSelector';
import { AgentSidebar } from '@/components/command-center/AgentSidebar';
import { ChatWindow } from '@/components/command-center/ChatWindow';
import { TaskPanel } from '@/components/command-center/TaskPanel';
import { CommandInput } from '@/components/command-center/CommandInput';
import { ApprovalModal } from '@/components/command-center/ApprovalModal';
import { AGENT_MAP } from '@/lib/agents/agents';

function TopBar() {
  const { activeAgentId, approvalMode, toggleApprovalMode, agentStatuses, pendingPlan } = useCommandCenter();
  const agent = AGENT_MAP.get(activeAgentId);
  const status = agentStatuses[activeAgentId] ?? 'online';

  const statusColors: Record<string, string> = {
    online: 'bg-green-500',
    working: 'bg-blue-500 animate-pulse',
    idle: 'bg-zinc-500',
    error: 'bg-red-500',
  };

  return (
    <header className="h-12 flex items-center gap-3 px-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
      <div className="flex items-center gap-2.5 mr-1">
        <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Bot size={13} className="text-indigo-400" />
        </div>
        <span className="font-mono text-xs text-zinc-300 font-semibold tracking-wide hidden sm:block">
          CENTRO DE COMANDO
        </span>
      </div>

      <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${statusColors[status]}`} />
        <span className="text-xs text-zinc-400 font-mono">
          {agent?.shortName ?? 'AI'}
        </span>
      </div>

      <div className="flex-1" />

      <ProjectSelector />

      {pendingPlan && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-amber-400 font-mono">Plan pendiente</span>
        </div>
      )}

      <button
        onClick={toggleApprovalMode}
        title={approvalMode ? 'Desactivar modo aprobacion' : 'Activar modo aprobacion'}
        className={`flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-xs font-mono transition-all duration-150 ${
          approvalMode
            ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30'
            : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
        }`}
      >
        {approvalMode ? <Shield size={11} /> : <ShieldOff size={11} />}
        <span className="hidden sm:block">{approvalMode ? 'aprob. ON' : 'aprob. OFF'}</span>
      </button>

      <a
        href="/dashboard"
        className="flex items-center gap-1 h-7 px-2 rounded-md border border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-colors duration-150"
        title="Volver al juego"
      >
        <ExternalLink size={11} />
      </a>
    </header>
  );
}

function ActiveAgentBar() {
  const { activeAgentId } = useCommandCenter();
  const agent = AGENT_MAP.get(activeAgentId);

  return (
    <div className="flex items-center gap-2.5 px-4 py-2 border-b border-zinc-800 bg-zinc-900/40 shrink-0">
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center font-mono text-[9px] font-bold shrink-0"
        style={{
          backgroundColor: (agent?.accentColor ?? '#818cf8') + '22',
          border: `1px solid ${(agent?.accentColor ?? '#818cf8')}44`,
          color: agent?.accentColor ?? '#818cf8',
        }}
      >
        {agent?.shortName.slice(0, 3) ?? 'AI'}
      </div>
      <span className="text-xs font-medium text-zinc-300">{agent?.name ?? 'Agente'}</span>
      <span className="text-zinc-700">·</span>
      <span className="text-xs text-zinc-600">{agent?.role ?? 'IA'}</span>
    </div>
  );
}

export default function CommandCenterPage() {
  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <AgentSidebar />
        <main className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <ActiveAgentBar />
          <ChatWindow />
          <CommandInput />
        </main>
        <TaskPanel />
      </div>
      <ApprovalModal />
    </div>
  );
}
