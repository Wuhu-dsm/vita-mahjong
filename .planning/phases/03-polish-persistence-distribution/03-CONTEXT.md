# Phase 3: Polish, Persistence & Distribution - Context

**Gathered:** 2026-07-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 wraps the fully playable Vita Mahjong into a polished, persistent, distributable product:
- **localStorage 持久化**：关卡进度 + 音频设置，重启不丢失。
- **会话恢复**：app 重启后首页显示当前关卡，从头开始。
- **粒子效果**：配对消除时爆出粒子，低端设备自动降级。
- **PWA**：manifest + Service Worker，支持「添加到主屏幕」和离线缓存。
- **设置页扩展**：添加「重置进度」按钮。

本阶段**不包括**：Capacitor 原生包装、完整游戏状态序列化（棋盘/托盘/撤销栈）、横屏/平板适配。
</domain>

<decisions>
## Implementation Decisions

### 会话恢复 & 持久化

- **D-01:** 会话恢复粒度 = **仅关卡进度**。重启后重新开始当前关卡（从头，分数/辅助次数重置）。不恢复棋盘状态、托盘内容、撤销栈、连击数。
- **D-02:** 持久化内容 = **currentLevel** + **音频设置**（sfxVolume, bgmVolume, sfxMuted, bgmMuted）。使用 localStorage。
- **D-03:** App 启动行为 = **始终回到首页**，首页按钮显示持久化的 currentLevel 值（"关卡 X"）。不自动进入游戏。
- **D-04:** 设置页添加 **「重置进度」按钮**，点击后弹出确认提示，确认后 currentLevel 重置为 1。

### 粒子效果

- **D-05:** 粒子风格 = **匹配爆发**。配对消除时从两张牌位置向四周散射小方块/圆点粒子，颜色与牌面主题色呼应。
- **D-06:** 触发范围 = **仅匹配消除**。通关、失败、连击不使用粒子（已有 ComboFeedback、FailurePopup、ScoreFloater 覆盖）。
- **D-07:** 密度 = **15-20 粒子/次**，低端设备降为 **8-10 粒子/次**。
- **D-08:** 性能检测 = **自动检测**（agent 自行决定检测机制：devicePixelRatio 阈值 或 初始帧率采样）。

### PWA & 分发

- **D-09:** PWA 深度 = **基本 PWA**（manifest.json + Service Worker 缓存静态资源与关卡 JSON）。支持「添加到主屏幕」，离线可玩已缓存关卡。
- **D-10:** 原生包装 = **不需要 Capacitor**。PWA 的「添加到主屏幕」体验已足够。

### Agent Discretion

- 性能自动检测机制（devicePixelRatio 阈值、帧率采样方案）由实现阶段决定。
- 粒子形状（方形/圆形）、颜色映射、动画曲线由实现阶段决定。
- Service Worker 缓存策略（CacheFirst / NetworkFirst）和预缓存范围由实现阶段决定。
- PWA 图标生成方案由实现阶段决定（复用现有程序化 asset 生成模式或使用静态 PNG）。
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 产品设计
- `PRD.md` — 完整产品设计文档（匹配/托盘机制、关卡设计、UI 布局、色板）
- `assets/screenshots/key_nodes/` — 关键节点截图（视觉参考）

### 项目规划
- `.planning/ROADMAP.md` — Phase 3 目标、成功标准、计划拆解（2个 plan）、需求映射
- `.planning/REQUIREMENTS.md` — Phase 3 需求 ID：VISL-03, PROG-01, PROG-02, PLAT-03
- `.planning/PROJECT.md` — 核心价值、约束、目标用户、排除范围
- `.planning/phases/01-core-engine-solvable-levels/01-CONTEXT.md` — Phase 1 决策（PixiJS 8 + TypeScript + Vite 栈、4槽托盘、打分/连击、关卡生成、动画系统）
- `.planning/phases/02-ui-ux-accessibility-game-flow/02-CONTEXT.md` — Phase 2 决策（屏幕导航流、牌面布局 gridX/gridY、辅助按钮限制、音频系统、设置页、无低压力模式）

### Phase 1 & 2 交付物（Phase 3 直接依赖）
- `src/app/App.ts` — App 入口、currentLevel 变量、ScreenManager、事件流
- `src/app/config.ts` — 设计常量（分辨率 1080×2400、牌面 227×120、色板、时序、辅助限制）
- `src/engine/GameState.ts` — 游戏状态机（actionHistory 撤销栈、ComboTracker、tapStone、undo/hint/shuffle）
- `src/audio/AudioManager.ts` — 音频管理器单例（sfxVolume、bgmVolume、sfxMuted、bgmMuted — 当前仅内存）
- `src/renderer/screens/SettingsScreen.ts` — 设置页（音量滑块、静音开关 — 无持久化，无重置按钮）
- `src/renderer/screens/GameScreen.ts` — 游戏主屏（动画循环、ticker 驱动、AssistBar、ScoreFloater）
- `src/renderer/components/Button.ts` — 胶囊按钮组件（复用）
- `src/renderer/effects/ScoreFloater.ts` — 分数飘字效果（上浮+淡出模式）
- `public/levels/1.json` ~ `20.json` — 20 关数据（运行时 fetch 加载，需 SW 缓存）
- `vite.config.ts` — Vite 构建配置（无 PWA 插件）
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **AudioManager** (`src/audio/AudioManager.ts`): 单例，已有 sfxVolume / bgmVolume / sfxMuted / bgmMuted 的 getter/setter。持久化时直接读写 localStorage，初始化时从 storage 恢复。
- **SettingsScreen** (`src/renderer/screens/SettingsScreen.ts`): 已有音量滑块和静音控件，`updateFromAudioManager()` 方法可同步 AudioManager 状态。需添加「重置进度」按钮 + 确认弹窗。
- **App.ts** (`src/app/App.ts`): `currentLevel` 变量需改为从 localStorage 读取初始化值，`WIN` 事件中 `currentLevel = stats.nextLevel` 时同步写入。
- **GameScreen** (`src/renderer/screens/GameScreen.ts`): 动画循环（`animations[]` + `ticker` + `updateAnimations`）可直接接入粒子系统。
- **ScoreFloater** (`src/renderer/effects/ScoreFloater.ts`): 飘字效果的上浮+淡出模式可作为粒子的基础动画参考。
- **TilePool** (`src/renderer/pools/TilePool.ts`): 对象池模式，粒子池应复用此模式。
- **Button** (`src/renderer/components/Button.ts`): 设置页「重置进度」按钮复用。
- **FailurePopup** (`src/renderer/components/FailurePopup.ts`): 确认弹窗 UI 可参考其模式。

### Established Patterns
- 动画系统：`Animation[]` 数组 + `ticker.deltaMS` + `update(progress)` 回调 + `complete()` 清理。粒子动画应遵循此模式。
- 程序化生成：PNG 纹理通过 `tools/generate-assets.ts` 生成。PWA 图标可按此模式程序化生成。
- 单例模式：AudioManager 是单例。持久化管理器可同样使用单例（如 PersistenceManager）。
- 设计常量：config.ts 中集中管理所有可配置参数。粒子参数（密度、速度、颜色）放入 config。
- 关卡加载：`fetch('levels/{n}.json')` — SW 需缓存这些请求。

### Integration Points
- **持久化**: 在 App.ts 初始化时读取 localStorage，在 currentLevel 变更和音频设置变更时写入。新建 `src/app/persistence.ts`（轻量读写工具函数）。
- **粒子系统**: 在 GameScreen 动画循环中新增粒子更新步骤，新建 `src/renderer/effects/ParticleBurst.ts`，使用 TilePool 模式的对象池。
- **重置进度**: SettingsScreen 新增「重置进度」按钮行，点击弹出确认弹窗（可复用 FailurePopup 的遮罩+面板模式），确认后清空 localStorage 的 currentLevel 并重置为 1。
- **PWA**: vite.config.ts 添加 `vite-plugin-pwa`，创建 `public/manifest.json`，配置 Service Worker 缓存策略。
</code_context>

<specifics>
## Specific Ideas

- 粒子爆发方向应从两牌中心向外呈圆形散射，有初速度 + 重力/减速感，持续时间 ~0.5s。
- 粒子颜色建议取牌面主题色（红/绿/蓝/金等），或使用金色系统一色调。
- localStorage key 使用 `vita-mahjong:currentLevel` 和 `vita-mahjong:audio` 命名空间，避免冲突。
- 「重置进度」确认弹窗文字：「确定要重置进度吗？所有关卡记录将被清除。」，两个按钮「取消」/「确认重置」。
- PWA manifest icons 需要 192x192 和 512x512 两种尺寸，可使用现有 generate-assets 工具链生成。
- Service Worker 缓存策略：对 `levels/*.json` 和静态资源使用 CacheFirst，对入口 HTML 使用 NetworkFirst。
</specifics>

<deferred>
## Deferred Ideas

- **Capacitor / 原生 APK/IPA 包装**: 用户确认仅 PWA 即可。
- **完整游戏状态序列化**: 棋盘/托盘/撤销栈的全量恢复太重，用户选择仅关卡进度。
- **低压力模式**: Phase 2 已移除。
- **关卡回放**: Phase 2 已推迟。
- **横屏/平板适配**: v1 范围外。
- **性能分级手动开关**: 用户未选择讨论，采用自动检测。
- **Capacitor 状态栏/启动画面**: 不需要。

### Reviewed Todos (not folded)
None.
</deferred>

---

*Phase: 3-Polish, Persistence & Distribution*
*Context gathered: 2026-07-05*
