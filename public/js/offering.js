/* ---------- The Offering: an open hand holding the live Ask Lunorb orb (sign-in and Home heroes) ----------
   The hand photo is an original AI-generated image (Figma AI). The orb is the same canvas globe as the Ask Lunorb button.
   - the orb's light leans toward the pointer (--px/--py, -1..1)
   - on the sign-in page the orb charges as the form fills (--charge, 0..1)
   - on Home the orb opens Ask Lunorb with a rotating example question */
(function offering(){
  const stages=$$('.offering');if(!stages.length)return;
  // pointer light: one listener, eased so the light drifts rather than snaps
  let tx=0,ty=0,px=0,py=0,raf=0;
  const ease=()=>{px+=(tx-px)*.08;py+=(ty-py)*.08;stages.forEach(s=>{s.style.setProperty('--px',px.toFixed(3));s.style.setProperty('--py',py.toFixed(3))});
    raf=Math.abs(tx-px)+Math.abs(ty-py)>.002?requestAnimationFrame(ease):0};
  if(!reduced)addEventListener('pointermove',e=>{
    const s=stages.find(s=>s.offsetParent);if(!s)return;const r=s.getBoundingClientRect();
    tx=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(innerWidth/2)));ty=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height*.3))/(innerHeight/2)));
    if(!raf)raf=requestAnimationFrame(ease)},{passive:true});

  // sign-in: the orb gathers light as the visitor fills the form
  const auth=$('#ofAuth'),card=$('#authCard');
  if(auth&&card)card.addEventListener('input',()=>{const f=[...card.querySelectorAll('input')];auth.style.setProperty('--charge',f.length?(f.filter(i=>i.value.trim()).length/f.length).toFixed(2):0)});

  // sign-in: Get Started switches the card to sign-up and brings it into view
  const gs=$('#getStarted');if(gs)gs.onclick=()=>{if(typeof authMode!=='undefined'&&BACKEND){authMode='signup';authNotice='';renderAuth()}
    card.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});setTimeout(()=>card.querySelector('input')?.focus({preventScroll:true}),reduced?0:450)};

  // Home: the orb is Ask Lunorb; the label above it cycles through real example questions
  const ask=$('#ofAskQ'),orb=$('#ofOrb'),btn=$('#ofAsk');if(!ask)return;
  const EX=(typeof HELPER_EX!=='undefined'&&HELPER_EX.length?HELPER_EX:['Plan meals for the week']).map(x=>x[0].toUpperCase()+x.slice(1));
  let i=0;ask.textContent=EX[0];
  const open=()=>openHelper(ask.textContent);orb.onclick=open;btn.onclick=open;
  if(!reduced)setInterval(()=>{if(document.hidden||cur!=='home')return;ask.classList.add('out');
    setTimeout(()=>{i=(i+1)%EX.length;ask.textContent=EX[i];ask.classList.remove('out')},380)},4200);
})();
