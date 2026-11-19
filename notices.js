/* 三個提示：資料過期、有新版本、第一次使用時教你加到主畫面 */
(function(){
const $=id=>document.getElementById(id);
const st={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- 1. 資料過期 ---------- */
function expectedDate(){
  // 台北時間：平日 16:30 以後應該要有今天的資料；否則應該是前一個平日
  const tp=new Date(Date.now()+8*3600e3);let d=new Date(tp),m=tp.getUTCHours()*60+tp.getUTCMinutes();
  const wd=d.getUTCDay();
  if(!(wd>=1&&wd<=5&&m>=16*60+30)){do{d=new Date(d.getTime()-864e5)}while(d.getUTCDay()===0||d.getUTCDay()===6)}
  return d.toISOString().slice(0,10);
}
window.checkStale=function(){
  if(!window.D)return;
  const exp=expectedDate(),bar=$("staleBar");
  if(D.date<exp&&sessionStorage.getItem("tw_stale_hide")!==D.date){
    bar.innerHTML=t(`資料可能不是最新的：目前是 ${D.date.slice(5).replace("-","/")} 的收盤（如果今天是國定假日可以忽略）`,`Data may be out of date: showing the ${D.date.slice(5).replace("-","/")} close (ignore this on public holidays)`);
    bar.hidden=false;
  } else bar.hidden=true;
};

/* ---------- 2. 有新版本 ---------- */
$("staleBar").onclick=()=>{try{sessionStorage.setItem("tw_stale_hide",window.D?D.date:"")}catch(e){}$("staleBar").hidden=true};
const FILES=["index.html","quiz.js","sim.js","i18n.js","stats.js","notices.js","whatsnew.js","stock.js","klesson.js"];
let base=null;
async function sig(){
  const out=[];
  for(const f of FILES){
    try{const r=await fetch(f+"?v="+Date.now(),{method:"HEAD",cache:"no-store"});out.push(r.headers.get("etag")||r.headers.get("last-modified")||"")}catch(e){out.push("")}
  }
  return out.join("|");
}
async function checkUpdate(){
  if(location.protocol==="file:")return;
  const s=await sig();if(!s.replace(/\|/g,""))return;
  if(base===null){base=s;return}
  if(s!==base)$("updBar").hidden=false;
}
$("updBar").onclick=async()=>{
  $("updBar").textContent=t("更新中…","Updating…");
  try{await Promise.all(FILES.map(f=>fetch(f,{cache:"reload"})));if(window.caches){const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}}catch(e){}
  location.reload();
};
setTimeout(checkUpdate,3000);
setInterval(checkUpdate,30*60e3);
document.addEventListener("visibilitychange",()=>{if(!document.hidden){checkUpdate();window.checkStale&&checkStale()}});

/* ---------- 3. 加到主畫面 ---------- */
const ua=navigator.userAgent,isIOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const isIPad=/iPad/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const isSafari=isIOS&&!/CriOS|FxiOS|EdgiOS|OPiOS|Line\/|FBAN|FBAV|Instagram/.test(ua);
const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
let deferred=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;});
const shareIcon=`<svg viewBox="0 0 24 24" class="shi"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><rect x="5" y="10" width="14" height="11" rx="2"/></svg>`;
function steps(){
  if(isIOS&&!isSafari)return t(`<ol><li>點右上角的「…」或分享，選「用 Safari 開啟」</li><li>在 Safari 點 ${shareIcon} 分享</li><li>往下滑，點「加入主畫面」，再按「加入」</li></ol>`,
    `<ol><li>Tap "…" or Share and choose "Open in Safari"</li><li>In Safari, tap ${shareIcon} Share</li><li>Scroll down, tap "Add to Home Screen", then "Add"</li></ol>`);
  if(isIOS)return t(`<ol><li>點${isIPad?"右上角":"下方"}的 ${shareIcon} 分享按鈕</li><li>往下滑，點「加入主畫面」</li><li>按右上角「加入」就完成了</li></ol>`,
    `<ol><li>Tap the ${shareIcon} Share button ${isIPad?"at the top right":"at the bottom"}</li><li>Scroll down and tap "Add to Home Screen"</li><li>Tap "Add" at the top right</li></ol>`);
  if(deferred)return t(`<p>按下面的按鈕，就會裝到主畫面。</p>`,`<p>Tap the button below to install it.</p>`);
  return t(`<ol><li>打開瀏覽器的選單（⋮ 或 …）</li><li>選「加到主畫面」或「安裝應用程式」</li></ol>`,`<ol><li>Open the browser menu (⋮ or …)</li><li>Choose "Add to Home screen" or "Install app"</li></ol>`);
}
window.showInstall=function(force){
  if(standalone&&!force)return;
  $("instSteps").innerHTML=steps();
  $("instGo").hidden=!deferred;
  $("instSheet").classList.add("show");$("instBack").classList.add("show");
  const arr=isIOS&&isSafari&&!isIPad;$("instArrow").hidden=!arr;$("instSheet").classList.toggle("witharrow",arr);
};
const close=()=>{$("instSheet").classList.remove("show");$("instBack").classList.remove("show");$("instArrow").hidden=true};
$("instLater").onclick=()=>{st.set("tw_inst_later",Date.now());close()};
$("instDone").onclick=()=>{st.set("tw_inst_done",true);close()};
$("instBack").onclick=close;
$("instGo").onclick=async()=>{if(!deferred)return;deferred.prompt();try{await deferred.userChoice}catch(e){}deferred=null;st.set("tw_inst_done",true);close()};
$("instHelp").onclick=()=>{if(window.openSet)openSet(false);setTimeout(()=>showInstall(true),300)};
if(standalone)$("instHelpRow").hidden=true;
// 第一次用（不是從主畫面打開）就提醒；按「下次再說」的話 3 天後再提醒
if(!standalone&&!st.get("tw_inst_done",false)&&Date.now()-st.get("tw_inst_later",0)>3*864e5)setTimeout(()=>{if(window.whatsNewOpen)window.afterWhatsNew=()=>showInstall(false);else showInstall(false)},1800);
})();
