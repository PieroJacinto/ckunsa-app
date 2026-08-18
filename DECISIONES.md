# Decisiones técnicas

Por qué el código hace las cosas como las hace. Cada punto es una decisión que no es obvia leyendo la implementación, con el motivo que la sostiene.

Si vas a cambiar algo que está acá, leé primero por qué está así.

Las decisiones sobre **la lengua** están en [`LENGUA.md`](./LENGUA.md); las de **datos, licencias y comunidad**, en [`DATOS.md`](./DATOS.md).

---

## Índice

- [Sin backend](#sin-backend)
- [Vistas finas, lógica gorda](#vistas-finas-lógica-gorda)
- [Toda forma pasa por EvidenceBadge](#toda-forma-pasa-por-evidencebadge)
- [El store vive en el contexto, no en un módulo](#el-store-vive-en-el-contexto-no-en-un-módulo)
- [Una entrada por forma, no por concepto](#una-entrada-por-forma-no-por-concepto)
- [Normalización en dos niveles](#normalización-en-dos-niveles)
- [Nunca se borra una entrada](#nunca-se-borra-una-entrada)
- [Datos y aplicación se actualizan por separado](#datos-y-aplicación-se-actualizan-por-separado)
- [El índice se ordena por el español](#el-índice-se-ordena-por-el-español)
- [Una letra por vez](#una-letra-por-vez)
- [La consulta viaja en la URL](#la-consulta-viaja-en-la-url)
- [Barra de pestañas, no menú hamburguesa](#barra-de-pestañas-no-menú-hamburguesa)
- [Sin librería de fuzzy search](#sin-librería-de-fuzzy-search)
- [Testing en dos niveles](#testing-en-dos-niveles)
- [Comportamientos de herramientas que no son obvios](#comportamientos-de-herramientas-que-no-son-obvios)
- [Cosas sin resolver](#cosas-sin-resolver)

---

## Sin backend

**No hay servidor, base de datos ni autenticación.** El sitio son archivos estáticos servidos por un CDN.

No es minimalismo por estética. El proyecto tiene un autor, no tiene multiusuario, no escribe nada y sus datos son casi estáticos: el corpus entero son ~560 KB de JSON que caben en memoria. Una base de datos acá sería peso muerto, y un servidor sería un costo anual y un punto de falla para algo que no lo necesita.

**Consecuencia práctica:** el alojamiento es gratuito e indefinido, y la app no puede caerse por un servidor apagado. El único costo recurrente posible es un dominio, y es opcional.

---

## Vistas finas, lógica gorda

**Los `.svelte` reciben props y renderizan. Nada más.** Búsqueda, normalización y transformación viven en `src/lib/domain/`, que es TypeScript puro sin Svelte ni DOM.

Una vista nunca importa el índice de búsqueda ni hace `fetch`.

El motivo es testeabilidad: el dominio es la parte que puede mentirle a un chico en una escuela, y se prueba en milisegundos sin levantar un navegador. Si la lógica estuviera en los componentes, cada regla de normalización exigiría renderizar algo para verificarla.

**Consecuencia práctica:** `src/lib/datos/cargador.ts` es el único lugar de la app que hace `fetch`, y recibe la función `fetch` como parámetro en vez de usar la global. Eso permite testearlo en Node sin red y sin mockear globales — que es la forma más común de que un test pase por el motivo equivocado.

---

## Toda forma pasa por EvidenceBadge

**Ninguna palabra en ckunsa se renderiza suelta.** Todas van envueltas en `<EvidenceBadge>`, que muestra su nivel de evidencia con color, ícono y palabra escrita.

Las tres cosas juntas, no una: el color solo no sirve para quien no distingue colores, y una etiqueta que nadie entiende no informa. Por eso la app tiene una leyenda en la portada.

Si alguien sacara ese envoltorio, una forma reconstruida se vería igual que una documentada, y alguien la copiaría como dato firme.

**Consecuencia práctica:** el badge acepta `children` opcional, para poder usarlo suelto en la leyenda donde no hay ninguna forma que mostrar. La regla es que toda forma pase por el badge, no que el badge siempre lleve una forma.

**Y una segunda capa, aprendida tarde:** el badge marca la forma con `translate="no"` y `lang="kuz"`. Ver la sección de herramientas.

---

## El store vive en el contexto, no en un módulo

**El diccionario se crea en el layout raíz con `setContext`,** no como una instancia exportada de módulo.

Los servidores son de larga vida y se comparten entre usuarios: el estado por usuario no puede vivir en una variable de módulo. La solución canónica de SvelteKit es adjuntarlo al árbol de componentes, lo que lo acota a una sola petición. Es lo que el framework hace con `page.data`.

Acá no hay datos privados —el corpus es el mismo para todos— pero el patrón igual corresponde: sin él, dos usuarios que peguen al mismo proceso compartirían la consulta de búsqueda.

**Consecuencia práctica:** una instancia por sesión significa que el corpus se descarga y se indexa una vez, no en cada ruta.

---

## Una entrada por forma, no por concepto

**Buscar «cueva» devuelve `toco` y `ckoiba` como dos fichas separadas.**

Las fuentes son onomasiológicas: agrupan formas bajo un concepto sin afirmar que sean la misma palabra. Fusionarlas afirmaría algo que la fuente no dice — de hecho Lehnert anota que `ckoiba` es probablemente préstamo del castellano _cueva_.

Lo inverso sí se hace: `ckamur`, registrado para 'moon' y para 'month', es **una** entrada con dos significados. Eso es colexificación y reportarla es factual.

**Consecuencia práctica:** el `id` de una entrada se arma con la forma y su primer significado (`ckabur-montana`). Si dos entradas generan el mismo `id`, el pipeline falla el build en vez de sobrescribir en silencio.

---

## Normalización en dos niveles

**Hay dos claves por entrada, no una.**

`clave_canonica` colapsa mayúsculas, acentos y guiones para la búsqueda exacta. `clave_historica` va más lejos: unifica las variantes de grafía de los registros del siglo XIX, para que quien escribe _kunza_ encuentre _ckunsa_.

Son dos niveles porque cumplen funciones distintas y tienen riesgos distintos. La histórica fusiona más, y fusionar de más significa afirmar que dos palabras son la misma.

**Consecuencia práctica:** cualquier regla nueva se prueba corriendo sobre las 851 formas del corpus y contando colisiones contra un baseline de 37. Ya pasó una vez: un algoritmo que parecía razonable fusionaba `patha` 'gracias' con `patta` 'madre'. Después supimos por qué eso estaba mal — `th` y `tt` son fonemas distintos, una aspirada y una eyectiva.

---

## Nunca se borra una entrada

**Una forma incorrecta se marca `estado: "retirada"` con su motivo.** No se elimina.

Que alguien la registrara alguna vez también es información sobre la lengua, y hay materiales impresos donde esa forma sigue circulando. Quien la busque tiene que encontrar la explicación, no una pantalla vacía.

**Consecuencia práctica:** el índice y los resultados de búsqueda las omiten, pero la búsqueda exacta las devuelve y la ficha muestra el motivo del retiro.

---

## Datos y aplicación se actualizan por separado

**El corpus no está precacheado. La aplicación sí.**

La lista de precache se genera en el build. Si el corpus estuviera adentro, un `entradas.v2.json` subido después no aparecería en ella y el service worker seguiría sirviendo la v1 hasta el próximo deploy. Eso rompería el diseño entero: agregar 200 palabras tiene que ser subir un archivo y bumpear el manifest, **sin publicar una versión nueva de la app**.

Por eso los JSON van por `StaleWhileRevalidate`: se sirven al instante desde la caché —también sin señal— y en paralelo se busca versión nueva.

**Medido:** con el corpus adentro el precache eran 920 KB; sin él, 404 KB.

**Ninguna de las dos actualizaciones se aplica sola.** Recargar la app o cambiar el diccionario mientras alguien lee una ficha es hostil. Las dos avisan con un banner y la decisión es del usuario.

**Consecuencia práctica:** `aplicarActualizacion` es un método aparte de `cargar`, porque si falla debe conservar el corpus que ya funciona. Usar `cargar` dejaría el store en estado de error y ocultaría un diccionario que estaba andando bien.

---

## El índice se ordena por el español

**No por la forma ckunsa.** El motivo está en [`LENGUA.md`](./LENGUA.md): el orden del alfabeto ckunsa lo define el Grafemario, que no tenemos, y el propio Consejo Lingüístico ordena su glosario por la glosa castellana.

**Consecuencia práctica:** una entrada con dos significados aparece dos veces, una por letra. `ckamur` está en la L de «luna» y en la M de «mes». Es lo correcto en un índice: quien busca «mes» tiene que encontrarlo ahí.

---

## Una letra por vez

**El índice muestra una sección, no las veinticuatro.**

Volcarlas todas genera **12.232 elementos DOM** —medido—, muy por encima de lo razonable para un teléfono barato, y obliga a scrollear de vuelta arriba para cambiar de letra.

**Consecuencia práctica:** la letra y el tema viajan en la URL, así que un enlace a una letra puntual se puede compartir y sobrevive a una recarga.

---

## La consulta viaja en la URL

**Buscar «cueva» cambia la dirección a `/?q=cueva`.**

Sin eso no se puede compartir un resultado, recargar lo pierde, y volver de una ficha con el botón «atrás» devuelve al buscador vacío. En este proyecto compartir un enlace por mensaje es como circula la información entre docentes, así que importa más que en una app cualquiera.

La sincronización va en dos direcciones y la trampa está en que no se pisen:

- **store → URL**, con 300 ms de espera. Una navegación por cada tecla sería demasiado. La búsqueda en sí no espera: los resultados salen al instante y lo único que se demora es reescribir la dirección.
- **URL → store**, sólo cuando el cambio viene de afuera: un enlace compartido, el botón «atrás» o una recarga.

**Esa última condición no es un detalle.** Sin ella, al escribir la URL el efecto se dispara con el texto de hace 300 ms y pisa lo que el usuario acaba de teclear. Se comía letras mientras escribías.

---

## Barra de pestañas, no menú hamburguesa

**En móvil la navegación es una barra fija abajo con las seis secciones visibles.**

Nielsen Norman midió el efecto de esconder la navegación: la descubribilidad se corta casi a la mitad, el tiempo de tarea sube y la dificultad percibida también. El hamburguesa se justifica con más de cinco o seis opciones; con seis, una barra de pestañas funciona mejor. Además el pulgar llega abajo, no arriba.

**Consecuencia práctica:** es el **mismo componente** que la navegación de escritorio; sólo cambia el CSS. Sin estado, sin botón que abrir, sin foco que atrapar, sin `aria-expanded`. El `aria-current` funciona igual en las dos formas.

Hay un test que verifica que sean exactamente seis. Una séptima rompería las etiquetas en 320 px, y conviene que falle un test antes que descubrirlo en un teléfono.

---

## Sin librería de fuzzy search

Medido sobre el corpus real, con warmup:

|                     | 851 entradas | 2.500   | 5.000       |
| ------------------- | ------------ | ------- | ----------- |
| Construir el índice | 3,9 ms       | 13,5 ms | 28,6 ms     |
| Fuzzy por consulta  | **0,17 ms**  | 0,24 ms | **0,61 ms** |
| Lookup exacto       | 0,25 µs      | —       | —           |

Un frame a 60 fps son 16,7 ms: estamos dos órdenes de magnitud por debajo de lo perceptible. **El índice propio alcanza y sobra.**

**Consecuencia práctica:** tampoco hay debounce en la búsqueda. Sería estado que testear y retraso perceptible para un problema que no existe. La distancia de Levenshtein va acotada con salida temprana: sin eso el costo se multiplica, porque el 95% de las comparaciones son contra palabras que no se parecen en nada.

---

## Testing en dos niveles

La suite entera sin navegador tarda ~850 ms; con un solo archivo de navegador pasa a ~8 s. Diez veces más.

Por eso cada componente tiene **dos** specs:

- **`Componente.spec.ts`** — `render` de `svelte/server`, verifica el **marcado**: clases, atributos ARIA, textos, ramas condicionales. Es el 80% de lo que hay que probar y cuesta milisegundos.
- **`Componente.svelte.spec.ts`** — Chromium real, deliberadamente **corto**: sólo lo que necesita un DOM de verdad.

**Cuidado con el nombre:** el patrón `*.svelte.spec.ts` es el que manda un archivo al proyecto `client`. Un spec de marcado llamado así levantaría Chromium sin necesidad.

---

## Comportamientos de herramientas que no son obvios

Seis casos donde una herramienta hace en silencio algo distinto de lo esperado. **Todos pasaban desapercibidos porque las verificaciones daban verde.**

**Las formas acentuadas de IDS vienen en NFD.** `cáhmor` es `c a ◌́ h m o r`, con el acento como carácter combinante aparte. Un usuario que escribe en el teclado produce NFC, con `á` como un solo punto de código. Los dos strings se ven idénticos en pantalla y son distintos para JavaScript. La búsqueda no se rompía —`canonizar()` quita diacríticos— pero cualquier comparación directa posterior fallaría de forma invisible. El transformador normaliza a NFC y el validador falla si entra NFD.

**`<html lang="en">` hacía que Chrome tradujera la aplicación.** Es lo que deja el scaffold de SvelteKit y nunca se cambió. La app está toda en español, así que Chrome «corregía»: la C del índice se volvía «do», la M «METRO», la G «GRAMO». Y de paso rompía la reactividad, porque el traductor reemplaza los nodos de texto y Svelte queda escribiendo en nodos desconectados — un título se congelaba en su primer valor.

Lo grave no era eso: **con la traducción activa, el navegador podía convertir una palabra ckunsa en otra cosa.** Por eso toda forma lleva ahora `translate="no"` y `lang="kuz"`, igual que lleva `EvidenceBadge`.

**`replaceState` de `$app/navigation` no navega.** Es _shallow routing_: asocia estado con una entrada del historial. Cambia la barra de direcciones y **no** actualiza `page.url`, así que nada se recalcula. Para que la vista reaccione hay que usar `goto(url, { replaceState: true })`.

**Mutar `page.url` parece un bug de reactividad y no lo es.** Hay un issue abierto de SvelteKit al respecto, y el caso es siempre el mismo: `const { url } = page` y después mutar ese objeto. Hay que copiarlo con `new URL(page.url)`.

**`registerSW` no recarga la página.** Sólo manda `skipWaiting` al service worker en espera; la recarga la dispara después el evento `controlling`. Si no hay ninguno esperando —porque ya se activó solo en una apertura anterior—, ese evento nunca ocurre y el botón de actualizar no hace nada. Por eso se recarga a mano como respaldo.

**Los chunks viejos desaparecen al publicar.** Cada build genera nombres con hash nuevo y el CDN borra los anteriores. Una pestaña abierta con la versión vieja pide un archivo que ya no existe, el servidor responde el `200.html` de fallback, el navegador lo rechaza porque no es JavaScript, y la app muere en blanco. Se resuelve en dos capas: `version.pollInterval` fuerza navegación completa cuando hay versión nueva, y un manejador de `vite:preloadError` recarga si aun así falla.

**Y una del entorno de trabajo:** al pegar código con atributos en varias líneas, el editor puede comerse la etiqueta de apertura. Pasó cuatro veces, siempre con el mismo síntoma: `</a> attempted to close an element that was not open`. Conviene escribir los enlaces en una sola línea y dejar que Prettier los reacomode.

---

## Cosas sin resolver

**`AvisoActualizacion` no tiene tests.** Es el único componente sin cobertura. Importa un módulo virtual que sólo existe cuando corre el plugin de PWA, así que testearlo exigiría mockear esa infraestructura. Hay dos caminos: mockear el módulo virtual, o extraer la lógica de decisión a una función pura y testear eso, dejando el componente como cableado.

**El aviso de palabras nuevas nunca se probó de verdad.** Está implementado y conectado, pero sólo existe la v1 del corpus, así que no hay una versión nueva que anunciar. Se va a poder verificar recién cuando se publiquen datos nuevos — y ahí sabremos si la promesa de «sin redeploy» funciona.

**No hay documentación del formato de datos.** Si el Consejo quisiera generar su propio `entradas.v2.json`, necesitaría saber qué campos lleva una entrada y qué valores admite cada uno. El validador ya tiene esa información y la aplica en cada build; se podría generar la documentación desde ahí, con la misma lógica que un OpenAPI generado desde los schemas. Tiene sentido cuando haya alguien produciendo datos además del pipeline.

**El corpus se carga entero en memoria.** Con 851 entradas y ~560 KB es lo correcto. Con 10.000 habría que revisar si conviene un índice parcial o almacenamiento local, pero medir antes: los números de arriba sugieren que aguanta bastante más de lo que este proyecto va a necesitar.
