---
name: subagent
description: Minimal subagent orchestration for scientific/technical writing and software development. Use only when the root is Astra, Sol Max, or Sol Ultra.
---

# Subagent

Keep global context with the root. Delegate only bounded work with the minimum sufficient context.

## Eligibility and route

Use this skill only when the root is **Astra**, **Sol Max**, or **Sol Ultra**.

- Sol roots MUST NOT delegate to Astra.
- Astra roots may delegate to Astra, Sol, Terra, or Luna, but Astra subagents are exceptional.
- scientific/technical writing, research interpretation, papers/books, LaTeX, literature/results → `scientific-writing/SKILL.md`
- software implementation, debugging, refactoring, testing, build/CI, repository/code review → `code-development/SKILL.md`
- mixed task → split workstreams first; load each scenario only for its own workstream
- simple/local/deterministic task → do it directly when delegation adds no value

Do not load both scenario skills unless both are needed.

## Dispatch contract

Every subagent dispatch MUST explicitly specify:

- objective
- model
- reasoning effort
- allowed reads and writes
- supplied context/constraints
- forbidden actions
- expected output
- verification condition

Never rely on inherited model or reasoning settings. A worker must not expand scope without returning the need to the root.

## Context levels

Use the lowest sufficient level:

- `NONE` — task contract only
- `FRAGMENT` — extracted rules/excerpts/interfaces/results
- `LOCAL` — one directly relevant skill/reference/file/module or bounded set
- `FULL` — broad instructions only because the assigned decision is genuinely project-wide

Default: `NONE` or `FRAGMENT`. `FULL` requires a concrete reason.

Model strength, reasoning effort, and context size are independent. Never load a full skill when an extracted rule is enough.

## Model and reasoning

Choose the cheapest model and lowest reasoning effort that can reliably complete the bounded task.

- **Luna** — `Low` default, `Medium` if modest synthesis is needed; `High/Max/Ultra` forbidden. Use for search, inspection, execution, compile/test/lint/grep/diff and deterministic checks.
- **Terra** — `Low` for simple execution, `Medium` for normal implementation/editing, `High` for difficult bounded work; `Max/Ultra` forbidden. If Terra High is insufficient, prefer Sol.
- **Sol** — `Medium` default for substantive reasoning, `High` for difficult reasoning/debug/review, `Max` only for exceptional quality-critical bounded work; `Ultra` forbidden in normal operation. Sol children do not inherit a Sol Max/Ultra root setting by default.
- **Astra** — only under an Astra root, and only for genuinely independent high-impact reasoning. Start at the lowest sufficient effort. Never use Astra for search, formatting, compilation, test execution, routine editing, or repository inspection.

## Ultra exception

Ultra is outside the normal escalation ladder.

A subagent may use `Ultra` only when ALL are true:

1. the root itself is Ultra
2. the user is intentionally spending otherwise-expiring/resetting high-compute budget, such as shortly before a TIBO reset
3. spending that budget now is preferable to conserving it
4. the delegated task is substantial enough to justify Ultra
5. the root explicitly selects Ultra for that dispatch

Otherwise Ultra is forbidden. A subagent must never upgrade itself to Ultra. Difficulty alone, a single Max failure, or possible quality gain is not sufficient justification.

## Escalation

When a worker struggles, diagnose before spending more compute:

1. missing context → add only the missing context
2. task too broad → split or narrow it
3. model mismatch → upgrade the model
4. reasoning depth genuinely insufficient → raise reasoning effort

Do not use higher reasoning to compensate for missing files, information, permissions, or an unclear contract.

## Shared boundaries

- The root owns global policy, dependency ordering, integration, and final acceptance unless explicitly delegated.
- Workers may modify only assigned files/regions. Avoid overlapping parallel writes; serialize overlap through one owner/integrator.
- Use deterministic tools for deterministic questions.
- Commit, push, publish, deploy, delete, merge, or other external/irreversible actions require explicit assignment.
- Workers return compact integration evidence: findings, changed scope, verification results, and unresolved issues. No exhaustive reading diary unless requested.
