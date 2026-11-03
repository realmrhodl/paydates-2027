#!/usr/bin/env python3
"""Paydates V2 platform-concept: genereert admin-pagina's, nieuwe publieke pagina's en
patcht bestaande pagina's (idempotent, met markers). Raakt geen data/backends aan."""
import os,re,json,glob,sys
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
sys.path.insert(0,'_build'); from gap_data import GAP, EXTRA_MD
changed=[]
def rd(p): return open(p,encoding='utf-8').read()
def wr(p,s):
    if os.path.exists(p) and rd(p)==s: return
    open(p,'w',encoding='utf-8').write(s); changed.append(p)

# ---------- gap ----------
md=['# Paydates V2 — gap-analyse admin/adverteerdersplatform','',
 'Status van het concept in `/admin` en de nieuwe accountpagina\'s. **Alles draait op demo-data in localStorage**: geen echte SMTP, geen bunq-/PSP-betalingen, geen KYC-API, geen productie-database of -import.','',
 'Legenda status: **in concept** = werkt end-to-end als klikbare demo · **half** = deels · **ontbreekt** = nog niet gebouwd.','']
for p,t in (('P0','Blokkerend voor livegang'),('P1','Kort na livegang'),('P2','Later')):
    md+=[f'## {p} — {t}','','| Onderdeel | Status | Wat is nodig |','|---|---|---|']
    md+=[f'| {a} | {s} | {d} |' for (pp,a,s,d) in GAP if pp==p]; md+=['']
md+=['## Demo-logins (wachtwoord `demo`)','','- admin@demo.paydates.test (admin)','- moderatie@demo.paydates.test (moderator: geen toegang tot BV, betalingen, instellingen)','- adverteerder@demo.paydates.test (adverteerder, 450 credits)','- bedrijf@demo.paydates.test (bedrijf, KYC ingediend)','',
 '## Harde grenzen in dit concept','','- Geen echte e-mail: alles in het mail-log met status "gesimuleerd (niet verzonden)". Massamail vereist het typen van SIMULEER.','- Flags `paymentsLive`, `realEmail`, `kycProvider` en `clubsPublishUnverified` zijn vergrendeld.','- Openingstijden onbekend ⇒ nooit "Nu open". Parenclubs apart.','- Bestaande publieke pagina\'s zijn alleen aangevuld (poll, claim-blok, scripts), niet herschreven.','- Contact altijd via support@paydates.nl (nooit info@).','']
wr('admin/README-GAP.md','\n'.join(md)+EXTRA_MD)
wr('admin/assets/gap.js','/* gegenereerd door _build/platform.py */\nwindow.PDX_GAP='+json.dumps([{'p':p,'t':a,'s':s,'d':d} for (p,a,s,d) in GAP],ensure_ascii=False)+';\n')

# ---------- admin pages ----------
ADMIN={'index':'Dashboard','gebruikers':'Gebruikers','gebruiker':'Gebruiker','advertenties':'Advertenties','kyc':'KYC-wachtrij','email':'E-mail','bv':'BV & eigendom','betalingen':'Betalingen & tarieven','seksclubs':'Seksclubs-beheer','meldingen':'Meldingen','support':'Support','reviews':'Reviews','categorieen':'Categorieën','content':'Content & menu','claims':'Claims','polls':'Community polls','instellingen':'Instellingen','audit':'Auditlog','gap':'Gap-analyse'}
for k,t in ADMIN.items():
    extra='<script src="assets/clubs-inventory.js"></script>\n' if k in('seksclubs','index') else ''
    extra+='<script src="assets/gap.js"></script>\n' if k=='gap' else ''
    wr(f'admin/{k}.html',f'''<!DOCTYPE html>
<html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t} · Admin · Paydates.nl (concept)</title><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#2a1b4f">
<link rel="icon" href="../img/header-logo.png">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="../assets/pdx.css"><link rel="stylesheet" href="assets/admin.css">
</head><body data-page="{k}"><noscript>JavaScript is nodig voor het adminpanel.</noscript>
<script src="../assets/data.js"></script>
{extra}<script src="../assets/pdx.js"></script><script src="../assets/clubs-data.js"></script><script src="../assets/clubs-store.js"></script>
<script src="assets/admin.js"></script><script src="assets/pages-users.js"></script><script src="assets/pages-content.js"></script><script src="assets/pages-biz.js"></script><script src="assets/pages-clubs.js"></script><script src="assets/pages-live.js"></script><script src="assets/boot.js"></script>
</body></html>
''')

# ---------- public shell pages (op basis van login.html) ----------
tpl=rd('login.html').replace('\n<link rel="stylesheet" href="assets/pdx.css">','').replace('\n<script>window.PDX_PAGE="login";</script><script src="assets/pdx.js"></script><script src="assets/pdx-account.js"></script>','')
pre=tpl[:tpl.index('<div class="max-w-[1000px] mx-auto px-3 lg:px-6 py-8">')]
post=tpl[tpl.index('<!-- FOOTER -->'):]
def shell(fn,title,desc,body,page,index=False):
    h=pre.replace('Inloggen | Paydates.nl',title).replace('Log in op je Paydates.nl account.',desc).replace('login.html',fn).replace('data-page="login"',f'data-page="{page}"')
    if not index: h=h.replace('<!-- pd-seo -->','<!-- pd-seo -->\n<meta name="robots" content="noindex,nofollow">',1)
    h=h.replace('<link rel="stylesheet" href="assets/tailwind.css">','<link rel="stylesheet" href="assets/tailwind.css">\n<link rel="stylesheet" href="assets/pdx.css">',1)
    p=post.replace('<script src="assets/app.js"></script>','<script src="assets/app.js"></script>\n'+body[1],1)
    wr(fn,h+body[0]+'\n'+p)
ACC='<script>window.PDX_PAGE="%s";</script><script src="assets/pdx.js"></script><script src="assets/pdx-account.js"></script>'
for fn,title,desc,page in [('dashboard.html','Mijn dashboard | Paydates.nl','Jouw Paydates-dashboard.','dashboard'),
    ('mijn-advertenties.html','Mijn advertenties | Paydates.nl','Beheer je advertenties.','mijn-advertenties'),
    ('advertentie-plaatsen.html','Advertentie plaatsen | Paydates.nl','Plaats een advertentie op Paydates.nl.','advertentie-plaatsen'),
    ('kyc.html','Verificatie (KYC) | Paydates.nl','Verifieer je account.','kyc'),
    ('bedrijf-claimen.html','Bedrijfsprofiel claimen | Paydates.nl','Claim het profiel van je club of privéhuis.','bedrijf-claimen'),
    ('account-instellingen.html','Instellingen | Paydates.nl','Accountinstellingen, wallet en beveiliging.','account-instellingen')]:
    shell(fn,title,desc,('<div class="pdx-wrap" id="pdxRoot"><div class="pdx-card pdx-card-b pdx-muted">Laden…</div></div>',ACC%page),page)
shell('polls.html','Community polls – archief | Paydates.nl','Bekijk de uitslagen van eerdere community polls op Paydates.nl.',
 ('''<div class="pdx-wrap" style="max-width:1000px"><h1 class="pdx-h1">Community polls</h1><p class="pdx-sub">Stem mee op de homepage en bekijk hier de uitslagen van eerdere polls. Anoniem: we slaan geen persoonsgegevens op bij je stem.</p>
<div style="margin:16px 0"><div data-pdx-poll></div></div>
<h2 class="pdx-h1" style="font-size:18px;margin-top:22px">Archief</h2><div data-pdx-poll-archive style="margin-top:10px"></div>
<p class="pdx-xs pdx-muted" style="margin-top:14px">Uitslagen zijn indicatief en niet representatief. Concept: tellingen inclusief startaantallen.</p></div>''',
  '<script src="assets/pdx.js"></script><script src="assets/poll.js"></script>'),'polls',index=True)

# ---------- patches bestaande pagina's ----------
INC_CSS='<link rel="stylesheet" href="assets/pdx.css">'
def add_css(s):
    return s if INC_CSS in s else s.replace('<link rel="stylesheet" href="assets/tailwind.css">','<link rel="stylesheet" href="assets/tailwind.css">\n'+INC_CSS,1)
def add_js(s,js):
    return s if js in s else s.replace('<script src="assets/app.js"></script>','<script src="assets/app.js"></script>\n'+js,1)
# index: poll
s=rd('index.html')
POLL='''<!-- pdx-poll -->
    <section id="community-poll" class="mt-8" aria-label="Community poll"><div data-pdx-poll></div></section>
    <!-- /pdx-poll -->
'''
if '<!-- pdx-poll -->' not in s:
    anchor="    <!-- TRENDING VIDEO'S -->"; assert anchor in s; s=s.replace(anchor,POLL+anchor,1)
s=add_js(add_css(s),'<script src="assets/pdx.js"></script><script src="assets/poll.js"></script>'); wr('index.html',s)
# auth/accountpagina's
for fn,page in [('login.html','login'),('register.html','register'),('wachtwoord-vergeten.html','wachtwoord-vergeten'),('account.html','account')]:
    s=rd(fn); s=add_js(add_css(s),ACC%page)
    if fn=='account.html' and 'id="pdxRoot"' not in s:
        s=s.replace('<!-- FOOTER -->','<div id="pdxRoot" hidden></div>\n<!-- FOOTER -->',1)
    wr(fn,s)
# verificatie: KYC-knoppen naar kyc.html + statuswidget
s=rd('verificatie.html')
if '<!-- pdx-kyc -->' not in s:
    s=add_css(s)
    s=s.replace('<!-- FOOTER -->','''<!-- pdx-kyc --><div class="pdx-wrap" style="max-width:1000px;padding-top:0"><div class="pdx-card pdx-card-b pdx-between" id="pdxKycBox"><div><b>Direct verifiëren?</b><div class="pdx-small pdx-muted">Start de verificatie in je account (concept: stappen worden gesimuleerd).</div></div><a class="pdx-btn pd" href="kyc.html"><i class="fa fa-id-card"></i> Start verificatie</a></div></div>
<script>(function(){try{var s=JSON.parse(localStorage.getItem('pdx_session')||'null'),d=JSON.parse(localStorage.getItem('pdx_v1')||'null');if(!s||!d)return;var u=d.users.find(function(x){return x.id===s.id});if(!u)return;var b=document.getElementById('pdxKycBox');b.querySelector('b').textContent='Jouw status: '+u.kyc;}catch(e){}})();</script><!-- /pdx-kyc -->
<!-- FOOTER -->''',1)
    wr('verificatie.html',s)
# clubpagina's: claim-blok + tracking
for fn in sorted(glob.glob('seksclub-*.html')+glob.glob('privehuis-*.html')):
    s=rd(fn)
    if '<!-- pdx-claim -->' in s: continue
    m=re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S); name=re.sub('<[^>]+>','',m.group(1)).strip() if m else fn
    from urllib.parse import quote
    box=f'''<!-- pdx-claim --><div class="block" style="margin-bottom:16px"><div class="block-h"><i class="fa fa-hand text-pd mr-1.5"></i>Is dit jouw bedrijf?</div><div class="p-4 text-[13px]">Claim dit profiel om gegevens, openingstijden en foto’s zelf te beheren.<div style="margin-top:10px"><a class="btn btn-ghost" href="bedrijf-claimen.html?club={quote(name)}&amp;ref={fn}"><i class="fa fa-hand"></i> Claim dit profiel</a></div></div></div><!-- /pdx-claim -->'''
    anchor='<div class="block"><div class="block-h"><i class="fa fa-address-card'
    if anchor in s: s=s.replace(anchor,box+anchor,1)
    else: s=s.replace('<!-- FOOTER -->',box+'\n<!-- FOOTER -->',1)
    s=add_js(s,'<script src="assets/pdx.js"></script><script>(function(){var p=location.pathname.split("/").pop();PDX.track(p,"view");document.addEventListener("click",function(e){var a=e.target.closest("a[href]");if(!a)return;var h=a.getAttribute("href");if(/^tel:/.test(h))PDX.track(p,"tel");else if(/^https?:/.test(h)&&a.host!==location.host)PDX.track(p,"web");},true);})();</script>')
    wr(fn,s)
# robots
s=rd('robots.txt')
add=[l for l in ['Disallow: /admin/','Disallow: /dashboard.html','Disallow: /mijn-advertenties.html','Disallow: /advertentie-plaatsen.html','Disallow: /kyc.html','Disallow: /bedrijf-claimen.html'] if l not in s]
if add: s=s.replace('\nSitemap:','\n'+'\n'.join(add)+'\n\nSitemap:',1).replace('\n\n\nSitemap','\n\nSitemap'); wr('robots.txt',s)
print('\n'.join(changed) or 'niets gewijzigd'); print(len(changed),'bestanden')
