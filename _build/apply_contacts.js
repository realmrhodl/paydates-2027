const fs=require('fs');global.window={};
const src=fs.readFileSync('assets/data.js','utf8');eval(src);
const D=window.PD_DATA,C=JSON.parse(fs.readFileSync('_build/contacts.json','utf8'));
const digits=s=>String(s).replace(/\(0\)/g,'').replace(/[^\d]/g,'');
function intl(s){let d=digits(s);if(d.startsWith('00'))d=d.slice(2);else if(d.startsWith('0'))d='31'+d.slice(1);return d;}
const handle=s=>String(s).trim().replace(/^https?:\/\/[^/]+\//,'').replace(/^@/,'').replace(/\/+$/,'');
for(const x of D.L){
  const ct={};
  for(const [k,v,h] of (C[x.id]||[])){
    const key=k.toLowerCase();
    if(key==='whatsapp')ct.wa=intl(v);
    else if(key==='mobile'||key==='telefoon'||key==='phone')ct.tel=intl(v);
    else if(key==='website'){ if(/@/.test(v)&&!/^https?:/.test(v))ct.mail=v.trim(); else ct.web=/^https?:\/\//.test(v)?v.trim():'https://'+v.trim(); }
    else if(key==='instagram')ct.ig=handle(v);
    else if(key==='snapchat')ct.snap=handle(v);
    else if(key==='twitter'||key==='x')ct.x=handle(v);
    else if(key==='onlyfans')ct.of=handle(v);
    else if(key==='f2f')ct.f2f=handle(v);
    else if(key==='fancentro')ct.fc=handle(v);
    else if(key==='telegram')ct.tg=handle(v);
    else if(key==='e-mail'||key==='email')ct.mail=v.trim();
    else (ct.other=ct.other||[]).push([k,v,h]);
  }
  if(Object.keys(ct).length)x.ct=ct;else delete x.ct;
}
const head='/* Paydates V2 — echte advertenties, video\'s en blogs van paydates.nl (stand nov 2026). Contactgegevens (x.ct: tel/wa/web/mail/ig/snap/x/of/f2f/fc/tg) uit het Contact-tabblad van de live advertentie. */\n';
fs.writeFileSync('assets/data.js',head+'window.PD_DATA='+JSON.stringify(D)+';\n');
console.log(D.L.filter(x=>x.ct).length,'met contact van',D.L.length);console.log(JSON.stringify(D.L.find(x=>x.id===476).ct),JSON.stringify(D.L.find(x=>x.id===626).ct));
