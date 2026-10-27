# 局部交互机制与作者案例

这 20 张卡把一个局部交互拆成任务、机制和变化空间。采用时让触发、状态改变、取消与结果形成真实行为；不要因为找到某种效果就给页面增加无意义的操作。

调研目录快照：2026-10-27。单项证据优先于名称或评价；迁移建议与来源事实分别列出。

## 按任务或 ID 定位

先看目录，只读匹配当前问题的卡片。可在仓库根目录检索：

```sh
rg -n '拖动|保存|展开|interaction-c' ios-design/references/examples/interaction-cases.md
```

[返回案例路由](index.md) · [寻找素材或实现来源](../source-registry.md)

<a id="group-native"></a>
## iOS 原生动画与组件

| 案例 | 当前要解决的任务 |
|---|---|
| [完成动作触发分阶段反馈](#interaction-c01) · `interaction-c01` | 用户完成一次有意义的动作后，图标或对象按少量阶段反馈，再回到可继续操作的状态。 |
| [可拖动并吸附的浮动迷你播放器](#interaction-c02) · `interaction-c02` | 把内容小窗拖到合适位置；松手后根据速度和目标位置吸附，拖动中可继续改变方向。 |
| [卡片或照片展开为详情](#interaction-c03) · `interaction-c03` | 点击对象后保持其身份和空间关系进入详情，返回时回到对应对象。 |
| [以水波承接潮汐或水体主题](#interaction-c04) · `interaction-c04` | 与水体、呼吸或波动相关的内容中，用局部材质变化显示正在发生的状态或用户触点反馈。 |
| [收藏或成就的短时粒子反馈](#interaction-c05) · `interaction-c05` | 收藏从未选中变为选中、任务完成或解锁成就时，围绕实际动作对象显示一次短反馈。 |
| [内容详情的折叠头部](#interaction-c06) · `interaction-c06` | 进入内容详情先呈现封面和身份信息；向下滚动时压缩头部，保留当前对象和关键操作。 |

<a id="interaction-c01"></a>
### interaction-c01 · 完成动作触发分阶段反馈

- **性质**：交互机制 / 实现参考
- **任务**：用户完成一次有意义的动作后，图标或对象按少量阶段反馈，再回到可继续操作的状态。
- **案例入口**：[https://developer.apple.com/videos/play/wwdc2023/10157/](https://developer.apple.com/videos/play/wwdc2023/10157/)
- **平台**：SwiftUI
- **可迁移的原则或机制**：phaseAnimator 的 trigger 与业务变化绑定；用 Phase 枚举表达初始、移动、缩放阶段；关键帧只承担视觉编排。
- **可变化的部分**：反馈对象与图形；阶段数量与空间方向；节奏、弹性和颜色；哪些业务事件值得反馈
- **适用限制**：适合低频完成/反应；常用切换不要强制等长动画。考虑中断及 reduced motion。
- **证据与读取范围**：官方 transcript 与 code 已读；未在设备运行。
- **关联来源**：[Apple — Wind your way through advanced animations in SwiftUI](../sources/native-interaction.md#interaction-n01)（`interaction-n01`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="interaction-c02"></a>
### interaction-c02 · 可拖动并吸附的浮动迷你播放器

- **性质**：交互机制 / 实现参考
- **任务**：把内容小窗拖到合适位置；松手后根据速度和目标位置吸附，拖动中可继续改变方向。
- **案例入口**：[https://github.com/jtrivedi/Wave](https://github.com/jtrivedi/Wave)
- **平台**：UIKit / SwiftUI
- **可迁移的原则或机制**：README PiP 例子的释放速度、弹簧响应和保留速度的 retargeting；动画目标改变不重置运动。
- **可变化的部分**：浮动对象的业务用途；可停靠区域；窗口尺寸；吸附阈值和弹性
- **适用限制**：README 有代码与示例工程入口；嵌套源码未读，不宣称跨所有窗口验证。HTML 需独立 Pointer Events/物理实现。
- **证据与读取范围**：README 的 PiP 和 spring 示例已读；未运行 sample app。
- **关联来源**：[Wave](../sources/native-interaction.md#interaction-n03)（`interaction-n03`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="interaction-c03"></a>
### interaction-c03 · 卡片或照片展开为详情

- **性质**：交互机制 / 实现参考
- **任务**：点击对象后保持其身份和空间关系进入详情，返回时回到对应对象。
- **案例入口**：[https://github.com/swiftui-lab/swiftui-hero-animations](https://github.com/swiftui-lab/swiftui-hero-animations)
- **平台**：SwiftUI / HTML（独立实现）
- **可迁移的原则或机制**：SwiftUI matchedGeometryEffect 的匹配身份和源/目标视图；HTML 可另用 View Transition 连接 DOM 状态。
- **可变化的部分**：共享的对象类型；图片裁切与详情层级；背景和工具栏呈现；返回及滚动位置恢复
- **适用限制**：SwiftUI 示例仅声明特定 iPad 全屏验证；Web 机制不是 SwiftUI 的直接移植，需 capability fallback、focus/history。
- **证据与读取范围**：SwiftUI Lab README 与 MDN API 文档已读；未编译或跨端运行。
- **关联来源**：[SwiftUI Lab — Hero Animations](../sources/native-interaction.md#interaction-n08)（`interaction-n08`）；[MDN — View Transition API](../sources/web-interaction.md#interaction-w03)（`interaction-w03`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="interaction-c04"></a>
### interaction-c04 · 以水波承接潮汐或水体主题

- **性质**：交互机制 / 实现参考
- **任务**：与水体、呼吸或波动相关的内容中，用局部材质变化显示正在发生的状态或用户触点反馈。
- **案例入口**：[https://github.com/twostraws/Inferno](https://github.com/twostraws/Inferno)
- **平台**：SwiftUI / Metal
- **可迁移的原则或机制**：Water 的 TimelineView + distortionEffect + ShaderLibrary.water；通过 speed、strength、frequency 控制反馈幅度和节奏。
- **可变化的部分**：材质图片；波幅与波频；触发时机；受影响区域；是否随触点或状态驱动
- **适用限制**：属于主题语义明确时的效果；正文保持稳定。需要 iOS 17/macOS 14 相应能力；不能把 Metal 片段当 HTML 可执行实现。
- **证据与读取范围**：README Water/Bubble/Wave 代码已读；未执行 shader。
- **关联来源**：[Inferno](../sources/native-interaction.md#interaction-n05)（`interaction-n05`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="interaction-c05"></a>
### interaction-c05 · 收藏或成就的短时粒子反馈

- **性质**：交互机制 / 实现参考
- **任务**：收藏从未选中变为选中、任务完成或解锁成就时，围绕实际动作对象显示一次短反馈。
- **案例入口**：[https://github.com/EmergeTools/Pow](https://github.com/EmergeTools/Pow)
- **平台**：SwiftUI
- **可迁移的原则或机制**：.changeEffect(.spray {...}, value:..., isEnabled:...) 将触发值与允许状态分别建模。
- **可变化的部分**：粒子符号；数量与轨迹；出现位置；业务触发条件；动效幅度
- **适用限制**：实际收藏/完成状态先清晰可见；不要每次页面载入都播放，不沿用他人的品牌图形。
- **证据与读取范围**：README 点赞完整代码和 effect 列表已读；未运行。
- **关联来源**：[Pow](../sources/native-interaction.md#interaction-n04)（`interaction-n04`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="interaction-c06"></a>
### interaction-c06 · 内容详情的折叠头部

- **性质**：交互机制 / 实现参考
- **任务**：进入内容详情先呈现封面和身份信息；向下滚动时压缩头部，保留当前对象和关键操作。
- **案例入口**：[https://github.com/exyte/ScalingHeaderScrollView](https://github.com/exyte/ScalingHeaderScrollView)
- **平台**：SwiftUI
- **可迁移的原则或机制**：header 的 height/progress 驱动透明度与尺寸；多 tab 时分别保留滚动状态并协调头部折叠。
- **可变化的部分**：封面、标题和操作的层级；最小/最大高度；何时出现紧凑标题；tab 数量与内容
- **适用限制**：不是所有模块都需要大头图；实际内容密度决定采用与否。
- **证据与读取范围**：README v3 的 Swift 代码和 tab 能力已读；未运行。
- **关联来源**：[Exyte — ScalingHeaderScrollView](../sources/native-interaction.md#interaction-n10)（`interaction-n10`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="group-web"></a>
## HTML 可操作原型实现

| 案例 | 当前要解决的任务 |
|---|---|
| [有边界的可拖动对象](#interaction-c07) · `interaction-c07` | 拖动卡片、素材或选择对象，在明确区域内移动；拖动和释放时给出位置与状态反馈。 |
| [可展开且可编辑的底部抽屉](#interaction-c08) · `interaction-c08` | 底部显示精简上下文，拖动到更高吸附点后浏览或编辑更多内容；正文可滚动，字段可输入。 |
| [具有明确保存和取消的资料编辑弹层](#interaction-c09) · `interaction-c09` | 点击编辑打开字段草稿；保存提交并更新页面，取消恢复原值，关闭后焦点回到触发器。 |
| [选时间区间并联动详情图](#interaction-c10) · `interaction-c10` | 用户在概览图上拖出时间区间，主图或汇总数据同步显示选中范围，可拖动两端调整。 |
| [从图表或按钮原位展开上下文过滤器](#interaction-c11) · `interaction-c11` | 用户点击某个图表点或过滤按钮，在关联对象附近查看说明或修改局部条件。 |
| [步骤或路线进度的矢量揭示](#interaction-c12) · `interaction-c12` | 随实际步骤推进或选择变化，路线/流程图逐段显现，同时呈现当前步骤的说明和可操作节点。 |

<a id="interaction-c07"></a>
### interaction-c07 · 有边界的可拖动对象

- **性质**：交互机制 / 实现参考
- **任务**：拖动卡片、素材或选择对象，在明确区域内移动；拖动和释放时给出位置与状态反馈。
- **案例入口**：[https://motion.dev/docs/react-drag](https://motion.dev/docs/react-drag)
- **平台**：HTML / React
- **可迁移的原则或机制**：drag、whileDrag、dragConstraints、axis locking、dragMomentum 等参数分别控制输入和运动，不把拖动当作无意义装饰。
- **可变化的部分**：对象与业务动作；拖动方向；区域边界；是否保留动量；释放后的状态与视觉
- **适用限制**：必须规定拖拽结果和取消方式；关键动作提供可点击替代。Motion+ 示例授权需单独核实。
- **证据与读取范围**：公开 API 和代码已读；JS demo 页面未实际操作。
- **关联来源**：[Motion — React Drag](../sources/web-interaction.md#interaction-w04)（`interaction-w04`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="interaction-c08"></a>
### interaction-c08 · 可展开且可编辑的底部抽屉

- **性质**：交互机制 / 实现参考
- **任务**：底部显示精简上下文，拖动到更高吸附点后浏览或编辑更多内容；正文可滚动，字段可输入。
- **案例入口**：[https://base-ui.com/react/components/drawer](https://base-ui.com/react/components/drawer)
- **平台**：HTML / React
- **可迁移的原则或机制**：snapPoints、snapToSequentialPoints、Drawer.Content 与 data-base-ui-swipe-ignore 控制吸附和手势边界；键盘处理按表单需要采用。
- **可变化的部分**：吸附点和初始展开高度；头部/正文/底部布局；内容任务；背景层次和视觉主题
- **适用限制**：输入、文本选择、滚动和拖拽不能抢同一手势；动作仍需保存/取消等业务状态。
- **证据与读取范围**：官方 JSX/CSS 和 API 已读；未在 iPhone Safari 操作。
- **关联来源**：[Base UI — Drawer](../sources/web-interaction.md#interaction-w09)（`interaction-w09`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="interaction-c09"></a>
### interaction-c09 · 具有明确保存和取消的资料编辑弹层

- **性质**：交互机制 / 实现参考
- **任务**：点击编辑打开字段草稿；保存提交并更新页面，取消恢复原值，关闭后焦点回到触发器。
- **案例入口**：[https://www.radix-ui.com/primitives/docs/components/dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- **平台**：HTML / React
- **可迁移的原则或机制**：复用 Trigger/Portal/Overlay/Title/Description/Content 等模态结构，同时额外实现 domainState 与 draftState 的提交/回滚。
- **可变化的部分**：表单字段；视觉主题；错误状态；确认文案；弹层尺寸与布局
- **适用限制**：官方 profile editor 只是结构示例；本条保存/取消是应补的产品行为，不是声称官方示例已完整实现。
- **证据与读取范围**：文档 JSX 已读；未执行交互。
- **关联来源**：[Radix Primitives — Dialog](../sources/web-interaction.md#interaction-w08)（`interaction-w08`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="interaction-c10"></a>
### interaction-c10 · 选时间区间并联动详情图

- **性质**：交互机制 / 实现参考
- **任务**：用户在概览图上拖出时间区间，主图或汇总数据同步显示选中范围，可拖动两端调整。
- **案例入口**：[https://d3js.org/d3-brush](https://d3js.org/d3-brush)
- **平台**：HTML / JavaScript / SVG
- **可迁移的原则或机制**：brushX/brushY、brush 事件、选择区域和端点、结束后吸附；将选择值传给实际数据过滤/尺度更新。
- **可变化的部分**：数据内容；时间尺度与最小粒度；默认范围；图形表达；联动的详情和汇总
- **适用限制**：官方 focus+context notebook 是具体参考，但页面 JS 未运行。要提供当前范围可读文本；装饰图不算功能完成。
- **证据与读取范围**：文档代码与 Observable 页面文字已读，notebook 未运行。
- **关联来源**：[D3 — Brush](../sources/web-interaction.md#interaction-w11)（`interaction-w11`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="interaction-c11"></a>
### interaction-c11 · 从图表或按钮原位展开上下文过滤器

- **性质**：交互机制 / 实现参考
- **任务**：用户点击某个图表点或过滤按钮，在关联对象附近查看说明或修改局部条件。
- **案例入口**：[https://floating-ui.com/docs/popover](https://floating-ui.com/docs/popover)
- **平台**：HTML / 原生 iOS（独立实现）
- **可迁移的原则或机制**：Floating UI 的 reference、定位碰撞处理、点击切换、Esc/外部关闭和焦点；原生端可参考 AnchoredPopup 的锚点关系。
- **可变化的部分**：锚点对象；过滤条件和内容；弹出方向；视觉材质；是否需要模态
- **适用限制**：定位组件不自动提供过滤业务；原生和 Web 是两个实现路径，不能混称同一运行时。
- **证据与读取范围**：Floating UI 文档和 AnchoredPopup README 已读；未运行。
- **关联来源**：[Floating UI — Popover](../sources/web-interaction.md#interaction-w10)（`interaction-w10`）；[Exyte — AnchoredPopup](../sources/native-interaction.md#interaction-n09)（`interaction-n09`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="interaction-c12"></a>
### interaction-c12 · 步骤或路线进度的矢量揭示

- **性质**：交互机制 / 实现参考
- **任务**：随实际步骤推进或选择变化，路线/流程图逐段显现，同时呈现当前步骤的说明和可操作节点。
- **案例入口**：[https://svgjs.dev/docs/3.2/animating/](https://svgjs.dev/docs/3.2/animating/)
- **平台**：HTML / JavaScript / SVG
- **可迁移的原则或机制**：用 timeline/runner 组织少量顺序或并行图形变化；业务进度独立存储，动效可中断或跳过。
- **可变化的部分**：路径几何；节点符号；进度映射；配色；文字和动作入口
- **适用限制**：SVG.js 文档提供动画调度机制，并非现成路线产品；不能为了线条动画隐藏重要文本。
- **证据与读取范围**：动画文档代码已读；未运行。
- **关联来源**：[SVG.js — Animating](../sources/web-interaction.md#interaction-w12)（`interaction-w12`）；[MDN — Using the Web Animations API](../sources/web-interaction.md#interaction-w02)（`interaction-w02`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="group-craft"></a>
## 设计工程师与互动讲解

| 案例 | 当前要解决的任务 |
|---|---|
| [嵌套菜单在原位展开](#case-paco-menu) · `case-paco-menu` | 用户在短命令菜单中进入一层子项，仍知道自己处于哪里。 |
| [层叠筛选呈现选择过程](#case-paco-filter) · `case-paco-filter` | 在内容集合中逐步缩小范围并撤回选择。 |
| [由分层位移产生按压反馈](#case-josh-button) · `case-josh-button` | 按下主动作时立刻得到明确反馈。 |
| [Moon：参数与解释图形联动](#case-moon) · `case-moon` | 理解时间、观察位置与月相之间的关系。 |
| [Nutshell：在阅读位置展开解释](#case-nutshell) · `case-nutshell` | 读者只补充自己不懂的概念，随后回到原文。 |
| [吉光卡片：蓄力入口与松手复位](#case-jiguang) · `case-jiguang` | 用户主动探索一个低频入口，并随时放弃。 |
| [Activity Heatmap：累计记录的时间纹理](#case-heatmap) · `case-heatmap` | 扫读一段时间内记录的疏密与连续性。 |
| [Glass Drag：跟手选择的材质表达](#case-glass-drag) · `case-glass-drag` | 在一组短选项中连续移动并选择。 |

<a id="case-paco-menu"></a>
### case-paco-menu · 嵌套菜单在原位展开

- **性质**：交互机制 / 作者案例
- **任务**：用户在短命令菜单中进入一层子项，仍知道自己处于哪里。
- **案例入口**：[https://paco.me/craft/ios-menu](https://paco.me/craft/ios-menu)
- **可迁移的原则或机制**：让菜单内部的对象关系连续变化，减少空间跳跃。
- **可变化的部分**：几何、图标、配色、出现位置可重做；沿用明确返回与关闭。
- **适用限制**：网页复现；旧文中的浏览器问题不代表今天。复杂多层信息应考虑独立页面。
- **证据与读取范围**：已读作者文章，未操作 demo
- **关联来源**：[Paco — Craft](../sources/creator-practice.md#craft-paco)（`craft-paco`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-paco-filter"></a>
### case-paco-filter · 层叠筛选呈现选择过程

- **性质**：交互机制 / 作者案例
- **任务**：在内容集合中逐步缩小范围并撤回选择。
- **案例入口**：[https://paco.me/craft/filter](https://paco.me/craft/filter)
- **可迁移的原则或机制**：所选条件改变可见筛选关系，让查询状态本身可理解。
- **可变化的部分**：可用列表、分段控件或文本路径表达，毋须复制 Spotify 样式。
- **适用限制**：类别简单、筛选层次浅时更适合；不能隐藏必要条件。
- **证据与读取范围**：已读作者案例
- **关联来源**：[Paco — Craft](../sources/creator-practice.md#craft-paco)（`craft-paco`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-josh-button"></a>
### case-josh-button · 由分层位移产生按压反馈

- **性质**：交互机制 / 作者案例
- **任务**：按下主动作时立刻得到明确反馈。
- **案例入口**：[https://www.joshwcomeau.com/animation/3d-button/](https://www.joshwcomeau.com/animation/3d-button/)
- **可迁移的原则或机制**：表面与底层的相对位置说明可按和已按；行为与焦点状态一起实现。
- **可变化的部分**：平面、纸张、机械或柔和材质均可表达，不固定颜色和尺寸。
- **适用限制**：不要给密集列表的每个入口加重阴影；反馈不能拖延实际执行。
- **证据与读取范围**：已读文章和示例代码
- **关联来源**：[Josh W. Comeau — Animation](../sources/creator-practice.md#craft-josh)（`craft-josh`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-moon"></a>
### case-moon · Moon：参数与解释图形联动

- **性质**：交互机制 / 作者案例
- **任务**：理解时间、观察位置与月相之间的关系。
- **案例入口**：[https://ciechanow.ski/moon/](https://ciechanow.ski/moon/)
- **可迁移的原则或机制**：多个视图与文字由同一输入更新；交互直接解释概念。
- **可变化的部分**：可迁移到预算、运动、天气或学习模拟；保留正确领域关系。
- **适用限制**：先保证模型事实正确；不是所有场景都需要复杂 3D。
- **证据与读取范围**：已读互动文章，未实际拖动控件
- **关联来源**：[Bartosz Ciechanowski — Interactive Essays](../sources/creator-practice.md#craft-bartosz)（`craft-bartosz`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-nutshell"></a>
### case-nutshell · Nutshell：在阅读位置展开解释

- **性质**：交互机制 / 作者案例
- **任务**：读者只补充自己不懂的概念，随后回到原文。
- **案例入口**：[https://ncase.me/nutshell/](https://ncase.me/nutshell/)
- **可迁移的原则或机制**：局部解释与上下文保持相邻；按读者需要渐进披露。
- **可变化的部分**：脚注、侧栏、段内展开、短卡片可根据屏幕决定。
- **适用限制**：不把每个词做成展开入口；长链条、屏幕阅读和深层嵌套要采用更简单结构。
- **证据与读取范围**：已读文档和案例内容
- **关联来源**：[Nicky Case — Playable Explanations](../sources/creator-practice.md#craft-nicky)（`craft-nicky`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-jiguang"></a>
### case-jiguang · 吉光卡片：蓄力入口与松手复位

- **性质**：交互机制 / 作者案例
- **任务**：用户主动探索一个低频入口，并随时放弃。
- **案例入口**：[https://sspai.com/post/87541](https://sspai.com/post/87541)
- **可迁移的原则或机制**：输入进度、光感、松手取消与完成状态形成一致行为。
- **可变化的部分**：视觉可换成墨水、印章、填充等；参数与触觉强度重新决定。
- **适用限制**：不推广到高频保存或基础导航；网页不能承诺原生触觉。
- **证据与读取范围**：已读作者拆解和部分代码；未运行 App
- **关联来源**：[吉光卡片交互拆解 — 张小吉](../sources/creator-practice.md#craft-jiguang)（`craft-jiguang`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-heatmap"></a>
### case-heatmap · Activity Heatmap：累计记录的时间纹理

- **性质**：交互机制 / 作者案例
- **任务**：扫读一段时间内记录的疏密与连续性。
- **案例入口**：[https://www.withanimation.app/library/activity-heatmap](https://www.withanimation.app/library/activity-heatmap)
- **可迁移的原则或机制**：将时间与强度编码到规则格网，选中后解释具体一天。
- **可变化的部分**：也可用条带、日历或点图；主题与粒度跟随数据。
- **适用限制**：详情页标 iOS 17+；免费源码需登录；并未取得和验证源码。
- **证据与读取范围**：已读公开预览说明与参数
- **关联来源**：[With Animation](../sources/native-interaction.md#craft-withanimation)（`craft-withanimation`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-glass-drag"></a>
### case-glass-drag · Glass Drag：跟手选择的材质表达

- **性质**：交互机制 / 作者案例
- **任务**：在一组短选项中连续移动并选择。
- **案例入口**：[https://www.withanimation.app/library/liquid-glass-dragger](https://www.withanimation.app/library/liquid-glass-dragger)
- **可迁移的原则或机制**：手势位置与当前选择同步；材质可以加强操纵感。
- **可变化的部分**：可用纯色高亮、轨道、文字反馈，不必统一玻璃。
- **适用限制**：详情标 iOS 26+；公开预览不等于浏览器可复制原生效果；免费源码需登录。
- **证据与读取范围**：已读公开预览说明；未运行原生代码
- **关联来源**：[With Animation](../sources/native-interaction.md#craft-withanimation)（`craft-withanimation`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

