import json
from layout import *
built=[]
NOTE=''
CNOTE='<p class="text-[11px] text-ink-muted mt-3"><i class="fa fa-flask mr-1"></i>Concept-versie: dit formulier is nog niet gekoppeld aan de backend.</p>'
def okbox(t,s): return f'<div data-ok class="hidden text-center py-6"><div class="w-14 h-14 mx-auto rounded-full bg-[#2f9e4420] text-[#2f9e44] flex items-center justify-center text-2xl"><i class="fa fa-check"></i></div><h2 class="text-[18px] font-bold text-[#212529] mt-3">{t}</h2><p class="text-ink-muted mt-1">{s}</p><a href="index.html" class="btn btn-ghost mt-4">Naar de homepage</a></div>'
def authwrap(inner,side):
  return f'''<div class="max-w-[1000px] mx-auto px-3 lg:px-6 py-8">
 <div class="block overflow-hidden grid md:grid-cols-5">
  <div class="md:col-span-3 p-5 sm:p-8">{inner}</div>
  <div class="md:col-span-2 hero-bg text-white p-6 sm:p-8 flex flex-col">{side}</div>
 </div></div>'''
SIDE='''<img src="img/header-logo.png" alt="" class="h-10 w-auto brightness-0 invert"><h2 class="text-[20px] font-bold mt-4 leading-snug">Hét paydate-platform van Nederland: betaald daten, discreet geregeld</h2>
<ul class="mt-4 space-y-2.5 text-[13px] text-white/90"><li><i class="fa fa-check mr-2 text-gold"></i>Bewaar favorieten &amp; zoekopdrachten</li><li><i class="fa fa-check mr-2 text-gold"></i>Chat in de Paydates Chat</li><li><i class="fa fa-check mr-2 text-gold"></i>Adverteer en boost met credits</li><li><i class="fa fa-check mr-2 text-gold"></i>100% discreet: jouw gegevens blijven privé en jij bepaalt wat anderen van je zien</li></ul>
<div class="mt-auto pt-6 text-[11px] text-white/70">Alleen voor volwassenen (18+). Adverteerders 21+.</div>'''
# login
inner=f'''<h1 class="text-[22px] font-bold text-[#212529]">Inloggen</h1><p class="text-ink-muted">Welkom terug bij Paydates.nl</p>
<form data-pd-form class="mt-5 space-y-3.5"><div data-hide-on-ok class="space-y-3.5">
 <div><label class="lbl" for="em">E-mailadres of gebruikersnaam</label><input id="em" required class="inp" autocomplete="username"></div>
 <div><div class="flex justify-between"><label class="lbl" for="pw">Wachtwoord</label><a href="wachtwoord-vergeten.html" class="text-[12px] text-pd">Wachtwoord vergeten?</a></div><input id="pw" type="password" required class="inp" autocomplete="current-password"></div>
 <label class="flex items-center gap-2 text-[13px]"><input type="checkbox"> Ingelogd blijven</label>
 <button class="btn btn-pd w-full"><i class="fa fa-right-to-bracket"></i> Inloggen</button>
 <p class="text-center text-[13px] text-ink-muted">Nog geen account? <a href="register.html" class="text-pd font-semibold">Registreer gratis</a></p>{CNOTE}</div>
 {okbox('Ingelogd (concept)','In de live-versie ga je nu naar je account.')}</form>'''
built.append(page('login.html','Inloggen | Paydates.nl','Log in op je Paydates.nl account.',authwrap(inner,SIDE),'login'))
inner=f'''<h1 class="text-[22px] font-bold text-[#212529]">Wachtwoord vergeten</h1><p class="text-ink-muted">We sturen je een link om een nieuw wachtwoord in te stellen.</p>
<form data-pd-form class="mt-5 space-y-3.5"><div data-hide-on-ok class="space-y-3.5"><div><label class="lbl" for="em">E-mailadres</label><input id="em" type="email" required class="inp"></div><button class="btn btn-pd w-full">Verstuur resetlink</button><p class="text-center text-[13px]"><a href="login.html" class="text-pd">Terug naar inloggen</a></p>{CNOTE}</div>
{okbox('Check je inbox','Als dit adres bij ons bekend is, ontvang je binnen enkele minuten een e-mail.')}</form>'''
built.append(page('wachtwoord-vergeten.html','Wachtwoord vergeten | Paydates.nl','Stel een nieuw wachtwoord in voor je Paydates.nl account.',authwrap(inner,SIDE),'login'))
# register
inner=f'''<h1 class="text-[22px] font-bold text-[#212529]">Account aanmaken</h1><p class="text-ink-muted">Kies wat voor account je wilt.</p>
<div class="grid grid-cols-3 gap-2 mt-4" id="roles">
 <button type="button" data-role="klant" class="role pill !rounded-lg p-3 text-center"><i class="fa fa-user text-xl text-pd"></i><div class="font-bold text-[13px] text-[#212529] mt-1">Klant</div><div class="text-[11px]">Zoeken, chatten, favorieten</div></button>
 <button type="button" data-role="sekswerker" class="role pill !rounded-lg p-3 text-center"><i class="fa fa-star text-xl text-pd"></i><div class="font-bold text-[13px] text-[#212529] mt-1">Sekswerker</div><div class="text-[11px]">Zelfstandig adverteren</div></button>
 <button type="button" data-role="bedrijf" class="role pill !rounded-lg p-3 text-center"><i class="fa fa-building text-xl text-pd"></i><div class="font-bold text-[13px] text-[#212529] mt-1">Bedrijf</div><div class="text-[11px]">Agency, club, salon</div></button>
</div>
<form data-pd-form class="mt-5"><div data-hide-on-ok class="space-y-3.5">
 <div class="grid sm:grid-cols-2 gap-3"><div><label class="lbl">Gebruikersnaam</label><input required class="inp" autocomplete="username"></div><div><label class="lbl">E-mailadres</label><input type="email" required class="inp" autocomplete="email"></div></div>
 <div class="grid sm:grid-cols-2 gap-3"><div><label class="lbl">Wachtwoord</label><input type="password" minlength="8" required class="inp" autocomplete="new-password"></div><div><label class="lbl">Geboortedatum</label><input type="text" required class="inp" inputmode="numeric" placeholder="dd-mm-jjjj" pattern="\\d{{2}}-\\d{{2}}-\\d{{4}}" title="Gebruik dd-mm-jjjj" autocomplete="bday"></div></div>
 <div data-for="sekswerker bedrijf" class="hidden space-y-3">
  <div class="grid sm:grid-cols-2 gap-3"><div><label class="lbl">Geslacht / categorie</label><select class="inp"><option>Vrouw</option><option>Man</option><option>Shemale</option><option>Stel</option></select></div><div><label class="lbl">Werkplaats (stad)</label><input class="inp" list="rc"><datalist id="rc">{''.join(f'<option value="{E(c["n"])}">' for c in CITIES)}</datalist></div></div>
 </div>
 <div data-for="bedrijf" class="hidden space-y-3 rounded-lg border border-line p-3 bg-body-light">
  <div class="text-[12px] font-bold text-pd uppercase tracking-wider">Bedrijfsgegevens</div>
  <div class="grid sm:grid-cols-2 gap-3"><div><label class="lbl">Bedrijfsnaam</label><input class="inp"></div><div><label class="lbl">Type</label><select class="inp"><option>Escortbureau</option><option>Club / privéhuis</option><option>Massagesalon</option><option>Raamexploitatie</option><option>Overig</option></select></div></div>
  <div class="grid sm:grid-cols-2 gap-3"><div><label class="lbl">KvK-nummer</label><input class="inp" inputmode="numeric" pattern="[0-9]{{8}}" placeholder="8 cijfers"></div><div><label class="lbl">Btw-nummer</label><input class="inp" placeholder="NL…B01"></div></div>
 </div>
 <div data-for="sekswerker bedrijf" class="hidden rounded-lg bg-[#7351c010] p-3 text-[12px] text-ink"><i class="fa fa-id-card text-pd mr-1"></i>Adverteerders moeten <b>21 jaar of ouder</b> zijn. Na registratie verifieer je je identiteit; lees <a href="verificatie.html" class="text-pd font-semibold">hoe verificatie werkt</a>.</div>
 <label class="flex items-start gap-2 text-[13px]"><input type="checkbox" required class="mt-1" id="age-agree"> <span id="age-agree-txt">Ik ben 18 jaar of ouder en ga akkoord met de <a href="algemene-voorwaarden.html" class="text-pd">algemene voorwaarden</a> en het <a href="privacy.html" class="text-pd">privacybeleid</a>.</span></label>
 <label class="flex items-start gap-2 text-[13px]"><input type="checkbox" class="mt-1"> <span>Houd me op de hoogte van acties en nieuws (optioneel).</span></label>
 <input type="hidden" name="type" id="rtype"><button class="btn btn-pd w-full"><i class="fa fa-user-plus"></i> Account aanmaken</button>
 <p class="text-center text-[13px] text-ink-muted">Al een account? <a href="login.html" class="text-pd font-semibold">Inloggen</a></p>{NOTE}</div>
 {okbox('Bijna klaar!','We hebben je een bevestigingsmail gestuurd. Klik op de link om je account te activeren.')}</form>'''
sc=r'''<script>(function(){const {$$,qs}=PD;function set(r){$$('.role').forEach(b=>b.classList.toggle('on',b.dataset.role===r));$$('[data-for]').forEach(d=>d.classList.toggle('hidden',!d.dataset.for.split(' ').includes(r)));document.getElementById('rtype').value=r;}
$$('.role').forEach(b=>b.onclick=()=>set(b.dataset.role));const t=qs('type');set(['klant','sekswerker','bedrijf'].includes(t)?t:'klant');})();</script>'''
# register: leeftijdstekst schakelt mee met rol (18+ klant, 21+ adverteerder)
sc+=r"""
<script>
(function(){
  const txt=document.getElementById('age-agree-txt');if(!txt)return;
  const base='en ga akkoord met de <a href="algemene-voorwaarden.html" class="text-pd">algemene voorwaarden</a> en het <a href="privacy.html" class="text-pd">privacybeleid</a>.';
  function setRole(role){const age=(role==='sekswerker'||role==='bedrijf')?'21':'18';txt.innerHTML='Ik ben '+age+' jaar of ouder '+base;}
  document.querySelectorAll('[data-role]').forEach(b=>b.addEventListener('click',()=>setRole(b.getAttribute('data-role'))));
  setRole(new URLSearchParams(location.search).get('type')||'klant');
})();
</script>"""
built.append(page('register.html','Registreren – gratis account | Paydates.nl','Maak gratis een account aan op Paydates.nl als klant, sekswerker of bedrijf.',authwrap(inner,SIDE),'register',sc))
_r=open('../register.html').read().replace('Alle adverteerders zijn 21 jaar of ouder en verklaren','Adverteerders zijn 21 jaar of ouder en verklaren');open('../register.html','w').write(_r)

# credits
BUND=[(100,'10,00',None,''),(250,'22,50','10%',''),(500,'40,00','20%','Populair'),(1000,'70,00','30%','Beste deal')]
cards=''.join(f'''<div class="block p-5 flex flex-col relative {'ring-2 ring-pd' if tag=='Populair' else ''}">{f'<span class="absolute -top-2.5 left-5 text-[10px] font-bold bg-{"pd text-white" if tag=="Populair" else "gold text-[#212529]"} px-2 py-0.5 rounded">{tag}</span>' if tag else ''}
 <div class="text-ink-muted text-[12px]">Bundel</div><div class="text-[28px] font-bold text-[#212529] leading-none mt-1"><i class="fa fa-coins text-gold text-[20px] mr-1"></i>{n}</div><div class="text-[12px] text-ink-muted">credits</div>
 <div class="mt-4 text-[22px] font-bold text-pd">€ {p}</div><div class="text-[11px] text-ink-muted">{'€ '+format(float(p.replace(',','.'))/n*100,'.1f').replace('.',',')+' per 100 credits'}{' · '+d+' voordeel' if d else ''}</div>
 <a href="login.html?next=credits.html" class="btn {'btn-pd' if tag=='Populair' else 'btn-ghost'} mt-5">Kopen</a></div>''' for n,p,d,tag in BUND)
USE=[('fa-circle-arrow-up','Advertentie omhoog (bump)','10','Direct terug bovenaan je categorie en stad'),('fa-arrow-trend-up','TOP-plaatsing','50 / dag','In de TOP-rij op home en categoriepagina'),('fa-crown','VIP','300 / 7 dagen','Gouden kader, bovenaan in je stad, in de stories'),('fa-ticket','Chatpas','50 / 24 uur','Toegang tot drukke chatrooms (vanaf 10 personen)'),('fa-film','Extra video-slots','20 / video','Meer video\'s op je advertentie')]
use=''.join(f'<div class="flex items-start gap-3 py-3 border-b border-line last:border-0"><span class="w-9 h-9 shrink-0 rounded-full bg-[#7351c017] text-pd flex items-center justify-center"><i class="fa {i}"></i></span><div class="flex-1 min-w-0"><div class="font-semibold text-[#212529]">{t}</div><div class="text-[12px] text-ink-muted">{d}</div></div><div class="font-bold text-pd whitespace-nowrap"><i class="fa fa-coins text-gold text-[11px]"></i> {c}</div></div>' for i,t,c,d in USE)
body=f'''<div class="max-w-[1200px] mx-auto px-3 lg:px-6 py-5">
 {crumbs([('Credits',None)])}
 <div class="hero-bg rounded-lg text-white p-6 sm:p-8 mt-3"><div class="text-[11px] font-bold uppercase tracking-wider text-gold"><i class="fa fa-coins mr-1"></i>Credits</div><h1 class="text-[24px] sm:text-[28px] font-bold leading-tight mt-1">Meer zichtbaarheid, meer klanten</h1><p class="text-white/85 mt-2 max-w-2xl">Met credits zet je je advertentie bovenaan, kies je voor TOP of VIP en krijg je toegang tot de drukke chatrooms. Credits verlopen niet.</p></div>
 <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">{cards}</div>
 <div class="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[12px] text-ink-muted"><span class="font-semibold text-ink">Betalen met:</span><span><i class="fa fa-building-columns mr-1 text-pd"></i>iDEAL</span><span><i class="fa fa-credit-card mr-1 text-pd"></i>Bancontact</span><span><i class="fa-brands fa-cc-visa mr-1 text-pd"></i>Creditcard</span><span><i class="fa-brands fa-bitcoin mr-1 text-pd"></i>Crypto</span><span><i class="fa fa-user-secret mr-1 text-pd"></i>Op je afschrift: “Forest Road B.V.”</span></div>
 <div class="grid lg:grid-cols-2 gap-4 mt-6">
  <section class="block" id="chatpas"><div class="block-h">Waar gebruik je credits voor?</div><div class="px-4">{use}</div></section>
  <section class="block"><div class="block-h">Veelgestelde vragen over credits</div><div class="px-4">
   <details class="faq"><summary>Verlopen mijn credits?</summary><p class="pb-4 text-ink-muted">Nee, gekochte credits blijven onbeperkt geldig zolang je account actief is.</p></details>
   <details class="faq"><summary>Kan ik credits terugkrijgen?</summary><p class="pb-4 text-ink-muted">Ongebruikte credits kun je binnen 14 dagen na aankoop laten terugboeken via <a href="contact.html" class="text-pd">support</a>. Gebruikte credits zijn niet restitueerbaar.</p></details>
   <details class="faq"><summary>Krijg ik een factuur?</summary><p class="pb-4 text-ink-muted">Ja. Elke aankoop staat met factuur in <a href="account.html" class="text-pd">je account</a>. Bedrijven kunnen hun KvK- en btw-gegevens toevoegen.</p></details>
   <details class="faq"><summary>Is betalen discreet?</summary><p class="pb-4 text-ink-muted">Ja. Op je bank- of creditcardafschrift staat alleen “Forest Road B.V.”.</p></details>
   <details class="faq"><summary>Kan ik ook via sms of 0900 een chatpas kopen?</summary><p class="pb-4 text-ink-muted">Ja, voor de chatpas zijn ook betaal-sms en een 0900-nummer beschikbaar. Je ziet de opties in de chat zodra een room vol is.</p></details>
  </div></section>
 </div>
</div>'''
built.append(page('credits.html','Credits kopen – boost, TOP & VIP | Paydates.nl','Koop credits op Paydates.nl om je advertentie te boosten, TOP of VIP te worden en toegang te krijgen tot de drukke chatrooms.',body,'credits'))

# adverteren
body=f'''<div class="max-w-[1200px] mx-auto px-3 lg:px-6 py-5" id="top">
 {crumbs([('Adverteren',None)])}
 <div class="hero-bg rounded-lg text-white p-6 sm:p-10 mt-3 grid md:grid-cols-2 gap-6 items-center">
  <div><div class="text-[11px] font-bold uppercase tracking-wider text-gold">Adverteren op Paydates.nl</div><h1 class="text-[26px] sm:text-[32px] font-bold leading-tight mt-1">Bereik dagelijks duizenden klanten in heel Nederland</h1><p class="text-white/85 mt-3">Plaats gratis je advertentie in 2 minuten. Wil je meer opvallen? Boost met credits, kies TOP of word VIP.</p>
  <div class="flex flex-wrap gap-2 mt-5"><a href="register.html?type=sekswerker" class="btn bg-white text-pd hover:bg-pd-lighter"><i class="fa fa-plus"></i> Gratis advertentie plaatsen</a><a href="#vip" class="btn shine">Bekijk VIP</a></div></div>
  <div class="grid grid-cols-3 gap-2 text-center">{''.join(f'<div class="rounded-lg bg-white/10 p-3"><div class="text-[22px] font-bold">{a}</div><div class="text-[11px] text-white/80">{b}</div></div>' for a,b in [('Gratis','basisadvertentie'),('2 min','online'),('21+','adverteerders')])}</div>
 </div>
 <h2 class="text-[18px] font-bold text-[#212529] mt-8 mb-3">Zo werkt het</h2>
 <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{''.join(f'<div class="block p-4"><span class="w-8 h-8 rounded-full bg-pd text-white font-bold flex items-center justify-center">{i}</span><div class="font-semibold text-[#212529] mt-3">{t}</div><p class="text-[12px] text-ink-muted mt-1">{d}</p></div>' for i,(t,d) in enumerate([('Account aanmaken','Registreer gratis als sekswerker of bedrijf.'),('Verifiëren','Bevestig je leeftijd en identiteit. Je krijgt het paarse vinkje.'),('Advertentie maken','Foto\'s, tarieven, mogelijkheden en beschikbaarheid.'),('Boosten','Kies bump, TOP of VIP met credits voor meer bereik.')],1))}</div>
 <h2 class="text-[18px] font-bold text-[#212529] mt-8 mb-3" id="vip">Kies je zichtbaarheid</h2>
 <div class="grid md:grid-cols-3 gap-3">
  <div class="block p-5 flex flex-col"><div class="font-bold text-[16px] text-[#212529]">Basis</div><div class="text-[24px] font-bold text-pd mt-1">Gratis</div><ul class="text-[13px] space-y-2 mt-4"><li><i class="fa fa-check text-pd mr-2"></i>Advertentie met foto's &amp; video</li><li><i class="fa fa-check text-pd mr-2"></i>Vindbaar op stad en categorie</li><li><i class="fa fa-check text-pd mr-2"></i>Bump voor 10 credits</li></ul><a href="register.html?type=sekswerker" class="btn btn-ghost mt-auto pt-2.5 !mt-6">Start gratis</a></div>
  <div class="block p-5 flex flex-col ring-2 ring-pd" id="top-plaatsing"><div class="font-bold text-[16px] text-[#212529] flex items-center gap-2"><span class="text-[10px] font-bold bg-gold text-[#212529] px-2 py-0.5 rounded">TOP</span>TOP-plaatsing</div><div class="text-[24px] font-bold text-pd mt-1"><i class="fa fa-coins text-gold text-[18px]"></i> 50 <span class="text-[13px] text-ink-muted font-semibold">/ dag</span></div><ul class="text-[13px] space-y-2 mt-4"><li><i class="fa fa-check text-pd mr-2"></i>In de TOP-rij op home &amp; categorie</li><li><i class="fa fa-check text-pd mr-2"></i>Voorrang in zoekresultaten</li><li><i class="fa fa-check text-pd mr-2"></i>Per dag aan/uit te zetten</li></ul><a href="credits.html" class="btn btn-pd mt-auto !mt-6">Credits kopen</a></div>
  <div class="adc adc-gold p-5 flex-col"><div class="font-bold text-[16px] flex items-center gap-2"><i class="fa fa-crown text-gold"></i>VIP</div><div class="text-[24px] font-bold text-gold mt-1"><i class="fa fa-coins text-[18px]"></i> 300 <span class="text-[13px] text-white/80 font-semibold">/ 7 dagen</span></div><ul class="text-[13px] space-y-2 mt-4 text-white/90"><li><i class="fa fa-check text-gold mr-2"></i>Gouden VIP-kader</li><li><i class="fa fa-check text-gold mr-2"></i>Bovenaan in jouw stad</li><li><i class="fa fa-check text-gold mr-2"></i>In de stories op de homepage</li><li><i class="fa fa-check text-gold mr-2"></i>Dagelijkse gratis bump</li></ul><a href="credits.html" class="adbtn shine py-2.5 mt-6">Word VIP</a></div>
 </div>
 <div class="grid lg:grid-cols-2 gap-3 mt-8">
  <section class="block p-5" id="banners"><h2 class="text-[16px] font-bold text-[#212529]"><i class="fa fa-rectangle-ad text-pd mr-1"></i>Banners &amp; partners</h2><p class="text-[13px] text-ink-muted mt-1">Adverteer als merk, webshop, cam- of datingplatform op vaste posities.</p>
   <table class="w-full text-[13px] mt-3"><thead><tr class="text-left text-ink-muted text-[12px]"><th class="py-1.5">Positie</th><th>Formaat</th></tr></thead><tbody class="divide-y divide-line">
   <tr><td class="py-2">Leaderboard (alle pagina's)</td><td>970×90 / 320×100</td></tr><tr><td class="py-2">Sidebar sticky</td><td>200×520</td></tr><tr><td class="py-2">Native in de grid</td><td>kaartformaat</td></tr><tr><td class="py-2">Stadspagina's</td><td>exclusief per stad</td></tr></tbody></table>
   <a href="contact.html?onderwerp=banners" class="btn btn-ghost mt-4 !py-2 !text-[13px]">Mediakit aanvragen</a></section>
  <section class="block p-5" id="bedrijf"><h2 class="text-[16px] font-bold text-[#212529]"><i class="fa fa-building text-pd mr-1"></i>Voor agencies, clubs &amp; salons</h2><p class="text-[13px] text-ink-muted mt-1">Eén bedrijfsaccount voor al je profielen, met eigen agency-pagina en gedeelde credits.</p>
   <ul class="text-[13px] space-y-2 mt-3"><li><i class="fa fa-check text-pd mr-2"></i>Onbeperkt profielen beheren</li><li><i class="fa fa-check text-pd mr-2"></i>Vermelding op de <a href="agency.html" class="text-pd">Agency</a>-pagina</li><li><i class="fa fa-check text-pd mr-2"></i>Volumekorting op credits</li><li><i class="fa fa-check text-pd mr-2"></i>Controle op KvK &amp; vergunning</li></ul>
   <a href="register.html?type=bedrijf" class="btn btn-pd mt-4 !py-2 !text-[13px]">Bedrijfsaccount aanmaken</a></section>
 </div>
 <section class="block p-5 mt-3 text-[13px] text-ink-muted"><b class="text-[#212529]">Voorwaarden in het kort:</b> adverteerders zijn minimaal 21 jaar, werken zelfstandig en vrijwillig, en plaatsen alleen eigen, recente foto's. Advertenties worden gecontroleerd voordat ze online komen. Zie de <a href="algemene-voorwaarden.html" class="text-pd">algemene voorwaarden</a> en <a href="verificatie.html" class="text-pd">verificatie</a>.</section>
</div>'''
built.append(page('adverteren.html','Adverteren op Paydates.nl – gratis advertentie, TOP & VIP','Plaats gratis je erotische advertentie op Paydates.nl en boost met TOP of VIP. Ook voor agencies, clubs en bannerpartners.',body,'adverteren'))

# verificatie
body=f'''<div class="max-w-[1000px] mx-auto px-3 lg:px-6 py-5">
 {crumbs([('Verificatie',None)])}
 <h1 class="text-[22px] font-bold text-[#212529] mt-2">Accountverificatie voor adverteerders</h1>
 <p class="text-ink-muted mt-1">Veiligheid voor sekswerkers én klanten. Iedere adverteerder wordt gecontroleerd voordat een advertentie het paarse vinkje krijgt.</p>
 <div class="grid sm:grid-cols-3 gap-3 mt-5">{''.join(f'<div class="block p-4"><i class="fa {i} text-pd text-xl"></i><div class="font-semibold text-[#212529] mt-2">{t}</div><p class="text-[12px] text-ink-muted mt-1">{d}</p></div>' for i,t,d in [('fa-id-card','1. Identiteit','Geldig identiteitsbewijs via een beveiligde verificatiepartner. Paydates slaat geen kopie op.'),('fa-camera','2. Selfie-check','Een live selfie met de code die je in je account ziet, zodat we weten dat de foto\'s van jou zijn.'),('fa-circle-check','3. Goedkeuring','Na handmatige controle krijgt je advertentie het paarse vinkje. Meestal binnen 24 uur.')])}</div>
 <section class="block p-5 sm:p-6 mt-4 prose-pd">
  <h2 style="margin-top:0">Waarom verifiëren?</h2>
  <ul><li>Je bent aantoonbaar <b>21 jaar of ouder</b> (minimumleeftijd voor adverteerders op Paydates.nl).</li><li>Klanten zien dat jouw profiel en foto's echt zijn – geverifieerde advertenties krijgen voorrang in de resultaten.</li><li>We kunnen misbruik van jouw foto's door anderen sneller aanpakken.</li></ul>
  <h2>Voorbereid op nieuwe regels</h2>
  <p>De voorgestelde <i>Wet regulering sekswerk</i> bevat onder meer een registratieplicht voor sekswerkers en een vergunningplicht voor bedrijven. Ons verificatieproces is zo opgezet dat we het registratienummer en (voor bedrijven) het vergunningnummer kunnen vastleggen en controleren zodra dit wettelijk verplicht wordt.</p>
  <h2>Privacy</h2>
  <p>We vragen alleen wat nodig is. Documenten worden bij de verificatiepartner gecontroleerd; wij bewaren alleen de uitkomst (geverifieerd ja/nee, geboortejaar en datum van controle). Lees meer in ons <a href="privacy.html">privacybeleid</a>.</p>
  <h2>Bedrijven</h2>
  <p>Voor agencies, clubs en salons controleren we daarnaast de KvK-inschrijving, het btw-nummer en de gemeentelijke exploitatievergunning.</p>
 </section>
 <div class="flex flex-wrap gap-2 mt-4"><a href="register.html?type=sekswerker" class="btn btn-pd">Account aanmaken</a><a href="account.html#verificatie" class="btn btn-ghost">Ik heb al een account</a></div>
</div>'''
built.append(page('verificatie.html','Accountverificatie voor adverteerders | Paydates.nl','Zo werkt de identiteits- en leeftijdsverificatie voor adverteerders op Paydates.nl.',body,'verificatie'))

# account
body=f'''<div class="max-w-[1200px] mx-auto px-3 lg:px-6 py-5">
 {crumbs([('Mijn account',None)])}
 <div class="block p-4 mt-3 flex items-start gap-3"><i class="fa fa-circle-info text-pd mt-0.5"></i><p class="text-[13px] text-ink-muted"><b class="text-[#212529]">Voorbeeld van het accountoverzicht.</b> Je bent niet ingelogd – <a href="login.html?next=account.html" class="text-pd font-semibold">log in</a> om je eigen gegevens te zien.</p></div>
 <div class="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-4 mt-4">
  <nav class="block p-2 text-[13px] h-max flex lg:flex-col overflow-x-auto scrollbar-none">{''.join(f'<a href="#{a}" class="shrink-0 px-3 py-2 rounded hover:bg-[#7351c017] whitespace-nowrap"><i class="fa {i} w-5 text-pd"></i>{t}</a>' for a,i,t in [('overzicht','fa-gauge','Overzicht'),('advertenties','fa-rectangle-list','Mijn advertenties'),('favorieten','fa-heart','Favorieten'),('credits','fa-coins','Credits &amp; facturen'),('verificatie','fa-id-card','Verificatie'),('instellingen','fa-gear','Instellingen')])}</nav>
  <div class="space-y-4 min-w-0">
   <section id="overzicht" class="grid sm:grid-cols-3 gap-3">{''.join(f'<div class="block p-4"><div class="text-[12px] text-ink-muted">{a}</div><div class="text-[22px] font-bold text-[#212529]">{b}</div></div>' for a,b in [('Creditsaldo','—'),('Actieve advertenties','—'),('Profielweergaven (7 dagen)','—')])}</section>
   <section id="advertenties" class="block"><div class="block-h flex justify-between"><span>Mijn advertenties</span><a href="adverteren.html" class="text-pd">+ Nieuwe advertentie</a></div><div class="p-8 text-center text-ink-muted"><i class="fa fa-rectangle-list text-3xl text-pd-lighter"></i><p class="mt-2">Je hebt nog geen advertenties.</p></div></section>
   <section id="favorieten" class="block"><div class="block-h">Favorieten</div><div id="favs" class="p-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2"></div></section>
   <section id="credits" class="block"><div class="block-h flex justify-between"><span>Credits &amp; facturen</span><a href="credits.html" class="text-pd">Credits kopen</a></div><div class="p-8 text-center text-ink-muted">Nog geen aankopen.</div></section>
   <section id="verificatie" class="block"><div class="block-h">Verificatie</div><div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"><p class="text-[13px] text-ink-muted"><i class="fa fa-circle text-ink-soft mr-1"></i>Status: niet geverifieerd. Verifieer je om het paarse vinkje te krijgen.</p><a href="verificatie.html" class="btn btn-pd !py-2 !text-[13px]">Start verificatie</a></div></section>
   <section id="instellingen" class="block"><div class="block-h">Instellingen</div>
    <form data-pd-form class="p-4 grid sm:grid-cols-2 gap-3"><div data-hide-on-ok class="contents">
     <div><label class="lbl">E-mailadres</label><input type="email" class="inp" required></div><div><label class="lbl">Nieuw wachtwoord</label><input type="password" minlength="8" class="inp"></div>
     <label class="flex items-center gap-2 text-[13px]"><input type="checkbox" checked> E-mail bij nieuwe chatberichten</label><label class="flex items-center gap-2 text-[13px]"><input type="checkbox"> Nieuwsbrief</label>
     <div class="sm:col-span-2 flex flex-wrap gap-2 justify-between"><button class="btn btn-pd !py-2">Opslaan</button><a href="contact.html?onderwerp=account-verwijderen" class="text-[12px] text-[#c92a2a] self-center">Account verwijderen</a></div></div>
     <div data-ok class="hidden sm:col-span-2 text-[#2f9e44] font-semibold"><i class="fa fa-check mr-1"></i>Opgeslagen (concept, niet gekoppeld aan backend).</div></form></section>
  </div>
 </div>
</div>'''
sc=r'''<script>(function(){const f=JSON.parse(localStorage.getItem('pdFav')||'[]');const L=PD.D.L.filter(x=>f.includes(x.id));document.getElementById('favs').innerHTML=L.length?L.map(x=>PD.card(x)).join(''):'<div class="col-span-full p-6 text-center text-ink-muted"><i class="fa fa-heart text-3xl text-pd-lighter"></i><p class="mt-2">Nog geen favorieten. Tik op het hartje bij een advertentie om hem te bewaren.</p></div>';})();</script>'''
built.append(page('account.html','Mijn account | Paydates.nl','Beheer je advertenties, favorieten, credits en instellingen op Paydates.nl.',body,'account',sc))
json.dump(built,open('_built3.json','w'));print(built)
