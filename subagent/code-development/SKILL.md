---
name: subagent-code-development
description: Scenario-specific subagent orchestration for software development. Read only after the root subagent skill routes here.
---

# Code Development Subagents

The root `subagent/SKILL.md` remains authoritative for eligibility, model/reasoning limits, context levels, Ultra policy, and external actions.

## Bounded roles

Use only roles that add value:

1. **Repository scout** — locates relevant files, symbols, tests, configuration, and call paths.
2. **Diagnostician** — identifies root cause from a bounded code path, failure, or log.
3. **Implementer** — owns a clearly defined code change.
4. **Test worker** — adds or repairs bounded tests from an explicit behavioral contract.
5. **Verifier** — runs tests, lint, type checks, builds, grep, diff, or other deterministic validation.
6. **Reviewer/integrator** — checks architecture-sensitive changes or integrates multiple workers.

Do not build a pipeline for work one bounded implementer can safely complete.

## Context

Default to symbol/file-level context, not repository-level context. Prefer target files/symbols, directly relevant interfaces/callers/callees, tests, exact failures/logs, local configuration, and extracted coding/build constraints.

Prefer interfaces/tests over broad implementation history when they sufficiently define expected behavior.

Typical access:

- scout / verifier → `NONE` or `FRAGMENT`
- small implementer / test worker → `FRAGMENT` or `LOCAL`
- diagnostician → `FRAGMENT` or `LOCAL`, expanding only along the failing dependency path
- architecture/integration reviewer → `FULL` only when the assigned decision is genuinely repository-wide

Put one-off build commands, environment names, style rules, or forbidden operations directly in the dispatch contract instead of requiring a full project skill.

## Typical model choice

Apply reasoning limits from the root skill.

- **Luna** — repository search, symbol usage, logs, tests/build/lint/type checks, git diff/status, explicit invariant checks
- **Terra** — small isolated implementations, routine tests/configuration, straightforward refactors, bounded fixes with known root cause
- **Sol** — nontrivial debugging, multi-file implementation, API/interface reasoning, architecture-sensitive refactoring, integration review
- **Astra** — only under an Astra root, for rare independent high-impact architecture/correctness/root-cause reasoning

## Exploration and debugging

- Scouts may follow concrete dependencies but return a minimal relevant map.
- Implementers must not redesign adjacent modules unless explicitly authorized.
- If broader changes are required, return the dependency/reason instead of silently expanding write scope.
- Parallelize only independent work; avoid parallel writes to the same file, shared API, schema, or generated artifact.

Preferred debugging flow:

1. cheap scout gathers failure location, call path, tests, and logs
2. Sol diagnostician reasons over bounded evidence when needed
3. Terra/Sol implementer patches the identified scope
4. Luna verifier runs deterministic checks

## Verification

Treat executable checks as first-class evidence. Prefer cheap workers/tools for tests, lint/type checks, build/compile, formatting, targeted regressions, and diff/status verification.

Return only files/symbols changed or inspected, concise reason, checks/results, and unresolved issue or required scope expansion.
