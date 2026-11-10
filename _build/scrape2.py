import re,json,subprocess
from bs4 import BeautifulSoup
src=open('../index.html').read()
OLD={x['href']:x for x in json.loads(re.search(r'const L=(\[.*?\]);',src,re.S).group(1))}
hrefs=json.load(open('hrefs.json'))
J='/tmp/pdjar.txt'
def clean(s): return re.sub(r'\s+',' ',s or '').strip()
TYPEMAP={'prive-ontvangst':'Privé ontvangst','escort':'Escort','virtueel':'Online','erotische-massage':'Massage','bdsm':'BDSM','gratis-sekscontact':'Gratis sekscontact','diversen':'Diversen'}
GMAP={'vrouwen':'Vrouw','mannen':'Man','stellen':'Stel','shemales':'Shemale'}
out=[]
for i,u in enumerate(hrefs):
  h=subprocess.run(['curl','-sL','-c',J,'-b',J,'-A','Mozilla/5.0',u],capture_output=True,text=True).stdout
  s=BeautifulSoup(h,'html.parser')
  m=re.match(r'https://paydates.nl/(\w+)/([^/]+)/([^/]+)/(\d+)-',u)
  cat,typ,cityslug,adid=m.groups()
  o=OLD.get(u,{})
  d={'id':int(adid),'href':u,'g':GMAP[cat],'t':TYPEMAP.get(typ,typ)}
  name=s.select_one('.block-content h4 span'); d['n']=clean(name.get_text()) if name else o.get('n','')
  ov=s.select_one('#overview')
  tt=ov.select_one('.fw-bold span') if ov else None
  d['s']=clean(tt.get_text()) if tt else o.get('s','')
  info=s.select_one('.block-content .mb-3')
  d['c']=o.get('c') or ''
  if info:
    for dv in info.select('.mb-2'):
      tx=clean(dv.get_text())
      if dv.select_one('.fa-map-marker-alt'): d['c']=tx
      mm=re.match(r'(Vrouw|Man|Stel|Shemale|Koppel|Transgender)\w*, (\d+) jaar',tx)
      if mm: d['a']=int(mm.group(2))
  d.setdefault('a',o.get('a',0))
  if not d['c']: d['c']=cityslug.replace('-',' ').title()
  d['photos']=[im['src'] for im in s.select('#product-gallery-img-wrap img')] or ([o['img']] if o else [])
  d['img']=o.get('img') or (d['photos'][0] if d['photos'] else '')
  desc=''
  if ov:
    p=ov.find('p')
    if p: desc='\n'.join(clean(t) for t in p.get_text('\n').split('\n') if clean(t))
  d['desc']=desc
  prices=[];kenm=[];mog=[];avail=[]
  if ov:
    for blk in ov.select('.block'):
      t=blk.select_one('.block-title'); t=clean(t.get_text()) if t else ''
      if t.endswith('prijzen'):
        rows=[[clean(c.get_text()) for c in r.select('.col-6')] for r in blk.select('.row.g-0')]
        rows=[r for r in rows if len(r)==2 and r[1]]
        if rows: prices.append({'t':t,'rows':rows})
      elif t=='Kenmerken':
        kenm=[[clean(c.get_text()) for c in r.select('.col-6')] for r in blk.select('.row.g-0')]
        kenm=[k for k in kenm if len(k)==2 and k[1] not in ('-','')]
      elif t=='Mogelijkheden':
        for r in blk.select('.d-flex.mb-2'):
          sp=r.find_all('span',recursive=False)
          if sp: mog.append([clean(sp[0].get_text()), clean(sp[1].get_text()).replace('Extra ','+') if len(sp)>1 else ''])
      elif t=='Beschikbaarheid':
        for dv in blk.select('.me-2'):
          day=dv.find('strong'); ic=dv.select_one('.availabilty-icon')
          if day:
            tx=clean(ic.get_text()) if ic else ''
            ok='Unavailable' not in tx and 'Available' in tx
            tm=re.search(r'Van (\d\d:\d\d) tot (\d\d:\d\d)',tx)
            avail.append([clean(day.get_text()), (('Hele dag' if tm and tm.group(1)==tm.group(2) else f'{tm.group(1)} – {tm.group(2)}') if tm else 'Beschikbaar') if ok else ''])
  d['prices']=prices;d['kenm']=kenm;d['mog']=mog;d['avail']=avail
  d['langs']=sorted(set(re.search(r'flags/(\w+)-flag',im['src']).group(1) for im in s.select('img[src*="/flags/"]')))
  d['now']=bool(s.find(string=re.compile('Nu beschikbaar')))
  def pval(rows):
    for k,v in rows:
      if k.startswith('1 uur'):
        n=re.sub(r'\D','',v); return int(n) if n else 0
    return 0
  d['p']=o.get('p') if o else (pval(prices[0]['rows']) if prices else 0)
  d['f']=len(d['photos'])
  d['vid']=o.get('vid',0) if o else len(s.select('#photos video, video source'))
  d['v']=o.get('v',0); d['vip']=o.get('vip',0); d['top']=o.get('top',0)
  d['ago']=o.get('ago','')
  out.append(d)
  print(d['id'],d['n'],d['g'],d['t'],d['c'],d['a'],d['f'],d['p'],len(desc),flush=True)
# order: old ones first (keep homepage order), then rest
order={h:i for i,h in enumerate(OLD)}
out.sort(key=lambda d:(order.get(d['href'],999),-d['id']))
json.dump(out,open('listings.json','w'),ensure_ascii=False)
print(len(out))
