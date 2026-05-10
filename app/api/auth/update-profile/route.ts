import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { execute } from '@/lib/db';

// PUT — Update own profile (name, email, password)
export async function PUT(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const fields: string[] = [];
    const binds: Record<string, unknown> = { id: auth.userId };

    if (body.name !== undefined) {
      fields.push('name = :name');
      binds.name = body.name;
    }

    if (body.email !== undefined) {
      fields.push('email = :email');
      binds.email = body.email;
    }

    if (body.newPassword && body.currentPassword) {
      // Verify current password
      const { query } = await import('@/lib/db');
      const users = await query<{ PASSWORD_HASH: string }>(
        'SELECT password_hash FROM users WHERE id = :id',
        { id: auth.userId }
      );

      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const bcrypt = await import('bcryptjs');
      const valid = await bcrypt.compare(body.currentPassword, users[0].PASSWORD_HASH);
      if (!valid) {
        return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
      }

      const hash = await bcrypt.hash(body.newPassword, 12);
      fields.push('password_hash = :password_hash');
      binds.password_hash = hash;
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    await execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = :id`,
      binds
    );

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('[Profile Update]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
