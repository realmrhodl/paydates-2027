/* Paydates V2 — accountomgeving adverteerders (concept): login/registratie-mock, dashboard, advertentie-wizard,
   mijn advertenties, KYC-stappen, bedrijf claimen. Geen echte betalingen, geen KYC-API, geen uploads. */
(function(){
'use strict';
const P=window.PDX; if(!P)return;
const {db,save,esc,fmtD,fmtDT,eur,toast,audit,session}=P;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const qs=k=>new URLSearchParams(location.search).get(k);
const PAGE=window.PDX_PAGE||location.pathname.split('/').pop().replace('.html','');
const homeFor=u=>P.isAdmin(u)?'admin/index.html':(u.role==='klant'?'account.html':'dashboard.html');
const kycBadge=k=>({geen:'<span class="pdx-badge">Niet gestart</span>',ingediend:'<span class="pdx-badge warn"><i class="fa fa-hourglass-half"></i> In behandeling</span>',goedgekeurd:'<span class="pdx-badge ok"><i class="fa fa-circle-check"></i> Geverifieerd</span>',afgewezen:'<span class="pdx-badge bad"><i class="fa fa-circle-xmark"></i> Afgewezen</span>'}[k]||k);
const adBadge=a=>a.status==='live'?'<span class="pdx-badge ok">Online</span>':a.status==='wacht'?'<span class="pdx-badge warn">Wacht op moderatie</span>':a.status==='gepauzeerd'?'<span class="pdx-badge">Gepauzeerd</span>':a.status==='afgekeurd'?'<span class="pdx-badge bad">Afgekeurd</span>':a.status==='verlopen'?'<span class="pdx-badge bad">Verlopen</span>':'<span class="pdx-badge">'+esc(a.status)+'</span>';
function me(){return session();}
function userMut(fn){const d=db();const u=d.users.find(x=>x.id===(me()||{}).id);if(!u)return null;const r=fn(u,d);save(d);return r;}
function ledger(u,delta,t){u.ledger=u.ledger||[];u.ledger.unshift({at:P.now(),delta,t,bal:u.credits});}
function spend(cost,label,adFn){
  return userMut((u,d)=>{if(u.credits<cost){toast('Onvoldoende credits ('+u.credits+' / '+cost+')');return false;}
    u.credits-=cost;ledger(u,-cost,label);if(adFn)adFn(d);d.audit.unshift({at:P.now(),actor:u.username,action:'credits',target:label,detail:'-'+cost+' cr (mock)'});return true;});
}

/* ---- header: ingelogd? ---- */
function header(){
  const u=me(); if(!u)return;
  $$('a[href="login.html"]').forEach(a=>{if(a.closest('form')||a.closest('[data-pdx-keep]'))return;const i=a.querySelector('i.fa-right-to-bracket');if(i){a.href=homeFor(u);i.className='fa fa-circle-user text-[14px] mb-0.5';if(a.lastChild&&a.lastChild.nodeType===3)a.lastChild.textContent='Account';}});
}

/* ---- concept-balk boven accountpagina's ---- */
function accBar(u,active){
  const items=[['dashboard','dashboard.html','fa-gauge','Dashboard'],['ads','mijn-advertenties.html','fa-rectangle-list','Mijn advertenties'],['new','advertentie-plaatsen.html','fa-plus','Nieuwe advertentie'],['kyc','kyc.html','fa-id-card','Verificatie (KYC)'],['credits','credits.html','fa-coins','Credits kopen'],['fav','account.html#favorieten','fa-heart','Favorieten']];
  if(u.role==='bedrijf')items.splice(4,0,['claim','bedrijf-claimen.html','fa-building','Bedrijf claimen']);
  if(P.isAdmin(u))items.push(['admin','admin/index.html','fa-user-shield','Adminpanel']);
  return `<nav class="pdx-card pdx-nav" aria-label="Accountmenu">${items.map(i=>`<a href="${i[1]}" class="${i[0]===active?'on':''}"><i class="fa ${i[2]}"></i>${i[3]}</a>`).join('')}<a href="#" data-logout><i class="fa fa-right-from-bracket"></i>Uitloggen</a></nav>`;
}
function bindLogout(){$$('[data-logout]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();P.logout();location.href='login.html';}));}
const demoNote='<div class="pdx-demo"><i class="fa fa-flask" style="margin-top:2px"></i><div><b>Concept-omgeving.</b> Alles wat je hier doet wordt alleen in deze browser opgeslagen (demo). Er worden geen echte betalingen gedaan, geen documenten opgeslagen en geen e-mails verstuurd.</div></div>';

/* ================= LOGIN ================= */
function pageLogin(){
  const f=$('form[data-pd-form]');if(!f)return; const box=document.createElement('div');
  const next=P.safeNext(qs('next'),'');
  const u=me();
  const host=$('h1')&&$('h1').parentElement;
  if(u&&host){const n=document.createElement('div');n.className='pdx-demo';n.style.marginTop='12px';n.innerHTML=`<i class="fa fa-circle-user"></i><div>Je bent ingelogd als <b>${esc(u.username)}</b> (${esc(u.role)}). <a href="${homeFor(u)}" style="color:#7351c0;font-weight:600">Naar ${P.isAdmin(u)?'adminpanel':'dashboard'}</a> · <a href="#" data-logout style="color:#c92a2a">Uitloggen</a></div>`;host.insertBefore(n,host.querySelector('form'));bindLogout();}
  const err=document.createElement('div');err.className='pdx-badge bad';err.style.cssText='display:none;padding:8px 12px;border-radius:.4rem;font-size:13px';
  const btn=f.querySelector('button');btn.parentElement.insertBefore(err,btn);
  const demo=document.createElement('div');demo.className='pdx-demo';demo.innerHTML=`<i class="fa fa-flask" style="margin-top:2px"></i><div><b>Demo-accounts (concept)</b> · wachtwoord <code>demo</code><div class="pdx-row" style="margin-top:6px"><button type="button" class="pdx-btn sm" data-demo="adverteerder@demo.paydates.test">Adverteerder</button><button type="button" class="pdx-btn sm" data-demo="bedrijf@demo.paydates.test">Bedrijf</button><button type="button" class="pdx-btn sm" data-demo="admin@demo.paydates.test">Admin</button></div></div>`;
  const note=f.querySelector('.fa-flask');if(note)note.closest('p').replaceWith(demo);else f.appendChild(demo);
  demo.querySelectorAll('[data-demo]').forEach(b=>b.onclick=()=>{$('#em').value=b.dataset.demo;$('#pw').value='demo';go();});
  function go(){const r=P.login($('#em').value,$('#pw').value);if(!r.ok){err.textContent=r.err;err.style.display='flex';return;}
    toast('Ingelogd als '+r.user.username);setTimeout(()=>location.href=next||homeFor(r.user),350);}
  window.addEventListener('submit',e=>{if(e.target!==f)return;e.preventDefault();e.stopImmediatePropagation();if(!f.reportValidity())return;go();},true);
}

/* ================= REGISTER ================= */
function pageRegister(){
  const f=$('form[data-pd-form]'); if(!f)return;
  const err=document.createElement('div');err.className='pdx-badge bad';err.style.cssText='display:none;padding:8px 12px;border-radius:.4rem;font-size:13px';
  const btn=f.querySelector('button.btn-pd');btn.parentElement.insertBefore(err,btn);
  window.addEventListener('submit',e=>{if(e.target!==f)return;e.preventDefault();e.stopImmediatePropagation();if(!f.reportValidity())return;
    const type=$('#rtype').value||'klant';
    const bd=(f.querySelector('input[autocomplete=bday]')||{}).value||'';const m=bd.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if(m){const b=new Date(+m[3],+m[2]-1,+m[1]);const age=(Date.now()-b)/31557600000;const min=type==='klant'?18:21;if(!(age>=min)){err.textContent='Je moet minimaal '+min+' jaar zijn voor dit type account.';err.style.display='flex';return;}}
    const cbs=[...f.querySelectorAll('input[type=checkbox]:not([required]):not([name])')];
    const bedrijf=f.querySelector('[data-for="bedrijf"]');
    const r=P.register({type,username:f.querySelector('input[autocomplete=username]').value,email:f.querySelector('input[type=email]').value,pw:f.querySelector('input[type=password]').value,city:(f.querySelector('input[list=rc]')||{}).value,marketing:cbs.length?cbs[cbs.length-1].checked:false,company:bedrijf?bedrijf.querySelector('input').value:'',kvk:bedrijf?(bedrijf.querySelector('input[pattern]')||{}).value:''});
    if(!r.ok){err.textContent=r.err;err.style.display='flex';return;}
    f.querySelectorAll('[data-hide-on-ok]').forEach(x=>x.classList.add('hidden'));const ok=f.querySelector('[data-ok]');ok.classList.remove('hidden');
    ok.querySelector('p').innerHTML='Account aangemaakt (concept). In de live-versie ontvang je een bevestigingsmail; hier is die alleen gesimuleerd. Je wordt doorgestuurd…';
    const a=ok.querySelector('a');a.href=homeFor(r.user);a.textContent=r.user.role==='klant'?'Naar mijn account':'Naar mijn dashboard';
    setTimeout(()=>location.href=P.safeNext(qs('next'),homeFor(r.user)),1600);
  },true);
}

/* ================= WACHTWOORD VERGETEN ================= */
function pageReset(){
  const f=$('form[data-pd-form]'); if(!f)return;
  window.addEventListener('submit',e=>{if(e.target!==f||!f.checkValidity())return;const em=f.querySelector('input[type=email]').value.trim().toLowerCase();const u=db().users.find(x=>x.email.toLowerCase()===em);
    if(u){P.mailSim(u,'reset',{link:'https://paydates.nl/reset?token=DEMO-'+Math.random().toString(36).slice(2,8)});audit('password-reset',u.username,'Resetmail gesimuleerd (self-service)');}},true);
  const n=f.querySelector('.fa-flask');if(n)n.parentElement.innerHTML='<i class="fa fa-flask mr-1"></i>Concept: de resetmail wordt alleen gesimuleerd (zichtbaar in admin → E-mail → log), niet echt verstuurd.';
}

/* ================= ACCOUNT (bestaand) ================= */
function pageAccount(){
  const u=me(); if(!u)return;
  const info=document.querySelector('.fa-circle-info');if(info){const b=info.closest('.block')||info.parentElement;if(b)b.innerHTML=`<i class="fa fa-circle-user text-pd mt-0.5"></i><p class="text-[13px] text-ink-muted">Ingelogd als <b class="text-[#212529]">${esc(u.username)}</b> (${esc(u.role)}). ${u.role!=='klant'?'<a href="dashboard.html" class="text-pd font-semibold">Naar je adverteerdersdashboard</a> · ':''}<a href="#" data-logout class="text-[#c92a2a]">Uitloggen</a></p>`;bindLogout();}
  const d=db();const ads=d.ads.filter(a=>a.owner===u.id);
  const k=$$('#overzicht .text-\\[22px\\]');if(k.length===3){k[0].textContent=u.credits;k[1].textContent=ads.filter(a=>a.status==='live').length;k[2].textContent=ads.reduce((s,a)=>s+(a.views||0),0).toLocaleString('nl-NL');}
  const v=$('#verificatie p');if(v)v.innerHTML='Status: '+kycBadge(u.kyc);
  const vl=$('#verificatie a');if(vl)vl.href='kyc.html';
  if(ads.length){const s=$('#advertenties .p-8');if(s)s.outerHTML='<div class="p-3">'+ads.map(a=>`<div class="pdx-between" style="padding:8px 4px;border-bottom:1px solid #eef1f7"><span class="text-[13px]"><b>${esc(a.title)}</b> · ${esc(a.city)}</span>${adBadge(a)}</div>`).join('')+'<a href="mijn-advertenties.html" class="text-pd text-[13px] font-semibold" style="display:inline-block;margin-top:8px">Beheer advertenties →</a></div>';}
}

/* ================= DASHBOARD ================= */
function pageDashboard(root){
  const u=P.requireLogin(); if(!u)return;
  const d=db(); const ads=d.ads.filter(a=>a.owner===u.id); const live=ads.filter(a=>a.status==='live');
  const views=ads.reduce((s,a)=>s+(a.views||0),0), clicks=ads.reduce((s,a)=>s+(a.clicks||0),0);
  const plan=u.company?d.pay.clubPlans.find(p=>p.k===(u.company.plan||'basic')):null;
  root.innerHTML=`<div class="pdx-side">${accBar(u,'dashboard')}<div style="display:grid;gap:16px;min-width:0">
   <div class="pdx-between"><div><h1 class="pdx-h1">Hoi ${esc(u.name||u.username)} 👋</h1><p class="pdx-sub">${esc(u.email)} · <span class="pdx-badge pd">${esc(u.role)}</span> ${u.status!=='actief'?'<span class="pdx-badge bad">'+esc(u.status)+'</span>':''}</p></div>
   <div class="pdx-row"><a href="advertentie-plaatsen.html" class="pdx-btn pd"><i class="fa fa-plus"></i> Nieuwe advertentie</a><a href="credits.html" class="pdx-btn"><i class="fa fa-coins"></i> Credits kopen</a></div></div>
   ${demoNote}
   ${u.role==='klant'?`<div class="pdx-card pdx-card-b pdx-between"><div><b>Je hebt een klantaccount.</b><p class="pdx-sub">Wil je zelf adverteren? Zet je account om naar adverteerder (21+, verificatie verplicht).</p></div><button class="pdx-btn pd" id="toAdv">Word adverteerder</button></div>`:''}
   <div class="pdx-grid pdx-g4">
    <div class="pdx-card pdx-card-b pdx-kpi"><div class="l">Creditsaldo</div><div class="n" id="kCred">${u.credits}</div><div class="s">≈ ${eur(u.credits/d.pay.rates.credPerEur)} · <a href="#" id="demoCred" style="color:#7351c0">+100 demo-credits</a></div></div>
    <div class="pdx-card pdx-card-b pdx-kpi"><div class="l">Actieve advertenties</div><div class="n">${live.length}<span style="font-size:13px;color:#a1aebd"> / ${ads.length}</span></div><div class="s">${ads.filter(a=>a.status==='wacht').length} wacht op moderatie</div></div>
    <div class="pdx-card pdx-card-b pdx-kpi"><div class="l">Profielweergaven</div><div class="n">${views.toLocaleString('nl-NL')}</div><div class="s">${clicks.toLocaleString('nl-NL')} contactkliks · demo-cijfers</div></div>
    <div class="pdx-card pdx-card-b pdx-kpi"><div class="l">Verificatie</div><div style="margin:6px 0">${kycBadge(u.kyc)}</div><div class="s"><a href="kyc.html" style="color:#7351c0">${u.kyc==='goedgekeurd'?'Bekijk status':'Start / bekijk verificatie'}</a></div></div>
   </div>
   ${u.kyc!=='goedgekeurd'&&u.role!=='klant'?`<div class="pdx-card pdx-card-b pdx-between" style="border-left:4px solid #7351c0"><div><b>Verifieer je account</b><p class="pdx-sub">Geverifieerde advertenties krijgen het paarse vinkje en staan hoger in de resultaten.</p></div><a class="pdx-btn pd" href="kyc.html">Naar verificatie</a></div>`:''}
   <div class="pdx-card"><div class="pdx-card-h"><span>Mijn advertenties</span><a href="mijn-advertenties.html" style="color:#7351c0">Alles beheren →</a></div>
    ${ads.length?`<div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Advertentie</th><th>Status</th><th>Loopt tot</th><th>Weergaven</th><th>Boosts</th></tr></thead><tbody>${ads.slice(0,6).map(a=>`<tr><td><b>${esc(a.title)}</b><div class="pdx-xs pdx-muted">${esc(a.type)} · ${esc(a.city)}</div></td><td>${adBadge(a)}</td><td>${fmtD(a.expires)}</td><td>${(a.views||0).toLocaleString('nl-NL')}</td><td>${a.vip?'<span class="pdx-badge gold">VIP</span> ':''}${a.top?'<span class="pdx-badge pd">TOP</span> ':''}${a.bumps||0}× omhoog</td></tr>`).join('')}</tbody></table></div>`:'<div class="pdx-card-b pdx-muted" style="text-align:center;padding:30px">Nog geen advertenties. <a href="advertentie-plaatsen.html" style="color:#7351c0;font-weight:600">Plaats je eerste advertentie</a></div>'}
   </div>
   <div class="pdx-grid pdx-g2">
    <div class="pdx-card"><div class="pdx-card-h">Tarieven (credits)</div><div class="pdx-card-b pdx-small" style="display:grid;gap:6px">
      <div class="pdx-between"><span>Omhoog plaatsen</span><b>${d.pay.rates.bump} cr</b></div><div class="pdx-between"><span>TOP-plaatsing</span><b>${d.pay.rates.topDay} cr / dag</b></div><div class="pdx-between"><span>VIP</span><b>${d.pay.rates.vip7} cr / 7 dagen</b></div><div class="pdx-between"><span>Chatpas</span><b>${d.pay.rates.chatpass24} cr / 24 uur</b></div><div class="pdx-xs pdx-muted">${d.pay.rates.credPerEur} credits = € 1 · bundels € 50 – € 500</div></div></div>
    <div class="pdx-card"><div class="pdx-card-h">Laatste transacties</div><div class="pdx-card-b pdx-small">${(u.ledger||[]).slice(0,6).map(l=>`<div class="pdx-between" style="padding:4px 0;border-bottom:1px solid #eef1f7"><span>${esc(l.t)}<div class="pdx-xs pdx-muted">${fmtDT(l.at)}</div></span><b style="color:${l.delta<0?'#c92a2a':'#2b8a3e'}">${l.delta>0?'+':''}${l.delta} cr</b></div>`).join('')||'<span class="pdx-muted">Nog geen transacties.</span>'}</div></div>
   </div>
   ${plan?`<div class="pdx-card"><div class="pdx-card-h"><span>Bedrijfsprofiel · ${esc(u.company.name||'—')}</span><span class="pdx-badge pd">${esc(plan.t)}</span></div><div class="pdx-card-b"><div class="pdx-grid pdx-g3">${d.pay.clubPlans.map(p=>`<div class="pdx-opt${p.k===plan.k?' on':''}" style="flex-direction:column"><b>${esc(p.t)} · ${p.eur?eur(p.eur)+' / maand':'gratis'}</b><ul class="pdx-xs pdx-muted" style="margin:4px 0 0 14px;list-style:disc">${p.features.map(f=>'<li>'+esc(f)+'</li>').join('')}</ul>${p.k!==plan.k?`<button class="pdx-btn sm" disabled title="Betalingen nog niet geactiveerd" style="margin-top:8px">Upgraden (binnenkort)</button>`:'<span class="pdx-xs" style="color:#7351c0;margin-top:8px">Huidig pakket</span>'}</div>`).join('')}</div><p class="pdx-xs pdx-muted" style="margin-top:8px">Abonnementen worden pas geactiveerd na goedkeuring van betalingen. <a href="bedrijf-claimen.html" style="color:#7351c0">Bestaand club- of privéhuisprofiel claimen →</a></p></div></div>`:''}
  </div></div>`;
  bindLogout();
  const dc=$('#demoCred');if(dc)dc.onclick=e=>{e.preventDefault();userMut(u=>{u.credits+=100;ledger(u,100,'Demo-credits (geen betaling)');});toast('+100 demo-credits');pageDashboard(root);};
  const ta=$('#toAdv');if(ta)ta.onclick=()=>{userMut(u=>{u.role='adverteerder';});audit('role','self','klant → adverteerder');pageDashboard(root);};
}

/* ================= MIJN ADVERTENTIES ================= */
function pageMyAds(root){
  const u=P.requireLogin(); if(!u)return;
  const d=db(); const R=d.pay.rates; const ads=d.ads.filter(a=>a.owner===u.id);
  root.innerHTML=`<div class="pdx-side">${accBar(u,'ads')}<div style="display:grid;gap:16px;min-width:0">
   <div class="pdx-between"><div><h1 class="pdx-h1">Mijn advertenties</h1><p class="pdx-sub">Saldo: <b id="bal">${u.credits}</b> credits · <a href="credits.html" style="color:#7351c0">opwaarderen</a></p></div><a href="advertentie-plaatsen.html" class="pdx-btn pd"><i class="fa fa-plus"></i> Nieuwe advertentie</a></div>
   ${demoNote}
   ${ads.length?ads.map(a=>`<div class="pdx-card" data-ad="${a.id}"><div class="pdx-card-h"><span>${esc(a.title)} ${a.vip?'<span class="pdx-badge gold">VIP</span>':''} ${a.top?'<span class="pdx-badge pd">TOP</span>':''}</span>${adBadge(a)}</div>
     <div class="pdx-card-b"><div class="pdx-grid pdx-g4 pdx-small" style="margin-bottom:12px"><div><span class="pdx-muted">Categorie</span><br><b>${esc(a.cat)} · ${esc(a.type)}</b></div><div><span class="pdx-muted">Locatie</span><br><b>${esc(a.city)}</b></div><div><span class="pdx-muted">Loopt tot</span><br><b>${fmtD(a.expires)}</b></div><div><span class="pdx-muted">Weergaven / kliks</span><br><b>${(a.views||0).toLocaleString('nl-NL')} / ${(a.clicks||0).toLocaleString('nl-NL')}</b></div></div>
     ${a.modNote?`<p class="pdx-small" style="color:#c92a2a;margin-bottom:10px"><i class="fa fa-circle-exclamation"></i> Moderatie: ${esc(a.modNote)}</p>`:''}
     <div class="pdx-row">
      <a class="pdx-btn sm" href="advertentie-plaatsen.html?edit=${a.id}"><i class="fa fa-pen"></i> Bewerken</a>
      ${a.status==='live'?`<button class="pdx-btn sm" data-act="pause"><i class="fa fa-pause"></i> Pauzeren</button>`:a.status==='gepauzeerd'?`<button class="pdx-btn sm" data-act="resume"><i class="fa fa-play"></i> Hervatten</button>`:''}
      <button class="pdx-btn sm" data-act="extend"><i class="fa fa-calendar-plus"></i> Verlengen +${d.settings.adDays} dagen</button>
      <button class="pdx-btn sm" data-act="bump" ${a.status!=='live'?'disabled':''}><i class="fa fa-arrow-up"></i> Omhoog · ${R.bump} cr</button>
      <button class="pdx-btn sm" data-act="top" ${a.status!=='live'?'disabled':''}><i class="fa fa-star"></i> TOP 1 dag · ${R.topDay} cr</button>
      <button class="pdx-btn sm" data-act="vip" ${a.status!=='live'?'disabled':''}><i class="fa fa-crown"></i> VIP 7 dagen · ${R.vip7} cr</button>
      ${a.listingId?`<a class="pdx-btn sm" href="advertentie.html?id=${a.listingId}" target="_blank"><i class="fa fa-eye"></i> Bekijk</a>`:''}
      <button class="pdx-btn sm red" data-act="del"><i class="fa fa-trash"></i> Verwijderen</button>
     </div></div></div>`).join(''):'<div class="pdx-card pdx-card-b pdx-muted" style="text-align:center;padding:40px"><i class="fa fa-rectangle-list" style="font-size:30px;color:#cdc1e9"></i><p style="margin-top:8px">Je hebt nog geen advertenties.</p></div>'}
  </div></div>`;
  bindLogout();
  root.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{
    const id=b.closest('[data-ad]').dataset.ad; const act=b.dataset.act;
    const mut=fn=>{const d2=db();const a=d2.ads.find(x=>x.id===id);fn(a,d2);save(d2);};
    if(act==='pause')mut(a=>a.status='gepauzeerd');
    if(act==='resume')mut(a=>a.status='live');
    if(act==='extend')mut((a,d2)=>{const base=Math.max(Date.now(),+new Date(a.expires));a.expires=new Date(base+d2.settings.adDays*864e5).toISOString();if(a.status==='verlopen')a.status='live';});
    if(act==='bump'&&!spend(R.bump,'Omhoog plaatsen',d2=>{const a=d2.ads.find(x=>x.id===id);a.bumps=(a.bumps||0)+1;a.bumpedAt=P.now();}))return;
    if(act==='top'&&!spend(R.topDay,'TOP-plaatsing 1 dag',d2=>{const a=d2.ads.find(x=>x.id===id);a.top=true;a.topUntil=new Date(Date.now()+864e5).toISOString();}))return;
    if(act==='vip'&&!spend(R.vip7,'VIP 7 dagen',d2=>{const a=d2.ads.find(x=>x.id===id);a.vip=true;a.vipUntil=new Date(Date.now()+7*864e5).toISOString();}))return;
    if(act==='del'){if(!confirm('Advertentie verwijderen? (concept)'))return;const d2=db();d2.ads=d2.ads.filter(x=>x.id!==id);save(d2);}
    audit('ad-'+act,id,'door eigenaar');toast({pause:'Gepauzeerd',resume:'Weer online',extend:'Verlengd',bump:'Omhoog geplaatst',top:'In de TOP',vip:'VIP actief',del:'Verwijderd'}[act]);pageMyAds(root);
  });
}

/* ================= WIZARD ================= */
function pageWizard(root){
  const u=P.requireLogin(); if(!u)return;
  const d=db(); const R=d.pay.rates; const editId=qs('edit'); const ex=editId?d.ads.find(a=>a.id===editId&&a.owner===u.id):null;
  const cities=[...new Set(((window.PD_DATA&&PD_DATA.L)||[]).map(x=>x.c).filter(Boolean).concat(['Amsterdam','Rotterdam','Den Haag','Utrecht','Eindhoven','Groningen','Tilburg','Almere','Breda','Nijmegen','Arnhem','Haarlem','Zwolle','Maastricht','Leiden']))].sort();
  const S={step:0,cat:ex?ex.cat:'Vrouw',type:ex?ex.type:'Escort',photos:ex?(ex.photos||0):0,title:ex?ex.title:'',desc:ex?(ex.desc||''):'',age:ex?(ex.age||''):'',prices:ex&&ex.prices||[['30 minuten',''],['1 uur',''],['2 uur','']],city:ex?ex.city:'',tel:ex&&ex.contact?ex.contact.tel||'':'',wa:ex&&ex.contact?!!ex.contact.wa:true,mail:ex&&ex.contact?!!ex.contact.mail:true,incall:true,outcall:false,bump:false,topDays:0,vip:false};
  const steps=['Categorie','Foto’s','Tekst & tarieven','Contact & locatie','Zichtbaarheid','Controleren'];
  if(u.role==='klant'){root.innerHTML=`<div class="pdx-side">${accBar(u,'new')}<div class="pdx-card pdx-card-b"><h1 class="pdx-h1">Advertentie plaatsen</h1><p class="pdx-sub" style="margin:8px 0 14px">Met een klantaccount kun je geen advertenties plaatsen. Zet je account om naar adverteerder via je <a href="dashboard.html" style="color:#7351c0">dashboard</a>.</p></div></div>`;bindLogout();return;}
  const cost=()=>(S.bump?R.bump:0)+S.topDays*R.topDay+(S.vip?R.vip7:0);
  function view(){
    const st=S.step;
    const body=[
     ()=>`<div class="pdx-f two"><div class="full"><span class="pdx-lbl">Ik adverteer als</span><div class="pdx-grid pdx-g3">${['Vrouw','Man','Shemale','Trans','Stel'].map(c=>`<label class="pdx-opt"><input type="radio" name="cat" value="${c}" ${S.cat===c?'checked':''}> ${c}</label>`).join('')}</div></div>
       <div class="full"><span class="pdx-lbl">Soort advertentie</span><div class="pdx-grid pdx-g3">${['Escort','Privé ontvangst','Massage','Online','BDSM','Sugardating'].map(c=>`<label class="pdx-opt"><input type="radio" name="type" value="${c}" ${S.type===c?'checked':''}> ${c}</label>`).join('')}</div></div></div>`,
     ()=>`<p class="pdx-small pdx-muted" style="margin-bottom:10px">Upload tot 8 foto’s. <b>Concept:</b> uploads worden niet opgeslagen; klik op een vak om een placeholder te zetten. Eerste foto = hoofdfoto. Geen gezichten van anderen, geen minderjarigen, alleen eigen beeld.</p>
       <div class="pdx-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">${Array.from({length:8},(_,i)=>`<div class="pdx-ph${i<S.photos?' on':''}" data-ph="${i}">${i<S.photos?'<i class="fa fa-image"></i>':'<i class="fa fa-plus"></i>'}</div>`).join('')}</div>
       <p class="pdx-xs pdx-muted" style="margin-top:8px">${S.photos} / 8 foto’s · in productie: automatische check op dubbele/gestolen foto’s + handmatige moderatie.</p>`,
     ()=>`<div class="pdx-f two"><div class="full"><label class="pdx-lbl">Titel *</label><input class="pdx-in" id="wTitle" maxlength="70" value="${esc(S.title)}" placeholder="Bijv. Sophie – discreet en gezellig in Rotterdam"></div>
       <div class="full"><label class="pdx-lbl">Omschrijving *</label><textarea class="pdx-in" id="wDesc" maxlength="3000" placeholder="Vertel iets over jezelf, je services en afspraken. Geen telefoonnummers in de tekst.">${esc(S.desc)}</textarea></div>
       <div><label class="pdx-lbl">Leeftijd * (21+)</label><input class="pdx-in" id="wAge" type="number" min="21" max="99" value="${esc(S.age)}"></div><div></div>
       <div class="full"><span class="pdx-lbl">Tarieven (optioneel)</span>${S.prices.map((p,i)=>`<div class="pdx-row" style="margin-bottom:6px"><input class="pdx-in" style="flex:1" data-pt="${i}" value="${esc(p[0])}"><input class="pdx-in" style="width:120px" data-pp="${i}" value="${esc(p[1])}" placeholder="€"></div>`).join('')}<button type="button" class="pdx-btn sm" id="addP">+ Tarief</button></div></div>`,
     ()=>`<div class="pdx-f two"><div><label class="pdx-lbl">Stad *</label><input class="pdx-in" id="wCity" list="wCities" value="${esc(S.city)}"><datalist id="wCities">${cities.map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div>
       <div><label class="pdx-lbl">Telefoon (zakelijk, optioneel)</label><input class="pdx-in" id="wTel" value="${esc(S.tel)}" placeholder="06…" inputmode="tel"></div>
       <label class="pdx-opt"><input type="checkbox" id="wWa" ${S.wa?'checked':''}> WhatsApp tonen</label><label class="pdx-opt"><input type="checkbox" id="wMail" ${S.mail?'checked':''}> Berichten via Paydates (e-mail verborgen)</label>
       <label class="pdx-opt"><input type="checkbox" id="wIn" ${S.incall?'checked':''}> Ontvangst (incall)</label><label class="pdx-opt"><input type="checkbox" id="wOut" ${S.outcall?'checked':''}> Escort (outcall)</label></div>`,
     ()=>`<p class="pdx-small pdx-muted" style="margin-bottom:10px">Basisplaatsing is gratis (${d.settings.adDays} dagen). Kies optioneel extra zichtbaarheid. Saldo: <b>${me().credits}</b> credits.</p>
       <div style="display:grid;gap:8px"><label class="pdx-opt"><input type="checkbox" id="wBump" ${S.bump?'checked':''}><span><b>Direct omhoog plaatsen</b> · ${R.bump} cr<br><span class="pdx-xs pdx-muted">Bovenaan in de lijst van je stad</span></span></label>
       <label class="pdx-opt"><span style="flex:1"><b>TOP-plaatsing</b> · ${R.topDay} cr per dag<br><span class="pdx-xs pdx-muted">In de TOP-rij op home en stadspagina</span></span><select class="pdx-in" style="width:120px" id="wTop">${[0,1,3,7].map(n=>`<option value="${n}" ${S.topDays===n?'selected':''}>${n?n+' dag'+(n>1?'en':''):'Geen'}</option>`).join('')}</select></label>
       <label class="pdx-opt"><input type="checkbox" id="wVip" ${S.vip?'checked':''}><span><b>VIP 7 dagen</b> · ${R.vip7} cr<br><span class="pdx-xs pdx-muted">Gouden kader + stories</span></span></label></div>
       <div class="pdx-between" style="margin-top:12px;font-size:14px"><span>Totaal</span><b id="wCost">${cost()} credits</b></div>`,
     ()=>{const okKyc=me().kyc==='goedgekeurd';return `<div class="pdx-grid pdx-g2 pdx-small"><div><span class="pdx-muted">Categorie</span><br><b>${esc(S.cat)} · ${esc(S.type)}</b></div><div><span class="pdx-muted">Stad</span><br><b>${esc(S.city||'—')}</b></div><div><span class="pdx-muted">Titel</span><br><b>${esc(S.title||'—')}</b></div><div><span class="pdx-muted">Foto’s</span><br><b>${S.photos}</b></div><div><span class="pdx-muted">Extra’s</span><br><b>${[S.bump&&'Omhoog',S.topDays&&('TOP '+S.topDays+'d'),S.vip&&'VIP 7d'].filter(Boolean).join(', ')||'geen'}</b></div><div><span class="pdx-muted">Kosten</span><br><b>${cost()} credits</b> (saldo ${me().credits})</div></div>
       ${okKyc?'':'<div class="pdx-demo" style="margin-top:12px"><i class="fa fa-id-card"></i><div>Je account is nog niet geverifieerd. Je advertentie wordt na moderatie geplaatst <b>zonder</b> paars vinkje. <a href="kyc.html" style="color:#7351c0;font-weight:600">Nu verifiëren</a></div></div>'}
       <label class="pdx-opt" style="margin-top:12px"><input type="checkbox" id="wAgree"> Ik bevestig dat ik 21+ ben, de foto’s van mijzelf zijn en ik akkoord ga met de <a href="algemene-voorwaarden.html" target="_blank" style="color:#7351c0">voorwaarden</a>. Geen dwang, geen derden.</label>`;}
    ][st]();
    root.innerHTML=`<div class="pdx-side">${accBar(u,'new')}<div style="display:grid;gap:16px;min-width:0"><div><h1 class="pdx-h1">${ex?'Advertentie bewerken':'Nieuwe advertentie plaatsen'}</h1><p class="pdx-sub">Stap ${st+1} van ${steps.length}: ${steps[st]}</p></div>
     <ol class="pdx-steps">${steps.map((s,i)=>`<li class="${i<st?'done':i===st?'on':''}">${i+1}. ${s}</li>`).join('')}</ol>
     <div class="pdx-card"><div class="pdx-card-b" id="wBody">${body}</div><div class="pdx-card-b pdx-between" style="border-top:1px solid #eef1f7"><button class="pdx-btn" id="wPrev" ${st?'':'disabled'}><i class="fa fa-angle-left"></i> Vorige</button><span class="pdx-xs pdx-muted" id="wErr" style="color:#c92a2a"></span>${st<steps.length-1?'<button class="pdx-btn pd" id="wNext">Volgende <i class="fa fa-angle-right"></i></button>':`<button class="pdx-btn pd" id="wDone"><i class="fa fa-paper-plane"></i> ${ex?'Wijzigingen opslaan':'Plaatsen'}${cost()?' · '+cost()+' cr':''}</button>`}</div></div>
     ${demoNote}</div></div>`;
    bindLogout();
    root.querySelectorAll('[data-ph]').forEach(p=>p.onclick=()=>{collect();const i=+p.dataset.ph;S.photos=i<S.photos?i:i+1;view();});
    const ap=$('#addP');if(ap)ap.onclick=()=>{collect();S.prices.push(['','']);view();};
    ['wBump','wTop','wVip'].forEach(id=>{const e=$('#'+id);if(e)e.onchange=()=>{collect();$('#wCost').textContent=cost()+' credits';};});
    $('#wPrev').onclick=()=>{collect();S.step--;view();};
    const n=$('#wNext');if(n)n.onclick=()=>{collect();const e=validate();if(e){$('#wErr').textContent=e;return;}S.step++;view();};
    const dn=$('#wDone');if(dn)dn.onclick=finish;
  }
  function collect(){const v=id=>{const e=$('#'+id);return e?(e.type==='checkbox'?e.checked:e.value):undefined};
    const c=document.querySelector('input[name=cat]:checked');if(c)S.cat=c.value;const t=document.querySelector('input[name=type]:checked');if(t)S.type=t.value;
    if($('#wTitle')){S.title=v('wTitle').trim();S.desc=v('wDesc').trim();S.age=v('wAge');S.prices=S.prices.map((p,i)=>[($('[data-pt="'+i+'"]')||{}).value||p[0],($('[data-pp="'+i+'"]')||{}).value||'']);}
    if($('#wCity')){S.city=v('wCity').trim();S.tel=v('wTel').trim();S.wa=v('wWa');S.mail=v('wMail');S.incall=v('wIn');S.outcall=v('wOut');}
    if($('#wBump')){S.bump=v('wBump');S.topDays=+v('wTop');S.vip=v('wVip');}}
  function validate(){const s=S.step;
    if(s===1&&S.photos<1)return 'Voeg minimaal 1 foto toe.';
    if(s===2){if(S.title.length<5)return 'Titel is te kort.';if(S.desc.length<20)return 'Omschrijving: minimaal 20 tekens.';if(!(+S.age>=21))return 'Adverteerders moeten 21+ zijn.';if(/(\+31|06)[\s-]?\d{8}/.test(S.desc))return 'Zet geen telefoonnummer in de tekst; gebruik het contactveld.';}
    if(s===3&&!S.city)return 'Kies een stad.';
    if(s===4&&cost()>me().credits)return 'Onvoldoende credits voor deze extra’s.';
    return '';}
  function finish(){collect();if(!$('#wAgree').checked){$('#wErr').textContent='Bevestig de voorwaarden.';return;}
    const c=cost(); if(c>me().credits){$('#wErr').textContent='Onvoldoende credits.';return;}
    const d2=db(); const usr=d2.users.find(x=>x.id===u.id); const mod=d2.settings.modRequired;
    let a=ex?d2.ads.find(x=>x.id===ex.id):null;
    if(!a){a={id:P.uid('a'),owner:u.id,created:P.now(),expires:new Date(Date.now()+d2.settings.adDays*864e5).toISOString(),bumps:0,views:0,clicks:0};d2.ads.unshift(a);}
    Object.assign(a,{title:S.title,cat:S.cat,type:S.type,city:S.city,desc:S.desc,age:+S.age,prices:S.prices.filter(p=>p[0]&&p[1]),photos:S.photos,contact:{tel:S.tel,wa:S.wa,mail:S.mail},incall:S.incall,outcall:S.outcall,status:mod?'wacht':'live',mod:mod?'in behandeling':'goedgekeurd',modNote:''});
    if(c){usr.credits-=c;ledger(usr,-c,'Extra’s bij plaatsen: '+S.title);}
    if(S.bump){a.bumps++;a.bumpedAt=P.now();} if(S.topDays){a.top=true;a.topUntil=new Date(Date.now()+S.topDays*864e5).toISOString();} if(S.vip){a.vip=true;a.vipUntil=new Date(Date.now()+7*864e5).toISOString();}
    d2.audit.unshift({at:P.now(),actor:usr.username,action:ex?'ad-edit':'ad-create',target:a.id,detail:S.title+(c?' · -'+c+' cr':'')});save(d2);
    root.innerHTML=`<div class="pdx-side">${accBar(u,'new')}<div class="pdx-card pdx-card-b" style="text-align:center;padding:40px"><div style="width:56px;height:56px;margin:0 auto;border-radius:50%;background:#2f9e4420;color:#2f9e44;display:flex;align-items:center;justify-content:center;font-size:24px"><i class="fa fa-check"></i></div><h1 class="pdx-h1" style="margin-top:12px">${mod?'Ingediend voor moderatie':'Je advertentie staat online'}</h1><p class="pdx-sub" style="margin-top:4px">${mod?'Een moderator controleert je advertentie (meestal binnen enkele uren). Concept: zie admin → Advertenties.':''}</p><div class="pdx-row" style="justify-content:center;margin-top:16px"><a href="mijn-advertenties.html" class="pdx-btn pd">Naar mijn advertenties</a><a href="advertentie-plaatsen.html" class="pdx-btn">Nog een plaatsen</a></div></div></div>`;bindLogout();
  }
  view();
}

/* ================= KYC ================= */
function pageKyc(root){
  const u=P.requireLogin(); if(!u)return;
  const d=db(); const req=d.kyc.find(k=>k.userId===u.id);
  const code='PD-'+(String(u.id).split('').reduce((s,c)=>s+c.charCodeAt(0),0)*37%9000+1000);
  const S={step:0,name:u.name||'',bd:'',idDone:false,selfie:false,kvk:u.company&&u.company.kvk||'',lic:''};
  const isB=u.role==='bedrijf';
  const steps=['Gegevens','ID-check','Selfie met code'].concat(isB?['Bedrijf']:[]).concat(['Indienen']);
  const status=()=>`<div class="pdx-card pdx-card-b pdx-between"><div><b>Status:</b> ${kycBadge(db().users.find(x=>x.id===u.id).kyc)}${req&&req.note?`<p class="pdx-small" style="margin-top:6px;color:#c92a2a">Notitie moderator: ${esc(req.note)}</p>`:''}</div><div class="pdx-xs pdx-muted">Niet gestart → Ingediend → Goedgekeurd / Afgewezen</div></div>`;
  function view(){
    const cur=db().users.find(x=>x.id===u.id).kyc;
    if(cur==='ingediend'||cur==='goedgekeurd'){root.innerHTML=`<div class="pdx-side">${accBar(u,'kyc')}<div style="display:grid;gap:16px;min-width:0"><h1 class="pdx-h1">Verificatie (KYC)</h1>${status()}<div class="pdx-card pdx-card-b pdx-small pdx-muted">${cur==='ingediend'?'Je aanvraag ligt bij een moderator. Je krijgt bericht zodra hij beoordeeld is (concept: admin → KYC-wachtrij).':'Je bent geverifieerd. Je advertenties tonen het paarse vinkje.'}</div>${demoNote}</div></div>`;bindLogout();return;}
    const st=S.step; const key=steps[st];
    const body={
     'Gegevens':`<div class="pdx-f two"><div><label class="pdx-lbl">Volledige naam (zoals op ID)</label><input class="pdx-in" id="kName" value="${esc(S.name)}"></div><div><label class="pdx-lbl">Geboortedatum</label><input class="pdx-in" id="kBd" placeholder="dd-mm-jjjj" value="${esc(S.bd)}"></div></div><p class="pdx-xs pdx-muted" style="margin-top:8px">We bewaren alleen de uitkomst (geverifieerd ja/nee, geboortejaar, datum). Zie <a href="privacy.html" style="color:#7351c0">privacy</a>.</p>`,
     'ID-check':`<p class="pdx-small">De ID-check gebeurt bij een beveiligde verificatiepartner. Paydates slaat <b>geen kopie</b> van je identiteitsbewijs op.</p><div class="pdx-row" style="margin-top:12px"><button class="pdx-btn ${S.idDone?'green':'pd'}" id="kId">${S.idDone?'<i class="fa fa-check"></i> ID-check voltooid (gesimuleerd)':'<i class="fa fa-id-card"></i> Start ID-check (simulatie)'}</button></div><p class="pdx-xs pdx-muted" style="margin-top:8px">Concept: er is nog geen KYC-provider gekoppeld; deze knop simuleert een geslaagde check.</p>`,
     'Selfie met code':`<p class="pdx-small">Maak een live selfie terwijl je deze code toont (op papier of scherm):</p><div style="font-size:28px;font-weight:800;letter-spacing:.12em;color:#5b3ba3;margin:10px 0">${code}</div><button class="pdx-btn ${S.selfie?'green':'pd'}" id="kSelfie">${S.selfie?'<i class="fa fa-check"></i> Selfie ontvangen (gesimuleerd)':'<i class="fa fa-camera"></i> Selfie maken (simulatie)'}</button><p class="pdx-xs pdx-muted" style="margin-top:8px">Concept: er wordt geen camera geopend en geen foto opgeslagen.</p>`,
     'Bedrijf':`<div class="pdx-f two"><div><label class="pdx-lbl">KvK-nummer</label><input class="pdx-in" id="kKvk" pattern="[0-9]{8}" value="${esc(S.kvk)}" placeholder="8 cijfers"></div><div><label class="pdx-lbl">Exploitatievergunning (nummer + gemeente)</label><input class="pdx-in" id="kLic" value="${esc(S.lic)}"></div></div><p class="pdx-xs pdx-muted" style="margin-top:8px">We controleren KvK en vergunning handmatig in het openbare register.</p>`,
     'Indienen':`<div class="pdx-grid pdx-g2 pdx-small"><div>Naam: <b>${esc(S.name)}</b></div><div>Geboortedatum: <b>${esc(S.bd)}</b></div><div>ID-check: <b>${S.idDone?'✔':'✘'}</b></div><div>Selfie: <b>${S.selfie?'✔':'✘'}</b></div>${isB?`<div>KvK: <b>${esc(S.kvk||'—')}</b></div><div>Vergunning: <b>${esc(S.lic||'—')}</b></div>`:''}</div><label class="pdx-opt" style="margin-top:12px"><input type="checkbox" id="kAgree"> Ik verklaar dat ik 21+ ben, uit vrije wil adverteer en dat de gegevens kloppen.</label>`
    }[key];
    root.innerHTML=`<div class="pdx-side">${accBar(u,'kyc')}<div style="display:grid;gap:16px;min-width:0"><div><h1 class="pdx-h1">Verificatie (KYC)</h1><p class="pdx-sub">Stap ${st+1} van ${steps.length}: ${key}</p></div>${status()}
     <ol class="pdx-steps">${steps.map((s,i)=>`<li class="${i<st?'done':i===st?'on':''}">${i+1}. ${s}</li>`).join('')}</ol>
     <div class="pdx-card"><div class="pdx-card-b">${body}</div><div class="pdx-card-b pdx-between" style="border-top:1px solid #eef1f7"><button class="pdx-btn" id="kPrev" ${st?'':'disabled'}>Vorige</button><span id="kErr" class="pdx-xs" style="color:#c92a2a"></span>${st<steps.length-1?'<button class="pdx-btn pd" id="kNext">Volgende</button>':'<button class="pdx-btn pd" id="kSend"><i class="fa fa-paper-plane"></i> Indienen</button>'}</div></div>${demoNote}</div></div>`;
    bindLogout();
    const g=id=>$('#'+id); const col=()=>{if(g('kName')){S.name=g('kName').value.trim();S.bd=g('kBd').value.trim();}if(g('kKvk')){S.kvk=g('kKvk').value.trim();S.lic=g('kLic').value.trim();}};
    if(g('kId'))g('kId').onclick=()=>{S.idDone=true;view();}; if(g('kSelfie'))g('kSelfie').onclick=()=>{S.selfie=true;view();};
    g('kPrev').onclick=()=>{col();S.step--;view();};
    if(g('kNext'))g('kNext').onclick=()=>{col();let e='';
      if(key==='Gegevens'){const m=S.bd.match(/^(\d{2})-(\d{2})-(\d{4})$/);if(S.name.length<3)e='Vul je naam in.';else if(!m)e='Geboortedatum als dd-mm-jjjj.';else if((Date.now()-new Date(+m[3],+m[2]-1,+m[1]))/31557600000<21)e='Je moet 21+ zijn om te adverteren.';}
      if(key==='ID-check'&&!S.idDone)e='Voltooi de ID-check.'; if(key==='Selfie met code'&&!S.selfie)e='Maak de selfie.'; if(key==='Bedrijf'&&!/^\d{8}$/.test(S.kvk))e='KvK-nummer: 8 cijfers.';
      if(e){g('kErr').textContent=e;return;}S.step++;view();};
    if(g('kSend'))g('kSend').onclick=()=>{if(!g('kAgree').checked){g('kErr').textContent='Bevestig de verklaring.';return;}
      const d2=db();const usr=d2.users.find(x=>x.id===u.id);usr.kyc='ingediend';d2.kyc=d2.kyc.filter(k=>k.userId!==u.id);
      d2.kyc.unshift({id:P.uid('k'),userId:u.id,submitted:P.now(),status:'ingediend',steps:Object.assign({id:S.idDone,selfie:S.selfie,age:true},isB?{reg:!!S.kvk}:{}),birthYear:(S.bd.match(/(\d{4})$/)||[])[1]||'',kvk:S.kvk,license:S.lic,code,note:'',reviewer:''});
      d2.audit.unshift({at:P.now(),actor:usr.username,action:'kyc-submit',target:usr.id,detail:'KYC ingediend (gesimuleerd)'});save(d2);toast('Verificatie ingediend');view();};
  }
  view();
}

/* ================= BEDRIJF CLAIMEN ================= */
function pageClaim(root){
  const u=session(); const club=qs('club')||''; const ref=P.safeNext(qs('ref'),'');
  root.innerHTML=`<div style="max-width:720px;margin:0 auto;display:grid;gap:16px"><div><h1 class="pdx-h1">Bedrijfsprofiel claimen</h1><p class="pdx-sub">Ben jij eigenaar of beheerder van een club, privéhuis of agency die op Paydates.nl staat? Claim het profiel om gegevens te beheren, foto’s (met gebruiksrechten) toe te voegen en statistieken te zien.</p></div>
   <form class="pdx-card pdx-card-b pdx-f two" id="clF"><div class="full"><label class="pdx-lbl">Bedrijfsnaam *</label><input class="pdx-in" id="clClub" required value="${esc(club)}"></div>
   <div><label class="pdx-lbl">Jouw naam *</label><input class="pdx-in" id="clName" required value="${esc(u?u.name:'')}"></div><div><label class="pdx-lbl">Rol *</label><select class="pdx-in" id="clRole"><option>Eigenaar</option><option>Bedrijfsleider</option><option>Marketing / beheer</option></select></div>
   <div><label class="pdx-lbl">Zakelijk e-mailadres *</label><input class="pdx-in" type="email" id="clEmail" required value="${esc(u?u.email:'')}"></div><div><label class="pdx-lbl">Zakelijk telefoonnummer</label><input class="pdx-in" id="clTel" inputmode="tel"></div>
   <div><label class="pdx-lbl">KvK-nummer *</label><input class="pdx-in" id="clKvk" required pattern="[0-9]{8}" placeholder="8 cijfers"></div><div><label class="pdx-lbl">Website</label><input class="pdx-in" id="clWeb" placeholder="https://"></div>
   <div class="full"><label class="pdx-lbl">Toelichting</label><textarea class="pdx-in" id="clMsg" placeholder="Bijv. welke gegevens kloppen niet?"></textarea></div>
   <label class="pdx-opt full"><input type="checkbox" required id="clOk"> Ik ben bevoegd namens dit bedrijf te handelen. Paydates mag dit controleren via KvK en het zakelijke e-mailadres/telefoonnummer.</label>
   <div class="full pdx-between"><span class="pdx-xs pdx-muted">Concept: de claim komt in admin → Claims. Er gaat geen e-mail de deur uit.</span><button class="pdx-btn pd"><i class="fa fa-paper-plane"></i> Claim indienen</button></div></form></div>`;
  $('#clF').addEventListener('submit',e=>{e.preventDefault();const g=id=>$('#'+id).value.trim();const d=db();
    const c={id:P.uid('cl'),club:g('clClub'),clubRef:ref,name:g('clName'),role:g('clRole'),email:g('clEmail'),phone:g('clTel'),kvk:g('clKvk'),web:g('clWeb'),msg:g('clMsg'),userId:u?u.id:'',status:'nieuw',at:P.now(),note:''};
    d.claims.unshift(c);d.audit.unshift({at:P.now(),actor:u?u.username:'gast',action:'claim',target:c.club,detail:'Claim ingediend'});save(d);
    P.mailSim({name:c.name,email:c.email,id:''},'claim',{bedrijf:c.club});
    root.querySelector('form').outerHTML='<div class="pdx-card pdx-card-b" style="text-align:center;padding:30px"><i class="fa fa-circle-check" style="font-size:32px;color:#2f9e44"></i><h2 class="pdx-h1" style="font-size:18px;margin-top:8px">Claim ontvangen</h2><p class="pdx-sub">We controleren je gegevens en nemen binnen 2 werkdagen contact op via support@paydates.nl.</p></div>';});
}

/* ================= router ================= */
header();
const root=document.getElementById('pdxRoot');
({login:pageLogin,register:pageRegister,'wachtwoord-vergeten':pageReset,account:pageAccount,dashboard:pageDashboard,'mijn-advertenties':pageMyAds,'advertentie-plaatsen':pageWizard,kyc:pageKyc,'bedrijf-claimen':pageClaim}[PAGE]||function(){})(root);
})();
