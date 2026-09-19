/* Breezus NFL GM v5.9 - readability repair
   Premium remains dark, but all core fantasy information is deliberately high contrast.
*/
(function(){
'use strict';
if(window.__gmReadability59)return;window.__gmReadability59=true;
function boot(){
 if(document.getElementById('gm59-style'))return;
 const s=document.createElement('style');s.id='gm59-style';
 s.textContent=`
/* Core readability */
body,body *{text-shadow:none!important}
body{color:#f7f9fc!important}
.app,.page,.page *,.side,.side *{color:#eef2f7}
.hero h1,.hero h2,.hero h3,.hero strong,.hero b,.title h2,.title h3,.title strong,.title b{color:#ffffff!important}
.hero p,.sub,.meta,.note,.lab,.txmeta{color:#aeb8c7!important}

/* Core cards and tables */
.card,.metrics .card,.page>.card,.page .card{background:#11161e!important;color:#eef2f7!important;border-color:#2d3745!important}
.card *,.metrics .card *,.page>.card *,.page .card *{border-color:#2d3745}
th{color:#aeb8c7!important;font-weight:800!important}
td{color:#edf1f6!important}
.row{color:#edf1f6!important;border-color:#2d3745!important}
.row b,.row strong,.row .name,.player-name{color:#ffffff!important}
.smallbtn{color:#f3f6fa!important;background:#1a202a!important;border-color:#394453!important}

/* v4.9 Lineup analyser: override its old light theme completely */
#lineup{color:#eef2f7!important}
#lineup h2{color:#ffffff!important}
#lineup .gm49-card,#lineup .gm49-position{background:#121821!important;color:#eef2f7!important;border:1px solid #303a48!important;box-shadow:0 8px 24px rgba(0,0,0,.18)!important}
#lineup .gm49-title b,#lineup .gm49-bench b{color:#ffffff!important;font-size:14px!important;font-weight:900!important}
#lineup .gm49-meta{color:#aeb8c7!important;font-size:10px!important;opacity:1!important}
#lineup .gm49-sub{color:#aeb8c7!important}
#lineup .gm49-reason{color:#d3dae4!important}
#lineup .gm49-replace{background:#1a212c!important;color:#f0f3f7!important;border:1px solid #303a48!important}
#lineup .gm49-replace span{color:#aeb8c7!important}
#lineup .gm49-slot{background:#252e3a!important;color:#dce3ec!important}
#lineup .gm49-poshead{background:#171e28!important;color:#eef2f7!important;border-bottom:1px solid #303a48!important}
#lineup .gm49-poshead h3{color:#ffffff!important}
#lineup .gm49-poshead span{color:#aeb8c7!important}
#lineup .gm49-bench{border-top:1px solid #303a48!important}
#lineup .gm49-rank{color:#9da8b8!important}
#lineup .gm49-bench>strong{color:#ffffff!important}
#lineup .gm49-muted{color:#aeb8c7!important}
#lineup .gm49-unavailable .gm49-poshead{background:#24191c!important}
#lineup .gm49-pill{font-weight:950!important}
#lineup .gm49-green{background:#10382f!important;color:#71f1c9!important;border:1px solid #1d6655!important}
#lineup .gm49-amber{background:#3a2d12!important;color:#ffdc79!important;border:1px solid #72591d!important}
#lineup .gm49-red{background:#3d1d21!important;color:#ff8b94!important;border:1px solid #71343b!important}
#lineup .gm49-kpi{color:#ffffff!important}

/* Player names: deliberately large and bright */
.g42-player,.g42-name,.g49-name,.g49-player,.gm-player-name,.player-name,.name{color:#ffffff!important;font-size:14px!important;font-weight:900!important;opacity:1!important}
.g42-meta,.g49-meta,.gm-player-meta,.player-meta{color:#aeb8c7!important;font-size:10px!important;opacity:1!important}

/* Status pills */
.pill{color:#dce3ec!important;background:#1b222c!important;border-color:#394453!important}
.pill.green{color:#6ff0c7!important;background:rgba(99,230,190,.13)!important;border-color:rgba(99,230,190,.35)!important}
.pill.amber{color:#ffd979!important;background:rgba(245,200,106,.13)!important;border-color:rgba(245,200,106,.35)!important}
.pill.blue{color:#a9c1ff!important;background:rgba(122,162,255,.13)!important;border-color:rgba(122,162,255,.35)!important}

/* Dynasty War Room */
.gdw-shell,.gdw-shell *{box-sizing:border-box}
.gdw-shell{color:#f7f9fc!important}
.gdw-sub{color:#aeb8c7!important}
.gdw-kpi{background:#171d26!important;border-color:#303a48!important}
.gdw-kpi b{color:#ffffff!important}
.gdw-kpi span{color:#aeb8c7!important}
.gdw-card{background:#151b24!important;border-color:#303a48!important}
.gdw-card h4{color:#dce3ec!important}
.gdw-mode,.gdw-name{color:#ffffff!important}
.gdw-meta{color:#aeb8c7!important}
.gdw-player{border-color:#303a48!important}
.gdw-action{background:#181f29!important;border-color:#354150!important;color:#f4f7fb!important}
.gdw-action span{color:#aeb8c7!important}
.gdw-green{color:#6ff0c7!important}.gdw-blue{color:#a9c1ff!important}.gdw-gold{color:#ffd979!important}

/* Defense */
#defensePage,#defensePage *{color:#eef2f7}
#defensePage .gm55-card,#defensePage .gm55-week{background:#11161e!important;border-color:#303a48!important}
#defensePage .gm55-current{color:#6ff0c7!important;background:rgba(99,230,190,.1)!important}
#defensePage .gm55-best{color:#c9bcff!important;background:rgba(167,139,250,.1)!important}
#defensePage .gm55-meta,#defensePage .gm55-note{color:#aeb8c7!important}
#defensePage .gm55-score{color:#ffffff!important;font-weight:900!important}

/* Navigation */
.nav button{color:#b6bfcc!important}
.nav button.active{color:#ffffff!important}
.nav button:hover{color:#ffffff!important}

/* Mobile: readable one-hand UI */
@media(max-width:850px){
 body.gm-mobile-ready .app{padding:8px 8px 86px!important}
 .hero h1{font-size:19px!important}
 .hero p{font-size:11px!important;color:#aeb8c7!important}
 .card{font-size:12px!important}
 #lineup .gm49-title b,#lineup .gm49-bench b{font-size:15px!important}
 #lineup .gm49-meta{font-size:11px!important}
 #lineup .gm49-reason{font-size:12px!important;line-height:1.45!important}
 #lineup .gm49-kpi{font-size:30px!important}
 .gdw-title{font-size:22px!important}.gdw-sub{font-size:11px!important}
 .gdw-name{font-size:13px!important}.gdw-meta{font-size:9px!important}
 .gdw-kpi b{font-size:20px!important}
 .gm-mob-label{color:#aeb8c7!important}.gm-mob-btn.active .gm-mob-label{color:#6ff0c7!important}
}
`;
 document.head.appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
