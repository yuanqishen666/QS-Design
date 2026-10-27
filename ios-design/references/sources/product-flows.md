# 真实产品与完整流程

查找真实产品如何完成导航、权限、编辑、保存、付费或回访任务。先找相同任务的流程与状态，再判断当前产品需要怎样组织。

本文件有 9 个来源条目，来自 2026-10-27 的调研快照。下面保留当时的读取范围；未读取、未操作或未确认的部分不会因收入目录而变成已验证。

## 按问题定位

先用目录或 ID 找到相关条目，再打开能填补当前缺口的原文。无需从头读完本文件。可在仓库根目录检索：

```sh
rg -n '导航|编辑|保存|src-mobbin' ios-design/references/sources/product-flows.md
```

[返回来源路由](../source-registry.md) · [按任务找案例](../examples/index.md)

<a id="group-flows"></a>
## 真实产品截图与流程库

| 条目 | 可解决的问题 |
|---|---|
| [Mobbin](#src-mobbin) · `src-mobbin` | 跨产品比较；导航与状态入口 |
| [ScreensDesign（含 UI Sources 重定向）](#src-screensdesign) · `src-screensdesign` | 入门与权限；编辑与保存；付费后流程 |
| [Nicelydone](#src-nicelydone) · `src-nicelydone` | 空态与错误；设置和权限；取消及恢复流程 |
| [Pttrns](#src-pttrns) · `src-pttrns` | 按控件语义查找；权限、空态与选择；移动端模块结构 |
| [SaaSFrame](#src-saasframe) · `src-saasframe` | 数据密度；账单与确认；表格、筛选、空态 |
| [Apple Design Awards 历年案例](#src-apple-awards) · `src-apple-awards` | 主题与交互关系；不同类型产品；官方原作者访谈入口 |
| [Page Flows](#src-pageflows) · `src-pageflows` | 完整任务链；状态及流程顺序 |
| [Refero](#src-refero) · `src-refero` | 跨屏参考发现；网页与移动结构比较 |
| [Appshots](#src-appshots) · `src-appshots` | 移动任务流程发现；后续有账户时检索 |

<a id="src-mobbin"></a>
### src-mobbin · Mobbin

- **URL**：[https://mobbin.com/](https://mobbin.com/)
- **适用问题**：跨产品比较；导航与状态入口
- **平台**：iOS / Android / Web
- **类型**：real_product_screen_flow_index；原分类 `flows`
- **具体入口或例子**：官网 Apps / Screens / Flows / Animations；公开页出现 Flighty、Oura、Spotify 等样例
- **访问范围**：公开首页可读；有登录与付费方案入口；本次未进入账户内完整流程
- **采用时的边界**：按具体任务检索；截图可用于观察，不等于可再分发素材；库规模不作为质量依据
- **实际读取范围**：读取首页产品栏目与样例名称，未播放或操作完整流程
- **调研日期**：2026-10-27

<a id="src-screensdesign"></a>
### src-screensdesign · ScreensDesign（含 UI Sources 重定向）

- **URL**：[https://screensdesign.com/](https://screensdesign.com/)
- **适用问题**：入门与权限；编辑与保存；付费后流程
- **平台**：iOS / Mobile
- **类型**：mobile_recording_flow_index；原分类 `flows`
- **具体入口或例子**：公开页 VSCO 章节：照片权限、编辑、分享保存、画廊与拼贴
- **访问范围**：首页及录屏章节标签可读；Login / Go Pro 可见；完整录屏未观看
- **采用时的边界**：可从章节定位实际功能；营收估算不证明 UX 优劣；不要默认模仿付费墙
- **实际读取范围**：读取首页 VSCO 章节清单；https://www.uisources.com/ 实际跳转至此
- **调研日期**：2026-10-27

<a id="src-nicelydone"></a>
### src-nicelydone · Nicelydone

- **URL**：[https://nicelydone.club/examples](https://nicelydone.club/examples)
- **适用问题**：空态与错误；设置和权限；取消及恢复流程
- **平台**：Web / SaaS
- **类型**：real_product_saas_flow_index；原分类 `flows`
- **具体入口或例子**：https://nicelydone.club/examples/flows/f9f33978-3be8-4427-93f9-66556d3f3972（Daybridge 取消订阅，具体入口由公开索引与搜索确认）
- **访问范围**：公开 examples 索引可读，含屏数、状态和流程描述；登录入口可见；未声称账户内全部图片已读
- **采用时的边界**：借状态与反馈逻辑，转换为 iOS 导航；不直接缩小桌面 UI
- **实际读取范围**：读取 examples 中 Daybridge 取消流程、Lightspark 验证错误、空日历等具体描述
- **调研日期**：2026-10-27

<a id="src-pttrns"></a>
### src-pttrns · Pttrns

- **URL**：[https://app.pttrns.com/patterns](https://app.pttrns.com/patterns)
- **适用问题**：按控件语义查找；权限、空态与选择；移动端模块结构
- **平台**：iOS / Mobile
- **类型**：mobile_ui_pattern_index；原分类 `flows`
- **具体入口或例子**：Patterns：Ask Permission / Date & Time / Empty States / Maps / Sheet - Bottom
- **访问范围**：分类目录可读；会员库完整权限未确认，不能视为全部免费
- **采用时的边界**：适合局部模式，不足以证明跨页流程或动效；注意老截图的系统年代
- **实际读取范围**：读取 patterns 分类与移动图案索引；未操作受限页面
- **调研日期**：2026-10-27

<a id="src-saasframe"></a>
### src-saasframe · SaaSFrame

- **URL**：[https://www.saasframe.io/](https://www.saasframe.io/)
- **适用问题**：数据密度；账单与确认；表格、筛选、空态
- **平台**：Web / SaaS
- **类型**：saas_screen_pattern_index；原分类 `flows`
- **具体入口或例子**：公开索引 Dashboard / Table / Confirmation / Empty State / Billing 等功能分类
- **访问范围**：首页功能分类与产品索引可读；完整内容、下载与订阅权限未验证
- **采用时的边界**：适合相邻任务结构；iOS 需要重新安排触控目标、层级与单手路径
- **实际读取范围**：读取公开分类及产品列表，不声称完整流程已体验
- **调研日期**：2026-10-27

<a id="src-apple-awards"></a>
### src-apple-awards · Apple Design Awards 历年案例

- **URL**：[https://developer.apple.com/design/awards/2023/](https://developer.apple.com/design/awards/2023/)
- **适用问题**：主题与交互关系；不同类型产品；官方原作者访谈入口
- **平台**：iOS / iPadOS / watchOS / macOS
- **类型**：official_product_case_index；原分类 `flows`
- **具体入口或例子**：2023 页 Flighty / Universe / Any Distance / Headspace / Railbound 及 Behind the Design 链接
- **访问范围**：公开案例正文可读；部分有截图、视频和 App Store 入口；奖项页不是完整使用流程
- **采用时的边界**：用于找到设计取舍与原作者；奖项不能代替当前产品任务判断，旧案例标明年代
- **实际读取范围**：读取 2023 年具体获奖条目及多个关联原作者访谈
- **调研日期**：2026-10-27

<a id="src-pageflows"></a>
### src-pageflows · Page Flows

- **URL**：[https://pageflows.com/](https://pageflows.com/)
- **适用问题**：完整任务链；状态及流程顺序
- **平台**：iOS / Android / Web
- **类型**：recorded_user_flow_index_conditional；原分类 `flows`
- **具体入口或例子**：https://pageflows.com/post/ios/onboarding/airbnb/b382a4e7-9a16-472f-bfd0-7812843f0fae/
- **访问范围**：本次首页和具体流程均返回 403；搜索索引可见注册解锁提示；需正常浏览器/账户后再核实
- **采用时的边界**：仅登记候选来源；不得声称已读 Airbnb 流程或绕过登录/订阅
- **实际读取范围**：实际请求首页和具体条目均失败；具体 URL 与门槛来自搜索索引，未读取录屏
- **调研日期**：2026-10-27

<a id="src-refero"></a>
### src-refero · Refero

- **URL**：[https://refero.design/](https://refero.design/)
- **适用问题**：跨屏参考发现；网页与移动结构比较
- **平台**：Web / iOS
- **类型**：real_product_screen_flow_index_conditional；原分类 `flows`
- **具体入口或例子**：https://refero.design/mcp（能力说明入口）
- **访问范围**：本次首页和 MCP 页面解析为空；搜索能发现页面；是否需账户及具体权限待正常浏览器确认
- **采用时的边界**：条件可用索引，不作为已观看流程证据；按任务提取而非整页复制
- **实际读取范围**：实际打开首页和 MCP URL，正文未取得
- **调研日期**：2026-10-27

<a id="src-appshots"></a>
### src-appshots · Appshots

- **URL**：[https://appshots.design/](https://appshots.design/)
- **适用问题**：移动任务流程发现；后续有账户时检索
- **平台**：Mobile / Web
- **类型**：mobile_flow_index_conditional；原分类 `flows`
- **具体入口或例子**：https://appshots.design/
- **访问范围**：实际打开仅得到空正文；库内容、登录与订阅边界未能独立确认
- **采用时的边界**：仅候选；不得从其他网站的介绍推断这里当前具有哪些流程
- **实际读取范围**：实际打开域名，无法解析具体条目
- **调研日期**：2026-10-27

