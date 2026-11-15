/* 小測驗（會升級、不重複）＋ 觀念複習 */
(function(){
const $=id=>document.getElementById(id);
const st={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- 觀念卡 ---------- */
const C={
 color:["台股的紅綠","紅色＝漲、綠色＝跌，跟美股相反。","今天指數 ▲ 就是紅字"],
 change:["漲跌怎麼算","漲跌＝今天收盤 − 昨天收盤。漲跌幅＝漲跌 ÷ 昨收。","昨收 100、今收 103 → +3%"],
 kbar:["K 棒","一根棒子畫出開、高、低、收。收 > 開＝紅 K；收 < 開＝綠（黑）K。","K 棒顏色比「開盤」，漲跌比「昨收」"],
 shadow:["上影線／下影線","上影線長＝衝高後被賣回；下影線長＝跌深後被買回。","長上影線常代表上方有賣壓"],
 lot:["張與股","1 張＝1,000 股。一張的價錢＝股價 × 1,000。","股價 50 元 → 一張 5 萬元"],
 oddlot:["零股","1～999 股的交易。盤中零股 9:00～13:30 可以買賣。","錢不多也能買高價股"],
 limit:["漲停／跌停","台股一般股票每天最多漲跌 10%。","昨收 100 → 最高 110、最低 90"],
 hours:["交易時間","週一到週五 9:00～13:30，假日不開盤。","8:30 起可以先掛單"],
 volume:["成交量","成交了多少（張或金額）。量大＝交易熱絡，不等於一定漲。","大漲或大跌時常會爆量"],
 breadth:["漲跌家數","有幾家漲、幾家跌。看是「全面」還是「少數股票」在動。","指數漲但多數股跌＝少數大型股在撐"],
 inst:["三大法人","外資、投信、自營商。資金大，常被當成市場方向的參考。","散戶不是法人"],
 buysell:["買超／賣超","買超＝買進比賣出多（差額）；賣超相反。","外資買超 100 億 ≠ 外資買了 100 億"],
 index:["加權指數","依「市值」加權計算所有上市股票的表現，俗稱大盤。","大公司影響比較大"],
 weight:["權值股","市值很大、對指數影響大的股票。","台積電一檔就占指數很大比重"],
 etf:["ETF","把一籃子股票打包成一檔，一次分散買很多公司。","0050＝台灣前 50 大公司"],
 lev:["槓桿／反向 ETF","正2 漲跌約為指數 2 倍；反1 方向相反。每天重新計算，盤整時會耗損。","指數 +10% 再 −10%，正2 約 −4%"],
 fee:["手續費","買和賣都要付，上限 0.1425%，很多券商有折扣。","買 10 萬元 → 最多 142 元"],
 tax:["證交稅","只有「賣出」時收。股票 0.3%、ETF 0.1%，現股當沖 0.15%。","賣 10 萬元股票 → 300 元"],
 settle:["交割 T+2","買進後第 2 個營業日要把錢扣款完成。沒錢付＝違約交割，很嚴重。","週一買 → 週三扣款"],
 eps:["EPS 每股盈餘","公司稅後淨利 ÷ 股數，代表每一股賺多少錢。","EPS 5 元＝每股賺 5 元"],
 pe:["本益比 P/E","股價 ÷ EPS。越高代表市場願意為未來成長付越多錢。","股價 100、EPS 5 → 本益比 20"],
 yield:["殖利率","股利 ÷ 股價。股價跌、股利不變 → 殖利率變高。","股價 100、配 5 元 → 5%"],
 div:["除息／填息","配息那天股價會先扣掉股利（除息）；之後漲回原價叫填息。","100 元配 5 元 → 除息後 95 元"],
 ma:["均線","過去 N 天的平均收盤價。5 日＝週線、20 日＝月線、60 日＝季線。","股價在月線上＝近一個月買的人多數賺錢"],
 cross:["黃金交叉／死亡交叉","短均線往上穿過長均線＝黃金交叉；往下跌破＝死亡交叉。","只是參考訊號，不保證漲跌"],
 support:["支撐與壓力","支撐＝跌到附近常有人買；壓力＝漲到附近常有人賣。壓力被突破後常變支撐。","前波高點常是壓力"],
 volprice:["量價關係","價漲量增＝買氣強；價漲量縮＝追價的人變少，叫價量背離。","創新高卻量縮要小心"],
 mktcap:["市值","股價 × 發行股數，代表整家公司在市場上值多少錢。","市值越大，在指數裡越重要"],
 otc:["上市／上櫃／興櫃","上市在證交所、上櫃在櫃買中心，興櫃沒有漲跌幅限制、風險較高。","櫃買指數看的是上櫃股票"],
 dca:["定期定額","每個月固定金額買進，不用猜高低點，適合新手長期投資。","每月 3,000 元買 0050"],
 revenue:["月營收","上市櫃公司每月 10 日前公布上個月營收，是最即時的成績單。","營收連續成長常受市場注意"],
 report:["財報公布時間","Q1：5/15 前；Q2：8/14 前；Q3：11/14 前；年報：隔年 3 月底前。","財報公布前後股價常波動"],
 margin:["融資／融券","融資＝跟券商借錢買股票；融券＝借股票來賣（看跌）。都有槓桿風險。","融資買進若大跌可能被追繳"],
 daytrade:["當沖","同一天買進又賣出。風險高，新手不建議。","賠錢也要付手續費和稅"],
 pb:["本淨比 P/B","股價 ÷ 每股淨值。低於 1 代表股價比公司帳面淨值便宜。","金融股常用本淨比評估"],
 roe:["ROE","股東權益報酬率：公司用股東的錢賺錢的效率。","ROE 15%＝每 100 元賺 15 元"],
 disposal:["注意股／處置股","股價或成交量異常時，交易所會先列注意股，嚴重的變處置股（交易受限制）。","處置股要先付錢才能買"],
 diversify:["分散投資","不要把錢全放一檔，可以降低「單一公司」出事的風險。","ETF 是最簡單的分散方法"]
};

/* ---------- 題庫：3 個等級 ---------- */
const BANK=[
 // Lv1 新手
 [1,"color","台股紅色代表？",["上漲","下跌","平盤"]],
 [1,"lot","1 張股票＝幾股？",["1,000 股","100 股","10 股"]],
 [1,"limit","一般股票一天最多漲多少？",["10%","7%","沒有上限"]],
 [1,"hours","台股幾點收盤？",["13:30","15:00","12:00"]],
 [1,"kbar","收盤比開盤高，K 棒是？",["紅 K","綠 K","沒有 K 棒"]],
 [1,"oddlot","不到一張的股票叫？",["零股","散股","小股"]],
 [1,"volume","成交量大通常代表？",["交易熱絡","股價一定漲","公司很賺錢"]],
 [1,"inst","哪一個「不是」三大法人？",["散戶","外資","投信"]],
 [1,"buysell","「買超」的意思是？",["買進比賣出多","買了很多次","買得太貴"]],
 [1,"index","加權指數代表什麼？",["整體上市股票","台積電股價","前十大平均"]],
 [1,"weight","誰對加權指數影響最大？",["市值最大的","股價最高的","最便宜的"]],
 [1,"etf","0050 是哪一種商品？",["ETF","個股","債券"]],
 [1,"breadth","指數漲、但多數股票跌，可能是？",["少數大型股在撐","全面大漲","資料錯誤"]],
 [1,"shadow","上影線很長代表？",["衝高後被賣回","收在最高點","開盤就跌停"]],
 [1,"change","今天的漲跌是跟誰比？",["昨天收盤","今天開盤","上週收盤"]],
 [1,"limit","漲到當天上限叫？",["漲停","漲滿","封頂"]],
 [1,"lot","股價 50 元，一張多少錢？",["5 萬元","5 千元","50 萬元"]],
 [1,"hours","台股星期六有開盤嗎？",["沒有","有","只開上午"]],
 [1,"buysell","外資「賣超」代表？",["賣出比買進多","股票全賣光","外資虧錢"]],
 [1,"color","看盤軟體出現綠色 ▼ 代表？",["下跌","上漲","停止交易"]],
 // Lv2 進階
 [2,"fee","券商手續費上限是？",["0.1425%","1.425%","0.3%"]],
 [2,"tax","證交稅什麼時候收？",["賣出時","買進時","買賣都收"]],
 [2,"tax","一般股票的證交稅率？",["0.3%","0.1%","1%"]],
 [2,"settle","買進股票後哪天要付款？",["T+2","當天","T+5"]],
 [2,"eps","EPS 是什麼？",["每股盈餘","每股股價","每股股利"]],
 [2,"pe","本益比怎麼算？",["股價 ÷ EPS","EPS ÷ 股價","股利 ÷ 股價"]],
 [2,"yield","殖利率怎麼算？",["股利 ÷ 股價","股價 ÷ 股利","EPS ÷ 股價"]],
 [2,"div","除息當天股價會？",["扣掉股利","自動上漲","完全不變"]],
 [2,"div","除息後漲回原價叫？",["填息","貼息","回息"]],
 [2,"ma","20 日均線俗稱？",["月線","週線","季線"]],
 [2,"ma","60 日均線俗稱？",["季線","月線","年線"]],
 [2,"cross","短均線往上穿過長均線叫？",["黃金交叉","死亡交叉","均線糾結"]],
 [2,"volprice","價漲量增通常被看作？",["買氣強","賣壓重","沒人交易"]],
 [2,"support","跌到某價位常反彈，那叫？",["支撐","壓力","停損"]],
 [2,"lev","長期抱正2 ETF 的風險？",["盤整時耗損","保證賺 2 倍","不能賣出"]],
 [2,"mktcap","市值怎麼算？",["股價 × 股數","股價 × 成交量","EPS × 股數"]],
 [2,"otc","上櫃股票在哪裡交易？",["櫃買中心","證交所","興櫃市場"]],
 [2,"dca","每月固定金額買進叫？",["定期定額","當沖","融資"]],
 [2,"revenue","月營收什麼時候公布？",["每月 10 日前","每季結束","每年一次"]],
 [2,"oddlot","盤中零股幾點可以交易？",["9:00～13:30","只有晚上","不能交易"]],
 // Lv3 高手
 [3,"margin","「融資」是什麼？",["借錢買股票","借股票來賣","賣股換現金"]],
 [3,"margin","「融券」是什麼？",["借股票來賣","借錢買股票","把股票存起來"]],
 [3,"daytrade","同一天買進又賣出叫？",["當沖","隔日沖","存股"]],
 [3,"tax","現股當沖的證交稅率？",["0.15%","0.3%","免稅"]],
 [3,"pb","本淨比怎麼算？",["股價 ÷ 每股淨值","淨值 ÷ 營收","股價 ÷ EPS"]],
 [3,"roe","ROE 是什麼？",["股東權益報酬率","負債比率","本益比"]],
 [3,"disposal","交易異常、被限制交易的股票叫？",["處置股","權值股","定存股"]],
 [3,"volprice","創新高但成交量變少，叫？",["價量背離","價量齊揚","量價同步"]],
 [3,"support","壓力被突破後，常變成？",["支撐","更大壓力","停損點"]],
 [3,"cross","死亡交叉是？",["短均線跌破長均線","股價跌停","法人全賣"]],
 [3,"breadth","指數創新高、上漲家數卻變少？",["漲勢集中少數股","市場全面轉強","成交量增加"]],
 [3,"report","第三季財報最晚何時公布？",["11/14","9/30","隔年 3 月"]],
 [3,"pe","本益比偏高通常表示？",["市場期待成長","公司一定虧損","股價一定會跌"]],
 [3,"yield","股價下跌、股利不變，殖利率？",["變高","變低","不變"]],
 [3,"diversify","分散投資主要降低哪種風險？",["單一公司風險","整個市場風險","手續費"]],
 [3,"settle","T+2 沒錢付款會變成？",["違約交割","自動取消","延後一週"]],
 [3,"lev","指數 +10% 再 −10%，正2 大約？",["虧約 4%","剛好打平","賺約 4%"]],
 [3,"pb","本淨比小於 1 代表？",["股價低於淨值","公司虧損","股價很貴"]]
].map((x,i)=>({id:i,lv:x[0],t:x[1],q:x[2],o:x[3]})); // 每題第一個選項是正解，出題時會打亂

const LV={1:"新手",2:"進階",3:"高手"};
const ROUND=5, UP=4;
let lv=st.get("tw_lv",1), seen=new Set(st.get("tw_seen",[])), weak=st.get("tw_weak",{}); // weak: {topic:次數}
let round=[],qi=0,score=0,locked=false;
const save=()=>{st.set("tw_lv",lv);st.set("tw_seen",[...seen]);st.set("tw_weak",weak)};
const pool=l=>BANK.filter(q=>q.lv===l&&!seen.has(q.id));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};

function header(){
  const tot=BANK.filter(q=>q.lv===lv).length, done=tot-pool(lv).length;
  $("lvBadge").textContent=`Lv.${lv} ${LV[lv]}`; $("lvBadge").dataset.lv=lv;
  $("lvFill").style.width=(done/tot*100)+"%";
  $("lvTxt").textContent=`${LV[lv]}題庫 ${done}/${tot} 題做過`+(lv<3?`・一回合答對 ${UP} 題以上就升級`:"・最高等級");
  const n=Object.keys(weak).length; $("wrongN").textContent=n?n:""; $("wrongN").style.display=n?"":"none";
}
function show(v){["qStart","qPlay","qEnd"].forEach(id=>$(id).hidden=id!==v)}

function start(){
  let p=pool(lv);
  // 這個等級做完了：往上找；全部做完就請使用者重置
  while(p.length===0&&lv<3){lv++;p=pool(lv)}
  if(p.length===0)p=BANK.filter(x=>!seen.has(x.id)); // 高等級做完了，補做之前跳過的題目
  if(p.length===0){
    show("qEnd");
    $("qEnd").innerHTML=`<div class="big-emoji">🏆</div><div class="q">全部 ${BANK.length} 題都做完了！</div><p class="hint">題目不會重複，所以題庫用完了。可以去「觀念複習」複習，或重新開始一輪。</p><div class="row2"><button class="btn" id="goRev">觀念複習</button><button class="btn ghost" id="reset">重新開始</button></div>`;
    $("goRev").onclick=()=>tab("rev"); $("reset").onclick=()=>{if(resetArm()){seen=new Set();lv=1;save();header();show("qStart")}};
    header(); return;
  }
  let pick5=shuffle(p).slice(0,ROUND); if(pick5.length<ROUND&&lv<3)pick5=pick5.concat(shuffle(pool(lv+1)).slice(0,ROUND-pick5.length));
  round=pick5.map(q=>{const o=shuffle(q.o.map((t,i)=>({t,ok:i===0})));return {...q,opts:o}});
  qi=0;score=0; header(); show("qPlay");
  $("qDots").innerHTML=round.map(()=>"<span></span>").join(""); ask();
}
function ask(){
  const q=round[qi]; locked=false;
  [...$("qDots").children].forEach((d,i)=>{d.classList.toggle("on",i===qi)});
  $("qText").textContent=q.q; $("qFb").innerHTML=""; $("qNext").disabled=true;
  $("qNext").textContent=qi===round.length-1?"看結果":"下一題 →";
  $("qOpts").innerHTML=q.opts.map((o,i)=>`<button data-i="${i}">${o.t}</button>`).join("");
  $("qOpts").querySelectorAll("button").forEach(b=>b.onclick=()=>pick(+b.dataset.i,b));
}
function pick(i,b){
  if(locked)return; locked=true;
  const q=round[qi], ok=q.opts[i].ok, ri=q.opts.findIndex(o=>o.ok);
  $("qOpts").children[ri].classList.add("right");
  seen.add(q.id);
  const dot=$("qDots").children[qi];
  if(ok){score++;dot.classList.add("ok");$("qFb").innerHTML=`<b class="down">答對了！</b> ${C[q.t][1]}`;}
  else{b.classList.add("wrong");dot.classList.add("ng");weak[q.t]=(weak[q.t]||0)+1;$("qFb").innerHTML=`<b class="up">差一點～</b> ${C[q.t][1]}<br><span class="sub">已加入「觀念複習 › 要加強」</span>`;}
  save(); header(); $("qNext").disabled=false;
}
function finish(){
  show("qEnd");
  let msg,emo,extra="";
  const leftThis=pool(lv).length;
  if(score>=UP&&lv<3){lv++;save();emo="🚀";msg=`升級到 Lv.${lv} ${LV[lv]}！`;extra=`接下來是更進階的觀念題。`;}
  else if(score>=UP){emo="🏆";msg="高手等級，太強了！";extra=leftThis?`還有 ${leftThis} 題高手題可以挑戰。`:"";}
  else if(score>=3){emo="👍";msg="不錯喔！";extra=`再一回合答對 ${UP} 題就能升級。`;}
  else{emo="💪";msg="先複習一下再挑戰";extra="錯的觀念已經放進「觀念複習」。";}
  $("qEnd").innerHTML=`<div class="big-emoji pop-in">${emo}</div><div class="q">${score} / ${round.length}　${msg}</div><p class="hint">${extra}</p><div class="row2"><button class="btn" id="again">再一回合</button>${score<UP?`<button class="btn ghost" id="goRev">觀念複習</button>`:""}</div>`;
  $("again").onclick=start; if($("goRev"))$("goRev").onclick=()=>tab("rev");
  if(emo==="🚀")confetti();
  header();
}
$("qStart").innerHTML=`<p class="hint">每回合 ${ROUND} 題，<b>做過的題目不會再出現</b>。答得好會自動升級到進階、高手觀念題。</p><button class="btn" id="go">開始測驗</button>`;
$("go").onclick=start;
$("qNext").onclick=()=>{if(qi<round.length-1){qi++;ask()}else finish()};

/* 重置要按兩次，避免誤觸（沙盒裡不能用 confirm） */
let armT=0; function resetArm(){const b=$("reset");if(Date.now()-armT<3000)return true;armT=Date.now();b.textContent="再按一次確認";setTimeout(()=>{if(b)b.textContent="重新開始"},3000);return false}

/* ---------- 觀念複習（翻牌卡） ---------- */
let rf="all",ri=0,list=[];
function buildList(){
  list=rf==="weak"?Object.keys(weak).sort((a,b)=>weak[b]-weak[a]):Object.keys(C);
  if(ri>=list.length)ri=Math.max(0,list.length-1);
}
function card(){
  buildList();
  const fc=$("flip");
  if(!list.length){$("revEmpty").hidden=false;$("revBody").hidden=true;return}
  $("revEmpty").hidden=true;$("revBody").hidden=false;
  const k=list[ri],c=C[k];
  fc.classList.remove("flipped");
  $("fFront").innerHTML=`<div class="ftag">${rf==="weak"?`錯過 ${weak[k]} 次`:"觀念"}</div><div class="ftitle">${c[0]}</div><div class="sub">點一下翻面</div>`;
  $("fBack").innerHTML=`<div class="ftitle sm">${c[0]}</div><p>${c[1]}</p><div class="feg">例：${c[2]}</div>`;
  $("revPos").textContent=`${ri+1} / ${list.length}`;
  $("revPrev").disabled=ri===0; $("revNext").disabled=ri===list.length-1;
  $("revOk").hidden=rf!=="weak";
}
$("flip").onclick=()=>$("flip").classList.toggle("flipped");
$("revPrev").onclick=()=>{ri--;card()}; $("revNext").onclick=()=>{ri++;card()};
$("revOk").onclick=()=>{const k=list[ri];delete weak[k];save();header();
  $("flip").classList.add("gone");setTimeout(()=>{$("flip").classList.remove("gone");card()},300)};
document.querySelectorAll("#revSeg button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#revSeg button").forEach(x=>x.classList.toggle("on",x===b));rf=b.dataset.f;ri=0;card()});

/* ---------- 分頁切換 ---------- */
function tab(w){
  $("tabQuiz").classList.toggle("on",w==="quiz");$("tabRev").classList.toggle("on",w==="rev");
  $("quizView").hidden=w!=="quiz";$("revView").hidden=w!=="rev";
  if(w==="rev"){if(Object.keys(weak).length&&rf!=="weak"){document.querySelector('#revSeg [data-f="weak"]').click()}else card()}
}
$("tabQuiz").onclick=()=>tab("quiz");$("tabRev").onclick=()=>tab("rev");

/* 升級彩帶 */
function confetti(){
  const box=$("quizCard"),cols=["#e0384b","#3e63dd","#f5b700","#1f9a5a"];
  for(let i=0;i<28;i++){const s=document.createElement("i");s.className="cf";s.style.left=Math.random()*100+"%";s.style.background=cols[i%4];s.style.animationDelay=Math.random()*.3+"s";s.style.setProperty("--dx",(Math.random()*80-40)+"px");box.appendChild(s);setTimeout(()=>s.remove(),1600)}
}

header(); show("qStart");
window.__QUIZ={BANK,C};
})();
