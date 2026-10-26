# 独立研究入口

这是 `qs-ios-design` 自己的 iOS 研究路由，不是固定素材包，也不是从其他设计 skill 继承的来源清单。使用时访问最新页面并核对条款，不凭这份文件复制资产。若某个入口来自二手文章或别人的清单，必须回到原始来源重新核实后再记录。

## Apple 官方

| 来源 | 用途 | 注意 |
|---|---|---|
| https://developer.apple.com/design/human-interface-guidelines/ | 平台行为、组件、动效、无障碍 | 优先级最高；按当前系统版本读取 |
| https://developer.apple.com/design/resources/ | 官方 UI Kit、Product Bezels、图标模板 | Apple Design Resources 有平台与再分发限制 |
| https://developer.apple.com/sf-symbols/ | 系统符号与动画 | 检查最低系统版本和受限符号；不能用于 Logo/商标 |
| https://developer.apple.com/videos/ | WWDC 设计与 SwiftUI 实现 | 优先看章节与 sample code，不只看宣传片 |
| https://developer.apple.com/design/awards/ | 当年 Apple Design Awards | 观察产品主题如何进入视觉、内容与交互，不照搬获奖外观 |
| https://developer.apple.com/design/awards/2025/ | CapWords、Denim、iA Writer、Mela 等真实案例 | 重点看“产品对象怎样变成视觉与交互主角” |
| https://developer.apple.com/videos/play/wwdc2025/359/ | 从内容组织到视觉设计：层级、字体、图像、色彩 | 用于建立视觉锚点和页面结构 |
| https://developer.apple.com/videos/play/wwdc2026/251/ | iOS 品牌表达：内容、字体、色彩、图标与交互 | 熟悉处保持平台感，独特处进入内容区 |
| https://developer.apple.com/videos/play/wwdc2024/10151/ | Scroll effect、颜色处理、转场与文字动画 | 用于扩展视觉效果与转场构想 |
| https://developer.apple.com/videos/play/meet-with-apple/272/ | SwiftUI motion 基础与产品性格 | 观察 motion 如何提供上下文、注意力和趣味 |
| https://developer.apple.com/documentation/swiftui/view-presentation | Sheet、Popover、detent 与交互式关闭 | 结合目标系统版本检查 API 可用性 |
| https://developer.apple.com/forums/ | 原生 API 的真实边界与开发者问题 | 论坛回答不是规范；用来发现问题，再回官方文档确认 |

## 真实产品流程

| 来源 | 用途 | 注意 |
|---|---|---|
| https://mobbin.com/ | 搜索 iOS 页面、元素和完整流程 | 可能需要订阅；只做研究，不复制整页 |
| https://pageflows.com/ | 查看 onboarding、支付、搜索等录屏流程 | 核对采集时间和 App 版本 |
| https://screensdesign.com/ | iOS 页面与交互参考 | 重点看任务流而非视觉拼贴 |
| Apple Design Awards | 看视觉、交互、包容性与创新案例 | 奖项是启发，不是模板 |
| App Store 产品页、版本记录与评论 | 核对真实功能、维护状态和长期使用反馈 | 截图是营销材料；必须结合实际流程或录屏 |

## GitHub 实现研究

| 来源 | 适合研究 |
|---|---|
| https://github.com/GetStream/purposeful-ios-animations | 按交互目的组织动画 |
| https://github.com/EmergeTools/Pow | SwiftUI 局部转场与 change effects |
| https://github.com/swiftui-lab/swiftui-hero-animations | 卡片、图像和详情之间的 shared element 连续性 |
| https://github.com/HeroTransitions/Hero | UIKit 转场中的对象匹配、进入与交互式退出 |
| https://github.com/notsobigcompany/CardStack | 叠卡和牌组隐喻 |
| https://github.com/tobi404/SwipeCardsKit | 手势阈值、方向和后层补位 |
| https://github.com/exyte/AnimatedTabBar | 自定义 Tab 动效的实现与边界 |
| https://github.com/cvs-health/ios-swiftui-accessibility-techniques | Reduce Motion、VoiceOver 与 SwiftUI 无障碍实现 | 读取具体技术页并回到 Apple 文档核实 |

每次使用前检查 license、最新提交、issues、最低系统版本和依赖体积。优先学习结构并重写最小实现，除非用户明确愿意增加依赖。

## 社区与视频

- X：搜索设计师、独立开发者和新系统反馈；登录墙与索引不完整时不要假装看到了全部内容。
- YouTube：适合观察完整动效和 SwiftUI 实现；Apple Developer 与 Kavsoft 等原作者演示可用于理解时间线和手势，但 showcase 不自动等于适合当前产品。
- 小红书：适合中文用户审美、App 使用痛点和国内产品语境；内容真实性与授权逐条判断。
- 抖音：适合观察真机录屏、可打断动画、跟手、阈值、吸附和中文用户的直观审美反应；短视频结论需要用完整流程或官方资料交叉确认。
- Reddit / Apple Developer Forums：适合发现 AI 模板感、流程断裂、肌肉记忆、动效疲劳和长期使用后的细节问题。
- Stack Overflow：适合定位 List、LazyVStack、ScrollView、手势、键盘和 matched geometry 的具体失败条件；答案日期与系统版本必须一起记录。
- App Store 评论：适合发现真实任务里反复出现的退出困难、误触、信息缺失和流程断点；单条评论不直接变成设计结论。

## 动效与插画素材

| 来源 | 用途 | 注意 |
|---|---|---|
| https://lottiefiles.com/ | 品牌插画、空状态、低频庆祝 | 每个素材单独检查 license 与账户计划条款；禁止批量抓取 |
| https://rive.app/ | 有状态机、实时输入和品牌角色的交互动画 | runtime 许可不等于社区素材许可 |
| Unsplash / Pexels | 真实摄影内容 | 只有图片与产品内容有内在关系时使用 |
| Wikimedia Commons / 博物馆开放资源 | 历史、艺术、人物与地点内容 | 检查单个文件许可和署名要求 |

## 搜索后保存什么

保存 URL、日期、功能、借鉴原则、明确不复制的部分和授权信息。不要把整站内容、付费预览或未经授权的素材收进 skill。

任何来源都必须经过“事实 → 摩擦 → 不复制部分 → 本产品转化”四步，详见 [originality-and-sources.md](originality-and-sources.md)。
