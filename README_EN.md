# ChatGPT Subagent

[简体中文](README.md) | [English](README_EN.md)

A lightweight Subagent orchestration Skill for **ChatGPT / ChatGPT Work / Codex**.

`chatgpt-subagent` helps capable root agents decompose and delegate bounded tasks across models while explicitly controlling model selection, reasoning effort, context size, read/write permissions, execution boundaries, and verification.

The goal is not to maximize the number of Subagents. The goal is to make each delegation bounded, efficient, and auditable while reducing unnecessary use of expensive models and oversized context.

## Scope

This Skill is intended only for high-capability root agents:

- GPT-6 Astra
- GPT-5.6 Sol Max
- GPT-5.6 Sol Ultra

Other root agents should not enable this orchestration workflow by default.

Hard boundaries:

- Sol Max / Sol Ultra may delegate only to Sol, Terra, and Luna.
- **A Sol root must never delegate to Astra.**
- An Astra root may delegate to Astra, Sol, Terra, or Luna, but Astra Subagents should remain exceptional.

## Installation

### npm / npx (recommended)

After the first npm release is published, install directly with `npx` without adding the package to your project dependencies.

#### Project-level installation

Run from the target project root:

```bash
npx chatgpt-subagent install
```

Target:

```text
<project>/.agents/skills/subagent
```

#### Global installation

```bash
npx chatgpt-subagent install --global
```

Target:

```text
$HOME/.agents/skills/subagent
```

Additional options:

```bash
# Show the destination without writing files
npx chatgpt-subagent install --dry-run

# Replace an existing installation
npx chatgpt-subagent install --force

# Replace a global installation
npx chatgpt-subagent install --global --force
```

The CLI requires Node.js 18 or later.

> `npx` is only a convenience installer provided by this project. The Skill itself is still installed into the `.agents/skills` directory used by ChatGPT / Codex workflows.

### ChatGPT / Work upload

1. Download this repository.
2. Keep the `subagent/` directory and all of its contents.
3. In ChatGPT, open **Plugins → Skills**.
4. Choose **Create → Upload from your computer**.
5. Upload `subagent/`. If the file picker requires an archive, zip that directory by itself first.

After installation, you can explicitly invoke it with `@subagent` in ChatGPT / Work, or allow the system to select it automatically when the task matches its description.

### Manual installation

#### User-level / global

```bash
git clone https://github.com/RhLiu1999/chatgpt-subagent.git
mkdir -p "$HOME/.agents/skills"
cp -R chatgpt-subagent/subagent "$HOME/.agents/skills/subagent"
```

#### Project-level

```bash
git clone https://github.com/RhLiu1999/chatgpt-subagent.git /tmp/chatgpt-subagent
mkdir -p .agents/skills
cp -R /tmp/chatgpt-subagent/subagent .agents/skills/subagent
```

Project layout:

```text
<project>/
└── .agents/
    └── skills/
        └── subagent/
            ├── SKILL.md
            ├── scientific-writing/
            │   └── SKILL.md
            └── code-development/
                └── SKILL.md
```

PowerShell:

```powershell
git clone https://github.com/RhLiu1999/chatgpt-subagent.git $env:TEMP\chatgpt-subagent
New-Item -ItemType Directory -Force .agents\skills | Out-Null
Copy-Item -Recurse $env:TEMP\chatgpt-subagent\subagent .agents\skills\subagent
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

The root `SKILL.md` is intentionally small. It owns only:

- whether delegation is appropriate
- scenario routing
- model boundaries
- reasoning-effort rules
- minimum-context rules
- read/write and external-action boundaries
- escalation after failure

The two scenario directories define how Subagents should be decomposed for scientific writing and code development.

## Core principles

### Minimum necessary context

Subagents do not inherit full project context or complete Skills by default.

```text
NONE      Dispatch contract only
FRAGMENT  Task-specific rules, excerpts, interfaces, or results
LOCAL     One directly relevant Skill/reference/file/module or bounded set
FULL      Broad context only when the assigned decision is genuinely project-wide
```

The normal default is `NONE / FRAGMENT`. `FULL` requires a concrete reason.

### Model, reasoning, and context are independent

Treat these as three separate decisions:

```text
Model
Reasoning
Context
```

For example:

```text
Luna  + Low    + NONE
Terra + Medium + FRAGMENT
Sol   + High   + LOCAL
Astra + Low    + FRAGMENT
```

A stronger model does not automatically require more context.

### Explicit model and reasoning selection

Every Subagent dispatch must explicitly specify:

```text
model
reasoning effort
```

Do not rely on implicit inheritance from the root agent. A Subagent must not upgrade its own model or reasoning effort.

### Subagents are bounded workers

Every delegated task should explicitly define at least:

```text
Objective
Model
Reasoning effort
Allowed reads
Allowed writes
Required context
Forbidden actions
Expected output
Verification criterion
```

The root agent remains responsible for global understanding, decomposition, dependency ordering, model/context selection, final verification, and integration.

## Reasoning levels

### Luna

Use for search, grep, file discovery, compilation, test execution, linting, diff/status inspection, and other deterministic work.

```text
Default: Low
Maximum: Medium
```

If Luna Medium is insufficient, prefer a stronger model.

### Terra

Use for bounded implementation, routine local edits, ordinary tests, small refactors, and structured transformations.

```text
Default: Low / Medium
Maximum: High
```

If Terra High is insufficient, prefer Sol.

### Sol

Use for scientific reasoning, substantive technical writing, complex implementation, debugging, multi-file changes, integration review, and architecture-sensitive work.

```text
Default: Medium
Complex work: High
Exceptional bounded work: Max
```

A Sol Max / Ultra root does not imply Max / Ultra Sol Subagents.

### Astra

Astra Subagents may only be created by an Astra root. They are reserved for rare, independent, high-value reasoning tasks where using Sol would materially increase correctness risk.

## Ultra policy

Ultra is **not part of the normal escalation ladder**.

A Subagent may use Ultra only when all of the following are true:

1. the root agent itself is running at Ultra
2. high-compute quota is about to expire or TIBO is about to reset
3. spending the remaining budget now is preferable to conserving it
4. the delegated task is important enough to benefit from Ultra
5. the root explicitly selects Ultra for that dispatch

Otherwise:

```text
Subagent Ultra = forbidden
```

Ultra is a special budget-use mode, not a normal quality tier.

## Failure and escalation

Do not immediately increase reasoning effort when a Subagent struggles.

```text
Missing context
→ provide only the missing context

Task scope too broad
→ narrow or restructure the task

Model capability mismatch
→ use a stronger model

Context is sufficient and the model is appropriate,
but reasoning depth is insufficient
→ increase reasoning effort
```

Do not use additional reasoning to compensate for missing files, permissions, information, or an unclear task contract.

## Scenario policies

### Scientific Writing

`scientific-writing/` covers research papers, academic monographs, LaTeX, scientific interpretation, literature integration, figures and captions, terminology consistency, cross-section consistency, and scientific review.

### Code Development

`code-development/` covers repository inspection, implementation, debugging, refactoring, testing, build / lint / type checks, diff review, and integration verification.

For mixed tasks, split the workstreams first and load the corresponding scenario Skill independently. Do not make every Subagent read both scenario policies merely because the overall task spans both domains.

## Recommended workflow

```text
understand
→ decide whether delegation is useful
→ decompose into bounded tasks
→ select scenario policy
→ select model
→ select reasoning effort
→ provide minimum necessary context
→ define read/write boundaries
→ delegate
→ verify
→ integrate
```

## References

- OpenAI Build Skills: https://learn.chatgpt.com/docs/build-skills
- OpenAI Skills in ChatGPT: https://help.openai.com/en/articles/20001066-skills-in-chatgpt
