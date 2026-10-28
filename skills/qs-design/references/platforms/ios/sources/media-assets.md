# 摄影、字体、图标与多媒体素材

根据内容角色选摄影、字体、图标、插画、纹理或声音。只把真正采用且符合其条件的素材放入产物；这份目录不包含第三方素材包。

本文件有 37 个来源条目，来自 2026-10-27 的调研快照。下面保留当时的读取范围；未读取、未操作或未确认的部分不会因收入目录而变成已验证。

## 按问题定位

先用目录或 ID 找到相关条目，再打开能填补当前缺口的原文。无需从头读完本文件。可在仓库根目录检索：

```sh
rg -n '中文|摄影|图标|asset-' skills/qs-design/references/platforms/ios/sources/media-assets.md
```

[返回来源路由](../source-registry.md) · [按任务找案例](../examples/index.md)

分组：[摄影、视频与开放馆藏](#group-photo) · [字体与中文排印](#group-type) · [图标与系统符号](#group-icons) · [插画与动画素材](#group-illustration) · [纹理、3D 与游戏物件](#group-material) · [声音与环境素材](#group-audio)

<a id="group-photo"></a>
## 摄影、视频与开放馆藏

| 条目 | 可解决的问题 |
|---|---|
| [Unsplash](#asset-unsplash) · `asset-unsplash` | 真实地点、食物、人物、生活场景；内容主图 |
| [Pexels](#asset-pexels) · `asset-pexels` | 运动、饮食、自然环境；视频背景与动作内容 |
| [Pixabay](#asset-pixabay) · `asset-pixabay` | 单一项目中查找补充图像与短音效 |
| [Openverse](#asset-openverse) · `asset-openverse` | 寻找小众真实对象、历史图像、环境声的原始来源 |
| [Wikimedia Commons](#asset-wikimedia) · `asset-wikimedia` | 中国地理、物种、历史物件、建筑等具体内容 |
| [Smithsonian Open Access](#asset-smithsonian) · `asset-smithsonian` | 自然标本、工艺器物、文化资料、3D展品 |
| [The Metropolitan Museum of Art Open Access](#asset-met) · `asset-met` | 藏品导览、艺术学习、器物细节和作品色彩 |
| [Rijksmuseum Collection Online](#asset-rijksmuseum) · `asset-rijksmuseum` | 绘画细节、历史物件、编辑式艺术内容 |
| [Cleveland Museum of Art Open Access](#asset-cleveland) · `asset-cleveland` | 东亚艺术、器物、织物、雕塑等内容型主题 |

<a id="asset-unsplash"></a>
### asset-unsplash · Unsplash

- **URL**：[https://unsplash.com/](https://unsplash.com/)
- **适用问题**：真实地点、食物、人物、生活场景；内容主图
- **平台**：Web；可用于 iOS/HTML 中的图像
- **类型**：摄影；原分类 `photo`
- **具体入口或例子**：https://unsplash.com/license
- **访问范围**：官网许可可读；免费图库与 Unsplash+ 分开核对
- **采用时的边界**：已读免费图库许可允许商业/非商业使用，无强制署名；不可原样出售或建立竞品图库。人物、商标等权利另核；不要把图片随 skill 批量打包。
- **实际读取范围**：https://unsplash.com/license
- **调研日期**：2026-10-27

<a id="asset-pexels"></a>
### asset-pexels · Pexels

- **URL**：[https://www.pexels.com/](https://www.pexels.com/)
- **适用问题**：运动、饮食、自然环境；视频背景与动作内容
- **平台**：Web；静态图片与短视频
- **类型**：摄影/视频；原分类 `photo`
- **具体入口或例子**：https://www.pexels.com/license/
- **访问范围**：官网许可可读；有图片/视频入口
- **采用时的边界**：允许免费使用、修改，无强制署名；不可原样出售或再分发到素材/壁纸平台，不可暗示人物品牌背书或当商标使用。
- **实际读取范围**：https://www.pexels.com/license/
- **调研日期**：2026-10-27

<a id="asset-pixabay"></a>
### asset-pixabay · Pixabay

- **URL**：[https://pixabay.com/](https://pixabay.com/)
- **适用问题**：单一项目中查找补充图像与短音效
- **平台**：Web；多媒体
- **类型**：摄影/插画/视频/音频；原分类 `photo`
- **具体入口或例子**：https://pixabay.com/service/license-summary/
- **访问范围**：官网许可摘要可读；按具体媒体核对
- **采用时的边界**：摘要允许免费使用和改编；禁止独立素材形式分发/出售、误导使用及部分含品牌商业用途。完整条款优先于摘要，音频需保留具体来源记录。
- **实际读取范围**：https://pixabay.com/service/license-summary/
- **调研日期**：2026-10-27

<a id="asset-openverse"></a>
### asset-openverse · Openverse

- **URL**：[https://openverse.org/](https://openverse.org/)
- **适用问题**：寻找小众真实对象、历史图像、环境声的原始来源
- **平台**：Web；API
- **类型**：开放媒体搜索；原分类 `photo`
- **具体入口或例子**：https://docs.openverse.org/api/reference/made_with_ov.html
- **访问范围**：主搜索页本次403；官方文档可读
- **采用时的边界**：聚合 CC/公共领域媒体，不替文件担保许可准确性；回到每项原始页确认许可、作者、署名及商业限制。不能把搜索结果视作统一 CC0。
- **实际读取范围**：https://docs.openverse.org/api/reference/made_with_ov.html
- **调研日期**：2026-10-27

<a id="asset-wikimedia"></a>
### asset-wikimedia · Wikimedia Commons

- **URL**：[https://commons.wikimedia.org/](https://commons.wikimedia.org/)
- **适用问题**：中国地理、物种、历史物件、建筑等具体内容
- **平台**：Web；多语言
- **类型**：开放图片/图表/声音；原分类 `photo`
- **具体入口或例子**：https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia
- **访问范围**：官方再利用说明可读
- **采用时的边界**：逐文件核对 CC BY、BY-SA、公共领域等；需要时署名、链接许可、声明改动。开放版权不自动解决肖像/商标；不能把其他维基的 fair-use 文件混入。
- **实际读取范围**：https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia
- **调研日期**：2026-10-27

<a id="asset-smithsonian"></a>
### asset-smithsonian · Smithsonian Open Access

- **URL**：[https://www.si.edu/openaccess](https://www.si.edu/openaccess)
- **适用问题**：自然标本、工艺器物、文化资料、3D展品
- **平台**：Web；馆藏数据与媒体
- **类型**：开放博物馆/自然史/3D；原分类 `photo`
- **具体入口或例子**：https://www.si.edu/openaccess/faq
- **访问范围**：受限候选：官方首页/FAQ本次404，两个分馆权限页403/超时
- **采用时的边界**：官方搜索摘要说明只对指定 CC0 项开放；本次没有成功读取许可正文，落地前需重新打开条款和具体展品页，不概括全部馆藏可商用。
- **实际读取范围**：尝试 https://www.si.edu/openaccess/faq；https://airandspace.si.edu/explore/collections/rights-and-reproductions；官方搜索摘要
- **调研日期**：2026-10-27

<a id="asset-met"></a>
### asset-met · The Metropolitan Museum of Art Open Access

- **URL**：[https://www.metmuseum.org/hubs/open-access](https://www.metmuseum.org/hubs/open-access)
- **适用问题**：藏品导览、艺术学习、器物细节和作品色彩
- **平台**：Web；API；高分辨率图像
- **类型**：开放博物馆；原分类 `photo`
- **具体入口或例子**：https://www.metmuseum.org/hubs/open-access
- **访问范围**：官方开放访问页可读；有 OA 标识、API 与数据入口
- **采用时的边界**：仅开放访问/公共领域作品图像和指定数据适用 CC0；并非全站所有摄影或现代作品。优先保留作品名、作者、年代、馆藏号作为内容。
- **实际读取范围**：https://www.metmuseum.org/hubs/open-access
- **调研日期**：2026-10-27

<a id="asset-rijksmuseum"></a>
### asset-rijksmuseum · Rijksmuseum Collection Online

- **URL**：[https://data.rijksmuseum.nl/](https://data.rijksmuseum.nl/)
- **适用问题**：绘画细节、历史物件、编辑式艺术内容
- **平台**：Web；开放数据服务
- **类型**：开放博物馆；原分类 `photo`
- **具体入口或例子**：https://data.rijksmuseum.nl/policy/
- **访问范围**：官方数据政策可读
- **采用时的边界**：许多条目为公共领域/CC0，部分 CC BY 4.0 要署名，另有仍受版权保护的内容；以条目 copyright notice 为准，不将整站说成 CC0。
- **实际读取范围**：https://data.rijksmuseum.nl/policy/
- **调研日期**：2026-10-27

<a id="asset-cleveland"></a>
### asset-cleveland · Cleveland Museum of Art Open Access

- **URL**：[https://www.clevelandart.org/open-access](https://www.clevelandart.org/open-access)
- **适用问题**：东亚艺术、器物、织物、雕塑等内容型主题
- **平台**：Web；API
- **类型**：开放博物馆；原分类 `photo`
- **具体入口或例子**：https://www.clevelandart.org/open-access
- **访问范围**：官方开放访问政策可读
- **采用时的边界**：指定公共领域作品图像及开放元数据采用 CC0；仍有版权/借展等不开放条目。馆徽商标不随 CC0 授权，不暗示馆方背书。
- **实际读取范围**：https://www.clevelandart.org/open-access
- **调研日期**：2026-10-27

<a id="group-type"></a>
## 字体与中文排印

| 条目 | 可解决的问题 |
|---|---|
| [Google Fonts](#asset-google-fonts) · `asset-google-fonts` | 展示字体与正文配对、变量字体、数字特征 |
| [Adobe 思源黑体 / Source Han Sans](#asset-source-han) · `asset-source-han` | 简繁中文界面、密集正文、多语言一致性 |
| [Noto CJK](#asset-noto-cjk) · `asset-noto-cjk` | 中文/日文/韩文内容混排与语言本地字形 |
| [霞鹜文楷 LXGW WenKai](#asset-lxgw-wenkai) · `asset-lxgw-wenkai` | 阅读、手账、语文与人文产品的少量有性格文字 |
| [MiSans](#asset-misans) · `asset-misans` | 清晰中文标题、数字与多语言界面 |

<a id="asset-google-fonts"></a>
### asset-google-fonts · Google Fonts

- **URL**：[https://fonts.google.com/](https://fonts.google.com/)
- **适用问题**：展示字体与正文配对、变量字体、数字特征
- **平台**：Web；自托管字体；多语种
- **类型**：字体；原分类 `type`
- **具体入口或例子**：https://github.com/google/fonts
- **访问范围**：动态FAQ正文为空；官方字体仓库README可读
- **采用时的边界**：以字体家族目录的实际许可为准，不把平台代码许可当字体许可。官方README允许依其许可自托管；保留家族版权和许可，按目标字符集选择。
- **实际读取范围**：https://raw.githubusercontent.com/google/fonts/main/README.md
- **调研日期**：2026-10-27

<a id="asset-source-han"></a>
### asset-source-han · Adobe 思源黑体 / Source Han Sans

- **URL**：[https://github.com/adobe-fonts/source-han-sans](https://github.com/adobe-fonts/source-han-sans)
- **适用问题**：简繁中文界面、密集正文、多语言一致性
- **平台**：Web；原生嵌入；OTF/变量字体
- **类型**：中文/CJK字体；原分类 `type`
- **具体入口或例子**：https://github.com/adobe-fonts/source-han-sans/blob/master/LICENSE.txt
- **访问范围**：官方许可证正文可读
- **采用时的边界**：SIL OFL 1.1；允许按条件使用/嵌入/分发，保留版权与许可，字体不可单独出售；修改版注意 Source 保留字体名。只引入所需地区/字重。
- **实际读取范围**：https://github.com/adobe-fonts/source-han-sans/blob/master/LICENSE.txt
- **调研日期**：2026-10-27

<a id="asset-noto-cjk"></a>
### asset-noto-cjk · Noto CJK

- **URL**：[https://github.com/notofonts/noto-cjk](https://github.com/notofonts/noto-cjk)
- **适用问题**：中文/日文/韩文内容混排与语言本地字形
- **平台**：Web；原生字体
- **类型**：多语种/CJK字体；原分类 `type`
- **具体入口或例子**：https://github.com/notofonts/noto-cjk
- **访问范围**：官方仓库和Sans许可可读
- **采用时的边界**：本次核实 Sans 为 OFL 1.1，嵌入/分发需保留许可；其他子家族也应读各自许可。与思源有设计血缘，不把二者算成两种强差异主题。
- **实际读取范围**：https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/LICENSE
- **调研日期**：2026-10-27

<a id="asset-lxgw-wenkai"></a>
### asset-lxgw-wenkai · 霞鹜文楷 LXGW WenKai

- **URL**：[https://github.com/lxgw/LxgwWenKai](https://github.com/lxgw/LxgwWenKai)
- **适用问题**：阅读、手账、语文与人文产品的少量有性格文字
- **平台**：Web；原生嵌入
- **类型**：中文字体；原分类 `type`
- **具体入口或例子**：https://github.com/lxgw/LxgwWenKai
- **访问范围**：官方README/OFL可读
- **采用时的边界**：OFL 1.1；保留版权与许可；修改版注意保留字体名。当前OFL含限定网页子集/转换的额外命名许可，不能推导为任意改字重命名都允许。
- **实际读取范围**：https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/OFL.txt
- **调研日期**：2026-10-27

<a id="asset-misans"></a>
### asset-misans · MiSans

- **URL**：[https://hyperos.mi.com/font/zh/](https://hyperos.mi.com/font/zh/)
- **适用问题**：清晰中文标题、数字与多语言界面
- **平台**：Web；原生产品
- **类型**：中文/多语种字体；原分类 `type`
- **具体入口或例子**：https://hyperos.mi.com/font/zh/
- **访问范围**：站点超时；官方许可PDF可读
- **采用时的边界**：按本次PDF：免版税许可，但软件内须注明使用MiSans、保留版权/协议，不得改编/二次开发或独立分发字体；用其制作的App等作品可分发/出售。不是OFL；下载时重新核对随附协议。
- **实际读取范围**：https://hyperos.mi.com/font-download/MiSans%E5%AD%97%E4%BD%93%E7%9F%A5%E8%AF%86%E4%BA%A7%E6%9D%83%E8%AE%B8%E5%8F%AF%E5%8D%8F%E8%AE%AE.pdf
- **调研日期**：2026-10-27

<a id="group-icons"></a>
## 图标与系统符号

| 条目 | 可解决的问题 |
|---|---|
| [Lucide](#asset-lucide) · `asset-lucide` | 干净的通用操作与状态符号 |
| [Phosphor Icons](#asset-phosphor) · `asset-phosphor` | 需要统一多字重/填充表达的界面 |
| [Tabler Icons](#asset-tabler) · `asset-tabler` | 丰富的业务实体、工具与状态图标 |
| [Iconify](#asset-iconify) · `asset-iconify` | 按语义搜索并统一使用同一个图标家族 |
| [Apple SF Symbols](#asset-sf-symbols) · `asset-sf-symbols` | 系统操作、语义状态、与系统字体协调的图标 |
| [字节跳动 IconPark](#asset-iconpark) · `asset-iconpark` | 中文业务对象、双色或多色语义图标 |
| [Google Material Symbols](#asset-material-symbols) · `asset-material-symbols` | 统一填充/字重/光学尺寸的符号与选中状态 |

<a id="asset-lucide"></a>
### asset-lucide · Lucide

- **URL**：[https://lucide.dev/](https://lucide.dev/)
- **适用问题**：干净的通用操作与状态符号
- **平台**：SVG；Web组件；设计工具
- **类型**：图标；原分类 `icons`
- **具体入口或例子**：https://lucide.dev/license
- **访问范围**：官方许可可读
- **采用时的边界**：ISC；分发副本需保留版权与许可；部分图标衍生自Feather，保留随包说明。图标只承担语义，不用图标拼出品牌主题。
- **实际读取范围**：https://lucide.dev/license
- **调研日期**：2026-10-27

<a id="asset-phosphor"></a>
### asset-phosphor · Phosphor Icons

- **URL**：[https://phosphoricons.com/](https://phosphoricons.com/)
- **适用问题**：需要统一多字重/填充表达的界面
- **平台**：SVG；Web组件
- **类型**：图标；原分类 `icons`
- **具体入口或例子**：https://github.com/phosphor-icons/core
- **访问范围**：官方core许可可读
- **采用时的边界**：MIT；保留版权/许可。不同主题可选择适合的字重，但一个方向内保持一致，不靠换图标包制造伪方向。
- **实际读取范围**：https://raw.githubusercontent.com/phosphor-icons/core/main/LICENSE
- **调研日期**：2026-10-27

<a id="asset-tabler"></a>
### asset-tabler · Tabler Icons

- **URL**：[https://tabler.io/icons](https://tabler.io/icons)
- **适用问题**：丰富的业务实体、工具与状态图标
- **平台**：SVG；Web组件
- **类型**：图标；原分类 `icons`
- **具体入口或例子**：https://github.com/tabler/tabler-icons
- **访问范围**：官方许可可读
- **采用时的边界**：MIT；保留版权/许可。品牌图标可能有独立商标边界；不要把图标资产许可视作品牌背书。
- **实际读取范围**：https://raw.githubusercontent.com/tabler/tabler-icons/main/LICENSE
- **调研日期**：2026-10-27

<a id="asset-iconify"></a>
### asset-iconify · Iconify

- **URL**：[https://iconify.design/](https://iconify.design/)
- **适用问题**：按语义搜索并统一使用同一个图标家族
- **平台**：Web；SVG；API；设计工具
- **类型**：图标聚合/工具；原分类 `icons`
- **具体入口或例子**：https://icon-sets.iconify.design/
- **访问范围**：官方首页许可说明可读
- **采用时的边界**：框架许可不覆盖图标；每个图标集各有许可。选中一个家族后读取其license元数据，不在页面里随机混搭几十套来源。
- **实际读取范围**：https://iconify.design/
- **调研日期**：2026-10-27

<a id="asset-sf-symbols"></a>
### asset-sf-symbols · Apple SF Symbols

- **URL**：[https://developer.apple.com/sf-symbols/](https://developer.apple.com/sf-symbols/)
- **适用问题**：系统操作、语义状态、与系统字体协调的图标
- **平台**：Apple原生；macOS工具
- **类型**：iOS系统符号；原分类 `icons`
- **具体入口或例子**：https://developer.apple.com/sf-symbols/
- **访问范围**：官网能力页可读；HIG许可细节本次仅JS占位，属于部分核实
- **采用时的边界**：原生实现优先系统符号API并核对目标OS可用性。当前未成功读取完整许可，不将其当通用跨平台SVG素材包；导出/改造/品牌用途需核对Apple当前协议与受限符号说明。
- **实际读取范围**：https://developer.apple.com/sf-symbols/；尝试 https://developer.apple.com/design/human-interface-guidelines/sf-symbols
- **调研日期**：2026-10-27

<a id="asset-iconpark"></a>
### asset-iconpark · 字节跳动 IconPark

- **URL**：[https://github.com/bytedance/IconPark](https://github.com/bytedance/IconPark)
- **适用问题**：中文业务对象、双色或多色语义图标
- **平台**：SVG；Web组件；中文检索生态
- **类型**：图标；原分类 `icons`
- **具体入口或例子**：https://github.com/bytedance/IconPark
- **访问范围**：官方LICENSE可读
- **采用时的边界**：Apache 2.0；按许可证保留声明与改动说明，注意品牌标识的商标边界。双色表达应映射产品语义色，不作为全屏装饰。
- **实际读取范围**：https://raw.githubusercontent.com/bytedance/IconPark/master/LICENSE
- **调研日期**：2026-10-27

<a id="asset-material-symbols"></a>
### asset-material-symbols · Google Material Symbols

- **URL**：[https://developers.google.com/fonts/docs/material_symbols](https://developers.google.com/fonts/docs/material_symbols)
- **适用问题**：统一填充/字重/光学尺寸的符号与选中状态
- **平台**：Web；Android；iOS导出
- **类型**：可变图标；原分类 `icons`
- **具体入口或例子**：https://fonts.google.com/icons
- **访问范围**：官方指南可读
- **采用时的边界**：Apache 2.0；遵守许可证和声明。可用于iOS原型，但视觉适配需服务产品，不把整套Material导航当iOS默认。
- **实际读取范围**：https://developers.google.com/fonts/docs/material_symbols
- **调研日期**：2026-10-27

<a id="group-illustration"></a>
## 插画与动画素材

| 条目 | 可解决的问题 |
|---|---|
| [unDraw](#asset-undraw) · `asset-undraw` | 与任务有明确关系的空状态、说明和辅助场景 |
| [Storyset](#asset-storyset) · `asset-storyset` | 有明确行为的教育、工具说明、轻量引导 |
| [Blush](#asset-blush) · `asset-blush` | 按同一作者系列组合多样人物与场景 |
| [Open Doodles](#asset-open-doodles) · `asset-open-doodles` | 阅读、休息、运动等亲和人物场景 |
| [ManyPixels Gallery](#asset-manypixels) · `asset-manypixels` | 找到一套对应具体任务的辅助插画语言 |
| [LottieFiles — Free Animations](#asset-lottiefiles) · `asset-lottiefiles` | 与任务相关的矢量动效、完成状态、引导与图形反馈 |
| [Rive Marketplace](#asset-rive-marketplace) · `asset-rive-marketplace` | 互动角色、状态机图形、可响应输入的品牌对象 |

<a id="asset-undraw"></a>
### asset-undraw · unDraw

- **URL**：[https://undraw.co/](https://undraw.co/)
- **适用问题**：与任务有明确关系的空状态、说明和辅助场景
- **平台**：SVG/PNG；Web
- **类型**：插画；原分类 `illustration`
- **具体入口或例子**：https://undraw.co/license
- **访问范围**：官方许可可读；自动化资产取用需谨慎
- **采用时的边界**：允许符合许可的商业/个人成品使用，无强制署名；禁止素材包/竞品库再分发、未经同意的相关自动化访问/集成及AI模型开发用途。目录只保存入口，不随skill打包插画。
- **实际读取范围**：https://undraw.co/license
- **调研日期**：2026-10-27

<a id="asset-storyset"></a>
### asset-storyset · Storyset

- **URL**：[https://storyset.com/](https://storyset.com/)
- **适用问题**：有明确行为的教育、工具说明、轻量引导
- **平台**：Web；SVG；动画导出
- **类型**：可编辑/可动插画；原分类 `illustration`
- **具体入口或例子**：https://storyset.com/terms
- **访问范围**：官方条款可读；免费署名/订阅条件分开
- **采用时的边界**：免费授权要求署名；免署名按官网所列有效订阅下载条件；不可再分发为素材库、转售或任意转授权。编辑用途标记及第三方客户交付条件逐项核对。
- **实际读取范围**：https://storyset.com/terms
- **调研日期**：2026-10-27

<a id="asset-blush"></a>
### asset-blush · Blush

- **URL**：[https://blush.design/](https://blush.design/)
- **适用问题**：按同一作者系列组合多样人物与场景
- **平台**：Web；设计工具
- **类型**：组合插画；原分类 `illustration`
- **具体入口或例子**：https://blush.design/license
- **访问范围**：受限候选：官网与许可页本次403
- **采用时的边界**：未读取当前许可全文，不标注免费或商用；使用前确认收藏集许可、账号套餐、SVG/PNG导出、成品及源码再分发范围。
- **实际读取范围**：尝试 https://blush.design/license；https://blush.design/（403）
- **调研日期**：2026-10-27

<a id="asset-open-doodles"></a>
### asset-open-doodles · Open Doodles

- **URL**：[https://www.opendoodles.com/](https://www.opendoodles.com/)
- **适用问题**：阅读、休息、运动等亲和人物场景
- **平台**：SVG/PNG/GIF；Web
- **类型**：手绘人物插画；原分类 `illustration`
- **具体入口或例子**：https://www.opendoodles.com/
- **访问范围**：官方页及用途声明可读
- **采用时的边界**：官方页明确可商业/个人使用且无需署名；本次页没有完整CC许可证文本，不额外断言全部为CC0。用于具体内容，不当默认空状态装饰。
- **实际读取范围**：https://www.opendoodles.com/
- **调研日期**：2026-10-27

<a id="asset-manypixels"></a>
### asset-manypixels · ManyPixels Gallery

- **URL**：[https://www.manypixels.co/gallery](https://www.manypixels.co/gallery)
- **适用问题**：找到一套对应具体任务的辅助插画语言
- **平台**：SVG；可改色图库
- **类型**：插画；原分类 `illustration`
- **具体入口或例子**：https://www.manypixels.co/gallery
- **访问范围**：图库和页尾许可正文可读
- **采用时的边界**：允许商业/个人成品使用，无强制署名；禁止素材包/竞品库及相关集成分发。使用少量插画丰富内容，不把图库作为skill内置素材源打包。
- **实际读取范围**：https://www.manypixels.co/gallery（页尾Licence）
- **调研日期**：2026-10-27

<a id="asset-lottiefiles"></a>
### asset-lottiefiles · LottieFiles — Free Animations

- **URL**：[https://lottiefiles.com/free-animations](https://lottiefiles.com/free-animations)
- **适用问题**：与任务相关的矢量动效、完成状态、引导与图形反馈
- **平台**：Web / iOS（需对应 runtime）
- **类型**：动画素材与社区；原分类 `illustration`
- **具体入口或例子**：https://lottiefiles.com/page/license；按 success / interactivity / theming 等语义检索具体文件
- **访问范围**：公开目录与 Lottie Simple License 可读；未下载单项文件或核实其导出门槛
- **采用时的边界**：已读许可允许符合条件的商业使用及改作，并要求文件及改作保持同样许可条件；不得汇集为竞品服务。免费公共文件与 Premium/Marketplace 条款分开，runtime 许可也分开。
- **实际读取范围**：已读公开目录和官方许可；未播放、下载或集成动画。
- **调研日期**：2026-10-27

<a id="asset-rive-marketplace"></a>
### asset-rive-marketplace · Rive Marketplace

- **URL**：[https://rive.app/marketplace/](https://rive.app/marketplace/)
- **适用问题**：互动角色、状态机图形、可响应输入的品牌对象
- **平台**：Rive / Web / iOS（需对应 runtime）
- **类型**：互动图形资产发现；原分类 `illustration`
- **具体入口或例子**：原 community 地址重定向到 marketplace；Featured / Latest / For Hire
- **访问范围**：本次仅得到目录外壳，具体作品、状态机与授权未读取
- **采用时的边界**：保留为条件可用候选；不把 Rive runtime 的 MIT 许可推到社区作品、编辑器或订阅功能。
- **实际读取范围**：打开 https://rive.app/community/ 实际重定向至 marketplace；仅外壳可读，文档入口失败。
- **调研日期**：2026-10-27

<a id="group-material"></a>
## 纹理、3D 与游戏物件

| 条目 | 可解决的问题 |
|---|---|
| [Poly Haven](#asset-polyhaven) · `asset-polyhaven` | 真实材质、自然光、产品对象3D渲染 |
| [ambientCG](#asset-ambientcg) · `asset-ambientcg` | 纸、布、木、石等有领域来源的材质 |
| [Kenney](#asset-kenney) · `asset-kenney` | 轻度游戏化、收藏对象、玩具化场景、UI音效 |
| [Sketchfab](#asset-sketchfab) · `asset-sketchfab` | 具体文物、自然物、器械的空间研究和可用模型发现 |

<a id="asset-polyhaven"></a>
### asset-polyhaven · Poly Haven

- **URL**：[https://polyhaven.com/](https://polyhaven.com/)
- **适用问题**：真实材质、自然光、产品对象3D渲染
- **平台**：Blender；渲染；WebGL预制资产
- **类型**：HDRI/纹理/3D；原分类 `material`
- **具体入口或例子**：https://polyhaven.com/license
- **访问范围**：官方许可可读
- **采用时的边界**：资产CC0，可商业使用与按许可分发；网站条款仍禁止未经许可的抓取/数据挖掘。应选具体所需资产，不批量镜像。
- **实际读取范围**：https://polyhaven.com/license
- **调研日期**：2026-10-27

<a id="asset-ambientcg"></a>
### asset-ambientcg · ambientCG

- **URL**：[https://ambientcg.com/](https://ambientcg.com/)
- **适用问题**：纸、布、木、石等有领域来源的材质
- **平台**：渲染；WebGL；图像预制
- **类型**：PBR材质/纹理/模型；原分类 `material`
- **具体入口或例子**：https://docs.ambientcg.com/license/
- **访问范围**：官方许可可读
- **采用时的边界**：下载资产及各资产预览渲染为CC0；可在项目内含原始文件。选择素材仍要考虑移动端体积，不为“高级”随机铺纹理。
- **实际读取范围**：https://docs.ambientcg.com/license/
- **调研日期**：2026-10-27

<a id="asset-kenney"></a>
### asset-kenney · Kenney

- **URL**：[https://kenney.nl/assets](https://kenney.nl/assets)
- **适用问题**：轻度游戏化、收藏对象、玩具化场景、UI音效
- **平台**：Web；游戏引擎；原型
- **类型**：2D/3D/UI/音频游戏资产；原分类 `material`
- **具体入口或例子**：https://kenney.nl/support
- **访问范围**：官方支持页许可可读
- **采用时的边界**：asset pages游戏资产为CC0，仍读具体包License；不需署名，Kenney logo不在此自由使用范围。工具产品和网页代码不自动继承资产许可。
- **实际读取范围**：https://kenney.nl/support
- **调研日期**：2026-10-27

<a id="asset-sketchfab"></a>
### asset-sketchfab · Sketchfab

- **URL**：[https://sketchfab.com/](https://sketchfab.com/)
- **适用问题**：具体文物、自然物、器械的空间研究和可用模型发现
- **平台**：Web模型预览；下载/API候选
- **类型**：3D模型；原分类 `material`
- **具体入口或例子**：https://sketchfab.com/licenses
- **访问范围**：受限候选：许可与下载API指南本次403
- **采用时的边界**：不把可预览视作可下载/可商用；逐模型确认是否允许下载、CC具体类型或商业许可、作者署名与再分发。需要明确许可后才能纳入成品。
- **实际读取范围**：尝试 https://sketchfab.com/licenses；https://sketchfab.com/developers/download-api/guidelines（403）
- **调研日期**：2026-10-27

<a id="group-audio"></a>
## 声音与环境素材

| 条目 | 可解决的问题 |
|---|---|
| [Freesound](#asset-freesound) · `asset-freesound` | 真实环境、动作质感、低频反馈音 |
| [Sonniss GameAudioGDC](#asset-sonniss) · `asset-sonniss` | 有明确事件意义的机械、环境与动作声音 |
| [BBC Sound Effects](#asset-bbc-sfx) · `asset-bbc-sfx` | 历史情境、地域声景、声音研究 |
| [Mixkit Sound Effects](#asset-mixkit) · `asset-mixkit` | 短促动作提示、自然背景、少量完成音 |
| [ZapSplat](#asset-zapsplat) · `asset-zapsplat` | 细分拟音、UI反馈、环境与物件声音 |

<a id="asset-freesound"></a>
### asset-freesound · Freesound

- **URL**：[https://freesound.org/](https://freesound.org/)
- **适用问题**：真实环境、动作质感、低频反馈音
- **平台**：Web；音频下载；API
- **类型**：音效/田野录音；原分类 `audio`
- **具体入口或例子**：https://freesound.org/help/faq/
- **访问范围**：官方FAQ可读；下载按账号要求
- **采用时的边界**：逐文件区分CC0、CC BY、CC BY-NC及旧Sampling+；商业项目不默认用NC，BY按作者署名。来源是用户上传，核实内容与用途，别把整站称为可商用免署名。
- **实际读取范围**：https://freesound.org/help/faq/
- **调研日期**：2026-10-27

<a id="asset-sonniss"></a>
### asset-sonniss · Sonniss GameAudioGDC

- **URL**：[https://sonniss.com/](https://sonniss.com/)
- **适用问题**：有明确事件意义的机械、环境与动作声音
- **平台**：Web；音频文件
- **类型**：专业音效包；原分类 `audio`
- **具体入口或例子**：https://sonniss.com/gdc-bundle-license/
- **访问范围**：官方许可可读；本次版本2.0，生效2026-08-27
- **采用时的边界**：允许按条件嵌入商业/个人项目；禁止音效作为素材再分发，包括资产包、模板和SDK，修改过也不能规避。不得用于AI技术开发/训练；下载日期对应的许可版本重要。
- **实际读取范围**：https://sonniss.com/gdc-bundle-license/
- **调研日期**：2026-10-27

<a id="asset-bbc-sfx"></a>
### asset-bbc-sfx · BBC Sound Effects

- **URL**：[https://sound-effects.bbcrewind.co.uk/](https://sound-effects.bbcrewind.co.uk/)
- **适用问题**：历史情境、地域声景、声音研究
- **平台**：Web
- **类型**：历史/环境音效；原分类 `audio`
- **具体入口或例子**：https://sound-effects.bbcrewind.co.uk/licensing
- **访问范围**：部分核实：官网可见个人/教育用途说明；完整许可依赖JS
- **采用时的边界**：不作为默认商业成品素材；官网摘要限定个人/教育或另行授权，商业和再分发需读取完整许可。可先用于声音研究，不能猜免费商用。
- **实际读取范围**：https://sound-effects.bbcrewind.co.uk/licensing
- **调研日期**：2026-10-27

<a id="asset-mixkit"></a>
### asset-mixkit · Mixkit Sound Effects

- **URL**：[https://mixkit.co/free-sound-effects/](https://mixkit.co/free-sound-effects/)
- **适用问题**：短促动作提示、自然背景、少量完成音
- **平台**：Web；WAV/MP3
- **类型**：音效；原分类 `audio`
- **具体入口或例子**：https://mixkit.co/license/modal/sfxFree/
- **访问范围**：官网及Sound Effects专用许可可读
- **采用时的边界**：允许商业/非商业复合作品；禁止独立素材、工具/模板或随源文件再分发。不能把音效塞进可复用skill示例源码包；视频/音乐有另外许可，不能混用。
- **实际读取范围**：https://mixkit.co/license/modal/sfxFree/
- **调研日期**：2026-10-27

<a id="asset-zapsplat"></a>
### asset-zapsplat · ZapSplat

- **URL**：[https://www.zapsplat.com/](https://www.zapsplat.com/)
- **适用问题**：细分拟音、UI反馈、环境与物件声音
- **平台**：Web；账号下载
- **类型**：音效/音乐；原分类 `audio`
- **具体入口或例子**：https://www.zapsplat.com/license-type/standard-license/
- **访问范围**：官方许可可读；Basic/Premium不同；2026-05-08更新
- **采用时的边界**：Basic可商用但需署名；Premium按有效下载期免署名。允许嵌入成品，不允许音效作为主要价值/独立库分发；禁止自动化访问和AI训练。不要用在以库存声音为主要价值的放松/音板产品中。
- **实际读取范围**：https://www.zapsplat.com/license-type/standard-license/
- **调研日期**：2026-10-27

