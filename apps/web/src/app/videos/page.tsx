'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Film, Loader, CheckCircle, AlertCircle, Play, RotateCcw, Wifi, WifiOff, Bot
} from 'lucide-react';
import Link from 'next/link';

const VOICES = [
  { id: 'es-AR-ElenaNeural', label: 'Elena — AR femenina' },
  { id: 'es-AR-TomasNeural', label: 'Tomás — AR masculino' },
  { id: 'es-ES-ElviraNeural', label: 'Elvira — ES femenina' },
  { id: 'es-MX-DaliaNeural', label: 'Dalia — MX femenina' },
  { id: 'es-MX-JorgeNeural', label: 'Jorge — MX masculino' },
];

const PLATFORMS = [
  { id: 'reels', label: 'Reels', sub: '9:16 · TikTok / IG', aspect: '9:16' },
  { id: 'youtube', label: 'YouTube', sub: '16:9 · horizontal', aspect: '16:9' },
  { id: 'story', label: 'Historia', sub: '9:16 · 24h', aspect: '9:16' },
];

const PROJECTS = [
  'trabajocerca.site', 'madsjeez.com.ar', 'mellimelos.site', 'bravura.site',
  'appjeezpro.com', 'materianatural.site', 'madsjeezdesign.com',
];

type Stage = 'idle' | 'submitting' | 'generating' | 'done' | 'error';

export default function VideosPage() {
  const [subject, setSubject] = useState('');
  const [platform, setPlatform] = useState('reels');
  const [voice, setVoice] = useState('es-AR-ElenaNeural');
  const [subtitles, setSubtitles] = useState(true);
  const [project, setProject] = useState('trabajocerca.site');
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mptOnline, setMptOnline] = useState<boolean | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/mpt/health')
      .then(r => r.json())
      .then(d => setMptOnline(d.ok === true))
      .catch(() => setMptOnline(false));
  }, []);

  useEffect(() => {
    if (stage !== 'generating' || !taskId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/mpt/tasks/${taskId}`);
        const data = await res.json();
        if (typeof data.progress === 'number') setProgress(data.progress);
        if (data.state === 3) {
          setStage('done');
          setProgress(100);
          clearInterval(pollRef.current!);
        } else if (data.state === 4) {
          setStage('error');
          setError(data.message || 'Error generando video en MPT');
          clearInterval(pollRef.current!);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(pollRef.current!);
  }, [stage, taskId]);

  async function generate() {
    if (!subject.trim()) return;
    setStage('submitting');
    setProgress(0);
    setError(null);
    setTaskId(null);

    const pl = PLATFORMS.find(p => p.id === platform)!;
    try {
      const res = await fetch('/api/mpt/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_subject: subject,
          video_aspect: pl.aspect,
          video_language: 'es',
          voice_name: voice,
          subtitle_enabled: subtitles,
          video_count: 1,
          video_clip_duration: 5,
          bgm_type: 'random',
          bgm_volume: 0.2,
          paragraph_number: 1,
        }),
      });
      const data = await res.json();
      if (data.task_id) {
        setTaskId(data.task_id);
        setStage('generating');
      } else {
        throw new Error(data.detail || data.error || 'MPT no devolvió task_id');
      }
    } catch (e: unknown) {
      setStage('error');
      setError(e instanceof Error ? e.message : 'Error de conexión con MPT');
    }
  }

  function reset() {
    if (pollRef.current) clearInterval(pollRef.current);
    setStage('idle');
    setProgress(0);
    setError(null);
    setTaskId(null);
  }

  const busy = stage === 'submitting' || stage === 'generating';

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 overflow-hidden">
      {/* Top bar */}
      <header className="h-12 flex items-center gap-3 px-4 border-b border-zinc-800 shrink-0">
        <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Film size={13} className="text-indigo-400" />
        </div>
        <span className="font-mono text-xs font-semibold tracking-wide text-zinc-300 hidden sm:block">
          GENERADOR DE VIDEOS
        </span>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

        {mptOnline === null && (
          <span className="text-[10px] font-mono text-zinc-600 animate-pulse">verificando MPT...</span>
        )}
        {mptOnline === true && (
          <div className="flex items-center gap-1.5">
            <Wifi size={11} className="text-green-500" />
            <span className="text-[10px] font-mono text-zinc-500">MPT :8090 online</span>
          </div>
        )}
        {mptOnline === false && (
          <div className="flex items-center gap-1.5">
            <WifiOff size={11} className="text-red-500" />
            <span className="text-[10px] font-mono text-red-400">MPT offline — corré python main.py</span>
          </div>
        )}

        <div className="flex-1" />

        <Link
          href="/command-center"
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-colors text-xs font-mono"
        >
          <Bot size={11} />
          <span className="hidden sm:block">Comando</span>
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Form */}
        <aside className="w-[340px] shrink-0 flex flex-col border-r border-zinc-800 overflow-y-auto p-5 gap-4">

          {/* Project */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1.5">
              Proyecto
            </label>
            <select
              value={project}
              onChange={e => setProject(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-300 px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
            >
              {PROJECTS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1.5">
              Tema del video
            </label>
            <textarea
              value={subject}
              onChange={e => setSubject(e.target.value)}
              rows={4}
              placeholder={`ej: 5 razones para usar ${project} para buscar trabajo`}
              disabled={busy}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-700 px-3 py-2.5 resize-none outline-none focus:border-indigo-500 transition-colors leading-relaxed disabled:opacity-50"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1.5">
              Plataforma
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  disabled={busy}
                  className={`flex flex-col items-center gap-0.5 py-3 rounded-lg border text-center transition-all duration-150 disabled:opacity-50 ${
                    platform === p.id
                      ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  <span className="text-xs font-medium">{p.label}</span>
                  <span className="text-[9px] font-mono text-zinc-600">{p.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1.5">
              Voz
            </label>
            <select
              value={voice}
              onChange={e => setVoice(e.target.value)}
              disabled={busy}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-300 px-3 py-2 outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            >
              {VOICES.map(v => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Subtitles toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-zinc-400">Subtítulos en el video</span>
            <button
              onClick={() => setSubtitles(v => !v)}
              disabled={busy}
              className={`w-9 h-5 rounded-full border relative transition-all duration-200 disabled:opacity-50 ${
                subtitles ? 'bg-indigo-600 border-indigo-500' : 'bg-zinc-800 border-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                  subtitles ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={!subject.trim() || busy || mptOnline === false}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] mt-1"
          >
            {busy ? (
              <><Loader size={14} className="animate-spin" />Generando...</>
            ) : (
              <><Film size={14} />Generar video</>
            )}
          </button>

          {mptOnline === false && (
            <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
              Iniciá MoneyPrinterTurbo en tu PC:<br />
              <code className="text-zinc-500">cd C:\dev\MoneyPrinterTurbo && python main.py</code>
            </p>
          )}
        </aside>

        {/* Status / output */}
        <main className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          {stage === 'idle' && (
            <div className="flex flex-col items-center gap-4 text-center max-w-xs">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Film size={32} className="text-zinc-700" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-medium">Listo para generar</p>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Completá el formulario con el tema del video y hacé clic en Generar.
                </p>
              </div>
            </div>
          )}

          {(stage === 'submitting' || stage === 'generating') && (
            <div className="w-full max-w-md flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Loader size={18} className="text-indigo-400 animate-spin shrink-0" />
                <div>
                  <p className="text-sm text-zinc-200 font-medium">
                    {stage === 'submitting' ? 'Enviando tarea a MPT...' : 'Generando video'}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {stage === 'generating' ? `${progress}% completado` : 'conectando con localhost:8090'}
                  </p>
                </div>
              </div>

              {stage === 'generating' && (
                <>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(4, progress)}%` }}
                    />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-500 leading-relaxed font-mono">
                    <p>task_id: <span className="text-zinc-400">{taskId}</span></p>
                    <p className="mt-1">plataforma: <span className="text-zinc-400">{PLATFORMS.find(p => p.id === platform)?.aspect}</span></p>
                    <p className="mt-1">voz: <span className="text-zinc-400">{voice}</span></p>
                    <p className="mt-2 text-zinc-600">MPT puede tardar 2-8 min según el tema...</p>
                  </div>
                </>
              )}
            </div>
          )}

          {stage === 'done' && (
            <div className="flex flex-col items-center gap-5 text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-100">Video generado</p>
                <p className="text-xs text-zinc-500 mt-1">Task ID: <span className="font-mono">{taskId}</span></p>
              </div>
              <a
                href="http://localhost:8090"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all active:scale-[0.98]"
              >
                <Play size={14} />
                Ver y descargar en MPT
              </a>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <RotateCcw size={11} />
                Generar otro
              </button>
            </div>
          )}

          {stage === 'error' && (
            <div className="flex flex-col items-center gap-4 text-center max-w-xs">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle size={28} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-300">Error de generación</p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{error}</p>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-xs hover:bg-zinc-800 transition-all"
              >
                <RotateCcw size={11} />
                Reintentar
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
