/* Paydates V2 — "Omhoog plaatsen" via 0906 (bellen), SMS (3010), credits of Bitcoin.
   Bellen en sms alleen in Nederland (+31). Buiten NL: credits of Bitcoin.
   Flow 0906/sms: gebruiker betaalt via telefoon, krijgt een code, voert die hier in;
   de site controleert de code via de Paydates-API en plaatst de advertentie bovenaan.
   Bitcoin: toont een betaalscherm; adres en BTC-bedrag verschijnen bij het starten van de betaling. */
(function(){
const PD_BUMP={
  CONCEPT:true,
  API_URL:'/api/bump/verify',
  NUMBER_0906:'0906-2020290',
  TARIFF_0906:'tarief volgt',
  SMS_SHORTCODE:'3010',
  SMS_KEYWORD:'Paydates',
  TARIFF_SMS:'tarief volgt',
  CREDITS_URL:'/api/bump/credits',
  BALANCE_URL:'/api/credits/balance',
  BTC_URL:'/api/bump/bitcoin',
  CREDITS_COST:20,
  EUR_COST:'2,00',
  CODE_RE:/^[0-9A-Za-z]{4,8}$/,
  COUNTRIES:[
    {k:'NL',name:'Nederland',dial:'+31',flag:'🇳🇱'},
    {k:'BE',name:'België',dial:'+32',flag:'🇧🇪'},
    {k:'DE',name:'Duitsland',dial:'+49',flag:'🇩🇪'},
    {k:'FR',name:'Frankrijk',dial:'+33',flag:'🇫🇷'},
    {k:'ES',name:'Spanje',dial:'+34',flag:'🇪🇸'},
    {k:'GB',name:'Verenigd Koninkrijk',dial:'+44',flag:'🇬🇧'},
    {k:'US',name:'Verenigde Staten',dial:'+1',flag:'🇺🇸'},
    {k:'OTHER',name:'Ander land',dial:'',flag:'🌍'}
  ]
};

function bumpWithCredits(adId){
  if(!PD_BUMP.CONCEPT){
    return fetch(PD_BUMP.CREDITS_URL,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',
      body:JSON.stringify({ad_id:adId})}).then(r=>r.json());
  }
  return new Promise(res=>setTimeout(()=>res({valid:true,bumped_at:new Date().toISOString()}),700));
}
function verifyCode({method,code,adId}){
  if(!PD_BUMP.CONCEPT){
    return fetch(PD_BUMP.API_URL,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',
      body:JSON.stringify({method,code,ad_id:adId})}).then(r=>r.json());
  }
  return new Promise(res=>setTimeout(()=>{
    if(code==='0000')return res({valid:false,error:'used'});
    if(code==='1111')return res({valid:false,error:'expired'});
    res({valid:true,bumped_at:new Date().toISOString()});
  },900));
}
const ERR={saldo:'Je hebt niet genoeg credits. <a href="credits.html#betalen" class="text-pd font-semibold underline">Credits kopen</a>',login:'Log in om met credits te betalen. <a href="login.html" class="text-pd font-semibold underline">Inloggen</a>',used:'Deze code is al gebruikt.',expired:'Deze code is verlopen. Vraag een nieuwe code aan.',invalid:'Deze code is niet geldig. Controleer de cijfers en probeer het opnieuw.',network:'We konden de code nu niet controleren. Probeer het over een minuut opnieuw.'};

function countryFromAd(ad){
  if(window.PD&&PD.bumpCountry)return PD.bumpCountry(ad);
  return 'NL';
}
function isNl(ad){return countryFromAd(ad)==='NL';}
function findAd(id){
  const L=(window.PD&&PD.D&&PD.D.L)||[];
  let a=L.find(x=>x.id==id);
  if(a)return a;
  try{
    if(window.PDX&&PDX.db){
      const d=PDX.db();
      a=(d.ads||[]).find(x=>x.id===id||x.listingId==id);
      if(a)return a;
    }
  }catch(e){}
  return null;
}
function countryLabel(k){return PD_BUMP.COUNTRIES.find(c=>c.k===k)||PD_BUMP.COUNTRIES[PD_BUMP.COUNTRIES.length-1];}

function init(){
  const m=document.getElementById('bumpM');if(!m)return;
  const $=s=>m.querySelector(s);
  let method='0906',adId=null,busy=false,country='NL';
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
    const box=$('#bumpSoonMsg');if(!box)return;
    const nl=country==='NL';
    box.innerHTML='<i class="fa fa-clock mr-1 text-pd"></i><b>'+sb.dataset.paySoon+'</b> is binnenkort beschikbaar. '+(nl?'Betaal nu met bellen, sms, credits of Bitcoin.':'Betaal nu met credits of Bitcoin.');
    box.classList.remove('hidden');});

  const cBtn=$('#bumpCountry'),cList=$('#bumpCountryList');
  function renderCountry(){
    const c=countryLabel(country);
    if(cBtn){cBtn.innerHTML=`<span class="text-[16px] leading-none" aria-hidden="true">${c.flag}</span>${c.name} ${c.dial?`<span class="text-ink-muted font-normal">${c.dial}</span>`:''}<i class="fa fa-angle-down text-[11px] text-ink-muted ml-1"></i>`;}
    if(cList){cList.innerHTML=PD_BUMP.COUNTRIES.map(x=>`<li role="option" data-cc="${x.k}" aria-selected="${x.k===country}" class="flex items-center gap-2 px-3 py-2 cursor-pointer ${x.k===country?'bg-[#7351c010] font-semibold':''} hover:bg-[#7351c010]"><span class="text-[16px] leading-none" aria-hidden="true">${x.flag}</span>${x.name} ${x.dial?`<span class="text-ink-muted font-normal">${x.dial}</span>`:''}${x.k===country?'<i class="fa fa-check text-pd ml-auto"></i>':''}</li>`).join('');}
    const nl=country==='NL';
    const intro=$('#bumpIntro');
    if(intro)intro.innerHTML=nl
      ?'Je advertentie komt direct weer <b class="text-[#212529]">bovenaan</b> in je categorie en je stad. Kies hoe je betaalt: bellen, sms, credits of Bitcoin.'
      :'Je advertentie komt direct weer <b class="text-[#212529]">bovenaan</b> in je categorie en je stad. Bellen en sms zijn alleen beschikbaar in Nederland. Kies credits of Bitcoin.';
    const hint=$('#bumpCountryHint');
    if(hint)hint.textContent=nl?'Bellen & sms alleen met een Nederlands nummer':'Bellen en sms zijn in dit land niet beschikbaar.';
    m.querySelectorAll('[data-bm="0906"],[data-bm="sms"]').forEach(b=>b.classList.toggle('hidden',!nl));
    const tabs=$('#bumpTabs');
    if(tabs){tabs.classList.toggle('grid-cols-3',nl);tabs.classList.toggle('sm:grid-cols-4',nl);tabs.classList.toggle('grid-cols-2',!nl);}
    if(!nl && (method==='0906'||method==='sms')) setMethod('credits');
    else setMethod(method);
  }
  function setCountry(k){country=k||'NL';renderCountry();if(cList){cList.classList.add('hidden');}if(cBtn)cBtn.setAttribute('aria-expanded','false');}

  if(cBtn&&cList){cBtn.addEventListener('click',e=>{e.preventDefault();const o=cList.classList.toggle('hidden');cBtn.setAttribute('aria-expanded',!o);});
    m.addEventListener('click',e=>{if(!e.target.closest('#bumpCountry')&&!e.target.closest('#bumpCountryList')){cList.classList.add('hidden');cBtn.setAttribute('aria-expanded','false');}});
    cList.addEventListener('click',e=>{const li=e.target.closest('[data-cc]');if(!li)return;e.preventDefault();setCountry(li.dataset.cc);});}

  if(!PD_BUMP.CONCEPT)fetch(PD_BUMP.BALANCE_URL,{credentials:'same-origin'}).then(r=>r.ok?r.json():null).then(r=>{if(r&&r.balance!=null)$('#bumpBal').textContent=r.balance+' credits';}).catch(()=>{});
  const smsLink=$('#bumpSmsLink');if(smsLink)smsLink.href=`sms:${PD_BUMP.SMS_SHORTCODE}?&body=${encodeURIComponent(PD_BUMP.SMS_KEYWORD)}`;
  function setMethod(k){
    const nl=country==='NL';
    if(!nl && (k==='0906'||k==='sms'))k='credits';
    method=k;
    m.querySelectorAll('[data-bm]').forEach(b=>{const on=b.dataset.bm===k;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
    m.querySelectorAll('[data-bp]').forEach(p=>p.classList.toggle('hidden',p.dataset.bp!==k));
    const codeRow=$('#bumpCodeRow');if(codeRow)codeRow.classList.toggle('hidden',k==='credits'||k==='btc');
    const sm=$('#bumpSoonMsg');if(sm)sm.classList.add('hidden');
    const btcOut=$('#bumpBtcOut');if(btcOut)btcOut.classList.add('hidden');
    msg('');
  }
  function msg(t,kind){const e=$('#bumpMsg');if(!e)return;e.className='text-[12px] mt-2 '+(kind==='err'?'text-[#c92a2a]':'text-ink-muted');e.innerHTML=t;}
  function open(id,name){adId=id;$('#bumpName').textContent=name||'';$('#bumpId').textContent=id;
    $('#bumpForm').classList.remove('hidden');$('#bumpOk').classList.add('hidden');$('#bumpCode').value='';
    const ad=findAd(id);country=countryFromAd(ad);
    method=country==='NL'?'0906':'credits';
    renderCountry();
    m.classList.remove('hidden');document.body.style.overflow='hidden';if(method==='0906'||method==='sms')setTimeout(()=>$('#bumpCode').focus(),50);}
  function close(){m.classList.add('hidden');document.body.style.overflow='';}
  m.querySelectorAll('[data-bm]').forEach(b=>b.onclick=()=>setMethod(b.dataset.bm));
  m.querySelectorAll('[data-bump-close]').forEach(b=>b.onclick=close);
  m.addEventListener('click',e=>{if(e.target===m)close()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.classList.contains('hidden'))close()});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-bump]');if(!b)return;e.preventDefault();open(+b.dataset.bump,b.dataset.bumpName)});
  function done(r){$('#bumpForm').classList.add('hidden');$('#bumpOk').classList.remove('hidden');
    var n=$('#bumpOkNote');if(n)n.classList.add('hidden');
    const okP=$('#bumpOk p');
    if(okP){okP.textContent=method==='credits'?'Je credits zijn verrekend. Bezoekers zien je advertentie nu als eerste in je categorie en stad.':'Bezoekers zien je advertentie nu als eerste in je categorie en stad.';}
    document.querySelectorAll('[data-bumped-label]').forEach(el=>el.textContent='zojuist');
    document.dispatchEvent(new CustomEvent('pd:bumped',{detail:{adId,method,at:r&&r.bumped_at}}));}
  const cb=$('#bumpCreditsBtn');
  if(cb)cb.onclick=()=>{if(busy)return;busy=true;const h=cb.innerHTML;cb.disabled=true;cb.innerHTML='<i class="fa fa-spinner fa-spin"></i> Bezig…';msg('');
    bumpWithCredits(adId).then(r=>{if(r&&r.valid)done(r);else msg(ERR[r&&r.error]||ERR.network,'err');})
    .catch(()=>msg(ERR.network,'err')).finally(()=>{busy=false;cb.disabled=false;cb.innerHTML=h;});};
  const bb=$('#bumpBtcBtn'),btcOut=$('#bumpBtcOut');
  if(bb)bb.onclick=()=>{if(busy)return;busy=true;const h=bb.innerHTML;bb.disabled=true;bb.innerHTML='<i class="fa fa-spinner fa-spin"></i> Betaling voorbereiden…';msg('');
    const finish=html=>{if(btcOut){btcOut.innerHTML=html;btcOut.classList.remove('hidden');}busy=false;bb.disabled=false;bb.innerHTML=h;};
    if(!PD_BUMP.CONCEPT){
      fetch(PD_BUMP.BTC_URL,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({ad_id:adId})})
        .then(r=>r.json()).then(r=>{
          if(r&&r.address&&r.btc){
            finish(`<div class="font-semibold text-[#212529] mb-1">Betaal naar dit adres</div>
              <div class="font-mono text-[12px] break-all text-[#212529]">${String(r.address).replace(/[<>&]/g,'')}</div>
              <div class="mt-2 text-[12px] text-ink-muted">Bedrag: <b class="text-[#212529]">${String(r.btc).replace(/[<>&]/g,'')} BTC</b> (€ ${PD_BUMP.EUR_COST})</div>`);
          }else{
            finish('Het Bitcoin-adres en het bedrag in BTC verschijnen hier zodra de betaling beschikbaar is. Je kunt in de tussentijd ook omhoog plaatsen met credits.');
          }
        }).catch(()=>{finish('De Bitcoin-betaling kon nu niet worden gestart. Probeer het later opnieuw, of plaats omhoog met credits.');});
      return;
    }
    setTimeout(()=>{
      finish('Het Bitcoin-adres en het exacte bedrag in BTC verschijnen hier zodra de betaling beschikbaar is, tegen de koers op dat moment. Je advertentie gaat omhoog nadat de betaling is ontvangen. Je kunt ook omhoog plaatsen met credits.');
    },700);
  };
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
  renderCountry();
}
window.PD_BUMP=PD_BUMP;PD_BUMP.verifyCode=verifyCode;PD_BUMP.bumpWithCredits=bumpWithCredits;PD_BUMP.countryFromAd=countryFromAd;PD_BUMP.isNl=isNl;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
