# 任务、候选与会话隔离 v3

本文件是 iOS 入口的兼容说明。通用规则见 [任务胶囊与隔离](../../core/task-capsule-and-isolation.md)。

项目目录不再是运行前提。普通聊天使用 ephemeral 或 chat store；需要交付文件时可以导出 `.qsdesign`；修改真实工程时才使用 project store。

新设计、换方向和同功能再做一个默认 `fresh-root`，不读取旧候选。继续、保留方面和融合必须由用户点名。所有被拒绝候选从生成上下文排除。

旧 `design/qs-design/**` 目录只通过 `engine/migration/v2.mjs` 迁移为只读候选记录，不自动成为 v3 上下文。
