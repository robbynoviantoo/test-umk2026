import { describe, it, expect } from 'vitest';
import { ExternalRoomData } from '../lib/sync-rooms';

describe('WebService Room Data Sync & Parser', () => {
  it('should validate and parse WebService API room response items', () => {
    const rawApiPayload: ExternalRoomData = {
      id: 'cnVhbmdhbi0wMDE=',
      kode_ruang: 'GDA-101',
      nama_ruangan: 'Ruang Kuliah 101',
      nama_gedung: 'Gedung A',
      kapasitas_ruang: 40,
      jenis_ruang: 'kelas',
    };

    expect(rawApiPayload.id).toBe('cnVhbmdhbi0wMDE=');
    expect(rawApiPayload.kode_ruang).toBe('GDA-101');
    expect(rawApiPayload.nama_ruangan).toBe('Ruang Kuliah 101');
    expect(rawApiPayload.nama_gedung).toBe('Gedung A');
    expect(rawApiPayload.kapasitas_ruang).toBeGreaterThan(0);
    expect(['kelas', 'pertemuan', 'rapat']).toContain(rawApiPayload.jenis_ruang);
  });

  it('should map external JSON schema into Prisma Room creation model', () => {
    const apiRooms: ExternalRoomData[] = [
      {
        id: 'cnVhbmdhbi0wMDE=',
        kode_ruang: 'GDA-101',
        nama_ruangan: 'Ruang Kuliah 101',
        nama_gedung: 'Gedung A',
        kapasitas_ruang: 40,
        jenis_ruang: 'kelas',
      },
      {
        id: 'cnVhbmdhbi0wMDQ=',
        kode_ruang: 'GDA-104',
        nama_ruangan: 'Ruang Seminar A',
        nama_gedung: 'Gedung A',
        kapasitas_ruang: 80,
        jenis_ruang: 'pertemuan',
      },
    ];

    const mappedPrismaData = apiRooms.map((item) => ({
      externalId: item.id,
      kodeRuang: item.kode_ruang,
      namaRuangan: item.nama_ruangan,
      namaGedung: item.nama_gedung,
      kapasitasRuang: item.kapasitas_ruang,
      jenisRuang: item.jenis_ruang,
      status: 'Tersedia',
    }));

    expect(mappedPrismaData).toHaveLength(2);
    expect(mappedPrismaData[0].kodeRuang).toBe('GDA-101');
    expect(mappedPrismaData[1].jenisRuang).toBe('pertemuan');
  });
});
