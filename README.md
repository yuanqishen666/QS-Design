<p align="center">
  <img src="./ios-design/showcase/tidefold-showcase.png" alt="QS iOS Design 制作的潮间 Tidefold iOS App 设计稿，包含同一设计方向的浅色、交互展开与深色状态" width="100%" />
</p>

<h1 align="center">QS Design</h1>

<p align="center">
  不是给每个 App 套同一身“高级模板”，而是先弄明白产品在做什么，再把它长成自己的样子。
</p>

现在仓库里先放了 `qs-ios-design`。以后如果继续做 Android、Web 或其他设计方向，它们会各自待在独立文件夹里，不会挤成一份什么都管、什么都不够细的说明书。

## 这个 skill 有什么不一样

很多 UI 生成看起来都挺整齐，但换个 Logo 也照样成立。`qs-ios-design` 更在意页面为什么要这样设计：

- 先找到产品的主题、核心动作和使用场景，再决定颜色、层级、材质与动效。
- 多方向会从产品主张开始分叉：视觉主角、任务节奏、主要交互、内容模型和运动性格会真正不同。三套相同功能换排版、圆角或主题色，只算一个方向的布局稿。
- 一张复杂页面会被拆成功能单元分别设计，不会整页照搬一个热门模板。
- 每个设计方向默认同时带 Light 与 Dark；它们是一套设计的两种环境，不拿深色模式凑方案数。
- 交互要有反馈，但不会让每次点击都演一遍。真正有记忆点的动效只留给核心流程。
- 画出来的交互线索必须真的能用：Sheet 的遮罩、下拉、关闭、保存和未保存状态会一起设计，不做只能看的假把手。
- 性能从草图阶段就算进去。能用排版、位移和透明度说清楚的事，不会先堆实时模糊、粒子和复杂 3D。
- 动画不会挡住下一次操作：状态成立后立刻可继续，手势可以中断或反向，Reduce Motion 也会保留信息而不是粗暴地把一切变成同样慢的淡出。
- 信息够了就直接做；只有会明显改变结果的问题才会问你。

它不会把其他设计 skill、模板包或提示词仓库当成素材库。需要研究时会回到 Apple 官方资料、真实上线产品、原作者代码或视频和真实用户反馈，再结合当前产品重新推导；参考的外壳、品牌假设和现成代码不会直接搬进结果。

这一版也把社区里反复出现的真实摩擦收进了设计判断：动画播完前不能继续操作、隐藏手势难发现、透明材质影响阅读、按钮位置变化破坏肌肉记忆，以及 SwiftUI 在真机里常见的列表身份、滚动位置和 shared element 卡顿。它们不会变成一份烦人的检查表，而会在生成页面前直接影响结构和取舍。

## 一张真实的设计稿

上面的「潮间 Tidefold」是用这套 skill 做的原创 iOS 概念：潮线是页面的主角，拖动它可以试算下一段适合下水的时间；松手后，当前海滩卡片从原位展开，后面的地点顺势补位。叠卡在这里不是装饰，它表达的就是“接下来去哪一处”。

整套界面只保留一处标志性交互，其余操作沿用熟悉的 iOS 习惯。浅色与深色使用同一套信息结构和几何语言，但分别处理了对比、材质和海面亮度，而不是简单反色。

## 安装

需要 Node.js 22.20 或更高版本。下面选自己正在使用的工具，执行一条命令即可；`-g` 表示安装后在所有项目中都能使用。

### Codex

```bash
npx skills add yuanqishen666/QS-Design --skill qs-ios-design -g -a codex -y
```

### Cursor

```bash
npx skills add yuanqishen666/QS-Design --skill qs-ios-design -g -a cursor -y
```

### Claude Code

```bash
npx skills add yuanqishen666/QS-Design --skill qs-ios-design -g -a claude-code -y
```

如果三款工具都在用，也可以一次装好：

```bash
npx skills add yuanqishen666/QS-Design --skill qs-ios-design -g -a codex cursor claude-code -y
```

Skills CLI 还支持 GitHub Copilot、Gemini CLI、Cline 和 OpenCode；把最后的 agent 名称换成 `github-copilot`、`gemini-cli`、`cline` 或 `opencode` 即可。

这些命令会按照 [Codex](https://developers.openai.com/cookbook/examples/agents_api/apps/sev_bot/readme)、[Cursor](https://cursor.com/docs/skills) 和 [Claude Code](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) 的 Skill 目录规范完成安装。装好后重新打开工具或开始一个新会话，就可以直接使用。

## 怎么用

装好后，可以直接说：

```text
用 $qs-ios-design 给我的 iPhone 记账 App 设计一个能单手快速记录的首页。
```

也可以把现有截图、产品说明或 SwiftUI 工程一起交给它。信息明确时它会直接开始；如果产品方向还差一个关键答案，它只会问真正影响设计的那一两件事。

## 目前包含

```text
ios-design/
├── SKILL.md
├── agents/
├── references/
└── showcase/
```

`SKILL.md` 负责判断和工作方式，`references` 里放主题提炼、功能拆分、视觉、交互、临时界面、来源独立性、性能、SwiftUI 交付等细节。平时只读取当前任务需要的部分，不会一次把所有内容都塞进上下文。

如果你拿它做出了有意思的 App，欢迎开个 Issue 晒图。真实项目里的好例子和坏例子，都比再加十条抽象规则更有用。
