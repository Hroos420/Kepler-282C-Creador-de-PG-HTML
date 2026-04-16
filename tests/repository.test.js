import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { CharacterRepository } from "../src/server/repository.js";

function makeTempRepository() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kepler-repo-"));
  const databasePath = path.join(dir, "kepler.sqlite");
  return {
    dir,
    repository: new CharacterRepository({ databasePath })
  };
}

test("guardar y cargar personaje mantiene orientaciones, randoms y vida extra persistidos", () => {
  const { dir, repository } = makeTempRepository();
  try {
    const saved = repository.saveCharacter({
      version: 2,
      name: "Nyra",
      raceId: "humanos",
      notes: "Prueba",
      level: 1,
      lunarChoice: "",
      extraAttribute: "FIS",
      generalVirtues: { acrobacias: 3 },
      lunarVirtueIds: ["misil-arcano"],
      selectedDoteIds: ["sincronia-manada"],
      offensiveOrientation: "magic",
      defensiveOrientation: "evasion",
      equipment: {
        primaryId: "focus-vara-de-basalto-vivo-magica",
        primaryInitialId: "focus-vara-de-basalto-vivo-magica",
        primaryRerollsUsed: 1,
        armorId: "armor-chaleco-de-cuero-de-marea",
        armorInitialId: "armor-chaleco-de-cuero-de-marea",
        armorRerollsUsed: 0,
        shieldId: "shield-media-luna-humana",
        shieldInitialId: "shield-media-luna-humana",
        shieldRerollsUsed: 1
      },
      creationHealth: {
        die: "d8",
        initialValue: 3,
        value: 6,
        rerollsUsed: 2
      },
      ui: { step: 9 }
    });

    const loaded = repository.getCharacter(saved.id);
    assert.equal(loaded.name, "Nyra");
    assert.equal(loaded.draft.offensiveOrientation, "magic");
    assert.equal(loaded.draft.defensiveOrientation, "evasion");
    assert.equal(loaded.draft.equipment.primaryRerollsUsed, 1);
    assert.equal(loaded.draft.equipment.shieldRerollsUsed, 1);
    assert.equal(loaded.draft.creationHealth.value, 6);
    assert.equal(loaded.draft.creationHealth.rerollsUsed, 2);
  } finally {
    repository.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
