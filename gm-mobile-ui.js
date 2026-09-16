/* Breezus NFL GM Mobile UI v1.0 */
(function(){
  'use strict';
  if(window.__gmMobileUIBooted)return;
  window.__gmMobileUIBooted=true;

  const items=[
    {id:'dash',label:'Home',icon:'⌂'},
    {id:'lineup',label:'Lineup',icon:'🧠'},
    {id:'match',label:'Matchup',icon:'⚔'},
    {id:'waiversPage',label:'Waivers',icon:'+'}
  ];
  const more=[
    {id:'ordersPage',label:'GM Orders',icon:'📋'},
    {id:'intelPage',label:'GM Intelligence',icon:'🧠'},
    {id:'playersPage',label:'Players',icon:'👥'},
    {id:'trades',label:'Trade Finder',icon:'🤝'},
    {id:'dynastyPage',label:'Dynasty',icon:'📈'},
    {id:'leaguePage',label:'League',icon:'🏆'},
    {id:'activity',label:'Activity',icon:'📰'},
    {id:'settings',label:'Settings',icon:'⚙'}
  ];

  function css(){
    if(document.getElementById('gm-mobile-ui-style'))return;
    const s=document.createElement('style');s.id='gm-mobile-ui-style';
    s.textContent=`
      #gm-mobile-bar,#gm-mobile-more{display:none}
      @media(max-width:850px){
        body.gm-mobile-ready{padding-bottom:76px}
        body.gm-mobile-ready .app{padding:8px 8px 18px}
        body.gm-mobile-ready .hero{border-radius:18px;padding:12px;gap:9px}
        body.gm-mobile-ready .hero .brand{gap:9px}
        body.gm-mobile-ready .hero .logo{width:42px;height:42px;border-radius:13px;font-size:21px}
        body.gm-mobile-ready .hero h1{font-size:18px}
        body.gm-mobile-ready .hero p{font-size:10px}
        body.gm-mobile-ready .heroActions{width:100%}
        body.gm-mobile-ready .heroActions .run{min-width:0;width:100%;min-height:42px;font-size:12px}
        body.gm-mobile-ready .metrics{grid-template-columns:repeat(2,1fr);gap:7px;margin:9px 0}
        body.gm-mobile-ready .metrics .card{padding:10px;border-radius:14px}
        body.gm-mobile-ready .metrics .num{font-size:22px}
        body.gm-mobile-ready .metrics .sub{font-size:10px}
        body.gm-mobile-ready .layout{display:block;margin-top:8px!important}
        body.gm-mobile-ready .side{display:none}
        body.gm-mobile-ready main{min-width:0}
        body.gm-mobile-ready .page>.card{border-radius:15px;padding:12px}
        body.gm-mobile-ready .grid2,body.gm-mobile-ready .grid3{grid-template-columns:1fr}
        body.gm-mobile-ready .statgrid,body.gm-mobile-ready .healthgrid{grid-template-columns:repeat(2,1fr)}
        body.gm-mobile-ready .title h2{font-size:19px}
        body.gm-mobile-ready .title h3{font-size:16px}
        body.gm-mobile-ready .note{font-size:11px}
        body.gm-mobile-ready .row{padding:10px 0}
        body.gm-mobile-ready .tablewrap{margin:0 -4px}
        body.gm-mobile-ready table{font-size:11px}
        body.gm-mobile-ready th,body.gm-mobile-ready td{padding:7px 5px}
        body.gm-mobile-ready #gm-mobile-bar{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;z-index:1000;left:8px;right:8px;bottom:8px;min-height:60px;background:rgba(23,0,47,.97);border-radius:18px;padding:5px;box-shadow:0 8px 30px rgba(23,0,47,.24);padding-bottom:max(5px,env(safe-area-inset-bottom))}
        body.gm-mobile-ready .gm-mob-btn{border:0;background:transparent;color:#cfc6d6;border-radius:13px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-weight:850;font-size:9px;min-width:0;min-height:50px;touch-action:manipulation}
        body.gm-mobile-ready .gm-mob-btn .gm-mob-icon{font-size:18px;line-height:20px}
        body.gm-mobile-ready .gm-mob-btn.active{background:#32174f;color:#fff}
        body.gm-mobile-ready .gm-mob-btn.active .gm-mob-label{color:#21c69c}
        body.gm-mobile-ready #gm-mobile-more{position:fixed;z-index:1001;left:8px;right:8px;bottom:76px;background:#fff;border:1px solid #e6e0da;border-radius:18px;padding:10px;box-shadow:0 12px 35px rgba(23,0,47,.18);max-height:70vh;overflow:auto}
        body.gm-mobile-ready #gm-mobile-more.open{display:block}
        body.gm-mobile-ready .gm-more-head{display:flex;justify-content:space-between;align-items:center;padding:5px 5px 9px;font-weight:950}
        body.gm-mobile-ready .gm-more-close{border:0;background:#f4f2ef;border-radius:9px;width:34px;height:34px;font-size:18px}
        body.gm-mobile-ready .gm-more-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}
        body.gm-mobile-ready .gm-more-item{border:1px solid #e6e0da;background:#faf9f7;border-radius:12px;padding:11px;text-align:left;font-weight:850;min-height:50px;touch-action:manipulation}
        body.gm-mobile-ready .gm-more-item span{display:block;font-size:17px;margin-bottom:2px}
        body.gm-mobile-ready #gm-mobile-backdrop{display:none;position:fixed;z-index:1000;inset:0;background:rgba(23,0,47,.28)}
        body.gm-mobile-ready #gm-mobile-backdrop.open{display:block}
      }
    `;
    document.head.appendChild(s);
  }

  function findNav(id){return document.querySelector('.nav button[data-p="'+id+'"]')}
  function go(id){
    const b=findNav(id);
    if(b){b.click();window.scrollTo({top:0,behavior:'smooth'});closeMore();return true}
    return false;
  }
  function activePage(){
    const p=document.querySelector('.page.active');return p?p.id:'dash';
  }
  function sync(){
    const current=activePage();
    document.querySelectorAll('#gm-mobile-bar .gm-mob-btn').forEach(b=>b.classList.toggle('active',b.dataset.p===current));
  }
  function closeMore(){
    const m=document.getElementById('gm-mobile-more'),back=document.getElementById('gm-mobile-backdrop');
    if(m)m.classList.remove('open');if(back)back.classList.remove('open');
  }
  function build(){
    if(document.getElementById('gm-mobile-bar'))return;
    const bar=document.createElement('nav');bar.id='gm-mobile-bar';bar.setAttribute('aria-label','Mobile navigation');
    items.forEach(x=>{
      const b=document.createElement('button');b.type='button';b.className='gm-mob-btn';b.dataset.p=x.id;b.innerHTML='<span class="gm-mob-icon">'+x.icon+'</span><span class="gm-mob-label">'+x.label+'</span>';b.addEventListener('click',()=>go(x.id));bar.appendChild(b);
    });
    const moreBtn=document.createElement('button');moreBtn.type='button';moreBtn.className='gm-mob-btn';moreBtn.id='gm-mobile-more-btn';moreBtn.innerHTML='<span class="gm-mob-icon">☰</span><span class="gm-mob-label">More</span>';moreBtn.addEventListener('click',()=>{
      const m=document.getElementById('gm-mobile-more'),back=document.getElementById('gm-mobile-backdrop');
      m.classList.toggle('open');back.classList.toggle('open');
    });bar.appendChild(moreBtn);document.body.appendChild(bar);

    const back=document.createElement('div');back.id='gm-mobile-backdrop';back.addEventListener('click',closeMore);document.body.appendChild(back);
    const sheet=document.createElement('section');sheet.id='gm-mobile-more';sheet.setAttribute('aria-label','More GM sections');
    sheet.innerHTML='<div class="gm-more-head"><span>GM sections</span><button type="button" class="gm-more-close" aria-label="Close">×</button></div><div class="gm-more-grid"></div>';
    sheet.querySelector('.gm-more-close').addEventListener('click',closeMore);
    const grid=sheet.querySelector('.gm-more-grid');
    more.forEach(x=>{
      const b=document.createElement('button');b.type='button';b.className='gm-more-item';b.innerHTML='<span>'+x.icon+'</span>'+x.label;b.addEventListener('click',()=>go(x.id));grid.appendChild(b);
    });document.body.appendChild(sheet);

    document.addEventListener('click',e=>{
      const b=e.target.closest('.nav button[data-p]');if(b)setTimeout(sync,0);
    });
    const observer=new MutationObserver(()=>sync());
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
    sync();
  }
  function boot(){css();build();document.body.classList.add('gm-mobile-ready');sync()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
