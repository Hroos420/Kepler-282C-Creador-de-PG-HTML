// Kepler 282C — Selección de Armamento (aleatorio con 3 rerolls por pieza)
(function(){
  const raceKey = localStorage.getItem('kepler_selected_race');
  const raceName = localStorage.getItem('kepler_selected_race_name');
  const attrsFinal = JSON.parse(localStorage.getItem('kepler_attributes_final')||'null');
  const lvlMag = parseInt(localStorage.getItem('kepler_lvl_mag')||'0',10);
  const lvlMal = parseInt(localStorage.getItem('kepler_lvl_mal')||'0',10);
  if(!raceKey || !attrsFinal){ window.location.replace('menu.html'); return; }

  // Botón atrás
  const backBtn = document.getElementById('back-btn'); if(backBtn){ backBtn.addEventListener('click', () => history.back()); }

  // Parseo básico del texto crudo
  const RAW = (window.KEPLER_EQUIP_TEXT||'');
  const headers = [
    'Armas Cuerpo a Cuerpo (C.C)',
    'Armas a Distancia (A.D)',
    'Armaduras',
    'Escudos',
    'Baritas y Báculos',
    'Instrumentos de Interpretación'
  ];
  function idx(h){ return RAW.indexOf(h); }
  function sliceBetween(a,b){ const i=idx(a); const j=idx(b); if(i<0) return ''; return RAW.slice(i+(a.length), j>i?j:RAW.length); }
  const T_CC = sliceBetween('Armas Cuerpo a Cuerpo (C.C)','Armas a Distancia (A.D)');
  const T_AD = sliceBetween('Armas a Distancia (A.D)','Armaduras');
  const T_ARM = sliceBetween('Armaduras','Escudos');
  const T_ESC = sliceBetween('Escudos','Baritas y Báculos');
  const T_FOC = sliceBetween('Baritas y Báculos','Instrumentos de Interpretación');
  const T_INS = RAW.slice(idx('Instrumentos de Interpretación'));

  function parseBlocks(txt, cat){
    if(!txt) return [];
    const parts = txt.split(/\n(?=Nombre:\s)/g).filter(s=>/Nombre:\s/.test(s));
    return parts.map(p => buildItem(p.trim(), cat)).filter(Boolean);
  }

  function get(re, s){ const m = re.exec(s); return m? m[1].trim(): null; }
  function num(re, s){ const v = get(re,s); if(!v) return 0; const n = parseInt(v.replace(/[^0-9-]/g,''),10); return isNaN(n)?0:n; }

  function buildItem(texto, cat){
    const nombre = get(/Nombre:\s([^\n]+)/, texto) || 'Item';
    const tipoArma = get(/Tipo de Arma:\s([^\n]+)/, texto) || '';
    const rareza = get(/Rareza:\s([^\n]+)/, texto) || '';
    const bonusAtk = num(/Bonus al Ataque:\s*([+\-]?[0-9]+)/, texto);
    const bonusFoco = num(/Bonus al Ataque con Virtud Mágica o Maldita:\s*\+?([0-9]+)/, texto);
    const lunar = /\[MÁGICA\]/.test(nombre+texto) || /\+1\s*Azul/i.test(texto) ? 'magica' : (/\[MALDITA\]/.test(nombre+texto) || /\+1\s*Roja/i.test(texto) ? 'maldita' : null);
    const bonusPair = get(/Bonus a la Resistencia o a la Esquiva:\s*([^\n]+)/, texto) || '';
    const esq = num(/\+\s*([0-9]+)\s*Esquiva/, bonusPair);
    const res = /Resistencia/.test(bonusPair) ? (function(){
      const m = /\+\s*([0-9]+)\s*Resistencia/.exec(bonusPair); return m? parseInt(m[1],10): 0;
    })(): 0;
    const rd = num(/Reducción de Daño:\s*([0-9]+)/, texto);
    const penMov = num(/Penalizador al Movimiento:\s*([0-9]+)/, texto);
    const tipoEsc = get(/Tipo Escudo:\s*([^\n]+)/, texto) || '';
    const tipoArm = get(/Tipo Armadura:\s*([^\n]+)/, texto) || '';

    return {
      categoria: cat, nombre, texto, tipoArma, rareza, lunar, bonusAtk, bonusFoco,
      esq, res, rd, penMov, tipoEsc, tipoArm
    };
  }

  const CC = parseBlocks(T_CC, 'arma-cc');
  const AD = parseBlocks(T_AD, 'arma-ad');
  const ARM = parseBlocks(T_ARM, 'armadura');
  const ESC = parseBlocks(T_ESC, 'escudo');
  const FOC = parseBlocks(T_FOC, 'foco');
  const INS = parseBlocks(T_INS, 'instrumento');

  function highestAttrs(attrs){
    const entries = [['FIS',attrs.FIS],['DES',attrs.DES],['SOC',attrs.SOC],['MEN',attrs.MEN]];
    const max = Math.max(...entries.map(e=>e[1]));
    return entries.filter(e=>e[1]===max).map(e=>e[0]);
  }
  const top = highestAttrs(attrsFinal);
  const hasMag = (lvlMag||0) > 0;
  const hasMal = (lvlMal||0) > 0;

  function weaponUniverse(){
    const cats = [];
    if(top.includes('FIS')) cats.push(...CC);
    if(top.includes('DES')) cats.push(...AD);
    if(top.includes('MEN')) cats.push(...FOC);
    if(top.includes('SOC')) cats.push(...INS);
    // Si empata y no hubo match (por alguna razón), devolver todo
    const pool = cats.length ? cats : [...CC,...AD,...FOC,...INS];
    return pool.filter(it => {
      if(it.categoria==='arma-cc' || it.categoria==='arma-ad'){
        if(hasMag && !hasMal){ return it.lunar !== 'maldita'; }
        if(hasMal && !hasMag){ return it.lunar !== 'magica'; }
        return true; // humanos u otros con ambos
      }
      // Focos/Instrumentos
      if(it.categoria==='foco' || it.categoria==='instrumento'){
        if(hasMag && !hasMal){ return it.lunar !== 'maldita'; }
        if(hasMal && !hasMag){ return it.lunar !== 'magica'; }
        return true;
      }
      return true;
    });
  }

  function randPick(list){ if(!list.length) return null; return list[Math.floor(Math.random()*list.length)]; }

  // Rareza -> peso para ponderar
  function rarityWeight(r){
    const t = (r||'').toLowerCase();
    if(t.includes('obra maestra')) return 1;
    if(t.includes('exot')) return 2; // exótica/exótico
    if(t.includes('rara')) return 3;
    if(t.includes('poco com')) return 5;
    if(t.includes('pc')) return 5;
    if(t.includes('común') || t.includes('comun')) return 8;
    return 4;
  }
  function pickWeighted(pool){
    const total = pool.reduce((s,it)=> s + Math.max(1, rarityWeight(it.rareza)), 0);
    let t = Math.random()*total;
    for(const it of pool){
      t -= Math.max(1, rarityWeight(it.rareza));
      if(t<=0) return it;
    }
    return pool[pool.length-1];
  }
  function rollD20(){ return Math.floor(Math.random()*20)+1; }

  function pickByRule(pool){
    if(!pool || !pool.length) return null;
    // 1–2: Re-roll (sin consumir intentos UI); 3–20: ponderado por rareza
    for(let guard=0; guard<100; guard++){
      const d = rollD20();
      if(d<=2) continue;
      return pickWeighted(pool);
    }
    return pickWeighted(pool);
  }

  const NAME_WE = document.getElementById('weapon-name');
  const TEXT_WE = document.getElementById('weapon-text');
  const NAME_AR = document.getElementById('armor-name');
  const TEXT_AR = document.getElementById('armor-text');
  const NAME_SH = document.getElementById('shield-name');
  const TEXT_SH = document.getElementById('shield-text');

  const weBtn = document.getElementById('weapon-reroll');
  const arBtn = document.getElementById('armor-reroll');
  const shBtn = document.getElementById('shield-reroll');
  const weLeft = document.getElementById('weapon-left');
  const arLeft = document.getElementById('armor-left');
  const shLeft = document.getElementById('shield-left');

  const rrK = {
    we:'kepler_eq_rr_weapon', ar:'kepler_eq_rr_armor', sh:'kepler_eq_rr_shield'
  };
  const pickK = 'kepler_equipment';
  let picks = JSON.parse(localStorage.getItem(pickK)||'{}');

  function setPick(key, item){ picks[key]=item; localStorage.setItem(pickK, JSON.stringify(picks)); }

  function updateCard(elName, elText, item){
    if(!item){ elName.textContent='—'; elText.textContent='(sin resultados)'; return; }
    elName.textContent = `${item.nombre} • ${item.rareza||''}`.trim();
    elText.textContent = item.texto;
  }

  function leftStr(n){ return `Intentos restantes: ${Math.max(0, 3 - n)}`; }
  function setLeft(which){
    const n = parseInt(localStorage.getItem(rrK[which])||'0',10);
    if(which==='we') weLeft.textContent = leftStr(n);
    if(which==='ar') arLeft.textContent = leftStr(n);
    if(which==='sh') shLeft.textContent = leftStr(n);
  }

  // Primeras selecciones (si no existen)
  function ensureInitial(){
    if(!picks.weapon){ let u = weaponUniverse(); if(!u.length) u = [...CC,...AD,...FOC,...INS]; setPick('weapon', pickByRule(u)); }
    if(!picks.armor){ const u = ARM.length? ARM : []; setPick('armor', pickByRule(u)); }
    if(!picks.shield){ const u = ESC.length? ESC : []; setPick('shield', pickByRule(u)); }
  }
  ensureInitial(); picks = JSON.parse(localStorage.getItem(pickK)||'{}');

  updateCard(NAME_WE, TEXT_WE, picks.weapon);
  updateCard(NAME_AR, TEXT_AR, picks.armor);
  updateCard(NAME_SH, TEXT_SH, picks.shield);
  setLeft('we'); setLeft('ar'); setLeft('sh');

  function doReroll(which){
    const key = rrK[which]; let used = parseInt(localStorage.getItem(key)||'0',10);
    if(used>=3) return;
    used += 1; localStorage.setItem(key, String(used));
    if(which==='we'){ let u = weaponUniverse(); if(!u.length) u=[...CC,...AD,...FOC,...INS]; setPick('weapon', pickByRule(u)); updateCard(NAME_WE, TEXT_WE, picks.weapon); }
    if(which==='ar'){ const u = ARM; setPick('armor', pickByRule(u)); updateCard(NAME_AR, TEXT_AR, picks.armor); }
    if(which==='sh'){ const u = ESC; setPick('shield', pickByRule(u)); updateCard(NAME_SH, TEXT_SH, picks.shield); }
    setLeft(which);
  }

  if(weBtn) weBtn.addEventListener('click', () => doReroll('we'));
  if(arBtn) arBtn.addEventListener('click', () => doReroll('ar'));
  if(shBtn) shBtn.addEventListener('click', () => doReroll('sh'));

  const nextBtn = document.getElementById('next-btn'); if(nextBtn){ nextBtn.addEventListener('click', ()=> window.location.href='resumen.html'); }
})();
