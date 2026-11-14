# 稳定变更与全产品传播

## 稳定元素身份

选定或已展示候选中的重要页面、模块、主操作、状态和交互对象分配稳定 `qs-*` 身份。Web 使用 `data-qs-id` 与可选 `data-qs-role`；原生平台映射到可访问性或测试 identifier，但不能把测试标识当作用户可见文案。

Element Registry 记录稳定 ID、语义角色、父级，以及 copy、layout、visual、behavior、visibility、children、data-binding 和 accessibility 中需要保护的 facet。

## Mutation Scope

每次局部调整声明：

- 哪些元素的哪些 facet 可以变化；
- 哪些父级可以新增元素；
- 哪些元素可以删除；
- 哪些 facet 已锁定；
- 用户原始依据；
- 冲突时 `report-and-stop` 或 `report-and-request`。

最终产物用 before/after registry 对比。未授权删除、在错误父级新增、修改未授权 facet、改变稳定语义角色或触碰锁定 facet 都是 blocker，不能静默“顺手优化”。

## Propagation Map

代表流程获得用户选择后，先建立传播图再扩展全产品：

- 全局业务决定及其传播规则；
- 每个页面特有的决定；
- 必须保留的行为；
- 所有已知 route 和 state 的覆盖、延期或不适用证据；
- 有限例外。

传播的是业务层级、角色和交互语法，不是把首页的卡片、颜色、插画或构图复制到所有页面。多个 route 却没有 page-specific decisions 时，必须检查是否正在形成新的 QS house style。
