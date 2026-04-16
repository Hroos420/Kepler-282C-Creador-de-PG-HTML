import test from "node:test";
import assert from "node:assert/strict";

import { loadCatalogs } from "../src/server/catalog-loader.js";

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
