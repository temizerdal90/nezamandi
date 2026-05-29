
const MONTH_NAMES = ["","Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

function getParamsDate(){
  const params=new URLSearchParams(window.location.search);
  const now=new Date();
  const m=params.get("m") || String(now.getMonth()+1).padStart(2,"0");
  const d=params.get("d") || String(now.getDate()).padStart(2,"0");
  return {m:String(m).padStart(2,"0"), d:String(d).padStart(2,"0")};
}
async function fetchOnThisDay(month, day){
  const res=await fetch(`https://tr.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`);
  if(!res.ok) throw new Error("Veri alınamadı");
  return await res.json();
}
function itemText(x){return (x.year?`<strong>${x.year}</strong> — `:"")+(x.text||"");}
function listFromData(data){
  const groups=[
    ["Olaylar", [...(data.selected||[]),...(data.events||[])]],
    ["Doğumlar", data.births || []],
    ["Vefatlar", data.deaths || []]
  ];
  let html="";
  groups.forEach(([title, arr])=>{
    const items=(arr||[]).slice(0,6).map(itemText).filter(Boolean);
    if(items.length){
      html+=`<div class="today-bubble">${title}<small>${items.length}</small></div>`;
      items.forEach(t=>{html+=`<div class="today-event">${t}</div>`;});
    }
  });
  return html || `<div class="today-event">Bu tarih için bilgi alınamadı.</div>`;
}
async function renderTarihteBugun(){
  const box=document.getElementById("tarihteBugunBox");
  if(!box)return;
  const now=new Date();
  const month=String(now.getMonth()+1).padStart(2,"0");
  const day=String(now.getDate()).padStart(2,"0");
  const label=now.toLocaleDateString("tr-TR",{day:"numeric",month:"long"});
  try{
    const data=await fetchOnThisDay(month, day);
    const events=listFromData(data);
    box.innerHTML=`<div class="today-head"><span class="tag">Bugün: ${label}</span><h2>Tarihte Bugün</h2><p>Geçmiş yıllarda bugünün tarihinde yaşanan olaylar.</p><div class="today-bubbles"><a class="today-bubble" href="tarihte-bugun.html">Tarihte Bugün</a><a class="today-bubble" href="tarihte-bugun-gun.html?m=${month}&d=${day}">Bugünün sayfası</a></div></div><div class="today-event-list">${events}</div>`;
  }catch(e){
    box.innerHTML=`<div class="today-head"><span class="tag">Bugün</span><h2>Tarihte Bugün</h2><p>Veri şu anda alınamadı.</p><div class="today-bubbles"><a class="today-bubble" href="tarihte-bugun.html">Tarihte Bugün</a></div></div>`;
  }
}
async function renderArchiveDay(){
  const target=document.getElementById("todayArchiveEvents");
  if(!target)return;
  const {m,d}=getParamsDate();
  const monthName=MONTH_NAMES[parseInt(m,10)] || "";
  const label=`${parseInt(d,10)} ${monthName}`;
  const title=document.getElementById("dynamicTodayTitle");
  const short=document.getElementById("dynamicTodayShort");
  const detailTitle=document.getElementById("dynamicTodayDetailTitle");
  if(title)title.textContent=`${label} Tarihte Bugün`;
  if(short)short.innerHTML=`<strong>${label}</strong> tarihinde geçmiş yıllarda yaşanan olaylar, doğumlar ve vefatlar bu sayfada gösterilir.`;
  if(detailTitle)detailTitle.textContent=`${label} tarihinde neler oldu?`;
  try{
    const data=await fetchOnThisDay(m, d);
    target.innerHTML=listFromData(data);
  }catch(e){
    target.innerHTML=`<div class="today-event">Bu gün için veri şu anda alınamadı.</div>`;
  }
}
document.addEventListener("DOMContentLoaded",()=>{renderTarihteBugun();renderArchiveDay();});
