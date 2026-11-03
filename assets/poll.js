/* Paydates V2 — Community polls (concept).
   Data: assets/polls-data.js (window.PD_POLLS) → samengevoegd in PDX.db().polls (localStorage 'pdx_v1').
   Stemmen: één stem per poll per browser (localStorage 'pdxPollVote_<id>'). Startaantallen = seed/demo;
   in productie komen tellingen uit /api/polls. Archief schaalt naar 100+ polls: zoeken, filters, sortering, paginering. */
(function(){
'use strict';
if(!window.PDX)return;
const {db,save,esc,fmtD}=PDX;
const pTime=PDX.pTime||(s=>Date.parse(s||'')||0);
const VK=id=>'pdxPollVote_'+id;
const myVote=id=>{try{return localStorage.getItem(VK(id))}catch(e){return null}};
const total=p=>p.options.reduce((s,o)=>s+(+o[1]||0),0);
const pct=(v,t)=>t?Math.round(v/t*1000)/10:0;
const nl=n=>Number(n||0).toLocaleString('nl-NL');
const PER=12;
const publicPolls=()=>db().polls.filter(p=>p.status==='live'||p.status==='archief');
const livePoll=()=>db().polls.filter(p=>p.status==='live').sort((a,b)=>pTime(b.start)-pTime(a.start))[0]||null;

/* ---------- live poll (homepage + bovenaan archief) ---------- */
function render(el){
  const d=db(); const p=livePoll();
  if(!p||d.flags.pollsOnHome===false&&!el.hasAttribute('data-force')){el.hidden=true;return;}
  el.hidden=false;
  const mine=myVote(p.id); const voted=mine!==null; const t=total(p);
  const lead=Math.max(...p.options.map(o=>o[1]));
  const nArch=d.polls.filter(x=>x.status==='archief').length;
  el.className='pdx-poll'+(voted?' voted':'');
  el.innerHTML=`<div class="pdx-poll-hd"><div><span class="pdx-poll-tag"><i class="fa fa-users"></i> Community poll</span>
    <div class="pdx-poll-q" id="pdxPollQ">${esc(p.q)}</div>
    <div class="pdx-poll-meta">Anoniem · ${nl(t)} stemmen · gestart ${fmtD(p.start)}</div></div>
    <i class="fa fa-square-poll-horizontal" style="font-size:28px;opacity:.55" aria-hidden="true"></i></div>
   <div class="pdx-poll-b"><div class="pdx-poll-opts" role="group" aria-labelledby="pdxPollQ">
   ${p.options.map((o,i)=>{const pc=pct(o[1],t);return `<button type="button" class="pdx-poll-o${voted&&String(i)===mine?' mine':''}${voted&&o[1]===lead?' lead':''}" data-i="${i}" ${voted?'aria-disabled="true"':''}>
     <span class="fill" style="width:${voted?pc:0}%"></span><span class="t">${esc(o[0])}</span><span class="p">${voted?pc.toLocaleString('nl-NL')+'%':'<i class="fa fa-circle-dot" style="color:#cdc1e9"></i>'}</span></button>`}).join('')}
   </div>
   <div class="pdx-poll-ft"><span>${voted?'<i class="fa fa-check-circle" style="color:#2f9e44"></i> Bedankt voor je stem! Resultaten zijn live.':'<i class="fa fa-lock"></i> Stem anoniem om de resultaten te zien.'}</span>
   ${el.hasAttribute('data-no-archive-link')?'':`<a href="polls.html">Poll-archief${nArch?' ('+nArch+')':''} <i class="fa fa-angle-right"></i></a>`}</div></div>`;
  if(!voted) el.querySelectorAll('.pdx-poll-o').forEach(b=>b.addEventListener('click',()=>{
    const d2=db(); const p2=d2.polls.find(x=>x.id===p.id); const i=+b.dataset.i; if(!p2||p2.status!=='live'||myVote(p.id)!==null)return;
    p2.options[i][1]++; save(d2); try{localStorage.setItem(VK(p.id),String(i))}catch(e){} render(el);
    requestAnimationFrame(()=>el.querySelectorAll('.fill').forEach(f=>{const w=f.style.width;f.style.width='0';requestAnimationFrame(()=>f.style.width=w)}));
    document.querySelectorAll('[data-pdx-poll-archive]').forEach(a=>a._redraw&&a._redraw());
  }));
}

/* ---------- archief: zoeken · status · categorie · sortering · paginering (URL-state) ---------- */
function archive(el){
  const U=new URLSearchParams(location.search);
  const F={q:U.get('q')||'',status:U.get('status')||'alle',cat:U.get('cat')||'',sort:U.get('sort')||'nieuw',p:Math.max(1,+U.get('p')||1)};
  const cats=()=>[...new Set(publicPolls().map(p=>p.cat).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'nl'));
  el.innerHTML=`<div class="pdx-pa-bar" role="search">
     <div class="pdx-pa-q"><i class="fa fa-magnifying-glass"></i><input type="search" id="paQ" class="pdx-in" placeholder="Zoek in vragen en antwoorden…" value="${esc(F.q)}" aria-label="Zoek polls"></div>
     <select id="paS" class="pdx-in" aria-label="Status"><option value="alle">Alle polls</option><option value="live">Nu live</option><option value="archief">Afgesloten</option></select>
     <select id="paC" class="pdx-in" aria-label="Categorie"><option value="">Alle categorieën</option>${cats().map(c=>`<option>${esc(c)}</option>`).join('')}</select>
     <select id="paO" class="pdx-in" aria-label="Sorteren"><option value="nieuw">Nieuwste eerst</option><option value="oud">Oudste eerst</option><option value="stemmen">Meeste stemmen</option><option value="az">Vraag A–Z</option></select>
   </div>
   <div class="pdx-pa-chips" id="paChips"></div>
   <div class="pdx-pa-meta" id="paMeta" aria-live="polite"></div>
   <div class="pdx-pa-grid" id="paList"></div>
   <nav class="pdx-pa-pager" id="paPager" aria-label="Paginering"></nav>`;
  const $=s=>el.querySelector(s);
  $('#paS').value=F.status; $('#paC').value=F.cat; $('#paO').value=F.sort;
  function sync(){const u=new URLSearchParams();if(F.q)u.set('q',F.q);if(F.status!=='alle')u.set('status',F.status);if(F.cat)u.set('cat',F.cat);if(F.sort!=='nieuw')u.set('sort',F.sort);if(F.p>1)u.set('p',F.p);
    const qs=u.toString();history.replaceState(null,'',location.pathname+(qs?'?'+qs:'')+location.hash);}
  function list(){const q=F.q.trim().toLowerCase();
    let L=publicPolls().filter(p=>(F.status==='alle'||p.status===F.status)&&(!F.cat||p.cat===F.cat)&&(!q||(p.q+' '+(p.cat||'')+' '+p.options.map(o=>o[0]).join(' ')).toLowerCase().includes(q)));
    const sd=p=>pTime(p.start);
    L.sort(F.sort==='oud'?(a,b)=>sd(a)-sd(b):F.sort==='stemmen'?(a,b)=>total(b)-total(a):F.sort==='az'?(a,b)=>a.q.localeCompare(b.q,'nl'):(a,b)=>(b.status==='live')-(a.status==='live')||sd(b)-sd(a));
    return L;}
  function card(p){const t=total(p);const lead=Math.max(...p.options.map(o=>o[1]));const top=p.options.find(o=>o[1]===lead)||['—',0];const mine=myVote(p.id);const live=p.status==='live';const hide=live&&mine===null;
    return `<article class="pdx-pa-card${live?' live':''}" id="poll-${esc(p.id)}">
      <div class="pdx-pa-top"><span class="pdx-badge ${live?'ok':''}">${live?'<i class="fa fa-circle" style="font-size:7px"></i> Nu live':'Afgesloten'}</span>${p.cat?`<button type="button" class="pdx-pa-cat" data-cat="${esc(p.cat)}">${esc(p.cat)}</button>`:''}</div>
      <h3 class="pdx-pa-qq">${esc(p.q)}</h3>
      <div class="pdx-xs pdx-muted">${fmtD(p.start)}${p.end?' – '+fmtD(p.end):' – heden'} · ${nl(t)} stemmen${mine!==null?' · <span style="color:#7351c0;font-weight:600"><i class="fa fa-check"></i> gestemd</span>':''}</div>
      ${hide?`<p class="pdx-small" style="margin:10px 0 0"><a href="${document.getElementById('community-poll')?'#community-poll':'index.html#community-poll'}" class="pdx-btn sm pd"><i class="fa fa-hand-pointer"></i> Stem eerst om de uitslag te zien</a></p>`:
      `<div class="pdx-pa-win"><i class="fa fa-trophy"></i><span><b>${esc(top[0])}</b> · ${pct(top[1],t).toLocaleString('nl-NL')}%</span></div>
      <details class="pdx-pa-det"><summary>Volledige uitslag</summary><div style="display:grid;gap:7px;margin-top:8px">
      ${p.options.map((o,i)=>{const pc=pct(o[1],t);return `<div><div class="pdx-between pdx-small"><span${o[1]===lead?' style="font-weight:700;color:#212529"':''}>${esc(o[0])}${String(i)===mine?' <span style="color:#7351c0;font-size:11px">✓ jouw stem</span>':''}</span><span style="font-weight:700;color:#5b3ba3">${pc.toLocaleString('nl-NL')}%</span></div><div class="pdx-bar" style="margin-top:3px"><i style="width:${pc}%"></i></div></div>`}).join('')}
      </div></details>`}
    </article>`;}
  function pager(pages){if(pages<=1)return '';const cur=F.p;const set=new Set([1,pages,cur-1,cur,cur+1,cur-2,cur+2].filter(n=>n>=1&&n<=pages));const ns=[...set].sort((a,b)=>a-b);
    let h=`<button type="button" class="pdx-btn sm" data-p="${cur-1}" ${cur>1?'':'disabled'} aria-label="Vorige">‹ Vorige</button>`;let prev=0;
    ns.forEach(n=>{if(n-prev>1)h+='<span class="pdx-pa-gap">…</span>';h+=`<button type="button" class="pdx-btn sm${n===cur?' pd':''}" data-p="${n}" ${n===cur?'aria-current="page"':''}>${n}</button>`;prev=n;});
    return h+`<button type="button" class="pdx-btn sm" data-p="${cur+1}" ${cur<pages?'':'disabled'} aria-label="Volgende">Volgende ›</button>`;}
  function draw(scroll){
    const L=list(); const pages=Math.max(1,Math.ceil(L.length/PER)); if(F.p>pages)F.p=pages;
    const slice=L.slice((F.p-1)*PER,F.p*PER); const all=publicPolls().length;
    $('#paMeta').innerHTML=L.length?`<b>${nl(L.length)}</b> ${L.length===1?'poll':'polls'}${L.length!==all?' van '+nl(all):''} · pagina ${F.p} van ${pages}`:'';
    const chips=[];if(F.q)chips.push(['q','“'+F.q+'”']);if(F.status!=='alle')chips.push(['status',F.status==='live'?'Nu live':'Afgesloten']);if(F.cat)chips.push(['cat',F.cat]);
    $('#paChips').innerHTML=chips.map(c=>`<button type="button" class="pdx-pa-chip" data-clr="${c[0]}">${esc(c[1])} <i class="fa fa-xmark"></i></button>`).join('')+(chips.length>1?'<button type="button" class="pdx-pa-chip ghost" data-clr="all">Alles wissen</button>':'');
    $('#paList').innerHTML=slice.length?slice.map(card).join(''):`<div class="pdx-card pdx-card-b pdx-muted" style="grid-column:1/-1;text-align:center">Geen polls gevonden${F.q?' voor “'+esc(F.q)+'”':''}. <button type="button" class="pdx-btn sm" data-clr="all" style="margin-left:6px">Filters wissen</button></div>`;
    $('#paPager').innerHTML=pager(pages);
    sync();
    if(scroll)el.scrollIntoView({behavior:'smooth',block:'start'});
  }
  let t; $('#paQ').addEventListener('input',e=>{clearTimeout(t);t=setTimeout(()=>{F.q=e.target.value;F.p=1;draw();},150);});
  $('#paS').onchange=e=>{F.status=e.target.value;F.p=1;draw();};
  $('#paC').onchange=e=>{F.cat=e.target.value;F.p=1;draw();};
  $('#paO').onchange=e=>{F.sort=e.target.value;F.p=1;draw();};
  el.addEventListener('click',e=>{
    const pb=e.target.closest('[data-p]');if(pb&&!pb.disabled){F.p=+pb.dataset.p;draw(true);return;}
    const cb=e.target.closest('[data-cat]');if(cb){F.cat=cb.dataset.cat;$('#paC').value=F.cat;F.p=1;draw(true);return;}
    const cl=e.target.closest('[data-clr]');if(cl){const k=cl.dataset.clr;if(k==='q'||k==='all'){F.q='';$('#paQ').value='';}if(k==='status'||k==='all'){F.status='alle';$('#paS').value='alle';}if(k==='cat'||k==='all'){F.cat='';$('#paC').value='';}F.p=1;draw();}
  });
  /* deeplink polls.html#poll-<id>: spring naar de juiste pagina en open de uitslag */
  const h=decodeURIComponent(location.hash||'');
  if(/^#poll-/.test(h)){const id=h.slice(6);const L=list();let i=L.findIndex(p=>p.id===id);
    if(i<0){F.q='';F.status='alle';F.cat='';$('#paQ').value='';$('#paS').value='alle';$('#paC').value='';i=list().findIndex(p=>p.id===id);}
    if(i>=0)F.p=Math.floor(i/PER)+1;}
  el._redraw=()=>draw(false);
  draw(false);
  if(/^#poll-/.test(h)){const c=document.getElementById(h.slice(1));if(c){const dt=c.querySelector('details');if(dt)dt.open=true;c.classList.add('hl');setTimeout(()=>c.scrollIntoView({behavior:'smooth',block:'center'}),60);}}
}
document.querySelectorAll('[data-pdx-poll]').forEach(render);
document.querySelectorAll('[data-pdx-poll-archive]').forEach(archive);
window.PDX_POLL={render,archive,total,livePoll};
})();
