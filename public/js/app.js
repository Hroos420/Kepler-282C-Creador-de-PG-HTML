import { api } from "./api.js";
import { renderApp } from "./render.js";

const root = document.getElementById("app");
const importInput = document.getElementById("import-file");
const ACTIVE_RACE_STORAGE_KEY = "kepler_active_race";

const state = {
  loading: true,
  catalogs: null,
  characters: [],
  preview: null,
  draft: createDraft(),
  activeRaceId: "",
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
        state.activeRaceId = resolveActiveRaceId(state.catalogs?.races, readActiveRacePreference(), state.activeRaceId);
        persistActiveRace();
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
      case "activate-race":
        activateRace(button.dataset.race);
        break;
      case "confirm-race":
        confirmActiveRace();
        break;
      case "select-lunar-choice":
        state.draft.lunarChoice = button.dataset.choice || "";
        state.draft.lunarVirtueIds = [];
        state.draft.selectedDoteIds = [];
        clearOffensiveEquipment();
        clearDefensiveEquipment();
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
      case "select-offensive-orientation":
        state.draft.offensiveOrientation = button.dataset.id || "";
        clearOffensiveEquipment();
        queuePreview();
        break;
      case "select-defensive-orientation":
        state.draft.defensiveOrientation = button.dataset.id || "";
        clearDefensiveEquipment();
        queuePreview();
        break;
      case "randomize-primary":
        await applyServerAction({ type: "randomize-primary" });
        break;
      case "reroll-primary":
        await applyServerAction({ type: "randomize-primary", reroll: true });
        break;
      case "randomize-armor":
        await applyServerAction({ type: "randomize-armor" });
        break;
      case "reroll-armor":
        await applyServerAction({ type: "randomize-armor", reroll: true });
        break;
      case "randomize-shield":
        await applyServerAction({ type: "randomize-shield" });
        break;
      case "reroll-shield":
        await applyServerAction({ type: "randomize-shield", reroll: true });
        break;
      case "roll-health":
        await applyServerAction({ type: "roll-creation-health" });
        break;
      case "reroll-health":
        await applyServerAction({ type: "roll-creation-health", reroll: true });
        break;
      case "roll-general-virtue-bonus":
        await applyServerAction({ type: "roll-general-virtue-bonus" });
        break;
      case "reroll-general-virtue-bonus":
        await applyServerAction({ type: "roll-general-virtue-bonus", reroll: true });
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
    flash("error", error?.payload?.message || error.message || "Accion no completada.");
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
  queuePreview(getPreviewDelay(event.target));
});

document.addEventListener("keydown", (event) => {
  const tab = event.target.closest('[role="tab"][data-action="activate-race"]');
  if (!tab) {
    return;
  }

  const raceTabs = [...document.querySelectorAll('[role="tab"][data-action="activate-race"]')];
  if (raceTabs.length === 0) {
    return;
  }

  const currentIndex = raceTabs.indexOf(tab);
  if (currentIndex < 0) {
    return;
  }

  const moveFocusToRace = (index) => {
    const normalizedIndex = ((index % raceTabs.length) + raceTabs.length) % raceTabs.length;
    const nextRaceId = raceTabs[normalizedIndex]?.dataset.race;
    if (!nextRaceId) {
      return;
    }
    event.preventDefault();
    activateRace(nextRaceId, { focusTab: true });
  };

  switch (event.key) {
    case "ArrowUp":
    case "ArrowLeft":
      moveFocusToRace(currentIndex - 1);
      break;
    case "ArrowDown":
    case "ArrowRight":
      moveFocusToRace(currentIndex + 1);
      break;
    case "Home":
      moveFocusToRace(0);
      break;
    case "End":
      moveFocusToRace(raceTabs.length - 1);
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      confirmActiveRace();
      break;
    default:
      break;
  }
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
    state.activeRaceId = resolveActiveRaceId(state.catalogs?.races, state.draft.raceId, state.activeRaceId, readActiveRacePreference());
    persistActiveRace();
    await refreshPreview({ immediate: true });
    flash("success", "JSON importado en el editor. Revisa la ficha y guarda cuando termine.");
  } catch {
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
    state.activeRaceId = resolveActiveRaceId(data.catalogs?.races, state.draft.raceId, readActiveRacePreference());
    persistActiveRace();
    await refreshPreview({ immediate: true, silentMessage: true });
  } catch (error) {
    flash("error", error.message || "No se pudo iniciar la aplicacion.");
  } finally {
    state.loading = false;
    render();
  }
}

function render() {
  const focusState = captureFocusState();
  root.innerHTML = renderApp(state);
  restoreFocusState(focusState);
}

function queuePreview(delay = 120) {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    refreshPreview({ immediate: true });
  }, delay);
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
  state.activeRaceId = resolveActiveRaceId(state.catalogs?.races, state.activeRaceId, state.draft.raceId, readActiveRacePreference());
  persistActiveRace();
  render();

  if (state.autosaveEnabled) {
    queueAutosave();
  }

  if (!silentMessage && immediate) {
    state.message = null;
  }
}

async function applyServerAction(action) {
  if (!state.catalogs) {
    return;
  }

  const currentStep = state.draft.ui.step;
  const response = await api.applyAction(state.draft, action);
  state.preview = response.preview;
  state.draft = {
    ...response.draft,
    ui: {
      step: currentStep
    }
  };
  render();

  if (state.autosaveEnabled) {
    queueAutosave();
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

function activateRace(raceId, options = {}) {
  state.activeRaceId = resolveActiveRaceId(state.catalogs?.races, raceId, state.activeRaceId, state.draft.raceId);
  persistActiveRace();
  render();

  if (options.focusTab) {
    window.requestAnimationFrame(() => {
      const activeTab = document.getElementById(`race-tab-${state.activeRaceId}`);
      activeTab?.focus({ preventScroll: true });
    });
  }
}

function confirmActiveRace() {
  const nextRaceId = resolveActiveRaceId(state.catalogs?.races, state.activeRaceId, state.draft.raceId);
  if (!nextRaceId) {
    return;
  }

  if (state.draft.raceId === nextRaceId) {
    flash("info", "La raza activa ya esta confirmada.");
    return;
  }

  selectRace(nextRaceId);
  flash("success", `Raza confirmada: ${findRaceById(nextRaceId)?.name || nextRaceId}`);
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
  state.activeRaceId = raceId;
  persistActiveRace();
  queuePreview();
}

function toggleItemInArray(key, id, limit) {
  const current = new Set(state.draft[key] || []);
  if (current.has(id)) {
    current.delete(id);
  } else {
    if (current.size >= limit) {
      flash("warning", `No puedes seleccionar mas de ${limit} opcion(es) en este paso.`);
      render();
      return;
    }
    current.add(id);
  }
  state.draft[key] = [...current];
}

function clearOffensiveEquipment() {
  state.draft.equipment.primaryId = "";
  state.draft.equipment.primaryInitialId = "";
  state.draft.equipment.primaryRerollsUsed = 0;
}

function clearDefensiveEquipment() {
  state.draft.equipment.armorId = "";
  state.draft.equipment.armorInitialId = "";
  state.draft.equipment.armorRerollsUsed = 0;
  state.draft.equipment.shieldId = "";
  state.draft.equipment.shieldInitialId = "";
  state.draft.equipment.shieldRerollsUsed = 0;
}

async function saveCharacter() {
  const response = state.editingCharacterId
    ? await api.updateCharacter(state.editingCharacterId, state.draft)
    : await api.createCharacter(state.draft);

  const wasEditing = Boolean(state.editingCharacterId);
  state.editingCharacterId = response.id;
  state.autosaveMeta = null;
  const list = await api.listCharacters();
  state.characters = list.characters;
  await loadCharacter(response.id, { announce: false });
  flash("success", wasEditing ? "Personaje guardado correctamente." : "Personaje creado correctamente.");
}

async function loadCharacter(id, options = {}) {
  const character = await api.getCharacter(id);
  state.editingCharacterId = character.id;
  state.draft = character.draft;
  state.activeRaceId = resolveActiveRaceId(state.catalogs?.races, character.draft.raceId, state.activeRaceId);
  persistActiveRace();
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
    state.activeRaceId = resolveActiveRaceId(state.catalogs?.races, readActiveRacePreference());
    persistActiveRace();
    await refreshPreview({ immediate: true, silentMessage: true });
  }
  flash("info", "Personaje eliminado.");
}

async function exportSavedCharacter(id) {
  const downloadUrl = api.exportCharacterToWord(id);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `personaje_kepler282c.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  flash("success", "Personaje exportado a Word.");
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
    version: 2,
    name: "",
    raceId: "",
    notes: "",
    level: 1,
    lunarChoice: "",
    extraAttribute: "",
    generalVirtues: {},
    generalVirtueBonus: {
      category: "",
      die: "",
      initialValue: 0,
      value: 0,
      rerollsUsed: 0
    },
    lunarVirtueIds: [],
    selectedDoteIds: [],
    offensiveOrientation: "",
    defensiveOrientation: "",
    equipment: {
      primaryId: "",
      primaryInitialId: "",
      primaryRerollsUsed: 0,
      armorId: "",
      armorInitialId: "",
      armorRerollsUsed: 0,
      shieldId: "",
      shieldInitialId: "",
      shieldRerollsUsed: 0
    },
    creationHealth: {
      die: "",
      initialValue: 0,
      value: 0,
      rerollsUsed: 0
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

function readActiveRacePreference() {
  try {
    return localStorage.getItem(ACTIVE_RACE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function persistActiveRace() {
  try {
    if (state.activeRaceId) {
      localStorage.setItem(ACTIVE_RACE_STORAGE_KEY, state.activeRaceId);
    }
  } catch {
    // noop
  }
}

function resolveActiveRaceId(races, ...candidates) {
  const available = Array.isArray(races) ? races.map((race) => race.id) : [];
  for (const candidate of candidates) {
    const normalized = String(candidate || "").trim();
    if (available.includes(normalized)) {
      return normalized;
    }
  }
  return available[0] || "";
}

function findRaceById(raceId) {
  return state.catalogs?.races?.find((race) => race.id === raceId) || null;
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

function getPreviewDelay(element) {
  if (!element) {
    return 120;
  }

  if (element.tagName === "TEXTAREA") {
    return 350;
  }

  if (element.tagName === "INPUT" && ["text", "search", "email", "url"].includes(element.type || "text")) {
    return 250;
  }

  return 120;
}

function captureFocusState() {
  const activeElement = document.activeElement;

  if (!activeElement || !root.contains(activeElement)) {
    return null;
  }

  const field = activeElement.dataset?.field;
  if (!field) {
    return null;
  }

  return {
    field,
    selectionStart: typeof activeElement.selectionStart === "number" ? activeElement.selectionStart : null,
    selectionEnd: typeof activeElement.selectionEnd === "number" ? activeElement.selectionEnd : null,
    scrollY: window.scrollY
  };
}

function restoreFocusState(focusState) {
  if (!focusState?.field) {
    return;
  }

  const selector = `[data-field="${escapeAttributeValue(focusState.field)}"]`;
  const nextElement = root.querySelector(selector);
  if (!nextElement) {
    return;
  }

  nextElement.focus({ preventScroll: true });

  if (
    typeof focusState.selectionStart === "number" &&
    typeof focusState.selectionEnd === "number" &&
    typeof nextElement.setSelectionRange === "function"
  ) {
    const valueLength = typeof nextElement.value === "string" ? nextElement.value.length : 0;
    const start = Math.min(focusState.selectionStart, valueLength);
    const end = Math.min(focusState.selectionEnd, valueLength);
    nextElement.setSelectionRange(start, end);
  }

  if (typeof focusState.scrollY === "number") {
    window.scrollTo({ top: focusState.scrollY, left: window.scrollX });
  }
}

function escapeAttributeValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
