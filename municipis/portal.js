import {municipalities,filterMunicipalities,formatDate,countLabel,sdfLabel} from './data.js';
import {decorateArrows} from './icons.js';
const list=document.querySelector('#municipality-list');
const search=document.querySelector('#municipi-search');
const filter=document.querySelector('#municipi-filter');
const params=new URLSearchParams(location.search);
search.value=params.get('q')||'';
if([...filter.options].some(o=>o.value===params.get('estat')))filter.value=params.get('estat');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const detailLink=m=>'fitxa.html?municipi='+encodeURIComponent(m.id);
let map,markers,tileFailures=0;
function render(){
  const matches=filterMunicipalities(municipalities,search.value,filter.value);
  document.querySelector('#result-count').textContent=matches.length+' '+(matches.length===1?'municipi trobat':'municipis trobats')+' · També pots aportar informació d’un altre municipi.';
  list.innerHTML=matches.length?matches.map(m=>`<article class="municipality-card"><div class="card-top"><div><h2><a href="${detailLink(m)}">${escape(m.name)}</a></h2><span class="tag ${m.status==='reviewed'?'verified':''}">${m.status==='reviewed'?'Informació contrastada':'Fitxa per completar'}</span></div><a class="arrow" href="${detailLink(m)}" aria-label="Consulta la fitxa de ${escape(m.name)}">↗</a></div><p class="card-meta"><b>Sense domicili fix:</b> ${sdfLabel(m.sdf)}<br><b>Informació revisada:</b> ${formatDate(m.reviewed)}</p><div class="counts"><div><strong>${countLabel(m.incidents)}</strong><span>incidències revisades</span></div><div><strong>${countLabel(m.volunteers)}</strong><span>voluntàries confirmades</span></div></div><p class="small">Recomptes: ${formatDate(m.countsReviewed).toLocaleLowerCase('ca')}. — No vol dir zero.</p><div class="card-actions"><a href="${detailLink(m)}">Consulta la fitxa ↗</a><a href="participa.html?tipus=informacio&municipi=${encodeURIComponent(m.id)}">Aporta informació ↗</a></div></article>`).join(''):'<div class="empty-state"><h2>Encara no hi ha cap fitxa amb aquests filtres.</h2><p>Prova un altre nom o comparteix informació del teu municipi.</p><a class="text-link" href="participa.html?tipus=informacio">Aporta informació ↗</a></div>';
  if(map){
    markers.clearLayers();
    matches.forEach(m=>{
      const marker=L.marker([m.lat,m.lng],{title:m.name,alt:m.name,icon:L.divIcon({className:'map-pin '+(m.status==='reviewed'?'reviewed':''),html:'<span></span>',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(markers);
      const popup=document.createElement('div');
      const title=document.createElement('strong');title.textContent=m.name;
      const text=document.createElement('p');text.textContent=m.status==='reviewed'?'Informació revisada: '+formatDate(m.reviewed):'Informació pendent de contrastar';
      const link=document.createElement('a');link.href=detailLink(m);link.textContent='Consulta la fitxa ↗';
      popup.append(title,text,link);marker.bindPopup(popup);
    });
    if(matches.length===1)map.setView([matches[0].lat,matches[0].lng],11);
    else if(matches.length)map.fitBounds(matches.map(m=>[m.lat,m.lng]),{padding:[32,32],maxZoom:10});
  }
  const query=new URLSearchParams();if(search.value)query.set('q',search.value);if(filter.value!=='all')query.set('estat',filter.value);
  history.replaceState(null,'',location.pathname+(query.size?'?'+query:'')+location.hash);
  decorateArrows();
}
function initMap(){
  if(!window.L){document.querySelector('#municipi-map').innerHTML='<p class="map-placeholder">El mapa no està disponible. La llista conté les mateixes fitxes i permet consultar tots els municipis.</p>';return;}
  document.querySelector('#municipi-map').replaceChildren();
  map=L.map('municipi-map',{scrollWheelZoom:false}).setView([41.7,1.9],8);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'}).addTo(map).on('tileerror',()=>{if(++tileFailures>=3)document.querySelector('#map-note').textContent='El fons cartogràfic no s’ha pogut carregar. Pots seguir consultant els punts o utilitzar la llista de municipis.';});
  markers=L.layerGroup().addTo(map);
  const reset=document.querySelector('#reset-map');reset.hidden=false;reset.addEventListener('click',()=>{search.value='';filter.value='all';render();});
}
document.querySelector('#total-municipis').textContent=municipalities.length;
document.querySelector('#total-revisats').textContent=municipalities.filter(m=>m.status==='reviewed').length;
document.querySelector('#filters').addEventListener('submit',e=>e.preventDefault());
search.addEventListener('input',render);filter.addEventListener('change',render);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{initMap();render();},{once:true});else{initMap();render();}
