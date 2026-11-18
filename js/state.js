/* U.A.R.V.I.S. · Estado de la app y persistencia local */
/* ===================== Estado y persistencia (solo en este navegador) ===================== */
const KEY='entrenador-academico-v1';
const fresh=()=>({courses:[],classes:[],events:[],tasks:[],sessions:[],ratings:[],settings:{min:60,theme:'cian',mode:'light',style:'calma'},lastPlan:null,
  wellbeing:{diary:[]},createdAt:today(),lastBackup:null,backupSnooze:null,consent:null,soft:null,adapt:null,moved:null,dismissed:{},support:{name:'',contact:''},profile:{name:'',career:'',onboarded:false}});
function migrate(s){
  const f=fresh();for(const k in f)if(s[k]===undefined)s[k]=f[k];
  if(!s.wellbeing||!Array.isArray(s.wellbeing.diary))s.wellbeing={diary:[]};
  if(!s.settings||typeof s.settings!=='object')s.settings={};
  if(!s.settings.min)s.settings.min=60;
  if(!themeOk(s.settings.theme))s.settings.theme='cian';
  if(!modeOk(s.settings.mode))s.settings.mode='light';
  if(!styleOk(s.settings.style))s.settings.style='hud';
  delete s.settings.max;                          // la capacidad máxima ahora se calcula cada día
  delete s.reviews;                               // reseñas de texto libre de versiones anteriores: ya no se guardan
  if(s.wellbeing)delete s.wellbeing.practices;
  if(!s.profile||typeof s.profile!=='object')s.profile={name:'',career:'',onboarded:false};
  if(s.profile.name==null)s.profile.name=''; if(s.profile.career==null)s.profile.career='';
  if(typeof s.profile.onboarded!=='boolean')s.profile.onboarded=!!(s.profile.name);
  if(Array.isArray(s.courses))s.courses.forEach(c=>{if(!Array.isArray(c.grades))c.grades=[];if(typeof c.share!=='boolean')c.share=false});
  return s;
}
let S=fresh();                    // se carga en boot() (ver app.js)
function boot(){                  // lee lo guardado; si está cifrado, queda en LOCKED hasta que se ponga la contraseña
  let j=null;try{j=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  if(j&&j.enc)LOCKED=j;else if(j&&j.courses)S=migrate(j);
}
let C={};                         // caché de cálculos; se invalida en cada cambio
const inval=()=>{C={}};
function save(){inval();persist();try{if(typeof socialAfterSave==='function')socialAfterSave()}catch(e){}}
function persist(){
  const json=JSON.stringify(S);
  if(KEYOBJ)writeQ=writeQ.then(()=>encryptState(json)).then(s=>{try{localStorage.setItem(KEY,s)}catch(e){}}).catch(()=>{});
  else{try{localStorage.setItem(KEY,json)}catch(e){}}
}
const course=id=>S.courses.find(c=>c.id===id);
const cname=id=>course(id)?course(id).name:'(ramo eliminado)';
const ccolor=id=>course(id)?course(id).color:'#6b7384';

let section='inicio',tab='inicio',weekStart=mondayOf(today()),pending=[],sylText='',sylCourse='',draft=null,ciEdit=false,bsel='larga',bt=null,mt=null;
