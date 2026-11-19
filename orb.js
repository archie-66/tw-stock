/* 咒術主題：紫色能量球（畫在 canvas 上：旋轉的電漿、閃電、繞行的火花、會呼吸的光暈） */
(function(){
const isJ=()=>document.documentElement.dataset.theme==="jjk";
const still=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
const orbs=new Set();
function make(host,scale){
  const c=document.createElement("canvas");c.className="eorb";host.appendChild(c);
  const o={c,ctx:c.getContext("2d"),host,scale,size:0,seed:Math.random()*1000,bolts:[],sparks:[]};
  for(let i=0;i<10;i++)o.sparks.push({a:Math.random()*6.28,r:.55+Math.random()*.35,v:(.6+Math.random()*1.2)*(Math.random()<.5?-1:1),s:.6+Math.random()});
  orbs.add(o);return o;
}
function fit(o){
  const w=o.host.clientWidth||0;if(!w)return false;
  const d=Math.min(2,devicePixelRatio||1),px=Math.round(w*o.scale*d);
  if(o.size!==px){o.size=px;o.c.width=o.c.height=px;o.c.style.width=o.c.style.height=w*o.scale+"px"}
  return true;
}
const noise=(x,s)=>Math.sin(x*1.7+s)*.5+Math.sin(x*2.9+s*1.3)*.3+Math.sin(x*5.3+s*.7)*.2;
function draw(o,t){
  const g=o.ctx,S=o.size,cx=S/2,R=S/2/o.scale*.7,T=t/1000,s=o.seed;
  g.clearRect(0,0,S,S);g.globalCompositeOperation="lighter";
  const br=1+.08*Math.sin(T*3.1+s);
  // 外圍光暈
  let gr=g.createRadialGradient(cx,cx,R*.3,cx,cx,S/2);
  gr.addColorStop(0,`rgba(124,92,255,${.55*br})`);gr.addColorStop(.45,"rgba(90,60,255,.22)");gr.addColorStop(1,"rgba(60,40,200,0)");
  g.fillStyle=gr;g.fillRect(0,0,S,S);
  // 旋轉電漿（好幾層、不同速度、邊緣會抖）
  const layers=[[1.0,.9,"170,140,255",.55],[.82,-1.4,"205,185,255",.5],[.64,2.1,"120,170,255",.45],[1.12,-.6,"140,90,255",.35]];
  layers.forEach(([rr,sp,col,al],li)=>{
    g.beginPath();
    for(let k=0;k<=64;k++){const a=k/64*6.283,n=noise(a*2+T*sp*2,s+li*7);const r=R*rr*(1+.13*n);const x=cx+Math.cos(a+T*sp)*r,y=cx+Math.sin(a+T*sp)*r*.96;k?g.lineTo(x,y):g.moveTo(x,y)}
    g.closePath();g.lineWidth=Math.max(1,S*.012);g.strokeStyle=`rgba(${col},${al})`;g.shadowColor=`rgb(${col})`;g.shadowBlur=S*.05;g.stroke();
  });
  g.shadowBlur=0;
  // 漩渦弧線
  for(let k=0;k<5;k++){const a0=T*(1.6+k*.35)*(k%2?-1:1)+k*1.3+s;g.beginPath();g.arc(cx,cx,R*(.35+k*.12),a0,a0+1.1+.5*Math.sin(T+k));g.strokeStyle=`rgba(225,215,255,${.35-k*.04})`;g.lineWidth=Math.max(1,S*.014);g.stroke()}
  // 核心
  gr=g.createRadialGradient(cx-R*.12,cx-R*.14,0,cx,cx,R*.78);
  gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(.22,`rgba(230,220,255,${.9*br})`);gr.addColorStop(.55,"rgba(140,100,255,.6)");gr.addColorStop(1,"rgba(70,40,200,0)");
  g.fillStyle=gr;g.beginPath();g.arc(cx,cx,R*.95,0,6.283);g.fill();
  // 閃電
  if(Math.random()<.06&&o.bolts.length<3)o.bolts.push({a:Math.random()*6.28,life:1,pts:null});
  o.bolts=o.bolts.filter(b=>{b.life-=.12;if(b.life<=0)return false;
    if(!b.pts){b.pts=[];let r=R*.25,a=b.a;while(r<R*1.35){b.pts.push([cx+Math.cos(a)*r,cx+Math.sin(a)*r]);r+=R*(.12+Math.random()*.12);a+=(Math.random()-.5)*.6}}
    g.beginPath();b.pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));
    g.strokeStyle=`rgba(235,230,255,${b.life})`;g.lineWidth=Math.max(1,S*.01);g.shadowColor="#a58bff";g.shadowBlur=S*.06;g.stroke();g.shadowBlur=0;return true});
  // 繞行火花
  o.sparks.forEach(p=>{p.a+=p.v*.02;const r=R*(p.r+.5)*(1+.05*Math.sin(T*4+p.a)),x=cx+Math.cos(p.a)*r,y=cx+Math.sin(p.a)*r*.9;
    const q=g.createRadialGradient(x,y,0,x,y,S*.025*p.s);q.addColorStop(0,"rgba(240,235,255,.95)");q.addColorStop(1,"rgba(150,120,255,0)");g.fillStyle=q;g.beginPath();g.arc(x,y,S*.025*p.s,0,6.283);g.fill()});
  g.globalCompositeOperation="source-over";
}
let run=false;
function loop(t){
  if(!isJ()||document.hidden){run=false;return}
  let any=false;
  orbs.forEach(o=>{if(!o.host.isConnected){orbs.delete(o);return}
    if(o.host.offsetParent===null&&getComputedStyle(o.host).position!=="fixed")return;
    const r=o.c.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.width===0)return;
    if(fit(o)){draw(o,still()?0:t);any=true}});
  if(still()){run=false;return}
  requestAnimationFrame(loop);
}
function start(){if(run||!isJ())return;run=true;requestAnimationFrame(loop)}
window.orbStart=start;
window.orbAttach=function(){
  document.querySelectorAll(".ldr .lj").forEach(h=>{if(!h.querySelector(".eorb"))make(h,1.9)});
  document.querySelectorAll(".card.hero").forEach(h=>{if(!h.querySelector(".hero-orb")){const w=document.createElement("div");w.className="hero-orb";h.appendChild(w);make(w,2.4)}});
  start();
};
orbAttach();
document.addEventListener("DOMContentLoaded",orbAttach);
new MutationObserver(start).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
document.addEventListener("visibilitychange",()=>{if(!document.hidden)start()});
setInterval(()=>{if(isJ())start()},1500);
})();
