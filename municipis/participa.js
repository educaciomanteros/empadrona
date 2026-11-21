import {municipalities,makeMessage} from './data.js?v=20261121';
import {decorateArrows} from './icons.js';
const params=new URLSearchParams(location.search);
const type=['informacio','incidencia','voluntariat'].includes(params.get('tipus'))?params.get('tipus'):'informacio';
const headings={informacio:'Comparteix<br><span class="red">el que saps.</span>',incidencia:'El padró és un dret.<br><span class="red">Explica els obstacles.</span>',voluntariat:'Al teu municipi,<br><span class="red">el teu suport compta.</span>'};
const intros={informacio:'Explica com es fa el padró al teu municipi. Les fonts i la teva experiència ens ajuden a completar les fitxes.',incidencia:'Explica què ha passat, en quin municipi i quan. Prepararem un resum perquè el puguis enviar al Sindicat.',voluntariat:'Ofereix temps per acompanyar, traduir o contrastar informació. L’equip valorarà com coordinar el suport.'};
document.querySelector('#form-heading').innerHTML=headings[type];
document.querySelector('#form-intro').textContent=intros[type];
document.title=({informacio:'Aporta informació',incidencia:'Comunica una incidència',voluntariat:'Ofereix suport'})[type]+' — Empadrona';
decorateArrows();
const municipality=municipalities.find(m=>m.id===params.get('municipi'));
const cityInput=document.querySelector('#municipi');
if(municipality)cityInput.value=municipality.name;
document.querySelector('#municipality-options').replaceChildren(...municipalities.map(m=>{const o=document.createElement('option');o.value=m.name;return o;}));
document.querySelectorAll('[data-type]').forEach(a=>{if(a.dataset.type===type)a.setAttribute('aria-current','page');if(municipality)a.href+='&municipi='+encodeURIComponent(municipality.id);});
document.querySelectorAll('[data-show]').forEach(section=>{section.hidden=!section.dataset.show.split(' ').includes(type);section.querySelectorAll('input,select,textarea').forEach(input=>input.disabled=section.hidden);});
const now=new Date();const localDay=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
document.querySelector('#data').max=localDay;
const form=document.querySelector('#contribution-form');
const result=document.querySelector('#message-result');
const preview=document.querySelector('#message-preview');
const copyStatus=document.querySelector('#copy-status');
// No tracking, backend requests, URL-embedded personal data or persistent drafts.
form.addEventListener('submit',event=>{
  event.preventDefault();
  const values=Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,String(value).trim()]));
  if(!values.municipi||!values.explicacio||values.explicacio.length<10){document.querySelector('#explicacio').setCustomValidity('Escriu una explicació de com a mínim 10 caràcters.');form.reportValidity();return;}
  preview.value=makeMessage(type,values);copyStatus.textContent='';result.hidden=false;result.focus();
});
document.querySelector('#explicacio').addEventListener('input',event=>event.target.setCustomValidity(''));
form.addEventListener('input',()=>{result.hidden=true;preview.value='';copyStatus.textContent='';});
document.querySelector('#copy-message').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(preview.value);copyStatus.textContent='Missatge copiat. Ara obre WhatsApp, enganxa’l i envia’l.';}
  catch{preview.focus();preview.select();copyStatus.textContent='Selecciona i copia el text manualment. Després enganxa’l a WhatsApp.';}
});
