# CBB Atlas 交互约定

业务以 PRODUCT.md 为准，视觉以 DESIGN.md 为准。中文界面；模拟日期由 state.today 表达，不随设备时区偏移。

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | 原生 select / selectField | 本文 | 版本、筛选、替代版本，操作系统弹层可接受 | 浏览器流程 |
| Scrollbar | src/shelf.css 全局基线 | DESIGN.md | 文档自然纵向滚动，表格与代码自身横向滚动 | 390/768/1440 视口 |
| Toast | 单一 #status-message | 本文 | 保存、复制和导出结果 | role=status |
| Date | 原生 date / state.today | PRODUCT.md | 演示日期与迁移窗口，原生弹层可接受 | 生命周期日期校验 |
| Dialog | 原生 #modal 与 #confirm-dialog | 本文 | 表单与放弃/重置确认 | Escape、焦点与未保存提示 |

## 路由与查询

view=catalog/component/workspace/guide；组件 id、version、tab 与管理 area 写入 URL。筛选 category/language/status、搜索 q、排序 sort、分页 page 保留在 URL。换筛选重置页码。浏览器前进后退能恢复已提交查询。

搜索显式提交，避免输入中文时提前过滤。窄屏筛选折叠；文档标签和管理导航在自身区域滚动。详情使用独立页面，选择版本后所有文档与操作使用该版本上下文。

## 表单和动作

使用语义化表单、label、button；novalidate 禁用原生校验气泡。应用验证失败时保留输入，表单顶部显示并聚焦可读错误。正常保存后回到所属列表或更新当前详情。主版本状态由 src/model.js 唯一维护。

弹窗使用 showModal / close，Escape 走取消逻辑；有未保存输入时由应用确认是否放弃。重置使用独立确认框，默认取消。不会删除文件、发送消息或修改外部企业系统。

## 本地持久化

src/store.js 统一比较 revision 与 generation 后写入 localStorage。写入失败保留输入，不宣布成功。重置写入新 generation，防止旧标签页覆盖。导出仅含当前原型记录。浏览器记录不在设备间同步。

## 失败与空态

没有搜索结果时可清除筛选或提交能力需求。找不到组件时提供返回货架入口。未发布版本、废弃和退役状态有对应操作限制。缺证据不能提交，缺核验或结论不能通过评审；仍有使用关系或窗口未结束时不能退役。

## 集成边界

示例包配置、API 和证据均标明原型属性。来源记录展示本地示例，不伪造可访问的内部系统链接。构建、制品仓库、身份权限和外部通知留作实际集成。
