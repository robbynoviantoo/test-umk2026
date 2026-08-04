import { db } from './db';
import { ReservationStatus } from '@prisma/client';

export interface ConflictCheckParams {
  roomId: string;
  startTime: Date;
  endTime: Date;
  excludeReservationId?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingReservation?: {
    id: string;
    jamMulai: string;
    jamSelesai: string;
    tanggal: string;
    user: {
      name: string;
    };
    keperluan: string;
  };
}

export function isTimeRangeOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

export async function checkScheduleConflict({
  roomId,
  startTime,
  endTime,
  excludeReservationId,
}: ConflictCheckParams): Promise<ConflictCheckResult> {
  // Query all APPROVED reservations for the target room
  const approvedReservations = await db.reservation.findMany({
    where: {
      roomId,
      status: ReservationStatus.Disetujui,
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  for (const res of approvedReservations) {
    if (isTimeRangeOverlapping(startTime, endTime, res.startTime, res.endTime)) {
      return {
        hasConflict: true,
        conflictingReservation: {
          id: res.id,
          jamMulai: res.jamMulai,
          jamSelesai: res.jamSelesai,
          tanggal: res.tanggal,
          user: {
            name: res.user.name,
          },
          keperluan: res.keperluan,
        },
      };
    }
  }

  return { hasConflict: false };
}
