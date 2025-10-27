// Kepler 282C — Menú principal
(function(){
  function clearSession(){
    const keys = [
      'kepler_selected_race','kepler_selected_race_name',
      'kepler_attributes_base','kepler_attributes_final','kepler_attribute_bonus_choice',
      'kepler_health_roll','kepler_health_rerolls',
      'kepler_virtues_allocations',
      // Lunares
      'kepler_lunar_allowed','kepler_lunar_virtues','kepler_lunar_path','kepler_lvl_mag','kepler_lvl_mal',
      // Dotes
      'kepler_dotes_selected', 'kepler_character_level'
    ];
    keys.forEach(k => localStorage.removeItem(k));
    // Borrar notas de virtudes (Técnica/Erudición/Dominio) sin tocar los guardados
    const toRemove = [];
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(k && k.startsWith('kepler_virt_note_')) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  }

  const savedKey = 'kepler_saved_characters';
  function getSaved(){ return JSON.parse(localStorage.getItem(savedKey) || '[]'); }

  const menuNew = document.getElementById('menu-new');
  const menuEdit = document.getElementById('menu-edit');
  const menuExport = document.getElementById('menu-export');
  const panel = document.getElementById('saved-panel');
  const list = document.getElementById('saved-list');
  const title = document.getElementById('saved-title');
  const btnCancel = document.getElementById('saved-cancel');
  const btnCont = document.getElementById('saved-continue');

  let mode = null; // 'edit' | 'export'
  let selectedIdx = -1;

  function renderSaved(){
    const arr = getSaved();
    list.innerHTML = '';
    if(arr.length === 0){
      list.innerHTML = '<div style="color:var(--muted)">No hay personajes guardados.</div>';
      btnCont.disabled = true;
      return;
    }
    arr.forEach((c, i) => {
      const row = document.createElement('div');
      row.className = 'saved-row';

      const left = document.createElement('div');
      left.className = 'saved-left';
      const radio = document.createElement('input'); radio.type='radio'; radio.name='saved'; radio.value=String(i);
      const name = document.createElement('span'); name.className='saved-name'; name.textContent = `${c.name || '(Sin nombre)'} — ${c.raceName || c.raceKey}`;
      const del = document.createElement('button'); del.className='back-btn'; del.style.position='static'; del.textContent='Eliminar';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        if(!confirm(`Eliminar "${c.name||'personaje'}"?`)) return;
        const current = getSaved();
        current.splice(i,1);
        localStorage.setItem(savedKey, JSON.stringify(current));
        renderSaved();
      });
      radio.addEventListener('change', () => { selectedIdx = i; btnCont.disabled = false; });
      left.appendChild(radio); left.appendChild(name); left.appendChild(del);

      const meta = document.createElement('span'); meta.className='saved-meta'; meta.textContent = new Date(c.savedAt||Date.now()).toLocaleString();

      row.appendChild(left);
      row.appendChild(meta);
      list.appendChild(row);
    });
  }

  menuNew.addEventListener('click', () => {
    clearSession();
    localStorage.setItem('kepler_mode','new');
    window.location.href = 'index.html';
  });

  function openSaved(m){
    mode = m; selectedIdx = -1; btnCont.disabled = true;
    title.textContent = m === 'edit' ? 'Selecciona un personaje para modificar (Virtudes)' : 'Selecciona un personaje para exportar';
    panel.hidden = false; renderSaved();
  }

  menuEdit.addEventListener('click', () => openSaved('edit'));
  menuExport.addEventListener('click', () => openSaved('export'));

  btnCancel.addEventListener('click', () => { panel.hidden = true; mode = null; });

  btnCont.addEventListener('click', () => {
    const arr = getSaved();
    if(selectedIdx < 0 || selectedIdx >= arr.length) return;
    const picked = arr[selectedIdx];
    if(mode === 'edit'){
      // Cargar datos del guardado y saltar a Virtudes
      clearSession();
      localStorage.setItem('kepler_mode','edit');
      localStorage.setItem('kepler_selected_race', picked.raceKey);
      localStorage.setItem('kepler_selected_race_name', picked.raceName || picked.raceKey);
      localStorage.setItem('kepler_attributes_final', JSON.stringify(picked.attrsFinal));
      localStorage.setItem('kepler_health_roll', String(picked.health?.roll || 0));
      localStorage.setItem('kepler_health_rerolls', String(picked.health?.rerolls || 0));
      localStorage.setItem('kepler_virtues_allocations', JSON.stringify(picked.virtues || {}));
      window.location.href = 'virtudes.html';
    }else if(mode === 'export'){
      // Descargar archivo
      downloadCharacter(picked);
    }
  });

  function downloadCharacter(char){
    const lines = [];
    lines.push(`Nombre: ${char.name || ''}`);
    lines.push(`Raza: ${char.raceName || char.raceKey}`);
    const A = char.attrsFinal || {};
    lines.push(`Atributos — FIS ${A.FIS||0} | DES ${A.DES||0} | SOC ${A.SOC||0} | MEN ${A.MEN||0}`);
    const calc = char.calcs || {};
    lines.push('--- Tiradas ---');
    lines.push(`C.C.: ${calc.atkCC||'-'}`);
    lines.push(`A.D.: ${calc.atkAD||'-'}`);
    lines.push(`Reflejos: ${calc.ref||'-'}`);
    lines.push(`Fortaleza: ${calc.fort||'-'}`);
    lines.push(`Voluntad: ${calc.vol||'-'}`);
    if(calc.resistencia!=null) lines.push(`Resistencia: ${calc.resistencia}`);
    if(calc.esquivar!=null) lines.push(`Esquivar: ${calc.esquivar}`);
    lines.push(`Movimiento: ${calc.mov||'-'}`);
    const H = char.health || {}; lines.push(`Salud Base total: ${H.total||'-'} (roll d${H.die||'?'}=${H.roll||'-'}, base=${H.base||'-'})`);

    // Niveles lunares (si existen)
    const lvlMag = char.lvlMag!=null ? char.lvlMag : (parseInt(localStorage.getItem('kepler_lvl_mag')||'0',10));
    const lvlMal = char.lvlMal!=null ? char.lvlMal : (parseInt(localStorage.getItem('kepler_lvl_mal')||'0',10));
    lines.push(`Niveles Lunares — Mágico: ${lvlMag||0} | Maldito: ${lvlMal||0}`);

    // Virtudes generales agrupadas por categoría
    lines.push('--- Virtudes Generales ---');
    try{
      const data = window.KEPLER_VIRTUDES_GENERALES || {};
      const general = char.virtues || {};
      const mapCat = {};
      Object.keys(data).forEach(cat => (data[cat].items||[]).forEach(it => mapCat[it.id] = {cat:data[cat].title, name:it.name}));
      const byCat = { 'Técnica': [], 'Erudición': [], 'Dominio': [] };
      Object.entries(general).forEach(([id,val]) => { if((val||0)>0){ const meta = mapCat[id]||{cat:'Otras',name:id}; if(!byCat[meta.cat]) byCat[meta.cat]=[]; byCat[meta.cat].push(`${meta.name}: ${val}`); }});
      Object.keys(byCat).forEach(k => { lines.push(`${k}:`); if(byCat[k].length===0) lines.push('  (sin asignar)'); else byCat[k].forEach(s=>lines.push(`  - ${s}`)); });
    }catch{}

    // Virtudes lunares seleccionadas por grupo
    lines.push('--- Virtudes Lunares (Magia Azul) ---');
    try{
      const magSet = new Set((window.KEPLER_VIRTUDES||{}).magicas?.map(v=>v.id)||[]);
      (char.lunarVirtues||[]).filter(id=>magSet.has(id)).forEach(id => {
        const v = (window.KEPLER_VIRTUDES.magicas||[]).find(x=>x.id===id);
        lines.push(`- ${(v&&v.nombre)||id}`);
      });
    }catch{}

    lines.push('--- Virtudes Lunares (Maldición Roja) ---');
    try{
      const malSet = new Set((window.KEPLER_VIRTUDES||{}).malditas?.map(v=>v.id)||[]);
      (char.lunarVirtues||[]).filter(id=>malSet.has(id)).forEach(id => {
        const v = (window.KEPLER_VIRTUDES.malditas||[]).find(x=>x.id===id);
        lines.push(`- ${(v&&v.nombre)||id}`);
      });
    }catch{}

    // Dotes seleccionados
    lines.push('--- Dotes ---');
    try{
      const mapD = new Map((window.KEPLER_DOTES||[]).map(d=>[d.id,d.nombre]));
      (char.dotes||[]).forEach(id => { lines.push(`- ${mapD.get(id)||id}`); });
    }catch{
      (char.dotes||[]).forEach(id => lines.push(`- ${id}`));
    }

    const blob = new Blob([lines.join('\n')], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(char.name||'personaje')}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
})();
