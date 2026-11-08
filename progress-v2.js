/* СЕТ · Progress 2.0. Read-only analytics from existing workout records. */
(function(){
"use strict";
const n=v=>{if(v===null||v===undefined||v==="")return null;const x=Number(String(v).replace(",","."));return Number.isFinite(x)&&x>=0?x:null};
const f=v=>Number.isFinite(v)?Number(v.toFixed(1)).toLocaleString("ru-RU",{maximumFractionDigits:1}):"—";
const unit=m=>m==="reps"?" повт.":m==="volume"?" кг × повт.":" кг";
const labels={weight:"Рабочий вес",e1rm:"Расчётная сила · e1RM",volume:"Объём тренировки",reps:"Повторения"};
const getSets=e=>{
 if(Array.isArray(e.setResults)&&e.setResults.length)return e.setResults.map(x=>({w:n(x.weight),r:n(x.reps)}));
 if(Array.isArray(e.reps))return e.reps.map(x=>({w:n(e.weight),r:n(x)}));
 return e.weight===undefined?[]:[{w:n(e.weight),r:n(e.reps)}];
};
function metrics(e,bodyweight){
 const sets=getSets(e),complete=sets.filter(x=>x.w!==null&&x.w>0&&x.r!==null&&x.r>0);
 const max=(a)=>a.length?Math.max(...a):null;
 return {sets,complete,
  weight:max(complete.map(x=>x.w)),
  reps:max(sets.map(x=>x.r).filter(x=>x!==null&&x>0)),
  volume:complete.length?complete.reduce((s,x)=>s+x.w*x.r,0):null,
  e1rm:bodyweight?null:max(complete.filter(x=>x.r<=12).map(x=>x.w*(1+x.r/30)))};
}
function format(v,m){return v===null||v===undefined||!Number.isFinite(v)?"—":f(v)+unit(m)}
function delta(a,b,m){
 if(a===null||b===null)return "Недостаточно данных";
 const d=a-b,p=b>0?d/b*100:null;
 return (d>0?"+":"")+f(d)+unit(m)+(p===null?"":" · "+(p>0?"+":"")+f(p)+"%");
}
function el(id){return document.getElementById(id)}
function setText(id,value){const e=el(id);if(e)e.textContent=value}
function mk(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function statCard(label,value,sub){
 const card=mk("div","preview-stat"),t=mk("span","",label),v=mk("strong","",value);
 card.append(t,v);if(sub)card.append(mk("small","",sub));return card;
}
function renderCompare(rows,m,dateFmt){
 const wrap=el("progressComparison");if(!wrap)return;wrap.replaceChildren();
 const good=rows.filter(x=>x.val[m]!==null),last=good.at(-1),prev=good.at(-2);
 if(!last){wrap.append(mk("p","preview-muted","Нет подходящих записей"));return}
 const grid=mk("div","preview-compare-grid");
 grid.append(statCard("ПОСЛЕДНЯЯ",format(last.val[m],m),dateFmt(last.date)));
 grid.append(statCard("ПРЕДЫДУЩАЯ",prev?format(prev.val[m],m):"—",prev?dateFmt(prev.date):"Ещё нет записи"));
 wrap.append(grid,mk("div","preview-delta",prev?delta(last.val[m],prev.val[m],m):"Добавь ещё одну тренировку для сравнения"));
}
function renderRecords(rows){
 const wrap=el("progressRecords");if(!wrap)return;wrap.replaceChildren();
 const best=k=>{const nums=rows.map(x=>x.val[k]).filter(x=>x!==null);return nums.length?Math.max(...nums):null};
 const grid=mk("div","preview-record-grid");
 grid.append(statCard("МАКС. ВЕС",format(best("weight"),"weight")));
 grid.append(statCard("ЛУЧШИЙ e1RM",format(best("e1rm"),"e1rm")));
 grid.append(statCard("МАКС. ОБЪЁМ",format(best("volume"),"volume")));
 wrap.append(grid);
 const reps=mk("div","preview-rep-grid");
 for(const number of [5,8,10]){
  const matches=rows.flatMap(x=>x.val.complete.filter(y=>y.r===number).map(y=>y.w));
  reps.append(statCard(number+" ПОВТ.",matches.length?format(Math.max(...matches),"weight"):"—"));
 }
 wrap.append(reps);
}
function cutoff(days){
 const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-days+1);
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}
function empty(id,text){const elmt=el(id);if(elmt)elmt.replaceChildren(mk("div","chart-empty",text))}
window.setlogRenderProgressV2=function(ctx){
 const id=ctx.currentExerciseStats(),m=el("progressMetric").value,range=el("progressPeriod").value;
 setText("progressTrendTitle",labels[m]);setText("progressTrendUnit",unit(m).trim().toUpperCase());
 setText("progressTrendLegend",m==="e1rm"?"Формула Эпли · только 1–12 повторений":m==="volume"?"Килограммы × повторения за тренировку":labels[m]+" по тренировкам");
 const clear=()=>{
  for(const k of ["metricWeight","metricE1rm","metricVolume","metricBest"])setText(k,"—");
  setText("metricWeightDelta","Нет записей");
  empty("weightChart","Нет данных за выбранный период.");empty("repsChart","Недостаточно данных.");
  el("progressComparison").replaceChildren(mk("p","preview-muted","Нет тренировок для сравнения"));
  el("progressRecords").replaceChildren(mk("p","preview-muted","Рекорды появятся после записи тренировок"));
 };
 if(!id){clear();return}
 const catalog=ctx.data.exerciseCatalog.find(e=>String(e.id)===String(id));
 const bodyweight=!!catalog?.bodyweight;
 const from=range==="all"?"0000-00-00":cutoff(Number(range));
 const rows=ctx.getEntriesForExercise(id).filter(e=>e.date>=from).map(e=>({date:e.date,savedAt:e.savedAt||0,val:metrics(e,bodyweight)}));
 if(!rows.length){clear();return}
 const good=k=>rows.filter(x=>x.val[k]!==null);
 const weights=good("weight"),last=rows.at(-1),lastWeight=weights.at(-1),previousWeight=weights.at(-2);
 setText("metricWeight",lastWeight?format(lastWeight.val.weight,"weight"):"—");
 setText("metricE1rm",format(last.val.e1rm,"e1rm"));
 setText("metricVolume",format(last.val.volume,"volume"));
 setText("metricBest",weights.length?format(Math.max(...weights.map(x=>x.val.weight)),"weight"):"—");
 setText("metricWeightDelta",previousWeight&&lastWeight?delta(lastWeight.val.weight,previousWeight.val.weight,"weight"):"Первая запись за период");
 const series=k=>good(k).slice(-12).map(x=>({label:ctx.dateFmt(x.date).replace(/\s+\d{4}$/,""),value:x.val[k]}));
 ctx.drawChart(el("weightChart"),series(m),unit(m).trim());
 ctx.drawChart(el("repsChart"),series("reps"),"повт.");
 renderCompare(rows,m,ctx.dateFmt);renderRecords(rows);
 setText("progress2Notes","Данные рассчитаны из сохранённых подходов. e1RM оценивается по формуле Эпли для 1–12 повторений и не рассчитывается для упражнений с собственным весом. Исходные результаты остаются без изменений.");
};
window.SetlogProgressV2Math={metrics,cutoff,delta};
})();
