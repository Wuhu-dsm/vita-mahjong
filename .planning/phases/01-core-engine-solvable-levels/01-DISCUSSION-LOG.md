# Phase 1: Core Engine & Solvable Levels - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-04
**Phase:** 1-Core Engine & Solvable Levels
**Areas discussed:** 核心配对机制, 关卡数据来源, Phase 1 的界面完整度, Phase 1 是否做计分/连击/星级

---

## 核心配对机制

| Option | Description | Selected |
|--------|-------------|----------|
| 4格托盘机制（PRD版） | 点击自由牌后飞入顶部 4 格托盘，托盘内出现两张相同牌时自动消除；托盘满 4 张未配对则失败。 | ✓ |
| 传统麻将连连看（ROADMAP版） | 直接点击两张匹配的自由牌，匹配后立即从棋盘消除；没有托盘容量限制，胜负判定为棋盘清空或无可行移动。 | |
| 你决定 | 由下游 agent 根据实现复杂度与 PRD/ROADMAP 一致性自行选择。 | |

**User's choice:** 4格托盘机制（PRD版）
**Notes:** This resolves the ROADMAP/PRD conflict in favor of the PRD's recorded video interaction.

| Option | Description | Selected |
|--------|-------------|----------|
| 只做托盘满失败 | 仅当托盘被 4 张未配对牌占满时判负。 | |
| 同时检测死局 | 除了托盘满，还检测棋盘上是否还存在任何可点击的自由牌；若棋盘无自由牌且托盘未满，也进入失败/重试状态。 | ✓ |
| 你决定 | 由实现 agent 选择最符合 PRD 与 ROADMAP 的判定方式。 | |

**User's choice:** 同时检测死局
**Notes:** Satisfies ROADMAP success criterion #5 while keeping the tray-based failure from PRD.

| Option | Description | Selected |
|--------|-------------|----------|
| 实现复活 | 托盘满后弹出失败弹窗，提供「复活」按钮：点击后清空托盘、保持当前棋盘和分数继续游戏。 | |
| 只做重新开始 | 失败弹窗只提供「重新开始」：从本关开头重新发牌，分数重置。 | ✓ |
| 你决定 | 由实现 agent 根据 Phase 1 边界自行取舍。 | |

**User's choice:** 只做重新开始
**Notes:** Keeps Phase 1 scope smaller; revive can be added later if desired.

| Option | Description | Selected |
|--------|-------------|----------|
| 变暗 + 红色箭头 + 提示文字 | 牌变暗，左右显示红色箭头，并弹出「被左右锁住」提示文字。 | ✓ |
| 仅视觉高亮（变暗/抖动） | 点击被锁牌时只做变暗或轻微抖动反馈，不显示文字提示。 | |
| 你决定 | 由实现 agent 根据 Phase 1 范围与资源选择合适方案。 | |

**User's choice:** 变暗 + 红色箭头 + 提示文字
**Notes:** Matches PRD §3.2 and recorded video frame.

| Option | Description | Selected |
|--------|-------------|----------|
| 任意两张配对，第三张保留 | 托盘内只要出现两张相同牌面（不必相邻）就立即配对消除；第三张同面牌继续留在托盘内。 | ✓ |
| 仅相邻配对，最多两张同面 | 只有相邻两张相同牌面才配对；当托盘内已有两张同面牌时，再点击第三张同面牌时被拒或游戏结束。 | |
| 你决定 | 由实现 agent 根据 PRD 与可玩性选择。 | |

**User's choice:** 任意两张配对，第三张保留
**Notes:** Most literal reading of PRD §3.3.

| Option | Description | Selected |
|--------|-------------|----------|
| 实现警告 | 托盘达到 3 张未配对牌时弹出「小心！别让托盘装满！」提示。 | |
| 不做警告 | 不实现该警告，只在托盘满 4 张时判负。 | ✓ |
| 你决定 | 由实现 agent 决定。 | |

**User's choice:** 不做警告
**Notes:** Deferred to reduce Phase 1 UI scope.

---

## 关卡数据来源

| Option | Description | Selected |
|--------|-------------|----------|
| 人工设计 + 构建时求解验证 | 由设计者编写关卡布局（JSON/YAML），构建时运行求解器验证可解性，把验证后的静态 JSON 打包进应用。 | |
| 构建时程序化生成 | 构建时运行反向发牌/正向模拟算法生成 20 关可解布局，输出静态 JSON 打包。 | ✓ |
| 运行时生成 | 应用启动或进入关卡时实时生成可解布局。 | |
| 你决定 | 由实现 agent 根据工具链与可维护性选择。 | |

**User's choice:** 构建时程序化生成
**Notes:** Aligns with STATE.md's forward/backward-dealing approach.

| Option | Description | Selected |
|--------|-------------|----------|
| 固定种子 | 使用固定随机种子生成 20 关，确保不同构建、不同玩家看到的第 1–20 关布局完全一致。 | ✓ |
| 每次构建重新随机 | 每次构建生成新的随机 20 关，玩家体验更多样。 | |
| 你决定 | 由实现 agent 根据测试与发布流程选择。 | |

**User's choice:** 固定种子
**Notes:** Determinism preferred for testing and QA.

| Option | Description | Selected |
|--------|-------------|----------|
| 按 PRD 主题表分配 | 第 1–3 关十二星座、4–8 和 12–16 关传统麻将、9–11 动物、13–15 东方元素、17–18 季节、19–20 神话。 | ✓ |
| 仅按难度动态选择花色池 | 不严格绑定关卡号到主题，只根据牌数/层数动态选择足够大的花色池。 | |
| 你决定 | 由实现 agent 根据资源与生成复杂度选择。 | |

**User's choice:** 按 PRD 主题表分配
**Notes:** Preserves PRD's planned visual rhythm and difficulty curve.

| Option | Description | Selected |
|--------|-------------|----------|
| 纳入版本控制 | 生成后提交到仓库，CI 无需重新运行生成器。 | |
| 构建时重新生成，不纳入版本控制 | .gitignore 生成的 JSON，每次构建/CI 都重新运行生成器。 | ✓ |
| 你决定 | 由实现 agent 根据构建流程选择。 | |

**User's choice:** 构建时重新生成，不纳入版本控制
**Notes:** Keeps repository free of generated data files; CI must be able to run the generator.

---

## Phase 1 的界面完整度

| Option | Description | Selected |
|--------|-------------|----------|
| 完整 PRD 视觉 | 首页、游戏页、结果页都按 PRD 的东方古典美术风格、配色、布局实现。 | ✓ |
| 功能性骨架 + 基础样式 | 实现可工作的三屏切换、游戏 HUD、基础牌面与托盘、胜负弹窗，但不做 PRD 级的精细视觉、动画和主题。 | |
| 你决定 | 由实现 agent 根据 Phase 1 范围与工期选择。 | |

**User's choice:** 完整 PRD 视觉
**Notes:** Phase 1 milestone will look close to final product.

| Option | Description | Selected |
|--------|-------------|----------|
| 从首页进入 | 启动后显示 PRD 首页，点击后进入游戏。 | ✓ |
| 直接进入第 1 关 | 启动后直接进入第 1 关游戏页，跳过首页。 | |
| 你决定 | 由实现 agent 根据 PRD 与录屏的冲突处理。 | |

**User's choice:** 从首页进入
**Notes:** Follows test-image reference in PRD rather than the video's apparent direct-to-level start.

| Option | Description | Selected |
|--------|-------------|----------|
| 完整 PRD 结算面板 | 显示称号、时间、分数、连击、击败比例、关卡进度条、下一关按钮。 | ✓ |
| 简化结算 | 只显示通关/失败状态、用时、重新开始和下一关按钮。 | |
| 你决定 | 由实现 agent 根据计分是否在 Phase 1 实现来选择。 | |

**User's choice:** 完整 PRD 结算面板
**Notes:** Requires partial scoring to be implemented; beat-ratio and stars will show placeholders/deferred values.

| Option | Description | Selected |
|--------|-------------|----------|
| 实现转场动画 | 首页→游戏页、游戏页→结果页之间加入淡入淡出/缩放等转场动画。 | ✓ |
| 直接切换 | 屏幕之间立即切换，无转场动画。 | |
| 你决定 | 由实现 agent 决定。 | |

**User's choice:** 实现转场动画
**Notes:** Adds polish in Phase 1.

---

## Phase 1 是否做计分/连击/星级

| Option | Description | Selected |
|--------|-------------|----------|
| 完整实现 | 按 PRD 实现分数公式、连击规则、每关三星目标和击败比例。 | |
| 部分实现 | 只实现基础分数和用时显示，不做连击加成、三星目标和击败比例。 | ✓ |
| 不做 | Phase 1 只判定胜负，不记录分数、连击和星级。 | |
| 你决定 | 由实现 agent 根据 Phase 1 工作量决定。 | |

**User's choice:** 部分实现
**Notes:** Score and combo implemented; stars and beat-ratio deferred.

| Option | Description | Selected |
|--------|-------------|----------|
| 基础分数 | 每次匹配获得基础分，顶部 HUD 和结果页显示当前/最终分数。 | ✓ |
| 连击加成 | 连续匹配获得连击加成，显示 Combo xN，中断后归零。 | ✓ |
| 三星目标 | 每关有通关、时间、连击三个星级目标，结算时显示获得几颗星。 | |
| 击败比例 | 结算页显示「击败了 X% 的玩家」，使用本地模拟分布或预设公式。 | |
| 时间奖励 | 目标时间内完成获得额外时间奖励分。 | |

**User's choice:** 基础分数, 连击加成
**Notes:** These two are in scope; the rest are deferred.

| Option | Description | Selected |
|--------|-------------|----------|
| PRD 公式 | 基础分 100 × (1 + min(连击-1, 9) × 0.2) + 终局加成 + 时间奖励 + 三星奖励。 | ✓ |
| 简化公式 | 基础分 100，每次连击额外 +20，最高 +180。 | |
| 你决定 | 由实现 agent 选择。 | |

**User's choice:** PRD 公式
**Notes:** Deferred reward terms treated as 0 in Phase 1.

| Option | Description | Selected |
|--------|-------------|----------|
| PRD 规则 | 超过 3 秒未成功匹配，或点击非自由牌被锁住时中断。 | ✓ |
| 仅时间中断 | 只有超过 3 秒未成功匹配时中断；点击被锁牌不中断。 | |
| 你决定 | 由实现 agent 决定。 | |

**User's choice:** PRD 规则
**Notes:** Matches PRD §9.4.

---

## Agent Discretion

- None. All gray areas were resolved by explicit user choice.

## Deferred Ideas

- Tray-almost-full warning popup (3 unmatched tiles).
- Revive / continue-after-failure.
- Star rating system (3-star targets per level).
- Beat ratio ("击败了 X% 的玩家").
- Time reward and end-game bonus scoring.
- Undo / hint / shuffle props.
- Audio, music, and haptics.
- Daily challenges, Active Mind Levels, endless mode, cloud save, social sharing.
- Landscape / tablet optimization.
