# Publiek profiel: profiel.html?u=gebruikersnaam  (productie: paydates.nl/<gebruikersnaam>)
from layout import *
body='''<div class="max-w-[1100px] mx-auto px-3 lg:px-6 py-5"><div id="pcrumb"></div><div id="prof" class="mt-3"></div></div>'''
sc=r'''<script>
(function(){const {D,$,esc,card,slug,qs,cityPage}=PD;
const u=slug(qs('u')||location.pathname.split('/').pop().replace(/\.html$/,''));
const ads=D.L.filter(a=>slug(a.n)===u);
const el=$('#prof');
$('#pcrumb').innerHTML=`<nav class="crumbs flex flex-wrap items-center gap-1.5"><a href="index.html"><i class="fa fa-house"></i></a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><span>Profielen</span><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><span class="text-ink">${esc(u||'onbekend')}</span></nav>`;
if(!ads.length){document.title='Profiel niet gevonden | Paydates.nl';
  el.innerHTML=`<section class="block p-8 text-center"><i class="fa fa-user-slash text-3xl text-ink-soft"></i><h1 class="text-[20px] font-bold text-[#212529] mt-3">Profiel niet gevonden</h1><p class="text-ink-muted mt-1">Dit profiel bestaat niet (meer) of is afgeschermd.</p><a href="search.html" class="btn btn-pd mt-5">Zoek een paydate</a></section>`;return;}
const x=ads[0];const name=x.n;
const isBedrijf=x.type==='bedrijf'||x.bedrijf===true;              // backend: account_type
const vids=D.V.filter(v=>ads.some(a=>a.id===v.ad));
const reviews=x.reviews||[];                                          // backend: reviews geschreven door dit account
const open=ads.length>0;                                              // backend: open_for_paydates
document.title=`${name} (@${u}) – profiel | Paydates.nl`;
document.querySelector('meta[name=description]').content=`Bekijk het profiel van ${name} op Paydates.nl: ${isBedrijf?'bedrijf':'sekswerker'} in ${x.c}, advertenties, video's en reviews.`;
const l=document.createElement('link');l.rel='canonical';l.href='https://paydates.nl/'+u;document.head.appendChild(l);
const stat=(n,t,ic)=>`<div class="text-center px-3"><div class="text-[20px] font-bold text-[#212529] leading-none">${n}</div><div class="text-[11px] text-ink-muted mt-1"><i class="fa ${ic} mr-1"></i>${t}</div></div>`;
el.innerHTML=`
<section class="block overflow-hidden">
 <div class="hero-bg h-24 sm:h-32"></div>
 <div class="px-4 sm:px-6 pb-5 -mt-12 sm:-mt-14 flex flex-col sm:flex-row sm:items-end gap-4">
  <img src="${esc(x.img)}" alt="${esc(name)}" class="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg bg-pd-lighter">
  <div class="min-w-0 flex-1">
   <h1 class="text-[22px] font-bold text-[#212529] leading-tight flex items-center gap-2">${esc(name)}${x.v?'<i class="fa fa-circle-check text-pd text-[16px]" title="Geverifieerd"></i>':''}</h1>
   <div class="text-ink-muted text-[13px]">@${esc(u)} · <i class="fa fa-location-dot text-pd"></i> ${esc(x.c)}</div>
   <div class="flex flex-wrap gap-1.5 mt-2 text-[11px] font-semibold">
    <span class="rounded-pill px-2.5 py-1 ${isBedrijf?'bg-pd-darker text-white':'bg-pd text-white'}"><i class="fa ${isBedrijf?'fa-building':'fa-user'} mr-1"></i>${isBedrijf?'Bedrijf':'Sekswerker'}</span>
    <span class="rounded-pill px-2.5 py-1 bg-[#7351c012] text-pd">${esc(x.t)}</span>
    ${open?'<span class="rounded-pill px-2.5 py-1 bg-[#2f9e4420] text-[#2b8a3e]"><i class="fa fa-circle text-[6px] mr-1 align-middle"></i>Open voor paydates</span>':'<span class="rounded-pill px-2.5 py-1 bg-[#dfe4f1] text-ink-muted">Niet open voor paydates</span>'}
    ${x.vip?'<span class="rounded-pill px-2.5 py-1 bg-gold text-[#212529]">VIP</span>':''}
   </div>
  </div>
  <div class="flex divide-x divide-line">${stat(ads.length,'advertentie'+(ads.length>1?'s':''),'fa-rectangle-list')}${stat(vids.length,"video's",'fa-film')}${stat(reviews.length,'reviews geschreven','fa-star')}</div>
 </div>
</section>
<div class="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-4 mt-4">
 <div class="space-y-4 min-w-0">
  <section><h2 class="text-[15px] font-semibold text-[#212529] mb-2">Advertenties van ${esc(name)}</h2><div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">${ads.map(a=>card(a)).join('')}</div></section>
  ${vids.length?`<section class="block p-4"><div class="flex justify-between items-end mb-2"><h2 class="text-[15px] font-semibold text-[#212529]">Video's</h2><a href="advertentie.html?id=${x.id}&media=videos" class="text-[12px] text-pd">Bekijk op advertentie <i class="fa fa-angle-right"></i></a></div><div class="grid grid-cols-2 sm:grid-cols-3 gap-2">${vids.map(v=>`<a href="videos.html?v=${encodeURIComponent(v.mp4)}" class="group block"><span class="relative block aspect-video rounded-md overflow-hidden bg-ink"><img src="${esc(v.thumb)}" alt="" loading="lazy" class="w-full h-full object-cover"><span class="absolute inset-0 flex items-center justify-center"><span class="w-9 h-9 rounded-full bg-white/90 text-pd flex items-center justify-center"><i class="fa fa-play ml-0.5"></i></span></span></span><span class="block text-[12px] mt-1 line-clamp-2 group-hover:text-pd">${esc(v.title)}</span></a>`).join('')}</div></section>`:''}
  <section class="block"><div class="block-h">Reviews geschreven door ${esc(name)}</div>${reviews.length?reviews.map(r=>`<div class="p-4 border-b border-line last:border-0"><div class="flex justify-between"><a href="advertentie.html?id=${r.ad}" class="font-semibold text-pd">${esc(r.about)}</a><span class="text-gold">${'★'.repeat(r.stars)}</span></div><p class="text-[13px] text-ink mt-1">${esc(r.text)}</p></div>`).join(''):'<div class="p-6 text-center text-ink-muted"><i class="fa fa-star text-ink-soft text-xl"></i><p class="mt-2">Nog geen reviews geschreven.</p></div>'}</section>
 </div>
 <aside class="space-y-3">
  <div class="block p-4 text-[13px] space-y-2">
   <div class="font-semibold text-[#212529]">Over dit profiel</div>
   <div class="flex justify-between"><span class="text-ink-muted">Accounttype</span><b>${isBedrijf?'Bedrijf':'Sekswerker'}</b></div>
   <div class="flex justify-between"><span class="text-ink-muted">Open voor paydates</span><b class="${open?'text-[#2b8a3e]':''}">${open?'Ja':'Nee'}</b></div>
   <div class="flex justify-between"><span class="text-ink-muted">Werkgebied</span><a href="${cityPage(x.c)}" class="text-pd font-semibold">${esc(x.c)}</a></div>
   <div class="flex justify-between"><span class="text-ink-muted">Geverifieerd</span><b>${x.v?'Ja':'Nee'}</b></div>
   <div class="flex justify-between"><span class="text-ink-muted">Laatst actief</span><b>${esc(x.ago||'onbekend')}</b></div>
  </div>
  <a href="advertentie.html?id=${x.id}" class="btn btn-pd w-full"><i class="fa fa-phone"></i> Naar advertentie</a>
  <a href="melden.html?id=${x.id}" class="btn btn-ghost w-full !text-[12px]"><i class="fa fa-flag"></i> Profiel melden</a>
 </aside>
</div>`;
})();
</script>'''
page('profiel.html','Profiel | Paydates.nl','Publiek profiel op Paydates.nl: advertenties, video\'s, reviews en of iemand open staat voor paydates.',body,'',sc)
print('profiel.html')
