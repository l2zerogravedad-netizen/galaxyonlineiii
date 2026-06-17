'use client';

import { useEffect, useRef } from 'react';
import { useCommandCenter } from '@/lib/tasks/taskStore';
import { AGENT_MAP } from '@/lib/agents/agents';
import { MessageBubble } from './MessageBubble';

function EmptyChat({ agentId }: { agentId: string }) {
  const agent = AGENT_MAP.get(agentId as never);
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 pb-8">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-sm font-bold"
        style={{
          backgroundColor: (agent?.accentColor ?? '#818cf8') + '20',
          border: `1px solid ${(agent?.accentColor ?? '#818cf8')}40`,
          color: agent?.accentColor ?? '#818cf8',
        }}
      >
        {agent?.shortName ?? 'AI'}
      </div>
      <div className="text-center">
        <p className="text-zinc-300 font-medium">{agent?.name ?? 'Agente'}</p>
        <p className="text-zinc-600 text-sm mt-0.5">{agent?.role ?? 'Agente IA'}</p>
      </div>
      <p className="text-zinc-700 text-xs max-w-[240px] text-center leading-relaxed">
        {agent?.description ?? 'Escribe un mensaje para comenzar.'}
      </p>
      <div className="flex flex-wrap gap-1.5 justify-center max-w-[280px] mt-1">
        {(agent?.capabilities ?? []).slice(0, 4).map((cap) => (
          <span
            key={cap}
            className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
            style={{
              borderColor: (agent?.accentColor ?? '#818cf8') + '40',
              color: (agent?.accentColor ?? '#818cf8') + 'cc',
              backgroundColor: (agent?.accentColor ?? '#818cf8') + '0a',
            }}
          >
            {cap}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ChatWindow() {
  const { activeAgentId, conversations, isThinking } = useCommandCenter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = conversations[activeAgentId] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isThinking]);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {messages.length === 0 ? (
        <EmptyChat agentId={activeAgentId} />
      ) : (
        <div className="flex flex-col gap-0.5 pt-4 pb-2">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
