// Kepler 282C — Selección de Dotes (nivel 1: 2 dotes)
(function(){
  const raceKey = localStorage.getItem('kepler_selected_race');
  const raceName = localStorage.getItem('kepler_selected_race_name');
  const attrsFinal = JSON.parse(localStorage.getItem('kepler_attributes_final')||'null');
  const lvlMag = parseInt(localStorage.getItem('kepler_lvl_mag')||'0',10);
  const lvlMal = parseInt(localStorage.getItem('kepler_lvl_mal')||'0',10);
  let nivel = parseInt(localStorage.getItem('kepler_character_level')||'1',10);
  if(!raceKey || !attrsFinal){ window.location.replace('menu.html'); return; }
  if(!nivel){ nivel = 1; localStorage.setItem('kepler_character_level','1'); }

  // Header
  document.getElementById('race-picked').textContent = `Raza: ${raceName || raceKey}`;
  document.getElementById('attrs-picked').textContent = `Atributos — FIS ${attrsFinal.FIS} • DES ${attrsFinal.DES} • SOC ${attrsFinal.SOC} • MEN ${attrsFinal.MEN}`;
  const lunarPicked = document.getElementById('lunar-picked'); if(lunarPicked) lunarPicked.textContent = `Nivel Mágico: ${lvlMag} | Nivel Maldito: ${lvlMal}`;

  const quota = 2; // Nivel 1: 1 racial + 1 libre (total 2)
  document.getElementById('quota-picked').textContent = `Puedes elegir ${quota} dotes.`;

  // Virtudes Generales — calcular totales por categoría para requisitos como "Virtud afín 1+ (Técnica o Erudición)"
  const virtAlloc = JSON.parse(localStorage.getItem('kepler_virtues_allocations')||'{}');
  const VG = window.KEPLER_VIRTUDES_GENERALES || {};
  const mapCat = {}; Object.keys(VG).forEach(cat => (VG[cat].items||[]).forEach(it => mapCat[it.id]=cat));
  const virtTotals = { tecnica:0, estudio:0, dominio:0 };
  Object.entries(virtAlloc).forEach(([id,val]) => { const cat = mapCat[id]; if(cat && typeof val==='number') virtTotals[cat] += val; });

  const char = {
    nivel,
    raceKey,
    attrs: attrsFinal,
    lvlMag,
    lvlMal,
    virtTotals,
    hasDote: (id) => selected.has(id)
  };

  const grid = document.getElementById('dotes-grid');
  const countUsage = document.getElementById('count-usage');
  const searchInput = document.getElementById('search');
  const saveBtn = document.getElementById('save-btn');
  const exportBtn = document.getElementById('export-btn');

  // Fallback mínimo por si el catálogo no carga
  const FALLBACK_DOTES = [
    {id:'maestro-bloques', nombre:'Maestro de Bloques I', tipo:'General', req:(c)=> (c.nivel||1) >= 1, texto:'Reduce penalizador al segundo ataque del bloque a −3.'},
    {id:'prioridad-fluida', nombre:'Prioridad Fluida', tipo:'General', req:(c)=> (c.attrs?.SOC||0)>=2 || (c.attrs?.MEN||0)>=2, texto:'Intercambia iniciativa con un aliado al inicio.'},
    {id:'guardia-movil', nombre:'Guardia Móvil', tipo:'General', req:(c)=> (c.attrs?.DES||0)>=2, texto:'Combina Movimiento + Especial sin perder AO.'}
  ];
  let selected = new Set(JSON.parse(localStorage.getItem('kepler_dotes_selected')||'[]'));
  function setSelected(ids){ selected = new Set(ids); localStorage.setItem('kepler_dotes_selected', JSON.stringify(Array.from(selected))); }

  // Construir lista filtrada por requisitos
  function allowedList(){
    const all = ((window.KEPLER_DOTES && window.KEPLER_DOTES.length) ? window.KEPLER_DOTES : FALLBACK_DOTES) || [];
    function alignOk(d){
      const tipo = (d.tipo||'').toLowerCase();
      const hasAzul = tipo.includes('azul');
      const hasRoja = tipo.includes('roja');
      if(hasAzul && !hasRoja) return (lvlMag||0) > 0;
      if(hasRoja && !hasAzul) return (lvlMal||0) > 0;
      if(hasAzul && hasRoja) return (lvlMag||0) > 0 || (lvlMal||0) > 0;
      return true;
    }
    const list = all.filter(d => {
      try{ return alignOk(d) && (!d.req || d.req(char)); }catch{ return false; }
    });
    return list;
  }

  function matchesSearch(d){
    const q = (searchInput.value||'').trim().toLowerCase(); if(!q) return true;
    return (d.nombre||'').toLowerCase().includes(q) || (d.tipo||'').toLowerCase().includes(q);
  }

  function makeCard(d){
    const card = document.createElement('button');
    card.className = 'race-card';
    card.setAttribute('role','checkbox');
    card.setAttribute('aria-checked', selected.has(d.id)?'true':'false');
    card.innerHTML = `
      <h3 class=\"race-name\">${d.nombre}</h3>
      <div style=\"color:var(--muted)\">${d.tipo||''}</div>
      <div class=\"virt-long\" style=\"margin-top:6px\">${d.texto || d.beneficio || ''}</div>
    `;
    card.addEventListener('click', () => toggle(d.id));
    return card;
  }

  function toggle(id){
    if(selected.has(id)) selected.delete(id);
    else{
      if(selected.size >= quota){ alert('Has alcanzado el máximo de dotes.'); return; }
      selected.add(id);
    }
    localStorage.setItem('kepler_dotes_selected', JSON.stringify(Array.from(selected)));
    render();
  }

  let renderRetries = 0;
  function render(){
    grid.innerHTML = '';
    let base = (window.KEPLER_DOTES||[]);
    let list = allowedList().filter(matchesSearch);
    if(list.length === 0){ list = base.filter(matchesSearch); }
    if(list.length === 0 && renderRetries < 3){ renderRetries++; setTimeout(render, 50); return; }
    if(list.length === 0){
      const msg = document.createElement('div');
      msg.style.color = 'var(--muted)';
      msg.textContent = 'No hay dotes disponibles con tu configuración actual.';
      grid.appendChild(msg);
    } else {
      list.sort((a,b)=> (a.nombre||'').localeCompare(b.nombre||''));
      list.forEach(d => grid.appendChild(makeCard(d)));
    }
    countUsage.textContent = `Seleccionadas: ${selected.size} / ${quota}`;
    const ready = selected.size === quota; if(saveBtn) saveBtn.disabled = !ready; if(exportBtn) exportBtn.disabled = !ready; if(nextBtn) nextBtn.disabled = !ready;
  }

  if(searchInput){ searchInput.addEventListener('input', render); }
  const backBtn = document.getElementById('back-btn'); if(backBtn){ backBtn.addEventListener('click', ()=>history.back()); }

  // Botón siguiente: navegar a resumen
  if(nextBtn){
    nextBtn.addEventListener('click', () => {
      if(selected.size !== quota){ alert('Debes completar el cupo.'); return; }
      window.location.href = 'armamento.html';
    });
  }

  // Reutilizar cálculos de exportación/guardado del paso anterior
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
    const resistencia = attrsFinal.FIS + 10; // aproximado
    const esquivar = attrsFinal.DES + 10;
    return { atkCC, atkAD, ref, fort, vol, car, mov, resistencia, esquivar, health:{total: healthBase+(roll||0), base:healthBase, die:BASE.die, roll} };
  }

  function exportNow(){
    const calcs = computeCalcs();
    const names = new Map(); (window.KEPLER_DOTES||[]).forEach(d => names.set(d.id, d.nombre));
    const lines = [];
    lines.push(`Raza: ${raceName || raceKey}`);
    lines.push(`Atributos — FIS ${attrsFinal.FIS} | DES ${attrsFinal.DES} | SOC ${attrsFinal.SOC} | MEN ${attrsFinal.MEN}`);
    lines.push(`Niveles Lunares — Mágico: ${lvlMag} | Maldito: ${lvlMal}`);
    lines.push('--- Tiradas ---');
    lines.push(`C.C.: ${calcs.atkCC}`); lines.push(`A.D.: ${calcs.atkAD}`); lines.push(`Reflejos: ${calcs.ref}`);
    lines.push(`Fortaleza: ${calcs.fort}`); lines.push(`Voluntad: ${calcs.vol}`); lines.push(`Carácter: ${calcs.car}`);
    lines.push(`Resistencia: ${calcs.resistencia}`); lines.push(`Esquivar: ${calcs.esquivar}`);
    lines.push(`Movimiento: ${calcs.mov}`);
    const H = calcs.health; lines.push(`Salud Base total: ${H.total} (roll d${H.die}=${H.roll}, base=${H.base})`);

    // Virtudes generales
    try{
      const data = window.KEPLER_VIRTUDES_GENERALES || {};
      const general = JSON.parse(localStorage.getItem('kepler_virtues_allocations')||'{}');
      const titleById = {}; Object.keys(data).forEach(cat => (data[cat].items||[]).forEach(it => titleById[it.id] = {cat:data[cat].title, name:it.name}));
      const byCat = { 'Técnica': [], 'Erudición': [], 'Dominio': [] };
      Object.entries(general).forEach(([id,val]) => { if((val||0)>0){ const meta=titleById[id]||{cat:'Otras',name:id}; if(!byCat[meta.cat]) byCat[meta.cat]=[]; byCat[meta.cat].push(`${meta.name}: ${val}`); }});
      Object.keys(byCat).forEach(k => { lines.push(`${k}:`); if(byCat[k].length===0) lines.push('  (sin asignar)'); else byCat[k].forEach(s=>lines.push(`  - ${s}`)); });
    }catch{}

    // Virtudes lunares seleccionadas
    lines.push('--- Virtudes Lunares ---');
    try{
      const allV = window.KEPLER_VIRTUDES || {magicas:[], malditas:[]};
      const mapV = new Map([...(allV.magicas||[]), ...(allV.malditas||[])].map(v=>[v.id, v.nombre]));
      const chosen = JSON.parse(localStorage.getItem('kepler_lunar_virtues')||'[]');
      chosen.forEach(id => lines.push(`- ${mapV.get(id)||id}`));
    }catch{}

    // Dotes
    lines.push('--- Dotes ---');
    Array.from(selected).forEach(id => lines.push(`- ${names.get(id)||id}`));

  render();
})();
