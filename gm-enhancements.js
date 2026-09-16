/* Breezus NFL GM Enhancement Loader v2.5 */
(function(){
  'use strict';
  function load(src){return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  load('gm-enhancements-v24.js').then(function(){return load('gm-v25-next-level.js')}).catch(function(e){console.error('GM enhancement loader failed',e)})
})();