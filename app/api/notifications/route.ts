import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET — Fetch user notifications
export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const notifications = await query(
      `SELECT id, message, notif_type, is_read, link, created_at
       FROM notifications
       WHERE user_id = :userId
       ORDER BY created_at DESC
       FETCH FIRST 20 ROWS ONLY`,
      { userId: auth.userId }
    );

    const unreadCount = await query(
      `SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = :userId AND is_read = 0`,
      { userId: auth.userId }
    );

    return NextResponse.json({
      notifications: notifications.map((n: Record<string, unknown>) => ({
        id: n.ID,
        message: n.MESSAGE,
        type: n.NOTIF_TYPE,
        isRead: n.IS_READ === 1,
        link: n.LINK,
        createdAt: n.CREATED_AT,
      })),
      unreadCount: (unreadCount[0] as Record<string, number>)?.CNT || 0,
    });
  } catch (error) {
    console.error('[Notifications GET]', error);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

// PUT — Mark notifications as read
export async function PUT(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    if (body.markAllRead) {
      // Mark all as read
      await execute(
        'UPDATE notifications SET is_read = 1 WHERE user_id = :userId AND is_read = 0',
        { userId: auth.userId }
      );
    } else if (body.notificationId) {
      // Mark single notification as read
      await execute(
        'UPDATE notifications SET is_read = 1 WHERE id = :notifId AND user_id = :userId',
        { notifId: body.notificationId, userId: auth.userId }
      );
    }

    return NextResponse.json({ message: 'Updated' });
  } catch (error) {
    console.error('[Notifications PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
