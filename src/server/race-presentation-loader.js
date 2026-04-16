import fs from "node:fs";
import path from "node:path";

import { RACE_DEFINITIONS } from "../shared/race-data.js";
import { RACE_PRESENTATION_DATA, RACE_PRESENTATION_FALLBACK } from "../shared/race-presentation-data.js";
import { slugify } from "../shared/text.js";

const PROJECT_ROOT = path.resolve(process.cwd());
const IMAGE_DIRECTORY_HINTS = ["imagenes razas"];
const FALLBACK_DIRECTORY_HINTS = ["assets"];
const SUPPORTED_IMAGE_EXTENSIONS = new Set([".png", ".webp", ".jpg", ".jpeg"]);

export function buildRaceCatalog() {
  const imageDirectory = resolveProjectDirectory(IMAGE_DIRECTORY_HINTS);
  const fallbackDirectory = resolveProjectDirectory(FALLBACK_DIRECTORY_HINTS);
  const imageIndex = buildImageIndex(imageDirectory);
  const fallbackIndex = buildImageIndex(fallbackDirectory);

  return RACE_DEFINITIONS.map((race) => buildRaceEntry(race, imageIndex, fallbackIndex));
}

function buildRaceEntry(race, imageIndex, fallbackIndex) {
  const presentation = {
    ...RACE_PRESENTATION_FALLBACK,
    ...(RACE_PRESENTATION_DATA[race.id] || {})
  };
  const image = resolveRaceImage(race, presentation, imageIndex, fallbackIndex);

  return {
    ...race,
    ...presentation,
    imagePath: image.publicPath,
    imageAlt: presentation.imageAlt || `Ilustracion de ${race.name}`,
    imageSource: image.source,
    hasResolvedImage: Boolean(image.publicPath)
  };
}

function resolveRaceImage(race, presentation, imageIndex, fallbackIndex) {
  const aliases = [...new Set([race.id, race.name, ...(presentation.imageCandidates || [])].map(normalizeLookup).filter(Boolean))];

  for (const alias of aliases) {
    const exact = imageIndex.get(alias);
    if (exact) {
      return {
        publicPath: toPublicPath(exact.absolutePath),
        source: "local-images"
      };
    }
  }

  for (const alias of aliases) {
    const partial = findPartialMatch(imageIndex, alias);
    if (partial) {
      return {
        publicPath: toPublicPath(partial.absolutePath),
        source: "local-images"
      };
    }
  }

  for (const alias of aliases) {
    const fallback = fallbackIndex.get(alias) || findPartialMatch(fallbackIndex, alias);
    if (fallback) {
      return {
        publicPath: toPublicPath(fallback.absolutePath),
        source: "assets-fallback"
      };
    }
  }

  return {
    publicPath: "",
    source: "placeholder"
  };
}

function resolveProjectDirectory(hints) {
  const entries = fs.readdirSync(PROJECT_ROOT, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const directoryMap = new Map(entries.map((entry) => [normalizeLookup(entry.name), entry.name]));

  for (const hint of hints) {
    const match = directoryMap.get(normalizeLookup(hint));
    if (match) {
      return path.join(PROJECT_ROOT, match);
    }
  }

  return "";
}

function buildImageIndex(directoryPath) {
  const index = new Map();

  if (!directoryPath || !fs.existsSync(directoryPath)) {
    return index;
  }

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
      continue;
    }

    const absolutePath = path.join(directoryPath, entry.name);
    const stats = fs.statSync(absolutePath);
    if (!stats.isFile() || stats.size <= 0) {
      continue;
    }

    const basename = path.basename(entry.name, extension);
    index.set(normalizeLookup(basename), {
      absolutePath,
      name: entry.name
    });
  }

  return index;
}

function findPartialMatch(index, alias) {
  for (const [key, value] of index.entries()) {
    if (key.includes(alias) || alias.includes(key)) {
      return value;
    }
  }

  return null;
}

function toPublicPath(absolutePath) {
  if (!absolutePath) {
    return "";
  }

  const relativePath = path.relative(PROJECT_ROOT, absolutePath);
  return `/${relativePath.split(path.sep).map(encodeURIComponent).join("/")}`;
}

function normalizeLookup(value) {
  return slugify(value).replace(/-/g, "");
}
