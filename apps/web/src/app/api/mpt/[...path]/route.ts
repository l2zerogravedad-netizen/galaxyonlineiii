import { NextRequest, NextResponse } from 'next/server';

const MPT = process.env.MPT_URL ?? 'http://localhost:8090';

type Params = Promise<{ path: string[] }> | { path: string[] };

async function resolveParams(p: Params) {
  return (p instanceof Promise ? await p : p) as { path: string[] };
}

async function proxy(path: string[], method: string, body?: unknown) {
  // Health check special case
  if (path[0] === 'health') {
    try {
      await fetch(MPT, { signal: AbortSignal.timeout(3000), method: 'HEAD' });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
  }

  const url = `${MPT}/api/v1/${path.join('/')}`;
  try {
    const init: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000),
    };
    if (body !== undefined) init.body = JSON.stringify(body);
    const res = await fetch(url, init);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'MPT offline' }, { status: 503 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { path } = await resolveParams(params);
  return proxy(path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { path } = await resolveParams(params);
  const body = await req.json().catch(() => ({}));
  return proxy(path, 'POST', body);
}
