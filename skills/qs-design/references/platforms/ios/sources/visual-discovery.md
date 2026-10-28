# 视觉、品牌与跨领域发现

为具体内容寻找字体、图像、构图和品牌语气。概念稿可打开视觉选择，不能凭截图推定交互、性能或可用性。

本文件有 11 个来源条目，来自 2026-10-27 的调研快照。下面保留当时的读取范围；未读取、未操作或未确认的部分不会因收入目录而变成已验证。

## 按问题定位

先用目录或 ID 找到相关条目，再打开能填补当前缺口的原文。无需从头读完本文件。可在仓库根目录检索：

```sh
rg -n '中文|字体|品牌|src-fontsinuse' skills/qs-design/references/platforms/ios/sources/visual-discovery.md
```

[返回来源路由](../source-registry.md) · [按任务找案例](../examples/index.md)

<a id="group-discovery"></a>
## 视觉、品牌与排版发现

| 条目 | 可解决的问题 |
|---|---|
| [HOVERSTAT.ES](#src-hoverstates) · `src-hoverstates` | 非常规内容结构；文字与图像关系；艺术指导与交互隐喻 |
| [Awwwards](#src-awwwards) · `src-awwwards` | 摄影、排版与叙事；微交互发现；跨领域视觉输入 |
| [Lapa Ninja](#src-lapa) · `src-lapa` | 大构图与图片裁切；字体节奏；不同行业的视觉性格 |
| [Figma Community · 可编辑资源发现](#src-figma-community-visual-discovery) · `src-figma-community-visual-discovery` | 可编辑组件与布局资源发现；原生控件基础；从资源拆解信息层级 |
| [Dribbble · 音乐应用概念](#src-dribbble-visual-discovery) · `src-dribbble-visual-discovery` | 专辑与人物图像的构图关系；主题色与内容的呼应；播放器与推荐模块的视觉语言 |
| [Behance · 品牌与中文编排发现](#src-behance-visual-discovery) · `src-behance-visual-discovery` | 跨媒介品牌识别；长篇作品集中的视觉逻辑；中文字体与版式探索 |
| [Are.na · 跨领域素材关系](#src-arena-visual-discovery) · `src-arena-visual-discovery` | 跨领域材料与气氛研究；文字、图像、物件之间的联系；开放式主题探索 |
| [Fonts In Use · 真实字体使用档案](#src-fontsinuse-visual-discovery) · `src-fontsinuse-visual-discovery` | 字体在真实语境中的作用；按行业与媒介找文字层级；品牌识别与阅读节奏 |
| [Typewolf · 字体搭配与品牌语气](#src-typewolf-visual-discovery) · `src-typewolf-visual-discovery` | 字体搭配；标题与正文的角色分工；健康类产品的品牌语气 |
| [站酷 ZCOOL · TEAGO 茶品牌](#src-zcool-visual-discovery) · `src-zcool-visual-discovery` | 中文品牌叙事；抽象形状与趣味材料；包装语言转为界面主题的启发 |
| [优设 UISDC · 中文字体发现](#src-uisdc-font-discovery) · `src-uisdc-font-discovery` | 中文标题与正文字体候选；不同字形气质的比较；发现原始字体发布方 |

<a id="src-hoverstates"></a>
### src-hoverstates · HOVERSTAT.ES

- **URL**：[https://www.hoverstat.es/archive/](https://www.hoverstat.es/archive/)
- **适用问题**：非常规内容结构；文字与图像关系；艺术指导与交互隐喻
- **平台**：Web / Editorial / Portfolio
- **类型**：experimental_web_interaction_index；原分类 `discovery`
- **具体入口或例子**：公开归档的 Tiger Dingsun 堆叠到列表、Any Given Moment 转盘导航、XK 时间线导航
- **访问范围**：公开归档、日期、作者与外链可读；原站交互未在本轮逐一操作
- **采用时的边界**：借内容关系与节奏；桌面 hover、鼠标跟随须重推为触控交互；原站素材不授权复制
- **实际读取范围**：读取归档中的具体项目说明及作者/原站入口
- **调研日期**：2026-10-27

<a id="src-awwwards"></a>
### src-awwwards · Awwwards

- **URL**：[https://www.awwwards.com/websites/](https://www.awwwards.com/websites/)
- **适用问题**：摄影、排版与叙事；微交互发现；跨领域视觉输入
- **平台**：Web / Interactive
- **类型**：curated_creative_website_index；原分类 `discovery`
- **具体入口或例子**：https://www.awwwards.com/websites/microinteractions/；主目录的 Photography / Music & Sound / Interaction Design
- **访问范围**：主目录与分类可读；microinteractions 分类曾成功读取，后一次超时；不承诺原站始终可用
- **采用时的边界**：获奖和展示性不等于移动任务效率；只当发现入口，采用前看原作者原站
- **实际读取范围**：读取网站分类与 microinteractions 索引；未将其当 iOS 完整流程
- **调研日期**：2026-10-27

<a id="src-lapa"></a>
### src-lapa · Lapa Ninja

- **URL**：[https://www.lapa.ninja/](https://www.lapa.ninja/)
- **适用问题**：大构图与图片裁切；字体节奏；不同行业的视觉性格
- **平台**：Web / Brand / Editorial
- **类型**：landing_page_visual_archive；原分类 `discovery`
- **具体入口或例子**：公开首页 Typography / Photography / Music / Outdoors Travel / Motion 分类入口
- **访问范围**：公开首页有分类与实际项目条目；部分深入路径本次不可读
- **采用时的边界**：营销页用于素材与构图研究；不能当 App 首页模板，更不能据截图推断手势
- **实际读取范围**：读取首页类别与原站项目入口；未把宣传页面当运行中产品
- **调研日期**：2026-10-27

<a id="src-figma-community-visual-discovery"></a>
### src-figma-community-visual-discovery · Figma Community · 可编辑资源发现

- **URL**：[https://www.figma.com/community/](https://www.figma.com/community/)
- **适用问题**：可编辑组件与布局资源发现；原生控件基础；从资源拆解信息层级
- **平台**：Figma / iOS / Web
- **类型**：editable_resource_discovery；原分类 `discovery`
- **具体入口或例子**：官方帮助 Get started with Apple's UI kit：https://help.figma.com/hc/en-us/articles/24037833895831-Get-started-with-Apple-s-UI-kit；搜索发现 iOS and iPadOS 26 Community 文件 https://www.figma.com/community/file/1527721578857867021/ios-and-ipados-26，但未读取文件内容
- **访问范围**：Community 主页本次返回 restricted URL；官方帮助页可读，说明 UI kit 适用于所有计划并可从 Libraries 或 Community 添加。具体资源的账号、授权及付费条件需逐项确认。
- **采用时的边界**：UI kit 可帮助控制系统控件和基础布局的一致性，不能代替品牌主题设计。Apple kit 需接受 EULA，字体授权单独核实；不将 Community 资源一概称为免费可商用。
- **实际读取范围**：读取 Apple UI kit 官方帮助页，核实组件、样式、示例页面和使用入口；Community 主页访问受限，具体文件仅为搜索发现，未下载、检查或编辑。
- **调研日期**：2026-10-27

<a id="src-dribbble-visual-discovery"></a>
### src-dribbble-visual-discovery · Dribbble · 音乐应用概念

- **URL**：[https://dribbble.com/shots/26126834-Music-Streaming-Mobile-App](https://dribbble.com/shots/26126834-Music-Streaming-Mobile-App)
- **适用问题**：专辑与人物图像的构图关系；主题色与内容的呼应；播放器与推荐模块的视觉语言
- **平台**：Mobile / Web
- **类型**：static_ui_concept；原分类 `discovery`
- **具体入口或例子**：Music Streaming Mobile App — Ronas IT | UI/UX Team；作者明确称其为 concept，描述播放器、推荐、新歌页面及鲜明颜色与专辑封面、艺人照片的组合。
- **访问范围**：具体作品页正文可公开读取，页面含注册和登录入口；editorial_design 标签页本次未成功读取。
- **采用时的边界**：适合拆解画面气质和模块视觉关系；属于设计概念，不作为已上线产品、可操作流程或可用性验证的证据。作品中的封面、人物照片和标识不能直接当素材复用。
- **实际读取范围**：读取指定作品页的标题、作者和概念说明；未测试应用、点击原型或验证完整任务流程。
- **调研日期**：2026-10-27

<a id="src-behance-visual-discovery"></a>
### src-behance-visual-discovery · Behance · 品牌与中文编排发现

- **URL**：[https://www.behance.net/](https://www.behance.net/)
- **适用问题**：跨媒介品牌识别；长篇作品集中的视觉逻辑；中文字体与版式探索
- **平台**：Brand / Editorial / Web / Mobile
- **类型**：conditional_portfolio_discovery；原分类 `discovery`
- **具体入口或例子**：搜索发现 Chinese Typography Collection 15–16：https://www.behance.net/gallery/42516755/Chinese-Typography-Collection-15-16；以及 Selected Branding & Editorial Projects：https://www.behance.net/gallery/248409699/Selected-Branding-Editorial-Projects。
- **访问范围**：editorial design 搜索页和 Chinese Typography Collection 具体页均返回 403；只能将搜索结果作为待人工打开的候选，不宣称完整项目已读。
- **采用时的边界**：适合发现品牌主题、编排、包装与数字界面之间的关系；需回到作者完整项目核实。作品集中的展示样机、概念图和真实产品流程必须区分，不能按图片数量推断设计质量。
- **实际读取范围**：实际请求搜索页及 Chinese Typography Collection 页面并记录 403；只从搜索结果确认候选标题、URL 和摘要，未查看项目完整图片或说明。
- **调研日期**：2026-10-27

<a id="src-arena-visual-discovery"></a>
### src-arena-visual-discovery · Are.na · 跨领域素材关系

- **URL**：[https://www.are.na/](https://www.are.na/)
- **适用问题**：跨领域材料与气氛研究；文字、图像、物件之间的联系；开放式主题探索
- **平台**：Web / Brand / Editorial
- **类型**：curated_reference_network；原分类 `discovery`
- **具体入口或例子**：官网说明可将照片、笔记、文件和网页保存为可编排、搜索的 channels；实际请求 Layout / Editorial Design 频道：https://www.are.na/f0rm-m-0/layout-editorial-design-1phyoraknh0。
- **访问范围**：首页能力说明可读，含登录、注册及 Premium 入口；所查具体频道只返回 JavaScript 占位壳和重复 Example Channel，未读到真实 blocks。
- **采用时的边界**：用它连接内容、材料、排版与气氛，帮助提出不同主题方向；不将一个收藏频道当作整套风格模板。每个引用应追溯原作者和原站，聚合收藏不提供素材授权。
- **实际读取范围**：读取首页关于 channels、搜索和公开 API 的说明；频道请求只得到占位内容，未查看或筛选其真实收藏项。
- **调研日期**：2026-10-27

<a id="src-fontsinuse-visual-discovery"></a>
### src-fontsinuse-visual-discovery · Fonts In Use · 真实字体使用档案

- **URL**：[https://fontsinuse.com/](https://fontsinuse.com/)
- **适用问题**：字体在真实语境中的作用；按行业与媒介找文字层级；品牌识别与阅读节奏
- **平台**：Brand / Editorial / Mobile / Web
- **类型**：typography_in_context_archive；原分类 `discovery`
- **具体入口或例子**：首页可按主题与形式检索，形式包含 Books、Branding/Identity、Magazines、Mobile/Tablet、Software/Apps、Web；实际可见 LongLake Festival (2026)、Multiple Tomorrows (c. 2026)、Im Jaehyung – Blank Reading (A Second Life) (2025)。
- **访问范围**：公开档案首页及分类、作品索引可读；本次未逐个打开上述作品详情。
- **采用时的边界**：观察字体承担的是导航、正文、表达还是识别功能，再结合目标内容选择。档案中的字体识别不等于授权下载或嵌入，拉丁字体搭配不能直接替代中文字体系统。
- **实际读取范围**：读取档案首页、主题/形式分类和具体条目标题；没有宣称已读各条目的详细案例说明。
- **调研日期**：2026-10-27

<a id="src-typewolf-visual-discovery"></a>
### src-typewolf-visual-discovery · Typewolf · 字体搭配与品牌语气

- **URL**：[https://www.typewolf.com/site-of-the-day/daylight-health](https://www.typewolf.com/site-of-the-day/daylight-health)
- **适用问题**：字体搭配；标题与正文的角色分工；健康类产品的品牌语气
- **平台**：Web / Brand
- **类型**：typography_pairing_reference；原分类 `discovery`
- **具体入口或例子**：Daylight — Site of the Day, December 14, 2025；条目标明 Grenette / Styrene，并链接原站 https://www.daylight-health.com。
- **访问范围**：首页及 Daylight 具体条目可公开读取；首页另有付费 Lookbooks 和课程入口，免费条目与付费产品分开对待。
- **采用时的边界**：作为字体搭配与语气的发现入口，观察字形与内容的匹配；不要将流行搭配固定为主题套餐。另行确认字体许可、中文覆盖、长正文与小字号屏幕可读性。
- **实际读取范围**：读取首页及 Daylight 具体条目的日期、字体名称、原站链接；未运行原站完整流程，也未读取付费 Lookbooks。
- **调研日期**：2026-10-27

<a id="src-zcool-visual-discovery"></a>
### src-zcool-visual-discovery · 站酷 ZCOOL · TEAGO 茶品牌

- **URL**：[https://www.zcool.com.cn/work/ZNjE3NzExMTI=.html](https://www.zcool.com.cn/work/ZNjE3NzExMTI=.html)
- **适用问题**：中文品牌叙事；抽象形状与趣味材料；包装语言转为界面主题的启发
- **平台**：Brand / Packaging / Editorial
- **类型**：chinese_brand_identity_case；原分类 `discovery`
- **具体入口或例子**：TEAGO茶去 / 即刻灵感风味 — COOOT；正文描述自创茶品牌、体验与风味探索，以及抽象、趣味的包装语言，页面可见多个署名图片链接。
- **访问范围**：站酷首页本次超时，但具体原作者项目页正文和图片入口可读；页面含版权声明及登录、注册入口。
- **采用时的边界**：可分析品牌主张怎样贯穿形状、色彩、文字和材料，再思考适合自己功能的表达。包装项目不是应用流程证据，不能照搬标志或插画，也不将中文审美简化成传统国风。
- **实际读取范围**：读取具体项目的标题、作者、正文、图片入口及版权提示；未将其描述为已验证的应用界面或交互案例。
- **调研日期**：2026-10-27

<a id="src-uisdc-font-discovery"></a>
### src-uisdc-font-discovery · 优设 UISDC · 中文字体发现

- **URL**：[https://hao.uisdc.com/font/](https://hao.uisdc.com/font/)
- **适用问题**：中文标题与正文字体候选；不同字形气质的比较；发现原始字体发布方
- **平台**：Chinese Typography / Brand / Mobile / Web
- **类型**：chinese_font_discovery_directory；原分类 `discovery`
- **具体入口或例子**：可读分类含黑体、宋体、书法、创意、卡通、简约现代；条目包含优设标题黑、得意黑、优设好身体、思源黑体、阿里巴巴普惠体、HONOR Sans、OPPO Sans、vivo Sans。
- **访问范围**：字体导航页可读；主站及 archives 均返回 403。导航中免费与付费项目并存，部分条目标明付费授权，不能因页面宣传语而概括为全部免费。
- **采用时的边界**：先按标题、正文、数字、控件文字等角色缩小范围，再去原发布方核实许可证和版本。展示性标题字体不必然适合正文；导航站标签不代替商业使用、Web 嵌入或 App 打包许可。
- **实际读取范围**：读取字体导航实际分类、若干字体条目及免费/付费标记；记录主站 403；未下载字体或核验每款最终许可证。
- **调研日期**：2026-10-27

