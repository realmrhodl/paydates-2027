/* Paydates V2 admin — e-mail, BV, betalingen, instellingen, audit, gap (concept) */
(function(){
'use strict';
const A=window.PDXA; if(!A)return;
const {P,$,$$,qs,me,modal,dl,csv,audit,uById,roleB,stB,kycB,adB,main,head,kpi,R}=A; const {db,save,esc,fmtD,fmtDT,eur,toast}=P;

/* ---------- e-mail ---------- */
const SEG={
  alle:['Alle actieve gebruikers',u=>u.status==='actief'],
  adverteerders:['Adverteerders',u=>u.role==='adverteerder'&&u.status==='actief'],
  bedrijven:['Bedrijven / clubs',u=>u.role==='bedrijf'&&u.status==='actief'],
  klanten:['Klanten',u=>u.role==='klant'&&u.status==='actief'],
  kyc_open:['KYC niet afgerond (adverteerders)',u=>['adverteerder','bedrijf'].includes(u.role)&&u.kyc!=='goedgekeurd'&&u.status==='actief'],
  weinig_credits:['Adverteerders < 100 credits',u=>u.role==='adverteerder'&&u.credits<100&&u.status==='actief'],
  inactief30:['30+ dagen niet ingelogd',u=>u.status==='actief'&&Date.now()-new Date(u.lastLogin)>30*864e5],
  onbevestigd:['E-mail niet bevestigd',u=>u.status==='onbevestigd'],
  selectie:['Selectie uit gebruikerslijst',null]
};
R.email=function(){
  let tab=location.hash.slice(1)||'templates';
  function draw(){const d=db();
    const tabs=[['templates','Templates'],['single','Losse mail'],['mass','Massamail'],['log','Verzendlog'],['optout','Opt-out']];
    let body='';
    if(tab==='templates')body=`<div class="pdx-grid pdx-g2">${d.mail.templates.map(t=>`<form class="pdx-card" data-tpl="${t.k}"><div class="pdx-card-h"><span>${esc(t.t)} <span class="adm-chip">${t.k}</span></span><button class="pdx-btn sm" type="button" data-prev="${t.k}">Voorbeeld</button></div><div class="pdx-card-b pdx-f"><div><label class="pdx-lbl">Onderwerp</label><input class="pdx-in" name="subject" value="${esc(t.subject)}"></div><div><label class="pdx-lbl">Tekst</label><textarea class="pdx-in" name="body" style="min-height:130px">${esc(t.body)}</textarea></div><div><button class="pdx-btn sm pd">Opslaan</button></div></div></form>`).join('')}</div>
      <p class="pdx-xs pdx-muted">Variabelen: {{naam}} {{email}} {{link}} {{notitie}} {{credits}} {{advertentie}} {{bedrijf}} {{afmelden}}. Afzender in productie: support@paydates.nl (nooit info@).</p>`;
    if(tab==='single')body=`<div class="pdx-card pdx-card-b pdx-f"><div><label class="pdx-lbl">Ontvanger (e-mail of gebruikersnaam)</label><input class="pdx-in" id="sTo" list="ulist" placeholder="bijv. adverteerder@demo.paydates.test"><datalist id="ulist">${d.users.slice(0,300).map(u=>`<option value="${esc(u.email)}">${esc(u.username)}</option>`).join('')}</datalist></div><div><button class="pdx-btn pd" id="sGo">Mail opstellen</button></div></div>`;
    if(tab==='mass'){const selIds=JSON.parse(sessionStorage.getItem('pdxMailSel')||'[]');
      body=`<div class="pdx-demo"><i class="fa fa-flask"></i><div><b>Massamail wordt nooit echt verzonden in dit concept.</b> Verzending wordt alleen gesimuleerd en gelogd. In productie: via ESP (met DKIM/SPF/DMARC), afmeldlink verplicht, alleen opt-in voor marketing.</div></div>
      <div class="pdx-grid pdx-g2"><div class="pdx-card pdx-card-b pdx-f"><div><label class="pdx-lbl">Segment</label><select class="pdx-in" id="mSeg">${Object.entries(SEG).map(([k,s])=>`<option value="${k}" ${k==='selectie'&&selIds.length?'selected':''}>${s[0]}${k==='selectie'?' ('+selIds.length+')':''}</option>`).join('')}</select></div>
       <div><label class="pdx-lbl">Soort</label><select class="pdx-in" id="mKind"><option value="marketing">Marketing (alleen opt-in, met afmeldlink)</option><option value="service">Service / transactioneel (iedereen in segment)</option></select></div>
       <div><label class="pdx-lbl">Campagnenaam</label><input class="pdx-in" id="mName" value="Campagne ${new Date().toLocaleDateString('nl-NL')}"></div>
       <div><label class="pdx-lbl">Template (optioneel)</label><select class="pdx-in" id="mTpl"><option value="">—</option>${d.mail.templates.map(t=>`<option value="${t.k}">${esc(t.t)}</option>`).join('')}</select></div>
       <div><label class="pdx-lbl">Onderwerp</label><input class="pdx-in" id="mSub"></div><div><label class="pdx-lbl">Bericht</label><textarea class="pdx-in" id="mBody" style="min-height:160px">Hoi {{naam}},\n\n\n\nGroet,\nTeam Paydates\n\nAfmelden: {{afmelden}}</textarea></div></div>
       <div style="display:grid;gap:16px;align-content:start"><div class="pdx-card pdx-card-b" id="mSum"></div><div class="pdx-card"><div class="pdx-card-h">Voorbeeld (eerste ontvanger)</div><div class="pdx-card-b"><pre class="pdx-pre" id="mPrev"></pre></div></div>
       <div class="pdx-card pdx-card-b pdx-f"><label class="pdx-lbl">Typ <b>SIMULEER</b> om de (gesimuleerde) verzending te starten</label><input class="pdx-in" id="mConf" autocomplete="off"><button class="pdx-btn pd" id="mGo"><i class="fa fa-paper-plane"></i> Simuleer verzending</button></div></div></div>`;}
    if(tab==='log')body=`<div class="pdx-card"><div class="pdx-card-h">Campagnes</div><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Naam</th><th>Segment</th><th>Onderwerp</th><th>Ontvangers</th><th>Uitgesloten (opt-out)</th><th>Datum</th><th>Status</th></tr></thead><tbody>${d.mail.campaigns.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.segment)}</td><td>${esc(c.subject)}</td><td>${c.recipients}</td><td>${c.excluded}</td><td class="pdx-xs">${fmtDT(c.created)}</td><td><span class="pdx-badge warn">${esc(c.status)}</span></td></tr>`).join('')}</tbody></table></div></div>
      <div class="pdx-card"><div class="pdx-card-h"><span>Losse mails (laatste 100 van ${d.mail.log.length})</span><button class="pdx-btn sm" id="lClr">Log legen</button></div><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Datum</th><th>Aan</th><th>Template</th><th>Onderwerp</th><th>Status</th></tr></thead><tbody>${d.mail.log.slice(0,100).map(m=>`<tr data-m="${m.id}" style="cursor:pointer"><td class="pdx-xs" style="white-space:nowrap">${fmtDT(m.at)}</td><td class="pdx-small">${esc(m.to)}</td><td><span class="adm-chip">${esc(m.tpl)}</span></td><td>${esc(m.subject)}</td><td class="pdx-xs pdx-muted">${esc(m.status)}</td></tr>`).join('')||'<tr><td colspan="5" class="pdx-muted">Nog niets.</td></tr>'}</tbody></table></div></div>`;
    if(tab==='optout'){const L=d.users.filter(u=>!u.marketing);body=`<div class="pdx-card"><div class="pdx-card-h"><span>${L.length} gebruikers met marketing opt-out</span><span class="pdx-xs pdx-muted">Worden altijd uitgesloten van marketing-massamail</span></div><div class="pdx-scroll"><table class="pdx-table"><tbody>${L.map(u=>`<tr><td><a href="gebruiker.html?id=${u.id}" style="color:#7351c0">${esc(u.username)}</a></td><td class="pdx-small">${esc(u.email)}</td><td>${roleB(u.role)}</td><td><button class="pdx-btn sm" data-in="${u.id}">Opt-in zetten (alleen op verzoek)</button></td></tr>`).join('')}</tbody></table></div></div>`;}
    main().innerHTML=head('E-mail & massamail','Alle verzending is <b>gesimuleerd</b>: er gaat geen enkele echte mail de deur uit (flag “Echte e-mail” staat uit en is vergrendeld).')+
      `<div class="adm-tabs">${tabs.map(t=>`<a href="#${t[0]}" data-t="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}</a>`).join('')}</div>${body}`;
    $$('[data-t]').forEach(t=>t.onclick=e=>{e.preventDefault();tab=t.dataset.t;history.replaceState(null,'','#'+tab);draw();});
    $$('form[data-tpl]').forEach(f=>f.onsubmit=e=>{e.preventDefault();const d2=db();const t=d2.mail.templates.find(x=>x.k===f.dataset.tpl);t.subject=f.subject.value;t.body=f.body.value;save(d2);audit('template-edit',t.k,'');toast('Template opgeslagen');});
    $$('[data-prev]').forEach(b=>b.onclick=()=>{const t=db().mail.templates.find(x=>x.k===b.dataset.prev);const u=uById('u_demo');modal('Voorbeeld: '+esc(t.t),`<div class="pdx-xs pdx-muted">Van: Paydates.nl &lt;support@paydates.nl&gt; · Aan: ${esc(u.email)}</div><h3 style="margin:8px 0;font-size:16px">${esc(P.fill(t.subject,u,{link:'https://paydates.nl/…',notitie:'(reden)',credits:500,advertentie:'(titel)',bedrijf:'(bedrijf)'}))}</h3><pre class="pdx-pre">${esc(P.fill(t.body,u,{link:'https://paydates.nl/…',notitie:'(reden)',credits:500,advertentie:'(titel)',bedrijf:'(bedrijf)'}))}</pre>`);});
    const sGo=$('#sGo');if(sGo)sGo.onclick=()=>{const v=$('#sTo').value.trim().toLowerCase();const u=db().users.find(x=>x.email.toLowerCase()===v||x.username.toLowerCase()===v);if(!u)return toast('Gebruiker niet gevonden');A.singleMail(u.id,()=>{tab='log';draw();});};
    if(tab==='mass'){
      const calc=()=>{const d2=db();const k=$('#mSeg').value;const kind=$('#mKind').value;let base=k==='selectie'?d2.users.filter(u=>JSON.parse(sessionStorage.getItem('pdxMailSel')||'[]').includes(u.id)):d2.users.filter(SEG[k][1]);
        base=base.filter(u=>u.status!=='verbannen');const excl=kind==='marketing'?base.filter(u=>!u.marketing):[];const to=base.filter(u=>!excl.includes(u));return {to,excl,k,kind};};
      const upd=()=>{const c=calc();$('#mSum').innerHTML=`<div class="pdx-small" style="display:grid;gap:4px"><div>Segment: <b>${esc(SEG[c.k][0])}</b></div><div>Ontvangers: <b style="font-size:20px;color:#7351c0">${c.to.length}</b></div><div>Uitgesloten (marketing opt-out): <b>${c.excl.length}</b></div><div>Verbannen accounts: altijd uitgesloten</div>${c.kind==='marketing'&&!/\{\{afmelden\}\}/.test($('#mBody').value)?'<div style="color:#c92a2a"><b>Let op:</b> marketingmail zonder {{afmelden}}-link wordt geblokkeerd.</div>':''}</div>`;
        const u=c.to[0];$('#mPrev').textContent=u?P.fill($('#mSub').value,u,{})+'\n\n'+P.fill($('#mBody').value,u,{}):'(geen ontvangers)';};
      ['#mSeg','#mKind','#mSub','#mBody'].forEach(s=>$(s).addEventListener('input',upd));$('#mSeg').onchange=upd;$('#mKind').onchange=upd;
      $('#mTpl').onchange=e=>{const t=db().mail.templates.find(x=>x.k===e.target.value);if(t){$('#mSub').value=t.subject;$('#mBody').value=t.body+($('#mKind').value==='marketing'?'\n\nAfmelden: {{afmelden}}':'');}upd();};
      $('#mBody').value=$('#mBody').value.replace(/\\n/g,'\n');upd();
      $('#mGo').onclick=()=>{const c=calc();if($('#mConf').value.trim()!=='SIMULEER')return toast('Typ SIMULEER ter bevestiging');if(!$('#mSub').value.trim())return toast('Onderwerp ontbreekt');
        if(c.kind==='marketing'&&!/\{\{afmelden\}\}/.test($('#mBody').value))return toast('Afmeldlink {{afmelden}} verplicht bij marketing');if(!c.to.length)return toast('Geen ontvangers');
        const d2=db();const camp={id:P.uid('c'),name:$('#mName').value,segment:SEG[c.k][0]+' · '+c.kind,subject:$('#mSub').value,body:$('#mBody').value,created:P.now(),status:'gesimuleerd (niet verzonden)',recipients:c.to.length,excluded:c.excl.length,by:me.username};
        d2.mail.campaigns.unshift(camp);c.to.slice(0,200).forEach(u=>d2.mail.log.unshift({id:P.uid('m'),to:u.email,userId:u.id,tpl:'campagne:'+camp.id,subject:P.fill(camp.subject,u,{}),body:P.fill(camp.body,u,{}),at:P.now(),status:'gesimuleerd (niet verzonden)'}));d2.mail.log=d2.mail.log.slice(0,1000);save(d2);
        sessionStorage.removeItem('pdxMailSel');audit('mass-mail-sim',camp.name,c.to.length+' ontvangers, '+c.excl.length+' uitgesloten');toast('Gesimuleerd: '+c.to.length+' ontvangers (niets verzonden)');tab='log';history.replaceState(null,'','#log');draw();};
    }
    $$('tr[data-m]').forEach(r=>r.onclick=()=>{const m=db().mail.log.find(x=>x.id===r.dataset.m);modal(esc(m.subject),`<div class="pdx-xs pdx-muted">Aan ${esc(m.to)} · ${fmtDT(m.at)} · ${esc(m.status)}</div><pre class="pdx-pre">${esc(m.body)}</pre>`);});
    const lc=$('#lClr');if(lc)lc.onclick=()=>{if(!confirm('Mail-log legen?'))return;const d2=db();d2.mail.log=[];save(d2);audit('maillog-clear','','');draw();};
    $$('[data-in]').forEach(b=>b.onclick=()=>{const d2=db();const u=d2.users.find(x=>x.id===b.dataset.in);u.marketing=true;save(d2);audit('opt-in',u.username,'handmatig door admin');draw();});
  }
  draw();
};

/* ---------- BV & eigendom ---------- */
R.bv=function(){
  function draw(){const d=db();
    main().innerHTML=head('BV & eigendom','Welke rechtspersoon is eigenaar/contractpartij. Standaard: <b>Forest Road B.V.</b> HighClass is een placeholder; gegevens worden niet verzonnen.',`<button class="pdx-btn pd" id="nb"><i class="fa fa-plus"></i> BV toevoegen</button>`)+
    `<div class="pdx-grid pdx-g3">${d.bv.map(b=>`<form class="pdx-card" data-bv="${b.id}"><div class="pdx-card-h"><span>${esc(b.legal)}</span>${d.ownership.default===b.id?'<span class="pdx-badge ok">standaard</span>':`<button type="button" class="pdx-btn sm" data-def="${b.id}">Maak standaard</button>`}</div><div class="pdx-card-b pdx-f">
      ${[['legal','Statutaire naam'],['trade','Handelsnaam'],['kvk','KvK-nummer'],['btw','BTW-nummer'],['address','Adres'],['email','Contact e-mail'],['invoicePrefix','Factuurprefix']].map(([k,l])=>`<div><label class="pdx-lbl">${l}</label><input class="pdx-in" name="${k}" value="${esc(b[k]||'')}" ${k==='email'?'type="email"':''}></div>`).join('')}
      <div><label class="pdx-lbl">Merken / onderdelen (komma’s)</label><input class="pdx-in" name="brands" value="${esc((b.brands||[]).join(', '))}"></div><div class="pdx-xs pdx-muted">${esc(b.note||'')}</div>
      <div class="pdx-row"><button class="pdx-btn sm pd">Opslaan</button><span class="pdx-xs pdx-muted">${d.users.filter(u=>u.bv===b.id).length} gebruikers gekoppeld</span></div></div></form>`).join('')}</div>
    <div class="pdx-card"><div class="pdx-card-h">Eigendomsmatrix</div><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Onderdeel</th><th>Eigenaar / contractpartij</th></tr></thead><tbody>${d.ownership.assets.map((a,i)=>`<tr><td><b>${esc(a.k)}</b></td><td><select class="pdx-in" style="max-width:340px" data-own="${i}">${d.bv.map(b=>`<option value="${b.id}" ${a.bv===b.id?'selected':''}>${esc(b.legal)}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div></div>
    <p class="pdx-xs pdx-muted">Bron: bedrijfsinformatie.html (Forest Road B.V., KvK 97957232, BTW NL868303550B01, Herengracht 449A, 1017 BR Amsterdam). Wijzigingen hier passen de publieke pagina niet aan (concept).</p>`;
    $$('form[data-bv]').forEach(f=>f.onsubmit=e=>{e.preventDefault();const d2=db();const b=d2.bv.find(x=>x.id===f.dataset.bv);
      if(f.email.value&&/^info@/i.test(f.email.value))return toast('Gebruik support@, niet info@');
      ['legal','trade','kvk','btw','address','email','invoicePrefix'].forEach(k=>b[k]=f[k].value.trim());b.brands=f.brands.value.split(',').map(s=>s.trim()).filter(Boolean);save(d2);audit('bv-edit',b.legal,'');toast('Opgeslagen');draw();});
    $$('[data-def]').forEach(x=>x.onclick=()=>{if(!confirm('Standaard-BV voor nieuwe accounts wijzigen?'))return;const d2=db();d2.ownership.default=x.dataset.def;save(d2);audit('bv-default',x.dataset.def,'');draw();});
    $$('[data-own]').forEach(s=>s.onchange=()=>{const d2=db();const a=d2.ownership.assets[+s.dataset.own];a.bv=s.value;save(d2);audit('ownership',a.k,'→ '+s.value);toast('Opgeslagen');});
    $('#nb').onclick=()=>modal('BV toevoegen','<label class="pdx-lbl">Statutaire naam</label><input class="pdx-in" id="nl">',m=>{const n=m.querySelector('#nl').value.trim();if(!n)return false;const d2=db();d2.bv.push({id:P.uid('bv'),legal:n,trade:'',kvk:'',btw:'',address:'',email:'support@paydates.nl',invoicePrefix:'',brands:[],note:'Toegevoegd in admin (concept).'});save(d2);audit('bv-new',n,'');draw();});
  }
  draw();
};

/* ---------- betalingen & tarieven ---------- */
R.betalingen=function(){
  function draw(){const d=db();const p=d.pay;const r=p.rates;
    main().innerHTML=head('Betalingen & tarieven','Configuratie van betaalmethodes, creditbundels en prijzen. <b>Betalingen staan uit</b> tot goedkeuring; geen bunq- of PSP-koppeling actief.')+
    `<div class="pdx-demo"><i class="fa fa-lock"></i><div>Live betalingen: <b>${d.flags.paymentsLive?'AAN':'UIT (vergrendeld)'}</b>. Activeren pas na: contract PSP/bunq, webhook-verificatie, facturatie per BV, btw-regels, terugbetaalbeleid en akkoord van Stefan.</div></div>
    <div class="pdx-card"><div class="pdx-card-h">Betaalmethodes</div><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Aan</th><th>Methode</th><th>Min €</th><th>Max €</th><th>Via</th></tr></thead><tbody>${p.methods.map((m,i)=>`<tr><td><label class="pdx-switch"><input type="checkbox" data-mon="${i}" ${m.on?'checked':''}><span></span></label></td><td><b>${esc(m.t)}</b></td><td><input class="pdx-in" style="width:80px" type="number" data-mmin="${i}" value="${m.min}"></td><td><input class="pdx-in" style="width:90px" type="number" data-mmax="${i}" value="${m.max}"></td><td class="pdx-xs pdx-muted">${esc(m.via)}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="pdx-grid pdx-g2"><div class="pdx-card"><div class="pdx-card-h"><span>Creditbundels</span><span class="pdx-xs pdx-muted">1 € = ${r.credPerEur} credits</span></div><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Prijs</th><th>Credits</th><th>Bonus</th><th>Totaal</th></tr></thead><tbody>${p.packs.map((k,i)=>`<tr><td>${eur(k.eur)}</td><td>${k.credits}</td><td><input class="pdx-in" style="width:80px" type="number" data-bonus="${i}" value="${k.bonus||0}"></td><td><b>${k.credits+(k.bonus||0)}</b></td></tr>`).join('')}</tbody></table></div></div>
     <form class="pdx-card" id="fR"><div class="pdx-card-h">Tarieven (credits / €)</div><div class="pdx-card-b pdx-f two">
      ${[['credPerEur','Credits per €'],['bump','Bump (credits)'],['topDay','TOP per dag (credits)'],['vip7','VIP 7 dagen (credits)'],['chatpass24','Chatpas 24 uur (credits)'],['smsCallEur','SMS/bellen (€)'],['smsCallCredits','SMS/bellen (credits)'],['btcMinEur','Bitcoin minimum (€)'],['sponsorWeek','Sponsorship per week (€)']].map(([k,l])=>`<div><label class="pdx-lbl">${l}</label><input class="pdx-in" type="number" name="${k}" value="${r[k]}"></div>`).join('')}
      <div class="full"><button class="pdx-btn pd">Tarieven opslaan</button></div></div></form></div>
    <div class="pdx-grid pdx-g2"><div class="pdx-card"><div class="pdx-card-h">Clubpakketten (per maand)</div><div class="pdx-card-b" style="display:grid;gap:10px">${p.clubPlans.map((c,i)=>`<div class="pdx-between"><div><b>${esc(c.t)}</b><div class="pdx-xs pdx-muted">${c.features.map(esc).join(' · ')}</div></div><input class="pdx-in" style="width:90px" type="number" data-plan="${i}" value="${c.eur}"></div>`).join('')}</div></div>
     <div class="pdx-card"><div class="pdx-card-h">Banners (per maand)</div><div class="pdx-card-b" style="display:grid;gap:10px">${p.banners.map((b,i)=>`<div class="pdx-between"><b>${esc(b.t)}</b><input class="pdx-in" style="width:90px" type="number" data-ban="${i}" value="${b.eur}"></div>`).join('')}<div class="pdx-between"><b>Sponsorship (exclusief, per week)</b><span>${eur(r.sponsorWeek)}</span></div></div></div></div>
    <div class="pdx-card"><div class="pdx-card-h">Recente creditmutaties (demo)</div><div class="pdx-scroll"><table class="pdx-table"><tbody>${d.users.flatMap(u=>(u.ledger||[]).map(l=>Object.assign({u:u.username},l))).sort((a,b)=>b.at<a.at?-1:1).slice(0,25).map(l=>`<tr><td class="pdx-xs">${fmtDT(l.at)}</td><td>${esc(l.u)}</td><td>${esc(l.t)}</td><td style="text-align:right;color:${l.delta<0?'#c92a2a':'#2b8a3e'}"><b>${l.delta>0?'+':''}${l.delta}</b></td></tr>`).join('')||'<tr><td class="pdx-muted">Nog geen mutaties.</td></tr>'}</tbody></table></div></div>`;
    const upd=(fn,what)=>{const d2=db();fn(d2.pay);save(d2);audit('pay-edit',what,'');toast('Opgeslagen');};
    $$('[data-mon]').forEach(x=>x.onchange=()=>upd(p=>p.methods[+x.dataset.mon].on=x.checked,'methode'));
    $$('[data-mmin]').forEach(x=>x.onchange=()=>upd(p=>p.methods[+x.dataset.mmin].min=+x.value,'methode-min'));
    $$('[data-mmax]').forEach(x=>x.onchange=()=>upd(p=>p.methods[+x.dataset.mmax].max=+x.value,'methode-max'));
    $$('[data-bonus]').forEach(x=>x.onchange=()=>{upd(p=>p.packs[+x.dataset.bonus].bonus=Math.max(0,+x.value),'bundel-bonus');draw();});
    $$('[data-plan]').forEach(x=>x.onchange=()=>upd(p=>p.clubPlans[+x.dataset.plan].eur=Math.max(0,+x.value),'clubpakket'));
    $$('[data-ban]').forEach(x=>x.onchange=()=>upd(p=>p.banners[+x.dataset.ban].eur=Math.max(0,+x.value),'banner'));
    $('#fR').onsubmit=e=>{e.preventDefault();const f=e.target;upd(p=>{Object.keys(p.rates).forEach(k=>{if(f[k])p.rates[k]=Math.max(0,+f[k].value);});p.packs.forEach(k=>k.credits=k.eur*p.rates.credPerEur);},'tarieven');draw();};
  }
  draw();
};

/* ---------- instellingen & flags ---------- */
R.instellingen=function(){
  const LOCK={paymentsLive:'Vereist PSP/bunq-contract + akkoord Stefan',realEmail:'Vereist ESP + SPF/DKIM/DMARC + akkoord',kycProvider:'Vereist contract KYC-provider + DPIA',clubsPublishUnverified:'Niet toegestaan: geen clubfeiten als echt publiceren zonder verificatie'};
  const LBL={paymentsLive:'Live betalingen',realEmail:'Echte e-mailverzending',kycProvider:'KYC-provider gekoppeld',clubsPublishUnverified:'Ongeverifieerde clubs publiceren',showNuOpenOnlyWithHours:'“Nu open” alleen bij bekende openingstijden',parenclubsSeparate:'Parenclubs apart houden',pollsOnHome:'Community poll op homepage',registrationOpen:'Registratie open',maintenance:'Onderhoudsmodus (alleen concept-vlag)',chatEnabled:'Paydates Chat aan',clubClaims:'Clubs kunnen profiel claimen'};
  function draw(){const d=db();
    main().innerHTML=head('Instellingen & feature flags','Vergrendelde flags kunnen in dit concept niet aangezet worden.')+
    `<div class="pdx-grid pdx-g2"><div class="pdx-card"><div class="pdx-card-h">Feature flags</div><div class="pdx-card-b" style="display:grid;gap:10px">${Object.keys(d.flags).map(k=>`<div class="pdx-between"><div><b class="pdx-small">${esc(LBL[k]||k)}</b>${LOCK[k]?`<div class="adm-lock"><i class="fa fa-lock"></i> ${esc(LOCK[k])}</div>`:''}</div><label class="pdx-switch"><input type="checkbox" data-f="${k}" ${d.flags[k]?'checked':''} ${LOCK[k]?'disabled':''}><span></span></label></div>`).join('')}</div></div>
     <form class="pdx-card" id="fS"><div class="pdx-card-h">Algemeen</div><div class="pdx-card-b pdx-f">
      <div><label class="pdx-lbl">Sitenaam</label><input class="pdx-in" name="siteName" value="${esc(d.settings.siteName)}"></div>
      <div><label class="pdx-lbl">Support e-mail</label><input class="pdx-in" type="email" name="supportEmail" value="${esc(d.settings.supportEmail)}"></div>
      <div><label class="pdx-lbl">Minimumleeftijd adverteerders</label><select class="pdx-in" name="minAgeAdvertiser">${[18,21].map(n=>`<option ${d.settings.minAgeAdvertiser===n?'selected':''}>${n}</option>`).join('')}</select></div>
      <div><label class="pdx-lbl">Looptijd advertentie (dagen)</label><input class="pdx-in" type="number" name="adDays" value="${d.settings.adDays}"></div>
      <label class="pdx-opt"><input type="checkbox" name="modRequired" ${d.settings.modRequired?'checked':''}> Moderatie verplicht voor nieuwe/gewijzigde advertenties</label>
      <button class="pdx-btn pd">Opslaan</button></div></form></div>
    <div class="pdx-card"><div class="pdx-card-h">Demo-data</div><div class="pdx-card-b pdx-row"><button class="pdx-btn" id="ex"><i class="fa fa-download"></i> Export demo-database (JSON)</button><button class="pdx-btn red" id="rs"><i class="fa fa-rotate"></i> Demo-data resetten</button><span class="pdx-xs pdx-muted">Alleen localStorage van deze browser. Er is geen productiedatabase gekoppeld.</span></div></div>`;
    $$('[data-f]').forEach(x=>x.onchange=()=>{if(LOCK[x.dataset.f]){x.checked=false;return;}const d2=db();d2.flags[x.dataset.f]=x.checked;save(d2);audit('flag',x.dataset.f,String(x.checked));toast('Opgeslagen');});
    $('#fS').onsubmit=e=>{e.preventDefault();const f=e.target;if(/^info@/i.test(f.supportEmail.value))return toast('Gebruik support@, niet info@');const d2=db();d2.settings.siteName=f.siteName.value;d2.settings.supportEmail=f.supportEmail.value;d2.settings.minAgeAdvertiser=+f.minAgeAdvertiser.value;d2.settings.adDays=Math.max(1,+f.adDays.value);d2.settings.modRequired=f.modRequired.checked;save(d2);audit('settings','algemeen','');toast('Opgeslagen');};
    $('#ex').onclick=()=>{const d2=db();const c=JSON.parse(JSON.stringify(d2));c.users.forEach(u=>delete u.pw);dl('paydates-demo-db.json',JSON.stringify(c,null,2));audit('export','demo-db','');};
    $('#rs').onclick=()=>{if(prompt('Typ RESET om alle demo-data in deze browser opnieuw te seeden')!=='RESET')return;const keep=me.email;P.reset();const u=db().users.find(x=>x.email===keep);if(u)localStorage.setItem('pdx_session',JSON.stringify({id:u.id,at:P.now()}));else localStorage.removeItem('pdx_session');P.audit('reset','demo-database','');location.reload();};
  }
  draw();
};

/* ---------- auditlog ---------- */
R.audit=function(){
  let q='';function draw(){const d=db();const L=d.audit.filter(a=>!q||[a.actor,a.action,a.target,a.detail].join(' ').toLowerCase().includes(q));
    main().innerHTML=head('Auditlog','Wie deed wat, wanneer (laatste 500 acties, deze browser). In productie: append-only, server-side, niet te wijzigen door admins.',`<button class="pdx-btn" id="ex"><i class="fa fa-file-csv"></i> CSV</button>`)+
    `<div class="pdx-card"><div class="pdx-card-h"><input class="pdx-in" style="max-width:320px" id="q" placeholder="Filter…" value="${esc(q)}"><span class="pdx-xs pdx-muted">${L.length} regels</span></div><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Tijd</th><th>Wie</th><th>Actie</th><th>Object</th><th>Detail</th></tr></thead><tbody>${L.map(a=>`<tr><td class="pdx-xs" style="white-space:nowrap">${fmtDT(a.at)}</td><td><b>${esc(a.actor)}</b></td><td><span class="adm-chip">${esc(a.action)}</span></td><td>${esc(a.target)}</td><td class="pdx-small pdx-muted">${esc(a.detail)}</td></tr>`).join('')}</tbody></table></div></div>`;
    $('#q').oninput=e=>{q=e.target.value.toLowerCase();const p=e.target.selectionStart;draw();const n=$('#q');n.focus();n.setSelectionRange(p,p);};
    $('#ex').onclick=()=>dl('paydates-audit-demo.csv',csv([['tijd','wie','actie','object','detail']].concat(L.map(a=>[a.at,a.actor,a.action,a.target,a.detail]))),'text/csv');}
  draw();
};

/* ---------- gap-analyse ---------- */
R.gap=function(){const G=window.PDX_GAP||[];const pc={P0:'bad',P1:'warn',P2:''};const sc={'in concept':'ok','half':'warn','ontbreekt':'bad'};
  main().innerHTML=head('Gap-analyse','Wat staat er in dit concept, wat is half, wat ontbreekt voor productie. Volledige tekst: admin/README-GAP.md.')+
  ['P0','P1','P2'].map(p=>`<div class="pdx-card"><div class="pdx-card-h"><span><span class="pdx-badge ${pc[p]}">${p}</span> ${p==='P0'?'Blokkerend voor livegang':p==='P1'?'Kort na livegang':'Later / nice-to-have'}</span></div><div class="pdx-scroll"><table class="pdx-table"><thead><tr><th>Onderdeel</th><th>Status</th><th>Wat is nodig</th></tr></thead><tbody>${G.filter(g=>g.p===p).map(g=>`<tr><td><b>${esc(g.t)}</b></td><td><span class="pdx-badge ${sc[g.s]||''}">${esc(g.s)}</span></td><td class="pdx-small">${esc(g.d)}</td></tr>`).join('')}</tbody></table></div></div>`).join('');};
})();
