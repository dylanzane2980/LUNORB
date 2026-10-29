/* ---------- data: 750 tools ---------- */
const D=window.LUNORB_DATA;
const SHORT=['Assistants','Research','Writing','Coding','App Builders','Image','Photo','Video Gen','Video Edit','Voice','Music & Audio','Presentations','Data & BI','Productivity','Meetings','Automation','Marketing','Sales & Support','Education','Legal & Finance','Search & Web','Docs & OCR','Spreadsheets','Design','3D & CAD','E-commerce','Security & IT','Healthcare','Dev Infra','Detection'];
const CAT_ICON=['chat','book','file','code','layout','image','sparkles','playsq','playsq','mic','music','layers','chart','check','users','zap','trend','users','cap','scale','globe','file','grid','pencil','cube','cart','shield','heart','server','eye'];
const CATS=D.categories.map((name,i)=>({i,name,short:SHORT[i],icon:CAT_ICON[i],color:`hsl(${(i*47+210)%360} 80% 66%)`,count:0}));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const hashOf=s=>{let h=7;for(const ch of s)h=(h*131+ch.charCodeAt(0))>>>0;return h};
const ALL=D.tools.map(([n,ci,sub,desc,best,free,url,aud,api],id)=>{
  const brand=TOOLS.find(t=>t.n===n)||monoFor(n);
  CATS[ci].count++;
  return{id,n,ci,sub,desc,best:best[0].toUpperCase()+best.slice(1),free:!!free,url,aud:aud.split('|'),api:!!api,c:SHORT[ci],m:brand.m,g:brand.g,rank:id%25};
});
const ALIAS={'Figma':'Figma AI'};
const byName=n=>{n=ALIAS[n]||n;return ALL.find(t=>t.n.toLowerCase()===n.toLowerCase())};
const FEATURED=['Claude','ChatGPT','Midjourney','Runway','Perplexity','Cursor','ElevenLabs','Notion AI','Gamma','Suno','Lovable','Figma AI'].map(byName).filter(Boolean);
function searchTools(v,n=8,pool=ALL){
  const toks=v.toLowerCase().split(/[^a-z0-9.+#]+/).filter(w=>w.length>1&&!/^(the|and|for|with|to|of|my|a|an|in|on|i|want|need|how|best|tool|tools|ai|plan|make|help|get|do|need|some|good|new|our|me|please|can|could)$/.test(w));
  const q=v.toLowerCase().trim();if(!q)return[];
  return pool.map(t=>{
    const nm=t.n.toLowerCase(),cat=CATS[t.ci].name.toLowerCase(),txt=(t.sub+' '+t.best+' '+t.desc).toLowerCase();
    let s=nm===q?40:nm.startsWith(q)?20:nm.includes(q)?12:0;
    for(const w of toks){if(nm.includes(w))s+=6;if(cat.includes(w)||t.c.toLowerCase().includes(w))s+=4;if(txt.includes(w))s+=2}
    return[s+(t.rank<15?.5:0),t];
  }).filter(x=>x[0]>=2).sort((a,b)=>b[0]-a[0]).slice(0,n).map(x=>x[1]);
}

/* ---------- persisted state ---------- */
const DAY=864e5;
const S=(()=>{const KEY='lunorb.v2';let d=null;try{d=JSON.parse(localStorage.getItem(KEY))}catch{}
  d=Object.assign({saved:['Claude','Midjourney','Notion AI','Runway','Perplexity'],follows:['@nomadworks'],likes:[],goals:[0,1],lesson:3,
    notes:[{id:1,t:'AI trends to watch',b:'Agents that browse, small local models, video with native audio.',at:Date.now()-DAY*0.2},{id:2,t:'Prompt ideas for brand visuals',b:'Moody aurora palette · glass UI · lone figure on a ridge.',at:Date.now()-DAY*2},{id:3,t:'Tools for solo creators',b:'Claude for writing, Gamma for decks, Descript for edits.',at:Date.now()-DAY*4}],
    activity:[{x:'Saved Claude',i:'heart',at:Date.now()-DAY/12},{x:'Added a note to AI Content Strategy',i:'file',at:Date.now()-DAY/5},{x:'Bookmarked Midjourney',i:'bookmark',at:Date.now()-DAY},{x:'Created project Brand Redesign',i:'folder',at:Date.now()-DAY*2}],
    board:null},d||{});
  return{d,save(){try{localStorage.setItem(KEY,JSON.stringify(d))}catch{}}}})();
const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
// per-day counters feed Insights and the Learn streak: u = tools opened, g = guided steps completed, m = estimated minutes saved
function dayEntry(){const D=S.d.daily=S.d.daily||{},k=dayKey();if(!D[k]){D[k]={u:0,g:0,m:0};const ks=Object.keys(D).sort();while(ks.length>120)delete D[ks.shift()]}return D[k]}
function track(kind,ci,min=0){const e=dayEntry();e[kind]++;e.m+=min;if(ci!=null){const C=S.d.catUse=S.d.catUse||{};C[ci]=(C[ci]||0)+1}S.save()}
function log(x,i='check'){dayEntry();S.d.activity.unshift({x,i,at:Date.now()});S.d.activity.length=Math.min(S.d.activity.length,24);S.save()}
function ago(ts){const m=Math.round((Date.now()-ts)/6e4);return m<1?'Just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' hours ago':Math.round(m/1440)+' days ago'}
const isSaved=n=>S.d.saved.includes(n);
function toggleSave(n){
  const on=!isSaved(n);S.d.saved=on?[n,...S.d.saved]:S.d.saved.filter(x=>x!==n);S.save();
  if(on)log('Saved '+n,'heart');
  $$('[data-save]').forEach(b=>{if(b.dataset.save===n)b.classList.toggle('on',on)});
  $('#savedCount').textContent=S.d.saved.length;
  toast(on?`Saved ${esc(n)} to your workspace`:`Removed ${esc(n)}`,'heart');
  if(cur==='workspace')renderWorkspace();
}

/* ---------- shared rendering ---------- */
const monoHTML=(t,s=40)=>logoHTML(t,s);
const heart=n=>`<button class="heart ${isSaved(n)?'on':''}" data-save="${esc(n)}" aria-label="Save ${esc(n)}">${ic('heart',16)}</button>`;
function cardHTML(t,i=0){const c=CATS[t.ci];return`<div class="glass glow tcard" data-open="${t.id}" style="--d:${(i%12)*.35}">
  <div class="tc-top">${monoHTML(t)}${heart(t.n)}</div>
  <h5>${esc(t.n)}</h5><div class="tc-cat"><span style="color:${c.color}">${ic(c.icon,12)}</span>${esc(t.sub||c.short)}</div>
  <p>${esc(t.desc)}</p>
  <div class="tc-f">${t.free?'<span class="pill">Free</span>':''}${t.api?'<span class="pill">API</span>':''}<span class="go-sm">${ic('arrow',14)}</span></div></div>`}
const mediaHTML=(name,h,alt='')=>`<img class="art photo" src="img/media/${name}.webp" alt="${esc(alt)}" loading="lazy" decoding="async" style="height:${h}px">`;
function artHTML(hue,seed=1,h=120){
  const R=rng(seed);let d='M0 120';for(let x=0;x<=300;x+=15)d+=` L${x} ${70+R()*30-Math.sin(x/40+seed)*10}`;d+=' L300 120Z';
  let d2='M0 120';for(let x=0;x<=300;x+=10)d2+=` L${x} ${92+R()*16}`;d2+=' L300 120Z';
  return`<svg class="art" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice" style="height:${h}px"><defs>
  <linearGradient id="a${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 14%)"/><stop offset="1" stop-color="#04081a"/></linearGradient>
  <radialGradient id="b${seed}" cx=".6" cy=".35" r=".55"><stop offset="0" stop-color="hsl(${(hue+120)%360} 90% 60% / .75)"/><stop offset="1" stop-color="hsl(${hue} 90% 60% / 0)"/></radialGradient>
  <filter id="f${seed}"><feGaussianBlur stdDeviation="6"/></filter></defs>
  <rect width="300" height="120" fill="url(#a${seed})"/><ellipse cx="${120+R()*80}" cy="40" rx="${90+R()*40}" ry="22" fill="url(#b${seed})" filter="url(#f${seed})" transform="rotate(${-12+R()*24} 150 40)"/>
  ${[...Array(18)].map(()=>`<circle cx="${R()*300}" cy="${R()*60}" r="${R()*.9+.2}" fill="#dfe8ff" opacity="${.3+R()*.6}"/>`).join('')}
  <path d="${d}" fill="hsl(${hue} 40% 22%)"/><path d="${d2}" fill="#030714"/></svg>`;
}

/* ---------- drawer: tool detail ---------- */
function openTool(key){
  const t=typeof key==='number'?ALL[key]:byName(key);
  if(!t)return toast(`${esc(key)} isn’t in the directory yet`,'x');
  S.d.recent=[t.n,...(S.d.recent||[]).filter(x=>x!==t.n)].slice(0,10);track('u',t.ci);
  const c=CATS[t.ci],sim=ALL.filter(x=>x.ci===t.ci&&x.id!==t.id).sort((a,b)=>a.rank-b.rank).slice(0,4);
  $('#drawer').innerHTML=`
    <div class="dr-head">${artHTML((t.ci*47+210)%360,t.id+11,150)}<button class="dr-x" data-close aria-label="Close">${ic('x',18)}</button>
      <div class="dr-id">${monoHTML(t,58)}<div><h2>${esc(t.n)}</h2><button class="tc-cat link" data-cat="${t.ci}"><span style="color:${c.color}">${ic(c.icon,13)}</span>${esc(c.name)}</button></div></div></div>
    <div class="dr-body">
      <div class="rate big">${t.free?'<span class="pill">Free / Open-source</span>':''}${t.api?'<span class="pill">API</span>':''}</div>
      <p class="dr-desc">${esc(t.desc)}</p>
      <div class="best"><div class="eyebrow">Best at</div><p>${esc(t.best)}</p></div>
      <dl class="facts"><dt>Category</dt><dd>${esc(t.sub||c.short)}</dd><dt>Audience</dt><dd>${t.aud.map(a=>`<span class="pill">${esc(a)}</span>`).join(' ')}</dd><dt>Pricing</dt><dd>${t.free?'Free / Open-source':'Check the website'}</dd><dt>Website</dt><dd><a href="https://${esc(t.url)}" target="_blank" rel="noopener">${esc(t.url.split('/')[0])}</a></dd></dl>
      <div class="dr-acts">
        <a class="btn solid" href="https://${esc(t.url)}" target="_blank" rel="noopener">Visit site ${ic('ext',15)}</a>
        <button class="btn" data-addstep="${t.id}">${ic('flow',15)} Add to workflow</button>
        <button class="btn ghost heart-btn ${isSaved(t.n)?'on':''}" data-save="${esc(t.n)}">${ic('heart',15)} <span>Save</span></button>
      </div>
      <div class="sec-h" style="margin:30px 0 12px"><h3 style="font-size:16px">Similar in ${esc(c.short)}</h3><button class="link" data-cat="${t.ci}">See all ${c.count} ${ic('arrow',13)}</button></div>
      <div class="sim">${sim.map(x=>`<button class="res" data-open="${x.id}">${monoHTML(x,30)}<div class="res-t">${esc(x.n)}<em>${esc(x.best)}</em></div>${ic('chev',14)}</button>`).join('')}</div>
    </div>`;
  $('#drawer').classList.add('on');$('#scrim').classList.add('on');$('#drawer').setAttribute('aria-hidden','false');$('#drawer').scrollTop=0;
}
function addToolStep(t){
  const c=CATS[t.ci];
  wf.s.push({i:c.icon,t:t.n,d:t.best,tool:t.n,c:c.color,r:'Step complete'});
  renderFlow();closeOverlays();go('builder',{tab:'builder'});toast(`Added ${esc(t.n)} as step ${wf.s.length}`,'plus');log(`Added ${t.n} to ${wf.n}`,'flow');
}
function closeOverlays(){
  ['#drawer','#scrim','#modal'].forEach(s=>$(s).classList.remove('on'));$('#drawer').setAttribute('aria-hidden','true');
  $$('.pop').forEach(m=>m.classList.remove('on'));
}
$('#scrim').onclick=closeOverlays;
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeOverlays()});
document.addEventListener('click',e=>{
  const sv=e.target.closest('[data-save]');if(sv){e.stopPropagation();toggleSave(sv.dataset.save);return}
  if(e.target.closest('[data-close]'))return closeOverlays();
  const op=e.target.closest('[data-open]');if(op)return openTool(+op.dataset.open);
  const tl=e.target.closest('[data-tool]');if(tl)return openTool(tl.dataset.tool);
  const ct=e.target.closest('[data-cat]');if(ct)return discoverCat(+ct.dataset.cat);
  const as=e.target.closest('[data-addstep]');if(as)return addToolStep(ALL[+as.dataset.addstep]);
  const ac=e.target.closest('[data-act]');if(ac&&ac.dataset.act==='goal')return openGoal();
},true);

/* ---------- modal helpers: palette + goal finder ---------- */
function openModal(html){$('#modalBody').innerHTML=html;$('#modal').classList.add('on');$('#scrim').classList.remove('on')}
const PAGES=[['home','Home','sparkle'],['discover','Discover tools','search'],['builder','Workflow builder','flow'],['projects','Projects','folder'],['community','Community','users'],['learn','Learn','cap'],['workspace','My workspace','bookmark'],['insights','Insights','chart']];
function openPalette(){
  openModal(`<label class="mini-search pal-in">${ic('search',18)}<input id="palQ" placeholder="Search 750 tools, categories, or pages…" autocomplete="off"><span class="kbd">Esc</span></label><div class="pal-list" id="palList"></div>`);
  const inp=$('#palQ'),list=$('#palList');let rows=[],sel=0;
  const draw=()=>{
    const v=inp.value.trim().toLowerCase();
    const pg=PAGES.filter(p=>!v||p[1].toLowerCase().includes(v)).slice(0,v?3:8);
    const tl=v?searchTools(v,7):[],cl=v?CATS.filter(c=>c.name.toLowerCase().includes(v)).slice(0,3):[];
    rows=[...tl.map(t=>()=>openTool(t.id)),...cl.map(c=>()=>{closeOverlays();discoverCat(c.i)}),...pg.map(p=>()=>{closeOverlays();go(p[0])})];
    let i=0,h='';
    if(tl.length)h+='<div class="res-h">Tools</div>'+tl.map(t=>`<div class="res" data-r="${i++}">${monoHTML(t,28)}<div class="res-t">${esc(t.n)}<em>${esc(t.best)}</em></div><small>${t.c}</small></div>`).join('');
    if(cl.length)h+='<div class="res-h">Categories</div>'+cl.map(c=>`<div class="res" data-r="${i++}"><div class="badge sq" style="--c:${c.color};width:28px;height:28px">${ic(c.icon,14)}</div>${esc(c.name)}<small>${c.count} tools</small></div>`).join('');
    if(pg.length)h+='<div class="res-h">Jump to</div>'+pg.map(p=>`<div class="res" data-r="${i++}"><span style="color:#8fb6ff">${ic(p[2],18)}</span>${p[1]}<small>${ic('arrow',12)}</small></div>`).join('');
    list.innerHTML=h||'<div class="empty">No matches — try “video”, “sql” or “logo”.</div>';sel=0;mark();
  };
  const mark=()=>$$('.res',list).forEach((r,i)=>r.classList.toggle('sel',i===sel));
  inp.oninput=draw;
  inp.onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length;mark();$$('.res',list)[sel]?.scrollIntoView({block:'nearest'})}if(e.key==='Enter'&&rows[sel])rows[sel]()};
  list.onclick=e=>{const r=e.target.closest('[data-r]');if(r)rows[+r.dataset.r]()};
  draw();setTimeout(()=>inp.focus(),30);
}
const GOALS=[
 ['Grow my career',[19,18,2],'resume interview career'],['Build a side project',[4,3,15],'app website build'],['Create content',[2,5,8],'content social video'],
 ['Automate my work',[15,13,14],'automate workflow meetings'],['Learn AI skills',[18,0,1],'learn tutor study'],['Analyze data',[12,22,1],'data sql dashboard'],
 ['Design & brand',[23,5,6],'logo brand design'],['Code faster',[3,28,20],'code review agent']];
function openGoal(){
  const picked=new Set();
  openModal(`<div class="eyebrow">Tell us your goal</div><h2 class="modal-h">What do you want to <span class="grad">achieve?</span></h2><p class="muted-sm">Pick up to three. We’ll build a stack from the directory.</p>
    <div class="goal-grid">${GOALS.map((g,i)=>`<button class="goal" data-g="${i}">${ic('target',16)}${g[0]}</button>`).join('')}</div>
    <div class="modal-f"><button class="btn ghost" data-close>Cancel</button><button class="btn solid" id="goalGo" disabled>Get my stack ${ic('arrow',15)}</button></div><div id="goalOut"></div>`);
  $('#modalBody').onclick=e=>{const g=e.target.closest('[data-g]');if(!g)return;const i=+g.dataset.g;if(picked.has(i))picked.delete(i);else if(picked.size<3)picked.add(i);
    $$('.goal').forEach(b=>b.classList.toggle('on',picked.has(+b.dataset.g)));$('#goalGo').disabled=!picked.size};
  $('#goalGo').onclick=()=>{
    const stack=[];[...picked].forEach(i=>GOALS[i][1].forEach(ci=>{const t=ALL.filter(x=>x.ci===ci&&!stack.includes(x)).sort((a,b)=>a.rank-b.rank)[0];if(t&&stack.length<6)stack.push(t)}));
    $('#goalOut').innerHTML=`<div class="res-h" style="margin-top:18px">Your curated stack</div><div class="stack-out">${stack.map(t=>`<div class="res" data-open="${t.id}">${monoHTML(t,32)}<div class="res-t">${esc(t.n)}<em>${esc(t.best)}</em></div>${heart(t.n)}</div>`).join('')}</div>
      <div class="modal-f"><button class="btn solid" id="goalWf">${ic('flow',15)} Build a workflow from this</button></div>`;
    $('#goalWf').onclick=()=>{wf={n:[...picked].map(i=>GOALS[i][0]).join(' + '),d:'Generated from your goals',s:stack.slice(0,5).map(t=>({i:CATS[t.ci].icon,t:t.n,d:t.best,tool:t.n,c:CATS[t.ci].color,r:'Step complete'}))};renderFlow();closeOverlays();go('builder',{tab:'builder'});toast('Workflow built from your goals','sparkle')};
    log('Picked goals: '+[...picked].map(i=>GOALS[i][0]).join(', '),'target');
  };
}

/* ---------- nav: bell, avatar, burger ---------- */
const NOTIFS=[];
function notify(x,i='check',c='#4ade80'){NOTIFS.unshift({x,i,c,at:Date.now(),unread:true});renderBell()}
function renderBell(){
  $('#bellMenu').innerHTML='<div class="res-h">Notifications</div>'+(NOTIFS.length?NOTIFS.map(n=>`<div class="res"><div class="badge sq" style="--c:${n.c};width:30px;height:30px">${ic(n.i,14)}</div><div class="res-t">${n.x}<em>${ago(n.at)}</em></div></div>`).join(''):'<div class="empty">You’re all caught up.</div>');
  $('#bell .dot').hidden=!NOTIFS.some(n=>n.unread);
}
renderBell();
const popToggle=(btn,menu)=>btn.addEventListener('click',()=>{const on=!$(menu).classList.contains('on');$$('.pop').forEach(m=>m.classList.remove('on'));$(menu).classList.toggle('on',on)});
popToggle($('#bell'),'#bellMenu');popToggle($('#avatarBtn'),'#avatarMenu');
$('#bell').addEventListener('click',()=>{NOTIFS.forEach(n=>n.unread=false);$('#bell .dot').hidden=true});
$('#burger').onclick=()=>$('#links').classList.toggle('open');
$('#savedCount').textContent=S.d.saved.length;

/* ---------- home ---------- */
const HOME_CHIPS=[['Image',5],['Video',7],['Design',23],['Writing',2],['Code',3],['Audio',10],['3D',24],['Research',1],['More',-1]];
$('#homeChips').innerHTML=HOME_CHIPS.map(([l,ci])=>`<button class="chip" ${ci<0?'data-go="discover"':`data-cat="${ci}"`}>${ic(ci<0?'dots':CATS[ci].icon,13)}${l}</button>`).join('');
const HOME_CATS=[[13,'Work smarter'],[23,'Visual creativity'],[3,'Build faster'],[2,'Better content'],[1,'Deeper insights'],[7,'Bring ideas to life'],[10,'Sounds smarter'],[15,'Hands-free work']];
$('#homeCats').innerHTML=HOME_CATS.map(([ci,tag],i)=>{const c=CATS[ci];return`<button class="glass glow cat-tile" data-cat="${ci}" data-a style="--d:${9+i*.4}">
  <div class="cat-ic" style="--c:${c.color}">${ic(c.icon,26)}</div><span class="arr">${ic('arrow',14)}</span><h4>${c.short}</h4><p>${tag}</p><small>${c.count} tools</small></button>`}).join('');
$('#topPicks').innerHTML=['Claude','Runway','Lovable'].map(byName).map((t,i)=>`<div class="glass glow pick" data-open="${t.id}" data-a style="--d:${10+i*.5}">
  <div class="tc-top">${monoHTML(t,46)}${heart(t.n)}</div><h4>${esc(t.n)}</h4>
  <p>${esc(t.desc)}</p>
  <div class="tc-f"><span class="pill">${t.c}</span>${t.aud.slice(0,1).map(a=>`<span class="pill">${esc(a)}</span>`).join('')}<span class="go-sm">${ic('arrow',14)}</span></div></div>`).join('');
const PROMPTS=[['A cyberpunk city at night with towering neon billboards and teal haze','Image','prompt-cyber-city'],['An aerial city coastline at blue hour, glowing streets under a magenta sky','Photo','prompt-city-dusk'],['Sunrise over a misty pine forest valley with distant mountains, golden light','Landscape','prompt-misty-forest']];
$('#prompts').innerHTML=PROMPTS.map(([p,tag,img],i)=>`<div class="glass glow prompt-card" data-a style="--d:${11+i*.5}">${mediaHTML(img,130,p)}
  <p>“${p}”</p><div class="tc-f"><span class="pill">${tag}</span><button class="go-sm round" data-prompt="${i}" aria-label="Use prompt">${ic('arrow',14)}</button></div></div>`).join('');
$('#prompts').addEventListener('click',e=>{const b=e.target.closest('[data-prompt]');if(!b)return;generate(PROMPTS[+b.dataset.prompt][0]);go('builder',{tab:'builder'})});
function renderRecent(){
  const L=(S.d.recent||[]).map(byName).filter(Boolean).slice(0,5),list=L.length?L:FEATURED.slice(0,5);
  $('#recentH').textContent=L.length?'Recently used':'Popular tools';
  $('#recent').innerHTML=list.map((t,i)=>`<button class="glass glow tool" data-a style="--d:${9+i*.5}" data-open="${t.id}"><span class="more">${ic('dots',16)}</span>${logoHTML(t,40)}<h5>${esc(t.n)}</h5><div class="t">${esc(t.best)}</div><span class="pill">${t.c}</span></button>`).join('');
}
ENTER.home=()=>{renderRecent();countUp($('#p-home .stats-col'))};

/* ---------- discover ---------- */
const dir={cat:-1,q:'',price:'all',sort:'featured',limit:24};
$('#dirChips').innerHTML=`<button class="chip on" data-dcat="-1">All <em>${ALL.length}</em></button>`+CATS.map(c=>`<button class="chip" data-dcat="${c.i}"><span style="color:${c.color}">${ic(c.icon,13)}</span>${c.short}<em>${c.count}</em></button>`).join('');
function dirList(){
  let L=dir.q?searchTools(dir.q,750,ALL):ALL.slice();
  if(dir.cat>=0)L=L.filter(t=>t.ci===dir.cat);
  if(dir.price==='free')L=L.filter(t=>t.free);if(dir.price==='api')L=L.filter(t=>t.api);if(dir.price==='saved')L=L.filter(t=>isSaved(t.n));
  if(!dir.q||dir.sort!=='featured'){
    const f=t=>FEATURED.includes(t)?-1:t.rank*100+t.ci;
    L.sort(dir.sort==='az'?(a,b)=>a.n.localeCompare(b.n):dir.sort==='za'?(a,b)=>b.n.localeCompare(a.n):dir.sort==='cat'?(a,b)=>a.ci-b.ci||a.rank-b.rank:(a,b)=>f(a)-f(b));
  }
  return L;
}
function renderDir(){
  const L=dirList();
  $('#dirCount').textContent=`${L.length} tool${L.length===1?'':'s'}`;
  $('#dirHint').textContent=dir.cat>=0?CATS[dir.cat].name:dir.q?`matching “${dir.q}”`:'across 30 categories';
  $('#dirGrid').innerHTML=L.length?L.slice(0,dir.limit).map(cardHTML).join(''):`<div class="empty glass" style="grid-column:1/-1">No tools match. <button class="link" id="dirReset">Reset filters</button></div>`;
  $('#loadMore').hidden=L.length<=dir.limit;
  $('#loadMore').innerHTML=`Load more <em class="muted-sm">(${Math.max(0,L.length-dir.limit)} left)</em> ${ic('down',16)}`;
  $$('#dirChips .chip').forEach(b=>b.classList.toggle('on',+b.dataset.dcat===dir.cat));
}
function discoverCat(i){dir.cat=i;dir.q='';$('#dq').value='';$('#dqClear').hidden=true;dir.limit=24;closeOverlays();go('discover');renderDir();setTimeout(()=>$(`#dirChips [data-dcat="${i}"]`)?.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'}),60)}
$('#dirChips').onclick=e=>{const b=e.target.closest('[data-dcat]');if(!b)return;dir.cat=+b.dataset.dcat;dir.limit=24;renderDir()};
let dqT;$('#dq').oninput=e=>{clearTimeout(dqT);dqT=setTimeout(()=>{dir.q=e.target.value.trim();dir.limit=24;$('#dqClear').hidden=!dir.q;renderDir()},140)};
$('#dqClear').onclick=()=>{$('#dq').value='';dir.q='';$('#dqClear').hidden=true;renderDir()};
$('#priceSeg').onclick=e=>{const b=e.target.closest('[data-p]');if(!b)return;dir.price=b.dataset.p;dir.limit=24;$$('#priceSeg button').forEach(x=>x.classList.toggle('on',x===b));renderDir()};
$('#sortBtn').onclick=()=>$('#sortMenu').classList.toggle('on');
$('#sortMenu').onclick=e=>{const r=e.target.closest('[data-sort]');if(!r)return;dir.sort=r.dataset.sort;$('#sortLbl').textContent=r.textContent;$('#sortMenu').classList.remove('on');renderDir()};
$('#loadMore').onclick=()=>{dir.limit+=24;renderDir()};
$('#dirGrid').addEventListener('click',e=>{if(e.target.id==='dirReset'){Object.assign(dir,{cat:-1,q:'',price:'all',limit:24});$('#dq').value='';$$('#priceSeg button').forEach((x,i)=>x.classList.toggle('on',!i));renderDir()}});
ENTER.discover=renderDir;

/* ---------- builder: tool library ---------- */
function renderLib(){
  const v=$('#libQ').value.trim(),L=v?searchTools(v,30):FEATURED.concat(ALL.filter(t=>t.rank<2&&!FEATURED.includes(t))).slice(0,30);
  $('#libGrid').innerHTML=L.map(t=>`<div class="lib-row">${monoHTML(t,32)}<div class="res-t" data-open="${t.id}">${esc(t.n)}<em>${esc(t.c)} · ${esc(t.best)}</em></div><button class="btn sm ghost" data-addstep="${t.id}">${ic('plus',13)} Add</button></div>`).join('')||'<div class="empty">No tools found.</div>';
}
$('#libQ').oninput=renderLib;
$('#stepMenu').addEventListener('click',e=>{if(e.target.closest('[data-lib]')){$('#stepMenu').classList.remove('on');setTab('library');$('#libQ').focus()}});
new MutationObserver(()=>{const m=$('#stepMenu');if(m.classList.contains('on')&&!m.querySelector('[data-lib]'))m.insertAdjacentHTML('beforeend',`<div class="res lib-link" data-lib>${ic('search',16)}Browse all 750 tools<small>${ic('arrow',12)}</small></div>`)}).observe($('#stepMenu'),{attributes:true,attributeFilter:['class']});

/* ---------- projects: kanban + co-pilot ---------- */
const COLS=[['idea','Ideation','#a78bfa'],['prog','In Progress','#4c8dff'],['rev','Review','#eab308'],['done','Completed','#4ade80']];
const TAGC={Creative:'#a78bfa',Research:'#22d3ee',Design:'#ec4899',Development:'#4c8dff',Marketing:'#f97316',Video:'#14b8a6',Community:'#eab308',Content:'#4ade80'};
const PRI={High:'#fb7185',Medium:'#fbbf24',Low:'#4ade80'};
if(!S.d.board)S.d.board=[['Brand campaign concept','idea','Creative','High'],['AI art style exploration','idea','Research','Medium'],['Mobile app wireframes','idea','Design','Medium'],['Community challenge','idea','Community','Low'],
  ['Landing page design','prog','Design','High'],['AI video campaign','prog','Video','Medium'],['Tool integration (API)','prog','Development','High'],
  ['Brand assets pack','rev','Design','Medium'],['Content strategy','rev','Marketing','Low'],
  ['User research','done','Research','Low'],['Onboarding flow','done','Development','Medium'],['Logo animation','done','Video','Low']].map((r,i)=>({id:i+1,t:r[0],col:r[1],tag:r[2],pri:r[3]}));
const nextId=()=>Math.max(0,...S.d.board.map(t=>t.id))+1;
function addTask(t,col='idea',tag='Creative',pri='Medium'){S.d.board.push({id:nextId(),t,col,tag,pri});S.save();log('Added task “'+t+'”','plus')}
function renderBoard(){
  const B=S.d.board;
  $('#kanban').innerHTML=COLS.map(([k,n,c])=>{const L=B.filter(t=>t.col===k);return`<div class="glass col" data-col="${k}">
    <div class="col-h"><i style="background:${c};box-shadow:0 0 8px ${c}"></i>${n}<em>${L.length}</em></div>
    <div class="col-b">${L.map(t=>`<div class="task ${k==='done'?'done':''}" draggable="true" data-task="${t.id}">
      <div class="task-t">${k==='done'?`<span class="tick">${ic('check',12)}</span>`:''}<span class="tt" data-edit="${t.id}">${esc(t.t)}</span></div>
      <div class="task-f"><span class="tag" style="--c:${TAGC[t.tag]||'#8fb6ff'}">${t.tag}</span><button class="tag pri" data-pri="${t.id}" style="--c:${PRI[t.pri]}" title="Change priority">${t.pri}</button>
      <span class="task-acts">${k!=='done'?`<button data-move="${t.id}" title="Move forward">${ic('arrow',13)}</button>`:''}<button data-deltask="${t.id}" title="Delete">${ic('x',13)}</button></span></div></div>`).join('')}</div>
    <button class="add-task" data-addin="${k}">${ic('plus',13)} Add a task</button></div>`}).join('');
  const open=B.filter(t=>t.col!=='done').length,done=B.filter(t=>t.col==='done').length;
  $('#projStats').innerHTML=[['folder','#4c8dff',B.length,'Total tasks'],['check','#14b8a6',open,'Open tasks'],['zap','#a855f7',B.filter(t=>t.col==='prog').length,'In progress'],['target','#4ade80',Math.round(done/Math.max(1,B.length)*100),'Complete','%']]
    .map(([i,c,v,l,s],n)=>`<div class="glass glow kpi row" data-a style="--d:${3+n*.5}"><div class="badge sq" style="--c:${c};width:42px;height:42px">${ic(i,19)}</div><div><div class="v sm" data-count="${v}" data-suf="${s||''}">${v}${s||''}</div><div class="l">${l}</div></div></div>`).join('');
  $('#taskList').innerHTML=`<div class="tl-row th"><span>Task</span><span>Status</span><span>Tag</span><span>Priority</span></div>`+B.map(t=>`<div class="tl-row"><span>${esc(t.t)}</span><span>${COLS.find(c=>c[0]===t.col)[1]}</span><span class="tag" style="--c:${TAGC[t.tag]||'#8fb6ff'}">${t.tag}</span><span class="tag" style="--c:${PRI[t.pri]}">${t.pri}</span></div>`).join('');
}
const K=$('#kanban');
K.addEventListener('dragstart',e=>{const t=e.target.closest('[data-task]');if(!t)return;e.dataTransfer.setData('text/plain',t.dataset.task);e.dataTransfer.effectAllowed='move';setTimeout(()=>t.classList.add('dragging'))});
K.addEventListener('dragend',e=>{e.target.closest?.('[data-task]')?.classList.remove('dragging');$$('.col',K).forEach(c=>c.classList.remove('over'))});
K.addEventListener('dragover',e=>{const c=e.target.closest('[data-col]');if(!c)return;e.preventDefault();$$('.col',K).forEach(x=>x.classList.toggle('over',x===c))});
K.addEventListener('drop',e=>{const c=e.target.closest('[data-col]');if(!c)return;e.preventDefault();const t=S.d.board.find(x=>x.id===+e.dataTransfer.getData('text/plain'));if(!t)return;
  if(t.col!==c.dataset.col){t.col=c.dataset.col;S.save();log(`Moved “${t.t}” to ${COLS.find(x=>x[0]===t.col)[1]}`,'arrow');if(t.col==='done')toast(`Nice — “${esc(t.t)}” is done`)}renderBoard()});
K.addEventListener('click',e=>{
  const mv=e.target.closest('[data-move]'),dl=e.target.closest('[data-deltask]'),pr=e.target.closest('[data-pri]'),ad=e.target.closest('[data-addin]');
  if(mv){const t=S.d.board.find(x=>x.id===+mv.dataset.move),i=COLS.findIndex(c=>c[0]===t.col);t.col=COLS[i+1][0];S.save();log(`Moved “${t.t}” to ${COLS[i+1][1]}`,'arrow');renderBoard()}
  if(dl){S.d.board=S.d.board.filter(x=>x.id!==+dl.dataset.deltask);S.save();renderBoard();toast('Task deleted','trash')}
  if(pr){const t=S.d.board.find(x=>x.id===+pr.dataset.pri),ks=Object.keys(PRI);t.pri=ks[(ks.indexOf(t.pri)+1)%3];S.save();renderBoard()}
  if(ad){ad.outerHTML=`<input class="task-in" data-newin="${ad.dataset.addin}" placeholder="Task name, then Enter">`;$(`[data-newin="${ad.dataset.addin}"]`).focus()}
});
K.addEventListener('keydown',e=>{const i=e.target.closest('[data-newin]');if(!i)return;if(e.key==='Enter'&&i.value.trim()){addTask(i.value.trim(),i.dataset.newin);renderBoard();$(`[data-addin="${i.dataset.newin}"]`)?.click()}if(e.key==='Escape')renderBoard()});
K.addEventListener('focusout',e=>{if(e.target.matches('[data-newin]')&&!e.target.value.trim())setTimeout(renderBoard,120)});
K.addEventListener('dblclick',e=>{const s=e.target.closest('[data-edit]');if(!s)return;s.contentEditable=true;s.focus();getSelection().selectAllChildren(s);
  s.onblur=()=>{s.contentEditable=false;const t=S.d.board.find(x=>x.id===+s.dataset.edit);t.t=s.textContent.trim()||t.t;S.save();renderBoard()};s.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();s.blur()}}});
$('#newTask').onclick=()=>{setPTab('board');$('[data-addin="idea"]')?.click()};
function setPTab(n){$$('[data-ptab]').forEach(b=>b.classList.toggle('on',b.dataset.ptab===n));$('#kanban').hidden=n!=='board';$('#taskList').hidden=n!=='list'}
$$('[data-ptab]').forEach(b=>b.onclick=()=>setPTab(b.dataset.ptab));
// co-pilot
let cpBusy=false;
async function say(html,who='ai'){
  const log=$('#cpLog'),el=document.createElement('div');el.className='msg '+who;log.appendChild(el);
  if(who==='ai'&&!reduced){el.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';log.scrollTop=log.scrollHeight;await sleep(650)}
  el.innerHTML=html;log.scrollTop=log.scrollHeight;
}
const toolLinks=L=>L.map(t=>`<button class="tool-chip" data-open="${t.id}">${monoHTML(t,20)}${esc(t.n)}</button>`).join('');
async function copilot(kind,text=''){
  if(cpBusy)return;cpBusy=true;const B=S.d.board;
  if(kind==='summary'){
    await say('Summarize this project','me');
    const by=k=>B.filter(t=>t.col===k),hi=B.filter(t=>t.pri==='High'&&t.col!=='done');
    await say(`You have <b>${B.length} tasks</b>: ${by('idea').length} in ideation, ${by('prog').length} in progress, ${by('rev').length} in review and ${by('done').length} done (${Math.round(by('done').length/Math.max(1,B.length)*100)}%).${hi.length?` Highest priority right now: <b>${hi.map(t=>esc(t.t)).join('</b>, <b>')}</b>.`:' Nothing high-priority is open.'}`);
  }else if(kind==='next'){
    await say('Generate next steps','me');
    const pool=['Draft launch announcement','Set up analytics dashboard','Collect beta feedback','Create social teaser clips','Write onboarding email','Record product walkthrough','Plan community AMA'].filter(p=>!B.some(t=>t.t===p)).slice(0,3);
    pool.forEach((p,i)=>addTask(p,'idea',['Marketing','Research','Video'][i%3],i?'Medium':'High'));renderBoard();
    await say(pool.length?`Added <b>${pool.length} next steps</b> to Ideation: ${pool.map(esc).join(', ')}.`:'Your board already covers my usual next steps — nice work.');
  }else if(kind==='stack'){
    await say('Recommend a tool stack','me');
    const tags=[...new Set(B.filter(t=>t.col!=='done').map(t=>t.tag))];
    const L=[];tags.forEach(tg=>{const t=searchTools(tg,3).find(x=>!L.includes(x));if(t)L.push(t)});
    await say(`Based on your open work (${tags.join(', ')}), this stack covers it:<div class="tool-chips">${toolLinks(L.slice(0,6))}</div>`);
  }else if(kind==='split'){
    const idea=text||$('#cpIn').value.trim()||'Launch the Lunorb beta';$('#cpIn').value='';
    await say(`Turn “${esc(idea)}” into tasks`,'me');
    const ts=[`Research: ${idea}`,`Outline plan for ${idea}`,`Create assets for ${idea}`,`Review & ship ${idea}`];
    ts.forEach((t,i)=>addTask(t,'idea',['Research','Creative','Design','Marketing'][i],i===0?'High':'Medium'));renderBoard();
    await say(`Done — <b>4 tasks</b> added to Ideation. Drag them across the board as you go.`);
  }else{
    await say(esc(text),'me');
    const m=text.match(/^(?:add|create)(?: a)?(?: task)?[:\s]+(.+)/i);
    if(m){addTask(m[1].trim());renderBoard();await say(`Added “${esc(m[1].trim())}” to Ideation.`)}
    else{const L=searchTools(text,4);await say(L.length?`For that, I’d start with:<div class="tool-chips">${toolLinks(L)}</div><span class="muted-sm">Tip: type “add &lt;task&gt;” to drop it on the board.</span>`:'I couldn’t match that to a tool. Try describing the outcome, e.g. “edit podcast audio” or “build a landing page”.')}
  }
  cpBusy=false;
}
$$('[data-cp]').forEach(b=>b.onclick=()=>copilot(b.dataset.cp));
const cpSend=()=>{const v=$('#cpIn').value.trim();if(!v)return $('#cpIn').focus();$('#cpIn').value='';copilot('free',v)};
$('#cpGo').onclick=cpSend;$('#cpIn').addEventListener('keydown',e=>{if(e.key==='Enter')cpSend()});
const QUICK=[['plus','New Task',()=>$('#newTask').click()],['sparkle','Generate Plan',()=>copilot('next')],['image','Create Assets',()=>discoverCat(5)],['zap','Set Automation',()=>go('builder',{tab:'builder'})],['users','Invite Team',()=>{navigator.clipboard?.writeText(location.href).catch(()=>{});toast('Invite link copied','link')}],['dots','More',()=>openPalette()]];
$('#quick').innerHTML=QUICK.map((q,i)=>`<button class="glass glow qk" data-q="${i}"><span>${ic(q[0],22)}</span>${q[1]}</button>`).join('');
$('#quick').onclick=e=>{const b=e.target.closest('[data-q]');if(b)QUICK[+b.dataset.q][2]()};
ENTER.projects=()=>{renderBoard();if(!$('#cpLog').children.length)say('Hi! I can summarize your board, suggest next steps, or recommend tools from the 750 in the directory.')};

/* ---------- community ---------- */
// COMMUNITY is filled from Supabase by cloud.js. Until real data exists, social numbers read "Pending" instead of being invented.
const COMMUNITY={ready:false,me:null,creators:[],workflows:[],following:new Set()};
let followCreator=async()=>toast('Sign in to follow creators','users');
let likeShared=async()=>toast('Sign in to like community workflows','heart');
let shareWorkflow=async()=>{navigator.clipboard?.writeText(location.href.split('#')[0]+'#builder').catch(()=>{});toast('Link to the workflow builder copied','link')};
const pendingCard=(title,body,cta='')=>`<div class="glass pending-card"><span class="pending">Pending</span><h4>${title}</h4><p class="muted-sm">${body}</p>${cta}</div>`;
function renderCreators(){
  const C=COMMUNITY.creators;
  $('#followCount').innerHTML=COMMUNITY.ready?`Following ${COMMUNITY.following.size}`:'<span class="pending">Pending</span>';
  $('#creators').innerHTML=C.length?C.map((p,i)=>{const on=COMMUNITY.following.has(p.id),name=p.handle?'@'+p.handle:(p.display_name||'Lunorb member');
    return`<div class="glass glow creator" data-a style="--d:${4+i*.4}"><div class="av" style="--h:${hashOf(p.id)%360}"><span>${esc(name.replace('@','')[0].toUpperCase())}</span></div>
    <h5>${esc(name)}</h5><p>${p.workflows} published workflow${p.workflows==1?'':'s'}</p><small>${p.followers} follower${p.followers==1?'':'s'}</small>
    ${p.id===COMMUNITY.me?'<span class="pill">You</span>':`<button class="btn sm ${on?'solid':'ghost'}" data-follow="${p.id}">${on?'Following':'Follow'}</button>`}</div>`}).join('')
   :pendingCard('Featured creators are on the way','Creators appear here once they publish workflows to the community. Share one of yours to be among the first.',`<button class="btn sm" data-sharewf>${ic('plus',13)} Share a workflow</button>`);
}
$('#creators').onclick=e=>{const b=e.target.closest('[data-follow]');if(b)followCreator(b.dataset.follow,!COMMUNITY.following.has(b.dataset.follow))};
const WFS=[['Cinematic Story Video','From idea to final cut with AI.',['ChatGPT','Midjourney','Runway','ElevenLabs'],'wf-cinematic'],['AI Brand Visuals','Complete visual identity workflow.',['Claude','Ideogram','Recraft','Figma AI'],'wf-brand-visuals'],['Game Asset Pipeline','3D assets from concept to game.',['Leonardo.Ai','Meshy','Tripo AI'],'wf-game-assets']];
const likeKey=k=>S.d.likes.includes(k);
function sharedCard(w,i){const tools=[...new Set(w.steps.map(s=>s.tool))].slice(0,4).map(tool);
  return`<div class="glass glow wfcard shared" data-a style="--d:${5+i*.4}"><div class="wf-cover">${tools.map(t=>logoHTML(t,34)).join('')}</div>
  <div class="wf-badges"><span>${w.steps.length} steps</span><button class="like ${w.liked?'on':''}" data-clike="${w.id}" aria-label="Like">${ic('heart',13)} <b>${w.likes_count}</b></button></div>
  <div class="wf-b"><h4>${esc(w.name)}</h4><p>${esc(w.description||'')}</p><div class="tool-chips">${toolLinks(tools.filter(t=>t.id!=null))}</div>
  <div class="tc-f"><span class="muted-sm">${esc(w.author)}</span><button class="btn sm" data-usecwf="${w.id}">Use workflow ${ic('arrow',13)}</button></div></div></div>`}
function renderPopWf(){
  $('#popWf').innerHTML=COMMUNITY.workflows.slice(0,6).map(sharedCard).join('')+WFS.map(([n,d,ts,img],i)=>`<div class="glass glow wfcard" data-a style="--d:${5+i*.4}">${mediaHTML(img,140,n)}
  <div class="wf-badges"><span>${ts.length} tools</span><span>Lunorb pick</span></div>
  <div class="wf-b"><h4>${n}</h4><p>${d}</p><div class="tool-chips">${toolLinks(ts.map(byName).filter(Boolean))}</div>
  <div class="tc-f"><span class="muted-sm">Curated by Lunorb</span><button class="btn sm" data-usewf="${i}">Use workflow ${ic('arrow',13)}</button></div></div></div>`).join('');
}
const toSteps=names=>names.map(byName).filter(Boolean).map(t=>({i:CATS[t.ci].icon,t:t.n,d:t.best,tool:t.n,c:CATS[t.ci].color,r:'Step complete'}));
document.addEventListener('click',e=>{
  const lk=e.target.closest('[data-like]');if(lk){const k=lk.dataset.like,on=!likeKey(k);S.d.likes=on?[...S.d.likes,k]:S.d.likes.filter(x=>x!==k);S.save();lk.classList.toggle('on',on);return}
  const cl=e.target.closest('[data-clike]');if(cl){likeShared(cl.dataset.clike);return}
  if(e.target.closest('[data-sharewf]')){shareWorkflow();return}
  const u=e.target.closest('[data-usewf]');if(u){const w=WFS[+u.dataset.usewf];wf={n:w[0],d:w[1],s:toSteps(w[2])};renderFlow();go('builder',{tab:'builder'});toast(`Loaded “${w[0]}”`,'flow');return}
  const uc=e.target.closest('[data-usecwf]');if(uc){const w=COMMUNITY.workflows.find(x=>x.id===uc.dataset.usecwf);if(!w)return;wf={n:w.name,d:w.description||'',input:'',s:w.steps.map(s=>({...s}))};renderFlow();go('builder',{tab:'builder'});toast(`Loaded “${esc(w.name)}”`,'flow');return}
  const rx=e.target.closest('[data-remix]');if(rx){const s=STACKS[+rx.dataset.remix];wf={n:s[0]+' (remix)',d:'Remixed from a Lunorb tool stack',s:toSteps(s[1])};renderFlow();go('builder',{tab:'builder'});log('Remixed '+s[0],'layers');toast(`Remixed “${s[0]}”`,'layers');return}
  const co=e.target.closest('[data-coll]');if(co){const c=COLLS[+co.dataset.coll];closeOverlays();go('discover');dir.cat=-1;dir.q=c[2];$('#dq').value=c[2];$('#dqClear').hidden=false;renderDir()}
});
const COLLS=[['Cyber Realms','Futuristic worlds','image','col-cyber-realms'],['AI for Good','Real world impact','health','col-ai-for-good'],['Creator Essentials','Tools & workflows','video editing','col-creator-essentials'],['Dreamscapes','Surreal & abstract','art','col-dreamscapes']];
$('#collections').innerHTML=COLLS.map(([n,d,q,img],i)=>`<button class="lrow" data-coll="${i}"><span class="thumb">${mediaHTML(img,44,n)}</span><div class="res-t">${n}<em>${searchTools(q,750).length} tools · ${d}</em></div>${ic('chev',14)}</button>`).join('');
const STACKS=[['Social Content Machine',['Claude','Canva Magic Studio','Buffer AI Assistant']],['Product Launch Kit',['Perplexity','Gamma','Lovable']],['AI Art Director',['Midjourney','Krea','Magnific AI']],['Indie Creator Stack',['Descript','ElevenLabs','OpusClip']]];
$('#stacks').innerHTML=STACKS.map(([n,ts],i)=>`<div class="lrow"><span class="stack-ic">${ts.map(byName).filter(Boolean).slice(0,2).map(t=>monoHTML(t,26)).join('')}</span><div class="res-t">${n}<em>${ts.length} tools · Curated by Lunorb</em></div><button class="btn sm ghost" data-remix="${i}">Remix</button><button class="like ${likeKey(n)?'on':''}" data-like="${n}" aria-label="Like ${n}">${ic('heart',13)}</button></div>`).join('');
function setCTab(n){$$('[data-ctab]').forEach(b=>b.classList.toggle('on',b.dataset.ctab===n));$$('[data-csec]').forEach(s=>s.hidden=n!=='all'&&s.dataset.csec!==n)}
$$('[data-ctab]').forEach(b=>b.onclick=()=>setCTab(b.dataset.ctab));
$('#shareBtn').onclick=()=>shareWorkflow();
const quoteS=makeScene($('#quoteScene'),{...SCN.cta,seed:9,figure:false});
ENTER.community=()=>{renderCreators();renderPopWf();requestAnimationFrame(()=>quoteS.size())};

/* ---------- learn ---------- */
const WEEK_GOALS=['Complete 2 lessons','Try a new AI tool','Build a mini project','Write a reflection','Engage in the community'];
// consecutive active days ending today (or yesterday, so the streak survives until you're active today)
function streakDays(){const D=S.d.daily||{},d=new Date();if(!D[dayKey(d)])d.setDate(d.getDate()-1);let n=0;while(D[dayKey(d)]){n++;d.setDate(d.getDate()-1)}return n}
const TRACKS=[['zap','#eab308','Productivity Pro','Work smarter with AI',13],['image','#ec4899','Creative Builder','Design, content & storytelling',5],['code','#4c8dff','Developer Edge','Build with AI tools',3],['chart','#4ade80','Career Growth','Future-ready skills',19]];
function renderLearn(){
  const L=S.d.lesson;
  $('#pathCard').innerHTML=`<div class="path-art">${artHTML(200,77,170)}</div><div class="path-b"><div class="card-h" style="margin:0"><h4>AI for Creative Professionals</h4><span class="muted-sm">${L} of 8 modules</span></div>
    <p class="muted-sm">From ideas to impact — learn, build, and ship with AI.</p><div class="bar-track"><i style="width:${L/8*100}%"></i></div>
    <div class="tc-f" style="margin-top:14px"><span class="pill">Creativity</span><span class="pill">AI Tools</span><span class="pill">Real Projects</span><button class="btn sm solid" id="contLearn">${L>=8?'Restart path':'Continue learning'} ${ic('arrow',13)}</button></div></div>`;
  const today=(new Date().getDay()+6)%7,n=streakDays(),D=S.d.daily||{};
  const wk=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-today+i);return!!D[dayKey(d)]});
  $('#streakCard').innerHTML=`<div class="streak"><span class="flame">${ic('flame',30)}</span><div><b>${n} day streak</b><p class="muted-sm">${n===0?'Do one thing today to start a streak.':n<3?'Nice start. Come back tomorrow to keep it going.':'You’re on a roll. Keep going.'}</p></div></div>
    <div class="week">${'MTWTFSS'.split('').map((d,i)=>`<div class="${wk[i]?'on':''}"><i>${wk[i]?ic('check',12):''}</i>${d}</div>`).join('')}</div>`;
  const g=S.d.goals;
  $('#goalsCard').innerHTML=`<div class="card-h"><h4>Weekly goals</h4><span class="muted-sm">${g.length} of 5 complete</span></div><div class="bar-track"><i style="width:${g.length/5*100}%"></i></div>
    <div class="checks">${WEEK_GOALS.map((w,i)=>`<button class="check ${g.includes(i)?'on':''}" data-goal="${i}"><i>${ic('check',12)}</i>${w}</button>`).join('')}</div>`;
  const use=Object.entries(S.d.toolUse||{}).sort((a,b)=>b[1]-a[1]).slice(0,5),top=use.length?use[0][1]:1;
  $('#masteryCard').innerHTML=`<div class="card-h"><h4>Tool mastery</h4><span class="muted-sm">Guided steps completed</span></div>`+(use.length?use.map(([n,c])=>{const t=tool(n);return`<div class="mast" ${t.id!=null?`data-open="${t.id}"`:''}>${monoHTML(t,26)}<span>${esc(n)}</span><div class="bar-track"><i style="width:${c/top*100}%"></i></div><em>${c}</em></div>`}).join('')
    :'<div class="empty">Complete steps in a guided run and the tools you use will show up here.</div>');
  $('#tracks').innerHTML=TRACKS.map(([i,c,n,d,ci],k)=>`<button class="glass glow qa track" data-cat="${ci}" data-a style="--d:${7+k*.4}"><div class="badge" style="--c:${c}">${ic(i,20)}</div><h4>${n}</h4><p>${d}</p><small>${CATS[ci].count} curated tools ${ic('arrow',12)}</small></button>`).join('');
  $('#contLearn').onclick=()=>{S.d.lesson=S.d.lesson>=8?1:S.d.lesson+1;S.save();log(`Completed module ${S.d.lesson} of AI for Creative Professionals`,'cap');toast(S.d.lesson===8?'Path complete — certificate earned!':`Module ${S.d.lesson} complete`,'cap');renderLearn()};
}
$('#goalsCard').addEventListener('click',e=>{const b=e.target.closest('[data-goal]');if(!b)return;const i=+b.dataset.goal;S.d.goals=S.d.goals.includes(i)?S.d.goals.filter(x=>x!==i):[...S.d.goals,i];S.save();if(S.d.goals.includes(i))log('Goal done: '+WEEK_GOALS[i],'target');renderLearn()});
ENTER.learn=renderLearn;

/* ---------- workspace ---------- */
let wsTab='overview';
function setWTab(n){wsTab=n;$$('[data-wtab]').forEach(b=>b.classList.toggle('on',b.dataset.wtab===n));['overview','saved','notes'].forEach(k=>$('#ws-'+k).hidden=k!==n);renderWorkspace()}
TABS.workspace=setWTab;
$$('[data-wtab]').forEach(b=>b.onclick=()=>setWTab(b.dataset.wtab));
function renderWorkspace(){
  const open=S.d.board.filter(t=>t.col!=='done').length;
  $('#wsStats').innerHTML=[['heart','#ec4899',S.d.saved.length,'Saved tools','saved'],['folder','#14b8a6',open,'Open tasks',''],['file','#4c8dff',S.d.notes.length,'Notes','notes'],['flow','#a855f7',store.get().length,'Saved workflows','']]
    .map(([i,c,v,l,t])=>`<button class="glass glow kpi row" ${t?`data-wtab-go="${t}"`:'data-go="projects"'}><div class="badge sq" style="--c:${c};width:42px;height:42px">${ic(i,19)}</div><div><div class="v sm">${v}</div><div class="l">${l}</div></div></button>`).join('');
  $('#activity').innerHTML=S.d.activity.slice(0,7).map(a=>`<div class="lrow"><span class="badge sq" style="--c:#4c8dff;width:32px;height:32px">${ic(a.i,15)}</span><div class="res-t">${esc(a.x)}<em>${ago(a.at)}</em></div></div>`).join('')||'<div class="empty">Nothing yet — save a tool to get started.</div>';
  const P=[...new Set(S.d.board.map(t=>t.tag))].map(tag=>{const ts=S.d.board.filter(t=>t.tag===tag),d=ts.filter(t=>t.col==='done').length;return[tag,ts.length,Math.round(d/ts.length*100)]}).sort((a,b)=>b[1]-a[1]).slice(0,4);
  $('#wsProjects').innerHTML=P.map(([n,c,p])=>`<div class="lrow"><span class="badge sq" style="--c:${TAGC[n]||'#14b8a6'};width:32px;height:32px">${ic('folder',15)}</span><div class="res-t">${esc(n)}<em>${c} task${c===1?'':'s'}</em><div class="bar-track"><i style="width:${p}%"></i></div></div><small>${p}%</small></div>`).join('')||'<div class="empty">No tasks yet. Add one on the project board.</div>';
  const sv=S.d.saved.map(byName).filter(Boolean);
  $('#savedGrid').innerHTML=sv.length?sv.map(cardHTML).join(''):`<div class="empty glass" style="grid-column:1/-1">No saved tools yet. <button class="link" data-go="discover">Explore the directory ${ic('arrow',13)}</button></div>`;
  $('#notes').innerHTML=S.d.notes.map(n=>`<div class="glass note" data-note="${n.id}"><div class="note-t" contenteditable="true" data-nf="t">${esc(n.t)}</div><div class="note-b" contenteditable="true" data-nf="b">${esc(n.b)}</div><div class="tc-f"><span class="muted-sm">${ago(n.at)}</span><button class="go-sm" data-delnote="${n.id}" title="Delete note">${ic('trash',14)}</button></div></div>`).join('')||'<div class="empty glass">No notes yet.</div>';
}
$('#wsStats').addEventListener('click',e=>{const b=e.target.closest('[data-wtab-go]');if(b)setWTab(b.dataset.wtabGo)});
$('#notes').addEventListener('focusout',e=>{const f=e.target.closest('[data-nf]');if(!f)return;const n=S.d.notes.find(x=>x.id===+f.closest('[data-note]').dataset.note);n[f.dataset.nf]=f.textContent.trim();n.at=Date.now();S.save()});
$('#notes').addEventListener('click',e=>{const d=e.target.closest('[data-delnote]');if(!d)return;S.d.notes=S.d.notes.filter(x=>x.id!==+d.dataset.delnote);S.save();renderWorkspace();toast('Note deleted','trash')});
$('#newNote').onclick=()=>{const id=Math.max(0,...S.d.notes.map(n=>n.id))+1;S.d.notes.unshift({id,t:'Untitled note',b:'Start writing…',at:Date.now()});S.save();log('Created a note','file');setWTab('notes');const t=$(`[data-note="${id}"] .note-t`);t.focus();getSelection().selectAllChildren(t)};
ENTER.workspace=()=>setWTab(wsTab);

/* ---------- scenes for new pages ---------- */
Object.assign(SCN,{discover:{...SCN.insights,seed:41,planet:true},projects:{...SCN.builder,seed:53},community:{...SCN.home,seed:61},learn:{...SCN.insights,seed:71,trees:1},workspace:{...SCN.builder,seed:83,planet:true}});
const PAGE_SCENES={community:[quoteS]};
addEventListener('resize',()=>quoteS.size());

