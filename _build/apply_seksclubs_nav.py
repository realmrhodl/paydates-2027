# Voegt Seksclubs & Privéhuizen toe aan Meer-menu, drawer en footer (idempotent).
import glob,os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
DR='px-3 py-2.5 rounded hover:bg-[#7351c017] [&.active]:text-pd [&.active]:bg-[#7351c017]'
REP=[
 ('<a href="jobs.html" role="menuitem">',
  '<a href="seksclubs.html" role="menuitem"><i class="fa fa-building"></i>Seksclubs &amp; Privéhuizen</a>',
  'href="seksclubs.html" role="menuitem"', 'before'),
 ('<a href="jobs.html" class="'+DR+'"><i class="fa fa-briefcase',
  '<a href="seksclubs.html" class="'+DR+'"><i class="fa fa-building w-4 mr-2 text-pd text-center"></i>Seksclubs &amp; Privéhuizen</a>',
  'href="seksclubs.html" class="px-3', 'before'),
 ('<li><a href="agency.html" class="hover:text-pd">Agencies</a></li>',
  '<li><a href="seksclubs.html" class="hover:text-pd">Seksclubs &amp; Privéhuizen</a></li>',
  '<li><a href="seksclubs.html" class="hover:text-pd">', 'after'),
]
n=0;cnt=[0,0,0]
for f in sorted(glob.glob(os.path.join(R,'*.html'))):
  if os.path.basename(f)=='_old-dark-concept.html': continue
  s=open(f,encoding='utf-8').read();o=s
  for i,(anchor,ins,mark,pos) in enumerate(REP):
    if mark in s or anchor not in s: continue
    s=s.replace(anchor, ins+anchor if pos=='before' else anchor+ins, 1); cnt[i]+=1
  if s!=o: open(f,'w',encoding='utf-8').write(s); n+=1
print('bestanden:',n,'meer/drawer/footer:',cnt)
