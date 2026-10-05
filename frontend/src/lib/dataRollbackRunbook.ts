/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PRODUCTION DATA ROLLBACK RUNBOOK SPECIFICATION & RUNTIME VERIFIER
 * Task: P05-025 (Wave W5 — Incident Response & Data Governance)
 * System: Du Lịch Tri Tôn AI Assistant System
 * 
 * Maps directly to docs/runbooks/RUNBOOK_DATA_ROLLBACK.md:
 * 1. Snapshot Versioning: Naming conventions, SHA-256 checksums, Gate G2 link
 * 2. Restore Verification: Checksum match, record count, bounding box, RLS
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from 'crypto';

export interface SnapshotTableEntry {
  count: number;
  sha256: string;
  file: string;
}

export interface DataSnapshotManifest {
  backup_type: string;
  gate_approval: string;
  lead_auditor: string;
  timestamp: string;
  canonical_manifest_sha256: string;
  places: SnapshotTableEntry;
  itineraries: SnapshotTableEntry;
}

export interface TriTonBoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export const TRI_TON_BOUNDING_BOX: TriTonBoundingBox = {
  minLat: 10.3,
  maxLat: 10.55,
  minLng: 104.8,
  maxLng: 105.15,
};

export const DATA_ROLLBACK_CANONICAL_TARGETS = {
  boundingBox: TRI_TON_BOUNDING_BOX,
  minimumPlacesCount: 149,
  requiredLeadAuditor: 'Chăm Rốch Thi',
  requiredGateApproval: 'GATE_G2',
};

export function calculateContentSha256(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function isPlaceWithinTriTonBoundingBox(latitude: number, longitude: number): boolean {
  return (
    latitude >= TRI_TON_BOUNDING_BOX.minLat &&
    latitude <= TRI_TON_BOUNDING_BOX.maxLat &&
    longitude >= TRI_TON_BOUNDING_BOX.minLng &&
    longitude <= TRI_TON_BOUNDING_BOX.maxLng
  );
}

export interface SnapshotIntegrityResult {
  valid: boolean;
  actualHash: string;
  expectedHash: string;
  error?: string;
}

/**
 * Validates the SHA-256 cryptographic integrity of a raw snapshot file against its manifest entry.
 */
export function verifySnapshotFileIntegrity(
  fileContent: string,
  expectedHash: string
): SnapshotIntegrityResult {
  const actualHash = calculateContentSha256(fileContent);
  const valid = actualHash.toLowerCase() === expectedHash.toLowerCase();
  return {
    valid,
    actualHash,
    expectedHash,
    error: valid ? undefined : `HASH_MISMATCH: Expected ${expectedHash}, got ${actualHash}`,
  };
}

export interface RestoreVerificationInput {
  restoredPlacesCount: number;
  expectedPlacesCount?: number;
  outOfBoundaryCount: number;
  rlsEnabledOnPlaces: boolean;
  checksumMatchesManifest: boolean;
  auditorSignOffName: string;
}

export interface RestoreVerificationResult {
  verified: boolean;
  criteriaStatus: {
    checksumVerification: boolean;
    recordCountVerification: boolean;
    boundaryVerification: boolean;
    rlsVerification: boolean;
    auditorSignOffVerification: boolean;
  };
  unmetCriteria: string[];
}

/**
 * Validates post-restore state against the 5 Mandatory Verification Criteria.
 */
export function verifyDataRestoreIntegrity(
  input: RestoreVerificationInput
): RestoreVerificationResult {
  const unmetCriteria: string[] = [];

  // Criteria 1: Checksum
  const checksumVerification = input.checksumMatchesManifest;
  if (!checksumVerification) {
    unmetCriteria.push('Checksum verification failed: Data does not match snapshot SHA-256 hash.');
  }

  // Criteria 2: Record Count Invariant
  const targetCount = input.expectedPlacesCount ?? DATA_ROLLBACK_CANONICAL_TARGETS.minimumPlacesCount;
  const recordCountVerification = input.restoredPlacesCount >= targetCount;
  if (!recordCountVerification) {
    unmetCriteria.push(
      `Record count invariant failed: Restored ${input.restoredPlacesCount} places (expected >= ${targetCount}).`
    );
  }

  // Criteria 3: Geographic Boundary
  const boundaryVerification = input.outOfBoundaryCount === 0;
  if (!boundaryVerification) {
    unmetCriteria.push(
      `Geographic boundary invariant failed: ${input.outOfBoundaryCount} places outside Tri Ton boundary.`
    );
  }

  // Criteria 4: Row Level Security
  const rlsVerification = input.rlsEnabledOnPlaces;
  if (!rlsVerification) {
    unmetCriteria.push('RLS policy invariant failed: Row Level Security is NOT enabled on places.');
  }

  // Criteria 5: Auditor Sign-off
  const auditorSignOffVerification =
    input.auditorSignOffName.trim().toLowerCase() ===
    DATA_ROLLBACK_CANONICAL_TARGETS.requiredLeadAuditor.toLowerCase();
  if (!auditorSignOffVerification) {
    unmetCriteria.push(
      `Auditor sign-off invariant failed: Expected '${DATA_ROLLBACK_CANONICAL_TARGETS.requiredLeadAuditor}', got '${input.auditorSignOffName}'.`
    );
  }

  return {
    verified: unmetCriteria.length === 0,
    criteriaStatus: {
      checksumVerification,
      recordCountVerification,
      boundaryVerification,
      rlsVerification,
      auditorSignOffVerification,
    },
    unmetCriteria,
  };
}
