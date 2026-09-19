/* Breezus NFL GM v7 loader
   Loads the decision centre immediately so it can trigger the core GM run.
   Data-dependent enhancements wait until Sleeper data exists.
*/
(function(){
'use strict';
if(window.__gmV7Loader)return;
window.__gmV7Loader=true;
function load(src){return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=src+'?v=7.0-'+Date.now();s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
function dataReady(){try{return typeof S!=='undefined'&&S&&Array.isArray(S.rosters)&&S.rosters.length&&S.players&&Object.keys(S.players).length&&S.me}catch(e){return false}}
function boot(){
  if(typeof S==='undefined'){setTimeout(boot,100);return}
  load('gm-product-v1.js').catch(function(e){console.error('NFL GM decision centre failed',e)});
  var started=Date.now();
  (function waitData(){
    if(dataReady()){
      load('gm-app-v55-defense-streamer.js')
        .then(function(){return load('gm-app-v56-defense-nav.js')})
        .catch(function(e){console.error('NFL GM data enhancement failed',e)});
      return;
    }
    if(Date.now()-started<30000)setTimeout(waitData,300);
  })();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();