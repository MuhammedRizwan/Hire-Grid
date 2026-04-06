// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo_db';
import { User } from '@/models/user';
import { generateToken } from '@/lib/auth';
import { comparePassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check password
    const isValid = await comparePassword(password,user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const token = generateToken(user);
    
    return NextResponse.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}