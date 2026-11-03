# Erotische webshops (partnerlinks): footer-strip in alle pagina's + partners.html + link in Meer/drawer. Idempotent.
import glob,os,re,html
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
E=html.escape
PARTNERS=[('EasyToys.nl','Toys &amp; lingerie','https://www.easytoys.nl/','fa-wand-magic-sparkles'),
 ('Erovibes.nl','Lingerie &amp; toys','https://www.erovibes.nl/','fa-heart'),
 ('Christine le Duc','Erotiekwinkel','https://www.christineleduc.nl/','fa-store'),
 ('Mister B','Fetish &amp; gay','https://www.misterb.com/','fa-link'),
 ('Condooms.nl','Willie · condooms','https://www.condooms.nl/','fa-shield-heart')]
APPLY='contact.html?onderwerp=banners&amp;ref=webshop'
def card(n,d,u,ic):
  return (f'<a href="{u}" target="_blank" rel="sponsored noopener" class="pd-pt"><span class="pd-pt-ic"><i class="fa {ic}"></i></span>'
          f'<span class="pd-pt-b"><b>{n}</b><small>{d}</small></span><i class="fa fa-arrow-up-right-from-square pd-pt-x"></i></a>')
APPLY_CARD=f'<a href="{APPLY}" class="pd-pt pd-pt-cta"><span class="pd-pt-ic"><i class="fa fa-plus"></i></span><span class="pd-pt-b"><b>Adverteren?</b><small>Word partner</small></span><i class="fa fa-angle-right pd-pt-x"></i></a>'
STRIP=('<!-- PARTNERS -->\n  <section class="pd-partners border-b border-line"><div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-6">'
 '<div class="pd-partners-hd"><div><h2>Erotische webshops <span>· Discreet verpakt bezorgd</span></h2><p>Partnerlinks · toys, lingerie en condooms voor je volgende date.</p></div>'
 '<a href="partners.html" class="pd-partners-all">Alle partners <i class="fa fa-angle-right"></i></a></div>'
 '<div class="pd-pt-grid">'+''.join(card(*p) for p in PARTNERS)+APPLY_CARD+'</div></div></section>\n  <!-- /PARTNERS -->\n  ')
ANCHOR='<div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-10 grid grid-cols-2 md:grid-cols-6'
MEER_A='<a href="jobs.html" role="menuitem"><i class="fa fa-briefcase"></i>Werken bij een seksbedrijf</a>'
MEER_N='<a href="partners.html" role="menuitem"><i class="fa fa-bag-shopping"></i>Erotische webshops</a>'
DRW_RE=re.compile(r'(<a href="jobs\.html"[^>]*class="(px-3 py-2\.5 rounded[^"]*)"><i class="fa fa-briefcase[^"]*"></i>Werken bij een seksbedrijf</a>)')

def patch(s):
  s=re.sub(r'<!-- PARTNERS -->.*?<!-- /PARTNERS -->\n  ','',s,flags=re.S)
  if ANCHOR in s: s=s.replace(ANCHOR,STRIP+ANCHOR,1)
  if MEER_N not in s: s=s.replace(MEER_A,MEER_A+MEER_N)
  if 'href="partners.html" data-nav="partners"' not in s:
    s=DRW_RE.sub(lambda m:m.group(1)+f'<a href="partners.html" data-nav="partners" class="{m.group(2)}"><i class="fa fa-bag-shopping w-4 mr-2 text-pd text-center"></i>Erotische webshops</a>',s,count=1)
  return s

def big(n,d,u,ic,txt):
  return (f'<a href="{u}" target="_blank" rel="sponsored noopener" class="pd-pt pd-pt-lg"><span class="pd-pt-ic"><i class="fa {ic}"></i></span>'
          f'<span class="pd-pt-b"><b>{n}</b><small>{d}</small><em>{txt}</em></span><span class="btn btn-pd !py-1.5 !text-[12px] shrink-0">Bezoek webshop <i class="fa fa-arrow-up-right-from-square"></i></span></a>')
TXT=['Groot assortiment vibrators, lingerie en condooms. Snel en discreet geleverd.',
 'Lingerie, toys en kostuums — al jaren een vertrouwde Nederlandse webshop.',
 'Erotiekwinkel met fysieke winkels én webshop. Advies en discrete bezorging.',
 'Fetish-, leer- en gaywear plus toys, bekend van de winkels in Amsterdam en Berlijn.',
 'Erotiek, toys en condooms, neutraal verpakt en discreet verzonden.']
def build_page():
  src=open(os.path.join(R,'faq.html'),encoding='utf-8').read()
  i=src.index('<div class="max-w-[1200px] mx-auto px-3 lg:px-6 py-5"><nav class="crumbs');j=src.index('<!-- FOOTER -->')
  head=src[:i];foot=src[j:]
  foot=re.sub(r'<script>document\.getElementById\("fq"\).*?</script>\n?','',foot,flags=re.S)
  head=re.sub(r'<script type="application/ld\+json">.*?</script>\n?','',head,flags=re.S)
  head=re.sub(r'<title>.*?</title>','<title>Erotische webshops – discreet verpakt bezorgd | Paydates.nl</title>',head,flags=re.S)
  d='Partnerlinks van Paydates.nl: erotische webshops voor toys, lingerie en condooms, discreet verpakt bezorgd. EasyToys, Erovibes, Christine le Duc, Mister B en Condooms.nl.'
  head=re.sub(r'(<meta name="description" content=")[^"]*',r'\g<1>'+d,head)
  head=re.sub(r'(<meta property="og:title" content=")[^"]*',r'\g<1>Erotische webshops | Paydates.nl',head)
  head=re.sub(r'(<meta property="og:description" content=")[^"]*',r'\g<1>'+d,head)
  head=re.sub(r'(<link rel="canonical" href="[^"]*/)[^"/]*"',r'\1partners.html"',head)
  head=re.sub(r'data-page="[^"]*"','data-page="partners"',head)
  body=('<div class="max-w-[1200px] mx-auto px-3 lg:px-6 py-5"><nav class="crumbs flex flex-wrap items-center gap-1.5"><a href="index.html"><i class="fa fa-house"></i></a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><span class="text-ink">Erotische webshops</span></nav>\n'
   '<section class="block p-5 sm:p-8 mt-3"><span class="mini !bg-pd">Partnerlinks</span><h1 class="text-[24px] font-bold text-[#212529] mt-2">Erotische webshops <span class="text-pd">· Discreet verpakt bezorgd</span></h1>'
   '<p class="text-ink-muted mt-1">Partnerlinks · toys, lingerie en condooms voor je volgende date. Alle shops leveren in neutrale verpakking.</p>'
   '<div class="grid md:grid-cols-2 gap-3 mt-5">'+''.join(big(*p,t) for p,t in zip(PARTNERS,TXT))+
   f'<a href="{APPLY}" class="pd-pt pd-pt-lg pd-pt-cta"><span class="pd-pt-ic"><i class="fa fa-plus"></i></span><span class="pd-pt-b"><b>Adverteren als webshop?</b><small>Word partner van Paydates</small><em>Bereik dagelijks duizenden bezoekers in heel Nederland. Vertel ons over je shop — we nemen binnen 1 werkdag contact op.</em></span><span class="btn btn-pd !py-1.5 !text-[12px] shrink-0">Aanmelden <i class="fa fa-angle-right"></i></span></a>'
   '</div><p class="text-[11px] text-ink-soft mt-4"><i class="fa fa-circle-info mr-1"></i>Dit zijn partner-/affiliatelinks (rel="sponsored"). Paydates.nl kan een vergoeding ontvangen bij een aankoop; de prijs voor jou blijft gelijk.</p></section><section id="linkpartners" class="block p-5 sm:p-8 mt-3 scroll-mt-24"><span class="mini !bg-pd">Linkpartners</span><h2 class="text-[20px] font-bold text-[#212529] mt-2">Linkpartners</h2><p class="text-ink-muted mt-1">Heb je een erotiek-, dating- of adultsite en wil je linkpartner van Paydates.nl worden? Stuur ons je site en een voorstel voor een wederzijdse vermelding; we reageren binnen 1 werkdag.</p><a href="contact.html?onderwerp=banners&amp;ref=linkpartner" class="btn btn-pd mt-4 inline-flex"><i class="fa fa-link"></i> Linkpartner worden</a></section>\n'
   '</div>\n')
  open(os.path.join(R,'partners.html'),'w',encoding='utf-8').write(patch(head+body+foot))

if __name__=='__main__':
  n=0
  for f in sorted(glob.glob(os.path.join(R,'*.html'))):
    if os.path.basename(f) in {'_old-dark-concept.html','partners.html'}:continue
    s=open(f,encoding='utf-8').read();o=patch(s)
    if o!=s: open(f,'w',encoding='utf-8').write(o);n+=1
  build_page();print('bijgewerkt:',n,'+ partners.html')
