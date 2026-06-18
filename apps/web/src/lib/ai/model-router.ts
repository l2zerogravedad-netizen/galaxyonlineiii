export type TaskDomain = 'marketing' | 'code' | 'seo' | 'video' | 'design' | 'analysis' | 'fast' | 'vision' | 'general';

interface ModelConfig {
  name: string;
  provider: 'localai' | 'ollama';
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
}

export function getModelForDomain(domain: TaskDomain): string {
  const env = (k: string, d: string) => process.env[k] ?? d;
  switch (domain) {
    case 'code':    return env('DEFAULT_CODE_MODEL',    'qwen2.5-coder:7b');
    case 'fast':    return env('DEFAULT_FAST_MODEL',    'qwen2.5:3b');
    case 'vision':  return env('DEFAULT_VISION_MODEL',  'qwen2.5-vl:7b');
    default:        return env('DEFAULT_MARKETING_MODEL', 'qwen2.5:7b');
  }
}

export function detectDomain(text: string): TaskDomain {
  const t = text.toLowerCase();
  if (/\b(código|code|bug|fix|función|component|api|typescript|javascript|python|sql|prisma|supabase)\b/.test(t)) return 'code';
  if (/\b(imagen|foto|screenshot|analiza.*imagen|visión)\b/.test(t)) return 'vision';
  if (/\b(seo|keyword|posicionamiento|meta|heading|ranking)\b/.test(t)) return 'seo';
  if (/\b(video|guion|script|reels|tiktok|shorts|gancho)\b/.test(t)) return 'video';
  if (/\b(diseño|landing|componente|ui|ux|tailwind|css|layout)\b/.test(t)) return 'design';
  if (/\b(análisis|métrica|dato|reporte|estadística|conversión|tráfico)\b/.test(t)) return 'analysis';
  if (/\b(rápido|resumí|resumir|listar|dame|solo)\b/.test(t)) return 'fast';
  return 'marketing';
}

export interface AICallOptions {
  model?: string;
  provider?: 'localai' | 'ollama' | 'auto';
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  timeoutMs?: number;
}

export interface AICallResult {
  content: string;
  model: string;
  provider: string;
  latencyMs: number;
}

const LOCALAI_BASE = process.env.LOCALAI_BASE_URL ?? 'http://localhost:8080/v1';
const OLLAMA_BASE  = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/$/, '') + '/v1';

async function callProvider(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  opts: AICallOptions,
): Promise<string> {
  const body = JSON.stringify({
    model,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 1200,
    stream: false,
  });

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body,
    signal: AbortSignal.timeout(opts.timeoutMs ?? 60000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? '';
}

export async function routedCall(
  messages: { role: string; content: string }[],
  opts: AICallOptions & { domain?: TaskDomain } = {},
): Promise<AICallResult> {
  const domain = opts.domain ?? 'marketing';
  const model = opts.model ?? getModelForDomain(domain);
  const t0 = Date.now();

  const localKey = process.env.LOCALAI_API_KEY ?? '';

  // Try LocalAI first (unless explicitly ollama)
  if (opts.provider !== 'ollama') {
    try {
      const content = await callProvider(LOCALAI_BASE, localKey, model, messages, opts);
      return { content, model, provider: 'localai', latencyMs: Date.now() - t0 };
    } catch {
      if (opts.provider === 'localai') throw new Error('LocalAI no disponible');
    }
  }

  // Fallback: Ollama
  const ollamaModel = model.includes(':') ? model : `${model}:latest`;
  const content = await callProvider(OLLAMA_BASE, 'ollama', ollamaModel, messages, opts);
  return { content, model: ollamaModel, provider: 'ollama', latencyMs: Date.now() - t0 };
}
