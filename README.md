<p align="center">
  <a href="https://htmlpreview.github.io/?https://github.com/yuanqishen666/QS-Design/blob/main/ios-design/showcase/index.html"><img src="./ios-design/showcase/tidefold-showcase.jpg" alt="Tidefold iOS 设计展示" width="100%" /></a>
</p>

<h1 align="center">QS Design</h1>

<p align="center">为 iOS、Android、Web、微信小程序和支付宝小程序设计漂亮、细腻、可以真实操作的页面。</p>

## 看看效果

点击上面的设计稿，或者直接[打开 Tidefold 原型](https://htmlpreview.github.io/?https://github.com/yuanqishen666/QS-Design/blob/main/ios-design/showcase/index.html)。里面有三套完整方向，每一套都可以实际操作。

还可以查看[设计样张库](https://htmlpreview.github.io/?https://github.com/yuanqishen666/QS-Design/blob/main/specimens/index.html)和[行为实验室](https://htmlpreview.github.io/?https://github.com/yuanqishen666/QS-Design/blob/main/specimens/behavior-lab/index.html)。样张按布局、内容压力、视觉材料、交互行为、跨平台翻译和降级方式组织，不是固定风格菜单。

## 它能做什么

- 先理解产品功能和使用场景，再确定页面的视觉主题。
- 用共享设计内核保持产品语义，再按 iOS、Android、Web、微信和支付宝的真实能力分别实现。
- 为首页、搜索、详情、编辑等功能选择合适的布局和交互。
- 在保留原有功能的基础上重新整理信息和页面结构。
- 需要探索时才制作多个方向，每个方向都会有完整功能和自己的视觉特点。
- 把转场、拖动、展开、保存和返回做成连贯的操作过程。
- 从业务中的容量、阻力、转移、分离、旋转等关系发现有意义的动态，不套固定生活物品动画。
- 交付可以点击的原型，主要按钮、卡片和页面入口都能实际使用。
- 检查键盘、读屏、减弱动态、异常、性能、素材来源和平台降级。

## 安装和使用

需要 Node.js 22.20 或更高版本。选择自己使用的工具，执行一条命令即可。

### Codex

```bash
npx skills add yuanqishen666/QS-Design --skill '*' -g -a codex -y
```

### Cursor

```bash
npx skills add yuanqishen666/QS-Design --skill '*' -g -a cursor -y
```

### Claude Code

```bash
npx skills add yuanqishen666/QS-Design --skill '*' -g -a claude-code -y
```

安装完成后，重新打开工具或开始一个新会话。然后直接描述想做的产品和页面：

```text
用 $qs-design 给我的记账产品设计 iOS、Android 和 Web 三端首页。
```

只做一个平台时也可以直接使用 `$qs-ios-design`、`$qs-android-design`、`$qs-web-design`、`$qs-wechat-miniapp-design` 或 `$qs-alipay-miniapp-design`。也可以附上现有截图、产品说明或工程。信息够用时会直接开始设计，只有关键内容不明确时才会提问。
