# Agent Instructions

本项目（AI 提示词专家 / prompt_generator）高度依赖 AI Agent 进行自动化辅助开发。为了确保开发质量、代码安全及稳定性，所有参与本项目的 AI Agent 必须严格遵守以下详尽规范：

## 1. Git 提交规范 (Git Commits)

### 1.1 语言要求
- **绝对要求：所有 Git 提交信息（commit messages）必须完全使用中文编写。** 严禁出现全英文的提交描述。

### 1.2 格式要求
遵循 Angular 提交规范，格式为 `<type>(<scope>): <subject>`。
- **type** 允许的类型：
  - `feat`: 新功能 (feature)
  - `fix`: 修复 bug
  - `docs`: 文档修改 (documentation)
  - `style`: 代码格式修改（不影响代码运行的变动，如空格、格式化等）
  - `refactor`: 重构（既不是新增功能，也不是修改 bug 的代码变动）
  - `perf`: 优化相关，比如提升性能、体验
  - `test`: 增加测试
  - `chore`: 构建过程或辅助工具的变动
- **scope** (可选): 影响的范围，比如 `config`, `cnb`, `prompt` 等。
- **subject**: 简短描述，不超过 50 个字符。

### 1.3 提交示例
- ✅ 正确：`feat(prompt): 新增 CO-STAR 结构优化模板`
- ✅ 正确：`fix: 修复 CRISPE 模板在长文本下的渲染问题`
- ❌ 错误：`fix: update prompt template` (使用了英文)
- ❌ 错误：`update App.tsx` (格式错误且无意义)

### 1.4 提交前检查 (Pre-commit Checks)
- 项目中有 `.pre-commit-config.yaml` 文件，必须在执行 `git commit` 前按以下步骤执行：
  1. 安装 pre-commit：`pip install pre-commit`
  2. 手动对所有文件运行检查：`pre-commit run --all-files`
- 当前钩子包含 `gitleaks`（密钥扫描）与通用 hooks（`trailing-whitespace`、`end-of-file-fixer`、`check-yaml`、`check-added-large-files`、`check-toml`）。**提交前必须确保 gitleaks 扫描通过，严禁提交任何疑似密钥/凭据。**

### 1.5 GPG 签名
项目开启了 commit 签名。Agent 在进行 `git commit` 后必须确认 commit 是否成功，如遇 GPG 签名报错需检查配置。

> **提交前必须自检签名环境**：`git config --get user.signingkey` 非空、`git config --get commit.gpgsign` 为 true、`gpg --list-secret-keys` 存在私钥。签名环境未就绪时必须在评论中如实说明并提示用户，严禁自行生成新密钥或提交未签名 commit 顶替。

## 2. 编码与代码规范 (Coding Standards)

### 2.1 语言与类型
- 核心代码库使用 **TypeScript** 编写。
- 必须遵守严格的类型检查（`strict: true`）。禁止滥用 `any` 类型，能推导或定义接口的地方必须明确类型。

### 2.2 框架与命名
- 项目使用 **React 19 + Redux Toolkit + react-router-dom + Tailwind CSS + Radix UI**。组件按既有目录组织（`src/` 下），遵循项目现有的命名习惯。
- 变量和函数命名必须具备明确语义（驼峰命名法）。
- **必须提供中文注释**。特别是在以下场景：
  - 核心逻辑（如提示词优化框架的分流、API 调用）。
  - 提示词模板处理的黑科技或特殊补丁逻辑。
  - 正则表达式和复杂的 API 请求。

### 2.3 错误处理与日志
- 所有的异步调用必须有妥善的 `try/catch` 或者 `.catch()` 处理。
- 对于异常，必须在日志中保留完整的堆栈和上下文信息，便于后续诊断。

## 3. 工作流与文件操作行为准则 (Workflow Guidelines)

### 3.1 阅读先于修改（禁止盲猜代码）
- 在编辑任何文件之前，**必须先使用专用工具（如 `view_file`、`cat`、`grep` 等）读取文件的真实内容**。
- 严禁凭记忆或通用经验盲猜代码结构。

### 3.2 局部精准修改
- 在修改配置或代码时，**必须进行局部精准的正则或行号匹配**。
- **绝对禁止全量覆盖**或意外替换无关内容，避免破坏其他已稳定的逻辑。

### 3.3 修改验证与闭环
- 修改代码后，必须通过 `git diff` 检查实际的变更内容是否符合预期。
- 确认没有混入无关修改后，方可进行 `git add` 和 `git commit` 操作。
- 每次完成任务后，必须确保所有修改已成功推送并提交 PR 到远程仓库的主分支（通过 PR 合并）。

### 3.4 主分支推送约束
- **除非用户明确要求直接推送到主分支**（如"推到主分支""直接合并到主分支""直接 push main"等），否则**禁止直接推送到主分支**。
- 所有代码变更一律通过创建 PR 将代码合并到主分支，确保变更可审查、可追溯。

### 3.5 Github 镜像仓库同步 PR（强制性提示词）
- **判定标准：只要 `.cnb.yml` 中存在将代码同步到 Github 的配置，即属于"同步到 Github 镜像仓库"的情况**（常见形式为在 `main: push` 事件下使用 `git-sync` 镜像同步 stage，目标指向 `github.com/...`）。**只要 `.cnb.yml` 里有这类配置，就必须在对应的 Github 镜像仓库创建一模一样的 PR**（同名、同分支、同变更内容）。
- 本仓库 `.cnb.yml` 在 `main: push` 事件下配置了 `git-sync` stage，目标为 `https://github.com/xiaomizhoubaobei/prompt_generator.git`，**属于"同步到 Github 镜像仓库"的情形**，因此必须在 Github 镜像仓库同步创建完全一致的 PR。
- 这是**强制性要求**，不得遗漏，确保 CNB 与 Github 镜像仓库的代码变更保持同步、可追踪。

## 4. 持续集成与部署规范 (CI/CD - .cnb.yml)

### 4.1 配置文件规范
- 本项目使用 CNB (Cloud Native Build) 构建流水线（基于 `.cnb.yml`）。
- 在修改 `.cnb.yml` 时，必须严格遵守 YAML 的缩进规范（通常为 2 个空格）。

### 4.2 环境依赖
- 如果在流水线的某一个 stage 中引入了需要构建或运行容器镜像的操作（如 `docker build`、`docker run`、基于其他镜像执行脚本等），**必须在该事件或作业级别明确声明 `services: - docker`**，否则会导致流水线无法正常挂载 Docker 守护进程。

## 5. 特定业务逻辑指导 (Domain Specifics)

### 5.1 提示词优化框架 (Prompt Optimization)
- 本项目提供多种提示词优化方案：**CO-STAR、CRISPE、QStar(Q*)、变分法、Meta Prompting、CoT 思维链、微软优化法、RISE、DRAW（AI 绘画）** 等。
- 修改提示词模板或优化逻辑时，必须保持各框架的**独立性**，避免框架间耦合导致输出串扰。
- 支持多语言（中文/English/日本語），改动 UI 文案时需同步维护 `README.md`、`README_en.md`、`README_ja.md` 的一致性。

### 5.2 AI 模型调用
- **限流与降级**：必须优雅地处理 `429 Too Many Requests`，触发限流时应有清晰的日志和合理的快速阻断/重试机制。
- API 请求应遵循 `.env.example` 中的配置约定，严禁将密钥硬编码到源码或提交到仓库。

## 6. CNB OpenAPI 操作规范 (CNB OpenAPI Operations)

- **使用 curl 调用 API**：在执行任何与 CNB (Cloud Native Build) 相关的操作时，通过 shell 执行 curl 命令直接调用 CNB OpenAPI。
- **从 swagger.json 获取 API 信息**：调用接口前，先从 https://api.cnb.cool/swagger.json 获取最新 API 定义（含接口路径、请求方法、请求参数与鉴权要求），确保参数结构准确后再用 curl 执行。
- **强制查看帮助文档**：在调用 API 之前，请通过 OpenAPI 文档确认参数结构。
