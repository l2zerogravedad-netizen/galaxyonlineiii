'use client';

import { Message } from '@/lib/tasks/taskTypes';
import { AGENT_MAP } from '@/lib/agents/agents';

interface Props {
  message: Message;
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-500"
          style={{
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function formatContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={i} className="font-semibold text-zinc-100 mt-2 first:mt-0">
          {line.replace(/\*\*/g, '')}
        </p>
      );
    }
    if (line.match(/^\*\*(.+?)\*\*/)) {
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <p key={i} className="leading-relaxed">
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold text-zinc-100">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }
    if (line.startsWith('- ') || line.match(/^\d+\. /)) {
      return (
        <p key={i} className="pl-3 leading-relaxed text-zinc-300">
          {line}
        </p>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-1.5" />;
    return (
      <p key={i} className="leading-relaxed">
        {line}
      </p>
    );
  });
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const agent = AGENT_MAP.get(message.agentId);

  const time = new Date(message.timestamp).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-1" style={{ animationFillMode: 'both' }}>
        <div className="max-w-[75%]">
          <div className="bg-indigo-600/90 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
            {message.content}
          </div>
          <div className="text-[10px] text-zinc-600 mt-1 text-right pr-1">{time}</div>
        </div>
      </div>
    );
  }

  if (message.isThinking) {
    return (
      <div className="flex items-end gap-2.5 px-4 py-1">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mb-0.5"
          style={{
            backgroundColor: (agent?.accentColor ?? '#818cf8') + '22',
            border: `1px solid ${(agent?.accentColor ?? '#818cf8')}44`,
            color: agent?.accentColor ?? '#818cf8',
          }}
        >
          {agent?.shortName.slice(0, 3) ?? 'AI'}
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tl-sm px-4 py-2.5">
          <ThinkingDots />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2.5 px-4 py-1">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mb-0.5"
        style={{
          backgroundColor: (agent?.accentColor ?? '#818cf8') + '22',
          border: `1px solid ${(agent?.accentColor ?? '#818cf8')}44`,
          color: agent?.accentColor ?? '#818cf8',
        }}
      >
        {agent?.shortName.slice(0, 3) ?? 'AI'}
      </div>
      <div className="max-w-[78%]">
        <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-zinc-300">
          {formatContent(message.content)}
        </div>
        <div className="flex items-center gap-1.5 mt-1 pl-1">
          <span className="text-[10px] font-mono text-zinc-600">{agent?.name ?? 'IA'}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-[10px] text-zinc-600">{time}</span>
        </div>
      </div>
    </div>
  );
}
