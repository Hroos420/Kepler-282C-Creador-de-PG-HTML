import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { parseEquipmentCatalog } from "../shared/equipment-parser.js";
import { LEVEL1_EQUIPMENT_SUPPLEMENT_TEXT } from "../shared/level1-canon.js";
import { GLOSSARY } from "../shared/race-data.js";
import { extractLine, slugify } from "../shared/text.js";
import { buildRaceCatalog } from "./race-presentation-loader.js";

const PROJECT_ROOT = path.resolve(process.cwd());

export function loadCatalogs() {
  const lunarSource = evaluateLegacyFile("virtudes_data.js");
  const dotesSource = evaluateLegacyFile("dotes_data.js");
  const equipmentSource = evaluateLegacyFile("equipo_data_raw.js");

  const generalVirtues = loadGeneralVirtues();
  const lunarVirtues = buildLunarVirtues(lunarSource.KEPLER_VIRTUDES);
  const dotes = buildDotes(dotesSource.KEPLER_DOTES);
  const equipment = buildEquipmentCatalog(equipmentSource.KEPLER_EQUIP_TEXT);
  const races = buildRaceCatalog();

  return {
    races,
    glossary: GLOSSARY,
    generalVirtues,
    lunarVirtues,
    dotes,
    equipment
  };
}

function evaluateLegacyFile(filename) {
  const filePath = path.join(PROJECT_ROOT, filename);
  const source = fs.readFileSync(filePath, "utf8");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: filePath });
  return context.window;
}

function buildEquipmentCatalog(rawText) {
  const baseItems = parseEquipmentCatalog(rawText);
  const supplementItems = parseEquipmentCatalog(LEVEL1_EQUIPMENT_SUPPLEMENT_TEXT);
  return mergeCatalogByName(baseItems, supplementItems);
}

function loadGeneralVirtues() {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, "virtudes.js"), "utf8");
  const start = source.indexOf("const VIRTUES = ");
  const end = source.indexOf("  const grid =");

  if (start === -1 || end === -1) {
    throw new Error("No fue posible extraer el catalogo de virtudes generales.");
  }

  const objectLiteral = source.slice(start + "const VIRTUES = ".length, end).trim().replace(/;$/, "");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(`window.__GENERAL_VIRTUES__ = ${objectLiteral}`, context, { filename: "virtudes.js" });

  return Object.entries(context.window.__GENERAL_VIRTUES__).map(([key, value]) => ({
    id: key,
    title: value.title,
    items: value.items.map((item) => {
      const segments = normalizeDashSeparators(item.name).split("—").map((segment) => segment.trim());
      const attributeLabel = segments.at(-1) || "";
      return {
        id: item.id,
        name: segments[0] || item.id,
        label: item.name,
        attributeLabel,
        note: Boolean(item.note),
        attributeId: attributeLabelToId(attributeLabel),
        categoryId: key
      };
    })
  }));
}

function buildLunarVirtues(source) {
  return ["magicas", "malditas"].flatMap((moonKey) => {
    const moon = moonKey === "magicas" ? "azul" : "roja";
    return (source?.[moonKey] || []).map((virtue) => {
      const fullText = virtue.full || virtue.desc || "";
      return {
        id: virtue.id,
        name: virtue.nombre,
        moon,
        rootAttribute: virtue.raiz,
        type: extractType(fullText),
        formula: virtue.formula,
        dc: extractAnyLine(fullText, ["DC:"]),
        range: extractAnyLine(fullText, ["Alcance / Área:", "Alcance / Ãrea:", "Alcance:"]),
        duration: extractAnyLine(fullText, ["Duración:", "DuraciÃ³n:"]),
        effectBase: extractLevelOneEffect(fullText),
        summary: extractAnyLine(fullText, ["Descripción:", "DescripciÃ³n:"]),
        fullText
      };
    });
  });
}

function buildDotes(source) {
  return (source || []).map((dote) => ({
    id: dote.id,
    name: dote.nombre,
    type: dote.tipo,
    description: dote.texto || dote.beneficio || "",
    requirementsText: extractRequirementsText(dote.texto || dote.beneficio || ""),
    evaluate: typeof dote.req === "function" ? dote.req : () => true
  }));
}

function mergeCatalogByName(baseItems, additions) {
  const merged = [...baseItems];
  const seen = new Set(baseItems.map((item) => normalizeCatalogName(item.name)));

  additions.forEach((item) => {
    const key = normalizeCatalogName(item.name);
    if (!seen.has(key)) {
      merged.push(item);
      seen.add(key);
    }
  });

  return merged;
}

function normalizeCatalogName(name) {
  return slugify(String(name || "").replaceAll("‑", "-").replaceAll("–", "-").replaceAll("—", "-"));
}

function normalizeDashSeparators(value) {
  return String(value || "")
    .replaceAll("â€”", "—")
    .replaceAll("—", "—");
}

function extractAnyLine(sourceText, prefixes) {
  for (const prefix of prefixes) {
    const value = extractLine(sourceText, prefix);
    if (value) {
      return value;
    }
  }

  return "";
}

function extractType(fullText) {
  const header = extractAnyLine(fullText, ["Luna:"]);
  const normalizedHeader = normalizeBulletSeparators(header || fullText);
  const typeMatch = /Tipo:\s*([^•\n]+)/i.exec(normalizedHeader);
  return typeMatch ? typeMatch[1].trim() : "";
}

function extractLevelOneEffect(fullText) {
  const normalizedText = normalizeBulletSeparators(fullText);
  const match = /•\s*NvL1:\s*([^\n]+)/i.exec(normalizedText);
  return match ? match[1].trim() : "";
}

function extractRequirementsText(fullText) {
  return extractAnyLine(fullText, ["Requisitos:"]) || "Consulta la descripcion completa del dote.";
}

function normalizeBulletSeparators(value) {
  return String(value || "")
    .replaceAll("â€¢", "•")
    .replaceAll("•", "•");
}

function attributeLabelToId(label) {
  const value = String(label || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (value.includes("fisico")) {
    return "FIS";
  }
  if (value.includes("destreza")) {
    return "DES";
  }
  if (value.includes("social")) {
    return "SOC";
  }
  if (value.includes("mental")) {
    return "MEN";
  }
  return "";
}
