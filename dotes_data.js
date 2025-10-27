// Kepler 282C — Catálogo de Dotes (completo, texto íntegro del documento)
// Nota: Los requisitos de selección se expresan como funciones que reciben el objeto de personaje
// { nivel, raceKey, attrs:{FIS,DES,SOC,MEN}, lvlMag, lvlMal, virtTotals:{tecnica,estudio,dominio}, hasDote(id) }
(function(){
  const REQ = {
    attr: (k,min) => c => (c.attrs?.[k]||0) >= min,
    any: (...rs) => c => rs.some(r=>r(c)),
    all: (...rs) => c => rs.every(r=>r(c)),
    lvl: (min) => c => (c.nivel||1) >= min,
    lvlMag: (min) => c => (c.lvlMag||0) >= min,
    lvlMal: (min) => c => (c.lvlMal||0) >= min,
    race: (...keys) => c => keys.includes(c.raceKey),
    virtAny: (cats,min=1) => c => (cats||[]).some(cat => ((c.virtTotals?.[cat])||0) >= min)
  };

  const D = [];

  // I. Gestión del Turno y Acciones (1–10)
  D.push(
    {id:'maestro-bloques', nombre:'Maestro de Bloques I/II/III', tipo:'General, Táctico', req:REQ.lvl(1), texto:`Tipo: General, Táctico\nRequisitos: Nivel 1/4/7\nBeneficio: En un turno con 2 Ataques en el mismo Bloque, sustituyes el penalizador por −3/−2/−1 (I/II/III).\nEscala/Notas: Aumenta consistencia sin añadir acciones nuevas.`},
    {id:'prioridad-fluida', nombre:'Prioridad Fluida', tipo:'General, Iniciativa', req:REQ.any(REQ.attr('SOC',2), REQ.attr('MEN',2)), texto:`Tipo: General, Iniciativa\nRequisitos: Social 2+ o Mental 2+\nBeneficio: Puedes intercambiar tu Iniciativa con un aliado a 6 m al inicio del combate si ambos consienten.\nEscala/Notas: 1 vez por combate. No cambia estados de sorprendido.`},
    {id:'economia-precisa', nombre:'Economía Precisa', tipo:'General, Acción', req:REQ.attr('MEN',3), texto:`Tipo: General, Acción\nRequisitos: Mental 3+\nBeneficio: 1 vez por turno, conviertes una Acción Especial de coste menor en un Movimiento Resguardado adicional.\nEscala/Notas: No genera AO; no se acumula con rasgos similares.`},
    {id:'canalizacion-segura', nombre:'Canalización Segura', tipo:'General, Canalización/Interpretación', req:REQ.any(REQ.attr('MEN',3), REQ.attr('SOC',3)), texto:`Tipo: General, Canalización/Interpretación\nRequisitos: Mental 3+ o Social 3+\nBeneficio: La primera Canalización/Interpretación del turno no provoca AO. 2 veces máx. por combate.\nEscala/Notas: No afecta ataques con arma.`},
    {id:'sincronia-manada', nombre:'Sincronía de Manada', tipo:'General, Coordinación', req:REQ.attr('SOC',2), texto:`Tipo: General, Coordinación\nRequisitos: Social 2+\nBeneficio: +1 a Iniciativa para aliados a 6 m si no estás sorprendido.\nEscala/Notas: No acumulable con otra fuente idéntica.`},
    {id:'guardia-movil', nombre:'Guardia Móvil', tipo:'General, Táctico', req:REQ.attr('DES',2), texto:`Tipo: General, Táctico\nRequisitos: Destreza 2+\nBeneficio: En un Bloque puedes combinar 1 Movimiento + 1 Especial sin perder derecho a AO esa Ronda. 2 veces máx. por combate.\nEscala/Notas: No aumenta acciones totales.`},
    {id:'paso-resguardado-mejorado', nombre:'Paso Resguardado Mejorado', tipo:'General, Movimiento', req:REQ.attr('DES',2), texto:`Tipo: General, Movimiento\nRequisitos: Destreza 2+\nBeneficio: Tu Movimiento Resguardado pasa a 2 m y salir con él no concede AO.\nEscala/Notas: No apila con la misma mejora.`},
    {id:'contraataque-instintivo', nombre:'Contraataque Instintivo I/II', tipo:'General, Reacción', req:REQ.attr('FIS',2), texto:`Tipo: General, Reacción\nRequisitos: Físico 2+\nBeneficio: Ganas 1/2 AO adicionales por Ronda (I/II), cada uno contra un enemigo distinto.\nEscala/Notas: Sujetos a las demás reglas de AO.`},
    {id:'remate-coordinado', nombre:'Remate Coordinado', tipo:'General, Sinergia', req:REQ.attr('SOC',3), texto:`Tipo: General, Sinergia\nRequisitos: Social 3+\nBeneficio: Si un aliado impactó al mismo objetivo justo antes que tú, obtienes + Nivel de Personaje a tu Mod. de Ataque contra él.\nEscala/Notas: Solo 1 vez por turno.`},
    {id:'zancada-cazador', nombre:'Zancada de Cazador', tipo:'General, Movimiento', req:REQ.attr('DES',2), texto:`Tipo: General, Movimiento\nRequisitos: Destreza 2+\nBeneficio: +2 a tu Modificador de Movimiento Total.\nEscala/Notas: Afecta recorridos y persecuciones.`}
  );

  // II. Defensa y Control (11–16)
  D.push(
    {id:'fortaleza-hierro', nombre:'Fortaleza de Hierro', tipo:'Combate, Defensa', req:REQ.attr('FIS',3), texto:`Tipo: Combate, Defensa\nRequisitos: Físico 3+\nBeneficio: +2 a Fortaleza contra Derribo, Empuje y Aturdido; si superas por 5+, ignoras arrastre.\nEscala/Notas: Pensado para frontliners.`},
    {id:'esquiva-reactiva', nombre:'Esquiva Reactiva', tipo:'Combate, Defensa', req:REQ.attr('DES',3), texto:`Tipo: Combate, Defensa\nRequisitos: Destreza 3+\nBeneficio: Reacción 1/turno: +2 a Esquivar contra el primer ataque del turno dirigido a ti antes de la tirada.\nEscala/Notas: Declara antes de ver el resultado.`},
    {id:'anclaje-terrestre', nombre:'Anclaje Terrestre', tipo:'Combate, Estabilidad', req:REQ.any(REQ.attr('FIS',3), REQ.race('zwerges')), texto:`Tipo: Combate, Estabilidad\nRequisitos: Físico 3+ o Zwerg\nBeneficio: Ignoras el primer intento de Derribo por combate; a partir del segundo recibes +2 a la salvación.\nEscala/Notas: No evita daño colateral de la maniobra.`},
    {id:'guarda-alcance', nombre:'Guarda de Alcance', tipo:'Combate, Amenaza', req:REQ.any(REQ.attr('FIS',2), REQ.attr('DES',2)), texto:`Tipo: Combate, Amenaza\nRequisitos: Físico 2+ o Destreza 2+, arma con alcance\nBeneficio: Cuando un enemigo entra a tu zona de amenaza desde adyacente, puedes hacer 1 AO.\nEscala/Notas: Máx. 1 por enemigo/turno.`},
    {id:'vigilante-brecha', nombre:'Vigilante de la Brecha', tipo:'Combate, Intercepción', req:REQ.attr('DES',3), texto:`Tipo: Combate, Intercepción\nRequisitos: Destreza 3+\nBeneficio: Si una criatura enemiga se desplaza a través de una casilla adyacente, obtienes +2 a AO contra ese desplazamiento.\nEscala/Notas: No se aplica a teletransportes.`},
    {id:'reaccion-cobertura', nombre:'Reacción de Cobertura', tipo:'Combate, Defensa aliada', req:REQ.attr('SOC',2), texto:`Tipo: Combate, Defensa aliada\nRequisitos: Social 2+\nBeneficio: 1/turno: si un aliado a 3 m es atacado, le concedes cobertura parcial (+2 Defensa) hasta fin del ataque.\nEscala/Notas: Debes no estar desprevenido.`}
  );

  // III. Ofensiva C.C. y a Distancia (17–22)
  D.push(
    {id:'golpe-apertura', nombre:'Golpe de Apertura', tipo:'Combate, C.C.', req:REQ.attr('FIS',2), texto:`Tipo: Combate, C.C.\nRequisitos: Físico 2+\nBeneficio: Si superas la Defensa por 10+, además Empujas 1 m.\nEscala/Notas: Si ya empujabas, suma +1 m.`},
    {id:'filo-guiado', nombre:'Filo Guiado', tipo:'Combate, Precisión', req:REQ.attr('MEN',2), texto:`Tipo: Combate, Precisión\nRequisitos: Mental 2+\nBeneficio: 1 vez por combate, repite 1 tirada de ataque o de daño de ataque C.C. y quédate con el nuevo resultado.\nEscala/Notas: No se aplica a golpes críticos especiales fuera del sistema.`},
    {id:'tirador-estela', nombre:'Tirador de Estela', tipo:'Combate, A Distancia', req:REQ.attr('DES',3), texto:`Tipo: Combate, A Distancia\nRequisitos: Destreza 3+\nBeneficio: Si tu ataque a distancia supera por 10+, añade +1 dado a tus tiradas de daño.\nEscala/Notas: El dado extra no se duplica por críticos.`},
    {id:'recarga-instintiva', nombre:'Recarga Instintiva', tipo:'Combate, A.D.', req:REQ.attr('DES',2), texto:`Tipo: Combate, A.D.\nRequisitos: Destreza 2+\nBeneficio: Recargar un arma simple o arrojadiza te cuesta 0 acciones una vez por turno.\nEscala/Notas: No afecta armas pesadas/complex.`},
    {id:'disparo-carrera', nombre:'Disparo a la Carrera', tipo:'Combate, Kiting', req:REQ.attr('DES',4), texto:`Tipo: Combate, Kiting\nRequisitos: Destreza 4+\nBeneficio: Ganas un bloque de Movimiento después de un ataque a distancia sin provocar AO por moverte.\nEscala/Notas: No te libra de AO por disparar en melee.`},
    {id:'asalto-presion', nombre:'Asalto de Presión', tipo:'Combate, C.C.', req:REQ.attr('FIS',3), texto:`Tipo: Combate, C.C.\nRequisitos: Físico 3+\nBeneficio: Al impactar en C.C., el objetivo recibe −1 a su próximo ataque hasta el comienzo de tu siguiente turno.\nEscala/Notas: No apila consigo mismo.`}
  );

  // IV. Canalización Azul (Magia)
  D.push(
    {id:'geometra-arcano', nombre:'Geómetra Arcano', tipo:'Azul, Control de terreno', req:REQ.all(REQ.attr('MEN',3), REQ.lvlMag(1)), texto:`Tipo: Azul, Control de terreno\nRequisitos: Mental 3+, Nivel Mágico 1+\nBeneficio: +2 a la DC de Virtudes que desplacen, ralenticen o alteren terreno.\nEscala/Notas: En Nivel Mágico 5+, el bono es +4.`},
    {id:'potenciacion-azul', nombre:'Potenciación Azul I/II/III', tipo:'Azul, Ofensiva', req:REQ.lvlMag(1), texto:`Tipo: Azul, Ofensiva\nRequisitos: Nivel Mágico 1/3/5+\nBeneficio: (1-2-3)/combate, una Virtud Azul ofensiva sube un paso de dado de daño (d4→d6, etc.).\nEscala/Notas: No acumulable consigo misma.`},
    {id:'bastion-azul', nombre:'Bastión Azul', tipo:'Azul, Soporte/Defensa', req:REQ.lvlMag(2), texto:`Tipo: Azul, Soporte/Defensa\nRequisitos: Nivel Mágico 2+\nBeneficio: Al usar Virtud Azul defensiva/soporte, ganas +1/nivel mágico Resistencia hasta tu próximo turno.\nEscala/Notas: En Nivel Mágico 5+ el bono se cambia por tu nivel.`},
    {id:'foco-cristalino', nombre:'Foco Cristalino', tipo:'Azul, Concentración', req:REQ.attr('MEN',3), texto:`Tipo: Azul, Concentración\nRequisitos: Mental 3+\nBeneficio: Si mantienes una Zona/Conjuración Azul, obtienes +1/nivel mágico contra interrupciones.\nEscala/Notas: En Nivel Mágico 5+ el bono se cambia por tu nivel.`},
    {id:'ritmo-canal', nombre:'Ritmo de Canal', tipo:'Azul, Cadencia', req:REQ.attr('MEN',2), texto:`Tipo: Azul, Cadencia\nRequisitos: Mental 2+\nBeneficio: La primera vez en combate que falles una Virtud Azul, obtienes +1/nivel mágico a la siguiente tirada de Virtud Azul en este combate.\nEscala/Notas: En Nivel Mágico 5+ el bono se cambia por tu nivel.`}
  );

  // V. Canalización Roja (Maldición del Destructor)
  D.push(
    {id:'potenciacion-roja', nombre:'Potenciación Roja I/II/III', tipo:'Roja, Ofensiva/Corruptiva', req:REQ.lvlMal(1), texto:`Tipo: Roja, Ofensiva/Corruptiva\nRequisitos: Nivel Maldito 1/3/5\nBeneficio: 1/por combate, una Virtud Roja suma +1d(6-8-10)/nivel maldito.\nEscala/Notas: No altera DC ni duración.`},
    {id:'sello-desgaste', nombre:'Sello de Desgaste', tipo:'Roja, Estados', req:REQ.lvlMal(2), texto:`Tipo: Roja, Estados\nRequisitos: Nivel Maldito 2+\nBeneficio: Si el objetivo falla por 10+ la salvación contra tu estado (Entumecido, Ralentizado, etc.), dura +1 turno/nivel maldito.\nEscala/Notas: No cambia efectos inmediatos.`},
    {id:'sangre-arena', nombre:'Sangre en la Arena', tipo:'Roja, DoT', req:REQ.any(REQ.attr('MEN',3), REQ.attr('FIS',3)), texto:`Tipo: Roja, DoT\nRequisitos: Mental 3+ o Físico 3+\nBeneficio: Cuando aplicas Sangrado u otro DoT, añades +1 al dado de daño por turno (p. ej., 1d4→2d4).\nEscala/Notas: No extiende duración.`},
    {id:'crisol-ruina', nombre:'Crisol de Ruina', tipo:'Roja, Pico de poder', req:REQ.lvlMal(2), texto:`Tipo: Roja, Pico de poder\nRequisitos: Nivel Maldito 2+\nBeneficio: 1 vez por combate, trata tu Nivel Maldito como +1 para una sola Virtud en tirada/daño/DC.\nEscala/Notas: No afecta alcance/área.`},
    {id:'mueca-destructor', nombre:'Mueca del Destructor', tipo:'Roja, Intimidación', req:REQ.attr('SOC',3), texto:`Tipo: Roja, Intimidación\nRequisitos: Social 3+\nBeneficio: Una vez por combate por Nivel Maldito, tras impactar con una Virtud Roja, te puedes mover una cantidad igual a 1m/Nivel Maldito sin generar AO.\nEscala/Notas: Se pierde si no lo usas antes de acabar tu siguiente turno.`}
  );

  // VI. Interpretación y Soporte (33–37)
  D.push(
    {id:'voz-que-ancla', nombre:'Voz que Ancla', tipo:'Interpretación, Estabilidad', req:REQ.attr('SOC',3), texto:`Tipo: Interpretación, Estabilidad\nRequisitos: Social 3+\nBeneficio: Al iniciar una Interpretación, +2/+3/+4/+5/+6 Carácter hasta tu próximo turno y no provoca AO.\nEscala/Notas: No afecta Canalizaciones.`},
    {id:'coro-concordia', nombre:'Coro de Concordia', tipo:'Interpretación, Apoyo', req:REQ.all(REQ.attr('SOC',3), REQ.lvlMag(1)), texto:`Tipo: Interpretación, Apoyo\nRequisitos: Social 3+, Nivel Mágico 1+\nBeneficio: Si eliges un aliado como blanco primario de una Interpretación de soporte, otro aliado a 3 m recibe la mitad del bono (redondea hacia abajo).\nEscala/Notas: 1 vez por turno.`},
    {id:'batuta-guerra', nombre:'Batuta de Guerra', tipo:'Interpretación, Táctico', req:REQ.attr('SOC',3), texto:`Tipo: Interpretación, Táctico\nRequisitos: Social 3+\nBeneficio: Cuando ayudas (acción de Ayuda) a un aliado, el bono es +3 en vez de +2.\nEscala/Notas: No apila con otras mejoras de Ayuda.`},
    {id:'cadencia-avance', nombre:'Cadencia de Avance', tipo:'Interpretación, Movimiento', req:REQ.attr('SOC',2), texto:`Tipo: Interpretación, Movimiento\nRequisitos: Social 2+\nBeneficio: Aliados que te oigan a 6 m ganan +1 m/ Mod de Social de Movimiento ese turno si gastas 1 Acción para dirigirlos.\nEscala/Notas: No provoca AO.`},
    {id:'tono-protector', nombre:'Tono Protector', tipo:'Interpretación, Defensa', req:REQ.attr('SOC',3), texto:`Tipo: Interpretación, Defensa\nRequisitos: Social 3+\nBeneficio: Reacción 1/turno: reduce en 1 dado menor (p. ej., d6→d4) el daño de un ataque que reciba un aliado a 6 m.\nEscala/Notas: No afecta daño mínimo fijo.`}
  );

  // VII. Exploración, Técnica y Rol (38–45)
  D.push(
    {id:'trepador-ruinas', nombre:'Trepador de Ruinas', tipo:'Exploración, Movilidad', req:REQ.any(REQ.attr('FIS',2), REQ.attr('DES',2)), texto:`Tipo: Exploración, Movilidad\nRequisitos: Físico 2+ o Destreza 2+\nBeneficio: +2 a escalar/saltar/nadar; reduces 1 paso el daño por caída.\nEscala/Notas: En entornos de ruinas, obtienes ventaja narrativa para anclajes.`},
    {id:'oido-forja', nombre:'Oído de la Forja', tipo:'Exploración, Erudición', req:REQ.attr('MEN',3), texto:`Tipo: Exploración, Erudición\nRequisitos: Mental 3+\nBeneficio: +2 a Percepción/Inspección para trampas, mecanismos y huellas de energía Azul/Roja.\nEscala/Notas: Incluye resonancias antiguas.`},
    {id:'ganzua-fortuna', nombre:'Ganzúa de Fortuna', tipo:'Exploración, Cerrajería', req:REQ.attr('DES',3), texto:`Tipo: Exploración, Cerrajería\nRequisitos: Destreza 3+\nBeneficio: Al forzar/cerrar abrir cerraduras, tiras 2d y eliges el mejor resultado (una vez por intento).\nEscala/Notas: Si fallas por 1, puedes repetir pagando tiempo adicional.`},
    {id:'lenguas-mercado', nombre:'Lenguas del Mercado', tipo:'Social, Negociación', req:REQ.attr('SOC',2), texto:`Tipo: Social, Negociación\nRequisitos: Social 2+\nBeneficio: +2 a tratos, trueques y sobornos; en compras de equipo común obtienes un 5% de descuento narrativo.\nEscala/Notas: No aplica a artefactos únicos.`},
    {id:'instinto-depredador', nombre:'Instinto de Depredador', tipo:'Exploración, Sigilo/Caza', req:REQ.any(REQ.attr('DES',3), REQ.race('antropeltis')), texto:`Tipo: Exploración, Sigilo/Caza\nRequisitos: Destreza 3+ o Antropeltis\nBeneficio: +3 a rastrear y ocultarte en biomas naturales; al iniciar combate desde oculto, +1 a tu primer ataque.\nEscala/Notas: No en zonas totalmente abiertas sin cobertura.`},
    {id:'protocolo-acceso', nombre:'Protocolo de Acceso', tipo:'Técnica, Artefactos', req:REQ.any(REQ.attr('MEN',3), REQ.race('roboticos')), texto:`Tipo: Técnica, Artefactos\nRequisitos: Mental 3+ o Robótico\nBeneficio: Al intentar activar/identificar artefactos, obtienes +3 y tardas la mitad del tiempo.\nEscala/Notas: Si fallas por 5+, detectas la trampa antes de detonarla.`},
    {id:'etiqueta-corte', nombre:'Etiqueta de Corte', tipo:'Social, Intriga', req:REQ.attr('SOC',3), texto:`Tipo: Social, Intriga\nRequisitos: Social 3+\nBeneficio: Ignoras la primera penalización social por entorno hostil.\nEscala/Notas: No te protege de delitos flagrantes.`},
    {id:'ojo-debilidad', nombre:'Ojo de la Debilidad', tipo:'Táctica, Reconocimiento', req:REQ.all(REQ.attr('MEN',2), REQ.virtAny(['tecnica','estudio'],1)), texto:`Tipo: Táctica, Reconocimiento\nRequisitos: Mental 2+, Virtud afín 1+ (Técnica o Erudición)\nBeneficio: Gastas tu turno para Analizar a un enemigo a 6 m (LdV). Tira MEN + (Técnica o Erudición) vs DC de la DJ.\n• Éxito: 1 dato útil (resistencia, vulnerabilidad o rasgo clave).\n• DC +3: además +1 al Ataque contra ese objetivo hasta tu próximo turno.\n• Fallo por 3+ en C.C.: provocas AO.\nEscala/Notas: 1 vez por objetivo/encuentro. No se apila con otros “marcar/exponer”.`}
  );

  // VIII. Iniciativa y Movimiento Avanzado (46–48)
  D.push(
    {id:'reflejos-luna', nombre:'Reflejos de Luna', tipo:'General, Iniciativa', req:REQ.attr('DES',3), texto:`Tipo: General, Iniciativa\nRequisitos: Destreza 3+\nBeneficio: +2 a Iniciativa; si actúas primero, ganas +1 Esquivar por el resto del combate.\nEscala/Notas: No se acumula con Sincronía de Manada para ti.`},
    {id:'persecucion-incansable', nombre:'Persecución Incansable', tipo:'General, Movimiento', req:REQ.attr('FIS',3), texto:`Tipo: General, Movimiento\nRequisitos: Físico 3+\nBeneficio: Puedes gastar tu Reacción para ganar +2 m por nivel de movimiento contra un objetivo al que tengas línea de visión este turno.\nEscala/Notas: No provoca AO por sí mismo.`},
    {id:'repliegue-elastico', nombre:'Repliegue Elástico', tipo:'General, Reubicación', req:REQ.attr('DES',3), texto:`Tipo: General, Reubicación\nRequisitos: Destreza 3+\nBeneficio: Tras ser impactado en C.C., puedes desplazarte 1 m gratis si quedas con al menos 1 PG sin generar AO.\nEscala/Notas: No dispara AO del atacante que te impactó.`}
  );

  // IX. Sinergias Lunares Mixtas (49–50)
  D.push(
    {id:'conductor-dual', nombre:'Conductor Dual', tipo:'Azul/Roja, Pico de poder', req:REQ.all(REQ.attr('MEN',3), REQ.any(REQ.lvlMag(2), REQ.lvlMal(2))), texto:`Tipo: Azul/Roja, Pico de poder\nRequisitos: Mental 3+, Nivel Mágico o Maldito 2+\nBeneficio: 1/combate, trata tu Nivel Lunar como +1 para tirada/daño/DC de una Virtud (Azul o Roja).\nEscala/Notas: No afecta alcance/área/duración.`},
    {id:'sello-bifasico', nombre:'Sello Bifásico', tipo:'Azul/Roja, Combo', req:REQ.all(REQ.lvlMag(2), REQ.lvlMal(2)), texto:`Tipo: Azul/Roja, Combo\nRequisitos: Nivel Mágico 2+ y Nivel Maldito 2+\nBeneficio: Si usaste una Virtud Azul este turno, una Virtud Roja posterior obtiene +2 por nivel a la tirada; o viceversa.\nEscala/Notas: 1 vez por turno; elige el orden cada vez.`}
  );

  window.KEPLER_DOTES = D;
})();
