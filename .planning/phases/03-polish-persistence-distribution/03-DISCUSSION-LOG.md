# Phase 3: Polish, Persistence & Distribution - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-05
**Phase:** 3-Polish, Persistence & Distribution
**Areas discussed:** 会话恢复深度, 粒子效果风格, PWA / 分发深度

---

## 会话恢复深度

| Option | Description | Selected |
|--------|-------------|----------|
| 完整恢复 | 恢复棋盘状态、托盘、撤销栈、连击、分数、辅助次数、计时 | |
| 仅关卡+进度 | 只记当前关卡，重进从头开始（分数/辅助次数重置） | ✓ |
| 关卡+分数 | 记关卡号和累计分数，重进从头但保留得分 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 关卡进度 + 音频设置 | 存储 currentLevel + AudioManager 音量/静音 | ✓ |
| 仅关卡进度 | 只存 currentLevel | |
| 关卡 + 音频 + 辅助偏好 | 加自定义辅助次数偏好 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 回到首页显示当前关 | 启动始终首页，关卡按钮显示持久化 currentLevel | ✓ |
| 自动恢复到游戏中 | 重开自动进入上次关卡 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 需要重置进度按钮 | 设置页加按钮 + 确认弹窗 | ✓ |
| 不需要 | 不提供重置功能 | |

---

## 粒子效果风格

| Option | Description | Selected |
|--------|-------------|----------|
| 匹配爆发 | 从两牌位置向四周爆出小方块/圆点（10-20个） | ✓ |
| 柔和星光 | 小星光闪烁（5-8个光点） | |
| 两者结合 | 默认柔和，高 combo 升级为爆发 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 仅匹配消除 | 只在配对成功时触发粒子 | ✓ |
| 匹配 + 通关 | 通关时加烟花 | |
| 匹配 + 通关 + 连击 | 连击分层粒子强度 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 中密度 15-20 个 | 有爽感不卡，低端降为 8-10 | ✓ |
| 高密度 30-40 个 | 华丽但低端可能卡顿 | |
| 低密度 6-10 个 | 克制轻量 | |

---

## PWA / 分发深度

| Option | Description | Selected |
|--------|-------------|----------|
| 基本 PWA | manifest + SW 缓存静态资源 + 关卡 JSON | ✓ |
| 仅 manifest | 无离线缓存 | |
| 完整离线 | SW 预缓存全部内容 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 仅 PWA | 添加到主屏幕即够 | ✓ |
| PWA + Capacitor | 原生 APK/IPA 构建 | |

---

## Agent Discretion

- 性能自动检测机制（devicePixelRatio 阈值或帧率采样）
- 粒子形状/颜色/动画曲线
- Service Worker 缓存策略细节
- PWA 图标生成方案
