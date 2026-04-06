// lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from './mongo_db';
import { IUser } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return user;
}