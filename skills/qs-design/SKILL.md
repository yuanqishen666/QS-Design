---
name: qs-design
description: 统一设计数字产品页面、流程、可操作原型和交互动效，并在内部自动路由到 iOS、Android、Web、微信小程序或支付宝小程序适配器。用户要求页面设计、跨端设计、原型、平台实现、生活化交互或现有界面审计时使用；不用于纯后端、纯性能或与界面无关的任务。
metadata:
  version: "2.0.0"
  author: "QS"
---

# QS Design

这是唯一的用户入口。不要要求用户改用其他 `qs-*` skill，也不要把内部适配器当成独立安装项。从任务、内容关系与平台能力形成原创界面：共享产品语义、状态和品牌角色；导航、控件、手势、系统反馈、可访问性与性能预算按目标平台翻译。

## 先路由，再加载

每次任务只读取当前路线需要的文件：

1. 先判定模式：默认是设计；用户只要求检查现有界面时读取 [审计模式](references/modes/audit.md)；用户要求发现或验证标志性交互时读取 [交互实验模式](references/modes/interaction-lab.md)。
2. 再判定平台，只加载对应适配器：
   - iPhone、iPad、SwiftUI 或 UIKit：[iOS / iPadOS](references/platforms/ios/adapter.md)
   - Android、Compose、手机/平板/折叠屏：[Android](references/platforms/android/adapter.md)
   - 网站、Web App、桌面浏览器或移动 Web：[Web](references/platforms/web/adapter.md)
   - 微信小程序、WXML/WXSS、Skyline/Worklet：[微信小程序](references/platforms/wechat-miniapp/adapter.md)
   - 支付宝小程序、AXML/ACSS：[支付宝小程序](references/platforms/alipay-miniapp/adapter.md)
3. 多端任务先形成一份共享任务模型、内容模型、状态图与品牌 token，再逐端读取适配器并分别实现；不要先画一端再等比复制。
4. 未明确平台时，判断平台是否会改变核心流程、系统能力或交付格式。只有无法合理推断且会实质改变结果时，才问一个必要问题；否则先完成平台中立模型。

## 原型确认门禁

新设计、视觉改版、页面重构、内容层级调整或自定义动效分为两个阶段：

1. **设计阶段**：读取产品事实，在隔离目录制作静态画面、可操作原型或交互动效探针；可以编写原型代码，不得修改产品源码。
2. **实现阶段**：向用户展示可审查原型并停止；只有用户明确批准一个未被改动的版本后，才按该版本修改产品源码。

审计只报告；实现已有批准版本前先验证批准记录。纯后端、构建或不改变外部界面的任务不应触发本 skill。用户要求“直接改”不能越过本门禁；已经批准的原型可以直接进入实现阶段。

## 共享内核

开始设计前按当前问题只读取需要的资料：

- 形成方向时读 [方向策略](references/core/direction-strategy.md) 与 [视觉基因](references/core/visual-genome.md)。
- 页面含用户可见文字时读 [内容设计](references/core/content-design.md)，新增文案必须有来源和功能，同一事实只有一个主要表达位置。
- 设计行为时读 [交互基因](references/core/interaction-genome.md)。
- 查找生活化动作机会时读 [具身交互机会扫描](references/core/embodied-opportunity-scan.md)。
- 使用外部案例、奖项或素材时读 [证据规则](references/core/evidence-policy.md) 与 [原创性规则](references/core/originality-policy.md)。
- 需要跨轮次保留明确选择时读 [外观与交互账本](references/core/appearance-ledger.md)，不得把推断写成永久偏好。

## 交付原则

- 信息充分时直接制作隔离原型；方向数量随任务成熟度调整，不固定三套。
- 每个方向改变产品解释、内容组织、操控方式或动态论点中的至少两项，只换色不算新方向。
- 原型表现真实状态：进入、返回、编辑、保存、取消、异常、打断和减弱动态按任务需要可操作。
- 普通反馈使用平台熟悉行为；表达性动效可以服务响应感、连续性、感知品质、品牌性格或适度愉悦。复杂、标志性或高成本动效通过交互实验验证，不把用户举过的物品或动作变成全局模板。
- 原型标记为待评审不等于用户批准；批准后的原型如有变化，必须重新展示并确认。
- 成品按目标平台适配器检查。用户要求审计或上线前回归时，运行本 skill `scripts/` 中适用的验证脚本并浏览实际页面。
- 本 skill 的 `references/`、`scripts/` 和 `assets/` 均随 `qs-design` 一次安装；所有相对路径以本文件所在目录为根。
