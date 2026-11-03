#!/usr/bin/env python3
"""SEO/social-meta post-processor (idempotent). Draait na de builders (zie all.sh).
Zet per pagina: canonical, og:url/type/locale/image(+afmetingen/alt), og:video absoluut, twitter:card,
schoont dubbele video-titels en afgekapte descriptions op, en schrijft sitemap.xml + robots.txt.
Basis-URL:  PD_BASE=https://paydates.nl (default)  of  PD_BASE=https://beta.paydates.nl
"""
import os,re,glob,html,datetime
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE=os.environ.get('PD_BASE','https://paydates.nl').rstrip('/')
DEFAULT_IMG='img/og/paydates-default.jpg'; DEFAULT_WH=(1200,630)
SKIP={'_old-dark-concept.html'}
NOCANON={'advertentie.html','search.html'}  # ?id=/?q= pagina's: canonical via JS (advertentie) of geen
NOSITEMAP={'404.html','factuur.html','account.html','login.html','register.html','wachtwoord-vergeten.html','profiel.html','search.html','advertentie.html','blogs.html'}
U=html.unescape; E=lambda s: html.escape(s,quote=True)
def absu(u):
  if not u or re.match(r'https?://',u): return u
  return BASE+'/'+u.lstrip('./')
def meta(s,attr,key):
  m=re.search(r'<meta\s+%s="%s"\s+content="([^"]*)"'%(attr,re.escape(key)),s); return U(m.group(1)) if m else None
def trim(d,n=155):
  d=d.strip()
  if len(d)<=160 and (len(d)<140 or d.endswith(('.','!','?','+',')','…'))): return d
  cut=d[:n]; cut=cut[:cut.rfind(' ')] if ' ' in cut else cut
  return cut.rstrip(' ,;:-–.')+'…'
def imgsize(p):
  try:
    from PIL import Image
    with Image.open(os.path.join(ROOT,p)) as im: return im.size
  except Exception: return None
urls=[]
for path in sorted(glob.glob(os.path.join(ROOT,'*.html'))):
  f=os.path.basename(path)
  if f in SKIP: continue
  s=open(path,encoding='utf-8').read(); o=s
  noindex=bool(re.search(r'<meta name="robots" content="[^"]*noindex',s))
  # titel: "X | Video van Y | Video van Y" -> "X | Paydates.nl"
  t=re.search(r'<title>(.*?)</title>',s,re.S); title=U(t.group(1)).strip() if t else 'Paydates.nl'
  nt=re.sub(r'^(Video van [^|]+?) \| \1 \|',r'\1 |',title)
  if nt!=title:
    title=nt; s=re.sub(r'<title>.*?</title>','<title>%s</title>'%E(title),s,count=1,flags=re.S)
    s=re.sub(r'(<meta property="og:title" content=")[^"]*',lambda m:m.group(1)+E(title),s)
  desc=meta(s,'name','description') or ''
  nd=trim(desc)
  if nd!=desc:
    desc=nd
    s=re.sub(r'(<meta name="description" content=")[^"]*',lambda m:m.group(1)+E(desc),s,count=1)
    s=re.sub(r'(<meta property="og:description" content=")[^"]*',lambda m:m.group(1)+E(desc),s,count=1)
  if 'og:title' not in s and t:  # pagina's buiten layout.head()
    s=s.replace('</title>','</title>\n<meta property="og:title" content="%s"><meta property="og:description" content="%s">'%(E(title),E(desc)),1)
  # bestaande waarden bewaren, dan opnieuw uitschrijven
  canon=re.search(r'<link rel="canonical" href="([^"]*)"',s); canon=canon.group(1) if canon else None
  ogtype=meta(s,'property','og:type'); ogimg=meta(s,'property','og:image'); ogvid=meta(s,'property','og:video')
  s=re.sub(r'\n?<!-- pd-seo -->.*?<!-- /pd-seo -->','',s,flags=re.S)
  s=re.sub(r'<link rel="canonical"[^>]*>\n?','',s)
  s=re.sub(r'<meta\s+(?:property|name)="(?:og:(?:type|url|image[^"]*|video[^"]*|locale)|twitter:[^"]*)"[^>]*>\n?','',s)
  HOST=re.compile(r'^https://(?:beta\.)?paydates\.nl')
  if canon and HOST.match(canon): canon=BASE+HOST.sub('',canon)
  ogimg,ogvid=[HOST.sub('',u).lstrip('/') if u and HOST.match(u) and os.path.exists(os.path.join(ROOT,HOST.sub('',u).lstrip('/'))) else u for u in (ogimg,ogvid)]
  if canon and not canon.startswith('http'): canon=absu(canon)
  if f in NOCANON: canon=None
  elif not canon: canon=None if noindex else (BASE+'/' if f=='index.html' else BASE+'/'+f)
  if not ogtype: ogtype='article' if f.startswith('blog-') else 'website'
  if not ogimg and f.startswith('blog-'):
    m=re.search(r'<img[^>]+src="(img/remote/blog/[^"]+)"',s); ogimg=m.group(1) if m else None
  if ogimg and not re.match(r'https?://',ogimg) and not os.path.exists(os.path.join(ROOT,ogimg)): ogimg=None
  ogimg=ogimg or DEFAULT_IMG
  wh=DEFAULT_WH if ogimg==DEFAULT_IMG else (imgsize(ogimg) if not ogimg.startswith('http') else None)
  L=[]
  if canon: L.append('<link rel="canonical" href="%s">'%E(canon))
  L.append('<meta property="og:type" content="%s"><meta property="og:locale" content="nl_NL">'%ogtype)
  if canon: L.append('<meta property="og:url" content="%s">'%E(canon))
  L.append('<meta property="og:image" content="%s">'%E(absu(ogimg))+('<meta property="og:image:width" content="%d"><meta property="og:image:height" content="%d">'%wh if wh else '')+'<meta property="og:image:alt" content="%s">'%E(title))
  if ogvid: L.append('<meta property="og:video" content="%s">'%E(absu(ogvid)))
  L.append('<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="%s"><meta name="twitter:description" content="%s"><meta name="twitter:image" content="%s">'%(E(title),E(desc),E(absu(ogimg))))
  block='\n<!-- pd-seo -->\n'+'\n'.join(L)+'\n<!-- /pd-seo -->'
  if '<link rel="icon"' in s: s=s.replace('<link rel="icon"',block.lstrip('\n')+'\n<link rel="icon"',1)
  else: s=s.replace('</head>',block+'\n</head>',1)
  if s!=o: open(path,'w',encoding='utf-8').write(s)
  if canon and not noindex and f not in NOSITEMAP: urls.append(canon)
today=datetime.date.today().isoformat()
seen=[];[seen.append(u) for u in urls if u not in seen]
open(os.path.join(ROOT,'sitemap.xml'),'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>%s</loc><lastmod>%s</lastmod></url>\n'%(E(u),today) for u in seen)+'</urlset>\n')
beta='beta.' in BASE
open(os.path.join(ROOT,'robots.txt'),'w').write(('User-agent: *\nDisallow: /\n# beta: niet indexeren (zet ook X-Robots-Tag: noindex of basic-auth)\n' if beta else
 'User-agent: *\nDisallow: /account.html\nDisallow: /login.html\nDisallow: /register.html\nDisallow: /wachtwoord-vergeten.html\nDisallow: /factuur.html\nDisallow: /profiel.html\n\nSitemap: %s/sitemap.xml\n'%BASE))
print('seo_meta: %d urls in sitemap, base %s'%(len(seen),BASE))
