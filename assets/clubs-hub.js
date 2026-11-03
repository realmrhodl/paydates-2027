/* Paydates V2 — publieke seksclubs-hub. Rendert ALLE gepubliceerde clubs/privéhuizen uit assets/clubs-data.js
   + beheerwijzigingen (Admin → Seksclubs-beheer, via clubs-store.js). Filters: ?type= ?prov= ?stad= ?q= */
(function(){
'use strict';
var C=window.PDXClubs, root=document.getElementById('scHub'); if(!C||!root)return;
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var qp=new URLSearchParams(location.search);
var F={type:qp.get('type')||'',prov:qp.get('prov')||'',q:qp.get('stad')||qp.get('q')||''};
var PROVS=['Drenthe','Flevoland','Friesland','Gelderland','Groningen','Limburg','Noord-Brabant','Noord-Holland','Overijssel','Utrecht','Zeeland','Zuid-Holland'];
var DAYS=['ma','di','wo','do','vr','za','zo'];
function hoursShort(H){if(!H)return '';var on=[];H.forEach(function(h,i){if(h)on.push(i);});if(!on.length)return '';var f=H[on[0]];
  var same=on.every(function(i){return H[i][0]===f[0]&&H[i][1]===f[1];});var span=on.length===7?'dagelijks':(on[on.length-1]-on[0]===on.length-1?DAYS[on[0]]+'–'+DAYS[on[on.length-1]]:on.map(function(i){return DAYS[i];}).join(', '));
  return same?span+' '+f[0]+'–'+f[1]:span+' (wisselend)';}
function icon(v){return v.type==='Privéhuis'?'fa-house-chimney-window':v.type==='Parenclub'?'fa-people-arrows':'fa-champagne-glasses';}
function card(v){var o=C.openState(v.hours);var cl=C.claimOf(v);
  return '<a href="'+esc(C.url(v))+'" class="sc-card block" data-id="'+esc(v.id)+'">'+
   '<div class="sc-card-img">'+(v.img?'<img src="'+esc(v.img)+'" alt="'+esc(v.name)+' in '+esc(v.city)+'" loading="lazy" class="sc-ph w-full h-full object-cover">':'<div class="sc-ph sc-ph-fb '+(v.type==='Privéhuis'?'sc-ph-prive':'sc-ph-club')+'"><i class="fa '+icon(v)+'"></i><span>'+esc(v.name)+'</span></div>')+
   '<div class="sc-card-tags"><span class="sc-badge">'+esc(v.type)+'</span>'+(v.pack==='spotlight'?'<span class="sc-badge sc-badge-gold"><i class="fa fa-crown"></i> Spotlight</span>':v.pack==='premium'?'<span class="sc-badge sc-badge-gold"><i class="fa fa-star"></i> Premium</span>':'')+'</div>'+(v.demo?'<span class="sc-demo">Voorbeeldprofiel</span>':'')+'</div>'+
   '<div class="p-3"><div class="font-bold text-[14px] text-[#212529] leading-tight truncate">'+esc(v.name)+(cl==='geclaimd'?' <i class="fa fa-circle-check text-pd text-[12px]" title="Profiel beheerd door de club"></i>':'')+'</div>'+
   '<div class="text-[12px] text-ink-muted mt-0.5 truncate"><i class="fa fa-location-dot text-pd mr-1"></i>'+esc(v.city)+(v.prov?', '+esc(v.prov):'')+'</div>'+
   (o?'<div class="sc-open mt-2'+(o.open?' is-open':'')+'"><span class="sc-dot'+(o.open?' on':'')+'"></span>'+esc(o.txt)+'</div>':'<div class="text-[11px] text-ink-soft mt-2"><i class="fa fa-clock mr-1"></i>Openingstijden onbekend</div>')+
   '</div></a>';}
function spot(L){var s=L.filter(function(v){return v.pack==='spotlight'&&v.img;})[0];if(!s)return '';var o=C.openState(s.hours);
  return '<section class="bx bx-band rounded-xl mb-2" aria-labelledby="scSpotT"><a class="bx-band-link" href="'+esc(C.url(s))+'" aria-label="'+esc(s.name)+' – bekijk clubprofiel">'+
   '<img src="'+esc(s.img)+'" alt="" class="bx-band-bg" loading="eager"><div class="bx-band-ov"></div><div class="bx-band-inner px-4 sm:px-6"><div class="bx-band-left">'+
   '<div class="bx-tags bx-tags-static"><span class="bx-badge"><i class="fa fa-crown"></i> Club Spotlight</span></div>'+(s.logo?'<img src="'+esc(s.logo)+'" alt="'+esc(s.name)+'" class="bx-logo">':'')+
   '<p class="bx-kicker">'+esc(s.type)+' · '+esc(s.city)+'</p><h2 id="scSpotT" class="bx-h">'+esc(s.name)+'</h2>'+(s.intro?'<p class="bx-lead">'+esc(s.intro)+'</p>':'')+
   '<div class="bx-cta-row"><span class="bx-cta">Bekijk clubprofiel <i class="fa fa-angle-right"></i></span>'+(o?'<span class="bx-cta2">'+esc(o.txt)+'</span>':'')+'</div></div></div></a></section>'+
   '<div class="flex justify-end mb-4"><a href="adverteren.html#bedrijf" class="text-[12px] text-ink-muted hover:text-pd"><i class="fa fa-crown text-gold mr-1"></i>Jouw club bovenaan? <b class="text-pd">Bekijk het Spotlight-pakket</b> <i class="fa fa-angle-right text-[10px]"></i></a></div>';}
function draw(){
  var P=C.sort(C.published());
  var main=P.filter(function(v){return F.type==='Parenclub'?v.type==='Parenclub':(F.type?v.type===F.type:v.type!=='Parenclub');});
  var q=F.q.toLowerCase().trim();
  var L=main.filter(function(v){return (!F.prov||v.prov===F.prov)&&(!q||[v.name,v.city,v.prov,(v.aliases||[]).join(' ')].join(' ').toLowerCase().indexOf(q)>-1);});
  var cnt={};P.filter(function(v){return v.type!=='Parenclub';}).forEach(function(v){cnt[v.prov]=(cnt[v.prov]||0)+1;});
  var nPar=P.filter(function(v){return v.type==='Parenclub';}).length;
  var cities={};main.forEach(function(v){cities[v.city]=1;});
  var pill=function(t,l,ic){return '<button type="button" data-sc-type="'+t+'" class="sctype pill '+(F.type===t?'on ':'')+'px-3.5 py-1.5 text-[12px]">'+(ic?'<i class="fa '+ic+' mr-1"></i>':'')+l+'</button>';};
  root.innerHTML=(F.type||F.prov||q?'':spot(P))+
   '<div class="block p-3 mb-3 flex flex-col lg:flex-row lg:items-center gap-2.5"><div class="flex flex-wrap gap-1.5" role="group" aria-label="Type">'+pill('','Alle')+pill('Seksclub','Seksclub','fa-champagne-glasses')+pill('Privéhuis','Privéhuis','fa-house-chimney-window')+pill('Parenclub','Parenclubs ('+nPar+')','fa-people-arrows')+'</div>'+
   '<select id="scProv" class="inp !py-2 !text-[13px] lg:ml-auto lg:w-[190px]" aria-label="Provincie"><option value="">Alle provincies</option>'+PROVS.map(function(p){return '<option '+(F.prov===p?'selected':'')+'>'+p+'</option>';}).join('')+'</select>'+
   '<div class="relative lg:w-[260px]"><i class="fa fa-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-pd text-xs"></i><input id="scCity" type="search" list="scCities" value="'+esc(F.q)+'" class="inp !py-2 !pl-8 !text-[13px]" placeholder="Zoek op stad of naam…" aria-label="Zoek op stad of naam"><datalist id="scCities">'+Object.keys(cities).sort().map(function(c){return '<option value="'+esc(c)+'">';}).join('')+'</datalist></div>'+
   '<span class="text-[12px] text-ink-muted whitespace-nowrap">'+L.length+' '+(L.length===1?'locatie':'locaties')+'</span></div>'+
   (F.type==='Parenclub'?'<p class="text-[12px] text-ink-muted mb-3"><i class="fa fa-people-arrows text-pd mr-1"></i>Parenclubs staan apart en worden niet gemengd met seksclubs en privéhuizen.</p>':'')+
   (L.length?'<div class="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">'+L.map(card).join('')+'</div>':
    '<div class="block p-6 text-center text-[13px] text-ink-muted"><i class="fa fa-magnifying-glass text-pd text-xl mb-2 block"></i>Geen clubs of privéhuizen gevonden voor deze zoekopdracht.<br><a href="register.html?type=bedrijf" class="text-pd font-semibold">Meld jouw club aan</a> en sta als eerste in deze regio.</div>')+
   '<section class="block p-4 mt-4" aria-labelledby="scProvT"><h2 id="scProvT" class="text-[15px] font-bold text-[#212529] mb-2">Seksclubs &amp; privéhuizen per provincie</h2><div class="flex flex-wrap gap-1.5">'+
    PROVS.map(function(p){return '<a href="seksclubs.html?prov='+encodeURIComponent(p)+'" data-prov="'+esc(p)+'" class="pill px-3 py-1.5 text-[12px]'+(F.prov===p?' on':'')+'">'+p+' <span class="text-ink-soft">('+(cnt[p]||0)+')</span></a>';}).join('')+'</div>'+
    '<p class="text-[11px] text-ink-soft mt-3">Gegevens komen uit openbare bronnen en worden door Paydates gecontroleerd. Klopt er iets niet of is een locatie gesloten? <a href="melden.html" class="text-pd">Meld het</a>. Eigenaar? <a href="bedrijf-claimen.html" class="text-pd">Claim je profiel</a>.</p></section>';
  [].forEach.call(root.querySelectorAll('[data-sc-type]'),function(b){b.onclick=function(){F.type=b.getAttribute('data-sc-type');sync();};});
  [].forEach.call(root.querySelectorAll('[data-prov]'),function(a){a.onclick=function(e){e.preventDefault();F.prov=F.prov===a.getAttribute('data-prov')?'':a.getAttribute('data-prov');sync();root.scrollIntoView({behavior:'smooth',block:'start'});};});
  document.getElementById('scProv').onchange=function(e){F.prov=e.target.value;sync();};
  var ci=document.getElementById('scCity');ci.oninput=function(e){F.q=e.target.value;var p=e.target.selectionStart;sync();var n=document.getElementById('scCity');n.focus();try{n.setSelectionRange(p,p);}catch(_){}};
}
function sync(){var u=new URLSearchParams();if(F.type)u.set('type',F.type);if(F.prov)u.set('prov',F.prov);if(F.q)u.set('stad',F.q);history.replaceState(null,'',location.pathname+(u.toString()?'?'+u:''));
  var h=document.querySelector('h1');if(h)h.textContent=(F.type==='Parenclub'?'Parenclubs':'Seksclubs & Privéhuizen')+(F.prov?' in '+F.prov:'');draw();}
sync();
window.addEventListener('pdx:clubs',draw);window.addEventListener('storage',function(e){if(e.key===C.KEY||e.key==='pdx_v1')draw();});
})();
