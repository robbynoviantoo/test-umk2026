import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Role, ReservationStatus } from '@prisma/client';
import { checkScheduleConflict } from '@/lib/conflict';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const roomId = searchParams.get('roomId') || '';
    const tanggal = searchParams.get('tanggal') || '';
    const mineOnly = searchParams.get('mineOnly') === 'true';

    const where: any = {};

    // Dosen by default sees their own unless explicitly querying for all approved schedules
    if (authUser.role === Role.DOSEN && mineOnly) {
      where.userId = authUser.userId;
    }

    if (status && status !== 'semua') {
      where.status = status as ReservationStatus;
    }

    if (roomId && roomId !== 'semua') {
      where.roomId = roomId;
    }

    if (tanggal) {
      where.tanggal = tanggal;
    }

    if (search) {
      where.OR = [
        { keperluan: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { room: { namaRuangan: { contains: search, mode: 'insensitive' } } },
        { room: { kodeRuang: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const reservations = await db.reservation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, department: true },
        },
        room: {
          select: { id: true, kodeRuang: true, namaRuangan: true, namaGedung: true, kapasitasRuang: true, jenisRuang: true },
        },
      },
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Fetch reservations error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data peminjaman' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const { roomId, tanggal, jamMulai, jamSelesai, keperluan } = body;

    if (!roomId || !tanggal || !jamMulai || !jamSelesai || !keperluan) {
      return NextResponse.json(
        { error: 'Semua field pengajuan wajib diisi' },
        { status: 400 }
      );
    }

    const room = await db.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: 'Ruangan tidak ditemukan' }, { status: 404 });
    }

    if (room.status === 'Pemeliharaan') {
      return NextResponse.json(
        { error: 'Ruangan sedang dalam pemeliharaan dan tidak dapat dipinjam.' },
        { status: 400 }
      );
    }

    // Construct Date objects
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

    // Business Rule: Overlap Check against Approved Reservations
    const conflictResult = await checkScheduleConflict({
      roomId,
      startTime,
      endTime,
    });

    if (conflictResult.hasConflict && conflictResult.conflictingReservation) {
      const conf = conflictResult.conflictingReservation;
      return NextResponse.json(
        {
          error: `Bentrok Jadwal! Ruangan ${room.namaRuangan} (${room.kodeRuang}) sudah disetujui untuk peminjaman oleh ${conf.user.name} pada jam ${conf.jamMulai} - ${conf.jamSelesai}.`,
          conflict: conf,
        },
        { status: 400 }
      );
    }

    const reservation = await db.reservation.create({
      data: {
        userId: authUser.userId,
        roomId,
        tanggal,
        jamMulai,
        jamSelesai,
        startTime,
        endTime,
        keperluan,
        status: ReservationStatus.Menunggu,
      },
      include: {
        room: true,
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(
      {
        message: 'Pengajuan peminjaman ruangan berhasil dikirim dan menunggu persetujuan Admin',
        reservation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create reservation error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat pengajuan peminjaman' },
      { status: 500 }
    );
  }
}
