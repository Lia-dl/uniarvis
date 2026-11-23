const ARVIS_MENSAJES={
  energia:[
    '¡Batería llena! Buen día para avanzar en lo difícil.',
    'Vienes con energía: podemos partir por lo más importante.',
    'Todo el pecho encendido. Hoy puedes dar un buen paso.'
  ],
  normal:[
    'Aquí estoy. ¿Por dónde partimos?',
    'Vamos a lo que se pueda, sin apuro.',
    'Un pasito a la vez también es avanzar.'
  ],
  sinCheckin:[
    'Aún no sé cómo vienes. Haz el check-in y ajusto el día contigo.',
    'Si haces el check-in, puedo acompañarte mejor hoy.',
    'Un check-in cortito y seguimos a tu ritmo.'
  ],
  celebrando:[
    '¡Listo! Eso ya está hecho.',
    'Buen trabajo. A disfrutar el descanso.',
    'Sumó. Gracias por darle una vuelta.'
  ],
  estudiando:[
    'Estoy contigo en este foco.',
    'Modo estudio: solo una cosa a la vez.',
    'Aquí acompañando, sin apuro.'
  ],
  preocupado:[
    'Vi una evaluación cerca y aún no hay plan para ese ramo.',
    'Hay una fecha pronta: mejor le ponemos un plan liviano.'
  ],
  cansado:[
    'Queda poca energía. Hagamos solo lo mínimo de hoy.',
    'Bajemos el volumen: lo esencial basta.',
    'No hace falta más. Podemos parar cuando quieras.'
  ],
  descansando:[
    'Hoy toca recargar. Descansar también es avanzar.',
    'Batería en cero: vale la pena parar un rato.',
    'Hoy no se exige nada. Primero, respirar.'
  ]
};
const ARVIS_ITEMS={
  gorro:{nombre:'Gorro',logro:'Completa tu primer pomodoro',svg:'<path d="M52 54 Q58 18 100 18 Q142 18 148 54 Z" fill="#e05d7a"/><rect x="46" y="49" width="108" height="17" rx="8" fill="#c84466"/><circle cx="100" cy="15" r="10" fill="#fff5d6"/>'},
  lentes:{nombre:'Lentes',logro:'Completa 5 pomodoros',svg:'<g fill="none" stroke="#2b3a4a" stroke-width="6"><circle cx="78" cy="98" r="20"/><circle cx="122" cy="98" r="20"/><path d="M98 98h4M58 94l-12-4M142 94l12-4"/></g><path d="M64 90 Q78 84 92 90" fill="rgba(255,255,255,.28)"/>'},
  bufanda:{nombre:'Bufanda',logro:'Repasa tu primer mazo de flashcards',svg:'<path d="M56 148 Q100 174 144 148 L144 168 Q100 194 56 168 Z" fill="#e39b2c"/><rect x="126" y="162" width="18" height="50" rx="8" fill="#c97f1e"/><path d="M60 154 Q100 176 140 154" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4"/>'},
  audifonos:{nombre:'Audífonos',logro:'Haz 3 check-ins de bienestar seguidos',svg:'<path d="M52 102 Q50 42 100 42 Q150 42 148 102" fill="none" stroke="#263b55" stroke-width="10" stroke-linecap="round"/><rect x="40" y="94" width="22" height="38" rx="10" fill="#263b55"/><rect x="138" y="94" width="22" height="38" rx="10" fill="#263b55"/>'},
  birrete:{nombre:'Birrete',logro:'Cumple tu primer plan semanal',svg:'<path d="M52 52 L148 52 L136 30 L64 30 Z" fill="#263b55"/><rect x="40" y="50" width="120" height="12" rx="6" fill="#1b2d42"/><path d="M160 60 L176 86" stroke="#ffc23d" stroke-width="4"/><circle cx="178" cy="90" r="6" fill="#ffc23d"/>'},
  capa:{nombre:'Capa',logro:'Usa la app durante 7 días',atras:true,svg:'<path d="M46 72 Q100 48 154 72 L172 210 Q100 232 28 210 Z" fill="#6d4bb5" opacity=".9"/><path d="M46 72 Q100 94 154 72" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5"/>'}
};
let arvisMomento=null;
const arvisOn=()=>!(typeof S!=='undefined'&&S&&S.settings&&S.settings.arvis===false);
function arvisConfig(){
  if(typeof S==='undefined'||!S)return freshArvis();
  if(!S.arvis||typeof S.arvis!=='object'||Array.isArray(S.arvis))S.arvis=cleanArvis(S.arvis);
  return S.arvis;
}
const arvisEquipado=()=>{
  const c=arvisConfig(),id=c.equipado;
  return id&&ARVIS_ITEMS[id]&&c.desbloqueados.indexOf(id)>=0?id:'';
};
function arvisFigura(estado,tamano,baseClass,equipado){
  const size=Number(tamano)>0?Number(tamano):96;
  const key=ARVIS_MENSAJES[estado]?estado:'normal';
  const id=equipado||arvisEquipado(),item=id&&ARVIS_ITEMS[id];
  const capa=item&&item.atras?`<svg class="arvis-accesorio arvis-atras" viewBox="0 0 200 240" aria-hidden="true" focusable="false">${item.svg}</svg>`:'';
  const frente=item&&!item.atras?`<svg class="arvis-accesorio" viewBox="0 0 200 240" aria-hidden="true" focusable="false">${item.svg}</svg>`:'';
  return `<span class="arvis-figura" style="--arvis-size:${size}px">${capa}<img class="arvis-base${baseClass?' '+baseClass:''}" src="icons/arvis/arvis-${key}.svg" alt="">${frente}</span>`;
}
const arvisPick=arr=>arr[Math.floor(Math.random()*arr.length)];
function arvisCheckinHoy(){
  const d=today();
  if(typeof diaryOn==='function'){
    const e=diaryOn(d);
    if(e&&e.energy!=null)return e;
  }
  const diary=S&&S.wellbeing&&S.wellbeing.diary;
  return diary?diary.find(e=>e.date===d&&e.energy!=null)||null:null;
}
function arvisEstadoDelDia(){
  const e=arvisCheckinHoy();
  if(!e)return 'normal';
  const n=Number(e.energy);
  if(n>=4)return 'energia';
  if(n===3)return 'normal';
  if(n===2)return 'cansado';
  return 'descansando';
}
function arvis(estado,mensaje,opciones){
  if(!arvisOn())return '';
  const o=opciones||{},key=ARVIS_MENSAJES[estado]?estado:'normal';
  const txt=mensaje||o.mensaje||arvisPick(ARVIS_MENSAJES[key]);
  const action=o.action?`<div class="arvis-action">${o.action}</div>`:'';
  const figura=arvisFigura(key,o.pequeno?56:96);
  const htmlFigura=o.tocable?`<button type="button" class="arvis-tocable" aria-label="Personalizar a Arvis" onclick="event.stopPropagation();go('arvis')">${figura}</button>`:figura;
  return `<div class="arvis-card${o.pequeno?' arvis-sm':''}${o.clase?' '+esc(o.clase):''}"${o.id?` id="${esc(o.id)}"`:''}>
    ${htmlFigura}
    <div class="arvis-bubble"><p>${esc(txt)}</p>${action}</div>
  </div>`;
}
function arvisInicioHtml(){
  if(!arvisOn())return '';
  if(!arvisCheckinHoy())return arvis('normal',arvisPick(ARVIS_MENSAJES.sinCheckin),{action:'<button class="lnk" type="button" onclick="go(\'bienestar\')">Hacer check-in</button>',id:'arvis-inicio',tocable:true});
  return arvis(arvisEstadoDelDia(),null,{id:'arvis-inicio',tocable:true});
}
function arvisCelebrar(){
  if(arvisOn())arvisMomento={ts:Date.now()};
}
function arvisMomentoHtml(){
  if(!arvisMomento||!arvisOn())return '';
  const reciente=Date.now()-arvisMomento.ts<12000;
  arvisMomento=null;
  return reciente?arvis('celebrando',null,{id:'arvis-celebrando'}):'';
}
function arvisEstudiandoHtml(){
  if(!arvisOn()||arvisMomento)return '';
  const p=S&&S.tools&&S.tools.pomodoro;
  if(!p||!p.running||p.phase!=='focus')return '';
  return arvis('estudiando',null,{pequeno:true,id:'arvis-estudiando'});
}
function arvisAlertaHtml(){
  if(!arvisOn())return '';
  const t0=today(),proxima=(S.events||[]).filter(e=>
    (e.type==='evaluacion'||e.type==='control'||/certamen|prueba/i.test(e.title||''))&&
    diffDays(t0,e.date)>=0&&diffDays(t0,e.date)<3
  ).sort((a,b)=>a.date.localeCompare(b.date))[0];
  if(!proxima)return '';
  const planeado=(S.tasks||[]).some(t=>t.courseId===proxima.courseId&&!t.done&&t.date>=t0&&t.date<=proxima.date);
  if(planeado)return '';
  return arvis('preocupado',null,{action:'<button class="btn sec" type="button" onclick="go(\'semana\')">Planificar</button>',id:'arvis-alerta',tocable:true});
}
function arvisVacioHtml(kind){
  if(!arvisOn())return '';
  const msgs={
    ramos:'Aún no hay ramos. Escribe el nombre de uno y toca Agregar para empezar.',
    tareas:'No hay micro-tareas. Agrega ramos y fechas para que aparezca un plan liviano.',
    amigos:'Todavía no hay amigos. Comparte tu código o invita a alguien con el suyo.'
  };
  if(!msgs[kind])return '';
  return arvis('normal',msgs[kind],{pequeno:true,id:'arvis-vacio-'+kind});
}
function arvisAvatarHtml(){
  return arvisOn()?arvisFigura('normal',56,'arvis-avatar'):'';
}
