import bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;

/** Convert one in-memory legacy admin record; callers own persistence and must not log input. */
export async function migrateAdminCredential(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new TypeError('Expected one admin record');
  }
  if (typeof record.password !== 'string' || record.password.length === 0) {
    throw new TypeError('Expected a non-empty legacy password');
  }
  if (bcrypt.truncates(record.password)) {
    throw new TypeError('Legacy password exceeds bcrypt 72-byte limit');
  }
  if (record.password_hash != null) {
    throw new Error('Record already has a password hash');
  }

  const { password, ...metadata } = record;
  return {
    ...metadata,
    password_hash: await bcrypt.hash(password, BCRYPT_COST),
  };
}

export async function verifyAdminCredential(password, passwordHash) {
  if (typeof password !== 'string' || typeof passwordHash !== 'string') return false;
  return bcrypt.compare(password, passwordHash);
}
