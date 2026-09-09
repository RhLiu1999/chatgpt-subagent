# ChatGPT Subagent

[简体中文](README.md) | [English](README_EN.md)

面向 **ChatGPT / ChatGPT Work / Codex** 的轻量级 Subagent 调度 Skill。

`chatgpt-subagent` 用于帮助高能力主 Agent 将任务拆分并委派给不同模型，同时显式控制：

- 子 Agent 使用的模型
- 思考等级
- 上下文范围
- 读写权限
- 执行边界
- 验证方式

它的目标不是尽可能多地创建 Subagent，而是让每一次委派都具有明确边界，并尽量减少不必要的高能力模型调用和上下文消耗。

## 适用范围

本 Skill 仅面向以下高能力主 Agent：

- GPT-6 Astra
- GPT-5.6 Sol Max
- GPT-5.6 Sol Ultra

其他主 Agent 不应默认启用这套多代理调度流程。

硬性边界：

- Sol Max / Sol Ultra 只能委派给 Sol、Terra、Luna。
- **Sol 主 Agent 禁止调用 Astra。**
- Astra 主 Agent 可以委派给 Astra、Sol、Terra、Luna，但 Astra Subagent 应保持例外使用。

## 安装

### 全局安装

适合希望在多个项目中都可以使用 `subagent` 的用户。

#### ChatGPT / Work

1. 下载本仓库。
2. 保留 `subagent/` 目录及其全部内容。
3. 在 ChatGPT 中打开 **Plugins → Skills**。
4. 选择 **Create → Upload from your computer**。
5. 上传 `subagent/` Skill；如果文件选择器要求压缩包，可先将 `subagent/` 单独压缩为 ZIP 后上传。

安装后，可在 ChatGPT / Work 中通过 `@subagent` 显式调用，也可以在匹配其描述的任务中由系统自动选择。

#### 本地用户级安装（Codex / ChatGPT desktop local workflows）

OpenAI 当前的用户级 Skill 目录是：

```text
$HOME/.agents/skills
```

安装：

```bash
git clone https://github.com/RhLiu1999/chatgpt-subagent.git
mkdir -p "$HOME/.agents/skills"
cp -R chatgpt-subagent/subagent "$HOME/.agents/skills/subagent"
```

更新：

```bash
cd chatgpt-subagent
git pull
rm -rf "$HOME/.agents/skills/subagent"
cp -R subagent "$HOME/.agents/skills/subagent"
```

### 项目级安装

如果只希望该 Skill 在某一个仓库或项目中可用，推荐使用项目级安装。

将 `subagent/` 放入项目根目录：

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

Linux / macOS：

```bash
git clone https://github.com/RhLiu1999/chatgpt-subagent.git /tmp/chatgpt-subagent
mkdir -p .agents/skills
cp -R /tmp/chatgpt-subagent/subagent .agents/skills/subagent
```

PowerShell：

```powershell
git clone https://github.com/RhLiu1999/chatgpt-subagent.git $env:TEMP\chatgpt-subagent
New-Item -ItemType Directory -Force .agents\skills | Out-Null
Copy-Item -Recurse $env:TEMP\chatgpt-subagent\subagent .agents\skills\subagent
```

Codex 会从当前工作目录向仓库根目录扫描 `.agents/skills`。因此，项目级安装可以把这个调度策略限制在当前项目中，避免对无关项目产生影响。

> 注：ChatGPT Projects 的网页界面目前没有公开文档说明存在独立的“项目专属 Skill 安装槽位”。如果你使用的是本地仓库型 Work/Codex 工作流，使用 `.agents/skills/subagent`；如果希望在 ChatGPT / Work 的多个项目中复用，则使用上面的全局 Skills 安装方式。

## 目录结构

```text
subagent/
├── SKILL.md
├── scientific-writing/
│   └── SKILL.md
└── code-development/
    └── SKILL.md
```

根 `SKILL.md` 只负责：

- 是否适合委派
- 场景路由
- 模型边界
- 思考等级规则
- 最小上下文规则
- 读写与外部操作边界
- 失败后的升级策略

两个子目录分别定义科技写作和代码开发场景中的 Subagent 拆分方式。

## 核心原则

### 最小必要上下文

Subagent 默认不继承完整项目上下文，也不默认读取完整 Skill。

使用最小充分级别：

```text
NONE      仅使用派遣合同
FRAGMENT  只提供任务相关规则、摘录、接口或结果
LOCAL     读取一个直接相关的 Skill / reference / 文件 / 局部模块
FULL      只有任务确实需要项目级判断时才读取广泛上下文
```

默认优先：

```text
NONE / FRAGMENT
```

`FULL` 必须有具体理由。

### 模型、思考等级和上下文独立

三者应分别决定：

```text
Model
Reasoning
Context
```

例如：

```text
Luna  + Low    + NONE
Terra + Medium + FRAGMENT
Sol   + High   + LOCAL
Astra + Low    + FRAGMENT
```

更强的模型并不意味着需要更大的上下文。

### 每次派遣必须显式设置模型和思考等级

每个 Subagent dispatch 都必须明确指定：

```text
model
reasoning effort
```

不要依赖主 Agent 设置的隐式继承。Subagent 也不能自行提升自己的模型或思考等级。

### Subagent 是有边界的 Worker

每个委派任务应至少明确：

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

主 Agent 负责全局理解、拆分、依赖排序、模型选择、上下文选择、最终验证和集成。

## 思考等级

### Luna

适合搜索、grep、文件定位、编译、测试执行、lint、diff/status 检查和其他确定性任务。

```text
默认：Low
最高：Medium
```

Luna Medium 不足时，应优先升级模型。

### Terra

适合边界明确的实现、普通局部修改、常规测试、小型重构和结构化转换。

```text
默认：Low / Medium
最高：High
```

Terra High 不足时，应优先使用 Sol。

### Sol

适合科学推理、实质性科技写作、复杂实现、调试、跨文件修改、集成审计和架构相关工作。

```text
默认：Medium
复杂任务：High
极少数关键封闭任务：Max
```

Sol Max / Ultra 主 Agent 不意味着其 Sol Subagent 自动使用 Max / Ultra。

### Astra

Astra Subagent 仅允许由 Astra 主 Agent 创建，只应用于少数彼此独立、价值较高，并且使用 Sol 会明显增加正确性风险的核心推理任务。

## Ultra 规则

Ultra **不属于正常升级链**。

Subagent 只有在以下条件同时满足时才允许使用 Ultra：

1. 主 Agent 本身正在使用 Ultra。
2. 当前高计算额度即将过期或 TIBO 即将重置。
3. 此时主动消耗剩余额度比保留额度更合理。
4. 当前任务足够重要，确实值得使用 Ultra。
5. 主 Agent 在本次派遣中显式指定 Ultra。

否则：

```text
Subagent Ultra = 禁止
```

Ultra 不是普通质量档位，而是一种特殊的预算使用模式。

## 失败与升级

Subagent 出现问题时，不应立即提升 reasoning。

```text
缺少上下文
→ 补充最小必要上下文

任务边界过大
→ 重新拆分任务

模型能力不足
→ 升级模型

信息充分且模型合适，但推理深度不足
→ 提升 reasoning
```

不要使用更高 reasoning 去补偿缺失的文件、权限、信息或不清晰的任务合同。

## 两种场景

### Scientific Writing

`scientific-writing/` 负责科技写作和科研工作中的 Subagent 调度，例如：

- 科研论文与学术专著
- LaTeX
- 科学结果解释
- 文献整合
- 图和图注
- 术语与跨章节一致性
- Scientific review

### Code Development

`code-development/` 负责软件开发场景中的 Subagent 调度，例如：

- Repository inspection
- Implementation
- Debugging
- Refactoring
- Testing
- Build / lint / type check
- Diff review
- Integration verification

混合任务应先拆成两个工作流，再分别加载对应场景 Skill。不要因为总任务同时包含写作和代码，就让所有 Subagent 同时读取两套规则。

## 推荐工作流

```text
理解任务
→ 判断是否值得委派
→ 拆分为有边界的子任务
→ 选择场景策略
→ 选择模型
→ 选择 reasoning
→ 提供最小必要上下文
→ 明确读写边界
→ 派遣 Subagent
→ 验证结果
→ 主 Agent 集成
```

而不是：

```text
复制完整上下文
→ 创建大量 Subagent
→ 让每个 Agent 重新理解整个项目
→ 汇总结果
```

## 参考

- OpenAI Build Skills: https://learn.chatgpt.com/docs/build-skills
- OpenAI Skills in ChatGPT: https://help.openai.com/en/articles/20001066-skills-in-chatgpt
