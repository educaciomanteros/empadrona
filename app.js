const keys=["label", "title", "intro", "contact", "visit"];
const texts={"ca": ["ESTAR EMPADRONAT ÉS", "un pas clau<br>per accedir<br>a <em>drets<span class=\"title-dot\" aria-hidden=\"true\"></span><span class=\"sr-only\">.</span></em>", "Per a moltes persones migrants, és un pas clau per accedir a serveis bàsics i avançar en els tràmits de regularització.", "CONTACTA’NS PER WHATSAPP", "O passa a veure’ns a:"], "es": ["ESTAR EMPADRONADO ES", "un paso clave<br>para acceder<br>a <em>derechos<span class=\"title-dot\" aria-hidden=\"true\"></span><span class=\"sr-only\">.</span></em>", "Para muchas personas migrantes, es un paso clave para acceder a servicios básicos y avanzar en los trámites de regularización.", "CONTÁCTANOS POR WHATSAPP", "O ven a vernos a:"], "fr": ["ÊTRE INSCRIT AU PADRÓN, C’EST", "une étape clé<br>pour accéder<br>aux <em>droits<span class=\"title-dot\" aria-hidden=\"true\"></span><span class=\"sr-only\">.</span></em>", "Pour de nombreuses personnes migrantes, c’est une étape clé pour accéder aux services essentiels et avancer dans les démarches de régularisation.", "CONTACTEZ-NOUS SUR WHATSAPP", "Ou venez nous voir au :"], "en": ["BEING REGISTERED MEANS", "a key step<br>towards<br><em>rights<span class=\"title-dot\" aria-hidden=\"true\"></span><span class=\"sr-only\">.</span></em>", "For many migrants, it is a key step towards accessing basic services and progressing with immigration regularisation procedures.", "CONTACT US ON WHATSAPP", "Or come and visit us at:"]};
function setLanguage(lang){if(!texts[lang])lang='ca';keys.forEach((k,i)=>document.querySelector(`[data-t="${k}"]`).innerHTML=texts[lang][i]);document.documentElement.lang=lang;document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));document.title='Empadrona — '+texts[lang][1].replace(/<br>/g,' ').replace(/<[^>]+>/g,'');try{localStorage.setItem('padro-language',lang)}catch{}}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));try{setLanguage(localStorage.getItem('padro-language')||'ca')}catch{setLanguage('ca')}


// Fixed, reproducible word search: three campaign words, three directions.
const puzzleRows=Array.from({length:12},(_,r)=>Array.from({length:12},(_,c)=>'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[(r*17+c*7+r*c*3)%26]));
const campaignWords=[{"word": "EMPADRONA", "r": 1, "c": 1, "dr": 0, "dc": 1}, {"word": "SALUT", "r": 3, "c": 2, "dr": 0, "dc": 1}, {"word": "EDUCACIO", "r": 5, "c": 1, "dr": 0, "dc": 1}, {"word": "HABITATGE", "r": 7, "c": 2, "dr": 0, "dc": 1}, {"word": "AJUTS", "r": 9, "c": 1, "dr": 0, "dc": 1}, {"word": "SERVEIS", "r": 11, "c": 3, "dr": 0, "dc": 1}, {"word": "DRETS", "r": 1, "c": 11, "dr": 1, "dc": 0}];
for(const {word,r,c,dr,dc} of campaignWords) [...word].forEach((letter,i)=>puzzleRows[r+dr*i][c+dc*i]=letter);
document.getElementById('letter-grid').replaceChildren(...puzzleRows.flat().map(letter=>{const cell=document.createElement('span');cell.textContent=letter;return cell}));
const pinnedWords=new Set();
const buttons=[...document.querySelectorAll('[data-highlight]')];
const cells=[...document.querySelectorAll('#letter-grid span')];
function paintWord(word,active){
 document.querySelector(`[data-word="${word}"]`).classList.toggle('is-hidden',!active);
 const button=buttons.find(button=>button.dataset.highlight===word);
 button.classList.toggle('is-active',active);
 button.setAttribute('aria-pressed',String(pinnedWords.has(word)));
}
function restoreWord(word){paintWord(word,pinnedWords.has(word))}
buttons.forEach(button=>{
 const word=button.dataset.highlight;
 paintWord(word,false);
 button.addEventListener('mouseenter',()=>paintWord(word,true));
 button.addEventListener('mouseleave',()=>paintWord(word,pinnedWords.has(word)||document.activeElement===button));
 button.addEventListener('focus',()=>paintWord(word,true));
 button.addEventListener('blur',()=>restoreWord(word));
 button.addEventListener('click',()=>{if(pinnedWords.has(word))pinnedWords.delete(word);else pinnedWords.add(word);restoreWord(word)});
});
for(const {word,r,c,dr,dc} of campaignWords){
 for(let i=0;i<word.length;i++){
  const cell=cells[(r+dr*i)*12+c+dc*i];
  cell.classList.add('word-cell');
  cell.addEventListener('mouseenter',()=>paintWord(word,true));
  cell.addEventListener('mouseleave',()=>restoreWord(word));
  cell.addEventListener('click',()=>{if(pinnedWords.has(word))pinnedWords.delete(word);else pinnedWords.add(word);restoreWord(word)});
 }
}
function translatePuzzle(){const lang=document.documentElement.lang;document.querySelector('.word-controls').setAttribute('aria-label',({ca:'Paraules destacades',es:'Palabras destacadas',fr:'Mots mis en évidence',en:'Highlighted words'})[lang]);document.querySelector('.wordsearch').setAttribute('aria-label',({ca:'Sopa de lletres',es:'Sopa de letras',fr:'Mots mêlés',en:'Word search'})[lang])}
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',translatePuzzle));translatePuzzle();
