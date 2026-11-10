/* Paydates V2 — betaalkeuze (Nederland).
   Nu beschikbaar: Bellen (0906), SMS (3010), Online betalen (iDEAL / Wero, Bancontact, Creditcard via externe betaalpagina, zie pay-checkout.js), Bitcoin.
   Binnenkort: Bancontact, creditcard (los) — zichtbaar, niet selecteerbaar.
   Live: alle betalingen gaan via de API-endpoints hieronder. Vul het 0906-nummer en de tarieven in. */
(function(){
const PD_PAY=window.PD_PAY=Object.assign({
  VERIFY_URL:'/api/pay/verify',          // POST {method:'0906'|'sms', code, product} -> {valid, credits?, error?}
  BTC_URL:'/api/pay/bitcoin',            // POST {product, product_id?, amount_eur} -> {address, amount_btc, uri, expires_at}
  NUMBER_0906:'0906-2020290',
  TARIFF_0906:'tarief volgt',            // TODO
  SMS_SHORTCODE:'3010',
  SMS_KEYWORD:'PAYDATES',
  TARIFF_SMS:'tarief volgt',             // TODO
  CODE_RE:/^[0-9A-Za-z]{4,8}$/
},window.PD_PAY||{});

const AVAILABLE=[
  {k:'0906',ic:'fa fa-phone',t:'Bellen',s:()=>'via '+PD_PAY.NUMBER_0906,p:'€ 2 = 20 credits',d:'Bel, ontvang een pincode en vul die in.'},
  {k:'sms',ic:'fa fa-comment-sms',t:'SMS',s:()=>PD_PAY.SMS_KEYWORD+' naar '+PD_PAY.SMS_SHORTCODE,p:'€ 2 = 20 credits',d:'Stuur een sms en vul de code in die je terugkrijgt.'},
  {k:'online',ic:'fa fa-building-columns',t:'Online betalen',s:()=>'iDEAL · Wero · kaart',p:'€ 50 – € 500',d:'iDEAL / Wero, Bancontact of Creditcard op een beveiligde betaalpagina.'},
  {k:'btc',ic:'fa-brands fa-bitcoin',t:'Bitcoin',s:()=>'vanaf € 25',p:'€ 25 · € 50 · € 100 · € 250',d:'Bundels vanaf € 25 met bonus-credits, vanuit je eigen wallet.'}
];
const SOON=[];
PD_PAY.AVAILABLE=AVAILABLE;PD_PAY.SOON=SOON;
const soonMsg=n=>`<b>${n}</b> is binnenkort beschikbaar. Betaal nu met bellen, sms, iDEAL / Wero, Bancontact, Creditcard of Bitcoin.`;
PD_PAY.soonMsg=soonMsg;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(h){const t=document.createElement('div');t.className='toast';t.innerHTML=h;document.body.appendChild(t);setTimeout(()=>t.remove(),3400);}
PD_PAY.toast=toast;

/* Chips "Binnenkort" (ook gebruikt door bump.js) */
PD_PAY.soonChips=()=>SOON.map(m=>`<button type="button" data-pay-soon="${esc(m.t)}" class="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line bg-body-light px-2.5 py-1.5 text-[12px] text-ink-soft hover:text-ink-muted"><i class="${m.ic}"></i>${m.t}<span class="text-[9px] font-bold uppercase tracking-wide bg-[#dfe4f1] text-ink-muted rounded px-1.5 py-0.5">Binnenkort</span></button>`).join('');

/* Statisch overzicht voor op een pagina: <div data-pay-methods></div> */
function renderOverview(el){
  el.innerHTML=`<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${AVAILABLE.map(m=>`
   <div class="block p-4 flex items-start gap-3"><span class="w-10 h-10 shrink-0 rounded-full bg-[#7351c017] text-pd flex items-center justify-center text-[16px]"><i class="${m.ic}"></i></span>
    <div class="min-w-0"><div class="font-semibold text-[#212529] flex items-center gap-2">${m.t}<span class="text-[9px] font-bold uppercase tracking-wide bg-[#2f9e4420] text-[#2b8a3e] rounded px-1.5 py-0.5">Direct</span></div>
    <div class="text-[11px] text-pd font-semibold">${esc(m.p||m.s())}</div><p class="text-[12px] text-ink-muted mt-1 leading-snug">${m.d}</p></div></div>`).join('')}</div>
   ${SOON.length?`<div class="flex flex-wrap items-center gap-2 mt-3"><span class="text-[12px] font-semibold text-ink mr-1">Binnenkort:</span>${PD_PAY.soonChips()}</div>`:''}`;
}

/* Modal */
let M,state={method:'0906',product:'',amount:'',eur:null,id:'',credits:0,busy:false,only:null,online:'credits_eur_50'},btcTimer;
function build(){
  M=document.createElement('div');M.id='payM';
  M.className='hidden fixed inset-0 z-[96] bg-black/60 flex items-end sm:items-center justify-center sm:p-4';
  M.setAttribute('role','dialog');M.setAttribute('aria-modal','true');M.setAttribute('aria-labelledby','payT');
  M.innerHTML=`<div class="w-full sm:max-w-[560px] bg-white sm:rounded-lg rounded-t-xl overflow-hidden shadow-2xl max-h-[94vh] overflow-y-auto">
   <div class="bg-pd-header text-white px-5 py-3.5 flex items-center gap-3">
    <span class="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0"><i class="fa fa-lock"></i></span>
    <div class="min-w-0"><h3 id="payT" class="font-semibold text-[15px] leading-tight">Veilig afrekenen</h3><div class="text-[11px] text-white/75 truncate"><span id="payProd"></span> · <b id="payAmt"></b></div></div>
    <button type="button" data-pay-close class="ml-auto text-2xl leading-none w-8 h-8" aria-label="Sluiten">×</button>
   </div>
   <form id="payForm" class="p-5 text-[13px]" novalidate>
    <div id="payPick"><div class="lbl">Kies een betaalmethode</div>
    <div class="grid gap-2 grid-cols-2 sm:grid-cols-4" role="tablist">${AVAILABLE.map(m=>`<button type="button" data-pm="${m.k}" role="tab" class="pill !rounded-lg p-2.5 sm:p-3 text-left"><i class="${m.ic} text-pd"></i> <b class="text-[#212529]">${m.t}</b><div class="text-[10px] sm:text-[11px] font-medium mt-0.5 truncate">${esc(m.s())}</div></button>`).join('')}</div>
    <div class="flex flex-wrap gap-2 mt-2">${PD_PAY.soonChips()}</div></div>
    <div id="paySoon" class="hidden mt-3 rounded-lg border border-[#e4dcf3] bg-[#f3effb] p-3 text-[12px] text-ink" aria-live="polite"></div>

    <div data-pp="0906" class="mt-4 rounded-lg bg-body-light border border-line p-4"><ol class="space-y-2.5">
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span><span>Bel <b class="text-[#212529] text-[15px] tracking-wide">${esc(PD_PAY.NUMBER_0906)}</b></span></li>
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span><span>Je hoort een <b class="text-[#212529]">pincode</b>. Schrijf deze op.</span></li>
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span><span>Vul de pincode hieronder in. Je credits worden direct bijgeschreven.</span></li></ol>
     <div class="text-[11px] text-ink-muted mt-3"><i class="fa fa-circle-info mr-1"></i>Kosten: ${esc(PD_PAY.TARIFF_0906)}. Je betaalt via je telefoonrekening.</div></div>

    <div data-pp="sms" class="hidden mt-4 rounded-lg bg-body-light border border-line p-4"><ol class="space-y-2.5">
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span><span>Stuur <b class="text-[#212529]">${esc(PD_PAY.SMS_KEYWORD)}</b> naar <b class="text-[#212529] text-[15px]">${esc(PD_PAY.SMS_SHORTCODE)}</b></span></li>
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span><span>Je ontvangt binnen enkele seconden een sms met je <b class="text-[#212529]">code</b>.</span></li>
     <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-pd text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span><span>Vul de code hieronder in. Je credits worden direct bijgeschreven.</span></li></ol>
     <a href="sms:${esc(PD_PAY.SMS_SHORTCODE)}?&body=${encodeURIComponent(PD_PAY.SMS_KEYWORD)}" class="sm:hidden btn btn-ghost w-full mt-3 !py-2 !text-[12px]"><i class="fa fa-comment-sms"></i> Open je sms-app</a>
     <div class="text-[11px] text-ink-muted mt-3"><i class="fa fa-circle-info mr-1"></i>Kosten: ${esc(PD_PAY.TARIFF_SMS)}. Je betaalt via je telefoonrekening of beltegoed.</div></div>

    <div data-pp="online" class="hidden mt-4 rounded-lg bg-body-light border border-line p-4">
     <div class="flex items-start gap-3"><span class="w-10 h-10 shrink-0 rounded-full bg-pd text-white flex items-center justify-center text-[16px]"><i class="fa fa-building-columns"></i></span>
     <div><div class="font-semibold text-[#212529]">Online betalen</div><p class="text-[12px] text-ink-muted mt-0.5 leading-snug">Met iDEAL / Wero, Bancontact of Creditcard op een beveiligde betaalpagina. Credits worden bijgeschreven zodra de betaling is bevestigd.</p></div></div>
     <div class="flex justify-between items-center mt-3 pt-3 border-t border-line"><span id="payOnLbl">500 credits</span><b id="payOnAmt" class="text-[#212529] text-[15px]">€ 50,00</b></div>
     <button type="button" id="payOnBtn" class="btn btn-pd w-full mt-3"><i class="fa fa-lock"></i> Betalen</button>
     <div class="text-[11px] text-ink-muted mt-3"><i class="fa fa-file-invoice mr-1"></i>Je krijgt een factuur van Paydates (Forest Road B.V.).</div></div>

    <div data-pp="btc" class="hidden mt-4 rounded-lg bg-body-light border border-line p-4">
     <div class="flex items-start gap-3"><span class="w-10 h-10 shrink-0 rounded-full bg-[#f7931a1f] text-[#f7931a] flex items-center justify-center text-[18px]"><i class="fa-brands fa-bitcoin"></i></span>
     <div><div class="font-semibold text-[#212529]">Betalen met Bitcoin</div><p class="text-[12px] text-ink-muted mt-0.5 leading-snug">Je krijgt een uniek betaaladres en het exacte bedrag in BTC, vastgezet voor 15 minuten. Na 1 bevestiging staan je credits op je account.</p></div></div>
     <div id="payBtcOut" class="mt-3"></div>
     <button type="button" id="payBtcBtn" class="btn btn-pd w-full mt-3"><i class="fa-brands fa-bitcoin"></i> Bitcoin-betaling starten</button>
     <div class="text-[11px] text-ink-muted mt-3"><i class="fa fa-user-secret mr-1"></i>Rechtstreeks vanuit je eigen wallet, zonder tussenkomst van een bank.</div></div>

    <div id="payCodeRow"><label for="payCode" class="lbl mt-4">Pincode / sms-code</label>
    <div class="flex gap-2"><input id="payCode" class="inp text-center tracking-[.3em] font-bold !text-[18px]" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="••••••" aria-describedby="payMsg">
    <button id="payBtn" class="btn btn-pd shrink-0"><i class="fa fa-circle-check"></i> Bevestigen</button></div></div>
    <div id="payMsg" class="text-[12px] mt-2" aria-live="polite"></div>
    <div class="mt-4 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-muted">
     <span></span>
     <span>Hulp nodig? <a href="contact.html?onderwerp=betalen" class="text-pd font-semibold">Contact</a></span></div>
   </form>
   <div id="payOk" class="hidden p-6 text-center">
    <div class="w-14 h-14 mx-auto rounded-full bg-[#2f9e4420] text-[#2f9e44] flex items-center justify-center text-2xl"><i class="fa fa-check"></i></div>
    <h3 class="text-[18px] font-bold text-[#212529] mt-3">Betaling ontvangen</h3>
    <p class="text-ink-muted mt-1 text-[13px]"><span id="payOkProd"></span> staat op je account.</p>

    <div class="flex flex-col sm:flex-row gap-2 justify-center mt-5"><a href="account.html#credits" class="btn btn-pd">Naar mijn account</a><button type="button" data-pay-close class="btn btn-ghost">Sluiten</button></div>
   </div></div>`;
  document.body.appendChild(M);
  const $=s=>M.querySelector(s);
  M.querySelectorAll('[data-pm]').forEach(b=>b.onclick=()=>setMethod(b.dataset.pm));
  M.querySelectorAll('[data-pay-close]').forEach(b=>b.onclick=close);
  M.addEventListener('click',e=>{if(e.target===M)close()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!M.classList.contains('hidden'))close()});
  $('#payForm').addEventListener('submit',submit);
  $('#payBtcBtn').onclick=startBtc;
  $('#payOnBtn').onclick=()=>{if(!PD_PAY.checkoutStart){msg('Online betalen is op deze pagina niet beschikbaar. <a href="credits-kopen.html" class="text-pd font-semibold">Ga naar credits kopen</a>.','err');return;}PD_PAY.checkoutStart(state.online,{btn:$('#payOnBtn'),err:$('#payMsg')});};
}
const $m=s=>M.querySelector(s);
function msg(t,kind){const e=$m('#payMsg');e.className='text-[12px] mt-2 '+(kind==='err'?'text-[#c92a2a]':'text-ink-muted');e.innerHTML=t;}
function setMethod(k){state.method=k;
  M.querySelectorAll('[data-pm]').forEach(b=>{const on=b.dataset.pm===k;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  M.querySelectorAll('[data-pp]').forEach(p=>p.classList.toggle('hidden',p.dataset.pp!==k));
  $m('#payCodeRow').classList.toggle('hidden',k==='btc'||k==='online');$m('#paySoon').classList.add('hidden');msg('');}
function open(o){if(!M)build();
  state.product=o.product||'Credits';state.amount=o.amount||'';state.id=o.id||'';state.credits=+o.credits||0;
  state.eur=o.eur!=null?+o.eur:(parseFloat(String(state.amount).replace(/\./g,'').replace(',','.'))||null);
  clearInterval(btcTimer);$m('#payBtcBtn').classList.remove('hidden');
  $m('#payProd').textContent=state.product;$m('#payAmt').textContent=state.amount?'€ '+state.amount:'';
  const bp=PD_PAY.PRODUCTS||{};state.online=bp[o.online]?o.online:'credits_eur_50';
  if(bp[state.online]){$m('#payOnLbl').textContent=bp[state.online].label;$m('#payOnAmt').textContent=PD_PAY.eur(bp[state.online].eur);}
  $m('#payForm').classList.remove('hidden');$m('#payOk').classList.add('hidden');$m('#payCode').value='';$m('#payBtcOut').innerHTML='';
  const only=o.only?String(o.only).split(','):AVAILABLE.map(m=>m.k);state.only=only;
  M.querySelectorAll('[data-pm]').forEach(b=>b.classList.toggle('hidden',!only.includes(b.dataset.pm)));
  const tl=$m('[role="tablist"]'),n=Math.min(4,only.length);tl.className='grid gap-2 '+(n<2?'grid-cols-1':'grid-cols-2 sm:grid-cols-'+n);
  $m('#payPick').classList.toggle('hidden',only.length<2);$m('#payT').textContent=only.length===1&&only[0]==='btc'?'Betalen met Bitcoin':'Veilig afrekenen';
  setMethod(o.method&&only.includes(o.method)?o.method:only[0]);
  M.classList.remove('hidden');document.body.style.overflow='hidden';}
function close(){M.classList.add('hidden');document.body.style.overflow='';clearInterval(btcTimer);}
const ERR={used:'Deze code is al gebruikt.',expired:'Deze code is verlopen. Vraag een nieuwe code aan.',invalid:'Deze code is niet geldig. Controleer de tekens en probeer het opnieuw.',network:'We konden de betaling nu niet controleren. Probeer het over een minuut opnieuw.',unavailable:'Betalen via deze methode is op dit moment niet beschikbaar.'};
function verify(body){
  return fetch(PD_PAY.VERIFY_URL,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(body)}).then(r=>r.json());
}
function submit(e){e.preventDefault();if(state.busy||state.method==='btc')return;
  const code=$m('#payCode').value.replace(/\s|-/g,'');
  if(!PD_PAY.CODE_RE.test(code)){msg(ERR.invalid,'err');$m('#payCode').focus();return;}
  state.busy=true;const b=$m('#payBtn');b.disabled=true;b.innerHTML='<i class="fa fa-spinner fa-spin"></i> Controleren…';msg('');
  verify({method:state.method,code,product:state.product}).then(r=>{
    if(r&&r.valid){$m('#payForm').classList.add('hidden');$m('#payOk').classList.remove('hidden');$m('#payOkProd').textContent=state.product;
      document.dispatchEvent(new CustomEvent('pd:paid',{detail:{method:state.method,product:state.product}}));}
    else msg(ERR[r&&r.error]||ERR.invalid,'err');
  }).catch(()=>msg(ERR.network,'err')).finally(()=>{state.busy=false;b.disabled=false;b.innerHTML='<i class="fa fa-circle-check"></i> Bevestigen';});
}
function btcBox(r){
  return `<div class="rounded-lg bg-white border border-line p-3 text-[12px] space-y-2.5">
     <div class="flex items-end justify-between gap-2"><div><div class="text-ink-muted">Stuur exact</div><div class="font-bold text-[#212529] text-[16px]">${esc(r.amount_btc)} BTC</div></div><div class="text-right"><div class="text-ink-muted">Vast voor</div><b id="payBtcT" class="text-[#212529] text-[14px] tabular-nums">15:00</b></div></div>
     <div><div class="text-ink-muted">Naar adres</div><div class="flex items-center gap-2"><span id="payBtcAddr" class="font-mono break-all text-[#212529] flex-1">${esc(r.address)}</span><button type="button" id="payBtcCopy" class="text-pd font-semibold shrink-0" aria-label="Adres kopiëren"><i class="fa fa-copy"></i></button></div></div>
     <a href="${esc(r.uri)}" class="btn btn-ghost w-full !py-2 !text-[12px]"><i class="fa fa-wallet"></i> Open in je wallet</a>
     <p class="text-[11px] text-ink-muted"><i class="fa fa-circle-info mr-1"></i>Na 1 bevestiging staan je credits op je account. Je mag dit venster sluiten.</p></div>`;
}
function btcCountdown(until){const t=$m('#payBtcT');clearInterval(btcTimer);
  const tick=()=>{const s=Math.max(0,Math.round((until-Date.now())/1000));if(t)t.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
    if(!s){clearInterval(btcTimer);$m('#payBtcOut').innerHTML=`<div class="text-[12px] text-[#c92a2a]">Het bedrag is verlopen. Start een nieuwe Bitcoin-betaling.</div>`;$m('#payBtcBtn').classList.remove('hidden');}};
  tick();btcTimer=setInterval(tick,1000);}
function btcWire(){const c=$m('#payBtcCopy');if(c)c.onclick=()=>{const a=$m('#payBtcAddr').textContent;(navigator.clipboard?navigator.clipboard.writeText(a):Promise.reject()).then(()=>toast('Adres gekopieerd')).catch(()=>{});};}
function startBtc(){
  const out=$m('#payBtcOut'),b=$m('#payBtcBtn');
  b.disabled=true;b.innerHTML='<i class="fa fa-spinner fa-spin"></i> Betaaladres aanmaken…';
  fetch(PD_PAY.BTC_URL,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({product:state.id||state.product,amount_eur:state.eur!=null?state.eur:state.amount})})
   .then(r=>r.json()).then(r=>{if(!r||!r.address)throw new Error('btc');
    out.innerHTML=btcBox(r);b.classList.add('hidden');btcWire();
    const exp=r.expires_at?(typeof r.expires_at==='number'?(r.expires_at<1e12?r.expires_at*1000:r.expires_at):Date.parse(r.expires_at)):Date.now()+15*60e3;btcCountdown(exp);})
   .catch(()=>out.innerHTML=`<div class="text-[12px] text-[#c92a2a]">${ERR.network}</div>`)
   .finally(()=>{b.disabled=false;b.innerHTML='<i class="fa-brands fa-bitcoin"></i> Bitcoin-betaling starten';});
}
PD_PAY.open=open;

function init(){
  document.querySelectorAll('[data-pay-methods]').forEach(renderOverview);
  document.addEventListener('click',e=>{
    const s=e.target.closest('[data-pay-soon]');
    if(s){e.preventDefault();const box=s.closest('#payM')&&M.querySelector('#paySoon');
      if(box){box.innerHTML='<i class="fa fa-clock mr-1 text-pd"></i>'+soonMsg(esc(s.dataset.paySoon));box.classList.remove('hidden');}
      else if(!s.closest('#bumpM'))toast(soonMsg(esc(s.dataset.paySoon)));return;}
    const p=e.target.closest('[data-pay]');
    if(p){e.preventDefault();open({product:p.dataset.payProduct,amount:p.dataset.payAmount,method:p.dataset.payMethod,only:p.dataset.payOnly,online:p.dataset.payOnline});}
  });
  const q=new URLSearchParams(location.search),b=q.get('bundel');
  if(b){const el=document.querySelector(`[data-pay][data-pay-bundle="${CSS.escape(b)}"]`);if(el)open({product:el.dataset.payProduct,amount:el.dataset.payAmount,method:q.get('betaal')||undefined,only:el.dataset.payOnly,online:el.dataset.payOnline});}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
