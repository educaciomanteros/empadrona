// Vector arrows stay legible even when the device font lacks the ↗ glyph.
export function decorateArrows(root=document){
  root.querySelectorAll('a,button').forEach(control=>{
    const walker=document.createTreeWalker(control,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())if(walker.currentNode.textContent.includes('↗'))nodes.push(walker.currentNode);
    for(const node of nodes){
      const fragment=document.createDocumentFragment();
      node.textContent.split('↗').forEach((text,i)=>{
        if(i){
          const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
          svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','link-arrow');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
          const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M5 19 19 5M5 5h14v14');svg.append(path);fragment.append(svg);
        }
        fragment.append(document.createTextNode(text));
      });node.replaceWith(fragment);
    }
  });
}
