# Diccionario ckunsa

Aplicación web de diccionario de la lengua **ckunsa** (kunza, atacameño; ISO 639-3 `kuz`,
glottocode `kunz1244`), lengua del pueblo **lickanantay** del Salar de Atacama.

Funciona sin conexión, se instala en el teléfono y **cada palabra dice de dónde sale**.

---

## Qué es, y qué no es

**Es** un buscador de 851 palabras documentadas, tomadas de fuentes publicadas con licencia
abierta. Muestra para cada una su significado, su nivel de evidencia y su fuente completa.

**No es** un diccionario oficial. No tiene el aval del Consejo Lingüístico Ckunsa ni de
ninguna organización lickanantay: es un desarrollo independiente hecho con material
publicado. Las organizaciones del territorio figuran en la página de fuentes como
referencia, no como colaboradoras.

**No es** un traductor. No genera oraciones ni conjuga verbos, porque la documentación
existente no alcanza para eso y fabricar formas inventadas sería el peor daño posible a una
lengua dormida.

> **El ckunsa es patrimonio del pueblo lickanantay.** Si alguna organización lickanantay
> considera que algo de esta aplicación no corresponde publicarse, se retira sin
> condiciones.

---

## La idea de fondo

El ckunsa es una **lengua dormida**: no tiene hablantes nativos desde la década de 1950,
pero sí un proceso comunitario de recuperación activo. Eso significa que todo lo que se
sabe viene de registros escritos, de calidad y época desiguales, y que **es muy fácil que
una forma inventada empiece a circular como si fuera un dato**.

De ahí la regla central del proyecto: **ninguna palabra se muestra sin decir qué respaldo
tiene.** Cuatro niveles, siempre visibles con color, ícono y palabra escrita:

| Nivel | Significa |
|---|---|
| `atestiguada` | Aparece tal cual en una fuente documental |
| `unificada` | Forma del Diccionario Unificado del CLCK |
| `reconstruida` | Sale de un análisis o de aplicar una regla |
| `propuesta` | La propuso la comunidad, sin respaldo documental |

Un chico que copia una palabra en el cuaderno tiene que poder saber si eso está documentado
o si es una reconstrucción.

---

## Estado

- **851 entradas** del *Kunza Dictionary* de Lehnert, vía Intercontinental Dictionary
  Series (CC BY 4.0), con glosas en español de Concepticon.
- Búsqueda **bidireccional** —español ↔ ckunsa— con tolerancia a grafías históricas: quien
  escribe *kunza* encuentra *ckunsa*.
- **Funciona sin conexión** (PWA instalable).
- **271 tests.**

### Lo que falta, y por qué

Las formas están en la grafía de sus fuentes, **no en la grafía unificada del CLCK**. Para
normalizarlas hace falta el *Grafemario Unificado Ckunsa* (2018), que este proyecto todavía
no pudo consultar. Convertirlas por analogía con el castellano sería inventar ortografía.

Tampoco están incorporados el *Diccionario Unificado Ckunsa* (2021) ni el corpus
morfofonológico de Llanquiman, Hasler y Torrico-Ávila, cuyo uso requiere autorización.

---

## Correr el proyecto

Requiere **Node 20.19+** (probado en 24).

```bash
npm install
npm run dev          # servidor de desarrollo
```

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run build` | sitio estático en `build/` |
| `npm run preview` | sirve el build (necesario para probar el modo offline) |
| `npm run test` | los 271 tests |
| `npm run check` | typecheck de la app y del pipeline |
| `npm run data:build` | regenera los JSON del corpus desde las fuentes crudas |
| `npm run validate:data` | valida el corpus generado |

Los tests de componente corren en Chromium real; la primera vez hay que bajarlo:

```bash
npx playwright install chromium
```

---

## Cómo está armado

```
src/lib/domain/       ← núcleo. TypeScript puro, sin Svelte ni DOM
src/lib/datos/        ← único lugar que hace fetch
src/lib/stores/       ← orquesta dominio + datos
src/lib/componentes/  ← vistas
data-pipeline/        ← convierte las fuentes crudas en los JSON del corpus
static/data/          ← el corpus publicado, versionado
```

**Sin backend.** No hay usuarios, no hay escrituras, no hay datos privados: el corpus entero
son ~560 KB de JSON que viven en memoria. Una base de datos acá sería peso muerto.

**El pipeline es lo que da confianza en los datos.** Los archivos crudos en
`data-pipeline/fuentes-crudas/` no se editan nunca; toda transformación es código
versionado y testeado, así que se puede auditar de dónde salió cada carácter. El validador
falla el build si una entrada no tiene fuente.

### Decisiones que quizá sorprendan

- **Una entrada por forma, no por concepto.** Las fuentes están organizadas al revés que un
  diccionario, y agrupar por concepto afirmaría que dos palabras distintas son la misma.
  Buscar "cueva" devuelve `toco` y `ckoiba` como dos fichas separadas.
- **El generador morfológico no adivina.** Cuando la fuente no registra un dato, devuelve
  `incierto` con las alternativas en vez de elegir la más frecuente.
- **Nada se borra.** Una forma retirada queda con su motivo: que alguien la registrara
  alguna vez también es información sobre la lengua.
- **Sin iconografía atacameña.** Su origen está en el lenguaje visual de poder de Tiwanaku
  y es patrimonio vivo. Tomarla para decorar una interfaz sería el equivalente visual de
  inventar una forma verbal.

---

## Licencias

Código bajo **Apache 2.0**. Los datos son obra derivada de fuentes CC BY 4.0 y **su licencia
definitiva la decide la comunidad lickanantay**. Detalle completo en
[`LICENSES.md`](./LICENSES.md).

---

## Contribuir

Se aceptan correcciones y mejoras. Dos cosas antes de abrir un PR:

1. **Ningún dato entra sin fuente.** El validador lo rechaza, y es a propósito.
2. **Las decisiones sobre la lengua no se toman en un PR.** Grafía, formas correctas,
   paradigmas: eso es de la comunidad. Si tenés información de una organización lickanantay,
   abrí un issue y lo conversamos.

Correcciones a las fuentes originales se devuelven a quien las publicó: por eso cada entrada
guarda su identificador externo.

---

Desarrollo: Piero Jacinto — [github.com/PieroJacinto](https://github.com/PieroJacinto)