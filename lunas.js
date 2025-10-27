// Kepler 282C — Selección de Virtudes Lunares
(function(){
  const raceKey = localStorage.getItem('kepler_selected_race');
  const raceName = localStorage.getItem('kepler_selected_race_name');
  const attrsFinal = JSON.parse(localStorage.getItem('kepler_attributes_final') || 'null');
  if(!raceKey || !attrsFinal){ window.location.replace('menu.html'); return; }

  const quotaByRace = {
    humanos: 4,
    antropeltis: 3,
    ithariis: 2,
    elfen: 4,
    zwerges: 2,
    roboticos: 3
  };

  // Inicial: niveles lunares por raza (Nivel 1)
  let lvlMag = 0, lvlMal = 0;
  if(raceKey === 'humanos'){ lvlMag = 1; lvlMal = 1; }
  else if(raceKey === 'elfen'){ lvlMag = 1; lvlMal = 0; }
  else if(raceKey === 'ithariis'){ lvlMag = 0; lvlMal = 1; }
  else if(raceKey === 'zwerges'){ lvlMag = 0; lvlMal = 1; }
  else if(raceKey === 'antropeltis'){ /* senda luego */ }
  else if(raceKey === 'roboticos'){ /* núcleo luego */ }

  const quota = quotaByRace[raceKey] || 0;
  document.getElementById('race-picked').textContent = `Raza: ${raceName || raceKey}`;
  document.getElementById('attrs-picked').textContent = `Atributos finales — FIS ${attrsFinal.FIS} • DES ${attrsFinal.DES} • SOC ${attrsFinal.SOC} • MEN ${attrsFinal.MEN}`;
  document.getElementById('quota').textContent = `Puedes elegir ${quota} virtud(es) de Nivel 1 según tu raza.`;

  const lunarPickedEl = document.getElementById('lunar-picked');
  function updateLunarBanner(){ lunarPickedEl.textContent = `Nivel Mágico: ${lvlMag} | Nivel Maldito: ${lvlMal}`; }
  updateLunarBanner();

  // Path selection (Antropeltis / Robóticos)
  const choosePath = document.getElementById('choose-path');
  const pathStateKey = 'kepler_lunar_path';
  function needPath(){ return raceKey === 'antropeltis' || raceKey === 'roboticos'; }
  if(needPath()){
    choosePath.hidden = false;
    const savedPath = localStorage.getItem(pathStateKey);
    if(savedPath){ applyPath(savedPath); }

    choosePath.querySelectorAll('.race-card').forEach(btn => {
      btn.addEventListener('click', () => {
        choosePath.querySelectorAll('.race-card').forEach(b => b.setAttribute('aria-checked','false'));
        btn.setAttribute('aria-checked','true');
        const p = btn.dataset.path; applyPath(p); localStorage.setItem(pathStateKey, p);
        // Solo habilitar Siguiente; las listas están en la página final
      });
    });
  }

  function applyPath(p){
    if(raceKey === 'antropeltis'){
      lvlMag = (p === 'azul') ? 1 : 0;
      lvlMal = (p === 'roja') ? 1 : 0;
    } else if(raceKey === 'roboticos'){
      lvlMag = (p === 'azul') ? 1 : 0;
      lvlMal = (p === 'roja') ? 1 : 0;
    }
    updateLunarBanner();
  }

  // Humanos: ambos; el resto, según niveles
  function allowedTypes(){
    const types = [];
    if(lvlMag > 0) types.push('magicas');
    if(lvlMal > 0) types.push('malditas');
    return types;
  }

  // Preparar siguiente paso -> selección de virtudes lunares
  const nextBtn = document.getElementById('next-btn');
  if(nextBtn){
    const updateNextState = () => {
      const needs = needPath();
      nextBtn.disabled = needs && !(lvlMag>0 || lvlMal>0);
    };
    updateNextState();
    nextBtn.addEventListener('click', () => {
      const types = allowedTypes();
      if(types.length===0){ alert('Selecciona una senda lunar para continuar.'); return; }
      localStorage.setItem('kepler_lunar_allowed', JSON.stringify(types));
      localStorage.setItem('kepler_lvl_mag', String(lvlMag));
      localStorage.setItem('kepler_lvl_mal', String(lvlMal));
      window.location.href = 'virtudes_lunares.html';
    });
    // También actualiza cuando el usuario elige una senda
    const pathContainer = document.getElementById('choose-path');
    if(pathContainer){
      pathContainer.addEventListener('click', () => {
        updateNextState();
      });
    }
  }

  // (Sin listas aquí; la selección ocurre en la página siguiente)

  // Utilidades de cálculo se mueven a la página de selección final

  const backBtn = document.getElementById('back-btn'); if(backBtn){ backBtn.addEventListener('click', () => history.back()); }
})();
