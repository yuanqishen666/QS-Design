---
name: qs-alipay-miniapp-design
description: 为支付宝小程序设计或实现页面、流程、组件、Canvas/Lottie 动画和可操作原型。用户点名支付宝小程序、AXML/ACSS、my.createAnimation、支付宝生活服务或端内支付体验时使用。不用于微信小程序、普通 H5 或原生 App。
metadata:
  version: "1.0.0"
  author: "QS"
---

# QS Alipay Mini Program Design

以支付宝基础库、组件与端内业务能力为边界。高级视觉必须有能力检测、组件级限制和真机降级，不把 Web 动画直接当成小程序实现。

## 制作

1. 明确基础库、Native/非 Native 渲染路径、目标客户端版本、端内服务、支付与授权范围。
2. 按支付宝导航、标题栏、页面容器、返回、生活服务和支付结果组织任务。
3. 普通过渡用组件/CSS/`my.createAnimation`；拖动缩放优先验证 `movable-view`；共享元素、Lottie、Canvas 分别记录版本与限制。
4. 对不支持动画属性的组件使用受支持容器承载，不能假设所有组件都能被同样驱动。
5. 所有高级动效提供静态、普通过渡或按钮式替代，并在 iOS/Android 真机验证。

读 [支付宝小程序平台](references/alipay-platform.md)。具身交互只有通过 [机会扫描](../../core/references/embodied-opportunity-scan.md) 后才加载 `qs-interaction-lab`。
