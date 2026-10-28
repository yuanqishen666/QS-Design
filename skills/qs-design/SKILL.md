---
name: qs-design
description: 为数字产品设计跨平台页面、流程和可操作原型，并把同一产品正确翻译到 iOS、Android、Web、微信小程序或支付宝小程序。用户未指定平台、要求多端统一设计、需要选择交付平台或比较各端实现时使用。平台已经明确且只涉及单端时，优先使用对应的 qs 平台 design skill。
metadata:
  version: "1.0.0"
  author: "QS"
---

# QS Design

从用户任务、内容关系与平台能力形成原创界面。共享产品语义、状态与品牌角色；导航、控件、手势、系统反馈、可访问性和性能预算由平台适配器决定。

## 路由

1. 明确交付平台时，使用对应 skill：`qs-ios-design`、`qs-android-design`、`qs-web-design`、`qs-wechat-miniapp-design`、`qs-alipay-miniapp-design`。
2. 多端任务先形成共享的任务模型、内容模型、状态图和品牌 token，再分别交给各平台适配器；不要先画一套界面再等比复制。
3. 未明确平台时，先判断平台选择是否会改变核心流程、系统能力或交付格式。会改变结果且无法推断时只问这个必要问题；否则先做平台中立的任务与交互模型。
4. 连续操控、材质变化、强品牌动作或生活化交互需要独立验证时，读取并使用 `qs-interaction-lab`。
5. 用户只要求审查已有界面时使用 `qs-design-audit`，不要借审查之名重做产品。

## 共享内核

开始设计前按当前问题只读取需要的资料：

- 形成方向时读 [方向策略](../../core/references/direction-strategy.md) 与 [视觉基因](../../core/references/visual-genome.md)。
- 设计行为时读 [交互基因](../../core/references/interaction-genome.md)。
- 查找生活化动作机会时读 [具身交互机会扫描](../../core/references/embodied-opportunity-scan.md)。
- 使用外部案例、奖项或素材时读 [证据规则](../../core/references/evidence-policy.md) 与 [原创性规则](../../core/references/originality-policy.md)。

## 交付原则

- 信息充分时直接制作；方向数量随任务成熟度调整，不固定三套。
- 每个方向改变产品解释、内容组织、操控方式或动态论点中的至少两项，只换色不算新方向。
- 原型表现真实状态：进入、返回、编辑、保存、取消、异常、打断和减弱动态按任务需要可操作。
- 只采用与业务因果强相关、经验证且平台可实现的标志性交互；不把用户举过的物品或动作变成全局模板。
- 成品通过对应平台 skill 的检查，并用 `qs-design-audit` 的验证脚本做发布前回归。
