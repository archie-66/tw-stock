/* 語言切換：中文 / English。切換時存起來並重新載入。 */
var LANG=(function(){try{var v=localStorage.getItem("twlang");if(v)return v}catch(e){}return /^zh/i.test(navigator.language||"")?"zh":"en"})();
var EN=LANG==="en";
function t(zh,en){return EN?en:zh}
function setLang(v){try{localStorage.setItem("twlang",v)}catch(e){}location.reload()}
document.documentElement.lang=EN?"en":"zh-Hant";

/* 畫面上固定文字的英文對照 */
var STATIC={
"大盤":"Market","載入中…":"Loading…","重新整理":"Refresh","設定":"Settings","簡易":"Simple","進階":"Advanced",
"加權指數":"TAIEX","（大盤）":" (the whole market)","昨天收盤":"Yesterday's close","一週前":"A week ago","最近收盤走勢":"Recent closing trend",
"一根":"One","K 棒":"candlestick","看懂今天":" explains today","把今天的開盤、最高、最低、收盤畫成一根棒子。":"Today's open, high, low and close drawn as one bar.",
"左右滑動可以換頁；虛線底線的字可以點。右上角齒輪可以換深色模式和漲跌顏色。":"Swipe left or right to change pages. Tap words with a dotted underline. The gear at the top right changes dark mode, colors and language.",
"熱度":"Heat","今天買賣多熱絡？":"How busy was trading today?",
"成交量就是今天「成交了多少」。量大＝很多人在交易，量小＝大家在觀望。":"Volume is how much was traded today. High volume = lots of people trading; low volume = people are waiting.",
"成交金額":"Trading value","億":"bn NT$","成交張數":"Lots traded","萬張":"M lots",
"大家都漲，還是少數在撐？":"Is everything rising, or just a few stocks?","看":"Check","漲跌家數":"advancers vs. decliners","才知道整體氣氛。":"to see the real mood.",
"市場溫度：":"Market temperature: ","0 很冷":"0 Cold","50 普通":"50 Normal","100 很熱":"100 Hot","今天解讀：":"Today: ",
"溫度＝上漲家數 ÷（上漲＋下跌）× 100。":"Temperature = advancers ÷ (advancers + decliners) × 100.",
"法人":"Institutions","大戶在買還是在賣？":"Are the big players buying or selling?","三大法人":"The three major institutions","是資金最大的三種機構。":" are the three biggest kinds of investors.","買超":"Net buying","＝買得比賣得多。":" = they bought more than they sold.",
"最近幾天的方向":"Direction in recent days","法人買超就代表會漲嗎？":"Does institutional buying mean prices will rise?",
"不一定。法人買賣是「資金往哪裡去」的線索，但他們也會買錯、也會短線進出。新手可以把它當成「市場氣氛」的參考之一，而不是買賣的理由。":"Not necessarily. It is a clue about where money is going, but institutions can be wrong and also trade short-term. Treat it as one sign of market mood, not a reason to buy or sell.",
"個股":"Stocks","自選股":"Watchlist","今天大家在交易什麼？":"What are people trading today?","搜尋":"Search","輸入股票代號或名稱，例如 2330、台積":"Stock code or name, e.g. 2330","取消":"Cancel",
"點一檔看說明。排行＝市場注意力，":"Tap a stock for details. Rankings show attention, ","不是推薦":"not recommendations","。":".","漲幅":"% change",
"今天漲最多／跌最多":"Biggest gainers / losers today","只算成交金額 1 億元以上的股票。":"Only stocks that traded over NT$100M today.","新手觀念":"Beginner tip",
"高價股（像一張好幾百萬的）成交張數少但金額大；低價股張數多但金額小，所以「金額」和「張數」兩個排行會很不一樣。熱門股常常漲得快、跌得也快。":"Expensive stocks trade few lots but a lot of money; cheap stocks trade many lots but little money, so the two rankings look very different. Hot stocks often rise fast and fall fast.",
"模擬交易":"Paper trading","模擬帳戶總資產":"Total paper account value","現金":"Cash","股票市值":"Stock value","資產變化":"Account value over time","練習下單":"Practice an order",
"用假錢練習，用最新收盤價成交（盤後模擬），會照真實規則扣手續費和證交稅。":"Practice with fake money at the latest closing price. Real fees and transaction tax are charged.",
"搜尋股票代號或名稱":"Search stock code or name","先搜尋一檔股票，或到「個股」頁按「模擬買進」。":"Search a stock first, or tap \"Paper buy\" on the Stocks page.",
"買進":"Buy","賣出":"Sell","整張（1,000 股）":"Round lot (1,000 sh)","零股（1～999 股）":"Odd lot (1–999 sh)","張":"lots","＋":"+","最多":"Max","確認買進":"Confirm buy",
"我的持股":"My holdings","交易紀錄":"Trade history","重新開始":"Start over","清空所有持股和紀錄，用新的起始資金重來。":"Clear all holdings and history, and start again with new money.",
"10 萬":"100K","50 萬":"500K","100 萬":"1M","學習":"Learn","🙋 問問題":"🙋 Ask a question","看不懂的地方可以直接問，或點下面的常見問題。":"Not sure about something? Ask here, or tap a common question below.",
"例如：成交量大代表什麼？":"e.g. What does high volume mean?","問":"Ask","🎯 小測驗":"🎯 Quiz","測驗":"Quiz","觀念複習":"Review","下一題 →":"Next →","全部觀念":"All concepts","要加強":"Needs work",
"🎉 目前沒有要加強的觀念":"🎉 Nothing to work on right now","測驗答錯的觀念會自動放進來":"Concepts you miss in the quiz show up here","✅ 我記住了":"✅ Got it","📖 名詞小辭典":"📖 Glossary",
"學習工具，只描述「發生了什麼」，":"A learning tool that only describes what happened. ","不是投資建議":"Not investment advice","，也不預測股價。":", and no price predictions.",
"每個交易日收盤後自動更新：股價約 14:00～14:30、法人資料約 15:00～15:30（開著 App 也會自己更新）。":"Updates automatically after the close each trading day: prices around 2:00–2:30 pm, institutional data around 3:00–3:30 pm (Taipei). It also refreshes itself while open.",
"資料來源：":"Data: ","設計參考：投資先生 App 簡易模式、quants.tw。":"Design inspired by the Mr. Investment app's simple mode and quants.tw.",
"模擬":"Practice","← 左右滑動換頁 →":"← Swipe to change pages →","外觀":"Appearance","跟隨系統":"System","淺色":"Light","深色":"Dark","漲跌顏色":"Up/down colors",
"台股":"Taiwan","漲":"up","跌":"down","國際":"Global","顯示內容":"Detail level","設定只存在這台裝置上。":"Settings are saved on this device only.","語言":"Language","進階數據":"Advanced data","完成":"Done"
};
function applyStatic(root){
  if(!EN)return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
  while(n=w.nextNode())list.push(n);
  list.forEach(function(n){var s=n.nodeValue.trim();if(s&&STATIC[s]!=null)n.nodeValue=n.nodeValue.replace(s,STATIC[s])});
  root.querySelectorAll("[placeholder],[aria-label],[data-title]").forEach(function(el){
    ["placeholder","aria-label","data-title"].forEach(function(a){var v=el.getAttribute(a);if(v&&STATIC[v]!=null)el.setAttribute(a,STATIC[v])})});
}
applyStatic(document.body);
