# Vita Mahjong

## What This Is

Vita Mahjong 是经典 Mahjong Solitaire（麻将连连看 / 麻将消除）的现代移动端复刻版本。面向全年龄段玩家，特别强调老年人、初学者与休闲玩家的友好体验：大牌面、直观触控、清晰视觉、流畅动画，并支持关闭计时/分数压力。项目复刻「首页 → 游戏页 → 结果页」的核心流程，至少支持 20 关，还原东方古典美术风格、选牌/匹配/消除动效与结算体系。

## Core Value

让玩家在手机上获得放松、直观、无压力的麻将消除体验——即使视力或反应速度下降的用户，也能一眼看清牌面、一键完成操作，并在即时反馈中感受到连击爽感。

## Requirements

### Validated

（None yet — ship to validate）

### Active

- [ ] 实现移动端竖屏 20:9 的首页 → 游戏页 → 结果页核心流程
- [ ] 至少 20 个可玩关卡，第 20 关最多 128 张牌、7 层堆叠
- [ ] 大牌面、高对比度、清晰字体，适配视力较弱用户
- [ ] 直观的单指触控：选牌、匹配、消除、撤销/提示
- [ ] 东方古典美术风格的牌面与背景视觉
- [ ] 选牌/匹配/消除的流畅动画与粒子反馈
- [ ] 可关闭的计时与分数压力模式
- [ ] 每关初始布局保证可解性（至少一条清空路径，每种牌数量为偶数）
- [ ] 本地运行所有逻辑与数据，无后端
- [ ] 可构建为手机网页/小游戏或原生 H5

### Out of Scope

- 广告、内购或金币经济 — 项目明确无商业化
- 后端服务或联网对战 — 所有逻辑本地运行
- 复杂的社交/排行榜系统 — 非核心体验
- 横屏或平板适配 — 本次以竖屏 20:9 为设计基准

## Context

- 目标用户包含老年人与休闲玩家，UI/UX 需优先考虑可读性与低操作门槛
- 需要支持低端设备的性能降级（粒子效果可关闭/简化）
- 关卡生成算法必须保证可解性，避免玩家卡死
- 美术风格参考录屏中的东方古典元素，需在实现阶段进一步细化

## Constraints

- **平台**：移动端优先，竖屏 20:9 比例，以 1080×2400 为设计基准
- **关卡规模**：至少 20 关可玩，第 20 关最多 128 张牌、7 层堆叠
- **技术栈**：待实现阶段确定，但须为可构建为手机网页/小游戏或原生 H5 的方案
- **无后端**：所有逻辑与数据本地运行，击败比例通过本地模拟实现
- **无商业化**：不得接入广告、内购或金币经济
- **性能**：同屏最多渲染约 150 个牌面节点，低端机可降级粒子效果
- **可解性**：每关初始布局必须保证至少存在一条可清空路径，且每种牌数量为偶数

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 移动端竖屏优先 | 目标用户主要使用手机，竖屏 20:9 为设计基准 | — Pending |
| 无后端/无商业化 | 项目约束明确，降低复杂度 | — Pending |
| 可解性保证 | 避免玩家因无解布局产生挫败感 | — Pending |
| 低压力模式可关闭计时/分数 | 照顾老年人与休闲玩家需求 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**（via `/gsd-transition`）：
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone**（via `/gsd-complete-milestone`）：
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-04 after initialization*
