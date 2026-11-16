/* Entrenador Académico · Render principal y arranque */
/* ===================== Render ===================== */
const TABS=[['hoy','Hoy'],['semana','Semana'],['ramos','Ramos'],['bienestar','Bienestar'],['apoyo','Apoyo'],['salud','Mapa de calor'],['datos','Datos de ramos']];
function render(){
  if(LOCKED){$('#nav').innerHTML='';$('#app').innerHTML=lockView();const lp=$('#lp');if(lp)try{lp.focus()}catch(e){}return}
  $('#nav').innerHTML=TABS.map(([k,v])=>`<button class="${k===tab?'on':''}" onclick="go('${k}')">${v}</button>`).join('');
  const app=$('#app');
  app.innerHTML={hoy:viewHoy,semana:viewSemana,ramos:viewRamos,bienestar:viewBienestar,apoyo:viewApoyo,salud:viewSalud,datos:viewDatos}[tab]();
  app.style.animation='none';void app.offsetWidth;app.style.animation='';
}
function start(){loadDraft();if(S.lastPlan!==today()&&S.courses.length)replanAll();render()}
boot();
if(LOCKED)render();else start();

/* App instalable y utilizable sin internet (el service worker solo funciona en https o localhost) */
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}   // pide que el navegador no borre estos datos solo
