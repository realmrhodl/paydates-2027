import json,re,subprocess
from bs4 import BeautifulSoup
J='/tmp/pdjar2.txt'
out={}
for id_,href in json.load(open('/tmp/hrefs.json')):
  h=subprocess.run(['curl','-sL','-c',J,'-b',J,'-A','Mozilla/5.0',href],capture_output=True,text=True).stdout
  s=BeautifulSoup(h,'html.parser'); c=s.select_one('#contact'); rows=[]
  if c:
    for r in c.select('.row'):
      cols=r.select('.col-6')
      if len(cols)<2: continue
      k=re.sub(r'\s+',' ',cols[0].get_text()).strip()
      a=cols[1].find('a')
      v=re.sub(r'\s+',' ',cols[1].get_text()).strip()
      rows.append([k,v,a['href'] if a and a.has_attr('href') else ''])
  out[id_]=rows
  print(id_,len(h),rows,flush=True)
json.dump(out,open('_build/contacts.json','w'),ensure_ascii=False,indent=0)
