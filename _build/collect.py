import re,subprocess,json
J='/tmp/pdjar.txt'
def get(u): return subprocess.run(['curl','-sL','-c',J,'-b',J,'-A','Mozilla/5.0',u],capture_output=True,text=True).stdout
hrefs=[]
for cat in ['vrouwen','mannen','stellen','shemale','shemales']:
  for p in range(1,16):
    h=get(f'https://paydates.nl/{cat}/escorts/{p}')
    found=re.findall(r'href="(https://paydates.nl/(?:vrouwen|mannen|stellen|shemales)/[^"/]+/[^"/]+/\d+-[^"]*)"',h)
    new=[f for f in dict.fromkeys(found) if f not in hrefs]
    pagelinks=set(int(n) for n in re.findall(rf'/{cat}/escorts/(\d+)"',h))
    print(cat,p,len(found),len(new),max(pagelinks) if pagelinks else 0)
    hrefs+=new
    if not pagelinks or p>=max(pagelinks): break
json.dump(hrefs,open('hrefs.json','w'),indent=0)
print(len(hrefs))
