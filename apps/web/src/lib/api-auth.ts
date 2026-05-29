import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export interface AuthPayload {
  userId: string;
  empireId: string;
  email?: string;
  username?: string;
}

export function verifyAuth(request: Request): AuthPayload {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = auth.slice(7);
  const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
  return decoded;
}

export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  if (error instanceof Error && error.message === 'Unauthorized') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (
    error instanceof Error &&
    error.message.includes('Unique constraint')
  ) {
    return NextResponse.json(
      { success: false, error: 'Conflict: duplicate entry' },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
