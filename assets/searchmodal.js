/* Paydates V2 — "Zoek paydate" (uitgebreid zoeken) modal, opbouw zoals live paydates.nl.
   Opent via [data-open-search], #filterBtn of een "Uitgebreid zoeken"-link. Stuurt naar search.html met queryparameters. */
(function(){
if(window.PD_SEARCHMODAL)return;window.PD_SEARCHMODAL=1;
const D=window.PD_DATA||{L:[],CITIES:[]};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const G=['Vrouw','Man','Stel','Shemale'];
const F=[ // [param, titel, opties]
 ['type','Dienst opties',['Escort','Privé ontvangst','BDSM','Erotische Massage','Online']],
 ['or','Seksuele voorkeur',['Hetero','Biseksueel','Gay','Lesbisch']],
 ['price','Prijs per uur',null],
 ['age','Leeftijd',['21-29','30s','40s','50s','60+']],
 ['lang','Talen',[['dutch','Nederlands'],['english','Engels'],['german','Duits'],['spanish','Spaans'],['french','Frans']]],
 ['afk','Afkomst',['Nederlands','Europees','Oost europees','Zuid europees','Afrikaans','Aziatisch','Zuid-amerikaans','Arabisch','Turks','Marokkaans','Amerikaans']],
 ['body','Lichaam',['Slank','Volslank','Normaal','Mollig','Atletisch','Groot']],
 ['bh','BH maat',['AA','A','B','C','D','E','F','G','H']],
 ['len','Lengte in cm',null],
 ['hair','Haar',['Bruin','Blond','Donkerblond','Zwart','Kastanjebruin','Rood','Grijs','Wit','Anders']],
 ['tat','Tattoos',['Geen','Weinig','Een aantal','Veel']],
 ['pier','Piercings',['Geen','Weinig','Een aantal','Veel']],
 ['o','Overig',[['10f','Toon met 10+ foto’s'],['video','Toon met video'],['reviews','Heeft reviews']]]
];
const MOG={'Escort & privé ontvangst':['Anaal bij klant','Tussen borsten (russisch)','Biseks','Pijpen zonder condoom','Pijpen met condoom','Pijpen deepthroat','Klaarkomen in mond','Klaarkomen op gezicht','Sperma slikken','Vingeren','Fisting','Fisting bij klant','Tongzoenen','Zoenen','Aftrekken','Penismassage','Beffen','Beffen zonder beflapje','Facesitting','Soft SM','Speciale kledingverzoeken','Trio m/m','Trio m/v','Anaal met condoom','Anaal zonder condoom','Neuken met condoom','Neuken zonder condoom','Buiten seks','Dinner Date','Erotische Massage','GFE','Gangbang','High Class','Hotel','Intiem','Ontmaagding','Party friendly','Plassex','Plassex door klant','Pornoster','Rimmen bij klant','Squirting','Travestie','Video Opname','Wapdate','Worstelen','Cardate','Gagging / Gags','Voet liefhebbers','Voorbinddildo sex','Vluggertje'],
 'BDSM':['Anal play','Ass worship','BDSM klant dominant','BDSM klant onderdanig','Bi-slave sessions','Bondage','Boot / High heel worship','Breath play','CBT (Cock and Ball Torture)','Candle wax play','Cock and balls bondage','Electro / Violet wand','Geldslaven','Kuisheidsgordel','Lak / Rubber','Masks','Masturberen','Mummificatie','Naalden','Nipple torture','Nursing','Opsluiting','Publieke tentoonstelling','Sissyplay','Spanking','Spitting','Strapon Sex','Urethral sounding','Verbal humiliation','Vernedering','Voetaanbidding','Vuistneuken','BDSM Travestie'],
 'Erotische massage':['Body to Body','Lingam massage','Massage met hoogtepunt','Nuru massage','Prostaat massage','SM massage','Tantra massage','Thaise massage','Yoni massage'],
 'Online':['Chatten','Dickrating','Dildo show','Dirty talk','F2F','Face check','Facetime',"Foto's op verzoek",'JOI - Aftrek instructies','Kik','Live geile verhalen','Online femdom','Online findom','OnlyFans','Rollenspel','Skype','Snapchat','Squirtshow','Telefoon sex','Telegram','Video bellen',"Video's op verzoek",'Webcam','Whatsapp','Zoom']};
const u=new URLSearchParams(location.search);
const sel=k=>new Set((u.get(k)||'').split(k==='s'?'|':',').filter(Boolean));
const chip=(name,val,label,on)=>`<label class="sm-chip"><input type="checkbox" name="${name}" value="${esc(val)}" ${on?'checked':''}><span>${esc(label)}</span></label>`;
const acc=(id,title,inner,open)=>`<div class="sm-acc border-b border-line" data-acc="${id}"><button type="button" class="sm-h w-full flex items-center justify-between py-3 text-left" aria-expanded="${open?'true':'false'}"><span class="font-semibold text-[#212529] text-[13px] flex items-center gap-2">${title}<i class="fa fa-angle-down text-pd text-[11px] transition"></i></span><span class="sm-c text-[11px] font-bold text-ink-soft uppercase tracking-wide">Elke</span></button><div class="sm-b ${open?'':'hidden'} pb-3">${inner}</div></div>`;
function range(id,min,max,step,lo,hi,unit){return `<div class="px-1"><div class="flex items-center gap-2"><input type="number" class="inp !py-1.5 !text-[13px]" data-r="${id}-min" min="${min}" max="${max}" step="${step}" value="${lo}" aria-label="Minimum"><span class="text-ink-soft">–</span><input type="number" class="inp !py-1.5 !text-[13px]" data-r="${id}-max" min="${min}" max="${max}" step="${step}" value="${hi}" aria-label="Maximum"><span class="text-[12px] text-ink-muted">${unit}</span></div>
 <input type="range" class="w-full mt-2" data-rs="${id}" min="${min}" max="${max}" step="${step}" value="${hi}" aria-label="Maximum"></div>`;}
function build(){
  const cities=(D.CITIES||[]).map(c=>c.n).sort((a,b)=>a.localeCompare(b,'nl'));
  const gSel=sel('g');
  const blocks=[acc('g','Geslacht',`<div class="flex flex-wrap gap-1.5">${G.map(g=>chip('g',g,g,gSel.has(g))).join('')}</div>`),
    acc('q','Zoekwoorden',`<div class="relative"><i class="fa fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"></i><input type="search" name="q" value="${esc(u.get('q')||'')}" class="inp !pl-9 !py-2 !text-[13px]" placeholder="Zoek op titel of naam"></div>`)];
  F.forEach(([k,t,opts])=>{
    let inner;
    if(k==='price')inner=range('p',0,1000,10,+(u.get('pmin')||0),+(u.get('pmax')||1000),'€ / uur');
    else if(k==='len')inner=range('l',130,220,1,+(u.get('lmin')||130),+(u.get('lmax')||220),'cm');
    else{const s=sel(k);inner=`<div class="flex flex-wrap gap-1.5">${opts.map(o=>Array.isArray(o)?chip(k,o[0],o[1],s.has(o[0])):chip(k,o,o,s.has(o))).join('')}</div>`;}
    blocks.push(acc(k,t,inner));
  });
  const sS=sel('s');
  const mog=acc('s','Mogelijkheden',Object.entries(MOG).map(([h,arr])=>`<div class="text-[12px] font-semibold text-[#212529] border-b-2 border-line pb-1.5 mt-3 mb-2">${esc(h)}</div><div class="flex flex-wrap gap-1.5">${arr.map(o=>chip('s',o,o,sS.has(o))).join('')}</div>`).join(''));
  M=document.createElement('div');M.id='searchM';
  M.className='hidden fixed inset-0 z-[97] bg-black/60 flex items-start justify-center sm:p-4 sm:pt-10 overflow-y-auto';
  M.setAttribute('role','dialog');M.setAttribute('aria-modal','true');M.setAttribute('aria-labelledby','smT');
  M.innerHTML=`<form id="smForm" action="search.html" method="get" class="w-full sm:max-w-[1040px] bg-white sm:rounded-xl shadow-2xl flex flex-col min-h-screen sm:min-h-0">
  <div class="relative px-4 sm:px-6 pt-5 pb-3 text-center"><h2 id="smT" class="text-[22px] font-bold text-[#212529]">Zoek paydate</h2>
   <button type="button" data-sm-close class="absolute right-3 top-3 w-9 h-9 rounded-full hover:bg-body-light text-2xl leading-none text-ink" aria-label="Sluiten">×</button></div>
  <div class="px-4 sm:px-6">
   <div class="bg-white rounded-[24px] p-2 sm:p-3 flex flex-wrap gap-2 items-center shadow-pill">
    <div class="w-full md:w-auto md:flex-1 md:min-w-[230px] flex items-center border-2 border-ink-soft rounded-pill overflow-hidden h-11 focus-within:border-pd">
     <i class="fa fa-location-dot text-ink-muted text-lg pl-4 pr-2"></i>
     <input name="city" list="smCities" value="${esc(u.get('city')||'')}" placeholder="Locatie" autocomplete="off" class="flex-1 min-w-0 h-full bg-transparent text-[14px] text-ink outline-none">
     <datalist id="smCities">${cities.map(c=>`<option value="${esc(c)}">`).join('')}</datalist>
     <select name="km" class="h-full border-l border-ink-muted/40 px-2 sm:px-3 bg-transparent text-[13px] outline-none" aria-label="Straal"><option value="">Alles</option>${[5,10,15,25,50].map(k=>`<option value="${k}" ${u.get('km')==k?'selected':''}>${k} km</option>`).join('')}</select>
    </div>
    <div class="grid grid-cols-4 md:flex gap-1.5 sm:gap-2 w-full md:w-auto" data-g-top>${G.map(g=>`<button type="button" data-gt="${g}" class="pill h-10 md:h-11 px-1 md:px-4 text-[12px] sm:text-[13px] ${gSel.has(g)?'on':''}">${g}</button>`).join('')}</div>
    <button class="w-full md:w-auto justify-center h-11 px-8 rounded-pill bg-pd hover:bg-[#5c419a] text-white font-bold text-[15px] flex items-center gap-2"><i class="fa fa-magnifying-glass"></i>Zoeken</button>
   </div>
   <div id="smTags" class="flex flex-wrap gap-1.5 pt-3 min-h-[8px]"></div>
  </div>
  <div class="px-4 sm:px-6 pb-2 grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 items-start">${blocks.join('')}</div>
  <div class="px-4 sm:px-6">${mog}</div>
  <div class="sticky bottom-0 bg-white border-t border-line px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:rounded-b-xl mt-auto">
   <button type="button" id="smReset" class="text-pd font-semibold text-[13px]"><i class="fa fa-rotate-left mr-1"></i>Alles wissen</button>
   <button class="btn btn-pd"><i class="fa fa-magnifying-glass"></i> <span id="smCount">Toon resultaten</span></button>
  </div></form>`;
  document.body.appendChild(M);
  const $=s=>M.querySelector(s),$$=s=>[...M.querySelectorAll(s)];
  $$('.sm-h').forEach(b=>b.onclick=()=>{const body=b.nextElementSibling;const o=body.classList.toggle('hidden');b.setAttribute('aria-expanded',!o);b.querySelector('.fa-angle-down').classList.toggle('rotate-180',!o);});
  $$('[data-gt]').forEach(b=>b.onclick=()=>{const c=$(`input[name=g][value="${b.dataset.gt}"]`);c.checked=!c.checked;sync();});
  // ranges
  [['p',0,1000],['l',130,220]].forEach(([id,min,max])=>{const lo=$(`[data-r=${id}-min]`),hi=$(`[data-r=${id}-max]`),rs=$(`[data-rs=${id}]`);
    rs.oninput=()=>{hi.value=rs.value;sync();};hi.oninput=()=>{rs.value=hi.value;sync();};lo.oninput=sync;});
  M.addEventListener('change',sync);M.addEventListener('input',e=>{if(e.target.name==='q')sync();});
  $$('[data-sm-close]').forEach(b=>b.onclick=close);
  M.addEventListener('click',e=>{if(e.target===M)close();const t=e.target.closest('[data-untag]');if(t){const [n,v]=t.dataset.untag.split('\u0001');
    if(n==='p'){$('[data-r=p-min]').value=0;$('[data-r=p-max]').value=1000;$('[data-rs=p]').value=1000;}
    else if(n==='l'){$('[data-r=l-min]').value=130;$('[data-r=l-max]').value=220;$('[data-rs=l]').value=220;}
    else if(n==='q')$('input[name=q]').value='';
    else{const c=$$(`input[name="${n}"]`).find(i=>i.value===v);if(c)c.checked=false;}sync();}});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!M.classList.contains('hidden'))close();});
  $('#smReset').onclick=()=>{$$('input[type=checkbox]').forEach(c=>c.checked=false);$('input[name=q]').value='';$('input[name=city]').value='';$('select[name=km]').value='';
    $('[data-r=p-min]').value=0;$('[data-r=p-max]').value=1000;$('[data-rs=p]').value=1000;$('[data-r=l-min]').value=130;$('[data-r=l-max]').value=220;$('[data-rs=l]').value=220;sync();};
  $('#smForm').addEventListener('submit',e=>{e.preventDefault();location.href='search.html'+(toQuery()?'?'+toQuery():'');});
  sync();
  return M;
}
function vals(n){return [...M.querySelectorAll(`input[name="${n}"]:checked`)].map(i=>i.value);}
function toQuery(){const q=new URLSearchParams(),$=s=>M.querySelector(s);
  const city=$('input[name=city]').value.trim();if(city)q.set('city',city);const km=$('select[name=km]').value;if(km)q.set('km',km);
  const t=$('input[name=q]').value.trim();if(t)q.set('q',t);
  const g=vals('g');if(g.length)q.set('g',g.join(','));
  F.forEach(([k])=>{if(k==='price'||k==='len')return;const v=vals(k);if(v.length)q.set(k,v.join(','));});
  const s=vals('s');if(s.length)q.set('s',s.join('|'));
  const pmin=+$('[data-r=p-min]').value,pmax=+$('[data-r=p-max]').value;if(pmin>0)q.set('pmin',pmin);if(pmax<1000)q.set('pmax',pmax);
  const lmin=+$('[data-r=l-min]').value,lmax=+$('[data-r=l-max]').value;if(lmin>130)q.set('lmin',lmin);if(lmax<220)q.set('lmax',lmax);
  return q.toString();}
function sync(){const $=s=>M.querySelector(s);
  M.querySelectorAll('[data-gt]').forEach(b=>b.classList.toggle('on',!!M.querySelector(`input[name=g][value="${b.dataset.gt}"]:checked`)));
  const tags=[];
  M.querySelectorAll('.sm-acc').forEach(a=>{const id=a.dataset.acc,c=a.querySelector('.sm-c');let n=0,txt='Elke';
    if(id==='price'){const lo=+$('[data-r=p-min]').value,hi=+$('[data-r=p-max]').value;if(lo>0||hi<1000){n=1;txt=`€${lo}–${hi}`;tags.push(['p','',`€ ${lo} – ${hi} p/u`]);}}
    else if(id==='len'){const lo=+$('[data-r=l-min]').value,hi=+$('[data-r=l-max]').value;if(lo>130||hi<220){n=1;txt=`${lo}–${hi} cm`;tags.push(['l','',`${lo} – ${hi} cm`]);}}
    else if(id==='q'){const v=$('input[name=q]').value.trim();if(v){n=1;txt=v;tags.push(['q','','“'+v+'”']);}}
    else{const ch=[...a.querySelectorAll('input:checked')];n=ch.length;if(n)txt=n===1?ch[0].nextElementSibling.textContent:n+' gekozen';ch.forEach(i=>tags.push([i.name,i.value,i.nextElementSibling.textContent]));}
    c.textContent=id==='age'&&!n?'21+':txt;c.classList.toggle('text-pd',!!n);c.classList.toggle('text-ink-soft',!n);});
  $('#smTags').innerHTML=tags.map(([n,v,l])=>`<button type="button" data-untag="${esc(n+'\u0001'+v)}" class="inline-flex items-center gap-1.5 rounded-pill bg-[#7351c012] text-pd px-3 py-1 text-[11px] font-bold uppercase tracking-wide hover:bg-[#7351c020]">${esc(l)}<i class="fa fa-xmark"></i></button>`).join('');
  const n=window.PD_ADV?PD_ADV.count(new URLSearchParams(toQuery())):null;
  $('#smCount').textContent=n==null?'Toon resultaten':n===1?'Toon 1 resultaat':`Toon ${n} resultaten`;}
let M=null;
function open(){if(!M)M=build();else sync();M.classList.remove('hidden');document.body.style.overflow='hidden';}
function close(){M.classList.add('hidden');document.body.style.overflow='';}
window.PD_SEARCH={open};
document.addEventListener('click',e=>{const t=e.target.closest('[data-open-search],#filterBtn,a[href="search.html"]');if(!t)return;
  if(t.tagName==='A'&&!/uitgebreid zoeken/i.test(t.textContent))return;
  e.preventDefault();e.stopImmediatePropagation();
  document.querySelectorAll('[data-close-drawer]').forEach(b=>{if(b.offsetParent)b.click();});open();},true);
})();
