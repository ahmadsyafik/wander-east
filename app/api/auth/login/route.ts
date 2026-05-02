import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, createToken, setAuthCookie } from '@/lib/auth';

interface UserRow {
  ID: number;
  NAME: string;
  EMAIL: string;
  PASSWORD_HASH: string;
  ROLE: string;
  IS_BANNED: number;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const users = await query<UserRow>(
      'SELECT id, name, email, password_hash, role, is_banned FROM users WHERE email = :email',
      { email }
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if banned
    if (user.IS_BANNED === 1) {
      return NextResponse.json(
        { error: 'Your account has been suspended' },
        { status: 403 }
      );
    }

    // Compare password
    const isValid = await comparePassword(password, user.PASSWORD_HASH);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token and set cookie
    const token = await createToken({
      userId: user.ID,
      email: user.EMAIL,
      role: user.ROLE as 'user' | 'admin',
    });
    await setAuthCookie(token);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.ID,
        name: user.NAME,
        email: user.EMAIL,
        role: user.ROLE,
      },
    });
  } catch (error) {
    console.error('[Login]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
