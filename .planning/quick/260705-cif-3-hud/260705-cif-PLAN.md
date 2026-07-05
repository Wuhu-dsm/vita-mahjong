---
status: in-progress
created: 2026-07-05
quick_id: 260705-cif
---

# Quick Task 260705-cif: 修复首页和游戏页视觉缺陷

## Tasks

1. 首页视觉修复
   - 清理头像右侧等级框和设置左侧多余按钮。
   - 将“發”放入独立白色麻将牌容器中。
   - 增加可循环的落叶飘落动画。

2. 首页到游戏的关卡 3 过渡
   - 点击关卡 3 时播放门扇打开动画，再进入游戏页。
   - 防止开门动画期间重复触发开始游戏。

3. 游戏页 HUD 与反馈修复
   - 将 IQ 区域改为“积分”，实时展示当前分数。
   - 移除右上角按钮。
   - 让托盘配对消除的碎裂反馈更明显。
   - 底部助手按钮使用图标和右上角数量 badge，数量来自当前配置，不再显示 Lv.6。

## Verification

- Run unit/build checks that are already available in the repo.
- Run the app locally and validate the home and game flows with the browser path required by the frontend debugging skill.
