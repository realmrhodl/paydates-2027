#!/usr/bin/env python3
"""V2-verdienmodel op adverteren.html (idempotent, tussen markers). Draait in all.sh na pages3/pages4.
Model: laagdrempelig instappen (1x omhoog via bellen/SMS, EUR 2), schalen via bundels/auto-omhoog/TOP/VIP,
grootste omzet uit agencies, clubs, banners en sponsorweken. Tarieven zijn concept; beheer in Admin -> Betalingen & tarieven."""
import os,re
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P=os.path.join(R,'adverteren.html')
TIERS='''<!-- PDX-MODEL -->
 <section class="mt-8" id="prijzen"><h2 class="text-[18px] font-bold text-[#212529]">Klein beginnen, groot groeien</h2><p class="text-[13px] text-ink-muted mt-1">Plaatsen is gratis. Je betaalt alleen voor extra zichtbaarheid: vanaf één telefoontje of sms, zonder abonnement.</p>
 <div class="grid md:grid-cols-3 gap-3 mt-3">
  <div class="block p-5"><div class="text-[11px] font-bold tracking-[.16em] text-pd">INSTAP · ZELFSTANDIG</div><div class="text-[22px] font-bold text-[#212529] mt-1">vanaf € 2</div>
   <ul class="text-[13px] space-y-2 mt-3"><li><i class="fa fa-phone text-pd mr-2"></i><b>1× omhoog via bellen of sms</b> · € 2, geen saldo of account-opwaardering nodig</li><li><i class="fa fa-layer-group text-pd mr-2"></i><b>Bundel 10× omhoog</b> · 150 credits (€ 15)</li><li><i class="fa fa-rotate text-pd mr-2"></i><b>Elke dag automatisch omhoog</b> · 15 credits per dag (€ 1,50), stopt wanneer je wilt</li></ul></div>
  <div class="block p-5 ring-2 ring-pd"><div class="text-[11px] font-bold tracking-[.16em] text-pd">GROEIEN · MEER AANVRAGEN</div><div class="text-[22px] font-bold text-[#212529] mt-1">€ 5 – € 30</div>
   <ul class="text-[13px] space-y-2 mt-3"><li><i class="fa fa-star text-pd mr-2"></i><b>TOP-plaatsing</b> · 50 credits per dag (€ 5)</li><li><i class="fa fa-crown text-gold mr-2"></i><b>VIP 7 dagen</b> · 300 credits (€ 30), incl. dagelijkse gratis bump</li><li><i class="fa fa-coins text-gold mr-2"></i><b>Creditbundels</b> vanaf € 50, met bonus bij grotere bundels</li></ul></div>
  <div class="adc adc-gold p-5 flex-col"><div class="text-[11px] font-bold tracking-[.16em] text-gold">BEDRIJVEN · AGENCIES &amp; CLUBS</div><div class="text-[22px] font-bold mt-1">vanaf € 49 / mnd</div>
   <ul class="text-[13px] space-y-2 mt-3 text-white/90"><li><i class="fa fa-users text-gold mr-2"></i><b>Agency-accounts</b> S / M / L · € 99 / € 249 / € 499 per maand</li><li><i class="fa fa-building text-gold mr-2"></i><b>Club Premium of Spotlight</b> · € 49 / € 99 per maand</li><li><i class="fa fa-rectangle-ad text-gold mr-2"></i><b>Banners</b> vanaf € 49 per week · homepage-sponsorweek op aanvraag</li></ul>
   <a href="#bedrijf" class="adbtn shine py-2 mt-4 text-[12px]">Bekijk bedrijfspakketten</a></div>
 </div></section>
<!-- /PDX-MODEL -->
'''
BEDRIJF='''<!-- PDX-BEDRIJF -->
  <section class="block p-5" id="bedrijf"><h2 class="text-[16px] font-bold text-[#212529]"><i class="fa fa-building text-pd mr-1"></i>Voor agencies, clubs &amp; bedrijven</h2><p class="text-[13px] text-ink-muted mt-1">Eén bedrijfsaccount voor al je profielen of je locatie, met één factuur per maand. We controleren KvK &amp; vergunning.</p>
   <table class="w-full text-[13px] mt-3"><thead><tr class="text-left text-ink-muted text-[12px]"><th class="py-1.5">Pakket</th><th>Inhoud</th><th class="text-right">Per maand</th></tr></thead><tbody class="divide-y divide-line">
   <tr><td class="py-2 font-semibold">Agency S</td><td>tot 10 profielen · bedrijfslabel</td><td class="text-right font-semibold">€ 99</td></tr>
   <tr><td class="py-2 font-semibold">Agency M</td><td>tot 30 profielen · 30× omhoog incl.</td><td class="text-right font-semibold">€ 249</td></tr>
   <tr><td class="py-2 font-semibold">Agency L</td><td>onbeperkt · 1 TOP-plek per dag incl.</td><td class="text-right font-semibold">€ 499</td></tr>
   <tr><td class="py-2 font-semibold">Club Basic</td><td>clubprofiel, adres &amp; openingstijden</td><td class="text-right font-semibold">gratis</td></tr>
   <tr><td class="py-2 font-semibold">Club Premium</td><td>foto’s, statistieken, hoger in je provincie</td><td class="text-right font-semibold">€ 49</td></tr>
   <tr><td class="py-2 font-semibold">Club Spotlight</td><td>bovenaan de seksclubs-pagina &amp; je provincie</td><td class="text-right font-semibold">€ 99</td></tr>
   </tbody></table><p class="text-[11px] text-ink-muted mt-2">Prijzen excl. 21% btw. Vermelding op de <a href="agency.html" class="text-pd">Agency</a>- of <a href="seksclubs.html" class="text-pd">Seksclubs</a>-pagina.</p>
   <a href="register.html?type=bedrijf" class="btn btn-pd mt-4 !py-2 !text-[13px]">Bedrijfsaccount aanmaken</a></section>
<!-- /PDX-BEDRIJF -->'''

C=os.path.join(R,'credits.html')
CARDS='<!-- PDX-CR-MODEL --><div class="cr-use"><div class="flex items-center justify-between gap-2"><span class="cr-ic"><i class="fa fa-layer-group"></i></span><span class="cr-cost"><i class="fa fa-coins text-gold"></i> 150</span></div><div class="font-semibold text-[#212529] mt-3">10× omhoog</div><p class="text-[12px] text-ink-muted mt-1 leading-snug">Bundel van tien bumps, zelf in te zetten wanneer je wilt.</p><div class="text-[11px] text-ink-soft mt-2">≈ € 15 (25% voordeel)</div></div><div class="cr-use"><div class="flex items-center justify-between gap-2"><span class="cr-ic"><i class="fa fa-rotate"></i></span><span class="cr-cost"><i class="fa fa-coins text-gold"></i> 15 / dag</span></div><div class="font-semibold text-[#212529] mt-3">Automatisch omhoog</div><p class="text-[12px] text-ink-muted mt-1 leading-snug">Elke dag op jouw tijdstip bovenaan. Stopt vanzelf als je saldo op is.</p><div class="text-[11px] text-ink-soft mt-2">≈ € 1,50 per dag</div></div><!-- /PDX-CR-MODEL -->'
def credits():
    s=open(C,encoding='utf-8').read()
    s=re.sub(r'<!-- PDX-CR-MODEL -->.*?<!-- /PDX-CR-MODEL -->','',s,flags=re.S)
    s=s.replace('Zet je advertentie direct weer bovenaan de lijst.</p>','Zet je advertentie direct weer bovenaan de lijst. Zonder credits: 1× bellen of sms (€ 2).</p>')
    k='<div class="font-semibold text-[#212529] mt-3">Extra video</div>'
    if k not in s or '≈ € 2</div>' not in s[s.find(k):]:
        print('credits.html: Extra video-kaart niet gevonden, overgeslagen'); open(C,'w',encoding='utf-8').write(s); return
    i=s.index(k)
    # einde van de Extra video-kaart: na de laatste div van die kaart
    j=s.index('≈ € 2</div>',i)+len('≈ € 2</div>')
    assert s.startswith('</div>',j); j+=6
    s=s[:j]+CARDS+s[j:]
    open(C,'w',encoding='utf-8').write(s)
def bridge():
    a=os.path.join(R,'advertentie.html');s=open(a,encoding='utf-8').read()
    if 'assets/ad-bridge.js' not in s:
        s=s.replace('<script src="assets/data.js"></script>','<script src="assets/data.js"></script>\n<script src="assets/ad-bridge.js"></script>',1)
        open(a,'w',encoding='utf-8').write(s)
def run():
    bridge()
    credits()
    s=open(P,encoding='utf-8').read()
    s=re.sub(r'<!-- PDX-MODEL -->.*?<!-- /PDX-MODEL -->\n','',s,flags=re.S)
    if '<section class="mt-8" id="betalen">' not in s: print('adverteren.html: #betalen niet gevonden, overgeslagen'); return
    i=s.index('<section class="mt-8" id="betalen">'); i=s.rindex('\n',0,i)+1
    s=s[:i]+TIERS+s[i:]
    if '<!-- PDX-BEDRIJF -->' in s: s=re.sub(r'<!-- PDX-BEDRIJF -->.*?<!-- /PDX-BEDRIJF -->',lambda m:BEDRIJF,s,flags=re.S)
    else: s=re.sub(r'  <section class="block p-5" id="bedrijf">.*?</section>',lambda m:BEDRIJF,s,count=1,flags=re.S)
    s=s.replace('<li><i class="fa fa-check text-pd mr-2"></i>Omhoog plaatsen voor 20 credits (€ 2), of direct via sms/bellen</li>','<li><i class="fa fa-check text-pd mr-2"></i>1× omhoog via bellen of sms voor € 2, of 20 credits</li>')
    open(P,'w',encoding='utf-8').write(s)
if __name__=='__main__': run(); print('adverteren.html: verdienmodel')
