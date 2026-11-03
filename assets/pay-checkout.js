/* Paydates V2 — credits kopen via online betalen (iDEAL / Wero, Bancontact, Creditcard op een externe betaalpagina).
   Flow (Stefan's create-checkout.php):
     POST {CHECKOUT_URL}  body {product:'credits_eur_50'}  header X-CSRF-Token
     -> {url:'https://<betaalpagina>'}  -> location.assign(url)
   Credits worden pas toegekend nadat de server (callback/webhook) de betaling bevestigt.

   Altijd LIVE: geen simulatie. Betalen POST altijd naar CHECKOUT_URL (standaard 'create-checkout.php').
   Zet je echte create-checkout.php naast de HTML (vervangt de 501-stub) en laat PHP de pagina wrappen zodat
   <meta name="csrf-token" content="<?=$_SESSION['csrf']?>"> gevuld is (of cookie XSRF-TOKEN). */
(function(){
const P=window.PD_PAY=window.PD_PAY||{};
P.CONCEPT=false;P.LIVE=true;
if(!P.CHECKOUT_URL)P.CHECKOUT_URL='create-checkout.php';

/* Product-id's = wat create-checkout.php verwacht. Prijs/credits bepaalt de server, dit is alleen weergave. */
const PRODUCTS=P.PRODUCTS=P.PRODUCTS||{
  credits_eur_50:{credits:500,eur:50,label:'500 credits'},
  credits_eur_100:{credits:1000,eur:100,label:'1.000 credits'},
  credits_eur_150:{credits:1500,eur:150,label:'1.500 credits'},
  credits_eur_200:{credits:2000,eur:200,label:'2.000 credits'},
  credits_eur_250:{credits:2500,eur:250,label:'2.500 credits'},
  credits_eur_300:{credits:3000,eur:300,label:'3.000 credits'},
  credits_eur_350:{credits:3500,eur:350,label:'3.500 credits'},
  credits_eur_400:{credits:4000,eur:400,label:'4.000 credits'},
  credits_eur_450:{credits:4500,eur:450,label:'4.500 credits'},
  credits_eur_500:{credits:5000,eur:500,label:'5.000 credits'}
};
const eur=n=>'€ '+Number(n).toFixed(2).replace('.',',');
P.eur=eur;
const live=()=>true;
P.checkoutLive=live;
function csrf(){
  const m=document.querySelector('meta[name="csrf-token"]');const v=m&&m.content.trim();
  if(v&&!/^__|^\{\{|<\?/.test(v))return v;
  const c=document.cookie.match(/(?:^|;\s*)(?:XSRF-TOKEN|csrf)=([^;]+)/);return c?decodeURIComponent(c[1]):'';
}
/* Statische .html (lege meta): haal het sessie-token op bij csrf-token.php — zelfde PHP-sessie als create-checkout.php. */
if(!P.CSRF_URL)P.CSRF_URL='csrf-token.php';
async function token(){
  const t=csrf();if(t)return t;
  try{const r=await fetch(P.CSRF_URL,{credentials:'same-origin',cache:'no-store'});const j=await r.json();
    if(j&&j.csrf){let m=document.querySelector('meta[name="csrf-token"]');if(!m){m=document.createElement('meta');m.name='csrf-token';document.head.appendChild(m);}m.content=j.csrf;return j.csrf;}}catch(_){}
  return '';
}
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=h=>{if(P.toast)return P.toast(h);const t=document.createElement('div');t.className='toast';t.innerHTML=h;document.body.appendChild(t);setTimeout(()=>t.remove(),3400);};
const BTN='<i class="fa fa-lock"></i> Betalen';

/* Start betaling. o={btn, err} (optioneel). Geeft een Promise. */
async function start(id,o){
  o=o||{};const pr=PRODUCTS[id];const b=o.btn,e=o.err,orig=b&&b.innerHTML;
  if(!pr){if(e)e.textContent='Onbekend creditpakket.';return;}
  if(b){b.disabled=true;b.innerHTML='<i class="fa fa-spinner fa-spin"></i> Betaalverzoek aanmaken…';}
  if(e)e.textContent='';
  try{
    const r=await fetch(P.CHECKOUT_URL,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':await token()},body:JSON.stringify({product:id})});
    const txt=await r.text();let j;
    try{j=JSON.parse(txt)}catch(_){console.error('Server response:',txt);throw new Error(r.status===404?'Betalen is tijdelijk niet beschikbaar (checkout niet gevonden). Probeer het later opnieuw.':'Er ging iets mis bij het starten van de betaling (HTTP '+r.status+'). Probeer het later opnieuw.');}
    if(!r.ok||!j.url)throw new Error(j.error||j.message||(r.status===501?'Online betalen is nog niet geactiveerd. Probeer het later opnieuw.':r.status===403||r.status===419?'Je sessie is verlopen. Ververs de pagina en probeer opnieuw.':'Betaling kon niet worden gestart. Probeer het later opnieuw.'));
    location.assign(j.url);
  }catch(err){
    if(err instanceof TypeError)err=new Error('Geen verbinding met de betaalserver. Controleer je internet en probeer opnieuw.');
    if(e)e.textContent=err.message;else toast(esc(err.message));
    if(b){b.disabled=false;b.innerHTML=orig||BTN;}
  }
}
P.checkoutStart=start;

/* Pagina-binding
   - pakketkeuze: <input type="radio" name="coPack" value="credits_eur_50">  (of [data-co-pack="credits_eur_50"] knoppen)
   - samenvatting: [data-co-sum-label] [data-co-sum-amt] [data-co-sum-total] [data-co-sum-credits]
   - betaalknop:  [data-co-pay] (optioneel data-co-pay="credits_eur_100" voor een vast pakket), foutvak [data-co-err] */
let cur='credits_eur_50';
function select(id){if(!PRODUCTS[id])return;cur=id;const pr=PRODUCTS[id];
  document.querySelectorAll('input[name="coPack"]').forEach(r=>{r.checked=r.value===id;const l=r.closest('label');if(l)l.classList.toggle('on',r.checked);});
  document.querySelectorAll('[data-co-sum-label]').forEach(e=>e.textContent=pr.label);
  document.querySelectorAll('[data-co-sum-amt],[data-co-sum-total]').forEach(e=>e.textContent=eur(pr.eur));
  document.querySelectorAll('[data-co-sum-credits]').forEach(e=>e.textContent=pr.credits.toLocaleString('nl-NL'));
  document.querySelectorAll('[data-co-use]').forEach(e=>{const n=Math.floor(pr.credits/(+e.dataset.coUse||1)),u=e.dataset.coUseU;   // 'Hiermee kun je bijvoorbeeld'
    e.textContent=u==='dagen'?n+(n===1?' dag':' dagen'):u==='weken'?n+(n===1?' week':' weken'):n+'×';});
  document.querySelectorAll('[data-co-sum-eur]').forEach(e=>e.textContent=eur(pr.eur).replace(',00',''));}
P.checkoutSelect=select;
function init(){
  document.addEventListener('change',e=>{if(e.target.name==='coPack')select(e.target.value);});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-co-pay]');if(!b)return;e.preventDefault();
    const root=b.closest('[data-co-checkout]')||document;
    start(b.dataset.coPay||cur,{btn:b,err:root.querySelector('[data-co-err]')});});
  /* Bitcoin: zelfde gekozen pakket, via de sitebrede Bitcoin-flow in pay.js (PD_PAY.open, alleen methode btc) */
  document.addEventListener('click',e=>{const b=e.target.closest('[data-co-btc]');if(!b)return;e.preventDefault();
    const id=PRODUCTS[b.dataset.coBtc]?b.dataset.coBtc:cur,pr=PRODUCTS[id];
    if(!P.open){toast('Bitcoin-betalen is op deze pagina niet beschikbaar.');return;}
    P.open({product:pr.label,amount:eur(pr.eur).replace('€ ',''),eur:pr.eur,id:id,credits:pr.credits,method:'btc',only:'btc'});});
  const q=new URLSearchParams(location.search);
  const pk=q.get('pakket');select(PRODUCTS[pk]?pk:(PRODUCTS['credits_'+pk]?'credits_'+pk:cur));
  if(/^(bitcoin|btc)$/i.test(q.get('betaal')||'')){const bb=document.querySelector('[data-co-btc]');   // ?betaal=bitcoin: Bitcoin-knop uitlichten
    if(bb){bb.classList.add('bk-hl');setTimeout(()=>{bb.scrollIntoView({block:'center',behavior:'smooth'});bb.focus({preventScroll:true});},300);setTimeout(()=>bb.classList.remove('bk-hl'),4000);}}
  const st=q.get('betaling'),box=document.querySelector('[data-co-status]');   // terugkeer-URL na betalen: ?betaling=bevestigen|geannuleerd
  if(st&&box){box.classList.remove('hidden');
    box.innerHTML=st==='geannuleerd'
     ?'<i class="fa fa-circle-xmark text-[#c92a2a] mr-1.5"></i><b>Betaling geannuleerd.</b> Er is niets afgeschreven. Je kunt het hieronder opnieuw proberen.'
     :'<i class="fa fa-circle-check text-[#2f9e44] mr-1.5"></i><b>Bedankt!</b> We controleren je betaling. Je credits verschijnen op je account zodra de betaling is bevestigd.';}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
