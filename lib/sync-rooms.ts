import { db } from './db';

export interface ExternalRoomData {
  id: string;
  kode_ruang: string;
  nama_ruangan: string;
  nama_gedung: string;
  kapasitas_ruang: number;
  jenis_ruang: string;
}

export async function fetchExternalRooms(): Promise<ExternalRoomData[]> {
  const response = await fetch('https://api-ruangan.vercel.app/rooms', {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Gagal mengambil data dari WebService API (${response.status})`);
  }
  const data = await response.json();
  return data as ExternalRoomData[];
}

export async function syncRoomsFromExternalApi() {
  const externalRooms = await fetchExternalRooms();

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of externalRooms) {
    const existing = await db.room.findUnique({
      where: { kodeRuang: item.kode_ruang },
    });

    if (existing) {
      await db.room.update({
        where: { id: existing.id },
        data: {
          externalId: item.id,
          namaRuangan: item.nama_ruangan,
          namaGedung: item.nama_gedung,
          kapasitasRuang: item.kapasitas_ruang,
          jenisRuang: item.jenis_ruang,
        },
      });
      updatedCount++;
    } else {
      await db.room.create({
        data: {
          externalId: item.id,
          kodeRuang: item.kode_ruang,
          namaRuangan: item.nama_ruangan,
          namaGedung: item.nama_gedung,
          kapasitasRuang: item.kapasitas_ruang,
          jenisRuang: item.jenis_ruang,
          status: 'Tersedia',
        },
      });
      createdCount++;
    }
  }

  return {
    totalSynced: externalRooms.length,
    createdCount,
    updatedCount,
  };
}
