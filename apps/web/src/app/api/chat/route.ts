import { NextResponse } from 'next/server';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  username: string;
  empireId?: string;
  message: string;
  timestamp: string;
  type: 'global' | 'alliance' | 'system';
}

interface ChatPostBody {
  message: string;
  type?: 'global' | 'alliance';
  allianceId?: string;
}

// ─── In-memory store (reemplazar por Redis en producción) ─────────────────────

const MAX_MESSAGES = 500;
const globalMessages: ChatMessage[] = [
  // Mensajes de bienvenida pre-cargados
  {
    id: 'sys_001',
    username: 'Sistema',
    message: 'Bienvenido al chat galáctico de Galaxy Online 3. ¡Comunícate con otros comandantes!',
    timestamp: new Date(Date.now() - 86_400_000).toISOString(),
    type: 'system',
  },
  {
    id: 'sys_002',
    username: 'Sistema',
    message: 'Consejo: Explora sectores cercanos antes de colonizar. Algunos sistemas están defendidos por IA hostil.',
    timestamp: new Date(Date.now() - 43_200_000).toISOString(),
    type: 'system',
  },
];

// Mapa por alianza (room isolation)
const allianceMessages = new Map<string, ChatMessage[]>();

// ─── Helper: sanitizar mensaje ────────────────────────────────────────────────

function sanitizeMessage(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // strip HTML tags attempt
    .slice(0, 500);        // hard limit 500 chars
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── GET: Obtener mensajes del chat ──────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
    const type = (searchParams.get('type') ?? 'global') as ChatMessage['type'];
    const allianceId = searchParams.get('allianceId');

    // ── Chat de alianza ─────────────────────────────────────────────────────
    if (type === 'alliance') {
      if (!allianceId && !user.allianceId) {
        return NextResponse.json(
          { success: false, error: 'No perteneces a ninguna alianza' },
          { status: 403 }
        );
      }
      const roomId = allianceId ?? user.allianceId ?? 'unknown';
      const messages = allianceMessages.get(roomId) ?? [];
      return NextResponse.json({
        success: true,
        data: messages.slice(-limit),
        meta: { type: 'alliance', roomId, count: messages.length },
      });
    }

    // ── Chat global ─────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      data: globalMessages.slice(-limit),
      meta: { type: 'global', count: globalMessages.length },
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// ─── POST: Enviar mensaje ────────────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);
    const body = (await request.json()) as ChatPostBody;

    const rawMessage = body.message?.trim();
    if (!rawMessage) {
      return NextResponse.json(
        { success: false, error: 'El mensaje no puede estar vacío' },
        { status: 400 }
      );
    }

    const cleanMessage = sanitizeMessage(rawMessage);
    if (cleanMessage.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Mensaje inválido después de sanitizar' },
        { status: 400 }
      );
    }

    const msgType = body.type ?? 'global';

    // ── Validar alianza ─────────────────────────────────────────────────────
    if (msgType === 'alliance') {
      if (!user.allianceId && !body.allianceId) {
        return NextResponse.json(
          { success: false, error: 'Se requiere allianceId para chat de alianza' },
          { status: 403 }
        );
      }
    }

    const msg: ChatMessage = {
      id: generateId(),
      username: user.username ?? 'Unknown',
      empireId: user.empireId,
      message: cleanMessage,
      timestamp: new Date().toISOString(),
      type: msgType,
    };

    // ── Guardar en el store correspondiente ─────────────────────────────────
    if (msgType === 'alliance') {
      const roomId = body.allianceId ?? user.allianceId ?? 'unknown';
      const room = allianceMessages.get(roomId) ?? [];
      room.push(msg);
      // Trim
      while (room.length > MAX_MESSAGES) room.shift();
      allianceMessages.set(roomId, room);
    } else {
      globalMessages.push(msg);
      // Mantener solo últimos 500
      while (globalMessages.length > MAX_MESSAGES) globalMessages.shift();
    }

    return NextResponse.json({
      success: true,
      data: msg,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
