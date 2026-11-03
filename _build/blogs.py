import re,json,subprocess,html as H
from bs4 import BeautifulSoup
J='/tmp/pdjar.txt'
s=BeautifulSoup(open('/tmp/blogs.html',errors='ignore').read(),'html.parser')
out={}
ALLOWED={'h2','h3','h4','h5','p','ul','ol','li','strong','b','em','i','a','img','br','blockquote','table','tr','td','th','tbody','thead'}
def cleanhtml(node):
  for t in node.find_all(True):
    if t.name not in ALLOWED: t.unwrap(); continue
    attrs={}
    if t.name=='a' and t.get('href'): attrs['href']=t['href']
    if t.name=='img' and t.get('src'): attrs['src']=t['src']; attrs['alt']=t.get('alt','')
    t.attrs=attrs
  h=node.decode_contents()
  h=re.sub(r'(&nbsp;|\xa0)',' ',h)
  h=re.sub(r'<p>\s*</p>','',h); h=re.sub(r'(<br/?>\s*){2,}','<br>',h)
  return h.strip()
for c in s.select('.card-blog-post'):
  a=c.select_one('h3 a'); href=a['href']
  if '65-test' in href or href in out: continue
  slug=re.sub(r'[^a-z0-9]+','-',H.unescape(href.split('/blog-details/')[1]).lower()).strip('-')
  slug=re.sub(r'^\d+-','',slug)[:70].strip('-')
  img=c.select_one('img'); cat=c.select_one('.fa-folder-open-o'); cat=cat.find_next('span').get_text(strip=True) if cat else ''
  tm=c.select_one('time'); date=tm.get_text(strip=True)[:10] if tm else ''
  ex=c.select_one('.opacity-75'); ex=re.sub(r'\s+',' ',ex.get_text(' ',strip=True)).replace('Lees meer','').replace(' ...','…').strip() if ex else ''
  d={'href':href,'slug':slug,'title':a.get_text(strip=True),'img':img['src'] if img else '','cat':cat,'date':date,'excerpt':ex}
  h=subprocess.run(['curl','-sL','-b',J,'-A','Mozilla/5.0',href],capture_output=True,text=True).stdout
  b=BeautifulSoup(h,'html.parser')
  bc=b.select_one('.blog_content')
  d['html']=cleanhtml(bc) if bc else ''
  md=b.find('meta',attrs={'name':'description'}); d['meta']=md['content'].strip()[:300] if md and md.get('content') else ''
  out[href]=d; print(date,cat,d['title'][:60],len(d['html']),flush=True)
L=sorted(out.values(),key=lambda d:d['date'],reverse=True)
json.dump(L,open('blogs.json','w'),ensure_ascii=False)
print(len(L))
