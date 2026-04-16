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

test("guardar y cargar personaje desde SQLite mantiene la ficha", () => {
  const { dir, repository } = makeTempRepository();
  try {
    const saved = repository.saveCharacter({
      version: 1,
      name: "Nyra",
      raceId: "humanos",
      notes: "Prueba",
      level: 1,
      lunarChoice: "",
      extraAttribute: "FIS",
      generalVirtues: { acrobacias: 3 },
      lunarVirtueIds: ["misil-arcano"],
      selectedDoteIds: ["sincronia-manada"],
      orientation: "magic",
      equipment: {
        primaryId: "focus-v000",
        armorId: "",
        shieldId: ""
      },
      ui: { step: 9 }
    });

    const loaded = repository.getCharacter(saved.id);
    assert.equal(loaded.name, "Nyra");
    assert.equal(loaded.draft.raceId, "humanos");
    assert.equal(loaded.draft.extraAttribute, "FIS");
    assert.deepEqual(loaded.draft.generalVirtues, { acrobacias: 3 });
  } finally {
    repository.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
