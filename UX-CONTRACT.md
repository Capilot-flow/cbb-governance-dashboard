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
| Segmented | `.segmented` 链接组 | 本文 | 依赖图的上游/下游切换，必须写入 URL | 前进后退可恢复方向 |
| Dependency graph | `#dep-graph` 由 src/deps.js 独占 | PRODUCT.md | 紧凑树布局；窄屏只展开一层 | 节点文字不裁切、点击节点可跳转、G6 缺失时回退文字清单 |

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


## 复用与维护扩展

src/governance.js 是使用、响应、维护信号、版本依赖和复审命令的唯一共享 owner；src/feedback-ui.js 复用 shelf.js 的表单、表格、弹窗、持久化和错误组件。统一 command 入口不绕过存储防冲突。

筛选统一使用大热区 radio 和 details 折叠；排序和页大小为原生 select。scenario/productLine/team/discover/pageSize 也入 URL。收藏按演示身份区分。货架和详情同时显示全部版本与当前版本使用数。图表按钮调用 CBB_DEPS.control，主题切换重建画布，延迟加载已离开的画布不得重新挂载。

维护信号必须能打开带负责人及期限的复审；试点关联原记录，关闭要检查使用证据。保留必须有理由及下次复审日期。贡献方案只接受 HTTPS。依赖只能改草稿，修改后制品及测试须重验。演示身份切换明确区别真实登录；命令层校验权限，错误保留输入。新增流程验证由 scripts/test-feedback-browser.cjs 承接。

复审按去重项目身份验证新增复用，不以新增 USE 行冒充成果。重复保存试点更新同一活跃记录；转向保留、核实或收敛会中止原试点并记录原因。关闭问题或验证失败需使用方代表，受理及交验证需维护负责人，审计展示所选身份的真实角色。所有仍可接入的已发布版本以及有活跃项目的已废弃版本都能阻塞其依赖退役。领域图遍历不受图形展示层数限制。


## Quick interaction owners

| Capability | Canonical owner | Behavior | Evidence |
|---|---|---|---|
| Command palette | experience.js / #experience-dialog.xp-palette | Ctrl/Command K, Arrow navigation, Enter, IME-safe filtering, Escape and focus restore | scripts/test-experience-browser.cjs |
| Component preview drawer | Same #experience-dialog.xp-preview native modal | Facts from experience-model.js shared governance selectors; close before shared navigation | scripts/test-experience-browser.cjs |
| Hero relationship map | experience-model.js network / experience.js hero | Exact recommended snapshot edges; pointer and focus highlights; ordinary version links | tests/experience.test.cjs |
| Motion | experience.css shared tokens | 160/260ms, 300ms drawer; reduced-motion disables movement | browser reduced-motion checks |
| Query clear and active filters | experience.js action → existing navigate | Clear one parameter and reset page; preserve remaining filters; return search focus | browser URL checks |

Existing #modal / #confirm-dialog form and confirmation ownership is unchanged. A pending modal form blocks the command shortcut. Preview and palette contain no mutations, do not persist a second copy of component state, and never shadow unsaved form input. Search Enter submission keeps its existing catalogue behavior. All dynamically inserted buttons route through the one CBB_UI command handler; native modal focus and Escape are explicitly restored. Palette empty state is non-actionable, not a fake suggestion. No server or identity behavior is added.


Final review corrections: preview receives both id and version from the catalogue row; palette input owns Arrow/Enter logic while other buttons retain native Enter activation. Browser forward/back restores the displayed history entry before asking whether to abandon unsaved input; cancel keeps route, form and values. Unknown legacy history entries use URL restoration before a confirmed replace navigation. The short captioned demo is a regular MP4 link in guide/footer and uses the browser's video controls.
