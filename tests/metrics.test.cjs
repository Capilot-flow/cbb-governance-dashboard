const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../src/metrics.js');
const D=require('../data/mock.json');
const clone=()=>structuredClone(D);

test('mock identities and relational keys are explicit and consistent',()=>{
  assert.equal(D.meta.isMock,true);assert.equal(D.bgs.length,6);
  assert.equal(new Set(D.assets.map(a=>a.id)).size,D.assets.length);
  for(const u of D.usages){assert(D.assets.some(a=>a.id===u.assetId));assert(D.versions.some(v=>v.id===u.versionId&&v.assetId===u.assetId));assert(D.bgs.some(b=>b.id===u.consumerBg));}
});
test('archived rows stay visible but do not dilute the inventory denominator',()=>{
  const c=M.calculate(D);assert.equal(c.assets.length,38);assert.equal(M.scopeAssets(D,'all',true).length,42);
  assert(c.complete.every(a=>a.status==='managed'&&a.owner&&a.verified));
});
test('missing Owner, boundary, artifact, docs or verification cannot inflate completeness',()=>{
  const d=clone(),a=d.assets.find(a=>M.isComplete(a,d));
  for(const field of ['owner','boundary','verified']){const x=clone(),item=x.assets.find(t=>t.id===a.id);item[field]=null;assert.equal(M.isComplete(item,x),false);}
  d.versions.filter(v=>v.assetId===a.id).forEach(v=>v.docs=null);assert.equal(M.isComplete(a,d),false);
});
test('trial, unverified, missing-proof, future and invalid-version usage are excluded',()=>{
  const d=clone(),valid=M.effectiveUsages(d)[0],before=M.effectiveUsages(d).length;
  for(const patch of [{stage:'trial'},{verified:false},{evidence:null},{observedAt:'2026-12-01'},{versionId:'NOT-A-VERSION'}]){const x=clone();x.usages=[{...valid,...patch}];assert.equal(M.effectiveUsages(x).length,0);}
  d.usages.push({...valid,id:'DUPLICATE'});assert.equal(M.effectiveUsages(d).length,before);
});
test('cross-BG component counts are distinct assets, not matrix cell totals',()=>{
  const c=M.calculate(D),map=new Map(D.assets.map(a=>[a.id,a.bg]));
  assert(c.cross.every(u=>map.get(u.assetId)!==u.consumerBg));
  assert.equal(c.crossAssets,new Set(c.cross.map(u=>u.assetId)).size);
  assert.equal(c.crossProjects,new Set(c.cross.map(u=>u.projectId)).size);
});
test('BG scoping is supplier-side and never silently changes to consumer-side',()=>{
  for(const bg of D.bgs){const c=M.calculate(D,bg.id);assert(c.assets.every(a=>a.bg===bg.id));assert(c.cohort.every(a=>a.bg===bg.id));}
});
test('moving the deadline does not remove actions from their original cohort',()=>{
  const d=clone(),item=M.actionCohort(d)[0],before=M.actionCohort(d).length;
  d.actions.find(a=>a.id===item.id).due='2027-01-01';assert.equal(M.actionCohort(d).length,before);
  assert(M.calculate(d).rescheduled.some(a=>a.id===item.id));
});
test('cancellation remains in original cohort and is separately visible',()=>{
  const c=M.calculate(D);assert(c.canceled.length>0);assert(c.canceled.every(a=>c.cohort.includes(a)));assert(c.canceled.every(a=>!c.closed.includes(a)));
});
test('closed label without actual evidence is not an accepted closure',()=>{
  const d=clone(),item=M.actionCohort(d).find(a=>a.status==='closed'&&a.evidence);
  item.evidence=null;assert.equal(M.isClosed(item,d.meta.asOf),false);assert.equal(M.actionState(item,d.meta.asOf),'unproven');
});
test('future due dates do not enter the snapshot denominator',()=>{
  const c=M.calculate(D);assert(c.cohort.every(a=>a.originalDue<=D.meta.asOf));
  assert(D.actions.some(a=>a.originalDue>D.meta.asOf));
});
test('zero denominator is unknown, not a misleading zero percent',()=>{
  assert.equal(M.ratio(0,0),null);const d={...D,assets:[],versions:[],usages:[],actions:[]};assert.equal(M.calculate(d).completeness,null);assert.equal(M.calculate(d).closure,null);
});
test('matrix values match filtered unique assets for every provider/consumer pair',()=>{
  for(const row of M.matrix(D)){for(let i=0;i<D.bgs.length;i++){const expected=new Set(M.effectiveUsages(D,row.provider).filter(u=>u.consumerBg===D.bgs[i].id).map(u=>u.assetId)).size;assert.equal(row.counts[i],expected);}}
});
test('CSV preserves Unicode, quoting, BOM and prevents spreadsheet formula execution',()=>{
  const csv=M.csv(['标题','内容'],[['中文','带"引号"'],['=1+1','换\n行']]);assert(csv.startsWith('\uFEFF'));assert(csv.includes('带""引号""'));assert(csv.includes("'=1+1"));assert(csv.includes('中文'));
});
