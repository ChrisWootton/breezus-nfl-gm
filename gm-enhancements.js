/* Breezus NFL GM v6.3 loader - stable core first
   The main app owns lineup, matchup, waivers, trades, dynasty and league intelligence.
   Enhancement loader only adds the isolated Defense engine + navigation.
*/
(function(){
'use strict';
function ready(){try{return typeof S!=='undefined'&&S&&Array.isArray(S.rosters)&&S.rosters.length&&S.players&&Object.keys(S.players).length&&S.me}catch(e){return false}}
function load(src){return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=src+'?v=6.3-'+Date.now();s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
function boot(){var started=Date.now();(function wait(){if(ready()){
  load('gm-app-v55-defense-streamer.js')
    .then(function(){return load('gm-app-v56-defense-nav.js')})
    .then(function(){return load('gm-product-v1.js')})
    .catch(function(e){console.error('NFL GM enhancement load failed',e)});
  return;
}if(Date.now()-started<20000)return setTimeout(wait,200);console.error('NFL GM: Sleeper data unavailable')})()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();