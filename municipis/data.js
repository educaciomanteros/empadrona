import {directory} from './directory.js?v=20261121';
import {procedures} from './procedures.js?v=20261121';
// Només dades públiques revisades. Mai dades personals ni relats d'incidències.
export const WHATSAPP = 'https://wa.me/message/YTVZVM6U35NHD1';
export const GENERAL_SOURCE = 'https://igualtat.gencat.cat/ca/ambits-dactuacio/drets-humans-i-igualtat-de-tracte/lempadronament/preguntes-frequents/';
export const DIRECTORY_SOURCE = 'https://do.diba.cat/api/dataset/municipis/format/json';
export const DIRECTORY_REVIEWED = '2026-11-21';
const extraMunicipalities = [
  {id:'girona',name:'Girona',area:'Gironès',province:'Girona',lat:41.9794,lng:2.8214},
  {id:'lleida',name:'Lleida',area:'Segrià',province:'Lleida',lat:41.6176,lng:0.6200},
  {id:'tarragona',name:'Tarragona',area:'Tarragonès',province:'Tarragona',lat:41.1189,lng:1.2445},
  {id:'reus',name:'Reus',area:'Baix Camp',province:'Tarragona',lat:41.1548,lng:1.1087},
  {id:'olot',name:'Olot',area:'Garrotxa',province:'Girona',lat:42.1822,lng:2.4890}
];
export const municipalities = [...directory,...extraMunicipalities].map(m=>{
 const evidence=procedures[m.ine]||{};
 return {status:'pending',sdf:'pending',reviewed:null,incidents:null,volunteers:null,countsReviewed:null,...m,...evidence,reviewed:evidence.status==='reviewed'?evidence.checked:null};
});
export function statusLabel(status){return ({reviewed:'Tràmit oficial revisat',located:'Enllaç localitzat · pendent de contrastar',pending:'Procediment pendent de revisar'})[status]||'Procediment pendent de revisar';}
export function scopeMunicipalities(list,scope='barcelona'){return list.filter(m=>scope==='all'||(scope==='barcelona'?m.province==='Barcelona':m.province!=='Barcelona'));}
export const barcelonaSources = [
  {label:'Ajuntament · Alta al padró: requisits i documentació',url:'https://seuelectronica.ajuntament.barcelona.cat/APPS/portaltramits/ca/ciudadano/descripcio/T135i/default.html'},
  {label:'Ajuntament · Guia visual: domicili acreditat, comprovació i sense domicili fix (PDF, 2024)',url:'https://media-edg.barcelona.cat/wp-content/uploads/2024/07/22140503/BCN_EMPADRONAMENT_CAT.pdf'},
  {label:'Ajuntament · Tràmits del padró i Informe de Coneixement de Residència (ICR)',url:'https://seuelectronica.ajuntament.barcelona.cat/APPS/ptbportal/citizenThemesByCat.do?catid=14'},
  {label:'Generalitat · Preguntes freqüents sobre el dret al padró',url:GENERAL_SOURCE}
];
export function normalize(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('ca').replace(/[’']/g,'').trim();}
export function filterMunicipalities(list,query='',status='all'){
  const q=normalize(query);
  return list.filter(m=>normalize(m.name+' '+m.area).includes(q)&&(status==='all'||(status==='reviewed'&&m.status==='reviewed')||(status==='sdf'&&m.sdf==='yes')||(status==='pending'&&m.status!=='reviewed')||(status==='clarify'&&(m.sdf==='conflict'||m.needsClarification))));
}
export function formatDate(value){return value?new Intl.DateTimeFormat('ca-ES',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z')):'Pendent de revisió';}
export function countLabel(value){return Number.isInteger(value)&&value>=0?String(value):'—';}
export function sdfLabel(value){return value==='yes'?'Via local identificada':value==='conflict'?'Informació municipal a aclarir':'Via local pendent de contrastar';}
export function makeMessage(type,values){
  const titles={incidencia:'INCIDÈNCIA DE PADRÓ',informacio:'APORTACIÓ SOBRE EL PADRÓ',voluntariat:'SUPORT VOLUNTARI AL PADRÓ'};
  const rows=[titles[type]||titles.informacio,'Municipi: '+values.municipi];
  if(values.data) rows.push('Data dels fets / consulta: '+values.data);
  if(values.categoria) rows.push('Tipus: '+values.categoria);
  if(values.oficina) rows.push('Oficina o servei: '+values.oficina);
  if(values.sdf) rows.push('Informació sobre padró sense domicili fix: '+values.sdf);
  if(values.font) rows.push('Font: '+values.font);
  if(values.disponibilitat) rows.push('Disponibilitat i idiomes: '+values.disponibilitat);
  rows.push('Explicació: '+values.explicacio);
  rows.push('Entenc que aquesta comunicació és privada i que no és una sol·licitud municipal ni una reclamació oficial.');
  return rows.join('\n\n');
}
