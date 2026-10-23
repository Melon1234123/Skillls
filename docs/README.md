# Skillls — 我的 Agent Skills 迁移仓库

把这个仓库 URL 发给新电脑上的 Codex、Claude Code、ZCode 或其他支持 `SKILL.md` 的 agent，让它按照 [AGENTS.md](AGENTS.md) 完成安装。

> 请读取 https://github.com/Melon1234123/Skillls 的 README.md 和 AGENTS.md，按照清单为当前 agent 安装所有适用 skills。执行安装、校验和插件恢复；保留已有文件，有冲突先报告。只有需要我登录或提供缺失配置时再找我。最后分别汇报技能文件、插件和运行依赖的状态。

## 收录范围

本仓库基于 **2026-09-16 本机实际安装内容**，并于 2026-10-20 新增 WPS PPT 转图片版、2026-10-23 新增笨拙手写笔记技能：

| 类别 | 数量 | 恢复方式 |
| --- | ---: | --- |
| 本地与共享 skills | 110 | 本仓库完整技能目录快照，含脚本、模板、参考资料和共享目录 |
| 插件 skills | 41 / 11 个插件 | 按 [插件恢复清单](docs/PLUGINS.md) 安装或启用；不是复制一个 SKILL.md 就能恢复连接器 |
| Codex 系统 skills | 6 | 由 Codex 提供；其他 agent 按兼容性处理 |
| 总计 | **157** | 逐条见 [完整技能清单](docs/SKILLS.md) |

数量按 `SKILL.md` 入口统计。系统目录中存在但当前会话未公开列出的 `review-agent` 也记录在案。旧版插件缓存和未启用的模板包也已归档，但不计入这 157 个当前条目；推荐但未安装的插件不在本机归档范围。

**边界：技能文件安装成功不等于云端工具、登录、GPU、LaTeX 或 API 已可用。** Codex 专属文档/表格/演示文稿/可视化能力由宿主提供，其他 agent 可能没有等价实现。安装器会明确报告待恢复插件；不会伪造“全部能力可用”。

## 本机完整归档

除已明确删除的数学建模比赛和天文外，本机技能与插件文件现已逐文件归档：

- `skills/`：110 个便于安装的本地技能入口及公共文件。
- `plugins/`：当前清单中全部 11 个插件的完整文件包，覆盖 41 个插件技能。
- `system-skills/`：6 个 Codex 系统技能及配套文件。
- `archive/local/`：本机原始技能副本；包括 `.agents` 中 14 个与 `.codex` 不同的版本，保留原文，不被迁移修复覆盖。
- `archive/plugins/`：其余本地缓存包、旧版本和未启用模板，包括浏览器/电脑控制等无 SKILL.md 的插件包。相同内容的版本别名映射到同一个副本。
- `runtime/aris/`：本机 ARIS 完整源码文件（排除 Git 元数据、缓存和私有环境文件）。

[完整性报告](docs/COMPLETENESS.md) 和 [本机文件映射](manifests/local-files.json) 可核对覆盖范围与 SHA-256。旧版本单独归档，不会自动全部启用。安装器同时将当前插件包和系统技能放入 `skillls-runtime/` 备存，仍需宿主注册/加载；已有 Codex 系统技能不会被覆盖。

## Superpowers 完整包

[plugins/superpowers](plugins/superpowers) 已包含本机 6.3.0 的 **14 个子技能**、配套文件、插件元数据与 MIT 许可证。它与 `skills/` 下的三个本地独立版本分别保存。见 [完整恢复方式](docs/PLUGINS.md#superpowers-完整快照)。总数仍为 157；这 14 项原已计入插件清单。

## 一条命令安装

需要 Git 和 Python 3.9+。安装器只使用 Python 标准库；下载仓库后安装过程可离线运行。

```bash
git clone https://github.com/Melon1234123/Skillls.git
cd Skillls
python3 install.py --agent codex --report install-report.json
```

默认安装到 `$CODEX_HOME/skills`，未设置时为 `~/.codex/skills`。Windows 可将 `python3` 换成 `py -3`。

```bash
# 预览，不写入技能目录
python3 install.py --agent codex --dry-run

# Claude Code
python3 install.py --agent claude

# 读取共享 ~/.agents/skills 的 agent
python3 install.py --agent agents

# ZCode / 其他 agent：先查明它实际扫描的技能目录，再传入
python3 install.py --agent custom --dest /actual/agent/skills

# 同名且内容不同默认保留，并返回退出码 2；明确选择更新时先备份再替换
python3 install.py --agent codex --replace

# 独立校验仓库文件完整性
python3 install.py --verify-only
```

**ZCode 的目录不作猜测。** 让目标 agent 检查自己的文档或配置，确定实际加载目录后使用 `--dest`。本仓库没有在 ZCode 上实测，也不保证不同 agent 支持 Codex 的工具名称、子代理机制或配置格式。

## 安装后完成这三步

1. 按 [PLUGINS.md](docs/PLUGINS.md) 恢复插件与宿主能力；需要的服务由用户登录。
2. 按 [DEPENDENCIES.md](docs/DEPENDENCIES.md) 设置运行依赖。ARIS 辅助文件随包安装在技能目录父级的 `skillls-runtime/aris`；使用时把安装器输出的路径设置为 `ARIS_REPO`。
3. 新开会话或刷新 agent 的 skills 清单，确认真实加载。

安装器默认不覆盖不同内容的目录；`--replace` 会把旧目录移到技能发现目录外的 `skillls-backups`。重复安装相同快照不会产生重复内容。

## 来源与维护

- [完整安装清单](docs/SKILLS.md)：每个入口、来源和恢复方法。
- [插件清单](docs/PLUGINS.md)：11 个插件及其 41 个 skills。
- [依赖说明](docs/DEPENDENCIES.md)：API、MCP、ARIS、模型和系统依赖。
- [来源与快照说明](docs/SOURCES.md)：可确认的上游、本机修改与共享文件。
- [机器可读清单](manifests/skills.json) / [文件 SHA-256](manifests/checksums.json)。

保留快照是为了迁移本机当前版本；直接从上游安装最新版可能覆盖本地适配。仓库不会自动追踪以后在旧电脑新增的技能，需要更新快照和校验清单。

未包含账户配置、API key、浏览器登录、SSH 私钥、会话或个人记忆。技能原有许可证保留在对应目录，ARIS 许可证见 `licenses/`；本仓库不替第三方内容统一重新授权。

## 2026-10-20 新增技能

[WPS PPT转图片版](skills/wps-ppt-to-images/SKILL.md)：WPS渲染、保留视频原件、按目标大小生成图片版PPTX。独立仓库：[wps-ppt-to-images](https://github.com/Melon1234123/wps-ppt-to-images)。需要Windows、WPS COM、Python及Pillow/lxml，随清单自动安装技能文件；运行依赖需单独配置。

## 2026-10-23 新增技能

[黑底白字 · 笨拙手写](skills/rough-handwriting-notes/SKILL.md)：把笔记图片改成稚拙或潦草的学生手写风格，包含公式、表格及状态图检查。独立公开仓库：[rough-handwriting-notes](https://github.com/Melon1234123/rough-handwriting-notes)。需要宿主提供图片编辑能力；随清单安装技能文件。
