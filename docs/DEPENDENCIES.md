# 运行依赖与跨 Agent 兼容

安装器只复制已校验文件，不运行技能示例、不发送消息、不启动 GPU 作业，也不修改账号或 shell 配置。

## ARIS 科研工具

已随仓库补齐 `experiment-queue/scripts`、`figure-spec/scripts` 和 `paper-poster-html` 的脚本/模板/许可证，并将原本指向旧电脑的 `shared-references` 符号链接展开成真实文件。`_shared` 是 Nature 系列的公共内容，必须与技能保持同级。

辅助运行树安装在 `<技能目录父级>/skillls-runtime/aris`，包含 `tools`、`templates`、`mcp-servers` 及若干工具的 canonical skills 路径。这是辅助文件子集，**不是完整 ARIS 源码检出**。使用安装报告中的绝对路径为相关进程设置 `ARIS_REPO`，例如默认 Codex 安装：

```bash
export ARIS_REPO="$HOME/.codex/skillls-runtime/aris"
```

自定义 `CODEX_HOME` 或 `--dest` 时必须使用安装报告实际路径。Windows PowerShell 使用 `$env:ARIS_REPO = '实际路径'`。若某工作流需要完整源码、测试集或未随包带入的服务，从已确认上游克隆并固定本机基线：

```bash
git clone https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep.git ARIS
cd ARIS
git checkout c5f3d5bfc694a812012729841e9697223e4f2130
```

将 `ARIS_REPO` 指向完整检出目录，按其中的 `SETUP_GUIDE.md` 配置实际需要的服务。不要用上游安装脚本不加检查地覆盖本仓库的本机适配版本。

## 其他依赖

| 范围 | 使用时需要补齐的内容 |
| --- | --- |
| research-review / auto-review / 子代理类 | 当前宿主的真实子代理或外部模型能力；旧技能声明的模型名称与 reasoning 档位可能已变化，检查当前可用列表 |
| auto-review-loop-llm / minimax | 对应 MCP/API 服务和用户自己配置的密钥；旧文档里的 settings.json 示例是历史内容，不可直接覆盖 Codex 当前配置 |
| gpt-image / imagegen / 论文绘图 | 宿主原生图像工具，或技能要求的 CLI、`OPENAI_API_KEY`；只在用户请求生成时使用 |
| semantic-scholar / openalex / gemini / exa | 相应网络检索工具或 API；按各技能声明配置可选/必需的认证 |
| paper-compile / LaTeX / PDF | LaTeX 发行版、相关字体、Poppler 或 Python PDF 库，以所执行脚本为准 |
| nature-* / documents / spreadsheets / presentations | 各自脚本的 Python/npm 依赖；Codex runtime 工具需匹配宿主，普通 agent 不能通过复制技能获得 |
| run-experiment / queue / qzcli / vast-gpu / serverless-modal | SSH/GPU/平台 CLI 和用户账号；安装技能不会租机器或发起任务 |
| feishu-notify | 用户自行设置通知配置；仓库只保留 `YOUR_WEBHOOK_ID` 示例，不包含真实 webhook |

## 已知迁移限制

- 快照保留本机正文与模型策略，不代表上游最新版或所有 agent 的通用版本。
- 某些旧 ARIS 正文使用 `../../shared-references`；安装包已仅对能确定目标的 Markdown 链接修正为正确相对路径，具体见来源说明。
- 部分示例包含虚构项目路径或开发者示例路径，使用时应替换为当前任务路径，不得当成目标电脑已存在的文件。
- 共享目录和嵌套工具是否自动列为独立 skill 由目标 agent 决定；目录文件已恢复与界面可调用是两项不同验证。
- 没有为所有科研工作流实际运行付费 API、实验或文档输出；本次验证范围是迁移包、安装流程和文件恢复。
