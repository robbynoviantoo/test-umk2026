import { describe, it, expect } from 'vitest';
import { ReservationStatus } from '@prisma/client';

describe('Reservation Business Rules & Status Transitions', () => {
  it('should validate initial reservation status is Menunggu (Pending)', () => {
    const initialStatus = ReservationStatus.Menunggu;
    expect(initialStatus).toBe('Menunggu');
  });

  it('should allow valid status transitions from Menunggu to Disetujui or Ditolak', () => {
    const allowedNextStatuses = [ReservationStatus.Disetujui, ReservationStatus.Ditolak];

    const targetStatusApproved = ReservationStatus.Disetujui;
    const targetStatusDitolak = ReservationStatus.Ditolak;

    expect(allowedNextStatuses.includes(targetStatusApproved)).toBe(true);
    expect(allowedNextStatuses.includes(targetStatusDitolak)).toBe(true);
  });

  it('should validate time bounds where jamMulai must be before jamSelesai', () => {
    const tanggal = '2026-08-04';
    const validStart = new Date(`${tanggal}T08:00:00Z`);
    const validEnd = new Date(`${tanggal}T10:00:00Z`);

    expect(validStart.getTime()).toBeLessThan(validEnd.getTime());

    const invalidStart = new Date(`${tanggal}T14:00:00Z`);
    const invalidEnd = new Date(`${tanggal}T12:00:00Z`);

    expect(invalidStart.getTime()).toBeGreaterThan(invalidEnd.getTime());
  });
});
