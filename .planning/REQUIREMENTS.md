# Requirements: Vita Mahjong

**Defined:** 2026-07-04
**Core Value:** 让玩家在手机上获得放松、直观、无压力的麻将消除体验。

## v1 Requirements

### Home

- [ ] **HOME-01**: 首页展示 Logo、木质胶囊「关卡 N」主入口按钮、右上角设置齿轮、左上角头像/金币占位装饰
- [ ] **HOME-02**: 点击「关卡 N」按钮进入当前最新可玩关卡
- [ ] **HOME-03**: 设置页提供音乐、计时/分数压力等开关入口（本次复刻保留界面，具体功能可选实现）

### Game Core

- [ ] **GAME-01**: 游戏页采用深绿色绒布/桌布质感背景，并显示顶部状态栏（返回按钮、关卡/分数/连击、菜单按钮）
- [ ] **GAME-02**: 顶部状态栏采用「关卡 + 分数 + 匹配（连击）」三字段布局，不展示 IQ
- [ ] **GAME-03**: 游戏页顶部提供 4 槽选牌托盘，点击自由牌后牌从棋盘飞入托盘最左侧空 slot
- [ ] **GAME-04**: 实现自由牌判定：牌顶部无其他牌遮挡，且左侧或右侧至少有一边没有其他牌紧邻遮挡
- [ ] **GAME-05**: 点击非自由牌时，该牌变暗并显示「被左右锁住」提示与左右红色箭头
- [ ] **GAME-06**: 两张图案相同的牌进入托盘后立即配对成功，同时从托盘与棋盘移除
- [ ] **GAME-07**: 棋盘所有牌被清空时判定胜利并进入结果页
- [ ] **GAME-08**: 托盘 4 槽被未配对的牌装满时，弹出「没有空位了」失败弹窗并展示导致失败的 4 张牌
- [ ] **GAME-09**: 失败弹窗提供「复活」（清空托盘继续当前关卡，分数保持）与「重新开始」两个按钮
- [ ] **GAME-10**: 托盘已有 3 张牌时，弹出「小心！别让托盘装满！」警告弹窗

### Levels

- [ ] **LVL-01**: 关卡数据采用配置化 JSON，支持定义主题、层数、牌数、布局、星级目标
- [ ] **LVL-02**: 实现至少 20 关可玩关卡，难度递增，每 3–4 关轮换主题
- [ ] **LVL-03**: 每关初始布局保证可解性（至少存在一条可清空路径），且每种牌数量必须为偶数
- [ ] **LVL-04**: 第 1 关复刻录屏中的十二星座主题、4×6 双层布局
- [ ] **LVL-05**: 第 2 关复刻录屏中的传统麻将主题风格

### Scoring & Rating

- [ ] **SCOR-01**: 游戏页顶部与结果页显示本局累计分数，使用「分数」体系而非 IQ
- [ ] **SCOR-02**: 实现连击系统：连续快速匹配累积 Combo，超过 3 秒未成功匹配或点击非自由牌时中断
- [ ] **SCOR-03**: 实现基础计分：单次匹配得分 = 基础分 100 × (1 + 连击加成) + 终局加成
- [ ] **SCOR-04**: 实现时间奖励：在关卡目标时间内完成时，按剩余秒数给予额外分数
- [ ] **SCOR-05**: 实现三星评级：清空牌面得 1 星，目标时间内完成得 2 星，达成连击目标得 3 星
- [ ] **SCOR-06**: 结果页显示本局用时、最终分数、最大连击数、击败玩家比例
- [ ] **SCOR-07**: 根据最终分数/时间/连击综合表现，动态显示称号/评级（青铜→白银→黄金→铂金→钻石）

### Result Screen

- [ ] **RES-01**: 结果页采用深色背景（深黑/深蓝），顶部彩色祥云/光晕，中央金色莲花/奖杯光芒
- [ ] **RES-02**: 结果页显示横向三列数据面板：时间、分数、最大连击
- [ ] **RES-03**: 结果页显示击败玩家比例与关卡进度/历史最佳关卡
- [ ] **RES-04**: 结果页底部提供绿色胶囊「关卡 N+1」按钮，点击进入下一关并重置分数

### Visual Effects & Animation

- [ ] **FX-01**: 选牌动画：牌从棋盘位置向上平移到托盘，时长约 0.2–0.3 秒，略带弹性缓出
- [ ] **FX-02**: 匹配成功动画：白色方块粒子爆炸、屏幕中央弹出 Good 字样与吉祥物、连击 ≥2 时显示 Combo xN、彩纸/礼花飘落
- [ ] **FX-03**: 加分飘字：分数旁浮现 +x.x，向上淡出，时长约 0.8 秒
- [ ] **FX-04**: 被锁牌反馈：牌变暗，左右红色箭头闪烁提示
- [ ] **FX-05**: 首页装饰动效：Logo/门环轻微呼吸动画、竹叶飘落
- [ ] **FX-06**: 结算动画：金色莲花/祥云浮现，数据逐栏展示，花瓣飘落
- [ ] **FX-07**: 关卡切换动画：棋盘整体淡出/刷新，分数重置

### Mobile Adaptation

- [ ] **MOB-01**: 以 1080×2400 竖屏比例为设计基准，使用相对坐标与锚点布局，牌块大小按屏幕宽度百分比计算
- [ ] **MOB-02**: 单张牌触控区域大于视觉牌面（四周扩展 4–6 px），顶部按钮触控直径 ≥ 64 px
- [ ] **MOB-03**: 顶部预留状态栏安全区，底部预留系统手势区，适配刘海/挖孔/灵动岛
- [ ] **MOB-04**: 低端机可降级粒子效果，保证 30 FPS 稳定，主流手机目标 60 FPS

## v2 Requirements

### Extended Features

- **EXT-01**: 首页关卡地图/列表，方便回顾已通关卡与重玩
- **EXT-02**: 每日挑战 / Active Mind Levels
- **EXT-03**: 音效与震动反馈
- **EXT-04**: 道具系统（Hint / Shuffle / Undo）与金币经济系统
- **EXT-05**: 多人联机、排行榜、账号系统

## Out of Scope

| Feature | Reason |
|---------|--------|
| 道具系统（Hint / Shuffle / Undo） | 本次复刻聚焦核心玩法，降低复杂度 |
| 经济系统（金币、广告、内购、每日奖励） | 保持完全免费、无广告的单机体验 |
| 每日挑战 / Active Mind Levels | 非核心需求，作为后续扩展点预留接口 |
| 音效与震动反馈 | 非核心体验，优先保证视觉与交互 |
| 关卡地图/列表 | 首页仅提供当前关卡入口，后续可扩展 |
| 多人联机、排行榜、账号系统 | 超出本次复刻范围 |
| 后端服务 | 击败比例使用本地模拟分布或预设公式实现 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HOME-01 | Phase 1 | Pending |
| HOME-02 | Phase 1 | Pending |
| HOME-03 | Phase 1 | Pending |
| GAME-01 | Phase 2 | Pending |
| GAME-02 | Phase 2 | Pending |
| GAME-03 | Phase 2 | Pending |
| GAME-04 | Phase 2 | Pending |
| GAME-05 | Phase 2 | Pending |
| GAME-06 | Phase 2 | Pending |
| GAME-07 | Phase 2 | Pending |
| GAME-08 | Phase 2 | Pending |
| GAME-09 | Phase 2 | Pending |
| GAME-10 | Phase 2 | Pending |
| LVL-01 | Phase 3 | Pending |
| LVL-02 | Phase 3 | Pending |
| LVL-03 | Phase 3 | Pending |
| LVL-04 | Phase 3 | Pending |
| LVL-05 | Phase 3 | Pending |
| SCOR-01 | Phase 4 | Pending |
| SCOR-02 | Phase 4 | Pending |
| SCOR-03 | Phase 4 | Pending |
| SCOR-04 | Phase 4 | Pending |
| SCOR-05 | Phase 4 | Pending |
| SCOR-06 | Phase 4 | Pending |
| SCOR-07 | Phase 4 | Pending |
| RES-01 | Phase 5 | Pending |
| RES-02 | Phase 5 | Pending |
| RES-03 | Phase 5 | Pending |
| RES-04 | Phase 5 | Pending |
| FX-01 | Phase 6 | Pending |
| FX-02 | Phase 6 | Pending |
| FX-03 | Phase 6 | Pending |
| FX-04 | Phase 6 | Pending |
| FX-05 | Phase 6 | Pending |
| FX-06 | Phase 6 | Pending |
| FX-07 | Phase 6 | Pending |
| MOB-01 | Phase 7 | Pending |
| MOB-02 | Phase 7 | Pending |
| MOB-03 | Phase 7 | Pending |
| MOB-04 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-04*
*Last updated: 2026-07-04 after initial definition*
