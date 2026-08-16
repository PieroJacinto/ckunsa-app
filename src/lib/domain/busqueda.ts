/**
 * Índice de búsqueda en memoria y ranking.
 *
 * TypeScript puro: sin Svelte, sin DOM (`01-ARQUITECTURA` §2). Sin librerías:
 * medido sobre el corpus real, el fuzzy cuesta 0,17 ms por consulta con 851
 * entradas y 0,61 ms con 5.000. Un frame a 60 fps son 16,7 ms, así que estamos
 * dos órdenes de magnitud por debajo de lo perceptible. Por eso no se instaló
 * ninguna librería de fuzzy search (`01-ARQUITECTURA` §9).
 *
 * Ranking y motivos: `03-MODELO-DE-DATOS.md` §4.
 *
 * NOTA: no usar parameter properties (`constructor(private x)`), enums ni
 * namespaces. No son sintaxis borrable y rompen la ejecución directa con Node
 * (`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`), que es como corre el pipeline.
 */

import { canonizar, historizar } from './normalizacion';
import type { Corpus, Entrada } from './tipos';

/**
 * Por qué coincidió un resultado. La UI lo muestra: un usuario que ve *"coincide
 * con la variante histórica"* aprende algo real sobre el estado de la lengua.
 */
export type MotivoCoincidencia =
	'exacta' | 'variante' | 'espanol' | 'prefijo' | 'contiene' | 'aproximada';

export interface ResultadoBusqueda {
	entrada: Entrada;
	motivo: MotivoCoincidencia;
	/** Explicación para la UI. Sólo en las coincidencias aproximadas. */
	detalle?: string;
}

export interface IndiceBusqueda {
	porId: Map<string, Entrada>;
	porCanonica: Map<string, string[]>;
	/** Fallback: sólo se consulta si el nivel estricto no devolvió nada. */
	porHistorica: Map<string, string[]>;
	porVariante: Map<string, string[]>;
	porSignificado: Map<string, string[]>;
	canonicas: string[];
	significados: string[];
}

/** Tope de resultados. Nadie mira más de 50, y acota el costo del fuzzy. */
export const LIMITE_RESULTADOS = 50;

/** Consultas más cortas no entran al fuzzy ni a "contiene": devolverían todo. */
const MINIMO_PARA_PARCIAL = 3;

function agregar(mapa: Map<string, string[]>, clave: string, id: string): void {
	if (!clave) return;
	const ids = mapa.get(clave);
	if (ids) {
		if (!ids.includes(id)) ids.push(id);
	} else {
		mapa.set(clave, [id]);
	}
}

/** Minúsculas y sin acentos. Para el lado español, que no usa grafía ckunsa. */
export function normalizarSignificado(texto: string): string {
	return texto
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.normalize('NFC')
		.trim();
}

/**
 * Arma el índice. Se llama una vez al cargar el corpus: medido, 3,9 ms con 851
 * entradas y 13,5 ms con 2.500.
 *
 * Las entradas retiradas SÍ entran al índice, porque `buscarExacta` tiene que
 * poder encontrarlas para mostrar el motivo del retiro. Es `buscar` la que las
 * filtra de los resultados normales (`03-MODELO-DE-DATOS` §5).
 */
export function construirIndice(corpus: Corpus): IndiceBusqueda {
	const indice: IndiceBusqueda = {
		porId: new Map(),
		porCanonica: new Map(),
		porHistorica: new Map(),
		porVariante: new Map(),
		porSignificado: new Map(),
		canonicas: [],
		significados: []
	};

	for (const entrada of corpus.entradas) {
		indice.porId.set(entrada.id, entrada);
		agregar(indice.porCanonica, entrada.clave_canonica, entrada.id);
		agregar(indice.porHistorica, entrada.clave_historica, entrada.id);

		for (const variante of entrada.variantes_historicas ?? []) {
			agregar(indice.porVariante, canonizar(variante.forma), entrada.id);
			agregar(indice.porHistorica, historizar(variante.forma), entrada.id);
		}

		for (const significado of entrada.significados) {
			agregar(indice.porSignificado, normalizarSignificado(significado), entrada.id);
		}
	}

	indice.canonicas = [...indice.porCanonica.keys()];
	indice.significados = [...indice.porSignificado.keys()];

	return indice;
}

/**
 * Distancia de Levenshtein ACOTADA, con dos salidas tempranas.
 *
 * Sin el corte, el 95% del trabajo se gasta comparando contra palabras que no
 * se parecen en nada. Devuelve `max + 1` para decir "se pasó", sin calcular el
 * valor real.
 */
export function distancia(a: string, b: string, max: number): number {
	if (Math.abs(a.length - b.length) > max) return max + 1;

	let previa = new Array<number>(b.length + 1);
	let actual = new Array<number>(b.length + 1);

	for (let j = 0; j <= b.length; j++) previa[j] = j;

	for (let i = 1; i <= a.length; i++) {
		actual[0] = i;
		let mejor = i;

		for (let j = 1; j <= b.length; j++) {
			const costo = a[i - 1] === b[j - 1] ? 0 : 1;
			const valor = Math.min(actual[j - 1]! + 1, previa[j]! + 1, previa[j - 1]! + costo);
			actual[j] = valor;
			if (valor < mejor) mejor = valor;
		}

		// Si toda la fila ya superó el máximo, no hay forma de bajar después.
		if (mejor > max) return max + 1;

		const tmp = previa;
		previa = actual;
		actual = tmp;
	}

	return previa[b.length]!;
}

interface Acumulador {
	readonly resultados: ResultadoBusqueda[];
	lleno(): boolean;
	sumar(ids: readonly string[] | undefined, motivo: MotivoCoincidencia, detalle?: string): void;
}

/**
 * Junta resultados en orden de ranking, sin repetir entradas: la primera razón
 * por la que apareció es la que se muestra, y es la más fuerte.
 */
function crearAcumulador(indice: IndiceBusqueda): Acumulador {
	const vistos = new Set<string>();
	const resultados: ResultadoBusqueda[] = [];
	const lleno = () => resultados.length >= LIMITE_RESULTADOS;

	return {
		resultados,
		lleno,
		sumar(ids, motivo, detalle) {
			if (!ids) return;

			for (const id of ids) {
				if (lleno()) return;
				if (vistos.has(id)) continue;

				const entrada = indice.porId.get(id);
				if (!entrada) continue;

				// Las retiradas no aparecen en resultados normales.
				if (entrada.estado === 'retirada') continue;

				vistos.add(id);
				resultados.push(detalle === undefined ? { entrada, motivo } : { entrada, motivo, detalle });
			}
		}
	};
}

/**
 * Busca en las dos direcciones a la vez: español → ckunsa y ckunsa → español,
 * con el mismo input y sin selector de idioma. Alguien que escribe "cueva"
 * obtiene `toco` y `ckoiba`; alguien que escribe "toco" obtiene su ficha.
 *
 * Orden de ranking (`03-MODELO-DE-DATOS` §4): exacta canónica, variante
 * declarada, significado exacto, prefijos, contiene, grafía histórica y fuzzy.
 * Los dos últimos salen marcados `aproximada` con su explicación.
 */
export function buscar(indice: IndiceBusqueda, consulta: string): ResultadoBusqueda[] {
	const bruta = consulta.trim();
	if (bruta === '') return [];

	const ck = canonizar(bruta);
	const es = normalizarSignificado(bruta);
	const acc = crearAcumulador(indice);

	// 1-3: coincidencias exactas.
	acc.sumar(indice.porCanonica.get(ck), 'exacta');
	acc.sumar(indice.porVariante.get(ck), 'variante');
	acc.sumar(indice.porSignificado.get(es), 'espanol');

	// 4-5: prefijos.
	if (!acc.lleno()) {
		for (const clave of indice.canonicas) {
			if (acc.lleno()) break;
			if (clave !== ck && clave.startsWith(ck)) {
				acc.sumar(indice.porCanonica.get(clave), 'prefijo');
			}
		}
	}

	if (!acc.lleno()) {
		for (const significado of indice.significados) {
			if (acc.lleno()) break;
			if (significado !== es && significado.startsWith(es)) {
				acc.sumar(indice.porSignificado.get(significado), 'prefijo');
			}
		}
	}

	// 6: contiene.
	if (!acc.lleno() && ck.length >= MINIMO_PARA_PARCIAL) {
		for (const clave of indice.canonicas) {
			if (acc.lleno()) break;
			if (clave.includes(ck)) acc.sumar(indice.porCanonica.get(clave), 'contiene');
		}

		for (const significado of indice.significados) {
			if (acc.lleno()) break;
			if (significado.includes(es)) {
				acc.sumar(indice.porSignificado.get(significado), 'contiene');
			}
		}
	}

	// 7: grafía histórica. Acá entra quien aprendió con material de los 80.
	if (!acc.lleno()) {
		acc.sumar(
			indice.porHistorica.get(historizar(bruta)),
			'aproximada',
			`coincide con la grafía histórica de "${bruta}"`
		);
	}

	// 8: fuzzy, el último recurso.
	if (!acc.lleno() && ck.length >= MINIMO_PARA_PARCIAL) {
		const max = ck.length <= 6 ? 1 : 2;

		for (const clave of indice.canonicas) {
			if (acc.lleno()) break;
			if (distancia(ck, clave, max) <= max) {
				acc.sumar(indice.porCanonica.get(clave), 'aproximada', `parecido a "${clave}"`);
			}
		}
	}

	return acc.resultados;
}

/**
 * Búsqueda exacta que SÍ devuelve las entradas retiradas.
 *
 * Es la que usa la ficha de palabra: quien busca una forma retirada tiene que
 * encontrar la explicación de por qué se retiró, no una pantalla vacía
 * (`03-MODELO-DE-DATOS` §5).
 */
export function buscarExacta(indice: IndiceBusqueda, consulta: string): Entrada[] {
	const ck = canonizar(consulta.trim());
	if (!ck) return [];

	const ids = new Set([
		...(indice.porCanonica.get(ck) ?? []),
		...(indice.porVariante.get(ck) ?? [])
	]);

	const entradas: Entrada[] = [];
	for (const id of ids) {
		const entrada = indice.porId.get(id);
		if (entrada) entradas.push(entrada);
	}

	return entradas;
}
