/* Entrenador Académico · Render principal y arranque */
/* ===================== Render ===================== */
const SECTIONS=[
  {key:'inicio',label:'Inicio',tabs:[]},
  {key:'planificacion',label:'Planificación',tabs:[['hoy','Hoy'],['semana','Semana']]},
  {key:'academico',label:'Académico',tabs:[['ramos','Mis ramos y horario'],['syllabus','Syllabus y fechas'],['notas','Notas y ponderaciones'],['salud','Mapa de calor'],['datos','Datos de ramos']]},
  {key:'bienestar',label:'Bienestar',tabs:[['checkin','Check-in'],['respiracion','Respiración y meditaciones'],['pausas','Pausas rápidas'],['apoyo','Apoyo']]},
  {key:'social',label:'Social',tabs:[['amigos','Amigos']]},
  {key:'ajustes',label:'Ajustes',tabs:[['perfil','Perfil'],['tema','Apariencia'],['privacidad','Privacidad'],['ejemplos','Datos de ejemplo']]}
];
const ROUTE={
  inicio:{section:'inicio',tab:'inicio'},
  hoy:{section:'planificacion',tab:'hoy'},semana:{section:'planificacion',tab:'semana'},
  ramos:{section:'academico',tab:'ramos'},syllabus:{section:'academico',tab:'syllabus'},notas:{section:'academico',tab:'notas'},
  salud:{section:'academico',tab:'salud'},calor:{section:'academico',tab:'salud'},datos:{section:'academico',tab:'datos'},
  checkin:{section:'bienestar',tab:'checkin'},bienestar:{section:'bienestar',tab:'checkin'},respiracion:{section:'bienestar',tab:'respiracion'},
  pausas:{section:'bienestar',tab:'pausas'},apoyo:{section:'bienestar',tab:'apoyo'},
  amigos:{section:'social',tab:'amigos'},
  perfil:{section:'ajustes',tab:'perfil'},tema:{section:'ajustes',tab:'tema'},apariencia:{section:'ajustes',tab:'tema'},
  privacidad:{section:'ajustes',tab:'privacidad'},ejemplos:{section:'ajustes',tab:'ejemplos'}
};
const FIRST={inicio:'inicio',planificacion:'hoy',academico:'ramos',bienestar:'checkin',social:'amigos',ajustes:'perfil'};
const ROUTE_BY_PATH={};
Object.keys(ROUTE).forEach(k=>{const r=ROUTE[k],p=r.section+'/'+r.tab;if(!ROUTE_BY_PATH[p])ROUTE_BY_PATH[p]=r});
function routeFor(t){const k=String(t||'');return ROUTE[k]||(FIRST[k]?ROUTE[FIRST[k]]:ROUTE.inicio)}
function hashFor(r){return r.section==='inicio'?'#/inicio':'#/'+r.section+'/'+r.tab}
function routeFromHash(){
  const raw=decodeURIComponent(location.hash.replace(/^#\/?/,'')).replace(/\/+$/,'');
  if(!raw||raw==='inicio')return ROUTE.inicio;
  const p=raw.split('/'),hit=ROUTE_BY_PATH[p[0]+'/'+(p[1]||'')];
  if(hit)return hit;
  return FIRST[p[0]]?ROUTE[FIRST[p[0]]]:ROUTE.inicio;
}
function goFromRoute(){const r=routeFromHash();if(r.section!==section||r.tab!==tab)go(r.tab,true)}
function render(){
  applyTheme();
  if(LOCKED){document.body.classList.remove('landing-active');$('#nav').innerHTML='';$('#app').innerHTML=lockView();const lp=$('#lp');if(lp)try{lp.focus()}catch(e){}return}
  if(!S.profile||!S.profile.onboarded){document.body.classList.add('landing-active');$('#nav').innerHTML='';$('#app').innerHTML=viewLanding();const n=$('#reg-name');if(n)try{n.focus()}catch(e){}return}
  document.body.classList.remove('landing-active');
  const who=S.profile&&S.profile.name?`<span class="hud-user"> · ${esc(S.profile.name)}</span>`:'';
  const brand=document.querySelector('.brand');if(brand)brand.innerHTML='Entrenador Académico'+who;
  if(section==='inicio')$('#nav').innerHTML='';
  else{
    const sec=SECTIONS.find(s=>s.key===section)||SECTIONS[0];
    const tabs=sec.tabs.map(([k,v])=>`<button class="${k===tab?'on':''}" onclick="go('${k}')">${v}</button>`).join('');
    $('#nav').innerHTML=`<button class="back" onclick="go('inicio')">← Inicio</button><span class="crumb">${sec.label}</span><span class="subtabs">${tabs}</span>`;
  }
  const app=$('#app');
  const views={inicio:viewInicio,hoy:viewHoy,semana:viewSemana,ramos:viewRamos,syllabus:viewSyllabus,notas:viewNotas,salud:viewSalud,datos:viewDatos,
    checkin:viewCheckin,bienestar:viewBienestar,respiracion:viewRespiracion,pausas:viewPausas,apoyo:viewApoyo,
    amigos:viewAmigos,perfil:viewPerfil,tema:viewTema,privacidad:viewPrivacidad,ejemplos:viewDatosEjemplo};
  app.innerHTML=(views[tab]||viewInicio)();
  app.style.animation='none';void app.offsetWidth;app.style.animation='';
}
function start(){
  loadDraft();
  if(S.lastPlan!==today()&&S.courses.length)replanAll();
  const r=routeFromHash();section=r.section;tab=r.tab;
  const h=hashFor(r);
  try{if(location.hash!==h)history.replaceState(null,'',h)}catch(e){try{location.hash=h}catch(f){}}
  render();
  if(typeof socialBoot==='function')socialBoot();
  if(tab==='amigos'&&typeof socialOpenTab==='function')socialOpenTab();
  if(typeof maybeShowTour==='function')maybeShowTour();
}
window.addEventListener('hashchange',goFromRoute);
window.addEventListener('popstate',goFromRoute);
boot();
if(LOCKED)render();else start();

/* App instalable y utilizable sin internet (el service worker solo funciona en https o localhost) */
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}   // pide que el navegador no borre estos datos solo
