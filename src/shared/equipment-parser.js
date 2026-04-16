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
    title: "Baritas y Báculos",
    anchor: "\nBaritas y Báculos"
  },
  {
    id: "instrument",
    title: "Instrumentos de Interpretación",
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
    extractLine(blockText, "Bonus Mágico o Maldito:") || extractLine(blockText, "Bonus al Ataque con Virtud Mágica o Maldita:");
  const defensePair = extractLine(blockText, "Bonus a la Resistencia o a la Esquiva:");
  const damage = extractLine(blockText, "Daño:");
  const ability = extractLine(blockText, "Habilidad:");
  const description = extractLine(blockText, "Descripción:");
  const reduction = numberFromText(extractLine(blockText, "Reducción de Daño:"));
  const movementPenalty = numberFromText(extractLine(blockText, "Penalizador al Movimiento:"));

  const lunarAffinity = /Roja/i.test(lunarBonusText) || /\[MALDITA\]/i.test(name) ? "roja" : /Azul/i.test(lunarBonusText) || /\[MÁGICA\]/i.test(name) ? "azul" : "";
  const lunarBonus = numberFromText(lunarBonusText);
  const dodgeBonus = /Esquiva/i.test(defensePair) ? numberFromText(defensePair) : 0;
  const resistanceBonus = /Resistencia/i.test(defensePair) ? numberFromText(defensePair) : 0;

  const item = {
    id: `${sectionId}-${slugify(name)}`,
    name,
    category: sectionId,
    type: rawType || getDefaultType(sectionId),
    rarity,
    range,
    attackBonus,
    lunarBonus,
    lunarBonusText,
    lunarAffinity,
    damage,
    ability,
    description,
    resistanceBonus,
    dodgeBonus,
    damageReduction: reduction,
    movementPenalty,
    rawText: blockText,
    tags: buildTags(sectionId, rawType, lunarAffinity)
  };

  return item;
}

function buildTags(sectionId, rawType, lunarAffinity) {
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
  }

  if (sectionId === "instrument") {
    tags.push("performance");
  }

  if (sectionId === "melee" || sectionId === "ranged") {
    tags.push("weapon");
  }

  if (sectionId === "focus" || sectionId === "instrument" || lunarAffinity) {
    tags.push("lunar-support");
  }

  return [...new Set(tags)];
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
