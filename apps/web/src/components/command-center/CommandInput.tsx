'use client';

import { Send, Zap } from 'lucide-react';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useCommandCenter } from '@/lib/tasks/taskStore';
import { SLASH_COMMANDS } from '@/lib/tasks/taskTypes';
import { AGENT_MAP } from '@/lib/agents/agents';

export function CommandInput() {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<typeof SLASH_COMMANDS>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const { sendMessage, isThinking, activeAgentId, selectedProject } = useCommandCenter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const agent = AGENT_MAP.get(activeAgentId);

  const placeholder =
    activeAgentId === 'ceo'
      ? `Escribe una orden al CEO... (ej: "5 reels para ${selectedProject}")`
      : `Escribe a ${agent?.name ?? 'agente'}... (ej: "${agent?.capabilities?.[0] ?? 'tarea'} para ${selectedProject}")`;

  useEffect(() => {
    if (value.startsWith('/')) {
      const query = value.toLowerCase();
      const matches = SLASH_COMMANDS.filter((c) => c.command.startsWith(query));
      setSuggestions(matches);
      setSelectedSuggestion(0);
    } else {
      setSuggestions([]);
    }
  }, [value]);

  function autoResize() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }

  async function submit() {
    const trimmed = value.trim();
    if (!trimmed || isThinking) return;
    setValue('');
    setSuggestions([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(trimmed);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion((v) => Math.min(v + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion((v) => Math.max(v - 1, 0));
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && suggestions.length > 0)) {
        e.preventDefault();
        const cmd = suggestions[selectedSuggestion];
        if (cmd) setValue(cmd.command + ' ');
        setSuggestions([]);
        return;
      }
      if (e.key === 'Escape') {
        setSuggestions([]);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const QUICK_ACTIONS = [
    { label: 'Videos', prompt: `5 reels para ${selectedProject}` },
    { label: 'SEO', prompt: `analisis SEO de ${selectedProject}` },
    { label: 'Campana', prompt: `campana de marketing para ${selectedProject}` },
    { label: 'Reporte', prompt: `/reporte` },
  ];

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 p-3">
      {suggestions.length > 0 && (
        <div className="mb-2 rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
          {suggestions.map((cmd, i) => (
            <button
              key={cmd.command}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors duration-100 ${
                i === selectedSuggestion ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/60'
              }`}
              onClick={() => {
                setValue(cmd.command + ' ');
                setSuggestions([]);
                textareaRef.current?.focus();
              }}
            >
              <span className="font-mono text-indigo-400">{cmd.label}</span>
              <span className="text-zinc-500 text-xs">{cmd.description}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden focus-within:border-zinc-500 transition-colors duration-150">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              autoResize();
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isThinking}
            className="w-full bg-transparent text-zinc-200 placeholder-zinc-600 text-sm resize-none px-3.5 pt-2.5 pb-2 outline-none disabled:opacity-50 leading-relaxed"
          />
          <div className="flex items-center gap-1.5 px-3.5 pb-2 pt-0.5 border-t border-zinc-700/60">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.label}
                onClick={() => {
                  setValue(qa.prompt);
                  textareaRef.current?.focus();
                }}
                className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors duration-100"
              >
                <Zap size={8} />
                {qa.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!value.trim() || isThinking}
          className="w-9 h-9 mt-0.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-150 active:scale-95 shrink-0"
        >
          {isThinking ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={14} className="text-white" />
          )}
        </button>
      </div>

      <p className="text-[10px] text-zinc-700 mt-1.5 px-1">
        Enter para enviar - Shift+Enter nueva linea - Escribe / para comandos rapidos
      </p>
    </div>
  );
}
