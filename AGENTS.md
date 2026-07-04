<!-- GSD:project-start source:PROJECT.md -->

## Project

**Vita Mahjong**

Vita Mahjong 是经典 Mahjong Solitaire（麻将连连看 / 麻将消除）的现代移动端复刻版本。面向全年龄段玩家，特别强调老年人、初学者与休闲玩家的友好体验：大牌面、直观触控、清晰视觉、流畅动画，并支持关闭计时/分数压力。项目复刻「首页 → 游戏页 → 结果页」的核心流程，至少支持 20 关，还原录屏中的东方古典美术风格、选牌/匹配/消除动效与结算体系。

**Core Value:** 让玩家在手机上获得放松、直观、无压力的麻将消除体验——即使视力或反应速度下降的用户，也能一眼看清牌面、一键完成操作，并在即时反馈中感受到连击爽感。

### Constraints

- **平台**：移动端优先，竖屏 20:9 比例，以 1080×2400 为设计基准。
- **关卡规模**：至少 20 关可玩，第 20 关最多 128 张牌、7 层堆叠。
- **技术栈**：待实现阶段确定，但须为可构建为手机网页/小游戏或原生 H5 的方案。
- **无后端**：所有逻辑与数据本地运行，击败比例通过本地模拟实现。
- **无商业化**：不得接入广告、内购或金币经济。
- **性能**：同屏最多渲染约 150 个牌面节点，低端机可降级粒子效果。
- **可解性**：每关初始布局必须保证至少存在一条可清空路径，且每种牌数量为偶数。

<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
