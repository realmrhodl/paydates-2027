/* Kaart van Nederland: provincies klikbaar, panel met gemeenten, zoeken, #hash = provincie. */
(function(){
  var el=document.getElementById('nlData'); if(!el) return;
  var D=JSON.parse(el.textContent), svg=document.getElementById('nlSvg'), dots=document.getElementById('nlDots'),
      panel=document.getElementById('nlPanel'), tip=document.getElementById('nlTip'), pills=document.getElementById('nlPills'),
      box=svg.parentNode, NS='http://www.w3.org/2000/svg', cur=null;
  var P={}; D.provs.forEach(function(p){P[p.id]=p});
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var norm=function(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]+/g,'-').replace(/^-|-$/g,'')};
  var fmt=function(n,a,b){return n+' '+(n===1?a:b)};
  function overview(){
    panel.innerHTML='<div class="nl-ph"><b class="text-[15px] text-[#212529]">Kies een provincie</b><div class="text-[12px] text-ink-muted mt-0.5">Klik op de kaart of kies hieronder.</div></div><div class="nl-pgrid">'+
      D.provs.map(function(p){return '<button type="button" class="nl-pbtn" data-prov="'+p.id+'">'+esc(p.n)+'<small>'+fmt(p.g,'gemeente','gemeenten')+(p.a?' · '+fmt(p.a,'advertentie','advertenties'):'')+'</small></button>'}).join('')+'</div>';
  }
  function select(id,opt){
    opt=opt||{}; if(!P[id]){cur=null;svg.classList.remove('nl-has-active');mark();dots.innerHTML='';overview();if(!opt.keepHash)history.replaceState(null,'',location.pathname+location.search);return}
    cur=id; svg.classList.add('nl-has-active'); mark();
    var p=P[id], cs=D.cities.filter(function(c){return c.p===id});
    dots.innerHTML=''; cs.forEach(function(c){var d=document.createElementNS(NS,'circle');d.setAttribute('cx',c.x);d.setAttribute('cy',c.y);d.setAttribute('r',window.innerWidth<640?4.2:3.2);
      d.setAttribute('class','nl-dot'+(c.c?' has-ads':''));d.dataset.s=c.s;d.dataset.n=c.n;d.dataset.c=c.c;dots.appendChild(d)});
    panel.innerHTML='<div class="nl-ph flex items-start justify-between gap-2"><div><div class="text-[11px] uppercase tracking-[.12em] text-ink-soft font-bold">Provincie</div><b class="text-[17px] text-[#212529]">'+esc(p.n)+'</b><div class="text-[12px] text-ink-muted mt-0.5">'+fmt(cs.length,'gemeente','gemeenten')+(p.a?' · '+fmt(p.a,'advertentie','advertenties'):'')+'</div></div>'+
      '<button type="button" class="text-[12px] text-ink-muted hover:text-pd" data-reset><i class="fa fa-xmark mr-1"></i>Sluiten</button></div>'+
      '<ul class="nl-list">'+cs.map(function(c){return '<li><a href="escort-'+c.s+'.html" data-s="'+c.s+'"><span>Escort '+esc(c.n)+'</span><small>'+(c.c||'')+'</small></a></li>'}).join('')+'</ul>'+
      '<div class="px-4 pb-4 pt-1"><a href="locaties.html#prov-'+id+'" class="text-[12px] text-pd font-semibold">'+esc(p.n)+' in Alle locaties <i class="fa fa-angle-right"></i></a></div>';
    if(!opt.keepHash) history.replaceState(null,'','#'+id);
    if(opt.scroll && window.innerWidth<1024) panel.scrollIntoView({behavior:'smooth',block:'start'});
    if(opt.hot) hot(opt.hot,true);
  }
  function mark(){
    svg.querySelectorAll('[data-prov]').forEach(function(n){n.classList.toggle('is-active',n.dataset.prov===cur)});
    pills.querySelectorAll('[data-prov]').forEach(function(n){var on=n.dataset.prov===cur;n.classList.toggle('is-active',on);n.setAttribute('aria-selected',on);if(on)n.scrollIntoView({block:'nearest',inline:'center'})});
  }
  function hot(s,on){
    dots.querySelectorAll('.nl-dot').forEach(function(d){d.classList.toggle('is-hot',on&&d.dataset.s===s)});
    panel.querySelectorAll('.nl-list a').forEach(function(a){a.classList.toggle('is-hot',on&&a.dataset.s===s)});
    if(on){var a=panel.querySelector('.nl-list a.is-hot');if(a&&a.scrollIntoView&&window.innerWidth>=1024)a.scrollIntoView({block:'nearest'})}
  }
  function showTip(e,html){var r=box.getBoundingClientRect();tip.innerHTML=html;tip.hidden=false;tip.style.left=(e.clientX-r.left)+'px';tip.style.top=(e.clientY-r.top)+'px'}
  svg.addEventListener('click',function(e){var t=e.target;
    if(t.classList.contains('nl-dot')){location.href='escort-'+t.dataset.s+'.html';return}
    var p=t.closest('[data-prov]'); if(p) select(p.dataset.prov,{scroll:true});
  });
  svg.addEventListener('keydown',function(e){var p=e.target.closest&&e.target.closest('.nl-prov');if(p&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(p.dataset.prov,{scroll:true})}});
  svg.addEventListener('mousemove',function(e){var t=e.target;
    if(t.classList.contains('nl-dot')){showTip(e,'<b>'+esc(t.dataset.n)+'</b>'+(+t.dataset.c?' · '+fmt(+t.dataset.c,'advertentie','advertenties'):''));hot(t.dataset.s,true);return}
    var p=t.closest('.nl-prov'); if(p){var q=P[p.dataset.prov];showTip(e,'<b>'+esc(q.n)+'</b> · '+fmt(q.g,'gemeente','gemeenten'))} else tip.hidden=true;
  });
  svg.addEventListener('mouseleave',function(){tip.hidden=true;hot(null,false)});
  pills.addEventListener('click',function(e){var b=e.target.closest('[data-prov]');if(b) select(b.dataset.prov===cur?'':b.dataset.prov)});
  panel.addEventListener('click',function(e){var b=e.target.closest('[data-prov]');if(b){select(b.dataset.prov,{scroll:false});return}if(e.target.closest('[data-reset]'))select('')});
  panel.addEventListener('mouseover',function(e){var a=e.target.closest('.nl-list a');if(a){dots.querySelectorAll('.nl-dot').forEach(function(d){d.classList.toggle('is-hot',d.dataset.s===a.dataset.s)})}});
  // zoeken
  var q=document.getElementById('nlQ'), form=document.getElementById('nlSearch');
  function find(v){v=norm((v||'').split(' · ')[0]);if(!v)return null;
    return D.cities.find(function(c){return norm(c.n)===v})||D.cities.find(function(c){return norm(c.n).indexOf(v)===0})||null}
  q.addEventListener('input',function(){var c=find(q.value);if(c&&q.value.indexOf(' · ')>0)select(c.p,{hot:c.s})});
  form.addEventListener('submit',function(e){e.preventDefault();var c=find(q.value);
    if(c) location.href='escort-'+c.s+'.html';
    else{var p=D.provs.find(function(p){return norm(p.n)===norm(q.value)});if(p)select(p.id,{scroll:true});else location.href='search.html?q='+encodeURIComponent(q.value)}});
  function fromHash(){var h=norm(decodeURIComponent(location.hash.slice(1)).replace(/^prov-/,''));if(h==='fryslan')h='friesland';select(P[h]?h:'',{keepHash:true})}
  window.addEventListener('hashchange',fromHash); fromHash();
})();
