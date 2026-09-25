import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import {
  migrateAdminCredential,
  verifyAdminCredential,
} from './admin-credential-migration.mjs';

test('migrates one sample admin credential to bcrypt without retaining plaintext', async () => {
  const samplePassword = randomBytes(32).toString('base64url');
  const legacyRecord = { id: 'local-sample-admin', password: samplePassword, role: 'admin' };

  const migrated = await migrateAdminCredential(legacyRecord);

  assert.match(migrated.password_hash, /^\$2[aby]\$12\$/);
  assert.equal('password' in migrated, false);
  assert.equal(legacyRecord.password, samplePassword);
  assert.equal(await verifyAdminCredential(samplePassword, migrated.password_hash), true);
  assert.equal(await verifyAdminCredential('incorrect', migrated.password_hash), false);
  assert.equal(JSON.stringify(migrated).includes(samplePassword), false);
});

test('rejects missing credential and repeat migration', async () => {
  await assert.rejects(migrateAdminCredential({ id: 'sample' }), /non-empty legacy password/);
  await assert.rejects(
    migrateAdminCredential({ id: 'sample', password: 'a'.repeat(73) }),
    /72-byte limit/,
  );
  await assert.rejects(
    migrateAdminCredential({ id: 'sample', password: 'x', password_hash: 'already-set' }),
    /already has a password hash/,
  );
});
