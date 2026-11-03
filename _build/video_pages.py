# Genereert video-<slug>.html (eigen SEO-pagina per video, comments, gerelateerd). Los draaien: python3 _build/video_pages.py
import json,re,html,unicodedata,subprocess,os,hashlib
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
d=json.loads(subprocess.check_output(['node','-e',"global.window={};require('./assets/data.js');const D=window.PD_DATA;process.stdout.write(JSON.stringify({V:D.V,L:D.L}))"]))
V,LM=d['V'],{x['id']:x for x in d['L']}
def title(v): return v['title'].strip() or f"Video van {v['user']}"
def slug(v):
  vid=v['href'].rstrip('/').split('/')[-1].split('-')[0]
  s=unicodedata.normalize('NFD',(vid+'-'+title(v)).lower()); s=''.join(c for c in s if not unicodedata.combining(c))
  return re.sub(r'^-+|-+$','',re.sub(r'[^a-z0-9]+','-',s)[:80])
for v in V: v['slug']=slug(v); v['page']='video-'+v['slug']+'.html'
E=lambda s:html.escape(str(s),quote=True)
def fv(n): return f"{n/1000:.1f}k".replace('.',',') if n>=1000 else str(n)
def ago(dd):
  if dd<1: return 'vandaag'
  if dd<30: return f'{dd} dagen geleden'
  if dd<365: return f'{dd//30} maand{"en" if dd//30>1 else ""} geleden'
  return f'{dd//365} jaar geleden'
src=open('nieuws.html',encoding='utf-8').read().split('\n')
HEAD='\n'.join(src[:94]); i=next(k for k,l in enumerate(src) if '<!-- FOOTER -->' in l); j=next(k for k,l in enumerate(src) if 'assets/app.js' in l)
FOOT='\n'.join(src[i:j+1])
NICK=['Mark','Rick_U','Jeroen','anoniem','Daan82','Sven','Bas','Tom_R','Kees','Niels','Ruud','Joost']
TXT=['Mooie video 🔥','Wanneer ben je weer beschikbaar?','Wauw, echt top.','Heb je ook meer video\'s?','Zo mooi gefilmd 😍','Ben je ook in het weekend te boeken?','Super, meteen je advertentie bekeken.','Echt geil, dank je!','Kom je ook naar Utrecht?','Dit is echt kwaliteit 👌']
def comments(v):
  h=int(hashlib.md5(v['slug'].encode()).hexdigest(),16); n=2+h%3; out=[]
  for k in range(n):
    ti=(h>>(k*5+2))%len(TXT)
    while any(TXT[ti]==o[1] for o in out): ti=(ti+1)%len(TXT)
    out.append((NICK[(h>>(k*4))%len(NICK)],TXT[ti],1+(h>>(k*3))%max(2,min(v['days'],60))))
  return sorted(out,key=lambda c:c[2])
def card(v):
  return f'''<a href="{v['page']}" class="flex gap-2.5 group"><span class="relative w-[150px] shrink-0 aspect-video rounded-md overflow-hidden bg-ink"><img src="{E(v['thumb'])}" alt="{E(title(v))}" loading="lazy" class="w-full h-full object-cover transition group-hover:scale-105"><span class="absolute bottom-1 right-1 text-[10px] font-semibold text-white bg-black/60 rounded px-1"><i class="fa fa-eye mr-0.5"></i>{fv(v['views'])}</span></span><span class="min-w-0"><span class="grid text-[13px] font-semibold text-[#212529] leading-snug line-clamp-2 group-hover:text-pd">{E(title(v))}</span><span class="grid text-[11px] text-ink-muted mt-1 truncate">{E(v['user'])}</span><span class="grid text-[11px] text-ink-muted">{fv(v['views'])} weergaven · {ago(v['days'])}</span></span></a>'''
TOP={}
for w in sorted(V,key=lambda w:-w['views']): TOP.setdefault(w['user'],w)
CNT={}
for w in V: CNT[w['user']]=CNT.get(w['user'],0)+1
JB='<a href="https://jerkbro.com" target="_blank" rel="noopener sponsored" class="vab-cta vab-cta-alt"><i class="fa fa-film"></i> Porno films</a>'
n=0
for v in V:
  t=title(v); x=LM.get(v.get('ad'))
  rel=[w for w in V if w is not v and w['user']==v['user']]+sorted([w for w in V if w is not v and w['user']!=v['user']],key=lambda w:-w['views'])
  rel=rel[:10]
  desc=f"{t} – gratis sexfilmpje van {v['user']} op Paydates.nl. {fv(v['views'])} weergaven."+(f" {x['n']} uit {x['c']}: bekijk de advertentie en neem direct contact op." if x else " Bekijk meer video's van echte adverteerders.")
  mime='video/quicktime' if v['mp4'].lower().endswith('.mov') else 'video/mp4'
  ld={"@context":"https://schema.org","@type":"VideoObject","name":t,"description":desc,"thumbnailUrl":v['thumb'],"contentUrl":v['mp4'],"uploadDate":"2026-11-01","interactionStatistic":{"@type":"InteractionCounter","interactionType":{"@type":"WatchAction"},"userInteractionCount":v['views']},"isFamilyFriendly":False}
  h=HEAD.replace('data-page="nieuws"','data-page="videos"')
  ptitle=f"{t} | Paydates.nl" if t==f"Video van {v['user']}" else f"{t} | Video van {v['user']} | Paydates.nl"
  h=re.sub(r'<title>.*?</title>',f'<title>{E(ptitle)}</title>',h)
  h=re.sub(r'(<meta name="description" content=")[^"]*',lambda m:m.group(1)+E(desc),h)
  h=re.sub(r'(og:title" content=")[^"]*',lambda m:m.group(1)+E(ptitle),h)
  h=re.sub(r'(og:description" content=")[^"]*',lambda m:m.group(1)+E(desc),h)
  h=h.replace('</head>',f'<link rel="canonical" href="https://paydates.nl/video/{v["slug"]}"><meta property="og:type" content="video.other"><meta property="og:image" content="{E(v["thumb"])}"><meta property="og:video" content="{E(v["mp4"])}"><meta name="rating" content="adult">\n<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script>\n</head>',1)
  if x:
    side=f'''<a href="advertentie.html?id={x['id']}" class="flex items-center gap-3 group"><img src="{E(x['img'])}" alt="" class="w-12 h-12 rounded-full object-cover"><span class="min-w-0"><span class="grid font-semibold text-[#212529] group-hover:text-pd truncate">{E(x['n'])}{' <i class="fa fa-circle-check text-pd text-[12px]"></i>' if x.get('v') else ''}</span><span class="grid text-[12px] text-ink-muted">{E(x.get('t',''))} · {E(x['c'])}</span></span></a><a href="advertentie.html?id={x['id']}" class="btn btn-pd ml-auto shrink-0"><i class="fa fa-user"></i> Bekijk advertentie</a>'''
  else:
    side=f'''<span class="flex items-center gap-3"><img src="{E(TOP[v['user']]['thumb'])}" alt="{E(v['user'])}" class="w-12 h-12 rounded-full object-cover ring-2 ring-[#7351c033]"><span><span class="grid font-semibold text-[#212529]">{E(v['user'])}</span><span class="grid text-[12px] text-ink-muted">Paydates-lid · {CNT[v['user']]} video{"'s" if CNT[v['user']]>1 else ''}</span></span></span><a href="search.html?f=video" class="btn btn-ghost ml-auto shrink-0">Escorts met video</a>'''
  cm=''.join(f'''<li class="flex gap-3 py-3 border-b border-line last:border-0"><img src="img/avatars/{a.lower()}.svg" alt="" width="36" height="36" class="w-9 h-9 shrink-0 rounded-full ring-2 ring-white shadow-sm"><div class="min-w-0"><div class="text-[12px]"><b class="text-[#212529]">{E(a)}</b> <span class="text-ink-muted">· {d_} {'dag' if d_==1 else 'dagen'} geleden</span></div><p class="text-[13px] text-ink mt-0.5">{E(b)}</p></div></li>''' for a,b,d_ in comments(v))
  nc=len(comments(v))
  lead=(f"Een video van <b>{E(x['n'])}</b> uit {E(x['c'])}. Wil je haar ook in het echt ontmoeten? Bekijk de advertentie en neem direct contact op." if x else f"Een video van <b>{E(v['user'])}</b>, geplaatst op Paydates.nl. Bekijk meer video's van echte makers of vind een escort met video bij jou in de buurt.")
  cta1=(f'<a href="advertentie.html?id={x["id"]}" class="vab-cta vab-cta-pd"><i class="fa fa-user"></i> Bekijk advertentie</a>' if x else '')
  body=f'''<div class="max-w-[1400px] mx-auto px-3 lg:px-6 py-4">
<nav class="crumbs flex flex-wrap items-center gap-1.5"><a href="index.html"><i class="fa fa-house"></i></a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><a href="videos.html">Video's</a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><span class="text-ink truncate max-w-[60vw]">{E(t)}</span></nav>
<div class="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-5 mt-3">
 <main class="min-w-0">
  <div class="vplayer relative rounded-lg overflow-hidden bg-black aspect-video"><video id="vp" class="w-full h-full" controls playsinline preload="metadata" poster="{E(v['thumb'])}" src="{E(v['mp4'])}"></video><button type="button" id="vpBig" class="vp-big" aria-label="Afspelen"><i class="fa fa-play"></i></button><div id="vpErr" class="vp-err hidden"><i class="fa fa-triangle-exclamation text-[22px]"></i><p>Deze video speelt niet af in je browser.</p><a href="{E(v['mp4'])}" target="_blank" rel="noopener" class="btn btn-pd"><i class="fa fa-up-right-from-square"></i> Open video direct</a></div></div>
  <h1 class="text-[18px] sm:text-[22px] font-bold text-[#212529] leading-snug mt-3">{E(t)}</h1>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-[12px] text-ink-muted"><span><i class="fa fa-eye mr-1"></i>{format(v['views'],',').replace(',','.')} weergaven</span><span><i class="fa fa-clock mr-1"></i>{ago(v['days'])}</span>
   <span class="ml-auto flex gap-2"><button type="button" id="likeBtn" class="pill px-3 py-1.5 text-[12px]"><i class="fa fa-thumbs-up mr-1"></i><span id="likeN">{max(3,v['views']//60)}</span></button><button type="button" id="shareBtn" class="pill px-3 py-1.5 text-[12px]"><i class="fa fa-share-nodes mr-1"></i>Delen</button><a href="melden.html?video={v['slug']}" class="pill px-3 py-1.5 text-[12px]"><i class="fa fa-flag mr-1"></i>Melden</a><a href="https://jerkbro.com" target="_blank" rel="noopener sponsored" class="pill px-3 py-1.5 text-[12px] !text-pd"><i class="fa fa-film mr-1"></i>Porno films</a></span></div>
  <div class="block p-4 mt-4 flex flex-wrap items-center gap-3">{side}</div>
  <section class="block p-4 sm:p-5 mt-4" aria-labelledby="cT">
   <h2 id="cT" class="text-[15px] font-semibold text-[#212529]"><span id="cN">{nc}</span> reacties</h2>
   <form id="cForm" class="flex items-center gap-2 mt-3"><img src="img/avatars/jij.svg" alt="" class="w-9 h-9 shrink-0 rounded-full"><input id="cIn" required maxlength="500" class="inp flex-1" placeholder="Schrijf een reactie…"><button class="btn btn-pd shrink-0">Plaatsen</button></form>
   <p class="text-[11px] text-ink-muted mt-1.5">Respectvol reageren. Geen telefoonnummers of links. <a href="login.html" class="text-pd">Log in</a> om onder je eigen naam te reageren.</p>
   <ul id="cList" class="mt-2">{cm}</ul>
  </section>
  <section class="vab block mt-4" aria-labelledby="abT">
   <div class="vab-h"><span class="vab-ey"><i class="fa fa-circle-play"></i> Over deze video</span><span class="vab-18"><i class="fa fa-shield-halved"></i> 21+ · eigen content</span></div>
   <div class="vab-b">
    <div class="flex items-center gap-3"><img src="{E(x['img'] if x else TOP[v['user']]['thumb'])}" alt="" class="w-11 h-11 rounded-full object-cover ring-2 ring-[#7351c033]"><div class="min-w-0"><h2 id="abT" class="vab-t">{E(t)}</h2><div class="vab-meta"><span><i class="fa fa-user"></i>{E(x['n'] if x else v['user'])}</span>{('<span><i class="fa fa-location-dot"></i>'+E(x['c'])+'</span>') if x else ''}{('<span><i class="fa fa-tag"></i>'+E(x.get('t',''))+'</span>') if x and x.get('t') else ''}<span><i class="fa fa-clock"></i>{ago(v['days'])}</span></div></div></div>
    <p class="vab-lead">{lead}</p>
    <dl class="vab-stats"><div><dt>Weergaven</dt><dd>{format(v['views'],',').replace(',','.')}</dd></div><div><dt>Reacties</dt><dd>{nc}</dd></div><div><dt>Video's maker</dt><dd>{CNT[v['user']]}</dd></div><div><dt>Kwaliteit</dt><dd>HD</dd></div></dl>
    <div class="vab-ctas">{cta1}<a href="videos.html" class="vab-cta"><i class="fa fa-video"></i> Meer sexfilmpjes</a><a href="search.html?f=video" class="vab-cta"><i class="fa fa-magnifying-glass"></i> Escorts met video</a>{JB}</div>
   </div>
  </section>
 </main>
 <aside class="min-w-0">
  <h2 class="text-[15px] font-semibold text-[#212529] mb-3">Gerelateerde video's</h2>
  <div class="space-y-3">{''.join(card(w) for w in rel)}</div>
  <a href="videos.html" class="btn btn-ghost w-full mt-4">Alle video's <i class="fa fa-angle-right"></i></a>
 </aside>
</div>
</div>
'''
  js=f'''<script>(function(){{const K='pdC_{v['slug']}',l=document.getElementById('cList'),n=document.getElementById('cN'),e=s=>s.replace(/[&<>"]/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}}[c]));
const add=(t,top)=>{{const li=document.createElement('li');li.className='flex gap-3 py-3 border-b border-line last:border-0';li.innerHTML='<img src="img/avatars/jij.svg" alt="" width="36" height="36" class="w-9 h-9 shrink-0 rounded-full ring-2 ring-white shadow-sm"><div class="min-w-0"><div class="text-[12px]"><b class="text-[#212529]">Jij</b> <span class="text-ink-muted">· zojuist</span></div><p class="text-[13px] text-ink mt-0.5">'+e(t)+'</p></div>';l.prepend(li);n.textContent=+n.textContent+1;}};
JSON.parse(localStorage.getItem(K)||'[]').forEach(t=>add(t));
document.getElementById('cForm').onsubmit=ev=>{{ev.preventDefault();const i=document.getElementById('cIn'),t=i.value.trim();if(!t)return;add(t);const a=JSON.parse(localStorage.getItem(K)||'[]');a.push(t);localStorage.setItem(K,JSON.stringify(a));i.value='';}};
const vp=document.getElementById('vp'),big=document.getElementById('vpBig'),ve=document.getElementById('vpErr');
big.onclick=()=>{{vp.play().catch(()=>{{vp.muted=true;vp.play().catch(()=>{{}});}});}};
vp.addEventListener('play',()=>big.classList.add('hidden'));vp.addEventListener('pause',()=>{{if(!vp.ended&&vp.currentTime<0.2)big.classList.remove('hidden');}});
vp.addEventListener('error',()=>{{ve.classList.remove('hidden');big.classList.add('hidden');}});
const lb=document.getElementById('likeBtn');lb.onclick=()=>{{if(lb.classList.contains('on'))return;lb.classList.add('on');const s=document.getElementById('likeN');s.textContent=+s.textContent+1;}};
document.getElementById('shareBtn').onclick=()=>{{const u=location.href;navigator.share?navigator.share({{title:document.title,url:u}}).catch(()=>{{}}):navigator.clipboard.writeText(u).then(()=>PD.toast&&PD.toast('Link gekopieerd'));}};}})();</script>
</body>
</html>
'''
  open(v['page'],'w',encoding='utf-8').write(h+'\n'+body+FOOT+'\n'+js); n+=1
json.dump({v['mp4']:v['page'] for v in V},open('_build/video_pages.json','w'),indent=0)
print(n,'videopagina\'s')
