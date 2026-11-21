"""Generate website data from the public, source-backed research snapshot.

Edit municipis/recerca.json after reviewing official sources, then run:
python3 scripts/compile-municipal-research.py
No network, private messages or untracked checkpoints are required.
"""
import json,re
from pathlib import Path
from urllib.parse import urlsplit,parse_qsl
from collections import Counter
ROOT=Path(__file__).resolve().parent.parent
snapshot=json.loads((ROOT/'municipis/recerca.json').read_text())
rows=snapshot['municipalities']
assert len(rows)==311 and len({m['ine'] for m in rows})==311
fields=['checked','status','procedureUrl','summary','channels','documents','sdf','sdfNote','sources','reason','needsClarification','sourceUpdated']
directory=[];procedures={}
for m in rows:
    assert re.fullmatch(r'08[0-9]{3}',m['ine'])
    assert m['status'] in ('reviewed','located','pending')
    assert m['sdf'] in ('yes','pending','conflict')
    assert re.fullmatch(r'\d{4}-\d{2}-\d{2}',m['checked'])
    if m['status']=='reviewed':assert m['procedureUrl'] and m['sources']
    for url in [m.get('procedureUrl')]+[s['url'] for s in m['sources']]:
        if not url:continue
        u=urlsplit(url);assert u.scheme in ('http','https') and u.netloc
        assert not any(k.lower() in ('p_auth','jsessionid','sessionid') for k,v in parse_qsl(u.query))
    procedures[m['ine']]={k:m[k] for k in fields if k in m}
    directory.append({'id':m['id'],'ine':m['ine'],'name':m['name'].replace("'",'’'),'area':m['comarca'],'province':'Barcelona','lat':m['lat'],'lng':m['lng'],'website':m['website'],'phone':m['phone'],'officeAddress':m['officeAddress'],'directoryReviewed':m['directoryConsulted']})
directory.sort(key=lambda m:m['name'].casefold())
(ROOT/'municipis/directory.js').write_text('// Font: Diputació de Barcelona, Municipis. CC BY 4.0. Vegeu dates a recerca.json.\nexport const directory = '+json.dumps(directory,ensure_ascii=False,indent=2)+';\n')
(ROOT/'municipis/procedures.js').write_text('// Recerca de fonts públiques. Revisió del tràmit no equival a validació jurídica.\nexport const procedures = '+json.dumps(dict(sorted(procedures.items())),ensure_ascii=False,indent=2)+';\n')
counts=dict(Counter(m['status'] for m in rows));snapshot['metadata']['counts']=counts
(ROOT/'municipis/recerca.json').write_text(json.dumps(snapshot,ensure_ascii=False,indent=2)+'\n')
print(len(rows),'municipis:',counts)
