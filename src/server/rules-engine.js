import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ORDER,
  CREATION_GENERAL_VIRTUE_CAP,
  CREATION_LEVEL,
  DEFENSIVE_ORIENTATION_DEFINITIONS,
  MOON_LABELS,
  OFFENSIVE_ORIENTATION_DEFINITIONS,
  RACE_BY_ID,
  STEP_DEFINITIONS
} from "../shared/race-data.js";
import { normalizeDraft, serializeDraft } from "../shared/draft.js";

const PRIMARY_REROLL_LIMIT = 1;
const ARMOR_REROLL_LIMIT = 1;
const SHIELD_REROLL_LIMIT = 1;
const GENERAL_VIRTUE_BONUS_REROLL_LIMIT = 2;
const CREATION_HEALTH_REROLL_LIMIT = 3;

const EMPTY_ITEM = {
  id: "",
  name: "Sin seleccionar",
  category: "none",
  mainCategory: "none",
  subtype: "Ninguno",
  type: "Ninguno",
  tags: ["none"],
  offensiveOrientations: [],
  defensiveOrientation: "neutral",
  rarity: "-",
  range: "-",
  bonus: {
    attack: 0,
    lunar: 0,
    resistance: 0,
    dodge: 0,
    damageReduction: 0,
    movementPenalty: 0
  },
  attackBonus: 0,
  lunarBonus: 0,
  lunarBonusText: "-",
  lunarAffinity: "",
  damage: "-",
  abilities: [],
  ability: "-",
  description: "Sin pieza equipada.",
  resistanceBonus: 0,
  dodgeBonus: 0,
  damageReduction: 0,
  movementPenalty: 0,
  compatibilities: {
    offensiveOrientations: [],
    defensiveOrientation: "neutral",
    lunarAccess: []
  },
  restrictions: [],
  rawText: ""
};

export function buildPreview(inputDraft, catalogs) {
  const draft = normalizeDraft(inputDraft);
  const race = RACE_BY_ID.get(draft.raceId) || null;
  const raceView = catalogs.races.find((entry) => entry.id === draft.raceId) || race;
  const lunarState = resolveLunarState(draft, race);
  const attributes = resolveAttributes(draft, race);
  const generalVirtueBonus = resolveGeneralVirtueBonus(draft, race);
  const generalVirtues = resolveGeneralVirtues(draft, race, catalogs.generalVirtues, generalVirtueBonus);
  const lunarVirtues = resolveLunarVirtues(draft, race, lunarState, attributes, catalogs.lunarVirtues);
  const dotes = resolveDotes(draft, race, attributes, lunarState, generalVirtues, catalogs.dotes);
  const creationHealth = resolveCreationHealth(draft, race);
  const equipment = resolveEquipment(draft, lunarState, catalogs.equipment);
  const derived = resolveDerivedStats(race, attributes, lunarState, equipment, draft.level, lunarVirtues.selectedItems, creationHealth);
  const validations = resolveStepValidations({
    draft,
    race,
    lunarState,
    attributes,
    generalVirtueBonus,
    generalVirtues,
    lunarVirtues,
    dotes,
    creationHealth,
    equipment
  });

  return {
    draft: serializeDraft(draft),
    summary: buildSummary(
      draft,
      raceView,
      lunarState,
      attributes,
      generalVirtueBonus,
      generalVirtues,
      lunarVirtues,
      dotes,
      creationHealth,
      equipment,
      derived
    ),
    validations,
    hints: buildHints(raceView || race, lunarState, generalVirtueBonus, lunarVirtues, equipment, creationHealth)
  };
}

export function applyDraftAction(inputDraft, catalogs, action, options = {}) {
  const updatedDraft = executeDraftAction(normalizeDraft(inputDraft), catalogs, action, options);
  return {
    draft: serializeDraft(updatedDraft),
    preview: buildPreview(updatedDraft, catalogs)
  };
}

export function calculateHealthTotal({ race, fisico, creationHealthValue, miscBonus = 0, levelBonus = 0 }) {
  if (!race) {
    return {
      raceBase: 0,
      fisico: 0,
      miscBonus: 0,
      levelBonus: 0,
      creationDie: 0,
      total: 0
    };
  }

  const raceBase = Number(race.healthBase || 0);
  const attributeBonus = Number(fisico || 0);
  const permanentCreationDie = Number(creationHealthValue || 0);
  const validatedMiscBonus = Number(miscBonus || 0);
  const validatedLevelBonus = Number(levelBonus || 0);

  return {
    raceBase,
    fisico: attributeBonus,
    miscBonus: validatedMiscBonus,
    levelBonus: validatedLevelBonus,
    creationDie: permanentCreationDie,
    total: raceBase + attributeBonus + validatedMiscBonus + validatedLevelBonus + permanentCreationDie
  };
}

export function parseDieSides(die) {
  const match = /^d(\d+)$/i.exec(String(die || "").trim());
  return match ? Number(match[1]) : 0;
}

function executeDraftAction(draft, catalogs, action, options) {
  const nextDraft = serializeDraft(draft);
  const actionType = String(action?.type || "").trim();

  switch (actionType) {
    case "randomize-primary":
      return updateEquipmentRoll(nextDraft, catalogs, {
        slot: "primary",
        reroll: Boolean(action?.reroll),
        random: options.random
      });
    case "randomize-armor":
      return updateEquipmentRoll(nextDraft, catalogs, {
        slot: "armor",
        reroll: Boolean(action?.reroll),
        random: options.random
      });
    case "randomize-shield":
      return updateEquipmentRoll(nextDraft, catalogs, {
        slot: "shield",
        reroll: Boolean(action?.reroll),
        random: options.random
      });
    case "roll-creation-health":
      return updateCreationHealthRoll(nextDraft, {
        reroll: Boolean(action?.reroll),
        random: options.random
      });
    case "roll-general-virtue-bonus":
      return updateGeneralVirtueBonusRoll(nextDraft, {
        reroll: Boolean(action?.reroll),
        random: options.random
      });
    default:
      throw new Error("Accion de creador no soportada.");
  }
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
    choiceLabel: selectedChoice ? selectedChoice.title : "Eleccion pendiente",
    messages: selectedChoice
      ? [`${race.name} queda alineado con ${selectedChoice.title}.`]
      : ["Debes resolver la senda o el nucleo lunar antes de continuar."]
  };
}

function resolveAttributes(draft, race) {
  const base = race ? { ...race.baseAttributes } : emptyAttributes();
  const final = { ...base };
  const errors = [];

  if (draft.extraAttribute) {
    if (!ATTRIBUTE_ORDER.includes(draft.extraAttribute)) {
      errors.push("El punto extra solo puede asignarse a Fisico, Destreza, Social o Mental.");
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

function resolveGeneralVirtueBonus(draft, race) {
  const die = race?.generalVirtueDie || "";
  const sides = parseDieSides(die);
  const storedDie = String(draft.generalVirtueBonus?.die || "").trim().toLowerCase();
  const rawValue = Number(draft.generalVirtueBonus?.value || 0);
  const rawInitial = Number(draft.generalVirtueBonus?.initialValue || 0);
  const rerollsUsed = clampCounter(draft.generalVirtueBonus?.rerollsUsed, GENERAL_VIRTUE_BONUS_REROLL_LIMIT);
  const errors = [];
  const dieMismatch = Boolean(storedDie && die && storedDie !== die);

  if (dieMismatch && rawValue > 0) {
    errors.push("El dado racial de virtudes guardado no coincide con la raza actual.");
  }

  const value = dieMismatch ? 0 : sanitizeRolledValue(rawValue, sides);
  const initialValue = dieMismatch ? 0 : sanitizeRolledValue(rawInitial || value, sides);

  if (rawValue > 0 && value !== rawValue) {
    errors.push("La tirada del dado racial de virtudes quedo fuera del rango permitido y fue normalizada.");
  }

  return {
    die,
    sides,
    initialValue,
    value,
    rerollsUsed,
    rerollsRemaining: Math.max(0, GENERAL_VIRTUE_BONUS_REROLL_LIMIT - rerollsUsed),
    rerollsMax: GENERAL_VIRTUE_BONUS_REROLL_LIMIT,
    hasRolled: value > 0,
    canRoll: Boolean(race) && value <= 0 && sides > 0,
    canReroll: Boolean(race) && value > 0 && rerollsUsed < GENERAL_VIRTUE_BONUS_REROLL_LIMIT,
    isLocked: value > 0 && rerollsUsed >= GENERAL_VIRTUE_BONUS_REROLL_LIMIT,
    errors
  };
}

function resolveGeneralVirtues(draft, race, catalog, generalVirtueBonus) {
  const selected = Object.fromEntries(
    Object.entries(draft.generalVirtues || {}).map(([id, value]) => [id, Number(value || 0)])
  );
  const used = Object.values(selected).reduce((total, value) => total + value, 0);
  const basePool = race ? race.generalVirtuePool : 0;
  const bonusPool = generalVirtueBonus?.hasRolled ? generalVirtueBonus.value : 0;
  const pool = basePool + bonusPool;
  const remaining = pool - used;
  const errors = [];
  const itemsById = new Map();
  const spentByCategory = Object.fromEntries(catalog.map((group) => [group.id, 0]));

  catalog.forEach((group) => {
    group.items.forEach((item) => {
      itemsById.set(item.id, item);
      spentByCategory[group.id] += Number(selected[item.id] || 0);
    });
  });

  Object.entries(selected).forEach(([id, value]) => {
    if (!itemsById.has(id)) {
      errors.push(`La virtud general "${id}" no existe en el catalogo cargado.`);
    }
    if (value < 0) {
      errors.push(`La virtud "${id}" no puede quedar en negativo.`);
    }
    if (value > CREATION_GENERAL_VIRTUE_CAP) {
      errors.push(`La virtud "${itemsById.get(id)?.name || id}" supera el cap de creacion (${CREATION_GENERAL_VIRTUE_CAP}).`);
    }
  });

  if (remaining < 0) {
    errors.push("La asignacion de Tecnica / Erudicion / Dominio excede el pool inicial de la raza.");
  }

  const bonusApplied = Math.max(0, used - basePool);
  if (bonusApplied > bonusPool) {
    errors.push("La asignacion excede incluso el bono otorgado por el dado racial de virtudes.");
  }

  if (generalVirtueBonus?.errors?.length > 0) {
    errors.push(...generalVirtueBonus.errors);
  }

  return {
    basePool,
    bonusPool,
    pool,
    used,
    remaining,
    selected,
    spentByCategory,
    bonusApplied,
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
    errors.push("Hay virtudes lunares seleccionadas que no estan habilitadas para la raza o la senda elegida.");
  }

  if (selectedItems.length > limit) {
    errors.push(`Solo puedes elegir ${limit} virtud(es) lunar(es) al inicio.`);
  }

  return {
    limit,
    selectedIds,
    selectedItems,
    errors,
    grouped: {
      azul: groupLunarVirtues(availableItems.filter((item) => item.moon === "azul"), attributes.final, lunarState.magico),
      roja: groupLunarVirtues(availableItems.filter((item) => item.moon === "roja"), attributes.final, lunarState.maldito)
    },
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
      title: "Dote racial sin mapeo explicito",
      description:
        "El documento exige 1 dote racial al nivel 1, pero el catalogo cargado en este proyecto no incluye una asignacion raza -> dote. La UI deja preparado el slot y avisa la limitacion sin inventar una regla."
    }
  };
}

function resolveCreationHealth(draft, race) {
  const die = race?.healthDie || "";
  const sides = parseDieSides(die);
  const storedDie = String(draft.creationHealth?.die || "").trim().toLowerCase();
  const rawValue = Number(draft.creationHealth?.value || 0);
  const rawInitial = Number(draft.creationHealth?.initialValue || 0);
  const rerollsUsed = clampCounter(draft.creationHealth?.rerollsUsed, CREATION_HEALTH_REROLL_LIMIT);
  const errors = [];
  const dieMismatch = Boolean(storedDie && die && storedDie !== die);

  if (dieMismatch && rawValue > 0) {
    errors.push("El dado extra de vida guardado no coincide con el dado racial actual.");
  }

  const value = dieMismatch ? 0 : sanitizeRolledValue(rawValue, sides);
  const initialValue = dieMismatch ? 0 : sanitizeRolledValue(rawInitial || value, sides);

  if (rawValue > 0 && value !== rawValue) {
    errors.push("La tirada de vida extra quedo fuera del rango del dado racial y fue normalizada.");
  }

  return {
    die,
    sides,
    initialValue,
    value,
    rerollsUsed,
    rerollsRemaining: Math.max(0, CREATION_HEALTH_REROLL_LIMIT - rerollsUsed),
    rerollsMax: CREATION_HEALTH_REROLL_LIMIT,
    hasRolled: value > 0,
    canRoll: Boolean(race) && value <= 0 && sides > 0,
    canReroll: Boolean(race) && value > 0 && rerollsUsed < CREATION_HEALTH_REROLL_LIMIT,
    isLocked: value > 0 && rerollsUsed >= CREATION_HEALTH_REROLL_LIMIT,
    errors
  };
}

function resolveEquipment(draft, lunarState, catalog) {
  const primary = selectItem(catalog, draft.equipment?.primaryId) || EMPTY_ITEM;
  const armor = selectItem(catalog, draft.equipment?.armorId) || EMPTY_ITEM;
  const shield = selectItem(catalog, draft.equipment?.shieldId) || EMPTY_ITEM;
  const offensivePool = buildOffensivePool(catalog, draft.offensiveOrientation, lunarState);
  const armorPool = buildDefensivePool(catalog, draft.defensiveOrientation, lunarState, "armor");
  const shieldPool = buildDefensivePool(catalog, draft.defensiveOrientation, lunarState, "shield");
  const errors = [];

  if (primary.id && !offensivePool.items.some((item) => item.id === primary.id)) {
    errors.push(offensivePool.reasonById.get(primary.id) || "El arma principal ya no coincide con la orientacion ofensiva elegida.");
  }

  if (armor.id && !armorPool.items.some((item) => item.id === armor.id)) {
    errors.push(armorPool.reasonById.get(armor.id) || "La armadura ya no coincide con la orientacion defensiva elegida.");
  }

  if (shield.id && !shieldPool.items.some((item) => item.id === shield.id)) {
    errors.push(shieldPool.reasonById.get(shield.id) || "El escudo ya no coincide con la orientacion defensiva elegida.");
  }

  return {
    selected: {
      primary,
      armor,
      shield
    },
    offensiveOrientation: draft.offensiveOrientation,
    defensiveOrientation: draft.defensiveOrientation,
    offensive: buildRandomizedSlotState({
      label: "arma principal",
      current: primary,
      initialId: draft.equipment?.primaryInitialId,
      rerollsUsed: draft.equipment?.primaryRerollsUsed,
      rerollsLimit: PRIMARY_REROLL_LIMIT,
      pool: offensivePool,
      catalog
    }),
    defensive: {
      orientation: DEFENSIVE_ORIENTATION_DEFINITIONS.find((item) => item.id === draft.defensiveOrientation) || null,
      armor: buildRandomizedSlotState({
        label: "armadura",
        current: armor,
        initialId: draft.equipment?.armorInitialId,
        rerollsUsed: draft.equipment?.armorRerollsUsed,
        rerollsLimit: ARMOR_REROLL_LIMIT,
        pool: armorPool,
        catalog
      }),
      shield: buildRandomizedSlotState({
        label: "escudo",
        current: shield,
        initialId: draft.equipment?.shieldInitialId,
        rerollsUsed: draft.equipment?.shieldRerollsUsed,
        rerollsLimit: SHIELD_REROLL_LIMIT,
        pool: shieldPool,
        catalog
      })
    },
    errors
  };
}

function resolveDerivedStats(race, attributes, lunarState, equipment, level, selectedLunarVirtues, creationHealth) {
  if (!race) {
    return buildEmptyDerivedStats();
  }

  const primary = equipment.selected.primary;
  const armor = equipment.selected.armor;
  const shield = equipment.selected.shield;
  const meleeBonus = primary.category === "melee" ? primary.attackBonus : 0;
  const rangedBonus = primary.category === "ranged" ? primary.attackBonus : 0;
  const lunarItemBonus = itemAddsLunarBonus(primary) ? primary.lunarBonus : 0;
  const resistance = attributes.final.FIS + armor.resistanceBonus + shield.resistanceBonus + 10;
  const dodge = attributes.final.DES + armor.dodgeBonus + shield.dodgeBonus + 10;
  const healthBreakdown = calculateHealthTotal({
    race,
    fisico: attributes.final.FIS,
    creationHealthValue: creationHealth.value
  });

  return {
    attackMelee: attributes.final.FIS + race.attackBase.melee + meleeBonus,
    attackRanged: attributes.final.DES + race.attackBase.ranged + rangedBonus,
    resistencia: resistance,
    esquivar: dodge,
    fortaleza: attributes.final.FIS + race.saveBase.fortaleza,
    reflejos: attributes.final.DES + race.saveBase.reflejos,
    voluntad: attributes.final.MEN + race.saveBase.voluntad,
    caracter: attributes.final.SOC + race.saveBase.caracter,
    health: healthBreakdown.total,
    healthBreakdown,
    movement: Math.max(0, race.movementBase - armor.movementPenalty - shield.movementPenalty),
    initiative: attributes.final.SOC + attributes.final.MEN,
    damageReduction: armor.damageReduction + shield.damageReduction,
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

function resolveStepValidations({ draft, race, lunarState, attributes, generalVirtues, lunarVirtues, dotes, creationHealth, equipment }) {
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
    byKey.raceConfig.errors.push("Debes resolver la senda o el nucleo lunar.");
  }

  if (!draft.extraAttribute) {
    byKey.extraPoint.valid = false;
    byKey.extraPoint.errors.push("El punto extra de creacion sigue sin asignarse.");
  }

  attributes.errors.forEach((error) => {
    byKey.extraPoint.valid = false;
    byKey.extraPoint.errors.push(error);
  });

  if (generalVirtues.remaining !== 0 || generalVirtues.errors.length > 0) {
    byKey.generalVirtues.valid = false;
    if (generalVirtues.remaining > 0) {
      byKey.generalVirtues.errors.push(`Aun quedan ${generalVirtues.remaining} punto(s) sin repartir.`);
    }
    if (generalVirtues.remaining < 0) {
      byKey.generalVirtues.errors.push(`Sobran ${Math.abs(generalVirtues.remaining)} punto(s) asignados de mas.`);
    }
    byKey.generalVirtues.errors.push(...generalVirtues.errors);
  }

  if (lunarVirtues.selectedItems.length !== lunarVirtues.limit || lunarVirtues.errors.length > 0) {
    byKey.lunarVirtues.valid = false;
    if (lunarVirtues.selectedItems.length < lunarVirtues.limit) {
      byKey.lunarVirtues.errors.push(`Debes elegir ${lunarVirtues.limit} virtud(es) lunar(es).`);
    }
    if (lunarVirtues.selectedItems.length > lunarVirtues.limit) {
      byKey.lunarVirtues.errors.push(`Hay mas virtudes lunares seleccionadas que el limite permitido (${lunarVirtues.limit}).`);
    }
    byKey.lunarVirtues.errors.push(...lunarVirtues.errors);
  }

  if (dotes.selectedIds.length !== dotes.freeLimit || dotes.errors.length > 0) {
    byKey.dotes.valid = false;
    if (dotes.selectedIds.length < dotes.freeLimit) {
      byKey.dotes.errors.push("Selecciona 1 dote libre valido.");
    }
    byKey.dotes.errors.push(...dotes.errors);
  }

  if (!draft.offensiveOrientation) {
    byKey.orientation.valid = false;
    byKey.orientation.errors.push("Debes fijar una orientacion ofensiva principal antes de pasar al equipo.");
  }

  if (!draft.defensiveOrientation) {
    byKey.equipment.valid = false;
    byKey.equipment.errors.push("Debes fijar una orientacion defensiva antes de randomizar armadura y escudo.");
  }

  if (!equipment.selected.primary.id) {
    byKey.equipment.valid = false;
    byKey.equipment.errors.push(
      equipment.offensive.pool.length > 0
        ? "Debes randomizar el arma principal dentro del pool filtrado."
        : equipment.offensive.emptyMessage || "No hay arma principal valida para la orientacion elegida."
    );
  }

  if (!equipment.selected.armor.id && equipment.defensive.armor.pool.length > 0) {
    byKey.equipment.valid = false;
    byKey.equipment.errors.push("Debes randomizar una armadura compatible con la orientacion defensiva elegida.");
  }

  if (!equipment.selected.shield.id && equipment.defensive.shield.pool.length > 0) {
    byKey.equipment.valid = false;
    byKey.equipment.errors.push("Debes randomizar un escudo compatible con la orientacion defensiva elegida.");
  }

  if (!creationHealth.hasRolled) {
    byKey.equipment.valid = false;
    byKey.equipment.errors.push("Debes lanzar el dado extra de vida racial antes de cerrar la creacion.");
  }

  if (equipment.errors.length > 0) {
    byKey.equipment.valid = false;
    byKey.equipment.errors.push(...equipment.errors);
  }

  if (creationHealth.errors.length > 0) {
    byKey.equipment.valid = false;
    byKey.equipment.errors.push(...creationHealth.errors);
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

function buildSummary(
  draft,
  race,
  lunarState,
  attributes,
  generalVirtueBonus,
  generalVirtues,
  lunarVirtues,
  dotes,
  creationHealth,
  equipment,
  derived
) {
  const offensiveOrientation = OFFENSIVE_ORIENTATION_DEFINITIONS.find((entry) => entry.id === draft.offensiveOrientation) || null;
  const defensiveOrientation = DEFENSIVE_ORIENTATION_DEFINITIONS.find((entry) => entry.id === draft.defensiveOrientation) || null;

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
    generalVirtueBonus,
    generalVirtues,
    lunarVirtues,
    dotes,
    creationHealth,
    equipment,
    derived,
    offensiveOrientation,
    defensiveOrientation,
    orientation: offensiveOrientation
  };
}

function buildHints(race, lunarState, generalVirtueBonus, lunarVirtues, equipment, creationHealth) {
  const hints = [];

  if (race) {
    hints.push(...race.notes);
  }

  if (lunarState.needsChoice && !lunarState.access.length) {
    hints.push("Hasta elegir senda lunar no se habilitan virtudes azules ni rojas ni equipo lunar.");
  }

  if (equipment.offensiveOrientation === "performance") {
    hints.push("La orientacion de interpretacion filtra exclusivamente instrumentos e implementos validos para ese uso.");
  }

  if (equipment.offensiveOrientation === "magic") {
    hints.push("La orientacion de canalizacion filtra focos y armas con bono lunar real.");
  }

  if (equipment.defensiveOrientation === "evasion") {
    hints.push("La orientacion defensiva de Esquivar evita piezas pesadas que contradicen una defensa basada en evasion.");
  }

  if (equipment.defensiveOrientation === "resistance") {
    hints.push("La orientacion defensiva de Resistencia prioriza mitigacion, aguante y defensa fija.");
  }

  if (!creationHealth.hasRolled && race) {
    hints.push(`La salud final todavia no incluye el dado extra permanente de ${race.healthDie}.`);
  }

  if (generalVirtueBonus?.category) {
    const categoryLabel = generalVirtueBonus.category === "tecnica" ? "Tecnica" : "Dominio";
    if (!generalVirtueBonus.hasRolled) {
      hints.push(`Puedes lanzar el dado racial de virtudes (${generalVirtueBonus.die || "-"}) para sumar puntos extra en ${categoryLabel}.`);
    } else {
      hints.push(`El bono del dado racial de virtudes solo puede gastarse dentro de ${categoryLabel}.`);
    }
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

function buildOffensivePool(catalog, orientation, lunarState) {
  const candidates = catalog.filter(isPrimaryItem);
  const rows = candidates.map((item) => {
    const blockedReason = offensiveBlockedReason(item, orientation, lunarState);
    return {
      item,
      allowed: !blockedReason,
      blockedReason
    };
  });

  const blocked = rows
    .filter((row) => !row.allowed)
    .map((row) => ({
      id: row.item.id,
      name: row.item.name,
      reason: row.blockedReason
    }));

  return {
    title: `Pool ofensivo filtrado: ${OFFENSIVE_ORIENTATION_DEFINITIONS.find((item) => item.id === orientation)?.title || "Pendiente"}`,
    items: rows.filter((row) => row.allowed).map((row) => row.item),
    blocked,
    blockedSummary: summarizeBlockedItems(blocked),
    reasonById: new Map(blocked.map((entry) => [entry.id, entry.reason])),
    emptyMessage: buildOffensivePoolEmptyMessage(orientation, lunarState)
  };
}

function buildDefensivePool(catalog, orientation, lunarState, category) {
  const candidates = catalog.filter((item) => item.category === category);
  const rows = candidates.map((item) => {
    const blockedReason = defensiveBlockedReason(item, orientation, lunarState, category);
    return {
      item,
      allowed: !blockedReason,
      blockedReason
    };
  });

  const blocked = rows
    .filter((row) => !row.allowed)
    .map((row) => ({
      id: row.item.id,
      name: row.item.name,
      reason: row.blockedReason
    }));

  const categoryLabel = category === "armor" ? "armaduras" : "escudos";

  return {
    title: `Pool defensivo (${categoryLabel}) filtrado: ${DEFENSIVE_ORIENTATION_DEFINITIONS.find((item) => item.id === orientation)?.title || "Pendiente"}`,
    items: rows.filter((row) => row.allowed).map((row) => row.item),
    blocked,
    blockedSummary: summarizeBlockedItems(blocked),
    reasonById: new Map(blocked.map((entry) => [entry.id, entry.reason])),
    emptyMessage: buildDefensivePoolEmptyMessage(orientation, category)
  };
}

function buildRandomizedSlotState({ label, current, initialId, rerollsUsed, rerollsLimit, pool, catalog }) {
  const currentItem = current?.id ? current : EMPTY_ITEM;
  const initialItem = selectItem(catalog, initialId) || (rerollsUsed === 0 ? currentItem : EMPTY_ITEM);
  const normalizedRerolls = clampCounter(rerollsUsed, rerollsLimit);

  return {
    label,
    title: pool.title,
    pool: pool.items,
    poolSize: pool.items.length,
    poolNames: pool.items.map((item) => item.name),
    blocked: pool.blocked,
    blockedSummary: pool.blockedSummary,
    emptyMessage: pool.items.length === 0 ? pool.emptyMessage : "",
    current: currentItem,
    initial: initialItem,
    rerollsUsed: normalizedRerolls,
    rerollsLimit,
    rerollsRemaining: Math.max(0, rerollsLimit - normalizedRerolls),
    rerollConsumed: normalizedRerolls >= rerollsLimit,
    canRoll: pool.items.length > 0 && !currentItem.id,
    canReroll: pool.items.length > 0 && Boolean(currentItem.id) && normalizedRerolls < rerollsLimit
  };
}

function offensiveBlockedReason(item, orientation, lunarState) {
  if (!orientation) {
    return "Primero define una orientacion ofensiva.";
  }

  const lunarAccessError = lunarBlockedReason(item, lunarState);
  if (lunarAccessError) {
    return lunarAccessError;
  }

  if (item.offensiveOrientations.includes(orientation)) {
    return "";
  }

  switch (orientation) {
    case "melee":
      return "La orientacion C.C. solo usa armas cuerpo a cuerpo.";
    case "ranged":
      return "La orientacion Distancia solo usa armas A.D.";
    case "magic":
      return "La orientacion Magia / Canalizacion solo usa focos o armas/implementos con funcion lunar real.";
    case "performance":
      return "La orientacion Instrumento / Interpretacion solo usa instrumentos o implementos de interpretacion.";
    default:
      return "La pieza no coincide con la orientacion ofensiva elegida.";
  }
}

function defensiveBlockedReason(item, orientation, lunarState, category) {
  if (!orientation) {
    return "Primero define una orientacion defensiva.";
  }

  const lunarAccessError = lunarBlockedReason(item, lunarState);
  if (lunarAccessError) {
    return lunarAccessError;
  }

  if (item.category !== category) {
    return category === "armor" ? "Solo se muestran armaduras en este bloque." : "Solo se muestran escudos en este bloque.";
  }

  if (item.defensiveOrientation === orientation) {
    return "";
  }

  if (orientation === "resistance") {
    return "La orientacion Resistencia oculta piezas de Esquivar o neutrales.";
  }

  return "La orientacion Esquivar oculta piezas pesadas o de mitigacion.";
}

function lunarBlockedReason(item, lunarState) {
  if (item.lunarAffinity === "azul" && lunarState.magico <= 0) {
    return "El personaje no tiene acceso inicial a Luna Azul.";
  }

  if (item.lunarAffinity === "roja" && lunarState.maldito <= 0) {
    return "El personaje no tiene acceso inicial a Luna Roja.";
  }

  return "";
}

function buildOffensivePoolEmptyMessage(orientation, lunarState) {
  if (!orientation) {
    return "Primero define la orientacion ofensiva para construir el pool randomizable.";
  }

  if (orientation === "magic" && lunarState.access.length === 0) {
    return "Sin acceso lunar inicial no hay implementos validos para canalizacion.";
  }

  if (orientation === "performance" && lunarState.access.length === 0) {
    return "Sin acceso lunar inicial no hay instrumentos de interpretacion compatibles.";
  }

  return "No hay equipo ofensivo compatible con la orientacion elegida.";
}

function buildDefensivePoolEmptyMessage(orientation, category) {
  const label = category === "armor" ? "armaduras" : "escudos";

  if (!orientation) {
    return `Primero define la orientacion defensiva para filtrar ${label}.`;
  }

  return `No hay ${label} compatibles con la orientacion defensiva elegida.`;
}

function summarizeBlockedItems(blocked) {
  const counts = new Map();

  blocked.forEach((entry) => {
    const key = entry.reason || "Bloqueado por una restriccion no especificada.";
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return [...counts.entries()].map(([reason, count]) => `${count} item(s): ${reason}`);
}

function updateEquipmentRoll(draft, catalogs, { slot, reroll, random }) {
  const race = RACE_BY_ID.get(draft.raceId) || null;
  const lunarState = resolveLunarState(draft, race);
  let pool;
  let currentId;
  let rerollsUsed;
  let rerollsLimit;

  if (slot === "primary") {
    pool = buildOffensivePool(catalogs.equipment, draft.offensiveOrientation, lunarState);
    currentId = draft.equipment.primaryId;
    rerollsUsed = clampCounter(draft.equipment.primaryRerollsUsed, PRIMARY_REROLL_LIMIT);
    rerollsLimit = PRIMARY_REROLL_LIMIT;
  } else if (slot === "armor") {
    pool = buildDefensivePool(catalogs.equipment, draft.defensiveOrientation, lunarState, "armor");
    currentId = draft.equipment.armorId;
    rerollsUsed = clampCounter(draft.equipment.armorRerollsUsed, ARMOR_REROLL_LIMIT);
    rerollsLimit = ARMOR_REROLL_LIMIT;
  } else {
    pool = buildDefensivePool(catalogs.equipment, draft.defensiveOrientation, lunarState, "shield");
    currentId = draft.equipment.shieldId;
    rerollsUsed = clampCounter(draft.equipment.shieldRerollsUsed, SHIELD_REROLL_LIMIT);
    rerollsLimit = SHIELD_REROLL_LIMIT;
  }

  if (pool.items.length === 0) {
    throw new Error(pool.emptyMessage || "No hay items validos para randomizar.");
  }

  if (reroll) {
    if (!currentId) {
      throw new Error("Primero debes obtener un resultado inicial antes de usar el re-roll.");
    }

    if (rerollsUsed >= rerollsLimit) {
      throw new Error("El re-roll de este slot ya fue consumido.");
    }
  }

  const selectedItem = pickRandomItem(pool.items, random);

  if (slot === "primary") {
    draft.equipment.primaryId = selectedItem.id;
    draft.equipment.primaryInitialId = reroll ? draft.equipment.primaryInitialId || currentId : selectedItem.id;
    draft.equipment.primaryRerollsUsed = reroll ? rerollsUsed + 1 : 0;
    return draft;
  }

  if (slot === "armor") {
    draft.equipment.armorId = selectedItem.id;
    draft.equipment.armorInitialId = reroll ? draft.equipment.armorInitialId || currentId : selectedItem.id;
    draft.equipment.armorRerollsUsed = reroll ? rerollsUsed + 1 : 0;
    return draft;
  }

  draft.equipment.shieldId = selectedItem.id;
  draft.equipment.shieldInitialId = reroll ? draft.equipment.shieldInitialId || currentId : selectedItem.id;
  draft.equipment.shieldRerollsUsed = reroll ? rerollsUsed + 1 : 0;
  return draft;
}

function updateCreationHealthRoll(draft, { reroll, random }) {
  const race = RACE_BY_ID.get(draft.raceId) || null;

  if (!race) {
    throw new Error("Selecciona una raza antes de lanzar el dado extra de vida.");
  }

  const sides = parseDieSides(race.healthDie);
  if (sides <= 0) {
    throw new Error("La raza actual no define un dado de vida valido.");
  }

  const current = resolveCreationHealth(draft, race);

  if (reroll) {
    if (!current.hasRolled) {
      throw new Error("Primero debes obtener una tirada inicial de vida extra.");
    }

    if (current.rerollsUsed >= CREATION_HEALTH_REROLL_LIMIT) {
      throw new Error("Los 3 re-rolls del dado extra de vida ya fueron consumidos.");
    }
  }

  const value = rollDie(sides, random);
  draft.creationHealth.die = race.healthDie;
  draft.creationHealth.initialValue = reroll ? current.initialValue || current.value : value;
  draft.creationHealth.value = value;
  draft.creationHealth.rerollsUsed = reroll ? current.rerollsUsed + 1 : 0;
  return draft;
}

function updateGeneralVirtueBonusRoll(draft, { reroll, random }) {
  const race = RACE_BY_ID.get(draft.raceId) || null;

  if (!race) {
    throw new Error("Selecciona una raza antes de lanzar el dado racial de virtudes.");
  }

  const sides = parseDieSides(race.generalVirtueDie);
  if (sides <= 0) {
    throw new Error("La raza actual no define un dado racial valido para virtudes generales.");
  }

  const current = resolveGeneralVirtueBonus(draft, race);

  if (reroll) {
    if (!current.hasRolled) {
      throw new Error("Primero debes obtener una tirada inicial del dado racial de virtudes.");
    }

    if (current.rerollsUsed >= GENERAL_VIRTUE_BONUS_REROLL_LIMIT) {
      throw new Error("Los 2 re-rolls del dado racial de virtudes ya fueron consumidos.");
    }
  }

  const value = rollDie(sides, random);
  draft.generalVirtueBonus.die = race.generalVirtueDie;
  draft.generalVirtueBonus.initialValue = reroll ? current.initialValue || current.value : value;
  draft.generalVirtueBonus.value = value;
  draft.generalVirtueBonus.rerollsUsed = reroll ? current.rerollsUsed + 1 : 0;
  return draft;
}

function itemAddsLunarBonus(item) {
  return item.category === "focus" || item.category === "instrument" || item.lunarBonus > 0;
}

function pickRandomItem(items, random = Math.random) {
  const index = Math.min(items.length - 1, Math.floor(resolveRandom(random) * items.length));
  return items[index];
}

function rollDie(sides, random = Math.random) {
  return 1 + Math.min(sides - 1, Math.floor(resolveRandom(random) * sides));
}

function resolveRandom(random) {
  const value = Number(typeof random === "function" ? random() : Math.random());
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  if (value >= 1) {
    return 0.999999999;
  }
  return value;
}

function sanitizeRolledValue(value, sides) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0 || sides <= 0) {
    return 0;
  }
  return Math.max(1, Math.min(sides, Math.floor(number)));
}

function clampCounter(value, max) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) {
    return 0;
  }
  return Math.min(max, Math.floor(number));
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

function buildEmptyDerivedStats() {
  return {
    attackMelee: 0,
    attackRanged: 0,
    resistencia: 0,
    esquivar: 0,
    fortaleza: 0,
    reflejos: 0,
    voluntad: 0,
    caracter: 0,
    health: 0,
    healthBreakdown: calculateHealthTotal({ race: null, fisico: 0, creationHealthValue: 0 }),
    movement: 0,
    initiative: 0,
    damageReduction: 0,
    dcAzul: 0,
    dcRoja: 0,
    channelingBonus: 0,
    lunarResolutions: []
  };
}

function emptyAttributes() {
  return {
    FIS: 0,
    DES: 0,
    SOC: 0,
    MEN: 0
  };
}
