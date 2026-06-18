'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot, Send, Trash2, ChevronDown, StopCircle,
  Cpu, Wifi, WifiOff, MessageSquare, Loader2,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant' | 'system';
type Provider = 'ollama' | 'localai';

interface Message {
  id: string;
  role: Role;
  content: string;
  pending?: boolean;
}

const DEFAULT_SYSTEM =
  'Sos un asistente de marketing y tecnología para una agencia digital argentina. ' +
  'Respondés en español, con precisión y concisión.';

const OLLAMA_FALLBACK = ['qwen2.5:7b', 'llama3.2:3b', 'mistral:7b', 'deepseek-r1:7b', 'phi3:mini'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

function ModelIcon({ provider }: { provider: Provider }) {
  return (
    <div
      className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 ${
        provider === 'ollama'
          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
          : 'bg-sky-500/20 border border-sky-500/30 text-sky-400'
      }`}
    >
      {provider === 'ollama' ? 'OL' : 'LA'}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
          isUser
            ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400'
            : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
        }`}
      >
        {isUser ? 'Vos' : <Bot size={13} />}
      </div>

      {/* Content */}
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-indigo-600/20 border border-indigo-500/25 text-zinc-100 rounded-tr-sm'
            : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm'
        }`}
      >
        {msg.pending ? (
          <div className="flex items-center gap-2 text-zinc-500">
            <Loader2 size={12} className="animate-spin" />
            <span className="text-xs">generando...</span>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [provider, setProvider] = useState<Provider>('ollama');
  const [models, setModels] = useState<string[]>(OLLAMA_FALLBACK);
  const [model, setModel] = useState('qwen2.5:7b');
  const [online, setOnline] = useState<boolean | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM);
  const [sysOpen, setSysOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── fetch available models ──────────────────────────────────────────────
  const loadModels = useCallback(async (prov: Provider) => {
    setOnline(null);
    try {
      const res = await fetch(`/api/ai-chat?provider=${prov}`, { signal: AbortSignal.timeout(4000) });
      const data = await res.json() as { ok: boolean; models: string[] };
      setOnline(data.ok);
      if (data.ok && data.models.length > 0) {
        setModels(data.models);
        setModel(data.models[0]);
      } else {
        setModels(prov === 'ollama' ? OLLAMA_FALLBACK : ['gpt-4o-mini']);
        if (prov === 'ollama') setModel(OLLAMA_FALLBACK[0]);
      }
    } catch {
      setOnline(false);
      setModels(prov === 'ollama' ? OLLAMA_FALLBACK : ['gpt-4o-mini']);
    }
  }, []);

  useEffect(() => { loadModels(provider); }, [provider, loadModels]);

  // ── auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── send message ────────────────────────────────────────────────────────
  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = { id: uid(), role: 'user', content: text };
    const assistantId = uid();
    const assistantPlaceholder: Message = { id: assistantId, role: 'assistant', content: '', pending: true };

    setMessages(prev => [...prev, userMsg, assistantPlaceholder]);
    setInput('');
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
    if (systemPrompt.trim()) {
      history.unshift({ role: 'system', content: systemPrompt.trim() });
    }

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, model, provider }),
        signal: ctrl.signal,
      });

      if (!res.body) throw new Error('No body');
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += dec.decode(value, { stream: true });
        const snap = accumulated;
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: snap, pending: false }
              : m
          )
        );
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: '[Error: no se pudo conectar]', pending: false }
              : m
          )
        );
      } else {
        // Aborted — mark as done
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, pending: false } : m
          )
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  function clearChat() {
    setMessages([]);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 overflow-hidden">

      {/* ── Top bar ── */}
      <header className="h-12 flex items-center gap-3 px-4 border-b border-zinc-800 shrink-0">
        <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <MessageSquare size={13} className="text-indigo-400" />
        </div>
        <span className="font-mono text-xs font-semibold tracking-wide text-zinc-300 hidden sm:block">
          CHAT IA
        </span>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

        {/* Provider toggle */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          {(['ollama', 'localai'] as Provider[]).map(p => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`flex items-center gap-1.5 h-6 px-2.5 rounded-md text-[10px] font-mono transition-all ${
                provider === p
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ModelIcon provider={p} />
              {p === 'ollama' ? 'Ollama' : 'LocalAI'}
            </button>
          ))}
        </div>

        {/* Model selector */}
        <div className="relative">
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-300 pl-2 pr-6 py-1.5 outline-none focus:border-indigo-500 transition-colors appearance-none"
          >
            {models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>

        {/* Status pill */}
        {online === null && (
          <div className="flex items-center gap-1">
            <Loader2 size={10} className="animate-spin text-zinc-500" />
            <span className="text-[10px] font-mono text-zinc-600">verificando...</span>
          </div>
        )}
        {online === true && (
          <div className="flex items-center gap-1.5">
            <Wifi size={10} className="text-green-500" />
            <span className="text-[10px] font-mono text-zinc-500">online</span>
          </div>
        )}
        {online === false && (
          <div className="flex items-center gap-1.5">
            <WifiOff size={10} className="text-red-400" />
            <span className="text-[10px] font-mono text-red-400">
              {provider === 'ollama' ? 'Ollama no encontrado' : 'LocalAI no encontrado'}
            </span>
          </div>
        )}

        <div className="flex-1" />

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 text-xs font-mono transition-colors"
          >
            <Trash2 size={11} />
            <span className="hidden sm:block">Limpiar</span>
          </button>
        )}

        <Link
          href="/command-center"
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 text-xs font-mono transition-colors"
        >
          <Bot size={11} />
          <span className="hidden sm:block">Comando</span>
        </Link>
      </header>

      {/* ── System prompt (collapsible) ── */}
      <div className="border-b border-zinc-800 shrink-0">
        <button
          onClick={() => setSysOpen(v => !v)}
          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-zinc-900/50 transition-colors group"
        >
          <Cpu size={11} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">
            SISTEMA
          </span>
          <span className="text-[10px] text-zinc-700 truncate flex-1 ml-1">
            {systemPrompt.slice(0, 80)}{systemPrompt.length > 80 ? '…' : ''}
          </span>
          <ChevronDown
            size={10}
            className={`text-zinc-600 transition-transform ${sysOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {sysOpen && (
          <div className="px-4 pb-3">
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              rows={3}
              placeholder="Instrucción de sistema opcional..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 placeholder-zinc-700 px-3 py-2 resize-none outline-none focus:border-indigo-500 transition-colors leading-relaxed font-mono"
            />
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <MessageSquare size={28} className="text-zinc-700" />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Chateá con {model}</p>
              <p className="text-xs text-zinc-600 mt-1">
                Corriendo en {provider === 'ollama' ? 'Ollama :11434' : 'LocalAI :8080'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-md">
              {[
                '¿Qué es el marketing de contenidos?',
                'Dame ideas para publicar en LinkedIn',
                'Explicame qué es el ROI',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 hover:border-indigo-500/40 hover:text-zinc-300 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <Bubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div className="border-t border-zinc-800 px-4 py-3 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={streaming}
            rows={1}
            placeholder={`Mensaje a ${model}… (Enter envía, Shift+Enter nueva línea)`}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-700 px-4 py-3 resize-none outline-none focus:border-indigo-500 transition-colors leading-relaxed disabled:opacity-50 max-h-40 overflow-y-auto"
            style={{ minHeight: '48px' }}
          />

          {streaming ? (
            <button
              onClick={stop}
              className="h-12 w-12 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-all active:scale-95 shrink-0"
              title="Detener generación"
            >
              <StopCircle size={16} />
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!input.trim() || online === false}
              className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-95 shrink-0"
              title="Enviar (Enter)"
            >
              <Send size={15} />
            </button>
          )}
        </div>

        {online === false && (
          <p className="text-[10px] text-zinc-600 mt-2 text-center">
            {provider === 'ollama'
              ? 'Iniciá Ollama: ollama serve'
              : 'Iniciá LocalAI en :8080'}
          </p>
        )}
      </div>
    </div>
  );
}
