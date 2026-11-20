# CBB Atlas

一个可操作的 **CBB 组件货架与生命周期管理原型**。以 pub.dev 的包检索和版本文档体验为参考，连接使用方、组件维护者和准入评审流程。

[打开原型](https://capilot-flow.github.io/cbb-governance-dashboard/) · [管理工作台](https://capilot-flow.github.io/cbb-governance-dashboard/?view=workspace&area=assets)

![组件货架](preview.png)

## 可以体验什么

- 组件检索、能力分类、技术栈筛选、主版本状态和版本化文档。
- 创建候选组件、准备材料、提交准入评审、退回整改或批准。
- 受控试用、正式发布、登记项目接入、查看使用关系。
- 带版本上下文的问题反馈、处理、修复版本和使用方验证关闭。
- 废弃安排、替代版本、使用方迁移、窗口校验和退役归档。
- 跨团队推广试点、双方投入与验收约定、问题与决策进展。
- 明暗主题、手机和平板布局、JSON 导出与本机演示重置。

## 推荐演示路线

1. 在货架搜索 Path Kernel，查看边界、平台和接入指导。
2. 进入管理工作台的准入评审，核验 2.0.0 申请并留下结论。
3. 在版本发布中确认发布，返回货架选择新版本。
4. 登记使用项目，反馈一个问题，在工作台完成处理和验证。
5. 为 Trace Log 1.x 指定 2.1.0 为替代版本，安排迁移并登记使用方结果。
6. 在页底调整演示日期至窗口结束，再完成退役检查。
7. 也可从新建组件开始完整体验，或在页顶“体验流程”查看提示。

## 数据与运行方式

这是产品交互原型，所有组件、团队、接口及证据均为虚构示例。操作保存在当前浏览器，刷新可保留，页底可导出或重置；不会跨设备同步。构建、企业鉴权、制品分发、真实技术验证和消息通知需要后端服务接入。

零运行时网络依赖，静态托管即可运行。

```sh
python -X utf8 build.py
node --test tests/lifecycle.test.cjs tests/storage.test.cjs
node scripts/test-journeys.cjs
```

浏览器验证需要本机 Chrome 和 Playwright。HTML 是生成产物，修改源文件 src/shelf.template 后重建。代码结构、流程边界和交互约定见 PRODUCT.md、DESIGN.md 与 UX-CONTRACT.md。

## 设计参考

- [pub.dev 包检索](https://pub.dev/help/search)
- [pub.dev 组件详情](https://pub.dev/packages/http)

本项目不是任何公司的内部系统或生产运行案例。
