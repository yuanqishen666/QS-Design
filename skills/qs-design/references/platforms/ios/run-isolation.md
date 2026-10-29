# 版本与会话隔离

独立原型会反复生成，也会被用户跨会话继续打磨。旧产物应当可追溯，但不能悄悄影响一次新设计。

## 先判断本次关系

| 用户意图 | 处理方式 |
|---|---|
| 普通新需求、重新设计、再做一个 | 新建版本，不读取任何旧版本 |
| 继续、修改上次、基于某版、点名路径 | 只读取一份明确的父版本 |
| 比较 A/B、融合两版 | 只读取用户点名的版本 |

“同一个功能”不等于“继续上一版”。没有延续信号时始终按新设计处理，也不自动使用最新版本。

## 产品上下文与生成物分开

理解产品时可以读取真实业务代码、品牌资源、用户给出的资料和项目内人工维护的产品文档。默认排除：

~~~text
design/qs-design/**
~~~

这里保存的是生成结果，不是产品事实。不要从旧版本继承页面结构、颜色、文案、方向说明或未被用户再次确认的假设。

## 每个功能拥有独立版本

独立 HTML 原型放在：

~~~text
design/qs-design/<feature>/
├── selected.json
└── runs/
    └── <run-id>/
        ├── run.json
        ├── prototype.html
        └── preview.jpg
~~~

`feature` 是稳定、简短的功能名。`run-id` 由 UTC 时间与随机尾码组成。`run.json` 记录版本关系、状态、入口和明确批准证据，不存设计提示词。`selected.json` 只指向用户已经批准的版本；只有在用户表达延续意图后才能读取，不能用它替代意图判断。

开始一个全新版本：

~~~bash
node /path/to/qs-design/scripts/ios/design-run.mjs create --project . --feature vocabulary
~~~

跨会话继续某个版本时显式指定父版本：

~~~bash
node /path/to/qs-design/scripts/ios/design-run.mjs create --project . --feature vocabulary --parent 20261027T010203Z-a1b2
~~~

成品写入返回的目录后再完成版本：

~~~bash
node /path/to/qs-design/scripts/ios/design-run.mjs finish --project . --feature vocabulary --run 20261027T010203Z-a1b2 --entry prototype.html --preview preview.jpg
~~~

`finish` 只把版本标记为 `review_ready`。展示原型并得到明确批准后再执行：

~~~bash
node /path/to/qs-design/scripts/ios/design-run.mjs approve --project . --feature vocabulary --run 20261027T010203Z-a1b2 --evidence "用户确认 A 版进入实现"
node /path/to/qs-design/scripts/ios/design-run.mjs require-approved --project . --feature vocabulary --run 20261027T010203Z-a1b2
node /path/to/qs-design/scripts/ios/design-run.mjs start-implementation --project . --feature vocabulary --run 20261027T010203Z-a1b2
~~~

批准会记录原型哈希并更新 `selected.json`。开始改产品代码时使用 `start-implementation`；验证完成后使用 `finish-implementation --evidence "验证证据"`，状态依次进入 `implementing` 和 `implemented`，但始终保留同一份确认哈希。批准后修改任何原型文件都会使批准失效，必须重新评审。旧版 `ready` 清单按未批准处理，不自动迁移为批准。

同一会话内正在进行的小调整直接修改当前目录，不为每次移动间距都创建新版本。跨会话继续、用户要求保留当前方案再试，或设计主张发生明显变化时创建子版本。父版本保持不变。

## 只在必要时提问

用户明确说继续，并且给了路径、版本号，或只有一个明确的已批准版本时直接制作子版本。若确实存在多个可能父版本且无法判断，只问要继续哪一版。普通新需求即使目录里已有同名功能，也不提问。

不要自动删除旧版本。需要清理时让用户明确指定范围。版本目录适合独立原型；真正修改 SwiftUI 工程时沿用项目文件与 Git 历史。只有并行修改真实代码或需要隔离依赖时才考虑 worktree。

这些目录与清单是制作机制，不是面向用户的交付说明。默认只展示可体验原型、封面和用户需要知道的差异。
