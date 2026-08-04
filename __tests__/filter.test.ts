import { describe, it, expect } from 'vitest';

describe('Search and Filter Utilities', () => {
  const sampleRooms = [
    { id: '1', kodeRuang: 'GDA-101', namaRuangan: 'Ruang Kuliah 101', namaGedung: 'Gedung A', jenisRuang: 'kelas', status: 'Tersedia' },
    { id: '2', kodeRuang: 'GDA-104', namaRuangan: 'Ruang Seminar A', namaGedung: 'Gedung A', jenisRuang: 'pertemuan', status: 'Tersedia' },
    { id: '3', kodeRuang: 'GDB-101', namaRuangan: 'Ruang Kuliah B101', namaGedung: 'Gedung B', jenisRuang: 'kelas', status: 'Tersedia' },
    { id: '4', kodeRuang: 'GDC-101', namaRuangan: 'Lab Komputer C101', namaGedung: 'Gedung C', jenisRuang: 'kelas', status: 'Pemeliharaan' },
  ];

  it('should filter rooms by search term (case-insensitive code or name)', () => {
    const search = 'seminar';
    const filtered = sampleRooms.filter(
      (r) =>
        r.kodeRuang.toLowerCase().includes(search.toLowerCase()) ||
        r.namaRuangan.toLowerCase().includes(search.toLowerCase()) ||
        r.namaGedung.toLowerCase().includes(search.toLowerCase())
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].kodeRuang).toBe('GDA-104');
  });

  it('should filter rooms by Gedung B', () => {
    const gedung = 'Gedung B';
    const filtered = sampleRooms.filter((r) => r.namaGedung === gedung);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].kodeRuang).toBe('GDB-101');
  });

  it('should filter rooms by Status Pemeliharaan', () => {
    const status = 'Pemeliharaan';
    const filtered = sampleRooms.filter((r) => r.status === status);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].kodeRuang).toBe('GDC-101');
  });
});
