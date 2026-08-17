# Decisiones sobre la lengua

Qué puede afirmar esta aplicación sobre el ckunsa y qué no, con el motivo de cada límite.

Estas decisiones no son técnicas. Cambiar una no es refactorizar: es cambiar lo que un chico va a copiar en su cuaderno. Si vas a tocar algo de acá, leé primero por qué está así — y si el cambio afecta lo que alguien va a creer sobre la lengua, no se decide en un PR. Ver [`DATOS.md`](./DATOS.md).

---

## Índice

- [Se dice lengua dormida, no extinta](#se-dice-lengua-dormida-no-extinta)
- [No se afirma una fecha para los últimos hablantes](#no-se-afirma-una-fecha-para-los-últimos-hablantes)
- [La grafía es `ckunsa`, y la eligió la comunidad](#la-grafía-es-ckunsa-y-la-eligió-la-comunidad)
- [No se inventa ortografía](#no-se-inventa-ortografía)
- [Cuatro niveles de evidencia](#cuatro-niveles-de-evidencia)
- [Cero conjugación de persona, tiempo y aspecto](#cero-conjugación-de-persona-tiempo-y-aspecto)
- [El generador no adivina](#el-generador-no-adivina)
- [Los numerales sí, con su irregularidad](#los-numerales-sí-con-su-irregularidad)
- [Las tildes no distinguen palabras](#las-tildes-no-distinguen-palabras)
- [El orden alfabético lo define el Grafemario](#el-orden-alfabético-lo-define-el-grafemario)
- [Sin iconografía atacameña](#sin-iconografía-atacameña)
- [Lo que la aplicación no va a hacer](#lo-que-la-aplicación-no-va-a-hacer)
- [Cosas sin resolver](#cosas-sin-resolver)

---

## Se dice lengua dormida, no extinta

**«Dormida», siempre.** Se usa para lenguas sin hablantes conocidos pero con un proceso comunitario de recuperación activo.

Las comunidades atacameñas rechazan «extinta»: desde adentro, el ckunsa está dormido y despertando. Wilson Reyes Araya, consejero nacional indígena de CONADI, lo dijo al presentar la app de 2019: la lengua «no está muerta ni extinguida».

Y hay un argumento fáctico además del político, que es la sección siguiente.

---

## No se afirma una fecha para los últimos hablantes

**La formulación admisible es «hace más de un siglo que no se registran hablantes fluidos».** Ninguna otra.

Las fuentes no coinciden, y el desacuerdo es el dato:

| Año | Qué dijeron |
|---|---|
| 1890 | San Román advierte que quedan pocos ancianos y que al morir «no quedará el menor vestigio» |
| 1896 | Vaïsse, Hoyos y Echeverría publican su glosario diciendo que la lengua «ya pertenece a las lenguas estintas» |
| 1954 | Mostny et al. declaran que lleva ~60 años extinta — **y en el mismo trabajo graban canciones y conversaciones en ckunsa** en Peine y Socaire |
| 2022 | Torrico-Ávila escribe que los últimos hablantes murieron **en los años noventa** |

Tomás Vilca, que enseña la lengua hoy en el territorio, es nieto de una de las últimas hablantes.

Durante 130 años cada generación de investigadores dio la lengua por perdida, y cada una encontró gente hablándola.

**Consecuencia práctica:** «desde los años 50» es la cifra más citada y la app **no** la usa. Hay un test que verifica que la portada no la mencione.

---

## La grafía es `ckunsa`, y la eligió la comunidad

Circulan cinco formas del nombre: *cunza*, *kunza*, *cunsa*, *kunsa*, *ckunsa*. Cada una viene de una época y una decisión distinta.

**La app usa `ckunsa`,** la que adoptó el Consejo Lingüístico Ckunsa Lickanantay en 2018 y ratificó la comunidad en el *Semmu Halayna Ckapur Lassi Ckunsa* de octubre de 2021.

No es una decisión técnica ni una preferencia: es una decisión del pueblo lickanantay sobre cómo se escribe su lengua.

**Consecuencia práctica:** la búsqueda tolera todas las variantes. Quien escribe *kunza* encuentra *ckunsa*. Respetar la grafía oficial no puede significar que alguien no encuentre lo que busca.

---

## No se inventa ortografía

**Ante una duda ortográfica, se marca como pendiente. No se resuelve por analogía con el castellano.**

El *Grafemario Unificado Ckunsa* (2018) define cómo se escribe la lengua, y este proyecto no lo tiene. Lo que sí se conoce está sistematizado en la tesis de Llanquiman (2023) y en el manual de trabajo del propio Consejo de 2016 — pero ese manual dice de sí mismo que «un Grafemario definitivo está en gestación» y que no alcanzó a validarse con los educadores tradicionales.

Reglas que sí constan y que **no** se aplican todavía: `c`, `k` y `ck` se escriben todas `ck`; la `z` se reemplaza por `s`; no se usan `d`, `f`, `g`, `j`, `v`, `w`, `x`.

**Por qué no se aplican:** el resultado no sería «grafía CLCK», sería nuestra interpretación de una tesis sobre los documentos del CLCK. La diferencia importa cuando alguien copia una palabra en un cuaderno.

**Consecuencia práctica:** las 851 entradas llevan `grafia_provisional: true` y el validador emite un aviso. Cuando el Consejo confirme las reglas, la normalización se hará como una transformación documentada y reversible.

---

## Cuatro niveles de evidencia

| Nivel | Significa |
|---|---|
| `atestiguada` | Aparece tal cual en una fuente documental |
| `unificada` | Forma del Diccionario Unificado del CLCK |
| `reconstruida` | Sale de un análisis o de aplicar una regla |
| `propuesta` | La propuso la comunidad o un educador, sin respaldo documental |

En una lengua sin hablantes, todo lo que se sabe viene de papeles. Es muy fácil que una forma inventada empiece a circular como si fuera un dato: alguien la copia, otro la repite, y en dos generaciones es parte de la lengua.

**Consecuencia práctica:** el nivel no es un adorno de la interfaz, es un campo obligatorio del modelo. Una entrada sin nivel no compila, y una sin fuente no entra al corpus.

---

## Cero conjugación de persona, tiempo y aspecto

**La app no conjuga verbos. No es una limitación de alcance: es que no está documentado.**

En todo el registro histórico hay alrededor de diez oraciones completas. No se conoce el sistema verbal, ni el orden de la oración, ni la negación, ni la interrogación, ni la subordinación.

Traducir oraciones exigiría inventar la parte que falta. Y una forma inventada que circula como si fuera documentada es, en una lengua dormida, un daño que no se corrige.

**Consecuencia práctica:** esto es lo que separa un diccionario de un traductor, y es la razón por la que este proyecto es lo primero.

---

## El generador no adivina

**Si el léxico no declara el patrón, la respuesta es `incierto` con las alternativas.** Nunca una forma inventada presentada como buena.

Es la misma regla que la anterior aplicada a la morfología: elegir la alternativa más frecuente sería estadística, no documentación.

---

## Los numerales sí, con su irregularidad

El sistema de numerales es el subsistema más completo y regular que se conoce. Dos números yuxtapuestos se multiplican; unidos por la partícula *ta* se suman.

```
su-ci pala-ma      10 × 3 = 30
su-ci ta se-ma     10 + 1 = 11
su-ci ta su-ci     10 + 10 = 20
```

**El 20 es la irregularidad que hay que respetar:** es diez más diez, no diez por dos. Un generador «prolijo» produciría `su-ci pokes-ma` y estaría inventando.

---

## Las tildes no distinguen palabras

En el corpus hay 56 formas con tilde. **Son marcas de acento heredadas de los registros de San Román (1890) y Mostny (1954), que el Consejo conservó.** Describen dónde cae el acento; no distinguen una palabra de otra.

El Grafemario de 2018 dice que el acento tiende a la esdrújula. Llanquiman lo analiza y propone acento fijo y predecible: penúltima sílaba con dos, antepenúltima con tres, última con cuatro o cinco —como *lickanantay*—. Los compuestos conservan el acento de sus raíces.

Si el acento es predecible, las tildes son información redundante, no contrastiva.

**Consecuencia práctica:** que `canonizar()` quite los diacríticos es correcto, y `humar` encuentra también `húmar`. Era una decisión tomada por intuición que ahora tiene respaldo.

**Salvedad:** en el manual de 2016 los propios investigadores anotaron que «se discute sobre la pertinencia del acento en el Ckunsa». Lo de arriba es una inferencia bien fundada sobre una tesis, no una decisión del Consejo.

---

## El orden alfabético lo define el Grafemario

En la grafía CLCK, `ck`, `tch`, `tck`, `th`, `tt`, `ph`, `pp` y `ts` son **grafemas propios**, no secuencias de letras. Es la misma lógica de la `ch` y la `ll` del castellano antes de 1994.

Ordenar `ckabur` bajo la C sería aplicarle al ckunsa el alfabeto del castellano. Y ordenarlo bien exigiría saber en qué posición va cada dígrafo, que es lo que define el Grafemario.

**La salida no la decidimos nosotros:** el Consejo publica su propio glosario alfabético en lenguackunsa.cl, y está ordenado **por la glosa en español**. Esta aplicación sigue esa práctica.

Además es lo que sirve al usuario real: quien explora una lengua dormida casi siempre parte del español, porque todavía no sabe la palabra en ckunsa.

---

## Sin iconografía atacameña

**Ni grecas, ni chakanas, ni wiphalas, ni «patrones andinos», ni motivos de textiles, cerámica o petroglifos.**

Su origen está en el lenguaje visual de poder de Tiwanaku y es patrimonio vivo del pueblo lickanantay. Tomarlo para decorar una interfaz es el equivalente visual de inventar una forma verbal.

Si la comunidad quiere identidad visual propia, la aporta la comunidad, con crédito.

**Consecuencia práctica:** el ícono de la app son las letras `ck` en Andika sobre el color adobe. Tipografía, no simbología — coherente con un proyecto sobre cómo se escribe la lengua, y reemplazable el día que haya identidad propia.

---

## Lo que la aplicación no va a hacer

- **Traducir oraciones.** No está documentado el sistema verbal.
- **Generar formas nuevas** presentándolas como documentadas.
- **Audio sintético.** Sin hablantes, la pronunciación es reconstrucción especulativa. Si algún día hay audio, tiene que ser de educadores tradicionales reales, con nombre y permiso.
- **Publicar contenido ceremonial.** El talatur y los cantos están documentados en papers, pero que estén publicados no significa que corresponda ponerlos en una app.
- **Narrar la historia o la cultura del pueblo lickanantay.** Este proyecto habla de la lengua y de su documentación. Lo demás no es nuestro para escribirlo.

---

## Cosas sin resolver

**Las reglas de acentuación, en su fuente original.** Lo que sabemos viene de una tesis que sistematiza los documentos del Consejo, no de los documentos. Y el manual de 2016 dice que el tema estaba en discusión.

**El caso `humar` / `húmar`.** Registrados como 'nudo' y 'vacío'. Si la tilde fuera contrastiva serían dos palabras y la app las está tratando como una. La regla de acento predecible sugiere que no lo es, pero es una inferencia. Es la primera pregunta concreta para el Consejo.

**Si el corpus debería normalizarse.** Tenemos las reglas suficientes para convertir buena parte de las 851 formas. La decisión de aplicarlas no es técnica.
