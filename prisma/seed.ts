import { PrismaClient, Role, ReservationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hashing default passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const dosenPassword = await bcrypt.hash('dosen123', 10);

  // 1. Seed Users (10 Users minimum)
  const usersData = [
    {
      email: 'admin@kampus.ac.id',
      password: adminPassword,
      name: 'Dr. Administrator Utama',
      nip: '198001012005011001',
      role: Role.ADMIN,
      department: 'Biro Administrasi Akademik & Sarpras',
    },
    {
      email: 'admin.sarpras@kampus.ac.id',
      password: adminPassword,
      name: 'Ir. Admin Sarpras',
      nip: '198203152008041002',
      role: Role.ADMIN,
      department: 'Subbag Sarana & Prasarana',
    },
    {
      email: 'dosen1@kampus.ac.id',
      password: dosenPassword,
      name: 'Prof. Dr. Ahmad Dahlan, M.T.',
      nip: '197505122001121003',
      role: Role.DOSEN,
      department: 'Teknik Informatika',
    },
    {
      email: 'dosen2@kampus.ac.id',
      password: dosenPassword,
      name: 'Dr. Budi Santoso, M.Kom.',
      nip: '198108202006041004',
      role: Role.DOSEN,
      department: 'Sistem Informasi',
    },
    {
      email: 'dosen3@kampus.ac.id',
      password: dosenPassword,
      name: 'Siti Aminah, S.T., M.Eng.',
      nip: '198811032015042001',
      role: Role.DOSEN,
      department: 'Teknik Komputer',
    },
    {
      email: 'dosen4@kampus.ac.id',
      password: dosenPassword,
      name: 'Dr. Hendra Wijaya, M.Sc.',
      nip: '197904182003121002',
      role: Role.DOSEN,
      department: 'Teknik Elektro',
    },
    {
      email: 'dosen5@kampus.ac.id',
      password: dosenPassword,
      name: 'Dewi Lestari, M.Pd.',
      nip: '198602242010122003',
      role: Role.DOSEN,
      department: 'Bahasa & Komunikasi',
    },
    {
      email: 'dosen6@kampus.ac.id',
      password: dosenPassword,
      name: 'Dr. Rizky Ramadhan, M.T.',
      nip: '198307122009121005',
      role: Role.DOSEN,
      department: 'Teknik Informatika',
    },
    {
      email: 'dosen7@kampus.ac.id',
      password: dosenPassword,
      name: 'Eka Putri, M.S.I.',
      nip: '199009152018032002',
      role: Role.DOSEN,
      department: 'Sistem Informasi',
    },
    {
      email: 'dosen8@kampus.ac.id',
      password: dosenPassword,
      name: 'Fajar Nugroho, M.T.',
      nip: '198712012014021003',
      role: Role.DOSEN,
      department: 'Teknik Komputer',
    },
  ];

  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: user.password,
        role: user.role,
        nip: user.nip,
        department: user.department,
      },
      create: user,
    });
  }
  console.log('Seeded 10 users successfully.');

  // 2. Seed Rooms (10 Rooms minimum)
  const roomsData = [
    {
      externalId: 'cnVhbmdhbi0wMDE=',
      kodeRuang: 'GDA-101',
      namaRuangan: 'Ruang Kuliah 101',
      namaGedung: 'Gedung A',
      kapasitasRuang: 40,
      jenisRuang: 'kelas',
      status: 'Tersedia',
    },
    {
      externalId: 'cnVhbmdhbi0wMDI=',
      kodeRuang: 'GDA-102',
      namaRuangan: 'Ruang Kuliah 102',
      namaGedung: 'Gedung A',
      kapasitasRuang: 40,
      jenisRuang: 'kelas',
      status: 'Tersedia',
    },
    {
      externalId: 'cnVhbmdhbi0wMDM=',
      kodeRuang: 'GDA-103',
      namaRuangan: 'Ruang Kuliah 103',
      namaGedung: 'Gedung A',
      kapasitasRuang: 35,
      jenisRuang: 'kelas',
      status: 'Tersedia',
    },
    {
      externalId: 'cnVhbmdhbi0wMDQ=',
      kodeRuang: 'GDA-104',
      namaRuangan: 'Ruang Seminar A',
      namaGedung: 'Gedung A',
      kapasitasRuang: 80,
      jenisRuang: 'pertemuan',
      status: 'Tersedia',
    },
    {
      externalId: 'cnVhbmdhbi0wMDU=',
      kodeRuang: 'GDA-105',
      namaRuangan: 'Ruang Rapat Jurusan A',
      namaGedung: 'Gedung A',
      kapasitasRuang: 20,
      jenisRuang: 'rapat',
      status: 'Tersedia',
    },
    {
      externalId: 'cnVhbmdhbi0wMTE=',
      kodeRuang: 'GDB-101',
      namaRuangan: 'Ruang Kuliah B101',
      namaGedung: 'Gedung B',
      kapasitasRuang: 45,
      jenisRuang: 'kelas',
      status: 'Tersedia',
    },
    {
      externalId: 'cnVhbmdhbi0wMTQ=',
      kodeRuang: 'GDB-104',
      namaRuangan: 'Aula Gedung B',
      namaGedung: 'Gedung B',
      kapasitasRuang: 200,
      jenisRuang: 'pertemuan',
      status: 'Tersedia',
    },
    {
      externalId: 'cnVhbmdhbi0wMjE=',
      kodeRuang: 'GDC-101',
      namaRuangan: 'Lab Komputer C101',
      namaGedung: 'Gedung C',
      kapasitasRuang: 30,
      jenisRuang: 'kelas',
      status: 'Tersedia',
    },
    {
      externalId: 'cnVhbmdhbi0wMjI=',
      kodeRuang: 'GDC-102',
      namaRuangan: 'Lab Komputer C102',
      namaGedung: 'Gedung C',
      kapasitasRuang: 30,
      jenisRuang: 'kelas',
      status: 'Tersedia',
    },
    {
      externalId: 'cnVhbmdhbi0wMzE=',
      kodeRuang: 'GDD-101',
      namaRuangan: 'Ruang Kuliah D101',
      namaGedung: 'Gedung D',
      kapasitasRuang: 50,
      jenisRuang: 'kelas',
      status: 'Tersedia',
    },
  ];

  for (const room of roomsData) {
    await prisma.room.upsert({
      where: { kodeRuang: room.kodeRuang },
      update: room,
      create: room,
    });
  }
  console.log('Seeded 10 rooms successfully.');

  // 3. Seed Sample Reservations
  const dosen1 = await prisma.user.findUnique({ where: { email: 'dosen1@kampus.ac.id' } });
  const dosen2 = await prisma.user.findUnique({ where: { email: 'dosen2@kampus.ac.id' } });
  const room1 = await prisma.room.findUnique({ where: { kodeRuang: 'GDA-101' } });
  const room4 = await prisma.room.findUnique({ where: { kodeRuang: 'GDA-104' } });

  if (dosen1 && dosen2 && room1 && room4) {
    const today = new Date().toISOString().split('T')[0];

    // Approved reservation for Room 1
    const start1 = new Date(`${today}T08:00:00.000Z`);
    const end1 = new Date(`${today}T10:00:00.000Z`);

    await prisma.reservation.create({
      data: {
        userId: dosen1.id,
        roomId: room1.id,
        tanggal: today,
        jamMulai: '08:00',
        jamSelesai: '10:00',
        startTime: start1,
        endTime: end1,
        keperluan: 'Kuliah Pemrograman Web - Kelas A',
        status: ReservationStatus.Disetujui,
        catatanAdmin: 'Disetujui untuk perkuliahan rutin.',
      },
    });

    // Pending reservation for Room 4
    const start2 = new Date(`${today}T13:00:00.000Z`);
    const end2 = new Date(`${today}T15:00:00.000Z`);

    await prisma.reservation.create({
      data: {
        userId: dosen2.id,
        roomId: room4.id,
        tanggal: today,
        jamMulai: '13:00',
        jamSelesai: '15:00',
        startTime: start2,
        endTime: end2,
        keperluan: 'Seminar Hasil Skripsi Mahasiswa',
        status: ReservationStatus.Menunggu,
      },
    });

    console.log('Seeded sample reservations.');
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
