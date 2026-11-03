/* Paydates V2 — generieke clubpagina: club.html?id=<slug>. Data uit clubs-data.js + beheer (clubs-store.js).
   Alleen gepubliceerde clubs zijn publiek; concept/gearchiveerd alleen als preview voor admin (?preview=1). */
(function(){
'use strict';
var C=window.PDXClubs, root=document.getElementById('clubPage'); if(!C||!root)return;
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var qp=new URLSearchParams(location.search), id=qp.get('id')||'';
var DAYS=['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'];
var isAdm=false;try{var s=JSON.parse(localStorage.getItem('pdx_session')||'null'),d=JSON.parse(localStorage.getItem('pdx_v1')||'null');var u=s&&d&&d.users.find(function(x){return x.id===s.id;});isAdm=!!(u&&(u.role==='admin'||u.role==='moderator'));}catch(e){}
function telHref(p){var n=String(p||'').replace(/[^\d+]/g,'');if(/^0\d{9}$/.test(n))n='+31'+n.slice(1);return 'tel:'+n;}
function draw(){
  var v=C.get(id);
  if(!v||(v.pub!=='gepubliceerd'&&!(isAdm&&qp.get('preview')))){document.title='Club niet gevonden | Paydates.nl';
    root.innerHTML='<div class="block p-8 text-center text-[13px] text-ink-muted"><i class="fa fa-building text-pd text-2xl mb-2 block"></i>'+(v&&v.pub==='gearchiveerd'?'Deze locatie staat niet (meer) op Paydates.':'Deze club of dit privéhuis is niet gevonden.')+'<br><a href="seksclubs.html" class="text-pd font-semibold">Bekijk alle seksclubs &amp; privéhuizen</a></div>';return;}
  if(v.page&&!qp.get('preview')){location.replace(v.page+'.html');return;}
  var o=C.openState(v.hours), cl=C.claimOf(v), me=C.url(v);
  document.title=v.name+' '+v.city+' – '+v.type.toLowerCase()+' | Paydates.nl';
  var md=document.querySelector('meta[name=description]');if(md)md.content=v.name+', '+v.type.toLowerCase()+' in '+v.city+': adres, openingstijden en contact op Paydates.nl.';
  var cn=document.querySelector('link[rel=canonical]');if(cn)cn.href='https://paydates.nl/club.html?id='+encodeURIComponent(v.id);
  var addr=[v.addr,[v.pc,v.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  var route=addr?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(v.name+' '+addr):'';
  var btn=function(h,ic,t,pd,ext){return '<a href="'+esc(h)+'" class="btn '+(pd?'btn-pd':'btn-ghost')+' !py-2 !text-[13px]"'+(ext?' target="_blank" rel="noopener nofollow"':'')+'><i class="fa '+ic+'"></i> '+t+'</a>';};
  var hrs=v.hours?'<table class="w-full text-[13px]">'+DAYS.map(function(dn,i){var h=v.hours[i];return '<tr data-day="'+i+'" class="'+(i===(new Date().getDay()+6)%7?'sc-today':'')+'"><td class="py-1.5 pr-3">'+dn+'</td><td class="py-1.5 text-right font-semibold '+(h?'text-[#212529]':'text-ink-soft')+'">'+(h?h[0]+' – '+h[1]:'Gesloten')+'</td></tr>';}).join('')+'</table>':'<p class="text-[13px] text-ink-muted">Openingstijden zijn nog niet bevestigd. Bel of kijk op de website van de locatie voordat je gaat.</p>';
  var more=C.sort(C.published().filter(function(x){return x.id!==v.id&&x.type!=='Parenclub'===(v.type!=='Parenclub')&&x.prov===v.prov;})).slice(0,6);
  root.innerHTML='<nav class="crumbs flex flex-wrap items-center gap-1.5"><a href="index.html"><i class="fa fa-house"></i></a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><a href="seksclubs.html">Seksclubs &amp; Privéhuizen</a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><a href="seksclubs.html?prov='+encodeURIComponent(v.prov)+'">'+esc(v.prov)+'</a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><span class="text-ink">'+esc(v.name)+'</span></nav>'+
   (v.pub!=='gepubliceerd'?'<div class="block p-3 mt-2 text-[12.5px]" style="border-left:3px solid #f08c00"><b>Admin-preview</b> · status: '+esc(v.pub)+' — niet zichtbaar voor bezoekers.</div>':'')+
   '<section class="sc-cover mt-2"><div class="sc-cover-img">'+(v.img?'<img src="'+esc(v.img)+'" alt="'+esc(v.name)+'" class="w-full h-full object-cover">':'<div class="sc-cover-ph sc-ph-fb '+(v.type==='Privéhuis'?'sc-ph-prive':'sc-ph-club')+'"><i class="fa '+(v.type==='Privéhuis'?'fa-house-chimney-window':v.type==='Parenclub'?'fa-people-arrows':'fa-champagne-glasses')+'"></i><span>'+esc(v.name)+'</span></div>')+'</div><div class="sc-cover-ov"></div>'+
   '<div class="sc-cover-in"><div class="flex flex-wrap gap-1.5 mb-2"><span class="sc-badge">'+esc(v.type)+'</span>'+(v.pack==='spotlight'?'<span class="sc-badge sc-badge-gold"><i class="fa fa-crown"></i> Spotlight</span>':v.pack==='premium'?'<span class="sc-badge sc-badge-gold"><i class="fa fa-star"></i> Premium</span>':'')+(cl==='geclaimd'?'<span class="sc-badge"><i class="fa fa-circle-check"></i> Beheerd door de club</span>':'')+'</div>'+
   '<h1 class="text-[24px] sm:text-[32px] font-bold text-white leading-tight">'+esc(v.name)+'</h1><p class="text-white/85 text-[13.5px] mt-1"><i class="fa fa-location-dot mr-1"></i>'+esc(v.city)+', '+esc(v.prov)+'</p>'+
   (o?'<div class="sc-open sc-open-dark mt-2'+(o.open?' is-open':'')+'"><span class="sc-dot'+(o.open?' on':'')+'"></span>'+esc(o.txt)+'</div>':'')+'</div></section>'+
   '<div class="flex flex-wrap gap-2 mt-3">'+(v.web?btn(v.web,'fa-globe','Website',1,1):'')+(v.phone?btn(telHref(v.phone),'fa-phone','Bel '+esc(v.phone),!v.web):'')+(route?btn(route,'fa-route','Route',0,1):'')+'</div>'+
   '<div class="flex flex-col lg:flex-row gap-4 mt-4"><main class="flex-1 min-w-0">'+
   '<section class="block p-5"><h2 class="text-[16px] font-bold text-[#212529]">Over '+esc(v.name)+'</h2><div class="text-[13.5px] leading-relaxed text-ink mt-2"><p>'+(v.intro?esc(v.intro):esc(v.name)+' is een '+esc(v.type.toLowerCase())+' in '+esc(v.city)+' ('+esc(v.prov)+'). De beschrijving, foto’s en faciliteiten vult de club zelf aan na het claimen van dit profiel.')+'</p></div></section>'+
   ((v.fac||[]).length?'<section class="block p-5 mt-4"><h2 class="text-[16px] font-bold text-[#212529]">Faciliteiten</h2><div class="flex flex-wrap gap-2 mt-3">'+v.fac.map(function(f){return '<span class="bc pill px-3 py-1.5 text-[12px]"><i class="fa fa-check text-pd mr-1"></i>'+esc(f)+'</span>';}).join('')+'</div></section>':'')+
   '<a href="jobs.html" class="block p-5 mt-4 flex items-center gap-4 hover:shadow-md transition"><div class="w-11 h-11 shrink-0 rounded-full bg-[#7351c017] text-pd flex items-center justify-center"><i class="fa fa-briefcase"></i></div><div class="flex-1"><div class="text-[14px] font-bold text-[#212529]">Werken bij '+esc(v.name)+'?</div><p class="text-[12px] text-ink-muted">Bekijk vacatures bij clubs en privéhuizen via Werken bij een seksbedrijf.</p></div><i class="fa fa-angle-right text-pd"></i></a>'+
   (v.pack!=='spotlight'?'<a href="adverteren.html#bedrijf" class="adc adc-gold p-5 flex-col sm:flex-row sm:items-center gap-4 mt-4"><div class="flex-1"><div class="text-[11px] font-bold tracking-[.18em] text-gold"><i class="fa fa-crown mr-1"></i>CLUB SPOTLIGHT</div><div class="text-[16px] font-bold leading-tight mt-1">Wil je '+esc(v.name)+' bovenaan in '+esc(v.prov)+'?</div><p class="text-[12px] text-white/80 mt-1">Premium en Spotlight: foto’s, statistieken en een plek bovenaan de hub en je provincie.</p></div><span class="adbtn shine py-2 px-4 text-[12px] shrink-0">Bekijk pakketten</span></a>':'')+
   '<p class="text-[11px] text-ink-soft mt-4">Gegevens uit openbare bronnen'+(v.checked?', laatst gecontroleerd '+esc(v.checked.split('-').reverse().join('-')):'')+'. Klopt iets niet? <a href="melden.html?ad='+encodeURIComponent(me)+'" class="text-pd">Meld het</a>.</p>'+
   '</main><aside class="w-full lg:w-[300px] shrink-0 space-y-3">'+
   '<div class="block"><div class="block-h"><i class="fa fa-clock text-pd mr-1.5"></i>Openingstijden</div><div class="p-4">'+hrs+'</div></div>'+
   (cl!=='geclaimd'?'<div class="block"><div class="block-h"><i class="fa fa-hand text-pd mr-1.5"></i>Is dit jouw bedrijf?</div><div class="p-4 text-[13px]">'+(cl==='claim aangevraagd'?'Er loopt al een claim voor dit profiel; we controleren KvK en telefoonnummer.':'Claim dit profiel om gegevens, openingstijden en foto’s zelf te beheren.<div style="margin-top:10px"><a class="btn btn-ghost" href="bedrijf-claimen.html?club='+encodeURIComponent(v.name)+'&amp;ref='+encodeURIComponent(me)+'"><i class="fa fa-hand"></i> Claim dit profiel</a></div>')+'</div></div>':'')+
   '<div class="block"><div class="block-h"><i class="fa fa-address-card text-pd mr-1.5"></i>Contact &amp; locatie</div><ul class="p-4 space-y-2 text-[13px]">'+
    '<li class="flex gap-2"><i class="fa fa-location-dot text-pd mt-0.5"></i><span>'+esc(addr||v.city+' (adres nog niet bevestigd)')+'</span></li>'+
    (v.phone?'<li class="flex gap-2"><i class="fa fa-phone text-pd mt-0.5"></i><a href="'+esc(telHref(v.phone))+'" class="hover:text-pd">'+esc(v.phone)+'</a></li>':'')+
    (v.web?'<li class="flex gap-2"><i class="fa fa-globe text-pd mt-0.5"></i><a href="'+esc(v.web)+'" target="_blank" rel="noopener nofollow" class="hover:text-pd break-all">'+esc(v.web.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,''))+'</a></li>':'')+
    (v.email?'<li class="flex gap-2"><i class="fa fa-envelope text-pd mt-0.5"></i><a href="mailto:'+esc(v.email)+'" class="hover:text-pd">'+esc(v.email)+'</a></li>':'')+'</ul></div>'+
   (more.length?'<div class="block"><div class="block-h">Meer in '+esc(v.prov)+'</div><ul class="p-4 space-y-2 text-[13px]">'+more.map(function(x){return '<li><a href="'+esc(C.url(x))+'" class="flex items-center justify-between gap-2 hover:text-pd"><span class="truncate">'+esc(x.name)+'</span><span class="text-[11px] text-ink-soft shrink-0">'+esc(x.type)+' · '+esc(x.city)+'</span></a></li>';}).join('')+'</ul></div>':'')+
   '</aside></div>';
  if(window.PDX&&PDX.track&&!draw.t){draw.t=1;var key='club.html?id='+v.id;PDX.track(key,'view');document.addEventListener('click',function(e){var a=e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href');if(/^tel:/.test(h))PDX.track(key,'tel');else if(/^https?:/.test(h)&&a.host!==location.host&&!/google\.com\/maps/.test(h))PDX.track(key,'web');},true);}
}
draw();window.addEventListener('pdx:clubs',draw);
})();
