#!/usr/bin/env python3
"""Maakt club.html (generieke clubpagina, club.html?id=<slug>) uit de shell van een bestaande detailpagina.
Draai na seksclubs.py: python3 _build/club_page.py"""
import os,re
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s=open(os.path.join(R,'seksclub-club-noir-amsterdam.html'),encoding='utf-8').read()
a=s.index('<div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-4">\n  <nav class="crumbs');b=s.index('<!-- FOOTER -->')
s=s[:a]+'<div class="max-w-[1920px] mx-auto px-3 lg:px-6 py-4" id="clubPage"><noscript><p class="block p-6 text-[13px]">JavaScript is nodig om dit clubprofiel te tonen. <a href="seksclubs.html">Alle seksclubs &amp; privéhuizen</a></p></noscript></div>\n'+s[b:]
s=re.sub(r'<title>.*?</title>','<title>Seksclub of privéhuis | Paydates.nl</title>',s)
s=s.replace('Club Noir Amsterdam – seksclub','Clubprofiel').replace('Club Noir, seksclub in Amsterdam: faciliteiten, openingstijden en contact op Paydates.nl.','Clubprofiel op Paydates.nl: adres, openingstijden en contact.')
s=s.replace('https://paydates.nl/seksclub-club-noir-amsterdam.html','https://paydates.nl/club.html')
s=re.sub(r'<script type="application/ld\+json">.*?</script>\n?','',s,flags=re.S)
s=re.sub(r'<script src="assets/pdx.js"></script><script>\(function\(\)\{var p=location.pathname.*?</script>\n','',s,flags=re.S)
s=re.sub(r'<script>\n/\* open/dicht op basis van openingstijden.*?</script>\n','',s,flags=re.S)
s=s.replace('<script src="assets/app.js"></script>\n','<script src="assets/app.js"></script>\n<script src="assets/pdx.js"></script><script src="assets/clubs-data.js"></script><script src="assets/clubs-store.js"></script><script src="assets/club-page.js"></script>\n',1)
open(os.path.join(R,'club.html'),'w',encoding='utf-8').write(s);print('club.html')
