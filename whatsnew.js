/* 更新後跳出「新功能」說明。每次改版就在 NEWS 最上面加一筆（id 要是新的）。 */
(function(){
const NEWS=[
 {id:"2026-11-18",zh:["上櫃股票加進來了：搜尋、自選股、模擬都找得到，旁邊會標「上櫃」","模擬交易更像真的：下單後等收盤才成交，可以下限價單","新的外觀「忍者」：設定 → 外觀，大盤卡片上有旋轉的手裏劍","小測驗擴充到 10 級、173 題，後面的情境題會一步一步教你解","資料太舊或有新版本時，上方會跳出提醒"],
  en:["OTC (TPEx) stocks added: search, watchlist and paper trading all include them","Paper trading is more realistic: orders fill at the close, and limit orders are supported","New Ninja theme: Settings → Appearance, with a spinning shuriken","The quiz now has 10 levels and 173 questions, with step-by-step scenario solutions","You'll see a notice when data is old or a new version is available"]}
];
const $=id=>document.getElementById(id);
const get=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
const set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const latest=NEWS[0].id;
function render(items){
  $("wnList").innerHTML=items.map(n=>`<div class="wn-ver">${n.id.replace(/-/g,"/")}</div><ul>${(EN?n.en:n.zh).map(x=>`<li>${x}</li>`).join("")}</ul>`).join("");
}
window.showWhatsNew=function(all){
  const seen=get("tw_news_seen","");
  const items=all?NEWS.slice(0,3):NEWS.filter(n=>!seen||n.id>seen).slice(0,3);
  if(!items.length)return false;
  render(items);window.whatsNewOpen=true;
  $("wnSheet").classList.add("show");$("wnBack").classList.add("show");return true;
};
function close(){
  set("tw_news_seen",latest);window.whatsNewOpen=false;
  $("wnSheet").classList.remove("show");$("wnBack").classList.remove("show");
  if(window.afterWhatsNew){const f=window.afterWhatsNew;window.afterWhatsNew=null;setTimeout(f,400)}
}
$("wnOk").onclick=close;$("wnBack").onclick=close;
$("wnHelp").onclick=()=>{if(window.openSet)openSet(false);setTimeout(()=>showWhatsNew(true),300)};
// 舊使用者（之前就用過）更新後才跳；第一次用的人不跳，直接記成最新版
const used=!!window.RETURNING;
const seen=get("tw_news_seen","");
if(seen===latest){}
else if(!seen&&!used)set("tw_news_seen",latest);
else setTimeout(()=>showWhatsNew(false),1200);
})();
