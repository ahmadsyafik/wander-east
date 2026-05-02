import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: Promise<{ id: string }>;
}

// PUT — Admin: Moderate review (approve/reject)
export async function PUT(request: Request, { params }: Params) {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json();

    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Use PL/SQL procedure for moderation
    await execute(
      `BEGIN sp_moderate_review(:reviewId, :action); END;`,
      { reviewId: parseInt(id), action }
    );

    return NextResponse.json({ message: `Review ${action}` });
  } catch (error) {
    console.error('[Review Moderate]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — Admin: Delete review
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await execute('DELETE FROM reviews WHERE id = :id', { id: parseInt(id) });

    return NextResponse.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('[Review DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
