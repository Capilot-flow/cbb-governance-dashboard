---
version: alpha
colors:
  primary: "#0868C9"
  primary-soft: "#EAF5FF"
  bg: "#F5F7F9"
  surface: "#FFFFFF"
  text: "#253746"
  muted: "#647584"
  line: "#DFE5EA"
  nav: "#182C3D"
  success: "#1C7050"
  warning: "#9B5310"
  danger: "#B23543"
typography:
  display:
    fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
  body:
    fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
  data:
    fontFamily: "'Cascadia Code', 'SFMono-Regular', Consolas, monospace"
rounded:
  control: "4px"
  panel: "3px"
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

中文 CBB 货架与全生命周期管理原型。用户明确要求参照 pub.dev 的社区式包货架：深蓝顶部、醒目的搜索、白色正文、左侧筛选、文字主导的组件行、标签和版本化文档。面向开发者、维护者和评审方；面试展示通过真实可操作的工作流完成。默认页面是货架，无 KPI 看板、指标口径面板或营销式大数字。

使用现有静态站点与 GitHub Pages。管理视图和使用视图共享领域模型与浏览器本地状态。组件主版本的生命周期轨迹是跨页的一致视觉元素，工作台保留必要的阶段计数，取消原先治理指标的视觉中心地位。

## Colors

此文档是基础颜色 token 唯一来源，build.py 生成 assets/tokens.css，shelf.css 与 workspace.css 消费语义变量。蓝色表示链接与主操作，绿色表示可用或完成，橙色表示候选及废弃风险。状态始终有文字。深色主题为 shelf.css 中统一的语义覆盖；不使用外部字体、企业 logo 或品牌配色。

## Typography

系统 Segoe UI 与中文回退，正文 14–15px，组件名 22px，详情标题 34px。代码、版本来源与审计日期使用等宽字体。常规标签和辅助文字 11–13px；短平台标签允许 10px。标题采用常规字重，强调信息层次而不是粗体和装饰。

## Layout

货架：1190px 居中内容，186px 左筛选 + 弹性组件列表。详情：正文 + 218px 元信息栏。管理：200px 左导航 + 工作内容。700px 以下筛选折叠、管理导航横向滚动、详情侧栏移到正文后。表格在自身容器滚动。工作台 CSS 首次进入时按需加载。

## Elevation & Depth

主要依赖分隔线和留白，不把每个区域做成卡片。搜索采用圆角输入带；其余控件轻微圆角。原型说明在页尾及指南中可达；普通界面不重复方法论说明。dialog 顶层和 toast 使用有限阴影。

## Shapes

面板 3px、控件 4px。组件平台使用小型方形标签。只有搜索使用明显圆角，以承接 pub.dev 的搜索入口特征。

## Components

共享 button、badge、table、pagination、dialog、form-error、toast、code-block、lifecycle-stepper 由 src/shelf.js 和 src/shelf.css 拥有；管理布局由 src/workspace.css 增量负责。所有流程使用同一领域状态与动作。主题偏好仅保存本机。

## Do's and Don'ts

可操作流程优先于解释性文案；以组件和版本为主线。尊重 reduced-motion、键盘和触摸。公开数据均虚构；不发布内部文档原文、网络地址、联系人或面试实录。不把本地模拟状态当成真实 CI、企业鉴权或生产执行结果。
