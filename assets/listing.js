/* Paydates V2 — overzichtspagina's (categorie, stad, zoeken, agency) */
(function(){
const {$,$$,esc,D,grid}=PD;
const P=Object.assign({g:'',city:'',type:'',prov:'',lockG:false,lockCity:false},window.PD_PRESET||{});
const u=new URLSearchParams(location.search);
const one=k=>{const v=u.get(k)||'';return v.includes(',')?'':(k==='type'&&window.PD_ADV&&PD_ADV.TYPE[v])||v;};
const st={q:u.get('q')||'',g:one('g')||P.g,city:u.get('city')||P.city,type:one('type')||P.type,ageMin:+(u.get('min')||18),ageMax:+(u.get('max')||99),
  priceMax:+(u.get('pmax')||0),flags:new Set((u.get('f')||'').split(',').filter(Boolean)),svc:new Set((u.get('s')||'').split('|').filter(Boolean)),sort:u.get('sort')||'rec',lang:one('lang')};
const ADV=window.PD_ADV&&PD_ADV.active(u)?PD_ADV:null;
const PROV=D.CITYPROV||{};
function match(x,ignoreCity){
  const hay=(x.n+' '+x.s+' '+x.c+' '+x.t+' '+(x.desc||'')+' '+(x.kenm||[]).map(k=>k[1]).join(' ')+' '+(x.mog||[]).map(m=>m[0]).join(' ')).toLowerCase();
  return (!st.q||hay.includes(st.q.toLowerCase()))&&(!st.g||x.g===st.g)&&(!st.type||x.t===st.type)
   &&(ignoreCity||!st.city||x.c===st.city)&&(!P.prov||PROV[x.c]===P.prov)
   &&(!x.a||(x.a>=st.ageMin&&x.a<=st.ageMax))&&(!st.priceMax||(x.p&&x.p<=st.priceMax))
   &&(!st.flags.has('verified')||x.v)&&(!st.flags.has('video')||x.vid)&&(!st.flags.has('price')||x.p)&&(!st.flags.has('now')||x.now)
   &&(!st.lang||(x.langs||[]).includes(st.lang))
   &&[...st.svc].every(s=>(x.mog||[]).some(m=>m[0].toLowerCase()===s.toLowerCase()))
   &&(!ADV||ADV.match(x,u));
}
function sortL(r){
  if(st.sort==='new')r.sort((a,b)=>b.id-a.id);
  else if(st.sort==='plo')r.sort((a,b)=>(a.p||1e9)-(b.p||1e9));
  else if(st.sort==='phi')r.sort((a,b)=>(b.p||0)-(a.p||0));
  else r.sort((a,b)=>(b.vip-a.vip)||(b.top-a.top)||(b.v-a.v)||(b.f-a.f));
  return r;
}
function render(){
  let r=sortL(D.L.filter(x=>match(x)));let note='',fb=false;
  if(!r.length&&st.city){
    const prov=PROV[st.city];let alt=sortL(D.L.filter(x=>match(x,true)&&prov&&PROV[x.c]===prov));
    let inProv=!!alt.length;if(!inProv)alt=sortL(D.L.filter(x=>match(x,true)));fb=true;
    note=`<div class="col-span-full block p-4 flex items-start gap-3"><i class="fa fa-circle-info text-pd mt-0.5"></i><div><b class="text-[#212529]">Nog geen advertenties in ${esc(st.city)}.</b> <span class="text-ink-muted">Hieronder advertenties ${prov&&inProv?'in '+esc(prov):'in heel Nederland'}. Woon of werk je in ${esc(st.city)}? <a href="adverteren.html" class="text-pd font-semibold">Plaats als eerste je advertentie</a>.</span></div></div>`;
    r=alt;
  }
  if(ADV)note=`<div class="col-span-full block p-3 flex flex-wrap items-center gap-2 text-[13px]"><i class="fa fa-sliders text-pd"></i><span class="text-ink-muted">Uitgebreide filters actief (${ADV.active(u)}).</span><button type="button" data-open-search class="text-pd font-semibold">Aanpassen</button><span class="text-ink-soft">·</span><a href="${location.pathname.split('/').pop()}" class="text-pd font-semibold">Wissen</a></div>`+note;
  $('#grid').innerHTML=note+(r.length?grid(r):'<div class="col-span-full block text-center text-ink-muted py-16"><i class="fa fa-magnifying-glass text-2xl text-pd-lighter mb-2 block"></i>Geen advertenties gevonden met deze filters.<br><button id="emptyReset" class="btn btn-ghost mt-4">Filters wissen</button></div>');
  $('#count')&&($('#count').textContent=fb?'(nog geen advertenties)':`(${r.length} advertentie${r.length===1?'':'s'})`);
  $$('.tchip').forEach(b=>b.classList.toggle('on',b.dataset.type===st.type));
  $$('.gchip').forEach(b=>b.classList.toggle('on',b.dataset.g===st.g));
  $$('[data-flag]').forEach(c=>c.checked=st.flags.has(c.dataset.flag));
  $$('[data-svc]').forEach(c=>c.checked=st.svc.has(c.dataset.svc));
  const cs=$('#fCity');if(cs)cs.value=st.city;const so=$('#fSort');if(so)so.value=st.sort;
  $('#emptyReset')?.addEventListener('click',reset);
}
function reset(){Object.assign(st,{q:'',g:P.lockG?P.g:'',city:P.lockCity?P.city:'',type:P.type,ageMin:18,ageMax:99,priceMax:0,lang:''});st.flags.clear();st.svc.clear();
  $$('#lf input[type=text],#lf input[type=search]').forEach(i=>i.value='');const a=$('#fAgeMax');if(a){a.value=60;$('#ageLbl').textContent='18 – 60+';}const pm=$('#fPrice');if(pm){pm.value=0;}render();}
// opbouw filters
const cities=[...new Set([...D.L.map(x=>x.c),...(P.city?[P.city]:[])])].sort((a,b)=>a.localeCompare(b,'nl'));
const cs=$('#fCity');if(cs){cs.innerHTML='<option value="">Alle steden</option>'+cities.map(c=>`<option>${esc(c)}</option>`).join('');if(P.lockCity)cs.disabled=true;cs.onchange=e=>{st.city=e.target.value;render()};}
$('#fQ')&&($('#fQ').value=st.q,$('#fQ').oninput=e=>{st.q=e.target.value;render()});
$('#fSort')&&($('#fSort').onchange=e=>{st.sort=e.target.value;render()});
$('#fAgeMax')&&($('#fAgeMax').oninput=e=>{const v=+e.target.value;st.ageMax=v>=60?99:v;$('#ageLbl').textContent='18 – '+v+(v>=60?'+':'');render()});
$('#fPrice')&&($('#fPrice').oninput=e=>{st.priceMax=+e.target.value;$('#priceLbl').textContent=st.priceMax?'tot € '+st.priceMax:'Alle';render()});
$('#fLang')&&($('#fLang').onchange=e=>{st.lang=e.target.value;render()});
$$('[data-flag]').forEach(c=>c.onchange=()=>{c.checked?st.flags.add(c.dataset.flag):st.flags.delete(c.dataset.flag);render()});
$$('[data-svc]').forEach(c=>c.onchange=()=>{c.checked?st.svc.add(c.dataset.svc):st.svc.delete(c.dataset.svc);render()});
document.addEventListener('click',e=>{
  const t=e.target.closest('.tchip');if(t){st.type=st.type===t.dataset.type?'':t.dataset.type;render()}
  const g=e.target.closest('.gchip');if(g&&!P.lockG){st.g=st.g===g.dataset.g?'':g.dataset.g;render()}
});
$('#resetBtn')&&($('#resetBtn').onclick=reset);
// mobiel filterpaneel
const lf=$('#lf');const op=()=>{lf.classList.remove('hidden');document.body.style.overflow='hidden'},cl=()=>{lf.classList.add('hidden');document.body.style.overflow=''};
$('#openFilters')?.addEventListener('click',op);$('#closeFilters')?.addEventListener('click',cl);$('#applyFilters')?.addEventListener('click',()=>{cl();$('#grid').scrollIntoView({block:'start'})});
addEventListener('resize',()=>{if(innerWidth>=1024)document.body.style.overflow=''});
render();
})();
