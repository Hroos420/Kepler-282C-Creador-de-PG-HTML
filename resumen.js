// Kepler 282C — Resumen de tiradas por raza
(function(){
  const raceKey = localStorage.getItem('kepler_selected_race');
  const raceName = localStorage.getItem('kepler_selected_race_name');
  const attrsFinal = JSON.parse(localStorage.getItem('kepler_attributes_final') || 'null');
  if(!raceKey || !attrsFinal){
    window.location.replace('index.html');
    return;
  }

  const RACE_BASES = {
    humanos:    { cc:1, ad:1, ref:2, fort:2, vol:2, car:1, salud:15, mov:13, die:8 },
    elfen:      { cc:1, ad:2, ref:3, fort:1, vol:2, car:2, salud:10, mov:17, die:6 },
    zwerges:    { cc:2, ad:1, ref:1, fort:3, vol:2, car:1, salud:20, mov:10, die:12 },
    roboticos:  { cc:2, ad:1, ref:3, fort:1, vol:1, car:3, salud:18, mov:11, die:10 },
    ithariis:   { cc:1, ad:2, ref:3, fort:1, vol:2, car:1, salud:14, mov:15, die:8 },
    antropeltis:{ cc:2, ad:2, ref:2, fort:2, vol:2, car:2, salud:17, mov:14, die:10 }
  };

  const BASE = RACE_BASES[raceKey];
  if(!BASE){ window.location.replace('index.html'); return; }

  // Header info
  document.getElementById('race-picked').textContent = `Raza: ${raceName || raceKey}`;
  document.getElementById('attrs-picked').textContent = `Atributos finales — FIS ${attrsFinal.FIS} • DES ${attrsFinal.DES} • SOC ${attrsFinal.SOC} • MEN ${attrsFinal.MEN}`;

  // Botón atrás
  const backBtn = document.getElementById('back-btn');
  if(backBtn){ backBtn.addEventListener('click', () => history.back()); }

  // Utilidades
  const grid = document.getElementById('calc-grid');
  function addCard(title, detailLines, total){
    const card = document.createElement('div');
    card.className = 'race-card';
    const detailsHTML = detailLines.map(l => `<div style="color:var(--muted)">${l}</div>`).join('');
    card.innerHTML = `
      <h3 class="race-name" style="margin-bottom:4px">${title}</h3>
      ${detailsHTML}
      <div style="margin-top:8px"><strong>Total (sin arma/otros): ${total}</strong></div>
    `;
    grid.appendChild(card);
  }

  // Equipo seleccionado (arma/armadura/escudo)
  const EQUIP = JSON.parse(localStorage.getItem('kepler_equipment')||'{}');
  const W = EQUIP.weapon || null;
  const A = EQUIP.armor || null;
  const S = EQUIP.shield || null;
  const wBonusCC = (W && /Arma C\.C/i.test(W.tipoArma||W.texto||'')) ? (W.bonusAtk||0) : 0;
  const wBonusAD = (W && /Arma A\.D/i.test(W.tipoArma||W.texto||'')) ? (W.bonusAtk||0) : 0;
  const focoBonus = (W && (W.categoria==='foco' || W.categoria==='instrumento')) ? (W.bonusFoco||0) : 0;
  const armEsq = (A && (A.esq||0)) + (S && (S.esq||0) || 0);
  const armRes = (A && (A.res||0)) + (S && (S.res||0) || 0);
  const armRD  = (A && (A.rd||0)) + 0;
  const penMov = (A && (A.penMov||0)) + (S && (S.penMov||0) || 0);

  // Cálculos principales con equipo
  const atkCC = attrsFinal.FIS + BASE.cc + wBonusCC;
  const atkAD = attrsFinal.DES + BASE.ad + wBonusAD;
  const ref = attrsFinal.DES + BASE.ref;
  const fort = attrsFinal.FIS + BASE.fort;
  const vol = attrsFinal.MEN + BASE.vol;
  const car = attrsFinal.SOC + BASE.car;
  const mov = BASE.mov + attrsFinal.DES - penMov;

  addCard(
    'Ataque Cuerpo a Cuerpo',
    [
      `Físico (${attrsFinal.FIS}) + Mod Raza/Nivel (${BASE.cc}) + Arma (${wBonusCC}) + Otros (Pendiente)`
    ],
    atkCC
  );

  addCard(
    'Ataque a Distancia',
    [
      `Destreza (${attrsFinal.DES}) + Mod Raza/Nivel (${BASE.ad}) + Arma (${wBonusAD}) + Otros (Pendiente)`
    ],
    atkAD
  );

  addCard(
    'Reflejos',
    [
      `Destreza (${attrsFinal.DES}) + Mod Raza/Nivel (${BASE.ref}) + Otros (Pendiente)`
    ],
    ref
  );

  addCard(
    'Fortaleza',
    [
      `Físico (${attrsFinal.FIS}) + Mod Raza/Nivel (${BASE.fort}) + Otros (Pendiente)`
    ],
    fort
  );


  addCard(
    'Voluntad',
    [
      `Mental (${attrsFinal.MEN}) + Mod Raza/Nivel (${BASE.vol}) + Otros (Pendiente)`
    ],
    vol
  );


  addCard(
    'Carácter',
    [
      `Social (${attrsFinal.SOC}) + Mod Raza/Nivel (${BASE.car}) + Otros (Pendiente)`
    ],
    car
  );

  // Salud con dado por raza (d6/d8/d10/d12) — máx 2 rerolls
  const dieSides = BASE.die;
  const healthBase = BASE.salud + attrsFinal.FIS;
  let roll = parseInt(localStorage.getItem('kepler_health_roll') || '0', 10);
  let rerolls = parseInt(localStorage.getItem('kepler_health_rerolls') || '0', 10); // usados

  function rollDie(){ return Math.floor(Math.random() * dieSides) + 1; }
  if(!roll){ roll = rollDie(); localStorage.setItem('kepler_health_roll', String(roll)); }

  function renderHealth(){
    const total = healthBase + roll;
    const left = 2 - rerolls;

    const wrapper = document.createElement('div');
    wrapper.className = 'health-flex';

    const card = document.createElement('div');
    card.className = 'race-card';
    card.innerHTML = `
      <h3 class="race-name" style="margin-bottom:4px">Salud Base</h3>
      <div style="color:var(--muted)">Base de raza (${BASE.salud}) + Físico (${attrsFinal.FIS}) + d${dieSides} (${roll})</div>
      <div style="margin-top:8px"><strong>Total: ${total}</strong></div>
    `;

    const controls = document.createElement('div');
    controls.className = 'inline-controls';
    controls.innerHTML = `
      <div style="font-weight:600">Tirada de Salud</div>
      <button id="reroll-btn" class="continue-btn" style="margin-top:8px" ${left<=0 ? 'disabled' : ''}>Repetir tirada</button>
      <div class="hint">Intentos restantes: <strong>${left}</strong></div>
    `;

    wrapper.appendChild(card);
    wrapper.appendChild(controls);
    grid.appendChild(wrapper);

    const btn = controls.querySelector('#reroll-btn');
    if(btn){
      btn.addEventListener('click', () => {
        if(rerolls >= 2) return;
        roll = rollDie();
        rerolls += 1;
        localStorage.setItem('kepler_health_roll', String(roll));
        localStorage.setItem('kepler_health_rerolls', String(rerolls));
        grid.innerHTML = '';
        // Re-render all cards to refresh Salud
        renderAll();
      });
    }
  }

  function renderMovement(){
    addCard(
      'Movimiento Base',
      [
        `Base racial (${BASE.mov}) + Destreza (${attrsFinal.DES}) − Penalizador equipo (${penMov}) + Otros (Pendiente)`
      ],
      mov
    );
  }

  function renderAll(){
    // Rebuild all non-health cards then health and movement
    grid.innerHTML = '';
    addCard('Ataque Cuerpo a Cuerpo', [`Físico (${attrsFinal.FIS}) + Mod Raza/Nivel (${BASE.cc}) + Arma (Pendiente) + Otros (Pendiente)`], atkCC);
    addCard('Ataque a Distancia', [`Destreza (${attrsFinal.DES}) + Mod Raza/Nivel (${BASE.ad}) + Arma (Pendiente) + Otros (Pendiente)`], atkAD);
    addCard('Reflejos', [`Destreza (${attrsFinal.DES}) + Mod Raza/Nivel (${BASE.ref}) + Otros (Pendiente)`], ref);
    addCard('Fortaleza', [`Físico (${attrsFinal.FIS}) + Mod Raza/Nivel (${BASE.fort}) + Otros (Pendiente)`], fort);

    // Resistencia (Físico + Armadura + Escudo + 10 + Otros)
    const armaduraRes = armRes, escudoRes = 0, otrosRes = 0;
    const resistencia = attrsFinal.FIS + armaduraRes + 10 + otrosRes;
    addCard('Resistencia', [
      `Físico (${attrsFinal.FIS}) + (Armadura+Escudo) (${armRes}) + Base fija (10) + Otros (Pendiente)`
    ], resistencia);

    addCard('Voluntad', [`Mental (${attrsFinal.MEN}) + Mod Raza/Nivel (${BASE.vol}) + Otros (Pendiente)`], vol);

    // Esquivar (Destreza + Arm. Ligera/Esp. + Escudo Pequeño + 10 + Otros)
    const armLig = armEsq, escPeq = 0, otrosEsq = 0;
    const esquivar = attrsFinal.DES + armLig + 10 + otrosEsq;
    addCard('Esquivar', [
      `Destreza (${attrsFinal.DES}) + (Armadura/escudo) Esquiva (${armEsq}) + Base fija (10) + Otros (Pendiente)`
    ], esquivar);

    addCard('Carácter', [`Social (${attrsFinal.SOC}) + Mod Raza/Nivel (${BASE.car}) + Otros (Pendiente)`], car);
    renderHealth();
    // Reducción de Daño (Armadura)
    if(armRD>0){ addCard('Reducción de Daño', [`Aportada por Armadura (${armRD})`], armRD); }
    renderMovement();
  }

  // Bonus para canalización/interpretación (si aplica)
  if(focoBonus>0){
    addCard('Conducción de Virtudes', [
      `Atributo raíz + Nivel Mágico/Maldito + Bono del foco/instrumento (${focoBonus}) + Otros`
    ], focoBonus);
  }

  renderAll();

  // Botones de Guardar y Exportar
  const saveBtn = document.getElementById('save-btn');
  const exportBtn = document.getElementById('export-btn');

  function computeCalcs(){
    const resistencia = attrsFinal.FIS + armRes + 10;
    const esquivar = attrsFinal.DES + armEsq + 10;
    return { atkCC, atkAD, ref, fort, vol, car, mov, resistencia, esquivar, rd: armRD, focoBonus, weapon: W, armor:A, shield:S, health:{total: healthBase+roll, base:healthBase, die:dieSides, roll} };
  }

  function exportNow(){
    const calcs = computeCalcs();
    const lvlMag = parseInt(localStorage.getItem('kepler_lvl_mag')||'0',10);
    const lvlMal = parseInt(localStorage.getItem('kepler_lvl_mal')||'0',10);
    const lines = [];
    lines.push(`Raza: ${raceName || raceKey}`);
    // Equipo
    if(W){ lines.push(`Arma/Foco/Instrumento: ${W.nombre} (bonus C.C=${wBonusCC}, A.D=${wBonusAD}, Foco=${focoBonus})`); }
    if(A){ lines.push(`Armadura: ${A.nombre} (Esquiva+${A.esq||0} Resistencia+${A.res||0} RD ${A.rd||0} PenMov ${A.penMov||0})`); }
    if(S){ lines.push(`Escudo: ${S.nombre} (Esquiva+${S.esq||0} Resistencia+${S.res||0} PenMov ${S.penMov||0})`); }
    lines.push(`Atributos — FIS ${attrsFinal.FIS} | DES ${attrsFinal.DES} | SOC ${attrsFinal.SOC} | MEN ${attrsFinal.MEN}`);
    lines.push(`Niveles Lunares — Mágico: ${lvlMag} | Maldito: ${lvlMal}`);
    lines.push('--- Tiradas ---');
    lines.push(`C.C.: ${calcs.atkCC}`); lines.push(`A.D.: ${calcs.atkAD}`); lines.push(`Reflejos: ${calcs.ref}`);
    lines.push(`Fortaleza: ${calcs.fort}`); lines.push(`Voluntad: ${calcs.vol}`); lines.push(`Carácter: ${calcs.car}`);
    lines.push(`Resistencia: ${calcs.resistencia}   (Físico + Armadura + Escudo + 10 + Otros)`);
    lines.push(`Esquivar: ${calcs.esquivar}   (Destreza + Arm. Ligera/Esp. + Escudo Pequeño + 10 + Otros)`);
    lines.push(`Movimiento: ${calcs.mov}`);
    const H = calcs.health; lines.push(`Salud Base total: ${H.total} (roll d${H.die}=${H.roll}, base=${H.base})`);
    
    // Virtudes Generales separadas por categoría
    lines.push('--- Virtudes Generales ---');
    try{
      const data = window.KEPLER_VIRTUDES_GENERALES || {};
      const general = JSON.parse(localStorage.getItem('kepler_virtues_allocations')||'{}');
      const mapCat = {};
      Object.keys(data).forEach(cat => {
        (data[cat].items||[]).forEach(it => { mapCat[it.id] = {cat: data[cat].title, name: it.name}; });
      });
      const byCat = { 'Técnica': [], 'Erudición': [], 'Dominio': [] };
      Object.entries(general).forEach(([id, val]) => {
        if((val||0)>0){
          const meta = mapCat[id] || {cat:'Otras', name:id};
          if(!byCat[meta.cat]) byCat[meta.cat] = [];
          byCat[meta.cat].push(`${meta.name}: ${val}`);
        }
      });
      Object.keys(byCat).forEach(k => {
        lines.push(`${k}:`);
        if(byCat[k].length===0) lines.push('  (sin asignar)');
        else byCat[k].forEach(s => lines.push(`  - ${s}`));
      });
    }catch{}

    // Virtudes Lunares separadas por senda
    lines.push('--- Virtudes Lunares (Magia Azul) ---');
    try{
      const magSet = new Set((window.KEPLER_VIRTUDES||{}).magicas?.map(v=>v.id)||[]);
      const selected = JSON.parse(localStorage.getItem('kepler_lunar_virtues')||'[]');
      selected.filter(id=>magSet.has(id)).forEach(id => lines.push(`- ${(window.KEPLER_VIRTUDES.magicas.find(v=>v.id===id)||{}).nombre || id}`));
    }catch{}

    lines.push('--- Virtudes Lunares (Maldición Roja) ---');
    try{
      const malSet = new Set((window.KEPLER_VIRTUDES||{}).malditas?.map(v=>v.id)||[]);
      const selected = JSON.parse(localStorage.getItem('kepler_lunar_virtues')||'[]');
      selected.filter(id=>malSet.has(id)).forEach(id => lines.push(`- ${(window.KEPLER_VIRTUDES.malditas.find(v=>v.id===id)||{}).nombre || id}`));
    }catch{}

    // Dotes (si ya existen seleccionados)
    lines.push('--- Dotes ---');
    try{
      const mapD = new Map((window.KEPLER_DOTES||[]).map(d=>[d.id,d.nombre]));
      const dSel = JSON.parse(localStorage.getItem('kepler_dotes_selected')||'[]');
      dSel.forEach(id => lines.push(`- ${mapD.get(id)||id}`));
    }catch{
      (JSON.parse(localStorage.getItem('kepler_dotes_selected')||'[]')).forEach(id => lines.push(`- ${id}`));
    }
    const nivelElegido = parseInt(localStorage.getItem('kepler_character_level')||'1',10);
    lines.push(`Nivel del personaje: ${nivelElegido}`);
    const blob = new Blob([lines.join('\n')], {type:'text/plain'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'resumen_personaje.txt'; a.click(); URL.revokeObjectURL(a.href);
  }

  function saveNow(){
    const calcs = computeCalcs();
    const lvlMag = parseInt(localStorage.getItem('kepler_lvl_mag')||'0',10);
    const lvlMal = parseInt(localStorage.getItem('kepler_lvl_mal')||'0',10);
    const record = {
      name: prompt('Guardar personaje como:') || 'personaje',
      raceKey, raceName,
      attrsFinal,
      health: calcs.health,
      calcs,
      virtues: JSON.parse(localStorage.getItem('kepler_virtues_allocations')||'{}'),
      lunarVirtues: JSON.parse(localStorage.getItem('kepler_lunar_virtues')||'[]'),
      dotes: JSON.parse(localStorage.getItem('kepler_dotes_selected')||'[]'),
      lvlMag, lvlMal,
      savedAt: Date.now()
    };
    const arr = JSON.parse(localStorage.getItem('kepler_saved_characters')||'[]');
    arr.push(record);
    localStorage.setItem('kepler_saved_characters', JSON.stringify(arr));
    alert('Personaje guardado. Volviendo al menú.');
    window.location.href = 'menu.html';
  }

  if(exportBtn) exportBtn.addEventListener('click', () => exportNow());
  if(saveBtn) saveBtn.addEventListener('click', () => saveNow());
})();
