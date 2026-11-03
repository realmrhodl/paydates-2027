/* Paydates V2 admin — advertenties, KYC, claims, polls (concept) */
(function(){
'use strict';
const A=window.PDXA; if(!A)return;
const {P,$,$$,qs,me,modal,dl,csv,audit,uById,roleB,stB,kycB,adB,main,head,kpi,R}=A; const {db,save,esc,fmtD,fmtDT,eur,toast}=P;

/* ---------- advertenties / moderatie ---------- */
R.advertenties=function(){
  const F={tab:qs('tab')||'wacht',q:'',owner:qs('owner')||''};
  const tabs=[['wacht','Wacht op moderatie'],['live','Live'],['gepauzeerd','Gepauzeerd'],['afgekeurd','Afgekeurd'],['verlopen','Verlopen'],['all','Alles']];
  function draw(){const d=db();const q=F.q.toLowerCase();
    const L=d.ads.filter(a=>(F.tab==='all'||a.status===F.tab)&&(!F.owner||a.owner===F.owner)&&(!q||[a.title,a.city,a.type].join(' ').toLowerCase().includes(q)));
    main().innerHTML=head('Advertenties','Nieuwe en gewijzigde advertenties gaan altijd eerst langs moderatie (instelling “Moderatie verplicht”).',F.owner?`<a class="pdx-btn" href="advertenties.html?tab=${F.tab}">Filter eigenaar wissen</a>`:'')+
    `<div class="adm-tabs">${tabs.map(t=>`<a href="#" data-t="${t[0]}" class="${F.tab===t[0]?'on':''}">${t[1]} <span class="pdx-xs">(${t[0]==='all'?d.ads.length:d.ads.filter(a=>a.status===t[0]).length})</span></a>`).join('')}</div>
    <div class="pdx-card"><div class="pdx-card-h"><input class="pdx-in" style="max-width:320px" id="aq" placeholder="Zoek titel, stad, type…" value="${esc(F.q)}"><span class="pdx-xs pdx-muted">${L.length} advertenties</span></div>
    <div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Advertentie</th><th>Eigenaar</th><th>Status</th><th>Boosts</th><th>Loopt tot</th><th>Stats</th><th style="text-align:right">Acties</th></tr></thead><tbody>${L.slice(0,150).map(a=>{const u=uById(a.owner)||{};return `<tr><td><b>${esc(a.title)}</b><div class="pdx-xs pdx-muted">${esc(a.type)} · ${esc(a.city)} · ${fmtD(a.created)}</div>${a.modNote?`<div class="pdx-xs" style="color:#c92a2a">${esc(a.modNote)}</div>`:''}</td>
      <td class="pdx-small"><a href="gebruiker.html?id=${u.id}" style="color:#7351c0">${esc(u.username||'?')}</a> ${kycB(u.kyc||'geen')}</td><td>${adB(a.status)}</td>
      <td class="pdx-xs">${a.vip?'<span class="pdx-badge pd">VIP</span> ':''}${a.top?'<span class="pdx-badge warn">TOP</span> ':''}${a.bumps?a.bumps+'× bump':''}</td><td class="pdx-xs">${fmtD(a.expires)}</td><td class="pdx-xs">${a.views||0} views · ${a.clicks||0} kliks</td>
      <td style="text-align:right;white-space:nowrap">${a.status!=='live'?`<button class="pdx-btn sm green" data-ok="${a.id}">Goedkeuren</button> `:''}${a.status!=='afgekeurd'?`<button class="pdx-btn sm red" data-no="${a.id}">Afkeuren</button> `:''}${a.status==='live'?`<button class="pdx-btn sm" data-pause="${a.id}">Pauzeren</button> `:''}${a.listingId?`<a class="pdx-btn sm" target="_blank" href="../advertentie.html?id=${a.listingId}"><i class="fa fa-eye"></i></a>`:''}</td></tr>`}).join('')||'<tr><td colspan="7" class="pdx-muted" style="text-align:center;padding:24px">Niets in deze lijst. 🎉</td></tr>'}</tbody></table></div></div>`;
    $$('[data-t]').forEach(t=>t.onclick=e=>{e.preventDefault();F.tab=t.dataset.t;draw();});
    $('#aq').oninput=e=>{F.q=e.target.value;const p=e.target.selectionStart;draw();const n=$('#aq');n.focus();n.setSelectionRange(p,p);};
    $$('[data-ok]').forEach(b=>b.onclick=()=>{const d2=db();const a=d2.ads.find(x=>x.id===b.dataset.ok);const u=d2.users.find(x=>x.id===a.owner);
      if(u&&u.kyc!=='goedgekeurd'&&!confirm('Eigenaar is nog niet geverifieerd (KYC: '+u.kyc+'). Toch goedkeuren?'))return;
      a.status='live';a.mod='goedgekeurd';a.modNote='';if(!a.expires||new Date(a.expires)<new Date())a.expires=new Date(Date.now()+d2.settings.adDays*864e5).toISOString();save(d2);
      P.mailSim(u,'ad_live',{advertentie:a.title});audit('ad-approve',a.title,'');toast('Goedgekeurd · mail gesimuleerd');draw();});
    $$('[data-no]').forEach(b=>b.onclick=()=>modal('Advertentie afkeuren',`<label class="pdx-lbl">Reden (gaat naar adverteerder)</label><select class="pdx-in" id="rr"><option>Foto’s niet echt / niet eigen</option><option>Minderjarig ogend of leeftijd onduidelijk</option><option>Verboden diensten of teksten</option><option>Contactgegevens in afbeelding</option><option>Dubbele advertentie</option><option>Overig</option></select><label class="pdx-lbl" style="margin-top:8px">Toelichting</label><textarea class="pdx-in" id="rt"></textarea>`,m=>{
      const note=m.querySelector('#rr').value+(m.querySelector('#rt').value?': '+m.querySelector('#rt').value:'');const d2=db();const a=d2.ads.find(x=>x.id===b.dataset.no);a.status='afgekeurd';a.mod='afgekeurd';a.modNote=note;save(d2);
      P.mailSim(d2.users.find(x=>x.id===a.owner),'ad_rej',{advertentie:a.title,notitie:note});audit('ad-reject',a.title,note);draw();},'Afkeuren'));
    $$('[data-pause]').forEach(b=>b.onclick=()=>{const d2=db();const a=d2.ads.find(x=>x.id===b.dataset.pause);a.status='gepauzeerd';save(d2);audit('ad-pause',a.title,'door moderatie');draw();});
  }
  draw();
};

/* ---------- KYC-wachtrij ---------- */
R.kyc=function(){
  const F={tab:'ingediend'};
  function draw(){const d=db();const L=d.kyc.filter(k=>F.tab==='all'||k.status===F.tab);
    main().innerHTML=head('KYC-wachtrij','Leeftijd- en identiteitsverificatie. <b>Concept:</b> er is geen KYC-provider gekoppeld en er worden geen echte documenten opgeslagen; stappen zijn gesimuleerd.')+
    `<div class="pdx-demo" style="margin-bottom:14px"><i class="fa fa-shield-halved"></i><div>In productie: documenten via een gecertificeerde provider (bijv. iDIN/Onfido/Veriff-achtig), versleuteld, bewaartermijn &lt; 30 dagen na besluit, alleen toegankelijk voor rol moderator/admin. Zie Gap-analyse P0.</div></div>
    <div class="adm-tabs">${[['ingediend','Te beoordelen'],['goedgekeurd','Goedgekeurd'],['afgewezen','Afgewezen'],['all','Alles']].map(t=>`<a href="#" data-t="${t[0]}" class="${F.tab===t[0]?'on':''}">${t[1]} (${t[0]==='all'?d.kyc.length:d.kyc.filter(k=>k.status===t[0]).length})</a>`).join('')}</div>
    <div class="pdx-grid pdx-g2">${L.map(k=>{const u=d.users.find(x=>x.id===k.userId)||{};return `<div class="pdx-card"><div class="pdx-card-h"><span><a href="gebruiker.html?id=${u.id}" style="color:#7351c0">${esc(u.username)}</a> ${roleB(u.role||'?')}</span>${kycB(k.status)}</div><div class="pdx-card-b pdx-small" style="display:grid;gap:8px">
      <div>Ingediend ${fmtDT(k.submitted)}${k.reviewer?` · beoordeeld door ${esc(k.reviewer)} ${fmtDT(k.reviewed)}`:''}</div>
      <div>${Object.entries(k.steps||{}).filter(([s])=>s!=='reg'||u.role==='bedrijf').map(([s,v])=>`<span class="adm-chip ${v?'y':'n'}">${{id:'ID-document',selfie:'Selfie + code',age:'Leeftijd ≥ 21',reg:'KvK / vergunning'}[s]||s}</span>`).join(' ')}</div>
      <div class="pdx-row"><div class="pdx-ph">ID-document<br><small>(demo: geen bestand)</small></div><div class="pdx-ph">Selfie met code ${esc(k.code||'PD-'+String(k.id).slice(-4).toUpperCase())}<br><small>(demo)</small></div></div>
      ${k.note?`<div>Notitie: <i>${esc(k.note)}</i></div>`:''}
      <input class="pdx-in" placeholder="Notitie (verplicht bij afwijzen)" data-n="${k.userId}">
      <div class="pdx-row"><button class="pdx-btn sm green" data-a="${k.userId}">Goedkeuren</button><button class="pdx-btn sm red" data-r="${k.userId}">Afwijzen</button><button class="pdx-btn sm" data-m="${k.userId}">Opnieuw opvragen</button></div></div></div>`}).join('')||'<div class="pdx-card pdx-card-b pdx-muted">Geen aanvragen in deze lijst.</div>'}</div>`;
    $$('[data-t]').forEach(t=>t.onclick=e=>{e.preventDefault();F.tab=t.dataset.t;draw();});
    const note=id=>($(`[data-n="${id}"]`)||{}).value||'';
    $$('[data-a]').forEach(b=>b.onclick=()=>A.setKyc(b.dataset.a,'goedgekeurd',note(b.dataset.a),draw));
    $$('[data-r]').forEach(b=>b.onclick=()=>A.setKyc(b.dataset.r,'afgewezen',note(b.dataset.r),draw));
    $$('[data-m]').forEach(b=>b.onclick=()=>{const n=note(b.dataset.m)||'Graag opnieuw indienen: document niet leesbaar.';A.setKyc(b.dataset.m,'afgewezen',n,draw);});
  }
  draw();
};

/* seksclubs-beheer: zie pages-clubs.js */

/* ---------- claims ---------- */
R.claims=function(){
  function draw(){const d=db();
    main().innerHTML=head('Bedrijfsclaims','Clubs/privéhuizen die hun profiel claimen via “Claim dit profiel”. Controleer KvK, vergunning en een terugbelactie naar het publieke nummer vóór koppeling.')+
    `<div class="pdx-card"><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Profiel</th><th>Aanvrager</th><th>KvK</th><th>Ontvangen</th><th>Status</th><th>Notitie</th><th></th></tr></thead><tbody>${d.claims.map(c=>`<tr><td><b>${esc(c.club)}</b>${c.clubRef?`<div class="pdx-xs"><a href="../${esc(c.clubRef)}" target="_blank" style="color:#7351c0">${esc(c.clubRef)}</a></div>`:''}</td><td class="pdx-small">${esc(c.name)}<div class="pdx-xs pdx-muted">${esc(c.email)} ${esc(c.phone||'')} · ${esc(c.role||'')}</div></td><td class="pdx-xs">${esc(c.kvk||'—')}</td><td class="pdx-xs">${fmtDT(c.at)}</td><td><span class="pdx-badge ${c.status==='goedgekeurd'?'ok':c.status==='afgewezen'?'bad':'warn'}">${esc(c.status)}</span></td><td class="pdx-xs">${esc(c.note||'')}</td>
      <td style="white-space:nowrap">${c.status==='nieuw'||c.status==='in behandeling'?`<button class="pdx-btn sm" data-h="${c.id}">In behandeling</button> <button class="pdx-btn sm green" data-a="${c.id}">Goedkeuren</button> <button class="pdx-btn sm red" data-r="${c.id}">Afwijzen</button>`:''}</td></tr>`).join('')||'<tr><td colspan="7" class="pdx-muted">Geen claims.</td></tr>'}</tbody></table></div></div>`;
    const set=(id,s,needNote)=>{const n=needNote?prompt('Notitie / reden:')||'':'';if(needNote&&!n)return;const d2=db();const c=d2.claims.find(x=>x.id===id);c.status=s;if(n)c.note=n;c.by=me.username;
      if(s==='goedgekeurd'){let u=d2.users.find(x=>x.email.toLowerCase()===String(c.email).toLowerCase());if(u&&u.role==='klant')u.role='bedrijf';if(u){u.company=u.company||{name:c.club,kvk:c.kvk||'',plan:'basic'};u.company.claimed=c.clubRef;}
        if(window.PDXClubs){const v=PDXClubs.all().find(x=>PDXClubs.url(x)===c.clubRef||x.id===c.clubId);if(v)PDXClubs.update(v.id,{claim:'geclaimd',claimManual:false,owner:u?u.id:null});}c.note=(c.note?c.note+' · ':'')+(u?'Gekoppeld aan '+u.username:'Geen account met dit e-mailadres: uitnodiging nodig');}
      save(d2);audit('claim-'+s,c.club,n);draw();};
    $$('[data-h]').forEach(b=>b.onclick=()=>set(b.dataset.h,'in behandeling'));$$('[data-a]').forEach(b=>b.onclick=()=>set(b.dataset.a,'goedgekeurd'));$$('[data-r]').forEach(b=>b.onclick=()=>set(b.dataset.r,'afgewezen',true));
  }
  draw();
};

/* ---------- polls (schaalt naar 100+: zoeken, filters, sortering, paginering) ---------- */
R.polls=function(){
  const PER=20; const F={q:'',status:'',cat:'',sort:'nieuw',page:0};
  const tot=p=>p.options.reduce((s,o)=>s+(+o[1]||0),0);
  const pT=P.pTime||(s=>Date.parse(s||'')||0);
  const day=s=>{if(!s)return '';const d=new Date(s);if(isNaN(d))return '';const z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate());};
  const stBadge=s=>`<span class="pdx-badge ${s==='live'?'ok':s==='concept'?'warn':''}">${s==='live'?'live':s==='concept'?'concept':'archief'}</span>`;
  const optsTxt=p=>p.options.map(o=>o[0]+' | '+(+o[1]||0)).join('\n');
  const parseOpts=t=>t.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const m=l.match(/^(.*?)\s*\|\s*(\d+)\s*$/);return m?[m[1].trim(),+m[2]]:[l,0];}).filter(o=>o[0]);
  const toFile=p=>({id:p.id,cat:p.cat||'',status:p.status,start:day(p.start)||null,end:day(p.end)||null,q:p.q,options:p.options.map(o=>[o[0],+o[1]||0]),...(p.desc?{desc:p.desc}:{})});
  function golive(d2,id){const p=d2.polls.find(x=>x.id===id);if(!p)return;d2.polls.forEach(x=>{if(x.status==='live'&&x.id!==id){x.status='archief';x.end=P.now();}});p.status='live';p.end=null;if(!p.start||pT(p.start)>Date.now())p.start=P.now();}
  function shell(){const d=db();const cats=[...new Set(d.polls.map(p=>p.cat).filter(Boolean))].sort();
    const n={all:d.polls.length,live:d.polls.filter(p=>p.status==='live').length,archief:d.polls.filter(p=>p.status==='archief').length,concept:d.polls.filter(p=>p.status==='concept').length};
    main().innerHTML=head('Community polls',`Bron: <code>assets/polls-data.js</code> + wijzigingen in deze browser. Eén live poll op de homepage; de rest in het <a href="../polls.html" target="_blank" style="color:#7351c0">archief</a>. Stemmen: 1× per poll per browser.`,
      `<label class="pdx-opt"><input type="checkbox" id="onHome" ${d.flags.pollsOnHome!==false?'checked':''}> Toon poll op homepage</label><button class="pdx-btn" id="exp"><i class="fa fa-file-export"></i> Export</button><button class="pdx-btn" id="imp"><i class="fa fa-file-import"></i> Import</button><button class="pdx-btn pd" id="nw"><i class="fa fa-plus"></i> Nieuwe poll</button>`)+
    `<div class="pdx-grid pdx-g4" style="margin:12px 0">${kpi('Totaal',n.all)}${kpi('Live',n.live,n.live?'':'geen live poll!')}${kpi('Archief',n.archief)}${kpi('Concept',n.concept)}</div>
     <div class="pdx-card pdx-card-b pdx-row"><input class="pdx-in" style="flex:2;min-width:200px" id="fq" placeholder="Zoek op vraag, antwoord, id…">
      <select class="pdx-in" style="flex:1;min-width:120px" id="fst"><option value="">Alle statussen</option><option value="live">Live</option><option value="archief">Archief</option><option value="concept">Concept</option></select>
      <select class="pdx-in" style="flex:1;min-width:130px" id="fcat"><option value="">Alle categorieën</option>${cats.map(c=>`<option>${esc(c)}</option>`).join('')}</select>
      <select class="pdx-in" style="flex:1;min-width:130px" id="fso"><option value="nieuw">Nieuwste eerst</option><option value="oud">Oudste eerst</option><option value="stemmen">Meeste stemmen</option><option value="az">Vraag A–Z</option></select></div>
     <div class="pdx-card"><div class="pdx-card-h"><span id="cnt"></span><span class="pdx-xs pdx-muted">${PER} per pagina</span></div>
     <div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Vraag</th><th>Categorie</th><th>Status</th><th>Periode</th><th>Stemmen</th><th>Winnaar</th><th></th></tr></thead><tbody id="tb"></tbody></table></div><div class="adm-pager" id="pg"></div></div>`;
    $('#fq').value=F.q;$('#fst').value=F.status;$('#fcat').value=F.cat;$('#fso').value=F.sort;
    $('#onHome').onchange=e=>{const d2=db();d2.flags.pollsOnHome=e.target.checked;save(d2);audit('flag','pollsOnHome',String(e.target.checked));toast('Opgeslagen');};
    $('#fq').oninput=e=>{F.q=e.target.value;F.page=0;draw();};
    [['fst','status'],['fcat','cat'],['fso','sort']].forEach(([id,k])=>$('#'+id).onchange=e=>{F[k]=e.target.value;F.page=0;draw();});
    $('#nw').onclick=()=>edit(null);
    $('#exp').onclick=()=>{const d2=db();const L=d2.polls.slice().sort((a,b)=>(b.status==='live')-(a.status==='live')||pT(b.start)-pT(a.start)).map(toFile);
      const js='/* Paydates V2 — export uit admin ('+new Date().toLocaleString('nl-NL')+'). Vervang de lijst in assets/polls-data.js hiermee. */\nwindow.PD_POLLS = [\n'+L.map(p=>'  '+JSON.stringify(p)).join(',\n')+'\n];\n';
      dl('polls-data.js',js,'text/javascript');audit('poll-export',L.length+' polls','');};
    $('#imp').onclick=()=>modal('Polls importeren','<p class="pdx-small pdx-muted" style="margin:0 0 8px">Plak een JSON-array met polls (zelfde velden als <code>assets/polls-data.js</code>: id, q, cat, status, start, end, options). Bestaande id’s worden bijgewerkt, nieuwe toegevoegd. Stemaantallen uit de import overschrijven de lokale.</p><textarea class="pdx-in" id="ij" style="min-height:220px;font-family:monospace;font-size:12px" placeholder=\'[{"id":"p_2026_12","q":"…","cat":"Daten","status":"archief","start":"2026-12-01","end":"2026-12-08","options":[["Ja",0],["Nee",0]]}]\'></textarea>',m=>{
      let arr;try{let t=m.querySelector('#ij').value.trim().replace(/^[^\[]*=\s*/,'').replace(/;\s*$/,'');arr=JSON.parse(t);}catch(e){toast('Geen geldige JSON');return false;}
      if(!Array.isArray(arr))arr=[arr];const d2=db();let add=0,upd=0,bad=0;
      arr.forEach(x=>{if(!x||!x.id||!x.q||!Array.isArray(x.options)||x.options.length<2){bad++;return;}const o={id:String(x.id),q:String(x.q),cat:x.cat||'',desc:x.desc||'',status:['live','archief','concept'].includes(x.status)?x.status:'archief',start:/^\d{4}-\d{2}-\d{2}$/.test(x.start||'')?x.start+'T12:00:00':(x.start||P.now()),end:/^\d{4}-\d{2}-\d{2}$/.test(x.end||'')?x.end+'T12:00:00':(x.end||null),options:x.options.map(o=>[String(o[0]),+o[1]||0])};
        const i=d2.polls.findIndex(p=>p.id===o.id);if(i>=0){d2.polls[i]=Object.assign(d2.polls[i],o);upd++;}else{d2.polls.push(o);add++;}d2.pollsRemoved=(d2.pollsRemoved||[]).filter(id=>id!==o.id);});
      if(P.normPolls)P.normPolls(d2);save(d2);audit('poll-import',add+' nieuw, '+upd+' bijgewerkt','');toast(`${add} toegevoegd · ${upd} bijgewerkt${bad?' · '+bad+' ongeldig':''}`);shell();draw();},'Importeren');
  }
  function list(){const q=F.q.trim().toLowerCase();let L=db().polls.filter(p=>(!F.status||p.status===F.status)&&(!F.cat||p.cat===F.cat)&&(!q||[p.id,p.q,p.cat,p.options.map(o=>o[0]).join(' ')].join(' ').toLowerCase().includes(q)));
    L.sort(F.sort==='oud'?(a,b)=>pT(a.start)-pT(b.start):F.sort==='stemmen'?(a,b)=>tot(b)-tot(a):F.sort==='az'?(a,b)=>a.q.localeCompare(b.q,'nl'):(a,b)=>(b.status==='live')-(a.status==='live')||pT(b.start)-pT(a.start));return L;}
  function draw(){const L=list();const pages=Math.max(1,Math.ceil(L.length/PER));F.page=Math.min(F.page,pages-1);
    $('#cnt').textContent=L.length+' polls';
    $('#tb').innerHTML=L.slice(F.page*PER,F.page*PER+PER).map(p=>{const t=tot(p);const lead=p.options.reduce((a,o)=>o[1]>a[1]?o:a,['—',-1]);
      return `<tr><td><b>${esc(p.q)}</b><div class="pdx-xs pdx-muted">${esc(p.id)} · ${p.options.length} antwoorden${p.src==='bestand'?' · uit bestand':''}</div></td><td class="pdx-small">${esc(p.cat||'—')}</td><td>${stBadge(p.status)}</td>
      <td class="pdx-xs" style="white-space:nowrap">${fmtD(p.start)}<br>${p.end?fmtD(p.end):(p.status==='live'?'loopt':'—')}</td><td>${t.toLocaleString('nl-NL')}</td><td class="pdx-small">${t?esc(lead[0])+' <span class="pdx-muted">'+Math.round(lead[1]/t*100)+'%</span>':'—'}</td>
      <td><div class="pdx-row" style="flex-wrap:nowrap"><button class="pdx-btn sm" data-ed="${esc(p.id)}" title="Bewerken"><i class="fa fa-pen"></i></button>
      ${p.status==='live'?`<button class="pdx-btn sm" data-arch="${esc(p.id)}">Archiveren</button>`:`<button class="pdx-btn sm green" data-live="${esc(p.id)}">Live zetten</button>`}
      <button class="pdx-btn sm" data-dup="${esc(p.id)}" title="Dupliceren"><i class="fa fa-copy"></i></button><a class="pdx-btn sm" href="../polls.html#poll-${encodeURIComponent(p.id)}" target="_blank" title="Bekijk in archief"><i class="fa fa-arrow-up-right-from-square"></i></a><button class="pdx-btn sm red" data-del="${esc(p.id)}" title="Verwijderen"><i class="fa fa-trash"></i></button></div></td></tr>`}).join('')||'<tr><td colspan="7" class="pdx-muted">Geen polls gevonden.</td></tr>';
    $('#pg').innerHTML=`<button class="pdx-btn sm" ${F.page?'':'disabled'} id="pp">‹</button> Pagina ${F.page+1} / ${pages} <button class="pdx-btn sm" ${F.page<pages-1?'':'disabled'} id="pn">›</button>`;
    $('#pp').onclick=()=>{F.page--;draw()};$('#pn').onclick=()=>{F.page++;draw()};
    const mut=(id,fn,act)=>{const d2=db();const p=d2.polls.find(x=>x.id===id);if(!p)return;fn(d2,p);save(d2);audit(act,p.q,'');shell();draw();};
    $$('[data-ed]').forEach(b=>b.onclick=()=>edit(b.dataset.ed));
    $$('[data-live]').forEach(b=>b.onclick=()=>{const cur=db().polls.find(x=>x.status==='live');if(cur&&!confirm(`“${cur.q}” gaat naar het archief. Doorgaan?`))return;mut(b.dataset.live,(d2,p)=>golive(d2,p.id),'poll-live');toast('Live gezet');});
    $$('[data-arch]').forEach(b=>b.onclick=()=>mut(b.dataset.arch,(d2,p)=>{p.status='archief';p.end=P.now();},'poll-archive'));
    $$('[data-dup]').forEach(b=>b.onclick=()=>{const d2=db();const p=d2.polls.find(x=>x.id===b.dataset.dup);if(!p)return;const c={id:P.uid('p'),q:p.q+' (kopie)',cat:p.cat||'',desc:p.desc||'',status:'concept',start:P.now(),end:null,options:p.options.map(o=>[o[0],0])};d2.polls.push(c);save(d2);audit('poll-dup',c.q,'');shell();draw();edit(c.id);});
    $$('[data-del]').forEach(b=>b.onclick=()=>{if(!confirm('Poll definitief verwijderen? (ook uit het archief)'))return;mut(b.dataset.del,(d2,p)=>{d2.polls=d2.polls.filter(x=>x!==p);d2.pollsRemoved=[...new Set([...(d2.pollsRemoved||[]),p.id])];},'poll-delete');});
  }
  function edit(id){const d=db();const p=id?d.polls.find(x=>x.id===id):null;const cats=[...new Set(d.polls.map(x=>x.cat).filter(Boolean))].sort();
    const voted=p&&tot(p)>0;
    const mm=modal(p?'Poll bewerken':'Nieuwe poll',`<label class="pdx-lbl">Vraag</label><input class="pdx-in" id="pq" maxlength="140" value="${esc(p?p.q:'')}">
      <div class="pdx-grid pdx-g2" style="margin-top:8px"><div><label class="pdx-lbl">Categorie</label><input class="pdx-in" id="pc" list="pcl" value="${esc(p?p.cat||'':'')}" placeholder="bv. Daten"><datalist id="pcl">${cats.map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div>
      <div><label class="pdx-lbl">Status</label><select class="pdx-in" id="ps"><option value="concept">Concept (niet zichtbaar)</option><option value="live">Live (huidige live → archief)</option><option value="archief">Archief</option></select></div>
      <div><label class="pdx-lbl">Startdatum</label><input class="pdx-in" type="date" id="pst" value="${day(p?p.start:P.now())}"></div><div><label class="pdx-lbl">Einddatum (leeg = loopt)</label><input class="pdx-in" type="date" id="pen" value="${day(p&&p.end)}"></div></div>
      <label class="pdx-lbl" style="margin-top:8px">Antwoorden — één per regel, 2–8. Optioneel <code>| aantal</code> voor startaantal</label><textarea class="pdx-in" id="po" style="min-height:150px">${esc(p?optsTxt(p):'')}</textarea>
      ${voted?'<p class="pdx-xs" style="color:#b35c00;margin:6px 0 0"><i class="fa fa-triangle-exclamation"></i> Deze poll heeft al stemmen. Antwoorden hernoemen is ok; volgorde wijzigen verschuift bestaande “jouw stem”-markeringen.</p>':''}
      <label class="pdx-lbl" style="margin-top:8px">Toelichting (optioneel)</label><input class="pdx-in" id="pd" maxlength="200" value="${esc(p?p.desc||'':'')}">
      ${p?`<p class="pdx-xs pdx-muted" style="margin:8px 0 0">ID: <code>${esc(p.id)}</code></p>`:''}`,m=>{
      const g=s=>m.querySelector(s);const q=g('#pq').value.trim();const o=parseOpts(g('#po').value);
      if(!q||o.length<2||o.length>8){toast('Vraag + 2 tot 8 antwoorden');return false;}
      const st=g('#ps').value, sd=g('#pst').value, ed=g('#pen').value;
      if(sd&&ed&&ed<sd){toast('Einddatum ligt vóór startdatum');return false;}
      const d2=db();let x=p?d2.polls.find(y=>y.id===p.id):null;
      if(!x){x={id:P.uid('p'),status:'concept'};d2.polls.push(x);}
      Object.assign(x,{q,cat:g('#pc').value.trim(),desc:g('#pd').value.trim(),options:o,start:sd?new Date(sd+'T12:00:00').toISOString():P.now(),end:ed?new Date(ed+'T12:00:00').toISOString():null,edited:P.now()});
      if(st==='live')golive(d2,x.id);else{if(x.status==='live'&&st==='archief'&&!x.end)x.end=P.now();x.status=st;}
      save(d2);audit(p?'poll-edit':'poll-new',q,st);toast(p?'Poll bijgewerkt':'Poll aangemaakt');shell();draw();},p?'Opslaan':'Aanmaken');
    mm.querySelector('#ps').value=p?p.status:'live';
  }
  shell();draw();
};
})();
