# Android 平台适配器

以真实 Android 行为支撑原创视觉，而不是把 iOS 页面换成 Material 控件。保留业务语义，重新决定窗口布局、导航、返回、输入、状态与动态。

## 制作

1. 确定手机、平板、折叠屏或多窗口范围，以及系统版本、Compose/View 交付方式和已有设计系统；读取共享的 [内容设计](../../core/content-design.md)。
2. 从任务形成主题与模块；需要探索时按 [方向策略](../../core/direction-strategy.md) 产生差异真实的方向。
3. 把导航、系统返回和预测返回、窗口尺寸类、系统栏、键盘、权限与分享纳入流程。
4. 连续手势优先使用可打断且速度连续的 spring/decay；高级 Shader 必须有普通 Canvas 或静态降级。
5. 实际验证字体缩放、TalkBack、深色主题、48dp 触控目标、横竖屏/窗口变化和低端设备。

平台细节见 [Android 适配](android-platform.md)。生活化交互读 [具身交互机会扫描](../../core/embodied-opportunity-scan.md)，仅在评分通过后进入 [交互实验模式](../../modes/interaction-lab.md)。

设计阶段交付隔离的可运行 Compose sample 或可操作 HTML 原型，不修改现有 Android 产品工程，并明确原型近似与原生实现的差别。用户批准后验证版本，再进入现有工程实现和真机复验。
