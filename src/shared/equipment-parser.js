import { compact, extractLine, slugify } from "./text.js";

const SECTION_ORDER = [
  {
    id: "melee",
    title: "Armas Cuerpo a Cuerpo (C.C)",
    anchor: "\nArmas Cuerpo a Cuerpo (C.C)"
  },
  {
    id: "ranged",
    title: "Armas a Distancia (A.D)",
    anchor: "\nArmas a Distancia (A.D)"
  },
  {
    id: "armor",
    title: "Armaduras",
    anchor: "\nArmaduras"
  },
  {
    id: "shield",
    title: "Escudos",
    anchor: "\nEscudos"
  },
  {
    id: "focus",
    title: "Baritas y Baculos",
    anchor: "\nBaritas y Báculos Mágicos o Malditos"
  },
  {
    id: "instrument",
    title: "Instrumentos de Interpretacion",
    anchor: "\nInstrumentos de Interpretación"
  }
];

export function parseEquipmentCatalog(rawText) {
  const normalizedText = String(rawText || "")
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ");

  const sections = splitSections(normalizedText);

  return SECTION_ORDER.flatMap((section) => {
    const sectionText = sections[section.id] || "";
    return parseSection(section.id, sectionText);
  });
}

function splitSections(rawText) {
  const matchResults = compact(
    SECTION_ORDER.map((section) => findSectionBounds(rawText, section))
  ).sort((left, right) => left.index - right.index);

  const sections = {};

  matchResults.forEach((entry, index) => {
    const next = matchResults[index + 1];
    sections[entry.id] = rawText
      .slice(entry.start, next ? next.index : rawText.length)
      .trim();
  });

  return sections;
}

function findSectionBounds(rawText, section) {
  const index = rawText.indexOf(section.anchor);
  if (index < 0) {
    return null;
  }

  const start = rawText.indexOf("\nNombre:", index);
  if (start < 0) {
    return null;
  }

  return { id: section.id, index, start: start + 1 };
}

function parseSection(sectionId, sectionText) {
  if (!sectionText) {
    return [];
  }

  return sectionText
    .split(/\n(?=Nombre:\s)/)
    .map((block) => block.trim())
    .filter((block) => block.startsWith("Nombre:"))
    .map((block) => parseItem(sectionId, block))
    .filter(Boolean);
}

function parseItem(sectionId, blockText) {
  const name = extractLine(blockText, "Nombre:");

  if (!name) {
    return null;
  }

  const rawType = extractLine(blockText, "Tipo de Arma:") || extractLine(blockText, "Tipo Armadura:") || extractLine(blockText, "Tipo Escudo:");
  const rarity = extractLine(blockText, "Rareza:");
  const range = extractLine(blockText, "Alcance:");
  const attackBonus = numberFromText(extractLine(blockText, "Bonus al Ataque:"));
  const lunarBonusText =
    extractLine(blockText, "Bonus MÃ¡gico o Maldito:") || extractLine(blockText, "Bonus al Ataque con Virtud MÃ¡gica o Maldita:");
  const defensePair = extractLine(blockText, "Bonus a la Resistencia o a la Esquiva:");
  const damage = extractLine(blockText, "DaÃ±o:");
  const ability = extractLine(blockText, "Habilidad:");
  const description = extractLine(blockText, "DescripciÃ³n:");
  const reduction = numberFromText(extractLine(blockText, "ReducciÃ³n de DaÃ±o:"));
  const movementPenalty = numberFromText(extractLine(blockText, "Penalizador al Movimiento:"));

  const lunarAffinity = /Roja/i.test(lunarBonusText) || /\[MALDITA\]/i.test(name) ? "roja" : /Azul/i.test(lunarBonusText) || /\[[^\]]*GICA\]/i.test(name) ? "azul" : "";
  const lunarBonus = numberFromText(lunarBonusText);
  const dodgeBonus = /Esquiva/i.test(defensePair) ? numberFromText(defensePair) : 0;
  const resistanceBonus = /Resistencia/i.test(defensePair) ? numberFromText(defensePair) : 0;
  const subtype = rawType || getDefaultType(sectionId);
  const offensiveOrientations = resolveOffensiveOrientations(sectionId, lunarBonus);
  const defensiveOrientation = resolveDefensiveOrientation(sectionId, resistanceBonus, dodgeBonus, reduction, movementPenalty);
  const offensiveOrientationValid = offensiveOrientations.map(mapOffensiveOrientationCode);
  const defensiveOrientationValid = mapDefensiveOrientationCode(defensiveOrientation);
  const compatibilities = {
    offensiveOrientations,
    offensiveOrientationValid,
    defensiveOrientation,
    defensiveOrientationValid,
    lunarAccess: lunarAffinity ? [lunarAffinity] : []
  };
  const restrictions = lunarAffinity ? [`requires_luna_${lunarAffinity}`] : [];

  return {
    id: `${sectionId}-${slugify(name)}`,
    name,
    category: sectionId,
    mainCategory: sectionId,
    subtype,
    type: subtype,
    tags: buildTags(sectionId, subtype, lunarAffinity, offensiveOrientations, defensiveOrientation),
    offensiveOrientations,
    offensiveOrientationValid,
    defensiveOrientation,
    defensiveOrientationValid,
    rarity,
    range,
    bonus: {
      attack: attackBonus,
      lunar: lunarBonus,
      resistance: resistanceBonus,
      dodge: dodgeBonus,
      damageReduction: reduction,
      movementPenalty
    },
    attackBonus,
    lunarBonus,
    lunarBonusText,
    lunarAffinity,
    damage,
    abilities: compact([ability]),
    ability,
    description,
    resistanceBonus,
    dodgeBonus,
    damageReduction: reduction,
    movementPenalty,
    compatibilities,
    restrictions,
    rawText: blockText
  };
}

function buildTags(sectionId, rawType, lunarAffinity, offensiveOrientations, defensiveOrientation) {
  const tags = [sectionId];

  if (lunarAffinity) {
    tags.push(lunarAffinity);
  }

  if (sectionId === "melee" || /C\.C/i.test(rawType || "")) {
    tags.push("melee");
  }

  if (sectionId === "ranged" || /A\.D/i.test(rawType || "")) {
    tags.push("ranged");
  }

  if (sectionId === "focus") {
    tags.push("magic");
    tags.push("focus");
  }

  if (sectionId === "instrument") {
    tags.push("performance");
    tags.push("instrument");
  }

  if (sectionId === "melee" || sectionId === "ranged") {
    tags.push("weapon");
  }

  if (sectionId === "armor") {
    tags.push("armor");
  }

  if (sectionId === "shield") {
    tags.push("shield");
  }

  if (sectionId === "focus" || sectionId === "instrument" || lunarAffinity) {
    tags.push("lunar-support");
  }

  if (offensiveOrientations.includes("melee")) {
    tags.push("offensive_cc");
  }

  if (offensiveOrientations.includes("ranged")) {
    tags.push("offensive_ranged");
  }

  if (offensiveOrientations.includes("magic")) {
    tags.push("offensive_magic");
  }

  if (offensiveOrientations.includes("performance")) {
    tags.push("offensive_instrument");
  }

  if (defensiveOrientation === "resistance") {
    tags.push("defense_resistance");
  }

  if (defensiveOrientation === "evasion") {
    tags.push("defense_evasion");
  }

  if (defensiveOrientation === "neutral") {
    tags.push("defense_neutral");
  }

  return [...new Set(tags)];
}

function resolveOffensiveOrientations(sectionId, lunarBonus) {
  const orientations = [];

  if (sectionId === "melee") {
    orientations.push("melee");
  }

  if (sectionId === "ranged") {
    orientations.push("ranged");
  }

  if (sectionId === "focus") {
    orientations.push("magic");
  }

  if (sectionId === "instrument") {
    orientations.push("performance");
  }

  if ((sectionId === "melee" || sectionId === "ranged") && lunarBonus > 0) {
    orientations.push("magic");
  }

  return [...new Set(orientations)];
}

function resolveDefensiveOrientation(sectionId, resistanceBonus, dodgeBonus, damageReduction, movementPenalty) {
  if (!["armor", "shield"].includes(sectionId)) {
    return "neutral";
  }

  if (movementPenalty > 0 || damageReduction > 0 || resistanceBonus > dodgeBonus) {
    return "resistance";
  }

  if (dodgeBonus >= resistanceBonus) {
    return "evasion";
  }

  return "neutral";
}

function mapOffensiveOrientationCode(orientation) {
  switch (orientation) {
    case "melee":
      return "cc";
    case "ranged":
      return "distancia";
    case "magic":
      return "magia";
    case "performance":
      return "instrumento";
    default:
      return "neutral";
  }
}

function mapDefensiveOrientationCode(orientation) {
  switch (orientation) {
    case "resistance":
      return "resistencia";
    case "evasion":
      return "esquivar";
    default:
      return "neutral";
  }
}

function getDefaultType(sectionId) {
  switch (sectionId) {
    case "armor":
      return "Armadura";
    case "shield":
      return "Escudo";
    case "focus":
      return "Foco";
    case "instrument":
      return "Instrumento";
    default:
      return "Equipo";
  }
}

function numberFromText(value) {
  const match = /([+\-]?\d+)/.exec(String(value || ""));
  return match ? Number(match[1]) : 0;
}
