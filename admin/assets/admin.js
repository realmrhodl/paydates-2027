/* Paydates V2 — ADMINPANEL (concept). Alle data = demo in localStorage (assets/pdx.js).
   Niets wordt echt verstuurd, afgerekend of gepubliceerd. Zie admin/README-GAP.md. */
(function(){
'use strict';
const P=window.PDX; const {db,save,esc,fmtD,fmtDT,eur,toast}=P;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const qs=k=>new URLSearchParams(location.search).get(k);
const PAGE=document.body.dataset.page||'index';
const me=P.requireLogin({admin:true,base:'../',next:'admin/'+location.pathname.split('/').pop()+location.search}); if(!me)return;
const ADMIN_ONLY=['bv','betalingen','instellingen'];
const audit=(a,t,dt)=>P.audit(a,t,dt);
const uById=id=>db().users.find(u=>u.id===id);
const roleB=r=>`<span class="pdx-badge ${r==='admin'?'bad':r==='moderator'?'warn':r==='bedrijf'?'pd':r==='adverteerder'?'ok':''}">${esc(r)}</span>`;
const stB=s=>`<span class="pdx-badge ${s==='actief'?'ok':s==='onbevestigd'?'warn':'bad'}">${esc(s)}</span>`;
const kycB=k=>`<span class="pdx-badge ${k==='goedgekeurd'?'ok':k==='ingediend'?'warn':k==='afgewezen'?'bad':''}">${esc(k)}</span>`;
const adB=s=>`<span class="pdx-badge ${s==='live'?'ok':s==='wacht'?'warn':s==='afgekeurd'||s==='verlopen'?'bad':''}">${esc(s)}</span>`;
function modal(title,html,onOk,okText){
  const m=document.createElement('div');m.className='pdx-modal';m.innerHTML=`<div><div class="pdx-card-h" style="border-radius:.6rem .6rem 0 0"><span>${title}</span><button class="pdx-btn sm" data-x>✕</button></div><div class="pdx-card-b">${html}</div>${onOk?`<div class="pdx-card-b pdx-row" style="justify-content:flex-end;border-top:1px solid #eef1f7"><button class="pdx-btn" data-x>Annuleren</button><button class="pdx-btn pd" data-ok>${okText||'Opslaan'}</button></div>`:''}</div>`;
  document.body.appendChild(m);const close=()=>m.remove();m.querySelectorAll('[data-x]').forEach(b=>b.onclick=close);m.onclick=e=>{if(e.target===m)close()};
  const ok=m.querySelector('[data-ok]');if(ok)ok.onclick=()=>{if(onOk(m)!==false)close();};return m;}
function dl(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
const csv=rows=>rows.map(r=>r.map(c=>'"'+String(c==null?'':c).replace(/"/g,'""')+'"').join(';')).join('\n');

/* ---------- shell ---------- */
function shell(){
  const d=db();
  const cnt={ads:d.ads.filter(a=>a.status==='wacht').length,kyc:d.kyc.filter(k=>k.status==='ingediend').length,claims:d.claims.filter(c=>c.status==='nieuw').length};
  const nav=[['Overzicht'],['index','fa-gauge','Dashboard'],['Gebruikers'],['gebruikers','fa-users','Gebruikers'],['kyc','fa-id-card','KYC-wachtrij',cnt.kyc],['Content'],['advertenties','fa-rectangle-ad','Advertenties',cnt.ads],['seksclubs','fa-building','Seksclubs-import'],['claims','fa-hand','Claims',cnt.claims],['polls','fa-square-poll-horizontal','Community polls'],['Communicatie'],['email','fa-envelope','E-mail & massamail'],['Business'],['bv','fa-scale-balanced','BV & eigendom'],['betalingen','fa-credit-card','Betalingen & tarieven'],['Systeem'],['instellingen','fa-sliders','Instellingen & flags'],['audit','fa-clock-rotate-left','Auditlog'],['gap','fa-list-check','Gap-analyse']];
  document.body.innerHTML=`<div class="adm"><aside class="adm-side" id="admSide"><a href="index.html" class="adm-brand" style="padding:4px 8px 14px"><img src="../img/header-logo.png" alt=""><span>Paydates<small>ADMIN · CONCEPT</small></span></a>
   ${nav.map(n=>n.length===1?`<div class="adm-sec">${n[0]}</div>`:`<a href="${n[0]}.html" class="${PAGE===n[0]||(PAGE==='gebruiker'&&n[0]==='gebruikers')?'on':''}"><i class="fa ${n[1]}"></i>${n[2]}${n[3]?`<span class="cnt">${n[3]}</span>`:''}</a>`).join('')}
   <div class="adm-sec">Site</div><a href="../index.html" target="_blank"><i class="fa fa-arrow-up-right-from-square"></i>Naar Paydates.nl</a><a href="../dashboard.html"><i class="fa fa-gauge-simple"></i>Adverteerdersdashboard</a></aside>
   <div style="min-width:0"><header class="adm-top"><button class="pdx-btn sm burger" id="burger" aria-label="Menu"><i class="fa fa-bars"></i></button><b style="font-size:14px;color:#212529">Adminpanel</b><span class="demo"><i class="fa fa-flask"></i> DEMO-DATA · niets is live</span>
    <span style="margin-left:auto" class="pdx-small pdx-muted">${esc(me.username)} ${roleB(me.role)}</span><button class="pdx-btn sm" id="logout"><i class="fa fa-right-from-bracket"></i></button></header>
   <main class="adm-main" id="adm"></main></div></div>`;
  $('#logout').onclick=()=>{P.logout();location.href='../login.html';};
  $('#burger').onclick=()=>$('#admSide').classList.toggle('open');
}
const main=()=>$('#adm');
const head=(t,sub,right)=>`<div class="pdx-between"><div><h1 class="adm-h1">${t}</h1>${sub?`<p class="pdx-sub">${sub}</p>`:''}</div><div class="pdx-row">${right||''}</div></div>`;
const kpi=(l,n,s)=>`<div class="pdx-card pdx-card-b pdx-kpi"><div class="l">${l}</div><div class="n">${n}</div>${s?`<div class="s">${s}</div>`:''}</div>`;
window.PDXA={P,$,$$,qs,me,modal,dl,csv,audit,uById,roleB,stB,kycB,adB,main,head,kpi,shell,PAGE,ADMIN_ONLY,R:{}};
})();
