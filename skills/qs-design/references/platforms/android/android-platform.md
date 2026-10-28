# Android 平台适配

## 必须确认

- 目标设备：手机、平板、折叠屏、桌面窗口或多端组合。
- 技术：Jetpack Compose、Views、混合工程或仅原型。
- 导航：顶层目的地、层级返回、系统返回、预测返回的预览与提交。
- 窗口：compact / medium / expanded 下信息关系如何变化，而不是简单放大。

## 行为与动态

- 直接操控使用 `Animatable`、spring、decay 或平台等价能力，保留输入速度并允许新输入接管。
- 共享元素和容器变换维护对象连续性，但不能掩盖返回路径。
- AGSL/RuntimeShader 是增强层；先检查 Android 版本、渲染路径与耗电，准备 Canvas/静态退化。
- 触感绑定越过阈值、完成或错误等因果节点；高频普通点击不反复震动。

## 发布前检查

- 48dp 目标、字体缩放、TalkBack 顺序与状态描述。
- 深色主题、动态色与品牌色的冲突。
- 系统栏、手势导航区、IME、旋转与窗口重排。
- 返回不会丢失未保存编辑，预测返回与自定义拖动不争抢。
- 中低端真机或等价性能档验证，不以桌面浏览器帧率代替。

主要依据以 Android Developers 当前文档为准：Compose Animation、Window Size Classes、Predictive Back、Accessibility 与 AGSL。
