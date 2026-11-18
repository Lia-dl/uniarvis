/* U.A.R.V.I.S. · Lectura de horarios .ics (sin librerías; el archivo nunca sale del navegador) */
const ICS_MAX_BYTES=2*1024*1024;
const ICS_WEEKDAYS={MO:0,TU:1,WE:2,TH:3,FR:4,SA:5,SU:6};
const ICS_CHILE_ZONE=/^(America\/Santiago|Chile\/Continental|Chile\/EasterIsland)$/i;
const ICS_CL='America/Santiago';

function icsUnfold(text){
  const lines=String(text==null?'':text).replace(/\r\n?/g,'\n').split('\n'),out=[];
  lines.forEach(line=>{
    if(/^[ \t]/.test(line)&&out.length)out[out.length-1]+=line.slice(1);
    else if(line.trim())out.push(line);
  });
  return out;
}
function icsUnescape(s){
  return String(s==null?'':s).replace(/\\([nN,;\\])/g,(m,c)=>(c==='n'||c==='N')?' ':c).replace(/\s+/g,' ').trim();
}
function icsProp(line){
  const m=String(line).match(/^([^;:]+)((?:;[^:]+)*):(.*)$/);
  if(!m)return null;
  const params={};
  m[2].split(';').filter(Boolean).forEach(p=>{
    const i=p.indexOf('='),k=(i<0?p:p.slice(0,i)).toUpperCase();
    if(k)params[k]=i<0?'':p.slice(i+1).replace(/^"|"$/g,'');
  });
  return {name:m[1].toUpperCase(),params,value:m[3]};
}
function icsZoneParts(ts,zone){
  try{
    const f=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
    const o={};f.formatToParts(new Date(ts)).forEach(x=>{if(x.type!=='literal')o[x.type]=x.value});
    return {year:+o.year,month:+o.month,day:+o.day,hour:+(o.hour==='24'?'00':o.hour),minute:+o.minute};
  }catch(e){
    const d=new Date(ts);
    return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate(),hour:d.getUTCHours(),minute:d.getUTCMinutes()};
  }
}
function icsOffset(ts,zone){
  const p=icsZoneParts(ts,zone),asUTC=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute);
  return Math.round((asUTC-Math.floor(ts/60000)*60000)/60000);
}
function icsWallToInstant(y,mo,d,h,mi,zone){
  let ts=Date.UTC(y,mo,d,h,mi);
  for(let i=0;i<2;i++)ts=Date.UTC(y,mo,d,h,mi)-icsOffset(ts,zone)*60000;
  return ts;
}
function icsWall(value,params){
  const s=String(value==null?'':value).trim();
  const dt=s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/i),day=s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if(!dt&&!day)return null;
  const y=+(dt||day)[1],mo=+(dt||day)[2],d=+(dt||day)[3],h=dt?+dt[4]:0,mi=dt?+dt[5]:0;
  if(mo<1||mo>12||d<1||d>31||h>23||mi>59)return null;
  let date=`${y}-${pad(mo)}-${pad(d)}`,time=pad(h)+':'+pad(mi),ts=null;
  if(dt){
    const tz=(params&&params.TZID)||'';
    if(dt[7])ts=Date.UTC(y,mo-1,d,h,mi,+(dt[6]||0));
    else if(tz&&!ICS_CHILE_ZONE.test(tz))ts=icsWallToInstant(y,mo-1,d,h,mi,tz);
    if(ts!=null&&isFinite(ts)){
      const p=icsZoneParts(ts,ICS_CL);
      date=`${p.year}-${pad(p.month)}-${pad(p.day)}`;time=pad(p.hour)+':'+pad(p.minute);
    }
  }
  return {date,time,allDay:!dt};
}
function icsRRule(value){
  const r={};
  String(value||'').split(';').forEach(x=>{
    const i=x.indexOf('=');if(i>0)r[x.slice(0,i).toUpperCase()]=x.slice(i+1).toUpperCase();
  });
  if(r.FREQ!=='WEEKLY'||(r.INTERVAL&&+r.INTERVAL!==1))return null;
  const days=String(r.BYDAY||'').split(',').map(x=>ICS_WEEKDAYS[String(x).replace(/^[+-]?\d+/,'')]).filter(x=>x!=null);
  const count=r.COUNT?Math.min(104,Math.max(0,parseInt(r.COUNT,10)||0)):0;
  const until=r.UNTIL&&/^\d{8}/.test(r.UNTIL)?`${r.UNTIL.slice(0,4)}-${r.UNTIL.slice(4,6)}-${r.UNTIL.slice(6,8)}`:'';
  return {days,count,until};
}
function icsExpand(start,days,count,until){
  const out=[],limit=count||104;let cur=start,guard=0;
  while(out.length<limit&&guard<800){
    const wd=(parse(cur).getDay()+6)%7;
    if(days.indexOf(wd)>=0&&cur>=start&&(!until||cur<=until))out.push(cur);
    cur=addDays(cur,1);guard++;
  }
  return out;
}
function parseICS(text){
  const out={blocks:[],evaluations:[],warnings:[]},notes=[];
  try{
    const lines=icsUnfold(text);
    if(!lines.some(l=>/^BEGIN:VCALENDAR\b/i.test(l))&&!lines.some(l=>/^BEGIN:VEVENT\b/i.test(l))){
      out.warnings.push('No parece un archivo de calendario.');return out;
    }
    const events=[];let cur=null,inside=false;
    const close=()=>{
      if(inside&&cur&&cur.start&&cur.summary)events.push(cur);
      cur=null;inside=false;
    };
    lines.forEach(line=>{
      if(/^BEGIN:VEVENT\b/i.test(line)){close();cur={};inside=true;return}
      if(/^END:VEVENT\b/i.test(line)){close();return}
      if(!inside)return;
      const p=icsProp(line);if(!p)return;
      if(p.name==='DTSTART'){const d=icsWall(p.value,p.params);if(d)cur.start=d}
      else if(p.name==='DTEND'){const d=icsWall(p.value,p.params);if(d)cur.end=d}
      else if(p.name==='SUMMARY')cur.summary=icsUnescape(p.value);
      else if(p.name==='LOCATION')cur.location=icsUnescape(p.value);
      else if(p.name==='RRULE')cur.rrule=p.value;
    });
    close();
    const instances=[];
    events.forEach(ev=>{
      const name=String(ev.summary||'').slice(0,80);if(!name||!ev.start)return;
      const start=ev.start;
      let endMin=ev.end?(toMin(ev.end.time)-toMin(start.time)+1440)%1440:60;
      if(!endMin)endMin=60;if(endMin>720)endMin=720;
      const end=pad(Math.floor((toMin(start.time)+endMin)%1440/60))+':'+pad((toMin(start.time)+endMin)%60);
      const base={name,location:String(ev.location||'').slice(0,120),start:start.time,end,day:(parse(start.date).getDay()+6)%7};
      const rule=ev.rrule?icsRRule(ev.rrule):null;
      if(ev.rrule&&!rule)notes.push('Ignoré eventos con repetición que no es semanal.');
      if(rule){
        const days=rule.days.length?rule.days:[base.day];
        const dates=icsExpand(start.date,days,rule.count,rule.until);
        if(dates.length<2)instances.push(Object.assign({},base,{date:start.date}));
        dates.forEach(d=>instances.push(Object.assign({},base,{date:d})));
      }else instances.push(Object.assign({},base,{date:start.date}));
    });
    const groups={};
    instances.forEach(x=>{
      const key=x.day+'|'+x.start+'|'+x.end+'|'+norm(x.name);
      if(!groups[key])groups[key]={name:x.name,location:x.location,start:x.start,end:x.end,day:x.day,dates:new Set()};
      groups[key].dates.add(x.date);
    });
    Object.keys(groups).forEach(k=>{
      const g=groups[k],dates=[...g.dates].sort();
      if(dates.length>=2)out.blocks.push({name:g.name,location:g.location,day:g.day,start:g.start,end:g.end,count:dates.length,dates});
      else out.evaluations.push({title:g.name,date:dates[0],start:g.start,location:g.location});
    });
    out.blocks.sort((a,b)=>a.day-b.day||a.start.localeCompare(b.start)||a.name.localeCompare(b.name));
    out.evaluations.sort((a,b)=>a.date.localeCompare(b.date));
    out.evaluations=out.evaluations.slice(0,40);
    if(!out.blocks.length&&!out.evaluations.length)out.warnings.push('No encontré eventos con fechas válidas.');
  }catch(e){out.warnings.push('No pude leer ese calendario.');}
  notes.forEach(n=>{if(out.warnings.indexOf(n)<0)out.warnings.push(n)});
  return out;
}
