// Uso: node tests/onboarding.test.js <ruta-al-html> <carpeta-temporal>
const {chromium}=require('playwright');
const fs=require('fs');

(async()=>{
  const file=process.argv[2],tmp=process.argv[3];fs.mkdirSync(tmp,{recursive:true});
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1100,height:900}});
  const res=[],errs=[];
  const ok=(n,c,x='')=>res.push((c?'OK   ':'FALLA')+' '+n+(x?'  → '+x:''));
  p.on('pageerror',e=>errs.push('pageerror: '+e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
  await p.addInitScript(()=>{try{localStorage.setItem('entrenador-academico-tour-seen-v1','1')}catch(e){}});
  await p.goto('file://'+file);

  await p.fill('#reg-name','Ana');
  await p.fill('#reg-career','Medicina');
  await p.locator('.hud-btn').click();
  await p.waitForSelector('#onboarding');
  let txt=await p.textContent('#onboarding');
  ok('onboarding aparece la primera vez sin ramos',txt.includes('1/3')&&txt.includes('Configura tu semestre'));
  ok('paso 1 ofrece ramo rápido, syllabus y ejemplo',txt.includes('Agregar ramo')&&txt.includes('Subir syllabus')&&txt.includes('Prefiero ver un ejemplo primero'));
  ok('el enlace del ejemplo llama a loadDemo()',await p.evaluate(()=>{
    const a=[...document.querySelectorAll('#onboarding a, #onboarding button')].find(x=>x.textContent.includes('Prefiero ver un ejemplo primero'));
    return !!a&&/loadDemo\(\)/.test(a.getAttribute('onclick')||'');
  }));

  await p.click('[data-focus-id="intro-next"]');
  ok('paso 2 muestra progreso e importación .ics',(await p.textContent('#onboarding')).includes('2/3')&&await p.locator('#onboarding input[onchange="onICSFile(this)"]').count()===1);
  await p.click('[data-focus-id="intro-next"]');
  txt=await p.textContent('#onboarding');
  ok('paso 3 explica el check-in y usa el consentimiento existente',txt.includes('3/3')&&/check-in diario/.test(txt)&&txt.includes('Acepto y quiero usar el check-in'));
  ok('cada paso tiene Saltar',await p.locator('#onboarding button.lnk').filter({hasText:'Saltar'}).count()===1);
  await p.click('text=Ahora no');
  await p.waitForSelector('#onboarding',{state:'detached'});
  const c1=await p.evaluate(()=>({status:S.intro.status,consent:S.consent&&S.consent.health}));
  ok('elegir en el paso 3 marca la introducción como completada',c1.status==='done'&&c1.consent===false,JSON.stringify(c1));

  await p.reload();
  ok('no vuelve a aparecer después de completarla',await p.locator('#onboarding').count()===0);
  await p.evaluate(()=>go('tema'));
  ok('Ajustes ofrece ver la introducción de nuevo',(await p.textContent('#app')).includes('Ver la introducción de nuevo'));
  await p.click('[data-focus-id="restart-intro"]');
  await p.waitForSelector('#onboarding');
  ok('la opción de Ajustes la reabre en el paso 1',(await p.textContent('#onboarding')).includes('1/3'));
  await p.locator('#onboarding button.lnk').filter({hasText:'Saltar'}).click();
  await p.waitForSelector('#onboarding',{state:'detached'});
  ok('Saltar queda guardado como omitida',await p.evaluate(()=>S.intro.status==='skipped'));
  await p.reload();
  ok('no reaparece tras saltarla y recargar',await p.locator('#onboarding').count()===0);

  await p.evaluate(()=>{
    S=fresh();S.profile={name:'Ana',career:'Medicina',onboarded:true};S.intro={status:'pending',at:null};
    S.courses=[{id:'c1',name:'Cálculo',difficulty:3,color:'#3b6df0',grades:[]}];save();go('inicio');
  });
  ok('con ramos no aparece aunque el estado esté pendiente',await p.locator('#onboarding').count()===0);
  await p.evaluate(()=>{restartIntro()});
  ok('al reabrirla desde Ajustes aparece aunque haya ramos',await p.locator('#onboarding').count()===1);

  ok('sin errores de JavaScript',errs.length===0,errs.join(' || '));
  console.log(res.join('\n'));
  process.exitCode=res.some(r=>r.startsWith('FALLA'))?1:0;
  await b.close();
})().catch(e=>{console.error('ERROR DEL TEST',e);process.exit(1)});
