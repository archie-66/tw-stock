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
 compound:["複利與 72 法則","報酬會再生報酬。72 ÷ 年報酬率≈資金翻倍要幾年。","年報酬 8% → 約 9 年翻倍"],
 sizing:["資金控管", "先決定每筆最多能虧多少（例如總資金 2%），再用「可虧金額 ÷ 每股風險」算出能買幾股。", "可虧 2 萬、每股風險 5 元 → 最多 4,000 股"],
 stoploss:["停損", "事先設定好的賣出價，跌到就賣，避免小虧變大虧。", "50 元買、45 元停損"],
 psych:["投資心理", "常見陷阱：從眾（大家買就跟著買）、損失趨避（不願認賠）、利多出盡。", "跌破停損卻捨不得賣"],
 nhi:["二代健保補充保費", "單筆股利 2 萬元以上，要扣 2.11% 的補充保費。", "股利 3 萬 → 扣約 633 元"],
 payout:["配息率", "股利 ÷ EPS，代表賺的錢拿多少出來配。超過 100% 代表配的比賺的多。", "EPS 4、配 3 → 75%"],
 buyback:["庫藏股", "公司用自己的錢買回自家股票，市場常解讀為公司認為股價偏低。", "公告買回後股價常有支撐"],
 breakout:["突破與假突破", "股價越過前高叫突破；有大量支持比較可信，馬上跌回去叫假突破。", "帶量突破前高"],
 gap:["跳空缺口", "今天最低價高於昨天最高價（或相反）留下的空白。沒補缺口常代表趨勢強。", "跳空上漲後回檔沒補缺口"],
 emergency:["緊急預備金", "投資前先存 3～6 個月生活費，才不會在下跌時被迫賣股。", "每月花 1 萬 → 先存 3～6 萬"]
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
 [5,"beta","Beta 0.5，大盤跌 10%，它約？",["跌 5%","跌 10%","漲 5%"]],
 // Lv6–10 情境題（附解題說明）
 [6, "lot", "買 1 張 40 元的股票，要準備多少錢（不含手續費）？", ["4 萬元", "4,000 元", "40 萬元"], "1 張＝1,000 股，40 × 1,000＝40,000 元。"],
 [6, "oddlot", "預算 1 萬元，想買 250 元的股票，最多買幾股？", ["40 股", "4 股", "400 股"], "10,000 ÷ 250＝40 股，買不到一張就用零股。"],
 [6, "limit", "昨收 120 元，今天漲停價？", ["132", "130", "126"], "120 × 1.1＝132。漲停是昨收的 +10%。"],
 [6, "limit", "昨收 48 元，今天最低會跌到？", ["43.2", "43", "45.6"], "48 × 0.9＝43.2，跌停是昨收的 −10%。"],
 [6, "lot", "100 元買 1 張、110 元賣出，未扣費用賺多少？", ["1 萬元", "10 元", "1,000 元"], "每股賺 10 元 × 1,000 股＝10,000 元。"],
 [6, "breakeven", "100 元買 1 張、110 元賣，費用合計約？", ["約 630 元", "約 330 元", "約 1,000 元"], "買進手續費 142＋賣出手續費 156＋證交稅 330（11 萬 × 0.3%）≈ 628 元。"],
 [6, "yield", "股價 30 元、每年配 1.5 元，殖利率？", ["5%", "1.5%", "20%"], "1.5 ÷ 30＝5%。"],
 [6, "lot", "同樣 10 萬元，買 100 元股和 20 元股，哪個股數多？", ["20 元那檔", "100 元那檔", "一樣多"], "20 元能買 5,000 股、100 元只能買 1,000 股。但股數多不代表比較划算，要看漲跌幅。"],
 [6, "change", "股價從 60 跌到 50，跌幅？", ["約 16.7%", "10%", "20%"], "跌了 10 元 ÷ 原本 60 元≈16.7%。分母是「原本的價格」。"],
 [6, "change", "股價從 50 漲到 60，漲幅？", ["20%", "10%", "16.7%"], "漲 10 元 ÷ 原本 50 元＝20%。同樣差 10 元，漲幅和跌幅不一樣。"],
 [6, "premium", "ETF 淨值 25、市價 25.5，溢價？", ["2%", "0.5%", "5%"], "(25.5 − 25) ÷ 25＝2%。"],
 [6, "dca", "每月投 3,000 元，兩個月股價 30、20，平均成本？", ["24 元", "25 元", "26 元"], "30 元買 100 股、20 元買 150 股，共 250 股花 6,000 元 → 6,000 ÷ 250＝24 元，比單純平均 25 元低。"],
 [6, "settle", "週五買進股票，扣款日是？", ["下週二", "下週一", "週日"], "T+2 算的是營業日：週五買 → 週一（T+1）→ 週二（T+2）。"],
 [6, "tax", "賣出 10 萬元的 0050，證交稅？", ["100 元", "300 元", "0 元"], "ETF 證交稅是 0.1%：100,000 × 0.1%＝100 元。"],
 [6, "div", "持有 1 張，配現金股利 2 元，拿到多少？", ["2,000 元", "2 元", "200 元"], "2 元 × 1,000 股＝2,000 元。"],
 [7, "margins", "營收 100 億、毛利 30 億，毛利率？", ["30%", "70%", "3.3%"], "30 ÷ 100＝30%。"],
 [7, "eps", "淨利 10 億、股數 5 億股，EPS？", ["2 元", "0.5 元", "5 元"], "10 億 ÷ 5 億股＝每股賺 2 元。"],
 [7, "pe", "EPS 4 元、同業本益比 15 倍，合理價約？", ["60 元", "19 元", "3.75 元"], "合理價≈EPS × 本益比＝4 × 15＝60 元。這只是粗估。"],
 [7, "pe", "A 本益比 10、B 本益比 30，市場比較期待誰成長？", ["B", "A", "一樣"], "本益比高＝市場願意付更多錢，通常是期待未來成長。但也可能被高估。"],
 [7, "margins", "營收不變，毛利率從 40% 降到 30%，毛利？", ["變少", "變多", "不變"], "毛利＝營收 × 毛利率，營收不變、毛利率變低，毛利就變少。"],
 [7, "margins", "營收年增 50%，虧損卻擴大，可能是？", ["成本或費用增加更快", "一定是好消息", "財報錯誤"], "賣得更多但成本、費用漲得更兇，就會越賣越虧。"],
 [7, "debt", "ROE 20%、負債比 90%，要注意？", ["高報酬可能靠借錢", "完全沒風險", "股價一定漲"], "借很多錢可以把 ROE 拉高，但景氣不好時風險也很大。"],
 [7, "pb", "每股淨值 50、本淨比 0.8，股價約？", ["40 元", "62.5 元", "50 元"], "股價＝本淨比 × 每股淨值＝0.8 × 50＝40 元。"],
 [7, "payout", "EPS 4 元、配息 3 元，配息率？", ["75%", "133%", "12%"], "配息率＝股利 ÷ EPS＝3 ÷ 4＝75%。"],
 [7, "payout", "EPS 只有 1 元卻配 3 元，可能代表？", ["動用以前存下的盈餘", "今年很賺錢", "一定算錯"], "配的比賺的多，錢通常來自以前的保留盈餘或公積，不能長久這樣配。"],
 [7, "psych", "好消息公布前大漲、公布後反而下跌，常叫？", ["利多出盡", "利空出盡", "填息"], "大家提前買進，消息出來後就有人獲利了結。"],
 [7, "statements", "營業現金流連續好幾年都是負的，代表？", ["本業一直在燒錢", "公司很有錢", "股價會漲"], "本業收進來的現金比付出去的少，要小心公司的體質。"],
 [7, "buyback", "公司買回自家股票（庫藏股），市場通常解讀為？", ["公司覺得股價偏低", "公司快倒了", "股票要下市"], "公司願意花錢買自己的股票，常被看成經營者認為股價被低估。"],
 [7, "eps", "四季 EPS 1.2、1.3、1.5、1.0，全年 EPS？", ["5.0 元", "1.25 元", "1.5 元"], "全年 EPS 是四季加起來：1.2＋1.3＋1.5＋1.0＝5.0。"],
 [7, "pe", "全年 EPS 5 元、股價 100 元，本益比？", ["20 倍", "5 倍", "500 倍"], "100 ÷ 5＝20 倍，代表用 20 年的獲利買這家公司。"],
 [8, "ma", "股價站上月線，而且月線往上，常被看作？", ["短期趨勢偏多", "一定大漲", "趨勢偏空"], "價在均線上、均線也往上，代表最近買的人多數賺錢，趨勢偏強。"],
 [8, "ma", "股價在季線下、季線往下彎，常被看作？", ["中期趨勢偏弱", "準備漲停", "沒有意義"], "季線往下代表這三個月的平均成本在下降，趨勢偏弱。"],
 [8, "breakout", "股價突破前波高點，成交量也明顯放大，常稱？", ["帶量突破", "假突破", "量縮整理"], "突破時有大量買盤支持，比較可信。"],
 [8, "breakout", "突破前高後，隔天馬上跌回原區間，常稱？", ["假突破", "真突破", "填息"], "站不穩就跌回去，代表上方賣壓還很重。"],
 [8, "support", "股價在 50～55 盤整，跌破 50 後，50 會變成？", ["壓力", "支撐", "停利點"], "原本的支撐被跌破，之後漲回 50 附近時常遇到解套賣壓。"],
 [8, "shadow", "連續大漲後出現長上影線、成交量爆大，要留意？", ["高檔賣壓", "一定續漲", "沒有影響"], "衝高被大量賣回，代表上面有人在大量獲利了結。"],
 [8, "kd", "KD 在 20 以下出現黃金交叉，常被看作？", ["低檔轉強訊號", "超買訊號", "賣出訊號"], "在超賣區 K 往上穿過 D，代表跌勢可能趨緩。只是訊號，不是保證。"],
 [8, "kd", "股價創新高，KD 卻沒有創新高，叫？", ["高檔背離", "低檔背離", "同步上漲"], "價格和指標方向不一致，代表上漲力道可能在減弱。"],
 [8, "gap", "跳空上漲後回檔，但沒有把缺口補掉，代表？", ["多方仍強", "空方很強", "一定會跌"], "回檔沒跌回缺口，代表買盤還很積極。"],
 [8, "volprice", "股價穩住、成交量變小，通常代表？", ["賣壓減輕", "大戶出貨", "市場恐慌"], "價穩量縮表示想賣的人變少了。"],
 [8, "cross", "5 日線往下跌破 20 日線，叫？", ["死亡交叉", "黃金交叉", "背離"], "短均線跌破長均線，代表短期轉弱。"],
 [8, "ma", "多條均線擠在一起很久之後，常出現？", ["較大的方向性走勢", "一定上漲", "一定下跌"], "均線糾結代表大家成本很接近，之後常會選邊、走出一段大行情，但方向不一定。"],
 [8, "kd", "技術指標最大的限制是？", ["都是用過去資料算的", "一定準確", "只能用在美股"], "指標反映的是已經發生的事，不能保證未來。"],
 [8, "rsi", "RSI 長時間在 80 以上，說明？", ["漲勢很強但過熱", "馬上會跌停", "沒人在買"], "超買可以持續很久，強勢股常常這樣，不代表馬上跌。"],
 [8, "shadow", "下跌中出現長下影線、成交量放大，可能是？", ["有人在低檔承接", "賣壓更重", "資料錯誤"], "一度大跌又被大量買回，代表低檔有買盤。"],
 [9, "sizing", "100 萬資金，每筆最多虧總資金 2%，最多虧？", ["2 萬元", "20 萬元", "2,000 元"], "1,000,000 × 2%＝20,000 元。先決定最多能虧多少，再決定買多少。"],
 [9, "stoploss", "50 元買進、停損設 45 元，每股風險？", ["5 元", "45 元", "10%"], "買價 − 停損價＝50 − 45＝5 元。"],
 [9, "sizing", "最多可虧 2 萬、每股風險 5 元，最多買幾股？", ["4,000 股", "400 股", "40,000 股"], "20,000 ÷ 5＝4,000 股（4 張）。觸發停損時剛好虧 2 萬。"],
 [9, "diversify", "全部資金押一檔股票，最大的風險是？", ["那家公司出事就全受影響", "手續費變高", "不能賣出"], "單一公司出問題，你的錢會一起大跌。"],
 [9, "margin", "融資買上市股票，自己大約要出幾成？", ["4 成", "6 成", "全部"], "上市股票融資一般借 6 成，自己出 4 成。"],
 [9, "margin", "融資維持率低於多少會被追繳？", ["130%", "100%", "166%"], "維持率＝股票市值 ÷ 融資金額，低於 130% 就要補錢，不然會被斷頭賣出。"],
 [9, "recovery", "虧損 20% 後，要漲多少才回本？", ["25%", "20%", "40%"], "100 → 80，要漲 20 元，20 ÷ 80＝25%。"],
 [9, "stoploss", "設定停損主要是為了？", ["避免小虧變大虧", "保證賺錢", "降低手續費"], "停損是先決定好能接受的損失，避免越抱越虧。"],
 [9, "stoploss", "越跌越買（攤平）最大的風險？", ["越陷越深", "一定會賺", "沒有風險"], "如果公司真的出問題，攤平會讓虧損更大。"],
 [9, "lev", "正2 ETF 比較適合？", ["短期、懂風險的人", "長期存股的新手", "退休族"], "槓桿 ETF 每天重新計算，長期抱在盤整時會耗損。"],
 [9, "diversify", "三檔股票走勢高度一致，分散效果？", ["很有限", "非常好", "完全沒風險"], "走勢一樣的股票會一起漲一起跌，等於沒分散。"],
 [9, "emergency", "開始投資前，緊急預備金一般建議先存？", ["3～6 個月生活費", "1 天生活費", "不需要"], "先留生活費，才不會在股票下跌時被迫賣出。"],
 [9, "margin", "借錢買股票最大的問題是？", ["虧損可能超過自己的錢", "利息很低", "一定會賺"], "槓桿會放大獲利，也會放大虧損。"],
 [9, "psych", "跌破停損點卻不賣，常見的心理是？", ["不想認賠", "太理性", "想多繳稅"], "這叫損失趨避：賠錢的痛苦讓人不願意賣，結果常常越賠越多。"],
 [9, "psych", "看到大家都在買就跟著買，叫？", ["從眾效應", "價值投資", "定期定額"], "跟著人群買常常買在最熱的時候。"],
 [10, "nhi", "單筆現金股利 3 萬元，要扣二代健保補充保費嗎？", ["要，2.11%", "不用", "要，10%"], "單筆股利 2 萬元以上要扣 2.11%：30,000 × 2.11%≈633 元。"],
 [10, "nhi", "單筆現金股利 1.5 萬元，要扣補充保費嗎？", ["不用", "要，2.11%", "要，1%"], "門檻是單筆 2 萬元，1.5 萬元不用扣。"],
 [10, "div", "100 元配 5 元，除息後 95 元，之後跌到 90 元，含股利？", ["虧 5 元", "賺 5 元", "不賺不賠"], "手上 90 元的股票＋5 元股利＝95，比原本 100 少 5 元。這叫貼息。"],
 [10, "premium", "淨值 30 的 ETF 市價 33，想長期持有，比較好的做法？", ["等溢價縮小再買", "馬上全部買", "改買槓桿版"], "溢價 10% 等於多付 10%，等價格回到淨值附近再買比較划算。"],
 [10, "yield", "A 殖利率 8% 但獲利年年衰退，B 4% 但穩定成長，長期較穩？", ["B", "A", "一樣"], "獲利衰退的公司股利可能越配越少，股價也會跌，高殖利率可能是陷阱。"],
 [10, "psych", "持有的股票突然傳出重大利空、開盤跌停，第一步？", ["先確認消息和原因", "無腦加碼", "什麼都不看就全賣"], "先查證消息、看公司說明和影響多大，再依照自己的停損計畫決定。"],
 [10, "beta", "大盤跌 5%，你的組合 Beta 1.2，約跌？", ["6%", "5%", "1.2%"], "5% × 1.2＝6%。"],
 [10, "sizing", "100 萬，60% 股票、40% 現金；股票跌 20%，總資產跌？", ["12%", "20%", "8%"], "60 萬 × 20%＝虧 12 萬，12 萬 ÷ 100 萬＝12%。現金可以緩衝虧損。"],
 [10, "inst", "外資連 5 天賣超、投信連 5 天買超、指數盤整，合理解讀？", ["內外資看法分歧", "一定崩盤", "一定大漲"], "兩邊力量互相抵銷，指數才會盤整。單一訊號不能決定方向。"],
 [10, "compound", "年報酬 9%，用 72 法則約幾年翻倍？", ["8 年", "9 年", "18 年"], "72 ÷ 9＝8 年。"],
 [10, "pe", "本益比 20，EPS 從 5 成長到 6，本益比不變股價約？", ["100 變 120", "100 變 105", "100 變 200"], "股價＝EPS × 本益比：5 × 20＝100，6 × 20＝120。"],
 [10, "margin", "融資買 100 萬（自備 40 萬），股價跌 25%，自己的錢虧？", ["約 62.5%", "25%", "10%"], "股票剩 75 萬，虧 25 萬，全部算在你的 40 萬上：25 ÷ 40＝62.5%。槓桿放大了虧損。"],
 [10, "margin", "融資借 60 萬，股票市值剩 75 萬，維持率？", ["125%，會被追繳", "150%，安全", "75%，會被追繳"], "75 ÷ 60＝125%，低於 130% 就會被追繳。"],
 [10, "psych", "利多新聞和法人大賣同時出現，最好的做法？", ["多方查證，別只看一個訊號", "馬上跟新聞買", "馬上跟法人賣"], "不同訊號互相矛盾時，更要冷靜查證，照自己的計畫做決定。"],
 [10, "recovery", "先漲 50% 再跌 50%，最後？", ["虧 25%", "打平", "賺 25%"], "100 → 150 → 75，最後虧 25%。漲跌幅相同不代表會回到原點。"]
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
 compound:["Compounding and the rule of 72","Returns earn more returns. 72 ÷ yearly return ≈ years to double your money.","8% a year → about 9 years to double"],
 sizing:["Position sizing", "Decide your max loss per trade first (e.g. 2% of capital), then shares = max loss ÷ risk per share.", "Max loss 20,000, risk 5/share → 4,000 shares"],
 stoploss:["Stop-loss", "A sell price set in advance so small losses don't become big ones.", "Buy at 50, stop at 45"],
 psych:["Investor psychology", "Common traps: herding, loss aversion (not admitting losses), and sell-the-news.", "Not selling after hitting your stop"],
 nhi:["NHI supplementary premium", "Single dividend payments of NT$20,000+ are charged 2.11%.", "NT$30,000 dividend → about NT$633"],
 payout:["Payout ratio", "Dividend ÷ EPS: how much of the profit is paid out. Over 100% means paying more than it earned.", "EPS 4, dividend 3 → 75%"],
 buyback:["Share buybacks", "The company buys back its own shares, often read as management thinking the price is low.", "Buyback news often supports the price"],
 breakout:["Breakouts", "Rising above a previous high. More convincing on big volume; falling right back is a false breakout.", "Breaking the high on volume"],
 gap:["Price gaps", "A gap between today's range and yesterday's. An unfilled gap often means a strong trend.", "Gap up, pullback, gap stays open"],
 emergency:["Emergency fund", "Save 3–6 months of expenses before investing so you're never forced to sell in a drop.", "NT$10k/month spending → save 30–60k first"]
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
 ["New price low, RSI no new low?",["Divergence","Overbought","In sync"]],["Buy on Thursday: payment day?",["Next Monday","Friday","Saturday"]],["Revenue up, gross margin down?",["Selling more, earning less each","Lower costs","Price hike worked"]],["Beta 0.5, market −10%: stock ≈ ?",["−5%","−10%","+5%"]],
 ["One lot of a NT$40 stock costs (before fees)?", ["NT$40,000", "NT$4,000", "NT$400,000"], "1 lot = 1,000 shares, so 40 × 1,000 = NT$40,000."],
 ["NT$10,000 budget, NT$250 stock: max shares?", ["40", "4", "400"], "10,000 ÷ 250 = 40 shares. Less than a lot, so buy odd lots."],
 ["Prev close 120: limit-up price?", ["132", "130", "126"], "120 × 1.1 = 132. Limit up is +10% from yesterday's close."],
 ["Prev close 48: lowest possible price today?", ["43.2", "43", "45.6"], "48 × 0.9 = 43.2. Limit down is −10%."],
 ["Buy 1 lot at 100, sell at 110: gain before costs?", ["NT$10,000", "NT$10", "NT$1,000"], "NT$10 per share × 1,000 shares = NT$10,000."],
 ["Buy 1 lot at 100, sell at 110: total costs ≈ ?", ["NT$630", "NT$330", "NT$1,000"], "Buy fee 142 + sell fee 156 + tax 330 (110,000 × 0.3%) ≈ NT$628."],
 ["Price 30, yearly dividend 1.5: yield?", ["5%", "1.5%", "20%"], "1.5 ÷ 30 = 5%."],
 ["NT$100,000 in a NT$100 stock vs. a NT$20 stock: more shares?", ["The NT$20 stock", "The NT$100 stock", "Same"], "5,000 shares vs. 1,000 shares. More shares isn't better by itself; % change is what matters."],
 ["Price falls from 60 to 50: % drop?", ["About 16.7%", "10%", "20%"], "Down 10 ÷ starting 60 ≈ 16.7%. Divide by the starting price."],
 ["Price rises from 50 to 60: % gain?", ["20%", "10%", "16.7%"], "Up 10 ÷ starting 50 = 20%. Same 10 points, different % up vs. down."],
 ["ETF NAV 25, price 25.5: premium?", ["2%", "0.5%", "5%"], "(25.5 − 25) ÷ 25 = 2%."],
 ["NT$3,000 a month at prices 30 then 20: average cost?", ["24", "25", "26"], "100 shares at 30 + 150 at 20 = 250 shares for 6,000 → 24. Lower than the simple average of 25."],
 ["Buy on Friday: payment day?", ["Next Tuesday", "Next Monday", "Sunday"], "T+2 counts business days: Fri → Mon (T+1) → Tue (T+2)."],
 ["Selling NT$100,000 of 0050: tax?", ["NT$100", "NT$300", "NT$0"], "ETF tax is 0.1%: 100,000 × 0.1% = NT$100."],
 ["1 lot, cash dividend NT$2: you receive?", ["NT$2,000", "NT$2", "NT$200"], "2 × 1,000 shares = NT$2,000."],
 ["Revenue 10bn, gross profit 3bn: gross margin?", ["30%", "70%", "3.3%"], "3 ÷ 10 = 30%."],
 ["Net profit 1bn, 500M shares: EPS?", ["NT$2", "NT$0.5", "NT$5"], "1bn ÷ 0.5bn shares = NT$2 per share."],
 ["EPS 4, peers trade at 15× P/E: fair price ≈ ?", ["60", "19", "3.75"], "Fair price ≈ EPS × P/E = 4 × 15 = 60. Just a rough estimate."],
 ["A has P/E 10, B has 30: market expects more growth from?", ["B", "A", "Same"], "Higher P/E = paying more per NT$ of profit, usually for expected growth. It could also be overpriced."],
 ["Same revenue, gross margin 40% → 30%: gross profit?", ["Falls", "Rises", "Unchanged"], "Gross profit = revenue × margin, so a lower margin means less profit."],
 ["Revenue +50% but losses grew: likely?", ["Costs grew even faster", "Definitely good news", "Accounting error"], "Selling more while costs grow faster means losing more."],
 ["ROE 20% with a 90% debt ratio: watch out for?", ["High returns may come from borrowing", "No risk at all", "Price must rise"], "Heavy borrowing can boost ROE, but it's risky when business turns bad."],
 ["Book value/share 50, P/B 0.8: price ≈ ?", ["40", "62.5", "50"], "Price = P/B × book value = 0.8 × 50 = 40."],
 ["EPS 4, dividend 3: payout ratio?", ["75%", "133%", "12%"], "Payout = dividend ÷ EPS = 3 ÷ 4 = 75%."],
 ["EPS 1 but pays a 3 dividend: likely?", ["Paying from past savings", "A very profitable year", "A mistake"], "Paying more than it earns usually uses past retained earnings. It can't last."],
 ["Rises before good news, falls after: called?", ["Sell the news", "Bad news priced in", "Gap fill"], "People bought early and take profits when the news comes out."],
 ["Operating cash flow negative for years: means?", ["The core business burns cash", "The company is rich", "Price will rise"], "The business pays out more cash than it brings in. Be careful."],
 ["Company buys back its own shares: usually read as?", ["Management thinks it's cheap", "It's going bankrupt", "It's delisting"], "Spending money on its own shares often signals management thinks the price is too low."],
 ["Quarterly EPS 1.2, 1.3, 1.5, 1.0: full-year EPS?", ["5.0", "1.25", "1.5"], "Add the four quarters: 1.2 + 1.3 + 1.5 + 1.0 = 5.0."],
 ["Full-year EPS 5, price 100: P/E?", ["20", "5", "500"], "100 ÷ 5 = 20: you pay 20 years of current profit."],
 ["Price above a rising 20-day line: usually seen as?", ["Short-term uptrend", "Guaranteed rally", "Downtrend"], "Price above a rising average means most recent buyers are in profit: a stronger trend."],
 ["Price below a falling 60-day line: usually seen as?", ["Medium-term weakness", "About to hit limit up", "Meaningless"], "A falling 60-day line means the 3-month average cost is dropping: a weaker trend."],
 ["Breaks the previous high on big volume: called?", ["Breakout on volume", "False breakout", "Low-volume pause"], "Big buying behind a breakout makes it more convincing."],
 ["Breaks a high, then falls back the next day: called?", ["False breakout", "True breakout", "Gap fill"], "Failing to hold above means sellers are still strong up there."],
 ["Range 50–55, then drops below 50: 50 becomes?", ["Resistance", "Support", "Take-profit"], "Broken support often turns into resistance as trapped buyers sell near 50."],
 ["After a big rally: long upper shadow and huge volume. Watch for?", ["Selling pressure at the top", "More gains for sure", "Nothing"], "Pushed up then sold down on big volume = heavy profit-taking."],
 ["KD golden cross below 20: seen as?", ["A turn-up signal from low levels", "Overbought signal", "Sell signal"], "K crossing above D in oversold territory hints the decline may slow. Not a guarantee."],
 ["Price makes a new high, KD doesn't: called?", ["Bearish divergence", "Bullish divergence", "In sync"], "Price and indicator disagree: upward momentum may be fading."],
 ["Gaps up, pulls back, but doesn't fill the gap: means?", ["Buyers still strong", "Sellers strong", "Must fall"], "Not falling back into the gap shows buyers are still eager."],
 ["Price holds steady as volume shrinks: usually?", ["Selling is easing", "Big players dumping", "Panic"], "Steady price on lower volume means fewer people want to sell."],
 ["5-day line crosses below the 20-day line: called?", ["Death cross", "Golden cross", "Divergence"], "Short average falling below the long one = short-term weakness."],
 ["Averages bunched together for a long time, then?", ["A bigger move in one direction", "Always up", "Always down"], "Bunched averages mean similar costs; a big move often follows, direction unknown."],
 ["The biggest limit of technical indicators?", ["They use past data", "Always accurate", "US stocks only"], "Indicators describe what already happened. No guarantee about the future."],
 ["RSI stays above 80 for a long time: means?", ["Strong but overheated", "Limit down soon", "Nobody buying"], "Overbought can last; strong stocks often stay there. Not an instant sell."],
 ["In a decline: long lower shadow on big volume. Likely?", ["Buyers stepping in low", "More selling", "Data error"], "Dropped then bought back on volume: buyers showed up at lower prices."],
 ["NT$1M account, max 2% loss per trade: max loss?", ["NT$20,000", "NT$200,000", "NT$2,000"], "1,000,000 × 2% = 20,000. Decide your max loss first, then the size."],
 ["Buy at 50, stop-loss at 45: risk per share?", ["NT$5", "NT$45", "10%"], "Entry − stop = 50 − 45 = NT$5."],
 ["Max loss 20,000, risk 5 per share: max shares?", ["4,000", "400", "40,000"], "20,000 ÷ 5 = 4,000 shares (4 lots). Hitting the stop loses exactly 20,000."],
 ["All your money in one stock: biggest risk?", ["One company's trouble hits everything", "Higher fees", "Can't sell"], "If that company has problems, all your money drops with it."],
 ["Margin buying a listed stock: you put up about?", ["40%", "60%", "100%"], "Brokers usually lend 60% for listed stocks; you pay 40%."],
 ["Margin maintenance below what triggers a call?", ["130%", "100%", "166%"], "Ratio = stock value ÷ loan. Below 130% you must add money or be force-sold."],
 ["After a 20% loss, gain needed to recover?", ["25%", "20%", "40%"], "100 → 80; need +20 on 80 = 25%."],
 ["Main purpose of a stop-loss?", ["Stop small losses becoming big", "Guarantee profits", "Lower fees"], "Decide your acceptable loss in advance so it can't keep growing."],
 ["Buying more as it falls (averaging down): biggest risk?", ["Sinking deeper", "Guaranteed profit", "No risk"], "If the company really has problems, averaging down makes the loss bigger."],
 ["2× leveraged ETFs suit?", ["Short-term, risk-aware traders", "Beginners holding long-term", "Retirees"], "They reset daily and decay in choppy markets if held long."],
 ["Three stocks that move very alike: diversification?", ["Very limited", "Excellent", "No risk"], "They rise and fall together, so it's barely diversified."],
 ["Before investing, keep an emergency fund of?", ["3–6 months of expenses", "1 day of expenses", "None"], "With savings set aside, you won't be forced to sell during a drop."],
 ["Biggest problem with buying stocks on borrowed money?", ["Losses can exceed your own money", "Low interest", "Guaranteed gains"], "Leverage magnifies gains and losses."],
 ["Hits the stop-loss but doesn't sell: common reason?", ["Not wanting to admit a loss", "Being too rational", "Wanting to pay tax"], "Loss aversion: the pain of losing makes people hold, often losing more."],
 ["Buying because everyone else is: called?", ["Herd behavior", "Value investing", "Dollar-cost averaging"], "Following the crowd often means buying at the hottest moment."],
 ["Single cash dividend NT$30,000: NHI supplementary premium?", ["Yes, 2.11%", "No", "Yes, 10%"], "Single payments of NT$20,000+ are charged 2.11%: 30,000 × 2.11% ≈ NT$633."],
 ["Single dividend NT$15,000: supplementary premium?", ["No", "Yes, 2.11%", "Yes, 1%"], "The threshold is NT$20,000 per payment, so none here."],
 ["Price 100, pays 5, then drops to 90. Including the dividend?", ["Down 5", "Up 5", "Break even"], "90 stock + 5 cash = 95, vs. 100 before: down 5. The gap wasn't filled."],
 ["ETF NAV 30, price 33, you want to hold long-term. Better move?", ["Wait for the premium to shrink", "Buy everything now", "Buy the leveraged one"], "A 10% premium means overpaying by 10%. Wait until it's near NAV."],
 ["A yields 8% with shrinking profits; B yields 4% and grows steadily. Steadier long-term?", ["B", "A", "Same"], "Shrinking profits can cut future dividends and the price. High yield can be a trap."],
 ["Big bad news hits your stock; it opens limit down. First step?", ["Check the news and the cause", "Buy more blindly", "Sell everything without looking"], "Verify the news and its impact first, then follow your stop-loss plan."],
 ["Market −5%, your portfolio beta 1.2: about?", ["−6%", "−5%", "−1.2%"], "5% × 1.2 = 6%."],
 ["NT$1M: 60% stocks, 40% cash. Stocks fall 20%. Total drop?", ["12%", "20%", "8%"], "600k × 20% = 120k lost; 120k ÷ 1M = 12%. Cash cushions the fall."],
 ["Foreigners sell 5 days, trusts buy 5 days, index flat. Reasonable read?", ["They disagree", "Crash coming", "Rally coming"], "The two sides cancel out, so the index goes sideways. One signal can't decide."],
 ["9% a year: rule of 72 says money doubles in?", ["8 years", "9 years", "18 years"], "72 ÷ 9 = 8 years."],
 ["P/E 20, EPS grows 5 → 6, same P/E: price?", ["100 → 120", "100 → 105", "100 → 200"], "Price = EPS × P/E: 5 × 20 = 100, 6 × 20 = 120."],
 ["Margin buy NT$1M (you put in 400k), stock −25%: your loss?", ["About 62.5%", "25%", "10%"], "Stock now 750k, lost 250k, all from your 400k: 250 ÷ 400 = 62.5%."],
 ["Loan 600k, stock value now 750k: maintenance ratio?", ["125%, margin call", "150%, safe", "75%, margin call"], "750 ÷ 600 = 125%, below 130%, so you get a margin call."],
 ["Good news but institutions selling heavily. Best approach?", ["Check several sources, not one signal", "Buy on the news", "Sell with institutions"], "When signals conflict, slow down, verify, and stick to your plan."],
 ["Up 50%, then down 50%: final result?", ["−25%", "Break even", "+25%"], "100 → 150 → 75: down 25%. Equal % moves don't cancel out."]
];

const C=EN?C_EN:C_ZH;
const BANK=BANK_ZH.map((x,i)=>({id:i,lv:x[0],t:x[1],q:EN?BANK_EN[i][0]:x[2],o:EN?BANK_EN[i][1]:x[3],e:EN?BANK_EN[i][2]:x[4]})); // 每題第一個選項是正解，出題時會打亂

const LV=EN?{1:"Beginner",2:"Intermediate",3:"Expert",4:"Master",5:"Legend",6:"Pro",7:"Analyst",8:"Chartist",9:"Risk Pro",10:"Grandmaster"}:{1:"新手",2:"進階",3:"高手",4:"大師",5:"傳奇",6:"實戰家",7:"財報達人",8:"技術分析師",9:"風控高手",10:"宗師"};
const MAXLV=10;
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
  if(window.statRecord)statRecord(q.id,ok,lv);
  const dot=$("qDots").children[qi];
  if(ok){score++;dot.classList.add("ok");$("qFb").innerHTML=`<b class="down">${t("答對了！","Correct!")}</b> ${q.e?`<span class="sol">${t("解法：","How: ")}${q.e}</span>`:C[q.t][1]}`;}
  else{b.classList.add("wrong");dot.classList.add("ng");weak[q.t]=(weak[q.t]||0)+1;$("qFb").innerHTML=`<b class="up">${t("差一點～","So close!")}</b> ${q.e?`<span class="sol">${t("解法：","How: ")}${q.e}</span>`:C[q.t][1]}<br><span class="sub">${t("已加入「觀念複習 › 要加強」","Added to Review › Needs work")}</span>`;}
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
$("qStart").innerHTML=EN?`<p class="hint">${ROUND} questions per round. <b>Questions you've done never come back.</b> Do well and you level up to intermediate and expert concepts.</p><button class="btn" id="go">Start quiz</button><p class="sub" style="margin-top:10px">Answers are counted anonymously to improve the questions. You can turn this off in Settings.</p>`:`<p class="hint">每回合 ${ROUND} 題，<b>做過的題目不會再出現</b>。答得好會自動升級到進階、高手觀念題。</p><button class="btn" id="go">開始測驗</button><p class="sub" style="margin-top:10px">作答結果會不記名統計，用來改善題目，可以在設定裡關掉。</p>`;
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
