const ATTRIBUTE_LABELS = {
  FIS: "Fisico",
  DES: "Destreza",
  SOC: "Social",
  MEN: "Mental"
};

const STEP_LABELS = {
  1: "Identidad",
  2: "Raza y luna",
  3: "Punto extra",
  4: "Virtudes generales",
  5: "Virtudes lunares",
  6: "Dotes",
  7: "Orientacion ofensiva",
  8: "Equipo y vida",
  9: "Resumen"
};

export function renderApp(state) {
  if (state.loading) {
    return `
      <div class="loading-screen">
        <div class="loading-card">
          <span class="eyebrow">Kepler-282C</span>
          <h1>Cargando catalogos y persistencia local</h1>
          <p>Preparando reglas, personajes guardados y la vista previa del creador.</p>
        </div>
      </div>
    `;
  }

  if (!state.preview) {
    return `
      <div class="loading-screen">
        <div class="loading-card">
          <span class="eyebrow">Kepler-282C</span>
          <h1>No se pudo construir la vista previa</h1>
          <p>Revisa el mensaje de error y vuelve a cargar la aplicacion.</p>
        </div>
      </div>
    `;
  }

  const summary = state.preview.summary;
  const validations = state.preview.validations;
  const currentStep = state.draft.ui.step;

  return `
    <div class="app-shell">
      <aside class="library-panel">
        ${renderLibrary(state)}
      </aside>

      <main class="workspace">
        ${renderTopbar(state)}
        ${renderProgress(state)}
        ${renderStatusStrip(state)}

        <div class="content-grid">
          <section class="step-panel">
            ${renderStepHeader(currentStep, summary)}
            ${renderStepContent(currentStep, state)}
            ${renderFooterNav(currentStep)}
          </section>

          <aside class="summary-panel">
            ${renderLiveSummary(summary, validations, state)}
          </aside>
        </div>
      </main>
    </div>
  `;
}

function renderTopbar(state) {
  return `
    <header class="hero">
      <div>
        <span class="eyebrow">Creador de Personajes</span>
        <h1>Kepler-282C</h1>
        <p>Reglas centralizadas, randomizacion filtrada y persistencia local en SQLite.</p>
      </div>

      <div class="hero-actions">
        <label class="toggle">
          <input type="checkbox" ${state.autosaveEnabled ? "checked" : ""} data-field="settings.autosave" />
          <span>Autosave</span>
        </label>
        <button class="ghost-button" data-action="new-character">Nuevo</button>
        <button class="ghost-button" data-action="clear-autosave">Limpiar autosave</button>
        <button class="primary-button" data-action="export-current">Exportar JSON</button>
      </div>
    </header>
  `;
}

function renderProgress(state) {
  const steps = state.preview.validations.steps;
  return `
    <nav class="progress-strip" aria-label="Progreso del creador">
      ${steps
        .map((step) => {
          const active = step.id === state.draft.ui.step;
          const status = step.valid ? "is-valid" : "is-invalid";
          return `
            <button class="step-chip ${active ? "is-active" : ""} ${status}" data-action="go-step" data-step="${step.id}">
              <span class="step-number">${step.id}</span>
              <span>${escapeHtml(step.title)}</span>
            </button>
          `;
        })
        .join("")}
    </nav>
  `;
}

function renderStatusStrip(state) {
  const autosave = state.autosaveMeta;
  return `
    <section class="status-strip">
      <div>
        <strong>${state.editingCharacterId ? "Editando guardado" : "Ficha nueva"}</strong>
        <span>${autosave?.updatedAt ? `Autosave: ${formatDate(autosave.updatedAt)}` : "Sin autosave persistido"}</span>
      </div>
      <div class="message-stack">
        ${state.message ? `<div class="message message--${escapeHtml(state.message.type)}">${escapeHtml(state.message.text)}</div>` : ""}
      </div>
    </section>
  `;
}

function renderLibrary(state) {
  return `
    <div class="panel-block">
      <div class="panel-header">
        <div>
          <span class="eyebrow">Repositorio local</span>
          <h2>Personajes</h2>
        </div>
        <div class="panel-actions">
          <button class="ghost-button" data-action="new-character">Nuevo</button>
          <button class="ghost-button" data-action="open-import">Importar</button>
        </div>
      </div>

      ${state.characters.length === 0 ? `<p class="muted">No hay personajes guardados todavia.</p>` : ""}

      <div class="character-list">
        ${state.characters
          .map(
            (entry) => `
              <article class="character-card ${entry.id === state.editingCharacterId ? "is-current" : ""}">
                <div>
                  <strong>${escapeHtml(entry.name)}</strong>
                  <p>${escapeHtml(entry.identity.raceName)} &middot; Nivel ${entry.level}</p>
                  <span>${formatDate(entry.updatedAt)}</span>
                </div>
                <div class="card-actions">
                  <button class="ghost-button" data-action="load-character" data-id="${entry.id}">Editar</button>
                  <button class="ghost-button" data-action="duplicate-character" data-id="${entry.id}">Duplicar</button>
                  <button class="ghost-button" data-action="export-character" data-id="${entry.id}">Exportar</button>
                  <button class="ghost-button danger" data-action="delete-character" data-id="${entry.id}">Eliminar</button>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderStepHeader(step, summary) {
  return `
    <header class="step-header">
      <div>
        <span class="eyebrow">Paso ${step}</span>
        <h2>${escapeHtml(STEP_LABELS[step])}</h2>
      </div>
      <div class="identity-pill">
        <strong>${escapeHtml(summary.identity.name)}</strong>
        <span>${escapeHtml(summary.identity.raceName)}</span>
      </div>
    </header>
  `;
}

function renderStepContent(step, state) {
  const summary = state.preview.summary;

  switch (step) {
    case 1:
      return renderIdentityStep(state);
    case 2:
      return renderRaceConfigStep(summary, state);
    case 3:
      return renderExtraPointStep(summary);
    case 4:
      return renderGeneralVirtuesStep(summary);
    case 5:
      return renderLunarVirtuesStep(summary);
    case 6:
      return renderDotesStep(summary);
    case 7:
      return renderOffensiveOrientationStep(summary);
    case 8:
      return renderEquipmentAndHealthStep(summary);
    case 9:
      return renderFinalSummaryStep(state);
    default:
      return "";
  }
}

function renderIdentityStep(state) {
  const activeRace = resolveActiveRace(state);
  const confirmedRace = state.catalogs.races.find((race) => race.id === state.draft.raceId) || null;
  const isConfirmed = confirmedRace?.id === activeRace?.id;
  const style = `--race-accent:${escapeHtml(activeRace?.themeAccent || "#5fd6ff")}; --race-accent-secondary:${escapeHtml(
    activeRace?.themeAccentSecondary || "#87f5de"
  )};`;

  return `
    <div class="step-layout">
      <section class="race-stage" style="${style}">
        <aside class="race-selector-rail">
          <div class="race-selector-head">
            <span class="eyebrow">Linajes jugables</span>
            <h3>Explora una identidad antes de confirmarla</h3>
            <p>La columna lateral cambia la vista activa. El panel central muestra la raza que estas contemplando; confirmar fija el linaje para el resto del flujo.</p>
          </div>

          <div class="race-selector-list" role="tablist" aria-label="Razas jugables de Kepler-282C" aria-orientation="vertical">
            ${state.catalogs.races
              .map((race) => {
                const isActive = race.id === activeRace?.id;
                const isCurrent = race.id === confirmedRace?.id;
                return `
                  <button
                    id="race-tab-${race.id}"
                    class="race-tab ${isActive ? "is-active" : ""} ${isCurrent ? "is-confirmed" : ""}"
                    data-action="activate-race"
                    data-race="${race.id}"
                    role="tab"
                    aria-selected="${isActive ? "true" : "false"}"
                    aria-controls="race-panel-active"
                    tabindex="${isActive ? "0" : "-1"}"
                  >
                    <span class="race-tab-topline">
                      <span class="race-tab-name">${escapeHtml(race.name)}</span>
                      ${isCurrent ? `<span class="chip chip--ok">Confirmada</span>` : ""}
                    </span>
                    <strong>${escapeHtml(race.loreTitle || race.title || race.name)}</strong>
                    <p>${escapeHtml(race.loreHook || race.description)}</p>
                    <span class="race-tab-meta">${escapeHtml(race.moonAccessLabel || race.description)}</span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </aside>

        <section
          id="race-panel-active"
          class="race-hero-panel"
          role="tabpanel"
          aria-labelledby="race-tab-${activeRace.id}"
          aria-live="polite"
        >
          <div class="race-hero-copy">
            <div class="chip-row">
              <span class="chip">${escapeHtml(activeRace.loreTitle || activeRace.title || activeRace.name)}</span>
              <span class="chip">${escapeHtml(activeRace.moonAccessLabel || "Acceso lunar")}</span>
              <span class="chip">${escapeHtml(activeRace.healthDie || "-")}</span>
            </div>
            <h3>${escapeHtml(activeRace.name)}</h3>
            <p class="race-hero-hook">${escapeHtml(activeRace.loreHook || activeRace.description)}</p>
            <p class="race-hero-summary">${escapeHtml(activeRace.loreSummary || activeRace.description)}</p>

            <div class="race-identity-grid">
              <article class="race-info-card">
                <span class="eyebrow">Identidad de raza</span>
                <strong>${escapeHtml(activeRace.keyIdentity || activeRace.description)}</strong>
                <p>${escapeHtml((activeRace.notes || []).join(" "))}</p>
              </article>

              <article class="race-info-card">
                <span class="eyebrow">Origenes y centros</span>
                <strong>${escapeHtml((activeRace.citiesOrOrigins || []).join(" | ") || "Sin registro")}</strong>
                <p>${escapeHtml(activeRace.title || activeRace.description)}</p>
              </article>
            </div>

            <div class="race-stat-ribbon" aria-label="Atributos base y datos raciales">
              <div class="race-stat-pill"><span>FIS</span><strong>${activeRace.baseAttributes.FIS}</strong></div>
              <div class="race-stat-pill"><span>DES</span><strong>${activeRace.baseAttributes.DES}</strong></div>
              <div class="race-stat-pill"><span>SOC</span><strong>${activeRace.baseAttributes.SOC}</strong></div>
              <div class="race-stat-pill"><span>MEN</span><strong>${activeRace.baseAttributes.MEN}</strong></div>
              <div class="race-stat-pill"><span>Salud</span><strong>${activeRace.healthBase}</strong></div>
              <div class="race-stat-pill"><span>Mov</span><strong>${activeRace.movementBase}</strong></div>
            </div>

            <div class="race-confirm-bar">
              <div class="race-confirm-status">
                <span class="status-badge status-badge--active">Vista activa: ${escapeHtml(activeRace.name)}</span>
                <span class="status-badge ${confirmedRace ? "status-badge--confirmed" : "status-badge--pending"}">
                  ${confirmedRace ? `Raza confirmada: ${escapeHtml(confirmedRace.name)}` : "Sin raza confirmada todavia"}
                </span>
              </div>
              <button class="primary-button" data-action="confirm-race" ${isConfirmed ? "disabled" : ""}>
                ${isConfirmed ? "Raza confirmada" : "Seleccionar esta raza"}
              </button>
            </div>
          </div>

          <div class="race-hero-media">
            ${renderRaceHeroImage(activeRace)}
          </div>
        </section>
      </section>

      <section class="identity-form-panel">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Ficha base</span>
            <h3>Nombre, nivel y notas</h3>
          </div>
        </div>

        <div class="form-section">
          <label class="field">
            <span>Nombre</span>
            <input type="text" value="${escapeHtml(state.draft.name)}" data-field="name" placeholder="Ej. Aelia de Serenatia" />
          </label>

          <label class="field">
            <span>Nivel inicial</span>
            <input type="number" value="${escapeHtml(String(state.draft.level || 1))}" min="1" max="1" data-field="level" />
            <small>El creador queda alineado al material inicial cargado: creacion base de nivel 1.</small>
          </label>

          <label class="field">
            <span>Trasfondo o notas</span>
            <textarea rows="5" data-field="notes" placeholder="Resumen de historia, tono de rol o referencias de equipo.">${escapeHtml(state.draft.notes)}</textarea>
          </label>
        </div>
      </section>
    </div>
  `;
}

function renderRaceConfigStep(summary, state) {
  const lunar = summary.lunarState;
  const race = summary.race;

  return `
    <div class="step-layout">
      <section class="data-panel">
        <h3>Base racial</h3>
        <div class="stat-grid">
          ${Object.entries(summary.attributes.base)
            .map(([key, value]) => `<div class="stat-card"><span>${ATTRIBUTE_LABELS[key]}</span><strong>${value}</strong></div>`)
            .join("")}
          <div class="stat-card"><span>Ataque base C.C.</span><strong>${race?.attackBase?.melee ?? "-"}</strong></div>
          <div class="stat-card"><span>Ataque base A.D.</span><strong>${race?.attackBase?.ranged ?? "-"}</strong></div>
          <div class="stat-card"><span>Salud base</span><strong>${race?.healthBase ?? "-"}</strong></div>
          <div class="stat-card"><span>Movimiento base</span><strong>${race?.movementBase ?? "-"}</strong></div>
          <div class="stat-card"><span>Dado racial</span><strong>${escapeHtml(race?.healthDie || "-")}</strong></div>
        </div>

        <div class="callout">
          <strong>Acceso lunar actual:</strong> ${escapeHtml(lunar.choiceLabel || lunar.accessSummary)}
          <p>${lunar.messages.map((message) => escapeHtml(message)).join(" ")}</p>
        </div>
      </section>

      <section class="form-section">
        <h3>Configuracion lunar</h3>
        ${
          lunar.needsChoice
            ? `
              <div class="choice-grid">
                ${lunar.choiceOptions
                  .map(
                    (option) => `
                      <button class="selector-card ${option.id === state.draft.lunarChoice ? "is-selected" : ""}" data-action="select-lunar-choice" data-choice="${option.id}">
                        <h3>${escapeHtml(option.title)}</h3>
                        <p>${escapeHtml(option.description)}</p>
                        <div class="stat-line">Mag ${option.levels.magico} &middot; Mal ${option.levels.maldito}</div>
                      </button>
                    `
                  )
                  .join("")}
              </div>
            `
            : `<p class="muted">Esta raza no requiere una eleccion adicional en este paso.</p>`
        }

        <div class="help-card">
          <h4>Dependencia directa</h4>
          <p>La senda lunar recalcula virtudes disponibles, equipo canalizable y bloqueos por Luna Azul o Luna Roja.</p>
        </div>
      </section>
    </div>
  `;
}

function renderExtraPointStep(summary) {
  return `
    <div class="choice-grid">
      ${Object.entries(summary.attributes.base)
        .map(([key, value]) => {
          const selected = summary.attributes.extraAttributeLabel === ATTRIBUTE_LABELS[key];
          return `
            <button class="selector-card ${selected ? "is-selected" : ""}" data-action="select-extra-attribute" data-attribute="${key}">
              <h3>${ATTRIBUTE_LABELS[key]}</h3>
              <p>El +1 inicial solo puede ir a atributos base. Nunca a Nivel Magico o Nivel Maldito.</p>
              <div class="stat-line">Base ${value} -> Final ${value + 1}</div>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderGeneralVirtuesStep(summary) {
  return `
    <div class="step-layout">
      <section class="data-panel">
        <div class="toolbar-line">
          <div><strong>Pool inicial:</strong> ${summary.generalVirtues.pool}</div>
          <div><strong>Usados:</strong> ${summary.generalVirtues.used} &middot; <strong>Restantes:</strong> ${summary.generalVirtues.remaining}</div>
        </div>
        <div class="callout">
          <strong>Cap en creacion:</strong> 3 por virtud.
          <p>El backend bloquea automaticamente cualquier exceso de pool o de cap individual.</p>
        </div>
      </section>

      <section class="virtue-groups">
        ${summary.generalVirtues.groups
          .map(
            (group) => `
              <article class="group-card">
                <h3>${escapeHtml(group.title)}</h3>
                <div class="group-list">
                  ${group.items
                    .map(
                      (item) => `
                        <label class="virtue-row">
                          <div>
                            <strong>${escapeHtml(item.name)}</strong>
                            <span>${escapeHtml(item.attributeLabel || "Atributo contextual")}</span>
                          </div>
                          <input type="number" min="0" max="3" value="${item.selected}" data-field="generalVirtues.${item.id}" />
                        </label>
                      `
                    )
                    .join("")}
                </div>
              </article>
            `
          )
          .join("")}
      </section>
    </div>
  `;
}

function renderLunarVirtuesStep(summary) {
  const sections = [
    { moon: "azul", title: "Virtudes Magicas Azul" },
    { moon: "roja", title: "Virtudes Malditas Roja" }
  ];
  const selected = new Set(summary.lunarVirtues.selectedIds);

  return `
    <div class="data-panel">
      <div class="toolbar-line">
        <div><strong>Acceso actual:</strong> ${escapeHtml(summary.lunarVirtues.accessSummary)}</div>
        <div><strong>Seleccionadas:</strong> ${summary.lunarVirtues.selectedItems.length} / ${summary.lunarVirtues.limit}</div>
      </div>
    </div>

    ${sections
      .map((section) => {
        const groups = summary.lunarVirtues.grouped[section.moon];
        const hasAny = Object.values(groups).some((items) => items.length > 0);
        if (!hasAny) {
          return "";
        }
        return `
          <section class="moon-section">
            <h3>${section.title}</h3>
            ${Object.entries(groups)
              .map(([attribute, items]) => {
                if (!items.length) {
                  return "";
                }
                return `
                  <article class="group-card">
                    <h4>${ATTRIBUTE_LABELS[attribute]}</h4>
                    <div class="lunar-grid">
                      ${items
                        .map(
                          (item) => `
                            <button class="lunar-card ${selected.has(item.id) ? "is-selected" : ""}" data-action="toggle-lunar-virtue" data-id="${item.id}">
                              <div class="chip-row">
                                <span class="chip">${section.title}</span>
                                <span class="chip">${escapeHtml(item.type)}</span>
                              </div>
                              <h5>${escapeHtml(item.name)}</h5>
                              <p>${escapeHtml(item.summary)}</p>
                              <dl>
                                <div><dt>Atributo</dt><dd>${ATTRIBUTE_LABELS[item.rootAttribute]}</dd></div>
                                <div><dt>Formula</dt><dd>${escapeHtml(item.formula)}</dd></div>
                                <div><dt>DC</dt><dd>${escapeHtml(item.dc || "No aplica")}</dd></div>
                                <div><dt>Alcance</dt><dd>${escapeHtml(item.range || "-")}</dd></div>
                                <div><dt>Efecto base</dt><dd>${escapeHtml(item.effectBase || "-")}</dd></div>
                              </dl>
                            </button>
                          `
                        )
                        .join("")}
                    </div>
                  </article>
                `;
              })
              .join("")}
          </section>
        `;
      })
      .join("")}
  `;
}

function renderDotesStep(summary) {
  const selected = new Set(summary.dotes.selectedIds);
  return `
    <div class="step-layout">
      <section class="data-panel">
        <h3>Dote racial</h3>
        <div class="callout warning">
          <strong>${escapeHtml(summary.dotes.racialDote.title)}</strong>
          <p>${escapeHtml(summary.dotes.racialDote.description)}</p>
        </div>
      </section>

      <section class="form-section">
        <div class="toolbar-line">
          <div><strong>Dote libre:</strong> ${summary.dotes.selectedIds.length} / ${summary.dotes.freeLimit}</div>
          <div><span class="muted">Solo se guarda si cumple requisitos reales.</span></div>
        </div>
        <div class="dote-grid">
          ${summary.dotes.evaluations
            .map(
              (dote) => `
                <button class="selector-card ${selected.has(dote.id) ? "is-selected" : ""} ${dote.available ? "" : "is-blocked"}" data-action="toggle-dote" data-id="${dote.id}">
                  <div class="chip-row">
                    <span class="chip">${escapeHtml(dote.type)}</span>
                    <span class="chip ${dote.available ? "chip--ok" : "chip--warn"}">${dote.available ? "Disponible" : "Bloqueado"}</span>
                  </div>
                  <h3>${escapeHtml(dote.name)}</h3>
                  <p>${escapeHtml(dote.description)}</p>
                  <small>${escapeHtml(dote.available ? dote.requirementsText : dote.blockedReason)}</small>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderOffensiveOrientationStep(summary) {
  const current = summary.offensiveOrientation?.id || "";
  const orientations = [
    {
      id: "melee",
      title: "Cuerpo a cuerpo",
      description: "Solo armas C.C. como pool principal."
    },
    {
      id: "ranged",
      title: "Distancia",
      description: "Solo armas A.D. como pool principal."
    },
    {
      id: "magic",
      title: "Magia / Canalizacion",
      description: "Solo focos, implementos o armas con funcion lunar real."
    },
    {
      id: "performance",
      title: "Instrumento / Interpretacion",
      description: "Solo instrumentos o implementos validos para interpretacion."
    }
  ];

  return `
    <div class="step-layout">
      <section class="choice-grid">
        ${orientations
          .map(
            (item) => `
              <button class="selector-card ${current === item.id ? "is-selected" : ""}" data-action="select-offensive-orientation" data-id="${item.id}">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
              </button>
            `
          )
          .join("")}
      </section>

      <section class="help-card">
        <h4>Que prepara este paso</h4>
        <p>El pool ofensivo del paso 8 se construye primero con esta orientacion, luego se randomiza, y solo permite 1 re-roll para el arma principal.</p>
      </section>
    </div>
  `;
}

function renderEquipmentAndHealthStep(summary) {
  const defensiveCurrent = summary.defensiveOrientation?.id || "";
  const defensiveOrientations = [
    {
      id: "resistance",
      title: "Resistencia",
      description: "Filtra armaduras y escudos enfocados en mitigacion y defensa fija."
    },
    {
      id: "evasion",
      title: "Esquivar",
      description: "Filtra piezas ligeras o evasivas que no contradicen esta orientacion."
    }
  ];

  return `
    <div class="summary-stack">
      <section class="summary-block">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Ofensiva</span>
            <h3>Arma principal randomizada</h3>
          </div>
        </div>
        ${renderRandomSlot(summary.equipment.offensive, {
          rollAction: "randomize-primary",
          rerollAction: "reroll-primary",
          statFields: [
            ["Tipo", summary.equipment.offensive.current.type],
            ["Rareza", summary.equipment.offensive.current.rarity],
            ["Bonus ataque", formatNumber(summary.equipment.offensive.current.attackBonus)],
            ["Bonus lunar", summary.equipment.offensive.current.lunarBonusText || "-"],
            ["Dano", summary.equipment.offensive.current.damage],
            ["Habilidad", summary.equipment.offensive.current.ability]
          ]
        })}
      </section>

      <section class="summary-block">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Defensiva</span>
            <h3>Orientacion defensiva</h3>
          </div>
        </div>
        <div class="choice-grid">
          ${defensiveOrientations
            .map(
              (item) => `
                <button class="selector-card ${defensiveCurrent === item.id ? "is-selected" : ""}" data-action="select-defensive-orientation" data-id="${item.id}">
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.description)}</p>
                </button>
              `
            )
            .join("")}
        </div>

        <div class="random-grid">
          ${renderRandomSlot(summary.equipment.defensive.armor, {
            rollAction: "randomize-armor",
            rerollAction: "reroll-armor",
            statFields: [
              ["Rareza", summary.equipment.defensive.armor.current.rarity],
              ["Resistencia", formatNumber(summary.equipment.defensive.armor.current.resistanceBonus)],
              ["Esquivar", formatNumber(summary.equipment.defensive.armor.current.dodgeBonus)],
              ["RD", formatNumber(summary.equipment.defensive.armor.current.damageReduction)],
              ["Pen. movimiento", formatNumber(summary.equipment.defensive.armor.current.movementPenalty)]
            ]
          })}

          ${renderRandomSlot(summary.equipment.defensive.shield, {
            rollAction: "randomize-shield",
            rerollAction: "reroll-shield",
            statFields: [
              ["Rareza", summary.equipment.defensive.shield.current.rarity],
              ["Resistencia", formatNumber(summary.equipment.defensive.shield.current.resistanceBonus)],
              ["Esquivar", formatNumber(summary.equipment.defensive.shield.current.dodgeBonus)],
              ["RD", formatNumber(summary.equipment.defensive.shield.current.damageReduction)],
              ["Pen. movimiento", formatNumber(summary.equipment.defensive.shield.current.movementPenalty)]
            ]
          })}
        </div>
      </section>

      <section class="summary-block">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Vida</span>
            <h3>Dado extra permanente</h3>
          </div>
        </div>
        <div class="callout">
          <strong>Dado racial usado:</strong> ${escapeHtml(summary.creationHealth.die || summary.race?.healthDie || "-")}
          <p>Este resultado se suma de forma permanente a la vida maxima final y conserva el ultimo resultado, no el mejor.</p>
        </div>
        <div class="toolbar-line">
          <div><strong>Tirada actual:</strong> ${summary.creationHealth.value || "-"}</div>
          <div><strong>Re-rolls:</strong> ${summary.creationHealth.rerollsUsed} / ${summary.creationHealth.rerollsMax}</div>
          <div><strong>Restantes:</strong> ${summary.creationHealth.rerollsRemaining}</div>
        </div>
        <div class="hero-actions">
          <button class="primary-button" data-action="roll-health" ${summary.creationHealth.canRoll ? "" : "disabled"}>Tirar ${escapeHtml(summary.creationHealth.die || summary.race?.healthDie || "dado")}</button>
          <button class="ghost-button" data-action="reroll-health" ${summary.creationHealth.canReroll ? "" : "disabled"}>Usar re-roll</button>
        </div>
        <div class="callout">
          <strong>Impacto inmediato:</strong> Vida base ${summary.derived.healthBreakdown.raceBase} + Fisico ${summary.derived.healthBreakdown.fisico} + Dado extra ${summary.derived.healthBreakdown.creationDie} = <strong>${summary.derived.health}</strong>
        </div>
        ${renderList(summary.creationHealth.errors, "Sin incidencias en la vida extra.")}
      </section>
    </div>
  `;
}

function renderRandomSlot(slot, config) {
  return `
    <article class="slot-card">
      <div class="toolbar-line">
        <div>
          <strong>${capitalize(slot.label)}</strong>
          <span class="muted">${slot.title}</span>
        </div>
        <div class="chip-row">
          <span class="chip">Pool ${slot.poolSize}</span>
          <span class="chip">${slot.rerollsUsed}/${slot.rerollsLimit} re-roll</span>
        </div>
      </div>

      <div class="pool-list">
        ${slot.pool.length > 0 ? slot.pool.map((item) => `<span class="chip">${escapeHtml(item.name)}</span>`).join("") : `<span class="muted">${escapeHtml(slot.emptyMessage || "Sin items compatibles.")}</span>`}
      </div>

      <div class="selector-card is-selected result-card">
        <div class="chip-row">
          <span class="chip">${escapeHtml(slot.current.type || slot.current.subtype || "Ninguno")}</span>
          <span class="chip">${escapeHtml(slot.current.rarity || "-")}</span>
          <span class="chip ${slot.rerollConsumed ? "chip--warn" : "chip--ok"}">${slot.rerollConsumed ? "Re-roll consumido" : "Re-roll disponible"}</span>
        </div>
        <h3>${escapeHtml(slot.current.name || "Sin resultado")}</h3>
        <p>${escapeHtml(slot.current.description || "Todavia no se genero un resultado para este slot.")}</p>
        <dl>
          ${config.statFields
            .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(displayValue(value))}</dd></div>`)
            .join("")}
        </dl>
      </div>

      <div class="hero-actions">
        <button class="primary-button" data-action="${config.rollAction}" ${slot.canRoll ? "" : "disabled"}>Randomizar</button>
        <button class="ghost-button" data-action="${config.rerollAction}" ${slot.canReroll ? "" : "disabled"}>Usar re-roll</button>
      </div>

      <div class="help-card">
        <h4>Por que otros items no aparecen</h4>
        ${renderList(slot.blockedSummary, "No hay items ocultos para este filtro.")}
      </div>
    </article>
  `;
}

function renderFinalSummaryStep(state) {
  const summary = state.preview.summary;
  const validations = state.preview.validations;

  return `
    <div class="summary-stack">
      <section class="summary-block">
        <h3>Ficha resumida</h3>
        <div class="stat-grid">
          ${Object.entries(summary.attributes.final)
            .map(([key, value]) => `<div class="stat-card"><span>${ATTRIBUTE_LABELS[key]}</span><strong>${value}</strong></div>`)
            .join("")}
          <div class="stat-card"><span>Nivel Magico</span><strong>${summary.lunarState.magico}</strong></div>
          <div class="stat-card"><span>Nivel Maldito</span><strong>${summary.lunarState.maldito}</strong></div>
          <div class="stat-card"><span>Vida maxima</span><strong>${summary.derived.health}</strong></div>
          <div class="stat-card"><span>Movimiento</span><strong>${summary.derived.movement}</strong></div>
        </div>
      </section>

      <section class="summary-block">
        <h3>Derivados y resolucion</h3>
        <div class="stat-grid">
          <div class="stat-card"><span>Ataque C.C.</span><strong>${summary.derived.attackMelee}</strong></div>
          <div class="stat-card"><span>Ataque A.D.</span><strong>${summary.derived.attackRanged}</strong></div>
          <div class="stat-card"><span>Resistencia</span><strong>${summary.derived.resistencia}</strong></div>
          <div class="stat-card"><span>Esquivar</span><strong>${summary.derived.esquivar}</strong></div>
          <div class="stat-card"><span>Fortaleza</span><strong>${summary.derived.fortaleza}</strong></div>
          <div class="stat-card"><span>Reflejos</span><strong>${summary.derived.reflejos}</strong></div>
          <div class="stat-card"><span>Voluntad</span><strong>${summary.derived.voluntad}</strong></div>
          <div class="stat-card"><span>Caracter</span><strong>${summary.derived.caracter}</strong></div>
          <div class="stat-card"><span>DC Azul</span><strong>${summary.derived.dcAzul || "-"}</strong></div>
          <div class="stat-card"><span>DC Roja</span><strong>${summary.derived.dcRoja || "-"}</strong></div>
        </div>
      </section>

      <section class="summary-block">
        <h3>Selecciones finales</h3>
        <p><strong>Orientacion ofensiva:</strong> ${escapeHtml(summary.offensiveOrientation?.title || "Pendiente")}</p>
        <p><strong>Arma final:</strong> ${escapeHtml(summary.equipment.selected.primary.name)}</p>
        <p><strong>Orientacion defensiva:</strong> ${escapeHtml(summary.defensiveOrientation?.title || "Pendiente")}</p>
        <p><strong>Armadura final:</strong> ${escapeHtml(summary.equipment.selected.armor.name)}</p>
        <p><strong>Escudo final:</strong> ${escapeHtml(summary.equipment.selected.shield.name)}</p>
        <p><strong>Dado extra de vida:</strong> ${escapeHtml(summary.creationHealth.die || "-")} = ${summary.creationHealth.value || "-"}</p>
        <p><strong>Vida maxima final:</strong> ${summary.derived.health}</p>
        <p><strong>Virtudes generales:</strong> ${renderSelectedGeneralVirtues(summary)}</p>
        <p><strong>Virtudes lunares:</strong> ${summary.lunarVirtues.selectedItems.map((item) => escapeHtml(item.name)).join(", ") || "Sin seleccionar"}</p>
        <p><strong>Dote libre:</strong> ${renderSelectedDote(summary)}</p>
      </section>

      <section class="summary-block">
        <h3>Validaciones pendientes</h3>
        ${renderList(validations.blockingErrors, "No hay pendientes bloqueantes.")}
      </section>

      <section class="summary-actions">
        <button class="primary-button" data-action="save-character" ${validations.canSave ? "" : "disabled"}>${state.editingCharacterId ? "Actualizar personaje" : "Guardar personaje"}</button>
        <button class="ghost-button" data-action="export-current">Exportar JSON</button>
      </section>
    </div>
  `;
}

function renderLiveSummary(summary, validations, state) {
  const currentStepErrors = validations.steps.find((step) => step.id === state.draft.ui.step)?.errors || [];
  return `
    <div class="panel-block">
      <div class="panel-header">
        <div>
          <span class="eyebrow">Resumen vivo</span>
          <h2>${escapeHtml(summary.identity.name)}</h2>
        </div>
      </div>

      <div class="mini-summary">
        <p><strong>Raza:</strong> ${escapeHtml(summary.identity.raceName)}</p>
        <p><strong>Ofensiva:</strong> ${escapeHtml(summary.offensiveOrientation?.title || "Pendiente")}</p>
        <p><strong>Defensiva:</strong> ${escapeHtml(summary.defensiveOrientation?.title || "Pendiente")}</p>
        <p><strong>Lunas:</strong> Azul ${summary.lunarState.magico} &middot; Roja ${summary.lunarState.maldito}</p>
        <p><strong>Arma:</strong> ${escapeHtml(summary.equipment.selected.primary.name)}</p>
        <p><strong>Vida max:</strong> ${summary.derived.health}</p>
      </div>

      <div class="help-card">
        <h3>Que vigila este paso</h3>
        ${renderList(currentStepErrors, "Sin errores en este paso.")}
      </div>

      <div class="help-card">
        <h3>Dependencias visibles</h3>
        ${renderList(state.preview.hints, "Sin dependencias especiales en este momento.")}
      </div>

      <div class="help-card">
        <h3>Vida total</h3>
        <p>Base racial ${summary.derived.healthBreakdown.raceBase} + Fisico ${summary.derived.healthBreakdown.fisico} + Dado extra ${summary.derived.healthBreakdown.creationDie} = <strong>${summary.derived.health}</strong></p>
      </div>

      <div class="help-card">
        <h3>Glosario rapido</h3>
        <dl class="glossary-list">
          ${state.catalogs.glossary
            .map(
              (entry) => `
                <div>
                  <dt>${escapeHtml(entry.title)}</dt>
                  <dd>${escapeHtml(entry.text)}</dd>
                </div>
              `
            )
            .join("")}
        </dl>
      </div>
    </div>
  `;
}

function renderFooterNav(currentStep) {
  const previous = Math.max(1, currentStep - 1);
  const next = Math.min(9, currentStep + 1);
  return `
    <footer class="step-footer">
      <button class="ghost-button" data-action="go-step" data-step="${previous}" ${currentStep === 1 ? "disabled" : ""}>Paso anterior</button>
      <button class="primary-button" data-action="go-step" data-step="${next}" ${currentStep === 9 ? "disabled" : ""}>Siguiente paso</button>
    </footer>
  `;
}

function resolveActiveRace(state) {
  return (
    state.catalogs.races.find((race) => race.id === state.activeRaceId) ||
    state.catalogs.races.find((race) => race.id === state.draft.raceId) ||
    state.catalogs.races[0]
  );
}

function renderRaceHeroImage(race) {
  if (race?.imagePath) {
    const imageBadge = race.imageSource === "assets-fallback" ? "Fallback visual" : "Arte local";
    return `
      <div class="race-hero-frame">
        <span class="race-image-badge">${escapeHtml(imageBadge)}</span>
        <img src="${race.imagePath}" alt="${escapeHtml(race.imageAlt || race.name)}" class="race-hero-image" decoding="async" />
      </div>
    `;
  }

  return `
    <div class="race-hero-frame race-hero-frame--placeholder" aria-hidden="true">
      <div class="race-placeholder-mark">${escapeHtml((race?.name || "?").slice(0, 1))}</div>
      <p>Arte racial no disponible. Se mantiene un panel de respaldo para no romper la seleccion.</p>
    </div>
  `;
}

function renderSelectedGeneralVirtues(summary) {
  const entries = [];
  summary.generalVirtues.groups.forEach((group) => {
    group.items.forEach((item) => {
      if (item.selected > 0) {
        entries.push(`${item.name} ${item.selected}`);
      }
    });
  });
  return entries.join(", ") || "Sin asignar";
}

function renderSelectedDote(summary) {
  const selected = summary.dotes.evaluations.filter((entry) => entry.selected).map((entry) => entry.name);
  return selected.join(", ") || "Sin seleccionar";
}

function renderList(items, emptyText) {
  if (!items || items.length === 0) {
    return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  }

  return `
    <ul class="plain-list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function capitalize(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function formatNumber(value) {
  const number = Number(value || 0);
  return number > 0 ? `+${number}` : String(number);
}

function displayValue(value) {
  if (value == null || value === "") {
    return "-";
  }
  return String(value);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
