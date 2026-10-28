# 外观与交互账本

账本记录有用户证据的选择，不把模型推断永久写成个人偏好。默认保存在项目的 `.qs-design/ledger.jsonl`，不提交、不同步。

## 记录三类指纹

```json
{
  "project": "product-id",
  "platform": "ios",
  "scope": "project",
  "decision": "selected direction B",
  "user_evidence": "用户原话或明确选择",
  "appearance": {
    "layout_topology": ["object-detail"],
    "density": "balanced-task",
    "type_roles": ["reading", "data"],
    "color_roles": ["brand", "status"],
    "image_strategy": "object-cutout",
    "surface": "flat-with-paper-residue"
  },
  "interaction": {
    "core_action": "redeem",
    "grammar": ["separation", "residue"],
    "reversibility": "until-threshold",
    "feedback": ["visual", "haptic"]
  },
  "sources": ["case-id", "specimen-id"]
}
```

## 作用域

- `global`：只有用户明确说这是长期个人偏好时使用。
- `project`：默认，适用于同一产品。
- `platform`：仅当用户明确要求某平台保持这一选择。
- `module`：只适用于一个功能模块。

比较历史选择时优先同项目、同平台、同任务类型；旧项目的视觉不能支配新产品。用户原话和模型推断分开，过时或被否定的条目保留更正记录而不是静默改写。

使用 `node scripts/ledger.mjs add --json '{...}'` 写入，`list` 查看。只有用户同意记忆或当前项目确需持续迭代时才记录。
