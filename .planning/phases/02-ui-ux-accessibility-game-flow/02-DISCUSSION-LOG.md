# Phase 2: UI/UX, Accessibility & Game Flow - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-05
**Phase:** 2-UI/UX, Accessibility & Game Flow
**Areas discussed:** 关卡选择界面布局, 低压力模式范围, 辅助按钮交互, 音频架构方案, 返回/退出流程, 牌面布局

---

## 关卡选择界面布局

| Option | Description | Selected |
|--------|-------------|----------|
| 竖向滚动网格 | 4-5列固定网格，竖向滚动 | |
| 横向分页轮播 | 每页2-4关大卡片，左右滑动 | |
| 单列竖向列表 | 一行一关，最大字号 | |
| 单按钮 "关卡X" | 首页只显示一个按钮，动态显示当前关卡号 | ✓ |

**User's choice:** 只展示一个按钮，显示 "关卡 X"，X 为当前到了第几关。
**Notes:** 选 "仅限当前关" 不可回放已通关关卡。

---

## 低压力模式范围

| Option | Description | Selected |
|--------|-------------|----------|
| 仅隐藏显示 | 隐藏 HUD 上的计时器和分数 | |
| 零压力禅模式 | 隐藏显示 + 连击不衰减 + 不失败 | |
| 不做低压力模式 | 用户明确要求不做 | ✓ |

**User's choice:** 不做低压力模式。
**Notes:** 计时器和分数始终显示，游戏逻辑无变化。对应 ACCS-05 从 Phase 2 移除。

---

## 辅助按钮交互

| Option | Description | Selected |
|--------|-------------|----------|
| 托盘下方按钮栏 | 托盘下方独立一行，3 个按钮并排 | |
| HUD 菜单内 | 顶部菜单展开 | |
| 悬浮圆形按钮 | 右下角悬浮图标 | |
| 屏幕底部 | 屏幕最底部 3 个圆形按钮 | ✓ |

**User's choice:** 屏幕底部（参考 key_nodes 截图）。

| Option | Description | Selected |
|--------|-------------|----------|
| 全部无限使用 | 无限制 | |
| 每种有限次数 | 撤销/提示/洗牌各有上限 | ✓ |
| 撤销无限其他有限 | 撤销不限，提示洗牌有限 | |

**User's choice:** 撤销 3 次、提示 3 次、洗牌 1 次。

| Option | Description | Selected |
|--------|-------------|----------|
| 高亮一对可匹配的牌 | 两个牌同时发光，玩家仍需自己点 | ✓ |
| 自动选第一张 | 自动选第一张放托盘 | |

**User's choice:** 高亮一对可匹配的牌。

---

## 音频架构方案

| Option | Description | Selected |
|--------|-------------|----------|
| howler.js | 安装 howler.js 库 | |
| 原生 Web Audio API | 零依赖，自写 AudioManager | ✓ |

**User's choice:** 原生 Web Audio API。

| Option | Description | Selected |
|--------|-------------|----------|
| 独立设置页 | 首页齿轮进独立设置页 | ✓ |
| 首页弹出设置面板 | 半透明覆盖面板 | |
| 仅静音切换 | 齿轮点一下切换静音 | |

**User's choice:** 独立设置页。

| Option | Description | Selected |
|--------|-------------|----------|
| 音效+背景音乐 | SFX + BGM | ✓ |
| 仅音效 | 无背景音乐 | |

**User's choice:** 音效 + 背景音乐。

| Option | Description | Selected |
|--------|-------------|----------|
| 程序化生成 | Web Audio API 合成 | ✓ |
| 外部音频文件 | .mp3/.ogg 文件 | |

**User's choice:** 程序化生成。

---

## 返回/退出流程

| Option | Description | Selected |
|--------|-------------|----------|
| 直接退出丢弃进度 | 无确认，直接回首页 | ✓ |
| 弹窗确认后退出 | 确认框 "确定退出？" | |
| 暂停面板 | 继续/重开/返回首页 | |

**User's choice:** 直接退出，丢弃进度。

---

## 牌面布局

| Option | Description | Selected |
|--------|-------------|----------|
| 中重叠 | gridX≈130-140，接近截图 | |
| 无重叠 | gridX=227，完全无重叠 | |
| 保持现状 | gridX=64 | |
| 同层相邻 | 同层牌紧挨不重叠，上层半覆盖 | ✓ |

**User's choice:** "同层的麻将是紧挨着没有重叠的" + "同层相邻，半覆盖（经典麻将）"
**Notes:** 截图里看起来像重叠的其实是上下层牌。同层排列不重叠，上层牌压住下层牌中心（经典麻将堆叠）。

---

## Agent's Discretion

- gridX / gridY / layerOffset 具体像素值由实现推导
- 程序化音频波形和参数由 AudioManager 实现
- 设置页额外内容（版本号等）Phase 3 决定

## Deferred Ideas

- 低压力模式：用户明确不做
- 关卡回放：Phase 3 考虑
- 持久化存储：Phase 3
- 粒子效果：Phase 3
- PWA/H5 打包：Phase 3
