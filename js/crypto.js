/* Entrenador Académico · Cifrado opcional de los datos con contraseña (WebCrypto: PBKDF2 + AES-GCM-256).
   La contraseña nunca se guarda: solo vive en memoria la clave derivada (no exportable). */
const CRYPTO_OK=!!(window.crypto&&crypto.subtle&&window.isSecureContext!==false);
const PBKDF2_IT=250000;
let KEYOBJ=null,KDF=null,LOCKED=null,writeQ=Promise.resolve();

function b64(buf){const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)}
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function deriveKey(pass,salt,it){
  const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function encryptState(json){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},KEYOBJ,new TextEncoder().encode(json));
  return JSON.stringify({enc:1,v:1,it:KDF.it,salt:b64(KDF.salt),iv:b64(iv),data:b64(ct)});
}
function validBlob(b){
  return !!b&&b.enc===1&&b.v===1&&Number.isInteger(b.it)&&b.it>=100000&&b.it<=2000000&&
    ['salt','iv','data'].every(k=>typeof b[k]==='string'&&/^[A-Za-z0-9+/=]+$/.test(b[k])&&b[k].length<=8e6);
}
async function decryptBlob(blob,pass){
  if(!validBlob(blob))throw new Error('archivo cifrado dañado');
  const salt=unb64(blob.salt),key=await deriveKey(pass,salt,blob.it);
  const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(blob.iv)},key,unb64(blob.data));   // falla si la contraseña es incorrecta
  KEYOBJ=key;KDF={salt,it:blob.it};
  return new TextDecoder().decode(pt);
}
async function dropKey(){await writeQ;KEYOBJ=null;KDF=null}      // espera las escrituras pendientes para que ninguna cifrada pise a una en claro

async function enableEncryption(){
  const a=$('#np1').value,b=$('#np2').value;
  if(a.length<8)return toast('Usa al menos 8 caracteres.');
  if(a!==b)return toast('Las contraseñas no coinciden.');
  if(!await askConfirm({title:'Activar cifrado',text:'Si olvidas la contraseña, tus datos NO se pueden recuperar. Guarda antes un respaldo.',okLabel:'Activar'}))return;
  try{
    const salt=crypto.getRandomValues(new Uint8Array(16));
    KDF={salt,it:PBKDF2_IT};KEYOBJ=await deriveKey(a,salt,PBKDF2_IT);
    save();await writeQ;                          // reemplaza la copia en claro por la cifrada
    toast('Cifrado activado. La app te pedirá la contraseña al abrirla.');render();
  }catch(e){KEYOBJ=null;KDF=null;toast('No se pudo activar el cifrado en este navegador.')}
}
async function changePass(){
  const a=$('#np1').value,b=$('#np2').value;
  if(a.length<8)return toast('Usa al menos 8 caracteres.');
  if(a!==b)return toast('Las contraseñas no coinciden.');
  try{
    await writeQ;const salt=crypto.getRandomValues(new Uint8Array(16));
    KDF={salt,it:PBKDF2_IT};KEYOBJ=await deriveKey(a,salt,PBKDF2_IT);
    save();await writeQ;toast('Contraseña cambiada.');render();
  }catch(e){toast('No se pudo cambiar la contraseña.')}
}
async function disableEncryption(){
  if(!await askConfirm({title:'Desactivar cifrado',text:'Tus datos volverán a guardarse sin cifrar en este navegador.',okLabel:'Desactivar',danger:true}))return;
  await dropKey();save();toast('Cifrado desactivado.');render();
}
async function unlock(ev){
  ev.preventDefault();
  const pass=$('#lp').value;if(!pass)return;
  try{
    const j=JSON.parse(await decryptBlob(LOCKED,pass));
    if(!j||!Array.isArray(j.courses))throw new Error('formato');
    S=migrate(j);LOCKED=null;inval();start();
  }catch(e){toast('No pude abrirlo: contraseña incorrecta o archivo dañado.');const i=$('#lp');if(i){i.value='';i.focus()}}
}
async function forgotPass(){
  if(!await askConfirm({title:'Borrar datos cifrados',text:'Se borrarán los datos cifrados de este navegador. Solo podrás recuperarlos con un respaldo y su contraseña.',okLabel:'Borrar',danger:true}))return;
  try{localStorage.removeItem(KEY)}catch(e){}
  LOCKED=null;KEYOBJ=null;KDF=null;S=fresh();start();
}
function lockView(){
  return `<div class="card" style="max-width:440px;margin:30px auto">
    <h2>Tus datos están protegidos</h2>
    <p class="mute" style="margin-top:0">Escribe tu contraseña para abrir la app. Los datos se descifran solo en este dispositivo.</p>
    <form onsubmit="unlock(event);return false">
      <input id="lp" type="password" autocomplete="current-password" placeholder="Contraseña" style="width:100%" aria-label="Contraseña">
      <div class="row" style="margin-top:10px"><button class="btn" type="submit">Desbloquear</button></div>
    </form>
    <details style="margin-top:12px"><summary>¿Olvidaste la contraseña?</summary>
      <p class="mute">Sin ella no hay forma de recuperar los datos cifrados. Si tienes un respaldo, puedes borrar los datos de este navegador y restaurarlo (necesitarás la contraseña con la que se cifró).</p>
      <button class="btn del" onclick="forgotPass()">Borrar los datos cifrados de este navegador</button></details></div>`;
}
function encryptionHtml(){
  if(!CRYPTO_OK)return '<p class="mute">El cifrado con contraseña no está disponible aquí (el navegador lo permite solo en https o localhost).</p>';
  const pw='<input id="np1" type="password" placeholder="Contraseña (mín. 8)" autocomplete="new-password" aria-label="Nueva contraseña"><input id="np2" type="password" placeholder="Repítela" autocomplete="new-password" aria-label="Repetir contraseña">';
  if(KEYOBJ)return `<div class="banner lock" style="margin:10px 0"><b>Cifrado activado.</b> Tus datos se guardan cifrados y la app te pedirá la contraseña al abrirla. Si la olvidas, no se pueden recuperar. Los respaldos que descargues también salen cifrados.
    <div class="row" style="margin-top:8px">${pw}<button class="btn sec" onclick="changePass()">Cambiar contraseña</button><button class="btn sec" onclick="disableEncryption()">Desactivar cifrado</button></div></div>`;
  return `<div style="margin:10px 0"><b>Proteger con contraseña (opcional)</b>
    <p class="mute" style="margin:4px 0 8px">Cifra tus datos en este navegador (AES-256). Recomendado si compartes el equipo. Si olvidas la contraseña no hay forma de recuperarlos: descarga un respaldo antes.</p>
    <div class="row">${pw}<button class="btn" onclick="enableEncryption()">Activar cifrado</button></div></div>`;
}
