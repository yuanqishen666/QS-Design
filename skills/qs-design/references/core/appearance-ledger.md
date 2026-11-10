# 决策与反馈账本（v3）

本文件名为旧版兼容入口。当前账本记录用户有证据的决定和反馈，不把项目当默认作用域，也不把模型推断写成偏好。

## 默认规则

- 反馈默认 `candidate`；
- 当前任务持续约束使用 `task`；
- `project` 只在用户明确要求产品持续一致时使用；
- `profile` 必须得到明确同意；
- rejected 候选不能产生长期审美偏好；
- 更正以新记录追加，不静默改写历史。

```json
{
  "task_id": "task-8f21",
  "candidate_id": "candidate-b",
  "verbatim": "卡片太多，所有内容都一样重",
  "target_aspect": "hierarchy-and-containers",
  "polarity": "reject",
  "scope": "candidate",
  "carry_forward": false,
  "explicit_consent": false
}
```

“太 AI”“太普通”不能自动转成禁止渐变、圆角或玻璃。它只说明当前候选没有达到业务特异性或视觉工艺预期。
