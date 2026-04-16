# Kepler-282C Creador de Personajes

Refactor completo del creador para dejarlo en una arquitectura mantenible con:

- frontend SPA en `public/`
- backend local Node en `src/server/`
- persistencia SQLite local en `data/kepler.sqlite`
- rules engine centralizado para validaciones, filtros y cálculos
- tests mínimos con `node --test`

## Requisitos

- Node.js 24 o superior

## Cómo correr

1. En la raíz del proyecto ejecuta:

```bash
node server.js
```

2. Abre `http://localhost:4321`

## Scripts

```bash
node server.js
node --test
```

## Cómo funciona el creador

1. Define identidad, raza y notas.
2. Resuelve la configuración racial y lunar.
3. Asigna el punto extra solo a Físico, Destreza, Social o Mental.
4. Reparte el pool inicial de Técnica / Erudición / Dominio con cap 3 por virtud.
5. Elige virtudes lunares válidas según raza y senda.
6. Selecciona el dote libre válido y revisa el estado del slot racial.
7. Elige orientación principal.
8. Selecciona equipo compatible con orientación y acceso lunar.
9. Revisa resumen, guarda, exporta o sigue editando.

## Persistencia

- Guardado principal en SQLite.
- Autosave opcional también persistido localmente.
- Exportación e importación en JSON.

## Tests cubiertos

- dualidad humana
- elección lunar robótica
- filtro de virtudes por luna
- filtro de equipo por orientación
- derivados base
- restricción del punto extra
- guardado y carga desde SQLite
