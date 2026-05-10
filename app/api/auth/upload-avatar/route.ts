import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { execute } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST — Upload avatar image
export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 5MB.' },
        { status: 400 }
      );
    }

    // Create unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `avatar-${auth.userId}-${Date.now()}.${ext}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadDir, { recursive: true });

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Public URL
    const avatarUrl = `/uploads/avatars/${filename}`;

    // Update user in database
    await execute(
      'UPDATE users SET avatar_url = :avatar WHERE id = :id',
      { avatar: avatarUrl, id: auth.userId }
    );

    return NextResponse.json({
      message: 'Avatar updated successfully',
      avatarUrl,
    });
  } catch (error) {
    console.error('[Upload Avatar]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
