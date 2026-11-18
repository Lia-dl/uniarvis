/* U.A.R.V.I.S. · Acciones del usuario, privacidad y datos de ejemplo */
/* ===================== Acciones ===================== */
function undoable(msg,mutate,after){
  const snap=JSON.stringify(S);
  mutate();if(after)after();
  save();render();
  toast(msg,()=>{S=JSON.parse(snap);save();loadDraft();render();toast('Acción deshecha.')});
}
function go(t,fromRoute){
  stopBreath(true);stopMed(true);
  const r=typeof routeFor==='function'?routeFor(t):{section:'inicio',tab:'inicio'};
  section=r.section;tab=r.tab;
  if(!fromRoute&&typeof hashFor==='function'){
    const h=hashFor(r);
    try{if(h&&location.hash!==h)history.pushState(null,'',h)}catch(e){}
  }
  render();
  if(tab==='amigos'&&typeof socialOpenTab==='function')socialOpenTab();
}
function goBreath(k){stopBreath(true);stopMed(true);bsel=k;go('respiracion');startBreath()}
function goMed(id){stopBreath(true);stopMed(true);go('respiracion');startMed(id)}
function toggleTask(id){
  const t=S.tasks.find(x=>x.id===id);if(!t)return;
  if(!t.done){
    if(doneToday()>=capFor(today()))return toast('Hoy ya completaste tu capacidad. Descansar también es parte del plan.');
    t.done=true;t.date=today();
    S.sessions.push({id:uid(),date:today(),courseId:t.courseId,minutes:t.minutes,taskId:t.id});
  }else{t.done=false;S.sessions=S.sessions.filter(x=>x.taskId!==t.id)}
  save();
  if(doneToday()>=capFor(today()))replanAll();
  render();
}
function pullNext(){
  const t0=today(),nxt=S.tasks.filter(t=>!t.done&&t.date>t0).sort((a,b)=>a.date.localeCompare(b.date))[0];
  if(!nxt)return;
  if(dayLoad(t0)+nxt.minutes>capFor(t0))return toast('Eso superaría tu capacidad de hoy.');
  nxt.date=t0;save();render();
}
function logFree(){
  const c=$('#fc').value,m=parseInt($('#fm').value,10);
  if(!c||!(m>0))return toast('Elige un ramo y los minutos.');
  if(doneToday()>=capFor(today()))return toast('Hoy ya completaste tu capacidad. Descansar también es parte del plan.');
  S.sessions.push({id:uid(),date:today(),courseId:c,minutes:m});save();
  if(doneToday()>=capFor(today()))replanAll();
  render();
}
function setMin(){
  const mi=parseInt($('#smin').value,10);
  if(!(mi>=15)||mi>240)return toast('Pon un mínimo entre 15 y 240 minutos.');
  S.settings.min=mi;replanAll();toast('Mínimo actualizado.');render();
}
function setTheme(id){
  if(!themeOk(id))return;
  S.settings.theme=id;save();render();
}
function setMode(id){
  if(!modeOk(id))return;
  S.settings.mode=id;save();render();
}
function setShare(id,on){const c=course(id);if(!c)return;c.share=!!on;save();render()}
function registerProfile(){
  const n=($('#reg-name')||{}).value||'',c=($('#reg-career')||{}).value||'';
  const name=String(n).trim(),career=String(c).trim();
  if(!name||!career)return toast('Ingresa tu nombre y carrera.');
  S.profile={name:name.slice(0,60),career:career.slice(0,80),onboarded:true};
  save();toast(`Bienvenido/a, ${S.profile.name}.`);render();
  if(typeof maybeShowTour==='function')maybeShowTour();
}
function saveProfile(){
  const n=($('#pf-name')||{}).value||'',c=($('#pf-career')||{}).value||'';
  const name=String(n).trim(),career=String(c).trim();
  if(!name||!career)return toast('Ingresa tu nombre y carrera.');
  S.profile={name:name.slice(0,60),career:career.slice(0,80),onboarded:true};
  save();toast('Perfil actualizado.');render();
}
function addCourse(){
  const n=$('#cn').value.trim();if(!n)return;
  S.courses.push({id:uid(),name:n,difficulty:parseInt($('#cd').value,10),color:COLORS[S.courses.length%COLORS.length],grades:[]});
  save();render();
}
function setDiff(id,v){course(id).difficulty=+v;replanAll();render()}
function addGrade(cid){
  const c=course(cid);if(!c)return;
  const name=(($('#gn-'+cid)||{}).value||'').trim(),score=parseFloat((($('#gs-'+cid)||{}).value||'').replace(',','.')),weight=parseFloat((($('#gw-'+cid)||{}).value||'').replace(',','.'));
  if(!name)return toast('Ingresa el nombre de la evaluación.');
  if(!isFinite(score))return toast('Ingresa una nota válida.');
  if(!isFinite(weight)||weight<0||weight>100)return toast('Ingresa una ponderación entre 0 y 100%.');
  if(!Array.isArray(c.grades))c.grades=[];
  c.grades.push({id:uid(),name:name.slice(0,80),score:Math.round(score*100)/100,weight:Math.round(weight*100)/100});
  save();render();
}
function delGrade(cid,gid){const c=course(cid);if(!c)return;undoable('Nota eliminada.',()=>{c.grades=(c.grades||[]).filter(g=>g.id!==gid)})}
function setGrade(cid,gid,field,val){
  const c=course(cid);if(!c)return;const g=(c.grades||[]).find(x=>x.id===gid);if(!g)return;
  if(field==='name')g.name=String(val).trim().slice(0,80);
  else if(field==='score'){const n=parseFloat(String(val).replace(',','.'));if(isFinite(n))g.score=Math.round(n*100)/100}
  else if(field==='weight'){const n=parseFloat(String(val).replace(',','.'));if(isFinite(n)&&n>=0&&n<=100)g.weight=Math.round(n*100)/100}
  save();render();
}
function delCourse(id){
  undoable('Ramo eliminado.',()=>{
    S.courses=S.courses.filter(c=>c.id!==id);
    ['classes','events','tasks','sessions'].forEach(k=>S[k]=S[k].filter(x=>x.courseId!==id));
  });
}
function addClass(){
  const c=$('#kc').value,d=+$('#kd').value,a=$('#ka').value,b=$('#kb').value;
  if(!c||!a||!b||toMin(b)<=toMin(a))return toast('Revisa ramo y horas.');
  S.classes.push({id:uid(),courseId:c,day:d,start:a,end:b});save();replanAll();render();
}
function delClass(id){undoable('Clase eliminada.',()=>{S.classes=S.classes.filter(x=>x.id!==id)},replanAll)}
function addEvent(){
  const c=$('#ec').value,t=$('#et').value.trim(),d=$('#ed').value,ty=$('#ey').value;
  if(!c||!t||!d)return toast('Completa ramo, título y fecha.');
  S.events.push({id:uid(),courseId:c,title:t,date:d,type:ty});replanAll();render();
}
function delEvent(id){undoable('Fecha eliminada.',()=>{S.events=S.events.filter(e=>e.id!==id);S.tasks=S.tasks.filter(t=>t.eventId!==id||t.done)},()=>replanAll())}

/* ===================== Privacidad y datos ===================== */
async function wipe(){
  if(!await askConfirm({title:'Borrar todos los datos',text:'Se borrarán todos tus datos de este navegador y se desactivará el cifrado, si lo usabas. Esta acción no se puede deshacer.',okLabel:'Borrar todo',danger:true,requireWord:'BORRAR'}))return;
  await dropKey();S=fresh();save();loadDraft();render();toast('Todos los datos de este navegador fueron borrados.');
}
async function deleteHealth(){
  if(!await askConfirm({title:'Borrar datos de bienestar',text:'Se borrarán tus check-ins y tu diario de este navegador. Tu plan seguirá funcionando.',okLabel:'Borrar',danger:true}))return;
  S.wellbeing.diary=[];S.adapt=null;S.soft=null;S.dismissed={};save();loadDraft();replanAll();toast('Tus datos de bienestar fueron borrados.');render();
}
async function exportData(){
  S.lastBackup=today();S.backupSnooze=null;save();
  let body,name;
  if(KEYOBJ){await writeQ;body=localStorage.getItem(KEY);name='entrenador-academico-respaldo-cifrado.json'}   // ya está cifrado
  else{body=JSON.stringify(S,null,2);name='entrenador-academico-respaldo.json'}
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([body],{type:'application/json'}));
  a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  toast(KEYOBJ?'Respaldo cifrado descargado. Para restaurarlo necesitarás tu contraseña.':'Respaldo descargado SIN cifrar: guárdalo en un lugar seguro.');render();
}
/* --- Recordatorio de respaldo (los datos viven solo en este navegador) --- */
function backupDue(){
  if(!S.courses.length)return false;
  if(diffDays(S.lastBackup||S.createdAt,today())<14)return false;
  return !S.backupSnooze||S.backupSnooze<=today();
}
function snoozeBackup(){S.backupSnooze=addDays(today(),7);save();render()}
function backupHtml(){
  if(!backupDue())return '';
  const n=diffDays(S.lastBackup||S.createdAt,today());
  return `<div class="banner info">Tus datos viven solo en este navegador: si se borran, se pierden. ${S.lastBackup?`Hace ${n} días que no guardas un respaldo.`:'Aún no has guardado ningún respaldo.'}
    <div class="row" style="margin-top:8px"><button class="btn sec" onclick="exportData()">Descargar respaldo</button>
    <button class="btn sec" onclick="snoozeBackup()">Recordármelo en una semana</button></div></div>`;
}

/* --- Restaurar respaldo: se valida todo y solo se copian campos conocidos (un archivo ajeno no puede inyectar HTML) --- */
const RX={id:/^[\w-]{1,40}$/,date:/^\d{4}-\d{2}-\d{2}$/,time:/^\d{2}:\d{2}$/,color:/^#[0-9a-fA-F]{6}$/};
function validState(j){
  if(!j||typeof j!=='object'||Array.isArray(j))return 'no es un respaldo';
  const str=(v,n)=>typeof v==='string'&&v.length<=n,int=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b,num=(v,a,b)=>typeof v==='number'&&v>=a&&v<=b;
  for(const k of ['courses','classes','events','tasks','sessions'])if(!Array.isArray(j[k]))return 'falta '+k;
  for(const c of j.courses){
    if(!(c&&RX.id.test(c.id)&&str(c.name,120)&&int(c.difficulty,1,5)&&RX.color.test(c.color)))return 'ramos';
    if(c.share!==undefined&&typeof c.share!=='boolean')return 'ramos';
    if(c.grades!==undefined){
      if(!Array.isArray(c.grades))return 'notas';
      for(const g of c.grades)if(!(g&&RX.id.test(g.id)&&str(g.name,80)&&num(g.score,-100,100)&&num(g.weight,0,100)))return 'notas';
    }
  }
  for(const k of j.classes)if(!(k&&RX.id.test(k.id)&&RX.id.test(k.courseId)&&int(k.day,0,6)&&RX.time.test(k.start)&&RX.time.test(k.end)))return 'horario';
  for(const e of j.events){
    if(!(e&&RX.id.test(e.id)&&RX.id.test(e.courseId)&&str(e.title,200)&&RX.date.test(e.date)&&Object.prototype.hasOwnProperty.call(TYPE_LABEL,e.type)))return 'fechas';
    if(e.src!==undefined&&!(e.src&&typeof e.src==='object'&&!Array.isArray(e.src)&&RX.id.test(e.src.owner)&&RX.id.test(e.src.id)))return 'fechas';
  }
  for(const t of j.tasks)if(!(t&&RX.id.test(t.id)&&RX.id.test(t.eventId)&&RX.id.test(t.courseId)&&str(t.title,300)&&RX.date.test(t.date)&&num(t.minutes,1,600)&&typeof t.done==='boolean'))return 'tareas';
  for(const s of j.sessions)if(!(s&&RX.id.test(s.id)&&RX.id.test(s.courseId)&&RX.date.test(s.date)&&num(s.minutes,1,1440)&&(s.taskId===undefined||RX.id.test(s.taskId))&&(s.socialId===undefined||RX.id.test(s.socialId))))return 'sesiones';
  if(j.profile!==undefined){
    if(!j.profile||typeof j.profile!=='object'||Array.isArray(j.profile))return 'perfil';
    if(j.profile.name!==undefined&&!str(j.profile.name,60))return 'perfil';
    if(j.profile.career!==undefined&&!str(j.profile.career,80))return 'perfil';
  }
  const dia=j.wellbeing&&j.wellbeing.diary;
  if(dia!==undefined){
    if(!Array.isArray(dia))return 'diario';
    for(const e of dia)if(!(e&&RX.date.test(e.date)&&[e.mood,e.energy,e.sleep].every(v=>v==null||int(v,1,5))&&(e.tags===undefined||(Array.isArray(e.tags)&&e.tags.every(t=>str(t,40))))&&(e.note===undefined||str(e.note,5000))))return 'diario';
  }
  return null;
}
function cleanState(j){
  const c=fresh();
  c.classes=j.classes;c.tasks=j.tasks;
  c.events=j.events.map(e=>{const o={id:e.id,courseId:e.courseId,title:String(e.title||'').slice(0,200),date:e.date,type:e.type};if(e.early)o.early=true;if(e.src)o.src={owner:String(e.src.owner).slice(0,40),id:String(e.src.id).slice(0,40)};return o});
  c.sessions=j.sessions.map(s=>{const o={id:s.id,date:s.date,courseId:s.courseId,minutes:+s.minutes};if(s.taskId)o.taskId=s.taskId;if(s.socialId)o.socialId=s.socialId;return o});
  c.courses=(j.courses||[]).map(x=>({id:x.id,name:x.name,difficulty:x.difficulty,color:x.color,share:x.share===true,grades:(x.grades||[]).map(g=>({id:g.id,name:String(g.name||'').slice(0,80),score:+g.score,weight:+g.weight}))}));
  c.settings={min:int15(j.settings&&j.settings.min)?j.settings.min:60,theme:themeOk(j.settings&&j.settings.theme)?j.settings.theme:'cian',mode:modeOk(j.settings&&j.settings.mode)?j.settings.mode:'light'};
  c.wellbeing={diary:((j.wellbeing&&j.wellbeing.diary)||[]).map(e=>({date:e.date,mood:e.mood??null,energy:e.energy??null,sleep:e.sleep??null,tags:e.tags||[],note:e.note||'',ts:Number(e.ts)||0}))};
  c.support={name:String((j.support&&j.support.name)||'').slice(0,120),contact:String((j.support&&j.support.contact)||'').slice(0,300)};
  c.consent=j.consent&&typeof j.consent.health==='boolean'?{health:j.consent.health,at:today()}:null;
  c.lastBackup=typeof j.lastBackup==='string'&&RX.date.test(j.lastBackup)?j.lastBackup:null;
  if(j.profile&&typeof j.profile==='object')c.profile={name:String(j.profile.name||'').slice(0,60),career:String(j.profile.career||'').slice(0,80),onboarded:!!j.profile.onboarded||(!!j.profile.name)};
  return c;
}
const int15=v=>Number.isInteger(v)&&v>=15&&v<=240;
async function importData(inp){
  const f=inp.files[0];if(!f)return;
  try{
    const j=JSON.parse(await f.text());
    if(j&&j.enc){                                  // respaldo cifrado: se instala tal cual y la app pedirá la contraseña
      if(!validBlob(j))throw new Error('archivo cifrado dañado');
      if(!await askConfirm({title:'Restaurar respaldo cifrado',text:'Se reemplazarán los datos actuales y la app te pedirá la contraseña con la que se cifró.',okLabel:'Restaurar'})){inp.value='';return}
      await dropKey();localStorage.setItem(KEY,JSON.stringify(j));location.reload();return;
    }
    const err=validState(j);
    if(err)throw new Error(err);
    if(!await askConfirm({title:'Restaurar respaldo',text:'Esto reemplazará todos los datos actuales de este navegador por los del respaldo.',okLabel:'Restaurar'})){inp.value='';return}
    S=cleanState(j);save();loadDraft();replanAll();toast('Respaldo restaurado.');render();
  }catch(e){toast('Ese archivo no parece un respaldo válido de esta app ('+e.message+').')}
  inp.value='';
}

/* --- Exportar fechas importantes a tu calendario (.ics) --- */
function icsFold(line){const cs=Array.from(line),out=[];while(cs.length>60)out.push(cs.splice(0,60).join(''));out.push(cs.join(''));return out.join('\r\n ')}
const icsEsc=s=>String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');
function buildICS(){
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z'),dt=d=>d.replace(/-/g,'');
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//U.A.R.V.I.S.//ES','CALSCALE:GREGORIAN'];
  S.events.forEach(e=>L.push('BEGIN:VEVENT',`UID:${e.id}@entrenador-academico`,`DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dt(e.date)}`,`DTEND;VALUE=DATE:${dt(addDays(e.date,1))}`,
    icsFold('SUMMARY:'+icsEsc(`${TYPE_LABEL[e.type]} · ${cname(e.courseId)} · ${e.title}`)),'END:VEVENT'));
  L.push('END:VCALENDAR');
  return L.join('\r\n')+'\r\n';
}
function exportICS(){
  if(!S.events.length)return toast('Aún no hay fechas para exportar.');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([buildICS()],{type:'text/calendar'}));
  a.download='fechas-importantes.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  toast('Listo: importa el archivo en Google Calendar, Outlook o Apple Calendar.');
}

function fillUdeC(){S.support={name:'DISE UdeC · Bienestar Estudiantil',contact:'bienestar@udec.cl · dise.udec.cl'};save();toast('Guardado. Verifica horarios y cómo pedir hora en el sitio oficial.');render()}
function saveSupport(){S.support={name:$('#sn').value.trim().slice(0,120),contact:$('#sc').value.trim().slice(0,300)};save();toast('Guardado en este navegador.');render()}

async function loadDemo(){
  if(S.courses.length&&!await askConfirm({title:'Cargar datos de ejemplo',text:'Esto reemplazará tus datos actuales por los del ejemplo.',okLabel:'Cargar'}))return;
  S=fresh();inval();const t=today();
  S.consent={health:true,at:t};                    // el ejemplo activa el check-in para poder probarlo
  const C0=(n,d,i)=>({id:uid(),name:n,difficulty:d,color:COLORS[i]});
  const cs=[C0('Cálculo III',5,0),C0('Termodinámica',4,1),C0('Estadística',3,2),C0('Economía',2,3)];
  S.courses=cs;
  [[0,0,'08:10','09:40'],[0,2,'08:10','09:40'],[1,1,'10:15','11:45'],[1,3,'10:15','11:45'],[2,0,'14:30','16:00'],[2,3,'14:30','16:00'],[3,4,'08:10','09:40']]
    .forEach(([ci_,d,a,b])=>S.classes.push({id:uid(),courseId:cs[ci_].id,day:d,start:a,end:b}));
  [[0,6,'Certamen 2','evaluacion'],[1,9,'Certamen 1','evaluacion'],[2,8,'Entrega informe de laboratorio','entrega'],[3,12,'Control 2','control'],[0,22,'Certamen 3','evaluacion'],[2,24,'Examen','evaluacion']]
    .forEach(([ci_,off,ti,ty])=>S.events.push({id:uid(),courseId:cs[ci_].id,title:ti,date:addDays(t,off),type:ty}));
  const mon=mondayOf(t);                           // fechas pasadas para que el diario pueda mostrar patrones
  [[0,-6,'Certamen 1','evaluacion'],[1,-5,'Control 1','control'],[2,-3,'Entrega 1','entrega'],[3,-12,'Control 1','control'],
   [0,-20,'Certamen 0','evaluacion'],[1,-19,'Informe previo','entrega'],[2,-18,'Control 1','control'],[3,-25,'Control 0','control']]
    .forEach(([ci_,off,ti,ty])=>S.events.push({id:uid(),courseId:cs[ci_].id,title:ti,date:addDays(mon,off),type:ty}));
  const factor=[0.9,0.35,1,1.1];                   // Termodinámica con poca atención, para ver la carga por semana
  for(let k=1;k<=20;k++)cs.forEach((c,i)=>{
    if(Math.random()<0.7)S.sessions.push({id:uid(),date:addDays(t,-k),courseId:c.id,minutes:Math.round((20+Math.random()*50)*factor[i])});
  });
  const r=()=>Math.random()-0.5;
  for(let k=1;k<=24;k++){
    if(Math.random()<0.15)continue;
    const d=addDays(t,-k),wl=S.events.filter(e=>e.type!=='otro'&&mondayOf(e.date)===mondayOf(d)).length,heavy=wl>=3;
    S.wellbeing.diary.push({date:d,mood:clamp(Math.round(3.9-(heavy?1.3:0)+r()*1.2),1,5),energy:clamp(Math.round(3.8-(heavy?1:0)+r()*1.2),1,5),
      sleep:clamp(Math.round(3.6-(heavy?1:0)+r()*1.2),1,5),tags:[],note:'',ts:Date.now()});
  }
  loadDraft();replanAll();toast('Datos de ejemplo cargados. Activé el check-in solo para el ejemplo; puedes revocarlo en Ajustes → Privacidad.');render();
}
function setStyle(id){
  if(!styleOk(id))return;
  S.settings.style=id;save();render();
}
