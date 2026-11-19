/* 咒術主題特效：咒力光點、偶爾一道斬擊、點擊漣漪（參考行事曆） */
(function(){
const on=()=>document.documentElement.dataset.theme==="jjk"&&!matchMedia("(prefers-reduced-motion:reduce)").matches;
const fx=document.createElement("canvas");fx.id="fx";document.body.prepend(fx);
const c=fx.getContext("2d");let W=0,H=0,d=1,dots=[],slash=null,run=false,last=0;
function size(){d=Math.min(2,devicePixelRatio||1);W=fx.width=innerWidth*d;H=fx.height=innerHeight*d}
function init(){size();dots=Array.from({length:40},()=>({x:Math.random()*W,y:Math.random()*H,r:(.6+Math.random()*1.8)*d,v:(.12+Math.random()*.4)*d,p:Math.random()*6.28,h:Math.random()<.35?200:255}))}
function loop(t){
  if(!on()||document.hidden){run=false;c.clearRect(0,0,W,H);return}
  c.clearRect(0,0,W,H);c.globalCompositeOperation="lighter";
  dots.forEach(o=>{o.y-=o.v;o.x+=Math.sin(t/1800+o.p)*.25*d;if(o.y<-10){o.y=H+10;o.x=Math.random()*W}
    const a=.25+.45*Math.abs(Math.sin(t/900+o.p)),g=c.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r*4);
    g.addColorStop(0,`hsla(${o.h},100%,80%,${a})`);g.addColorStop(1,`hsla(${o.h},100%,60%,0)`);
    c.fillStyle=g;c.beginPath();c.arc(o.x,o.y,o.r*4,0,6.28);c.fill()});
  if(!slash&&t-last>7000){slash={x:Math.random()*W*.6,y:Math.random()*H*.5,l:W*.5,a:1};last=t}
  if(slash){const s=slash;s.a-=.025;if(s.a<=0)slash=null;else{c.strokeStyle=`rgba(170,185,255,${s.a*.7})`;c.lineWidth=2*d;c.shadowColor="#7c6bff";c.shadowBlur=18*d;c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.x+s.l*(1-s.a*.3),s.y+s.l*.55*(1-s.a*.3));c.stroke();c.shadowBlur=0}}
  requestAnimationFrame(loop)}
function start(){if(run||!on())return;if(!dots.length)init();run=true;last=performance.now();requestAnimationFrame(loop)}
window.fxStart=start;
addEventListener("resize",()=>{if(dots.length)init()});
document.addEventListener("visibilitychange",()=>{if(!document.hidden)start()});
new MutationObserver(start).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
document.addEventListener("pointerdown",e=>{if(!on())return;
  const add=(el,ms)=>{el.style.left=e.clientX+"px";el.style.top=e.clientY+"px";document.body.appendChild(el);setTimeout(()=>el.remove(),ms)};
  const r=document.createElement("i");r.className="tap";add(r,700);
  for(let k=0;k<7;k++){const a=k/7*6.28+Math.random(),dd=26+Math.random()*26,p=document.createElement("b");p.className="sp";p.style.setProperty("--dx",Math.cos(a)*dd+"px");p.style.setProperty("--dy",Math.sin(a)*dd+"px");add(p,650)}
},{passive:true});
start();
})();
