/* Paydates V2 — PLATFORM-CONCEPT (pdx): sessie-mock, demo-database en configuratie in localStorage.
   LET OP: alles hieronder is DEMO. Geen echte backend, geen echte e-mail (SMTP), geen bunq-betalingen,
   geen KYC-API, geen productie-import. Data blijft in de browser (localStorage 'pdx_v1').
   Productie: vervang PDX.db() / PDX.save() door API-calls (zie admin/README-GAP.md). */
(function(){
'use strict';
const KEY='pdx_v1', SKEY='pdx_session', VERSION=3;
const now=()=>new Date().toISOString();
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let seedN=7; const rnd=()=>{seedN=(seedN*9301+49297)%233280;return seedN/233280}; const pick=a=>a[Math.floor(rnd()*a.length)];
const daysAgo=d=>new Date(Date.now()-d*864e5).toISOString();
const uid=p=>p+'_'+Math.random().toString(36).slice(2,9);

/* ---- community polls: bron = assets/polls-data.js (window.PD_POLLS). Stemtellingen/admin-wijzigingen leven in localStorage.
   Merge-regel: polls uit het bestand die nog niet lokaal bestaan (en niet in admin verwijderd zijn) worden toegevoegd.
   Daarna geldt: maximaal één live poll — de live poll met de nieuwste startdatum wint, de rest gaat naar archief. */
const pTime=s=>{const t=Date.parse(s||'');return isNaN(t)?0:t;};
const pDay=v=>v&&/^\d{4}-\d{2}-\d{2}$/.test(v)?v+'T12:00:00':(v||null); /* datum zonder tijd = 12:00 lokaal (geen datumverschuiving door tijdzone) */
function filePolls(){const L=Array.isArray(window.PD_POLLS)?window.PD_POLLS:[];return L.filter(p=>p&&p.id&&p.q&&Array.isArray(p.options)).map(p=>({id:String(p.id),q:p.q,cat:p.cat||'',desc:p.desc||'',status:['live','archief','concept'].includes(p.status)?p.status:'archief',start:pDay(p.start),end:pDay(p.end),options:p.options.map(o=>[String(o[0]),+o[1]||0]),src:'bestand'}));}
function normPolls(d){
  const live=d.polls.filter(p=>p.status==='live').sort((a,b)=>pTime(b.start)-pTime(a.start));
  live.slice(1).forEach(p=>{p.status='archief';if(!p.end)p.end=live[0].start||now();});
  return d;
}
function mergePolls(d){
  if(!Array.isArray(d.polls))d.polls=[]; if(!Array.isArray(d.pollsRemoved))d.pollsRemoved=[];
  const have=new Set(d.polls.map(p=>p.id)), gone=new Set(d.pollsRemoved); let changed=false;
  const byId=new Map(d.polls.map(p=>[p.id,p]));
  filePolls().forEach(p=>{const l=byId.get(p.id);if(l){if(!l.cat&&p.cat){l.cat=p.cat;changed=true;}return;}if(!gone.has(p.id)){d.polls.push(p);changed=true;}});
  const before=JSON.stringify(d.polls.map(p=>p.status)); normPolls(d); if(before!==JSON.stringify(d.polls.map(p=>p.status)))changed=true;
  return changed;
}

function seed(){
  seedN=7;
  const L=(window.PD_DATA&&window.PD_DATA.L)||[];
  const users=[], ads=[];
  users.push({id:'u_admin',username:'admin',name:'Beheerder',email:'admin@demo.paydates.test',pw:'demo',role:'admin',status:'actief',credits:0,kyc:'goedgekeurd',created:daysAgo(400),lastLogin:daysAgo(0),city:'Amsterdam',marketing:false,notes:[{at:daysAgo(30),by:'systeem',t:'Demo-beheeraccount (concept).'}],bv:'bv_forest'});
  users.push({id:'u_mod',username:'moderator',name:'Moderatie',email:'moderatie@demo.paydates.test',pw:'demo',role:'moderator',status:'actief',credits:0,kyc:'goedgekeurd',created:daysAgo(200),lastLogin:daysAgo(1),city:'Utrecht',marketing:false,notes:[],bv:'bv_forest'});
  users.push({id:'u_demo',username:'demo-adverteerder',name:'Demo Adverteerder',email:'adverteerder@demo.paydates.test',pw:'demo',role:'adverteerder',status:'actief',credits:450,kyc:'geen',created:daysAgo(12),lastLogin:daysAgo(0),city:'Rotterdam',marketing:true,notes:[],bv:'bv_forest'});
  users.push({id:'u_bedrijf',username:'demo-bedrijf',name:'Demo Club B.V. (fictief)',email:'bedrijf@demo.paydates.test',pw:'demo',role:'bedrijf',status:'actief',credits:1200,kyc:'ingediend',created:daysAgo(40),lastLogin:daysAgo(2),city:'Utrecht',marketing:true,notes:[],bv:'bv_forest',company:{name:'Demo Club (fictief)',kvk:'',plan:'basic'}});
  // eigenaren van bestaande (gescrapete) advertenties: fictieve demo-accounts, één per advertentie
  const st=['actief','actief','actief','actief','actief','onbevestigd','geschorst'];
  const kyc=['goedgekeurd','goedgekeurd','geen','ingediend','afgewezen','goedgekeurd'];
  L.forEach((x,i)=>{
    const id='u_l'+x.id, un=(String(x.n||'user').toLowerCase().replace(/[^a-z0-9]+/g,'')||'user')+x.id;
    const k=pick(kyc);
    users.push({id,username:un,name:x.n||un,email:un+'@demo.paydates.test',pw:'demo',role:i%9===0?'bedrijf':'adverteerder',status:pick(st),credits:Math.floor(rnd()*60)*10,kyc:k,created:daysAgo(30+Math.floor(rnd()*700)),lastLogin:daysAgo(Math.floor(rnd()*40)),city:x.c||'',marketing:rnd()>.35,notes:[],bv:'bv_forest',listingId:x.id});
    ads.push({id:'a_l'+x.id,listingId:x.id,owner:id,title:x.s||x.n,cat:x.g||'Vrouw',type:x.t||'Escort',city:x.c||'',status:'live',mod:'goedgekeurd',created:daysAgo(20+Math.floor(rnd()*300)),expires:daysAgo(-Math.floor(5+rnd()*25)),bumps:Math.floor(rnd()*9),top:false,vip:!!x.vip,views:Math.floor(200+rnd()*4000),clicks:Math.floor(10+rnd()*300),img:x.img||''});
  });
  // klanten
  ['jeroen','mark84','sven_utr','dennis','tom.nl','bas_r','kevin','rick','niels','lars'].forEach((n,i)=>users.push({id:'u_k'+i,username:n,name:n,email:n.replace(/[^a-z0-9]/g,'')+'@demo.paydates.test',pw:'demo',role:'klant',status:i===7?'verbannen':'actief',credits:Math.floor(rnd()*30)*10,kyc:'geen',created:daysAgo(Math.floor(rnd()*500)),lastLogin:daysAgo(Math.floor(rnd()*60)),city:pick(['Amsterdam','Rotterdam','Den Haag','Utrecht','Eindhoven','Groningen']),marketing:rnd()>.5,notes:[],bv:'bv_forest'}));
  // demo-adverteerder: 2 eigen advertenties
  ads.push({id:'a_demo1',owner:'u_demo',title:'Sophie – discreet in Rotterdam (DEMO)',cat:'Vrouw',type:'Privé ontvangst',city:'Rotterdam',status:'live',mod:'goedgekeurd',created:daysAgo(10),expires:daysAgo(-20),bumps:3,top:false,vip:false,views:842,clicks:61,desc:'Demo-advertentie (concept).',contact:{tel:'',wa:true,mail:true},photos:3,img:''});
  ads.push({id:'a_demo2',owner:'u_demo',title:'Massage aan huis (DEMO)',cat:'Vrouw',type:'Massage',city:'Rotterdam',status:'wacht',mod:'in behandeling',created:daysAgo(1),expires:daysAgo(-30),bumps:0,top:false,vip:false,views:0,clicks:0,desc:'Wacht op moderatie (concept).',contact:{},photos:1,img:''});
  const kycq=users.filter(u=>u.kyc==='ingediend'||u.kyc==='afgewezen').map((u,i)=>({id:'k_'+u.id,userId:u.id,submitted:daysAgo(i%5),status:u.kyc==='ingediend'?'ingediend':'afgewezen',steps:{id:true,selfie:true,age:true,reg:u.role==='bedrijf'},note:u.kyc==='afgewezen'?'Selfie onscherp, opnieuw indienen.':'',reviewer:u.kyc==='afgewezen'?'moderator':''}));
  return {
    v:VERSION, seededAt:now(),
    users, ads, kyc:kycq,
    bv:[
      {id:'bv_forest',legal:'Forest Road B.V.',trade:'Paydates.nl',kvk:'97957232',btw:'NL868303550B01',address:'Herengracht 449A, 1017 BR Amsterdam',email:'support@paydates.nl',invoicePrefix:'PD',primary:true,brands:['Paydates.nl','Paydates Chat','Seksclubs & privéhuizen'],note:'Exploitant volgens bedrijfsinformatie.html'},
      {id:'bv_brand',legal:'Forest Road Capital B.V.',trade:'Merkhouder Paydates®',kvk:'',btw:'',address:'',email:'support@paydates.nl',invoicePrefix:'',primary:false,brands:['Merk Paydates® (handelsmerk)'],note:'Merkhouder volgens bedrijfsinformatie.html. KvK/BTW nog aanvullen.'},
      {id:'bv_highclass',legal:'(HighClass – nog vast te stellen)',trade:'HighClass',kvk:'',btw:'',address:'',email:'support@paydates.nl',invoicePrefix:'HC',primary:false,brands:[],note:'Placeholder voor later; geen gegevens verzonnen.'}
    ],
    ownership:{default:'bv_forest',assets:[
      {k:'domein paydates.nl',bv:'bv_forest'},{k:'merk Paydates®',bv:'bv_brand'},{k:'advertenties & credits',bv:'bv_forest'},{k:'facturatie & btw',bv:'bv_forest'},{k:'Paydates Chat',bv:'bv_forest'},{k:'Seksclubs-database',bv:'bv_forest'},{k:'Sponsorship & banners',bv:'bv_forest'},{k:'HighClass (toekomst)',bv:'bv_highclass'}]},
    pay:{
      live:false,
      methods:[
        {k:'ideal',t:'iDEAL / Wero',on:true,min:50,max:500,via:'bunq checkout (nog niet live)'},
        {k:'bancontact',t:'Bancontact',on:true,min:50,max:500,via:'bunq checkout (nog niet live)'},
        {k:'creditcard',t:'Creditcard',on:true,min:50,max:500,via:'bunq checkout (nog niet live)'},
        {k:'call',t:'Bellen (0906)',on:true,min:2,max:2,via:'0906-provider (nummer volgt)'},
        {k:'sms',t:'SMS (3010)',on:true,min:2,max:2,via:'SMS-provider (tarief volgt)'},
        {k:'bitcoin',t:'Bitcoin',on:true,min:25,max:5000,via:'eigen wallet (concept)'}
      ],
      packs:[50,100,150,200,250,300,350,400,450,500].map(e=>({eur:e,credits:e*10,bonus:0})),
      rates:{credPerEur:10,bump:20,topDay:50,vip7:300,chatpass24:50,smsCallEur:2,smsCallCredits:20,btcMinEur:25,sponsorWeek:10000},
      banners:[{t:'Banner rail (200px)',eur:49,per:'maand'},{t:'Banner in-feed',eur:99,per:'maand'},{t:'Banner homepage-band',eur:149,per:'maand'}],
      clubPlans:[
        {k:'basic',t:'Basic',eur:0,features:['Bedrijfsprofiel','Adres & openingstijden','Link naar website']},
        {k:'premium',t:'Premium',eur:49,features:['Alles uit Basic','Foto’s (met gebruiksrechten)','Statistieken','Vacatures koppelen','Hoger in stadspagina']},
        {k:'spotlight',t:'Spotlight',eur:99,features:['Alles uit Premium','Spotlight op hub & provincie','Uitgelicht in nieuwsbrief','Prioriteit support']}
      ]
    },
    mail:{
      templates:[
        {k:'welkom',t:'Welkom',subject:'Welkom bij Paydates.nl, {{naam}}',body:'Hoi {{naam}},\n\nWelkom bij Paydates.nl! Je account is aangemaakt. Plaats je eerste advertentie via je dashboard.\n\nGroet,\nTeam Paydates\nsupport@paydates.nl'},
        {k:'verify',t:'E-mail bevestigen',subject:'Bevestig je e-mailadres',body:'Hoi {{naam}},\n\nKlik op de link om je e-mailadres te bevestigen: {{link}}\n\nTeam Paydates'},
        {k:'reset',t:'Wachtwoord resetten',subject:'Nieuw wachtwoord instellen',body:'Hoi {{naam}},\n\nJe hebt een nieuw wachtwoord aangevraagd. Stel het in via: {{link}}\nDeze link is 60 minuten geldig. Niet aangevraagd? Negeer deze mail.\n\nTeam Paydates'},
        {k:'kyc_ok',t:'Verificatie goedgekeurd',subject:'Je bent geverifieerd ✔',body:'Hoi {{naam}},\n\nGoed nieuws: je verificatie is goedgekeurd. Je advertenties tonen nu het paarse vinkje.\n\nTeam Paydates'},
        {k:'kyc_no',t:'Verificatie afgewezen',subject:'Je verificatie is niet goedgekeurd',body:'Hoi {{naam}},\n\nHelaas konden we je verificatie niet goedkeuren.\nReden: {{notitie}}\n\nJe kunt opnieuw indienen via je dashboard.\n\nTeam Paydates'},
        {k:'ad_live',t:'Advertentie live',subject:'Je advertentie staat online',body:'Hoi {{naam}},\n\nJe advertentie "{{advertentie}}" is goedgekeurd en staat online.\n\nTeam Paydates'},
        {k:'ad_rej',t:'Advertentie afgekeurd',subject:'Je advertentie is afgekeurd',body:'Hoi {{naam}},\n\nJe advertentie "{{advertentie}}" voldoet niet aan de voorwaarden.\nReden: {{notitie}}\n\nTeam Paydates'},
        {k:'credits',t:'Credits ontvangen',subject:'{{credits}} credits bijgeschreven',body:'Hoi {{naam}},\n\nEr zijn {{credits}} credits bijgeschreven op je account.\n\nTeam Paydates'},
        {k:'ban',t:'Account geschorst',subject:'Je account is geschorst',body:'Hoi {{naam}},\n\nJe account is (tijdelijk) geschorst. Vragen? Mail support@paydates.nl.\n\nTeam Paydates'},
        {k:'claim',t:'Bedrijfsclaim ontvangen',subject:'We hebben je claim ontvangen',body:'Hoi {{naam}},\n\nWe hebben je claim voor "{{bedrijf}}" ontvangen en controleren KvK en contactgegevens. Je hoort binnen 2 werkdagen van ons.\n\nTeam Paydates'}
      ],
      log:[], campaigns:[
        {id:'c_1',name:'Najaarsactie credits (voorbeeld)',segment:'adverteerders',subject:'10% extra credits dit weekend',body:'Hoi {{naam}},\n\nDit weekend 10% extra credits bij elke bundel.\n\nAfmelden: {{afmelden}}',created:daysAgo(14),status:'gesimuleerd',recipients:0,excluded:0}
      ]
    },
    polls:filePolls(), pollsRemoved:[],
    claims:[
      {id:'cl_1',club:'Club Amethist (voorbeeldprofiel)',clubRef:'seksclub-club-amethist-arnhem.html',name:'Demo aanvrager',email:'claim@demo.paydates.test',phone:'',kvk:'',role:'Eigenaar',status:'nieuw',at:daysAgo(1),note:''}
    ],
    clubImport:{decisions:{}},
    flags:{
      paymentsLive:false,realEmail:false,kycProvider:false,clubsPublishUnverified:false,showNuOpenOnlyWithHours:true,parenclubsSeparate:true,pollsOnHome:true,registrationOpen:true,maintenance:false,chatEnabled:true,clubClaims:true
    },
    settings:{supportEmail:'support@paydates.nl',minAgeAdvertiser:21,adDays:30,modRequired:true,siteName:'Paydates.nl'},
    audit:[{at:now(),actor:'systeem',action:'seed',target:'demo-database',detail:'Demo-data aangemaakt (concept).'}],
    stats:{}
  };
}

function db(){
  let d=null; try{d=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(!d||d.v!==VERSION){d=seed();mergePolls(d);try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
  else if(window.PD_POLLS&&!db._merged){db._merged=true;if(mergePolls(d)){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}}
  return d;
}
function save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){alert('Opslaan mislukt (localStorage vol?)')}try{window.dispatchEvent(new Event('pdx:save'))}catch(e){}}
function reset(){localStorage.removeItem(KEY);return db();}
function audit(action,target,detail){const d=db();const s=session();d.audit.unshift({at:now(),actor:s?s.username:'gast',action,target:target||'',detail:detail||''});d.audit=d.audit.slice(0,500);save(d);}
function session(){try{const s=JSON.parse(localStorage.getItem(SKEY)||'null');if(!s)return null;const u=db().users.find(x=>x.id===s.id);return u||null}catch(e){return null}}
function login(ident,pw){
  const d=db(); ident=String(ident||'').trim().toLowerCase();
  const u=d.users.find(x=>x.email.toLowerCase()===ident||x.username.toLowerCase()===ident);
  if(!u) return {ok:false,err:'Onbekend account.'};
  if(u.pw!==pw) return {ok:false,err:'Wachtwoord klopt niet.'};
  if(u.status==='verbannen') return {ok:false,err:'Dit account is verbannen. Neem contact op met support@paydates.nl.'};
  if(u.status==='geschorst') return {ok:false,err:'Dit account is tijdelijk geschorst. Neem contact op met support@paydates.nl.'};
  u.lastLogin=now(); save(d);
  localStorage.setItem(SKEY,JSON.stringify({id:u.id,at:now()}));
  audit('login',u.username,'Ingelogd (mock)');
  return {ok:true,user:u};
}
function logout(){const s=session();if(s)audit('logout',s.username,'');localStorage.removeItem(SKEY);}
function register(o){
  const d=db(); const em=String(o.email||'').trim().toLowerCase(); const un=String(o.username||em.split('@')[0]).trim();
  if(d.users.some(x=>x.email.toLowerCase()===em)) return {ok:false,err:'Er bestaat al een account met dit e-mailadres.'};
  if(d.users.some(x=>x.username.toLowerCase()===un.toLowerCase())) return {ok:false,err:'Deze gebruikersnaam is al bezet.'};
  const role=o.type==='sekswerker'?'adverteerder':o.type==='bedrijf'?'bedrijf':'klant';
  const u={id:uid('u'),username:un,name:o.name||un,email:em,pw:o.pw,role,status:'actief',credits:0,kyc:'geen',created:now(),lastLogin:now(),city:o.city||'',marketing:!!o.marketing,notes:[],bv:d.ownership.default};
  if(role==='bedrijf')u.company={name:o.company||'',kvk:o.kvk||'',plan:'basic'};
  d.users.push(u); save(d);
  mailSim(u,'welkom',{}); mailSim(u,'verify',{link:'https://paydates.nl/bevestig?token=DEMO'});
  localStorage.setItem(SKEY,JSON.stringify({id:u.id,at:now()}));
  audit('register',u.username,'Nieuw account ('+role+')');
  return {ok:true,user:u};
}
function fill(t,u,v){return String(t).replace(/\{\{(\w+)\}\}/g,(m,k)=>k==='naam'?(u&&u.name||''):k==='email'?(u&&u.email||''):k==='afmelden'?'https://paydates.nl/afmelden?u=DEMO':(v&&v[k]!=null?v[k]:m));}
/* GEEN echte verzending: alleen een regel in het mail-log (status 'gesimuleerd'). */
function mailSim(u,tplKey,vars,custom){
  const d=db(); const t=d.mail.templates.find(x=>x.k===tplKey)||{t:'Eigen bericht',subject:'',body:''};
  const subject=fill(custom&&custom.subject||t.subject,u,vars), body=fill(custom&&custom.body||t.body,u,vars);
  d.mail.log.unshift({id:uid('m'),to:u?u.email:'',userId:u?u.id:'',tpl:tplKey||'custom',subject,body,at:now(),status:'gesimuleerd (niet verzonden)'});
  d.mail.log=d.mail.log.slice(0,1000); save(d);
}
const isAdmin=u=>u&&(u.role==='admin'||u.role==='moderator');
function safeNext(n,def){n=String(n||'');if(!n||/^(?:[a-z]+:)?\/\//i.test(n)||n.startsWith('javascript:'))return def;return n;}
function requireLogin(opts){opts=opts||{};const u=session();const here=location.pathname.split('/').slice(-2).join('/');
  if(!u){location.href=(opts.base||'')+'login.html?next='+encodeURIComponent(opts.next||location.pathname.split('/').pop()+location.search);return null;}
  if(opts.admin&&!isAdmin(u)){document.body.innerHTML='<div style="font-family:Poppins,sans-serif;max-width:520px;margin:80px auto;padding:24px;background:#fff;border-radius:8px;text-align:center"><h1 style="font-size:20px;font-weight:700">Geen toegang</h1><p style="color:#5d738d">Alleen beheerders hebben toegang tot het adminpanel.</p><p><a style="color:#7351c0;font-weight:600" href="'+(opts.base||'')+'dashboard.html">Naar mijn dashboard</a></p></div>';return null;}
  return u;}
function fmtD(s){if(!s)return '—';const d=new Date(s);return d.toLocaleDateString('nl-NL',{day:'2-digit',month:'short',year:'numeric'});}
function fmtDT(s){if(!s)return '—';const d=new Date(s);return d.toLocaleString('nl-NL',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});}
const eur=n=>'€ '+Number(n||0).toLocaleString('nl-NL',{minimumFractionDigits:Number(n)%1?2:0,maximumFractionDigits:2});
function toast(t){let el=document.getElementById('pdxToast');if(!el){el=document.createElement('div');el.id='pdxToast';el.className='pdx-toast';document.body.appendChild(el);}el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2600);}
/* eenvoudige event-tracking (demo): profielbezoek / websiteklik / telefoonklik per pagina */
function track(page,evt){let s={};try{s=JSON.parse(localStorage.getItem('pdx_stats')||'{}')}catch(e){}s[page]=s[page]||{view:0,web:0,tel:0};s[page][evt]=(s[page][evt]||0)+1;try{localStorage.setItem('pdx_stats',JSON.stringify(s))}catch(e){}}

window.PDX={filePolls,normPolls,pTime,KEY,db,save,reset,audit,session,login,logout,register,mailSim,fill,isAdmin,safeNext,requireLogin,fmtD,fmtDT,eur,esc,toast,uid,now,track,daysAgo};
})();
