---
name: triton-evidence-remediation
description: Keep Tri Ton remediation work evidence-driven when changing admin/API boundaries, Supabase/RLS, data synchronization, AI facts, privacy, or release claims. Do not use for ordinary UI-only changes.
---

# Triton Evidence Remediation

Use this skill when a task can alter a persistent tourism fact, an AI answer, privacy data, authorization or a production-readiness claim.

## Read only the task context needed

1. Read `ACTIVE_TASK.md` first. Do not start a different task while it is `active` or `blocked`.
2. Read `docs/13_TWO_STREAM_EXECUTION_BOARD.md` for WIP, order and gates.
3. Read the direct row in `docs/12_PRODUCTION_REMEDIATION_PLAN.md`.
4. Load a technical-spec document only for the relevant boundary:
   - claim/evidence: `docs/technical-spec/EVALUATION_MATRIX.md`
   - attacker path or bypass: `docs/technical-spec/THREAT_MODEL.md`
   - mandatory control: `docs/technical-spec/SECURITY_INVARIANTS.md`
   - current fact/claim dispute: `docs/technical-spec/CURRENT_STATE_AUDIT.md`
5. Select the task's model/effort from `docs/technical-spec/MODEL_ROUTING.md`; write stream A/B, recommended route and actual model in the completion record.

## Execution rules

- Preserve one task, one boundary, one verifiable outcome. A boundary is one route, policy, migration, record, component, document or test case.
- State whether the item is `DESIGNED`, `PLANNED`, `IMPLEMENTED`, `VERIFIED`, `DISPUTED` or `RETIRED`. Never promote a label from code existence, a UI check or a build alone.
- For authorization, RLS, sync and AI integrity, test the persistent business effect. A rejected request is insufficient if it can still modify a table, storage object, cache, audit log or external system.
- Prefer a shared enforcement point over endpoint/UI deny-lists. When applicable, add a two-step bypass test rather than only a direct-call test.
- Treat POI count, administrative naming, SOS contact and cultural claim as unverified until the canonical manifest or approved source metadata supports them.
- Stop for a Decision Gate rather than inventing an owner, dataset, external fact, secret or production state.

## Evidence updates after a material task

Update only the documents touched by the task: `ACTIVE_TASK.md`, execution board, evaluation row, architecture/claim document and `CHANGELOG.md` as applicable. Record the command/test and its result. Do not bulk-edit unrelated documentation.
