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
    lunarVirtueIds: [],
    selectedDoteIds: [],
    orientation: "",
    equipment: {
      primaryId: "",
      armorId: "",
      shieldId: ""
    },
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
    lunarVirtueIds: normalizeStringArray(input.lunarVirtueIds),
    selectedDoteIds: normalizeStringArray(input.selectedDoteIds),
    orientation: String(input.orientation || "").trim(),
    equipment: normalizeEquipment(input.equipment),
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
    lunarVirtueIds: normalizeStringArray(legacyRecord.lunarVirtues),
    selectedDoteIds: normalizeStringArray(legacyRecord.dotes),
    orientation: inferLegacyOrientation(legacyRecord),
    equipment: {
      primaryId: "",
      armorId: "",
      shieldId: ""
    },
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
    armorId: String(value?.armorId || "").trim(),
    shieldId: String(value?.shieldId || "").trim()
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
