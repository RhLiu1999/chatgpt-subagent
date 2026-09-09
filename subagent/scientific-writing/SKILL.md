---
name: subagent-scientific-writing
description: Scenario-specific subagent orchestration for scientific and technical writing. Read only after the root subagent skill routes here.
---

# Scientific Writing Subagents

The root `subagent/SKILL.md` remains authoritative for eligibility, model/reasoning limits, context levels, Ultra policy, and external actions.

## Bounded roles

Use only roles that add value:

1. **Locator** — finds exact sections, figures, equations, citations, definitions, or prior wording.
2. **Scientific analyst** — resolves a scientific interpretation or checks a technical argument.
3. **Writer/editor** — performs a bounded prose or LaTeX revision from supplied evidence and constraints.
4. **Consistency reviewer** — compares notation, terminology, claims, and cross-section logic over a limited scope.
5. **Mechanical verifier** — checks labels, references, formatting rules, forbidden patterns, compilation, or other deterministic conditions.

## Context

Prefer only the target section, directly relevant definitions/equations, the exact figure/result, necessary comparison text, and extracted project/style constraints.

Prefer excerpt > chapter > manuscript.

Typical access:

- locator / mechanical verifier → `NONE` or `FRAGMENT`
- bounded editor → `FRAGMENT` or `LOCAL`
- scientific analyst → `FRAGMENT` or `LOCAL`, expanding only when scientifically necessary
- project-level scientific/editorial reviewer → `FULL` only when broad consistency is the assigned task

Do not make every worker read the manuscript skill, LaTeX skill, style guide, or project instructions in full.

## Typical model choice

Apply reasoning limits from the root skill.

- **Luna** — locate content, terminology/pattern checks, labels/references, compile/log inspection
- **Terra** — bounded LaTeX edits, captions, local prose cleanup, already-decided citations/cross-references
- **Sol** — substantive scientific writing, result interpretation, cross-section reconciliation, nontrivial notation/argument review
- **Astra** — only under an Astra root, for rare independent high-impact theoretical/scientific reasoning

## Preferred patterns

- **Evidence before prose** — let a cheap locator gather exact evidence, then give the writer only those excerpts plus the target and constraints.
- **Scientific comparison** — give exactly the sections being compared and the comparison criteria, not the full manuscript.
- **Figure/result discussion** — give the figure/result, needed assumptions, target text, and established interpretation that constrains wording.

## Ownership and verification

- One writer owns a section/region at a time.
- Reviewers default to read-only unless explicitly asked to patch.
- Serialize multiple writers touching the same scientific narrative through the root.
- After reasoning, use cheap deterministic checks for compilation, labels/references, forbidden syntax, terminology, and explicit constraints.

Return only changed/read scope, required scientific rationale, verification result, and unresolved uncertainty.
