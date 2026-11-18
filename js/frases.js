const FRASES=[
  {id:'f01',texto:'No necesitas arrancar con todo: basta con dar el primer paso y volver mañana.',tema:'motivacion'},
  {id:'f02',texto:'Avanzar despacio también es avanzar, sobre todo cuando el día está pesado.',tema:'motivacion'},
  {id:'f03',texto:'No compares tu ritmo con el de nadie: tu semana tiene su propia carga.',tema:'motivacion'},
  {id:'f04',texto:'Lo que hoy parece grande se vuelve manejable cuando lo miras por partes.',tema:'motivacion'},
  {id:'f05',texto:'No hace falta tener ganas todos los días; a veces alcanza con empezar igual.',tema:'motivacion'},
  {id:'f06',texto:'Un rato de calma no te quita tiempo: te devuelve claridad.',tema:'motivacion'},
  {id:'f07',texto:'Cada pequeño avance cuenta, aunque no se vea en el resultado de hoy.',tema:'motivacion'},
  {id:'f08',texto:'Puedes cambiar el plan sin haber fallado. Eso también es organizarte.',tema:'motivacion'},
  {id:'f09',texto:'No tienes que convertir cada día en una prueba de resistencia.',tema:'motivacion'},
  {id:'f10',texto:'Mientras esperamos, la vida se nos va.',autor:'Séneca',tema:'motivacion'},
  {id:'f11',texto:'Repasar en voz alta, aunque sea bajito, suele ordenar mejor las ideas que leer en silencio.',tema:'estudio'},
  {id:'f12',texto:'Una hoja con tres ideas claras vale más que diez páginas subrayadas sin rumbo.',tema:'estudio'},
  {id:'f13',texto:'Si te trabas, cambia de ejercicio un rato: volver con la cabeza más fresca no es rendirse.',tema:'estudio'},
  {id:'f14',texto:'Estudiar no es llenar horas: es poder explicar lo que aprendiste con tus palabras.',tema:'estudio'},
  {id:'f15',texto:'Los descansos cortos no son premios; son parte del estudio.',tema:'estudio'},
  {id:'f16',texto:'Anota la duda aunque no sepas responderla: escribirla ya la hace más chica.',tema:'estudio'},
  {id:'f17',texto:'Un repaso de ayer sostiene mejor que tres repasos hechos con apuro hoy.',tema:'estudio'},
  {id:'f18',texto:'La felicidad de tu vida depende de la calidad de tus pensamientos.',autor:'Marco Aurelio',tema:'estudio'},
  {id:'f19',texto:'Cuando cueste concentrarte, reduce el objetivo a una sola página o un solo ejercicio.',tema:'estudio'},
  {id:'f20',texto:'No nos perturban las cosas, sino los juicios que hacemos de ellas.',autor:'Epicteto',tema:'estudio'},
  {id:'f21',texto:'Descansar no se gana: se necesita, igual que estudiar.',tema:'bienestar'},
  {id:'f22',texto:'Si hoy estás con poca energía, bajar el ritmo no es un fracaso, es un ajuste.',tema:'bienestar'},
  {id:'f23',texto:'Respirar hondo antes de responder también es una forma de cuidarte.',tema:'bienestar'},
  {id:'f24',texto:'Dormir bien es parte del plan, no un premio por haber terminado todo.',tema:'bienestar'},
  {id:'f25',texto:'No es porque la cosa sea difícil que no nos atrevemos; es porque no nos atrevimos que es difícil.',autor:'Séneca',tema:'bienestar'},
  {id:'f26',texto:'Un vaso de agua y un minuto lejos de la pantalla también cuentan como pausa.',tema:'bienestar'},
  {id:'f27',texto:'No eres tu lista de tareas: también eres quien se toma el tiempo de parar.',tema:'bienestar'},
  {id:'f28',texto:'Si algo te pesa, hablarlo con alguien de confianza ya alivia un poco el viaje.',tema:'bienestar'},
  {id:'f29',texto:'Hoy puedes hacer menos y seguir cuidando lo importante.',tema:'bienestar'},
  {id:'f30',texto:'No pretendas que las cosas sucedan como quieres; quiere que sucedan como suceden, y te irá bien.',autor:'Epicteto',tema:'bienestar'},
  {id:'f31',texto:'Un certamen se prepara con repetición tranquila, no con una noche en vela.',tema:'certamen'},
  {id:'f32',texto:'Llegar con el sueño hecho también es una estrategia de estudio.',tema:'certamen'},
  {id:'f33',texto:'Repasa primero los temas que más te cuestan: el tiempo no se te vaya en lo fácil.',tema:'certamen'},
  {id:'f34',texto:'Haz una lista corta de lo que sí sabes: desde ahí es más fácil seguir.',tema:'certamen'},
  {id:'f35',texto:'La noche anterior no es para aprenderlo todo: es para repasar lo esencial y descansar.',tema:'certamen'},
  {id:'f36',texto:'Si el certamen es pronto, elige tres temas clave antes de querer cubrir todo.',tema:'certamen'},
  {id:'f37',texto:'Llevar el plan anotado te ahorra decisiones el día de la prueba.',tema:'certamen'},
  {id:'f38',texto:'Un error en un certamen no define el semestre: corrígelo y sigue.',tema:'certamen'},
  {id:'f39',texto:'Las dificultades muestran lo que cada quien tiene dentro.',autor:'Epicteto',tema:'certamen'},
  {id:'f40',texto:'Terminar y salir a caminar también es parte de rendir bien.',tema:'certamen'}
];
const CONSEJOS=[
  {id:'c01',texto:'Si no arrancas, pon un temporizador de 5 minutos y haz solo lo primero.',tema:'motivacion'},
  {id:'c02',texto:'Elige una micro-tarea visible: terminar una también cuenta como avance.',tema:'motivacion'},
  {id:'c03',texto:'Cuando aparezca la pereza, abre el documento y escribe una línea.',tema:'motivacion'},
  {id:'c04',texto:'Deja la lista de hoy en papel: menos pantalla, menos ruido.',tema:'motivacion'},
  {id:'c05',texto:'Cambia «tengo que estudiar» por «voy a revisar un tema».',tema:'motivacion'},
  {id:'c06',texto:'Al terminar, anota una frase de lo aprendido, aunque sea corta.',tema:'motivacion'},
  {id:'c07',texto:'Si el día cambió, reordena sin culpa y sigue con lo esencial.',tema:'motivacion'},
  {id:'c08',texto:'Repasa en voz alta 3 minutos y después explícalo con tus palabras.',tema:'estudio'},
  {id:'c09',texto:'Haz preguntas al margen: responderlas es mejor repaso que subrayar.',tema:'estudio'},
  {id:'c10',texto:'Mezcla temas al estudiar: ayuda a reconocerlos en la prueba.',tema:'estudio'},
  {id:'c11',texto:'Resuelve un ejercicio sin mirar la teoría y luego revisa dónde fallaste.',tema:'estudio'},
  {id:'c12',texto:'Usa una hoja en blanco para dibujar el esquema del tema.',tema:'estudio'},
  {id:'c13',texto:'Si llevas 25 minutos, levántate 5: vuelves con más atención.',tema:'estudio'},
  {id:'c14',texto:'Reparte el repaso: 10 minutos hoy valen más que 60 el día anterior.',tema:'estudio'},
  {id:'c15',texto:'Cuando te atores, escribe la duda y sigue con otro punto.',tema:'estudio'},
  {id:'c16',texto:'Si tu energía o tu ánimo están bajos, hoy solo lo mínimo y una pausa real.',tema:'bienestar'},
  {id:'c17',texto:'Respira 4 segundos y exhala 6, tres veces, antes de seguir.',tema:'bienestar'},
  {id:'c18',texto:'Toma agua y mira algo lejano por 20 segundos.',tema:'bienestar'},
  {id:'c19',texto:'Estira hombros y cuello entre bloques; dos minutos bastan.',tema:'bienestar'},
  {id:'c20',texto:'Cena algo simple y deja el celular lejos de la cama si puedes.',tema:'bienestar'},
  {id:'c21',texto:'Si no dormiste bien, baja la meta de hoy sin dramatizar.',tema:'bienestar'},
  {id:'c22',texto:'Cubre la pantalla un minuto y cierra los ojos sin exigirte relajarte.',tema:'bienestar'},
  {id:'c23',texto:'Habla con alguien de confianza si el peso dura más de unos días.',tema:'bienestar'},
  {id:'c24',texto:'Repite los temas clave en voz alta, sin mirar apuntes.',tema:'certamen'},
  {id:'c25',texto:'Haz una lista de lo que no sabes y empieza por lo más probable.',tema:'certamen'},
  {id:'c26',texto:'Haz un repaso general la noche anterior y para temprano.',tema:'certamen'},
  {id:'c27',texto:'Llega con agua, lápiz y el plan de la prueba anotado.',tema:'certamen'},
  {id:'c28',texto:'Si te bloqueas, salta la pregunta y vuelve al final.',tema:'certamen'},
  {id:'c29',texto:'Repasa errores de pruebas anteriores antes de abrir un libro nuevo.',tema:'certamen'},
  {id:'c30',texto:'Al terminar, anota qué te sirvió para el próximo certamen.',tema:'certamen'}
];
const TEMAS_FRASES=[['todos','Todos'],['motivacion','Motivación'],['estudio','Estudio'],['bienestar','Bienestar'],['certamen','Certamen']];
const TEMA_FRASES_LABEL={motivacion:'Motivación',estudio:'Estudio',bienestar:'Bienestar',certamen:'Certamen'};
const hashFrase=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h};
const fraseDelDia=()=>FRASES[hashFrase(today())%FRASES.length];
const consejoDelTema=(tema,salt)=>{
  const pool=CONSEJOS.filter(c=>c.tema===tema);
  return pool[hashFrase(today()+salt)%pool.length];
};
function consejoContextual(){
  const t0=today(),e=typeof ci==='function'?ci(t0):null;
  if(e&&(e.energy<=2||e.mood<=2))return consejoDelTema('bienestar','bajo');
  const proximo=(S.events||[]).some(x=>{
    const d=diffDays(t0,x.date);
    return d>=0&&d<=3&&(x.type==='evaluacion'||x.type==='control'||/certamen|prueba/i.test(x.title||''));
  });
  return proximo?consejoDelTema('certamen','certamen'):consejoDelTema('estudio','estudio');
}
let fraseActualId=null;
let fraseModal={tema:'todos',indice:0,tab:'frases'};
function fraseMostrada(){
  const f=FRASES.find(x=>x.id===fraseActualId);
  return f||fraseDelDia();
}
function otraFrase(){
  const actual=fraseMostrada(),i=FRASES.findIndex(f=>f.id===actual.id);
  fraseActualId=FRASES[(i+1)%FRASES.length].id;
  render();
}
function fraseCardHtml(){
  const f=fraseMostrada(),c=consejoContextual();
  return `<section class="card frase-card" aria-labelledby="frase-titulo">
    <div class="frase-head"><h3 id="frase-titulo">Frase del día</h3><span class="tag">${esc(TEMA_FRASES_LABEL[f.tema]||f.tema)}</span></div>
    <div class="frase-body">
      <div class="frase-avatar" aria-hidden="true">🤖</div>
      <blockquote class="frase-texto"><p>${esc(f.texto)}</p>${f.autor?`<cite>— ${esc(f.autor)}</cite>`:''}</blockquote>
    </div>
    <p class="frase-consejo"><b>Consejo para hoy:</b> ${esc(c.texto)}</p>
    <div class="row"><button class="btn sec" type="button" data-focus-id="otra-frase" onclick="otraFrase()">Otra frase</button>
      <button class="btn" type="button" onclick="openFrasesModal('${f.tema}')">Ver más</button></div>
  </section>`;
}
function frasesModalLista(){
  if(fraseModal.tab==='favs')return FRASES.filter(f=>(S.frases&&S.frases.favs||[]).includes(f.id));
  return fraseModal.tema==='todos'?FRASES:FRASES.filter(f=>f.tema===fraseModal.tema);
}
function frasesModalHtml(){
  const fav=fraseModal.tab==='favs',lista=frasesModalLista();
  let body;
  if(!lista.length){
    body='<div class="empty">Aún no guardaste frases. Vuelve a la pestaña Frases y toca «★ Guardar».</div>';
  }else{
    if(fraseModal.indice>=lista.length)fraseModal.indice=0;
    const f=lista[fraseModal.indice],guardada=!!(S.frases&&S.frases.favs.includes(f.id));
    body=`<div class="frase-body frase-body-modal">
        <div class="frase-avatar" aria-hidden="true">🤖</div>
        <blockquote class="frase-texto"><p>${esc(f.texto)}</p>${f.autor?`<cite>— ${esc(f.autor)}</cite>`:''}
          <span class="tag">${esc(TEMA_FRASES_LABEL[f.tema]||f.tema)}</span></blockquote>
      </div>
      <p class="mute frase-consejo">${esc(consejoContextual().texto)}</p>
      <div class="row frase-actions">
        <button class="btn sec" type="button" id="frase-anterior" onclick="fraseModalPasar(-1)">Anterior</button>
        <button class="btn sec" type="button" id="frase-siguiente" onclick="fraseModalPasar(1)">Siguiente</button>
        <button class="btn ${guardada?'':'sec'}" type="button" id="frase-fav" aria-pressed="${guardada}" onclick="toggleFraseFav()">★ ${guardada?'Guardada':'Guardar'}</button>
      </div>`;
  }
  const chips=fav?'':`<div class="frases-chips" role="group" aria-label="Filtrar por tema">${TEMAS_FRASES.map(([k,label])=>
    `<button type="button" id="chip-${k}" class="tag sel ${fraseModal.tema===k?'on':''}" aria-pressed="${fraseModal.tema===k}" onclick="setFiltroFrases('${k}')">${esc(label)}</button>`).join('')}</div>`;
  return `<div class="frases-modal">
    <h3 id="modal-titulo">Frases y consejos</h3>
    <div class="frases-tabs" role="tablist" aria-label="Vistas de frases">
      <button type="button" id="tab-frases" role="tab" class="btn sec ${!fav?'on':''}" aria-selected="${!fav}" onclick="setFrasesTab('frases')">Frases</button>
      <button type="button" id="tab-favs" role="tab" class="btn sec ${fav?'on':''}" aria-selected="${fav}" onclick="setFrasesTab('favs')">Mis favoritas (${(S.frases&&S.frases.favs||[]).length})</button>
    </div>
    ${chips}${body}</div>`;
}
function actualizarFrasesModal(foco){
  const content=document.querySelector('#modal .modal-content');if(!content)return;
  content.innerHTML=frasesModalHtml();
  const dlg=document.querySelector('#modal [role="dialog"]'),target=foco?document.getElementById(foco):null;
  try{(target||dlg).focus({preventScroll:true})}catch(e){try{(target||dlg).focus()}catch(f){}}
}
function openFrasesModal(tema){
  const actual=fraseMostrada();
  fraseModal={tema:tema||'todos',indice:0,tab:'frases'};
  const i=frasesModalLista().findIndex(f=>f.id===actual.id);
  if(i>=0)fraseModal.indice=i;
  openModal(frasesModalHtml(),'Frases y consejos');
}
function setFrasesTab(tab){fraseModal.tab=tab;fraseModal.indice=0;actualizarFrasesModal('tab-'+tab)}
function setFiltroFrases(tema){fraseModal.tema=tema;fraseModal.indice=0;actualizarFrasesModal('chip-'+tema)}
function fraseModalPasar(delta){
  const lista=frasesModalLista();if(!lista.length)return;
  fraseModal.indice=(fraseModal.indice+delta+lista.length)%lista.length;
  actualizarFrasesModal(delta>0?'frase-siguiente':'frase-anterior');
}
function toggleFraseFav(){
  const f=frasesModalLista()[fraseModal.indice];if(!f)return;
  const favs=S.frases.favs,i=favs.indexOf(f.id);
  if(i<0)favs.push(f.id);else favs.splice(i,1);
  save();actualizarFrasesModal('frase-fav');
}
