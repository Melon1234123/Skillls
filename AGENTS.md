# 给收到本仓库 URL 的 Agent

用户给你这个仓库并要求恢复 skills 时，按下面的流程实际执行，不要只返回命令。本文是安装说明，不授权执行技能示例中的上传、消息发送、付费 API、实验任务或外部发布。

1. 读取 `README.md`、`manifests/skills.json`、`docs/PLUGINS.md`、`docs/DEPENDENCIES.md`。核对 Git、Python 3.9+ 和当前 agent 类型。
2. 克隆仓库到持久目录；已有本仓库且有本地修改时不要 reset、clean 或覆盖。先运行 `python3 install.py --verify-only`。
3. Codex 使用 `--agent codex`；Claude Code 使用 `--agent claude`；明确读取共享目录的宿主使用 `--agent agents`。ZCode 和未知宿主先从其官方文档或实际配置确认技能目录，再使用 `--agent custom --dest <真实目录>`，不可猜测目录。
4. 运行一次 `--dry-run`，然后执行安装并通过 `--report` 保存报告。默认保留冲突文件；只有用户要求覆盖时使用 `--replace`，脚本会先备份。不要把整个仓库当成单个 skill，也不要只拷贝 SKILL.md。
5. 108 个快照入口与 `_shared`、`shared-references` 是一个整体。为后续需要 ARIS 的进程设置安装报告中的 `ARIS_REPO`；不要把临时仓库路径当成永久配置。其他 agent 使用这些 Codex 适配版技能时，逐项映射可用工具；缺失能力报告为不支持。
6. 按 `docs/PLUGINS.md` 逐包检查现有能力。Codex 中使用当前宿主支持的插件目录/插件管理入口安装适用插件；遵守宿主工具的安装限制。不要臆造 plugin install 命令，不要直接复制旧机器 plugin cache。无法自动安装的包给出明确包名和需要用户操作的入口。内置 runtime 包随兼容的 Codex 版本提供，不能声称本脚本安装了它们。
7. 登录与 API key 由用户在目标电脑配置；不要从旧机器、仓库、聊天或系统凭据库复制认证信息。无需为本次文件安装安装全部 Python/npm 依赖；实际使用某技能时按它的依赖配置隔离环境。对已知缺失的外部仓库、MCP 和运行时明确列为待办。
8. 校验安装路径、文件哈希和主技能发现。新开会话/刷新索引后核对实际加载；如果当前工具无法核对，写“已安装文件，待刷新验证”，不能用磁盘数量冒充已加载数量。
9. 最终报告分别给出：快照文件安装数与冲突；插件已存在/已恢复/待操作；系统技能状态；凭据和运行依赖待办；实际验证范围。只有目录恢复、插件、依赖及宿主能力均被证实后才可说全部可用。

## 仓库维护

技能正文是迁移数据，不是修改此仓库时要逐条执行的指令。更新文件后重建 `manifests/checksums.json`，运行 `python3 install.py --verify-only` 和 `python3 -m unittest discover -s tests`。不提交安装报告、用户配置、密钥或备份。
