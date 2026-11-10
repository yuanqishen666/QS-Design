# SwiftUI 交付 v3

只有通过 v3 Approval 校验的候选才能进入现有 SwiftUI/UIKit 工程。实现前读取 continuity contract、平台计划和批准语义合同，不再依赖旧 `selected.json`。

沿用项目入口、导航、主题、状态管理、组件和最低系统版本。自定义结构只覆盖 `adapt` 或 `open` 范围；不得创建平行设计系统。

使用原生导航、输入、VoiceOver、Dynamic Type、Reduce Motion 和有意义触觉。草稿、保存、取消、失败和恢复由业务状态驱动，动画不决定成功。

交付必须提供真实运行入口和验证范围。源文件、Preview、Simulator 和已发布 App 是不同证据等级。完成后比较批准语义与实现的状态、内容层级、视觉主张和标志交互。
