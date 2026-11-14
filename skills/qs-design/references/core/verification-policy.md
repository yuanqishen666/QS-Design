# 验证政策

验证覆盖上下文隔离、业务结果、连续性、业务特异性、视觉工艺、内容、交互、无障碍、平台能力、实现一致性和维护性。

正式候选还必须提供 Product Truth、Attention、Terminology 和 Prototype 合同。合同结构合法只说明声明可解析；五秒、模糊/眯眼、灰度、焦点、文字缩放、label-only comprehension 和原型路径仍需要最终渲染、运行或人工证据。缺失合同是 `finding`，缺失运行证据是 `unknown`。

迭代修改提供 Mutation Scope 时，验证 before/after Element Registry。未授权 facet、删除、新增、身份或父级变化是 blocker。全产品 Prototype Contract 必须同时提供 Propagation Map，并覆盖 Product Truth 中的所有已知 route；覆盖、延期和不适用都需要证据或理由。

正式设计同时验证 Presentation Record。`rendered` 或 `inspected` 不能替代 `presented`：每个方向的 preview 必须出现在最终回复中，可点击或原生产物还必须有可打开入口。Presentation Record 缺失、仍为 `planned`、preview 未出现在最终渲染产物集合中，或把文字/ASCII 当作 preview，均为 `prototype-implementation` blocker。纯审计可以明确记录 `not-applicable`。

## 内容显隐证据

内容质量不能由字数、可见文本面积或“极简感”判定。分别记录：

- **解释依赖**：临时隐藏 supporting / optional 内容后，核心对象、主操作、数据关系、结果与恢复是否仍可理解；
- **关键事实可见性**：金额、权限、风险、约束、格式和不可逆后果是否在决策点无需披露操作即可获得；
- **披露输入等价性**：隐藏内容是否可由键盘、指针、触控和辅助技术获得，并可关闭、保持或返回触发器；
- **误删风险**：为了减少文字是否删除了无法由布局、图标、颜色或动效可靠表达的业务语义。

静态 lint 可以证明重复、内容契约冲突和部分语义关系；它不能证明用户理解或 tooltip 运行行为。后两者没有任务轨迹、可访问树或人工检查时报告 `unknown`。

内容合同只证明声明结构可解析，不能证明最终界面的可见文案必要、已绑定或有来源。正式候选必须提供最终渲染 DOM/产物给内容 lint；只有合同而没有最终产物时，`content-quality` 报告 `unknown`，不得报告 `clean`。抽象业务模型里的 `content_graph` 不能冒充候选样张的逐字内容合同。

## 结果

- `finding`：有证据的问题；
- `clean`：当前检查没有发现报告项，不等于整体优秀；
- `unknown`：当前环境或证据不足；
- `not-applicable`：有明确理由不适用。

严重度为 blocker、major 或 advisory。不输出总分。

## 证据

静态检查使用语法树/结构化数据；运行检查读取真实 DOM、可访问树、计算布局、模拟器或开发者工具。截图只能证明静态画面，代码存在不能证明运行成功。`clean`、`finding` 和 `not-applicable` 都必须有证据；外部命令中预先写入的状态不算执行证据，只有执行器直接观察或本次命令实际创建/改变的 assertion report 才可认证。不可验证时必须报告 unknown。

## 例外

例外只能附着在仍为 `finding` 的报告项，需要有限作用域、原因、负责人、证据、期限或真实复查触发器。禁止永久、全局或附着在 `clean`/`unknown` 上的审美 ignore。
