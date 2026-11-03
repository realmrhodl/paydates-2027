import re,os,glob
os.chdir('..');bad=[];n=0
files=set(os.path.basename(f) for f in glob.glob('*.html'))
for f in glob.glob('*.html'):
  if f.startswith('_'):continue
  s=open(f).read()
  for m in re.finditer(r'(?:href|src)="([^"]+)"',s):
    u=m.group(1)
    if u.startswith(('http','mailto:','tel:','sms:','#','data:','javascript')) or '${' in u: continue
    n+=1;p=u.split('#')[0].split('?')[0]
    if p and not os.path.exists(p): bad.append((f,u))
  if 'href="#"' in s: bad.append((f,'href="#"'))
print('links gecontroleerd:',n,'kapot:',len(bad));[print(b) for b in sorted(set(bad))[:40]]
print('html-bestanden:',len([f for f in files if not f.startswith('_')]))
