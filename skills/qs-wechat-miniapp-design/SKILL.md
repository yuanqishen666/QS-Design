---
name: qs-wechat-miniapp-design
description: 为微信小程序设计或实现页面、流程、组件、Skyline/Worklet 动画与可操作原型。用户点名微信小程序、Mini Program、Skyline、WXML/WXSS、Worklet 或微信端内体验时使用。不用于普通 H5、支付宝小程序或原生 App。
metadata:
  version: "1.0.0"
  author: "QS"
---

# QS WeChat Mini Program Design

以微信小程序真实组件、基础库和渲染引擎为边界设计，不把浏览器演示当成可上线实现。

## 制作

1. 明确目标基础库、WebView/Skyline、分包、业务域名、微信能力与真机范围。
2. 共享产品任务和品牌角色，但按小程序导航、胶囊区、页面栈、授权、分享与支付重做流程。
3. 普通页面优先可靠组件；高频跟手动画仅在 Skyline/Worklet 或经过验证的渲染层能力中实现。
4. 每个高级动作记录 `canIUse`/版本、iOS/Android 真机表现和 WebView/静态降级。
5. 不在手势每帧跨逻辑层 `setData`；避免让自定义手势阻断页面滚动和系统返回。

读 [微信小程序平台](references/wechat-platform.md)。需要具身交互时先通过 [机会扫描](../../core/references/embodied-opportunity-scan.md)，再使用 `qs-interaction-lab`。
