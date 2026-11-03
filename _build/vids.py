import re,json,subprocess
from bs4 import BeautifulSoup
J='/tmp/pdjar.txt'
s=BeautifulSoup(open('/tmp/vids.html',errors='ignore').read(),'html.parser')
out=[]
for a in s.select('a[href*="/paydates/videos/"]'):
  c=a.select_one('.video-card')
  if not c: continue
  img=c.select_one('img'); t=c.select_one('.card-title'); ps=c.select('.card-text')
  title=t.get_text(strip=True)
  v={'href':a['href'],'thumb':img['src'],'title':'' if title=='No Video Title' else title,'user':ps[0].get_text(strip=True),
     'views':int(re.sub(r'\D','',ps[1].get_text()) or 0),'days':int(re.sub(r'\D','',ps[2].get_text()) or 0)}
  h=subprocess.run(['curl','-sL','-b',J,'-A','Mozilla/5.0',v['href']],capture_output=True,text=True).stdout
  m=re.search(r'<source src="(https://paydates.nl/paydates-videos/[^"]+)"',h); v['mp4']=m.group(1) if m else ''
  out.append(v); print(v['user'],v['title'][:40],v['views'],bool(v['mp4']),flush=True)
json.dump(out,open('videos.json','w'),ensure_ascii=False)
