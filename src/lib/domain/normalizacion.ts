/**
 * Normalización de grafías ckunsa en dos niveles.
 *
 * TypeScript puro: sin Svelte, sin DOM. Ver 01-ARQUITECTURA.md §2.
 *
 * El problema: la misma palabra aparece escrita de cinco formas según la
 * fuente (*cunza*, *kunza*, *cunsa*, *kunsa*, *ckunsa*). Pero colapsar todo
 * lo que se parece rompe pares mínimos reales del grafemario CLCK:
 * `patha` 'gracias' ≠ `patta` 'madre'.
 *
 * De ahí los dos niveles. Ver 03-MODELO-DE-DATOS.md §3 y
 * 02-LINGUISTICA-CKUNSA.md §3.2 (D3).
 */

// ---------------------------------------------------------------------------
// Inventario de grafemas
// ---------------------------------------------------------------------------

/**
 * Grafemas del ckunsa según `grafemario_ckunsa.csv` del corpus OSF, que es el
 * grafemario propuesto por Llanquiman (2023).
 *
 * OJO: NO es el *Grafemario Unificado Ckunsa* (CLCK, 2018), que sigue sin
 * conseguirse (bloqueante B1). Es la mejor aproximación disponible.
 *
 * Faltan del documento original: reglas de acentuación, tratamiento de
 * préstamos y correspondencia grafema→fonema. Ante una duda ortográfica que
 * esas reglas resolverían, se marca como pendiente y no se resuelve por
 * analogía con el castellano.
 */
export const VOCALES = ['a', 'e', 'i', 'o', 'u'] as const;

export const VOCALES_GEMINADAS = ['aa', 'ee', 'ii', 'oo', 'uu'] as const;

export const CONSONANTES = [
	'b',
	'ck',
	'tck',
	'h',
	'l',
	'm',
	'n',
	'p',
	'ph',
	'pp',
	's',
	'r',
	't',
	'th',
	'tt',
	'tch',
	'ts',
	'y'
] as const;

/**
 * Letras que NO existen en la grafía CLCK. Si una forma las usa, viene de una
 * fuente histórica o es un préstamo sin adaptar: va como variante, no como
 * `forma_clck`.
 */
export const GRAFEMAS_AJENOS = [
	'c',
	'k',
	'q',
	'z',
	'v',
	'w',
	'g',
	'd',
	'f',
	'j',
	'ñ',
	'x'
] as const;

// ---------------------------------------------------------------------------
// Nivel estricto — clave_canonica
// ---------------------------------------------------------------------------

/**
 * Colapsa las geminadas vocálicas: `aa`→`a`, `ee`→`e`, etc.
 *
 * Se hace en bucle y no con un único replace porque `aaa` tiene que terminar
 * en `a`: un `replace(/aa/g, 'a')` sobre `aaa` deja `aa`.
 */
function colapsarGeminadasVocalicas(s: string): string {
	let resultado = s;

	for (const vocal of VOCALES) {
		const geminada = vocal + vocal;
		while (resultado.includes(geminada)) {
			resultado = resultado.split(geminada).join(vocal);
		}
	}

	return resultado;
}

/**
 * Nivel ESTRICTO. Genera la `clave_canonica` que alimenta el índice principal
 * de búsqueda.
 *
 * Sólo hace cuatro cosas: minúsculas, sacar diacríticos, colapsar geminadas
 * vocálicas y sacar guiones y espacios.
 *
 * Deliberadamente NO toca `h`, `th`/`tt`, `ph`/`pp`, `tch`/`tck` ni `y`/`i`:
 * en la grafía CLCK son contrastivos y colapsarlos fusiona palabras distintas.
 *
 * Colapsar geminadas vocálicas sí es seguro: probado contra las 1.727 formas
 * del corpus, las 33 colisiones que produce son todas variantes de la misma
 * palabra, marcadas por el propio corpus con "Variante: ...".
 *
 * @param forma  Forma en ckunsa, tal como está en `forma_clck`.
 * @returns      Clave de búsqueda estricta.
 */
export function canonizar(forma: string): string {
	let s = forma.toLowerCase();

	// NFD separa la letra de su diacrítico; el rango \u0300-\u036f son los
	// diacríticos combinantes. NFC vuelve a componer lo que quede.
	s = s
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.normalize('NFC');

	s = colapsarGeminadasVocalicas(s);

	// Guiones y espacios (internos y de los bordes).
	s = s.replace(/[\s-]/g, '');

	return s;
}

// ---------------------------------------------------------------------------
// Nivel tolerante — clave_historica
// ---------------------------------------------------------------------------

/**
 * Equivalencias entre grafías históricas, en ORDEN DE APLICACIÓN.
 *
 * El orden es crítico: los dígrafos van de más largo a más corto. Si `ck` se
 * procesara antes que `tck`, la forma `ckotcko` perdería el dígrafo y daría
 * una clave incorrecta. Y las oclusivas simples (`t`, `p`) van DESPUÉS de sus
 * dígrafos, para que `hata` y `hatta` terminen en la misma clave.
 *
 * Los símbolos de destino van en MAYÚSCULA a propósito: como la entrada ya
 * pasó por `canonizar()` y está toda en minúscula, las mayúsculas son un
 * espacio seguro que ninguna regla posterior vuelve a capturar.
 *
 * LIMITACIONES CONOCIDAS (documentadas, no accidentales): este nivel NO
 * colapsa `b` ~ `p` (*ckapur* ~ *ckabur*) ni la desaparición de la bilabial
 * (*ckabur* ~ *caur*). Son alternancias registradas en
 * 02-LINGUISTICA-CKUNSA.md §3.3, pero el algoritmo de
 * 08-CORPUS-OSF-ANALISIS.md §5 no las cubre y no se inventan acá. Hay tests
 * que fijan esta limitación.
 */
const EQUIVALENCIAS_HISTORICAS: readonly (readonly [RegExp, string])[] = [
	// Dígrafos, de más largo a más corto.
	[/tck/g, 'C'],
	[/tch/g, 'C'],
	[/ch/g, 'C'],
	[/tz/g, 'S'],
	[/ts/g, 'S'],
	[/ck/g, 'K'],
	[/qu/g, 'K'],
	[/ph/g, 'P'],
	[/pp/g, 'P'],
	[/th/g, 'T'],
	[/tt/g, 'T'],

	// Letras sueltas.
	[/[qkc]/g, 'K'],
	[/[zç]/g, 's'],
	[/[vwb]/g, 'B'],

	// Oclusivas simples: las fuentes del XIX oscilan entre `hata` y `hatta`,
	// `ckuta` y `ckutta`. Van después de los dígrafos por el orden de arriba.
	[/t/g, 'T'],
	[/p/g, 'P'],

	[/y/g, 'i'],

	// La h es errática en las fuentes históricas (en Vaïsse 1896 marca una
	// probable oclusiva glotal). Se ignora en este nivel.
	[/h/g, '']
];

/** Colapsa consonantes repetidas: `TT`→`T`, `SS`→`S`. */
function colapsarRepetidas(s: string): string {
	return s.replace(/(.)\1+/g, '$1');
}

/**
 * Nivel TOLERANTE. Genera la `clave_historica`.
 *
 * SÓLO SE CONSULTA COMO FALLBACK, cuando el nivel estricto no devolvió nada.
 * Es deliberadamente lossy: fusiona pares mínimos que `canonizar()` mantiene
 * separados. Consultarlo primero rompería el diccionario.
 *
 * Existe para un caso concreto y real: quien aprendió con material de los 80
 * escribe *kunza* y tiene que encontrar *ckunsa*.
 *
 * Todo resultado que salga por este camino se marca `motivo: 'aproximada'` y
 * la UI explica la coincidencia. Es didáctico, no ruido.
 *
 * @param forma  Forma en ckunsa o en cualquier grafía histórica.
 * @returns      Clave de búsqueda tolerante.
 */
export function historizar(forma: string): string {
	let s = canonizar(forma);

	for (const [patron, reemplazo] of EQUIVALENCIAS_HISTORICAS) {
		s = s.replace(patron, reemplazo);
	}

	// Finales -ao / -au → -u (ckarao ~ ckarau ~ ckaru 'costilla').
	s = s.replace(/a[ou]$/, 'u');

	s = colapsarRepetidas(s);

	return s;
}
