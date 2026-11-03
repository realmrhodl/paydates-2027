import glob,json,re,os
from bs4 import BeautifulSoup
recs=[]
def txt(s):
    for x in s(['script','style']): x.decompose()
    return s.get_text(' | ',strip=True)
def lds(s):
    out=[]
    for sc in s.find_all('script',type='application/ld+json'):
        try: out.append(json.loads(sc.string))
        except Exception: pass
    return out
# --- vanbilgaan
for f in sorted(glob.glob('raw/vb_v/*.html')):
    h=open(f).read(); s=BeautifulSoup(h,'lxml'); L=lds(s)
    lb=[x for x in L if x.get('@type')=='LocalBusiness']
    if not lb: continue
    d=lb[0]; a=d.get('address',{})
    t=txt(s)
    m=re.search(r'Bron: \| ([^|]+) \|',t); bron=m.group(1).strip() if m else None
    m=re.search(r'laatst gecontroleerd: \| ([^|]+) \|',t); chk=m.group(1).strip() if m else None
    hours=None
    if d.get('openingHoursSpecification'):
        hours='; '.join(f"{o['dayOfWeek'].split('/')[-1][:3]} {o['opens']}-{o['closes']}" for o in d['openingHoursSpecification'])
    recs.append(dict(source='vanbilgaan.nl',source_url=d['@id'],name=d['name'],src_category=d.get('category'),
        city=a.get('addressLocality'),province=a.get('addressRegion'),address=a.get('streetAddress'),postcode=a.get('postalCode'),
        website=d.get('sameAs') if isinstance(d.get('sameAs'),str) else None,phone=d.get('telephone'),email=d.get('email'),
        opening_hours=hours,description=None,src_status=bron,src_checked=chk,src_says_closed=False,src_says_open=None))
# --- eroplein
for f in sorted(glob.glob('raw/ero_v/*.html')):
    s=BeautifulSoup(open(f).read(),'lxml'); L=lds(s)
    biz=[x for x in L if x.get('@type') not in ('BreadcrumbList','FAQPage')]
    crumbs=[x for x in L if x.get('@type')=='BreadcrumbList']
    prov=None
    for c in crumbs:
        for it in c['itemListElement']:
            if '/provincie/' in str(it.get('item','')): prov=it['name']
    if not biz: continue
    d=biz[0]; a=d.get('address',{})
    sa=d.get('sameAs'); sa=sa[0] if isinstance(sa,list) and sa else sa
    cat=f.split('__')[1]
    recs.append(dict(source='eroplein.com',source_url=d.get('url'),name=d['name'],src_category=cat,city=a.get('addressLocality'),
        province=a.get('addressRegion') or prov,address=a.get('streetAddress'),postcode=a.get('postalCode'),website=sa,
        phone=d.get('telephone'),email=d.get('email'),opening_hours=None,description=d.get('description'),
        src_status='Geverifieerd (eroplein-label)' if 'Geverifieerd' in txt(s) else None,src_checked=None,src_says_closed=False,src_says_open=None))
# --- seksclubs.space
for f in sorted(glob.glob('raw/ss_v/*.html')):
    prov_slug,city_slug,slug=os.path.basename(f)[:-5].split('__')
    s=BeautifulSoup(open(f).read(),'lxml'); t=txt(s)
    i=t.find('| Details |'); seg=t[i:i+800]
    def grab(lbl,nxt):
        m=re.search(re.escape(lbl)+r' \| (.*?) \| '+nxt,seg); return m.group(1).strip() if m else None
    h1=s.find('h1'); name=(h1.get_text(' ',strip=True) if h1 else t[t.find('| Details')-200:t.find('| Details')].split('|')[-2]).strip(' >\n')
    adr=grab('Adres','Telefoonnummer'); tel=grab('Telefoonnummer','Navigeer'); web=grab('Website','e-mail'); mail=grab('e-mail','Beoordeling')
    parts=[p.strip() for p in (adr or '').split('|')]
    street=parts[0] if parts else None; pc=parts[1] if len(parts)>2 else None; city=parts[-2] if len(parts)>=3 else None; prov=parts[-1] if parts else None
    a=s.find('a',string=re.compile('Website'))
    webs=[x['href'] for x in s.find_all('a',href=True) if 'Website' in x.get_text()]
    recs.append(dict(source='seksclubs.space',source_url=f'https://seksclubs.space/{prov_slug}/{city_slug}/{slug}/',name=name,src_category='seksclub (directory)',
        city=city,province=prov,address=street,postcode=pc,website=None if web in (None,'-') else web,phone=None if tel in (None,'-') else tel,
        email=None if (mail in (None,'-') or 'protected' in (mail or '')) else mail,opening_hours=None,description=None,src_status=None,src_checked=None,src_says_closed=False,src_says_open=None,_seg=seg))
# --- huisjesvanplezier
PROV={'drenthe':'Drenthe','flevoland':'Flevoland','friesland':'Friesland','gelderland':'Gelderland','groningen':'Groningen','limburg-nl':'Limburg','noord-brabant':'Noord-Brabant','noord-holland':'Noord-Holland','overijssel':'Overijssel','utrecht':'Utrecht','zeeland':'Zeeland','zuid-holland':'Zuid-Holland'}
INLINE={'drenthe','groningen','gelderland','overijssel','noord-brabant','friesland'}
for f in sorted(glob.glob('raw/hvp/*.txt')):
    key=os.path.basename(f)[:-4]; prov=PROV[key]; url=f'https://huisjesvanplezier.com/seksclubs-in-{key}/'
    lines=open(f).read().split('\n')
    j=[]
    for ln in lines:
        ln=ln.strip()
        if not ln: continue
        if j and (ln[0] in ':,.' ): j[-1]+=ln; continue
        if j and j[-1].endswith(':') is False and False: pass
        j.append(ln)
    mode=None; city=None
    for ln in j:
        low=ln.lower()
        if re.search(r'(zijn|is) (nog )?(open|geopend)\??$|nog geopend\?$',low): mode='open'; continue
        if low.startswith('gesloten') or 'zijn dicht' in low or 'inmiddels gesloten' in low: mode='closed'; continue
        if mode is None: continue
        if re.fullmatch(r"[^:,]{2,40}:",ln): city=ln[:-1].strip(); continue
        if ln in ('/','seksb'): continue
        c=city; body=ln
        m=re.match(r"^([^:]{2,40}?): (.+)$",ln)
        if mode=='closed' and m and key in INLINE:
            c=m.group(1).strip(); body=m.group(2)
        mm=re.match(r"^(.+?)(?::|,)\s*(.+)$",body)
        if mm: nm,rest=mm.group(1).strip(),mm.group(2).strip()
        else: nm,rest=body.strip(),''
        closed = mode=='closed' or '(gesloten)' in body
        note=None
        mv=re.search(r'(Voorheen|Vroeger|voorheen|Tegenwoordig|Daarna|Ook|inmiddels)[^.]*\.?',rest)
        if mv: note=mv.group(0)
        addr=re.split(r'\.?\s+(?=Voorheen|Vroeger|voorheen|vroeger|Tegenwoordig|Daarna|Ook:|Is nu|inmiddels)|\s*\(',rest)[0].strip().rstrip('.') or None
        if addr and c and addr.endswith(', '+c): addr=addr[:-(len(c)+2)]
        recs.append(dict(source='huisjesvanplezier.com',source_url=url,name=re.sub(r'\s*\(gesloten\)','',nm).strip(' .'),src_category='hvp-lijst',city=c,province=prov,address=addr,postcode=None,
            website=None,phone=None,email=None,opening_hours=None,description=None,src_status='open-lijst' if not closed else 'gesloten-lijst',src_checked=None,
            src_says_closed=closed,src_says_open=not closed,hvp_note=note,_raw=ln))
json.dump(recs,open('raw_records.json','w'),ensure_ascii=False,indent=1)
import collections
print(len(recs),collections.Counter(r['source'] for r in recs))
print(collections.Counter((r['source'],r['src_status']) for r in recs if r['source']=='huisjesvanplezier.com'))
