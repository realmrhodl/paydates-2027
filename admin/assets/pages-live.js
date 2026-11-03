/* Paydates V2 admin — functies uit het huidige (live) Paydates-admin, overgezet naar V2 (concept, localStorage).
   Advertenties (goedkeuren/afkeuren/bewerken/verwijderen/promoten/auto-promotie/verwijderd), meldingen, support,
   reviews, categorieën, content & menu, gebruiker-uitbreiding (niveau, bonus, historie), betalingen (agency, omzetmodel, orders).
   Niets wordt echt verstuurd of afgerekend. */
(function(){
'use strict';
const A=window.PDXA; if(!A)return;
const {P,$,$$,qs,me,modal,dl,csv,audit,uById,kycB,adB,main,head,kpi,R}=A; const {db,save,esc,fmtD,fmtDT,eur,toast}=P;
const opt=(arr,cur)=>arr.map(r=>{const v=Array.isArray(r)?r[0]:r,t=Array.isArray(r)?r[1]:r;return `<option value="${esc(v)}" ${String(cur)===String(v)?'selected':''}>${esc(t)}</option>`}).join('');
const adName=(d,id)=>{const a=d.ads.find(x=>x.id===id);return a?a.title:'(onbekend)';};
const tabsH=(tabs,cur)=>`<div class="adm-tabs">${tabs.map(t=>`<a href="#" data-t="${t[0]}" class="${cur===t[0]?'on':''}">${t[1]} <span class="pdx-xs">(${t[2]})</span></a>`).join('')}</div>`;
const bindTabs=(F,draw)=>$$('[data-t]').forEach(t=>t.onclick=e=>{e.preventDefault();F.tab=t.dataset.t;F.page=0;draw();});

/* ================= ADVERTENTIES ================= */
R.advertenties=function(){
  const F={tab:qs('tab')||'wacht',q:'',owner:qs('owner')||'',cat:'',type:'',boost:'',page:0};
  const isDel=a=>a.status==='verwijderd';
  function draw(){const d=db();const q=F.q.toLowerCase();const r=d.pay.rates;
    const cnt=k=>k==='all'?d.ads.filter(a=>!isDel(a)).length:d.ads.filter(a=>a.status===k).length;
    const tabs=[['wacht','Wacht op goedkeuring'],['live','Live'],['gepauzeerd','Gepauzeerd'],['afgekeurd','Afgekeurd'],['verlopen','Verlopen'],['all','Alles'],['verwijderd','Verwijderd']].map(t=>[t[0],t[1],cnt(t[0])]);
    const L=d.ads.filter(a=>(F.tab==='all'?!isDel(a):a.status===F.tab)&&(!F.owner||a.owner===F.owner)&&(!F.cat||a.cat===F.cat)&&(!F.type||a.type===F.type)
      &&(!F.boost||(F.boost==='vip'&&a.vip)||(F.boost==='top'&&a.top)||(F.boost==='auto'&&a.auto)||(F.boost==='geen'&&!a.vip&&!a.top&&!a.auto))
      &&(!q||[a.title,a.city,a.type,a.cat,(uById(a.owner)||{}).username].join(' ').toLowerCase().includes(q)));
    const per=50,pages=Math.max(1,Math.ceil(L.length/per));F.page=Math.min(F.page,pages-1);
    main().innerHTML=head('Advertenties','Goedkeuren, afkeuren, bewerken, verwijderen en promoten. Nieuwe en gewijzigde advertenties gaan eerst langs moderatie.',
      `${F.owner?`<a class="pdx-btn" href="advertenties.html?tab=${F.tab}">Filter eigenaar wissen</a>`:''}<button class="pdx-btn" id="aExp"><i class="fa fa-file-csv"></i> Export</button>`)+
    `<div class="pdx-grid pdx-g4" style="margin-bottom:14px">${kpi('Wacht op goedkeuring',cnt('wacht'))}${kpi('Live',cnt('live'))}${kpi('Auto-promotie aan',d.ads.filter(a=>a.auto&&!isDel(a)).length,r.autoBumpDay+' cr per dag')}${kpi('VIP / TOP',d.ads.filter(a=>a.vip).length+' / '+d.ads.filter(a=>a.top).length)}</div>`+
    tabsH(tabs,F.tab)+
    `<div class="pdx-card"><div class="pdx-card-h" style="flex-wrap:wrap;gap:8px"><span class="pdx-row" style="flex-wrap:wrap"><input class="pdx-in" style="max-width:260px" id="aq" placeholder="Zoek titel, stad, gebruiker…" value="${esc(F.q)}">
      <select class="pdx-in" style="width:auto" id="acat"><option value="">Alle categorieën</option>${opt(d.cats.map(c=>[c.k,c.t]),F.cat)}</select>
      <select class="pdx-in" style="width:auto" id="atype"><option value="">Alle soorten</option>${opt(d.adTypes.map(t=>t.t),F.type)}</select>
      <select class="pdx-in" style="width:auto" id="aboost"><option value="">Promotie: alles</option>${opt([['vip','VIP'],['top','TOP'],['auto','Auto-promotie'],['geen','Geen promotie']],F.boost)}</select></span><span class="pdx-xs pdx-muted">${L.length} advertenties</span></div>
    <div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Advertentie</th><th>Eigenaar</th><th>Categorie</th><th>Status</th><th>Promotie</th><th title="Elke dag automatisch omhoog">Auto</th><th>Loopt tot</th><th>Stats</th><th style="text-align:right">Acties</th></tr></thead><tbody>${L.slice(F.page*per,F.page*per+per).map(a=>{const u=uById(a.owner)||{};return `<tr>
      <td><b>${esc(a.title)}</b><div class="pdx-xs pdx-muted">${esc(a.type)} · ${esc(a.city)} · ${fmtD(a.created)}</div>${a.modNote?`<div class="pdx-xs" style="color:#c92a2a">${esc(a.modNote)}</div>`:''}${isDel(a)?`<div class="pdx-xs pdx-muted">Verwijderd ${fmtDT(a.deletedAt)} door ${esc(a.deletedBy||'?')}</div>`:''}</td>
      <td class="pdx-small"><a href="gebruiker.html?id=${u.id}" style="color:#7351c0">${esc(u.username||'?')}</a> ${kycB(u.kyc||'geen')}</td><td class="pdx-xs">${esc(a.cat||'')}</td><td>${adB(a.status)}</td>
      <td class="pdx-xs">${a.vip?'<span class="pdx-badge gold">VIP</span> ':''}${a.top?'<span class="pdx-badge warn">TOP</span> ':''}${a.bumps?a.bumps+'× omhoog':''}${a.lastBump?`<div class="pdx-muted">laatst ${fmtDT(a.lastBump)}</div>`:''}</td>
      <td>${isDel(a)?'':`<label class="pdx-switch"><input type="checkbox" data-auto="${a.id}" ${a.auto?'checked':''}><span></span></label>`}</td>
      <td class="pdx-xs">${fmtD(a.expires)}</td><td class="pdx-xs">${a.views||0} views · ${a.clicks||0} kliks</td>
      <td style="text-align:right;white-space:nowrap">${isDel(a)?`<button class="pdx-btn sm green" data-restore="${a.id}">Herstellen</button> <button class="pdx-btn sm red" data-purge="${a.id}">Definitief</button>`:
        `${a.status!=='live'?`<button class="pdx-btn sm green" data-ok="${a.id}">Goedkeuren</button> `:''}${a.status!=='afgekeurd'?`<button class="pdx-btn sm red" data-no="${a.id}">Afkeuren</button> `:''}<button class="pdx-btn sm" data-edit="${a.id}" title="Bewerken"><i class="fa fa-pen"></i></button> <button class="pdx-btn sm pd" data-promo="${a.id}" title="Promoten"><i class="fa fa-arrow-up"></i></button> ${a.status==='live'?`<button class="pdx-btn sm" data-pause="${a.id}" title="Pauzeren"><i class="fa fa-pause"></i></button> `:''}<button class="pdx-btn sm red" data-del="${a.id}" title="Verwijderen"><i class="fa fa-trash"></i></button> ${a.listingId?`<a class="pdx-btn sm" target="_blank" href="../advertentie.html?id=${a.listingId}" title="Bekijk op site"><i class="fa fa-eye"></i></a>`:`<a class="pdx-btn sm" target="_blank" href="../advertentie.html?ad=${a.id}" title="Voorbeeld"><i class="fa fa-eye"></i></a>`}`}</td></tr>`}).join('')||'<tr><td colspan="9" class="pdx-muted" style="text-align:center;padding:24px">Niets in deze lijst. 🎉</td></tr>'}</tbody></table></div>
    <div class="adm-pager"><button class="pdx-btn sm" ${F.page?'':'disabled'} id="pp">‹</button> Pagina ${F.page+1} / ${pages} <button class="pdx-btn sm" ${F.page<pages-1?'':'disabled'} id="pn">›</button></div></div>
    <p class="pdx-xs pdx-muted" style="margin-top:8px">Auto-promotie = elke dag automatisch omhoog voor ${r.autoBumpDay} credits (V2-verdienmodel). In productie draait dit als dagelijkse job; hier wordt het alleen opgeslagen.</p>`;
    bindTabs(F,draw);
    $('#pp').onclick=()=>{F.page--;draw()};$('#pn').onclick=()=>{F.page++;draw()};
    $('#aq').oninput=e=>{F.q=e.target.value;F.page=0;const p=e.target.selectionStart;draw();const n=$('#aq');n.focus();n.setSelectionRange(p,p);};
    [['acat','cat'],['atype','type'],['aboost','boost']].forEach(([id,k])=>$('#'+id).onchange=e=>{F[k]=e.target.value;F.page=0;draw();});
    $('#aExp').onclick=()=>dl('paydates-advertenties-demo.csv',csv([['id','titel','eigenaar','categorie','soort','stad','status','vip','top','auto','bumps','loopt tot']].concat(L.map(a=>[a.id,a.title,(uById(a.owner)||{}).username,a.cat,a.type,a.city,a.status,a.vip?1:0,a.top?1:0,a.auto?1:0,a.bumps||0,a.expires]))),'text/csv');
    const upd=(id,fn,act,dt)=>{const d2=db();const a=d2.ads.find(x=>x.id===id);if(!a)return;fn(a,d2);save(d2);audit(act,a.title,dt||'');draw();};
    $$('[data-ok]').forEach(b=>b.onclick=()=>{const d2=db();const a=d2.ads.find(x=>x.id===b.dataset.ok);const u=d2.users.find(x=>x.id===a.owner);
      if(u&&u.kyc!=='goedgekeurd'&&!confirm('Eigenaar is nog niet geverifieerd (KYC: '+u.kyc+'). Toch goedkeuren?'))return;
      a.status='live';a.mod='goedgekeurd';a.modNote='';if(!a.expires||new Date(a.expires)<new Date())a.expires=new Date(Date.now()+d2.settings.adDays*864e5).toISOString();save(d2);
      P.mailSim(u,'ad_live',{advertentie:a.title});audit('ad-approve',a.title,'');toast('Goedgekeurd · mail gesimuleerd');draw();});
    $$('[data-no]').forEach(b=>b.onclick=()=>modal('Advertentie afkeuren',`<label class="pdx-lbl">Reden (gaat naar adverteerder)</label><select class="pdx-in" id="rr"><option>Foto’s niet echt / niet eigen</option><option>Minderjarig ogend of leeftijd onduidelijk</option><option>Verboden diensten of teksten</option><option>Contactgegevens in afbeelding</option><option>Dubbele advertentie</option><option>Overig</option></select><label class="pdx-lbl" style="margin-top:8px">Toelichting</label><textarea class="pdx-in" id="rt"></textarea>`,m=>{
      const note=m.querySelector('#rr').value+(m.querySelector('#rt').value?': '+m.querySelector('#rt').value:'');const d2=db();const a=d2.ads.find(x=>x.id===b.dataset.no);a.status='afgekeurd';a.mod='afgekeurd';a.modNote=note;save(d2);
      P.mailSim(d2.users.find(x=>x.id===a.owner),'ad_rej',{advertentie:a.title,notitie:note});audit('ad-reject',a.title,note);draw();},'Afkeuren'));
    $$('[data-pause]').forEach(b=>b.onclick=()=>upd(b.dataset.pause,a=>a.status='gepauzeerd','ad-pause','door moderatie'));
    $$('[data-auto]').forEach(c=>c.onchange=()=>upd(c.dataset.auto,a=>a.auto=c.checked,'ad-auto',c.checked?'auto-promotie aan':'auto-promotie uit'));
    $$('[data-del]').forEach(b=>b.onclick=()=>modal('Advertentie verwijderen','<p class="pdx-small">De advertentie gaat naar <b>Verwijderd</b> en is direct offline. Herstellen kan daar.</p><label class="pdx-lbl" style="margin-top:8px">Reden (intern)</label><input class="pdx-in" id="dr" value="Verwijderd door moderatie">',m=>{const why=m.querySelector('#dr').value;
      upd(b.dataset.del,a=>{a.prevStatus=a.status;a.status='verwijderd';a.deletedAt=P.now();a.deletedBy=me.username;a.deleteReason=why;a.vip=false;a.top=false;a.auto=false;},'ad-delete',why);},'Verwijderen'));
    $$('[data-restore]').forEach(b=>b.onclick=()=>upd(b.dataset.restore,a=>{a.status=a.prevStatus&&a.prevStatus!=='verwijderd'?a.prevStatus:'wacht';delete a.deletedAt;},'ad-restore',''));
    $$('[data-purge]').forEach(b=>b.onclick=()=>{if(!confirm('Definitief verwijderen? Dit kan niet ongedaan worden (in de demo).'))return;const d2=db();const a=d2.ads.find(x=>x.id===b.dataset.purge);d2.ads=d2.ads.filter(x=>x.id!==b.dataset.purge);save(d2);audit('ad-purge',a?a.title:'','definitief');draw();});
    $$('[data-promo]').forEach(b=>b.onclick=()=>promo(b.dataset.promo,draw));
    $$('[data-edit]').forEach(b=>b.onclick=()=>editAd(b.dataset.edit,draw));
  }
  draw();
};
function promo(id,cb){const d=db();const a=d.ads.find(x=>x.id===id);const r=d.pay.rates;
  modal('Promoten: '+esc(a.title),`<p class="pdx-small pdx-muted">Als moderator kun je gratis promoten (bijv. compensatie) of de adverteerder laten betalen met credits.</p>
   <div class="pdx-f" style="margin-top:8px"><label class="pdx-opt"><input type="radio" name="pa" value="bump" checked> Nu omhoog (${r.bump} cr)</label>
   <label class="pdx-opt"><input type="radio" name="pa" value="top"> TOP-plaatsing 1 dag (${r.topDay} cr)</label>
   <label class="pdx-opt"><input type="radio" name="pa" value="vip"> VIP 7 dagen (${r.vip7} cr)</label>
   <label class="pdx-opt"><input type="radio" name="pa" value="auto"> Auto-promotie aanzetten (${r.autoBumpDay} cr/dag)</label>
   <label class="pdx-opt"><input type="radio" name="pa" value="off"> Alle promotie uitzetten</label>
   <label class="pdx-lbl" style="margin-top:6px">Betaling</label><select class="pdx-in" id="pw"><option value="gratis">Gratis (door moderatie)</option><option value="credits">Afschrijven van credits adverteerder</option></select></div>`,m=>{
    const act=m.querySelector('[name=pa]:checked').value,pay=m.querySelector('#pw').value;const d2=db();const x=d2.ads.find(y=>y.id===id);const u=d2.users.find(y=>y.id===x.owner);
    const cost={bump:r.bump,top:r.topDay,vip:r.vip7,auto:0,off:0}[act];
    if(pay==='credits'&&cost){if(!u||u.credits<cost){toast('Adverteerder heeft te weinig credits');return false;}u.credits-=cost;u.ledger=u.ledger||[];u.ledger.unshift({at:P.now(),delta:-cost,t:'Promotie ('+act+') door moderatie: '+x.title,bal:u.credits});}
    if(act==='bump'){x.bumps=(x.bumps||0)+1;x.lastBump=P.now();}
    if(act==='top'){x.top=true;x.topUntil=new Date(Date.now()+864e5).toISOString();}
    if(act==='vip'){x.vip=true;x.vipUntil=new Date(Date.now()+7*864e5).toISOString();}
    if(act==='auto')x.auto=true;
    if(act==='off'){x.top=false;x.vip=false;x.auto=false;}
    save(d2);audit('ad-promote',x.title,act+' · '+pay);toast('Promotie verwerkt');cb();},'Toepassen');}
function editAd(id,cb){const d=db();const a=d.ads.find(x=>x.id===id);
  modal('Advertentie bewerken',`<div class="pdx-f two">
    <div class="full"><label class="pdx-lbl">Titel</label><input class="pdx-in" id="eT" value="${esc(a.title)}"></div>
    <div class="full"><label class="pdx-lbl">Subtitel</label><input class="pdx-in" id="eS" value="${esc(a.subtitle||'')}"></div>
    <div><label class="pdx-lbl">Categorie</label><select class="pdx-in" id="eC">${opt(d.cats.map(c=>[c.k,c.t]),a.cat)}</select></div>
    <div><label class="pdx-lbl">Soort</label><select class="pdx-in" id="eY">${opt(d.adTypes.map(t=>t.t),a.type)}</select></div>
    <div><label class="pdx-lbl">Stad</label><input class="pdx-in" id="eP" value="${esc(a.city||'')}"></div>
    <div><label class="pdx-lbl">Status</label><select class="pdx-in" id="eSt">${opt(['wacht','live','gepauzeerd','afgekeurd','verlopen'],a.status)}</select></div>
    <div><label class="pdx-lbl">Loopt tot</label><input class="pdx-in" type="date" id="eE" value="${(a.expires||'').slice(0,10)}"></div>
    <div><label class="pdx-lbl">Reviews</label><select class="pdx-in" id="eR">${opt([['1','Aan'],['0','Uit']],a.reviewsOff?'0':'1')}</select></div>
    <div class="full"><label class="pdx-lbl">Omschrijving</label><textarea class="pdx-in" id="eD" rows="4">${esc(a.desc||'')}</textarea></div>
    <div class="full"><label class="pdx-lbl">Moderatienotitie (zichtbaar voor adverteerder)</label><input class="pdx-in" id="eN" value="${esc(a.modNote||'')}"></div></div>`,m=>{
    const g=s=>m.querySelector(s).value;const d2=db();const x=d2.ads.find(y=>y.id===id);const ch=[];
    [['title','#eT'],['subtitle','#eS'],['cat','#eC'],['type','#eY'],['city','#eP'],['status','#eSt'],['desc','#eD'],['modNote','#eN']].forEach(([k,s])=>{const v=g(s);if((x[k]||'')!==v){ch.push(k);x[k]=v;}});
    if(g('#eE'))x.expires=new Date(g('#eE')+'T23:59:00').toISOString();x.reviewsOff=g('#eR')==='0';
    save(d2);audit('ad-edit',x.title,ch.join(', ')||'geen wijzigingen');toast('Opgeslagen');cb();});}

/* ================= MELDINGEN ================= */
R.meldingen=function(){
  const F={tab:'nieuw'};
  function draw(){const d=db();const del=d.deleted.reports;
    const tabs=[['nieuw','Open',d.reports.filter(r=>r.status==='nieuw').length],['afgehandeld','Afgehandeld',d.reports.filter(r=>r.status==='afgehandeld').length],['verwijderd','Verwijderde meldingen',del.length]];
    const L=F.tab==='verwijderd'?del:d.reports.filter(r=>r.status===F.tab);
    main().innerHTML=head('Meldingen','Meldingen van bezoekers via <a href="../melden.html" target="_blank" style="color:#7351c0">melden.html</a> (nep, minderjarig, onjuist, uitbuiting…). Nieuwe meldingen uit het formulier komen hier binnen (localStorage).')+tabsH(tabs,F.tab)+
    `<div class="pdx-card"><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Datum</th><th>Over</th><th>Reden</th><th>Toelichting</th><th>Melder</th><th style="text-align:right">Acties</th></tr></thead><tbody>${L.map(r=>{const a=d.ads.find(x=>x.id===r.adId);return `<tr>
      <td class="pdx-xs" style="white-space:nowrap">${fmtDT(r.at)}</td><td class="pdx-small">${a?`<b>${esc(a.title)}</b><div class="pdx-xs"><a href="advertenties.html?owner=${a.owner}&tab=all" style="color:#7351c0">naar advertentie</a></div>`:esc(r.adRef||r.type||'')}</td>
      <td><span class="adm-chip">${esc(r.reason||'')}</span></td><td class="pdx-small">${esc(r.text||'')}${r.note?`<div class="pdx-xs pdx-muted">Afhandeling: ${esc(r.note)}</div>`:''}</td><td class="pdx-xs">${esc(r.email||'anoniem')}</td>
      <td style="text-align:right;white-space:nowrap">${F.tab==='verwijderd'?`<button class="pdx-btn sm" data-rr="${r.id}">Herstellen</button>`:`${r.status==='nieuw'?`<button class="pdx-btn sm green" data-done="${r.id}">Afhandelen</button> `:''}${a&&a.status!=='verwijderd'?`<button class="pdx-btn sm" data-off="${r.id}">Advertentie pauzeren</button> `:''}<button class="pdx-btn sm red" data-rdel="${r.id}"><i class="fa fa-trash"></i></button>`}</td></tr>`}).join('')||'<tr><td colspan="6" class="pdx-muted" style="text-align:center;padding:24px">Geen meldingen.</td></tr>'}</tbody></table></div></div>
    <p class="pdx-xs pdx-muted" style="margin-top:8px">Meldingen over minderjarigheid of uitbuiting: advertentie direct offline en escaleren volgens het meldprotocol (Gap-analyse P0).</p>`;
    bindTabs(F,draw);
    $$('[data-done]').forEach(b=>b.onclick=()=>modal('Melding afhandelen','<label class="pdx-lbl">Wat is er gedaan?</label><select class="pdx-in" id="hn"><option>Geen overtreding gevonden</option><option>Adverteerder gewaarschuwd</option><option>Advertentie aangepast</option><option>Advertentie verwijderd</option><option>Gebruiker geschorst</option></select>',m=>{const d2=db();const r=d2.reports.find(x=>x.id===b.dataset.done);r.status='afgehandeld';r.note=m.querySelector('#hn').value;r.by=me.username;save(d2);audit('report-done',r.id,r.note);draw();},'Afhandelen'));
    $$('[data-off]').forEach(b=>b.onclick=()=>{const d2=db();const r=d2.reports.find(x=>x.id===b.dataset.off);const a=d2.ads.find(x=>x.id===r.adId);a.status='gepauzeerd';a.modNote='Gepauzeerd na melding';save(d2);audit('ad-pause',a.title,'na melding '+r.id);toast('Advertentie gepauzeerd');draw();});
    $$('[data-rdel]').forEach(b=>b.onclick=()=>{const d2=db();const i=d2.reports.findIndex(x=>x.id===b.dataset.rdel);const [r]=d2.reports.splice(i,1);r.deletedAt=P.now();d2.deleted.reports.unshift(r);save(d2);audit('report-delete',r.id,'');draw();});
    $$('[data-rr]').forEach(b=>b.onclick=()=>{const d2=db();const i=d2.deleted.reports.findIndex(x=>x.id===b.dataset.rr);const [r]=d2.deleted.reports.splice(i,1);d2.reports.unshift(r);save(d2);audit('report-restore',r.id,'');draw();});
  }
  draw();
};

/* ================= SUPPORT ================= */
R.support=function(){
  const F={tab:'open'};
  function draw(){const d=db();const T=d.support;
    const tabs=[['open','Open',T.filter(t=>t.status==='open').length],['gesloten','Gesloten',T.filter(t=>t.status==='gesloten').length],['all','Alles',T.length]];
    const L=T.filter(t=>F.tab==='all'||t.status===F.tab);
    main().innerHTML=head('Support','Tickets uit het <a href="../contact.html" target="_blank" style="color:#7351c0">contactformulier</a> en van ingelogde gebruikers. Antwoorden worden gesimuleerd verstuurd vanaf '+esc(d.settings.supportEmail||'support@paydates.nl')+'.')+tabsH(tabs,F.tab)+
    `<div style="display:grid;gap:12px">${L.map(t=>{const u=t.user&&uById(t.user);return `<div class="pdx-card"><div class="pdx-card-h"><span><b>${esc(t.subject)}</b> <span class="adm-chip">${esc(t.type)}</span> <span class="pdx-badge ${t.status==='open'?'warn':'ok'}">${esc(t.status)}</span></span><span class="pdx-xs pdx-muted">${fmtDT(t.at)} · ${u?`<a href="gebruiker.html?id=${u.id}" style="color:#7351c0">${esc(u.username)}</a>`:esc(t.email||'')}</span></div>
      <div class="pdx-card-b pdx-small"><p>${esc(t.text)}</p>${(t.replies||[]).map(r=>`<div style="margin-top:8px;padding:8px 10px;background:#f6f3fc;border-radius:8px"><b>${esc(r.by)}</b> <span class="pdx-xs pdx-muted">${fmtDT(r.at)}</span><div>${esc(r.t)}</div></div>`).join('')}
      ${t.status==='open'?`<div class="pdx-row" style="margin-top:10px"><input class="pdx-in" style="flex:1" data-rt="${t.id}" placeholder="Antwoord aan ${esc(t.email||'gebruiker')}"><button class="pdx-btn sm pd" data-rp="${t.id}">Antwoorden</button><button class="pdx-btn sm" data-cl="${t.id}">Sluiten</button></div>`:`<div style="margin-top:8px"><button class="pdx-btn sm" data-ro="${t.id}">Heropenen</button></div>`}</div></div>`}).join('')||'<div class="pdx-card pdx-card-b pdx-muted">Geen tickets.</div>'}</div>`;
    bindTabs(F,draw);
    const set=(id,fn,act)=>{const d2=db();const t=d2.support.find(x=>x.id===id);fn(t);save(d2);audit(act,t.subject,'');draw();};
    $$('[data-rp]').forEach(b=>b.onclick=()=>{const v=$(`[data-rt="${b.dataset.rp}"]`).value.trim();if(!v)return toast('Typ eerst een antwoord');set(b.dataset.rp,t=>{t.replies=t.replies||[];t.replies.push({at:P.now(),by:me.username,t:v});
      const d2=db();d2.mail.log.unshift({id:P.uid('m'),at:P.now(),to:t.email,userId:t.user||'',tpl:'support',subject:'Re: '+t.subject,status:'gesimuleerd'});save(d2);},'support-reply');toast('Antwoord gesimuleerd (niet verzonden)');});
    $$('[data-cl]').forEach(b=>b.onclick=()=>set(b.dataset.cl,t=>t.status='gesloten','support-close'));
    $$('[data-ro]').forEach(b=>b.onclick=()=>set(b.dataset.ro,t=>t.status='open','support-reopen'));
  }
  draw();
};

/* ================= REVIEWS ================= */
R.reviews=function(){
  const F={tab:'wacht'};
  function draw(){const d=db();const V=d.reviews;
    const tabs=[['wacht','Te beoordelen',V.filter(r=>r.status==='wacht').length],['goedgekeurd','Goedgekeurd',V.filter(r=>r.status==='goedgekeurd').length],['afgekeurd','Afgekeurd',V.filter(r=>r.status==='afgekeurd').length]];
    const L=V.filter(r=>r.status===F.tab);
    main().innerHTML=head('Reviews','Reviews van klanten op advertenties. Pas na goedkeuring zichtbaar; adverteerders kunnen reviews per advertentie uitzetten.')+tabsH(tabs,F.tab)+
    `<div class="pdx-card"><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Datum</th><th>Advertentie</th><th>Door</th><th>Sterren</th><th>Review</th><th style="text-align:right">Acties</th></tr></thead><tbody>${L.map(r=>`<tr><td class="pdx-xs">${fmtD(r.at)}</td><td class="pdx-small"><b>${esc(adName(d,r.adId))}</b></td><td class="pdx-small">${esc(r.by)}</td><td style="color:#f59f00;white-space:nowrap">${'★'.repeat(r.stars)}<span style="color:#dee2e6">${'★'.repeat(5-r.stars)}</span></td><td class="pdx-small">${esc(r.text)}</td>
      <td style="text-align:right;white-space:nowrap">${r.status!=='goedgekeurd'?`<button class="pdx-btn sm green" data-rv="${r.id}" data-s="goedgekeurd">Goedkeuren</button> `:''}${r.status!=='afgekeurd'?`<button class="pdx-btn sm" data-rv="${r.id}" data-s="afgekeurd">Afkeuren</button> `:''}<button class="pdx-btn sm red" data-rx="${r.id}"><i class="fa fa-trash"></i></button></td></tr>`).join('')||'<tr><td colspan="6" class="pdx-muted" style="text-align:center;padding:24px">Geen reviews.</td></tr>'}</tbody></table></div></div>`;
    bindTabs(F,draw);
    $$('[data-rv]').forEach(b=>b.onclick=()=>{const d2=db();const r=d2.reviews.find(x=>x.id===b.dataset.rv);r.status=b.dataset.s;save(d2);audit('review-'+r.status,adName(d2,r.adId),r.by);draw();});
    $$('[data-rx]').forEach(b=>b.onclick=()=>{if(!confirm('Review verwijderen?'))return;const d2=db();d2.reviews=d2.reviews.filter(x=>x.id!==b.dataset.rx);save(d2);audit('review-delete',b.dataset.rx,'');draw();});
  }
  draw();
};

/* ================= CATEGORIEËN ================= */
R.categorieen=function(){
  function list(key,title,sub){const d=db();const L=d[key].slice().sort((a,b)=>a.order-b.order);
    return `<div class="pdx-card"><div class="pdx-card-h"><span>${title}</span><button class="pdx-btn sm pd" data-add="${key}"><i class="fa fa-plus"></i> Toevoegen</button></div><div class="pdx-card-b pdx-xs pdx-muted">${sub}</div><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>#</th><th>Naam</th>${key==='cats'?'<th>Sleutel</th><th>URL</th>':''}<th>Advertenties</th><th>Actief</th><th></th></tr></thead><tbody>${L.map(c=>`<tr><td class="pdx-xs">${c.order}</td><td><b>${esc(c.t)}</b></td>${key==='cats'?`<td class="pdx-xs">${esc(c.k)}</td><td class="pdx-xs">/${esc(c.slug)}</td>`:''}<td class="pdx-xs">${d.ads.filter(a=>key==='cats'?a.cat===c.k:a.type===c.t).length}</td>
      <td><label class="pdx-switch"><input type="checkbox" data-act="${key}:${c.id}" ${c.active?'checked':''}><span></span></label></td><td style="text-align:right;white-space:nowrap"><button class="pdx-btn sm" data-up="${key}:${c.id}" title="Omhoog"><i class="fa fa-arrow-up"></i></button> <button class="pdx-btn sm" data-ed="${key}:${c.id}"><i class="fa fa-pen"></i></button> <button class="pdx-btn sm red" data-rm="${key}:${c.id}"><i class="fa fa-trash"></i></button></td></tr>`).join('')}</tbody></table></div></div>`;}
  function draw(){main().innerHTML=head('Categorieën','Advertentiecategorieën (wie) en soorten (wat). Inactieve items verdwijnen uit filters en uit de plaatsingswizard.')+`<div class="pdx-grid pdx-g2">${list('cats','Categorieën','Vrouwen, Mannen, Shemales, Stellen…')}${list('adTypes','Soorten advertenties','Escort, Privé ontvangst, Online (live: “Virtueel”), BDSM, Erotische massage…')}</div>`;
    const split=v=>v.split(':');
    $$('[data-act]').forEach(c=>c.onchange=()=>{const [k,id]=split(c.dataset.act);const d=db();const x=d[k].find(y=>y.id===id);x.active=c.checked;save(d);audit('cat-active',x.t,String(c.checked));});
    $$('[data-up]').forEach(b=>b.onclick=()=>{const [k,id]=split(b.dataset.up);const d=db();const L=d[k].sort((a,b)=>a.order-b.order);const i=L.findIndex(y=>y.id===id);if(i>0){const t=L[i-1].order;L[i-1].order=L[i].order;L[i].order=t;}save(d);draw();});
    $$('[data-rm]').forEach(b=>b.onclick=()=>{const [k,id]=split(b.dataset.rm);const d=db();const x=d[k].find(y=>y.id===id);const n=d.ads.filter(a=>k==='cats'?a.cat===x.k:a.type===x.t).length;if(n){toast(n+' advertenties gebruiken dit item; zet het op inactief');return;}if(!confirm('Verwijderen?'))return;d[k]=d[k].filter(y=>y.id!==id);save(d);audit('cat-delete',x.t,'');draw();});
    const form=(k,x)=>modal(x?'Bewerken':'Toevoegen',`<label class="pdx-lbl">Naam</label><input class="pdx-in" id="cT" value="${esc(x?x.t:'')}">${k==='cats'?`<label class="pdx-lbl" style="margin-top:8px">Sleutel (enkelvoud)</label><input class="pdx-in" id="cK" value="${esc(x?x.k:'')}"><label class="pdx-lbl" style="margin-top:8px">URL-slug</label><input class="pdx-in" id="cS" value="${esc(x?x.slug:'')}">`:''}`,m=>{const t=m.querySelector('#cT').value.trim();if(!t){toast('Naam verplicht');return false;}const d=db();
      let y=x?d[k].find(z=>z.id===x.id):null;if(!y){y={id:P.uid(k==='cats'?'cat':'typ'),active:true,order:d[k].length+1};d[k].push(y);}y.t=t;if(k==='cats'){y.k=m.querySelector('#cK').value.trim()||t;y.slug=(m.querySelector('#cS').value.trim()||t).toLowerCase().replace(/[^a-z0-9]+/g,'-');}save(d);audit('cat-save',t,'');draw();});
    $$('[data-add]').forEach(b=>b.onclick=()=>form(b.dataset.add,null));
    $$('[data-ed]').forEach(b=>b.onclick=()=>{const [k,id]=split(b.dataset.ed);form(k,db()[k].find(y=>y.id===id));});
  }
  draw();
};

/* ================= CONTENT & MENU ================= */
const CONTENT_SEED={
  menu:[['Escorts','escorts.html'],['Privé ontvangst','prive-ontvangst.html'],['Seksclubs','seksclubs.html'],['Gangbangs & feesten','gangbangs.html'],['Werken bij een seksbedrijf','vacatures.html'],['Adverteren','adverteren.html']].map((r,i)=>({id:'mn'+i,t:r[0],url:r[1],active:true})),
  blogs:[['Veilig daten: 10 tips','blog.html'],['Zo werkt verificatie op Paydates','verificatie.html']].map((r,i)=>({id:'bl'+i,t:r[0],url:r[1],active:true})),
  links:[['Erotische webshop (partner)','https://example.com'],['Camplatform (partner)','https://example.com']].map((r,i)=>({id:'lp'+i,t:r[0],url:r[1],active:true})),
  videos:[['Profielvideo’s (wachtrij)','videos.html']].map((r,i)=>({id:'vd'+i,t:r[0],url:r[1],active:true})),
  langs:[['Nederlands (standaard)','nl'],['English','en'],['Deutsch','de']].map((r,i)=>({id:'lg'+i,t:r[0],url:r[1],active:i===0}))};
R.content=function(){
  const F={tab:'menu'};const LBL={menu:'Menu',blogs:'Blogs',links:'Linkpartners',videos:'Media / video’s',langs:'Meertaligheid'};
  function draw(){const d=db();if(!d.content){d.content=JSON.parse(JSON.stringify(CONTENT_SEED));save(d);}const C=d.content;
    main().innerHTML=head('Content & menu','Hoofdmenu, blogs, linkpartners, video’s en talen (zoals in het huidige admin). Concept: wijzigingen worden opgeslagen maar de statische pagina’s worden niet herbouwd.',`<button class="pdx-btn pd" id="cAdd"><i class="fa fa-plus"></i> ${esc(LBL[F.tab])} toevoegen</button>`)+
    tabsH(Object.keys(LBL).map(k=>[k,LBL[k],C[k].length]),F.tab)+
    `<div class="pdx-card"><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Titel</th><th>${F.tab==='langs'?'Code':'Link'}</th><th>Actief</th><th></th></tr></thead><tbody>${C[F.tab].map(x=>`<tr><td><b>${esc(x.t)}</b></td><td class="pdx-xs">${esc(x.url)}</td><td><label class="pdx-switch"><input type="checkbox" data-ca="${x.id}" ${x.active?'checked':''}><span></span></label></td><td style="text-align:right"><button class="pdx-btn sm" data-ce="${x.id}"><i class="fa fa-pen"></i></button> <button class="pdx-btn sm red" data-cx="${x.id}"><i class="fa fa-trash"></i></button></td></tr>`).join('')||'<tr><td colspan="4" class="pdx-muted">Leeg.</td></tr>'}</tbody></table></div></div>
    ${F.tab==='langs'?'<p class="pdx-xs pdx-muted" style="margin-top:8px">V2 is nu alleen Nederlands. Andere talen = Gap-analyse (vertaalbestanden + hreflang).</p>':''}`;
    bindTabs(F,draw);
    const mut=fn=>{const d2=db();fn(d2.content[F.tab]);save(d2);draw();};
    $$('[data-ca]').forEach(c=>c.onchange=()=>mut(L=>{L.find(x=>x.id===c.dataset.ca).active=c.checked;}));
    $$('[data-cx]').forEach(b=>b.onclick=()=>{if(confirm('Verwijderen?'))mut(L=>L.splice(L.findIndex(x=>x.id===b.dataset.cx),1));audit('content-delete',F.tab,'');});
    const form=x=>modal(x?'Bewerken':'Toevoegen',`<label class="pdx-lbl">Titel</label><input class="pdx-in" id="xT" value="${esc(x?x.t:'')}"><label class="pdx-lbl" style="margin-top:8px">${F.tab==='langs'?'Taalcode':'Link'}</label><input class="pdx-in" id="xU" value="${esc(x?x.url:'')}">`,m=>{const t=m.querySelector('#xT').value.trim(),u=m.querySelector('#xU').value.trim();if(!t){toast('Titel verplicht');return false;}
      mut(L=>{let y=x&&L.find(z=>z.id===x.id);if(!y){y={id:P.uid('c'),active:true};L.push(y);}y.t=t;y.url=u;});audit('content-save',F.tab,t);});
    $('#cAdd').onclick=()=>form(null);
    $$('[data-ce]').forEach(b=>b.onclick=()=>form(db().content[F.tab].find(x=>x.id===b.dataset.ce)));
  }
  draw();
};

/* ================= GEBRUIKER: uitbreiding ================= */
const baseUser=R.gebruiker;
R.gebruiker=function(){baseUser();const d=db();const u=d.users.find(x=>x.id===qs('id'));if(!u)return;
  const m=main();const cards=[...m.querySelectorAll('.pdx-card')];
  const find=t=>cards.find(c=>(c.querySelector('.pdx-card-h')||{}).textContent&&c.querySelector('.pdx-card-h').textContent.trim().startsWith(t));
  const ids={Profiel:'tab-overzicht','Credits':'tab-transacties','Gekoppelde':'tab-posts','E-mailhistorie':'tab-historie'};
  Object.entries(ids).forEach(([t,id])=>{const c=find(t);if(c)c.id=id;});
  const hist=d.audit.filter(a=>a.target===u.username||a.actor===u.username).slice(0,25);
  const posts=d.reviews.filter(r=>r.by===u.username);
  const extra=document.createElement('div');extra.className='pdx-grid pdx-g2';
  extra.innerHTML=`<div class="pdx-card" id="tab-ban"><div class="pdx-card-h">Niveau, bonus &amp; profielmedia</div><div class="pdx-card-b pdx-f two">
     <div><label class="pdx-lbl">Niveau (1–5)</label><select class="pdx-in" id="uLvl">${[1,2,3,4,5].map(n=>`<option ${+(u.level||1)===n?'selected':''}>${n}</option>`).join('')}</select><span class="pdx-xs pdx-muted">1 = nieuw · 3 = vertrouwd · 5 = beheer</span></div>
     <div><label class="pdx-lbl">Accounttype</label><select class="pdx-in" id="uTp">${opt([['adverteerder','Adverteerder'],['klant','Klant'],['bedrijf','Bedrijf']],u.role)}</select></div>
     <div class="full pdx-small">Wallet: <b>${u.credits}</b> credits + <b>${u.bonus||0}</b> bonus = <b>${u.credits+(u.bonus||0)}</b> totaal <button class="pdx-btn sm" id="uBon" type="button">Bonus aanpassen</button></div>
     <div class="full pdx-row"><button class="pdx-btn sm" type="button" id="uAv"><i class="fa fa-user"></i> Avatar resetten</button><button class="pdx-btn sm" type="button" id="uCv"><i class="fa fa-image"></i> Cover resetten</button><button class="pdx-btn sm" type="button" id="uWarn"><i class="fa fa-triangle-exclamation"></i> Waarschuwing sturen</button>${u.status!=='verwijderd'?'<button class="pdx-btn sm red" type="button" id="uDel"><i class="fa fa-trash"></i> Account verwijderen</button>':'<button class="pdx-btn sm green" type="button" id="uRes">Account herstellen</button>'}</div>
     <div class="full"><button class="pdx-btn pd sm" type="button" id="uSave">Niveau &amp; type opslaan</button></div></div></div>
   <div class="pdx-card"><div class="pdx-card-h">Historie (auditlog) &amp; posts</div><div class="pdx-card-b pdx-small" style="max-height:260px;overflow:auto">${hist.map(a=>`<div style="padding:3px 0;border-bottom:1px solid #eef1f7"><span class="adm-chip">${esc(a.action)}</span> ${esc(a.detail||'')} <span class="pdx-xs pdx-muted">— ${esc(a.actor)}, ${fmtDT(a.at)}</span></div>`).join('')||'<span class="pdx-muted">Geen historie.</span>'}
     <div style="margin-top:8px"><b>Reviews geschreven (${posts.length})</b>${posts.map(r=>`<div class="pdx-xs">${'★'.repeat(r.stars)} ${esc(r.text)}</div>`).join('')}</div></div></div>`;
  const anchor=m.querySelector('.pdx-grid');if(anchor)anchor.after(extra);
  const bar=document.createElement('div');bar.className='adm-tabs';bar.innerHTML=[['tab-overzicht','Overzicht'],['tab-transacties','Transacties'],['tab-ban','Ban / niveau'],['tab-historie','Historie'],['tab-posts','Posts']].map(t=>`<a href="#${t[0]}">${t[1]}</a>`).join('');
  const h=m.querySelector('.pdx-between');if(h)h.after(bar);
  bar.querySelectorAll('a').forEach(a=>a.onclick=e=>{e.preventDefault();const t=document.getElementById(a.getAttribute('href').slice(1));if(t)t.scrollIntoView({behavior:'smooth',block:'start'});});
  const up=(fn,act,dt)=>{const d2=db();const x=d2.users.find(y=>y.id===u.id);fn(x,d2);save(d2);audit(act,x.username,dt||'');R.gebruiker();};
  $('#uSave').onclick=()=>up(x=>{x.level=+$('#uLvl').value;if(me.role==='admin'||!['admin','moderator'].includes(x.role))x.role=$('#uTp').value;},'user-level','niveau '+$('#uLvl').value+' · '+$('#uTp').value);
  $('#uBon').onclick=()=>modal('Bonuscredits',`<label class="pdx-lbl">Bonus (negatief = afschrijven)</label><input class="pdx-in" type="number" id="bn" value="50"><label class="pdx-lbl" style="margin-top:8px">Reden</label><input class="pdx-in" id="br" value="Bonus (handmatig)">`,mm=>{const n=+mm.querySelector('#bn').value,r=mm.querySelector('#br').value;up(x=>{x.bonus=Math.max(0,(x.bonus||0)+n);x.ledger=x.ledger||[];x.ledger.unshift({at:P.now(),delta:0,t:'Bonus '+(n>0?'+':'')+n+': '+r,bal:x.credits});},'user-bonus',n+' · '+r);});
  $('#uAv').onclick=()=>up(x=>{x.avatar='';},'user-reset-avatar','');
  $('#uCv').onclick=()=>up(x=>{x.cover='';},'user-reset-cover','');
  $('#uWarn').onclick=()=>modal('Waarschuwing sturen',`<label class="pdx-lbl">Bericht</label><textarea class="pdx-in" id="wt">Je advertentie is gemeld. Pas je advertentie aan volgens de huisregels, anders wordt je account geschorst.</textarea>`,mm=>{const t=mm.querySelector('#wt').value;up((x,d2)=>{x.notes=x.notes||[];x.notes.unshift({at:P.now(),by:me.username,t:'Waarschuwing: '+t});d2.mail.log.unshift({id:P.uid('m'),at:P.now(),to:x.email,userId:x.id,tpl:'waarschuwing',subject:'Waarschuwing van Paydates',status:'gesimuleerd'});},'user-warn',t);toast('Waarschuwing gesimuleerd (niet verzonden)');},'Versturen');
  const ud=$('#uDel');if(ud)ud.onclick=()=>{if(u.id===me.id)return toast('Niet op jezelf');if(!confirm('Account soft-verwijderen? Advertenties gaan naar Verwijderd.'))return;up((x,d2)=>{x.prevStatus=x.status;x.status='verwijderd';x.deletedAt=P.now();d2.ads.filter(a=>a.owner===x.id&&a.status!=='verwijderd').forEach(a=>{a.prevStatus=a.status;a.status='verwijderd';a.deletedAt=P.now();a.deletedBy=me.username;});},'user-delete','soft delete');};
  const ur=$('#uRes');if(ur)ur.onclick=()=>up(x=>{x.status=x.prevStatus&&x.prevStatus!=='verwijderd'?x.prevStatus:'actief';},'user-restore','');
};

/* ================= BETALINGEN: agency, omzetmodel, orders ================= */
const basePay=R.betalingen;
R.betalingen=function(){basePay();
  function extra(){const d=db();const p=d.pay;const r=p.rates;const M=p.model;const tot=M.rows.reduce((s,x)=>s+x[2]*x[3],0);
    const big=M.rows.filter(x=>/^(agency|club|banner|sponsor)/.test(x[0])).reduce((s,x)=>s+x[2]*x[3],0);
    const orders=d.users.flatMap(u=>(u.ledger||[]).filter(l=>l.delta>0||/kocht|bundel|aankoop|betaal/i.test(l.t)).map(l=>({u,l})));
    const box=document.getElementById('pdxPayExtra')||document.createElement('div');box.id='pdxPayExtra';
    box.innerHTML=`<div class="pdx-card" style="margin-top:16px"><div class="pdx-card-h"><span><i class="fa fa-chart-line"></i> V2-verdienmodel · omzetscenario per maand</span><span class="pdx-xs pdx-muted">doel ${eur(M.target)}</span></div>
      <div class="pdx-card-b pdx-small"><b>Instap:</b> 1× omhoog via bellen/SMS ${eur(r.smsCallEur)} (geen saldo nodig) · <b>Groei:</b> 10× omhoog ${r.bump10} cr, auto-omhoog ${r.autoBumpDay} cr/dag, TOP ${r.topDay} cr/dag, VIP ${r.vip7} cr/7d · <b>Groot:</b> agencies, clubpakketten, banners, sponsorweken. Het oude “promoten voor 8 credits” is vervangen.</div>
      <div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Bron</th><th style="width:110px">Aantal / mnd</th><th style="width:110px">Prijs (€)</th><th style="text-align:right">Omzet</th></tr></thead><tbody>${M.rows.map((x,i)=>`<tr><td>${esc(x[1])}</td><td><input class="pdx-in" type="number" min="0" data-mc="${i}" value="${x[2]}"></td><td><input class="pdx-in" type="number" min="0" data-me="${i}" value="${x[3]}"></td><td style="text-align:right"><b>${eur(x[2]*x[3])}</b></td></tr>`).join('')}
      <tr><td><b>Totaal</b></td><td></td><td></td><td style="text-align:right;font-size:16px"><b style="color:${tot>=M.target?'#2b8a3e':'#c92a2a'}">${eur(tot)}</b><div class="pdx-xs pdx-muted">${Math.round(tot/M.target*100)}% van doel · ${tot?Math.round(big/tot*100):0}% uit grote adverteerders</div></td></tr></tbody></table></div></div>
     <div class="pdx-grid pdx-g2" style="margin-top:16px"><div class="pdx-card"><div class="pdx-card-h">Agency-accounts (per maand)</div><div class="pdx-card-b" style="display:grid;gap:10px">${p.agencyPlans.map((a,i)=>`<div class="pdx-between"><div><b>${esc(a.t)}</b><div class="pdx-xs pdx-muted">${a.features.map(esc).join(' · ')}</div></div><input class="pdx-in" style="width:90px" type="number" data-ag="${i}" value="${a.eur}"></div>`).join('')}</div></div>
      <div class="pdx-card"><div class="pdx-card-h"><span>Orders &amp; betalingen (demo)</span><span class="pdx-xs pdx-muted">${orders.length} orders · ${d.deleted.payments.length} verwijderd</span></div><div class="pdx-scroll" style="max-height:300px"><table class="pdx-table"><tbody>${orders.slice(0,30).map(o=>`<tr><td class="pdx-xs">${fmtDT(o.l.at)}</td><td>${esc(o.u.username)}</td><td class="pdx-small">${esc(o.l.t)}</td><td><b style="color:#2b8a3e">+${o.l.delta}</b></td><td><button class="pdx-btn sm red" data-pd="${o.u.id}|${o.l.at}" title="Verwijderen (naar verwijderde betalingen)"><i class="fa fa-trash"></i></button></td></tr>`).join('')||'<tr><td class="pdx-muted">Geen orders.</td></tr>'}
       ${d.deleted.payments.map(x=>`<tr style="opacity:.55"><td class="pdx-xs">${fmtDT(x.at)}</td><td>${esc(x.user)}</td><td class="pdx-small">${esc(x.t)} <span class="pdx-badge bad">verwijderd</span></td><td>${x.delta}</td><td><button class="pdx-btn sm" data-pr="${x.at}|${x.uid}">Herstel</button></td></tr>`).join('')}</tbody></table></div></div></div>`;
    main().appendChild(box);
    const upd=(fn,what)=>{const d2=db();fn(d2.pay,d2);save(d2);audit('pay-edit',what,'');extra();};
    $$('[data-mc]').forEach(x=>x.onchange=()=>upd(p=>p.model.rows[+x.dataset.mc][2]=Math.max(0,+x.value),'omzetmodel'));
    $$('[data-me]').forEach(x=>x.onchange=()=>upd(p=>p.model.rows[+x.dataset.me][3]=Math.max(0,+x.value),'omzetmodel'));
    $$('[data-ag]').forEach(x=>x.onchange=()=>upd(p=>p.agencyPlans[+x.dataset.ag].eur=Math.max(0,+x.value),'agency'));
    $$('[data-pd]').forEach(b=>b.onclick=()=>{const [uid,at]=b.dataset.pd.split('|');upd((p,d2)=>{const u=d2.users.find(y=>y.id===uid);const i=u.ledger.findIndex(l=>l.at===at);const [l]=u.ledger.splice(i,1);d2.deleted.payments.unshift(Object.assign({uid,user:u.username},l));},'betaling-verwijderd');});
    $$('[data-pr]').forEach(b=>b.onclick=()=>{const [at,uid]=b.dataset.pr.split('|');upd((p,d2)=>{const i=d2.deleted.payments.findIndex(x=>x.at===at&&x.uid===uid);const [x]=d2.deleted.payments.splice(i,1);const u=d2.users.find(y=>y.id===uid);if(u){u.ledger=u.ledger||[];u.ledger.unshift({at:x.at,delta:x.delta,t:x.t,bal:x.bal});u.ledger.sort((a,b)=>b.at<a.at?-1:1);}},'betaling-hersteld');});
  }
  extra();
  /* basis-draw() vervangt main(); daarna opnieuw toevoegen */
  new MutationObserver(()=>{if(!document.getElementById('pdxPayExtra'))extra();}).observe(main(),{childList:true});
};
})();
