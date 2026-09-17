/* Breezus NFL GM v5.6 - restore Defense navigation */
(function(){
'use strict';
if(window.__gm56DefenseNavBooted)return;window.__gm56DefenseNavBooted=true;
function activate(){
 const page=document.getElementById('defensePage');
 if(!page)return;
 document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
 page.classList.add('active');
 document.querySelectorAll('.nav button[data-p]').forEach(b=>b.classList.toggle('active',b.dataset.p==='defensePage'));
 document.querySelectorAll('#gm-mobile-bar .gm-mob-btn').forEach(b=>b.classList.toggle('active',b.dataset.p==='defensePage'));
 window.scrollTo({top:0,behavior:'smooth'});
}
function addDesktop(){
 const nav=document.querySelector('.nav');
 if(!nav||nav.querySelector('[data-p="defensePage"]'))return !!nav?.querySelector('[data-p="defensePage"]');
 const b=document.createElement('button');
 b.type='button';b.dataset.p='defensePage';b.textContent='🛡️ Defense';
 b.addEventListener('click',activate);
 const rosterLabel=Array.from(nav.querySelectorAll('small')).find(x=>x.textContent.trim().toLowerCase()==='roster');
 if(rosterLabel)nav.insertBefore(b,rosterLabel);else nav.appendChild(b);
 return true;
}
function addMobile(){
 const bar=document.getElementById('gm-mobile-bar');
 if(!bar)return false;
 let b=bar.querySelector('[data-p="defensePage"]');
 if(!b){
  b=document.createElement('button');b.type='button';b.className='gm-mob-btn';b.dataset.p='defensePage';
  b.innerHTML='<span class="gm-mob-icon">🛡️</span><span class="gm-mob-label">Defense</span>';
  b.addEventListener('click',activate);
  const more=bar.querySelector('#gm-mobile-more-btn');
  if(more)bar.insertBefore(b,more);else bar.appendChild(b);
 }
 bar.style.gridTemplateColumns='repeat(6,1fr)';
 return true;
}
function boot(){
 let tries=0;
 const t=setInterval(()=>{
  const a=addDesktop(),b=addMobile();
  if((a&&b)||++tries>80)clearInterval(t);
 },250);
 addDesktop();addMobile();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
