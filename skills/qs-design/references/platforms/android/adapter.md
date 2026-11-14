# Android 适配器 v3.4

先读取 Task Capsule、Product Truth、Attention、Terminology、Prototype、共享业务模型、连续性契约、语义意图和所选方向，再读 [Android 平台约束](android-platform.md)。

## 原生表达

- 依据窗口尺寸、折叠状态和输入方式设计，不把手机画布等比放大；
- 保留 predictive back、系统键盘、TalkBack、字体缩放和触控语义；
- Compose/View 状态与业务状态分离，取消和中断不能误提交；
- Material 能力是平台资源，不是强制整页风格；
- 方向数由共享产品分歧决定，平台版本不另算方向。
- 局部迭代时把稳定 `qs-*` 身份映射到 Compose `testTag` 或项目 View 测试标识；测试标识不替代 TalkBack 内容描述，并在 Mutation Scope 未授权时保持不变。

## 内容显隐

- 触屏和 TalkBack 场景不能依赖 hover 或长按发现关键说明；必要规则、风险和恢复在决策点可见；
- Tooltip 仅用于短、可选、非交互信息，并提供可发现的点击或聚焦路径；需要交互或较长内容时使用明确 disclosure、popover 或 dialog；
- 保留可见表单标签、内容描述和字体缩放后的关系，不用 placeholder、图标或颜色单独承担语义。

## 运行证据

使用 Emulator、Compose UI Test 或项目现有测试路径。缺少 Android 工具链时报告 `unknown`，不得把 HTML 近似称为 Android 已验证。关键内容可见性和披露输入等价性没有运行证据时同样报告 `unknown`。

运行器接受明确的 Gradle wrapper、任务与工作目录，并可用点名序列号的 ADB 捕获截图。构建成功不自动证明 TalkBack、字体缩放、predictive back 或 reduced motion；这些断言必须各自附带运行证据。
