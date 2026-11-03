/* Concept-vacatures (fictief) voor de Jobs-sectie: werkgevers in de branche zoeken personeel. */
window.PD_JOBS=[
 {id:1,page:'job-1-gastvrouwen-gezocht-voor-gezellige-club.html',emp:'Club Velvet',title:'Gastvrouwen gezocht voor gezellige club',city:'Amsterdam',type:'Club',upd:'2026-11-01',tier:'gold'},
 {id:2,page:'job-2-nieuwe-dames-gezocht-flexibele-uren-hoge-verdiensten.html',emp:'Escortbureau Nova',title:'Nieuwe dames gezocht – flexibele uren, hoge verdiensten',city:'Rotterdam',type:'Escortbureau',upd:'2026-11-01',tier:'gold'},
 {id:3,page:'job-3-werkplek-vrij-in-modern-privehuis.html',emp:'Privéhuis De Linde',title:'Werkplek vrij in modern privéhuis',city:'Utrecht',type:'Privéhuis',upd:'2026-10-31',tier:'gold'},
 {id:4,page:'job-4-masseuse-gezocht-ervaring-niet-vereist.html',emp:'Massagesalon Lotus',title:'Masseuse gezocht (ervaring niet vereist)',city:'Den Haag',type:'Massagesalon',upd:'2026-10-31',tier:'gold'},
 {id:5,page:'job-5-content-creators-gezocht-voor-fotoshoots-video.html',emp:'Studio Noir',title:'Content creators gezocht voor fotoshoots & video',city:'Eindhoven',type:'Studio',upd:'2026-10-30',tier:'silver'},
 {id:6,page:'job-6-dames-gezocht-veilig-discreet-en-gezellig-team.html',emp:'Huize Maxime',title:'Dames gezocht – veilig, discreet en gezellig team',city:'Breda',type:'Privéhuis',upd:'2026-10-30',tier:'silver'},
 {id:7,page:'job-7-hostesses-en-dames-gezocht-voor-saunaclub.html',emp:'Saunaclub Oase',title:'Hostesses en dames gezocht voor saunaclub',city:'Arnhem',type:'Saunaclub',upd:'2026-10-29',tier:''},
 {id:8,page:'job-8-escorts-gezocht-voor-high-class-agency.html',emp:'Agency Elite NL',title:'Escorts gezocht voor high-class agency',city:'Amsterdam',type:'Escortbureau',upd:'2026-10-29',tier:''},
 {id:9,page:'job-9-receptionist-e-gezocht-parttime.html',emp:'Club Rouge',title:'Receptionist(e) gezocht – parttime',city:'Groningen',type:'Club',upd:'2026-10-28',tier:''},
 {id:10,page:'job-10-kamer-te-huur-voor-zelfstandige-sekswerkers.html',emp:'Privé Zuid',title:'Kamer te huur voor zelfstandige sekswerkers',city:'Maastricht',type:'Werkplek',upd:'2026-10-28',tier:''},
 {id:11,page:'job-11-chatmedewerkers-gezocht-werken-vanuit-huis.html',emp:'Chatlijn Midnight',title:'Chatmedewerkers gezocht – werken vanuit huis',city:'Online',type:'Online',upd:'2026-10-27',tier:''},
 {id:12,page:'job-12-werken-in-top-werkplek-eigen-tijden.html',emp:'Studio Amber',title:'Werken in top werkplek, eigen tijden',city:'Zwolle',type:'Privéhuis',upd:'2026-10-26',tier:''}
];
window.PD_JOBCARD=j=>{const e=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const b=j.tier?`<span class="absolute top-2 right-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${j.tier=='gold'?'bg-gold text-[#212529]':'bg-[#c0c4cc] text-[#212529]'}">${j.tier}</span>`:'';
 return `<a href="${j.page}" data-city="${e(j.city)}" class="job relative block bg-white rounded-lg p-4 shadow-block hover:shadow-pill transition group ${j.tier=='gold'?'ring-1 ring-gold':''}">${b}
 <div class="flex items-center gap-2 pr-10"><span class="w-9 h-9 shrink-0 rounded-full bg-[#7351c017] text-pd flex items-center justify-center"><i class="fa fa-briefcase"></i></span><div class="min-w-0 text-[12px] text-ink-muted truncate"><b class="text-ink">${e(j.emp)}</b> zoekt naar</div></div>
 <div class="font-semibold text-[14px] text-[#212529] leading-snug mt-2 line-clamp-2 group-hover:text-pd">${e(j.title)}</div>
 <div class="flex flex-wrap items-center gap-1.5 mt-3 text-[11px]"><span class="mini !bg-pd">Jobs</span><span class="text-ink-muted"><i class="fa fa-location-dot mr-1 text-pd"></i>${e(j.city)}</span><span class="text-ink-muted">· ${e(j.type)}</span></div>
 <div class="text-[11px] text-ink-muted mt-2 border-t border-line pt-2">Laatste update – ${e(j.upd)}</div></a>`};
