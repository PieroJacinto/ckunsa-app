# Licencias

Este repositorio contiene material de procedencias distintas y **no todo es del mismo
autor**. Esta página dice qué es cada cosa y bajo qué condiciones está.

---

## Código — Apache License 2.0

Aplica a: `src/`, `data-pipeline/` (excepto `fuentes-crudas/`), archivos de configuración.

Texto completo en [`LICENSE`](./LICENSE). Copyright 2026 Piero Jacinto.

**Por qué Apache 2.0 y no MIT.** Apache agrega dos cosas que importan acá: una concesión
explícita de patentes, que protege a quien adopte el código, y la obligación de **declarar
los cambios** al modificar archivos. Lo segundo es coherente con la ética del proyecto: en
una aplicación donde cada palabra dice de dónde viene, no corresponde una licencia que
permita forkear sin dejar rastro.

**Por qué no copyleft (GPL/AGPL).** El copyleft protegería contra que alguien cierre el
código, pero **el código no contiene una sola palabra en ckunsa**. El riesgo real —que
alguien monetice la lengua— lo gobiernan la licencia de los datos y el protocolo
comunitario, no la del código. Un copyleft sólo pondría fricción a quienes queremos que lo
adopten: el Consejo Lingüístico Ckunsa, una universidad, u otra comunidad con otra lengua
dormida.

---

## Datos generados — CC BY 4.0, heredada

Aplica a: `static/data/*.json`.

Las 851 entradas son **obra derivada** del *Kunza Dictionary* de Roberto Lehnert Santander,
publicado en el *Intercontinental Dictionary Series* bajo CC BY 4.0. Las glosas en español
provienen de la lista `Key-2016-1310` de Concepticon, también CC BY 4.0.

Se mantiene **CC BY 4.0** porque es lo que corresponde a una obra derivada de esas fuentes.
No se agrega ninguna restricción adicional —tampoco una cláusula no comercial— porque sería
una decisión nuestra sobre datos que no son nuestros.

> **La licencia definitiva del corpus la decide la comunidad lickanantay**, no este
> proyecto (`05-PROTOCOLO-COMUNITARIO.md` §1). Lo de acá es el estado provisorio mientras
> esa conversación no ocurrió.
>
> Si alguna organización lickanantay considera que algo de este material no corresponde
> publicarse, se retira sin condiciones.

### Atribución requerida

> Lehnert Santander, R. (2021). *Kunza Dictionary*. En Key, M. R. & Comrie, B. (eds.),
> *The Intercontinental Dictionary Series*. Leipzig: Max Planck Institute for Evolutionary
> Anthropology. CC BY 4.0. https://ids.clld.org/contributions/308

> List, J.-M., Tjuka, A., Blum, F. et al. (eds.). *CLLD Concepticon*, lista
> `Key-2016-1310`. Leipzig: Max Planck Institute for Evolutionary Anthropology. CC BY 4.0.

La aplicación muestra estas citas en cada ficha de palabra y en la página `/fuentes`.

---

## Fuentes crudas — cada una con la suya

`data-pipeline/fuentes-crudas/` contiene los archivos **tal como los publicó cada fuente**,
sin modificar. No son obra de este proyecto y conservan sus condiciones originales:

| Archivo | Fuente | Licencia |
|---|---|---|
| `ids-kunza-lehnert.tsv` | IDS / Lehnert (2021) | CC BY 4.0 |
| `concepticon-Key-2016-1310.tsv` | CLLD Concepticon | CC BY 4.0 |

**No incluido en este repositorio:** el corpus morfofonológico OSF `u764r` de Llanquiman,
Hasler y Torrico-Ávila. Su repositorio **no declara licencia**, lo que por defecto significa
todos los derechos reservados. Se puede leer y estudiar; no se puede publicar. Ver
`08-CORPUS-OSF-ANALISIS.md` §1.

---

## Tipografía — SIL Open Font License 1.1

`static/fonts/Andika-Regular-subset.woff2` es un subconjunto de Andika Regular v7.000, de
SIL Global. Copyright (c) 2004-2026 SIL Global, con los Reserved Font Names "Andika" y
"SIL".

El texto completo de la licencia está en `static/fonts/OFL.txt`, que **tiene que acompañar
al archivo de fuente** también cuando es un subset. Detalles en
`static/fonts/README.md`.

---

## Dependencias

Bootstrap 5.3 (MIT), SvelteKit y Svelte (MIT), y el resto del árbol de `node_modules`, cada
una con su licencia. No se redistribuyen: se instalan desde npm.

---

## Sobre la lengua

Ninguna licencia de este repositorio se aplica al ckunsa. **El ckunsa es patrimonio del
pueblo lickanantay.** Este proyecto reúne material publicado sobre la lengua; no la
representa ni tiene autoridad sobre ella.
