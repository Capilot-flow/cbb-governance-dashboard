"""Generate fictional CBB packages and workflow records, never private source text."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
def version(number, status='Published', phase='Released', released=True, missing=False):
    return dict(number=number,phase=phase,released=released,date='2026-11-12',tag='v'+number,
        commit='demo-'+number.replace('.','')+'-7ac4',build='BUILD-'+number.replace('.',''),
        artifact='package-'+number+'.zip',notes='完善异常处理；补充接入示例和版本兼容说明。',
        platforms=['Windows x64','Linux x64'],compiler='MSVC 2022 / GCC 12',runtime='Release · C++17',
        evidence={k:not missing for k in ['scope','api','package','guide','tests','validation','owner','changelog']})

items=[
 ('path-kernel','Path Kernel','二维路径运算库','几何算法','C++','基础算法组','轮廓偏移、相交判断与路径简化，支持批量计算。',
  ['二维闭合轮廓的布尔运算、偏移和简化','输入带单位的点集，返回轮廓与错误码','适用于桌面路径编辑和离线计算'],
  ['不提供图形渲染、三维建模和运动控制','不保证自交输入的自动修复'],[('1.8.2','Published','Released',True),('2.0.0','Candidate','Review',False)]),
 ('device-link','Device Link','设备连接 SDK','设备接入','C++','设备平台组','统一连接、重连和事件订阅，隔离设备协议差异。',
  ['TCP 连接管理和有界重试','设备状态事件和心跳订阅','面向可容忍网络抖动的上位机应用'],
  ['不承担安全联锁和硬实时控制','串口适配尚在验证'],[('0.9.0','Trial','Released',True)]),
 ('trace-log','Trace Log','结构化日志组件','平台基础','C++','基础平台组','记录结构化事件，统一上下文、滚动文件与故障定位。',
  ['结构化事件、上下文关联与滚动文件','异步写入和异常退出前刷新','Windows 与 Linux 桌面应用'],
  ['不提供日志服务器或告警规则引擎','不保证断电场景零丢失'],[('2.1.0','Published','Released',True),('1.3.0','Published','Released',True)]),
 ('config-kit','Config Kit','配置读写与校验','数据处理','C++','基础平台组','提供带 Schema 的配置加载、校验与分层覆盖。',
  ['JSON 配置校验与默认值填充','只读快照和原子替换','可选环境配置覆盖'],
  ['不管理密钥和访问凭据','不提供配置中心服务'],[('1.4.0','Published','Released',True)]),
 ('frame-view','Frame View','图像帧预览组件','交互界面','TypeScript','交互平台组','面向检测工具的图像帧预览、缩放与标记叠加。',
  ['图像缩放、平移和标记叠加','支持只读结果回放','浏览器与内嵌 WebView'],
  ['不包含图像识别算法','不提供相机采集驱动'],[('1.2.1','Published','Released',True)]),
 ('signal-bus','Signal Bus','进程内事件总线','平台基础','C++','系统架构组','为模块提供类型化事件订阅，减少业务模块直接耦合。',
  ['进程内类型化事件分发','订阅生命周期与退订管理','面向同一运行时的插件'],
  ['不提供跨进程通信','不保证事件持久化'],[('0.1.0','Candidate','Draft',False)]),
 ('legacy-codec','Legacy Codec','旧格式数据转换','数据处理','C++','数据平台组','将历史数据转换为统一结构，供存量工程迁移。',
  ['读取历史 v1 格式并校验','输出统一字段结构'],['不支持新增格式','新项目使用 Config Kit'],[('1.0.0','Deprecated','Released',True)]),
 ('timer-base','Timer Base','旧任务定时器','平台基础','C++','基础平台组','历史单线程调度能力，仅保留版本与迁移记录。',
  ['历史单线程定时调度'],['已停止支持；禁止新增依赖'],[('1.0.0','Retired','Released',True)])
]
components=[]
for i,(slug,name,subtitle,category,language,owner,summary,scope,exclusions,versions) in enumerate(items):
    c=dict(id=slug,name=name,subtitle=subtitle,category=category,language=language,owner=owner,
        maintainer=owner+'维护小组',summary=summary,scope=scope,exclusions=exclusions,
        input='结构化参数及调用上下文',output='结果对象与明确的错误码',
        repository='demo://source/'+slug,dependencies=['标准运行库'] if i else ['Config Kit 1.4.0'],
        versions=[],lines={},tags=[category,language],created='2026-08-12')
    for number,status,phase,released in versions:
        v=version(number,status,phase,released,missing=slug=='signal-bus')
        if status=='Trial':v.update(released=False,phase='Approved',trialReady=True)
        if language=='TypeScript':v.update(platforms=['Web','WebView'],compiler='TypeScript 5',runtime='ES2022')
        c['versions'].append(v);c['lines'][number.split('.')[0]]=dict(status=status)
    if slug in ['legacy-codec','timer-base']:
        c['lines']['1']['migration']=dict(replacement='config-kit@1.4.0' if slug=='legacy-codec' else 'trace-log@2.1.0',deadline='2026-11-01',guide='按替代组件的接入示例调整初始化和异常处理，并执行回归验证。')
    components.append(c)
data=dict(schema=2,revision=0,today='2026-11-20',meta=dict(isMock=True,description='Fictional lifecycle prototype, browser-local edits.'),components=components,
 reviews=[dict(id='REV-001',component='path-kernel',version='2.0.0',status='待评审',note='',checks=[]),dict(id='REV-002',component='device-link',version='0.9.0',status='已通过',note='通过受控试用准入，等待试点验证与正式发布。',checks=['scope','api','package','guide','tests','validation','owner','changelog'])],
 uses=[dict(id='USE-001',component='path-kernel',version='1.8.2',project='轮廓编辑器',projectVersion='3.2',team='应用一组',stage='正式使用',active=True,date='2026-10-12'),
       dict(id='USE-002',component='path-kernel',version='1.8.2',project='批量计算工具',projectVersion='1.6',team='应用二组',stage='正式使用',active=True,date='2026-10-21'),
       dict(id='USE-003',component='trace-log',version='1.3.0',project='设备诊断台',projectVersion='2.4',team='设备应用组',stage='正式使用',active=True,date='2026-09-20'),
       dict(id='USE-004',component='device-link',version='0.9.0',project='设备调试器',projectVersion='0.8',team='设备应用组',stage='试点',active=True,date='2026-11-10'),
       dict(id='USE-005',component='legacy-codec',version='1.0.0',project='旧工程迁移工具',projectVersion='1.0',team='数据应用组',stage='正式使用',active=True,date='2026-08-15')],
 issues=[dict(id='ISS-001',component='path-kernel',version='1.8.2',title='空轮廓输入的错误提示不明确',kind='缺陷',environment='Windows x64 · MSVC 2022',detail='输入空点集时得到通用错误，希望返回明确的参数错误码。',status='Open',owner='基础算法组',date='2026-11-18',history=[]),
         dict(id='ISS-002',component='device-link',version='0.9.0',title='补充断线重连的使用示例',kind='文档',environment='Linux x64',detail='希望增加事件订阅与重连顺序示例。',status='InProgress',owner='设备平台组',date='2026-11-19',history=[])],
 events=[dict(id='EVT-001',date='2026-11-18',actor='基础算法组',component='path-kernel',version='2.0.0',text='提交 2.0.0 上架评审，原 1.x 发布线保持可用。'),dict(id='EVT-002',date='2026-11-19',actor='使用方',component='device-link',version='0.9.0',text='登记设备调试器受控试点。')])
data['rollouts']=[dict(id='PILOT-1',name='路径运算跨团队试点',supplier='基础算法组',consumer='应用二组',commitment='供给方提供 2.0 候选制品和维护支持；使用方安排两人完成兼容及异常路径验证。',status='进行中',blocker='使用方需确认异常输入的处理约定，由双方接口负责人周内评审。'),dict(id='PILOT-2',name='设备连接接入验证',supplier='设备平台组',consumer='设备应用组',commitment='供给方提供重连示例；使用方完成 Linux 环境受控接入并提交验证记录。',status='等待资源决策',blocker='验证机排期冲突，提交双方负责人确认本周投入及替代时间。')]
(ROOT/'data'/'mock.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Generated {len(components)} fictional components and versioned lifecycle records.')
