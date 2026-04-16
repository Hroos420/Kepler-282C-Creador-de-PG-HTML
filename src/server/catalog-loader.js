import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { parseEquipmentCatalog } from "../shared/equipment-parser.js";
import { GLOSSARY } from "../shared/race-data.js";
import { extractLine } from "../shared/text.js";
import { buildRaceCatalog } from "./race-presentation-loader.js";

const PROJECT_ROOT = path.resolve(process.cwd());

export function loadCatalogs() {
  const lunarSource = evaluateLegacyFile("virtudes_data.js");
  const dotesSource = evaluateLegacyFile("dotes_data.js");
  const equipmentSource = evaluateLegacyFile("equipo_data_raw.js");

  const generalVirtues = loadGeneralVirtues();
  const lunarVirtues = buildLunarVirtues(lunarSource.KEPLER_VIRTUDES);
  const dotes = buildDotes(dotesSource.KEPLER_DOTES);
  const equipment = parseEquipmentCatalog(equipmentSource.KEPLER_EQUIP_TEXT);
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

function loadGeneralVirtues() {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, "virtudes.js"), "utf8");
  const start = source.indexOf("const VIRTUES = ");
  const end = source.indexOf("  const grid =");

  if (start === -1 || end === -1) {
    throw new Error("No fue posible extraer el catálogo de virtudes generales.");
  }

  const objectLiteral = source.slice(start + "const VIRTUES = ".length, end).trim().replace(/;$/, "");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(`window.__GENERAL_VIRTUES__ = ${objectLiteral}`, context, { filename: "virtudes.js" });

  return Object.entries(context.window.__GENERAL_VIRTUES__).map(([key, value]) => ({
    id: key,
    title: value.title,
    items: value.items.map((item) => {
      const segments = item.name.split("—").map((segment) => segment.trim());
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
        dc: extractLine(fullText, "DC:"),
        range: extractLine(fullText, "Alcance / Área:") || extractLine(fullText, "Alcance:"),
        duration: extractLine(fullText, "Duración:"),
        effectBase: extractLevelOneEffect(fullText),
        summary: extractLine(fullText, "Descripción:"),
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

function extractType(fullText) {
  const header = extractLine(fullText, "Luna:");
  const typeMatch = /Tipo:\s*([^•\n]+)/i.exec(header || fullText);
  return typeMatch ? typeMatch[1].trim() : "";
}

function extractLevelOneEffect(fullText) {
  const match = /•\s*NvL1:\s*([^\n]+)/i.exec(fullText);
  return match ? match[1].trim() : "";
}

function extractRequirementsText(fullText) {
  return extractLine(fullText, "Requisitos:") || "Consulta la descripción completa del dote.";
}

function attributeLabelToId(label) {
  const value = String(label || "").toLowerCase();
  if (value.includes("físico")) {
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
