# Genereert seksclubs.html (hub) + detailpagina's per club. Shell uit agency.html.
import os,re,json,html
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
A=open(os.path.join(R,'agency.html'),encoding='utf-8').read()
HEAD_END=A.index('<!-- 18+ poort -->')
SHELL_TOP=A[HEAD_END:A.index('<div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-4 flex gap-4">')]
FOOTER=A[A.index('<!-- FOOTER -->'):A.index('</footer>')+len('</footer>')]
RIGHT=A[A.index('<aside class="hidden xl:block w-[200px] shrink-0">'):]
RIGHT=RIGHT[:RIGHT.index('</aside>')+len('</aside>')]
E=html.escape
DAYS=['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag']
DS=['ma','di','wo','do','vr','za','zo']

C=[
 dict(slug='seksclub-boccaccio-laren',name="Boccaccio Men's Club",short='Boccaccio',type='Seksclub',city='Laren',prov='Noord-Holland',spot=True,demo=False,
  img='img/sponsors/boccaccio/hero.jpg',logo='img/sponsors/boccaccio/logo.png',
  gallery=['img/sponsors/boccaccio/lounge.png','img/sponsors/boccaccio/portrait1.jpg','img/sponsors/boccaccio/portrait2.jpg','img/sponsors/boccaccio/stock.jpg'],
  tag="Gentlemen's club in een villa aan de A1",
  intro="Boccaccio is een gentlemen's club in Laren (NH), vlak aan de A1 en binnen 15 à 20 minuten vanaf Amsterdam, Almere, Amersfoort, Utrecht en Schiphol. Je ontspant op een van de terrassen of aan de bar, met een hapje en een glas van de wijnkaart, en maakt kennis met de 15 tot 20 aanwezige dames. Er zijn dagelijks striptease- en paaldansshows en geregeld thema-avonden met buffet of barbecue.",
  fac=['Bar & wijnkaart','Dagelijks shows','3-gangen diner','Zwembad','Sauna','Driving range','Kamers met airco','Gratis privéparkeren','Gratis pick-up service'],
  hours=[['14:00','01:00']]*5+[None,None],
  addr='Hector Treublaan 2, 1251 CG Laren',phone='035-5311717',tel='+31355311717',web='https://www.boccaccio.nl/',webl='boccaccio.nl',
  extra='Gratis pick-up service voor 2 of meer personen binnen een straal van 40 km (o.a. Amsterdam, Utrecht en Schiphol).'),
 dict(slug='privehuis-villa-lavendel-utrecht',name='Villa Lavendel',type='Privéhuis',city='Utrecht',prov='Utrecht',
  tag='Kleinschalig privéhuis met vaste dames',intro='Villa Lavendel is een kleinschalig privéhuis met een rustige ontvangst en een handvol themakamers. Je wordt ontvangen in de lounge, waarna je kennismaakt met de aanwezige dames.',
  fac=['Lounge','Themakamers','Douche op de kamer','Airco','Discreet parkeren','Pinnen mogelijk'],hours=[['11:00','23:00']]*6+[None]),
 dict(slug='seksclub-club-noir-amsterdam',name='Club Noir',type='Seksclub',city='Amsterdam',prov='Noord-Holland',
  tag='Nachtclub-sfeer met bar en shows',intro='Club Noir combineert een cocktailbar met shows in het weekend. Na een drankje aan de bar kun je je terugtrekken in een van de privékamers.',
  fac=['Cocktailbar','Shows in het weekend','Jacuzzi','Privékamers','Pinnen mogelijk'],hours=[None]+[['20:00','04:00']]*6),
 dict(slug='privehuis-de-linde-eindhoven',name='Privéhuis De Linde',type='Privéhuis',city='Eindhoven',prov='Noord-Brabant',
  tag='Overdag geopend, ook voor een korte afspraak',intro='Privéhuis De Linde is overdag geopend en richt zich op een ontspannen, discrete ontvangst. Afspraken van een half uur zijn mogelijk.',
  fac=['Discrete ingang','Douche op de kamer','Massagekamer','Airco','Gratis parkeren'],hours=[['10:00','22:00']]*5+[['12:00','20:00'],None]),
 dict(slug='seksclub-club-saffier-rotterdam',name='Club Saffier',type='Seksclub',city='Rotterdam',prov='Zuid-Holland',
  tag='Weekendclub met paaldans en lounge',intro='Club Saffier is van donderdag tot en met zaterdag open, met een ruime lounge, paaldansshows en een vaste bezetting dames.',
  fac=['Bar','Paaldans','Lounge','Privékamers','Rookruimte'],hours=[None,None,None,['21:00','05:00'],['21:00','05:00'],['21:00','05:00'],None]),
 dict(slug='privehuis-huize-fleur-groningen',name='Huize Fleur',type='Privéhuis',city='Groningen',prov='Groningen',
  tag='Dagelijks geopend, centraal gelegen',intro='Huize Fleur is een privéhuis op loopafstand van het centrum, zeven dagen per week geopend.',
  fac=['Dagelijks open','Douche op de kamer','Bubbelbad','Airco','Pinnen mogelijk'],hours=[['12:00','00:00']]*7),
 dict(slug='seksclub-club-amethist-arnhem',name='Club Amethist',type='Seksclub',city='Arnhem',prov='Gelderland',
  tag='Club met bar, sauna en themakamers',intro='Club Amethist heeft een bar, sauna en meerdere themakamers. Op vrijdag en zaterdag zijn er shows.',
  fac=['Bar','Sauna','Themakamers','Shows vr & za','Gratis parkeren'],hours=[None,None,['20:00','03:00'],['20:00','03:00'],['20:00','03:00'],['20:00','03:00'],['20:00','03:00']]),
 dict(slug='privehuis-rozenhof-breda',name='Privéhuis Rozenhof',type='Privéhuis',city='Breda',prov='Noord-Brabant',
  tag='Rustig privéhuis aan de rand van de stad',intro='Privéhuis Rozenhof ligt aan de rand van Breda met eigen parkeerplaats en een rustige, persoonlijke ontvangst.',
  fac=['Eigen parkeerplaats','Douche op de kamer','Airco','Discrete ingang'],hours=[['11:00','23:00']]*6+[None]),
]
for c in C:
  c.setdefault('spot',False);c.setdefault('demo',True);c.setdefault('short',c['name'])

def hours_txt(h): return 'Gesloten' if not h else f'{h[0]} – {h[1]}'
def hours_sum(c):
  # compacte samenvatting, bv. "ma–vr 14:00–01:00"
  out=[];i=0;H=c['hours']
  while i<7:
    j=i
    while j+1<7 and H[j+1]==H[i]: j+=1
    if H[i]: out.append((DS[i] if i==j else DS[i]+'–'+DS[j])+' '+H[i][0]+'–'+H[i][1])
    i=j+1
  return ' · '.join(out)

def head(title,desc,canon,extra=''):
  t=E(title);d=E(desc)
  return f'''<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{t}</title>
<meta name="description" content="{d}">
<meta name="theme-color" content="#6849ad">
<meta property="og:site_name" content="Paydates.nl"><meta property="og:title" content="{t}"><meta property="og:description" content="{d}">
<!-- pd-seo -->
<link rel="canonical" href="https://paydates.nl/{canon}">
<meta property="og:type" content="website"><meta property="og:locale" content="nl_NL">
<meta property="og:url" content="https://paydates.nl/{canon}">
<meta property="og:image" content="https://paydates.nl/img/og/paydates-default.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{t}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{t}"><meta name="twitter:description" content="{d}"><meta name="twitter:image" content="https://paydates.nl/img/og/paydates-default.jpg">
<!-- /pd-seo -->
{extra}<link rel="icon" href="img/header-logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="assets/app.css">
<link rel="stylesheet" href="assets/tailwind.css">

<script id="pd18-head">(function(){{var ok=0;try{{var v=localStorage.getItem('pd18');if(v==='1'||(v&&Date.now()-(+v)<7776e6))ok=1}}catch(e){{}}if(ok||/(?:^|;\\s*)pd18=1/.test(document.cookie)||/(^|;)pd18(;|$)/.test(window.name)||/[?&]pd18=1(&|$)/.test(location.search)||location.hash==='#noage')document.documentElement.classList.add('pd18ok')}})();</script>
</head>
<body class="font-sans antialiased" data-page="seksclubs">
'''

TAIL='''<script src="assets/data.js"></script>
<script src="assets/app.js"></script>
<script>
/* open/dicht op basis van openingstijden (data-hours = 7 dagen ma..zo, [van,tot] of null) */
(function(){
 function m(t){var p=t.split(':');return (+p[0])*60+(+p[1])}
 function st(H){var d=new Date(),wd=(d.getDay()+6)%7,now=d.getHours()*60+d.getMinutes(),y=H[(wd+6)%7],t=H[wd];
  if(y){var ys=m(y[0]),ye=m(y[1]);if(ye<=ys&&now<ye)return{open:1,txt:'Open tot '+y[1]}}
  if(t){var s=m(t[0]),e=m(t[1]);if(e<=s)e+=1440;if(now>=s&&now<e)return{open:1,txt:'Nu open · tot '+t[1]};if(now<s)return{open:0,txt:'Vandaag open vanaf '+t[0]}}
  for(var i=1;i<7;i++){var n=H[(wd+i)%7];if(n)return{open:0,txt:'Gesloten · '+(i==1?'morgen':['ma','di','wo','do','vr','za','zo'][(wd+i)%7])+' vanaf '+n[0]}}
  return{open:0,txt:'Gesloten'}}
 document.querySelectorAll('[data-hours]').forEach(function(el){var s=st(JSON.parse(el.getAttribute('data-hours')));el.innerHTML='<span class="sc-dot'+(s.open?' on':'')+'"></span>'+s.txt;el.classList.toggle('is-open',!!s.open)});
 var wd=(new Date().getDay()+6)%7;document.querySelectorAll('[data-day="'+wd+'"]').forEach(function(r){r.classList.add('sc-today')});
})();
</script>
'''

def cover(c,cls='sc-ph'):
  if c.get('img'): return f'<img src="{c["img"]}" alt="{E(c["name"])} in {E(c["city"])}" loading="lazy" class="{cls} w-full h-full object-cover">'
  ic='fa-champagne-glasses' if c['type']=='Seksclub' else 'fa-house-chimney-window'
  return f'<div class="{cls} sc-ph-fb sc-ph-{"club" if c["type"]=="Seksclub" else "prive"}"><i class="fa {ic}"></i><span>{E(c["short"])}</span></div>'

def card(c):
  badge='<span class="sc-badge sc-badge-gold"><i class="fa fa-crown"></i> Spotlight</span>' if c['spot'] else ''
  demo='<span class="sc-demo">Voorbeeldprofiel</span>' if c['demo'] else ''
  return f'''<a href="{c["slug"]}.html" class="sc-card block" data-type="{c["type"]}" data-city="{E(c["city"].lower())}" data-q="{E((c["name"]+" "+c["city"]+" "+c["prov"]+" "+c["type"]).lower())}">
  <div class="sc-card-img">{cover(c)}<div class="sc-card-tags"><span class="sc-badge">{c["type"]}</span>{badge}</div>{demo}</div>
  <div class="p-3">
   <div class="font-bold text-[14px] text-[#212529] leading-tight truncate">{E(c["name"])}</div>
   <div class="text-[12px] text-ink-muted mt-0.5"><i class="fa fa-location-dot text-pd mr-1"></i>{E(c["city"])}, {E(c["prov"])}</div>
   <div class="sc-open mt-2" data-hours='{json.dumps(c["hours"])}'>{E(hours_sum(c))}</div>
  </div>
 </a>'''

# ---------------- HUB ----------------
def hub():
  b=C[0]
  t='Seksclubs & privéhuizen in Nederland | Paydates.nl'
  d='Seksclubs en privéhuizen in Nederland op één plek: clubprofielen met faciliteiten, openingstijden en contact. Zoek per stad of type.'
  cities=sorted({c['city'] for c in C})
  ld={"@context":"https://schema.org","@type":"CollectionPage","name":"Seksclubs & Privéhuizen","url":"https://paydates.nl/seksclubs.html","inLanguage":"nl-NL"}
  s=head(t,d,'seksclubs.html',f'<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script>\n')+SHELL_TOP
  s+=f'''<div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-4 flex gap-4">
  <main class="flex-1 min-w-0">
    <nav class="crumbs flex flex-wrap items-center gap-1.5"><a href="index.html"><i class="fa fa-house"></i></a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><span class="text-ink">Seksclubs &amp; Privéhuizen</span></nav>
    <div class="mt-2 mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
      <div>
        <h1 class="text-[20px] sm:text-[24px] font-bold text-[#212529] leading-tight">Seksclubs &amp; Privéhuizen</h1>
        <p class="text-ink-muted text-[13px] mt-1 max-w-2xl">Clubs en privéhuizen in Nederland met hun eigen profiel: sfeer, faciliteiten, openingstijden en hoe je ze bereikt. Geen losse advertenties, maar de locaties zelf.</p>
      </div>
      <a href="register.html?type=bedrijf" class="btn btn-pd !py-2 !text-[13px] shrink-0"><i class="fa fa-plus"></i> Club aanmelden</a>
    </div>

    <!-- CLUB SPOTLIGHT -->
    <section class="bx bx-band rounded-xl mb-2" aria-labelledby="scSpotT">
      <a class="bx-band-link" href="{b["slug"]}.html" aria-label="{E(b["name"])} – bekijk clubprofiel">
        <img src="{b["img"]}" alt="" class="bx-band-bg" loading="eager">
        <div class="bx-band-ov"></div>
        <div class="bx-band-inner px-4 sm:px-6">
          <div class="bx-band-left">
            <div class="bx-tags bx-tags-static"><span class="bx-badge"><i class="fa fa-crown"></i> Club Spotlight</span></div>
            <img src="{b["logo"]}" alt="{E(b["name"])}" class="bx-logo">
            <p class="bx-kicker">Gentlemen's club · Laren (NH)</p>
            <h2 id="scSpotT" class="bx-h">De villa van Boccaccio</h2>
            <p class="bx-lead">15–20 dames · shows &amp; diner · zwembad, sauna &amp; driving range · ±15 min van Amsterdam, Utrecht &amp; Schiphol</p>
            <div class="bx-cta-row"><span class="bx-cta">Bekijk clubprofiel <i class="fa fa-angle-right"></i></span><span class="bx-cta2" data-hours='{json.dumps(b["hours"])}'>{E(hours_sum(b))}</span></div>
          </div>
          <div class="bx-band-film" aria-hidden="true">{"".join(f'<img src="{g}" alt="">' for g in b["gallery"][:3])}</div>
        </div>
      </a>
    </section>
    <div class="flex justify-end mb-4"><a href="adverteren.html#bedrijf" class="text-[12px] text-ink-muted hover:text-pd"><i class="fa fa-crown text-gold mr-1"></i>Jouw club bovenaan? <b class="text-pd">Bekijk het Spotlight-pakket</b> <i class="fa fa-angle-right text-[10px]"></i></a></div>

    <!-- FILTERS -->
    <div class="block p-3 mb-3 flex flex-col sm:flex-row sm:items-center gap-2.5">
      <div class="flex gap-1.5" role="group" aria-label="Type">
        <button type="button" data-sc-type="" class="sctype pill on px-3.5 py-1.5 text-[12px]">Alle</button>
        <button type="button" data-sc-type="Seksclub" class="sctype pill px-3.5 py-1.5 text-[12px]"><i class="fa fa-champagne-glasses mr-1"></i>Seksclub</button>
        <button type="button" data-sc-type="Privéhuis" class="sctype pill px-3.5 py-1.5 text-[12px]"><i class="fa fa-house-chimney-window mr-1"></i>Privéhuis</button>
      </div>
      <div class="relative sm:ml-auto sm:w-[280px]"><i class="fa fa-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-pd text-xs"></i><input id="scCity" type="search" list="scCities" class="inp !py-2 !pl-8 !text-[13px]" placeholder="Zoek op stad of naam…" aria-label="Zoek op stad of naam"><datalist id="scCities">{"".join(f'<option value="{E(x)}">' for x in cities)}</datalist></div>
      <span id="scCount" class="text-[12px] text-ink-muted whitespace-nowrap"></span>
    </div>

    <div id="scGrid" class="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
{chr(10).join(card(c) for c in C)}
    </div>
    <div id="scEmpty" class="hidden block p-6 text-center text-[13px] text-ink-muted"><i class="fa fa-magnifying-glass text-pd text-xl mb-2 block"></i>Geen clubs of privéhuizen gevonden voor deze zoekopdracht.<br><a href="register.html?type=bedrijf" class="text-pd font-semibold">Meld jouw club aan</a> en sta als eerste in deze stad.</div>

    <!-- CTA -->
    <section class="grid md:grid-cols-3 gap-3 mt-6">
      <div class="block p-5 md:col-span-2 flex flex-col sm:flex-row gap-4 items-start">
        <div class="w-12 h-12 shrink-0 rounded-full bg-[#7351c017] text-pd flex items-center justify-center text-xl"><i class="fa fa-building"></i></div>
        <div><h2 class="text-[15px] font-bold text-[#212529]">Heb je een seksclub of privéhuis?</h2>
        <p class="text-ink-muted text-[13px] mt-1">Maak een bedrijfsaccount aan en zet je locatie op Paydates met foto's, faciliteiten, openingstijden en contactgegevens. We controleren elk bedrijfsaccount op KvK-inschrijving en (gemeentelijke) vergunning.</p>
        <div class="flex flex-wrap gap-2 mt-3"><a href="register.html?type=bedrijf" class="btn btn-pd !py-2 !text-[13px]"><i class="fa fa-plus"></i> Club aanmelden</a><a href="adverteren.html#bedrijf" class="btn btn-ghost !py-2 !text-[13px]">Tarieven voor bedrijven</a></div></div>
      </div>
      <a href="adverteren.html#bedrijf" class="adc adc-gold p-5 flex-col justify-between">
        <div><div class="text-[11px] font-bold tracking-[.18em] text-gold"><i class="fa fa-crown mr-1"></i>CLUB SPOTLIGHT</div>
        <div class="text-[17px] font-bold leading-tight mt-2">Bovenaan deze pagina en in je provincie</div>
        <p class="text-[12px] text-white/80 mt-1.5 leading-snug">Eén club tegelijk, met eigen beeld en directe link naar je profiel.</p></div>
        <span class="adbtn shine py-2 mt-4 text-[12px]">Bekijk Spotlight-pakket</span>
      </a>
    </section>
    <p class="text-[11px] text-ink-soft mt-4">Profielen met het label <i>Voorbeeldprofiel</i> laten zien hoe een clubpagina eruitziet en zijn geen bestaande locaties.</p>
  </main>
  {RIGHT}
</div>
{FOOTER}
{TAIL}<script>
(function(){{var T='',cards=[].slice.call(document.querySelectorAll('.sc-card')),inp=document.getElementById('scCity');
 var u=new URLSearchParams(location.search);if(u.get('type'))T=u.get('type');if(u.get('stad'))inp.value=u.get('stad');
 function f(){{var q=inp.value.trim().toLowerCase(),n=0;cards.forEach(function(c){{var ok=(!T||c.dataset.type===T)&&(!q||c.dataset.q.indexOf(q)>-1);c.style.display=ok?'':'none';if(ok)n++}});
  document.getElementById('scCount').textContent=n+(n==1?' locatie':' locaties');document.getElementById('scEmpty').classList.toggle('hidden',n>0);
  document.querySelectorAll('.sctype').forEach(function(b){{b.classList.toggle('on',b.dataset.scType===T)}})}}
 document.querySelectorAll('.sctype').forEach(function(b){{b.addEventListener('click',function(){{T=b.dataset.scType;f()}})}});inp.addEventListener('input',f);f();
}})();
</script>
</body>
</html>
'''
  return s

# ---------------- DETAIL ----------------
def detail(c):
  kind='seksclub' if c['type']=='Seksclub' else 'privéhuis'
  if c['spot']:
    t=f"{c['short']} {c['city']} – gentlemen's club & seksclub | Paydates.nl"
    d=f"{c['name']} in {c['city']} ({c['prov']}): faciliteiten, openingstijden ({hours_sum(c)}), adres en contact. Club Spotlight op Paydates.nl."
  else:
    t=f"{c['name']} {c['city']} – {kind} | Paydates.nl"
    d=f"{c['name']}, {kind} in {c['city']}: faciliteiten, openingstijden en contact op Paydates.nl."
  extra=''
  if c['demo']: extra='<meta name="robots" content="noindex, follow">\n'
  else:
    ld={"@context":"https://schema.org","@type":"AdultEntertainment","name":c['name'],"url":c['web'],"telephone":c['tel'],
        "address":{"@type":"PostalAddress","streetAddress":"Hector Treublaan 2","postalCode":"1251 CG","addressLocality":c['city'],"addressCountry":"NL"},
        "openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"14:00","closes":"01:00"}],
        "image":"https://paydates.nl/"+c['img']}
    extra=f'<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script>\n'
  s=head(t,d,c['slug']+'.html',extra)+SHELL_TOP
  # contact
  if c.get('web'):
    cta=f'''<a href="{c["web"]}" target="_blank" rel="noopener sponsored" class="btn btn-pd !py-2 !text-[13px]"><i class="fa fa-globe"></i> {c["webl"]}</a><a href="tel:{c["tel"]}" class="btn btn-ghost !py-2 !text-[13px]"><i class="fa fa-phone"></i> {c["phone"]}</a><a href="https://www.google.com/maps/search/?api=1&amp;query={E(c["addr"].replace(" ","+"))}" target="_blank" rel="noopener" class="btn btn-ghost !py-2 !text-[13px]"><i class="fa fa-route"></i> Route</a>'''
    addr=f'<li class="flex gap-2"><i class="fa fa-location-dot text-pd mt-0.5 w-4"></i><span>{E(c["addr"])}</span></li><li class="flex gap-2"><i class="fa fa-phone text-pd mt-0.5 w-4"></i><a href="tel:{c["tel"]}" class="hover:text-pd">{c["phone"]}</a></li><li class="flex gap-2"><i class="fa fa-globe text-pd mt-0.5 w-4"></i><a href="{c["web"]}" target="_blank" rel="noopener sponsored" class="hover:text-pd">{c["webl"]}</a></li>'
  else:
    cta='<span class="btn btn-pd !py-2 !text-[13px] opacity-60 cursor-not-allowed" title="Voorbeeldprofiel"><i class="fa fa-globe"></i> Website</span><span class="btn btn-ghost !py-2 !text-[13px] opacity-60 cursor-not-allowed" title="Voorbeeldprofiel"><i class="fa fa-phone"></i> Bellen</span><span class="btn btn-ghost !py-2 !text-[13px] opacity-60 cursor-not-allowed" title="Voorbeeldprofiel"><i class="fa fa-route"></i> Route</span>'
    addr=f'<li class="flex gap-2"><i class="fa fa-location-dot text-pd mt-0.5 w-4"></i><span>{E(c["city"])}, {E(c["prov"])}</span></li><li class="flex gap-2 text-ink-soft"><i class="fa fa-phone mt-0.5 w-4"></i><span>Telefoon volgt</span></li><li class="flex gap-2 text-ink-soft"><i class="fa fa-globe mt-0.5 w-4"></i><span>Website volgt</span></li>'
  hrows=''.join(f'<tr data-day="{i}"><td class="py-1.5 pr-3">{DAYS[i]}</td><td class="py-1.5 text-right font-semibold {"text-ink-soft" if not h else "text-[#212529]"}">{hours_txt(h)}</td></tr>' for i,h in enumerate(c['hours']))
  gal=c.get('gallery',[])
  gitems=''.join(f'<div class="sc-gal"><img src="{g}" alt="{E(c["name"])} – foto {i+1}" loading="lazy" class="w-full h-full object-cover"></div>' for i,g in enumerate(gal))
  gitems+=''.join('<div class="sc-gal sc-gal-ph"><i class="fa fa-image"></i></div>' for _ in range(max(0,6-len(gal))))
  facs=''.join(f'<span class="bc pill px-3 py-1.5 text-[12px]"><i class="fa fa-check text-pd mr-1"></i>{E(x)}</span>' for x in c['fac'])
  others=[o for o in C if o is not c][:4]
  olinks=''.join(f'<li><a href="{o["slug"]}.html" class="flex items-center justify-between gap-2 hover:text-pd"><span class="truncate">{E(o["name"])}</span><span class="text-[11px] text-ink-soft shrink-0">{o["type"]} · {E(o["city"])}</span></a></li>' for o in others)
  spot_badge='<span class="bx-badge"><i class="fa fa-crown"></i> Club Spotlight</span>' if c['spot'] else ''
  demo_note='<div class="block p-3 mb-3 flex items-start gap-2.5 text-[12.5px] text-ink-muted"><i class="fa fa-circle-info text-pd mt-0.5"></i><span><b class="text-[#212529]">Voorbeeldprofiel.</b> Zo ziet een club- of privéhuisprofiel op Paydates eruit. <a href="register.html?type=bedrijf" class="text-pd font-semibold">Meld je eigen locatie aan</a>.</span></div>' if c['demo'] else ''
  logo=f'<img src="{c["logo"]}" alt="{E(c["name"])}" class="sc-logo">' if c.get('logo') else ''
  extra_p=f'<p class="mt-2"><i class="fa fa-car-side text-pd mr-1.5"></i>{E(c["extra"])}</p>' if c.get('extra') else ''
  upsell='' if c['spot'] else f'''<a href="adverteren.html#bedrijf" class="adc adc-gold p-5 flex-col sm:flex-row sm:items-center gap-4 mt-4">
      <div class="flex-1"><div class="text-[11px] font-bold tracking-[.18em] text-gold"><i class="fa fa-crown mr-1"></i>CLUB SPOTLIGHT</div><div class="text-[16px] font-bold leading-tight mt-1">Wil je {E(c["name"])} bovenaan de seksclubs-pagina?</div><p class="text-[12px] text-white/80 mt-1">Eén club tegelijk in de Spotlight, met eigen beeld en een directe link naar dit profiel.</p></div>
      <span class="adbtn shine py-2 px-4 text-[12px] shrink-0">Bekijk Spotlight-pakket</span></a>'''
  s+=f'''<div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-4">
  <nav class="crumbs flex flex-wrap items-center gap-1.5"><a href="index.html"><i class="fa fa-house"></i></a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><a href="seksclubs.html">Seksclubs &amp; Privéhuizen</a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><span class="text-ink">{E(c["name"])}</span></nav>
  <!-- COVER -->
  <section class="sc-cover mt-2">
    <div class="sc-cover-img">{cover(c,"sc-cover-ph")}</div>
    <div class="sc-cover-ov"></div>
    <div class="sc-cover-in">
      <div class="flex flex-wrap gap-1.5 mb-2"><span class="sc-badge">{c["type"]}</span>{spot_badge}</div>
      {logo}
      <h1 class="text-[24px] sm:text-[32px] font-bold text-white leading-tight">{E(c["name"])}</h1>
      <p class="text-white/85 text-[13.5px] mt-1"><i class="fa fa-location-dot mr-1"></i>{E(c["city"])}, {E(c["prov"])} · {E(c["tag"])}</p>
      <div class="sc-open sc-open-dark mt-2" data-hours='{json.dumps(c["hours"])}'>{E(hours_sum(c))}</div>
    </div>
  </section>
  <div class="flex flex-wrap gap-2 mt-3">{cta}</div>
  <div class="flex flex-col lg:flex-row gap-4 mt-4">
   <main class="flex-1 min-w-0">
    {demo_note}
    <section class="block p-5"><h2 class="text-[16px] font-bold text-[#212529]">Over {E(c["short"])}</h2><div class="text-[13.5px] leading-relaxed text-ink mt-2"><p>{E(c["intro"])}</p>{extra_p}</div></section>
    <section class="block p-5 mt-4"><h2 class="text-[16px] font-bold text-[#212529]">Faciliteiten</h2><div class="flex flex-wrap gap-2 mt-3">{facs}</div></section>
    <section class="block p-5 mt-4"><div class="flex items-center justify-between"><h2 class="text-[16px] font-bold text-[#212529]">Foto's</h2><span class="text-[11px] text-ink-soft">{len(gal)} foto's</span></div><div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">{gitems}</div></section>
    <section class="block p-5 mt-4"><h2 class="text-[16px] font-bold text-[#212529]">Dames hier</h2>
      <div class="mt-3 rounded-lg border border-dashed border-line bg-body-light p-5 text-center">
        <div class="w-11 h-11 mx-auto rounded-full bg-[#7351c017] text-pd flex items-center justify-center"><i class="fa fa-user-group"></i></div>
        <p class="text-[13px] text-[#212529] font-semibold mt-2">Nog geen dames gekoppeld aan dit profiel</p>
        <p class="text-[12px] text-ink-muted mt-1 max-w-md mx-auto">Werk je bij {E(c["short"])}? Koppel je eigen advertentie aan deze locatie, dan verschijn je hier.</p>
        <a href="register.html?type=sekswerker" class="btn btn-ghost !py-1.5 !text-[12px] mt-3"><i class="fa fa-link"></i> Advertentie koppelen</a>
      </div>
    </section>
    <a href="jobs.html" class="block p-5 mt-4 flex items-center gap-4 hover:shadow-md transition">
      <div class="w-11 h-11 shrink-0 rounded-full bg-[#7351c017] text-pd flex items-center justify-center"><i class="fa fa-briefcase"></i></div>
      <div class="flex-1"><div class="text-[14px] font-bold text-[#212529]">Werken bij {E(c["short"])}?</div><p class="text-[12px] text-ink-muted">Bekijk vacatures bij clubs en privéhuizen via Werken bij een seksbedrijf.</p></div>
      <i class="fa fa-angle-right text-pd"></i></a>
    {upsell}
   </main>
   <aside class="w-full lg:w-[300px] shrink-0 space-y-3">
    <div class="block"><div class="block-h"><i class="fa fa-clock text-pd mr-1.5"></i>Openingstijden</div><div class="p-4"><table class="w-full text-[13px]">{hrows}</table></div></div>
    <div class="block"><div class="block-h"><i class="fa fa-address-card text-pd mr-1.5"></i>Contact &amp; locatie</div><ul class="p-4 space-y-2 text-[13px]">{addr}</ul></div>
    <div class="block"><div class="block-h">Meer clubs &amp; privéhuizen</div><ul class="p-4 space-y-2 text-[13px]">{olinks}</ul><div class="px-4 pb-4"><a href="seksclubs.html" class="text-[12px] text-pd font-semibold">Alle locaties <i class="fa fa-angle-right"></i></a></div></div>
    <a href="register.html?type=bedrijf" class="adc adc-light flex-col p-4"><div class="text-[14px] font-bold text-[#212529]">Eigen club of privéhuis?</div><p class="text-[12px] text-ink-muted mt-1">Zet je locatie gratis op Paydates met een eigen profiel.</p><span class="adbtn bg-pd text-white py-2 mt-3 text-[12px]">Club aanmelden</span></a>
   </aside>
  </div>
</div>
{FOOTER}
{TAIL}</body>
</html>
'''
  return s

out=[]
open(os.path.join(R,'seksclubs.html'),'w',encoding='utf-8').write(hub());out.append('seksclubs.html')
for c in C:
  open(os.path.join(R,c['slug']+'.html'),'w',encoding='utf-8').write(detail(c));out.append(c['slug']+'.html')
import importlib.util as _iu
_sp=_iu.spec_from_file_location('chp',os.path.join(os.path.dirname(os.path.abspath(__file__)),'clubs_hub_patch.py'));_m=_iu.module_from_spec(_sp);_sp.loader.exec_module(_m);_m.patch(os.path.join(R,'seksclubs.html'))  # dynamische hub uit clubs-data.js
import subprocess as _sp2;_sp2.run(['python3',os.path.join(os.path.dirname(os.path.abspath(__file__)),'club_page.py')],check=True)
print('\n'.join(out))
