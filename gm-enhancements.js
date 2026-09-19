/* Breezus NFL GM - safe enhancement loader
   v7 layers are optional. If an enhancement fails, the core app remains intact.
*/
(function(){
'use strict';
if(window.__gmSafeLoader)return; window.__gmSafeLoader=true;
function load(src){
 return new Promise(function(resolve,reject){
  var s=document.createElement('script');
  s.src=src+'?v=stable-'+Date.now();
  s.onload=function(){resolve(src)};
  s.onerror=function(){reject(Error('Failed to load '+src))};
  document.head.appendChild(s);
 });
}
function dataReady(){
 try{return typeof S!=='undefined'&&S&&Array.isArray(S.rosters)&&S.rosters.length&&S.players&&Object.keys(S.players).length&&S.me}catch(e){return false}
}
function optional(src){
 return load(src).catch(function(e){console.warn('Optional Breezus module skipped:',e.message)});
}
function boot(){
 if(typeof S==='undefined'){setTimeout(boot,100);return}
 // Core decision layer only. Never block the stable app on optional modules.
 optional('gm-product-v1.js');
 var started=Date.now();
 (function wait(){
  if(dataReady()){
   optional('gm-app-v55-defense-streamer.js')
    .then(function(){return optional('gm-app-v56-defense-nav.js')})
    .then(function(){return optional('gm-v7-playbook.js')})
    .then(function(){return optional('gm-v7-trade-analyzer.js')})
    .then(function(){return optional('gm-v7-rankings.js')});
   return;
  }
  if(Date.now()-started<30000)setTimeout(wait,300);
 })();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();