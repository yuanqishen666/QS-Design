# 原型与交付 v3

## 存储

原型属于 Task Capsule 的候选分支，不要求项目目录。ephemeral/chat/portable/project store 使用同一候选模型。旧 `design-run.mjs` 仅兼容 v2；新流程使用 `engine/cli/qs-design.mjs` 和 engine API。

## 方向样张与完整原型

方向数为 1–3。多方向先制作代表场景和关键操作，用户选择后扩展完整原型。每个候选有独立入口、真实预览、Art Direction Contract、业务不可替换性和平台边界。

## 行为

关键入口、选择、详情、保存、取消、返回和本次实际存在的异常产生正确结果。模拟数据、持久化、通知和导航边界必须明示。HTML 不能假称原生触觉或系统行为。

## 批准

Approval 同时绑定 Task Capsule、业务模型、连续性契约、方向、原型、平台捕获和用户证据。业务、结构、文案、核心视觉或标志交互改变时重新评审；纯格式化不使批准失效。

## 打包

`scripts/ios/package-prototype.mjs` 仍可打包可信本地 HTML。网络依赖、ES modules、iframe 和动态加载应由项目构建工具处理并声明安全边界。
