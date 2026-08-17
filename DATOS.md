# Datos, fuentes y comunidad

De dónde sale cada dato, bajo qué condiciones se puede usar, y qué se consulta con la comunidad antes de publicarlo.

Es el documento que más rápido queda desactualizado, porque describe conversaciones en curso. La fecha de cada verificación está anotada.

Las decisiones sobre la lengua están en [`LENGUA.md`](./LENGUA.md); las técnicas, en [`DECISIONES.md`](./DECISIONES.md).

---

## Índice

- [La regla que ordena todo](#la-regla-que-ordena-todo)
- [Qué se publica hoy](#qué-se-publica-hoy)
- [Qué se consultó pero no se publica](#qué-se-consultó-pero-no-se-publica)
- [Qué falta conseguir](#qué-falta-conseguir)
- [Las organizaciones del territorio](#las-organizaciones-del-territorio)
- [El contexto político del Grafemario](#el-contexto-político-del-grafemario)
- [Qué se consulta con la comunidad](#qué-se-consulta-con-la-comunidad)
- [Cómo se trata una fuente](#cómo-se-trata-una-fuente)
- [Cosas sin resolver](#cosas-sin-resolver)

---

## La regla que ordena todo

**Ningún dato se publica sin licencia verificada.** No «probablemente esté bien»: verificada.

Y una segunda, que es la que gobierna las demás: **el ckunsa es patrimonio del pueblo lickanantay.** Este proyecto reúne material publicado sobre la lengua; no la representa ni tiene autoridad sobre ella.

Si alguna organización lickanantay considera que algo de esta aplicación no corresponde publicarse, **se retira sin condiciones.** Está escrito en la app, en el README y acá.

---

## Qué se publica hoy

**851 entradas**, todas de fuentes con licencia abierta verificada.

| Fuente | Qué aporta | Licencia |
|---|---|---|
| Lehnert Santander, R. (2021). *Kunza Dictionary*, en el Intercontinental Dictionary Series (MPI-EVA) | las formas y su documentación | **CC BY 4.0** |
| CLLD Concepticon, lista `Key-2016-1310` | las glosas en español | **CC BY 4.0** |
| Andika Regular (SIL Global) | la tipografía | **OFL 1.1** |

Concepticon va marcada como `catalogo`, no como fuente documental: **no documenta el ckunsa**, aporta la lista de conceptos y sus glosas. Mezclarla induciría a creer que es documentación de la lengua.

**Consecuencia práctica:** la atribución aparece en cada ficha de palabra, en formato compacto en cada resultado de búsqueda, y completa en `/fuentes`. La cita compacta siempre enlaza al dato completo — eso es lo que la vuelve admisible bajo CC BY.

---

## Qué se consultó pero no se publica

Los dos son **consultables, no publicables**. Ninguno habilita normalizar el corpus ni afirmar «esta es la grafía CLCK».

### El manual de trabajo del Consejo (2016)

*Grafemario Unificado — Manual de trabajo para cultores y educadores tradicionales*. Consejo Lingüístico CKunsa Lickanantay, San Pedro de Atacama, cerrado en enero de 2017. Patrocinio de CONADI y la Oficina de Asuntos Indígenas.

Investigadores: Ilia Reyes Aymani, Rubén Reyes Aymani, Juan Siares Flores, Wenceslao Reyes Chinchilla, Tomás Vilca Vilca.

**No es el Grafemario Unificado de 2018.** El documento lo dice de sí mismo: «un Grafemario definitivo de la lengua CKunsa está en gestación», y lo que presenta es «un manual de trabajo de consulta e investigación conjunta». Declara además que en 2016 **no fue posible validarlo con los educadores tradicionales ni las comunidades**.

**Procedencia: descargado de Scribd, y eso es un problema de fondo.** Scribd es una plataforma de subida abierta: no acredita quién subió el archivo ni con qué permiso. Es material interno de un proceso comunitario inconcluso que llegó ahí por una vía desconocida. El Consejo produjo ese material peleando para que su lengua se enseñara en su propio territorio; tomarlo de una plataforma que no le pidió permiso a nadie sería exactamente lo que este proyecto dice no hacer.

**Uso admitido:** entender el estado de la cuestión y formular mejores preguntas.
**Uso no admitido:** normalizar el corpus, publicar sus datos, citarlo como fuente normativa.
**En el contacto con el Consejo se declara que lo tenemos y de dónde salió.** Es lo que vuelve honesta una conversación incómoda.

Lo que aporta: confirma que las descripciones de grafemas se citan textualmente de Vaïsse et al. (1896); trae observaciones propias de los investigadores lickanantay —la `ck` podría estar pronunciándose mal y hace falta un lingüista alemán para dilucidarla; `tt` y `pp` son «un doble chasquido»—; y anota que **«se discute sobre la pertinencia del acento en el Ckunsa»**.

### El diccionario de Vilte (2004)

*Kunza: diccionario kunza-español / español-kunza. Lengua del pueblo lickan antai o atacameño*. Investigación de Julio Vilte Vilte, fotografía de Claudio Pérez. Codelco Chile, 2004. ISBN 956-8072-03-9.

**No es el Diccionario Unificado del CLCK.** Es una obra anterior, citada como una de las fuentes que el Consejo usó después.

Procedencia: **Memoria Chilena / Biblioteca Nacional Digital**. Fuente institucional legítima — la Biblioteca Nacional lo digitalizó y lo publica. Pero eso da **acceso de lectura, no derechos de reutilización**: conserva copyright de Codelco y registro de propiedad intelectual.

---

## Qué falta conseguir

**El *Grafemario Unificado Ckunsa* (2018).** Es lo que más falta. Sin él las palabras siguen escritas en la grafía de sus fuentes y no en la oficial. No está publicado como dataset ni como PDF accesible.

**El *Diccionario Unificado de la Lengua Ckunsa* (2021).** Tampoco disponible en abierto. Circula en papel: se repartieron unos 3.000 ejemplares y en junio de 2025 se donaron 500 al Ministerio de las Culturas.

**El corpus morfofonológico.** De «El empleo de una base de datos para el estudio morfofonológico del ckunsa», de Eduardo Llanquiman Iturrieta, Felipe Hasler Sandoval y Elizabeth Torrico-Ávila (*Anthropologica* 43(54), 2025, pp. 282-305). Los datos están en `osf.io/u764r`: **1.728 formas con transcripción fonética y análisis morfológico**.

Está público y descargable, pero **el repositorio no declara licencia**, lo que por defecto significa todos los derechos reservados. Se puede leer y estudiar; no se puede publicar. Alcanzaría con una autorización escrita de los tres autores.

Detalle útil para el contacto: el depósito en OSF figura sólo a nombre de Llanquiman, pero el artículo es de los tres.

---

## Las organizaciones del territorio

**Verificado en agosto de 2026.** Una versión anterior de este documento decía «Fundación Yockontur», que no existe: Yockontur es un proyecto, no una organización. El dato estuvo publicado en la app hasta que se corrigió. **Antes de nombrar una organización, verificar.**

**Consejo Lingüístico Ckunsa Lickanantay (CLCK).** Ese es el nombre completo con el que figura en sus publicaciones. Fundado el 14 de diciembre de 2010; participan comunidades de Chile, más Quetena en Bolivia y Olaroz, Rosario de Susques y Susques en Argentina. Presidente: Rubén Reyes. Sitio: **lenguackunsa.cl**, con glosario alfabético, un Atlas de la lengua con categorías temáticas propias y biblioteca digital.

**Corporación Cultural La Huella Teatro.** Impulsa el proyecto **Yockontur** («hablar» en ckunsa), presentado por Escondida | BHP, con patrocinio del CLCK y apoyo de UNESCO. Dirección: Alejandra Rojas Pinto. Tercera edición en 2026, en ocho localidades —Peine, Solor, Camar, Río Grande, San Pedro de Atacama, Socaire, Talabre y Toconao— y nueve establecimientos.

**CONADI El Loa.**

**Centro de Pensamiento Atacameño Ckunsa Ttulva.** De su trabajo surgió la Academia de Historia y Lengua Kunza.

**Educadores tradicionales** de las escuelas de San Pedro de Atacama, Toconao, Peine, Socaire, Caspana y Chiu Chiu. Aparecen en la bibliografía y la prensa Ilia Reyes Aymani (cultora, autora de material pedagógico) y Tomás Vilca (nieto de una de las últimas hablantes).

**Existe una app previa.** «Diccionario Ckunza 2.0», lanzada en 2019 por el Centro de Docencia Vespertina de la Universidad Arturo Prat en Calama junto a CONADI, con más de 1.200 palabras — más que esta. Gestor: Wilson Reyes Araya, consejero nacional indígena de CONADI. Su enlace en Play Store devuelve error, pero eso no confirma que esté discontinuada.

**Es la primera pregunta a hacer:** si esa app funciona, quizá lo que corresponde es aportar ahí y no construir otra por afuera.

---

## El contexto político del Grafemario

El CLCK tomó el control de la enseñanza de la lengua —capacitando educadores tradicionales, diseñando material y publicando diccionarios y grafemarios— **para contrarrestar la decisión del Ministerio de Educación de enseñar sólo quechua y aimara en territorio lickanantay** a través del programa PEIB. La bibliografía lo describe como política lingüística *desde abajo* frente a una *desde arriba*.

**Consecuencia para este proyecto:** el Grafemario y el Diccionario Unificado **no son documentos académicos, son actos de autodeterminación.** Pedirlos no es un trámite bibliográfico.

---

## Qué se consulta con la comunidad

La regla es simple: **si cambia lo que alguien va a creer sobre la lengua, no es una decisión técnica.**

Se consulta:

- Cualquier normalización ortográfica del corpus.
- Qué contenido corresponde publicar y cuál no.
- La licencia definitiva de los datos producidos.
- La identidad visual, si la hubiera.
- Si este proyecto debe existir.

No se consulta: el color de un botón, la estructura de carpetas, qué librería usar.

**El proyecto no tiene aval de ninguna organización lickanantay.** Está dicho explícitamente en la app, en `/fuentes` y en el README. Las organizaciones figuran como referencia, no como colaboradoras.

---

## Cómo se trata una fuente

**Los archivos crudos no se editan nunca.** Viven en `data-pipeline/fuentes-crudas/` tal como los publicó cada fuente. Toda transformación es código versionado y testeado, así que se puede auditar de dónde salió cada carácter.

**Cada entrada guarda su identificador externo.** Si se detecta un error en el material original, se puede devolver la corrección a quien lo publicó en vez de arreglarlo sólo acá.

**Los comentarios de la fuente se preservan verbatim y no se parsean.** El «Also X; Y» de Lehnert significa «también registrado para este concepto», no «variante de esta forma». Interpretarlo sería inventar relaciones entre palabras.

**El validador falla el build** si una entrada no tiene fuente, si su forma viene en NFD, o si las colisiones de clave superan el baseline medido.

---

## Cosas sin resolver

**Los cuatro bloqueantes siguen abiertos.** El Grafemario, el Diccionario Unificado, la licencia del corpus OSF, y saber si la app de 2019 sigue viva.

**No se ha contactado a nadie todavía.** Ni al Consejo ni a los autores del corpus. Existe una vía: un amigo que conectó el proyecto con este trabajo y puede tener contactos en el territorio.

**La licencia de los datos es provisoria.** Hoy los JSON se distribuyen bajo la CC BY 4.0 que heredan de sus fuentes, y eso es lo que corresponde a una obra derivada. Pero la licencia definitiva del corpus **la decide la comunidad**, no este proyecto. Ver [`LICENSES.md`](./LICENSES.md).

**Qué pasa si la respuesta es que no.** Está previsto: se retira. No está previsto qué hacer con el trabajo hecho — probablemente ofrecer el código y el pipeline, que son reutilizables para otra lengua o para la app que la comunidad prefiera.
