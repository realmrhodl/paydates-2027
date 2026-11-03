import json,csv,collections,re
d=json.load(open('_build_tmp.json'))
V=d['venues']
def mergeinto(keep,drop,why):
    k=[v for v in V if (v['name'],v['city'])==keep][0]; x=[v for v in V if (v['name'],v['city'])==drop][0]
    for f in ['sources','source_urls','aliases']: k[f]=sorted(set(k[f])|set(x[f])|({x['name']} if f=='aliases' and x['name']!=k['name'] else set()))
    for f in ['website','phone','email','address','postcode']:
        if not k.get(f) and x.get(f): k[f]=x[f]; k[f+'_source']=x.get(f+'_source')
    k['notes']+=[n for n in x['notes'] if n not in k['notes']]; k['merged_records']+=x['merged_records']; k['notes'].append('handmatig samengevoegd: '+why)
    if x['status']=='actief' and k['status']!='mogelijk_gesloten': k['status']='actief'
    V.remove(x)
mergeinto(('Privehuis Yvonne','Kerkrade'),('Privehuis Yvonne','Maastricht'),'eroplein-vermelding (slug Maastricht) verwijst naar privehuisyvonne.com, dat Kerkrade noemt')
mergeinto(('Club A16','Moerdijk'),('Club Moonlight A16','Moerdijk'),'Steenweg 6 / Steendijk 6 Moerdijk — zelfde A16-club, straatnaam verschilt per bron')
for v in V:
    if v['name']=='Studio Da Capo': v['province']='Noord-Holland'; v['notes'].append('provincie gecorrigeerd: Naarden ligt in Noord-Holland (bron noemde Utrecht)')
    if v['name']=='Madame Jeanette' and v['city']=='Den Haag': v['notes'].append('naam lijkt op Madame-Jeanette Kerkrade; controleren')
PROVS=['Groningen','Friesland','Drenthe','Overijssel','Flevoland','Gelderland','Utrecht','Noord-Holland','Zuid-Holland','Zeeland','Noord-Brabant','Limburg']
MANUAL={
 'Madame-Jeanette':'mogelijk zelfde zaak als "Madame Chanet" (Kerkrade); domein madamejeanette.nl te koop',
 'Madame Chanet':'mogelijk zelfde zaak als "Madame-Jeanette" (Kerkrade)',
 'Saunaclub Le Grand':'adres Meirseweg 25 (eroplein) vs 142 (HvP) — controleren; incl. voormalig "Privilege" handmatig samengevoegd',
 'Sex Winschoten':'naam zegt Winschoten, bron plaatst in Groningen-stad — controleren',
 'Bon Ton':'eerder "Crystal Club" op Stadhouderskade 64; zusterzaak BonTon Rotterdam apart gehouden',
}
EXISTING={'Boccaccio':'bestaande Paydates-listing (concept-site); eerder geverifieerd via boccaccio.nl'}
demo=[v['name'] for v in V if re.search(r'lavendel',v['name'],re.I)]
assert not demo, demo
for v in V:
    rr=[]
    if v['status']!='actief': rr.append('status '+v['status'])
    if v['type']=='overig_onbekend': rr.append('type onzeker')
    if not v.get('address'): rr.append('geen adres')
    if len(v['sources'])<2: rr.append('slechts één bron')
    if any('verschilt' in n for n in v['notes']): rr.append('adresconflict tussen bronnen')
    if any('TEGENSTRIJDIG' in n for n in v['notes']): rr.append('tegenstrijdige status')
    if v['name'] in MANUAL: rr.append(MANUAL[v['name']]); v['notes'].append('HANDMATIG: '+MANUAL[v['name']])
    v['needs_manual_review']=bool(rr); v['review_reasons']=rr
    v['existing_paydates_listing']=v['name'] in EXISTING
    if v['name'] in EXISTING: v['notes'].append(EXISTING[v['name']])
    v['is_parenclub']=v['type']=='parenclub'
    v['source_count']=len(v['sources'])
dup=sum(v['merged_records']-1 for v in V)
st=collections.Counter(v['status'] for v in V); ty=collections.Counter(v['type'] for v in V)
per={}
for p in PROVS:
    vs=[v for v in V if v['province']==p]
    per[p]=dict(totaal=len(vs),actief=sum(v['status']=='actief' for v in vs),mogelijk_gesloten=sum(v['status']=='mogelijk_gesloten' for v in vs),onbekend=sum(v['status']=='onbekend' for v in vs),
      seksclub=sum(v['type']=='seksclub' for v in vs),privehuis=sum(v['type']=='privehuis' for v in vs),parenclub=sum(v['type']=='parenclub' for v in vs),overig_onbekend=sum(v['type']=='overig_onbekend' for v in vs),
      zonder_website=sum(not v['website'] for v in vs),zonder_telefoon=sum(not v['phone'] for v in vs),zonder_openingstijden=sum(v['opening_hours']=='onbekend' for v in vs),
      handmatig=sum(v['needs_manual_review'] for v in vs),gesloten_referentie=sum(1 for r in d['reference_closed'] if r['province']==p))
summary=dict(total_unique=len(V),actief=st['actief'],mogelijk_gesloten=st['mogelijk_gesloten'],onbekend=st['onbekend'],
  types=dict(ty),parenclubs=ty['parenclub'],duplicates_merged=dup,needs_manual_review=sum(v['needs_manual_review'] for v in V),
  raw_records=d['raw_count'],reference_closed=len(d['reference_closed']),excluded=len(d['excluded']),
  with_website=sum(bool(v['website']) for v in V),website_live=sum(any('website bereikbaar' in n for n in v['notes']) for v in V),
  with_phone=sum(bool(v['phone']) for v in V),with_email=sum(bool(v['email']) for v in V),with_opening_hours=sum(v['opening_hours']!='onbekend' for v in V),
  demo_venues_excluded=7,verified_at='2026-11-02')
sources=[
 dict(source='vanbilgaan.nl',status='werkte',records=63,notes='robots.txt staat bedrijfspagina\'s toe; categorieën Club/Privéhuis/Parenclub; status "door bedrijf bevestigd" gebruikt als bewijs'),
 dict(source='huisjesvanplezier.com',status='werkte',records=512,notes='12 provinciepagina\'s; 177 open-lijst + 335 gesloten-lijst (gesloten = referentie)'),
 dict(source='eroplein.nl',status='werkte',records=21,notes='robots.txt staat toe (behalve /admin, /api); 21 relevante venuepagina\'s'),
 dict(source='seksclubs.space',status='werkte, lage betrouwbaarheid',records=97,notes='lijkt oude bedrijvengids-data; telt nooit als bewijs voor "actief"'),
 dict(source='sexclubs.startpagina.nl',status='geblokkeerd/opgeheven',records=0,notes='subdomein stuurt door naar www.startpagina.nl; geen data'),
 dict(source='officiële websites',status='gecontroleerd',records=len(json.load(open('website_check.json'))),notes='alleen homepage GET (statuscode + titel); gekaapte/te-koop-domeinen handmatig gemarkeerd; geen beelden gedownload'),
 dict(source='KvK-register',status='niet gebruikt',records=0,notes='geen open API zonder account; aanbevolen voor handmatige controle'),
]
caveats=['De lijst met 66 bedrijven is NIET meegeleverd — nog te verwerken zodra Stefan die aanlevert.',
 'De 7 demo-venues van de concept-site (o.a. Villa Lavendel) zijn fictief en niet meegeteld.',
 'Geen productie-import, geen databasewijzigingen, niets gepubliceerd of verstuurd.',
 'Geen foto\'s of logo\'s verzameld (auteursrecht); alleen tekstuele feiten.',
 'Ontbrekende velden zijn leeg gelaten (null / "onbekend"); niets verzonnen. Openingstijden onbekend ⇒ nooit automatisch "Nu open".',
 'Status "actief" = bevestigd door bedrijf (vanbilgaan), ≥2 onafhankelijke actuele bronnen, of live eigen website. Geen garantie — handmatige controle aanbevolen vóór claim/import.',
 'Raamprostitutie, massagesalons, escort, sexshops, SM-studio\'s en kamerverhuur zijn uitgesloten (zie excluded).']
out=dict(generated_at='2026-11-02',summary=summary,per_province=per,sources_status=sources,caveats=caveats,venues=V,reference_closed=d['reference_closed'],excluded=d['excluded'])
json.dump(out,open('inventory.json','w'),ensure_ascii=False,indent=1)
cols=['name','type','status','province','city','address','postcode','website','phone','email','opening_hours','description','facilities','sources','source_urls','source_count','merged_records','verified_at','vanbilgaan_status','needs_manual_review','review_reasons','existing_paydates_listing','aliases','notes']
with open('inventory.csv','w',newline='',encoding='utf-8-sig') as f:
    w=csv.writer(f,delimiter=';'); w.writerow(cols)
    for v in sorted(V,key=lambda v:(PROVS.index(v['province']),v['city'] or '',v['name'])):
        w.writerow([' | '.join(map(str,v.get(c))) if isinstance(v.get(c),list) else ('' if v.get(c) is None else v.get(c)) for c in cols])
print(json.dumps(summary,ensure_ascii=False,indent=1));
for p,x in per.items(): print(p,x)
