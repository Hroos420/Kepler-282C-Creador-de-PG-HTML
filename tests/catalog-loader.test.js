import test from "node:test";
import assert from "node:assert/strict";

import { loadCatalogs } from "../src/server/catalog-loader.js";
import { LEVEL1_CANON_REFERENCE } from "../src/shared/level1-canon.js";

test("El catalogo racial se enriquece con imagenes locales y resumenes derivados del lore", () => {
  const catalogs = loadCatalogs();
  const humanos = catalogs.races.find((race) => race.id === "humanos");
  const roboticos = catalogs.races.find((race) => race.id === "roboticos");

  assert.ok(humanos);
  assert.equal(humanos.imageSource, "local-images");
  assert.equal(humanos.imagePath, "/Imagenes%20Razas/Humanos.png");
  assert.match(humanos.loreSummary, /Eadric el Libertador/i);
  assert.equal(humanos.moonAccessLabel, "Acceso dual inicial: Luna Azul y Luna Roja");

  assert.ok(roboticos);
  assert.equal(roboticos.imageSource, "local-images");
  assert.match(roboticos.loreHook, /nucleo/i);
  assert.equal(roboticos.loreSourceFile, "Lore Razas/Roboticos Nuevo Lore.docx");
});

test("Los catalogos de equipo, virtudes lunares y dotes quedan alineados con la referencia canonica de nivel 1", () => {
  const catalogs = loadCatalogs();

  assert.equal(catalogs.equipment.length, LEVEL1_CANON_REFERENCE.equipment.count);
  LEVEL1_CANON_REFERENCE.equipment.requiredNames.forEach((name) => {
    assert.ok(catalogs.equipment.some((item) => item.name === name), `Falta equipo canonico: ${name}`);
  });

  assert.equal(catalogs.lunarVirtues.length, LEVEL1_CANON_REFERENCE.lunarVirtues.count);
  LEVEL1_CANON_REFERENCE.lunarVirtues.requiredNames.forEach((name) => {
    assert.ok(catalogs.lunarVirtues.some((item) => item.name === name), `Falta virtud lunar canonica: ${name}`);
  });

  assert.equal(catalogs.dotes.length, LEVEL1_CANON_REFERENCE.dotes.count);
  LEVEL1_CANON_REFERENCE.dotes.requiredNames.forEach((name) => {
    assert.ok(catalogs.dotes.some((item) => item.name === name), `Falta dote canonica: ${name}`);
  });
});
