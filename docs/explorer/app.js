const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const num=(x,d=2,suf="")=>x==null?"—":(x.toFixed(d)+suf);
const pct=(x,d=1)=>x==null?"—":((x>0?"+":"")+x.toFixed(d)+"%");
const pctRaw=(x,d=0)=>x==null?"—":(x*100).toFixed(d)+"%";
const colNum=x=>x==null?"var(--muted)":(x>0?"var(--good)":(x<0?"var(--bad)":"var(--text)"));
function invClass(s){return s==null?"":(s>=70?"good":(s>=60?"warn":(s>=45?"":"bad")));}
// watchlist in localStorage
const WL_KEY="se_watchlist";
function wlGet(){try{return JSON.parse(localStorage.getItem(WL_KEY)||"[]");}catch(e){return [];}}
function wlHas(id){return wlGet().includes(id);}
function wlToggle(id){let w=wlGet();w=w.includes(id)?w.filter(x=>x!==id):[...w,id];localStorage.setItem(WL_KEY,JSON.stringify(w));return w.includes(id);}
function tickerHref(a,t){return `ticker.html?a=${encodeURIComponent(a)}&t=${encodeURIComponent(t)}`;}
// generic sortable+filterable table
function makeTable(tbodySel, getRows, renderRow, opts={}){
  let sortKey=opts.sortKey, sortDir=opts.sortDir||-1, filter="", extra=null;
  function apply(){
    let list=getRows().filter(r=>!filter|| (opts.searchText?opts.searchText(r):JSON.stringify(r)).toLowerCase().includes(filter));
    if(extra) list=list.filter(extra);
    if(sortKey) list=list.slice().sort((a,b)=>{
      let x=opts.val?opts.val(a,sortKey):a[sortKey], y=opts.val?opts.val(b,sortKey):b[sortKey];
      const n=(typeof x==="number")||(typeof y==="number");
      if(x==null)x=n?-Infinity:"";if(y==null)y=n?-Infinity:"";
      return typeof x==="string"?sortDir*x.localeCompare(y):sortDir*(x-y);
    });
    const tb=$(tbodySel);tb.innerHTML="";
    list.forEach(r=>tb.appendChild(renderRow(r)));
    if(opts.onCount)opts.onCount(list.length);
    return list;
  }
  if(opts.searchSel)$(opts.searchSel).addEventListener("input",e=>{filter=e.target.value.trim().toLowerCase();apply();});
  if(opts.tableSel)$(opts.tableSel).addEventListener("click",e=>{
    const th=e.target.closest("th[data-sort]");if(!th)return;
    const k=th.dataset.sort;if(k===sortKey)sortDir=-sortDir;else{sortKey=k;sortDir=opts.strCols&&opts.strCols.includes(k)?1:-1;}
    apply();
  });
  apply.setExtra=f=>{extra=f;apply();};
  apply();
  return apply;
}
