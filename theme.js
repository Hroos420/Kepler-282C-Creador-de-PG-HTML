// Kepler 282C — Theming por Raza (grimdark tecno‑medieval)
(function(){
  const DEFAULTS = {
    accent: getCSS('--accent') || '#3ef3ff',
    accent2: getCSS('--accent-2') || '#8e5bff',
    border: getCSS('--border') || '#1b2a3d',
    border2: getCSS('--border-2') || '#2b466b'
  };

  // Patrones para root (usan variables globales)
  const PATTERNS_GLOBAL = {
    humanos: [
      'repeating-linear-gradient(45deg, color-mix(in srgb, var(--accent) 10%, transparent) 0 2px, transparent 2px 12px)'
    ].join(','),
    elfen: [
      'repeating-radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 8%, transparent) 0 2px, transparent 2px 16px)'
    ].join(','),
    zwerges: [
      'repeating-linear-gradient(45deg, color-mix(in srgb, var(--accent-2) 8%, transparent) 0 1px, transparent 1px 10px)',
      'repeating-linear-gradient(135deg, color-mix(in srgb, var(--accent-2) 8%, transparent) 0 1px, transparent 1px 10px)'
    ].join(','),
    roboticos: [
      'repeating-linear-gradient(0deg, color-mix(in srgb, var(--accent) 6%, transparent) 0 1px, transparent 1px 12px)',
      'repeating-linear-gradient(90deg, color-mix(in srgb, var(--accent-2) 5%, transparent) 0 1px, transparent 1px 12px)',
      'radial-gradient(2px 2px at 12% 24%, color-mix(in srgb, var(--accent) 25%, transparent) 98%, transparent 100%)'
    ].join(','),
    ithariis: [
      'repeating-conic-gradient(from 0deg at 80% 20%, color-mix(in srgb, var(--accent-2) 14%, transparent) 0 5deg, transparent 5deg 15deg)'
    ].join(','),
    antropeltis: [
      'repeating-linear-gradient(75deg, color-mix(in srgb, var(--accent) 10%, transparent) 0 2px, transparent 2px 16px)'
    ].join(',')
  };

  const THEMES = {
    // Dorado solar + cobre (versátiles)
    humanos:   { accent:'#ffd166', accent2:'#ff8c42', border:'#3a2b14', border2:'#6a4b24' },
    // Cian azulado + verde élfico
    elfen:     { accent:'#49f6ff', accent2:'#74f7c8', border:'#0f2f3a', border2:'#19505e' },
    // Bronce rojo + ámbar forja
    zwerges:   { accent:'#ff6b4a', accent2:'#ffb84a', border:'#3a1f1a', border2:'#5a3328' },
    // Cian tecno + violeta núcleo
    roboticos: { accent:'#5ad6ff', accent2:'#b67bff', border:'#163046', border2:'#2d4d6b' },
    // Carmesí ritual + violeta oscuro
    ithariis:  { accent:'#ff3b6b', accent2:'#9b5bff', border:'#2e1220', border2:'#4a2136' },
    // Verde selva + lima bio
    antropeltis:{ accent:'#4de38c', accent2:'#b4ff5e', border:'#13321f', border2:'#225237' }
  };

  function getCSS(varName){
    try{ return getComputedStyle(document.documentElement).getPropertyValue(varName).trim(); }catch{ return null; }
  }

  function applyTheme(race){
    const t = (race && THEMES[race]) || DEFAULTS;
    const root = document.documentElement;
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--accent-2', t.accent2);
    root.style.setProperty('--border', t.border);
    root.style.setProperty('--border-2', t.border2);
    const patt = PATTERNS_GLOBAL[race];
    if(patt){ root.style.setProperty('--pattern-global', patt); }
    document.body && (document.body.dataset.race = race || '');
    return t;
  }

  // Auto-aplicar en carga si ya hay raza seleccionada
  try{
    const saved = localStorage.getItem('kepler_selected_race');
    if(saved) applyTheme(saved);
  }catch{}

  // Exponer API simple
  // Patrones para tarjetas (usan variables locales)
  function decorateCards(){
    try{
      const PATTERNS = {
        humanos: [
          'repeating-linear-gradient(45deg, color-mix(in srgb, var(--accent-local) 10%, transparent) 0 2px, transparent 2px 12px)'
        ].join(','),
        elfen: [
          'repeating-radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent-local) 8%, transparent) 0 2px, transparent 2px 16px)'
        ].join(','),
        zwerges: [
          'repeating-linear-gradient(45deg, color-mix(in srgb, var(--accent2-local) 8%, transparent) 0 1px, transparent 1px 10px)',
          'repeating-linear-gradient(135deg, color-mix(in srgb, var(--accent2-local) 8%, transparent) 0 1px, transparent 1px 10px)'
        ].join(','),
        roboticos: [
          'repeating-linear-gradient(0deg, color-mix(in srgb, var(--accent-local) 6%, transparent) 0 1px, transparent 1px 12px)',
          'repeating-linear-gradient(90deg, color-mix(in srgb, var(--accent2-local) 5%, transparent) 0 1px, transparent 1px 12px)',
          'radial-gradient(2px 2px at 12% 24%, color-mix(in srgb, var(--accent-local) 25%, transparent) 98%, transparent 100%)'
        ].join(','),
        ithariis: [
          'repeating-conic-gradient(from 0deg at 80% 20%, color-mix(in srgb, var(--accent2-local) 14%, transparent) 0 5deg, transparent 5deg 15deg)'
        ].join(','),
        antropeltis: [
          'repeating-linear-gradient(75deg, color-mix(in srgb, var(--accent-local) 10%, transparent) 0 2px, transparent 2px 16px)'
        ].join(',')
      };
      const cards = document.querySelectorAll('.race-card[data-race]');
      cards.forEach(card => {
        const r = card.dataset.race;
        const t = THEMES[r];
        if(!t) return;
        card.style.setProperty('--accent-local', t.accent);
        card.style.setProperty('--accent2-local', t.accent2);
        card.style.setProperty('--border-local', t.border);
        card.style.setProperty('--border2-local', t.border2);
        const patt = PATTERNS[r];
        if(patt){ card.style.setProperty('--pattern-local', patt); }
      });
    }catch{}
  }

  window.KeplerTheme = { apply: applyTheme, THEMES, decorateCards };

  // Decorar tarjetas al cargar DOM
  try{
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', decorateCards);
    }else{
      decorateCards();
    }
  }catch{}
})();
