(function(root,factory){if(typeof module==='object'&&module.exports){module.exports=factory();}else{root.CBBMetrics=factory();}})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const asArray=x=>Array.isArray(x)?x:[];
  const ratio=(n,d)=>d?Math.round(n/d*1000)/10:null;
  const unique=(rows,key)=>[...new Map(rows.map(row=>[key(row),row])).values()];
  function scopeAssets(data,bg='all',includeArchived=false){return asArray(data.assets).filter(a=>(bg==='all'||a.bg===bg)&&(includeArchived||a.status==='managed'));}
  function isComplete(asset,data){return Boolean(asset.owner&&asset.boundary&&asset.verified&&asArray(data.versions).some(v=>v.assetId===asset.id&&v.artifact&&v.docs&&v.platform));}
  function effectiveUsages(data,bg='all'){
    const ids=new Set(scopeAssets(data,bg).map(a=>a.id));
    return unique(asArray(data.usages).filter(u=>ids.has(u.assetId)&&asArray(data.versions).some(v=>v.id===u.versionId&&v.assetId===u.assetId)&&u.stage==='released'&&u.verified&&u.evidence&&u.observedAt<=data.meta.asOf),u=>[u.assetId,u.versionId,u.projectId].join('|'));
  }
  function actionCohort(data,bg='all',month='2026-11'){
    return asArray(data.actions).filter(a=>(bg==='all'||a.bg===bg)&&a.originalDue.startsWith(month)&&a.originalDue<=data.meta.asOf);
  }
  function isClosed(a,asOf){return a.status==='closed'&&Boolean(a.evidence&&a.closedAt&&a.closedAt<=asOf);}
  function actionState(a,asOf){
    if(a.status==='canceled')return 'canceled';
    if(a.status==='closed')return isClosed(a,asOf)?'closed':'unproven';
    if(a.originalDue>asOf)return 'upcoming';
    return 'overdue';
  }
  function calculate(data,bg='all',month='2026-11'){
    const assets=scopeAssets(data,bg),complete=assets.filter(a=>isComplete(a,data));
    const usages=effectiveUsages(data,bg),byId=new Map(assets.map(a=>[a.id,a]));
    const cross=usages.filter(u=>byId.get(u.assetId).bg!==u.consumerBg);
    const cohort=actionCohort(data,bg,month),closed=cohort.filter(a=>isClosed(a,data.meta.asOf));
    return {assets,complete,usages,cross,cohort,closed,completeness:ratio(complete.length,assets.length),closure:ratio(closed.length,cohort.length),crossAssets:new Set(cross.map(u=>u.assetId)).size,crossProjects:new Set(cross.map(u=>u.projectId)).size,overdue:cohort.filter(a=>actionState(a,data.meta.asOf)==='overdue'),unproven:cohort.filter(a=>actionState(a,data.meta.asOf)==='unproven'),canceled:cohort.filter(a=>a.status==='canceled'),rescheduled:cohort.filter(a=>a.due!==a.originalDue)};
  }
  function matrix(data){return data.bgs.map(provider=>({provider:provider.id,counts:data.bgs.map(consumer=>new Set(effectiveUsages(data,provider.id).filter(u=>u.consumerBg===consumer.id).map(u=>u.assetId)).size)}));}
  function csv(headers,rows){const cell=x=>{let s=String(x??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};return '\uFEFF'+[headers,...rows].map(r=>r.map(cell).join(',')).join('\r\n');}
  return {ratio,unique,scopeAssets,isComplete,effectiveUsages,actionCohort,isClosed,actionState,calculate,matrix,csv};
});
