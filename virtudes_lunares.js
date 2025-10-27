// Selección final de virtudes lunares con tabs para humanos
(function(){
  const raceKey = localStorage.getItem('kepler_selected_race');
  const raceName = localStorage.getItem('kepler_selected_race_name');
  const attrsFinal = JSON.parse(localStorage.getItem('kepler_attributes_final')||'null');
  let allowed = JSON.parse(localStorage.getItem('kepler_lunar_allowed')||'[]');
  const lvlMag = parseInt(localStorage.getItem('kepler_lvl_mag')||'0',10);
  const lvlMal = parseInt(localStorage.getItem('kepler_lvl_mal')||'0',10);
  if(!allowed || allowed.length===0){
    allowed = [];
    if(lvlMag>0) allowed.push('magicas');
    if(lvlMal>0) allowed.push('malditas');
  }
  if(!raceKey || !attrsFinal){ window.location.replace('menu.html'); return; }

  const quotaByRace = { humanos:4, antropeltis:3, ithariis:2, elfen:4, zwerges:2, roboticos:3 };
  const quota = quotaByRace[raceKey]||0;

  document.getElementById('race-picked').textContent = `Raza: ${raceName || raceKey}`;
  document.getElementById('attrs-picked').textContent = `Atributos — FIS ${attrsFinal.FIS} • DES ${attrsFinal.DES} • SOC ${attrsFinal.SOC} • MEN ${attrsFinal.MEN}`;
  document.getElementById('quota-picked').textContent = `Puedes elegir ${quota} virtud(es).`;
  const lunarPicked = document.getElementById('lunar-picked');
  if(lunarPicked){ lunarPicked.textContent = `Nivel Mágico: ${lvlMag} | Nivel Maldito: ${lvlMal}`; }

  const listsRoot = document.getElementById('virt-lists');
  const countUsage = document.getElementById('count-usage');
  const tabs = document.getElementById('tabs');
  const tabMag = document.getElementById('tab-mag');
  const tabMal = document.getElementById('tab-mal');

  let currentType = allowed.includes('magicas') ? 'magicas' : 'malditas';
  if(allowed.length > 1){ tabs.style.display = 'flex'; }

  if(tabMag) tabMag.addEventListener('click', () => { currentType='magicas'; render(); });
  if(tabMal) tabMal.addEventListener('click', () => { currentType='malditas'; render(); });

  let selected = new Set(JSON.parse(localStorage.getItem('kepler_lunar_virtues')||'[]'));
  // Limpiar selección previa si no corresponde a la senda actual o excede el cupo
  (function sanitizeSelection(){
    const all = window.KEPLER_VIRTUDES || {magicas:[], malditas:[]};
    const allowedList = [];
    if(allowed.includes('magicas')) allowedList.push(...(all.magicas||[]));
    if(allowed.includes('malditas')) allowedList.push(...(all.malditas||[]));
    const allowedIds = new Set(allowedList.map(v=>v.id));
    const filtered = Array.from(selected).filter(id=>allowedIds.has(id));
    if(filtered.length > quota){ selected = new Set(); }
    else selected = new Set(filtered);
    localStorage.setItem('kepler_lunar_virtues', JSON.stringify(Array.from(selected)));
  })();

  function computePreview(virt, type){
    const baseAttr = attrsFinal[virt.raiz];
    const lunar = (type==='magicas')? lvlMag : lvlMal;
    return { baseAttr, lunar, total: baseAttr + lunar };
  }

  function makeCard(v, type){
    const {baseAttr, lunar, total} = computePreview(v, type);
    const card = document.createElement('button');
    card.className = 'race-card';
    card.setAttribute('role','checkbox');
    card.setAttribute('aria-checked', selected.has(v.id)?'true':'false');
    card.innerHTML = `
      <h3 class="race-name">${v.nombre}</h3>
      <div class="virt-long">${v.full || v.desc || ''}</div>
      <div style="margin-top:6px; color:var(--muted)"><em>${v.formula}</em></div>
      <div style="margin-top:6px"><strong>Previsualización:</strong> ${v.raiz} (${baseAttr}) + Nivel ${type==='magicas'?'Mágico':'Maldito'} (${lunar}) = <strong>${total}</strong> (sin arma/otros)</div>
    `;
    card.addEventListener('click', () => toggle(v.id));
    return card;
  }

  function toggle(id){
    if(selected.has(id)) selected.delete(id);
    else{
      if(selected.size >= quota){ alert('Has alcanzado el máximo de virtudes.'); return; }
      selected.add(id);
    }
    localStorage.setItem('kepler_lunar_virtues', JSON.stringify(Array.from(selected)));
    render();
  }

  function render(){
    listsRoot.innerHTML='';
    const all = window.KEPLER_VIRTUDES || {magicas:[], malditas:[]};
    const toShow = (allowed.length>1)? (all[currentType]||[]) : (all[allowed[0]]||[]);
    const col = document.createElement('div');
    col.className='virtue-col';
    const h = document.createElement('h3');
    h.textContent = (currentType==='magicas')? 'Mágicas (Luna Azul)':'Malditas (Luna Roja)';
    col.appendChild(h);
    const grid = document.createElement('div'); grid.className='cards-grid';
    toShow.forEach(v=> grid.appendChild(makeCard(v, (currentType || allowed[0]))));
    col.appendChild(grid); listsRoot.appendChild(col);
    countUsage.textContent = `Seleccionadas: ${selected.size} / ${quota}`;
    const ready = selected.size === quota;
    if(saveBtn) saveBtn.disabled = !ready;
    if(exportBtn) exportBtn.disabled = !ready;
    if(toDotesBtn) toDotesBtn.disabled = !ready;
  }

  const backBtn = document.getElementById('back-btn'); if(backBtn){ backBtn.addEventListener('click', ()=>history.back()); }

  const saveBtn = document.getElementById('save-btn');
  const exportBtn = document.getElementById('export-btn');
  const toDotesBtn = document.getElementById('to-dotes');

  function computeCalcs(){
    const RACE_BASES = {
      humanos:{cc:1,ad:1,ref:2,fort:2,vol:2,car:1,salud:15,mov:13,die:8},
      elfen:{cc:1,ad:2,ref:3,fort:1,vol:2,car:2,salud:10,mov:17,die:6},
      zwerges:{cc:2,ad:1,ref:1,fort:3,vol:2,car:1,salud:20,mov:10,die:12},
      roboticos:{cc:2,ad:1,ref:3,fort:1,vol:1,car:3,salud:18,mov:11,die:10},
      ithariis:{cc:1,ad:2,ref:3,fort:1,vol:2,car:1,salud:14,mov:15,die:8},
      antropeltis:{cc:2,ad:2,ref:2,fort:2,vol:2,car:2,salud:17,mov:14,die:10}
    };
    const BASE = RACE_BASES[raceKey];
    const atkCC = attrsFinal.FIS + BASE.cc; const atkAD = attrsFinal.DES + BASE.ad;
    const ref = attrsFinal.DES + BASE.ref; const fort = attrsFinal.FIS + BASE.fort;
    const vol = attrsFinal.MEN + BASE.vol; const car = attrsFinal.SOC + BASE.car;
    const mov = BASE.mov + attrsFinal.DES; const roll = parseInt(localStorage.getItem('kepler_health_roll')||'0',10);
    const healthBase = BASE.salud + attrsFinal.FIS;
    const resistencia = attrsFinal.FIS + 10; // Armadura/Escudo/Otros pendientes
    const esquivar = attrsFinal.DES + 10; // Armadura ligera/Escudo pequeño/Otros pendientes
    return { atkCC, atkAD, ref, fort, vol, car, mov, resistencia, esquivar, health:{total: healthBase+(roll||0), base:healthBase, die:BASE.die, roll} };
  }

  function exportNow(){
    const calcs = computeCalcs();
    const names = new Map();
    const all = window.KEPLER_VIRTUDES || {magicas:[], malditas:[]};
    [...(all.magicas||[]), ...(all.malditas||[])].forEach(v => names.set(v.id, v.nombre));
    const lines = [];
    lines.push(`Raza: ${raceName || raceKey}`);
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
    const magSet = new Set((window.KEPLER_VIRTUDES||{}).magicas?.map(v=>v.id)||[]);
    Array.from(selected).filter(id=>magSet.has(id)).forEach(id => lines.push(`- ${(window.KEPLER_VIRTUDES.magicas.find(v=>v.id===id)||{}).nombre || id}`));

    lines.push('--- Virtudes Lunares (Maldición Roja) ---');
    const malSet = new Set((window.KEPLER_VIRTUDES||{}).malditas?.map(v=>v.id)||[]);
    Array.from(selected).filter(id=>malSet.has(id)).forEach(id => lines.push(`- ${(window.KEPLER_VIRTUDES.malditas.find(v=>v.id===id)||{}).nombre || id}`));

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
    const record = {
      name: prompt('Guardar personaje como:') || 'personaje',
      raceKey, raceName,
      attrsFinal,
      health: calcs.health,
      calcs,
      virtues: JSON.parse(localStorage.getItem('kepler_virtues_allocations')||'{}'),
      lunarVirtues: Array.from(selected),
      lvlMag, lvlMal,
      savedAt: Date.now()
    };
    const arr = JSON.parse(localStorage.getItem('kepler_saved_characters')||'[]');
    arr.push(record);
    localStorage.setItem('kepler_saved_characters', JSON.stringify(arr));
    alert('Personaje guardado. Volviendo al menú.');
    window.location.href = 'menu.html';
  }

  if(exportBtn) exportBtn.addEventListener('click', () => { if(selected.size!==quota){alert('Debes completar el cupo.');return;} exportNow(); });
  if(saveBtn) saveBtn.addEventListener('click', () => { if(selected.size!==quota){alert('Debes completar el cupo.');return;} saveNow(); });
  if(toDotesBtn) toDotesBtn.addEventListener('click', () => {
    if(selected.size!==quota){ alert('Debes completar el cupo.'); return; }
    // Asegurar nivel por defecto
    if(!localStorage.getItem('kepler_character_level')) localStorage.setItem('kepler_character_level', '1');
    window.location.href = 'dotes.html';
  });

  render();
})();
