import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { URL } from "node:url";

import { loadCatalogs } from "./catalog-loader.js";
import { CharacterRepository } from "./repository.js";
import { applyDraftAction, buildPreview } from "./rules-engine.js";
import { normalizeDraft } from "../shared/draft.js";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8"
};

export function startServer({ port }) {
  const catalogs = loadCatalogs();
  const repository = new CharacterRepository();

  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

      if (requestUrl.pathname.startsWith("/api/")) {
        await handleApiRequest(request, response, requestUrl, repository, catalogs);
        return;
      }

      await serveStaticAsset(requestUrl.pathname, response);
    } catch (error) {
      respondJson(response, 500, {
        error: "internal_error",
        message: error instanceof Error ? error.message : "Error interno no controlado."
      });
    }
  });

  server.listen(port, () => {
    process.stdout.write(`Kepler-282C disponible en http://localhost:${port}\n`);
  });

  return server;
}

async function handleApiRequest(request, response, requestUrl, repository, catalogs) {
  const { pathname } = requestUrl;

  if (request.method === "GET" && pathname === "/api/bootstrap") {
    respondJson(response, 200, {
      catalogs: serializeCatalogs(catalogs),
      characters: repository.listCharacters(),
      autosave: repository.loadAutosave()
    });
    return;
  }

  if (request.method === "POST" && pathname === "/api/preview") {
    const body = await readJsonBody(request);
    respondJson(response, 200, buildPreview(body?.draft, catalogs));
    return;
  }

  if (request.method === "POST" && pathname === "/api/actions") {
    const body = await readJsonBody(request);
    try {
      respondJson(response, 200, applyDraftAction(body?.draft, catalogs, body?.action));
    } catch (error) {
      respondJson(response, 400, {
        error: "action_error",
        message: error instanceof Error ? error.message : "No fue posible aplicar la accion del creador."
      });
    }
    return;
  }

  if (request.method === "GET" && pathname === "/api/characters") {
    respondJson(response, 200, { characters: repository.listCharacters() });
    return;
  }

  if (request.method === "POST" && pathname === "/api/characters") {
    const body = await readJsonBody(request);
    const preview = buildPreview(body?.draft, catalogs);
    if (!preview.validations.canSave) {
      respondJson(response, 400, {
        error: "validation_error",
        message: "La ficha aún tiene validaciones pendientes.",
        validations: preview.validations
      });
      return;
    }

    const saved = repository.saveCharacter(preview.draft);
    repository.deleteAutosave();
    respondJson(response, 201, saved);
    return;
  }

  if (request.method === "POST" && pathname === "/api/characters/import") {
    const body = await readJsonBody(request);
    const preview = buildPreview(normalizeDraft(body?.draft || body), catalogs);
    if (!preview.validations.canSave) {
      respondJson(response, 400, {
        error: "validation_error",
        message: "El JSON importado no representa una ficha válida.",
        validations: preview.validations
      });
      return;
    }
    respondJson(response, 201, repository.importCharacter(preview.draft));
    return;
  }

  if (request.method === "GET" && /^\/api\/characters\/[^/]+$/.test(pathname)) {
    const id = pathname.split("/").at(-1);
    const character = repository.getCharacter(id);
    respondJson(response, character ? 200 : 404, character || { error: "not_found", message: "Personaje no encontrado." });
    return;
  }

  if (request.method === "PUT" && /^\/api\/characters\/[^/]+$/.test(pathname)) {
    const id = pathname.split("/").at(-1);
    const existing = repository.getCharacter(id);
    if (!existing) {
      respondJson(response, 404, { error: "not_found", message: "Personaje no encontrado." });
      return;
    }
    const body = await readJsonBody(request);
    const preview = buildPreview(body?.draft, catalogs);
    if (!preview.validations.canSave) {
      respondJson(response, 400, {
        error: "validation_error",
        message: "La ficha aún tiene validaciones pendientes.",
        validations: preview.validations
      });
      return;
    }
    const updated = repository.saveCharacter(preview.draft, id);
    repository.deleteAutosave();
    respondJson(response, 200, updated);
    return;
  }

  if (request.method === "POST" && /^\/api\/characters\/[^/]+\/duplicate$/.test(pathname)) {
    const id = pathname.split("/")[3];
    const duplicated = repository.duplicateCharacter(id);
    respondJson(response, duplicated ? 201 : 404, duplicated || { error: "not_found", message: "Personaje no encontrado." });
    return;
  }

  if (request.method === "DELETE" && /^\/api\/characters\/[^/]+$/.test(pathname)) {
    const id = pathname.split("/").at(-1);
    const deleted = repository.deleteCharacter(id);
    respondJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: "not_found", message: "Personaje no encontrado." });
    return;
  }

  if (request.method === "GET" && pathname === "/api/autosave") {
    respondJson(response, 200, { autosave: repository.loadAutosave() });
    return;
  }

  if (request.method === "PUT" && pathname === "/api/autosave") {
    const body = await readJsonBody(request);
    respondJson(response, 200, repository.saveAutosave(body?.draft));
    return;
  }

  if (request.method === "DELETE" && pathname === "/api/autosave") {
    repository.deleteAutosave();
    respondJson(response, 200, { ok: true });
    return;
  }

  respondJson(response, 404, { error: "not_found", message: "Ruta no encontrada." });
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function serializeCatalogs(catalogs) {
  return {
    races: catalogs.races,
    glossary: catalogs.glossary,
    generalVirtues: catalogs.generalVirtues,
    lunarVirtues: catalogs.lunarVirtues,
    dotes: catalogs.dotes.map((dote) => ({
      id: dote.id,
      name: dote.name,
      type: dote.type,
      description: dote.description,
      requirementsText: dote.requirementsText
    })),
    equipment: catalogs.equipment
  };
}

async function serveStaticAsset(requestPath, response) {
  const decodedPath = decodeURIComponent(requestPath === "/" ? "/index.html" : requestPath);
  const sanitizedPath = decodedPath.replace(/^\/+/, "");
  const publicPath = path.join(process.cwd(), "public", sanitizedPath);
  const assetPath = path.join(process.cwd(), sanitizedPath);
  const candidates = [publicPath, assetPath];

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (!resolved.startsWith(path.resolve(process.cwd()))) {
      continue;
    }

    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      const extension = path.extname(resolved).toLowerCase();
      const contentType = MIME_TYPES[extension] || "application/octet-stream";
      response.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(resolved).pipe(response);
      return;
    }
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("No encontrado");
}

function respondJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
