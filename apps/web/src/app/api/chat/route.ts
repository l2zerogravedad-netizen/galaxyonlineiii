import { NextResponse } from 'next/server';
import { verifyAuth, handleApiError } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

// ============================================================
// GET /api/chat — Mensajes de chat (global o de alianza), persistidos en DB.
// POST /api/chat — Enviar mensaje (persistido).
// Backed by the ChatMessage Prisma model (tabla chat_messages). Si la tabla aún no
// existe (primer deploy antes del db push), cae a un buffer en memoria para no romper.
// ============================================================

interface ChatMsg {
  id: string;
  userId: string;
  username: string;
  empireName: string;
  room: string;
  message: string;
  createdAt: string;
}

// Fallback en memoria (solo se usa si la tabla todavía no fue creada).
const memBuffer: ChatMsg[] = [];
const MEM_MAX = 500;

function sanitize(text: string): string {
  return text.replace(/[<>]/g, '').slice(0, 500).trim();
}

export async function GET(request: Request) {
  try {
    verifyAuth(request);
    const room = new URL(request.url).searchParams.get('room') || 'global';
    try {
      const rows = await prisma.chatMessage.findMany({
        where: { room },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      const data = rows
        .reverse()
        .map((m) => ({
          id: m.id,
          userId: m.userId,
          username: m.username,
          empireName: m.empireName,
          room: m.room,
          message: m.message,
          createdAt: m.createdAt.toISOString(),
        }));
      return NextResponse.json({ success: true, data });
    } catch {
      // Tabla aún no creada → usar buffer en memoria.
      const data = memBuffer.filter((m) => m.room === room).slice(-50);
      return NextResponse.json({ success: true, data });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const body = (await request.json()) as { message?: string; room?: string };
    const text = sanitize(body.message ?? '');
    if (!text) {
      return NextResponse.json({ success: false, error: 'Mensaje vacío' }, { status: 400 });
    }
    const room = body.room || new URL(request.url).searchParams.get('room') || 'global';
    const username = user.username ?? 'Comandante';

    try {
      const saved = await prisma.chatMessage.create({
        data: { userId: user.userId, username, empireName: username, room, message: text },
      });
      return NextResponse.json({
        success: true,
        data: {
          id: saved.id,
          userId: saved.userId,
          username: saved.username,
          empireName: saved.empireName,
          room: saved.room,
          message: saved.message,
          createdAt: saved.createdAt.toISOString(),
        },
      });
    } catch {
      // Tabla aún no creada → guardar en memoria.
      const msg: ChatMsg = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: user.userId,
        username,
        empireName: username,
        room,
        message: text,
        createdAt: new Date().toISOString(),
      };
      memBuffer.push(msg);
      if (memBuffer.length > MEM_MAX) memBuffer.splice(0, memBuffer.length - MEM_MAX);
      return NextResponse.json({ success: true, data: msg });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
