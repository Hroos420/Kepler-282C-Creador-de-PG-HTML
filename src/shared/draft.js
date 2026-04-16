import {
  ATTRIBUTE_ORDER,
  CREATION_LEVEL,
  DATA_VERSION,
  RACE_BY_ID,
  RACE_DEFINITIONS,
  STEP_DEFINITIONS
} from "./race-data.js";

export function createEmptyDraft() {
  return {
    version: DATA_VERSION,
    name: "",
    raceId: "",
    notes: "",
    level: CREATION_LEVEL,
    lunarChoice: "",
    extraAttribute: "",
    generalVirtues: {},
    generalVirtueBonus: createEmptyGeneralVirtueBonus(),
    lunarVirtueIds: [],
    selectedDoteIds: [],
    offensiveOrientation: "",
    defensiveOrientation: "",
    equipment: createEmptyEquipment(),
    creationHealth: createEmptyCreationHealth(),
    ui: {
      step: STEP_DEFINITIONS[0].id
    }
  };
}

export function normalizeDraft(input) {
  if (!input || typeof input !== "object") {
    return createEmptyDraft();
  }

  if ("raceKey" in input || "attrsFinal" in input) {
    return normalizeLegacyDraft(input);
  }

  const baseDraft = createEmptyDraft();
  const normalized = {
    ...baseDraft,
    ...input,
    version: Number(input.version || DATA_VERSION),
    name: String(input.name || "").trim(),
    raceId: String(input.raceId || "").trim(),
    notes: String(input.notes || "").trim(),
    level: Number(input.level || CREATION_LEVEL) || CREATION_LEVEL,
    lunarChoice: String(input.lunarChoice || "").trim(),
    extraAttribute: normalizeAttributeKey(input.extraAttribute),
    generalVirtues: normalizePointMap(input.generalVirtues),
    generalVirtueBonus: normalizeGeneralVirtueBonus(input.generalVirtueBonus),
    lunarVirtueIds: normalizeStringArray(input.lunarVirtueIds),
    selectedDoteIds: normalizeStringArray(input.selectedDoteIds),
    offensiveOrientation: normalizeOffensiveOrientation(input.offensiveOrientation || input.orientation),
    defensiveOrientation: normalizeDefensiveOrientation(input.defensiveOrientation),
    equipment: normalizeEquipment(input.equipment),
    creationHealth: normalizeCreationHealth(input.creationHealth),
    ui: {
      step: normalizeStep(input.ui?.step)
    }
  };

  if (!RACE_BY_ID.has(normalized.raceId)) {
    normalized.raceId = "";
  }

  return normalized;
}

function normalizeLegacyDraft(legacyRecord) {
  const raceId = String(legacyRecord.raceKey || "").trim();
  const baseDraft = createEmptyDraft();
  const race = RACE_BY_ID.get(raceId);
  const attrsFinal = legacyRecord.attrsFinal || {};

  return {
    ...baseDraft,
    version: DATA_VERSION,
    name: String(legacyRecord.name || "").trim(),
    raceId,
    notes: String(legacyRecord.notes || "").trim(),
    level: CREATION_LEVEL,
    lunarChoice: inferLegacyLunarChoice(raceId, legacyRecord),
    extraAttribute: inferExtraAttribute(race, attrsFinal),
    generalVirtues: normalizePointMap(legacyRecord.virtues),
    generalVirtueBonus: createEmptyGeneralVirtueBonus(),
    lunarVirtueIds: normalizeStringArray(legacyRecord.lunarVirtues),
    selectedDoteIds: normalizeStringArray(legacyRecord.dotes),
    offensiveOrientation: inferLegacyOrientation(legacyRecord),
    defensiveOrientation: "",
    equipment: createEmptyEquipment(),
    creationHealth: createEmptyCreationHealth(),
    ui: {
      step: STEP_DEFINITIONS.at(-1).id
    }
  };
}

function inferLegacyLunarChoice(raceId, legacyRecord) {
  const lvlMag = Number(legacyRecord.lvlMag || 0);
  const lvlMal = Number(legacyRecord.lvlMal || 0);

  if (raceId !== "roboticos" && raceId !== "antropeltis") {
    return "";
  }

  if (lvlMag > lvlMal) {
    return "azul";
  }

  if (lvlMal > lvlMag) {
    return "roja";
  }

  return "";
}

function inferExtraAttribute(race, attrsFinal) {
  if (!race || !attrsFinal || typeof attrsFinal !== "object") {
    return "";
  }

  for (const key of ATTRIBUTE_ORDER) {
    const baseValue = Number(race.baseAttributes[key] || 0);
    const finalValue = Number(attrsFinal[key] || baseValue);
    if (finalValue === baseValue + 1) {
      return key;
    }
  }

  return "";
}

function inferLegacyOrientation(legacyRecord) {
  const category = legacyRecord?.calcs?.weapon?.categoria || legacyRecord?.equipment?.weapon?.categoria || "";

  switch (category) {
    case "arma-cc":
      return "melee";
    case "arma-ad":
      return "ranged";
    case "foco":
      return "magic";
    case "instrumento":
      return "performance";
    default:
      return "";
  }
}

function normalizeStep(value) {
  const step = Number(value || STEP_DEFINITIONS[0].id);
  const min = STEP_DEFINITIONS[0].id;
  const max = STEP_DEFINITIONS.at(-1).id;
  return Math.min(max, Math.max(min, step));
}

function normalizeEquipment(value) {
  return {
    primaryId: String(value?.primaryId || "").trim(),
    primaryInitialId: String(value?.primaryInitialId || "").trim(),
    primaryRerollsUsed: normalizeCounter(value?.primaryRerollsUsed),
    armorId: String(value?.armorId || "").trim(),
    armorInitialId: String(value?.armorInitialId || "").trim(),
    armorRerollsUsed: normalizeCounter(value?.armorRerollsUsed),
    shieldId: String(value?.shieldId || "").trim(),
    shieldInitialId: String(value?.shieldInitialId || "").trim(),
    shieldRerollsUsed: normalizeCounter(value?.shieldRerollsUsed)
  };
}

function createEmptyEquipment() {
  return {
    primaryId: "",
    primaryInitialId: "",
    primaryRerollsUsed: 0,
    armorId: "",
    armorInitialId: "",
    armorRerollsUsed: 0,
    shieldId: "",
    shieldInitialId: "",
    shieldRerollsUsed: 0
  };
}

function createEmptyGeneralVirtueBonus() {
  return {
    die: "",
    initialValue: 0,
    value: 0,
    rerollsUsed: 0
  };
}

function createEmptyCreationHealth() {
  return {
    die: "",
    initialValue: 0,
    value: 0,
    rerollsUsed: 0
  };
}

function normalizeGeneralVirtueBonus(value) {
  return {
    die: String(value?.die || "").trim().toLowerCase(),
    initialValue: normalizeCounter(value?.initialValue),
    value: normalizeCounter(value?.value),
    rerollsUsed: normalizeCounter(value?.rerollsUsed)
  };
}

function normalizeCreationHealth(value) {
  return {
    die: String(value?.die || "").trim().toLowerCase(),
    initialValue: normalizeCounter(value?.initialValue),
    value: normalizeCounter(value?.value),
    rerollsUsed: normalizeCounter(value?.rerollsUsed)
  };
}

function normalizePointMap(value) {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, rawValue]) => [String(key), Number(rawValue || 0)])
      .filter(([, pointValue]) => Number.isFinite(pointValue) && pointValue > 0)
  );
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalizeAttributeKey(value) {
  const key = String(value || "").trim().toUpperCase();
  return ATTRIBUTE_ORDER.includes(key) ? key : "";
}

function normalizeOffensiveOrientation(value) {
  const key = String(value || "").trim();
  return ["melee", "ranged", "magic", "performance"].includes(key) ? key : "";
}

function normalizeDefensiveOrientation(value) {
  const key = String(value || "").trim();
  return ["resistance", "evasion"].includes(key) ? key : "";
}

function normalizeCounter(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }
  return Math.floor(number);
}

export function serializeDraft(draft) {
  return JSON.parse(JSON.stringify(normalizeDraft(draft)));
}

export function summarizeDraftIdentity(draft) {
  const normalized = normalizeDraft(draft);
  const race = RACE_DEFINITIONS.find((entry) => entry.id === normalized.raceId);
  return {
    name: normalized.name || "Sin nombre",
    raceName: race?.name || "Sin raza",
    level: normalized.level
  };
}
