# 来源、版本与打包说明

本次以本机实际文件为准。未上传整个 Codex 配置目录，也仅补充 Superpowers 的可分发插件文件，未上传连接器认证。

| 内容 | 已确认来源 |
| --- | --- |
| ARIS 科研系列及辅助代码 | https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep ，本机检出 c5f3d5bfc694a812012729841e9697223e4f2130 |
| find-skills | 本机安装锁文件记录 vercel-labs/skills，skills/find-skills |
| gpt-image | 技能 metadata 指向 wuyoscar/gpt_image_2_skill |
| humanizer | 本机 README 指向 blader/humanizer |
| frontend-design | 本机许可证与 Anthropic 技能来源；保留本地正文 |
| Superpowers 插件 | 插件 metadata 指向 obra/superpowers，记录版本 6.3.0 |
| 其他本地目录 | 保存当前文件；没有足够本机来源元数据的，不臆造可验证的上游版本 |

ARIS 技能目录之外的共享资料已实体化；补齐的脚本/模板路径列在机器清单 `supplemented_files`。已修正可确定目标的旧 shared-references Markdown 相对链接，改动文件列在 `portability_link_repairs`。其余技能正文保持快照，不对原工作流作兼容性保证。

本仓库的 SHA-256 用于发现文件意外缺失/修改，不是来自第三方的签名验证。原始代码与资料各遵循原许可证；已有 LICENSE/NOTICE 随目录保留，未发现明确许可的内容不能据此推断可任意再许可。

快照不带个人密钥。扫描中的飞书地址为 YOUR_WEBHOOK_ID 文档占位符，不是真实凭据；保留该配置示例。
