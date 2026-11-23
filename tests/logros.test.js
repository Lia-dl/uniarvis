const {chromium}=require('playwright');
const path=require('path');
(async()=>{
  const file=process.argv[2]||path.join(__dirname,'..','index.html');
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1100,height:900}});
  const res=[],errs=[];
  const ok=(name,cond,extra='')=>res.push((cond?'OK   ':'FALLA')+' '+name+(extra?'  → '+extra:''));
  p.on('pageerror',e=>errs.push('pageerror: '+e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
  await p.addInitScript(()=>{try{localStorage.setItem('entrenador-academico-tour-seen-v1','1')}catch(e){}});
  await p.goto('file://'+path.resolve(file));
  if(await p.locator('#reg-name').count()){
    await p.fill('#reg-name','Prueba');await p.fill('#reg-career','Carrera');
    await p.locator('.hud-btn').click();
  }
  await p.evaluate(()=>{
    S=fresh();S.profile={name:'Prueba',career:'Carrera'};
    S.courses=[{id:'c1',name:'Cálculo',difficulty:3,color:'#3b6df0',grades:[],share:false,passGrade:4,roundFinal:true}];
    S.lastPlan=today();save();go('inicio');
  });

  const tocable=await p.evaluate(()=>{
    const b=document.querySelector('#arvis-inicio .arvis-tocable'),r=b&&b.getBoundingClientRect();
    return {label:b&&b.getAttribute('aria-label'),cursor:b&&getComputedStyle(b).cursor,w:r&&r.width,h:r&&r.height,base:b&&b.querySelector('img').getAttribute('src')};
  });
  ok('Arvis del inicio es botón accesible y área táctil >= 44px',tocable.label==='Personalizar a Arvis'&&tocable.cursor==='pointer'&&tocable.w>=44&&tocable.h>=44,JSON.stringify(tocable));
  ok('la imagen base sigue siendo la de Arvis',tocable.base==='icons/arvis/arvis-normal.svg',String(tocable.base));

  await p.click('#arvis-inicio .arvis-tocable');
  const ruta=await p.evaluate(()=>({hash:location.hash,titulo:document.querySelector('#app h2')&&document.querySelector('#app h2').textContent,nav:[...document.querySelectorAll('#nav button')].map(b=>b.textContent.trim())}));
  ok('tocar Arvis abre la personalización',ruta.hash==='#/ajustes/arvis'&&ruta.titulo==='Personaliza a Arvis',JSON.stringify(ruta.hash+' '+ruta.titulo));
  ok('no se agregaron botones al header',!ruta.nav.some(x=>/arvis/i.test(x)),JSON.stringify(ruta.nav));

  const bloqueados=await p.evaluate(()=>{
    const items=[...document.querySelectorAll('.accesorio.lock')],x=items[0];
    return {n:items.length,texto:x&&x.textContent,candado:!!(x&&x.querySelector('.accesorio-candado')),filtro:x&&getComputedStyle(x.querySelector('.arvis-figura')).filter};
  });
  ok('los 6 accesorios empiezan bloqueados, en gris y con candado y logro',bloqueados.n===6&&bloqueados.candado&&/grayscale/.test(bloqueados.filtro)&&/pomodoro/i.test(bloqueados.texto),JSON.stringify(bloqueados));

  await p.evaluate(()=>{
    S.events=[{id:'ev1',courseId:'c1',title:'Certamen',date:addDays(today(),2),type:'evaluacion'}];
    S.tasks=[];save();go('inicio');
  });
  await p.click('#arvis-alerta .arvis-tocable');
  ok('tocar Arvis en la alerta no activa Planificar',await p.evaluate(()=>location.hash==='#/ajustes/arvis'));
  await p.evaluate(()=>go('inicio'));
  await p.click('#arvis-alerta [onclick*="semana"]');
  ok('el botón Planificar sigue abriendo la semana',await p.evaluate(()=>location.hash==='#/planificacion/semana'));

  const pomo=await p.evaluate(()=>{
    const q=S.tools.pomodoro;q.phase='focus';q.running=true;q.endsAt=Date.now()-1;q.leftMs=0;q.sound=false;
    pomAdvance();
    return {p:arvisConfig().pomodoros,des:S.arvis.desbloqueados.slice(),aviso:document.querySelector('#toast').textContent};
  });
  ok('completar un pomodoro desbloquea el gorro y avisa',pomo.p>=1&&pomo.des.includes('gorro')&&/¡Desbloqueaste Gorro!/.test(pomo.aviso),JSON.stringify(pomo));

  await p.evaluate(()=>{
    arvisConfig().pomodoros=4;save();
    const q=S.tools.pomodoro;q.phase='focus';q.running=true;q.endsAt=Date.now()-1;q.leftMs=0;q.sound=false;pomAdvance();
  });
  ok('5 pomodoros desbloquean lentes',await p.evaluate(()=>S.arvis.desbloqueados.includes('lentes')));

  const fc=await p.evaluate(()=>{
    S.tools.flashcards={decks:[{id:'d1',name:'Mazo',activeDeckId:'d1',cards:[{id:'c1',front:'a',back:'b',box:1,due:today()}],limit:20}],activeDeckId:'d1',limit:20};
    save();startFlashcards();return S.arvis.desbloqueados.slice();
  });
  ok('repasar un mazo desbloquea la bufanda',fc.includes('bufanda'),JSON.stringify(fc));

  const check=await p.evaluate(()=>{
    S.wellbeing.diary=[0,1,2].map(n=>({date:addDays(today(),-n),energy:3,mood:3,sleep:3,tags:[],note:'',ts:Date.now()}));
    save();return S.arvis.desbloqueados.slice();
  });
  ok('3 check-ins seguidos desbloquean audífonos',check.includes('audifonos'),JSON.stringify(check));

  const plan=await p.evaluate(()=>{
    S.tasks=[{id:'t1',eventId:'ev1',courseId:'c1',title:'Repasar',date:today(),minutes:25,done:true}];
    logrosMarcarPlanSemanal();save();return S.arvis.desbloqueados.slice();
  });
  ok('cumplir el plan semanal desbloquea el birrete',plan.includes('birrete'),JSON.stringify(plan));

  const dias=await p.evaluate(()=>{S.createdAt=addDays(today(),-6);save();return S.arvis.desbloqueados.slice()});
  ok('7 días usando la app desbloquean la capa',dias.includes('capa'),JSON.stringify(dias));

  await p.evaluate(()=>{logrosEquipar('gorro');go('inicio')});
  const lugares=await p.evaluate(()=>{
    const inicio=document.querySelectorAll('#arvis-inicio .arvis-accesorio').length;
    arvisMomento={ts:Date.now(),mensaje:'',scope:''};
    S.tools.pomodoro.running=true;S.tools.pomodoro.phase='focus';S.tools.pomodoro.endsAt=Date.now()+600000;
    go('herramientas');
    return {guardado:JSON.parse(localStorage.getItem('entrenador-academico-v1')).arvis.equipado,inicio,cele:document.querySelectorAll('#arvis-celebrando .arvis-accesorio').length,estudio:document.querySelectorAll('#arvis-estudiando .arvis-accesorio').length};
  });
  ok('el accesorio se guarda y aparece en inicio, pomodoro y flashcards',lugares.guardado==='gorro'&&lugares.inicio===1&&lugares.cele===1&&lugares.estudio===1,JSON.stringify(lugares));

  const bk=await p.evaluate(()=>({err:validState(S),eq:cleanState(S).arvis.equipado}));
  ok('el accesorio sobrevive a exportar/importar estado',bk.err===null&&bk.eq==='gorro',JSON.stringify(bk));
  ok('sin errores de JavaScript',errs.length===0,errs.join(' || '));
  console.log(res.join('\n'));
  process.exitCode=res.some(x=>x.startsWith('FALLA'))?1:0;
  await b.close();
})().catch(e=>{console.error('ERROR DEL TEST',e);process.exit(1)});
