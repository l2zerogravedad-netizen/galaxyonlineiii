'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { PROJECTS } from '@/lib/agents/agents';
import { useCommandCenter } from '@/lib/tasks/taskStore';

export function ProjectSelector() {
  const { selectedProject, setSelectedProject } = useCommandCenter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = PROJECTS.find((p) => p.id === selectedProject) ?? PROJECTS[0];

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-8 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm hover:bg-zinc-700 transition-colors duration-150 min-w-[180px]"
      >
        <Globe size={13} className="text-zinc-400 shrink-0" />
        <span className="font-medium truncate flex-1 text-left">{current.name}</span>
        <span className="text-zinc-500 text-xs truncate hidden sm:block">{current.url}</span>
        <ChevronDown
          size={13}
          className={`text-zinc-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/50 z-50 overflow-hidden">
          <div className="p-1.5">
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProject(p.id);
                  setOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-md text-left text-sm transition-colors duration-100 ${
                  p.id === selectedProject
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <div className="mt-0.5 w-5 h-5 rounded bg-zinc-700 flex items-center justify-center shrink-0">
                  <Globe size={10} className="text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-zinc-200 truncate">{p.name}</div>
                  <div className="text-xs text-zinc-500 truncate">{p.url}</div>
                </div>
                {p.id === selectedProject && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
