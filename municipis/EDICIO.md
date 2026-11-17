# Manteniment del portal municipal

## Publicació i contingut

El web continua allotjat a GitHub Pages. La portada conserva el seu contingut,
estructura, idiomes i sopa de lletres. Només s'hi afegeixen dos accessos al peu.

Les pàgines interiors són `municipis/index.html`, `fitxa.html?municipi=barcelona`
i `participa.html`. Leaflet 1.9.4 està inclòs localment amb la seva llicència.
El fons del mapa és d'OpenStreetMap; si no carrega, la llista continua disponible.

## Aportacions, incidències i voluntariat

La primera versió utilitza el canal privat existent del Sindicat:
https://wa.me/message/YTVZVM6U35NHD1

El formulari valida les dades i prepara un text. La persona el copia, obre la
conversa de WhatsApp, l'enganxa i l'envia. El web NO registra ni envia el text,
NO crea una base de dades i NO confirma una recepció que no es pot verificar.
No s'afegeix text al short link de WhatsApp perquè no se'n pressuposa el suport.
El número de la persona és visible al Sindicat si envia la comunicació.

Cal que l'equip acordi qui atén aquest canal, la periodicitat de revisió i la
conservació de les comunicacions. No s'han de copiar dades personals a GitHub.
Si es volen formularis amb recepció web, identificador de seguiment i recomptes
automàtics, cal un servei privat de recepció i moderació. GitHub Pages no executa
un servidor. No substituïu aquest servei per issues públics ni per localStorage.

## Dates, estat i fonts

Editar `data.js`. `reviewed` és la data real de contrast de la informació,
no la data de construcció del web ni la data de l'última aportació rebuda.
`countsReviewed` correspon només als recomptes. Format: `AAAA-MM-DD`.

`status: 'pending'`, `sdf: 'pending'` i dates `null` per a municipis encara
no verificats. No inferir que no hi ha via sense domicili fix perquè no s'ha
localitzat informació. No convertir una negativa comunicada en fet verificat.

Per afegir un municipi, posar id únic, nom, comarca i coordenades aproximades
del nucli urbà. No posar cap domicili particular ni ubicació de persones.
El formulari admet qualsevol municipi encara que no sigui al directori.

Barcelona: resum basat en la guia aportada per l'usuari, amb contrast de l'alta
oficial i de la guia visual municipal el 17/11/2026. Els requisits poden canviar.
Les fonts estan a `barcelonaSources` de `data.js`; els continguts, a `fitxa.js`.
Una nova fitxa contrastada necessita també el seu contingut i fonts específiques:
no n'hi ha prou amb canviar-ne l'etiqueta. Les altres fitxes no s'han verificat.

## Recomptes públics

Inicialment són `null` i es mostren amb `—`, mai amb un zero inventat.
`incidents`: nombre de comunicacions úniques revisades dins del registre
mantingut per l'equip, sense duplicats. No és una estadística de tot el municipi.
`volunteers`: persones úniques confirmades que continuen disponibles al municipi;
demanar confirmació abans de comptar-les i descomptar-les si retiren l'oferta.
No publicar noms, números ni ubicacions. Si no es pot disposar de seguiment fiable,
mantenir els valors `null`.

Després de revisar el registre privat, actualitzar les dues xifres públiques i
`countsReviewed` juntes. Les aportacions NO incrementen els recomptes automàticament.
La informació rebuda queda pendent de contrast abans de publicar-la.

## Comprovacions

`npm test` comprova cerca, estats, dates, absència de recomptes inventats,
resums privats i invariants de la portada. Revisar també en navegador: cerca,
filtres, mapa, fitxa, tres formularis, validació i còpia del resum. No enviar
missatges de prova a WhatsApp. Verificar en mòbil i amb teclat.
