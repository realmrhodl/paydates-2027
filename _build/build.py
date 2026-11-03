import json,re,collections
from layout import *
L=json.load(open('listings.json')); V=json.load(open('videos.json')); B=json.load(open('blogs.json'))
# ---- data opschonen ----
L=[x for x in L if x['id'] not in (597,607) and x['photos'] and x['n'].strip()]
for x in L:
  if x['a'] and x['a']>100: x['a']=2026-x['a']
  if x['c'] in ('s-Gravenhage',"'s-Gravenhage"): x['c']='Den Haag'
  x['n']=x['n'].strip(); x['vip']=int(bool(x['vip'])); x['top']=int(bool(x['top'])); x['v']=int(bool(x['v']))
V=[v for v in V if 'zonder condoom' not in (v['title'] or '').lower()]
# koppel video aan advertentie via gebruikersnaam
byname={x['n'].lower():x['id'] for x in L}
for v in V: v['ad']=byname.get((v['user'] or '').lower())
for b in B:
  if b['cat'] in ('Select Category','',None): b['cat']='Algemeen'
  b['cat']=b['cat'][:1].upper()+b['cat'][1:]
cnt=collections.Counter(x['c'] for x in L)
SVC=[k for k,_ in collections.Counter(m[0] for x in L for m in x['mog']).most_common()]
data={'L':L,'V':[{k:v[k] for k in ('href','thumb','title','user','views','days','mp4','ad')} for v in V],
      'B':[{k:b[k] for k in ('slug','title','img','cat','date','excerpt')} for b in B],
      'CITIES':CITIES,'CITYPROV':CITYPROV,'SVC':SVC}
open('../assets/data.js','w').write('/* Paydates V2 — echte advertenties, video\'s en blogs van paydates.nl (stand nov 2026). Telefoonnummers bewust niet opgenomen. */\nwindow.PD_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
json.dump({'L':L,'V':V,'B':B,'SVC':SVC,'cnt':cnt},open('_clean.json','w'),ensure_ascii=False)
built=[]

# ---- index (homepage, refactor van origineel) ----
src=open('index.source.html').read()
body=src[src.index('<!-- HERO'):src.index('<!-- FOOTER -->')]
script=src[src.index('<script>',src.index('<!-- FOOTER -->')):src.index('</body>')]
body=body.replace('<a href="#" class="adc adc-purple h-[100px]','<a href="adverteren.html" class="adc adc-purple h-[100px]',1)
navmap=[('Vrouwen','vrouwen.html'),('Mannen','mannen.html'),('Shemales','shemales.html'),('Stellen','stellen.html'),('Agency','agency.html'),('Videos','videos.html')]
for t,h in navmap: body=body.replace(f'<a href="#" class="px-3 py-2 rounded hover:bg-[#7351c017]">{t}</a>',f'<a href="{h}" class="px-3 py-2 rounded hover:bg-[#7351c017]">{t}</a>')
body=body.replace('<a href="#" class="px-3 py-2 rounded hover:bg-[#7351c017]"><i class="fa fa-coins','<a href="credits.html" class="px-3 py-2 rounded hover:bg-[#7351c017]"><i class="fa fa-coins')
body=body.replace('<a href="#chatten" class="chatLink','<a href="chatten.html" class="chatLink')
body=body.replace('<a href="#" class="px-3 py-2 rounded hover:bg-[#7351c017]"><i class="fa fa-plus','<a href="adverteren.html" class="px-3 py-2 rounded hover:bg-[#7351c017]"><i class="fa fa-plus')
body=body.replace('<a href="#" class="mt-3 block text-center rounded-pill bg-white text-pd','<a href="adverteren.html" class="mt-3 block text-center rounded-pill bg-white text-pd')
body=body.replace('<a href="#" class="block px-4 pb-3 text-[12px] text-pd','<a href="locaties.html" class="block px-4 pb-3 text-[12px] text-pd')
body=body.replace('<a href="#" class="adc adc-light h-[250px]','<a href="register.html?type=bedrijf" class="adc adc-light h-[250px]')
body=body.replace('<a href="#" class="text-[12px] text-pd hover:text-pd-darker whitespace-nowrap">Ook in TOP?','<a href="adverteren.html#top" class="text-[12px] text-pd hover:text-pd-darker whitespace-nowrap">Ook in TOP?')
# paginering -> naar zoekpagina met alle resultaten
body=re.sub(r'<div class="mt-6 flex flex-wrap justify-center gap-1 text-\[13px\]">.*?</div>','<div class="mt-6 flex justify-center"><a href="search.html" class="btn btn-ghost">Bekijk alle advertenties <i class="fa fa-angle-right"></i></a></div>',body,flags=re.S)
body=re.sub(r'<select class="rounded border border-line bg-white px-2 py-1.5 text-\[12px\]">.*?</select>','<select id="hSort" class="rounded border border-line bg-white px-2 py-1.5 text-[12px]"><option value="rec">Sorteer: Aanbevolen</option><option value="new">Nieuwste</option><option value="plo">Prijs laag–hoog</option><option value="phi">Prijs hoog–laag</option></select>',body,flags=re.S)
# overige # links in chat/upsell blokken
body=body.replace('<a href="#" class="mt-5 md:mt-auto inline-flex','<a href="chatten.html" class="mt-5 md:mt-auto inline-flex')
body=body.replace('<a href="#" class="inline-block mt-3 rounded-pill bg-gold','<a href="adverteren.html#vip" class="inline-block mt-3 rounded-pill bg-gold')
body=body.replace('<a href="#" class="inline-block mt-3 rounded-pill bg-pd text-white','<a href="credits.html" class="inline-block mt-3 rounded-pill bg-pd text-white')
body=body.replace('<a href="#" class="inline-block mt-3 rounded-pill bg-pd-darker','<a href="register.html?type=bedrijf" class="inline-block mt-3 rounded-pill bg-pd-darker')
body=body.replace('<a href="#" class="adc adc-gold w-[200px]','<a href="adverteren.html#vip" class="adc adc-gold w-[200px]')
body=body.replace('<a href="#" class="block text-center text-[11px] text-ink-muted hover:text-pd">Adverteren in deze ruimte?','<a href="adverteren.html#banners" class="block text-center text-[11px] text-ink-muted hover:text-pd">Adverteren in deze ruimte?')
body=re.sub(r'<a href="#"( class="adc adc-purple w-\[200px\])',r'<a href="chatten.html"\1',body)
# script aanpassen
script=re.sub(r'const L=\[.*?\];\n','const L=PD.D.L;\n',script,count=1,flags=re.S)
script=re.sub(r'function card\(x,w=\'\'\)\{.*?\n\}\n','const card=PD.card;\n',script,count=1,flags=re.S)
script=re.sub(r'const nativeAd=`.*?`;\n','const nativeAd=PD.nativeAd;\n',script,count=1,flags=re.S)
script=re.sub(r'const mobileAd=`.*?`;\n','const mobileAd=PD.mobileAd;\n',script,count=1,flags=re.S)
script=script.replace("const $=s=>document.querySelector(s);","const $=s=>document.querySelector(s);const SORT={v:'rec'};")
script=script.replace('<a href="${x.href}" target="_blank" rel="noopener" class="text-center shrink-0">','<a href="advertentie.html?id=${x.id}" class="text-center shrink-0">')
script=script.replace('`<a href="#" class="w-[150px] sm:w-[170px] shrink-0 rounded-lg border-2 border-dashed','`<a href="adverteren.html#top" class="w-[150px] sm:w-[170px] shrink-0 rounded-lg border-2 border-dashed')
script=script.replace('r.sort((a,b)=>b.vip-a.vip);',"if(SORT.v==='new')r.sort((a,b)=>b.id-a.id);else if(SORT.v==='plo')r.sort((a,b)=>(a.p||1e9)-(b.p||1e9));else if(SORT.v==='phi')r.sort((a,b)=>(b.p||0)-(a.p||0));else r.sort((a,b)=>b.vip-a.vip);")
script=script.replace("(st.ageMax>=60||x.a<=st.ageMax)","(st.ageMax>=60||!x.a||x.a<=st.ageMax)")
script=script.replace("$('#mSearchBtn').onclick=()=>{$('#mSearch').classList.toggle('hidden');$('#q2').focus()};\n","$('#hSort').onchange=e=>{SORT.v=e.target.value;render()};\n")
script=script.replace("$('#menuBtn').onclick=openSb;\n","")
script=re.sub(r"// age gate:.*?if\(location.hash==='#noage'\)\$\('#agegate'\).remove\(\);\n","",script,flags=re.S)
script=script.replace('<li><a href="#" data-city="${c}" class="cityLink','<li><a href="${PD.cityPage(c)}" data-city="${c}" class="cityLink')
script=script.replace("const c=e.target.closest('.cityLink');if(c){e.preventDefault();st.city=st.city===c.dataset.city?'':c.dataset.city;render()}\n","")
script=script.replace('<a href="#" class="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5','<a href="chatten.html#room-${encodeURIComponent(n)}" class="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5')
# cityLink: klik filtert op homepage (zoals live), href is SEO-stadspagina
assert 'const L=PD.D.L' in script and 'const card=PD.card' in script
built.append(page('index.html','Paydates.nl – Escorts, privé ontvangst & sekscontact in Nederland','Paydates.nl: echte escorts, privé ontvangst, erotische massage en online sekscontact in heel Nederland. Alle adverteerders 21+.',body,'index',script))
leftover=re.findall(r'href="#"',body+script)
print('index # links over:',len(leftover))

# ---- overzichtspagina's ----
TYPES=[('Escort','Escort'),('Privé ontvangst','Privé'),('Massage','Massage'),('Online','Online'),('BDSM','BDSM')]
def filters(lockG=None,svc=False,lang=True):
  g='' if lockG else '''<div><div class="text-[12px] text-ink-muted mb-2">Geslacht</div><div class="grid grid-cols-2 gap-2 text-[12px]">'''+''.join(f'<button data-g="{x}" class="gchip pill py-1.5">{x}</button>' for x in ['Vrouw','Man','Shemale','Stel'])+'</div></div>'
  s=''
  if svc:
    s='<div><div class="text-[12px] text-ink-muted mb-2">Mogelijkheden</div><div id="svcList" class="max-h-[260px] overflow-y-auto pr-1 space-y-1.5 text-[13px]"></div></div>'
  return f'''<aside id="lf" class="hidden lg:block w-full lg:w-[240px] shrink-0 space-y-3 fixed lg:static inset-0 z-50 lg:z-auto bg-body lg:bg-transparent p-4 pb-24 lg:p-0 overflow-y-auto overscroll-contain">
    <div class="lg:hidden flex justify-between items-center -mx-4 -mt-4 mb-3 px-4 h-14 bg-pd-header text-white sticky -top-4 z-10"><b class="text-[15px]">Filters</b><button id="closeFilters" class="w-9 h-9 text-2xl leading-none" aria-label="Sluiten">×</button></div>
    <div class="block">
      <div class="block-h">Filters</div>
      <div class="p-4 space-y-4">
        <div><div class="text-[12px] text-ink-muted mb-1.5">Zoekwoord</div><input id="fQ" type="search" class="inp !py-2 !text-[13px]" placeholder="Naam, service…"></div>
        <div><div class="text-[12px] text-ink-muted mb-1.5">Stad</div><select id="fCity" class="inp !py-2 !text-[13px]"></select></div>
        {g}
        <div><div class="text-[12px] text-ink-muted mb-2">Type</div><div class="grid grid-cols-2 gap-2 text-[12px]">{''.join(f'<button data-type="{a}" class="tchip pill py-1.5">{b}</button>' for a,b in TYPES)}</div></div>
        <div><div class="flex justify-between text-[12px] text-ink-muted mb-1"><span>Leeftijd</span><span id="ageLbl" class="text-ink font-semibold">18 – 60+</span></div><input id="fAgeMax" type="range" min="21" max="60" value="60" class="w-full"></div>
        <div><div class="flex justify-between text-[12px] text-ink-muted mb-1"><span>Max. tarief p/u</span><span id="priceLbl" class="text-ink font-semibold">Alle</span></div><input id="fPrice" type="range" min="0" max="500" step="25" value="0" class="w-full"></div>
        {'<div><div class="text-[12px] text-ink-muted mb-1.5">Taal</div><select id="fLang" class="inp !py-2 !text-[13px]"><option value="">Alle talen</option><option value="dutch">Nederlands</option><option value="english">Engels</option><option value="german">Duits</option><option value="spanish">Spaans</option><option value="french">Frans</option></select></div>' if lang else ''}
        <div class="space-y-2 text-[13px]">
          <label class="flex items-center gap-2"><input type="checkbox" data-flag="now"> Nu beschikbaar</label>
          <label class="flex items-center gap-2"><input type="checkbox" data-flag="verified"> Geverifieerd</label>
          <label class="flex items-center gap-2"><input type="checkbox" data-flag="video"> Met video</label>
          <label class="flex items-center gap-2"><input type="checkbox" data-flag="price"> Met tarief</label>
        </div>
        {s}
        <button id="resetBtn" class="w-full rounded border border-line py-2 text-[12px] text-ink-muted hover:bg-body-light">Filters wissen</button>
      </div>
    </div>
    <button id="applyFilters" class="lg:hidden fixed bottom-0 inset-x-0 z-20 m-3 h-12 rounded-pill bg-pd text-white font-bold text-[15px] shadow-lg">Toon resultaten</button>
    {SIDE_AD}
  </aside>'''

def listing_page(fn,active,title,desc,h1,intro,preset,crumb,seo_html='',svc=False,lockG=False,extra_top=''):
  body=f'''{LEADER}
<div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-4 flex gap-4">
  {filters(lockG,svc)}
  <main class="flex-1 min-w-0">
    {crumbs(crumb)}
    <div class="mt-2 mb-3">
      <h1 class="text-[20px] sm:text-[22px] font-bold text-[#212529] leading-tight">{h1} <span id="count" class="text-[12px] font-normal text-ink-muted"></span></h1>
      <p class="text-ink-muted text-[13px] mt-1 max-w-3xl">{intro}</p>
    </div>
    {extra_top}
    <div class="flex items-center justify-between gap-2 mb-3">
      <div class="flex gap-1.5 overflow-x-auto scrollbar-none">{''.join(f'<button data-type="{a}" class="tchip pill px-3 py-1 text-[12px] whitespace-nowrap">{b}</button>' for a,b in TYPES)}</div>
      <div class="flex items-center gap-2 shrink-0">
        <button id="openFilters" class="lg:hidden btn btn-ghost !py-1.5 !px-3 !text-[12px]"><i class="fa fa-sliders"></i> Filters</button>
        <select id="fSort" class="rounded border border-line bg-white px-2 py-1.5 text-[12px]"><option value="rec">Aanbevolen</option><option value="new">Nieuwste</option><option value="plo">Prijs laag–hoog</option><option value="phi">Prijs hoog–laag</option></select>
      </div>
    </div>
    <div id="grid" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3"></div>
    {seo_html}
  </main>
  {RAIL}
</div>'''
  sc=f'<script>window.PD_PRESET={json.dumps(preset,ensure_ascii=False)};</script>\n<script src="assets/listing.js"></script>'
  if svc: sc='<script>(function(){const el=document.getElementById("svcList");el.innerHTML=PD.D.SVC.slice(0,40).map(s=>`<label class="flex items-center gap-2"><input type="checkbox" data-svc="${PD.esc(s)}"> ${PD.esc(s)}</label>`).join("")})();</script>\n'+sc
  built.append(page(fn,title,desc,body,active,sc))

def seo_box(title,paras,links=''):
  return f'<section class="block p-5 sm:p-6 mt-8"><h2 class="text-[16px] font-bold text-[#212529]">{title}</h2><div class="prose-pd !text-[13px] text-ink-muted">{"".join("<p>"+p+"</p>" for p in paras)}</div>{links}</section>'
def citylinks(prefix):
  return '<div class="mt-4 flex flex-wrap gap-1.5">'+''.join(f'<a href="escort-{c["slug"]}.html" class="pill px-3 py-1 text-[12px]">{prefix} {E(c["n"])}</a>' for c in CITIES[:20])+'<a href="locaties.html" class="pill px-3 py-1 text-[12px] !text-pd">Alle locaties</a></div>'

CATS=[('vrouwen.html','vrouwen','Vrouw','Escorts &amp; sexdates met vrouwen','Vrouwen – escorts, privé ontvangst &amp; erotische massage','Ontdek echte vrouwelijke escorts, dames met privé ontvangst, erotische masseuses en online shows in heel Nederland. Alle adverteerders zijn 21+ en verklaren zelfstandig te werken.',
  ['Op Paydates.nl vind je advertenties van zelfstandige vrouwen uit heel Nederland: van high class escorts in Amsterdam tot privé ontvangst in Tilburg en erotische massage in Rotterdam.','Filter op stad, type, leeftijd, tarief en mogelijkheden. Geverifieerde adverteerders herken je aan het paarse vinkje. Maak altijd vooraf duidelijke afspraken en respecteer grenzen – lees ook onze <a href="veilig-daten.html">tips voor veilig daten</a>.']),
 ('mannen.html','mannen','Man','Mannelijke escorts &amp; gigolo\'s','Mannen – male escorts &amp; gigolo\'s','Mannelijke escorts en gigolo’s voor vrouwen, mannen en stellen. Discreet, op locatie of met privé ontvangst.',
  ['Zoek je een male escort voor een dinner date, een avond in het hotel of een erotische massage? Op Paydates.nl adverteren mannen uit heel Nederland voor vrouwen, mannen en stellen.','Bekijk foto\'s, tarieven en mogelijkheden en neem rechtstreeks contact op met de adverteerder.']),
 ('shemales.html','shemales','Shemale','Shemale &amp; trans escorts','Shemales – trans escorts &amp; travestie','Shemale- en trans escorts, travestie en online shows. Echte advertenties van trans personen in Nederland en België.',
  ['Paydates.nl is een inclusief platform. Hier vind je advertenties van shemales, trans vrouwen en travestieten die escort, privé ontvangst of online diensten aanbieden.','Wees respectvol in je contact en gebruik altijd de voornaamwoorden en grenzen die de adverteerder aangeeft.']),
 ('stellen.html','stellen','Stel','Stellen &amp; swingers','Stellen – erotische afspraken met stellen','Stellen die een trio, ruil of erotische afspraak zoeken, of samen escort aanbieden. Echte advertenties in heel Nederland.',
  ['Stellen op Paydates.nl bieden onder meer trio\'s, koppelafspraken en gezamenlijke escort aan. Spreek vooraf helder af wat wel en niet kan.','Zelf als stel adverteren? <a href="adverteren.html">Plaats gratis een advertentie</a> en kies voor VIP om bovenaan te staan.'])]
for fn,act,g,_,h1,intro,paras in CATS:
  t=re.sub('<[^>]+>','',h1).replace('&amp;','&')
  listing_page(fn,act,f'{t} | Paydates.nl',re.sub('<[^>]+>','',intro).replace('&amp;','&').replace('&#x27;',"'"),h1,intro,{'g':g,'lockG':True},[(t.split(' –')[0],None)],seo_box(h1,paras,citylinks({'Vrouw':'Escort','Man':'Male escort','Shemale':'Shemale','Stel':'Stellen'}[g])),lockG=True)

# agency: bedrijven/clubs. Live: agency-sectie. Geen echte agencies in data -> lege staat + aanmelden + alle adverteerders als preview
agency_top='''<section class="grid md:grid-cols-3 gap-3 mb-4">
  <div class="block p-4 md:col-span-2 flex flex-col sm:flex-row gap-4 items-start">
    <div class="w-12 h-12 shrink-0 rounded-full bg-[#7351c017] text-pd flex items-center justify-center text-xl"><i class="fa fa-building"></i></div>
    <div><h2 class="text-[15px] font-bold text-[#212529]">Escortbureaus, clubs &amp; massagesalons</h2>
    <p class="text-ink-muted text-[13px] mt-1">Erkende bedrijven met een vergunning presenteren hier al hun profielen onder één agency-pagina, met eigen logo, openingstijden en contactgegevens. Ieder bedrijfsaccount wordt gecontroleerd op KvK-inschrijving en (gemeentelijke) vergunning.</p>
    <div class="flex flex-wrap gap-2 mt-3"><a href="register.html?type=bedrijf" class="btn btn-pd !py-2 !text-[13px]"><i class="fa fa-plus"></i> Agency aanmelden</a><a href="adverteren.html#bedrijf" class="btn btn-ghost !py-2 !text-[13px]">Tarieven voor bedrijven</a></div></div>
  </div>
  <div class="block p-4"><div class="text-[12px] font-bold text-pd uppercase tracking-wider">Voor bedrijven</div><ul class="mt-2 space-y-1.5 text-[13px]"><li><i class="fa fa-check text-pd mr-1.5"></i>Onbeperkt profielen beheren</li><li><i class="fa fa-check text-pd mr-1.5"></i>Eigen agency-pagina &amp; logo</li><li><i class="fa fa-check text-pd mr-1.5"></i>Credits delen over profielen</li><li><i class="fa fa-check text-pd mr-1.5"></i>Factuur op bedrijfsnaam</li></ul></div>
</section>
<div class="block p-4 mb-4 flex items-start gap-3"><i class="fa fa-circle-info text-pd mt-0.5"></i><p class="text-[13px] text-ink-muted"><b class="text-[#212529]">Er staan nog geen geverifieerde agencies online.</b> Hieronder vind je alle zelfstandige adverteerders. Ben jij een bureau of club? Wees de eerste en sta direct bovenaan deze pagina.</p></div>'''
listing_page('agency.html','agency','Agency – escortbureaus, clubs & salons | Paydates.nl','Escortbureaus, clubs en massagesalons met vergunning op Paydates.nl. Meld je bedrijf aan en beheer al je profielen op één plek.','Agency','Escortbureaus, clubs en salons met vergunning, en alle zelfstandige adverteerders.',{},[('Agency',None)],'',extra_top=agency_top)

# uitgebreid zoeken
listing_page('search.html','search','Uitgebreid zoeken | Paydates.nl','Zoek op Paydates.nl op stad, geslacht, type, leeftijd, tarief, taal en mogelijkheden.','Uitgebreid zoeken','Combineer filters om precies te vinden wat je zoekt. Je zoekopdracht staat in de URL, dus je kunt hem bewaren of delen.',{},[('Uitgebreid zoeken',None)],svc=True)

# stadspagina's
for c in CITIES:
  n=c['n']; k=cnt.get(n,0)
  intro=f'Escorts, privé ontvangst en erotische massage in {E(n)} en omgeving ({E(c["prov"])}). Echte advertenties van adverteerders van 21 jaar en ouder.'
  near=[x for x in CITIES if x['prov']==c['prov'] and x['n']!=n][:12]
  links='<div class="mt-4"><div class="text-[12px] font-semibold text-[#212529] mb-2">Ook in '+E(c['prov'])+'</div><div class="flex flex-wrap gap-1.5">'+''.join(f'<a href="escort-{x["slug"]}.html" class="pill px-3 py-1 text-[12px]">Escort {E(x["n"])}</a>' for x in near)+'<a href="locaties.html" class="pill px-3 py-1 text-[12px] !text-pd">Alle locaties</a></div></div>'
  seo=seo_box(f'Escort {E(n)}: discreet afspreken',[f'Op zoek naar een escort in {E(n)}? Op Paydates.nl vind je zelfstandige escorts, dames en heren met privé ontvangst en erotische masseuses in {E(n)} en de rest van {E(c["prov"])}. Je neemt rechtstreeks contact op met de adverteerder – Paydates rekent geen bemiddelingskosten.',f'Kies voor geverifieerde profielen en spreek altijd vooraf tarief, duur en grenzen af. Werk je zelf als sekswerker in {E(n)}? <a href="adverteren.html">Plaats je advertentie</a> en kies VIP om bovenaan de stadspagina te staan.'],links)
  listing_page(f'escort-{c["slug"]}.html','locaties',f'Escort {n} – escorts & privé ontvangst in {n} | Paydates.nl',f'Escort {n}: echte escorts, privé ontvangst en erotische massage in {n} en omgeving. Alle adverteerders 21+.',f'Escort {E(n)}',intro,{'city':n,'lockCity':True},[('Locaties','locaties.html'),(f'Escort {n}',None)],seo)

# locaties
blocks=''
for p in PROVS:
  cs=[c for c in CITIES if c['prov']==p]
  if not cs: continue
  blocks+=f'<div class="block"><div class="block-h flex justify-between"><span>{p}</span><span class="text-ink-muted font-normal">{sum(cnt.get(c["n"],0) for c in cs)} advertenties</span></div><ul class="p-2 grid grid-cols-2 gap-x-2 text-[13px]">'+''.join(f'<li><a href="escort-{c["slug"]}.html" class="flex justify-between rounded px-2 py-1.5 hover:bg-[#7351c017] hover:text-pd"><span>Escort {E(c["n"])}</span><span class="text-[11px] text-ink-soft">{cnt.get(c["n"],0) or ""}</span></a></li>' for c in cs)+'</ul></div>'
popular=sorted(CITIES,key=lambda c:-cnt.get(c['n'],0))[:8]
body=f'''<div class="max-w-[1400px] mx-auto px-3 lg:px-6 py-5">
  {crumbs([('Locaties',None)])}
  <h1 class="text-[22px] font-bold text-[#212529] mt-2">Alle locaties</h1>
  <p class="text-ink-muted mt-1 max-w-3xl">Vind escorts, privé ontvangst en erotische massage bij jou in de buurt. Kies je provincie en stad.</p>
  <form class="mt-4 max-w-md relative" onsubmit="event.preventDefault();const v=this.c.value.trim().toLowerCase();const m=PD.D.CITIES.find(x=>x.n.toLowerCase()===v);location.href=m?'escort-'+m.slug+'.html':'search.html?q='+encodeURIComponent(this.c.value)">
    <i class="fa fa-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"></i><input name="c" list="cl" class="inp !pl-9" placeholder="Typ je stad…"><datalist id="cl">{''.join(f'<option value="{E(c["n"])}">' for c in CITIES)}</datalist>
  </form>
  <div class="mt-5 flex flex-wrap gap-2">{''.join(f'<a href="escort-{c["slug"]}.html" class="pill px-4 py-1.5 text-[13px]"><i class="fa fa-fire text-gold mr-1"></i>{E(c["n"])}</a>' for c in popular)}</div>
  <div class="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">{blocks}</div>
  <div class="block p-5 mt-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"><div><b class="text-[#212529]">Staat jouw stad er niet tussen?</b><p class="text-ink-muted text-[13px]">Gebruik <a href="search.html" class="text-pd font-semibold">uitgebreid zoeken</a> of plaats als eerste een advertentie in jouw plaats.</p></div><a href="adverteren.html" class="btn btn-pd shrink-0"><i class="fa fa-plus"></i> Plaats advertentie</a></div>
</div>'''
built.append(page('locaties.html','Alle locaties – escorts per provincie en stad | Paydates.nl','Overzicht van alle steden op Paydates.nl: escorts, privé ontvangst en erotische massage per provincie.',body,'locaties'))
json.dump(built,open('_built1.json','w'))
print(len(built),'pagina\'s')
