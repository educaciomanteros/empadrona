import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {municipalities,filterMunicipalities,countLabel,formatDate,makeMessage,WHATSAPP} from '../municipis/data.js';
test('Search handles accents, apostrophes, counties and verification filters',()=>{
  assert.equal(filterMunicipalities(municipalities,'mataro')[0].id,'mataro');
  assert.equal(filterMunicipalities(municipalities,"l'hospitalet")[0].id,'hospitalet');
  assert.equal(filterMunicipalities(municipalities,'Barcelones').length,4);
  assert.deepEqual(filterMunicipalities(municipalities,'','sdf').map(m=>m.id),['barcelona']);
  assert.equal(filterMunicipalities(municipalities,'','pending').length,11);
  assert.equal(filterMunicipalities(municipalities,'<script>')[0],undefined);
});
test('Unknown counts and unknown revision dates are never presented as zero or current',()=>{
  assert.equal(countLabel(null),'—');assert.equal(countLabel(0),'0');
  assert.equal(formatDate(null),'Pendent de revisió');assert.equal(formatDate('2026-11-17'),'17/11/2026');
  for(const m of municipalities){
    assert.equal(m.incidents,null);assert.equal(m.volunteers,null);assert.equal(m.countsReviewed,null);
    if(m.status==='pending'){assert.equal(m.reviewed,null);assert.equal(m.sdf,'pending');}
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
