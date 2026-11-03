# ---------- videos.html (commercieel + SEO) — wordt geïmporteerd door pages2.py ----------
import json,collections
from layout import *
def build_videos():
  C=json.load(open('_clean.json'))
  L={x['id']:x for x in C['L']}
  V=[v for v in C['V']]
  GN={'Vrouw':'Vrouwen','Man':'Mannen','Shemale':'Shemales','Stel':'Stellen'}
  GP={'Vrouw':'vrouwen.html','Man':'mannen.html','Shemale':'shemales.html','Stel':'stellen.html'}
  def cp(c):
    m=[x for x in CITIES if x['n']==c]; return f"escort-{m[0]['slug']}.html" if m else f"search.html?city={c}"
  def fmt(n): return (f"{n/1000:.1f}".replace('.',',')+'k') if n>=1000 else str(n)
  def ago(d): return 'vandaag' if d<1 else f'{d} dagen geleden' if d<31 else f'{round(d/30)} maanden geleden' if d<365 else f'{round(d/365)} jaar geleden'
  V.sort(key=lambda v:-v['views'])
  makers=len({v['user'] for v in V}); views=sum(v['views'] for v in V)
  cities=collections.Counter(L[v['ad']]['c'] for v in V if v['ad'])
  def vcard(v,i):
    x=L.get(v['ad']) if v['ad'] else None
    t=v['title'] or f"Video van {v['user']}"
    attrs=f'data-i="{i}" data-views="{v["views"]}" data-days="{v["days"]}" data-mp4="{E(v["mp4"])}" data-q="{E((t+" "+v["user"]+" "+(x["c"]+" "+x["t"] if x else "")).lower())}"'
    if x: attrs+=f' data-g="{x["g"]}" data-city="{E(x["c"])}" data-type="{E(x["t"])}" data-v="{x["v"]}" data-ad="{x["id"]}"'
    hot='<span class="mini !bg-[#e8590c]"><i class="fa fa-fire"></i> Populair</span>' if i<5 else ('<span class="mini !bg-pd">Nieuw</span>' if v['days']<=60 else '')
    meta=(f'<a href="{cp(x["c"])}" class="hover:text-pd"><i class="fa fa-location-dot mr-0.5"></i>{E(x["c"])}</a><span>·</span><a href="{GP[x["g"]]}" class="hover:text-pd">{GN[x["g"]]}</a>' if x else '<span><i class="fa fa-film mr-0.5"></i>Paydates video</span>')
    prof=(f'<a href="advertentie.html?id={x["id"]}" class="vprof flex items-center gap-1 font-semibold text-pd hover:underline truncate"><i class="fa fa-user"></i>{E(v["user"])}{"<i class=\"fa fa-circle-check text-[11px]\" title=\"Geverifieerd\"></i>" if x["v"] else ""}</a>' if x else f'<span class="flex items-center gap-1 font-semibold text-ink truncate"><i class="fa fa-user text-ink-muted"></i>{E(v["user"])}</span>')
    return f'''<article class="vcard card group bg-white rounded-lg overflow-hidden shadow-block hover:shadow-pill transition" {attrs}>
 <button type="button" class="vplay relative block w-full aspect-[3/4] bg-ink overflow-hidden" aria-label="Speel video: {E(t)}">
  <img src="{E(v["thumb"])}" alt="{E(t)} – sexfilmpje van {E(v["user"])}" loading="lazy" decoding="async" class="ph absolute inset-0 w-full h-full object-cover">
  <span class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/25"></span>
  <span class="absolute top-1.5 left-1.5 flex gap-1">{hot}{'<span class="mini !bg-pd"><i class="fa fa-circle-check"></i> Geverifieerd</span>' if x and x['v'] else ''}</span>
  <span class="absolute inset-0 flex items-center justify-center"><span class="w-14 h-14 rounded-full bg-white/90 text-pd flex items-center justify-center shadow-xl transition group-hover:scale-110 group-hover:bg-pd group-hover:text-white"><i class="fa fa-play ml-1 text-[18px]"></i></span></span>
  <span class="absolute bottom-2 left-2 right-2 flex justify-between items-center text-white text-[11px] font-semibold"><span class="whitespace-nowrap"><i class="fa fa-eye mr-1"></i>{fmt(v["views"])}<span class="hidden sm:inline"> views</span></span><span class="opacity-80 whitespace-nowrap text-[10px] sm:text-[11px]">{ago(v["days"])}</span></span>
 </button>
 <div class="p-2.5">
  <h3 class="font-semibold text-[13px] text-[#212529] line-clamp-2 leading-snug min-h-[2.4em]">{E(t)}</h3>
  <div class="text-[12px] mt-1 flex items-center justify-between gap-2 min-w-0">{prof}</div>
  <div class="text-[11px] text-ink-muted mt-0.5 flex gap-1 truncate">{meta}</div>
 </div>
</article>'''
  cards=''
  for i,v in enumerate(V):
    cards+=vcard(v,i)
    if i==7: cards+='<div class="vad">'+'''<a href="adverteren.html#top" class="adc adc-purple flex-col rounded-lg h-full min-h-[260px] p-4 text-left"><div class="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-[18px]"><i class="fa fa-video"></i></div><div class="text-[11px] font-bold tracking-[.18em] text-pd-lighter mt-4">VIDEO-ADVERTEERDERS</div><div class="text-[18px] font-bold leading-tight mt-1">Jouw video hier tussen de best bekeken</div><p class="text-[12px] text-white/80 mt-2 leading-snug">Upload video's bij je advertentie en word gevonden door bezoekers die nu kijken.</p><span class="adbtn shine mt-auto py-2 text-[12px]">Video's plaatsen</span></a>'''+'</div>'
  city_opts=''.join(f'<option value="{E(c)}">{E(c)} ({n})</option>' for c,n in sorted(cities.items(),key=lambda a:a[0]))
  types=sorted({L[v['ad']]['t'] for v in V if v['ad']})
  trending=sorted([v for v in V if v['days']<=400],key=lambda v:-(v['views']/max(v['days'],7)))[:8] or V[:8]
  trend_html=''.join(f'''<button type="button" data-open="{E(v["mp4"])}" class="group relative shrink-0 w-[150px] sm:w-[180px] aspect-[3/4] rounded-lg overflow-hidden bg-ink snap-start"><img src="{E(v["thumb"])}" alt="{E(v["title"] or v["user"])}" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"><span class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></span><span class="absolute top-2 left-2 mini !bg-gold !text-[#212529]">#{n+1}</span><span class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><span class="w-12 h-12 rounded-full bg-pd text-white flex items-center justify-center"><i class="fa fa-play ml-0.5"></i></span></span><span class="absolute bottom-2 left-2 right-2 text-left text-white"><span class="text-[12px] font-semibold leading-tight line-clamp-2">{E(v["title"] or "Video van "+v["user"])}</span><span class="flex text-[10px] opacity-80 mt-0.5">{E(v["user"])} · {fmt(v["views"])} views</span></span></button>''' for n,v in enumerate(trending))
  city_links=''.join(f'<a href="{cp(c["n"])}" class="pill px-3 py-1.5 text-[12px]">Sex {E(c["n"])}</a>' for c in CITIES[:24])
  vcity_links=''.join(f'<a href="videos.html?city={E(c)}" class="text-pd hover:underline">Sexfilmpjes {E(c)}</a>' for c,_ in cities.most_common())
  TAGS=['Pijpen','Anaal','Trio','Deepthroat','Rollenspel','Massage','Webcam','Dominant','GFE','Striptease']
  tag_links=''.join(f'<a href="search.html?s={t}" class="pill px-3 py-1.5 text-[12px]"><i class="fa fa-hashtag text-pd-lighter mr-0.5"></i>{t}</a>' for t in TAGS)
  FAQ=[("Zijn de video's op Paydates gratis te bekijken?","Ja. Alle video's op deze pagina kun je gratis bekijken, zonder account. Voor contact met een adverteerder ga je naar de advertentie."),
       ("Wie maken de video's?","De video's zijn geplaatst door adverteerders op Paydates.nl zelf: escorts, sekswerkers met privé ontvangst, stellen en trans adverteerders uit heel Nederland. Geen studio-porno, maar echte Nederlandse amateurs."),
       ("Kan ik iemand uit een video ook echt ontmoeten?","Bij video's met een gekoppelde advertentie klik je door naar het profiel. Daar zie je tarieven, mogelijkheden, beschikbaarheid en hoe je contact opneemt."),
       ("Hoe weet ik dat adverteerders 21+ zijn?","Alle adverteerders verklaren 21 jaar of ouder te zijn. Geverifieerde profielen hebben hun identiteit laten controleren. Zie je iets wat niet klopt? <a href=\"melden.html\" class=\"text-pd\">Meld het direct</a>."),
       ("Hoe plaats ik zelf video's?","Maak gratis een <a href=\"register.html?type=sekswerker\" class=\"text-pd\">adverteerdersaccount</a> aan en upload video's bij je advertentie. Extra video-slots en TOP-plaatsing regel je met <a href=\"credits.html\" class=\"text-pd\">credits</a>.")]
  faq_html=''.join(f'<details class="faq"><summary>{q}</summary><p class="text-ink-muted pb-4 leading-relaxed">{a}</p></details>' for q,a in FAQ)
  import re
  ld=[{"@context":"https://schema.org","@type":"ItemList","name":"Nederlandse sexfilmpjes op Paydates.nl","itemListElement":[{"@type":"ListItem","position":n+1,"item":{"@type":"VideoObject","name":v['title'] or f"Video van {v['user']}","thumbnailUrl":v['thumb'],"contentUrl":v['mp4'],"description":f"Video van {v['user']} op Paydates.nl","isFamilyFriendly":False}} for n,v in enumerate(V[:20])]},
      {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":re.sub('<[^>]+>','',a)}} for q,a in FAQ]}]
  extra='<meta name="rating" content="adult"><link rel="canonical" href="https://beta.paydates.nl/videos.html">'+''.join(f'<script type="application/ld+json">{json.dumps(o,ensure_ascii=False)}</script>' for o in ld)
  body=f'''{LEADER}
<div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-4 flex gap-4">
 <main class="flex-1 min-w-0">
  {crumbs([("Video's",None)])}
  <section class="hero-bg rounded-lg text-white p-5 sm:p-7 mt-2 relative overflow-hidden">
   <div class="max-w-3xl relative">
    <div class="text-[11px] font-bold uppercase tracking-wider text-gold"><i class="fa fa-video mr-1"></i>Paydates Video's</div>
    <h1 class="text-[24px] sm:text-[32px] font-bold leading-tight mt-1">Nederlandse sexfilmpjes &amp; amateur porno van echte adverteerders</h1>
    <p class="text-white/85 mt-2 text-[14px] max-w-2xl">Gratis erotische video's van escorts, stellen, mannen en trans adverteerders uit heel Nederland. Kijk, ontdek wie je leuk vindt en neem direct contact op via hun advertentie.</p>
    <div class="flex flex-wrap gap-2 mt-4"><a href="#vgrid" class="btn bg-white text-pd hover:bg-pd-lighter"><i class="fa fa-play"></i> Bekijk alle video's</a><a href="search.html?f=video" class="btn border border-white/40 text-white hover:bg-white/10"><i class="fa fa-user-check"></i> Escorts met video</a></div>
    <div class="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-[12px] text-white/85"><span><b class="text-white text-[16px]">{len(V)}</b> video's</span><span><b class="text-white text-[16px]">{makers}</b> makers</span><span><b class="text-white text-[16px]">{fmt(views)}</b> keer bekeken</span><span><i class="fa fa-lock mr-1"></i>Gratis &amp; discreet</span></div>
   </div>
  </section>

  <section class="mt-5" aria-labelledby="trendH">
   <div class="flex items-end justify-between mb-2"><h2 id="trendH" class="text-[16px] font-bold text-[#212529]"><i class="fa fa-fire text-[#e8590c] mr-1"></i>Trending sexfilmpjes</h2><span class="text-[11px] text-ink-muted">Meest bekeken per dag</span></div>
   <div class="flex gap-2.5 overflow-x-auto scrollbar-none snap-x pb-1">{trend_html}</div>
  </section>

  <section class="block mt-5 p-3 sm:p-4 lg:sticky lg:top-14 z-20" id="vfilters">
   <div class="flex flex-wrap gap-1.5" role="group" aria-label="Categorie">
    <button type="button" class="vg pill px-3 py-1.5 text-[12px] on" data-g="">Alle</button>{''.join(f'<button type="button" class="vg pill px-3 py-1.5 text-[12px]" data-g="{g}">{GN[g]}</button>' for g in GN)}
    <span class="hidden sm:block w-px bg-line mx-1"></span>
    {''.join(f'<button type="button" class="vt pill px-3 py-1.5 text-[12px]" data-type="{E(t)}">{E(t)}</button>' for t in types)}
   </div>
   <div class="flex flex-wrap items-center gap-2 mt-3">
    <div class="relative flex-1 min-w-[180px]"><i class="fa fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft text-xs"></i><input id="vq" type="search" class="inp !py-1.5 !pl-8 !text-[13px]" placeholder="Zoek op titel, naam of stad…"></div>
    <select id="vc" class="rounded border border-line bg-white px-2 py-1.5 text-[12px]" aria-label="Stad"><option value="">Alle steden</option>{city_opts}</select>
    <label class="flex items-center gap-1.5 text-[12px]"><input type="checkbox" id="vv"> Geverifieerd</label>
    <label class="flex items-center gap-1.5 text-[12px]"><input type="checkbox" id="va"> Met advertentie</label>
    <select id="vs" class="rounded border border-line bg-white px-2 py-1.5 text-[12px]" aria-label="Sorteren"><option value="views">Meest bekeken</option><option value="trend">Trending</option><option value="new">Nieuwste</option></select>
    <span id="vcount" class="text-[12px] text-ink-muted ml-auto"></span>
   </div>
  </section>

  <h2 class="sr-only">Alle video's</h2>
  <div id="vgrid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 mt-3">{cards}</div>
  <div id="vempty" class="hidden block text-center text-ink-muted py-14 mt-3"><i class="fa fa-video-slash text-2xl text-pd-lighter mb-2 block"></i>Geen video's met deze filters.<br><button id="vreset" class="btn btn-ghost mt-4">Filters wissen</button></div>

  <section class="mt-6"><div class="flex items-end justify-between mb-3"><h2 class="text-[16px] font-bold text-[#212529]">Escorts met video – direct contact</h2><a href="search.html?f=video" class="text-[12px] text-pd font-semibold">Alle profielen met video <i class="fa fa-angle-right"></i></a></div>
   <div id="vads" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3"></div></section>

  <section class="adc adc-gold mt-6 p-5 sm:p-6 flex-col sm:flex-row sm:items-center gap-4">
   <div class="flex-1"><div class="text-[11px] font-bold tracking-[.2em] text-gold">VOOR ADVERTEERDERS</div><div class="text-[20px] font-bold leading-tight mt-1">Laat je video's bekijken door duizenden bezoekers</div><p class="text-[13px] text-white/80 mt-1">Advertenties met video vallen meer op in de overzichten. Combineer met TOP of VIP voor maximale zichtbaarheid.</p></div>
   <div class="flex gap-2 shrink-0"><a href="register.html?type=sekswerker" class="adbtn shine px-4 py-2.5 text-[13px]">Gratis adverteren</a><a href="credits.html" class="adbtn bg-white/10 border border-white/30 px-4 py-2.5 text-[13px]">Credits</a></div>
  </section>

  <section class="block p-5 sm:p-7 mt-6 prose-pd">
   <h2 class="!mt-0">Gratis Nederlandse porno en sexfilmpjes van echte mensen</h2>
   <p>Op zoek naar <strong>Nederlandse porno</strong> die echt is? Op Paydates.nl kijk je gratis <strong>sexfilmpjes van Nederlandse amateurs</strong>: escorts, sekswerkers met privé ontvangst, geile stellen, mannen en shemales die zelf hun video's uploaden. Geen anonieme studio-porno, maar mensen uit jouw regio die je ook echt kunt ontmoeten.</p>
   <h2>Van sexfilmpje naar echte afspraak</h2>
   <p>Zie je een video die je opwindt? Bij video's met een gekoppelde advertentie klik je door naar het profiel met foto's, <a href="search.html">tarieven en mogelijkheden</a>. Zo vind je snel een <a href="vrouwen.html">escort</a>, een <a href="stellen.html">stel voor een trio</a>, een <a href="mannen.html">man</a> of een <a href="shemales.html">shemale</a> bij jou in de buurt. Liever eerst praten? Ga naar de <a href="chatten.html">Paydates Chat</a>.</p>
   <h2>Amateur sexfilmpjes per stad</h2>
   <p>Filter op stad en ontdek wie er in jouw buurt adverteert. Populair: <a href="escort-amsterdam.html">escort Amsterdam</a>, <a href="escort-rotterdam.html">escort Rotterdam</a>, <a href="escort-utrecht.html">escort Utrecht</a>, <a href="escort-den-haag.html">escort Den Haag</a> en <a href="escort-eindhoven.html">escort Eindhoven</a>. Of bekijk <a href="locaties.html">alle locaties</a>.</p>
   <h2>Veilig en legaal kijken</h2>
   <p>Alle adverteerders op Paydates.nl zijn volwassen en plaatsen hun video's zelf en vrijwillig. Geverifieerde profielen herken je aan het paarse vinkje. Kom je iets tegen wat niet klopt, zoals beelden zonder toestemming? <a href="melden.html#ntd">Meld het</a> – we halen het snel offline. Lees ook onze <a href="veilig-daten.html">tips voor veilig daten</a>.</p>
  </section>

  <section class="grid lg:grid-cols-2 gap-4 mt-4">
   <div class="block p-5"><h2 class="text-[15px] font-bold text-[#212529] mb-3">Populaire zoektermen</h2><div class="flex flex-wrap gap-1.5">{tag_links}</div>
    <h3 class="text-[13px] font-semibold text-[#212529] mt-4 mb-2">Video's per stad</h3><div class="flex flex-wrap gap-x-3 gap-y-1 text-[12px]">{vcity_links}</div></div>
   <div class="block p-5"><h2 class="text-[15px] font-bold text-[#212529] mb-3">Sex en escorts in jouw stad</h2><div class="flex flex-wrap gap-1.5">{city_links}<a href="locaties.html" class="pill px-3 py-1.5 text-[12px] !text-pd">Alle locaties <i class="fa fa-angle-right"></i></a></div></div>
  </section>

  <section class="block p-5 sm:p-7 mt-4"><h2 class="text-[16px] font-bold text-[#212529]">Veelgestelde vragen over Paydates video's</h2><div class="mt-2">{faq_html}</div></section>
 </main>
 {RAIL}
</div>
<div id="vm" class="hidden fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-3">
 <div class="w-full max-w-4xl grid md:grid-cols-[minmax(0,1fr)_240px] gap-3">
  <div class="min-w-0"><div class="flex justify-between items-center text-white mb-2"><div id="vt" class="font-semibold truncate pr-4"></div><button id="vx" class="text-3xl leading-none md:hidden" aria-label="Sluiten">×</button></div>
  <video id="vp" controls playsinline class="w-full max-h-[78vh] rounded bg-black"></video>
  <div class="flex justify-between mt-2"><button id="vprev" class="text-white/80 hover:text-white text-[13px]"><i class="fa fa-angle-left"></i> Vorige</button><button id="vnext" class="text-white/80 hover:text-white text-[13px]">Volgende <i class="fa fa-angle-right"></i></button></div></div>
  <aside class="bg-white rounded-lg p-4 text-[13px] self-start relative"><button id="vx2" class="hidden md:block absolute -top-9 right-0 text-white text-3xl leading-none" aria-label="Sluiten">×</button><div id="vl"></div></aside>
 </div>
</div>'''
  script=r'''<script>
(function(){const {D,$,$$,esc}=PD;const LM=Object.fromEntries(D.L.map(x=>[x.id,x]));
const u=new URLSearchParams(location.search);
const st={g:u.get('g')||'',type:u.get('type')||'',city:u.get('city')||'',v:u.get('v')==='1',a:u.get('a')==='1',q:(u.get('q')||'').toLowerCase(),s:u.get('sort')||'views'};
const grid=$('#vgrid');const cards=$$('.vcard',grid);const ad=$('.vad',grid);
function sync(){const p=new URLSearchParams();st.g&&p.set('g',st.g);st.type&&p.set('type',st.type);st.city&&p.set('city',st.city);st.v&&p.set('v','1');st.a&&p.set('a','1');st.q&&p.set('q',st.q);st.s!=='views'&&p.set('sort',st.s);
 history.replaceState(null,'',location.pathname+(p.toString()?'?'+p:'')+location.hash);}
function render(){
 const key={views:c=>-c.dataset.views,new:c=>+c.dataset.days,trend:c=>-(c.dataset.views/Math.max(+c.dataset.days,7))}[st.s]||(c=>-c.dataset.views);
 const sorted=[...cards].sort((a,b)=>key(a)-key(b));let n=0;
 sorted.forEach(c=>{const d=c.dataset;const ok=(!st.g||d.g===st.g)&&(!st.type||d.type===st.type)&&(!st.city||d.city===st.city)&&(!st.v||d.v==='1')&&(!st.a||d.ad)&&(!st.q||d.q.includes(st.q));
  c.classList.toggle('hidden',!ok);grid.appendChild(c);if(ok){n++;if(n===8&&ad)grid.appendChild(ad);}});
 if(ad&&n<8)grid.appendChild(ad);ad&&ad.classList.toggle('hidden',n===0);
 $('#vcount').textContent=n+' video'+(n===1?'':"'s");$('#vempty').classList.toggle('hidden',n>0);
 $$('.vg').forEach(b=>b.classList.toggle('on',b.dataset.g===st.g));$$('.vt').forEach(b=>b.classList.toggle('on',b.dataset.type===st.type));
 $('#vc').value=st.city;$('#vv').checked=st.v;$('#va').checked=st.a;$('#vs').value=st.s;if(document.activeElement!==$('#vq'))$('#vq').value=st.q;sync();}
$$('.vg').forEach(b=>b.onclick=()=>{st.g=b.dataset.g;render()});
$$('.vt').forEach(b=>b.onclick=()=>{st.type=st.type===b.dataset.type?'':b.dataset.type;render()});
$('#vc').onchange=e=>{st.city=e.target.value;render()};$('#vv').onchange=e=>{st.v=e.target.checked;render()};$('#va').onchange=e=>{st.a=e.target.checked;render()};
$('#vs').onchange=e=>{st.s=e.target.value;render()};$('#vq').oninput=e=>{st.q=e.target.value.toLowerCase().trim();render()};
$('#vreset').onclick=()=>{Object.assign(st,{g:'',type:'',city:'',v:false,a:false,q:''});render()};
// escorts met video
const withVid=D.L.filter(x=>x.vid).sort((a,b)=>(b.vip-a.vip)||(b.v-a.v)||(b.vid-a.vid)).slice(0,10);$('#vads').innerHTML=withVid.map(x=>PD.card(x)).join('');
// speler
const vm=$('#vm'),vp=$('#vp');let cur=null;
const visible=()=>$$('.vcard:not(.hidden)',grid).map(c=>c.dataset.mp4);
function open(mp4){const v=D.V.find(x=>x.mp4===mp4);if(!v)return;cur=mp4;vp.src=v.mp4;const t=v.title||'Video van '+v.user;$('#vt').textContent=t;
 const x=v.ad&&LM[v.ad];
 $('#vl').innerHTML=x?`<div class="flex gap-3 items-center"><img src="${esc(x.img)}" alt="" class="w-14 h-14 rounded-full object-cover"><div class="min-w-0"><div class="font-bold text-[#212529] truncate">${esc(x.n)}${x.v?' <i class="fa fa-circle-check text-pd text-[12px]"></i>':''}</div><div class="text-[12px] text-ink-muted truncate">${esc(x.t)} · ${esc(x.c)}</div></div></div>
  <div class="mt-3 text-[12px] text-ink-muted">${x.p?'Vanaf <b class="text-[#212529] text-[15px]">€ '+x.p+'</b>':'Tarief op aanvraag'}</div>
  <a href="advertentie.html?id=${x.id}" class="btn btn-pd w-full mt-3"><i class="fa fa-user"></i> Bekijk advertentie</a>
  <a href="${PD.cityPage(x.c)}" class="btn btn-ghost w-full mt-2 !text-[12px]">Meer in ${esc(x.c)}</a>`
  :`<div class="font-bold text-[#212529]">${esc(v.user)}</div><p class="text-[12px] text-ink-muted mt-1">Video van een Paydates-gebruiker.</p><a href="search.html?f=video" class="btn btn-pd w-full mt-3">Escorts met video</a><a href="chatten.html" class="btn btn-ghost w-full mt-2 !text-[12px]"><i class="fa fa-comments"></i> Naar de chat</a>`;
 vm.classList.remove('hidden');document.body.style.overflow='hidden';vp.play().catch(()=>{});}
function close(){vp.pause();vp.removeAttribute('src');vp.load();vm.classList.add('hidden');document.body.style.overflow='';}
function step(d){const l=visible();if(!l.length)return;const i=l.indexOf(cur);open(l[(i+d+l.length)%l.length]);}
document.addEventListener('click',e=>{const b=e.target.closest('.vplay');if(b){open(b.closest('.vcard').dataset.mp4);return;}const t=e.target.closest('[data-open]');if(t)open(t.dataset.open);});
$('#vx').onclick=close;$('#vx2').onclick=close;$('#vprev').onclick=()=>step(-1);$('#vnext').onclick=()=>step(1);
vm.onclick=e=>{if(e.target===vm)close()};addEventListener('keydown',e=>{if(vm.classList.contains('hidden'))return;if(e.key==='Escape')close();if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1);});
render();const pre=PD.qs('v');if(pre)open(pre);})();
</script>'''
  title="Gratis Nederlandse sexfilmpjes & amateur porno video's | Paydates.nl"
  desc=f"Bekijk gratis {len(V)} Nederlandse sexfilmpjes en amateur porno van echte escorts, stellen en adverteerders. Filter op stad, categorie en geverifieerd – en maak direct een afspraak."
  return page('videos.html',title,desc,body,'videos',script,extra)
