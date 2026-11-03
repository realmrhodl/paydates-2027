/* Paydates V2 — Gangbangs & seksfeesten (voorbeeldfeesten tot de backend echte feesten levert) */
(function(){
const {$,$$,esc,cityPage}=window.PD;
const TYPES=['Gangbang','Bukkake','Swingersfeest','Bi-feest','Kink / BDSM','Trans-feest'];
const IC={'Gangbang':'fa-people-group','Bukkake':'fa-droplet','Swingersfeest':'fa-champagne-glasses','Bi-feest':'fa-venus-mars','Kink / BDSM':'fa-link','Trans-feest':'fa-transgender'};
const day=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);return d;};
const nextDow=(dow,plus=0)=>{const d=day(0);d.setDate(d.getDate()+((dow-d.getDay()+7)%7)+plus*7);return d;};
// voorbeelddata — datum relatief aan vandaag zodat de demo altijd 'komend' toont
const E=[
 {t:'Gangbang met Romy – 1 dame, max. 10 heren',type:'Gangbang',c:'Amsterdam',d:nextDow(5),tm:'20:00 – 00:00',p:95,spots:10,left:3,org:'Romy Events',v:1,top:1,desc:'Discrete locatie in Amsterdam-West, adres na aanmelding. Condoom verplicht, recente SOA-test gewenst.'},
 {t:'Bukkake Night Rotterdam',type:'Bukkake',c:'Rotterdam',d:nextDow(6),tm:'21:00 – 01:00',p:60,spots:20,left:8,org:'Club R',v:1,desc:'Thema-avond met 2 dames. Inloop vanaf 20:30, drankjes inbegrepen.'},
 {t:'Swingersfeest “Masquerade”',type:'Swingersfeest',c:'Utrecht',d:nextDow(6,1),tm:'21:00 – 03:00',p:45,spots:60,left:22,org:'Saunaclub Utrecht',desc:'Maskers verplicht. Stellen en singles dames welkom, solo heren beperkt.'},
 {t:'Gangbang Den Haag – MILF edition',type:'Gangbang',c:'Den Haag',d:day(3),tm:'19:30 – 23:00',p:85,spots:8,left:2,org:'Sandra',v:1,desc:'Kleine groep, gezellige sfeer. Aanmelden via WhatsApp na selectie.'},
 {t:'Bi-avond voor mannen',type:'Bi-feest',c:'Eindhoven',d:nextDow(4),tm:'20:00 – 00:00',p:25,spots:30,left:14,org:'Club E',desc:'Relaxte avond voor bi-nieuwsgierige en bi mannen. Lockers en douches aanwezig.'},
 {t:'Kink Dungeon Party',type:'Kink / BDSM',c:'Groningen',d:nextDow(6,2),tm:'21:00 – 02:00',p:40,spots:50,left:31,org:'Meesteres Nova',v:1,desc:'Dresscode leer/latex/lak. Play-areas en ervaren dungeon monitors.'},
 {t:'T-Girls &amp; Admirers',type:'Trans-feest',c:'Amsterdam',d:day(12),tm:'21:00 – 02:00',p:30,spots:80,left:40,org:'Paydates Events',desc:'Feest voor trans personen en hun admirers. Dansvloer en lounge.'},
 {t:'Gangbang Breda – 2 dames',type:'Gangbang',c:'Breda',d:day(17),tm:'20:00 – 00:30',p:110,spots:12,left:6,org:'Lisa &amp; Kim',desc:'Twee dames, max 12 heren. Vooraf aanbetaling, rest contant.'},
 {t:'Swingers Summer Club',type:'Swingersfeest',c:'Arnhem',d:day(24),tm:'14:00 – 22:00',p:35,spots:100,left:55,org:'Club Arnhem',desc:'Middag- en avondfeest met tuin en jacuzzi.'},
];
const fmt=d=>d.toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'});
const sel={type:'',city:'',when:''};
$('#gbTypes').innerHTML=['Alle',...TYPES].map(t=>`<button type="button" data-gt="${t==='Alle'?'':esc(t)}" class="tchip pill px-3 py-1 text-[12px] whitespace-nowrap${t==='Alle'?' on':''}">${t}</button>`).join('');
[...new Set(E.map(e=>e.c))].sort().forEach(c=>$('#gbCity').insertAdjacentHTML('beforeend',`<option>${esc(c)}</option>`));
const q=new URLSearchParams(location.search);if(q.get('city'))sel.city=$('#gbCity').value=q.get('city');
function inWhen(d){if(!sel.when)return true;const t=day(0),diff=(d-t)/864e5;
  if(sel.when==='week')return diff>=0&&diff<7;if(sel.when==='maand')return diff>=0&&diff<30;
  if(sel.when==='weekend'){const sat=nextDow(6),sun=day(0);sun.setTime(sat.getTime()+864e5);const fri=new Date(sat.getTime()-864e5);return d>=fri&&d<=sun;}return true;}
function card(e){const d=e.d;return `<article class="block overflow-hidden flex flex-col ${e.top?'ring-2 ring-gold':''}">
  <div class="relative h-[120px] bg-gradient-to-br from-pd-darker to-pd flex items-center justify-center text-white">
   <i class="fa ${IC[e.type]||'fa-champagne-glasses'} text-[40px] opacity-30"></i>
   <div class="absolute top-2.5 left-2.5 bg-white text-center rounded-md px-2 py-1 shadow"><div class="text-[10px] font-bold uppercase text-pd leading-none">${d.toLocaleDateString('nl-NL',{month:'short'})}</div><div class="text-[20px] font-bold text-[#212529] leading-none">${d.getDate()}</div></div>
   <div class="absolute top-2.5 right-2.5 flex gap-1">${e.top?'<span class="mini !bg-gold !text-[#212529]">UITGELICHT</span>':''}<span class="mini !bg-black/50">Voorbeeld</span></div>
   <span class="absolute bottom-2.5 left-2.5 mini !bg-white/90 !text-pd"><i class="fa ${IC[e.type]||'fa-star'}"></i> ${e.type}</span>
  </div>
  <div class="p-3.5 flex-1 flex flex-col">
   <h3 class="font-bold text-[#212529] text-[15px] leading-snug">${e.t}</h3>
   <div class="text-[12px] text-ink-muted mt-1.5 space-y-1">
    <div><i class="fa fa-calendar text-pd w-4"></i> ${fmt(d)} · ${e.tm}</div>
    <div><i class="fa fa-location-dot text-pd w-4"></i> <a href="${cityPage(e.c)}" class="hover:text-pd">${esc(e.c)}</a> <span class="text-ink-soft">(adres na aanmelding)</span></div>
    <div><i class="fa fa-user text-pd w-4"></i> ${e.org}${e.v?' <i class="fa fa-circle-check text-pd" title="Geverifieerde organisator"></i>':''}</div>
   </div>
   <p class="text-[12px] text-ink mt-2 leading-snug">${e.desc}</p>
   <div class="mt-auto pt-3 flex items-end justify-between gap-2">
    <div><div class="text-[11px] text-ink-muted">Entree</div><div class="text-[18px] font-bold text-[#212529] leading-none">€ ${e.p}</div></div>
    <div class="text-right text-[11px]"><div class="${e.left<=3?'text-[#c0262d] font-bold':'text-ink-muted'}">${e.left} van ${e.spots} plekken vrij</div><div class="w-24 h-1.5 bg-line rounded-full mt-1 overflow-hidden ml-auto"><div class="h-full bg-pd" style="width:${Math.round((1-e.left/e.spots)*100)}%"></div></div></div>
   </div>
  </div>
 </article>`;}
function render(){const r=E.filter(e=>(!sel.type||e.type===sel.type)&&(!sel.city||e.c===sel.city)&&inWhen(e.d)).sort((a,b)=>(b.top||0)-(a.top||0)||a.d-b.d);
  $('#gbGrid').innerHTML=r.map(card).join('');$('#gbEmpty').classList.toggle('hidden',r.length>0);$('#gbCount').textContent=`(${r.length} feest${r.length===1?'':'en'})`;}
$$('#gbTypes [data-gt]').forEach(b=>b.onclick=()=>{sel.type=b.dataset.gt;$$('#gbTypes [data-gt]').forEach(x=>x.classList.toggle('on',x===b));render();});
$('#gbCity').onchange=e=>{sel.city=e.target.value;render();};
$('#gbWhen').onchange=e=>{sel.when=e.target.value;render();};
render();
})();
