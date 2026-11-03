#!/usr/bin/env python3
"""Provincie zichtbaar op stadspagina's + interactieve kaart nederland.html (idempotent).
Bron kaart: CBS-provinciegrenzen/gemeentegrenzen via cartomap.github.io/nl (open data, CC-BY CBS/Kadaster),
lokaal: _build/prov.geojson, _build/gem2025.geojson. Raakt alleen gemarkeerde stukken aan."""
import os,re,json,math,html as H,unicodedata,collections
os.chdir(os.path.dirname(os.path.abspath(__file__)))
R='..'; P=lambda f: os.path.join(R,f); E=H.escape
s=open(P('assets/data.js'),encoding='utf-8').read(); i=s.index('window.PD_DATA=')+15; j=s.rindex(';')
D=json.loads(s[i:j]); CITIES=D['CITIES']
from layout import PROVS
cnt=collections.Counter(json.load(open('_clean.json'))['cnt'])
pid=lambda p: re.sub(r'[^a-z]+','-',p.lower()).strip('-')
key=lambda n: unicodedata.normalize('NFD',n.replace("'s-","")).encode('ascii','ignore').decode().lower()
SEP='<i class="fa fa-angle-right text-[9px] text-ink-soft"></i>'

# ---------- projectie ----------
LAT0=53.62; LON0=3.30; K=210; CL=math.cos(math.radians(52.2))
def pr(lon,lat): return ((lon-LON0)*CL*K, (LAT0-lat)*K)
def polys(g): return g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
def centroid(ring):
  a=cx=cy=0
  for (x1,y1),(x2,y2) in zip(ring,ring[1:]+ring[:1]):
    c=x1*y2-x2*y1; a+=c; cx+=(x1+x2)*c; cy+=(y1+y2)*c
  return (cx/(3*a),cy/(3*a),abs(a/2)) if a else (ring[0][0],ring[0][1],0)
CODE={'PV20':'Groningen','PV21':'Friesland','PV22':'Drenthe','PV23':'Overijssel','PV24':'Flevoland','PV25':'Gelderland','PV26':'Utrecht','PV27':'Noord-Holland','PV28':'Zuid-Holland','PV29':'Zeeland','PV30':'Noord-Brabant','PV31':'Limburg'}
LABEL_FIX={'Noord-Holland':(4.80,52.62),'Zuid-Holland':(4.55,51.98),'Zeeland':(3.80,51.50),'Friesland':(5.80,53.05),'Utrecht':(5.20,52.08),'Flevoland':(5.55,52.52),'Limburg':(5.95,51.30)}
paths=[];labels=[]
for f in json.load(open('prov.geojson'))['features']:
  n=CODE[f['properties']['statcode']]; d=''; best=None
  for poly in polys(f['geometry']):
    for k,ring in enumerate(poly):
      pts=[pr(*p) for p in ring]
      d+='M'+'L'.join(f'{x:.1f},{y:.1f}' for x,y in pts)+'Z'
      if k==0:
        c=centroid(pts)
        if not best or c[2]>best[2]: best=c
  lx,ly=pr(*LABEL_FIX[n]) if n in LABEL_FIX else best[:2]
  paths.append(f'<path class="nl-prov" data-prov="{pid(n)}" d="{d}" tabindex="0" role="button" aria-label="Provincie {E(n)}"><title>{E(n)}</title></path>')
  labels.append(f'<text class="nl-lbl" data-prov="{pid(n)}" x="{lx:.0f}" y="{ly:.0f}">{E(n)}</text>')
xs=[];ys=[]
for m in re.finditer(r'(-?\d+\.\d),(-?\d+\.\d)',''.join(paths)): xs.append(float(m.group(1))); ys.append(float(m.group(2)))
VB=f'{min(xs)-6:.0f} {min(ys)-6:.0f} {max(xs)-min(xs)+12:.0f} {max(ys)-min(ys)+12:.0f}'

# gemeente-centroiden
ALIAS={"Den Haag":"'s-Gravenhage","Den Bosch":"'s-Hertogenbosch","Middelburg":"Middelburg (Z.)","Hengelo":"Hengelo (O.)","Beek":"Beek (L.)","Bergen (Limburg)":"Bergen (L.)","Bergen (Noord-Holland)":"Bergen (NH.)","Laren":"Laren (NH.)","Rijswijk":"Rijswijk (ZH.)","Stein":"Stein (L.)"}
MANUAL={'Spijkenisse':(4.33,51.845),'Drachten':(6.10,53.105)}
GC={}
for f in json.load(open('gem2025.geojson'))['features']:
  best=None
  for poly in polys(f['geometry']):
    c=centroid([pr(*p) for p in poly[0]])
    if not best or c[2]>best[2]: best=c
  GC[f['properties']['statnaam']]=best[:2]
cities=[]
for c in sorted(CITIES,key=lambda c:key(c['n'])):
  xy=pr(*MANUAL[c['n']]) if c['n'] in MANUAL else GC.get(ALIAS.get(c['n'],c['n']))
  assert xy, c['n']
  cities.append({'n':c['n'],'s':c['slug'],'p':pid(c['prov']),'x':round(xy[0],1),'y':round(xy[1],1),'c':cnt.get(c['n'],0)})
provs=[{'n':p,'id':pid(p),'g':sum(1 for c in CITIES if c['prov']==p),'a':sum(cnt.get(c['n'],0) for c in CITIES if c['prov']==p)} for p in PROVS]
SVG=f'<svg id="nlSvg" class="nl-svg" viewBox="{VB}" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Kaart van Nederland met 12 provincies"><g class="nl-provs">{"".join(paths)}</g><g id="nlDots" class="nl-dots"></g><g class="nl-lbls" aria-hidden="true">{"".join(labels)}</g></svg>'
open(P('assets/nl-provincies.svg'),'w',encoding='utf-8').write(SVG.replace(' id="nlSvg"','').replace('<g id="nlDots" class="nl-dots"></g>','').replace('class="nl-prov"','fill="#ece7f6" stroke="#fff" stroke-width="1.2" class="nl-prov"').replace('class="nl-lbl"','font-family="Poppins,sans-serif" font-size="10" text-anchor="middle" fill="#3d2a6b" class="nl-lbl"'))

# ---------- 1) stadspagina's ----------
CR=re.compile(r'<nav class="crumbs flex flex-wrap items-center gap-1\.5">.*?</nav>',re.S)
BADGE=re.compile(r'\s*<div class="mt-1 flex flex-wrap items-center gap-1\.5" data-provbadge>.*?</div>',re.S)
H1=re.compile(r'(<h1 class="text-\[20px\] sm:text-\[22px\][^>]*>Escort [^<]*<span id="count"[^>]*></span></h1>)')
n=0
for c in CITIES:
  fn=P(f'escort-{c["slug"]}.html'); s=open(fn,encoding='utf-8').read(); o=s
  p=c['prov']; q=pid(p)
  s=CR.sub(lambda m:f'<nav class="crumbs flex flex-wrap items-center gap-1.5"><a href="index.html"><i class="fa fa-house"></i></a>{SEP}<a href="locaties.html">Locaties</a>{SEP}<a href="nederland.html#{q}">{E(p)}</a>{SEP}<span class="text-ink">Escort {E(c["n"])}</span></nav>',s,count=1)
  s=BADGE.sub('',s,count=1)
  kind='Gemeente' if c['n'] not in MANUAL else 'Plaats'
  badge=f'\n      <div class="mt-1 flex flex-wrap items-center gap-1.5" data-provbadge><a href="nederland.html#{q}" class="pill px-3 py-1 text-[12px] !text-pd font-semibold"><i class="fa fa-location-dot mr-1"></i>Provincie {E(p)}</a><span class="text-[12px] text-ink-muted">{kind} {E(c["n"])}</span><a href="nederland.html#{q}" class="text-[12px] text-ink-muted hover:text-pd"><i class="fa fa-map mr-1"></i>Bekijk op de kaart</a></div>'
  s,k=H1.subn(lambda m:m.group(1)+badge,s,count=1); assert k==1,fn
  if s!=o: open(fn,'w',encoding='utf-8').write(s); n+=1
print('stadspagina\'s bijgewerkt:',n)

# ---------- 2) locaties.html ----------
s=open(P('locaties.html'),encoding='utf-8').read()
s=re.sub(r'<datalist id="cl">.*?</datalist>','<datalist id="cl">'+''.join(f'<option value="{E(c["n"])} · {E(c["prov"])}">' for c in sorted(CITIES,key=lambda c:key(c['n'])))+'</datalist>',s,count=1,flags=re.S)
JUMP="const v=this.c.value.split(' · ')[0].trim().toLowerCase();"
s=s.replace("const v=this.c.value.trim().toLowerCase();",JUMP)
s=s.replace('Alle 342 gemeenten van Nederland, per provincie. Kies je provincie en plaats.','Alle gemeenten van Nederland, per provincie. Kies je provincie en plaats, of zoek hem op de kaart.')
s=s.replace('placeholder="Typ je stad of gemeente…"','placeholder="Typ je stad of gemeente, bijv. Oldambt…"')
s=re.sub(r'\n?\s*<a href="nederland\.html" class="nl-cta[^"]*".*?</a><!-- /nl-cta -->','',s,flags=re.S)
CTA='\n  <a href="nederland.html" class="nl-cta block mt-4 p-4 flex items-center gap-3 hover:border-pd"><span class="nl-cta-ic"><i class="fa fa-map-location-dot"></i></span><span class="flex-1 min-w-0"><b class="text-[#212529] text-[15px]">Kaart van Nederland</b><span class="nl-cta-sub text-ink-muted text-[13px]">Klik op een provincie en zie alle gemeenten en plaatsen in één overzicht.</span></span><span class="btn btn-pd shrink-0 nl-cta-btn">Open de kaart <i class="fa fa-angle-right"></i></span><i class="fa fa-angle-right text-pd nl-cta-arr"></i></a><!-- /nl-cta -->'
a=s.index('</form>',s.index('<datalist id="cl">'))+len('</form>'); s=s[:a]+CTA+s[a:]
CSS='<style id="nl-cta-css">.nl-cta{text-decoration:none}.nl-cta-ic{width:42px;height:42px;border-radius:10px;background:#7351c017;color:#7351c0;display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0}.nl-cta-sub{display:block}.nl-cta-btn{display:none!important}@media(min-width:640px){.nl-cta-btn{display:inline-flex!important}.nl-cta-arr{display:none}}</style>'
s=re.sub(r'<style id="nl-cta-css">.*?</style>\n?','',s,flags=re.S); s=s.replace('</head>',CSS+'\n</head>',1)
# hot-city pills: subtiele provincie
PROV={c['slug']:c['prov'] for c in CITIES}
def hot(m):
  return f'{m.group(1)}<span class="text-ink-soft text-[11px] ml-1">· {E(PROV[m.group(2)])}</span></a>'
s=re.sub(r'(<a href="escort-([a-z0-9-]+)\.html" class="pill px-4 py-1\.5 text-\[13px\]"><i class="fa fa-fire text-gold mr-1"></i>[^<]*)</a>',hot,s)
# provjump: kaart-pill vooraan
s=s.replace('data-provjump><a href="#prov-noord-holland"','data-provjump><a href="nederland.html" class="pill px-3 py-1 text-[12px] whitespace-nowrap !text-pd font-semibold"><i class="fa fa-map mr-1"></i>Kaart</a><a href="#prov-noord-holland"',1)
s=s.replace('<p class="text-ink-muted text-[13px]">Kies de gemeente waar je dorp of wijk onder valt, gebruik <a href="search.html" class="text-pd font-semibold">uitgebreid zoeken</a> of plaats als eerste een advertentie in jouw plaats.</p>',
            '<p class="text-ink-muted text-[13px]">Kies de gemeente waar je dorp of wijk onder valt, zoek hem op de <a href="nederland.html" class="text-pd font-semibold">kaart van Nederland</a>, gebruik <a href="search.html" class="text-pd font-semibold">uitgebreid zoeken</a> of plaats als eerste een advertentie in jouw plaats.</p>')
open(P('locaties.html'),'w',encoding='utf-8').write(s)

# ---------- 3) nederland.html ----------
T=open(P('locaties.html'),encoding='utf-8').read()
TITLE='Kaart van Nederland – escorts per provincie en gemeente | Paydates.nl'
DESC='Interactieve kaart van Nederland: klik op een provincie en vind escorts, privé ontvangst en erotische massage in elke gemeente.'
T=T.replace('Alle locaties – escorts per provincie en stad | Paydates.nl',TITLE).replace('Overzicht van alle steden op Paydates.nl: escorts, privé ontvangst en erotische massage per provincie.',DESC)
T=T.replace('https://paydates.nl/locaties.html','https://paydates.nl/nederland.html').replace('data-page="locaties"','data-page="nederland"')
T=re.sub(r'<style id="nl-cta-css">.*?</style>\n?','',T,flags=re.S)
data=json.dumps({'provs':provs,'cities':cities},ensure_ascii=False,separators=(',',':'))
pills=''.join(f'<button type="button" class="pill nl-pill px-3 py-1 text-[12px] whitespace-nowrap" data-prov="{q["id"]}">{E(q["n"])}</button>' for q in provs)
dl=''.join(f'<option value="{E(c["n"])} · {E(c["prov"])}">' for c in sorted(CITIES,key=lambda c:key(c['n'])))
MAIN=f'''<div class="max-w-[1400px] mx-auto px-3 lg:px-6 py-5">
  <nav class="crumbs flex flex-wrap items-center gap-1.5"><a href="index.html"><i class="fa fa-house"></i></a>{SEP}<a href="locaties.html">Locaties</a>{SEP}<span class="text-ink">Kaart van Nederland</span></nav>
  <h1 class="text-[22px] font-bold text-[#212529] mt-2">Kaart van Nederland</h1>
  <p class="text-ink-muted mt-1 max-w-3xl">Klik op een provincie en zie meteen alle gemeenten en plaatsen met escorts, privé ontvangst en erotische massage. Of typ je woonplaats en spring er direct naartoe.</p>
  <form id="nlSearch" class="mt-4 max-w-md relative" autocomplete="off">
    <i class="fa fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"></i><input id="nlQ" name="c" list="nlList" class="inp !pl-9" placeholder="Zoek een gemeente, bijv. Oldambt…" aria-label="Zoek een gemeente"><datalist id="nlList">{dl}</datalist>
  </form>
  <div class="mt-4 flex gap-1.5 overflow-x-auto scrollbar-none pb-1" id="nlPills" role="tablist" aria-label="Provincies">{pills}</div>
  <div class="nl-wrap mt-3">
    <div class="block nl-mapbox"><div class="nl-maphint text-[12px] text-ink-muted"><i class="fa fa-hand-pointer mr-1 text-pd"></i>Tik of klik op een provincie</div>{SVG}<div id="nlTip" class="nl-tip" hidden></div></div>
    <aside id="nlPanel" class="block nl-panel" aria-live="polite"></aside>
  </div>
  <div class="block p-5 mt-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"><div><b class="text-[#212529]">Liever een lijst?</b><p class="text-ink-muted text-[13px]">Bekijk <a href="locaties.html" class="text-pd font-semibold">alle locaties per provincie</a>, of gebruik <a href="search.html" class="text-pd font-semibold">uitgebreid zoeken</a>. Woon je in een dorp? Kies de gemeente waar het onder valt.</p></div><a href="adverteren.html" class="btn btn-pd shrink-0"><i class="fa fa-plus"></i> Plaats advertentie</a></div>
</div>
<script id="nlData" type="application/json">{data}</script>
'''
a=T.index('<div class="max-w-[1400px] mx-auto px-3 lg:px-6 py-5">'); b=T.index('<!-- FOOTER -->')
T=T[:a]+MAIN+T[b:]
T=T.replace('<script src="assets/app.js"></script>','<script src="assets/app.js"></script>\n<script src="assets/nlmap.js"></script>',1)
T=T.replace('<link rel="stylesheet" href="assets/tailwind.css">','<link rel="stylesheet" href="assets/tailwind.css">\n<link rel="stylesheet" href="assets/nlmap.css">',1)
open(P('nederland.html'),'w',encoding='utf-8').write(T)

# ---------- 4) footer Ontdekken + sitemap ----------
import glob
LI='<li><a href="nederland.html" class="hover:text-pd">Kaart van Nederland</a></li>'
k=0
for f in glob.glob(P('*.html')):
  s=open(f,encoding='utf-8').read()
  if LI in s or '<div class="font-semibold mb-3 text-[#212529]">Ontdekken</div>' not in s: continue
  a='<li><a href="nieuws.html" class="hover:text-pd">Nieuws</a></li>'
  if a in s: s=s.replace(a,a+LI,1); open(f,'w',encoding='utf-8').write(s); k+=1
print('footer-link toegevoegd:',k)
sm=open(P('sitemap.xml'),encoding='utf-8').read()
if 'paydates.nl/nederland.html<' not in sm:
  line='  <url><loc>https://paydates.nl/nederland.html</loc><lastmod>2026-11-02</lastmod></url>\n'
  locs=[m.start() for m in re.finditer(r'  <url><loc>https://paydates.nl/([^<]*)</loc>',sm) if re.match(r'  <url><loc>https://paydates.nl/([^<]*)',sm[m.start():]).group(1)>'nederland.html']; a=locs[0] if locs else sm.index('</urlset>'); sm=sm[:a]+line+sm[a:]
  open(P('sitemap.xml'),'w',encoding='utf-8').write(sm)
print('nederland.html klaar ·',len(cities),'plaatsen · viewBox',VB)
