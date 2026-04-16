import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ORDER,
  CREATION_GENERAL_VIRTUE_CAP,
  CREATION_LEVEL,
  MOON_LABELS,
  ORIENTATION_DEFINITIONS,
  RACE_BY_ID,
  STEP_DEFINITIONS
} from "../shared/race-data.js";
import { normalizeDraft, serializeDraft } from "../shared/draft.js";

const EMPTY_ITEM = {
  id: "",
  name: "Sin seleccionar",
  category: "none",
  type: "Ninguno",
  rarity: "—",
  range: "—",
  attackBonus: 0,
  lunarBonus: 0,
  lunarBonusText: "—",
  lunarAffinity: "",
  damage: "—",
  ability: "—",
  description: "Sin pieza equipada.",
  resistanceBonus: 0,
  dodgeBonus: 0,
  damageReduction: 0,
  movementPenalty: 0,
  rawText: "",
  tags: ["none"]
};

export function buildPreview(inputDraft, catalogs) {
  const draft = normalizeDraft(inputDraft);
  const race = RACE_BY_ID.get(draft.raceId) || null;
  const lunarState = resolveLunarState(draft, race);
  const attributes = resolveAttributes(draft, race);
  const generalVirtues = resolveGeneralVirtues(draft, race, catalogs.generalVirtues);
  const lunarVirtues = resolveLunarVirtues(draft, race, lunarState, attributes, catalogs.lunarVirtues);
  const dotes = resolveDotes(draft, race, attributes, lunarState, generalVirtues, catalogs.dotes);
  const equipment = resolveEquipment(draft, lunarState, catalogs.equipment);
  const derived = resolveDerivedStats(race, attributes, lunarState, equipment, draft.level, lunarVirtues.selectedItems);
  const validations = resolveStepValidations({
    draft,
    race,
    lunarState,
    attributes,
    generalVirtues,
    lunarVirtues,
    dotes,
    equipment
  });

  return {
    draft: serializeDraft(draft),
    summary: buildSummary(draft, race, lunarState, attributes, generalVirtues, lunarVirtues, dotes, equipment, derived),
    validations,
    hints: buildHints(race, lunarState, lunarVirtues, equipment)
  };
}

function resolveLunarState(draft, race) {
  if (!race) {
    return {
      magico: 0,
      maldito: 0,
      access: [],
      needsChoice: false,
      choiceOptions: [],
      choiceLabel: "",
      messages: []
    };
  }

  if (race.lunarMode === "dual") {
    return {
      magico: race.baseLunarLevels.magico,
      maldito: race.baseLunarLevels.maldito,
      access: ["azul", "roja"],
      needsChoice: false,
      choiceOptions: [],
      choiceLabel: "Acceso dual",
      messages: ["Esta raza puede elegir virtudes iniciales de ambas lunas."]
    };
  }

  if (race.lunarMode === "fixed") {
    const access = [];
    if (race.baseLunarLevels.magico > 0) {
      access.push("azul");
    }
    if (race.baseLunarLevels.maldito > 0) {
      access.push("roja");
    }
    return {
      magico: race.baseLunarLevels.magico,
      maldito: race.baseLunarLevels.maldito,
      access,
      needsChoice: false,
      choiceOptions: [],
      choiceLabel: access.length === 2 ? "Acceso dual" : `Acceso ${MOON_LABELS[access[0]] || "fijo"}`,
      messages: [`La raza solo puede iniciar con ${access.map((moon) => MOON_LABELS[moon]).join(" y ")}.`]
    };
  }

  const selectedChoice = race.lunarChoices?.[draft.lunarChoice];
  const magico = selectedChoice?.levels?.magico || 0;
  const maldito = selectedChoice?.levels?.maldito || 0;
  const access = [];

  if (magico > 0) {
    access.push("azul");
  }
  if (maldito > 0) {
    access.push("roja");
  }

  return {
    magico,
    maldito,
    access,
    needsChoice: true,
    choiceOptions: Object.entries(race.lunarChoices || {}).map(([id, option]) => ({
      id,
      title: option.title,
      description: option.description,
      levels: option.levels
    })),
    choiceLabel: selectedChoice ? selectedChoice.title : "Elección pendiente",
    messages: selectedChoice
      ? [`${race.name} queda alineado con ${selectedChoice.title}.`]
      : ["Debes resolver la senda o el núcleo lunar antes de continuar."]
  };
}

function resolveAttributes(draft, race) {
  const base = race ? { ...race.baseAttributes } : emptyAttributes();
  const final = { ...base };
  const errors = [];

  if (draft.extraAttribute) {
    if (!ATTRIBUTE_ORDER.includes(draft.extraAttribute)) {
      errors.push("El punto extra solo puede asignarse a Físico, Destreza, Social o Mental.");
    } else {
      final[draft.extraAttribute] += 1;
    }
  }

  return {
    base,
    final,
    errors,
    extraAttributeLabel: ATTRIBUTE_LABELS[draft.extraAttribute] || ""
  };
}

function resolveGeneralVirtues(draft, race, catalog) {
  const selected = Object.fromEntries(
    Object.entries(draft.generalVirtues || {}).map(([id, value]) => [id, Number(value || 0)])
  );
  const used = Object.values(selected).reduce((total, value) => total + value, 0);
  const pool = race ? race.generalVirtuePool : 0;
  const remaining = pool - used;
  const errors = [];
  const itemsById = new Map();

  catalog.forEach((group) => {
    group.items.forEach((item) => itemsById.set(item.id, item));
  });

  Object.entries(selected).forEach(([id, value]) => {
    if (!itemsById.has(id)) {
      errors.push(`La virtud general "${id}" no existe en el catálogo cargado.`);
    }
    if (value < 0) {
      errors.push(`La virtud "${id}" no puede quedar en negativo.`);
    }
    if (value > CREATION_GENERAL_VIRTUE_CAP) {
      errors.push(`La virtud "${itemsById.get(id)?.name || id}" supera el cap de creación (${CREATION_GENERAL_VIRTUE_CAP}).`);
    }
  });

  if (remaining < 0) {
    errors.push("La asignación de Técnica / Erudición / Dominio excede el pool inicial de la raza.");
  }

  return {
    pool,
    used,
    remaining,
    selected,
    errors,
    groups: catalog.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        selected: selected[item.id] || 0
      }))
    }))
  };
}

function resolveLunarVirtues(draft, race, lunarState, attributes, catalog) {
  const availableItems = catalog.filter((item) => lunarState.access.includes(item.moon));
  const availableById = new Map(availableItems.map((item) => [item.id, item]));
  const selectedIds = [...new Set(draft.lunarVirtueIds || [])];
  const selectedItems = selectedIds.map((id) => availableById.get(id)).filter(Boolean);
  const invalidSelected = selectedIds.filter((id) => !availableById.has(id));
  const errors = [];
  const limit = race ? race.lunarVirtueLimit : 0;

  if (invalidSelected.length > 0) {
    errors.push("Hay virtudes lunares seleccionadas que no están habilitadas para la raza o la senda elegida.");
  }

  if (selectedItems.length > limit) {
    errors.push(`Solo puedes elegir ${limit} virtud(es) lunar(es) al inicio.`);
  }

  const grouped = {
    azul: groupLunarVirtues(availableItems.filter((item) => item.moon === "azul"), attributes.final, lunarState.magico),
    roja: groupLunarVirtues(availableItems.filter((item) => item.moon === "roja"), attributes.final, lunarState.maldito)
  };

  return {
    limit,
    selectedIds,
    selectedItems,
    errors,
    grouped,
    accessSummary: lunarState.access.map((moon) => MOON_LABELS[moon]).join(" y ") || "Sin acceso lunar"
  };
}

function resolveDotes(draft, race, attributes, lunarState, generalVirtues, catalog) {
  const selectedIds = [...new Set(draft.selectedDoteIds || [])];
  const virtTotals = {
    tecnica: totalPointsByCategory(generalVirtues.groups, generalVirtues.selected, "tecnica"),
    estudio: totalPointsByCategory(generalVirtues.groups, generalVirtues.selected, "estudio"),
    dominio: totalPointsByCategory(generalVirtues.groups, generalVirtues.selected, "dominio")
  };
  const selectedSet = new Set(selectedIds);
  const character = {
    nivel: draft.level || CREATION_LEVEL,
    raceKey: race?.id || "",
    attrs: attributes.final,
    lvlMag: lunarState.magico,
    lvlMal: lunarState.maldito,
    virtTotals,
    hasDote(id) {
      return selectedSet.has(id);
    }
  };

  const freeLimit = 1;
  const evaluations = catalog.map((dote) => {
    const available = safelyEvaluateDote(dote, character);
    return {
      id: dote.id,
      name: dote.name,
      type: dote.type,
      description: dote.description,
      requirementsText: dote.requirementsText,
      available,
      blockedReason: available ? "" : `No disponible: ${dote.requirementsText}`,
      selected: selectedSet.has(dote.id)
    };
  });

  const errors = [];

  if (selectedIds.length > freeLimit) {
    errors.push("Solo puedes seleccionar 1 dote libre en nivel 1.");
  }

  evaluations.forEach((entry) => {
    if (entry.selected && !entry.available) {
      errors.push(`El dote "${entry.name}" ya no cumple requisitos.`);
    }
  });

  return {
    freeLimit,
    selectedIds,
    errors,
    evaluations,
    racialDote: {
      status: "unmapped",
      title: "Dote racial sin mapeo explícito",
      description:
        "El documento exige 1 dote racial al nivel 1, pero el catálogo cargado en este proyecto no incluye una asignación raza → dote. La UI deja preparado el slot y avisa la limitación sin inventar una regla."
    }
  };
}

function resolveEquipment(draft, lunarState, catalog) {
  const primary = selectItem(catalog, draft.equipment?.primaryId);
  const armor = selectItem(catalog, draft.equipment?.armorId) || EMPTY_ITEM;
  const shield = selectItem(catalog, draft.equipment?.shieldId) || EMPTY_ITEM;
  const orientation = draft.orientation;

  const availablePrimary = catalog.filter((item) => isPrimaryItem(item)).map((item) => ({
    ...item,
    allowed: itemAllowedForOrientation(item, orientation, lunarState),
    blockedReason: itemBlockedReason(item, orientation, lunarState)
  }));

  const availableArmor = [EMPTY_ITEM, ...catalog.filter((item) => item.category === "armor")];
  const availableShield = [EMPTY_ITEM, ...catalog.filter((item) => item.category === "shield")];
  const errors = [];

  if (primary && primary.id && !itemAllowedForOrientation(primary, orientation, lunarState)) {
    errors.push(itemBlockedReason(primary, orientation, lunarState) || "El equipo principal seleccionado no coincide con la orientación elegida.");
  }

  return {
    selected: {
      primary: primary || EMPTY_ITEM,
      armor,
      shield
    },
    errors,
    orientation,
    availablePrimary,
    availableArmor,
    availableShield
  };
}

function resolveDerivedStats(race, attributes, lunarState, equipment, level, selectedLunarVirtues) {
  if (!race) {
    return null;
  }

  const primary = equipment.selected.primary;
  const armor = equipment.selected.armor;
  const shield = equipment.selected.shield;
  const meleeBonus = primary.category === "melee" ? primary.attackBonus : 0;
  const rangedBonus = primary.category === "ranged" ? primary.attackBonus : 0;
  const lunarItemBonus = primary.category === "focus" || primary.category === "instrument" || primary.lunarBonus > 0 ? primary.lunarBonus : 0;
  const resistance = attributes.final.FIS + armor.resistanceBonus + shield.resistanceBonus + 10;
  const dodge = attributes.final.DES + armor.dodgeBonus + shield.dodgeBonus + 10;

  return {
    attackMelee: attributes.final.FIS + race.attackBase.melee + meleeBonus,
    attackRanged: attributes.final.DES + race.attackBase.ranged + rangedBonus,
    resistencia: resistance,
    esquivar: dodge,
    fortaleza: attributes.final.FIS + race.saveBase.fortaleza,
    reflejos: attributes.final.DES + race.saveBase.reflejos,
    voluntad: attributes.final.MEN + race.saveBase.voluntad,
    caracter: attributes.final.SOC + race.saveBase.caracter,
    health: race.healthBase,
    movement: race.movementBase - armor.movementPenalty - shield.movementPenalty,
    initiative: attributes.final.SOC + attributes.final.MEN,
    dcAzul: lunarState.magico > 0 ? 10 + level + lunarState.magico : 0,
    dcRoja: lunarState.maldito > 0 ? 10 + level + lunarState.maldito : 0,
    channelingBonus: lunarItemBonus,
    lunarResolutions: selectedLunarVirtues.map((virtue) => ({
      id: virtue.id,
      name: virtue.name,
      moon: virtue.moon,
      rootAttribute: virtue.rootAttribute,
      total:
        attributes.final[virtue.rootAttribute] +
        (virtue.moon === "azul" ? lunarState.magico : lunarState.maldito) +
        lunarItemBonus
    }))
  };
}

function resolveStepValidations({ draft, race, lunarState, attributes, generalVirtues, lunarVirtues, dotes, equipment }) {
  const stepResults = STEP_DEFINITIONS.map((step) => ({
    ...step,
    valid: true,
    errors: []
  }));

  const byKey = Object.fromEntries(stepResults.map((step) => [step.key, step]));

  if (!draft.name.trim()) {
    byKey.identity.valid = false;
    byKey.identity.errors.push("Define un nombre para el personaje.");
  }
  if (!race) {
    byKey.identity.valid = false;
    byKey.identity.errors.push("Selecciona una raza.");
  }

  if (lunarState.needsChoice && !draft.lunarChoice) {
    byKey.raceConfig.valid = false;
    byKey.raceConfig.errors.push("Debes resolver la senda o el núcleo lunar.");
  }

  if (!draft.extraAttribute) {
    byKey.extraPoint.valid = false;
    byKey.extraPoint.errors.push("El punto extra de creación sigue sin asignarse.");
  }

  attributes.errors.forEach((error) => {
    byKey.extraPoint.valid = false;
    byKey.extraPoint.errors.push(error);
  });

  if (generalVirtues.remaining !== 0 || generalVirtues.errors.length > 0) {
    byKey.generalVirtues.valid = false;
    if (generalVirtues.remaining > 0) {
      byKey.generalVirtues.errors.push(`Aún quedan ${generalVirtues.remaining} punto(s) sin repartir.`);
    }
    if (generalVirtues.remaining < 0) {
      byKey.generalVirtues.errors.push(`Sobran ${Math.abs(generalVirtues.remaining)} punto(s) asignados de más.`);
    }
    byKey.generalVirtues.errors.push(...generalVirtues.errors);
  }

  if (lunarVirtues.selectedItems.length !== lunarVirtues.limit || lunarVirtues.errors.length > 0) {
    byKey.lunarVirtues.valid = false;
    if (lunarVirtues.selectedItems.length < lunarVirtues.limit) {
      byKey.lunarVirtues.errors.push(`Debes elegir ${lunarVirtues.limit} virtud(es) lunar(es).`);
    }
    if (lunarVirtues.selectedItems.length > lunarVirtues.limit) {
      byKey.lunarVirtues.errors.push(`Hay más virtudes lunares seleccionadas que el límite permitido (${lunarVirtues.limit}).`);
    }
    byKey.lunarVirtues.errors.push(...lunarVirtues.errors);
  }

  if (dotes.selectedIds.length !== dotes.freeLimit || dotes.errors.length > 0) {
    byKey.dotes.valid = false;
    if (dotes.selectedIds.length < dotes.freeLimit) {
      byKey.dotes.errors.push("Selecciona 1 dote libre válido.");
    }
    byKey.dotes.errors.push(...dotes.errors);
  }

  if (!draft.orientation) {
    byKey.orientation.valid = false;
    byKey.orientation.errors.push("Debes fijar una orientación principal antes de elegir equipo.");
  }

  if (!equipment.selected.primary.id || equipment.errors.length > 0) {
    byKey.equipment.valid = false;
    if (!equipment.selected.primary.id) {
      byKey.equipment.errors.push("Selecciona un equipo principal compatible con tu orientación.");
    }
    byKey.equipment.errors.push(...equipment.errors);
  }

  byKey.summary.valid = STEP_DEFINITIONS.every((step) => step.key === "summary" || byKey[step.key].valid);
  if (!byKey.summary.valid) {
    byKey.summary.errors.push("Corrige los pasos pendientes antes de guardar o exportar.");
  }

  return {
    steps: stepResults,
    canSave: byKey.summary.valid,
    blockingErrors: stepResults.flatMap((step) => step.errors),
    warnings: [dotes.racialDote.description]
  };
}

function buildSummary(draft, race, lunarState, attributes, generalVirtues, lunarVirtues, dotes, equipment, derived) {
  return {
    identity: {
      name: draft.name || "Sin nombre",
      raceName: race?.name || "Sin raza",
      level: draft.level,
      notes: draft.notes
    },
    race,
    lunarState,
    attributes,
    generalVirtues,
    lunarVirtues,
    dotes,
    equipment,
    derived,
    orientation: ORIENTATION_DEFINITIONS.find((entry) => entry.id === draft.orientation) || null
  };
}

function buildHints(race, lunarState, lunarVirtues, equipment) {
  const hints = [];

  if (race) {
    hints.push(...race.notes);
  }

  if (lunarState.needsChoice && !lunarState.access.length) {
    hints.push("Hasta elegir senda lunar no se habilitan virtudes azules ni rojas.");
  }

  if (equipment.orientation === "performance") {
    hints.push("La orientación de interpretación filtra exclusivamente instrumentos.");
  }

  if (equipment.orientation === "magic") {
    hints.push("La orientación de canalización muestra focos y armas con bonificación lunar.");
  }

  if (lunarVirtues.selectedItems.some((entry) => entry.rootAttribute === "SOC")) {
    hints.push("Las virtudes sociales usan Social + nivel lunar + instrumento o artefacto.");
  }

  return [...new Set(hints)];
}

function groupLunarVirtues(items, finalAttributes, lunarLevel) {
  const groups = {
    FIS: [],
    DES: [],
    MEN: [],
    SOC: []
  };

  items.forEach((item) => {
    groups[item.rootAttribute].push({
      ...item,
      previewTotal: finalAttributes[item.rootAttribute] + lunarLevel
    });
  });

  return groups;
}

function totalPointsByCategory(groups, selected, categoryId) {
  return groups
    .filter((group) => group.id === categoryId)
    .flatMap((group) => group.items)
    .reduce((total, item) => total + (selected[item.id] || 0), 0);
}

function safelyEvaluateDote(dote, character) {
  try {
    return Boolean(dote.evaluate(character));
  } catch {
    return false;
  }
}

function itemAllowedForOrientation(item, orientation, lunarState) {
  if (!item || item.category === "none") {
    return true;
  }

  if (!orientation) {
    return false;
  }

  if (item.lunarAffinity === "azul" && lunarState.magico <= 0) {
    return false;
  }

  if (item.lunarAffinity === "roja" && lunarState.maldito <= 0) {
    return false;
  }

  switch (orientation) {
    case "melee":
      return item.category === "melee";
    case "ranged":
      return item.category === "ranged";
    case "magic":
      return item.category === "focus" || item.lunarBonus > 0;
    case "performance":
      return item.category === "instrument";
    default:
      return false;
  }
}

function itemBlockedReason(item, orientation, lunarState) {
  if (!orientation) {
    return "Primero define una orientación principal.";
  }

  if (item.lunarAffinity === "azul" && lunarState.magico <= 0) {
    return "El personaje no tiene acceso inicial a Luna Azul.";
  }

  if (item.lunarAffinity === "roja" && lunarState.maldito <= 0) {
    return "El personaje no tiene acceso inicial a Luna Roja.";
  }

  switch (orientation) {
    case "melee":
      return item.category === "melee" ? "" : "La orientación C.C. solo permite armas cuerpo a cuerpo.";
    case "ranged":
      return item.category === "ranged" ? "" : "La orientación a distancia solo permite armas A.D.";
    case "magic":
      return item.category === "focus" || item.lunarBonus > 0
        ? ""
        : "La orientación de canalización exige focos o piezas con bonificación lunar.";
    case "performance":
      return item.category === "instrument" ? "" : "La orientación de interpretación solo permite instrumentos.";
    default:
      return "La pieza no coincide con la orientación elegida.";
  }
}

function selectItem(catalog, itemId) {
  if (!itemId) {
    return null;
  }

  return catalog.find((item) => item.id === itemId) || null;
}

function isPrimaryItem(item) {
  return ["melee", "ranged", "focus", "instrument"].includes(item.category);
}

function emptyAttributes() {
  return {
    FIS: 0,
    DES: 0,
    SOC: 0,
    MEN: 0
  };
}
