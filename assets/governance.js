(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CBB_GOV=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const ACTORS=[{id:'lin',name:'林沐',role:'maintainer',label:'维护负责人'},{id:'chen',name:'陈岚',role:'reviewer',label:'准入评审人'},{id:'zhou',name:'周然',role:'operator',label:'平台运营'},{id:'xu',name:'许言',role:'consumer',label:'使用方代表'}];
const copy=x=>JSON.parse(JSON.stringify(x)),major=n=>String(n).split('.')[0];
const status=(c,v)=>c.lines[major(v.number)].status;
const version=(c,n)=>c.versions.find(v=>v.number===n);
const order=c=>[...c.versions].sort((a,b)=>{const aa=a.number.split('.').map(Number),bb=b.number.split('.').map(Number);for(let i=0;i<3;i++)if(aa[i]!==bb[i])return bb[i]-aa[i];return 0;});
const usable=(c,v)=>(v.released||v.trialReady)&&['Published','Trial'].includes(status(c,v));
const recommended=c=>order(c).find(v=>v.released&&status(c,v)==='Published')||order(c).find(v=>usable(c,v));
const days=(from,to)=>from?Math.max(0,Math.round((Date.parse(to+'T00:00:00Z')-Date.parse(from.slice(0,10)+'T00:00:00Z'))/86400000)):null;
const unique=arr=>[...new Set(arr.filter(Boolean))];
function need(ok,message){if(!ok)throw new Error(message);}
function required(v,label){const x=String(v||'').trim();need(x,`请填写${label}`);need(x.length<=4000,`${label}过长`);return x;}
function validDate(v){return /^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!isNaN(Date.parse(v))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;}
function pair(s,id,n){const c=s.components.find(x=>x.id===id);need(c,'找不到组件');const v=n?version(c,n):null;if(n)need(v,'找不到版本');return[c,v];}
function normalize(s){
 s.governanceCases??=[];s.favorites??={};s.rollouts??=[];s.actors??=copy(ACTORS);s.actorId??='lin';s.policy??={adoptionDays:60,observationDays:30,maintenanceDays:90,responseDays:3};s.feedbackSchema=1;
 for(const c of s.components){c.scenarios??=[];c.productLines??=[];c.aliases??=[];c.maintenanceConfirmedAt??=null;c.lastMaintainedAt??=null;c.usageCoverage??='unknown';c.economics??={maintenanceHours:null,avoidedHours:null,basis:''};
  for(const v of c.versions){if(!v.dependencies){v.dependencies=[];for(const r of c.requires||[]){const t=s.components.find(x=>x.id===r.component);const tv=t&&order(t).find(x=>x.released&&(!r.range||major(x.number)===String(r.range).replace(/[^0-9.]/g,'').split('.')[0]));if(tv)v.dependencies.push({component:t.id,version:tv.number,kind:'runtime'});} }
   v.compatibility??={declaration:'unknown',notes:'兼容承诺待补充'};
  }
 }
 for(const k of s.governanceCases){k.baselineProjects??=unique(s.uses.filter(u=>u.component===k.component&&(!k.baselineUseIds||k.baselineUseIds.includes(u.id))).map(u=>u.project));}
 for(const i of s.issues){i.history??=[];i.severity??=(i.kind==='缺陷'?'S2':'S3');i.impactScope??='registered';}
 return s;
}
function actor(s,p={}){return s.actors.find(a=>a.id===(p.actorId||s.actorId))||null;}
function authorize(s,p){if(p.type==='actor')return;const a=actor(s,p);need(a,'请选择有效的演示身份');
 const permission={review:['reviewer'],create:['maintainer'],evidence:['maintainer'],submit:['maintainer'],version:['maintainer'],publish:['maintainer'],deprecate:['maintainer'],retire:['maintainer'],dependencyAdd:['maintainer'],dependencyRemove:['maintainer'],maintenance:['maintainer'],metadata:['maintainer'],economics:['maintainer','operator'],caseCreate:['maintainer','operator'],caseDecide:['maintainer','operator'],rollout:['maintainer','operator'],consolidation:['maintainer','operator']};
 if(permission[p.type])need(permission[p.type].includes(a.role),p.type==='review'?'准入审批需要评审人身份；请切换演示身份':'当前演示身份无权执行此操作，请切换到相应负责人');
}
function event(s,p,text,role){const a=actor(s,p);s.events.push({id:'EVT-'+String(s.events.length+1).padStart(3,'0'),date:s.today,actor:a?.name||'历史未实名',actorId:a?.id||null,actorRole:a?.label||role||'',actionRole:role||'',component:p.id||'',version:p.version||'',text});}
function usage(s,id,n){const all=s.uses.filter(u=>u.active&&u.component===id),selected=all.filter(u=>u.version===n);return{total:unique(all.map(u=>u.project)).length,selected:unique(selected.map(u=>u.project)).length,teams:unique(all.map(u=>u.team)),projects:unique(all.map(u=>u.project)),records:all,selectedRecords:selected};}
const graphCache=new WeakMap();
function graphIndex(s){let cached=graphCache.get(s);if(cached&&cached.revision===s.revision&&cached.count===s.components.length)return cached;const list=s.components.flatMap(c=>c.versions.flatMap(v=>(v.dependencies||[]).map(r=>({from:c.id+'@'+v.number,to:r.component+'@'+r.version,component:c.id,version:v.number,target:r.component,targetVersion:r.version,kind:r.kind||'runtime'}))));const outgoing=new Map(),incoming=new Map();for(const e of list){if(!outgoing.has(e.from))outgoing.set(e.from,[]);if(!incoming.has(e.to))incoming.set(e.to,[]);outgoing.get(e.from).push(e);incoming.get(e.to).push(e);}cached={list,outgoing,incoming,revision:s.revision,count:s.components.length};graphCache.set(s,cached);return cached;}
function edges(s){return graphIndex(s).list;}
function relations(s,id,n,dir='dependencies',maxDepth=Infinity){
 const index=graphIndex(s),root=id+'@'+n,seen=new Set([root]),queue=[{node:root,depth:0}],nodes=[],result=[];
 while(queue.length){const x=queue.shift();if(x.depth>=maxDepth)continue;for(const e of (dir==='dependents'?index.incoming:index.outgoing).get(x.node)||[]){const next=dir==='dependents'?e.from:e.to;result.push(e);if(!seen.has(next)){seen.add(next);nodes.push(next);queue.push({node:next,depth:x.depth+1});}}}
 return{root,nodes,edges:[...new Map(result.map(e=>[e.from+'>'+e.to,e])).values()]};
}
function impact(s,id,n){const graph=relations(s,id,n,'dependents');const versions=new Set([graph.root,...graph.nodes]);const components=graph.nodes.map(k=>{const i=k.lastIndexOf('@');return{component:k.slice(0,i),version:k.slice(i+1)};});const records=s.uses.filter(u=>u.active&&versions.has(u.component+'@'+u.version));return{...graph,components,projects:[...new Map(records.map(u=>[u.project,u])).values()]};}
function activeDependents(s,id,n){const im=impact(s,id,n);return im.components.filter(r=>{const c=s.components.find(x=>x.id===r.component),v=c&&version(c,r.version);return !!v&&(usable(c,v)||s.uses.some(u=>u.active&&u.component===c.id&&u.version===v.number));});}
function response(s,id){const issues=s.issues.filter(i=>i.component===id);const responded=[],unanswered=[];for(const i of issues){const first=i.respondedAt||i.history.find(h=>h.to==='InProgress')?.date;if(first)responded.push(days(i.date,first));else if(i.status!=='Closed')unanswered.push(i);}return{averageResponseDays:responded.length?responded.reduce((a,b)=>a+b,0)/responded.length:null,responseSamples:responded.length,unanswered:unanswered.length,oldestUnansweredDays:unanswered.length?Math.max(...unanswered.map(i=>days(i.date,s.today)||0)):null};}
function health(s,id){const c=s.components.find(x=>x.id===id),v=recommended(c),u=usage(s,id),r=response(s,id),open=s.issues.filter(i=>i.component===id&&i.status!=='Closed'),published=order(c).filter(v=>v.released),lastPublished=published.map(v=>v.date).sort().at(-1)||null;
 const depVersions=c.versions.flatMap(v=>activeDependents(s,id,v.number));const indirect=unique(c.versions.flatMap(v=>impact(s,id,v.number).projects.map(p=>p.project)));const signals=[];
 const retained=s.governanceCases.some(k=>k.component===id&&k.status==='Resolved'&&k.decision==='retain'&&k.nextReviewAt>=s.today);
 if(v&&u.total===0&&depVersions.length===0&&!retained){if(c.usageCoverage!=='confirmed')signals.push({kind:'coverage',label:'使用情况待核实'});else if((days(lastPublished,s.today)||0)>=s.policy.adoptionDays)signals.push({kind:'adoption',label:'待确认复用价值'});}
 if(v&&((!c.maintenanceConfirmedAt||(days(c.maintenanceConfirmedAt,s.today)||0)>s.policy.maintenanceDays))&&(r.unanswered>0||!c.maintainer))signals.push({kind:'maintenance',label:'维护待确认'});
 if(r.oldestUnansweredDays>s.policy.responseDays)signals.push({kind:'response',label:`${r.unanswered} 条问题待响应`});
 if(open.some(i=>['S0','S1'].includes(i.severity)))signals.push({kind:'risk',label:'存在高优先级问题'});
 const archived=!v&&order(c)[0]?status(c,order(c)[0]):null;const known=!!(c.lastMaintainedAt&&c.maintenanceConfirmedAt);const reasons=signals.map(x=>x.label);const observing=v&&u.total===0&&(days(lastPublished,s.today)||0)<s.policy.observationDays;
 return{signals,reasons,level:signals.length?'review':archived==='Retired'?'retired':archived==='Deprecated'?'migrating':observing?'observe':v?(known?'healthy':'unknown'):'pending',label:signals.length?'待复审':archived==='Retired'?'已退役':archived==='Deprecated'?'迁移中':observing?'观察期':v?(known?'维护有记录':'维护待确认'):'未上架',uses:u.total,open:open.length,idle:days(lastPublished,s.today),dependents:unique(depVersions.map(d=>d.component)).length,indirectProjects:indirect.length,lastPublished,lastMaintained:c.lastMaintainedAt,maintenanceConfirmedAt:c.maintenanceConfirmedAt,...r};
}
function facets(s){return{categories:unique(s.components.map(c=>c.category)),languages:unique(s.components.map(c=>c.language)),teams:unique(s.components.map(c=>c.owner)),scenarios:unique(s.components.flatMap(c=>c.scenarios||[])),productLines:unique(s.components.flatMap(c=>c.productLines||[]))};}
function catalogue(s,p={}){const q=String(p.q||'').toLowerCase().trim(),terms=q.split(/\s+/).filter(Boolean);let rows=s.components.map(c=>{const v=p.status&&p.status!=='all'?order(c).find(v=>status(c,v)===p.status&&(p.status==='Published'?v.released:p.status==='Trial'?(v.released||v.trialReady):true)):recommended(c)||(p.status==='all'?order(c)[0]:null);const fields=[c.name,c.id,c.subtitle,c.summary,c.owner,...(c.scope||[]),...(c.scenarios||[]),...(c.aliases||[])].map(x=>String(x).toLowerCase());const score=terms.reduce((sum,t)=>sum+fields.reduce((n,f,i)=>n+(f.includes(t)?i<3?10:2:0),0),0);return{c,v,score};}).filter(({c,v,score})=>v&&(!q||terms.every(t=>[c.name,c.id,c.subtitle,c.summary,c.owner,...(c.scope||[]),...(c.scenarios||[]),...(c.aliases||[])].join(' ').toLowerCase().includes(t)))&&(!p.category||c.category===p.category)&&(!p.language||c.language===p.language)&&(!p.team||c.owner===p.team)&&(!p.scenario||(c.scenarios||[]).includes(p.scenario))&&(!p.productLine||(c.productLines||[]).includes(p.productLine))&&(!p.status||p.status==='all'||status(c,v)===p.status)&&(p.discover!=='favorites'||(s.favorites[s.actorId]||[]).includes(c.id))&&(p.discover!=='teams'||usage(s,c.id).teams.length>1));
 const sort=p.sort||(q?'relevance':'reuse');rows.sort((a,b)=>sort==='name'?a.c.name.localeCompare(b.c.name):sort==='maintenance'?(b.c.lastMaintainedAt||'').localeCompare(a.c.lastMaintainedAt||''):sort==='updated'?(b.v.date||'').localeCompare(a.v.date||''):sort==='relevance'?(b.score-a.score||usage(s,b.c.id).total-usage(s,a.c.id).total):(usage(s,b.c.id).total-usage(s,a.c.id).total||a.c.name.localeCompare(b.c.name)));
 const pageSize=[10,20,50].includes(Number(p.pageSize))?Number(p.pageSize):20,pages=Math.max(1,Math.ceil(rows.length/pageSize)),page=Math.max(1,Math.min(pages,Number(p.page)||1));return{items:rows.slice((page-1)*pageSize,page*pageSize),total:rows.length,page,pages,pageSize,sort};}
function similar(s,c){const tokens=new Set([c.category,...(c.scenarios||[]),...(c.tags||[])]);return s.components.filter(x=>x.id!==c.id&&recommended(x)).map(x=>({c:x,score:[x.category,...(x.scenarios||[]),...(x.tags||[])].filter(t=>tokens.has(t)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.c);}
function scale(input,count=320){const s=normalize(copy(input)),base=s.components.slice(0,8);for(let i=s.components.length;i<count;i++){const c=copy(base[i%base.length]);c.id='scale-'+i;c.name=c.name+' '+String(i).padStart(3,'0');c.subtitle+=' · 规模演示';c.scaleFixture=true;s.components.push(c);if(i%3!==0){const v=recommended(c);if(v)s.uses.push({id:'SCALE-USE-'+i,component:c.id,version:v.number,project:'模拟应用 '+i,projectVersion:'1.0',team:'应用团队 '+(i%7+1),active:true,stage:'正式使用',date:s.today,scaleFixture:true});}}s.meta.scaleDemo=true;return s;}
function before(s,p){authorize(s,p);
 if(p.type==='issueTransition'){const i=s.issues.find(i=>i.id===p.issueId),a=actor(s,p);if(i?.status==='Verify'&&['Closed','InProgress'].includes(p.next))need(a.role==='consumer','使用方验证需要使用方代表身份；请切换演示身份');else if((i?.status==='Open'&&p.next==='InProgress')||(i?.status==='InProgress'&&p.next==='Verify'))need(a.role==='maintainer','受理与修复需要维护负责人身份');}
if(p.type==='version'&&p.compatibility==='breaking'){const[c]=pair(s,p.id);need(!c.lines[major(p.version)],'破坏性变更必须提升主版本');}if(p.type==='publish'){const[c,v]=pair(s,p.id,p.version);for(const d of v.dependencies||[]){const[dc,dv]=pair(s,d.component,d.version);need(dv.released&&status(dc,dv)==='Published','依赖版本尚未正式发布，请先处理依赖风险');}}
 if(p.type==='retire'){const[c,v]=pair(s,p.id,p.version);const dependents=c.versions.filter(x=>major(x.number)===major(v.number)).flatMap(x=>activeDependents(s,c.id,x.number));need(!dependents.length,'仍有活跃组件版本依赖它，请先发布替代依赖并迁移使用方');}}
function after(s,p){if(p.type==='create'){const c=s.components.at(-1);c.scenarios=String(p.scenarios||'').split(/[、,，\n]/).map(x=>x.trim()).filter(Boolean);c.productLines=String(p.productLines||'').split(/[、,，\n]/).map(x=>x.trim()).filter(Boolean);c.origin={project:p.originProject||'',reason:p.originReason||'',kind:p.originProject?'extracted':'new'};c.usageCoverage='unknown';c.lastMaintainedAt=s.today;c.maintenanceConfirmedAt=s.today;}
 if(p.type==='version'){const[c]=pair(s,p.id);const v=version(c,p.version);v.compatibility={declaration:p.compatibility||'unknown',notes:p.compatibilityNotes||p.notes};}
 if(['create','evidence','publish'].includes(p.type)&&p.id){const[c]=pair(s,p.id);c.lastMaintainedAt=s.today;}
 if(p.type==='issue'){const i=s.issues.at(-1);i.severity=['S0','S1','S2','S3'].includes(p.severity)?p.severity:(i.kind==='缺陷'?'S2':'S3');i.contributionUrl=p.contributionUrl||'';need(!i.contributionUrl||/^https:\/\//i.test(i.contributionUrl),'贡献链接需使用 HTTPS');}
 if(p.type==='issueTransition'&&p.next==='InProgress'){const i=s.issues.find(i=>i.id===p.issueId);i.respondedAt??=s.today;}
}
function extra(s,p){
 if(p.type==='actor'){need(s.actors.some(a=>a.id===p.value),'无效演示身份');s.actorId=p.value;return true;}
 if(p.type==='favorite'){pair(s,p.id);const f=s.favorites[s.actorId]||[];s.favorites[s.actorId]=f.includes(p.id)?f.filter(id=>id!==p.id):[...f,p.id];return true;}
 if(p.type==='dependencyAdd'||p.type==='dependencyRemove'){
  const[c,v]=pair(s,p.id,p.version);need(!v.released&&!v.trialReady,'已发布或进入试用的版本不可修改依赖，请创建新版本');need(v.phase==='Draft','请退回资料准备后修改依赖');const parts=String(p.target||'').split('@');const[dc,dv]=pair(s,parts[0],parts[1]);need(dv,'请选择具体依赖版本');need(dc.id!==c.id,'组件不能依赖自身');v.dependencies??=[];
  if(p.type==='dependencyRemove')v.dependencies=v.dependencies.filter(d=>d.component!==dc.id||d.version!==dv.number);
  else{need(!v.dependencies.some(d=>d.component===dc.id),'同一组件只能锁定一个直接依赖版本');need(!relations(s,dc.id,dv.number).nodes.includes(c.id+'@'+v.number),'依赖会形成循环，已拒绝保存');v.dependencies.push({component:dc.id,version:dv.number,kind:p.kind==='build'?'build':'runtime'});}
  v.evidence.package=false;v.evidence.tests=false;event(s,p,(p.type==='dependencyAdd'?'新增':'移除')+'依赖 '+p.target+'，需重新核验制品和测试');return true;
 }
 if(p.type==='maintenance'){const[c]=pair(s,p.id);required(p.note,'维护确认说明');c.maintenanceConfirmedAt=s.today;c.lastMaintainedAt=s.today;event(s,p,'确认维护责任：'+p.note);return true;}
 if(p.type==='economics'){const[c]=pair(s,p.id);const a=Number(p.maintenanceHours),b=Number(p.avoidedHours);need(p.maintenanceHours!==''&&p.avoidedHours!==''&&Number.isFinite(a)&&Number.isFinite(b)&&a>=0&&b>=0,'请输入非负的月度工时估算');c.economics={maintenanceHours:a,avoidedHours:b,basis:required(p.basis,'估算依据'),date:s.today,actorId:actor(s,p).id};event(s,p,'更新维护投入与复用收益估算（非实测绩效）');return true;}
 if(p.type==='caseCreate'){
  const[c]=pair(s,p.id);need(!s.governanceCases.some(k=>k.component===c.id&&!['Resolved'].includes(k.status)),'该组件已有未结束的复审，请继续处理原记录');need(validDate(p.due)&&p.due>=s.today,'复审期限不得早于演示日期');need(s.actors.some(a=>a.id===p.ownerId),'请选择复审负责人');s.governanceCases.push({id:'GOV-'+(s.governanceCases.length+1),component:c.id,kind:p.kind||'maintenance',ownerId:p.ownerId,due:p.due,status:'Open',created:s.today,baselineUseIds:s.uses.filter(u=>u.active&&u.component===c.id).map(u=>u.id),baselineProjects:usage(s,c.id).projects,note:required(p.note,'复审目标'),signals:health(s,c.id).reasons,history:[]});event(s,p,'发起复审 '+s.governanceCases.at(-1).id+'，责任人 '+s.actors.find(a=>a.id===p.ownerId).name);return true;
 }
 if(p.type==='caseDecide'){
  const k=s.governanceCases.find(x=>x.id===p.caseId);need(k,'找不到复审记录');need(k.status!=='Resolved','复审已经结束');const note=required(p.note,'决策与验证依据');const[c]=pair(s,k.component);p={...p,id:c.id};
  if(p.decision==='pilot'){need(validDate(p.due)&&p.due>=s.today,'试点期限不得早于演示日期');const consumer=required(p.consumer,'使用团队');const values={component:c.id,name:c.name+' 复用试点',supplier:c.owner,consumer,commitment:note,status:'进行中',due:p.due,blocker:''},existing=s.rollouts.find(r=>r.caseId===k.id&&!['已验证','已中止'].includes(r.status));if(existing)Object.assign(existing,values);else s.rollouts.push({id:'PILOT-'+(s.rollouts.length+1),caseId:k.id,...values});k.status='Monitoring';k.decision='pilot';k.due=p.due;}
  else if(p.decision==='verified'){
   if(k.kind==='duplicate'||k.decision==='consolidate'){need(!c.versions.some(v=>usable(c,v))&&usage(s,c.id).total===0&&!c.versions.some(v=>activeDependents(s,c.id,v.number).length),'请先完成源组件的废弃、下游依赖及项目迁移');}
   else if(k.kind==='maintenance'){need(c.maintenanceConfirmedAt>=k.created,'请先确认本轮维护责任');need(!s.issues.some(i=>i.component===c.id&&i.status!=='Closed'),'请先关闭本轮维护问题并完成使用方验证');}
   else{const pilot=[...s.rollouts].reverse().find(r=>r.caseId===k.id);need(s.uses.some(u=>u.active&&u.component===c.id&&!(k.baselineProjects||[]).includes(u.project)&&(!pilot||u.team===pilot.consumer)),'请先登记本轮新增使用方的验证接入，并与试点团队一致');if(pilot){pilot.status='已验证';pilot.verifiedAt=s.today;}}
   k.status='Resolved';k.decision='verified';
  }
  else if(p.decision==='retain'){need(validDate(p.due)&&p.due>s.today,'继续保留需约定下一次复审日期');k.status='Resolved';k.decision='retain';k.nextReviewAt=p.due;}
  else if(p.decision==='consolidate'){const[tc,tv]=pair(s,String(p.target||'').split('@')[0],String(p.target||'').split('@')[1]);need(tc.id!==c.id&&tv?.released&&status(tc,tv)==='Published','请选择另一组件的已发布替代版本');k.status='Monitoring';k.decision='consolidate';k.target=p.target;}
  else{need(p.decision==='investigate','请选择有效的复审动作');k.status='Investigating';}
  if(p.decision!=='pilot'&&p.decision!=='verified')for(const r of s.rollouts.filter(r=>r.caseId===k.id&&!['已验证','已中止'].includes(r.status)))Object.assign(r,{status:'已中止',endedAt:s.today,endReason:note});
  k.note=note;k.history.push({date:s.today,actorId:actor(s,p).id,decision:p.decision,note});event(s,p,'复审 '+k.id+'：'+note);return true;
 }
 if(p.type==='rollout'){required(p.name,'试点名称');required(p.supplier,'供给团队');required(p.consumer,'使用团队');required(p.commitment,'双方投入约定');const r=s.rollouts.find(x=>x.id===p.rolloutId);const values={name:p.name,supplier:p.supplier,consumer:p.consumer,commitment:p.commitment,status:p.status||'待确认投入',blocker:p.blocker||''};if(r)Object.assign(r,values);else s.rollouts.push({...values,id:'PILOT-'+(s.rollouts.length+1)});event(s,p,'更新试点承诺：'+p.name);return true;}
 if(p.type==='consolidation'){const[c]=pair(s,p.id);const parts=String(p.target||'').split('@'),[t,v]=pair(s,parts[0],parts[1]);need(t.id!==c.id&&v?.released&&status(t,v)==='Published','请选择另一组件的已发布替代版本');need(validDate(p.due)&&p.due>=s.today,'请提供有效评估期限');need(!s.governanceCases.some(k=>k.component===c.id&&k.status!=='Resolved'),'已有未结束的复审，请在原记录中讨论收敛');s.governanceCases.push({id:'GOV-'+(s.governanceCases.length+1),component:c.id,kind:'duplicate',ownerId:actor(s,p).id,due:p.due,status:'Monitoring',created:s.today,note:required(p.note,'重叠能力与迁移代价'),decision:'consolidate',target:p.target,history:[{date:s.today,actorId:actor(s,p).id,decision:'consolidate',note:p.note}]});event(s,p,'记录能力收敛评估，目标 '+p.target+'；保留后续废弃迁移流程');return true;}
 if(p.type==='scale'){const next=scale(s,320);Object.assign(s,next);event(s,p,'载入 320 个组件的合成规模演示');return true;}
 return false;
}
return{ACTORS,normalize,actor,authorize,event,before,after,extra,usage,health,response,edges,relations,impact,activeDependents,facets,catalogue,similar,scale,days,recommended,version,status,validDate};
});
