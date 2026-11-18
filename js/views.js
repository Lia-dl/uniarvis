/* Entrenador Académico · Vistas (HTML de cada pestaña) */
/* ===================== Vistas ===================== */
function viewLanding(){
  return `<div class="landing"><div class="landing-bg"></div><div class="landing-panel hud">
    <div class="hud-head"><span class="hud-mark">◈</span> SISTEMA A.R.V.I.S. · INTERFAZ ACADÉMICA</div>
    <h1 class="landing-title">Entrenador Académico</h1>
    <p class="landing-sub">Inicializa tu perfil para personalizar el panel HUD de tu semestre.</p>
    <div class="hud-form">
      <label>Identificación / Nombre<input id="reg-name" type="text" maxlength="60" placeholder="Tu nombre"></label>
      <label>Carrera / Programa<input id="reg-career" type="text" maxlength="80" placeholder="Tu carrera"></label>
      <button class="btn hud-btn" onclick="registerProfile()">INICIAR SISTEMA</button>
    </div>
    <p class="mute hud-note">Los datos se guardan solo en este navegador (localStorage).</p>
  </div></div>`;
}
function homeNotice(){
  const t0=today();
  const crit=criticalClusters().filter(g=>diffDays(t0,g.start)<=28)[0];
  if(crit)return `<div class="banner go"><b>Semana exigente del ${dshort(crit.start)} al ${dshort(crit.end)}</b><br>${crit.events.length} fechas importantes juntas. <button class="lnk" onclick="go('semana')">Ver planificación</button></div>`;
  const w=earlyWarnings().filter(x=>S.dismissed[x.key]!==t0)[0];
  if(w)return `<div class="banner soft"><b>${w.title}</b> ${w.text} <button class="lnk" onclick="go('apoyo')">Ver apoyo</button></div>`;
  return '';
}
function viewInicio(){
  const name=S.profile&&S.profile.name?esc(S.profile.name):'';
  const descs={planificacion:'Tu día y tu semana, sin sobrecargas.',academico:'Ramos, fechas, notas y datos.',bienestar:'Check-in, pausas y apoyo.',social:'Coordina sesiones con amigos.',ajustes:'Perfil, tema y privacidad.'};
  const cards=SECTIONS.filter(s=>s.key!=='inicio').map((s,i)=>`<button class="home-card" onclick="go('${s.tabs[0][0]}')">
    <span class="home-icon">${String(i+1).padStart(2,'0')}</span>
    <span class="home-copy"><b>${s.label}</b><span>${descs[s.key]||''}</span></span>
    <span class="home-arrow" aria-hidden="true">→</span></button>`).join('');
  return `
  <div class="home-head"><div><h2>Hola, ${name}</h2><p class="mute" style="margin-bottom:0">Elige por dónde empezar hoy.</p></div></div>
  ${!S.consent?consentCard():''}
  ${homeNotice()}
  <div class="home-menu">${cards}</div>`;
}
function viewPerfil(){
  const p=S.profile||{};
  return `<div class="card"><h2>Perfil</h2>
    <p class="mute" style="margin-top:0">Tu nombre y tu carrera se guardan solo en este navegador y sirven para personalizar el saludo y el plan.</p>
    <div class="hud-form" style="max-width:520px">
      <label>Nombre<input id="pf-name" type="text" maxlength="60" value="${esc(p.name||'')}"></label>
      <label>Carrera / Programa<input id="pf-career" type="text" maxlength="80" value="${esc(p.career||'')}"></label>
      <button class="btn" onclick="saveProfile()">Guardar cambios</button>
    </div></div>`;
}
function consentCard(){
  return `<div class="card"><h3>Antes de empezar: tus datos de bienestar</h3>
    <p style="margin-top:0">El check-in y el diario guardan datos sensibles (energía, ánimo, sueño y notas). Así funcionan:</p>
    <ul style="margin:0 0 10px 18px;padding:0">
      <li>Se guardan <b>solo en este navegador</b>. Aunque actives Amigos, estos datos nunca se envían al servidor ni están cifrados: si compartes este equipo, quizá no convenga usarlo.</li>
      <li>Los usa la propia app para ajustar tu plan y mostrarte patrones. No hay diagnósticos, puntajes ni rachas.</li>
      <li>Puedes exportarlos, revocar el permiso o borrarlos cuando quieras (en <i>Ajustes → Privacidad</i>).</li>
    </ul>
    <div class="row"><button class="btn" onclick="setConsent(true)">Acepto y quiero usar el check-in</button>
    <button class="btn sec" onclick="setConsent(false)">Ahora no</button></div>
    <p class="mute" style="margin-bottom:0">Sin check-in la app igual funciona: calcula tu capacidad con tus clases y tu ritmo.</p></div>`;
}
function scaleRow(label,key,arr){
  return `<div class="ci-row"><b>${label}</b><div class="scale">${arr.map((x,i)=>`<button class="sc ${draft[key]===i+1?'on':''}" aria-pressed="${draft[key]===i+1}" onclick="setCi('${key}',${i+1})"><span>${x[0]}</span>${x[1]}</button>`).join('')}</div></div>`;
}
function checkinForm(full){
  if(!S.consent)return consentCard();
  if(!S.consent.health)return `<div class="card"><h3>Check-in diario</h3><p class="mute">Está desactivado: tu plan usa solo tus clases y tu ritmo.</p><button class="btn sec" onclick="resetConsent()">Ver cómo funciona y activarlo</button></div>`;
  if(!draft)loadDraft();
  const e=ci(today());
  if(e&&!ciEdit&&!full)return `<div class="card"><div class="row" style="justify-content:space-between"><span><b>Check-in de hoy</b> · Energía ${ENERGY[e.energy-1][1].toLowerCase()} · Ánimo ${MOODS[e.mood-1][1].toLowerCase()} · Sueño ${SLEEP[e.sleep-1][1]}</span><button class="btn sec" onclick="editCi()">Cambiar</button></div></div>`;
  return `<div class="card"><h3>Check-in de hoy <span class="mute">· 20 segundos</span></h3>
    ${scaleRow('¿Cuánta energía tienes?','energy',ENERGY)}${scaleRow('¿Cómo está tu ánimo?','mood',MOODS)}${scaleRow('¿Cuánto dormiste anoche?','sleep',SLEEP)}
    ${full?`<p class="mute" style="margin:10px 0 6px">¿Qué hay detrás? (opcional)</p>
      <div class="row" style="gap:6px">${FEEL_TAGS.map(t=>`<button class="tag sel ${draft.tags.includes(t)?'on':''}" aria-pressed="${draft.tags.includes(t)}" onclick="toggleTag('${t}')">${t}</button>`).join('')}</div>
      <textarea style="margin-top:10px" placeholder="Si quieres, escribe cómo estuvo tu día…" oninput="draft.note=this.value">${esc(draft.note)}</textarea>`:''}
    <div class="row" style="margin-top:8px"><button class="btn" onclick="saveCheckin()">${e?'Actualizar':'Guardar'} y ajustar mi plan</button>
      ${e&&ciEdit&&!full?'<button class="btn sec" onclick="ciEdit=false;render()">Cancelar</button>':''}</div>
    <p class="mute" style="margin-bottom:0">Con esto ajusto tu capacidad de hoy y reacomodo las tareas por ti.</p></div>`;
}
function energyBoxes(cap,min,done){
  const n=Math.ceil(cap/25),minIdx=Math.min(n-1,Math.ceil(min/25)-1),locked=done>=cap;
  let h='<div class="boxes">';
  for(let i=0;i<n;i++){
    const f=clamp((done-i*25)/25,0,1);
    h+=`<div class="box ${i===minIdx?'min':''} ${i===n-1?'last':''} ${locked?'lockd':''}" style="--f:${f*100}%"></div>`;
  }
  return h+'</div><div class="mute">Cada caja = 25 min. Borde ámbar = tu mínimo de hoy. Última caja = tu capacidad de hoy.</div>';
}
const evDate=t=>{const e=S.events.find(x=>x.id===t.eventId);return e?e.date:'9999'};
function taskRow(t,locked){
  return `<div class="task ${t.done?'done':''}"><input type="checkbox" ${t.done?'checked':''} ${locked&&!t.done?'disabled':''} onchange="toggleTask('${t.id}')">
    <span class="dot" style="background:${ccolor(t.courseId)}"></span>
    <span class="t" style="flex:1">${esc(t.title)}<br><span class="mute">${esc(cname(t.courseId))}</span></span><span class="tag">${t.minutes} min</span></div>`;
}
function viewHoy(){
  const t0=today(),info=capInfo(t0),cap=info.val,min=minFor(t0),done=doneToday(),locked=done>=cap,met=done>=min,low=lowMode(t0);
  const todays=S.tasks.filter(t=>t.date===t0).sort((a,b)=>a.done-b.done||evDate(a).localeCompare(evDate(b)));
  const pend=todays.filter(t=>!t.done);
  const nxt=S.tasks.filter(t=>!t.done&&t.date>t0).sort((a,b)=>a.date.localeCompare(b.date))[0];
  let banner;
  if(locked)banner=`<div class="banner lock"><b>Cuota completada.</b> Hoy no se asigna materia nueva. Descansar ya es parte del plan: no hay nada que compensar ni de qué sentirse culpable.</div>`;
  else if(met)banner=`<div class="banner min"><b>Lo esencial de hoy está hecho.</b> Puedes seguir hasta ${cap-done} min más o cerrar el día con tranquilidad.</div>`;
  else if(low)banner=`<div class="banner soft">Hoy es un día de energía baja: <b>solo lo esencial</b>. Te faltan ${min-done} min; con eso el día cuenta.</div>`;
  else banner=`<div class="banner go">Te faltan <b>${min-done} min</b> para tu mínimo de hoy. Con una micro-tarea corta ya avanzas.</div>`;
  const notes=[];
  if(S.adapt&&S.adapt.date===t0){
    if(S.adapt.low)notes.push(`Según tu check-in, hoy dejé solo lo esencial (${min} min)${S.adapt.n?` y moví ${S.adapt.n} micro-tarea(s) a otros días`:''}. No tienes que reorganizar nada.`);
    else if(S.adapt.n)notes.push(`Ajusté tu plan según tu check-in: moví ${S.adapt.n} micro-tarea(s) para cuidar tu energía.`);
  }
  if(S.moved&&S.moved.date===t0)notes.push(`Reacomodé ${S.moved.n} micro-tarea(s) que quedaron de días anteriores. Ya están repartidas en los próximos días; no se acumula nada.`);
  let rows='',acc=0;
  todays.forEach((t,i)=>{
    rows+=taskRow(t,locked);
    if(!t.done){acc+=t.minutes;if(acc>=50&&todays.slice(i+1).some(x=>!x.done)){rows+=`<div class="pause">🌿 <span style="flex:1">Pausa de 5 min: estírate o haz 1 minuto de respiración.</span><button class="btn sec" onclick="goBreath('larga')">Respirar</button></div>`;acc=0}}
  });
  const opts=S.courses.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  return `
  ${!S.courses.length?'<div class="card empty">Aún no tienes ramos. Agrégalos en "Mis ramos y horario" o <button class="btn" onclick="go(\'ejemplos\')">carga datos de ejemplo</button></div>':''}
  ${checkinForm(false)}
  ${warnHtml()}${criticalHtml()}
  ${S.soft&&softOn(t0)?`<div class="banner soft">Modo suave activo hasta el ${dshort(S.soft.until)}: tu carga está al 75%. <button class="lnk" onclick="endSoft()">Desactivar</button></div>`:''}
  ${notes.map(n=>`<div class="banner info">${n}</div>`).join('')}
  ${socialTodayHtml()}
  ${backupHtml()}
  <div class="card"><h2>Hoy</h2>
    <div class="stats">
      <div class="stat"><b>${done}'</b><span class="mute">estudiados hoy</span></div>
      <div class="stat"><b>${min}'</b><span class="mute">mínimo de hoy</span></div>
      <div class="stat"><b>${cap}'</b><span class="mute">capacidad de hoy</span></div>
    </div>
    ${banner}${energyBoxes(cap,min,done)}
    <details><summary>¿Cómo se calculó mi capacidad de hoy?</summary><ul>${capExplain(info).map(x=>`<li>${x}</li>`).join('')}</ul></details>
  </div>
  <div class="grid2">
    <div class="card"><h3>Plan de hoy</h3>
      ${rows||'<div class="empty">No hay micro-tareas para hoy.</div>'}
      ${locked?'<p class="mute">No se adelanta ni se asigna más materia hoy.</p>':
        (low?'<p class="mute">Hoy no hace falta adelantar nada.</p>':(!pend.length&&nxt?`<button class="btn sec" onclick="pullNext()">Adelantar la siguiente micro-tarea (${nxt.minutes} min)</button>`:''))}
    </div>
    <div>
      ${pauseCard()}
      <div class="card"><h3>Registrar estudio libre</h3>
        <div class="row"><select id="fc">${opts}</select><input id="fm" type="number" min="5" step="5" value="25" style="width:80px"> min
        <button class="btn" ${locked||!S.courses.length?'disabled':''} onclick="logFree()">Registrar</button></div>
      </div>
      <div class="card"><h3>Mi mínimo viable (día normal)</h3>
        <div class="row"><input id="smin" type="number" value="${S.settings.min}" style="width:80px"> min
        <button class="btn sec" onclick="setMin()">Guardar</button></div>
        <p class="mute" style="margin-bottom:0">La capacidad máxima ya no es un número fijo: se calcula cada día.</p>
      </div>
    </div>
  </div>`;
}
function viewSemana(){
  const days=[...Array(7)].map((_,i)=>addDays(weekStart,i)),t0=today(),H0=7,H1=22,HH=44;
  const crit=criticalClusters(),isCrit=d=>crit.some(g=>d>=g.start&&d<=g.end);
  let h=`<div class="card"><div class="row" style="justify-content:space-between;margin-bottom:10px">
    <h2 style="margin:0">Semana ${dshort(days[0])} – ${dshort(days[6])}</h2>
    <div class="row"><button class="btn sec" onclick="weekStart=addDays(weekStart,-7);render()">←</button>
    <button class="btn sec" onclick="weekStart=mondayOf(today());render()">Hoy</button>
    <button class="btn sec" onclick="weekStart=addDays(weekStart,7);render()">→</button></div></div>
    <div class="mute" style="margin-bottom:8px">Subrayado ámbar = tramo exigente (3 fechas importantes en 5 días).</div>
    <div class="calwrap"><div class="cal">`;
  h+='<div class="hd"></div>'+days.map((d,i)=>`<div class="hd ${d===t0?'today':''} ${isCrit(d)?'crit':''}">${DAYS[i]} ${parse(d).getDate()}</div>`).join('');
  h+='<div class="lbl">Fechas</div>'+days.map(d=>`<div>${S.events.filter(e=>e.date===d).map(e=>
    `<div class="chip" style="border-color:${ccolor(e.courseId)}" title="${esc(e.title)}"><b>${TYPE_LABEL[e.type]}</b> ${esc(cname(e.courseId))}<br>${esc(e.title)}</div>`).join('')}</div>`).join('');
  h+='<div class="lbl">Plan</div>'+days.map(d=>`<div>${S.tasks.filter(t=>t.date===d).map(t=>
    `<div class="chip ${t.done?'done':''}" style="border-color:${ccolor(t.courseId)}">${t.minutes}' ${esc(cname(t.courseId))}</div>`).join('')}<div class="mute">${dayLoad(d)||capFor(d)?dayLoad(d)+' / '+capFor(d)+' min':''}</div></div>`).join('');
  h+=`<div class="lbl" style="padding:0;position:relative;height:${(H1-H0)*HH}px">${[...Array(H1-H0)].map((_,i)=>`<div style="position:absolute;top:${i*HH}px;font-size:10px;padding-left:4px">${pad(H0+i)}:00</div>`).join('')}</div>`;
  h+=days.map((d,i)=>`<div class="col ${d===t0?'today':''}" style="height:${(H1-H0)*HH}px">${S.classes.filter(k=>k.day===i).map(k=>{
    const top=(toMin(k.start)-H0*60)/60*HH,ht=(toMin(k.end)-toMin(k.start))/60*HH;
    return `<div class="blk" style="top:${top}px;height:${ht}px;background:${ccolor(k.courseId)}">${esc(cname(k.courseId))}<br>${k.start}–${k.end}</div>`}).join('')}${socialWeekBlocks(d,i)}</div>`).join('');
  return h+'</div></div></div>'+criticalHtml();
}
function gradeSummary(grades){
  const gs=grades||[];let wsum=0,ws=0;gs.forEach(g=>{const w=+g.weight||0,s=+g.score||0;if(w>0){wsum+=w;ws+=s*w}});
  const avg=wsum?ws/wsum:null;return {avg,wsum:Math.round(wsum*100)/100,rem:Math.round((100-wsum)*100)/100};
}
function gradesCard(c){
  const gs=c.grades||[],sum=gradeSummary(gs);
  const rows=gs.map(g=>`<tr><td><input value="${esc(g.name)}" onchange="setGrade('${c.id}','${g.id}','name',this.value)"></td>
    <td><input type="number" step="0.1" style="width:90px" value="${g.score}" onchange="setGrade('${c.id}','${g.id}','score',this.value)"></td>
    <td><input type="number" step="1" min="0" max="100" style="width:80px" value="${g.weight}" onchange="setGrade('${c.id}','${g.id}','weight',this.value)">%</td>
    <td><button class="btn del" onclick="delGrade('${c.id}','${g.id}')">Quitar</button></td></tr>`).join('');
  return `<div class="card grades-card"><div class="row" style="justify-content:space-between;align-items:flex-start">
      <div><h3 style="margin:0"><span class="dot" style="background:${c.color};display:inline-block;margin-right:6px"></span>${esc(c.name)}</h3>
      <div class="mute">Promedio actual (ponderado): <b class="hud-num">${sum.avg!=null?sum.avg.toFixed(2):'—'}</b> · Ponderado: ${sum.wsum}% ${sum.wsum>100?'<span style="color:var(--bad)">(&gt;100%)</span>':''} · Restante: ${Math.max(0,sum.rem)}%</div></div></div>
    ${gs.length?`<table class="grades-tbl"><tr><th>Evaluación</th><th>Nota</th><th>Pond.</th><th></th></tr>${rows}</table>`:'<div class="mute" style="margin-top:8px">Sin evaluaciones registradas.</div>'}
    <div class="row" style="margin-top:10px">
      <input id="gn-${c.id}" placeholder="Evaluación (ej. Certamen 1)">
      <input id="gs-${c.id}" type="number" step="0.1" placeholder="Nota" style="width:90px">
      <input id="gw-${c.id}" type="number" step="1" min="0" max="100" placeholder="%" style="width:80px">
      <button class="btn sec" onclick="addGrade('${c.id}')">Agregar nota</button></div></div>`;
}
function viewRamos(){
  return `
  <div class="grid2">
    <div class="card"><h2>Mis ramos</h2>
      ${S.courses.map(c=>{const col=collective(c.name);return `<div class="task"><span class="dot" style="background:${c.color}"></span><b style="flex:1">${esc(c.name)}</b>
        ${col?`<span class="mute">datos: dif. ${col.diff.toFixed(1)} <button class="lnk" onclick="setDiff('${c.id}',${Math.round(col.diff)})">usar</button></span>`:''}
        <span class="mute">dificultad</span>
        <select onchange="setDiff('${c.id}',this.value)">${[1,2,3,4,5].map(n=>`<option ${n===c.difficulty?'selected':''}>${n}</option>`).join('')}</select>
        <button class="btn del" onclick="delCourse('${c.id}')">Eliminar</button></div>`}).join('')||'<div class="empty">Sin ramos todavía.</div>'}
      <div class="row" style="margin-top:10px"><input id="cn" placeholder="Nombre del ramo">
        <select id="cd" title="Dificultad">${[1,2,3,4,5].map(n=>`<option ${n===3?'selected':''}>${n}</option>`).join('')}</select>
        <button class="btn" onclick="addCourse()">Agregar</button></div>
      <p class="mute">Más dificultad = más minutos de preparación, más días de margen y micro-tareas más cortas.</p>
    </div>
    <div class="card"><h2>Horario de clases</h2>
      <div class="row"><select id="kc">${S.courses.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
        <select id="kd">${DAYS.map((d,i)=>`<option value="${i}">${d}</option>`).join('')}</select>
        <input id="ka" type="time" value="08:10"><input id="kb" type="time" value="09:40">
        <button class="btn" onclick="addClass()">Agregar</button></div>
      <div style="margin-top:8px">${S.classes.map(k=>`<div class="task"><span class="dot" style="background:${ccolor(k.courseId)}"></span>
        <span style="flex:1">${esc(cname(k.courseId))} · ${DAYS[k.day]} ${k.start}–${k.end}</span><button class="btn del" onclick="delClass('${k.id}')">Quitar</button></div>`).join('')}</div>
      <p class="mute">Tus horas de clase definen cuánto puedes estudiar cada día.</p>
    </div>
  </div>`;
}
function viewSyllabus(){
  const opts=S.courses.map(c=>`<option value="${c.id}" ${c.id===sylCourse?'selected':''}>${esc(c.name)}</option>`).join('');
  const sorted=[...S.events].sort((a,b)=>a.date.localeCompare(b.date));
  return `
  <div class="card"><h2>Subir syllabus</h2>
    <div class="row" style="margin-bottom:8px"><select onchange="sylCourse=this.value"><option value="">Elige el ramo…</option>${opts}</select>
      <input type="file" accept=".pdf,.txt,.md,.csv" onchange="onFile(this)"></div>
    <textarea placeholder="…o pega aquí el texto del syllabus (calendario de evaluaciones)" oninput="sylText=this.value">${esc(sylText)}</textarea>
    <div class="row" style="margin-top:8px"><button class="btn" onclick="analyze()">Analizar syllabus</button>
      <span class="mute">La lectura automática puede equivocarse: siempre te pido confirmar antes de agregar.</span></div>
    ${pending.length?`<h3 style="margin-top:14px">Fechas detectadas · revisa y corrige antes de agregar</h3>
      <table><tr><th></th><th>Fecha</th><th>Tipo</th><th>Descripción</th></tr>
      ${pending.map((p,i)=>`<tr><td><input type="checkbox" ${p.keep?'checked':''} onchange="setPending(${i},'keep',this.checked)"></td>
        <td><input type="date" value="${p.date}" onchange="setPending(${i},'date',this.value)"></td>
        <td><select onchange="setPending(${i},'type',this.value)">${Object.entries(TYPE_LABEL).map(([k,v])=>`<option value="${k}" ${k===p.type?'selected':''}>${v}</option>`).join('')}</select></td>
        <td><input style="width:100%" value="${esc(p.title)}" onchange="setPending(${i},'title',this.value)">${p.note?`<div class="mute">⚠ ${esc(p.note)}</div>`:''}</td></tr>`).join('')}</table>
      <button class="btn" style="margin-top:8px" onclick="addPending()">Confirmar y agregar al calendario</button>`:''}
  </div>
  <div class="card"><h2>Fechas importantes</h2>
    <div class="row" style="margin-bottom:8px"><select id="ec">${S.courses.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
      <input id="et" placeholder="Título"><input id="ed" type="date">
      <select id="ey">${Object.entries(TYPE_LABEL).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>
      <button class="btn" onclick="addEvent()">Agregar manualmente</button>
      <button class="btn sec" onclick="exportICS()" ${S.events.length?'':'disabled'}>Exportar a calendario (.ics)</button></div>
    ${sorted.map(e=>`<div class="task"><span class="dot" style="background:${ccolor(e.courseId)}"></span>
      <span style="flex:1">${dshort(e.date)} · <b>${TYPE_LABEL[e.type]}</b> · ${esc(cname(e.courseId))} — ${esc(e.title)}${e.early?' <span class="tag">margen extra</span>':''}</span>
      <button class="btn del" onclick="delEvent('${e.id}')">Quitar</button></div>`).join('')||'<div class="empty">Sin fechas registradas.</div>'}
  </div>`;
}
function viewNotas(){
  return `<div class="card"><h2>Notas y ponderaciones</h2>
    <p class="mute" style="margin-top:0">Registra evaluaciones por ramo con su nota y ponderación (%). El promedio ponderado se calcula automáticamente y se guarda en este navegador.</p>
    ${S.courses.length?S.courses.map(gradesCard).join(''):'<div class="empty">Agrega un ramo para registrar sus notas.</div>'}
  </div>`;
}
function viewDatosEjemplo(){
  return `<div class="card"><h2>Datos de ejemplo</h2>
    <p class="mute" style="margin-top:0">Carga ramos, clases, fechas, sesiones pasadas y registros de bienestar falsos para recorrer la app sin datos personales. Reemplaza tus datos actuales.</p>
    <div class="row"><button class="btn sec" onclick="loadDemo()">Cargar datos de ejemplo</button>
    <span class="mute">Las demás opciones de datos están en Ajustes → Privacidad, donde también puedes descargar un respaldo antes.</span></div></div>`;
}
function trend(key,label,color){
  const dates=[...Array(14)].map((_,i)=>addDays(today(),i-13));
  return `<div class="mute">${label}</div><div class="trend">${dates.map(d=>{const e=ci(d);const v=e?e[key]:0;
    return `<i title="${dshort(d)}${v?': '+v+' de 5':': sin registro'}" style="height:${v?v*20:5}%;background:${v?color:'var(--line)'}"></i>`}).join('')}</div>`;
}
function viewCheckin(){
  if(!draft)loadDraft();
  const ok=S.consent&&S.consent.health,pt=ok?patterns():null;
  const recent=[...S.wellbeing.diary].sort((a,b)=>b.date.localeCompare(a.date));
  return `
  <div class="card"><h2>Check-in, diario y patrones</h2>
    <div class="mute">Guía de autocuidado: no es un diagnóstico ni un tratamiento. Tus registros se guardan solo en este navegador.</div></div>
  ${warnHtml()}
  ${checkinForm(true)}
  ${ok?`<div class="card"><h3>Patrones: cómo se cruza tu bienestar con tu carga</h3>
    ${pt.need?`<div class="empty">Aún faltan datos (${pt.n} de 7 check-ins). Con unos 7–10 registros empiezo a mostrar patrones.</div>`:
      (pt.items.length?pt.items.map(x=>`<div class="insight">${x}</div>`).join('')+'<p class="mute" style="margin-bottom:0">Son coincidencias en tus propios datos, no causas ni diagnósticos.</p>':'<div class="empty">Por ahora no veo diferencias claras. Con más registros aparecerán.</div>')}
    ${trend('mood','Ánimo, últimos 14 días','#58bd8a')}${trend('energy','Energía, últimos 14 días','#3b6df0')}${trend('sleep','Sueño, últimos 14 días','#8d73f2')}
  </div>`:''}
  ${ok?`<div class="card"><h3>Historial</h3>
    ${recent.slice(0,10).map(e=>`<div class="task"><span style="font-size:22px">${MOODS[e.mood-1][0]}</span>
      <span style="flex:1"><b>${dshort(e.date)}</b> · Ánimo ${MOODS[e.mood-1][1].toLowerCase()}${e.energy!=null?` · Energía ${ENERGY[e.energy-1][1].toLowerCase()} · Sueño ${SLEEP[e.sleep-1][1]}`:''}
      ${(e.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join(' ')}${e.note?`<br><span class="mute">${esc(e.note)}</span>`:''}</span>
      <button class="btn del" onclick="delDiary('${e.date}')">Borrar</button></div>`).join('')||'<div class="empty">Aún no hay registros.</div>'}</div>`:''}`;
}
function viewBienestar(){return viewCheckin()}
function viewRespiracion(){
  const T=TECH[bsel];
  return `
  <div class="card"><h2>Respiración y meditaciones</h2>
    <div class="mute">Herramientas breves para bajar la activación. No son un tratamiento: solo te ayudan a hacer una pausa consciente.</div></div>
  <div class="grid2">
    <div class="card"><h3>Respiración guiada</h3>
      <select onchange="setTech(this.value)" style="width:100%">${Object.entries(TECH).map(([k,v])=>`<option value="${k}" ${k===bsel?'selected':''}>${v.name}</option>`).join('')}</select>
      <p class="mute">${T.desc}</p>
      <div class="bwrap"><div id="bcircle"></div></div>
      <div class="bnum"><div id="blabel">${bt?'':'Listo cuando quieras'}</div><div id="bcount" class="mute"></div><div id="bcycles" class="mute"></div></div>
      <div class="row" style="justify-content:center;margin-top:8px">
        ${bt?'<button class="btn" onclick="stopBreath()">Detener</button>':'<button class="btn" onclick="startBreath()">Comenzar</button>'}</div>
    </div>
    <div class="card"><h3>Meditaciones breves</h3>
      ${mt?`<div class="banner lock row" style="justify-content:space-between"><span>En curso: <b>${esc(mt.name)}</b> — <b id="mtime">${mfmt(mt.left)}</b></span><button class="btn" onclick="stopMed()">Detener</button></div>`:''}
      ${MEDS.map(m=>`<details><summary>${m.name} · ${m.min} min</summary>
        <p class="mute">${m.desc}</p><ol>${m.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
        <button class="btn sec" ${mt||bt?'disabled':''} onclick="startMed('${m.id}')">Iniciar temporizador (${m.min} min)</button></details>`).join('')}
    </div>
  </div>`;
}
function viewPausas(){
  return `
  <div class="card"><h2>Pausas rápidas</h2>
    <div class="pgrid">
      <div class="pcard"><b>Muévete 5 minutos</b><br>Camina o estira cuello, hombros y espalda tras cada bloque de estudio.</div>
      <div class="pcard"><b>Agua y luz natural</b><br>Toma agua y mira por la ventana unos minutos, lejos de las pantallas.</div>
      <div class="pcard"><b>Mira lejos 20 segundos</b><br>Cada 20 minutos de pantalla, enfoca algo lejano para descansar la vista.</div>
      <div class="pcard"><b>Cuida el sueño</b><br>Dormir bien rinde más que una hora extra de estudio a medianoche.</div>
      <div class="pcard"><b>Habla con alguien</b><br>Un mensaje a un compañero o amigo también es una pausa válida.</div>
    </div></div>
  ${pauseCard()}`;
}
function viewApoyo(){
  const sp=S.support;
  return `
  <div class="card"><h2>Apoyo</h2>
    <p style="margin-top:0">Esta app te ayuda a organizarte y a cuidarte, pero <b>no reemplaza a un profesional de la salud</b>. Si algo de lo que sientes te pesa o dura varios días, hablarlo con alguien es una buena decisión, no una señal de debilidad.</p>
    <p class="mute" style="margin-bottom:0">Conviene buscar apoyo si hace semanas te cuesta dormir, comer o concentrarte, si te sientes sin ganas de nada o sobrepasado/a, o si estudiar se volvió fuente constante de angustia.</p></div>
  <div class="grid2">
    <div class="card"><h3>Apoyo en tu universidad</h3>
      <p class="mute">Muchas universidades tienen atención psicológica o de bienestar estudiantil gratuita para sus alumnos. Revisa el contacto vigente en el sitio oficial de la tuya y guárdalo aquí para tenerlo a mano.</p>
      <div class="row" style="flex-direction:column;align-items:stretch">
        <input id="sn" placeholder="Nombre del servicio (ej. Bienestar estudiantil)" value="${esc(sp.name)}">
        <input id="sc" placeholder="Teléfono, correo o enlace" value="${esc(sp.contact)}">
        <button class="btn" onclick="saveSupport()">Guardar</button></div>
      ${sp.name||sp.contact?'':`<div class="banner info" style="margin:10px 0 0">¿Estudias en la Universidad de Concepción? La DISE (Dirección de Servicios Estudiantiles) publica su contacto de Bienestar Estudiantil en bienestar@udec.cl y dise.udec.cl; pregunta ahí por apoyo en salud mental. <button class="lnk" onclick="fillUdeC()">Guardar estos datos</button></div>`}
      ${sp.name||sp.contact?`<div class="banner lock" style="margin:10px 0 0"><b>${esc(sp.name||'Mi servicio de apoyo')}</b><br>${esc(sp.contact)}</div>`:''}
    </div>
    <div class="card"><h3>Líneas de ayuda en Chile</h3>
      <div class="task"><span style="flex:1"><b>Línea de Prevención del Suicidio</b><br><span class="mute">Marca *4141 desde un celular. Gratuita y de atención permanente.</span></span></div>
      <div class="task"><span style="flex:1"><b>Salud Responde</b><br><span class="mute">600 360 7777. Orientación en salud, incluida salud mental.</span></span></div>
      <div class="task"><span style="flex:1"><b>Emergencia inmediata</b><br><span class="mute">131 (ambulancia) o 133 (Carabineros) si hay peligro ahora.</span></span></div>
      <p class="mute" style="margin-bottom:0">Si no estás en Chile, busca la línea de crisis de tu país. Verifica los números en fuentes oficiales: pueden cambiar.</p>
    </div>
  </div>`;
}
function viewPrivacidad(){
  const ok=S.consent&&S.consent.health;
  return `<div class="card"><h2>Privacidad y mis datos</h2>
    <ul style="margin:0 0 10px 18px;padding:0">
      <li>Por defecto todo se guarda <b>solo en este navegador</b> y la app no hace peticiones externas. Puedes usarla siempre sin cuenta.</li>
      <li>Si activas la sección <i>Amigos</i> e inicias sesión, al servidor van <b>solo</b> tu nombre visible, tu código de amigo, tus relaciones de amistad, las fechas de los ramos que marques explícitamente como compartidos y tus sesiones de estudio.</li>
      <li>Los datos de bienestar (check-in, energía, ánimo, sueño, diario, notas personales y calificaciones) <b>nunca salen de este dispositivo</b>: no hay ninguna tabla para ellos en el servidor.</li>
      <li>${KEYOBJ?'Tus datos locales están cifrados con tu contraseña.':'Por defecto los datos locales no están cifrados: si compartes este equipo, activa el cifrado con contraseña (más abajo) o borra tus datos de bienestar.'}</li>
      <li>El lector de PDF viene incluido: tu archivo <b>no se sube</b>, se lee dentro de tu navegador.</li>
      <li>Para borrar lo que sí se guarda en el servidor, ve a <i>Amigos → Eliminar mi cuenta y mis datos del servidor</i>. Eso no borra tus datos locales.</li>
    </ul>
    <p class="mute">Estado: ${!S.consent?'aún no decidiste si activar el check-in':(S.consent.health?'check-in activado':'check-in desactivado')}. Último respaldo: ${S.lastBackup?dshort(S.lastBackup):'nunca'}.</p>
    <div class="row">
      ${ok?'<button class="btn sec" onclick="setConsent(false)">Revocar consentimiento</button>':'<button class="btn sec" onclick="resetConsent()">Revisar y activar check-in</button>'}
      <button class="btn sec" onclick="exportData()">Descargar respaldo (JSON)</button>
      <label class="btn sec" style="cursor:pointer">Restaurar respaldo<input type="file" accept=".json" style="display:none" onchange="importData(this)"></label>
      <button class="btn del" onclick="deleteHealth()">Borrar mis datos de bienestar</button>
      <button class="btn del" onclick="wipe()">Borrar todo</button></div>
    ${encryptionHtml()}
    <p class="mute" style="margin-bottom:0">La Ley 21.719 de protección de datos personales de Chile (vigente desde el 1 de diciembre de 2026) aplica a lo que se guarda en el servidor si usas Amigos: nombre visible, amistades, fechas compartidas y sesiones. Lo que queda solo en tu navegador no sale de él. Esto no es asesoría legal.</p>
  </div>`;
}
function viewSalud(){
  if(!S.courses.length)return '<div class="card empty">Agrega ramos para ver tu mapa de calor.</div>';
  const t0=today(),N=14,sumD=S.courses.reduce((a,c)=>a+c.difficulty,0);
  const dates=[...Array(N)].map((_,i)=>addDays(t0,i-N+1));
  const rows=S.courses.map(c=>{
    const tg=d=>Math.max(1,capFor(d)*0.7*c.difficulty/sumD);          // cuota recomendada del ramo ese día
    const vals=dates.map(d=>S.sessions.filter(s=>s.date===d&&s.courseId===c.id).reduce((a,s)=>a+s.minutes,0)/tg(d));
    const a7=avg(vals.slice(-7));
    const nextEv=S.events.filter(e=>e.courseId===c.id&&e.type!=='control'&&e.date>=t0).sort((a,b)=>a.date.localeCompare(b.date))[0];
    const days2=nextEv?diffDays(t0,nextEv.date):null;
    let status='En equilibrio',col='var(--ok)';
    if(a7<0.5){status='Poca atención';col='var(--warn)'}
    else if(a7<0.85){status='Atención algo baja';col='var(--warn)'}
    else if(a7>1.3){status='Mucha atención';col='var(--soft)'}
    return {c,target:tg(t0),vals,a7,status,col,nextEv,days2,risk:nextEv&&days2<=10&&a7<0.6};
  });
  const cls=v=>v===0?'h0':v<0.5?'h1':v<0.9?'h2':v<=1.3?'h3':'h4';
  const alerts=rows.filter(r=>r.risk);
  return `
  <div class="card"><h2>Mapa de calor de salud académica</h2>
    ${alerts.length?alerts.map(r=>`<div class="banner go"><b>${esc(r.c.name)}</b>: tienes "${esc(r.nextEv.title)}" en ${r.days2} día(s) y esta semana le diste poca atención (${Math.round(r.a7*100)}% de lo recomendado). Quizá convenga reequilibrar un poco.</div>`).join('')
      :'<div class="banner min">Sin desequilibrios importantes frente a tus próximas evaluaciones.</div>'}
    <div class="legend mute">Atención vs. cuota recomendada del ramo (según dificultad y tu capacidad de cada día):
      <span class="h0"></span>sin estudio<span class="h1"></span>&lt;50%<span class="h2"></span>50–90%<span class="h3"></span>90–130%<span class="h4"></span>&gt;130%</div>
    <div style="margin-top:12px;overflow-x:auto">
    ${rows.map(r=>`<div style="margin-bottom:12px">
      <div class="row" style="justify-content:space-between"><span><span class="dot" style="background:${r.c.color};display:inline-block"></span> <b>${esc(r.c.name)}</b>
        <span class="mute"> · cuota hoy ~${Math.round(r.target)} min</span></span>
        <span style="color:${r.col};font-weight:600">${r.status}</span></div>
      <div class="heat" style="grid-template-columns:repeat(${N},1fr);margin-top:4px;min-width:420px">
        ${r.vals.map((v,i)=>`<div class="cell ${cls(v)}" title="${dshort(dates[i])}: ${Math.round(v*Math.max(1,capFor(dates[i])*0.7*r.c.difficulty/sumD))} min"></div>`).join('')}</div>
      <div class="mute" style="margin-top:2px">${r.nextEv?`Próxima fecha: ${dshort(r.nextEv.date)} (${esc(r.nextEv.title)})`:'Sin evaluaciones próximas'}</div></div>`).join('')}
    </div>
    <div class="mute">Cada columna es un día (hoy a la derecha).</div>
  </div>`;
}
function viewDatos(){
  const agg=aggRatings();
  return `
  <div class="card"><h2>Datos de ramos (anónimos y agregados)</h2>
    <p class="mute" style="margin-top:0">En vez de reseñas con texto libre (que traen problemas de moderación, difamación y sesgo), aquí solo hay números anónimos: carga, dificultad, tipo de evaluación y horas por semana. No se muestra ningún promedio hasta tener al menos ${MIN_N} aportes por ramo.</p>
    ${agg.map(a=>`<div class="task"><b style="flex:1">${esc(a.name)}</b>
      ${a.n>=MIN_N?`<span class="tag">Carga ${a.load.toFixed(1)}/5</span><span class="tag">Dificultad ${a.diff.toFixed(1)}/5</span><span class="tag">${EVAL_TYPES[a.evalType]}</span><span class="tag">~${a.hours.toFixed(0)} h/semana</span><span class="mute">n=${a.n}</span>`
      :`<span class="mute">Faltan aportes (${a.n} de ${MIN_N}) para mostrar datos</span>`}</div>`).join('')||'<div class="empty">Aún no hay aportes.</div>'}
  </div>
  <div class="grid2">
    <div class="card"><h3>Aportar mis datos de un ramo (anónimo)</h3>
      <div class="row" style="flex-direction:column;align-items:stretch">
        <select id="rc">${S.courses.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
        <label class="mute">Carga de trabajo (1 baja – 5 muy alta)<br><select id="rl">${[1,2,3,4,5].map(n=>`<option ${n===3?'selected':''}>${n}</option>`).join('')}</select></label>
        <label class="mute">Dificultad (1 – 5)<br><select id="rd">${[1,2,3,4,5].map(n=>`<option ${n===3?'selected':''}>${n}</option>`).join('')}</select></label>
        <label class="mute">Tipo de evaluación<br><select id="rt">${Object.entries(EVAL_TYPES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label>
        <label class="mute">Horas por semana fuera de clases<br><input id="rh" type="number" min="0" max="40" value="6"></label>
        <button class="btn" onclick="addRating()">Aportar</button></div>
    </div>
    <div class="card"><h3>Compartir y combinar datos</h3>
      <p class="mute">Los aportes viven solo en este navegador. Para que sean colectivos de verdad, puedes exportar este archivo (sin nombres ni texto) y combinarlo con el de otros, o conectar la app a un backend.</p>
      <div class="row"><button class="btn sec" onclick="exportRatings()">Exportar aportes</button>
      <label class="btn sec" style="cursor:pointer">Importar aportes<input type="file" accept=".json" style="display:none" onchange="importRatings(this)"></label></div>
    </div>
  </div>`;
}
function viewTema(){
  const th=themeOk(S.settings&&S.settings.theme)?S.settings.theme:'cian';
  const md=modeOk(S.settings&&S.settings.mode)?S.settings.mode:'light';
  return `
  <div class="card"><h2>Apariencia</h2>
    <p style="margin-top:0">Escoge el color de la aplicación y el modo de luz. La elección se guarda solo en este navegador.</p>
    <h3>Color de la aplicación</h3>
    <div class="swatches">${THEMES.map(([k,label,hex])=>`<button type="button" class="swatch ${k===th?'on':''}" style="--sw:${hex}" aria-pressed="${k===th}" onclick="setTheme('${k}')"><span class="swatch-dot"></span><span>${label}</span></button>`).join('')}</div>
    <h3 style="margin-top:20px">Modo</h3>
    <div class="modes">${MODES.map(([k,label])=>`<button type="button" class="mode-btn ${k===md?'on':''}" aria-pressed="${k===md}" onclick="setMode('${k}')"><span class="mode-preview ${k}"></span><span>${label}</span></button>`).join('')}</div>
    <p class="mute" style="margin-bottom:0">El modo claro suaviza los fondos y mantiene el contraste para leer; el oscuro cuida la vista con poca luz.</p>
  </div>
  <div class="card"><h3>Vista previa</h3>
    <div class="preview">
      <div class="preview-head"><span class="dot" style="background:var(--accent)"></span><b>Entrenador Académico</b></div>
      <div class="preview-body">
        <div class="row"><span class="tag">Etiqueta</span><span class="tag sel on" style="cursor:default">Seleccionado</span></div>
        <div class="row" style="margin-top:12px"><button class="btn" style="cursor:default">Botón principal</button><button class="btn sec" style="cursor:default">Secundario</button></div>
        <div class="preview-line"></div>
      </div>
    </div>
  </div>`;
}
function viewAmigos(){
  if(!socialConfigured())return `<div class="card"><h2>Amigos</h2>
    <p style="margin-top:0">Esta función es opcional y <b>todavía no está configurada</b>. Para activarla, sigue la guía en <i>docs/SUPABASE.md</i> y completa <i>js/config.js</i> con la URL y la anon key de tu proyecto.</p>
    <p class="mute">Mientras tanto la app funciona exactamente como antes: todo se guarda solo en este navegador y no se envía nada a ningún servidor.</p>
    <button class="btn" onclick="socialStartDemo()">Probar con datos de ejemplo</button></div>`;
  if(!socialAuth())return `<div class="card"><h2>Amigos</h2>
    ${socialDemoBanner()}
    <p style="margin-top:0">${socialDemoActive()?'Coordina sesiones de estudio y comparte fechas con amigos de ejemplo. El acceso es simulado: cualquier correo y cualquier código de 6 dígitos funcionan.':'Coordina sesiones de estudio y comparte fechas con amigos. El acceso es con un código de 6 dígitos que llega a tu correo (sin enlaces ni redirecciones).'}</p>
    ${SOC.step==='code'?`<div class="soc-flow">
      <p>Enviamos un código a <b>${esc(SOC.email)}</b>. Revísalo también en tu carpeta de spam.</p>
      <div class="row"><input id="soc-code-otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" style="width:150px;letter-spacing:.3em;text-align:center">
      <button class="btn" ${SOC.busy?'disabled':''} onclick="socialSubmitCode()">Ingresar código</button>
      <button class="btn sec" onclick="SOC.step='email';SOC.msg='';render()">Cambiar correo</button></div></div>`
    :`<div class="soc-flow"><div class="row"><input id="soc-email" type="email" placeholder="tu@correo.cl" value="${esc(SOC.email)}" style="flex:1;min-width:220px">
      <button class="btn" ${SOC.busy?'disabled':''} onclick="socialSubmitEmail()">Enviar código</button></div>
      <p class="mute">Sin iniciar sesión la app sigue siendo 100 % local: tus datos de bienestar nunca salen de este dispositivo.</p></div>`}
    ${SOC.msg?`<div class="banner info">${esc(SOC.msg)}</div>`:''}
  </div>`;
  if(SOC.step==='name')return `<div class="card"><h2>Tu nombre visible</h2>
    ${socialDemoBanner()}
    <p style="margin-top:0">¿Cómo quieres que te vean tus amigos? ${socialDemoActive()?'Este nombre se guarda solo en el ejemplo.':'Solo se guarda este nombre en el servidor.'} No enviamos tu carrera, tus notas ni ningún dato de bienestar.</p>
    <div class="row"><input id="soc-name" maxlength="60" placeholder="Tu nombre" value="${esc(S.profile&&S.profile.name||'')}">
    <button class="btn" ${SOC.busy?'disabled':''} onclick="socialSubmitName()">Crear mi perfil</button></div>
    ${SOC.msg?`<div class="banner info">${esc(SOC.msg)}</div>`:''}
    <p class="mute" style="margin-bottom:0">${socialDemoActive()?'Podrás cambiarlo si sales y vuelves a entrar al modo demo.':'Podrás cambiarlo más adelante desde tu perfil del servidor.'}</p></div>`;
  if(!SOC.ready||!SOC.profile)return `<div class="card"><h2>Amigos</h2>
    ${socialDemoBanner()}
    ${SOC.error?`<div class="banner go"><b>No se pudo conectar.</b> ${esc(SOC.error)} El resto de la app sigue funcionando con tus datos locales.
      <div class="row" style="margin-top:8px"><button class="btn sec" onclick="socialOpenTab()">Reintentar</button></div></div>`
    :'<div class="empty">Cargando tus amigos…</div>'}</div>`;
  const me=socialAuth().user_id,p=SOC.profile;
  const statusLabel=s=>({invited:'Invitado',accepted:'Aceptó',declined:'No puede'}[s]||s);
  const sessions=socialSessionFields();
  const organized=sessions.filter(s=>s.host===me),invited=sessions.filter(s=>s.mine&&s.mine!=='host');
  const sessionRow=s=>{
    const c=socialSessionCourse(s),who=s.host===me?'Tú':socialName(s.host);
    const state=s.mine==='accepted'?'<span class="tag soc-ok">Aceptada</span>':(s.mine==='invited'?'<span class="tag soc-wait">Pendiente</span>':(s.mine==='declined'?'<span class="tag">Rechazada</span>':''));
    return `<div class="task"><span class="dot" style="background:${c?c.color:'var(--accent)'}"></span>
      <span style="flex:1"><b>${dshort(s.date)} · ${esc(s.start_time)}–${esc(s.end_time)}</b> · ${esc(s.title)}<br>
      <span class="mute">${esc(s.course_name)} · ${esc(who)}${s.place?' · '+esc(s.place):''}</span>${s.note?`<br><span class="mute">${esc(s.note)}</span>`:''}</span>
      ${state}
      ${s.host===me?`<button class="btn del" onclick="socialCancelSession('${esc(s.id)}')">Cancelar</button>`
        :(s.mine==='invited'?`<button class="btn sec" onclick="socialRespondSession('${esc(s.id)}','accepted')">Aceptar</button>
          <button class="btn del" onclick="socialRespondSession('${esc(s.id)}','declined')">Rechazar</button>`:'')}</div>`;
  };
  const guestTags=s=>s.invites.map(i=>`<span class="tag ${i.status==='accepted'?'soc-ok':(i.status==='declined'?'':'soc-wait')}">${esc(socialName(i.user_id))}: ${esc(statusLabel(i.status))}</span>`).join(' ');
  const shared=socialFriendsShared(),groups={};
  shared.forEach(e=>{(groups[e.owner]=groups[e.owner]||[]).push(e)});
  const imported=S.events.filter(e=>e.src).sort((a,b)=>a.date.localeCompare(b.date));
  return `
  <div class="card hud-welcome">${socialDemoBanner()}
  ${SOC.msg?`<div class="banner info">${esc(SOC.msg)}</div>`:''}
  <div class="row" style="justify-content:space-between;align-items:flex-start">
    <div><h2 style="margin:0">Hola, ${esc(p.display_name)}</h2>
      <p class="mute" style="margin:4px 0 0">Tu código de amigo: <b class="hud-num soc-code">${esc(p.friend_code)}</b></p></div>
    <div class="row"><button class="btn sec" onclick="socialCopyCode()">Copiar mi código</button>
      <button class="btn sec" onclick="socialOpenTab()">Actualizar</button></div>
  </div>
  <p class="mute">${socialDemoActive()?'Estos amigos, sesiones y fechas viven solo en memoria mientras estés en el modo demo. Al importar una fecha de un amigo, sí se agrega a tus fechas reales de este navegador.':'Al servidor solo van tu nombre visible, tu código, tus amistades, las fechas de los ramos que marques como compartidos y tus sesiones de estudio.'} El check-in, la energía, el ánimo, el sueño, el diario, las notas y las calificaciones <b>nunca salen de este navegador</b>.</p>
  ${SOC.error?`<div class="banner info">No se pudo actualizar: ${esc(SOC.error)}. Estás viendo la información guardada en memoria.</div>`:''}
  <div class="row"><button class="lnk" onclick="socialLogout()">Cerrar sesión</button>
    <button class="lnk soc-danger" onclick="socialDeleteAccount()">Eliminar mi cuenta y mis datos del servidor</button></div>
  </div>
  <div class="grid2">
    <div class="card"><h3>Agregar un amigo</h3>
      <div class="row"><input id="soc-add-code" maxlength="8" placeholder="Código de 8 letras" style="flex:1;min-width:180px;text-transform:uppercase">
      <button class="btn" ${SOC.busy?'disabled':''} onclick="socialSendRequest()">Enviar solicitud</button></div>
      <p class="mute">Si la otra persona te agregó primero, al enviar el código se vuelven amigos automáticamente.</p>
      <h4>Solicitudes recibidas</h4>
      ${SOC.incoming.map(x=>`<div class="task"><span style="flex:1">${esc(x.person.display_name)}</span>
        <button class="btn sec" onclick="socialRespondFriend('${esc(x.id)}',true)">Aceptar</button>
        <button class="btn del" onclick="socialRespondFriend('${esc(x.id)}',false)">Rechazar</button></div>`).join('')||'<div class="empty">No hay solicitudes recibidas.</div>'}
      <h4>Solicitudes enviadas</h4>
      ${SOC.outgoing.map(x=>`<div class="task"><span style="flex:1">${esc(x.person.display_name)}</span><span class="tag soc-wait">Esperando respuesta</span></div>`).join('')||'<div class="empty">No hay solicitudes enviadas.</div>'}
    </div>
    <div class="card"><h3>Mis amigos</h3>
      ${SOC.friends.map(p=>`<div class="task"><span class="dot" style="background:var(--accent)"></span>
        <span style="flex:1">${esc(p.display_name)}</span><button class="btn del" onclick="socialRemoveFriend('${esc(p.id)}')">Quitar</button></div>`).join('')||'<div class="empty">Aún no tienes amigos. Comparte tu código o pide el de alguien más.</div>'}
      <p class="mute" style="margin-bottom:0">No hay rachas, puntos ni comparaciones de tiempo: esto es solo para organizarse juntos.</p>
    </div>
  </div>
  <div class="card"><h3>Sesiones de estudio</h3>
    <div class="row"><input id="ss-title" placeholder="Título (ej. Repasar certamen)" style="flex:2;min-width:200px">
      <input id="ss-course" list="ss-courses" placeholder="Ramo" style="flex:1;min-width:160px">
      <datalist id="ss-courses">${S.courses.map(c=>`<option value="${esc(c.name)}">`).join('')}</datalist></div>
    <div class="row" style="margin-top:8px"><input id="ss-date" type="date" value="${today()}">
      <input id="ss-start" type="time" value="18:00"><input id="ss-end" type="time" value="19:30">
      <input id="ss-place" placeholder="Lugar o enlace" style="flex:1;min-width:180px"></div>
    <textarea id="ss-note" placeholder="Nota para quienes vayan (opcional)" style="margin-top:8px"></textarea>
    <p class="mute" style="margin:10px 0 6px">Invitar a:</p>
    <div class="soc-checks">${SOC.friends.map(p=>`<label class="soc-check"><input type="checkbox" name="ss-guest" value="${esc(p.id)}"> ${esc(p.display_name)}</label>`).join('')||'<span class="mute">Agrega amigos para poder invitarlos.</span>'}</div>
    <div class="row" style="margin-top:10px"><button class="btn" ${SOC.busy||!SOC.friends.length?'disabled':''} onclick="socialCreateSession()">Crear sesión</button></div>
    <h4>Próximas sesiones que organizo</h4>
    ${organized.map(s=>`${sessionRow(s)}<div class="soc-guests">${guestTags(s)||'<span class="mute">Sin invitados</span>'}</div>`).join('')||'<div class="empty">No tienes sesiones organizadas.</div>'}
    <h4>Sesiones a las que me invitaron</h4>
    ${invited.map(sessionRow).join('')||'<div class="empty">No te han invitado a ninguna sesión.</div>'}
  </div>
  <div class="card"><h3>Fechas compartidas</h3>
    <p class="mute" style="margin-top:0">Escoge tus ramos. Solo se envían el nombre del ramo, el título, el tipo y la fecha de cada evaluación, entrega o control.</p>
    ${S.courses.map(c=>`<div class="share-row"><span class="dot" style="background:${c.color}"></span><b style="flex:1">${esc(c.name)}</b>
      <label class="soc-switch"><input type="checkbox" ${c.share?'checked':''} onchange="setShare('${esc(c.id)}',this.checked)"> Compartir las fechas de este ramo con mis amigos</label></div>`).join('')||'<div class="empty">Agrega ramos para poder compartir fechas.</div>'}
    <h4>Fechas que comparten mis amigos</h4>
    ${Object.keys(groups).map(o=>`<div class="soc-friend-group"><h4>${esc(socialName(o))}</h4>
      ${groups[o].sort((a,b)=>a.date.localeCompare(b.date)).map((e,i)=>{
        const match=S.courses.find(c=>norm(c.name)===norm(e.course_name));
        return `<div class="task"><span style="flex:1"><b>${dshort(e.date)}</b> · ${esc(TYPE_LABEL[e.type]||e.type)} · ${esc(e.course_name)} — ${esc(e.title)}</span>
          <select id="soc-imp-${o.slice(0,6)}-${i}" aria-label="Ramo destino">${S.courses.map(c=>`<option value="${esc(c.id)}" ${match&&c.id===match.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select>
          <button class="btn sec" ${S.courses.length?'':'disabled'} onclick="socialImportEvent('${esc(e.owner)}','${esc(e.id)}',document.getElementById('soc-imp-${o.slice(0,6)}-${i}').value)">Agregar a mis fechas</button></div>`;
      }).join('')}</div>`).join('')||'<div class="empty">Por ahora nadie ha compartido fechas contigo.</div>'}
    ${imported.length?`<h4>Fechas que ya importé</h4>${imported.map(e=>`<div class="task"><span style="flex:1">${dshort(e.date)} · ${esc(TYPE_LABEL[e.type]||e.type)} · ${esc(cname(e.courseId))} — ${esc(e.title)}</span><span class="tag soc-ok">Ya en tus fechas</span></div>`).join('')}`:''}
  </div>`;
}
