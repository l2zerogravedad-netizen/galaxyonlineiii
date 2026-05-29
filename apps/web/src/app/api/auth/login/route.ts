import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: { empire: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Credenciales invalidas' }, { status: 401 });
    }

    // Verificar password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Credenciales invalidas' }, { status: 401 });
    }

    // Actualizar last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const empireId = user.empire?.id ?? '';
    const token = jwt.sign(
      { userId: user.id, empireId, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, username: user.username },
        empire: user.empire ? { id: user.empire.id, name: user.empire.name } : null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Error al iniciar sesion' }, { status: 500 });
  }
}
