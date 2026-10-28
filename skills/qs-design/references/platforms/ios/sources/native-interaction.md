# iOS 原生动画与组件

为 SwiftUI、UIKit 或 Metal 的具体行为找到 API、作者代码或演示。HTML 原型应另读 Web 实现入口，不能把原生能力直接当作浏览器能力。

本文件有 15 个来源条目，来自 2026-10-27 的调研快照。下面保留当时的读取范围；未读取、未操作或未确认的部分不会因收入目录而变成已验证。

## 按问题定位

先用目录或 ID 找到相关条目，再打开能填补当前缺口的原文。无需从头读完本文件。可在仓库根目录检索：

```sh
rg -n '弹簧|转场|滚动|interaction-n' skills/qs-design/references/platforms/ios/sources/native-interaction.md
```

[返回来源路由](../source-registry.md) · [按任务找案例](../examples/index.md)

<a id="group-native"></a>
## iOS 原生动画与组件

| 条目 | 可解决的问题 |
|---|---|
| [Apple — Wind your way through advanced animations in SwiftUI](#interaction-n01) · `interaction-n01` | 由状态变化触发的阶段动画；关键帧编排；低频反馈 |
| [Apple — Designing Fluid Interfaces](#interaction-n02) · `interaction-n02` | 连续跟手反馈；可中断动画；空间连续性 |
| [Wave](#interaction-n03) · `interaction-n03` | 拖拽释放后的动量；可重定向弹簧；浮动小窗 |
| [Pow](#interaction-n04) · `interaction-n04` | 收藏反馈；成就反馈；状态变化的短时特效 |
| [Inferno](#interaction-n05) · `interaction-n05` | 与主题相关的水波或材质；照片局部形变；触点驱动的图形反馈 |
| [GetStream — SwiftUI Spring Animations](#interaction-n06) · `interaction-n06` | 初始速度与阻尼理解；中断后重定向；原生 spring 参数选择 |
| [GetStream — Purposeful iOS Animations](#interaction-n07) · `interaction-n07` | 说明状态变化；让动效承担沟通作用；辨别装饰与功能反馈 |
| [SwiftUI Lab — Hero Animations](#interaction-n08) · `interaction-n08` | 照片/卡片到详情；保留对象身份；列表与详情空间连续性 |
| [Exyte — AnchoredPopup](#interaction-n09) · `interaction-n09` | 从触发点展开的菜单；局部上下文动作；紧凑弹出层 |
| [Exyte — ScalingHeaderScrollView](#interaction-n10) · `interaction-n10` | 资料页或内容详情头部；内容滚动时维持上下文；分栏内容的头部同步 |
| [Airbnb — Lottie iOS](#interaction-n11) · `interaction-n11` | 设计工具导出的矢量动画；播放片段或反向播放；进度驱动动画 |
| [Rive iOS](#interaction-n12) · `interaction-n12` | 输入驱动的交互角色；状态驱动的图形反馈；可重复响应的品牌图形 |
| [Hero](#interaction-n13) · `interaction-n13` | 匹配对象的详情转场；手势控制转场进度；复杂控制器间视觉连续性 |
| [With Animation](#craft-withanimation) · `craft-withanimation` | SwiftUI 组件、动画、shader 的发现入口 |
| [SwiftGG — SwiftUI 中文入口](#candidate-swiftgg) · `candidate-swiftgg` | 中文入门与社区发现 |

<a id="interaction-n01"></a>
### interaction-n01 · Apple — Wind your way through advanced animations in SwiftUI

- **URL**：[https://developer.apple.com/videos/play/wwdc2023/10157/](https://developer.apple.com/videos/play/wwdc2023/10157/)
- **适用问题**：由状态变化触发的阶段动画；关键帧编排；低频反馈
- **平台**：iOS / SwiftUI
- **类型**：官方课程与源码片段；原分类 `native`
- **具体入口或例子**：视频页 Code 区域：ReactionView 的 phaseAnimator、Phase 枚举以及 keyframeAnimator 多轨道示例。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：官方教学材料；未核实具体示例再分发条款；先定义业务触发值，再编排 scale/offset 等视觉变化；适合完成或反应反馈，不宜把所有常用操作变成长动画。目标系统必须满足 API 可用版本。
- **许可记录**：官方教学材料；未核实具体示例再分发条款
- **版本与维护记录**：WWDC2023 历史官方材料；需按目标 SDK 核实 API 可用性
- **实际读取范围**：已读取 WWDC23 视频页 transcript 和 code；包含 2:23 phases、8:12 keyframes、15:07 tips
- **调研日期**：2026-10-27

<a id="interaction-n02"></a>
### interaction-n02 · Apple — Designing Fluid Interfaces

- **URL**：[https://developer.apple.com/videos/play/wwdc2018/803/](https://developer.apple.com/videos/play/wwdc2018/803/)
- **适用问题**：连续跟手反馈；可中断动画；空间连续性
- **平台**：iOS / UIKit / SwiftUI 设计原则
- **类型**：官方交互设计课程；原分类 `native`
- **具体入口或例子**：公开 transcript、视频与幻灯片入口；课程讨论触摸响应和流畅交互的空间心智模型。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：官方教学材料；未核实具体示例再分发条款；用来判断交互是否连续和可预测，不把流畅简单等同高帧率。历史实现 API 需适配当前项目，课程原则不等于现成组件。
- **许可记录**：官方教学材料；未核实具体示例再分发条款
- **版本与维护记录**：WWDC2018 历史材料；当前工程可继续采用原则，但不能直接推定代码兼容
- **实际读取范围**：已读取 WWDC18 课程页与 transcript
- **调研日期**：2026-10-27

<a id="interaction-n03"></a>
### interaction-n03 · Wave

- **URL**：[https://github.com/jtrivedi/Wave](https://github.com/jtrivedi/Wave)
- **适用问题**：拖拽释放后的动量；可重定向弹簧；浮动小窗
- **平台**：iOS / UIKit / SwiftUI / AppKit
- **类型**：开源弹簧动画引擎与示例；原分类 `native`
- **具体入口或例子**：README 的 PiP/gesture velocity 示例；仓库可见 Sample App/Wave-Sample 与 Sources/Wave 目录入口。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；示例说明目标改变时保持当前速度，适合跟手移动后吸附。按功能改吸附区域、阻尼和目标，不复制示例视觉。
- **许可记录**：MIT
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 README 的 spring、retargeting、PiP 说明与代码；嵌套 sample tree 读取受限；未逐文件读取或编译
- **调研日期**：2026-10-27

<a id="interaction-n04"></a>
### interaction-n04 · Pow

- **URL**：[https://github.com/EmergeTools/Pow](https://github.com/EmergeTools/Pow)
- **适用问题**：收藏反馈；成就反馈；状态变化的短时特效
- **平台**：iOS / SwiftUI
- **类型**：SwiftUI 动效库；原分类 `native`
- **具体入口或例子**：README 的 .changeEffect(.spray {...}, value: post.likes, isEnabled: post.isLiked)；仓库 Example 目录。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；把特效绑定业务变化，替换符号、粒子轨迹、数量和触发条件；低频使用，不能让视觉反馈代替状态更新。README 声明 iOS 15+、macOS 12。
- **许可记录**：MIT
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 README 的 changeEffect 完整用法、效果列表和要求；已查看仓库许可证标识
- **调研日期**：2026-10-27

<a id="interaction-n05"></a>
### interaction-n05 · Inferno

- **URL**：[https://github.com/twostraws/Inferno](https://github.com/twostraws/Inferno)
- **适用问题**：与主题相关的水波或材质；照片局部形变；触点驱动的图形反馈
- **平台**：iOS / SwiftUI / Metal
- **类型**：SwiftUI Metal shader 源码与示例；原分类 `native`
- **具体入口或例子**：README 的 Water、Bubble、Wave 代码；Water 使用 TimelineView、distortionEffect 与 ShaderLibrary.water；仓库 .metal 文件与 Transitions.swift。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；通过 speed/strength/frequency/触点等参数与产品语义关联。不要把正文或整个页面持续扭曲。示例要求 iOS 17/macOS 14；Metal 代码不能直接作为 HTML 原型实现。
- **许可记录**：MIT
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 README Water/Bubble/Wave 章节及代码；已读取 README 许可证段
- **调研日期**：2026-10-27

<a id="interaction-n06"></a>
### interaction-n06 · GetStream — SwiftUI Spring Animations

- **URL**：[https://github.com/GetStream/swiftui-spring-animations](https://github.com/GetStream/swiftui-spring-animations)
- **适用问题**：初始速度与阻尼理解；中断后重定向；原生 spring 参数选择
- **平台**：iOS / SwiftUI
- **类型**：弹簧物理教学与示例工程；原分类 `native`
- **具体入口或例子**：README 物理说明、.smooth/.bouncy/.snappy 代码；AnimateWithSprings Xcode 工程。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：GPL-3.0；优先学习运动机制并用项目自身 API 实现；直接复用代码前应处理 GPL-3.0 许可证要求。不能标成 MIT 或默认商用代码模板。
- **许可记录**：GPL-3.0
- **版本与维护记录**：README 提到 2025 新年更新；未核实此后维护状态
- **实际读取范围**：已读取 README 初始速度、retargeting 和 spring API 说明；已查看 GitHub GPL-3.0 标识
- **调研日期**：2026-10-27

<a id="interaction-n07"></a>
### interaction-n07 · GetStream — Purposeful iOS Animations

- **URL**：[https://github.com/GetStream/purposeful-ios-animations](https://github.com/GetStream/purposeful-ios-animations)
- **适用问题**：说明状态变化；让动效承担沟通作用；辨别装饰与功能反馈
- **平台**：iOS / SwiftUI
- **类型**：目的导向动画教学工程；原分类 `native`
- **具体入口或例子**：README 分类表、PurposefulSwiftUIAnimations 目录和 Xcode 工程；包括对已知产品动效的重现示例。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：未核实到明确许可证；不得假设可自由复制；可分析 delight、状态变化等动效目的；这些是重现演示，不是对应产品公开的正式源代码。品牌资产和角色需要单独授权。
- **许可记录**：未核实到明确许可证；不得假设可自由复制
- **版本与维护记录**：Swift Conf 2022 相关教学材料；最近维护未核实
- **实际读取范围**：已读取 README、分类表与工程入口；根文件清单中未观察到明确许可证；未逐一追查子目录条款
- **调研日期**：2026-10-27

<a id="interaction-n08"></a>
### interaction-n08 · SwiftUI Lab — Hero Animations

- **URL**：[https://github.com/swiftui-lab/swiftui-hero-animations](https://github.com/swiftui-lab/swiftui-hero-animations)
- **适用问题**：照片/卡片到详情；保留对象身份；列表与详情空间连续性
- **平台**：iOS / SwiftUI
- **类型**：共享元素转场示例工程；原分类 `native`
- **具体入口或例子**：README 的 matchedGeometryEffect 说明；HeroAnimations 源码目录及 Xcode 工程。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；原示例明确在 9.7 英寸 iPad 全屏验证，并列出适配任意窗口的 TODO。可借鉴匹配对象身份的机制，不能视为开箱即用的所有尺寸组件。
- **许可记录**：MIT
- **版本与维护记录**：历史 iOS 14 示例；最近维护未核实
- **实际读取范围**：已读取 README、设备限制、TODO 和 MIT 标识；嵌套源码目录读取受限；未编译
- **调研日期**：2026-10-27

<a id="interaction-n09"></a>
### interaction-n09 · Exyte — AnchoredPopup

- **URL**：[https://github.com/exyte/AnchoredPopup](https://github.com/exyte/AnchoredPopup)
- **适用问题**：从触发点展开的菜单；局部上下文动作；紧凑弹出层
- **平台**：iOS / SwiftUI
- **类型**：锚点弹出组件；原分类 `native`
- **具体入口或例子**：README 的 .useAsPopupAnchor(id: "main_menu") 与 .position(.anchorRelative(.bottomLeading))；AnchoredPopupExample 和 Sources/AnchoredPopup。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；保留触发点与内容的关联；按任务配置定位、背景透传和呈现层。README 区分 fullscreenSheet 与 UIWindow 模式及 @State 行为，不能不加判断替换所有 sheet。
- **许可记录**：MIT
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 README 用法、定位参数、呈现方式权衡及 MIT 标识
- **调研日期**：2026-10-27

<a id="interaction-n10"></a>
### interaction-n10 · Exyte — ScalingHeaderScrollView

- **URL**：[https://github.com/exyte/ScalingHeaderScrollView](https://github.com/exyte/ScalingHeaderScrollView)
- **适用问题**：资料页或内容详情头部；内容滚动时维持上下文；分栏内容的头部同步
- **平台**：iOS / SwiftUI
- **类型**：可折叠滚动头部组件；原分类 `native`
- **具体入口或例子**：README v3 的 ScalingHeaderScrollView(minHeight:maxHeight:) 示例；header 接收 height/progress；ScalingHeaderTabView 保留各 tab 滚动位置。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；用 progress 驱动头图、标题和内容层级的变化。按模块决定是否需要大头图，不把这一结构铺到所有页面。
- **许可记录**：MIT
- **版本与维护记录**：文档已描述 v3；未核实最近发行日期
- **实际读取范围**：已读取 README v3 API 与 Swift 代码、tab 说明和 MIT 标识
- **调研日期**：2026-10-27

<a id="interaction-n11"></a>
### interaction-n11 · Airbnb — Lottie iOS

- **URL**：[https://github.com/airbnb/lottie-ios](https://github.com/airbnb/lottie-ios)
- **适用问题**：设计工具导出的矢量动画；播放片段或反向播放；进度驱动动画
- **平台**：iOS / UIKit / SwiftUI
- **类型**：矢量动画原生运行时；原分类 `native`
- **具体入口或例子**：README、Example 工程及使用说明入口；文档说明 bodymovin JSON 渲染、分段播放、交互式 scrub 和运行时属性变化。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：Apache-2.0；适合完成、引导或可视化状态。iOS 运行时不等于 Web 运行时；动画资产自身版权与运行时许可证分别确认。
- **许可记录**：Apache-2.0
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 README 能力和工程入口；已查看 Apache-2.0 标识
- **调研日期**：2026-10-27

<a id="interaction-n12"></a>
### interaction-n12 · Rive iOS

- **URL**：[https://github.com/rive-app/rive-ios](https://github.com/rive-app/rive-ios)
- **适用问题**：输入驱动的交互角色；状态驱动的图形反馈；可重复响应的品牌图形
- **平台**：iOS / UIKit / SwiftUI / AppKit
- **类型**：交互式矢量图形原生运行时；原分类 `native`
- **具体入口或例子**：README；Demo-App 与 Example-iOS；SPM/CocoaPods 接入入口。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；编辑器和资产条款未核实；把图形状态关联实际输入或任务状态；运行时 MIT 不代表编辑器、账号功能或第三方资产免费。HTML 预览需要独立 Web runtime。
- **许可记录**：MIT；编辑器和资产条款未核实
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 README 的平台、互动图形说明与安装入口；已查看 MIT 标识
- **调研日期**：2026-10-27

<a id="interaction-n13"></a>
### interaction-n13 · Hero

- **URL**：[https://github.com/HeroTransitions/Hero](https://github.com/HeroTransitions/Hero)
- **适用问题**：匹配对象的详情转场；手势控制转场进度；复杂控制器间视觉连续性
- **平台**：iOS / UIKit
- **类型**：UIKit 视图控制器转场库；原分类 `native`
- **具体入口或例子**：README 的 heroID、heroModifiers、交互转场说明；仓库 Example 目录。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；适用于 UIKit 路线。先判断系统导航是否已满足需求，再引入自定义对象连续性；不把该实现等同 SwiftUI matchedGeometryEffect。
- **许可记录**：MIT
- **版本与维护记录**：较早的框架；最近维护未核实
- **实际读取范围**：已读取 README 交互转场用法与 MIT 标识
- **调研日期**：2026-10-27

<a id="craft-withanimation"></a>
### craft-withanimation · With Animation

- **URL**：[https://www.withanimation.app/](https://www.withanimation.app/)
- **适用问题**：SwiftUI 组件、动画、shader 的发现入口
- **平台**：SwiftUI；浏览器预览
- **类型**：native-catalog；原分类 `native`
- **具体入口或例子**：Activity Heatmap / Glass Drag / Spider Graph / Font & Color Picker
- **访问范围**：可读公开预览页；免费源码也需登录，部分项目付费
- **采用时的边界**：已读示例分别标 iOS 17+ 与 iOS 26+；未取得完整代码。不能把网页预览视为原生运行验证，也不能把免费当可随 skill 再分发。
- **实际读取范围**：已读首页、Activity Heatmap、Glass Drag 页面
- **调研日期**：2026-10-27

<a id="candidate-swiftgg"></a>
### candidate-swiftgg · SwiftGG — SwiftUI 中文入口

- **URL**：[https://swift.swiftgg.team/getting-started/swiftui/](https://swift.swiftgg.team/getting-started/swiftui/)
- **适用问题**：中文入门与社区发现
- **平台**：SwiftUI / 中文
- **类型**：limited-candidate；原分类 `native`
- **具体入口或例子**：使用 SwiftUI 构建 iOS 应用
- **访问范围**：搜索能发现，本次正文 403；旧 swiftgg.com 不可读
- **采用时的边界**：候选入口；没有当作已读代码或当前实现依据。
- **实际读取范围**：搜索摘要；正文访问受限
- **调研日期**：2026-10-27

