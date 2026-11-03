/* Paydates V2 — clubs-store: leest assets/clubs-data.js (basis) + beheerwijzigingen uit localStorage (pdx_clubs_v1).
   Gebruikt door admin/seksclubs.html (beheer) én de publieke site (seksclubs.html, club.html, detailpagina’s).
   Concept: wijzigingen gelden alleen in deze browser tot ze via Admin → Export in assets/clubs-data.js worden gezet. */
(function(){
'use strict';
var KEY='pdx_clubs_v1';
var PACKS={spotlight:{t:'Spotlight',o:0},premium:{t:'Premium',o:1},basic:{t:'Basic',o:2}};
var PUBS=['gepubliceerd','concept','gearchiveerd'];
var CLAIMS=['ongeclaimd','claim aangevraagd','geclaimd'];
var TYPES=['Seksclub','Privéhuis','Parenclub','Club'];
function base(){return ((window.PDX_CLUBS_DATA||{}).venues)||[];}
function st(){try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.o&&s.add)return s;}catch(e){}return {o:{},add:[]};}
function put(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){alert('Opslaan mislukt (localStorage vol?)');}try{window.dispatchEvent(new Event('pdx:clubs'));}catch(e){}}
function merge(v,o){var r={};for(var k in v)r[k]=v[k];if(o)for(var k2 in o)r[k2]=o[k2];return r;}
function all(){var s=st();return base().concat(s.add).map(function(v){return merge(v,s.o[v.id]);});}
function get(id){var L=all();for(var i=0;i<L.length;i++)if(L[i].id===id)return L[i];return null;}
function url(v){return v.page?v.page+'.html':'club.html?id='+encodeURIComponent(v.id);}
function byPage(p){p=String(p||'').replace(/\.html$/,'');var L=all();for(var i=0;i<L.length;i++)if(L[i].page===p)return L[i];return null;}
function claimOf(v){ /* afgeleid uit claim-wachtrij (pdx_v1) tenzij handmatig gezet */
  if(v.claimManual)return v.claim;
  try{var d=JSON.parse(localStorage.getItem('pdx_v1')||'null');var u=url(v);var c=(d&&d.claims||[]).filter(function(c){return c.clubRef===u||c.clubId===v.id;});
    if(c.some(function(x){return x.status==='goedgekeurd';}))return 'geclaimd';if(c.some(function(x){return x.status==='nieuw'||x.status==='in behandeling';}))return 'claim aangevraagd';}catch(e){}
  return v.claim||'ongeclaimd';}
function update(id,patch){var s=st();for(var i=0;i<s.add.length;i++)if(s.add[i].id===id){s.add[i]=merge(s.add[i],patch);s.add[i].upd=new Date().toISOString();put(s);return;}
  s.o[id]=merge(s.o[id]||{},patch);s.o[id].upd=new Date().toISOString();put(s);}
function slug(t){return String(t||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function add(v){var s=st();var b=slug((v.type==='Privéhuis'?'privehuis':v.type==='Parenclub'?'parenclub':'seksclub')+'-'+v.name+'-'+(v.city||''))||('club-'+Date.now());var id=b,n=2;while(get(id))id=b+'-'+(n++);
  var r=merge({id:id,name:'',aliases:[],type:'Seksclub',city:'',prov:'',addr:null,pc:null,phone:null,web:null,email:null,hoursRaw:null,hours:null,research:'handmatig',verified:false,pub:'concept',pack:'basic',claim:'ongeclaimd',review:true,reasons:['handmatig toegevoegd'],src:0,srcUrls:[],notes:[],checked:null,page:null,demo:false,intro:'',fac:[],img:null,logo:null,added:new Date().toISOString()},v);r.id=id;s.add.push(r);put(s);return r;}
function remove(id){var s=st();s.add=s.add.filter(function(v){return v.id!==id;});delete s.o[id];put(s);}
function isAdded(id){return st().add.some(function(v){return v.id===id;});}
function overrides(){return st();}
function reset(){localStorage.removeItem(KEY);try{window.dispatchEvent(new Event('pdx:clubs'));}catch(e){}}
function published(){return all().filter(function(v){return v.pub==='gepubliceerd';});}
function sort(L){return L.slice().sort(function(a,b){return (PACKS[a.pack]||PACKS.basic).o-(PACKS[b.pack]||PACKS.basic).o||(b.verified?1:0)-(a.verified?1:0)||a.name.localeCompare(b.name,'nl');});}
/* open/dicht: H = 7 dagen ma..zo, [van,tot] of null. Onbekende tijden -> null (nooit “Nu open”). */
function m(t){var p=t.split(':');return (+p[0])*60+(+p[1]);}
function openState(H){if(!H)return null;var d=new Date(),wd=(d.getDay()+6)%7,now=d.getHours()*60+d.getMinutes(),y=H[(wd+6)%7],t=H[wd];
  if(y){var ys=m(y[0]),ye=m(y[1]);if(ye<=ys&&now<ye)return{open:1,txt:'Open tot '+y[1]};}
  if(t){var s=m(t[0]),e=m(t[1]);if(e<=s)e+=1440;if(now>=s&&now<e)return{open:1,txt:'Nu open · tot '+t[1]};if(now<s)return{open:0,txt:'Vandaag open vanaf '+t[0]};}
  for(var i=1;i<7;i++){var n=H[(wd+i)%7];if(n)return{open:0,txt:'Gesloten · '+(i==1?'morgen':['ma','di','wo','do','vr','za','zo'][(wd+i)%7])+' vanaf '+n[0]};}
  return{open:0,txt:'Gesloten'};}
window.PDXClubs={KEY:KEY,PACKS:PACKS,PUBS:PUBS,CLAIMS:CLAIMS,TYPES:TYPES,all:all,get:get,byPage:byPage,url:url,claimOf:claimOf,update:update,add:add,remove:remove,isAdded:isAdded,overrides:overrides,reset:reset,published:published,sort:sort,openState:openState,slug:slug};
})();
