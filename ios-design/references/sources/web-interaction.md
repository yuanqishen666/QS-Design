# HTML 可操作原型实现

把设计变成能操作的状态、手势、弹层、导航和图形。按现有运行环境选最小实现，简单浏览器能力够用时无需新增框架。

本文件有 12 个来源条目，来自 2026-10-27 的调研快照。下面保留当时的读取范围；未读取、未操作或未确认的部分不会因收入目录而变成已验证。

## 按问题定位

先用目录或 ID 找到相关条目，再打开能填补当前缺口的原文。无需从头读完本文件。可在仓库根目录检索：

```sh
rg -n '拖动|保存|抽屉|interaction-w' ios-design/references/sources/web-interaction.md
```

[返回来源路由](../source-registry.md) · [按任务找案例](../examples/index.md)

<a id="group-web"></a>
## HTML 可操作原型实现

| 条目 | 可解决的问题 |
|---|---|
| [MDN — Pointer Events](#interaction-w01) · `interaction-w01` | 拖拽与 scrub；触点捕获；滚动冲突和取消恢复 |
| [MDN — Using the Web Animations API](#interaction-w02) · `interaction-w02` | 可暂停/反向/调速动画；不依赖框架的原型；受控动效生命周期 |
| [MDN — View Transition API](#interaction-w03) · `interaction-w03` | HTML 列表到详情连续性；DOM 状态切换；页面间对象过渡 |
| [Motion — React Drag](#interaction-w04) · `interaction-w04` | 限制区域拖拽；轴向锁定；动量与拖动反馈 |
| [GSAP — Draggable](#interaction-w05) · `interaction-w05` | 自定义转盘；时间轴拖动；拖动/旋转与惯性 |
| [React Spring — useSpring](#interaction-w06) · `interaction-w06` | 参数连续变化；跟随输入的弹簧；可命令控制的运动 |
| [Use Gesture](#interaction-w07) · `interaction-w07` | 图片 pinch/pan；滑动与滚动仲裁；组合手势 |
| [Radix Primitives — Dialog](#interaction-w08) · `interaction-w08` | 焦点与键盘语义；模态编辑；独立视觉样式的弹层 |
| [Base UI — Drawer](#interaction-w09) · `interaction-w09` | 分段展开的底部 sheet；拖拽与内容滚动；表单键盘与抽屉 |
| [Floating UI — Popover](#interaction-w10) · `interaction-w10` | 锚点过滤器；图表上下文操作；视口碰撞定位 |
| [D3 — Brush](#interaction-w11) · `interaction-w11` | 时间区间选择；图表联动；拖动范围与端点 |
| [SVG.js — Animating](#interaction-w12) · `interaction-w12` | 路径与流程图；品牌矢量反馈；进度或路线揭示 |

<a id="interaction-w01"></a>
### interaction-w01 · MDN — Pointer Events

- **URL**：[https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- **适用问题**：拖拽与 scrub；触点捕获；滚动冲突和取消恢复
- **平台**：HTML / JavaScript / 触摸/鼠标/笔
- **类型**：浏览器原生 API 文档；原分类 `web`
- **具体入口或例子**：pointerdown/move/up/cancel、setPointerCapture 与 touch-action 文档和示例。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：浏览器原生 API，无第三方库依赖；MDN 文本/示例再分发条款未单独核实；为局部操作区域规定触摸行为，处理 pointercancel 后恢复；不要对整个页面设置 touch-action:none。语义状态与拖拽过程状态分开。
- **许可记录**：浏览器原生 API，无第三方库依赖；MDN 文本/示例再分发条款未单独核实
- **版本与维护记录**：页面显示最后修改日期 2026-10-07
- **实际读取范围**：已读取 API 总览、pointer capture、pointercancel 与 touch-action 说明
- **调研日期**：2026-10-27

<a id="interaction-w02"></a>
### interaction-w02 · MDN — Using the Web Animations API

- **URL**：[https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API)
- **适用问题**：可暂停/反向/调速动画；不依赖框架的原型；受控动效生命周期
- **平台**：HTML / JavaScript
- **类型**：浏览器原生动画 API 文档；原分类 `web`
- **具体入口或例子**：Element.animate 的 keyframes 示例；play/pause/reverse/updatePlaybackRate 及 timing 控制说明。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：浏览器原生 API；MDN 文本/示例再分发条款未单独核实；业务状态不应依赖动画自然播放完毕；支持用户打断和减少动态效果。按目标浏览器检查所需能力，避免为简单原型强制引入框架。
- **许可记录**：浏览器原生 API；MDN 文本/示例再分发条款未单独核实
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取示例代码与 playback/timing 说明
- **调研日期**：2026-10-27

<a id="interaction-w03"></a>
### interaction-w03 · MDN — View Transition API

- **URL**：[https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- **适用问题**：HTML 列表到详情连续性；DOM 状态切换；页面间对象过渡
- **平台**：HTML / JavaScript
- **类型**：浏览器原生页面过渡 API 文档；原分类 `web`
- **具体入口或例子**：总览中的 same-document / cross-document transition、DOM 更新与 skip transition 说明。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：浏览器原生 API；MDN 文本/示例再分发条款未单独核实；用来承接视图过渡；路由、history、焦点和业务状态仍需明确实现。能力检测后提供普通切换，不能宣称所有 Safari 版本支持全部子功能。
- **许可记录**：浏览器原生 API；MDN 文本/示例再分发条款未单独核实
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取总览、SPA/MPA 使用边界与跳过过渡说明
- **调研日期**：2026-10-27

<a id="interaction-w04"></a>
### interaction-w04 · Motion — React Drag

- **URL**：[https://motion.dev/docs/react-drag](https://motion.dev/docs/react-drag)
- **适用问题**：限制区域拖拽；轴向锁定；动量与拖动反馈
- **平台**：HTML / React
- **类型**：React 动画与拖拽库文档；原分类 `web`
- **具体入口或例子**：drag、whileDrag、dragMomentum、dragConstraints、direction locking 与 manual controls 示例；源码 https://github.com/motiondivision/motion 。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：核心库 MIT；Motion+ 付费示例不在此授权结论内；按需求设拖动边界和释放行为；已有 React 原型可采用，不为单文件页面强制改用 React。开源核心与 Motion+ 付费产品区分。
- **许可记录**：核心库 MIT；Motion+ 付费示例不在此授权结论内
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 react-drag 文档代码；已读取 GitHub README 和 MIT 标识；示例页已打开但为 JS 页面，未操作演示
- **调研日期**：2026-10-27

<a id="interaction-w05"></a>
### interaction-w05 · GSAP — Draggable

- **URL**：[https://gsap.com/docs/v3/Plugins/Draggable/](https://gsap.com/docs/v3/Plugins/Draggable/)
- **适用问题**：自定义转盘；时间轴拖动；拖动/旋转与惯性
- **平台**：HTML / JavaScript / SVG
- **类型**：DOM/SVG 拖拽动画工具；原分类 `web`
- **具体入口或例子**：gsap.registerPlugin(Draggable); Draggable.create(..., {type:"x"})；文档包含 inertia 集成入口。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：GSAP Standard “No Charge” License；生效 2025-04-30，文中修改日期 2025-05-30；适用于存在明确手势或图形需求的原型。许可证是 GSAP 自定义 No Charge License，不是 MIT；允许商业使用和 AI 生成代码，但限制直接竞争的无代码可视化动画构建器等用途。
- **许可记录**：GSAP Standard “No Charge” License；生效 2025-04-30，文中修改日期 2025-05-30
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 Draggable 文档代码；已读取 https://gsap.com/community/standard-license/ 的标准许可证正文
- **调研日期**：2026-10-27

<a id="interaction-w06"></a>
### interaction-w06 · React Spring — useSpring

- **URL**：[https://www.react-spring.dev/docs/components/use-spring](https://www.react-spring.dev/docs/components/use-spring)
- **适用问题**：参数连续变化；跟随输入的弹簧；可命令控制的运动
- **平台**：HTML / React
- **类型**：React 物理动画库；原分类 `web`
- **具体入口或例子**：useSpring 的 from/to/config、返回 api 控制；@react-spring/web；源码 https://github.com/pmndrs/react-spring 。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；按交互功能选择阻尼和响应，避免同时堆叠多个弹簧引擎。React 方案不能直接宣称可放入无构建 HTML。
- **许可记录**：MIT
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 useSpring 文档；已读取 GitHub README 与 MIT 标识
- **调研日期**：2026-10-27

<a id="interaction-w07"></a>
### interaction-w07 · Use Gesture

- **URL**：[https://use-gesture.netlify.app/docs/gestures/](https://use-gesture.netlify.app/docs/gestures/)
- **适用问题**：图片 pinch/pan；滑动与滚动仲裁；组合手势
- **平台**：HTML / React / Vanilla JavaScript
- **类型**：手势识别库；原分类 `web`
- **具体入口或例子**：drag/move/hover/scroll/wheel/pinch 文档；React 与 vanilla 包；源码 https://github.com/pmndrs/use-gesture 。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；手势识别与视觉渲染分开，明确拖拽启动和取消规则。关键动作同时提供按钮或其他可访问方式，不让手势成为隐藏的唯一入口。
- **许可记录**：MIT
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 gestures 文档与 state/config 入口；已读取 GitHub README 与 MIT 标识
- **调研日期**：2026-10-27

<a id="interaction-w08"></a>
### interaction-w08 · Radix Primitives — Dialog

- **URL**：[https://www.radix-ui.com/primitives/docs/components/dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- **适用问题**：焦点与键盘语义；模态编辑；独立视觉样式的弹层
- **平台**：HTML / React
- **类型**：无样式语义组件；原分类 `web`
- **具体入口或例子**：公开 Profile editor JSX：Trigger/Portal/Overlay/Title/Description/Content；源码 https://github.com/radix-ui/primitives 。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；复用模态语义，视觉主题单独设计。文档 defaultValue 示例不构成完整保存/取消逻辑，需补业务草稿、提交和回滚状态。
- **许可记录**：MIT
- **版本与维护记录**：README 明确由 WorkOS 维护；未核实最近发行日期
- **实际读取范围**：已读取 Dialog 文档及 profile editor 代码；已读取 GitHub README、MIT 标识和 WorkOS 维护说明
- **调研日期**：2026-10-27

<a id="interaction-w09"></a>
### interaction-w09 · Base UI — Drawer

- **URL**：[https://base-ui.com/react/components/drawer](https://base-ui.com/react/components/drawer)
- **适用问题**：分段展开的底部 sheet；拖拽与内容滚动；表单键盘与抽屉
- **平台**：HTML / React
- **类型**：无样式抽屉与对话框组件；原分类 `web`
- **具体入口或例子**：Drawer JSX/CSS 示例；snapPoints、snapToSequentialPoints、Drawer.Content、data-base-ui-swipe-ignore、VirtualKeyboardProvider；源码 https://github.com/mui/base-ui 。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；按内容选择吸附点；对输入区、文本选择与内层滚动明确手势边界。底层行为复用不等于所有原型使用相同外观；不要把键盘补偿逻辑无差别加入每页。
- **许可记录**：MIT
- **版本与维护记录**：文档页面显示 npm 1.9.0；未核实其是否为所有环境当前最新版本
- **实际读取范围**：已读取 Drawer 与 Dialog 官方文档、完整 JSX/CSS 片段和 API 说明；已读取 GitHub README 与 MIT 标识
- **调研日期**：2026-10-27

<a id="interaction-w10"></a>
### interaction-w10 · Floating UI — Popover

- **URL**：[https://floating-ui.com/docs/popover](https://floating-ui.com/docs/popover)
- **适用问题**：锚点过滤器；图表上下文操作；视口碰撞定位
- **平台**：HTML / React / Vanilla JavaScript
- **类型**：浮层定位与交互工具；原分类 `web`
- **具体入口或例子**：https://floating-ui.com/docs/getting-started；popover essentials：anchor、click、Esc/outside dismiss、ARIA 和 focus；源码 https://github.com/floating-ui/floating-ui 。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；复用定位、flip/shift 等边界处理，保留触发器与内容关联。定位引擎本身不提供业务编辑规则，需要按任务实现状态。
- **许可记录**：MIT
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 getting-started 与 popover 官方文档；已读取 GitHub README 与 MIT 标识
- **调研日期**：2026-10-27

<a id="interaction-w11"></a>
### interaction-w11 · D3 — Brush

- **URL**：[https://d3js.org/d3-brush](https://d3js.org/d3-brush)
- **适用问题**：时间区间选择；图表联动；拖动范围与端点
- **平台**：HTML / JavaScript / SVG
- **类型**：数据图形交互模块；原分类 `web`
- **具体入口或例子**：brushX/brushY、.on("brush", brushed)、end snapping 文档代码；https://observablehq.com/@d3/focus-context；源码 https://github.com/d3/d3-brush 。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：ISC；让区间选择实际改变详情图或汇总值；调整数据、时间尺度和选择语义，不把交互图退化成装饰。notebook 已读取页面，但没有运行交互。
- **许可记录**：ISC
- **版本与维护记录**：未核实最近提交或发布日期；不据此判断持续维护状态
- **实际读取范围**：已读取 d3-brush 文档、鼠标/触摸范围选择与事件代码；已读取仓库 ISC 标识；已打开 Observable focus+context 页面和文字；JS code cells 未提取或运行
- **调研日期**：2026-10-27

<a id="interaction-w12"></a>
### interaction-w12 · SVG.js — Animating

- **URL**：[https://svgjs.dev/docs/3.2/animating/](https://svgjs.dev/docs/3.2/animating/)
- **适用问题**：路径与流程图；品牌矢量反馈；进度或路线揭示
- **平台**：HTML / JavaScript / SVG
- **类型**：SVG 绘制与动画工具；原分类 `web`
- **具体入口或例子**：timeline、runner 与 .animate(...).move().fill() 文档；并行与顺序调度；源码 https://github.com/svgdotjs/svg.js 。
- **访问范围**：公开文档/README 可读取；未编译或操作示例
- **采用时的边界**：MIT；将进度或步骤映射到矢量变化；图形旁保留必要标签与当前状态。适合少量清晰图形，不用装饰动画代替信息语义。
- **许可记录**：MIT
- **版本与维护记录**：读取到 v3.2 文档；最近维护未核实
- **实际读取范围**：已读取 v3.2 animating 文档；已读取 https://github.com/svgdotjs/svg.js/blob/master/LICENSE.txt 的 MIT 正文
- **调研日期**：2026-10-27

