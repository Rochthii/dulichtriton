/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AI PROVIDER OUTAGE RUNBOOK SPECIFICATION & RUNTIME EVALUATOR
 * Task: P05-024 (Wave W5 — Incident Response & Observability)
 * System: Du Lịch Tri Tôn AI Assistant System
 * 
 * Maps directly to docs/runbooks/RUNBOOK_PROVIDER_OUTAGE.md:
 * 1. TRIGGER: Quantifiable trigger thresholds (SEV-1, SEV-2, SEV-3)
 * 2. OWNER: Defined Incident Commander & SRE on-call matrix
 * 3. ROLLBACK: 4-tier fallback chain & emergency mitigation procedures
 * 4. VERIFICATION: Post-incident recovery validation criteria
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ProviderOutageSeverity = 'NONE' | 'SEV-3' | 'SEV-2' | 'SEV-1';

export interface ProviderOutageTriggerThresholds {
  sev3ErrorRatePercent: number; // > 15%
  sev3P95LatencyMs: number;     // > 2500ms
  sev2FallbackRatePercent: number; // > 40%
  sev1TotalOutage: boolean;     // All cloud providers down
}

export const PROVIDER_OUTAGE_TRIGGER_THRESHOLDS: ProviderOutageTriggerThresholds = {
  sev3ErrorRatePercent: 15.0,
  sev3P95LatencyMs: 2500,
  sev2FallbackRatePercent: 40.0,
  sev1TotalOutage: true,
};

export interface IncidentOwner {
  role: string;
  name: string;
  title: string;
  authority: string;
}

export const PROVIDER_OUTAGE_OWNERSHIP_MATRIX: Record<string, IncidentOwner> = {
  incidentCommander: {
    role: 'Incident Commander',
    name: 'Chăm Rốch Thi',
    title: 'Lead Technical Architect & Incident Commander',
    authority: 'Full system configuration, key rotation, and rollback sign-off',
  },
  onCallSre: {
    role: 'On-call SRE / Production Engineer',
    name: 'Kỹ sư Trực ca Vận hành',
    title: 'Operations Engineer',
    authority: 'Execute runbook procedures, monitor metrics, escalate to IC',
  },
  commsLead: {
    role: 'Communications Lead',
    name: 'Trưởng nhóm Thông tin Du lịch',
    title: 'User Communications Lead',
    authority: 'Public degraded status notices and visitor advisories',
  },
};

export interface OutageEvaluationInput {
  errorRatePercent?: number;
  p95LatencyMs?: number;
  fallbackRatePercent?: number;
  isTotalCloudOutage?: boolean;
}

export interface OutageEvaluationResult {
  severity: ProviderOutageSeverity;
  triggered: boolean;
  reasons: string[];
  recommendedAction: string;
  owner: IncidentOwner;
}

/**
 * Evaluates current system metrics against the Provider Outage Runbook trigger thresholds.
 */
export function evaluateProviderOutageSeverity(
  input: OutageEvaluationInput
): OutageEvaluationResult {
  const reasons: string[] = [];

  if (input.isTotalCloudOutage) {
    reasons.push('Total cloud provider outage detected: All cloud LLM endpoints unreachable.');
    return {
      severity: 'SEV-1',
      triggered: true,
      reasons,
      recommendedAction: 'Engage Local Expert RAG offline isolation mode immediately.',
      owner: PROVIDER_OUTAGE_OWNERSHIP_MATRIX.incidentCommander,
    };
  }

  const fallbackRate = input.fallbackRatePercent ?? 0;
  if (fallbackRate >= PROVIDER_OUTAGE_TRIGGER_THRESHOLDS.sev2FallbackRatePercent) {
    reasons.push(
      `Provider fallback rate (${fallbackRate}%) exceeds SEV-2 threshold (>= ${PROVIDER_OUTAGE_TRIGGER_THRESHOLDS.sev2FallbackRatePercent}%).`
    );
    return {
      severity: 'SEV-2',
      triggered: true,
      reasons,
      recommendedAction: 'Rotate API keys and evaluate forced secondary provider transition.',
      owner: PROVIDER_OUTAGE_OWNERSHIP_MATRIX.incidentCommander,
    };
  }

  const errorRate = input.errorRatePercent ?? 0;
  const p95Latency = input.p95LatencyMs ?? 0;

  if (
    errorRate >= PROVIDER_OUTAGE_TRIGGER_THRESHOLDS.sev3ErrorRatePercent ||
    p95Latency >= PROVIDER_OUTAGE_TRIGGER_THRESHOLDS.sev3P95LatencyMs
  ) {
    if (errorRate >= PROVIDER_OUTAGE_TRIGGER_THRESHOLDS.sev3ErrorRatePercent) {
      reasons.push(
        `Primary error rate (${errorRate}%) exceeds SEV-3 threshold (>= ${PROVIDER_OUTAGE_TRIGGER_THRESHOLDS.sev3ErrorRatePercent}%).`
      );
    }
    if (p95Latency >= PROVIDER_OUTAGE_TRIGGER_THRESHOLDS.sev3P95LatencyMs) {
      reasons.push(
        `Primary p95 latency (${p95Latency}ms) exceeds SEV-3 threshold (>= ${PROVIDER_OUTAGE_TRIGGER_THRESHOLDS.sev3P95LatencyMs}ms).`
      );
    }
    return {
      severity: 'SEV-3',
      triggered: true,
      reasons,
      recommendedAction: 'Monitor automated sequential failover to Gemini secondary tier.',
      owner: PROVIDER_OUTAGE_OWNERSHIP_MATRIX.onCallSre,
    };
  }

  return {
    severity: 'NONE',
    triggered: false,
    reasons: ['All AI provider metrics within normal operational boundaries.'],
    recommendedAction: 'Normal operational monitoring.',
    owner: PROVIDER_OUTAGE_OWNERSHIP_MATRIX.onCallSre,
  };
}

export interface VerificationCheckInput {
  currentFallbackRatePercent: number;
  currentP95LatencyMs: number;
  currentErrorRatePercent: number;
  sosEmergencyBypassWorking: boolean;
}

export interface VerificationResult {
  verified: boolean;
  unmetCriteria: string[];
}

/**
 * Validates post-incident recovery against the 4 Verification Criteria.
 */
export function verifyProviderOutageRecovery(
  input: VerificationCheckInput
): VerificationResult {
  const unmetCriteria: string[] = [];

  if (input.currentFallbackRatePercent >= 10.0) {
    unmetCriteria.push(
      `Fallback rate (${input.currentFallbackRatePercent}%) not below healthy threshold (< 10%).`
    );
  }

  if (input.currentP95LatencyMs >= 2000) {
    unmetCriteria.push(
      `p95 latency (${input.currentP95LatencyMs}ms) not below recovery threshold (< 2000ms).`
    );
  }

  if (input.currentErrorRatePercent > 0.0) {
    unmetCriteria.push(
      `5xx error rate (${input.currentErrorRatePercent}%) is not zero.`
    );
  }

  if (!input.sosEmergencyBypassWorking) {
    unmetCriteria.push('SOS Emergency Instant Bypass verification failed.');
  }

  return {
    verified: unmetCriteria.length === 0,
    unmetCriteria,
  };
}
