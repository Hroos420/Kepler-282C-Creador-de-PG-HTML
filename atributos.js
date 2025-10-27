// Kepler 282C — Pantalla de atributos base y +1
(function(){
  const raceKey = localStorage.getItem('kepler_selected_race');
  const raceName = localStorage.getItem('kepler_selected_race_name');
  if(!raceKey){
    window.location.replace('index.html');
    return;
  }

  // Valores base Nivel 1 por raza (del documento)
  const BASES = {
    humanos: { FIS: 1, DES: 1, SOC: 2, MEN: 1 },
    elfen:    { FIS: 1, DES: 2, SOC: 2, MEN: 1 },
    zwerges:  { FIS: 2, DES: 1, SOC: 1, MEN: 1 },
    roboticos:{ FIS: 3, DES: 1, SOC: 1, MEN: 1 },
    ithariis: { FIS: 1, DES: 2, SOC: 1, MEN: 2 },
    antropeltis:{ FIS: 2, DES: 1, SOC: 1, MEN: 1 }
  };

  // Descripciones ampliadas de Atributos (capítulo de Atributos)
  const ATTR_INFO = {
    FIS: { name: 'Físico', desc: 'La fibra del cuerpo: fuerza, vigor y aguante. En mesa define tus golpes cuerpo a cuerpo, tu reserva de salud y cuánto resistes el mundo hostil (fatiga, venenos, peso, entornos extremos). Cuando rompes, levantas o simplemente sobrevives, Físico habla por ti. En Kepler, Físico es la marca de quien ha sido templado por la Luna Roja o por la intemperie: piel curtida, pulmones anchos, pasos que no ceden. Para tu personaje, es “tu ariete” y tu escudo al mismo tiempo. (Ataque C.C. = Físico + Raza/Nivel + arma + bonus).' },
    DES: { name: 'Destreza', desc: 'Agilidad, precisión y reflejos. Es tu puntería a distancia, tu capacidad de moverte en combate y de esquivar lo que debería haberte alcanzado. También gobierna muchas maniobras técnicas (trampas, lanzar, correr, colarte). En Kepler, Destreza es bailar entre chispas azules y sombras rojas; el cuerpo leyendo el peligro antes de que ocurra. En tu hoja, es tu línea de vida móvil: movimiento y esquiva (Esquivar/Reflejos se basan en Destreza). (Ataque A.D. = Destreza + Raza/Nivel + arma + bonus).' },
    SOC: { name: 'Social', desc: 'Carisma, presencia e influencia. Sirve para persuadir, mentir, intimidar, leer intenciones y, cuando la escena lo exige, para interpretar canto/oratoria que canaliza poder (Magia o Maldición). No es un “ataque” estándar: brilla en interacción y en interpretaciones potenciadas. En Kepler, Social es la voz que abre puertas en Nimbosia, calma colosos ithariis o hace pactos bajo la Luna Roja. Para tu personaje, es la herramienta que convierte encuentros en alianzas o motines; y el ancla de tu Carácter (defensa social).' },
    MEN: { name: 'Mental', desc: 'Inteligencia, percepción, estudio y voluntad. Aporta a iniciativa, resiste efectos mentales y dirige hechizos/estratagemas cuando van potenciados por Magia/Maldición. No es un “ataque” estándar: entra en juego cuando canalizas lo azul o lo rojo, o cuando investigas, recuerdas, lees símbolos y domas artefactos. En Kepler, Mental es ver el patrón detrás de las ruinas, sostener la mente ante susurros del Destructor y deducir los pliegues del cielo azul. Para tu personaje, es tu faro interior y tu Voluntad defensiva.' }
  };

  const racePickedEl = document.getElementById('race-picked');
  racePickedEl.textContent = `Raza: ${raceName || raceKey}`;

  const grid = document.getElementById('attr-grid');
  const confirmBtn = document.getElementById('confirm-btn');
  const previewBase = document.getElementById('preview-base');
  const previewFinal = document.getElementById('preview-final');

  const base = BASES[raceKey];
  if(!base){
    previewBase.textContent = 'No hay datos base para esta raza.';
    confirmBtn.disabled = true;
    return;
  }

  function baseString(vals){
    return `FIS ${vals.FIS} • DES ${vals.DES} • SOC ${vals.SOC} • MEN ${vals.MEN}`;
  }

  // Render tarjetas 2x2
  const order = ['FIS','DES','SOC','MEN'];
  let chosen = null;

  order.forEach(code => {
    const {name, desc} = ATTR_INFO[code];
    const val = base[code];
    const card = document.createElement('button');
    card.className = 'race-card';
    card.setAttribute('role','radio');
    card.setAttribute('aria-checked','false');
    card.dataset.attr = code;
    card.innerHTML = `
      <h3 class="race-name">${name} <span style="color:var(--muted); font-weight:600">(${code})</span></h3>
      <p class="race-desc" style="margin-bottom:8px">${desc}</p>
      <div style="display:flex; gap:10px; align-items:center; margin-top:auto">
        <span style="color:var(--muted)">Base:</span>
        <strong>${val}</strong>
        <span style="margin-left:8px; color:var(--muted)">Con +1 si eliges:</span>
        <strong>${val + 1}</strong>
      </div>
    `;
    card.addEventListener('click', () => select(card));
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); select(card);} 
    });
    card.tabIndex = 0;
    grid.appendChild(card);
  });

  function select(card){
    Array.from(grid.children).forEach(c => c.setAttribute('aria-checked','false'));
    card.setAttribute('aria-checked','true');
    chosen = card.dataset.attr;
    updatePreview();
    confirmBtn.disabled = false;
  }

  function computeFinal(){
    const result = {...base};
    if(chosen) result[chosen] = result[chosen] + 1;
    return result;
  }

  function updatePreview(){
    previewBase.textContent = `Base: ${baseString(base)}`;
    const fin = computeFinal();
    previewFinal.textContent = `Con +1: ${baseString(fin)}`;
  }

  updatePreview();

  // Botón Atrás (si existe)
  const backBtn = document.getElementById('back-btn');
  if(backBtn){ backBtn.addEventListener('click', () => history.back()); }

  confirmBtn.addEventListener('click', () => {
    if(!chosen) return;
    const finalVals = computeFinal();
    localStorage.setItem('kepler_attribute_bonus_choice', chosen);
    localStorage.setItem('kepler_attributes_base', JSON.stringify(base));
    localStorage.setItem('kepler_attributes_final', JSON.stringify(finalVals));
    // Reset tirada de salud para pantalla resumen
    localStorage.removeItem('kepler_health_roll');
    localStorage.removeItem('kepler_health_rerolls');
    window.location.href = 'virtudes.html';
  });
})();
