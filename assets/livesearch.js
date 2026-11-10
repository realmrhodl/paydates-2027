/* Paydates V2 — live zoeken (typeahead) in het header-zoekveld (desktop #q, mobiel #q2).
   Concept: zoekt client-side in PD_DATA (advertenties, steden, video's, blogs, services) + vaste categorieën/woordenboek/jobs.
   Productie: vervang PD_LIVESEARCH.source door een AJAX-call, bv. q=>fetch('/api/search?q='+encodeURIComponent(q)).then(r=>r.json())
   — verwacht hetzelfde formaat: [{g:'Adverteerders', items:[{label,sub,href,img?,icon?,badge?}]}]. */
(function(){
if(window.PD_LIVESEARCH)return;
const D=window.PD_DATA||{L:[],V:[],B:[],CITIES:[],SVC:[]};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’'`]/g,'').replace(/\s+/g,' ').trim();
const slug=s=>norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const L=D.L||[];
const cnt=f=>L.filter(f).length;
const nAds=n=>n===1?'1 advertentie':n+' advertenties';

/* ---------- index opbouwen ---------- */
const CAT=[ // label, href, icon, extra zoekwoorden, teller
 ['Vrouwen','vrouwen.html','fa-venus','dames vrouw meiden escort dames sekswerkers',cnt(x=>x.g==='Vrouw')],
 ['Mannen','mannen.html','fa-mars','man heren gigolo male escort gay',cnt(x=>x.g==='Man')],
 ['Trans','trans.html','fa-transgender','transgender ts shemale shemales',cnt(x=>x.g==='Shemale')],
 ['Shemales','shemales.html','fa-transgender','ts trans ladyboy',cnt(x=>x.g==='Shemale')],
 ['Stellen','stellen.html','fa-user-group','koppels stel swingers trio paren',cnt(x=>x.g==='Stel')],
 ['SugarDates.nl','https://sugardates.nl','fa-gem','sugar daddy sugarbaby sugar baby sugardaddy sugardating suikerdating','Zusterplatform voor sugardating'],
 ['Agencies','agency.html','fa-building','agency bureau escortbureau club privehuis clubs','Bureaus & clubs'],
 ['Seksclubs & Privéhuizen','seksclubs.html','fa-champagne-glasses','seksclub seksclubs sexclub sexclubs privehuis privéhuis privehuizen privéhuizen club clubs gentlemens club boccaccio laren','Clubs & privéhuizen'],
 ["Video's",'videos.html','fa-play','videos video filmpjes clips teasers porno',(D.V||[]).length+" video's"],
 ['Gangbangs & seksfeesten','gangbangs.html','fa-champagne-glasses','gangbang bukkake swingersfeest seksfeest feest party sexparty bi-feest','Feesten promoten & vinden'],
 ['Escort','search.html?type=Escort','fa-car','escorts outcall op locatie',cnt(x=>x.t==='Escort')],
 ['Privé ontvangst','search.html?type='+encodeURIComponent('Privé ontvangst'),'fa-house','prive ontvangst incall thuis',cnt(x=>x.t==='Privé ontvangst')],
 ['Erotische massage','search.html?type='+encodeURIComponent('Erotische Massage'),'fa-spa','massage tantra body to body happy ending masseuse',cnt(x=>x.t==='Massage')],
 ['BDSM & meesteressen','search.html?type=BDSM','fa-link','bdsm meesteres meesteressen findom dominatrix domina kink fetisj sm',cnt(x=>x.t==='BDSM')],
 ['Online / OnlyFans & F2F','search.html?type=Online','fa-video','online onlyfans f2f fansly webcam sexting cam content',cnt(x=>x.t==='Online')],
 ['Nu beschikbaar','search.html?f=now','fa-bolt','nu direct vandaag beschikbaar',cnt(x=>x.now)],
 ['Chatten','chatten.html','fa-comments','chat chatroom chatbox praten',''],
 ['Jobs & vacatures','jobs.html','fa-briefcase','jobs vacature vacatures werk werken baan personeel',''],
 ['Nieuws & blogs','nieuws.html','fa-newspaper','nieuws blog blogs artikelen interviews',(D.B||[]).length+' artikelen'],
 ['Woordenboek','woordenboek.html','fa-book','woordenboek betekenis afkortingen termen',''],
 ['Alle steden','locaties.html','fa-map-location-dot','locaties steden provincies plaatsen kaart',(D.CITIES||[]).length+' steden'],
 ['Erotische webshops','partners.html','fa-bag-shopping','webshop webshops toys lingerie condooms seksspeeltjes easytoys pabo christine le duc partners','Partnerlinks'],
 ['Adverteren & tarieven','adverteren.html','fa-rectangle-ad','adverteren advertentie plaatsen vip top tarieven prijzen',''],
 ['Credits kopen','credits.html','fa-coins','credits kopen opwaarderen betalen bunq ideal',''],
 ['Gebruikers online','online.html','fa-users','online gebruikers leden',''],
 ['Veilig daten','veilig-daten.html','fa-shield-heart','veilig veiligheid tips',''],
 ['Veelgestelde vragen','faq.html','fa-circle-question','faq vragen hulp help',''],
 ['Contact','contact.html','fa-envelope','contact mail klantenservice',''],
];
const WB=[['69','wederzijdse orale seks'],['A-level','Anale seks'],['Bareback','Seks zonder condoom'],['BDSM','Bondage, discipline, dominantie en sadomasochisme'],['Beffen','Orale seks bij een vrouw'],['Body-to-body','Massage met het hele lichaam'],['Cardate','Afspraak in de auto'],['CIM','Cum in mouth'],['COB','Cum on body'],['COF','Cum on face'],['DFK','Deep French kissing'],['Dominatrix','Dominante vrouw in een BDSM-sessie'],['DT','Deepthroat'],['Duo','Twee adverteerders tegelijk'],['Erotische massage','Massage met een erotisch karakter'],['Escort','Sekswerker die op locatie komt'],['Facesitting','Op het gezicht zitten'],['Fetisj','Seksuele voorkeur voor een object of handeling'],['FK','French kissing'],['Footjob','Bevrediging met de voeten'],['GFE','Girlfriend experience'],['Golden shower','Plasseks'],['Happy ending','Afronding met een orgasme'],['Incall','Jij gaat naar de adverteerder'],['NZC','Neuken zonder condoom'],['Omhoog plaatsen','Advertentie weer bovenaan zetten'],['Outcall','De adverteerder komt naar jou'],['Overnight','Afspraak van een hele nacht'],['Paydate','Betaalde date'],['PMC','Pijpen met condoom'],['PrEP','Pre-expositieprofylaxe'],['Privé ontvangst','Afspraak op de locatie van de adverteerder'],['PSE','Pornstar experience'],['PZC','Pijpen zonder condoom'],['Rimming','Anaal likken'],['Roleplay','Rollenspel'],['Safeword','Stopwoord'],['SOA','Seksueel overdraagbare aandoening'],['Squirten','Vrouwelijke ejaculatie'],['Swingen','Partnerruil en seks met andere stellen'],['Tantra','Tantramassage'],['TOP','TOP-plaatsing op Paydates'],['Trio','Seks met drie personen'],['Verificatie','Gecontroleerd profiel op Paydates'],['VIP','Uitgelichte advertentie op Paydates']];
const GL={Vrouw:'Vrouw',Man:'Man',Stel:'Stel',Shemale:'Trans'};
const cityHref=c=>{const m=(D.CITIES||[]).find(x=>x.n===c);return m?`escort-${m.slug}.html`:`search.html?city=${encodeURIComponent(c)}`;};
const cityNames=[...new Set([...(D.CITIES||[]).map(c=>c.n),...L.map(x=>x.c).filter(Boolean)])];
const PROV=D.CITYPROV||{};
function idx(){
 const I={ads:[],cities:[],cats:[],vids:[],svc:[],jobs:[],blogs:[],wb:[]};
 L.forEach(x=>I.ads.push({k:[x.n,x.s],k2:[x.c,x.t,GL[x.g]||x.g],label:x.n,sub:[GL[x.g]||x.g,x.t,x.c,x.a?x.a+' jr':''].filter(Boolean).join(' · ')+(x.s&&norm(x.s)!==norm(x.n)?' — '+x.s:''),
   href:'advertentie.html?id='+x.id,img:x.img,badge:x.vip?'VIP':x.top?'TOP':'',now:x.now,rank:(x.vip?3:0)+(x.top?2:0)+(x.now?1:0)}));
 cityNames.forEach(c=>{const n=L.filter(x=>x.c===c).length,p=PROV[c]||((D.CITIES||[]).find(x=>x.n===c)||{}).prov||'';
   I.cities.push({k:[c],k2:[p],label:'Escort '+c,sub:[p,n?nAds(n):'Bekijk sekswerkers in en rond '+c].filter(Boolean).join(' · '),href:cityHref(c),icon:'fa-location-dot',rank:n});});
 [...new Set(Object.values(PROV))].forEach(p=>I.cities.push({k:[p],k2:['provincie'],label:p,sub:'Provincie · alle steden',href:'locaties.html',icon:'fa-map',rank:-1}));
 CAT.forEach(([l,h,ic,kw,c])=>I.cats.push({k:[l],k2:kw.split(' '),label:l,sub:typeof c==='number'?nAds(c):c,href:h,icon:ic,rank:0}));
 (D.V||[]).forEach(v=>I.vids.push({k:[v.title||'',v.user||''],k2:[],label:(v.title||'').trim()||'Video van '+v.user,sub:'Video van '+v.user+(v.views?' · '+Number(v.views).toLocaleString('nl-NL')+' views':''),href:v.page||'videos.html',img:v.thumb,play:1,rank:(v.views||0)/1e4}));
 (D.SVC||[]).forEach(s=>I.svc.push({k:[s],k2:[],label:s,sub:nAds(cnt(x=>(x.mog||[]).some(m=>m[0]===s)))+' met deze mogelijkheid',href:'search.html?s='+encodeURIComponent(s),icon:'fa-check',rank:0}));
 (window.PD_JOBS||[]).forEach(j=>I.jobs.push({k:[j.title,j.emp],k2:[j.city,j.type],label:j.title,sub:j.emp+' · '+j.city,href:j.page,icon:'fa-briefcase',rank:j.tier==='gold'?1:0}));
 (D.B||[]).forEach(b=>I.blogs.push({k:[b.title],k2:[b.cat||'',b.excerpt||''],label:b.title,sub:'Nieuws'+(b.cat?' · '+b.cat:''),href:'blog-'+b.slug+'.html',img:b.img,rank:0}));
 WB.forEach(([t,d])=>I.wb.push({k:[t],k2:[d],label:t,sub:d,href:'woordenboek-'+slug(t)+'.html',icon:'fa-book',rank:0}));
 I.cats.forEach(c=>c.kw=1);
 return I;}
let I=null;
/* score: hoofdveld begint met → hoog; woord begint met → midden; bevat → laag; extra velden lager. Alle zoekwoorden moeten matchen. */
function score(it,toks,q){
 const main=it.k.map(norm),ext=it.k2.map(norm),all=main.concat(ext).join(' ');let s=0;
 for(const t of toks){if(!all.includes(t))return 0;}
 for(const m of main){if(m===q)s=Math.max(s,100);else if(m.startsWith(q))s=Math.max(s,80);else if((' '+m).includes(' '+q))s=Math.max(s,65);else if(m.includes(q))s=Math.max(s,45);}
 if(!s){let w=0;for(const t of toks){if(main.some(m=>(' '+m).includes(' '+t)))w+=20;else if(ext.some(m=>(' '+m).includes(' '+t)))w+=(it.kw?18:12);else w+=5;}s=Math.min(60,w);}
 return s+Math.min(it.rank||0,5);}
const GROUPS=[['ads','Adverteerders',6],['cities','Steden & regio',5],['cats','Categorieën',4],['vids',"Video's",4],['svc','Mogelijkheden',3],['jobs','Jobs',3],['blogs','Nieuws',3],['wb','Woordenboek',3]];
function local(q){I=I||idx();const nq=norm(q),toks=nq.split(' ').filter(Boolean);if(!nq)return [];
 const out=[];
 for(const [k,label,max] of GROUPS){
  if(nq.length<2&&!['cats','cities','ads'].includes(k))continue;
  const r=I[k].map(it=>[score(it,toks,nq),it]).filter(a=>a[0]>0).sort((a,b)=>b[0]-a[0]||(b[1].rank||0)-(a[1].rank||0));
  if(r.length)out.push({g:label,best:r[0][0],total:r.length,items:r.slice(0,max).map(a=>a[1])});}
 // groep met de sterkste match bovenaan, verder vaste volgorde
 const top=out.reduce((m,g)=>g.best>m.best?g:m,{best:-1});
 return top.g?[top,...out.filter(g=>g!==top)]:out;}
const POP=()=>{I=I||idx();const byN=I.cities.filter(c=>c.rank>0).sort((a,b)=>b.rank-a.rank).slice(0,5);
 return [{g:'Populaire steden',items:byN},{g:'Categorieën',items:I.cats.slice(0,6)}];};

/* ---------- UI ---------- */
const css=`.pdls{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:90;background:#fff;color:#343a40;border:1px solid #dfe4f1;border-radius:.75rem;box-shadow:0 18px 44px rgba(37,18,82,.22);overflow:auto;max-height:min(72vh,620px);overscroll-behavior:contain;font-family:inherit;text-align:left}
.pdls[hidden]{display:none}
@media(min-width:768px){.pdls{min-width:460px}}
@media(max-width:767px){.pdls{max-height:calc(100dvh - 190px);left:.75rem;right:.75rem;top:calc(100% - 2px)}}
.pdls-h{display:flex;justify-content:space-between;align-items:center;padding:.6rem .9rem .25rem;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8a90a6}
.pdls-h a{letter-spacing:0;text-transform:none;font-weight:600;color:#7351c0;font-size:11.5px}
.pdls-i{display:flex;align-items:center;gap:.7rem;padding:.45rem .9rem;color:#343a40;text-decoration:none;cursor:pointer;line-height:1.25}
.pdls-i:hover,.pdls-i[aria-selected=true]{background:#7351c014}
.pdls-i[aria-selected=true]{box-shadow:inset 3px 0 0 #7351c0}
.pdls-t{width:38px;height:38px;flex:none;border-radius:.5rem;object-fit:cover;background:#edf0f7}
.pdls-t.v{width:56px;height:36px}
.pdls-v{position:relative;flex:none}.pdls-v:after{content:"\\f04b";font-family:"Font Awesome 6 Free";font-weight:900;position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;text-shadow:0 1px 3px rgba(0,0,0,.6)}
.pdls-ic{width:38px;height:38px;flex:none;border-radius:999px;background:#7351c017;color:#7351c0;display:flex;align-items:center;justify-content:center;font-size:14px}
.pdls-b{display:block;min-width:0;flex:1;overflow:hidden}
.pdls-l{display:block;font-size:13.5px;font-weight:600;color:#212529;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pdls-s{display:block;font-size:11.5px;color:#6c7286;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
.pdls mark{background:none;color:#7351c0;font-weight:700}
.pdls-bd{flex:none;font-size:9.5px;font-weight:800;padding:2px 6px;border-radius:4px;background:#f5c518;color:#212529}
.pdls-bd.top{background:#7351c0;color:#fff}
.pdls-now{display:inline-block;width:7px;height:7px;border-radius:9px;background:#2fbf6a;margin-right:4px;vertical-align:1px}
.pdls-f{display:flex;align-items:center;gap:.5rem;padding:.7rem .9rem;border-top:1px solid #edf0f7;font-size:13px;font-weight:600;color:#7351c0;position:sticky;bottom:0;background:#fff}
.pdls-f[aria-selected=true],.pdls-f:hover{background:#7351c014}
.pdls-e{padding:1rem .9rem;font-size:13px;color:#6c7286}
.pdls-k{display:none;gap:.8rem;padding:.45rem .9rem;border-top:1px solid #edf0f7;font-size:10.5px;color:#9aa0b4}
@media(hover:hover) and (pointer:fine){.pdls-k{display:flex}}
.pdls-k kbd{font-family:inherit;border:1px solid #dfe4f1;border-radius:3px;padding:0 4px;background:#f7f8fc}`;
const hl=(s,toks)=>{let h=esc(s);toks.filter(t=>t.length>0).sort((a,b)=>b.length-a.length).forEach(t=>{
  const src=norm(s);let i=src.indexOf(t);if(i<0||src.length!==s.length)return; // alleen bij 1-op-1 lengte (geen diacriet-verschuiving)
  h=esc(s.slice(0,i))+'<mark>'+esc(s.slice(i,i+t.length))+'</mark>'+esc(s.slice(i+t.length));});return h;};
const RK='pdRecentQ';
const recent=()=>{try{return JSON.parse(localStorage.getItem(RK)||'[]')}catch(e){return []}};
const remember=q=>{q=q.trim();if(q.length<2)return;try{localStorage.setItem(RK,JSON.stringify([q,...recent().filter(x=>norm(x)!==norm(q))].slice(0,5)))}catch(e){}};

function attach(form){
 const inp=form.querySelector('input[name=q]');if(!inp||inp.dataset.ls)return;inp.dataset.ls=1;
 const host=inp.closest('.relative')&&form.id==='mSearch'?form:form; // dropdown altijd t.o.v. het formulier
 if(getComputedStyle(host).position==='static')host.style.position='relative';
 const id='pdls-'+(inp.id||Math.random().toString(36).slice(2));
 const P=document.createElement('div');P.className='pdls';P.id=id;P.hidden=true;P.setAttribute('role','listbox');P.setAttribute('aria-label','Zoeksuggesties');host.appendChild(P);
 inp.setAttribute('role','combobox');inp.setAttribute('aria-autocomplete','list');inp.setAttribute('aria-expanded','false');inp.setAttribute('aria-controls',id);inp.setAttribute('autocomplete','off');
 let act=-1,t=null,seq=0,last=null;
 const opts=()=>[...P.querySelectorAll('[role=option]')];
 const setAct=i=>{const o=opts();if(!o.length)return;act=(i+o.length)%o.length;o.forEach((e,j)=>e.setAttribute('aria-selected',j===act?'true':'false'));
   inp.setAttribute('aria-activedescendant',o[act].id);o[act].scrollIntoView({block:'nearest'});};
 const show=()=>{P.hidden=false;inp.setAttribute('aria-expanded','true');};
 const hide=()=>{P.hidden=true;inp.setAttribute('aria-expanded','false');inp.removeAttribute('aria-activedescendant');act=-1;};
 const row=(it,toks,n)=>{const vis=it.img?`<span class="${it.play?'pdls-v':''}"><img class="pdls-t${it.play?' v':''}" src="${esc(it.img)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"></span>`:`<span class="pdls-ic"><i class="fa ${esc(it.icon||'fa-magnifying-glass')}"></i></span>`;
   const bd=it.badge?`<span class="pdls-bd ${it.badge==='TOP'?'top':''}">${it.badge}</span>`:'';
   const ext=/^https?:/i.test(it.href||'');return `<a role="option" id="${id}-${n}" aria-selected="false" class="pdls-i" href="${esc(it.href)}"${ext?' target="_blank" rel="noopener"':''}>${vis}<span class="pdls-b"><span class="pdls-l">${hl(it.label,toks)}</span><span class="pdls-s">${it.now?'<span class="pdls-now" title="Nu beschikbaar"></span>':''}${hl(it.sub||'',toks)}</span></span>${bd}</a>`;};
 const render=(groups,q)=>{const toks=norm(q).split(' ').filter(Boolean);let n=0,h='';
   if(!q){const r=recent();if(r.length)h+=`<div class="pdls-h">Recent gezocht<a href="#" data-ls-clear>Wissen</a></div>`+r.map(x=>row({label:x,sub:'Zoek opnieuw',href:'search.html?q='+encodeURIComponent(x),icon:'fa-clock-rotate-left'},[],n++)).join('');}
   groups.forEach(g=>{if(!g.items.length)return;const more=g.total>g.items.length?`<a href="search.html?q=${encodeURIComponent(q)}">+${g.total-g.items.length} meer</a>`:'';
     h+=`<div class="pdls-h">${esc(g.g)}${g.g==='Adverteerders'?more:''}</div>`+g.items.map(it=>row(it,toks,n++)).join('');});
   if(q&&!groups.length)h+=`<div class="pdls-e"><i class="fa fa-face-meh mr-1"></i> Geen directe resultaten voor “<b>${esc(q)}</b>”. Probeer een naam, stad of dienst — of gebruik uitgebreid zoeken.</div>`;
   if(q)h+=`<a role="option" id="${id}-${n++}" aria-selected="false" class="pdls-f" href="search.html?q=${encodeURIComponent(q)}"><i class="fa fa-magnifying-glass"></i>Alle resultaten voor “${esc(q)}”<i class="fa fa-arrow-right ml-auto"></i></a>`;
   else h+=`<a role="option" id="${id}-${n++}" aria-selected="false" class="pdls-f" href="search.html" data-open-search><i class="fa fa-sliders"></i>Uitgebreid zoeken<i class="fa fa-arrow-right ml-auto"></i></a>`;
   h+=`<div class="pdls-k"><span><kbd>↑</kbd> <kbd>↓</kbd> kiezen</span><span><kbd>Enter</kbd> openen</span><span><kbd>Esc</kbd> sluiten</span></div>`;
   P.innerHTML=h;act=-1;show();};
 const run=()=>{const q=inp.value.trim();if(q===last&&!P.hidden)return;last=q;const my=++seq;
   if(!q){render(POP(),'');return;}
   Promise.resolve(api.source(q)).then(g=>{if(my===seq)render(g||[],q);}).catch(()=>{if(my===seq)render(local(q),q);});};
 inp.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(run,140);});
 inp.addEventListener('focus',()=>{last=null;run();});
 inp.addEventListener('keydown',e=>{
   if(e.key==='ArrowDown'){e.preventDefault();if(P.hidden){last=null;run();}else setAct(act+1);}
   else if(e.key==='ArrowUp'){e.preventDefault();if(!P.hidden)setAct(act<0?-1:act-1);}
   else if(e.key==='Enter'){const o=opts()[act];remember(inp.value);if(o&&!P.hidden){e.preventDefault();e.stopPropagation();o.click();}}
   else if(e.key==='Escape'){if(!P.hidden){e.preventDefault();hide();}else{inp.value='';inp.dispatchEvent(new Event('input'));inp.blur();}}
   else if(e.key==='Tab')hide();});
 P.addEventListener('mousedown',e=>e.preventDefault()); // focus in het veld houden
 P.addEventListener('click',e=>{if(e.target.closest('[data-ls-clear]')){e.preventDefault();localStorage.removeItem(RK);last=null;run();return;}
   const a=e.target.closest('a[href]');if(a){remember(inp.value);if(!a.hasAttribute('data-open-search'))hide();}});
 inp.addEventListener('blur',()=>setTimeout(hide,120));
 form.addEventListener('submit',()=>remember(inp.value),true);
}
const api=window.PD_LIVESEARCH={source:local,local,attach};
function init(){if(!document.getElementById('pdls-css')){const s=document.createElement('style');s.id='pdls-css';s.textContent=css;document.head.appendChild(s);}
 document.querySelectorAll('form[data-search]').forEach(attach);
 if(!window.PD_JOBS){const s=document.createElement('script');s.src='assets/jobs.js';s.onload=()=>{I=null;};document.head.appendChild(s);}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
