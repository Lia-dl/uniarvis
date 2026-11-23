const LOGRO_CANDADO='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
function logrosRachaCheckins(){
  const fechas=new Set(((S&&S.wellbeing&&S.wellbeing.diary)||[]).filter(e=>e&&e.energy!=null).map(e=>e.date));
  let d=fechas.has(today())?today():addDays(today(),-1),n=0;
  while(fechas.has(d)&&n<60){n++;d=addDays(d,-1)}
  return n;
}
function logrosDiasApp(){
  const desde=(S&&S.createdAt)||today();
  return clamp(diffDays(desde,today())+1,0,3650);
}
function logrosMarcarPlanSemanal(){
  if(!S||!Array.isArray(S.tasks)||!S.tasks.length)return;
  const mon=mondayOf(today()),fin=addDays(mon,6);
  const semana=S.tasks.filter(t=>t.date>=mon&&t.date<=fin);
  if(semana.length&&semana.every(t=>t.done))arvisConfig().planSemanal=true;
}
const LOGROS=[
  {id:'primer-pomodoro',accesorio:'gorro',nombre:'Primer foco',listo:()=>arvisConfig().pomodoros>=1},
  {id:'cinco-pomodoros',accesorio:'lentes',nombre:'Cinco focos',listo:()=>arvisConfig().pomodoros>=5,
    progreso:()=>Math.min(5,arvisConfig().pomodoros)+'/5'},
  {id:'primer-mazo',accesorio:'bufanda',nombre:'Memoria en marcha',listo:()=>arvisConfig().mazos>=1},
  {id:'tres-checkins',accesorio:'audifonos',nombre:'Sintonía',listo:()=>logrosRachaCheckins()>=3,
    progreso:()=>Math.min(3,logrosRachaCheckins())+'/3'},
  {id:'plan-semanal',accesorio:'birrete',nombre:'Plan cumplido',listo:()=>arvisConfig().planSemanal===true},
  {id:'siete-dias',accesorio:'capa',nombre:'Siete días',listo:()=>logrosDiasApp()>=7,
    progreso:()=>Math.min(7,logrosDiasApp())+'/7'}
];
const logroPorAccesorio=id=>LOGROS.find(l=>l.accesorio===id)||null;
function logrosRevisar(silencioso){
  const c=arvisConfig(),antes=c.desbloqueados.slice();
  LOGROS.forEach(l=>{
    if(l.listo()&&c.desbloqueados.indexOf(l.accesorio)<0)c.desbloqueados.push(l.accesorio);
  });
  if(c.desbloqueados.length===antes.length)return;
  save();
  if(silencioso===true)return;
  const id=c.desbloqueados.find(x=>antes.indexOf(x)<0),item=id&&ARVIS_ITEMS[id];
  if(item)toast('¡Desbloqueaste '+item.nombre+'!');
}
function logrosEquipar(id){
  const c=arvisConfig(),item=ARVIS_ITEMS[id];
  if(!item||c.desbloqueados.indexOf(id)<0)return;
  c.equipado=c.equipado===id?'':id;
  c.vistos=c.desbloqueados.slice();
  save();render();
}
function viewArvis(){
  const c=arvisConfig();
  const tarjetas=Object.keys(ARVIS_ITEMS).map(id=>{
    const item=ARVIS_ITEMS[id],l=logroPorAccesorio(id),on=c.desbloqueados.indexOf(id)>=0,eq=c.equipado===id;
    const progreso=(!on&&l&&l.progreso)?' · '+l.progreso():'';
    const estado=on?(eq?'Equipado':'Desbloqueado'):item.logro+progreso;
    return `<button type="button" class="accesorio${on?' on':''}${eq?' eq':''}${on?'':' lock'}" aria-pressed="${eq?'true':'false'}" ${on?`onclick="logrosEquipar('${id}')"`:'disabled'}>
      <span class="accesorio-preview">${arvisFigura('normal',72,'',id)}</span>
      <span class="accesorio-copy"><b>${esc(item.nombre)}</b><span class="mute">${esc(estado)}</span></span>
      ${on?'':`<span class="accesorio-candado">${LOGRO_CANDADO}</span>`}
    </button>`;
  }).join('');
  const lista=LOGROS.map(l=>{
    const item=ARVIS_ITEMS[l.accesorio],on=c.desbloqueados.indexOf(l.accesorio)>=0,p=l.progreso?l.progreso():'1/1';
    return `<li class="logro-fila${on?' on':''}"><span class="logro-marcador" aria-hidden="true">${on?'✓':'○'}</span>
      <span><b>${esc(l.nombre)}</b> <span class="mute">· ${esc(item.nombre)}</span>
      <span class="mute">${esc(item.logro)}${on?'':` · ${esc(p)}`}</span></span></li>`;
  }).join('');
  return `${screenHelp('arvis')}<div class="card arvis-personalizar">
    <h2>Personaliza a Arvis</h2>
    <div class="arvis-preview">${arvisFigura(arvisEstadoDelDia(),180)}
      <div><h3 style="margin-bottom:4px">Tu compañero</h3>
      <p class="mute" style="margin:0">Elige un accesorio para verlo en el inicio, el pomodoro y las flashcards. Los accesorios se desbloquean con hábitos sostenibles, sin apuro.</p></div></div>
  </div>
  <div class="card"><h3>Accesorios</h3>
    <p class="mute">Toca uno para ponérselo; tócalo de nuevo para quitarlo.</p>
    <div class="accesorios">${tarjetas}</div>
  </div>
  <div class="card"><h3>Logros</h3><ul class="logro-lista">${lista}</ul>
    <p class="mute" style="margin-bottom:0">Tu progreso se guarda solo en este navegador, junto al resto de la app.</p>
  </div>`;
}
