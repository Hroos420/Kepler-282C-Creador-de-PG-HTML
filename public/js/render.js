const ATTRIBUTE_LABELS = {
  FIS: "Físico",
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
  7: "Orientación",
  8: "Equipo",
  9: "Resumen"
};

export function renderApp(state) {
  if (state.loading) {
    return `
      <div class="loading-screen">
        <div class="loading-card">
          <span class="eyebrow">Kepler-282C</span>
          <h1>Cargando catálogos y persistencia local</h1>
          <p>Preparando reglas, personajes guardados y previsualización del creador.</p>
        </div>
      </div>
    `;
  }

  if (!state.preview) {
    return `
      <div class="loading-screen">
        <div class="loading-card">
          <span class="eyebrow">Kepler-282C</span>
          <h1>No se pudo construir la previsualización</h1>
          <p>Revisa el mensaje de error y recarga la aplicación.</p>
        </div>
      </div>
    `;
  }

  const summary = state.preview?.summary;
  const validations = state.preview?.validations;
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
            ${renderFooterNav(currentStep, validations)}
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
        <p>Flujo único, reglas centralizadas, persistencia local con SQLite y validación preventiva.</p>
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

      ${state.characters.length === 0 ? `<p class="muted">No hay personajes guardados todavía.</p>` : ""}

      <div class="character-list">
        ${state.characters
          .map(
            (entry) => `
              <article class="character-card ${entry.id === state.editingCharacterId ? "is-current" : ""}">
                <div>
                  <strong>${escapeHtml(entry.name)}</strong>
                  <p>${escapeHtml(entry.identity.raceName)} · Nivel ${entry.level}</p>
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
      return renderIdentityStep(state, summary);
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
      return renderOrientationStep(summary);
    case 8:
      return renderEquipmentStep(summary);
    case 9:
      return renderFinalSummaryStep(state);
    default:
      return "";
  }
}

function renderIdentityStep(state, summary) {
  return `
    <div class="step-layout">
      <section class="form-section">
        <label class="field">
          <span>Nombre</span>
          <input type="text" value="${escapeHtml(state.draft.name)}" data-field="name" placeholder="Ej. Aelia de Serenatia" />
        </label>

        <label class="field">
          <span>Nivel inicial</span>
          <input type="number" value="${escapeHtml(String(state.draft.level || 1))}" min="1" max="1" data-field="level" />
          <small>El creador queda alineado al material inicial cargado: creación base de nivel 1.</small>
        </label>

        <label class="field">
          <span>Trasfondo o notas</span>
          <textarea rows="5" data-field="notes" placeholder="Resumen de historia, matices de rol o referencias de equipo.">${escapeHtml(
            state.draft.notes
          )}</textarea>
        </label>
      </section>

      <section class="selector-grid">
        ${state.catalogs.races
          .map(
            (race) => `
              <button class="selector-card ${state.draft.raceId === race.id ? "is-selected" : ""}" data-action="select-race" data-race="${race.id}">
                <h3>${escapeHtml(race.name)}</h3>
                <p>${escapeHtml(race.description)}</p>
                <div class="stat-line">FIS ${race.baseAttributes.FIS} · DES ${race.baseAttributes.DES} · SOC ${race.baseAttributes.SOC} · MEN ${race.baseAttributes.MEN}</div>
                <div class="stat-line">Mag ${race.baseLunarLevels.magico || 0} · Mal ${race.baseLunarLevels.maldito || 0}</div>
              </button>
            `
          )
          .join("")}
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
        <h3>Números base raciales</h3>
        <div class="stat-grid">
          ${Object.entries(summary.attributes.base)
            .map(([key, value]) => `<div class="stat-card"><span>${ATTRIBUTE_LABELS[key]}</span><strong>${value}</strong></div>`)
            .join("")}
          <div class="stat-card"><span>Ataque base C.C.</span><strong>${race?.attackBase?.melee ?? "—"}</strong></div>
          <div class="stat-card"><span>Ataque base A.D.</span><strong>${race?.attackBase?.ranged ?? "—"}</strong></div>
          <div class="stat-card"><span>Salud Base</span><strong>${race?.healthBase ?? "—"}</strong></div>
          <div class="stat-card"><span>Movimiento Base</span><strong>${race?.movementBase ?? "—"}</strong></div>
        </div>

        <div class="callout">
          <strong>Acceso lunar actual:</strong> ${escapeHtml(lunar.choiceLabel || lunar.accessSummary)}
          <p>${lunar.messages.map((message) => escapeHtml(message)).join(" ")}</p>
        </div>
      </section>

      <section class="form-section">
        <h3>Configuración lunar</h3>
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
                        <div class="stat-line">Mag ${option.levels.magico} · Mal ${option.levels.maldito}</div>
                      </button>
                    `
                  )
                  .join("")}
              </div>
            `
            : `<p class="muted">Esta raza no requiere elección adicional en este paso.</p>`
        }

        <div class="help-card">
          <h4>Qué se recalcula después</h4>
          <p>La senda lunar define qué virtudes azules o rojas aparecerán en el paso 5 y qué equipo canalizado será compatible en el paso 8.</p>
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
          const nextValue = value + 1;
          return `
            <button class="selector-card ${selected ? "is-selected" : ""}" data-action="select-extra-attribute" data-attribute="${key}">
              <h3>${ATTRIBUTE_LABELS[key]}</h3>
              <p>Punto extra de creación. Nunca aplica a Nivel Mágico o Nivel Maldito.</p>
              <div class="stat-line">Base ${value} → Final ${nextValue}</div>
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
          <div>
            <strong>Pool inicial:</strong> ${summary.generalVirtues.pool}
          </div>
          <div>
            <strong>Usados:</strong> ${summary.generalVirtues.used} · <strong>Restantes:</strong> ${summary.generalVirtues.remaining}
          </div>
        </div>
        <div class="callout">
          <strong>Cap en creación:</strong> ${3} por virtud.
          <p>El backend bloquea automáticamente asignaciones fuera del pool racial o por encima del cap.</p>
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
                          <input
                            type="number"
                            min="0"
                            max="3"
                            value="${item.selected}"
                            data-field="generalVirtues.${item.id}"
                          />
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
    { moon: "azul", title: "Virtudes Mágicas Azul" },
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
                                <div><dt>Fórmula</dt><dd>${escapeHtml(item.formula)}</dd></div>
                                <div><dt>DC</dt><dd>${escapeHtml(item.dc || "No aplica")}</dd></div>
                                <div><dt>Alcance</dt><dd>${escapeHtml(item.range || "—")}</dd></div>
                                <div><dt>Efecto base</dt><dd>${escapeHtml(item.effectBase || "—")}</dd></div>
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
          <div><span class="muted">Solo se guarda si cumple requisitos.</span></div>
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

function renderOrientationStep(summary) {
  const current = summary.orientation?.id || "";
  const orientations = [
    {
      id: "melee",
      title: "Cuerpo a cuerpo",
      description: "Filtra armas C.C. y mantiene el foco en Físico."
    },
    {
      id: "ranged",
      title: "Distancia",
      description: "Filtra arcos, ballestas y otras piezas A.D."
    },
    {
      id: "magic",
      title: "Magia / Canalización",
      description: "Filtra focos, baritas, báculos y armas con bono lunar."
    },
    {
      id: "performance",
      title: "Instrumento / Interpretación",
      description: "Filtra instrumentos y refuerza resoluciones sociales."
    }
  ];

  return `
    <div class="choice-grid">
      ${orientations
        .map(
          (item) => `
            <button class="selector-card ${current === item.id ? "is-selected" : ""}" data-action="select-orientation" data-id="${item.id}">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.description)}</p>
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderEquipmentStep(summary) {
  const primaryAllowed = summary.equipment.availablePrimary.filter((item) => item.allowed);
  const hiddenCount = summary.equipment.availablePrimary.length - primaryAllowed.length;
  const currentPrimaryId = summary.equipment.selected.primary.id;

  return `
    <div class="step-layout">
      <section class="form-section">
        <div class="toolbar-line">
          <div>
            <strong>Equipo principal</strong>
            <span class="muted">${hiddenCount > 0 ? `${hiddenCount} opciones ocultas por orientación o luna.` : "Todas las opciones visibles son compatibles."}</span>
          </div>
        </div>
        <div class="equipment-grid">
          ${primaryAllowed
            .map(
              (item) => `
                <button class="selector-card ${currentPrimaryId === item.id ? "is-selected" : ""}" data-action="select-primary-equipment" data-id="${item.id}">
                  <div class="chip-row">
                    <span class="chip">${escapeHtml(item.type)}</span>
                    <span class="chip">${escapeHtml(item.rarity || "—")}</span>
                  </div>
                  <h3>${escapeHtml(item.name)}</h3>
                  <p>${escapeHtml(item.description)}</p>
                  <dl>
                    <div><dt>Ataque</dt><dd>${item.attackBonus || "—"}</dd></div>
                    <div><dt>Bono lunar</dt><dd>${escapeHtml(item.lunarBonusText || "—")}</dd></div>
                    <div><dt>Daño</dt><dd>${escapeHtml(item.damage || "—")}</dd></div>
                    <div><dt>Habilidad</dt><dd>${escapeHtml(item.ability || "—")}</dd></div>
                  </dl>
                </button>
              `
            )
            .join("")}
        </div>
      </section>

      <section class="data-panel">
        <h3>Armadura y escudo</h3>
        <label class="field">
          <span>Armadura</span>
          <select data-field="equipment.armorId">
            ${summary.equipment.availableArmor
              .map(
                (item) =>
                  `<option value="${item.id}" ${item.id === summary.equipment.selected.armor.id ? "selected" : ""}>${escapeHtml(
                    item.name
                  )}</option>`
              )
              .join("")}
          </select>
        </label>
        <label class="field">
          <span>Escudo</span>
          <select data-field="equipment.shieldId">
            ${summary.equipment.availableShield
              .map(
                (item) =>
                  `<option value="${item.id}" ${item.id === summary.equipment.selected.shield.id ? "selected" : ""}>${escapeHtml(
                    item.name
                  )}</option>`
              )
              .join("")}
          </select>
        </label>

        <div class="help-card">
          <h4>Compatibilidad</h4>
          <p>La selección principal se filtra por orientación. La armadura y el escudo ajustan Resistencia, Esquivar, RD y movimiento sin mezclar categorías ilegales.</p>
        </div>
      </section>
    </div>
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
          <div class="stat-card"><span>Nivel Mágico</span><strong>${summary.lunarState.magico}</strong></div>
          <div class="stat-card"><span>Nivel Maldito</span><strong>${summary.lunarState.maldito}</strong></div>
          <div class="stat-card"><span>Salud Base</span><strong>${summary.derived.health}</strong></div>
          <div class="stat-card"><span>Movimiento</span><strong>${summary.derived.movement}</strong></div>
        </div>
      </section>

      <section class="summary-block">
        <h3>Derivados y resolución</h3>
        <div class="stat-grid">
          <div class="stat-card"><span>Ataque C.C.</span><strong>${summary.derived.attackMelee}</strong></div>
          <div class="stat-card"><span>Ataque A.D.</span><strong>${summary.derived.attackRanged}</strong></div>
          <div class="stat-card"><span>Resistencia</span><strong>${summary.derived.resistencia}</strong></div>
          <div class="stat-card"><span>Esquivar</span><strong>${summary.derived.esquivar}</strong></div>
          <div class="stat-card"><span>Fortaleza</span><strong>${summary.derived.fortaleza}</strong></div>
          <div class="stat-card"><span>Reflejos</span><strong>${summary.derived.reflejos}</strong></div>
          <div class="stat-card"><span>Voluntad</span><strong>${summary.derived.voluntad}</strong></div>
          <div class="stat-card"><span>Carácter</span><strong>${summary.derived.caracter}</strong></div>
          <div class="stat-card"><span>DC Azul</span><strong>${summary.derived.dcAzul || "—"}</strong></div>
          <div class="stat-card"><span>DC Roja</span><strong>${summary.derived.dcRoja || "—"}</strong></div>
        </div>
      </section>

      <section class="summary-block">
        <h3>Selecciones</h3>
        <p><strong>Virtudes generales:</strong> ${renderSelectedGeneralVirtues(summary)}</p>
        <p><strong>Virtudes lunares:</strong> ${summary.lunarVirtues.selectedItems.map((item) => escapeHtml(item.name)).join(", ") || "Sin seleccionar"}</p>
        <p><strong>Dote libre:</strong> ${renderSelectedDote(summary)}</p>
        <p><strong>Equipo:</strong> ${escapeHtml(summary.equipment.selected.primary.name)} · ${escapeHtml(summary.equipment.selected.armor.name)} · ${escapeHtml(summary.equipment.selected.shield.name)}</p>
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
        <p><strong>Orientación:</strong> ${escapeHtml(summary.orientation?.title || "Pendiente")}</p>
        <p><strong>Luna:</strong> Azul ${summary.lunarState.magico} · Roja ${summary.lunarState.maldito}</p>
        <p><strong>C.C. / A.D.:</strong> ${summary.derived?.attackMelee || 0} / ${summary.derived?.attackRanged || 0}</p>
      </div>

      <div class="help-card">
        <h3>Qué vigila este paso</h3>
        ${renderList(currentStepErrors, "Sin errores en este paso.")}
      </div>

      <div class="help-card">
        <h3>Dependencias visibles</h3>
        ${renderList(state.preview.hints, "Sin dependencias especiales en este momento.")}
      </div>

      <div class="help-card">
        <h3>Glosario rápido</h3>
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

function renderFooterNav(currentStep, validations) {
  const previous = Math.max(1, currentStep - 1);
  const next = Math.min(9, currentStep + 1);
  return `
    <footer class="step-footer">
      <button class="ghost-button" data-action="go-step" data-step="${previous}" ${currentStep === 1 ? "disabled" : ""}>Paso anterior</button>
      <button class="primary-button" data-action="go-step" data-step="${next}" ${currentStep === 9 ? "disabled" : ""}>Siguiente paso</button>
    </footer>
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
