# Vita Mahjong 牌面图案生成 Prompts

> 生成工具：OpenAI Image 2 / DALL-E 3
> 尺寸建议：512×512 或 1024×1024 正方形，白底，便于程序裁剪为圆角矩形牌面
> 风格：白色背景上的扁平彩色剪影/图标，色彩饱和，老年友好

## 通用牌面风格基线

所有牌面图案共享以下视觉规范：

```
Style baseline for all tile icons:
- Square white/cream background (#F8F8F8)
- Single central symbolic icon or character
- Flat vector-like illustration with slight Eastern decorative flair
- Bold saturated colors: red, blue, green, teal
- Clean readable silhouette, no gradients, no shadows
- Small matching zodiac/symbol glyph at bottom center (optional)
- Centered composition with generous padding
- High contrast against white background
- Suitable for mobile game mahjong tile at small sizes
```

**通用 Negative Prompt**：
```
text other than symbol, watermark, frame, border, shadow, gradient, 3d render, photorealistic, blurry, low resolution, multiple objects, background other than white
```

---

## 1. 十二星座主题 (Zodiac)

**主题风格**：神话风格扁平剪影，每张牌一个星座动物/人物，下方配星座符号。

| 牌面 | 主图案 | 颜色 | Prompt |
|------|--------|------|--------|
| 白羊座 | 公羊侧面剪影 | 红色 | Aries zodiac sign tile icon: stylized side profile of a ram with curved horns, flat red silhouette on white square background, small Aries ♈ glyph at bottom, clean vector game art |
| 金牛座 | 公牛正面/侧面 | 蓝色 | Taurus zodiac sign tile icon: stylized bull with strong horns, flat blue silhouette on white square background, small Taurus ♉ glyph at bottom, clean vector game art |
| 双子座 | 双生子/双人剪影 | 绿色 | Gemini zodiac sign tile icon: stylized twin figures side by side, flat green silhouette on white square background, small Gemini ♊ glyph at bottom, clean vector game art |
| 巨蟹座 | 螃蟹 | 红色 | Cancer zodiac sign tile icon: stylized crab with claws, flat red silhouette on white square background, small Cancer ♋ glyph at bottom, clean vector game art |
| 狮子座 | 狮子侧面 | 红色 | Leo zodiac sign tile icon: stylized majestic lion side profile, flat red silhouette on white square background, small Leo ♌ glyph at bottom, clean vector game art |
| 处女座 | 持麦穗少女 | 绿色 | Virgo zodiac sign tile icon: stylized maiden holding wheat, flat green silhouette on white square background, small Virgo ♍ glyph at bottom, clean vector game art |
| 天秤座 | 天平 | 蓝色 | Libra zodiac sign tile icon: stylized balanced scales, flat blue silhouette on white square background, small Libra ♎ glyph at bottom, clean vector game art |
| 天蝎座 | 蝎子 | 绿色 | Scorpio zodiac sign tile icon: stylized scorpion with raised tail, flat green silhouette on white square background, small Scorpio ♏ glyph at bottom, clean vector game art |
| 射手座 | 半人马射箭 | 蓝色 | Sagittarius zodiac sign tile icon: stylized centaur archer aiming bow, flat blue silhouette on white square background, small Sagittarius ♐ glyph at bottom, clean vector game art |
| 摩羯座 | 山羊鱼尾 | 蓝色 | Capricorn zodiac sign tile icon: stylized sea-goat with curved horns, flat blue silhouette on white square background, small Capricorn ♑ glyph at bottom, clean vector game art |
| 水瓶座 | 倒水瓶/水波 | 蓝色 | Aquarius zodiac sign tile icon: stylized water bearer pouring waves, flat blue silhouette on white square background, small Aquarius ♒ glyph at bottom, clean vector game art |
| 双鱼座 | 两条鱼 | 红色 | Pisces zodiac sign tile icon: stylized two fish swimming opposite directions, flat red silhouette on white square background, small Pisces ♓ glyph at bottom, clean vector game art |

---

## 2. 传统麻将主题 (Mahjong)

**主题风格**：经典麻将牌面，简洁符号，红/蓝/绿/黑配色。

| 牌面 | 颜色 | Prompt |
|------|------|--------|
| 一筒 | 红色 | Mahjong tile icon: single red circle (one dot/bamboo circle) centered on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 二筒 | 红色 | Mahjong tile icon: two red circles arranged diagonally on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 三筒 | 红色 | Mahjong tile icon: three red circles in triangle on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 四筒 | 红色 | Mahjong tile icon: four red circles in square formation on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 五筒 | 红色 | Mahjong tile icon: five red circles (center + four corners) on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 六筒 | 红色 | Mahjong tile icon: six red circles in two rows of three on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 七筒 | 红色 | Mahjong tile icon: seven red circles (4+3 arrangement) on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 八筒 | 红色 | Mahjong tile icon: eight red circles in 3-2-3 arrangement on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 九筒 | 红色 | Mahjong tile icon: nine red circles in 3x3 grid on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 一条 | 绿色 | Mahjong tile icon: single green bamboo stick with leaves, centered on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 二条 | 绿色 | Mahjong tile icon: two green bamboo sticks crossed on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 三条 | 绿色 | Mahjong tile icon: three green bamboo sticks on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 四条 | 绿色 | Mahjong tile icon: four green bamboo sticks on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 五条 | 绿色 | Mahjong tile icon: five green bamboo sticks on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 六条 | 绿色 | Mahjong tile icon: six green bamboo sticks on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 七条 | 绿色 | Mahjong tile icon: seven green bamboo sticks on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 八条 | 绿色 | Mahjong tile icon: eight green bamboo sticks on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 九条 | 绿色 | Mahjong tile icon: nine green bamboo sticks on white square background, traditional Chinese mahjong style, clean flat vector game art |
| 一万 | 蓝色 | Mahjong tile icon: Chinese character "一萬" in blue traditional calligraphy on white square background, clean flat vector game art |
| 二万 | 蓝色 | Mahjong tile icon: Chinese character "二萬" in blue traditional calligraphy on white square background, clean flat vector game art |
| 三万 | 蓝色 | Mahjong tile icon: Chinese character "三萬" in blue traditional calligraphy on white square background, clean flat vector game art |
| 四万 | 蓝色 | Mahjong tile icon: Chinese character "四萬" in blue traditional calligraphy on white square background, clean flat vector game art |
| 五万 | 蓝色 | Mahjong tile icon: Chinese character "五萬" in blue traditional calligraphy on white square background, clean flat vector game art |
| 六万 | 蓝色 | Mahjong tile icon: Chinese character "六萬" in blue traditional calligraphy on white square background, clean flat vector game art |
| 七万 | 蓝色 | Mahjong tile icon: Chinese character "七萬" in blue traditional calligraphy on white square background, clean flat vector game art |
| 八万 | 蓝色 | Mahjong tile icon: Chinese character "八萬" in blue traditional calligraphy on white square background, clean flat vector game art |
| 九万 | 蓝色 | Mahjong tile icon: Chinese character "九萬" in blue traditional calligraphy on white square background, clean flat vector game art |
| 红中 | 红色 | Mahjong tile icon: Chinese character "中" in red traditional calligraphy on white square background, dragon tile style, clean flat vector game art |
| 发财 | 绿色 | Mahjong tile icon: Chinese character "發" in green traditional calligraphy on white square background, green dragon tile style, clean flat vector game art |
| 白板 | 蓝色 | Mahjong tile icon: blank white tile with blue rectangular frame, traditional Chinese mahjong style, clean flat vector game art |
| 东风 | 蓝色 | Mahjong tile icon: Chinese character "東" in blue traditional calligraphy on white square background, wind tile style, clean flat vector game art |
| 南风 | 绿色 | Mahjong tile icon: Chinese character "南" in green traditional calligraphy on white square background, wind tile style, clean flat vector game art |
| 西风 | 绿色 | Mahjong tile icon: Chinese character "西" in green traditional calligraphy on white square background, wind tile style, clean flat vector game art |
| 北风 | 蓝色 | Mahjong tile icon: Chinese character "北" in blue traditional calligraphy on white square background, wind tile style, clean flat vector game art |

---

## 3. 动物主题 (Animals)

| 牌面 | 颜色 | Prompt |
|------|------|--------|
| 猫 | 蓝色 | Cute stylized cat sitting, flat blue silhouette on white square background, simple clean vector game art, Eastern decorative style |
| 鱼 | 红色 | Stylized koi fish swimming, flat red silhouette on white square background, simple clean vector game art, Eastern decorative style |
| 螃蟹 | 绿色 | Stylized crab with claws, flat green silhouette on white square background, simple clean vector game art, Eastern decorative style |
| 蝎子 | 绿色 | Stylized scorpion with tail raised, flat green silhouette on white square background, simple clean vector game art, Eastern decorative style |
| 鸟 | 红色 | Stylized bird in flight, flat red silhouette on white square background, simple clean vector game art, Eastern decorative style |
| 蝴蝶 | 蓝色 | Stylized butterfly with spread wings, flat blue silhouette on white square background, simple clean vector game art, Eastern decorative style |

---

## 4. 东方元素主题 (Oriental)

| 牌面 | 颜色 | Prompt |
|------|------|--------|
| 竹子 | 绿色 | Stylized bamboo stalk with leaves, flat green silhouette on white square background, simple clean vector game art |
| 莲花 | 红色 | Stylized lotus flower blooming, flat red silhouette on white square background, simple clean vector game art, Eastern style |
| 祥云 | 蓝色 | Stylized auspicious cloud curl, flat blue silhouette on white square background, simple clean vector game art, Chinese cloud pattern |
| 太极 | 蓝绿 | Yin yang tai chi symbol, flat blue and green on white square background, simple clean vector game art |
| 灯笼 | 红色 | Stylized Chinese red lantern, flat red silhouette on white square background, simple clean vector game art |
| 扇子 | 红色 | Stylized folding hand fan, flat red silhouette on white square background, simple clean vector game art, Eastern style |

---

## 5. 十二生肖主题 (Chinese Zodiac)

| 牌面 | 颜色 | Prompt |
|------|------|--------|
| 鼠 | 蓝色 | Chinese zodiac rat tile icon, stylized cute rat, flat blue silhouette on white square background, clean vector game art |
| 牛 | 红色 | Chinese zodiac ox tile icon, stylized strong ox, flat red silhouette on white square background, clean vector game art |
| 虎 | 绿色 | Chinese zodiac tiger tile icon, stylized tiger head, flat green silhouette on white square background, clean vector game art |
| 兔 | 蓝色 | Chinese zodiac rabbit tile icon, stylized sitting rabbit, flat blue silhouette on white square background, clean vector game art |
| 龙 | 红色 | Chinese zodiac dragon tile icon, stylized dragon, flat red silhouette on white square background, clean vector game art |
| 蛇 | 绿色 | Chinese zodiac snake tile icon, stylized coiled snake, flat green silhouette on white square background, clean vector game art |
| 马 | 蓝色 | Chinese zodiac horse tile icon, stylized galloping horse, flat blue silhouette on white square background, clean vector game art |
| 羊 | 红色 | Chinese zodiac goat tile icon, stylized goat, flat red silhouette on white square background, clean vector game art |
| 猴 | 绿色 | Chinese zodiac monkey tile icon, stylized monkey, flat green silhouette on white square background, clean vector game art |
| 鸡 | 蓝色 | Chinese zodiac rooster tile icon, stylized rooster, flat blue silhouette on white square background, clean vector game art |
| 狗 | 红色 | Chinese zodiac dog tile icon, stylized sitting dog, flat red silhouette on white square background, clean vector game art |
| 猪 | 蓝色 | Chinese zodiac pig tile icon, stylized pig, flat blue silhouette on white square background, clean vector game art |

---

## 6. 神话符号主题 (Mythology)

| 牌面 | 颜色 | Prompt |
|------|------|--------|
| 龙 | 红色 | Chinese dragon tile icon, stylized dragon in S-curve, flat red silhouette on white square background, clean vector game art |
| 凤 | 红色 | Chinese phoenix tile icon, stylized phoenix with flowing tail, flat red silhouette on white square background, clean vector game art |
| 麒麟 | 蓝色 | Chinese qilin tile icon, stylized mythical hooved creature, flat blue silhouette on white square background, clean vector game art |
| 八卦 | 黑色 | Bagua trigram symbol, flat black and white on white square background, simple clean vector game art |
| 如意 | 金色 | Chinese ruyi scepter, flat golden silhouette on white square background, simple clean vector game art |

---

## 7. 季节主题 (Seasons)

| 牌面 | 颜色 | Prompt |
|------|------|--------|
| 春 | 绿色 | Chinese character "春" (spring) with cherry blossom branch, flat green silhouette on white square background, clean vector game art |
| 夏 | 红色 | Chinese character "夏" (summer) with sun and waves, flat red silhouette on white square background, clean vector game art |
| 秋 | 橙色 | Chinese character "秋" (autumn) with maple leaf, flat orange silhouette on white square background, clean vector game art |
| 冬 | 蓝色 | Chinese character "冬" (winter) with snowflake, flat blue silhouette on white square background, clean vector game art |
| 花 | 粉色 | Stylized blooming flower, flat pink silhouette on white square background, clean vector game art |
| 果实 | 橙色 | Stylized fruit branch with round fruits, flat orange silhouette on white square background, clean vector game art |
