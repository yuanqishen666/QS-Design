---
name: qs-web-design
description: 为响应式网站、Web App、桌面浏览器工具、仪表盘、编辑器和移动 Web 设计或实现视觉鲜明、可操作且可访问的页面与流程。用户点名网页、Web、浏览器、React/Vue/Svelte、响应式或桌面端页面时使用。不用于原生 iOS/Android、小程序专属实现或独立 UI 审计。
metadata:
  version: "1.0.0"
  author: "QS"
---

# QS Web Design

把 Web 当作可变化窗口、键鼠与触屏共存、可导航且有语义的产品环境。视觉表达不能以牺牲 DOM、文本、焦点或性能为代价。

## 制作

1. 明确页面类型、核心任务、最小/最大有效宽度、输入方式、浏览器范围与现有技术栈。
2. 用内容关系决定响应式重排；不要只设置几个断点按比例缩放。
3. 普通内容保留语义 DOM、真实按钮/链接/表单和可选择文本。Canvas/WebGL/Rive 只承载确有必要的视觉层。
4. 悬停只做增强，所有关键动作有键盘和触屏路径；路由、历史和浏览器返回保持可信。
5. 动态默认可打断，优先 transform/opacity；处理 `prefers-reduced-motion`、低性能档和后台恢复。

详细检查见 [Web 平台](references/web-platform.md)。高级连续交互按 [具身交互机会扫描](../../core/references/embodied-opportunity-scan.md) 通过后加载 `qs-interaction-lab`。

交付实际可打开的 Web 原型或沿用现有工程；必须走通核心路径并检查至少三个有意义的窗口宽度。
