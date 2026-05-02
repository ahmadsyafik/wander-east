import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: Promise<{ id: string }>;
}

// PUT — Admin: Update user (ban/unban, promote/demote)
export async function PUT(request: Request, { params }: Params) {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const fields: string[] = [];
    const binds: Record<string, unknown> = { id: parseInt(id) };

    if (body.isBanned !== undefined) {
      fields.push('is_banned = :is_banned');
      binds.is_banned = body.isBanned ? 1 : 0;
    }

    if (body.role !== undefined) {
      fields.push('role = :role');
      binds.role = body.role;
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    await execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = :id`,
      binds
    );

    return NextResponse.json({ message: 'User updated' });
  } catch (error) {
    console.error('[User PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — Admin: Delete user
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await execute('DELETE FROM users WHERE id = :id', { id: parseInt(id) });

    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('[User DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
