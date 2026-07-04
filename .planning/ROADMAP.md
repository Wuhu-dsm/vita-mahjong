# Roadmap: Vita Mahjong

**Mode:** Vertical MVP — each phase delivers an end-to-end user capability.
**Granularity:** Coarse

---

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Project Setup & Home Screen | 搭建项目脚手架并实现首页入口 | HOME-01–03, MOB-01 | 4 |
| 2 | Core Game Loop | 实现选牌、匹配、自由牌判定、胜负与复活 | GAME-01–10 | 6 |
| 3 | Level Data & 20 Levels | 用 JSON 驱动 20 关可玩关卡 | LVL-01–05 | 4 |
| 4 | Scoring, Rating & Result Screen | 实现计分、星级、结果页与下一关流转 | SCOR-01–07, RES-01–04 | 4 |
| 5 | Visual Effects, Animation & Mobile Polish | 还原动效与移动端适配打磨 | FX-01–07, MOB-02–04 | 5 |

**Coverage:** 39/39 v1 requirements mapped ✓

---

### Phase 1: Project Setup & Home Screen

**Goal:** 搭建项目脚手架并实现首页入口。

**Mode:** mvp
**UI hint**: yes

**Requirements:**
- HOME-01: 首页展示 Logo、木质胶囊「关卡 N」主入口按钮、右上角设置齿轮、左上角头像/金币占位装饰
- HOME-02: 点击「关卡 N」按钮进入当前最新可玩关卡
- HOME-03: 设置页提供音乐、计时/分数压力等开关入口
- MOB-01: 以 1080×2400 竖屏比例为设计基准，使用相对坐标与锚点布局

**Success Criteria:**
1. 项目能在 1080×2400 移动视口下构建并运行
2. 首页渲染出 Logo、关卡入口按钮、设置齿轮、头像/金币占位
3. 点击「关卡 N」可跳转至游戏页
4. 设置页 UI 存在，包含开关占位

---

### Phase 2: Core Game Loop

**Goal:** 实现选牌、匹配、自由牌判定、胜负与复活机制。

**Mode:** mvp

**Requirements:**
- GAME-01: 游戏页采用深绿色绒布/桌布质感背景与顶部状态栏
- GAME-02: 顶部状态栏采用「关卡 + 分数 + 匹配（连击）」三字段布局
- GAME-03: 游戏页提供 4 槽选牌托盘，点击自由牌后飞入托盘
- GAME-04: 实现自由牌判定逻辑
- GAME-05: 点击非自由牌时显示被锁住提示
- GAME-06: 两张相同牌进入托盘后立即配对成功并移除
- GAME-07: 棋盘清空时判定胜利并进入结果页
- GAME-08: 托盘装满时弹出「没有空位了」失败弹窗
- GAME-09: 失败弹窗提供复活与重新开始选项
- GAME-10: 托盘已有 3 张牌时弹出装满警告

**Success Criteria:**
1. 硬编码关卡能正确渲染牌面与 4 槽托盘
2. 点击自由牌可将牌移入托盘
3. 点击相同图案的一对牌可消除并触发反馈
4. 点击被遮挡牌显示锁定提示
5. 托盘装满且无配对时弹出失败弹窗并提供两个选项
6. 清空所有牌后进入结果页

---

### Phase 3: Level Data & 20 Levels

**Goal:** 用 JSON 驱动 20 关可玩关卡，支持主题与难度递增。

**Mode:** mvp

**Requirements:**
- LVL-01: 关卡数据采用配置化 JSON
- LVL-02: 实现至少 20 关可玩关卡，难度递增，主题轮换
- LVL-03: 每关初始布局保证可解性且每种牌数量为偶数
- LVL-04: 第 1 关复刻录屏中的十二星座 4×6 双层布局
- LVL-05: 第 2 关复刻录屏中的传统麻将主题风格

**Success Criteria:**
1. 关卡配置 JSON 能驱动棋盘布局、主题与星级目标
2. 20 关均可玩且至少存在一条可清空路径
3. 每关使用正确的牌面主题
4. 第 1、2 关的视觉风格与录屏一致

---

### Phase 4: Scoring, Rating & Result Screen

**Goal:** 实现计分、连击、星级、结果页与下一关流转。

**Mode:** mvp

**Requirements:**
- SCOR-01: 游戏页与结果页显示本局分数
- SCOR-02: 实现连击系统与中断条件
- SCOR-03: 实现基础计分公式
- SCOR-04: 实现目标时间内完成的时间奖励
- SCOR-05: 实现三星评级
- SCOR-06: 结果页显示用时、分数、最大连击、击败比例
- SCOR-07: 根据表现动态显示称号/评级
- RES-01: 结果页采用深色背景 + 金色莲花/祥云装饰
- RES-02: 结果页显示横向三列数据面板
- RES-03: 结果页显示击败比例与关卡进度
- RES-04: 结果页底部提供「关卡 N+1」按钮

**Success Criteria:**
1. 游戏中实时显示分数、连击与时间
2. 结果页正确展示时间、分数、最大连击、击败比例与称号
3. 每关星级按规则正确计算
4. 点击「关卡 N+1」进入下一关并重置分数

---

### Phase 5: Visual Effects, Animation & Mobile Polish

**Goal:** 还原 PRD 要求的动效与移动端适配细节。

**Mode:** mvp

**Requirements:**
- FX-01: 选牌飞入托盘动画
- FX-02: 匹配成功粒子爆炸、Good/Combo、彩纸飘落
- FX-03: 加分飘字动画
- FX-04: 被锁牌变暗 + 红色箭头提示
- FX-05: 首页装饰呼吸动画与竹叶飘落
- FX-06: 结算动画（金色莲花/祥云、数据逐栏展示、花瓣飘落）
- FX-07: 关卡切换动画
- MOB-02: 单张牌触控区域与顶部按钮触控尺寸
- MOB-03: 安全区适配刘海/挖孔/灵动岛
- MOB-04: 低端机粒子降级与帧率稳定

**Success Criteria:**
1. 选牌、配对、加分、被锁、托盘警告等核心动效可见
2. 首页与结果页装饰动画流畅
3. 关卡切换过渡自然
4. 触控区域与安全区在常见机型上表现正确
5. 中端设备帧率稳定

---

## Evolution

- Roadmap is updated at phase transitions via `/gsd:transition`.
- New requirements discovered during execution are added to REQUIREMENTS.md and mapped to an upcoming phase before work begins.
- If a phase grows too large, split it before execution and update traceability.

---
*Roadmap created: 2026-07-04*
*Last updated: 2026-07-04 after initialization*
