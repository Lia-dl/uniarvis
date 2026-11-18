/* U.A.R.V.I.S. · Planificador de micro-tareas y detección de semanas críticas */
/* ===================== Planificador predictivo ===================== */
const BASE={evaluacion:360,entrega:240,control:90,otro:60};
const STAGES={
  evaluacion:['Repasar apuntes y conceptos clave','Ejercicios guiados','Simulacro tipo evaluación'],
  entrega:['Planificar y reunir material','Desarrollar avance','Revisar y pulir la entrega'],
  control:['Repaso rápido','Ejercicios tipo control'],
  otro:['Preparación']
};
const dayLoad=date=>S.tasks.filter(t=>t.date===date).reduce((a,t)=>a+t.minutes,0)+
                    S.sessions.filter(x=>x.date===date&&!x.taskId).reduce((a,x)=>a+x.minutes,0);
function splitMinutes(total,chunk){                     // bloques parejos de 15 a 30 min, sin restos de 5 o 10 min
  if(total<=0)return[];
  const n=Math.max(1,Math.min(Math.ceil(total/chunk),Math.floor(total/15)));
  const base=Math.floor(total/n/5)*5,extra=Math.round((total-base*n)/5);
  return Array.from({length:n},(_,i)=>base+(i<extra?5:0));
}
function planEvent(ev){
  const t0=today(),c=course(ev.courseId),diff=c?c.difficulty:3;
  const total=Math.round(BASE[ev.type]*(0.7+0.15*diff)/15)*15;           // más dificultad → más minutos
  const doneMin=S.tasks.filter(t=>t.eventId===ev.id&&t.done).reduce((a,t)=>a+t.minutes,0);
  let remaining=total-doneMin;if(remaining<10)return 0;
  const lead=Math.min(35,7+3*diff+(ev.early?7:0));                        // más dificultad → empieza antes
  const s0=addDays(ev.date,-lead),start=s0>t0?s0:t0;
  let end=addDays(ev.date,(diff>=4&&ev.type==='evaluacion')?-2:-1);        // día de respiro antes de evaluaciones difíciles
  if(end<start)end=addDays(ev.date,-1);
  if(end<start)return 0;
  const days=[];for(let d=start;d<=end;d=addDays(d,1))days.push(d);
  const chunk=ev.type==='control'?15:(diff>=4?25:30);                      // micro-tareas de 15 a 30 min
  const picks=[];let overflow=0;
  const load=d=>dayLoad(d)+picks.filter(p=>p.date===d).reduce((a,p)=>a+p.minutes,0);
  for(const m of splitMinutes(remaining,chunk)){
    let cands=days.filter(d=>load(d)+m<=planCap(d));
    if(!cands.length){cands=days;overflow++}
    cands.sort((a,b)=>load(a)/planCap(a)-load(b)/planCap(b)||b.localeCompare(a));
    picks.push({date:cands[0],minutes:m});
  }
  picks.sort((a,b)=>a.date.localeCompare(b.date));
  const st=STAGES[ev.type];
  picks.forEach((p,i)=>{
    const stage=st[Math.min(st.length-1,Math.floor(i/picks.length*st.length))];
    S.tasks.push({id:uid(),eventId:ev.id,courseId:ev.courseId,title:`${stage} · ${ev.title}`,date:p.date,minutes:p.minutes,done:false});
  });
  return overflow;
}
function replanAll(){                                   // reprogramación sin culpa: lo pendiente se redistribuye solo
  inval();const t0=today();
  const stale=S.tasks.filter(t=>!t.done&&t.date<t0).length;
  if(stale>0)S.moved={date:t0,n:stale};
  S.tasks=S.tasks.filter(t=>t.done);
  let over=0;
  S.events.filter(e=>e.date>=t0).sort((a,b)=>a.date.localeCompare(b.date)).forEach(e=>over+=planEvent(e));
  S.lastPlan=t0;save();
  if(over)toast('Esos días quedaron muy cargados: repartí lo más parejo posible. Quizá conviene mover alguna fecha o pedir ayuda.');
}

/* ===================== Semanas críticas ===================== */
function criticalClusters(){
  const t0=today(),ev=S.events.filter(e=>e.type!=='otro'&&e.date>=t0).sort((a,b)=>a.date.localeCompare(b.date));
  const marked=new Set();
  ev.forEach(e=>{const win=ev.filter(x=>x.date>=e.date&&diffDays(e.date,x.date)<=4);if(win.length>=3)win.forEach(x=>marked.add(x.id))});
  const out=[];
  ev.filter(e=>marked.has(e.id)).forEach(e=>{
    const g=out[out.length-1];
    if(g&&diffDays(g.end,e.date)<=4){g.events.push(e);g.end=e.date}else out.push({start:e.date,end:e.date,events:[e]});
  });
  return out;
}
function applyEarly(ids){
  const set=ids.split(',');S.events.forEach(e=>{if(set.includes(e.id))e.early=true});
  replanAll();toast('Listo: reservé margen extra y adelanté el inicio de la preparación.');render();
}
function firstTaskDate(evs){
  const ids=evs.map(e=>e.id),ds=S.tasks.filter(t=>ids.includes(t.eventId)&&!t.done).map(t=>t.date).sort();
  return ds[0]||null;
}
function recentLow(){const r=S.wellbeing.diary.filter(e=>e.energy!=null).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  return r.length>=3&&(avg(r.map(e=>e.mood))<=2.5||avg(r.map(e=>e.energy))<=2.5)}
function criticalHtml(){
  const t0=today();
  return criticalClusters().filter(g=>diffDays(t0,g.start)<=28).map(g=>{
    const allEarly=g.events.every(e=>e.early),ids=g.events.map(e=>e.id).join(',');
    const names=g.events.map(e=>`${esc(cname(e.courseId))} (${TYPE_LABEL[e.type].toLowerCase()})`).join(', ');
    const f=firstTaskDate(g.events);
    const low=S.consent&&S.consent.health&&recentLow();
    return `<div class="banner go"><b>Semana exigente a la vista: ${dshort(g.start)} – ${dshort(g.end)}</b><br>
      Se juntan ${g.events.length} fechas importantes en pocos días: ${names}.<br>
      ${allEarly?`Ya reservé margen extra${f?`: tu preparación parte el ${dshort(f)}`:''}. Nada más que hacer por ahora.`
        :'Conviene empezar antes: puedo adelantar el inicio de la preparación y repartirla en más días, con micro-tareas más livianas.'}
      ${low?'<br>Además tus últimos días vienen pesados: cuida tus pausas y mira las opciones de apoyo.':''}
      <div class="row" style="margin-top:8px">${allEarly?'':`<button class="btn" onclick="applyEarly('${ids}')">Reservar margen extra</button>`}
      ${low?`<button class="btn sec" onclick="go('apoyo')">Ver apoyo</button>`:''}</div></div>`;
  }).join('');
}
