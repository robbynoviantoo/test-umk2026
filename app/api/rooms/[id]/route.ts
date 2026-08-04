import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = await db.room.findUnique({
      where: { id },
      include: {
        reservations: {
          orderBy: { startTime: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Ruangan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil detail ruangan' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Admin.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { kodeRuang, namaRuangan, namaGedung, kapasitasRuang, jenisRuang, status } = body;

    const existingRoom = await db.room.findUnique({ where: { id } });
    if (!existingRoom) {
      return NextResponse.json({ error: 'Ruangan tidak ditemukan' }, { status: 404 });
    }

    const trimmedCode = kodeRuang.trim();
    const trimmedName = namaRuangan.trim();

    // Check duplicate code
    if (trimmedCode !== existingRoom.kodeRuang) {
      const duplicateCode = await db.room.findUnique({ where: { kodeRuang: trimmedCode } });
      if (duplicateCode) {
        return NextResponse.json(
          { error: `Gagal! Kode ruangan "${trimmedCode}" sudah digunakan.` },
          { status: 400 }
        );
      }
    }

    // Check duplicate name
    if (trimmedName.toLowerCase() !== existingRoom.namaRuangan.toLowerCase()) {
      const duplicateName = await db.room.findFirst({
        where: {
          namaRuangan: { equals: trimmedName, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (duplicateName) {
        return NextResponse.json(
          { error: `Gagal! Nama ruangan "${trimmedName}" sudah digunakan.` },
          { status: 400 }
        );
      }
    }

    const updatedRoom = await db.room.update({
      where: { id },
      data: {
        kodeRuang: trimmedCode,
        namaRuangan: trimmedName,
        namaGedung: namaGedung.trim(),
        kapasitasRuang: parseInt(kapasitasRuang, 10),
        jenisRuang,
        status,
      },
    });

    return NextResponse.json({ message: 'Ruangan berhasil diperbarui', room: updatedRoom });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui ruangan' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Admin.' }, { status: 403 });
    }

    const { id } = await params;

    await db.room.delete({ where: { id } });
    return NextResponse.json({ message: 'Ruangan berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus ruangan' }, { status: 500 });
  }
}
