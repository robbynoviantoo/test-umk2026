import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const gedung = searchParams.get('gedung') || '';
    const jenis = searchParams.get('jenis') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { kodeRuang: { contains: search, mode: 'insensitive' } },
        { namaRuangan: { contains: search, mode: 'insensitive' } },
        { namaGedung: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (gedung && gedung !== 'semua') {
      where.namaGedung = gedung;
    }

    if (jenis && jenis !== 'semua') {
      where.jenisRuang = jenis;
    }

    if (status && status !== 'semua') {
      where.status = status;
    }

    const rooms = await db.room.findMany({
      where,
      orderBy: { kodeRuang: 'asc' },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Fetch rooms error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data ruangan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Akses ditolak. Khusus Admin.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { kodeRuang, namaRuangan, namaGedung, kapasitasRuang, jenisRuang, status } = body;

    if (!kodeRuang || !namaRuangan || !namaGedung || !kapasitasRuang || !jenisRuang) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // 1. Check duplicate kodeRuang
    const existingCode = await db.room.findUnique({
      where: { kodeRuang: kodeRuang.trim() },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: `Gagal! Kode ruangan "${kodeRuang}" sudah digunakan.` },
        { status: 400 }
      );
    }

    // 2. Check duplicate namaRuangan
    const existingName = await db.room.findFirst({
      where: {
        namaRuangan: { equals: namaRuangan.trim(), mode: 'insensitive' },
      },
    });

    if (existingName) {
      return NextResponse.json(
        { error: `Gagal! Nama ruangan "${namaRuangan}" sudah digunakan.` },
        { status: 400 }
      );
    }

    const room = await db.room.create({
      data: {
        kodeRuang: kodeRuang.trim(),
        namaRuangan: namaRuangan.trim(),
        namaGedung: namaGedung.trim(),
        kapasitasRuang: parseInt(kapasitasRuang, 10),
        jenisRuang,
        status: status || 'Tersedia',
      },
    });

    return NextResponse.json({ message: 'Ruangan berhasil ditambahkan', room }, { status: 201 });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan ruangan' },
      { status: 500 }
    );
  }
}
