/* Paydates V2 admin — SEKSCLUBS-BEHEER (concept). Eén bron: assets/clubs-data.js + wijzigingen in localStorage (clubs-store.js).
   Wat hier op “gepubliceerd” staat, verschijnt direct op seksclubs.html, club.html?id=… en de provincie-filters (in deze browser).
   Import (CSV/JSON) is een secundaire actie; de research-inventaris staat onder “Research & bronnen”. */
(function(){
'use strict';
const A=window.PDXA; if(!A)return;
const {P,$,$$,qs,me,modal,dl,csv,audit,main,head,kpi,R}=A; const {db,esc,fmtD,fmtDT,toast}=P;
const K=window.PDXClubs;
const PROVS=['Drenthe','Flevoland','Friesland','Gelderland','Groningen','Limburg','Noord-Brabant','Noord-Holland','Overijssel','Utrecht','Zeeland','Zuid-Holland'];
const DAYS=['ma','di','wo','do','vr','za','zo'];
const pubB=s=>`<span class="pdx-badge ${s==='gepubliceerd'?'ok':s==='concept'?'warn':'bad'}">${esc(s)}</span>`;
const packB=p=>`<span class="pdx-badge ${p==='spotlight'?'gold':p==='premium'?'pd':''}">${esc((K.PACKS[p]||K.PACKS.basic).t)}</span>`;
const clB=c=>`<span class="pdx-badge ${c==='geclaimd'?'ok':c==='claim aangevraagd'?'warn':''}">${esc(c)}</span>`;
const canPublish=v=>v.demo?false:(v.research==='actief'||v.verified||v.checked2||db().flags.clubsPublishUnverified);
const whyNot=v=>v.demo?'Voorbeeldprofiel (fictief) — nooit publiceren als echte locatie.':'Niet gecontroleerd: research-status “'+v.research+'”. Vink eerst “Gecontroleerd (gebeld/KvK)” aan.';

R.seksclubs=function(){
  if(!K){main().innerHTML=head('Seksclubs-beheer','assets/clubs-store.js ontbreekt.');return;}
  const F={tab:location.hash.slice(1)||'alle',q:qs('q')||'',prov:'',type:'',pack:'',claim:'',hours:'',page:0,sort:'naam'};
  const sel=new Set();
  const TABS=[['alle','Alle'],['gepubliceerd','Gepubliceerd'],['concept','Concept'],['gearchiveerd','Gearchiveerd'],['parenclubs','Parenclubs'],['demo','Voorbeeldprofielen'],['research','Research & bronnen'],['stats','Statistieken']];
  function inTab(v,t){if(t==='demo')return v.demo;if(v.demo)return false;if(t==='parenclubs')return v.type==='Parenclub';if(t==='alle')return true;return v.pub===t;}
  function list(){const q=F.q.toLowerCase();let L=K.all().filter(v=>inTab(v,F.tab)&&(!q||[v.name,v.city,v.prov,v.addr,v.phone,v.web,(v.aliases||[]).join(' ')].join(' ').toLowerCase().includes(q))&&(!F.prov||v.prov===F.prov)&&(!F.type||v.type===F.type)&&(!F.pack||v.pack===F.pack)&&(!F.claim||K.claimOf(v)===F.claim)&&(!F.hours||(F.hours==='1'?!!v.hours:!v.hours)));
    if(F.sort==='naam')L.sort((a,b)=>a.name.localeCompare(b.name,'nl'));if(F.sort==='plaats')L.sort((a,b)=>(a.prov+a.city).localeCompare(b.prov+b.city,'nl'));if(F.sort==='pakket')L=K.sort(L);if(F.sort==='gewijzigd')L.sort((a,b)=>(b.upd||'').localeCompare(a.upd||''));return L;}
  function draw(){
    const all=K.all(), real=all.filter(v=>!v.demo), pub=real.filter(v=>v.pub==='gepubliceerd');
    const ov=K.overrides();
    let body='';
    if(F.tab==='research')body=research();
    else if(F.tab==='stats')body=stats();
    else{const L=list();const per=50;const pages=Math.max(1,Math.ceil(L.length/per));F.page=Math.min(F.page,pages-1);
      body=`${F.tab==='parenclubs'?'<div class="pdx-demo" style="margin-bottom:12px"><i class="fa fa-people-arrows"></i><div>Parenclubs staan op de site <b>apart</b> (eigen filter) en worden niet gemengd met seksclubs/privéhuizen.</div></div>':''}
      ${F.tab==='demo'?'<div class="pdx-demo" style="margin-bottom:12px"><i class="fa fa-flask"></i><div>Fictieve voorbeeldprofielen voor het ontwerp. Ze staan los van de echte locaties en kunnen niet gepubliceerd worden.</div></div>':''}
      <div class="pdx-card pdx-card-b pdx-row"><input class="pdx-in" style="flex:2;min-width:180px" id="cq" placeholder="Zoek naam, plaats, adres, telefoon…" value="${esc(F.q)}">
       <select class="pdx-in" style="flex:1" id="cprov"><option value="">Alle provincies</option>${PROVS.map(p=>`<option ${F.prov===p?'selected':''}>${p}</option>`).join('')}</select>
       <select class="pdx-in" style="flex:1" id="ctype"><option value="">Alle types</option>${K.TYPES.map(p=>`<option ${F.type===p?'selected':''}>${p}</option>`).join('')}</select>
       <select class="pdx-in" style="flex:1" id="cpack"><option value="">Alle pakketten</option>${Object.keys(K.PACKS).map(p=>`<option value="${p}" ${F.pack===p?'selected':''}>${K.PACKS[p].t}</option>`).join('')}</select>
       <select class="pdx-in" style="flex:1" id="cclaim"><option value="">Claim: alles</option>${K.CLAIMS.map(p=>`<option ${F.claim===p?'selected':''}>${p}</option>`).join('')}</select>
       <select class="pdx-in" style="flex:1" id="chours"><option value="">Tijden: alles</option><option value="1" ${F.hours==='1'?'selected':''}>Met openingstijden</option><option value="0" ${F.hours==='0'?'selected':''}>Zonder</option></select>
       <select class="pdx-in" style="flex:1" id="csort">${[['naam','Sorteer: naam'],['plaats','Sorteer: provincie/plaats'],['pakket','Sorteer: zoals op site'],['gewijzigd','Sorteer: laatst gewijzigd']].map(o=>`<option value="${o[0]}" ${F.sort===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></div>
      <div class="pdx-card"><div class="pdx-card-h"><span>${L.length} locaties <span class="pdx-xs pdx-muted" id="selN">· ${sel.size} geselecteerd</span></span><span class="pdx-row">
        <button class="pdx-btn sm green" data-bulk="gepubliceerd">Publiceren</button><button class="pdx-btn sm" data-bulk="concept">Naar concept</button><button class="pdx-btn sm red" data-bulk="gearchiveerd">Archiveren</button>
        <select class="pdx-in" style="width:auto;padding:4px 8px" id="bpack"><option value="">Pakket zetten…</option>${Object.keys(K.PACKS).map(p=>`<option value="${p}">${K.PACKS[p].t}</option>`).join('')}</select></span></div>
      <div class="pdx-scroll"><table class="pdx-table"><thead><tr><th><input type="checkbox" id="all"></th><th>Naam</th><th>Plaats</th><th>Type</th><th>Status</th><th>Pakket</th><th>Claim</th><th>Gegevens</th><th>Gewijzigd</th><th style="text-align:right">Acties</th></tr></thead><tbody>
      ${L.slice(F.page*per,F.page*per+per).map(v=>{const cl=K.claimOf(v);return `<tr data-id="${esc(v.id)}"><td><input type="checkbox" data-sel="${esc(v.id)}" ${sel.has(v.id)?'checked':''}></td>
        <td><a href="#" data-edit="${esc(v.id)}" style="color:#212529"><b>${esc(v.name)}</b></a>${v.verified||v.checked2?' <i class="fa fa-circle-check" style="color:#2f9e44" title="Gecontroleerd"></i>':''}${K.isAdded(v.id)?' <span class="pdx-badge">handmatig</span>':''}<div class="pdx-xs pdx-muted">${esc(v.addr||'adres onbekend')}</div></td>
        <td class="pdx-small">${esc(v.city||'')}<div class="pdx-xs pdx-muted">${esc(v.prov||'')}</div></td><td class="pdx-xs">${esc(v.type)}</td><td>${pubB(v.pub)}</td><td>${packB(v.pack)}</td><td>${clB(cl)}</td>
        <td class="pdx-xs">${v.web?'<i class="fa fa-globe" title="website"></i> ':''}${v.phone?'<i class="fa fa-phone" title="telefoon"></i> ':''}${v.hours?'<i class="fa fa-clock" style="color:#2f9e44" title="openingstijden"></i> ':''}${v.img?'<i class="fa fa-image" title="foto"></i>':''}${!v.web&&!v.phone&&!v.hours?'<span class="pdx-muted">—</span>':''}</td>
        <td class="pdx-xs">${v.upd?fmtD(v.upd):'<span class="pdx-muted">—</span>'}</td>
        <td style="text-align:right;white-space:nowrap"><button class="pdx-btn sm" data-edit="${esc(v.id)}"><i class="fa fa-pen"></i></button> ${v.pub!=='gepubliceerd'&&!v.demo?`<button class="pdx-btn sm green" data-pub="${esc(v.id)}" title="Publiceren">Publiceer</button> `:''}${v.pub==='gepubliceerd'?`<button class="pdx-btn sm" data-arch="${esc(v.id)}" title="Archiveren (soft delete)"><i class="fa fa-box-archive"></i></button> `:''}${v.pub==='gearchiveerd'?`<button class="pdx-btn sm" data-rest="${esc(v.id)}" title="Herstellen naar concept"><i class="fa fa-rotate-left"></i></button> `:''}<a class="pdx-btn sm" target="_blank" href="../${esc(v.page?v.page+'.html':'club.html?id='+encodeURIComponent(v.id)+(v.pub!=='gepubliceerd'?'&preview=1':''))}" title="Bekijk op site"><i class="fa fa-eye"></i></a></td></tr>`;}).join('')||'<tr><td colspan="10" class="pdx-muted" style="text-align:center;padding:24px">Geen locaties voor deze filters.</td></tr>'}</tbody></table></div>
      <div class="pdx-card-b pdx-row" style="justify-content:center;border-top:1px solid #eef1f7"><button class="pdx-btn sm" ${F.page?'':'disabled'} id="pp">‹</button> Pagina ${F.page+1} / ${pages} <button class="pdx-btn sm" ${F.page<pages-1?'':'disabled'} id="pn">›</button></div></div>`;}
    main().innerHTML=head('Seksclubs-beheer',`Beheer van alle clubs, privéhuizen en parenclubs. <b>Gepubliceerd</b> = zichtbaar op <a href="../seksclubs.html" target="_blank" style="color:#7351c0">seksclubs.html</a>, de provinciefilters en de clubpagina. Wijzigingen gelden in deze browser (concept) tot je ze exporteert naar <code>assets/clubs-data.js</code>.`,
      `<button class="pdx-btn pd" id="add"><i class="fa fa-plus"></i> Locatie toevoegen</button><div style="position:relative"><button class="pdx-btn" id="more"><i class="fa fa-ellipsis"></i> Meer</button><div id="moreM" class="pdx-card" style="display:none;position:absolute;right:0;top:110%;z-index:20;min-width:240px;padding:6px">
        <a href="#" class="pdx-btn sm" style="display:block;margin:3px 0;text-align:left" id="imp"><i class="fa fa-file-import"></i> Importeren (CSV/JSON)</a><a href="#" class="pdx-btn sm" style="display:block;margin:3px 0;text-align:left" id="expJ"><i class="fa fa-download"></i> Export clubs-data (JSON)</a><a href="#" class="pdx-btn sm" style="display:block;margin:3px 0;text-align:left" id="expC"><i class="fa fa-file-csv"></i> Export CSV (huidige lijst)</a><a href="#" class="pdx-btn sm red" style="display:block;margin:3px 0;text-align:left" id="rst"><i class="fa fa-rotate-left"></i> Lokale wijzigingen wissen</a></div></div>`)+
     `<div class="pdx-grid pdx-g4">${kpi('Gepubliceerd',pub.length,`${pub.filter(v=>v.type==='Seksclub').length} seksclubs · ${pub.filter(v=>v.type==='Privéhuis').length} privéhuizen · ${pub.filter(v=>v.type==='Parenclub').length} parenclubs`)}${kpi('Concept',real.filter(v=>v.pub==='concept').length,'te controleren vóór publicatie')}${kpi('Gearchiveerd',real.filter(v=>v.pub==='gearchiveerd').length,'mogelijk gesloten / soft-deleted')}${kpi('Betaald pakket',real.filter(v=>v.pack!=='basic').length,`${real.filter(v=>v.pack==='spotlight').length} Spotlight · ${real.filter(v=>v.pack==='premium').length} Premium · ${real.filter(v=>K.claimOf(v)==='geclaimd').length} geclaimd`)}</div>
     ${Object.keys(ov.o).length||ov.add.length?`<div class="pdx-demo" style="margin-bottom:12px"><i class="fa fa-floppy-disk"></i><div>${Object.keys(ov.o).length} gewijzigde en ${ov.add.length} toegevoegde locaties staan lokaal opgeslagen. Gebruik <b>Meer → Export clubs-data</b> om ze definitief te maken.</div></div>`:''}
     <div class="adm-tabs">${TABS.map(t=>`<a href="#${t[0]}" data-t="${t[0]}" class="${F.tab===t[0]?'on':''}">${t[1]}${['research','stats'].includes(t[0])?'':` <span class="pdx-xs">(${all.filter(v=>inTab(v,t[0])).length})</span>`}</a>`).join('')}</div>${body}`;
    bind();
  }
  function bind(){
    $$('[data-t]').forEach(t=>t.onclick=e=>{e.preventDefault();F.tab=t.dataset.t;F.page=0;sel.clear();history.replaceState(null,'','#'+F.tab);draw();});
    const cq=$('#cq');if(cq)cq.oninput=e=>{F.q=e.target.value;F.page=0;const p=e.target.selectionStart;draw();const n=$('#cq');n.focus();n.setSelectionRange(p,p);};
    ['prov','type','pack','claim','hours','sort'].forEach(k=>{const el=$('#c'+k);if(el)el.onchange=e=>{F[k]=e.target.value;F.page=0;draw();};});
    const pp=$('#pp');if(pp){pp.onclick=()=>{F.page--;draw();};$('#pn').onclick=()=>{F.page++;draw();};}
    $$('[data-sel]').forEach(c=>c.onchange=()=>{c.checked?sel.add(c.dataset.sel):sel.delete(c.dataset.sel);$('#selN').textContent='· '+sel.size+' geselecteerd';});
    const al=$('#all');if(al)al.onchange=e=>{$$('[data-sel]').forEach(c=>{c.checked=e.target.checked;e.target.checked?sel.add(c.dataset.sel):sel.delete(c.dataset.sel);});$('#selN').textContent='· '+sel.size+' geselecteerd';};
    $$('[data-edit]').forEach(b=>b.onclick=e=>{e.preventDefault();edit(K.get(b.dataset.edit));});
    $$('[data-pub]').forEach(b=>b.onclick=()=>setPub([b.dataset.pub],'gepubliceerd'));
    $$('[data-arch]').forEach(b=>b.onclick=()=>{if(confirm('Archiveren? De locatie verdwijnt van de site maar blijft in beheer (herstelbaar).'))setPub([b.dataset.arch],'gearchiveerd');});
    $$('[data-rest]').forEach(b=>b.onclick=()=>setPub([b.dataset.rest],'concept'));
    $$('[data-bulk]').forEach(b=>b.onclick=()=>{if(!sel.size)return toast('Selecteer eerst locaties');setPub([...sel],b.dataset.bulk);});
    const bp=$('#bpack');if(bp)bp.onchange=()=>{if(!bp.value)return;if(!sel.size){toast('Selecteer eerst locaties');bp.value='';return;}[...sel].forEach(id=>K.update(id,{pack:bp.value}));audit('club-pack',sel.size+' locaties',bp.value);toast('Pakket bijgewerkt');draw();};
    $('#add').onclick=()=>edit(null);
    $('#more').onclick=()=>{const m=$('#moreM');m.style.display=m.style.display==='none'?'block':'none';};
    $('#imp').onclick=e=>{e.preventDefault();importer();};
    $('#expJ').onclick=e=>{e.preventDefault();const L=K.all();dl('clubs-data.json',JSON.stringify({v:1,generated:P.now(),note:'Export uit Admin → Seksclubs-beheer. Zet in assets/clubs-data.js (window.PDX_CLUBS_DATA) of laat _build/clubs_data.py dit bestand inlezen.',count:L.length,venues:L},null,1));audit('club-export','clubs-data',L.length+' locaties');};
    $('#expC').onclick=e=>{e.preventDefault();const L=list();dl('seksclubs.csv',csv([['id','naam','type','plaats','provincie','adres','postcode','telefoon','website','e-mail','status','pakket','claim','gecontroleerd']].concat(L.map(v=>[v.id,v.name,v.type,v.city,v.prov,v.addr,v.pc,v.phone,v.web,v.email,v.pub,v.pack,K.claimOf(v),v.verified||v.checked2?'ja':'nee']))),'text/csv');};
    $('#rst').onclick=e=>{e.preventDefault();if(confirm('Alle lokale wijzigingen en toegevoegde locaties wissen? (clubs-data.js blijft)')){K.reset();audit('club-reset','lokale wijzigingen','');draw();}};
  }
  function setPub(ids,s){let n=0,blocked=[];ids.forEach(id=>{const v=K.get(id);if(!v)return;if(s==='gepubliceerd'&&!canPublish(v)){blocked.push(v.name);return;}K.update(id,{pub:s});n++;});
    audit('club-'+s,n+' locatie(s)',ids.length===1?(K.get(ids[0])||{}).name:'');sel.clear();
    if(blocked.length)alert('Niet gepubliceerd ('+blocked.length+'): '+blocked.slice(0,8).join(', ')+(blocked.length>8?'…':'')+'\n\nReden: niet gecontroleerd. Open de locatie en vink “Gecontroleerd (gebeld/KvK)” aan.');
    if(n)toast(n+' → '+s);draw();}
  function hoursHtml(H){return `<div style="display:grid;grid-template-columns:40px 1fr 1fr 70px;gap:4px 8px;align-items:center">${DAYS.map((d,i)=>{const h=H&&H[i];return `<b class="pdx-xs">${d}</b><input class="pdx-in" type="time" data-hf="${i}" value="${h?h[0]:''}"><input class="pdx-in" type="time" data-ht="${i}" value="${h?h[1]:''}"><label class="pdx-xs"><input type="checkbox" data-hc="${i}" ${H&&!h?'checked':''}> dicht</label>`;}).join('')}</div>`;}
  function edit(v){const isNew=!v;v=v||{name:'',type:'Seksclub',city:'',prov:'',addr:'',pc:'',phone:'',web:'',email:'',hours:null,pub:'concept',pack:'basic',claim:'ongeclaimd',intro:'',fac:[],notes:[],aliases:[],research:'handmatig',verified:false};
    const cl=isNew?'ongeclaimd':K.claimOf(v);
    const m=modal(isNew?'Locatie toevoegen':'Bewerken: '+esc(v.name),`<div class="pdx-f two">
      <div class="full"><label class="pdx-lbl">Naam *</label><input class="pdx-in" id="eName" value="${esc(v.name)}"></div>
      <div><label class="pdx-lbl">Type</label><select class="pdx-in" id="eType">${K.TYPES.map(t=>`<option ${v.type===t?'selected':''}>${t}</option>`).join('')}</select></div>
      <div><label class="pdx-lbl">Aliassen (komma)</label><input class="pdx-in" id="eAli" value="${esc((v.aliases||[]).join(', '))}"></div>
      <div><label class="pdx-lbl">Plaats *</label><input class="pdx-in" id="eCity" value="${esc(v.city||'')}"></div>
      <div><label class="pdx-lbl">Provincie *</label><select class="pdx-in" id="eProv"><option value="">—</option>${PROVS.map(p=>`<option ${v.prov===p?'selected':''}>${p}</option>`).join('')}</select></div>
      <div><label class="pdx-lbl">Adres</label><input class="pdx-in" id="eAddr" value="${esc(v.addr||'')}"></div><div><label class="pdx-lbl">Postcode</label><input class="pdx-in" id="ePc" value="${esc(v.pc||'')}"></div>
      <div><label class="pdx-lbl">Telefoon</label><input class="pdx-in" id="ePhone" value="${esc(v.phone||'')}"></div><div><label class="pdx-lbl">Website</label><input class="pdx-in" id="eWeb" value="${esc(v.web||'')}" placeholder="https://"></div>
      <div><label class="pdx-lbl">E-mail</label><input class="pdx-in" id="eMail" value="${esc(v.email||'')}"></div><div><label class="pdx-lbl">Foto (pad, alleen met gebruiksrechten)</label><input class="pdx-in" id="eImg" value="${esc(v.img||'')}" placeholder="img/clubs/…"></div>
      <div class="full"><label class="pdx-lbl">Korte omschrijving (eigen tekst, niet kopiëren van bronnen)</label><textarea class="pdx-in" id="eIntro" maxlength="400">${esc(v.intro||'')}</textarea></div>
      <div class="full"><label class="pdx-lbl">Faciliteiten (komma)</label><input class="pdx-in" id="eFac" value="${esc((v.fac||[]).join(', '))}"></div>
      <div class="full"><span class="pdx-lbl">Openingstijden <span class="pdx-xs pdx-muted">(leeg laten = onbekend → nooit “Nu open”)</span></span>${hoursHtml(v.hours)}${v.hoursRaw?`<div class="pdx-xs pdx-muted" style="margin-top:4px">Research: ${esc(v.hoursRaw)}</div>`:''}</div>
      <hr class="full" style="border:0;border-top:1px solid #eef1f7">
      <div><label class="pdx-lbl">Publicatiestatus</label><select class="pdx-in" id="ePub">${K.PUBS.map(p=>`<option ${v.pub===p?'selected':''}>${p}</option>`).join('')}</select></div>
      <div><label class="pdx-lbl">Pakket</label><select class="pdx-in" id="ePack">${Object.keys(K.PACKS).map(p=>`<option value="${p}" ${v.pack===p?'selected':''}>${K.PACKS[p].t}${p==='basic'?' (gratis)':p==='premium'?' (€49/mnd)':' (€99/mnd)'}</option>`).join('')}</select></div>
      <div><label class="pdx-lbl">Claim-status</label><select class="pdx-in" id="eClaim"><option value="">Automatisch uit claims (${esc(cl)})</option>${K.CLAIMS.map(p=>`<option ${v.claimManual&&v.claim===p?'selected':''}>${p}</option>`).join('')}</select></div>
      <label class="pdx-opt" style="align-self:end"><input type="checkbox" id="eChk" ${v.verified||v.checked2?'checked':''} ${v.verified?'disabled':''}> Gecontroleerd (gebeld / KvK / website)</label>
      <div class="full"><label class="pdx-lbl">Interne notitie</label><input class="pdx-in" id="eNote" placeholder="Bijv. gebeld op 03-11, openingstijden bevestigd"></div>
      ${(v.notes||[]).length?`<div class="full pdx-xs pdx-muted"><b>Notities:</b> ${v.notes.map(esc).join(' · ')}</div>`:''}
      ${(v.srcUrls||[]).length?`<div class="full pdx-xs"><b>Bronnen:</b> ${v.srcUrls.map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener nofollow" style="color:#7351c0">${esc(u.replace(/^https?:\/\//,'').split('/')[0])}</a>`).join(' · ')} · research: ${esc(v.research)}${(v.reasons||[]).length?' · '+v.reasons.map(esc).join(', '):''}</div>`:''}
      <div class="full pdx-xs" id="eErr" style="color:#c92a2a"></div></div>
      ${!isNew&&K.isAdded(v.id)?'<div class="pdx-row" style="margin-top:8px"><button class="pdx-btn sm red" id="eDel" type="button"><i class="fa fa-trash"></i> Handmatige locatie definitief verwijderen</button></div>':''}`,m=>{
      const g=id=>m.querySelector('#'+id).value.trim();
      const H=DAYS.map((d,i)=>{const f=m.querySelector(`[data-hf="${i}"]`).value,t=m.querySelector(`[data-ht="${i}"]`).value,c=m.querySelector(`[data-hc="${i}"]`).checked;return c?null:(f&&t?[f,t]:undefined);});
      const anyH=H.some(h=>h!==undefined);const hours=anyH?H.map(h=>h||null):null;
      const p={name:g('eName'),type:g('eType'),aliases:g('eAli')?g('eAli').split(',').map(s=>s.trim()).filter(Boolean):[],city:g('eCity'),prov:g('eProv'),addr:g('eAddr')||null,pc:g('ePc')||null,phone:g('ePhone')||null,web:g('eWeb')||null,email:g('eMail')||null,img:g('eImg')||null,intro:g('eIntro'),fac:g('eFac')?g('eFac').split(',').map(s=>s.trim()).filter(Boolean):[],hours,pub:g('ePub'),pack:g('ePack')};
      const cm=g('eClaim');p.claimManual=!!cm;if(cm)p.claim=cm;
      if(!v.verified)p.checked2=m.querySelector('#eChk').checked;
      const err=t=>{m.querySelector('#eErr').textContent=t;return false;};
      if(p.name.length<2)return err('Naam is verplicht.');if(!p.city||!p.prov)return err('Plaats en provincie zijn verplicht.');
      if(p.web&&!/^https?:\/\//.test(p.web))return err('Website moet met http(s):// beginnen.');
      if(p.pub==='gepubliceerd'&&!canPublish(Object.assign({},v,p)))return err(whyNot(Object.assign({},v,p)));
      const note=g('eNote');if(note)p.notes=(v.notes||[]).concat(['['+new Date().toLocaleDateString('nl-NL')+' '+me.username+'] '+note]);
      if(isNew){const r=K.add(p);audit('club-add',r.name,r.id);toast('Toegevoegd als '+r.pub);}else{K.update(v.id,p);audit('club-edit',p.name,Object.keys(p).join(','));toast('Opgeslagen');}
      draw();},isNew?'Toevoegen':'Opslaan');
    const del=m.querySelector('#eDel');if(del)del.onclick=()=>{if(!confirm('Definitief verwijderen?'))return;K.remove(v.id);audit('club-delete',v.name,'');m.remove();draw();};
  }
  function importer(){modal('Importeren (CSV of JSON)',`<p class="pdx-small" style="margin-bottom:8px">Secundaire actie voor bulk-toevoegingen. Nieuwe locaties komen altijd binnen als <b>concept</b>; dubbele (zelfde naam + plaats) worden overgeslagen.</p>
     <p class="pdx-xs pdx-muted">CSV-kolommen (; of ,): naam, type, plaats, provincie, adres, postcode, telefoon, website, e-mail · JSON: array van objecten met name, type, city, prov, …</p>
     <input type="file" id="iF" accept=".csv,.json,text/csv,application/json" class="pdx-in" style="margin-top:8px"><textarea class="pdx-in" id="iT" placeholder="…of plak hier CSV/JSON" style="margin-top:8px;min-height:120px"></textarea><div id="iR" class="pdx-small" style="margin-top:8px"></div>`,m=>{
      const t=m.querySelector('#iT').value.trim();if(!t){m.querySelector('#iR').textContent='Geen gegevens.';return false;}
      let rows=[];try{if(/^[\[{]/.test(t)){const j=JSON.parse(t);rows=(Array.isArray(j)?j:j.venues||[]).map(o=>({name:o.name||o.naam,type:o.type,city:o.city||o.plaats,prov:o.prov||o.provincie||o.province,addr:o.addr||o.adres||o.address,pc:o.pc||o.postcode,phone:o.phone||o.telefoon,web:o.web||o.website,email:o.email||o['e-mail']}));}
        else{const lines=t.split(/\r?\n/).filter(Boolean);const sep=lines[0].includes(';')?';':',';const hd=lines[0].split(sep).map(h=>h.replace(/"/g,'').trim().toLowerCase());
          rows=lines.slice(1).map(l=>{const c=l.split(sep).map(x=>x.replace(/^"|"$/g,'').trim());const o={};hd.forEach((h,i)=>o[h]=c[i]);return {name:o.naam||o.name,type:o.type,city:o.plaats||o.city,prov:o.provincie||o.prov,addr:o.adres||o.addr,pc:o.postcode||o.pc,phone:o.telefoon||o.phone,web:o.website||o.web,email:o['e-mail']||o.email};});}}catch(e){m.querySelector('#iR').textContent='Kan niet lezen: '+e.message;return false;}
      const ex=K.all();let add=0,skip=0;rows.forEach(r=>{if(!r.name||!r.city){skip++;return;}if(ex.some(v=>v.name.toLowerCase()===String(r.name).toLowerCase()&&String(v.city).toLowerCase()===String(r.city).toLowerCase())){skip++;return;}
        const ty=/priv/i.test(r.type||'')?'Privéhuis':/paren/i.test(r.type||'')?'Parenclub':/club|seks/i.test(r.type||'')?'Seksclub':'Club';K.add(Object.assign({},r,{type:ty,pub:'concept',research:'import',reasons:['geïmporteerd: controleren']}));add++;});
      audit('club-import',add+' toegevoegd',skip+' overgeslagen');toast(add+' toegevoegd als concept · '+skip+' overgeslagen');draw();},'Importeren');
    const f=document.querySelector('#iF');f.onchange=()=>{const r=new FileReader();r.onload=()=>{document.querySelector('#iT').value=r.result;};if(f.files[0])r.readAsText(f.files[0]);};}
  function research(){const C=window.PDX_CLUBS;const D=window.PDX_CLUBS_DATA||{};
    if(!C)return `<div class="pdx-card pdx-card-b pdx-small">Bron: <code>${esc(D.source||'')}</code> (${esc(D.generated||'')}), ${D.count||0} records.</div>`;const s=C.summary;
    return `<div class="pdx-card pdx-card-b pdx-small" style="display:grid;gap:6px"><div>Research-inventaris <code>${esc(D.source||'')}</code> · gegenereerd ${esc(D.generated||'')} · ${s.raw_records} ruwe records → ${s.total_unique} uniek (${s.duplicates_merged} samengevoegd).</div>
     <div>Bij genereren (<code>_build/clubs_data.py</code>): research “actief” → gepubliceerd, “onbekend” → concept, “mogelijk gesloten” → gearchiveerd. Teksten van bronsites worden niet overgenomen.</div>${(C.caveats||[]).map(c=>`<div class="pdx-xs pdx-muted">• ${esc(c)}</div>`).join('')}</div>
     <div class="pdx-card"><div class="pdx-card-h">Per provincie (research)</div><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Provincie</th><th>Totaal</th><th>Actief</th><th>Mogelijk gesloten</th><th>Onbekend</th><th>Seksclub</th><th>Privéhuis</th><th>Parenclub</th><th>Zonder website</th><th>Zonder tijden</th></tr></thead><tbody>${Object.entries(C.per_province).map(([p,x])=>`<tr><td><b>${esc(p)}</b></td><td>${x.totaal}</td><td>${x.actief}</td><td>${x.mogelijk_gesloten}</td><td>${x.onbekend}</td><td>${x.seksclub}</td><td>${x.privehuis}</td><td>${x.parenclub}</td><td>${x.zonder_website}</td><td>${x.zonder_openingstijden}</td></tr>`).join('')}</tbody></table></div></div>
     <div class="pdx-card"><div class="pdx-card-h">Bronstatus</div><div class="pdx-card-b"><pre class="pdx-pre">${esc(JSON.stringify(C.sources_status,null,2))}</pre></div></div>`;}
  function stats(){const st=JSON.parse(localStorage.getItem('pdx_stats')||'{}');const rows=Object.entries(st).filter(([k])=>/^(club\.html|seksclub-|privehuis-|parenclub-|seksclubs)/.test(k)).sort((a,b)=>(b[1].view||0)-(a[1].view||0));
    return `<div class="pdx-demo" style="margin-bottom:12px"><i class="fa fa-flask"></i><div>Alleen events uit <b>deze browser</b>. In productie: server-side, zonder IP-opslag; zichtbaar voor de club vanaf Premium.</div></div><div class="pdx-card"><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Pagina</th><th>Weergaven</th><th>Websitekliks</th><th>Telefoonkliks</th></tr></thead><tbody>${rows.map(([k,v])=>`<tr><td><a href="../${esc(k)}" target="_blank" style="color:#7351c0">${esc(k)}</a></td><td>${v.view||0}</td><td>${v.web||0}</td><td>${v.tel||0}</td></tr>`).join('')||'<tr><td colspan="4" class="pdx-muted">Nog geen events. Open een clubpagina op de site.</td></tr>'}</tbody></table></div></div>`;}
  draw();
  window.addEventListener('pdx:clubs',()=>{});
};
})();
