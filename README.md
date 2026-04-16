# Kepler-282C Creador de Personajes

Refactor del creador para dejarlo con:

- frontend SPA en `public/`
- backend local Node en `src/server/`
- persistencia SQLite local en `data/kepler.sqlite`
- rules engine centralizado para validaciones, filtros, randomizacion y calculos
- tests con `node --test`

## Requisitos

- Node.js 24 o superior

## Como correr

```bash
node server.js
```

Luego abre `http://localhost:4321`.

### Doble clic en Windows

Tambien puedes usar:

- [Iniciar Kepler 282C.bat](</c:/Users/PC RST/Desktop/Kepler Github/Kepler-282C-Creador-de-PG-HTML/Iniciar Kepler 282C.bat>)

Ese lanzador inicia `server.js` y abre el navegador.

## Scripts

```bash
node server.js
node --test
```

## Como funciona el creador

1. Define identidad, raza y notas.
2. Resuelve la configuracion racial y lunar.
3. Asigna el punto extra solo a Fisico, Destreza, Social o Mental.
4. Reparte el pool inicial de Tecnica / Erudicion / Dominio con cap 3 por virtud.
   Puedes elegir Tecnica o Dominio como destino para tirar 1 dado racial de virtudes y sumar ese resultado al pool total, con hasta 2 re-rolls. El exceso sobre el pool base solo puede quedar dentro de la categoria elegida.
5. Elige virtudes lunares validas segun raza y senda.
6. Selecciona el dote libre valido y revisa el estado del slot racial.
7. Elige orientacion ofensiva principal.
8. Randomiza arma principal, orientacion defensiva, armadura, escudo y dado extra de vida desde pools filtrados, con re-rolls limitados.
9. Revisa resumen, guarda, exporta o sigue editando.

## Persistencia

- Guardado principal en SQLite.
- Autosave opcional tambien persistido localmente.
- Exportacion e importacion en JSON.

## Arte y lore racial

- Las imagenes de raza se resuelven desde la carpeta local `Imagenes Razas/`.
- El resolvedor normaliza mayusculas, espacios, guiones, guiones bajos y extensiones `.png`, `.webp`, `.jpg`, `.jpeg`.
- Si falta una imagen local, el servidor intenta usar `assets/`; si tampoco existe, la UI muestra un placeholder sin romper el flujo.
- El lore fuente del repo vive en `Lore Razas/` como `.docx`.
- La UI no parsea esos archivos en runtime: consume el catalogo derivado `src/shared/race-presentation-data.js`, armado a partir del lore local real.

## Tests cubiertos

- dualidad humana
- eleccion lunar robotica
- filtro de virtudes por luna
- filtro de equipo por orientacion
- randomizacion ofensiva y defensiva desde pool filtrado
- limite de re-roll para arma, armadura y escudo
- dado extra de vida racial y salud final
- guardado y carga desde SQLite
- carga de imagenes locales y resumenes raciales derivados del lore
- alineacion canonica de equipo, virtudes lunares y dotes de nivel 1
- dado racial opcional para el reparto de virtudes generales y su restriccion a Tecnica/Dominio
