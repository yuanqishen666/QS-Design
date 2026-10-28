# 交互探针契约

```yaml
core_action: 核心业务动作
semantic_model: 转移、分离、旋转、填充等
purpose: 理解、操控、连续性、反馈或愉悦
input: pointer、touch、keyboard、sensor 等
continuous_mapping: 输入如何连续映射到视觉与状态
constraints: 范围、方向、容量、碰撞或摩擦
thresholds: 预览、可提交、危险、不可逆
commit: 完成条件与结果
cancel: 取消条件与恢复
residue: 完成后留下的可理解痕迹
interruption: 失焦、返回、来电、中途松手和新输入
settling: 弹簧、衰减、回弹或静止
haptic_audio: 仅列因果节点
reduced_motion: 等价的弱动态路径
alternate_input: 键盘、按钮、读屏动作
platform_fallback: 能力不足时的退化
```

## 通过条件

- 不读说明也能发现核心操作，隐喻不是唯一入口。
- 输入与反馈之间连续且因果一致；新输入能接管当前运动。
- 达到阈值前可取消，达到不可逆点时有清楚说明。
- 连续重复 20 次仍不会妨碍高频任务。
- 减弱动态与替代输入完成同一业务结果。
- 目标平台有实现路径、性能预算和低能力降级。
