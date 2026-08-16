/**
 * Store del diccionario. ORQUESTA, no decide.
 *
 * Equivalencia con Bridge: `domain/` es el *fat model*, esto es el *use case
 * flaco*, la vista es el *controller flaco* (`01-ARQUITECTURA` §3).
 *
 * Acá NO hay normalización, ni ranking, ni reglas de qué se puede mostrar. Todo
 * eso vive en `domain/` y se testea sin renderizar nada. Este archivo sólo
 * conecta: pide datos al cargador, arma el índice con el dominio, guarda el
 * estado de la consulta y expone lecturas.
 *
 * Va en `.svelte.ts` porque usa runes. Es la única pieza fuera de los
 * componentes que toca algo de Svelte, y por eso está en `stores/` y no en
 * `domain/`.
 */

import {
	buscar,
	buscarExacta,
	construirIndice,
	type IndiceBusqueda,
	type ResultadoBusqueda
} from '$lib/domain/busqueda';
import {
	cargarCorpus,
	cargarManifest,
	hayVersionNueva,
	type OpcionesCarga
} from '$lib/datos/cargador';
import type { Corpus, Entrada, Fuente, Manifest } from '$lib/domain/tipos';

/**
 * Estado explícito, no `corpus | null`.
 *
 * En una app offline-first, "no pude bajar los datos" es un caso esperado y hay
 * que poder decirlo. Un buscador vacío sin explicación parece roto.
 */
export type EstadoCarga = 'inicial' | 'cargando' | 'listo' | 'error';

export interface Diccionario {
	readonly estado: EstadoCarga;
	readonly error: string | null;
	readonly consulta: string;
	readonly resultados: ResultadoBusqueda[];
	readonly total: number;
	readonly versionCargada: number | null;
	readonly hayActualizacion: boolean;

	cargar(opciones: OpcionesCarga): Promise<void>;
	revisarActualizacion(opciones: OpcionesCarga): Promise<void>;
	buscar(consulta: string): void;

	porId(id: string): Entrada | undefined;
	/** Búsqueda exacta que SÍ devuelve las retiradas, para la ficha de palabra. */
	fichaDe(forma: string): Entrada[];
	fuente(id: string): Fuente | undefined;
	fuentes(): Fuente[];
}

export function crearDiccionario(): Diccionario {
	let estado = $state<EstadoCarga>('inicial');
	let error = $state<string | null>(null);
	let consulta = $state('');
	let corpus = $state<Corpus | null>(null);
	let indice = $state<IndiceBusqueda | null>(null);
	let manifestNuevo = $state<Manifest | null>(null);

	// La búsqueda es derivada: no hay que acordarse de recalcularla al tipear.
	const resultados = $derived(indice && consulta.trim() ? buscar(indice, consulta) : []);
	const versionCargada = $derived(corpus?.version ?? null);
	const hayActualizacion = $derived(
		manifestNuevo !== null && hayVersionNueva(manifestNuevo, corpus?.version ?? null)
	);

	return {
		get estado() {
			return estado;
		},
		get error() {
			return error;
		},
		get consulta() {
			return consulta;
		},
		get resultados() {
			return resultados;
		},
		get total() {
			return corpus?.entradas.length ?? 0;
		},
		get versionCargada() {
			return versionCargada;
		},
		get hayActualizacion() {
			return hayActualizacion;
		},

		async cargar(opciones) {
			// Dos cargas simultáneas dejarían el estado indefinido.
			if (estado === 'cargando') return;

			estado = 'cargando';
			error = null;

			try {
				const cargado = await cargarCorpus(opciones);
				corpus = cargado;
				indice = construirIndice(cargado);
				estado = 'listo';
			} catch (causa) {
				error = causa instanceof Error ? causa.message : 'error desconocido';
				estado = 'error';
			}
		},

		/**
		 * Consulta el manifest y expone el flag. NUNCA recarga sola: recargar de
		 * prepo mientras alguien lee una ficha es hostil (`01-ARQUITECTURA` §7).
		 */
		async revisarActualizacion(opciones) {
			try {
				manifestNuevo = await cargarManifest(opciones);
			} catch {
				// Silencioso a propósito: no poder chequear si hay versión nueva no es
				// un problema del usuario y no tiene que ensuciar la pantalla.
			}
		},

		buscar(nueva) {
			consulta = nueva;
		},

		porId(id) {
			return indice?.porId.get(id);
		},

		fichaDe(forma) {
			return indice ? buscarExacta(indice, forma) : [];
		},

		fuente(id) {
			return corpus?.fuentes.find((f) => f.id === id);
		},

		fuentes() {
			return corpus?.fuentes ?? [];
		}
	};
}