import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Role, ReservationStatus } from '@prisma/client';
import { checkScheduleConflict } from '@/lib/conflict';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    const { id } = await params;
    const reservation = await db.reservation.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Data peminjaman tidak ditemukan' }, { status: 404 });
    }

    // Only owner or Admin can edit
    if (authUser.role !== Role.ADMIN && reservation.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Akses ditolak untuk mengedit peminjaman ini' }, { status: 403 });
    }

    const body = await request.json();
    const { roomId, tanggal, jamMulai, jamSelesai, keperluan } = body;

    if (!roomId || !tanggal || !jamMulai || !jamSelesai || !keperluan) {
      return NextResponse.json(
        { error: 'Semua field pengajuan wajib diisi' },
        { status: 400 }
      );
    }

    const targetRoom = await db.room.findUnique({ where: { id: roomId } });
    if (!targetRoom) {
      return NextResponse.json({ error: 'Ruangan tidak ditemukan' }, { status: 404 });
    }

    if (targetRoom.status === 'Pemeliharaan') {
      return NextResponse.json(
        { error: 'Ruangan sedang dalam pemeliharaan dan tidak dapat dipinjam.' },
        { status: 400 }
      );
    }

    const startTime = new Date(`${tanggal}T${jamMulai}:00.000Z`);
    const endTime = new Date(`${tanggal}T${jamSelesai}:00.000Z`);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: 'Format tanggal atau jam tidak valid' },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'Jam selesai harus lebih besar daripada jam mulai' },
        { status: 400 }
      );
    }

    // Schedule conflict check (excluding current reservation ID)
    const conflictResult = await checkScheduleConflict({
      roomId,
      startTime,
      endTime,
      excludeReservationId: id,
    });

    if (conflictResult.hasConflict && conflictResult.conflictingReservation) {
      const conf = conflictResult.conflictingReservation;
      return NextResponse.json(
        {
          error: `Bentrok Jadwal! Ruangan ${targetRoom.namaRuangan} (${targetRoom.kodeRuang}) sudah disetujui untuk peminjaman lain pada jam ${conf.jamMulai} - ${conf.jamSelesai}.`,
          conflict: conf,
        },
        { status: 400 }
      );
    }

    // If edited by Dosen, reset status to Menunggu (Pending) for re-approval
    const updatedStatus =
      authUser.role === Role.DOSEN
        ? ReservationStatus.Menunggu
        : reservation.status;

    const updatedReservation = await db.reservation.update({
      where: { id },
      data: {
        roomId,
        tanggal,
        jamMulai,
        jamSelesai,
        startTime,
        endTime,
        keperluan,
        status: updatedStatus,
        catatanAdmin: authUser.role === Role.DOSEN ? null : reservation.catatanAdmin,
      },
      include: {
        room: true,
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      message: 'Pengajuan peminjaman berhasil diperbarui',
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error('Update reservation error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui pengajuan peminjaman' },
      { status: 500 }
    );
  }
}

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
