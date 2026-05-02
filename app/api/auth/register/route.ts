import { NextResponse } from 'next/server';
import { query, execute, oracledb } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await query(
      'SELECT id FROM users WHERE email = :email',
      { email }
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert new user
    const result = await execute(
      `INSERT INTO users (name, email, password_hash)
       VALUES (:name, :email, :password_hash)
       RETURNING id INTO :id`,
      {
        name,
        email,
        password_hash: passwordHash,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    const userId = (result.outBinds as { id: number[] }).id[0];

    // Create JWT token and set cookie
    const token = await createToken({ userId, email, role: 'user' });
    await setAuthCookie(token);

    return NextResponse.json({
      message: 'Registration successful',
      user: { id: userId, name, email, role: 'user' },
    });
  } catch (error) {
    console.error('[Register]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
