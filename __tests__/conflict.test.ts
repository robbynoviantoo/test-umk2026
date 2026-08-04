import { describe, it, expect } from 'vitest';
import { isTimeRangeOverlapping } from '../lib/conflict';

describe('Schedule Overlap Prevention Logic (Aturan Bisnis Anti Bentrok)', () => {
  it('should detect exact time overlap', () => {
    const startA = new Date('2026-08-04T08:00:00Z');
    const endA = new Date('2026-08-04T10:00:00Z');

    const startB = new Date('2026-08-04T08:00:00Z');
    const endB = new Date('2026-08-04T10:00:00Z');

    expect(isTimeRangeOverlapping(startA, endA, startB, endB)).toBe(true);
  });

  it('should detect partial overlap (new booking starts inside existing approved slot)', () => {
    const existingStart = new Date('2026-08-04T08:00:00Z');
    const existingEnd = new Date('2026-08-04T10:00:00Z');

    const newStart = new Date('2026-08-04T09:00:00Z');
    const newEnd = new Date('2026-08-04T11:00:00Z');

    expect(isTimeRangeOverlapping(newStart, newEnd, existingStart, existingEnd)).toBe(true);
  });

  it('should detect partial overlap (new booking ends inside existing approved slot)', () => {
    const existingStart = new Date('2026-08-04T10:00:00Z');
    const existingEnd = new Date('2026-08-04T12:00:00Z');

    const newStart = new Date('2026-08-04T09:00:00Z');
    const newEnd = new Date('2026-08-04T11:00:00Z');

    expect(isTimeRangeOverlapping(newStart, newEnd, existingStart, existingEnd)).toBe(true);
  });

  it('should allow back-to-back consecutive reservations without conflict (08:00-10:00 and 10:00-12:00)', () => {
    const slot1Start = new Date('2026-08-04T08:00:00Z');
    const slot1End = new Date('2026-08-04T10:00:00Z');

    const slot2Start = new Date('2026-08-04T10:00:00Z');
    const slot2End = new Date('2026-08-04T12:00:00Z');

    expect(isTimeRangeOverlapping(slot1Start, slot1End, slot2Start, slot2End)).toBe(false);
  });

  it('should allow completely non-overlapping times on the same room', () => {
    const morningStart = new Date('2026-08-04T08:00:00Z');
    const morningEnd = new Date('2026-08-04T10:00:00Z');

    const afternoonStart = new Date('2026-08-04T14:00:00Z');
    const afternoonEnd = new Date('2026-08-04T16:00:00Z');

    expect(isTimeRangeOverlapping(morningStart, morningEnd, afternoonStart, afternoonEnd)).toBe(false);
  });
});
