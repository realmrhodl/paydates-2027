import re,json,subprocess,html
from bs4 import BeautifulSoup
src=open('../index.html').read()
L=json.loads(re.search(r'const L=(\[.*?\]);',src,re.S).group(1))
J='/tmp/pdjar.txt'
out=[]
def clean(s): return re.sub(r'\s+',' ',s or '').strip()
def fix(s):
  try: return s.encode('latin1').decode('utf8')
  except Exception: return s
for i,x in enumerate(L):
  h=subprocess.run(['curl','-sL','-c',J,'-b',J,'-A','Mozilla/5.0',x['href']],capture_output=True,text=True).stdout
  s=BeautifulSoup(h,'html.parser')
  d=dict(x); d['id']=i+1
  d['photos']=[im['src'] for im in s.select('#product-gallery-img-wrap img')] or [x['img']]
  ov=s.select_one('#overview')
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
        prices.append({'t':t,'rows':[r for r in rows if len(r)==2]})
      elif t=='Kenmerken':
        kenm=[[clean(c.get_text()) for c in r.select('.col-6')] for r in blk.select('.row.g-0')]
        kenm=[k for k in kenm if len(k)==2 and k[1] not in ('-','')]
      elif t=='Mogelijkheden':
        for r in blk.select('.d-flex.mb-2'):
          sp=r.find_all('span',recursive=False)
          if sp: mog.append([clean(sp[0].get_text()), clean(sp[1].get_text()) if len(sp)>1 else ''])
      elif t=='Beschikbaarheid':
        for dv in blk.select('.me-2'):
          day=dv.find('strong'); ic=dv.select_one('.availabilty-icon')
          if day: avail.append([clean(day.get_text()), clean(ic.get_text()) if ic else ''])
  d['prices']=prices;d['kenm']=kenm;d['mog']=mog;d['avail']=avail
  langs=[re.search(r'flags/(\w+)-flag',im['src']).group(1) for im in s.select('img[src*="/flags/"]')]
  d['langs']=sorted(set(langs))
  d['avail_now']=bool(s.find(string=re.compile('Nu beschikbaar')))
  d['wa']=bool(s.select_one('a[href^="https://wa.me"]'))
  out.append(d)
  print(d['id'],d['n'],len(d['photos']),len(desc),len(prices),len(kenm),len(mog),len(avail),d['langs'])
json.dump(out,open('listings.json','w'),ensure_ascii=False,indent=0)
