/* Paydates V2 — "Omhoog plaatsen" via 0906 (bellen), SMS (3010) of eigen credits. Alleen Nederland (+31).
   Geen Bitcoin/iDEAL/creditcard in deze modal; credits koop je op credits.html.
   Flow: gebruiker betaalt via telefoon/sms, krijgt een code, voert die hier in;
   de site controleert de code via de Paydates-API en plaatst de advertentie bovenaan.
   CONCEPT: verifyCode() is een stub. Zet PD_BUMP.CONCEPT=false en vul API_URL in om te koppelen. */
(function(){
const PD_BUMP={
  CONCEPT:true,
  API_URL:'/api/bump/verify',            // POST {method:'0906'|'sms', code, ad_id} -> {valid:bool, bumped_at?, error?}
  NUMBER_0906:'0906-2020290',
  TARIFF_0906:'tarief volgt',            // TODO: bv. "€ x,xx per gesprek"
  SMS_SHORTCODE:'3010',
  SMS_KEYWORD:'Paydates',
  TARIFF_SMS:'tarief volgt',             // TODO: bv. "€ x,xx per ontvangen sms"
  CREDITS_URL:'/api/bump/credits',       // POST {ad_id} -> {valid:bool, balance?, error?:'saldo'|'login'}
  BALANCE_URL:'/api/credits/balance',    // GET -> {balance:int}
  CREDITS_COST:20,                       // = € 2,00 (100 credits = € 10,00)
  EUR_COST:'2,00',
  CODE_RE:/^[0-9A-Za-z]{4,8}$/
};

/* Stub: doet alsof de Paydates-API wordt aangeroepen. In productie: echte fetch hieronder. */
function bumpWithCredits(adId){
  if(!PD_BUMP.CONCEPT){
    return fetch(PD_BUMP.CREDITS_URL,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',
      body:JSON.stringify({ad_id:adId})}).then(r=>r.json());
  }
  return new Promise(res=>setTimeout(()=>res({valid:true,bumped_at:new Date().toISOString(),concept:true}),700));
}
function verifyCode({method,code,adId}){
  if(!PD_BUMP.CONCEPT){
    return fetch(PD_BUMP.API_URL,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',
      body:JSON.stringify({method,code,ad_id:adId})}).then(r=>r.json());
  }
  return new Promise(res=>setTimeout(()=>{
    // conceptgedrag: formaat-check + vaste testcodes voor de foutmeldingen
    if(code==='0000')return res({valid:false,error:'used'});
    if(code==='1111')return res({valid:false,error:'expired'});
    res({valid:true,bumped_at:new Date().toISOString(),concept:true});
  },900));
}
const ERR={saldo:'Je hebt niet genoeg credits. <a href="credits.html#betalen" class="text-pd font-semibold underline">Credits kopen</a>',login:'Log in om met credits te betalen. <a href="login.html" class="text-pd font-semibold underline">Inloggen</a>',used:'Deze code is al gebruikt.',expired:'Deze code is verlopen. Vraag een nieuwe code aan.',invalid:'Deze code is niet geldig. Controleer de cijfers en probeer het opnieuw.',network:'We konden de code nu niet controleren. Probeer het over een minuut opnieuw.'};

function init(){
  const m=document.getElementById('bumpM');if(!m)return;
  const $=s=>m.querySelector(s);
  let method='0906',adId=null,busy=false;
  m.querySelectorAll('[data-bump-num]').forEach(e=>e.textContent=PD_BUMP.NUMBER_0906);
  m.querySelectorAll('[data-bump-tariff-0906]').forEach(e=>e.textContent=PD_BUMP.TARIFF_0906);
  m.querySelectorAll('[data-bump-tariff-sms]').forEach(e=>e.textContent=PD_BUMP.TARIFF_SMS);
  m.querySelectorAll('[data-bump-sc]').forEach(e=>e.textContent=PD_BUMP.SMS_SHORTCODE);
  m.querySelectorAll('[data-bump-kw]').forEach(e=>e.textContent=PD_BUMP.SMS_KEYWORD.toUpperCase());
  m.querySelectorAll('[data-bump-credits]').forEach(e=>e.textContent=PD_BUMP.CREDITS_COST);
  m.querySelectorAll('[data-bump-eur]').forEach(e=>e.textContent=PD_BUMP.EUR_COST);
  const soonBox=m.querySelector('[data-bump-soon]');
  if(soonBox&&window.PD_PAY)soonBox.innerHTML=PD_PAY.soonChips();
  m.addEventListener('click',e=>{const sb=e.target.closest('[data-pay-soon]');if(!sb)return;e.preventDefault();
    const box=$('#bumpSoonMsg');box.innerHTML='<i class="fa fa-clock mr-1 text-pd"></i><b>'+sb.dataset.paySoon+'</b> is binnenkort beschikbaar. Betaal nu met bellen, sms of credits.';box.classList.remove('hidden');});
  const cBtn=$('#bumpCountry'),cList=$('#bumpCountryList');
  if(cBtn&&cList){cBtn.addEventListener('click',e=>{e.preventDefault();const o=cList.classList.toggle('hidden');cBtn.setAttribute('aria-expanded',!o);});
    m.addEventListener('click',e=>{if(!e.target.closest('#bumpCountry')&&!e.target.closest('#bumpCountryList')){cList.classList.add('hidden');cBtn.setAttribute('aria-expanded','false');}});
    cList.querySelector('[role=option]').addEventListener('click',()=>{cList.classList.add('hidden');cBtn.setAttribute('aria-expanded','false');});}
  if(!PD_BUMP.CONCEPT)fetch(PD_BUMP.BALANCE_URL,{credentials:'same-origin'}).then(r=>r.ok?r.json():null).then(r=>{if(r&&r.balance!=null)$('#bumpBal').textContent=r.balance+' credits';}).catch(()=>{});
  const smsLink=$('#bumpSmsLink');if(smsLink)smsLink.href=`sms:${PD_BUMP.SMS_SHORTCODE}?&body=${encodeURIComponent(PD_BUMP.SMS_KEYWORD)}`;
  function setMethod(k){method=k;m.querySelectorAll('[data-bm]').forEach(b=>{const on=b.dataset.bm===k;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
    m.querySelectorAll('[data-bp]').forEach(p=>p.classList.toggle('hidden',p.dataset.bp!==k));
    $('#bumpCodeRow').classList.toggle('hidden',k==='credits'||k==='btc');{const sm=$('#bumpSoonMsg');if(sm)sm.classList.add('hidden');}msg('');}
  function msg(t,kind){const e=$('#bumpMsg');e.className='text-[12px] mt-2 '+(kind==='err'?'text-[#c92a2a]':'text-ink-muted');e.innerHTML=t;}
  function open(id,name){adId=id;$('#bumpName').textContent=name||'';$('#bumpId').textContent=id;
    $('#bumpForm').classList.remove('hidden');$('#bumpOk').classList.add('hidden');$('#bumpCode').value='';setMethod(method);
    m.classList.remove('hidden');document.body.style.overflow='hidden';if(method==='0906'||method==='sms')setTimeout(()=>$('#bumpCode').focus(),50);}
  function close(){m.classList.add('hidden');document.body.style.overflow='';}
  m.querySelectorAll('[data-bm]').forEach(b=>b.onclick=()=>setMethod(b.dataset.bm));
  m.querySelectorAll('[data-bump-close]').forEach(b=>b.onclick=close);
  m.addEventListener('click',e=>{if(e.target===m)close()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.classList.contains('hidden'))close()});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-bump]');if(!b)return;e.preventDefault();open(+b.dataset.bump,b.dataset.bumpName)});
  function done(r){$('#bumpForm').classList.add('hidden');$('#bumpOk').classList.remove('hidden');
    $('#bumpOkNote').classList.toggle('hidden',!r.concept);
    document.querySelectorAll('[data-bumped-label]').forEach(el=>el.textContent='zojuist');
    document.dispatchEvent(new CustomEvent('pd:bumped',{detail:{adId,method,at:r.bumped_at}}));}
  const cb=$('#bumpCreditsBtn');
  if(cb)cb.onclick=()=>{if(busy)return;busy=true;const h=cb.innerHTML;cb.disabled=true;cb.innerHTML='<i class="fa fa-spinner fa-spin"></i> Bezig…';msg('');
    bumpWithCredits(adId).then(r=>{if(r&&r.valid)done(r);else msg(ERR[r&&r.error]||ERR.network,'err');})
    .catch(()=>msg(ERR.network,'err')).finally(()=>{busy=false;cb.disabled=false;cb.innerHTML=h;});};
  $('#bumpForm').addEventListener('submit',e=>{e.preventDefault();if(busy||method==='credits'||method==='btc')return;
    const code=$('#bumpCode').value.replace(/\s|-/g,'');
    if(!PD_BUMP.CODE_RE.test(code)){msg(ERR.invalid,'err');$('#bumpCode').focus();return;}
    busy=true;const btn=$('#bumpBtn');btn.disabled=true;btn.innerHTML='<i class="fa fa-spinner fa-spin"></i> Code controleren…';msg('');
    verifyCode({method,code,adId}).then(r=>{
      if(r&&r.valid)done(r);
      else msg(ERR[r&&r.error]||ERR.invalid,'err');
    }).catch(()=>msg(ERR.network,'err')).finally(()=>{busy=false;btn.disabled=false;btn.innerHTML='<i class="fa fa-circle-check"></i> Code controleren';});
  });
  const pre=new URLSearchParams(location.search);if(pre.get('omhoog')==='1'){const b=document.querySelector('[data-bump]');if(b)open(+b.dataset.bump,b.dataset.bumpName);}
}
window.PD_BUMP=PD_BUMP;PD_BUMP.verifyCode=verifyCode;PD_BUMP.bumpWithCredits=bumpWithCredits;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
