/* Breezus NFL GM v5.5 loader - non-flat defense engine */
(function(){
'use strict';
function ready(){try{return typeof S!=='undefined'&&S&&Array.isArray(S.rosters)&&S.rosters.length&&S.players&&Object.keys(S.players).length&&S.me}catch(e){return false}}
function load(src){return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=src+'?v=5.5-'+Date.now();s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
function boot(){var started=Date.now();(function wait(){if(ready()){
  load('gm-app-v42.js').then(function(){return load('gm-mobile-ui.js')}).then(function(){return load('gm-app-v43-fix.js')}).then(function(){return load('gm-app-v49-lineup-analyser.js')}).then(function(){return load('gm-app-v55-defense-streamer.js')}).then(function(){return load('gm-app-v51-defense-mobile.js')}).catch(console.error);return;
}if(Date.now()-started<20000)return setTimeout(wait,200);console.error('NFL GM: Sleeper data unavailable')})()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
