// Kepler 282C — Asignador de Virtudes (Técnica, Estudio, Dominio)
(function(){
  const raceKey = localStorage.getItem('kepler_selected_race');
  const raceName = localStorage.getItem('kepler_selected_race_name');
  const attrsFinal = JSON.parse(localStorage.getItem('kepler_attributes_final') || 'null');
  if(!raceKey || !attrsFinal){ window.location.replace('index.html'); return; }

  const BASE_POOL = { // Valor Base por Raza
    humanos: 12,
    antropeltis: 10,
    ithariis: 11,
    elfen: 12,
    zwerges: 11,
    roboticos: 9
  };

  // Dado por raza (Virtudes Técn./Est./Dom.) según el documento
  const VIRT_DIE = { humanos: 10, antropeltis: 8, ithariis: 10, elfen: 12, zwerges: 10, roboticos: 8 };
  const dieSides = VIRT_DIE[raceKey] || 0;
  // Persistimos una sola tirada para consistencia durante la sesión
  const rollKey = 'kepler_virtudes_die_roll';
  const rollRaceKey = 'kepler_virtudes_die_race';
  let savedRace = localStorage.getItem(rollRaceKey);
  let dieRoll = parseInt(localStorage.getItem(rollKey)||'0',10);
  function randDie(n){ return Math.floor(Math.random()*n)+1; }
  if(!dieSides){ dieRoll = 0; localStorage.removeItem(rollKey); localStorage.removeItem(rollRaceKey); }
  else{
    if(!dieRoll || savedRace !== raceKey){ dieRoll = randDie(dieSides); localStorage.setItem(rollKey, String(dieRoll)); localStorage.setItem(rollRaceKey, raceKey); }
  }

  let totalPoints = (BASE_POOL[raceKey] || 0) + attrsFinal.MEN + attrsFinal.SOC + (dieRoll||0);

  // Header info
  document.getElementById('race-picked').textContent = `Raza: ${raceName || raceKey}`;
  document.getElementById('attrs-picked').textContent = `Atributos finales — FIS ${attrsFinal.FIS} • DES ${attrsFinal.DES} • SOC ${attrsFinal.SOC} • MEN ${attrsFinal.MEN}`;
  const baseStr = BASE_POOL[raceKey] || 0;
  const dieStr = dieSides ? ` + Dado (d${dieSides})=${dieRoll}` : '';
  const formulaEl = document.getElementById('formula-details');
  const rerollBtn = document.getElementById('virt-reroll-btn');
  const rerollInfo = document.getElementById('virt-roll-info');
  const rerollKey = 'kepler_virtudes_die_rerolls';
  let rerolls = parseInt(localStorage.getItem(rerollKey)||'0',10);
  // Reset de rerolls si cambia la raza o no hay dado
  if(!dieSides || savedRace !== raceKey){ rerolls = 0; localStorage.setItem(rerollKey, '0'); }

  function updateFormulaUI(){
    const dieStrNow = dieSides ? ` + Dado (d${dieSides})=${dieRoll}` : '';
    if(formulaEl) formulaEl.textContent = `(${baseStr} base racial) + Mental (${attrsFinal.MEN}) + Social (${attrsFinal.SOC})${dieStrNow} = ${totalPoints} puntos totales`;
    if(rerollInfo){ const left = Math.max(0, 2 - rerolls); rerollInfo.textContent = `Intentos restantes: ${left}`; }
    if(rerollBtn){ rerollBtn.disabled = (!dieSides) || (rerolls >= 2); }
  }

  updateFormulaUI();

  // Virtudes data
  const VIRTUES = {
    tecnica: {
      title: 'Técnica',
      items: [
        {id:'acrobacias', name:'Acrobacias — Técnica — Destreza'},
        {id:'nadar', name:'Nadar — Técnica — Físico'},
        {id:'trepar', name:'Trepar — Técnica — Físico'},
        {id:'montar', name:'Montar — Técnica — Destreza'},
        {id:'volar-no-magico', name:'Volar (no mágico / monturas / artefactos) — Técnica — Destreza'},
        {id:'escapismo', name:'Escapismo — Técnica — Destreza'},
        {id:'inutilizar-mecanismos', name:'Inutilizar Mecanismos (cerraduras, trampas) — Técnica — Destreza'},
        {id:'juego-de-manos', name:'Juego de Manos — Técnica — Destreza'},
        {id:'sigilo', name:'Sigilo — Técnica — Destreza'},
        {id:'artesania', name:'Artesanía () — Técnica — Destreza o Físico (indicar especialidad)', note:true},
        {id:'forja-magica', name:'Forja Mágica — Técnica — Destreza o Físico'},
        {id:'forja-maldita', name:'Forja Maldita — Técnica — Destreza o Físico'}
      ]
    },
    estudio: {
      title: 'Erudición',
      items: [
        {id:'percepcion', name:'Percepción — Erudición — Mental'},
        {id:'supervivencia', name:'Supervivencia (rastrear, orientarse, clima) — Erudición — Mental'},
        {id:'tasacion', name:'Tasación — Erudición — Mental'},
        {id:'profesion', name:'Profesión () — Erudición — Mental', note:true},
        {id:'linguistica', name:'Lingüística (________) — Erudición — Mental', note:true},
        {id:'tacticas-combate', name:'Tácticas de Combate — Erudición — Mental'},
        {id:'saber-geografia', name:'Saber Geografía — Erudición — Mental'},
        {id:'saber-historia', name:'Saber Historia — Erudición — Mental'},
        {id:'saber-ingenieria', name:'Saber Ingeniería — Erudición — Mental'},
        {id:'saber-local', name:'Saber Local — Erudición — Mental'},
        {id:'saber-naturaleza', name:'Saber Naturaleza — Erudición — Mental'},
        {id:'saber-nobleza', name:'Saber Nobleza — Erudición — Mental'},
        {id:'saber-religion', name:'Saber Religión — Erudición — Mental'},
        {id:'saber-ruinas', name:'Saber Ruinas Ancestrales — Erudición — Mental'},
        {id:'saber-planos', name:'Saber Planos y Pliegues — Erudición — Mental'},
        {id:'saber-magico', name:'Saber Mágico (Luna Azul) — Erudición — Mental'},
        {id:'saber-maldito', name:'Saber Maldito (Luna Roja) — Erudición — Mental'},
        {id:'identificar-conducciones', name:'Identificar Conducciones (reconocer efectos, escuela, foco) — Erudición — Mental'},
        {id:'lectura-runas', name:'Lectura de Runas (sellos, glifos, matrices) — Erudición — Mental'},
        {id:'activar-artefacto-magico', name:'Activar Artefacto Mágico (protocolos, lecturas, secuencias no rituales) — Erudición — Mental'},
        {id:'activar-artefacto-maldito', name:'Activar Artefacto Maldito (protocolos, lecturas, secuencias no rituales) — Erudición — Mental'}
      ]
    },
    dominio: {
      title: 'Dominio',
      items: [
        {id:'averiguar-intenciones', name:'Averiguar Intenciones — Dominio — Social'},
        {id:'diplomacia', name:'Diplomacia — Dominio — Social'},
        {id:'disfrazarse', name:'Disfrazarse — Dominio — Social'},
        {id:'enganar', name:'Engañar — Dominio — Social'},
        {id:'intimidar', name:'Intimidar — Dominio — Social'},
        {id:'interpretar', name:'Interpretar (Canto / Oratoria / Danza / Liturgia) — Dominio — Social (si canaliza, añade Nivel Mágico/Maldito)'},
        {id:'trato-animales', name:'Trato con Animales — Dominio — Social'},
        {id:'conducir-artefacto', name:'Conducir Artefacto (ritual) — Dominio — Social (para reliquias/constructos que exigen sintonía o canto; si aplica, añade Nivel Mágico/Maldito)'}
      ]
    }
  };

  const grid = document.getElementById('virtues-grid');
  const pointsUsage = document.getElementById('points-usage');
  const pointsMsg = document.getElementById('points-msg');
  const btnNext = document.getElementById('virt-next');

  // Load saved state if any
  const saved = JSON.parse(localStorage.getItem('kepler_virtues_allocations') || '{}');

  let used = 0;
  function recalcUsed(){
    used = 0;
    for(const k in allocations){ used += allocations[k] || 0; }
    pointsUsage.textContent = `Puntos usados: ${used} / ${totalPoints}`;
    const remaining = totalPoints - used;
    pointsMsg.textContent = remaining > 0 ? `Te quedan ${remaining} puntos.` : 'Has asignado todos los puntos.';
    const ready = used === totalPoints;
    if(btnNext) btnNext.disabled = !ready;
  }

  const allocations = {};

  function makeRow(item){
    const row = document.createElement('div');
    row.className = 'virtue-row';
    row.dataset.id = item.id;
    const label = document.createElement('div');
    label.className = 'virtue-label';
    label.textContent = item.name;

    const controls = document.createElement('div');
    controls.className = 'stepper';

    const minus = document.createElement('button'); minus.className = 'step'; minus.textContent = '−';
    const input = document.createElement('input'); input.type = 'number'; input.min = 0; input.max = 3; input.value = 0; input.className = 'step-input'; input.dataset.id = item.id;
    const plus = document.createElement('button'); plus.className = 'step'; plus.textContent = '+';

    // Restore saved
    if(saved[item.id] != null){ input.value = saved[item.id]; allocations[item.id] = saved[item.id]; }

    controls.appendChild(minus); controls.appendChild(input); controls.appendChild(plus);

    const note = item.note ? (function(){ const n=document.createElement('input'); n.type='text'; n.placeholder='especialidad'; n.className='note-input'; n.value = localStorage.getItem('kepler_virt_note_'+item.id) || ''; n.addEventListener('change',()=>localStorage.setItem('kepler_virt_note_'+item.id,n.value)); return n; })() : null;

    const right = document.createElement('div'); right.style.display='flex'; right.style.alignItems='center'; right.style.gap='8px';
    if(note) right.appendChild(note);
    right.appendChild(controls);

    row.appendChild(label);
    row.appendChild(right);

    function clamp(n){ n = Math.max(0, Math.min(3, n)); return n; }

    function setValue(newVal){
      newVal = clamp(newVal);
      const current = allocations[item.id] || 0;
      const delta = newVal - current;
      if(delta > 0){
        if(used + delta > totalPoints){
          // Cap to remaining
          const remaining = totalPoints - used;
          newVal = current + Math.max(0, Math.min(remaining, delta));
        }
      }
      allocations[item.id] = newVal;
      input.value = newVal;
      localStorage.setItem('kepler_virtues_allocations', JSON.stringify(allocations));
      recalcUsed();
    }

    minus.addEventListener('click', () => setValue((allocations[item.id]||0) - 1));
    plus.addEventListener('click', () => setValue((allocations[item.id]||0) + 1));
    input.addEventListener('change', () => setValue(parseInt(input.value || '0',10)));

    return row;
  }

  function makeColumn(key){
    const col = document.createElement('div');
    col.className = 'virtue-col';
    const h = document.createElement('h3'); h.textContent = VIRTUES[key].title; col.appendChild(h);
    VIRTUES[key].items.forEach(it => col.appendChild(makeRow(it)));
    return col;
  }

  grid.appendChild(makeColumn('tecnica'));
  grid.appendChild(makeColumn('estudio'));
  grid.appendChild(makeColumn('dominio'));

  recalcUsed();

  function adjustAllocationsToTotal(){
    let sum = 0; for(const k in allocations){ sum += allocations[k]||0; }
    if(sum <= totalPoints) return;
    let delta = sum - totalPoints;
    const entries = Object.entries(allocations).sort((a,b)=> (b[1]||0) - (a[1]||0));
    for(const [id,val] of entries){
      if(delta<=0) break;
      const take = Math.min(val||0, delta);
      if(take>0){ allocations[id] = (val||0) - take; delta -= take; }
    }
    // Sincronizar UI e informar
    document.querySelectorAll('.step-input').forEach(inp => {
      const id = inp.dataset.id; if(!id) return; const v = allocations[id]||0; inp.value = v;
    });
    localStorage.setItem('kepler_virtues_allocations', JSON.stringify(allocations));
  }

  // Reroll del dado de Virtudes Generales (máx. 2)
  if(rerollBtn){
    rerollBtn.addEventListener('click', () => {
      if(!dieSides) return;
      if(rerolls >= 2) return;
      dieRoll = randDie(dieSides);
      rerolls += 1;
      localStorage.setItem(rollKey, String(dieRoll));
      localStorage.setItem(rollRaceKey, raceKey);
      localStorage.setItem(rerollKey, String(rerolls));
      totalPoints = (BASE_POOL[raceKey] || 0) + attrsFinal.MEN + attrsFinal.SOC + (dieRoll||0);
      adjustAllocationsToTotal();
      updateFormulaUI();
      recalcUsed();
    });
  }

  // Navegación y botones
  const backBtn = document.getElementById('back-btn');
  if(backBtn){ backBtn.addEventListener('click', () => history.back()); }

  // Continuar a selección de Virtudes Lunares
  if(btnNext){
    btnNext.addEventListener('click', () => {
      if(used !== totalPoints) return;
      window.location.href = 'lunas.html';
    });
  }
})();
