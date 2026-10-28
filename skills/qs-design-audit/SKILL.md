---
name: qs-design-audit
description: 审查现有 iOS、Android、Web、微信小程序或支付宝小程序的界面与交互，给出有证据的结构、行为、可访问性、性能、平台和来源问题。用户要求评审、审计、检查、lint、回归或上线前验证时使用。不在未获要求时重做视觉方向。
metadata:
  version: "1.0.0"
  author: "QS"
---

# QS Design Audit

审计现有实现，不把个人偏好当缺陷。每项结论标记为 `finding`、`clean` 或 `not-applicable`，并给出文件/页面/状态证据、影响、修复方向与验证方法。

## 审计层级

1. 结构：资源、控制台、死入口、语义、状态和导航。
2. 行为：状态可达、提交/取消、返回、撤销、打断、重复触发和异常恢复。
3. 可访问性：对比度、触控目标、焦点、键盘、读屏、文本缩放与减弱动态。
4. 性能：长任务、布局抖动、昂贵动画、图片/字体、Canvas/GPU 热区。
5. 视觉：目标尺寸、主题、语言、长内容与截图差异。
6. 平台：使用对应 adapter 的真实组件、版本、系统行为和降级检查。
7. 来源：外部资产、许可、品牌出处和可分发边界。

先读 [审计规则](references/audit-protocol.md)，再运行适用脚本：

```bash
node scripts/validate-repo.mjs
node scripts/design-lint.mjs path/to/html-or-directory
node scripts/provenance-check.mjs path/to/assets
node scripts/source-check.mjs
```

脚本报告是证据，不是全部结论。浏览实际页面并走通核心路径后再排序问题；按影响与可复现性排序，不按风格偏好排序。
