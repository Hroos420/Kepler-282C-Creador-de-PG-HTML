import test from "node:test";
import assert from "node:assert/strict";

import { applyDraftAction, buildPreview } from "../src/server/rules-engine.js";
import { loadCatalogs } from "../src/server/catalog-loader.js";

const catalogs = loadCatalogs();

function findItem(predicate) {
  return catalogs.equipment.find(predicate);
}

function sequenceRandom(...values) {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

function makeBaseDraft(overrides = {}) {
  return {
    version: 2,
    name: "Test",
    raceId: "humanos",
    notes: "",
    level: 1,
    lunarChoice: "",
    extraAttribute: "FIS",
    generalVirtues: { acrobacias: 3, percepcion: 3, diplomacia: 3, sigilo: 3 },
    lunarVirtueIds: ["misil-arcano", "sello-restitucion", "hueso-serrado", "senal-carronero"],
    selectedDoteIds: ["sincronia-manada"],
    offensiveOrientation: "magic",
    defensiveOrientation: "evasion",
    equipment: {
      primaryId: findItem((item) => item.category === "focus" && item.lunarAffinity === "azul")?.id || "",
      primaryInitialId: findItem((item) => item.category === "focus" && item.lunarAffinity === "azul")?.id || "",
      primaryRerollsUsed: 0,
      armorId: findItem((item) => item.category === "armor" && item.defensiveOrientation === "evasion" && !item.lunarAffinity)?.id || "",
      armorInitialId: findItem((item) => item.category === "armor" && item.defensiveOrientation === "evasion" && !item.lunarAffinity)?.id || "",
      armorRerollsUsed: 0,
      shieldId: findItem((item) => item.category === "shield" && item.defensiveOrientation === "evasion" && !item.lunarAffinity)?.id || "",
      shieldInitialId: findItem((item) => item.category === "shield" && item.defensiveOrientation === "evasion" && !item.lunarAffinity)?.id || "",
      shieldRerollsUsed: 0
    },
    creationHealth: {
      die: "d8",
      initialValue: 4,
      value: 4,
      rerollsUsed: 0
    },
    ui: { step: 9 },
    ...overrides
  };
}

test("Humanos mantienen dualidad lunar y una ficha completa puede quedar valida", () => {
  const preview = buildPreview(makeBaseDraft(), catalogs);
  assert.deepEqual(preview.summary.lunarState.access, ["azul", "roja"]);
  assert.equal(preview.summary.lunarVirtues.limit, 4);
  assert.equal(preview.summary.lunarVirtues.selectedItems.length, 4);
  assert.equal(preview.summary.derived.health, 21);
  assert.equal(preview.validations.canSave, true);
});

test("Roboticos obligan eleccion lunar al inicio", () => {
  const draft = makeBaseDraft({
    raceId: "roboticos",
    lunarChoice: "",
    lunarVirtueIds: [],
    selectedDoteIds: [],
    generalVirtues: { percepcion: 3, "tacticas-combate": 3, intimidar: 3 },
    equipment: {
      primaryId: "",
      primaryInitialId: "",
      primaryRerollsUsed: 0,
      armorId: "",
      armorInitialId: "",
      armorRerollsUsed: 0,
      shieldId: "",
      shieldInitialId: "",
      shieldRerollsUsed: 0
    },
    creationHealth: { die: "", initialValue: 0, value: 0, rerollsUsed: 0 }
  });
  const preview = buildPreview(draft, catalogs);
  assert.equal(preview.summary.lunarState.needsChoice, true);
  assert.equal(preview.summary.lunarState.access.length, 0);
  assert.equal(preview.validations.steps.find((step) => step.key === "raceConfig").valid, false);
});

test("Eleccion lunar robotica roja filtra virtudes azules", () => {
  const preview = buildPreview(
    makeBaseDraft({
      raceId: "roboticos",
      lunarChoice: "roja",
      generalVirtues: { percepcion: 3, "tacticas-combate": 3, intimidar: 3 },
      lunarVirtueIds: ["misil-arcano", "peste-algoritmica", "senal-carronero"],
      selectedDoteIds: ["protocolo-acceso"]
    }),
    catalogs
  );

  assert.deepEqual(preview.summary.lunarState.access, ["roja"]);
  assert.equal(preview.summary.lunarVirtues.selectedItems.some((item) => item.id === "misil-arcano"), false);
  assert.match(preview.validations.blockingErrors.join(" "), /virtudes lunares/i);
});

test("El filtro ofensivo solo muestra items compatibles con la orientacion elegida", () => {
  const magicPreview = buildPreview(
    makeBaseDraft({
      offensiveOrientation: "magic",
      equipment: {
        primaryId: "",
        primaryInitialId: "",
        primaryRerollsUsed: 0,
        armorId: "",
        armorInitialId: "",
        armorRerollsUsed: 0,
        shieldId: "",
        shieldInitialId: "",
        shieldRerollsUsed: 0
      }
    }),
    catalogs
  );
  const performancePreview = buildPreview(
    makeBaseDraft({
      offensiveOrientation: "performance",
      equipment: {
        primaryId: "",
        primaryInitialId: "",
        primaryRerollsUsed: 0,
        armorId: "",
        armorInitialId: "",
        armorRerollsUsed: 0,
        shieldId: "",
        shieldInitialId: "",
        shieldRerollsUsed: 0
      }
    }),
    catalogs
  );

  assert.ok(magicPreview.summary.equipment.offensive.pool.every((item) => item.offensiveOrientations.includes("magic")));
  assert.ok(performancePreview.summary.equipment.offensive.pool.every((item) => item.category === "instrument"));
});

test("La randomizacion ofensiva solo usa el pool filtrado y admite un solo re-roll", () => {
  const base = makeBaseDraft({
    equipment: {
      primaryId: "",
      primaryInitialId: "",
      primaryRerollsUsed: 0,
      armorId: "",
      armorInitialId: "",
      armorRerollsUsed: 0,
      shieldId: "",
      shieldInitialId: "",
      shieldRerollsUsed: 0
    }
  });

  const first = applyDraftAction(base, catalogs, { type: "randomize-primary" }, { random: () => 0 });
  assert.ok(first.preview.summary.equipment.offensive.pool.some((item) => item.id === first.draft.equipment.primaryId));

  const second = applyDraftAction(first.draft, catalogs, { type: "randomize-primary", reroll: true }, { random: () => 0.95 });
  assert.equal(second.draft.equipment.primaryRerollsUsed, 1);
  assert.ok(second.preview.summary.equipment.offensive.pool.some((item) => item.id === second.draft.equipment.primaryId));
  assert.throws(
    () => applyDraftAction(second.draft, catalogs, { type: "randomize-primary", reroll: true }, { random: () => 0.5 }),
    /consumido/i
  );
});

test("El filtro defensivo separa pools de armadura y escudo por orientacion", () => {
  const evasionPreview = buildPreview(
    makeBaseDraft({
      defensiveOrientation: "evasion",
      equipment: {
        primaryId: "",
        primaryInitialId: "",
        primaryRerollsUsed: 0,
        armorId: "",
        armorInitialId: "",
        armorRerollsUsed: 0,
        shieldId: "",
        shieldInitialId: "",
        shieldRerollsUsed: 0
      }
    }),
    catalogs
  );

  assert.ok(evasionPreview.summary.equipment.defensive.armor.pool.every((item) => item.defensiveOrientation === "evasion"));
  assert.ok(evasionPreview.summary.equipment.defensive.shield.pool.every((item) => item.defensiveOrientation === "evasion"));
});

test("La randomizacion de armadura y escudo solo usa pools compatibles y respeta un re-roll maximo", () => {
  const base = makeBaseDraft({
    defensiveOrientation: "resistance",
    equipment: {
      primaryId: "",
      primaryInitialId: "",
      primaryRerollsUsed: 0,
      armorId: "",
      armorInitialId: "",
      armorRerollsUsed: 0,
      shieldId: "",
      shieldInitialId: "",
      shieldRerollsUsed: 0
    }
  });

  const armorRoll = applyDraftAction(base, catalogs, { type: "randomize-armor" }, { random: () => 0 });
  assert.ok(armorRoll.preview.summary.equipment.defensive.armor.pool.some((item) => item.id === armorRoll.draft.equipment.armorId));

  const armorReroll = applyDraftAction(armorRoll.draft, catalogs, { type: "randomize-armor", reroll: true }, { random: () => 0.99 });
  assert.equal(armorReroll.draft.equipment.armorRerollsUsed, 1);
  assert.throws(
    () => applyDraftAction(armorReroll.draft, catalogs, { type: "randomize-armor", reroll: true }, { random: () => 0.5 }),
    /consumido/i
  );

  const shieldRoll = applyDraftAction(base, catalogs, { type: "randomize-shield" }, { random: () => 0 });
  assert.ok(shieldRoll.preview.summary.equipment.defensive.shield.pool.some((item) => item.id === shieldRoll.draft.equipment.shieldId));

  const shieldReroll = applyDraftAction(shieldRoll.draft, catalogs, { type: "randomize-shield", reroll: true }, { random: () => 0.99 });
  assert.equal(shieldReroll.draft.equipment.shieldRerollsUsed, 1);
  assert.throws(
    () => applyDraftAction(shieldReroll.draft, catalogs, { type: "randomize-shield", reroll: true }, { random: () => 0.5 }),
    /consumido/i
  );
});

test("El dado extra de vida usa el dado racial correcto y la salud final lo incluye", () => {
  const preview = buildPreview(
    makeBaseDraft({
      creationHealth: {
        die: "d8",
        initialValue: 5,
        value: 5,
        rerollsUsed: 0
      }
    }),
    catalogs
  );

  assert.equal(preview.summary.creationHealth.die, "d8");
  assert.equal(preview.summary.derived.health, 22);
  assert.equal(preview.summary.derived.healthBreakdown.creationDie, 5);
});

test("El dado extra de vida permite hasta 3 re-rolls y siempre conserva el ultimo resultado", () => {
  const base = makeBaseDraft({
    raceId: "zwerges",
    generalVirtues: { acrobacias: 3, percepcion: 3, intimidar: 3, sigilo: 2 },
    lunarVirtueIds: ["hueso-serrado", "senal-carronero"],
    selectedDoteIds: ["anclaje-terrestre"],
    offensiveOrientation: "melee",
    defensiveOrientation: "resistance",
    equipment: {
      primaryId: findItem((item) => item.category === "melee" && item.offensiveOrientations.includes("melee") && !item.lunarAffinity)?.id || "",
      primaryInitialId: findItem((item) => item.category === "melee" && item.offensiveOrientations.includes("melee") && !item.lunarAffinity)?.id || "",
      primaryRerollsUsed: 0,
      armorId: findItem((item) => item.category === "armor" && item.defensiveOrientation === "resistance")?.id || "",
      armorInitialId: findItem((item) => item.category === "armor" && item.defensiveOrientation === "resistance")?.id || "",
      armorRerollsUsed: 0,
      shieldId: findItem((item) => item.category === "shield" && item.defensiveOrientation === "resistance")?.id || "",
      shieldInitialId: findItem((item) => item.category === "shield" && item.defensiveOrientation === "resistance")?.id || "",
      shieldRerollsUsed: 0
    },
    creationHealth: { die: "", initialValue: 0, value: 0, rerollsUsed: 0 }
  });

  const first = applyDraftAction(base, catalogs, { type: "roll-creation-health" }, { random: () => 0 });
  assert.equal(first.preview.summary.creationHealth.die, "d12");
  assert.equal(first.draft.creationHealth.value, 1);

  const rerolled = applyDraftAction(first.draft, catalogs, { type: "roll-creation-health", reroll: true }, { random: sequenceRandom(0.5, 0.75, 0.9) });
  const rerolled2 = applyDraftAction(rerolled.draft, catalogs, { type: "roll-creation-health", reroll: true }, { random: () => 0.75 });
  const rerolled3 = applyDraftAction(rerolled2.draft, catalogs, { type: "roll-creation-health", reroll: true }, { random: () => 0.9 });

  assert.equal(rerolled3.draft.creationHealth.rerollsUsed, 3);
  assert.equal(rerolled3.draft.creationHealth.value, 11);
  assert.throws(
    () => applyDraftAction(rerolled3.draft, catalogs, { type: "roll-creation-health", reroll: true }, { random: () => 0.1 }),
    /3 re-rolls/i
  );
});
