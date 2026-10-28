# 原作者实践与可玩讲解

观察作者怎样让输入、状态、材料和反馈协同。提取可解释的机制；漂亮的演示本身不证明它适合高频产品任务。

本文件有 11 个来源条目，来自 2026-10-27 的调研快照。下面保留当时的读取范围；未读取、未操作或未确认的部分不会因收入目录而变成已验证。

## 按问题定位

先用目录或 ID 找到相关条目，再打开能填补当前缺口的原文。无需从头读完本文件。可在仓库根目录检索：

```sh
rg -n '按压|跟手|讲解|craft-' skills/qs-ios-design/references/sources/creator-practice.md
```

[返回来源路由](../source-registry.md) · [按任务找案例](../examples/index.md)

<a id="group-craft"></a>
## 设计工程师与互动讲解

| 条目 | 可解决的问题 |
|---|---|
| [Rauno — Craft](#craft-rauno) · `craft-rauno` | 连续取值、空间层级、不同视觉气质 |
| [Paco — Craft](#craft-paco) · `craft-paco` | 嵌套菜单、筛选、时间线、播放器 |
| [Jakub — Card Stack](#craft-jakub) · `craft-jakub` | 循环队列、对象堆叠、分层过渡 |
| [Codrops — Demos Hub](#craft-codrops) · `craft-codrops` | 图片到详情转场、空间画廊、纹理、探索地图 |
| [Josh W. Comeau — Animation](#craft-josh) · `craft-josh` | 按压反馈、弹性、缓动、3D 层级 |
| [Ahmad Shadeed — CSS / Layout](#craft-ahmad) · `craft-ahmad` | 真实内容长度、多语言排版、模块自适应 |
| [Hakim El Hattab — Experiments](#craft-hakim) · `craft-hakim` | 按钮内进度、就地确认、阅读定位 |
| [Bartosz Ciechanowski — Interactive Essays](#craft-bartosz) · `craft-bartosz` | 学习、科学、时间与空间因果关系 |
| [Nicky Case — Playable Explanations](#craft-nicky) · `craft-nicky` | 可玩的学习、原位展开解释、渐进理解 |
| [肘子的 Swift 记事本](#craft-fatbobman) · `craft-fatbobman` | 状态变化如何驱动动画、作用域、插值 |
| [吉光卡片交互拆解 — 张小吉](#craft-jiguang) · `craft-jiguang` | 长按蓄力、松手取消、光感与完成反馈 |

<a id="craft-rauno"></a>
### craft-rauno · Rauno — Craft

- **URL**：[https://rauno.me/craft](https://rauno.me/craft)
- **适用问题**：连续取值、空间层级、不同视觉气质
- **平台**：Web / 可迁移原理
- **类型**：design-craft；原分类 `craft`
- **具体入口或例子**：Graph Slider、Adaptive Precision、Radial Menu；Novelty / Contrasting Aesthetics
- **访问范围**：公开索引及部分文章
- **采用时的边界**：按任务借鉴操纵原理；不默认复制作者的极简黑白风格。各 demo 代码另看许可。
- **实际读取范围**：已读作者索引及相关文章；未操作 demo
- **调研日期**：2026-10-27

<a id="craft-paco"></a>
### craft-paco · Paco — Craft

- **URL**：[https://paco.me/craft](https://paco.me/craft)
- **适用问题**：嵌套菜单、筛选、时间线、播放器
- **平台**：Web；复现部分 iOS 行为
- **类型**：design-craft；原分类 `craft`
- **具体入口或例子**：https://paco.me/craft/ios-menu；https://paco.me/craft/filter
- **访问范围**：公开文章与演示入口
- **采用时的边界**：网页复现不是原生控件；2022/2023 的浏览器问题说明只作历史背景，不照搬为当前兼容性结论。
- **实际读取范围**：已读索引及两篇案例；未操作 demo
- **调研日期**：2026-10-27

<a id="craft-jakub"></a>
### craft-jakub · Jakub — Card Stack

- **URL**：[https://jakub.kr/components/card-stack](https://jakub.kr/components/card-stack)
- **适用问题**：循环队列、对象堆叠、分层过渡
- **平台**：Web
- **类型**：design-craft；原分类 `craft`
- **具体入口或例子**：Looping card stack interaction with animated assets
- **访问范围**：本次仅提取到简介和后续入口
- **采用时的边界**：只作发现入口；未读完整实现与许可。不因有叠卡例子就把各种功能都改成叠卡。
- **实际读取范围**：局部内容可读
- **调研日期**：2026-10-27

<a id="craft-codrops"></a>
### craft-codrops · Codrops — Demos Hub

- **URL**：[https://tympanus.net/codrops/hub/](https://tympanus.net/codrops/hub/)
- **适用问题**：图片到详情转场、空间画廊、纹理、探索地图
- **平台**：Web / Canvas / WebGL
- **类型**：design-craft；原分类 `craft`
- **具体入口或例子**：Gallery-to-overlay、3D weather、SVG motion、interactive terrain 等条目
- **访问范围**：公开 demo 索引；条目访问条件各异
- **采用时的边界**：桌面 hover、shader 和滚动叙事要转译为触摸操作；每个项目的代码/图片许可独立。
- **实际读取范围**：已读 demo 索引，未逐个运行
- **调研日期**：2026-10-27

<a id="craft-josh"></a>
### craft-josh · Josh W. Comeau — Animation

- **URL**：[https://www.joshwcomeau.com/animation/](https://www.joshwcomeau.com/animation/)
- **适用问题**：按压反馈、弹性、缓动、3D 层级
- **平台**：Web / CSS / JS
- **类型**：design-craft；原分类 `craft`
- **具体入口或例子**：https://www.joshwcomeau.com/animation/3d-button/
- **访问范围**：公开系列及具体代码文章，部分课程另收费
- **采用时的边界**：学习层次与输入反馈；示例的颜色、字号、时长属于案例，不成为全局参数。
- **实际读取范围**：已读系列索引及 3D Button 原文
- **调研日期**：2026-10-27

<a id="craft-ahmad"></a>
### craft-ahmad · Ahmad Shadeed — CSS / Layout

- **URL**：[https://ishadeed.com/](https://ishadeed.com/)
- **适用问题**：真实内容长度、多语言排版、模块自适应
- **平台**：Web
- **类型**：design-craft；原分类 `craft`
- **具体入口或例子**：https://ishadeed.com/article/flex-wrap-detect/
- **访问范围**：公开文章；课程另收费
- **采用时的边界**：这篇 2023 文中的 :wrap 是作者设想，不能作为已可用 API 复制。借鉴内容驱动布局问题，具体实现查当前 CSS 文档。
- **实际读取范围**：已读作者主页和 flex-wrap 原文
- **调研日期**：2026-10-27

<a id="craft-hakim"></a>
### craft-hakim · Hakim El Hattab — Experiments

- **URL**：[https://hakim.se/](https://hakim.se/)
- **适用问题**：按钮内进度、就地确认、阅读定位
- **平台**：Web
- **类型**：design-craft；原分类 `craft`
- **具体入口或例子**：Ladda、Flipside、Progress Nav
- **访问范围**：公开作品入口；代码许可按项目
- **采用时的边界**：历史实验需要适配；只选有任务收益的做法，不把故意阻碍取消的玩笑 demo 当正例。
- **实际读取范围**：已读作者作品索引，未逐个运行
- **调研日期**：2026-10-27

<a id="craft-bartosz"></a>
### craft-bartosz · Bartosz Ciechanowski — Interactive Essays

- **URL**：[https://ciechanow.ski/](https://ciechanow.ski/)
- **适用问题**：学习、科学、时间与空间因果关系
- **平台**：Web / 可迁移到 iOS
- **类型**：design-craft；原分类 `craft`
- **具体入口或例子**：https://ciechanow.ski/moon/
- **访问范围**：公开互动文章
- **采用时的边界**：借鉴控件与图形共同解释概念；不是原生组件库，也没有统一授权可复制全部图像。
- **实际读取范围**：已读索引及 Moon 原文，未操作 demo
- **调研日期**：2026-10-27

<a id="craft-nicky"></a>
### craft-nicky · Nicky Case — Playable Explanations

- **URL**：[https://ncase.me/](https://ncase.me/)
- **适用问题**：可玩的学习、原位展开解释、渐进理解
- **平台**：Web
- **类型**：design-craft；原分类 `craft`
- **具体入口或例子**：https://ncase.me/nutshell/；The Evolution of Trust
- **访问范围**：公开作品、文档及代码入口
- **采用时的边界**：借鉴读者主动探索；站点公开声明与具体项目/引用素材许可需分别理解。Nutshell 跨站内容仍受 CORS 和版权条件约束。
- **实际读取范围**：已读作者索引和 Nutshell 原文
- **调研日期**：2026-10-27

<a id="craft-fatbobman"></a>
### craft-fatbobman · 肘子的 Swift 记事本

- **URL**：[https://fatbobman.com/zh/posts/the_animation_mechanism_of_swiftui/](https://fatbobman.com/zh/posts/the_animation_mechanism_of_swiftui/)
- **适用问题**：状态变化如何驱动动画、作用域、插值
- **平台**：SwiftUI / 中文
- **类型**：design-craft；原分类 `craft`
- **具体入口或例子**：SwiftUI 的动画机制；文内有完整代码仓库入口
- **访问范围**：公开中文长文和代码链接
- **采用时的边界**：2022 原文可用于机制理解；目标系统的 API 用法以当前文档和工程为准。不是预制视觉皮肤库。
- **实际读取范围**：已打开正文或文档
- **调研日期**：2026-10-27

<a id="craft-jiguang"></a>
### craft-jiguang · 吉光卡片交互拆解 — 张小吉

- **URL**：[https://sspai.com/post/87541](https://sspai.com/post/87541)
- **适用问题**：长按蓄力、松手取消、光感与完成反馈
- **平台**：SwiftUI / 中文
- **类型**：design-craft；原分类 `craft`
- **具体入口或例子**：丝滑的 iOS 进度条解锁交互到底是怎么制作的？
- **访问范围**：少数派作者原文公开，包含部分代码与视频入口
- **采用时的边界**：适合低频探索或有意义的仪式感；不把长等待、强震动或每 10ms 计时写成通用最佳实践。
- **实际读取范围**：已读原文；未观看嵌入视频或运行 App
- **调研日期**：2026-10-27

