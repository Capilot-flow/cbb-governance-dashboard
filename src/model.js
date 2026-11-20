(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CBB=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const G=typeof module==='object'&&module.exports?require('./governance.js'):window.CBB_GOV;
 const CHECKS=[['scope','能力边界与复用场景'],['api','接口契约与兼容约束'],['package','版本化制品与来源一致'],['guide','接入指导与最小示例'],['tests','自动化测试与质量报告'],['validation','非原作者实操与试点验证'],['owner','Owner、维护者与支持入口'],['changelog','变更、升级及回退说明']].map(([id,label])=>({id,label}));
 const LABELS={Candidate:'候选',Trial:'试用',Published:'已发布',Deprecated:'已废弃',Retired:'已退役',Draft:'资料准备',Review:'评审中',Approved:'待发布',Released:'已发布',Open:'待受理',InProgress:'处理中',Verify:'待验证',Closed:'已关闭'};
 const copy=x=>JSON.parse(JSON.stringify(x));
 const major=v=>String(v).split('.')[0];
 const getVersion=(c,n)=>c.versions.find(v=>v.number===n);
 const statusOf=(c,n)=>c.lines[major(typeof n==='string'?n:n.number)]?.status||'Candidate';
 const compare=(a,b)=>{const aa=a.split('.').map(Number),bb=b.split('.').map(Number);for(let i=0;i<3;i++){if(aa[i]!==bb[i])return aa[i]-bb[i];}return 0;};
 const ordered=c=>[...c.versions].sort((a,b)=>compare(b.number,a.number));
 const recommended=c=>ordered(c).find(v=>v.released&&statusOf(c,v)==='Published')||ordered(c).find(v=>(v.released||v.trialReady)&&statusOf(c,v)==='Trial');
 const visibleComponents=s=>s.components.filter(c=>recommended(c));
 function need(condition,message){if(!condition)throw new Error(message);}
 function text(value,label,min=1){const v=String(value??'').trim();need(v.length>=min,`请填写${label}`);need(v.length<=4000,`${label}过长，请控制在 4000 字以内`);return v;}
 function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!isNaN(Date.parse(value))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;}
 function find(s,id,n){const c=s.components.find(x=>x.id===id);need(c,'找不到组件');const v=n?getVersion(c,n):null;if(n)need(v,'找不到该版本');return[c,v];}
 function ready(v){need(CHECKS.every(k=>v.evidence[k.id]),'版本证据不完整，请先补齐材料');}
 function target(s,value){const [id,n]=String(value||'').split('@');const [c,v]=find(s,id,n);need(v&&v.released&&statusOf(c,v)==='Published','替代版本必须已正式发布');return[c,v];}
 function activeUses(s,c,n){return s.uses.filter(u=>u.component===c.id&&major(u.version)===major(n)&&u.active);}
 function command(input,p){
  const s=G.normalize(copy(input));G.before(s,p);let c,v;if(p.id)[c,v]=find(s,p.id,p.type==='version'?null:p.version);
  const event=(message,role)=>G.event(s,{...p,id:c?.id||p.id,version:v?.number||p.version},message,role);
  const line=()=>c.lines[major(v.number)];
  switch(p.type){
   case 'create':{
    const name=text(p.name,'组件名称'),slug=text(p.slug,'英文标识');need(/^[a-z][a-z0-9-]{1,47}$/.test(slug),'英文标识需为 2–48 位小写字母、数字或连字符');need(!s.components.some(x=>x.id===slug),'组件标识已存在');
    c={id:slug,name,subtitle:name,summary:text(p.summary,'一句话说明'),category:text(p.category,'能力分类'),language:text(p.language,'技术栈'),owner:text(p.owner,'Owner 团队'),maintainer:p.owner+'维护小组',scope:[text(p.scope,'能力范围')],exclusions:[text(p.exclusions,'不支持范围')],input:'待补充接口文档',output:'待补充接口文档',repository:'demo://source/'+slug,dependencies:[],tags:[p.category,p.language],created:s.today,versions:[],lines:{'0':{status:'Candidate'}}};
    v={number:'0.1.0',phase:'Draft',released:false,date:s.today,tag:'v0.1.0',commit:'demo-pending',build:'待验证',artifact:slug+'-0.1.0.zip',notes:'首次候选版本',platforms:['Windows x64'],compiler:'待声明',runtime:'待声明',evidence:Object.fromEntries(CHECKS.map(k=>[k.id,false]))};c.versions.push(v);s.components.push(c);event('创建候选组件 '+name);break;
   }
   case 'evidence':need(!v.released,'已发布版本不可覆盖，请创建新版本');need(v.phase==='Draft','评审期间请先退回补充材料');v.evidence=Object.fromEntries(CHECKS.map(k=>[k.id,!!p.evidence?.[k.id]]));v.compiler=p.compiler||v.compiler;v.runtime=p.runtime||v.runtime;event('更新版本材料与验证证据');break;
   case 'version':{
    const n=text(p.version,'版本号');need(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(n),'版本号请使用 MAJOR.MINOR.PATCH');need(!getVersion(c,n),'该版本已存在');const previous=ordered(c).find(x=>major(x.number)===major(n))||ordered(c)[0];need(compare(n,previous.number)>0,'新版本必须大于该发布线的最新版本');
    v=copy(previous);Object.assign(v,{number:n,phase:'Draft',released:false,trialReady:false,date:s.today,tag:'v'+n,commit:'demo-new-'+n,build:'待验证',artifact:c.id+'-'+n+'.zip',notes:text(p.notes,'版本变更说明'),evidence:Object.fromEntries(CHECKS.map(k=>[k.id,false]))});
    const lineKey=major(n);if(!c.lines[lineKey])c.lines[lineKey]={status:'Candidate'};need(!['Deprecated','Retired'].includes(c.lines[lineKey].status),'该主版本已停止发布，请使用新的主版本号');c.versions.push(v);event('创建版本 '+n+'，等待材料与验证');break;
   }
   case 'submit':need(!v.released&&v.phase==='Draft','当前版本不处于资料准备阶段');ready(v);v.phase='Review';s.reviews.push({id:'REV-'+(s.reviews.length+1).toString().padStart(3,'0'),component:c.id,version:v.number,status:'待评审',note:'',checks:[]});event('提交上架评审');break;
   case 'review':{
    need(v.phase==='Review','该版本当前不在评审中');const r=[...s.reviews].reverse().find(x=>x.component===c.id&&x.version===v.number&&x.status==='待评审');need(r,'找不到待评审申请');const note=text(p.note,'评审结论');
    if(p.decision==='approve'){ready(v);need(CHECKS.every(k=>p.checks?.includes(k.id)),'请核验全部强制检查项');v.phase='Approved';if(line().status==='Candidate')line().status='Trial';v.trialReady=line().status==='Trial';r.status='已通过';}
    else{need(p.decision==='reject','无效评审决定');v.phase='Draft';r.status='已退回';}Object.assign(r,{note,checks:p.checks||[],date:s.today});event(r.status+'：'+note,'评审组');break;
   }
   case 'publish':need(v.phase==='Approved'&&!v.released,'请先完成准入评审，获得发布批准');ready(v);need(['Candidate','Trial','Published'].includes(line().status),'当前主版本不允许发布');v.released=true;v.trialReady=false;v.phase='Released';v.date=s.today;line().status='Published';event('发布 '+v.number+'；制品、文档及测试报告锁定为同一版本','发布负责人');break;
   case 'use':{
    need(v&&(v.released||v.trialReady&&statusOf(c,v)==='Trial')&&['Published','Trial'].includes(statusOf(c,v)),'该版本不允许新增接入');if(statusOf(c,v)==='Trial')need(p.trial===true,'试用版本必须确认受控试点范围');
    const project=text(p.project,'使用项目'),projectVersion=text(p.projectVersion,'项目版本');need(!s.uses.some(x=>x.active&&x.component===c.id&&x.project===project&&x.projectVersion===projectVersion),'该项目版本已登记使用关系，请在迁移记录中更新');
    s.uses.push({id:'USE-'+(s.uses.length+1).toString().padStart(3,'0'),component:c.id,version:v.number,project,projectVersion,team:p.team||'应用团队',stage:statusOf(c,v)==='Trial'?'试点':'正式使用',active:true,date:s.today});event(project+' 登记接入 '+v.number,'使用方');break;
   }
   case 'deprecate':{
    need(v.released&&line().status==='Published','仅已发布主版本可申请废弃');let tc,tv;try{[tc,tv]=target(s,p.replacement);}catch{throw new Error('替代版本必须是可用的正式发布版本');}need(tc.id!==c.id||major(tv.number)!==major(v.number),'替代版本不能属于当前废弃主版本');need(validDate(p.deadline)&&p.deadline>=s.today,'迁移截止日期不得早于当前演示日期');line().migration={replacement:p.replacement,deadline:p.deadline,guide:text(p.guide,'迁移指导')};line().status='Deprecated';event('废弃 '+major(v.number)+'.x；迁移至 '+p.replacement+'，截止 '+p.deadline,'Owner');break;
   }
   case 'migrate':{
    const u=s.uses.find(x=>x.id===p.useId);need(u&&u.active,'使用记录已迁移或不存在');[c,v]=find(s,u.component,u.version);const[tc,tv]=target(s,p.target);need(u.component!==tc.id||u.version!==tv.number,'请选择不同的目标版本');const existing=s.uses.find(x=>x!==u&&x.active&&x.component===tc.id&&x.project===u.project&&x.projectVersion===u.projectVersion);need(!existing||existing.version===tv.number,'该项目已登记目标组件的其他版本，请先更新目标使用记录');u.active=false;u.migratedTo=p.target;u.migratedAt=s.today;if(!existing)s.uses.push({...u,id:'USE-'+(s.uses.length+1).toString().padStart(3,'0'),component:tc.id,version:tv.number,active:true,migratedTo:null,migratedAt:null,date:s.today,stage:'正式使用'});event(u.project+' 已验证迁移到 '+p.target,'使用方');break;
   }
   case 'retire':need(line().status==='Deprecated','请先完成废弃及迁移安排');need(activeUses(s,c,v.number).length===0,'仍有使用方未迁移，暂不能退役');need(line().migration&&s.today>=line().migration.deadline,'迁移窗口尚未结束，暂不能退役');line().status='Retired';event('退役 '+major(v.number)+'.x，保留制品与文档归档','Owner');break;
   case 'issue':need(v,'问题必须关联具体版本');s.issues.push({id:'ISS-'+(s.issues.length+1).toString().padStart(3,'0'),component:c.id,version:v.number,title:text(p.title,'问题标题'),kind:p.kind||'咨询',environment:text(p.environment,'使用环境'),detail:text(p.detail,'问题描述'),status:'Open',owner:c.owner,date:s.today,history:[]});event('收到反馈：'+p.title,'使用方');break;
   case 'demand':s.issues.push({id:'ISS-'+(s.issues.length+1).toString().padStart(3,'0'),component:'',version:'',title:text(p.title,'需求标题'),kind:'能力需求',environment:'尚未选型',detail:text(p.detail,'需求描述'),status:'Open',owner:'平台运营组',date:s.today,history:[]});event('收到能力需求：'+p.title,'使用方');break;
   case 'issueTransition':{
    const issue=s.issues.find(x=>x.id===p.issueId);need(issue,'找不到问题');if(issue.component)[c,v]=find(s,issue.component,issue.version);const allowed={Open:['InProgress'],InProgress:['Verify'],Verify:['Closed','InProgress'],Closed:['Open']};need(allowed[issue.status]?.includes(p.next),'不允许跳过问题处理流转');let note=p.note||'';
    if(p.next==='Verify'){const[fc,fv]=target(s,p.fixed);need(fc.id===issue.component||!issue.component,'修复版本必须属于受影响组件');note=text(note,'修复说明');issue.fixed=p.fixed;issue.fixCommit=fv.commit;}
    if(p.next==='Closed')note=text(note,'使用方验证结论');if(p.next==='Open')note=text(note,'重新打开原因');issue.history.push({from:issue.status,to:p.next,note,date:s.today});issue.status=p.next;event('问题 '+issue.id+' → '+LABELS[p.next]+(note?'：'+note:''),p.next==='Closed'?'使用方':'维护者');break;
   }
   case 'clock':need(validDate(p.date)&&p.date>=s.today,'演示日期只能向后调整');s.today=p.date;event('演示日期调整至 '+s.today,'演示控制');break;
   default:need(G.extra(s,p),'不支持的操作');
  }
  G.after(s,p);s.revision=(s.revision||0)+1;return s;
 }
 function daysBetween(a,b){const d=Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z');return Math.round(d/86400000);}
 function useCount(s,c){return G.usage(s,c.id).total;}
 function versionUseCount(s,c,n){return G.usage(s,c.id,n).selected;}
 function openIssues(s,c){return s.issues.filter(i=>i.component===c.id&&i.status!=='Closed').length;}
 function legacyHealth(s,c){
  const v=recommended(c)||ordered(c)[0],status=v?statusOf(c,v):'Candidate';
  const uses=useCount(s,c),open=openIssues(s,c),idle=v?daysBetween(v.date,s.today):null;
  const dependents=dependentsOf(s,c.id).length;
  if(!v||status==='Candidate')return{level:'pending',label:'未上架',uses,open,idle,dependents,reasons:['尚未通过准入评审']};
  if(status==='Retired')return{level:'retired',label:'已退役',uses,open,idle,dependents,reasons:['已归档，不再提供支持']};
  if(status==='Deprecated')return{level:'migrating',label:'迁移中',uses,open,idle,dependents,reasons:['已废弃，等待使用方迁移']};
  if(uses===0&&dependents===0)return{level:'review',label:'待复审',uses,open,idle,dependents,reasons:['已发布但没有项目或组件使用它']};
  const r=[];
  if(uses===0&&dependents>0)r.push('被 '+dependents+' 个组件依赖，但没有项目直接接入');
  if(open>=2)r.push('未关闭问题 '+open+' 个');
  if(idle>180)r.push('距上次发布 '+idle+' 天');
  return{level:r.length?'watch':'healthy',label:r.length?'观察':'健康',uses,open,idle,dependents,reasons:r};
 }
 function requiresOf(c){return (c.requires||[]).filter(r=>r&&r.component);}
 function health(s,c){return G.health(G.normalize(s),c.id);}
 function dependentsOf(s,id){return s.components.filter(c=>requiresOf(c).some(r=>r.component===id));}
 function dependencyRisks(s,c){
  const out=[];
  requiresOf(c).forEach(r=>{const t=s.components.find(x=>x.id===r.component);if(!t)return;const tv=recommended(t);const st=tv?statusOf(t,tv):'Candidate';if(st!=='Published')out.push({from:c.id,to:t.id,status:st,label:LABELS[st]||st,version:tv?tv.number:''});});
  return out;
 }
 return{CHECKS,LABELS,copy,major,getVersion,statusOf,ordered,recommended,visibleComponents,activeUses,command,daysBetween,useCount,versionUseCount,openIssues,health,requiresOf,dependentsOf,dependencyRisks};
});
