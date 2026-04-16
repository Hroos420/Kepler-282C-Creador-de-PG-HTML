import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

import { SCHEMA_VERSION } from "../shared/race-data.js";
import { normalizeDraft, serializeDraft, summarizeDraftIdentity } from "../shared/draft.js";

export class CharacterRepository {
  constructor(options = {}) {
    const databasePath = options.databasePath || path.join(process.cwd(), "data", "kepler.sqlite");
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    this.database = new DatabaseSync(databasePath);
    this.initialize();
  }

  initialize() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        version INTEGER NOT NULL,
        name TEXT NOT NULL,
        race_id TEXT NOT NULL,
        level INTEGER NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS autosaves (
        slot TEXT PRIMARY KEY,
        version INTEGER NOT NULL,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    this.database
      .prepare(`
        INSERT INTO meta (key, value)
        VALUES ('schema_version', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `)
      .run(String(SCHEMA_VERSION));
  }

  listCharacters() {
    const rows = this.database
      .prepare(`
        SELECT id, version, name, race_id, level, created_at, updated_at, payload
        FROM characters
        ORDER BY updated_at DESC
      `)
      .all();

    return rows.map((row) => {
      const draft = normalizeDraft(JSON.parse(row.payload));
      return {
        id: row.id,
        version: row.version,
        name: row.name,
        raceId: row.race_id,
        level: row.level,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        identity: summarizeDraftIdentity(draft)
      };
    });
  }

  getCharacter(id) {
    const row = this.database
      .prepare(`
        SELECT id, version, name, race_id, level, payload, created_at, updated_at
        FROM characters
        WHERE id = ?
      `)
      .get(id);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      version: row.version,
      name: row.name,
      raceId: row.race_id,
      level: row.level,
      draft: normalizeDraft(JSON.parse(row.payload)),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  saveCharacter(draftInput, existingId = "") {
    const draft = serializeDraft(draftInput);
    const identity = summarizeDraftIdentity(draft);
    const now = new Date().toISOString();
    const id = existingId || randomUUID();
    const existing = existingId ? this.getCharacter(existingId) : null;

    this.database
      .prepare(`
        INSERT INTO characters (id, version, name, race_id, level, payload, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          version = excluded.version,
          name = excluded.name,
          race_id = excluded.race_id,
          level = excluded.level,
          payload = excluded.payload,
          updated_at = excluded.updated_at
      `)
      .run(
        id,
        draft.version,
        identity.name,
        draft.raceId,
        draft.level,
        JSON.stringify(draft),
        existing?.createdAt || now,
        now
      );

    return this.getCharacter(id);
  }

  duplicateCharacter(id) {
    const existing = this.getCharacter(id);
    if (!existing) {
      return null;
    }

    const copy = {
      ...existing.draft,
      name: `${existing.draft.name || "Personaje"} (copia)`
    };

    return this.saveCharacter(copy);
  }

  deleteCharacter(id) {
    const result = this.database.prepare(`DELETE FROM characters WHERE id = ?`).run(id);
    return result.changes > 0;
  }

  importCharacter(record) {
    return this.saveCharacter(record);
  }

  loadAutosave(slot = "current") {
    const row = this.database
      .prepare(`
        SELECT slot, version, payload, updated_at
        FROM autosaves
        WHERE slot = ?
      `)
      .get(slot);

    if (!row) {
      return null;
    }

    return {
      slot: row.slot,
      version: row.version,
      draft: normalizeDraft(JSON.parse(row.payload)),
      updatedAt: row.updated_at
    };
  }

  saveAutosave(draftInput, slot = "current") {
    const draft = serializeDraft(draftInput);
    const now = new Date().toISOString();

    this.database
      .prepare(`
        INSERT INTO autosaves (slot, version, payload, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(slot) DO UPDATE SET
          version = excluded.version,
          payload = excluded.payload,
          updated_at = excluded.updated_at
      `)
      .run(slot, draft.version, JSON.stringify(draft), now);

    return this.loadAutosave(slot);
  }

  deleteAutosave(slot = "current") {
    this.database.prepare(`DELETE FROM autosaves WHERE slot = ?`).run(slot);
  }

  close() {
    this.database.close();
  }
}
