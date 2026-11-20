# CBB Atlas

一个可操作的 CBB 组件货架与治理原型，以 pub.dev 的检索、包列表和版本文档体验为参考，连接资产发现、接入与持续维护。

[打开货架](https://capilot-flow.github.io/cbb-governance-dashboard/?v=4) · [维护复审](https://capilot-flow.github.io/cbb-governance-dashboard/?view=workspace&area=health) · [版本依赖图](https://capilot-flow.github.io/cbb-governance-dashboard/?view=component&id=path-kernel&version=1.8.2&tab=deps)

![组件货架](preview.png)

## 推荐体验

1. 在货架按业务场景找 Path Kernel，看跨团队使用证据、全部版本及当前版本项目数；收藏或查看相近能力。
2. 在「依赖关系」缩放、拖动、点击节点，切换「谁会受影响」，查看具体版本和潜在项目。
3. 找到 Frame View 的维护与复用信号，发起复审，指定负责人和期限，记录试点，登记使用后验证效果。尚未解决的支持问题继续保留。
4. 准入评审时把顶部演示身份切到陈岚，逐项核验 2.0.0；切回林沐发布。也可从项目重复实现出发新建候选组件，走完整准入至退役流程。
5. 在草稿版本管理依赖，试试循环依赖和已发布快照限制；通过问题入口提出接口需求或附已有 PR 链接。
6. 使用「规模演示」载入 320 个合成组件，检验动态筛选与分页；页底可重置。

支持维护确认、响应事实、问题严重级别与影响、具名审计、试点承诺、维护估算、收敛评估及迁移退役。零直接登记不等于无人使用；老版本也可能仍被持续维护。策略和产品边界见 PRODUCT.md。

## 本地构建与验证

```sh
python -X utf8 build.py
node --test tests/lifecycle.test.cjs tests/storage.test.cjs tests/feedback.test.cjs
node scripts/test-journeys.cjs
node scripts/test-feedback-browser.cjs
```

浏览器验证需要 Chrome 与 Playwright。HTML 是产物，修改 src 源文件再构建。交互和视觉约定见 UX-CONTRACT.md、DESIGN.md。G6 随仓库提供，首次打开依赖页时本地加载；无 CDN 运行依赖。

所有数据、人员、项目与证据虚构，操作仅保存在当前浏览器，不跨设备同步。真实鉴权、构建、制品和消息仍需服务集成。新版保留已有演示记录；想看新版初始样例可先导出再重置。

## 参考

- [pub.dev 检索](https://pub.dev/help/search)
- [pub.dev 组件详情](https://pub.dev/packages/http)
- [AntV G6 紧凑树](https://g6.antv.antgroup.com/zh/examples/layout/compact-box/basic/)

本项目用于产品方案验证，不是任何公司的生产案例。
