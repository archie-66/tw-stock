/* 模擬交易：用假錢、以最新收盤價練習下單（資料只存在這台裝置） */
(function(){
const $=id=>document.getElementById(id);
const KEY="tw_sim";
const money=n=>Math.round(n).toLocaleString("zh-TW");
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const fresh=init=>({init,cash:init,pos:{},log:[],eq:{}});
let S=load()||fresh(1000000);
let sel=null, side="buy", unit="lot", qty=1;

const priceMap=()=>{const m={};if(window.D)for(const s of D.stocks)m[s[0]]=s;return m};
const isEtf=c=>/^00/.test(c);
const feeOf=(amt,odd)=>Math.max(Math.floor(amt*0.001425),odd?1:20);
const taxOf=(amt,c)=>Math.floor(amt*(isEtf(c)?0.001:0.003));
const shares=()=>unit==="lot"?qty*1000:qty;
const shTxt=sh=>{const l=Math.floor(sh/1000),o=sh%1000;if(EN)return (l?`${l} lot${l>1?"s":""}`:"")+(l&&o?" + ":"")+(o?`${o} sh`:"")||"0 sh";return (l?`${l} 張`:"")+(l&&o?" ":"")+(o?`${o} 股`:"")||"0 股"};
const nt=n=>EN?`NT$${money(n)}`:`${money(n)} 元`;

function priceOf(code){const m=priceMap();return m[code]?m[code][4]:(S.pos[code]?S.pos[code].last:null)}
function equity(){let v=S.cash;for(const c in S.pos)v+=S.pos[c].sh*(priceOf(c)||0);return v}

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
function renderPos(){
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
  $("tSug").innerHTML=r.length?r.map(s=>`<button type="button" data-c="${s[0]}"><b>${s[1]}</b> <span class="sub">${s[0]}</span><span style="margin-left:auto">${s[4]}</span></button>`).join(""):`<div class="sub" style="padding:8px">${t("找不到這檔股票（目前只有上市股票）","Not found (only TWSE-listed stocks for now)")}</div>`;
  $("tSug").querySelectorAll("button").forEach(b=>b.onclick=()=>pick(b.dataset.c));
}
function pick(code,sd){
  const m=priceMap(),s=m[code];
  if(!s&&!S.pos[code])return;
  sel={code,name:s?s[1]:S.pos[code].name,px:s?s[4]:S.pos[code].last,ch:s?s[5]:0};
  $("tSearch").value="";$("tSug").innerHTML="";
  if(sd)setSide(sd);
  if(sd==="sell"&&S.pos[code]){const h=S.pos[code].sh;if(h>=1000&&h%1000===0){setUnit("lot");qty=h/1000}else{setUnit("odd");qty=h%1000||999}}
  renderOrder();
  if(window.goPage)goPage(4);
  setTimeout(()=>{const c=$("orderCard"),pg=c.closest(".page");pg.scrollBy({top:c.getBoundingClientRect().top-70,behavior:"smooth"})},window.goPage?450:0);
}
window.simPick=pick;
function setSide(s){side=s;document.querySelectorAll("#tSide button").forEach(b=>b.classList.toggle("on",b.dataset.v===s));$("tSide").dataset.v=s}
function setUnit(u){unit=u;document.querySelectorAll("#tUnit button").forEach(b=>b.classList.toggle("on",b.dataset.v===u));qty=1}
function renderOrder(){
  const has=!!sel;$("tStock").hidden=!has;$("tForm").hidden=!has;$("tEmpty").hidden=has;
  if(!has)return;
  const prevPx=sel.px-sel.ch,pct=prevPx?sel.ch/prevPx*100:0,held=S.pos[sel.code]?S.pos[sel.code].sh:0;
  $("tStock").innerHTML=`<div><b style="font-size:17px">${sel.name}</b> <span class="sub">${sel.code}</span>
    <div class="sub">${held?t(`你持有 ${shTxt(held)}`,`You hold ${shTxt(held)}`):t("目前沒有持有","You don't own this")}</div></div>
    <div class="rt"><div class="px" style="font-size:18px">${sel.px}</div><span class="badge ${cls(sel.ch)}">${arrow(sel.ch)} ${Math.abs(pct).toFixed(2)}%</span></div>`;
  $("tUnitLab").textContent=unit==="lot"?t("張","lots"):t("股","sh");
  $("tQty").value=qty;
  const sh=shares(),amt=Math.round(sel.px*sh),odd=unit==="odd",fee=feeOf(amt,odd),tax=side==="sell"?taxOf(amt,sel.code):0;
  const total=side==="buy"?amt+fee:amt-fee-tax;
  let err="";
  if(side==="buy"&&total>S.cash)err=t(`現金不夠（還差 ${money(total-S.cash)} 元）${unit==="lot"?"，可以改買零股試試":""}`,`Not enough cash (short NT$${money(total-S.cash)})${unit==="lot"?". Try odd lots instead.":""}`);
  if(side==="sell"&&sh>held)err=held?t(`你只有 ${shTxt(held)}`,`You only have ${shTxt(held)}`):t("你沒有這檔股票，不能賣","You don't own this stock, so you can't sell it");
  $("tPrev").innerHTML=`<div><span>${t("成交價","Price")}</span><b>${EN?"NT$"+sel.px.toLocaleString():sel.px.toLocaleString()+" 元"}</b></div>
    <div><span>${t("股數","Shares")}</span><b>${sh.toLocaleString()} ${t("股","sh")}${sh>=1000?`（${shTxt(sh)}）`:""}</b></div>
    <div><span>${t("成交金額","Trade value")}</span><b>${nt(amt)}</b></div>
    <div><span>${t("手續費","Broker fee")} 0.1425%</span><b>${nt(fee)}</b></div>
    ${side==="sell"?`<div><span>${t("證交稅","Transaction tax")} ${isEtf(sel.code)?"0.1%":"0.3%"}</span><b>${nt(tax)}</b></div>`:""}
    <div class="tot"><span>${side==="buy"?t("你要付","You pay"):t("你會拿到","You receive")}</span><b>${nt(total)}</b></div>`;
  $("tErr").textContent=err;
  $("tGo").disabled=!!err;
  $("tGo").textContent=side==="buy"?t("確認買進","Confirm buy"):t("確認賣出","Confirm sell");
  $("tGo").className="btn gobtn "+(side==="buy"?"buy":"sell");
}
function submit(){
  if(!sel)return;
  const sh=shares(),amt=Math.round(sel.px*sh),odd=unit==="odd",fee=feeOf(amt,odd),d=window.D?D.date:"";
  if(side==="buy"){
    const cost=amt+fee;if(cost>S.cash)return;
    S.cash-=cost;const p=S.pos[sel.code]||(S.pos[sel.code]={name:sel.name,sh:0,cost:0,last:sel.px});
    p.sh+=sh;p.cost+=cost;p.last=sel.px;
    S.log.push({d,side,code:sel.code,name:sel.name,sh,px:sel.px,amt,fee,tax:0});
    toast(t(`買進 ${sel.name} ${shTxt(sh)}，花了 ${money(cost)} 元`,`Bought ${shTxt(sh)} of ${sel.name} for NT$${money(cost)}`));
  } else {
    const p=S.pos[sel.code];if(!p||sh>p.sh)return;
    const tax=taxOf(amt,sel.code),get=amt-fee-tax,avg=p.cost/p.sh,pl=Math.round(get-avg*sh);
    S.cash+=get;p.cost-=avg*sh;p.sh-=sh;if(p.sh<=0)delete S.pos[sel.code];
    S.log.push({d,side,code:sel.code,name:sel.name,sh,px:sel.px,amt,fee,tax,pl});
    toast(t(`賣出 ${sel.name}，${pl>=0?"賺":"賠"} ${money(Math.abs(pl))} 元（已扣手續費和稅）`,`Sold ${sel.name}: ${pl>=0?"profit":"loss"} of NT$${money(Math.abs(pl))} (after fees and tax)`));
  }
  if(S.log.length>200)S.log=S.log.slice(-200);
  save();qty=1;renderAll(true);
  $("tGo").classList.add("done");setTimeout(()=>$("tGo").classList.remove("done"),600);
}
function toast(t){const el=$("simToast");el.textContent=t;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),2600)}

function renderAll(anim){renderTop(anim);renderOrder();renderPos();renderLog();
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
    if(side==="sell"){const h=simHeld(sel.code);if(unit==="lot")qty=Math.max(1,Math.floor(h/1000));else qty=Math.max(1,Math.min(999,h%1000||999));}
    else{const per=sel.px*(unit==="lot"?1000:1);let n=Math.floor(S.cash/(per*1.001425));qty=Math.max(1,Math.min(999,n));}
  } else qty=+v;renderOrder()});
$("tGo").onclick=submit;
document.querySelectorAll("#simCap button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#simCap button").forEach(x=>x.classList.toggle("on",x===b))});
let armT=0;
$("simReset").onclick=()=>{const b=$("simReset");
  if(Date.now()-armT>3000){armT=Date.now();b.textContent=t("再按一次確認（會清空紀錄）","Tap again to confirm (clears everything)");setTimeout(()=>b.textContent=t("重新開始","Start over"),3000);return}
  const cap=+document.querySelector("#simCap button.on").dataset.v;S=fresh(cap);sel=null;save();b.textContent=t("重新開始","Start over");renderAll(true);toast(t(`已重新開始，起始資金 ${money(cap)} 元`,`Restarted with NT$${money(cap)}`))};
document.querySelectorAll("#simCap button").forEach(b=>b.classList.toggle("on",+b.dataset.v===S.init));
if(!document.querySelector("#simCap button.on"))document.querySelector('#simCap button[data-v="1000000"]').classList.add("on");
renderOrder();
})();
