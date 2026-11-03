#!/usr/bin/env python3
"""Zet de dynamische clubs-hub in seksclubs.html (idempotent).
Bron = assets/clubs-data.js (gegenereerd door clubs_data.py) + beheer via assets/clubs-store.js.
Wordt aangeroepen door seksclubs.py en kan los gedraaid worden: python3 _build/clubs_hub_patch.py"""
import json, re, html, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def venues():
    s=open(os.path.join(ROOT,'assets/clubs-data.js'),encoding='utf-8').read()
    return json.loads(s[s.index('{',s.index('window.PDX_CLUBS_DATA')):].rstrip().rstrip(';'))['venues']
def url(v): return v['page']+'.html' if v.get('page') else 'club.html?id='+v['id']
def block():
    V=[v for v in venues() if v['pub']=='gepubliceerd' and v['type']!='Parenclub']
    V.sort(key=lambda v:(v['prov'] or '',v['city'] or '',v['name']))
    e=html.escape
    li=''.join(f'<li><a href="{e(url(v))}">{e(v["name"])}</a> · {e(v["type"])} · {e(v["city"] or "")}</li>' for v in V)
    return ('<!-- PDX-CLUBS-HUB -->\n    <div id="scHub" aria-live="polite"><noscript><ul class="block p-4 text-[13px] space-y-1">'+li+'</ul></noscript></div>\n    <!-- /PDX-CLUBS-HUB -->\n\n    ')
SCRIPTS='<!-- PDX-CLUBS-JS --><script src="assets/clubs-data.js"></script><script src="assets/clubs-store.js"></script><script src="assets/clubs-hub.js"></script><!-- /PDX-CLUBS-JS -->\n'
def patch(path=None):
    path=path or os.path.join(ROOT,'seksclubs.html'); s=open(path,encoding='utf-8').read()
    if '<!-- PDX-CLUBS-HUB -->' in s:
        s=re.sub(r'<!-- PDX-CLUBS-HUB -->.*?<!-- /PDX-CLUBS-HUB -->\n\n    ',lambda m:block(),s,flags=re.S)
    else:
        a=s.index('<!-- CLUB SPOTLIGHT -->'); b=s.index('<!-- CTA -->'); s=s[:a]+block()+s[b:]
    # oude inline scripts (statische kaarten-filter + uren) vervangen door de hub-scripts
    s=re.sub(r'<!-- PDX-CLUBS-JS -->.*?<!-- /PDX-CLUBS-JS -->\n','',s,flags=re.S)
    s=re.sub(r'<script>\n/\* open/dicht op basis van openingstijden.*?</script>\n','',s,flags=re.S)
    s=re.sub(r"<script>\n\(function\(\)\{var T='',cards=.*?</script>\n",'',s,flags=re.S)
    s=s.replace('<script src="assets/app.js"></script>\n','<script src="assets/app.js"></script>\n'+SCRIPTS,1)
    # CTA: geen sponsorship meer, maar het club-pakket
    s=s.replace('<a href="adverteren.html#banners" class="adc adc-gold','<a href="adverteren.html#bedrijf" class="adc adc-gold')
    s=s.replace('Bovenaan deze pagina en op de homepage','Bovenaan deze pagina en in je provincie')
    s=s.replace('Eén club tegelijk, met eigen beeld en directe link naar je profiel.','Spotlight-pakket: eigen beeld, logo en directe link naar je clubprofiel.')
    s=s.replace('<span class="adbtn shine py-2 mt-4 text-[12px]">Bekijk sponsorship</span>','<span class="adbtn shine py-2 mt-4 text-[12px]">Bekijk pakketten</span>')
    open(path,'w',encoding='utf-8').write(s)
if __name__=='__main__': patch(); print('seksclubs.html: hub gepatcht')
