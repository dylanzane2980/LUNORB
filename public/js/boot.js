/* ---------- boot ---------- */
(async()=>{
  hydrate();loadTpl('brand');resize();
  if(reduced)frame(0);else requestAnimationFrame(frame);
  document.body.classList.add('booting');
  const ready=await cloudInit();
  document.body.classList.remove('booting');
  if(!ready){go('auth');renderAuth();return}
  const P=new URLSearchParams(location.search);
  go(location.hash.slice(1)||'home');resize();
  if(P.get('tool'))openTool(P.get('tool'));
  if(P.get('pb')&&PBX[P.get('pb')])openPlaybook(P.get('pb'));
  if(P.has('ask'))openHelper(P.get('ask'));
  const qp=P.get('q');if(qp){if(cur==='discover'){$('#dq').value=qp;dir.q=qp;$('#dqClear').hidden=false;renderDir()}else{q.value=qp;renderResults()}}
  if(cur==='auth')renderAuth();
  afterBoot(P);
})();
