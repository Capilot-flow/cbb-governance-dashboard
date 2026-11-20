# 交互与行为约定

业务来源：PRODUCT.md。视觉来源：DESIGN.md。所有内容 zh-CN，日期按固定快照及日期字符串处理，不发生时区偏移。

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | 原生 select | 本文 | BG、月份、局部状态；接受操作系统弹层 | 浏览器键盘与窄屏 |
| Scrollbar | src/styles.css 全局基线 | DESIGN.md | 表容器仅决定横向滚动 | computed style |
| Toast | 共享 #status-message live region | 本文 | 下载提示 | 浏览器导出 |
| Date | 固定快照与原生月份选项 | PRODUCT.md | 不提供自由日期输入 | 单元测试 |

## 状态与导航

- 四个导航视图使用真实链接，客户端渐进增强。view、bg、consumer、q、status、page、sort 写入 URL；切换筛选重置页码；浏览器前进后退恢复状态。
- 搜索只在本地运行，IME 组合输入期间不提交；完成后筛选。非空时显示有可访问名称的清除按钮，清除后恢复输入焦点。
- 共享语义 table；每页 10 条，显式上一页/下一页及数量；排序按钮更新 aria-sort。表格有独立横向滚动容器，文档负责纵向滚动。
- BG 为供给范围；消费 BG 是采用视图局部筛选。概览矩阵单元点击进入相应供需对的采用明细。
- 资产详情和口径说明使用原生 dialog，具有标题、关闭按钮、Escape、焦点隔离和关闭后焦点恢复。长内容在弹窗内滚动；不使用 alert/confirm/prompt。
- 导出 CSV 为当前视图筛选全量而不是当前页，文件含 BOM、模拟数据标识与稳定 ID；JSON 是完整合成数据。只读操作，不写后台或存储个人数据。
- 当前筛选无记录时展示明确空态与重置动作，不伪造数据。零分母显示“—”。无 JavaScript 提供说明；脚本失败时提供刷新引导。固定数据无异步请求、远程搜索、登录或服务器写入。

## 一致性与反馈

所有导航、工具栏、按钮、状态标签、分页、空态共享实现。导出成功在固定 live region 提示，不改变按钮尺寸。无实质 CRUD、破坏性操作、认证与权限变更，相关能力不适用。

## Business-source traceability

PRODUCT.md 的统计边界由 src/metrics.js 唯一实现，所有视图读取该结果；data/mock.json 仅为合成数值源。模拟状态与错误边界以 tests/metrics.test.cjs 和 scripts/test-browser.cjs 核验。
