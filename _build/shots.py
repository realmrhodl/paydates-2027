import asyncio,sys
from playwright.async_api import async_playwright
PAGES=['index.html','vrouwen.html','escort-amsterdam.html','advertentie.html?id=353','videos.html','chatten.html','credits.html','adverteren.html','register.html?type=bedrijf','login.html','search.html','locaties.html','faq.html','blogs.html','blog-interview-icy.html','algemene-voorwaarden.html','account.html','melden.html','agency.html','mannen.html','shemales.html','stellen.html','verificatie.html','contact.html','privacy.html','cookies.html','bedrijfsinformatie.html','veilig-daten.html','404.html','wachtwoord-vergeten.html']
SHOTS={'index.html':'home','vrouwen.html':'categorie','advertentie.html?id=353':'advertentie','chatten.html':'chatten','credits.html':'credits','adverteren.html':'adverteren','blogs.html':'blogs','blog-interview-icy.html':'blogpost','escort-amsterdam.html':'escort-amsterdam','register.html?type=bedrijf':'register'}
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    errs=[]
    for vp,tag in [({'width':1600,'height':1000},'desktop'),({'width':390,'height':844},'mobile')]:
      ctx=await b.new_context(viewport=vp,device_scale_factor=1 if tag=='desktop' else 2)
      await ctx.add_init_script("localStorage.setItem('pd18','1')")
      for u in PAGES:
        if tag=='mobile' and u not in SHOTS: continue
        pg=await ctx.new_page()
        pg.on('pageerror',lambda e,u=u:errs.append((u,str(e))))
        pg.on('console',lambda m,u=u:m.type=='error' and errs.append((u,m.text)))
        await pg.goto('http://localhost:8911/'+u,wait_until='networkidle',timeout=60000)
        await pg.evaluate('async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}scrollTo(0,0)}')
        await pg.wait_for_timeout(800)
        sw=await pg.evaluate('document.documentElement.scrollWidth')
        if sw>vp['width']+1: errs.append((u,f'{tag} horizontale overflow {sw}px'))
        if u in SHOTS: await pg.screenshot(path=f'shots/{tag}-{SHOTS[u]}.png',full_page=(tag=='desktop'))
        await pg.close()
      await ctx.close()
    await b.close()
    for e in errs: print('ERR',e)
    print('klaar, fouten:',len(errs))
asyncio.run(main())
