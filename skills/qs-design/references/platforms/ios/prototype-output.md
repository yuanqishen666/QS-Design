# 可操作原型与交付

设计探索默认使用隔离 HTML；批准前不修改已有产品工程，原生能力探针也放在隔离 sample 中。批准后的原生实现见 [SwiftUI](swiftui-delivery.md)。总览、截图与产品界面分开：总览解释方向并链接原型，手机视口展示产品。桌面可居中预览，移动端自然铺满与滚动，不整体缩小展板。

## 产物目录

独立 HTML 原型开始制作前，先按 [版本与会话隔离](run-isolation.md) 创建本次目录。全新设计不带父版本，并在同一 run 中交付三个完整方向；跨会话继续已选方向时显式指定一个已批准父版本。同一会话内的小调整继续写当前目录。不要把旧原型散放在项目根目录，也不要把真实 SwiftUI 业务代码放进版本目录。

~~~bash
node /path/to/qs-design/scripts/ios/design-run.mjs create --project . --feature feature-name
node /path/to/qs-design/scripts/ios/design-run.mjs finish --project . --feature feature-name --run RUN_ID --entry index.html --preview overview.jpg --directions directions.json
~~~

脚本返回实际目录与版本号。新设计的完成命令只有在 `directions.json` 声明功能事实源边界、三个方向便笺、三个不同原型入口和三个不同预览图时才会把版本标记为 `review_ready`；不会自动设为已批准版本。

`directions.json` 使用以下结构，四个方向字段必须在 A/B/C 中分别不同：

~~~json
{
  "schema": 1,
  "source_boundary": {
    "mode": "function-contract-only",
    "fact_sources": ["api/openapi.yaml", "src/services/vocabulary.ts"],
    "excluded_ui_sources": ["src/pages/wordbook/index.vue", "design/**"]
  },
  "directions": [
    {
      "id": "a",
      "title": "方向名",
      "concept": "产品解释",
      "structure": "信息架构",
      "interaction": "主要操控模型",
      "visual_material": "视觉材料",
      "entry": "a/prototype.html",
      "preview": "a/preview.png"
    }
  ]
}
~~~

示例只展示一个对象，实际必须正好三个。`mode` 只能为 `function-contract-only`；现有产品和外部参考不能作为新设计的视觉延续来源。已经由用户选定的方向通过父版本机制继续，不通过改变来源模式继续。

## 评审与批准

展示实际原型入口和封面后停止，不修改产品源码。用户明确批准一个版本后运行：

~~~bash
node /path/to/qs-design/scripts/ios/design-run.mjs approve --project . --feature feature-name --run RUN_ID --direction a --evidence "用户明确选择 A 的原话"
node /path/to/qs-design/scripts/ios/design-run.mjs require-approved --project . --feature feature-name --run RUN_ID
node /path/to/qs-design/scripts/ios/design-run.mjs start-implementation --project . --feature feature-name --run RUN_ID
~~~

批准记录包含用户选择的方向、该方向入口/预览和全部原型内容哈希。没有 `--direction` 的三方向版本不能批准。批准后任何原型文件发生变化时，`require-approved` 必须失败；更新后的原型需重新展示和批准。`selected.json` 只指向已批准版本，不能把 `review_ready` 当作批准。实现验证完成后用 `finish-implementation --evidence "相关测试与设计核对通过"` 标记为 `implemented`。

## 行为随制作完成

主要入口、选择、详情、保存、取消和返回产生正确结果，状态在页面上可见；提示消息只作辅助。用可信示例内容，明确模拟数据。声明状态的持续范围，不让“提醒已保存”暗示已注册系统通知。

三个方向逐一走通同一核心路径，并试取消和反向操作。逐张打开真实预览，检查图标/文字居中、基线、溢出、遮挡、触控范围、长文案和滚动；预览中能直接看见的问题必须先修复，不能因为 lint 无报错就进入待评审。

## 可选行为辅助

[prototype-core.js](../../../assets/prototype-core.js) 是无依赖 classic script，没有视觉模板。按需使用：

| 接口 | 用法 |
|---|---|
| createStore(initial) | getState / setState / update(fn) / subscribe(fn)。复制值保持隔离；subscribe 不立即调用，返回取消订阅函数。 |
| createDraft(initial, onCommit) | getValue / update / commit / cancel。一个会话只提交一次；重新打开创建新会话。 |
| createNavigator(initial, render, env?) | go / back / reset / getRoute。render 返回目标焦点元素；保存来源焦点和窗口滚动。局部滚动容器由项目处理。 |
| bindDrag(element, options) | axis、threshold、onStart/onMove/onEnd/onCancel；返回解绑函数。绑定实际拖动区域，按方向设置 touch-action，提供替代操作。 |
| createMotion(initial, onUpdate, env?) | to(target, duration)、cancel、getValue。从当前值接管，尊重减少动态偏好；不是物理 spring 引擎。 |

简单页面只用必要部分，已有框架用现有工具。业务状态独立于瞬时拖动与草稿，动画不持有业务事实。

## 单文件打包

源文件引用本地 classic script、stylesheet 与媒体；打包后交付文件内联依赖，可以直接打开。

~~~bash
node skills/qs-design/scripts/ios/package-prototype.mjs source.html output.html
~~~

支持相对路径的 classic JS、CSS（含本地 url 资源）、img/source/audio/video 的 src/poster 及 SVG image 引用。导航链接保留。CSS @import、srcset、ES modules、网络依赖不在支持范围内，先使用项目构建工具处理。脚本内部动态加载、style 属性内 URL、iframe 等仍由作者自行避免或处理；它不是通用网页归档器。

输出源代码与自包含 HTML。三个方向分别打包，通过总览的普通链接连接；每个成品页面都可独立运行，不能让 B/C 依赖 A 的 DOM 或主题样式。

## 展示与入口

封面来自实际页面，点击进入对应成品。打开体验入口，说明值得尝试的动作与各方向一句差别。GitHub 源码页面不是运行预览；本地打开 HTML 或提供实际启动的服务地址。没有托管就给自包含文件，不伪造公开 URL。

安全区域、焦点、触控范围与减少动态在制作时处理。HTML 不承诺原生触觉、系统通知、真实导航或原生系统返回。完整例子见 [Tidefold](examples/tidefold.md)。
