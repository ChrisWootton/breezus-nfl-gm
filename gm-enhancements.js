/* Breezus NFL GM Enhancement Loader v2.8 */
(function(){
  'use strict';
  function gmDataReady(){try{return typeof S!=='undefined'&&S&&Array.isArray(S.rosters)&&S.rosters.length>0&&S.players&&Object.keys(S.players).length>0&&S.me}catch(e){return false}}
  function waitForSleeperData(done){var started=Date.now();function check(){if(gmDataReady())return done();if(Date.now()-started>20000)return done();setTimeout(check,200)}check()}
  function load(src){return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=src+'?v='+Date.now();s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  waitForSleeperData(function(){
    window.__gmEnhancementsBooting=true;
    load('gm-v25-roster-fresh.js')
      .then(function(){return window.gmRosterRefreshPromise||true})
      .then(function(){return load('gm-enhancements-v24.js')})
      .then(function(){return load('gm-v25-next-level.js')})
      .then(function(){return load('gm-v25-live-availability.js')})
      .then(function(){return load('gm-v25-trending.js')})
      .then(function(){return load('gm-v25-def-streaming.js')})
      .then(function(){return load('gm-mobile-ui.js')})
      .then(function(){return load('gm-v26-ux.js')})
      .then(function(){return load('gm-v27-weekly-gm.js')})
      .then(function(){return load('gm-v27-action-board.js')})
      .then(function(){return load('gm-v28-full-lineup.js')})
      .then(function(){window.__gmEnhancementsBooting=false})
      .catch(function(e){window.__gmEnhancementsBooting=false;console.error('GM enhancement loader failed',e)})
  })
})();