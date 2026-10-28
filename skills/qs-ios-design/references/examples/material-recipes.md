# 选材与模块组合建议

以下 10 个配方是本研究提出的设计建议，不是已验证产品、已经完成的作品或必须套用的模板。配方展示内容、材料和模块怎样配合；可以替换、拆开、跨领域迁移，也可以完全另拟主题。

调研目录快照：2026-10-27。单项证据优先于名称或评价；迁移建议与来源事实分别列出。

## 按任务或 ID 定位

先看目录，只读匹配当前问题的卡片。可在仓库根目录检索：

```sh
rg -n '潮汐|中文|输入|case-' skills/qs-ios-design/references/examples/material-recipes.md
```

[返回案例路由](index.md) · [寻找素材或实现来源](../source-registry.md)

不要建立“金融 → 仪表盘”“学习 → 叠卡”等固定映射。同一产品的多个方向仍要保留相同承诺功能，差别应来自内容组织、视觉主题与操纵方式。某份配方没有包含所需领域数据时，应继续按当前问题查找，而不是把素材当成数据。

| 案例 | 当前要解决的任务 |
|---|---|
| [潮汐应用](#case-tide-window) · `case-tide-window` | 潮汐应用：用户要判断某个真实海滩何时适合下水 |
| [中文阅读](#case-chinese-reading) · `case-chinese-reading` | 中文阅读：正文舒适，笔记保留手写亲近感 |
| [博物馆导览](#case-museum-detail) · `case-museum-detail` | 博物馆导览：看清器物局部与年代关系 |
| [呼吸练习](#case-breathing) · `case-breathing` | 呼吸练习：跟随节律并区分吸气、保持、呼气 |
| [记账](#case-receipt-ledger) · `case-receipt-ledger` | 记账：金额录入快，同时能回看消费凭证 |
| [习惯应用](#case-habit-object) · `case-habit-object` | 习惯应用：让一次完成有可感知的分量 |
| [语言学习](#case-language-scene) · `case-language-scene` | 语言学习：把词语与真实生活情境连接 |
| [运动记录](#case-fitness) · `case-fitness` | 运动记录：清楚区分动作教学、当次训练和长期趋势 |
| [工具产品首次空状态](#case-onboarding-empty) · `case-onboarding-empty` | 工具产品首次空状态：解释要创建什么以及下一步 |
| [同一动作在未选中、选中、进行中和完成时清晰可辨](#case-mobile-icon-states) · `case-mobile-icon-states` | 同一动作在未选中、选中、进行中和完成时清晰可辨 |

<a id="case-tide-window"></a>
### case-tide-window · 潮汐应用

- **性质**：本方案提出的选材配方
- **任务**：潮汐应用：用户要判断某个真实海滩何时适合下水
- **可迁移的原则或机制**：选对海滩/海岸类型的实景，主图裁切留下潮线阅读空间；潮高/时间曲线由真实或明确mock数据绘制SVG，不用图库波浪替代数据。
- **可变化的部分**：地点主图、可拖时间带、条件细节三种不同结构共享海色与数字角色。
- **适用限制**：不要用一张漂亮海景替代潮汐信息，也不要将随机波浪图误当实际预报。
- **证据与读取范围**：本研究的设计建议；不是已经生成或运行的作品。
- **关联来源**：[Unsplash](../sources/media-assets.md#asset-unsplash)（`asset-unsplash`）；[Pexels](../sources/media-assets.md#asset-pexels)（`asset-pexels`）；[Lucide](../sources/media-assets.md#asset-lucide)（`asset-lucide`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-chinese-reading"></a>
### case-chinese-reading · 中文阅读

- **性质**：本方案提出的选材配方
- **任务**：中文阅读：正文舒适，笔记保留手写亲近感
- **可迁移的原则或机制**：正文选适合长读的字体/系统字，文楷仅用于书摘或注记；用真实长短中文及英文数字决定行宽和层级。
- **可变化的部分**：阅读面、引文边注、章节导航各自设计，统一基线和留白。
- **适用限制**：不要把全界面改成书法字体，或为装饰加入无关古风插画。
- **证据与读取范围**：本研究的设计建议；不是已经生成或运行的作品。
- **关联来源**：[Adobe 思源黑体 / Source Han Sans](../sources/media-assets.md#asset-source-han)（`asset-source-han`）；[霞鹜文楷 LXGW WenKai](../sources/media-assets.md#asset-lxgw-wenkai)（`asset-lxgw-wenkai`）；[Google Fonts](../sources/media-assets.md#asset-google-fonts)（`asset-google-fonts`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-museum-detail"></a>
### case-museum-detail · 博物馆导览

- **性质**：本方案提出的选材配方
- **任务**：博物馆导览：看清器物局部与年代关系
- **可迁移的原则或机制**：选具体开放藏品图及元数据，允许放大纹饰；主色取自器物；若需要年代轴，由条目年份建立。
- **可变化的部分**：满幅藏品、局部观察、时间关系与展览路径分别服务任务。
- **适用限制**：不复制馆方整页，也不把所有馆藏误归为开放图像；现代作品逐项查。
- **证据与读取范围**：本研究的设计建议；不是已经生成或运行的作品。
- **关联来源**：[The Metropolitan Museum of Art Open Access](../sources/media-assets.md#asset-met)（`asset-met`）；[Cleveland Museum of Art Open Access](../sources/media-assets.md#asset-cleveland)（`asset-cleveland`）；[Rijksmuseum Collection Online](../sources/media-assets.md#asset-rijksmuseum)（`asset-rijksmuseum`）；[Wikimedia Commons](../sources/media-assets.md#asset-wikimedia)（`asset-wikimedia`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-breathing"></a>
### case-breathing · 呼吸练习

- **性质**：本方案提出的选材配方
- **任务**：呼吸练习：跟随节律并区分吸气、保持、呼气
- **可迁移的原则或机制**：主交互直接用呼吸时长驱动原创形状变化；只在主题有依据时加入极轻材质；声音选许可明确的自然声且可关闭。
- **可变化的部分**：呼吸场、进度、历史节律各用合适结构，减少高频装饰反馈。
- **适用限制**：不把每屏都铺海浪视频；库存声音成为产品主要价值时需额外核对许可。
- **证据与读取范围**：本研究的设计建议；不是已经生成或运行的作品。
- **关联来源**：[ambientCG](../sources/media-assets.md#asset-ambientcg)（`asset-ambientcg`）；[Freesound](../sources/media-assets.md#asset-freesound)（`asset-freesound`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-receipt-ledger"></a>
### case-receipt-ledger · 记账

- **性质**：本方案提出的选材配方
- **任务**：记账：金额录入快，同时能回看消费凭证
- **可迁移的原则或机制**：真实金额/商户/分类是主角；数字字形和列对齐优先；仅凭证区域可用轻纸感，通用动作选一套图标。
- **可变化的部分**：金额输入面、消费流水、分类比较各有结构；凭证展开保持对象连续。
- **适用限制**：不购买通用金融插画放满首页，不靠纸纹理替代录入设计。
- **证据与读取范围**：本研究的设计建议；不是已经生成或运行的作品。
- **关联来源**：[Adobe 思源黑体 / Source Han Sans](../sources/media-assets.md#asset-source-han)（`asset-source-han`）；[字节跳动 IconPark](../sources/media-assets.md#asset-iconpark)（`asset-iconpark`）；[ambientCG](../sources/media-assets.md#asset-ambientcg)（`asset-ambientcg`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-habit-object"></a>
### case-habit-object · 习惯应用

- **性质**：本方案提出的选材配方
- **任务**：习惯应用：让一次完成有可感知的分量
- **可迁移的原则或机制**：选择与习惯或主题相关的物件或原创形状，设计按压/持续输入/回退/完成；音效只补充有意义的落定。
- **可变化的部分**：主动作像可操纵对象，日历和统计保持清晰，材质与灯光统一。
- **适用限制**：不照抄Not Boring标志性模型，不把每天几十次的操作变成强制庆祝表演。
- **证据与读取范围**：本研究的设计建议；不是已经生成或运行的作品。
- **关联来源**：[Kenney](../sources/media-assets.md#asset-kenney)（`asset-kenney`）；[Poly Haven](../sources/media-assets.md#asset-polyhaven)（`asset-polyhaven`）；[Freesound](../sources/media-assets.md#asset-freesound)（`asset-freesound`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-language-scene"></a>
### case-language-scene · 语言学习

- **性质**：本方案提出的选材配方
- **任务**：语言学习：把词语与真实生活情境连接
- **可迁移的原则或机制**：按目标词/情境找图片，例如具体炊具或交通动作；多语字体保证字形；音频只用许可明确且语义正确的素材或用户内容。
- **可变化的部分**：情境图、词语揭示、例句操纵与复习列表按认知任务设计。
- **适用限制**：不以随机人物插画代替单词内容，不把未核实来源的音频当准确发音。
- **证据与读取范围**：本研究的设计建议；不是已经生成或运行的作品。
- **关联来源**：[Pexels](../sources/media-assets.md#asset-pexels)（`asset-pexels`）；[Wikimedia Commons](../sources/media-assets.md#asset-wikimedia)（`asset-wikimedia`）；[Noto CJK](../sources/media-assets.md#asset-noto-cjk)（`asset-noto-cjk`）；[Openverse](../sources/media-assets.md#asset-openverse)（`asset-openverse`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-fitness"></a>
### case-fitness · 运动记录

- **性质**：本方案提出的选材配方
- **任务**：运动记录：清楚区分动作教学、当次训练和长期趋势
- **可迁移的原则或机制**：教学用相关动作照片/短视频，当次训练让组数/间歇数字主导，趋势用真实训练数据原创绘制。
- **可变化的部分**：教学媒体、训练控制台、趋势图各有特色，字体与动作反馈统一。
- **适用限制**：不将三处都塞成图片卡片；视频许可不代表动作正确性已验证。
- **证据与读取范围**：本研究的设计建议；不是已经生成或运行的作品。
- **关联来源**：[Pexels](../sources/media-assets.md#asset-pexels)（`asset-pexels`）；[Phosphor Icons](../sources/media-assets.md#asset-phosphor)（`asset-phosphor`）；[Google Fonts](../sources/media-assets.md#asset-google-fonts)（`asset-google-fonts`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-onboarding-empty"></a>
### case-onboarding-empty · 工具产品首次空状态

- **性质**：本方案提出的选材配方
- **任务**：工具产品首次空状态：解释要创建什么以及下一步
- **可迁移的原则或机制**：只有真实内容还不存在时，选与用户动作直接相关的一幅小插画；保持相同作者语言，围绕一个明确创建动作。
- **可变化的部分**：空状态有内容与入口；数据出现后插画退场，界面由真实对象接管。
- **适用限制**：不用通用插画永久占据有内容的首页；不把受限制资产随skill模板包分发。
- **证据与读取范围**：本研究的设计建议；不是已经生成或运行的作品。
- **关联来源**：[Open Doodles](../sources/media-assets.md#asset-open-doodles)（`asset-open-doodles`）；[Storyset](../sources/media-assets.md#asset-storyset)（`asset-storyset`）；[ManyPixels Gallery](../sources/media-assets.md#asset-manypixels)（`asset-manypixels`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

<a id="case-mobile-icon-states"></a>
### case-mobile-icon-states · 同一动作在未选中、选中、进行中和完成时清晰可辨

- **性质**：本方案提出的选材配方
- **任务**：同一动作在未选中、选中、进行中和完成时清晰可辨
- **可迁移的原则或机制**：原生优先合适系统符号；HTML选许可明确的一套SVG/变量图标，状态变化由同一业务状态驱动。
- **可变化的部分**：控制与内容共享语义，但图标本身不取代文字和主内容。
- **适用限制**：不混三套图标；不认为SF Symbols自动可当跨平台图标包。
- **证据与读取范围**：本研究的设计建议；不是已经生成或运行的作品。
- **关联来源**：[Apple SF Symbols](../sources/media-assets.md#asset-sf-symbols)（`asset-sf-symbols`）；[Lucide](../sources/media-assets.md#asset-lucide)（`asset-lucide`）；[Google Material Symbols](../sources/media-assets.md#asset-material-symbols)（`asset-material-symbols`）
- **目录调研日**：2026-10-27（原案例未单列调研日期）

