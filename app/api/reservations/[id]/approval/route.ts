import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Role, ReservationStatus } from '@prisma/client';
import { checkScheduleConflict } from '@/lib/conflict';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Akses Ditolak. Khusus Admin.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, catatanAdmin } = body;

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Aksi tidak valid (APPROVE / REJECT)' }, { status: 400 });
    }

    const reservation = await db.reservation.findUnique({
      where: { id },
      include: { room: true, user: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Data peminjaman tidak ditemukan' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      // Overlap schedule check before approval
      const conflictResult = await checkScheduleConflict({
        roomId: reservation.roomId,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        excludeReservationId: reservation.id,
      });

      if (conflictResult.hasConflict && conflictResult.conflictingReservation) {
        const conf = conflictResult.conflictingReservation;
        return NextResponse.json(
          {
            error: `Persetujuan Ditolak! Terjadi bentrok jadwal dengan peminjaman oleh ${conf.user.name} pada jam ${conf.jamMulai} - ${conf.jamSelesai}.`,
            conflict: conf,
          },
          { status: 400 }
        );
      }

      const updated = await db.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.Disetujui,
          catatanAdmin: catatanAdmin || 'Disetujui oleh Admin.',
        },
        include: { room: true, user: true },
      });

      return NextResponse.json({
        message: `Pengajuan peminjaman ruangan ${reservation.room.kodeRuang} berhasil disetujui`,
        reservation: updated,
      });
    } else {
      // REJECT
      const updated = await db.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.Ditolak,
          catatanAdmin: catatanAdmin || 'Pengajuan Ditolak oleh Admin.',
        },
        include: { room: true, user: true },
      });

      return NextResponse.json({
        message: `Pengajuan peminjaman ruangan ${reservation.room.kodeRuang} Ditolak`,
        reservation: updated,
      });
    }
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json({ error: 'Gagal memproses persetujuan' }, { status: 500 });
  }
}
