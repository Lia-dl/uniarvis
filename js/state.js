/* U.A.R.V.I.S. · Estado de la app y persistencia local */
/* ===================== Estado y persistencia (solo en este navegador) ===================== */
const KEY='entrenador-academico-v1';
function freshPomodoro(){return {focusMin:25,shortMin:5,longMin:15,longEvery:4,sound:true,phase:'focus',running:false,endsAt:null,leftMs:1500000,pomodoros:0,target:''}}
function freshFlashcards(){return {decks:[],activeDeckId:'',limit:20}}
function freshTools(){return {pomodoro:freshPomodoro(),flashcards:freshFlashcards()}}
const toolInt=(v,a,b,d)=>Number.isInteger(v)&&v>=a&&v<=b?v:d;
const RX_TOOL_ID=/^[\w-]{1,40}$/,RX_TOOL_DATE=/^\d{4}-\d{2}-\d{2}$/;
const RX_TOOL_TARGET=/^(?:(course|task):[\w-]{1,40})?$/;
function validTools(t){
  if(!t||typeof t!=='object'||Array.isArray(t))return false;
  const p=t.pomodoro,f=t.flashcards;
  if(!p||typeof p!=='object'||Array.isArray(p))return false;
  if(![p.focusMin,p.shortMin,p.longMin].every(v=>Number.isInteger(v)&&v>=1&&v<=180))return false;
  if(!Number.isInteger(p.longEvery)||p.longEvery<2||p.longEvery>12)return false;
  if(typeof p.sound!=='boolean'||typeof p.running!=='boolean')return false;
  if(['focus','short','long'].indexOf(p.phase)<0)return false;
  if(p.endsAt!==null&&!(Number.isFinite(p.endsAt)&&p.endsAt>0))return false;
  if(!Number.isFinite(p.leftMs)||p.leftMs<0||p.leftMs>180*60000)return false;
  if(!Number.isInteger(p.pomodoros)||p.pomodoros<0||p.pomodoros>=p.longEvery)return false;
  if(typeof p.target!=='string'||!RX_TOOL_TARGET.test(p.target))return false;
  if(!f||typeof f!=='object'||Array.isArray(f))return false;
  if(!Number.isInteger(f.limit)||f.limit<1||f.limit>200)return false;
  if(!Array.isArray(f.decks)||f.decks.length>200)return false;
  const seen={};let total=0;
  for(const d of f.decks){
    if(!d||!RX_TOOL_ID.test(d.id)||seen[d.id]||typeof d.name!=='string'||d.name.length>80)return false;
    seen[d.id]=1;
    if(d.courseId!==undefined&&d.courseId!==''&&!RX_TOOL_ID.test(d.courseId))return false;
    if(!Array.isArray(d.cards)||d.cards.length>5000)return false;
    for(const c of d.cards){
      if(!c||!RX_TOOL_ID.test(c.id)||typeof c.front!=='string'||c.front.length>1000||typeof c.back!=='string'||c.back.length>1000)return false;
      if(!Number.isInteger(c.box)||c.box<1||c.box>5||!RX_TOOL_DATE.test(c.due))return false;
    }
    total+=d.cards.length;
  }
  if(total>5000)return false;
  if(f.activeDeckId!==undefined&&f.activeDeckId!==''&&!seen[f.activeDeckId])return false;
  return true;
}
function cleanTools(t){
  const out=freshTools(),p=t&&typeof t.pomodoro==='object'&&t.pomodoro?t.pomodoro:{},f=t&&typeof t.flashcards==='object'&&t.flashcards?t.flashcards:{};
  const P=out.pomodoro;
  P.focusMin=toolInt(p.focusMin,1,180,25);P.shortMin=toolInt(p.shortMin,1,180,5);P.longMin=toolInt(p.longMin,1,180,15);
  P.longEvery=toolInt(p.longEvery,2,12,4);P.sound=typeof p.sound==='boolean'?p.sound:true;
  P.phase=['focus','short','long'].indexOf(p.phase)>=0?p.phase:'focus';
  P.running=!!p.running;P.endsAt=P.running&&Number.isFinite(p.endsAt)?p.endsAt:null;
  P.leftMs=Number.isFinite(p.leftMs)?clamp(p.leftMs,0,180*60000):P.focusMin*60000;
  P.pomodoros=toolInt(p.pomodoros,0,P.longEvery-1,0);
  P.target=typeof p.target==='string'&&RX_TOOL_TARGET.test(p.target)?p.target:'';
  const F=out.flashcards,seen={};let total=0;
  F.limit=toolInt(f.limit,1,200,20);
  F.decks=(Array.isArray(f.decks)?f.decks:[]).slice(0,200).map(d=>{
    const id=d&&RX_TOOL_ID.test(d.id)&&!seen[d.id]?d.id:uid();seen[id]=1;
    const deck={id:id,name:String((d&&d.name)||'Mazo').slice(0,80),courseId:(d&&RX_TOOL_ID.test(d.courseId||''))?d.courseId:'',cards:[]};
    deck.cards=(Array.isArray(d&&d.cards)?d.cards:[]).slice(0,Math.max(0,5000-total)).map(c=>({
      id:c&&RX_TOOL_ID.test(c.id)?c.id:uid(),front:String((c&&c.front)||'').slice(0,1000),back:String((c&&c.back)||'').slice(0,1000),
      box:toolInt(c&&c.box,1,5,1),due:c&&RX_TOOL_DATE.test(c.due)?c.due:today()
    }));
    total+=deck.cards.length;
    return deck;
  });
  F.activeDeckId=F.decks.some(d=>d.id===f.activeDeckId)?f.activeDeckId:(F.decks[0]?F.decks[0].id:'');
  return out;
}
const migrateTools=t=>cleanTools(t);
const fresh=()=>({courses:[],classes:[],events:[],tasks:[],sessions:[],settings:{min:60,theme:'cian',mode:'light',style:'calma'},lastPlan:null,
  wellbeing:{diary:[]},createdAt:today(),lastBackup:null,backupSnooze:null,consent:null,soft:null,adapt:null,moved:null,dismissed:{},support:{name:'',contact:''},profile:{name:'',career:'',onboarded:false},intro:{status:'pending',at:null},tools:freshTools()});
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
  delete s.ratings;                               // aportes anónimos de ramos de versiones anteriores: ya no se guardan
  if(s.wellbeing)delete s.wellbeing.practices;
  if(!s.profile||typeof s.profile!=='object')s.profile={name:'',career:'',onboarded:false};
  if(s.profile.name==null)s.profile.name=''; if(s.profile.career==null)s.profile.career='';
  if(typeof s.profile.onboarded!=='boolean')s.profile.onboarded=!!(s.profile.name);
  if(!s.intro||typeof s.intro!=='object'||Array.isArray(s.intro))s.intro={status:(Array.isArray(s.courses)&&s.courses.length)?'done':'pending',at:null};
  if(['pending','done','skipped'].indexOf(s.intro.status)<0)s.intro.status='pending';
  if(Array.isArray(s.courses))s.courses.forEach(c=>{
    if(!Array.isArray(c.grades))c.grades=[];
    if(typeof c.share!=='boolean')c.share=false;
    if(!Number.isFinite(c.passGrade)||c.passGrade<1||c.passGrade>7)c.passGrade=4;
    if(typeof c.roundFinal!=='boolean')c.roundFinal=true;
  });
  s.tools=migrateTools(s.tools);
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
let icsPending=null,icsNotice='',icsEvaluations=[],introStep=1,introForced=false;
function introActive(){
  if(!S.profile||!S.profile.onboarded||LOCKED)return false;
  if(!S.intro||S.intro.status!=='pending')return false;
  return introForced||!S.courses.length;
}
function introMark(status){
  S.intro={status:status,at:today()};introStep=1;introForced=false;save();
}
function introFinish(status){
  introMark(status);render();
  if(typeof maybeShowTour==='function')maybeShowTour();
}
