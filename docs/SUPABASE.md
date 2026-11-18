# Configurar Amigos con Supabase

Amigos es **opcional**. Si no haces estos pasos, la app sigue funcionando 100 % en tu navegador y la pestaña Amigos ofrece **Probar con datos de ejemplo**: un backend en memoria con amigos, invitaciones y fechas ficticias, sin ninguna petición de red. Solo si quieres usar amigos reales necesitas Supabase.

## 1. Crear el proyecto

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) y crea un proyecto nuevo.
2. Espera a que termine de aprovisionarse. Guarda la contraseña de la base de datos en un lugar seguro (no la necesita la app).
3. En **Authentication → Providers**, revisa que **Email** esté habilitado.

## 2. Ejecutar el esquema

1. En el proyecto, abre **SQL Editor → New query**.
2. Pega todo el contenido de `supabase/schema.sql`.
3. Presiona **Run**. El script se puede volver a ejecutar: usa `create table if not exists` y `drop policy if exists`.

Eso crea las cinco tablas (`profiles`, `friendships`, `shared_events`, `study_sessions`, `session_invites`), activa RLS en todas y crea los helpers y RPCs. Verifica en **Table Editor** que las tablas aparezcan y que RLS esté activo.

## 3. Plantilla de correo con código de 6 dígitos

La app usa OTP con código, no enlace mágico, para evitar problemas de redirección en la PWA instalada.

1. Ve a **Authentication → Email Templates → Confirm signup** (y también **Magic Link** si Supabase la usa para el OTP de ese proyecto).
2. En el cuerpo del correo incluye el token explícitamente, por ejemplo:

```html
<h2>Tu código para entrar</h2>
<p>Tu código de 6 dígitos es: <strong>{{ .Token }}</strong></p>
<p>Si no fuiste tú, ignora este correo.</p>
```

3. Guarda el cambio. Comprueba que el correo llegue con el código visible.

Si Supabase te devuelve un enlace en vez de `token` en `/auth/v1/verify`, revisa que la plantilla incluya `{{ .Token }}` y que el proveedor Email esté configurado para OTP por código.

## 4. Copiar la URL y la anon key

1. En **Project Settings → API**, copia **Project URL** y **anon public** key.
2. Abre `js/config.js` y completa:

```js
const SUPABASE_URL='https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY='TU_ANON_KEY_PUBLICA';
```

3. Sube el archivo junto con el resto de la app. El service worker ya incluye `config.js` y `social.js` en su caché.

La **anon key es pública por diseño**: cualquiera que tenga la app puede verla. La seguridad no depende de secretos en el frontend, sino de las políticas **RLS** de `schema.sql` y de los RPCs `SECURITY DEFINER`. Nunca pongas la *service_role* key en el frontend.

## 5. Cómo se usa

1. Entra a **Amigos** e inicia sesión con tu correo. Escribe el código de 6 dígitos del correo.
2. La primera vez se pide el nombre visible (se propone el de tu perfil local) y se crea tu perfil con un código de amigo aleatorio de 8 letras.
3. Comparte tu código o ingresa el de otra persona. Las solicitudes pendientes se aceptan o rechazan desde la misma pestaña.
4. Para invitar a una sesión, crea la sesión con fecha, horario, ramo, lugar o enlace y nota, y marca a tus amigos.
5. Para compartir fechas, activa el interruptor **Compartir las fechas de este ramo con mis amigos**. Solo se sincronizan título, tipo, fecha y nombre del ramo. Las fechas que importes de un amigo guardan su origen y no se reenvían.

## Privacidad

Solo se envían a Supabase: nombre visible, código de amigo, relaciones de amistad, fechas de los ramos que marques como compartidos y sesiones de estudio.

**Nunca** se envían check-ins, energía, ánimo, sueño, diario, notas personales ni calificaciones: no hay tablas para esos datos en el esquema y el cliente no los incluye en ningún cuerpo de petición.

Para borrar todo lo que sí está en el servidor, usa **Amigos → Eliminar mi cuenta y mis datos del servidor**. Eso llama al RPC `delete_my_account()` y borra perfil, amistades, fechas, sesiones e invitaciones por cascada. No afecta tus datos locales ni tu respaldo JSON.

La Ley 21.719 de protección de datos personales de Chile aplica a lo que se guarda en el servidor si activas Amigos. Esto no es asesoría legal.

## Pruebas

`npm test` ejecuta el grupo `social.test.js` con un Supabase simulado por `page.route()`: no necesitas un proyecto real ni credenciales para correr las pruebas.
