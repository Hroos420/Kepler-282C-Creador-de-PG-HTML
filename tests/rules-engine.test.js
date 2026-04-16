import test from "node:test";
import assert from "node:assert/strict";

import { loadCatalogs } from "../src/server/catalog-loader.js";
import { buildPreview } from "../src/server/rules-engine.js";

const catalogs = loadCatalogs();

function makeBaseDraft(overrides = {}) {
  return {
    version: 1,
    name: "Test",
    raceId: "humanos",
    notes: "",
    level: 1,
    lunarChoice: "",
    extraAttribute: "FIS",
    generalVirtues: { acrobacias: 3, percepcion: 3, diplomacia: 3, sigilo: 3 },
    lunarVirtueIds: ["misil-arcano", "sello-restitucion", "hueso-serrado", "senal-carronero"],
    selectedDoteIds: ["sincronia-manada"],
    orientation: "magic",
    equipment: {
      primaryId: catalogs.equipment.find((item) => item.category === "focus" && item.lunarAffinity === "azul")?.id || "",
      armorId: "",
      shieldId: ""
    },
    ui: { step: 9 },
    ...overrides
  };
}

test("Humanos mantienen dualidad lunar y pueden elegir virtudes azules y rojas", () => {
  const preview = buildPreview(makeBaseDraft(), catalogs);
  assert.deepEqual(preview.summary.lunarState.access, ["azul", "roja"]);
  assert.equal(preview.summary.lunarVirtues.limit, 4);
  assert.equal(preview.summary.lunarVirtues.selectedItems.length, 4);
  assert.equal(preview.validations.canSave, true);
});

test("Robóticos obligan elección lunar al inicio", () => {
  const draft = makeBaseDraft({
    raceId: "roboticos",
    lunarChoice: "",
    lunarVirtueIds: [],
    selectedDoteIds: [],
    generalVirtues: { percepcion: 3, "tacticas-combate": 3, intimidar: 3 },
    equipment: { primaryId: "", armorId: "", shieldId: "" }
  });
  const preview = buildPreview(draft, catalogs);
  assert.equal(preview.summary.lunarState.needsChoice, true);
  assert.equal(preview.summary.lunarState.access.length, 0);
  assert.equal(preview.validations.steps.find((step) => step.key === "raceConfig").valid, false);
});

test("Elección lunar robótica roja filtra virtudes azules", () => {
  const preview = buildPreview(
    makeBaseDraft({
      raceId: "roboticos",
      lunarChoice: "roja",
      generalVirtues: { percepcion: 3, "tacticas-combate": 3, intimidar: 3 },
      lunarVirtueIds: ["misil-arcano", "peste-algoritmica", "senal-carronero"],
      selectedDoteIds: ["protocolo-acceso"],
      equipment: {
        primaryId: catalogs.equipment.find((item) => item.category === "focus" && item.lunarAffinity === "roja")?.id || "",
        armorId: "",
        shieldId: ""
      }
    }),
    catalogs
  );

  assert.deepEqual(preview.summary.lunarState.access, ["roja"]);
  assert.equal(preview.summary.lunarVirtues.selectedItems.some((item) => item.id === "misil-arcano"), false);
  assert.match(preview.validations.blockingErrors.join(" "), /virtudes lunares/i);
});

test("El filtro de equipo respeta la orientación elegida", () => {
  const magicPreview = buildPreview(
    makeBaseDraft({
      orientation: "magic",
      equipment: { primaryId: "", armorId: "", shieldId: "" }
    }),
    catalogs
  );
  const performancePreview = buildPreview(
    makeBaseDraft({
      orientation: "performance",
      equipment: { primaryId: "", armorId: "", shieldId: "" }
    }),
    catalogs
  );

  assert.ok(magicPreview.summary.equipment.availablePrimary.filter((item) => item.allowed).every((item) => item.category === "focus" || item.lunarBonus > 0));
  assert.ok(performancePreview.summary.equipment.availablePrimary.filter((item) => item.allowed).every((item) => item.category === "instrument"));
});

test("Los derivados usan números base correctos y no alteran Salud Base con el punto extra", () => {
  const preview = buildPreview(
    makeBaseDraft({
      raceId: "zwerges",
      extraAttribute: "FIS",
      generalVirtues: { acrobacias: 3, percepcion: 3, intimidar: 3, sigilo: 2 },
      lunarVirtueIds: ["hueso-serrado", "senal-carronero"],
      selectedDoteIds: ["anclaje-terrestre"],
      orientation: "melee",
      equipment: {
        primaryId: catalogs.equipment.find((item) => item.category === "melee" && !item.lunarAffinity)?.id || "",
        armorId: "",
        shieldId: ""
      }
    }),
    catalogs
  );

  assert.equal(preview.summary.attributes.final.FIS, 3);
  assert.equal(preview.summary.derived.health, 20);
  assert.equal(preview.summary.derived.movement, 10);
  assert.equal(preview.summary.derived.fortaleza, 6);
  assert.equal(preview.summary.derived.resistencia, 13);
});

test("El punto extra no puede subir atributos especiales", () => {
  const preview = buildPreview(
    makeBaseDraft({
      extraAttribute: "Nivel Mágico"
    }),
    catalogs
  );

  assert.equal(preview.summary.lunarState.magico, 1);
  assert.equal(preview.summary.lunarState.maldito, 1);
  assert.equal(preview.summary.attributes.final.FIS, 1);
  assert.equal(preview.validations.steps.find((step) => step.key === "extraPoint").valid, false);
});
