(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CBBStore=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 function commit(storage,key,base,next){
  const raw=storage.getItem(key),generation=base.generation||'initial';
  if(raw){const saved=JSON.parse(raw);if(saved.revision!==base.revision||(saved.generation||'initial')!==generation)throw new Error('另一页面更新了演示记录，请先保留输入并刷新后继续。');}
  else if(base.revision!==0||generation!=='initial')throw new Error('另一页面更新或重置了演示记录，请先保留输入并刷新后继续。');
  storage.setItem(key,JSON.stringify(next));
 }
 function reset(storage,key,next){storage.setItem(key,JSON.stringify(next));}
 return{commit,reset};
});
