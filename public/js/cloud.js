/* ---------- accounts, sync, community and billing (Supabase + Stripe through /api functions) ---------- */
const CFG=window.LUNORB_CONFIG||{};
const BACKEND=!!(CFG.supabaseUrl&&CFG.supabaseKey&&window.supabase);
const URL_HASH=location.hash,RECOVERY=/type=recovery/.test(URL_HASH);
const REMEMBER=()=>{try{return localStorage.getItem('lunorb.remember')!=='0'}catch{return true}};
const AUTH_STORE={getItem:k=>{try{return localStorage.getItem(k)??sessionStorage.getItem(k)}catch{return null}},
  setItem:(k,v)=>{try{const[keep,drop]=REMEMBER()?[localStorage,sessionStorage]:[sessionStorage,localStorage];keep.setItem(k,v);drop.removeItem(k)}catch{}},
  removeItem:k=>{try{localStorage.removeItem(k);sessionStorage.removeItem(k)}catch{}}};
const sb=BACKEND?supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:AUTH_STORE}}):null;
// which sign-in providers are switched on in Supabase (also tells us if the account server is reachable at all)
let AUTH_INFO=null;
const authInfo=()=>AUTH_INFO||(AUTH_INFO=fetch(CFG.supabaseUrl+'/auth/v1/settings',{headers:{apikey:CFG.supabaseKey}}).then(r=>r.ok?r.json():Promise.reject(new Error('settings '+r.status))).then(j=>({up:true,ext:j.external||{}})).catch(()=>{AUTH_INFO=null;return{up:false,ext:{}}}));
const ME={user:null,profile:null,sub:{plan:'free'},token:null};
let gated=false,authMode=RECOVERY?'update':'signin',authNotice='',authEmail='';
const CLEAN=()=>({saved:[],follows:[],likes:[],goals:[],lesson:0,notes:[],activity:[],board:[],runs:{},daily:{},catUse:{},toolUse:{},recent:[]});
const isPro=()=>ME.sub?.plan==='pro';
const fmtDate=d=>d?new Date(d).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'';
const money=(cents,cur)=>new Intl.NumberFormat(undefined,{style:'currency',currency:cur.toUpperCase(),minimumFractionDigits:cents%100?2:0}).format(cents/100);
if(sb)sb.auth.onAuthStateChange((ev,session)=>{
  ME.token=session?.access_token||null;
  if(ev==='PASSWORD_RECOVERY'){gated=true;authMode='update';go('auth');renderAuth()}
  if(ev==='SIGNED_OUT'&&ME.user)location.replace(location.pathname);
});

// Shared workflows come from other people: keep only known fields, short plain strings, safe colours and known icons.
function cleanStep(s){
  if(typeof s==='string')return LIB[s]?s:null;
  if(!s||typeof s!=='object')return null;
  const str=(v,n)=>typeof v==='string'?v.slice(0,n):'',tn=str(s.tool,60);
  return{i:P[s.i]?s.i:'sparkle',t:str(s.t,80)||'Step',d:str(s.d,160),tool:/^[\w .+&'()\/-]{1,60}$/.test(tn)?tn:'Custom tool',
    c:/^(#[0-9a-f]{3,8}|hsl\(\d{1,3} \d{1,3}% \d{1,3}%\))$/i.test(s.c||'')?s.c:'#4fb3da',r:str(s.r,80)||'Step complete',prompt:str(s.prompt,4000),par:s.par===true};
}
const sanitizeSteps=a=>(Array.isArray(a)?a:[]).map(cleanStep).filter(Boolean).slice(0,30);

async function api(path,body){
  const r=await fetch('/api/'+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(ME.token?{authorization:'Bearer '+ME.token}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||`Request failed (${r.status})`);return j;
}

/* ---------- router gate: signed-out visitors only see the auth page ---------- */
const _goGate=go;
go=function(n,o){if(gated)n='auth';else if(n==='auth'&&ME.user)n='home';document.body.classList.toggle('gate',n==='auth');_goGate(n,o)};

/* ---------- state sync: localStorage is a cache, Supabase is the source of truth ---------- */
const localSave=S.save.bind(S);let pushT=0,dirty=false;
S.save=function(){localSave();if(!ME.user)return;dirty=true;clearTimeout(pushT);pushT=setTimeout(pushState,1200)};
async function pushState(){
  if(!dirty||!ME.user)return;dirty=false;
  const{error}=await sb.from('user_state').upsert({user_id:ME.user.id,data:S.d});
  if(error){dirty=true;console.warn('Sync failed:',error.message)}
}
// leaving the page: send pending changes with keepalive so they survive the unload
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden||!dirty||!ME.user||!ME.token)return;clearTimeout(pushT);dirty=false;
  fetch(`${CFG.supabaseUrl}/rest/v1/user_state?on_conflict=user_id`,{method:'POST',keepalive:true,
    headers:{apikey:CFG.supabaseKey,authorization:'Bearer '+ME.token,'content-type':'application/json',prefer:'resolution=merge-duplicates,return=minimal'},
    body:JSON.stringify({user_id:ME.user.id,data:S.d})}).catch(()=>{dirty=true});
});
function applyState(data){
  for(const k of Object.keys(S.d))delete S.d[k];
  Object.assign(S.d,CLEAN(),data);localSave();
  $('#savedCount').textContent=S.d.saved.length;
  $$('[data-save]').forEach(b=>b.classList.toggle('on',isSaved(b.dataset.save)));
}

/* ---------- workflows ---------- */
let MYWF=[];
const WF_COLS='id,name,description,input,steps,is_public,likes_count,updated_at';
async function loadMyWorkflows(){const{data,error}=await sb.from('workflows').select(WF_COLS).eq('user_id',ME.user.id).order('updated_at',{ascending:false});if(error)throw error;MYWF=data}
const storeLocal={get:store.get.bind(store),remove:store.remove.bind(store)};
store.get=()=>ME.user?MYWF.map(w=>({id:w.id,n:w.name,d:w.description,input:w.input,s:sanitizeSteps(w.steps),at:Date.parse(w.updated_at),pub:w.is_public})):storeLocal.get();
store.remove=async i=>{if(!ME.user)return storeLocal.remove(i);const w=MYWF[i];if(!w)return;const{error}=await sb.from('workflows').delete().eq('id',w.id);
  if(error)return toast('Couldn’t delete: '+esc(error.message),'x');MYWF.splice(i,1);if(wf.id===w.id)delete wf.id};
async function saveWorkflow(extra={}){
  const row={name:(wf.n||'Untitled workflow').slice(0,120),description:(wf.d||'').slice(0,500),input:(wf.input||'').slice(0,2000),steps:wf.s.map(cleanStep).filter(Boolean),...extra};
  const own=wf.id&&MYWF.some(w=>w.id===wf.id);
  const{data,error}=await(own?sb.from('workflows').update(row).eq('id',wf.id):sb.from('workflows').insert(row)).select(WF_COLS).single();
  if(error){if(/FREE_LIMIT/.test(error.message))openBilling('limit');else toast('Couldn’t save: '+esc(error.message),'x');return null}
  wf.id=data.id;MYWF=[data,...MYWF.filter(w=>w.id!==data.id)];return data;
}
const saveLocal=$('#save').onclick,shareLocal=shareWorkflow;
$('#save').onclick=async()=>{if(!ME.user)return saveLocal();const w=await saveWorkflow();if(w){toast(`Saved “${esc(w.name)}”`);log(`Saved workflow “${w.name}”`,'flow')}};
const wfLink=id=>`${location.origin}${location.pathname}?wf=${id}#builder`;
async function openSharedWorkflow(id){
  const{data,error}=await sb.from('workflows').select('id,name,description,input,steps,user_id').eq('id',id).maybeSingle();
  if(error||!data)return toast('That workflow isn’t available. It may be private or deleted.','x');
  wf={n:data.name,d:data.description,input:data.input||'',s:sanitizeSteps(data.steps)};if(data.user_id===ME.user.id)wf.id=data.id;
  renderFlow();go('builder',{tab:'builder'});toast(`Opened “${esc(data.name)}”`,'flow');
}

/* ---------- sharing: publish to the community ---------- */
function openShare(){
  const cur=wf.id&&MYWF.find(w=>w.id===wf.id);
  openModal(`<div class="eyebrow">Share to the community</div><h2 class="modal-h">Publish a <span class="grad">workflow</span></h2>
    <p class="muted-sm">Published workflows are visible to every signed-in Lunorb member, who can copy them into their own builder. Your notes and inputs stay private.</p>
    <div class="share-cur glass"><div class="res-t">${esc(wf.n)}<em>Open in the builder · ${wf.s.length} steps${cur?.is_public?' · public':''}</em></div>
      ${cur?.is_public?`<button class="btn sm" data-copywf="${cur.id}">${ic('link',13)} Copy link</button>`:`<button class="btn sm solid" id="pubCur">${ic('send',13)} ${cur?'Publish':'Save & publish'}</button>`}</div>
    <div class="res-h" style="padding-left:0;margin-top:18px">Your saved workflows</div>
    <div class="share-list">${MYWF.length?MYWF.map(w=>`<div class="lrow"><span style="color:#b49bff">${ic('flow',16)}</span><div class="res-t">${esc(w.name)}<em>${sanitizeSteps(w.steps).length} steps · ${w.is_public?`public · ${w.likes_count} like${w.likes_count===1?'':'s'}`:'private'}</em></div>
      ${w.is_public?`<button class="btn sm ghost" data-copywf="${w.id}">${ic('link',13)} Link</button><button class="btn sm ghost" data-pubwf="${w.id}" data-on="0">Unpublish</button>`:`<button class="btn sm" data-pubwf="${w.id}" data-on="1">Publish</button>`}</div>`).join(''):'<p class="muted-sm">Nothing saved yet.</p>'}</div>`);
  $('#modalBody').onclick=async e=>{
    const cp=e.target.closest('[data-copywf]');if(cp){copyText(wfLink(cp.dataset.copywf));toast('Link copied','link');return}
    const pb=e.target.closest('[data-pubwf]');if(pb){const on=pb.dataset.on==='1';pb.disabled=true;const{error}=await sb.from('workflows').update({is_public:on}).eq('id',pb.dataset.pubwf);
      if(error)return toast('Couldn’t update: '+esc(error.message),'x');await loadMyWorkflows();comAt=0;toast(on?'Published to the community':'Unpublished',on?'send':'check');openShare();return}
    if(e.target.closest('#pubCur')){const w=await saveWorkflow({is_public:true});if(!w)return;comAt=0;copyText(wfLink(w.id));toast('Published — link copied','send');log(`Published “${w.name}”`,'send');openShare()}
  };
}
shareWorkflow=async()=>{if(!BACKEND)return shareLocal();if(!ME.user)return go('auth');openShare()};
$('#share').onclick=()=>shareWorkflow();

/* ---------- community data ---------- */
let comAt=0;
async function loadCommunity(){
  if(Date.now()-comAt<60000)return;comAt=Date.now();
  const[w,c,l,f]=await Promise.all([
    sb.from('workflows').select('id,name,description,steps,likes_count,user_id,author:profiles(display_name,handle)').eq('is_public',true).order('likes_count',{ascending:false}).order('published_at',{ascending:false}).limit(12),
    sb.from('creators').select('*').order('likes',{ascending:false}).order('workflows',{ascending:false}).limit(5),
    sb.from('workflow_likes').select('workflow_id').eq('user_id',ME.user.id),
    sb.from('follows').select('followee_id').eq('follower_id',ME.user.id)]);
  const err=w.error||c.error||l.error||f.error;if(err){comAt=0;return console.warn('Community load failed:',err.message)}
  const liked=new Set(l.data.map(x=>x.workflow_id));
  COMMUNITY.workflows=w.data.map(x=>({id:x.id,name:x.name,description:x.description,steps:sanitizeSteps(x.steps),likes_count:x.likes_count,liked:liked.has(x.id),
    author:x.author?.handle?'@'+x.author.handle:(x.author?.display_name||'Lunorb member')})).filter(x=>x.steps.length);
  COMMUNITY.creators=c.data;COMMUNITY.following=new Set(f.data.map(x=>x.followee_id));COMMUNITY.ready=true;
  if(cur==='community'){renderCreators();renderPopWf()}
}
const _enterCommunity=ENTER.community;ENTER.community=()=>{_enterCommunity();if(ME.user)loadCommunity()};
followCreator=async(id,on)=>{
  const{error}=on?await sb.from('follows').insert({followee_id:id}):await sb.from('follows').delete().eq('follower_id',ME.user.id).eq('followee_id',id);
  if(error)return toast('Couldn’t update: '+esc(error.message),'x');
  on?COMMUNITY.following.add(id):COMMUNITY.following.delete(id);const c=COMMUNITY.creators.find(x=>x.id===id);if(c)c.followers+=on?1:-1;renderCreators();
};
likeShared=async id=>{
  const w=COMMUNITY.workflows.find(x=>x.id===id);if(!w)return;const on=!w.liked;
  const{error}=on?await sb.from('workflow_likes').insert({workflow_id:id}):await sb.from('workflow_likes').delete().eq('user_id',ME.user.id).eq('workflow_id',id);
  if(error)return toast('Couldn’t update: '+esc(error.message),'x');w.liked=on;w.likes_count+=on?1:-1;renderPopWf();
};

/* ---------- billing ---------- */
function openBilling(reason){
  if(!ME.user)return go('auth');
  const s=ME.sub||{},pro=isPro();
  openModal(`<div class="eyebrow">Plan &amp; billing</div><h2 class="modal-h">${reason==='limit'?'You’ve saved <span class="grad">3 workflows</span>':'Your <span class="grad">plan</span>'}</h2>
    <p class="muted-sm">${reason==='limit'?'Free accounts can save up to 3 workflows. Upgrade to Pro to save as many as you like, or delete one in My Workflows.':'Everything in Lunorb works on Free. Pro removes the saved-workflow limit.'}</p>
    <div class="plans">
      <div class="plan glass ${pro?'':'cur'}"><h4>Free</h4><div class="price"><b>${money(0,'usd')}</b></div>
        <ul><li>${ic('check',14)} All 750 tools and 20 guided playbooks</li><li>${ic('check',14)} Save up to 3 workflows</li><li>${ic('check',14)} Publish to the community</li><li>${ic('check',14)} Sync across your devices</li></ul>
        ${pro?'':'<span class="pill">Current plan</span>'}</div>
      <div class="plan glass pro ${pro?'cur':''}"><h4>Pro</h4><div class="price" id="proPrice"><span class="spin"></span></div>
        <ul><li>${ic('check',14)} Everything in Free</li><li>${ic('check',14)} Unlimited saved workflows</li><li>${ic('check',14)} Change or cancel anytime</li></ul>
        ${pro?`<span class="pill">Current plan</span><p class="muted-sm">${s.cancel_at_period_end?'Ends':'Renews'} ${fmtDate(s.current_period_end)}${s.status==='past_due'?' · payment past due':''}</p><button class="btn sm" id="bilPortal">${ic('card',14)} Manage billing</button>`
          :`<button class="btn solid" id="bilUp">Upgrade to Pro ${ic('arrow',15)}</button>`}</div>
    </div>
    <p class="muted-sm tiny" id="bilNote">Payments are processed by Stripe. Lunorb never sees your card details.</p>`);
  api('pricing').then(p=>{const el=$('#proPrice');if(!el)return;el.innerHTML=p.configured?`<b>${money(p.amount,p.currency)}</b><span>/ ${p.interval}</span>`:'<span class="muted-sm">Price shown at checkout</span>';
    if(p.configured&&!p.livemode)$('#bilNote').insertAdjacentHTML('beforeend',' <b>Test mode:</b> use card 4242 4242 4242 4242 with any future date and CVC.')}).catch(()=>{const el=$('#proPrice');if(el)el.innerHTML='<span class="muted-sm">Price shown at checkout</span>'});
  const go2=async(btn,path)=>{btn.disabled=true;btn.innerHTML='<span class="spin"></span> Opening Stripe…';try{const{url}=await api(path,{});location.href=url}catch(e){btn.disabled=false;btn.textContent='Try again';toast(esc(e.message),'x')}};
  $('#bilUp')?.addEventListener('click',e=>go2(e.currentTarget,'checkout'));
  $('#bilPortal')?.addEventListener('click',e=>go2(e.currentTarget,'portal'));
}
async function refreshSub(){const{data}=await sb.from('subscriptions').select('plan,status,current_period_end,cancel_at_period_end').eq('user_id',ME.user.id).maybeSingle();ME.sub=data||{plan:'free'};renderAccount()}
// Stripe redirects back before its webhook may have landed, so poll briefly for the upgrade
async function waitForPro(){for(let i=0;i<12;i++){await refreshSub();if(isPro()){toast('Welcome to Lunorb Pro','sparkle');notify('You’re on Lunorb Pro. Saved workflows are now unlimited.','sparkle','#a78bfa');return}await sleep(1500)}
  toast('Payment received. Your plan will update in a moment.','clock')}

/* ---------- account ---------- */
function renderAccount(){
  const name=ME.profile?.display_name||ME.user?.email?.split('@')[0]||'';
  $('#acctName').innerHTML=ME.user?`Signed in as <b>${esc(name)}</b> <span class="pill ${isPro()?'pro':''}">${isPro()?'Pro':'Free'}</span>`:BACKEND?'Not signed in':'Local mode · saved in this browser';
  $('#avatarBtn').title=ME.user?.email||'Account';
  $('#acctRows').innerHTML=ME.user?`<div class="res" data-acct="billing">${ic('card',16)}Plan &amp; billing<small>${isPro()?'Pro':'Free'}</small></div><div class="res" data-acct="account">${ic('user',16)}Account settings</div><div class="res" data-acct="signout">${ic('logout',16)}Sign out</div>`
    :BACKEND?`<div class="res" data-acct="signin">${ic('user',16)}Sign in</div>`:'';
}
function openAccount(){
  const p=ME.profile||{};
  openModal(`<div class="eyebrow">Account settings</div><h2 class="modal-h">Your <span class="grad">profile</span></h2>
    <form id="profForm" class="acct-form"><label class="fld"><span>Display name</span><input name="display_name" maxlength="60" value="${esc(p.display_name||'')}" required></label>
      <label class="fld"><span>Community handle <em>3–24 characters: a–z, 0–9, _ and .</em></span><input name="handle" maxlength="24" pattern="[a-z0-9_.]{3,24}" value="${esc(p.handle||'')}" placeholder="e.g. jamie.makes"></label>
      <label class="fld"><span>Email</span><input value="${esc(ME.user.email)}" disabled></label><button class="btn sm solid" type="submit">Save profile</button></form>
    <form id="pwForm" class="acct-form"><div class="res-h" style="padding-left:0">Password</div><label class="fld"><span>New password <em>at least 8 characters</em></span><input type="password" name="password" minlength="8" autocomplete="new-password" required></label><button class="btn sm" type="submit">Update password</button></form>
    <form id="delForm" class="acct-form danger"><div class="res-h" style="padding-left:0">Delete account</div><p class="muted-sm">This permanently deletes your workflows, notes and progress, and cancels any subscription. Type <b>DELETE</b> to confirm.</p>
      <label class="fld"><input name="confirm" autocomplete="off" placeholder="DELETE"></label><button class="btn sm ghost" type="submit">${ic('trash',13)} Delete my account</button></form>`);
  $('#modalBody').onsubmit=async e=>{
    e.preventDefault();const f=e.target,fd=Object.fromEntries(new FormData(f)),btn=f.querySelector('button[type=submit]');btn.disabled=true;
    try{
      if(f.id==='profForm'){const row={display_name:fd.display_name.trim().slice(0,60),handle:fd.handle.trim().toLowerCase()||null};
        const{error}=await sb.from('profiles').update(row).eq('id',ME.user.id);if(error)throw new Error(/duplicate|unique/i.test(error.message)?'That handle is already taken.':error.message);
        ME.profile={...ME.profile,...row};renderAccount();toast('Profile saved')}
      if(f.id==='pwForm'){const{error}=await sb.auth.updateUser({password:fd.password});if(error)throw error;f.reset();toast('Password updated','lock')}
      if(f.id==='delForm'){if(fd.confirm!=='DELETE')throw new Error('Type DELETE to confirm.');await api('account/delete',{});localStorage.removeItem('lunorb.v2');localStorage.removeItem('lunorb.wf');await sb.auth.signOut({scope:'local'});location.replace(location.pathname)}
    }catch(err){toast(esc(friendly(err)),'x')}finally{btn.disabled=false}
  };
}
async function signOut(){clearTimeout(pushT);await pushState();localStorage.removeItem('lunorb.v2');localStorage.removeItem('lunorb.wf');ME.user=null;await sb.auth.signOut();location.replace(location.pathname)}
$('#avatarMenu').addEventListener('click',e=>{const a=e.target.closest('[data-acct]');if(!a)return;$('#avatarMenu').classList.remove('on');
  ({billing:()=>openBilling(),account:openAccount,signout:signOut,signin:()=>go('auth')})[a.dataset.acct]()});

/* ---------- auth page ---------- */
const friendly=e=>{const m=e?.message||String(e);
  return/failed to fetch|networkerror|load failed|fetch failed/i.test(m)?'Can’t reach the Lunorb sign-in server right now. Check your connection, or try again in a few minutes.'
    :/invalid login credentials/i.test(m)?'That email and password don’t match.':/email not confirmed/i.test(m)?'Confirm your email first. Check your inbox for the link.'
    :/rate limit|too many/i.test(m)?'Too many attempts. Wait a minute and try again.':/already registered/i.test(m)?'An account with that email already exists. Try signing in.':m};
const AUTH={
  signin:{h:'Welcome back',p:'Sign in to continue your journey.',btn:'Sign In',f:['email','password'],extra:'<label class="remember"><input type="checkbox" id="remember"><i></i>Remember me</label><button type="button" class="link" data-amode="reset">Forgot password?</button>',social:1,foot:'New to Lunorb? <button type="button" class="link" data-amode="signup">Create an account</button>'},
  signup:{h:'Create your account',p:'Free to start. No card needed.',btn:'Create account',social:1,f:['name','email','newpw'],foot:'Already have an account? <button type="button" class="link" data-amode="signin">Sign in</button>'},
  reset:{h:'Reset your password',p:'We’ll email you a link to choose a new one.',btn:'Send reset link',f:['email'],foot:'<button type="button" class="link" data-amode="signin">Back to sign in</button>'},
  update:{h:'Choose a new password',p:'Use at least 8 characters.',btn:'Save password',f:['newpw']}};
// icon fields: the label text stays for screen readers; the eye toggles password visibility (handled below)
const IN=(icon,label,input,eye)=>`<label class="fld ifld"><span class="sr">${label}</span>${ic(icon,17)}${input}${eye?`<button type="button" class="eye" data-eye aria-label="Show password">${ic('eye',17)}</button>`:''}</label>`;
// brand marks for the social buttons (official shapes, as providers ask)
const SOCIAL=[['google','Google','<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>'],
  ['github','GitHub','<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z"/></svg>'],
  ['apple','Apple','<svg width="19" height="19" viewBox="0 0 24 24" fill="#fff"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.1.1 2.3-.6 3-1.5z"/></svg>']];
const FIELD={name:IN('user','Your name','<input name="name" autocomplete="name" maxlength="60" placeholder="Your name" required>'),
  email:IN('mail','Email','<input type="email" name="email" autocomplete="email" placeholder="Enter your email address" required>'),
  password:IN('lock','Password','<input type="password" name="password" autocomplete="current-password" placeholder="Enter your password" required>',1),
  newpw:IN('lock','Password (at least 8 characters)','<input type="password" name="password" autocomplete="new-password" minlength="8" placeholder="Choose a password (8+ characters)" required>',1)};
function renderAuth(){
  const c=$('#authCard');
  if(!BACKEND){c.innerHTML=`<div class="eyebrow">Accounts</div><h2>Almost ready</h2><p class="muted-sm">Sign-in switches on once the Supabase project URL is added to <code>js/config.js</code>. Until then Lunorb runs in local mode and saves to this browser.</p><button class="btn solid auth-go" data-go="home">Continue in local mode ${ic('arrow',15)}</button>`;return}
  if(authMode==='check'){c.innerHTML=`<div class="auth-ic">${ic('mail',26)}</div><h2>Check your email</h2><p class="muted-sm">We sent a link to <b>${esc(authEmail)}</b>. Open it to continue. It can take a minute to arrive, so check spam too.</p><p class="auth-foot"><button type="button" class="link" data-amode="signin">Back to sign in</button></p>`;return}
  if(authMode==='error'){c.innerHTML=`<h2>We couldn’t load your account</h2><div class="auth-msg">${esc(authNotice)}</div><div class="auth-row"><button class="btn solid" id="authRetry">Try again</button><button class="btn ghost" id="authOut">Sign out</button></div>`;return}
  const f=AUTH[authMode];
  const tabs=authMode==='signin'||authMode==='signup'?`<div class="auth-tabs" role="tablist"><button type="button" role="tab" data-amode="signin" class="${authMode==='signin'?'on':''}" aria-selected="${authMode==='signin'}">Sign in</button><button type="button" role="tab" data-amode="signup" class="${authMode==='signup'?'on':''}" aria-selected="${authMode==='signup'}">Create account</button></div>`:'';
  c.innerHTML=`<h2>${f.h}</h2><p class="muted-sm">${f.p}</p>${tabs}${authNotice?`<div class="auth-msg" role="alert">${esc(authNotice)}</div>`:''}
    <form id="authForm">${f.f.map(k=>FIELD[k]).join('')}${f.extra?`<div class="auth-links">${f.extra}</div>`:''}<button class="btn solid auth-go" type="submit">${f.btn} ${ic('arrow',15)}</button></form>
    ${f.social?`<div class="auth-or"><span>or continue with</span></div><div class="auth-social">${SOCIAL.map(([p,n,svg])=>`<button type="button" data-oauth="${p}" aria-label="Continue with ${n}" title="Continue with ${n}">${svg}</button>`).join('')}</div>`:''}
    ${f.foot?`<p class="auth-foot">${f.foot}</p>`:''}`;
  const rm=c.querySelector('#remember');if(rm){rm.checked=REMEMBER();rm.onchange=()=>{try{localStorage.setItem('lunorb.remember',rm.checked?'1':'0')}catch{}}}
  if(authMode==='signin'&&!authNotice)authInfo().then(i=>{if(!i.up&&authMode==='signin'&&!c.querySelector('.auth-msg')){c.querySelector('form')?.insertAdjacentHTML('beforebegin','<div class="auth-msg" role="status">Sign-in is offline: Lunorb’s account server isn’t responding. Please try again a little later.</div>')}});
  setTimeout(()=>c.querySelector('input')?.focus({preventScroll:true}),50); // keep the hero in view; the form is one scroll away on phones
}
$('#authCard').addEventListener('click',async e=>{
  const eye=e.target.closest('[data-eye]');if(eye){const i=eye.parentElement.querySelector('input'),show=i.type==='password';i.type=show?'text':'password';eye.setAttribute('aria-label',show?'Hide password':'Show password');eye.classList.toggle('on',show);return}
  const m=e.target.closest('[data-amode]');if(m){authMode=m.dataset.amode;authNotice='';renderAuth();return}
  const o=e.target.closest('[data-oauth]');if(o){const p=o.dataset.oauth,name=o.getAttribute('aria-label').replace('Continue with ','');o.disabled=true;
    const i=await authInfo();
    if(!i.up){authNotice='Can’t reach the Lunorb sign-in server right now. Please try again in a few minutes.';renderAuth();return}
    if(!i.ext[p]){authNotice=`${name} sign-in isn’t switched on yet. Use your email and password for now.`;renderAuth();return}
    const{error}=await sb.auth.signInWithOAuth({provider:p,options:{redirectTo:location.origin+location.pathname}});
    if(error){authNotice=friendly(error);renderAuth()}return}
  if(e.target.closest('#authRetry'))location.reload();
  if(e.target.closest('#authOut')){await sb.auth.signOut({scope:'local'});location.replace(location.pathname)}
});
$('#authCard').addEventListener('submit',async e=>{
  e.preventDefault();const fd=Object.fromEntries(new FormData(e.target)),btn=e.target.querySelector('.auth-go'),redirect=location.origin+location.pathname;
  btn.disabled=true;btn.innerHTML='<span class="spin"></span>';
  try{
    if(authMode==='signin'){const{data,error}=await sb.auth.signInWithPassword({email:fd.email.trim(),password:fd.password});if(error)throw error;await signedIn(data.user)}
    else if(authMode==='signup'){const{data,error}=await sb.auth.signUp({email:fd.email.trim(),password:fd.password,options:{data:{display_name:fd.name.trim()},emailRedirectTo:redirect}});if(error)throw error;
      if(data.session)await signedIn(data.user);else{authEmail=fd.email.trim();authMode='check';authNotice='';renderAuth()}}
    else if(authMode==='reset'){const{error}=await sb.auth.resetPasswordForEmail(fd.email.trim(),{redirectTo:redirect});if(error)throw error;authEmail=fd.email.trim();authMode='check';authNotice='';renderAuth()}
    else if(authMode==='update'){const{data,error}=await sb.auth.updateUser({password:fd.password});if(error)throw error;toast('Password saved','lock');await signedIn(data.user)}
  }catch(err){authNotice=friendly(err);renderAuth()}
});

/* ---------- startup ---------- */
async function enterAs(user){
  ME.user=user;COMMUNITY.me=user.id;
  const[st,prof,sub]=await Promise.all([
    sb.from('user_state').select('data').eq('user_id',user.id).maybeSingle(),
    sb.from('profiles').select('display_name,handle').eq('id',user.id).maybeSingle(),
    sb.from('subscriptions').select('plan,status,current_period_end,cancel_at_period_end').eq('user_id',user.id).maybeSingle(),
    loadMyWorkflows()]);
  const err=st.error||prof.error||sub.error;
  if(err)throw new Error(/does not exist|schema cache/i.test(err.message)?'The database isn’t set up yet. Run supabase/schema.sql in the Supabase SQL editor.':err.message);
  const data=st.data?.data;applyState(data&&Object.keys(data).length?data:CLEAN());
  ME.profile=prof.data||{display_name:user.email.split('@')[0]};ME.sub=sub.data||{plan:'free'};renderAccount();
}
async function signedIn(user){
  try{await enterAs(user)}catch(e){authMode='error';authNotice=e.message;renderAuth();return}
  gated=false;go('home');const w=sessionStorage.getItem('lunorb.pendingWf');if(w){sessionStorage.removeItem('lunorb.pendingWf');openSharedWorkflow(w)}
}
// resolves true when the app can render (signed in, or running without a backend)
async function cloudInit(){
  renderAccount();
  if(!BACKEND)return true;
  const P=new URLSearchParams(location.search);if(P.get('wf'))sessionStorage.setItem('lunorb.pendingWf',P.get('wf'));
  const hp=new URLSearchParams(URL_HASH.slice(1));
  const{data:{session}}=await sb.auth.getSession();ME.token=session?.access_token||null;
  if(/access_token|error_description|type=/.test(location.hash))history.replaceState(null,'',location.pathname+location.search+'#home');
  if(hp.get('error_description'))authNotice=hp.get('error_description').replace(/\+/g,' ');
  if(!session||RECOVERY){gated=true;return false}
  try{await enterAs(session.user)}catch(e){gated=true;authMode='error';authNotice=e.message;return false}
  return true;
}
function afterBoot(P){
  if(!ME.user)return;
  const c=P.get('checkout');
  if(c){history.replaceState(null,'',location.pathname+location.hash);c==='success'?waitForPro():toast('Checkout cancelled. You’re still on Free.','x')}
  const w=sessionStorage.getItem('lunorb.pendingWf');if(w){sessionStorage.removeItem('lunorb.pendingWf');openSharedWorkflow(w)}
}
