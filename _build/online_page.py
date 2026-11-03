# Genereert online.html (Gebruikers online). Los draaien: python3 _build/online_page.py
import json,re,html,subprocess,os,hashlib
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
D=json.loads(subprocess.check_output(['node','-e',"global.window={};require('./assets/data.js');process.stdout.write(JSON.stringify(window.PD_DATA.L))"]))
E=lambda s:html.escape(str(s),quote=True)
src=open('nieuws.html',encoding='utf-8').read().split('\n')
HEAD='\n'.join(src[:93]); i=next(k for k,l in enumerate(src) if '<!-- FOOTER -->' in l); j=next(k for k,l in enumerate(src) if 'assets/app.js' in l)
FOOT='\n'.join(src[i:j+1])
TOTAL,LOGGED,PEAK,PEAKD=493,53,1284,'14 maart 2026'
h=HEAD.replace('data-page="nieuws"','data-page="online"')
T='Gebruikers online | Paydates.nl'; DS=f'Nu {TOTAL} bezoekers online op Paydates.nl, waarvan {LOGGED} ingelogde leden. Bekijk wie er nu online is.'
h=re.sub(r'<title>.*?</title>',f'<title>{T}</title>',h)
for k in ['meta name="description" content="','og:title" content="','og:description" content="']:
  h=re.sub('('+re.escape(k)+')[^"]*',lambda m:m.group(1)+E(T if 'title' in k else DS),h)
H=lambda s:int(hashlib.md5(s.encode()).hexdigest(),16)
ads=sorted(D,key=lambda x:H(str(x['id'])))[:24]
NAMES=['Mark','Rick_U','Jeroen','Daan82','Sven','Bas','Tom_R','Kees','Niels','Ruud','Joost','Peter_A','Hans1975','Wouter','Gijs','Frank_NL','Erik','Martijn','Dennis','Robin','Lars','Thijs','Koen','Stijn','Bram','Jasper','Vincent','Michiel','anoniem']
AV=['mark','rick_u','jeroen','daan82','sven','bas','tom_r','kees','niels','ruud','joost']
CITIES=['Amsterdam','Rotterdam','Utrecht','Den Haag','Eindhoven','Groningen','Tilburg','Breda','Arnhem','Zwolle','Nijmegen','Haarlem']
def mins(s): return 1+H(s)%58
def adcard(x):
  return f'''<a href="advertentie.html?id={x['id']}" class="onl-card group"><span class="relative shrink-0"><img src="{E(x['img'])}" alt="{E(x['n'])}" loading="lazy" class="w-12 h-12 rounded-full object-cover ring-2 ring-[#7351c033]"><span class="onl-dot"></span></span><span class="min-w-0"><span class="flex items-center gap-1 font-semibold text-[13px] text-[#212529] truncate group-hover:text-pd">{E(x['n'])}{' <i class="fa fa-circle-check text-pd text-[11px]"></i>' if x.get('v') else ''}</span><span class="grid text-[11.5px] text-ink-muted truncate">{E(x.get('t',''))} · {E(x['c'])}</span><span class="grid text-[11px] text-[#2f9e5b]">online · {mins(str(x['id']))} min</span></span></a>'''
def memcard(k,n):
  av='anoniem' if n=='anoniem' else AV[k%len(AV)]
  return f'''<div class="onl-card"><span class="relative shrink-0"><img src="img/avatars/{av}.svg" alt="" class="w-12 h-12 rounded-full"><span class="onl-dot"></span></span><span class="min-w-0"><span class="grid font-semibold text-[13px] text-[#212529] truncate">{E(n)}</span><span class="grid text-[11.5px] text-ink-muted truncate">Lid · {CITIES[H(n)%len(CITIES)]}</span><span class="grid text-[11px] text-[#2f9e5b]">online · {mins(n)} min</span></span></div>'''
body=f'''<div class="max-w-[1400px] mx-auto px-3 lg:px-6 py-4">
<nav class="crumbs flex flex-wrap items-center gap-1.5"><a href="index.html"><i class="fa fa-house"></i></a><i class="fa fa-angle-right text-[9px] text-ink-soft"></i><span class="text-ink">Gebruikers online</span></nav>
<h1 class="text-[22px] sm:text-[26px] font-bold text-[#212529] mt-3">Gebruikers online</h1>
<p class="text-ink-muted text-[14px] mt-1">Op dit moment zijn er <b id="oT" class="text-[#212529]">{TOTAL}</b> bezoekers op Paydates.nl, waarvan <b id="oL" class="text-[#212529]">{LOGGED}</b> ingelogd.</p>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
 <div class="onl-stat"><i class="fa fa-users"></i><span><b id="oT2">{TOTAL}</b><small>bezoekers online</small></span></div>
 <div class="onl-stat"><i class="fa fa-user-check"></i><span><b id="oL2">{LOGGED}</b><small>ingelogde leden</small></span></div>
 <div class="onl-stat"><i class="fa fa-user-secret"></i><span><b id="oG">{TOTAL-LOGGED}</b><small>gasten</small></span></div>
 <div class="onl-stat"><i class="fa fa-trophy"></i><span><b>{PEAK:,}</b><small>record · {PEAKD}</small></span></div>
</div>
<section class="block mt-5"><div class="block-h flex items-center justify-between"><span><span class="onl-dot !static inline-block mr-2 align-middle"></span>Adverteerders online <span class="text-ink-muted font-normal">({len(ads)})</span></span><a href="search.html" class="text-pd text-[12px]">Alle advertenties <i class="fa fa-angle-right"></i></a></div>
 <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3">{''.join(adcard(x) for x in ads)}</div></section>
<section class="block mt-5"><div class="block-h"><span class="onl-dot !static inline-block mr-2 align-middle"></span>Leden online <span class="text-ink-muted font-normal">({len(NAMES)})</span></div>
 <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3">{''.join(memcard(k,n) for k,n in enumerate(NAMES))}</div></section>
<p class="text-[12px] text-ink-muted mt-4">In totaal zijn er {TOTAL} bezoekers online: {LOGGED} leden en {TOTAL-LOGGED} gasten. Het meeste aantal bezoekers tegelijk online was {PEAK:,} op {PEAKD}. Gegevens worden elke minuut ververst. <a href="register.html" class="text-pd">Maak een gratis account</a> om zelf in deze lijst te verschijnen, of <a href="chatten.html" class="text-pd">ga chatten</a>.</p>
</div>
'''.replace(f'{PEAK:,}',f'{PEAK:,}'.replace(',','.'))
js=f'''<script>(function(){{let t={TOTAL},l={LOGGED};const s=(id,v)=>{{const e=document.getElementById(id);if(e)e.textContent=v}};setInterval(()=>{{t=Math.max(420,t+Math.round(Math.random()*12-6));l=Math.max(40,l+Math.round(Math.random()*4-2));s('oT',t);s('oT2',t);s('oL',l);s('oL2',l);s('oG',t-l)}},8000)}})();</script>
</body>
</html>
'''
open('online.html','w',encoding='utf-8').write(h+'\n'+body+FOOT+'\n'+js); print('online.html')
