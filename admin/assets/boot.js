/* Paydates V2 admin — start: shell + pagina renderen */
(function(){const A=window.PDXA;if(!A)return;A.shell();
if(A.ADMIN_ONLY.includes(A.PAGE)&&A.me.role!=='admin'){A.main().innerHTML=A.head('Geen rechten','Alleen de rol <b>admin</b> mag deze pagina beheren (jij bent '+A.P.esc(A.me.role)+').');}
else (A.R[A.PAGE]||A.R.index)();})();
