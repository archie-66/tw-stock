/* 學習頁：看懂 K 線（圖解小課程） */
(function(){
const $=id=>document.getElementById(id);
const intl=()=>document.documentElement.dataset.color==="intl";
const UPW=()=>EN?(intl()?"green":"red"):(intl()?"綠":"紅"), DNW=()=>EN?(intl()?"red":"green"):(intl()?"紅":"綠");
const U="var(--up)",Dn="var(--down)";
// 價格 0~100 → y
const Y=v=>150-v*1.3;
function candle(x,o,h,l,c,w=26){const col=c>=o?U:Dn;return `<line x1="${x}" x2="${x}" y1="${Y(h)}" y2="${Y(l)}" stroke="${col}" stroke-width="2.4"/><rect x="${x-w/2}" y="${Y(Math.max(o,c))}" width="${w}" height="${Math.max(3,Math.abs(Y(o)-Y(c)))}" fill="${col}" rx="2"/>`}
const lab=(x,y,s,anchor="start")=>`<text x="${x}" y="${y}" font-size="11" fill="var(--ink)" text-anchor="${anchor}">${s}</text>`;
const arrowL=(x1,y1,x2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y1}" stroke="var(--mute)" stroke-width="1" stroke-dasharray="2 2"/>`;

const L=()=>[
 {t:t("K 棒長什麼樣子？","What is a candlestick?"),
  svg:()=>candle(120,35,95,10,75,40)+arrowL(142,Y(95),205)+lab(210,Y(95)+4,t("最高價","High"))+arrowL(142,Y(75),205)+lab(210,Y(75)+4,t("收盤價","Close"))+arrowL(142,Y(35),205)+lab(210,Y(35)+4,t("開盤價","Open"))+arrowL(142,Y(10),205)+lab(210,Y(10)+4,t("最低價","Low"))
   +lab(92,Y(85)+4,t("上影線","Upper shadow"),"end")+lab(92,Y(55)+4,t("實體","Body"),"end")+lab(92,Y(22)+4,t("下影線","Lower shadow"),"end"),
  d:t("一根 K 棒記錄一天的 4 個價格。粗的「實體」是開盤到收盤，上下的細線叫「影線」，碰到的是當天最高和最低價。","One candle records 4 prices for a day. The thick body runs from open to close; the thin lines (shadows) reach the day's high and low.")},
 {t:t(`收盤比開盤高＝${UPW()} K`,`Close above open = ${UPW()} candle`),
  svg:()=>candle(110,30,85,20,75,40)+lab(110,Y(5),t(`${UPW()} K：收盤 > 開盤`,`${UPW()}: close > open`),"middle")+candle(250,75,85,20,30,40)+lab(250,Y(5),t(`${DNW()} K：收盤 < 開盤`,`${DNW()}: close < open`),"middle"),
  d:t(`K 棒的顏色是拿「今天收盤」跟「今天開盤」比：收得比開得高是${UPW()} K，低就是${DNW()} K（也叫黑 K）。注意：這跟「比昨天漲還是跌」是兩回事！`,`The color compares today's close with today's open: higher = ${UPW()}, lower = ${DNW()}. This is NOT the same as up or down vs. yesterday!`)},
 {t:t("長紅、長黑：一面倒","Long candles: one side wins"),
  svg:()=>candle(110,10,92,7,90,40)+lab(110,Y(-5),t(`長${UPW()}`,`Long ${UPW()}`),"middle")+candle(250,90,93,8,10,40)+lab(250,Y(-5),t(`長${DNW()}`,`Long ${DNW()}`),"middle"),
  d:t(`實體很長、影線很短，代表一整天幾乎都朝同一個方向走。長${UPW()}＝買方很強，長${DNW()}＝賣方很強。`,`A long body with short shadows means the price moved one way almost all day. Long ${UPW()} = buyers in control; long ${DNW()} = sellers in control.`)},
 {t:t("十字線：猶豫不決","Doji: indecision"),
  svg:()=>candle(180,50,85,15,51,40)+lab(240,Y(50)+4,t("開盤 ≈ 收盤","Open ≈ close")),
  d:t("開盤和收盤幾乎一樣，上下都有影線。表示買賣雙方拉鋸，誰也沒贏。常出現在趨勢可能要改變的時候，但要看後面幾天確認。","Open and close are almost the same, with shadows on both sides: buyers and sellers are tied. It often appears near turning points, but wait for the next days to confirm.")},
 {t:t("長下影線：跌下去又被買回","Long lower shadow: bought back up"),
  svg:()=>candle(180,78,88,8,85,36)+arrowL(200,Y(8),245)+lab(250,Y(8)+4,t("盤中一度跌到這裡","Fell this low during the day")),
  d:t("盤中一度跌很深，但收盤前又被買回來。出現在跌了一段之後，代表低檔有人願意買，可能是止跌的訊號。","It dropped a lot during the day, then got bought back before the close. After a decline, it shows buyers stepping in low: a possible sign the fall is slowing.")},
 {t:t("長上影線：衝高被賣回","Long upper shadow: sold back down"),
  svg:()=>candle(180,15,92,10,22,36)+arrowL(200,Y(92),245)+lab(250,Y(92)+4,t("盤中一度漲到這裡","Rose this high during the day")),
  d:t("盤中一度衝很高，但收盤前被賣下來。出現在漲了一段之後，代表上面有人在賣，要小心漲勢變弱。","It jumped during the day, then got sold back down. After a rally, it shows sellers waiting above: watch for the rise losing strength.")},
 {t:t("連起來看：找出趨勢","Put them together: the trend"),
  svg:()=>{const d=[[10,22,6,18],[18,26,14,24],[24,28,17,20],[20,34,18,32],[32,40,28,38],[38,42,30,33],[33,50,31,47],[47,56,44,54],[54,58,46,49],[49,66,47,63]];let s="",ma=[];d.forEach((x,i)=>{s+=candle(30+i*30,x[0],x[1],x[2],x[3],16);if(i>=2)ma.push(`${30+i*30},${Y(d.slice(i-2,i+1).reduce((a,y)=>a+y[3],0)/3)}`)});return s+`<polyline points="${ma.join(" ")}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 4"/>`+lab(330,Y(78),t("高點越來越高","Higher highs"),"end")+lab(330,Y(-6),t("低點也越來越高","Higher lows"),"end")},
  d:t("一根 K 棒只說一天的故事，要連起來看。高點一次比一次高、低點也一次比一次高，就是「上升趨勢」；藍色虛線是均線，股價在均線上面通常偏強。","One candle tells one day. Look at many together: higher highs and higher lows = an uptrend. The blue dashed line is a moving average; price above it is usually stronger.")},
 {t:t("加上成交量一起看","Add volume"),
  svg:()=>{const d=[[28,42,24,38,30],[38,41,28,31,22],[31,40,27,37,26],[37,72,36,70,95]];let s="";d.forEach((x,i)=>{const cx=70+i*60,col=x[3]>=x[0]?U:Dn;s+=`<g transform="translate(0,-40)">${candle(cx,x[0],x[1],x[2],x[3],30)}</g><rect x="${cx-15}" y="${170-x[4]*.45}" width="30" height="${x[4]*.45}" fill="${col}" opacity=".45"/>`});return s+lab(228,34,t("帶大量的長K","Big candle,"),"end")+lab(228,48,t("","big volume"),"end")+lab(355,165,t("成交量","Volume"),"end")+`<line x1="40" x2="355" y1="112" y2="112" stroke="var(--line)"/>`},
  d:t("K 棒旁邊要搭配成交量：一根大漲的 K 棒，如果成交量也明顯放大，代表很多人真的在買，比沒量的上漲更可信。","Check volume with each candle: a big rise on much higher volume means many people are really buying, which is more convincing than a rise on low volume.")}
];
let i=0;
function show(){
  const ls=L(),x=ls[i];
  $("klN").textContent=`${i+1} / ${ls.length}`;
  $("klT").textContent=x.t;
  $("klSvg").innerHTML=x.svg();
  $("klD").textContent=x.d;
  $("klPrev").disabled=i===0;
  $("klNext").hidden=i===ls.length-1;$("klTry").hidden=i!==ls.length-1;
  $("klDots").innerHTML=ls.map((_,k)=>`<span class="${k===i?"on":""}"></span>`).join("");
  const s=$("klSvg");s.classList.remove("kpop");void s.offsetWidth;s.classList.add("kpop");
}
$("klPrev").onclick=()=>{if(i>0){i--;show()}};
$("klNext").onclick=()=>{i++;show()};
$("klTry").onclick=()=>{if(window.openStock)openStock("2330")};
window.klRefresh=show;
show();
})();
