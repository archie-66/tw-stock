/* 小測驗（會升級、不重複）＋ 觀念複習 */
(function(){
const $=id=>document.getElementById(id);
const st={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- 觀念卡 ---------- */
const C_ZH={
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
 diversify:["分散投資","不要把錢全放一檔，可以降低「單一公司」出事的風險。","ETF 是最簡單的分散方法"],
 tick:["升降單位（跳動單位）","股價每次最少能跳多少錢：10 元以下 0.01、10～50 元 0.05、50～100 元 0.1、100～500 元 0.5、500～1000 元 1、1000 元以上 5。","股價 85 元時，每跳一檔是 0.1 元"],
 exright:["除權（配股）","公司用股票發股利，股數變多、股價依比例往下調。配股 1 元＝每 1,000 股多 100 股。","1 張配股 1 元 → 變 1,100 股"],
 margins:["毛利率／營業利益率","毛利率＝毛利 ÷ 營收；營業利益率再扣掉營業費用（薪水、研發、行銷）。越高代表本業越會賺。","營收成長但毛利率下降＝賣得多、賺得薄"],
 debt:["負債比率","負債 ÷ 總資產。太高代表借太多錢，景氣不好時風險大。","負債比 80% 比 30% 的公司風險高"],
 statements:["三大財報","損益表看賺多少、資產負債表看有多少家當和負債、現金流量表看錢真的有沒有進來。","帳上賺錢但現金一直流出要小心"],
 kd:["KD 指標","看股價在最近一段時間的相對位置。80 以上叫超買、20 以下叫超賣；K 往上穿過 D 叫黃金交叉。","超買不代表馬上會跌"],
 rsi:["RSI 相對強弱","看最近漲的力道和跌的力道誰強。70～80 以上偏超買、20～30 以下偏超賣。股價和 RSI 方向不一致叫背離。","股價創新低、RSI 沒創新低＝背離"],
 premium:["ETF 溢價／折價","ETF 市價比淨值高叫溢價，比淨值低叫折價。溢價太多時買進，等於買貴了。","淨值 30、市價 31.5 → 溢價 5%"],
 beta:["Beta 值","股票跟大盤一起動的程度。大於 1 波動比大盤大，小於 1 比較穩。","Beta 1.5：大盤漲 10%，它大約漲 15%"],
 recovery:["虧損回本","跌了多少%，要漲回來需要更多%。跌 50% 要漲 100% 才回本。","100 → 50 → 要漲回 100"],
 breakeven:["損益兩平價","買進要付手續費、賣出要付手續費和稅，所以股價要漲一點點才不會賠。一般股票約要漲 0.6%。","100 元買進 → 約 100.6 元才打平"],
 compound:["複利與 72 法則","報酬會再生報酬。72 ÷ 年報酬率≈資金翻倍要幾年。","年報酬 8% → 約 9 年翻倍"]
};

/* ---------- 題庫：3 個等級 ---------- */
const BANK_ZH=[
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
 [3,"pb","本淨比小於 1 代表？",["股價低於淨值","公司虧損","股價很貴"]],
 // Lv4 大師
 [4,"pe","股價 60、EPS 3，本益比？",["20","18","180"]],
 [4,"yield","股價 50、配息 2 元，殖利率？",["4%","2.5%","25%"]],
 [4,"limit","昨收 85 元，漲停價？",["93.5","94","90"]],
 [4,"tick","股價 50～100 元，每檔跳多少？",["0.1 元","0.05 元","0.5 元"]],
 [4,"tick","股價 500～1000 元，每檔跳多少？",["1 元","0.5 元","5 元"]],
 [4,"fee","買 10 萬元股票，手續費最多？",["142 元","1,425 元","20 元"]],
 [4,"tax","賣出 20 萬元股票，證交稅？",["600 元","200 元","2,000 元"]],
 [4,"exright","除權（配股）後，股數會？",["變多","變少","不變"]],
 [4,"margins","毛利率怎麼算？",["毛利 ÷ 營收","淨利 ÷ 營收","營收 ÷ 成本"]],
 [4,"margins","營業利益比毛利多扣了？",["營業費用","所得稅","業外收入"]],
 [4,"debt","負債比率很高代表？",["財務風險較高","一定很賺錢","股價會漲"]],
 [4,"statements","帳上賺錢卻沒現金，要看？",["現金流量表","損益表","股東名冊"]],
 [4,"kd","KD 大於 80 通常叫？",["超買","超賣","黃金交叉"]],
 [4,"rsi","RSI 低於 20～30 通常叫？",["超賣","超買","量縮"]],
 [4,"volprice","下跌時成交量放大，常代表？",["賣壓沉重","買氣很強","沒人交易"]],
 [4,"support","跌破支撐後，支撐常變成？",["壓力","更強支撐","停利點"]],
 [4,"premium","ETF 市價高於淨值叫？",["溢價","折價","填息"]],
 [4,"premium","ETF 溢價很多時買進，風險是？",["買貴了","買到折扣","不能賣"]],
 [4,"margin","融資買進後大跌，可能被？",["追繳保證金","退還股款","自動加碼"]],
 [4,"beta","Beta 大於 1 的股票通常？",["波動比大盤大","比大盤穩","不會跌"]],
 // Lv5 傳奇
 [5,"lev","指數 −10% 再 +10%，正2 約？",["−4%","−2%","打平"]],
 [5,"limit","昨收 9.5 元，跌停價？",["8.55","8.5","8.6"]],
 [5,"limit","連續兩天漲停，約漲了多少？",["21%","20%","10%"]],
 [5,"recovery","虧損 50% 後，要漲多少才回本？",["100%","50%","75%"]],
 [5,"pe","EPS 成長 20%、本益比不變，股價？",["約漲 20%","不變","約跌 20%"]],
 [5,"div","股價 100 元配 3 元，除息參考價？",["97 元","100 元","103 元"]],
 [5,"exright","配股 1 元，1 張會變幾股？",["1,100 股","1,010 股","2,000 股"]],
 [5,"fee","股票買賣各一次，成本合計約？",["0.585%","0.3%","0.1425%"]],
 [5,"breakeven","100 元買進，約漲到多少才不賠？",["100.6 元","100.1 元","103 元"]],
 [5,"dca","定期定額遇到下跌，同樣金額會買到？",["更多股數","更少股數","一樣股數"]],
 [5,"compound","年報酬 7%，資金翻倍約要？",["約 10 年","約 7 年","約 20 年"]],
 [5,"pb","每股淨值 40、股價 30，本淨比？",["0.75","1.33","10"]],
 [5,"roe","淨利 15 億、股東權益 100 億，ROE？",["15%","6.7%","1.5%"]],
 [5,"diversify","兩檔走勢完全一樣，分散效果？",["幾乎沒有","非常好","加倍"]],
 [5,"inst","外資賣超但指數上漲，可能是？",["其他人在買","資料錯誤","明天一定跌"]],
 [5,"kd","K 由下往上穿過 D 叫？",["黃金交叉","死亡交叉","背離"]],
 [5,"rsi","股價創新低、RSI 沒創新低叫？",["背離","超買","同步"]],
 [5,"settle","週四買進，哪天扣款？",["下週一","週五","週六"]],
 [5,"margins","營收成長、毛利率下降，可能是？",["賣得多但賺得薄","成本降低","漲價成功"]],
 [5,"beta","Beta 0.5，大盤跌 10%，它約？",["跌 5%","跌 10%","漲 5%"]]
];
/* ---------- English ---------- */
const C_EN={
 color:["Taiwan's colors","Red = up, green = down. The opposite of the US.","The index shown in red ▲ means it rose"],
 change:["How change is counted","Change = today's close − yesterday's close. % change = change ÷ yesterday's close.","100 → 103 = +3%"],
 kbar:["Candlestick","One bar shows open, high, low, close. Close > open = red candle; close < open = green (black) candle.","Color compares with the open; change compares with yesterday"],
 shadow:["Upper / lower shadow","Long upper shadow = pushed up, then sold back. Long lower shadow = dropped, then bought back.","A long upper shadow often means selling pressure above"],
 lot:["Lots and shares","1 lot = 1,000 shares. Price of a lot = share price × 1,000.","NT$50 stock → NT$50,000 per lot"],
 oddlot:["Odd lots","Trading 1–999 shares. Intraday odd-lot trading runs 9:00 am – 1:30 pm.","Lets you buy expensive stocks with little money"],
 limit:["Limit up / down","Most Taiwan stocks can move at most 10% a day.","Prev close 100 → max 110, min 90"],
 hours:["Trading hours","Monday to Friday, 9:00 am – 1:30 pm. Closed on weekends.","Orders can be placed from 8:30 am"],
 volume:["Volume","How much was traded (lots or value). High volume = busy trading, not a guarantee of gains.","Big moves often come with big volume"],
 breadth:["Advancers / decliners","How many stocks rose vs. fell. Was the move broad, or just a few stocks?","Index up but most stocks down = a few big stocks holding it up"],
 inst:["Three major institutions","Foreign investors, investment trusts and dealers. They move big money and hint at market direction.","Retail investors are not institutions"],
 buysell:["Net buy / net sell","Net buy = bought more than sold (the difference). Net sell is the opposite.","Net buy of NT$10bn ≠ bought NT$10bn"],
 index:["TAIEX","Tracks all listed stocks, weighted by market value. Also called \"the market\".","Big companies count more"],
 weight:["Heavyweights","Huge companies with a big effect on the index.","TSMC alone is a large part of the index"],
 etf:["ETF","A basket of stocks in one product, so you diversify instantly.","0050 = Taiwan's top 50 companies"],
 lev:["Leveraged / inverse ETF","2× ETFs move about twice the index; inverse ETFs move the opposite way. They reset daily and lose value in choppy markets.","Index +10% then −10% → 2× ETF ≈ −4%"],
 fee:["Broker fee","Paid on both buying and selling, up to 0.1425%. Many brokers give discounts.","NT$100,000 trade → max NT$142"],
 tax:["Transaction tax","Charged only when you sell: 0.3% for stocks, 0.1% for ETFs, 0.15% for day trades.","Sell NT$100,000 of stock → NT$300"],
 settle:["Settlement T+2","You must pay on the 2nd business day after buying. Not paying = settlement default, which is serious.","Buy Monday → pay Wednesday"],
 eps:["EPS","Net profit ÷ number of shares: how much each share earned.","EPS 5 = each share earned NT$5"],
 pe:["P/E ratio","Price ÷ EPS. Higher means the market pays more for expected growth.","Price 100, EPS 5 → P/E 20"],
 yield:["Dividend yield","Dividend ÷ price. If the price falls and the dividend stays the same, the yield goes up.","Price 100, dividend 5 → 5%"],
 div:["Ex-dividend / recovery","On the ex-dividend day the price drops by the dividend; climbing back to the old price is called 填息 (fill-the-gap).","NT$100 stock pays 5 → NT$95 after"],
 ma:["Moving averages","Average closing price of the last N days. 5-day = weekly, 20-day = monthly, 60-day = quarterly line.","Price above the 20-day line = most buyers from the last month are in profit"],
 cross:["Golden / death cross","Short MA crossing above the long MA = golden cross; crossing below = death cross.","Only a signal, not a guarantee"],
 support:["Support and resistance","Support = where buyers often step in; resistance = where sellers often appear. Broken resistance often becomes support.","Previous highs are common resistance"],
 volprice:["Price and volume","Price up with volume up = strong buying. Price up with volume down = fewer buyers chasing (divergence).","New high on low volume: be careful"],
 mktcap:["Market cap","Share price × shares outstanding: what the whole company is worth on the market.","Bigger market cap = more weight in the index"],
 otc:["Listed / OTC / emerging","Listed stocks trade on TWSE, OTC stocks on TPEx. Emerging stocks have no daily limit and more risk.","The TPEx index tracks OTC stocks"],
 dca:["Dollar-cost averaging","Invest a fixed amount every month without guessing highs and lows. Good for beginners.","NT$3,000 into 0050 every month"],
 revenue:["Monthly revenue","Listed companies report last month's revenue by the 10th. It's the fastest report card.","Growing revenue attracts attention"],
 report:["Earnings deadlines","Q1 by May 15, Q2 by Aug 14, Q3 by Nov 14, annual by end of March next year.","Prices often swing around earnings"],
 margin:["Margin buying / short selling","Margin = borrow money to buy; short = borrow shares to sell (betting on a fall). Both use leverage.","A big drop can trigger a margin call"],
 daytrade:["Day trading","Buying and selling on the same day. High risk, not for beginners.","You pay fees and tax even when you lose"],
 pb:["P/B ratio","Price ÷ book value per share. Below 1 = priced below the company's book value.","Often used for financial stocks"],
 roe:["ROE","Return on equity: how well a company turns shareholders' money into profit.","ROE 15% = NT$15 profit per NT$100"],
 disposal:["Watch / disposal stocks","Unusual price or volume → the exchange flags it; serious cases get trading restrictions.","Disposal stocks require paying before buying"],
 diversify:["Diversification","Don't put all your money in one stock. It reduces single-company risk.","ETFs are the easiest way"],
 tick:["Tick size","The smallest price step: under NT$10: 0.01; 10–50: 0.05; 50–100: 0.1; 100–500: 0.5; 500–1000: 1; 1000+: 5.","At NT$85, each step is NT$0.1"],
 exright:["Stock dividends","The company pays in shares: you get more shares and the price adjusts down. A NT$1 stock dividend = 100 extra shares per 1,000.","1 lot + NT$1 stock dividend → 1,100 shares"],
 margins:["Gross / operating margin","Gross margin = gross profit ÷ revenue. Operating margin also subtracts operating expenses (salaries, R&D, marketing). Higher = the core business earns more.","Revenue up but margin down = selling more, earning less on each"],
 debt:["Debt ratio","Liabilities ÷ total assets. Too high means too much borrowing, which is risky in bad times.","80% debt ratio is riskier than 30%"],
 statements:["The three statements","Income statement: how much it earned. Balance sheet: what it owns and owes. Cash flow statement: whether cash actually came in.","Profits on paper but cash flowing out: be careful"],
 kd:["KD indicator","Shows where the price sits within its recent range. Above 80 = overbought, below 20 = oversold. K crossing above D = golden cross.","Overbought doesn't mean it will drop right away"],
 rsi:["RSI","Compares recent gains with recent losses. Above 70–80 leans overbought, below 20–30 leans oversold. Price and RSI moving differently = divergence.","Price makes a new low but RSI doesn't = divergence"],
 premium:["ETF premium / discount","Price above NAV = premium; below NAV = discount. Buying at a big premium means paying too much.","NAV 30, price 31.5 → 5% premium"],
 beta:["Beta","How much a stock moves with the market. Above 1 = more volatile than the market; below 1 = steadier.","Beta 1.5: market +10% → stock about +15%"],
 recovery:["Recovering losses","After a loss you need a bigger % gain to get back. Down 50% needs +100% to break even.","100 → 50 → needs to double back to 100"],
 breakeven:["Break-even price","You pay a fee to buy, and a fee plus tax to sell, so the price must rise a little before you profit. About 0.6% for stocks.","Buy at NT$100 → about NT$100.6 to break even"],
 compound:["Compounding and the rule of 72","Returns earn more returns. 72 ÷ yearly return ≈ years to double your money.","8% a year → about 9 years to double"]
};
const BANK_EN=[
 ["In Taiwan, red means?",["Up","Down","Flat"]],["1 lot = how many shares?",["1,000","100","10"]],["Max daily rise for most stocks?",["10%","7%","No limit"]],["When does the market close?",["1:30 pm","3:00 pm","12:00 pm"]],
 ["Close above open: candle color?",["Red","Green","No candle"]],["Less than one lot is called?",["Odd lot","Loose shares","Mini lot"]],["High volume usually means?",["Busy trading","Price will rise","Big profits"]],["Which is NOT an institution?",["Retail investors","Foreign investors","Investment trusts"]],
 ["\"Net buy\" means?",["Bought more than sold","Bought many times","Bought too high"]],["The TAIEX represents?",["All listed stocks","TSMC's price","Top-10 average"]],["Who moves the TAIEX most?",["Largest market cap","Highest share price","Cheapest stock"]],["0050 is a(n)?",["ETF","Single stock","Bond"]],
 ["Index up but most stocks down?",["A few big stocks lifting it","Broad rally","Data error"]],["A long upper shadow means?",["Pushed up, then sold back","Closed at the high","Limit down at open"]],["Today's change compares with?",["Yesterday's close","Today's open","Last week's close"]],["Hitting the daily top is called?",["Limit up","Max out","Price cap"]],
 ["NT$50 stock: cost of one lot?",["NT$50,000","NT$5,000","NT$500,000"]],["Is the market open on Saturday?",["No","Yes","Mornings only"]],["Foreign investors \"net sell\" means?",["Sold more than bought","Sold everything","Lost money"]],["Green ▼ on a Taiwan app means?",["Down","Up","Trading halted"]],
 ["Max broker fee?",["0.1425%","1.425%","0.3%"]],["When is transaction tax charged?",["When selling","When buying","Both"]],["Transaction tax on stocks?",["0.3%","0.1%","1%"]],["When must you pay for a purchase?",["T+2","Same day","T+5"]],
 ["What is EPS?",["Earnings per share","Price per share","Dividend per share"]],["P/E ratio = ?",["Price ÷ EPS","EPS ÷ price","Dividend ÷ price"]],["Dividend yield = ?",["Dividend ÷ price","Price ÷ dividend","EPS ÷ price"]],["On the ex-dividend day the price?",["Drops by the dividend","Rises automatically","Stays the same"]],
 ["Price climbing back after ex-dividend?",["Filling the gap","Gap down","Dividend loss"]],["20-day moving average is called?",["Monthly line","Weekly line","Quarterly line"]],["60-day moving average is called?",["Quarterly line","Monthly line","Yearly line"]],["Short MA crossing above long MA?",["Golden cross","Death cross","Tangled MAs"]],
 ["Price up, volume up usually means?",["Strong buying","Heavy selling","No trading"]],["A level where price often bounces?",["Support","Resistance","Stop-loss"]],["Risk of holding a 2× ETF long-term?",["Decay in choppy markets","Guaranteed 2× gains","Can't sell it"]],["Market cap = ?",["Price × shares","Price × volume","EPS × shares"]],
 ["Where do OTC stocks trade?",["TPEx","TWSE","Emerging market"]],["Investing a fixed amount monthly?",["Dollar-cost averaging","Day trading","Margin"]],["When is monthly revenue reported?",["By the 10th","End of quarter","Once a year"]],["Intraday odd-lot trading hours?",["9:00–13:30","Evenings only","Not allowed"]],
 ["Margin buying means?",["Borrowing money to buy","Borrowing shares to sell","Selling for cash"]],["Short selling means?",["Borrowing shares to sell","Borrowing money to buy","Storing shares"]],["Buying and selling the same day?",["Day trading","Swing trading","Long-term holding"]],["Tax rate on day trades?",["0.15%","0.3%","Tax-free"]],
 ["P/B ratio = ?",["Price ÷ book value/share","Book value ÷ revenue","Price ÷ EPS"]],["What is ROE?",["Return on equity","Debt ratio","P/E ratio"]],["Stocks restricted for unusual trading?",["Disposal stocks","Heavyweights","Dividend stocks"]],["New high on lower volume is?",["Divergence","Price-volume rally","In sync"]],
 ["Broken resistance often becomes?",["Support","Stronger resistance","Stop-loss"]],["A death cross is?",["Short MA falls below long MA","Limit down","Institutions sell all"]],["Index at new high, fewer advancers?",["Gains concentrated","Broad strength","Volume rising"]],["Q3 earnings deadline?",["Nov 14","Sep 30","Next March"]],
 ["A high P/E usually means?",["Market expects growth","Company is losing money","Price will fall"]],["Price falls, dividend same: yield?",["Rises","Falls","Unchanged"]],["Diversification mainly reduces?",["Single-company risk","Whole-market risk","Fees"]],["Not paying on T+2 becomes?",["Settlement default","Auto-cancel","One-week delay"]],
 ["Index +10% then −10%: a 2× ETF ≈ ?",["−4%","Break even","+4%"]],["P/B below 1 means?",["Price below book value","Company losing money","Very expensive"]],
 ["Price 60, EPS 3: P/E?",["20","18","180"]],["Price 50, dividend 2: yield?",["4%","2.5%","25%"]],["Prev close 85: limit-up price?",["93.5","94","90"]],["Tick size for NT$50–100?",["0.1","0.05","0.5"]],
 ["Tick size for NT$500–1000?",["1","0.5","5"]],["Max fee on a NT$100,000 buy?",["NT$142","NT$1,425","NT$20"]],["Tax on selling NT$200,000 of stock?",["NT$600","NT$200","NT$2,000"]],["After a stock dividend, your shares?",["Increase","Decrease","Stay the same"]],
 ["Gross margin = ?",["Gross profit ÷ revenue","Net profit ÷ revenue","Revenue ÷ cost"]],["Operating profit also subtracts?",["Operating expenses","Income tax","Non-operating income"]],["A very high debt ratio means?",["Higher financial risk","Big profits for sure","Price will rise"]],["Profits but no cash: check the?",["Cash flow statement","Income statement","Shareholder list"]],
 ["KD above 80 is called?",["Overbought","Oversold","Golden cross"]],["RSI below 20–30 is called?",["Oversold","Overbought","Low volume"]],["Falling price with rising volume?",["Heavy selling","Strong buying","No trading"]],["Broken support often becomes?",["Resistance","Stronger support","Take-profit point"]],
 ["ETF price above NAV is a?",["Premium","Discount","Gap fill"]],["Buying an ETF at a big premium?",["You overpay","You get a discount","You can't sell"]],["Margin buy, then a big drop: you may get?",["A margin call","A refund","An auto top-up"]],["A stock with beta above 1 usually?",["Swings more than the market","Is steadier than the market","Never falls"]],
 ["Index −10% then +10%: a 2× ETF ≈ ?",["−4%","−2%","Break even"]],["Prev close 9.5: limit-down price?",["8.55","8.5","8.6"]],["Two limit-up days in a row ≈ ?",["+21%","+20%","+10%"]],["After a 50% loss, gain needed to recover?",["100%","50%","75%"]],
 ["EPS +20%, same P/E: price?",["About +20%","Unchanged","About −20%"]],["Price 100, cash dividend 3: ex-div price?",["97","100","103"]],["NT$1 stock dividend: 1 lot becomes?",["1,100 shares","1,010 shares","2,000 shares"]],["Buy + sell once (stock): total cost ≈ ?",["0.585%","0.3%","0.1425%"]],
 ["Bought at 100: break-even price ≈ ?",["100.6","100.1","103"]],["DCA during a drop buys?",["More shares","Fewer shares","Same shares"]],["7% a year: money doubles in about?",["10 years","7 years","20 years"]],["Book value 40, price 30: P/B?",["0.75","1.33","10"]],
 ["Profit 1.5bn, equity 10bn: ROE?",["15%","6.7%","1.5%"]],["Two stocks that move exactly alike?",["Almost no diversification","Great diversification","Double the benefit"]],["Foreigners sell but the index rises?",["Others are buying","Data error","It falls tomorrow"]],["K crossing above D is a?",["Golden cross","Death cross","Divergence"]],
 ["New price low, RSI no new low?",["Divergence","Overbought","In sync"]],["Buy on Thursday: payment day?",["Next Monday","Friday","Saturday"]],["Revenue up, gross margin down?",["Selling more, earning less each","Lower costs","Price hike worked"]],["Beta 0.5, market −10%: stock ≈ ?",["−5%","−10%","+5%"]]
];

const C=EN?C_EN:C_ZH;
const BANK=BANK_ZH.map((x,i)=>({id:i,lv:x[0],t:x[1],q:EN?BANK_EN[i][0]:x[2],o:EN?BANK_EN[i][1]:x[3]})); // 每題第一個選項是正解，出題時會打亂

const LV=EN?{1:"Beginner",2:"Intermediate",3:"Expert",4:"Master",5:"Legend"}:{1:"新手",2:"進階",3:"高手",4:"大師",5:"傳奇"};
const MAXLV=5;
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
  $("lvTxt").textContent=EN?`${LV[lv]}: ${done}/${tot} done`+(lv<MAXLV?` · get ${UP}+ right in a round to level up`:" · top level"):`${LV[lv]}題庫 ${done}/${tot} 題做過`+(lv<MAXLV?`・一回合答對 ${UP} 題以上就升級`:"・最高等級");
  const n=Object.keys(weak).length; $("wrongN").textContent=n?n:""; $("wrongN").style.display=n?"":"none";
}
function show(v){["qStart","qPlay","qEnd"].forEach(id=>$(id).hidden=id!==v)}

function start(){
  let p=pool(lv);
  // 這個等級做完了：往上找；全部做完就請使用者重置
  while(p.length===0&&lv<MAXLV){lv++;p=pool(lv)}
  if(p.length===0)p=BANK.filter(x=>!seen.has(x.id)); // 高等級做完了，補做之前跳過的題目
  if(p.length===0){
    show("qEnd");
    $("qEnd").innerHTML=EN?`<div class="big-emoji">🏆</div><div class="q">You finished all ${BANK.length} questions!</div><p class="hint">Questions never repeat, so the bank is used up. Review the concepts, or start a new round.</p><div class="row2"><button class="btn" id="goRev">Review</button><button class="btn ghost" id="reset">Start over</button></div>`:`<div class="big-emoji">🏆</div><div class="q">全部 ${BANK.length} 題都做完了！</div><p class="hint">題目不會重複，所以題庫用完了。可以去「觀念複習」複習，或重新開始一輪。</p><div class="row2"><button class="btn" id="goRev">觀念複習</button><button class="btn ghost" id="reset">重新開始</button></div>`;
    $("goRev").onclick=()=>tab("rev"); $("reset").onclick=()=>{if(resetArm()){seen=new Set();lv=1;save();header();show("qStart")}};
    header(); return;
  }
  let pick5=shuffle(p).slice(0,ROUND); if(pick5.length<ROUND&&lv<MAXLV)pick5=pick5.concat(shuffle(pool(lv+1)).slice(0,ROUND-pick5.length));
  round=pick5.map(q=>{const o=shuffle(q.o.map((t,i)=>({t,ok:i===0})));return {...q,opts:o}});
  qi=0;score=0; header(); show("qPlay");
  $("qDots").innerHTML=round.map(()=>"<span></span>").join(""); ask();
}
function ask(){
  const q=round[qi]; locked=false;
  [...$("qDots").children].forEach((d,i)=>{d.classList.toggle("on",i===qi)});
  $("qText").textContent=q.q; $("qFb").innerHTML=""; $("qNext").disabled=true;
  $("qNext").textContent=qi===round.length-1?t("看結果","See results"):t("下一題 →","Next →");
  $("qOpts").innerHTML=q.opts.map((o,i)=>`<button data-i="${i}">${o.t}</button>`).join("");
  $("qOpts").querySelectorAll("button").forEach(b=>b.onclick=()=>pick(+b.dataset.i,b));
}
function pick(i,b){
  if(locked)return; locked=true;
  const q=round[qi], ok=q.opts[i].ok, ri=q.opts.findIndex(o=>o.ok);
  $("qOpts").children[ri].classList.add("right");
  seen.add(q.id);
  const dot=$("qDots").children[qi];
  if(ok){score++;dot.classList.add("ok");$("qFb").innerHTML=`<b class="down">${t("答對了！","Correct!")}</b> ${C[q.t][1]}`;}
  else{b.classList.add("wrong");dot.classList.add("ng");weak[q.t]=(weak[q.t]||0)+1;$("qFb").innerHTML=`<b class="up">${t("差一點～","So close!")}</b> ${C[q.t][1]}<br><span class="sub">${t("已加入「觀念複習 › 要加強」","Added to Review › Needs work")}</span>`;}
  save(); header(); $("qNext").disabled=false;
}
function finish(){
  show("qEnd");
  let msg,emo,extra="";
  const leftThis=pool(lv).length;
  if(score>=UP&&lv<MAXLV){lv++;save();emo="🚀";msg=t(`升級到 Lv.${lv} ${LV[lv]}！`,`Level up! Lv.${lv} ${LV[lv]}`);extra=t(`接下來是更進階的觀念題。`,`Harder concept questions are next.`);}
  else if(score>=UP){emo="🏆";msg=t(`${LV[lv]}等級，太強了！`,`${LV[lv]} level. Amazing!`);extra=leftThis?t(`還有 ${leftThis} 題${LV[lv]}題可以挑戰。`,`${leftThis} ${LV[lv]} questions left.`):"";}
  else if(score>=3){emo="👍";msg=t("不錯喔！","Nice!");extra=t(`再一回合答對 ${UP} 題就能升級。`,`Get ${UP} right in a round to level up.`);}
  else{emo="💪";msg=t("先複習一下再挑戰","Review a bit, then try again");extra=t("錯的觀念已經放進「觀念複習」。","Missed concepts were added to Review.");}
  $("qEnd").innerHTML=`<div class="big-emoji pop-in">${emo}</div><div class="q">${score} / ${round.length}　${msg}</div><p class="hint">${extra}</p><div class="row2"><button class="btn" id="again">${t("再一回合","Another round")}</button>${score<UP?`<button class="btn ghost" id="goRev">${t("觀念複習","Review")}</button>`:""}</div>`;
  $("again").onclick=start; if($("goRev"))$("goRev").onclick=()=>tab("rev");
  if(emo==="🚀")confetti();
  header();
}
$("qStart").innerHTML=EN?`<p class="hint">${ROUND} questions per round. <b>Questions you've done never come back.</b> Do well and you level up to intermediate and expert concepts.</p><button class="btn" id="go">Start quiz</button>`:`<p class="hint">每回合 ${ROUND} 題，<b>做過的題目不會再出現</b>。答得好會自動升級到進階、高手觀念題。</p><button class="btn" id="go">開始測驗</button>`;
$("go").onclick=start;
$("qNext").onclick=()=>{if(qi<round.length-1){qi++;ask()}else finish()};

/* 重置要按兩次，避免誤觸（沙盒裡不能用 confirm） */
let armT=0; function resetArm(){const b=$("reset");if(Date.now()-armT<3000)return true;armT=Date.now();b.textContent=t("再按一次確認","Tap again to confirm");setTimeout(()=>{if(b)b.textContent=t("重新開始","Start over")},3000);return false}

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
  $("fFront").innerHTML=`<div class="ftag">${rf==="weak"?t(`錯過 ${weak[k]} 次`,`Missed ${weak[k]}×`):t("觀念","Concept")}</div><div class="ftitle">${c[0]}</div><div class="sub">點一下翻面</div>`;
  $("fBack").innerHTML=`<div class="ftitle sm">${c[0]}</div><p>${c[1]}</p><div class="feg">${t("例：","e.g. ")}${c[2]}</div>`;
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
