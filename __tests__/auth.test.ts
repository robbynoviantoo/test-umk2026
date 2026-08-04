import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, createToken, verifyToken } from '../lib/auth';
import { Role } from '@prisma/client';

describe('Authentication & JWT Security Utilities', () => {
  it('should hash passwords and verify correctly', async () => {
    const rawPassword = 'dosenSecurePassword123';
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);

    const isValid = await verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('should create and verify valid JWT tokens for Admin role', async () => {
    const payload = {
      userId: 'user-admin-01',
      email: 'admin@kampus.ac.id',
      name: 'Admin Utama',
      role: Role.ADMIN,
    };

    const token = await createToken(payload);
    expect(token).toBeTypeOf('string');

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(Role.ADMIN);
  });

  it('should return null for tampered/invalid JWT tokens', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.fakesignature';
    const decoded = await verifyToken(fakeToken);
    expect(decoded).toBeNull();
  });
});
