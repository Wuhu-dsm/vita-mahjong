# Phase 2: UI/UX, Accessibility & Game Flow - Context

**Gathered:** 2026-07-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 在 Phase 1 的引擎和渲染器基础上构建完整的前端体验：首页 → 游戏 → 结算的完整导航流、音频系统、辅助按钮（撤销/提示/洗牌）、以及匹配 PRD 截图的牌面布局。Phase 1 的 HomeScreen、GameScreen、ResultScreen、ScreenManager、Button、HUD、Tray、TileSprite 等组件全部复用和扩展。

本阶段**不包括**：低压力模式（已移除）、持久化存储（Phase 3）、粒子效果（Phase 3）、PWA（Phase 3）。
</domain>

<decisions>
## Implementation Decisions

### 关卡选择
- **D-01:** 首页只显示一个按钮 "关卡 X"（X = 当前关），线性推进。不提供关卡网格或列表。
- **D-02:** 已通关的关卡不可回放。玩家只能玩当前未通关的一关。

### 低压力模式
- **D-03:** 不做低压力模式。计时器和分数始终显示，连击衰减和失败条件不变。对应 REQUIREMENTS.md ACCS-05 移除。

### 辅助按钮
- **D-04:** 撤销/提示/洗牌放在**屏幕底部**（参考 key_nodes 截图：三个圆形按钮并排）。
- **D-05:** 使用次数限制：撤销 3 次、提示 3 次、洗牌 1 次。每关重置。
- **D-06:** 提示行为：高亮一对可匹配的牌（两个牌同时发光），玩家仍需自己点击。使用 Phase 1 的 Solver 确保建议有效。
- **D-07:** 撤销：回退上一次消除操作（恢复牌到原位）。洗牌：重新随机排列剩余牌的位置。

### 牌面布局
- **D-08:** **同层牌紧挨不重叠**：水平方向 `gridX = tile.width / 2`，垂直方向 `gridY = tile.height`。参考 key_nodes/02_game_board.png，同一层的牌之间无水平或垂直遮盖。
- **D-09:** **上层半覆盖**：经典麻将堆叠效果，上层牌压住下层 4 张牌的中心。参考 key_nodes 截图。
- **D-10:** 牌面尺寸、圆角、侧边厚度等视觉细节以 key_nodes 截图为依据。

### 返回/退出
- **D-11:** 游戏中点击返回按钮直接回首页，丢弃当前关卡进度。无确认弹窗，无暂停。

### 音频
- **D-12:** 使用**原生 Web Audio API**（不引入 howler.js），编写轻量 AudioManager。
- **D-13:** 音效和背景音乐全部**程序化生成**（OscillatorNode + GainNode），与现有 PNG 程序化生成模式一致。
- **D-14:** 音频控制放在**独立设置页**，通过首页齿轮图标进入。包含 SFX 音量、BGM 音量、独立的静音/开启。
- **D-15:** 音效覆盖：选牌（tap）、匹配消除（match）、连击（combo）、通关（win）、失败（fail）、按钮点击（click）。背景音乐：古典中国风循环曲。

### Agent Discretion
- gridX / gridY / layerOffset 的具体像素值由实现阶段推导，确保同层无重叠、上层半覆盖。
- 程序化音频的具体波形和音符参数由 AudioManager 实现。
- 设置页除音频控制外的其他内容（版本号、重置进度等）在 Phase 3 决定。
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 产品设计
- `PRD.md` — 完整的麻将连连看产品设计：匹配/托盘机制、关卡设计、主题表、UI 布局、色板、动画列表。
- `assets/screenshots/key_nodes/02_game_board.png` — 游戏棋盘参考截图（牌面布局、托盘位置、辅助按钮位置的核心视觉依据）。
- `assets/screenshots/key_nodes/05_powerup_undo.png` — 撤销功能 UI 参考。
- `assets/screenshots/key_nodes/06_powerup_shuffle.png` — 洗牌功能 UI 参考。
- `assets/screenshots/key_nodes/07_powerup_hint.png` — 提示功能 UI 参考。
- `assets/screenshots/key_nodes/08_level_clear.png` — 通关界面参考。
- `assets/screenshots/key_nodes/09_result.png` — 结算界面参考。

### 项目规划
- `.planning/ROADMAP.md` — Phase 2 目标、成功标准、计划拆解（3 个 plan）、需求映射。
- `.planning/REQUIREMENTS.md` — Phase 2 需求 ID：CORE-06, LVLS-05, ACCS-01/02/04/05, VISL-01/02, AUDI-01/02/03, RSLT-01/02, PLAT-01。
- `.planning/PROJECT.md` — 核心价值、约束、目标用户、排除范围。
- `.planning/phases/01-core-engine-solvable-levels/01-CONTEXT.md` — Phase 1 决策（4 槽托盘、打分公式、连击规则、屏幕过渡动画、PRD 视觉风格、栈锁定 PixiJS 8 + TypeScript + Vite）。

### Phase 1 交付物
- `public/levels/1.json` ~ `20.json` — 20 个关卡数据，运行时 fetch 加载。
- `src/app/config.ts` — 设计常量：设计分辨率 1080×2400、牌面尺寸 227×120、色板、时序参数。
- `src/engine/Solver.ts` — 可解性求解器，提示系统复用。
- `src/engine/GameState.ts` — 游戏状态机、打分、连击、tray 管理。
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **HomeScreen** (`src/renderer/screens/HomeScreen.ts`): 首页容器，已有背景、logo、装饰环、按钮、齿轮图标。需把硬编码 "关卡 1" 改为动态 "关卡 X"。
- **GameScreen** (`src/renderer/screens/GameScreen.ts`): 游戏核心。HUD + 牌桌 + 托盘 + 连击/分数/失败弹窗。需添加底部辅助按钮栏、返回功能、计时器显示。
- **ResultScreen** (`src/renderer/screens/ResultScreen.ts`): 结算页已有标题、数据列、进度文本、"下一关"按钮。基本满足 RSLT-01/02。
- **ScreenManager** (`src/renderer/ScreenManager.ts`): 三屏交叉淡入淡出过渡。需扩展 `ScreenName` 类型加入 `settings`。
- **Button** (`src/renderer/components/Button.ts`): 胶囊按钮，支持 3 种纹理 + 可配置文本文案。可直接用于辅助按钮和设置页。
- **HUD** (`src/renderer/components/HUD.ts`): 顶部栏，返回/菜单图标已有但无点击处理。需接入返回逻辑。
- **Tray** (`src/renderer/components/Tray.ts`): 4 槽托盘，已有槽位查询和匹配消除动画。
- **TilePool** (`src/renderer/pools/TilePool.ts`): 牌面对象池（150 上限）。
- **TileSprite** (`src/renderer/components/TileSprite.ts`): 完整牌面（面+侧+阴影+光晕+符号），支持高亮和变暗。
- **ComboFeedback** / **ScoreFloater** / **FailurePopup** / **BlockedHint**: 已有组件复用。

### Established Patterns
- 屏幕管理：`ScreenManager` 通过 `show(screenName)` 切换，`ScreenName` 是字符串联合类型。
- 按钮：`Button` 组件通过 `onTap` 回调工作，`eventMode = 'static'` + PixiJS 指针事件。
- 纹理加载：`loadAssets(['home', 'game', 'result', 'ui', 'fonts'])` 分批懒加载。
- 动画：`app.ticker` 驱动的自定义动画循环（`animations[]` 数组 + `updateAnimations`）。
- 程序化生成：PNG 纹理通过 `tools/generate-assets.ts` 生成。音频同理程序化合成。
- 关卡加载：`fetch('levels/{n}.json')` + `validatePlayableLevel()` 验证。

### Integration Points
- **设置页**: 需新增 `ScreenName` → `'settings'`，创建 `SettingsScreen` Container，在 `ScreenManager` 中管理。
- **辅助按钮**: 在 `GameScreen` 底部新增 `AssistBar` 组件，调用 `GameState` 的撤销/提示（需扩展 GameState API）和洗牌（需新增 BoardModel shuffle 方法）。
- **音频**: 新建 `src/audio/AudioManager.ts`，在 `App` 初始化时创建单例，各屏幕事件触发 SFX。
- **返回**: `GameScreen` 的返回按钮需触发 `ScreenManager.show('home')` 并重置 game state。
- **牌面布局**: 修改 `GameScreen.toBoardPosition()` 中的 `gridX`/`gridY`/`layerOffset` 值。不影响关卡数据或可解性。
</code_context>

<specifics>
## Specific Ideas

- 辅助按钮栏参考 key_nodes 截图：底部三个圆形按钮，样式和大小与截图一致。
- 设置页参考现有 Screen 模式（Container 子类 + 纹理加载），风格与东方古典主题统一。
- 音频程序化生成：短音效用短促的振荡器衰减包络（类似"叮"声），BGM 用带谐波的简单旋律循环。
- 牌面布局改动需验证所有 20 关的可视效果，特别是密度高的关卡（如 20 关 128 牌 7 层）。
- 计时器在 HUD 中显示（正计时），位置在分数和连击之间或旁边。仅在结算页显示最终用时。
</specifics>

<deferred>
## Deferred Ideas

- **低压力模式**: 用户明确要求不做。从 Phase 2 移除。
- **关卡回放**: 已通关关卡不可重玩。如需支持，Phase 3 考虑。
- **持久化**: 关卡进度、设置、音频偏好存储 — Phase 3。
- **粒子效果**: 消除动画粒子 — Phase 3。
- **PWA / native H5 打包**: Phase 3。
- **设置页扩展**: 语言切换、重置进度、版本号等 — Phase 3。
- **横屏/平板适配**: v1 范围外。

### Reviewed Todos (not folded)
None.
</deferred>

---

*Phase: 2-UI/UX, Accessibility & Game Flow*
*Context gathered: 2026-07-05*
