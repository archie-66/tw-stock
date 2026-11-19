/* 個股詳細頁：K 線、公司簡介、近三天走勢、新聞 */
(function(){
const IND_EN={"水泥工業": "cement", "食品工業": "food", "塑膠工業": "plastics", "紡織纖維": "textiles", "電機機械": "electrical machinery", "電器電纜": "electrical cable", "化學工業": "chemicals", "生技醫療業": "biotech & medical", "玻璃陶瓷": "glass & ceramics", "造紙工業": "paper", "鋼鐵工業": "steel", "橡膠工業": "rubber", "汽車工業": "automotive", "半導體業": "semiconductor", "電腦及週邊設備業": "computers & peripherals", "光電業": "optoelectronics", "通信網路業": "communications", "電子零組件業": "electronic components", "電子通路業": "electronics distribution", "資訊服務業": "IT services", "其他電子業": "other electronics", "建材營造": "construction", "航運業": "shipping", "觀光餐旅": "tourism & hospitality", "金融保險": "finance & insurance", "金融保險業": "finance & insurance", "貿易百貨": "retail & trading", "油電燃氣業": "oil, power & gas", "綜合": "conglomerate", "其他": "other", "綠能環保": "green energy", "數位雲端": "digital & cloud", "運動休閒": "sports & leisure", "居家生活": "home & living", "文化創意業": "cultural & creative", "農業科技業": "agritech", "電子商務業": "e-commerce"};
const $=id=>document.getElementById(id);
const cache={hist:{},info:null,news:null};
const SHARDS=40;
const shard=c=>[...c].reduce((a,ch)=>a+ch.charCodeAt(0),0)%SHARDS;
async function getJSON(u){try{const r=await fetch(u,{cache:"no-cache"});if(!r.ok)return null;return await r.json()}catch(e){return null}}
async function hist(code){const k=shard(code);if(!(k in cache.hist))cache.hist[k]=await getJSON(`hist/${String(k).padStart(2,"0")}.json`)||{};return cache.hist[k][code]||[]}
async function info(){if(!cache.info)cache.info=(await getJSON("info.json"))||{c:{}};return cache.info.c||{}}
async function news(){if(!cache.news)cache.news=(await getJSON("news.json"))||{c:{}};return cache.news}
const f2=(n,d=2)=>n==null?"--":Number(n).toLocaleString("zh-TW",{minimumFractionDigits:d,maximumFractionDigits:d});
const pctOf=(a,b)=>b?(a-b)/b*100:0;
const md=d=>`${+d.slice(4,6)}/${+d.slice(6,8)}`;
let cur=null,range=20,rows=[],selIdx=null;

/* ---------- 走勢白話說明 ---------- */
function trendText(r,s){
  if(r.length<2)return t("這檔的歷史資料還在累積中，過幾天就會有走勢說明。","History for this stock is still building up. Check back in a few days.");
  const last=r[r.length-1],c=last[4],n=Math.min(3,r.length-1),base=r[r.length-1-n][4],ch=pctOf(c,base);
  const ups=r.slice(-n).filter((x,i,a)=>x[4]>(r[r.length-n-1+i]||[0,0,0,0,x[4]])[4]).length;
  const avg=k=>r.length>=k?r.slice(-k).reduce((a,x)=>a+x[4],0)/k:null;
  const ma5=avg(5),ma20=avg(20);
  const v=last[5],v5=r.length>=6?r.slice(-6,-1).reduce((a,x)=>a+x[5],0)/5:null;
  const out=[];
  out.push(EN?`Over the last ${n} trading day${n>1?"s":""} it went ${ch>=0?"up":"down"} <b class="${cls(ch)}">${Math.abs(ch).toFixed(1)}%</b> (${ups} up day${ups===1?"":"s"} out of ${n}).`
    :`最近 ${n} 個交易日${ch>=0?"上漲":"下跌"} <b class="${cls(ch)}">${Math.abs(ch).toFixed(1)}%</b>，其中 ${ups} 天比前一天漲。`);
  if(ma5&&ma20)out.push(c>=ma5&&c>=ma20?t("股價在 5 日和 20 日均線之上，短期走勢偏強。","It's above its 5- and 20-day averages: a stronger short-term trend."):c<ma5&&c<ma20?t("股價在 5 日和 20 日均線之下，短期走勢偏弱。","It's below its 5- and 20-day averages: a weaker short-term trend."):t("股價在兩條均線之間，方向還不明確。","It's between its averages: no clear direction yet."));
  else if(ma5)out.push(c>=ma5?t("股價站在 5 日均線之上。","It's above its 5-day average."):t("股價在 5 日均線之下。","It's below its 5-day average."));
  if(v5){const vr=v/v5;out.push(vr>=1.8?t(`今天成交量是前 5 天平均的 ${vr.toFixed(1)} 倍，交易特別熱絡。`,`Today's volume was ${vr.toFixed(1)}× the 5-day average: unusually busy.`):vr<=0.5?t("今天成交量比平常少很多，大家在觀望。","Volume was much lower than usual: people are waiting."):"")}
  const [,o,h,l]=last,body=Math.abs(c-o),up=h-Math.max(o,c),dn=Math.min(o,c)-l;
  if(h>l){if(up>body*1.5&&up>dn)out.push(t("今天留下長上影線，盤中衝高後被賣回。","Today left a long upper shadow: it rose, then got sold back down."));else if(dn>body*1.5&&dn>up)out.push(t("今天留下長下影線，盤中下跌後有人買回。","Today left a long lower shadow: it fell, then got bought back."))}
  return out.filter(Boolean).join(" ");
}

/* ---------- 公司簡介 ---------- */
function about(code,name,inf,otc){
  let s=(window.KNOWN&&KNOWN[code])||"";
  const mk=otc?t("上櫃","OTC-listed"):t("上市","listed");
  if(/^00/.test(code)){
    const lev=/L$/.test(code),inv=/R$/.test(code);
    return s||(lev?t(`${name}是槓桿 ETF，每天的漲跌大約是追蹤指數的 2 倍，風險比一般 ETF 高很多，不適合長期抱著不管。`,`${name} is a leveraged ETF: it moves about 2× its index each day. Much riskier than a normal ETF.`)
      :inv?t(`${name}是反向 ETF，追蹤的指數跌、它就漲，通常是短期避險用。`,`${name} is an inverse ETF: it rises when its index falls. Usually used for short-term hedging.`)
      :t(`${name}是 ETF，一次買進一籃子股票，比只買一家公司分散風險。`,`${name} is an ETF that holds a basket of stocks, spreading risk compared with a single company.`));
  }
  const parts=[];
  if(inf){
    const [ind,fd,ld,cap,en]=inf,yr=x=>{const d=String(x||"").replace(/\D/g,"");if(d.length>=8)return +d.slice(0,4);if(d.length>=6)return +d.slice(0,d.length-4)+1911;return ""};
    if(EN)parts.push(`${en?en+" ("+name+")":name} is ${/^[aeiouAEIOU]/.test(mk)?"an":"a"} ${mk} company${ind?` in the ${IND_EN[ind]||ind} sector`:""}.`+(yr(fd)?` Founded in ${yr(fd)}`:"")+(yr(ld)?`${yr(fd)?",":""} listed in ${yr(ld)}`:"")+(yr(fd)||yr(ld)?".":"")+(cap?` Paid-in capital about NT$${f2(cap/10,1)}bn.`:""));
    else parts.push(`${name}是${mk}的${ind||""}公司`+(yr(fd)?`，${yr(fd)} 年成立`:"")+(yr(ld)?`，${yr(ld)} 年${otc?"上櫃":"上市"}`:"")+(cap?`，資本額約 ${f2(cap,0)} 億元`:"")+"。");
  } else parts.push(t(`${name}是${mk}股票。`,`${name} is a ${mk} stock.`));
  if(s)parts.unshift(s);
  return parts.join(" ");
}

/* ---------- K 線圖 ---------- */
function drawK(){
  const r=rows.slice(-range),n=r.length,svg=$("sdK");
  if(!n){svg.innerHTML=`<text x="170" y="100" text-anchor="middle" font-size="12" fill="var(--mute)">${t("K 線資料累積中","Building history…")}</text>`;$("sdKInfo").textContent="";$("sdKAxis").innerHTML="";return}
  const W=340,PT=8,PH=150,VT=172,VH=40,X1=300,step=(X1-6)/Math.max(n,20),X0=X1-step*n,bw=Math.max(2,step*.62);
  const hi=Math.max(...r.map(x=>x[2])),lo=Math.min(...r.map(x=>x[3])),pad=(hi-lo)*.06||hi*.01||1,H=hi+pad,L=lo-pad;
  const y=v=>PT+(H-v)/(H-L)*PH,vmax=Math.max(...r.map(x=>x[5]))||1;
  const ma=r.map((_,i)=>{const all=rows.length-n+i;return all<4?null:rows.slice(all-4,all+1).reduce((a,x)=>a+x[4],0)/5});
  let g=`<line x1="6" x2="${X1}" y1="${y(hi)}" y2="${y(hi)}" stroke="var(--line)" stroke-dasharray="3 3"/><line x1="6" x2="${X1}" y1="${y(lo)}" y2="${y(lo)}" stroke="var(--line)" stroke-dasharray="3 3"/>
    <text x="${X1+4}" y="${y(hi)+4}" font-size="9" fill="var(--mute)">${f2(hi,hi>=100?0:2)}</text><text x="${X1+4}" y="${y(lo)+4}" font-size="9" fill="var(--mute)">${f2(lo,lo>=100?0:2)}</text>`;
  r.forEach((x,i)=>{const [d,o,h,l,c,v]=x,up=c>=o,col=up?"var(--up)":"var(--down)",cx=X0+step*(i+.5);
    g+=`<g class="kc" style="--k:${i}"><line x1="${cx}" x2="${cx}" y1="${y(h)}" y2="${y(l)}" stroke="${col}" stroke-width="1.2"/><rect x="${cx-bw/2}" y="${y(Math.max(o,c))}" width="${bw}" height="${Math.max(1.2,Math.abs(y(o)-y(c)))}" fill="${col}" rx="${bw>5?1:0}"/></g>
      <rect class="kv" x="${cx-bw/2}" y="${VT+VH-v/vmax*VH}" width="${bw}" height="${Math.max(.5,v/vmax*VH)}" fill="${col}" opacity=".45"/>`});
  const mp=ma.map((v,i)=>v==null?null:`${X0+step*(i+.5)},${y(v)}`).filter(Boolean);
  if(mp.length>1)g+=`<polyline points="${mp.join(" ")}" fill="none" stroke="var(--accent)" stroke-width="1.4" stroke-dasharray="4 3"/>`;
  g+=`<line id="sdCross" x1="0" x2="0" y1="${PT}" y2="${VT+VH}" stroke="var(--ink)" stroke-width=".8" opacity="0"/><rect id="sdHit" x="${X0}" y="0" width="${X1-X0}" height="${VT+VH}" fill="transparent"/>`;
  svg.innerHTML=g;
  $("sdKAxis").innerHTML=`<span>${md(r[0][0])}</span><span>${t("藍色虛線＝5 日均線・下方是成交量","Blue dashed = 5-day average · bars = volume")}</span><span>${md(r[n-1][0])}</span>`;
  const show=i=>{i=Math.max(0,Math.min(n-1,i));selIdx=i;const [d,o,h,l,c,v]=r[i],p=i>0?pctOf(c,r[i-1][4]):(rows.length>n?pctOf(c,rows[rows.length-n-1][4]):null),cx=X0+step*(i+.5);
    const cr=$("sdCross");cr.setAttribute("x1",cx);cr.setAttribute("x2",cx);cr.setAttribute("opacity",".35");
    $("sdKInfo").innerHTML=`<b>${md(d)}</b> ${t("開","O")} ${o} ${t("高","H")} ${h} ${t("低","L")} ${l} ${t("收","C")} <b class="${p==null?"":cls(p)}">${c}</b>${p==null?"":` <span class="${cls(p)}">${p>=0?"+":""}${p.toFixed(2)}%</span>`} · ${v.toLocaleString()} ${t("張","lots")}`};
  const pos=e=>{const b=svg.getBoundingClientRect(),px=((e.touches?e.touches[0].clientX:e.clientX)-b.left)/b.width*W;return Math.floor((px-X0)/step)};
  const hit=$("sdHit");hit.onclick=e=>show(pos(e));hit.ontouchmove=e=>{show(pos(e));e.preventDefault()};hit.onmousemove=e=>{if(e.buttons)show(pos(e))};
  show(n-1);
}

/* ---------- 打開 ---------- */
async function openStock(code){
  if(!window.D)return;
  const s=D.stocks.find(x=>x[0]===code);if(!s)return;
  cur=code;const otc=s[8]==="o",ch=s[5],ref=s[4]-ch,p=ref?ch/ref*100:0;
  $("sdName").innerHTML=`${s[1]} <span class="sub">${code}</span>${otc?`<span class="mk">${t("上櫃","OTC")}</span>`:""}`;
  $("sdPx").innerHTML=`<span class="big ${cls(ch)}" style="font-size:34px">${s[4].toLocaleString()}</span> <span class="chg ${cls(ch)}">${arrow(ch)} ${Math.abs(ch)}（${p>=0?"+":""}${p.toFixed(2)}%）</span>`;
  $("sdStats").innerHTML=[[t("開盤","Open"),s[9]??"--"],[t("最高","High"),s[6]],[t("最低","Low"),s[7]],[t("成交量","Volume"),s[3].toLocaleString()+t(" 張"," lots")],[t("成交金額","Value"),yi(s[2])],[t("昨收","Prev"),f2(ref,ref>=100?1:2)]].map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join("");
  $("sdStar").textContent=isW(code)?"★":"☆";$("sdStar").classList.toggle("on",isW(code));$("sdStar").dataset.star=code;
  $("sdAbout").textContent=t("載入中…","Loading…");$("sdTrend").innerHTML="";$("sdNews").innerHTML="";$("sdK").innerHTML="";$("sdKInfo").textContent="";$("sdKLoad").hidden=false;$("sdK").style.display="none";
  $("sd").classList.add("show");$("sd").scrollTop=0;document.body.classList.add("sd-open");
  const [r,inf,nw]=await Promise.all([hist(code),info(),news()]);
  if(cur!==code)return;
  $("sdKLoad").hidden=true;$("sdK").style.display="";
  rows=r.slice();
  const tday=D.date.replace(/-/g,"");
  if(!rows.length||rows[rows.length-1][0]<tday)rows.push([tday,s[9]||s[4],s[6]||s[4],s[7]||s[4],s[4],s[3]]);
  $("sdAbout").textContent=about(code,s[1],inf[code],otc);
  $("sdTrend").innerHTML=trendText(rows,s);
  $("sdRecent").innerHTML=rows.slice(-3).map((x,i,a)=>{const prev=rows[rows.length-3+i-1];const pp=prev?pctOf(x[4],prev[4]):null;
    return `<div><span>${md(x[0])}</span><b>${x[4]}</b><span class="${pp==null?"":cls(pp)}">${pp==null?"--":(pp>=0?"+":"")+pp.toFixed(2)+"%"}</span></div>`}).join("");
  const items=(nw.c||{})[code];
  const g=`https://news.google.com/search?q=${encodeURIComponent(s[1]+" "+code)}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
  if(items&&items.length)$("sdNews").innerHTML=items.map(([d,title,src,link])=>`<a class="nitem press" href="${link}" target="_blank" rel="noopener"><div class="nd">${d}${src?` · ${src}`:""}</div><div class="nt">${title}</div></a>`).join("")+`<a class="nmore" href="${g}" target="_blank" rel="noopener">${t("看更多新聞 →","More news →")}</a>`;
  else $("sdNews").innerHTML=`<div class="sub">${t("最近 3 天這檔比較少新聞（只整理成交金額前 150 名的熱門股）。","Few recent headlines for this stock (we collect news for the 150 most-traded stocks).")}</div><a class="nmore" href="${g}" target="_blank" rel="noopener">${t("到 Google 新聞搜尋 →","Search Google News →")}</a>`;
  drawK();
}
window.openStock=openStock;
function closeStock(){$("sd").classList.remove("show");document.body.classList.remove("sd-open");cur=null}
$("sdClose").onclick=closeStock;
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&cur)closeStock()});
document.querySelectorAll("#sdRange button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#sdRange button").forEach(x=>x.classList.toggle("on",x===b));range=+b.dataset.r;drawK()});
$("sdSim").onclick=e=>{e.stopPropagation();const c=cur;closeStock();setTimeout(()=>window.simPick&&simPick(c,"buy"),250)};
// 往下拉關閉
let sy=null;$("sdGrab").addEventListener("touchstart",e=>{sy=e.touches[0].clientY},{passive:true});
$("sdGrab").addEventListener("touchend",e=>{if(sy!=null&&e.changedTouches[0].clientY-sy>60)closeStock();sy=null});
})();
