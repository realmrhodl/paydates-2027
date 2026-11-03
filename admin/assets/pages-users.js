/* Paydates V2 admin — dashboard, gebruikers, gebruikersdetail (concept) */
(function(){
'use strict';
const A=window.PDXA; if(!A)return;
const {P,$,$$,qs,me,modal,dl,csv,audit,uById,roleB,stB,kycB,adB,main,head,kpi,R}=A; const {db,save,esc,fmtD,fmtDT,eur,toast}=P;

R.index=function(){
  const d=db(); const U=d.users; const wk=7*864e5;
  const by=r=>U.filter(u=>u.role===r).length;
  const weeks=Array.from({length:10},(_,i)=>{const end=Date.now()-(9-i)*wk;return {l:new Date(end).toLocaleDateString('nl-NL',{day:'2-digit',month:'2-digit'}),n:U.filter(u=>{const t=+new Date(u.created);return t<=end&&t>end-wk}).length}});
  const mx=Math.max(1,...weeks.map(w=>w.n)); const C=window.PDX_CLUBS; const stats=JSON.parse(localStorage.getItem('pdx_stats')||'{}');
  const sv=Object.values(stats).reduce((a,s)=>({view:a.view+(s.view||0),web:a.web+(s.web||0),tel:a.tel+(s.tel||0)}),{view:0,web:0,tel:0});
  const credits=U.reduce((s,u)=>s+(u.credits||0),0);
  main().innerHTML=head('Dashboard','Alle cijfers zijn <b>demo</b> (seed + wat je in deze browser doet). Geen echte omzet of bezoekersdata.',`<a class="pdx-btn" href="advertenties.html">Moderatie</a><a class="pdx-btn pd" href="email.html#mass">Massamail</a>`)+
  `<div class="pdx-grid pdx-g4">${kpi('Gebruikers',U.length,`${by('adverteerder')} adverteerders · ${by('bedrijf')} bedrijven · ${by('klant')} klanten`)}${kpi('Advertenties live',d.ads.filter(a=>a.status==='live').length,`${d.ads.filter(a=>a.status==='wacht').length} wachten op moderatie`)}${kpi('KYC-wachtrij',d.kyc.filter(k=>k.status==='ingediend').length,`${U.filter(u=>u.kyc==='goedgekeurd').length} geverifieerd`)}${kpi('Credits in omloop',credits.toLocaleString('nl-NL'),'≈ '+eur(credits/d.pay.rates.credPerEur)+' (demo)')}
   ${kpi('Open claims',d.claims.filter(c=>c.status==='nieuw').length,'bedrijfsprofielen')}${kpi('Mails (gesimuleerd)',d.mail.log.length,d.mail.campaigns.length+' campagnes')}${(()=>{const K=window.PDXClubs;if(!K)return kpi('Seksclubs','—','');const A=K.all();const pub=A.filter(v=>v.pub==='gepubliceerd');return kpi('Seksclubs live',pub.length,`${A.filter(v=>v.pub==='concept').length} concept · ${A.filter(v=>v.pub==='gearchiveerd').length} gearchiveerd`);})()}${kpi('Clubprofiel-events',sv.view,`${sv.web} websitekliks · ${sv.tel} telefoonkliks (deze browser)`)}</div>
   <div class="pdx-grid pdx-g2"><div class="pdx-card"><div class="pdx-card-h">Nieuwe accounts per week (demo)</div><div class="pdx-card-b" style="padding-bottom:28px"><div class="adm-chart">${weeks.map(w=>`<div style="height:${w.n/mx*100}%" title="${w.n}"><span>${w.l}</span></div>`).join('')}</div></div></div>
   <div class="pdx-card"><div class="pdx-card-h"><span>Te doen</span></div><div class="pdx-card-b pdx-small" style="display:grid;gap:8px">
    <a href="advertenties.html" class="pdx-between"><span><i class="fa fa-rectangle-ad" style="color:#7351c0"></i> Advertenties beoordelen</span><b>${d.ads.filter(a=>a.status==='wacht').length}</b></a>
    <a href="kyc.html" class="pdx-between"><span><i class="fa fa-id-card" style="color:#7351c0"></i> KYC beoordelen</span><b>${d.kyc.filter(k=>k.status==='ingediend').length}</b></a>
    <a href="claims.html" class="pdx-between"><span><i class="fa fa-hand" style="color:#7351c0"></i> Claims afhandelen</span><b>${d.claims.filter(c=>c.status==='nieuw').length}</b></a>
    <a href="seksclubs.html" class="pdx-between"><span><i class="fa fa-building" style="color:#7351c0"></i> Clubs in concept (te controleren)</span><b>${window.PDXClubs?PDXClubs.all().filter(v=>v.pub==='concept'&&!v.demo).length:'—'}</b></a>
    <a href="gebruikers.html?status=onbevestigd" class="pdx-between"><span><i class="fa fa-user-clock" style="color:#7351c0"></i> Onbevestigde accounts</span><b>${U.filter(u=>u.status==='onbevestigd').length}</b></a></div></div></div>
   <div class="pdx-card"><div class="pdx-card-h"><span>Laatste activiteit</span><a href="audit.html" style="color:#7351c0">Auditlog →</a></div><div class="pdx-scroll"><table class="pdx-table"><tbody>${d.audit.slice(0,8).map(a=>`<tr><td class="pdx-xs pdx-muted" style="white-space:nowrap">${fmtDT(a.at)}</td><td><b>${esc(a.actor)}</b></td><td><span class="adm-chip">${esc(a.action)}</span></td><td>${esc(a.target)}</td><td class="pdx-muted">${esc(a.detail)}</td></tr>`).join('')}</tbody></table></div></div>`;
};

R.gebruikers=function(){
  const d=db(); const F={q:qs('q')||'',role:qs('role')||'',status:qs('status')||'',kyc:qs('kyc')||'',mk:'',lvl:'',page:0}; const sel=new Set();
  const opt=(arr,cur)=>arr.map(r=>`<option ${cur===r?'selected':''}>${r}</option>`).join('');
  main().innerHTML=head('Gebruikers',d.users.length+' accounts (demo). Klik op een rij voor details.',`<button class="pdx-btn" id="exp"><i class="fa fa-file-csv"></i> Export CSV</button>`)+
  `<div class="pdx-card pdx-card-b pdx-row"><input class="pdx-in" style="flex:2;min-width:180px" id="fq" placeholder="Zoek op naam, e-mail, stad…" value="${esc(F.q)}">
   <select class="pdx-in" style="flex:1;min-width:120px" id="frole"><option value="">Alle rollen</option>${opt(['admin','moderator','adverteerder','bedrijf','klant'],F.role)}</select>
   <select class="pdx-in" style="flex:1;min-width:120px" id="fstatus"><option value="">Alle (excl. verwijderd)</option>${opt(['actief','onbevestigd','geschorst','verbannen','verwijderd'],F.status)}</select>
   <select class="pdx-in" style="flex:1;min-width:100px" id="flvl"><option value="">Niveau: alles</option>${[1,2,3,4,5].map(n=>`<option value="${n}">Niveau ${n}</option>`).join('')}</select>
   <select class="pdx-in" style="flex:1;min-width:120px" id="fkyc"><option value="">KYC: alles</option>${opt(['geen','ingediend','goedgekeurd','afgewezen'],F.kyc)}</select>
   <select class="pdx-in" style="flex:1;min-width:120px" id="fmk"><option value="">Marketing: alles</option><option value="1">Opt-in</option><option value="0">Opt-out</option></select></div>
   <div class="pdx-card"><div class="pdx-card-h"><span id="cnt"></span><span class="pdx-row"><span class="pdx-xs pdx-muted" id="selN">0 geselecteerd</span>
    <button class="pdx-btn sm" data-b="actief">Activeren</button><button class="pdx-btn sm" data-b="geschorst">Schorsen</button><button class="pdx-btn sm red" data-b="verbannen">Verbannen</button><button class="pdx-btn sm red" data-b="verwijderd">Verwijderen</button><button class="pdx-btn sm" data-b="credits">Credits ±</button><button class="pdx-btn sm" data-b="optout">Marketing opt-out</button><button class="pdx-btn sm pd" data-b="mail"><i class="fa fa-envelope"></i> Mail selectie</button></span></div>
   <div class="pdx-scroll"><table class="pdx-table"><thead><tr><th><input type="checkbox" id="all"></th><th>Gebruiker</th><th>E-mail</th><th>Rol</th><th>Niv.</th><th>Status</th><th>KYC</th><th>Credits</th><th>Adv.</th><th>Laatst actief</th><th>Mkt</th></tr></thead><tbody id="tb"></tbody></table></div><div class="adm-pager" id="pg"></div></div>`;
  const list=()=>{const q=F.q.toLowerCase();return db().users.filter(u=>(!q||[u.username,u.name,u.email,u.city].join(' ').toLowerCase().includes(q))&&(!F.role||u.role===F.role)&&(F.status?u.status===F.status:u.status!=='verwijderd')&&(!F.lvl||String(u.level||1)===F.lvl)&&(!F.kyc||u.kyc===F.kyc)&&(F.mk===''||String(+!!u.marketing)===F.mk));};
  function draw(){const L=list(); const ads=db().ads; const per=50; const pages=Math.max(1,Math.ceil(L.length/per)); F.page=Math.min(F.page,pages-1);
    $('#cnt').textContent=L.length+' resultaten';
    $('#tb').innerHTML=L.slice(F.page*per,F.page*per+per).map(u=>`<tr data-id="${u.id}" style="cursor:pointer"><td data-stop><input type="checkbox" data-sel="${u.id}" ${sel.has(u.id)?'checked':''}></td><td><b>${esc(u.username)}</b><div class="pdx-xs pdx-muted">${esc(u.city||'')}</div></td><td class="pdx-small">${esc(u.email)}</td><td>${roleB(u.role)}</td><td class="pdx-xs">${u.level||1}</td><td>${stB(u.status)}</td><td>${kycB(u.kyc)}</td><td>${u.credits}</td><td>${ads.filter(a=>a.owner===u.id).length}</td><td class="pdx-xs">${fmtD(u.lastLogin)}</td><td>${u.marketing?'<i class="fa fa-check" style="color:#2f9e44"></i>':'<i class="fa fa-ban" style="color:#a1aebd"></i>'}</td></tr>`).join('')||'<tr><td colspan="11" class="pdx-muted" style="text-align:center;padding:24px">Geen gebruikers gevonden.</td></tr>';
    $('#pg').innerHTML=`<button class="pdx-btn sm" ${F.page?'':'disabled'} id="pp">‹</button> Pagina ${F.page+1} / ${pages} <button class="pdx-btn sm" ${F.page<pages-1?'':'disabled'} id="pn">›</button>`;
    $('#pp').onclick=()=>{F.page--;draw()};$('#pn').onclick=()=>{F.page++;draw()};
    $$('#tb tr[data-id]').forEach(r=>r.onclick=e=>{if(e.target.closest('[data-stop]'))return;location.href='gebruiker.html?id='+r.dataset.id;});
    $$('[data-sel]').forEach(c=>c.onchange=()=>{c.checked?sel.add(c.dataset.sel):sel.delete(c.dataset.sel);$('#selN').textContent=sel.size+' geselecteerd';});
    $('#selN').textContent=sel.size+' geselecteerd';}
  $('#fq').oninput=e=>{F.q=e.target.value;F.page=0;draw()};['role','status','kyc','mk','lvl'].forEach(k=>$('#f'+k).onchange=e=>{F[k]=e.target.value;F.page=0;draw()});
  $('#all').onchange=e=>{list().forEach(u=>e.target.checked?sel.add(u.id):sel.delete(u.id));draw();};
  $('#exp').onclick=()=>{dl('paydates-gebruikers-demo.csv',csv([['id','gebruikersnaam','email','rol','status','kyc','credits','stad','marketing','aangemaakt']].concat(list().map(u=>[u.id,u.username,u.email,u.role,u.status,u.kyc,u.credits,u.city,u.marketing?'ja':'nee',u.created]))),'text/csv');audit('export','gebruikers','CSV-export (demo)');};
  $$('[data-b]').forEach(b=>b.onclick=()=>{if(!sel.size)return toast('Selecteer eerst gebruikers');const k=b.dataset.b;const ids=[...sel];
    if(k==='mail'){sessionStorage.setItem('pdxMailSel',JSON.stringify(ids));location.href='email.html#mass';return;}
    if(k==='credits'){modal('Credits aanpassen ('+ids.length+')','<label class="pdx-lbl">Aantal (negatief = afschrijven)</label><input class="pdx-in" id="mc" type="number" value="100"><label class="pdx-lbl" style="margin-top:8px">Reden</label><input class="pdx-in" id="mr" value="Compensatie (handmatig)">',m=>{const n=+m.querySelector('#mc').value;const r=m.querySelector('#mr').value;const d2=db();d2.users.filter(u=>ids.includes(u.id)).forEach(u=>{u.credits=Math.max(0,u.credits+n);u.ledger=u.ledger||[];u.ledger.unshift({at:P.now(),delta:n,t:'Admin: '+r,bal:u.credits});});save(d2);audit('bulk-credits',ids.length+' gebruikers',n+' cr · '+r);toast('Credits aangepast');draw();});return;}
    if(['geschorst','verbannen','verwijderd'].includes(k)&&ids.includes(me.id))return toast('Je kunt jezelf niet schorsen');
    if(!confirm(`${ids.length} gebruiker(s): ${k==='optout'?'marketing opt-out':'status → '+k}?`))return;
    const d2=db();d2.users.filter(u=>ids.includes(u.id)).forEach(u=>{if(k==='optout')u.marketing=false;else u.status=k;});save(d2);audit('bulk-'+k,ids.length+' gebruikers','');toast('Bijgewerkt');draw();});
  draw();
};

function setKyc(uid,status,note,cb){
  if(status==='afgewezen'&&!String(note||'').trim())return toast('Notitie verplicht bij afwijzing');
  const d=db();const u=d.users.find(x=>x.id===uid);u.kyc=status;let k=d.kyc.find(x=>x.userId===uid);
  if(!k&&status!=='geen'){k={id:P.uid('k'),userId:uid,submitted:P.now(),steps:{id:false,selfie:false,age:false},note:''};d.kyc.unshift(k);}
  if(k){k.status=status==='geen'?'ingetrokken':status;k.note=note||k.note||'';k.reviewer=me.username;k.reviewed=P.now();}
  save(d);if(status==='goedgekeurd')P.mailSim(u,'kyc_ok',{});if(status==='afgewezen')P.mailSim(u,'kyc_no',{notitie:note});
  audit('kyc-'+status,u.username,note||'');toast('KYC: '+status);cb&&cb();}
function singleMail(uid,cb){const d=db();const u=d.users.find(x=>x.id===uid);
  const m=modal('Mail aan '+esc(u.email),`<div class="pdx-demo" style="margin-bottom:10px"><i class="fa fa-flask"></i><div>Wordt <b>niet</b> verzonden: alleen gelogd als gesimuleerd.</div></div><label class="pdx-lbl">Template</label><select class="pdx-in" id="mt"><option value="custom">Eigen bericht</option>${d.mail.templates.map(t=>`<option value="${t.k}">${esc(t.t)}</option>`).join('')}</select><label class="pdx-lbl" style="margin-top:8px">Onderwerp</label><input class="pdx-in" id="ms"><label class="pdx-lbl" style="margin-top:8px">Bericht</label><textarea class="pdx-in" id="mb" style="min-height:160px"></textarea><p class="pdx-xs pdx-muted">Variabelen: {{naam}} {{email}} {{link}} {{notitie}} {{credits}}</p>`,m=>{
    const s=m.querySelector('#ms').value,b=m.querySelector('#mb').value;if(!s||!b){toast('Onderwerp en bericht verplicht');return false;}P.mailSim(u,m.querySelector('#mt').value,{},{subject:s,body:b});audit('mail-single',u.username,s);toast('Gesimuleerd (niet verzonden)');cb&&cb();},'Simuleer verzending');
  const sel=m.querySelector('#mt');sel.onchange=()=>{const t=d.mail.templates.find(x=>x.k===sel.value);m.querySelector('#ms').value=t?P.fill(t.subject,u,{}):'';m.querySelector('#mb').value=t?P.fill(t.body,u,{}):'';};}
A.setKyc=setKyc; A.singleMail=singleMail;

R.gebruiker=function(){
  const d=db(); const u=d.users.find(x=>x.id===qs('id')); if(!u){main().innerHTML=head('Gebruiker niet gevonden','<a href="gebruikers.html" style="color:#7351c0">Terug naar overzicht</a>');return;}
  const ads=d.ads.filter(a=>a.owner===u.id); const mails=d.mail.log.filter(m=>m.userId===u.id||m.to===u.email); const kq=d.kyc.find(k=>k.userId===u.id);
  const opt=(arr,cur)=>arr.map(r=>`<option ${cur===r?'selected':''}>${r}</option>`).join('');
  main().innerHTML=head(`<a href="gebruikers.html" style="color:#a1aebd"><i class="fa fa-angle-left"></i></a> ${esc(u.username)}`,`${roleB(u.role)} ${stB(u.status)} KYC ${kycB(u.kyc)} · aangemaakt ${fmtD(u.created)} · laatst actief ${fmtDT(u.lastLogin)}`,
   `<button class="pdx-btn" id="bReset"><i class="fa fa-key"></i> Wachtwoord-reset sturen</button><button class="pdx-btn" id="bMail"><i class="fa fa-envelope"></i> Mail sturen</button>${u.status==='actief'?'<button class="pdx-btn red" id="bSus"><i class="fa fa-user-slash"></i> Schorsen / bannen</button>':'<button class="pdx-btn green" id="bAct"><i class="fa fa-user-check"></i> Heractiveren</button>'}`)+
  `<div class="pdx-grid pdx-g2"><form class="pdx-card" id="fU"><div class="pdx-card-h">Profiel</div><div class="pdx-card-b pdx-f two">
    <div><label class="pdx-lbl">Weergavenaam</label><input class="pdx-in" name="name" value="${esc(u.name)}"></div><div><label class="pdx-lbl">Gebruikersnaam</label><input class="pdx-in" name="username" value="${esc(u.username)}" required></div>
    <div class="full"><label class="pdx-lbl">E-mailadres</label><input class="pdx-in" type="email" name="email" value="${esc(u.email)}" required><span class="pdx-xs pdx-muted">In productie: bevestigingsmail naar het nieuwe adres + melding naar het oude.</span></div>
    <div><label class="pdx-lbl">Rol</label><select class="pdx-in" name="role" ${me.role!=='admin'?'disabled':''}>${opt(['klant','adverteerder','bedrijf','moderator','admin'],u.role)}</select></div>
    <div><label class="pdx-lbl">Status</label><select class="pdx-in" name="status">${opt(['actief','onbevestigd','geschorst','verbannen','verwijderd'],u.status)}</select></div>
    <div><label class="pdx-lbl">Stad</label><input class="pdx-in" name="city" value="${esc(u.city||'')}"></div>
    <div><label class="pdx-lbl">Contract-BV</label><select class="pdx-in" name="bv">${d.bv.map(b=>`<option value="${b.id}" ${u.bv===b.id?'selected':''}>${esc(b.legal)}</option>`).join('')}</select></div>
    ${u.company?`<div><label class="pdx-lbl">Bedrijfsnaam</label><input class="pdx-in" name="cname" value="${esc(u.company.name||'')}"></div><div><label class="pdx-lbl">Clubpakket</label><select class="pdx-in" name="cplan">${d.pay.clubPlans.map(p=>`<option value="${p.k}" ${u.company.plan===p.k?'selected':''}>${esc(p.t)} (${p.eur?eur(p.eur)+'/mnd':'gratis'})</option>`).join('')}</select></div>`:''}
    <label class="pdx-opt full"><input type="checkbox" name="marketing" ${u.marketing?'checked':''}> Marketingmail toegestaan (opt-in). Uit = uitgesloten van marketing-massamail.</label>
    <div class="full"><button class="pdx-btn pd">Opslaan</button></div></div></form>
   <div style="display:grid;gap:16px;align-content:start">
    <div class="pdx-card"><div class="pdx-card-h"><span>Credits: <b>${u.credits}</b></span><button class="pdx-btn sm" id="bCred" type="button">Aanpassen</button></div><div class="pdx-card-b pdx-small">${(u.ledger||[]).slice(0,8).map(l=>`<div class="pdx-between" style="padding:3px 0;border-bottom:1px solid #eef1f7"><span>${esc(l.t)} <span class="pdx-xs pdx-muted">${fmtDT(l.at)}</span></span><b style="color:${l.delta<0?'#c92a2a':'#2b8a3e'}">${l.delta>0?'+':''}${l.delta}</b></div>`).join('')||'<span class="pdx-muted">Geen mutaties.</span>'}</div></div>
    <div class="pdx-card"><div class="pdx-card-h"><span>KYC ${kycB(u.kyc)}</span>${kq?`<a href="kyc.html" style="color:#7351c0">Wachtrij →</a>`:''}</div><div class="pdx-card-b pdx-small">${kq?`Ingediend ${fmtDT(kq.submitted)} · stappen: ${Object.entries(kq.steps||{}).map(([k,v])=>`<span class="adm-chip ${v?'y':'n'}">${k}</span>`).join('')}${kq.note?`<p style="margin-top:6px">Notitie: ${esc(kq.note)}</p>`:''}`:'<span class="pdx-muted">Geen aanvraag.</span>'}
      <div class="pdx-row" style="margin-top:8px"><select class="pdx-in" style="width:auto" id="kSel">${opt(['geen','ingediend','goedgekeurd','afgewezen'],u.kyc)}</select><input class="pdx-in" style="flex:1" id="kNote" placeholder="Notitie (bij afwijzing verplicht)"><button class="pdx-btn sm" id="kSave" type="button">Zet KYC</button></div></div></div>
    <div class="pdx-card"><div class="pdx-card-h">Interne notities</div><div class="pdx-card-b pdx-small">${(u.notes||[]).map(n=>`<div style="padding:4px 0;border-bottom:1px solid #eef1f7">${esc(n.t)} <span class="pdx-xs pdx-muted">— ${esc(n.by)}, ${fmtDT(n.at)}</span></div>`).join('')||'<span class="pdx-muted">Nog geen notities.</span>'}
      <div class="pdx-row" style="margin-top:8px"><input class="pdx-in" style="flex:1" id="nT" placeholder="Notitie toevoegen (alleen intern)"><button class="pdx-btn sm" id="nAdd" type="button">Toevoegen</button></div></div></div>
   </div></div>
   <div class="pdx-card"><div class="pdx-card-h"><span>Gekoppelde advertenties (${ads.length})</span><a href="advertenties.html?owner=${u.id}&tab=all" style="color:#7351c0">In moderatie →</a></div><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Titel</th><th>Type</th><th>Stad</th><th>Status</th><th>Loopt tot</th><th></th></tr></thead><tbody>${ads.map(a=>`<tr><td><b>${esc(a.title)}</b></td><td>${esc(a.type)}</td><td>${esc(a.city)}</td><td>${adB(a.status)}</td><td>${fmtD(a.expires)}</td><td>${a.listingId?`<a href="../advertentie.html?id=${a.listingId}" target="_blank" style="color:#7351c0">Bekijk</a>`:''}</td></tr>`).join('')||'<tr><td colspan="6" class="pdx-muted">Geen advertenties.</td></tr>'}</tbody></table></div></div>
   <div class="pdx-card"><div class="pdx-card-h">E-mailhistorie (gesimuleerd)</div><div class="pdx-scroll"><table class="pdx-table"><tbody>${mails.slice(0,20).map(m=>`<tr><td class="pdx-xs" style="white-space:nowrap">${fmtDT(m.at)}</td><td><span class="adm-chip">${esc(m.tpl)}</span></td><td>${esc(m.subject)}</td><td class="pdx-xs pdx-muted">${esc(m.status)}</td></tr>`).join('')||'<tr><td class="pdx-muted">Geen mails.</td></tr>'}</tbody></table></div></div>`;
  const reload=()=>R.gebruiker();
  $('#fU').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const d2=db();const x=d2.users.find(y=>y.id===u.id);
    const em=String(f.get('email')).trim().toLowerCase(); if(d2.users.some(y=>y.id!==u.id&&y.email.toLowerCase()===em))return toast('E-mailadres al in gebruik');
    const ch=[];['name','username','city','bv','status'].forEach(k=>{const v=String(f.get(k)||'');if(x[k]!==v){ch.push(k+': '+x[k]+' → '+v);x[k]=v;}});
    if(x.email!==em){ch.push('email: '+x.email+' → '+em);x.email=em;}
    if(f.get('role')&&x.role!==f.get('role')){ch.push('rol: '+x.role+' → '+f.get('role'));x.role=f.get('role');}
    const mk=!!f.get('marketing');if(x.marketing!==mk){ch.push('marketing → '+(mk?'opt-in':'opt-out'));x.marketing=mk;}
    if(x.company){x.company.name=f.get('cname')||'';if(x.company.plan!==f.get('cplan')){ch.push('pakket → '+f.get('cplan'));x.company.plan=f.get('cplan');}}
    save(d2);audit('user-edit',x.username,ch.join('; ')||'geen wijzigingen');toast('Opgeslagen');reload();};
  $('#bReset').onclick=()=>{P.mailSim(uById(u.id),'reset',{link:'https://paydates.nl/reset?token=DEMO'});audit('password-reset',u.username,'Resetmail gesimuleerd door admin');toast('Resetmail gesimuleerd (niet verzonden)');reload();};
  $('#bMail').onclick=()=>singleMail(u.id,reload);
  const bs=$('#bSus');if(bs)bs.onclick=()=>modal('Schorsen of bannen','<label class="pdx-lbl">Actie</label><select class="pdx-in" id="sA"><option value="geschorst">Tijdelijk schorsen</option><option value="verbannen">Permanent verbannen</option></select><label class="pdx-lbl" style="margin-top:8px">Reden (intern)</label><input class="pdx-in" id="sR"><label class="pdx-opt" style="margin-top:8px"><input type="checkbox" id="sM" checked> Gebruiker informeren (template “Account geschorst”, gesimuleerd)</label><label class="pdx-opt" style="margin-top:8px"><input type="checkbox" id="sP" checked> Advertenties van deze gebruiker pauzeren</label>',m=>{
    if(u.id===me.id){toast('Niet op jezelf');return false;}const r=m.querySelector('#sR').value.trim();if(!r){toast('Reden verplicht');return false;}
    const d2=db();const x=d2.users.find(y=>y.id===u.id);x.status=m.querySelector('#sA').value;x.notes=x.notes||[];x.notes.unshift({at:P.now(),by:me.username,t:x.status+': '+r});
    if(m.querySelector('#sP').checked)d2.ads.filter(a=>a.owner===u.id&&a.status==='live').forEach(a=>a.status='gepauzeerd');save(d2);
    if(m.querySelector('#sM').checked)P.mailSim(x,'ban',{});audit('user-'+x.status,x.username,r);reload();},'Bevestigen');
  const ba=$('#bAct');if(ba)ba.onclick=()=>{const d2=db();d2.users.find(y=>y.id===u.id).status='actief';save(d2);audit('user-activate',u.username,'');reload();};
  $('#bCred').onclick=()=>modal('Credits aanpassen','<label class="pdx-lbl">Aantal (negatief = afschrijven)</label><input class="pdx-in" id="mc" type="number" value="100"><label class="pdx-lbl" style="margin-top:8px">Reden</label><input class="pdx-in" id="mr" value="Handmatige correctie"><label class="pdx-opt" style="margin-top:8px"><input type="checkbox" id="mm"> Gebruiker mailen (gesimuleerd)</label>',m=>{const n=+m.querySelector('#mc').value;const r=m.querySelector('#mr').value;const d2=db();const x=d2.users.find(y=>y.id===u.id);x.credits=Math.max(0,x.credits+n);x.ledger=x.ledger||[];x.ledger.unshift({at:P.now(),delta:n,t:'Admin: '+r,bal:x.credits});save(d2);if(m.querySelector('#mm').checked&&n>0)P.mailSim(x,'credits',{credits:n});audit('credits',x.username,n+' cr · '+r);reload();});
  $('#kSave').onclick=()=>setKyc(u.id,$('#kSel').value,$('#kNote').value,reload);
  $('#nAdd').onclick=()=>{const t=$('#nT').value.trim();if(!t)return;const d2=db();const x=d2.users.find(y=>y.id===u.id);x.notes=x.notes||[];x.notes.unshift({at:P.now(),by:me.username,t});save(d2);audit('note',x.username,t);reload();};
};
})();
