/* 啟動畫面：依主題換動畫，進度跟著真的載入步驟走，順便給一則新手小知識 */
(function(){
const el=document.getElementById("splash");if(!el)return;
const en=(function(){try{var v=localStorage.getItem("twlang");if(v)return v==="en"}catch(e){}return !/^zh/i.test(navigator.language||"")})();
const tt=(zh,e)=>en?e:zh;
const intl=document.documentElement.dataset.color==="intl";
const UP=en?(intl?"green":"red"):(intl?"綠色":"紅色"),DN=en?(intl?"red":"green"):(intl?"紅色":"綠色");
const TIPS=[
  [`台股用${UP}代表漲、${DN}代表跌，跟美股剛好相反。`,`In this app, ${UP} means up and ${DN} means down.`],
  ["台股一般交易時間是早上 9:00 到下午 1:30。","Taiwan's regular trading session runs 9:00 am to 1:30 pm."],
  ["1 張股票＝1,000 股，零股可以一股一股買。","1 lot = 1,000 shares. Odd lots let you buy single shares."],
  ["一般股票一天最多漲跌 10%，碰到就叫漲停或跌停。","Most stocks can move at most 10% a day: limit up or limit down."],
  ["賣股票要付 0.3% 證交稅，ETF 只要 0.1%。","Selling stocks costs 0.3% transaction tax; ETFs only 0.1%."],
  ["成交金額越大，代表今天越多人在關注。","Higher trading value means more people are watching that stock."],
  ["K 棒的顏色是跟「今天開盤」比，不是跟昨天比。","A candle's color compares with today's open, not yesterday."],
  ["三大法人是外資、投信和自營商。","The big three institutions: foreign investors, trusts and dealers."],
  ["ETF 是一籃子股票，買一檔就分散到很多家公司。","An ETF is a basket of stocks, so one buy spreads your risk."],
  ["排行代表市場注意力，不是推薦買進。","Rankings show attention, not buy recommendations."],
  ["買賣都要付約 0.1425% 手續費，常常進出成本會變高。","Each trade costs about 0.1425% in fees, so frequent trading adds up."],
  ["在模擬分頁可以用假錢練習下單，不用怕虧錢。","Use the Practice tab to trade with play money first."]
];
const msgs=[tt("正在讀取今天的盤勢…","Loading today's market…"),tt("正在下載最新資料…","Downloading the latest data…"),tt("正在整理 2,000 多檔股票…","Sorting 2,000+ stocks…"),tt("正在畫圖表…","Drawing charts…"),tt("準備好了！","Ready!")];
const $=id=>document.getElementById(id);
$("spMsg").textContent=msgs[0];
document.querySelector("#splash .sp-name").textContent=tt("台股小幫手","TW Stock Helper");
$("spRetry").textContent=tt("再試一次","Try again");$("spSkip").textContent=tt("先進去看看","Continue");
let last=-1;try{last=+localStorage.getItem("tw_tip")}catch(e){}
let k=Math.floor(Math.random()*TIPS.length);if(k===last)k=(k+1)%TIPS.length;
try{localStorage.setItem("tw_tip",k)}catch(e){}
$("spTip").innerHTML=`<b>${tt("小知識","DID YOU KNOW")}</b>${TIPS[k][en?1:0]}`;
requestAnimationFrame(()=>$("spTip").classList.add("show"));
const t0=performance.now();
const pct=[8,30,62,85,100];
window.splashStep=function(n){
  if(n<0){el.classList.add("err");$("spMsg").textContent=tt("讀不到資料，可能是網路不穩。","Couldn't load data. The connection may be unstable.");return}
  $("spBar").style.width=pct[n]+"%";$("spMsg").textContent=msgs[n];
};
splashStep(0);
let gone=false;
function hide(cb){
  if(gone)return;gone=true;
  // 至少讓動畫跑一下（太快會一閃而過），已看過的老使用者等比較短
  const min=localStorage.getItem("tw_seen")?650:1100, wait=Math.max(0,min-(performance.now()-t0));
  setTimeout(()=>{el.classList.add("off");if(cb)setTimeout(cb,180);setTimeout(()=>el.remove(),650)},wait);
}
window.splashDone=hide;
$("spRetry").onclick=()=>location.reload();
$("spSkip").onclick=()=>hide();
// 保險：12 秒還沒好就讓使用者先進去
setTimeout(()=>{if(!gone&&!el.classList.contains("err"))splashStep(-1)},12000);
})();
