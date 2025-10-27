// Datos de Virtudes Lunares (Nivel 1) — texto completo del material proporcionado.
window.KEPLER_VIRTUDES = {
  magicas: [
    // Físico
    { id:'carga-trueno-azul', nombre:'Carga del Trueno Azul', raiz:'FIS', formula:'Físico + Nivel Mágico + arma/foco + bonus', full:`Luna: Azul (Mágica) • Tipo: Ofensiva / Movilidad (Impacto eléctrico) • Atributo: Físico
Descripción: El usuario se lanza envuelto en electricidad azul; el suelo chisporrotea y una onda de choque vibra al impactar.
Tirada: Físico + Nivel Mágico + arma/foco + bonus
Progresión por Nivel Lunar:
• NvL1: 4d4 contundente; al fallar por 5+, Aturdido 1 turno.
• NvL2: 4d6 contundente.
• NvL3: 5d6 contundente; empuje +1 m al impactar.
• NvL4: 5d8 contundente.
• NvL5: 6d8 contundente; empuje +2 m.
Alcance / Área: Desplazamiento en línea hasta 6 m (8 m en NvL5); impacto C.C. al final.
Duración: Instantáneo.
Salvación: Fortaleza (para evitar Aturdido/mitigar empuje).
DC: 10 + Nivel + Nivel Mágico
Si supera: Mitad de daño, sin Aturdido ni empuje.
Si falla: Daño pleno; empuje según nivel; si falla por 10+, queda Aturdido 1 turno.
Tirada al inicio del turno del afectado: Si quedó Aturdido: Fortaleza al inicio de su turno para terminar.
Sinergias: Objetivo Mojado: +1 dado al daño. Terreno metálico: ventaja narrativa para la carga.` },
    { id:'puno-geotico', nombre:'Puño Geótico', raiz:'FIS', formula:'Físico + Nivel Mágico + arma/foco + bonus', full:`Luna: Azul (Mágica) • Tipo: Ofensiva / Control (Tierra) • Atributo: Físico
Descripción: Se concentra energía telúrica en su puño y, al golpear, placas de roca emergen con un crujido grave.
Tirada: Físico + Nivel Mágico + arma/foco + bonus
Progresión por Nivel Lunar:
• NvL1: 4d4 contundente; en fallo por 10+, Derribado.
• NvL2: 4d6 contundente.
• NvL3: 5d6 contundente; la onda alcanza +1 objetivo alineado detrás del principal.
• NvL4: 5d8 contundente.
• NvL5: 6d8 contundente; mini-línea se extiende 5 m.
Alcance / Área: C.C.; mini-línea de 3 m (5 m en NvL5) en la dirección del golpe.
Duración: Instantáneo.
Salvación: Fortaleza (para evitar Derribo).
DC: 10 + Nivel + Nivel Mágico
Si supera: Recibe el daño indicado pero no cae.
Si falla: Recibe daño y queda Derribado.
Sinergias: Terreno inestable o arenoso: +1 a la DC de Derribo.` },
    { id:'armadura-mareas', nombre:'Armadura de Mareas', raiz:'FIS', formula:'Físico + Nivel Mágico + foco + bonus', full:`Luna: Azul (Mágica) • Tipo: Defensiva / Soporte (Agua) • Atributo: Físico
Descripción: Una película de agua orbita el cuerpo, amortiguando golpes y apagando chispas.
Tirada: Físico + Nivel Mágico + foco + bonus
Progresión por Nivel Lunar:
• NvL1: Resistencia plana +3 y +2 a Fortaleza vs. empujes; absorbe 2d4 de daño total antes de disiparse.
• NvL2: Resistencia +4; absorbe 2d6.
• NvL3: Resistencia +5; absorbe 5d6.
• NvL4: Resistencia +6; absorbe 4d8.
• NvL5: Resistencia +7; absorbe 5d8.
Alcance / Área: Personal.
Duración: 2 turnos o hasta agotar su reserva.
Sinergias: Si recibe daño de Fuego: apaga Ardiendo y gana +1 Voluntad 1 turno.` },
    { id:'colmillo-basalto', nombre:'Colmillo de Basalto', raiz:'FIS', formula:'Físico + Nivel Mágico + foco/arma + bonus', full:`Luna: Azul (Mágica) • Tipo: Ofensiva (Estacas de tierra) • Atributo: Físico
Descripción: El suelo se abomba y picas de basalto emergen bajo el enemigo, dejando grietas ennegrecidas.
Tirada: Físico + Nivel Mágico + foco/arma de asta + bonus
Progresión por Nivel Lunar:
• NvL1: 4d4 perforante; si falla por 10+, Sangrado 1d4 por turno.
• NvL2: 4d6 perforante.
• NvL3: 5d6; el efecto abarca radio 1 m alrededor del punto.
• NvL4: 5d8.
• NvL5: 6d8; radio 2 m alrededor del punto.
Alcance / Área: Punto a 10 m del usuario; área de 1 casilla (ver progreso).
Duración: Instantáneo (Sangrado es DoT).
Salvación: Reflejos (para mitigar daño y evitar Sangrado).
DC: 10 + Nivel + Nivel Mágico
Si supera: Mitad de daño y sin Sangrado.
Si falla: Daño pleno; si falla por 5+, Sangrado 1d4 por Nivel Mágico.
Tirada al inicio: Fortaleza al inicio para terminar Sangrado.
Sinergias: Si el objetivo está Sujetado/Anclado: +1 dado al daño.` },
    // Destreza
    { id:'flecha-escarcha', nombre:'Flecha de Escarcha', raiz:'DES', formula:'Destreza + Nivel Mágico + arco/foco + bonus', full:`Luna: Azul (Mágica) • Tipo: Ofensiva (Precisión/Hielo) • Atributo: Destreza
Descripción: Una flecha helada se forma en el aire; al tensar, la escarcha cruje y el disparo corta el viento.
Tirada: Destreza + Nivel Mágico + arco/foco + bonus
Progresión por Nivel Lunar:
• NvL1: 4d4 frío/perforante; en fallo a Reflejos por 10+, Ralentizada −5 m por 2 turnos.
• NvL2: 4d6 frío/perforante.
• NvL3: 5d6; la Ralentización se aplica, aunque no sea fallo grave.
• NvL4: 5d8.
• NvL5: 6d8.
Alcance / Área: 30 m, 1 objetivo.
Duración: Instantáneo (Ralentizada dura 1 turno o hasta salvar).
Salvación: Reflejos (mitiga daño / reduce o evita la Ralentización).
DC: 10 + Nivel + Nivel Mágico
Si supera: Mitad de daño y evita Ralentización.
Si falla: Daño pleno; Ralentizada si falla por 10+ (NvL3: siempre).
Tirada al inicio: Reflejos al inicio para quitar Ralentización.
Sinergias: Si el objetivo está Mojado: Ralentizada automática en NvL1–2 y +1 dado al daño en NvL3+.` },
    { id:'danza-hojas', nombre:'Danza de Hojas', raiz:'DES', formula:'Destreza + Nivel Mágico + foco + bonus', full:`Luna: Azul (Mágica) • Tipo: Ofensiva (Multigolpe de viento) • Atributo: Destreza
Descripción: Cuchillas de aire giran en espiral, cortando con silbidos agudos a múltiples enemigos cercanos.
Tirada: Destreza + Nivel Mágico + foco + bonus
Progresión por Nivel Lunar:
• NvL1: 4d4 total, divisible entre hasta 2 objetivos.
• NvL2: 4d6 total.
• NvL3: 5d6 total; puede dividirse entre hasta 3 objetivos.
• NvL4: 5d8 total.
• NvL5: 6d8 total; hasta 3 objetivos.
Alcance / Área: Círculo de 2 m alrededor del usuario.
Duración: Instantáneo.
Salvación: Reflejos por objetivo.
DC: 10 + Nivel + Nivel Mágico
Si supera: Mitad de su porción de daño.
Si falla: Daño pleno de su porción.
Sinergias: En follaje/tormenta: +1 objetivo permitido desde NvL3.` },
    { id:'jabalina-tempestuosa', nombre:'Jabalina Tempestuosa', raiz:'DES', formula:'Destreza + Nivel Mágico + lanza/foco + bonus', full:`Luna: Azul (Mágica) • Tipo: Ofensiva/Control (Rayo) • Atributo: Destreza
Descripción: Una jabalina de luz azul se materializa; al volar, hilos eléctricos buscan nuevos blancos.
Tirada: Destreza + Nivel Mágico + lanza/foco + bonus
Progresión por Nivel Lunar:
• NvL1: 4d4 rayo; en fallo Reflejos por 10+, Entumecido (−2 A.D.) 2 turnos.
• NvL2: 4d6 rayo.
• NvL3: 5d6; rebota a 1 objetivo a 3 m del principal.
• NvL4: 5d8 rayo.
• NvL5: 6d8; rebota a 2 objetivos.
Alcance / Área: 20 m, 1 objetivo (rebotes a 3 m).
Duración: Instantáneo (Entumecido 1 turno).
Salvación: Reflejos (evita Entumecido; mitiga rebotes).
DC: 10 + Nivel + Nivel Mágico
Si supera: Mitad de daño; evita Entumecido.
Si falla: Daño pleno; Entumecido si falla por 10+.
Tirada al inicio: Reflejos al inicio para quitar Entumecido.
Sinergias: Si el objetivo está Mojado: +1 dado al daño y +1 rebote disponible.` },
    { id:'latigo-aeromantico', nombre:'Látigo Aeromántico', raiz:'DES', formula:'Destreza + Nivel Mágico + foco + bonus', full:`Luna: Azul (Mágica) • Tipo: Ofensiva (Desarme) • Atributo: Destreza
Descripción: Un látigo de viento estalla en un chasquido, intentando arrancar el arma del enemigo.
Tirada: Destreza + Nivel Mágico + foco + bonus
Progresión por Nivel Lunar:
• NvL1: 4d4 cortante; intenta Desarme ligero.
• NvL2: 4d6 cortante.
• NvL3: 5d6; ventaja al desarmar.
• NvL4: 5d8 cortante.
• NvL5: 6d8 cortante; alcance aumenta a 5 m.
Alcance / Área: 3 m (1 m por nivel extra).
Duración: Instantáneo.
Salvación: Carácter (del objetivo) para mantener el arma.
DC: 10 + Nivel + Nivel Mágico
Si supera: Mantiene el arma; niega el daño.
Si falla: Pierde el arma (cae a 1 m) y recibe daño pleno.
Sinergias: Si el objetivo está Volando: desciende al suelo.` },
    // Mental
    { id:'orbe-igneo', nombre:'Orbe Ígneo', raiz:'MEN', formula:'Mental + Nivel Mágico + foco + bonus', full:`Luna: Azul (Mágica) • Tipo: Ofensiva (Área / Fuego) • Atributo: Mental
Descripción: Una esfera de fuego azul se forma entre las manos, explotando en un destello que deja brasas flotando.
Tirada: Mental + Nivel Mágico + foco + bonus
Progresión por Nivel Lunar:
• NvL1: 4d6 fuego.
• NvL2: 5d6 fuego.
• NvL3: 6d6 fuego; aplica Ardiendo 2d6 (máx. 2 turnos).
• NvL4: 7d8 fuego.
• NvL5: 8d8 fuego; el radio aumenta +1 m (total 4 m).
Alcance / Área: Hasta 20 m; cuadrado 2x2 m (3 m en NvL3; 4 m en NvL5).
Duración: Instantáneo + DoT (si aplica).
Salvación: Reflejos (mitiga y puede evitar el estado en éxito).
DC: 10 + Nivel + Nivel Mágico
Si supera: Mitad de daño y evita Ardiendo.
Si falla: Daño pleno; si falla por 10+, Ardiendo 2d6 (máx. 2 turnos).
Tirada al inicio: el afectado puede gastar acción para apagar; si no, sufre el DoT al final del turno.
Sinergias: Aceite/tejidos secos: +1 dado al daño base.` },
    { id:'muro-viento', nombre:'Muro de Viento', raiz:'MEN', formula:'Mental + Nivel Mágico + foco + bonus', full:`Luna: Azul (Mágica) • Tipo: Defensiva / Control • Atributo: Mental
Descripción: El aire se espesa en una pared ondulante que desvía flechas y ralentiza proyectiles.
Tirada: Mental + Nivel Mágico + foco + bonus
Progresión por Nivel Lunar:
• NvL1: Absorbe 4d4 de daño de ataques a distancia que lo crucen; penaliza −3 a A.D. a través del muro.
• NvL2: Absorbe 4d6; mantiene −3.
• NvL3: Absorbe 5d6; ahora −4.
• NvL4: Absorbe 5d8; mantiene −4.
• NvL5: Absorbe 6d8; ahora −6.
Alcance / Área: Línea 4 m x 2 m; +1 m de largo por nivel.
Duración: 2 turnos por nivel.
Sinergias: En altura/borde o pasillo estrecho: puede sumar −1 adicional (a discreción del DM).` },
    { id:'misil-arcano', nombre:'Misil Arcano', raiz:'MEN', formula:'Mental + Nivel Mágico + foco + bonus', full:`Luna: Azul (Mágica) • Tipo: Ofensiva (Autoimpacto) • Atributo: Mental
Descripción: Pequeñas saetas de luz azul giran y buscan sus blancos, sorteando esquinas como luciérnagas veloces.
Tirada: Mental + Nivel Mágico + foco + bonus
Progresión por Nivel Lunar:
• NvL1: 5d4 total, repartible entre 1–2 objetivos; ignora cobertura ligera.
• NvL2: 5d6 total.
• NvL3: 6d6; se divide en 3 misiles.
• NvL4: 6d8 total.
• NvL5: 6d12; 4 misiles.
Alcance / Área: 30 m, hasta 2–4 objetivos.
Duración: Instantáneo.
Salvación: — (impacto asegurado; resistencias aplican).
Sinergias: Si el objetivo está Marcado por ti: +1 dado total.` },
    { id:'tormenta-chispas-mayor', nombre:'Tormenta de Chispas Mayor', raiz:'MEN', formula:'Mental + Nivel Mágico + foco + bonus', full:`Luna: Azul (Mágica) • Tipo: Ofensiva / Área (Rayo) • Atributo: Mental
Descripción: Una nube de estática se condensa y libera un chasquido múltiple de rayos azulados.
Tirada: Mental + Nivel Mágico + foco + bonus
Progresión por Nivel Lunar:
• NvL1: 5d4 rayo; en fallo por 5+, Entumecido (−1 A.D y C.C) 1 turno.
• NvL2: 5d6 rayo.
• NvL3: 5d8 rayo; afecta +1 objetivo en el cono.
• NvL4: 6d8 rayo.
• NvL5: 6d12 rayo; afecta +2 objetivos adicionales.
Alcance / Área: Cono 4 m (5 m en NvL3; 6 m en NvL5).
Duración: Instantáneo (Entumecido 1 turno).
Salvación: Reflejos (mitiga y evita el estado).
DC: 10 + Nivel + Nivel Mágico
Si supera: Mitad y sin Entumecido.
Si falla: Pleno; si falla por 10+, Entumecido 2 turnos.
Tirada al inicio: Reflejos al inicio para quitar Entumecido.
Sinergias: Si el objetivo está Mojado: duplica el daño total recibido.` },
    // Social
    { id:'himno-sereno', nombre:'Himno Sereno', raiz:'SOC', formula:'DC = 10 + Nivel + Social + Nivel Mágico', full:`Luna: Azul (Mágica) • Tipo: Debuff / Control leve (Mente) • Atributo: Social
Descripción: Un canto suave resuena; las tensiones ceden y los impulsos agresivos se apagan.
Resolución: El objetivo lanza Carácter con dificultad 10 + Nivel + Social + Nivel Mágico
Progresión por Nivel Lunar:
• NvL1: −3 Ataque C.C y −3 Voluntad; no puede usar Reacciones ofensivas.
• NvL2: −4 Ataque C.C y −4 Voluntad.
• NvL3: −5 Ataque C.C y −4 Voluntad; no puede usar más de una Acción por Bloque.
• NvL4: −5 Ataque C.C y −5 Voluntad.
• NvL5: −7 Ataque C.C y no puede iniciar combate en su turno.
Alcance / Área: 10 m, 1 objetivo (2 objetivos en NvL4–5).
Duración: 1 turno (repite salvación al inicio para terminar).
Salvación: Voluntad.
Si supera: Niega el efecto.
Si falla: Penalidad completa.
Tirada al inicio: Carácter al inicio para terminar o reducir.
Sinergias: Si fue sanado por ti/aliado este turno: +1 a la DC.` },
    { id:'lamento-bruma', nombre:'Lamento de la Bruma', raiz:'SOC', formula:'Social + Nivel Mágico + instrumento + bonus', full:`Luna: Azul (Mágica) • Tipo: Debuff / Área (Desconcierto) • Atributo: Social
Descripción: Una melodía hueca flota en la neblina; los sentidos se embotan y la puntería falla.
Tirada: Social + Nivel Mágico + instrumento + bonus
Progresión por Nivel Lunar:
• NvL1: −2 a Reflejos y −2 a ataques a distancia de quienes están en el área.
• NvL2: −2 a Reflejos y −3 a A.D.
• NvL3: −3 a Reflejos y −4 a A.D.
• NvL4: −5 a Reflejos y −5 a A.D.
• NvL5: Mantiene −5 y el primer AO en contra en el turno siempre acierta.
Alcance / Área: Círculo 2x2 m; +1 m de radio si hay niebla/lluvia.
Duración: 2 turnos por nivel.
Salvación: Carácter (al entrar y al inicio del turno si permanece dentro).
DC: 10 + Nivel + Nivel Mágico
Si supera: Reduce las penalidades en 1.
Si falla: Penalidad completa.
Tirada al inicio: Carácter al inicio mientras permanezca en el área.
Sinergias: Con niebla/lluvia: +1 m de radio.` },
    { id:'sello-restitucion', nombre:'Sello de Restitución', raiz:'SOC', formula:'Curación (ver detalle)', full:`Luna: Azul (Mágica) • Tipo: Soporte (Curación instantánea) • Atributo: Social
Descripción: Un círculo de luz azul se dibuja bajo los pies del aliado; tu voz lo envuelve y las heridas cierran mientras el aire huele a lluvia reciente.
Tirada: No requiere tirada para activarse. La curación se lanza con dados por el aliado afectado.
Progresión por Nivel Lunar:
• NvL1: El aliado lanza 2d4 y recupera esa cantidad de PG; además, obtiene +1 a Voluntad por 1 turno.
• NvL2: El aliado lanza 3d4; elimina 1 Condición Menor.
• NvL3: Hasta 2 aliados; cada uno 3d4; reciben +1 a Defensa hasta tu próximo turno.
• NvL4: Hasta 2 aliados; cada uno 4d4; el +1 a Voluntad se extiende a 2 turnos.
• NvL5: Hasta 3 aliados; cada uno 5d4; si uno estaba a 0 o Inconsciente, vuelve a 1 PG y se pone en pie (sin AO).
Alcance / Área: 6 m; 1 aliado (NvL1–2), 2 aliados (NvL3–4), 3 aliados (NvL5).
Duración: Instantánea (bonificaciones 1–2 turnos).
Sinergias: Si el objetivo ya tiene ‘Luz Azul’ activa, suma +1 PG por cada punto de tu Nivel Mágico al resultado de sus dados este turno.` },
    { id:'campana-disonante', nombre:'Campana Disonante', raiz:'SOC', formula:'Social + Nivel Mágico + instrumento + bonus', full:`Luna: Azul (Mágica) • Tipo: Ofensiva (Daño Sónico) • Atributo: Social
Descripción: Haces vibrar el aire con un tañido quebrado; la onda golpea la mente del enemigo como un eco que corta desde dentro.
Tirada: Social + Nivel Mágico + instrumento + bonus
Progresión por Nivel Lunar:
• NvL1: 5d4 de daño sónico a 1 objetivo.
• NvL2: 5d6; si falla por 5+, Desorientado (−1) 1 turno.
• NvL3: Hasta 2 objetivos dentro de 10 m (repartibles); mantiene 5d6.
• NvL4: 6d6; si falla por 5+, además Aturdido 1 (pierde su Reacción).
• NvL5: 6d8 y DoT 1d4 sónico por 2 turnos si falla; hasta 3 objetivos.
Alcance / Área: 10 m; 1 objetivo (NvL1–2), 2 objetivos (NvL3), 3 objetivos (NvL5).
Duración: Instantáneo; DoT 2 turnos (NvL5).
Salvación: Voluntad.
DC: 10 + Nivel + Nivel Mágico.
Si supera: Mitad y evita estados.
Si falla: Daño completo y efectos según nivel.
Tirada al inicio: Con DoT activo (NvL5), Voluntad al inicio para finalizar.
Sinergias: Objetivo Atemorizado: +1 a la DC; en Círculo Resonante: +1 dado al daño base.` }
  ],
  malditas: [
    // Físico
    { id:'hueso-serrado', nombre:'Hueso Serrado', raiz:'FIS', formula:'Físico + Nivel Maldito + arma/implante + bonus', full:`Luna: Roja (Maldita) • Tipo: Ofensiva C.C. (Mutación ósea) • Atributo: Físico
Descripción: La carne cruje y brotan espinas de hueso rojo; el golpe deja astillas vibrando en la herida.
Tirada: Físico + Nivel Maldito + arma/implante + bonus
Progresión por Nivel Maldito:
• NvL1: 4d4 perforante; si falla por 10+, Sangrado 1d4.
• NvL2: 4d6 perforante; Sangrado 1d4 en fallo por 10+.
• NvL3: 5d6 perforante; Sangrado 2d6 en fallo por 10+.
• NvL4: 5d8 perforante; si ya Sangrando, +1 dado al daño inicial.
• NvL5: 6d8 perforante; Sangrado 2d8 en fallo por 10+.
Alcance: C.C. (1.5 m).
Duración: Instantáneo (+DoT si aplica).
Salvación: Fortaleza (evitar Sangrado/mitigar).
DC: 10 + Nivel + Nivel Maldito
Si supera: Mitad; evita Sangrado.
Si falla: Pleno; Sangrado según nivel si falla por 10+.
Tirada al inicio: Fortaleza para terminar Sangrado.
Sinergias: Contra objetivos sin armadura rígida: +1 dado al daño inicial.` },
    { id:'placa-quimerica', nombre:'Placa Quimérica', raiz:'FIS', formula:'Físico + Nivel Maldito + armadura/implante + bonus', full:`Luna: Roja (Maldita) • Tipo: Defensiva (Placas mutantes) • Atributo: Físico
Descripción: Placas rojizas emergen y se entrelazan con la piel, volviéndola dura y flexible a la vez.
Tirada: Físico + Nivel Maldito + armadura/implante + bonus
Progresión por Nivel Maldito:
• NvL1: Resistencia −3 (contundente/cortante) y espinas 1d4 a quien te golpee en C.C.
• NvL2: Resistencia −4; espinas 1d6.
• NvL3: Resistencia −5; espinas 2d6; ventaja contra derribos (narrativa).
• NvL4: Resistencia −6; espinas 2d8.
• NvL5: Resistencia −7; espinas 3d8; si bloquea totalmente un ataque, contraataca 6d4.
Duración: Hasta tu próximo turno.
Sinergias: Si llevas escudo metálico, el daño de espinas gana un bonus igual al bono de Resistencia del escudo.` },
    { id:'martillo-carne-viva', nombre:'Martillo de Carne Viva', raiz:'FIS', formula:'Físico + Nivel Maldito + arma/implante + bonus', full:`Luna: Roja (Maldita) • Tipo: Ofensiva / Control (Aplastamiento) • Atributo: Físico
Descripción: El brazo crece y se deforma en un mazo carnoso; el impacto aplasta y fija con tejido fibroso.
Tirada: Físico + Nivel Maldito + arma/implante + bonus
Progresión por Nivel Maldito:
• NvL1: 4d4 contundente; si falla por 10+, Derribado.
• NvL2: 4d6 contundente.
• NvL3: 5d6; al impactar puedes inmovilizar 3 m la posición del objetivo (‘Anclado’ leve).
• NvL4: 5d8 contundente; empuje 1 m.
• NvL5: 6d8; Anclado se vuelve total (mov. 0) si falla por 5+.
Alcance / Área: C.C.; onda corta 1 m alrededor del blanco en NvL5.
Duración: Instantáneo (Anclado 1 turno).
Salvación: Fortaleza.
DC: 10 + Nivel + Nivel Maldito
Si supera: Mitad; sin estado.
Si falla: Pleno; Derribo/Anclado según nivel.
Tirada al inicio: Fortaleza al inicio para terminar Anclado.
Sinergias: Terreno blando (lodo/raíces): +1 a la DC de Anclado.` },
    { id:'columna-oxido', nombre:'Columna de Óxido', raiz:'FIS', formula:'Físico + Nivel Maldito + arma/implante + bonus', full:`Luna: Roja (Maldita) • Tipo: Ofensiva / Área (Metal corrupto) • Atributo: Físico
Descripción: El suelo exuda polvo férrico que estalla en una columna rojiza, abollando y oxidando.
Tirada: Físico + Nivel Maldito + arma/implante + bonus
Progresión por Nivel Maldito:
• NvL1: 4d4 contundente; armas/armaduras metálicas del objetivo reciben −1 a su bono hasta tu próximo turno.
• NvL2: 4d6 contundente; penalidad se extiende 2 turnos.
• NvL3: 5d6; radio +1 m (total 3 m).
• NvL4: 5d8; si falla por 10+, el objetivo suelta un objeto metálico tenue.
• NvL5: 6d8; radio 4 m; contra objetivos metálicos, +1 dado.
Alcance / Área: Punto a 8 m; radio 2 m (3 m NvL3; 4 m NvL5).
Duración: Instantáneo (penalidad temporal).
Salvación: Reflejos.
DC: 10 + Nivel + Nivel Maldito
Si supera: Mitad; evita penalidad.
Si falla: Pleno; sufre penalidad en equipo metálico.
Sinergias: En zonas con chatarra, +1 dado al daño base.` },
    // Destreza
    { id:'agujas-biomorficas', nombre:'Agujas Biomórficas', raiz:'DES', formula:'Destreza + Nivel Maldito + aguja/foco + bonus', full:`Luna: Roja (Maldita) • Tipo: Ofensiva (Proyección mutante) • Atributo: Destreza
Descripción: Tendones lanzan microagujas vivas que se retuercen buscando huecos en la armadura.
Tirada: Destreza + Nivel Maldito + aguja/foco + bonus
Progresión por Nivel Maldito:
• NvL1: 4d4 perforante; Envenenado 1d4 por nivel maldito si falla por 10+, 2 turnos no acumulables.
• NvL2: 4d6; el veneno dura 3 turnos.
• NvL3: 6d6; puedes dividir el daño en 2 objetivos a 5 m entre sí.
• NvL4: 5d8; Envenenado 1d6 por nivel maldito si falla por 10+.
• NvL5: 6d8; hasta 3 objetivos (a 2 m entre sí) con reparto de daño, los 3 lanzan Fortaleza.
Alcance / Área: 15 m; 1–3 objetivos.
Duración: Instantáneo (+estado si aplica).
Salvación: Fortaleza.
DC: 10 + Nivel + Nivel Maldito
Si supera: Mitad; evita Veneno.
Si falla: Pleno; aplica Veneno.
Tirada al inicio: Fortaleza para terminar Veneno.
Sinergias: Si el objetivo está Sangrando, +1 dado al daño inicial.` },
    { id:'cuerda-hematica', nombre:'Cuerda Hemática', raiz:'DES', formula:'Destreza + Nivel Maldito + cadena/implante + bonus', full:`Luna: Roja (Maldita) • Tipo: Control (Atracción/Desgarro) • Atributo: Destreza
Descripción: Un lazo de sangre solidificada se dispara, se clava y tira con chasquidos elásticos.
Tirada: Destreza + Nivel Maldito + cadena/implante + bonus
Progresión por Nivel Maldito:
• NvL1: Atrae 1 m y 4d4 de daño; si falla por 10+, Derribado al final.
• NvL2: Atrae 2 m y 4d6 de daño.
• NvL3: Atrae 3 m y 5d6 de daño.
• NvL4: Atrae 4 m y 5d8 de daño.
• NvL5: Atrae 5 m y 6d8 de daño; si falla por 10+, además pierde su Reacción.
Alcance / Área: 10 m, +5 por nivel; 1 objetivo.
Duración: Instantáneo.
Salvación: Fortaleza (resistir tracción).
DC: 10 + Nivel + Nivel Maldito
Si supera: No se mueve; mitad de daño.
Si falla: Se mueve y recibe daño pleno; puede quedar Derribado o sin Reacción.
Sinergias: Si está Anclado por otra virtud aliada, la tracción no provoca AO.` },
    { id:'disparo-serpent', nombre:'Disparo Serpentino', raiz:'DES', formula:'Destreza + Nivel Maldito + dardo/arma arrojadiza + bonus', full:`Luna: Roja (Maldita) • Tipo: Ofensiva (Precisión guiada) • Atributo: Destreza
Descripción: El proyectil se arquea como una serpiente roja, doblando esquinas y buscando carne blanda.
Tirada: Destreza + Nivel Maldito + dardo/arma arrojadiza + bonus
Progresión por Nivel Maldito:
• NvL1: 4d4 y −1 Voluntad 2 turnos si falla por 10+ (Atemorizado).
• NvL2: 4d6; la penalidad se mantiene 1 turno.
• NvL3: 5d6; ignora cobertura ligera y media.
• NvL4: 5d8; si el objetivo está Atemorizado, +1 dado.
• NvL5: 6d8; puede re-engancharse a un segundo blanco a 5 m del primero con la mitad del daño.
Alcance / Área: 25 m; 1 objetivo (segundo en NvL5).
Duración: Instantáneo (penalidad 2 turnos).
Salvación: Reflejos (mitigar daño) y Voluntad (resistir penalidad).
DC: 10 + Nivel + Nivel Maldito
Si supera: Mitad; sin penalidad.
Si falla: Pleno; penalidad a Voluntad si corresponde.
Sinergias: Si el blanco tiene un estado mental (Atemorizado/Desorientado), +1 a la DC de Voluntad.` },
    { id:'shrapnel-vivo', nombre:'Shrapnel Vivo', raiz:'DES', formula:'Destreza + Nivel Maldito + implante + bonus', full:`Luna: Roja (Maldita) • Tipo: Ofensiva / Área (Fragmentación orgánica) • Atributo: Destreza
Descripción: La piel desprende esquirlas biometálicas que salen disparadas en abanico.
Tirada: Destreza + Nivel Maldito + implante + bonus
Progresión por Nivel Maldito:
• NvL1: 4d4; puedes dividir en hasta 2 objetivos dentro del cono.
• NvL2: 4d6; cono +1 m.
• NvL3: 6d6; hasta 3 objetivos.
• NvL4: 5d8; si falla por 5+, Entumecido (−2 A.D.) 2 turnos.
• NvL5: 7d8; cono +2 m (total 6 m) y hasta 4 objetivos.
Alcance / Área: Cono 4 m (6 m NvL5).
Duración: Instantáneo (Entumecido 1 turno si aplica).
Salvación: Reflejos (mitigar/evitar estado).
DC: 10 + Nivel + Nivel Maldito
Si supera: Mitad; sin estado.
Si falla: Pleno; estado si corresponde.
Tirada al inicio: Reflejos al inicio si quedó Entumecido.
Sinergias: Si hay metal suelto/escombros, +1 objetivo permitido.` },
    // Mental
    { id:'peste-algoritmica', nombre:'Peste Algorítmica', raiz:'MEN', formula:'Mental + Nivel Maldito + foco + bonus', full:`Luna: Roja (Maldita) • Tipo: Ofensiva (DoT infeccioso) • Atributo: Mental
Descripción: Un enjambre de glifos rojos se adhiere a la piel y reescribe el dolor en patrones repetidos.
Tirada: Mental + Nivel Maldito + foco + bonus
Progresión por Nivel Maldito:
• NvL1: 4d4 inicial + Infectado 1d4/turno (máx. 2 turnos) si falla.
• NvL2: 4d6 + DoT 1d6.
• NvL3: 5d6 + DoT 1d6; si ya Envenenado, el DoT sube un paso (1d6→1d8).
• NvL4: 5d8 + DoT 1d8.
• NvL5: 8d8 + DoT 1d8; radio +1 m como estallido opcional.
Alcance / Área: 8 m, 1 objetivo (radio 2 m opcional NvL5).
Duración: Instantáneo + DoT.
Salvación: Fortaleza.
DC: 10 + Nivel + Nivel Maldito
Si supera: Mitad y sin DoT.
Si falla: Pleno y con DoT.
Tirada al inicio: Fortaleza para terminar DoT.
Sinergias: Si el blanco está Envenenado o Infectado, el DoT no se acumula: prevalece el mayor pero refresca duración.` },
    { id:'marea-nanoxido', nombre:'Marea de Nanóxido', raiz:'MEN', formula:'Mental + Nivel Maldito + foco + bonus', full:`Luna: Roja (Maldita) • Tipo: Ofensiva / Área (Corrosión) • Atributo: Mental
Descripción: Una nube de nanopartículas rojizas cae como polvo que corroe metal y carne por igual.
Tirada: Mental + Nivel Maldito + foco + bonus
Progresión por Nivel Maldito:
• NvL1: 4d4; contra objetivos metálicos, +1 dado.
• NvL2: 4d6; radio +1 m (total 3 m).
• NvL3: 5d6; armas metálicas que atraviesen el área sufren −1 a su próximo daño.
• NvL4: 5d8; si falla por 10+, ‘Frágil’: −1 Defensa 2 turnos.
• NvL5: 7d8; radio 4 m y la penalidad se extiende 3 turnos.
Alcance / Área: Punto a 10 m; radio 2 m (3 m NvL2; 4 m NvL5).
Duración: Instantáneo (penalidades 1–2 turnos).
Salvación: Reflejos.
DC: 10 + Nivel + Nivel Maldito
Si supera: Mitad y evita ‘Frágil’.
Si falla: Pleno; puede ganar ‘Frágil’.
Sinergias: En salas cerradas/túneles: +1 a la DC por saturación.` },
    { id:'geometria-impia', nombre:'Geometría Impía', raiz:'MEN', formula:'Mental + Nivel Maldito + foco + bonus', full:`Luna: Roja (Maldita) • Tipo: Control (Espacio distorsionado) • Atributo: Mental
Descripción: El espacio se pliega con ángulos imposibles; el mundo se estira hacia puntos rojos.
Tirada: Mental + Nivel Maldito + foco + bonus
Progresión por Nivel Maldito:
• NvL1: Desplaza 1 m a un objetivo y 4d4 psíquico; no provoca AO.
• NvL2: Desplaza 2 m y 4d6 psíquico.
• NvL3: Desplaza 3 m y 5d6; si falla por 5+, Desorientado (−1) 1 turno.
• NvL4: Desplaza 4 m y 5d8.
• NvL5: Desplaza 5 m y 6d8; puede dividir 2 m en un segundo objetivo cercano (mitad de daño).
Alcance / Área: 10 m, 1 objetivo (2º parcial NvL5).
Duración: Instantáneo (Desorientado 1 turno si aplica).
Salvación: Voluntad.
DC: 10 + Nivel + Nivel Maldito
Si supera: Mitad; reduce desplazamiento a la mitad.
Si falla: Pleno; sufre desplazamiento completo y estado.
Tirada al inicio: Voluntad al inicio para quitar Desorientado.
Sinergias: Si está Anclado por un aliado, no se desplaza pero recibe +1 dado.` },
    { id:'reloj-putrefaccion', nombre:'Reloj de Putrefacción', raiz:'MEN', formula:'Mental + Nivel Maldito + foco + bonus', full:`Luna: Roja (Maldita) • Tipo: Debuff / DoT (Decadencia temporal) • Atributo: Mental
Descripción: Un tic-tac rojo marca el envejecimiento de heridas y engranajes; todo se deshace un poco más rápido.
Tirada: Mental + Nivel Maldito + foco + bonus
Progresión por Nivel Maldito:
• NvL1: 4d4 y ‘Aceleración de Decadencia’: al final de su turno sufre 1d4 si falla.
• NvL2: 4d6 y DoT 1d6.
• NvL3: 5d6 y DoT 1d6; si ya tiene un DoT activo, este recibe +1 turno de duración (una vez).
• NvL4: 5d8 y DoT 1d8.
• NvL5: 6d8 y DoT 1d8; además, mitad de daño en armaduras metálicas.
Alcance / Área: 10 m, 1 objetivo.
Duración: Instantáneo + DoT (2 turnos salvo que especifique).
Salvación: Voluntad.
DC: 10 + Nivel + Nivel Maldito
Si supera: Sin DoT.
Si falla: Con DoT; penalidad NvL5.
Tirada al inicio: Voluntad para terminar DoT.
Sinergias: Si el objetivo es constructo/armadura: +1 dado al daño inicial.` },
    // Social
    { id:'coro-obediencia', nombre:'Coro de Obediencia', raiz:'SOC', formula:'Social + Nivel Maldito + instrumento/foco + bonus', full:`Luna: Roja (Maldita) • Tipo: Control (Sumisión) • Atributo: Social
Descripción: Susurros polifónicos se filtran bajo la piel; la voluntad se arrodilla ante el ritmo rojo.
Tirada: Social + Nivel Maldito + instrumento/foco + bonus
Progresión por Nivel Maldito:
• NvL1: Atemorizado leve (−2 Ataque/Voluntad) y su próxima Reacción ofensiva falla automáticamente.
• NvL2: Atemorizado −3; no puede usar Disparo Preparado.
• NvL3: Atemorizado −4; si falla por 10+, ‘Obediencia’: debe gastar su próxima Acción Menor en nada (temblor).
• NvL4: Atemorizado −5.
• NvL5: Atemorizado −7; si falla por 10+, suelta un objeto tenue.
Alcance / Área: Cono 4 m (5 m NvL3; 6 m NvL5).
Duración: 1 turno (repite salvación).
Salvación: Carácter (resistir miedo/control).
DC: 10 + Nivel + Nivel Maldito
Si supera: Reduce un paso la atenuación del miedo.
Si falla: Sufre el nivel completo y efectos secundarios.
Tirada al inicio: Carácter al inicio para bajar/terminar.
Sinergias: Si hay cadáveres/ruinas a la vista: +1 a la DC.` },
    { id:'pacto-flagelante', nombre:'Pacto Flagelante', raiz:'SOC', formula:'Social + Nivel Maldito + foco + bonus', full:`Luna: Roja (Maldita) • Tipo: Soporte (Riesgo/Recompensa) • Atributo: Social
Descripción: Un sello rojo grava piel y metal; la fuerza aumenta al precio de dolor voluntario.
Tirada: Social + Nivel Maldito + foco + bonus
Progresión por Nivel Maldito:
• NvL1: El aliado gana +4d4 al próximo ataque/virtud y sufre 1d4 auto-daño.
• NvL2: Gana +4d6 y sufre 2d6.
• NvL3: Gana +5d6 y sufre 2d6.
• NvL4: Gana +5d8 y sufre 2d8.
• NvL5: Gana +6d8 y sufre 2d8; ignora 1 resistencia en ese ataque.
Alcance / Área: 6 m, 1 aliado.
Duración: Hasta el fin de tu turno o hasta consumir el bono.
Salvación: Voluntad (aliado) para sostener el pacto si no usó el bono.
DC: 10 + Nivel + Nivel Maldito
Si supera: Mantiene el bono 1 turno adicional si no lo usó.
Si falla: Pierde el bono restante.
Sinergias: No puede aplicarse a aliados bajo Canto de Pavor/Miedo severo.` },
    { id:'senal-carronero', nombre:'Señal del Carroñero', raiz:'SOC', formula:'Social + Nivel Maldito + foco + bonus', full:`Luna: Roja (Maldita) • Tipo: Debuff (Vulnerabilidad dirigida) • Atributo: Social
Descripción: Marcas rojas zumban sobre el objetivo; el olor a hierro lo delata a todos.
Tirada: Social + Nivel Maldito + foco + bonus
Progresión por Nivel Maldito:
• NvL1: +2 dados al daño de tus impactos contra el marcado.
• NvL2: +3 dados y −1 Defensa del marcado por 2 turnos.
• NvL3: Dura 3 turnos; a NvL3 puedes marcar 2 objetivos.
• NvL4: +4 dados en tu próximo impacto.
• NvL5: +5 dados. Irradia 1 m: el primer aliado que golpee también gana +3 dados (1 vez).
Alcance / Área: 10 m, 1–2 objetivos.
Duración: 2 turnos (o hasta consumir el bono mayor).
Salvación: Voluntad.
DC: 10 + Nivel + Nivel Maldito
Si supera: Recibe solo +1 dado (sin extras).
Si falla: Vulnerabilidad completa.
Tirada al inicio: Voluntad para terminar antes.
Sinergias: Si el objetivo está Sangrando, +1 a la DC.` }
  ]
};
