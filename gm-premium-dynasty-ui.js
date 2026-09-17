/* Breezus NFL GM - premium dynasty UI skin
   Visual layer only. Keeps the existing GM engines and Sleeper data intact.
*/
(function(){
'use strict';
if(window.__premiumDynastyUiBooted)return;window.__premiumDynastyUiBooted=true;
function css(){
 if(document.getElementById('premium-dynasty-ui'))return;
 const s=document.createElement('style');s.id='premium-dynasty-ui';
 s.textContent=`
:root{--pd-bg:#090b10;--pd-panel:#10131a;--pd-panel2:#151923;--pd-line:#252b36;--pd-text:#f5f7fb;--pd-muted:#8992a3;--pd-accent:#63e6be;--pd-blue:#7aa2ff;--pd-gold:#f5c86a;--pd-red:#ff707d;--pd-purple:#a78bfa}
body{background:radial-gradient(circle at 50% -10%,#202938 0,#0b0e14 42%,#080a0e 100%)!important;color:var(--pd-text)!important}
body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.035;background-image:linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px);background-size:36px 36px;z-index:-1}
.app{max-width:1440px!important;padding:18px!important}
.hero{background:linear-gradient(135deg,#151a24,#0d1017 62%,#17271f)!important;border:1px solid #2b3442!important;border-radius:20px!important;box-shadow:0 18px 60px rgba(0,0,0,.35)!important;padding:18px 20px!important}
.hero .logo{background:linear-gradient(135deg,#63e6be,#38bdf8)!important;color:#06100e!important;box-shadow:0 8px 24px rgba(99,230,190,.2)}
.hero h1{font-size:22px!important;letter-spacing:-.04em}.hero p{color:#8f9aaa!important}
.btn.run{background:linear-gradient(135deg,#63e6be,#4fd1a9)!important;color:#07110e!important;box-shadow:0 8px 25px rgba(99,230,190,.16)}
.metrics{gap:8px!important}.metrics .card,.card{background:linear-gradient(180deg,#12161e,#0f131a)!important;border:1px solid var(--pd-line)!important;box-shadow:0 10px 30px rgba(0,0,0,.18)!important;color:var(--pd-text)!important}
.metrics .card{border-radius:14px!important;padding:13px!important}.lab,.kpi,.meta,.sub,.note,.txmeta{color:var(--pd-muted)!important}
.num{color:#fff!important}.layout{gap:14px!important}.side{background:#0d1118!important;border:1px solid #242a35!important;border-radius:16px!important;box-shadow:0 15px 35px rgba(0,0,0,.25)}
.nav button{color:#9ca5b5!important;border-radius:9px!important}.nav button:hover{background:#171d27!important;color:#fff!important}.nav button.active{background:linear-gradient(90deg,#182a27,#151b22)!important;color:#fff!important;box-shadow:inset 3px 0 0 var(--pd-accent)!important}
.page>.card,.page .card{border-radius:16px!important}.title h2,.title h3{color:#fff!important}
.pill{border:1px solid #2b3440!important;background:#171c25!important;color:#aeb7c6!important}.pill.green{background:rgba(99,230,190,.1)!important;color:#63e6be!important;border-color:rgba(99,230,190,.25)!important}.pill.amber{background:rgba(245,200,106,.1)!important;color:#f5c86a!important;border-color:rgba(245,200,106,.22)!important}.pill.blue{background:rgba(122,162,255,.1)!important;color:#9db9ff!important;border-color:rgba(122,162,255,.2)!important}
.row,th,td{border-color:#252b36!important}.smallbtn{background:#151a23!important;color:#d8dde6!important;border-color:#2a313d!important}.smallbtn:hover{background:#1b222d!important}
.match{background:linear-gradient(135deg,#101820,#10161c)!important}.bar{background:#222832!important}.bar i{background:linear-gradient(90deg,#63e6be,#7aa2ff)!important}
.intel{background:linear-gradient(135deg,#121724,#15111f)!important;border-color:#2b3342!important}
#status{background:#10151d!important;color:#cbd2dc!important}
#defensePage .gm55-card,#defensePage .gm55-week{background:linear-gradient(180deg,#12161e,#0f131a)!important;border-color:#28303b!important;color:#f5f7fb!important}
#defensePage .gm55-current{background:rgba(99,230,190,.08)!important;color:#63e6be!important;border:1px solid rgba(99,230,190,.16)!important}
#defensePage .gm55-best{background:rgba(167,139,250,.09)!important;color:#c4b5fd!important;border:1px solid rgba(167,139,250,.18)!important}
#defensePage .gm55-meta,.gm55-note{color:#8f98a8!important}.gm55-row{border-color:#252b36!important}.gm55-score{color:#fff!important}
#gm-mobile-bar{background:rgba(10,13,18,.96)!important;border:1px solid #29303b!important;box-shadow:0 12px 35px rgba(0,0,0,.45)!important;backdrop-filter:blur(16px)}
.gm-mob-btn{color:#7f899a!important}.gm-mob-btn.active{background:#18211f!important}.gm-mob-btn.active .gm-mob-label{color:#63e6be!important}
@media(max-width:850px){body.gm-mobile-ready .app{padding:8px 8px 18px!important}.hero{border-radius:16px!important}.hero h1{font-size:18px!important}.metrics .card{border-radius:12px!important}.page>.card{border-radius:14px!important}.side{display:none!important}}
`;
 document.head.appendChild(s);
}
function addDynastyHeader(){
 const hero=document.querySelector('.hero');if(!hero||hero.querySelector('.pd-mode'))return;
 const p=document.createElement('div');p.className='pd-mode';p.style.cssText='margin-top:8px;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#63e6be';p.textContent='DYNASTY WAR ROOM · LIVE';
 const brand=hero.querySelector('.brand>div:last-child');if(brand)brand.appendChild(p);
}
function boot(){css();addDynastyHeader()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();