# Idempotent: zet de SugarDates-sectie in de homepage.
# Gebruikt door build.py na het genereren van index.html, en los aan te roepen.
import os, re

ROOT = os.path.join(os.path.dirname(__file__), '..')
SNIP = os.path.join(os.path.dirname(__file__), 'sugardating_section.html')
BLOCK = re.compile(r'\n?[ \t]*<!-- SUGARDATING -->\s*<section\b[^>]*id="sugardating"[^>]*>.*?</section>\s*', re.S)

def section():
  s = open(SNIP, encoding='utf-8').read().strip()
  return '\n' + s + '\n\n'

def apply_html(html):
  block = section()
  if BLOCK.search(html):
    return BLOCK.sub('\n' + block, html, count=1), 'replaced'
  for marker in (
    '<!-- SEO: POPULAIRE ZOEKOPDRACHTEN -->',
    '<!-- RECHTS 200px sticky ad-rail -->',
    '<!-- FOOTER -->',
  ):
    if marker in html:
      return html.replace(marker, block + marker, 1), 'inserted before ' + marker
  return html, 'missing'

def apply_file(path=None):
  path = path or os.path.join(ROOT, 'index.html')
  html = open(path, encoding='utf-8').read()
  out, how = apply_html(html)
  if out != html:
    open(path, 'w', encoding='utf-8').write(out)
  return how

if __name__ == '__main__':
  print('index.html:', apply_file())
