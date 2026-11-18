/* 模擬交易：用假錢練習下單。跟真的一樣要等收盤才成交，可以下限價單（資料只存在這台裝置） */
(function(){
const $=id=>document.getElementById(id);
const KEY="tw_sim";
const money=n=>Math.round(n).toLocaleString("zh-TW");
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const fresh=init=>({init,cash:init,pos:{},log:[],eq:{},orders:[],results:[]});
let S=load()||fresh(1000000);
S.orders=S.orders||[];S.results=S.results||[];
let sel=null, side="buy", unit="lot", qty=1, otype="mkt", lmt=null;
/* 台股升降單位（跳動單位） */
const tick=p=>p<10?0.01:p<50?0.05:p<100?0.1:p<500?0.5:p<1000?1:5;
const roundTick=(p,dir)=>{const k=tick(p),f=dir>0?Math.ceil:dir<0?Math.floor:Math.round;return +(f(p/k-1e-9*(dir||0))*k).toFixed(2)};
const limits=ref=>({hi:roundTick(ref*1.1,-1),lo:roundTick(ref*0.9,1)});
const reservedCash=()=>S.orders.filter(o=>o.side==="buy").reduce((a,o)=>a+o.reserve,0);
const lockedSh=c=>S.orders.filter(o=>o.side==="sell"&&o.code===c).reduce((a,o)=>a+o.sh,0);
const availSh=c=>(S.pos[c]?S.pos[c].sh:0)-lockedSh(c);
/* 什麼時候成交：交易日 13:30 前下單＝今天收盤；其他時間＝下一個交易日收盤 */
function fillWhen(){
  const tp=new Date(Date.now()+8*3600e3),wd=tp.getUTCDay(),m=tp.getUTCHours()*60+tp.getUTCMinutes(),today=tp.toISOString().slice(0,10);
  if(wd>=1&&wd<=5&&m<13*60+30&&(!window.D||D.date!==today))return t("今天 13:30 收盤","today's 1:30 pm close");
  return t("下一個交易日收盤","the next trading day's close");
}

const priceMap=()=>{const m={};if(window.D)for(const s of D.stocks)m[s[0]]=s;return m};
const isEtf=c=>/^00/.test(c);
const feeOf=(amt,odd)=>Math.max(Math.floor(amt*0.001425),odd?1:20);
const taxOf=(amt,c)=>Math.floor(amt*(isEtf(c)?0.001:0.003));
const shares=()=>unit==="lot"?qty*1000:qty;
const shTxt=sh=>{const l=Math.floor(sh/1000),o=sh%1000;if(EN)return (l?`${l} lot${l>1?"s":""}`:"")+(l&&o?" + ":"")+(o?`${o} sh`:"")||"0 sh";return (l?`${l} 張`:"")+(l&&o?" ":"")+(o?`${o} 股`:"")||"0 股"};
const nt=n=>EN?`NT$${money(n)}`:`${money(n)} 元`;

function priceOf(code){const m=priceMap();return m[code]?m[code][4]:(S.pos[code]?S.pos[code].last:null)}
function equity(){let v=S.cash+reservedCash();for(const c in S.pos)v+=S.pos[c].sh*(priceOf(c)||0);return v}

/* ---------- 總覽 ---------- */
function renderTop(anim){
  const m=priceMap();
  for(const c in S.pos)if(m[c])S.pos[c].last=m[c][4];
  const eq=equity(),pl=eq-S.init,plp=pl/S.init*100,stock=eq-S.cash;
  if(window.D){S.eq[D.date]=Math.round(eq);const ks=Object.keys(S.eq).sort();if(ks.length>60)delete S.eq[ks[0]];save()}
  if(anim&&window.countUp)countUp($("simTotal"),eq,0,900);else $("simTotal").textContent=money(eq);
  $("simPL").className="chg "+cls(pl);
  $("simPL").textContent=`${pl>=0?"+":"−"}${nt(Math.abs(pl))}（${plp>=0?"+":""}${plp.toFixed(2)}%）`;
  $("simCash").textContent=money(S.cash);$("simStock").textContent=money(stock);
  $("simInit").textContent=t(`起始資金 ${money(S.init)} 元`,`Started with NT$${money(S.init)}`);
  const ks=Object.keys(S.eq).sort();
  if(ks.length>=2){
    const vs=ks.map(k=>S.eq[k]),mn=Math.min(...vs,S.init),mx=Math.max(...vs,S.init),pad=(mx-mn)*.15||1;
    const X=i=>10+i*(300/(ks.length-1)),Y=v=>70-(v-mn+pad)/(mx-mn+2*pad)*60;
    const col=vs[vs.length-1]>=S.init?"var(--up)":"var(--down)";
    $("simEq").innerHTML=`<line x1="0" x2="320" y1="${Y(S.init)}" y2="${Y(S.init)}" stroke="var(--line)" stroke-dasharray="4 4"/><polyline class="ln" points="${vs.map((v,i)=>`${X(i)},${Y(v)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="2.5" vector-effect="non-scaling-stroke"/>`;
    $("simEqBox").hidden=false;$("simEqL").innerHTML=`<span>${ks[0].slice(5)}</span><span>${t("虛線＝起始資金","Dashed = starting money")}</span><span>${ks[ks.length-1].slice(5)}</span>`;
  } else $("simEqBox").hidden=true;
}

/* ---------- 持股、紀錄 ---------- */
/* ---------- 資產配置圓餅圖 ---------- */
const DCOL=["#3e63dd","#f59e0b","#8b5cf6","#14b8a6","#ec4899","#0ea5e9","#84cc16","#f97316"];
let dSel=null;
function renderDonut(){
  const items=Object.keys(S.pos).map(c=>({k:c,name:S.pos[c].name,v:S.pos[c].sh*(priceOf(c)||0)})).sort((a,b)=>b.v-a.v);
  let list=items.slice(0,6);
  if(items.length>6)list.push({k:"_other",name:t("其他","Other"),v:items.slice(6).reduce((a,b)=>a+b.v,0)});
  list=list.map((x,i)=>({...x,col:DCOL[i%DCOL.length]}));
  list.push({k:"_cash",name:t("現金","Cash"),v:S.cash,col:"var(--line)"});
  const tot=list.reduce((a,b)=>a+b.v,0)||1,R=48,C=2*Math.PI*R,gap=list.filter(x=>x.v>0).length>1?1.2:0;
  let off=0;
  $("donut").innerHTML=`<circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--bg)" stroke-width="16"/>`+list.map((x,i)=>{
    const len=x.v/tot*C,seg=Math.max(0,len-gap);
    const el=x.v>0?`<circle class="seg" data-k="${x.k}" cx="60" cy="60" r="${R}" stroke="${x.col}" stroke-dasharray="${seg} ${C-seg}" stroke-dashoffset="${-off}" style="--k:${i}"/>`:"";
    off+=len;return el}).join("");
  const stockPct=(tot-S.cash)/tot*100;
  const center=k=>{const x=list.find(y=>y.k===k);
    $("dCenter").innerHTML=x?`<div class="dk">${x.name}</div><div class="dv">${(x.v/tot*100).toFixed(1)}%</div><div class="dk">${nt(x.v)}</div>`
      :`<div class="dk">${t("股票占比","In stocks")}</div><div class="dv">${stockPct.toFixed(1)}%</div><div class="dk">${Object.keys(S.pos).length} ${t("檔","stocks")}</div>`};
  $("dLegend").innerHTML=list.filter(x=>x.v>0).map(x=>`<button data-k="${x.k}"><span class="dot" style="background:${x.col}"></span><span class="nm2">${x.name}</span><b>${(x.v/tot*100).toFixed(1)}%</b></button>`).join("");
  const select=k=>{dSel=dSel===k?null:k;
    $("donut").classList.toggle("dim",!!dSel);
    document.querySelectorAll("#donut .seg").forEach(e=>e.classList.toggle("hl",e.dataset.k===dSel));
    document.querySelectorAll("#dLegend button").forEach(e=>e.classList.toggle("hl",e.dataset.k===dSel));
    center(dSel)};
  document.querySelectorAll("#donut .seg,#dLegend button").forEach(e=>e.onclick=ev=>{ev.stopPropagation();select(e.dataset.k)});
  dSel=null;$("donut").classList.remove("dim");center(null);
}

function renderPos(){
  renderDonut();
  const codes=Object.keys(S.pos);
  if(!codes.length){$("simPos").innerHTML=`<div class="empty">${t("還沒有持股","No holdings yet")}<br><span class="sub">${t("在上面「練習下單」買一檔試試看","Try buying one in \"Practice an order\" above")}</span></div>`;return}
  $("simPos").innerHTML=codes.map((c,i)=>{const p=S.pos[c],px=priceOf(c),mv=p.sh*px,avg=p.cost/p.sh,pl=mv-p.cost,plp=pl/p.cost*100;
    return `<div class="item press pos" data-c="${c}" style="--j:${i}"><div class="rk"></div>
      <div><span class="nm">${p.name}</span><span class="cd">${c}</span><div class="meta">${shTxt(p.sh)}・${t("均價","avg")} ${avg.toFixed(2)}</div></div>
      <div class="rt"><div class="px">${money(mv)}</div><span class="badge ${cls(pl)}">${pl>=0?"+":""}${money(pl)}（${plp>=0?"+":""}${plp.toFixed(1)}%）</span></div></div>`}).join("")
    +`<div class="sub" style="margin-top:6px">${t("點持股可以直接帶到下單區賣出。損益已含買進手續費，還沒扣賣出的手續費和稅。","Tap a holding to sell it. Profit/loss includes the buy fee but not the sell fee and tax yet.")}</div>`;
  document.querySelectorAll("#simPos .item").forEach(el=>el.onclick=()=>pick(el.dataset.c,"sell"));
}
function renderLog(){
  if(!S.log.length){$("simLog").innerHTML=`<div class="sub">${t("還沒有交易紀錄。","No trades yet.")}</div>`;return}
  $("simLog").innerHTML=S.log.slice(-20).reverse().map(x=>`<div class="logrow"><span class="tag ${x.side}">${x.side==="buy"?t("買","Buy"):t("賣","Sell")}</span>
    <div style="flex:1;min-width:0"><b>${x.name}</b> <span class="sub">${x.d.slice(5)}・${shTxt(x.sh)} @ ${x.px}</span>
    <div class="sub">${t("金額","Value")} ${money(x.amt)}・${t("手續費","fee")} ${x.fee}${x.side==="sell"?`・${t("稅","tax")} ${x.tax}`:""}</div></div>
    ${x.side==="sell"?`<b class="${cls(x.pl)}" style="white-space:nowrap">${x.pl>=0?"+":""}${money(x.pl)}</b>`:""}</div>`).join("");
}

/* ---------- 下單 ---------- */
function suggest(q){
  q=q.trim().toLowerCase();
  if(!q||!window.D){$("tSug").innerHTML="";return}
  const r=D.stocks.filter(s=>s[0].toLowerCase().includes(q)||s[1].toLowerCase().includes(q))
    .sort((a,b)=>(b[0].toLowerCase()===q)-(a[0].toLowerCase()===q)||(b[0].toLowerCase().startsWith(q))-(a[0].toLowerCase().startsWith(q))||b[2]-a[2]).slice(0,6);
  $("tSug").innerHTML=r.length?r.map(s=>`<button type="button" data-c="${s[0]}"><b>${s[1]}</b> <span class="sub">${s[0]}</span>${s[8]==="o"?`<span class="mk">${t("上櫃","OTC")}</span>`:""}<span style="margin-left:auto">${s[4]}</span></button>`).join(""):`<div class="sub" style="padding:8px">${t("找不到這檔股票","Stock not found")}</div>`;
  $("tSug").querySelectorAll("button").forEach(b=>b.onclick=()=>pick(b.dataset.c));
}
function pick(code,sd){
  const m=priceMap(),s=m[code];
  if(!s&&!S.pos[code])return;
  sel={code,name:s?s[1]:S.pos[code].name,px:s?s[4]:S.pos[code].last,ch:s?s[5]:0,otc:s&&s[8]==="o"};
  lmt=sel.px;
  $("tSearch").value="";$("tSug").innerHTML="";
  if(sd)setSide(sd);
  if(sd==="sell"&&S.pos[code]){const h=availSh(code);if(h>=1000&&h%1000===0){setUnit("lot");qty=h/1000}else{setUnit("odd");qty=h%1000||999}}
  renderOrder();
  if(window.goPage)goPage(4);
  setTimeout(()=>{const c=$("orderCard"),pg=c.closest(".page");pg.scrollBy({top:c.getBoundingClientRect().top-70,behavior:"smooth"})},window.goPage?450:0);
}
window.simPick=pick;
function setSide(s){side=s;document.querySelectorAll("#tSide button").forEach(b=>b.classList.toggle("on",b.dataset.v===s));$("tSide").dataset.v=s}
function setUnit(u){unit=u;document.querySelectorAll("#tUnit button").forEach(b=>b.classList.toggle("on",b.dataset.v===u));qty=1}
function setType(v){otype=v;document.querySelectorAll("#tType button").forEach(b=>b.classList.toggle("on",b.dataset.v===v))}
function calc(){
  const sh=shares(),odd=unit==="odd",L=limits(sel.px);
  const estPx=otype==="lmt"?lmt:sel.px;
  const amt=Math.round(estPx*sh),fee=feeOf(amt,odd),tax=side==="sell"?taxOf(amt,sel.code):0;
  // 買進先保留資金：限價用限價，收盤價單用漲停價估（最壞情況）
  const resPx=otype==="lmt"?lmt:L.hi,resAmt=Math.round(resPx*sh),reserve=resAmt+feeOf(resAmt,odd);
  return {sh,odd,L,estPx,amt,fee,tax,reserve,total:side==="buy"?amt+fee:amt-fee-tax};
}
function renderOrder(){
  const has=!!sel;$("tStock").hidden=!has;$("tForm").hidden=!has;$("tEmpty").hidden=has;
  if(!has)return;
  const prevPx=sel.px-sel.ch,pct=prevPx?sel.ch/prevPx*100:0,held=S.pos[sel.code]?S.pos[sel.code].sh:0,av=availSh(sel.code);
  $("tStock").innerHTML=`<div><b style="font-size:17px">${sel.name}</b> <span class="sub">${sel.code}</span>${sel.otc?`<span class="mk">${t("上櫃","OTC")}</span>`:""}
    <div class="sub">${held?t(`你持有 ${shTxt(held)}`,`You hold ${shTxt(held)}`)+(av<held?t(`（${shTxt(held-av)} 委託賣出中）`,` (${shTxt(held-av)} in pending sells)`):""):t("目前沒有持有","You don't own this")}</div></div>
    <div class="rt"><div class="px" style="font-size:18px">${sel.px}</div><span class="badge ${cls(sel.ch)}">${arrow(sel.ch)} ${Math.abs(pct).toFixed(2)}%</span></div>`;
  $("tUnitLab").textContent=unit==="lot"?t("張","lots"):t("股","sh");
  $("tQty").value=qty;
  const c=calc();
  if(lmt==null||lmt>c.L.hi||lmt<c.L.lo)lmt=sel.px;
  $("tLimitRow").hidden=otype!=="lmt";
  $("tLmt").value=lmt;
  $("tRange").textContent=t(`可掛價格 ${c.L.lo}～${c.L.hi}（漲跌停）・每檔跳 ${tick(lmt)} 元`,`Allowed ${c.L.lo}–${c.L.hi} (limit down/up) · tick ${tick(lmt)}`);
  const cash=S.cash;let err="";
  if(side==="buy"&&c.reserve>cash)err=t(`可用現金不夠（需要先保留 ${money(c.reserve)} 元）${unit==="lot"?"，可以改買零股試試":""}`,`Not enough available cash (needs NT$${money(c.reserve)} reserved)${unit==="lot"?". Try odd lots.":""}`);
  if(side==="sell"&&c.sh>av)err=held?t(`可賣的只有 ${shTxt(av)}`,`You can only sell ${shTxt(av)}`):t("你沒有這檔股票，不能賣","You don't own this stock, so you can't sell it");
  $("tPrev").innerHTML=`<div><span>${otype==="lmt"?t("你的限價","Your limit"):t("預估成交價（以最新收盤估）","Est. price (latest close)")}</span><b>${EN?"NT$"+c.estPx.toLocaleString():c.estPx.toLocaleString()+" 元"}</b></div>
    <div><span>${t("股數","Shares")}</span><b>${c.sh.toLocaleString()} ${t("股","sh")}${c.sh>=1000?`（${shTxt(c.sh)}）`:""}</b></div>
    <div><span>${t("預估成交金額","Est. value")}</span><b>${nt(c.amt)}</b></div>
    <div><span>${t("手續費","Broker fee")} 0.1425%${c.odd?"":t("（最低 20 元）"," (min 20)")}</span><b>${nt(c.fee)}</b></div>
    ${side==="sell"?`<div><span>${t("證交稅","Transaction tax")} ${isEtf(sel.code)?"0.1%":"0.3%"}</span><b>${nt(c.tax)}</b></div>`:""}
    <div class="tot"><span>${side==="buy"?t("預估要付","Est. you pay"):t("預估拿到","Est. you receive")}</span><b>${nt(c.total)}</b></div>
    ${side==="buy"?`<div><span>${t("下單時先保留","Reserved now")}</span><b>${nt(c.reserve)}</b></div>`:""}
    <div><span>${t("預計成交","Fills at")}</span><b>${fillWhen()}</b></div>
    ${side==="buy"?`<div class="adv" style="margin-top:6px"><span>${t("損益兩平價（賣出要高於這個價才賺）","Break-even sell price")}</span><b>${(c.estPx*(1+0.001425)/(1-0.001425-(isEtf(sel.code)?0.001:0.003))).toFixed(2)}</b></div>`:""}`;
  $("tErr").textContent=err;
  $("tGo").disabled=!!err;
  $("tGo").textContent=side==="buy"?t("送出買進委託","Place buy order"):t("送出賣出委託","Place sell order");
  $("tGo").className="btn gobtn "+(side==="buy"?"buy":"sell");
}
function submit(){
  if(!sel||!window.D)return;
  const c=calc();
  if(side==="buy"&&c.reserve>S.cash)return;
  if(side==="sell"&&c.sh>availSh(sel.code))return;
  const o={id:Date.now().toString(36),code:sel.code,name:sel.name,side,sh:c.sh,odd:c.odd,type:otype,limit:otype==="lmt"?lmt:null,after:D.date,reserve:side==="buy"?c.reserve:0};
  if(side==="buy")S.cash-=o.reserve;
  S.orders.push(o);save();qty=1;
  toast(t(`委託已送出，會在${fillWhen()}依結果成交`,`Order placed. It will be filled at ${fillWhen()}.`));
  renderAll(true);
  $("tGo").classList.add("done");setTimeout(()=>$("tGo").classList.remove("done"),600);
}
/* 收盤資料進來後，處理委託：收盤價單用收盤價；限價單看當天最高最低價有沒有碰到 */
function processOrders(){
  if(!window.D||!S.orders.length)return;
  const m=priceMap(),keep=[];let filled=0,missed=0;
  for(const o of S.orders){
    if(!(D.date>o.after)){keep.push(o);continue}
    const s=m[o.code];let px=null,why="";
    if(!s){why=t("當天沒有成交資料","no trading data that day")}
    else{
      const close=s[4],hi=s[6]||close,lo=s[7]||close,ref=close-s[5],L=limits(ref),lockUp=close>=L.hi&&lo>=L.hi,lockDn=close<=L.lo&&hi<=L.lo;
      if(o.type==="mkt"){
        if(o.side==="buy"&&lockUp)why=t("漲停鎖死，排隊買不到","locked at limit up, couldn't buy");
        else if(o.side==="sell"&&lockDn)why=t("跌停鎖死，排隊賣不掉","locked at limit down, couldn't sell");
        else px=close;
      }else if(o.side==="buy"){ if(lo<=o.limit)px=Math.min(o.limit,close); else why=t(`當天最低 ${lo}，沒碰到你的限價 ${o.limit}`,`day low ${lo} never reached your ${o.limit}`) }
      else { if(hi>=o.limit)px=Math.max(o.limit,close); else why=t(`當天最高 ${hi}，沒碰到你的限價 ${o.limit}`,`day high ${hi} never reached your ${o.limit}`) }
    }
    if(px==null){
      if(o.side==="buy")S.cash+=o.reserve;
      S.results.push({d:D.date,code:o.code,name:o.name,side:o.side,sh:o.sh,ok:false,why});missed++;continue;
    }
    const amt=Math.round(px*o.sh),fee=feeOf(amt,o.odd);
    if(o.side==="buy"){
      const cost=amt+fee;S.cash+=o.reserve-cost;
      const p=S.pos[o.code]||(S.pos[o.code]={name:o.name,sh:0,cost:0,last:px});p.sh+=o.sh;p.cost+=cost;p.last=px;
      S.log.push({d:D.date,side:"buy",code:o.code,name:o.name,sh:o.sh,px,amt,fee,tax:0});
    }else{
      const p=S.pos[o.code];if(!p||p.sh<o.sh){S.results.push({d:D.date,code:o.code,name:o.name,side:o.side,sh:o.sh,ok:false,why:t("持股不足","not enough shares")});missed++;continue}
      const tax=taxOf(amt,o.code),get=amt-fee-tax,avg=p.cost/p.sh,pl=Math.round(get-avg*o.sh);
      S.cash+=get;p.cost-=avg*o.sh;p.sh-=o.sh;if(p.sh<=0)delete S.pos[o.code];
      S.log.push({d:D.date,side:"sell",code:o.code,name:o.name,sh:o.sh,px,amt,fee,tax,pl});
    }
    S.results.push({d:D.date,code:o.code,name:o.name,side:o.side,sh:o.sh,ok:true,px});filled++;
  }
  S.orders=keep;
  if(S.results.length>30)S.results=S.results.slice(-30);
  if(S.log.length>200)S.log=S.log.slice(-200);
  save();
  if(filled||missed)setTimeout(()=>toast(t(`委託結果：${filled} 筆成交、${missed} 筆沒成交`,`Orders: ${filled} filled, ${missed} not filled`)),800);
}
function renderOrders(){
  const pend=S.orders.map(o=>`<div class="logrow"><span class="tag ${o.side}">${o.side==="buy"?t("買","Buy"):t("賣","Sell")}</span>
    <div style="flex:1;min-width:0"><b>${o.name}</b> <span class="sub">${shTxt(o.sh)}・${o.type==="lmt"?t(`限價 ${o.limit}`,`limit ${o.limit}`):t("收盤價","at close")}</span>
    <div class="sub">${t("等待成交","Waiting")}${o.side==="buy"?t(`・保留 ${money(o.reserve)} 元`,` · NT$${money(o.reserve)} reserved`):""}</div></div>
    <button class="btn ghost" data-cancel="${o.id}" style="padding:5px 12px">${t("取消","Cancel")}</button></div>`).join("");
  const res=S.results.slice(-5).reverse().map(r=>`<div class="logrow" style="opacity:${r.ok?1:.75}"><span class="tag ${r.ok?r.side:"none"}">${r.ok?t("成交","Filled"):t("未成交","Missed")}</span>
    <div style="flex:1;min-width:0"><b>${r.name}</b> <span class="sub">${r.d.slice(5)}・${r.side==="buy"?t("買","buy"):t("賣","sell")} ${shTxt(r.sh)}${r.ok?` @ ${r.px}`:""}</span>${r.ok?"":`<div class="sub">${r.why}</div>`}</div></div>`).join("");
  $("simOrders").innerHTML=(pend||`<div class="sub">${t("目前沒有委託。","No pending orders.")}</div>`)+(res?`<div class="sub" style="margin:12px 0 2px;font-weight:700">${t("最近的委託結果","Recent results")}</div>${res}`:"");
  document.querySelectorAll("[data-cancel]").forEach(b=>b.onclick=()=>{const o=S.orders.find(x=>x.id===b.dataset.cancel);if(!o)return;
    if(o.side==="buy")S.cash+=o.reserve;S.orders=S.orders.filter(x=>x!==o);save();toast(t("已取消委託","Order cancelled"));renderAll()});
}
function toast(t){const el=$("simToast");el.textContent=t;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),2600)}

function renderAll(anim){processOrders();renderTop(anim);renderOrder();renderOrders();renderPos();renderLog();
  if(window.renderWatch)renderWatch();}
window.simRender=renderAll;
window.simHeld=c=>S.pos[c]?S.pos[c].sh:0;

/* ---------- 事件 ---------- */
let sgT;$("tSearch").oninput=e=>{clearTimeout(sgT);sgT=setTimeout(()=>suggest(e.target.value),120)};
$("tSearch").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();const b=$("tSug").querySelector("button");if(b)b.click()}};
document.querySelectorAll("#tSide button").forEach(b=>b.onclick=()=>{setSide(b.dataset.v);renderOrder()});
document.querySelectorAll("#tUnit button").forEach(b=>b.onclick=()=>{setUnit(b.dataset.v);renderOrder()});
$("tMinus").onclick=()=>{qty=Math.max(1,qty-1);renderOrder()};
$("tPlus").onclick=()=>{qty=Math.min(unit==="lot"?999:999,qty+1);renderOrder()};
$("tQty").oninput=e=>{const v=parseInt(e.target.value,10);if(v>0){qty=Math.min(999,v);renderOrder()}};
$("tQty").onblur=()=>renderOrder();
document.querySelectorAll("#tQuick button").forEach(b=>b.onclick=()=>{const v=b.dataset.q;
  if(v==="max"&&sel){
    if(side==="sell"){const h=availSh(sel.code);if(unit==="lot")qty=Math.max(1,Math.floor(h/1000));else qty=Math.max(1,Math.min(999,h%1000||999));}
    else{const L=limits(sel.px),per=(otype==="lmt"?lmt:L.hi)*(unit==="lot"?1000:1);let n=Math.floor(S.cash/(per*1.001425));qty=Math.max(1,Math.min(999,n));}
  } else qty=+v;renderOrder()});
$("tGo").onclick=submit;
document.querySelectorAll("#tType button").forEach(b=>b.onclick=()=>{setType(b.dataset.v);if(sel)lmt=sel.px;renderOrder()});
const stepL=d=>{if(!sel)return;const L=limits(sel.px);let v=+(lmt+d*tick(d>0?lmt:lmt-1e-9)).toFixed(2);v=Math.min(L.hi,Math.max(L.lo,v));lmt=v;renderOrder()};
$("tLMinus").onclick=()=>stepL(-1);$("tLPlus").onclick=()=>stepL(1);
$("tLmt").onchange=e=>{if(!sel)return;const L=limits(sel.px);let v=parseFloat(e.target.value);if(!(v>0))v=sel.px;v=roundTick(v,0);lmt=Math.min(L.hi,Math.max(L.lo,v));renderOrder()};
document.querySelectorAll("#simCap button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#simCap button").forEach(x=>x.classList.toggle("on",x===b))});
let armT=0;
$("simReset").onclick=()=>{const b=$("simReset");
  if(Date.now()-armT>3000){armT=Date.now();b.textContent=t("再按一次確認（會清空紀錄）","Tap again to confirm (clears everything)");setTimeout(()=>b.textContent=t("重新開始","Start over"),3000);return}
  const cap=+document.querySelector("#simCap button.on").dataset.v;S=fresh(cap);sel=null;save();b.textContent=t("重新開始","Start over");renderAll(true);toast(t(`已重新開始，起始資金 ${money(cap)} 元`,`Restarted with NT$${money(cap)}`))};
document.querySelectorAll("#simCap button").forEach(b=>b.classList.toggle("on",+b.dataset.v===S.init));
if(!document.querySelector("#simCap button.on"))document.querySelector('#simCap button[data-v="1000000"]').classList.add("on");
renderOrder();
})();
