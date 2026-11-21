import {municipalities,filterMunicipalities,scopeMunicipalities,formatDate,countLabel,sdfLabel,statusLabel} from './data.js?v=20261121';
const list=document.querySelector('#municipality-list');
const search=document.querySelector('#municipi-search');
const filter=document.querySelector('#municipi-filter');
const scope=document.querySelector('#province-filter');
const more=document.querySelector('#show-more');
const params=new URLSearchParams(location.search);
search.value=params.get('q')||'';
if([...filter.options].some(o=>o.value===params.get('estat')))filter.value=params.get('estat');
if([...scope.options].some(o=>o.value===params.get('ambit')))scope.value=params.get('ambit');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const detailLink=m=>'fitxa.html?municipi='+encodeURIComponent(m.id);
let map,markers,tileFailures=0,pageSize=24,matches=[];
function card(m){
 return `<article class="municipality-card"><div class="card-top"><div><h2><a href="${detailLink(m)}">${escape(m.name)}</a></h2><span class="tag ${m.status==='reviewed'?'verified':m.status}">${statusLabel(m.status)}</span></div></div><p class="card-meta"><b>Sense domicili fix:</b> ${sdfLabel(m.sdf)}<br><b>Tràmit revisat:</b> ${formatDate(m.reviewed)}${m.directoryReviewed?'<br><b>Contactes del directori:</b> '+formatDate(m.directoryReviewed):''}</p><div class="counts"><div><strong>${countLabel(m.incidents)}</strong><span>incidències revisades</span></div><div><strong>${countLabel(m.volunteers)}</strong><span>voluntàries confirmades</span></div></div><p class="small">Recomptes: ${formatDate(m.countsReviewed).toLocaleLowerCase('ca')}. — No vol dir zero.</p><div class="card-actions"><a href="${detailLink(m)}">Consulta la fitxa</a><a href="participa.html?tipus=informacio&municipi=${encodeURIComponent(m.id)}">Aporta informació</a></div></article>`;
}
function renderCards(){
 list.innerHTML=matches.length?matches.slice(0,pageSize).map(card).join(''):'<div class="empty-state"><h2>No hi ha resultats amb aquests filtres.</h2><p>Prova un altre nom, comarca o àmbit. Pots aportar informació de qualsevol municipi.</p><a class="text-link" href="participa.html?tipus=informacio">Aporta informació</a></div>';
 more.hidden=matches.length<=pageSize;
 document.querySelector('#page-status').textContent=matches.length?'Mostrant '+Math.min(pageSize,matches.length)+' de '+matches.length+' municipis.':'';
}
function render(){
 pageSize=24;
 matches=filterMunicipalities(scopeMunicipalities(municipalities,scope.value),search.value,filter.value).sort((a,b)=>(a.status==='reviewed'?0:1)-(b.status==='reviewed'?0:1)||a.name.localeCompare(b.name,'ca'));
 document.querySelector('#result-count').textContent=matches.length+' '+(matches.length===1?'municipi trobat':'municipis trobats')+' · El mapa inclou tots els resultats; la llista es mostra per blocs.';
 renderCards();
 if(map){
  markers.clearLayers();
  matches.forEach(m=>{
   if(!Number.isFinite(m.lat)||!Number.isFinite(m.lng))return;
   const marker=L.marker([m.lat,m.lng],{title:m.name,alt:m.name,icon:L.divIcon({className:'map-pin '+(m.status==='reviewed'?'reviewed':''),html:'<span></span>',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(markers);
   const popup=document.createElement('div');
   const title=document.createElement('strong');title.textContent=m.name;
   const text=document.createElement('p');text.textContent=statusLabel(m.status)+(m.reviewed?' · '+formatDate(m.reviewed):'');
   const link=document.createElement('a');link.href=detailLink(m);link.textContent='Consulta la fitxa';
   popup.append(title,text,link);marker.bindPopup(popup);
  });
  if(matches.length===1)map.setView([matches[0].lat,matches[0].lng],11);
  else if(matches.length)map.fitBounds(matches.map(m=>[m.lat,m.lng]),{padding:[32,32],maxZoom:10});
 }
 const query=new URLSearchParams();if(search.value)query.set('q',search.value);if(filter.value!=='all')query.set('estat',filter.value);if(scope.value!=='barcelona')query.set('ambit',scope.value);
 history.replaceState(null,'',location.pathname+(query.size?'?'+query:'')+location.hash);
}
function initMap(){
 if(!window.L){document.querySelector('#municipi-map').innerHTML='<p class="map-placeholder">El mapa no està disponible. La llista permet consultar tots els municipis.</p>';return;}
 document.querySelector('#municipi-map').replaceChildren();
 map=L.map('municipi-map',{scrollWheelZoom:false}).setView([41.7,1.9],8);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'}).addTo(map).on('tileerror',()=>{if(++tileFailures>=3)document.querySelector('#map-note').textContent='El fons cartogràfic no s’ha pogut carregar. Pots consultar els punts o utilitzar la llista.';});
 markers=L.layerGroup().addTo(map);
 const reset=document.querySelector('#reset-map');reset.hidden=false;reset.addEventListener('click',()=>{search.value='';filter.value='all';scope.value='barcelona';render();});
}
const provincial=scopeMunicipalities(municipalities);
document.querySelector('#total-municipis').textContent=provincial.length;
document.querySelector('#total-revisats').textContent=provincial.filter(m=>m.status==='reviewed').length;
document.querySelector('#total-pendents').textContent=provincial.filter(m=>m.status!=='reviewed').length;
document.querySelector('#filters').addEventListener('submit',e=>e.preventDefault());
search.addEventListener('input',render);filter.addEventListener('change',render);scope.addEventListener('change',render);
more.addEventListener('click',()=>{pageSize+=24;renderCards();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{initMap();render();},{once:true});else{initMap();render();}
