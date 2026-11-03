/* Paydates V2 — ingelogde header (concept). Wordt door app.js op elke publieke pagina geladen.
   Ingelogd (localStorage 'pdx_session' + 'pdx_v1'):
   - header: creditsaldo (klik → credits.html), Dashboard/Account, Uitloggen
   - publieke topnav (Vrouwen, Chatten, …) blijft altijd staan
   - op account-pagina's: dunne accountbalk ónder het hoofdmenu
   - mobiel menu: blok "Mijn account" bovenaan. Niet ingelogd: niets verandert. */
(function(){
'use strict';
if(window.PDX_HEADER)return;
const ACC_PAGES=['dashboard','mijn-advertenties','advertentie-plaatsen','credits','credits-kopen','kyc','account','bedrijf-claimen','factuur'];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const page=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
function user(){try{const s=JSON.parse(localStorage.getItem('pdx_session')||'null');if(!s)return null;const d=JSON.parse(localStorage.getItem('pdx_v1')||'null');return d&&d.users?d.users.find(u=>u.id===s.id)||null:null;}catch(e){return null}}
const isAdmin=u=>u.role==='admin'||u.role==='moderator';
const home=u=>isAdmin(u)?'admin/index.html':(u.role==='klant'?'account.html':'dashboard.html');
const nl=n=>Number(n||0).toLocaleString('nl-NL');
function items(u){
  const L=[['dashboard','dashboard.html','fa-gauge','Dashboard'],['mijn-advertenties','mijn-advertenties.html','fa-rectangle-list','Mijn ads'],['advertentie-plaatsen','advertentie-plaatsen.html','fa-plus','Plaatsen'],['credits','credits.html','fa-coins','Credits'],['kyc','kyc.html','fa-id-card','KYC'],['account','account.html','fa-circle-user','Account']];
  if(u.role==='klant'){L.splice(0,3);L.unshift(['account','account.html','fa-circle-user','Account']);L.pop();}
  if(u.role==='bedrijf')L.splice(5,0,['bedrijf-claimen','bedrijf-claimen.html','fa-building','Bedrijf claimen']);
  if(isAdmin(u))L.push(['admin','admin/index.html','fa-user-shield','Admin']);
  return L;
}
function logout(e){if(e)e.preventDefault();try{if(window.PDX&&PDX.logout)PDX.logout();else localStorage.removeItem('pdx_session');}catch(x){localStorage.removeItem('pdx_session');}location.href='login.html';}
let done=false;
function apply(){
  const u=user(); if(!u)return; const cr=nl(u.credits);
  const hnav=document.querySelector('header nav[aria-label="Account"]');
  if(hnav){
    let c=hnav.querySelector('a[href="credits.html"]');
    if(c){c.className='flex flex-col items-center px-1.5 sm:px-2 py-1 rounded hover:bg-white/10 pdx-hcred';c.title='Je saldo: '+cr+' credits · klik om credits te kopen';c.setAttribute('aria-label','Saldo '+cr+' credits, credits kopen');
      c.innerHTML=`<i class="fa fa-coins text-[14px] mb-0.5 text-gold"></i><span><b data-pdx-credits>${cr}</b><span class="hidden sm:inline"> credits</span></span>`;}
    const li=[...hnav.querySelectorAll('a')].find(a=>a.querySelector('.fa-right-to-bracket,.fa-circle-user')&&a!==c);
    if(li){li.href=home(u);li.title='Ingelogd als '+u.username;li.innerHTML=`<i class="fa fa-circle-user text-[14px] mb-0.5"></i><span class="max-w-[88px] truncate">${esc(isAdmin(u)?'Admin':(u.role==='klant'?'Account':'Dashboard'))}</span>`;}
    const rg=[...hnav.querySelectorAll('a')].find(a=>a.querySelector('.fa-user-plus'));
    if(rg){rg.href='login.html';rg.innerHTML='<i class="fa fa-right-from-bracket text-[14px] mb-0.5"></i><span>Uitloggen</span>';rg.addEventListener('click',logout);}
  }
  // Accountsubnav onder het publieke hoofdmenu (hoofdmenu blijft Vrouwen/Chatten/…)
  if(ACC_PAGES.includes(page) && !document.querySelector('[data-pdx-accbar]')){
    const main=document.querySelector('nav[aria-label="Hoofdmenu"]');
    const wrap=main&&main.parentElement;
    if(wrap){
      const act=page==='credits-kopen'?'credits':page;
      const bar=document.createElement('div');
      bar.setAttribute('data-pdx-accbar','');
      bar.className='border-t border-[#e9ecef] bg-[#f8f9fb]';
      bar.innerHTML=`<div class="max-w-[1400px] mx-auto px-3 lg:px-6 flex flex-wrap items-center gap-x-1 gap-y-1 py-1.5 text-[12.5px]">
        <span class="hidden sm:inline text-ink-soft mr-1.5"><i class="fa fa-circle-user text-pd mr-1"></i>${esc(u.username)}</span>
        ${items(u).map(i=>`<a href="${i[1]}" class="px-2.5 py-1 rounded-full font-semibold ${i[0]===act?'bg-[#7351c0] text-white':'text-ink-muted hover:bg-[#7351c017] hover:text-pd'}">${i[3]}${i[0]==='credits'?` <b class="font-bold" data-pdx-credits>${cr}</b>`:''}</a>`).join('')}
        <a href="#" class="px-2.5 py-1 rounded-full font-semibold text-[#c92a2a] hover:bg-[#c92a2a14] ml-auto" data-pdx-logout><i class="fa fa-right-from-bracket mr-1"></i>Uitloggen</a>
      </div>`;
      wrap.insertAdjacentElement('afterend', bar);
      bar.querySelector('[data-pdx-logout]').addEventListener('click',logout);
      document.documentElement.classList.add('pdx-acc-nav');
    }
  }
  // mobiel menu: accountblok bovenaan, daarna gewoon Ontdekken/publiek
  const dr=document.querySelector('#pdDrawer nav');
  if(dr&&!dr.querySelector('[data-pdx-accblock]')){
    const b=document.createElement('div');b.setAttribute('data-pdx-accblock','');b.className='grid gap-0.5';
    b.innerHTML=`<div class="px-3 pt-1 pb-1 text-[10.5px] font-bold uppercase tracking-[.12em] text-ink-soft">Mijn account · ${esc(u.username)}</div>`+
      items(u).map(i=>`<a href="${i[1]}" class="px-3 py-2.5 rounded hover:bg-[#7351c017]${i[0]===page?' text-pd bg-[#7351c017]':''}"><i class="fa ${i[2]} w-4 mr-2 text-pd text-center"></i>${i[3]}${i[0]==='credits'?` <b class="ml-1 text-pd" data-pdx-credits>${cr}</b>`:''}</a>`).join('')+
      `<a href="#" class="px-3 py-2.5 rounded hover:bg-[#c92a2a14] text-[#c92a2a]" data-pdx-logout><i class="fa fa-right-from-bracket w-4 mr-2 text-center"></i>Uitloggen</a>`+
      `<div class="px-3 pt-4 pb-1 text-[10.5px] font-bold uppercase tracking-[.12em] text-ink-soft">Ontdekken</div>`;
    dr.insertBefore(b,dr.firstChild);
    b.querySelector('[data-pdx-logout]').addEventListener('click',logout);
    const g=document.querySelector('#pdDrawer .grid.grid-cols-2');
    if(g)g.innerHTML=`<a href="${home(u)}" class="btn btn-ghost">Dashboard</a><a href="login.html" class="btn btn-ghost" data-pdx-logout>Uitloggen</a>`,g.querySelector('[data-pdx-logout]').addEventListener('click',logout);
  }
  done=true;
}
function refresh(){const u=user();if(!u){if(done)location.reload();return;}document.querySelectorAll('[data-pdx-credits]').forEach(el=>el.textContent=nl(u.credits));}
window.PDX_HEADER={apply,refresh};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
window.addEventListener('pdx:save',refresh);
window.addEventListener('storage',e=>{if(e.key==='pdx_v1'||e.key==='pdx_session')refresh();});
})();
