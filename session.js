// Reseteo de sesión al abrir la app (por pestaña/ventana)
// Limpia datos de proceso anterior pero conserva los guardados
(function(){
  try{
    if(!sessionStorage.getItem('kepler_session_alive')){
      sessionStorage.setItem('kepler_session_alive','1');
      const preserve = new Set(['kepler_saved_characters']);
      const toRemove = [];
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(!k) continue;
        if(preserve.has(k)) continue;
        if(k.startsWith('kepler_')) toRemove.push(k);
      }
      toRemove.forEach(k => localStorage.removeItem(k));
    }
  }catch(e){ /* noop */ }
})();
