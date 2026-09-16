/* Breezus NFL GM UX v2.6 */
(function(){
  'use strict';
  if(window.__gm26UXBooted)return;
  window.__gm26UXBooted=true;

  const $=id=>document.getElementById(id);
  const nav=id=>{const b=document.querySelector('.nav button[data-p="'+id+'"]');if(b)b.click()};

  function css(){
    if($('gm26-ux-style'))return;
    const s=document.createElement('style');s.id='gm26-ux-style';
    s.textContent=`
      @media(max-width:850px){
        body.gm26-ux .page>.card{margin-bottom:10px}
        body.gm26-ux .page>.card .title{align-items:flex-start}
        body.gm26-ux .page>.card .title h2{font-size:18px}
        body.gm26-ux .page>.card .title h3{font-size:15px}
        body.gm26-ux .gm25,.gm26{border-radius:15px!important}
        body.gm26-ux .gm26-quick{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin:10px 0}
        body.gm26-ux .gm26-q{border:1px solid var(--line);background:#fff;border-radius:13px;padding:11px;text-align:left;font-weight:900;min-height:60px}
        body.gm26-ux .gm26-q small{display:block;color:var(--muted);font-size:9px;margin-top:3px;font-weight:700}
        body.gm26-ux .gm26-q:active{transform:scale(.98)}
        body.gm26-ux .gm26-hide-mobile{display:none!important}
        body.gm26-ux .gm25grid{gap:7px!important}
        body.gm26-ux .gm25grid .gm25card{padding:10px!important}
      }
      @media(min-width:851px){.gm26-quick{display:none}}
      .gm26-collapse{border:0;background:transparent;font-weight:900;font-size:11px;color:var(--muted);padding:4px 0;cursor:pointer}
      .gm26-collapsed> :not(.gm26-head){display:none!important}
      .gm26-head{display:flex;justify-content:space-between;align-items:center;gap:8px}
    `;
    document.head.appendChild(s);
  }

  function quick(){
    if($('gm26-quick'))return;
    const dash=$('dash');if(!dash)return;
    const el=document.createElement('div');el.id='gm26-quick';el.className='gm26-quick';
    const items=[['🧠','Lineup','Set your best starters','lineup'],['💰','Waivers','Find useful adds','waiversPage'],['⚔️','Matchup','See positional edges','match'],['🤝','Trades','Explore trade targets','trades']];
    el.innerHTML=items.map(x=>`<button type="button" class="gm26-q" data-gm26-nav="${x[3]}">${x[0]} ${x[1]}<small>${x[2]}</small></button>`).join('');
    dash.insertBefore(el,dash.firstElementChild);el.querySelectorAll('[data-gm26-nav]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.gm26Nav)));
  }

  function hideDead(){
    // Remove only the superseded duplicate comparison if an old cached script has injected it.
    ['gm25-def-compare'].forEach(id=>{const el=$(id);if(el)el.remove()});
    // Hide empty native cards rather than leaving blank shells after the GM has run.
    document.querySelectorAll('.page>.card').forEach(card=>{
      if(card.closest('#lineup,#match,#ordersPage,#intelPage,#waiversPage,#playersPage,#trades,#dynastyPage,#leaguePage,#activity,#settings')){
        const meaningful=[...card.querySelectorAll('[id]')].some(x=>x.textContent.trim()&&x.textContent.trim()!=='—');
        if(!meaningful&&card.textContent.trim().length<120)card.classList.add('gm26-empty');
      }
    });
  }

  function simplify(){
    // Technical copy stays available on desktop, but is quieter on phones.
    document.querySelectorAll('.note,.gm25small,.gm2small').forEach(el=>{
      if(el.textContent.length>150)el.classList.add('gm26-long-note');
    });
    if(!$('gm26-clean-style')){
      const s=document.createElement('style');s.id='gm26-clean-style';s.textContent='@media(max-width:850px){.gm26-long-note{display:none!important}.gm26-empty{display:none!important}}';document.head.appendChild(s)
    }
  }

  function boot(){
    css();document.body.classList.add('gm26-ux');quick();hideDead();simplify();
    setTimeout(()=>{hideDead();simplify()},1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
