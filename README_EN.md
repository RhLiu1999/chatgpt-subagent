# ChatGPT Subagent

[简体中文](README.md) | [English](README_EN.md)

A lightweight Subagent orchestration Skill for **ChatGPT / ChatGPT Work / Codex**.

`chatgpt-subagent` helps capable root agents decompose complex work into bounded child tasks while explicitly controlling model choice, reasoning effort, context, read/write permissions, Skill-read permissions, and verification.

The goal is not to maximize the number of Subagents. The goal is to **delegate sparingly and precisely, keep global understanding at the root, and give each child only the minimum necessary context.**

## Scope

This Skill is intended only for these root-class agents:

- GPT-6 Astra
- GPT-5.6 Sol Max
- GPT-5.6 Sol Ultra

Other root agents should not enable this orchestration workflow by default.

## Root-class boundary

Treat the following as **root-class configurations**:

- GPT-5.6 Sol Max
- GPT-5.6 Sol Ultra
- GPT-6 Astra at any reasoning effort

Root-class configurations normally remain at the root and **must not be used as ordinary subagents**.

The normal subagent pool is:

```text
Sol   ≤ High
Terra ≤ High
Luna  ≤ Medium
```

Therefore, under ordinary operation:

```text
Sol Max root   → Sol / Terra / Luna
Sol Ultra root → Sol / Terra / Luna
Astra < Ultra  → Sol / Terra / Luna
```

The following are forbidden by default:

```text
Sol Max child
Sol Ultra child
Astra child
```

### Sole exception: GPT-6 Astra Ultra

Only a **GPT-6 Astra root running at Ultra** may exceptionally delegate a root-class child, and only for rare, high-value, clearly bounded, independent work.

Under this exception the root may explicitly use:

- Astra at a reasoning effort no higher than the root
- Sol Max
- Sol Ultra, still subject to the Ultra policy below

Do not use this exception for search, formatting, compilation, test execution, routine edits, repository inspection, or ordinary implementation.

## Same-family reasoning ceiling

A child in the **same model family** must not use a higher reasoning effort than the root:

```text
child reasoning ≤ root reasoning
```

A weaker permitted model may use a higher reasoning effort, up to that model's normal child ceiling, as long as the resulting configuration is not root-class.

Examples:

```text
Astra Low    → Astra Medium   ❌
Astra High   → Astra Ultra    ❌
Astra Low    → Sol High       ✅
Astra Low    → Sol Max        ❌ root-class child
Sol Max root → Sol High       ✅
Sol Max root → Sol Max child  ❌ root-class child
Astra Ultra  → Sol Max        ✅ exceptional root-class delegation only
```

## Installation

### npm / npx (recommended)

Project-level:

```bash
npx chatgpt-subagent install
```

Target:

```text
<project>/.agents/skills/subagent
```

Global:

```bash
npx chatgpt-subagent install --global
```

Target:

```text
$HOME/.agents/skills/subagent
```

Additional options:

```bash
npx chatgpt-subagent install --dry-run
npx chatgpt-subagent install --force
npx chatgpt-subagent install --global --force
```

The CLI requires Node.js 18 or later.

### ChatGPT / Work upload

1. Download this repository.
2. Keep the `subagent/` directory and all of its contents.
3. In ChatGPT, open **Plugins → Skills**.
4. Choose **Create → Upload from your computer**.
5. Upload `subagent/`. If an archive is required, zip that directory by itself first.

### Manual installation

Global:

```bash
git clone https://github.com/RhLiu1999/chatgpt-subagent.git
mkdir -p "$HOME/.agents/skills"
cp -R chatgpt-subagent/subagent "$HOME/.agents/skills/subagent"
```

Project-level:

```bash
git clone https://github.com/RhLiu1999/chatgpt-subagent.git /tmp/chatgpt-subagent
mkdir -p .agents/skills
cp -R /tmp/chatgpt-subagent/subagent .agents/skills/subagent
```

## Structure

```text
chatgpt-subagent/
├── package.json
├── bin/
│   └── chatgpt-subagent.js
├── README.md
├── README_EN.md
├── LICENSE
└── subagent/
    ├── SKILL.md
    ├── scientific-writing/
    │   └── SKILL.md
    └── code-development/
        └── SKILL.md
```

The root `SKILL.md` owns general orchestration boundaries. The two scenario Skills only define decomposition patterns for scientific writing and code development.

## Minimum necessary context

Subagents do not inherit full project context by default.

```text
NONE      Dispatch contract only
FRAGMENT  Task-specific rules, excerpts, interfaces, or results
LOCAL     One directly relevant file/module/reference, or an explicitly authorized Skill
FULL      Broad context only when the assigned decision is genuinely project-wide
```

Prefer `NONE / FRAGMENT`. `FULL` requires a concrete reason.

Model strength, reasoning effort, and context size are independent decisions.

## Subagents do not re-read Skills by default

The root reads and resolves project Skills, scenario Skills, `AGENTS.md`, and similar workflow instructions, then passes only the rules needed for the current bounded child task under:

```text
Inherited constraints
```

Default:

```text
Allowed skill reads: NONE
```

A child must not independently reopen `SKILL.md`, project Skills, scenario Skills, `AGENTS.md`, or other workflow instructions.

If a necessary rule is missing, return:

```text
NEEDS_CONTEXT
```

The root then supplies the smallest necessary addition.

A child may read a Skill only when the root explicitly lists the exact Skill under `Allowed skill reads` and explains why it is required.

## Dispatch contract

Every Subagent dispatch should explicitly define at least:

```text
Objective
Model
Reasoning effort
Allowed file reads
Allowed skill reads
Allowed writes
Inherited constraints
Supplied task context
Forbidden actions
Expected output
Verification criterion
```

A child must not independently increase model strength, reasoning effort, permissions, or scope.

## Models and reasoning

### Luna

Search, grep, file discovery, compilation, tests, lint, diff/status inspection, and deterministic checks.

```text
Default: Low
Maximum: Medium
```

### Terra

Bounded implementation, routine local edits, ordinary tests, small refactors, and structured transformations.

```text
Default: Low / Medium
Maximum: High
```

### Sol

Scientific reasoning, substantive technical writing, difficult debugging, multi-file edits, and integration review.

```text
Default: Medium
Complex: High
Maximum as child: High
```

Sol Max / Ultra are root-class configurations, not normal child settings.

### Astra

Astra is root-class and forbidden as a normal child. Only GPT-6 Astra Ultra may use it under the exception above.

## Ultra policy

Ultra is outside the normal escalation ladder.

A child may use Ultra only when all of the following are true:

1. the root is GPT-6 Astra Ultra
2. the user is intentionally spending otherwise-expiring/resetting high-compute budget, such as shortly before a TIBO reset
3. spending that budget now is preferable to conserving it
4. the child task is important and clearly bounded
5. the root explicitly selects Ultra

Otherwise child Ultra is forbidden.

## Failure and escalation

Do not immediately increase reasoning effort after failure:

```text
Missing rule/context
→ NEEDS_CONTEXT; root supplies only the missing material

Task too broad
→ split or narrow it

Model capability mismatch
→ upgrade within the permitted child pool

Reasoning depth insufficient
→ raise reasoning without crossing the applicable ceiling

Root-class child needed
→ available only through the GPT-6 Astra Ultra exception
```

## Root must report Subagent usage concisely

Whenever Subagents are used, the final response must report one line per child with only model, reasoning effort, context level, Skill-read permission, useful access mode, and a compact result.

Recommended format:

```text
Luna | Low | FRAGMENT | Skills: NONE | read-only | Result: checks passed
Terra | Medium | LOCAL | Skills: NONE | write: chapter5.tex | Result: edit completed
```

Do not include chain-of-thought, tool-by-tool logs, reading diaries, or long dispatch prompts.

If no Subagent was used, no report is required.

## Scenario policies

### Scientific Writing

`scientific-writing/` covers Subagent orchestration for research papers, academic monographs, LaTeX, scientific interpretation, literature integration, figures/captions, and cross-section consistency.

### Code Development

`code-development/` covers repository inspection, implementation, debugging, refactoring, testing, build/lint/type checks, diff review, and integration verification.

Split mixed tasks into separate workstreams rather than making every Subagent read both scenario policies.

## Recommended workflow

```text
understand
→ root reads required Skills
→ decide whether delegation adds value
→ decompose into bounded tasks
→ extract task-specific constraints
→ default Allowed skill reads to NONE
→ select permitted child model + reasoning
→ provide minimum necessary context
→ delegate
→ verify
→ integrate
→ report Subagent configuration and result concisely
```

## References

- OpenAI Build Skills: https://learn.chatgpt.com/docs/build-skills
- OpenAI Skills in ChatGPT: https://help.openai.com/en/articles/20001066-skills-in-chatgpt
