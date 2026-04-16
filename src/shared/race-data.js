export const DATA_VERSION = 1;
export const SCHEMA_VERSION = 1;
export const CREATION_GENERAL_VIRTUE_CAP = 3;
export const CREATION_LEVEL = 1;

export const ATTRIBUTE_ORDER = ["FIS", "DES", "SOC", "MEN"];

export const ATTRIBUTE_LABELS = {
  FIS: "Físico",
  DES: "Destreza",
  SOC: "Social",
  MEN: "Mental"
};

export const MOON_LABELS = {
  azul: "Luna Azul",
  roja: "Luna Roja"
};

export const ORIENTATION_DEFINITIONS = [
  {
    id: "melee",
    title: "Cuerpo a cuerpo",
    shortTitle: "C.C.",
    description: "Prioriza armas cuerpo a cuerpo y cálculos basados en Físico."
  },
  {
    id: "ranged",
    title: "Distancia",
    shortTitle: "A.D.",
    description: "Prioriza armas a distancia y cálculos basados en Destreza."
  },
  {
    id: "magic",
    title: "Magia / Canalización",
    shortTitle: "Canalización",
    description: "Prioriza baritas, báculos, focos y armas con bonificación lunar."
  },
  {
    id: "performance",
    title: "Instrumento / Interpretación",
    shortTitle: "Interpretación",
    description: "Prioriza instrumentos y resoluciones sociales potenciadas."
  }
];

export const STEP_DEFINITIONS = [
  { id: 1, key: "identity", title: "Identidad" },
  { id: 2, key: "raceConfig", title: "Raza y luna" },
  { id: 3, key: "extraPoint", title: "Punto extra" },
  { id: 4, key: "generalVirtues", title: "Virtudes generales" },
  { id: 5, key: "lunarVirtues", title: "Virtudes lunares" },
  { id: 6, key: "dotes", title: "Dotes" },
  { id: 7, key: "orientation", title: "Orientación" },
  { id: 8, key: "equipment", title: "Equipo" },
  { id: 9, key: "summary", title: "Resumen" }
];

export const GLOSSARY = [
  {
    id: "ataque-base",
    title: "Ataque Base Racial",
    text: "Es el valor fijo de la raza para C.C. o A.D. No cambia con el punto extra; solo se suma al atributo, al arma y a otros bonos."
  },
  {
    id: "defensas-fijas",
    title: "Resistencia y Esquivar",
    text: "Son defensas fijas derivadas. Resistencia usa Físico + armadura + escudo + 10. Esquivar usa Destreza + armadura ligera o especial + escudo + 10."
  },
  {
    id: "salvaciones",
    title: "Salvaciones Activas",
    text: "Fortaleza, Reflejos, Voluntad y Carácter son tiradas activas. Cada una usa su atributo base más el valor racial fijo correspondiente."
  },
  {
    id: "dc-lunar",
    title: "DC Lunar",
    text: "La dificultad base de una virtud lunar es 10 + Nivel + Nivel Mágico o Nivel Maldito, según la luna usada."
  },
  {
    id: "virtudes-generales",
    title: "Virtudes Generales",
    text: "Técnica, Erudición y Dominio son el pool inicial que reparte cada raza. En creación no pueden superar 3 puntos por virtud."
  }
];

export const RACE_DEFINITIONS = [
  {
    id: "humanos",
    name: "Humanos",
    title: "El Aliento Despierta",
    description: "Equilibrio entre Magia y Maldición; adaptables y con fe indomable.",
    lunarMode: "dual",
    lunarChoices: null,
    baseAttributes: { FIS: 1, DES: 1, SOC: 2, MEN: 1 },
    baseLunarLevels: { magico: 1, maldito: 1 },
    attackBase: { melee: 1, ranged: 1 },
    saveBase: { reflejos: 2, fortaleza: 2, voluntad: 2, caracter: 1 },
    healthBase: 15,
    movementBase: 13,
    generalVirtuePool: 12,
    lunarVirtueLimit: 4,
    healthDie: "d8",
    notes: [
      "Los únicos que comienzan con Nivel Mágico 1 y Nivel Maldito 1.",
      "Pueden elegir virtudes iniciales azules y rojas."
    ]
  },
  {
    id: "antropeltis",
    name: "Antropeltis",
    title: "Hijos del Instinto",
    description: "Canalizan la energía viva de Kepler; eligen Céfidon o Ultharia al inicio.",
    lunarMode: "choice",
    lunarChoices: {
      azul: {
        title: "Céfidon",
        levels: { magico: 1, maldito: 0 },
        description: "Acceso inicial a Luna Azul."
      },
      roja: {
        title: "Ultharia",
        levels: { magico: 0, maldito: 1 },
        description: "Acceso inicial a Luna Roja."
      }
    },
    baseAttributes: { FIS: 2, DES: 1, SOC: 1, MEN: 1 },
    baseLunarLevels: { magico: 0, maldito: 0 },
    attackBase: { melee: 2, ranged: 2 },
    saveBase: { reflejos: 2, fortaleza: 2, voluntad: 2, caracter: 2 },
    healthBase: 17,
    movementBase: 14,
    generalVirtuePool: 10,
    lunarVirtueLimit: 3,
    healthDie: "d10",
    notes: [
      "Solo una senda lunar al inicio.",
      "Mantienen un perfil ofensivo fuerte en C.C. y A.D."
    ]
  },
  {
    id: "ithariis",
    name: "Ithariis",
    title: "Los Hijos del Coloso",
    description: "Dominadores forjados en Maldición Roja y tecnología viva.",
    lunarMode: "fixed",
    lunarChoices: null,
    baseAttributes: { FIS: 1, DES: 2, SOC: 1, MEN: 2 },
    baseLunarLevels: { magico: 0, maldito: 1 },
    attackBase: { melee: 1, ranged: 2 },
    saveBase: { reflejos: 3, fortaleza: 1, voluntad: 2, caracter: 1 },
    healthBase: 14,
    movementBase: 15,
    generalVirtuePool: 11,
    lunarVirtueLimit: 2,
    healthDie: "d8",
    notes: [
      "No tienen acceso inicial a Luna Azul.",
      "Su ataque base favorece la precisión a distancia."
    ]
  },
  {
    id: "elfen",
    name: "Elfen’s",
    title: "La Gracia Suspendida",
    description: "Nacidos bajo la Luna Azul, guardianes del equilibrio elemental.",
    lunarMode: "fixed",
    lunarChoices: null,
    baseAttributes: { FIS: 1, DES: 2, SOC: 2, MEN: 1 },
    baseLunarLevels: { magico: 1, maldito: 0 },
    attackBase: { melee: 1, ranged: 2 },
    saveBase: { reflejos: 3, fortaleza: 1, voluntad: 2, caracter: 2 },
    healthBase: 10,
    movementBase: 17,
    generalVirtuePool: 12,
    lunarVirtueLimit: 4,
    healthDie: "d6",
    notes: [
      "Acceso inicial exclusivo a Luna Azul.",
      "Tienen la movilidad más alta del conjunto base."
    ]
  },
  {
    id: "zwerges",
    name: "Zwerge",
    title: "El Eco de la Forja Maldita",
    description: "Forjados en la Maldición Roja; maestros del sacrificio y la creación.",
    lunarMode: "fixed",
    lunarChoices: null,
    baseAttributes: { FIS: 2, DES: 1, SOC: 1, MEN: 1 },
    baseLunarLevels: { magico: 0, maldito: 1 },
    attackBase: { melee: 2, ranged: 1 },
    saveBase: { reflejos: 1, fortaleza: 3, voluntad: 2, caracter: 1 },
    healthBase: 20,
    movementBase: 10,
    generalVirtuePool: 11,
    lunarVirtueLimit: 2,
    healthDie: "d12",
    notes: [
      "Acceso inicial exclusivo a Luna Roja.",
      "Tienen la Salud Base y la Fortaleza racial más altas."
    ]
  },
  {
    id: "roboticos",
    name: "Robóticos",
    title: "Ecos en la Chispa Vacía",
    description: "Almas atadas al metal; deben elegir Núcleo Azul o Núcleo Rojo.",
    lunarMode: "choice",
    lunarChoices: {
      azul: {
        title: "Núcleo Azul",
        levels: { magico: 1, maldito: 0 },
        description: "Activa acceso inicial a Luna Azul."
      },
      roja: {
        title: "Núcleo Rojo",
        levels: { magico: 0, maldito: 1 },
        description: "Activa acceso inicial a Luna Roja."
      }
    },
    baseAttributes: { FIS: 3, DES: 1, SOC: 1, MEN: 1 },
    baseLunarLevels: { magico: 0, maldito: 0 },
    attackBase: { melee: 2, ranged: 1 },
    saveBase: { reflejos: 3, fortaleza: 1, voluntad: 1, caracter: 3 },
    healthBase: 18,
    movementBase: 11,
    generalVirtuePool: 9,
    lunarVirtueLimit: 3,
    healthDie: "d10",
    notes: [
      "Deben elegir senda lunar antes de ver virtudes iniciales.",
      "Su combinación racial prioriza Físico y Carácter."
    ]
  }
];

export const RACE_BY_ID = new Map(RACE_DEFINITIONS.map((race) => [race.id, race]));
