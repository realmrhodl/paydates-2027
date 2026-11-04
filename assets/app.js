/* Paydates V2 — gedeelde logica: 18+ poort, mobiel menu, zoeken, kaarten, advertenties */
/* 18+ poort — los van de rest, zodat een fout elders de knop nooit blokkeert */
(function(){
  /* Eén sleutel overal: 'pd18' (localStorage = tijdstempel, cookie, window.name, ?pd18=1). Geldig 90 dagen. */
  var K='pd18',TTL=90*864e5,FILE=location.protocol==='file:',Q0=/[?&]pd18=1(&|$)/.test(location.search)||document.documentElement.classList.contains('pd18ok');
  function lsOk(){try{var v=localStorage.getItem(K);if(!v)return false;if(v==='1')return true;var t=+v;return t>0&&Date.now()-t<TTL;}catch(e){return false}}
  function has18(){return lsOk()||/(?:^|;\s*)pd18=1/.test(document.cookie)||/(^|;)pd18(;|$)/.test(window.name)||Q0||/[?&]pd18=1(&|$)/.test(location.search)||location.hash==='#noage';}
  function persist(){
    try{var v=localStorage.getItem(K);if(!v||v==='1'||!(Date.now()-(+v)<TTL))localStorage.setItem(K,String(Date.now()));}catch(e){}
    try{document.cookie='pd18=1; max-age='+(TTL/1000)+'; path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');}catch(e){}
    if(!/(^|;)pd18(;|$)/.test(window.name))window.name=(window.name?window.name+';':'')+'pd18';
    document.documentElement.classList.add('pd18ok');
  }
  /* Lokaal geopend (file://): Safari/Firefox geven elk bestand eigen opslag, dus geef de bevestiging mee in de link. */
  function tag(u){if(!u||/^(#|[a-z][a-z0-9+.-]*:|\/\/)/i.test(u)||!/\.html?(?:[?#]|$)/i.test(u)||/[?&]pd18=1(&|$)/.test(u))return u;
    var h='',i=u.indexOf('#');if(i>=0){h=u.slice(i);u=u.slice(0,i);}return u+(u.indexOf('?')>=0?'&':'?')+'pd18=1'+h;}
  function carry(){if(!FILE)return;
    document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||!has18())return;var h=a.getAttribute('href'),t=tag(h);if(t!==h)a.setAttribute('href',t);},true);
    document.addEventListener('submit',function(e){var f=e.target;if(!has18()||!f||(f.method||'get').toLowerCase()!=='get'||f.querySelector('input[name=pd18]'))return;var i=document.createElement('input');i.type='hidden';i.name='pd18';i.value='1';f.appendChild(i);},true);}
  window.PD18={has:has18,persist:persist};
  function init(){
    var g=document.getElementById('agegate');if(!g||g.dataset.ready)return;g.dataset.ready='1';
    if(has18()){g.remove();persist();document.body.style.overflow='';return;}
    document.documentElement.classList.remove('pd18ok');
    document.body.style.overflow='hidden';
    var btn=document.getElementById('ageBtn'),chks=[].slice.call(g.querySelectorAll('.agechk'));
    function all(){return chks.every(function(x){return x.checked});}
    function upd(){if(!btn)return;var ok=all();btn.removeAttribute('disabled');btn.disabled=false;btn.setAttribute('aria-disabled',ok?'false':'true');btn.style.opacity=ok?'1':'.55';btn.style.cursor='pointer';}
    function pass(){persist();g.remove();document.body.style.overflow='';}
    function go(){if(all()){pass();return;}
      chks.forEach(function(c){if(!c.checked){var l=c.closest('label')||c;l.style.color='#c0262d';l.style.fontWeight='600';setTimeout(function(){l.style.color='';l.style.fontWeight='';},1600);}});}
    chks.forEach(function(c){c.style.cursor='pointer';c.style.pointerEvents='auto';var l=c.closest('label');if(l){l.style.cursor='pointer';l.style.userSelect='none';}
      ['change','input','click'].forEach(function(ev){c.addEventListener(ev,function(){setTimeout(upd,0)});});});
    // links in een label: niet het vinkje blokkeren, link opent in nieuw tabblad
    g.querySelectorAll('label a').forEach(function(a){a.target='_blank';a.rel='noopener';a.addEventListener('click',function(e){e.stopPropagation();});});
    if(btn){btn.type='button';btn.style.pointerEvents='auto';btn.addEventListener('click',function(e){e.preventDefault();go();});
      var bar=btn.parentElement;if(bar)bar.addEventListener('click',function(e){if(e.target===bar&&all())pass();});}
    g.addEventListener('keydown',function(e){if(e.key==='Enter'&&all()){e.preventDefault();pass();}});
    document.addEventListener('keydown',function(e){if(e.key==='Enter'&&document.getElementById('agegate')&&all()){e.preventDefault();pass();}});
    upd();
  }
  carry();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
(function(){
const D=window.PD_DATA||{L:[],V:[],B:[],CITIES:[]};
// eigen pagina per video (zelfde slug als _build/video_pages.py)
(D.V||[]).forEach(v=>{const id=String(v.href||'').replace(/\/+$/,'').split('/').pop().split('-')[0];const t=(v.title||'').trim()||('Video van '+v.user);v.page='video-'+(id+'-'+t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').slice(0,80).replace(/^-+|-+$/g,'')+'.html';});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const qs=k=>new URLSearchParams(location.search).get(k)||'';
const favs=new Set(JSON.parse(localStorage.getItem('pdFav')||'[]'));
const cityPage=c=>{const m=D.CITIES.find(x=>x.n===c);return m?`escort-${m.slug}.html`:`search.html?city=${encodeURIComponent(c)}`};

function card(x,w=''){
  return `<a href="advertentie.html?id=${x.id}" class="card group block bg-white rounded-lg overflow-hidden shadow-block hover:shadow-pill transition ${x.vip?'ring-2 ring-gold':''} ${w}">
   <div class="relative aspect-[3/4] overflow-hidden bg-pd-lighter">
     <img src="${esc(x.img)}" alt="${esc(x.n)} – ${esc(x.s)}" loading="lazy" decoding="async" class="ph absolute inset-0 w-full h-full object-cover">
     <div class="absolute top-1.5 left-1.5 flex gap-1">${x.vip?'<span class="mini !bg-gold !text-[#212529]">VIP</span>':''}${x.vid?'<span class="mini"><i class="fa fa-play"></i> video</span>':''}</div>
     <button type="button" data-fav="${x.id}" aria-label="Favoriet" class="fav absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-pd text-[12px]"><i class="${favs.has(x.id)?'fa-solid':'fa-regular'} fa-heart"></i></button>
     ${x.now?'<span class="absolute bottom-1.5 left-1.5 mini !bg-[#2f9e44]"><i class="fa fa-circle text-[6px]"></i> Nu beschikbaar</span>':''}
   </div>
   <div class="p-2 sm:p-2.5">
     <div class="flex flex-wrap gap-1 mb-1.5"><span class="mini"><i class="fa fa-image"></i>${x.f}</span>${x.vid?`<span class="mini"><i class="fa fa-film"></i>${x.vid}</span>`:''}${x.p?`<span class="mini">€ ${x.p}</span>`:''}</div>
     <div class="font-semibold text-[13px] sm:text-[14px] text-[#212529] leading-tight flex items-center gap-1 min-w-0"><span class="truncate">${esc(x.n)}</span>${x.v?'<i class="fa fa-circle-check text-pd text-[12px]" title="Geverifieerd"></i>':''}</div>
     <div class="text-[12px] text-ink-muted truncate">${esc(x.s)}</div>
     <div class="mt-1.5 space-y-0.5 text-[11px] text-ink">
       <div class="truncate"><i class="fa fa-location-dot w-3.5 text-ink-muted"></i> ${esc(x.c)}</div>
       <div><i class="fa fa-venus-mars w-3.5 text-ink-muted"></i> ${x.g}${x.a?`, ${x.a} jaar`:''}</div>
       <div><i class="fa fa-check w-3.5 text-ink-muted"></i> ${esc(x.t)}</div>
     </div>
     ${x.ago?`<div class="mt-1.5 text-[10px] text-ink-muted"><i class="fa fa-circle-arrow-up mr-1"></i>${x.ago}</div>`:''}
   </div></a>`;
}
const nativeAd=`<a href="adverteren.html#top" class="adc adc-purple flex-col rounded-lg min-h-[260px] p-4 text-left">
  <div class="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-[18px]"><i class="fa fa-arrow-trend-up"></i></div>
  <div class="text-[11px] font-bold tracking-[.18em] text-pd-lighter mt-4">TOP-PLAATSING</div>
  <div class="text-[18px] font-bold leading-tight mt-1">Hier had jouw advertentie kunnen staan</div>
  <p class="text-[12px] text-white/80 mt-2 leading-snug">Sta tussen de best bekeken profielen van Nederland.</p>
  <span class="adbtn shine mt-auto py-2 text-[12px]">Plaats advertentie</span></a>`;
const mobileAd=`<a href="adverteren.html#vip" class="xl:hidden col-span-full adc adc-purple h-[100px] items-center gap-3 px-4">
  <span class="w-11 h-11 shrink-0 rounded-full shine flex items-center justify-center text-[18px]"><i class="fa fa-crown"></i></span>
  <span class="min-w-0 flex-1"><span class="block text-[15px] font-bold leading-tight">VIP Boost</span><span class="block text-[11px] text-white/80 leading-snug">Bovenaan in jouw stad, met gouden kader.</span></span>
  <span class="adbtn bg-white text-pd px-3 py-1.5 text-[12px] shrink-0">Boost</span></a>`;
function grid(list){let h='';list.forEach((x,i)=>{h+=card(x);if(i===6)h+=nativeAd;if(i===9)h+=mobileAd;});return h;}
function toast(msg){const t=document.createElement('div');t.className='toast';t.innerHTML=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3200);}

window.PD={D,L:D.L,$,$$,esc,slug,qs,card,grid,nativeAd,mobileAd,toast,cityPage};

document.addEventListener('DOMContentLoaded',()=>{
  // 18+ poort: zie los blok bovenaan dit bestand
  // mobiel menu
  const dr=$('#pdDrawer');
  // drawer: alleen de drawer scrolt; pagina erachter staat vast (ook iOS), geen layout-sprong
  const open=()=>{if(!dr)return;dr.classList.remove('hidden');document.body.style.overflow='hidden';dr.querySelector('.overflow-y-auto')?.scrollTo(0,0)},
        close=()=>{if(!dr||dr.classList.contains('hidden'))return;dr.classList.add('hidden');document.body.style.overflow=''};
  addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  addEventListener('resize',()=>{if(innerWidth>=1024)close();},{passive:true});
  dr?.querySelector('[data-close-drawer]')?.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
  $$('#menuBtn,[data-open-drawer]').forEach(b=>b.addEventListener('click',open));$$('[data-close-drawer]').forEach(b=>b.addEventListener('click',close));
  $('#mSearchBtn')?.addEventListener('click',()=>{$('#mSearch').classList.toggle('hidden');$('#q2')?.focus()});
  // bottom-nav Zoeken: mobiel snelzoekbalk in header, tablet het header-zoekveld
  $$('[data-bnav-search]').forEach(b=>b.addEventListener('click',()=>{const ms=$('#mSearch');
    if(ms&&getComputedStyle(ms.parentElement).display!=='none'&&innerWidth<768){const show=ms.classList.toggle('hidden')===false;scrollTo({top:0,behavior:'smooth'});if(show)ms.querySelector('input')?.focus();}
    else{const i=document.querySelector('header form[data-search]:not(#mSearch) input');if(i){scrollTo({top:0,behavior:'smooth'});i.focus();}else location.href='search.html';}}));
  // Meer-dropdown. Paneel wordt naar <body> verplaatst en absoluut in het document gezet:
  // het scrolt dan gewoon mee met de pagina (geen JS die tijdens scrollen achter de knop aan jaagt),
  // wordt niet afgeknipt door de horizontaal scrollende navbalk en niet gemaskeerd door de rand-fade.
  $$('[data-more]').forEach(w=>{const btn=w.querySelector('[data-more-btn]'),pn=w.querySelector('[data-more-panel]');if(!btn||!pn)return;let t,vw=innerWidth;
    const nav=btn.closest('nav');document.body.appendChild(pn);pn.classList.add('pd-more-float');
    const isOpen=()=>!pn.classList.contains('hidden');
    const place=()=>{const r=btn.getBoundingClientRect(),pw=pn.offsetWidth;
      pn.style.top=(r.bottom-1+scrollY)+'px';pn.style.left=(Math.max(8,Math.min(r.left,innerWidth-pw-8))+scrollX)+'px';
      pn.style.maxHeight=Math.max(220,innerHeight-Math.max(r.bottom,0)-16-(innerWidth<1024?58:0))+'px';};
    let openedAt=0;
    const show=()=>{clearTimeout(t);if(isOpen())return;pn.classList.remove('hidden');place();pn.scrollTop=0;openedAt=Date.now();btn.setAttribute('aria-expanded','true');};
    const hide=()=>{clearTimeout(t);if(!isOpen())return;pn.classList.add('hidden');btn.setAttribute('aria-expanded','false');};
    // desktop: hover opent al; een klik direct daarna mag hem niet meteen weer dichtklappen
    btn.addEventListener('click',e=>{e.stopPropagation();if(isOpen()&&Date.now()-openedAt>450)hide();else show();});
    // weggescrold uit beeld -> dicht, zodat hij niet later ineens nog openstaat
    addEventListener('scroll',()=>{if(isOpen()&&pn.getBoundingClientRect().bottom<0)hide();},{passive:true});
    if(matchMedia('(hover:hover) and (pointer:fine)').matches){
      const enter=()=>{clearTimeout(t);show();},leave=()=>{clearTimeout(t);t=setTimeout(hide,220);};
      w.addEventListener('mouseenter',enter);w.addEventListener('mouseleave',leave);pn.addEventListener('mouseenter',()=>clearTimeout(t));pn.addEventListener('mouseleave',leave);}
    document.addEventListener('click',e=>{if(!w.contains(e.target)&&!pn.contains(e.target))hide();});
    addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
    // mobiel: adresbalk in/uitklappen vuurt 'resize' tijdens scrollen -> alleen bij echte breedte-wijziging sluiten
    addEventListener('resize',()=>{if(innerWidth!==vw){vw=innerWidth;hide();}else if(isOpen())place();},{passive:true});
    // navbalk horizontaal scrollen: paneel schuift mee; pas dicht als de Meer-knop uit beeld is
    nav?.addEventListener('scroll',()=>{if(!isOpen())return;const r=btn.getBoundingClientRect(),n=nav.getBoundingClientRect();
      if(r.right<n.left+12||r.left>n.right-12)hide();else place();},{passive:true});
    const cur=location.pathname.split('/').pop()||'index.html';let hit=false;pn.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===cur){a.classList.add('active');hit=true;}});if(hit)btn.classList.add('active');});
  // horizontale scrollrijen (hoofdmenu, chips, stories): rand-fade alleen waar nog iets te scrollen valt
  const hs=$$('.overflow-x-auto.scrollbar-none');
  const edge=el=>{const max=el.scrollWidth-el.clientWidth;const over=max>2;el.classList.toggle('is-over',over);
    el.classList.toggle('is-start',!over||el.scrollLeft<=2);el.classList.toggle('is-end',!over||el.scrollLeft>=max-2);};
  hs.forEach(el=>{el.classList.add('pd-hs');edge(el);el.addEventListener('scroll',()=>edge(el),{passive:true});});
  if(window.ResizeObserver){const ro=new ResizeObserver(es=>es.forEach(e=>edge(e.target)));hs.forEach(el=>ro.observe(el));}
  else addEventListener('resize',()=>hs.forEach(edge),{passive:true});
  // hoofdmenu: oude vaste rechter-fade uit (vervangen door de dynamische fade) en actieve tab in beeld schuiven
  const mainNav=document.querySelector('nav[aria-label="Hoofdmenu"]');
  if(mainNav){mainNav.parentElement.classList.add('pd-navwrap');
    requestAnimationFrame(()=>{const a=mainNav.querySelector('a.active,.navlink.active');if(!a)return;
      const l=a.offsetLeft-mainNav.offsetLeft,rr=l+a.offsetWidth;
      if(l<mainNav.scrollLeft||rr>mainNav.scrollLeft+mainNav.clientWidth)mainNav.scrollLeft=Math.max(0,l-(mainNav.clientWidth-a.offsetWidth)/2);edge(mainNav);});}
  // header-zoekveld -> zoekpagina (index filtert live, zie index-script)
  $$('form[data-search]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const v=f.querySelector('input').value.trim();location.href='search.html'+(v?'?q='+encodeURIComponent(v):'');}));
  // favorieten
  document.addEventListener('click',e=>{const b=e.target.closest('[data-fav]');if(!b)return;e.preventDefault();e.stopPropagation();
    const id=+b.dataset.fav;favs.has(id)?favs.delete(id):favs.add(id);localStorage.setItem('pdFav',JSON.stringify([...favs]));
    b.querySelector('i').className=(favs.has(id)?'fa-solid':'fa-regular')+' fa-heart';toast(favs.has(id)?'<i class="fa fa-heart text-gold mr-1"></i>Opgeslagen in je favorieten':'Verwijderd uit favorieten');document.dispatchEvent(new CustomEvent('pd:fav',{detail:{id,on:favs.has(id),n:favs.size}}));});
  // formulieren (concept: nog niet gekoppeld aan backend)
  $$('form[data-pd-form]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();if(!f.reportValidity())return;
    try{const fd=new FormData(f),o={};fd.forEach((v,k)=>{if(v instanceof File)return;o[k]=k in o?[].concat(o[k],v):v;});const pg=location.pathname.split('/').pop();
      if(/melden|contact/.test(pg)){const ib=JSON.parse(localStorage.getItem('pdx_inbox')||'[]');ib.push({kind:/melden/.test(pg)?'melding':'support',page:pg,at:new Date().toISOString(),f:o});localStorage.setItem('pdx_inbox',JSON.stringify(ib));}}catch(_){}
    const ok=f.querySelector('[data-ok]');if(ok){f.querySelectorAll('[data-hide-on-ok]').forEach(x=>x.classList.add('hidden'));ok.classList.remove('hidden');ok.scrollIntoView({block:'center',behavior:'smooth'});}else toast('Verzonden');}));
  // actieve navlink
  const page=document.body.dataset.page;if(page)$$(`[data-nav~="${page}"]`).forEach(a=>a.classList.add('active'));
  // concept: aantal online in de chat (vast per sessie, 42-68)
  let n=+sessionStorage.getItem('pdChatN');if(!n){n=42+Math.floor(Math.random()*27);sessionStorage.setItem('pdChatN',n);}
  $$('.chatN').forEach(e=>e.textContent=n);
  // concept: bezoekers online (footer + online.html), licht fluctuerend, gedeeld per sessie
  let ot=+sessionStorage.getItem('pdOnT')||493,ol=+sessionStorage.getItem('pdOnL')||53;
  const fmtN=x=>x.toLocaleString('nl-NL');
  const paint=()=>{[['.pdOnT',ot],['.pdOnL',ol],['.pdOnG',ot-ol]].forEach(([c,v])=>$$(c).forEach(e=>e.textContent=fmtN(v)));sessionStorage.setItem('pdOnT',ot);sessionStorage.setItem('pdOnL',ol);};
  paint();setInterval(()=>{ot=Math.min(640,Math.max(420,ot+Math.round(Math.random()*12-6)));ol=Math.min(70,Math.max(40,ol+Math.round(Math.random()*4-2)));paint();},8000);
});
})();
/* Uitgebreid zoeken: filterlogica (gedeeld door search-modal en overzichtspagina's) + modal laden */
(function(){
const K={afk:'Afkomst',body:'Lichaamstype',bh:'BH maat',hair:'Haarkleur',tat:'Tattoos',pier:'Piercings',or:'Seksuele voorkeur'};
const TYPE={'Erotische Massage':'Massage'};
const AGE={'21-29':[21,29],'20s':[21,29],'30s':[30,39],'40s':[40,49],'50s':[50,59],'60+':[60,120]};
const list=(u,k)=>(u.get(k)||'').split(',').map(s=>s.trim()).filter(Boolean);
const lc=s=>String(s||'').trim().toLowerCase();
const kv=(x,k)=>{const m=x.kenm;if(!m)return '';if(Array.isArray(m)){const r=m.find(p=>p[0]===k);return r?r[1]:'';}return m[k]||'';};
function match(x,u){
  const g=list(u,'g');if(g.length>1&&!g.includes(x.g))return false;
  const t=list(u,'type').map(v=>TYPE[v]||v);if(t.length>1&&!t.includes(x.t))return false;
  const l=list(u,'lang');if(l.length>1&&!l.some(v=>(x.langs||[]).includes(v)))return false;
  for(const k in K){const v=list(u,k).map(lc);if(v.length&&!v.includes(lc(kv(x,K[k]))))return false;}
  const a=list(u,'age');if(a.length&&!(x.a&&a.some(b=>AGE[b]&&x.a>=AGE[b][0]&&x.a<=AGE[b][1])))return false;
  const pmin=+(u.get('pmin')||0);if(pmin&&!(x.p>=pmin))return false;
  const lmin=+(u.get('lmin')||0),lmax=+(u.get('lmax')||0);
  if(lmin||lmax){const h=parseInt(kv(x,'Lengte in centimeters (cm)'))||0;if(!h||(lmin&&h<lmin)||(lmax&&h>lmax))return false;}
  const o=list(u,'o');if(o.includes('10f')&&!((x.photos?x.photos.length:x.f)>=10))return false;
  if(o.includes('video')&&!x.vid)return false;if(o.includes('reviews')&&!((x.reviews||[]).length||x.nrev))return false;
  return true;}
function base(x,u){ // simpele params voor de teller in de modal
  const g=list(u,'g'),t=list(u,'type').map(v=>TYPE[v]||v),l=list(u,'lang'),q=lc(u.get('q')),city=lc(u.get('city')),pmax=+(u.get('pmax')||0),s=(u.get('s')||'').split('|').filter(Boolean).map(lc);
  return (g.length!==1||x.g===g[0])&&(t.length!==1||x.t===t[0])&&(l.length!==1||(x.langs||[]).includes(l[0]))
   &&(!q||lc(x.n+' '+x.s+' '+x.c+' '+x.t+' '+(x.desc||'')).includes(q))&&(!city||lc(x.c)===city)&&(!pmax||(x.p&&x.p<=pmax))
   &&s.every(v=>(x.mog||[]).some(m=>lc(m[0])===v));}
const ADVKEYS=['age','pmin','lmin','lmax','o','km',...Object.keys(K)];
window.PD_ADV={match,list,TYPE,count:u=>((window.PD_DATA||{}).L||[]).filter(x=>base(x,u)&&match(x,u)).length,
  active:u=>ADVKEYS.filter(k=>u.get(k)).length+['g','type','lang'].filter(k=>list(u,k).length>1).length};
const s=document.createElement('script');s.src='assets/searchmodal.js';s.defer=true;document.head.appendChild(s);
// ingelogde header: creditsaldo + accountmenu (assets/pdx-header.js)
if(!window.PDX_HEADER){const hs=document.createElement('script');hs.src='assets/pdx-header.js';document.head.appendChild(hs);}
// live zoeken (typeahead) in het header-zoekveld
if(!window.PD_LIVESEARCH){const ls=document.createElement('script');ls.src='assets/livesearch.js';ls.defer=true;document.head.appendChild(ls);}
})();

/* Mobiele bottom-nav v3: Home · Zoeken · Nu beschikbaar · Favorieten (adverteerder: Boost) · Menu */
(function(){
if(!window.PD)return;const{$,$$,esc,D}=PD;
const nav=document.getElementById('pdBottomNav');if(!nav)return;
const nowN=(D.L||[]).filter(x=>x.now).length;$$('.nowN',nav).forEach(e=>{e.textContent=nowN;e.classList.toggle('hidden',!nowN);});
const favN=n=>$$('.favN',nav).forEach(e=>{e.textContent=n>99?'99+':n;e.classList.toggle('hidden',!n);});
try{favN(JSON.parse(localStorage.getItem('pdFav')||'[]').length);}catch(e){}
document.addEventListener('pd:fav',e=>{favN(e.detail.n);const h=nav.querySelector('[data-bnav-slot4]');if(h&&e.detail.on){h.classList.remove('pd-bnav-pop');void h.offsetWidth;h.classList.add('pd-bnav-pop');}});
// actief: "Beschikbaar" op search.html?f=now, anders Zoeken op zoekpagina
const pg=(location.pathname.split('/').pop()||'index.html');const f=new URLSearchParams(location.search).get('f')||'';
if(pg==='search.html'){(f.split(',').includes('now')?nav.querySelector('[data-bnav-now]'):nav.querySelector('[data-bnav-search]')).classList.add('active');}
// adverteerder/bedrijf ingelogd → slot 4 wordt Boost
let u=null,db=null;try{const ss=JSON.parse(localStorage.getItem('pdx_session')||'null');db=JSON.parse(localStorage.getItem('pdx_v1')||'null');u=ss&&db&&db.users?db.users.find(x=>x.id===ss.id):null;}catch(e){}
if(!u||!(u.role==='adverteerder'||u.role==='bedrijf'))return;
const R=(db.pay&&db.pay.rates)||{bump:20,smsCallEur:2};const eur=n=>'€'+Number(n).toLocaleString('nl-NL',{minimumFractionDigits:0,maximumFractionDigits:2});
const ads=(db.ads||[]).filter(a=>a.owner===u.id&&a.status!=='verwijderd');const live=ads.filter(a=>a.status==='live');
const s4=nav.querySelector('[data-bnav-slot4]');
const b=document.createElement('button');b.type='button';b.className='pd-bnav-i pd-bnav-boost';b.setAttribute('aria-label','Boost je advertentie');b.setAttribute('aria-haspopup','dialog');
b.innerHTML='<span class="pd-bnav-boost-ic"><i class="fa fa-rocket"></i></span><span>Boost</span>'+(live.length?`<b class="pd-bnav-badge pd-bnav-gold">${live.length}</b>`:'');
s4.replaceWith(b);
let sh=null;
function sheet(){if(sh){sh.remove();sh=null;}
 sh=document.createElement('div');sh.className='pd-bsheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');sh.setAttribute('aria-label','Boost');
 const rows=live.length?live.map(a=>`<div class="pd-bs-ad"><div class="pd-bs-ad-h"><b>${esc(a.title)}</b><small>${esc(a.city||'')}${a.vip?' · VIP':''}${a.top?' · TOP':''} · ${(a.bumps||0)}× omhoog</small></div>
   <div class="pd-bs-act"><a class="pd-bs-btn pd" href="mijn-advertenties.html?boost=${encodeURIComponent(a.id)}&m=sms"><i class="fa fa-phone"></i> Bel/sms · ${eur(R.smsCallEur)}</a>
   <a class="pd-bs-btn" href="mijn-advertenties.html?boost=${encodeURIComponent(a.id)}&m=cr"><i class="fa fa-coins"></i> ${R.bump} credits</a></div></div>`).join('')
  :`<div class="pd-bs-empty"><i class="fa fa-rectangle-list"></i><p>${ads.length?'Geen advertentie live om te boosten.':'Je hebt nog geen advertentie.'}</p><a class="pd-bs-btn pd" href="${ads.length?'mijn-advertenties.html':'advertentie-plaatsen.html'}">${ads.length?'Naar mijn advertenties':'<i class="fa fa-plus"></i> Advertentie plaatsen'}</a></div>`;
 sh.innerHTML=`<div class="pd-bs-panel"><div class="pd-bs-grip"></div>
  <div class="pd-bs-top"><div><div class="pd-bs-t"><i class="fa fa-rocket"></i> Boost</div><div class="pd-bs-s">Zet je advertentie direct weer bovenaan in je stad.</div></div><button type="button" class="pd-bs-x" data-bs-x aria-label="Sluiten"><i class="fa fa-xmark"></i></button></div>
  <div class="pd-bs-bal"><span><i class="fa fa-coins"></i> Saldo <b>${Number(u.credits||0).toLocaleString('nl-NL')}</b> credits</span><a href="credits.html">Opwaarderen</a></div>
  <div class="pd-bs-list">${rows}</div>
  <div class="pd-bs-more"><a href="mijn-advertenties.html"><i class="fa fa-crown"></i> TOP, VIP &amp; elke dag automatisch omhoog</a><a href="dashboard.html"><i class="fa fa-gauge"></i> Dashboard</a></div>
  <p class="pd-bs-note">Bellen/sms: geen credits nodig, betaal via je telefoonrekening (alleen NL).</p></div>`;
 document.body.appendChild(sh);document.body.style.overflow='hidden';requestAnimationFrame(()=>sh.classList.add('open'));
 const close=()=>{if(!sh)return;const el=sh;sh=null;el.classList.remove('open');document.body.style.overflow='';setTimeout(()=>el.remove(),200);};
 sh.addEventListener('click',e=>{if(e.target===sh||e.target.closest('[data-bs-x]'))close();});
 addEventListener('keydown',function k(e){if(e.key==='Escape'){close();removeEventListener('keydown',k);}});}
b.addEventListener('click',sheet);
if(new URLSearchParams(location.search).get('boost')==='open')sheet();
})();
