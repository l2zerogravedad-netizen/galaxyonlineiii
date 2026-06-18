import { NextRequest } from 'next/server';

const OLLAMA = 'http://localhost:11434';
const LOCALAI = 'http://localhost:8080';

export async function POST(req: NextRequest) {
  const { messages, model, provider } = await req.json() as {
    messages: { role: string; content: string }[];
    model: string;
    provider: 'ollama' | 'localai';
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (text: string) => controller.enqueue(encoder.encode(text));
      try {
        if (provider === 'ollama') {
          const res = await fetch(`${OLLAMA}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages, stream: true }),
            signal: AbortSignal.timeout(180000),
          });
          if (!res.ok || !res.body) throw new Error(`Ollama ${res.status}`);
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const line of dec.decode(value).split('\n').filter(Boolean)) {
              try {
                const d = JSON.parse(line);
                if (d.message?.content) send(d.message.content);
              } catch {}
            }
          }
        } else {
          // LocalAI — OpenAI-compatible SSE
          const res = await fetch(`${LOCALAI}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages, stream: true, temperature: 0.7 }),
            signal: AbortSignal.timeout(180000),
          });
          if (!res.ok || !res.body) throw new Error(`LocalAI ${res.status}`);
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          let buf = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const raw = line.slice(6).trim();
              if (raw === '[DONE]') continue;
              try {
                const d = JSON.parse(raw);
                const c = d.choices?.[0]?.delta?.content;
                if (c) send(c);
              } catch {}
            }
          }
        }
      } catch (e) {
        send(`\n\n[Error: ${e instanceof Error ? e.message : 'Sin conexión'}]`);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}

export async function GET(req: NextRequest) {
  const provider = new URL(req.url).searchParams.get('provider') ?? 'ollama';
  try {
    if (provider === 'ollama') {
      const res = await fetch(`${OLLAMA}/api/tags`, { signal: AbortSignal.timeout(3000) });
      const data = await res.json() as { models?: { name: string }[] };
      return Response.json({ ok: true, models: data.models?.map(m => m.name) ?? [] });
    } else {
      const res = await fetch(`${LOCALAI}/v1/models`, { signal: AbortSignal.timeout(3000) });
      const data = await res.json() as { data?: { id: string }[] };
      return Response.json({ ok: true, models: data.data?.map(m => m.id) ?? [] });
    }
  } catch {
    return Response.json({ ok: false, models: [] });
  }
}
