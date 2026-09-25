---
name: task-completion-handoff
description: Write concise Vietnamese completion and handoff summaries for repository tasks, including what changed, what was verified, blockers, and the next task.
---

# Task Completion Handoff

Use this skill when finishing or pausing a repository task. Give the user a short, scannable handoff instead of replaying the task history.

## Output format

Use 4–6 bullets, normally in Vietnamese:

- **Task:** `<ID>` · Luồng A/B · `<done | partial | blocked>`
- **Đã làm:** one short line with the actual result.
- **Kiểm chứng:** command or evidence and result; say `chưa chạy` when applicable.
- **Còn vướng:** include only if a real blocker or material risk remains.
- **Tiếp theo:** exact next task and dependency; include its suggested model/effort when known.
- **AI:** suggested model/effort for the completed task; actual model only when the host identifies it.

Omit inapplicable bullets; never invent a next task, model identifier, test result, deployment, or approval. If work is partial, label it `partial` and distinguish local changes from production changes. If there is no blocker, omit `Còn vướng` rather than writing filler.

## Keep it brief

- One sentence per bullet; prefer concrete outcome and evidence over process narration.
- Link only the primary changed artifact and the next-task source when useful.
- Do not add a generic introduction, multi-section report, repeated project context, or routine follow-up questions.
- Ask a question only when a user decision or missing fact blocks the next action or materially changes the outcome.
- Preserve important security, data-loss, deployment, or evidence limitations in one concise blocker bullet.
