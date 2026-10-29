# 微信小程序平台适配器

以微信小程序真实组件、基础库和渲染引擎为边界设计，不把浏览器演示当成可上线实现。

## 制作

1. 明确目标基础库、WebView/Skyline、分包、业务域名、微信能力与真机范围；读取共享的 [内容设计](../../core/content-design.md)。
2. 共享产品任务和品牌角色，但按小程序导航、胶囊区、页面栈、授权、分享与支付重做流程。
3. 普通页面优先可靠组件；高频跟手动画仅在 Skyline/Worklet 或经过验证的渲染层能力中实现。
4. 每个高级动作记录 `canIUse`/版本、iOS/Android 真机表现和 WebView/静态降级。
5. 不在手势每帧跨逻辑层 `setData`；避免让自定义手势阻断页面滚动和系统返回。

读 [微信小程序平台](wechat-platform.md)。需要具身交互时先通过 [机会扫描](../../core/embodied-opportunity-scan.md)，再进入 [交互实验模式](../../modes/interaction-lab.md)。

设计阶段只制作隔离原型，不修改真实 WXML/WXSS 产品工程。用户批准并验证版本后再实现；浏览器原型不能冒充 Skyline、Worklet 或真机能力。
