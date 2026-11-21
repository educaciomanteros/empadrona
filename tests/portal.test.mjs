import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {municipalities,filterMunicipalities,countLabel,formatDate,makeMessage,WHATSAPP,scopeMunicipalities} from '../municipis/data.js';
test('Search handles accents, apostrophes, counties and verification filters',()=>{
  assert.equal(filterMunicipalities(municipalities,'mataro')[0].id,'mataro');
  assert.equal(filterMunicipalities(municipalities,"l'hospitalet")[0].id,'hospitalet');
  assert.equal(filterMunicipalities(municipalities,'Barcelones').length,5);
  assert.ok(filterMunicipalities(municipalities,'','sdf').every(m=>m.sdf==='yes'));
  assert.equal(scopeMunicipalities(municipalities).length,311);
  assert.equal(new Set(scopeMunicipalities(municipalities).map(m=>m.ine)).size,311);
  assert.ok(filterMunicipalities(municipalities,'','pending').every(m=>m.status!=='reviewed'));
  assert.equal(filterMunicipalities(municipalities,'<script>')[0],undefined);
});
test('Unknown counts and unknown revision dates are never presented as zero or current',()=>{
  assert.equal(countLabel(null),'—');assert.equal(countLabel(0),'0');
  assert.equal(formatDate(null),'Pendent de revisió');assert.equal(formatDate('2026-11-17'),'17/11/2026');
  for(const m of municipalities){
    assert.equal(m.incidents,null);assert.equal(m.volunteers,null);assert.equal(m.countsReviewed,null);
    if(m.status!=='reviewed')assert.equal(m.reviewed,null);
    if(m.status==='reviewed'){assert.ok(m.sources?.length);assert.match(m.reviewed,/^2026-11-/);}
    for(const source of m.sources||[]){assert.match(source.url,/^https?:\/\//);assert.doesNotMatch(source.url,/p_auth=|jsessionid/i);}
  }
});
test('Private reports produce plain text without sending or embedding it in a public URL',()=>{
  const text=makeMessage('incidencia',{municipi:'Barcelona',explicacio:'No he aconseguit cita.',data:'2026-11-17',categoria:'No trobo cita'});
  assert.match(text,/INCIDÈNCIA DE PADRÓ/);assert.match(text,/Municipi: Barcelona/);assert.match(text,/No trobo cita/);
  assert.match(text,/no és una sol·licitud municipal ni una reclamació oficial/);
  assert.equal(WHATSAPP,'https://wa.me/message/YTVZVM6U35NHD1');
  const js=fs.readFileSync(new URL('../municipis/participa.js',import.meta.url),'utf8');
  assert.doesNotMatch(js,/\bfetch\s*\(|localStorage|sessionStorage|sendBeacon/);
});
test('Campaign main, header and existing behaviour remain unchanged',()=>{
  const previous=execFileSync('git',['show','HEAD:index.html'],{encoding:'utf8'});
  const current=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  for(const tag of ['header','main'])assert.equal(current.match(new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`))[0],previous.match(new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`))[0]);
  const oldApp=execFileSync('git',['show','HEAD:app.js'],{encoding:'utf8'});
  assert.ok(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').startsWith(oldApp));
});

test('Every provincial municipality has official directory provenance and public contact',()=>{
 for(const m of scopeMunicipalities(municipalities)){
  assert.match(m.ine,/^08[0-9]{3}$/);
  assert.match(m.website,/^https?:\/\//);
  assert.equal(m.directoryReviewed,'2026-11-21');
  assert.ok(Number.isFinite(m.lat)&&Number.isFinite(m.lng));
  assert.ok(['reviewed','located','pending'].includes(m.status));
  assert.ok(['yes','pending','conflict'].includes(m.sdf));
 }
});
