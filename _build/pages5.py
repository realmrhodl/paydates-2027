# Woordenboek (index + termpagina's) en publiek profiel (profiel.html?u=gebruikersnaam)
import json
from layout import *

T=[ # (afkorting/term, slug, betekenis, uitleg, categorie, gerelateerd, gezondheidsnoot)
('NZC','nzc','Neuken zonder condoom','Met NZC wordt geslachtsgemeenschap zonder condoom bedoeld. Je komt de afkorting vooral tegen in advertenties en op fora. Ook wel “bareback” genoemd.','Afkortingen',['pzc','bareback','soa','pmc'],True),
('PZC','pzc','Pijpen zonder condoom','PZC staat voor orale seks bij een man zonder condoom. In advertenties zie je vaak of iemand PZC of alleen PMC aanbiedt.','Afkortingen',['pmc','cim','nzc','dt'],True),
('PMC','pmc','Pijpen met condoom','PMC betekent orale seks bij een man mét condoom. Dit is de veiligere variant van PZC.','Afkortingen',['pzc','nzc','soa'],False),
('GFE','gfe','Girlfriend experience','Bij een GFE gedraagt de escort zich als een vriendin: aandacht, knuffelen, zoenen en een ontspannen sfeer, niet alleen seks. Vaak bij langere afspraken of een dinerdate.','Ervaringen',['pse','dfk','overnight','escort'],False),
('PSE','pse','Pornstar experience','PSE is een afspraak in de stijl van een pornofilm: intens, gevarieerd en vaak met meer standjes en rollenspel dan bij een standaard afspraak.','Ervaringen',['gfe','roleplay','cof'],False),
('DFK','dfk','Deep French kissing','DFK is intens tongzoenen. Niet iedere adverteerder zoent; het staat daarom vaak apart bij de mogelijkheden.','Afkortingen',['fk','gfe'],False),
('FK','fk','French kissing','FK staat voor zoenen met de tong, maar minder intens dan DFK.','Afkortingen',['dfk','gfe'],False),
('CIM','cim','Cum in mouth','CIM betekent dat een man klaarkomt in de mond van zijn partner.','Afkortingen',['pzc','cof','cob','soa'],True),
('COF','cof','Cum on face','COF betekent klaarkomen op het gezicht.','Afkortingen',['cim','cob','pse'],False),
('COB','cob','Cum on body','COB betekent klaarkomen op het lichaam, bijvoorbeeld op de buik of borsten.','Afkortingen',['cim','cof'],False),
('DT','dt','Deepthroat','DT is orale seks waarbij de penis diep in de keel wordt genomen.','Afkortingen',['pzc','pmc'],False),
('A-level','a-level','Anale seks','A-level is escortjargon voor anale seks. In advertenties vaak met een toeslag vermeld.','Afkortingen',['rimming','nzc','soa'],False),
('69','69','Wederzijdse orale seks (tegelijk)','Bij 69 bevredigen twee partners elkaar tegelijk oraal, liggend in tegenovergestelde richting.','Standjes',['beffen','pmc'],False),
('Bareback','bareback','Seks zonder condoom','Bareback is de Engelse term voor seks zonder condoom, hetzelfde als NZC.','Begrippen',['nzc','soa','prep'],True),
('Beffen','beffen','Orale seks bij een vrouw','Beffen is het met de mond en tong bevredigen van een vrouw.','Begrippen',['69','facesitting'],False),
('Rimming','rimming','Anaal likken','Rimming is het met de tong stimuleren van de anus. Ook wel “anilingus” genoemd.','Begrippen',['a-level','soa'],True),
('Facesitting','facesitting','Op het gezicht zitten','Bij facesitting zit een partner op het gezicht van de ander, vaak in combinatie met beffen of als onderdeel van dominantie.','Begrippen',['beffen','bdsm'],False),
('Squirten','squirten','Vrouwelijke ejaculatie','Squirten is het tijdens een orgasme uitstoten van vocht door een vrouw.','Begrippen',['beffen'],False),
('Trio','trio','Seks met drie personen','Een trio is een afspraak met drie personen, bijvoorbeeld MMV (twee mannen, één vrouw) of MVV (één man, twee vrouwen).','Begrippen',['duo','swingen'],False),
('Duo','duo','Twee adverteerders tegelijk','Bij een duo-afspraak boek je twee escorts of masseuses tegelijk.','Begrippen',['trio','escort'],False),
('Escort','escort','Sekswerker die op locatie komt','Een escort komt naar jou toe, bijvoorbeeld thuis of in een hotel. Op Paydates vind je escorts per stad onder de categorie Escort.','Paydates',['outcall','prive-ontvangst','overnight'],False),
('Privé ontvangst','prive-ontvangst','Afspraak op de locatie van de adverteerder','Bij privé ontvangst ga jij naar de adverteerder toe, bijvoorbeeld naar een eigen werkruimte of appartement. Ook wel incall genoemd.','Paydates',['incall','escort'],False),
('Incall','incall','Jij gaat naar de adverteerder','Incall betekent dat de afspraak plaatsvindt op de locatie van de sekswerker. In het Nederlands: privé ontvangst.','Begrippen',['outcall','prive-ontvangst'],False),
('Outcall','outcall','De adverteerder komt naar jou','Outcall betekent dat de sekswerker naar jou toe komt, thuis of in een hotel. Dit is wat een escort doet.','Begrippen',['incall','escort'],False),
('Overnight','overnight','Afspraak van een hele nacht','Een overnight is een afspraak die de hele nacht duurt, vaak inclusief diner en ontbijt.','Ervaringen',['gfe','escort'],False),
('Paydate','paydate','Betaalde date','Een paydate is een afspraak waarbij een van beide partijen betaalt voor gezelschap en/of erotische diensten. Paydates.nl is hét platform om ze te vinden en aan te bieden.','Paydates',['escort','sugardating'],False),
('Sugardating','sugardating','Relatie met financiële afspraken','Bij sugardating spreekt een vermogende partner (sugardaddy of sugarmommy) met een jongere partner (sugarbaby) een vorm van financiële steun af in ruil voor gezelschap.','Begrippen',['paydate','gfe'],False),
('BDSM','bdsm','Bondage, discipline, dominantie en sadomasochisme','BDSM is een verzamelnaam voor erotische spellen met macht, controle, pijn of vastbinden. Duidelijke afspraken en een stopwoord zijn essentieel.','Fetisj & BDSM',['dominatrix','safeword','fetisj'],False),
('Dominatrix','dominatrix','Dominante vrouw in een BDSM-sessie','Een dominatrix neemt de dominante rol aan in een BDSM-sessie en bepaalt wat er gebeurt.','Fetisj & BDSM',['bdsm','safeword','facesitting'],False),
('Safeword','safeword','Stopwoord','Een safeword is een vooraf afgesproken woord waarmee je een spel direct stopt. Onmisbaar bij BDSM en rollenspel.','Fetisj & BDSM',['bdsm','roleplay'],False),
('Fetisj','fetisj','Seksuele voorkeur voor een object of handeling','Een fetisj is een sterke seksuele voorkeur voor iets specifieks, zoals voeten, lak en leer of lingerie.','Fetisj & BDSM',['footjob','bdsm','golden-shower'],False),
('Footjob','footjob','Bevrediging met de voeten','Bij een footjob wordt de penis met de voeten gestimuleerd. Populair bij mensen met een voetenfetisj.','Fetisj & BDSM',['fetisj'],False),
('Golden shower','golden-shower','Plasseks','Golden shower (GS) is een fetisj waarbij een partner over de ander plast.','Fetisj & BDSM',['fetisj','bdsm'],False),
('Roleplay','roleplay','Rollenspel','Bij roleplay spelen partners een rol, zoals docent en student of baas en secretaresse.','Ervaringen',['pse','safeword'],False),
('Erotische massage','erotische-massage','Massage met een erotisch karakter','Een erotische massage is een ontspannende massage die eindigt met (of draait om) seksuele opwinding, vaak met een happy ending.','Massage',['happy-ending','body-to-body','tantra'],False),
('Happy ending','happy-ending','Afronding met een orgasme','Een happy ending is het afronden van een massage met een handjob of andere bevrediging.','Massage',['erotische-massage','body-to-body'],False),
('Body-to-body','body-to-body','Massage met het hele lichaam','Bij een body-to-body massage masseert de masseuse je met haar eigen (geoliede) lichaam.','Massage',['erotische-massage','happy-ending'],False),
('Tantra','tantra','Tantramassage','Tantramassage is een langzame, bewuste massage die het hele lichaam stimuleert en energie en ontspanning centraal zet.','Massage',['erotische-massage'],False),
('Swingen','swingen','Partnerruil en seks met andere stellen','Swingers zijn stellen die samen seks hebben met anderen, vaak in een swingersclub of op een swingersfeest.','Begrippen',['trio','cardate'],False),
('Cardate','cardate','Afspraak in de auto','Een cardate is een korte erotische afspraak in de auto. Op Paydates vaak als mogelijkheid met toeslag vermeld.','Paydates',['escort','paydate'],False),
('SOA','soa','Seksueel overdraagbare aandoening','Een soa is een infectie die je via seks kunt oplopen, zoals chlamydia, gonorroe, syfilis of hiv. Condooms verkleinen het risico sterk. Laat je regelmatig testen, bijvoorbeeld bij de GGD.','Gezondheid',['nzc','prep','pmc'],True),
('PrEP','prep','Pre-expositieprofylaxe','PrEP is een pil die het risico op hiv sterk verkleint. Het beschermt niet tegen andere soa’s. Meer informatie krijg je bij de GGD.','Gezondheid',['soa','nzc','bareback'],False),
('Verificatie','verificatie','Gecontroleerd profiel op Paydates','Een geverifieerd profiel heeft het paarse vinkje: Paydates heeft de leeftijd en identiteit van de adverteerder gecontroleerd.','Paydates',['escort','paydate'],False),
('VIP','vip','Uitgelichte advertentie op Paydates','VIP-adverteerders staan bovenaan in hun stad, krijgen een gouden kader en komen in de stories op de homepage.','Paydates',['top','omhoog-plaatsen'],False),
('TOP','top','TOP-plaatsing op Paydates','Een TOP-advertentie staat in de uitgelichte TOP-rij op de homepage en categoriepagina’s.','Paydates',['vip','omhoog-plaatsen'],False),
('Omhoog plaatsen','omhoog-plaatsen','Advertentie weer bovenaan zetten','Met omhoog plaatsen (bump) zet je je advertentie direct weer bovenaan je categorie en stad. Betalen kan met bellen, sms, credits of Bitcoin.','Paydates',['vip','top'],False),
]
BY={t[1]:t for t in T}
HEALTH='<div class="mt-5 rounded-lg border border-[#ffd8a8] bg-[#fff4e6] p-4 text-[13px] text-[#7a4a12]"><b><i class="fa fa-shield-heart mr-1"></i>Gezondheid:</b> bij onbeschermd contact is het risico op soa’s en hiv groter. Gebruik een condoom, maak duidelijke afspraken en laat je regelmatig testen, bijvoorbeeld anoniem en gratis bij de <a href="https://www.ggd.nl" target="_blank" rel="noopener" class="underline">GGD</a>. Meer informatie op <a href="https://www.soaaids.nl" target="_blank" rel="noopener" class="underline">Soa Aids Nederland</a>.</div>'
SITE='https://paydates.nl/woordenboek'
CATS=['Afkortingen','Begrippen','Ervaringen','Standjes','Massage','Fetisj & BDSM','Gezondheid','Paydates']

def term_page(t):
  term,sl,bet,uitleg,cat,rel,health=t
  rels=''.join(f'<a href="woordenboek-{r}.html" class="inline-flex items-center gap-1 rounded-pill bg-[#7351c012] text-pd px-3 py-1 text-[12px] font-semibold hover:bg-[#7351c020]">{E(BY[r][0])}</a>' for r in rel if r in BY)
  ld={"@context":"https://schema.org","@graph":[
    {"@type":"DefinedTerm","name":term,"description":f"{bet}. {uitleg}","url":f"{SITE}/{sl}","inDefinedTermSet":{"@type":"DefinedTermSet","name":"Paydates woordenboek","url":SITE}},
    {"@type":"FAQPage","mainEntity":[{"@type":"Question","name":f"Wat betekent {term}?","acceptedAnswer":{"@type":"Answer","text":f"{term} betekent: {bet}. {uitleg}"}}]},
    {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://paydates.nl/"},{"@type":"ListItem","position":2,"name":"Woordenboek","item":SITE},{"@type":"ListItem","position":3,"name":term,"item":f"{SITE}/{sl}"}]}]}
  others=[x for x in T if x[4]==cat and x[1]!=sl][:8]
  body=f'''<div class="max-w-[1100px] mx-auto px-3 lg:px-6 py-5">{crumbs([('Woordenboek','woordenboek.html'),(term,None)])}
<div class="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-4 mt-3">
<article class="block p-5 sm:p-8 min-w-0">
 <div class="text-[11px] font-bold uppercase tracking-wider text-pd"><i class="fa fa-book-open mr-1"></i>Woordenboek · {E(cat)}</div>
 <h1 class="text-[26px] sm:text-[30px] font-bold text-[#212529] leading-tight mt-1">{E(term)} <span class="text-ink-muted font-semibold text-[18px] sm:text-[20px]">– betekenis</span></h1>
 <div class="mt-4 rounded-lg bg-[#7351c00d] border-l-4 border-pd p-4"><div class="text-[12px] text-ink-muted">{E(term)} betekent</div><div class="text-[18px] font-bold text-[#212529]">{E(bet)}</div></div>
 <div class="prose-pd mt-4"><h2>Wat is {E(term)}?</h2><p>{E(uitleg)}</p>
 <h2>{E(term)} op Paydates</h2><p>Op Paydates.nl zie je bij elke advertentie onder <b>Mogelijkheden</b> welke diensten iemand aanbiedt, eventueel met toeslag. Maak altijd vooraf duidelijke afspraken en respecteer de grenzen van de ander.</p></div>
 {HEALTH if health else ''}
 {f'<h2 class="text-[15px] font-semibold text-[#212529] mt-6 mb-2">Gerelateerde begrippen</h2><div class="flex flex-wrap gap-1.5">{rels}</div>' if rels else ''}
 <div class="mt-6 pt-4 border-t border-line flex flex-wrap gap-2"><a href="woordenboek.html" class="btn btn-ghost !py-2 !text-[13px]"><i class="fa fa-angle-left"></i> Alle begrippen</a><a href="search.html" class="btn btn-pd !py-2 !text-[13px]"><i class="fa fa-magnifying-glass"></i> Zoek een paydate</a></div>
</article>
<aside class="space-y-3"><div class="block"><div class="block-h">Meer in {E(cat)}</div><ul class="p-2">{''.join(f'<li><a href="woordenboek-{x[1]}.html" class="flex justify-between gap-2 px-2 py-1.5 rounded hover:bg-[#7351c010]"><b class="text-[#212529]">{E(x[0])}</b><span class="text-[12px] text-ink-muted truncate">{E(x[2])}</span></a></li>' for x in others)}</ul></div>
<a href="veilig-daten.html" class="block p-4 hover:shadow-pill"><div class="font-semibold text-[#212529]"><i class="fa fa-shield-halved text-pd mr-1"></i>Veilig daten</div><p class="text-[12px] text-ink-muted mt-1">Tips voor een veilige en respectvolle afspraak.</p></a></aside>
</div></div>'''
  extra=f'<link rel="canonical" href="{SITE}/{sl}">\n<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script>'
  return page(f'woordenboek-{sl}.html',f'{term} betekenis: {bet} | Paydates woordenboek',f'Wat betekent {term}? {term} staat voor “{bet}”. {uitleg}'[:158],body,'faq',extra_head=extra)

built=[term_page(t) for t in T]
# index
letters=sorted({t[0][0].upper() if t[0][0].isalpha() else '#' for t in T})
groups=''
for L in letters:
  items=sorted([t for t in T if (t[0][0].upper() if t[0][0].isalpha() else '#')==L],key=lambda t:t[0].lower())
  groups+=f'<section id="l-{L}" class="wb-group scroll-mt-24"><h2 class="text-[18px] font-bold text-pd border-b border-line pb-1 mb-2">{L}</h2><div class="grid sm:grid-cols-2 gap-x-6">'+''.join(f'<a href="woordenboek-{t[1]}.html" data-wb="{E((t[0]+" "+t[2]+" "+t[4]).lower())}" data-cat="{E(t[4])}" class="wb-item flex items-baseline gap-2 py-2 border-b border-line last:border-0 hover:text-pd"><b class="text-[#212529] min-w-[88px]">{E(t[0])}</b><span class="text-ink-muted text-[13px]">{E(t[2])}</span></a>' for t in items)+'</div></section>'
ld={"@context":"https://schema.org","@type":"DefinedTermSet","name":"Paydates woordenboek","url":SITE,"hasDefinedTerm":[{"@type":"DefinedTerm","name":t[0],"description":t[2],"url":f"{SITE}/{t[1]}"} for t in T]}
body=f'''<div class="max-w-[1100px] mx-auto px-3 lg:px-6 py-5">{crumbs([('Woordenboek',None)])}
<div class="hero-bg rounded-lg text-white p-6 sm:p-8 mt-3"><div class="text-[11px] font-bold uppercase tracking-wider text-gold"><i class="fa fa-book-open mr-1"></i>Woordenboek</div>
<h1 class="text-[24px] sm:text-[30px] font-bold leading-tight mt-1">Paydates woordenboek: erotische termen en afkortingen</h1>
<p class="text-white/85 mt-2 max-w-2xl">Wat betekent NZC, GFE of PSE? Hier vind je de betekenis van {len(T)} veelgebruikte begrippen uit escortadvertenties en erotisch jargon, kort en duidelijk uitgelegd.</p>
<div class="relative mt-4 max-w-xl"><i class="fa fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"></i><input id="wbQ" type="search" placeholder="Zoek een term, bijv. NZC" class="inp !pl-10 !text-ink" autocomplete="off"></div></div>
<div class="flex flex-wrap gap-1.5 mt-4" id="wbCats"><button type="button" class="pill px-3 py-1 text-[12px] on" data-c="">Alles</button>{''.join(f'<button type="button" class="pill px-3 py-1 text-[12px]" data-c="{E(c)}">{E(c)}</button>' for c in CATS)}</div>
<nav class="flex flex-wrap gap-1 mt-3 text-[13px] font-semibold">{''.join(f'<a href="#l-{L}" class="w-8 h-8 rounded bg-white shadow-block flex items-center justify-center text-pd hover:bg-pd hover:text-white">{L}</a>' for L in letters)}</nav>
<div class="block p-5 sm:p-7 mt-4 space-y-6" id="wbList">{groups}<p id="wbNone" class="hidden text-ink-muted">Geen begrippen gevonden.</p></div>
<section class="block p-5 mt-3 text-[13px] text-ink-muted"><b class="text-[#212529]">Over dit woordenboek:</b> afkortingen in advertenties zeggen niet automatisch wat iemand aanbiedt. Kijk altijd bij <b>Mogelijkheden</b> op de advertentie en maak vooraf duidelijke afspraken. Lees ook onze tips over <a href="veilig-daten.html" class="text-pd">veilig daten</a>.</section>
</div>'''
sc='''<script>(function(){const q=document.getElementById('wbQ');let cat='';
function f(){const v=q.value.trim().toLowerCase();let any=0;document.querySelectorAll('.wb-item').forEach(a=>{const ok=(!v||a.dataset.wb.includes(v))&&(!cat||a.dataset.cat===cat);a.classList.toggle('hidden',!ok);if(ok)any=1;});
document.querySelectorAll('.wb-group').forEach(g=>g.classList.toggle('hidden',!g.querySelector('.wb-item:not(.hidden)')));document.getElementById('wbNone').classList.toggle('hidden',!!any);}
q.addEventListener('input',f);document.querySelectorAll('#wbCats [data-c]').forEach(b=>b.onclick=()=>{cat=b.dataset.c;document.querySelectorAll('#wbCats [data-c]').forEach(x=>x.classList.toggle('on',x===b));f();});})();</script>'''
built.append(page('woordenboek.html','Woordenboek: betekenis van erotische afkortingen (NZC, GFE, PSE) | Paydates.nl','Wat betekent NZC, PZC, GFE of PSE? Het Paydates woordenboek legt veelgebruikte erotische termen en afkortingen uit escortadvertenties kort en duidelijk uit.',body,'faq',sc,extra_head=f'<link rel="canonical" href="{SITE}">\n<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script>'))
print(len(built),'woordenboek-pagina\'s')
