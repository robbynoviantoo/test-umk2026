import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { ReservationStatus, Role } from '@prisma/client';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    const totalRooms = await db.room.count();
    const availableRooms = await db.room.count({ where: { status: 'Tersedia' } });
    const maintenanceRooms = await db.room.count({ where: { status: 'Pemeliharaan' } });

    // Filter reservations scope if Dosen
    const isDosen = authUser.role === Role.DOSEN;
    const userFilter = isDosen ? { userId: authUser.userId } : {};

    const totalReservations = await db.reservation.count({ where: userFilter });
    const pendingCount = await db.reservation.count({
      where: { ...userFilter, status: ReservationStatus.Menunggu },
    });
    const approvedCount = await db.reservation.count({
      where: { ...userFilter, status: ReservationStatus.Disetujui },
    });
    const DitolakCount = await db.reservation.count({
      where: { ...userFilter, status: ReservationStatus.Ditolak },
    });
    const completedCount = await db.reservation.count({
      where: { ...userFilter, status: ReservationStatus.Selesai },
    });

    const recentReservations = await db.reservation.findMany({
      where: userFilter,
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        room: { select: { kodeRuang: true, namaRuangan: true, namaGedung: true } },
        user: { select: { name: true, email: true } },
      },
    });

    // Building breakdown
    const rooms = await db.room.findMany({ select: { namaGedung: true } });
    const buildingCounts: Record<string, number> = {};
    for (const r of rooms) {
      buildingCounts[r.namaGedung] = (buildingCounts[r.namaGedung] || 0) + 1;
    }

    return NextResponse.json({
      stats: {
        totalRooms,
        availableRooms,
        maintenanceRooms,
        totalReservations,
        pendingCount,
        approvedCount,
        DitolakCount,
        completedCount,
        buildingCounts,
      },
      recentReservations,
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    return NextResponse.json({ error: 'Gagal mengambil statistik dashboard' }, { status: 500 });
  }
}
