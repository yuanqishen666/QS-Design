---
name: qs-design
description: 统一设计数字产品页面、流程、可操作原型与交互动效；从模糊业务语言形成业务特异、视觉优秀、跨平台原生且可验证的体验。支持无项目聊天出图、已有产品增量设计、页面重构、审计和交互实验；不用于纯后端或与界面无关的任务。
metadata:
  version: "3.4.1"
  author: QS
---

# QS Design

QS Design 是唯一用户入口。不要要求用户改用内部子技能，也不要假定用户有项目、仓库或文件夹。设计任务是上下文根；项目只是可选事实源和存储后端。

目标不是“去 AI 味”，而是让主导设计决策从当前业务、用户任务、真实内容、品牌与平台能力中产生。方法可以稳定，结果不能形成统一 QS 风格。

## 最高原则

1. **业务条件化**：页面拓扑、视觉主角、核心模块、图像策略、色彩行为和标志性交互必须能追踪到业务、用户结果、品牌或平台语境。纯审美可以存在，但只能作为支持层。
2. **上下文最小授权**：存过不等于可以读。每次生成只接收 `context-manifest` 明确允许的内容；profile 的“允许保存”和“允许本任务读取”是两次独立授权。
3. **拒绝稿隔离**：`rejected`、`archived` 和未点名候选不得进入新一轮生成上下文。仅写“忽略前文”不够；需要无历史设计工作器或等价的物理上下文隔离。
4. **连续性契约**：内部产品、官方品牌、外部参考和历史生成物分别处理；不再绝对隔离现有 UI，也不无条件继承。
5. **自适应发散**：根据真实设计不确定性选择 1–3 个方向，不固定三案，不让平台数量乘以方向数量。
6. **艺术指导独立成立**：业务正确不等于视觉优秀。每个正式方向必须具备完整 Art Direction Contract 和真实渲染工艺检查。
7. **语义而非风格标签**：将“专业但不冷”等模糊表达转成业务含义、可观察体验和设计决定，不直接映射成流行风格。
8. **共享语义、平台原生**：五端共享业务结果、内容和状态；导航、控件、密度、动效和触觉分别按平台重设计。
9. **证据而非总分**：验证报告使用 `finding | clean | unknown | not-applicable`，不输出统一审美总分。
10. **人类保留主权**：只有用户明确决定才能成为持续约束；模型推断和候选反馈默认不成为长期偏好。
11. **结构先解释**：先让业务拓扑、视觉层级、间距、数据关系和清晰操作完成解释；辅助文字只有在承载不可替代业务语义时进入界面，关键事实不得藏入 tooltip。
12. **载体先于容器**：先决定业务对象、排印、图像、数据图形、形状、材料、光线、符号、空间或运动中的主导视觉载体，再决定组件；卡片、边框和面板只用于真实语义边界。
13. **事实先于创作**：正式方向生成前建立会话级 Product Truth；可见操作是 allowlist，未确认功能、人物、场景、示例和数据不得由模型补写。
14. **有界反馈与变更**：用户反馈先转成 preserve / change / do-not-infer / next experiment；迭代时用稳定元素身份和 Mutation Scope 保护未点名决定，不静默覆盖。

## 路由

先判断工作模式：

- 新设计、重构或视觉改进：设计模式；
- 用户明确只要求检查、分析或报告，并且没有要求新设计产物：读取 [审计模式](references/modes/audit.md)，只报告；
- 高成本、自定义或标志性交互：读取 [交互实验模式](references/modes/interaction-lab.md)；
- 用户批准后要求接入源码：实现模式；
- 用户说重来、换方向或不参考前面：上下文重置模式。

按用户期望的结果路由，不按句式路由。“还能怎么优化”“可以怎样改造”“这个页面有什么提升空间”等问句仍属于设计模式；只有用户明确把范围限定为纯检查、纯分析或纯建议时，才允许审计模式纯文字结束。不得自行宣布“本轮只评审”来缩小设计请求；若真实缺口会改变主任务或视觉基调，只问一个高信息量问题，否则直接设计。

再判断目标平台，只加载相关适配器：

- iOS / iPadOS：[iOS 适配器](references/platforms/ios/adapter.md)
- Android：[Android 适配器](references/platforms/android/adapter.md)
- Web：[Web 适配器](references/platforms/web/adapter.md)
- 微信小程序：[微信适配器](references/platforms/wechat-miniapp/adapter.md)
- 支付宝小程序：[支付宝适配器](references/platforms/alipay-miniapp/adapter.md)

多端任务先建立一份共享业务模型，再为各平台生成原生表达。平台版本不是不同概念方向。

## Task Capsule

每次设计围绕 Task Capsule 工作。纯聊天默认 `ephemeral`；需要跨聊天时可使用 `chat` 或导出 `.qsdesign`；只有需要接入代码或团队共享时才使用 `project`。

Task Capsule 严格区分业务事实、用户当前要求、模型假设、候选设计和用户决定，并可携带 Product Truth、Attention、Terminology、Prototype 与 Reference Synthesis 合同。`read_policy` 是所有运行清单的权限上界，可以拒绝上下文或候选，并单独允许本任务读取已获保存同意的 profile 项。隔离工作器必须接收 `buildWorkerPayload()` 生成的完整哈希 payload，禁止用人工摘录的 brief 替代或删减；其中 `execution_policy` 是始终注入的过程约束，不属于可被重置排除的历史设计上下文。实现合同见 [任务胶囊与隔离](references/core/task-capsule-and-isolation.md)。

## 产品事实、注意力与术语

正式方向前读取 [产品事实、注意力与术语合同](references/core/product-truth-attention-and-terms.md)：

- Product Truth 记录首要任务、关键旅程、已有 route/state、可见控件 allowlist、禁止虚构项、unknown 和代表任务选择依据；
- Attention Contract 冻结第一视口问题、唯一 rank-1 主操作、次/三级对象与五项注意力证据，但不规定固定构图或风格；
- Terminology Contract 记录概念含义、候选标签、可能误解、禁用同义词和 label-only prediction；先改名或结构，不能用辅助文案补救误导标签；
- 无项目聊天时来源是当前对话；已有产品时来源是用户修正、运行界面和源码事实。合同只属于当前任务，不形成项目或 profile 的审美记忆。

其他设计合同存在时必须先有 Product Truth。未列入 allowlist 的新控件、示例、人物、场景、数据和状态不得进入正式候选；真正必要但未确认的内容保持 `unknown`。

## 用户意图与候选关系

| 用户表达 | 关系 |
|---|---|
| 新做、再做一个、换个方向 | `fresh-root` |
| 继续这个、基于 B 调整 | `continue-parent` |
| 保留结构但重做视觉 | `aspect-inheritance` |
| A 的结构加 C 的交互 | `explicit-merge` |
| 都不满意，保留功能重来 | `soft-reset` |
| 完全忽略前面 | `hard-reset` |

软重置默认只保留业务事实、平台目标和用户明确排除项；当前功能要求、官方约束、旧语义意图或连续性合同只有逐项再次授权才可带入。硬重置只保留当前逐项再次确认的事实、要求与强制约束。多个可能父版本且无法判断时，只问一个必要问题。

用户拒绝或调整候选时使用 [反馈增量、原型与参考蒸馏](references/core/feedback-prototype-and-reference.md) 建立 Feedback Delta，记录问题、目标、诊断置信度、保留、改变、不得推断、下一实验与可观察成功条件。低置信度审美诊断不能直接扩张到全产品；soft/hard reset 必须绑定用户原始授权。

`aspect-inheritance` 只允许一个父候选，并通过 `aspect_refs` 读取点名方面；多个父候选必须使用 `explicit-merge`，为每个父候选分别列出方面。工作器 payload 必须包含授权引用对应的实际内容；缺失内容时失败关闭，不能退回整份旧稿。

## 来源与连续性

读取任何现有内容时，使用 [来源与连续性契约](references/core/source-and-continuity.md)：

- 当前产品可提供业务事实和已确认设计系统；
- 正在重构的目标页面可以只是问题证据，不自动成为视觉权威；
- 官方品牌资产是共同约束；
- 外部案例只通过 Reference Synthesis 提供机制、用户作用、业务适配和局部原则，不复制独特表达；
- 用户点名的已批准父版本可以继承指定方面；
- 历史生成目录默认排除。

所有决定分为 `invariants / preserve / adapt / open / prohibited`。

## 业务与语义建模

设计前按需要读取：

- [业务视觉语法](references/core/business-visual-grammar.md)
- [模糊语义解释](references/core/semantic-intent.md)
- [内容设计](references/core/content-design.md)
- [交互基因](references/core/interaction-genome.md)

至少识别核心对象、关系、状态变化、价值时刻、风险与信任、使用频率和内容形态。缺失信息不会改变产品本质时，声明假设后继续；会改变主任务或视觉基调时，只问一个高信息量问题。

生成辅助文案前执行结构替代测试。辅助内容在 `content_graph` 中记录用途、关键性、受众、时机、显隐载体、不可替代事实和结构尝试；标题、普通标签、动作和原始数据不为填表而重复建模。Tooltip 仅承载简短、可选、少数用户按需需要且不含交互的信息；金额、权限、风险、格式、后果、错误和恢复保持在决策点可见。

## 方向策略

使用 [自适应方向策略](references/core/direction-strategy.md)：明确小改或设计系统内扩展为 1 个方向；一个关键分歧为 2 个方向；产品解释、任务结构或操控模型存在真实分叉为 3 个方向；已选方向深化为 1 个方向。用户明确要求更多探索时可以超过 3 个，但必须说明精修与跨端成本。

多方向先建立一份共享 `comparison_specimen`。新正式候选使用 `contract_version: 2`，除固定代表任务、真实内容 fixture、可见字段、主要动作和业务结果外，还必须记录代表任务 ID、频率/风险/学习价值选择依据、fixture 来源、完整 action order 和所有方向共同证明的 required paths。所有方向绑定同一合同，再改变主导视觉载体、构图、表面、图像/数据关系或材料语言。用户选择后再完成全量原型。方向差异必须存在于产品解释、信息拓扑、操控模型、业务收益和至少两个视觉语法维度，不能靠换色换皮。旧 comparison specimen 可读取和审计，但不能证明 3.4 正式候选。

## 可视化交付门槛

设计模式的最低交付不是分析文字，而是与任务成本相称、可直接查看的视觉产物：小改至少一个静态样张，真实分歧至少一组可比较方向样张，状态或流程是判断重点时提供可点击或原生原型。文字说明、Markdown 表格、ASCII 线框和组件清单只能解释产物，不能替代产物。用户明确只要分析或建议时除外。

读取已有项目、保持源码不变与制作独立原型互不冲突。方向批准只控制是否进入产品源码，不是生成临时样张的前置许可；未获批准时把产物写入独立的会话或临时输出位置，不修改产品源码。

正式交付遵循 `planned → rendered → inspected → presented`。文件生成或验证通过仍不等于用户已经看到：最终回复必须使用宿主支持的内嵌预览展示每个正式方向；可点击或原生产物还要同时给出可打开入口。只给路径、只说“已经生成”或只留下未展示的文件，状态仍是 `rendered`，不能结束设计任务。读取 [反馈增量、原型与参考蒸馏](references/core/feedback-prototype-and-reference.md) 的 Presentation Gate，并记录 Presentation Record。

如果缺少必要输入、渲染能力或展示通道，明确报告 `blocked`、缺失项和可恢复动作；不得用纯文字方案冒充已完成的视觉设计。

## 视觉艺术指导

使用 [视觉艺术指导](references/core/art-direction.md)、[视觉元素语法与表面纪律](references/core/visual-element-grammar.md) 与 [视觉基因](references/core/visual-genome.md)。正式方向必须说明视觉论点、业务锚点、第一视觉对象、主导与辅助视觉载体、表面策略、构图、排印、图像、材料、色彩、空间节奏、运动语言、克制预算、降级路径和不可替换性，并为每个主导决定记录业务、艺术指导、品牌或平台依据、用户作用与移除测试。

卡片、面板、Tile、边框、填充底色和 elevation 不是默认布局单位。只有独立交互、状态、生命周期、链接摘要、模态边界或不可拆分语义组才获得实体表面；同构信息优先使用列表、表格、时间轴、媒体网格、直接标注或画布构图。当用户明确要求独特视觉或品牌表达时，代表视口必须出现一个超越界面镀铬的主导内容/表现载体；排印极简方向也必须靠真实尺度和节奏成立。

必须完成缩放、灰度、去 Logo、去图片、移除容器、元素生态、真实长内容、字体回退、状态、窗口、动效与高频疲劳检查。无依据的 AI 插画、通用 3D、渐变球、玻璃和网格不能作为默认填充。

## 防止 QS house style

使用 [原创性规则](references/core/originality-policy.md)：做内容置换测试、去 Logo 业务识别测试、业务不可替换性说明和设计指纹检查。无关业务重复多个主导决定且没有共同依据时，提示可能形成 QS 风格。

元素不因常见而错误；无业务、品牌或艺术指导依据才构成风险。

## 交互与平台

普通反馈使用平台熟悉行为。高成本交互进入 [交互实验模式](references/modes/interaction-lab.md)，验证重复使用、中断、取消、反向、替代输入、减弱动态和平台实现。每项结论必须带独立证据来源；无来源的 `clean` 自动降为 `unknown`。取消固定 75 分门槛，输出 `适用 / 有限适用 / 需要降级 / 不适用 / 未验证`。

HTML 原型不得假称原生触觉、通知和完整系统行为；原生能力是方向关键时制作原生 sample。

制作产物前建立 Prototype Contract，声明 `specimen / static / clickable / native`、必测路径与状态、fixture、固定视口或设备、证据要求和内部修正上限。Clickable 不能只交付截图；正式产物执行 `render → inspect → diagnose → targeted correction → rerun`，默认最多两轮后交由用户判断。完成检查后建立 Presentation Record；没有被最终回复内嵌的 preview 不能标记为 `presented`。

## 迭代保护与全产品传播

读取 [稳定变更与全产品传播](references/core/stable-change-and-propagation.md)。已展示或已选候选的重要对象分配稳定 `qs-*` 身份；Web 使用 `data-qs-id`，原生端映射平台 identifier。局部反馈通过 Mutation Scope 只授权点名元素和 facet，before/after registry 发现未授权变化时报告并停止或请求扩权。

代表流程获得用户选择后，先建立 Propagation Map，再扩展到全项目。传播图区分全局业务决定、页面特有决定、保留行为、route/state 覆盖和有限例外；传播设计语法，不复制一个页面的视觉模板。

## 批准与实现

方向样张或原型展示后，用户可以选择、调整、软重置或硬重置。制作和展示独立原型不需要源码批准；只有用户明确批准的候选才能进入产品源码。批准同时核对 Task 与 Candidate 身份，并绑定 Task Capsule、Product Truth、Attention、Terminology、Reference Synthesis、Feedback Delta、Mutation Scope、Element Registry、Propagation Map、Presentation Record、业务模型、连续性契约、方向、原型内容哈希、平台捕获、已知未知项和用户原始证据。路径字符串不能冒充产物内容。

业务、结构、用户可见文案、核心视觉或标志性交互改变时重新批准；无外部影响的格式化和测试补充不使批准失效。

## 验证

使用 [验证政策](references/core/verification-policy.md) 和 `engine/cli/qs-design.mjs`。验证覆盖上下文隔离、产品事实、注意力与术语、业务结果、连续性、业务特异性、视觉与内容、原型路径、交互和无障碍、平台能力、视觉产物呈现、局部变更完整性、全产品传播、实现一致性与维护性。正式候选展示前必须对最终渲染 DOM/产物运行 design/content lint；重复命名卡片阵列和卡片嵌套会触发表面告警，并需要语义理由或重构。局部 Web 改造的最终 DOM 同时检查 `data-qs-id`。内容合同格式合法不能代替最终文案检查，缺少最终产物证据时 `content-quality` 必须为 `unknown`。内容验证同时执行无辅助文案任务测试、关键事实可见性测试和跨输入披露检查；不得用固定字数或“字少”代替质量判断。正式设计缺少 Presented 状态、内嵌 preview 或可点击入口时是交付 blocker；未解决的 blocker 或 major finding 不得被描述为已通过验证。

`clean` 只表示当前检查没有发现报告项，不等于设计优秀。不可验证内容必须报告 `unknown`。外部命令中预先声明的状态不是运行证据；只有本次运行实际生成或改变的 assertion report，或执行器直接观察的结果，才能获得证据认证。

## 安全与记忆

- 默认本地、默认无网络；
- 网络、素材搜索和外部工具调用必须可见；
- 所有可执行目标显式声明网络、读路径、写路径和外部程序；声明会被校验和写入证据，操作系统级强制仍由宿主沙箱负责；
- 不默认安装常驻 Hooks；
- 不上传代码、截图和业务数据；
- 用户可查看、导出和删除记忆；
- profile 偏好必须明确同意；
- rejected 候选可只保留状态与哈希，内容可删除。
- 便携会话同时保存候选产物与任务内 decisions、exceptions、approvals 和 verification reports；治理记录不会自动进入生成上下文。
- 独立工作器的 payload 与环境由本包最小化；操作系统级文件隔离仍必须由宿主沙箱提供，未提供时必须明确标记而不能声称已沙箱化。

## 随附实现

- `schemas/`：任务、产品事实、注意力、术语、原型、呈现、参考蒸馏、反馈增量、稳定元素、变更范围、传播、候选、连续性、方向、批准和报告合同；
- `engine/`：上下文、业务、语义、方向、艺术指导、治理与验证；
- `stores/`：ephemeral、chat/portable/project 文件后端；
- `platforms/`：五端统一 Adapter Contract；
- `scripts/`：内容、状态、来源、许可、平台与旧版迁移工具；
- `evals/`：不合成总分的可复现对照评测语料与盲评规则；
- `tests/`：上下文污染、无项目便携包、业务模型、方向、批准、迁移和五端运行证据测试。

所有相对路径以本文件所在目录为根。
