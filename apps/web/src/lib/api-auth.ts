import jwt from 'jsonwebtoken';

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
