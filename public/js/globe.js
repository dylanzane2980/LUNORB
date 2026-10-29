/* ---------- Ask Lunorb globe: a small rotating 3D globe with an orbit ring (echoes the Ø in the logo) ---------- */
const GLOBE={
  pts:(()=>{const n=420,ga=Math.PI*(3-Math.sqrt(5)),P=[];for(let i=0;i<n;i++){const y=1-i/(n-1)*2,r=Math.sqrt(1-y*y),t=ga*i;P.push([Math.cos(t)*r,y,Math.sin(t)*r])}return P})(),
  // soft blobs of "land" from a few low-frequency waves, so the dots read as continents rather than a uniform grid
  land:(x,y,z)=>{const lon=Math.atan2(z,x),lat=Math.asin(y);return Math.sin(lon*2+.6)*Math.cos(lat*2.2)+.55*Math.sin(lon*3-lat*2+1.9)+.35*Math.cos(lon*5+lat*3)>.62},
  tilt:.38,speed:.00035,fast:1
};
GLOBE.isLand=GLOBE.pts.map(p=>GLOBE.land(...p));
function drawGlobe(cv,t){
  const dpr=Math.min(devicePixelRatio||1,3),css=cv.clientWidth;if(!css)return;
  if(cv.width!==Math.round(css*dpr)){cv.width=cv.height=Math.round(css*dpr)}
  const g=cv.getContext('2d'),S=cv.width,c=S/2,R=S*.33,rot=t*GLOBE.speed*GLOBE.fast,ct=Math.cos(GLOBE.tilt),st=Math.sin(GLOBE.tilt);
  g.clearRect(0,0,S,S);
  // project a unit-sphere point: spin around y, then tilt toward the viewer
  const proj=(x,y,z)=>{const cr=Math.cos(rot),sr=Math.sin(rot),x1=x*cr+z*sr,z1=-x*sr+z*cr,y2=y*ct-z1*st,z2=y*st+z1*ct;return[c+x1*R,c-y2*R,z2]};
  const ring=(back)=>{g.save();g.translate(c,c);g.rotate(-.42);g.beginPath();g.ellipse(0,0,R*1.42,R*.36,0,back?Math.PI:0,back?Math.PI*2:Math.PI);
    const lg=g.createLinearGradient(-R*1.4,0,R*1.4,0);lg.addColorStop(0,'rgba(94,234,212,.9)');lg.addColorStop(.5,'rgba(143,182,255,.95)');lg.addColorStop(1,'rgba(192,132,252,.9)');
    g.strokeStyle=lg;g.globalAlpha=back?.35:.95;g.lineWidth=Math.max(1,S*.028);g.stroke();
    const a=(t*.0011)%(Math.PI*2),onBack=a>Math.PI;if(onBack===back){g.globalAlpha=back?.4:1;g.fillStyle='#e6f0ff';g.shadowColor='#8fb6ff';g.shadowBlur=S*.12;g.beginPath();g.arc(Math.cos(a)*R*1.42,Math.sin(a)*R*.36,S*.035,0,7);g.fill()}
    g.restore()};
  const halo=g.createRadialGradient(c,c,R*.9,c,c,R*1.6);halo.addColorStop(0,'rgba(76,141,255,.45)');halo.addColorStop(1,'rgba(76,141,255,0)');g.fillStyle=halo;g.fillRect(0,0,S,S);
  ring(true);
  const body=g.createRadialGradient(c-R*.38,c-R*.42,R*.05,c,c,R);
  body.addColorStop(0,'#a9d4ff');body.addColorStop(.32,'#3f73e6');body.addColorStop(.72,'#132a78');body.addColorStop(1,'#060d2c');
  g.fillStyle=body;g.beginPath();g.arc(c,c,R,0,7);g.fill();
  g.save();g.beginPath();g.arc(c,c,R,0,7);g.clip();
  // graticule: meridians and parallels, front half only, fading toward the limb
  g.lineWidth=Math.max(.6,S*.008);
  const line=f=>{let prev=null;for(let k=0;k<=36;k++){const p=proj(...f(k/36));if(prev&&p[2]>0&&prev[2]>0){g.strokeStyle=`rgba(190,220,255,${.12+.3*p[2]})`;g.beginPath();g.moveTo(prev[0],prev[1]);g.lineTo(p[0],p[1]);g.stroke()}prev=p}};
  for(let m=0;m<6;m++){const lon=m*Math.PI/6;line(u=>{const lat=(u-.5)*Math.PI;return[Math.cos(lat)*Math.cos(lon),Math.sin(lat),Math.cos(lat)*Math.sin(lon)]})}
  for(const lat of[-1,-.5,0,.5,1].map(v=>v*Math.PI/3.2))line(u=>{const lon=u*Math.PI*2;return[Math.cos(lat)*Math.cos(lon),Math.sin(lat),Math.cos(lat)*Math.sin(lon)]});
  GLOBE.pts.forEach((p,i)=>{const q=proj(...p);if(q[2]<=0)return;const L=GLOBE.isLand[i];
    g.fillStyle=L?`rgba(110,240,205,${.35+.65*q[2]})`:`rgba(170,205,255,${.08+.18*q[2]})`;g.beginPath();g.arc(q[0],q[1],(L?.9:.55)*dpr*(.55+.45*q[2])*(S/(44*dpr)),0,7);g.fill()});
  // night side and a soft specular highlight sell the curvature
  const shade=g.createRadialGradient(c-R*.5,c-R*.55,R*.2,c,c,R*1.05);shade.addColorStop(0,'rgba(0,0,0,0)');shade.addColorStop(.7,'rgba(2,6,24,.15)');shade.addColorStop(1,'rgba(2,6,24,.7)');
  g.fillStyle=shade;g.fillRect(0,0,S,S);
  const spec=g.createRadialGradient(c-R*.42,c-R*.48,0,c-R*.42,c-R*.48,R*.5);spec.addColorStop(0,'rgba(255,255,255,.55)');spec.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=spec;g.fillRect(0,0,S,S);g.restore();
  const rim=g.createLinearGradient(c-R,c+R,c+R,c-R);rim.addColorStop(0,'rgba(94,234,212,.85)');rim.addColorStop(.5,'rgba(143,182,255,.3)');rim.addColorStop(1,'rgba(192,132,252,.8)');
  g.strokeStyle=rim;g.lineWidth=Math.max(1,S*.022);g.beginPath();g.arc(c,c,R,0,7);g.stroke();
  ring(false);
}
if(document.querySelector('script[src*="/.netlify/scripts/hud"]'))document.body.classList.add('nf-badge');
(function globeLoop(){
  const draw=t=>{if(!document.hidden)$$('canvas.globe').forEach(cv=>{if(cv.offsetParent)drawGlobe(cv,t)})};
  if(reduced){draw(2400);addEventListener('resize',()=>draw(2400));return}
  const tick=t=>{draw(t);requestAnimationFrame(tick)};requestAnimationFrame(tick);
  document.addEventListener('mouseover',e=>{GLOBE.fast=e.target.closest('.helper-btn,[data-helper]')?4:1});
})();
