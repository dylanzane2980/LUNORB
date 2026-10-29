/* ---------- accounts, sync, community and billing (Supabase + Stripe through /api functions) ---------- */
const CFG=window.LUNORB_CONFIG||{};
const BACKEND=!!(CFG.supabaseUrl&&CFG.supabaseKey&&window.supabase);
const URL_HASH=location.hash,RECOVERY=/type=recovery/.test(URL_HASH);
const sb=BACKEND?supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
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
    c:/^(#[0-9a-f]{3,8}|hsl\(\d{1,3} \d{1,3}% \d{1,3}%\))$/i.test(s.c||'')?s.c:'#4c8dff',r:str(s.r,80)||'Step complete',prompt:str(s.prompt,4000),par:s.par===true};
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
  return/invalid login credentials/i.test(m)?'That email and password don’t match.':/email not confirmed/i.test(m)?'Confirm your email first. Check your inbox for the link.'
    :/rate limit|too many/i.test(m)?'Too many attempts. Wait a minute and try again.':/already registered/i.test(m)?'An account with that email already exists. Try signing in.':m};
const AUTH={
  signin:{h:'Welcome back',p:'Sign in to pick up where you left off.',btn:'Sign in',f:['email','password'],extra:'<button type="button" class="link" data-amode="reset">Forgot password?</button>',foot:'New to Lunorb? <button type="button" class="link" data-amode="signup">Create an account</button>'},
  signup:{h:'Create your account',p:'Free to start. No card needed.',btn:'Create account',f:['name','email','newpw'],foot:'Already have an account? <button type="button" class="link" data-amode="signin">Sign in</button>'},
  reset:{h:'Reset your password',p:'We’ll email you a link to choose a new one.',btn:'Send reset link',f:['email'],foot:'<button type="button" class="link" data-amode="signin">Back to sign in</button>'},
  update:{h:'Choose a new password',p:'Use at least 8 characters.',btn:'Save password',f:['newpw']}};
const FIELD={name:'<label class="fld"><span>Your name</span><input name="name" autocomplete="name" maxlength="60" required></label>',
  email:'<label class="fld"><span>Email</span><input type="email" name="email" autocomplete="email" required></label>',
  password:'<label class="fld"><span>Password</span><input type="password" name="password" autocomplete="current-password" required></label>',
  newpw:'<label class="fld"><span>Password <em>at least 8 characters</em></span><input type="password" name="password" autocomplete="new-password" minlength="8" required></label>'};
function renderAuth(){
  const c=$('#authCard');
  if(!BACKEND){c.innerHTML=`<div class="eyebrow">Accounts</div><h2>Almost ready</h2><p class="muted-sm">Sign-in switches on once the Supabase project URL is added to <code>js/config.js</code>. Until then Lunorb runs in local mode and saves to this browser.</p><button class="btn solid auth-go" data-go="home">Continue in local mode ${ic('arrow',15)}</button>`;return}
  if(authMode==='check'){c.innerHTML=`<div class="auth-ic">${ic('mail',26)}</div><h2>Check your email</h2><p class="muted-sm">We sent a link to <b>${esc(authEmail)}</b>. Open it to continue. It can take a minute to arrive, so check spam too.</p><p class="auth-foot"><button type="button" class="link" data-amode="signin">Back to sign in</button></p>`;return}
  if(authMode==='error'){c.innerHTML=`<h2>We couldn’t load your account</h2><div class="auth-msg">${esc(authNotice)}</div><div class="auth-row"><button class="btn solid" id="authRetry">Try again</button><button class="btn ghost" id="authOut">Sign out</button></div>`;return}
  const f=AUTH[authMode];
  c.innerHTML=`<h2>${f.h}</h2><p class="muted-sm">${f.p}</p>${authNotice?`<div class="auth-msg" role="alert">${esc(authNotice)}</div>`:''}
    <form id="authForm">${f.f.map(k=>FIELD[k]).join('')}${f.extra?`<div class="auth-links">${f.extra}</div>`:''}<button class="btn solid auth-go" type="submit">${f.btn} ${ic('arrow',15)}</button></form>
    ${f.foot?`<p class="auth-foot">${f.foot}</p>`:''}`;
  setTimeout(()=>c.querySelector('input')?.focus(),50);
}
$('#authCard').addEventListener('click',async e=>{
  const m=e.target.closest('[data-amode]');if(m){authMode=m.dataset.amode;authNotice='';renderAuth();return}
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
