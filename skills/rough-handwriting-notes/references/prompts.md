# 提示词模板

按当前编辑工具的接口传入图片；以下是提示词正文，不是固定 API 参数。替换方括号内的任务变量，不把未替换变量传给工具。

## 初次重绘

```text
Input 1 is the edit target. [Optional Input 2 is a STYLE reference only;
do not copy its content.]

Edit the target into a black-background, white-handwritten note.
Remove screenshot interface chrome while retaining all note content.
[Keep its existing arrangement / Reorganize into the following reading order: …]

Writing should look like a primary-school student's clumsy handwriting,
not beautiful calligraphy, a cute handwritten font, or polished chalkboard art.
Independently vary character height, width, slant, baseline and spacing.
Use unbalanced character components, awkward short strokes and uneven pressure.
Diagrams should have wonky freehand circles and shaky arrows;
table lines should look drawn without a ruler.
Keep all writing readable. Solid black background, white strokes only.

Preserve every character, set element, subscript, table cell, check/cross,
node label, node count, accepting double circle, edge direction and label.
Do not solve or correct the exercise. Do not add missing transitions.
No duplicate nodes, new explanations, decorations or cropped content.

[Exact transcription of ambiguous content, if needed: …]
Return one complete page.
```

## 用户反馈“太美了，再丑一点”

这是提高不规整程度，不是降低分辨率或把笔迹糊掉。

```text
The existing page looks too beautiful. Make its handwriting visibly uglier,
more awkward and uneven, like rushed student rough work.
Keep the existing layout and every piece of content exactly.

Make letters vary independently in height, width, slant and baseline.
Some spacing may be cramped and some loose, but preserve table-cell membership.
Use blunt, awkward strokes and unbalanced character components.
Circles may be misshapen, and arrows and ruling may waver.
Do not merely apply identical jitter to otherwise perfect typography.
Avoid smooth consistent rounded lettering, cute styling and calligraphy.

Keep every subscript and edge label legible.
Double circles must remain double. Arrowheads must remain present and point
to the exact original destination. Preserve every node exactly once.
No crossed-out answers, invented scribbles, blur, new nodes or extra edges.
Black background and white writing remain unchanged.
```

## 只修一个地方

```text
Edit only [precise page region/object].
Current error: [observable difference from source].
Required edit: [one exact addition/removal/replacement].
Preserve every other character, table, node, label, line and layout element.
Keep the current awkward handwriting; do not beautify or re-layout the page.
```

可复用的局部修复表达：

- “在下方 DFA 中，为 q₁ 添加第二条不规则内圈；q₀、q₂ 的圈数不变。”
- “补上 q₅ 下方自环的标签 1；不改变该边或相邻回边。”
- “删除重复的状态 8，并将原来进入重复节点的 ε 边连到保留的状态 8；其余图不动。”
- “删除回边右端的多余箭头尖，保留指向左端状态的箭头尖；不删除整条曲线。”
- “只删除该边下方重复的 ε；保留上方那个 ε。”

这些是修复模板，不应在不存在相应错误时自动执行。
