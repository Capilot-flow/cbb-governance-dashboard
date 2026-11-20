---
version: alpha
colors:
  primary: "#0B6A73"
  primary-soft: "#E5F1F2"
  bg: "#F3F6F9"
  surface: "#FFFFFF"
  text: "#193344"
  muted: "#5D7180"
  line: "#DCE4EB"
  nav: "#143747"
  success: "#1C7050"
  warning: "#9B5310"
  danger: "#B23543"
typography:
  display:
    fontFamily: "Bahnschrift, 'PingFang SC', 'Microsoft YaHei', sans-serif"
  body:
    fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
  data:
    fontFamily: "'Cascadia Code', 'SFMono-Regular', Consolas, monospace"
rounded:
  control: "8px"
  panel: "14px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button:
    height: "40px"
    rounded: "{rounded.control}"
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
  workspace:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
  sidebar:
    backgroundColor: "{colors.nav}"
    textColor: "{colors.surface}"
  supporting-text:
    textColor: "{colors.muted}"
  divider:
    backgroundColor: "{colors.line}"
  notice:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
  badge-success:
    textColor: "{colors.success}"
  badge-warning:
    textColor: "{colors.warning}"
  badge-danger:
    textColor: "{colors.danger}"
---

## Overview

产品型中文治理工具，面向用人经理与平台 PMO。视觉承接一页方案的蓝绿与深蓝，不使用企业品牌标识。以可点击的“提供 BG × 消费 BG”矩阵作为唯一突出记忆点；图表服务于验证采用，不用装饰性增长曲线。

对比过纯展示长图、重型 BI 和静态交互应用，选择静态交互应用：易分享、可解释计算、无服务端依赖。用户已指定 GitHub Pages，页面与模拟数据范围已在前序四块方案中确定，常规布局与技术选择由实现者落实。

## Colors

此文档是颜色 token 唯一来源。build.py 从 frontmatter colors 生成 assets/tokens.css；src/styles.css 仅消费语义变量。primary 控制动作及有效采用，warning 指缺口，danger 指逾期，不用颜色单独表达状态。BG 不以品牌颜色编码。

## Typography

标题使用系统 Bahnschrift 与中文回退，正文系统无衬线，数字使用等宽字体。无需联网加载字体。正文桌面 14px，移动 14px；表格与说明桌面 12px，手机紧凑辅助说明最低 11px；非叙述性编号与品牌小标允许 10px。表头与数字保持清晰层级。

## Layout

桌面 212px 导航 + 弹性内容；总览为三项指标、采用矩阵与优先治理事项。资产/关系/事项共享工具栏和分页表。1000px 以下导航横向排列；650px 以下指标单列或紧凑排列，矩阵和语义表在自身容器横向滚动，整页不溢出。

## Elevation & Depth

静态面板使用 1px 分隔与极浅投影，弹窗置于原生 dialog 顶层。不给每个数字制作独立装饰卡。模拟数据标识常驻顶栏。

## Shapes

面板 14px、控件 8px，避免大面积药丸和无意义徽章。数字表使用规整对齐。

## Components

共享的 button、badge、metric、toolbar、table、pagination、dialog、status-message 由 src/app.js 和 src/styles.css 统一拥有。主题 token 通过自动生成的 CSS 直接映射，无第二套主题。

## Do's and Don'ts

始终明确虚构范围、统计批次和证据边界；优先展示分子分母和记录入口；所有看似可点击的控件有真实行为；尊重 reduced-motion、键盘与触摸。避免伪实时、假动态指标、伪造外部证据链接和暗示真实公司业绩。
