'use client';

import { useState, useRef } from 'react';
import {
  Film, Sparkles, Send, RotateCcw, Loader2, CheckCircle,
  Copy, ChevronDown, Zap, FileText, Eye, Clock,
  Play, Hash, MessageSquare, Bot, WifiOff, Wifi,
} from 'lucide-react';
import Link from 'next/link';
import { PROJECT_IDS, getProject } from '@/lib/projects/config';
import type { VideoScript, VideoPrompt } from '@/lib/tools/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = 'idle' | 'generating_script' | 'script_ready' | 'generating_prompt' | 'ready';

const VIDEO_TYPES = [
  'Comercial directo', 'Problema-solución', 'Gancho viral', 'Lista rápida',
  'Historia corta', 'Tutorial express', 'Emocional', 'CTA fuerte',
  'Captar vendedores', 'Captar compradores', 'Informativo', 'Institucional',
];

const PLATFORMS = [
  { id: 'reels', label: 'Reels', sub: 'IG / FB' },
  { id: 'tiktok', label: 'TikTok', sub: 'TikTok' },
  { id: 'youtube', label: 'Shorts', sub: 'YouTube' },
  { id: 'historia', label: 'Historia', sub: 'Stories' },
];

const DURATIONS = [15, 20, 30] as const;

const TONES = [
  'dinámico y directo', 'cercano y amigable', 'profesional', 'emocional',
  'urgente y persuasivo', 'informativo', 'humorístico', 'inspiracional',
];

const EXAMPLE_OBJECTIVES: Record<string, string[]> = {
  'bravura.site': ['Mostrar las empanadas más ricas del barrio', 'Captar pedidos para el fin de semana', 'Video de reunión familiar con empanadas'],
  'madsjeez.com.ar': ['Captar vendedores nuevos', 'Mostrar beneficios de vender online', 'Historias de vendedores exitosos'],
  'trabajocerca.site': ['Ayudar a encontrar trabajo en tu zona', 'Publicar aviso laboral gratis', 'Los oficios más buscados'],
  'mellimelos.site': ['Ropa de bebé más linda de la temporada', 'El regalo perfecto para baby shower', 'Nueva colección de prendas'],
  'appjeezpro.com': ['Organizar ventas en MercadoLibre fácil', 'Automatizar tu tienda online', 'Por qué los mejores sellers usan AppJeez'],
  'materianatural.site': ['Propiedades del jengibre según la tradición', 'Hábitos saludables para empezar el día', 'Plantas aromáticas para el hogar'],
  'madsjeezdesign.com': ['Web profesional para tu empresa', 'Automatizaciones que ahorran tiempo', 'Por qué tu negocio necesita una app'],
  'appjeezpro.store': ['Repuesto esencial para tu desmalezadora', 'Mantenimiento preventivo para máquinas', 'Encontrá tu repuesto en el catálogo'],
};

// ─── Utils ────────────────────────────────────────────────────────────────────

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SceneCard({ scene, idx }: { scene: { duration: string; visual: string; voiceover: string; text?: string }; idx: number }) {
  return (
    <div className="border border-zinc-800 rounded-xl p-4 space-y-2 bg-zinc-900/40">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Escena {idx + 1}</span>
        <span className="text-[10px] font-mono text-zinc-600">{scene.duration}</span>
      </div>
      {scene.visual && (
        <div>
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Visual</span>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{scene.visual}</p>
        </div>
      )}
      {scene.voiceover && (
        <div>
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Voz en off</span>
          <p className="text-xs text-zinc-200 mt-0.5 leading-relaxed">{scene.voiceover}</p>
        </div>
      )}
      {scene.text && (
        <div className="flex items-start gap-2 mt-1">
          <span className="text-[9px] font-mono text-amber-500/80 uppercase tracking-widest shrink-0">Pantalla</span>
          <p className="text-xs text-amber-400">{scene.text}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VideoStudioPage() {
  const [project, setProject] = useState('bravura.site');
  const [objective, setObjective] = useState('');
  const [duration, setDuration] = useState<15 | 20 | 30>(20);
  const [platform, setPlatform] = useState('reels');
  const [videoType, setVideoType] = useState('Gancho viral');
  const [tone, setTone] = useState('dinámico y directo');
  const [stage, setStage] = useState<Stage>('idle');
  const [script, setScript] = useState<VideoScript | null>(null);
  const [prompt, setPrompt] = useState<VideoPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{ model: string; provider: string } | null>(null);
  const [history, setHistory] = useState<VideoScript[]>([]);
  const [activeTab, setActiveTab] = useState<'script' | 'prompt' | 'publish'>('script');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const proj = getProject(project);
  const suggestions = EXAMPLE_OBJECTIVES[project] ?? [];

  function handleCopy(key: string, text: string) {
    copyText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  async function generateScript() {
    if (!objective.trim()) return;
    setStage('generating_script');
    setScript(null);
    setPrompt(null);
    setError(null);
    setActiveTab('script');

    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'generate_script',
          input: { project, objective, duration, platform, tone, videoType },
        }),
      });
      const data = await res.json() as { ok: boolean; data?: VideoScript; error?: string; model?: string; provider?: string };
      if (!data.ok || !data.data) throw new Error(data.error ?? 'Error generando guion');
      setScript(data.data);
      setModelInfo({ model: data.model ?? '—', provider: data.provider ?? '—' });
      setHistory(h => [data.data!, ...h.slice(0, 9)]);
      setStage('script_ready');
    } catch (e) {
      setError((e as Error).message);
      setStage('idle');
    }
  }

  async function generatePrompt() {
    if (!script) return;
    setStage('generating_prompt');
    setActiveTab('prompt');

    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'generate_video_prompt',
          input: { project, script, visualStyle: tone },
        }),
      });
      const data = await res.json() as { ok: boolean; data?: VideoPrompt; error?: string };
      if (!data.ok || !data.data) throw new Error(data.error ?? 'Error generando prompt');
      setPrompt(data.data);
      setStage('ready');
    } catch (e) {
      setError((e as Error).message);
      setStage('script_ready');
    }
  }

  function reset() {
    setStage('idle');
    setScript(null);
    setPrompt(null);
    setError(null);
    setObjective('');
  }

  const isWorking = stage === 'generating_script' || stage === 'generating_prompt';

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 overflow-hidden">

      {/* ── Header ── */}
      <header className="h-12 flex items-center gap-3 px-4 border-b border-zinc-800 shrink-0">
        <div className="w-6 h-6 rounded-md bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
          <Film size={13} className="text-pink-400" />
        </div>
        <span className="font-mono text-xs font-semibold tracking-wide text-zinc-300 hidden sm:block">
          VIDEO STUDIO
        </span>
        <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

        {/* Project pill */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-600">proyecto</span>
          <div className="relative">
            <select
              value={project}
              onChange={e => { setProject(e.target.value); setObjective(''); reset(); }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-300 pl-2.5 pr-7 py-1.5 outline-none focus:border-indigo-500 transition-colors appearance-none"
            >
              {PROJECT_IDS.map(id => (
                <option key={id} value={id}>{getProject(id)?.name ?? id}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {modelInfo && (
          <div className="flex items-center gap-1.5">
            <Wifi size={10} className="text-green-500" />
            <span className="text-[10px] font-mono text-zinc-500">{modelInfo.provider} · {modelInfo.model}</span>
          </div>
        )}

        <div className="flex-1" />
        <Link href="/command-center" className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 text-xs font-mono transition-colors">
          <Bot size={11} />
          <span className="hidden sm:block">Comando</span>
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel: Controls ── */}
        <aside className="w-[300px] xl:w-[320px] shrink-0 border-r border-zinc-800 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-4">

            {/* Project context badge */}
            {proj && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1">Proyecto activo</p>
                <p className="text-xs font-semibold text-zinc-200">{proj.name}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{proj.description}</p>
                <p className="text-[10px] text-zinc-600 mt-1.5 italic">Tono: {proj.tone}</p>
              </div>
            )}

            {/* Objective */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1.5">
                Objetivo del video
              </label>
              <textarea
                value={objective}
                onChange={e => setObjective(e.target.value)}
                disabled={isWorking}
                rows={3}
                placeholder="ej: Mostrar empanadas caseras para el fin de semana..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder-zinc-700 px-3 py-2.5 resize-none outline-none focus:border-indigo-500 transition-colors leading-relaxed disabled:opacity-50"
              />
              {suggestions.length > 0 && !objective && (
                <div className="mt-2 flex flex-col gap-1">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => setObjective(s)}
                      className="text-left text-[11px] text-zinc-600 hover:text-zinc-300 px-2 py-1 rounded-lg hover:bg-zinc-900 transition-colors truncate"
                    >
                      → {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1.5">Duración</label>
              <div className="flex gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-2.5 rounded-lg border text-xs font-mono transition-all ${
                      duration === d
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1.5">Plataforma</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`py-2.5 rounded-lg border text-center transition-all ${
                      platform === p.id
                        ? 'bg-pink-500/15 border-pink-500/40 text-pink-300'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-medium">{p.label}</div>
                    <div className="text-[9px] font-mono text-zinc-600">{p.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Video type */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1.5">Tipo</label>
              <div className="relative">
                <select
                  value={videoType}
                  onChange={e => setVideoType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 px-3 py-2 outline-none focus:border-indigo-500 appearance-none"
                >
                  {VIDEO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1.5">Tono</label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 px-3 py-2 outline-none focus:border-indigo-500 appearance-none"
                >
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* CTA rules for materianatural */}
            {project === 'materianatural.site' && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1">⚠ Reglas especiales</p>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  Sin promesas médicas. Solo usos tradicionales e informativos. Sin diagnósticos.
                </p>
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={generateScript}
              disabled={!objective.trim() || isWorking}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {stage === 'generating_script' ? (
                <><Loader2 size={14} className="animate-spin" />Generando guion...</>
              ) : (
                <><Sparkles size={14} />Generar guion</>
              )}
            </button>

            {script && stage !== 'generating_prompt' && (
              <button
                onClick={generatePrompt}
                disabled={stage === 'generating_prompt'}
                className="w-full h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {stage === 'generating_prompt' ? (
                  <><Loader2 size={14} className="animate-spin" />Generando prompt...</>
                ) : (
                  <><Zap size={14} />Generar prompt MPT</>
                )}
              </button>
            )}

            {(stage === 'script_ready' || stage === 'ready') && (
              <button
                onClick={reset}
                className="w-full h-9 rounded-xl border border-zinc-800 text-zinc-600 hover:text-zinc-400 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw size={11} />Nuevo video
              </button>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs text-red-400 leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="border-t border-zinc-800 p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">
                <Clock size={9} className="inline mr-1" />Historial
              </p>
              <div className="space-y-2">
                {history.slice(0, 5).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setScript(s); setStage('script_ready'); setActiveTab('script'); }}
                    className="w-full text-left px-3 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 transition-colors"
                  >
                    <p className="text-[11px] text-zinc-300 truncate">{s.hook}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">{s.project} · {s.duration}s</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Main: Output ── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Empty state */}
          {stage === 'idle' && !script && (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Film size={32} className="text-zinc-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300">Video Studio listo</p>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed max-w-xs">
                  Completá el formulario, elegí un objetivo y generá tu guion con IA local.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-sm text-left mt-2">
                {[
                  { icon: <Sparkles size={11} />, text: 'Guion por escenas' },
                  { icon: <MessageSquare size={11} />, text: 'Voz en off lista' },
                  { icon: <Hash size={11} />, text: 'Hashtags incluidos' },
                  { icon: <Zap size={11} />, text: 'Prompt para MPT' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-500">
                    <span className="text-indigo-400">{f.icon}</span>{f.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {isWorking && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Loader2 size={24} className="text-indigo-400 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-200">
                  {stage === 'generating_script' ? 'Generando guion...' : 'Generando prompt visual...'}
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  {stage === 'generating_script' ? `${videoType} · ${duration}s · ${platform}` : 'Preparando para MoneyPrinterTurbo'}
                </p>
              </div>
            </div>
          )}

          {/* Script output */}
          {script && !isWorking && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Tabs */}
              <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-zinc-800 shrink-0">
                {([
                  { id: 'script', label: 'Guion', icon: <FileText size={11} /> },
                  { id: 'prompt', label: 'Prompt MPT', icon: <Zap size={11} />, disabled: !prompt },
                  { id: 'publish', label: 'Publicar', icon: <Send size={11} /> },
                ] as { id: 'script' | 'prompt' | 'publish'; label: string; icon: React.ReactNode; disabled?: boolean }[]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-lg text-xs font-mono transition-all border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                        : tab.disabled
                        ? 'border-transparent text-zinc-700 cursor-not-allowed'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab.icon}{tab.label}
                    {tab.id === 'prompt' && !prompt && stage !== 'generating_prompt' && (
                      <span className="text-[9px] text-zinc-700">→ generar</span>
                    )}
                  </button>
                ))}
                <div className="flex-1" />
                <div className="flex items-center gap-1.5 pb-2">
                  <span className="text-[10px] font-mono text-zinc-600">{script.duration}s · {script.platform}</span>
                  {modelInfo && <span className="text-[10px] font-mono text-zinc-700">· {modelInfo.provider}</span>}
                </div>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'script' && (
                  <>
                    {/* Hook */}
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">Gancho (0-3s)</span>
                        <button onClick={() => handleCopy('hook', script.hook)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                          {copiedKey === 'hook' ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-zinc-100 leading-relaxed">{script.hook}</p>
                    </div>

                    {/* Scenes */}
                    {script.scenes?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Escenas</p>
                        <div className="space-y-2">
                          {script.scenes.map((scene, i) => (
                            <SceneCard key={i} scene={scene} idx={i} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Voiceover */}
                    {script.voiceover && (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Voz en off completa</span>
                          <button onClick={() => handleCopy('vo', script.voiceover)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                            {copiedKey === 'vo' ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{script.voiceover}</p>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="rounded-xl border border-green-500/25 bg-green-500/5 p-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-green-400 block mb-1">CTA final</span>
                      <p className="text-sm font-medium text-zinc-200">{script.cta}</p>
                    </div>
                  </>
                )}

                {activeTab === 'prompt' && prompt && (
                  <>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Prompt para MoneyPrinterTurbo</span>
                        <button onClick={() => handleCopy('mpt', prompt.mptPrompt)} className="text-zinc-600 hover:text-zinc-300">
                          {copiedKey === 'mpt' ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">{prompt.mptPrompt}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-zinc-800 p-3">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">Voz sugerida</span>
                        <p className="text-xs text-zinc-300">{prompt.voiceSuggested}</p>
                      </div>
                      <div className="rounded-xl border border-zinc-800 p-3">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">Música</span>
                        <p className="text-xs text-zinc-300">{prompt.musicSuggested}</p>
                      </div>
                    </div>
                    {prompt.visualNotes && (
                      <div className="rounded-xl border border-zinc-800 p-3">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">Notas visuales</span>
                        <p className="text-xs text-zinc-300 leading-relaxed">{prompt.visualNotes}</p>
                      </div>
                    )}
                    <Link
                      href="/videos"
                      className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium transition-all active:scale-[0.98]"
                    >
                      <Play size={14} />Enviar a MoneyPrinterTurbo
                    </Link>
                  </>
                )}

                {activeTab === 'publish' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Descripción para publicar</span>
                        <button onClick={() => handleCopy('desc', script.description ?? '')} className="text-zinc-600 hover:text-zinc-300">
                          {copiedKey === 'desc' ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">{script.description}</p>
                    </div>
                    {script.hashtags?.length > 0 && (
                      <div className="rounded-xl border border-zinc-800 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Hashtags</span>
                          <button onClick={() => handleCopy('tags', (script.hashtags ?? []).join(' '))} className="text-zinc-600 hover:text-zinc-300">
                            {copiedKey === 'tags' ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {script.hashtags.map(tag => (
                            <span key={tag} className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {script.onScreenText?.length > 0 && (
                      <div className="rounded-xl border border-zinc-800 p-4">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 block mb-2">Textos en pantalla</span>
                        <div className="space-y-1.5">
                          {script.onScreenText.map((t, i) => (
                            <div key={i} className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-1.5">{t}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {script.fileName && (
                      <div className="rounded-xl border border-zinc-800 p-3">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 block mb-1">Nombre de archivo</span>
                        <code className="text-xs text-zinc-400 font-mono">{script.fileName}.mp4</code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
