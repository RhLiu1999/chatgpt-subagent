---
name: subagent
description: Minimal subagent orchestration for scientific/technical writing and software development. Use only when the root is GPT-6 Astra, GPT-5.6 Sol Max, or GPT-5.6 Sol Ultra.
---

# Subagent

Keep global context with the root. Delegate only bounded work with the minimum sufficient context.

## Eligibility and route

Use this skill only when the root is **GPT-6 Astra**, **GPT-5.6 Sol Max**, or **GPT-5.6 Sol Ultra**.

- scientific/technical writing, research interpretation, papers/books, LaTeX, literature/results → root may load `scientific-writing/SKILL.md`
- software implementation, debugging, refactoring, testing, build/CI, repository/code review → root may load `code-development/SKILL.md`
- mixed task → split workstreams first; load each scenario only for its own workstream
- simple/local/deterministic task → do it directly when delegation adds no value

Do not load both scenario skills unless both are needed.

## Root-class boundary

Treat these as **root-class configurations**:

- GPT-5.6 Sol Max
- GPT-5.6 Sol Ultra
- GPT-6 Astra at any reasoning effort

Root-class configurations normally stay at the root and MUST NOT be used as subagents.

The normal subagent pool is:

- Sol, up to `High`
- Terra, up to `High`
- Luna, up to `Medium`

Therefore, under ordinary operation:

- a GPT-5.6 Sol Max root may delegate only to Sol / Terra / Luna
- a GPT-5.6 Sol Ultra root may delegate only to Sol / Terra / Luna
- a GPT-6 Astra root below `Ultra` may delegate only to Sol / Terra / Luna
- Sol Max, Sol Ultra, and Astra children are forbidden

### GPT-6 Astra Ultra exception

Only a **GPT-6 Astra root running at Ultra** may delegate a root-class subagent, and only for exceptional, high-value, clearly bounded independent work.

Under this exception the root may explicitly select:

- Astra at a reasoning effort no higher than the Astra root
- Sol Max
- Sol Ultra, still subject to the Ultra exception below

Do not use this exception for search, formatting, compilation, test execution, routine editing, repository inspection, or ordinary implementation.

## Same-family reasoning ceiling

A child using the **same model family** as the root MUST NOT use a higher reasoning effort than the root.

A weaker permitted model may use a higher reasoning effort, up to that child model's normal ceiling, as long as the resulting configuration is not root-class.

Examples:

```text
Astra Low    → Astra Medium     FORBIDDEN
Astra High   → Astra Ultra      FORBIDDEN
Astra Low    → Sol High         ALLOWED
Astra Low    → Sol Max          FORBIDDEN (root-class child)
Sol Max root → Sol High         ALLOWED
Sol Max root → Sol Max child    FORBIDDEN (root-class child)
Astra Ultra  → Sol Max          ALLOWED only as an exceptional root-class delegation
```

The root must explicitly select both child model and reasoning effort. A worker must never upgrade either by itself.

## Skill-read policy

**The root reads and resolves relevant Skills. Workers do not re-read them by default.**

For every worker dispatch, default to:

```text
Allowed skill reads: NONE
```

If the root has already read a relevant project Skill, scenario Skill, workflow Skill, `AGENTS.md`, or other instruction source:

1. extract only the constraints needed by the worker
2. pass those constraints under `Inherited constraints`
3. do not tell the worker to rediscover or re-read the original Skill

A worker MUST NOT open `SKILL.md`, project Skills, scenario Skills, `AGENTS.md`, or other workflow instructions unless the root explicitly lists the exact file under `Allowed skill reads`.

If a required rule is missing, the worker must return `NEEDS_CONTEXT` with the missing item instead of opening a Skill on its own.

Skill access is explicit opt-in. It is not inherited merely because the task relates to a Skill.

The root may authorize a Skill read only when distilled constraints are insufficient for the bounded task. The dispatch must name the exact Skill and briefly state why it is needed.

Otherwise keep `Allowed skill reads: NONE`.

## Dispatch contract

Every subagent dispatch MUST explicitly specify:

- objective
- model
- reasoning effort
- allowed file reads
- allowed skill reads
- allowed writes
- inherited constraints
- supplied task context
- forbidden actions
- expected output
- verification condition

Never rely on inherited model or reasoning settings. A worker must not expand scope without returning the need to the root.

Recommended default:

```text
Allowed skill reads: NONE
Inherited constraints: only the task-relevant rules already resolved by the root
```

## Context levels

Use the lowest sufficient level:

- `NONE` — task contract only
- `FRAGMENT` — extracted rules/excerpts/interfaces/results
- `LOCAL` — one directly relevant reference/file/module or explicitly authorized Skill
- `FULL` — broad instructions only because the assigned decision is genuinely project-wide

Default: `NONE` or `FRAGMENT`. `FULL` requires a concrete reason.

Model strength, reasoning effort, and context size are independent. Never load a full Skill when extracted rules are enough.

`LOCAL` or `FULL` context does not automatically grant Skill-read permission. `Allowed skill reads` remains separately controlled.

## Root reporting

If one or more subagents were used, the root MUST include a **very short subagent report** in the final response.

Report one line per subagent and include only:

- model
- reasoning effort
- context level
- Skill-read permission
- access mode when useful (`read-only` or `write:<scope>`)
- compact result

Recommended format:

```text
Luna | Low | FRAGMENT | Skills: NONE | read-only | Result: 3 references verified
Terra | Medium | LOCAL | Skills: NONE | write: chapter5.tex | Result: edit completed, checks passed
```

Keep the report terse. Do not include chain-of-thought, hidden reasoning, tool-by-tool logs, reading diaries, or long dispatch prompts.

If no subagent was used, no subagent report is required.

## Model and reasoning

Choose the cheapest model and lowest reasoning effort that can reliably complete the bounded task while respecting the root-class boundary.

- **Luna** — `Low` default, `Medium` if modest synthesis is needed; `High/Max/Ultra` forbidden. Use for search, inspection, execution, compile/test/lint/grep/diff and deterministic checks.
- **Terra** — `Low` for simple execution, `Medium` for normal implementation/editing, `High` for difficult bounded work; `Max/Ultra` forbidden. If Terra High is insufficient, prefer Sol.
- **Sol** — `Medium` default for substantive reasoning, `High` for difficult reasoning/debug/review. `Max/Ultra` are root-class configurations and forbidden as children except under the GPT-6 Astra Ultra exception.
- **Astra** — root-class and forbidden as a child except under the GPT-6 Astra Ultra exception.

## Ultra exception

Ultra is outside the normal escalation ladder.

A child may use `Ultra` only when ALL are true:

1. the root is GPT-6 Astra Ultra
2. the user is intentionally spending otherwise-expiring/resetting high-compute budget, such as shortly before a TIBO reset
3. spending that budget now is preferable to conserving it
4. the delegated task is substantial enough to justify Ultra
5. the root explicitly selects Ultra for that dispatch

Otherwise child Ultra is forbidden. A child must never upgrade itself to Ultra. Difficulty alone, a single failure, or possible marginal quality gain is not sufficient justification.

## Escalation

When a worker struggles, diagnose before spending more compute:

1. missing rule/context → return `NEEDS_CONTEXT`; root supplies only the missing material
2. task too broad → split or narrow it
3. model mismatch → upgrade within the permitted child pool
4. reasoning depth genuinely insufficient → raise reasoning effort without crossing the applicable ceiling
5. root-class escalation → only through the GPT-6 Astra Ultra exception

Do not let a worker compensate for missing context by browsing Skills or broad project instructions. Do not use higher reasoning to compensate for missing files, information, permissions, or an unclear contract.

## Shared boundaries

- The root owns global policy, Skill interpretation, dependency ordering, integration, and final acceptance unless explicitly delegated.
- Workers may modify only assigned files/regions. Avoid overlapping parallel writes; serialize overlap through one owner/integrator.
- Use deterministic tools for deterministic questions.
- Commit, push, publish, deploy, delete, merge, or other external/irreversible actions require explicit assignment.
- Workers return compact integration evidence: findings, changed scope, verification results, and unresolved issues. No exhaustive reading diary unless requested.
