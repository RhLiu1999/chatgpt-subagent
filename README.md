# ChatGPT Subagent

[简体中文](README.md) | [English](README_EN.md)

面向 **ChatGPT / ChatGPT Work / Codex** 的轻量级 Subagent 调度 Skill。

`chatgpt-subagent` 用于帮助高能力主 Agent 将复杂任务拆成有边界的子任务，并显式控制模型、思考等级、上下文、读写权限、Skill 读取权限和验证方式。

目标不是创建尽可能多的 Subagent，而是做到：**少而准地委派，主 Agent 保留全局理解，子 Agent 只拿最小必要上下文。**

## 适用范围

本 Skill 只面向以下 root-class 主 Agent：

- GPT-6 Astra
- GPT-5.6 Sol Max
- GPT-5.6 Sol Ultra

其他主 Agent 不应默认启用这套调度流程。

## Root-class 边界

以下配置视为 **root-class**：

- GPT-5.6 Sol Max
- GPT-5.6 Sol Ultra
- GPT-6 Astra 的任意 reasoning effort

它们通常只作为主 Agent，**默认禁止作为子 Agent**。

正常 Subagent 池只有：

```text
Sol   ≤ High
Terra ≤ High
Luna  ≤ Medium
```

因此正常情况下：

```text
Sol Max root   → Sol / Terra / Luna
Sol Ultra root → Sol / Terra / Luna
Astra < Ultra  → Sol / Terra / Luna
```

以下均默认禁止：

```text
Sol Max child
Sol Ultra child
Astra child
```

### 唯一例外：GPT-6 Astra Ultra

只有 **GPT-6 Astra Ultra root** 才允许例外调用 root-class 子 Agent，而且必须是少数高价值、彼此独立、边界清楚的核心任务。

此时可以显式使用：

- Astra，reasoning 不得高于 root
- Sol Max
- Sol Ultra，但仍受 Ultra 特殊规则约束

不要把这个例外用于搜索、格式调整、编译、测试执行、普通修改、仓库检查或常规实现。

## 同模型 reasoning 上限

同一模型族不能通过 Subagent 偷偷提高 reasoning：

```text
child reasoning ≤ root reasoning
```

但如果降级到更弱、且允许的模型，可以给它更高 reasoning，只要不进入 root-class 配置。

例如：

```text
Astra Low    → Astra Medium   ❌
Astra High   → Astra Ultra    ❌
Astra Low    → Sol High       ✅
Astra Low    → Sol Max        ❌ root-class child
Sol Max root → Sol High       ✅
Sol Max root → Sol Max child  ❌ root-class child
Astra Ultra  → Sol Max        ✅ 仅限例外重型委派
```

## 安装

### npm / npx（推荐）

项目级：

```bash
npx chatgpt-subagent install
```

安装到：

```text
<project>/.agents/skills/subagent
```

全局：

```bash
npx chatgpt-subagent install --global
```

安装到：

```text
$HOME/.agents/skills/subagent
```

其他选项：

```bash
npx chatgpt-subagent install --dry-run
npx chatgpt-subagent install --force
npx chatgpt-subagent install --global --force
```

CLI 要求 Node.js 18 或更高版本。

### ChatGPT / Work 上传

1. 下载本仓库。
2. 保留 `subagent/` 及其全部内容。
3. 在 ChatGPT 中打开 **Plugins → Skills**。
4. 选择 **Create → Upload from your computer**。
5. 上传 `subagent/`。如果需要压缩包，可单独将该目录压缩为 ZIP。

### 手动安装

全局：

```bash
git clone https://github.com/RhLiu1999/chatgpt-subagent.git
mkdir -p "$HOME/.agents/skills"
cp -R chatgpt-subagent/subagent "$HOME/.agents/skills/subagent"
```

项目级：

```bash
git clone https://github.com/RhLiu1999/chatgpt-subagent.git /tmp/chatgpt-subagent
mkdir -p .agents/skills
cp -R /tmp/chatgpt-subagent/subagent .agents/skills/subagent
```

## 目录结构

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

根 `SKILL.md` 负责通用调度边界。两个场景 Skill 只定义科技写作和代码开发中的拆分方式。

## 最小必要上下文

Subagent 默认不继承完整项目上下文。

```text
NONE      仅使用派遣合同
FRAGMENT  任务相关规则、摘录、接口或结果
LOCAL     一个直接相关的文件/模块/reference，或显式授权的 Skill
FULL      只有任务确实需要项目级判断时才提供广泛上下文
```

默认优先 `NONE / FRAGMENT`。`FULL` 必须有具体理由。

模型强度、reasoning effort 和 context size 是三个独立决策。

## 子 Agent 默认禁止重复读取 Skill

主 Agent 负责读取和解析项目 Skill、场景 Skill、`AGENTS.md` 等，然后只把当前子任务需要的规则放进：

```text
Inherited constraints
```

默认：

```text
Allowed skill reads: NONE
```

子 Agent 不得自行重新打开 `SKILL.md`、项目 Skill、场景 Skill、`AGENTS.md` 或其他工作流说明。

如果缺少必要规则，应返回：

```text
NEEDS_CONTEXT
```

由主 Agent 补充最小必要内容。

只有主 Agent 在 `Allowed skill reads` 中显式列出具体 Skill 并说明原因时，子 Agent 才允许读取。

## 派遣合同

每个 Subagent dispatch 至少明确：

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

子 Agent 不能自行提升模型、reasoning、权限或任务范围。

## 模型与 reasoning

### Luna

搜索、grep、文件定位、编译、测试、lint、diff/status 和确定性检查。

```text
默认：Low
最高：Medium
```

### Terra

边界明确的实现、普通局部修改、常规测试、小型重构和结构化转换。

```text
默认：Low / Medium
最高：High
```

### Sol

科学推理、实质性科技写作、复杂调试、多文件修改和集成审计。

```text
默认：Medium
复杂：High
子 Agent 最高：High
```

Sol Max / Ultra 属于 root-class，不是普通子 Agent 配置。

### Astra

Astra 属于 root-class，默认禁止作为子 Agent。只有 GPT-6 Astra Ultra root 可以按上面的例外规则调用。

## Ultra 规则

Ultra 不属于正常升级链。

子 Agent 使用 Ultra 只有在以下条件全部满足时才允许：

1. root 是 GPT-6 Astra Ultra
2. 用户确实希望消耗即将过期或重置的高计算额度，例如 TIBO 即将重置
3. 当前主动消耗额度比保留更合理
4. 子任务足够重要并且边界清楚
5. root 显式指定 Ultra

否则 child Ultra 禁止。

## 失败与升级

不要一失败就加 reasoning：

```text
缺少规则/上下文
→ NEEDS_CONTEXT，由 root 补最小内容

任务太大
→ 重新拆分

模型能力不足
→ 在允许的 child pool 内升级

推理深度不足
→ 提高 reasoning，但不能越过对应上限

需要 root-class child
→ 只有 GPT-6 Astra Ultra exception 可用
```

## 主 Agent 必须简洁报告 Subagent 调用

只要使用了 Subagent，最终回复必须一行一个，简洁报告：模型、reasoning、context、Skill 权限、必要的访问模式和结果。

推荐格式：

```text
Luna | Low | FRAGMENT | Skills: NONE | read-only | 结果：检查通过
Terra | Medium | LOCAL | Skills: NONE | write: chapter5.tex | 结果：修改完成
```

不要输出思维链、逐工具日志、阅读流水账或长篇 dispatch prompt。

没有调用 Subagent 时，不需要报告。

## 两种场景

### Scientific Writing

`scientific-writing/` 负责科研论文、学术专著、LaTeX、结果解释、文献整合、图注和跨章节一致性等任务中的 Subagent 调度。

### Code Development

`code-development/` 负责 repository inspection、implementation、debugging、refactoring、testing、build/lint/type check、diff review 和 integration verification 等任务中的 Subagent 调度。

混合任务先拆成独立工作流，不让所有 Subagent 同时读取两套场景规则。

## 推荐工作流

```text
理解任务
→ root 读取必要 Skill
→ 判断是否值得委派
→ 拆成 bounded tasks
→ 提取任务相关约束
→ 默认 Allowed skill reads: NONE
→ 选择允许的 child model + reasoning
→ 提供最小必要上下文
→ 派遣
→ 验证
→ 集成
→ 简洁报告 Subagent 配置和结果
```

## 参考

- OpenAI Build Skills: https://learn.chatgpt.com/docs/build-skills
- OpenAI Skills in ChatGPT: https://help.openai.com/en/articles/20001066-skills-in-chatgpt
