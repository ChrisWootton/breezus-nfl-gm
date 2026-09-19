/* Breezus NFL GM v7.0 - unified GM interface */
(function(){
'use strict';
if(window.__breezusV7UI)return;window.__breezusV7UI=true;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const V=()=>window.BREEZUS_V7, M=()=>V()?.model, nm=id=>window.pn?.(id)||id, pm=id=>window.pm?.(id)||'', score=id=>Number(window.expectedPoints?.(id)||0);
function card(title,body,badge=''){return '<div class="card"><div class="title"><h3>'+title+'</h3>'+ (badge?'<span class="pill green">'+badge+'</span>':'')+'</div>'+body+'</div>'}
function row(left,right){return '<div class="row"><span>'+left+'</span><span>'+right+'</span></div>'}
function pill(t,c='blue'){return '<span class="pill '+c+'">'+t+'</span>'}
function renderDash(){
 const m=M();if(!m)return;
 const urgent=m.orders.filter(x=>x.priority==='URGENT').length, action=m.orders.filter(x=>x.priority==='ACTION').length;
 const top=m.orders.slice(0,7).map(o=>row('<b>'+esc(o.type)+'</b> '+esc(o.text),pill(o.priority,o.priority==='URGENT'?'red':o.priority==='ACTION'?'amber':'blue'))).join('')||'<div class="empty">No immediate orders.</div>';
 const needs=m.needs.filter(x=>x.need>0).slice(0,5).map(x=>row('<b>'+x.p+'</b> '+x.count+' rostered',pill('Need depth','amber'))).join('')||'<div class="empty">No obvious positional depth gaps.</div>';
 $('orders').innerHTML=top;
 $('summary').innerHTML='<div class="statgrid"><div class="mini"><div class="kpi">Urgent</div><b>'+urgent+'</b></div><div class="mini"><div class="kpi">Actions</div><b>'+action+'</b></div><div class="mini"><div class="kpi">Lineup gain</div><b>+'+m.lineup.gain.toFixed(1)+'</b></div><div class="mini"><div class="kpi">Needs</div><b>'+m.needs.filter(x=>x.need>0).length+'</b></div></div><p class="note">Breezus is using one shared roster model across lineup, waivers, trades and dynasty decisions.</p>';
 $('alerts').innerHTML=card('Roster needs',needs,'SHARED MODEL');
 $('actions').textContent=m.orders.length;$('lineupGain').textContent='+'+m.lineup.gain.toFixed(1);
}
function renderLineup(){
 const m=M().lineup;
 const decisions=m.decisions.map(x=>{let c=x.type==='REPLACE'||x.type==='MOVE'?'red':x.type==='CONSIDER'||x.type==='MONITOR'?'amber':'green';let text=x.id?'<b>'+esc(nm(x.id))+'</b>':'<b>Empty</b>';if(x.target)text+=' → <b>'+esc(nm(x.target))+'</b>';return row('<span class="slot">'+esc(x.slot)+'</span> '+text+'<br><span class="meta">'+esc(x.reason||'No change required.')+'</span>',pill(x.type,c))}).join('');
 const bench=m.bench.map(x=>row('<b>'+esc(nm(x.id))+'</b><br><span class="meta">'+esc(pm(x.id))+'</span>',x.watch?pill('LINEUP WATCH','amber'):pill('BENCH','blue'))).join('');
 $('lineupSummary').innerHTML='<div class="statgrid"><div class="mini"><div class="kpi">Optimal</div><b>'+m.best.score.toFixed(1)+'</b></div><div class="mini"><div class="kpi">Current legal</div><b>'+m.legal.toFixed(1)+'</b></div><div class="mini"><div class="kpi">Available gain</div><b>+'+m.gain.toFixed(1)+'</b></div><div class="mini"><div class="kpi">Decisions</div><b>'+m.decisions.filter(x=>x.type!=='HOLD').length+'</b></div></div>';
 $('lineupRows').innerHTML='<h3>Start / Sit decisions</h3>'+decisions+'<div class="divider"></div><h3>Actual bench</h3>'+bench;
}
function renderWaivers(){
 const w=M().waivers;
 $('waivers').innerHTML=w.map(x=>row('<b>'+esc(nm(x.id))+'</b> '+pill(x.position)+'<br><span class="meta">Projection '+x.projection.toFixed(1)+' • dynasty '+(window.dynastyScore?.(x.id)||'—')+(x.trend?' • '+x.trend+' trending adds':'')+'<br>'+ (x.drop?'Model drop: '+esc(nm(x.drop)):'No clear drop')+'</span>', '<b>$'+x.faab+'</b><br>'+pill(x.need>0?'NEED':'WATCH',x.need>0?'green':'blue'))).join('')||'<div class="empty">No waiver candidates available.</div>';
}
function renderTrades(){
 $('tradeMe').innerHTML=M().needs.map(x=>row('<b>'+x.p+'</b>',x.need>0?pill('NEED','amber'):pill('DEPTH','green'))).join('');
 $('partners').innerHTML=M().trades.map(x=>row('<b>'+esc(nm(x.id))+'</b><br><span class="meta">Dynasty '+x.value+' • '+esc(x.reason)+'</span>','<span class="meta">Offer '+esc(nm(x.offer))+'</span>')).join('')||'<div class="empty">No trade path surfaced.</div>';
}
function renderDynasty(){
 const ids=(S.mine?.players||[]).filter(id=>['QB','RB','WR','TE'].includes(String(S.players?.[id]?.position||'').toUpperCase())).sort((a,b)=>(window.dynastyScore?.(b)||0)-(window.dynastyScore?.(a)||0));
 $('dynasty').innerHTML='<table><tr><th>Player</th><th>Pos</th><th>Age</th><th>Rank</th><th>Value</th></tr>'+ids.map(id=>'<tr><td><b>'+esc(nm(id))+'</b></td><td>'+esc(S.players[id]?.position||'')+'</td><td>'+esc(S.players[id]?.age||'—')+'</td><td>#'+(S.players[id]?.search_rank||'—')+'</td><td><b>'+ (window.dynastyScore?.(id)||'—')+'</b></td></tr>').join('')+'</table>';
}
function renderMatch(){
 const m=M().matchup, rows=['QB','RB','WR','TE','DEF'].map(p=>{const a=m.by[p]||0,b=m.oppBy[p]||0,d=a-b;return row('<b>'+p+'</b>','You '+a.toFixed(1)+' vs '+b.toFixed(1)+' '+pill((d>=0?'+':'')+d.toFixed(1),d>=0?'green':'red'))}).join('');
 $('battle').innerHTML=rows;
 $('your').innerHTML=m.mine.best.assign.map(x=>row('<b>'+esc(nm(x.id))+'</b><br><span class="meta">'+x.slot+'</span>',x.score.toFixed(1))).join('');
 $('opp').innerHTML=m.opp.assign.map(x=>row('<b>'+esc(nm(x.id))+'</b><br><span class="meta">'+x.slot+'</span>',x.score.toFixed(1))).join('');
}
function renderLeague(){
 $('league').innerHTML='<table><tr><th>#</th><th>Team</th><th>Record</th><th>PF</th><th>Starter strength</th></tr>'+M().league.map((x,i)=>'<tr><td>'+ (i+1)+'</td><td><b>'+esc(x.name)+'</b></td><td>'+esc(x.record)+'</td><td>'+x.pf.toFixed(1)+'</td><td>'+x.strength.toFixed(1)+'</td></tr>').join('')+'</table>';
}
function renderOrders(){
 $('allOrders').innerHTML=M().orders.map(o=>row('<b>'+esc(o.type)+'</b><br>'+esc(o.text),pill(o.priority,o.priority==='URGENT'?'red':o.priority==='ACTION'?'amber':'blue'))).join('')||'<div class="empty">No orders.</div>';
}
function render(){
 if(!M()||!S.mine)return;
 renderDash();renderLineup();renderWaivers();renderTrades();renderDynasty();renderMatch();renderLeague();renderOrders();
 $('status').innerHTML='<b>BREEZUS V7 READY.</b> One shared decision model is powering Lineup, Waivers, Trades, Dynasty, Matchup and League.';
 $('connectionDot').textContent='●';
}
function boot(){
 if(window.BREEZUS_V7?.ready){render();return}
 window.dispatchEvent(new Event('breezus:refresh'));
 setTimeout(()=>{if(window.BREEZUS_V7?.ready)render()},150);
}
window.addEventListener('breezus:v7-ready',render);
const timer=setInterval(()=>{if(S?.mine&&S?.players&&Object.keys(S.players).length){window.dispatchEvent(new Event('breezus:refresh'));if(window.BREEZUS_V7?.ready){render();clearInterval(timer)}}},700);
boot();
})();
