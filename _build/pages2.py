import json
from layout import *
built=[]
# ---------- advertentie.html ----------
body='''<div class="max-w-[1400px] mx-auto px-3 lg:px-6 py-4">
  <div id="crumb"></div>
  <div id="ad" class="mt-3"><div class="block p-10 text-center text-ink-muted">Advertentie laden…</div></div>
</div>
<!-- lightbox -->
<div id="lb" class="hidden fixed inset-0 z-[90] bg-black/90 flex items-center justify-center">
  <button id="lbX" class="absolute top-3 right-4 text-white text-3xl" aria-label="Sluiten">×</button>
  <button id="lbP" class="absolute left-2 sm:left-6 text-white text-3xl w-12 h-12" aria-label="Vorige"><i class="fa fa-angle-left"></i></button>
  <img id="lbI" alt="" class="max-h-[88vh] max-w-[92vw] rounded">
  <button id="lbN" class="absolute right-2 sm:right-6 text-white text-3xl w-12 h-12" aria-label="Volgende"><i class="fa fa-angle-right"></i></button>
  <div id="lbC" class="absolute bottom-4 text-white/80 text-[12px]"></div>
</div>
<!-- omhoog plaatsen (0906 / SMS) -->
<div id="bumpM" class="hidden fixed inset-0 z-[95] bg-black/60 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="bumpT">
 <div class="w-full sm:max-w-[520px] bg-white sm:rounded-lg rounded-t-xl overflow-hidden shadow-2xl max-h-[94vh] overflow-y-auto">
  <div class="bg-pd-header text-white px-5 py-3.5 flex items-center gap-3">
   <span class="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0"><i class="fa fa-circle-arrow-up"></i></span>
   <div class="min-w-0"><h3 id="bumpT" class="font-semibold text-[15px] leading-tight">Advertentie omhoog plaatsen</h3><div class="text-[11px] text-white/75 truncate"><span id="bumpName"></span> · advertentie #<span id="bumpId"></span></div></div>
   <button data-bump-close class="ml-auto text-2xl leading-none w-8 h-8" aria-label="Sluiten">×</button>
  </div>
  <form id="bumpForm" class="p-5 text-[13px]" novalidate>
   <p class="text-ink-muted">Je advertentie komt direct weer <b class="text-[#212529]">bovenaan</b> in je categorie en je stad. Betaal met je telefoon en vul de code in die je ontvangt.</p>
   <div class="grid grid-cols-2 gap-2 mt-4" role="tablist">
    <button type="button" data-bm="0906" role="tab" class="pill !rounded-lg p-3 text-left on"><i class="fa fa-phone text-pd"></i> <b class="text-[#212529]">Bellen</b><div class="text-[11px] font-medium mt-0.5">via <span data-bump-num></span></div></button>
    <button type="button" data-bm="sms" role="tab" class="pill !rounded-lg p-3 text-left"><i class="fa fa-comment-sms text-pd"></i> <b class="text-[#212529]">SMS</b><div class="text-[11px] font-medium mt-0.5"><span data-bump-kw></span> naar <span data-bump-sc></span></div></button>
   </div>
   <div data-bp="0906" class="mt-4 rounded-lg bg-body-light border border-line p-4">
    <ol class="space-y-2.5">
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span><span>Bel <b class="text-[#212529] text-[15px] tracking-wide" data-bump-num></b></span></li>
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span><span>Je hoort een <b class="text-[#212529]">pincode</b>. Schrijf deze op.</span></li>
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span><span>Vul de pincode hieronder in en klik op <b class="text-[#212529]">Code controleren</b>.</span></li>
    </ol>
    <div class="text-[11px] text-ink-muted mt-3"><i class="fa fa-circle-info mr-1"></i>Kosten: <span data-bump-tariff-0906></span>. Je betaalt via je telefoonrekening.</div>
   </div>
   <div data-bp="sms" class="hidden mt-4 rounded-lg bg-body-light border border-line p-4">
    <ol class="space-y-2.5">
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span><span>Stuur een sms met <b class="text-[#212529]" data-bump-kw></b> naar <b class="text-[#212529] text-[15px]" data-bump-sc></b></span></li>
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span><span>Je ontvangt binnen enkele seconden een sms met je <b class="text-[#212529]">code</b>.</span></li>
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span><span>Vul de code hieronder in en klik op <b class="text-[#212529]">Code controleren</b>.</span></li>
    </ol>
    <a id="bumpSmsLink" href="sms:3010?&amp;body=Paydates" class="sm:hidden btn btn-ghost w-full mt-3 !py-2 !text-[12px]"><i class="fa fa-comment-sms"></i> Open je sms-app</a>
    <div class="text-[11px] text-ink-muted mt-3"><i class="fa fa-circle-info mr-1"></i>Kosten: <span data-bump-tariff-sms></span>. Je betaalt via je telefoonrekening of beltegoed.</div>
   </div>
   <label for="bumpCode" class="lbl mt-4">Pincode / sms-code</label>
   <div class="flex gap-2"><input id="bumpCode" class="inp text-center tracking-[.3em] font-bold !text-[18px]" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="••••••" aria-describedby="bumpMsg">
   <button id="bumpBtn" class="btn btn-pd shrink-0"><i class="fa fa-circle-check"></i> Code controleren</button></div>
   <div id="bumpMsg" class="text-[12px] mt-2" aria-live="polite"></div>
   <div class="mt-4 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-muted">
    <span>Liever met credits? <a href="credits.html" class="text-pd font-semibold">Omhoog plaatsen met credits</a></span>
    <span class="inline-flex items-center gap-1"><i class="fa fa-flask"></i>Concept: nummer, tarief en API nog te koppelen</span>
   </div>
  </form>
  <div id="bumpOk" class="hidden p-6 text-center">
   <div class="w-14 h-14 mx-auto rounded-full bg-[#2f9e4420] text-[#2f9e44] flex items-center justify-center text-2xl"><i class="fa fa-circle-arrow-up"></i></div>
   <h3 class="text-[18px] font-bold text-[#212529] mt-3">Je advertentie staat weer bovenaan</h3>
   <p class="text-ink-muted mt-1 text-[13px]">De code is geaccepteerd. Bezoekers zien je advertentie nu als eerste in je categorie en stad.</p>
   <p id="bumpOkNote" class="hidden text-[11px] text-ink-muted mt-2"><i class="fa fa-flask mr-1"></i>Concept-versie: de code is niet echt gecontroleerd.</p>
   <button type="button" data-bump-close class="btn btn-pd mt-4">Sluiten</button>
  </div>
 </div>
</div>'''
script=r'''<script>
(function(){
const {D,$,$$,esc,card,cityPage}=PD;
const id=+PD.qs('id');const x=D.L.find(a=>a.id===id)||D.L[0];
const gPage={Vrouw:'vrouwen.html',Man:'mannen.html',Shemale:'shemales.html',Stel:'stellen.html'}[x.g];
const gName={Vrouw:'Vrouwen',Man:'Mannen',Shemale:'Shemales',Stel:'Stellen'}[x.g];
document.title=`${x.n} – ${x.t} in ${x.c} | Paydates.nl`;{let c=document.querySelector('link[rel=canonical]');if(!c){c=document.createElement('link');c.rel='canonical';document.head.appendChild(c);}c.href='https://paydates.nl/advertentie.html?id='+x.id;}
document.querySelector('meta[name=description]').content=(x.s+' – '+(x.desc||'')).slice(0,155);
$('#crumb').innerHTML=`<nav class="crumbs flex flex-wrap items-center gap-1.5"><a href="index.html"><i class="fa fa-house"></i></a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><a href="${gPage}">${gName}</a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><a href="${cityPage(x.c)}">${esc(x.c)}</a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><span class="text-ink">${esc(x.n)}</span></nav>`;
const LANG={dutch:'Nederlands',english:'Engels',german:'Duits',spanish:'Spaans',french:'Frans'};
const P=x.photos.length?x.photos:[x.img];
const vids=D.V.filter(v=>v.ad===x.id);
const sim=D.L.filter(a=>a.id!==x.id&&(a.c===x.c||a.g===x.g)).sort((a,b)=>(b.c===x.c)-(a.c===x.c)||(b.g===x.g)-(a.g===x.g)).slice(0,10);
const desc=esc(x.desc||'').replace(/\n/g,'<br>');
const avail=(x.avail||[]).map(([d,t])=>`<div class="flex justify-between py-1.5 border-b border-line last:border-0"><span>${d}</span><span class="${t?'text-[#212529] font-semibold':'text-ink-soft'}">${t||'Niet beschikbaar'}</span></div>`).join('');
const prices=(x.prices||[]).map(p=>`<div class="mb-3 last:mb-0"><div class="text-[12px] font-semibold text-pd mb-1">${esc(p.t)}</div>${p.rows.map(([k,v])=>`<div class="flex justify-between py-1.5 border-b border-line last:border-0"><span>${esc(k)}</span><b class="text-[#212529]">${esc(v)}</b></div>`).join('')}</div>`).join('')||'<p class="text-ink-muted">Tarieven op aanvraag.</p>';
const kenm=(x.kenm||[]).map(([k,v])=>`<div class="flex justify-between gap-3 py-1.5 border-b border-line last:border-0"><span class="text-ink-muted">${esc(k.replace(' in centimeters (cm)',''))}</span><span class="text-[#212529] font-semibold text-right">${esc(String(v).replace(/\s*cm$/i,''))}${k.startsWith('Lengte')?' cm':''}</span></div>`).join('');
const mog=(x.mog||[]).map(([n,p])=>`<span class="inline-flex items-center gap-1 rounded-pill bg-[#7351c012] text-pd px-2.5 py-1 text-[12px] font-semibold"><i class="fa fa-check text-[10px]"></i>${esc(n)}${p?`<span class="text-ink-muted font-normal">${esc(p)}</span>`:''}</span>`).join('');
$('#ad').innerHTML=`
<div class="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-4">
 <div class="min-w-0 space-y-4">
  <section class="block p-3 sm:p-4">
   <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
    <button data-i="0" class="ph-btn col-span-4 sm:col-span-3 sm:row-span-2 relative rounded-lg overflow-hidden aspect-[4/5] sm:aspect-[3/4] bg-pd-lighter"><img src="${esc(P[0])}" alt="${esc(x.n)}" class="absolute inset-0 w-full h-full object-cover">${x.vip?'<span class="absolute top-2 left-2 mini !bg-gold !text-[#212529]">VIP</span>':''}${x.now?'<span class="absolute bottom-2 left-2 mini !bg-[#2f9e44] !text-[11px] !px-2 !py-0.5"><i class="fa fa-circle text-[6px]"></i> Nu beschikbaar</span>':''}</button>
    ${P.slice(1,7).map((p,i)=>`<button data-i="${i+1}" class="ph-btn relative col-span-2 sm:col-span-1 rounded-lg overflow-hidden aspect-[3/4] bg-pd-lighter"><img src="${esc(p)}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover">${i===5&&P.length>7?`<span class="absolute inset-0 bg-black/55 text-white font-bold flex items-center justify-center">+${P.length-7}</span>`:''}</button>`).join('')}
   </div>
  </section>
  <section class="block">
   <div class="p-4 sm:p-5">
    <div class="flex flex-wrap items-start gap-3 justify-between">
     <div class="min-w-0"><h1 class="text-[22px] font-bold text-[#212529] leading-tight flex items-center gap-2">${esc(x.n)}${x.v?'<i class="fa fa-circle-check text-pd text-[16px]" title="Geverifieerd"></i>':''}</h1>
     <div class="text-ink-muted">${esc(x.s)}</div></div>
     <div class="flex gap-2"><button type="button" data-bump="${x.id}" data-bump-name="${esc(x.n)}" class="btn btn-ghost !py-1.5 !px-3 !text-[12px]" title="Advertentie omhoog plaatsen"><i class="fa fa-circle-arrow-up"></i> Omhoog plaatsen</button><button data-fav="${x.id}" class="btn btn-ghost !py-1.5 !px-3 !text-[12px]"><i class="fa-regular fa-heart"></i> Bewaren</button></div>
    </div>
    <div class="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-[13px]">
     <span><i class="fa fa-location-dot text-pd mr-1"></i><a href="${cityPage(x.c)}" class="hover:text-pd">${esc(x.c)}</a></span>
     <span><i class="fa fa-venus-mars text-pd mr-1"></i>${x.g}${x.a?`, ${x.a} jaar`:''}</span>
     <span><i class="fa fa-check text-pd mr-1"></i>${esc(x.t)}</span>
     ${(x.langs||[]).length?`<span><i class="fa fa-language text-pd mr-1"></i>${x.langs.map(l=>LANG[l]||l).join(', ')}</span>`:''}
     <span><i class="fa fa-image text-pd mr-1"></i>${P.length} foto's</span>
    </div>
   </div>
   <div class="border-t border-line flex overflow-x-auto scrollbar-none text-[13px]" id="tabs">
     <button class="tab on" data-t="over">Over mij</button><button class="tab" data-t="prijzen">Tarieven</button><button class="tab" data-t="mog">Mogelijkheden</button><button class="tab" data-t="tijden">Beschikbaarheid</button>${vids.length?`<button class="tab" data-t="vids">Video's (${vids.length})</button>`:''}
   </div>
   <div class="p-4 sm:p-5 text-[13px]">
     <div data-p="over"><div class="leading-relaxed text-[14px]">${desc||'<span class="text-ink-muted">Geen omschrijving.</span>'}</div>${kenm?`<h3 class="font-semibold text-[#212529] mt-5 mb-1">Kenmerken</h3><div class="grid sm:grid-cols-2 gap-x-8">${kenm}</div>`:''}</div>
     <div data-p="prijzen" class="hidden max-w-lg">${prices}</div>
     <div data-p="mog" class="hidden"><div class="flex flex-wrap gap-1.5">${mog||'<span class="text-ink-muted">Niet opgegeven.</span>'}</div><p class="text-[11px] text-ink-muted mt-3">Bedragen achter een mogelijkheid zijn een toeslag op het basistarief.</p></div>
     <div data-p="tijden" class="hidden max-w-md">${avail||'<span class="text-ink-muted">Op afspraak.</span>'}</div>
     <div data-p="vids" class="hidden"><div class="grid grid-cols-2 sm:grid-cols-3 gap-2">${vids.map(v=>`<a href="videos.html?v=${encodeURIComponent(v.mp4)}" class="relative block rounded-lg overflow-hidden aspect-video bg-ink"><img src="${esc(v.thumb)}" alt="" loading="lazy" class="w-full h-full object-cover opacity-90"><span class="absolute inset-0 flex items-center justify-center"><span class="w-10 h-10 rounded-full bg-white/90 text-pd flex items-center justify-center"><i class="fa fa-play"></i></span></span></a>`).join('')}</div></div>
   </div>
  </section>
  <section class="block p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-[13px]">
   <div class="flex items-start gap-3"><i class="fa fa-shield-halved text-pd text-lg mt-0.5"></i><p class="text-ink-muted">Klopt er iets niet aan deze advertentie, of vermoed je dwang of minderjarigheid? Meld het ons – we reageren binnen 24 uur.</p></div>
   <a href="melden.html?id=${x.id}" class="btn btn-ghost !py-1.5 !text-[12px] shrink-0"><i class="fa fa-flag"></i> Advertentie melden</a>
  </section>
 </div>
 <aside class="space-y-3">
  <div class="block p-4 lg:sticky lg:top-[70px]">
   <div class="text-[12px] text-ink-muted">Vanaf</div><div class="text-[26px] font-bold text-[#212529] leading-none">${x.p?'€ '+x.p:'Op aanvraag'}</div>
   <a href="${esc(x.href)}" target="_blank" rel="noopener" class="btn btn-pd w-full mt-4"><i class="fa fa-phone"></i> Contactgegevens bekijken</a>
   <a href="chatten.html" class="btn btn-ghost w-full mt-2"><i class="fa fa-comments"></i> Chat met leden</a>
   <p class="text-[11px] text-ink-muted mt-3 leading-snug"><i class="fa fa-circle-info mr-1"></i>Je neemt rechtstreeks contact op met de adverteerder. Zeg dat je via Paydates.nl komt.</p>
   <div class="mt-4 pt-4 border-t border-line text-[12px] space-y-1.5">
    <div><i class="fa ${x.v?'fa-circle-check text-pd':'fa-circle text-ink-soft'} mr-1.5"></i>${x.v?'Geverifieerde adverteerder':'Nog niet geverifieerd'}</div>
    <div><i class="fa fa-circle-arrow-up text-ink-muted mr-1.5"></i>Laatst omhoog: <span data-bumped-label>${x.ago||'onbekend'}</span></div>
    <div><i class="fa fa-hashtag text-ink-muted mr-1.5"></i>Advertentie ${x.id}</div>
   </div>
  </div>
  <div class="block p-4">
   <div class="flex items-start gap-3"><span class="w-10 h-10 rounded-full bg-[#7351c017] text-pd flex items-center justify-center shrink-0"><i class="fa fa-circle-arrow-up"></i></span>
   <div class="min-w-0"><div class="font-semibold text-[#212529]">Is dit jouw advertentie?</div><p class="text-[12px] text-ink-muted leading-snug mt-0.5">Plaats hem direct weer bovenaan in ${esc(x.c)}. Betalen via 0906 of sms.</p></div></div>
   <button type="button" data-bump="${x.id}" data-bump-name="${esc(x.n)}" class="btn btn-pd w-full mt-3"><i class="fa fa-circle-arrow-up"></i> Omhoog plaatsen</button>
   <div class="flex justify-center gap-4 mt-2 text-[11px] text-ink-muted"><span><i class="fa fa-phone mr-1"></i>Bellen</span><span><i class="fa fa-comment-sms mr-1"></i>SMS 3010</span><span><a href="credits.html" class="hover:text-pd"><i class="fa fa-coins mr-1"></i>Credits</a></span></div>
  </div>
  <a href="adverteren.html#vip" class="adc adc-gold flex-col p-4"><div class="text-[11px] font-bold tracking-[.2em] text-gold">VIP BOOST</div><div class="text-[17px] font-bold mt-1">Ook zo zichtbaar worden?</div><p class="text-[12px] text-white/80 mt-1">Sta bovenaan in jouw stad met een gouden kader.</p><span class="adbtn shine py-2 mt-3 text-[12px]">Bekijk VIP</span></a>
 </aside>
</div>
<section class="mt-6"><div class="flex items-end justify-between mb-3"><h2 class="text-[15px] font-semibold text-[#212529]">Vergelijkbare advertenties</h2><a href="${cityPage(x.c)}" class="text-[12px] text-pd">Meer in ${esc(x.c)} <i class="fa fa-angle-right"></i></a></div>
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">${sim.map(a=>card(a)).join('')}</div></section>
<div class="pd-above-bnav lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line px-3 py-2.5 flex items-center gap-3 shadow-[0_-6px_20px_rgba(0,0,0,.08)]"><div class="min-w-0"><div class="text-[11px] text-ink-muted truncate">${esc(x.n)} · ${esc(x.c)}</div><div class="font-bold text-[#212529]">${x.p?'Vanaf € '+x.p:'Op aanvraag'}</div></div><a href="${esc(x.href)}" target="_blank" rel="noopener" class="btn btn-pd ml-auto !py-2 !text-[13px]"><i class="fa fa-phone"></i> Contact</a></div><div class="lg:hidden h-16"></div>`;
$$('#tabs .tab').forEach(t=>t.onclick=()=>{$$('#tabs .tab').forEach(b=>b.classList.toggle('on',b===t));$$('[data-p]').forEach(p=>p.classList.toggle('hidden',p.dataset.p!==t.dataset.t));});
// lightbox
let cur=0;const lb=$('#lb');const show=i=>{cur=(i+P.length)%P.length;$('#lbI').src=P[cur];$('#lbC').textContent=`${cur+1} / ${P.length}`;};
$$('.ph-btn').forEach(b=>b.onclick=()=>{show(+b.dataset.i);lb.classList.remove('hidden');});
$('#lbX').onclick=()=>lb.classList.add('hidden');$('#lbP').onclick=()=>show(cur-1);$('#lbN').onclick=()=>show(cur+1);
lb.onclick=e=>{if(e.target===lb)lb.classList.add('hidden')};
addEventListener('keydown',e=>{if(lb.classList.contains('hidden'))return;if(e.key==='Escape')lb.classList.add('hidden');if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1);});
})();
</script>'''
script+='\n<script src="assets/bump.js"></script>'
built.append(page('advertentie.html','Advertentie | Paydates.nl','Bekijk foto\'s, tarieven, mogelijkheden en beschikbaarheid van deze adverteerder op Paydates.nl.',body,'',script))

# ---------- videos.html ----------
from videos_page import build_videos
built.append(build_videos())

# ---------- chatten.html ----------
ROOMS=[('nederland','Heel Nederland','Algemeen','De grote chatroom voor heel Nederland'),('noord-holland','Noord-Holland',"Regio's",'Amsterdam, Haarlem, Alkmaar, Hoorn…'),('zuid-holland','Zuid-Holland',"Regio's",'Rotterdam, Den Haag, Leiden, Dordrecht…'),('utrecht','Utrecht',"Regio's",'Utrecht, Amersfoort, Zeist…'),('noord-brabant','Noord-Brabant',"Regio's",'Eindhoven, Tilburg, Breda, Den Bosch…'),('gelderland','Gelderland',"Regio's",'Arnhem, Nijmegen, Apeldoorn…'),('overijssel','Overijssel',"Regio's",'Enschede, Zwolle, Deventer…'),('limburg','Limburg',"Regio's",'Maastricht, Venlo, Heerlen…'),('noorden','Groningen / Friesland / Drenthe',"Regio's",'Het hoge noorden'),('zeeland','Zeeland',"Regio's",'Middelburg, Vlissingen, Goes…'),('flevoland','Flevoland',"Regio's",'Almere, Lelystad…'),('stellen','Stellen & Swingers',"Thema's",'Voor stellen en wie stellen zoekt'),('shemale','Shemale & Trans',"Thema's",'Trans- en shemale-chat'),('gay-bi','Gay & Bi',"Thema's",'Mannen en bi-chat'),('fantasie','Spanning & Fantasie',"Thema's",'Fantasieën delen, respectvol')]
body=f'''<div class="max-w-[1500px] mx-auto px-3 lg:px-6 py-4">
 {crumbs([('Chatten',None)])}
 <div class="mt-2 mb-4 flex flex-wrap items-end justify-between gap-3">
  <div><h1 class="text-[22px] font-bold text-[#212529]"><i class="fa fa-comments text-pd mr-1"></i>Paydates Chat</h1>
  <p class="text-ink-muted text-[13px]">Chatrooms per regio en thema. Alleen echte, ingelogde leden – geen bots of nepprofielen.</p></div>
  <a href="login.html?next=chatten.html" class="btn btn-pd !py-2"><i class="fa fa-right-to-bracket"></i> Inloggen om te chatten</a>
 </div>
 <div class="grid lg:grid-cols-[260px_minmax(0,1fr)_260px] gap-3">
  <aside class="block overflow-hidden lg:h-[640px] flex flex-col">
   <div class="block-h">Chatrooms</div>
   <div class="p-2 border-b border-line"><input id="rf" type="search" class="inp !py-1.5 !text-[13px]" placeholder="Zoek een room…"></div>
   <nav id="roomList" class="overflow-y-auto p-2 flex lg:block gap-1.5 lg:space-y-0.5 overflow-x-auto scrollbar-none"></nav>
  </aside>
  <section class="block overflow-hidden flex flex-col h-[560px] lg:h-[640px]">
   <div class="px-4 py-3 border-b border-line flex items-center gap-3"><span class="w-9 h-9 rounded-full bg-[#7351c017] text-pd flex items-center justify-center font-bold">#</span><div class="min-w-0"><div id="rn" class="font-semibold text-[#212529] truncate"></div><div id="rt" class="text-[11px] text-ink-muted truncate"></div></div></div>
   <div id="msgs" class="flex-1 overflow-y-auto p-4 space-y-3 bg-body-light text-[13px]"></div>
   <form id="composer" class="border-t border-line p-3 flex gap-2" onsubmit="event.preventDefault();location.href='login.html?next=chatten.html'">
    <input disabled class="inp !py-2 flex-1 bg-body-light" placeholder="Log in om berichten te sturen…">
    <button class="btn btn-pd !py-2 !px-4"><i class="fa fa-right-to-bracket"></i><span class="hidden sm:inline"> Inloggen</span></button>
   </form>
  </section>
  <aside class="space-y-3">
   <div class="block"><div class="block-h">Zo werkt het</div><ul class="p-4 space-y-2.5 text-[13px]">
    <li class="flex gap-2"><i class="fa fa-user-check text-pd mt-0.5"></i><span>Gratis account aanmaken en inloggen. Je chatnaam is je Paydates-gebruikersnaam.</span></li>
    <li class="flex gap-2"><i class="fa fa-unlock text-pd mt-0.5"></i><span>Gratis chatten zolang er minder dan 10 mensen in een room zijn.</span></li>
    <li class="flex gap-2"><i class="fa fa-ticket text-gold mt-0.5"></i><span>Drukker? Dan heb je een <b>chatpas</b> nodig (24 uur) – met credits, via sms of 0900.</span></li>
    <li class="flex gap-2"><i class="fa fa-lock text-pd mt-0.5"></i><span>Privéberichten met leden die jij toelaat.</span></li></ul>
    <div class="px-4 pb-4"><a href="credits.html#chatpas" class="btn btn-ghost w-full !py-2 !text-[12px]"><i class="fa fa-coins text-gold"></i> Chatpas met credits</a></div></div>
   <div class="block"><div class="block-h">Huisregels</div><ul class="p-4 space-y-1.5 text-[12px] text-ink-muted list-disc pl-8">
    <li>Adverteerders alleen 21+, bezoekers 18+. Elk signaal van minderjarigheid of dwang wordt direct gemeld.</li><li>Respectvol: geen schelden, discriminatie of intimidatie.</li><li>Geen telefoonnummers of links in publieke rooms – die worden afgeschermd.</li><li>Geen spam of reclame; adverteren doe je via een <a href="adverteren.html" class="text-pd">advertentie</a>.</li><li>Moderators kunnen dempen en blokkeren. <a href="melden.html" class="text-pd">Melden</a></li></ul></div>
  </aside>
 </div>
</div>'''
script='<script>(function(){const {$,$$,esc}=PD;const R='+json.dumps([dict(id=a,n=b,g=c,t=d) for a,b,c,d in ROOMS],ensure_ascii=False)+r''';
const alias={'landelijk':'nederland','amsterdam':'noord-holland','rotterdam':'zuid-holland','den-haag':'zuid-holland','brabant':'noord-brabant','noorden':'noorden'};
let q='';function list(){let h='',g='';R.filter(r=>!q||(r.n+' '+r.t).toLowerCase().includes(q)).forEach(r=>{if(r.g!==g){g=r.g;h+=`<div class="hidden lg:block text-[10px] font-bold uppercase tracking-wider text-ink-soft px-2 pt-3 pb-1">${g}</div>`;}
 h+=`<a href="#room-${r.id}" data-room="${r.id}" class="room shrink-0 flex items-center gap-2 rounded px-2.5 py-2 hover:bg-[#7351c017] whitespace-nowrap lg:whitespace-normal border lg:border-0 border-line"><span class="text-pd font-bold">#</span><span class="truncate text-[13px]">${esc(r.n)}</span></a>`});$('#roomList').innerHTML=h;mark();}
function cur(){const h=decodeURIComponent(location.hash.replace('#room-','')).toLowerCase().replace(/\s+/g,'-');return R.find(r=>r.id===h)||R.find(r=>r.id===alias[h])||R[0];}
function mark(){const r=cur();$$('.room').forEach(a=>{const on=a.dataset.room===r.id;a.classList.toggle('bg-[#7351c017]',on);a.classList.toggle('text-pd',on);a.classList.toggle('font-semibold',on)});}
function show(){const r=cur();$('#rn').textContent='#'+r.n;$('#rt').textContent=r.t;mark();
 $('#msgs').innerHTML=`<div class="flex gap-2.5"><span class="w-8 h-8 shrink-0 rounded-full bg-pd text-white flex items-center justify-center text-[12px]"><i class="fa fa-house"></i></span><div class="bg-white rounded-lg shadow-block px-3 py-2 max-w-[85%]"><div class="text-[11px] font-bold text-pd">Huisbot</div><p>Welkom in <b>#${esc(r.n)}</b>. ${esc(r.t)}. Log in om de gesprekken te zien en mee te praten.</p></div></div>
 <div class="flex gap-2.5"><span class="w-8 h-8 shrink-0 rounded-full bg-pd text-white flex items-center justify-center text-[12px]"><i class="fa fa-house"></i></span><div class="bg-white rounded-lg shadow-block px-3 py-2 max-w-[85%]"><div class="text-[11px] font-bold text-pd">Huisbot</div><p>Houd het respectvol en deel geen telefoonnummers in de openbare room. Gebruik privéberichten als jullie allebei willen.</p></div></div>
 <div class="text-center pt-6"><div class="inline-block block px-5 py-4 text-center"><i class="fa fa-lock text-pd-light text-2xl"></i><p class="text-ink-muted mt-2">Berichten zijn alleen zichtbaar voor ingelogde leden.</p><div class="flex gap-2 justify-center mt-3"><a href="login.html?next=chatten.html" class="btn btn-pd !py-1.5 !text-[12px]">Inloggen</a><a href="register.html?type=klant" class="btn btn-ghost !py-1.5 !text-[12px]">Gratis account</a></div></div></div>`;}
$('#rf').oninput=e=>{q=e.target.value.toLowerCase();list()};addEventListener('hashchange',show);list();show();})();</script>'''
built.append(page('chatten.html','Paydates Chat – chatrooms per regio | Paydates.nl','Chat live met echte leden van Paydates.nl in chatrooms per regio en thema: Noord-Holland, Zuid-Holland, Brabant, stellen, trans en meer.',body,'chatten',script))
json.dump(built,open('_built2.json','w'));print(built)
