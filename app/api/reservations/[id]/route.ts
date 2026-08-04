import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    const { id } = await params;
    const reservation = await db.reservation.findUnique({ where: { id } });

    if (!reservation) {
      return NextResponse.json({ error: 'Peminjaman tidak ditemukan' }, { status: 404 });
    }

    // Only owner or Admin can delete/cancel
    if (authUser.role !== Role.ADMIN && reservation.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    await db.reservation.delete({ where: { id } });
    return NextResponse.json({ message: 'Pengajuan peminjaman berhasil dibatalkan/dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus pengajuan peminjaman' }, { status: 500 });
  }
}
