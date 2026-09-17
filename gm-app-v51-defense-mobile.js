/* Breezus NFL GM v5.1 mobile Defense tab */
(function(){
'use strict';
if(window.__gm51DefenseMobileBooted)return;window.__gm51DefenseMobileBooted=true;
function add(){
 const bar=document.getElementById('gm-mobile-bar');
 const nav=document.querySelector('.nav button[data-p="defensePage"]');
 if(!bar||!nav)return false;
 if(!bar.querySelector('[data-p="defensePage"]')){
  const b=document.createElement('button');b.type='button';b.className='gm-mob-btn';b.dataset.p='defensePage';b.innerHTML='<span class="gm-mob-icon">🛡️</span><span class="gm-mob-label">Defense</span>';
  b.addEventListener('click',()=>{nav.click();window.scrollTo({top:0,behavior:'smooth'})});
  const more=bar.querySelector('#gm-mobile-more-btn');if(more)bar.insertBefore(b,more);else bar.appendChild(b);
 }
 bar.style.gridTemplateColumns='repeat(6,1fr)';
 return true;
}
let tries=0;const t=setInterval(()=>{if(add()||++tries>60)clearInterval(t)},300);add();
})();
