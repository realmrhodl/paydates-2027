/* Paydates V2 — voorbeeld van een (nieuwe) advertentie uit de accountomgeving op advertentie.html?ad=<id>.
   Leest de demo-database (localStorage pdx_v1), zet de advertentie om naar het PD_DATA-formaat en laat de
   normale advertentiepagina hem renderen. Alleen in deze browser zichtbaar (concept, geen server). */
(function(){
  var q=new URLSearchParams(location.search),adId=q.get('ad');if(!adId||!window.PD_DATA)return;
  var d=null;try{d=JSON.parse(localStorage.getItem('pdx_v1')||'null')}catch(e){}
  var a=d&&d.ads&&d.ads.find(function(x){return x.id===adId});if(!a)return;
  if(a.listingId){q.set('id',a.listingId);q.delete('ad');history.replaceState(null,'','?'+q.toString());return;}
  var L=window.PD_DATA.L,ct=a.ct||{},c0=a.contact||{};
  var base=L.find(function(x){return x.c===a.city})||L[0];
  var rows=function(r){return (r||[]).filter(function(p){return p[0]&&p[1]}).map(function(p){return [p[0],/€/.test(p[1])?p[1]:'€'+p[1]]})};
  var prices=[];if(rows(a.ratesIn).length)prices.push({t:'Ontvangst prijzen',rows:rows(a.ratesIn)});if(rows(a.ratesOut).length)prices.push({t:'Escort prijzen',rows:rows(a.ratesOut)});
  if(!prices.length&&rows(a.prices).length)prices.push({t:a.outcall?'Escort prijzen':'Ontvangst prijzen',rows:rows(a.prices)});
  var id=900000+Math.abs([].reduce.call(adId,function(h,ch){return (h*31+ch.charCodeAt(0))|0},7))%99999;
  var x={id:id,href:'',g:a.cat||'Vrouw',t:(a.types&&a.types[0])||a.type||'Escort',n:a.name||a.title,s:a.subtitle||a.title,c:a.city||'Amsterdam',a:a.age||'',
    photos:[],img:base.img,desc:a.desc||'',prices:prices,kenm:Object.entries(a.kenm||{}).filter(function(k){return k[1]}),
    mog:(a.mog||[]).map(function(m){return [m[0],m[1]?'+€ '+m[1]:'']}),avail:a.avail||[],langs:[],now:false,p:a.hour||0,f:a.photos||0,vid:a.videos||0,v:0,vip:a.vip?1:0,top:a.top?1:0,ago:'zojuist',
    ct:{tel:ct.tel||c0.tel||'',wa:(ct.wa||c0.wa)?String(ct.tel||c0.tel||'').replace(/\D/g,''):'',web:ct.web||'',ig:ct.ig||'',snap:ct.snap||'',x:ct.x||'',of:ct.of||'',f2f:ct.f2f||'',fc:ct.fc||'',tg:ct.tg||''},preview:true};
  x.photos=[x.img];L.unshift(x);window.PDX_AD_PREVIEW=x;
  q.set('id',id);history.replaceState(null,'','?'+q.toString());
  var m=document.createElement('meta');m.name='robots';m.content='noindex,nofollow';document.head.appendChild(m);
  document.addEventListener('DOMContentLoaded',function(){var b=document.createElement('div');b.style.cssText='background:#7351c0;color:#fff;text-align:center;font:600 13px Poppins,sans-serif;padding:8px';
    b.innerHTML='Voorbeeld van je advertentie ('+(a.status==='live'?'online':'status: '+a.status)+') · alleen zichtbaar in deze browser (concept) · <a href="mijn-advertenties.html" style="color:#ffd43b">terug naar mijn advertenties</a>';document.body.insertBefore(b,document.body.firstChild);});
})();
