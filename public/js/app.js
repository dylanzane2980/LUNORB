const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
if(/still/.test(location.search))document.documentElement.classList.add('still');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ---------- icons ---------- */
const P={
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
 arrow:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
 up:'<path d="M12 19V5M5 12l7-7 7 7"/>',
 down:'<path d="m6 9 6 6 6-6"/>',
 chev:'<path d="m9 18 6-6-6-6"/>',
 sparkle:'<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>',
 sparkles:'<path d="M12 3l1.6 5L19 10l-5.4 2L12 17l-1.6-5L5 10l5.4-2z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
 folder:'<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>',
 flow:'<circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M10.5 7.6 6.5 16.4M13.5 7.6l4 8.8"/>',
 chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
 globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
 playsq:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m10 8 6 4-6 4z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 pencil:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
 play:'<path d="m6 3 14 9-14 9z"/>',
 kebab:'<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
 dots:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 cube:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
 zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
 link:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
 chart:'<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
 check:'<path d="M20 6 9 17l-5-5"/>',
 trend:'<path d="M7 17 17 7M8 7h9v9"/>',
 layout:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
 mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 0 1-14 0M12 17v5"/>',
 send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
 sum:'<path d="M4 6h16M4 12h10M4 18h7"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
 code:'<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
 music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 cart:'<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/>',
 shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
 heart:'<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
 book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/><path d="M6.5 17A2.5 2.5 0 0 0 4 19.5 2.5 2.5 0 0 0 6.5 22H20v-5"/>',
 scale:'<path d="M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0zM8 21h8"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 server:'<rect x="2" y="3" width="20" height="8" rx="2"/><rect x="2" y="13" width="20" height="8" rx="2"/><path d="M6 7h.01M6 17h.01"/>',
 grid:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
 star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
 ext:'<path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
 menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
 target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
 cap:'<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
 layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
 flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.4 1.5 1.5 2.8 2.5 2.8z"/>',
 cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 bookmark:'<path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
 filter:'<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
 minus:'<path d="M5 12h14"/>',
 expand:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
 branch:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6 7v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7M12 12v5"/>',
 logout:'<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 16l4-4-4-4M20 12H10"/>',
 card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
 lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'
};
const ic=(n,s=20)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${P[n]||''}</svg>`;
/* ---------- brand logos: Google favicon (128px) → DuckDuckGo → monogram ---------- */
const DOMAINS={Claude:'claude.ai',Midjourney:'midjourney.com','Notion AI':'notion.so',Figma:'figma.com',Runway:'runwayml.com',Perplexity:'perplexity.ai',ElevenLabs:'elevenlabs.io',Cursor:'cursor.com',Gamma:'gamma.app'};
function logoHTML(t,s=40,cls=''){
  const host=(t.url||DOMAINS[t.n]||'').split('/')[0];
  const mono=`<span>${t.m}</span>`;
  return`<div class="mono logo ${cls}" style="width:${s}px;height:${s}px;font-size:${Math.round(s*.42)}px;--g1:${t.g[0]};--g2:${t.g[1]}">${mono}${host?`<img src="https://www.google.com/s2/favicons?domain=${host}&sz=128" data-h="${host}" alt="" loading="lazy" decoding="async" onload="logoOk(this)" onerror="logoFail(this)">`:''}</div>`;
}
function logoOk(img){if(img.naturalWidth<(img.dataset.f?24:32))return logoFail(img);img.parentNode.classList.add('has-img')}
function logoFail(img){if(!img.dataset.f){img.dataset.f=1;img.src=`https://icons.duckduckgo.com/ip3/${img.dataset.h}.ico`}else img.remove()}
const hydrate=(r=document)=>$$('[data-ic]',r).forEach(el=>{el.innerHTML=ic(el.dataset.ic,+el.dataset.s||20);el.removeAttribute('data-ic')});

/* ---------- data ---------- */
const TOOLS=[
 {n:'Claude',c:'Writing',t:'Just now',m:'✺',g:['#f97316','#c2410c']},
 {n:'Midjourney',c:'Images',t:'2 hours ago',m:'M',g:['#64748b','#1e293b']},
 {n:'Notion AI',c:'Productivity',t:'5 hours ago',m:'N',g:['#e5e7eb','#6b7280']},
 {n:'Figma',c:'Design',t:'1 day ago',m:'F',g:['#a855f7','#ef4444']},
 {n:'Runway',c:'Video',t:'2 days ago',m:'R',g:['#0ea5e9','#1e3a8a']},
 {n:'Perplexity',c:'Research',t:'3 days ago',m:'P',g:['#14b8a6','#0f766e']},
 {n:'ElevenLabs',c:'Audio',t:'4 days ago',m:'E',g:['#f43f5e','#7c3aed']},
 {n:'Cursor',c:'Code',t:'1 week ago',m:'C',g:['#3b82f6','#111827']},
 {n:'Gamma',c:'Slides',t:'1 week ago',m:'G',g:['#eab308','#db2777']}
];
function monoFor(n){let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))>>>0;const hue=h%360;return{n,m:n.replace(/[^A-Za-z0-9]/g,'')[0]?.toUpperCase()||'•',g:[`hsl(${hue} 78% 60%)`,`hsl(${(hue+40)%360} 70% 28%)`]}}
const tool=n=>{try{const t=byName(n);if(t)return t}catch{}return TOOLS.find(t=>t.n===n)||monoFor(n)};
const stepOf=k=>typeof k==='string'?LIB[k]:k;
const LIB={
 research:{i:'globe',t:'Research',d:'Gather market insights and trends',tool:'Perplexity',c:'#3b82f6',r:'14 sources · 6 trends found'},
 visuals:{i:'image',t:'Generate Visuals',d:'Create images and moodboards',tool:'Midjourney',c:'#6366f1',r:'12 images · 2 moodboards'},
 copy:{i:'file',t:'Write Copy',d:'Generate headlines and messaging',tool:'Claude',c:'#f97316',r:'8 headlines · 3 taglines'},
 video:{i:'playsq',t:'Create Assets',d:'Turn concepts into short videos',tool:'Runway',c:'#06b6d4',r:'3 clips · 0:45 total'},
 analyze:{i:'chart',t:'Analyze Data',d:'Find patterns and key metrics',tool:'Claude',c:'#a78bfa',r:'5 segments · 9 insights'},
 design:{i:'layout',t:'Design Layout',d:'Compose pages and social posts',tool:'Figma',c:'#ec4899',r:'6 frames ready'},
 voice:{i:'mic',t:'Generate Voiceover',d:'Narrate scripts naturally',tool:'ElevenLabs',c:'#f43f5e',r:'1 track · 0:42'},
 summarize:{i:'sum',t:'Summarize',d:'Condense into a crisp brief',tool:'Claude',c:'#f59e0b',r:'1-page brief'},
 publish:{i:'send',t:'Publish & Schedule',d:'Queue content across channels',tool:'Notion AI',c:'#10b981',r:'9 posts scheduled'}
};
const TPL={
 brand:{n:'Brand Campaign Generator',d:'Generate a complete brand campaign from a simple prompt',s:['research','visuals','copy','video'],par:[2],k:/brand|campaign/},
 launch:{n:'Product Launch Kit',d:'Everything you need to ship a launch announcement',s:['research','copy','design','video','publish'],par:[3],k:/launch|release|ship/},
 pipeline:{n:'Content Engine',d:'Research, write and publish content on autopilot',s:['research','copy','visuals','publish'],par:[2],k:/content|blog|newsletter|pipeline/},
 report:{n:'Research Report',d:'Deep research condensed into an executive brief',s:['research','analyze','copy','summarize'],k:/report|research|brief/},
 audience:{n:'Audience Analyzer',d:'Understand who your audience is and what they want',s:['research','analyze','visuals'],k:/audience|data|analy|customer/},
 video:{n:'Idea to Video',d:'Turn a concept into a narrated short video',s:['copy','visuals','voice','video'],par:[2],k:/video|reel|tiktok|youtube|short/}
};
const CHIPS=[['Brand campaign','brand'],['Product launch','launch'],['Content pipeline','pipeline'],['Research report','report'],['Custom',null]];

/* ---------- toast ---------- */
let toastT;
function toast(msg,icon='check'){const t=$('#toast');t.innerHTML=`<span style="color:var(--green)">${ic(icon,16)}</span>${msg}`;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2600)}

/* ---------- router ---------- */
let cur=null;
function go(name,opts={}){
  if(!$('#p-'+name))name='home';
  if(cur!==name){
    $$('.page').forEach(p=>p.classList.toggle('on',p.id==='p-'+name));
    if(cur)scrollTo({top:0,behavior:reduced?'auto':'smooth'});cur=name;
    if(location.hash.slice(1)!==name)history.replaceState(null,'','#'+name);
    ENTER[name]&&ENTER[name]();sceneFor(name);
  }
  $$('.links a').forEach(a=>a.classList.toggle('on',a.dataset.go===name&&!a.hasAttribute('data-focus')));
  if(opts.tab)(TABS[name]||setTab)(opts.tab);
  if(opts.focus)setTimeout(()=>$('#q').focus(),350);
}
addEventListener('hashchange',()=>go(location.hash.slice(1)));
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');
  if(g){e.preventDefault();go(g.dataset.go,{tab:g.dataset.tab,focus:g.hasAttribute('data-focus')});$$('.pop').forEach(m=>m.classList.remove('on'));$('#links').classList.remove('open')}
  const t=e.target.closest('[data-tpl]');
  if(t){loadTpl(t.dataset.tpl);go('builder',{tab:'builder'})}
  if(!e.target.closest('.menu,.conn button,.sel,.pop-wrap'))$$('.menu').forEach(m=>m.classList.remove('on'));
  if(!e.target.closest('.search'))$('#results').classList.remove('on');
});
document.addEventListener('mousemove',e=>{
  const c=e.target.closest('.glow');
  if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}
});
document.addEventListener('keydown',e=>{
  const typing=/INPUT|TEXTAREA/.test(document.activeElement.tagName)||document.activeElement.isContentEditable;
  if((e.key==='/'&&!typing)||(e.key==='k'&&(e.metaKey||e.ctrlKey))){e.preventDefault();openPalette()}
  if(e.key==='Escape'){closeOverlays();$$('.menu').forEach(m=>m.classList.remove('on'));$('#results').classList.remove('on');document.activeElement.blur()}
});
$('#navSearch').onclick=()=>openPalette();
const ENTER={},TABS={};

/* ---------- home ---------- */
const h=new Date().getHours();
$('#greet').textContent=h<5?'Still up?':h<12?'Good morning':h<18?'Good afternoon':'Good evening';
const q=$('#q'),res=$('#results');let sel=-1,items=[];
function renderResults(){
  const v=q.value.trim().toLowerCase();
  const tl=v?searchTools(v,6):FEATURED.slice(0,5);
  const cl=v?CATS.filter(c=>c.name.toLowerCase().includes(v)||c.short.toLowerCase().includes(v)).slice(0,3):[];
  const pl=v?searchPlaybooks(v,3):[PBX.meals,PBX.inbox,PBX.trip];
  const wl=Object.entries(TPL).filter(([k,t])=>!v||t.n.toLowerCase().includes(v)||t.k.test(v)).slice(0,3);
  items=[...pl.map(p=>({type:'pb',p})),...tl.map(t=>({type:'tool',t})),...cl.map(c=>({type:'cat',c})),...wl.map(([k,t])=>({type:'tpl',k,t}))];
  if(v)items.push({type:'gen',v:q.value.trim()});
  let html='',i=0;
  if(pl.length)html+=`<div class="res-h">${v?'Guided playbooks':'Popular everyday playbooks'}</div>`+pl.map(p=>`<div class="res" data-i="${i++}"><div class="badge sq" style="--c:${AREAS[p.a][2]};width:28px;height:28px">${ic(AREAS[p.a][1],14)}</div><div class="res-t">${p.t}<em>${p.d}</em></div><small>~${p.min} min saved</small></div>`).join('');
  if(tl.length)html+=`<div class="res-h">${v?'Tools':'Popular tools'}</div>`+tl.map(t=>`<div class="res" data-i="${i++}">${logoHTML(t,28)}<div class="res-t">${t.n}<em>${t.best||''}</em></div><small>${t.c}</small></div>`).join('');
  if(cl.length)html+='<div class="res-h">Categories</div>'+cl.map(c=>`<div class="res" data-i="${i++}"><div class="badge sq" style="--c:${c.color};width:28px;height:28px">${ic(c.icon,14)}</div>${c.name}<small>${c.count} tools</small></div>`).join('');
  if(wl.length)html+='<div class="res-h">Workflows</div>'+wl.map(([k,t])=>`<div class="res" data-i="${i++}"><span style="color:#b49bff">${ic('flow',18)}</span>${t.n}<small>${t.s.length} steps</small></div>`).join('');
  if(v)html+=`<div class="res-h">Build</div><div class="res" data-i="${i++}"><span style="color:#8fb6ff">${ic('sparkle',18)}</span>Build a workflow for “${q.value.trim().replace(/</g,'&lt;')}”<small>↵</small></div>`;
  res.innerHTML=html||'<div class="empty">No matches</div>';
  sel=-1;res.classList.add('on');
}
function pick(it){
  if(!it)return;res.classList.remove('on');
  if(it.type==='pb')openPlaybook(it.p.id);
  else if(it.type==='tool')openTool(it.t.n);
  else if(it.type==='cat')discoverCat(it.c.i);
  else if(it.type==='tpl'){loadTpl(it.k);go('builder',{tab:'builder'})}
  else{generate(it.v);go('builder',{tab:'builder'})}
}
q.addEventListener('input',renderResults);q.addEventListener('focus',renderResults);
q.addEventListener('keydown',e=>{
  const rows=$$('.res',res);
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length;rows.forEach((r,i)=>r.classList.toggle('sel',i===sel));rows[sel]?.scrollIntoView({block:'nearest'})}
  if(e.key==='Enter'){e.preventDefault();pick(sel>=0?items[sel]:items.find(i=>i.type==='gen')||items[0])}
});
res.addEventListener('click',e=>{const r=e.target.closest('[data-i]');if(r)pick(items[+r.dataset.i])});
$('#qGo').onclick=()=>q.value.trim()?pick({type:'gen',v:q.value.trim()}):q.focus();

/* ---------- builder ---------- */
let wf={n:'',d:'',s:[]},running=false,flowZoom=1;
const tplSteps=t=>t.s.map((x,i)=>t.par&&t.par.includes(i)?{...LIB[x],par:true}:x);
function loadTpl(k){const t=TPL[k];wf={n:t.n,d:t.d,s:tplSteps(t)};renderFlow()}
function generate(text){
  const v=text.toLowerCase();
  const hit=Object.entries(TPL).find(([k,t])=>t.k.test(v));
  let s;
  if(hit)s=tplSteps(hit[1]);
  else{
    s=['research'];
    if(/data|metric|analy|audience|survey/.test(v))s.push('analyze');
    if(/write|copy|post|email|story|script|blog|caption/.test(v)||s.length<2)s.push('copy');
    if(/image|visual|logo|design|poster|art|photo/.test(v))s.push('visuals');
    if(/podcast|voice|audio|narrat/.test(v))s.push('voice');
    if(/video|reel|ad|film|clip/.test(v))s.push('video');
    if(/post|social|schedule|publish/.test(v))s.push('publish');
  }
  const words=text.replace(/[^\w\s]/g,'').split(/\s+/).filter(Boolean).slice(0,4).map(w=>w[0].toUpperCase()+w.slice(1));
  wf={n:(words.join(' ')||'Custom')+' Workflow',d:`Generated from: “${text}”`,s};
  renderFlow();toast(`Built a ${s.length}-step workflow`,'sparkle');
}
// a step with par:true runs alongside the step above it; consecutive parallel steps form one stage
function stagesOf(steps){const st=[];steps.forEach((k,i)=>{if(i&&stepOf(k).par)st[st.length-1].push(i);else st.push([i])});return st}
// removing a stage's first step must not merge its parallel siblings into the stage above
function removeStep(i){const n=wf.s[i+1];if(n&&!stepOf(wf.s[i]).par&&stepOf(n).par)wf.s[i+1]={...stepOf(n),par:false};wf.s.splice(i,1)}
function nodeHTML(k,i){
  const L=stepOf(k),T=tool(L.tool);
  return `<div class="node" data-n="${i}">
    <div class="badge sq" style="--c:${L.c};width:40px;height:40px">${ic(L.i,19)}</div>
    <div style="min-width:0"><div class="tt"><span class="num">${i+1}</span>${esc(L.t)}</div><div class="dd">${esc(L.d)}</div><div class="res-line">✓ ${L.r&&L.r!=='Step complete'?'Produces '+esc(L.r):'Ready'}</div></div>
    <div class="tl">${logoHTML(T,22,'mini')}<span>${esc(T.n)}</span><button class="kebab" data-del="${i}" title="Remove step">${ic('kebab',16)}</button></div>
  </div>`;
}
const conn=at=>`<div class="conn" data-c="${at}"><button data-add="${at}" title="Add step">${ic('plus',12)}</button></div>`;
function renderFlow(){
  $('#wfName').textContent=wf.n;$('#wfDesc').textContent=wf.d;
  let h=`<div class="node io" data-n="in"><div class="badge sq" style="--c:#14b8a6;width:40px;height:40px">${ic('chat',19)}</div><div><div class="tt">Input</div><div class="dd">What you want to get done</div></div><div class="tl">Your task ${ic('pencil',14)}</div></div>`;
  stagesOf(wf.s).forEach(g=>{h+=conn(g[0])+(g.length>1
    ?`<div class="stage par" style="--n:${g.length}"><span class="stage-tag">${ic('branch',12)} Runs in parallel</span>${g.map(i=>`<div class="branch"><i class="stub"></i>${nodeHTML(wf.s[i],i)}<i class="stub grow"></i></div>`).join('')}</div>`
    :nodeHTML(wf.s[g[0]],g[0]))});
  h+=conn(wf.s.length)+`<div class="node io" data-n="out"><div class="badge sq" style="--c:#14b8a6;width:40px;height:40px">${ic('sparkles',19)}</div><div><div class="tt">Output</div><div class="dd" id="outD">Results from every step</div></div><div class="tl"><span id="outR">Checklist + notes</span> ${ic('chev',14)}</div></div>`;
  $('#flow').innerHTML=`<div class="flow-inner" style="zoom:${flowZoom}">${h}</div>
    <div class="zoom" role="group" aria-label="Zoom"><button data-zoom="-1" aria-label="Zoom out">${ic('minus',14)}</button><span>${Math.round(flowZoom*100)}%</span><button data-zoom="1" aria-label="Zoom in">${ic('plus',14)}</button><button data-zoom="0" aria-label="Reset zoom">${ic('expand',14)}</button></div>`;
}
$('#flow').addEventListener('click',e=>{
  const z=e.target.closest('[data-zoom]');
  if(z){const v=+z.dataset.zoom;flowZoom=v?Math.min(1.3,Math.max(.6,Math.round((flowZoom+v*.1)*10)/10)):1;renderFlow();return}
  if(running)return;
  const a=e.target.closest('[data-add]'),d=e.target.closest('[data-del]');
  if(a){
    const m=$('#stepMenu'),r=a.getBoundingClientRect(),pr=$('#p-builder').getBoundingClientRect(),at=+a.dataset.add;m.dataset.addmode='next';
    m.innerHTML=`<div class="res-h">Add a step</div><div class="seg add-mode"><button class="on" data-mode="next">Next step</button><button data-mode="par" ${at?'':'disabled'} title="Runs at the same time as the step above">${ic('branch',12)} Parallel branch</button></div>`
      +Object.entries(LIB).map(([k,L])=>`<div class="res" data-pick="${k}" data-at="${at}"><div class="badge sq" style="--c:${L.c};width:28px;height:28px">${ic(L.i,14)}</div>${L.t}<small>${L.tool}</small></div>`).join('');
    m.style.left=Math.min(r.left-pr.left+30,pr.width-260)+'px';m.style.top=(r.top-pr.top-20)+'px';m.classList.add('on');
  }
  if(d){
    if(wf.s.length<=1)return toast('A workflow needs at least one step','x');
    const name=stepOf(wf.s[+d.dataset.del]).t;removeStep(+d.dataset.del);renderFlow();toast(`Removed “${esc(name)}”`,'trash');
  }
});
$('#stepMenu').addEventListener('click',e=>{
  const md=e.target.closest('button[data-mode]');
  if(md){if(!md.disabled){$('#stepMenu').dataset.addmode=md.dataset.mode;$$('#stepMenu [data-mode]').forEach(b=>b.classList.toggle('on',b===md))}return}
  const p=e.target.closest('[data-pick]');if(!p)return;
  const at=+p.dataset.at,par=$('#stepMenu').dataset.addmode==='par'&&at>0,L=LIB[p.dataset.pick];
  wf.s.splice(at,0,par?{...L,par:true}:p.dataset.pick);renderFlow();$('#stepMenu').classList.remove('on');toast(par?`Added “${L.t}” as a parallel branch`:`Added “${L.t}”`,par?'branch':'plus')});
$('#run').onclick=async()=>{
  if(running)return;running=true;renderFlow();
  const btn=$('#run');btn.innerHTML='<span class="spin"></span> Previewing';
  const conns=$$('#flow .conn'),node=n=>$(`#flow .node[data-n="${n}"]`),st=stagesOf(wf.s);
  node('in').classList.add('done');
  for(let k=0;k<st.length;k++){
    conns[k].classList.add('flow');
    const ns=st[k].map(node);ns[0].closest('.stage')?.classList.add('flow');
    ns.forEach(n=>{n.classList.add('running');n.querySelector('.kebab').outerHTML='<span class="spin"></span>'});
    ns[0].scrollIntoView({block:'nearest',behavior:'smooth'});
    await sleep(reduced?150:800+Math.random()*700);
    ns.forEach(n=>{n.classList.remove('running');n.classList.add('done');n.querySelector('.spin').outerHTML=`<span style="color:var(--green)">${ic('check',16)}</span>`});
  }
  conns[st.length].classList.add('flow');
  const out=node('out');out.classList.add('running');await sleep(500);out.classList.remove('running');out.classList.add('done');
  $('#outR').textContent='Preview complete';$('#outD').textContent='Press Run guided to do each step for real';
  btn.innerHTML=ic('eye',14)+' Preview';running=false;toast(`Previewed ${st.length} stage${st.length===1?'':'s'} of “${esc(wf.n)}”`,'eye');
};
$('#editName').onclick=()=>{const n=$('#wfName');n.contentEditable=true;n.focus();getSelection().selectAllChildren(n)};
$('#wfName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.target.blur()}});
$('#wfName').addEventListener('blur',e=>{e.target.contentEditable=false;wf.n=e.target.textContent.trim()||'Untitled Workflow';e.target.textContent=wf.n});
// local workflow store; cloud.js swaps get/remove for the signed-in user's Supabase rows
const store={get(){try{return JSON.parse(localStorage.getItem('lunorb.wf')||'[]')}catch{return[]}},set(v){try{localStorage.setItem('lunorb.wf',JSON.stringify(v))}catch{}},
  remove(i){const a=this.get();a.splice(i,1);this.set(a)}};
$('#save').onclick=()=>{const all=store.get().filter(w=>w.n!==wf.n);all.unshift({...wf,at:Date.now()});store.set(all);toast(`Saved “${wf.n}”`)};
$('#share').onclick=()=>{const url=location.href.split('#')[0]+'#builder';navigator.clipboard?.writeText(url).catch(()=>{});toast('Share link copied','link')};
$('#newWf').onclick=()=>{wf={n:'Untitled Workflow',d:'Describe it below or add steps with +',s:['research']};setTab('builder');renderFlow();$('#wfPrompt').focus()};
$('#chips').innerHTML=CHIPS.map(([l,k])=>`<button class="chip" data-chip="${k||''}">${l}</button>`).join('');
$('#chips').addEventListener('click',e=>{const c=e.target.closest('[data-chip]');if(!c)return;if(c.dataset.chip)loadTpl(c.dataset.chip);else{$('#wfPrompt').focus()}});
const submitPrompt=()=>{const v=$('#wfPrompt').value.trim();if(!v)return $('#wfPrompt').focus();generate(v);$('#wfPrompt').value=''};
$('#wfGo').onclick=submitPrompt;$('#wfPrompt').addEventListener('keydown',e=>{if(e.key==='Enter')submitPrompt()});

function setTab(name){
  $$('#p-builder .tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===name));
  ['builder','templates','library','mine','integrations'].forEach(n=>$('#tab-'+n).hidden=n!==name);
  if(name==='mine')renderMine();
  if(name==='library')renderLib();
}
$$('#p-builder .tab').forEach(t=>t.onclick=()=>setTab(t.dataset.tab));
$('#tplGrid').innerHTML=Object.entries(TPL).map(([k,t],i)=>`
  <button class="glass glow tpl" data-tpl="${k}"><div class="badge sq" style="--c:${LIB[t.s[1]||t.s[0]].c}">${ic('flow',20)}</div>
  <h4>${t.n}</h4><p>${t.d}</p><div class="steps">${t.s.map(s=>`<span class="pill" style="margin:0">${LIB[s].t}</span>`).join('')}</div></button>`).join('');
function renderMine(){
  const all=store.get();
  $('#mineList').innerHTML=all.length?all.map((w,i)=>`<div class="res mine-row" data-load="${i}"><span style="color:#b49bff">${ic('flow',18)}</span><div class="res-t">${esc(w.n)}${w.pub?' <span class="pill pub">Public</span>':''}<em>${w.s.length} steps · saved ${new Date(w.at).toLocaleString()}</em></div>
    <button class="go-sm del" data-delwf="${i}" title="Delete workflow" aria-label="Delete ${esc(w.n)}">${ic('trash',14)}</button><small>Open ${ic('chev',12)}</small></div>`).join(''):'<div class="empty">No saved workflows yet — hit <b>Save</b> in the builder.</div>';
}
$('#mineList').addEventListener('click',async e=>{
  const d=e.target.closest('[data-delwf]');
  if(d){e.stopPropagation();if(!d.classList.contains('confirm')){d.classList.add('confirm');d.innerHTML='Delete?';return}
    const name=store.get()[+d.dataset.delwf]?.n;await store.remove(+d.dataset.delwf);renderMine();toast(`Deleted “${esc(name||'workflow')}”`,'trash');return}
  const r=e.target.closest('[data-load]');if(!r)return;const w=store.get()[+r.dataset.load];wf={id:w.id,n:w.n,d:w.d,input:w.input||'',s:w.s};renderFlow();setTab('builder')});
const on=new Set(['Claude','Midjourney','Notion AI','Figma','Runway','Perplexity']);
$('#intGrid').innerHTML=TOOLS.map(t=>`<div class="glass glow tpl" style="display:flex;align-items:center;gap:14px">${logoHTML(t,40)}<div><h4 style="margin:0">${t.n}</h4><p>${t.c}</p></div><button class="switch ${on.has(t.n)?'on':''}" data-sw="${t.n}" aria-label="Toggle ${t.n}"></button></div>`).join('');
$('#intGrid').addEventListener('click',e=>{const s=e.target.closest('[data-sw]');if(!s)return;s.classList.toggle('on');toast(`${s.dataset.sw} ${s.classList.contains('on')?'connected':'disconnected'}`,'link')});

/* ---------- insights ---------- */
const ins={range:30,mode:'daily'};
let INS_CATS=[];
function countUp(root){
  $$('[data-count]',root).forEach(el=>{
    const end=+el.dataset.count,suf=el.dataset.suf||'',pre=el.dataset.pre||'',st=performance.now(),dur=reduced?1:1300;
    const step=n=>{const k=Math.min(1,(n-st)/dur),e=1-Math.pow(1-k,3);el.textContent=pre+Math.round(end*e)+suf;if(k<1)requestAnimationFrame(step)};
    requestAnimationFrame(step);
  });
}
function renderInsights(){
  const D=S.d.daily||{},N=ins.range,ago=o=>{const d=new Date();d.setDate(d.getDate()-o);return d};
  const span=(from,to)=>{const t={u:0,g:0,m:0};for(let o=from;o<to;o++){const e=D[dayKey(ago(o))];if(e){t.u+=e.u;t.g+=e.g;t.m+=e.m}}return t};
  const cur=span(0,N),prev=span(N,2*N),time=m=>m>=120?[Math.round(m/60),'h']:[m,' min'],[tv,ts]=time(cur.m);
  const delta=(c,p)=>p>0?`${c>=p?'+':''}${Math.round((c-p)/p*100)}%`:c>0?'New':'';
  const K=[['cube','#4c8dff',cur.u,'Tools explored','',delta(cur.u,prev.u)],['flow','#14b8a6',store.get().length,'Saved workflows','',null],['check','#a855f7',cur.g,'Guided steps done','',delta(cur.g,prev.g)],['clock','#eab308',tv,'Time saved (est.)',ts,delta(cur.m,prev.m)]];
  $('#kpis').innerHTML=K.map(([i,c,v,l,s,d],n)=>`<div class="glass glow kpi" data-a style="--d:${4+n}"><div class="badge sq" style="--c:${c};width:42px;height:42px">${ic(i,20)}</div><div class="v" data-count="${v}" data-suf="${s}">0</div><div class="l">${l}</div>${d?`<div class="delta">${d} ${ic('trend',13)}</div>`:`<div class="delta muted">${d===null?'All time':`vs. previous ${N} days`}</div>`}</div>`).join('');
  let pts=Array.from({length:N},(_,i)=>{const e=D[dayKey(ago(N-1-i))]||{u:0,g:0};return{u:e.u,g:e.g}});
  let labels=pts.map((_,i)=>ago(N-1-i));
  if(ins.mode==='weekly'){
    const w=[],wl=[];for(let i=0;i<pts.length;i+=7){const c=pts.slice(i,i+7);w.push({u:c.reduce((a,b)=>a+b.u,0),g:c.reduce((a,b)=>a+b.g,0)});wl.push(labels[i])}
    pts=w;labels=wl;
  }
  const max=Math.max(4,Math.ceil(Math.max(...pts.map(p=>Math.max(p.u,p.g)))/4)*4);
  $('#yax').innerHTML=[0,.25,.5,.75,1].map(f=>`<span>${Math.round(max*f)}</span>`).join('');
  $('#bars').innerHTML=pts.map((p,i)=>`<div class="grp" data-i="${i}"><div class="bar u" style="height:${p.u/max*100}%;--i:${i}"></div><div class="bar g" style="height:${p.g/max*100}%;--i:${i}"></div></div>`).join('')
    +(pts.some(p=>p.u||p.g)?'':'<div class="chart-empty">No activity in this period yet. Open tools or run a playbook and it shows up here.</div>');
  const fmt=d=>d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
  const step=Math.max(1,Math.floor((labels.length-1)/4));
  $('#xax').innerHTML=labels.filter((_,i)=>i%step===0).slice(0,5).map(d=>`<span>${fmt(d)}</span>`).join('');
  const bars=$('#bars'),tip=$('#tip');
  bars.onmousemove=e=>{const g=e.target.closest('.grp');if(!g){tip.style.opacity=0;return}const i=+g.dataset.i,p=pts[i],r=g.getBoundingClientRect(),pr=bars.getBoundingClientRect();
    tip.innerHTML=`<div style="color:var(--muted);margin-bottom:3px">${ins.mode==='weekly'?'Week of ':''}${fmt(labels[i])}</div><span style="color:#8fb6ff">●</span> ${p.u} tools &nbsp; <span style="color:#5eea9a">●</span> ${p.g} steps`;
    tip.style.left=(r.left-pr.left+r.width/2)+'px';tip.style.top=(pr.bottom-pr.top-Math.max(p.u,p.g)/max*(pr.height))+'px';tip.style.opacity=1};
  bars.onmouseleave=()=>tip.style.opacity=0;
  const CU=Object.entries(S.d.catUse||{}).sort((a,b)=>b[1]-a[1]),total=CU.reduce((a,[,v])=>a+v,0);
  const top=CU.slice(0,5),rest=CU.slice(5).reduce((a,[,v])=>a+v,0);
  INS_CATS=top.map(([ci,v])=>[CATS[ci].short,Math.round(v/total*100),CATS[ci].color]);if(rest)INS_CATS.push(['Other',Math.round(rest/total*100),'#64748b']);
  const C=2*Math.PI*46;let acc=0;
  $('#donut').innerHTML=`<circle cx="60" cy="60" r="46" fill="none" stroke="rgba(130,170,255,.08)" stroke-width="14"/>`+INS_CATS.map(([n,v,c],i)=>{const len=v/100*C,s=`<circle class="s" data-icat="${i}" cx="60" cy="60" r="46" stroke="${c}" stroke-dasharray="0 ${C}" data-len="${Math.max(0,len-2.5)}" stroke-dashoffset="${-acc}" style="filter:drop-shadow(0 0 4px ${c}88)"/>`;acc+=len;return s}).join('');
  requestAnimationFrame(()=>requestAnimationFrame(()=>$$('#donut .s').forEach(s=>s.style.strokeDasharray=`${s.dataset.len} ${C}`)));
  $('#dVal').dataset.count=total;$('#dLbl').textContent='Tools explored';
  $('#cats').innerHTML=INS_CATS.map(([n,v,c],i)=>`<div data-icat="${i}"><i style="background:${c};box-shadow:0 0 8px ${c}"></i>${n}<span>${v}%</span></div>`).join('')||'<p class="muted-sm">Categories you explore will appear here.</p>';
  const allM=Object.values(D).reduce((a,e)=>a+e.m,0),[av,as]=time(allM);
  const finished=Object.entries(S.d.runs||{}).filter(([k,r])=>k.startsWith('pb:')&&PBX[k.slice(3)]&&r.done.length>=PBX[k.slice(3)].s.length).length;
  $('#impact').innerHTML=[['leaf','#22c55e',av,as,'Time saved (est.)'],['zap','#eab308',finished,'','Playbooks finished'],['users','#a855f7',S.d.saved.length,'','Tools in your stack']].map(([i,c,v,s,l],n)=>`<div class="glass glow imp" data-a style="--d:${11+n*.5}"><div class="badge" style="--c:${c}">${ic(i,20)}</div><div><b data-count="${v}" data-suf="${s}">0</b><span>${l}</span></div></div>`).join('');
  countUp($('#p-insights'));
}
$('#cats').addEventListener('mouseover',e=>{const d=e.target.closest('[data-icat]');if(!d)return;const i=+d.dataset.icat;
  $$('#donut .s').forEach(s=>{s.style.opacity=+s.dataset.icat===i?1:.25;s.style.strokeWidth=+s.dataset.icat===i?17:14});
  $('#dVal').textContent=INS_CATS[i][1]+'%';$('#dLbl').textContent=INS_CATS[i][0]});
$('#cats').addEventListener('mouseleave',()=>{$$('#donut .s').forEach(s=>{s.style.opacity=1;s.style.strokeWidth=14});$('#dVal').textContent=$('#dVal').dataset.count;$('#dLbl').textContent='Tools explored'});
$('#rangeBtn').onclick=()=>$('#rangeMenu').classList.toggle('on');
$('#rangeMenu').addEventListener('click',e=>{const r=e.target.closest('[data-range]');if(!r)return;ins.range=+r.dataset.range;$('#rangeLbl').textContent=r.textContent;$('#rangeMenu').classList.remove('on');renderInsights()});
$('#mode').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(!b)return;ins.mode=b.dataset.mode;$$('#mode button').forEach(x=>x.classList.toggle('on',x===b));renderInsights()});
ENTER.insights=renderInsights;

/* ---------- sky: stars ---------- */
const sky=$('#sky'),sc=sky.getContext('2d');let stars=[],shoot=null,dpr=1;
function sizeSky(){
  dpr=Math.min(devicePixelRatio||1,2);sky.width=innerWidth*dpr;sky.height=innerHeight*dpr;
  const R=rng(42);stars=Array.from({length:Math.floor(innerWidth*innerHeight/2200)},()=>({x:R()*sky.width,y:R()*sky.height*.8,r:(R()**4*1.6+.35)*dpr,p:R()*6.28,s:.4+R()*2.2,b:R()<.12}));
}
function drawSky(t){
  sc.clearRect(0,0,sky.width,sky.height);sc.fillStyle='#e4ecff';
  for(const s of stars){sc.globalAlpha=(s.b?.55:.3)+.45*Math.sin(t*.001*s.s+s.p)*.5+.2;sc.beginPath();sc.arc(s.x,s.y,s.r,0,6.283);sc.fill()}
  const dt=Math.min((t-(drawSky.last||t))/16.7,4);drawSky.last=t;
  if(!shoot&&t>(drawSky.next||2500)){shoot={x:Math.random()*sky.width*.8,y:Math.random()*sky.height*.35,vx:(6+Math.random()*6)*dpr,vy:(2+Math.random()*2)*dpr,l:1};drawSky.next=t+3000+Math.random()*6000}
  if(shoot){const s=shoot,g=sc.createLinearGradient(s.x,s.y,s.x-s.vx*14,s.y-s.vy*14);g.addColorStop(0,`rgba(220,235,255,${s.l})`);g.addColorStop(1,'rgba(220,235,255,0)');
    sc.globalAlpha=1;sc.strokeStyle=g;sc.lineWidth=1.4*dpr;sc.beginPath();sc.moveTo(s.x,s.y);sc.lineTo(s.x-s.vx*14,s.y-s.vy*14);sc.stroke();
    s.x+=s.vx*dt;s.y+=s.vy*dt;s.l-=.018*dt;if(s.l<=0)shoot=null}
  sc.globalAlpha=1;
}

/* ---------- scene: aurora + mountains + lake ---------- */
const HZ=560;
function strip(stops){const c=document.createElement('canvas');c.width=1;c.height=256;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);stops.forEach(([o,col])=>g.addColorStop(o,col));x.fillStyle=g;x.fillRect(0,0,1,256);return c}
const GREEN=strip([[0,'rgba(170,80,255,0)'],[.3,'rgba(170,90,255,.22)'],[.62,'rgba(40,200,150,.38)'],[.9,'rgba(120,255,195,.85)'],[.95,'rgba(80,255,170,.5)'],[1,'rgba(80,255,170,0)']]);
const CYAN=strip([[0,'rgba(90,110,255,0)'],[.35,'rgba(110,120,255,.2)'],[.7,'rgba(40,190,230,.35)'],[.92,'rgba(150,240,255,.9)'],[1,'rgba(150,240,255,0)']]);
const VIOLET=strip([[0,'rgba(220,90,255,0)'],[.4,'rgba(200,110,255,.25)'],[.85,'rgba(170,140,255,.6)'],[1,'rgba(170,140,255,0)']]);
const SCN={
 home:{seed:11,trees:.6,figure:false,r:[
  {u0:.22,u1:1.08,y0:0.65,y1:0.46,amp:.07,f:2.2,h:0.84,a:1,ph:0,sp:1,s:GREEN},
  {u0:.45,u1:1.1,y0:0.54,y1:0.41,amp:.05,f:1.6,h:0.61,a:.7,ph:2,sp:.7,s:VIOLET},
  {u0:.05,u1:.6,y0:0.68,y1:0.62,amp:.05,f:1.4,h:0.54,a:.55,ph:4,sp:.8,s:CYAN}]},
 builder:{seed:23,trees:.3,figure:false,planet:true,r:[
  {u0:.4,u1:1.1,y0:0.52,y1:0.68,amp:.08,f:2,h:0.81,a:.9,ph:1,sp:1,s:GREEN},
  {u0:.55,u1:1.05,y0:0.44,y1:0.53,amp:.05,f:1.5,h:0.68,a:.8,ph:3,sp:.6,s:VIOLET}]},
 insights:{seed:37,trees:1,figure:false,r:[
  {u0:.3,u1:.95,y0:0.62,y1:0.50,amp:.09,f:2.6,h:0.88,a:1,ph:0,sp:1,s:GREEN},
  {u0:.6,u1:1.1,y0:0.47,y1:0.42,amp:.04,f:1.3,h:0.68,a:.75,ph:2,sp:.7,s:VIOLET},
  {u0:.1,u1:.5,y0:0.56,y1:0.65,amp:.05,f:1.8,h:0.61,a:.5,ph:5,sp:.9,s:CYAN}]},
 cta:{seed:5,trees:.8,figure:true,r:[
  {u0:-.05,u1:1.05,y0:0.68,y1:0.53,amp:.08,f:2.4,h:0.94,a:1.1,ph:0,sp:1.2,s:GREEN},
  {u0:.3,u1:1.05,y0:0.50,y1:0.44,amp:.05,f:1.4,h:0.74,a:.8,ph:2,sp:.8,s:VIOLET}]}
};
function ridgePts(seed,yTop,yBase,rough,levels=11){
  // midpoint displacement with a gentle power curve: varied peaks instead of uniform spikes
  const R=rng(seed);let pts=Array.from({length:9},()=>R());
  for(let l=0;l<levels;l++){const nx=[],d=rough/Math.pow(1.75,l);for(let i=0;i<pts.length-1;i++)nx.push(pts[i],(pts[i]+pts[i+1])/2+(R()-.5)*d);nx.push(pts.at(-1));pts=nx}
  const mn=Math.min(...pts),mx=Math.max(...pts),st=1600/(pts.length-1);
  return pts.map((v,i)=>[i*st,yBase-Math.pow((v-mn)/(mx-mn||1),1.3)*(yBase-yTop)]);
}
const ptsPath=p=>`M0 ${HZ} `+p.map(([x,y])=>`L${x.toFixed(1)} ${y.toFixed(1)}`).join('')+` L1600 ${HZ}Z`;
function ridge(seed,yTop,yBase,rough,levels){return ptsPath(ridgePts(seed,yTop,yBase,rough,levels))}
function trees(seed,dens){
  const R=rng(seed);let d='';
  for(let x=-10;x<1610;){const cl=.5+.5*Math.sin(x*.009+seed)*Math.sin(x*.0037+1);
    if(R()<cl*dens+.06){const h=7+R()*R()*28*(.4+cl),w=h*.36,b=HZ+R()*2;
      for(let k=0;k<3;k++){const ty=b-h*(.12+k*.26),tw=w*(1-k*.27);d+=`M${(x-tw/2).toFixed(1)} ${ty.toFixed(1)}L${x.toFixed(1)} ${(ty-h*.44).toFixed(1)}L${(x+tw/2).toFixed(1)} ${ty.toFixed(1)}Z`}
      d+=`M${(x-.6).toFixed(1)} ${b.toFixed(1)}h1.2v${(-h*.16).toFixed(1)}h-1.2Z`}
    x+=1.5+R()*4.5}
  return d;
}
// Mountains are a real photo: "Snow Dome + Dome Glacier" by Qyd (Wikimedia Commons, CC BY-SA 3.0), with the sky removed and
// graded to moonlight offline (img/mountains-*.webp, also CC BY-SA 3.0). Static bitmaps instead of SVG filters keep the
// aurora and meteors animating smoothly.
const MTN={src:'img/mountains-night.webp',ref:'img/mountains-reflect.webp',x:-120,w:1840,h:236,y:386}; // overscan: the scene's slice scaling crops the sides
function sceneSVG(c){
  const id='s'+c.seed,M=MTN,fx=c.seed%2===0?'transform="translate(1600 0) scale(-1 1)"':''; // even seeds mirror the range for variety
  const fg=ridge(c.seed+13,530,556,.6),tr=`<path d="${trees(c.seed,c.trees)}" fill="#02050d"/>`;
  const photo=(href,y)=>`<image href="${href}" x="${M.x}" y="${y}" width="${M.w}" height="${M.h}" preserveAspectRatio="none" ${fx}/>`;
  return`<defs>
    <linearGradient id="${id}hz2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(70,98,160,0)"/><stop offset="1" stop-color="rgba(70,98,160,.5)"/></linearGradient>
    <linearGradient id="${id}lk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(10,22,48,.3)"/><stop offset="1" stop-color="rgba(3,7,18,.95)"/></linearGradient>
    <linearGradient id="${id}fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a30"/><stop offset="1" stop-color="#050913"/></linearGradient>
    <radialGradient id="${id}hz" cx=".6" cy="1" r=".6"><stop offset="0" stop-color="rgba(60,220,160,.14)"/><stop offset="1" stop-color="rgba(60,220,160,0)"/></radialGradient>
    <radialGradient id="${id}au" cx=".62" cy="0" r=".7"><stop offset="0" stop-color="rgba(110,255,200,.45)"/><stop offset="1" stop-color="rgba(110,255,200,0)"/></radialGradient>
    <clipPath id="${id}below"><rect x="0" y="${HZ}" width="1600" height="${800-HZ}"/></clipPath>
    <mask id="${id}mm" style="mask-type:alpha">${photo(M.src,M.y)}</mask></defs>
  <rect x="0" y="260" width="1600" height="${HZ-260}" fill="url(#${id}hz)"/>
  ${photo(M.src,M.y)}
  <rect x="0" y="${M.y}" width="1600" height="${M.h}" fill="url(#${id}au)" opacity=".22" style="mix-blend-mode:screen" mask="url(#${id}mm)"/>
  <rect x="0" y="470" width="1600" height="${HZ-470}" fill="url(#${id}hz2)" opacity=".55"/>
  <path d="${fg}" fill="url(#${id}fg)"/>${tr}
  <g clip-path="url(#${id}below)">${photo(M.ref,2*HZ-M.y-M.h)}</g>
  <g transform="matrix(1 0 0 -1 0 ${HZ*2})" opacity=".3"><path d="${fg}" fill="url(#${id}fg)"/>${tr}</g>
  <rect x="0" y="${HZ}" width="1600" height="${800-HZ}" fill="url(#${id}lk)"/>
  <rect x="0" y="${HZ-.5}" width="1600" height="1.5" fill="rgba(170,215,255,.1)"/>
  ${[...Array(9)].map((_,i)=>`<rect x="${140+i*150+(i%3)*30}" y="${HZ+14+i*18}" width="${80+i*26}" height=".8" fill="rgba(160,225,255,${.07-i*.006})"/>`).join('')}
  <path d="${(()=>{const R=rng(c.seed+99);let d='M0 800';for(let x=0;x<=1600;x+=24)d+=`L${x} ${(722+R()*22+Math.sin(x*.004)*24).toFixed(1)}`;return d+'L1600 800Z'})()}" fill="#01040b"/>
  ${c.planet?`<defs><radialGradient id="${id}pl" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#3a5a9a"/><stop offset=".45" stop-color="#0f1e44"/><stop offset="1" stop-color="#02050f"/></radialGradient></defs><circle cx="1420" cy="40" r="230" fill="rgba(90,150,255,.08)"/><circle cx="1420" cy="40" r="200" fill="url(#${id}pl)" stroke="rgba(140,190,255,.55)" stroke-width="2" style="filter:drop-shadow(0 0 18px rgba(90,150,255,.6))"/>`:''}${c.figure?`<path d="M1180 742 q40-26 90-20 q30 6 50 20z" fill="#01040b"/><path d="M1243 724l1.5-15 3-5 3 5 1.5 15z M1245 701a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0-5.6 0" fill="#000"/>`:''}`;
}
function makeScene(el,cfg){
  el.innerHTML='<canvas></canvas><svg viewBox="0 0 1600 800" preserveAspectRatio="xMidYMax slice"></svg><div class="shade"></div>';
  const cv=el.querySelector('canvas'),x=cv.getContext('2d'),bl=document.createElement('canvas'),bx=bl.getContext('2d'),svg=el.querySelector('svg'),SC=2;let hz=1,c=cfg;
  function build(n){c=n;svg.innerHTML=sceneSVG(n)}
  function size(){const r=el.getBoundingClientRect();if(!r.width)return;cv.width=Math.round(r.width/SC);cv.height=Math.round(r.height/SC);const s=Math.max(r.width/1600,r.height/800);hz=(r.height-800*s+HZ*s)/SC;bl.width=Math.max(8,cv.width>>3);bl.height=Math.max(8,cv.height>>3)}
  function draw(t){
    const W=cv.width,H=cv.height;if(!W)return;x.clearRect(0,0,W,H);x.globalCompositeOperation='lighter';
    const T=t*.00025;
    for(const r of c.r){
      for(let i=0;i<W;i++){
        const u=i/W,l=(u-r.u0)/(r.u1-r.u0);if(l<=0||l>=1)continue;
        const tt=T*r.sp,edge=Math.pow(Math.sin(Math.PI*l),.8);
        const y=hz*(r.y0+(r.y1-r.y0)*l+r.amp*(Math.sin(l*r.f*Math.PI+tt*2)+.45*Math.sin(l*r.f*3.1*Math.PI-tt*3.3)+.2*Math.sin(l*40+tt*6)));
        const fold=.5+.5*Math.sin(l*8+tt*4+r.ph);
        const rays=(.6+.4*(.5+.5*Math.sin(i*.45+tt*7+Math.sin(i*.05+tt)*6)))*(.75+.25*Math.sin(i*.17-tt*5+r.ph));
        x.globalAlpha=Math.max(0,edge*rays*(.3+.7*fold)*r.a);
        const hh=hz*r.h*(.55+.6*fold);
        x.drawImage(r.s,0,0,1,256,i,y-hh*.92,1.6,hh);
      }
    }
    bx.clearRect(0,0,bl.width,bl.height);bx.drawImage(cv,0,0,bl.width,bl.height);x.globalAlpha=.55;x.drawImage(bl,0,0,W,H);
    x.globalCompositeOperation='lighter';x.globalAlpha=.32;x.save();x.translate(0,2*hz);x.scale(1,-1);x.drawImage(cv,0,0,W,hz,0,0,W,hz);x.restore();
    x.globalCompositeOperation='source-over';x.globalAlpha=1;
  }
  build(cfg);return{size,draw,build};
}
const mainS=makeScene($('#scene'),SCN.home),ctaS=makeScene($('#ctaScene'),SCN.cta);
function sceneFor(name){mainS.build(SCN[name]||SCN.home);requestAnimationFrame(()=>{mainS.size();ctaS.size()})}

/* ---------- loop ---------- */
function resize(){sizeSky();mainS.size();ctaS.size()}
addEventListener('resize',resize);
let visible=true;document.addEventListener('visibilitychange',()=>visible=!document.hidden);
function frame(t){
  if(visible){drawSky(t);if(scrollY<1000)mainS.draw(t);if(cur==='home')ctaS.draw(t+4000);(PAGE_SCENES[cur]||[]).forEach(x=>x.draw(t+2000))}
  if(!reduced)requestAnimationFrame(frame);
}

// boot runs from features.js once every page module is registered
