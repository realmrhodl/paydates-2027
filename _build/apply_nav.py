# Herschrijft header/navbalk/drawer (+ bottom-nav) in alle live HTML-bestanden. Idempotent.
import re,glob,os,sys
sys.path.insert(0,os.path.dirname(__file__))
from nav import header
R=os.path.join(os.path.dirname(__file__),'..')
SKIP={'_old-dark-concept.html'}
BLOCK=re.compile(r'<!-- HEADER -->.*?<!-- MOBIEL MENU -->.*?</div>\s*</div>\s*</div>\s*</div>\n?(?:<!-- MOBIELE BOTTOM-NAV -->.*?</nav>\n?)?',re.S)
LBL=[('<a href="agency.html" class="hover:text-pd">Agency</a>','<a href="agency.html" class="hover:text-pd">Agencies</a>'),
     ('<a href="videos.html" class="hover:text-pd">Videos</a>',"<a href=\"videos.html\" class=\"hover:text-pd\">Video's</a>"),
     ('name="viewport" content="width=device-width, initial-scale=1"','name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"')]
n=0
for f in sorted(glob.glob(os.path.join(R,'*.html'))):
  if os.path.basename(f) in SKIP: continue
  s=open(f,encoding='utf-8').read();o=s
  m=BLOCK.search(s)
  if m:
    sid=re.search(r'<input id="([^"]+)" name="q"',m.group(0));sid=sid.group(1) if sid else 'q'
    s=s[:m.start()]+header(sid)+'\n'+s[m.end():]
  for a,b in LBL: s=s.replace(a,b)
  if s!=o: open(f,'w',encoding='utf-8').write(s);n+=1
print('bijgewerkt:',n)
