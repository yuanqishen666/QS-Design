# iOS / iPadOS 适配器 v3

本适配器将共享业务模型编译为 Apple 平台原生表达，不决定产品方向数量。

## 读取顺序

1. [任务胶囊与隔离](../../core/task-capsule-and-isolation.md)
2. [来源与连续性契约](../../core/source-and-continuity.md)
3. [业务视觉语法](../../core/business-visual-grammar.md)
4. [自适应方向策略](../../core/direction-strategy.md)
5. [视觉艺术指导](../../core/art-direction.md)
6. 当前任务需要的 iOS 专项文件

## iOS 原生表达

- 使用项目已有 NavigationStack、TabView、sheet、Menu、List 或 UIKit 路由；
- 品牌内容可以自定义，系统返回、键盘、文本选择、VoiceOver 和 Dynamic Type 保持原生；
- 处理安全区、iPad 多窗口、横竖屏和字体放大；
- 状态驱动交互，允许新输入接管；保存、取消和草稿分离；
- 触觉只强化有意义阈值，不能成为唯一结果提示；
- reduced motion 保留业务结果和直接操控。

## 内容显隐

- iPhone 和 iPad 没有可靠 hover，不能把 tooltip 当成辅助文案默认容器；少数用户按需需要的信息使用明确可点的 info button、popover 或 disclosure；
- 金额、权限、风险、格式、后果、错误和恢复在决策点可见，并随 Dynamic Type 正常重排；
- 图标只有在平台语义熟悉时单独使用，同时提供 VoiceOver 名称；文字比图标更清楚时直接使用文字；
- 首次提示只用于无法自解释的新行为，在相关时机出现，不能遮挡主任务或反复展示。

## 原型

视觉探索可使用隔离 HTML，但原生触觉、通知、系统导航或性能是核心时必须制作 SwiftUI/UIKit sample。方向样张完成代表任务即可；用户选择后扩展完整原型。

## 实现

只有经 v3 Approval 绑定的候选才能修改产品源码。沿用项目最低系统版本、依赖、主题、组件和状态管理；连续性契约明确开放的部分才重构。实现后运行语义、状态、视觉和交互回归。

## 验证

能使用 Simulator/XCTest 时提供真实运行和捕获；否则说明只验证到源码或 HTML 层。VoiceOver、Dynamic Type、关键内容可见性、披露触控等价性、Reduce Motion 和关键系统行为无法验证时报告 `unknown`。

运行器接受明确的 Xcode `project/workspace`、scheme、destination 与 action，以无 shell 参数调用 `xcodebuild`；捕获使用点名设备的 `simctl`。编译或测试命令成功不自动证明 VoiceOver、Dynamic Type 或 Reduce Motion 已通过，仍需 XCTest、任务轨迹或人工证据。
