# Bouwt assets/clubs-data.js: ÉÉN bron voor seksclubs/privéhuizen (admin-beheer + publieke site).
# Bron: _research/seksclubs/inventory.json (research 2026-11-02) + de bestaande statische profielen.
# Publicatiestatus standaard: research "actief" -> gepubliceerd · "onbekend" -> concept · "mogelijk_gesloten" -> gearchiveerd.
# Admin (admin/seksclubs.html) kan alles aanpassen; wijzigingen staan in localStorage (pdx_clubs_v1) en
# worden via assets/clubs-store.js over deze basis heen gelegd. Export in admin levert een nieuwe basis op.
import os,re,json,unicodedata
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
INV=json.load(open(os.path.join(R,'_research/seksclubs/inventory.json'),encoding='utf-8'))

def slug(s):
  s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
  return re.sub(r'[^a-z0-9]+','-',s).strip('-')

DAYMAP={'Mon':0,'Tue':1,'Wed':2,'Thu':3,'Fri':4,'Sat':5,'Sun':6}
def hours(raw):
  if not raw or raw=='onbekend' or not isinstance(raw,str): return None
  H=[None]*7;ok=False
  for part in raw.split(';'):
    m=re.match(r'\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})',part)
    if m and H[DAYMAP[m.group(1)]] is None:
      H[DAYMAP[m.group(1)]]=[m.group(2).zfill(5),m.group(3).zfill(5)];ok=True
  return H if ok else None

TYPE={'seksclub':'Seksclub','privehuis':'Privéhuis','parenclub':'Parenclub','overig_onbekend':'Club'}
PUB={'actief':'gepubliceerd','onbekend':'concept','mogelijk_gesloten':'gearchiveerd'}
def web(u):
  if not u: return None
  return u if u.startswith('http') else 'https://'+u

V=[];seen=set()
for x in INV['venues']:
  t=TYPE.get(x['type'],'Club')
  if x.get('is_parenclub'): t='Parenclub'
  base=slug(('privehuis' if t=='Privéhuis' else 'parenclub' if t=='Parenclub' else 'seksclub')+'-'+x['name']+'-'+(x.get('city') or ''))
  sid=base;i=2
  while sid in seen: sid=f'{base}-{i}';i+=1
  seen.add(sid)
  V.append(dict(id=sid,name=x['name'],aliases=x.get('aliases') or [],type=t,city=x.get('city') or '',prov=x.get('province') or '',
    addr=x.get('address'),pc=x.get('postcode'),phone=x.get('phone'),web=web(x.get('website')),email=x.get('email'),
    hoursRaw=x.get('opening_hours') if x.get('opening_hours') not in (None,'onbekend') else None,hours=hours(x.get('opening_hours')),
    research=x['status'],verified=x['status']=='actief',pub=PUB.get(x['status'],'concept'),pack='basic',claim='ongeclaimd',
    review=bool(x.get('needs_manual_review')),reasons=x.get('review_reasons') or [],src=x.get('source_count',0),
    srcUrls=x.get('source_urls') or [],notes=x.get('notes') or [],checked=x.get('verified_at'),page=None,demo=False,
    intro='',fac=[],img=None,logo=None))

# Boccaccio: bestaand (echt) Spotlight-profiel met eigen pagina + beeld
for v in V:
  if v['name']=='Boccaccio' and v['city']=='Laren':
    v.update(name="Boccaccio Men's Club",type='Seksclub',page='seksclub-boccaccio-laren',pack='spotlight',pub='gepubliceerd',verified=True,
      img='img/sponsors/boccaccio/hero.jpg',logo='img/sponsors/boccaccio/logo.png',addr=v['addr'] or 'Hector Treublaan 2',pc=v['pc'] or '1251 CG',
      phone=v['phone'] or '035-5311717',web=v['web'] or 'https://www.boccaccio.nl/',hours=[['14:00','01:00']]*5+[None,None],
      intro="Gentlemen's club in een villa aan de A1 in Laren, met bar, shows, diner, zwembad en sauna.",
      fac=['Bar & wijnkaart','Dagelijks shows','3-gangen diner','Zwembad','Sauna','Kamers met airco','Gratis privéparkeren'])

# 7 fictieve voorbeeldprofielen van het concept: blijven bestaan (eigen pagina), standaard NIET op de hub.
DEMO=[('privehuis-villa-lavendel-utrecht','Villa Lavendel','Privéhuis','Utrecht','Utrecht'),('seksclub-club-noir-amsterdam','Club Noir','Seksclub','Amsterdam','Noord-Holland'),
 ('privehuis-de-linde-eindhoven','Privéhuis De Linde','Privéhuis','Eindhoven','Noord-Brabant'),('seksclub-club-saffier-rotterdam','Club Saffier','Seksclub','Rotterdam','Zuid-Holland'),
 ('privehuis-huize-fleur-groningen','Huize Fleur','Privéhuis','Groningen','Groningen'),('seksclub-club-amethist-arnhem','Club Amethist','Seksclub','Arnhem','Gelderland'),
 ('privehuis-rozenhof-breda','Privéhuis Rozenhof','Privéhuis','Breda','Noord-Brabant')]
for pg,n,t,c,p in DEMO:
  V.append(dict(id=pg,name=n,aliases=[],type=t,city=c,prov=p,addr=None,pc=None,phone=None,web=None,email=None,hoursRaw=None,hours=None,
    research='voorbeeld',verified=False,pub='concept',pack='basic',claim='ongeclaimd',review=False,reasons=['fictief voorbeeldprofiel'],src=0,srcUrls=[],notes=[],
    checked=None,page=pg,demo=True,intro='',fac=[],img=None,logo=None))

out={'v':1,'generated':INV.get('generated_at'),'source':'_research/seksclubs/inventory.json','count':len(V),'venues':V}
js='/* Gegenereerd door _build/clubs_data.py — NIET handmatig bewerken. Eén bron voor admin-beheer + publieke clubpagina’s.\n   Research '+str(INV.get('generated_at'))+'; alleen tekstuele feiten, geen foto’s/logo’s van derden. */\nwindow.PDX_CLUBS_DATA='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n'
open(os.path.join(R,'assets/clubs-data.js'),'w',encoding='utf-8').write(js)
from collections import Counter
print('clubs-data.js',len(V),Counter(v['pub'] for v in V),Counter(v['type'] for v in V if v['pub']=='gepubliceerd'))
