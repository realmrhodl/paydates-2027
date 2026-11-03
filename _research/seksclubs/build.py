import json,re,unicodedata,collections,csv,datetime
R=json.load(open('raw_records.json'))
TODAY='2026-11-02'
import os
WEB=json.load(open('website_check.json')) if os.path.exists('website_check.json') else {}
def strip_acc(s): return ''.join(c for c in unicodedata.normalize('NFKD',s) if not unicodedata.combining(c))
CITY_ALIAS={"'s-hertogenbosch":"den bosch","s-hertogenbosch":"den bosch","'s-gravenhage":"den haag","groningen (gemeente)":"groningen","utrecht (gemeente)":"utrecht",
 "well lb":"well","wenum wiesel":"apeldoorn","wenum-wiesel":"apeldoorn","ugchelen":"apeldoorn","herten":"roermond","nuland":"den bosch","lemiers":"vaals","vaals-lemiers":"vaals",
 "laren nh":"laren","hengelo ov":"hengelo","rijswijk zh":"rijswijk","muiden":"muiden","heerewaarden":"heerewaarden","nieuw-beerta":"nieuw beerta"}
def ncity(c):
    if not c: return ''
    c=strip_acc(c.strip().lower()).replace('’',"'")
    c=re.sub(r'\s*\(.*\)$','',c) if c not in CITY_ALIAS else c
    return CITY_ALIAS.get(c,c)
STOP=set('club clubs prive priveclub privehuis privehuisje huize huis house saunaclub sauna nightclub nachtclub gentlemen gentlemens men mens bar de het the le la bv vof seksclub sexclub sociëteit societeit relaxclub erotisch centrum center centre parenclub swingersclub kamerverhuur tevens escortservice horeca exploitatie nl en n & home'.split())
def core(n):
    n=strip_acc(n.lower()).replace('’',"'").replace("'s",'s')
    n=re.sub(r"[^a-z0-9 ]",' ',n)
    toks=[t for t in n.split() if t not in STOP]
    return ' '.join(toks) if toks else ' '.join(n.split())
def nstreet(a):
    if not a: return None
    a=strip_acc(a.lower()).replace('’',"'")
    a=a.split(',')[0]
    m=re.match(r"\s*([a-z' .-]+?)\s*(\d+)",a)
    if not m: return None
    st=re.sub(r'[^a-z]','',m.group(1)).replace('weg','weg')
    return st+'#'+m.group(2)
# fix eroplein address/city
for r in R:
    if r['source']=='eroplein.com' and r['address']:
        a=r['address']; m=re.match(r'^(.*?),\s*([^,]+)$',a)
        if m: r['address'],r['city']=m.group(1),m.group(2)
        m2=re.match(r'^([A-Z][a-z]+) \((?:bij|[A-Z][a-z]+)[^)]*\)$',r['address'] or '')
        if m2: r['city']=m2.group(1); r['address']=None
        if r['address'] and not re.search(r'\d',r['address']): r['address_note']=r['address']; r['address']=None
    if r['source']=='eroplein.com' and r['city'] in ('Limburg','Noord-Brabant','Zuid-Holland','Noord-Holland','Gelderland','Utrecht'):
        r['city']=r['source_url'].split('/')[3].replace('-',' ').title()
EXCL=re.compile(r'raamprostitutie|tippelzone|\bramen\b|massage|thai(?! ?priv)|\bspa\b|sexshop|erotheek|eros shop|escortbureau|escortservice|bemiddeling|sm studio|sm club|domination|gay massage|kamer verhuur|kamerverhuur|baekelandplein|bokkingshang|\bonbekend\b|love hotel|massagewereld|multimassage|^weaze',re.I)
PAREN=re.compile(r'paren|swing|fata morgana|fun4two|sameplace|acanthus|kasteel waterloo|le baron|mystique|inn4love|erosauna|amouret',re.I)
def excluded(r):
    s=(r['name'] or '')+' '+(r.get('src_category') or '')+(' ramen' if re.search(r'\(\d+ ramen\)|\(\+/- \d+ ramen\)',r.get('_raw') or '') else '')
    if r['source']=='vanbilgaan.nl' and r['src_category'] in ('Club','Privehuis','Parenclub') and not re.search(r'massage|kamer verhuur',r['name'],re.I): return None
    m=EXCL.search(s); return m.group(0) if m else None
# union find
n=len(R); par=list(range(n))
def f(i):
    while par[i]!=i: par[i]=par[par[i]]; i=par[i]
    return i
def u(a,b): par[f(a)]=f(b)
for i,r in enumerate(R):
    r['_c']=core(r['name']); r['_city']=ncity(r['city']); r['_st']=nstreet(r['address']); r['_prov']=r.get('province')
    r['_dom']=re.sub(r'^https?://(www\.)?','',r['website']).split('/')[0].lower() if r.get('website') else None
    r['_excl']=excluded(r)
by=collections.defaultdict(list)
for i,r in enumerate(R):
    if r['_st']: by[('st',r['_st'],r['_city'])].append(i)
    if r['_dom']: by[('dom',r['_dom'],r['_city'])].append(i)
    by[('nc',r['_c'].replace(' ',''),r['_city'])].append(i)
for k,v in by.items():
    for j in v[1:]: u(v[0],j)
# fuzzy name within city
for i in range(n):
    for j in range(i+1,n):
        a,b=R[i],R[j]
        if a['_city']!=b['_city'] or not a['_city']: continue
        ca,cb=a['_c'].replace(' ',''),b['_c'].replace(' ','')
        if len(ca)>=4 and len(cb)>=4 and (ca in cb or cb in ca): 
            if a['_st'] and b['_st'] and a['_st']!=b['_st']: continue
            u(i,j)
import difflib
# fuzzy address: same city, same house number, street similarity
for i in range(n):
    for j in range(i+1,n):
        a,b=R[i],R[j]
        if a['_city']==b['_city'] and a['_st'] and b['_st'] and a['_st']!=b['_st']:
            sa,na=a['_st'].split('#'); sb,nb=b['_st'].split('#')
            if na==nb and difflib.SequenceMatcher(None,sa,sb).ratio()>=0.85: u(i,j)
# 'Voorheen' names (HvP) -> merge with same-city record of that name
for i,r in enumerate(R):
    note=r.get('hvp_note') or ''
    m=re.match(r'(?:Voorheen|Vroeger|voorheen|Daarna)[^:]*:?\s*(.*)',note)
    if not m: continue
    olds=[core(x) for x in re.split(r',| en ',m.group(1).rstrip('.')) if x.strip()]
    for j,s in enumerate(R):
        if j!=i and s['_city']==r['_city'] and s['_c'] in olds and len(s['_c'])>=3: u(i,j)
# manual: HvP 'Privilege' line belongs to 'Saunaclub Le Grand ... Voorheen: Privilege' (Zundert)
for i,r in enumerate(R):
    if r['source']=='huisjesvanplezier.com' and r['name']=='Privilege' and r['_city']=='zundert':
        for j,s in enumerate(R):
            if 'le grand' in s['_c'] and s['_city']=='zundert': u(i,j)
cl=collections.defaultdict(list)
for i in range(n): cl[f(i)].append(R[i])
PREF={'vanbilgaan.nl':0,'huisjesvanplezier.com':1,'eroplein.com':2,'seksclubs.space':3}
CITYPROV={}
for r in R:
    if r.get('province') and r['_city']: CITYPROV.setdefault(r['_city'],r['province'])
CITYPROV.update({'harelbeke':'BE','moordrecht':'Zuid-Holland','zevenaar':'Gelderland','boxmeer':'Noord-Brabant','haps':'Noord-Brabant','nuland':'Noord-Brabant','tilburg':'Noord-Brabant','made':'Noord-Brabant','alkmaar':'Noord-Holland','almere':'Flevoland','leeuwarden':'Friesland','bergen op zoom':'Noord-Brabant','beesel':'Limburg','rucphen':'Noord-Brabant','heerewaarden':'Gelderland','zundert':'Noord-Brabant','linne':'Limburg','kerkrade':'Limburg','geleen':'Limburg'})
venues=[];reference_closed=[];excluded_list=[]
def slug(s): return re.sub(r'[^a-z0-9]+','-',strip_acc(s.lower())).strip('-')
for k,rs in cl.items():
    rs.sort(key=lambda r:(PREF[r['source']], r['src_says_closed']))
    srcs=sorted(set(r['source'] for r in rs))
    open_like=[r for r in rs if not r['src_says_closed']]
    closed_like=[r for r in rs if r['src_says_closed']]
    primary=(open_like or rs)[0]
    city=primary['city']; 
    if primary['source']=='vanbilgaan.nl':
        alt=[r for r in rs if r['source']!='vanbilgaan.nl' and r['city']]
    prov=next((r['province'] for r in rs if r.get('province') in ('Drenthe','Flevoland','Friesland','Gelderland','Groningen','Limburg','Noord-Brabant','Noord-Holland','Overijssel','Utrecht','Zeeland','Zuid-Holland')),None) or CITYPROV.get(primary['_city'])
    excl=[r['_excl'] for r in rs if r['_excl']]
    names=[]; [names.append(r['name']) for r in rs if r['name'] not in names]
    rec=dict(name=primary['name'],aliases=[x for x in names if x!=primary['name']],province=prov,city=city,sources=srcs,
             source_urls=sorted(set(r['source_url'] for r in rs)))
    if excl and len(excl)==len(rs) or (excl and not any(r['source']=='vanbilgaan.nl' and not r['_excl'] for r in rs) and len(excl)>=len(rs)/2):
        rec['excluded_reason']=excl[0]; excluded_list.append(rec); continue
    if prov=='BE': rec['excluded_reason']='buiten Nederland (België)'; excluded_list.append(rec); continue
    if not open_like:
        rec['address']=next((r['address'] for r in rs if r['address']),None); rec['hvp_note']=next((r.get('hvp_note') for r in rs if r.get('hvp_note')),None)
        reference_closed.append(rec); continue
    def pick(field,prefer=None):
        for r in sorted(open_like,key=lambda r:(PREF[r['source']] if not prefer else prefer.index(r['source']) if r['source'] in prefer else 9)):
            if r.get(field): return r[field],r['source']
        return None,None
    addr,addr_src=pick('address',['vanbilgaan.nl','eroplein.com','huisjesvanplezier.com','seksclubs.space'])
    pc,_=pick('postcode',['eroplein.com','seksclubs.space','vanbilgaan.nl'])
    web,web_src=pick('website',['vanbilgaan.nl','eroplein.com','seksclubs.space'])
    tel,tel_src=pick('phone',['eroplein.com','vanbilgaan.nl','seksclubs.space'])
    mail,mail_src=pick('email')
    hrs,hrs_src=pick('opening_hours')
    desc,desc_src=pick('description')
    blob=' '.join([(r['name'] or '')+' '+(r.get('src_category') or '')+' '+(r.get('description') or '')+' '+(r.get('hvp_note') or '') for r in rs])
    vbcat=next((r['src_category'] for r in rs if r['source']=='vanbilgaan.nl'),None)
    if PAREN.search(blob) or vbcat=='Parenclub': typ='parenclub'
    elif vbcat=='Privehuis': typ='privehuis'
    elif vbcat=='Club': typ='seksclub'
    elif re.search(r'priv[eé]|huize|privéhuis|home|landhuis',blob,re.I): typ='privehuis'
    elif re.search(r'club|nightclub|bar\b|eros cent|fkk|bordeel|sexclub|seksclub',blob,re.I): typ='seksclub'
    else: typ='overig_onbekend'
    if any(r['src_category']=='stripclubs' for r in rs): typ='overig_onbekend'
    vb_conf=any(r['source']=='vanbilgaan.nl' and r['src_status']=='door bedrijf bevestigd' for r in rs)
    hvp_open=any(r['source']=='huisjesvanplezier.com' and r['src_says_open'] for r in rs)
    hvp_closed=bool(closed_like)
    indep_open=len(set(r['source'] for r in open_like if r['source']!='seksclubs.space'))
    notes=[]
    opencores=set(r['_c'].replace(' ','') for r in open_like)
    same_closed=[r for r in closed_like if r['_c'].replace(' ','') in opencores or any((len(c)>=4 and (c in r['_c'].replace(' ','') or r['_c'].replace(' ','') in c)) for c in opencores)]
    other_closed=[r for r in closed_like if r not in same_closed]
    if other_closed: notes.append('op dit adres stond eerder (gesloten): '+', '.join(sorted(set(r['name'] for r in other_closed))))
    hvp_closed=bool(same_closed)
    wc=WEB.get(web) if web else None
    web_ok=bool(wc and wc.get('ok'))
    if web_ok: notes.append('officiële website bereikbaar op '+TODAY+(' (titel: '+wc.get('title','')[:60]+')' if wc.get('title') else ''))
    elif wc: notes.append('website niet (correct) bereikbaar: '+str(wc.get('manual_flag') or wc.get('status')))
    web_bad=bool(wc and wc.get('manual_flag'))
    if hvp_closed and web_ok and open_like:
        status='actief'; notes.append('TEGENSTRIJDIG: huisjesvanplezier.com noemt deze naam ook bij gesloten clubs (mogelijk oude vestiging), maar eigen website is live — handmatig controleren')
    elif hvp_closed: status='mogelijk_gesloten'; notes.append('huisjesvanplezier.com noemt deze naam bij gesloten clubs')
    elif web_bad: status='onbekend'; notes.append('status verlaagd naar onbekend omdat eigen domein niet meer van de club is')
    elif vb_conf: status='actief'
    elif indep_open>=2: status='actief'
    elif web_ok and indep_open>=1: status='actief'
    elif web_ok: status='actief'; notes.append('alleen bevestigd via eigen website (geen tweede actuele bron)')
    else: status='onbekend'
    if set(srcs)=={'seksclubs.space'}: notes.append('alleen in seksclubs.space (oude bedrijvengids-data, waarschijnlijk verouderd)')
    if typ=='parenclub': notes.append('parenclub — aparte categorie, niet mengen met seksclubs')
    hn=[r.get('hvp_note') for r in rs if r.get('hvp_note')]
    if hn: notes.append('HvP: '+hn[0])
    if len(rs)>1: notes.append(f'{len(rs)} bronvermeldingen samengevoegd')
    addrs=set(r['_st'] for r in open_like if r['_st'])
    if len(addrs)>1: notes.append('adres verschilt tussen bronnen: '+' / '.join(sorted(set(r['address'] for r in open_like if r['address']))))
    rec.update(type=typ,address=addr,address_source=addr_src,postcode=pc,website=web,website_source=web_src,phone=tel,phone_source=tel_src,email=mail,email_source=mail_src,
        opening_hours=hrs or 'onbekend',opening_hours_source=hrs_src,description=desc,description_source=desc_src,facilities=None,
        logo_photos='niet verzameld (geen gebruiksrechten)',status=status,verified_at=TODAY,
        vanbilgaan_status=next((r['src_status']+' ('+(r['src_checked'] or '')+')' for r in rs if r['source']=='vanbilgaan.nl'),None),
        merged_records=len(rs),notes=notes)
    venues.append(rec)
json.dump(dict(venues=venues,reference_closed=reference_closed,excluded=excluded_list,raw_count=len(R)),open('_build_tmp.json','w'),ensure_ascii=False,indent=1)
print('venues',len(venues),'closed-ref',len(reference_closed),'excluded',len(excluded_list))
print(collections.Counter(v['status'] for v in venues)); print(collections.Counter(v['type'] for v in venues)); print(collections.Counter(v['province'] for v in venues))
