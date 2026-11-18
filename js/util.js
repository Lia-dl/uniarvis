/* Entrenador Académico · Utilidades: fechas, formato, helpers */
/* ===================== Utilidades ===================== */
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,'0');
const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return fmt(d)};
const diffDays=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
const today=()=>fmt(new Date());
const mondayOf=s=>addDays(s,-((parse(s).getDay()+6)%7));
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const toMin=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
const dshort=s=>{const d=parse(s);return `${pad(d.getDate())}/${pad(d.getMonth()+1)}`};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const DAYS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const COLORS=['#3b6df0','#e0693a','#2e9e6a','#a855c7','#d6a21f','#16a0b8','#d6507a','#6b7384'];
const TYPE_LABEL={evaluacion:'Evaluación',entrega:'Entrega',control:'Control',otro:'Otro'};
const THEMES=[['cian','Cian','#00e5ff'],['rosa','Rosa claro','#ff8fc7'],['celeste','Celeste','#38bdf8'],['azul','Azul','#2563eb'],['verde','Verde','#22c55e'],['naranjo','Naranjo','#f97316'],['morado','Morado','#a855f7'],['amarillo','Amarillo','#eab308']];
const MODES=[['dark','Oscuro'],['light','Claro']];
const themeOk=id=>THEMES.some(t=>t[0]===id);
const modeOk=id=>MODES.some(m=>m[0]===id);
function applyTheme(){
  const st=(S&&S.settings)||{};
  const el=document.documentElement;
  el.setAttribute('data-accent',themeOk(st.theme)?st.theme:'cian');
  el.setAttribute('data-mode',modeOk(st.mode)?st.mode:'light');
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=st.mode==='light'?'#f4f7fb':'#050b14';
}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),4500)}
