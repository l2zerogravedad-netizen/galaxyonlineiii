import { NextRequest, NextResponse } from 'next/server';

const LOCALAI_URL = 'http://localhost:8080';
const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'qwen2.5:7b';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function tryLocalAI(messages: AIMessage[]): Promise<string | null> {
  try {
    const res = await fetch(`${LOCALAI_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 600,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

async function tryOllama(messages: AIMessage[]): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.message?.content ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: AIMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const localAI = await tryLocalAI(messages);
    if (localAI) {
      return NextResponse.json({ content: localAI, model: 'localai' });
    }

    const ollama = await tryOllama(messages);
    if (ollama) {
      return NextResponse.json({ content: ollama, model: 'ollama' });
    }

    return NextResponse.json({ content: null, model: 'none' });
  } catch (err) {
    console.error('[command-center/ai]', err);
    return NextResponse.json({ content: null, model: 'error' });
  }
}
