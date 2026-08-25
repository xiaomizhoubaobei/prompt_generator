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
项目开启了 commit 签名，系统已配置好 GPG。Agent 在进行 `git commit` 后必须确认 commit 是否成功，如遇 GPG 签名报错需检查配置。

#### 1.5.0 提交 commit 前初始化 GPG 签名环境（提示词，强制必读）
> **🔒 强制性总则（最高优先级，任何提交都必须遵守）**：本项目开启 commit 签名，**每次执行 `git commit` 之前，Agent 都必须先完成 GPG 签名环境的初始化**。下方「步骤一 → 步骤二」是**提交前必须逐条执行的硬性门禁**，**任何一步未通过，均禁止执行 `git commit -S`**。本要求适用于**所有类型的提交**（含 `feat`/`fix`/`docs`/`chore`/`refactor` 等），不因改动类型而豁免。

> **重要背景（以实测环境为准，勿武断假设，勿盲猜）**：是否执行 `install_gpg_keys.sh` 取决于流水线 stage 类型（`script` 型正常自动接管；`npc:go` 内置 NPC 任务不执行任何脚本）。但**「不执行脚本」≠「GPG 变量必然为空 / 必然未就绪」**——实测 `npc:go` 场景下 `GPG_API`/`GPG_KEY` **可能已注入且有值、`gpg` 命令可能已存在**（环境并非铁定为空），此时直接执行 `bash install_gpg_keys.sh` 即**一次性完整成功接管个人签名**。因此：
>   - **不要武断假设必然失败**：先跑脚本 + 自检，以实际输出为准，而不是预设"必然为空、必然走失败分支"。
>   - **也不要武断假设必然就绪**：即使不执行 `install_gpg_keys.sh`，也不能假定签名环境一定已配置好，必须靠脚本接管 + 验签自检闭环确认。
> 提交 commit 前**必须执行下述初始化流程**（跑脚本 + 验签自检），严禁跳过初始化直接 `git commit`，否则签名将回退为裸签/平台章或直接失败。

**步骤一（强制）：提交 commit 前必须手动执行脚本初始化 GPG 签名环境**
> 这是**提交 commit 前必须执行的强制性动作**：Agent **必须主动手动执行** `install_gpg_keys.sh` 完成 GPG 签名环境初始化后再签名提交，**严禁跳过脚本直接 `git commit`**。若未执行本步骤或初始化失败却强行提交，视为**违规操作**。执行时**以实际环境为准**：
>   - **变量已注入且有 `gpg`（最常见，实测命中）** → 脚本直接完整跑通（`GPG 密钥导入成功` + `GPG 验签自检通过`），个人签名**已真实接管**，确认下述 ①② 后即可 `git commit -S`；
>   - **变量为空或 `gpg` 缺失** → 才落入下方 1~8 步手动接管 / 如实上报（注意：变量为空时补装 `gpg` 并不能跳过，真实出路是修密钥仓库 `npc.yml` 的注入）。

必须手动执行已沉淀的独立脚本（唯一推荐方式，无条件优先）：
```bash
bash install_gpg_keys.sh
```
> 该脚本会自动完成下述 1~8 步并做验签自检，失败仅告警不阻断。**执行后必须确认无告警输出、`git config --get user.signingkey` 非空**，才视为初始化成功；若脚本报错或自检失败，必须先确认变量是否注入，再按下方 1~8 步手动接管，或如实上报，**严禁以未初始化的签名环境强行提交**。

> ⚠️ **脚本「退出码 0 ≠ 个人签名已接管」——必须区分两种成功**：手动执行 `bash install_gpg_keys.sh` 时有两种退出码为 0 的情形，**绝不能仅凭退出码为 0 就认定个人签名已接管**：
>   - **变量已注入且 `gpg` 存在（实测最常见）** → 脚本完整跑通，输出 `GPG 密钥导入成功` + `GPG 验签自检通过：Good signature...`，此时个人签名**真实接管** → 进入下方 ① 确认后即可 `git commit -S`；
>   - **变量为空** → 脚本走 `[WARN] 触发者 GPG_API/GPG_KEY 环境变量未设置，GPG 签名将不可用` 分支并优雅跳过（不报错），个人签名**不可用**，只能盖平台章（verified 为 false），应**如实上报**，不得假装已接管。
> 执行后必须追加判定（用「`git config --get user.signingkey` 非空 + 真实 `git log --show-signature` 出现个人指纹」闭环确认接管）：
>   - **① `git config --get user.signingkey` 非空**，且 **`gpg --list-secret-keys` 能看到本人私钥** → 个人签名**已接管**，可 `git commit -S`；
>   - **② 出现 `GPG_API/GPG_KEY 环境变量未设置` 告警**（退出码可能仍为 0）→ 说明环境**未注入个人私钥，个人签名不可用**，提交只能由平台签名器盖平台章（verified 为 false），应**如实上报**「当前环境无法完成个人 GPG 签名接管」；变量为空时**补装 `gpg` 并不能跳过此告警**，真实出路是修密钥仓库 `npc.yml` 的变量注入，不得假装已接管。
>   - **③ 若 `which gpg` 为空** → 环境连 `gpg` 命令都不存在，脚本会在 `gpg --import` 步骤报 `command not found`。此时需先补装 `gnupg`（`apt-get install -y gnupg`）再重跑脚本；若补装后变量仍为空仍会命中 ② 的优雅跳过，此时应按 `npc.yml` 注入问题处理。不得裸签顶替。

> ⚠️ **未初始化即提交的后果（必须知悉）**：未初始化 GPG 签名环境直接 `git commit`，将回退为**裸签/平台章**，平台无法验证为本人签名（verified 为 false），等同未签名，提交将被判定为不合规。因此初始化是**强制前置条件**，不是可选项。

若无法执行该脚本或需手动接管，按以下步骤执行（复刻 `install_gpg_keys.sh` 的初始化逻辑）：
1. **触发者判定**：仅当 `CNB_BUILD_USER=qixiaoxin` 时才启用 GPG 签名模式；否则跳过（无需签名）。
2. **回填 git 身份**：无条件用 `CNB_BUILD_USER_EMAIL`/`CNB_BUILD_USER_NICKNAME`（回退 `CNB_COMMITTER_EMAIL`/`CNB_BUILD_USER`）设置 `user.name`/`user.email`，避免平台签名校验 `403 "Author is invalid"`。
3. **变量校验**：确认 `GPG_API`（或 `PLUGIN_GPG_API`）与 `GPG_KEY`（或 `PLUGIN_GPG_KEY`）均已注入，缺任一则告警并如实上报（不要裸签）。
4. **配置 loopback 模式**：写 `$HOME/.gnupg/gpg.conf` 与 `gpg-agent.conf` 的 `loopback` pinentry 配置（容器无 TTY 环境）。
5. **拉取分发 API**：用带指数退避重试的 `curl` 拉取 JSON，解析 `platform` 与 `private_key_url`。
6. **下载并导入私钥**：下载私钥到临时文件；提取主+子指纹，再用 `gpg --import`（`--passphrase "$gpg_key"`）导入主密钥环，导入后即删临时文件。
7. **配置 git 全局签名**：生成 GPG 包装脚本 `/tmp/gpg-wrapper.sh`（loopback + passphrase），设置 `user.signingkey`（主指纹）、`commit.gpgsign`、`tag.gpgsign`、`gpg.program`。
8. **验签自检**：在临时 git 仓库执行一次真实 `git commit -S` + `git log --show-signature`，比对指纹是否落在本人密钥上；失败仅告警不阻断。

**步骤二（强制）：签名提交**
- 仅当步骤一初始化成功后才可用 `git commit -S` 提交；**提交后必须确认签名被平台认可**（`git log --show-signature` 检查指纹落在本人密钥，或平台 verified 状态）。若提交后验签显示 `unknown_key`、`NO_PUBKEY` 或 verified 为 false，说明签名环境未真正接管，**必须回退到步骤一重新初始化后重提**，严禁放任未签名 commit 入库。
- **签名提交未通过即禁止 push**：若验签未通过，不得推送该 commit 到远程，须先在本地修正签名环境再重新提交。

> 💡 上述流程中 `GPG_KEY`（或 `PLUGIN_GPG_KEY`）即下发私钥的 **passphrase**：私钥为加密存储，每次 `gpg --import` 都必须以它为 `--passphrase` 解锁才能导入。手动接管时同样以 `gpg_key="${PLUGIN_GPG_KEY:-${GPG_KEY:-}}"` 读取，严禁自行猜测/拼接口令。
> 💡 严禁自行生成新的 GPG 密钥（新密钥公钥未登记到 CNB 平台，平台会因 `unknown_key` 判定未签名）。

#### 1.5.1 自动签名环境（流水线自动初始化）
> 本节适用于**执行 `.cnb.yml` 中 `install_gpg_keys.sh` stage 的正常流水线**（`script` 类型 stage，容器启动时由入口脚本自动接管）。若你在 **`npc:go`**（平台内置 NPC 任务，不执行任何脚本）场景下，自动接管**不会生效**，请直接按上文 `1.5.0` 在提交前自行初始化。

- 注入的 `GPG-API`/`GPG-key`（或 `PLUGIN_GPG_API`/`PLUGIN_GPG_KEY`）私钥会在容器启动时由 `install_gpg_keys.sh` 自动导入，并配置 git 全局 `user.signingkey` 与 `commit.gpgsign=true`。**Agent 无需自行读取环境变量导入密钥**，只需确认签名环境就绪后 `git commit -S` 即可。
- **首次提交前必须自检签名环境**（以下命令属于签名自检，不受"禁止 env/printenv 环境探索"约束，允许执行）：`git config --get user.signingkey` 非空、`git config --get commit.gpgsign` 为 true、`gpg --list-secret-keys` 存在私钥。
- **严禁自行生成新的 GPG 密钥**：自行生成的新密钥公钥未登记到 CNB 平台，平台会因 `unknown_key` 无法验证签名（verified 为 false），等同未签名。
- 若签名自检发现 `user.signingkey` 为空或 `gpg --list-secret-keys` 无私钥，说明 `install_gpg_keys.sh` 未能完成密钥接管（并非一定是变量未注入）：需核对启动日志区分变量是否进容器与命中的具体告警出口（API 不可达 / 私钥下载失败 / 密钥导入失败），如实汇报所见的诊断行，严禁笼统断言"变量未注入"掩盖真实断点；据此判断是需在密钥仓库 `npc.yml` 修变量注入，还是需重试/排查网络与私钥链路。签名环境未就绪时必须在评论中如实说明并提示用户，严禁自行生成密钥或提交未签名 commit 顶替。
- 提交后必须验证签名被平台认可（`git log --show-signature` 检查指纹，或确认平台 verified 状态），如遇 `unknown_key`、`NO_PUBKEY` 或 verified 为 false，需重新确认签名环境并改用注入的密钥重新签名。

**推送 commit 前的主动接管自检（每次推送前强制执行）**：
- 无论自动接管/兜底重试是否已就绪，**每次推送 commit 之前，Agent 都必须主动执行一次签名环境自检**，并在确认未接管时按上文手动接管流程接管后再推送。这是对自动接管的第一道主动防线，而非仅在自动接管重试耗尽后才介入：
  1. 推送前先运行签名自检（不受"禁止 env/printenv 环境探索"约束）：`git config --get user.signingkey`、`git config --get commit.gpgsign` 是否为 true、`gpg --list-secret-keys` 是否存在私钥；三者任一缺失即判定"未接管"。
  2. 未接管时，优先按上文手动接管流程完成接管，再通过一次真实 `git commit -S` + `git log --show-signature` 回验签名落在本人密钥指纹上。
  3. 回验通过后方可 push 并创建/更新 PR；自检发现未接管且接管失败时，**严禁绕过签名裸推未签名 commit**，须在评论中如实上报后交由用户判断。
- 该自检同样适用于改代码后需推送的任一阶段（含 `docs`/`chore` 等非代码提交），保证任何推送出去的 commit 都是已签名的。

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

### 3.6 Github 凭据环境变量（`GH_TOKEN` 与 `GIT_ACCESS_TOKEN`）
本仓库存在**两套用途完全不同的 Github 凭据**，**严禁混用**：

- **`GH_TOKEN`**（Github Personal Access Token）
  - **用途**：仅用于 `gh` CLI 与 **Github REST API** 的 API 级操作，例如在 `github.com/xiaomizhoubaobei/prompt_generator` 镜像仓库创建一模一样的 PR（见 3.5）、读取仓库/分支/PR/Issue 数据等。
  - **不用于** git 推送（push）本身。
- **`GIT_ACCESS_TOKEN`**（配合 `GIT_USERNAME` / `GIT_EMAIL`）
  - **用途**：由 `.cnb.yml` 中 `main: push` 事件下的「同步到GitHub」stage（`tencentcom/git-sync` 镜像）使用，以 `auth_type: https` 的方式将代码**推送同步**到 Github 镜像仓库。
  - 该凭据由流水线自动使用，Agent 一般无需直接调用；**不要**用它去调用 `gh` CLI 或 Github API。

**安全要求（对上述所有凭据均适用）**：
- 这些令牌属于敏感凭据，**严禁**将其硬编码写入源码、AGENTS.md 或其他任何被提交到仓库的文件中。
- 必须通过 CI/CD 流水线的密钥/环境注入机制（如 CNB 的密钥管理，或 `.cnb.yml` 中通过 `imports` 引入的密钥配置）安全注入到运行环境，供流水线与 Agent 在运行时读取。
- 提交前 gitleaks 密钥扫描会拦截疑似泄漏的令牌，若扫描未通过需检查是否误将 `GH_TOKEN` / `GIT_ACCESS_TOKEN` 的值写入文件。

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
