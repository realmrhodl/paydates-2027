import json,re,datetime
from urllib.parse import quote
from layout import *
built=[]
LG=json.load(open('legal.json'))
EMAIL='<a href="mailto:support@paydates.nl">support@paydates.nl</a>'
for k in ('av','privacy','cookies'): LG[k]=LG[k].replace('<a href="/cdn-cgi/l/email-protection">{{EMAIL}}</a>','{{EMAIL}}').replace('{{EMAIL}}',EMAIL).replace('Herengracht 499A','Herengracht 449A')
B=json.load(open('blogs.json'))
for b in B:
  if b['cat'] in ('Select Category','',None): b['cat']='Algemeen'
  b['cat']=b['cat'][:1].upper()+b['cat'][1:]
MONTHS=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december']
def nld(d): y,m,dd=map(int,d.split('-')); return f'{dd} {MONTHS[m-1]} {y}'
def doc(fn,title,desc,h1,lead,html,active,crumb,aside=''):
  body=f'''<div class="max-w-[1200px] mx-auto px-3 lg:px-6 py-5">
 {crumbs(crumb)}
 <div class="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-4 mt-3">
  <article class="block p-5 sm:p-8 min-w-0"><h1 class="text-[24px] font-bold text-[#212529] leading-tight">{h1}</h1>{f'<p class="text-ink-muted mt-1">{lead}</p>' if lead else ''}<div class="prose-pd mt-4">{html}</div></article>
  <aside class="space-y-3">{aside or LEGALNAV}</aside>
 </div></div>'''
  built.append(page(fn,title,desc,body,active))
LEGALNAV='<nav class="block p-2 text-[13px] lg:sticky lg:top-[70px]"><div class="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Informatie</div>'+''.join(f'<a href="{h}" class="block px-3 py-2 rounded hover:bg-[#7351c017] hover:text-pd">{t}</a>' for h,t in [('algemene-voorwaarden.html','Algemene voorwaarden'),('privacy.html','Privacybeleid'),('cookies.html','Cookiebeleid'),('bedrijfsinformatie.html','Bedrijfsinformatie'),('melden.html','Melden &amp; notice-and-takedown'),('faq.html','Veelgestelde vragen'),('contact.html','Contact')])+'</nav>'

doc('algemene-voorwaarden.html','Algemene voorwaarden | Paydates.nl','Algemene voorwaarden van Paydates.nl, aangeboden door Forest Road B.V.','Algemene voorwaarden','Van toepassing op al het gebruik van Paydates.nl.',re.sub(r'^<p><strong>Algemene voorwaarden Paydates.nl</strong>\s*<br/><br/>','<p>',LG['av']),'legal',[('Algemene voorwaarden',None)])
doc('privacy.html','Privacybeleid | Paydates.nl','Hoe Paydates.nl omgaat met je persoonsgegevens.','Privacybeleid','',LG['privacy'],'legal',[('Privacybeleid',None)])
cookie_extra='''<h2>Welke cookies gebruiken we?</h2><table class="w-full text-[13px]"><thead><tr class="text-left"><th class="py-2 pr-3">Cookie / opslag</th><th class="pr-3">Doel</th><th>Bewaartermijn</th></tr></thead><tbody class="divide-y divide-line">
<tr><td class="py-2 pr-3"><code>pd18</code></td><td class="pr-3">Onthoudt dat je de 18+-melding hebt bevestigd</td><td>Tot je hem wist</td></tr>
<tr><td class="py-2 pr-3"><code>pdFav</code></td><td class="pr-3">Je favoriete advertenties (alleen op dit apparaat)</td><td>Tot je hem wist</td></tr>
<tr><td class="py-2 pr-3">Sessiecookie</td><td class="pr-3">Ingelogd blijven, beveiliging (CSRF)</td><td>Sessie</td></tr>
<tr><td class="py-2 pr-3">Google Analytics</td><td class="pr-3">Anonieme bezoekersstatistieken</td><td>Max. 14 maanden</td></tr></tbody></table>
<p><button type="button" onclick="localStorage.removeItem('pd18');localStorage.removeItem('pdFav');PD.toast('Lokale voorkeuren gewist')" class="btn btn-ghost !no-underline">Wis mijn lokale voorkeuren</button></p>'''
doc('cookies.html','Cookiebeleid | Paydates.nl','Welke cookies Paydates.nl gebruikt en waarom.','Cookiebeleid','',LG['cookies']+cookie_extra,'legal',[('Cookiebeleid',None)])
bi='''<table class="w-full text-[14px]"><tbody class="divide-y divide-line">
<tr><td class="py-2.5 pr-4 text-ink-muted w-48">Handelsnaam</td><td class="font-semibold">Paydates.nl</td></tr>
<tr><td class="py-2.5 pr-4 text-ink-muted">Exploitant</td><td class="font-semibold">Forest Road B.V.</td></tr>
<tr><td class="py-2.5 pr-4 text-ink-muted">Adres</td><td>Herengracht 449A, 1017 BR Amsterdam</td></tr>
<tr><td class="py-2.5 pr-4 text-ink-muted">KvK-nummer</td><td>97957232</td></tr>
<tr><td class="py-2.5 pr-4 text-ink-muted">E-mail</td><td><a href="mailto:support@paydates.nl">support@paydates.nl</a> · <a href="mailto:support@paydates.nl">support@paydates.nl</a></td></tr>
<tr><td class="py-2.5 pr-4 text-ink-muted">Merk</td><td>Paydates<sup>®</sup> is een geregistreerd handelsmerk van Forest Road Capital B.V.</td></tr></tbody></table>
<h2>Wat Paydates.nl is</h2><p>Paydates.nl is een advertentieplatform. Wij bemiddelen niet en zijn geen partij bij afspraken tussen adverteerders en bezoekers. Adverteerders zijn zelf verantwoordelijk voor hun advertentie en hun dienstverlening.</p>
<h2>Melden</h2><p>Zie je een advertentie die niet klopt, of vermoed je mensenhandel, dwang of minderjarigheid? <a href="melden.html">Meld het direct</a>. Bij acuut gevaar bel je 112; anoniem melden kan bij Meld Misdaad Anoniem (0800-7000).</p>'''
doc('bedrijfsinformatie.html','Bedrijfsinformatie – Forest Road B.V. | Paydates.nl','Bedrijfsgegevens van Paydates.nl: exploitant Forest Road B.V., Amsterdam.','Bedrijfsinformatie','',bi,'legal',[('Bedrijfsinformatie',None)])

# FAQ (echte inhoud van live faq)
def fid(q): return re.sub(r'[^a-z0-9]+','-',q.lower()).strip('-')
faqs=LG['faq']
for f in faqs: f[1]=f[1].replace('{{EMAIL}}',EMAIL)
fh=''.join(f'<details class="faq" id="{fid(q)}"><summary>{E(q)}</summary><div class="prose-pd !text-[13px] pb-4">{a}</div></details>' for q,a in faqs)
aside='<div class="block p-4 lg:sticky lg:top-[70px]"><div class="font-semibold text-[#212529]">Staat je vraag er niet bij?</div><p class="text-[12px] text-ink-muted mt-1">Ons supportteam helpt je graag, meestal binnen één werkdag.</p><a href="contact.html" class="btn btn-pd w-full mt-3 !py-2 !text-[13px]">Contact opnemen</a><a href="veilig-daten.html" class="btn btn-ghost w-full mt-2 !py-2 !text-[13px]">Tips voor veilig daten</a></div>'+LEGALNAV
body=f'''<div class="max-w-[1200px] mx-auto px-3 lg:px-6 py-5">{crumbs([('Veelgestelde vragen',None)])}
<div class="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-4 mt-3"><section class="block p-5 sm:p-8"><h1 class="text-[24px] font-bold text-[#212529]">Veelgestelde vragen</h1><p class="text-ink-muted mt-1">Alles over Paydates.nl, credits, veilig daten en hulp bij misstanden.</p>
<input id="fq" type="search" class="inp mt-4" placeholder="Zoek in de veelgestelde vragen…"><div id="faqs" class="mt-2">{fh}</div></section><aside class="space-y-3">{aside}</aside></div></div>'''
sc='<script>document.getElementById("fq").oninput=e=>{const v=e.target.value.toLowerCase();document.querySelectorAll("#faqs details").forEach(d=>{const m=!v||d.textContent.toLowerCase().includes(v);d.style.display=m?"":"none";if(v&&m)d.open=true})};if(location.hash){const d=document.querySelector(location.hash);if(d)d.open=true}</script>'
built.append(page('faq.html','Veelgestelde vragen | Paydates.nl','Antwoorden op veelgestelde vragen over Paydates.nl: credits, veilig daten, misstanden, starten en stoppen met sekswerk en meer.',body,'faq',sc))

# veilig daten – opgebouwd uit echte FAQ-onderdelen
pick=[f for f in faqs if any(k in f[0] for k in ('Veilig daten','Veilige seks','Gedragscode','Ugly Mugs','Opgelicht','dwang','GGD'))]
vd='<div class="grid sm:grid-cols-3 gap-3 not-prose mb-2">'+''.join(f'<div class="rounded-lg border border-line p-4"><i class="fa {i} text-pd text-lg"></i><div class="font-semibold text-[#212529] mt-2 text-[14px]">{t}</div><p class="text-[12px] text-ink-muted mt-1 leading-snug">{d}</p></div>' for i,t,d in [('fa-comments','Spreek vooraf af','Tarief, duur, locatie en grenzen – zwart op wit in de chat.'),('fa-user-shield','Deel je plannen','Laat iemand weten waar je bent en hoe laat je terug bent.'),('fa-hand','Nee is nee','Grenzen van de ander zijn niet onderhandelbaar.')])+'</div>'
vd+=''.join(f'<h2 id="{fid(q)}">{E(q)}</h2>{a}' for q,a in pick)
doc('veilig-daten.html','Veilig daten – tips voor klanten en sekswerkers | Paydates.nl','Tips voor veilig daten, veilige seks, gedragscode voor klanten en hulp bij oplichting of dwang.','Veilig daten','Voor klanten én sekswerkers.',vd,'faq',[('Veilig daten',None)])

# melden / NTD / claim
ntd=next((a for q,a in faqs if 'Notice' in q),'')
claim=next((a for q,a in faqs if 'Claim' in q),'')
dwang=next((a for q,a in faqs if 'dwang' in q),'')
body=f'''<div class="max-w-[1100px] mx-auto px-3 lg:px-6 py-5">{crumbs([('Melden',None)])}
<div class="rounded-lg bg-[#c92a2a] text-white p-4 mt-3 flex items-start gap-3"><i class="fa fa-triangle-exclamation text-lg mt-0.5"></i><p class="text-[13px]"><b>Acuut gevaar?</b> Bel altijd eerst 112. Vermoed je mensenhandel of uitbuiting? Anoniem melden kan via Meld Misdaad Anoniem: 0800-7000.</p></div>
<div class="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-4 mt-4">
<section class="block p-5 sm:p-7"><h1 class="text-[22px] font-bold text-[#212529]">Advertentie of gebruiker melden</h1><p class="text-ink-muted mt-1">Elke melding wordt door een medewerker bekeken, meestal binnen 24 uur.</p>
<form data-pd-form class="mt-4"><div data-hide-on-ok class="space-y-3.5">
 <div><label class="lbl">Reden</label><select class="inp" required><option value="">Kies een reden…</option><option>Vermoeden van minderjarigheid</option><option>Vermoeden van dwang of mensenhandel</option><option>Mijn foto's worden zonder toestemming gebruikt</option><option>Nepprofiel of oplichting</option><option>Onjuiste informatie</option><option>Inbreuk op auteursrecht (notice &amp; takedown)</option><option>Anders</option></select></div>
 <div class="grid sm:grid-cols-2 gap-3"><div><label class="lbl">Advertentie-ID of link</label><input id="adid" class="inp" placeholder="bijv. 353"></div><div><label class="lbl">Je e-mailadres (optioneel)</label><input type="email" class="inp"></div></div>
 <div><label class="lbl">Toelichting</label><textarea required rows="5" class="inp" placeholder="Beschrijf wat je hebt gezien…"></textarea></div>
 <label class="flex items-start gap-2 text-[13px]"><input type="checkbox" class="mt-1"> Anoniem melden – stuur mij geen bevestiging</label>
 <button class="btn btn-pd"><i class="fa fa-flag"></i> Melding versturen</button>
 <p class="text-[11px] text-ink-muted"><i class="fa fa-flask mr-1"></i>Concept-versie: nog niet gekoppeld aan de backend. Live: <a href="mailto:support@paydates.nl" class="text-pd">support@paydates.nl</a></p></div>
 <div data-ok class="hidden py-6 text-center"><i class="fa fa-circle-check text-[#2f9e44] text-3xl"></i><h2 class="font-bold text-[18px] text-[#212529] mt-2">Bedankt voor je melding</h2><p class="text-ink-muted">We bekijken hem zo snel mogelijk.</p></div></form>
<div class="prose-pd mt-8"><h2 id="ntd">Notice &amp; takedown</h2>{ntd}<h2 id="claim">Claim je profiel</h2>{claim}<h2 id="dwang">Slachtoffer van dwang</h2>{dwang}</div></section>
<aside class="space-y-3">{LEGALNAV}</aside></div></div>'''
sc="<script>const i=PD.qs('id');if(i)document.getElementById('adid').value=i;</script>"
built.append(page('melden.html','Melden & notice-and-takedown | Paydates.nl','Meld een advertentie of gebruiker op Paydates.nl, dien een notice-and-takedown in of claim je profiel.',body,'faq',sc))

# contact
body=f'''<div class="max-w-[1100px] mx-auto px-3 lg:px-6 py-5">{crumbs([('Contact',None)])}
<div class="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-4 mt-3">
<section class="block p-5 sm:p-7"><h1 class="text-[22px] font-bold text-[#212529]">Contact</h1><p class="text-ink-muted mt-1">Vragen over je account, credits, adverteren of partnerships? Stuur ons een bericht.</p>
<form data-pd-form class="mt-4"><div data-hide-on-ok class="space-y-3.5">
 <div class="grid sm:grid-cols-2 gap-3"><div><label class="lbl">Naam</label><input required class="inp"></div><div><label class="lbl">E-mailadres</label><input type="email" required class="inp"></div></div>
 <div><label class="lbl">Onderwerp</label><select id="onderwerp" class="inp"><option value="account">Mijn account</option><option value="credits">Credits &amp; betalingen</option><option value="adverteren">Adverteren</option><option value="banners">Banners &amp; partnerships</option><option value="account-verwijderen">Account verwijderen</option><option value="pers">Pers</option><option value="anders">Anders</option></select></div>
 <div><label class="lbl">Bericht</label><textarea required rows="6" class="inp"></textarea></div>
 <button class="btn btn-pd"><i class="fa fa-paper-plane"></i> Versturen</button>
 <p class="text-[11px] text-ink-muted"><i class="fa fa-flask mr-1"></i>Concept-versie: nog niet gekoppeld aan de backend.</p></div>
 <div data-ok class="hidden py-6 text-center"><i class="fa fa-circle-check text-[#2f9e44] text-3xl"></i><h2 class="font-bold text-[18px] text-[#212529] mt-2">Bericht ontvangen</h2><p class="text-ink-muted">We reageren meestal binnen één werkdag.</p></div></form></section>
<aside class="space-y-3"><div class="block p-4 text-[13px] space-y-2"><div class="font-semibold text-[#212529]">Direct mailen</div><div><i class="fa fa-envelope text-pd w-5"></i><a href="mailto:support@paydates.nl" class="hover:text-pd">support@paydates.nl</a></div><div><i class="fa fa-envelope text-pd w-5"></i><a href="mailto:support@paydates.nl" class="hover:text-pd">support@paydates.nl</a></div><div class="pt-2 border-t border-line text-ink-muted text-[12px]">Forest Road B.V.<br>Herengracht 449A, 1017 BR Amsterdam<br>KvK 97957232</div></div>
<div class="block p-4 text-[13px]"><div class="font-semibold text-[#212529]">Iets melden?</div><p class="text-ink-muted text-[12px] mt-1">Gebruik het <a href="melden.html" class="text-pd">meldformulier</a> voor misstanden, misbruik van foto's of notice &amp; takedown.</p></div>{LEGALNAV}</aside></div></div>'''
sc="<script>const o=PD.qs('onderwerp');if(o)document.getElementById('onderwerp').value=o;</script>"
built.append(page('contact.html','Contact | Paydates.nl','Neem contact op met Paydates.nl over je account, credits, adverteren of partnerships.',body,'faq',sc))

# blogs
cats=sorted({b['cat'] for b in B})
def bcard(b,big=False):
  return f'''<a href="blog-{b['slug']}.html" data-cat="{E(b['cat'])}" class="bpost card group block bg-white rounded-lg overflow-hidden shadow-block hover:shadow-pill {'md:col-span-2 md:grid md:grid-cols-2' if big else ''}">
 <div class="relative {'aspect-[16/9] md:aspect-auto md:h-full' if big else 'aspect-[16/9]'} overflow-hidden bg-pd-lighter"><img src="{E(b['img'])}" alt="{E(b['title'])}" loading="lazy" class="ph absolute inset-0 w-full h-full object-cover"><span class="absolute top-2 left-2 mini !text-[10px] !px-2">{E(b['cat'])}</span></div>
 <div class="p-4"><div class="text-[11px] text-ink-muted"><i class="fa fa-calendar mr-1"></i>{nld(b['date'])}</div><h2 class="font-bold text-[#212529] {'text-[20px]' if big else 'text-[15px]'} leading-snug mt-1 group-hover:text-pd">{E(b['title'])}</h2><p class="text-[13px] text-ink-muted mt-2 {'line-clamp-4' if big else 'line-clamp-3'}">{E(b['excerpt'])}</p><span class="inline-block mt-3 text-[12px] font-semibold text-pd">Lees verder <i class="fa fa-angle-right"></i></span></div></a>'''
body=f'''<div class="max-w-[1400px] mx-auto px-3 lg:px-6 py-5">{crumbs([('Blogs',None)])}
<h1 class="text-[24px] font-bold text-[#212529] mt-2">Paydates Blog</h1><p class="text-ink-muted mt-1">Interviews, tips voor klanten en sekswerkers, uitgaan en trends.</p>
<div class="flex gap-1.5 overflow-x-auto scrollbar-none mt-4"><button data-c="" class="bc pill on px-4 py-1.5 text-[12px] whitespace-nowrap">Alles ({len(B)})</button>{''.join(f'<button data-c="{E(c)}" class="bc pill px-4 py-1.5 text-[12px] whitespace-nowrap">{E(c)} ({sum(b["cat"]==c for b in B)})</button>' for c in cats)}</div>
<div id="bgrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">{bcard(B[0],True)}{''.join(bcard(b) for b in B[1:])}</div></div>'''
sc='<script>document.querySelectorAll(".bc").forEach(b=>b.onclick=()=>{document.querySelectorAll(".bc").forEach(x=>x.classList.toggle("on",x===b));document.querySelectorAll(".bpost").forEach(p=>p.style.display=!b.dataset.c||p.dataset.cat===b.dataset.c?"":"none")});</script>'
built.append(page('blogs.html','Blog – interviews, tips en trends | Paydates.nl','De Paydates blog: interviews met sekswerkers en klanten, tips voor veilig daten, uitgaan en de laatste trends.',body,'blogs',sc))
for i,b in enumerate(B):
  rel=[x for x in B if x['cat']==b['cat'] and x is not b][:3]
  rel+= [x for x in B if x not in rel and x is not b][:3-len(rel)]
  h=b['html']
  h=re.sub(r'<img ','<img loading="lazy" ',h)
  body=f'''<div class="max-w-[1200px] mx-auto px-3 lg:px-6 py-5">{crumbs([('Blogs','blogs.html'),(b['title'][:50]+('…' if len(b['title'])>50 else ''),None)])}
<div class="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-4 mt-3">
<article class="block overflow-hidden min-w-0"><img src="{E(b['img'])}" alt="{E(b['title'])}" class="w-full aspect-[16/8] object-cover bg-pd-lighter">
<div class="p-5 sm:p-8"><div class="flex flex-wrap items-center gap-2 text-[12px] text-ink-muted"><span class="mini !text-[10px] !px-2">{E(b['cat'])}</span><span><i class="fa fa-calendar mr-1"></i>{nld(b['date'])}</span><span>· Redactie Paydates</span></div>
<h1 class="text-[24px] sm:text-[28px] font-bold text-[#212529] leading-tight mt-2">{E(b['title'])}</h1>
<div class="prose-pd mt-4">{h}</div>
<div class="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-[13px]"><span class="text-ink-muted">Delen:</span><a href="https://x.com/intent/post?url={quote(b['href'],safe='')}" target="_blank" rel="noopener" class="pill px-3 py-1"><i class="fa-brands fa-x-twitter"></i></a><a href="https://wa.me/?text={quote(b['title']+' '+b['href'],safe='')}" target="_blank" rel="noopener" class="pill px-3 py-1"><i class="fa-brands fa-whatsapp"></i></a><a href="blogs.html" class="ml-auto text-pd font-semibold"><i class="fa fa-angle-left"></i> Alle blogs</a></div></div></article>
<aside class="space-y-3"><a href="https://boef.nl/?ad=paydates.nl" target="_blank" rel="noopener sponsored" class="pd-sponsor" data-ad="boef" aria-label="BOEF.nl – online misdaadspel (advertentie)">
        <img src="img/ads/boef_banner.gif" alt="BOEF.nl – online misdaadspel" width="500" height="146" loading="lazy" class="pd-sponsor-img">
        <div class="pd-sponsor-b"><div class="pd-sponsor-t">Word de grootste boef van Nederland</div>
        <p class="pd-sponsor-p">Bouw je criminele imperium en klim op tot de top van de onderwereld. Gratis online misdaadspel.</p>
        <span class="pd-sponsor-btn"><i class="fa fa-play"></i> Speel gratis</span></div></a>
<a href="banners.html" class="pd-sponsor" data-ad="partner-fill" aria-label="Adverteren op Paydates.nl – jouw merk hier">
        <img src="img/ads/jouw_merk_banner.svg" alt="Jouw merk hier – advertentieruimte" width="500" height="146" loading="lazy" class="pd-sponsor-img">
        <div class="pd-sponsor-b"><div class="pd-sponsor-t">Jouw merk hier?</div>
        <p class="pd-sponsor-p">Bereik dagelijks duizenden bezoekers op Paydates.nl met jouw banner.</p>
        <span class="pd-sponsor-btn"><i class="fa fa-bullhorn"></i> Adverteren</span></div></a><div class="lg:sticky lg:top-[70px] space-y-3">
<a href="adverteren.html" class="adc adc-purple flex-col p-5"><div class="text-[18px] font-bold leading-tight">Zelf adverteren op Paydates.nl?</div><p class="text-[12px] text-white/80 mt-1">Gratis plaatsen, direct zichtbaar in heel Nederland.</p><span class="adbtn shine py-2 mt-4 text-[12px]">Plaats advertentie</span></a>
<div class="block"><div class="block-h">Lees ook</div><div class="p-3 space-y-3">{''.join(f'<a href="blog-{r["slug"]}.html" class="flex gap-3 group"><img src="{E(r["img"])}" alt="" loading="lazy" class="w-20 h-14 rounded object-cover shrink-0 bg-pd-lighter"><span class="min-w-0"><span class="block text-[13px] font-semibold text-[#212529] leading-snug line-clamp-2 group-hover:text-pd">{E(r["title"])}</span><span class="block text-[11px] text-ink-muted mt-0.5">{nld(r["date"])}</span></span></a>' for r in rel)}</div></div>
<a href="chatten.html" class="block p-4 bg-white rounded-lg shadow-block hover:shadow-pill"><i class="fa fa-comments text-pd"></i> <b class="text-[#212529]">Paydates Chat</b><p class="text-[12px] text-ink-muted mt-1">Chat met leden in jouw regio.</p></a>
</div></aside></div></div>'''
  ld=json.dumps({"@context":"https://schema.org","@type":"BlogPosting","headline":b['title'],"datePublished":b['date'],"image":b['img'],"publisher":{"@type":"Organization","name":"Paydates.nl"}},ensure_ascii=False)
  built.append(page(f"blog-{b['slug']}.html",f"{b['title']} | Paydates Blog",(b['meta'] or b['excerpt'])[:155],body,'blogs',extra_head=f'<script type="application/ld+json">{ld}</script>'))

# 404
body='''<div class="max-w-[700px] mx-auto px-3 py-16 text-center"><div class="text-[64px] font-extrabold text-pd leading-none">404</div><h1 class="text-[20px] font-bold text-[#212529] mt-2">Deze pagina bestaat niet (meer)</h1><p class="text-ink-muted mt-1">Misschien is de advertentie offline gehaald. Zoek verder:</p>
<form data-search class="mt-5 flex gap-2 max-w-md mx-auto"><input class="inp" placeholder="Naam, stad of service…"><button class="btn btn-pd">Zoeken</button></form>
<div class="flex flex-wrap justify-center gap-2 mt-5"><a href="index.html" class="pill px-4 py-1.5">Home</a><a href="vrouwen.html" class="pill px-4 py-1.5">Vrouwen</a><a href="locaties.html" class="pill px-4 py-1.5">Locaties</a><a href="blogs.html" class="pill px-4 py-1.5">Blogs</a></div></div>'''
built.append(page('404.html','Pagina niet gevonden | Paydates.nl','Deze pagina bestaat niet.',body,''))
json.dump(built,open('_built4.json','w'));print(len(built))
