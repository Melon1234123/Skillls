# 插件技能恢复方法

这些技能依赖插件或宿主工具；安装器不会把它们误计为已安装。版本是原机器盘点版本，不要求新电脑能从目录取得完全相同版本。

## Codex 上的操作

1. 在当前 Codex 的插件目录或插件管理界面搜索下表包名。agent 有对应安装工具时，使用该工具支持的正式安装流程。
2. 对已存在的包先检查启用状态；未安装的执行安装。Google Drive 等连接器需要用户完成授权。
3. 对标为“宿主提供”的包，使用支持相应能力的 Codex 版本，检查技能/工具是否出现；不要假造市场安装命令。
4. 新开会话核对每项 skill 和实际工具。缺失的记录为待恢复，不要仅凭已登录同一账号断言恢复成功。

## 包清单

| 插件 | 原版本 | 安装方式 | 包含技能 |
| --- | --- | --- | --- |
| plugin-management | 0.1.0 | Codex 插件目录搜索 `plugin-management`，安装/启用 | plugin-management |
| sites | 0.1.62 | Codex 插件目录搜索 `sites`，安装/启用 | sites-building, sites-hosting, sites-preview-troubleshooting |
| google-drive | 0.1.16 | Codex 插件目录搜索 `google-drive`，安装/启用 | google-docs, google-drive, google-drive-comments, google-sheets, google-slides |
| hugging-face | 1.0.0 | Codex 插件目录搜索 `hugging-face`，安装/启用 | hf-cli, huggingface-community-evals, huggingface-datasets, huggingface-gradio, huggingface-jobs, huggingface-llm-trainer, huggingface-paper-publisher, huggingface-papers, huggingface-trackio, transformers-js, huggingface-vision-trainer |
| superpowers | 6.3.0 | Codex 插件目录搜索 `superpowers`，安装/启用 | brainstorming, dispatching-parallel-agents, executing-plans, finishing-a-development-branch, receiving-code-review, requesting-code-review, subagent-driven-development, systematic-debugging, test-driven-development, using-git-worktrees, using-superpowers, verification-before-completion, writing-plans, writing-skills |
| template-creator | 26.909.12148 | 宿主提供；升级/启用兼容 Codex，核对实际工具 | template-creator |
| spreadsheets | 26.909.12148 | 宿主提供；升级/启用兼容 Codex，核对实际工具 | excel-live-control, Spreadsheets |
| pdf | 26.909.12148 | 宿主提供；升级/启用兼容 Codex，核对实际工具 | pdf |
| presentations | 26.909.12148 | 宿主提供；升级/启用兼容 Codex，核对实际工具 | Presentations |
| documents | 26.909.12148 | 宿主提供；升级/启用兼容 Codex，核对实际工具 | documents |
| visualize | 1.0.32 | 宿主提供；升级/启用兼容 Codex，核对实际工具 | visualize |

## 其他 Agent

- **Superpowers**：已确认公开上游为 [obra/superpowers](https://github.com/obra/superpowers)。先阅读该仓库对应目标 agent 的当前安装文档，按其步骤恢复 14 个技能及需要的集成；不要把本仓库中已有的本地修改版 brainstorming 等盲目覆盖。
- **Hugging Face**：在目标 agent 中安装它实际支持的 Hugging Face skills/工具，或查看 [Hugging Face Skills](https://github.com/huggingface/skills) 的当前支持方式；该公开仓库是替代安装来源，不承诺与原 Codex 插件 1.0.0 内容完全一致。
- **Google Drive、Sites 和 plugin-management**：需要目标宿主等价的连接器/插件机制。没有相应能力时标为不支持；复制说明文本不能创建远程工具。
- **documents、spreadsheets、presentations、pdf、template-creator、visualize**：原版本含 Codex runtime 耦合。其他 agent 需要自行配置适用的文档处理工具，不能宣称与 Codex 专属能力完全等价。

机器可读包名、技能列表和盘点版本见 [skills.json](../manifests/skills.json)。

## Superpowers 完整快照

完整包见 [plugins/superpowers](../plugins/superpowers)。14 个子技能实际文件均已包含，清单中的 `bundled_path` 可逐项定位。原有三个本地独立版本（brainstorming、writing-plans、subagent-driven-development）保持独立；两种版本可能不同。

Codex 优先通过原生插件机制恢复，保留 `superpowers:` 命名空间。若目标宿主支持从本地插件目录注册，使用完整包；否则从其插件目录安装。文件存在不能代替插件启用验证。

仅支持技能目录的 agent，可将完整 14 个子技能复制到一个**独立、且已确认会被宿主扫描的目录**：

```bash
python3 install.py --agent custom --dest /actual/main/skills --superpowers-dest /actual/isolated/superpowers/skills
```

不要照抄示例路径。这个选项恢复技能定义和配套文件，不注册原生插件。先确认宿主对嵌套目录和同名技能的处理；如果不支持两种版本并存，报告三个同名技能的版本冲突，由用户选择使用哪版，不盲目覆盖。本次并未验证 ZCode 的加载规则。
