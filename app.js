// Kepler 282C - Lógica del selector de razas
(function(){
  const cards = Array.from(document.querySelectorAll('.race-card'));
  const selectionText = document.getElementById('selection-text');
  const continueBtn = document.getElementById('continue-btn');

  function selectCard(card){
    cards.forEach(c => c.setAttribute('aria-checked', String(c === card)));
    const race = card?.dataset.race || null;
    if(race){
      const name = card.querySelector('.race-name')?.textContent?.trim() || race;
      selectionText.textContent = 'Raza seleccionada: ' + name;
      continueBtn.disabled = false;
      localStorage.setItem('kepler_selected_race', race);
      localStorage.setItem('kepler_selected_race_name', name);
      try{ window.KeplerTheme && window.KeplerTheme.apply(race); }catch{}
    }else{
      selectionText.textContent = 'Ninguna raza seleccionada.';
      continueBtn.disabled = true;
      localStorage.removeItem('kepler_selected_race');
      localStorage.removeItem('kepler_selected_race_name');
    }
  }

  // Selección mediante clic o teclado
  cards.forEach(card => {
    card.addEventListener('click', () => selectCard(card));
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        selectCard(card);
      }
    });
    card.tabIndex = 0;
  });

  // Restaurar selección previa
  const saved = localStorage.getItem('kepler_selected_race');
  if(saved){
    const savedCard = cards.find(c => c.dataset.race === saved);
    if(savedCard) selectCard(savedCard);
  }

  const backBtn = document.getElementById('back-btn');
  if(backBtn){ backBtn.addEventListener('click', () => history.back()); }

  continueBtn.addEventListener('click', () => {
    const selected = cards.find(c => c.getAttribute('aria-checked') === 'true');
    const race = selected?.dataset.race;
    if(!race) return;
    window.location.href = 'atributos.html';
  });
})();