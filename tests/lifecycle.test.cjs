const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../src/model.js');
const seed=require('../data/mock.json');
const fresh=()=>JSON.parse(JSON.stringify(seed));
const act=(s,type,payload={})=>M.command(s,{type,...payload});
test('published catalogue excludes drafts and archived lines by default',()=>{
 const s=fresh();assert(M.visibleComponents(s).every(c=>M.recommended(c)));assert(!M.visibleComponents(s).find(c=>c.id==='signal-bus'));
});
test('admission refuses incomplete evidence',()=>{
 const s=fresh();assert.throws(()=>act(s,'submit',{id:'signal-bus',version:'0.1.0'}),/证据/);assert.equal(s.components.find(c=>c.id==='signal-bus').versions[0].phase,'Draft');
});
test('review requires all mandatory checks and publication approval',()=>{
 let s=fresh();assert.throws(()=>act(s,'publish',{id:'path-kernel',version:'2.0.0'}),/评审/);
 assert.throws(()=>act(s,'review',{id:'path-kernel',version:'2.0.0',decision:'approve',checks:[],note:'验证通过'}),/检查/);
 s=act(s,'review',{id:'path-kernel',version:'2.0.0',decision:'approve',checks:M.CHECKS.map(x=>x.id),note:'已在干净环境核验'});
 assert.equal(M.statusOf(s.components[0],'2.0.0'),'Trial');
 s=act(s,'publish',{id:'path-kernel',version:'2.0.0'});assert.equal(M.statusOf(s.components[0],'2.0.0'),'Published');
 assert.equal(M.statusOf(s.components[0],'1.8.2'),'Published');
});
test('review rejection preserves reason and permits resubmission',()=>{
 let s=act(fresh(),'review',{id:'path-kernel',version:'2.0.0',decision:'reject',checks:[],note:'缺少错误路径测试'});
 assert.equal(M.getVersion(s.components[0],'2.0.0').phase,'Draft');assert(s.reviews.some(r=>r.note==='缺少错误路径测试'));
 s=act(s,'submit',{id:'path-kernel',version:'2.0.0'});assert.equal(M.getVersion(s.components[0],'2.0.0').phase,'Review');
});
test('new version is unique and a draft even on a published major',()=>{
 let s=act(fresh(),'version',{id:'path-kernel',version:'1.9.0',notes:'兼容新增'});
 const v=M.getVersion(s.components[0],'1.9.0');assert.equal(v.phase,'Draft');assert(!v.released);assert.throws(()=>act(s,'version',{id:'path-kernel',version:'1.9.0',notes:'重复'}),/已存在/);
});
test('published versions cannot be overwritten',()=>{assert.throws(()=>act(fresh(),'evidence',{id:'path-kernel',version:'1.8.2'}),/已发布/);});
test('component application validates scope and creates candidate',()=>{
 assert.throws(()=>act(fresh(),'create',{name:'',slug:'x'}),/名称/);
 const s=act(fresh(),'create',{name:'图形序列化',slug:'shape-codec',summary:'序列化二维图形',owner:'基础平台组',scope:'二维轮廓',exclusions:'不处理渲染',category:'数据处理',language:'C++'});
 assert.equal(M.statusOf(s.components.at(-1),'0.1.0'),'Candidate');assert(s.events.at(-1).text.includes('图形序列化'));
});
test('use registration requires valid version, project and trial acknowledgement',()=>{
 assert.throws(()=>act(fresh(),'use',{id:'signal-bus',version:'0.1.0',project:'测试项目',projectVersion:'1.0'}),/接入/);
 assert.throws(()=>act(fresh(),'use',{id:'device-link',version:'0.9.0',project:'测试项目',projectVersion:'1.0'}),/试用/);
 const s=act(fresh(),'use',{id:'device-link',version:'0.9.0',project:'测试项目',projectVersion:'1.0',trial:true});assert.equal(s.uses.at(-1).stage,'试点');
});
test('deprecation requires a published replacement and migration guide',()=>{
 assert.throws(()=>act(fresh(),'deprecate',{id:'trace-log',version:'1.3.0',replacement:'bad@1.0.0',deadline:'2026-11-20',guide:'迁移'}),/替代/);
 const s=act(fresh(),'deprecate',{id:'trace-log',version:'1.3.0',replacement:'trace-log@2.1.0',deadline:'2026-11-21',guide:'替换初始化接口'});
 assert.equal(M.statusOf(s.components.find(c=>c.id==='trace-log'),'1.3.0'),'Deprecated');
 assert.throws(()=>act(s,'use',{id:'trace-log',version:'1.3.0',project:'新增项目',projectVersion:'1.0'}),/接入/);
});
test('retirement is blocked by active consumers and an unfinished window',()=>{
 let s=act(fresh(),'deprecate',{id:'trace-log',version:'1.3.0',replacement:'trace-log@2.1.0',deadline:'2026-11-21',guide:'替换初始化接口'});
 assert.throws(()=>act(s,'retire',{id:'trace-log',version:'1.3.0'}),/使用方|迁移窗口/);
 for(const u of s.uses.filter(x=>x.component==='trace-log'&&x.version.startsWith('1.')&&x.active))s=act(s,'migrate',{useId:u.id,target:'trace-log@2.1.0'});
 assert.throws(()=>act(s,'retire',{id:'trace-log',version:'1.3.0'}),/迁移窗口/);
 s=act(s,'clock',{date:'2026-11-22'});s=act(s,'retire',{id:'trace-log',version:'1.3.0'});assert.equal(M.statusOf(s.components.find(c=>c.id==='trace-log'),'1.3.0'),'Retired');
});
test('feedback must reference an existing affected version',()=>{
 assert.throws(()=>act(fresh(),'issue',{id:'path-kernel',version:'99.0.0',title:'错误',detail:'复现',environment:'Win'}),/版本/);
 const s=act(fresh(),'issue',{id:'path-kernel',version:'1.8.2',title:'边界条件异常',detail:'空轮廓输入时报错',environment:'Windows x64',kind:'缺陷'});assert.equal(s.issues.at(-1).status,'Open');
});
test('fix must reference a released version; consumer verification closes issue',()=>{
 let s=act(fresh(),'issueTransition',{issueId:'ISS-001',next:'InProgress'});
 assert.throws(()=>act(s,'issueTransition',{issueId:'ISS-001',next:'Closed'}),/流转/);
 assert.throws(()=>act(s,'issueTransition',{issueId:'ISS-001',next:'Verify',fixed:'path-kernel@2.0.0',note:'修复'}),/发布/);
 s=act(s,'issueTransition',{issueId:'ISS-001',next:'Verify',fixed:'path-kernel@1.8.2',note:'回归通过'});
 assert.throws(()=>act(s,'issueTransition',{issueId:'ISS-001',next:'Closed',note:''}),/验证/);
 s=act(s,'issueTransition',{issueId:'ISS-001',next:'Closed',note:'使用方按复现步骤验证通过'});assert.equal(s.issues[0].status,'Closed');
 s=act(s,'issueTransition',{issueId:'ISS-001',next:'Open',note:'复现再次出现'});assert.equal(s.issues[0].status,'Open');
});
test('failed commands do not mutate input state',()=>{const s=fresh(),before=JSON.stringify(s);assert.throws(()=>act(s,'publish',{id:'signal-bus',version:'0.1.0'}));assert.equal(JSON.stringify(s),before);});
test('newly admitted candidate can enter controlled trial before formal release',()=>{
 let s=act(fresh(),'review',{id:'path-kernel',version:'2.0.0',decision:'approve',checks:M.CHECKS.map(x=>x.id),note:'受控试用准入通过'});
 assert.throws(()=>act(s,'use',{id:'path-kernel',version:'2.0.0',project:'新版试点',projectVersion:'0.1'}),/试用/);
 s=act(s,'use',{id:'path-kernel',version:'2.0.0',project:'新版试点',projectVersion:'0.1',trial:true});assert.equal(s.uses.at(-1).stage,'试点');assert.equal(M.getVersion(s.components[0],'2.0.0').released,false);
});
test('migration merges an already registered target relation instead of duplicating use',()=>{
 let s=act(fresh(),'use',{id:'config-kit',version:'1.4.0',project:'设备诊断台',projectVersion:'2.4'});
 s=act(s,'migrate',{useId:'USE-003',target:'config-kit@1.4.0'});
 assert.equal(s.uses.filter(u=>u.active&&u.component==='config-kit'&&u.project==='设备诊断台'&&u.projectVersion==='2.4').length,1);
});
