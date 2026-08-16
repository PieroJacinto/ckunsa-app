# Tipografía — Andika (subset)

`Andika-Regular-subset.woff2` es un **subconjunto** de Andika Regular v7.000, de SIL Global.

## Por qué esta fuente

Elegida por lo que resuelve, no por estética (`07-DISENO.md` V2):

- Desarrollada por SIL International **para programas de alfabetización y lectores
  principiantes**, que es exactamente el usuario de esta app.
- Soporte de **transcripción AFI/IPA** y amplio repertorio de diacríticos. El corpus ya usa
  `ɲ` (U+0272) en tres entradas, y en Fase 2 entran las transcripciones fonológicas.
- Distingue `I` mayúscula de `l` minúscula y del `1`. En un diccionario con `ia`, `lican` y
  `ackiu` eso no es un detalle.
- Reportada como útil para lectores con dislexia.

## Por qué un subset y no la fuente completa

Medido sobre los archivos reales:

| | Tamaño |
|---|---|
| Andika Regular completa, woff2 | 201 KB |
| Este subset (116 caracteres) | **25 KB** |

Ocho veces menos. La fuente completa mapea 2.660 caracteres; la app usa 116. En una PWA que
tiene que bajarse con la señal de una escuela rural, 176 KB de glifos que nadie va a ver son
la decisión más cara del proyecto.

## Licencia y atribución

**SIL Open Font License 1.1.** El texto completo está en `OFL.txt`, en esta misma carpeta:
la licencia exige que acompañe al archivo de fuente, también cuando es un subset.

> Copyright (c) 2004-2026 SIL Global, con los Reserved Font Names "Andika" y "SIL".

La OFL permite modificar y redistribuir, y hacer un subset es una modificación permitida.
Lo que **no** permite es vender la fuente por separado ni usar los Reserved Font Names para
distribuir una versión modificada como fuente propia. Nosotros la embebemos en una app, que
es el uso previsto.

La atribución va también en la página `/fuentes` de la app.

## Qué caracteres incluye

Están en `caracteres.txt`, que es el archivo que se le pasa al subsetter. Son tres grupos:

1. **Todo lo que aparece en las 851 formas del corpus** — medido, no supuesto.
2. **Latín básico completo**, mayúsculas, dígitos y puntuación, para que la fuente no se
   rompa si se usa en un título o un número.
3. **Símbolos AFI** — `ʔ ə ʃ ʧ ʤ ŋ ɾ ʎ β θ ɣ ˈ ˌ ː` y vocales nasalizadas — de cara a
   Fase 2, cuando entren las transcripciones del corpus OSF. Agregarlos ahora cuesta unos
   pocos KB; rehacer el subset después cuesta acordarse de cómo.

## Cómo regenerarlo

Hace falta Python con `fonttools` y `brotli`. **No son dependencias del proyecto**: esto se
corre a mano, muy de vez en cuando, y por eso el `.woff2` va versionado en el repo. El
proyecto apunta a un árbol de dependencias chico y a que siga funcionando dentro de tres
años sin instalar nada.

```bash
# 1. Herramientas (una sola vez)
pip install fonttools brotli

# 2. Bajar Andika Regular v7.000 del repo oficial de SIL:
#    https://github.com/silnrsi/font-andika
#    El .ttf está en references/v7000/Andika-Regular.ttf

# 3. Generar el subset, parado en esta carpeta
pyftsubset Andika-Regular.ttf \
  --text-file=caracteres.txt \
  --layout-features='*' \
  --flavor=woff2 \
  --output-file=Andika-Regular-subset.woff2
```

`--layout-features='*'` conserva las tablas OpenType, que son las que posicionan bien los
diacríticos. Sin eso, un acento combinante puede quedar corrido sobre la letra.

El aviso `WARNING: Silt NOT subset` es esperado: `Silt` es una tabla propia de SIL
(tecnología Graphite) que el subsetter no sabe recortar y descarta. No afecta el renderizado
en navegadores.

## Cómo agregar caracteres

1. Editar `caracteres.txt` sumando los que falten.
2. Correr el comando del paso 3.
3. Verificar el tamaño resultante y commitear el `.woff2` con prefijo `chore:`.

Para saber qué caracteres usa el corpus hoy, parado en la raíz del repo:

```bash
node -e "
const e = require('./static/data/entradas.v1.json');
const s = new Set();
for (const x of e) {
  for (const c of x.forma_clck) s.add(c);
  for (const v of x.variantes_historicas ?? []) for (const c of v.forma) s.add(c);
}
console.log([...s].sort().join(''));
"
```
