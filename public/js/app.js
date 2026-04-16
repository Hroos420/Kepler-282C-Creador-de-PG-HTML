import { api } from "./api.js";
import { renderApp } from "./render.js";

const root = document.getElementById("app");
const importInput = document.getElementById("import-file");

const state = {
  loading: true,
  catalogs: null,
  characters: [],
  preview: null,
  draft: createDraft(),
  editingCharacterId: "",
  autosaveEnabled: readAutosavePreference(),
  autosaveMeta: null,
  message: null
};

let previewTimer = null;
let autosaveTimer = null;

bootstrap();

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;

  try {
    switch (action) {
      case "go-step":
        state.draft.ui.step = Number(button.dataset.step || state.draft.ui.step);
        render();
        break;
      case "new-character":
        state.editingCharacterId = "";
        state.draft = createDraft();
        await refreshPreview({ immediate: true });
        break;
      case "clear-autosave":
        await api.clearAutosave();
        state.autosaveMeta = null;
        flash("info", "Autosave eliminado.");
        render();
        break;
      case "open-import":
        importInput.value = "";
        importInput.click();
        break;
      case "select-race":
        selectRace(button.dataset.race);
        break;
      case "select-lunar-choice":
        state.draft.lunarChoice = button.dataset.choice || "";
        state.draft.lunarVirtueIds = [];
        state.draft.selectedDoteIds = [];
        state.draft.equipment.primaryId = "";
        queuePreview();
        break;
      case "select-extra-attribute":
        state.draft.extraAttribute = button.dataset.attribute || "";
        queuePreview();
        break;
      case "toggle-lunar-virtue":
        toggleItemInArray("lunarVirtueIds", button.dataset.id, state.preview.summary.lunarVirtues.limit);
        queuePreview();
        break;
      case "toggle-dote":
        toggleItemInArray("selectedDoteIds", button.dataset.id, state.preview.summary.dotes.freeLimit);
        queuePreview();
        break;
      case "select-orientation":
        state.draft.orientation = button.dataset.id || "";
        state.draft.equipment.primaryId = "";
        queuePreview();
        break;
      case "select-primary-equipment":
        state.draft.equipment.primaryId = button.dataset.id || "";
        queuePreview();
        break;
      case "save-character":
        await saveCharacter();
        break;
      case "load-character":
        await loadCharacter(button.dataset.id);
        break;
      case "duplicate-character":
        await duplicateCharacter(button.dataset.id);
        break;
      case "delete-character":
        await deleteCharacter(button.dataset.id);
        break;
      case "export-character":
        await exportSavedCharacter(button.dataset.id);
        break;
      case "export-current":
        exportCurrentDraft();
        break;
      default:
        break;
    }
  } catch (error) {
    flash("error", error?.payload?.message || error.message || "Acción no completada.");
    render();
  }
});

document.addEventListener("input", (event) => {
  const field = event.target.dataset.field;
  if (!field) {
    return;
  }

  if (field === "settings.autosave") {
    state.autosaveEnabled = event.target.checked;
    localStorage.setItem("kepler_autosave_enabled", JSON.stringify(state.autosaveEnabled));
    if (!state.autosaveEnabled) {
      clearTimeout(autosaveTimer);
    }
    render();
    return;
  }

  const value = event.target.type === "number" ? Number(event.target.value || 0) : event.target.value;
  setByPath(state.draft, field, value);
  queuePreview();
});

importInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    state.editingCharacterId = "";
    state.draft = normalizeImportedDraft(parsed);
    state.draft.ui.step = 1;
    await refreshPreview({ immediate: true });
    flash("success", "JSON importado en el editor. Revísalo y guarda cuando termine.");
  } catch (error) {
    flash("error", "No fue posible leer el JSON importado.");
    render();
  }
});

async function bootstrap() {
  try {
    const data = await api.bootstrap();
    state.catalogs = data.catalogs;
    state.characters = data.characters;
    state.autosaveMeta = data.autosave;
    state.draft = data.autosave?.draft || createDraft();
    await refreshPreview({ immediate: true, silentMessage: true });
  } catch (error) {
    flash("error", error.message || "No se pudo iniciar la aplicación.");
  } finally {
    state.loading = false;
    render();
  }
}

function render() {
  root.innerHTML = renderApp(state);
}

function queuePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    refreshPreview({ immediate: true });
  }, 120);
}

async function refreshPreview({ immediate = false, silentMessage = false } = {}) {
  if (!state.catalogs) {
    return;
  }

  const preview = await api.preview(state.draft);
  const currentStep = state.draft.ui.step;
  state.preview = preview;
  state.draft = {
    ...preview.draft,
    ui: {
      step: currentStep
    }
  };
  render();

  if (state.autosaveEnabled) {
    queueAutosave();
  }

  if (!silentMessage && immediate) {
    state.message = null;
  }
}

function queueAutosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(async () => {
    try {
      const autosave = await api.saveAutosave(state.draft);
      state.autosaveMeta = autosave;
      render();
    } catch {
      // noop
    }
  }, 800);
}

function selectRace(raceId) {
  const preserved = {
    name: state.draft.name,
    notes: state.draft.notes,
    level: state.draft.level
  };
  state.draft = {
    ...createDraft(),
    ...preserved,
    raceId,
    ui: {
      step: state.draft.ui.step
    }
  };
  queuePreview();
}

function toggleItemInArray(key, id, limit) {
  const current = new Set(state.draft[key] || []);
  if (current.has(id)) {
    current.delete(id);
  } else {
    if (current.size >= limit) {
      flash("warning", `No puedes seleccionar más de ${limit} opción(es) en este paso.`);
      render();
      return;
    }
    current.add(id);
  }
  state.draft[key] = [...current];
}

async function saveCharacter() {
  const response = state.editingCharacterId
    ? await api.updateCharacter(state.editingCharacterId, state.draft)
    : await api.createCharacter(state.draft);

  state.editingCharacterId = response.id;
  state.autosaveMeta = null;
  const list = await api.listCharacters();
  state.characters = list.characters;
  await loadCharacter(response.id, { announce: false });
  flash("success", state.editingCharacterId ? "Personaje guardado correctamente." : "Personaje creado correctamente.");
}

async function loadCharacter(id, options = {}) {
  const character = await api.getCharacter(id);
  state.editingCharacterId = character.id;
  state.draft = character.draft;
  await refreshPreview({ immediate: true, silentMessage: true });
  if (options.announce !== false) {
    flash("info", `Cargado: ${character.name}`);
  }
}

async function duplicateCharacter(id) {
  const duplicated = await api.duplicateCharacter(id);
  const list = await api.listCharacters();
  state.characters = list.characters;
  await loadCharacter(duplicated.id, { announce: false });
  flash("success", "Personaje duplicado.");
}

async function deleteCharacter(id) {
  const current = state.characters.find((entry) => entry.id === id);
  const confirmed = window.confirm(`Eliminar "${current?.name || "personaje"}"?`);
  if (!confirmed) {
    return;
  }
  await api.deleteCharacter(id);
  const list = await api.listCharacters();
  state.characters = list.characters;
  if (state.editingCharacterId === id) {
    state.editingCharacterId = "";
    state.draft = createDraft();
    await refreshPreview({ immediate: true, silentMessage: true });
  }
  flash("info", "Personaje eliminado.");
}

async function exportSavedCharacter(id) {
  const character = await api.getCharacter(id);
  downloadJson(`${character.name || "personaje"}.json`, {
    exportedAt: new Date().toISOString(),
    character
  });
}

function exportCurrentDraft() {
  downloadJson(`${state.preview.summary.identity.name || "personaje"}.json`, {
    exportedAt: new Date().toISOString(),
    draft: state.draft,
    validations: state.preview.validations
  });
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function normalizeImportedDraft(payload) {
  if (payload?.draft) {
    return payload.draft;
  }
  if (payload?.character?.draft) {
    return payload.character.draft;
  }
  return payload;
}

function setByPath(target, path, value) {
  const segments = path.split(".");
  let cursor = target;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const key = segments[index];
    if (!(key in cursor) || typeof cursor[key] !== "object" || cursor[key] === null) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[segments.at(-1)] = value;
}

function createDraft() {
  return {
    version: 1,
    name: "",
    raceId: "",
    notes: "",
    level: 1,
    lunarChoice: "",
    extraAttribute: "",
    generalVirtues: {},
    lunarVirtueIds: [],
    selectedDoteIds: [],
    orientation: "",
    equipment: {
      primaryId: "",
      armorId: "",
      shieldId: ""
    },
    ui: {
      step: 1
    }
  };
}

function readAutosavePreference() {
  try {
    const value = localStorage.getItem("kepler_autosave_enabled");
    return value == null ? true : JSON.parse(value);
  } catch {
    return true;
  }
}

function flash(type, text) {
  state.message = { type, text };
  render();
  window.clearTimeout(flash.timer);
  flash.timer = window.setTimeout(() => {
    state.message = null;
    render();
  }, 3500);
}
