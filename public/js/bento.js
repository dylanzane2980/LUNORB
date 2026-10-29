/* ---------- Home dashboard: live AI-stack bento (vanilla port of the TechStackBento React component) ---------- */
const BENTO_RGB={indigo:'129, 140, 248',cyan:'34, 211, 238',emerald:'52, 211, 153',fuchsia:'232, 121, 249',amber:'251, 191, 36'};
const BT={SERIES:40,TICK:1200,TERM_VISIBLE:11};
const BT_REGIONS=[['US East',24],['EU West',48],['São Paulo',71],['Singapore',94]];
const BT_SCRIPT=[['cmd','lunorb run trip'],['ok','Playbook loaded · 3 steps'],['cmd','step 1 --tool perplexity'],['info','Researching Lisbon…'],['ok','14 sources in 6.1s'],['cmd','step 2 --tool chatgpt'],['ok','Itinerary drafted'],['cmd','step 3 --tool gemini'],['ok','Places saved to Maps'],['ok','All steps complete'],['url','trip-lisbon.md · ~2h saved']];
const BT_MARK={cmd:['$','m-cmd'],ok:['✓','m-ok'],info:['›','m-info'],url:['●','m-url']};
// brand colours for the hover state of well-known tools; everything else uses its monogram colour
const BT_BRAND={Claude:'#d97757',ChatGPT:'#10a37f',Perplexity:'#20b8cd','Google Gemini':'#5b8def',Midjourney:'#cbd5e1','Notion AI':'#e2e8f0',Runway:'#e2e8f0',Cursor:'#e2e8f0',ElevenLabs:'#e2e8f0','Figma AI':'#a259ff',Gamma:'#a78bfa',Suno:'#f472b6',Lovable:'#f97316'};
const btClamp=(n,a,b)=>Math.min(Math.max(n,a),b);
const btStatus=ms=>ms<60?'good':ms<100?'warn':'bad';
function btSmooth(p){return p.reduce((d,q,i)=>{if(!i)return`M ${q.x} ${q.y}`;const a=p[i-1],m=(a.x+q.x)/2;return`${d} C ${m} ${a.y}, ${m} ${q.y}, ${q.x} ${q.y}`},'')}
// counts from the shown value to a new target; instant when motion is reduced
function btAnimate(el,to,dur=600,fmt=v=>Math.round(v)){
  const from=el.dataset.v==null?to:+el.dataset.v;el.dataset.v=to;cancelAnimationFrame(el._raf);
  if(reduced||document.documentElement.classList.contains('still')){el.textContent=fmt(to);return}
  const t0=performance.now(),step=now=>{const k=Math.min((now-t0)/dur,1),e=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*e);if(k<1)el._raf=requestAnimationFrame(step)};el._raf=requestAnimationFrame(step);
}
const glowCard=(accent,cls,inner)=>`<div class="bento-card ${cls}" style="--rgb:${BENTO_RGB[accent]}" data-glow><div class="bc-edge" aria-hidden="true"></div><div class="bc-ring" aria-hidden="true"></div><div class="bc-face" aria-hidden="true"><div class="bc-spot"></div><div class="bc-grid"></div></div><div class="bc-body">${inner}</div></div>`;
const btTitle=(t,right='')=>`<div class="bc-title"><h3>${t}</h3>${right}</div>`;
const btLive='<span class="bc-live"><i></i>Live</span>';

const bt={series:Array.from({length:BT.SERIES},(_,i)=>40+Math.sin(i*.5)*9+((i*37)%7)),pings:BT_REGIONS.map(r=>r[1]),bars:Array.from({length:16},(_,i)=>1500+Math.sin(i*.8)*300+((i*53)%5)*40),step:1,hover:null,timers:[]};

function bentoProgress(){
  const runs=Object.entries(S.d.runs||{}).filter(([k])=>k.startsWith('pb:')&&PBX[k.slice(3)]);
  const done=runs.filter(([k,r])=>r.done.length>=PBX[k.slice(3)].s.length).length;
  return[['Goals',Math.round(S.d.goals.length/5*100),'Weekly goals done'],['Path',Math.round(S.d.lesson/8*100),'Learning path progress'],
    ['Runs',runs.length?Math.round(done/runs.length*100):0,'Playbook runs finished'],['Stack',Math.min(100,S.d.saved.length*10),'Saved tools (10 = full stack)']];
}
function bentoStack(){const L=S.d.saved.map(byName).filter(Boolean);for(const f of FEATURED){if(L.length>=8)break;if(!L.includes(f))L.push(f)}return L.slice(0,8)}

function buildBento(){
  const R=20,C=2*Math.PI*R;
  $('#bento').innerHTML=
   glowCard('indigo','b-lat',btTitle('AI response time',btLive)+`
     <div class="bc-head"><span class="bc-big"><b id="btLatest"></b><em>ms</em></span><span class="bc-meta"><span>avg <b id="btAvg"></b></span><span>peak <b id="btPeak"></b></span></span></div>
     <div class="bc-chart" id="btChart"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="AI response time over the last minute"><defs><linearGradient id="btFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#818cf8" stop-opacity=".35"/><stop offset="100%" stop-color="#818cf8" stop-opacity="0"/></linearGradient></defs>
       ${[25,50,75].map(y=>`<line x1="0" x2="100" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.06)" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"/>`).join('')}
       <path id="btArea" fill="url(#btFill)"/><path id="btLine" fill="none" stroke="#a5b4fc" stroke-width="2.5" stroke-linecap="round" vector-effect="non-scaling-stroke" style="filter:drop-shadow(0 0 6px rgba(129,140,248,.7))"/><line id="btHoverLine" y1="0" y2="100" stroke="rgba(165,180,252,.45)" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" visibility="hidden"/></svg>
       <span class="bc-dot" id="btDot" aria-hidden="true"></span><div class="bc-tip" id="btTip" aria-hidden="true" hidden></div></div>
     <div class="bc-axis"><span>${Math.round(BT.SERIES*BT.TICK/1000)}s ago</span><span>now</span></div>
     <ul class="bc-regions" id="btRegions"></ul>`)+
   glowCard('fuchsia','b-term',btTitle('lunorb.sh','<span class="bc-lights" aria-hidden="true"><i></i><i></i><i></i></span>')+`
     <div class="bc-term" id="btTerm" role="log" aria-label="Guided run log"></div>
     <button class="bc-runbtn" data-pb="trip">Run this playbook ${ic('arrow',12)}</button>`)+
   glowCard('emerald','b-rings',btTitle('Your progress')+`<div class="bc-rings">${bentoProgress().map(([l,v,t])=>`<div class="bc-ringitem" title="${t}: ${v}%"><div class="bc-ringsvg"><svg viewBox="0 0 50 50" aria-hidden="true"><circle cx="25" cy="25" r="${R}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="4"/><circle class="bc-arc" cx="25" cy="25" r="${R}" fill="none" stroke="#34d399" stroke-width="4" stroke-linecap="round" stroke-dasharray="${C}" style="--from:${C};--to:${C*(1-v/100)}"/></svg><b>${v}</b></div><span>${l}</span></div>`).join('')}</div>`)+
   glowCard('cyan','b-rps',btTitle('Prompts / min',btLive)+`<div class="bc-num" id="btRps"></div><div class="bc-bars" id="btBars" aria-hidden="true">${bt.bars.map(()=>'<span></span>').join('')}</div>`)+
   glowCard('amber','b-stack',btTitle('Your AI stack',`<button class="link bc-add" data-go="discover">Add tools ${ic('arrow',12)}</button>`)+`
     <ul class="bc-stack">${bentoStack().map(t=>`<li><button type="button" class="bc-tech" style="--tc:${BT_BRAND[t.n]||t.g[0]}" data-open="${t.id}" data-why="${esc(t.n+' · '+shortWhy(t))}" aria-label="${esc(t.n)}">${logoHTML(t,30)}<span>${esc(t.n)}</span><em>${esc(t.c)}</em></button></li>`).join('')}</ul>
     <p class="bc-desc" id="btDesc" aria-live="polite">Hover or tab to a tool to see why it’s in your stack.</p>`);
  drawLatency();drawTerm();drawBars();
}
function drawLatency(){
  const s=bt.series,pts=s.map((v,i)=>({x:i/(s.length-1)*100,y:95-v/100*85})),line=btSmooth(pts);
  $('#btLine').setAttribute('d',line);$('#btArea').setAttribute('d',`${line} L 100 100 L 0 100 Z`);
  btAnimate($('#btLatest'),Math.round(s.at(-1)),500);
  $('#btAvg').textContent=Math.round(s.reduce((a,b)=>a+b,0)/s.length)+'ms';$('#btPeak').textContent=Math.round(Math.max(...s))+'ms';
  const sh=bt.hover??s.length-1,dot=$('#btDot');dot.style.left=pts[sh].x+'%';dot.style.top=pts[sh].y+'%';
  const hl=$('#btHoverLine'),tip=$('#btTip');
  if(bt.hover!=null){hl.setAttribute('x1',pts[sh].x);hl.setAttribute('x2',pts[sh].x);hl.setAttribute('visibility','visible');tip.hidden=false;
    tip.style.left=`clamp(48px, ${pts[sh].x}%, calc(100% - 48px))`;tip.style.top=`calc(${pts[sh].y}% - 14px)`;
    tip.innerHTML=`<span>${Math.round((s.length-1-sh)*BT.TICK/1000)}s ago</span><b>${Math.round(s[sh])} ms</b>`}
  else{hl.setAttribute('visibility','hidden');tip.hidden=true}
  $('#btRegions').innerHTML=BT_REGIONS.map(([n],i)=>`<li><i class="st-${btStatus(bt.pings[i])}"></i><span>${n}</span><em class="st-${btStatus(bt.pings[i])}">${bt.pings[i]} ms</em></li>`).join('');
}
function drawTerm(){
  const printed=Math.min(bt.step,BT_SCRIPT.length),first=Math.max(0,printed-BT.TERM_VISIBLE);
  $('#btTerm').innerHTML=BT_SCRIPT.slice(first,printed).map(([type,text],i)=>{const [mk,cls]=BT_MARK[type],last=first+i===printed-1;
    return`<div class="${last?'tb-slide':''}"><span class="${cls}">${mk}</span><span class="t-${type}">${esc(text)}${last&&printed<BT_SCRIPT.length?'<i class="tb-blink"></i>':''}</span></div>`}).join('');
}
function drawBars(){
  const max=Math.max(...bt.bars);$$('#btBars span').forEach((b,i)=>{b.style.height=Math.max(bt.bars[i]/max*100,8)+'%';b.classList.toggle('now',i===bt.bars.length-1)});
  btAnimate($('#btRps'),bt.bars.at(-1),600,v=>Math.round(v).toLocaleString('en-US'));
}
function bentoStart(){
  bentoStop();
  bt.timers.push(setInterval(()=>{bt.series=[...bt.series.slice(1),btClamp(bt.series.at(-1)+(Math.random()-.5)*16,22,88)];
    bt.pings=BT_REGIONS.map(r=>Math.round(btClamp(r[1]+(Math.random()-.5)*14,8,140)));
    bt.bars=[...bt.bars.slice(1),btClamp(bt.bars.at(-1)+(Math.random()-.45)*420,900,2600)];drawLatency();drawBars()},BT.TICK));
  bt.timers.push(setInterval(()=>{bt.step=bt.step>=BT_SCRIPT.length+4?1:bt.step+1;drawTerm()},850));
}
function bentoStop(){bt.timers.forEach(clearInterval);bt.timers=[]}

/* events: cursor-following glow (mouse, touch, keyboard focus), chart hover, stack descriptions */
const bentoEl=$('#bento');
function glowAt(card,x,y){const r=card.getBoundingClientRect();card.style.setProperty('--x',x-r.left+'px');card.style.setProperty('--y',y-r.top+'px')}
const btDescDefault='Hover or tab to a tool to see why it’s in your stack.';
function btShowWhy(t){$('#btDesc').innerHTML=t?`<span class="tb-fade">${t.dataset.why}</span>`:btDescDefault}
bentoEl.addEventListener('mousemove',e=>{const c=e.target.closest('[data-glow]');if(c)glowAt(c,e.clientX,e.clientY);
  const ch=e.target.closest('#btChart');if(ch){const r=ch.getBoundingClientRect();bt.hover=Math.round(btClamp((e.clientX-r.left)/r.width,0,1)*(bt.series.length-1));drawLatency()}});
bentoEl.addEventListener('mouseover',e=>{e.target.closest('[data-glow]')?.classList.add('on');const t=e.target.closest('.bc-tech');if(t)btShowWhy(t)});
bentoEl.addEventListener('mouseout',e=>{const c=e.target.closest('[data-glow]');if(c&&!c.contains(e.relatedTarget))c.classList.remove('on');
  const ch=e.target.closest('#btChart');if(ch&&!ch.contains(e.relatedTarget)){bt.hover=null;drawLatency()}
  const t=e.target.closest('.bc-tech');if(t&&!t.contains(e.relatedTarget))btShowWhy(null)});
bentoEl.addEventListener('touchstart',e=>{const c=e.target.closest('[data-glow]'),t=e.touches[0];if(c&&t){glowAt(c,t.clientX,t.clientY);c.classList.add('on')}},{passive:true});
bentoEl.addEventListener('touchmove',e=>{const c=e.target.closest('[data-glow]'),t=e.touches[0];if(c&&t)glowAt(c,t.clientX,t.clientY)},{passive:true});
bentoEl.addEventListener('touchend',e=>{e.target.closest('[data-glow]')?.classList.remove('on')});
bentoEl.addEventListener('focusin',e=>{const c=e.target.closest('[data-glow]');if(c){const r=c.getBoundingClientRect();glowAt(c,r.left+r.width/2,r.top+r.height/2);c.classList.add('on')}
  const t=e.target.closest('.bc-tech');if(t)btShowWhy(t)});
bentoEl.addEventListener('focusout',e=>{const c=e.target.closest('[data-glow]');if(c&&!c.contains(e.relatedTarget))c.classList.remove('on');if(e.target.closest('.bc-tech'))btShowWhy(null)});

// rebuild on entry so progress rings and the stack reflect the latest saved state; timers only run on Home
const _homeBento=ENTER.home;ENTER.home=()=>{_homeBento&&_homeBento();buildBento();bentoStart()};
const _goBento=go;go=function(n,o){_goBento(n,o);if(cur!=='home')bentoStop()};
document.addEventListener('visibilitychange',()=>{if(document.hidden)bentoStop();else if(cur==='home')bentoStart()});
