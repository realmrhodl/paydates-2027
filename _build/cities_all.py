#!/usr/bin/env python3
"""Stadspagina's voor ALLE gemeenten (idempotent, raakt alleen stad-specifieke stukken aan).
Nieuwe escort-<slug>.html worden gemaakt vanuit de live escort-drachten.html (dus met de actuele
header/footer/nav), bestaande pagina's krijgen alleen een vernieuwd 'Ook in <provincie>'-blok.
Werkt ook assets/data.js (CITIES/CITYPROV) en het provincie-overzicht in locaties.html bij.
Draai daarna nlmap.py (provincie-badges/kaart), seo_meta.py (canonical/og + sitemap.xml) en linkcheck.py."""
import os,re,json,collections,html as H,unicodedata
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from layout import CITIES,CITYPROV,PROVS
E=H.escape; R='..'
cnt=collections.Counter(json.load(open('_clean.json'))['cnt'])
def P(f): return os.path.join(R,f)

# ---- data.js ----
s=open(P('assets/data.js'),encoding='utf-8').read()
i=s.index('window.PD_DATA=')+len('window.PD_DATA='); j=s.rindex(';')
d=json.loads(s[i:j]); d['CITIES']=CITIES; d['CITYPROV'].update(CITYPROV)
open(P('assets/data.js'),'w',encoding='utf-8').write(s[:i]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[j:])

NEAR=re.compile(r'<div class="mt-4"><div class="text-\[12px\] font-semibold text-\[#212529\] mb-2">Ook in [^<]*</div><div class="flex flex-wrap gap-1\.5">.*?</div></div>',re.S)
def near(c):
  xs=[x for x in CITIES if x['prov']==c['prov'] and x['n']!=c['n']][:12]
  return '<div class="mt-4"><div class="text-[12px] font-semibold text-[#212529] mb-2">Ook in '+E(c['prov'])+'</div><div class="flex flex-wrap gap-1.5">'+''.join(f'<a href="escort-{x["slug"]}.html" class="pill px-3 py-1 text-[12px]">Escort {E(x["n"])}</a>' for x in xs)+'<a href="locaties.html" class="pill px-3 py-1 text-[12px] !text-pd">Alle locaties</a></div></div>'

T=open(P('escort-drachten.html'),encoding='utf-8').read()
assert len(NEAR.findall(T))==1
added=0;updated=0
for c in CITIES:
  fn=P(f'escort-{c["slug"]}.html')
  if os.path.exists(fn):
    s=open(fn,encoding='utf-8').read(); o=s
    s=NEAR.sub(lambda m:near(c),s,count=1)
    if s!=o: open(fn,'w',encoding='utf-8').write(s); updated+=1
    continue
  s=NEAR.sub('@@NEAR@@',T,count=1)
  s=s.replace('window.PD_PRESET={"city": "Drachten", "lockCity": true}','window.PD_PRESET='+json.dumps({'city':c['n'],'lockCity':True},ensure_ascii=False))
  s=s.replace('escort-drachten.html',f'escort-{c["slug"]}.html').replace('Drachten',E(c['n'])).replace('Friesland',E(c['prov'])).replace('nederland.html#friesland','nederland.html#'+re.sub(r'[^a-z]+','-',c['prov'].lower()))
  s=s.replace('@@NEAR@@',near(c))
  open(fn,'w',encoding='utf-8').write(s); added+=1

# ---- locaties.html ----
key=lambda n: unicodedata.normalize('NFD',n.replace("'s-","")).encode('ascii','ignore').decode().lower()
pid=lambda p:'prov-'+re.sub(r'[^a-z]+','-',p.lower())
blocks=''
for p in PROVS:
  cs=sorted([c for c in CITIES if c['prov']==p],key=lambda c:key(c['n']))
  blocks+=f'<div class="block scroll-mt-24" id="{pid(p)}"><div class="block-h flex justify-between"><span>{p} <span class="text-ink-muted font-normal">· {len(cs)}</span></span><span class="text-ink-muted font-normal">{sum(cnt.get(c["n"],0) for c in cs)} advertenties</span></div><ul class="p-2 grid grid-cols-2 gap-x-2 text-[13px]">'+''.join(f'<li><a href="escort-{c["slug"]}.html" class="flex justify-between gap-1 rounded px-2 py-1.5 hover:bg-[#7351c017] hover:text-pd"><span class="min-w-0 truncate">Escort {E(c["n"])}</span><span class="text-[11px] text-ink-soft">{cnt.get(c["n"],0) or ""}</span></a></li>' for c in cs)+'</ul></div>'
GRID='<div class="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">'
jump='<div class="mt-4 flex gap-1.5 overflow-x-auto scrollbar-none pb-1" data-provjump>'+''.join(f'<a href="#{pid(p)}" class="pill px-3 py-1 text-[12px] whitespace-nowrap">{p}</a>' for p in PROVS)+'</div>'
s=open(P('locaties.html'),encoding='utf-8').read()
s=re.sub(r'\n?\s*<div class="mt-4 flex gap-1\.5 overflow-x-auto scrollbar-none pb-1" data-provjump>.*?</div>','',s,flags=re.S)
a=s.index(GRID); b=s.index('<div class="block p-5 mt-5 flex flex-col',a)
s=s[:a]+jump+'\n  '+GRID+blocks+'</div>\n  '+s[b:]
s=re.sub(r'<datalist id="cl">.*?</datalist>','<datalist id="cl">'+''.join(f'<option value="{E(c["n"])} · {E(c["prov"])}">' for c in sorted(CITIES,key=lambda c:key(c['n'])))+'</datalist>',s,count=1,flags=re.S)
s=s.replace('Kies je provincie en stad.','Alle gemeenten van Nederland, per provincie. Kies je provincie en plaats, of zoek hem op de kaart.')
s=s.replace('<b class="text-[#212529]">Staat jouw stad er niet tussen?</b><p class="text-ink-muted text-[13px]">Gebruik','<b class="text-[#212529]">Woonplaats niet gevonden?</b><p class="text-ink-muted text-[13px]">Kies de gemeente waar je dorp of wijk onder valt, gebruik')
s=s.replace('placeholder="Typ je stad…"','placeholder="Typ je stad of gemeente…"')
open(P('locaties.html'),'w',encoding='utf-8').write(s)
print(f'steden: {len(CITIES)} · nieuw: {added} · bijgewerkt (Ook in…): {updated}')
