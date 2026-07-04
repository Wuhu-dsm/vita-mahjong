# Vita Mahjong

## What This Is

Vita Mahjong 是经典 Mahjong Solitaire（麻将连连看 / 麻将消除）的现代移动端复刻版本。面向全年龄段玩家，特别强调老年人、初学者与休闲玩家的友好体验：大牌面、直观触控、清晰视觉、流畅动画，并支持关闭计时/分数压力。项目复刻「首页 → 游戏页 → 结果页」的核心流程，至少支持 20 关，还原录屏中的东方古典美术风格、选牌/匹配/消除动效与结算体系。

## Core Value

让玩家在手机上获得放松、直观、无压力的麻将消除体验——即使视力或反应速度下降的用户，也能一眼看清牌面、一键完成操作，并在即时反馈中感受到连击爽感。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 实现首页（Home）：Logo、关卡入口按钮、设置齿轮、头像/金币占位装饰、东方古典暖色木质背景
- [ ] 实现游戏页（Game）：深绿色绒布桌布背景、多层立体牌面、顶部状态栏（关卡/分数/连击）、4 槽选牌托盘
- [ ] 实现 Mahjong Solitaire 核心玩法：自由牌判定、点击选牌飞入托盘、两张相同牌配对消除、牌面清空即胜利
- [ ] 实现失败/复活机制：托盘 4 槽装满且无法配对时弹出「没有空位了」，提供复活与重新开始
- [ ] 实现结果页（Result）：结算称号、时间/分数/最大连击、击败玩家比例、关卡进度与下一关入口
- [ ] 实现 20 关可玩关卡，难度递增，主题轮换（十二星座、传统麻将、动物、东方元素、季节、神话符号）
- [ ] 实现计分与星级系统：基础分、连击加成、终局加成、时间奖励、三星目标
- [ ] 实现核心动效与反馈：选牌飞入、配对粒子爆炸、Good/Combo 飘字、被锁牌提示、结算动画
- [ ] 完成移动端竖屏适配：基准分辨率 1080×2400，安全区处理，触控区域放大

### Out of Scope

- 道具系统（Hint / Shuffle / Undo）与经济系统（金币、广告、内购、每日奖励）——本次复刻保持免费无广告单机体验
- 每日挑战 / Active Mind Levels——作为后续扩展点预留接口
- 音效与震动反馈——降低复杂度，聚焦核心玩法与视觉
- 关卡地图/列表——首页仅提供当前关卡入口，后续可扩展
- 多人联机、排行榜、账号系统——超出本次复刻范围
- 后端服务——击败比例使用本地模拟分布或预设公式

## Context

- 本项目为测试题实现的像素复刻级交付，依据 `PRD.md` 中整理的真实调研材料（录屏逐帧、官网文字、测试题截图）进行开发。
- 核心美术方向：东方古典 + 现代扁平，高饱和度、高对比度，适合老年用户识别；首页暖棕木质格栅、游戏页深绿绒布桌布、结果页深色背景 + 金色莲花/祥云。
- 关卡数据采用配置化 JSON，便于后续扩展 20 关以后的内容；牌面布局生成器需内置可解性检测，避免死局。
- 性能目标：主流手机 60 FPS，低端机 30 FPS 稳定；单局牌数上限按第 20 关 128 张计算，建议使用对象池复用牌面节点。
- 已确认的关键取舍：使用「分数」体系而非 IQ；托盘容量 4 槽；不展示道具数量与 Lv. 等级；结果页「达到第 N 关」为累计进度/历史最佳。

## Constraints

- **平台**：移动端优先，竖屏 20:9 比例，以 1080×2400 为设计基准。
- **关卡规模**：至少 20 关可玩，第 20 关最多 128 张牌、7 层堆叠。
- **技术栈**：待实现阶段确定，但须为可构建为手机网页/小游戏或原生 H5 的方案。
- **无后端**：所有逻辑与数据本地运行，击败比例通过本地模拟实现。
- **无商业化**：不得接入广告、内购或金币经济。
- **性能**：同屏最多渲染约 150 个牌面节点，低端机可降级粒子效果。
- **可解性**：每关初始布局必须保证至少存在一条可清空路径，且每种牌数量为偶数。

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 使用「分数」体系，不展示 IQ | PRD 与测试题截图一致，避免与录屏中未确认的 IQ 概念冲突 | — Pending |
| 托盘容量固定为 4 槽 | PRD 已确认，与录屏/测试题一致 | — Pending |
| 不实现道具与经济系统 | 聚焦核心玩法，降低实现复杂度，保持无广告单机体验 | — Pending |
| 不实现音效与震动 | 非核心体验，优先保证视觉与交互质量 | — Pending |
| 击败比例采用本地模拟 | 无后端支持，用预设公式或本地历史分布模拟 | — Pending |
| 关卡数据配置化（JSON） | 方便扩展 20 关以后的内容与主题轮换 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-04 after initialization*
