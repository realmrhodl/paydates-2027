# Gedeelde navigatie (header, witte navbalk met Meer-dropdown, mobiel menu, bottom-nav).
# Gebruikt door layout.py en door apply_nav.py (herschrijft de nav in alle live HTML-bestanden).
# URL's blijven gelijk (SEO): alleen labels/volgorde wijzigen. shemales.html blijft een losse SEO-landingspagina.

CHAT_BADGE='<span class="chatOnline ml-1.5 inline-flex items-center gap-1 rounded-full bg-[#2fb344] text-white text-[10px] font-bold px-1.5 py-[2px] leading-none align-middle"><span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span><b class="chatN">50</b>&nbsp;online</span>'

# (data-nav keys, href, label) — volgorde zoals Stefan wil
NAV=[('vrouwen','vrouwen.html','Vrouwen'),('mannen','mannen.html','Mannen'),('trans shemales','trans.html','Trans'),
     ('stellen','stellen.html','Stellen'),('sugardating','sugardating.html','Sugardating'),('agency','agency.html','Agencies'),
     ('videos','videos.html',"Video's"),('chatten','chatten.html','<i class="fa fa-comments mr-1 text-pd"></i>Chatten'+CHAT_BADGE),
     ('nieuws','nieuws.html','Nieuws')]

# Meer: Jobs + informatieve pagina's
MEER=[('Informatie',[('seksclubs.html','fa-building','Seksclubs &amp; Privéhuizen'),('jobs.html','fa-briefcase','Werken bij een seksbedrijf'),('partners.html','fa-bag-shopping','Erotische webshops'),('online.html','fa-users','Gebruikers online'),('woordenboek.html','fa-book','Woordenboek'),
        ('faq.html','fa-circle-question','Veelgestelde vragen'),('veilig-daten.html','fa-shield-heart','Veilig daten'),('pers.html','fa-newspaper','Pers &amp; media'),('gangbangs.html','fa-champagne-glasses','Gangbangs &amp; feesten'),('contact.html','fa-envelope','Contact')]),
      ('Adverteerders',[('adverteren.html','fa-rectangle-ad','Adverteren &amp; tarieven'),('credits.html','fa-coins','Credits kopen'),
        ('verificatie.html','fa-circle-check','Accountverificatie'),('banners.html','fa-handshake','Banners &amp; partners')])]

DRW='px-3 py-2.5 rounded hover:bg-[#7351c017] [&.active]:text-pd [&.active]:bg-[#7351c017]'

def _meer_panel():
  cols=''.join(f'<div><div class="pd-more-h">{h}</div>'+''.join(f'<a href="{u}" role="menuitem"><i class="fa {ic}"></i>{t}</a>' for u,ic,t in items)+'</div>' for h,items in MEER)
  return f'<div class="pd-more-panel hidden" data-more-panel role="menu"><div class="pd-more-grid">{cols}</div></div>'

def _drawer_meer():
  return ''.join(f'<div class="px-3 pt-4 pb-1 text-[10.5px] font-bold uppercase tracking-[.12em] text-ink-soft">{h}</div>'+''.join(f'<a href="{u}" class="{DRW}"><i class="fa {ic} w-4 mr-2 text-pd text-center"></i>{t}</a>' for u,ic,t in items) for h,items in MEER)

def header(search_id='q'):
  navlinks=''.join(f'<a href="{h}" data-nav="{k}" class="navlink">{t}</a>' for k,h,t in NAV)
  drawerlinks=''.join(f'<a href="{h}" data-nav="{k}" class="{DRW}">{t}</a>' for k,h,t in NAV)
  return f'''<!-- HEADER -->
<header class="sticky top-0 z-40 bg-pd-header text-white">
  <div class="max-w-[1920px] mx-auto px-3 lg:px-6 h-14 flex items-center gap-3 lg:gap-5">
    <a href="index.html" class="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0" aria-label="Paydates – naar de homepage">
      <img src="img/header-logo.png" alt="Paydates" class="h-7 sm:h-8 w-auto">
      <span class="text-[17px] sm:text-[19px] font-bold tracking-tight">Paydates</span>
    </a>
    <form data-search class="hidden md:block flex-1 max-w-[520px] relative" role="search">
      <i class="fa fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-pd-dark/70 text-xs"></i>
      <input id="{search_id}" name="q" placeholder="Zoeken op naam, stad of service…" class="w-full rounded bg-white/75 focus:bg-white text-ink placeholder-pd-dark/60 pl-8 pr-3 py-1.5 text-[13px] outline-none">
    </form>
    <nav class="ml-auto flex items-center gap-0.5 sm:gap-1 lg:gap-2 text-[10px] sm:text-[11px] font-semibold" aria-label="Account">
      <a href="credits.html" class="hidden sm:flex flex-col items-center px-2 py-1 rounded hover:bg-white/10"><i class="fa fa-coins text-[14px] mb-0.5 text-gold"></i>Credits kopen</a>
      <a href="login.html" class="flex flex-col items-center px-1.5 sm:px-2 py-1 rounded hover:bg-white/10"><i class="fa fa-right-to-bracket text-[14px] mb-0.5"></i>Inloggen</a>
      <a href="register.html" class="flex flex-col items-center px-1.5 sm:px-2 py-1 rounded hover:bg-white/10"><i class="fa fa-user-plus text-[14px] mb-0.5"></i><span class="hidden min-[400px]:inline">Registreren</span><span class="min-[400px]:hidden">Aanmelden</span></a>
      <a href="adverteren.html" class="pd-cta hidden md:inline-flex ml-1 lg:ml-2"><span class="pd-cta-ic"><i class="fa fa-plus"></i></span>Advertentie plaatsen</a>
    </nav>
  </div>
  <form data-search id="mSearch" class="md:hidden hidden px-3 pb-2.5" role="search">
    <div class="flex gap-2"><div class="relative flex-1"><i class="fa fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-pd-dark/70 text-xs"></i>
    <input id="{search_id}2" type="search" name="q" placeholder="Zoeken op naam, stad of service…" class="w-full rounded bg-white text-ink placeholder-pd-dark/60 pl-8 pr-3 py-2 text-[14px] outline-none"></div>
    <button type="button" data-open-search class="shrink-0 rounded bg-white/15 hover:bg-white/25 px-3 text-[12px] font-semibold"><i class="fa fa-sliders mr-1"></i>Filters</button></div>
  </form>
</header>
<!-- WITTE NAVBALK -->
<div class="bg-white border-b border-line relative z-30 after:content-[''] after:absolute after:right-0 after:top-0 after:h-full after:w-8 after:bg-gradient-to-l after:from-white after:pointer-events-none lg:after:hidden">
  <nav aria-label="Hoofdmenu" class="max-w-[1920px] mx-auto px-3 lg:px-6 flex items-center text-[13px] overflow-x-auto scrollbar-none whitespace-nowrap">
    {navlinks}<div class="pd-more" data-more><button type="button" class="navlink pd-more-btn inline-flex items-center gap-1" aria-haspopup="true" aria-expanded="false" data-more-btn>Meer <i class="fa fa-angle-down text-[10px] transition"></i></button>{_meer_panel()}</div>
    <div class="ml-auto hidden xl:flex items-center gap-4 text-[12px] text-ink-muted pl-4">
      <span><i class="fa fa-circle-check text-pd mr-1"></i>Alle adverteerders 21+</span>
    </div>
  </nav>
</div>
<!-- MOBIEL MENU -->
<div id="pdDrawer" class="hidden fixed inset-0 z-[60] lg:hidden">
  <div class="absolute inset-0 bg-black/50" data-close-drawer></div>
  <div class="absolute left-0 top-0 bottom-0 w-[84%] max-w-[340px] bg-white overflow-y-auto">
    <div class="flex justify-between items-center px-4 h-14 bg-pd-header text-white"><a href="index.html" class="flex items-center gap-2"><img src="img/header-logo.png" alt="" class="h-6"><b class="text-[16px]">Paydates</b></a><button data-close-drawer class="w-9 h-9 text-2xl leading-none" aria-label="Sluiten">×</button></div>
    <nav class="p-3 grid gap-0.5 text-[14px]" aria-label="Menu">
      {drawerlinks}
      <a href="search.html" class="px-3 py-2.5 rounded hover:bg-[#7351c017]"><i class="fa fa-sliders mr-1.5 text-pd"></i>Uitgebreid zoeken</a>
      <a href="locaties.html" class="px-3 py-2.5 rounded hover:bg-[#7351c017]"><i class="fa fa-location-dot mr-1.5 text-pd"></i>Alle locaties</a>
      <a href="nederland.html" class="px-3 py-2.5 rounded hover:bg-[#7351c017]"><i class="fa fa-map mr-1.5 text-pd"></i>Kaart van Nederland</a>
      {_drawer_meer()}
    </nav>
    <div class="p-4 border-t border-line grid gap-2">
      <a href="adverteren.html" class="btn btn-pd"><i class="fa fa-plus"></i> Advertentie plaatsen</a>
      <div class="grid grid-cols-2 gap-2"><a href="login.html" class="btn btn-ghost">Inloggen</a><a href="register.html" class="btn btn-ghost">Registreren</a></div>
    </div>
  </div>
</div>
'''+BOTTOM

BOTTOM='''<!-- MOBIELE BOTTOM-NAV -->
<nav id="pdBottomNav" class="pd-bnav" aria-label="Snelmenu">
  <a href="index.html" data-nav="index" class="pd-bnav-i"><i class="fa fa-house"></i><span>Home</span></a>
  <button type="button" data-bnav-search class="pd-bnav-i"><i class="fa fa-magnifying-glass"></i><span>Zoeken</span></button>
  <a href="adverteren.html" data-nav="adverteren" class="pd-bnav-i pd-bnav-cta" aria-label="Advertentie plaatsen"><span class="pd-bnav-plus"><i class="fa fa-plus"></i></span><span>Plaatsen</span></a>
  <a href="chatten.html" data-nav="chatten" class="pd-bnav-i"><i class="fa fa-comments"></i><span>Chat</span><b class="pd-bnav-badge chatN" title="online in de chat">50</b></a>
  <button type="button" data-open-drawer class="pd-bnav-i" aria-label="Menu openen"><i class="fa fa-bars"></i><span>Menu</span></button>
</nav>'''
