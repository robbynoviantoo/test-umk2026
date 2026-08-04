import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { Role } from '@prisma/client';
import { syncRoomsFromExternalApi } from '@/lib/sync-rooms';

export async function POST() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Akses Ditolak. Khusus Admin.' },
        { status: 403 }
      );
    }

    const result = await syncRoomsFromExternalApi();

    return NextResponse.json({
      message: 'Sinkronisasi data ruangan dari WebService berhasil!',
      result,
    });
  } catch (error: any) {
    console.error('Room sync error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal melakukan sinkronisasi ruangan dari WebService' },
      { status: 500 }
    );
  }
}
