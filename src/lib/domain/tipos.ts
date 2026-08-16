/**
 * Tipos del dominio lingüístico.
 *
 * Este archivo es TypeScript puro: no importa nada de Svelte, ni de SvelteKit,
 * ni toca el DOM. Ver 01-ARQUITECTURA.md §2 (regla de oro).
 *
 * El esquema está alineado con el corpus morfofonológico de Llanquiman, Hasler
 * y Torrico-Ávila. Ver 03-MODELO-DE-DATOS.md §1.
 */

// ---------------------------------------------------------------------------
// Enums cerrados
// ---------------------------------------------------------------------------

/**
 * Nivel de evidencia de una forma en ckunsa.
 *
 * Enum CERRADO (D7): agregar un nivel es decisión de la comunidad, no un
 * cambio de código.
 *
 * - `atestiguada`  aparece tal cual en una fuente primaria documental
 * - `unificada`    forma del Grafemario / Diccionario Unificado del CLCK
 * - `reconstruida` producto de análisis o de composición por regla documentada
 * - `propuesta`    neologismo o forma pedagógica, sin respaldo documental
 *
 * OJO: este eje mide de dónde sale el DATO, no en qué ortografía está escrito.
 * Para lo segundo está `Entrada.grafia_provisional`.
 *
 * Ver 02-LINGUISTICA-CKUNSA.md §5.
 */
export type NivelEvidencia = 'atestiguada' | 'unificada' | 'reconstruida' | 'propuesta';

/**
 * Una entrada nunca se borra. Si la comunidad determina que una forma es
 * incorrecta, pasa a 'retirada' con motivo. Ver 03-MODELO-DE-DATOS.md §5.
 */
export type EstadoEntrada = 'activa' | 'retirada';

/** Columna `raiz_derivado_compuesto` del corpus OSF. */
export type Estructura = 'raiz' | 'derivado' | 'compuesto' | 'sufijo' | 'pendiente';

export type Categoria =
	| 'sustantivo'
	| 'verbo'
	| 'adjetivo'
	| 'adverbio'
	| 'pronombre'
	| 'locucion'
	| 'preposicion'
	| 'articulo'
	| 'interjeccion'
	| 'numeral'
	| 'particula'
	| 'toponimo'
	| 'antroponimo'
	| 'desconocida';

/**
 * Vocal de enlace del sufijo verbalizador -tur.
 *
 * D5, la decisión de diseño más importante del proyecto: no hay regla que
 * prediga esta vocal. Los tres valores NO son intercambiables:
 *
 * - `'a'` / `'i'`      la fuente la registra → el generador compone y marca `reconstruida`
 * - `null`             va sin vocal de enlace (raíz + -tur directo)
 * - `'desconocida'`    la fuente no lo registra → el generador devuelve `incierto`
 *                      con las tres candidatas, nunca elige una
 *
 * Ver 02-LINGUISTICA-CKUNSA.md §4.4.
 */
export type VocalEnlace = 'a' | 'i' | null | 'desconocida';

export type LenguaPrestamo = 'quechua' | 'aimara' | 'castellano' | 'otra';

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------

export interface Prestamo {
	lengua: LenguaPrestamo;
	/** Étimo tal como lo registra la fuente. ej: "wasi", "caballo" */
	etimo: string;
}

export interface VarianteHistorica {
	/** La forma tal cual aparece en la fuente, sin normalizar. ej: "kunza" */
	forma: string;
	/** id de Fuente */
	fuente: string;
}

/**
 * Identificador de esta entrada en un catálogo externo.
 *
 * La procedencia es el activo más valioso del corpus: esto permite volver a la
 * fila original de la fuente y devolver correcciones al ecosistema
 * (04-DATOS-Y-FUENTES.md §5).
 *
 * Esquemas en uso:
 * - `"ids"`          id de counterpart en IDS.        ej: "308-1-210-1"
 * - `"concepticon"`  id de concept set en Concepticon. ej: "626"
 */
export interface IdentificadorExterno {
	esquema: string;
	valor: string;
}

export interface Audio {
	url: string;
	/** Nombre del educador tradicional o miembro de la comunidad. Nunca TTS. */
	hablante: string;
	/** Referencia al permiso escrito. Ver 05-PROTOCOLO-COMUNITARIO.md §4. */
	permiso: string;
}

export interface Entrada {
	/** Slug estable, nunca cambia. ej: "ckabur-montana" */
	id: string;

	/** Grafía canónica CLCK 2018. ej: "ckabur" */
	forma_clck: string;

	/**
	 * true si `forma_clck` NO está en grafía CLCK todavía, sino en la de su
	 * fuente (Lehnert, Vaïsse, etc.).
	 *
	 * Eje distinto de `nivel_evidencia`: una forma puede ser `atestiguada`
	 * (dato sólido) y estar escrita en una ortografía que no es la canónica.
	 * Mientras no esté el Grafemario Unificado (bloqueante B1) no se puede
	 * convertir sistemáticamente, y convertir por analogía con el castellano
	 * está prohibido.
	 *
	 * La UI tiene que decir "grafía de la fuente, pendiente de normalización".
	 */
	grafia_provisional?: boolean;

	/**
	 * DERIVADA — nivel estricto. No se escribe a mano: la calcula
	 * `canonizar(forma_clck)`. El validador falla el build si no coincide.
	 */
	clave_canonica: string;

	/**
	 * DERIVADA — nivel tolerante, sólo para el fallback de búsqueda.
	 * No se escribe a mano: la calcula `historizar(forma_clck)`.
	 */
	clave_historica: string;

	significados: string[];
	categoria: Categoria;

	/**
	 * Campo semántico. En IDS son los 22 capítulos del cuestionario de Key &
	 * Comrie, adaptados de Buck (1949). ej: "El mundo físico", "El cuerpo".
	 */
	campo_semantico?: string;

	nivel_evidencia: NivelEvidencia;

	/** ids de Fuente. Mínimo 1. Sin esto la entrada no entra al corpus. */
	fuentes: string[];

	variantes_historicas?: VarianteHistorica[];

	identificadores_externos?: IdentificadorExterno[];

	// --- morfología ---

	estructura: Estructura;

	/** Columna `tipo` del corpus. ej: "infinitivo", "imperativo", "preterito" */
	tipo?: string;

	/** id de la Entrada raíz, si esta es un derivado. */
	raiz_de?: string;

	/** ids de Morfema que componen la forma. */
	morfemas?: string[];

	vocal_enlace?: VocalEnlace;

	// --- fonología ---

	/** AFI fonológica. ej: "ka.ˈbur" */
	transcripcion_fonologica?: string;

	/** AFI alofónica. */
	transcripcion_fonetica?: string;

	silabas?: number;

	/** ej: "CV.CVC" */
	patron_silabico?: string;

	prestamo?: Prestamo;

	observaciones?: string;

	audio?: Audio;

	estado: EstadoEntrada;

	/** Obligatorio si `estado === 'retirada'`. */
	motivo_retiro?: string;
}

// ---------------------------------------------------------------------------
// Fuente
// ---------------------------------------------------------------------------

export type TipoFuente = 'primaria' | 'analisis' | 'comunitaria' | 'educativa' | 'catalogo';

export interface Fuente {
	/** ej: "clck-2021", "ids-lehnert-2021", "llanquiman-2023" */
	id: string;

	/** Cita bibliográfica completa, como se muestra en /fuentes. */
	cita: string;

	anio: number;
	tipo: TipoFuente;

	/** ej: "CC BY 4.0" | "dominio público" | "autorización 2026-xx" */
	licencia: string;

	url?: string;

	/** true sólo para material oficial del CLCK. */
	autoridad_normativa: boolean;
}

// ---------------------------------------------------------------------------
// Morfema
// ---------------------------------------------------------------------------

export type TipoMorfema = 'flexivo' | 'derivativo' | 'particula';
export type PosicionMorfema = 'sufijo' | 'prefijo' | 'infijo';

export interface EjemploMorfema {
	base: string;
	resultado: string;
	glosa: string;
	/** id de Fuente */
	fuente: string;
}

export interface Morfema {
	/** ej: "suf-adlativo-ps" */
	id: string;

	/** ej: "-ps" */
	forma: string;

	/** ej: ["-pa", "-pas"] */
	variantes?: string[];

	tipo: TipoMorfema;

	/** ej: "adlativo", "plural", "verbalizador" */
	funcion: string;

	descripcion: string;
	posicion: PosicionMorfema;
	nivel_evidencia: NivelEvidencia;

	/** ids de Fuente. Mínimo 1. */
	fuentes: string[];

	ejemplos: EjemploMorfema[];
}

// ---------------------------------------------------------------------------
// Corpus y manifest
// ---------------------------------------------------------------------------

export interface Manifest {
	version: number;
	/** ISO 8601 */
	generado: string;
	archivos: {
		entradas: string;
		fuentes: string;
		morfemas: string;
	};
	conteos: {
		entradas: number;
		fuentes: number;
		morfemas: number;
	};
}

/** Todo el corpus cargado en memoria. */
export interface Corpus {
	version: number;
	entradas: Entrada[];
	fuentes: Fuente[];
	morfemas: Morfema[];
}