/* U.A.R.V.I.S. · Capacidad realista del día (clases + historial + check-in) */
/* ===================== Capacidad realista del día ===================== */
function sessMap(){if(C.sm)return C.sm;const m={};S.sessions.forEach(x=>m[x.date]=(m[x.date]||0)+x.minutes);return C.sm=m}
const doneOn=d=>sessMap()[d]||0;
const doneToday=()=>doneOn(today());
const classMinutes=date=>{const dow=(parse(date).getDay()+6)%7;return S.classes.filter(k=>k.day===dow).reduce((a,k)=>a+toMin(k.end)-toMin(k.start),0)};
function histPeak(date){                      // días de mayor estudio de las últimas 3 semanas
  const m=sessMap(),v=[];
  for(let i=1;i<=21;i++){const x=m[addDays(date,-i)];if(x>0)v.push(x)}
  if(v.length<5)return null;
  v.sort((a,b)=>a-b);return v[Math.min(v.length-1,Math.round(0.8*(v.length-1)))];
}
const softOn=d=>!!S.soft&&d>=S.soft.from&&d<=S.soft.until;
function factorFor(date){
  const c=ci(date);if(!c)return 1;
  let f=[0.45,0.7,0.9,1,1.05][c.energy-1]*[0.8,0.9,1,1,1][(c.sleep||3)-1];
  if(c.mood<=2)f*=0.9;
  return Math.max(0.35,f);
}
function capInfo(date){
  const key='c'+date;if(C[key])return C[key];
  const cm=classMinutes(date);
  let base=clamp((840-cm-360)*0.6,60,270);                 // 14 h de día − clases − 6 h de vida personal, 60% estudiable
  const hist=histPeak(date);
  if(hist)base=Math.max(60,Math.min(base*1.1,0.7*base+0.3*hist*1.15));
  const f=factorFor(date),sf=softOn(date)?0.75:1;
  return C[key]={cm,base:Math.round(base),hist,f,sf,val:Math.max(30,Math.round(base*f*sf/15)*15)};
}
const capFor=d=>capInfo(d).val;
function minFor(d){const m=Math.max(15,Math.round(S.settings.min*Math.min(1,factorFor(d))*(softOn(d)?0.75:1)/15)*15);return Math.min(m,capFor(d))}
const lowMode=d=>{const c=ci(d);return !!c&&(c.energy<=2||factorFor(d)<0.65)};
const planCap=d=>(d===today()&&lowMode(d))?minFor(d):capFor(d);   // con energía baja, hoy solo el mínimo viable
function capExplain(i){
  const L=[];
  L.push(i.cm?`Clases hoy: ${(i.cm/60).toFixed(1)} h → base de estudio ≈ ${i.base} min.`:`Sin clases hoy → base de estudio ≈ ${i.base} min.`);
  L.push(i.hist?`Tu ritmo reciente (tus días de más estudio ≈ ${Math.round(i.hist)} min) ajusta esa base.`:'Aún no hay suficiente historial (se usa tras ~5 días con estudio registrado).');
  L.push(ci(today())?`Tu check-in de hoy la deja en ${Math.round(i.f*100)}%.`:'Sin check-in hoy: uso la capacidad estándar.');
  if(i.sf<1)L.push('Modo suave activo: −25%.');
  return L;
}
function applySoft(){S.soft={from:today(),until:addDays(today(),2)};save();replanAll();toast('Modo suave por 3 días: bajé tu carga un 25% y reacomodé el plan.');render()}
function endSoft(){S.soft=null;save();replanAll();render()}
