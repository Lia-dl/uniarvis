const SocialMock=(function(){
  const ME='a1111111-1111-4111-8111-111111111111';
  const ANA='b2222222-2222-4222-8222-222222222222';
  const BETO='c3333333-3333-4333-8333-333333333333';
  const CAMI='d4444444-4444-4444-8444-444444444444';
  const DIEGO='e5555555-5555-4555-8555-555555555555';
  let DB=null,seq=0,notice='',notify=null,timers=[];

  const auth=email=>({access_token:'demo-token',refresh_token:'demo-refresh',
    expires_at:Math.floor(Date.now()/1000)+36000,user_id:ME,email:email||'demo@ejemplo.cl'});
  const fail=(status,msg)=>Promise.reject(Object.assign(new Error(msg),{status:status}));
  const idsFrom=raw=>{const out=[],re=/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/g;let m;while((m=re.exec(raw||'')))out.push(m[0]);return out};
  const stamp=()=>new Date().toISOString();
  const later=fn=>{const t=setTimeout(fn,2200);timers.push(t)};
  const emit=msg=>{notice=msg;if(typeof notify==='function')notify(msg)};
  const friends=()=>DB.friendships.filter(f=>f.status==='accepted').map(f=>f.requester===ME?f.addressee:f.requester);
  const visible=()=>DB.sessions.filter(s=>s.host===ME||DB.invites.some(i=>i.session_id===s.id&&i.user_id===ME));

  function seed(){
    const t=today();
    DB={profiles:{},friendships:[],sessions:[],invites:[],shared:[]};
    DB.profiles[ANA]={id:ANA,display_name:'Ana',friend_code:'ANADEMOX'};
    DB.profiles[BETO]={id:BETO,display_name:'Beto',friend_code:'BETODEMO'};
    DB.profiles[CAMI]={id:CAMI,display_name:'Camila',friend_code:'CAMIDEMO'};
    DB.profiles[DIEGO]={id:DIEGO,display_name:'Diego',friend_code:'DIEGODEM'};
    DB.friendships.push(
      {id:'fr-demo-1',requester:ANA,addressee:ME,status:'accepted',created_at:stamp()},
      {id:'fr-demo-2',requester:ME,addressee:BETO,status:'accepted',created_at:stamp()},
      {id:'fr-demo-3',requester:CAMI,addressee:ME,status:'accepted',created_at:stamp()},
      {id:'fr-demo-4',requester:DIEGO,addressee:ME,status:'pending',created_at:stamp()}
    );
    DB.sessions.push(
      {id:'s-demo-1',host:ANA,title:'Repaso de derivadas',course_name:'Cálculo III',date:addDays(t,1),start_time:'18:00',end_time:'19:00',place:'Biblioteca central',note:'Traer apuntes de la clase pasada.',created_at:stamp()},
      {id:'s-demo-2',host:BETO,title:'Taller de economía',course_name:'Economía',date:addDays(t,3),start_time:'16:30',end_time:'17:30',place:'Sala 205',note:null,created_at:stamp()}
    );
    DB.invites.push(
      {session_id:'s-demo-1',user_id:ME,status:'invited'},
      {session_id:'s-demo-2',user_id:ME,status:'invited'}
    );
    DB.shared.push(
      {id:'e-demo-1',owner:ANA,local_id:'ev-demo-1',course_name:'Cálculo III',title:'Certamen de derivadas',date:addDays(t,6),type:'evaluacion',updated_at:stamp()},
      {id:'e-demo-2',owner:ANA,local_id:'ev-demo-2',course_name:'Cálculo III',title:'Entrega de taller',date:addDays(t,13),type:'entrega',updated_at:stamp()},
      {id:'e-demo-3',owner:BETO,local_id:'ev-demo-3',course_name:'Economía',title:'Control de macro',date:addDays(t,9),type:'control',updated_at:stamp()},
      {id:'e-demo-4',owner:CAMI,local_id:'ev-demo-4',course_name:'Programación',title:'Proyecto final',date:addDays(t,17),type:'entrega',updated_at:stamp()},
      {id:'e-demo-5',owner:CAMI,local_id:'ev-demo-5',course_name:'Programación',title:'Quiz de SQL',date:addDays(t,24),type:'evaluacion',updated_at:stamp()}
    );
    seq=5;
  }

  function request(path,opt){
    if(!DB)return fail(401,'El modo demo no está activo.');
    opt=opt||{};
    const u=new URL(path,'https://demo.local'),p=u.pathname,params=u.searchParams,
      method=String(opt.method||'GET').toUpperCase(),body=opt.body;
    if(p==='/auth/v1/otp'&&method==='POST')return Promise.resolve({});
    if(p==='/auth/v1/token'&&method==='POST')return Promise.resolve(auth(body&&body.email));
    if(p==='/auth/v1/verify'&&method==='POST'){
      const code=String((body&&body.token)||'').replace(/\s/g,'');
      if(!/^\d{6}$/.test(code))return fail(400,'El código debe tener 6 dígitos.');
      return Promise.resolve(auth(body&&body.email));
    }
    if(p==='/rest/v1/profiles'&&method==='GET'){
      const id=params.get('id')||'';
      if(id.startsWith('eq.'))return Promise.resolve(DB.profiles[id.slice(3)]?[DB.profiles[id.slice(3)]]:[]);
      if(id.startsWith('in.'))return Promise.resolve(idsFrom(id).map(x=>DB.profiles[x]).filter(Boolean));
      return Promise.resolve(Object.values(DB.profiles));
    }
    if(p==='/rest/v1/profiles'&&method==='POST'){
      const row=Object.assign({},body||{});
      DB.profiles[row.id]=row;
      return Promise.resolve([row]);
    }
    if(p==='/rest/v1/friendships'&&method==='GET'){
      const me=idsFrom(params.get('or')||'')[0]||ME;
      return Promise.resolve(DB.friendships.filter(f=>f.requester===me||f.addressee===me));
    }
    if(p==='/rest/v1/friendships'&&method==='DELETE')return Promise.resolve(null);
    if(p==='/rest/v1/rpc/send_friend_request'&&method==='POST'){
      const code=String((body&&body.code)||'').trim().toUpperCase();
      const target=Object.values(DB.profiles).find(x=>x.friend_code===code);
      if(!target)return fail(400,'No encontramos ese código de amigo.');
      if(target.id===ME)return fail(400,'Ese es tu propio código de amigo.');
      const inverse=DB.friendships.find(f=>f.requester===target.id&&f.addressee===ME&&f.status==='pending');
      if(inverse)inverse.status='accepted';
      else if(!DB.friendships.some(f=>(f.requester===ME&&f.addressee===target.id)||(f.requester===target.id&&f.addressee===ME)))
        DB.friendships.push({id:'fr-demo-'+(++seq),requester:ME,addressee:target.id,status:'pending',created_at:stamp()});
      return Promise.resolve(null);
    }
    if(p==='/rest/v1/rpc/respond_friend_request'&&method==='POST'){
      const f=DB.friendships.find(x=>x.id===(body&&body.id)&&x.addressee===ME);
      if(!f)return fail(400,'No encontramos esa solicitud.');
      if(body&&body.accept)f.status='accepted';else DB.friendships=DB.friendships.filter(x=>x!==f);
      return Promise.resolve(null);
    }
    if(p==='/rest/v1/rpc/remove_friend'&&method==='POST'){
      DB.friendships=DB.friendships.filter(f=>!(f.status==='accepted'&&((f.requester===ME&&f.addressee===body.other)||(f.addressee===ME&&f.requester===body.other))));
      return Promise.resolve(null);
    }
    if(p==='/rest/v1/rpc/restore_friend'&&method==='POST'){
      const other=body&&body.other;
      if(!DB.friendships.some(f=>f.status==='accepted'&&((f.requester===ME&&f.addressee===other)||(f.addressee===ME&&f.requester===other))))
        DB.friendships.push({id:'fr-demo-'+(++seq),requester:ME,addressee:other,status:'accepted',created_at:stamp()});
      return Promise.resolve(null);
    }
    if(p==='/rest/v1/study_sessions'&&method==='GET')return Promise.resolve(visible());
    if(p==='/rest/v1/study_sessions'&&method==='POST'){
      const s=Object.assign({id:'s-demo-'+(++seq),created_at:stamp()},body||{});
      DB.sessions.push(s);
      later(function(){
        if(!DB)return;
        const pend=DB.invites.filter(i=>i.session_id===s.id&&i.user_id!==ME&&i.status==='invited').slice(0,2);
        if(!pend.length)return;
        pend.forEach(i=>{i.status='accepted'});
        const names=pend.map(i=>(DB.profiles[i.user_id]||{}).display_name||'Un amigo');
        emit(names.join(' y ')+(pend.length===1?' aceptó':' aceptaron')+' tu sesión "'+s.title+'". Ya aparece como aceptada.');
      });
      return Promise.resolve([s]);
    }
    if(p==='/rest/v1/study_sessions'&&method==='DELETE'){
      const id=(params.get('id')||'').replace('eq.','');
      DB.sessions=DB.sessions.filter(s=>s.id!==id);
      DB.invites=DB.invites.filter(i=>i.session_id!==id);
      return Promise.resolve(null);
    }
    if(p==='/rest/v1/session_invites'&&method==='GET'){
      const vis=new Set(visible().map(s=>s.id));
      return Promise.resolve(DB.invites.filter(i=>vis.has(i.session_id)));
    }
    if(p==='/rest/v1/session_invites'&&method==='POST'){
      DB.invites.push({session_id:body.session_id,user_id:body.user_id,status:'invited'});
      return Promise.resolve(null);
    }
    if(p==='/rest/v1/rpc/respond_session'&&method==='POST'){
      const i=DB.invites.find(x=>x.session_id===body.sid&&x.user_id===ME);
      if(!i)return fail(400,'No tienes una invitación para esa sesión.');
      i.status=body.status;
      return Promise.resolve(null);
    }
    if(p==='/rest/v1/shared_events'&&method==='GET'){
      const fs=new Set(friends());
      return Promise.resolve(DB.shared.filter(e=>e.owner===ME||fs.has(e.owner)));
    }
    if(p==='/rest/v1/shared_events'&&method==='POST'){
      const rows=Array.isArray(body)?body:[body||{}];
      rows.forEach(row=>{
        const old=DB.shared.find(e=>e.owner===row.owner&&e.local_id===row.local_id);
        if(old)Object.assign(old,row,{updated_at:stamp()});
        else DB.shared.push(Object.assign({id:'e-demo-'+(++seq)},row,{updated_at:stamp()}));
      });
      return Promise.resolve(null);
    }
    if(p==='/rest/v1/shared_events'&&method==='DELETE'){
      const owners=idsFrom(params.get('owner')||'');
      const locals=(params.get('local_id')||'').replace(/^in\.\(?|\)?$/g,'').split(',').filter(Boolean);
      DB.shared=DB.shared.filter(e=>!(owners.includes(e.owner)&&locals.includes(e.local_id)));
      return Promise.resolve(null);
    }
    if(p==='/rest/v1/rpc/delete_my_account'&&method==='POST'){
      DB.profiles={};DB.friendships=[];DB.sessions=[];DB.invites=[];DB.shared=[];
      return Promise.resolve(null);
    }
    return fail(404,'Ruta de ejemplo no simulada: '+p);
  }

  return {
    start:function(){timers.forEach(clearTimeout);timers=[];notice='';seed();return auth()},
    stop:function(){timers.forEach(clearTimeout);timers=[];notice='';DB=null;notify=null},
    ready:function(){return !!DB},
    request:request,
    consumeNotice:function(){const n=notice;notice='';return n},
    onNotice:function(fn){notify=fn}
  };
})();
