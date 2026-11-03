import re,json
from bs4 import BeautifulSoup
s=BeautifulSoup(open('/tmp/pg_faq.html',errors='ignore').read(),'html.parser')
def fixmoji(h):
  for a,b in [('Ã«','ë'),('Ã©','é'),('Ã¨','è'),('â€™','’'),('â€˜','‘'),('â€œ','“'),('â€','”'),('Ã¯','ï'),('Ã¶','ö'),('Ã¼','ü'),('Â',''),('Ã','à')]: h=h.replace(a,b)
  return h
ALLOWED={'h2','h3','h4','p','ul','ol','li','strong','b','em','a','br'}
def clean(node):
  for t in node.find_all(True):
    if t.name not in ALLOWED: t.unwrap(); continue
    t.attrs={'href':t['href']} if t.name=='a' and t.get('href') else {}
  h=node.decode_contents()
  h=h.replace('\xa0',' ')
  h=re.sub(r'<p>\s*</p>','',h)
  return fixmoji(h).strip()
def block_with(key):
  n=s.find(string=lambda t:t and key in t)
  p=n
  while p and not (p.name=='p' and False):
    p=p.parent
    if p.name=='div' and p.get('class') and 'block-content' in p.get('class'): return p
out={}
# AV: find <p> with 'Algemene voorwaarden Paydates.nl' strong, its parent div
n=s.find('strong',string=re.compile('Algemene voorwaarden Paydates.nl'))
out['av']=clean(n.find_parent('div'))
out['privacy']=clean(block_with('Privacyverklaring Paydates.nl'))
out['cookies']=clean(block_with('maakt gebruik van cookies'))
# emails cloudflare-obfuscated -> decode
def cf(m):
  h=m.group(1);k=int(h[:2],16);return ''.join(chr(int(h[i:i+2],16)^k) for i in range(2,len(h),2))
for k in out:
  raw=str(out[k])
  out[k]=re.sub(r'<a href="/cdn-cgi/l/email-protection[^"]*">\[email&#160;protected\]</a>|\[email protected\]','{{EMAIL}}',raw)
# FAQ items
faq=[]
for hd in s.select('[id^=faq][id$=_h1]'):
  cid=hd['id'][:-3]; body=s.find(id=cid)
  q=hd.get_text(' ',strip=True)
  if body:
    for a in body.select('a[href*="email-protection"]'): a.replace_with('support@paydates.nl')
    faq.append([fixmoji(q),clean(body)])
out['faq']=faq
# fix email placeholders using decoded order from page
emails=[cf(m) for m in re.finditer(r'data-cfemail="([0-9a-f]+)"',str(s))]
print(emails)
json.dump(out,open('legal.json','w'),ensure_ascii=False)
for k in ['av','privacy','cookies']: print(k,len(out[k]),out[k].count('{{EMAIL}}'))
print(len(faq),[f[0] for f in faq])
