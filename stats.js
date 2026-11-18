/* 不記名答題統計：送到 Jotform 表單。只送題號、對錯、等級、語言和一個隨機裝置代碼。
   為了不超過免費方案的每月筆數，答題會先存在裝置上，累積一批才送一次。 */
(function(){
var FORM="263211443868055",URL="https://submit.jotform.com/submit/"+FORM;
function get(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var dev=get("tw_dev",null);if(!dev){dev=Math.random().toString(36).slice(2,10);set("tw_dev",dev)}
window.statOn=function(){return true};
window.statRecord=function(id,ok,lv){
  if(!statOn())return;
  var q=get("tw_statq",[]);q.push(id+":"+(ok?1:0));set("tw_statq",q);set("tw_stat_lv",lv);
  maybeSend(false);
};
var sending=false;
function maybeSend(force){
  if(sending||!statOn())return;
  var q=get("tw_statq",[]),age=Date.now()-get("tw_stat_last",0);
  if(!q.length)return;
  // 累積 20 題且距離上次超過 2 天，或累積到 80 題，才送一次
  if(!(force||(q.length>=20&&age>48*3600e3)||q.length>=80))return;
  sending=true;
  var body=new URLSearchParams({formID:FORM,simple_spc:FORM+"-"+FORM,q2_textbox0:dev,q3_textbox1:String(get("tw_stat_lv","")),q4_textbox2:(window.LANG||"zh"),q5_textarea3:q.join(","),q6_textbox4:"v1"});
  fetch(URL,{method:"POST",mode:"no-cors",body:body}).then(function(){
    var now=get("tw_statq",[]);set("tw_statq",now.slice(q.length));set("tw_stat_last",Date.now());
  }).catch(function(){}).then(function(){sending=false});
}
document.addEventListener("visibilitychange",function(){if(document.hidden)maybeSend(false)});
})();
