// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo_db';
import { User } from '@/models/user';
import { generateToken } from '@/lib/auth';
import { hashPassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { name, email, password } = await request.json();
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }
        const hashedPassword = await hashPassword(password)
        // Create user
        const user = await User.create({ name, email, password: hashedPassword });
        const token = generateToken(user);

        return NextResponse.json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}