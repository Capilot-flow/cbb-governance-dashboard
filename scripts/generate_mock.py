"""Reproducible fictional records. No external company data is ingested."""
import json, random
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
R=random.Random(20261120)
BGS=[{'id':f'BG-{x}','name':name} for x,name in zip('ABCDEF',['感知与采集','协同交互','边缘服务','连接平台','设备应用','基础研发'])]
NAMES=['统一日志','配置加载','设备发现','消息路由','文件校验','升级任务','时间同步','权限校验','异常上报','状态订阅','协议适配','数据缓冲','图像转换','几何计算','单位换算','任务调度','连接重试','指标采集','资源锁','诊断导出','本地缓存','文件分片','告警聚合','序列化','参数校验','事件总线','证书校验','审计记录','国际化资源','版本识别','进程守护','遥测压缩','设备注册','会话管理','指令队列','数据脱敏','索引封装','通信适配','线程池','插件加载','状态快照','制品清单']
assets=[]; versions=[]; usages=[]; actions=[]
for i,name in enumerate(NAMES):
    aid=f'CBB-{i+1:03d}'; bg=BGS[i%6]['id']
    missing=i%7==0
    assets.append({'id':aid,'name':name,'bg':bg,'owner':None if i%13==0 else f'维护角色 {i%18+1:02d}','boundary':None if missing else f'{name}的通用能力封装；不负责业务策略','status':'archived' if i in [9,20,32,40] else 'managed','verified':i%5!=0,'verifiedAt':'2026-11-18','evidence':f'MOCK-ASSET-{i+1:03d}','createdAt':f'2026-09-{i%26+1:02d}'})
    for j in range(2):
        versions.append({'id':f'{aid}-V{j+1}','assetId':aid,'version':f'{j+1}.0.{i%4}','platform':'Windows / Linux' if i%3 else 'Linux / ARM64','compatibility':'按演示兼容矩阵核验','dependencies':[] if i<2 else [f'CBB-{(i-1):03d}'],'artifact':None if i%9==0 else f'MOCK-ARTIFACT-{i+1:03d}-{j+1}','docs':None if i%11==0 else f'MOCK-DOC-{i+1:03d}-{j+1}','state':'supported' if j==1 else 'maintenance'})
    for k in range(1+i%6):
        cbg=BGS[R.randrange(len(BGS))]['id']
        stage=R.choices(['released','trial','pending'],weights=[64,23,13],k=1)[0]
        usages.append({'id':f'USE-{len(usages)+1:04d}','assetId':aid,'versionId':f'{aid}-V{(k%2)+1}','consumerBg':cbg,'projectId':f'PRJ-{cbg[-1]}-{(i*3+k)%16+1:02d}','stage':stage,'verified':(i+k)%7!=0,'evidence':None if (i+k)%11==0 else f'MOCK-ACCEPT-{i+1:03d}-{k+1}','observedAt':f'2026-11-{(i+k)%19+1:02d}','reason':{'released':'发布使用记录，需结合消费方核验与证据确认','trial':'集成兼容验证进行中','pending':'接入窗口或维护投入待确认'}[stage]})
for i in range(60):
    month=10 if i%4==0 else 11
    due=f'2026-{month:02d}-{i%26+1:02d}'
    closed=i%5 in [0,1]
    canceled=i%11==0
    status='canceled' if canceled else 'closed' if closed else 'in_progress' if i%3 else 'open'
    actions.append({'id':f'ACT-{i+1:03d}','assetId':assets[i%len(assets)]['id'],'bg':assets[i%len(assets)]['bg'],'title':['核验资产维护责任','补齐版本兼容说明','确认跨 BG 消费证据','处理旧版本迁移阻塞','补齐制品与文档入口'][i%5],'owner':f'治理角色 {i%12+1:02d}','originalDue':due,'due':f'2026-12-{i%20+1:02d}' if i%7==0 else due,'status':status,'closedAt':f'2026-{month:02d}-{min(i%26+2,20):02d}' if status=='closed' else None,'evidence':f'MOCK-CLOSE-{i+1:03d}' if status=='closed' and i%10!=0 else None,'blocker':['维护人待确认','发布窗口冲突','质量证据不完整','跨团队投入未确认'][i%4],'decisionOwner':f'决策角色 {i%6+1:02d}','exceptionUntil':'2026-12-05' if canceled or i%7==0 else None})
data={'meta':{'title':'CBB Atlas 合成治理数据','isMock':True,'asOf':'2026-11-20','seed':20261120,'note':'全部组织、项目、角色与证据编号均为虚构，不代表任何企业实际情况。','source':'scripts/generate_mock.py deterministic synthetic records'},'bgs':BGS,'assets':assets,'versions':versions,'usages':usages,'actions':actions}
(ROOT/'data').mkdir(exist_ok=True)
(ROOT/'data'/'mock.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('Generated mock records:',len(assets),'assets,',len(versions),'versions,',len(usages),'usages,',len(actions),'actions')
