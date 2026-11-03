import json,re,html as H
E=H.escape
SEO=[('Amsterdam','Noord-Holland'),('Rotterdam','Zuid-Holland'),('Den Haag','Zuid-Holland'),('Utrecht','Utrecht'),('Eindhoven','Noord-Brabant'),('Groningen','Groningen'),('Tilburg','Noord-Brabant'),('Almere','Flevoland'),('Breda','Noord-Brabant'),('Nijmegen','Gelderland'),('Apeldoorn','Gelderland'),('Haarlem','Noord-Holland'),('Arnhem','Gelderland'),('Enschede','Overijssel'),('Amersfoort','Utrecht'),('Zaanstad','Noord-Holland'),('Den Bosch','Noord-Brabant'),('Haarlemmermeer','Noord-Holland'),('Zwolle','Overijssel'),('Zoetermeer','Zuid-Holland'),('Leiden','Zuid-Holland'),('Maastricht','Limburg'),('Dordrecht','Zuid-Holland'),('Ede','Gelderland'),('Alphen aan den Rijn','Zuid-Holland'),('Alkmaar','Noord-Holland'),('Emmen','Drenthe'),('Westland','Zuid-Holland'),('Delft','Zuid-Holland'),('Venlo','Limburg'),('Deventer','Overijssel'),('Leeuwarden','Friesland'),('Sittard-Geleen','Limburg'),('Helmond','Noord-Brabant'),('Hilversum','Noord-Holland'),('Heerlen','Limburg'),('Oss','Noord-Brabant'),('Amstelveen','Noord-Holland'),('Roosendaal','Noord-Brabant'),('Purmerend','Noord-Holland'),('Schiedam','Zuid-Holland'),('Spijkenisse','Zuid-Holland'),('Lelystad','Flevoland'),('Gouda','Zuid-Holland'),('Hoorn','Noord-Holland'),('Vlaardingen','Zuid-Holland'),('Assen','Drenthe'),('Bergen op Zoom','Noord-Brabant'),('Capelle aan den IJssel','Zuid-Holland'),('Veenendaal','Utrecht'),
 ('Middelburg','Zeeland'),('Vlissingen','Zeeland'),('Goes','Zeeland'),('Schagen','Noord-Holland'),('Aalsmeer','Noord-Holland'),('Zutphen','Gelderland'),('Barneveld','Gelderland'),('Best','Noord-Brabant'),('Leidschendam-Voorburg','Zuid-Holland'),('Hengelo','Overijssel'),('Zeist','Utrecht'),('Drachten','Friesland')]
# + alle overige gemeenten (CBS 2026), achteraan zodat footer/top-lijsten gelijk blijven
from gemeenten import GEMEENTEN as _GEM
SEO=SEO+[(n,p) for n,p,_c in _GEM]
EXTRA_PROV={'Aa en Hunze':'Drenthe','Genk':'België','Bochum':'Duitsland'}
def slug(s):
  import unicodedata
  s=unicodedata.normalize('NFD',s).encode('ascii','ignore').decode().lower()
  return re.sub(r'[^a-z0-9]+','-',s).strip('-')
CITIES=[{'n':n,'slug':slug(n),'prov':p} for n,p in SEO]
CITYPROV={n:p for n,p in SEO}; CITYPROV.update(EXTRA_PROV)
PROVS=['Noord-Holland','Zuid-Holland','Utrecht','Noord-Brabant','Gelderland','Overijssel','Limburg','Flevoland','Groningen','Friesland','Drenthe','Zeeland']

def head(title,desc,extra=''):
  return f'''<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<meta name="theme-color" content="#6849ad">
<meta property="og:site_name" content="Paydates.nl"><meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}">
<link rel="icon" href="img/header-logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="assets/app.css">
<link rel="stylesheet" href="assets/tailwind.css">
{extra}
<script id="pd18-head">(function(){{var ok=0;try{{var v=localStorage.getItem('pd18');if(v==='1'||(v&&Date.now()-(+v)<7776e6))ok=1}}catch(e){{}}if(ok||/(?:^|;\\s*)pd18=1/.test(document.cookie)||/(^|;)pd18(;|$)/.test(window.name)||/[?&]pd18=1(&|$)/.test(location.search)||location.hash==='#noage')document.documentElement.classList.add('pd18ok')}})();</script>
</head>'''

AGEGATE='''<!-- 18+ poort -->
<div id="agegate" class="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-white rounded-lg overflow-hidden shadow-2xl">
    <div class="bg-pd-dark px-5 py-3.5 flex items-center gap-2 text-white">
      <img src="img/header-logo.png" alt="" class="h-6 w-auto">
      <h3 class="font-semibold text-[15px]">Je moet 18 jaar of ouder zijn</h3>
    </div>
    <div class="px-5 py-4 text-[13px] text-ink">
      <p class="text-ink-muted">Paydates.nl bevat erotische advertenties, foto's en video's van sekswerkers van 21 jaar en ouder. Bevestig hieronder om verder te gaan.</p>
      <div class="mt-4 space-y-2.5">
        <label class="flex items-center gap-2"><input type="checkbox" class="agechk w-4 h-4"> Ik ben 18 jaar of ouder</label>
        <label class="flex items-center gap-2"><input type="checkbox" class="agechk w-4 h-4"> Ik ga akkoord met de <a href="algemene-voorwaarden.html" class="text-pd">voorwaarden</a> en <a href="privacy.html" class="text-pd">privacy</a></label>
        <label class="flex items-center gap-2"><input type="checkbox" class="agechk w-4 h-4"> Ik accepteer <a href="cookies.html" class="text-pd">cookies</a></label>
      </div>
    </div>
    <div class="bg-body px-5 py-3 flex justify-end gap-2">
      <a href="https://www.google.nl" class="px-3 py-1.5 rounded text-ink-muted hover:text-ink">Verlaten</a>
      <button id="ageBtn" disabled class="px-4 py-1.5 rounded bg-pd hover:bg-[#5c419a] text-white font-semibold disabled:opacity-50">Doorgaan</button>
    </div>
  </div>
</div>'''

# Navigatie staat in nav.py (gedeeld met apply_nav.py)
import os as _os,sys as _sys
_sys.path.insert(0,_os.path.dirname(_os.path.abspath(__file__)))
from nav import NAV, header

def footer(cities):
  seo=''.join(f'<li><a href="escort-{c["slug"]}.html" class="hover:text-pd">{"Escort" if i%2==0 else "Escorts"} {E(c["n"])}</a></li>' for i,c in enumerate(cities[:50]))
  return f'''<!-- FOOTER -->
<footer class="bg-white border-t border-line mt-8 text-[13px]">
  <section class="border-b border-line bg-body-light">
    <div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-8">
      <div class="flex items-end justify-between gap-3 mb-4">
        <h2 class="text-[15px] font-semibold text-[#212529]">Escorts &amp; paydates per stad</h2>
        <a href="locaties.html" class="text-[12px] text-pd hover:text-pd-darker font-semibold whitespace-nowrap">Alle locaties <i class="fa fa-angle-right"></i></a>
      </div>
      <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-x-4 gap-y-1.5 text-[12px] text-ink-muted">{seo}
        </ul>
    </div>
  </section>
  <div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-10 grid grid-cols-2 md:grid-cols-6 gap-x-6 gap-y-8">
    <div class="col-span-2">
      <a href="index.html" class="flex items-center gap-2"><span class="bg-pd-header rounded p-1"><img src="img/header-logo.png" alt="" class="h-6"></span><span class="text-[18px] font-bold text-pd-header">Paydates</span></a>
      <p class="text-ink-muted text-[12px] mt-3 max-w-sm leading-relaxed">Paydates.nl is hét platform voor erotische advertenties in Nederland. Alle adverteerders zijn 21 jaar of ouder en verklaren zelfstandig en vrijwillig te werken.</p>
      <a href="adverteren.html" class="inline-flex items-center gap-1.5 mt-4 rounded-pill bg-pd text-white font-bold text-[12px] px-4 py-2 hover:bg-[#5c419a]"><i class="fa fa-plus"></i> Plaats een advertentie</a>
      <div class="flex items-center gap-2 mt-4"><a href="https://t.me/paydates_nl" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-pd hover:text-pd-darker" aria-label="Paydates op Telegram"><i class="fa-brands fa-telegram text-[16px]"></i> Telegram</a></div>
    </div>
    <div><div class="font-semibold mb-3 text-[#212529]">Ontdekken</div><ul class="space-y-1.5 text-ink-muted"><li><a href="vrouwen.html" class="hover:text-pd">Vrouwen</a></li><li><a href="mannen.html" class="hover:text-pd">Mannen</a></li><li><a href="shemales.html" class="hover:text-pd">Shemales</a></li><li><a href="stellen.html" class="hover:text-pd">Stellen</a></li><li><a href="agency.html" class="hover:text-pd">Agencies</a></li><li><a href="seksclubs.html" class="hover:text-pd">Seksclubs &amp; Privéhuizen</a></li><li><a href="videos.html" class="hover:text-pd">Video's</a></li><li><a href="chatten.html" class="hover:text-pd">Chatten</a></li><li><a href="blogs.html" class="hover:text-pd">Blogs</a></li><li><a href="gangbangs.html" class="hover:text-pd">Gangbangs &amp; feesten</a></li></ul></div>
    <div><div class="font-semibold mb-3 text-[#212529]">Adverteerders</div><ul class="space-y-1.5 text-ink-muted"><li><a href="adverteren.html" class="hover:text-pd">Adverteren</a></li><li><a href="credits.html" class="hover:text-pd">Credits</a></li><li><a href="adverteren.html#vip" class="hover:text-pd">VIP &amp; TOP</a></li><li><a href="banners.html" class="hover:text-pd">Banners &amp; partners</a></li><li><a href="register.html?type=bedrijf" class="hover:text-pd">Bedrijfsaccount</a></li><li><a href="verificatie.html" class="hover:text-pd">Accountverificatie</a></li><li><a href="account.html" class="hover:text-pd">Mijn account</a></li></ul></div>
    <div><div class="font-semibold mb-3 text-[#212529]">Hulp &amp; info</div><ul class="space-y-1.5 text-ink-muted"><li><a href="faq.html" class="hover:text-pd">Veelgestelde vragen</a></li><li><a href="veilig-daten.html" class="hover:text-pd">Veilig daten</a></li><li><a href="melden.html" class="hover:text-pd">Advertentie melden</a></li><li><a href="contact.html" class="hover:text-pd">Contact</a></li><li><a href="pers.html" class="hover:text-pd">Pers &amp; media</a></li><li><a href="search.html" class="hover:text-pd">Uitgebreid zoeken</a></li><li><a href="woordenboek.html" class="hover:text-pd">Woordenboek</a></li></ul></div>
    <div><div class="font-semibold mb-3 text-[#212529]">Juridisch</div><ul class="space-y-1.5 text-ink-muted"><li><a href="algemene-voorwaarden.html" class="hover:text-pd">Algemene voorwaarden</a></li><li><a href="privacy.html" class="hover:text-pd">Privacybeleid</a></li><li><a href="cookies.html" class="hover:text-pd">Cookiebeleid</a></li><li><a href="melden.html#ntd" class="hover:text-pd">Notice &amp; takedown</a></li><li><a href="bedrijfsinformatie.html" class="hover:text-pd">Bedrijfsinformatie</a></li></ul></div>
  </div>
  <div class="border-t border-line">
    <div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[11px] text-ink-muted">
      <div class="leading-relaxed">© 2026 Paydates.nl · Alle rechten voorbehouden. Paydates.nl wordt geëxploiteerd door <span class="text-ink font-semibold">Forest Road B.V.</span><br>Paydates<sup>®</sup> is een geregistreerd handelsmerk van Forest Road Capital B.V.</div>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1"><span class="inline-flex items-center gap-1 font-bold text-ink"><span class="bg-ink text-white rounded px-1.5 py-0.5 text-[10px]">18+</span> Alleen voor volwassenen · adverteerders 21+</span><a href="algemene-voorwaarden.html" class="hover:text-pd">Voorwaarden</a><a href="privacy.html" class="hover:text-pd">Privacy</a><a href="cookies.html" class="hover:text-pd">Cookies</a></div>
    </div>
  </div>
</footer>'''

def page(fn,title,desc,body,active='',scripts='',extra_head='',search_id='q'):
  html=head(title,desc,extra_head)+f'\n<body class="font-sans antialiased" data-page="{active}">\n'+AGEGATE+'\n'+header(search_id)+'\n'+body+'\n'+footer(CITIES)+'''
<script src="assets/data.js"></script>
<script src="assets/app.js"></script>
'''+scripts+'\n</body>\n</html>\n'
  from partners import patch as _partners  # footer-strip erotische webshops
  html=_partners(html)
  open('../'+fn,'w').write(html)
  return fn

# herbruikbare blokken
def crumbs(items):
  parts=['<a href="index.html"><i class="fa fa-house"></i></a>']
  for t,h in items: parts.append(f'<a href="{h}">{E(t)}</a>' if h else f'<span class="text-ink">{E(t)}</span>')
  return '<nav class="crumbs flex flex-wrap items-center gap-1.5">'+'<i class="fa fa-angle-right text-[9px] text-ink-soft"></i>'.join(parts)+'</nav>'

RAIL='''<aside class="hidden xl:block w-[200px] shrink-0">
    <div class="mb-3"><a href="https://boef.nl/?ad=paydates.nl" target="_blank" rel="noopener sponsored" class="pd-sponsor" style="width:200px" data-ad="boef" aria-label="BOEF.nl – online misdaadspel (advertentie)">
        <img src="img/ads/boef_banner.gif" alt="BOEF.nl – online misdaadspel" width="500" height="146" loading="lazy" class="pd-sponsor-img">
        <div class="pd-sponsor-b"><div class="pd-sponsor-t">Word de grootste boef van Nederland</div>
        <p class="pd-sponsor-p">Bouw je criminele imperium en klim op tot de top van de onderwereld. Gratis online misdaadspel.</p>
        <span class="pd-sponsor-btn"><i class="fa fa-play"></i> Speel gratis</span></div></a></div>
    <div class="mb-3"><a href="banners.html" class="pd-sponsor" style="width:200px" data-ad="partner-fill" aria-label="Adverteren op Paydates.nl – jouw merk hier">
        <img src="img/ads/jouw_merk_banner.svg" alt="Jouw merk hier – advertentieruimte" width="500" height="146" loading="lazy" class="pd-sponsor-img">
        <div class="pd-sponsor-b"><div class="pd-sponsor-t">Jouw merk hier?</div>
        <p class="pd-sponsor-p">Bereik dagelijks duizenden bezoekers op Paydates.nl met jouw banner.</p>
        <span class="pd-sponsor-btn"><i class="fa fa-bullhorn"></i> Adverteren</span></div></a></div>
    <div class="sticky top-[70px] space-y-3">
      <a href="adverteren.html#vip" class="adc adc-gold w-[200px] h-[520px] mx-auto flex-col items-center text-center px-4 pt-8 pb-5">
        <div class="w-14 h-14 rounded-full shine flex items-center justify-center text-[22px] shadow-lg"><i class="fa fa-crown"></i></div>
        <div class="text-[11px] font-bold tracking-[.2em] text-gold mt-4">VIP BOOST</div>
        <div class="text-[22px] font-bold leading-tight mt-1">Bovenaan in jouw stad</div>
        <ul class="text-[12px] text-white/85 mt-4 space-y-2 text-left w-full">
          <li class="flex gap-2"><i class="fa fa-check text-gold mt-0.5"></i>Gouden VIP-kader</li>
          <li class="flex gap-2"><i class="fa fa-check text-gold mt-0.5"></i>Plek in de TOP-rij</li>
          <li class="flex gap-2"><i class="fa fa-check text-gold mt-0.5"></i>Zichtbaar in de stories</li>
          <li class="flex gap-2"><i class="fa fa-check text-gold mt-0.5"></i>Meer profielweergaven</li>
        </ul>
        <div class="mt-auto w-full">
          <div class="rounded-lg border border-gold/60 bg-white/5 p-2 mb-3 text-left flex items-center gap-2"><span class="mini !bg-gold !text-[#212529]">VIP</span><span class="text-[11px] text-white/80">Zo valt jouw advertentie op</span></div>
          <span class="adbtn shine w-full py-2.5 text-[13px]">Boost mijn advertentie</span>
        </div>
      </a>
      <a href="chatten.html" class="adc adc-purple w-[200px] h-[200px] mx-auto flex-col justify-between p-4">
        <div><i class="fa fa-comments text-[26px] text-pd-lighter"></i>
        <div class="text-[17px] font-bold leading-tight mt-2">Paydates Chat</div>
        <p class="text-[12px] text-white/80 mt-1 leading-snug">Chat live met leden in jouw regio.</p></div>
        <span class="adbtn bg-white text-pd py-2 text-[12px]">Naar de chatrooms</span>
      </a>
      <a href="adverteren.html#banners" class="block text-center text-[11px] text-ink-muted hover:text-pd">Adverteren in deze ruimte? <i class="fa fa-angle-right"></i></a>
    </div>
  </aside>'''

LEADER='''<div class="max-w-[1920px] mx-auto px-3 lg:px-6 pt-4">
  <a href="adverteren.html" class="adc adc-purple h-[100px] sm:h-[90px] max-w-[970px] mx-auto items-center gap-3 sm:gap-5 px-4 sm:px-6">
    <img src="img/header-logo.png" alt="" class="hidden sm:block h-12 w-auto drop-shadow">
    <div class="min-w-0 flex-1">
      <div class="text-[15px] sm:text-[20px] font-bold leading-tight">Adverteer op Paydates.nl</div>
      <div class="text-[11px] sm:text-[13px] text-white/80 leading-snug mt-0.5">Jouw advertentie bij duizenden bezoekers per dag. <span class="hidden md:inline">Plaatsen in 2 minuten, direct zichtbaar.</span></div>
    </div>
    <span class="adbtn shine px-3 sm:px-5 py-2 text-[12px] sm:text-[13px] shrink-0">Start nu <i class="fa fa-arrow-right"></i></span>
  </a>
</div>'''

SIDE_AD='''<a href="register.html?type=bedrijf" class="adc adc-light h-[250px] flex-col justify-between p-4">
      <div><div class="w-10 h-10 rounded-full bg-[#7351c017] text-pd flex items-center justify-center"><i class="fa fa-building"></i></div>
      <div class="text-[16px] font-bold text-[#212529] mt-3 leading-tight">Agency of club?</div>
      <p class="text-[12px] text-ink-muted mt-1 leading-snug">Beheer al je profielen vanuit één bedrijfsaccount, met een eigen agency-pagina.</p></div>
      <span class="adbtn bg-pd text-white py-2 text-[12px]">Bedrijfsaccount aanmaken</span>
    </a>'''
